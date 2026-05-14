/** How long each reservation "occupies" capacity from its start time */
const DEFAULT_DURATION_HOURS = 2

const { promisePool } = require('../../DB/dbConn')

/** Sum guest_count for pending+completed reservations whose [start, start+duration) overlaps [newStart, newStart+duration). */
async function overlappingGuestTotal(restaurantId, newStart, durationHours = DEFAULT_DURATION_HOURS) {
  const [rows] = await promisePool.query(
    `SELECT COALESCE(SUM(guest_count), 0) AS occupied
     FROM Reservation
     WHERE restaurant_id = ?
       AND status IN ('pending', 'completed')
       AND \`datetime\` < DATE_ADD(?, INTERVAL ? HOUR)
       AND DATE_ADD(\`datetime\`, INTERVAL ? HOUR) > ?`,
    [restaurantId, newStart, durationHours, durationHours, newStart]
  )
  return Number(rows[0].occupied || 0)
}

async function getRestaurantCapacity(restaurantId) {
  const [rows] = await promisePool.query(
    'SELECT guest_capacity FROM Restaurant WHERE restaurant_id = ?',
    [restaurantId]
  )
  if (rows.length === 0) return null
  return Number(rows[0].guest_capacity)
}

module.exports = {
  DEFAULT_DURATION_HOURS,
  overlappingGuestTotal,
  getRestaurantCapacity,
}