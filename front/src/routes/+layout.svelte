<script lang="ts">
  import favicon from '$lib/assets/favicon.ico';
  import ErrorNotification from '$lib/components/error-notification/ErrorNotification.svelte';
  import { onMount } from 'svelte';
  import '../app.css';

  let { children } = $props();

  onMount(() => {
    const onTouchMove = (e) => {
      if (e.scale !== 1) e.preventDefault();
    };
    const onTouchStart = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchstart', onTouchStart);
    };
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Dispo?</title>
</svelte:head>

<header>
  <a href="/"><h1>🗓 Dispo?</h1></a>
</header>

{@render children()}

<ErrorNotification />
