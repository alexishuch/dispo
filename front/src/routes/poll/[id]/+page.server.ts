import { getPoll } from "$lib/api/polls";

export const load = async ({ params, fetch }) => {
    console.log("Loading !")
    const poll = await getPoll(params.id, fetch);
    return { poll };
};