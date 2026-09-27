const mysql = require('mysql2')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, '../certs/ca.pem')),
    rejectUnauthorized: true
  },
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