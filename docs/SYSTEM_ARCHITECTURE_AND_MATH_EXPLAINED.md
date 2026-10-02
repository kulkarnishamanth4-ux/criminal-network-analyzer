# Criminal Network Analysis System: Technical Architecture and Mathematical Foundations

This document provides a comprehensive, technically rigorous, yet easy-to-understand explanation of the internal mathematics, algorithms, AI pipelines, system architecture, and graph mechanics behind the Criminal Network Analysis Platform.

---

## 1. Mathematical Mechanics of Predictive Intelligence

### 1.1 Overview and Objective
The Predictive Intelligence module determines the most probable criminal activities operating within a network or sub-cartel (e.g., Money Laundering, Narcotics Trafficking, Extortion, Arms Smuggling, Cybercrime, Kidnapping).

Rather than guessing, it evaluates a deterministic, multi-factor indicator model grounded in forensic evidentiary thresholds.

### 1.2 The Weighted Scoring Model
Every crime category $C$ possesses a defined profile containing a set of behavioral indicators $I(C) = \{i_1, i_2, \dots, i_n\}$, where each indicator $i$ has an assigned evidentiary weight $w_i \in [10, 30]$:

$$TotalWeight(C) = \sum_{i \in I(C)} w_i$$

When an investigation graph or specific community cluster is analyzed, the system tests for the physical presence of each indicator in the database:
- Are there circular financial transactions?
- Does the network display a hub-and-spoke topology?
- Are there late-night burst calling patterns?
- Are there specific FIR legal sections or narcotics keywords present?

Let $M(C) \subseteq I(C)$ be the subset of indicators that are confirmed active. The raw confidence score $S(C)$ is calculated as:

$$S(C) = \frac{\sum_{i \in M(C)} w_i}{\sum_{j \in I(C)} w_j} \times 100\%$$

### 1.3 Domain Gating and Indicator Verification
To prevent false positives (for instance, flagging an ordinary commercial dispute as drug trafficking simply because multiple phone calls occurred), the engine applies **Primary Domain Indicator Gating**:
1. For every crime category, at least one core domain indicator must be satisfied (such as explicit narcotics keywords or seized contraband in FIRs for drug trafficking, or hawala/shell accounts for money laundering).
2. If the core domain indicator is not satisfied, non-specific secondary indicators (such as high call volume or vehicle movements) are suppressed.
3. A crime category is only presented in the predictive intelligence roster if its final confidence meets or exceeds the baseline threshold:

$$Confidence(C) \ge 35\%$$

### 1.4 Integration of Formal Police Charge-Sheet Data
If an uploaded First Information Report (FIR) cites specific legal statutory sections under the Indian Penal Code (IPC) or Special and Local Laws (SLL), the model incorporates these statutory signals directly into the probability vector:
- NDPS Act (Sections 8, 20, 21, 22) -> Narcotics Trafficking (+30 base weight).
- PMLA Act (Sections 3, 4) or IPC 420/467/471 -> Money Laundering / Forgery (+30 base weight).
- IPC 384/386/387 -> Extortion (+30 base weight).
- Arms Act (Sections 3, 25) -> Arms Smuggling (+30 base weight).

---

## 2. Threat Classification and Risk Scoring Basis

### 2.1 Composite Risk Score Formulation
An entity in the network (Person, Phone Number, Bank Account, Vehicle, Organization) is classified into a threat tier based on a normalized composite risk metric between 0 and 100:

$$RiskScore(v) = 100 \times \left( \alpha \cdot PR_{norm}(v) + \beta \cdot BC_{norm}(v) + \gamma \cdot Deg_{norm}(v) + \delta \cdot Anom_{norm}(v) + \epsilon \cdot Fin_{norm}(v) \right)$$

Where the standard operational coefficients are:
- $\alpha = 0.30$ (PageRank influence / Structural Authority)
- $\beta = 0.25$ (Betweenness Centrality / Bridge Brokerage)
- $\gamma = 0.15$ (Degree Centrality / Volume of direct connections)
- $\delta = 0.20$ (Anomaly Penalties / Behavioral red flags)
- $\epsilon = 0.10$ (Financial Magnitude / Capital velocity)

