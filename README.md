# Multi-Venue Futsal Booking System

Guest checkout futsal court booking across multiple locations, with centralized admin management.


---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, TailwindCSS 3, Zustand, react-hook-form + Zod, Framer Motion |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jsonwebtoken) + Bcrypt (bcryptjs) |

---

## Project Structure

```
UAS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Seed script (locations, fields, admin)
│   │   └── migrations/          # Auto-generated migrations
│   ├── src/
│   │   ├── index.ts             # Express server entry
│   │   ├── lib/prisma.ts        # Prisma client singleton
│   │   ├── middleware/auth.ts   # JWT verification middleware
│   │   └── routes/
│   │       ├── bookingRoutes.ts # Public booking APIs
│   │       └── adminRoutes.ts   # Admin CRUD + auth APIs
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # App entry
│   │   ├── App.tsx              # Router (landing → login → admin)
│   │   ├── StoreProvider.tsx    # Loads fields from API on mount
│   │   ├── store/useStore.ts    # Zustand state management
│   │   ├── constants/mockData.ts # Types + TIME_SLOTS constant
│   │   ├── components/
│   │   │   ├── BookingForm.tsx  # Guest checkout form
│   │   │   ├── BookingGrid.tsx  # Slot availability grid
│   │   │   ├── Navbar.tsx       # Top navigation
│   │   │   ├── UI.tsx           # Shared UI components
│   │   │   ├── Story.tsx        # Landing page sections
│   │   │   └── admin/AdminUI.tsx # Admin panel components
│   │   └── pages/
│   │       ├── LandingPage.tsx  # Public-facing booking page
│   │       ├── AuthPage.tsx     # Admin login
│   │       └── AdminDashboard.tsx # Admin management panel
│   ├── package.json
│   ├── vite.config.ts           # Proxy /api → localhost:5000
│   ├── tailwind.config.js       # Design tokens
│   └── tsconfig.json
├── DESIGN.md                    # Full design system documentation
├── PRD.md                       # Product requirement document
├── AGENTS.md                    # AI agent context
└── FutsalBookingAPI.postman_collection.json # Postman collection
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally
- npm

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Configure Database

Create `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/futsal_db"
JWT_SECRET="your-secret-key"
PORT=5000
```

### 3. Run Migrations & Seed

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

This creates:
- **3 locations** (Depok, Jakarta, Bandung)
- **5 fields** with images and descriptions
- **1 admin** account: `admin` / `admin123`

### 4. Start Development Servers

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173, new terminal)
cd frontend
npm run dev
```

Open `http://localhost:5173`.

---

## Database Schema

```
Admin (1)
    │
Location (1) ───< Field (1) ───< Booking (Many)
    │
    └───< PaymentMethod (Many)
```

| Model | Fields |
|---|---|
| **Admin** | id (UUID), username (unique), password (hashed) |
| **Location** | id (UUID), name, address |
| **Field** | id (UUID), name, type, pricePerHour, image, description, locationId (FK) |
| **Booking** | id (UUID), customer, whatsapp, status (PENDING/APPROVED/REJECTED), slotTime, date, fieldId (FK) |
| **PaymentMethod** | id (UUID), type (QRIS/Bank Transfer), details, locationId (FK) |

---

## API Endpoints

### Public (No Auth)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/bookings/fields` | All fields with locations |
| GET | `/api/bookings/bookings?fieldId=X&date=Y` | Bookings for a field on a date |
| POST | `/api/bookings/book` | Create a guest booking |

### Admin Auth (No JWT)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/seed` | Seed default admin (idempotent) |
| POST | `/api/admin/login` | Login → returns JWT |

### Admin (JWT Required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/bookings` | All bookings with field/location |
| GET | `/api/admin/fields` | All fields with locations |
| POST | `/api/admin/fields` | Create field |
| PATCH | `/api/admin/fields/:id` | Update field |
| PATCH | `/api/admin/bookings/:id/status` | Approve/reject booking |

**Request Headers for protected routes:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request/Response Examples

**POST /api/bookings/book**
```json
// Request
{
  "customer": "John Doe",
  "whatsapp": "08123456789",
  "fieldId": "f1",
  "slotTime": "08:00 - 10:00",
  "date": "2026-07-06"
}

// Response 201
{
  "id": "uuid-string",
  "customer": "John Doe",
  "whatsapp": "08123456789",
  "fieldId": "f1",
  "slotTime": "08:00 - 10:00",
  "date": "2026-07-06T00:00:00.000Z",
  "status": "PENDING"
}

// Response 409 (double booking)
{ "error": "Slot already booked for this time" }
```

**POST /api/admin/login**
```json
// Request
{ "username": "admin", "password": "admin123" }

// Response 200
{
  "token": "jwt-token-string",
  "admin": { "id": "uuid", "username": "admin" }
}
```

---

## User Flows

### Guest Booking (Visitor)

1. Landing page → view all fields
2. Select field → scheduling view with date picker
3. Click **Check Availability** → fetches real-time slot status from backend
4. Select available slot → guest checkout form
5. Fill name + WhatsApp → submit
6. Redirected to WhatsApp with pre-filled booking message

### Admin Management

1. Navigate to `/admin` → login page
2. Login with JWT → admin dashboard
3. **Bookings tab**: view all bookings, approve/reject pending ones
4. **Venues tab**: add/edit fields (name, type, price, location, image, description)
5. **Settings tab**: configuration (placeholder)



## Development Commands

### Backend

```bash
cd backend
npm run dev          # Start with nodemon + ts-node
npm run build        # Compile TypeScript
npm start            # Run compiled output
npx prisma migrate dev   # Apply schema changes
npx prisma db seed       # Seed database
npx prisma generate      # Regenerate Prisma client
```

### Frontend

```bash
cd frontend
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

---

## Postman Collection

Import `FutsalBookingAPI.postman_collection.json` into Postman. The collection includes:

- All 11 API endpoints
- Auto-save JWT token on login
- Pre-filled request bodies
- Test scripts

**Quick start:**
1. Run `POST /api/admin/seed` to create admin
2. Run `POST /api/admin/login` → token auto-saved
3. All admin endpoints use the saved token

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret key for JWT signing | `secret-key` |
| `PORT` | Server port | `5000` |

### Frontend

No `.env` needed. The Vite dev server proxies `/api` to `localhost:5000` via `vite.config.ts`.

---

## Key Features

- **Guest checkout** — no registration required
- **Real-time slot availability** — fetches from backend per field + date
- **Double-booking prevention** — backend validates before creating
- **409 conflict handling** — clear error when slot is taken
- **Admin CRUD** — full field management with image/description
- **JWT auth** — protected admin routes
- **WhatsApp deep link** — pre-filled booking message on submit
- **Graceful fallback** — works offline with local state when backend is unavailable
- **Responsive** — mobile-first design
