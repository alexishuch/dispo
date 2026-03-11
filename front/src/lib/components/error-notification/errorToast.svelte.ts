import { getErrorMessage } from "$lib/api/tools";

export const toast = $state({
  message: '',
  level: undefined as 'error' | 'success' | undefined
});

export function setCustomToastMessage(msg: string, lvl: 'error' | 'success') {
  toast.message = msg;
  toast.level = lvl;
}

export function setGenericErrorToastMessage(error: unknown) {
  const genericMessage = "Une erreur est survenue.<br />";
  const errorMessage = `<code>` + getErrorMessage(error) + `</code>`;
  toast.message = genericMessage + errorMessage;
}

export function clearErrorToast() {
  toast.message = '';
  toast.level = undefined;
}