<script lang="ts">
  import WheelColumn from './WheelColumn.svelte';

  let {
    selectedDate,
    selectedStartDateTime = $bindable<Date | null>(),
    selectedEndDateTime = $bindable<Date | null>(),
  }: {
    selectedDate: string;
    selectedStartDateTime: Date | null;
    selectedEndDateTime: Date | null;
  } = $props();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const isToday = $derived(selectedDate === todayStr);

  const hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  const endableHours: number[] = [...hours, 24];
  const minutes: number[] = [0, 15, 30, 45];

  let startH = $state(8);
  let startM = $state(0);

  // Check if current hour is still selectable
  const startHours = $derived(
    isToday
      ? hours.filter(
          (h) => h >= now.getHours() + (now.getMinutes() > 45 ? 1 : 0),
        )
      : hours,
  );

  const startMinutes = $derived.by(() => {
    if (!isToday || startH > now.getHours()) return minutes;
    return minutes.filter((m) => m >= now.getMinutes());
  });

  $effect(() => {
    if (!startHours.includes(startH)) startH = startHours[0];
  });
  $effect(() => {
    if (!startMinutes.includes(startM)) startM = startMinutes[0];
  });

  let endH = $state(9);
  let endM = $state(0);

  const endHours = $derived(endableHours.filter((h) => h > startH || h === 24));
  const endMinutes = $derived(endH === 24 ? [0] : minutes);

  $effect(() => {
    if (!endHours.includes(endH)) endH = endHours[1] ?? endHours[0];
  });
  $effect(() => {
    if (!endMinutes.includes(endM)) endM = endMinutes[0];
  });

  function padTime(n: number): string {
    return String(n).padStart(2, '0');
  }

  const startHoursDisplay = $derived(startHours.map(padTime));
  const endHoursDisplay = $derived(endHours.map((h) => padTime(h % 24)));

  const baseDate = $derived(new Date(selectedDate));

  $effect(() => {
    selectedStartDateTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      startH,
      startM,
      0,
      0,
    );
  });

  $effect(() => {
    selectedEndDateTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      endH,
      endM,
      0,
      0,
    );
  });
</script>

<div class="range">
  <div class="time">
    <WheelColumn
      options={startHours}
      display={startHoursDisplay}
      bind:selected={startH}
    />
    <span>:</span>
    <WheelColumn
      options={startMinutes}
      display={startMinutes.map(padTime)}
      bind:selected={startM}
    />
  </div>

  <span class="arrow">→</span>

  <div class="time">
    <WheelColumn
      options={endHours}
      display={endHoursDisplay}
      bind:selected={endH}
    />
    <span>:</span>
    <WheelColumn
      options={endMinutes}
      display={endMinutes.map(padTime)}
      bind:selected={endM}
    />
  </div>
</div>

<style>
  .range {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
  }

  .time {
    display: flex;
    align-items: center;
    border-radius: 12px;
    background: #f5f5f5;
    position: relative;
    flex-grow: 1;
    justify-content: center;
  }

  .time::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 40px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    pointer-events: none;
  }

  @media (min-width: 340px) {
    .range {
      justify-content: center;
    }

    .time {
      flex-grow: initial;
      gap: 4px;
      padding: 0 8px;
    }
  }
</style>
