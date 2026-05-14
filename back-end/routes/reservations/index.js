const express = require('express')

const router = express.Router()

router.use(require('./listMine'))
router.use(require('./listByRestaurant'))
router.use(require('./create'))
router.use(require('./update'))
router.use(require('./cancel'))
router.use(require('./noShow'))
router.use(require('./complete'))

module.exports = router