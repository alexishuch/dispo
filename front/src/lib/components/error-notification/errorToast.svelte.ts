import { getErrorMessage } from '$lib/api/tools';

let message = $state('');

export function getErrorToastMessage() {
  return message;
}

export function setErrorToastMessage(error: unknown) {
  message = getErrorMessage(error);
}

export function clearErrorToast() {
  message = '';
}
