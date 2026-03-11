<script>
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>{page.status}</title>
</svelte:head>

<div>
  {#if page.status === 404}
    <h1>Cette page n'existe pas.</h1>
  {:else}
    <h1>Une erreur est survenue.</h1>
  {/if}
</div>

<style>
  h1 {
    margin: 4em 0;
    text-align: center;
  }
</style>
