const { promisePool } = require('../../DB/dbConn')

async function assertOwnerOwnsRestaurant(ownerUserId, restaurantId) {
  const [rows] = await promisePool.query(
    'SELECT restaurant_id FROM Restaurant WHERE restaurant_id = ? AND owner_id = ?',
    [restaurantId, ownerUserId]
  )
  if (rows.length === 0) {
    const err = new Error('NOT_YOUR_RESTAURANT')
    err.status = 403
    throw err
  }
}

module.exports = {
  assertOwnerOwnsRestaurant,
}