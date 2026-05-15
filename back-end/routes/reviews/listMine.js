const express = require('express')
const { promisePool } = require('../../DB/dbConn')
const { getUserIdFromRequest, assertCustomer } = require('./userContext')

const router = express.Router()

router.get('/mine', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    await assertCustomer(userId)

    const [rows] = await promisePool.query(
      `SELECT rev.review_id, rev.restaurant_id, rev.rating, rev.comment,
              rest.name AS restaurant_name
       FROM Review rev
       JOIN Restaurant rest ON rest.restaurant_id = rev.restaurant_id
       WHERE rev.user_id = ?
       ORDER BY rev.review_id DESC`,
      [userId]
    )

    return res.json({ ok: true, reviews: rows })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ ok: false, message: err.message })
    }
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router