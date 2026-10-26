# TurfBook

A full-stack sports turf and court booking platform for Bengaluru. Players can discover venues, see live hourly availability, create an account, book a slot, and cancel before game time. Venue admins get a dashboard for bookings, revenue, and court management.

The app is a single Node.js service: Express serves both the `/api` routes and the built React single-page app. That keeps local development simple and makes the project deployable to Render as one web service plus a MongoDB database.

---

## Features

### For players

- Browse six seeded venues across football, tennis, basketball, badminton, and cricket.
- Search by venue name, location, surface, or sport; filter by sport; sort by rating, price, or name.
- View a venue page with photos, amenities, pricing, opening hours, and location details.
- Pick a date up to 60 days ahead and see live hourly availability.
- Register or sign in, then book a slot with instant confirmation and a booking reference.
- View upcoming and past bookings, with totals and cancellation controls.
- Cancel a booking before its start time; the slot is released immediately.
- Demo login button for quick exploration.

### For admins

- Dashboard with total bookings, today's bookings, confirmed revenue, active venues, and player counts.
- Seven-day booking pulse and top-venue breakdown.
- Booking table with status and date filters, plus admin cancellation.
- Venue CRUD: create, edit, activate/deactivate, and delete venues.
- Delete protection for venues that still have confirmed bookings.
- Role-based access control; admin routes reject non-admin users.

### Platform

- JWT authentication with bcrypt password hashing.
- Server-side validation for dates, times, prices, and court hours.
- A unique partial MongoDB index prevents double-booking the same court, date, and hour.
- Rate limiting on API and authentication endpoints.
- Helmet security headers, JSON body limits, and centralized error handling.
- Venue-timezone-aware dates so Render's UTC clock does not mark local evening slots as past.
- Responsive layout, loading states, empty states, and accessible dialogs.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router 7, Vite 5, Lucide icons |
| Backend | Node.js 20+, Express 4 |
| Database | MongoDB with Mongoose 8 |
| Auth | JSON Web Tokens, bcryptjs |
| Styling | Hand-written CSS with responsive breakpoints |
| Deployment | Render web service, MongoDB Atlas |

---

## How it runs

```
Browser
  │
  ├── GET /                     → Express serves client/dist/index.html
  ├── GET /assets/*             → Express serves the Vite production build
  └── fetch /api/*              → Express API
                                     │
                                     └── Mongoose → MongoDB Atlas / local MongoDB
```

- In development, Vite runs on port `5173` and proxies `/api` to Express on port `5000`.
- In production, `npm run build` writes the React bundle to `client/dist`, and Express serves that folder. Deep links fall back to `index.html`, so routes such as `/courts`, `/bookings`, and `/admin` work on refresh.
- The server calls `seedDemoData()` on startup. When `SEED_DEMO` is not `false`, it creates the admin and demo users if missing, adds six venues when the venue collection is empty, and adds sample bookings when the booking collection is empty.

---

## Project structure

```
turf-book/
├── client/
│   ├── index.html
│   ├── vite.config.mjs
│   └── src/
│       ├── components/       # Navbar, footer, court cards, modal, loaders, toasts
│       ├── context/          # Auth and toast providers
│       ├── pages/            # Home, Courts, CourtDetails, Login, Register,
│       │                     # MyBookings, Admin, NotFound
│       ├── styles/           # Global, layout, page, and responsive CSS
│       ├── utils/            # Formatting, sport images, slot helpers
│       ├── api.js            # fetch wrapper and API calls
│       └── main.jsx
├── server/
│   ├── config/db.js          # Mongoose connection
│   ├── middleware/           # JWT auth, error handling
│   ├── models/               # User, Court, Booking
│   ├── routes/               # auth, courts, bookings, admin
│   ├── utils/                # timezone, slot generation, HTTP helpers
│   ├── seed.js               # Demo venues, users, and bookings
│   └── index.js              # Express app, static serving, startup
├── .env.example
├── render.yaml
└── package.json
```

---

## Local setup

### Prerequisites

- Node.js 20 or newer (`node --version`)
- npm 10 or newer
- A MongoDB instance: local MongoDB, Docker, or a free MongoDB Atlas cluster

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

Copy `.env.example` to `.env`:

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Then set at least `MONGO_URI` and `JWT_SECRET`. The defaults work with a local MongoDB on port `27017`.

### 3. Start the app

