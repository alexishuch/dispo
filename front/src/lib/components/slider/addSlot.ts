import type { IAvailability } from "$lib/model";

type PairOfTimestamps = { start: number; end: number };

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

const roundUpToHour = (timestamp: number) => Math.ceil(timestamp / HOUR_IN_MILLISECONDS) * HOUR_IN_MILLISECONDS;

const mergeIntervals = (pairs: PairOfTimestamps[]): PairOfTimestamps[] => {
    const sorted = [...pairs].sort((a, b) => a.start - b.start);
    const out: PairOfTimestamps[] = [];
    for (const cur of sorted) {
        const last = out[out.length - 1];
        if (!last || last.end < cur.start) out.push({ ...cur });
        else last.end = Math.max(last.end, cur.end);
    }
    return out;
}; // standard merge-intervals pattern [web:106]

export const suggestNewSlot = (
    slots: IAvailability[],
    dayStartUtcIso: string,     // "2025-11-07T00:00:00.000Z"
    durationInMs = HOUR_IN_MILLISECONDS
): IAvailability | null => {
    const dayStart = Date.parse(dayStartUtcIso);
    const dayEnd = dayStart + 24 * HOUR_IN_MILLISECONDS;

    const slotsInTimestamps = slots.map(s => ({ start: Date.parse(s.slot_start), end: Date.parse(s.slot_end) }));
    const orderedPairs = mergeIntervals(
        slotsInTimestamps
            .map(slot => ({ start: Math.max(slot.start, dayStart), end: Math.min(slot.end, dayEnd) }))
            .filter(slot => slot.end > slot.start)
    );

    const findCandidate = (): PairOfTimestamps | null => {
        let cursor = dayStart;

        for (const slot of orderedPairs) {
            if (cursor < slot.start) {
                const start = roundUpToHour(cursor);
                const end = start + durationInMs;
                if (end <= slot.start) return { start, end };
            }
            cursor = Math.max(cursor, slot.end);
        }

        // Tail gap: after last busy slot until day end
        if (cursor < dayEnd) {
            const start = roundUpToHour(cursor);
            const end = start + durationInMs;
            if (end <= dayEnd) return { start, end };
        }

        return null;
    };

    const candidate = findCandidate();
    if (!candidate) return null;

    const inserted: IAvailability = {
        id: 'temp',
        slot_start: new Date(candidate.start).toISOString(),
        slot_end: new Date(candidate.end).toISOString(),
    };

    return inserted;
};