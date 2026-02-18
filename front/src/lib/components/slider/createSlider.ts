import { TIME_FORMATTER } from '$lib/dateUtils';
import type { IAvailability } from '$lib/model';
import noUiSlider from 'nouislider';

const HALF_HOUR_STEP = 30 * 60 * 1000;

function calculateDayTimestampRange(dayIsoStr: string): { dayStart: number; dayEnd: number } {
    const start: Date = new Date(dayIsoStr);
    start.setHours(0, 0, 0, 0);
    const end: Date = new Date(start);
    end.setDate(start.getDate() + 1);

    return {
        dayStart: start.getTime(),
        dayEnd: end.getTime()
    };
}

function buildTimestampsArrayFromSlots(daySlots: IAvailability[]): number[] {
    return daySlots.flatMap((slot: IAvailability) => {
        const startTs = new Date(slot.slot_start).getTime();
        const endTs = new Date(slot.slot_end).getTime();
        return [startTs, endTs];
    });
}

function createConnectionArray(handlesCount: number): boolean[] {
    const connects: boolean[] = [];
    for (let i = 0; i <= handlesCount; ++i) {
        connects.push(i % 2 === 1);
    }
    return connects;
}

export function createSlider(
    sliderElement: HTMLDivElement,
    slotsForDay: IAvailability[],
    dayIso: string,
    onUpdate: (handle: number, handlesValues: number[]) => void
) {
    if (!sliderElement) throw new Error('slider element not found');

    if ((sliderElement as any).noUiSlider) {
        (sliderElement as any).noUiSlider.destroy();
        sliderElement.innerHTML = '';
    }

    const { dayStart, dayEnd } = calculateDayTimestampRange(dayIso);
    const handles: number[] = buildTimestampsArrayFromSlots(slotsForDay);
    if (handles.length === 0) {
        return;
    }

    const handleConnections: boolean[] = createConnectionArray(handles.length);

    noUiSlider.create(sliderElement, {
        start: handles,
        range: { min: dayStart, max: dayEnd },
        step: HALF_HOUR_STEP,
        connect: handleConnections,
        tooltips: {
            to: (value: number): string => TIME_FORMATTER.format(value)
        },
        behaviour: 'drag-tap'
    });

    (sliderElement as any).noUiSlider.on('change', (_, handle, unencoded) => {
        // updateSlotDates(handle, unencoded, slotsForDay);
        onUpdate(handle, unencoded);
    });
}