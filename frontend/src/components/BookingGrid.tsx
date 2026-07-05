import React from 'react'

interface Slot {
  time: string
  status: 'AVAILABLE' | 'PENDING' | 'APPROVED'
}

interface Props {
  fieldName: string
  slots: Slot[]
  onSelect: (slot: Slot) => void
}

const BookingGrid: React.FC<Props> = ({ fieldName, slots, onSelect }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="font-display text-xl uppercase tracking-display text-center mb-8">
        Select Time Slot for {fieldName}
      </h3>
      {slots.length === 0 ? (
        <p className="font-mono text-[11px] text-muted italic text-center py-4">No slots available</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {slots.map((slot, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-4 border transition-all cursor-pointer ${
                slot.status === 'AVAILABLE' ? 'border-hairline hover:border-white' : 'border-hairline opacity-50 cursor-not-allowed'
              } bg-transparent`}
              onClick={() => slot.status === 'AVAILABLE' && onSelect(slot)}
            >
              <span className="font-mono text-sm uppercase">{slot.time}</span>
              <span className={`font-mono text-[10px] uppercase px-2 py-1 border ${
                slot.status === 'AVAILABLE' ? 'border-primary text-primary' : 'border-muted text-muted'
              }`}>
                {slot.status === 'AVAILABLE' ? 'Available' : 'Booked'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingGrid
