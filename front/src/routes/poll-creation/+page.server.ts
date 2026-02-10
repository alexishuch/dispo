import { createPoll } from "$lib/api/polls";
import { fail, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    create: async ({ request, fetch }) => {
        const formData = await request.formData();
        const name = String(formData.get('name'));
        const start_date = String(formData.get('start_date'));
        const end_date = String(formData.get('end_date'));

        try {
            return createPoll(name, start_date, end_date);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return fail(422, { error: errorMessage });
        }
    }
};