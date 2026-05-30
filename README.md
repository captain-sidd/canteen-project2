# 🍔 Canteen Management System

A modern full-stack canteen ordering and management platform built using **FastAPI**, **MongoDB**, **React Native (Expo)**, and **React Navigation**. The system allows users to browse menu items, place food orders, manage carts, track order status, scan QR codes, and access wallet/profile features.

---

# 📌 Project Overview

The Canteen Management System is designed to digitize and simplify food ordering operations in a college or institutional canteen environment. The platform provides a smooth and modern food-ordering experience similar to commercial food delivery applications.

The system consists of:

- A production-ready FastAPI backend
- MongoDB database integration
- React Native mobile frontend
- QR-based order verification system
- Dynamic menu and combo management
- Wallet and payment architecture
- User authentication and authorization

---

# 🚀 Features

## 👤 User Features

- User Registration and Login
- JWT Authentication
- Browse Menu Items
- Search and Filter Food
- View Trending and Featured Items
- Combo Offers
- Add to Cart
- Place Orders
- QR Code Order Verification
- Order Tracking
- Wallet System (UI Integrated)
- Profile Management
- View Order History
- Repeat Order Functionality

---

## 🍱 Menu Features

- Dynamic Menu Management
- Category-Based Filtering
- Veg/Non-Veg Support
- Trending and Special Items
- Food Ratings
- Preparation Time Display
- Discounted Pricing
- Combo Management

---

## 📦 Order Features

- Real-Time Order Placement
- QR Code Generation
- Order Status Tracking
- Payment Method Selection
- Receipt and QR View
- Order History
- Live Status Architecture

---

## 💳 Wallet Features

- Wallet Balance
- Wallet Recharge Architecture
- Transaction History Structure
- Future Payment Integration Ready

---

## 🛠️ Admin/Backend Features

- FastAPI REST APIs
- MongoDB Integration
- Production-Grade Schema Design
- Modular Backend Architecture
- Role-Based Access Support
- Pagination and Filtering
- Scalable API Structure
- Swagger API Documentation

---

# 🧱 Tech Stack

## Frontend

- React Native
- Expo
- React Navigation
- Axios
- AsyncStorage

---

## Backend

- FastAPI
- Python
- Pydantic v2
- Uvicorn
- JWT Authentication

---

## Database

- MongoDB

---

## Tools & Platforms

- GitHub
- VS Code
- Postman / Swagger UI
- Expo Go

---

# 📂 Project Structure

```text
canteen-system/
│
├── canteen-backend/
│   ├── app/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│
├── canteen-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── context/
│   │   └── assets/
│   └── App.js
│
└── README.md
```

---

# ⚙️ Backend Setup

## 1️⃣ Navigate to Backend

```bash
cd canteen-backend
```

---

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

---

## 3️⃣ Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

---

## 4️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 5️⃣ Run Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0
```

---

## 6️⃣ Swagger Documentation

Open:

```text
http://127.0.0.1:8000/docs
```

---

# 📱 Frontend Setup

## 1️⃣ Navigate to Frontend

```bash
cd canteen-frontend
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Start Expo Server

```bash
npm start
```

---

## 4️⃣ Run on Android

```bash
npm run android
```

OR scan QR using Expo Go.

---

# 🗄️ Database Collections

The project uses the following MongoDB collections:

- users
- menu_items
- combos
- orders
- offers
- wallet_transactions

---

# 🔐 Authentication

The application uses:

- JWT Authentication
- Bearer Token Authorization
- Role-Based Access Architecture

---

# 📡 Important APIs

## Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`

---

## Menu APIs

- GET `/api/menu`
- GET `/api/menu/trending`
- GET `/api/menu/featured`
- GET `/api/menu/specials`

---

## Combo APIs

- GET `/api/combos`
- GET `/api/combos/trending`
- GET `/api/combos/featured`

---

## Order APIs

- POST `/api/orders`
- GET `/api/orders`
- GET `/api/orders/{id}/status`
- GET `/api/orders/{id}/qr`

---

## Wallet APIs

- GET `/api/wallet`
- GET `/api/wallet/history`
- POST `/api/wallet/add`

---

# 🎨 UI Highlights

- Burger King / Swiggy inspired UI
- Bottom Tab Navigation
- Drawer Navigation
- Premium Food Cards
- Dynamic Dashboard
- Food Detail Screens
- Animated Cart and Order Flow
- Responsive Layout

---

# 🔄 Current Development Status

## ✅ Completed

- Backend Architecture
- Authentication APIs
- Menu APIs
- Order APIs
- QR Generation
- React Native Navigation
- Home Dashboard
- Menu Screen
- Cart System
- Order History
- Profile Screens
- Wallet UI
- Dynamic Filtering
- GitHub Repository Setup

---

## 🚧 In Progress

- Wallet Backend Integration
- Live Order Updates
- Staff Panel
- Real Payment Gateway
- Push Notifications
- Recommendation System
- Admin Dashboard Improvements

---

# 📈 Future Enhancements

- AI-Based Recommendations
- Live Kitchen Tracking
- Push Notifications
- Online Payment Gateway
- Loyalty Points System
- Analytics Dashboard
- Inventory Synchronization
- Admin Web Panel

---

# 🧪 Testing

The system has been tested for:

- Authentication
- Order Placement
- QR Generation
- API Integration
- Navigation
- Cart Operations
- MongoDB Connectivity
- Frontend Routing

---

# 👨‍💻 Developer

Developed as a modern full-stack canteen management project using FastAPI and React Native.

---

# 📄 License

This project is developed for educational and academic purposes.

---

# ⭐ Conclusion

The Canteen Management System demonstrates a scalable and production-oriented food ordering architecture using modern technologies. The project combines a modular backend with a rich mobile frontend to create a seamless and visually appealing ordering experience.

