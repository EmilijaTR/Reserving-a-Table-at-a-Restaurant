const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('../reviews/userContext')

const router = express.Router()

router.patch('/:id/cancel', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    await assertCustomer(userId)

    const id = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid id.' })
    }

    const [rows] = await promisePool.query(
      'SELECT event_res_id, user_id, status FROM EventReservation WHERE event_res_id = ?',
      [id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Booking not found.' })
    }
    if (rows[0].user_id !== userId) {
      return res.status(403).json({
        ok: false,
        message: 'You can only cancel your own booking.',
      })
    }
    if (rows[0].status !== 'pending') {
      return res.status(400).json({
        ok: false,
        message: 'Only pending bookings can be cancelled.',
      })
    }

    await promisePool.query(
      "UPDATE EventReservation SET status = 'cancelled' WHERE event_res_id = ?",
      [id]
    )

    return res.json({ ok: true, message: 'Event booking cancelled.' })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router