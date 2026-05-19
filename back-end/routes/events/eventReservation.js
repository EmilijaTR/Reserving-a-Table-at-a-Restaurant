const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('../reviews/userContext')
const { getEventById, pendingGuestsForEvent } = require('./eventHelpers')

const router = express.Router()

router.post('/:eventId/reservations', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    await assertCustomer(userId)

    const eventId = parseInt(String(req.params.eventId), 10)
    if (!Number.isFinite(eventId) || eventId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid event id.' })
    }

    const { guest_count } = req.body
    if (guest_count == null) {
      return res.status(400).json({ ok: false, message: 'Required: guest_count.' })
    }

    const guests = parseInt(String(guest_count), 10)
    if (!Number.isFinite(guests) || guests <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'guest_count must be a positive integer.',
      })
    }

    const ev = await getEventById(eventId)
    if (!ev) {
      return res.status(404).json({ ok: false, message: 'Event not found.' })
    }

    const occupied = await pendingGuestsForEvent(eventId)
    const cap = Number(ev.guest_capacity)
    if (occupied + guests > cap) {
      return res.status(409).json({
        ok: false,
        message: 'Not enough seats left for this event.',
        details: {
          guest_capacity: cap,
          booked_guests_pending: occupied,
          requested_guests: guests,
        },
      })
    }

    const [result] = await promisePool.query(
      `INSERT INTO EventReservation (user_id, event_id, guest_count, status)
       VALUES (?, ?, ?, 'pending')`,
      [userId, eventId, guests]
    )

    return res.status(201).json({
      ok: true,
      message: 'Event seats reserved.',
      event_reservation_id: result.insertId,
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