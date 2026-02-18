<script lang="ts">
  import {
    createAvailability,
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
  import type { IAvailability, IParticipantEnriched } from '$lib/model';
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
    // Filtering availabilities zoned in below $effect
    const filtered = filterSlotsByDay(
      participant?.availabilities || [],
      selectedDate,
    );
    return filtered;
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
      console.error('❌ Failed to create slot:', error);
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
      Object.assign(existingSlot, slotSnapshot);
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

<div
  class="poll-header"
  style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center"
>
  <h1>Sondage {data.poll.name}</h1>
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
    <div
      style="display: flex; gap: 16px; justify-content: space-between; align-items: center"
    >
      <p>
        Participant sélectionné : {participant?.name}
      </p>
      <button
        onclick={() => {
          selectedUserId = null;
        }}
      >
        Changer de participant
      </button>
    </div>
    {#if data.poll.start_date}
      <p>Début : {data.poll.start_date}</p>
    {/if}
    {#if data.poll.end_date}
      <p>Fin : {data.poll.end_date}</p>
    {/if}

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
      <h2>Mes dispos le {formatDateToLocale(selectedDate)}</h2>
      <ul>
        {#each slotsForDay as slot}
          <li>
            {formatSlot(slot.slot_start, slot.slot_end, false)}
          </li>
        {/each}
      </ul>
    {/if}

    {#if !selectedDate}
      <p>Sélectionnez une date sur le calendrier</p>
    {/if}

    {#if data.poll.commonSlots.length > 1}
      <h2>Créneaux communs</h2>
      <ul>
        {#each data.poll.commonSlots as slot}
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

  form {
    flex-direction: row;
  }

  :global(.air-datepicker.-inline-) {
    margin: auto;
    width: auto;
  }

  :global(.air-datepicker-cell.-day-) {
    position: relative;
  }

  :global(.slot-indicator) {
    position: absolute;
    bottom: 2px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #cccccc;
  }
</style>
