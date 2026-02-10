import { dev } from "$app/environment";
import type { IPoll, IPollEnriched } from "$lib/model";

const API_BASE_URL = dev ? 'http://localhost:3000' : import.meta.env.BASE_URL;

export async function createPoll(name: string, start_date: string, end_date: string): Promise<IPoll> {
    const res = await fetch(`${API_BASE_URL}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, start_date, end_date })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return await res.json();
}

export async function getPoll(id: string): Promise<IPollEnriched> {
    const res = await fetch(`${API_BASE_URL}/polls/${id}/computed`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return await res.json();
}