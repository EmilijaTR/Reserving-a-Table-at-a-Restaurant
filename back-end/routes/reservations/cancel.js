const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest } = require('./userContext')
const { refundDiscountPoints } = require('./points')

const router = express.Router()

router.patch('/:id/cancel', async (req, res) => {
  try {
    const makerId = getUserIdFromRequest(req)
    if (!makerId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    const reservationId = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(reservationId) || reservationId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid reservation id.' })
    }

    const [rows] = await promisePool.query(
      'SELECT reservation_id, user_id, status, discount_used FROM Reservation WHERE reservation_id = ?',
      [reservationId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Reservation not found.' })
    }

    if (rows[0].user_id !== makerId) {
      return res.status(403).json({
        ok: false,
        message: 'Only the user who created the reservation can cancel it.',
      })
    }
    if (rows[0].status !== 'pending') {
      return res.status(400).json({
        ok: false,
        message: 'Only pending reservations can be cancelled.',
      })
    }

    const hadDiscount = rows[0].discount_used === 1 || rows[0].discount_used === true

    await promisePool.query(
      "UPDATE Reservation SET status = 'cancelled' WHERE reservation_id = ?",
      [reservationId]
    )

    if (hadDiscount) {
      await refundDiscountPoints(makerId)
    }

    return res.json({
      ok: true,
      message: 'Reservation cancelled.',
      points_refunded: hadDiscount ? 5 : 0,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router