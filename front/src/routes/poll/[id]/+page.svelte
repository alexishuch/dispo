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
  import { getErrorMessage } from '$lib/api/tools';
  import {
    setCustomErrorToastMessage,
    setGenericErrorToastMessage,
  } from '$lib/components/error-notification/errorToast.svelte';
  import Modal from '$lib/components/modal/Modal.svelte';
  import TimePicker from '$lib/components/time-picker/TimePicker.svelte';
  import UrlDisplayBox from '$lib/components/url-display-box/UrlDisplayBox.svelte';
  import {
    convertDateToZonedYYYYMMDD,
    formatDateToLocale,
    formatSlot,
  } from '$lib/date-tools';
  import type {
    IAvailability,
    ICreateAvailability,
    IParticipantEnriched,
  } from '$lib/model';
  import { isHttpError } from '@sveltejs/kit';
  import AirDatepicker from 'air-datepicker';
  import localeFr from 'air-datepicker/locale/fr';
  import { onMount, tick, untrack } from 'svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let datepicker: AirDatepicker<HTMLDivElement> | null;
  let timepickerWrapper: HTMLDivElement | null = $state(null);

  let selectedUserId = $state<string | null>(null);
  let participantPromise: Promise<IParticipantEnriched> | null = $state(null);
  let participant = $state<IParticipantEnriched | null>(null);
  let newParticipantName = $state<string>('');

  let isAddingSlot = $state(false);
  let isUpdatingParticipants = $state(false);
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
      participantPromise = null;
      return;
    }

    let cancelled = false;

    participantPromise = getParticipant(id)
      .then((p) => {
        if (!cancelled) {
          participant = p;
        }
        return p;
      })
      .catch((error) => {
        selectedUserId = null;
        setGenericErrorToastMessage(error);
        return Promise.reject(error);
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
      // Force re-rendering of calendar
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
    if (!participant) return;
    if (!selectedStartDateTime || !selectedEndDateTime || !selectedUserId)
      return;

    try {
      const newSlot: ICreateAvailability = {
        slot_start: selectedStartDateTime.toISOString(),
        slot_end: selectedEndDateTime.toISOString(),
      };
      const createdSlot = await createAvailability(participant.id, newSlot);
      participant.availabilities = [...participant.availabilities, createdSlot];
      commonSlots = await getCommonAvailabilities(data.poll.id);
      isAddingSlot = false;
      selectedStartDateTime = null;
      selectedEndDateTime = null;
    } catch (error) {
      if (isHttpError(error) && error.status === 409) {
        setCustomErrorToastMessage('Un créneau existe déjà sur cet horaire.');
      } else {
        setGenericErrorToastMessage(getErrorMessage(error));
      }
      console.error('❌ Failed to create slot', error);
    }
  }

  async function deleteSlot(slotId: string): Promise<void> {
    if (!participant) return;

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
      participant.availabilities.splice(existingSlotIndex, 0, slotSnapshot);
      setGenericErrorToastMessage(getErrorMessage(error));
      console.error('❌ Failed to delete slot', error);
    } finally {
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
        if (isHttpError(error) && error.status === 409) {
          setCustomErrorToastMessage('Ce participant existe déjà.');
        } else {
          setGenericErrorToastMessage(getErrorMessage(error));
        }
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

  async function onAddSlotClick() {
    const bottom = timepickerWrapper?.getBoundingClientRect().bottom ?? 0;
    const timepickerMargin = 200;
    isAddingSlot = true;
    await tick();

    if (bottom >= window.innerHeight - timepickerMargin) {
      timepickerWrapper?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  async function onCalendarDateClick(formattedDate: string) {
    selectedDate = formattedDate?.toString();
    isAddingSlot = false;
    selectedStartDateTime = null;
    selectedEndDateTime = null;
    await tick();

    const timePickerBottom =
      timepickerWrapper?.getBoundingClientRect().bottom ?? 0;

    if (timePickerBottom >= window.innerHeight) {
      timepickerWrapper?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }
</script>

<div id="poll-header">
  <div id="poll-info">
    <h2>{data.poll.name}</h2>
    {#if data.poll.start_date && new Date(data.poll.start_date) > new Date()}
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
  callback={handleParticipantDeletion}
  >Souhaitez-vous vraiment supprimer le participant et ses disponibilités ?</Modal
>

{#if selectedUserId}
  {#await participantPromise then participant}
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
          class="danger-btn"
          onclick={() => (isDeletingParticipant = true)}
        >
          Supprimer
        </button>
      </div>
    </div>

    <div id="calendar-wrapper">
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
              maxDate: poll.end_date || undefined,
              dateFormat: 'yyyy-MM-dd',
              onSelect: ({ formattedDate }) => {
                onCalendarDateClick(formattedDate as string);
              },
              onRenderCell({ date, cellType }) {
                const dateStr = date.toDateString();
                const hasDot = untrack(() => daysWithSlots.has(dateStr));

                if (cellType === 'day' && hasDot) {
                  return {
                    html:
                      date.getDate() + `<span class="slot-indicator"></span>`,
                    classes: 'has-slot',
                  };
                }
              },
            });
          }

          return () => {
            datepicker?.destroy();
            datepicker = null;
          };
        }}
      ></div>

      {#if !selectedDate}
        <p>Sélectionnez une date sur le calendrier</p>
      {/if}
    </div>

    <div id="timepicker-wrapper" bind:this={timepickerWrapper}>
      {#if selectedDate && participant?.availabilities}
        <div id="day-header">
          <h3>Mes dispos le {formatDateToLocale(selectedDate)}</h3>
          {#if !isAddingSlot}
            <button id="addSlotButton" onclick={onAddSlotClick}
              >+ Ajouter</button
            >
          {:else}
            <div class="buttons">
              <button
                id=""
                class="danger-btn"
                onclick={() => {
                  isAddingSlot = false;
                  selectedStartDateTime = null;
                  selectedEndDateTime = null;
                }}>✗</button
              >
              <button
                id="validateSlotButton"
                class="validate-btn"
                onclick={() => handleAddSlot()}>✓</button
              >
            </div>
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
    </div>

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
{:else}
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
{/if}

<style>
  #poll-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1em 0;
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

  #timepicker-wrapper {
    scroll-margin-bottom: 20px;
  }

  #datepicker {
    padding-top: 1rem;
    margin-bottom: 1rem;
  }

  #timepicker {
    margin-bottom: 1.5rem;
  }

  #day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;

    & button {
      max-width: 30%;
    }

    & .buttons {
      display: flex;
      max-width: 40%;
      gap: 0.5rem;

      & button {
        min-width: 3rem;
      }
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

  @media (min-width: 320px) {
    .poll-date {
      display: inline-block;
      &:nth-child(3) {
        margin-left: 10px;
      }
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
