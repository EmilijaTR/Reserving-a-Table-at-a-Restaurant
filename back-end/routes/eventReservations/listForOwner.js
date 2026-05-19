const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, getUserRole } = require('../reviews/userContext')
const { assertOwnerOwnsRestaurant } = require('../reservations/ownerRestaurant')
const { getEventById } = require('../events/eventHelpers')

const router = express.Router()

router.get('/forEvent/:eventId', async (req, res) => {
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

    const [rows] = await promisePool.query(
      `SELECT er.event_res_id, er.user_id, er.event_id, er.guest_count, er.status,
              u.name AS customer_name, u.email AS customer_email
       FROM EventReservation er
       JOIN \`User\` u ON u.user_id = er.user_id
       WHERE er.event_id = ?
       ORDER BY er.event_res_id DESC`,
      [eventId]
    )

    return res.json({ ok: true, bookings: rows })
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router