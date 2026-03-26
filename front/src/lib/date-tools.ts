import { getLocale } from '$lib/paraglide/runtime';

const localeMap: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  de: 'de-DE'
};

function getBCP47(): string {
  return localeMap[getLocale()] ?? 'fr-FR';
}

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
  displayDate = true
): string {
  const locale = getBCP47();

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
  });

  const slotStartDate = new Date(slotStart);
  const slotEndDate = new Date(slotEnd);

  const weekdayAndDate = slotStartDate.toLocaleDateString(locale, {
    weekday: 'long',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }) + ' ';

  const time = `${timeFormatter.format(slotStartDate)} – ${timeFormatter.format(slotEndDate)}`;

  return displayDate ? weekdayAndDate + time : time;
}

export function formatDateToLocale(dateString: string): string {
  return new Date(dateString).toLocaleDateString(getBCP47());
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
