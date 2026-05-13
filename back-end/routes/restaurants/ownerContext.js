const { promisePool } = require('../../DB/dbConn')

function getOwnerIdFromRequest(req) {
  const id = Number.parseInt(req.headers['x-user-id'], 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

async function assertOwner(userId) {
  const [rows] = await promisePool.query(
    'SELECT user_id, role FROM `User` WHERE user_id = ?',
    [userId]
  )
  if (rows.length === 0) {
    const err = new Error('USER_NOT_FOUND')
    err.status = 404
    throw err
  }
  if (rows[0].role !== 'o') {
    const err = new Error('NOT_OWNER')
    err.status = 403
    throw err
  }
}

module.exports = {
  getOwnerIdFromRequest,
  assertOwner,
}