# 🦺 Smart Helmet Detection System for Industrial Workers

An automated computer vision PPE (Personal Protective Equipment) compliance monitoring system designed for industrial construction sites. The system performs real-time YOLO11 inference to detect Helmets, Safety Vests, and Personnel, evaluates safety compliance, logs audit history into MongoDB Atlas, and provides an industrial-grade monitoring dashboard.

---

## 🚀 Key Features

- **YOLO11 PPE Detection**:
  - Class `0`: **Helmet** (Compliant)
  - Class `1`: **No-Helmet** (Safety Violation)
  - Class `2`: **No-Vest** (Safety Violation)
  - Class `3`: **Person** (Industrial Personnel)
  - Class `4`: **Vest** (Compliant)
- **FastAPI REST Backend**:
  - `POST /api/detect`: Uploads an image, performs inference, generates OpenCV annotations, computes compliance rates, and persists records to MongoDB Atlas.
  - `GET /api/dashboard/stats`: Returns aggregated KPI statistics, compliance distributions, and recent feeds.
  - `GET /api/history`: Paginated and filterable inspection history logs.
  - `GET /api/health`: Health monitoring endpoint for model and database connectivity.
- **MongoDB Atlas Integration**:
  - Securely configured via `.env`.
  - Persists detection metadata, worker counts, violation breakdowns, and timestamped audit logs.
  - Graceful in-memory fallback mode for local testing without active Atlas credentials.
- **Modern Industrial Frontend**:
  - Built with **React 18**, **Vite**, and **Tailwind CSS**.
  - Dark industrial theme with real-time safety indicators, circular compliance gauge, entity breakdown charts, side-by-side inspection viewer, and audit modals.

---

## 📁 Project Structure

```text
SmartHelmet/
├── best.pt                             # Pre-trained YOLO11 model weights
├── .gitignore                          # Protects credentials and build artifacts
├── README.md                           # Project documentation
│
├── backend/                            # FastAPI Python Backend
│   ├── requirements.txt                # Dependencies
│   ├── .env.example                    # Backend environment template
│   ├── .env                            # MongoDB Atlas URI & configuration
│   └── app/
│       ├── main.py                     # Application entry point & CORS
│       ├── core/config.py              # Pydantic settings & env loader
│       ├── db/mongodb.py               # MongoDB Atlas connection & CRUD operations
│       ├── models/detection.py         # Pydantic schemas & response models
│       ├── services/yolo_service.py    # YOLO11 inference & safety compliance logic
│       ├── routers/
│       │   ├── detection.py            # /api/detect & /api/health
│       │   └── analytics.py            # /api/dashboard/stats & /api/history
│       └── utils/image_utils.py        # OpenCV annotation & Base64 encoder
│
└── frontend/                           # React + Vite + Tailwind CSS Frontend
    ├── package.json                    # Frontend dependencies
    ├── vite.config.js                  # Vite dev server with /api proxy
    ├── tailwind.config.js              # Industrial safety design system
    ├── index.html                      # HTML template
    └── src/
        ├── main.jsx                    # React entrypoint
        ├── App.jsx                     # Main application layout & state
        ├── index.css                   # Global styles & glassmorphism
        ├── api/client.js               # Axios client for backend API
        ├── components/
        │   ├── layout/                 # Navbar & Sidebar
        │   ├── dashboard/              # StatCards, ComplianceChart, RecentActivity
        │   ├── detection/              # ImageUploader, DetectionViewer, SafetyBanner, DetectionStats
        │   └── history/                # HistoryTable, HistoryDetailModal
        └── utils/formatters.js         # Date & badge formatters
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Python 3.10+** (with pip)
- **Node.js 18+** & **npm**
- **MongoDB Atlas** account (or local MongoDB)

---

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your MongoDB Atlas connection in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority
   DATABASE_NAME=smart_helmet_db
   CONFIDENCE_THRESHOLD=0.30
   ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend API will run at `http://localhost:8000`. Interactive Swagger API docs are available at `http://localhost:8000/docs`.

---

### 3. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 🔒 Security Practices
- MongoDB credentials and connection strings are loaded exclusively from `.env` via `pydantic-settings`.
- `.env` files are strictly excluded via `.gitignore` to prevent leaking secrets.
- Images are processed in-memory for inference and annotation; raw image binary files are not bloated into MongoDB.
