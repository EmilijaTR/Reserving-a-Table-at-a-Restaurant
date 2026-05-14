const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('./userContext')

const router = express.Router()

router.get('/mine', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    await assertCustomer(userId)

    const [rows] = await promisePool.query(
      `SELECT r.reservation_id, r.restaurant_id, r.\`datetime\`, r.guest_count,
              r.status, r.notes, r.discount_used,
              rest.name AS restaurant_name
       FROM Reservation r
       JOIN Restaurant rest ON rest.restaurant_id = r.restaurant_id
       WHERE r.user_id = ?
       ORDER BY r.\`datetime\` DESC`,
      [userId]
    )

    return res.json({ ok: true, reservations: rows })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router