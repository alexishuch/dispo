import { getPoll } from "$lib/api/polls";

// export const ssr = false;
// export const csr = true;

export const load = async ({ params, fetch }) => {
    const poll = await getPoll(params.id, fetch);
    console.log(poll);
    return { poll };
};