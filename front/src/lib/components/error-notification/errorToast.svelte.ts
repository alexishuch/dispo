let message = $state('');

export function getErrorToastMessage() {
    return message;
}

export function setErrorToastMessage(errorMessage?: string) {
    message = errorMessage ?? '';
}

export function clearErrorToast() {
    message = '';
}
