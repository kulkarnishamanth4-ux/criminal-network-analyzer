# CrimeNet Intelligence Command: Tactical Offline Capabilities & Setup Guide

This document details the configuration, architecture, and step-by-step demonstration procedures for the 6 major tactical upgrades implemented for CrimeNet. All features operate with zero external internet dependencies, meeting strict air-gapped military and law enforcement operational standards.

---

## 1. Custom Offline LLM (RAG) & Tactical Voice Copilot

### Architecture
- **Offline Graph RAG Engine**: Located at [`backend/ai/local_llm.py`](file:///c:/Users/girig/OneDrive/Desktop/SIH/backend/ai/local_llm.py). Synthesizes topological intelligence (PageRank centrality, betweenness cash bridges, community syndicate clusters, and anomaly alerts) directly from the local SQLite/Postgres graph without requiring external cloud API calls.
- **Local Ollama Integration**: Automatically checks for an offline Ollama daemon (`http://localhost:11434`) running models such as `llama3.2` or `mistral`. If Ollama is present, it pipes the deep case context into the model offline. If not, it executes CrimeNet's deterministic graph reasoning inference engine.
- **Voice Intent Controller**: Located at [`backend/ai/voice_controller.py`](file:///c:/Users/girig/OneDrive/Desktop/SIH/backend/ai/voice_controller.py) and [`backend/api/routes_voice.py`](file:///c:/Users/girig/OneDrive/Desktop/SIH/backend/api/routes_voice.py). Parses speech into structured actions: `NAVIGATE`, `SWITCH_CASE`, `SELECT_ENTITY`, `FILTER_RISK`, `RESET_CANVAS`, `QUERY_AI`.
- **Frontend HUD**: [`frontend/src/components/VoiceControlHUD.jsx`](file:///c:/Users/girig/OneDrive/Desktop/SIH/frontend/src/components/VoiceControlHUD.jsx) utilizing the Web Speech API with bidirectional synthetic tactical voice feedback (`window.speechSynthesis`).

### How to Access & Test
1. Click the **Voice Copilot** button in the top navigation bar, or press keyboard shortcut **Alt + V** (or **Ctrl + Space**).
2. The Voice Tactical Copilot floating HUD will open in the bottom-right corner.
3. Tap the microphone button (or type a command in the override input):
   - *"Open experimental labs"* -> Automatically launches the Experimental Labs modal.
   - *"Switch to Gujarat case"* -> Switches active investigation workspace to Surat Hawala.
   - *"Focus on Abu Salem"* -> Centers graph canvas and pulls up Abu Salem's dossier.
   - *"Filter high risk"* -> Highlights critical risk nodes in the network.
   - *"Reset canvas"* -> Re-centers the Cytoscape graph canvas.
   - *"Who is the kingpin?"* -> Synthesizes tactical hierarchy from the graph RAG engine.

---

## 2. Head of Department (HOD) Authorization via RFC 6238 TOTP

### Architecture
- **Cryptographic TOTP Backend**: Located at [`backend/api/routes_auth.py`](file:///c:/Users/girig/OneDrive/Desktop/SIH/backend/api/routes_auth.py). Implements standard RFC 6238 Time-Based One-Time Passwords (HMAC-SHA1 with 30-second rolling step).
- **Persistent Supervisory Secret**: Saved at [`backend/data/hod_secret.key`](file:///c:/Users/girig/OneDrive/Desktop/SIH/backend/data/hod_secret.key). Can be imported directly into Google Authenticator, Microsoft Authenticator, or FreeOTP without network connectivity using standard `otpauth://` URIs.
- **Audit Integration**: Every clearance grant and failed authorization attempt is cryptographically logged into the tamper-evident SIEM ledger (`backend/data/audit_trail.jsonl`).
- **Frontend Clearance Modal**: [`frontend/src/components/HODAuthModal.jsx`](file:///c:/Users/girig/OneDrive/Desktop/SIH/frontend/src/components/HODAuthModal.jsx) with a 6-box auto-advancing input, live countdown ring, and emergency override mechanism.

### How to Access & Test
1. Click the **Intelligence Suite** dropdown in the top header and select **HOD 2FA Clearance**.
2. The modal prompts for a 6-digit cryptographic verification key.
3. For hackathon evaluation and demonstration:
   - Click **Show Evaluation / Offline HOD Token** at the bottom of the modal to view the live rolling 6-digit key.
   - Click **Autofill Active HOD Code** to automatically insert the rolling key and click **Authorize Operation**.
   - Alternatively, enter emergency master override PIN `999786`.
4. The system validates the token, issues an ephemeral clearance grant token, and logs the event to the SIEM chain.

---

## 3. Completely Offline Air-Gapped Operation from the Start

### Architecture
- **Configuration Switch**: In [`backend/config.py`](file:///c:/Users/girig/OneDrive/Desktop/SIH/backend/config.py), `USE_LOCAL_SQLITE = True` is the default. The system boots directly into local file database `criminal_network.db` without attempting any outbound network connections.
- **Schema Parity**: Complete relational schema matching PostgreSQL with `case_id` indexing across `entities`, `relationships`, `firs`, `anomalies`, and `uploaded_files`.
- **Pre-Seeded Tactical Baseline**: Contains pre-computed topologies for Operation Syndicate (Dawood D-Company) and regional modules, ready for instantaneous queries with zero initialization latency.

### How to Access & Test
1. Disconnect your machine from Wi-Fi or Ethernet.
2. Start the backend:
   ```powershell
   .\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```
3. The server prints `Backend initialized with offline SQLite! Total routes: 55` and functions completely without internet access.
4. If you wish to toggle back to Supabase cloud PostgreSQL, set `$env:USE_LOCAL_SQLITE="false"`.

---

## 4. Universal Multi-Format Evidence Ingestion (.pdf, .docx, .xlsx, .xls, .md, .txt, .csv)

### Architecture
- **Conversion Pipeline**: Located at [`backend/nlp/universal_converter.py`](file:///c:/Users/girig/OneDrive/Desktop/SIH/backend/nlp/universal_converter.py). Extracts raw binary streams into either clean narrative text (for FIR processing via SpaCy NLP) or tabular data (for CDR, financial ledger, and vehicle sightings).
  - `.pdf`: Multi-page text and table extraction using `pypdf`.
  - `.docx`: Paragraphs and structured grid extraction using `python-docx`.
  - `.xlsx` / `.xls`: Multi-sheet tabular parsing using `openpyxl` and `pandas`.
  - `.md`: Markdown syntax stripping to clean plain text.
  - `.txt` / `.csv`: Normalized UTF-8 decoding.
- **Auto-Classifier**: Inspects column headers and content patterns to automatically classify files as CDR, Financial, Vehicle, or FIR without manual user tagging.
- **API Endpoints**:
  - `POST /api/upload/auto`: Universal single-drop endpoint.
  - Wrapped endpoints: `POST /api/upload/fir`, `/cdr`, `/financial`, `/vehicle` all accept any file format transparently.
- **Frontend UI**: [`frontend/src/components/UploadModal.jsx`](file:///c:/Users/girig/OneDrive/Desktop/SIH/frontend/src/components/UploadModal.jsx) with **Universal Ingestion (Auto-Detect Any Format)** tab.

### How to Access & Test
1. Click **Data Ingestion** in the top navigation bar.
2. The default active tab is **Universal Ingestion (Auto-Detect Any Format)**.
3. Drag and drop any `.pdf`, `.docx`, `.xlsx`, or `.md` file into the dropzone.
4. CrimeNet automatically parses the document, classifies its intelligence domain, maps extracted nodes and edges into the network graph, and recalculates PageRank and betweenness centrality metrics in the background.

---

## 5. Smartwatch Tactical Companion HUD (/watch)

### Architecture
- **Tactical Micro-HUD**: Located at [`frontend/src/components/WatchCompanion.jsx`](file:///c:/Users/girig/OneDrive/Desktop/SIH/frontend/src/components/WatchCompanion.jsx). Designed for ultra-compact 360x360 to 454x454 viewports (Wear OS, Apple Watch, Samsung Galaxy Watch, Garmin Tactix).
- **Bezel Simulation**: Features an interactive circular and square hardware bezel simulator right in the browser for testing and demonstration.
- **Features Included**:
  - Live military time and air-gapped status indicator.
  - Case quick switcher.
  - Live Threat Ticker (pulsing CRITICAL anomalies).
  - Target Suspect Quick Bios (centrality scores and roles).
  - 1-Tap Field HOD Authorization trigger.
  - Voice Command trigger button.

### How to Access & Test
- **Method A (Header Button)**: Click the **Watch HUD** button in the top navigation bar.
- **Method B (URL Parameter)**: Open `http://localhost:5173/?mode=watch` in any browser.
- Toggle between **Circular Bezel** (Wear OS) and **Square Bezel** using the button at the top of the watch display.
- Tap **ALERTS**, **TARGETS**, or **HOD KEY** tabs on the watch screen.
- Click **Exit Watch HUD** to return to the full desktop command canvas.

---

## 6. PWA & Android APK Packaging

### Architecture
- **Web App Manifest**: Configured at [`frontend/public/manifest.json`](file:///c:/Users/girig/OneDrive/Desktop/SIH/frontend/public/manifest.json) with standalone display mode, theme colors, and icons.
- **Offline Service Worker**: Located at [`frontend/public/sw.js`](file:///c:/Users/girig/OneDrive/Desktop/SIH/frontend/public/sw.js) implementing stale-while-revalidate offline caching for application assets.
- **Capacitor Configuration**: Configured at [`frontend/capacitor.config.json`](file:///c:/Users/girig/OneDrive/Desktop/SIH/frontend/capacitor.config.json) setting Android Application ID `in.gov.sih.crimenet`.
- **Build Scripts**:
  - Windows Batch Script: [`scripts/build_apk.bat`](file:///c:/Users/girig/OneDrive/Desktop/SIH/scripts/build_apk.bat)
  - Unix / Linux / macOS Shell Script: [`scripts/build_apk.sh`](file:///c:/Users/girig/OneDrive/Desktop/SIH/scripts/build_apk.sh)

### How to Access & Test
#### Testing Progressive Web App (PWA) Mode:
1. Run the frontend: `npm run dev` or `npm run preview`.
2. Open Chrome, Edge, or Android Chrome.
3. An **Install App** icon appears in the browser address bar. Click Install to run CrimeNet as a standalone desktop or mobile application without browser frames.

#### Compiling the Native Android APK:
1. Run the packaging automation script:
   ```cmd
   scripts\build_apk.bat
   ```
2. The script builds the production Vite bundle, initializes the Capacitor Android native workspace, and invokes Gradle to assemble the debug APK:
   `frontend\android\app\build\outputs\apk\debug\app-debug.apk`
3. Install on any Android device via ADB:
   ```cmd
   adb install frontend\android\app\build\outputs\apk\debug\app-debug.apk
   ```

---

## 7. Automated Test & Verification Suite

A full test suite verifying all 6 features end-to-end is provided at [`scripts/test_all_features.py`](file:///c:/Users/girig/OneDrive/Desktop/SIH/scripts/test_all_features.py).

To execute the test suite:
```powershell
.\backend\venv\Scripts\python.exe .\scripts\test_all_features.py
```

Expected output:
```text
==================================================================
Starting Comprehensive Verification of All 6 Implementations
==================================================================
[TEST 1/6] Testing Offline SQLite Database...
PASS: SQLite database initialized with 22 entities.
[TEST 2/6] Testing Custom Offline LLM & Graph RAG Engine...
PASS: Offline LLM synthesized response: Network Hierarchy Assessment...
[TEST 3/6] Testing Voice Control Intent Parser...
PASS: Voice intent parser correctly identified navigation, case switch, and suspect focus.
[TEST 4/6] Testing HOD Two-Factor Authorization (RFC 6238 TOTP)...
PASS: HOD TOTP verification working. Live demonstration token: 377860
[TEST 5/6] Testing Universal Ingestion Engine (.md, .csv, .docx, .xlsx, .pdf)...
PASS: Universal file converter successfully converted and classified documents.
[TEST 6/6] Testing Smartwatch HUD compatibility...
PASS: Smartwatch data feeds operational (22 nodes, 2 alerts).
==================================================================
ALL 6 FEATURES PASSED FULL VERIFICATION SUCCESSFULLY
==================================================================
```
