<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Dispo?</title>
</svelte:head>

<header>
  <a href="/"><h1>Dispo? 📆</h1></a>
</header>

{@render children()}
