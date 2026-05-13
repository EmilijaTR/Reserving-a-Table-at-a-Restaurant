const path = require('path')
const express = require('express')
const cors = require('cors')
require('dotenv').config({ path: path.join(__dirname, '.env') })
require('./DB/dbConn')
const userRoutes = require('./routes/user')
const testConn = require('./routes/testConn')

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(express.json())
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

app.use('/api/testConn', testConn)

app.use('/api/user', userRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api', (_req, res) => {
  res.json({ message: 'API running' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ ok: false, message: 'Server error' })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})