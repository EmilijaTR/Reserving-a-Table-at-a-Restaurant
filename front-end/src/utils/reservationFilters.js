export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

export function splitTableReservations(reservations) {
  const now = Date.now();
  const upcoming = [];
  const past = [];

  for (const r of reservations) {
    const at = new Date(r.datetime).getTime();
    if (r.status === "pending" && at >= now) {
      upcoming.push(r);
    } else {
      past.push(r);
    }
  }

  upcoming.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  past.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  return { upcoming, past };
}

export function splitEventBookings(bookings) {
  const now = Date.now();
  const upcoming = [];
  const past = [];

  for (const b of bookings) {
    const at = new Date(b.start_datetime).getTime();
    if (b.status === "pending" && at >= now) {
      upcoming.push(b);
    } else {
      past.push(b);
    }
  }

  upcoming.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
  past.sort((a, b) => new Date(b.start_datetime) - new Date(a.start_datetime));

  return { upcoming, past };
}

export function statusLabel(status) {
  const labels = {
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    "no-show": "No-show",
  };
  return labels[status] || status;
}
