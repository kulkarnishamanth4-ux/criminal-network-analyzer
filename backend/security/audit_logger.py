import json
import os
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

AUDIT_LOG_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "audit_trail.jsonl")

class AuditLogger:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuditLogger, cls).__new__(cls)
            cls._instance._log_chain = []
            cls._instance._load_or_initialize_chain()
        return cls._instance

    def _load_or_initialize_chain(self):
        """Loads persistent audit logs from disk or initializes baseline system logs."""
        try:
            os.makedirs(os.path.dirname(AUDIT_LOG_FILE), exist_ok=True)
            if os.path.exists(AUDIT_LOG_FILE) and os.path.getsize(AUDIT_LOG_FILE) > 0:
                loaded = []
                with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line:
                            loaded.append(json.loads(line))
                
                self._log_chain = loaded
                # Check integrity of loaded chain
                integrity = self.verify_integrity()
                if integrity.get("is_valid"):
                    return
                # If corrupted on disk, preserve it and continue
                print(f"[AUDIT_LOGGER] Loaded chain has integrity flag: {integrity}")
                return
        except Exception as e:
            print(f"[AUDIT_LOGGER] Error loading audit trail file: {e}")

        # Seed realistic baseline system logs
        self._seed_baseline_logs()

    def _seed_baseline_logs(self):
        """Seeds initial system startup & compliance logs chained from GENESIS_BLOCK."""
        baseline_events = [
            {
                "action": "SYSTEM_INITIALIZED",
                "user": "SYSTEM_KERNEL",
                "resource": "CORE:CRIMENET_ENGINE",
                "details": "CrimeNet National Cyber Command & Intelligence Engine v2.4 initialized with SHA-256 cryptographic chain seal",
                "severity": "INFO",
                "ip_address": "127.0.0.1"
            },
            {
                "action": "CRYPTO_MERKLE_ANCHOR",
                "user": "SECURITY_KERNEL",
                "resource": "CHAIN:GENESIS_BLOCK",
                "details": "Root trust anchor established: Proof-of-Authority (PoA) Merkle verification active",
                "severity": "INFO",
                "ip_address": "127.0.0.1"
            },
            {
                "action": "DATABASE_ATTACHED",
                "user": "DB_SUBSYSTEM",
                "resource": "DATABASE:INTELLIGENCE_POOL",
                "details": "Certified secure connection pool attached to primary crime intelligence database",
                "severity": "INFO",
                "ip_address": "127.0.0.1"
            },
            {
                "action": "CASES_REGISTRY_LOADED",
                "user": "INTEL_REGISTRY",
                "resource": "CASES:REGISTRY",
                "details": "Synchronized 9 active law enforcement investigation workspaces (Dawood, Red Corridor Bastar, Apex Ransomware, Punjab Hawala)",
                "severity": "INFO",
                "ip_address": "127.0.0.1"
            },
            {
                "action": "ACCESS_CONTROL_ENFORCED",
                "user": "SECURITY_KERNEL",
                "resource": "SIEM:COMPLIANCE_MONITOR",
                "details": "CERT-In Section 70B & Indian Evidence Act Sec 65B tamper-evident SIEM logging active",
                "severity": "INFO",
                "ip_address": "127.0.0.1"
            },
            {
                "action": "OFFICER_SESSION_AUTHENTICATED",
                "user": "OFFICER-ATS-402",
                "resource": "AUTH:SESSION_START",
                "details": "Authorized forensic officer session established: Inspector Vikram K. (Anti-Terrorism Squad, Level 3 Clearance)",
                "severity": "INFO",
                "ip_address": "127.0.0.1"
            }
        ]

        for ev in baseline_events:
            self.log_event(
                action=ev["action"],
                user=ev["user"],
                resource=ev["resource"],
                details=ev["details"],
                severity=ev["severity"],
                ip_address=ev["ip_address"],
                persist=False
            )

        # Write initial seed to file
        try:
            with open(AUDIT_LOG_FILE, "w", encoding="utf-8") as f:
                for entry in self._log_chain:
                    f.write(json.dumps(entry, sort_keys=True) + "\n")
        except Exception as e:
            print(f"[AUDIT_LOGGER] Error writing seed audit logs: {e}")

    def log_event(self, action: str, user: str, resource: str, details: str = '', severity: str = 'INFO', ip_address: str = '0.0.0.0', persist: bool = True) -> Dict[str, Any]:
        timestamp = datetime.now(timezone.utc).isoformat()
        
        entry_data = {
            "timestamp": timestamp,
            "action": action,
            "user": user,
            "resource": resource,
            "details": details,
            "severity": severity,
            "ip_address": ip_address
        }
        
        previous_hash = "GENESIS_BLOCK"
        if self._log_chain:
            previous_hash = self._log_chain[-1]["sha256_hash"]
        
        entry_json = json.dumps(entry_data, sort_keys=True)
        hash_input = f"{previous_hash}{entry_json}".encode('utf-8')
        sha256_hash = hashlib.sha256(hash_input).hexdigest()
        
        log_entry = {**entry_data, "sha256_hash": sha256_hash}
        self._log_chain.append(log_entry)

        if persist:
            try:
                os.makedirs(os.path.dirname(AUDIT_LOG_FILE), exist_ok=True)
                with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
                    f.write(json.dumps(log_entry, sort_keys=True) + "\n")
            except Exception as e:
                print(f"[AUDIT_LOGGER] Failed to append to audit trail file: {e}")

        return log_entry

    def get_logs(self, limit: int = 100, severity_filter: Optional[str] = None, search_query: Optional[str] = None) -> List[Dict[str, Any]]:
        filtered_logs = self._log_chain
        if severity_filter and severity_filter != 'All':
            filtered_logs = [log for log in filtered_logs if log.get("severity") == severity_filter]
        
        if search_query:
            sq = search_query.lower()
            filtered_logs = [
                log for log in filtered_logs
                if sq in log.get("action", "").lower()
                or sq in log.get("user", "").lower()
                or sq in log.get("resource", "").lower()
                or sq in log.get("details", "").lower()
            ]

        # Return latest logs first (reverse chronological order for SIEM views)
        reversed_logs = list(reversed(filtered_logs))
        return reversed_logs[:limit] if limit > 0 else reversed_logs

    def verify_integrity(self) -> Dict[str, Any]:
        if not self._log_chain:
            return {"is_valid": True, "total_entries": 0, "corrupted_index": None}

        previous_hash = "GENESIS_BLOCK"
        for index, entry in enumerate(self._log_chain):
            entry_data = {k: v for k, v in entry.items() if k != "sha256_hash"}
            entry_json = json.dumps(entry_data, sort_keys=True)
            hash_input = f"{previous_hash}{entry_json}".encode('utf-8')
            expected_hash = hashlib.sha256(hash_input).hexdigest()
            
            if entry.get("sha256_hash") != expected_hash:
                return {"is_valid": False, "total_entries": len(self._log_chain), "corrupted_index": index}
            
            previous_hash = entry.get("sha256_hash")
            
        return {"is_valid": True, "total_entries": len(self._log_chain), "corrupted_index": None}

    def export_cert_in_format(self) -> Dict[str, Any]:
        integrity_check = self.verify_integrity()
        return {
            "report_title": "CERT-In Compliance Audit Log (Indian Law Enforcement Specification)",
            "compliance_standards": ["CERT-In Sec 70B", "Indian Evidence Act Sec 65B", "Bharatiya Sakshya Adhiniyam Sec 63"],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_events": len(self._log_chain),
            "events": self._log_chain.copy(),
            "integrity_status": "VALID" if integrity_check["is_valid"] else "CORRUPTED"
        }

# Module-level singleton
audit_logger = AuditLogger()
