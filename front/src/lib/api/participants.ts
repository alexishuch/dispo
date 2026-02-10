import { dev } from "$app/environment";
import type { IParticipant, IParticipantEnriched } from "$lib/model";

const API_BASE_URL = dev ? 'http://localhost:3000' : import.meta.env.BASE_URL;

export async function createParticipant(pollId: string, name: string): Promise<IParticipant> {
    const res = await fetch(`${API_BASE_URL}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, name })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return await res.json();
}

export async function getParticipant(participantId: string): Promise<IParticipantEnriched> {
    const res = await fetch(`${API_BASE_URL}/participants/${participantId}`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return await res.json();
}