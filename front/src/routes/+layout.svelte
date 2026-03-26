<script lang="ts">
  import { page } from '$app/state';
  import appleTouchIcon from '$lib/assets/apple-touch-icon.png';
  import favicon from '$lib/assets/favicon.ico';
  import ErrorNotification from '$lib/components/error-notification/ErrorNotification.svelte';
  import Dropdown from '$lib/components/locale-dropdown/LocaleDropdown.svelte';
  import { locales, localizeHref } from '$lib/paraglide/runtime';
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
  <link rel="apple-touch-icon" href={appleTouchIcon} />
  <title>Dispo?</title>
</svelte:head>

<header>
  <a href="/"><h1>🗓 Dispo?</h1></a>

  <Dropdown></Dropdown>
</header>
{@render children()}
<ErrorNotification />

<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
  {/each}
</div>

<style>
  header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  a {
    text-decoration: none;
  }

  @media (min-width: 375px) {
    header {
      flex-direction: row;
    }
  }
</style>
