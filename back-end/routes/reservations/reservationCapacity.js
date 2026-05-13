/** how long each reservation "occupies" capacity from its start time */
const DEFAULT_DURATION_HOURS = 2

const { promisePool } = require('../../DB/dbConn')

module.exports = {
  DEFAULT_DURATION_HOURS
}