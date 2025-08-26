<div align="center">

# 🍽️🚁 Food & Drone Delivery Platform

![Project Banner](assets/banner.png)

<br/>

<!-- Badges -->
<img alt="Build" src="https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge" />
<img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
<img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js&logoColor=white" />
<img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img alt="Express" src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
<img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-v3-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img alt="Drone" src="https://img.shields.io/badge/Drone-Integrated-6C63FF?style=for-the-badge&logo=drone&logoColor=white" />
<img alt="OpenWeather" src="https://img.shields.io/badge/OpenWeather-API-F2711C?style=for-the-badge&logo=openweather&logoColor=white" />

<br/>

<!-- Module Tags -->
<img alt="User" src="https://img.shields.io/badge/Module-User-2E8B57?style=flat-square" />
<img alt="Seller" src="https://img.shields.io/badge/Module-Seller-1E90FF?style=flat-square" />
<img alt="Admin" src="https://img.shields.io/badge/Module-Admin-8A2BE2?style=flat-square" />
<img alt="Drone" src="https://img.shields.io/badge/Module-Drone-6C63FF?style=flat-square" />
<img alt="CMS" src="https://img.shields.io/badge/Module-CMS-FF8C00?style=flat-square" />
<img alt="Notifications" src="https://img.shields.io/badge/Module-Notifications-FF1493?style=flat-square" />

</div>

---

### 🎥 Live Preview & Demos

- User Ordering Flow: [Loom/GIF placeholder](https://example.com)
- Seller Product & Shop Management: [Loom/GIF placeholder](https://example.com)
- Admin Drone Control Dashboard: [Loom/GIF placeholder](https://example.com)
- Live Order Tracking (WebSocket): [Loom/GIF placeholder](https://example.com)

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
```

---

### 🔌 API Overview

High-level routes (prefixes may vary):

- Users: `POST /api/v1/users/register`, `POST /login`, `GET /me`, `PATCH /me`, `GET /orders`
- Seller: `POST /api/v1/seller/login`, `POST /shops`, `CRUD /products`, `GET /orders`, `PATCH /orders/:id/status`
- Admin: `GET /admin/dashboard`, `POST /admin/pages`, `POST /admin/approve`, `GET /admin/analytics`
- Drone: `POST /drone/assign`, `POST /drone/launch`, `POST /drone/land`, `POST /drone/return`, `POST /drone/emergency-stop`, `GET /drone/:id/telemetry`
- Notifications: `GET /notifications`, WebSocket events: `order:update`, `drone:telemetry`, `offer:new`
- CMS: `GET /pages/:slug`, `POST /admin/pages`

Full API docs: [docs/API.md](docs/API.md) (placeholder)

<details>
  <summary>WebSocket Events</summary>

  - `connection` / `disconnect`
  - `order:update` (status, ETA, location)
  - `drone:telemetry` (lat, lng, altitude, battery)
  - `notification:new`

</details>

---

### 🖼️ Screenshots

![User Dashboard](assets/screenshots/user-dashboard.png)

![Seller Dashboard](assets/screenshots/seller-dashboard.png)

![Admin Dashboard](assets/screenshots/admin-dashboard.png)

![Drone Control](assets/screenshots/drone-control.png)

---

### 🚀 Setup & Installation

#### 1) Clone & Install

```bash
git clone <your-repo-url> food-drone-platform
cd food-drone-platform
```

#### 2) Backend Setup (`FoodBackend/`)

```bash
cd FoodBackend
npm install
cp ../env.example .env   # or create .env
```

Required env variables:

```env
PORT=8000
DB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=replace_me
OPENWEATHER_API_KEY=replace_me
CLIENT_ORIGIN=http://localhost:5173
```

Run development server:

```bash
npm run dev
```

Run production build/start (example):

```bash
npm run build && npm start
```

#### 3) Frontend Setup (`FoodFrontend/`)

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

#### 4) Drone Integration

- Ensure drone firmware/bridge exposes REST & WebSocket endpoints compatible with the server
- Configure safety rules (weather thresholds, battery min, geo-fences)
- Replace placeholders in Admin Drone Control UI if needed

---

### 🧭 Environment & Configuration

- MongoDB connection via `DB_URI`
- JWT-based authentication with `JWT_SECRET`
- OpenWeather API key for weather checks: `OPENWEATHER_API_KEY`
- CORS/Origin for frontend: `CLIENT_ORIGIN`

<details>
  <summary>Optional Integrations</summary>

  - Email Provider (SMTP/API)
  - Cloud storage/CDN for product images
  - Analytics/Logging (e.g., Sentry)

</details>

---

### 🔮 Future Enhancements

- Saved addresses + distance-based delivery fees
- Geofencing/no-fly zones for drones
- Soft-delete with cascade cleanup
- Search ranking, facets, typo tolerance
- Advanced routing for multi-drone fleets

---

### 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/your-username">
        <img src="https://avatars.githubusercontent.com/u/000000?v=4" width="80px;" alt=""/><br />
        <sub><b>Your Name</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/collaborator-1">
        <img src="https://avatars.githubusercontent.com/u/000001?v=4" width="80px;" alt=""/><br />
        <sub><b>Collaborator 1</b></sub>
      </a>
    </td>
  </tr>
</table>

Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md) (placeholder).

---

### 📫 Contact

- Email: your.email@example.com
- X/Twitter: [@yourhandle](https://twitter.com/yourhandle)
- LinkedIn: [/in/yourprofile](https://www.linkedin.com/in/yourprofile)

---

<div align="center">

![Drone Flying](assets/drone.gif)

<br/>

<img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />

<br/>

Made with ❤️ for great food and faster skies.

</div>


