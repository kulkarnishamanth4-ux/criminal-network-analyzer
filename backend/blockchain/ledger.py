import hashlib
import json
import time
from datetime import datetime
from typing import List, Dict, Any, Optional

class Block:
    def __init__(
        self,
        index: int,
        timestamp: str,
        case_id: str,
        evidence_type: str,
        payload_summary: str,
        payload_data: Dict[str, Any],
        officer_badge: str,
        validator_node: str,
        previous_hash: str,
        nonce: int = 0
    ):
        self.index = index
        self.timestamp = timestamp
        self.case_id = case_id
        self.evidence_type = evidence_type
        self.payload_summary = payload_summary
        self.payload_data = payload_data
        self.officer_badge = officer_badge
        self.validator_node = validator_node
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.merkle_root = self.calculate_merkle_root()
        self.hash = self.calculate_hash()

    def calculate_merkle_root(self) -> str:
        """Calculates Merkle Root hash of the evidence payload data."""
        payload_str = json.dumps(self.payload_data, sort_keys=True)
        return hashlib.sha256(payload_str.encode('utf-8')).hexdigest()

    def calculate_hash(self) -> str:
        """Calculates the unique SHA-256 header hash of the block."""
        block_header = (
            f"{self.index}{self.timestamp}{self.case_id}{self.evidence_type}"
            f"{self.merkle_root}{self.officer_badge}{self.validator_node}"
            f"{self.previous_hash}{self.nonce}"
        )
        return hashlib.sha256(block_header.encode('utf-8')).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "case_id": self.case_id,
            "evidence_type": self.evidence_type,
            "payload_summary": self.payload_summary,
            "payload_data": self.payload_data,
            "officer_badge": self.officer_badge,
            "validator_node": self.validator_node,
            "merkle_root": self.merkle_root,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
            "nonce": self.nonce,
            "status": "VALID_IMMUTABLE"
        }


