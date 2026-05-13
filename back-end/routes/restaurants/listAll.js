const express = require('express')
const { promisePool } = require('../../DB/dbConn')

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT restaurant_id, owner_id, name, address, phone, email,
              operating_hours, guest_capacity, menu, picture
       FROM Restaurant
       ORDER BY name ASC`
    )
    return res.json({ ok: true, restaurants: rows })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router