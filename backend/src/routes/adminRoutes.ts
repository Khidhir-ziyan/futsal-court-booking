import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { verifyJWT } from '../middleware/auth'

const router = Router()

// ---- Public admin routes (no JWT) ----

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { username } })
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    )

    res.json({ token, admin: { id: admin.id, username: admin.username } })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// Seed default admin (safe — only creates if no admins exist)
router.post('/seed', async (req, res) => {
  try {
    const existing = await prisma.admin.count()
    if (existing > 0) {
      return res.json({ message: 'Admin already exists' })
    }

    const hashed = await bcrypt.hash('admin123', 10)
    const admin = await prisma.admin.create({
      data: { username: 'admin', password: hashed }
    })

    res.status(201).json({ message: 'Default admin created', username: admin.username })
  } catch (error) {
    res.status(500).json({ error: 'Seed failed' })
  }
})

// ---- Protected admin routes (require JWT) ----
router.use(verifyJWT)

// Get all bookings (for admin dashboard)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { field: { include: { location: true } } },
      orderBy: { date: 'desc' }
    })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// Get all fields with locations
router.get('/fields', async (req, res) => {
  try {
    const fields = await prisma.field.findMany({
      include: { location: true },
      orderBy: { name: 'asc' }
    })
    res.json(fields)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fields' })
  }
})

// Create a new field (location is free text)
router.post('/fields', async (req, res) => {
  const { name, type, pricePerHour, locationName, image, description } = req.body

  if (!name || !type || !pricePerHour || !locationName) {
    return res.status(400).json({ error: 'All fields are required: name, type, pricePerHour, locationName' })
  }

  try {
    let location = await prisma.location.findFirst({ where: { name: locationName } })
    if (!location) {
      location = await prisma.location.create({
        data: { name: locationName, address: locationName }
      })
    }

    const field = await prisma.field.create({
      data: {
        name,
        type,
        pricePerHour: parseFloat(pricePerHour),
        locationId: location.id,
        image: image || '',
        description: description || ''
      },
      include: { location: true }
    })
    res.status(201).json(field)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create field' })
  }
})

// Update a field
router.patch('/fields/:id', async (req, res) => {
  const { id } = req.params
  const { name, type, pricePerHour, locationName, image, description } = req.body

  try {
    const data: any = {}
    if (name !== undefined) data.name = name
    if (type !== undefined) data.type = type
    if (pricePerHour !== undefined) data.pricePerHour = parseFloat(pricePerHour)
    if (image !== undefined) data.image = image
    if (description !== undefined) data.description = description

    if (locationName !== undefined) {
      let location = await prisma.location.findFirst({ where: { name: locationName } })
      if (!location) {
        location = await prisma.location.create({
          data: { name: locationName, address: locationName }
        })
      }
      data.locationId = location.id
    }

    const field = await prisma.field.update({
      where: { id },
      data,
      include: { location: true }
    })
    res.json(field)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update field' })
  }
})

// Update booking status (Approve/Reject)
router.patch('/bookings/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body // 'APPROVED' | 'REJECTED'
  
  try {
    const updated = await prisma.booking.update({
      where: { id },
      data: { status }
    })
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: 'Update failed' })
  }
})

export default router
