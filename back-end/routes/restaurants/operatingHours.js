const OPERATING_HOURS_REGEX = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/

function parseOperatingHours(value) {
  if (value == null || typeof value !== 'string') return null
  const trimmed = value.trim()
  const m = OPERATING_HOURS_REGEX.exec(trimmed)
  if (!m) return null

  const openH = parseInt(m[1], 10)
  const openM = parseInt(m[2], 10)
  const closeH = parseInt(m[3], 10)
  const closeM = parseInt(m[4], 10)

  if (openM !== 0 && openM !== 30) return null
  if (closeM !== 0 && closeM !== 30) return null

  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM
  //just so the interval is valid
  if (closeMinutes <= openMinutes) return null

  return {
    normalized: `${m[1]}:${m[2]}-${m[3]}:${m[4]}`,
    openHour: openH,
    openMinute: openM,
    closeHour: closeH,
    closeMinute: closeM,
    openSlotIndex: Math.floor(openMinutes / 30), //on which slot is open
    closeSlotIndex: Math.ceil(closeMinutes / 30), ////on which slot is closed
  }
}

function validateOperatingHours(value) {
  const parsed = parseOperatingHours(value)
  if (!parsed) {
    return {
      ok: false,
      message:
        'Operating hours must be HH:MM-HH:MM (same every day), e.g. 09:00-22:00. Use :00 or :30 for minutes; closing time must be after opening.',
    }
  }
  return { ok: true, normalized: parsed.normalized, parsed }
}

module.exports = {
  validateOperatingHours,
  parseOperatingHours,
}