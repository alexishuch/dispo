<script lang="ts">
  import { createParticipant, getParticipant } from '$lib/api/participants';
  import Slider from '$lib/components/slider/Slider.svelte';
  import UrlDisplayBox from '$lib/components/url-display-box/+page.svelte';
  import { formatDateSlot } from '$lib/dateUtils';
  import type { IAvailability, IParticipantEnriched } from '$lib/model';
  import AirDatepicker from 'air-datepicker';
  import localeFr from 'air-datepicker/locale/fr';
  import { onMount } from 'svelte';
  import type { PageProps } from '../$types';
  import { insertSlot as suggestNewSlot } from '../../../lib/components/slider/addSlot';

  let { data }: PageProps = $props();
  let isCreating = $state(false);
  let selectedUserId = $state<string | null>(null);
  let participant = $state<IParticipantEnriched | null>(null);
  let newParticipantName = $state<string>('');
  let selectedDate = $state<string>('');
  let daySlots = $derived.by(() => {
    const filtered = filterSlotsByDay(
      participant?.availabilities || [],
      selectedDate,
    );
    console.log('PARENT: filtered slots:', filtered.length);
    return filtered;
  });

  function handleAddSlot(dayIso: string): void {
    const slotSuggestion = suggestNewSlot(daySlots, dayIso);
    daySlots = slotSuggestion.slots;
  }

  $effect(() => {
    const id = selectedUserId;
    if (!id) {
      participant = null;
      return;
    }

    // prevent older requests from overwriting newer selection
    let cancelled = false;

    (async () => {
      const p = await getParticipant(id);
      if (!cancelled) participant = p;
    })();

    return () => {
      cancelled = true;
    };
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
    return allSlots.filter(
      (slot) => slot.slot_start.substring(0, 10) === selectedDayIsoString,
    );
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
        $effect(() => {
          const datepicker = new AirDatepicker(div, {
            inline: true,
            locale: localeFr,
            dateFormat: 'yyyy-MM-dd',
            onSelect: ({ formattedDate }) => {
              selectedDate = formattedDate?.toString();
            },
          });
        });
      }}
    ></div>

    {#if selectedDate && participant?.availabilities}
      <Slider
        bind:slots={daySlots}
        date={selectedDate}
        addSlot={() => handleAddSlot(selectedDate)}
      />
    {/if}

    <h2>Mes créneaux</h2>
    <ul>
      {#each daySlots as slot}
        <li>
          {formatDateSlot(slot.slot_start)} - {formatDateSlot(slot.slot_end)}
        </li>
      {/each}
    </ul>

    {#if data.poll.commonSlots.length > 1}
      <h2>Créneaux communs</h2>
      <ul>
        {#each data.poll.commonSlots as slot}
          <li>
            {formatDateSlot(slot.start_date)} - {formatDateSlot(slot.end_date)}
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
  /* Participant tags */
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
</style>
