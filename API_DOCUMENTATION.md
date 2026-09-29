# API Documentation - Online Movie Ticket Booking System

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Routes (`/api/auth`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/auth/register` | `POST` | Public | Register new user or admin (`name`, `email`, `password`, `role`) |
| `/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/auth/me` | `GET` | Protected | Get logged-in user profile |

### Request Example (`POST /api/auth/register`):
```json
{
  "name": "Nandhana",
  "email": "user@moviebook.com",
  "password": "user123",
  "role": "user"
}
```

---

## 2. Movie Routes (`/api/movies`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/movies` | `GET` | Public | List movies (query: `status`, `genre`, `language`, `search`) |
| `/movies/:id` | `GET` | Public | Get single movie details |
| `/movies` | `POST` | Admin | Create movie catalog entry |
| `/movies/:id` | `PUT` | Admin | Update movie details |
| `/movies/:id` | `DELETE` | Admin | Delete movie |

---

## 3. Showtime Routes (`/api/showtimes`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/showtimes/:movieId` | `GET` | Public | Get active showtimes for a movie |
| `/showtimes/single/:id` | `GET` | Public | Get single showtime |
| `/showtimes` | `POST` | Admin | Create showtime & auto-generate seat grid |
| `/showtimes/:id` | `PUT` | Admin | Update showtime |
| `/showtimes/:id` | `DELETE` | Admin | Delete showtime and associated seats |

---

## 4. Seat Routes (`/api/seats`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/seats/:showtimeId` | `GET` | Public | Get seats map & availability for a showtime |
| `/seats/reserve` | `POST` | User | Temporarily reserve seats (10 min expiration lock) |
| `/seats/release` | `POST` | User | Release reserved seats manually |

### Request Example (`POST /api/seats/reserve`):
```json
{
  "showtimeId": "66b0f...",
  "seatNumbers": ["A1", "A2"]
}
```

---

## 5. Booking Routes (`/api/bookings`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/bookings/me` | `GET` | User | Get logged-in user's booking history |
| `/bookings/:id` | `GET` | User/Admin | Get booking ticket details |
| `/bookings/admin/all` | `GET` | Admin | View all system bookings |

---

## 6. Payment Routes (`/api/payments`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/payments/create` | `POST` | User | Create Razorpay Order ID for a pending booking |
| `/payments/verify` | `POST` | User | Verify HMAC SHA256 signature and confirm booking |
| `/payments/webhook` | `POST` | Public | Webhook listener for Razorpay payment captured events |
