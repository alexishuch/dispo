import { createPoll } from '$lib/api/polls';
import { getErrorMessage, HttpError } from '$lib/api/tools';
import type { IPoll } from '$lib/model';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const name = String(formData.get('name'));
    const start_date = String(formData.get('start_date'));
    const end_date = String(formData.get('end_date'));
    let newPoll: IPoll;

    if (!name || !start_date) {
      return fail(400, {
        missing: {
          name: !name,
          start_date: !start_date,
        },
      });
    }

    try {
      newPoll = await createPoll(name, start_date, end_date);
    } catch (e: unknown) {
      const message = getErrorMessage(e);
      const status = e instanceof HttpError ? e.status || 500 : 422;
      return fail(status, { error: message });
    }

    redirect(303, '/poll/' + newPoll.id);
  },
} satisfies Actions;
