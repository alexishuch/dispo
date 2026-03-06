import type { IParticipant, IParticipantEnriched } from '$lib/model';
import { API_BASE_URL } from './baseUrl';
import { handleApiRequest } from './tools';

export async function createParticipant(
  pollId: string,
  name: string,
): Promise<IParticipant> {
  const path = `${API_BASE_URL}/participants`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pollId, name }),
  };
  return handleApiRequest(path, options);
}

export async function getParticipant(
  participantId: string,
): Promise<IParticipantEnriched> {
  const path = `/participants/${participantId}`;
  return handleApiRequest(path);
}

export async function deleteParticipant(participantId: string): Promise<void> {
  const path = `/participants/${participantId}`;
  const options = {
    method: 'DELETE',
  };
  return handleApiRequest(path, options);
}
