<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    showModal = $bindable(),
    emoji,
    pollId,
    callback,
    children,
  }: {
    showModal: boolean;
    emoji: string;
    pollId: string;
    callback: () => Promise<void>;
    children: Snippet;
  } = $props();

  let dialog = $state() as HTMLDialogElement | undefined;
  let displayErrorMessage = $state(false);
  let errorMailLink = $derived(
    `mailto:alexishuch@ikmail.com?subject=Erreur sur sondage ${pollId}`,
  );

  $effect(() => {
    if (showModal) {
      dialog?.showModal();
    }
  });

  $effect(() => {
    if (!showModal) {
      dialog?.close();
    }
  });

  async function handleConfirm(): Promise<void> {
    try {
      await callback();
      showModal = false;
    } catch {
      displayErrorMessage = true;
    }
  }
</script>

<dialog bind:this={dialog} onclose={() => (showModal = false)}>
  <h3>{emoji}</h3>
  <hr />
  {@render children()}
  {#if displayErrorMessage}
    <p class="error-message">
      Impossible de supprimer le participant.<br />Merci de réessayer plus tard
      ou d'envoyer un
      <a href={errorMailLink}>mail</a>.
    </p>
  {/if}
  <div class="buttons">
    <button onclick={() => dialog?.close()}>Annuler</button>
    <button
      onclick={() => {
        handleConfirm();
      }}>Valider</button
    >
  </div>
</dialog>

<style>
  dialog {
    width: 80%;
    max-width: 400px;
    border-radius: 0.5em;
    border: none;
    padding: 1rem 2rem;
    text-align: center;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  hr {
    margin: 1.5rem 0;
  }

  .error-message {
    padding-top: 1rem;
    color: red;

    & a {
      color: red;
      text-decoration: underline;
    }
  }

  .buttons {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
</style>
