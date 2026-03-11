<script lang="ts">
  import { enhance } from '$app/forms';
  import { setGenericErrorToastMessage } from '$lib/components/error-notification/errorToast.svelte';

  let { form } = $props();
  let today = new Date().toLocaleDateString('en-CA');
  let submitting = $state(false);
</script>

<form
  method="post"
  action="?/create"
  use:enhance={() => {
    submitting = true;

    return async ({ result, update }) => {
      if (result.type === 'failure') {
        setGenericErrorToastMessage(
          result.data?.error ?? 'Impossible de créer le sondage.',
        );
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
  <input id="start_date" name="start_date" type="date" />

  <label for="end_date">Date de fin <span>(optionnel)</span></label>
  <input id="end_date" name="end_date" type="date" />

  <button type="submit" class="fixed-btn" disabled={submitting}>
    {submitting ? 'Création...' : 'Créer le sondage'}
  </button>
</form>

<style>
  form {
    padding-top: 1rem;
  }

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