Subject to the normalization constraint: $\alpha + \beta + \gamma + \delta + \epsilon = 1.0$.

### 2.2 Mathematical Metrics Explained
1. **Normalized PageRank ($PR_{norm}$)**: Measures structural influence. An entity has high PageRank if it is connected to by other high-influence entities:
   $$PR(u) = \frac{1 - d}{N} + d \sum_{v \in In(u)} \frac{PR(v)}{Out(v)}$$
   where $d = 0.85$ (the damping factor) and $N$ is the total number of nodes in the graph.
2. **Normalized Betweenness Centrality ($BC_{norm}$)**: Measures how often entity $v$ sits on the shortest path between any two other entities $(s, t)$:
   $$BC(v) = \sum_{s \ne v \ne t} \frac{\sigma_{st}(v)}{\sigma_{st}}$$
   where $\sigma_{st}$ is the total number of shortest paths from $s$ to $t$, and $\sigma_{st}(v)$ is the number of those paths that pass through $v$.
3. **Degree Centrality ($Deg_{norm}$)**: Ratio of an entity's direct connections to the maximum possible connections in the graph:
   $$Deg_{norm}(v) = \frac{\deg(v)}{N - 1}$$
4. **Anomaly Factor ($Anom_{norm}$)**: A penalty factor scaled by the number and severity of flagged red flags involving entity $v$:
   $$Anom(v) = \sum_{a \in Anomalies(v)} Weight(Severity_a)$$
   where Critical = 1.0, High = 0.7, Medium = 0.4, Low = 0.2.

### 2.3 Threat Tiers and Cutoff Thresholds

| Threat Tier | Score Range | Operational Meaning | Action Protocol |
| :--- | :--- | :--- | :--- |
| **Critical Threat** | 75 to 100 | Kingpin, Mastermind, or Primary Hawala Hub | Immediate surveillance, priority wiretap, freezing of assets |
| **High Threat** | 50 to 74 | Key Broker, Regional Lieutenant, or Logistics Controller | Dossier compilation, interrogation target, movement tracking |
| **Medium Threat** | 25 to 49 | Mule, Courier, Foot Operative, or Suspect Associate | Monitoring, CDR analysis, cross-case correlation |
| **Low Threat** | 0 to 24 | Peripheral contact, incidental witness, or low-activity node | Logged in database for long-term pattern linking |

### 2.4 Structural Role Archetypes Identified by Centrality

```
High PageRank + High Betweenness  --> Cartel Kingpin / Boss
Low Degree   + High Betweenness  --> Covert Fixer / Inter-gang Broker
High Degree  + Low Betweenness   --> Foot Soldier / Call Center Dispatcher / Courier
High Volume  + High Degree       --> Shell Entity / Hawala Collection Node
```

---

## 3. Threat and Anomaly Flagging Logic

The system continuously runs five automated graph anomaly detectors against the synchronized relational and graph databases.

### 3.1 Circular Transactions (Hawala / Money Laundering Detector)
- **Logic**: In legitimate commerce, money flows from buyer to supplier to producer. In money laundering, illicit capital is routed through intermediary accounts and eventually returns to the originator or an affiliated shell entity to fabricate legitimate paper trails.
- **Algorithm**: Tarjan's strongly connected components and Johnson's elementary cycle finding algorithm on the directed financial subgraph $G_{fin} = (V, E_{transfers})$.
- **Detection Condition**: Any elementary directed cycle:
  $$A \xrightarrow{\text{Transfer}} B \xrightarrow{\text{Transfer}} C \xrightarrow{\text{Transfer}} \dots \xrightarrow{\text{Transfer}} A$$
- **Severity**: Critical.

### 3.2 Rapid Money Flow / Pass-Through Accounts (Smurfing Detector)
- **Logic**: Accounts that hold balances for only minutes or hours are acting as transit conduits rather than genuine savings or commercial accounts.
- **Mathematical Condition**: For an incoming transaction $T_{in} = (u, v, A_{in}, t_{in})$ and subsequent outgoing transaction $T_{out} = (v, w, A_{out}, t_{out})$:
  $$(t_{out} - t_{in}) \le \Delta t_{thresh} \quad \text{where } \Delta t_{thresh} = 3600 \text{ seconds (1 hour)}$$
  and the volume ratio matches:
  $$\frac{|A_{in} - A_{out}|}{A_{in}} < 0.15 \quad (85\% \text{ to } 100\% \text{ forwarded})$$
