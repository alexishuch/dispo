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

  const ALL_HOURS: number[] = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES: number[] = [0, 15, 30, 45];

  let selectedStartHour = $state(8);
  let selectedStartMinutes = $state(0);
  let selectedEndHour = $state(9);
  let selectedEndMinutes = $state(0);

  const startHours = $derived(
    isToday
      ? ALL_HOURS.filter(
          (h) => h >= now.getHours() + (now.getMinutes() > 45 ? 1 : 0),
        )
      : ALL_HOURS,
  );

  const startMinutes = $derived.by(() => {
    if (!isToday || selectedStartHour > now.getHours()) return MINUTES;
    return MINUTES.filter((m) => m >= now.getMinutes());
  });

  const endHours = $derived.by(() => {
    const minEndH =
      selectedStartMinutes === 45 ? selectedStartHour + 1 : selectedStartHour;
    return [...ALL_HOURS.filter((h) => h >= minEndH), 24];
  });

  const endMinutes = $derived.by(() => {
    if (selectedEndHour === 24) return [0];
    if (selectedEndHour > selectedStartHour) return MINUTES;
    return MINUTES.filter((m) => m > selectedStartMinutes);
  });

  $effect(() => {
    selectedStartHour;
    selectedStartMinutes = startMinutes[0];
    selectedEndHour = selectedStartHour + 1 <= 23 ? selectedStartHour + 1 : 24;
    selectedEndMinutes = 0;
  });

  $effect(() => {
    selectedStartMinutes;
    selectedEndHour = selectedStartHour + 1 <= 23 ? selectedStartHour + 1 : 24;
    selectedEndMinutes = 0;
  });

  $effect(() => {
    selectedEndHour;
    selectedEndMinutes = endMinutes[0];
  });

  $effect(() => {
    if (!startHours.includes(selectedStartHour))
      selectedStartHour = startHours[0];
  });
  $effect(() => {
    if (!startMinutes.includes(selectedStartMinutes))
      selectedStartMinutes = startMinutes[0];
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
      selectedStartHour,
      selectedStartMinutes,
      0,
      0,
    );
  });

  $effect(() => {
    selectedEndDateTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      selectedEndHour,
      selectedEndMinutes,
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
      bind:selected={selectedStartHour}
    />
    <span>:</span>
    <WheelColumn
      options={startMinutes}
      display={startMinutes.map(padTime)}
      bind:selected={selectedStartMinutes}
    />
  </div>

  <span class="arrow">→</span>

  <div class="time">
    <WheelColumn
      options={endHours}
      display={endHoursDisplay}
      bind:selected={selectedEndHour}
    />
    <span>:</span>
    <WheelColumn
      options={endMinutes}
      display={endMinutes.map(padTime)}
      bind:selected={selectedEndMinutes}
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
