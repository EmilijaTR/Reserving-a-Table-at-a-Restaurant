const { promisePool } = require('../../DB/dbConn')

async function getEventById(eventId) {
  const [rows] = await promisePool.query(
    `SELECT e.event_id, e.restaurant_id, e.title, e.start_datetime, e.duration,
            e.description, e.guest_capacity, e.price,
            r.name AS restaurant_name
     FROM \`Event\` e
     JOIN Restaurant r ON r.restaurant_id = e.restaurant_id
     WHERE e.event_id = ?`,
    [eventId]
  )
  return rows.length ? rows[0] : null
}

async function pendingGuestsForEvent(eventId) {
  const [rows] = await promisePool.query(
    `SELECT COALESCE(SUM(guest_count), 0) AS occupied
     FROM EventReservation
     WHERE event_id = ? AND status = 'pending'`,
    [eventId]
  )
  return Number(rows[0].occupied || 0)
}

module.exports = {
  getEventById,
  pendingGuestsForEvent,
}