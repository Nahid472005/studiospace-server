# StudioSpace — Server API 🎬

> High-performance RESTful API powering **StudioSpace**, the Peer-to-Peer Creative Workspace & Production Studio Sharing Platform for filmmakers, photographers, musicians, podcasters, and visual artists.

---

## 🌟 Key Features & Architecture
- **JWT & HTTPOnly Cookie Authentication (Challenge 1)**: Secure session management preventing XSS attacks with automatic cookie exchange and Authorization header fallback.
- **Double-Booking Prevention Engine (Challenge 2)**: Real-time collision detection verifying time slots against existing reservations in MongoDB before confirming new bookings.
- **Full Studio CRUD & Media Handling**: Comprehensive endpoints for listing, updating, deleting, and searching studios by location, category, hourly rate, and amenities.
- **Booking Lifecycle Management**: Booking creation with initial `Pending` status, cancellation guards, and duration calculations.
- **Creator Wishlist System (Bonus)**: Save and retrieve favorite creative spaces linked to user accounts.
- **Examiner Test Credentials**: Instant login support for assignment evaluation.

---

## 🛠️ Tech Stack
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js (ES Modules)
- **Database**: MongoDB Atlas (Native MongoDB Node.js Driver)
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors`
- **Environment Management**: `dotenv`

---

## 🔐 Examiner Test Credentials
For grading and evaluation, you can use the pre-configured examiner account:
- **Email**: `examiner@studiospace.com`
- **Password**: `Examiner123!`

*(You can also register any new account; passwords require at least 1 uppercase letter, 1 lowercase letter, and minimum 6 characters).*

---

## ⚙️ Local Setup Instructions

### 1. Clone & Navigate
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `server` directory (or copy `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://nahidul472005_db_user:<YOUR_PASSWORD>@studiospace.zrcygwl.mongodb.net/StudioSpace?retryWrites=true&w=majority
JWT_SECRET=studiospace_super_secure_jwt_secret_key_2026_xyz
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

> **Note**: Replace `<YOUR_PASSWORD>` with your actual MongoDB Atlas password.

### 4. Seed Initial Data (Optional & Recommended)
Populate the database with sample creative spaces (Cyc Walls, Sound Stages, Podcast Lounges, Art Ateliers) and the Examiner test account:
```bash
npm run seed
```

### 5. Run the Server
```bash
# Production mode
npm start

# Development watch mode
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with password validation | Public |
| `POST` | `/api/auth/login` | Authenticate & set HTTPOnly JWT cookie | Public |
| `POST` | `/api/auth/google` | Sync user with Google OAuth credentials | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Protected |
| `POST` | `/api/auth/logout` | Clear auth cookie | Public |

### Studios (`/api/studios`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/studios` | List studios with search, filter, and sort | Public |
| `GET` | `/api/studios/:id` | Get single studio specifications & reviews | Public |
| `POST` | `/api/studios` | Publish a new studio listing | Protected |
| `PUT` | `/api/studios/:id` | Update existing studio listing | Protected (Owner) |
| `DELETE` | `/api/studios/:id` | Remove studio listing from MongoDB | Protected (Owner) |
| `GET` | `/api/studios/user/:email`| Get all listings owned by a specific host | Protected |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/bookings` | Reserve a studio slot (Double-Booking Protected) | Protected |
| `GET` | `/api/bookings/user/:email`| Fetch user's booking history & status | Protected |
| `PATCH` | `/api/bookings/:id/cancel`| Cancel a pending booking slot | Protected |
| `GET` | `/api/bookings/slots` | Check occupied hours for a specific date | Public |

### Wishlist (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/users/wishlist` | Toggle studio in user's saved favorites | Protected |
| `GET` | `/api/users/wishlist` | Retrieve all saved studios | Protected |
