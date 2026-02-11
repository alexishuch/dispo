import { createPoll } from "$lib/api/polls";
import type { IPoll } from "$lib/model";
import { fail, redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    create: async ({ request, fetch }) => {
        const formData = await request.formData();
        const name = String(formData.get('name'));
        const start_date = String(formData.get('start_date'));
        const end_date = String(formData.get('end_date'));
        let newPoll: IPoll;

        try {
            newPoll = await createPoll(name, start_date, end_date);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error creating poll:', error);
            return fail(422, { error: errorMessage });
        }

        redirect(303, '/poll/' + newPoll.id);
    }
};