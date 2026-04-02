<script lang="ts">
  import { page } from '$app/state';
  import ErrorNotification from '$lib/components/error-notification/ErrorNotification.svelte';
  import Dropdown from '$lib/components/locale-dropdown/LocaleDropdown.svelte';
  import { m } from '$lib/paraglide/messages.js';
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
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="Dispo?" />
  <link rel="manifest" href="/site.webmanifest" />

  <title>Dispo?</title>
  <meta name="title" content="Dispo?" />
  <meta
    name="description"
    content="L'app de sondage ultra simple pour savoir quand se capter !"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://dispo.la/" />
  <meta property="og:title" content="Dispo?" />
  <meta
    property="og:description"
    content="L'app de sondage ultra simple pour savoir quand se capter !"
  />
  <meta property="og:image" content="https://dispo.la/cover.png" />

  <!-- X (Twitter) -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://dispo.la/" />
  <meta property="twitter:title" content="Dispo?" />
  <meta
    property="twitter:description"
    content="L'app de sondage ultra simple pour savoir quand se capter !"
  />
  <meta property="twitter:image" content="https://dispo.la/cover.png" />
</svelte:head>

<header>
  <div>
    <a href="/">
      <h1>
        <img src="/favicon.svg" alt="" aria-hidden="true" />
        Dispo?
      </h1>
    </a>
    {#if page.url.pathname === '/'}
      <p id="tagline">{m.tagline()}</p>
    {/if}
  </div>

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

  h1 {
    text-align: center;
  }

  h1 img {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
  }

  a {
    text-decoration: none;
  }

  #tagline {
    text-align: center;
  }

  div {
    margin-bottom: 1rem;
  }

  @media (min-width: 320px) {
    header {
      flex-direction: row;
    }
    h1 {
      text-align: left;
    }
    #tagline {
      text-align: left;
    }
    div {
      margin-bottom: 0;
    }
  }
</style>
