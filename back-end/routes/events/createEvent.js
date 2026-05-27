const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, getUserRole } = require('../reviews/userContext')
const { assertOwnerOwnsRestaurant } = require('../reservations/ownerRestaurant')

const router = express.Router()

router.post('/', async (req, res) => {
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

    const {
      restaurant_id,
      title,
      start_datetime,
      duration,
      description,
      guest_capacity,
      price,
    } = req.body

    if (
      restaurant_id == null ||
      !title ||
      !start_datetime ||
      duration == null ||
      guest_capacity == null ||
      price == null
    ) {
      return res.status(400).json({
        ok: false,
        message:
          'Required: restaurant_id, title, start_datetime, duration, guest_capacity, price.',
      })
    }

    const rid = parseInt(String(restaurant_id), 10)
    const dur = parseInt(String(duration), 10)
    const cap = parseInt(String(guest_capacity), 10)
    const prc = parseInt(String(price), 10)

    if (!Number.isFinite(rid) || rid <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid restaurant_id.' })
    }
    if (!Number.isFinite(dur) || dur <= 0) {
      return res.status(400).json({ ok: false, message: 'duration must be a positive integer (hours).' })
    }
    if (!Number.isFinite(cap) || cap <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'guest_capacity must be a positive integer.',
      })
    }
    if (!Number.isFinite(prc) || prc < 0) {
      return res.status(400).json({ ok: false, message: 'price must be a non-negative integer.' })
    }

    const start = new Date(start_datetime)
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid start_datetime. Use ISO format.',
      })
    }

    await assertOwnerOwnsRestaurant(ownerId, rid)

    const descVal = description != null ? String(description) : ''

    const [result] = await promisePool.query(
      `INSERT INTO \`Event\`
        (restaurant_id, title, start_datetime, duration, description, guest_capacity, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [rid, title, start, dur, descVal, cap, prc]
    )

    return res.status(201).json({
      ok: true,
      message: 'Event created.',
      event_id: result.insertId,
    })
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router