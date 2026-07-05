import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminCount = await prisma.admin.count()
  if (adminCount === 0) {
    const hashed = await bcrypt.hash('admin123', 10)
    await prisma.admin.create({
      data: { username: 'admin', password: hashed }
    })
    console.log('Admin seeded: admin / admin123')
  }

  const loc1 = await prisma.location.upsert({
    where: { id: 'loc-1' },
    update: {},
    create: { id: 'loc-1', name: 'Depok Branch', address: 'Jl. Margonda Raya, Depok' }
  })
  const loc2 = await prisma.location.upsert({
    where: { id: 'loc-2' },
    update: {},
    create: { id: 'loc-2', name: 'Jakarta Branch', address: 'Jl. Sudirman, Jakarta Pusat' }
  })
  const loc3 = await prisma.location.upsert({
    where: { id: 'loc-3' },
    update: {},
    create: { id: 'loc-3', name: 'Bandung Branch', address: 'Jl. Asia Afrika, Bandung' }
  })
  console.log('Locations seeded')

  const fields = [
    {
      id: 'f1', name: 'The Onyx Court', type: 'Synthetic', pricePerHour: 150000,
      locationId: loc1.id,
      image: 'https://images.unsplash.com/photo-1728781634584-24f709295ae3?q=80&w=1200&auto=format&fit=crop',
      description: 'Professional grade synthetic turf with high-impact absorption.'
    },
    {
      id: 'f2', name: 'Platinum Arena', type: 'Vinyl', pricePerHour: 120000,
      locationId: loc1.id,
      image: 'https://images.unsplash.com/photo-1630420598913-44208d36f9af?q=80&w=1200&auto=format&fit=crop',
      description: 'Industrial vinyl flooring for maximum ball speed and precision.'
    },
    {
      id: 'f3', name: 'Sovereign Court', type: 'Parquet', pricePerHour: 200000,
      locationId: loc2.id,
      image: 'https://images.unsplash.com/photo-1521217078329-f8fc1becab68?q=80&w=1200&auto=format&fit=crop',
      description: 'Elite parquet flooring, the gold standard for professional futsal.'
    },
    {
      id: 'f4', name: 'Apex Field', type: 'Synthetic', pricePerHour: 130000,
      locationId: loc2.id,
      image: 'https://images.unsplash.com/photo-1774599467191-04e2c399a117?q=80&w=1200&auto=format&fit=crop',
      description: 'Multi-purpose high-density synthetic grass.'
    },
    {
      id: 'f5', name: 'Zenith Pitch', type: 'Vinyl', pricePerHour: 140000,
      locationId: loc3.id,
      image: 'https://images.unsplash.com/photo-1776059462589-39863e08fbec?q=80&w=1200&auto=format&fit=crop',
      description: 'Boutique court experience with premium lighting.'
    },
  ]

  for (const field of fields) {
    await prisma.field.upsert({
      where: { id: field.id },
      update: { image: field.image, description: field.description },
      create: field
    })
  }
  console.log('Fields seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
