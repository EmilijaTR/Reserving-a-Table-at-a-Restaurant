const express = require('express')
const { getEventById, pendingGuestsForEvent } = require('./eventHelpers')

const router = express.Router()

router.get('/:eventId', async (req, res) => {
  try {
    const eventId = parseInt(String(req.params.eventId), 10)
    if (!Number.isFinite(eventId) || eventId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid event id.' })
    }

    const ev = await getEventById(eventId)
    if (!ev) {
      return res.status(404).json({ ok: false, message: 'Event not found.' })
    }

    const occupied = await pendingGuestsForEvent(eventId)
    const remaining = Math.max(0, Number(ev.guest_capacity) - occupied)

    return res.json({
      ok: true,
      event: ev,
      seats: {
        guest_capacity: Number(ev.guest_capacity),
        booked_guests_pending: occupied,
        remaining_guests: remaining,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router