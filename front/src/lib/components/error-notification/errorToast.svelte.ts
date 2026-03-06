import { getErrorMessage } from "$lib/api/tools";

let message = $state('');

export function getErrorToastMessage() {
  return message;
}

export function setGenericErrorToastMessage(error: unknown) {
  const genericMessage = "Une erreur est survenue.<br />";
  const errorMessage = `<code>` + getErrorMessage(error) + `</code>`;
  message = genericMessage + errorMessage;
}

export function setCustomErrorToastMessage(errorMessage: string) {
  message = errorMessage;
}

export function clearErrorToast() {
  message = '';
}