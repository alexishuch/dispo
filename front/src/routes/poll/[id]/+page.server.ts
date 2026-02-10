import { getPoll } from "$lib/api/polls";

export const load = async ({ params }) => {
    const poll = await getPoll(params.id);
    console.log(poll)
    return { poll };
};

export const actions = {
};