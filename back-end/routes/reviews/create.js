const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('./userContext')
const { hasCompletedReservation } = require('./eligibility')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    await assertCustomer(userId)

    const { restaurant_id, rating, comment } = req.body

    if (restaurant_id == null || rating == null) {
      return res.status(400).json({
        ok: false,
        message: 'Required: restaurant_id, rating.',
      })
    }

    const rid = parseInt(String(restaurant_id), 10)
    const r = parseInt(String(rating), 10)

    if (!Number.isFinite(rid) || rid <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid restaurant_id.' })
    }

    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({
        ok: false,
        /** w frontend thhis not even possible */
        message: 'Rating must be an integer from 1 to 5.', 
      })
    }

    const [rest] = await promisePool.query(
      'SELECT restaurant_id FROM Restaurant WHERE restaurant_id = ?',
      [rid]
    )
    if (rest.length === 0) {
      return res.status(404).json({ ok: false, message: 'Restaurant not found.' })
    }

    const eligible = await hasCompletedReservation(userId, rid)
    if (!eligible) {
      return res.status(403).json({
        ok: false,
        message:
          'You can only review a restaurant after a completed reservation there.',
      })
    }

    const [existing] = await promisePool.query(
      'SELECT review_id FROM Review WHERE user_id = ? AND restaurant_id = ?',
      [userId, rid]
    )
    if (existing.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'You already reviewed this restaurant. Use update instead.',
        review_id: existing[0].review_id,
      })
    }

    const commentVal = comment != null ? String(comment) : ''

    const [result] = await promisePool.query(
      'INSERT INTO Review (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, rid, r, commentVal]
    )

    return res.status(201).json({
      ok: true,
      message: 'Review created.',
      review_id: result.insertId,
    })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        ok: false,
        message: 'You already reviewed this restaurant.',
      })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router