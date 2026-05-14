const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, getUserRole } = require('./userContext')
const { assertOwnerOwnsRestaurant } = require('./ownerRestaurant')

const router = express.Router()

router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const ownerId = getUserIdFromRequest(req)
    if (!ownerId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    const role = await getUserRole(ownerId)
    if (role !== 'o') {
      return res.status(403).json({ ok: false, message: 'Owners only.' })
    }

    const restaurantId = parseInt(String(req.params.restaurantId), 10)
    if (!Number.isFinite(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid restaurant id.' })
    }

    await assertOwnerOwnsRestaurant(ownerId, restaurantId)

    const [rows] = await promisePool.query(
      `SELECT r.reservation_id, r.user_id, r.restaurant_id, r.\`datetime\`,
              r.guest_count, r.status, r.notes, r.discount_used,
              u.name AS maker_name, u.email AS maker_email, u.role AS maker_role
       FROM Reservation r
       JOIN \`User\` u ON u.user_id = r.user_id
       WHERE r.restaurant_id = ?
       ORDER BY r.\`datetime\` DESC`,
      [restaurantId]
    )

    return res.json({ ok: true, reservations: rows })
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router