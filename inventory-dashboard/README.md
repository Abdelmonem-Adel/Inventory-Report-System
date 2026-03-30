# Inventory Analysis Dashboard

A premium, production-ready React 18 dashboard for inventory analysis.

## Features
- **Inventory View**: KPI cards, advanced filtering, current inventory table, critical expiry alerts, and category analysis charts.
- **Location View**: Location-based KPIs, per-item location breakdown, status distribution, and discrepancy tracking.
- **Productivity View**: Comprehensive scans detail table with pagination and multi-field search.
- **Data Export**: CSV and Excel export options for all major tables.
- **Dynamic Charts**: Interactive Recharts visualizations.
- **Responsive Design**: Full TailwindCSS implementation with glassmorphism and modern aesthetics.

## Tech Stack
- React 18 + Vite
- TailwindCSS v3
- TanStack Table v8 (Data Tables)
- TanStack Query v5 (Data Fetching)
- Recharts (Charts)
- Lucide React (Icons)
- axios, date-fns, xlsx

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd inventory-dashboard
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Note: The vite config is pre-configured to proxy `/api` to `http://localhost:5000`.*

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `/src/api`: Axios client and TanStack Query hooks.
- `/src/components`: UI components, layout, charts, and tables.
- `/src/utils`: Data computation, formatting, and export logic.
- `/src/views`: Main dashboard views.
