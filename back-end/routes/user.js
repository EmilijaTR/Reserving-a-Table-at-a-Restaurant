const express = require('express')
const { promisePool } = require('../DB/dbConn')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        ok: false,
        message: 'Name, email, password and role are required.',
      })
    }

    if (role !== 'c' && role !== 'o') {
      return res.status(400).json({
        ok: false,
        message: 'Role must be "c" (customer) or "o" (owner).',
      })
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        ok: false,
        message: 'Password must be at least 8 characters.',
      })
    }

    const [existing] = await promisePool.query(
      'SELECT user_id FROM User WHERE email = ?',
      [email]
    )
    if (existing.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'Email is already registered.',
      })
    }

    await promisePool.query(
      'INSERT INTO User (name, email, password, role, points) VALUES (?, ?, ?, ?, 0)',
      [name, email, password, role]
    )

    return res.status(201).json({
      ok: true,
      message: 'Registration successful.',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email and password are required.',
      })
    }

    const [rows] = await promisePool.query(
      'SELECT user_id, name, email, password, role, points FROM User WHERE email = ?',
      [email]
    )

    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid email or password.',
      })
    }

    const u = rows[0]
    return res.json({
      ok: true,
      user: {
        user_id: u.user_id,
        name: u.name,
        email: u.email,
        role: u.role,
        points: u.points,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error.' })
  }
})

module.exports = router