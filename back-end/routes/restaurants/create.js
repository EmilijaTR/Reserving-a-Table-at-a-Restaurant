const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getOwnerIdFromRequest, assertOwner } = require('./ownerContext')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const ownerId = getOwnerIdFromRequest(req)
    if (!ownerId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid owner user_id.',
      })
    }

    await assertOwner(ownerId)

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

    if (!name || !address || !phone || !email || !operating_hours || guest_capacity == null) {
      return res.status(400).json({
        ok: false,
        message:
          'Required: name, address, phone, email, operating_hours, guest_capacity.',
      })
    }

    const cap = parseInt(String(guest_capacity), 10)
    if (!Number.isFinite(cap) || cap <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'guest_capacity must be a positive number.',
      })
    }

    const menuVal = menu != null ? String(menu) : ''
    const pictureVal = picture != null ? String(picture) : ''

    const [result] = await promisePool.query(
      `INSERT INTO Restaurant
        (owner_id, name, address, phone, email, operating_hours, guest_capacity, menu, picture)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        name,
        address,
        phone,
        email,
        operating_hours,
        cap,
        menuVal,
        pictureVal,
      ]
    )

    return res.status(201).json({
      ok: true,
      message: 'Restaurant created.',
      restaurant_id: result.insertId,
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