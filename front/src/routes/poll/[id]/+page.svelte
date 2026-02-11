<script lang="ts">
  import { createParticipant, getParticipant } from '$lib/api/participants';
  import UrlDisplayBox from '$lib/components/url-display-box/+page.svelte';
  import { formatDateSlot } from '$lib/dateUtils';
  import AirDatepicker from 'air-datepicker';
  import localeFr from 'air-datepicker/locale/fr';
  import type { PageProps } from '../$types';
  import('air-datepicker/air-datepicker.css');

  let { data }: PageProps = $props();
  let isCreating = $state(false);
  let selectedUserId = $state<string | null>(null);
  let participant = $derived.by(async () => {
    if (selectedUserId) {
      const participant = getParticipant(selectedUserId);
      return participant;
    }
    return null;
  });

  let newParticipantName = $state<string>('');
  let selectedDate = $state<string>('');

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

<div id="datepicker2"></div>

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
            dateFormat: 'd/M/yyyy',
            onSelect: ({ date }) => {
              selectedDate = date?.toLocaleString() || '';
            },
          });
        });
      }}
    ></div>

    {#if selectedDate}
      <p>Selected: {selectedDate}</p>
    {/if}

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

    <h2>Mes créneaux</h2>
    <ul>
      {#each participant?.availabilities as slot}
        <li>
          {formatDateSlot(slot.slot_start)} - {formatDateSlot(slot.slot_end)}
        </li>
      {/each}
    </ul>
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
</style>
