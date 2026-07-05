import React, { useEffect } from 'react'
import { TIME_SLOTS, type Field } from './constants/mockData'
import { useStore } from './store/useStore'

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setFields, setSlots } = useStore()

  useEffect(() => {
    const loadFields = async () => {
      try {
        const res = await fetch('/api/bookings/fields')
        if (res.ok) {
          const data = await res.json()
          const mapped: Field[] = data.map((f: any) => ({
            id: f.id,
            name: f.name,
            locationId: f.locationId,
            locationName: f.location?.name || '',
            image: f.image || '',
            description: f.description || '',
            pricePerHour: f.pricePerHour,
            type: f.type
          }))
          setFields(mapped)

          const slotsMap: Record<string, any> = {}
          mapped.forEach(f => {
            slotsMap[f.id] = TIME_SLOTS.map(s => ({ ...s, status: 'AVAILABLE' as const }))
          })
          setSlots(slotsMap)
        }
      } catch {}
    }
    loadFields()
  }, [setFields, setSlots])

  return <>{children}</>
}
