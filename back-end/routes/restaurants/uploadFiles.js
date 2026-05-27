const express = require('express')
const { getUserIdFromRequest, getUserRole } = require('../reviews/userContext')
const {
  uploadPictureMiddleware,
  uploadMenuMiddleware,
} = require('./uploadConfig')

const router = express.Router()

async function assertOwner(req, res) {
  const ownerId = getUserIdFromRequest(req)
  if (!ownerId) {
    res.status(401).json({ ok: false, message: 'Missing or invalid X-User-Id.' })
    return null
  }
  const role = await getUserRole(ownerId)
  if (role !== 'o') {
    res.status(403).json({ ok: false, message: 'Owners only.' })
    return null
  }
  return ownerId
}

router.post('/upload/picture', async (req, res) => {
  const ownerId = await assertOwner(req, res)
  if (!ownerId) return

  uploadPictureMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ ok: false, message: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded.' })
    }
    const publicPath = `/uploads/restaurants/pictures/${req.file.filename}`
    return res.json({
      ok: true,
      message: 'Picture uploaded.',
      path: publicPath,
      url: publicPath,
    })
  })
})

router.post('/upload/menu', async (req, res) => {
  const ownerId = await assertOwner(req, res)
  if (!ownerId) return

  uploadMenuMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ ok: false, message: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded.' })
    }
    const publicPath = `/uploads/restaurants/menus/${req.file.filename}`
    return res.json({
      ok: true,
      message: 'Menu uploaded.',
      path: publicPath,
      url: publicPath,
    })
  })
})

module.exports = router