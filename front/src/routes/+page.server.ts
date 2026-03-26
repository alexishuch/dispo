import { createPoll } from '$lib/api/polls';
import { getErrorMessage } from '$lib/api/tools';
import type { IPoll } from '$lib/model';
import { fail, isHttpError, redirect, type Actions } from '@sveltejs/kit';

export const actions = {
  create: async ({ request, getClientAddress }) => {
    const formData = await request.formData();
    const name = String(formData.get('name'));
    const start_date = String(formData.get('start_date')) || undefined;
    const end_date = String(formData.get('end_date')) || undefined;
    let newPoll: IPoll;

    if (!name) {
      return fail(400, {
        missing: {
          name: !name,
        },
      });
    }

    try {
      newPoll = await createPoll(getClientAddress(), name, start_date, end_date);
    } catch (e: unknown) {
      const message = getErrorMessage(e);
      const status = isHttpError(e) ? e.status || 500 : 422;
      return fail(status, { error: message });
    }

    redirect(303, '/poll/' + newPoll.id);
  },
} satisfies Actions;
