# 🍕 QR Menu & Order — Multi-Tenant SaaS Platform

This project is an end-to-end SaaS (Software as a Service) solution that allows businesses (restaurants, cafes, hotels, etc.) to create and manage digital menus. Customers can scan QR codes at their tables to browse, order, and pay seamlessly.
This document is designed to detail the code structure, technical architecture, and overall objective of the QR Menu and Order SaaS platform.

![Version](https://img.shields.io/badge/Version-1.1-blue?style=flat)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

### 📋 Version History

#### v1.0 (Current)

- **Custom Domain Support:** Individual businesses can now use their own domains.
- **Payment Gateways:** Full integration with **Iyzico** & **Stripe**.
- **Enhanced Super Admin:** New dashboard with subscription metrics and tenant management.
- **Real-time Notifications:** Instant order alerts for Kitchen and Waiter panels.

---

## ✨ Features

- **Multi-tenancy Architecture** — Each business operates on a unique slug or personal Custom Domain.
- **Dynamic QR Code System** — Unique QR codes for every table with real-time status tracking.
- **Live Order Management** — Instant order updates to Kitchen/Waiter panels via Socket.io.
- **Flexible Payments** — Supports Online (Stripe/Iyzico) and "Cash at Table" options.
- **Custom Theme Engine** — Businesses can customize branding, colors, and logos dynamically.
- **Super Admin Panel** — Centralized hub to manage all tenants, subscriptions, and global settings.

---

## 🏗️ Architecture

```
qr-menu-saas/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── (admin)/          # Business Management Dashboard
│   │   ├── (auth)/           # Authentication (JWT/Jose)
│   │   ├── (super-admin)/    # Platform Management
│   │   └── [tenant]/         # Dynamic Tenant Routing (Menu & Ordering)
│   ├── components/           # Reusable UI (Tailwind + Shadcn)
│   ├── lib/                  # Shared Utilities (Prisma, Auth, Sockets)
│   └── store/                # Client-side State Management
├── prisma/                   # PostgreSQL Schema & Seed Scripts
├── public/                   # Static Assets & Uploads
├── docker-compose.yml        # Infrastructure Orchestration
└── next.config.mjs           # Next.js Configuration
```

**System Workflow:**

| Layer              | Technology              | Responsibility                                    |
| ------------------ | ----------------------- | ------------------------------------------------- |
| **Frontend**       | Next.js 14 (App Router) | Client/Admin UI, SSR, and SEO optimization        |
| **State/Realtime** | Socket.io & Redis       | Instant order sync across kitchen/waiter devices  |
| **Database**       | PostgreSQL (Prisma)     | Persistent storage for menus, orders, and tenants |
| **Infrastructure** | Docker                  | Containerized deployment (Postgres, Redis, App)   |

---

## 🗄️ Database Schema

![Database ERD](https://github.com/fluent-design/placeholder-erd.png)

| Table        | Purpose              | Key Columns                                 |
| ------------ | -------------------- | ------------------------------------------- |
| **Tenants**  | Business Accounts    | Slug, Domain, SubscriptionPlan, ThemeConfig |
| **Users**    | Personnel & Admins   | Email, PasswordHash, Role, TenantID         |
| **Menus**    | Digital Catalog      | TenantID, Category, Name, Price, ImageURL   |
| **Orders**   | Transaction Tracking | TableID, TotalAmount, Status, PaymentType   |
| **Payments** | Payment Records      | OrderID, Provider, Amount, Status           |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Docker & Docker Compose**

### Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Emrecanavc1/qr-menu-saas.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Launch Infrastructure:**
   ```bash
   docker-compose up -d
   ```
4. **Database Sync:**
   ```bash
   npx prisma db push && npm run db:seed
   ```
5. **Start Development:**
   ```bash
   npm run dev
   ```

---

## 🔐 Login Credentials

| Role               | Username                   | Password     |
| ------------------ | -------------------------- | ------------ |
| **Super Admin**    | `superadmin@qrmenu.com`    | `Admin123!`  |
| **Business Admin** | `admin@demo-restoran.com`  | `Demo123!`   |
| **Waiter**         | `garson@demo-restoran.com` | `Garson123!` |
| **Kitchen PIN**    | (Mutfak Ekranı)            | `5678`       |

---

## 📊 Project Stats

| Metric           | Value                    |
| ---------------- | ------------------------ |
| Framework        | Next.js 14 (App Router)  |
| Realtime Engine  | Socket.io                |
| Database Tables  | 12+                      |
| Containerization | Docker Ready             |
| UI Framework     | Tailwind CSS + Shadcn/ui |

---

## 🛣️ Roadmap

- [x] Multi-tenancy & Dynamic QR Codes
- [x] Real-time Order Tracking
- [x] Stripe/Iyzico Integration
- [ ] AI-Powered Menu Recommendations
- [ ] Multi-language Support (i18n)
- [ ] Export reports to Excel / PDF
- [ ] Mobile App for Waiters (iOS/Android)

---

## 🛠️ Built With

- [Next.js](https://nextjs.org/) — React Framework
- [Prisma](https://www.prisma.io/) — ORM for PostgreSQL
- [Socket.io](https://socket.io/) — Real-time bidirectional communication
- [Lucide React](https://lucide.dev/) — Icon library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Docker](https://www.docker.com/) — Containerization

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

> **Created for the SaaS Solution Portfolio**
> **QR Menu & Order v1.1** — © 2026
