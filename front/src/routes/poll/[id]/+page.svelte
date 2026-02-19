<script lang="ts">
  import {
    createAvailability,
    deleteAvailability,
    updateAvailabilities,
  } from '$lib/api/availabilities';
  import { createParticipant, getParticipant } from '$lib/api/participants';
  import { suggestNewSlot } from '$lib/components/slider/addSlot';
  import Slider from '$lib/components/slider/Slider.svelte';
  import UrlDisplayBox from '$lib/components/url-display-box/+page.svelte';
  import {
    convertDateToZonedYYYYMMDD,
    formatDateToLocale,
    formatSlot,
  } from '$lib/dateUtils';
  import type {
    IAvailability,
    ICommonSlot,
    IParticipantEnriched,
  } from '$lib/model';
  import AirDatepicker from 'air-datepicker';
  import localeFr from 'air-datepicker/locale/fr';
  import { onMount, untrack } from 'svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let datepicker: AirDatepicker<HTMLDivElement> | null;

  let selectedUserId = $state<string | null>(null);
  let participant = $state<IParticipantEnriched | null>(null);
  let newParticipantName = $state<string>('');

  let isCreating = $state(false);
  let isChangePending = $state(false);

  let selectedDate = $state<string>('');
  let slotsForDay = $derived.by(() => {
    console.log('slotsForDay');
    return filterSlotsByDay(participant?.availabilities || [], selectedDate);
  });
  let daysWithSlots = $derived.by(() => {
    if (!participant?.availabilities) {
      return new Set();
    }
    const dates = participant.availabilities.map((slot) =>
      new Date(slot.slot_start).toDateString(),
    );
    return new Set(dates);
  });
  let commonSlots = $state<ICommonSlot[]>(data.poll.commonSlots);

  $effect(() => {
    const id = selectedUserId;
    if (!id) {
      participant = null;
      return;
    }

    let cancelled = false;

    getParticipant(id).then((p) => {
      if (!cancelled) {
        participant = p;
      }
    });

    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    console.log(
      'Yo',
      $state.snapshot(participant?.availabilities)?.map((s) => s.slot_start),
    );
    if (participant?.availabilities) {
      participant.availabilities.forEach((slot) => {
        if (!slot.zonedDate) {
          // Lazy: compute only if missing
          slot.zonedDate = convertDateToZonedYYYYMMDD(slot.slot_start);
        }
      });
    }
  });

  $effect(() => {
    daysWithSlots;

    if (datepicker?.viewDate) {
      // Force re-render
      datepicker.next();
      datepicker.prev();
    }
  });

  onMount(() => {
    import('air-datepicker/air-datepicker.css');
  });

  function filterSlotsByDay(
    allSlots: IAvailability[],
    selectedDayIsoString: string,
  ): IAvailability[] {
    if (!allSlots || !selectedDayIsoString) {
      return [];
    }
    return allSlots
      .filter((slot) => {
        return slot.zonedDate === selectedDayIsoString;
      })
      .sort((a, b) => Date.parse(a.slot_start) - Date.parse(b.slot_start));
  }

  async function handleAddSlot(dayIso: string): Promise<void> {
    if (!participant || isChangePending) return;

    isChangePending = true;

    try {
      const slotSuggestion = suggestNewSlot(slotsForDay, dayIso);
      if (!slotSuggestion) return;
      const createdSlot = await createAvailability(
        participant.id,
        slotSuggestion,
      );
      participant.availabilities = [...participant.availabilities, createdSlot];
    } catch (error) {
      console.error('❌ Failed to create slot', error);
    } finally {
      isChangePending = false;
    }
  }

  async function handleSlotUpdate(
    slotWithUpdatedValues: IAvailability,
  ): Promise<void> {
    if (!participant) return;
    isChangePending = true;

    const existingSlot = participant.availabilities.find(
      (s) => s.id === slotWithUpdatedValues.id,
    );
    if (!existingSlot) return;
    const slotSnapshot = $state.snapshot(existingSlot);

    try {
      if (existingSlot) {
        existingSlot.slot_start = slotWithUpdatedValues.slot_start;
        existingSlot.slot_end = slotWithUpdatedValues.slot_end;
        await updateAvailabilities(slotWithUpdatedValues);
      }
    } catch (error) {
      console.log('❌ Failed to update slot', error);
      Object.assign(existingSlot, slotSnapshot);
    } finally {
      setTimeout(() => {
        isChangePending = false;
        console.log('Done !');
      }, 1000);
    }
  }

  async function deleteSlot(slotId: string): Promise<void> {
    if (!participant) return;
    isChangePending = true;

    const existingSlotIndex = participant.availabilities.findIndex(
      (s) => s.id === slotId,
    );
    if (existingSlotIndex === -1) return;
    const slotSnapshot = $state.snapshot(
      participant.availabilities[existingSlotIndex],
    );

    participant.availabilities.splice(existingSlotIndex, 1);

    try {
      await deleteAvailability(slotId);
    } catch (error) {
      console.error('❌ Failed to delete slot', error);
      participant.availabilities.splice(existingSlotIndex, 0, slotSnapshot);
    } finally {
      setTimeout(() => {
        isChangePending = false;
        console.log('Done !');
      }, 1000);
    }
  }

  async function handleCreateParticipant() {
    if (newParticipantName) {
      isCreating = true;
      try {
        const newParticipant = await createParticipant(
          data.poll.id,
          newParticipantName,
        );
        data.poll.participants = [...data.poll.participants, newParticipant];
        selectedUserId = newParticipant.id;
        newParticipantName = '';
      } catch (error) {
        console.error('❌ Failed to create participant:', error);
      } finally {
        isCreating = false;
      }
    }
  }
