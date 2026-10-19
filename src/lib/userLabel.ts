export function getUserHandle(email: string): string {
  return `@${email.split("@")[0]}`;
}
