export interface Field {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  image: string;
  description: string;
  pricePerHour: number;
  type: 'Synthetic' | 'Vinyl' | 'Parquet';
}

export interface Slot {
  id: string;
  time: string;
  status: 'AVAILABLE' | 'PENDING' | 'APPROVED';
}

export const TIME_SLOTS: Omit<Slot, 'status'>[] = [
  { id: 's1', time: '08:00 - 10:00' },
  { id: 's2', time: '10:00 - 12:00' },
  { id: 's3', time: '12:00 - 14:00' },
  { id: 's4', time: '14:00 - 16:00' },
  { id: 's5', time: '16:00 - 18:00' },
  { id: 's6', time: '18:00 - 20:00' },
  { id: 's7', time: '20:00 - 22:00' },
  { id: 's8', time: '22:00 - 00:00' },
]
