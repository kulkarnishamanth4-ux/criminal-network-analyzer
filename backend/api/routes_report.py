from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database.crud import get_dashboard_stats, get_all_anomalies
from backend.database.models import FIR
from backend.graph.builder import build_graph_from_db
from backend.graph.algorithms import get_top_influencers, get_communities_summary
from backend.graph.crime_predictor import predict_crime_types
from datetime import datetime

router = APIRouter()


@router.get("/report/generate", response_class=HTMLResponse)
def generate_report(db: Session = Depends(get_db)):
    """Generate a printable intelligence report as HTML."""
    stats = get_dashboard_stats(db)
    influencers_data = get_top_influencers(db, 10)
    influencers = influencers_data.get("influencers", []) if isinstance(influencers_data, dict) else []
    communities_data = get_communities_summary(db)
    communities = communities_data.get("communities", []) if isinstance(communities_data, dict) else []
    anomalies = get_all_anomalies(db)
    firs = db.query(FIR).order_by(FIR.created_at.desc()).all()

    G = build_graph_from_db(db)
    predictions = predict_crime_types(db, G)
    if isinstance(predictions, dict):
        predictions = predictions.get("predictions", [])

    now = datetime.utcnow().strftime("%d %B %Y, %H:%M UTC")

    # Build anomalies HTML
    anomalies_html = ""
    for a in anomalies:
        sev_color = "#ff0040" if a.severity == "CRITICAL" else "#ff6b35" if a.severity == "HIGH" else "#f9ca24" if a.severity == "MEDIUM" else "#4ecdc4"
        anomalies_html += f"""
        <tr>
            <td><span style="color:{sev_color};font-weight:bold;">{a.severity}</span></td>
            <td>{a.anomaly_type}</td>
            <td>{a.title}</td>
            <td style="font-size:11px;color:#666;">{a.description or '-'}</td>
        </tr>"""

    # Build influencers HTML
    influencers_html = ""
    for i, inf in enumerate(influencers[:10]):
        pr = inf.get("pagerank", 0)
        influencers_html += f"""
        <tr>
            <td style="font-weight:bold;">{i+1}</td>
            <td>{inf.get('name', 'Unknown')}</td>
            <td>{inf.get('entity_type', '-')}</td>
            <td>{pr:.4f}</td>
            <td>{inf.get('betweenness', 0):.4f}</td>
            <td>{inf.get('community_id', '-')}</td>
        </tr>"""

    # Build communities HTML
    communities_html = ""
    for com in communities:
        members_list = ", ".join([m.get("name", str(m.get("id"))) for m in com.get("members", [])[:8]])
        if len(com.get("members", [])) > 8:
            members_list += f" +{len(com['members']) - 8} more"
        communities_html += f"""
        <tr>
            <td>Cluster #{com.get('id', '?')}</td>
            <td>{com.get('member_count', 0)}</td>
            <td>{com.get('dominant_crime_type', 'Unknown')}</td>
            <td style="font-size:11px;">{members_list}</td>
        </tr>"""

    # Build crime predictions HTML
    predictions_html = ""
    for pred in predictions[:6]:
        conf = pred.get("confidence", 0)
        bar_width = int(conf * 100)
        bar_color = "#ff0040" if conf > 0.7 else "#ff6b35" if conf > 0.4 else "#f9ca24"
        matched = [i for i in pred.get("indicators", []) if i.get("matched")]
        indicators_text = ", ".join([i["name"].replace("_", " ") for i in matched[:5]])
        predictions_html += f"""
        <tr>
            <td style="font-weight:bold;">{pred.get('crime_type', '-')}</td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden;">
                        <div style="width:{bar_width}%;height:100%;background:{bar_color};border-radius:4px;"></div>
                    </div>
                    <span style="font-weight:bold;min-width:40px;">{bar_width}%</span>
                </div>
            </td>
            <td style="font-size:11px;color:#666;">{indicators_text or 'None'}</td>
        </tr>"""

    # Build FIRs HTML
    firs_html = ""
    for fir in firs[:10]:
        firs_html += f"""
        <tr>
            <td>{fir.fir_number or fir.id}</td>
            <td>{fir.crime_type or '-'}</td>
            <td>{f'{fir.crime_confidence:.0%}' if fir.crime_confidence else '-'}</td>
            <td>{fir.police_station or '-'}</td>
            <td style="font-size:11px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{(fir.raw_text or '')[:150]}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CrimeNet Intelligence Report — {now}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a2e; padding: 40px; background: #fff; line-height: 1.5; }}
        .header {{ border-bottom: 3px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 30px; }}
        .header h1 {{ font-size: 28px; letter-spacing: 2px; }}
        .header .subtitle {{ color: #666; font-size: 13px; margin-top: 4px; }}
        .header .meta {{ display: flex; gap: 30px; margin-top: 12px; font-size: 12px; color: #888; }}
        .classification {{ display: inline-block; background: #ff0040; color: white; padding: 3px 12px; border-radius: 3px; font-size: 11px; font-weight: bold; letter-spacing: 1px; margin-top: 8px; }}
        
        h2 {{ font-size: 16px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a2e; border-left: 4px solid #64ffda; padding-left: 12px; margin: 30px 0 15px; }}
        
        .stats-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 30px; }}
        .stat-card {{ background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; text-align: center; }}
        .stat-card .value {{ font-size: 32px; font-weight: bold; color: #1a1a2e; }}
        .stat-card .label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 4px; }}
        
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }}
        th {{ background: #1a1a2e; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }}
        td {{ padding: 8px 12px; border-bottom: 1px solid #e8e8e8; }}
        tr:nth-child(even) {{ background: #f8f9fa; }}
        tr:hover {{ background: #f0f4ff; }}
        
        .footer {{ margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; font-size: 11px; color: #888; text-align: center; }}
        
        @media print {{
            body {{ padding: 20px; font-size: 11px; }}
            .no-print {{ display: none; }}
            h2 {{ page-break-after: avoid; }}
            table {{ page-break-inside: auto; }}
            tr {{ page-break-inside: avoid; }}
        }}
    </style>
</head>
<body>
    <div class="no-print" style="position:fixed;top:20px;right:20px;z-index:1000;">
        <button onclick="window.print()" style="background:#1a1a2e;color:white;border:none;padding:12px 24px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:bold;">
            🖨️ Print / Save as PDF
        </button>
    </div>

    <div class="header">
        <h1>🛡️ CRIMENET INTELLIGENCE REPORT</h1>
        <div class="subtitle">AI-Powered Criminal Network Analysis System — SIH 2026</div>
        <div class="classification">CONFIDENTIAL — LAW ENFORCEMENT USE ONLY</div>
        <div class="meta">
            <span>📅 Generated: {now}</span>
            <span>🔍 Entities Analyzed: {stats.get('total_entities', 0)}</span>
            <span>🔗 Relationships Mapped: {stats.get('total_relationships', 0)}</span>
            <span>👥 Syndicates Identified: {stats.get('communities_count', 0)}</span>
        </div>
    </div>

    <!-- Dashboard Overview -->
    <h2>Executive Summary</h2>
    <div class="stats-grid">
        <div class="stat-card">
            <div class="value">{stats.get('total_entities', 0)}</div>
            <div class="label">Total Entities</div>
        </div>
        <div class="stat-card">
            <div class="value">{stats.get('total_relationships', 0)}</div>
            <div class="label">Relationships</div>
        </div>
        <div class="stat-card">
            <div class="value">{stats.get('communities_count', 0)}</div>
            <div class="label">Syndicate Clusters</div>
        </div>
        <div class="stat-card">
            <div class="value" style="color:#ff0040;">{stats.get('anomalies_count', 0)}</div>
            <div class="label">Anomalies Detected</div>
        </div>
    </div>

    <!-- Entity Breakdown -->
    <h2>Entity Breakdown</h2>
    <div class="stats-grid">
        {''.join(f'<div class="stat-card"><div class="value">{v}</div><div class="label">{k}</div></div>' for k, v in stats.get('entities_by_type', {}).items())}
    </div>

    <!-- Top Influencers -->
    <h2>Key Targets (by PageRank Centrality)</h2>
    <table>
        <thead><tr><th>#</th><th>Name</th><th>Type</th><th>PageRank</th><th>Betweenness</th><th>Cluster</th></tr></thead>
        <tbody>{influencers_html or '<tr><td colspan="6" style="text-align:center;color:#888;">No data</td></tr>'}</tbody>
    </table>

    <!-- Crime Predictions -->
    <h2>Crime Type Predictions</h2>
    <table>
        <thead><tr><th>Crime Type</th><th>Confidence</th><th>Matching Indicators</th></tr></thead>
        <tbody>{predictions_html or '<tr><td colspan="3" style="text-align:center;color:#888;">No predictions available</td></tr>'}</tbody>
    </table>

    <!-- Syndicate Clusters -->
    <h2>Syndicate Clusters (Louvain Community Detection)</h2>
    <table>
        <thead><tr><th>Cluster</th><th>Members</th><th>Suspected Activity</th><th>Key Members</th></tr></thead>
        <tbody>{communities_html or '<tr><td colspan="4" style="text-align:center;color:#888;">No clusters detected</td></tr>'}</tbody>
    </table>

    <!-- Anomalies -->
    <h2>Anomaly Alerts</h2>
    <table>
        <thead><tr><th>Severity</th><th>Type</th><th>Alert</th><th>Description</th></tr></thead>
        <tbody>{anomalies_html or '<tr><td colspan="4" style="text-align:center;color:#888;">No anomalies detected</td></tr>'}</tbody>
    </table>

    <!-- FIR Records -->
    <h2>Ingested FIR Records</h2>
    <table>
        <thead><tr><th>FIR #</th><th>Crime Type</th><th>Confidence</th><th>Police Station</th><th>Excerpt</th></tr></thead>
        <tbody>{firs_html or '<tr><td colspan="5" style="text-align:center;color:#888;">No FIRs ingested</td></tr>'}</tbody>
    </table>

    <div class="footer">
        <p>This report was automatically generated by <strong>CrimeNet Intelligence Platform</strong> — AI-Powered Criminal Network Analysis System</p>
        <p>SIH 2026 | Problem Statement ID: SIH26189 | Ministry of Home Affairs</p>
        <p style="margin-top:8px;">⚠️ This document contains sensitive intelligence data. Handle according to applicable data protection guidelines.</p>
    </div>
</body>
</html>"""

    return HTMLResponse(content=html)
