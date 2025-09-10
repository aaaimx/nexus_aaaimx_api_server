export class TimezoneUtil {
  static nowInMexico(): Date {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" })
    );
  }

  static formatToMexicoTimezone(date: Date): string {
    return (
      date
        .toLocaleString("sv-SE", {
          timeZone: "America/Mexico_City",
        })
        .replace(" ", "T") + ".000Z"
    );
  }

  static isISOTimestamp(str: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(str);
  }
}
