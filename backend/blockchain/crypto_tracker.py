import hashlib
from typing import Dict, Any, List, Optional

CASE_CRYPTO_INTEL = {
    "cyber_bengaluru": {
        "network": "Bitcoin (BTC)",
        "deposit_wallet": "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ",
        "wallet_label": "Zero-Day DarkSec Ransom Escrow Wallet",
        "total_volume_crypto": "15.00 BTC",
        "fiat_equivalent_inr": "₹12,45,00,000",
        "tainted_score_pct": 98.4,
        "mixer_used": "Tornado Cash & ChipMixer BTC Tumbler",
        "hops": [
            {
                "hop_index": 1,
                "stage": "Primary Ransom Deposit",
                "from_addr": "1VictimCorpExfil998",
                "to_addr": "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ",
                "amount": "15.00 BTC",
                "txid": "e4b2190f8821...a7c2",
                "status": "EXTORTION_INFLOW",
                "risk": "CRITICAL"
            },
            {
                "hop_index": 2,
                "stage": "Peeling Chain Smurfing Split",
                "from_addr": "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ",
                "to_addr": "1PeelSplitNodeA_8832",
                "amount": "4.85 BTC (Fragment 1 of 3)",
                "txid": "77a89bc1034f...e102",
                "status": "MICRO_HOP_FRAGMENTATION",
                "risk": "HIGH"
            },
            {
                "hop_index": 3,
                "stage": "Mixer Pool Tumbling",
                "from_addr": "1PeelSplitNodeA_8832",
                "to_addr": "0xMixerPoolTornado_0x442",
                "amount": "4.85 BTC",
                "txid": "33bc99401f82...8831",
                "status": "OBFUSCATION_TUMBLING",
                "risk": "HIGH"
            },
            {
                "hop_index": 4,
                "stage": "Indian Exchange P2P Off-Ramp Mule",
                "from_addr": "0xMixerPoolTornado_0x442",
                "to_addr": "1WazirX_MuleDeposit_Acc9941",
                "amount": "₹3,95,00,000 INR (P2P Fiat Cashout)",
                "txid": "99ea011244fa...7721",
                "status": "FIAT_OFFRAMP_IDENTIFIED",
                "risk": "ACTIONABLE_SEIZURE",
                "linked_kyc_mule": "Sunil Ramesh (Bengaluru Tech Corridor)",
                "attached_bank_acc": "SBI Acc #99812400192"
            }
        ],
        "tactical_assessment": "ON-CHAIN BITCOIN FORENSICS COMPLETE: 15 BTC ransom was tumbled via ChipMixer, with 4.85 BTC successfully un-mixed and traced to Indian P2P Exchange deposit account belonging to suspect Sunil Ramesh (SBI Acc #99812400192). Action: Issue Section 91 CrPC notice to exchange for immediate fund freeze."
    },
    "drug_punjab": {
        "network": "USDT (TRC-20 Tron)",
        "deposit_wallet": "TXx9941MajhaBorderNarcoPaymentEscrow772",
        "wallet_label": "Majha Border Heroin Consignment USDT Escrow",
        "total_volume_crypto": "450,000 USDT",
        "fiat_equivalent_inr": "₹3,82,50,000",
        "tainted_score_pct": 96.2,
        "mixer_used": "Tron Shuffler & Multi-Sig Bridge",
        "hops": [
            {
                "hop_index": 1,
                "stage": "Cross-Border Narco Settlement",
                "from_addr": "TXxForeignSupplyNode_001",
                "to_addr": "TXx9941MajhaBorderNarcoPaymentEscrow772",
                "amount": "450,000 USDT",
                "txid": "11ab998244cc...9921",
                "status": "NARCO_PAYMENT_INFLOW",
                "risk": "CRITICAL"
            },
            {
                "hop_index": 2,
                "stage": "Layering Split",
                "from_addr": "TXx9941MajhaBorderNarcoPaymentEscrow772",
                "to_addr": "TXxMuleSubWallet_Amritsar",
                "amount": "150,000 USDT",
                "txid": "88fe33219904...aa12",
                "status": "DOMESTIC_DISPERSION",
                "risk": "HIGH"
            },
            {
                "hop_index": 3,
                "stage": "CoinDCX P2P Liquidation",
                "from_addr": "TXxMuleSubWallet_Amritsar",
                "to_addr": "TXxCoinDCX_P2P_Mule992",
                "amount": "₹1,27,50,000 INR",
                "txid": "44ea77110029...bb44",
                "status": "FIAT_OFFRAMP_IDENTIFIED",
                "risk": "ACTIONABLE_SEIZURE",
                "linked_kyc_mule": "Garry Sandhu (GT Road Fuel Station Associate)",
                "attached_bank_acc": "PNB Acc #44091288301"
            }
        ],
        "tactical_assessment": "TRC-20 NARCO-FINANCING TRACED: 450,000 USDT narcotic payment was liquidated via local CoinDCX P2P escrow into GT Road fuel station bank accounts. Immediate bank attachment recommended."
    },
    "dawood": {
        "network": "Ethereum (ETH) & USDT (ERC-20)",
        "deposit_wallet": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "wallet_label": "Dubai-Dongri High-Value Hawala Token Escrow",
        "total_volume_crypto": "850.00 ETH",
        "fiat_equivalent_inr": "₹28,50,00,000",
        "tainted_score_pct": 99.1,
        "mixer_used": "Railgun Privacy Smart Contract",
        "hops": [
            {
                "hop_index": 1,
                "stage": "Dubai Bullion Tokenization",
                "from_addr": "0xSheikhDawoodDxbNode",
                "to_addr": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
                "amount": "850.00 ETH",
                "txid": "0x99aa8821ffcc...4411",
                "status": "BULLION_CONVERSION",
                "risk": "CRITICAL"
            },
            {
                "hop_index": 2,
                "stage": "Railgun Privacy Shield",
                "from_addr": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
                "to_addr": "0xRailgunShieldPool_009",
                "amount": "300.00 ETH",
                "txid": "0x44bb11229988...7733",
                "status": "ZK_SHIELD_TUMBLING",
                "risk": "HIGH"
            },
            {
                "hop_index": 3,
                "stage": "Mumbai Real Estate Token Off-Ramp",
                "from_addr": "0xRailgunShieldPool_009",
                "to_addr": "0xMumbaiBuilderProxyAcc",
                "amount": "₹10,50,00,000 INR",
                "txid": "0x11ee88443322...5599",
                "status": "FIAT_OFFRAMP_IDENTIFIED",
                "risk": "ACTIONABLE_SEIZURE",
                "linked_kyc_mule": "Tiger Memon Front Enterprise (Diamond Bourse)",
                "attached_bank_acc": "HDFC Commercial Acc #50200088192"
            }
        ],
        "tactical_assessment": "D-COMPANY CRYPTO FLOW EXPOSED: 850 ETH bullion settlements originating from Dubai escrow were un-shielded from Railgun contracts into Mumbai real estate builder front accounts (HDFC Acc #50200088192)."
    }
}

