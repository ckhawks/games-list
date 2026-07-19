// Format a timestamp for display. Coerces string/Date/null (Neon returns strings)
// and guards invalid dates so it never throws.
export function getTimeString(date: Date | string | null | undefined): string {
  if (!date) return "Unknown";

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Unknown";

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const hours = 5;
  parsed.setHours(parsed.getHours() - hours);
  return parsed.toLocaleDateString("en-US", options as unknown as any);
}