```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:5000>
- Health check: <http://localhost:5000/api/health>

On first boot the seed creates the demo venues and accounts. You can also run it manually:

```bash
npm run seed
```

### 4. Run a production build locally

```bash
npm run build
npm start
```

Open <http://localhost:5000>. Express serves the built SPA and the API from the same origin.

---

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | Yes in production | `mongodb://127.0.0.1:27017/turfbook` | MongoDB connection string. Include the database name, e.g. `.../turfbook`. |
| `JWT_SECRET` | Yes in production | Local development fallback | Secret used to sign JWTs. Production refuses to start without it. |
| `PORT` | No | `5000` | Port Express listens on. Render supplies this automatically. |
| `NODE_ENV` | No | `development` | Set to `production` on Render. |
| `TIMEZONE` | No | `Asia/Kolkata` | Venue timezone used for "today", past-slot checks, and the 60-day window. |
| `SEED_DEMO` | No | `true` | Set to `false` to skip all demo seeding. |
| `ADMIN_EMAIL` | No | `admin@turfbook.in` | Seeded admin email. |
| `ADMIN_PASSWORD` | Recommended | `Admin@1234` | Seeded admin password. Change it before sharing the site. |
| `DEMO_EMAIL` | No | `demo@turfbook.in` | Seeded demo player email. |
| `DEMO_PASSWORD` | Recommended | `Demo@1234` | Seeded demo player password. |
| `CLIENT_URL` | No | Same origin | Comma-separated allowed CORS origins if the frontend is hosted separately. |

> The **Try the demo account** button on the login page uses `demo@turfbook.in` / `Demo@1234` directly. If you change `DEMO_EMAIL` or `DEMO_PASSWORD`, update `client/src/pages/Login.jsx` as well or remove that button.

---

## Demo accounts

Seeded on first boot when `SEED_DEMO` is not `false`:

| Role | Email | Password |
| --- | --- | --- |
| Player | `demo@turfbook.in` | `Demo@1234` |
| Admin | `admin@turfbook.in` | `Admin@1234` |

The player account comes with sample bookings so the dashboard and admin tables are not empty. Change both passwords before exposing the app publicly.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the Express API and Vite dev server together. |
| `npm run dev:server` | Runs only the API with Node watch mode. |
| `npm run dev:client` | Runs only the Vite dev server. |
| `npm run seed` | Connects to MongoDB and runs the demo seed. |
| `npm run build` | Builds the React app into `client/dist`. |
| `npm start` | Starts Express and serves the built SPA and API. |
| `npm run preview` | Previews the Vite build locally. |

---

## Booking rules

- Each booking is a fixed 60-minute slot.
- Slots are generated from each venue's `openTime` and `closeTime`, for example 6:00 AM to 11:00 PM.
- Bookings are accepted from today through 60 days ahead in the configured `TIMEZONE`.
- Same-day slots that have already started are disabled and rejected by the API.
- Amount is the venue's `pricePerHour`; payment is collected at the venue (`pay_at_venue`).
- A partial unique index on `{ court, date, startTime }` where `status: "confirmed"` guarantees one active booking per slot. Cancelled bookings are excluded, so a cancelled slot can be rebooked.
- Players can cancel their own bookings before the start time. Admins can cancel any booking.
- Deleting a venue is blocked while it has confirmed bookings; deactivate it instead.

---

## API reference

All request and response bodies are JSON. Protected routes require `Authorization: Bearer <token>`.

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service and database health. |
| `GET` | `/api/courts` | List active venues. Query: `sport`, `search`, `featured=true`, `sort=recommended\|rating\|price_asc\|price_desc\|name`, `limit`. |
| `GET` | `/api/courts/:id` | Get one active venue. |
| `GET` | `/api/courts/:id/availability?date=YYYY-MM-DD` | Slot list for a date, with `available`, `booked`, and `past` flags. |

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account. Body: `name`, `email`, `password`, optional `phone`. |
| `POST` | `/api/auth/login` | Sign in. Body: `email`, `password`. Returns `token` and `user`. |
| `GET` | `/api/auth/me` | Current user. Protected. |
| `PATCH` | `/api/auth/me` | Update `name` and/or `phone`. Protected. |

### Bookings

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/bookings/mine` | Current user's bookings, newest first. Protected. |
| `POST` | `/api/bookings` | Create a booking. Body: `court`, `date`, `startTime`, optional `notes`. Protected. |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel a booking. Owner or admin only. Protected. |

### Admin

All admin routes require a valid token for a user with `role: "admin"`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/admin/stats` | Dashboard metrics, seven-day pulse, top venues, and recent bookings. |
| `GET` | `/api/admin/bookings` | Booking list with player and venue details. Query: `status`, `date`. |
| `GET` | `/api/admin/courts` | All venues, including inactive ones. |
| `POST` | `/api/admin/courts` | Create a venue. |
| `PUT` | `/api/admin/courts/:id` | Update a venue. |
| `DELETE` | `/api/admin/courts/:id` | Delete a venue when it has no confirmed bookings. |

### Error shape

```json
{ "message": "A human-readable explanation." }
```

Common status codes: `400` validation, `401` missing/expired session, `403` forbidden, `404` not found, `409` duplicate slot or email, `429` rate limited.

---

## Deploying to Render

The repository includes `render.yaml`, so Render can create the web service as a Blueprint. You still need your own Render account, a GitHub repository containing this project, and a MongoDB database.

### 1. Create a MongoDB Atlas cluster

