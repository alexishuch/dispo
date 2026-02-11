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