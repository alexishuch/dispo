<script lang="ts">
  import { onMount } from 'svelte';
  import { createSlider } from './createSlider.ts';

  let {
    slots = $bindable([]),
    date,
    addSlot,
    onSlotUpdate,
    disabled,
  } = $props();
  let sliderDiv: HTMLDivElement;
  let lastDate = $state<string>('');
  let lastSlotCount = $state<number>(0);

  $effect(() => {
    const isSliderVisible = disabled;
    const slider = (sliderDiv as any)?.noUiSlider;

    if (!slider) {
      return;
    }

    if (isSliderVisible) {
      slider.disable();
    } else {
      slider.enable();
    }
  });

  $effect(() => {
    if (!sliderDiv) return;

    const dateChanged = !lastDate || date !== lastDate;
    const slotCountChanged = slots.length !== lastSlotCount;

    if (!dateChanged && !slotCountChanged) return;

    console.log(
      'Creating slider with slots:',
      slots.map((s) => ({ start: s.slot_start, end: s.slot_end })),
    );

    createSlider(sliderDiv, slots, date, handleSliderUpdate);

    lastDate = date;
    lastSlotCount = slots.length;
  });

  function handleSliderUpdate(handle: number, handlesValues: number[]): void {
    const slotIndex = Math.floor(handle / 2);
    const slot = slots[slotIndex];
    if (!slot) return;
    const newStart = new Date(handlesValues[slotIndex * 2]).toISOString();
    const newEnd = new Date(handlesValues[slotIndex * 2 + 1]).toISOString();
    onSlotUpdate({ ...slot, slot_start: newStart, slot_end: newEnd });
  }

  onMount(() => {
    import('nouislider/dist/nouislider.css');
  });
</script>

<button id="addSlotButton" onclick={() => addSlot()}>Ajouter un créneau</button>

<div id="slider" bind:this={sliderDiv}></div>

<style>
  button {
    margin: 20px 0;
  }

  #slider {
    margin: 40px 0 0px 0;
  }

  :global(div .noUi-horizontal .noUi-handle) {
    border-radius: 50%;
    width: 17px;
    height: 17px;
    top: -1px;
    right: -7px;
  }

  :global(.noUi-connect) {
    background: var(--primary-color) !important;
  }
</style>
