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

  function commitFromScroll() {
    const i = clampIndex(Math.round(container.scrollTop / ITEM_H));
    container.scrollTop = i * ITEM_H;
    if (selected !== options[i]) selected = options[i];
  }

  // --- MOUSE drag via Pointer Events ---

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    e.preventDefault();
    isDragging = true;
    lastY = e.clientY;
    container.style.scrollSnapType = 'none';
    container.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging || e.pointerType !== 'mouse') return;
    container.scrollTop += lastY - e.clientY;
    lastY = e.clientY;
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging || e.pointerType !== 'mouse') return;
    isDragging = false;
    container.releasePointerCapture(e.pointerId);
    commitFromScroll();
    container.style.scrollSnapType = '';
  }

  // --- MOUSE wheel ---

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const now = performance.now();
    if (now - lastWheelTime > 200) pendingDelta = 0;
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

  // --- TOUCH drag via Touch Events (bypasses browser scroll interception) ---

  function onTouchStart(e: TouchEvent) {
    // No preventDefault here — it would block page scroll context on iOS
    isDragging = true;
    lastY = e.touches[0].clientY;
    container.style.scrollSnapType = 'none';
  }

  function onTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    e.preventDefault(); // Block native scroll only once we know we're dragging the wheel
    container.scrollTop += lastY - e.touches[0].clientY;
    lastY = e.touches[0].clientY;
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    commitFromScroll();
    container.style.scrollSnapType = '';
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
      // Selected value no longer in options (parent filtered it out)
      selected = opts[0];
      container.scrollTop = 0;
    }
  });

  onMount(() => {
    // Set initial scroll position
    const initIndex = options.indexOf(selected);
    if (initIndex >= 0) container.scrollTop = initIndex * ITEM_H;

    // Touch events must be registered imperatively with { passive: false }
    // so preventDefault() is allowed — Svelte's ontouch* handlers are passive by default
    // touchstart can be passive — we don't preventDefault there anymore
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    // touchmove must stay non-passive to allow preventDefault
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);
    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      container.removeEventListener('wheel', onWheel);
    };
  });
</script>

<div
  class="wheel"
  bind:this={container}
  role="scrollbar"
  aria-valuenow={selected}
  tabindex="0"
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
    overscroll-behavior: contain;
    scroll-snap-type: y mandatory;
    /* touch-action: none is NOT set here — Touch Events handle it via preventDefault() */
    -webkit-user-select: none;
    user-select: none;
    -ms-overflow-style: none;
    scrollbar-width: none;
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
    scroll-snap-stop: always;
    white-space: nowrap;
    pointer-events: none;
    -webkit-user-select: none;
    user-select: none;
  }
</style>
