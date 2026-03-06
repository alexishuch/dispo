export const TIME_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatSlot(
  slotStart: string,
  slotEnd: string,
  returnDate = true,
) {
  const slotStartDate = new Date(slotStart);
  const slotEndDate = new Date(slotEnd);
  const weekdayAndDate = returnDate
    ? `${slotStartDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })} `
    : '';
  const time = TIME_FORMATTER.formatRange(slotStartDate, slotEndDate);

  return weekdayAndDate + time;
}

export function formatDateToLocale(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

export function convertDateToZonedYYYYMMDD(dateString: string) {
  const utcDate = new Date(dateString);
  const parts = DATE_FORMATTER.formatToParts(utcDate);

  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '';
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');

  return `${year}-${month}-${day}`;
}
