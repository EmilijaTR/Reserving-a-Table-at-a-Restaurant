const { promisePool } = require('../../DB/dbConn')

/** customer must have at least one completed reservation at this restaurant */
async function hasCompletedReservation(userId, restaurantId) {
  const [rows] = await promisePool.query(
    `SELECT 1
     FROM Reservation
     WHERE user_id = ? AND restaurant_id = ? AND status = 'completed'
     LIMIT 1`,
    [userId, restaurantId]
  )
  return rows.length > 0
}

module.exports = {
  hasCompletedReservation,
}