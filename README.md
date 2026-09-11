# 🛒 SmartStore POS: Small Store Inventory & Billing Desk Management System

A production-ready Full-Stack MERN application with Role-Based Access Control (RBAC), Point-of-Sale (POS) Billing, Atomic Real-Time Inventory Tracking, WebSockets Location Tracking, and Razorpay Online Payment Integration.

---

## 🎯 1. Problem Statement
Small offline retail store owners and departmental shops face severe daily operational bottlenecks:
1. **Slow Billing & Manual Math Errors**: Long checkout queues and calculation mistakes during peak store hours.
2. **Inventory Stock-Out Surprises**: Inaccurate stock tracking leads to selling out-of-stock items or unexpected stock depletion.
3. **No Stock Discrepancy & Audit Trail**: Lack of logs to track when, why, and by whom inventory was updated, restocked, or deducted.
4. **Disconnected Storefront & In-Store Billing**: No unified dashboard to view in-store counter bills alongside online customer delivery orders.

---

## 💡 2. The Solution & Core Value Proposition
**SmartStore POS** provides a unified, fast, and automated retail management platform:
- **Instant POS Counter Desk**: Quick barcode/SKU search, automatic tax & discount calculation, and one-click printable invoice generation.
- **Real-Time Atomic Stock Sync**: Stock is atomically deducted upon bill creation and order placement, preventing race conditions and negative inventory.
- **Stock Audit Logging**: Every inventory change (manual restock vs. sales deduction) is recorded in an immutable audit ledger.
- **Real-Time Order & Location Tracking**: WebSocket-powered live location broadcasting for delivery orders.
- **Role-Based Portals**: Dedicated, secure interfaces for Store Administrators/Cashiers and Retail Customers.

---

## 🏬 3. Real-World Use Cases
1. **In-Store Checkout Desk**: Cashiers search products, select quantities, accept Cash/Card/UPI, and generate instant bills.
2. **Online Customer Storefront**: Customers browse products by category, add items to cart, place orders, and pay online via Razorpay or Cash on Delivery.
3. **Store Manager Dashboard**: Admins review total revenue, bill volume, low-stock threshold alerts, and export sales reports as CSV.
4. **Live Delivery Tracking**: Real-time customer delivery location streaming via Socket.io.

---

## 🛠️ 4. Technology Stack

### 🖥️ Frontend
- **Core**: React 18 (Vite SPA)
- **Styling**: Tailwind CSS & Lucide React Icons
- **State Management**: React Context API (`AuthContext`, `CartContext`)
- **API Client**: Axios (with custom Interceptors & Base URLs)
- **Real-Time**: `socket.io-client`
- **Payments**: Razorpay Checkout SDK integration

### ⚙️ Backend
- **Runtime**: Node.js (ES Modules, Asynchronous Non-blocking Event Loop)
- **Web Framework**: Express.js (Modular MVC Pattern)
- **Database**: MongoDB with Mongoose ODM (Atomic queries, Schema Validation & Indexing)
- **Authentication**: JWT (JSON Web Tokens) & `bcrypt` password hashing
- **Security & Utilities**: Role-Based Access Control (RBAC), `cookie-parser`, `cors`, Node Native `crypto` (HMAC-SHA256 signature verification)
- **Media Storage**: ImageKit SDK (Direct client & backend upload handling)
- **WebSockets**: `Socket.io` for bidirectional event streaming

---

## 📂 5. File & Folder Structure

