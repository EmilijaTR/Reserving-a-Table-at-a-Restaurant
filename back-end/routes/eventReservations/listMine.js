const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('../reviews/userContext')

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
      `SELECT er.event_res_id, er.event_id, er.guest_count, er.status,
              e.title, e.start_datetime, e.price, e.restaurant_id,
              r.name AS restaurant_name
       FROM EventReservation er
       JOIN \`Event\` e ON e.event_id = er.event_id
       JOIN Restaurant r ON r.restaurant_id = e.restaurant_id
       WHERE er.user_id = ?
       ORDER BY e.start_datetime DESC`,
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