const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getOwnerIdFromRequest, assertOwner } = require('./ownerContext')

const router = express.Router()

router.delete('/:id', async (req, res) => {
  try {
    const ownerId = getOwnerIdFromRequest(req)
    if (!ownerId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid owner user_id.',
      })
    }

    await assertOwner(ownerId)

    const restaurantId = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid restaurant id.' })
    }

    const [result] = await promisePool.query(
      'DELETE FROM Restaurant WHERE restaurant_id = ? AND owner_id = ?',
      [restaurantId, ownerId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurant not found or not owned by you.',
      })
    }

    return res.json({ ok: true, message: 'Restaurant deleted.' })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router