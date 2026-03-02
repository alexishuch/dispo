import type { IAvailability, ICommonSlot, ICreateAvailability } from "$lib/model";
import { API_BASE_URL } from "./baseUrl";

export async function getAvailabilities(participantId: string): Promise<IAvailability[]> {
    const res = await fetch(`${API_BASE_URL}/availabilities/${participantId}`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch common slots: ${text}`);
    }
    return await res.json();
}

export async function getCommonAvailabilities(participantId: string): Promise<ICommonSlot[]> {
    const res = await fetch(`${API_BASE_URL}/availabilities/${participantId}/common`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch common slots: ${text}`);
    }
    return await res.json();
}

export async function createAvailability(participantId: string, slot: ICreateAvailability): Promise<IAvailability> {
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

export async function deleteAvailability(slotId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/availabilities/${slotId}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        console.error(res)
        const text = await res.text();
        throw new Error(text || `Failed to delete availability: ${res.status}`);
    }
}

