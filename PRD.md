# Product Requirements Document (PRD)

**Product Name:** LUMIÈRE Cafe POS System
**Version:** 2.0.0
**Date:** August 2026
**Author:** Nadoyo

---

## 1. Executive Summary

LUMIÈRE is an enterprise-grade, full-stack web-based Point of Sale (POS) and restaurant management platform purpose-built for artisanal cafes, specialty coffee shops, and boutique restaurants. The system delivers end-to-end operations management — from customer self-service digital ordering and cashier POS transactions, through real-time kitchen display (KDS) order tracking, to comprehensive financial analytics and inventory management.

The platform runs as a containerised Docker Compose stack comprising four services: a Vue 3 SPA frontend served via Nginx, a Node.js/Express REST API backend, PostgreSQL 15 for persistent data, and Redis 7 for high-performance caching.

---

## 2. Target Users & Personas

| Persona | Access Level | Description |
|---------|-------------|-------------|
| **Customer (Dine-in / Takeaway)** | Public | Browses the digital menu via QR code or direct URL, customises orders (size, milk, sugar, toppings), submits orders, and applies promo voucher codes. |
| **Cashier** | Staff | Processes walk-in and phone orders via the POS terminal, manages table assignments, handles payments, opens/closes cash register shifts, and edits in-flight orders. |
| **Kitchen / Barista** | Staff | Views the real-time Kitchen Display System (KDS), marks individual items and full orders through preparation states (`Pending` → `Preparing` → `Ready` → `Completed`). |
| **Manager / Admin** | Admin | Manages menu catalog, categories, inventory, discounts & promos, user accounts, role-based access control, store branding, tax configuration, and views financial reports and audit logs. |

---

## 3. Technology Stack

### 3.1 Frontend

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| State Management | Pinia (15 modular stores) |
| Routing | Vue Router 4 with JWT auth guards |
| Styling | Tailwind CSS with native Light/Dark mode |
| Icons | Google Material Symbols (Outlined) |
| Dialogs & Toasts | SweetAlert2 (custom styled) |
| Build Tool | Vite 5 |
| Production Server | Nginx Alpine |

### 3.2 Backend

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (Alpine) |
| Framework | Express.js 4 |
| Database | PostgreSQL 15 (Alpine) |
| Cache | Redis 7 (Alpine) |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Security | Helmet.js, CORS |
| API Prefix | `/api/v1/*` and `/api/*` |

### 3.3 Infrastructure

| Component | Details |
|-----------|---------|
| Containerisation | Docker + Docker Compose |
| Services | 4 containers (frontend, backend, postgres, redis) |
| Networking | Bridge network `cafe-network` |
| Timezone | `Asia/Jakarta` (WIB, UTC+7) system-wide |
| Persistent Volumes | `postgres_data`, `redis_data` |

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                   │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │   Frontend   │    │   Backend    │                    │
│  │  (Nginx:80)  │───▶│ (Express:8000)│                   │
│  │   Vue 3 SPA  │    │  REST API    │                    │
│  │  Port 8080   │    │  Port 8000   │                    │
│  └──────────────┘    └──────┬───────┘                    │
│                             │                            │
│                     ┌───────┴───────┐                    │
│                     │               │                    │
│              ┌──────▼──────┐ ┌──────▼──────┐             │
│              │ PostgreSQL  │ │   Redis 7   │             │
│              │    15       │ │   Cache     │             │
│              │  Port 5432  │ │  Port 6379  │             │
│              └─────────────┘ └─────────────┘             │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema (13 Tables)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `roles` | Role definitions with JSONB permission arrays |
| 2 | `users` | Staff accounts (name, username, password, role, avatar, status) |
| 3 | `system_menus` | Dynamic sidebar navigation items with parent-child hierarchy |
| 4 | `categories` | Product categories (slug, name, icon) |
| 5 | `products` | Menu items (SKU, name, price, stock, rating, image, `addons_json` JSONB) |
| 6 | `cafe_tables` | Physical table layout (table_no, zone, capacity, status, current bill) |
| 7 | `inventory_items` | Raw material tracking with product linkage and portion quantities |
| 8 | `discounts` | Promo voucher codes (percentage/fixed, min purchase, validity, usage limits) |
| 9 | `orders` | Order headers (order_number, receipt_number, customer, table, payment, totals) |
| 10 | `order_items` | Order line items (product, quantity, unit_price, total_price, customisations) |
| 11 | `shifts` | Cashier shift records (start/end cash, discrepancy, total sales) |
| 12 | `audit_logs` | Security activity trail (user, action, module, IP, status) |
| 13 | `settings` | Key-value system configuration (store name, tax rate, logo, etc.) |