- **Severity**: High if cumulative amount $\ge 1,00,000$ INR; Critical if $\ge 10,00,000$ INR.

### 3.3 Burst Calling (Operational Mobilization Detector)
- **Logic**: Covert operatives maintain radio silence until an operation is executed, at which point communication spikes drastically.
- **Mathematical Condition**: Between caller $A$ and receiver $B$, calculate call frequency within a sliding time window $W = 24 \text{ hours}$:
  $$Count(Calls(A, B), t \in [T_0, T_0 + W]) \ge 10$$
- **Severity**:
  - $> 20$ calls in 24 hours: Critical
  - $15 - 20$ calls in 24 hours: High
  - $10 - 14$ calls in 24 hours: Medium

### 3.4 Ghost Connectors (Covert Broker Detector)
- **Logic**: Senior handlers avoid communicating with ordinary gang members. Instead, they interact only with a tiny number of cell leaders. As a result, their total degree (connection count) is very small, yet their betweenness centrality is massive because all inter-cluster communication passes through them.
- **Mathematical Condition**:
  $$\deg(v) \le 5 \quad \text{AND} \quad BC(v) \ge \text{Percentile}_{90}(BC)$$
- **Severity**: High.

### 3.5 Geographic / Spatio-Temporal Velocity Anomalies
- **Logic**: An individual or vehicle cannot be present at two distant physical coordinates in a time window that violates physical travel speeds.
- **Formula**: Given two sightings $(lat_1, lon_1, t_1)$ and $(lat_2, lon_2, t_2)$, compute great-circle distance using the Haversine equation:
  $$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
  $$d = 2 R \cdot \arctan2\left(\sqrt{a}, \sqrt{1-a}\right)$$
  where $R = 6371 \text{ km}$. The required transit velocity is:
  $$v = \frac{d}{t_2 - t_1}$$
- **Detection Condition**:
  $$v > 120 \text{ km/h (for road vehicles)} \quad \text{or} \quad d > 500 \text{ km in } \Delta t < 6 \text{ hours}$$
- **Severity**: Critical (indicates vehicle plate cloning, identity sharing, or fraudulent alibis).

---

## 4. AI, Machine Learning, and NLP Implementation

The platform employs a hybrid architecture combining rule-grounded NLP, statistical graph machine learning, and generative Large Language Models.

### 4.1 Natural Language Processing Pipeline
The system processes unstructured, multilingual Indian police documents (First Information Reports) through a customized spaCy pipeline:
- **Base Model**: `en_core_web_sm` providing tokenization, dependency parsing, and part-of-speech tagging.
- **Custom EntityRuler Gazetteer Integration**: Over 500 verified Indian proper nouns, tier-1/tier-2/tier-3 cities, and states are loaded ahead of standard statistical NER. This guarantees that names like "Rajesh Kumar", "Dawood Ibrahim", "Bada Rajan", and localities like "Dongri" or "Nagpada" are accurately parsed as `PERSON` and `GPE`.
- **Regex Extraction Layer**:
  - Phone: `(?:\+91[\s-]?)?(?:0)?[6-9]\d{4}[\s-]?\d{5}`
  - Vehicle Plates: `[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,3}[\s-]?\d{4}`
  - Indian Identifiers: PAN cards (`[A-Z]{5}\d{4}[A-Z]`), Aadhaar cards (`\d{4}[\s-]?\d{4}[\s-]?\d{4}`), and Bank Account strings.
- **Entity Linking and Deduplication**: Normalizes transliterated alias names (e.g., "Dawood Ibrahim Kaskar", "Ibrahim, Dawood", and "D-Company Boss" resolve to a unified entity record).

### 4.2 Unsupervised Graph Machine Learning
1. **Community Detection via Louvain Modularity**:
   - Maximizes graph modularity to isolate hidden operational cells and cartels without requiring pre-labeled training data.
