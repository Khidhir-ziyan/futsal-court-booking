# Technical Documentation — Multi-Venue Futsal Booking System

**Author:** Khidhir (NIM: 24110400007)
**Course:** Web Advanced Development — Final Exam Project

---

## 1. System Overview

Sistem booking lapangan futsal multi-lokasi dengan guest checkout dan admin management. Pengunjung bisa langsung pesan tanpa registrasi, admin mengelola venue dan booking dari dashboard terpisah.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│  React 19 + Vite 8 + TailwindCSS 3 + Zustand       │
│  Port 5173                                          │
└──────────────────────┬──────────────────────────────┘
                       │  /api/* (Vite Proxy)
                       ▼
┌─────────────────────────────────────────────────────┐
│                   Backend (Express 5)                │
│  TypeScript + Prisma ORM + JWT Auth                  │
│  Port 5000                                          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                  PostgreSQL Database                 │
│  Admin, Location, Field, Booking, PaymentMethod      │
└─────────────────────────────────────────────────────┘
```

**Communication Flow:**
- Frontend → Vite Proxy (`/api` → `localhost:5000`) → Express API → Prisma → PostgreSQL
- Authenticated routes use `Authorization: Bearer <JWT>` header
- Guest booking langsung ke public API tanpa auth

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.x |
| Bundler | Vite | 8.x |
| Styling | TailwindCSS | 3.x |
| State Management | Zustand | 5.x |
| Form Handling | react-hook-form + Zod | 7.x / 4.x |
| Animation | Framer Motion | 12.x |
| Backend Runtime | Node.js | 18+ |
| Framework | Express | 5.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | — |
| Auth | JWT (jsonwebtoken) | 9.x |
| Password Hash | bcryptjs | 3.x |

---

## 4. Project Structure

```
uas/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.ts                # Seed data (locations, fields, admin)
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts               # Express server entry point
│   │   ├── lib/prisma.ts          # Prisma client singleton
│   │   ├── middleware/auth.ts     # JWT verification middleware
│   │   └── routes/
│   │       ├── bookingRoutes.ts   # Public booking APIs
│   │       └── adminRoutes.ts     # Admin CRUD + auth APIs
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx               # App entry
│   │   ├── App.tsx                # Router configuration
│   │   ├── StoreProvider.tsx      # Loads fields from API on mount
│   │   ├── store/useStore.ts      # Zustand global state
│   │   ├── constants/mockData.ts  # Types + TIME_SLOTS constant
│   │   ├── components/
│   │   │   ├── BookingForm.tsx    # Guest checkout form
│   │   │   ├── BookingGrid.tsx    # Slot availability grid
│   │   │   ├── Navbar.tsx         # Navigation bar
│   │   │   ├── UI.tsx             # Shared UI components
│   │   │   └── Story.tsx          # Landing page sections
│   │   └── pages/
│   │       ├── LandingPage.tsx    # Public booking page
│   │       ├── AuthPage.tsx       # Admin login
│   │       └── AdminDashboard.tsx # Admin management panel
│   ├── vite.config.ts             # Dev server + API proxy
│   ├── tailwind.config.js         # Design tokens
│   ├── package.json
│   └── tsconfig.json
└── FutsalBookingAPI.postman_collection.json
```

---

## 5. Database Schema

### Entity Relationship

```
Admin (1)
    │
Location (1) ───< Field (1) ───< Booking (Many)
    │
    └───< PaymentMethod (Many)
```

### Models

| Model | Key Fields | Notes |
|-------|-----------|-------|
| **Admin** | id (UUID), username (unique), password (bcrypt) | Seeded via `seed.ts` |
| **Location** | id (UUID), name, address | 3 lokasi default |
| **Field** | id (UUID), name, type, pricePerHour, image, description, locationId (FK) | 5 lapangan default |
| **Booking** | id (UUID), customer, whatsapp, status (PENDING/APPROVED/REJECTED), slotTime, date, fieldId (FK) | Status di-update admin |
| **PaymentMethod** | id (UUID), type (QRIS/Bank Transfer), details, locationId (FK) | Belum diimplementasi |

### Seed Data

| Location | Fields |
|----------|--------|
| Depok Branch (`loc-1`) | The Onyx Court (f1), Platinum Arena (f2) |
| Jakarta Branch (`loc-2`) | Sovereign Court (f3), Apex Field (f4) |
| Bandung Branch (`loc-3`) | Zenith Pitch (f5) |

Admin default: `admin` / `admin123`

---

## 6. API Endpoints

### Public (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/bookings/fields` | Semua field + location |
| GET | `/api/bookings/bookings?fieldId&date` | Cek slot yang sudah terisi |
| POST | `/api/bookings/book` | Buat booking guest (return 409 jika overlap) |

### Admin Auth (No JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/seed` | Seed default admin (idempotent) |

### Admin (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login → JWT token (24h expiry) |
| GET | `/api/admin/bookings` | Semua booking + field + location |
| GET | `/api/admin/fields` | Semua field + location |
| POST | `/api/admin/fields` | Buat field baru (auto-create location) |
| PATCH | `/api/admin/fields/:id` | Update field |
| PATCH | `/api/admin/bookings/:id/status` | Approve/reject booking |

### Key Request/Response

**POST /api/bookings/book**
```json
// Request
{ "customer": "John", "whatsapp": "08123456789", "fieldId": "f1",
  "slotTime": "08:00 - 10:00", "date": "2026-07-06" }

// 201 → Created booking with status PENDING
// 409 → { "error": "Slot already booked for this time" }
```

**POST /api/admin/login**
```json
// Request: { "username": "admin", "password": "admin123" }
// Response: { "token": "jwt...", "admin": { "id": "...", "username": "admin" } }
```

---

## 7. Frontend Architecture

### State Management (Zustand)

Global state di `store/useStore.ts` menyimpan:
- `fields[]` — daftar lapangan dari API
- `slots{}` — slot availability per field (keyed by fieldId)
- `bookings[]` — daftar booking

**StoreProvider** (`StoreProvider.tsx`) load fields dari `/api/bookings/fields` saat app mount. Jika backend down, fallback ke local state dengan `TIME_SLOTS` dari `mockData.ts`.

### Key Behaviors

- **Guest checkout** — Pilih field → pilih tanggal → cek slot → isi form → submit → redirect WhatsApp
- **Slot sync** — `syncFieldSlots(fieldId, date)` rekonsiliasi local slots dengan backend bookings
- **Offline fallback** — App tetap jalan tanpa backend, menggunakan local state

### Routing

| Path | Page | Auth |
|------|------|------|
| `/` | Landing page (public booking) | No |
| `/admin` | Admin login | No |
| `/admin/dashboard` | Admin dashboard | JWT |

---

## 8. Authentication Flow

```
1. Admin POST /api/admin/login → JWT token (24h)
2. Token disimpan di localStorage
3. Request ke admin endpoint sertakan header:
   Authorization: Bearer <token>
4. Backend middleware (auth.ts) verify JWT sebelum route handler
```

**Default admin credentials:** `admin` / `admin123` (dibuat via seed)

---

## 9. Development Commands

### Backend
```bash
cd backend
npm install                    # Install dependencies
npx prisma migrate dev         # Apply schema changes
npx prisma db seed             # Seed locations, fields, admin
npm run build                  # Compile TypeScript → dist/
npx tsc && node dist/index.js  # Run production
```

### Frontend
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Vite dev server (port 5173)
npm run build                  # Production build
npm run preview                # Preview production build
```

### Database
```bash
cd backend
npx prisma generate            # Regenerate Prisma client
npx prisma studio              # Open database GUI
npx prisma migrate reset        # Reset database (HATI-HATI)
```

---

## 10. Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://user:password@localhost:5432/futsal_db"
JWT_SECRET="your-secret-key"
PORT=5000
```

### Frontend
Tidak perlu `.env` — Vite proxy otomatis forward `/api` ke `localhost:5000`.

---

## 11. Key Design Decisions

| Decision | Reasoning |
|----------|-----------|
| Guest checkout tanpa registrasi | Mengurangi friction untuk booking cepat |
| Slot time hardcoded di frontend (`TIME_SLOTS`) | Slot tidak perlu diubah dari DB, cukup konsisten |
| Double-booking check di backend | Prevent race condition dari concurrent requests |
| Vite proxy untuk API | Hindari CORS issue saat development |
| WhatsApp deep link | Langsung arahkan user ke WhatsApp dengan pesan terisi |
| Fallback offline | App tetap usable tanpa backend |

---

## 12. Known Limitations

- Slot waktu hardcoded, tidak bisa dikustomisasi dari admin
- PaymentMethod model ada di schema tapi belum diimplementasi
- Tidak ada test suite
- Tidak ada rate limiting
- Tidak ada email/SMS notifikasi
- Admin password default hardcoded di seed
