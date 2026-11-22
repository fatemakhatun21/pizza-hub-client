
# 🍕 PizzaHub — Pizza Ordering & Delivery Platform

PizzaHub is a full-stack pizza ordering and delivery platform where customers can explore pizzas, place orders, and track their status. Vendors can manage menu items, customer orders, and premium subscriptions, while administrators oversee platform activities.

## 🌐 Live Website

https://pizza-hub-client-nine.vercel.app

## 🔗 GitHub Repositories

- Frontend: https://github.com/fatemakhatun21/pizza-hub-client
- Backend: https://github.com/fatemakhatun21/pizza-hub-server

## ✨ Key Features

- Secure email/password and Google authentication using Better Auth
- Role-based dashboards for Customers, Vendors, and Admins
- Search, filter, and sort pizza menu items
- Dynamic featured menu and pizza categories
- Customer ordering, order cancellation, and status tracking
- Vendor menu management with ImgBB image uploads
- Admin approval and rejection of submitted menu items
- Free and Premium vendor subscription plans
- Stripe Checkout and webhook-based subscription handling
- Reviews and ratings for menu items
- Customer wishlist and favorites
- Dark and light mode with saved preferences
- Order status timeline
- Email notifications for accepted and rejected orders
- Responsive design with toast notifications and loading states

## 🛠️ Technology Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- JavaScript
- Tailwind CSS 4
- shadcn/ui
- Lucide React
- Motion
- Sonner
- Better Auth Client

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Better Auth with MongoDB Adapter
- JWT and JOSE
- Stripe
- ImgBB
- Resend (email notifications)

## 👥 User Roles

### Customer
Customers can browse approved menu items, view details, place orders, manage wishlists, write reviews, and track or cancel eligible orders.

### Vendor
Vendors can add, edit, and delete menu items, upload images, manage availability, accept or reject customer orders, and upgrade to Premium.

Free vendors can publish up to 3 active menu items. Premium vendors can publish unlimited active items and receive promotional benefits.

### Admin
Admins can manage users, approve or reject menu items, monitor dashboard statistics, and view subscription transactions.

## 🔐 Authentication and Security

- Better Auth supports email/password and Google sign-in.
- Protected routes use authentication and role-based authorization.
- JWT verification uses signed tokens and rejects invalid or expired tokens on JWT-protected endpoints.
- Backend authorization checks current user roles and resource ownership.
- Blocked users are restricted from protected operations.
- Sensitive credentials are stored in environment variables.

## 🔎 Challenge Implementations

### Advanced Search and Sorting
The Browse Menu page provides search by name, filters by category and location, and sorting by ascending or descending price. Backend query parameters support menu filtering and sorting.

### JWT Verification
Better Auth provides authenticated sessions and JWT support. The Express backend uses JWT verification middleware for token-protected endpoints, validating token signatures and expiry, followed by authorization and ownership checks.

### Professional UI/UX
PizzaHub uses a consistent pizza-inspired color palette, responsive navigation, reusable interface components, interactive dashboards, loading states, toast notifications, and light/dark themes.

## 💻 Run Locally

### 1. Clone Frontend

```bash
git clone https://github.com/fatemakhatun21/pizza-hub-client.git
cd pizza-hub-client
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start Frontend

```bash
npm run dev
```

Open http://localhost:3000

### 4. Run Backend

Open another terminal:

```bash
git clone https://github.com/fatemakhatun21/pizza-hub-server.git
cd pizza-hub-server
npm install
```

Configure the backend environment variables as described in its repository, then run:

```bash
npm run dev
```

The backend runs locally at http://localhost:5000.

## 🚀 Deployment

- Frontend hosted on Vercel
- Backend hosted on Render
- Database hosted on MongoDB Atlas
- Images hosted using ImgBB

Backend API: https://pizza-hub-server.onrender.com

## 🧪 Testing

The project includes backend tests for authentication, authorization, and business rules.

Run backend tests using:

```bash
npm test
```

## 📌 Notes

- Stripe is used for vendor subscription payments, not customer pizza orders.
- Vendor Premium status must be activated through verified Stripe webhook events.
- Environment files and secret API keys must never be committed to GitHub.

## 👩‍💻 Author

Developed as a full-stack web development assignment.
