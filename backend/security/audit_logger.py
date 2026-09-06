import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

class AuditLogger:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuditLogger, cls).__new__(cls)
            cls._instance._log_chain = []
        return cls._instance

    def log_event(self, action: str, user: str, resource: str, details: str = '', severity: str = 'INFO', ip_address: str = '0.0.0.0') -> Dict[str, Any]:
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
        return log_entry

    def get_logs(self, limit: int = 50, severity_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        filtered_logs = self._log_chain
        if severity_filter:
            filtered_logs = [log for log in filtered_logs if log.get("severity") == severity_filter]
        return filtered_logs[-limit:] if limit > 0 else filtered_logs

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
            "report_title": "CERT-In Compliance Audit Log",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_events": len(self._log_chain),
            "events": self._log_chain.copy(),
            "integrity_status": "VALID" if integrity_check["is_valid"] else "CORRUPTED"
        }

# Module-level singleton
audit_logger = AuditLogger()
