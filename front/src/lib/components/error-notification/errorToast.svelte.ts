
export const toast = $state({
  message: '',
  level: undefined as 'error' | 'success' | undefined
});

export function setToastMessage(msg: string, lvl: 'error' | 'success') {
  toast.message = msg;
  toast.level = lvl;
}

export function clearErrorToast() {
  toast.message = '';
  toast.level = undefined;
}