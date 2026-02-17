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

  $inspect(slots).with((type, value) => {
    console.log(
      'CHILD slots',
      type,
      value.map((s) => ({
        start: s.slot_start,
        end: s.slot_end,
      })),
    );
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

<button id="addSlotButton" onclick={() => addSlot()}>Add Slot</button>

<div id="slider" bind:this={sliderDiv}></div>

<!-- Optional: List in same component -->
{#each slots as slot}
  <div>{slot.slot_start} - {slot.slot_end}</div>
{/each}

<!-- <div
  id="slider"
  {@attach (div) => {
    createSlider(div, slots, date);
    console.log('Attaching slider to div:', div);
  }}
></div> -->

<style>
  button {
    margin: 20px 0;
  }

  #slider {
    margin: 18px 0;
  }
</style>
