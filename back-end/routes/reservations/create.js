const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, getUserRole } = require('./userContext')
const { assertOwnerOwnsRestaurant } = require('./ownerRestaurant')
const {
  overlappingGuestTotal,
  getRestaurantCapacity,
  DEFAULT_DURATION_HOURS,
} = require('./reservationCapacity')
const { applyDiscountPoints } = require('./points')
const { validateBookingDatetime } = require('./bookingTime')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const makerId = getUserIdFromRequest(req)
    if (!makerId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    const role = await getUserRole(makerId)
    if (role === null) {
      return res.status(404).json({ ok: false, message: 'User not found.' })
    }
    if (role !== 'c' && role !== 'o') {
      return res.status(403).json({ ok: false, message: 'Forbidden.' })
    }

    const { restaurant_id, datetime, guest_count, notes, use_discount } = req.body

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

    const start = new Date(datetime)
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid datetime. Use ISO format, e.g. 2026-05-20T19:00:00',
      })
    }

    const timeCheck = validateBookingDatetime(start, role)
    if (!timeCheck.ok) {
      return res.status(400).json({ ok: false, message: timeCheck.message })
    }

    if (role === 'o') {
      await assertOwnerOwnsRestaurant(makerId, rid)
    }

    const wantsDiscount = use_discount === true || use_discount === 1 || use_discount === 'true'
    if (wantsDiscount && role !== 'c') {
      return res.status(400).json({
        ok: false,
        message: 'Only customers can use loyalty discount.',
      })
    }

    let discountUsed = 0
    if (wantsDiscount) {
      try {
        await applyDiscountPoints(makerId)
        discountUsed = 1
      } catch (e) {
        if (e.status) {
          return res.status(e.status).json({ ok: false, message: e.message })
        }
        throw e
      }
    }

    const capacity = await getRestaurantCapacity(rid)
    if (capacity == null) {
      if (discountUsed === 1) {
        const { refundDiscountPoints } = require('./loyaltyHelpers')
        await refundDiscountPoints(makerId)
      }
      return res.status(404).json({ ok: false, message: 'Restaurant not found.' })
    }

    const occupied = await overlappingGuestTotal(rid, start, DEFAULT_DURATION_HOURS, null)
    if (occupied + guests > capacity) {
      if (discountUsed === 1) {
        const { refundDiscountPoints } = require('./loyaltyHelpers')
        await refundDiscountPoints(makerId)
      }
      return res.status(409).json({
        ok: false,
        message: 'Not enough capacity for that time window.',
        details: {
          guest_capacity: capacity,
          already_booked_guests_in_window: occupied,
          requested_guests: guests,
          window_hours: DEFAULT_DURATION_HOURS,
        },
      })
    }

    const notesVal = notes != null ? String(notes) : ''

    const [result] = await promisePool.query(
      `INSERT INTO Reservation
        (user_id, restaurant_id, \`datetime\`, guest_count, status, notes, discount_used)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [makerId, rid, start, guests, notesVal, discountUsed]
    )

    return res.status(201).json({
      ok: true,
      message: 'Reservation created.',
      reservation_id: result.insertId,
      discount_used: discountUsed === 1,
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