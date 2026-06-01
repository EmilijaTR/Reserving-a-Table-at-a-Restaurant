const express = require('express')
const { promisePool } = require('../DB/dbConn')

const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10

const router = express.Router()

function getUserIdFromRequest(req) {
  const raw = req.headers['x-user-id']
  const id = raw != null ? parseInt(String(raw), 10) : NaN
  return Number.isFinite(id) && id > 0 ? id : null
}

router.get('/me', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Missing or invalid X-User-Id.',
      })
    }

    const [rows] = await promisePool.query(
      'SELECT user_id, name, email, role, points FROM `User` WHERE user_id = ?',
      [userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'User not found.' })
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
      'SELECT user_id FROM `User` WHERE email = ?',
      [email]
    )
    if (existing.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'Email is already registered.',
      })
    }

    const hashedPassword = await bcrypt.hash(String(password), SALT_ROUNDS)

    await promisePool.query(
      'INSERT INTO `User` (name, email, password, role, points) VALUES (?, ?, ?, ?, 0)',
      [name, email, hashedPassword, role]
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
      'SELECT user_id, name, email, password, role, points FROM `User` WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid email or password.',
      })
    }

    const u = rows[0]
    const passwordMatch = await bcrypt.compare(String(password), u.password)

    if (!passwordMatch) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid email or password.',
      })
    }

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
