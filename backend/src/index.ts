import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
import express from 'express'
import cors from 'cors'
import bookingRoutes from './routes/bookingRoutes'
import adminRoutes from './routes/adminRoutes'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
})
