const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, getUserRole } = require('../reviews/userContext')
const { assertOwnerOwnsRestaurant } = require('../reservations/ownerRestaurant')
const { getEventById } = require('./eventHelpers')

const router = express.Router()

router.patch('/:eventId', async (req, res) => {
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

    const eventId = parseInt(String(req.params.eventId), 10)
    if (!Number.isFinite(eventId) || eventId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid event id.' })
    }

    const ev = await getEventById(eventId)
    if (!ev) {
      return res.status(404).json({ ok: false, message: 'Event not found.' })
    }

    await assertOwnerOwnsRestaurant(ownerId, ev.restaurant_id)

    const {
      title,
      start_datetime,
      duration,
      description,
      guest_capacity,
      price,
    } = req.body

    const fields = []
    const values = []

    if (title != null) {
      fields.push('title = ?')
      values.push(String(title))
    }
    if (start_datetime != null) {
      const start = new Date(start_datetime)
      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ ok: false, message: 'Invalid start_datetime.' })
      }
      fields.push('start_datetime = ?')
      values.push(start)
    }
    if (duration != null) {
      const d = parseInt(String(duration), 10)
      if (!Number.isFinite(d) || d <= 0) {
        return res.status(400).json({ ok: false, message: 'Invalid duration.' })
      }
      fields.push('duration = ?')
      values.push(d)
    }
    if (description != null) {
      fields.push('description = ?')
      values.push(String(description))
    }
    if (guest_capacity != null) {
      const c = parseInt(String(guest_capacity), 10)
      if (!Number.isFinite(c) || c <= 0) {
        return res.status(400).json({ ok: false, message: 'Invalid guest_capacity.' })
      }
      fields.push('guest_capacity = ?')
      values.push(c)
    }
    if (price != null) {
      const p = parseInt(String(price), 10)
      if (!Number.isFinite(p) || p < 0) {
        return res.status(400).json({ ok: false, message: 'Invalid price.' })
      }
      fields.push('price = ?')
      values.push(p)
    }

    if (fields.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'No fields to update.',
      })
    }

    values.push(eventId)

    await promisePool.query(
      `UPDATE \`Event\` SET ${fields.join(', ')} WHERE event_id = ?`,
      values
    )

    return res.json({ ok: true, message: 'Event updated.' })
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router