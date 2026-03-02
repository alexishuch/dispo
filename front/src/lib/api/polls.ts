import type { IPoll, IPollEnriched } from "$lib/model";
import { API_BASE_URL } from "./baseUrl";

type Fetch = typeof fetch;

export async function createPoll(name: string, start_date: string, end_date: string): Promise<IPoll> {
    const url = new URL('/polls', API_BASE_URL)
    console.log(`Creating ${url}`)
    const res = await fetch(url, {
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

export async function getPoll(id: string, fetch: Fetch): Promise<IPollEnriched> {
    const url = new URL(`/polls/${id}/computed`, API_BASE_URL)
    console.log(`Fetching ${url}`)
    const res = await fetch(url);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return await res.json();
}