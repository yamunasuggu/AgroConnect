# AgroConnect – Farm-to-Market Platform

> **“From Farm to Market, Directly.”**  
> A production-style, full-stack digital agriculture marketplace connecting farmers directly with wholesale buyers and consumers. Features direct crop batch listings, real-time escrow order tracking, transparent mandi price benchmarking, and a grounded **AI Farmer Assistant**.

---

## 1. Project Overview & Core Mission

Agricultural supply chains often suffer from 4 to 6 intermediary layers (local village brokers, commission agents, regional APMC traders, secondary wholesalers, retailers), leading to **15%–40% farmer value erosion** and consumer markups.

**AgroConnect** solves this by establishing direct digital farmgate trading:
- **Farmers** publish harvest batches, set their own prices per kg/quintal/tonne, upload produce photos, track incoming orders, and manage sales.
- **Wholesale Buyers** search fresh crops by category, location, and price, compare regional mandi rates, place escrow-backed orders, and track harvest-to-doorstep milestones.
- **Admins** moderate listings, verify accredited growers, analyze platform revenue and location demand, and curate the **Approved Agricultural Knowledge Base**.
- **AI Farmer Assistant** utilizes live marketplace order data and verified ICAR agronomy manuals to provide explainable demand indicators (*Low / Moderate / High*), average prices, sales totals, and clinical plant disease guidance.

---

## 2. System Architecture

```text
                                AGROCONNECT PLATFORM
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
           FARMER PORTAL           BUYER PORTAL            ADMIN CONSOLE
                 │                       │                       │
                 ▼                       ▼                       ▼
           Crop Listings           Search & Filter         User Moderation
          Stock Management         Direct Ordering         Analytics & Stats
          Order Acceptance         Order Tracking         Approved Knowledge
                 │                       │                       │
                 └───────────────┬───────┘                       │
                                 ▼                               │
                       TRANSACTION ENGINE                        │
                       • Stock Decrement                         │
                       • Escrow Milestone Logs                   │
                       • Review & Ratings                        │
                                 │                               │
                                 ▼                               ▼
                      MARKETPLACE DATA & MONGODB ◄───────────────┘
                                 │
                                 ▼
                     DEMAND INDICATOR FORMULA
              [Recent Requested Qty / Available Qty]
                                 │
                                 ▼
                      AI FARMER ASSISTANT
            (Gemini 3.8 Flash + DB Grounding)
```

---

## 3. Technology Stack

### Frontend
- **React.js 19** with TypeScript
- **Vite 8** (Lightning fast dev and asset bundling)
- **Tailwind CSS v4** (Modern utility styling and design tokens)
- **Lucide React** (Consistent agricultural and UI iconography)
- **SVG Real-Time Charting** (7-day commodity trend visualization)
- **Context API** (Persistent authentication, user role switching, and session management)

### Backend (Full Stack Runtime + FastAPI Module)
- **Express / Node.js Engine (`server.ts`)**: Powers the live interactive preview on port 3000 with unified REST endpoints, persistent storage (`server/db.ts`), and server-side Google GenAI proxy.
- **Python FastAPI Codebase (`/backend`)**: Complete modular backend code with Pydantic v2 schemas, Motor async MongoDB driver, JWT authentication, and dependency injection.
- **Google GenAI SDK (`@google/genai`)**: Server-side model integration targeting `gemini-3.8-flash`.

### Database Collections (MongoDB Architecture)
1. `users`: Credentials, user role (`farmer`, `buyer`, `admin`), phone, location, farm details.
2. `crops`: Harvest batch, category, unit, quantity, original stock, price per unit, location, rating.
3. `orders`: Buyer, farmer, crop, quantity, total price, payment method, timeline milestone entries.
4. `market_prices`: 7-day historical prices, min/max mandi benchmarks, demand levels.
5. `approved_knowledge`: ICAR-verified disease treatments, post-harvest curing and storage thresholds.
6. `notifications`: Real-time order status updates and market demand alerts.
7. `reviews`: 1–5 star ratings and verified buyer feedback.

---

## 4. Key Functional Modules

