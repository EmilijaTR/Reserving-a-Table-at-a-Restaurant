const path = require('path')
const fs = require('fs')
const multer = require('multer')

const picturesDir = path.join(__dirname, '../../uploads/restaurants/pictures')
const menusDir = path.join(__dirname, '../../uploads/restaurants/menus')

fs.mkdirSync(picturesDir, { recursive: true })
fs.mkdirSync(menusDir, { recursive: true })

function safeName(original) {
  return String(original || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80)
}

const pictureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, picturesDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${safeName(file.originalname)}`)
  },
})

const menuStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, menusDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${safeName(file.originalname)}`)
  },
})

const uploadPicture = multer({
  storage: pictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed for picture.'))
    }
    cb(null, true)
  },
})

const uploadMenu = multer({
  storage: menuStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    if (!ok) {
      return cb(new Error('Only PDF files allowed for menu.'))
    }
    cb(null, true)
  },
})

module.exports = {
  uploadPictureMiddleware: uploadPicture.single('file'),
  uploadMenuMiddleware: uploadMenu.single('file'),
}