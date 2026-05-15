const express = require('express')
const { promisePool } = require('../../DB/dbConn')

const router = express.Router()

router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurantId = parseInt(String(req.params.restaurantId), 10)
    if (!Number.isFinite(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid restaurant id.' })
    }

    const [rows] = await promisePool.query(
      `SELECT rev.review_id, rev.user_id, rev.restaurant_id, rev.rating, rev.comment,
              u.name AS reviewer_name
       FROM Review rev
       JOIN \`User\` u ON u.user_id = rev.user_id
       WHERE rev.restaurant_id = ?
       ORDER BY rev.review_id DESC`,
      [restaurantId]
    )

    return res.json({ ok: true, reviews: rows })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router