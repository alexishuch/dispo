import type { IAvailability } from '$lib/model';
import noUiSlider from 'nouislider';

const HALF_HOUR_STEP = 30 * 60 * 1000;
export const TIME_FORMAT = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });

// declare var noUiSlider: any;
// const slotsListElement: HTMLElement | null = document.getElementById('slotsList');
// const addButton = document.getElementById('addSlotButton') as HTMLButtonElement;
// const dateSelector = document.getElementById('dateSelector') as HTMLInputElement;

function calculateDayTimestampRange(dayIsoStr: string): { dayStart: number; dayEnd: number } {
    const start: Date = new Date(dayIsoStr)
    start.setUTCHours(0, 0, 0, 0);
    const end: Date = new Date(dayIsoStr);
    end.setUTCHours(23, 59, 59, 999);

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
        // format: {
        //     from: (value: string) => Number(value),
        //     to: (value: number) => String(value),
        // },
        tooltips: {
            to: (value: number): string => TIME_FORMAT.format(value)
        },
        behaviour: 'drag-tap'
    });

    (sliderElement as any).noUiSlider.on('change', (_, handle, unencoded) => {
        // updateSlotDates(handle, unencoded, slotsForDay);
        onUpdate(handle, unencoded);
    });
}

// function deleteSlot(slotId: string): void {
//     const index = slots.findIndex(slot => slot.id === slotId);
//     if (index !== -1) {
//         slots.splice(index, 1);
//         updateSlider();
//     }
// }

// function addSlot(dayIso: string): void {
//     const newSlot: Slot = {
//         id: Math.floor(Math.random() * 10000).toString(),
//         start_date: `${dayIso}T09:00:00`,
//         end_date: `${dayIso}T10:00:00`
//     };
//     slots.unshift(newSlot);
//     updateSlider();
// }

// function filterSlotsByDay(allSlots: IAvailability[], selectedDayIsoString: string): IAvailability[] {
//     return allSlots
//         .filter(slot => slot.slot_start.substring(0, 10) === selectedDayIsoString);
// }

// function updateSlider() {
//     const selectedDay = dateSelector.value;
//     const daySlots = filterSlotsByDay(slots, selectedDay);
//     createSlider(new HTMLDivElement(), daySlots, selectedDay);
// }
// dateSelector.addEventListener('change', updateSlider);
// addButton.onclick = () => {
//     addSlot(dateSelector.value);
// };

// updateSlider();