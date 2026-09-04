from fastapi import APIRouter, Depends, Query, Body
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from backend.blockchain.ledger import crime_ledger
from backend.blockchain.crypto_tracker import trace_crypto_narco_flow
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
def mine_evidence_block(req: MineBlockRequest):
    """Mines an immutable SHA-256 evidence block for court admissibility."""
    new_block = crime_ledger.mine_evidence_block(
        case_id=req.case_id,
        evidence_type=req.evidence_type,
        payload_summary=req.payload_summary,
        payload_data=req.payload_data,
        officer_badge=req.officer_badge,
        validator_node=req.validator_node
    )
    return {"status": "success", "block": new_block.to_dict()}

@router.get("/blockchain/verify")
def verify_blockchain_integrity():
    """Runs a full cryptographic audit verifying hash linkages and Merkle roots."""
    return crime_ledger.verify_chain_integrity()

@router.post("/blockchain/simulate-tamper")
def simulate_tamper_attack(req: TamperRequest):
    """Simulates an adversarial tamper attempt on a block to demonstrate integrity validation."""
    return crime_ledger.simulate_tamper_attack(req.block_index)

@router.post("/blockchain/repair")
def repair_blockchain():
    """Restores ground-truth evidence payload and resets cryptographic integrity."""
    return crime_ledger.repair_chain()

@router.get("/blockchain/certificate/{block_index}")
def get_section_65b_certificate(block_index: int):
    """Generates an official Section 65B Indian Evidence Act / Section 63 BSA legal certificate."""
    return crime_ledger.generate_section_65b_certificate(block_index)

@router.get("/blockchain/crypto-flow")
def get_crypto_flow(case_id: str = "cyber_bengaluru", wallet_address: Optional[str] = None):
    """On-Chain Dark Web Crypto Narco-Flow Tracker & P2P Cashout Mule Identifier."""
    return trace_crypto_narco_flow(case_id, wallet_address)
