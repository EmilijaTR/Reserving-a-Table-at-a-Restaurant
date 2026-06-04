const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getOwnerIdFromRequest, assertOwner } = require('./ownerContext')
const { validateOperatingHours } = require('./operatingHours')

const router = express.Router()

router.put('/:id', async (req, res) => {
  try {
    const ownerId = getOwnerIdFromRequest(req)
    if (!ownerId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id (owner user_id).',
      })
    }

    await assertOwner(ownerId)

    const restaurantId = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid restaurant id.' })
    }

    const [existing] = await promisePool.query(
      'SELECT restaurant_id FROM Restaurant WHERE restaurant_id = ? AND owner_id = ?',
      [restaurantId, ownerId]
    )
    if (existing.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurant not found or not owned by you.',
      })
    }

    const {
      name,
      address,
      phone,
      email,
      operating_hours,
      guest_capacity,
      menu,
      picture,
    } = req.body

    const fields = []
    const values = []

    if (name != null) {
      fields.push('name = ?')
      values.push(name)
    }
    if (address != null) {
      fields.push('address = ?')
      values.push(address)
    }
    if (phone != null) {
      fields.push('phone = ?')
      values.push(phone)
    }
    if (email != null) {
      fields.push('email = ?')
      values.push(email)
    }
    if (operating_hours != null) {
      const hoursCheck = validateOperatingHours(operating_hours)
      if (!hoursCheck.ok) {
        return res.status(400).json({ ok: false, message: hoursCheck.message })
      }
      fields.push('operating_hours = ?')
      values.push(hoursCheck.normalized)
    }
    if (guest_capacity != null) {
      const cap = parseInt(String(guest_capacity), 10)
      if (!Number.isFinite(cap) || cap <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'guest_capacity must be a positive number.',
        })
      }
      fields.push('guest_capacity = ?')
      values.push(cap)
    }
    if (menu != null) {
      fields.push('menu = ?')
      values.push(String(menu))
    }
    if (picture != null) {
      fields.push('picture = ?')
      values.push(String(picture))
    }

    if (fields.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'No fields to update. Send at least one property.',
      })
    }

    values.push(restaurantId, ownerId)

    await promisePool.query(
      `UPDATE Restaurant SET ${fields.join(', ')}
       WHERE restaurant_id = ? AND owner_id = ?`,
      values
    )

    return res.json({ ok: true, message: 'Restaurant updated.' })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router