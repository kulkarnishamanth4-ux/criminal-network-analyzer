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
A dedicated, hardware-accelerated MacOS-style dock interface housing advanced mathematical and predictive modules:
1. **Spectral Graph Decapitation** - Finds the minimal strike sequence to shatter cartel networks.
2. **Physical-Exclusive Meetings** - Exposes covert physical meetups between suspects maintaining radio silence.
3. **Optical Plate-Cloning Paradox** - Detects impossible kinematic highway velocities to flag cloned decoy vehicles.
4. **Hawala Betrayal Index** - Models financial conduits as fluid pipes to simulate account freeze cascades and calculate internal betrayal risk.
5. **Accused Interrogation Simulator** - AI persona mimicking suspect linguistics for mock interrogations.
6. **Acoustic Geo-Triangulation** - Decomposes 50Hz mains power micro-drift to geolocate audio intercepts.
7. **Confession-Probability Index** - Chronobiological Shannon Entropy tracking to pinpoint confession windows.
8. **Voice-Cloned Sting Honeypot** - Autonomous AI victim persona stalling scammers to extract intelligence.
9. **Arrest Aftermath Predictor** - Forecasts non-linear retaliatory and power-vacuum cascades following suspect arrests.
10. **Criminal Dynasty History** - Hypergraph kinship mapping predicting next-gen cartel successors.
11. **Vulnerability Detection Counter AI** - Adversarial underworld AI that attacks CrimeNet to discover blind spots.
12. **Syntax DNA Stylometry** - Linguistic fingerprinting to match anonymous manifestos to known suspects.
13. **Criminal-Slang Analyzer** - Translates underworld euphemisms and masked criminal code words in real-time.
14. **Internal-Leak Analyzer** - Detects corrupt insider leaks via honeytoken beacon traps.
15. **SOCMINT Threat Scanner** - Extracts threat levels, handles, and EXIF coordinates from intercepted social media broadcasts.

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

## Automated Demo Data Seeding

The platform includes an advanced synthetic data generator (`scripts/seed_rich_data.py`). If the database is empty when the backend starts, it automatically injects a deeply interconnected narrative dataset ("The Syndicate X Takedown") designed specifically to mathematically trigger all 15 Experimental Modules.

This dataset includes:
- Complex Hawala financial loops (Smurfing)
- Geo-temporal anomalies for Plate Cloning algorithms
- Ghost Rendezvous timeline triggers
- Retaliatory trigger FIRs for Gang War Cascades
- Burst Calling networks for Panic Entropy tracking

---

## Team

Built for **SIH 2026** - Problem Statement SIH26189

---

## License

This project is built for educational and hackathon purposes.
