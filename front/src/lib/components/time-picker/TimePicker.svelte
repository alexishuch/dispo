<script lang="ts">
  import WheelColumn from './WheelColumn.svelte';

  const hours: string[] = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0'),
  );

  const minutes: string[] = [0, 15, 30, 45].map((m) =>
    String(m).padStart(2, '0'),
  );

  const endHours = $derived(
    hours.filter((hour) => Number(hour) >= selectedStartDateTime?.getHours()),
  );

  let {
    selectedDate,
    selectedStartDateTime = $bindable<Date | null>(),
    selectedEndDateTime = $bindable<Date | null>(),
  }: {
    selectedDate: string;
    selectedStartDateTime: Date | null;
    selectedEndDateTime: Date | null;
  } = $props();

  let startH = $state(hours[8]);
  let startM = $state(minutes[0]);
  let endH = $state(hours[9]);
  let endM = $state(minutes[0]);

  $effect(() => {
    selectedStartDateTime = new Date(
      new Date(selectedDate).setHours(Number(startH), Number(startM), 0, 0),
    );
    $inspect(selectedStartDateTime?.toISOString());
  });

  $effect(() => {
    selectedEndDateTime = new Date(
      new Date(selectedDate).setHours(Number(endH), Number(endM), 0, 0),
    );
    $inspect(selectedEndDateTime?.toISOString());
  });
</script>

<div class="range">
  <div class="time">
    <WheelColumn options={hours} bind:selected={startH} />
    <span>:</span>
    <WheelColumn options={minutes} bind:selected={startM} />
  </div>

  <span class="arrow">→</span>

  <div class="time">
    <WheelColumn options={endHours} bind:selected={endH} />
    <span>:</span>
    <WheelColumn options={minutes} bind:selected={endM} />
  </div>
</div>

<style>
  .range {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
  }

  .time {
    display: flex;
    align-items: center;
    border-radius: 12px;
    background: #f5f5f5;
    position: relative;
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
    .time {
      gap: 4px;
      padding: 0 8px;
    }
  }
</style>
