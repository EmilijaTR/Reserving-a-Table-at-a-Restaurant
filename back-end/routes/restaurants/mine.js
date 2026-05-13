const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getOwnerIdFromRequest, assertOwner } = require('./ownerContext')

const router = express.Router()

router.get('/mine', async (req, res) => {
  try {
    const ownerId = getOwnerIdFromRequest(req)
    if (!ownerId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid owner user_id.',
      })
    }

    await assertOwner(ownerId)

    const [rows] = await promisePool.query(
      `SELECT restaurant_id, owner_id, name, address, phone, email,
              operating_hours, guest_capacity, menu, picture
       FROM Restaurant
       WHERE owner_id = ?
       ORDER BY name ASC`,
      [ownerId]
    )
    return res.json({ ok: true, restaurants: rows })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router