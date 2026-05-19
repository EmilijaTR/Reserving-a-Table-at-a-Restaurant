const { promisePool } = require('../../DB/dbConn')

function getUserIdFromRequest(req) {
  const raw = req.headers['x-user-id']
  const id = raw != null ? parseInt(String(raw), 10) : NaN
  return Number.isFinite(id) && id > 0 ? id : null
}

async function assertCustomer(userId) {
  const [rows] = await promisePool.query(
    'SELECT role FROM `User` WHERE user_id = ?',
    [userId]
  )
  if (rows.length === 0) {
    const err = new Error('USER_NOT_FOUND')
    err.status = 404
    throw err
  }
  if (rows[0].role !== 'c') {
    const err = new Error('NOT_CUSTOMER')
    err.status = 403
    throw err
  }
}

async function getUserRole(userId) {
  const [rows] = await promisePool.query(
    'SELECT role FROM `User` WHERE user_id = ?',
    [userId]
  )
  if (rows.length === 0) return null
  return rows[0].role
}

module.exports = {
  getUserIdFromRequest,
  assertCustomer,
  getUserRole
}