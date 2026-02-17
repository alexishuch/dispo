import type { IAvailability } from "$lib/model";
import { fail, type ActionFailure } from "@sveltejs/kit";
import { API_BASE_URL } from "./baseUrl";

export async function getAvailabilities(participantId: string): Promise<IAvailability[] | ActionFailure<{ error: string }>> {
    const res = await fetch(`${API_BASE_URL}/availabilities/${participantId}`);

    if (!res.ok) {
        const text = await res.text();
        return fail(422, { error: text });
    }

    return await res.json();
}

export async function createAvailability(participantId: string, slot: IAvailability): Promise<IAvailability> {
    const { slot_start, slot_end } = slot;
    const res = await fetch(`${API_BASE_URL}/availabilities`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            participantId,
            slot_start,
            slot_end
        })
    });

    if (!res.ok) {
        console.error(JSON.stringify({
            participantId,
            slot_start,
            slot_end
        }))
        const text = await res.text();
        throw new Error(text || `Failed to create availability: ${res.status}`);
    }

    return await res.json();
}

export async function updateAvailabilities(slot: IAvailability): Promise<IAvailability[]> {
    const { slot_start, slot_end } = slot;
    const res = await fetch(`${API_BASE_URL}/availabilities/${slot.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            slot_start,
            slot_end
        })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to create availability: ${res.status}`);
    }

    return await res.json();
}