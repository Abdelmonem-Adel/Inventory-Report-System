export function parseExcelDate(value) {
  if (typeof value === "number") {
    return new Date((value - 25569) * 86400 * 1000);
  }

  if (typeof value === "string") {
    const parts = value.split("/");

    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months 0-indexed
      const year = parseInt(parts[2]);

      return new Date(year, month, day);
    }
  }

  // fallback
  return new Date(value);
}