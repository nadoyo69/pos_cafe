# ☕ NADOYO — Artisanal Cafe POS & Management Platform

<div align="center">

**A modern, full-stack Point of Sale and restaurant management system for artisanal cafes & specialty coffee shops.**

Built with **Vue 3** · **Node.js/Express** · **PostgreSQL 15** · **Redis 7** · **Docker**

[![Node.js](https://img.shields.io/badge/Node.js-20_Alpine-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/Vue-3_Composition_API-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15_Alpine-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7_Alpine-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_3-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Caching Strategy](#-caching-strategy)
- [Screenshots](#-screenshots)
- [Documentation](#-documentation)
- [License](#-license)

---

## 🌟 Overview

NADOYO is an enterprise-grade, full-stack web-based POS and restaurant management platform purpose-built for artisanal cafes, specialty coffee shops, and boutique restaurants. It provides end-to-end operations management:

- 📱 **Customer self-service** digital ordering (mobile-friendly)
- 💳 **Cashier POS terminal** with dynamic per-product addons
- 🍳 **Kitchen Display System** (KDS) with real-time order tracking
- 📊 **Financial analytics** and reporting dashboards
- 📦 **Inventory management** with automatic stock deduction
- 🎫 **Discount & promo** voucher system
- 👥 **User management** with role-based access control
- 🔔 **Audio alerts** for new incoming orders

The entire stack runs as a containerised Docker Compose deployment with four services: Vue 3 SPA (Nginx), Express.js API, PostgreSQL 15, and Redis 7.

---

## ✨ Features

### 📱 Customer Self-Service Portal
- **Check-in flow** — name, phone number, and table selection
- **Digital menu** — browsable product catalog with category filters and full-text search
- **Product customisation** — dynamic per-product addon groups (Cup Size, Milk Choice, Sugar Level, Toppings) with live price calculation
- **Cart & checkout** — voucher code application, payment method selection (Pay at Cashier / QRIS)
- **Dynamic branding** — store logo, name, and tagline from admin settings

### 💳 Cashier POS Terminal
- **Product catalog grid** — category tabs, instant search, product cards with images & ratings
- **Customisation popup** — full addon configuration per product with quantity stepper
- **Cart drawer** — side panel with live totals, item notes, and discount code input
- **Checkout flow** — table assignment, PB1 tax auto-calculation, multi-payment support
- **Receipt generation** — printable receipt with dynamic store branding
- **Audio order alerts** — Web Audio API chime + toast notification on new customer orders
- **In-flight order editing** — adjust quantities, remove items, or add new products to active orders

### 🗺️ Table Map Management
- **Visual floor plan** — card grid showing table status (available/occupied/reserved)
- **Live data** — seated customer name, duration timer, active bill total
- **Multi-zone support** — tables organised by floor zones

### 🍳 Kitchen Display System (KDS)
- **Real-time order board** — Kanban columns: `Pending` → `Preparing` → `Ready` → `Completed`
- **Order status cards** — order number, table, customer, item checklist with customisation details
- **Item-level readiness toggle** — mark individual items as ready
- **Order detail popup** — click to view full order breakdown with financial summary
- **New order notifications** — automatic chime sound + visual toast alert

### 📦 Menu & Catalog Management
- **Category CRUD** — slug, name, icon, description
- **Product CRUD** — SKU, name, description, price, category, image, stock toggle, rating
- **Per-product dynamic addons** — JSONB addon group editor with custom option groups and extra price deltas
- **DataTable listing** — searchable, sortable, paginated management views

### 🎫 Discounts & Promotions
- **Voucher code management** — unique promo codes with percentage or fixed discount rules
- **Validity rules** — start/end dates, minimum purchase, maximum discount cap
- **Usage tracking** — configurable usage limits with automatic count on order placement
- **Real-time validation** — API endpoint for customer-side voucher verification

### 📊 Inventory & Stock Management
- **Raw material tracking** — item code, name, category, quantity, unit, min threshold
- **Product linkage** — link inventory items to products with portion quantities (takaran per porsi)
- **Automatic stock deduction** — inventory auto-decrements based on portion sizes when orders are placed
- **Manual adjustments** — stock-in / stock-out transactions
- **Low stock alerts** — visual warnings when quantity falls below threshold

### 📈 Reports & Analytics
- **Overview dashboard** — KPI cards (total orders, revenue, avg order value, top payment method)
- **Date filters** — Today, This Week, This Month, All Time
- **Financial reports** — revenue breakdown, payment method distribution, gross margins
- **Order history** — searchable transaction log with receipt re-printing and refund processing
- **CSV export** — downloadable order history data

### ⏱️ Shift Management
- **Shift open/close** — starting cash, live duration timer
- **Cash reconciliation** — count physical drawer, system calculates expected vs counted discrepancy
- **Shift history** — DataTable of past shifts with financial summaries

### ⚙️ System Administration
- **Store preferences** — name, tagline, address, logo (base64), PB1 tax rate, currency format
- **Dynamic branding** — changes propagate to Login, Header, Sidebar, Receipts, Customer Portal
- **User management** — staff accounts with role assignment and active/inactive status
- **Role & access control** — granular module-level JSONB permissions
- **Audit logs** — timestamped security trail of user actions
- **Table layout CRUD** — physical table configuration (number, zone, capacity)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| [Vue 3](https://vuejs.org/) | UI framework (Composition API, `<script setup>`) |
| [Pinia](https://pinia.vuejs.org/) | State management (15 modular stores) |
| [Vue Router 4](https://router.vuejs.org/) | Client-side routing with JWT auth guards |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling with native dark mode |
| [SweetAlert2](https://sweetalert2.github.io/) | Dialogs, confirmations, and toast notifications |
| [Google Material Symbols](https://fonts.google.com/icons) | Iconography |
| [Vite 5](https://vitejs.dev/) | Build tool and dev server |
| [Nginx](https://nginx.org/) | Production static file serving |

### Backend
| Technology | Purpose |
|-----------|---------|
| [Node.js 20](https://nodejs.org/) | JavaScript runtime |
| [Express.js 4](https://expressjs.com/) | REST API framework |
| [PostgreSQL 15](https://www.postgresql.org/) | Primary relational database (13 tables) |
| [Redis 7](https://redis.io/) | Query result caching |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [Helmet.js](https://helmetjs.github.io/) | HTTP security headers |
| [pg](https://node-postgres.com/) | PostgreSQL client |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| [Docker](https://www.docker.com/) | Containerisation |
| [Docker Compose](https://docs.docker.com/compose/) | Multi-container orchestration |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                      │
│                                                             │
│  ┌──────────────────┐       ┌──────────────────┐            │
│  │    Frontend       │       │     Backend      │            │
│  │  Nginx:80 (8080)  │──────▶│  Express:8000    │            │
│  │  Vue 3 SPA        │       │  REST API        │            │
│  │  Tailwind CSS     │       │  JWT Auth         │            │
│  └──────────────────┘       └────────┬─────────┘            │
│                                      │                      │
│                              ┌───────┴───────┐              │
│                              │               │              │
│                       ┌──────▼──────┐ ┌──────▼──────┐       │
│                       │ PostgreSQL  │ │   Redis 7   │       │
│                       │    15       │ │   Cache     │       │
│                       │  Port 5432  │ │  Port 6379  │       │
│                       │  13 Tables  │ │  8 Cache    │       │
│                       │             │ │  Keys       │       │
│                       └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow
1. Browser → **Nginx** serves the Vue 3 SPA static assets
2. SPA makes API calls to `/api/v1/*` → **Nginx** reverse-proxies to **Express** backend
3. **Express** checks **Redis** cache → returns cached data if fresh
4. On cache miss, **Express** queries **PostgreSQL** → caches result in **Redis** → responds
5. Write operations invalidate relevant **Redis** cache keys

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) (with Docker Compose v2)
- [Node.js 20+](https://nodejs.org/) (for local development only)

### Quick Start (Docker — Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd CAFE

# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker compose up -d --build

# The application will be available at:
# → Frontend:  http://localhost:8080
# → Backend:   http://localhost:8000
# → Database:  localhost:5432
# → Redis:     localhost:6379
```

> **Note:** The database schema auto-creates on first startup. No manual SQL migration required.

### Default Credentials

After first startup, register an admin account via `POST /api/v1/auth/register`:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","username":"admin","password":"admin123","role":"admin"}'
```

### Local Development

```bash
# Backend (Terminal 1)
cd backend
npm install
npm run dev    # Starts on http://localhost:8000 with --watch

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev    # Starts on http://localhost:5173 with HMR
```

---

## 💾 Data Persistence & Database Management

### ✅ Data is Safe During Updates & Rebuilds

PostgreSQL and Redis use **Docker Named Volumes** (`postgres_data`, `redis_data`). This means your data persists across container lifecycle operations:

| Command | Data Safe? | Explanation |
|---------|-----------|-------------|
| `docker compose up -d --build` | ✅ **Yes** | Only rebuilds images & restarts containers. Data volumes are untouched. |
| `docker compose down` | ✅ **Yes** | Stops & removes containers, but **volumes are preserved**. |
| `docker compose restart` | ✅ **Yes** | Restarts containers without removing anything. |
| `docker compose stop` | ✅ **Yes** | Stops containers without removing anything. |
| `docker compose down -v` | ❌ **No** | Removes volumes → **all data is deleted**. |
| `./scripts/reset-db.sh` | ❌ **No** | Reset script intentionally destroys all data. |

> **Summary:** To update code or rebuild images, simply run `docker compose up -d --build`. All data (products, orders, users, settings, etc.) will **remain safe and persisted**.

### Rebuild After Code Changes

```bash
# Safe — data remains persisted
docker compose up -d --build
```

### Stop All Services (Data Remains Safe)

```bash
# Stop only (containers remain)
docker compose stop

# Or stop + remove containers (data volumes remain safe)
docker compose down
```

### ⚠️ Full Database Reset (Destroys All Data)

To **delete all data and start from scratch**, use the dedicated reset script:

```bash
# Grant execute permission (one-time only)
chmod +x scripts/reset-db.sh

# Run the reset
./scripts/reset-db.sh
```

The script will:
1. Stop all running containers
2. Remove PostgreSQL database and Redis cache volumes
3. Rebuild all containers from scratch
4. Wait for database initialisation to complete

> ⚠️ **WARNING:** This script will **permanently delete** all data: orders, products, categories, users, inventory, discounts, settings, shifts, and audit logs. This action cannot be undone!

Alternatively, to reset manually without the script:

```bash
# Manual reset (DELETES ALL DATA)
docker compose down -v
docker compose up -d --build

# Re-register an admin account
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","username":"admin","password":"admin123","role":"admin"}'
```

### 📊 Quick Reference — Common Commands

```bash
# ✅ Update code & rebuild (data safe)
docker compose up -d --build

# ✅ Stop all services (data safe)
docker compose down

# ✅ Restart backend only
docker compose restart backend

# ✅ View backend logs
docker compose logs -f backend

# ✅ View all service logs
docker compose logs -f

# ❌ RESET DATABASE (deletes all data!)
./scripts/reset-db.sh
```


---

## 🔧 Environment Variables

### Backend (`docker-compose.yml`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Express server port |
| `TZ` | `Asia/Jakarta` | System timezone |
| `DB_HOST` | `postgres` | PostgreSQL hostname |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_DATABASE` | `cafe_pos` | Database name |
| `DB_USER` | `cafe_user` | Database user |
| `DB_PASSWORD` | `cafe_secret` | Database password |
| `REDIS_HOST` | `redis` | Redis hostname |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | `lumiere_cafe_pos_jwt_secret_key_2026` | JWT signing secret |

---

## 📁 Project Structure

```
CAFE/
├── docker-compose.yml          # Multi-container orchestration
├── PRD.md                      # Product Requirements Document
├── README.md                   # This file
│
├── scripts/
│   └── reset-db.sh             # ⚠️ Full database reset script (destroys all data)
│
├── backend/
│   ├── Dockerfile              # Node.js 20 Alpine
│   ├── package.json            # Dependencies
│   └── src/
│       ├── server.js           # Express entry point
│       ├── config/
│       │   ├── db.js           # PostgreSQL pool + schema migration
│       │   └── redis.js        # Redis client + cache helpers
│       ├── db/
│       │   └── index.js        # DB module export
│       ├── middleware/
│       │   └── auth.js         # JWT authentication middleware
│       └── routes/
│           ├── auth.routes.js       # Login, Register, Profile
│           ├── categories.routes.js # Category CRUD
│           ├── discounts.routes.js  # Discount CRUD + Validation
│           ├── inventory.routes.js  # Inventory CRUD + Stock ops
│           ├── orders.routes.js     # Orders CRUD + Item editing
│           ├── products.routes.js   # Product CRUD (with addons)
│           ├── reports.routes.js    # Analytics & Reports
│           ├── settings.routes.js   # Preferences, Users, Roles, Menus, Shifts, Logs
│           └── tables.routes.js     # Table CRUD
│
├── frontend/
│   ├── Dockerfile              # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf              # Nginx reverse proxy config
│   ├── package.json            # Dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── src/
│       ├── main.js             # Vue app bootstrap
│       ├── App.vue             # Root component (layout + global modals)
│       ├── style.css           # Global styles + Tailwind directives
│       │
│       ├── router/
│       │   └── index.js        # Vue Router with auth guards
│       │
│       ├── services/
│       │   └── api.js          # Axios-like fetch wrapper (apiFetch)
│       │
│       ├── utils/
│       │   └── swal.js         # SweetAlert2 helpers (showToast, showConfirm)
│       │
│       ├── stores/             # 15 Pinia stores
│       │   ├── auth.js         # JWT auth & user profile
│       │   ├── cart.js         # POS cart management
│       │   ├── customer.js     # Customer session state
│       │   ├── discount.js     # Discount management
│       │   ├── financial.js    # Financial report data
│       │   ├── inventory.js    # Inventory management
│       │   ├── menu.js         # Products & categories
│       │   ├── notification.js # System notifications
│       │   ├── order.js        # Orders, KDS, audio alerts
│       │   ├── order-history.js# Historical order data
│       │   ├── reports.js      # Dashboard & settings
│       │   ├── settings.js     # Admin settings management
│       │   ├── shift.js        # Shift timer state
│       │   ├── table.js        # Table management
│       │   └── theme.js        # Dark/light mode toggle
│       │
│       ├── components/
│       │   ├── common/
│       │   │   └── DataTable.vue          # Reusable data table
│       │   ├── layout/
│       │   │   ├── AppHeader.vue          # Global header
│       │   │   └── AppSidebar.vue         # Navigation sidebar
│       │   ├── orders/
│       │   │   ├── OrderStatusCard.vue    # KDS order card
│       │   │   ├── OrderDetailsModal.vue  # Order detail popup
│       │   │   └── EditOrderModal.vue     # Cashier order editing
│       │   ├── pos/
│       │   │   ├── ProductCard.vue        # Product catalog card
│       │   │   ├── ProductDetailModal.vue # Product customisation
│       │   │   ├── CartDrawer.vue         # Cart side panel
│       │   │   ├── CheckoutModal.vue      # Checkout flow
│       │   │   └── ReceiptModal.vue       # Printable receipt
│       │   └── tables/
│       │       └── ...                    # Table components
│       │
│       └── views/              # 22 page views
│           ├── LoginView.vue
│           ├── PosView.vue
│           ├── TableMapView.vue
│           ├── RealTimeOrdersView.vue
│           ├── ShiftManagementView.vue
│           ├── CategoriesManagementView.vue
│           ├── MenuManagementView.vue
│           ├── MenuItemFormView.vue
│           ├── MenuSystemManagementView.vue
│           ├── DiscountManagementView.vue
│           ├── InventoryView.vue
│           ├── ReportsView.vue
│           ├── FinancialReportsView.vue
│           ├── OrderHistoryView.vue
│           ├── SettingsView.vue
│           ├── UserManagementView.vue
│           ├── RoleManagementView.vue
│           ├── ProcessLogsView.vue
│           ├── TableManagementView.vue
│           ├── CustomerWelcomeView.vue
│           ├── CustomerMenuView.vue
│           └── NotFoundView.vue
```

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1` (or `/api`).

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | — | Login with username/password, returns JWT |
| `POST` | `/auth/register` | — | Register new user account |
| `GET` | `/auth/me` | JWT | Get authenticated user profile |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/products` | — | List all products (includes `addons_json`) |
| `POST` | `/products` | JWT | Create new product |
| `PUT` | `/products/:id` | JWT | Update product |
| `DELETE` | `/products/:id` | JWT | Delete product |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/categories` | — | List all categories |
| `POST` | `/categories` | JWT | Create category |
| `PUT` | `/categories/:id` | JWT | Update category |
| `DELETE` | `/categories/:id` | JWT | Delete category |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/orders` | JWT | List all orders with items |
| `POST` | `/orders` | — | Create order (auto-deducts inventory) |
| `PUT` | `/orders/:id` | JWT | Update order items (cashier editing) |
| `PATCH` | `/orders/:id/status` | JWT | Change order status |
| `PATCH` | `/orders/items/:itemId/ready` | JWT | Toggle item readiness |

### Tables

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/tables` | — | List all tables |
| `POST` | `/tables` | JWT | Create table |
| `PUT` | `/tables/:id` | JWT | Update table |
| `DELETE` | `/tables/:id` | JWT | Delete table |

### Inventory

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/inventory` | JWT | List inventory items |
| `POST` | `/inventory` | JWT | Create inventory item |
| `PUT` | `/inventory/:id` | JWT | Update inventory item |
| `DELETE` | `/inventory/:id` | JWT | Delete inventory item |
| `POST` | `/inventory/:id/stock-in` | JWT | Record stock increase |
| `POST` | `/inventory/:id/stock-out` | JWT | Record stock decrease |

### Discounts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/discounts` | JWT | List all discounts |
| `POST` | `/discounts` | JWT | Create discount |
| `PUT` | `/discounts/:id` | JWT | Update discount |
| `DELETE` | `/discounts/:id` | JWT | Delete discount |
| `POST` | `/discounts/validate` | — | Validate voucher code |

### Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/reports/summary` | JWT | Dashboard KPI data |
| `GET` | `/reports/financial` | JWT | Financial analytics |

### Settings & Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/settings/preferences` | — | Get system settings |
| `POST` | `/settings/preferences` | JWT | Update system settings |
| `GET` | `/settings/shifts` | JWT | List shifts |
| `POST` | `/settings/shifts` | JWT | Open/close shift |
| `GET` | `/settings/audit-logs` | JWT | List audit logs |
| `GET` | `/settings/menus` | JWT | List sidebar menu items |
| `POST` | `/settings/menus` | JWT | Create menu item |
| `PUT` | `/settings/menus/:id` | JWT | Update menu item |
| `DELETE` | `/settings/menus/:id` | JWT | Delete menu item |
| `GET` | `/settings/users` | JWT | List users |
| `POST` | `/settings/users` | JWT | Create user |
| `PUT` | `/settings/users/:id` | JWT | Update user |
| `DELETE` | `/settings/users/:id` | JWT | Delete user |
| `GET` | `/settings/roles` | JWT | List roles |
| `POST` | `/settings/roles` | JWT | Create role |
| `PUT` | `/settings/roles/:id` | JWT | Update role |
| `DELETE` | `/settings/roles/:id` | JWT | Delete role |

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | System health status |

---

## 🗄️ Database Schema

13 PostgreSQL tables with auto-migration on startup:

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `roles` | Role definitions | `role_key`, `permissions_json` (JSONB) |
| `users` | Staff accounts | `username`, `password` (bcrypt), `role`, `status` |
| `system_menus` | Dynamic sidebar nav | `title`, `url_path`, `permission_slug`, `parent_id` |
| `categories` | Product categories | `slug`, `name`, `icon` |
| `products` | Menu items | `sku`, `name`, `price`, `addons_json` (JSONB) |
| `cafe_tables` | Physical tables | `table_no`, `zone`, `capacity`, `status`, `current_bill_total` |
| `inventory_items` | Raw materials | `item_code`, `product_id`, `portion_qty`, `current_qty`, `min_threshold` |
| `discounts` | Promo vouchers | `code`, `type`, `value`, `usage_limit`, `usage_count` |
| `orders` | Order headers | `order_number`, `receipt_number`, `customer_name`, `total_amount`, `voucher_code` |
| `order_items` | Order line items | `product_name`, `quantity`, `unit_price`, `total_price`, `size`, `milk`, `sugar` |
| `shifts` | Cashier shifts | `cashier_name`, `starting_cash`, `counted_cash`, `discrepancy` |
| `audit_logs` | Activity trail | `user_name`, `action`, `module`, `ip_address` |
| `settings` | Key-value config | `key`, `value` (TEXT) |

---

## 🔄 Caching Strategy

Redis 7 caches all major query results with 1-hour TTL:

| Cache Key | Invalidated By |
|-----------|---------------|
| `cache:products` | Product create/update/delete |
| `cache:categories` | Category create/update/delete |
| `cache:orders` | Order create, status change, item edit |
| `cache:tables` | Table status change, order placement |
| `cache:discounts` | Discount CRUD, voucher redemption |
| `cache:inventory` | Stock-in/out, order placement |
| `cache:settings:preferences` | Settings update |
| `cache:reports_summary` | Order create, status change |

---

## 🖥️ Application Routes

### Public (No Auth Required)

| Route | View | Description |
|-------|------|-------------|
| `/` | CustomerWelcomeView | Customer check-in (name, phone, table) |
| `/customer/menu` | CustomerMenuView | Digital menu & ordering |
| `/login` | LoginView | Staff login |

### Staff (JWT Required)

| Route | View | Description |
|-------|------|-------------|
| `/pos` | PosView | Cashier POS terminal |
| `/tables` | TableMapView | Table floor plan |
| `/orders` | RealTimeOrdersView | Kitchen Display System |
| `/shift` | ShiftManagementView | Shift management |
| `/categories` | CategoriesManagementView | Category management |
| `/menu` | MenuManagementView | Product catalog list |
| `/menu/new` | MenuItemFormView | Create new product |
| `/menu/edit/:id` | MenuItemFormView | Edit existing product |
| `/menu-system` | MenuSystemManagementView | Sidebar menu management |
| `/discounts` | DiscountManagementView | Discount & promo management |
| `/inventory` | InventoryView | Inventory stock management |
| `/reports` | ReportsView | Overview analytics dashboard |
| `/reports/financial` | FinancialReportsView | Financial reports |
| `/reports/orders` | OrderHistoryView | Order history & refunds |
| `/settings` | SettingsView | Store preferences |
| `/settings/users` | UserManagementView | User management |
| `/settings/roles` | RoleManagementView | Role & permission management |
| `/settings/logs` | ProcessLogsView | Audit logs |
| `/settings/tables` | TableManagementView | Table layout CRUD |

---

## 📄 Documentation

For detailed product specifications, feature modules, database schema, and technical architecture, refer to the [PRD.md](./PRD.md).

---

## 📝 License

This project is proprietary software. All rights reserved.

---

<div align="center">

**Built with ❤️ by Nadoyo**

*NADOYO — Where technology meets artisanal craft*

</div>
