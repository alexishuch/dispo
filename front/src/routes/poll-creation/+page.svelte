<script lang="ts">
  import { page } from '$app/state';

  let form = page.form;
  let today = new Date().toLocaleDateString('en-CA');
</script>

<form method="post" action="/poll-creation?/create">
  <label for="name">Nom du sondage :</label>
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

  <label for="start_date">Date de début :</label>
  <input
    id="start_date"
    name="start_date"
    type="date"
    value={today}
    class:error={form?.missing?.start_date}
    required
  />
  {#if form?.missing?.start_date}
    <p class="error-message">La date de début est requise</p>
  {/if}

  <label for="end_date">Date de fin :</label>
  <input
    id="end_date"
    name="end_date"
    type="date"
    required
    class:error={form?.missing?.end_date}
  />
  {#if form?.missing?.end_date}
    <p class="error-message">La date de fin est requise</p>
  {/if}

  <button type="submit">Créer le sondage</button>
</form>

<style>
  form {
    padding-top: 1rem;
  }

  input  {
    margin-bottom: 0.25rem;
  }

  input.error {
    border: 2px solid red;
    outline-color: red;
  }

  .error-message {
    color: red;
    font-size: 0.85rem;
  }

  button[type='submit'] {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 90%;
    max-width: 760px;
    margin: 1rem auto;
    padding: 1rem;
  }
</style>
