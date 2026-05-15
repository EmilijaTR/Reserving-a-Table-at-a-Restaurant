const express = require('express')

const router = express.Router()

router.use(require('./listByRestaurant'))
router.use(require('./listMine'))
router.use(require('./create'))
router.use(require('./update'))
router.use(require('./delete'))

module.exports = router