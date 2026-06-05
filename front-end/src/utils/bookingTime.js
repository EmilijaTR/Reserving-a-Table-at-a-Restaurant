export const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000;

export function toDatetimeLocalValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

/** API ISO string → value for datetime-local input */
export function isoToDatetimeLocalValue(iso) {
  return toDatetimeLocalValue(new Date(iso));
}

/** Earliest datetime-local value for customer online booking */
export function minDatetimeLocalTwoHoursAhead() {
  return toDatetimeLocalValue(new Date(Date.now() + MIN_ADVANCE_MS));
}

/** Earliest datetime-local value for owner walk-in (not in the past) */
export function minDatetimeLocalNow() {
  return toDatetimeLocalValue(new Date());
}

export function isValidCustomerBookingTime(value) {
  if (!value) return false;
  return new Date(value).getTime() >= Date.now() + MIN_ADVANCE_MS;
}