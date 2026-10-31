export function getFormatedDate(rawDate: string): string {
  const dateObj = new Date(rawDate);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);
}

export function getShortWeekday(rawDate: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "short",
    timeZone: "Europe/Warsaw",
  })
    .format(new Date(rawDate))
    .replace(".", "");
}

export function getDayMonth(rawDate: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Warsaw",
  }).format(new Date(rawDate));
}

export function getLocalTime(rawDate: string): string {
  const dateObj = new Date(rawDate);
  return new Intl.DateTimeFormat("pl-PL", 
    {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Warsaw"
    }).format(dateObj);
}

export function toDateTimeInputValue(rawDate: string): string {
  const date = new Date(rawDate);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDateTimeInputValue(value: string): string {
  return new Date(value).toISOString();
}

export function getLongDate(rawDate: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).format(new Date(rawDate));
}

export function formatDateTime(rawDate: string): string {
  return `${getFormatedDate(rawDate)} ${getLocalTime(rawDate)}`;
}
