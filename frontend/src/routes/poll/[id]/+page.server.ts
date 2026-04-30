import { getPoll } from '$lib/api/polls';

export const load = async ({ params, getClientAddress }) => {
  const poll = await getPoll(getClientAddress(), params.id);
  return {
    poll, meta: {
      title: poll.name
    }
  };
};