---

## 6. Feature Modules

### 6.1 Customer Self-Service Portal (Public)

**Routes:** `/` (Welcome) → `/customer/menu` (Digital Menu & Ordering)

| Feature | Description |
|---------|-------------|
| Customer Check-in | Name, phone number, and table selection (dropdown of available tables) |
| Digital Menu Browsing | Category filter pills, full-text search, product cards with images & ratings |
| Dynamic Product Customisation | Per-product addon groups (Cup Size, Milk Choice, Sugar Level, Toppings) with live price delta calculation |
| Shopping Cart | Floating cart bar, quantity adjustment, item removal, voucher code application |
| Promo Voucher Support | Apply discount codes with real-time validation against backend (`POST /discounts/validate`) |
| Order Submission | Select payment method (Pay at Cashier / QRIS), submit to kitchen via `POST /orders` |
| Dynamic Store Branding | Logo, store name, and tagline from system settings |

### 6.2 Cashier POS Terminal

**Route:** `/pos`

| Feature | Description |
|---------|-------------|
| Product Catalog Grid | Category tabs, quick-search, product cards with images, ratings, and SKU codes |
| Product Detail Modal | Full customisation popup with dynamic per-product addon groups, quantity stepper, and live total calculation |
| Cart Drawer | Side panel showing current order items with quantity controls, item notes, voucher input, and checkout CTA |
| Checkout Flow | Table assignment, customer name, payment method selection, PB1 tax calculation, discount application |
| Receipt Generation | Printable receipt modal with dynamic store branding (name, tagline, address) |
| Audio Order Alerts | Web Audio API chime notification when new customer orders arrive |
| Order Editing | Cashiers can edit in-flight orders: adjust quantities, remove items, add new products |

### 6.3 Table Management

**Route:** `/tables`

| Feature | Description |
|---------|-------------|
| Visual Floor Plan Grid | Card-based table layout showing status (available/occupied/reserved), seated customer, duration timer, and active bill total |
| Table Status Management | Click to seat/clear customers, view table details |
| Multi-Zone Support | Tables organised by floor zones |

### 6.4 Kitchen Display System (KDS)

**Route:** `/orders`

| Feature | Description |
|---------|-------------|
| Real-Time Order Board | Kanban-style columns for `Pending`, `Preparing`, `Ready`, `Completed` |
| Order Status Cards | Display order number, table, customer name, item checklist with customisations |
| Item-Level Readiness | Individual item toggle for `is_ready` status |
| Order Status Transitions | `PATCH /orders/:id/status` to advance through workflow states |
| Order Detail Popup | Click any order card to view full breakdown with financial summary |
| New Order Audio Alert | Automatic chime sound + toast notification when new orders arrive |

### 6.5 Menu & Catalog Management

**Routes:** `/categories`, `/menu`, `/menu/new`, `/menu/edit/:id`

| Feature | Description |
|---------|-------------|
| Category CRUD | Create, edit, delete categories with slug, name, icon, and description |
| Product CRUD | Full product management with SKU, name, description, price, category, image URL, stock toggle, and rating |
| Per-Product Dynamic Addons | JSONB addon group editor — create custom option groups (e.g. "Cup Size", "Milk", "Topping") with named options and extra price deltas |
| DataTable Listing | Searchable, sortable, paginated product/category tables |

### 6.6 Discounts & Promotions

**Route:** `/discounts`

