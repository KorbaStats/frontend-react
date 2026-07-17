export function getFromattedDate(rawDate: string): string {
  const dateObj = new Date(rawDate);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);
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
