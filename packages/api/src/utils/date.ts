import { TZDate } from "@date-fns/tz";

export class DateParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateParseError";
  }
}

/**
 * Parses a date string into a Date object.
 * @param date - The date string to parse.
 * @returns The parsed Date object.
 * @throws {DateParseError} If the date string is invalid.
 */
export function parseDate(date?: string | null) {
  if (!date || date.trim() === "") {
    return undefined;
  }

  const parsed = new TZDate(date);

  if (isNaN(parsed.getTime())) {
    throw new DateParseError("Invalid date");
  }

  return parsed;
}
