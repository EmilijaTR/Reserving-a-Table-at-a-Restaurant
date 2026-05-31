const OPERATING_HOURS_REGEX = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

export function parseOperatingHours(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  const m = OPERATING_HOURS_REGEX.exec(trimmed);
  if (!m) return null;

  const openH = parseInt(m[1], 10);
  const openM = parseInt(m[2], 10);
  const closeH = parseInt(m[3], 10);
  const closeM = parseInt(m[4], 10);

  if (openM !== 0 && openM !== 30) return null;
  if (closeM !== 0 && closeM !== 30) return null;

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (closeMinutes <= openMinutes) return null;

  return {
    normalized: `${m[1]}:${m[2]}-${m[3]}:${m[4]}`,
    openHour: openH,
    openMinute: openM,
    closeHour: closeH,
    closeMinute: closeM,
    openSlotIndex: Math.floor(openMinutes / 30),
    closeSlotIndex: Math.ceil(closeMinutes / 30),
  };
}

export function validateOperatingHoursInput(value) {
  const parsed = parseOperatingHours(value);
  if (!parsed) {
    return {
      ok: false,
      message:
        "Use format HH:MM-HH:MM, e.g. 09:00-22:00. Minutes must be :00 or :30. Closing must be after opening.",
    };
  }
  return { ok: true, normalized: parsed.normalized, parsed };
}

/** Default grid when DB has old free-text hours */
export const DEFAULT_HOURS = {
  openSlotIndex: 9 * 2,
  closeSlotIndex: 22 * 2,
  normalized: "09:00-22:00",
};

export function getGridBoundsFromOperatingHours(operatingHoursString) {
  const parsed = parseOperatingHours(operatingHoursString);
  if (!parsed) return { ...DEFAULT_HOURS, fromFallback: true };
  return {
    openSlotIndex: parsed.openSlotIndex,
    closeSlotIndex: parsed.closeSlotIndex,
    normalized: parsed.normalized,
    fromFallback: false,
  };
}