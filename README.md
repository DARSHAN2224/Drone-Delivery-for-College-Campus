# 🍽️🚁 Food & Drone Delivery Platform

[![GitHub stars](https://img.shields.io/github/stars/DARSHAN2224/Drone-Delivery-for-College-Campus?style=social)](https://github.com/DARSHAN2224/Drone-Delivery-for-College-Campus/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/DARSHAN2224/Drone-Delivery-for-College-Campus?style=social)](https://github.com/DARSHAN2224/Drone-Delivery-for-College-Campus/network/members)
[![GitHub issues](https://img.shields.io/github/issues/DARSHAN2224/Drone-Delivery-for-College-Campus)](https://github.com/DARSHAN2224/Drone-Delivery-for-College-Campus/issues)
[![License](https://img.shields.io/github/license/DARSHAN2224/Drone-Delivery-for-College-Campus)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.5-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)

---

## 🚀 Project Overview

A comprehensive **Food Ordering & Drone Delivery Platform** designed for college campuses. This full-stack application features a multi-role system supporting **Users**, **Sellers**, and **Admins** with integrated drone delivery capabilities, real-time tracking, and advanced order management.

### 🎯 Key Features

- **Multi-Role Authentication System** (User, Seller, Admin)
- **Real-time Order Tracking** with WebSocket integration
- **Drone Delivery Integration** with weather safety checks
- **QR Code Validation** for secure delivery verification
- **Advanced Admin Dashboard** with drone control center
- **Comprehensive Testing Suite** (Unit, Integration, E2E)
- **Push Notifications** and real-time updates
- **Responsive Design** with modern UI/UX

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧩 Features

### 👤 User Features
- **Authentication**: Registration, login, email verification, password reset
- **Shop Browsing**: Browse shops, view products, add to cart
- **Order Management**: Place orders, track delivery, view history
- **Real-time Updates**: Live order status, delivery tracking via WebSocket
- **QR Validation**: Scan QR codes for delivery verification
- **Favorites & Ratings**: Save favorite items, rate products and shops
- **Notifications**: Push notifications for order updates and offers

### 🛍️ Seller Features
- **Shop Management**: Create and manage shop profiles
- **Product CRUD**: Add, edit, delete products with image uploads
- **Order Processing**: Accept, prepare, and manage orders
- **Analytics Dashboard**: Sales metrics, order statistics
- **Offer Management**: Create and manage promotional offers
- **Inventory Management**: Stock tracking and updates

### 🛡️ Admin Features
- **User Management**: Approve sellers, manage user accounts
- **Content Management**: Static pages, documentation system
- **Drone Control Center**: 
  - Launch, land, return, emergency stop drones
  - Real-time drone telemetry monitoring
  - Weather safety checks (OpenWeather API)
  - Order assignment and tracking
- **Analytics**: Comprehensive system analytics and audit logs
- **Approval Workflows**: Shop, product, and seller approvals

### 🚁 Drone Integration
- **Weather Safety**: Pre-flight weather checks via OpenWeather API
- **Real-time Tracking**: Live GPS coordinates and status updates
- **Mission Control**: Assign, launch, land, and emergency stop
- **Delivery Verification**: QR code generation and validation
- **Fallback System**: Manual delivery when drone delivery is unavailable

---

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • User Interface│    │ • REST APIs     │    │ • User Data     │
│ • Real-time UI  │    │ • WebSocket     │    │ • Orders        │
│ • State Mgmt    │    │ • Auth          │    │ • Products      │
│ • Notifications │    │ • File Upload   │    │ • Drones        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  External APIs  │
                       │                 │
                       │ • OpenWeather   │
                       │ • Email Service │
                       │ • Cloud Storage │
                       └─────────────────┘
```

---

## 🧰 Tech Stack

### Frontend (`FoodFrontend/`)
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **TailwindCSS 4.0** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router DOM** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Formik + Yup** - Form handling and validation
- **React Hot Toast** - Toast notifications
- **Leaflet** - Interactive maps
- **jsQR** - QR code scanning

### Backend (`FoodBackend/`)
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.18** - Web framework
- **MongoDB 7.5** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO 4.7** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security headers
- **Morgan** - HTTP request logging

### Development & Testing
- **Jest** - Testing framework (Backend)
- **Vitest** - Testing framework (Frontend)
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Nodemon** - Development server

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DARSHAN2224/Drone-Delivery-for-College-Campus.git
   cd Drone-Delivery-for-College-Campus
   ```

2. **Backend Setup**
   ```bash
   cd FoodBackend
   npm install
   cp ../env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../FoodFrontend
   npm install
   npm run dev
   ```

### Environment Configuration

Create `.env` files in both `FoodBackend/` and `FoodFrontend/` directories:

#### Backend Environment Variables
```env
PORT=8000
MONGODB_URL=mongodb://127.0.0.1:27017/food-drone
CORS_ORIGIN=*

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

# External Services
OPENWEATHER_API_KEY=your_openweather_api_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_SECRET=your_cloudinary_secret
CLOUDINARY_KEY=your_cloudinary_key

# Email Configuration
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465

# Push Notifications
VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key
VAPID_EMAIL=noreply@foodapp.com

# API Configuration
BACKEND_URL=http://localhost:8000/api/v1
NODE_ENV=development
```

#### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
VITE_APP_NAME=Food & Drone Delivery
```

### Running the Application

1. **Start Backend Server**
   ```bash
   npm run dev
   # Server runs on http://localhost:8000
   ```

2. **Start Frontend Development Server**
   ```bash
   cd FoodFrontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```
   
3. **Start Backend and Frontend Development Server Together**
   ```bash
   npm run start:all
   # Server runs on http://localhost:8000
   # Frontend runs on http://localhost:5173
   ```
   
4. **Run Tests**
   ```bash
   # Backend tests
   cd FoodBackend
   npm test
   
   # Frontend tests
   cd FoodFrontend
   npm test
   ```

---

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/seller/login` - Seller login
- `POST /api/v1/admin/login` - Admin login
- `POST /api/v1/users/verify-email` - Email verification
- `POST /api/v1/users/forgot-password` - Password reset

### User Endpoints
- `GET /api/v1/users/me` - Get user profile
- `PATCH /api/v1/users/me` - Update user profile
- `GET /api/v1/shops` - List shops
- `GET /api/v1/shops/:id/products` - Get shop products
- `POST /api/v1/cart` - Add to cart
- `GET /api/v1/cart` - Get cart items
- `POST /api/v1/orders` - Place order
- `GET /api/v1/orders` - Get user orders

### Seller Endpoints
- `POST /api/v1/seller/shops` - Create shop
- `PATCH /api/v1/seller/shops/:id` - Update shop
- `POST /api/v1/seller/products` - Add product
- `PATCH /api/v1/seller/products/:id` - Update product
- `DELETE /api/v1/seller/products/:id` - Delete product
- `GET /api/v1/seller/orders` - Get seller orders
- `PATCH /api/v1/seller/orders/:id/status` - Update order status

### Admin Endpoints
- `GET /api/v1/admin/dashboard` - Admin dashboard
- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/approve-seller` - Approve seller
- `GET /api/v1/admin/analytics` - System analytics
- `POST /api/v1/admin/pages` - Create static page

### Drone Endpoints
- `POST /api/v1/drone/assign` - Assign drone to order
- `POST /api/v1/drone/launch` - Launch drone
- `POST /api/v1/drone/land` - Land drone
- `POST /api/v1/drone/return` - Return drone to base
- `POST /api/v1/drone/emergency-stop` - Emergency stop
- `GET /api/v1/drone/:id/telemetry` - Get drone telemetry

### WebSocket Events
- `connection` / `disconnect` - Client connection events
- `order:update` - Order status updates
- `drone:telemetry` - Real-time drone data
- `notification:new` - New notifications

---

## 🗃 Database Schema

### Core Collections

#### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: 'user', 'seller', 'admin'),
  phone: String,
  addresses: [Address],
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Shops
```javascript
{
  name: String,
  ownerId: ObjectId (ref: 'User'),
  description: String,
  location: {
    type: String,
    coordinates: [Number, Number]
  },
  categories: [String],
  isOpen: Boolean,
  isApproved: Boolean,
  images: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### Products
```javascript
{
  shopId: ObjectId (ref: 'Shop'),
  name: String,
  description: String,
  price: Number,
  stock: Number,
  images: [String],
  category: String,
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Orders
```javascript
{
  userId: ObjectId (ref: 'User'),
  shopId: ObjectId (ref: 'Shop'),
  items: [{
    productId: ObjectId (ref: 'Product'),
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String (enum: 'pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'),
  deliveryType: String (enum: 'drone', 'manual'),
  deliveryAddress: Address,
  assignedDroneId: ObjectId (ref: 'Drone'),
  qrCode: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Drones
```javascript
{
  droneId: String (unique),
  status: String (enum: 'idle', 'assigned', 'launching', 'in-flight', 'delivering', 'returning', 'landing', 'maintenance'),
  battery: Number,
  location: {
    type: String,
    coordinates: [Number, Number]
  },
  altitude: Number,
  currentOrderId: ObjectId (ref: 'Order'),
  lastTelemetry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✅ Testing

### Backend Testing
```bash
cd FoodBackend

# Run all tests
npm test

# Run specific test suites
npm run test:api          # API tests
npm run test:unit         # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:auth         # Authentication tests
npm run test:drone        # Drone integration tests
npm run test:websocket    # WebSocket tests

# Coverage report
npm run test:coverage
```

### Frontend Testing
```bash
cd FoodFrontend

# Run all tests
npm test

# Run specific test suites
npm run test:unit         # Unit tests
npm run test:component    # Component tests
npm run test:integration  # Integration tests
npm run test:e2e          # E2E tests with Playwright

# Coverage report
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **WebSocket Tests**: Real-time communication
- **Drone Tests**: Drone control and telemetry

---

## 🚀 Deployment

### Production Build

1. **Backend Deployment**
   ```bash
   npm run build
   npm start
   ```

2. **Frontend Deployment**
   ```bash
   cd FoodFrontend
   npm run build
   # Deploy dist/ folder to your hosting service
   ```

### Environment Setup

1. **MongoDB Atlas** - Use cloud database for production
2. **Environment Variables** - Set all required environment variables
3. **SSL Certificate** - Enable HTTPS for security
4. **CORS Configuration** - Update allowed origins
5. **Rate Limiting** - Configure appropriate limits
6. **Monitoring** - Set up logging and monitoring

### Deployment Platforms

- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary, AWS S3

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   # Backend
   cd FoodBackend && npm test
   
   # Frontend
   cd FoodFrontend && npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Darshan P.** - [darshan@example.com](mailto:pdarshan2224@gmail.com)

**GitHub**: [@DARSHAN2224](https://github.com/DARSHAN2224)

**Project Link**: [https://github.com/DARSHAN2224/Drone-Delivery-for-College-Campus](https://github.com/DARSHAN2224/Drone-Delivery-for-College-Campus)

---

## 🙏 Acknowledgments

- **OpenWeather API** for weather data
- **Socket.IO** for real-time communication
- **MongoDB** for database
- **React Community** for the amazing ecosystem
- **TailwindCSS** for the utility-first CSS framework

---

<div align="center">

**Made with ❤️ for the future of food delivery**

🚁 *Flying food to your doorstep* 🍽️

</div>


