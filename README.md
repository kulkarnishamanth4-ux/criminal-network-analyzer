# CrimeNet Intelligence Command Center

**AI-Powered Criminal Network Analysis System** - SIH26189

> An advanced, hardware-accelerated intelligence suite that analyzes unstructured crime data (FIRs, Call Detail Records, Financial Transactions) to uncover hidden criminal networks, identify key influencers, and detect suspicious patterns.

Built for the **Smart India Hackathon 2026** | Problem Statement sponsored by the **Ministry of Home Affairs**

---

## Features

### Core Intelligence Engine
- **NLP Entity Extraction** - Automatically extracts persons, locations, phone numbers, vehicles, and organizations from raw FIR text using SpaCy and custom Indian entity rules.
- **Crime Classification** - Classifies FIR text into crime categories (Drug Trafficking, Money Laundering, Extortion, etc.) with confidence scores.
- **Interactive Network Graph** - Cytoscape.js-powered visualization showing entity relationships with force-directed layouts. Features high-tech SVG literal icons for nodes (Persons, Phones, Vehicles, Bank Accounts, Locations).
- **Graph Analytics** - PageRank, Betweenness Centrality, and Louvain Community Detection to identify key influencers and criminal clusters.
- **Anomaly Detection** - Flags suspicious patterns: burst calling, circular transactions, geographic anomalies, and ghost connectors.
- **Person 360 Dossier** - Complete profile of any entity with all known connections, criminal history, and risk score.

### Experimental Command Center (Matrix Modules)
A dedicated interface housing advanced mathematical and predictive modules:
1. **Spectral Graph Decapitation** - Finds the minimal strike sequence to shatter cartel networks.
2. **Physical-Exclusive Meetings** - Exposes covert physical meetups between suspects maintaining radio silence.
3. **Optical Plate-Cloning Paradox** - Detects impossible kinematic highway velocities to flag cloned decoy vehicles.
4. **SOCMINT Threat Scanner** - Extracts threat levels, handles, and EXIF coordinates from intercepted social media broadcasts.
5. **Accused Interrogation Simulator** - AI persona mimicking suspect linguistics for mock interrogations.
6. **Criminal Dynasty History** - Hypergraph kinship mapping predicting next-gen cartel successors.
7. **Internal-Leak Analyzer** - Detects corrupt insider leaks via honeytoken beacon traps.

### UI / UX Architecture
- **Cosmic WebGL Landing Page** - A hardware-accelerated interactive particle system (`ogl` and `framer-motion`) welcoming users into the matrix.
- **Matrix Colorway** - Pure black, white, and terminal green interface with zero emojis for a strictly professional, classified environment.
- **Specular Buttons** - Custom GLSL-shaded UI components with reactive hover states.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS + Cytoscape.js + Framer Motion + OGL (WebGL) |
| **Backend** | Python + FastAPI |
| **Database** | SQLite (via SQLAlchemy) |
| **Graph Engine** | NetworkX + python-louvain |
| **NLP** | SpaCy (en_core_web_sm) + Custom EntityRuler + Regex |

**Zero cloud dependencies. Runs 100% offline on any standard laptop.**

---

## Setup & Installation

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

## Running the Application

### Start Backend (Terminal 1)
```bash
# From project root
cd backend
venv\Scripts\activate  # Windows
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*Note: The backend is configured to automatically seed the database with a high-fidelity narrative Cartel dataset upon its first empty startup.*

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Project Structure

```
├── backend/                  # FastAPI Application
│   ├── api/                  # REST API Route Handlers (13 domain routers)
│   ├── database/             # SQLAlchemy ORM Models, Schemas & CRUD
│   ├── graph/                # NetworkX Graph Engines & Mathematical Algorithms
│   ├── nlp/                  # SpaCy NLP Pipeline, Universal Ingestion, Stylometry
│   ├── security/             # Cryptographic SIEM Audit Logger & Guardrails
│   ├── blockchain/           # Forensic Evidence Blockchain Ledger & Section 65B
│   ├── config.py             # Server & Environment Configuration
│   └── main.py               # Application Entrypoint & Startup Tasks
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── api/              # Axios Client & Offline Data Bridge
│   │   ├── components/       # UI Modals, Graph Canvas, Command Center Panels
│   │   └── data/             # Air-Gapped Offline Intelligence Bundles
│   └── public/samples/       # Downloadable Evidence Files (.xlsx, .pdf, .docx, .csv, .txt)
├── docs/                     # Technical Guides & Architectural Reference
│   ├── API_DOCUMENTATION.md                  # Complete REST API Endpoint Reference
│   ├── SYSTEM_ARCHITECTURE_AND_MATH_EXPLAINED.md # Graph Theory, percolation & formulas
│   └── OFFLINE_FEATURES_SETUP_GUIDE.md       # Air-gapped & local setup instructions
├── scripts/                  # Data Seeding, Offline Bundling & Test Utilities
├── uploads/                  # Temporary Multi-Format Ingestion Staging
├── render.yaml               # Deployment Configuration
└── README.md                 # Project Overview & Quickstart Guide
```

---

## Documentation

For in-depth mathematical proofs, architecture diagrams, and API references:
- 📖 [Complete REST API Documentation](docs/API_DOCUMENTATION.md)
- 📐 [System Architecture & Mathematical Formulas](docs/SYSTEM_ARCHITECTURE_AND_MATH_EXPLAINED.md)
- 🔒 [Air-Gapped & Offline Setup Guide](docs/OFFLINE_FEATURES_SETUP_GUIDE.md)

---

## Team

Built for **SIH 2026** - Problem Statement SIH26189

---

## License

This project is built for educational and hackathon purposes.

