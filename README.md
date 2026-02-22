# Nexus Dashboard — React Application

A complete, responsive, component-based React.js dashboard application built with modern front-end best practices. No UI frameworks — pure React + CSS only.

---

## Live Demo Credentials

| Field    | Value                |
|----------|----------------------|
| Email    | admin@example.com    |
| Password | admin123             |

> Or use the **"Fill demo credentials"** button on the Sign In page.

---

## Project Setup Instructions

### Prerequisites

- Node.js v18 or later
- npm v9 or later

### Installation

```bash
# 1. Navigate into the project folder
cd react-dashboard-app

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser and go to **http://localhost:5173**

### Production Build

```bash
npm run build
npm run preview
```

---

## Technologies Used

| Technology        | Purpose                              |
|-------------------|--------------------------------------|
| React 18          | UI library (functional components)   |
| React Router v6   | Client-side routing & navigation     |
| Vite              | Build tool & dev server              |
| CSS3 (custom)     | Styling — Flexbox & Grid             |
| CSS Variables     | Theming (dark/light mode)            |
| SVG               | Custom charts (line, bar, donut)     |
| LocalStorage      | Auth persistence & theme storage     |

> **No Bootstrap, No Tailwind, No MUI** — only vanilla CSS and React.

---

## Folder Structure

```
react-dashboard-app/
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Badge/              # Status badge component
│   │   ├── Button/             # Primary/secondary/ghost button
│   │   ├── Card/               # Card container (with Header/Body/Footer)
│   │   ├── Charts/             # SVG charts: Line, Bar, Donut
│   │   ├── Cursor/             # Custom animated cursor
│   │   ├── Input/              # Form input with validation & password toggle
│   │   ├── Modal/              # Accessible modal dialog
│   │   ├── Pagination/         # Paginator with ellipsis
│   │   └── Sidebar/            # Collapsible sidebar navigation
│   │
│   ├── pages/                  # Page-level components (route views)
│   │   ├── SignIn/             # Sign In page with form validation
│   │   ├── SignUp/             # Sign Up with password strength meter
│   │   ├── VerifyOTP/          # 6-digit OTP input with auto-focus
│   │   ├── ForgotPassword/     # Forgot password + email sent confirmation
│   │   ├── Dashboard/          # Metrics, charts, recent orders
│   │   ├── Registration/       # Multi-section user registration form
│   │   ├── ListPage/           # Users list with search, filter, sort, bulk select
│   │   ├── Users/              # Advanced users management table
│   │   ├── Profile/            # User profile view & edit page
│   │   └── Products/
│   │       ├── ProductList.jsx # Product grid/list with categories & pagination
│   │       └── ProductDetail.jsx # Full product page with gallery & tabs
│   │
│   ├── layouts/                # Layout wrappers
│   │   ├── AuthLayout.jsx      # Two-panel auth layout (decorative + form)
│   │   └── MainLayout.jsx      # App shell with sidebar + header
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js          # Auth state (login/logout, localStorage)
│   │   ├── useForm.js          # Generic form state + validation
│   │   ├── usePagination.js    # Slice data + page controls
│   │   └── useTheme.js         # Dark/light toggle via CSS variables
│   │
│   ├── data/                   # Mock/dummy data (no backend)
│   │   ├── dashboard.js        # Metrics, chart data, recent orders
│   │   ├── products.js         # 12 products with full details
│   │   └── users.js            # 12 user records
│   │
│   ├── styles/                 # Global styles
│   │   ├── variables.css       # All CSS custom properties (light & dark)
│   │   └── global.css          # Reset, typography, utilities, animations
│   │
│   ├── App.jsx                 # Root component — routing & auth guards
│   └── main.jsx                # Entry point
│
├── index.html
├── vite.config.js
└── package.json
```

---

## Assignment Requirements — Completion Status

### Core Functional Screens

| Screen              | Route               | Status     |
|---------------------|---------------------|------------|
| Sign In             | `/signin`           | ✅ Complete |
| Sign Up             | `/signup`           | ✅ Complete |
| Verify OTP          | `/verify-otp`       | ✅ Complete |
| Dashboard           | `/dashboard`        | ✅ Complete |
| Registration Form   | `/registration`     | ✅ Complete |
| List Page           | `/list`             | ✅ Complete |
| Product List        | `/products`         | ✅ Complete |
| Product Detail Page | `/products/:id`     | ✅ Complete |

### Bonus Features

| Feature                      | Status     |
|------------------------------|------------|
| Sidebar Navigation           | ✅ Done     |
| Collapsible sidebar (mobile) | ✅ Done     |
| Dashboard metric cards       | ✅ Done     |
| Line chart (SVG)             | ✅ Done     |
| Bar chart (SVG)              | ✅ Done     |
| Donut chart (SVG)            | ✅ Done     |
| Product detail page          | ✅ Done     |
| Pagination (users + products)| ✅ Done     |
| Dark / Light theme toggle    | ✅ Done     |

### Extra Pages (Beyond Requirements)

| Page             | Route               | Description                                      |
|------------------|---------------------|--------------------------------------------------|
| Forgot Password  | `/forgot-password`  | Email input + success confirmation with resend   |
| Users Management | `/users`            | Advanced users table with avatar, role, filters  |
| Profile          | `/profile`          | User profile view with editable sections         |

---

## Screens & Features

### 1. Sign In (`/signin`)
- Email + password form with full validation
- Show/hide password toggle
- "Fill demo credentials" shortcut button
- Redirects authenticated users to dashboard

### 2. Sign Up (`/signup`)
- Name, email, password, confirm password fields
- Password strength meter (Weak / Medium / Strong)
- Terms & conditions checkbox validation
- On success → redirects to OTP verification

### 3. Verify OTP (`/verify-otp`)
- 6-box OTP input with auto-advance & backspace navigation
- Paste support
- 30-second resend countdown timer
- Enter any 6 digits to verify (or 123456)

### 4. Dashboard (`/dashboard`)
- 4 metric cards (Revenue, Orders, Users, Conversion Rate)
- Trend indicator (up/down with % change)
- Interactive SVG Line Chart (Revenue 2025 vs 2024)
- Interactive SVG Bar Chart (Weekly Orders)
- Interactive SVG Donut Chart (Categories)
- Recent orders table with status badges

### 5. Registration Form (`/registration`)
- 4 sections: Personal Info, Work Info, Address, Bio & Preferences
- 12 fields with full validation
- Gender select, date of birth, textarea with char counter
- Newsletter/notification checkboxes
- Reset and submit actions
- Success state with confirmation

### 6. List Page (`/list`)
- Search by name/email/department
- Filter by role and status
- Multi-column sortable table (click headers)
- Bulk select with checkbox (per page)
- Pagination (6 users/page)
- Edit and delete action buttons

### 7. Product List (`/products`)
- 12 products across 8 categories
- Keyword search across name, brand, tags
- Category filter tabs
- Sort by price, rating, name
- Grid/List view toggle
- Pagination (8 products/page)
- Stock status badges + discount badges

### 8. Product Detail (`/products/:id`)
- Image gallery with thumbnail switcher
- Pricing with original price and savings
- Star rating display
- Quantity selector (respects stock limit)
- Add to Cart / Wishlist buttons
- Tabs: Description, Features, Reviews
- Review score breakdown (star distribution bars)
- Related products grid

### 9. Forgot Password (`/forgot-password`) — Extra
- Email validation form
- Simulated send with loading state
- Success screen with step-by-step instructions
- Resend email action

### 10. Users Management (`/users`) — Extra
- Avatar initials with unique colour per user
- Role badge styling per role type
- Search, role filter, status filter
- Sortable columns, pagination (8/page)
- Add user modal, edit inline, delete with confirm

### 11. Profile (`/profile`) — Extra
- Avatar with customisable colour picker
- Editable personal info, work info, address, bio sections
- Toast notifications on save/error
- Change password section with validation

---

## Theme System

- CSS Variables defined in `src/styles/variables.css`
- Light theme is default; toggled via `data-theme="dark"` on `<html>`
- Persisted in `localStorage`
- Theme toggle button in both header (app) and auth layout

---

## Form Validation Rules

| Rule                     | Applies To                        |
|--------------------------|-----------------------------------|
| Required fields          | All forms                         |
| Email format             | Sign In, Sign Up, Registration    |
| Password min 6 chars     | Sign In                           |
| Password min 8 chars     | Sign Up                           |
| Password uppercase check | Sign Up                           |
| Password match           | Sign Up                           |
| Phone format             | Registration                      |
| Bio min 20 chars         | Registration                      |
| OTP 6-digit              | Verify OTP                        |

---

## Reusable Components

| Component    | Description                                              |
|--------------|----------------------------------------------------------|
| `Badge`      | Status/category label with multiple colour variants      |
| `Button`     | Primary, secondary, ghost, danger variants + loading     |
| `Card`       | Container with optional Header, Body, Footer slots       |
| `LineChart`  | SVG line chart with tooltip, dual-series support         |
| `BarChart`   | SVG bar chart with hover highlight + tooltip             |
| `DonutChart` | SVG donut chart with legend and centre metric            |
| `Input`      | Text/email/password input with validation & error state  |
| `Modal`      | Accessible overlay dialog with backdrop dismiss          |
| `Pagination` | Page controls with ellipsis for large page counts        |
| `Sidebar`    | Collapsible nav with active route highlighting           |

---

## Assumptions Made

1. **No backend** — all data is mock/static; auth is simulated with a 1-2 s delay
2. **Any credentials** sign in successfully (or use the demo button). The app is demo-first.
3. **Any 6-digit OTP** is accepted (the hint text explains this)
4. Product images are loaded from Unsplash URLs (requires internet)
5. "Add to Cart", "Delete User", and "Edit" actions show UI feedback only (no state persistence beyond the session)
6. The app uses `localStorage` to persist the logged-in user and theme preference across page refreshes
7. Charts are implemented with raw SVG — no third-party chart library was used
8. Forgot Password and profile save actions are simulated (no real email/backend)
