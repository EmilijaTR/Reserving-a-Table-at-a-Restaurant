const express = require('express')

const router = express.Router()

router.use(require('./create'))

module.exports = router