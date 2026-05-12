const mysql = require('mysql2')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const promisePool = pool.promise()

async function pingDatabase() {
  const [rows] = await promisePool.query('SELECT 1 AS ok')
  return rows
}

module.exports = {
  pool,
  promisePool,
  pingDatabase,
}