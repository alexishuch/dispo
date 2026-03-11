<script lang="ts">
  import {
    clearErrorToast,
    toast,
  } from '$lib/components/error-notification/errorToast.svelte';
  import { fly } from 'svelte/transition';

  $effect(() => {
    if (!toast.message) return;

    const id = setTimeout(clearErrorToast, 4000);
    return () => clearTimeout(id);
  });
</script>

{#if toast.message}
  <section
    transition:fly={{ y: 200, duration: 500 }}
    class:error={toast.level === 'error'}
    class:success={toast.level === 'success'}
  >
    {@html toast.message}
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
    background: var(--level, rgba(255, 0, 0, 0.65));
    color: white;
  }

  section.success {
    background: rgba(0, 180, 0, 0.65);
  }
</style>