2. **Link Prediction (Resource Allocation and Jaccard Coefficient)**:
   - Predicts covert associations between criminals who have deliberately avoided direct communication by evaluating shared neighborhood overlap:
   $$RA(u, v) = \sum_{z \in \Gamma(u) \cap \Gamma(v)} \frac{1}{\deg(z)}$$
   $$Jaccard(u, v) = \frac{|\Gamma(u) \cap \Gamma(v)|}{|\Gamma(u) \cup \Gamma(v)|}$$

### 4.3 Generative AI with Large Language Models
- **Model**: Google Gemini 1.5 Flash via the Google GenAI SDK.
- **Role**:
  - Generates comprehensive natural-language intelligence dossiers summarizing suspect backgrounds, modus operandi, and associates.
  - Interactive AI Tactical Chatbot ("Tactical Copilot") capable of querying the graph topology via Retrieval-Augmented Generation (Graph RAG).
- **Security Guardrails**:
  - Implements rigorous input sanitization in `backend/security/guardrails.py`.
  - Filters out prompt-injection attacks ("ignore previous instructions", "system prompt", "DAN mode", SQL injection fragments) and caps request lengths at 2,000 characters.

---

## 5. Mathematical Formulations of Experimental Lab Features

The Experimental Intelligence Lab contains specialized forensic and mathematical tools designed for deep criminal network disruption.

### 5.1 Decapitation Strike Simulator
- **Mathematical Foundation**: Network Percolation Theory and Giant Connected Component (GCC) degradation.
- **Objective**: Identify which set of target arrests will cause the entire criminal syndicate to fragment into isolated, non-functional cells.
- **Algorithm**:
  1. Let $G_0 = (V_0, E_0)$ be the initial network, and let $|GCC(G_0)|$ be the number of nodes in the largest connected component.
  2. Successively remove nodes $v \in Targets$ based on descending betweenness-degree product: $Score(v) = BC(v) \times \deg(v)$.
  3. Calculate the post-removal network $G' = G_0 \setminus Targets$.
  4. Compute the Network Fragmentation Index:
     $$Frag(G') = 1 - \frac{|GCC(G')|}{|GCC(G_0)|}$$
  5. The simulator calculates the optimal arrest sequence that achieves $Frag \ge 0.70$ with the minimum number of target operations.

### 5.2 Ghost Rendezvous Analysis
- **Mathematical Foundation**: Spatio-temporal trajectory intersection and convex hull overlap.
- **Objective**: Identify covert in-person meetings between suspects who deliberately leave their cell phones behind or never communicate digitally.
- **Algorithm**:
  - Given entity $A$ sightings $S_A = \{(x_{A, i}, y_{A, i}, t_{A, i})\}$ and entity $B$ sightings $S_B = \{(x_{B, j}, y_{B, j}, t_{B, j})\}$.
  - Two sightings constitute a rendezvous candidate if both spatial and temporal distances fall below threshold tolerances:
    $$\text{Distance}_{Haversine}((x_A, y_A), (x_B, y_B)) \le \Delta r_{thresh} \quad (\approx 200 \text{ meters})$$
    $$|t_A - t_B| \le \Delta t_{thresh} \quad (\approx 30 \text{ minutes})$$
  - The co-presence probability is calculated using an inverse exponential decay function:
    $$P(Rendezvous) = \exp\left( -\frac{\Delta r^2}{2\sigma_r^2} - \frac{\Delta t^2}{2\sigma_t^2} \right)$$

### 5.3 Vehicle Plate Cloning Detection
- **Mathematical Foundation**: Kinematic impossibility testing.
- **Objective**: Detect when organized criminals duplicate a legitimate vehicle license plate across multiple physical vehicles.
- **Formula**:
  $$v_{required} = \frac{\text{HaversineDistance}(L_1, L_2)}{|t_2 - t_1|}$$
  If $v_{required} > 150 \text{ km/h}$, plate cloning is confirmed with mathematical certainty:
  $$Confidence_{Cloning} = \min\left(1.0, \frac{v_{required} - 150}{100}\right) \times 100\%$$

### 5.4 Hawala Fluid Flow / Max-Flow Min-Cut
- **Mathematical Foundation**: Ford-Fulkerson algorithm and Edmonds-Karp maximum flow theorem on directed capacitated networks.
- **Objective**: Find the financial conduits that channel illicit liquidity and locate the exact minimum cut (choke-point accounts) to freeze to stop the flow of capital entirely.
- **Theorem**:
  $$\max \text{Flow}(s \to t) = \min \text{Capacity}(\text{Cut}(s, t))$$
  The algorithm identifies the minimal subset of bank accounts whose removal completely disconnects illicit funding from the primary syndicate controllers.

