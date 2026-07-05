import { create } from 'zustand'
import type { Field, Slot } from '../constants/mockData'

interface Booking {
  id: string;
  customer: string;
  whatsapp: string;
  fieldId: string;
  fieldName: string;
  slotId: string;
  slotTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

interface AppState {
  fields: Field[];
  slots: Record<string, Slot[]>;
  bookings: Booking[];

  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  setFields: (fields: Field[]) => void;
  setSlots: (slots: Record<string, Slot[]>) => void;
  addField: (field: Field) => void;
  updateField: (id: string, data: Partial<Field>) => void;
  syncFieldSlots: (fieldId: string, date?: string) => void;
  setBookings: (bookings: Booking[]) => void;
}

let nextFieldId = 6

export const useStore = create<AppState>((set, get) => ({
  fields: [],
  slots: {},
  bookings: [],

  addBooking: (booking) => set((state) => {
    const slotTime = booking.slotTime
    const slots = { ...state.slots }
    if (slots[booking.fieldId]) {
      slots[booking.fieldId] = slots[booking.fieldId].map(s =>
        s.time === slotTime ? { ...s, status: 'PENDING' as const } : s
      )
    }
    return {
      bookings: [...state.bookings, booking],
      slots
    }
  }),

  updateBookingStatus: (id, status) => set((state) => {
    const booking = state.bookings.find(b => b.id === id)
    const slots = { ...state.slots }
    if (booking && slots[booking.fieldId]) {
      slots[booking.fieldId] = slots[booking.fieldId].map(s =>
        s.time === booking.slotTime
          ? { ...s, status: status === 'APPROVED' ? 'APPROVED' as const : 'AVAILABLE' as const }
          : s
      )
    }
    return {
      bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b),
      slots
    }
  }),

  setFields: (fields) => set({ fields }),
  setSlots: (slots) => set({ slots }),

  addField: (field) => set((state) => ({
    fields: [...state.fields, { ...field, id: `f${nextFieldId++}` }]
  })),

  updateField: (id, data) => set((state) => ({
    fields: state.fields.map(f => f.id === id ? { ...f, ...data } : f)
  })),

  setBookings: (bookings) => set({ bookings }),

  syncFieldSlots: (fieldId, date) => {
    const state = get()
    const templateSlots = state.slots[fieldId]
    if (!templateSlots) return

    const bookedSlots = state.bookings
      .filter(b => b.fieldId === fieldId && b.status !== 'REJECTED' && (!date || b.date === date))

    set({
      slots: {
        ...state.slots,
        [fieldId]: templateSlots.map(s => {
          const match = bookedSlots.find(b => b.slotTime === s.time)
          if (!match) return { ...s, status: 'AVAILABLE' as const }
          return { ...s, status: match.status === 'APPROVED' ? 'APPROVED' as const : 'PENDING' as const }
        })
      }
    })
  },
}))
