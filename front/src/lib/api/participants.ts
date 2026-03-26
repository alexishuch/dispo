import type { IParticipant, IParticipantEnriched } from '$lib/model';
import { handleApiRequest, handleApiRequestVoid } from './tools';

export function createParticipant(
  pollId: string,
  name: string,
): Promise<IParticipant> {
  const path = `participants`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pollId, name }),
  };
  return handleApiRequest(path, options);
}

export function getParticipant(
  participantId: string,
): Promise<IParticipantEnriched> {
  const path = `participants/${participantId}`;
  return handleApiRequest(path);
}

export function deleteParticipant(participantId: string): Promise<void> {
  const path = `participants/${participantId}`;
  const options = {
    method: 'DELETE',
  };
  return handleApiRequestVoid(path, options);
}