| Feature | Description |
|---------|-------------|
| Promo Code CRUD | Create/edit discount vouchers with unique codes |
| Discount Types | Percentage (%) or Fixed Amount (Rp) |
| Validity Rules | Start/end dates, minimum purchase amount, maximum discount cap |
| Usage Tracking | Usage limit and real-time usage count; auto-incremented on order placement |
| Voucher Validation | `POST /discounts/validate` endpoint for real-time customer-side validation |

### 6.7 Inventory & Stock Management

**Route:** `/inventory`

| Feature | Description |
|---------|-------------|
| Raw Material Tracking | Item code, name, category, current quantity, unit, min threshold |
| Product Linkage | Link inventory items to products with portion quantity (takaran per porsi) |
| Automatic Stock Deduction | On order creation, inventory stock is auto-decremented based on portion quantities |
| Stock-In / Stock-Out | Manual stock adjustment transactions |
| Low Stock Alerts | Visual warnings when quantity falls below minimum threshold |

### 6.8 Reports & Analytics

**Routes:** `/reports` (Overview), `/reports/financial` (Financial), `/reports/orders` (Order History)

| Feature | Description |
|---------|-------------|
| Overview Dashboard | KPI cards: total orders, total revenue, average order value, top payment method |
| Date Filtering | Today, This Week, This Month, All Time filter pills |
| Top-Selling Products | Ranked product sales analytics |
| Financial Reports | Revenue breakdown, payment method distribution, gross margin analysis |
| Order History Log | Full transaction log with search, date filters, receipt re-printing, and refund processing |
| Order Editing from History | Edit completed orders (adjust quantities, add/remove items) directly from history view |
| CSV Export | Export order history data |

### 6.9 Shift Management

**Route:** `/shift`

| Feature | Description |
|---------|-------------|
| Shift Open | Start a new shift with starting cash amount |
| Shift Timer | Live duration timer displayed in header |
| Shift Close | Count physical cash drawer, system calculates expected vs counted discrepancy |
| Shift History | DataTable of past shift records with financial summaries |

### 6.10 System Administration

**Routes:** `/settings`, `/settings/users`, `/settings/roles`, `/settings/logs`

| Feature | Description |
|---------|-------------|
| Store Preferences | Configure store name, tagline, address, logo upload (base64), PB1 tax rate (%), currency format |
| Dynamic Branding | Changes propagate instantly to Login, Header, Sidebar, Receipts, Customer Portal |
| User Management | CRUD for staff accounts with name, username, email, password, role assignment, and active/inactive status |
| Role & Access Control | Define roles (Admin, Cashier, Kitchen, etc.) with granular module-level JSONB permissions |
| Audit Logs | Timestamped security trail of user actions (login, order refund, settings change, etc.) |
| Table Layout CRUD | Add, edit, remove physical tables with table number, zone, and seating capacity |

---

## 7. API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | JWT login |
| POST | `/auth/register` | Create user account |
| GET | `/auth/me` | Get current authenticated user |

### Products & Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products (with addons_json) |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/categories` | List all categories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all orders with items |
| POST | `/orders` | Create new order + deduct inventory |
| PUT | `/orders/:id` | Edit order items (cashier) |
| PATCH | `/orders/:id/status` | Update order status |
| PATCH | `/orders/items/:itemId/ready` | Toggle item readiness |

### Tables
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tables` | List all cafe tables |
| POST | `/tables` | Create table |
| PUT | `/tables/:id` | Update table |
| DELETE | `/tables/:id` | Delete table |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | List inventory items |
| POST | `/inventory` | Create inventory item |
| PUT | `/inventory/:id` | Update inventory item |
| DELETE | `/inventory/:id` | Delete inventory item |
| POST | `/inventory/:id/stock-in` | Record stock-in |
| POST | `/inventory/:id/stock-out` | Record stock-out |

### Discounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/discounts` | List all discounts |
| POST | `/discounts` | Create discount |
| PUT | `/discounts/:id` | Update discount |
| DELETE | `/discounts/:id` | Delete discount |
| POST | `/discounts/validate` | Validate voucher code |

