const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, getUserRole } = require('./userContext')
const { assertOwnerOwnsRestaurant } = require('./ownerRestaurant')

const router = express.Router()

router.patch('/:id/noShow', async (req, res) => {
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

    const reservationId = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(reservationId) || reservationId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid reservation id.' })
    }

    const [rows] = await promisePool.query(
      'SELECT reservation_id, restaurant_id, status FROM Reservation WHERE reservation_id = ?',
      [reservationId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Reservation not found.' })
    }

    const r = rows[0]
    await assertOwnerOwnsRestaurant(ownerId, r.restaurant_id)

    if (r.status !== 'pending') {
      return res.status(400).json({
        ok: false,
        message: 'Only pending reservations can be marked as no-show.',
      })
    }

    await promisePool.query(
      "UPDATE Reservation SET status = 'no-show' WHERE reservation_id = ?",
      [reservationId]
    )

    return res.json({ ok: true, message: 'Reservation marked as no-show.' })
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router