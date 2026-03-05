import type { IParticipant } from "$lib/model";
import { API_BASE_URL } from "./baseUrl";

async function handleError(res: Response) {
    let payload: any = null;
    let errorMessage = `Request failed - (${res.status})`;
    try { payload = await res.json(); } catch { }
    if (payload.statusCode) {
        errorMessage = payload.statusCode + ' - ' + payload.message
    }

    throw new Error(errorMessage);
}

export async function createParticipant(pollId: string, name: string): Promise<IParticipant> {
    const res = await fetch(`${API_BASE_URL}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, name })
    });

    if (!res.ok) {
        await handleError(res)
    }

    return await res.json();
}

export async function getParticipant(participantId: string) {
    const res = await fetch(`${API_BASE_URL}/participants/${participantId}`);

    if (!res.ok) {
        await handleError(res)
    }

    return res.json();
}

export async function deleteParticipant(participantId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/participants/${participantId}`, {
        method: 'DELETE'
    });

    if (!res.ok) {
        await handleError(res)
    }

    return res.json();
}