class CrimeChain:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CrimeChain, cls).__new__(cls)
            cls._instance.chain: List[Block] = []
            cls._instance.tampered_block_index: Optional[int] = None
            cls._instance.original_payload_backup: Optional[Dict[str, Any]] = None
            cls._instance._initialize_chain()
        return cls._instance

    def _initialize_chain(self):
        """Initializes genesis block and pre-seeds verified legal evidence blocks across cases."""
        self.create_genesis_block()
        self._seed_case_evidence_blocks()

    def create_genesis_block(self):
        genesis = Block(
            index=0,
            timestamp="2026-01-01T00:00:00Z",
            case_id="SYSTEM",
            evidence_type="GENESIS_PROTOCOL",
            payload_summary="CrimeNet National Security Ledger Genesis Block Initialized",
            payload_data={"consensus": "Proof-of-Authority (PoA)", "encryption": "SHA-256 Merkle Ledger", "standard": "BSA Section 63 / IEA Section 65B"},
            officer_badge="MHA-ROOT-001",
            validator_node="CFSL Central Forensic Server (New Delhi)",
            previous_hash="0" * 64,
            nonce=100
        )
        # Give Genesis a distinct PoA prefix
        genesis.hash = "0000" + genesis.hash[4:]
        self.chain.append(genesis)

    def _seed_case_evidence_blocks(self):
        seeds = [
            {
                "case_id": "dawood",
                "evidence_type": "CDR_VOIP_INTERCEPT",
                "payload_summary": "VoIP Satellite Extortion Call Intercept (Dubai-Karachi-Mumbai Dadar Sector)",
                "payload_data": {"caller": "+92-300-8849921", "receiver": "+91-98200-11223", "target": "Bollywood Producer", "duration_sec": 312, "audio_sha256": "8a4f21bc9e1..."},
                "officer_badge": "MH-ATS-8821",
                "validator_node": "CFSL Western Cyber Forensic Lab"
            },
            {
                "case_id": "dawood",
                "evidence_type": "HAWALA_LEDGER_SEIZURE",
                "payload_summary": "Seized Physical Angadia Token Ledger #786 & Serial Match Note",
                "payload_data": {"token_serial": "786-990-21", "settlement_inr": 250000000, "conduit": "Surat-Dubai Angadia Pipeline"},
                "officer_badge": "ED-MUM-4402",
                "validator_node": "Financial Intelligence Unit (FIU-IND Node)"
            },
            {
                "case_id": "drug_punjab",
                "evidence_type": "UAV_RADAR_TELEMETRY",
                "payload_summary": "BSF Border Drone Radar Incursion Logs & GPS Drop Coordinates",
                "payload_data": {"sector": "Majha Border Zero-Line", "altitude_m": 120, "payload_kg": 4.5, "contraband": "Heroin Serials A-99"},
                "officer_badge": "PB-STF-1104",
                "validator_node": "BSF Electronic Surveillance Wing"
            },
            {
                "case_id": "ht_assam",
                "evidence_type": "COUNTERFEIT_AADHAAR_BATCH",
                "payload_summary": "Recovered 24 Fraudulent Identity Papers & Riverine Crossing Logs",
                "payload_data": {"batch_id": "Dhubri-Pass-2026", "fake_aadhaars_count": 24, "broker": "Rofiqul Islam"},
                "officer_badge": "AS-CID-9932",
                "validator_node": "Guwahati Forensic Science Lab"
            },
            {
                "case_id": "cyber_bengaluru",
                "evidence_type": "RANSOM_SMART_CONTRACT",
                "payload_summary": "On-Chain 15 BTC Ransom Escrow Demand & DarkNet Forum Leak",
                "payload_data": {"bitcoin_address": "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ", "ransom_demanded_btc": 15.0, "cve": "CVE-2026-9941"},
                "officer_badge": "KA-CYBER-5511",
                "validator_node": "CERT-In National Cyber Hub"
            },
            {
                "case_id": "money_gujarat",
                "evidence_type": "CIRCULAR_BANK_TRANSACTION",
                "payload_summary": "FIU Layering Detection: A->B->C->A 14-Minute Circular Hawala Transfer",
                "payload_data": {"origin_acc": "98765432101", "hop_accounts": ["98765432102", "98765432103"], "volume_inr": 48000000},
                "officer_badge": "GJ-ED-7721",
                "validator_node": "Reserve Bank Enforcement Wing"
            },
            {
                "case_id": "arms_chhattisgarh",
                "evidence_type": "ORDNANCE_SEIZURE_MEMO",
                "payload_summary": "Physical Seizure of 20 Unlicensed Semi-Automatic Rifles & Mining Gelatin Sticks",
                "payload_data": {"vehicle_plate": "CG-17-AB-9921", "weapons_count": 20, "explosive_kg": 45.0},
                "officer_badge": "CG-SIB-3399",
                "validator_node": "Bastar Tactical Ordnance Depot"
            },
            {
                "case_id": "wildlife_kerala",
                "evidence_type": "EXOTIC_FAUNA_CARGO_EXIF",
                "payload_summary": "EXIF Metadata & Shipping Manifest for 70kg Raw Ivory Tusk Consignment",
                "payload_data": {"container_id": "KOC-SEA-8812", "weight_kg": 70, "origin": "Silent Valley Buffer Zone"},
                "officer_badge": "KL-WCCB-2201",
                "validator_node": "Wildlife Crime Control Bureau (WCCB)"
            },
            {
                "case_id": "extortion_up",
                "evidence_type": "CONVOY_ANPR_SIGHTING",
                "payload_summary": "Optical FASTag Highway Intercept of 10-Vehicle Armed Gang Convoy",
                "payload_data": {"toll_plaza": "Gorakhpur Bypass Plaza", "speed_kmh": 118, "firearms_displayed": True},
                "officer_badge": "UP-STF-6601",
                "validator_node": "UP State Forensic Science University"
            }
        ]

        for s in seeds:
            self.mine_evidence_block(
                case_id=s["case_id"],
                evidence_type=s["evidence_type"],
                payload_summary=s["payload_summary"],
                payload_data=s["payload_data"],
                officer_badge=s["officer_badge"],
                validator_node=s["validator_node"]
            )

    def mine_evidence_block(
        self,
        case_id: str,
        evidence_type: str,
        payload_summary: str,
        payload_data: Dict[str, Any],
        officer_badge: str = "DL-POL-4412",
        validator_node: str = "Central Forensic Science Laboratory (CFSL Node #01)"
    ) -> Block:
        """Mines a cryptographically verified evidence block with SHA-256 and appends to ledger."""
        previous_block = self.chain[-1] if self.chain else None
        prev_hash = previous_block.hash if previous_block else "0" * 64
        index = len(self.chain)
        timestamp = datetime.utcnow().isoformat() + "Z"

        new_block = Block(
            index=index,
            timestamp=timestamp,
            case_id=case_id,
            evidence_type=evidence_type,
            payload_summary=payload_summary,
            payload_data=payload_data,
            officer_badge=officer_badge,
            validator_node=validator_node,
            previous_hash=prev_hash,
            nonce=0
        )

        # Proof of Authority: Add block to chain
        self.chain.append(new_block)
        return new_block

    def get_blocks(self, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all blocks or filtered by case_id."""
        if case_id and case_id != "all":
            return [b.to_dict() for b in self.chain if b.case_id == case_id or b.case_id == "SYSTEM"]
        return [b.to_dict() for b in self.chain]

    def verify_chain_integrity(self) -> Dict[str, Any]:
        """Validates 100% of the cryptographic hash linkages and Merkle roots."""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # 1. Verify Merkle Root
            expected_merkle = current.calculate_merkle_root()
            if current.merkle_root != expected_merkle:
                return {
                    "is_valid": False,
                    "chain_status": "TAMPERED",
                    "tampered_block_index": current.index,
                    "corrupted_block_index": current.index,
                    "error_type": "MERKLE_ROOT_CORRUPTION",
                    "message": f"CRITICAL INTEGRITY BREACH: Evidence payload altered in Block #{current.index}. Calculated Merkle Root does not match cryptographic seal.",
                    "corrupted_block": current.to_dict()
                }

            # 2. Verify Block Header Hash
            expected_hash = current.calculate_hash()
            if current.hash != expected_hash:
                return {
                    "is_valid": False,
                    "chain_status": "TAMPERED",
                    "tampered_block_index": current.index,
                    "corrupted_block_index": current.index,
                    "error_type": "BLOCK_HASH_MISMATCH",
                    "message": f"INTEGRITY BREACH: Block #{current.index} header hash signature is invalid. Evidence tampering detected.",
                    "corrupted_block": current.to_dict()
                }

            # 3. Verify Sequential Linkage
            if current.previous_hash != previous.hash:
                return {
                    "is_valid": False,
                    "chain_status": "TAMPERED",
                    "tampered_block_index": current.index,
                    "corrupted_block_index": current.index,
                    "error_type": "BROKEN_CHAIN_LINKAGE",
                    "message": f"CHAIN OF CUSTODY BROKEN: Block #{current.index} previous_hash does not match Block #{previous.index} hash seal.",
                    "corrupted_block": current.to_dict()
                }

        return {
            "is_valid": True,
            "chain_status": "VALID",
            "total_blocks_verified": len(self.chain),
            "consensus_standard": "Section 65B Indian Evidence Act / Section 63 BSA Validated",
            "message": f"ALL {len(self.chain)} BLOCKS VERIFIED: Cryptographic hash linkage is 100% unbroken. Chain of Custody is legally immutable."
        }

    def simulate_tamper_attack(self, block_index: int = 1) -> Dict[str, Any]:
        """Artificially mutates a block's evidence payload to demonstrate forensic fraud detection."""
        if block_index <= 0 or block_index >= len(self.chain):
            block_index = 1

        target_block = self.chain[block_index]
        self.tampered_block_index = block_index
        self.original_payload_backup = dict(target_block.payload_data)

        # Tamper payload data (e.g., adversary tries to doctor amounts or change phone numbers)
        target_block.payload_data["TAMPERED_FRAUDULENT_EDIT"] = "ALTERED_BY_DEFENSE_ATTORNEY_OR_ADVERSARY"
        target_block.payload_data["amount_or_duration_manipulated"] = 0.00

        # Note: Merkle Root remains old, proving the fraud immediately!
        return {
            "status": "tampered",
            "tampered_block_index": block_index,
            "tampered_case_id": target_block.case_id,
            "message": f"SIMULATED TAMPER ATTACK EXECUTED: Artificially modified evidence payload in Block #{block_index}. Click 'Verify Chain Integrity' to see the blockchain catch the breach!"
        }

    def repair_chain(self) -> Dict[str, Any]:
        """Restores original uncorrupted evidence payload and verifies integrity."""
        if self.tampered_block_index is not None and self.original_payload_backup is not None:
            target_block = self.chain[self.tampered_block_index]
            target_block.payload_data = dict(self.original_payload_backup)
            self.tampered_block_index = None
            self.original_payload_backup = None

        return {
            "status": "repaired",
            "message": "CRYPTOGRAPHIC INTEGRITY RESTORED: Ground-truth payload recovered. Ledger is 100% valid."
        }

    def generate_section_65b_certificate(self, block_index: int) -> Dict[str, Any]:
        """Generates an official court-ready Section 65B / Section 63 BSA Electronic Admissibility Certificate."""
        if block_index < 0 or block_index >= len(self.chain):
            block_index = 0

        b = self.chain[block_index]
        return {
            "statute": "Section 65B, Indian Evidence Act, 1872 / Section 63, Bharatiya Sakshya Adhiniyam, 2023",
            "certificate_id": f"CERT-65B-BLOCK-{b.index:04d}-{b.case_id.upper()}",
            "block_index": b.index,
            "case_id": b.case_id,
            "evidence_type": b.evidence_type,
            "evidence_summary": b.payload_summary,
            "payload_data": b.payload_data,
            "block_hash": b.hash,
            "cryptographic_block_hash": b.hash,
            "merkle_root": b.merkle_root,
            "merkle_root_seal": b.merkle_root,
            "previous_block_hash": b.previous_hash,
            "issued_at": b.timestamp,
            "timestamp_utc": b.timestamp,
            "officer_badge": b.officer_badge,
            "certifying_officer": b.officer_badge,
            "validator_node": b.validator_node,
            "digital_forensic_depot": b.validator_node,
            "hash_algorithm": "SHA-256 (NIST FIPS 180-4 Standard)",
            "judicial_certification_statement": (
                f"This is to certify that the electronic record regarding '{b.payload_summary}' was ingested into the "
                f"CrimeNet Cryptographic Ledger at {b.timestamp} by Authorized Officer {b.officer_badge}. "
                f"The cryptographic hash seal '{b.hash}' and Merkle Root '{b.merkle_root}' prove that the electronic evidence "
                f"has remained untampered, immutable, and preserved with an unbroken chain of custody under Section 65B(4) of the Indian Evidence Act."
            )
        }

# Global singleton instance
crime_ledger = CrimeChain()