### 1. Interactive Demo Role Switcher
Evaluators can switch between realistic persona profiles with **1-click** from the top bar:
- **Ramesh Patel** (Farmer • Guntur, AP • Tomatoes & Chillies)
- **Sunita Devi** (Farmer • Nashik, MH • Red Onions & Potatoes)
- **Aarav Mehta** (Buyer • GreenMart Wholesalers • Hyderabad)
- **Meera Nambiar** (Buyer • FreshTable Hospitality • Bengaluru)
- **Kavita Rao** (Admin • Platform Moderator & Knowledge Base Manager)

### 2. Transparent Demand Indicator (Section 16)
The AI Assistant and price monitors compute demand without inventing fake forecasts:
$$\text{Demand Ratio} = \frac{\text{Recent Requested Order Quantity}}{\text{Available Unsold Stock}}$$
- **High Demand (> 0.8x or ≥ 4 orders)**: Inquiries exceed supply.
- **Moderate Demand (0.3x – 0.8x)**: Healthy supply and steady retail orders.
- **Low Demand (< 0.3x)**: Ample inventory available for bulk purchasing.
*Clear transparency caveat: "Marketplace-derived indicator based on active listings and orders on AgroConnect, not an official governmental market forecast."*

### 3. Visual Order Milestone Lifecycle
Orders follow strict state transitions:
`Pending` $\rightarrow$ `Accepted` $\rightarrow$ `Preparing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`  
*(Alternative: `Pending` $\rightarrow$ `Cancelled` by buyer or `Rejected` by farmer).*

---

## 5. Local Setup Instructions

### Option A: Running the Integrated Full-Stack Web Application (Node / React)
```bash
# 1. Clone the repository
git clone https://github.com/your-username/agroconnect.git
cd agroconnect

# 2. Install dependencies
npm install

# 3. Configure environment variables in .env
cp .env.example .env
# Set GEMINI_API_KEY if testing live LLM responses (optional, robust fallback included)

# 4. Start the full-stack server
npm run dev
# The application opens at http://localhost:3000
```

### Option B: Running the Python FastAPI Backend (`/backend`)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Configure .env
cp .env.example .env
# Provide MONGODB_URI and GEMINI_API_KEY

# 5. Run with Uvicorn
uvicorn app.main:app --reload --port 8000
# OpenAPI Interactive Swagger Docs: http://localhost:8000/docs
```

---

## 6. Cloud Deployment Instructions

### Deploying Frontend to Vercel
1. Push repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), import the repository.
3. Build Settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL.

### Deploying Backend to Render or Railway
1. Create a **Web Service** pointing to `/backend`.
2. Environment: `Python 3.11+`.
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Configure Secrets:
   - `MONGODB_URI`: Connection string from MongoDB Atlas.
   - `JWT_SECRET`: Secure 256-bit key.
   - `GEMINI_API_KEY`: Your Google AI Studio API Key.

### Provisioning MongoDB Atlas
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 Shared Cluster.
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, add `0.0.0.0/0` (Allow from anywhere) or whitelist your Render/Railway IP.
5. Copy connection string and paste into `MONGODB_URI`.

---

## 7. API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & issue token |
| `POST` | `/api/auth/register` | Register new Farmer or Buyer |
| `GET` | `/api/crops` | Filter crops by category, price, location, search |
| `POST` | `/api/crops` | Add new crop batch listing |
| `GET` | `/api/crops/:id` | Get single crop details and farmer profile |
| `GET` | `/api/orders` | List buyer or farmer orders |
| `POST` | `/api/orders` | Place escrow order and decrement stock |
| `PATCH` | `/api/orders/:id/status` | Update milestone (Accepted, Shipped, etc.) |
| `POST` | `/api/orders/:id/review` | Submit 1–5 star rating and comment |
| `GET` | `/api/prices` | Mandi benchmark rates & 7-day history |
| `POST` | `/api/assistant/chat` | AI Farmer Assistant (Grounded Q&A) |
| `GET` | `/api/assistant/market-demand/:crop` | Compute real-time demand ratio |
| `GET` | `/api/admin/analytics` | Platform metrics & distribution |
| `GET` | `/api/admin/knowledge` | Fetch approved agricultural facts |

---

## 8. License & Academic Disclaimer
Developed as a production-style educational and commercial template for direct agricultural trading platforms.
Distributed under the Apache 2.0 License.
