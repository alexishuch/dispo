import { getPoll } from "$lib/api/polls";

export const load = async ({ params, fetch }) => {
    const poll = await getPoll(params.id, fetch);
    return { poll };
};