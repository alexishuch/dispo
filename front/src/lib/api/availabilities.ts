import type {
  IAvailability,
  ICommonSlot,
  ICreateAvailability,
} from '$lib/model';
import { handleApiRequest } from './tools';

export async function getCommonAvailabilities(
  participantId: string,
): Promise<ICommonSlot[]> {
  const path = `availabilities/${participantId}/common`;
  return handleApiRequest(path);
}

export async function createAvailability(
  participantId: string,
  slot: ICreateAvailability,
): Promise<IAvailability> {
  const { slot_start, slot_end } = slot;
  const path = `availabilities`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      participantId,
      slot_start,
      slot_end,
    }),
  };
  return handleApiRequest(path, options);
}

export async function deleteAvailability(slotId: string): Promise<void> {
  const path = `availabilities/${slotId}`;
  return handleApiRequest(path, {
    method: 'DELETE',
  });
}
