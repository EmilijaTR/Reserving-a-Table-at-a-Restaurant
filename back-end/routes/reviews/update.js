const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('./userContext')

const router = express.Router()

router.patch('/:id', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    await assertCustomer(userId)

    const reviewId = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(reviewId) || reviewId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid review id.' })
    }

    const [rows] = await promisePool.query(
      'SELECT review_id, user_id FROM Review WHERE review_id = ?',
      [reviewId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Review not found.' })
    }
    if (rows[0].user_id !== userId) {
      return res.status(403).json({
        ok: false,
        message: 'You can only edit your own review.',
      })
    }

    const { rating, comment } = req.body
    const fields = []
    const values = []

    if (rating != null) {
      const r = parseInt(String(rating), 10)
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        return res.status(400).json({
          ok: false,
          message: 'Rating must be an integer from 1 to 5.',
        })
      }
      fields.push('rating = ?')
      values.push(r)
    }
    if (comment != null) {
      fields.push('comment = ?')
      values.push(String(comment))
    }

    if (fields.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Send rating and/or comment to update.',
      })
    }

    values.push(reviewId, userId)

    await promisePool.query(
      `UPDATE Review SET ${fields.join(', ')}
       WHERE review_id = ? AND user_id = ?`,
      values
    )

    return res.json({ ok: true, message: 'Review updated.' })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router