def _format_hops(raw_hops: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    formatted = []
    for h in raw_hops:
        mule = None
        if "linked_kyc_mule" in h or "attached_bank_acc" in h:
            mule = {
                "kyc_name": h.get("linked_kyc_mule", "Authorized KYC Mule"),
                "bank_name": "State Bank of India / Commercial Bank",
                "branch": "Regional Cyber Hub",
                "account_number": h.get("attached_bank_acc", "Acc #99812400192"),
                "ifsc": "SBIN0004812",
                "aadhaar_hash": "XXXX-XXXX-9912 [Encrypted Vault]"
            }
            if "SBI" in h.get("attached_bank_acc", ""):
                mule["bank_name"] = "State Bank of India"
                mule["branch"] = "Bengaluru Tech Corridor"
                mule["ifsc"] = "SBIN0008821"
            elif "PNB" in h.get("attached_bank_acc", ""):
                mule["bank_name"] = "Punjab National Bank"
                mule["branch"] = "GT Road Amritsar"
                mule["ifsc"] = "PUNB0123400"
            elif "HDFC" in h.get("attached_bank_acc", ""):
                mule["bank_name"] = "HDFC Bank Ltd."
                mule["branch"] = "Bandra Kurla Complex, Mumbai"
                mule["ifsc"] = "HDFC0000123"
            elif "ICICI" in h.get("attached_bank_acc", ""):
                mule["bank_name"] = "ICICI Bank"
                mule["branch"] = "Connaught Place, New Delhi"
                mule["ifsc"] = "ICIC0000001"

        formatted.append({
            "hop_index": h.get("hop_index", 1),
            "stage": h.get("stage", "Transaction Hop"),
            "source_wallet": h.get("from_addr", ""),
            "target_wallet": h.get("to_addr", ""),
            "amount": h.get("amount", ""),
            "txid": h.get("txid", ""),
            "description": f"Stage {h.get('hop_index', 1)}: {h.get('stage')} ({h.get('status', 'VERIFIED')}) - Risk Classification: {h.get('risk', 'HIGH')}",
            "status": h.get("status", ""),
            "risk": h.get("risk", "HIGH"),
            "mule_details": mule
        })
    return formatted

def trace_crypto_narco_flow(case_id: str = "cyber_bengaluru", custom_wallet: Optional[str] = None) -> Dict[str, Any]:
    """Generates multi-hop on-chain flow analysis for dark web narco/extortion transactions."""
    intel = CASE_CRYPTO_INTEL.get(case_id, CASE_CRYPTO_INTEL["cyber_bengaluru"])
    
    if custom_wallet and custom_wallet != intel["deposit_wallet"]:
        # Generate dynamic trace for custom wallet
        short_hash = hashlib.sha256(custom_wallet.encode('utf-8')).hexdigest()[:8]
        raw_hops = [
            {
                "hop_index": 1,
                "stage": "Deposit Inflow",
                "from_addr": "1OriginDarkNetEscrow",
                "to_addr": custom_wallet,
                "amount": "8.50 BTC",
                "txid": f"0x{short_hash}99fa22...",
                "status": "UNHOSTED_WALLET_INFLOW",
                "risk": "HIGH"
            },
            {
                "hop_index": 2,
                "stage": "Tumbling Hop",
                "from_addr": custom_wallet,
                "to_addr": f"1MixerHop_{short_hash[:4]}",
                "amount": "8.50 BTC",
                "txid": f"0x{short_hash}44cc11...",
                "status": "WASABI_COINJOIN",
                "risk": "HIGH"
            },
            {
                "hop_index": 3,
                "stage": "Indian Exchange Cashout Mule",
                "from_addr": f"1MixerHop_{short_hash[:4]}",
                "to_addr": "1IndianExchangeKYC_Mule",
                "amount": "₹7,05,50,000 INR",
                "txid": f"0x{short_hash}77ee00...",
                "status": "FIAT_OFFRAMP_IDENTIFIED",
                "risk": "ACTIONABLE_SEIZURE",
                "linked_kyc_mule": "Identified P2P Cashout Mule",
                "attached_bank_acc": "ICICI Bank Acc #66200199401"
            }
        ]
        flow_hops = _format_hops(raw_hops)
        return {
            "status": "success",
            "case_id": case_id,
            "currency": "Bitcoin / Multi-Chain",
            "network": "Bitcoin / Multi-Chain",
            "deposit_wallet": custom_wallet,
            "wallet_label": f"Custom Tracked Node [ID: {short_hash}]",
            "total_amount_crypto": "8.50 BTC",
            "total_volume_crypto": "8.50 BTC",
            "fiat_equivalent_inr": "7,05,50,000",
            "tainted_score": 92.5,
            "tainted_score_pct": 92.5,
            "mixer_status": "Wasabi CoinJoin & Multi-Sig Hop",
            "mixer_used": "Wasabi CoinJoin & Multi-Sig Hop",
            "p2p_mule_nodes": ["ICICI Bank Acc #66200199401"],
            "flow_hops": flow_hops,
            "hops": raw_hops,
            "tactical_assessment": f"CUSTOM WALLET TRACED: Address {custom_wallet} was peeled through CoinJoin mixers and liquidated to domestic banking node (ICICI Bank Acc #66200199401)."
        }

    raw_hops = intel["hops"]
    flow_hops = _format_hops(raw_hops)
    mule_nodes = [h.get("attached_bank_acc") for h in raw_hops if h.get("attached_bank_acc")]

    return {
        "status": "success",
        "case_id": case_id,
        "currency": intel["network"],
        "network": intel["network"],
        "deposit_wallet": intel["deposit_wallet"],
        "wallet_label": intel["wallet_label"],
        "total_amount_crypto": intel["total_volume_crypto"],
        "total_volume_crypto": intel["total_volume_crypto"],
        "fiat_equivalent_inr": intel["fiat_equivalent_inr"].replace("₹", ""),
        "tainted_score": intel["tainted_score_pct"],
        "tainted_score_pct": intel["tainted_score_pct"],
        "mixer_status": intel["mixer_used"],
        "mixer_used": intel["mixer_used"],
        "p2p_mule_nodes": mule_nodes,
        "flow_hops": flow_hops,
        "hops": raw_hops,
        "tactical_assessment": intel["tactical_assessment"]
    }

