import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ButtonPrimary } from '../components/UI'
import { useStore } from '../store/useStore'

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  whatsapp: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{7,11}$/, 'Invalid WhatsApp number format'),
})

type FormData = z.infer<typeof schema>

interface Props {
  slot: { time: string }
  field: { id: string; name: string; pricePerHour?: number }
  date: string
  onComplete: () => void
}

const BookingForm: React.FC<Props> = ({ slot, field, date, onComplete }) => {
  const { addBooking } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError('')

    let bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      const res = await fetch('/api/bookings/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: data.name,
          whatsapp: data.whatsapp,
          fieldId: field.id,
          slotTime: slot.time,
          date
        })
      })

      if (res.ok) {
        const booking = await res.json()
        bookingId = booking.id
      } else if (res.status === 409) {
        setError('This slot is already booked. Please go back and choose another time.')
        setIsSubmitting(false)
        return
      }
    } catch {
      // Backend unavailable — fall back to local booking
    }

    addBooking({
      id: bookingId,
      customer: data.name,
      whatsapp: data.whatsapp,
      fieldId: field.id,
      fieldName: field.name,
      slotId: slot.time,
      slotTime: slot.time,
      status: 'PENDING',
      date
    })

    const message = `Hello Admin, I want to book ${slot.time} for ${field.name}. Name: ${data.name}, WA: ${data.whatsapp}. Booking Code: ${bookingId}`
    window.open(`https://wa.me/628123456789?text=${encodeURIComponent(message)}`, '_blank')

    setIsSubmitting(false)
    onComplete()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <h3 className="font-display text-xl uppercase tracking-display text-center mb-8">Guest Checkout</h3>

      <div className="mb-6 p-4 border border-hairline bg-surface-card text-center">
        <p className="font-mono text-[11px] uppercase text-muted mb-1">Selected Slot</p>
        <p className="font-display text-lg uppercase tracking-display">{slot.time}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative">
          <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">Full Name</label>
          <input
            {...register('name')}
            className={`w-full bg-transparent border-b py-3 text-primary outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-hairline-strong focus:border-primary'}`}
            placeholder="Enter your name"
          />
          {errors.name && <span className="text-red-500 text-[10px] font-mono absolute -bottom-4 left-0">{errors.name.message}</span>}
        </div>

        <div className="relative">
          <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">WhatsApp Number</label>
          <input
            {...register('whatsapp')}
            type="tel"
            className={`w-full bg-transparent border-b py-3 text-primary outline-none transition-colors ${errors.whatsapp ? 'border-red-500' : 'border-hairline-strong focus:border-primary'}`}
            placeholder="628..."
          />
          {errors.whatsapp && <span className="text-red-500 text-[10px] font-mono absolute -bottom-4 left-0">{errors.whatsapp.message}</span>}
        </div>

        {error && (
          <div className="font-mono text-[11px] uppercase text-red-500 text-center">{error}</div>
        )}

        <div className="py-8 text-center">
          <p className="font-mono text-[11px] uppercase text-muted mb-4">
            Payment methods based on location: <span className="text-primary">QRIS / Bank Transfer</span>
          </p>
          <ButtonPrimary isLoading={isSubmitting} className="w-full">Confirm & Pay via WA</ButtonPrimary>
        </div>
      </form>
    </motion.div>
  )
}

export default BookingForm
