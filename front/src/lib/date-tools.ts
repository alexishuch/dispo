export const TIME_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  timeStyle: 'short',
});

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'short'
});

export function formatSlot(
  slotStart: string,
  slotEnd: string,
  displayDate = true,
) {
  const slotStartDate = new Date(slotStart);
  const slotEndDate = new Date(slotEnd);

  const weekdayAndDate =
    `${slotStartDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })} `;

  const time = `${TIME_FORMATTER.format(slotStartDate)} – ${TIME_FORMATTER.format(slotEndDate)}`;

  return displayDate ? weekdayAndDate + time : time;
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
