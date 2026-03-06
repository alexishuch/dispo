import { getPoll } from "$lib/api/polls";

export const load = async ({ params }) => {
    const poll = await getPoll(params.id);
    return { poll };
};