```text
stu-fd4981-small-store-inventory-and-billing-desk-1952fc/
├── backend/
│   ├── .env                           # Backend environment variables
│   ├── package.json                   # Dependencies and scripts
│   ├── server.js                      # Express setup, HTTP server & Socket.io integration
│   └── src/
│       ├── config/
│       │   ├── db.js                  # MongoDB Mongoose connection & initial auto-seeding
│       │   └── jwt.js                 # JWT secret & expiration configurations
│       ├── models/
│       │   ├── user.js                # User schema with roles ('admin', 'customer')
│       │   ├── product.js             # Product schema (SKU, price, stock, category)
│       │   ├── category.js            # Category taxonomy schema
│       │   ├── billing.js             # In-store counter POS bills schema
│       │   ├── order.js               # Online customer orders schema
│       │   └── stockAuditLog.js       # Inventory movement ledger schema
│       ├── middleware/
│       │   ├── authmiddleware.js      # JWT token verification gatekeeper
│       │   └── roleMiddleware.js      # RBAC authorization guard (e.g. authorize('admin'))
│       ├── controllers/
│       │   ├── authController.js      # Register, Login, ImageKit auth handlers
│       │   ├── admin/                 # Admin controllers (billing, products, users, dashboard, CSV export)
│       │   └── customer/              # Customer controllers (orders, profile, customer products)
│       ├── routes/
│       │   ├── authRoutes.js          # /api/auth
│       │   ├── adminRoutes.js         # /api/admin (Protected with Auth + RBAC)
│       │   ├── customerRoutes.js      # /api/customer (Protected with Auth)
│       │   └── paymentRoutes.js       # /api/payment (Razorpay order & signature verification)
│       └── utils/
│           ├── generateToken.js       # JWT token generator helper
│           └── verifySignature.js     # HMAC-SHA256 Razorpay payment signature validator
│
├── frontend/
│   ├── .env                           # Frontend environment variables (VITE_API_URL, ImageKit keys)
│   ├── package.json                   # React dependencies & build scripts
│   ├── vite.config.js                 # Vite build & bundler configuration
│   ├── index.html                     # HTML Entry
│   └── src/
│       ├── api/
│       │   └── axiosInstance.js       # Configured Axios instance with request interceptors
│       ├── context/
│       │   ├── AuthContext.jsx        # Global Auth state (user, token, login, logout, register)
│       │   └── CartContext.jsx        # Global Shopping Cart state & cart calculations
│       ├── components/
│       │   ├── Navbar.jsx             # Top navigation with role-aware action buttons
│       │   ├── ProtectedRoute.jsx     # Route guard component for role verification
│       │   └── ...                    # Reusable UI cards, tables, modal dialogs
│       ├── pages/
│       │   ├── admin/                 # Admin Desk, Billing POS, Inventory, Analytics, User Management
│       │   ├── customer/              # Storefront Catalog, Cart, Order History, Live Tracking
│       │   ├── Login.jsx              # Unified role-aware Login screen
│       │   └── Register.jsx           # Signup screen
│       ├── App.jsx                    # Route switch & context provider hierarchy
│       └── main.jsx                   # React DOM root render
│
└── README.md                          # Comprehensive project documentation
```

---

## 🔐 6. Authentication & RBAC Architecture

### 🔄 Authentication Workflow
1. **Registration & Password Hashing**:
   - User inputs details.
   - Raw password is salted and hashed using `bcrypt.hash()` before storage.
2. **Login & Token Generation**:
   - User submits credentials (`email`, `password`).
   - Server verifies credentials using `bcrypt.compare()`.
   - On match, backend signs a stateless **JSON Web Token (JWT)** containing `{ id, role }`.
3. **Client-Side Hydration**:
   - React `AuthContext` receives the token and user payload.
   - Token is attached to subsequent API requests via Axios headers (`Authorization: Bearer <token>`).
4. **Middleware Interception**:
   - `authmiddleware.js` extracts and validates the token signature using `jwt.verify()`.
   - Decoded payload is attached to `req.user`.
5. **Role-Based Authorization (RBAC)**:
   - `roleMiddleware.js` checks if `req.user.role` matches required access (`admin` vs. `customer`).
   - If unauthorized, immediately returns `403 Forbidden`.

```
[ Client (React) ] ──1. POST /api/auth/login──> [ authController ]
                                                        │
                                            2. bcrypt.compare()
                                                        │
[ Client (React) ] <──3. Returns JWT + UserInfo ────────┘
       │
4. Saved in AuthContext
       │
5. API Call -> Headers: { Authorization: "Bearer <token>" }
       │
       ▼
[ authmiddleware ] ──> 6. jwt.verify() -> Attaches req.user
       │
       ▼
[ roleMiddleware ] ──> 7. Checks req.user.role === 'admin'
       │
       ▼
[ Target Controller ] -> 8. Executes business logic & returns JSON
```

### ⚡ Rapid Development Architecture & Production Hardening
* **Current MVP Baseline**: Single 7-day JWT token with `localStorage` persistence for fast iteration and seamless single-device POS counter operations.
* **Production Hardening Path**:
  - Store tokens inside **`HttpOnly` + `Secure` + `SameSite` Cookies** to eliminate XSS token theft vectors.
  - Implement short-lived **15-minute Access Tokens** paired with **7-day Refresh Tokens** with database revocation lists.

---

## ⚡ 7. Local Runbook & Setup

### Prerequisites
- Node.js (v18+ or v20+)
- MongoDB connection URI

### 1. Backend Setup
```bash
cd backend
npm install
npm start
# Server starts on http://localhost:3001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```
