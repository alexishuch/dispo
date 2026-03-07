import type { IPoll, IPollEnriched } from '$lib/model';
import { handleApiRequest } from './tools';

export async function createPoll(
  name: string,
  start_date: string,
  end_date?: string,
): Promise<IPoll> {
  const path = 'polls';
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, start_date, end_date }),
  };
  return await handleApiRequest(path, options);
}

export async function getPoll(id: string): Promise<IPollEnriched> {
  const path = `polls/${id}/computed`;
  return await handleApiRequest(path);
}
