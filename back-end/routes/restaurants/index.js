const express = require('express')

const router = express.Router()

router.use(require('./listAll'))
router.use(require('./mine'))
router.use(require('./create'))
router.use(require('./update'))
router.use(require('./delete'))
router.use(require('./uploadFiles'))

module.exports = router