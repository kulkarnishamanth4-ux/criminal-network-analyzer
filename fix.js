const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/ExperimentalLabsModal.jsx', 'utf8');

// Remove acoustic tab from categories
code = code.replace(/\{\s*id:\s*'acoustic',\s*label:\s*' Ghost-Acoustic Triangulation'\s*\},/g, '');

// Enhance Hawala UI
const hawalaUI = `{/* 4. HAWALA FLUID DYNAMICS */}
              {activeTab === 'hawala_fluid' && (
                <div className="space-y-6">
                  <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2"><FiDroplet /> Navier-Stokes Financial Fluid Dynamics</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Models financial conduits as fluid pipes to simulate account freeze cascades and calculate the internal betrayal risk index.</p>
                    </div>
                    <button onClick={() => { setHawalaResult(null); handleRunHawalaFluid(); }} className="px-4 py-2 bg-[var(--neon-gold)] text-[#0a0a1a] font-bold text-xs rounded hover:opacity-90">
                      {hawalaLoading ? 'Simulating...' : 'Run Account Freeze Simulation'}
                    </button>
                  </div>
                  {hawalaResult && (
                    <>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg text-sm text-[var(--neon-gold)] font-mono">
                        {hawalaResult.tactical_fluid_assessment}
                      </div>
                      
                      {hawalaResult.frozen_target_accounts?.length > 0 && (
                        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-2">Simulated Targets For Freezing</div>
                          <div className="flex gap-2 flex-wrap">
                            {hawalaResult.frozen_target_accounts.map(acc => (
                              <div key={acc.id} className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-xs">
                                ❄️ {acc.account_number}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)] text-center">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Liquidity Starvation</div>
                          <div className="text-xl font-bold text-[var(--neon-red)] mt-1">{hawalaResult.fluid_pressure_metrics.downstream_liquidity_starvation_pct}%</div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)] text-center">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Upstream Backlog</div>
                          <div className="text-xl font-bold text-[var(--neon-gold)] mt-1">₹{(hawalaResult.fluid_pressure_metrics.upstream_backlog_conduit_inr/100000).toFixed(1)}L</div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)] text-center">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Mules Starved</div>
                          <div className="text-xl font-bold text-[var(--text-accent)] mt-1">{hawalaResult.fluid_pressure_metrics.isolated_downstream_mules}</div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)] text-center">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Betrayal Risk Index</div>
                          <div className="text-xl font-bold text-gray-400 mt-1">{hawalaResult.fluid_pressure_metrics.syndicate_internal_betrayal_risk_index}%</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}`;

code = code.replace(/\{\/\* 4\. HAWALA FLUID DYNAMICS \*\/\}[\s\S]*?(?=\{\/\* [56]\. )/, hawalaUI + '\n\n              ');

// Remove ghost acoustic jsx
code = code.replace(/\{\/\* 6\. GHOST ACOUSTIC \*\/\}[\s\S]*?(?=\{\/\* [78]\. )/, '');
// Also if it's followed by 5 instead of 7
code = code.replace(/\{\/\* 6\. GHOST ACOUSTIC \*\/\}[\s\S]*?(?=\{\/\* 5\. DIGITAL TWIN INTERROGATION \*\/\}|<\/div>\s*<\/div>\s*\)\s*;\s*\}\s*$)/, '');

fs.writeFileSync('frontend/src/components/ExperimentalLabsModal.jsx', code);
console.log('Done');