### 5.5 Forensic Stylometry and Text DNA
- **Mathematical Foundation**: High-dimensional vector space modeling and Cosine Similarity.
- **Objective**: Determine whether anonymous ransom notes, extortion SMS messages, or threat letters were written by the same author.
- **Formula**: For two text samples, extract normalized n-gram and function-word frequency vectors $\vec{A}$ and $\vec{B}$:
  $$\text{Similarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{k=1}^d A_k B_k}{\sqrt{\sum_{k=1}^d A_k^2} \sqrt{\sum_{k=1}^d B_k^2}}$$
  In addition, the system measures:
  - Lexical Diversity (Type-Token Ratio): $TTR = \frac{V}{N}$ (unique vocabulary $V$ divided by total tokens $N$).
  - Average Sentence Length and Punctuation Entropy.

### 5.6 K-Core Network Decomposition
- **Mathematical Foundation**: Recursive degree-constrained subgraph pruning.
- **Objective**: Peel away peripheral street-level criminals to expose the resilient, interconnected inner core of the syndicate.
- **Algorithm**: A subgraph $H_k \subseteq G$ is a $k$-core if every node in $H_k$ has at least degree $k$ within $H_k$:
  $$\forall v \in H_k, \quad \deg_{H_k}(v) \ge k$$
  By incrementing $k$ until the graph collapses, the highest surviving $k$-core represents the impenetrable command echelon of the criminal organization.

---

## 6. PDF Intelligence Report Generation Architecture

### 6.1 Technology Employed
Reports are compiled server-side in Python using **ReportLab Platypus** (Page Layout and Typography Using Scripts). This produces high-resolution, vector-rendered, legally admissible investigative dossiers.

### 6.2 Generation Workflow

```
[Client Request] 
      |
      v
[FastAPI /api/report/generate]
      |
      +---> Extract Case Metadata & High-Value Targets from DB
      +---> Query Graph Centrality Metrics & Community Partitions
      +---> Fetch Detected Anomalies & Legal Evidence
      |
      v
[ReportLab Platypus Engine]
      |
      +---> Render Government Header & Classification Watermark
      +---> Generate HVT Operatives Table with Risk Scoring
      +---> Generate Cartel Sub-Cell Breakdown & Dominant Crimes
      +---> Render Red Flag Anomaly Incident Logs
      +---> Embed Chain-of-Custody SHA-256 Seal
      |
      v
[Binary PDF Stream] ---> Downloaded by Investigator
```

### 6.3 Content Structure of the Generated Dossier
1. **Official Header**: State Police / National Intelligence insignia, classification level (Top Secret / Law Enforcement Sensitive), case registration number, and timestamp.
2. **Executive Summary**: High-level statistical breakdown of the network: total identified entities, verified relationships, identified communities, and confirmed anomalies.
3. **High-Value Target Roster**: Tabular ranking of top cartel leaders, listing their primary alias, entity classification, PageRank rating, Betweenness Centrality, and composite Threat Tier.
4. **Syndicate Cluster Breakdown**: Breakdown of sub-cells discovered via Louvain modularity, showing member count, cell controllers, and predicted crime specializations.
5. **Flagged Anomalies and Red Flags**: Forensic log detailing circular money transfers, burst communication patterns, and geographic velocity violations with attached transaction IDs and timestamps.
6. **Chain-of-Custody Certification**: A cryptographic SHA-256 digital digest computed over the case database state to ensure evidentiary integrity for court proceedings.

---

## 7. Comprehensive System Architecture and Tech Stack

The system follows a decoupled, asynchronous client-server architecture built for high performance and low-latency interactive graph manipulation.

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION TIER                                  |
|                                                                                   |
|  React 19  |  Vite Bundler  |  Tailwind CSS v4  |  Cytoscape.js Force-Directed     |
|  Leaflet / OpenStreetMap Geospatial  |  Lucide & Feather Iconography               |
+-----------------------------------------------------------------------------------+
                                         |
                            JSON REST APIs / HTTP Fetch
                                         |
