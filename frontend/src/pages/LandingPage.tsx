import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ButtonPrimary } from '../components/UI'
import BookingGrid from '../components/BookingGrid'
import BookingForm from '../components/BookingForm'
import { FeatureSection, StorySection } from '../components/Story'
import Navbar from '../components/Navbar'
import { useStore } from '../store/useStore'

interface Props {
  onAdminClick?: () => void
}

const LandingPage: React.FC<Props> = ({ onAdminClick }) => {
  const { fields, slots, syncFieldSlots, addBooking } = useStore()
  const [selectedField, setSelectedField] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [bookingStatus, setBookingStatus] = useState<'browsing' | 'scheduling' | 'checkout' | 'success'>('browsing')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleFieldSelect = async (field: any) => {
    setSelectedField(field)
    setBookingStatus('scheduling')
  }

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot)
    setBookingStatus('checkout')
  }

  const handleBookingComplete = () => {
    setBookingStatus('success')
  }

  return (
    <div className="bg-canvas min-h-screen text-primary selection:bg-primary selection:text-canvas overflow-x-hidden">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} onAdminClick={onAdminClick} />
      
      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6"
          >
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 font-mono text-[12px] uppercase tracking-caption text-muted hover:text-primary transition-colors"
            >
              Close ✕
            </button>
            
            <div className="flex flex-col gap-8 text-center">
              {['Home', 'Our Venues', 'The Standards', 'Store', 'Contact'].map((item, i) => (
                <motion.div 
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    if(item === 'Our Venues') document.getElementById('fields')?.scrollIntoView({ behavior: 'smooth' });
                    if(item === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="font-display text-4xl md:text-6xl uppercase tracking-display cursor-pointer hover:text-link transition-colors"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {bookingStatus === 'browsing' && (
          <motion.div 
            key="browsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Section */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
              <div className="absolute inset-0 z-0">
<motion.img 
  initial={{ scale: 1.2 }}
  animate={{ scale: 1 }}
  transition={{ duration: 2, ease: "easeOut" }}
  src="https://images.unsplash.com/photo-1630420598771-dd52ab08c8cb?q=80&w=1920&auto=format&fit=crop" 
  alt="Luxury Futsal" 
  className="w-full h-full object-cover opacity-60"
/>
              </div>
              <div className="relative z-10 max-w-4xl">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-display text-4xl md:text-6xl uppercase tracking-display leading-tight mb-4"
                >
                  The Ultimate Futsal <br />Experience
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="font-mono text-[11px] uppercase tracking-caption text-muted mb-8"
                >
                  Engineered Performance. Pure Precision.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <ButtonPrimary onClick={() => {
                    document.getElementById('fields')?.scrollIntoView({ behavior: 'smooth' });
                  }}>Book Your Slot</ButtonPrimary>
                </motion.div>
              </div>
            </section>

            {/* Story 1 */}
            <StorySection 
              image="https://plus.unsplash.com/premium_photo-1667598736309-1ea3b0fb1afa?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              text="Precision in every touch. Excellence in every game." 
            />

            {/* Features */}
            <FeatureSection 
              title="The Standards"
              items={[
                { label: 'Synthetic Turf', desc: 'High-impact absorption for professional game play.' },
                { label: 'Vinyl Flooring', desc: 'Optimized ball speed and machine-like precision.' },
                { label: 'Elite Parquet', desc: 'The gold standard of luxury futsal courts.' },
              ]}
            />

            {/* Field Directory */}
            <section id="fields" className="py-section px-6 max-w-[1280px] mx-auto">
              <h2 className="font-display text-2xl md:text-4xl uppercase tracking-display text-center mb-16">
                Our Venues
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {(fields).map((field: any) => (
                  <motion.div 
                    key={field.id} 
                    whileHover={{ y: -10 }}
                    className="group cursor-pointer" 
                    onClick={() => handleFieldSelect(field)}
                  >
                    <div className="aspect-video overflow-hidden bg-canvas rounded-none relative">
                      {field.image ? (
                        <img 
                          src={field.image} 
                          alt={field.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-card">
                          <span className="font-mono text-[11px] uppercase text-muted">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex justify-between items-end">
                      <div className="transition-colors group-hover:text-link">
                        <h3 className="font-display text-xl uppercase tracking-display">{field.name}</h3>
                        <p className="font-mono text-[11px] uppercase tracking-caption text-muted">{field.locationName || field.location}</p>
                      </div>
                      <ButtonPrimary className="px-4 py-2 h-10">Discover</ButtonPrimary>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Story 2 */}
            <StorySection 
              image="https://images.unsplash.com/photo-1695950695168-f4038b55a9ca?q=80&w=876&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              text="A legacy of luxury. A future of sport." 
            />
          </motion.div>
        )}

        {bookingStatus === 'scheduling' && selectedField && (
          <motion.section 
            key="scheduling"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pt-32 pb-section px-6 flex flex-col items-center"
          >
            <div className="mb-12 text-center">
              <p className="font-mono text-[11px] uppercase text-muted mb-2">Booking for {selectedField.locationName || selectedField.location}</p>
              <h2 className="font-display text-3xl uppercase tracking-display">{selectedField.name}</h2>
              {selectedField.pricePerHour && (
                <p className="font-mono text-[12px] text-muted mt-3">
                  Rp {selectedField.pricePerHour.toLocaleString('id-ID')} / hour
                </p>
              )}
              <ButtonPrimary className="mt-4 text-[10px] px-3 py-1 h-8" onClick={() => setBookingStatus('browsing')}>← Back</ButtonPrimary>
            </div>

            <div className="w-full max-w-2xl mx-auto mb-10">
              <div className="flex items-end gap-4 justify-center">
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted block mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border border-hairline px-4 py-3 text-primary font-mono text-sm uppercase outline-none focus:border-primary transition-colors"
                  />
                </div>
                <ButtonPrimary onClick={async () => {
                  try {
                    const res = await fetch(`/api/bookings/bookings?fieldId=${selectedField.id}&date=${selectedDate}`)
                    if (res.ok) {
                      const backendBookings = await res.json()
                      backendBookings.forEach((b: any) => addBooking({
                        id: b.id,
                        customer: b.customer,
                        whatsapp: b.whatsapp,
                        fieldId: b.fieldId,
                        fieldName: selectedField.name,
                        slotId: b.slotTime,
                        slotTime: b.slotTime,
                        status: b.status,
                        date: selectedDate
                      }))
                    }
                  } catch {}
                  syncFieldSlots(selectedField.id, selectedDate)
                }}>Check Availability</ButtonPrimary>
              </div>
            </div>

            <BookingGrid fieldName={selectedField.name} slots={slots[selectedField.id] || []} onSelect={handleSlotSelect} />
          </motion.section>
        )}

        {bookingStatus === 'checkout' && selectedSlot && (
          <motion.section 
            key="checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pt-32 pb-section px-6 flex flex-col items-center"
          >
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl uppercase tracking-display">Secure Your Slot</h2>
              <ButtonPrimary className="mt-4 text-[10px] px-3 py-1 h-8" onClick={() => setBookingStatus('scheduling')}>← Back</ButtonPrimary>
            </div>
            <BookingForm slot={selectedSlot} field={selectedField} date={selectedDate} onComplete={handleBookingComplete} />
          </motion.section>
        )}

        {bookingStatus === 'success' && (
          <motion.section 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-screen flex flex-col items-center justify-center text-center px-6"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 border border-primary rounded-full flex items-center justify-center mb-8"
            >
              <span className="text-2xl">✓</span>
            </motion.div>
            <h2 className="font-display text-4xl uppercase tracking-display mb-4">Booking Initiated</h2>
            <p className="font-text text-body max-w-md mb-12">
              Thank you for choosing the ultimate experience. Please send your payment receipt via WhatsApp to confirm your slot.
            </p>
            <ButtonPrimary onClick={() => setBookingStatus('browsing')}>Return Home</ButtonPrimary>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="py-section px-6 bg-canvas border-t border-hairline text-muted">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center">
          <div className="font-display text-[14px] uppercase tracking-wordmark text-primary mb-8">Live within sport</div>
          <p className="font-text text-sm text-center max-w-md">
            © 2026 Futsal Booking System. just created for final exam.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
