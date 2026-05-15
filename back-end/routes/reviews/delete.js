const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('./userContext')

const router = express.Router()

router.delete('/:id', async (req, res) => {
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

    const [result] = await promisePool.query(
      'DELETE FROM Review WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Review not found or not yours.',
      })
    }

    return res.json({ ok: true, message: 'Review deleted.' })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router