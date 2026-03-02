<script lang="ts">
  import { API_BASE_URL } from '$lib/api/baseUrl';

  let { pollId } = $props();
  let url = $derived(API_BASE_URL + '/poll/' + pollId);
  let showCopied = $state(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(url);
      showCopied = true;
      setTimeout(() => (showCopied = false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
</script>

<div class="url-container">
  <input type="text" value={url} readonly class="url-input" />
  <button onclick={copyToClipboard} class="copy-button" title="Copy URL">
    {#if showCopied}
      ✓
    {:else}
      📋
    {/if}
  </button>
</div>

<style>
  .url-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: 50%;
  }

  .url-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f5f5f5;
    font-family: monospace;
    font-size: 0.9rem;
    text-align: left;
    direction: rtl;
  }

  .copy-button {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    max-width: 4rem;
  }

  .copy-button:hover {
    background-color: #f0f0f0;
  }

  .copy-button:active {
    background-color: #e0e0e0;
  }

  @media (max-width: 650px) {
    .url-container {
      width: 90%;
      margin-top: 1rem;
    }
  }
</style>
