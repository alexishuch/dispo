<script lang="ts">
  import { onMount } from 'svelte';

  let {
    options,
    display,
    selected = $bindable(),
  }: {
    options: number[];
    display: string[];
    selected: number;
  } = $props();

  let container: HTMLDivElement;
  const ITEM_H = 40;

  let isDragging = false;
  let lastY = 0;
  let pendingDelta = 0;
  let lastWheelTime = 0;

  const clampIndex = (i: number) =>
    Math.max(0, Math.min(i, options.length - 1));

  // Snap scrollTop to the nearest item and update selected
  function commitFromScroll() {
    const i = clampIndex(Math.round(container.scrollTop / ITEM_H));
    container.scrollTop = i * ITEM_H;
    if (selected !== options[i]) selected = options[i];
  }

  // --- Mouse drag (pointer capture keeps events flowing outside the element) ---

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    e.preventDefault(); // Prevent text selection
    isDragging = true;
    lastY = e.clientY;
    container.style.scrollSnapType = 'none'; // Disable snap while dragging
    container.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    container.scrollTop += lastY - e.clientY;
    lastY = e.clientY; // Re-anchor each frame so boundary reversal is instant
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    container.releasePointerCapture(e.pointerId);
    commitFromScroll();
    container.style.scrollSnapType = '';
  }

  // --- Mouse wheel (step-based, debounced accumulation) ---

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const now = performance.now();
    if (now - lastWheelTime > 200) pendingDelta = 0; // Reset after pause
    lastWheelTime = now;
    pendingDelta += e.deltaY;

    if (Math.abs(pendingDelta) >= ITEM_H) {
      const steps = Math.floor(Math.abs(pendingDelta) / ITEM_H);
      const dir = Math.sign(pendingDelta);
      pendingDelta -= dir * steps * ITEM_H;

      const i = clampIndex(
        Math.round(container.scrollTop / ITEM_H) + dir * steps,
      );
      container.scrollTop = i * ITEM_H;
      if (selected !== options[i]) selected = options[i];
    }
  }

  // --- External sync: when selected or options change from parent ---
  // Dependencies must be read unconditionally before any early return (Svelte 5 rule)

  $effect(() => {
    const s = selected;
    const opts = options;
    if (!container || isDragging) return;

    const i = opts.indexOf(s);
    if (i >= 0) {
      if (container.scrollTop !== i * ITEM_H) container.scrollTop = i * ITEM_H;
    } else if (opts.length > 0) {
      // Selected value no longer exists in options (parent filtered it out)
      selected = opts[0];
      container.scrollTop = 0;
    }
  });

  // --- Native scroll (touch / trackpad) ---

  onMount(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;

    // Debounce snap: avoids committing mid-scroll on touch/trackpad
    const onScroll = () => {
      if (isDragging) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(commitFromScroll, 100);
    };

    // Set initial scroll position before first paint
    const initIndex = options.indexOf(selected);
    if (initIndex >= 0) container.scrollTop = initIndex * ITEM_H;

    container.addEventListener('scroll', onScroll);
    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('wheel', onWheel);
      clearTimeout(scrollTimer);
    };
  });
</script>

<div
  class="wheel"
  bind:this={container}
  role="scrollbar"
  aria-valuenow={selected}
  tabindex="0"
  style="user-select: none;"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
>
  <div class="pad"></div>
  {#each options as _item, i}
    <div class="item">{display[i]}</div>
  {/each}
  <div class="pad"></div>
</div>

<style>
  .wheel {
    height: 200px;
    width: 16vw;
    max-width: 100px;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    touch-action: pan-y;
    -webkit-user-select: none;
    user-select: none;
  }

  .wheel:active {
    cursor: grabbing;
  }

  .wheel::-webkit-scrollbar {
    display: none;
  }

  .pad {
    height: 80px;
  }

  .item {
    height: 40px;
    line-height: 40px;
    text-align: center;
    scroll-snap-align: center;
    pointer-events: none;
    -webkit-user-select: none;
    user-select: none;
  }
</style>
