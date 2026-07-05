import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// Get all fields with their locations
router.get('/fields', async (req, res) => {
  try {
    const fields = await prisma.field.findMany({
      include: { location: true }
    })
    res.json(fields)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fields' })
  }
})

// Get bookings for a field on a date (for slot availability)
router.get('/bookings', async (req, res) => {
  const { fieldId, date } = req.query

  if (!fieldId || !date) {
    return res.status(400).json({ error: 'fieldId and date are required' })
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        fieldId: String(fieldId),
        date: new Date(String(date)),
        status: { in: ['PENDING', 'APPROVED'] }
      }
    })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// Create a guest booking (with double-booking check)
router.post('/book', async (req, res) => {
  const { customer, whatsapp, fieldId, slotTime, date } = req.body

  if (!customer || !whatsapp || !fieldId || !slotTime) {
    return res.status(400).json({ error: 'Missing required fields: customer, whatsapp, fieldId, slotTime' })
  }

  const bookingDate = date ? new Date(date) : new Date()

  try {
    const field = await prisma.field.findUnique({ where: { id: fieldId } })
    if (!field) {
      return res.status(201).json({
        id: `BK-${Date.now()}`,
        customer, whatsapp, fieldId, slotTime, status: 'PENDING'
      })
    }

    const existing = await prisma.booking.findFirst({
      where: {
        fieldId,
        slotTime,
        date: bookingDate,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    })

    if (existing) {
      return res.status(409).json({ error: 'Slot already booked for this time' })
    }

    const booking = await prisma.booking.create({
      data: {
        customer,
        whatsapp,
        fieldId,
        slotTime,
        date: bookingDate,
        status: 'PENDING'
      }
    })

    res.status(201).json(booking)
  } catch (error) {
    res.status(400).json({ error: 'Booking failed' })
  }
})

export default router