</script>

<div id="poll-header">
  <div id="poll-info">
  <h2>{data.poll.name}</h2>
    {#if data.poll.start_date}
      <p style="display: inline;">
        Début : {formatDateToLocale(data.poll.start_date)}
      </p>
    {/if}
    {#if data.poll.end_date}
      <p style="margin-left: 10px; display: inline;">
        Fin : {formatDateToLocale(data.poll.end_date)}
      </p>
    {/if}
  </div>
  <UrlDisplayBox pollId={data.poll.id} />
</div>

{#if !selectedUserId}
  <div>
    <p>Sélectionnez votre nom :</p>

    {#each data.poll.participants as participant}
      <label>
        <input
          type="radio"
          bind:group={selectedUserId}
          value={participant.id}
        />
        {participant.name}
      </label>
    {/each}

    <form onsubmit={handleCreateParticipant}>
      <input bind:value={newParticipantName} disabled={isCreating} required />
      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Création...' : 'Créer'}
      </button>
    </form>
  </div>
{:else}
  {#await participant then participant}
    <div id="participant-header">
      <p>
        Participant sélectionné : {participant?.name}
      </p>
      <button
        onclick={() => {
          selectedUserId = null;
          selectedDate = '';
        }}
      >
        Changer de participant
      </button>
    </div>

    <div
      id="datepicker"
      {@attach (div) => {
        if (!datepicker) {
          const poll = data.poll;
          let minDate = new Date();
          if (
            poll.start_date &&
            Date.parse(poll.start_date) > new Date().getTime()
          ) {
            minDate = new Date(poll.start_date);
          }

          datepicker = new AirDatepicker(div, {
            inline: true,
            locale: localeFr,
            minDate,
            maxDate: poll.end_date,
            dateFormat: 'yyyy-MM-dd',
            onSelect: ({ formattedDate }) => {
              selectedDate = formattedDate?.toString();
            },
            onRenderCell({ date, cellType }) {
              const dateStr = date.toDateString();
              const hasDot = untrack(() => daysWithSlots.has(dateStr));

              if (cellType === 'day' && hasDot) {
                return {
                  html: date.getDate() + `<span class="slot-indicator"></span>`,
                  classes: 'has-slot',
                };
              }
            },
          });
          console.log('Datepicker created:', datepicker);
        }

        return () => {
          datepicker?.destroy();
          datepicker = null;
        };
      }}
    ></div>

    {#if selectedDate && participant?.availabilities}
      <Slider
        slots={slotsForDay}
        date={selectedDate}
        addSlot={() => handleAddSlot(selectedDate)}
        onSlotUpdate={(slot: IAvailability) => handleSlotUpdate(slot)}
        disabled={isChangePending}
      />
    {/if}

    {#if slotsForDay.length}
      <h3>Mes dispos le {formatDateToLocale(selectedDate)}</h3>
      <ul>
        {#each slotsForDay as slot}
          <li class="slot-cell">
            {formatSlot(slot.slot_start, slot.slot_end, false)}
            <button
              onclick={() => deleteSlot(slot.id)}
              class="delete-button"
              title="Supprimer ce créneau"
            >
              🗑️
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    {#if !selectedDate}
      <p>Sélectionnez une date sur le calendrier</p>
    {/if}

    {#if commonSlots.length > 0}
    <h3>Créneaux communs</h3>
    <ul>
        {#each commonSlots as slot}
        <li>
          {formatSlot(slot.start_date, slot.end_date)}
          <br />
          {slot.count} participants:
          <div class="participants-tags">
            {#each slot.participants_names as p}
              <span class="tag">{p}</span>
            {/each}
          </div>
        </li>
      {/each}
    </ul>
    {/if}
  {/await}
{/if}

<style>
  #poll-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1em;
  }

  #poll-info {
    text-align: left;
  }

  #participant-header {
    display: flex;
    gap: 16px;
    justify-content: space-between;
    align-items: center;
    margin: 0.6rem 0 1rem 0;
  }

  .participants-tags {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .tag {
    display: inline-block;
    padding: 4px 12px;
    background: var(--primary-color);
    color: white;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
  }

  .slot-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & button {
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: white;
      cursor: pointer;
      font-size: 1.2rem;

      &:hover {
        background-color: #f0f0f0;
      }

      &:active {
        background-color: #e0e0e0;
      }
    }
  }

  form {
    flex-direction: row;
  }

  :global {
    .air-datepicker.-inline- {
      margin: auto;
      width: auto;
    }

    .air-datepicker-cell.-day- {
      position: relative;
    }

    .air-datepicker-cell.-selected- {
      background: var(--primary-color) !important;
    }

    .air-datepicker-cell.-current-:not(.-selected-) {
      color: var(--primary-color) !important;
    }

    .slot-indicator {
      position: absolute;
      bottom: 2px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #cccccc;
    }
  }

  @media (max-width: 500px) {
    #poll-header,
    #participant-header {
      flex-direction: column;
      gap: 0px;
    }

    #participant-header {
      margin: 0.5rem 0 2rem 0;
    }

    #poll-info {
      text-align: center;
    }
  }
</style>
