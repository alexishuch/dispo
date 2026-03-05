<script lang="ts">
  import {
    clearErrorToast,
    getErrorToastMessage,
  } from '$lib/components/error-notification/errorToast.svelte';

  $effect(() => {
    const msg = getErrorToastMessage();
    if (!msg) return;

    const id = setTimeout(() => clearErrorToast(), 4000);
    return () => clearTimeout(id);
  });
</script>

{#if getErrorToastMessage()}
  <section>
    Une erreur est survenue. Merci de réessayer.<br />
    <code>
      {getErrorToastMessage()}
    </code>
  </section>
{/if}

<style>
  section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 93%;
    max-width: 760px;
    margin: 0 auto;
    padding: 1rem;
    border-radius: 10px 10px 0 0;
    background: rgba(255, 0, 0, 0.65);
    color: white;
  }
</style>
