<script>
  import { page } from '$app/state';
  import { m } from '$lib/paraglide/messages.js';
</script>

<svelte:head>
  <title>{page.status}</title>
</svelte:head>

<div>
  {#if page.status === 404 && page.route.id?.startsWith('/poll')}
    <h1>{m.poll_does_not_exist()}</h1>
  {:else if page.status === 404}
    <h1>{m.page_does_not_exist()}</h1>
  {:else}
    <h1>{m.error_occurred()}</h1>
  {/if}
</div>

<style>
  h1 {
    margin: 4em 0;
    text-align: center;
  }
</style>
