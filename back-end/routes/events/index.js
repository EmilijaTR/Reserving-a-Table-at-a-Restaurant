const express = require('express')

const router = express.Router()

router.use(require('./listByRestaurant'))
router.use(require('./eventReservation'))
router.use(require('./createEvent'))
router.use(require('./updateEvent'))
router.use(require('./deleteEvent'))
router.use(require('./getById'))

module.exports = router