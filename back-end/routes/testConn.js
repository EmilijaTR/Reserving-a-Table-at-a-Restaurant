const express = require('express')
const { pingDatabase } = require('../DB/dbConn')

const router = express.Router()

router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'restaurant-reservations-api' })
})

router.get('/db', async (_req, res) => {
  try {
    await pingDatabase()
    res.json({ ok: true, database: 'connected' })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      ok: false,
      database: 'error',
      message: err.message,
    })
  }
})

module.exports = router