<script lang="ts">
  import {
    createAvailability,
    deleteAvailability,
    getCommonAvailabilities,
  } from '$lib/api/availabilities';
  import {
    createParticipant,
    deleteParticipant,
    getParticipant,
  } from '$lib/api/participants';
  import Modal from '$lib/components/modal/Modal.svelte';
  import UrlDisplayBox from '$lib/components/url-display-box/UrlDisplayBox.svelte';
  import TimePicker from '$lib/components/wheeltest/TimePicker.svelte';
  import {
    convertDateToZonedYYYYMMDD,
    formatDateToLocale,
    formatSlot,
  } from '$lib/dateUtils';
  import type {
    IAvailability,
    ICreateAvailability,
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

  let isUpdatingParticipants = $state(false);
  let isChangePending = $state(false);
  let isAddingSlot = $state(false);
  let isDeletingParticipant = $state(false);

  let selectedDate = $state<string>('');
  let slotsForDay = $derived.by(() => {
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
  let commonSlots = $derived(data.poll.commonSlots);
  let selectedStartDateTime = $state<Date | null>(null);
  let selectedEndDateTime = $state<Date | null>(null);

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

  async function handleAddSlot(): Promise<void> {
    if (!participant || isChangePending) return;
    if (!selectedStartDateTime || !selectedEndDateTime || !selectedUserId)
      return;

    isChangePending = true;

    try {
      const newSlot: ICreateAvailability = {
        slot_start: selectedStartDateTime.toISOString(),
        slot_end: selectedEndDateTime.toISOString(),
      };
      console.log(newSlot);
      const createdSlot = await createAvailability(participant.id, newSlot);
      participant.availabilities = [...participant.availabilities, createdSlot];
      commonSlots = await getCommonAvailabilities(data.poll.id);
    } catch (error) {
      console.error('❌ Failed to create slot', error);
    } finally {
      isChangePending = false;
      isAddingSlot = false;
      selectedStartDateTime = null;
      selectedEndDateTime = null;
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
      commonSlots = await getCommonAvailabilities(data.poll.id);
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
      isUpdatingParticipants = true;
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
        isUpdatingParticipants = false;
      }
    }
  }

  async function handleParticipantDeletion() {
    if (!selectedUserId) return;
    isUpdatingParticipants = true;

    const existingParticipantIndex = data.poll.participants.findIndex(
      (p) => p.id === selectedUserId,
    );
    if (existingParticipantIndex === -1) return;
    const participantSnapshot = $state.snapshot(
      data.poll.participants[existingParticipantIndex],
    );

    data.poll.participants.splice(existingParticipantIndex, 1);

    try {
      await deleteParticipant(selectedUserId);
      selectedUserId = null;
      selectedDate = '';
    } catch (error) {
      data.poll.participants.splice(
        existingParticipantIndex,
        0,
        participantSnapshot,
      );
      console.error('❌ Failed to delete participant:', error);
      throw error;
    } finally {
      isUpdatingParticipants = false;
    }
  }
</script>

<div id="poll-header">
  <div id="poll-info">
    <h2>{data.poll.name}</h2>
    {#if data.poll.start_date}
      <p class="poll-date">
        Début : {formatDateToLocale(data.poll.start_date)}
      </p>
    {/if}
    {#if data.poll.end_date}
      <p class="poll-date">
        Fin : {formatDateToLocale(data.poll.end_date)}
      </p>
    {/if}
  </div>
  <UrlDisplayBox pollId={data.poll.id} />
</div>

<Modal
  bind:showModal={isDeletingParticipant}
  emoji={'⚠️'}
  pollId={data.poll.id}
  callback={handleParticipantDeletion}
  >Souhaitez-vous vraiment supprimer le participant et ses disponibilités ?</Modal
>

{#if !selectedUserId}
  <div>
    {#if !data.poll.participants.length}
      <p>Saisissez votre nom :</p>
    {:else}
      <p>Sélectionnez votre nom :</p>
    {/if}

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
      <input
        bind:value={newParticipantName}
        disabled={isUpdatingParticipants}
        required
      />
      <button type="submit" disabled={isUpdatingParticipants}>
        {isUpdatingParticipants ? 'Création...' : 'Créer'}
      </button>
    </form>
  </div>
{:else}
  {#await participant then participant}
    <div id="participant-header">
      <p>
        Participant sélectionné :
        <span class="wrap">{participant?.name}</span>
      </p>
      <div class="buttons">
        <button
          onclick={() => {
            selectedUserId = null;
            selectedDate = '';
          }}
        >
          Changer
        </button>
        <button
          onclick={() => (isDeletingParticipant = true)}
          disabled={isUpdatingParticipants}
        >
          {isUpdatingParticipants ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>
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

              if (window.innerWidth < 768) {
                setTimeout(() => {
                  const top = div.getBoundingClientRect().top + window.scrollY;
                  window.scrollTo({ top, behavior: 'smooth' });
                }, 200); // browser focus-scroll typically finishes within 100–300ms
              }
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
      <div id="day-header">
        <h3>Mes dispos le {formatDateToLocale(selectedDate)}</h3>
        {#if !isAddingSlot}
          <button
            id="addSlotButton"
            onclick={() => {
              isAddingSlot = true;
            }}>+ Ajouter</button
          >
        {:else}
          <button id="validateSlotButton" onclick={() => handleAddSlot()}
            >Valider</button
          >
        {/if}
      </div>

      {#if isAddingSlot}
        <div id="timepicker">
          <TimePicker
            {selectedDate}
            bind:selectedStartDateTime
            bind:selectedEndDateTime
          ></TimePicker>
        </div>
      {/if}
    {/if}

    {#if slotsForDay.length}
      <ul>
        {#each slotsForDay as slot}
          <li class="slot-cell">
            {formatSlot(slot.slot_start, slot.slot_end, false)}
            <button
              onclick={() => deleteSlot(slot.id)}
              class="slot-delete-button"
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
            {slot.count} participants :
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
    margin: 1em 0;
  }

  @media (min-width: 320px) {
    .poll-date {
      display: inline-block;
      &:last-child {
        margin-left: 10px;
      }
    }
  }

  #poll-info {
    text-align: left;
  }

  #participant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    margin: 0.6rem 0 0.5rem 0;

    & p {
      margin-bottom: 0;
    }

    .buttons {
      display: flex;
      gap: 15px;
    }
  }

  #datepicker,
  #timepicker {
    padding-top: 1rem;
    margin-bottom: 1rem;
  }

  #day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;

    & button {
      max-width: 30%;
    }
  }

  /* Participant info section */
  p {
    text-align: center;
  }

  @media (max-width: 550px) {
    .wrap {
      display: inline-block;
    }
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
      width: 3.5rem;

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

    & button {
      min-width: 20%;
    }
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

  @media (max-width: 650px) {
    button {
      padding: 10px;
    }

    #poll-header,
    #participant-header {
      flex-direction: column;
      gap: 0px;
      margin-top: 0;
    }

    #participant-header {
      & p {
        margin-bottom: 1rem;
      }

      & .buttons {
        width: 90%;
      }

      & button {
        width: 100%;
      }
    }

    form {
      flex-direction: column;

      & input {
        margin-bottom: 1rem;
      }
    }

    #poll-info {
      text-align: center;
    }
  }
</style>
