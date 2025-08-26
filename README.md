````markdown
<div align="center">

# 🍽️🚁 Food & Drone Delivery Platform

![Project Banner](https://placehold.co/1280x400/2d3748/e2e8f0?text=Food+%26+Drone+Delivery+Platform)

<br/>

<img alt="Build" src="https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge" />
<img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
<img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js&logoColor=white" />
<img alt="React" src="https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img alt="Express" src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
<img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img alt="Drone" src="https://img.shields.io/badge/Drone-Integrated-6C63FF?style=for-the-badge&logoColor=white" />
<img alt="OpenWeather" src="https://img.shields.io/badge/OpenWeather-API-F2711C?style=for-the-badge&logo=openweather&logoColor=white" />

<br/>

<img alt="User" src="https://img.shields.io/badge/Module-User-2E8B57?style=flat-square" />
<img alt="Seller" src="https://img.shields.io/badge/Module-Seller-1E90FF?style=flat-square" />
<img alt="Admin" src="https://img.shields.io/badge/Module-Admin-8A2BE2?style=flat-square" />
<img alt="Drone" src="https://img.shields.io/badge/Module-Drone-6C63FF?style=flat-square" />
<img alt="CMS" src="https://img.shields.io/badge/Module-CMS-FF8C00?style=flat-square" />
<img alt="Notifications" src="https://img.shields.io/badge/Module-Notifications-FF1493?style=flat-square" />

</div>

---

### 🎥 Live Preview & Demos

- User Ordering Flow: ![User Flow Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbm91NnF2cW01dGgyaXRoejdybW03YzRsc3gwbWRzcXg1NXVxNDFwMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1KY6iQ0504M0/giphy.gif)
- Seller Product & Shop Management: ![Seller Flow Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWN1NjVrcnZ4dTZuNDUwa2s1NWlvc2RzMDZ2d3VtdmF4NGM3eG1qMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aD4grHwn8vsDnG8/giphy.gif)
- Admin Drone Control Dashboard: ![Admin Flow Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzB2M2xpbTl0NG41OHl4NG11YWV1ZHd4MG90cWF2NXVrbnF5Mmp4NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oriePW1SCdwCqxGIw/giphy.gif)
- Live Order Tracking (WebSocket): ![Live Tracking Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGFqOHl0NzlqYnh2bzN2OWJtYjgyam50azMwdWgyMGV6d3o1eHl3dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/57Y7T2I43p0I0/giphy.gif)

> Tip: Replace the links with your Loom/GIFs. Recommended GIF width: 1200px.

---

### ✨ Features

#### 👤 User
- Auth (signup/login/verify/reset), profile management
- Browse shops & products, add to cart, checkout
- Orders list & details with QR validation on delivery
- Real-time notifications (order updates, offers)
- Delivery tracking with live map/position events via WebSocket

#### 🛍️ Seller
- Auth & profile
- Shop and product CRUD with media uploads
- Offers/discounts management
- Order workflow: accept → prepare → ready for pickup
- Seller dashboard with metrics

#### 🛡️ Admin
- Auth & profile
- CMS for static pages/content
- Shop/Product/Seller approval workflows
- Analytics & audit logs
- Drone Control Center
  - Assign/launch/land/return/emergency-stop
  - Weather safety checks (OpenWeather)
  - Real-time drone & order tracking via Socket.IO
  - Live notifications to users/sellers

#### 🚁 Drone Integration
- REST/WebSocket control surface
- Mission lifecycle: assign → launch → deliver → return
- Weather gatekeeping and no-go conditions
- Telemetry streaming and status events

---

### 🧰 Tech Stack

- Frontend: React + TailwindCSS + Zustand
- Backend: Node.js + Express + MongoDB + Socket.IO
- External APIs: OpenWeather API
- Drone: hardware + REST/WebSocket integration

---

### 🗂️ Project Structure

Note: Repository uses `FoodFrontend/` and `FoodBackend/` directories (aka `frontend/` and `backend/`).

```text
backend/ (FoodBackend/)
├─ src/
│  ├─ app.js
│  ├─ index.js
│  ├─ constants.js
│  ├─ db/
│  │  └─ index.js
│  ├─ controllers/
│  │  ├─ adminController.js
│  │  ├─ sellerController.js
│  │  ├─ droneController.js
│  │  └─ notificationController.js
│  ├─ models/  (users, products, orders, drones, tokens, ...)
│  ├─ routes/
│  │  ├─ adminRoutes.js
│  │  ├─ userRoutes.js
│  │  ├─ sellerRoutes.js
│  │  └─ droneRoutes.js
│  ├─ middlewares/ (auth, rate-limit, CSRF, multer, ...)
│  ├─ services/
│  │  └─ socket.js
│  └─ utils/ (ApiError, ApiResponse, email, weatherAPI, ...)
└─ public/

frontend/ (FoodFrontend/)
├─ src/
│  ├─ components/
│  │  ├─ admin/ (Dashboard, CMS, Drone Control)
│  │  ├─ seller/ (Products, Orders, Shops)
│  │  ├─ user/ (Shops, Cart, Orders)
│  │  └─ common/ (UI, forms, modals)
│  ├─ stores/ (Zustand: authStore, appStore, notificationStore)
│  ├─ utils/ (apiInterceptor, notificationHelpers)
│  ├─ App.jsx / main.jsx
│  └─ styles: Tailwind setup
└─ public/
````

-----

### 🔌 API Overview

High-level routes (prefixes may vary):

  - Users: `POST /api/v1/users/register`, `POST /login`, `GET /me`, `PATCH /me`, `GET /orders`
  - Seller: `POST /api/v1/seller/login`, `POST /shops`, `CRUD /products`, `GET /orders`, `PATCH /orders/:id/status`
  - Admin: `GET /admin/dashboard`, `POST /admin/pages`, `POST /admin/approve`, `GET /admin/analytics`
  - Drone: `POST /drone/assign`, `POST /drone/launch`, `POST /drone/land`, `POST /drone/return`, `POST /drone/emergency-stop`, `GET /drone/:id/telemetry`
  - Notifications: `GET /notifications`, WebSocket events: `order:update`, `drone:telemetry`, `offer:new`
  - CMS: `GET /pages/:slug`, `POST /admin/pages`

Full API docs: [docs/API.md](https://www.google.com/search?q=docs/API.md) (placeholder)

\<details\>
\<summary\>WebSocket Events\</summary\>

  - `connection` / `disconnect`
  - `order:update` (status, ETA, location)
  - `drone:telemetry` (lat, lng, altitude, battery)
  - `notification:new`

\</details\>

-----

### 🖼️ Screenshots

-----

### 🚀 Setup & Installation

#### 1\) Clone & Install

```bash
git clone [https://github.com/DARSHAN2224/Drone-Delivery-for-College-Campus.git](https://github.com/DARSHAN2224/Drone-Delivery-for-College-Campus.git)
cd Drone-Delivery-for-College-Campus
```

#### 2\) Backend Setup (`FoodBackend/`)

```bash
cd FoodBackend
npm install
cp ../env.example .env      # or create .env
```

Required env variables:

```env
PORT=8000
MONGODB_URL=mongodb://127.0.0.1:27017

CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_super_strong_access_token_secret
ACCESS_TOKEN_EXPIRY = 1d

REFRESH_TOKEN_SECRET = your_super_strong_refresh_token_secret
REFRESH_TOKEN_EXPIRY = 7d

CLOUDINARY_NAME=your_cloudinary_name_here
CLOUDINARY_SECRET=your_cloudinary_api_secret_here
CLOUDINARY_KEY=your_cloudinary_api_key_here

NODE_ENV=development

SMTP_MAIL=your_email@example.com
SMTP_PASSWORD=your_email_password_or_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465

# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=your_public_vapid_key_here
VAPID_PRIVATE_KEY=your_private_vapid_key_here
VAPID_EMAIL=mailto:noreply@foodapp.com

BACKEND_URL=http://localhost:8000/api/v1
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

Run development server:

```bash
npm run dev
```

Run production build/start (example):

```bash
npm run build && npm start
```

#### 3\) Frontend Setup (`FoodFrontend/`)

```bash
cd ../FoodFrontend
npm install
```

Create `.env` (Vite):

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
```

Run development server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

#### 4\) Drone Integration

  - Ensure drone firmware/bridge exposes REST & WebSocket endpoints compatible with the server
  - Configure safety rules (weather thresholds, battery min, geo-fences)
  - Replace placeholders in Admin Drone Control UI if needed

-----

### 🧭 Environment & Configuration

  - MongoDB connection via `DB_URI`
  - JWT-based authentication with `JWT_SECRET`
  - OpenWeather API key for weather checks: `OPENWEATHER_API_KEY`
  - CORS/Origin for frontend: `CLIENT_ORIGIN`

\<details\>
\<summary\>Optional Integrations\</summary\>

  - Email Provider (SMTP/API)
  - Cloud storage/CDN for product images
  - Analytics/Logging (e.g., Sentry)

\</details\>

-----

### 🔮 Future Enhancements

  - Saved addresses + distance-based delivery fees
  - Geofencing/no-fly zones for drones
  - Soft-delete with cascade cleanup
  - Search ranking, facets, typo tolerance
  - Advanced routing for multi-drone fleets

-----

### 👥 Contributors

\<table\>
\<tr\>
\<td align="center"\>
\<a href="https://github.com/DARSHAN2224"\>
\<img src="https://www.google.com/search?q=https://avatars.githubusercontent.com/u/124701155%3Fv%3D4" width="80px;" alt=""/\>\<br /\>
\<sub\>\<b\>Darshan P\</b\>\</sub\>
\</a\>
\</td\>
\</tr\>
\</table\>

Want to contribute? See [CONTRIBUTING.md](https://www.google.com/search?q=CONTRIBUTING.md) (placeholder).

-----

### 📫 Contact

  - Email: darshan.p.dev@email.com
  - LinkedIn: [/in/pdarshan2224/](https://www.linkedin.com/in/pdarshan2224/)

-----

\<div align="center"\>

\<br/\>

\<img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" /\>

\<br/\>

Made with ❤️ for great food and faster skies.

\</div\>

```
```
