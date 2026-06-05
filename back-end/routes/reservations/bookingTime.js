const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000

/**
 * @param {Date} startDate
 * @param {'c'|'o'} role
 */
function validateBookingDatetime(startDate, role) {
  const now = Date.now()
  const start = startDate.getTime()

  if (Number.isNaN(start)) {
    return { ok: false, message: 'Invalid datetime.' }
  }

  if (role === 'o') {
    if (start < now - 60 * 1000) {
      return { ok: false, message: 'Walk-in time cannot be in the past.' }
    }
    return { ok: true }
  }

  if (start < now + MIN_ADVANCE_MS) {
    return {
      ok: false,
      message: 'Reservations must be at least 2 hours in advance.',
    }
  }

  return { ok: true }
}

module.exports = {
  MIN_ADVANCE_MS,
  validateBookingDatetime,
}
