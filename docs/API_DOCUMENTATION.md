# CrimeNet Intelligence Command Center — API Documentation

This document describes all REST API endpoints provided by the FastAPI backend (`http://localhost:8000/api`).

---

## 1. Universal Data Ingestion (`/api/upload`)

| Method | Endpoint | Description | Accepted Formats |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload/auto` | Automatic multi-format content-aware ingestion | `.txt`, `.pdf`, `.docx`, `.xlsx`, `.csv` |
| `POST` | `/api/upload/fir` | First Information Report narrative parsing | `.txt`, `.pdf`, `.docx` |
| `POST` | `/api/upload/cdr` | Telecom Call Detail Records parsing | `.csv`, `.xlsx` |
| `POST` | `/api/upload/financial` | Bank ledger transaction parsing | `.csv`, `.xlsx` |
| `POST` | `/api/upload/vehicle` | ANPR highway vehicle sighting telemetry | `.csv`, `.xlsx` |

### Guardrails
- **File Deduplication**: Rejects identical files ($SHA\text{-}256$ / name + size collision) with HTTP `409 Conflict`.
- **Record Deduplication**: Prevents duplicate relationships across uploads.
- **Size Limit**: Maximum 10MB per file.

---

## 2. Network & Graph Topology (`/api/network`, `/api/graph`)

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/graph/full` | `case_id` | Returns complete Cytoscape-formatted graph `{nodes, edges}`. |
| `GET` | `/api/network/{entity_id}` | `depth`, `case_id` | Returns $k$-hop ego-network subgraph around an entity. |
| `GET` | `/api/graph/shortest-path` | `source_id`, `target_id`, `case_id` | Bidirectional BFS shortest connection path tracer. |

---

## 3. Analytics & Syndicate Detection (`/api/analytics`)

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard-stats` | `case_id` | Metrics overview: total entities, relations, clusters, anomalies. |
| `GET` | `/api/analytics/top-influencers` | `limit`, `case_id` | Ranks entities by PageRank and Betweenness Centrality. |
| `GET` | `/api/analytics/communities` | `case_id` | Louvain community detection returning detected crime clusters. |
| `GET` | `/api/analytics/anomalies` | `case_id` | Rule-based and topological anomalies (burst calls, smurfing, etc.). |
| `GET` | `/api/analytics/crime-predictions` | `community_id`, `case_id` | Bayesian crime type classifier with indicator breakdowns. |

---

## 4. Experimental Labs (`/api/experimental`)

| Method | Endpoint | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/experimental/decapitation` | `max_targets`, `case_id` | Spectral graph percolation cut-set strike targeting. |
| `GET` | `/api/experimental/ghost-rendezvous` | `max_time_diff_hours`, `case_id` | 4D spatiotemporal co-location detector without direct telecom. |
| `GET` | `/api/experimental/suspects` | `case_id` | List of target suspects available for profiling. |
| `POST` | `/api/experimental/interrogate` | `{entity_id, question, history, case_id}` | Digital Twin AI interrogation with live contradiction detection. |
| `GET` | `/api/experimental/plate-cloning-resolver` | `case_id` | Kinematic velocity anomaly resolver ($V > 240\text{ km/h}$). |
| `POST` | `/api/experimental/socmint/analyze` | `{posts, case_id}` | OSINT threat scanner and dialect decoder. |
| `GET` | `/api/experimental/quantum-mole` | `case_id` | Negative-topology internal leak detector. |
| `GET` | `/api/experimental/dynasty-pedigree` | — | Multi-generational crime dynasty succession mapper. |

---

## 5. Security, SIEM & Forensic Audit (`/api/audit`, `/api/blockchain`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/audit/logs` | Returns cryptographically chained audit events. |
| `GET` | `/api/audit/verify` | Validates hash integrity of the append-only SIEM audit chain. |
| `GET` | `/api/audit/export` | Exports CERT-In compliant audit log report in JSON format. |
| `GET` | `/api/blockchain/blocks` | Returns evidence blocks in the forensic ledger. |
| `POST` | `/api/blockchain/mine` | Mines an evidence transaction with SHA-256 proof-of-work. |
| `GET` | `/api/blockchain/certificate/{id}` | Generates Section 65B Indian Evidence Act forensic certificate. |

---

## 6. Voice Control & Conversational AI (`/api/voice`, `/api/chat`)

| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/voice/command` | `{transcript, case_id}` | Guardrailed voice navigation parser with injection filtering. |
| `POST` | `/api/chat` | `{message, case_id, selected_entity_id}` | Tactical AI investigative intelligence assistant. |