### Reports & Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/summary` | Dashboard KPI summary |
| GET | `/reports/financial` | Financial analytics data |
| GET | `/settings/preferences` | Get system settings |
| POST | `/settings/preferences` | Update system settings |
| GET | `/settings/shifts` | List shift records |
| POST | `/settings/shifts` | Create/close shift |
| GET | `/settings/audit-logs` | List audit logs |
| GET | `/settings/menus` | List system menu items |

---

## 8. Redis Caching Strategy

All major data queries are cached in Redis with configurable TTLs to minimise PostgreSQL load:

| Cache Key | TTL | Invalidation Triggers |
|-----------|-----|----------------------|
| `cache:products` | 1 hour | Product CRUD operations |
| `cache:categories` | 1 hour | Category CRUD operations |
| `cache:orders` | 1 hour | Order creation, status update, item edit |
| `cache:tables` | 1 hour | Table status change, order placement |
| `cache:discounts` | 1 hour | Discount CRUD, voucher usage |
| `cache:inventory` | 1 hour | Stock-in/out, order creation |
| `cache:settings:preferences` | 1 hour | Settings update |
| `cache:reports_summary` | 1 hour | Order creation, status change |

---

## 9. Frontend Architecture

### 9.1 Pinia Stores (15 Modules)

| Store | Responsibilities |
|-------|-----------------|
| `auth.js` | JWT login/logout, token persistence, user profile |
| `cart.js` | POS cart items, quantity management, checkout flow |
| `customer.js` | Customer session (name, phone, table) |
| `discount.js` | Discount CRUD, voucher validation |
| `financial.js` | Financial report data |
| `inventory.js` | Inventory CRUD, stock transactions |
| `menu.js` | Product/category CRUD, filtering, search |
| `notification.js` | System alerts, notification center |
| `order.js` | Order polling, KDS state, audio alerts, order editing |
| `order-history.js` | Historical order data, date filtering, KPIs |
| `reports.js` | Dashboard summary, system settings |
| `settings.js` | Store preferences, table/role/user/menu management |
| `shift.js` | Shift timer state |
| `table.js` | Table CRUD, status management, available tables |
| `theme.js` | Dark/light mode toggle with localStorage persistence |

### 9.2 Component Architecture (22 Views, 11 Components)

**Views (22):** LoginView, PosView, TableMapView, RealTimeOrdersView, ShiftManagementView, CategoriesManagementView, MenuManagementView, MenuItemFormView, MenuSystemManagementView, DiscountManagementView, InventoryView, ReportsView, FinancialReportsView, OrderHistoryView, SettingsView, UserManagementView, RoleManagementView, ProcessLogsView, TableManagementView, CustomerWelcomeView, CustomerMenuView, NotFoundView

**Layout Components:** AppHeader, AppSidebar

**POS Components:** ProductCard, ProductDetailModal, CartDrawer, CheckoutModal, ReceiptModal

**Order Components:** OrderStatusCard, OrderDetailsModal, EditOrderModal

**Common Components:** DataTable

---

## 10. Non-Functional Requirements

| Requirement | Implementation |
|-------------|---------------|
| **Responsive Design** | Mobile-first customer portal; desktop-optimised admin dashboard with responsive breakpoints |
| **Timezone** | System-wide `Asia/Jakarta` (WIB) — set in Docker env, Node.js process, and all date formatting |
| **Security** | JWT authentication, bcrypt password hashing, Helmet.js headers, CORS configuration |
| **Caching** | Redis 7 with automatic cache invalidation on write operations |
| **Dark Mode** | Native Tailwind dark mode with localStorage toggle persistence |
| **Localisation** | Indonesian Rupiah (Rp) currency formatting (`id-ID` locale), WIB timestamps |
| **Auto-Migration** | Database schema auto-creates and migrates on server startup (no manual SQL required) |
| **Audio Alerts** | Web Audio API oscillator chime for new order notifications |

---

## 11. Future Roadmap

- Thermal receipt printer integration (ESC/POS protocol)
- Customer loyalty & reward points system
- Multi-branch / multi-outlet support
- WebSocket real-time order updates (replace polling)
- Supplier purchase order management
- Employee attendance & scheduling
- Kitchen preparation time analytics
- Mobile native app (React Native / Flutter)
