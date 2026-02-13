<script lang="ts">
  import { onMount } from 'svelte';
  import { createSlider } from './pollzzz.ts';

  //  1. I get an array of availabilities from props.
  // 2. They should be filtered with filterSlotsByDay.
  // 3. An attachment should be made on a div #slider, when the availabilities are available and filtered.
  // 4. In this attachment, I call a createSlider function with filteredAvailabilities.
  // 5. This function should do that, on change of any handle, the corresponding slot is edited in the array.
  // 6. When adding a slot, the current array should be taken into account, and edited.

  let { slots = $bindable([]), date, addSlot } = $props();
  let sliderDiv: HTMLDivElement;
  let lastDate = $state<string>('');
  let lastSlotCount = $state<number>(0);

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

    // Update slots immutably
    slots = slots.map((slot, i) => {
      if (i === slotIndex) {
        return {
          ...slot,
          slot_start: new Date(handlesValues[slotIndex * 2]).toISOString(),
          slot_end: new Date(handlesValues[slotIndex * 2 + 1]).toISOString(),
        };
      }
      return slot;
    });

    console.log('AFTER update - slots length:', slots.length);
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
