const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('./userContext')
const {
  DEFAULT_DURATION_HOURS,
} = require('./reservationCapacity')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid customer user_id.',
      })
    }

    await assertCustomer(userId)

    const { restaurant_id, datetime, guest_count, notes } = req.body

    if (restaurant_id == null || !datetime || guest_count == null) {
      return res.status(400).json({
        ok: false,
        message: 'Required: restaurant_id, datetime, guest_count.',
      })
    }

    const rid = parseInt(String(restaurant_id), 10)
    const guests = parseInt(String(guest_count), 10)
    if (!Number.isFinite(rid) || rid <= 0 || !Number.isFinite(guests) || guests <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'restaurant_id and guest_count must be positive integers.',
      })
    }



    const [result] = await promisePool.query(
      `INSERT INTO Reservation
        (user_id, restaurant_id, datetime, guest_count, status, notes, discount_used)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [userId, rid, start, guests, notesVal, discountUsed]
    )

    return res.status(201).json({
      ok: true,
      message: 'Reservation created.',
      reservation_id: result.insertId,
    })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router