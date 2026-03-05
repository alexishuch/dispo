<script lang="ts">
  import { onMount } from 'svelte';

  let {
    options,
    selected = $bindable(),
  }: { options: string[]; selected: string } = $props();

  let container: HTMLDivElement;
  const ITEM_H = 40;
  let pendingDelta = 0;
  let lastWheelTime = 0;

  let dragStartY = 0;
  let dragStartScrollTop = 0;
  let isDragging = false;

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    isDragging = true;
    dragStartY = e.clientY;
    dragStartScrollTop = container.scrollTop;
    container.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    container.scrollTop = dragStartScrollTop - (e.clientY - dragStartY);
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    container.releasePointerCapture(e.pointerId);
  }

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
      const i = Math.round(container.scrollTop / ITEM_H);
      const target = Math.max(0, Math.min(i + dir * steps, options.length - 1));
      container.scrollTop = target * ITEM_H;
      selected = options[target];
    }
  }

  $effect(() => {
    if (!container) return;
    const i = options.findIndex((o) => o === selected);
    if (i >= 0) container.scrollTop = i * ITEM_H;
  });

  onMount(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;

    function onScroll() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const i = Math.round(container.scrollTop / ITEM_H);
        selected = options[Math.max(0, Math.min(i, options.length - 1))];
      }, 100);
    }

    if ('onscrollsnapchange' in container) {
      // Chrome desktop: precise snap detection
      container.addEventListener('scrollsnapchange', (e: any) => {
        const el = e.snapTargetBlock as HTMLElement;
        const index = Array.from(container.children).indexOf(el) - 1;
        if (index >= 0 && index < options.length) selected = options[index];
      });
    } else {
      // iOS Safari fallback: scroll + debounce
      container.addEventListener('scroll', onScroll);
    }

    // scrollend where supported (Firefox, future Safari)
    if ('onscrollend' in container) {
      container.addEventListener('scrollend', () => {
        const i = Math.round(container.scrollTop / ITEM_H);
        selected = options[Math.max(0, Math.min(i, options.length - 1))];
      });
    }

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimer);
    };
  });
</script>

<div
  class="wheel"
  bind:this={container}
  role="scrollbar"
  tabindex="0"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
>
  <div class="pad"></div>
  {#each options as opt}
    <div class="item">{opt}</div>
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
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    touch-action: pan-y; /* iOS scroll natif */
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

  @media (min-width: 400px) {
    .wheel {
    }
  }
</style>
