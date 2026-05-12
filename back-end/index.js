const express = require('express')

const app = express()
const port = 2653

app.get('/', (req, res) => {
  res.send('Dela :)')
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})