+-----------------------------------------------------------------------------------+
|                                APPLICATION SERVER                                 |
|                                                                                   |
|  FastAPI Framework  |  Uvicorn ASGI  |  Python 3.13 Runtime                       |
|                                                                                   |
|  Route Handlers:                                                                  |
|  - /api/upload (FIR, CDR, Financial, Vehicle)                                     |
|  - /api/network (Ego-networks, Full graph, Subgraphs)                             |
|  - /api/analytics (Influencers, Louvain, Crime predictions, Anomalies)             |
|  - /api/lab (Decapitation, Ghost rendezvous, Plate cloning, Hawala flow)         |
|  - /api/chat (Tactical AI Copilot via Google Gemini 1.5 Flash)                    |
|  - /api/report (ReportLab PDF Generation)                                         |
+-----------------------------------------------------------------------------------+
                      |                                       |
+------------------------------------+  +-------------------------------------------+
|          GRAPH ANALYTICS           |  |             DATA STORAGE                  |
|                                    |  |                                           |
| - NetworkX 3.4.2 (In-memory graph) |  | - SQLite 3 embedded relational database   |
| - python-louvain (Modularity)      |  | - SQLAlchemy 2.0 ORM                      |
| - spaCy 3.8 + EntityRuler (NLP)    |  | - Indexed tables: entities, relationships |
| - ReportLab 4.4 (Vector PDF Engine)|  |   firs, anomalies, audit_logs             |
+------------------------------------+  +-------------------------------------------+
```

### 7.1 Detailed Component Breakdown

| Tier | Component | Technology / Library | Purpose and Functionality |
| :--- | :--- | :--- | :--- |
| **Frontend** | UI Framework | React 19 + Vite | Component-driven, ultra-fast reactive user interface |
| **Frontend** | Styling System | Tailwind CSS v4 | Dark Cyber-Command Center styling and layouts |
| **Frontend** | Graph Canvas | Cytoscape.js + react-cytoscapejs | Force-directed hardware-accelerated graph rendering |
| **Frontend** | Geographic Maps | Leaflet + React-Leaflet | Geospatial tracking of suspect movements and sightings |
| **Frontend** | Icons | react-icons (Feather / Lucide) | Visual indicator icons for all entity types |
| **Backend** | API Engine | FastAPI + Uvicorn | High-throughput asynchronous REST API server |
| **Backend** | Database ORM | SQLAlchemy 2.0 | Type-safe database mapping and query construction |
| **Backend** | Relational DB | SQLite 3 | Embedded, zero-configuration local database storage |
| **Backend** | Graph Processing | NetworkX 3.4.2 | Graph construction, paths, centralities, and flow |
| **Backend** | Community Detection | python-louvain 0.16 | Implementation of the Louvain modularity algorithm |
| **Backend** | Natural Language | spaCy 3.8.7 (`en_core_web_sm`) | Entity extraction from unstructured police text |
| **Backend** | Report Generator | ReportLab 4.4.1 | Vector PDF generation with tables and watermarks |
| **Backend** | Artificial Intel | Google GenAI SDK (Gemini 1.5) | Generative dossier synthesis and contextual chatbot |
| **Backend** | Security & SIEM | Custom Chained Audit Logger | SHA-256 cryptographically chained tamper-evident logs |

---

## 8. Graph Formation, Parameters, and Community Clustering

### 8.1 Graph Construction Mechanics
The graph $G = (V, E)$ is built from normalized relational database entries:

#### Nodes ($V$)
Every physical or digital entity represents a node. Each node contains:
- `id`: Unique integer primary key.
- `entity_type`: Categorical label (`PERSON`, `PHONE`, `LOCATION`, `VEHICLE`, `BANK_ACCOUNT`, `ORGANIZATION`).
- `name`: Text label displayed on canvas.
- `properties`: Flexible JSON dictionary storing phone numbers, bank names, vehicle models, or registration details.
- `metrics`: Dynamically calculated attributes (`pagerank`, `betweenness`, `community_id`, `risk_score`).

#### Edges ($E$)
Every verified forensic connection between two entities represents an edge:
- `source`: Origin node ID.
- `target`: Destination node ID.
- `rel_type`: Relationship label (`CALLED`, `TRANSFERRED_MONEY_TO`, `SPOTTED_AT`, `MENTIONED_IN_FIR`, `ASSOCIATED_WITH`).
- `weight`: Quantitative interaction strength (e.g., total phone call count, total transfer amount, or co-occurrence count).
- `timestamp`: Timestamp of most recent confirmed activity.

### 8.2 Visual Layout Physics: The COSE Force-Directed Model
On the frontend canvas, node coordinates are calculated using the **Compound Spring Embedder (COSE)** layout algorithm. COSE models the graph as a physical mechanical system:

1. **Spring Attractive Forces (Hooke's Law)**: Connected nodes act as though joined by an elastic mechanical spring. Edges pull connected nodes together:
   $$F_{spring}(u, v) = k_{edge} \cdot \left( d(u, v) - L_{ideal} \right)$$
   where $L_{ideal}$ is the ideal edge distance (set to 100 pixels) and $k_{edge}$ is edge elasticity.
2. **Repulsive Electrostatic Forces (Coulomb's Law)**: All nodes carry like electrical charges that push them apart, preventing visual overlap and clumping:
   $$F_{repulsion}(u, v) = \frac{C_{repulsion}}{d(u, v)^2}$$
3. **Gravity Forces**: A central gravitational pull draws disconnected components toward the center of the viewport so disconnected nodes do not drift off screen:
   $$F_{gravity}(u) = G \cdot d(u, \text{Center})$$

The simulation runs for up to 1,000 cooling iterations until the system reaches mechanical equilibrium (minimum total potential energy).

### 8.3 Community Identification: The Louvain Modularity Algorithm
Clusters (operational cells, syndicates, hawala rings) are isolated using the Louvain method, a greedy optimization algorithm that maximizes the graph's **Modularity ($Q$)**.

#### Definition of Modularity ($Q$)
Modularity measures the density of edges inside communities compared to edges between communities:

$$Q = \frac{1}{2m} \sum_{i, j} \left[ A_{ij} - \frac{k_i k_j}{2m} \right] \delta(c_i, c_j)$$

Where:
- $A_{ij}$ is the weight of the edge between node $i$ and node $j$.
- $k_i = \sum_j A_{ij}$ is the sum of the weights of the edges attached to node $i$.
- $m = \frac{1}{2} \sum_{i, j} A_{ij}$ is the total sum of all edge weights in the entire network.
- $c_i$ is the community to which node $i$ is assigned.
- $\delta(c_i, c_j)$ is the Kronecker delta: equals $1$ if node $i$ and node $j$ are in the same community, and $0$ otherwise.

#### Execution Phases
1. **Phase 1 (Local Modularity Optimization)**:
   - The algorithm starts by placing each node in its own distinct community.
   - For each node $i$, the algorithm considers removing $i$ from its current community and placing it into the community of each of its neighbors $j$.
   - It evaluates the modularity gain $\Delta Q$:
     $$\Delta Q = \left[ \frac{\Sigma_{in} + 2k_{i, in}}{2m} - \left( \frac{\Sigma_{tot} + k_i}{2m} \right)^2 \right] - \left[ \frac{\Sigma_{in}}{2m} - \left( \frac{\Sigma_{tot}}{2m} \right)^2 - \left( \frac{k_i}{2m} \right)^2 \right]$$
   - Node $i$ is moved into the community that yields the largest positive $\Delta Q$.
   - This process repeats sequentially for all nodes until no individual move can further increase $Q$.
2. **Phase 2 (Community Aggregation)**:
   - A new coarse-grained graph is built where every community from Phase 1 is compressed into a single meta-node.
   - Edges between nodes within the same community become self-loops on the meta-node.
   - Edges between different communities become weighted edges between the corresponding meta-nodes.
3. **Iteration**:
   - Phase 1 is executed again on the new coarse-grained graph.
   - The two phases repeat iteratively until a maximum modularity ceiling is reached and no further partitioning improves the modularity score.

#### Output
Every node in the database receives an assigned `community_id` integer. The frontend visualization engine uses this `community_id` to color-code sub-cartels and isolate independent criminal cells on the command canvas.