1. Sign in at <https://www.mongodb.com/atlas> and create a free cluster.
2. Create a database user with read/write access.
3. Under **Network Access**, allow Render. The free Render plan has no fixed outbound IPs, so `0.0.0.0/0` is the practical option. Restrict it later if you upgrade to static egress.
4. Copy the connection string and add a database name, for example:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/turfbook?retryWrites=true&w=majority`
5. URL-encode special characters in the password.

### 2. Push the project to GitHub

```bash
git init
git add .
git commit -m "TurfBook booking platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/turf-book.git
git push -u origin main
```

`.env` and `client/dist` are ignored. Never commit real secrets.

### 3. Deploy on Render

1. In Render, choose **New → Blueprint** and connect the repository.
2. Render reads `render.yaml` and creates the `turfbook` web service.
3. Provide the values Render asks for:
   - `MONGO_URI`: your Atlas connection string.
   - `ADMIN_PASSWORD`: a strong admin password.
   - `DEMO_PASSWORD`: a strong demo password (or set `SEED_DEMO=false` if you do not want demo data).
4. `JWT_SECRET` is generated automatically by Render. `NODE_ENV`, `TIMEZONE`, `NODE_VERSION`, and the email values are set in the blueprint.
5. Deploy. The build command is `npm install --include=dev && npm run build`, which installs Vite even though `NODE_ENV=production`.
6. Wait for the health check at `/api/health` to report `"database": "connected"`.
7. Open the Render URL. The first boot seeds the database.

If you prefer manual setup instead of a Blueprint:

- Runtime: Node
- Build command: `npm install --include=dev && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`
- Add the same environment variables listed above.

### 4. Post-deploy checklist

- [ ] `/api/health` returns HTTP 200 with `database: "connected"`.
- [ ] The home page and `/courts` load over the Render URL.
- [ ] Demo login works, and a slot can be booked and cancelled.
- [ ] Admin login shows the dashboard at `/admin`.
- [ ] Venue cards show the correct rupee pricing and opening hours.
- [ ] If demo data should not be public, set `SEED_DEMO=false` before the first production boot and create real admin credentials.
- [ ] Replace or remove the demo login button if you changed the demo password.
- [ ] Configure an uptime monitor if you need the free instance to stay warm.

### Notes on the free plan

- Render free web services sleep after inactivity, so the first request may take tens of seconds.
- Render supplies `PORT`; do not hard-code it in production.
- A single service serves both the SPA and API, so there are no CORS or cookie-domain issues by default.

---

## Security notes

- Passwords are hashed with bcrypt and never returned by the API.
- JWT tokens expire after seven days and are validated against the current user record on every protected request.
- Admin routes require the `admin` role from the database, not just a claim in the token.
- `JWT_SECRET` must be long and random in production; the server exits if it is missing.
- Rate limits apply to `/api` globally and more strictly to login/registration.
- Helmet is enabled. Content Security Policy is disabled because the app loads remote Unsplash images; enable and configure a CSP if you self-host images.
- Change the seeded passwords before public use, and consider setting `SEED_DEMO=false` after the first deploy if you do not want sample accounts and bookings in production.
- Booking content is validated server-side; the unique partial index is the final guard against concurrent double-booking.

---

## Troubleshooting

**`JWT_SECRET is required in production`**
Set `JWT_SECRET` in the Render environment. The server refuses to start without it when `NODE_ENV=production`.

**The build fails with `vite: not found`**
Dev dependencies were skipped. Use `npm install --include=dev && npm run build` as the Render build command (already set in `render.yaml`).

**`[db] connection failed`**
Check `MONGO_URI`, the Atlas database user's password, and Atlas Network Access. Make sure the URI includes a database name such as `/turfbook`.

**No venues appear after deploy**
The seed only inserts venues when the court collection is empty, and only runs when `SEED_DEMO` is not `false`. Check the Render logs for `[seed] ready with 6 venues`. You can run `npm run seed` locally against the same Atlas URI if needed.

**Evening slots show as past**
Set `TIMEZONE=Asia/Kolkata` (or your venue's zone). Availability is evaluated in that timezone, not the server's UTC clock.

**Login works but admin pages return 403**
Use the seeded admin account, or promote a user in MongoDB by setting `role: "admin"`. Roles are read from the database on each request.

**The demo button says the account does not exist**
`SEED_DEMO` is disabled or the seed did not run. Run `npm run seed`, or sign in with the credentials you configured.

**Deep links 404 on Render**
Express serves `client/dist` and falls back to `index.html` for non-API routes. Confirm `npm run build` ran during deployment and that `client/dist` exists.

---

## Current scope and limitations

- Payments are intentionally offline: players pay at the venue and the app records `pay_at_venue`.
- Slots have a fixed 60-minute duration; there is no custom-duration booking.
- No email or SMS notifications are sent.
- Authentication uses localStorage tokens rather than HTTP-only cookies.
- There is no automated test suite committed; the booking, auth, admin, and availability flows were verified manually and with integration checks during development.

---

## License

This project was built as a full-stack demonstration. Add a license before redistributing it.
