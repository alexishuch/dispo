<script lang="ts">
  import { getLocale, setLocale } from '$lib/paraglide/runtime';
  import { onMount } from 'svelte';

  let open = false;
  let container: HTMLDivElement;

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ] as const;

  async function changeLanguage(locale: 'fr' | 'en' | 'de') {
    await setLocale(locale);
    open = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (container && !container.contains(event.target as Node)) {
      open = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });
</script>

<div class="lang-switcher" bind:this={container}>
  <button
    class="trigger"
    type="button"
    aria-haspopup="menu"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    {languages.find((l) => l.code === getLocale())?.flag}
    <span class="chevron">▾</span>
  </button>

  {#if open}
    <div class="menu" role="menu">
      {#each languages as lang}
        <button
          type="button"
          role="menuitem"
          class={{ active: getLocale() === lang.code }}
          onclick={() => changeLanguage(lang.code)}
        >
          <span>{lang.flag} {lang.label}</span>
          {#if getLocale() === lang.code}
            <span class="check">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .lang-switcher {
    position: relative;
    display: inline-block;
  }

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
    color: var(--text-primary);
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .trigger:hover {
    background: var(--surface);
    border-color: var(--text-secondary);
  }

  .trigger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--border);
  }

  .chevron {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .menu {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: clamp(0px, calc(50% - 5.5rem), 0px);
    min-width: 11rem;
    padding: 0.35rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
    box-shadow:
      0 10px 30px rgb(0 0 0 / 0.1),
      0 2px 8px rgb(0 0 0 / 0.06);
    z-index: 20;
  }

  .menu button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.65rem 0.75rem;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    color: var(--text-primary);
    text-align: left;
    cursor: pointer;
    font: inherit;
  }

  .menu button:hover {
    background: var(--surface);
    font-weight: 600;
  }

  .menu button.active {
    background: var(--primary-color);
    color: var(--background);
    font-weight: 600;
  }

  .check {
    font-size: 0.9rem;
    color: var(--background);
  }

  @media (max-width: 320px) {
    .menu {
      left: 50%;
      right: auto;
      translate: -50% 0;
    }
  }
</style>
