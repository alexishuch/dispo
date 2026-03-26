import type { IPoll, IPollEnriched } from '$lib/model';
import { handleApiRequest, handleApiRequestVoid } from './tools';

export function createPoll(
  name: string,
  start_date?: string,
  end_date?: string,
): Promise<IPoll> {
  const path = 'polls';
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, start_date, end_date }),
  };
  return handleApiRequest(path, options);
}

export function getPoll(id: string): Promise<IPollEnriched> {
  const path = `polls/${id}/computed`;
  return handleApiRequest(path);
}

export function deletePoll(pollId: string): Promise<void> {
  const path = `polls/${pollId}`;
  const options = {
    method: 'DELETE',
  };
  return handleApiRequestVoid(path, options);
}
