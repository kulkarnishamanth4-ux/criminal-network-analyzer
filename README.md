# 🕵️ CrimeNet Intelligence Platform

**AI-Powered Criminal Network Analysis System** — SIH26189

> An intelligent system that analyzes unstructured crime data (FIRs, Call Detail Records, Financial Transactions) to uncover hidden criminal networks, identify key influencers, and detect suspicious patterns.

Built for the **Smart India Hackathon 2026** | Problem Statement sponsored by the **Ministry of Home Affairs**

---

## 🚀 Features

- **NLP Entity Extraction** — Automatically extracts persons, locations, phone numbers, vehicles, and organizations from raw FIR text using SpaCy + custom Indian entity rules
- **Crime Classification** — Classifies FIR text into crime categories (Drug Trafficking, Money Laundering, Extortion, etc.) with confidence scores
- **Interactive Network Graph** — Cytoscape.js-powered visualization showing entity relationships with force-directed layouts
- **Graph Analytics** — PageRank, Betweenness Centrality, and Louvain Community Detection to identify key influencers and criminal clusters
- **Anomaly Detection** — Flags suspicious patterns: burst calling, circular transactions, geographic anomalies, ghost connectors
- **Predictive Link Analysis** — Predicts hidden connections between suspects who have no direct contact
- **Person 360° Dossier** — Complete profile of any entity with all known connections, criminal history, and risk score
- **Multi-Source Data Fusion** — Upload FIRs (.txt), CDRs (.csv), Financial Records (.csv), and Vehicle Sightings (.csv)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS + Cytoscape.js |
| **Backend** | Python + FastAPI |
| **Database** | SQLite (via SQLAlchemy) |
| **Graph Engine** | NetworkX + python-louvain |
| **NLP** | SpaCy (en_core_web_sm) + Custom EntityRuler + Regex |

**Zero cloud dependencies. Runs 100% offline on any laptop.**

---

## 📦 Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 8+

### Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Frontend Setup
```bash
cd frontend
npm install
```

---

## ▶️ Running the Application

### Start Backend (Terminal 1)
```bash
# From project root
cd backend
venv\Scripts\activate  # Windows
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
> Note: Run uvicorn from the **project root** (parent of backend/), not from inside backend/

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📊 Loading Demo Data

The project includes synthetic crime data for demonstration:
- 30 FIR text files with realistic Indian crime reports
- 500 Call Detail Records
- 200 Financial Transactions  
- 100 Vehicle Sightings

Upload these via the UI's upload button, or use the API:
```bash
# Upload all FIRs
for file in backend/data/synthetic/firs/*.txt; do
  curl -X POST http://localhost:8000/api/upload/fir -F "file=@$file"
done

# Upload CDR
curl -X POST http://localhost:8000/api/upload/cdr -F "file=@backend/data/synthetic/cdr_records.csv"

# Upload Financial Records
curl -X POST http://localhost:8000/api/upload/financial -F "file=@backend/data/synthetic/financial_transactions.csv"
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/fir` | Upload FIR text file |
| POST | `/api/upload/cdr` | Upload CDR CSV |
| POST | `/api/upload/financial` | Upload financial CSV |
| POST | `/api/upload/vehicle` | Upload vehicle sighting CSV |
| GET | `/api/search?q=rajesh` | Search entities |
| GET | `/api/network/{id}?depth=2` | Get entity ego-network |
| GET | `/api/graph/full` | Get full graph |
| GET | `/api/entity/{id}/dossier` | Get entity 360° profile |
| GET | `/api/analytics/top-influencers` | Top entities by PageRank |
| GET | `/api/analytics/communities` | Detected communities |
| GET | `/api/analytics/anomalies` | Flagged anomalies |
| GET | `/api/analytics/crime-predictions` | Crime type predictions |
| GET | `/api/analytics/predicted-links` | Predicted hidden links |
| GET | `/api/analytics/dashboard-stats` | Dashboard summary |

---

## 🏛️ Architecture

```
┌────────────────────────────────────────────────────────┐
│              React + Cytoscape.js Frontend              │
│         Dark "Cyber Command Center" Dashboard           │
└──────────────────────┬─────────────────────────────────┘
                       │ REST API
┌──────────────────────▼─────────────────────────────────┐
│                  FastAPI Backend                        │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────┐   │
│  │ NLP      │  │ Graph     │  │ Analytics         │   │
│  │ Engine   │  │ Engine    │  │ Engine            │   │
│  │ SpaCy +  │  │ NetworkX  │  │ Anomaly Detection │   │
│  │ Regex    │  │ PageRank  │  │ Crime Prediction  │   │
│  │ Gazetter │  │ Louvain   │  │ Link Prediction   │   │
│  └──────────┘  └───────────┘  └───────────────────┘   │
│                    SQLite                               │
└────────────────────────────────────────────────────────┘
```

---

## 👨‍💻 Team

Built for **SIH 2026** — Problem Statement SIH26189

---

## 📄 License

This project is built for educational and hackathon purposes.
