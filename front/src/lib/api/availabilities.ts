import { dev } from "$app/environment";
import type { IAvailability } from "$lib/model";
import { fail, type ActionFailure } from "@sveltejs/kit";

const API_BASE_URL = dev ? 'http://localhost:3000' : import.meta.env.BASE_URL;

export async function getAvailabilities(participantId: string): Promise<IAvailability[] | ActionFailure<{ error: string }>> {
    console.log(`Fetching availabilities for participant ${participantId}`);
    const res = await fetch(`${API_BASE_URL}/availabilities/${participantId}`);

    if (!res.ok) {
        const text = await res.text();
        return fail(422, { error: text });
    }

    return await res.json();
}