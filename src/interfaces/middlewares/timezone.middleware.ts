import { Request, Response, NextFunction } from "express";

export function timezoneMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json;

  res.json = function (body: any) {
    if (body && typeof body === "object") {
      body = formatTimestampsInObject(body);
    }
    return originalJson.call(this, body);
  };

  next();
}

function formatTimestampsInObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return formatMexicoTimestamp(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(formatTimestampsInObject);
  }

  if (typeof obj === "object") {
    const formatted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "timestamp" && value instanceof Date) {
        formatted[key] = formatMexicoTimestamp(value);
      } else if (
        key === "timestamp" &&
        typeof value === "string" &&
        isISOTimestamp(value)
      ) {
        formatted[key] = formatMexicoTimestamp(new Date(value));
      } else {
        formatted[key] = formatTimestampsInObject(value);
      }
    }
    return formatted;
  }

  return obj;
}

function formatMexicoTimestamp(date: Date): string {
  return (
    date
      .toLocaleString("sv-SE", {
        timeZone: "America/Mexico_City",
      })
      .replace(" ", "T") + ".000Z"
  );
}

function isISOTimestamp(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(str);
}
