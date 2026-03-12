<script lang="ts">
  import { enhance } from '$app/forms';
  import { setToastMessage } from '$lib/components/error-notification/errorToast.svelte';

  let { form } = $props();
  let today = new Date().toLocaleDateString('en-CA');
  let startDate = $state('');
  let submitting = $state(false);
</script>

<p>Le sondage ultra simple</p>

<h3>Comment ça marche ? 🤔</h3>
<ol>
  <li>Crée un sondage</li>
  <li>Renseigne un ou plusieurs participants</li>
  <li>Renseigne des dates (pour toi ou plusieurs personnes)</li>
  <li>Les meilleurs créneaux s'affichent automatiquement ✨</li>
  <li>Garde précieusement le lien du sondage et partage le aux autres !</li>
</ol>

<form
  method="post"
  action="?/create"
  use:enhance={() => {
    submitting = true;

    return async ({ result, update }) => {
      if (result.type === 'failure') {
        console.error('❌ Failed to create poll', result);
        setToastMessage('Impossible de créer le sondage.', 'error');
      }
      await update();
      submitting = false;
    };
  }}
>
  <label for="name">Nom du sondage</label>
  <input
    id="name"
    name="name"
    type="text"
    required
    class:error={form?.missing?.name}
  />
  {#if form?.missing?.name}
    <p class="error-message">Le nom est requis</p>
  {/if}

  <label for="start_date">Date de début <span>(optionnel)</span></label>
  <input
    id="start_date"
    name="start_date"
    type="date"
    min={today}
    bind:value={startDate}
  />

  <label for="end_date">Date de fin <span>(optionnel)</span></label>
  <input id="end_date" name="end_date" type="date" min={startDate || today} />

  <button type="submit" class="large-btn" disabled={submitting}>
    {submitting ? 'Création...' : 'Créer un sondage'}
  </button>
</form>

<style>
  input {
    margin-bottom: 0.25rem;
  }

  label span {
    font-weight: 300;
    font-size: 0.8rem;
  }

  input.error {
    border: 2px solid red;
    outline-color: red;
  }

  .error-message {
    color: red;
    font-size: 0.85rem;
  }
</style>
