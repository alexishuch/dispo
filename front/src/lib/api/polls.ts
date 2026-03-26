import type { IPoll, IPollEnriched } from '$lib/model';
import { handleApiRequest, handleApiRequestVoid } from './tools';

export function createPoll(
  clientIp: string,
  name: string,
  start_date?: string,
  end_date?: string,
): Promise<IPoll> {
  const path = 'polls';
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': clientIp },
    body: JSON.stringify({ name, start_date, end_date }),
  };
  return handleApiRequest(path, options);
}

export function getPoll(clientIp: string, id: string): Promise<IPollEnriched> {
  const path = `polls/${id}/computed`;
  const options = {
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': clientIp },
  };
  return handleApiRequest(path, options);
}

export function deletePoll(pollId: string): Promise<void> {
  const path = `polls/${pollId}`;
  const options = {
    method: 'DELETE',
  };
  return handleApiRequestVoid(path, options);
}
