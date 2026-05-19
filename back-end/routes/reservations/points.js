const { promisePool } = require('../../DB/dbConn')

const POINTS_FOR_DISCOUNT = 5

async function getUserPointsAndRole(userId) {
  const [rows] = await promisePool.query(
    'SELECT points, role FROM `User` WHERE user_id = ?',
    [userId]
  )
  if (rows.length === 0) return null
  return { points: Number(rows[0].points), role: rows[0].role }
}

/** After owner completes +1 only if reservation maker is a customer */
async function awardPointOnComplete(reservationUserId) {
  const info = await getUserPointsAndRole(reservationUserId)
  if (!info || info.role !== 'c') {
    return { awarded: false }
  }
  await promisePool.query(
    'UPDATE `User` SET points = points + 1 WHERE user_id = ?',
    [reservationUserId]
  )
  return { awarded: true, newPoints: info.points + 1 }
}

/** Customer booking deduct 5 if enough points (transaction) */
async function applyDiscountPoints(userId) {
  const conn = await promisePool.getConnection()
  try {
    await conn.beginTransaction()

    const [rows] = await conn.query(
      'SELECT points, role FROM `User` WHERE user_id = ? FOR UPDATE',
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
    const pts = Number(rows[0].points)
    if (pts < POINTS_FOR_DISCOUNT) {
      const err = new Error('NOT_ENOUGH_POINTS')
      err.status = 400
      err.message = `Need at least ${POINTS_FOR_DISCOUNT} points to use the discount.`
      throw err
    }

    await conn.query(
      'UPDATE `User` SET points = points - ? WHERE user_id = ?',
      [POINTS_FOR_DISCOUNT, userId]
    )

    await conn.commit()
    return { pointsAfter: pts - POINTS_FOR_DISCOUNT }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

/** Refund 5 when pending reservation with discount is cancelled */
async function refundDiscountPoints(userId) {
  const info = await getUserPointsAndRole(userId)
  if (!info || info.role !== 'c') return
  await promisePool.query(
    'UPDATE `User` SET points = points + ? WHERE user_id = ?',
    [POINTS_FOR_DISCOUNT, userId]
  )
}

module.exports = {
  POINTS_FOR_DISCOUNT,
  getUserPointsAndRole,
  awardPointOnComplete,
  applyDiscountPoints,
  refundDiscountPoints,
}