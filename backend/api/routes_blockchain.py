from fastapi import APIRouter, Depends, Query, Body, Request
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from backend.blockchain.ledger import crime_ledger
from backend.blockchain.crypto_tracker import trace_crypto_narco_flow
from backend.security.audit_logger import audit_logger
from backend.limiter import limiter

router = APIRouter()

class MineBlockRequest(BaseModel):
    case_id: str = "dawood"
    evidence_type: str = "ELECTRONIC_SEIZURE_MEMO"
    payload_summary: str
    payload_data: Dict[str, Any]
    officer_badge: str = "MH-ATS-8821"
    validator_node: str = "Central Forensic Science Laboratory (CFSL Node #01)"

class TamperRequest(BaseModel):
    block_index: int = 1

class CryptoTraceRequest(BaseModel):
    case_id: str = "cyber_bengaluru"
    wallet_address: Optional[str] = None

@router.get("/blockchain/blocks")
def get_blockchain_blocks(case_id: Optional[str] = None):
    """Returns all cryptographically verified blocks in the Chain of Custody ledger."""
    return {"status": "success", "blocks": crime_ledger.get_blocks(case_id)}

@router.post("/blockchain/mine")
def mine_evidence_block(req: MineBlockRequest, request: Request):
    """Mines an immutable SHA-256 evidence block for court admissibility."""
    new_block = crime_ledger.mine_evidence_block(
        case_id=req.case_id,
        evidence_type=req.evidence_type,
        payload_summary=req.payload_summary,
        payload_data=req.payload_data,
        officer_badge=req.officer_badge,
        validator_node=req.validator_node
    )
    try:
        audit_logger.log_event(
            action="EVIDENCE_BLOCK_MINED",
            user=req.officer_badge,
            resource=f"BLOCK:{new_block.index}:{req.case_id}",
            details=f"Mined block #{new_block.index} ({req.evidence_type}) for case '{req.case_id}': {req.payload_summary}",
            severity="INFO",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
    except Exception:
        pass
    return {"status": "success", "block": new_block.to_dict()}

@router.get("/blockchain/verify")
def verify_blockchain_integrity(request: Request):
    """Runs a full cryptographic audit verifying hash linkages and Merkle roots."""
    res = crime_ledger.verify_chain_integrity()
    try:
        is_tampered = res.get("chain_status") == "TAMPERED"
        audit_logger.log_event(
            action="BLOCKCHAIN_INTEGRITY_AUDITED",
            user=request.headers.get("X-User-Id", "OFFICER-ATS-402"),
            resource="CHAIN:AUDIT",
            details=f"Cryptographic Merkle audit executed. Status: {res.get('chain_status')}" + (f" (Corrupted block: #{res.get('corrupted_block_index')})" if is_tampered else " (100% Valid)"),
            severity="CRITICAL" if is_tampered else "INFO",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
    except Exception:
        pass
    return res

@router.post("/blockchain/simulate-tamper")
def simulate_tamper_attack(req: TamperRequest, request: Request):
    """Simulates an adversarial tamper attempt on a block to demonstrate integrity validation."""
    res = crime_ledger.simulate_tamper_attack(req.block_index)
    try:
        audit_logger.log_event(
            action="SECURITY_TAMPER_SIMULATED",
            user="ADVERSARY_SIMULATOR",
            resource=f"BLOCK:{req.block_index}",
            details=f"Simulated adversarial byte corruption on Block #{req.block_index}: {res.get('mutation_details')}",
            severity="WARNING",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
    except Exception:
        pass
    return res

@router.post("/blockchain/repair")
def repair_blockchain(request: Request):
    """Restores ground-truth evidence payload and resets cryptographic integrity."""
    res = crime_ledger.repair_chain()
    try:
        audit_logger.log_event(
            action="BLOCKCHAIN_INTEGRITY_RESTORED",
            user="SECURITY_KERNEL",
            resource="CHAIN:REPAIR",
            details=f"Blockchain cryptographic integrity restored from ground truth notary nodes",
            severity="INFO",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
    except Exception:
        pass
    return res

@router.get("/blockchain/certificate/{block_index}")
def get_section_65b_certificate(block_index: int, request: Request):
    """Generates an official Section 65B Indian Evidence Act / Section 63 BSA legal certificate."""
    res = crime_ledger.generate_section_65b_certificate(block_index)
    try:
        audit_logger.log_event(
            action="SEC_65B_CERTIFICATE_ISSUED",
            user=request.headers.get("X-User-Id", "OFFICER-ATS-402"),
            resource=f"CERTIFICATE:BLOCK_{block_index}",
            details=f"Official Section 65B IEA / Section 63 BSA legal certificate compiled for Block #{block_index}",
            severity="INFO",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
    except Exception:
        pass
    return res

@router.get("/blockchain/crypto-flow")
def get_crypto_flow(request: Request, case_id: str = "cyber_bengaluru", wallet_address: Optional[str] = None):
    """On-Chain Dark Web Crypto Narco-Flow Tracker & P2P Cashout Mule Identifier."""
    try:
        audit_logger.log_event(
            action="CRYPTO_NARCO_FLOW_TRACED",
            user=request.headers.get("X-User-Id", "OFFICER-ATS-402"),
            resource=f"CRYPTO:{case_id}:{wallet_address or 'DEFAULT'}",
            details=f"De-anonymized dark web crypto narco-flow hops for case '{case_id}'",
            severity="INFO",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
    except Exception:
        pass
    return trace_crypto_narco_flow(case_id, wallet_address)
