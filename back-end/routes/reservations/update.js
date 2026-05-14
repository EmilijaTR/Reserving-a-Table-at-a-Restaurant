const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest } = require('./userContext')
const {
  overlappingGuestTotal,
  getRestaurantCapacity,
  DEFAULT_DURATION_HOURS,
} = require('./reservationCapacity')

const router = express.Router()

router.patch('/:id', async (req, res) => {
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
      `SELECT reservation_id, user_id, restaurant_id, \`datetime\`, guest_count, status
       FROM Reservation
       WHERE reservation_id = ?`,
      [reservationId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Reservation not found.' })
    }

    const r = rows[0]
    if (r.user_id !== makerId) {
      return res.status(403).json({
        ok: false,
        message: 'Only the user who created the reservation can update it.',
      })
    }
    if (r.status !== 'pending') {
      return res.status(400).json({
        ok: false,
        message: 'Only pending reservations can be updated.',
      })
    }

    const { datetime, guest_count, notes } = req.body

    let nextStart = new Date(r.datetime)
    if (datetime != null) {
      nextStart = new Date(datetime)
      if (Number.isNaN(nextStart.getTime())) {
        return res.status(400).json({ ok: false, message: 'Invalid datetime.' })
      }
    }

    let nextGuests = r.guest_count
    if (guest_count != null) {
      const g = parseInt(String(guest_count), 10)
      if (!Number.isFinite(g) || g <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'guest_count must be a positive integer.',
        })
      }
      nextGuests = g
    }

    const capacity = await getRestaurantCapacity(r.restaurant_id)
    if (capacity == null) {
      return res.status(404).json({ ok: false, message: 'Restaurant not found.' })
    }

    const occupied = await overlappingGuestTotal(
      r.restaurant_id,
      nextStart,
      DEFAULT_DURATION_HOURS,
      reservationId
    )
    if (occupied + nextGuests > capacity) {
      return res.status(409).json({
        ok: false,
        message: 'Not enough capacity for that time window.',
      })
    }

    const fields = []
    const values = []

    if (datetime != null) {
      fields.push('`datetime` = ?')
      values.push(nextStart)
    }
    if (guest_count != null) {
      fields.push('guest_count = ?')
      values.push(nextGuests)
    }
    if (notes != null) {
      fields.push('notes = ?')
      values.push(String(notes))
    }

    if (fields.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'No fields to update. Send datetime, guest_count, and/or notes.',
      })
    }

    values.push(reservationId, makerId)

    await promisePool.query(
      `UPDATE Reservation SET ${fields.join(', ')}
       WHERE reservation_id = ? AND user_id = ?`,
      values
    )

    return res.json({ ok: true, message: 'Reservation updated.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router