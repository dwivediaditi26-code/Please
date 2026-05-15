import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { getC } from './theme.jsx';
import { ALL_EXERCISES, ALL_TESTS, ELBOW_PROTOCOLS, EXERCISE_DB, HIP_PROTOCOLS, KNEE_PROTOCOLS, PC, PROGRAMME_TEMPLATES, SHOULDER_PROTOCOLS, mid, px } from './shared.jsx';

function ProtocolPanel({ protocols, openId, setOpenId, openTx, setOpenTx, openPhase, togglePhase }) {
  return (
    <div style={{ borderTop:"1px solid rgba(0,0,0,0.08)", padding:"10px 14px 14px" }}>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        {protocols.map(p => (
          <button key={p.id} onClick={() => { setOpenId(openId === p.id ? null : p.id); setOpenTx(null); }}
            style={{ padding:"6px 13px", borderRadius:20, fontSize:"0.65rem", fontWeight:700,
              background: openId === p.id ? `${p.color}18` : "transparent",
              border: `1px solid ${openId === p.id ? p.color : "#d8cce8"}`,
              color: openId === p.id ? p.color : "#7e6a9a", cursor:"pointer" }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>
      {openId && (() => {
        const p = protocols.find(x => x.id === openId);
        if (!p) return null;
        return (
          <div style={{ background:`${p.color}06`, border:`1px solid ${p.color}30`, borderRadius:10, padding:"12px" }}>
            <div style={{ fontSize:"0.6rem", color:p.color, fontWeight:700, marginBottom:12,
              background:`${p.color}12`, display:"inline-block", padding:"3px 10px",
              borderRadius:6, border:`1px solid ${p.color}30` }}>📚 {p.evidence}</div>
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              <button onClick={() => setOpenTx(null)} style={{ flex:1, padding:"8px", borderRadius:8,
                border:`1px solid ${openTx !== "tx" ? p.color : "#d8cce8"}`,
                background: openTx !== "tx" ? `${p.color}15` : "transparent",
                color: openTx !== "tx" ? p.color : "#7e6a9a", fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>
                💪 Exercise Protocol
              </button>
              <button onClick={() => setOpenTx("tx")} style={{ flex:1, padding:"8px", borderRadius:8,
                border:`1px solid ${openTx === "tx" ? p.color : "#d8cce8"}`,
                background: openTx === "tx" ? `${p.color}15` : "transparent",
                color: openTx === "tx" ? p.color : "#7e6a9a", fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>
                🏥 Treatment Techniques
              </button>
            </div>
            {openTx !== "tx" && p.phases.map((ph, pi) => (
              <div key={pi} style={{ marginBottom:8, border:`1px solid ${ph.color}30`, borderRadius:8, overflow:"hidden" }}>
                <div onClick={() => togglePhase(`${p.id}_${pi}`)}
                  style={{ padding:"10px 12px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", background:`${ph.color}10` }}>
                  <div style={{ fontWeight:800, fontSize:"0.72rem", color:ph.color }}>{ph.phase}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:"0.6rem", color:"#7e6a9a" }}>{ph.exercises.length} exercises</span>
                    <span style={{ color:ph.color, fontSize:"0.7rem" }}>{openPhase[`${p.id}_${pi}`] ? "▲" : "▼"}</span>
                  </div>
                </div>
                {openPhase[`${p.id}_${pi}`] && (
                  <div style={{ padding:"10px 12px" }}>
                    {ph.exercises.map((ex, ei) => (
                      <div key={ei} style={{ background:"#f9f7ff", border:"1px solid #d8cce8", borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                        <div style={{ fontWeight:800, fontSize:"0.78rem", color:"#1a1025", marginBottom:4 }}>{ex.name}</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:7 }}>
                          {[["Sets",ex.sets],["Reps",ex.reps],["Hold",ex.hold+"s"],["Freq",ex.freq]].map(([l,v]) => (
                            <div key={l} style={{ background:`${ph.color}12`, border:`1px solid ${ph.color}30`, borderRadius:6, padding:"3px 8px", textAlign:"center" }}>
                              <div style={{ fontSize:"0.72rem", fontWeight:900, color:ph.color }}>{v}</div>
                              <div style={{ fontSize:"0.52rem", color:"#7e6a9a", textTransform:"uppercase" }}>{l}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize:"0.73rem", color:"#334155", lineHeight:1.6, marginBottom:6 }}>{ex.desc}</div>
                        <div style={{ background:"rgba(255,179,0,0.07)", border:"1px solid rgba(255,179,0,0.2)", borderRadius:6, padding:"5px 8px", fontSize:"0.68rem", color:"#b45309", marginBottom:5 }}>💡 {ex.cues}</div>
                        <div style={{ fontSize:"0.62rem", color:"#7f5af0" }}>📚 {ex.evidence}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {openTx === "tx" && (
              <div>
                {p.treatment.map((tx, ti) => (
                  <div key={ti} style={{ background:"#f9f7ff", border:`1px solid ${p.color}25`, borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                    <div style={{ fontWeight:800, fontSize:"0.76rem", color:p.color, marginBottom:5 }}>🏥 {tx.name}</div>
                    <div style={{ fontSize:"0.73rem", color:"#334155", lineHeight:1.6, marginBottom:6 }}>{tx.desc}</div>
                    <div style={{ fontSize:"0.62rem", color:"#7f5af0" }}>📚 {tx.evidence}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ─── REGION TEMPLATE MAP ──────────────────────────────────────────────────────
const REGION_TEMPLATE_MAP = {
  "Lumbar":       ["lbp_acute","lbp_core","lbp_radicular"],
  "Cervical":     ["neck_acute","posture_correction"],
  "Shoulder":     ["shoulder_rotator","shoulder_instability"],
  "Hip":          ["hip_oa","hip_glute"],
  "Knee":         ["knee_oa_template","knee_pfps_template","knee_acl_template"],
  "Ankle":        ["ankle_sprain","achilles"],
  "Posture":      ["posture_correction","upper_cross"],
  "Pelvic Floor": ["pf_incontinence","pf_prolapse"],
};

// ─── QUICK TEMPLATES PANEL ────────────────────────────────────────────────────
function QuickTemplatesPanel({ applyTemplate }) {
  const [openRegion,     setOpenRegion]     = useState(null);
  const [openKnee,       setOpenKnee]       = useState(null);
  const [openKneeTx,     setOpenKneeTx]     = useState(null);
  const [openShoulder,   setOpenShoulder]   = useState(null);
  const [openShoulderTx, setOpenShoulderTx] = useState(null);
  const [openElbow,      setOpenElbow]      = useState(null);
  const [openElbowTx,    setOpenElbowTx]    = useState(null);
  const [openHip,        setOpenHip]        = useState(null);
  const [openHipTx,      setOpenHipTx]      = useState(null);
  const [openPhase,      setOpenPhase]      = useState({});
  const [templatesOpen,  setTemplatesOpen]  = useState(false);
  const [kneeOpen,       setKneeOpen]       = useState(false);
  const [shoulderOpen,   setShoulderOpen]   = useState(false);
  const [elbowOpen,      setElbowOpen]      = useState(false);
  const [hipOpen,        setHipOpen]        = useState(false);

  const togglePhase = (key) => setOpenPhase(p => ({ ...p, [key]: !p[key] }));

  return (
    <div style={{ marginBottom:12 }}>

      {/* ── QUICK PROGRAMME TEMPLATES ── */}
      <div style={{ background:"#ffffff", border:"1px solid #d8cce8", borderRadius:12, marginBottom:10, overflow:"hidden" }}>
        <div onClick={() => setTemplatesOpen(o => !o)}
          style={{ padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#7e6a9a" }}>⚡ Quick Programme Templates</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"0.6rem", color:"#7e6a9a" }}>Select by region</span>
            <span style={{ color:"#7e6a9a", fontSize:"0.75rem" }}>{templatesOpen ? "▲" : "▼"}</span>
          </div>
        </div>
        {templatesOpen && (
          <div style={{ borderTop:"1px solid #d8cce8", padding:"10px 14px 14px" }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
              {Object.keys(REGION_TEMPLATE_MAP).map(region => (
                <button key={region} onClick={() => setOpenRegion(openRegion === region ? null : region)}
                  style={{ padding:"5px 12px", borderRadius:20, fontSize:"0.65rem", fontWeight:700,
                    background: openRegion === region ? "rgba(127,90,240,0.15)" : "rgba(0,229,255,0.06)",
                    border: `1px solid ${openRegion === region ? "rgba(127,90,240,0.5)" : "rgba(0,229,255,0.2)"}`,
                    color: openRegion === region ? "#7f5af0" : "#00e5ff", cursor:"pointer" }}>
                  {region}
                </button>
              ))}
            </div>
            {openRegion && (
              <div style={{ background:"rgba(127,90,240,0.05)", border:"1px solid rgba(127,90,240,0.15)", borderRadius:8, padding:"10px 12px" }}>
                <div style={{ fontSize:"0.6rem", fontWeight:700, color:"#7e6a9a", marginBottom:8, textTransform:"uppercase", letterSpacing:"1px" }}>
                  {openRegion} Templates
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {(REGION_TEMPLATE_MAP[openRegion] || []).map(key => (
                    <button key={key} onClick={() => applyTemplate(key)}
                      style={{ padding:"6px 14px", borderRadius:8, fontSize:"0.65rem", fontWeight:700,
                        background:"rgba(0,229,255,0.08)", border:"1px solid rgba(0,229,255,0.25)",
                        color:"#00e5ff", cursor:"pointer" }}>
                      {key.replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── KNEE EVIDENCE-BASED PROTOCOLS ── */}
      <div style={{ background:"#ffffff", border:"1px solid rgba(255,77,109,0.25)", borderRadius:12, overflow:"hidden" }}>
        <div onClick={() => setKneeOpen(o => !o)}
          style={{ padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"1rem" }}>🦵</span>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#ff4d6d" }}>Knee Evidence-Based Protocols</div>
              <div style={{ fontSize:"0.6rem", color:"#7e6a9a", marginTop:1 }}>Exercise + Treatment · {KNEE_PROTOCOLS.length} conditions covered</div>
            </div>
          </div>
          <span style={{ color:"#ff4d6d", fontSize:"0.75rem" }}>{kneeOpen ? "▲" : "▼"}</span>
        </div>
        {kneeOpen && (
          <div style={{ borderTop:"1px solid rgba(255,77,109,0.15)", padding:"10px 14px 14px" }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {KNEE_PROTOCOLS.map(kp => (
                <button key={kp.id}
                  onClick={() => { setOpenKnee(openKnee === kp.id ? null : kp.id); setOpenKneeTx(null); }}
                  style={{ padding:"6px 13px", borderRadius:20, fontSize:"0.65rem", fontWeight:700,
                    background: openKnee === kp.id ? `${kp.color}18` : "transparent",
                    border: `1px solid ${openKnee === kp.id ? kp.color : "#d8cce8"}`,
                    color: openKnee === kp.id ? kp.color : "#7e6a9a", cursor:"pointer" }}>
                  {kp.icon} {kp.label}
                </button>
              ))}
            </div>
            {openKnee && (() => {
              const kp = KNEE_PROTOCOLS.find(k => k.id === openKnee);
              if (!kp) return null;
              return (
                <div style={{ background:`${kp.color}06`, border:`1px solid ${kp.color}30`, borderRadius:10, padding:"12px" }}>
                  <div style={{ fontSize:"0.6rem", color:kp.color, fontWeight:700, marginBottom:12,
                    background:`${kp.color}12`, display:"inline-block", padding:"3px 10px",
                    borderRadius:6, border:`1px solid ${kp.color}30` }}>
                    📚 {kp.evidence}
                  </div>
                  <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                    <button onClick={() => setOpenKneeTx(null)}
                      style={{ flex:1, padding:"8px", borderRadius:8,
                        border:`1px solid ${openKneeTx !== "tx" ? kp.color : "#d8cce8"}`,
                        background: openKneeTx !== "tx" ? `${kp.color}15` : "transparent",
                        color: openKneeTx !== "tx" ? kp.color : "#7e6a9a",
                        fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>
                      💪 Exercise Protocol
                    </button>
                    <button onClick={() => setOpenKneeTx("tx")}
                      style={{ flex:1, padding:"8px", borderRadius:8,
                        border:`1px solid ${openKneeTx === "tx" ? kp.color : "#d8cce8"}`,
                        background: openKneeTx === "tx" ? `${kp.color}15` : "transparent",
                        color: openKneeTx === "tx" ? kp.color : "#7e6a9a",
                        fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>
                      🏥 Treatment Techniques
                    </button>
                  </div>
                  {openKneeTx !== "tx" && kp.phases.map((ph, pi) => (
                    <div key={pi} style={{ marginBottom:8, border:`1px solid ${ph.color}30`, borderRadius:8, overflow:"hidden" }}>
                      <div onClick={() => togglePhase(`${kp.id}_${pi}`)}
                        style={{ padding:"10px 12px", cursor:"pointer", display:"flex",
                          alignItems:"center", justifyContent:"space-between", background:`${ph.color}10` }}>
                        <div style={{ fontWeight:800, fontSize:"0.72rem", color:ph.color }}>{ph.phase}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:"0.6rem", color:"#7e6a9a" }}>{ph.exercises.length} exercises</span>
                          <span style={{ color:ph.color, fontSize:"0.7rem" }}>{openPhase[`${kp.id}_${pi}`] ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {openPhase[`${kp.id}_${pi}`] && (
                        <div style={{ padding:"10px 12px" }}>
                          {ph.exercises.map((ex, ei) => (
                            <div key={ei} style={{ background:"#f9f7ff", border:"1px solid #d8cce8", borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                              <div style={{ fontWeight:800, fontSize:"0.78rem", color:"#1a1025", marginBottom:4 }}>{ex.name}</div>
                              <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:7 }}>
                                {[["Sets",ex.sets],["Reps",ex.reps],["Hold",ex.hold+"s"],["Freq",ex.freq]].map(([l,v]) => (
                                  <div key={l} style={{ background:`${ph.color}12`, border:`1px solid ${ph.color}30`, borderRadius:6, padding:"3px 8px", textAlign:"center" }}>
                                    <div style={{ fontSize:"0.72rem", fontWeight:900, color:ph.color }}>{v}</div>
                                    <div style={{ fontSize:"0.52rem", color:"#7e6a9a", textTransform:"uppercase" }}>{l}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ fontSize:"0.73rem", color:"#334155", lineHeight:1.6, marginBottom:6 }}>{ex.desc}</div>
                              <div style={{ background:"rgba(255,179,0,0.07)", border:"1px solid rgba(255,179,0,0.2)", borderRadius:6, padding:"5px 8px", fontSize:"0.68rem", color:"#b45309", marginBottom:5 }}>
                                💡 {ex.cues}
                              </div>
                              <div style={{ fontSize:"0.62rem", color:"#7f5af0" }}>📚 {ex.evidence}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {openKneeTx === "tx" && (
                    <div>
                      {kp.treatment.map((tx, ti) => (
                        <div key={ti} style={{ background:"#f9f7ff", border:`1px solid ${kp.color}25`, borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                          <div style={{ fontWeight:800, fontSize:"0.76rem", color:kp.color, marginBottom:5 }}>🏥 {tx.name}</div>
                          <div style={{ fontSize:"0.73rem", color:"#334155", lineHeight:1.6, marginBottom:6 }}>{tx.desc}</div>
                          <div style={{ fontSize:"0.62rem", color:"#7f5af0" }}>📚 {tx.evidence}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── SHOULDER EVIDENCE-BASED PROTOCOLS ── */}
      <div style={{ background:"#ffffff", border:"1px solid rgba(127,90,240,0.25)", borderRadius:12, overflow:"hidden", marginTop:10 }}>
        <div onClick={() => setShoulderOpen(o => !o)}
          style={{ padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"1rem" }}>💪</span>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#7f5af0" }}>Shoulder Evidence-Based Protocols</div>
              <div style={{ fontSize:"0.6rem", color:"#7e6a9a", marginTop:1 }}>Exercise + Treatment · {SHOULDER_PROTOCOLS.length} conditions covered</div>
            </div>
          </div>
          <span style={{ color:"#7f5af0", fontSize:"0.75rem" }}>{shoulderOpen ? "▲" : "▼"}</span>
        </div>
        {shoulderOpen && <ProtocolPanel protocols={SHOULDER_PROTOCOLS} openId={openShoulder} setOpenId={setOpenShoulder} openTx={openShoulderTx} setOpenTx={setOpenShoulderTx} openPhase={openPhase} togglePhase={togglePhase} />}
      </div>

      {/* ── ELBOW EVIDENCE-BASED PROTOCOLS ── */}
      <div style={{ background:"#ffffff", border:"1px solid rgba(255,179,0,0.25)", borderRadius:12, overflow:"hidden", marginTop:10 }}>
        <div onClick={() => setElbowOpen(o => !o)}
          style={{ padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"1rem" }}>🦾</span>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#ffb300" }}>Elbow Evidence-Based Protocols</div>
              <div style={{ fontSize:"0.6rem", color:"#7e6a9a", marginTop:1 }}>Exercise + Treatment · {ELBOW_PROTOCOLS.length} conditions covered</div>
            </div>
          </div>
          <span style={{ color:"#ffb300", fontSize:"0.75rem" }}>{elbowOpen ? "▲" : "▼"}</span>
        </div>
        {elbowOpen && <ProtocolPanel protocols={ELBOW_PROTOCOLS} openId={openElbow} setOpenId={setOpenElbow} openTx={openElbowTx} setOpenTx={setOpenElbowTx} openPhase={openPhase} togglePhase={togglePhase} />}
      </div>

      {/* ── HIP EVIDENCE-BASED PROTOCOLS ── */}
      <div style={{ background:"#ffffff", border:"1px solid rgba(255,112,67,0.25)", borderRadius:12, overflow:"hidden", marginTop:10 }}>
        <div onClick={() => setHipOpen(o => !o)}
          style={{ padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"1rem" }}>🍑</span>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#ff7043" }}>Hip Evidence-Based Protocols</div>
              <div style={{ fontSize:"0.6rem", color:"#7e6a9a", marginTop:1 }}>Exercise + Treatment · {HIP_PROTOCOLS.length} conditions covered</div>
            </div>
          </div>
          <span style={{ color:"#ff7043", fontSize:"0.75rem" }}>{hipOpen ? "▲" : "▼"}</span>
        </div>
        {hipOpen && <ProtocolPanel protocols={HIP_PROTOCOLS} openId={openHip} setOpenId={setOpenHip} openTx={openHipTx} setOpenTx={setOpenHipTx} openPhase={openPhase} togglePhase={togglePhase} />}
      </div>

    </div>
  );
}

function ExercisePrescriptionModule({ data, set }) {
  // Initialise from shared data if already saved (patient switch / reload)
  const [programme,    setProgramme]    = useState(() => { try { const v=data?.hep_programme; return Array.isArray(v)?v:[]; } catch { return []; } });
  const [activeRegion, setActiveRegion] = useState("lumbar");
  const [activePhase,  setActivePhase]  = useState("All");
  const [search,       setSearch]       = useState("");
  const [openEx,       setOpenEx]       = useState(null);
  const [patientName,  setPatientName]  = useState(data?.dem_name || "");
  const [clinician,    setClinician]    = useState("");
  const [reviewDate,   setReviewDate]   = useState("");

  const phases = ["All","Phase 1","Phase 2","Phase 3"];
  const phaseColor = {"Phase 1":"#00c97a","Phase 2":"#ffb300","Phase 3":"#ff4d6d"};

  // Sync every programme change back into shared patient data
  const syncProgramme = (next) => { setProgramme(next); if(set) set("hep_programme", next); };

  const addEx = (ex) => { if(programme.find(p=>p.id===ex.id)) return; syncProgramme([...programme,{...ex,customSets:ex.sets,customReps:ex.reps,customHold:ex.hold,customFreq:ex.freq,notes:""}]); };
  const removeEx = (id) => syncProgramme(programme.filter(e=>e.id!==id));
  const updateEx = (id,field,val) => syncProgramme(programme.map(e=>e.id===id?{...e,[field]:val}:e));
  const applyTemplate = (key) => { const t=PROGRAMME_TEMPLATES[key]; const exs=t.exercises.map(id=>ALL_EXERCISES.find(e=>e.id===id)).filter(Boolean); syncProgramme(exs.map(ex=>({...ex,customSets:ex.sets,customReps:ex.reps,customHold:ex.hold,customFreq:ex.freq,notes:""}))); };

  const region = EXERCISE_DB[activeRegion];
  const filteredCategories = region ? Object.entries(region.categories).reduce((acc,[cat,exs])=>{
    const filtered=exs.filter(e=>(activePhase==="All"||e.phase===activePhase)&&(!search||e.name.toLowerCase().includes(search.toLowerCase())||e.target.toLowerCase().includes(search.toLowerCase())));
    if(filtered.length) acc[cat]=filtered;
    return acc;
  },{}) : {};

  const printHEP = () => {
    if(!programme.length) return;
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Home Exercise Programme</title>
<style>@page{size:A4;margin:18mm}*{box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif}body{background:#fff;color:#1a1a2e;font-size:11px;line-height:1.55}.header{border-bottom:3px solid #0077b6;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start}.logo{font-size:20px;font-weight:900;color:#0077b6}.logo span{color:#00b4d8}.meta{text-align:right;font-size:10px;color:#555}.ex{border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;overflow:hidden;break-inside:avoid}.ex-header{background:#0077b6;color:#fff;padding:8px 12px;display:flex;justify-content:space-between;align-items:center}.ex-title{font-size:12px;font-weight:800}.ex-phase{font-size:9px;opacity:0.8}.ex-body{padding:10px 12px}.ex-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}.ex-stat{background:#f0f9ff;border-radius:6px;padding:5px 8px;text-align:center}.ex-stat-val{font-size:13px;font-weight:900;color:#0077b6}.ex-stat-label{font-size:8px;color:#64748b;text-transform:uppercase}.ex-target{font-size:9px;color:#7f5af0;font-weight:700;margin-bottom:5px}.ex-desc{font-size:10.5px;color:#334155;margin-bottom:6px;line-height:1.55}.ex-cues{background:#fefce8;border-left:3px solid #fbbf24;padding:5px 8px;font-size:10px;color:#713f12;margin-bottom:5px}.ex-prog{font-size:9.5px;color:#059669;margin-top:5px}.footer{margin-top:16px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;text-align:center}.sig{margin-top:20px;display:flex;gap:30px}.sig-line{border-bottom:1px solid #94a3b8;height:28px;margin-bottom:3px}.sig-label{font-size:8px;color:#64748b}</style>
</head><body>
<div class="header"><div><div class="logo">Physio<span>Pro</span></div><div style="font-size:11px;color:#555;margin-top:2px">Home Exercise Programme</div></div><div class="meta"><div><b>Patient:</b> ${patientName||"—"}</div><div><b>Date:</b> ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}</div><div><b>Clinician:</b> ${clinician||"—"}</div>${reviewDate?`<div><b>Review:</b> ${reviewDate}</div>`:""}</div></div>
<p style="font-size:10px;color:#555;margin-bottom:14px">Perform exercises as prescribed. Stop if severe pain. Mild discomfort is normal. Contact your physiotherapist if unsure.</p>
${programme.map((ex,i)=>`<div class="ex"><div class="ex-header"><span class="ex-title">${i+1}. ${ex.name}</span><span class="ex-phase">${ex.phase||""}</span></div><div class="ex-body"><div class="ex-target">🎯 ${ex.target}</div><div class="ex-grid"><div class="ex-stat"><div class="ex-stat-val">${ex.customSets}</div><div class="ex-stat-label">Sets</div></div><div class="ex-stat"><div class="ex-stat-val">${ex.customReps}</div><div class="ex-stat-label">Reps</div></div><div class="ex-stat"><div class="ex-stat-val">${ex.customHold}s</div><div class="ex-stat-label">Hold</div></div><div class="ex-stat"><div class="ex-stat-val" style="font-size:9px">${ex.customFreq}</div><div class="ex-stat-label">Freq</div></div></div><div class="ex-desc">${ex.desc}</div><div class="ex-cues">💡 ${ex.cues}</div>${ex.notes?`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px;padding:5px 8px;font-size:10px;margin-top:5px"><b>Notes:</b> ${ex.notes}</div>`:""}<div class="ex-prog">📈 ${ex.progression}</div><div style="margin-top:8px;font-size:9px;color:#94a3b8">Pain (0–10): ___/10 &nbsp;&nbsp; ☐ Mon ☐ Tue ☐ Wed ☐ Thu ☐ Fri ☐ Sat ☐ Sun</div></div></div>`).join("")}
<div class="sig"><div style="flex:1"><div class="sig-line"></div><div class="sig-label">Clinician Signature</div></div><div style="flex:1"><div class="sig-line"></div><div class="sig-label">Patient Signature</div></div></div>
<div class="footer">Generated by PhysioPro · ${new Date().toLocaleString()}</div>
</body></html>`;
    downloadPDFFromHTML(html, `HEP_${patientName || "Patient"}_${Date.now()}.pdf`);
  };

  const inp={width:"100%",background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:8,color:"#1a1025",fontFamily:"inherit",outline:"none",padding:"7px 10px",fontSize:"0.75rem"};

  return(
    <div>
      {/* ── QUICK TEMPLATES + KNEE PROTOCOLS ── */}
      <QuickTemplatesPanel applyTemplate={applyTemplate} />

      {/* Region tabs */}
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
        {Object.entries(EXERCISE_DB).map(([key,r])=>(
          <button key={key} onClick={()=>setActiveRegion(key)} style={{padding:"5px 10px",borderRadius:8,fontSize:"0.65rem",fontWeight:activeRegion===key?800:500,border:`1px solid ${activeRegion===key?r.color+"60":"#1a2d45"}`,background:activeRegion===key?`${r.color}15`:"transparent",color:activeRegion===key?r.color:"#7e6a9a",cursor:"pointer"}}>{r.icon} {r.label}</button>
        ))}
      </div>

      {/* Phase + Search */}
      <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4}}>
          {phases.map(p=>(
            <button key={p} onClick={()=>setActivePhase(p)} style={{padding:"4px 9px",borderRadius:7,fontSize:"0.6rem",fontWeight:activePhase===p?800:500,border:`1px solid ${activePhase===p?(phaseColor[p]||"rgba(0,229,255,0.4)"):"#1a2d45"}`,background:activePhase===p?`${phaseColor[p]||"rgba(0,229,255,0.18)"}18`:"transparent",color:activePhase===p?(phaseColor[p]||"#00e5ff"):"#6b8399",cursor:"pointer"}}>{p}</button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search exercises or muscles..." style={{flex:1,minWidth:120,background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:8,color:"#1a1025",fontFamily:"inherit",outline:"none",padding:"5px 10px",fontSize:"0.72rem"}}/>
      </div>

      {/* Exercise library */}
      <div style={{marginBottom:14}}>
        {Object.entries(filteredCategories).map(([cat,exs])=>(
          <div key={cat} style={{marginBottom:12}}>
            <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"1px",marginBottom:7,display:"flex",alignItems:"center",gap:7}}>
              <div style={{height:1,width:8,background:region.color,borderRadius:1}}/>{cat}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {exs.map(ex=>{
                const inProg=programme.find(p=>p.id===ex.id);
                const isOpen=openEx===ex.id;
                return(
                  <div key={ex.id} style={{background:"#ffffff",border:`1px solid ${inProg?region.color+"50":"#1a2d45"}`,borderRadius:10,overflow:"hidden"}}>
                    <div onClick={()=>setOpenEx(isOpen?null:ex.id)} style={{padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                          <span style={{fontSize:"0.75rem",fontWeight:700,color:"#1a1025"}}>{ex.name}</span>
                          <span style={{fontSize:"0.55rem",padding:"1px 6px",borderRadius:5,background:`${phaseColor[ex.phase]||"#1a2d45"}18`,color:phaseColor[ex.phase]||"#6b8399",border:`1px solid ${phaseColor[ex.phase]||"#1a2d45"}40`,fontWeight:700}}>{ex.phase}</span>
                          <span style={{fontSize:"0.55rem",color:"#ffb300",fontWeight:700}}>⭐ {ex.evidence?.split(" — ")[0]}</span>
                        </div>
                        <div style={{fontSize:"0.63rem",color:"#7e6a9a",marginTop:2}}>{ex.target}</div>
                      </div>
                      <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
                        <span style={{fontSize:"0.6rem",color:"#7e6a9a"}}>{isOpen?"▲":"▼"}</span>
                        <button onClick={e=>{e.stopPropagation();inProg?removeEx(ex.id):addEx(ex);}} style={{padding:"4px 10px",borderRadius:7,fontSize:"0.62rem",fontWeight:800,border:`1px solid ${inProg?"rgba(255,77,109,0.4)":"rgba(0,201,122,0.4)"}`,background:inProg?"rgba(255,77,109,0.12)":"rgba(0,201,122,0.12)",color:inProg?"#ff4d6d":"#00c97a",cursor:"pointer"}}>{inProg?"✕ Remove":"+ Add"}</button>
                      </div>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 12px 12px",borderTop:"1px solid #d8cce8"}}>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,margin:"10px 0"}}>
                          {[["Sets",ex.sets],["Reps",ex.reps],["Hold",`${ex.hold}s`],["Freq",ex.freq]].map(([l,v])=>(
                            <div key={l} style={{background:"#f5f0fb",borderRadius:8,padding:"7px",textAlign:"center"}}>
                              <div style={{fontSize:"0.85rem",fontWeight:900,color:region.color}}>{v}</div>
                              <div style={{fontSize:"0.55rem",color:"#7e6a9a",textTransform:"uppercase"}}>{l}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{fontSize:"0.73rem",color:"#1a1025",lineHeight:1.6,marginBottom:7}}>{ex.desc}</div>
                        <div style={{padding:"7px 10px",background:"rgba(255,179,0,0.07)",border:"1px solid rgba(255,179,0,0.2)",borderRadius:8,fontSize:"0.7rem",color:"#ffb300",marginBottom:7}}>💡 {ex.cues}</div>
                        <div style={{fontSize:"0.65rem",color:"#00c97a",marginBottom:4}}>📈 Progression: {ex.progression}</div>
                        <div style={{fontSize:"0.62rem",color:"#7f5af0"}}>📚 Evidence: {ex.evidence}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Programme builder */}
      {programme.length>0&&(
        <div style={{background:"#ffffff",border:"1px solid rgba(0,201,122,0.3)",borderRadius:14,padding:"14px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:7}}>
            <div style={{fontSize:"0.72rem",fontWeight:800,color:"#00c97a"}}>📋 Patient Programme — {programme.length} exercise{programme.length!==1?"s":""}</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setProgramme([])} style={{padding:"5px 10px",background:"rgba(255,77,109,0.1)",border:"1px solid rgba(255,77,109,0.3)",borderRadius:7,color:"#ff4d6d",fontSize:"0.62rem",fontWeight:700,cursor:"pointer"}}>🗑 Clear</button>
              <button onClick={printHEP} style={{padding:"5px 10px",background:"linear-gradient(135deg,rgba(0,201,122,0.2),rgba(0,229,255,0.15))",border:"1px solid rgba(0,201,122,0.4)",borderRadius:7,color:"#00c97a",fontSize:"0.62rem",fontWeight:800,cursor:"pointer"}}>🖨 Print HEP</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
            <div><label style={{fontSize:"0.58rem",fontWeight:700,color:"#7e6a9a",display:"block",marginBottom:3}}>Patient Name</label><input value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="Patient name" style={inp}/></div>
            <div><label style={{fontSize:"0.58rem",fontWeight:700,color:"#7e6a9a",display:"block",marginBottom:3}}>Clinician</label><input value={clinician} onChange={e=>setClinician(e.target.value)} placeholder="Your name" style={inp}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:"0.58rem",fontWeight:700,color:"#7e6a9a",display:"block",marginBottom:3}}>Review Date</label><input value={reviewDate} onChange={e=>setReviewDate(e.target.value)} placeholder="e.g. 2 weeks" style={inp}/></div>
          </div>
          {programme.map((ex,i)=>(
            <div key={ex.id} style={{background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:9}}>
                <span style={{width:22,height:22,borderRadius:"50%",background:"rgba(0,201,122,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.62rem",fontWeight:800,color:"#00c97a",flexShrink:0}}>{i+1}</span>
                <div style={{flex:1}}><div style={{fontSize:"0.75rem",fontWeight:700,color:"#1a1025"}}>{ex.name}</div><div style={{fontSize:"0.6rem",color:"#7e6a9a"}}>{ex.target}</div></div>
                <button onClick={()=>removeEx(ex.id)} style={{background:"none",border:"1px solid #d8cce8",borderRadius:6,color:"#7e6a9a",cursor:"pointer",fontSize:"0.65rem",padding:"2px 7px"}}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:8}}>
                {[["Sets","customSets"],["Reps","customReps"],["Hold (s)","customHold"]].map(([label,field])=>(
                  <div key={field}><div style={{fontSize:"0.55rem",color:"#7e6a9a",marginBottom:2,textTransform:"uppercase"}}>{label}</div><input type="number" value={ex[field]} onChange={e=>updateEx(ex.id,field,e.target.value)} style={{...inp,padding:"5px 8px",textAlign:"center"}}/></div>
                ))}
                <div><div style={{fontSize:"0.55rem",color:"#7e6a9a",marginBottom:2,textTransform:"uppercase"}}>Frequency</div><input value={ex.customFreq} onChange={e=>updateEx(ex.id,"customFreq",e.target.value)} style={{...inp,padding:"5px 8px"}}/></div>
              </div>
              <div><div style={{fontSize:"0.55rem",color:"#7e6a9a",marginBottom:2,textTransform:"uppercase"}}>Clinical Notes</div><input value={ex.notes||""} onChange={e=>updateEx(ex.id,"notes",e.target.value)} placeholder="Patient-specific notes, modifications..." style={inp}/></div>
            </div>
          ))}
          <button onClick={printHEP} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#00c97a,#00e5ff)",border:"none",borderRadius:10,color:"#000",fontWeight:900,fontSize:"0.82rem",cursor:"pointer",marginTop:4}}>🖨 Print / Download Home Exercise Programme (HEP)</button>
        </div>
      )}

      <div style={{padding:"7px 11px",background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:8,fontSize:"0.6rem",color:"#7e6a9a",lineHeight:1.5}}>
        ⚠ Exercise prescriptions are clinical suggestions. Modify sets/reps/frequency based on individual patient capacity, irritability, and response. Evidence ratings reflect current literature.
      </div>
    </div>
  );
}

// ─── Tenderness grade colours ─────────────────────────────────────────────────
const GRADE_COLOR = {
  "0":"#00c97a","1+":"#a3e635","2+":"#ffb300","3+":"#ff4d6d","4+":"#dc2626",
};

// ─── Comprehensive anatomical point map ───────────────────────────────────────
// Each zone: { label, structures[], side }
// Coordinates are % of SVG viewBox (0–100 × 0–200 for front; 0–100 × 0–200 for back)
// Front body occupies x:5–95, y:0–200; Back body: same
// The SVG viewBox is 200×420 (front left, back right, side by side)

// We define "hotspots" as named regions that trigger when user clicks within their radius
// Format: { id, label, structures, x (%), y (%), r (radius px in SVG), side:"front"|"back"|"both" }

const ANATOMICAL_HOTSPOTS = [
  // ── HEAD & NECK (front) ─────────────────────────────────────────────────────
  { id:"scalp",           x:50,  y:6,   r:14, side:"front", label:"Scalp / Occiput",
    structures:["Occipitofrontalis","Temporalis","Suboccipital muscles","Occipital protuberance","Mastoid process"] },
  { id:"tmj_r",           x:62,  y:13,  r:7,  side:"front", label:"Right TMJ",
    structures:["Temporomandibular joint","Lateral pterygoid","Masseter insertion","Articular disc"] },
  { id:"tmj_l",           x:38,  y:13,  r:7,  side:"front", label:"Left TMJ",
    structures:["Temporomandibular joint","Lateral pterygoid","Masseter insertion","Articular disc"] },
  { id:"scm_r",           x:62,  y:20,  r:7,  side:"front", label:"Right SCM",
    structures:["Sternocleidomastoid — sternal head","SCM — clavicular head","Anterior cervical lymph nodes"] },
  { id:"scm_l",           x:38,  y:20,  r:7,  side:"front", label:"Left SCM",
    structures:["Sternocleidomastoid — sternal head","SCM — clavicular head","Anterior cervical lymph nodes"] },
  { id:"ant_cervical",    x:50,  y:19,  r:6,  side:"front", label:"Anterior Cervical Spine",
    structures:["C2–C7 anterior vertebral bodies","Longus colli / longus capitis","Thyroid cartilage (C4/5)","Hyoid bone (C3)","Carotid pulse"] },

  // ── NECK (back) ──────────────────────────────────────────────────────────────
  { id:"post_cervical",   x:50,  y:10,  r:10, side:"back", label:"Posterior Cervical Spine",
    structures:["C2–C7 spinous processes","Suboccipital triangle","Semispinalis capitis","Splenius capitis","Trapezius — upper fibres","Facet joints C2–C7"] },
  { id:"cerv_lat_r",      x:62,  y:15,  r:7,  side:"back", label:"Right Lateral Cervical",
    structures:["Levator scapulae origin","Scalenes — posterior","C3–C5 transverse processes","Upper trapezius lateral border"] },
  { id:"cerv_lat_l",      x:38,  y:15,  r:7,  side:"back", label:"Left Lateral Cervical",
    structures:["Levator scapulae origin","Scalenes — posterior","C3–C5 transverse processes","Upper trapezius lateral border"] },

  // ── SHOULDER (front) ─────────────────────────────────────────────────────────
  { id:"ac_joint_r",      x:72,  y:24,  r:6,  side:"front", label:"Right AC Joint",
    structures:["Acromioclavicular joint","AC ligament","Coracoclavicular ligaments (conoid & trapezoid)","Acromion tip"] },
  { id:"ac_joint_l",      x:28,  y:24,  r:6,  side:"front", label:"Left AC Joint",
    structures:["Acromioclavicular joint","AC ligament","Coracoclavicular ligaments","Acromion tip"] },
  { id:"ant_deltoid_r",   x:76,  y:29,  r:7,  side:"front", label:"Right Anterior Deltoid",
    structures:["Anterior deltoid — clavicular head","Coracoid process","Bicipital groove","Long head biceps tendon","Subscapularis insertion (lesser tuberosity)"] },
  { id:"ant_deltoid_l",   x:24,  y:29,  r:7,  side:"front", label:"Left Anterior Deltoid",
    structures:["Anterior deltoid — clavicular head","Coracoid process","Bicipital groove","Long head biceps tendon","Subscapularis insertion (lesser tuberosity)"] },
  { id:"lat_deltoid_r",   x:82,  y:32,  r:6,  side:"front", label:"Right Lateral Deltoid",
    structures:["Lateral deltoid — acromial head","Greater tuberosity (supraspinatus insertion)","Subacromial space","Subdeltoid bursa"] },
  { id:"lat_deltoid_l",   x:18,  y:32,  r:6,  side:"front", label:"Left Lateral Deltoid",
    structures:["Lateral deltoid — acromial head","Greater tuberosity (supraspinatus insertion)","Subacromial space","Subdeltoid bursa"] },
  { id:"sternum",         x:50,  y:27,  r:7,  side:"front", label:"Sternum / SC Joint",
    structures:["Sternoclavicular joint","Manubrium","Sternal body","Xiphoid process","Pectoralis major — sternal origin"] },
  { id:"pec_major_r",     x:63,  y:30,  r:8,  side:"front", label:"Right Pectoralis Major",
    structures:["Pectoralis major — clavicular head","Pectoralis major — sternal head","Pectoralis minor (deep — coracoid)","Anterior axillary fold"] },
  { id:"pec_major_l",     x:37,  y:30,  r:8,  side:"front", label:"Left Pectoralis Major",
    structures:["Pectoralis major — clavicular head","Pectoralis major — sternal head","Pectoralis minor (deep — coracoid)","Anterior axillary fold"] },

  // ── SHOULDER (back) ──────────────────────────────────────────────────────────
  { id:"post_deltoid_r",  x:76,  y:28,  r:7,  side:"back", label:"Right Posterior Deltoid",
    structures:["Posterior deltoid — spinal head","Infraspinatus insertion (greater tuberosity)","Teres minor insertion","Posterior glenohumeral joint line"] },
  { id:"post_deltoid_l",  x:24,  y:28,  r:7,  side:"back", label:"Left Posterior Deltoid",
    structures:["Posterior deltoid — spinal head","Infraspinatus insertion (greater tuberosity)","Teres minor insertion","Posterior glenohumeral joint line"] },
  { id:"supraspinatus_r", x:71,  y:24,  r:6,  side:"back", label:"Right Supraspinatus",
    structures:["Supraspinatus — supraspinous fossa","Supraspinatus tendon (critical zone — 1cm from insertion)","Suprascapular nerve (suprascapular notch)"] },
  { id:"supraspinatus_l", x:29,  y:24,  r:6,  side:"back", label:"Left Supraspinatus",
    structures:["Supraspinatus — supraspinous fossa","Supraspinatus tendon (critical zone — 1cm from insertion)","Suprascapular nerve (suprascapular notch)"] },
  { id:"infraspinatus_r", x:72,  y:30,  r:7,  side:"back", label:"Right Infraspinatus",
    structures:["Infraspinatus — infraspinous fossa","Infraspinatus tendon","Teres minor","Posterior axillary fold"] },
  { id:"infraspinatus_l", x:28,  y:30,  r:7,  side:"back", label:"Left Infraspinatus",
    structures:["Infraspinatus — infraspinous fossa","Infraspinatus tendon","Teres minor","Posterior axillary fold"] },
  { id:"trapezius_r",     x:63,  y:21,  r:8,  side:"back", label:"Right Upper Trapezius",
    structures:["Upper trapezius","Levator scapulae (C1–C4 TP insertions)","Rhomboid minor origin","Trigger point zone — upper trapezius"] },
  { id:"trapezius_l",     x:37,  y:21,  r:8,  side:"back", label:"Left Upper Trapezius",
    structures:["Upper trapezius","Levator scapulae (C1–C4 TP insertions)","Rhomboid minor origin","Trigger point zone — upper trapezius"] },
  { id:"scapula_r",       x:71,  y:33,  r:8,  side:"back", label:"Right Scapula / Rhomboids",
    structures:["Scapular spine","Medial scapular border","Rhomboid major / minor","Mid trapezius","Serratus anterior (lateral border)"] },
  { id:"scapula_l",       x:29,  y:33,  r:8,  side:"back", label:"Left Scapula / Rhomboids",
    structures:["Scapular spine","Medial scapular border","Rhomboid major / minor","Mid trapezius","Serratus anterior (lateral border)"] },

  // ── THORACIC SPINE (back) ────────────────────────────────────────────────────
  { id:"thoracic_spine",  x:50,  y:32,  r:8,  side:"back", label:"Thoracic Spine (T1–T12)",
    structures:["T1–T12 spinous processes","Thoracic facet joints","Erector spinae (iliocostalis / longissimus)","Multifidus","Costotransverse joints"] },
  { id:"mid_trap",        x:50,  y:28,  r:6,  side:"back", label:"Mid Trapezius / Interscapular",
    structures:["Middle trapezius","Lower trapezius","Rhomboid major","Interscapular trigger point zone","T2–T5 spinous processes"] },

  // ── ELBOW (front) ────────────────────────────────────────────────────────────
  { id:"lat_epicon_r",    x:81,  y:46,  r:6,  side:"front", label:"Right Lateral Epicondyle",
    structures:["Lateral epicondyle","ECRB origin (tennis elbow)","EDC origin","Radiohumeral joint","Lateral collateral ligament origin"] },
  { id:"lat_epicon_l",    x:19,  y:46,  r:6,  side:"front", label:"Left Lateral Epicondyle",
    structures:["Lateral epicondyle","ECRB origin (tennis elbow)","EDC origin","Radiohumeral joint","Lateral collateral ligament origin"] },
  { id:"med_epicon_r",    x:74,  y:46,  r:6,  side:"front", label:"Right Medial Epicondyle",
    structures:["Medial epicondyle","FCR / FCU origin (golfer's elbow)","Ulnar nerve (cubital tunnel)","UCL origin","Pronator teres origin"] },
  { id:"med_epicon_l",    x:26,  y:46,  r:6,  side:"front", label:"Left Medial Epicondyle",
    structures:["Medial epicondyle","FCR / FCU origin (golfer's elbow)","Ulnar nerve (cubital tunnel)","UCL origin","Pronator teres origin"] },
  { id:"ant_cubital_r",   x:78,  y:47,  r:5,  side:"front", label:"Right Antecubital Fossa",
    structures:["Biceps tendon","Brachialis","Brachial artery","Median nerve","Bicipital aponeurosis"] },
  { id:"ant_cubital_l",   x:22,  y:47,  r:5,  side:"front", label:"Left Antecubital Fossa",
    structures:["Biceps tendon","Brachialis","Brachial artery","Median nerve","Bicipital aponeurosis"] },

  // ── FOREARM (front) ──────────────────────────────────────────────────────────
  { id:"ant_forearm_r",   x:80,  y:53,  r:6,  side:"front", label:"Right Anterior Forearm",
    structures:["Flexor digitorum superficialis","Flexor carpi radialis","Palmaris longus","Pronator teres","Median nerve (midforearm)"] },
  { id:"ant_forearm_l",   x:20,  y:53,  r:6,  side:"front", label:"Left Anterior Forearm",
    structures:["Flexor digitorum superficialis","Flexor carpi radialis","Palmaris longus","Pronator teres","Median nerve (midforearm)"] },

  // ── WRIST & HAND ─────────────────────────────────────────────────────────────
  { id:"wrist_r",         x:81,  y:61,  r:6,  side:"front", label:"Right Wrist / Carpal Tunnel",
    structures:["Carpal tunnel (median nerve)","Flexor retinaculum","Radial styloid (De Quervain's)","Scaphoid tubercle","Pisiform (ulnar nerve / FCU)"] },
  { id:"wrist_l",         x:19,  y:61,  r:6,  side:"front", label:"Left Wrist / Carpal Tunnel",
    structures:["Carpal tunnel (median nerve)","Flexor retinaculum","Radial styloid (De Quervain's)","Scaphoid tubercle","Pisiform (ulnar nerve / FCU)"] },

  // ── ABDOMEN / LUMBAR (front) ─────────────────────────────────────────────────
  { id:"abdomen",         x:50,  y:50,  r:10, side:"front", label:"Abdomen",
    structures:["Rectus abdominis","External oblique","Linea alba","Umbilical region","Inguinal ligament","McBurney's point (appendix)"] },

  // ── LUMBAR SPINE (back) ──────────────────────────────────────────────────────
  { id:"lumbar_spine",    x:50,  y:49,  r:9,  side:"back", label:"Lumbar Spine (L1–L5)",
    structures:["L1–L5 spinous processes","Lumbar facet joints","Erector spinae (paraspinal)","Multifidus","Interspinous ligaments","L4/L5 — most common disc level"] },
  { id:"si_joint_r",      x:60,  y:55,  r:7,  side:"back", label:"Right Sacroiliac Joint",
    structures:["Sacroiliac joint (PSIS)","Posterior SI ligament","Iliolumbar ligament","Piriformis origin","PSIS landmark"] },
  { id:"si_joint_l",      x:40,  y:55,  r:7,  side:"back", label:"Left Sacroiliac Joint",
    structures:["Sacroiliac joint (PSIS)","Posterior SI ligament","Iliolumbar ligament","Piriformis origin","PSIS landmark"] },
  { id:"ql_r",            x:63,  y:49,  r:6,  side:"back", label:"Right Quadratus Lumborum",
    structures:["Quadratus lumborum","QL trigger point zone","12th rib attachment","Iliac crest insertion","L1–L4 transverse processes"] },
  { id:"ql_l",            x:37,  y:49,  r:6,  side:"back", label:"Left Quadratus Lumborum",
    structures:["Quadratus lumborum","QL trigger point zone","12th rib attachment","Iliac crest insertion","L1–L4 transverse processes"] },

  // ── HIP (front) ──────────────────────────────────────────────────────────────
  { id:"asis_r",          x:65,  y:60,  r:7,  side:"front", label:"Right ASIS / Hip Flexors",
    structures:["Anterior superior iliac spine (ASIS)","Sartorius origin","TFL origin","Inguinal ligament lateral end","Femoral nerve (medial to ASIS)"] },
  { id:"asis_l",          x:35,  y:60,  r:7,  side:"front", label:"Left ASIS / Hip Flexors",
    structures:["Anterior superior iliac spine (ASIS)","Sartorius origin","TFL origin","Inguinal ligament lateral end","Femoral nerve (medial to ASIS)"] },
  { id:"groin_r",         x:62,  y:65,  r:7,  side:"front", label:"Right Groin / Adductor Origin",
    structures:["Adductor longus origin (pubic tubercle)","Adductor brevis","Gracilis origin","Iliopsoas tendon (lesser trochanter)","Femoral triangle"] },
  { id:"groin_l",         x:38,  y:65,  r:7,  side:"front", label:"Left Groin / Adductor Origin",
    structures:["Adductor longus origin (pubic tubercle)","Adductor brevis","Gracilis origin","Iliopsoas tendon (lesser trochanter)","Femoral triangle"] },

  // ── HIP (back) ───────────────────────────────────────────────────────────────
  { id:"gmax_r",          x:65,  y:62,  r:9,  side:"back", label:"Right Gluteus Maximus",
    structures:["Gluteus maximus — posterior ilium","Sacrotuberous ligament","Gluteal fold","Greater trochanter (posterolateral)","Ischial tuberosity (proximal hamstrings)"] },
  { id:"gmax_l",          x:35,  y:62,  r:9,  side:"back", label:"Left Gluteus Maximus",
    structures:["Gluteus maximus — posterior ilium","Sacrotuberous ligament","Gluteal fold","Greater trochanter (posterolateral)","Ischial tuberosity (proximal hamstrings)"] },
  { id:"gt_r",            x:75,  y:62,  r:6,  side:"back", label:"Right Greater Trochanter",
    structures:["Greater trochanter","Gluteus medius insertion","Gluteus minimus insertion","Trochanteric bursa","TFL / IT band proximal"] },
  { id:"gt_l",            x:25,  y:62,  r:6,  side:"back", label:"Left Greater Trochanter",
    structures:["Greater trochanter","Gluteus medius insertion","Gluteus minimus insertion","Trochanteric bursa","TFL / IT band proximal"] },
  { id:"piriformis_r",    x:63,  y:62,  r:6,  side:"back", label:"Right Piriformis / Deep Gluteal",
    structures:["Piriformis (mid-point PSIS → GT)","Sciatic nerve (deep gluteal)","Obturator internus","Quadratus femoris","Deep gluteal syndrome zone"] },
  { id:"piriformis_l",    x:37,  y:62,  r:6,  side:"back", label:"Left Piriformis / Deep Gluteal",
    structures:["Piriformis (mid-point PSIS → GT)","Sciatic nerve (deep gluteal)","Obturator internus","Quadratus femoris","Deep gluteal syndrome zone"] },

  // ── THIGH (front) ────────────────────────────────────────────────────────────
  { id:"quad_r",          x:68,  y:76,  r:8,  side:"front", label:"Right Quadriceps",
    structures:["Rectus femoris — central belly","Vastus lateralis","Vastus medialis oblique (VMO)","Quadriceps tendon (suprapatellar)","TFL / IT band (lateral thigh)"] },
  { id:"quad_l",          x:32,  y:76,  r:8,  side:"front", label:"Left Quadriceps",
    structures:["Rectus femoris — central belly","Vastus lateralis","Vastus medialis oblique (VMO)","Quadriceps tendon (suprapatellar)","TFL / IT band (lateral thigh)"] },

  // ── THIGH (back) ─────────────────────────────────────────────────────────────
  { id:"hamstring_r",     x:67,  y:75,  r:9,  side:"back", label:"Right Hamstrings",
    structures:["Biceps femoris — long head","Semitendinosus","Semimembranosus","Proximal hamstring origin (ischial tuberosity)","Sciatic nerve (posterior thigh)"] },
  { id:"hamstring_l",     x:33,  y:75,  r:9,  side:"back", label:"Left Hamstrings",
    structures:["Biceps femoris — long head","Semitendinosus","Semimembranosus","Proximal hamstring origin (ischial tuberosity)","Sciatic nerve (posterior thigh)"] },
  { id:"itband_r",        x:76,  y:76,  r:6,  side:"back", label:"Right IT Band / Lateral Thigh",
    structures:["Iliotibial band","TFL belly","Vastus lateralis (lateral)","IT band — mid thigh friction zone"] },
  { id:"itband_l",        x:24,  y:76,  r:6,  side:"back", label:"Left IT Band / Lateral Thigh",
    structures:["Iliotibial band","TFL belly","Vastus lateralis (lateral)","IT band — mid thigh friction zone"] },

  // ── KNEE (front) ─────────────────────────────────────────────────────────────
  { id:"patella_r",       x:68,  y:87,  r:6,  side:"front", label:"Right Patella / Extensor Mechanism",
    structures:["Patella (superior / inferior pole)","Patellar tendon","Tibial tuberosity (Osgood-Schlatter)","Infrapatellar fat pad","Medial patellar facet","Lateral patellar facet"] },
  { id:"patella_l",       x:32,  y:87,  r:6,  side:"front", label:"Left Patella / Extensor Mechanism",
    structures:["Patella (superior / inferior pole)","Patellar tendon","Tibial tuberosity (Osgood-Schlatter)","Infrapatellar fat pad","Medial patellar facet","Lateral patellar facet"] },
  { id:"med_knee_r",      x:63,  y:88,  r:5,  side:"front", label:"Right Medial Knee",
    structures:["MCL — femoral attachment","MCL — tibial attachment","Medial meniscus (joint line)","Pes anserinus (ST/gracilis/sartorius)","Medial compartment"] },
  { id:"med_knee_l",      x:37,  y:88,  r:5,  side:"front", label:"Left Medial Knee",
    structures:["MCL — femoral attachment","MCL — tibial attachment","Medial meniscus (joint line)","Pes anserinus (ST/gracilis/sartorius)","Medial compartment"] },
  { id:"lat_knee_r",      x:74,  y:88,  r:5,  side:"front", label:"Right Lateral Knee",
    structures:["LCL (lateral collateral ligament)","Lateral meniscus (joint line)","IT band — Gerdy's tubercle","Biceps femoris insertion (fibula head)","Popliteus tendon"] },
  { id:"lat_knee_l",      x:26,  y:88,  r:5,  side:"front", label:"Left Lateral Knee",
    structures:["LCL (lateral collateral ligament)","Lateral meniscus (joint line)","IT band — Gerdy's tubercle","Biceps femoris insertion (fibula head)","Popliteus tendon"] },

  // ── KNEE (back) ──────────────────────────────────────────────────────────────
  { id:"popliteal_r",     x:67,  y:88,  r:7,  side:"back", label:"Right Popliteal Fossa",
    structures:["Popliteal fossa","Popliteal artery (pulse)","Common peroneal nerve","Posterior capsule","Baker's cyst zone","Popliteus muscle"] },
  { id:"popliteal_l",     x:33,  y:88,  r:7,  side:"back", label:"Left Popliteal Fossa",
    structures:["Popliteal fossa","Popliteal artery (pulse)","Common peroneal nerve","Posterior capsule","Baker's cyst zone","Popliteus muscle"] },

  // ── LOWER LEG (front) ────────────────────────────────────────────────────────
  { id:"ant_shin_r",      x:69,  y:97,  r:6,  side:"front", label:"Right Anterior Shin / Tibialis Anterior",
    structures:["Tibialis anterior — belly","Tibial crest (shin splints / MTSS)","Extensor digitorum longus","Anterior compartment","Deep peroneal nerve"] },
  { id:"ant_shin_l",      x:31,  y:97,  r:6,  side:"front", label:"Left Anterior Shin / Tibialis Anterior",
    structures:["Tibialis anterior — belly","Tibial crest (shin splints / MTSS)","Extensor digitorum longus","Anterior compartment","Deep peroneal nerve"] },

  // ── LOWER LEG (back) ─────────────────────────────────────────────────────────
  { id:"gastroc_r",       x:67,  y:96,  r:7,  side:"back", label:"Right Gastrocnemius / Soleus",
    structures:["Gastrocnemius — medial head","Gastrocnemius — lateral head","Soleus","Achilles tendon (proximal)","Sural nerve","Musculotendinous junction"] },
  { id:"gastroc_l",       x:33,  y:96,  r:7,  side:"back", label:"Left Gastrocnemius / Soleus",
    structures:["Gastrocnemius — medial head","Gastrocnemius — lateral head","Soleus","Achilles tendon (proximal)","Sural nerve","Musculotendinous junction"] },

  // ── ANKLE & FOOT ─────────────────────────────────────────────────────────────
  { id:"achilles_r",      x:67,  y:108, r:5,  side:"back", label:"Right Achilles Tendon",
    structures:["Achilles tendon — mid-portion (2–6cm from insertion)","Achilles insertion (calcaneum)","Retrocalcaneal bursa","Haglund's deformity zone","Kager's fat pad"] },
  { id:"achilles_l",      x:33,  y:108, r:5,  side:"back", label:"Left Achilles Tendon",
    structures:["Achilles tendon — mid-portion (2–6cm from insertion)","Achilles insertion (calcaneum)","Retrocalcaneal bursa","Haglund's deformity zone","Kager's fat pad"] },
  { id:"lat_ankle_r",     x:74,  y:108, r:6,  side:"front", label:"Right Lateral Ankle",
    structures:["ATFL (anterior talofibular ligament)","CFL (calcaneofibular ligament)","Lateral malleolus","Peroneus longus / brevis tendons","Sinus tarsi"] },
  { id:"lat_ankle_l",     x:26,  y:108, r:6,  side:"front", label:"Left Lateral Ankle",
    structures:["ATFL (anterior talofibular ligament)","CFL (calcaneofibular ligament)","Lateral malleolus","Peroneus longus / brevis tendons","Sinus tarsi"] },
  { id:"med_ankle_r",     x:63,  y:108, r:6,  side:"front", label:"Right Medial Ankle",
    structures:["Deltoid ligament","Medial malleolus","Tibialis posterior tendon","Flexor digitorum longus","Tarsal tunnel (posterior tibial nerve)"] },
  { id:"med_ankle_l",     x:37,  y:108, r:6,  side:"front", label:"Left Medial Ankle",
    structures:["Deltoid ligament","Medial malleolus","Tibialis posterior tendon","Flexor digitorum longus","Tarsal tunnel (posterior tibial nerve)"] },
  { id:"plantar_r",       x:69,  y:113, r:6,  side:"front", label:"Right Plantar Fascia / Heel",
    structures:["Plantar fascia — calcaneal origin","Calcaneal fat pad","Medial calcaneal tubercle","Plantar fascia — mid-band","1st MTP joint (hallux rigidus)"] },
  { id:"plantar_l",       x:31,  y:113, r:6,  side:"front", label:"Left Plantar Fascia / Heel",
    structures:["Plantar fascia — calcaneal origin","Calcaneal fat pad","Medial calcaneal tubercle","Plantar fascia — mid-band","1st MTP joint (hallux rigidus)"] },
];

// ─── Palpation finding options ────────────────────────────────────────────────
const GRADES = ["0","1+","2+","3+","4+"];
const TEMPS  = ["Normal","Warm","Hot","Cool","Cold"];
const TEXTURES = ["Normal / Soft","Tight / Restricted","Spasm","Trigger Point","Thickened / Fibrosed","Crepitus","Fluctuant / Oedema"];
const FINDING_COLORS = {
  "0":"#00c97a","1+":"#a3e635","2+":"#ffb300","3+":"#ff4d6d","4+":"#dc2626",
  "Normal":"#00c97a","Warm":"#ffb300","Hot":"#ff4d6d","Cool":"#38bdf8","Cold":"#0ea5e9",
};

// ─── SVG Body Figure ──────────────────────────────────────────────────────────
// Draws a clean anatomical outline — front (left) and back (right) in one SVG
// ViewBox: 0 0 200 130  (front occupies 0–90, back 110–200, y 0–130)
// All hotspot coordinates use this viewBox scale

const BODY_SVG_VIEWBOX = "0 0 220 125";

function BodyFigureSVG({ pins, hoveredHotspot, onHover, onClick, view }) {
  // view: "front" | "back"
  const offsetX = view === "back" ? 110 : 0;

  // anatomical outline paths (simplified but recognisable)
  const bodyColor = "#0d1929";
  const outlineColor = "#1e3a5f";
  const sk = outlineColor;

  return (
    <g transform={`translate(${offsetX}, 0)`}>
      {/* ── Label ── */}
      <text x="45" y="6" textAnchor="middle" fontSize="4" fill="#6b8399" fontWeight="700" letterSpacing="1">
        {view === "front" ? "ANTERIOR" : "POSTERIOR"}
      </text>

      {/* ── HEAD ── */}
      <ellipse cx="45" cy="16" rx="10" ry="12" fill={bodyColor} stroke={sk} strokeWidth="0.8"/>
      {/* ears */}
      <ellipse cx="35.5" cy="16" rx="2" ry="3.5" fill={bodyColor} stroke={sk} strokeWidth="0.6"/>
      <ellipse cx="54.5" cy="16" rx="2" ry="3.5" fill={bodyColor} stroke={sk} strokeWidth="0.6"/>
      {/* neck */}
      <rect x="40" y="26.5" width="10" height="8" rx="2" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>

      {/* ── TORSO ── */}
      {/* shoulders */}
      <path d="M28,33 Q20,32 18,38 L20,48 Q22,50 25,49 L30,38Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      <path d="M62,33 Q70,32 72,38 L70,48 Q68,50 65,49 L60,38Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      {/* torso body */}
      <path d="M30,33 Q45,30 60,33 L63,68 Q58,75 45,76 Q32,75 27,68Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      {/* clavicles (front only) */}
      {view === "front" && <>
        <line x1="40" y1="33" x2="28" y2="35" stroke={sk} strokeWidth="0.5" opacity="0.5"/>
        <line x1="50" y1="33" x2="62" y2="35" stroke={sk} strokeWidth="0.5" opacity="0.5"/>
        {/* sternum */}
        <line x1="45" y1="33" x2="45" y2="66" stroke={sk} strokeWidth="0.5" opacity="0.4"/>
      </>}
      {/* spine line (back only) */}
      {view === "back" && <line x1="45" y1="33" x2="45" y2="76" stroke={sk} strokeWidth="0.5" opacity="0.4"/>}

      {/* ── PELVIS ── */}
      <path d="M27,68 Q45,80 63,68 L65,78 Q58,86 45,87 Q32,86 25,78Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      {/* iliac crests */}
      <path d="M27,68 Q24,72 25,78" fill="none" stroke={sk} strokeWidth="0.5" opacity="0.5"/>
      <path d="M63,68 Q66,72 65,78" fill="none" stroke={sk} strokeWidth="0.5" opacity="0.5"/>

      {/* ── UPPER ARMS ── */}
      <path d="M20,38 L14,60 Q13,63 16,64 L22,62 L25,49Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      <path d="M70,38 L76,60 Q77,63 74,64 L68,62 L65,49Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>

      {/* ── FOREARMS ── */}
      <path d="M14,60 L10,80 Q9,83 12,84 L16,83 L22,62Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      <path d="M76,60 L80,80 Q81,83 78,84 L74,83 L68,62Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>

      {/* ── HANDS ── */}
      <ellipse cx="11" cy="87" rx="4" ry="5.5" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      <ellipse cx="79" cy="87" rx="4" ry="5.5" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      {/* fingers */}
      {[8,10,12,14].map((x,i)=><line key={i} x1={x} y1="91" x2={x-0.5} y2="95" stroke={sk} strokeWidth="0.5" opacity="0.6"/>)}
      {[76,78,80,82].map((x,i)=><line key={i} x1={x} y1="91" x2={x+0.5} y2="95" stroke={sk} strokeWidth="0.5" opacity="0.6"/>)}

      {/* ── THIGHS ── */}
      <path d="M25,78 L22,108 Q22,112 25,113 L34,113 Q37,112 37,108 L38,78Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      <path d="M65,78 L68,108 Q68,112 65,113 L56,113 Q53,112 53,108 L52,78Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>

      {/* ── LOWER LEGS ── */}
      <path d="M22,108 L21,120 Q21,122 24,122 L28,122 Q31,122 32,120 L34,113 Q26,113 22,108Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      <path d="M68,108 L69,120 Q69,122 66,122 L62,122 Q59,122 58,120 L56,113 Q64,113 68,108Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>

      {/* ── FEET ── */}
      <path d="M21,120 Q18,122 17,124 L30,124 Q32,124 32,122 L28,122Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>
      <path d="M69,120 Q72,122 73,124 L60,124 Q58,124 58,122 L62,122Z" fill={bodyColor} stroke={sk} strokeWidth="0.7"/>

      {/* ── SCAPULAE (back only) ── */}
      {view === "back" && <>
        <path d="M27,35 Q24,42 26,48 Q30,52 34,48 Q36,42 33,35Z" fill="none" stroke={sk} strokeWidth="0.5" opacity="0.5"/>
        <path d="M63,35 Q66,42 64,48 Q60,52 56,48 Q54,42 57,35Z" fill="none" stroke={sk} strokeWidth="0.5" opacity="0.5"/>
        {/* spine of scapula */}
        <line x1="26" y1="37" x2="34" y2="37" stroke={sk} strokeWidth="0.4" opacity="0.5"/>
        <line x1="64" y1="37" x2="56" y2="37" stroke={sk} strokeWidth="0.4" opacity="0.5"/>
      </>}

      {/* ── KNEE CAPS (front) ── */}
      {view === "front" && <>
        <ellipse cx="29" cy="108" rx="5" ry="4" fill={bodyColor} stroke={sk} strokeWidth="0.6" opacity="0.7"/>
        <ellipse cx="61" cy="108" rx="5" ry="4" fill={bodyColor} stroke={sk} strokeWidth="0.6" opacity="0.7"/>
      </>}

      {/* ── HOTSPOT INTERACTIVE ZONES ── */}
      {ANATOMICAL_HOTSPOTS.filter(h => h.side === view || h.side === "both").map(h => {
        // convert % coords to SVG space (viewbox 90×125 per body)
        const sx = (h.x / 100) * 90;
        const sy = (h.y / 100) * 125;
        const pin = pins.find(p => p.hotspotId === h.id);
        const isHovered = hoveredHotspot === h.id;
        const gradeColor = pin ? (GRADE_COLOR[pin.tenderness] || C.accent) : null;

        return (
          <g key={h.id}>
            {/* Invisible interaction zone */}
            <circle
              cx={sx} cy={sy} r={h.r * 0.85}
              fill={isHovered ? "rgba(0,229,255,0.12)" : "transparent"}
              stroke={isHovered ? "rgba(0,229,255,0.5)" : "transparent"}
              strokeWidth="0.5"
              style={{ cursor:"crosshair", transition:"fill 0.15s" }}
              onMouseEnter={() => onHover(h.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(h)}
            />
            {/* Pin marker if recorded */}
            {pin && (
              <g onClick={() => onClick(h)} style={{ cursor:"pointer" }}>
                <circle cx={sx} cy={sy} r="3.5"
                  fill={gradeColor} stroke="#000" strokeWidth="0.5"
                  style={{ filter:`drop-shadow(0 0 3px ${gradeColor})` }}/>
                <circle cx={sx} cy={sy} r="1.5" fill="#000" opacity="0.5"/>
              </g>
            )}
            {/* Hover tooltip */}
            {isHovered && !pin && (
              <g>
                <circle cx={sx} cy={sy} r="2.5"
                  fill="rgba(0,229,255,0.3)" stroke="#00e5ff" strokeWidth="0.6"
                  style={{ animation:"pulse 1s infinite" }}/>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ─── Tenderness Grade Selector ────────────────────────────────────────────────
function GradeChip({ value, selected, onClick }) {
  const color = GRADE_COLOR[value] || C.muted;
  return (
    <button
      onClick={onClick}
      style={{
        padding:"5px 10px", borderRadius:8, fontSize:"0.72rem", fontWeight:700,
        border:`1.5px solid ${selected ? color : C.border}`,
        background: selected ? `${color}20` : "transparent",
        color: selected ? color : C.muted,
        cursor:"pointer", transition:"all 0.12s",
      }}
    >{value}</button>
  );
}

// ─── Main PalpationModule ─────────────────────────────────────────────────────
function PalpationModule({ data, set }) {
  const C = getC();
  const [pins, setPins]           = useState([]); // { id, hotspotId, label, structures, tenderness, temp, texture, notes, side }
  const [selected, setSelected]   = useState(null); // id of selected pin
  const [hovered, setHovered]     = useState(null);  // hotspot id
  const [view, setView]           = useState("front"); // "front" | "back"
  const genId = () => Math.random().toString(36).slice(2, 9);

  // Click on hotspot → add or select pin
  const handleHotspotClick = useCallback((hotspot) => {
    const existing = pins.find(p => p.hotspotId === hotspot.id);
    if (existing) {
      setSelected(existing.id);
    } else {
      const newPin = {
        id: genId(),
        hotspotId: hotspot.id,
        label: hotspot.label,
        structures: hotspot.structures,
        side: view,
        tenderness: "",
        temp: "",
        texture: [],
        notes: "",
      };
      setPins(p => [...p, newPin]);
      setSelected(newPin.id);
    }
  }, [pins, view]);

  const updatePin = (id, field, val) => {
    setPins(p => p.map(pin => pin.id === id ? { ...pin, [field]: val } : pin));
  };

  const toggleTexture = (id, tex) => {
    setPins(p => p.map(pin => {
      if (pin.id !== id) return pin;
      const arr = pin.texture || [];
      return { ...pin, texture: arr.includes(tex) ? arr.filter(t => t !== tex) : [...arr, tex] };
    }));
  };

  const removePin = (id) => {
    setPins(p => p.filter(pin => pin.id !== id));
    if (selected === id) setSelected(null);
  };

  const selPin = pins.find(p => p.id === selected);
  const detailPanelRef = useRef(null);

  // Auto-scroll to detail panel on mobile when a pin is selected
  useEffect(() => {
    if (selected && detailPanelRef.current) {
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" });
      }, 80);
    }
  }, [selected]);

  const inp = {
    width:"100%", background:C.s2, border:`1px solid ${C.border}`, borderRadius:8,
    color:C.text, padding:"8px 10px", fontSize:"0.75rem", fontFamily:"inherit",
    outline:"none", resize:"vertical",
  };

  return (
    <div style={{ fontFamily:"'SF Pro Display','Helvetica Neue',system-ui,sans-serif", color:C.text }}>
      <style>{`
        @keyframes pulsePin { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.4)} }
        @keyframes slideIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:`linear-gradient(135deg,rgba(0,229,255,0.06),rgba(127,90,240,0.06))`,
        border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:"0.95rem", color:C.accent }}>🖐️ Palpation Map</div>
            <div style={{ fontSize:"0.68rem", color:C.muted, marginTop:2 }}>
              Tap any region on the body — anatomical point auto-generates. Record tenderness, tissue quality & findings.
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:"0.65rem", color:C.muted }}>{pins.length} point{pins.length !== 1 ? "s" : ""} recorded</span>
            {pins.length > 0 && (
              <button onClick={() => { setPins([]); setSelected(null); }}
                style={{ padding:"4px 10px", borderRadius:7, border:`1px solid ${C.red}40`,
                  background:"rgba(255,77,109,0.08)", color:C.red, fontSize:"0.62rem",
                  fontWeight:700, cursor:"pointer" }}>Clear all</button>
            )}
          </div>
        </div>

        {/* Instruction */}
        <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <div style={{ padding:"5px 10px", background:"rgba(0,229,255,0.08)", border:`1px solid ${C.accent}25`,
            borderRadius:8, fontSize:"0.65rem", color:C.accent }}>
            👆 Tap body → anatomical point appears
          </div>
          <div style={{ padding:"5px 10px", background:"rgba(127,90,240,0.08)", border:`1px solid ${C.a2}25`,
            borderRadius:8, fontSize:"0.65rem", color:C.a2 }}>
            🔴 Coloured dots = recorded findings
          </div>
          <div style={{ padding:"5px 10px", background:"rgba(0,201,122,0.08)", border:`1px solid ${C.green}25`,
            borderRadius:8, fontSize:"0.65rem", color:C.green }}>
            Dot colour = tenderness grade
          </div>
        </div>
      </div>

      {/* ── View toggle ── */}
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {[["front","Anterior View 🫀"],["back","Posterior View 🦴"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ flex:1, padding:"9px", borderRadius:10, fontWeight:700, fontSize:"0.76rem",
              cursor:"pointer", border:`1.5px solid ${view === v ? C.accent : C.border}`,
              background: view === v ? "rgba(0,229,255,0.1)" : C.surface,
              color: view === v ? C.accent : C.muted, transition:"all 0.15s" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── Body Map + Panel ── */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>

        {/* SVG Body */}
        <div style={{ flex:"0 0 auto", display:"flex", flexDirection:"column", alignItems:"center", width:"100%", maxWidth:300 }}>
          <svg
            viewBox={BODY_SVG_VIEWBOX}
            width="100%"
            style={{ maxWidth:280, minWidth:180, background:C.surface,
              border:`1px solid ${C.border}`, borderRadius:14,
              cursor:"crosshair", userSelect:"none" }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Front body (left) */}
            <BodyFigureSVG
              view="front"
              pins={pins.filter(p => p.side === "front")}
              hoveredHotspot={view === "front" ? hovered : null}
              onHover={view === "front" ? setHovered : () => {}}
              onClick={view === "front" ? handleHotspotClick : () => {}}
            />

            {/* Back body (right) */}
            <BodyFigureSVG
              view="back"
              pins={pins.filter(p => p.side === "back")}
              hoveredHotspot={view === "back" ? hovered : null}
              onHover={view === "back" ? setHovered : () => {}}
              onClick={view === "back" ? handleHotspotClick : () => {}}
            />

            {/* Divider */}
            <line x1="105" y1="5" x2="105" y2="125" stroke={C.border} strokeWidth="0.5" strokeDasharray="2,3"/>
          </svg>

          {/* Hover tooltip outside SVG */}
          {hovered && (
            <div style={{ marginTop:6, padding:"6px 12px", background:C.s2,
              border:`1px solid ${C.accent}40`, borderRadius:8, maxWidth:280,
              fontSize:"0.68rem", color:C.accent, fontWeight:600, textAlign:"center",
              animation:"slideIn 0.15s ease" }}>
              {ANATOMICAL_HOTSPOTS.find(h => h.id === hovered)?.label}
              <div style={{ color:C.muted, fontWeight:400, fontSize:"0.6rem", marginTop:1 }}>
                Click to add palpation point
              </div>
            </div>
          )}

          {/* Tenderness legend */}
          <div style={{ marginTop:10, padding:"8px 10px", background:C.surface,
            border:`1px solid ${C.border}`, borderRadius:8, maxWidth:280, width:"100%" }}>
            <div style={{ fontSize:"0.58rem", fontWeight:700, color:C.muted,
              textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Tenderness Legend</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {GRADES.map(g => (
                <div key={g} style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:GRADE_COLOR[g],
                    boxShadow:`0 0 4px ${GRADE_COLOR[g]}` }}/>
                  <span style={{ fontSize:"0.6rem", color:C.muted, fontWeight:600 }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div ref={detailPanelRef} style={{ flex:"1 1 260px", minWidth:220 }}>

          {/* No selection state */}
          {!selPin && pins.length === 0 && (
            <div style={{ background:C.surface, border:`1px dashed ${C.border}`,
              borderRadius:12, padding:"28px 20px", textAlign:"center" }}>
              <div style={{ fontSize:"2.2rem", marginBottom:10 }}>🖐️</div>
              <div style={{ fontWeight:700, color:C.text, marginBottom:6 }}>
                Tap any point on the body
              </div>
              <div style={{ fontSize:"0.72rem", color:C.muted, lineHeight:1.6 }}>
                The anatomical structure name auto-fills.<br/>
                Then record tenderness grade, tissue quality,<br/>
                temperature and clinical notes.
              </div>
            </div>
          )}

          {/* Pin list (when nothing selected) */}
          {!selPin && pins.length > 0 && (
            <div style={{ animation:"slideIn 0.2s ease" }}>
              <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.muted,
                textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>
                Recorded Points — {pins.length}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {pins.map(pin => {
                  const gc = GRADE_COLOR[pin.tenderness] || C.border;
                  return (
                    <div key={pin.id} onClick={() => setSelected(pin.id)}
                      style={{ background:C.surface, border:`1px solid ${gc}50`,
                        borderRadius:10, padding:"9px 12px", cursor:"pointer",
                        display:"flex", alignItems:"flex-start", gap:9,
                        transition:"border-color 0.15s", borderLeft:`3px solid ${gc}` }}>
                      <div style={{ width:28, height:28, borderRadius:"50%",
                        background:`${gc}20`, border:`2px solid ${gc}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"0.7rem", fontWeight:900, color:gc, flexShrink:0 }}>
                        {pin.tenderness || "?"}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:"0.78rem", color:C.text,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {pin.label}
                        </div>
                        <div style={{ fontSize:"0.62rem", color:C.muted, marginTop:2 }}>
                          {pin.side === "front" ? "Anterior" : "Posterior"}
                          {pin.temp ? ` · ${pin.temp}` : ""}
                          {(pin.texture || []).length > 0 ? ` · ${pin.texture.join(", ")}` : ""}
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); removePin(pin.id); }}
                        style={{ background:"none", border:"none", color:C.muted,
                          cursor:"pointer", fontSize:"0.72rem", padding:"0 3px", lineHeight:1 }}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected pin — findings panel */}
          {selPin && (
            <div style={{ animation:"slideIn 0.18s ease" }}>
              {/* Panel header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                marginBottom:10, gap:8 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%",
                      background:C.accent, boxShadow:`0 0 6px ${C.accent}` }}/>
                    <div style={{ fontSize:"0.62rem", color:C.muted,
                      textTransform:"uppercase", letterSpacing:"1px" }}>
                      {selPin.side === "front" ? "Anterior" : "Posterior"} Surface
                    </div>
                  </div>
                  <div style={{ fontWeight:800, fontSize:"0.9rem", color:C.text, lineHeight:1.3 }}>
                    {selPin.label}
                  </div>
                </div>
                <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                  <button onClick={() => setSelected(null)}
                    style={{ padding:"4px 10px", borderRadius:7, border:`1px solid ${C.border}`,
                      background:"transparent", color:C.muted, fontSize:"0.62rem", cursor:"pointer" }}>
                    ← Back
                  </button>
                  <button onClick={() => removePin(selPin.id)}
                    style={{ padding:"4px 9px", borderRadius:7, border:`1px solid ${C.red}40`,
                      background:"rgba(255,77,109,0.08)", color:C.red, fontSize:"0.62rem", cursor:"pointer" }}>
                    Remove
                  </button>
                </div>
              </div>

              {/* Structures at this point */}
              <div style={{ background:C.s2, border:`1px solid ${C.border}`,
                borderRadius:9, padding:"9px 12px", marginBottom:12 }}>
                <div style={{ fontSize:"0.58rem", fontWeight:700, color:C.accent,
                  textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
                  🏗 Structures at this point
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {selPin.structures.map((s, i) => (
                    <span key={i} style={{ fontSize:"0.65rem", padding:"2px 8px", borderRadius:20,
                      background:C.s3, border:`1px solid ${C.border}`, color:C.text }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Tenderness Grade ── */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:C.muted,
                  textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
                  Tenderness Grade (0 – 4+)
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {GRADES.map(g => (
                    <GradeChip key={g} value={g}
                      selected={selPin.tenderness === g}
                      onClick={() => updatePin(selPin.id, "tenderness", selPin.tenderness === g ? "" : g)}/>
                  ))}
                </div>
                {selPin.tenderness && (
                  <div style={{ marginTop:6, fontSize:"0.65rem", color:GRADE_COLOR[selPin.tenderness],
                    padding:"4px 9px", background:`${GRADE_COLOR[selPin.tenderness]}12`,
                    borderRadius:7, border:`1px solid ${GRADE_COLOR[selPin.tenderness]}30` }}>
                    {{
                      "0":"Grade 0 — No tenderness on firm palpation",
                      "1+":"Grade 1+ — Mild; patient reports pain, no grimace",
                      "2+":"Grade 2+ — Moderate; patient grimaces or withdraws",
                      "3+":"Grade 3+ — Severe; patient withdraws + verbalises",
                      "4+":"Grade 4+ — Excruciating; cannot tolerate palpation",
                    }[selPin.tenderness]}
                  </div>
                )}
              </div>

              {/* ── Tissue Temperature ── */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:C.muted,
                  textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
                  Tissue Temperature (dorsum of hand)
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {TEMPS.map(t => {
                    const sel = selPin.temp === t;
                    const col = {"Normal":C.green,"Warm":C.yellow,"Hot":C.red,"Cool":"#38bdf8","Cold":"#0ea5e9"}[t];
                    return (
                      <button key={t} onClick={() => updatePin(selPin.id, "temp", sel ? "" : t)}
                        style={{ padding:"4px 10px", borderRadius:8, fontSize:"0.68rem", fontWeight:sel ? 700 : 400,
                          border:`1px solid ${sel ? col : C.border}`, background:sel ? `${col}18` : "transparent",
                          color:sel ? col : C.muted, cursor:"pointer", transition:"all 0.12s" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Tissue Quality ── */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:C.muted,
                  textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
                  Tissue Quality (select all that apply)
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {TEXTURES.map(tex => {
                    const sel = (selPin.texture || []).includes(tex);
                    return (
                      <button key={tex} onClick={() => toggleTexture(selPin.id, tex)}
                        style={{ padding:"4px 10px", borderRadius:8, fontSize:"0.65rem", fontWeight:sel ? 700 : 400,
                          border:`1px solid ${sel ? C.a2 : C.border}`, background:sel ? "rgba(127,90,240,0.14)" : "transparent",
                          color:sel ? C.a2 : C.muted, cursor:"pointer", transition:"all 0.12s" }}>
                        {sel ? "✓ " : ""}{tex}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Bilateral comparison ── */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:C.muted,
                  textTransform:"uppercase", letterSpacing:"1px", marginBottom:5 }}>
                  Bilateral Comparison
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  {["Symmetric","R > L","L > R","Unilateral only"].map(opt => {
                    const sel = selPin.bilateral === opt;
                    return (
                      <button key={opt} onClick={() => updatePin(selPin.id, "bilateral", sel ? "" : opt)}
                        style={{ flex:1, padding:"5px 4px", borderRadius:8, fontSize:"0.6rem",
                          fontWeight:sel ? 700 : 400, border:`1px solid ${sel ? C.a3 : C.border}`,
                          background:sel ? "rgba(0,201,122,0.12)" : "transparent",
                          color:sel ? C.a3 : C.muted, cursor:"pointer" }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Clinical Notes ── */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:C.muted,
                  textTransform:"uppercase", letterSpacing:"1px", marginBottom:5 }}>
                  Clinical Notes
                </div>
                <textarea
                  value={selPin.notes}
                  onChange={e => updatePin(selPin.id, "notes", e.target.value)}
                  placeholder={`Describe findings at ${selPin.label}:\ne.g. Moderate tenderness at supraspinatus critical zone, reproduction of patient's shoulder pain with deep palpation. Local twitch response present. Warm to touch R > L.`}
                  rows={3}
                  style={inp}
                />
              </div>

              {/* Mini summary */}
              {(selPin.tenderness || selPin.temp || (selPin.texture||[]).length > 0) && (
                <div style={{ padding:"9px 12px", background:C.s2, borderRadius:9,
                  border:`1px solid ${C.border}`, fontSize:"0.68rem", color:C.muted,
                  lineHeight:1.65 }}>
                  <span style={{ color:C.text, fontWeight:700 }}>Summary: </span>
                  {selPin.label}
                  {selPin.tenderness ? ` — Grade ${selPin.tenderness} tenderness` : ""}
                  {selPin.temp && selPin.temp !== "Normal" ? `, ${selPin.temp.toLowerCase()} to touch` : ""}
                  {(selPin.texture||[]).length > 0 ? `, ${selPin.texture.join(" / ").toLowerCase()}` : ""}
                  {selPin.bilateral ? `, ${selPin.bilateral}` : ""}.
                </div>
              )}

              {/* Navigate pins */}
              {pins.length > 1 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                  {(() => {
                    const idx = pins.findIndex(p => p.id === selPin.id);
                    const prev = pins[idx - 1];
                    const next = pins[idx + 1];
                    return <>
                      <button onClick={() => prev && setSelected(prev.id)}
                        style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${C.border}`,
                          background:"transparent", color:prev ? C.muted : "transparent",
                          fontSize:"0.65rem", cursor:prev ? "pointer" : "default" }}>
                        ← Prev
                      </button>
                      <span style={{ fontSize:"0.6rem", color:C.muted, alignSelf:"center" }}>
                        {idx + 1} / {pins.length}
                      </span>
                      <button onClick={() => next && setSelected(next.id)}
                        style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${C.border}`,
                          background:"transparent", color:next ? C.muted : "transparent",
                          fontSize:"0.65rem", cursor:next ? "pointer" : "default" }}>
                        Next →
                      </button>
                    </>;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Full findings table ── */}
      {pins.length > 0 && (
        <div style={{ marginTop:16, background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`,
            fontSize:"0.72rem", fontWeight:700, color:C.text, display:"flex",
            justifyContent:"space-between", alignItems:"center" }}>
            📋 Palpation Summary — All Points
            <span style={{ color:C.muted, fontWeight:400, fontSize:"0.62rem" }}>
              {pins.filter(p => p.tenderness).length}/{pins.length} graded
            </span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.68rem" }}>
              <thead>
                <tr style={{ background:C.s2 }}>
                  {["Anatomical Point","Side","Grade","Temp","Tissue Quality","Bilateral","Notes"].map(h => (
                    <th key={h} style={{ padding:"7px 10px", textAlign:"left", color:C.muted,
                      fontWeight:700, fontSize:"0.6rem", textTransform:"uppercase",
                      letterSpacing:"0.8px", borderBottom:`1px solid ${C.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pins.map((pin, i) => {
                  const gc = GRADE_COLOR[pin.tenderness] || C.muted;
                  return (
                    <tr key={pin.id} onClick={() => setSelected(pin.id)}
                      style={{ cursor:"pointer", background:selected === pin.id ? C.s2 : "transparent",
                        borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ padding:"7px 10px", color:C.text, fontWeight:600 }}>{pin.label}</td>
                      <td style={{ padding:"7px 10px", color:C.muted }}>
                        {pin.side === "front" ? "Ant." : "Post."}
                      </td>
                      <td style={{ padding:"7px 10px" }}>
                        {pin.tenderness ? (
                          <span style={{ fontWeight:800, color:gc,
                            background:`${gc}18`, padding:"2px 7px", borderRadius:6 }}>
                            {pin.tenderness}
                          </span>
                        ) : <span style={{ color:C.border }}>—</span>}
                      </td>
                      <td style={{ padding:"7px 10px", color:C.muted }}>{pin.temp || "—"}</td>
                      <td style={{ padding:"7px 10px", color:C.muted }}>
                        {(pin.texture||[]).join(", ") || "—"}
                      </td>
                      <td style={{ padding:"7px 10px", color:C.muted }}>{pin.bilateral || "—"}</td>
                      <td style={{ padding:"7px 10px", color:C.muted, maxWidth:140,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {pin.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TREATMENT TECHNIQUES MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function TreatmentTechniquesModule({ data, set }) {
  const PC = getC();
  const genId = () => Math.random().toString(36).slice(2, 9);

  const [techniques, setTechniques] = useState(() => {
    try { const v=data?.tx_techniques; return Array.isArray(v)?v:[]; } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState("manual");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null), 2800); };
  const save = (next) => { setTechniques(next); if(set) set("tx_techniques", next); };

  // ── Lookup tables ──────────────────────────────────────────────────────────
  const MAITLAND_GRADES = [
    { grade:"I",   desc:"Small amplitude, beginning of range — pain control, acute"},
    { grade:"II",  desc:"Large amplitude, within range (no resistance) — pain control"},
    { grade:"III", desc:"Large amplitude into resistance — stiffness/pain"},
    { grade:"IV",  desc:"Small amplitude into resistance — stiffness predominant"},
    { grade:"IV+", desc:"End range, high velocity — HVLAT manipulation"},
  ];
  const BODY_REGIONS = ["Cervical","Thoracic","Lumbar","Sacroiliac","Shoulder","Elbow","Wrist/Hand","Hip","Knee","Ankle/Foot","Rib","TMJ"];
  const MANUAL_TECHNIQUES = ["PA Central","PA Unilateral","AP","Transverse","Rotation","Traction","SNAG","NAG","Mulligan MWM","Quadrant","Combined technique"];
  const DN_MUSCLES = ["Upper trapezius","Levator scapulae","SCM","Infraspinatus","Supraspinatus","Subscapularis","Rhomboids","Erector spinae","Multifidus","QL","Gluteus maximus","Gluteus medius","Piriformis","TFL","Rectus femoris","Hamstrings","Gastrocnemius","Soleus","Tibialis anterior","Pectoralis minor","Pectoralis major","Scalenes","Suboccipitals"];
  const ST_TECHNIQUES = ["Deep tissue massage","Myofascial release","Trigger point release","Friction massage","IASTM","Cupping","Foam roller prescription","PNF stretching","Contract-relax stretching","Passive stretching"];
  const ULTRASOUND_MODES = ["Pulsed 20%","Pulsed 50%","Continuous"];
  const TAPING_TYPES = ["McConnell — Patellar medial glide","McConnell — Patellar tilt correction","McConnell — Patellar rotation","McConnell — Shoulder posture","Kinesio — Pain inhibition","Kinesio — Muscle facilitation","Kinesio — Muscle inhibition","Kinesio — Fascia correction","Kinesio — Lymphatic drainage","Rigid sports tape — ankle","Rigid sports tape — wrist","Rigid sports tape — AC joint","Zinc oxide — blister prevention","Leukotape — posture correction","Dynamic tape — load transfer"];
  const ELECTRO_TYPES = ["TENS — conventional (80–150Hz)","TENS — acupuncture-like (2–4Hz)","TENS — burst","IFT — 80–150Hz (pain)","IFT — 1–10Hz (muscle stim)","NMES — quadriceps","NMES — glutes","Russian stim","LASER — class 3B","LASER — class 4","Shockwave — radial","Shockwave — focused","Biofeedback EMG"];

  const inp = { width:"100%", background:PC.s3, border:`1px solid ${PC.border}`, borderRadius:8, color:PC.text, fontFamily:"inherit", outline:"none", padding:"7px 10px", fontSize:"0.75rem" };
  const sel = { ...inp };
  const ta  = { ...inp, resize:"vertical", minHeight:60 };
  const lbl = { fontSize:"0.6rem", fontWeight:700, color:PC.muted, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.8px" };

  // ── Entry form state ───────────────────────────────────────────────────────
  const blank = { id:null, type:"manual", region:"", technique:"", grade:"", laterality:"", dosage:"", duration:"", response:"", notes:"", dn_muscle:"", dn_needles:"", dn_depth:"", dn_twitch:"", us_freq:"", us_intensity:"", us_mode:"", us_area:"", tape_type:"", tape_goal:"", st_technique:"", st_region:"", electro_type:"", electro_params:"" };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(false);
  const fset = (k,v) => setForm(p=>({...p,[k]:v}));

  const commitTechnique = () => {
    if (!form.type) { showToast("Select a technique type","warn"); return; }
    const entry = { ...form, id: form.id || genId(), savedAt: new Date().toISOString() };
    const next = form.id ? techniques.map(t=>t.id===form.id?entry:t) : [...techniques, entry];
    save(next); setForm(blank); setEditing(false);
    showToast(form.id ? "✅ Technique updated" : "✅ Technique recorded");
  };
  const deleteTechnique = (id) => { save(techniques.filter(t=>t.id!==id)); showToast("Deleted"); };
  const editEntry = (t) => { setForm({...blank,...t}); setEditing(true); setActiveTab(t.type||"manual"); };

  const TABS = [
    { key:"manual",   label:"Joint Mob", icon:"🦴" },
    { key:"dn",       label:"Dry Needling", icon:"🪡" },
    { key:"st",       label:"Soft Tissue", icon:"🤲" },
    { key:"taping",   label:"Taping", icon:"🩹" },
    { key:"us",       label:"Ultrasound", icon:"🔊" },
    { key:"electro",  label:"Electrotherapy", icon:"⚡" },
    { key:"other",    label:"Other", icon:"📋" },
  ];

  const renderForm = () => {
    switch(activeTab) {
      case "manual": return (
        <div style={{display:"grid",gap:8}}>
          <div className="pm-grid-2">
            <div><label style={lbl}>Region / Joint</label><select value={form.region} onChange={e=>fset("region",e.target.value)} style={sel}><option value="">— select —</option>{BODY_REGIONS.map(r=><option key={r}>{r}</option>)}</select></div>
            <div><label style={lbl}>Laterality</label><select value={form.laterality} onChange={e=>fset("laterality",e.target.value)} style={sel}><option value="">—</option>{["Left","Right","Bilateral","Central"].map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div><label style={lbl}>Technique</label><select value={form.technique} onChange={e=>fset("technique",e.target.value)} style={sel}><option value="">— select —</option>{MANUAL_TECHNIQUES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div>
            <label style={lbl}>Maitland Grade</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {MAITLAND_GRADES.map(g=>(
                <button key={g.grade} onClick={()=>fset("grade",g.grade)}
                  style={{padding:"5px 10px",borderRadius:8,fontSize:"0.68rem",fontWeight:form.grade===g.grade?800:500,border:`1px solid ${form.grade===g.grade?"rgba(0,229,255,0.6)":PC.border}`,background:form.grade===g.grade?"rgba(0,229,255,0.12)":"transparent",color:form.grade===g.grade?PC.accent:PC.muted,cursor:"pointer"}}>
                  {g.grade}
                </button>
              ))}
            </div>
            {form.grade && <div style={{marginTop:5,fontSize:"0.62rem",color:PC.muted,padding:"5px 9px",background:PC.s3,borderRadius:7}}>{MAITLAND_GRADES.find(g=>g.grade===form.grade)?.desc}</div>}
          </div>
          <div className="pm-grid-2">
            <div><label style={lbl}>Sets / Reps or Duration</label><input value={form.dosage} onChange={e=>fset("dosage",e.target.value)} placeholder="e.g. 3×30s, 60 oscillations" style={inp}/></div>
            <div><label style={lbl}>Duration in Session</label><input value={form.duration} onChange={e=>fset("duration",e.target.value)} placeholder="e.g. 5 min" style={inp}/></div>
          </div>
        </div>
      );
      case "dn": return (
        <div style={{display:"grid",gap:8}}>
          <div><label style={lbl}>Target Muscle</label><select value={form.dn_muscle} onChange={e=>fset("dn_muscle",e.target.value)} style={sel}><option value="">— select —</option>{DN_MUSCLES.map(m=><option key={m}>{m}</option>)}</select></div>
          <div><label style={lbl}>Laterality</label><select value={form.laterality} onChange={e=>fset("laterality",e.target.value)} style={sel}><option value="">—</option>{["Left","Right","Bilateral"].map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="pm-grid-2">
            <div><label style={lbl}>No. of Needles</label><input type="number" value={form.dn_needles} onChange={e=>fset("dn_needles",e.target.value)} placeholder="e.g. 4" style={inp}/></div>
            <div><label style={lbl}>Needle Depth</label><input value={form.dn_depth} onChange={e=>fset("dn_depth",e.target.value)} placeholder="e.g. 30mm" style={inp}/></div>
          </div>
          <div><label style={lbl}>Local Twitch Response</label><select value={form.dn_twitch} onChange={e=>fset("dn_twitch",e.target.value)} style={sel}><option value="">—</option>{["Yes — elicited","Partial — some fibres","No — unable to elicit","Not applicable"].map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label style={lbl}>Technique Notes</label><textarea value={form.notes} onChange={e=>fset("notes",e.target.value)} placeholder="Pistoning technique, retained 10min, e-stim attached..." style={ta}/></div>
        </div>
      );
      case "st": return (
        <div style={{display:"grid",gap:8}}>
          <div><label style={lbl}>Soft Tissue Technique</label><select value={form.st_technique} onChange={e=>fset("st_technique",e.target.value)} style={sel}><option value="">— select —</option>{ST_TECHNIQUES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={lbl}>Region / Structure</label><input value={form.st_region} onChange={e=>fset("st_region",e.target.value)} placeholder="e.g. upper trap, thoracic paraspinals" style={inp}/></div>
          <div className="pm-grid-2">
            <div><label style={lbl}>Laterality</label><select value={form.laterality} onChange={e=>fset("laterality",e.target.value)} style={sel}><option value="">—</option>{["Left","Right","Bilateral"].map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label style={lbl}>Duration</label><input value={form.duration} onChange={e=>fset("duration",e.target.value)} placeholder="e.g. 5 min" style={inp}/></div>
          </div>
          <div><label style={lbl}>Dosage / Parameters</label><input value={form.dosage} onChange={e=>fset("dosage",e.target.value)} placeholder="e.g. moderate pressure, 30s holds" style={inp}/></div>
        </div>
      );
      case "taping": return (
        <div style={{display:"grid",gap:8}}>
          <div><label style={lbl}>Taping Type / Pattern</label><select value={form.tape_type} onChange={e=>fset("tape_type",e.target.value)} style={sel}><option value="">— select —</option>{TAPING_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={lbl}>Laterality</label><select value={form.laterality} onChange={e=>fset("laterality",e.target.value)} style={sel}><option value="">—</option>{["Left","Right","Bilateral"].map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label style={lbl}>Goal / Rationale</label><input value={form.tape_goal} onChange={e=>fset("tape_goal",e.target.value)} placeholder="e.g. medial patellar glide — PFPS pain reduction" style={inp}/></div>
          <div><label style={lbl}>Technique Notes</label><textarea value={form.notes} onChange={e=>fset("notes",e.target.value)} placeholder="Skin prep, tension %, anchor positions, strips used..." style={ta}/></div>
        </div>
      );
      case "us": return (
        <div style={{display:"grid",gap:8}}>
          <div className="pm-grid-2">
            <div><label style={lbl}>Frequency</label><select value={form.us_freq} onChange={e=>fset("us_freq",e.target.value)} style={sel}><option value="">—</option>{["1 MHz (deep — 3–5cm)","3 MHz (superficial — 1–2cm)"].map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label style={lbl}>Mode</label><select value={form.us_mode} onChange={e=>fset("us_mode",e.target.value)} style={sel}><option value="">—</option>{ULTRASOUND_MODES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="pm-grid-2">
            <div><label style={lbl}>Intensity (W/cm²)</label><input value={form.us_intensity} onChange={e=>fset("us_intensity",e.target.value)} placeholder="e.g. 1.0" style={inp}/></div>
            <div><label style={lbl}>Duration</label><input value={form.duration} onChange={e=>fset("duration",e.target.value)} placeholder="e.g. 5 min" style={inp}/></div>
          </div>
          <div><label style={lbl}>Treatment Area / Structure</label><input value={form.us_area} onChange={e=>fset("us_area",e.target.value)} placeholder="e.g. supraspinatus insertion, plantar fascia" style={inp}/></div>
        </div>
      );
      case "electro": return (
        <div style={{display:"grid",gap:8}}>
          <div><label style={lbl}>Modality</label><select value={form.electro_type} onChange={e=>fset("electro_type",e.target.value)} style={sel}><option value="">— select —</option>{ELECTRO_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="pm-grid-2">
            <div><label style={lbl}>Parameters</label><input value={form.electro_params} onChange={e=>fset("electro_params",e.target.value)} placeholder="e.g. freq, pulse width, intensity" style={inp}/></div>
            <div><label style={lbl}>Duration</label><input value={form.duration} onChange={e=>fset("duration",e.target.value)} placeholder="e.g. 20 min" style={inp}/></div>
          </div>
          <div><label style={lbl}>Electrode Placement / Region</label><input value={form.region} onChange={e=>fset("region",e.target.value)} placeholder="e.g. L4/L5 paraspinals, VMO" style={inp}/></div>
        </div>
      );
      default: return (
        <div style={{display:"grid",gap:8}}>
          <div><label style={lbl}>Technique / Intervention</label><input value={form.technique} onChange={e=>fset("technique",e.target.value)} placeholder="Describe technique" style={inp}/></div>
          <div><label style={lbl}>Region / Structure</label><input value={form.region} onChange={e=>fset("region",e.target.value)} placeholder="Body region or structure" style={inp}/></div>
          <div className="pm-grid-2">
            <div><label style={lbl}>Dosage</label><input value={form.dosage} onChange={e=>fset("dosage",e.target.value)} placeholder="Sets, reps, duration" style={inp}/></div>
            <div><label style={lbl}>Duration</label><input value={form.duration} onChange={e=>fset("duration",e.target.value)} placeholder="Time in session" style={inp}/></div>
          </div>
        </div>
      );
    }
  };

  const techniqueLabel = (t) => {
    if (t.type==="manual") return `${t.technique||"Joint mob"}${t.grade?` — Grade ${t.grade}`:""}${t.region?` (${t.region})`:""}`;
    if (t.type==="dn") return `Dry Needling — ${t.dn_muscle||"unknown muscle"}${t.laterality?` (${t.laterality})`:""}`;
    if (t.type==="st") return `${t.st_technique||"Soft tissue"}${t.st_region?` — ${t.st_region}`:""}`;
    if (t.type==="taping") return `${t.tape_type||"Taping"}${t.laterality?` (${t.laterality})`:""}`;
    if (t.type==="us") return `Ultrasound${t.us_freq?` — ${t.us_freq}`:""}${t.us_area?` / ${t.us_area}`:""}`;
    if (t.type==="electro") return `${t.electro_type||"Electrotherapy"}`;
    return t.technique || "Other";
  };

  const typeIcon = (type) => ({manual:"🦴",dn:"🪡",st:"🤲",taping:"🩹",us:"🔊",electro:"⚡",other:"📋"}[type]||"📋");
  const typeColor = (type) => ({manual:PC.accent,dn:"#7f5af0",st:PC.green,taping:"#ffb300",us:"#00c97a",electro:"#ff4d6d",other:PC.muted}[type]||PC.muted);

  return (
    <div>
      {/* Toast */}
      {toast && <div style={{position:"fixed",top:70,right:16,zIndex:999,padding:"9px 16px",background:toast.type==="success"?"rgba(0,201,122,0.9)":"rgba(255,179,0,0.9)",borderRadius:10,color:"#000",fontWeight:700,fontSize:"0.78rem",boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{toast.msg}</div>}

      {/* ── Technique Entry Form ── */}
      <div style={{background:PC.surface,border:`1px solid ${PC.border}`,borderRadius:14,padding:"14px",marginBottom:14}}>
        <div style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>
          {editing?"✏️ Edit Technique":"➕ Add Treatment Technique"}
        </div>

        {/* Type tabs */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>{setActiveTab(t.key);fset("type",t.key);}}
              style={{padding:"5px 10px",borderRadius:8,fontSize:"0.62rem",fontWeight:activeTab===t.key?800:500,border:`1px solid ${activeTab===t.key?typeColor(t.key)+"60":PC.border}`,background:activeTab===t.key?`${typeColor(t.key)}18`:"transparent",color:activeTab===t.key?typeColor(t.key):PC.muted,cursor:"pointer"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {renderForm()}

        {/* Patient response + notes (always shown) */}
        <div style={{display:"grid",gap:8,marginTop:8}}>
          <div><label style={lbl}>Patient Response During Technique</label><textarea value={form.response} onChange={e=>fset("response",e.target.value)} placeholder="e.g. pain reproduction +, ROM improved, comfortable" style={ta}/></div>
          {activeTab!=="dn"&&activeTab!=="taping"&&<div><label style={lbl}>Additional Notes</label><textarea value={form.notes} onChange={e=>fset("notes",e.target.value)} placeholder="Any extra clinical notes for this technique" style={{...ta,minHeight:44}}/></div>}
        </div>

        <div style={{display:"flex",gap:7,marginTop:10}}>
          <button onClick={commitTechnique}
            style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${PC.accent},${PC.a2})`,border:"none",borderRadius:9,color:"#000",fontWeight:800,fontSize:"0.78rem",cursor:"pointer"}}>
            {editing?"💾 Update":"+ Add Technique"}
          </button>
          {editing&&<button onClick={()=>{setForm(blank);setEditing(false);}}
            style={{padding:"10px 14px",background:"transparent",border:`1px solid ${PC.border}`,borderRadius:9,color:PC.muted,fontSize:"0.75rem",cursor:"pointer"}}>
            Cancel
          </button>}
        </div>
      </div>

      {/* ── Recorded Techniques ── */}
      {techniques.length>0&&(
        <div>
          <div style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            📌 Techniques This Session ({techniques.length})
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {techniques.map(t=>(
              <div key={t.id} style={{background:PC.surface,border:`1px solid ${typeColor(t.type)}30`,borderRadius:11,overflow:"hidden"}}>
                <div style={{padding:"10px 12px",display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:"1.1rem"}}>{typeIcon(t.type)}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.76rem",fontWeight:700,color:PC.text,lineHeight:1.3}}>{techniqueLabel(t)}</div>
                    {t.dosage&&<div style={{fontSize:"0.62rem",color:PC.muted,marginTop:1}}>{t.dosage}{t.duration?` · ${t.duration}`:""}</div>}
                    {t.response&&<div style={{marginTop:4,fontSize:"0.65rem",color:PC.a3,lineHeight:1.4}}>↳ {t.response}</div>}
                  </div>
                  <div style={{display:"flex",gap:5,flexShrink:0}}>
                    <button onClick={()=>editEntry(t)} style={{background:`${typeColor(t.type)}15`,border:`1px solid ${typeColor(t.type)}40`,borderRadius:6,color:typeColor(t.type),cursor:"pointer",fontSize:"0.6rem",padding:"3px 8px",fontWeight:700}}>✏️</button>
                    <button onClick={()=>deleteTechnique(t.id)} style={{background:"none",border:"none",color:"rgba(255,77,109,0.5)",cursor:"pointer",fontSize:"0.7rem",padding:"3px 5px"}}>✕</button>
                  </div>
                </div>
                {t.notes&&<div style={{padding:"6px 12px 8px",borderTop:`1px solid ${PC.border}`,fontSize:"0.62rem",color:PC.muted,fontStyle:"italic"}}>{t.notes}</div>}
              </div>
            ))}
          </div>
          <button onClick={()=>{save([]);showToast("Cleared all techniques");}}
            style={{marginTop:10,width:"100%",padding:"8px",background:"transparent",border:`1px solid rgba(255,77,109,0.3)`,borderRadius:9,color:"rgba(255,77,109,0.7)",fontSize:"0.7rem",cursor:"pointer"}}>
            🗑 Clear All Techniques
          </button>
        </div>
      )}
      {techniques.length===0&&(
        <div style={{textAlign:"center",padding:"24px",color:PC.muted,fontSize:"0.76rem"}}>No techniques recorded yet — add your first above.</div>
      )}

      {/* ── Maitland Grade Reference ── */}
      <div style={{marginTop:14,background:PC.surface,border:`1px solid ${PC.border}`,borderRadius:12,padding:"13px"}}>
        <div style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:9}}>📚 Maitland Grade Reference</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {MAITLAND_GRADES.map(g=>(
            <div key={g.grade} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"6px 10px",background:PC.s3,borderRadius:8}}>
              <span style={{fontWeight:800,fontSize:"0.78rem",color:PC.accent,flexShrink:0,minWidth:28}}>G{g.grade}</span>
              <span style={{fontSize:"0.68rem",color:PC.text,lineHeight:1.5}}>{g.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TREATMENT SESSION LOG MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function TreatmentSessionLogModule({ data, set }) {
  const PC = getC();
  const genId = () => Math.random().toString(36).slice(2, 9);

  const [sessions, setSessions] = useState(() => {
    try { const v=data?.tx_sessions; return Array.isArray(v)?v:[]; } catch { return []; }
  });

  // Auto-derive techniques summary from tx_techniques in shared data
  const autoTechniques = useMemo(() => {
    const txArr = Array.isArray(data?.tx_techniques) ? data.tx_techniques : [];
    if (!txArr.length) return "";
    return txArr.map(t => {
      if (t.type==="manual") return `${t.technique||"Joint mob"}${t.grade?` Grade ${t.grade}`:""}${t.region?` (${t.region})`:""}${t.laterality?` — ${t.laterality}`:""}`;
      if (t.type==="dn") return `Dry needling — ${t.dn_muscle||""}${t.laterality?` (${t.laterality})`:""}${t.dn_needles?`, ${t.dn_needles} needles`:""}`;
      if (t.type==="st") return `${t.st_technique||"Soft tissue"}${t.st_region?` — ${t.st_region}`:""}`;
      if (t.type==="taping") return `${t.tape_type||"Taping"}${t.laterality?` (${t.laterality})`:""}`;
      if (t.type==="us") return `Ultrasound${t.us_freq?` ${t.us_freq}`:""}${t.us_area?` — ${t.us_area}`:""}`;
      if (t.type==="electro") return t.electro_type||"Electrotherapy";
      return t.technique||"Other";
    }).join("; ");
  }, [data?.tx_techniques]);

  // Auto-derive HEP summary from hep_programme in shared data
  const autoHEP = useMemo(() => {
    const hep = Array.isArray(data?.hep_programme) ? data.hep_programme : [];
    if (!hep.length) return "";
    return hep.map(ex => `${ex.name} — ${ex.customSets}×${ex.customReps}, hold ${ex.customHold}s, ${ex.customFreq}`).join("; ");
  }, [data?.hep_programme]);

  const blankForm = () => ({
    id:null,
    date:new Date().toLocaleDateString("en-GB"),
    sessionNo:"",
    type:"",
    vasStart:"",
    vasEnd:"",
    treatmentGiven:"",
    techniques: autoTechniques,
    hep: autoHEP,
    response:"",
    nextPlan:"",
    goals:"",
    clinician:"",
    notes:""
  });
  const [form, setForm] = useState(blankForm);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);

  // Keep techniques/HEP fields in form updated when data changes (unless already editing an old session)
  useEffect(() => {
    if (!editing) {
      setForm(f => ({ ...f, techniques: autoTechniques, hep: autoHEP }));
    }
  }, [autoTechniques, autoHEP, editing]);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };
  const save = (next) => { setSessions(next); if(set) set("tx_sessions", next); };
  const fset = (k,v) => setForm(p=>({...p,[k]:v}));

  const inp = { width:"100%", background:PC.s3, border:`1px solid ${PC.border}`, borderRadius:8, color:PC.text, fontFamily:"inherit", outline:"none", padding:"7px 10px", fontSize:"0.75rem" };
  const ta  = { ...inp, resize:"vertical", minHeight:70 };
  const lbl = { fontSize:"0.6rem", fontWeight:700, color:PC.muted, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.8px" };

  const SESSION_TYPES = ["Initial Assessment","Follow-up Treatment","Review Session","Discharge","Pre-competition","Post-surgical","Telehealth","Group Class"];
  const TX_CATEGORIES = ["Manual therapy","Joint mobilisation","Manipulation","Dry needling","Soft tissue massage","Ultrasound","TENS/IFT","Exercise therapy","Hydrotherapy","Taping/strapping","Education & advice","Postural correction","Neural mobilisation","Other"];

  const vasColor = (v) => { const n=parseInt(v); return isNaN(n)?"#6b8399":n>=7?"#ff4d6d":n>=4?"#ffb300":"#00c97a"; };
  const vasChange = (s, e) => { const ns=parseInt(s), ne=parseInt(e); if(isNaN(ns)||isNaN(ne)) return null; return ne-ns; };

  const commit = () => {
    const entry = { ...form, id: form.id||genId(), savedAt: new Date().toISOString() };
    const next = form.id ? sessions.map(s=>s.id===form.id?entry:s) : [entry,...sessions];
    save(next); setForm(blankForm()); setEditing(false);
    showToast(form.id?"✅ Session updated":"✅ Session logged");
  };

  const deleteSession = (id) => { save(sessions.filter(s=>s.id!==id)); showToast("Session deleted"); };
  const editSession = (s) => { setForm({...blankForm(),...s}); setEditing(true); setExpanded(null); };

  return (
    <div>
      {toast && <div style={{position:"fixed",top:70,right:16,zIndex:999,padding:"9px 16px",background:"rgba(0,201,122,0.9)",borderRadius:10,color:"#000",fontWeight:700,fontSize:"0.78rem",boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{toast.msg}</div>}

      {/* ── Session Entry Form ── */}
      <div style={{background:PC.surface,border:`1px solid ${PC.border}`,borderRadius:14,padding:"14px",marginBottom:14}}>
        <div style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
          {editing?"✏️ Edit Session Log":"📋 Log Treatment Session"}
        </div>

        {/* Auto-pull banner */}
        {!editing&&(autoTechniques||autoHEP)&&(
          <div style={{marginBottom:10,padding:"8px 11px",background:"rgba(0,201,122,0.07)",border:"1px solid rgba(0,201,122,0.25)",borderRadius:9,fontSize:"0.65rem",color:PC.green,lineHeight:1.6}}>
            <span style={{fontWeight:700}}>🔗 Auto-synced from this session:</span>
            {autoTechniques&&<div style={{marginTop:3}}>🦴 <b>Techniques:</b> {autoTechniques}</div>}
            {autoHEP&&<div style={{marginTop:2}}>🏋 <b>HEP:</b> {autoHEP}</div>}
          </div>
        )}

        {/* Row 1: date, session no, type */}
        <div className="pm-grid-3" style={{marginBottom:8}}>
          <div><label style={lbl}>Date</label><input value={form.date} onChange={e=>fset("date",e.target.value)} placeholder="DD/MM/YYYY" style={inp}/></div>
          <div><label style={lbl}>Session #</label><input type="number" value={form.sessionNo} onChange={e=>fset("sessionNo",e.target.value)} placeholder="e.g. 3" style={inp}/></div>
          <div><label style={lbl}>Session Type</label><select value={form.type} onChange={e=>fset("type",e.target.value)} style={inp}><option value="">— type —</option>{SESSION_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        </div>

        {/* VAS */}
        <div className="pm-grid-2" style={{marginBottom:8}}>
          <div>
            <label style={lbl}>Pain at Start (VAS 0–10)</label>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="range" min={0} max={10} value={form.vasStart||0} onChange={e=>fset("vasStart",e.target.value)} style={{flex:1,accentColor:vasColor(form.vasStart)}}/>
              <span style={{fontSize:"1rem",fontWeight:800,color:vasColor(form.vasStart),minWidth:20}}>{form.vasStart||0}</span>
            </div>
          </div>
          <div>
            <label style={lbl}>Pain at End (VAS 0–10)</label>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="range" min={0} max={10} value={form.vasEnd||0} onChange={e=>fset("vasEnd",e.target.value)} style={{flex:1,accentColor:vasColor(form.vasEnd)}}/>
              <span style={{fontSize:"1rem",fontWeight:800,color:vasColor(form.vasEnd),minWidth:20}}>{form.vasEnd||0}</span>
            </div>
          </div>
        </div>
        {(form.vasStart||form.vasEnd)&&(()=>{const ch=vasChange(form.vasStart,form.vasEnd);return ch!==null?<div style={{marginBottom:8,padding:"6px 10px",background:ch<0?"rgba(0,201,122,0.1)":ch>0?"rgba(255,77,109,0.1)":"rgba(255,179,0,0.1)",border:`1px solid ${ch<0?"rgba(0,201,122,0.3)":ch>0?"rgba(255,77,109,0.3)":"rgba(255,179,0,0.3)"}`,borderRadius:8,fontSize:"0.68rem",fontWeight:700,color:ch<0?PC.green:ch>0?PC.red:PC.yellow}}>VAS change: {ch>0?"+":""}{ch} — {ch<0?"✅ Improved":ch>0?"⚠️ Increased":"→ No change"}</div>:null;})()}

        {/* Treatment given */}
        <div style={{marginBottom:8}}>
          <label style={lbl}>Treatment Given Today</label>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
            {TX_CATEGORIES.map(c=>{
              const sel=(form.techniques||"").split(",").map(s=>s.trim()).includes(c);
              return <button key={c} onClick={()=>{const arr=(form.techniques||"").split(",").map(s=>s.trim()).filter(Boolean);const next=sel?arr.filter(x=>x!==c):[...arr,c];fset("techniques",next.join(", "));}}
                style={{padding:"3px 9px",borderRadius:7,fontSize:"0.6rem",fontWeight:sel?700:400,border:`1px solid ${sel?"rgba(0,229,255,0.5)":PC.border}`,background:sel?"rgba(0,229,255,0.12)":"transparent",color:sel?PC.accent:PC.muted,cursor:"pointer"}}>{c}</button>;
            })}
          </div>
          <textarea value={form.treatmentGiven} onChange={e=>fset("treatmentGiven",e.target.value)} placeholder="Describe treatment in detail — techniques, grades, parameters, regions treated..." style={ta}/>
        </div>

        {/* Techniques detail (auto-pulled, editable) */}
        <div style={{marginBottom:8}}>
          <label style={{...lbl,color:PC.accent}}>Techniques Detail <span style={{fontWeight:400,color:PC.muted,textTransform:"none",letterSpacing:0}}>(auto-filled from Tx Techniques tab)</span></label>
          <textarea value={form.techniques} onChange={e=>fset("techniques",e.target.value)} placeholder="Auto-filled from Tx Techniques tab — edit if needed" style={{...ta,minHeight:50,borderColor:autoTechniques?"rgba(0,229,255,0.3)":PC.border}}/>
        </div>

        {/* HEP (auto-pulled, editable) */}
        <div style={{marginBottom:8}}>
          <label style={{...lbl,color:"#7f5af0"}}>Home Exercise Programme <span style={{fontWeight:400,color:PC.muted,textTransform:"none",letterSpacing:0}}>(auto-filled from Exercise tab)</span></label>
          <textarea value={form.hep} onChange={e=>fset("hep",e.target.value)} placeholder="Auto-filled from Exercise Prescription tab — edit if needed" style={{...ta,minHeight:50,borderColor:autoHEP?"rgba(127,90,240,0.3)":PC.border}}/>
        </div>

        {/* Response & plan */}
        <div style={{display:"grid",gap:8,marginBottom:8}}>
          <div><label style={lbl}>Patient Response During Session</label><textarea value={form.response} onChange={e=>fset("response",e.target.value)} placeholder="ROM change, pain behaviour, neurological response, exercise tolerance, functional improvement..." style={ta}/></div>
          <div><label style={lbl}>Plan for Next Session</label><textarea value={form.nextPlan} onChange={e=>fset("nextPlan",e.target.value)} placeholder="Progress to Grade III/IV, add loading, reassess ROM, introduce HEP phase 2..." style={ta}/></div>
          <div><label style={lbl}>Goals / Progress Toward Goals</label><textarea value={form.goals} onChange={e=>fset("goals",e.target.value)} placeholder="Short-term goals, barriers, patient engagement..." style={{...ta,minHeight:50}}/></div>
        </div>

        <div className="pm-grid-2" style={{marginBottom:8}}>
          <div><label style={lbl}>Clinician</label><input value={form.clinician} onChange={e=>fset("clinician",e.target.value)} placeholder="Treating physiotherapist" style={inp}/></div>
          <div><label style={lbl}>Other Notes</label><input value={form.notes} onChange={e=>fset("notes",e.target.value)} placeholder="Consent, co-morbidities, referral..." style={inp}/></div>
        </div>

        <div style={{display:"flex",gap:7}}>
          <button onClick={commit}
            style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${PC.a3},${PC.accent})`,border:"none",borderRadius:10,color:"#000",fontWeight:900,fontSize:"0.82rem",cursor:"pointer"}}>
            {editing?"💾 Update Session":"✅ Save Session Log"}
          </button>
          {editing&&<button onClick={()=>{setForm(blankForm());setEditing(false);}}
            style={{padding:"11px 14px",background:"transparent",border:`1px solid ${PC.border}`,borderRadius:10,color:PC.muted,fontSize:"0.75rem",cursor:"pointer"}}>Cancel</button>}
        </div>
      </div>

      {/* ── Session History ── */}
      {sessions.length>0&&(
        <div>
          <div style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:9}}>
            🗂 Session History ({sessions.length})
          </div>
          {sessions.map((s,idx)=>{
            const ch=vasChange(s.vasStart,s.vasEnd);
            const isOpen=expanded===s.id;
            return (
              <div key={s.id} style={{background:PC.surface,border:`1px solid ${PC.border}`,borderRadius:12,marginBottom:7,overflow:"hidden"}}>
                {/* Card header */}
                <div onClick={()=>setExpanded(isOpen?null:s.id)} style={{padding:"11px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:32,height:32,borderRadius:9,background:`rgba(0,229,255,0.1)`,border:`1px solid rgba(0,229,255,0.25)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:"0.72rem",fontWeight:900,color:PC.accent}}>#{s.sessionNo||idx+1}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.76rem",fontWeight:700,color:PC.text}}>{s.date} — {s.type||"Treatment"}</div>
                    <div style={{fontSize:"0.62rem",color:PC.muted,marginTop:1}}>{s.clinician||""}{s.techniques?` · ${s.techniques.split(",").slice(0,2).join(", ")}${s.techniques.split(",").length>2?" +more":""}`:""}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                    {ch!==null&&<span style={{fontSize:"0.65rem",fontWeight:700,padding:"2px 7px",borderRadius:7,background:ch<0?"rgba(0,201,122,0.12)":ch>0?"rgba(255,77,109,0.12)":"rgba(255,179,0,0.1)",color:ch<0?PC.green:ch>0?PC.red:PC.yellow}}>{ch>0?"+":""}{ch} VAS</span>}
                    <span style={{color:PC.muted,fontSize:"0.65rem"}}>{isOpen?"▲":"▼"}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen&&(
                  <div style={{padding:"0 13px 13px",borderTop:`1px solid ${PC.border}`}}>
                    {s.treatmentGiven&&<div style={{marginTop:10}}><div style={{fontSize:"0.58rem",fontWeight:700,color:PC.accent,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>Treatment Given</div><div style={{fontSize:"0.73rem",color:PC.text,lineHeight:1.6,background:PC.s3,borderRadius:8,padding:"8px 11px"}}>{s.treatmentGiven}</div></div>}
                    {s.response&&<div style={{marginTop:8}}><div style={{fontSize:"0.58rem",fontWeight:700,color:PC.green,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>Patient Response</div><div style={{fontSize:"0.73rem",color:PC.text,lineHeight:1.6,background:"rgba(0,201,122,0.06)",border:"1px solid rgba(0,201,122,0.2)",borderRadius:8,padding:"8px 11px"}}>{s.response}</div></div>}
                    {s.nextPlan&&<div style={{marginTop:8}}><div style={{fontSize:"0.58rem",fontWeight:700,color:PC.a2,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>Next Session Plan</div><div style={{fontSize:"0.73rem",color:PC.text,lineHeight:1.6,background:"rgba(127,90,240,0.06)",border:"1px solid rgba(127,90,240,0.2)",borderRadius:8,padding:"8px 11px"}}>{s.nextPlan}</div></div>}
                    {s.goals&&<div style={{marginTop:8}}><div style={{fontSize:"0.58rem",fontWeight:700,color:PC.yellow,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>Goals</div><div style={{fontSize:"0.73rem",color:PC.text,lineHeight:1.6}}>{s.goals}</div></div>}
                    {s.notes&&<div style={{marginTop:6,fontSize:"0.65rem",color:PC.muted,fontStyle:"italic"}}>{s.notes}</div>}
                    <div style={{display:"flex",gap:6,marginTop:10}}>
                      <button onClick={()=>editSession(s)} style={{padding:"6px 12px",background:`${PC.accent}15`,border:`1px solid ${PC.accent}40`,borderRadius:7,color:PC.accent,fontSize:"0.65rem",fontWeight:700,cursor:"pointer"}}>✏️ Edit</button>
                      <button onClick={()=>deleteSession(s.id)} style={{padding:"6px 10px",background:"rgba(255,77,109,0.08)",border:"1px solid rgba(255,77,109,0.25)",borderRadius:7,color:"#ff4d6d",fontSize:"0.65rem",cursor:"pointer"}}>🗑 Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {sessions.length===0&&(
        <div style={{textAlign:"center",padding:"24px",color:PC.muted,fontSize:"0.76rem"}}>No sessions logged yet — complete the form above to record your first treatment session.</div>
      )}
    </div>
  );
}

const ALL_TESTS = {
  home:{ label:"Home", icon:"🏠", desc:"App Overview & Features", groups:{ "Welcome":"HOME_MODULE" }},
  dashboard:{ label:"Dashboard", icon:"📊", desc:"Therapist Overview", groups:{ "Therapist Dashboard":"DASHBOARD_MODULE" }},
  subjective:{ label:"Subjective", icon:"📝", desc:"History & Complaint", groups:{ "Full Subjective Assessment":"SUBJECTIVE_MODULE" }},
  palpation:{ label:"Palpation", icon:"🖐️", desc:"Tissue Assessment", groups:{ "Palpation Findings":"PALPATION_MODULE" }},
  posture:{ label:"Posture", icon:"🧍", desc:"Postural Analysis", groups:{
    "Posture Defect Assessment":"POSTURE_DEFECT_MODULE",
  }},
  rom:{ label:"ROM", icon:"📐", desc:"Range of Motion", groups:{ "Full ROM Assessment":"ROM_MODULE" }},
  mmt:{ label:"Muscle MMT", icon:"💪", groups:{ "Full MMT Assessment":"MMT_MODULE" }},
  special:{ label:"Special Tests (100+)", icon:"🔬", groups:{ "All Special Tests":"SPECIAL_TESTS_MODULE" }},
  neuro:{ label:"Neurological", icon:"⚡", groups:{ "Full Neurological Assessment":"NEURO_MODULE" }},
  gait:{ label:"Gait Analysis", icon:"🚶", groups:{ "Full Gait Analysis":"GAIT_MODULE" }},
  nkt:{ label:"NKT Assessment", icon:"🧠", groups:{ "Region-Specific NKT Tests":"NKT_REGION" }},
  kinetic:{ label:"Kinetic Chain", icon:"⛓️", groups:{ "Joint-by-Joint Assessment":"KC_REGION" }},
  fascia:{ label:"Fascia Integration", icon:"🕸️", groups:{ "Fascial Assessment":"FASCIA_REGION" }},
  fma:{ label:"Functional Movement", icon:"🏃", groups:{ "Movement Analysis":"FMA_REGION" }},
  cyriax_full:{ label:"Cyriax Full Assessment", icon:"🦴", groups:{ "Complete STTT Assessment":"CYRIAX_MODULE" }},
  outcome:{ label:"Outcome Measures", icon:"📈", groups:{ "Validated Outcome Measures":"OUTCOME_MODULE" }},
  exercise:{ label:"Treatment Prescription", icon:"💊", desc:"Exercise & Treatment Plan", groups:{ "Exercise Prescription":"EXERCISE_MODULE" }},
  tx_techniques:{ label:"Tx Techniques", icon:"🤲", groups:{ "Treatment Techniques":"TX_TECHNIQUES_MODULE" }},
  tx_sessions:{ label:"Session Log", icon:"📋", groups:{ "Treatment Session Log":"TX_SESSION_MODULE" }},
  soap:{ label:"SOAP + AI", icon:"🤖", desc:"AI-Powered SOAP Notes", groups:{ "SOAP Note Generator":"SOAP_MODULE" }},
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROM MODULE — Advanced Range of Motion Assessment
// ═══════════════════════════════════════════════════════════════════════════════

const ROM_DATA={
  "Cervical":[
    {id:"rom_cflex",mv:"Flexion",bilateral:false,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal (coronal)",
     start:"Seated, head neutral, stabilise thorax",gonio:"Axis: C7 SP; Fixed: vertical ref; Moving: along mastoid/ear",
     muscles:"Sternocleidomastoid, longus colli/capitis, anterior scalenes",
     endfeel:{normal:"Firm (ligamentous — posterior structures)",abnormal:"Hard=OA/disc; Empty=fracture/neoplasm; Springy=meniscoid"},
     compensation:"Thoracic flexion, chin poke (forward head)",
     capsular:"Lateral flex=Rot>Flex=Ext (cervical facet capsular pattern)",
     adl:"Looking down at phone, eating, reading",
     pathology:"Limited painfully: disc herniation (C4/5 or C5/6), facet OA; painless: muscle tightness",
     redflag:"Bilateral arm paresthesia on flex = cord compression; trauma + limited = C-spine fracture protocol",
     pediatric:"Neonatal: limited = torticollis, Klippel-Feil. Children: normal=80°",
     geriatric:"Degenerative changes reduce all planes by 25–30% by age 70"},
    {id:"rom_cext",mv:"Extension",bilateral:false,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Seated, head neutral",gonio:"Axis: C7 SP; Fixed: vertical ref; Moving: along mastoid",
     muscles:"Semispinalis capitis, splenius capitis, upper trapezius, suboccipitals",
     endfeel:{normal:"Firm (anterior ligaments)",abnormal:"Hard=OA/stenosis; Empty=instability; Springy=disc"},
     compensation:"Thoracic extension, mouth opening",
     capsular:"Extension often more limited than flexion in degenerative disease",
     adl:"Looking up at ceiling, overhead activities, reversing car",
     pathology:"Limited: cervical stenosis, OA, disc osteophyte. Pain on ext: facet compression",
     redflag:"Bilateral LE symptoms on extension = spinal stenosis. Dizziness = VBI — stop, perform VBI screen"},
    {id:"rom_clatl",mv:"Lat Flex L",bilateral:false,normal:45,unit:"°",plane:"Frontal",axis:"AP (anterior-posterior)",
     start:"Seated, stabilise ipsilateral shoulder to prevent elevation",gonio:"Axis: C7 SP; Fixed: vertical; Moving: along midline skull",
     muscles:"Ipsilateral: scalenes, SCM, upper trap, splenius; Contralateral: stretched",
     endfeel:{normal:"Firm (contralateral capsule + muscles)",abnormal:"Hard=OA/Unco; Springy=disc"},
     compensation:"Shoulder elevation (shrug), trunk lateral lean",
     capsular:"Asymmetric restriction: facet OA pattern",
     adl:"Ear to shoulder stretch, lateral reach activities",
     pathology:"Unilateral limitation: unilateral facet OA, disc herniation, scalene tightness",
     redflag:"Arm pain reproduced = radiculopathy (C4–C8). Lhermitte's sign on any cervical movement = cord lesion"},
    {id:"rom_clatr",mv:"Lat Flex R",bilateral:false,normal:45,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, stabilise contralateral shoulder",gonio:"Axis: C7 SP; Fixed: vertical; Moving: along skull midline",
     muscles:"Ipsilateral scalenes, SCM, upper trap, splenius capitis/cervicis",
     endfeel:{normal:"Firm",abnormal:"Hard=OA; Empty=trauma"},
     compensation:"Shoulder elevation, trunk lean opposite direction",
     capsular:"Compare L vs R: asymmetry >10° clinically significant",
     adl:"Phone held to ear, lateral reaching",
     pathology:"Same as Lat Flex L — compare sides for asymmetry",
     redflag:"Pain down ipsilateral arm = Spurling's positive cluster"},
    {id:"rom_crotl",mv:"Rotation L",bilateral:false,normal:60,unit:"°",plane:"Transverse",axis:"Vertical (longitudinal)",
     start:"Seated, head neutral, stabilise thorax",gonio:"Axis: crown of head; Fixed: acromial line; Moving: nose direction",
     muscles:"Contralateral SCM, ipsilateral splenius, suboccipitals",
     endfeel:{normal:"Firm (capsule + alar ligament)",abnormal:"Hard=OA/fixation; Springy=disc protrusion"},
     compensation:"Trunk rotation, chin elevation",
     capsular:"Rotation most limited in atlantoaxial OA (C1/C2)",
     adl:"Checking blind spot driving, looking sideways",
     pathology:"C1/2 OA: rotation limited bilaterally. Disc: often asymmetric + painful arc",
     redflag:"<30° rotation = atlantoaxial instability or end-stage OA. VBI symptoms: dizziness, nystagmus, diplopia"},
    {id:"rom_crotr",mv:"Rotation R",bilateral:false,normal:60,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same method",
     muscles:"Same contralateral pattern as rotation L",
     endfeel:{normal:"Firm",abnormal:"Same as rotation L"},
     compensation:"Trunk rotation, chin elevation",
     capsular:"RA: atlantoaxial instability — bilateral rotation severely limited",
     adl:"Same as rotation L",
     pathology:"Unilateral loss: facet OA, unilateral disc; Bilateral equal loss: C1/2",
     redflag:"RA patient: odontoid fracture risk — <30° rotation → X-ray"},
  ],
  "Thoracic":[
    {id:"rom_thflex",mv:"Flexion",bilateral:false,normal:50,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Seated or standing, arms crossed",gonio:"Axis: T12; Fixed: vertical; Moving: spinous process line",
     muscles:"Rectus abdominis, external obliques",
     endfeel:{normal:"Firm (posterior ligaments + facets)",abnormal:"Hard=OA/AS; Springy=disc (rare thoracic)"},
     compensation:"Lumbar flexion (monitor separately), hip flex",
     capsular:"Thoracic: Ext>Lat Flex>Rot in spondylosis; symmetric in AS",
     adl:"Bending forward (combined with lumbar), stooping",
     pathology:"AS: reduced chest expansion + all planes; Osteoporotic wedge: flexion + kyphosis",
     redflag:"Severe flexion pain with percussion tenderness = vertebral fracture. Thoracic mass: bilateral UMN signs"},
    {id:"rom_thext",mv:"Extension",bilateral:false,normal:25,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing or prone, lumbar stabilised",gonio:"Axis: T12; Fixed: vertical; Moving: spinous process",
     muscles:"Erector spinae, multifidus, semispinalis",
     endfeel:{normal:"Firm (anterior longitudinal ligament + disc)",abnormal:"Hard=OA/AS; Empty=malignancy"},
     compensation:"Lumbar hyperextension",
     capsular:"Extension earliest limited in thoracic OA",
     adl:"Upright posture, overhead reach, back bend",
     pathology:"Thoracic kyphosis: extension severely limited; Scheuermann's: fixed kyphosis",
     redflag:"Night pain + weight loss + extension pain = malignancy/infection"},
    {id:"rom_throtl",mv:"Rotation L",bilateral:false,normal:35,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Seated, arms crossed, pelvis fixed",gonio:"Axis: T1; Fixed: pelvis line; Moving: shoulder line",
     muscles:"Ipsilateral internal oblique + contralateral external oblique",
     endfeel:{normal:"Firm",abnormal:"Hard=AS/costovertebral joint restriction"},
     compensation:"Lumbar rotation, trunk lateral lean",
     capsular:"AS: marked bilateral symmetric restriction",
     adl:"Golf swing, tennis serve, trunk twisting in daily life",
     pathology:"Costovertebral joint restriction: local thoracic pain + limited ipsilateral rotation",
     redflag:"Rib pain with rotation = costovertebral joint pathology, stress fracture in athletes"},
    {id:"rom_throtr",mv:"Rotation R",bilateral:false,normal:35,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same",muscles:"Same contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Hard=costovertebral restriction"},
     compensation:"Lumbar rotation",capsular:"Compare L vs R",
     adl:"Same as rotation L",
     pathology:"Asymmetric restriction: scoliosis, unilateral facet OA",
     redflag:"Rib fracture: localized pain + limited rotation + crepitus"},
  ],
  "Lumbar":[
    {id:"rom_lflex",mv:"Flexion",bilateral:false,normal:60,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing, knees extended; also assess fingertip-to-floor distance (N=<7cm)",gonio:"Axis: S2; Fixed: vertical; Moving: T12 spinous process line; ALTERNATIVE: Schober's test (distraction from S2+10cm line: N≥5cm increase)",
     muscles:"Psoas, rectus abdominis, obliques (assist); Erector spinae eccentric control",
     endfeel:{normal:"Firm (posterior ligaments, disc tension)",abnormal:"Springy=disc herniation; Hard=OA/end-stage; Empty=fracture/malignancy"},
     compensation:"Hip flexion substituting for lumbar flex, thoracic flexion, knee bend",
     capsular:"Lumbar capsular: Ext>Lat Flex>Rot (facet joints)",
     adl:"Picking up objects, dressing, tying shoes, toileting",
     pathology:"Limited painfully: disc herniation, acute facet lock, spondylolisthesis; Painful return from flexion = disc",
     redflag:"Bowel/bladder symptoms + LBP = cauda equina — URGENT. Painful arc in flexion/return = disc pathology"},
    {id:"rom_lext",mv:"Extension",bilateral:false,normal:25,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing, hands on posterior iliac crests for stabilisation",gonio:"Axis: greater trochanter; Fixed: vertical; Moving: mid-axillary line",
     muscles:"Erector spinae, multifidus, quadratus lumborum",
     endfeel:{normal:"Firm (anterior disc/ALL + facet joint approximation)",abnormal:"Hard=OA severe; Springy=facet impingement; Empty=instability"},
     compensation:"Hip extension (gluteal contraction), knee flexion",
     capsular:"Facet OA: extension most limited + painful",
     adl:"Standing from seated, walking, reaching overhead, bending backward",
     pathology:"Limited painfully: facet OA, spondylolysis/listhesis, spinal stenosis; Pain in extension = neurogenic claudication",
     redflag:"Bilateral leg pain on extension relieved by sitting = spinal stenosis. Instability = spondylolisthesis (step sign)"},
    {id:"rom_llfl",mv:"Lat Flex L",bilateral:false,normal:25,unit:"°",plane:"Frontal",axis:"AP",
     start:"Standing, knees extended, arms at sides — measure fingertip distance traveled down leg",gonio:"Axis: S2; Fixed: vertical; Moving: T12 SP",
     muscles:"Ipsilateral: QL, erector spinae, obliques; Contralateral: stretched",
     endfeel:{normal:"Firm (contralateral ligaments + muscles)",abnormal:"Hard=OA/scoliosis; Springy=disc"},
     compensation:"Trunk rotation, lateral hip shift, knee flexion",
     capsular:"Asymmetric restriction: unilateral facet OA or disc herniation",
     adl:"Side bending for reaching, lateral reaching in ADLs",
     pathology:"Painful limited: disc herniation (list toward or away from disc depending on HNP position relative to nerve root)",
     redflag:"Lateral list: disc herniation or muscle spasm. Scoliosis: structural vs functional"},
    {id:"rom_llfr",mv:"Lat Flex R",bilateral:false,normal:25,unit:"°",plane:"Frontal",axis:"AP",
     start:"Same as Lat Flex L",gonio:"Same",muscles:"Same contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Springy=disc"},
     compensation:"Trunk rotation, hip shift",capsular:"Compare L vs R",
     adl:"Same",pathology:"Compare with L — asymmetry >10° significant",
     redflag:"Painful list = disc pathology — assess dermatomes"},
    {id:"rom_lrotl",mv:"Rotation L",bilateral:false,normal:5,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Seated, arms crossed, pelvis fixed to chair",gonio:"Axis: midline between PSIS; Fixed: pelvis; Moving: shoulder girdle line",
     muscles:"Ipsilateral internal oblique + multifidus; Contralateral external oblique",
     endfeel:{normal:"Firm (disc + capsule)",abnormal:"Hard=OA; Springy=disc"},
     compensation:"Pelvic rotation, trunk lateral lean",
     capsular:"NOTE: lumbar rotation is very limited (5°) — restriction most significant in acute disc",
     adl:"Rolling in bed, getting in/out of car, twisting",
     pathology:"Painful rotation: disc herniation (early sign), spondylodiscitis; Symmetric loss: AS",
     redflag:"Severe bilateral rotation loss + SI joint involvement = AS — check BASMI"},
    {id:"rom_lrotr",mv:"Rotation R",bilateral:false,normal:5,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same",muscles:"Same",
     endfeel:{normal:"Firm",abnormal:"Springy=disc"},
     compensation:"Pelvic rotation",capsular:"Compare L vs R",
     adl:"Same",pathology:"Same as rotation L",redflag:"Same"},
  ],
  "TMJ":[
    {id:"rom_topen",mv:"Mouth Opening",bilateral:false,normal:45,unit:"mm",plane:"Sagittal",axis:"Frontal",
     start:"Seated, teeth in crest-to-crest occlusion; measure interincisal distance",gonio:"Ruler: between upper and lower central incisors",
     muscles:"Bilateral lateral pterygoid, digastric, mylohyoid (opening); masseter, temporalis, medial pterygoid (close)",
     endfeel:{normal:"Firm (muscle/capsule at end range)",abnormal:"Springy=anterior disc displacement with reduction (click); Hard=bony block/closed lock; Empty=acute inflammation"},
     compensation:"Forward head posture to gain opening, jaw deviation (note deviation direction)",
     capsular:"TMJ capsular: limitation in opening=protrusion=contralateral deviation (ipsilateral condyle restriction)",
     adl:"Eating, yawning, talking, dental treatment",
     pathology:"<30mm = significant trismus; Clicking with opening: disc displacement with reduction; No click + limited: disc displacement without reduction (closed lock)",
     redflag:"Sudden inability to open after locking = closed lock — urgent referral. Trismus + fever = infection"},
    {id:"rom_tlatl",mv:"Lat Deviation L",bilateral:false,normal:10,unit:"mm",plane:"Frontal",axis:"Vertical",
     start:"Seated, mouth slightly open, measure deviation of lower midline from upper",gonio:"Ruler from upper to lower central incisor midlines",
     muscles:"Ipsilateral medial pterygoid + contralateral lateral pterygoid",
     endfeel:{normal:"Firm",abnormal:"Hard=bony block; Limited=ipsilateral disc; Painful=synovitis"},
     compensation:"Head tilt to compensate",capsular:"Reduced ipsilateral deviation = ipsilateral disc/capsule restriction",
     adl:"Chewing (lateral grinding movement)",
     pathology:"Deviation toward affected side on opening = ipsilateral disc or muscle pathology",
     redflag:"Unilateral deviation + pain + swelling = septic arthritis or condylar fracture"},
    {id:"rom_tlatr",mv:"Lat Deviation R",bilateral:false,normal:10,unit:"mm",plane:"Frontal",axis:"Vertical",
     start:"Same",gonio:"Same",muscles:"Contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Hard/Springy"},
     compensation:"Head tilt",capsular:"Compare L vs R",adl:"Chewing",pathology:"Same as L",redflag:"Same"},
    {id:"rom_tpro",mv:"Protrusion",bilateral:false,normal:8,unit:"mm",plane:"Sagittal",axis:"Frontal",
     start:"Seated, teeth together; measure forward movement of lower incisor beyond upper",gonio:"Ruler measurement",
     muscles:"Bilateral lateral pterygoid",
     endfeel:{normal:"Firm (temporomandibular ligament)",abnormal:"Hard=bony/OA; Reduced=capsular restriction"},
     compensation:"Forward head posture",capsular:"Reduced protrusion: bilateral capsular pattern",
     adl:"Chewing tough foods, mandibular positioning",
     pathology:"Reduced protrusion: bilateral disc displacement, OA, fibrosis post-infection",
     redflag:"Malocclusion post-trauma = condylar fracture"},
  ],
  "Shoulder":[
    {id:"rom_sflex",mv:"Flexion",bilateral:true,normal:180,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or seated; scapula stabilised after 60°",gonio:"Axis: lateral shoulder (GH joint); Fixed: mid-axillary line; Moving: lateral humerus to lateral epicondyle",
     muscles:"Anterior deltoid, coracobrachialis (0–90°); upper trap + serratus anterior (scapular upward rotation 60–180°)",
     endfeel:{normal:"Firm (posterior capsule + infraspinatus/teres minor)",abnormal:"Hard=OA/calcification; Springy=subacromial impingement; Empty=septic/acute RC tear"},
     compensation:"Trunk extension (lean back), elbow flex, shoulder hike (upper trap), scapular winging",
     capsular:"GH capsular pattern: ER>Abd>IR (Cyriax); impingement pattern: painful arc 60–120°",
     adl:"Reaching overhead (shelf, hair wash), throwing, swimming",
     pathology:"Arc 60–120°: impingement or partial RC. Arc 120–180° on ascent: AC joint. Full loss: frozen shoulder",
     redflag:"Sudden painless loss after trauma = complete RC tear. Fever + hot joint = septic arthritis"},
    {id:"rom_sext",mv:"Extension",bilateral:true,normal:60,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Prone or standing; stabilise scapula to prevent anterior tipping",gonio:"Axis: lateral GH; Fixed: mid-axillary line; Moving: lateral humerus",
     muscles:"Posterior deltoid, teres major, latissimus dorsi, long head triceps",
     endfeel:{normal:"Firm (anterior capsule + coracohumeral ligament)",abnormal:"Hard=OA; Springy=biceps long head"},
     compensation:"Trunk flexion, scapular anterior tipping, shoulder IR",
     capsular:"Extension less affected in GH capsular pattern than ER/Abd",
     adl:"Reaching behind back (hand to back pocket, bra hook), pushing off from chair",
     pathology:"Limited: anterior capsule tightness, biceps tendon pathology, pec major tightness",
     redflag:"Pain at extreme extension = anterior instability, SLAP lesion"},
    {id:"rom_sabd",mv:"Abduction",bilateral:true,normal:180,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, elbow extended, thumb up (scapular plane preferred = 30° forward)",gonio:"Axis: posterior GH joint; Fixed: parallel to spine; Moving: posterior humerus",
     muscles:"Supraspinatus (0–15°), deltoid (15–90°), serratus + trap (60–180° scapular rotation)",
     endfeel:{normal:"Firm (inferior GH capsule + adductors)",abnormal:"Hard=OA/calcification; Springy=subacromial impingement; Empty=fracture/acute tear"},
     compensation:"Trunk lateral lean (Trendelenburg shoulder), shoulder hike, scapular winging, elbow flex",
     capsular:"Primary GH restriction: ER>Abd>IR. Assess scapulohumeral rhythm (N = 2:1 GH:scap ratio)",
     adl:"Reaching out to side, dressing (arm into sleeve), carrying objects at side",
     pathology:"Arc 60–120°: impingement or partial RC; Full loss: frozen shoulder, GH OA, complete RC tear",
     redflag:"Acute painful arc + weakness + trauma = complete RC tear. Document scapulohumeral rhythm deviation"},
    {id:"rom_sadd",mv:"Adduction",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, assess cross-body adduction (horizontal adduction)",gonio:"Axis: anterior GH; Fixed: acromion to acromion line; Moving: humerus",
     muscles:"Pec major, latissimus dorsi, teres major, anterior deltoid",
     endfeel:{normal:"Soft (arm contact with trunk) or firm",abnormal:"Pain at extreme: AC joint pathology (horizontal add)"},
     compensation:"Trunk lean",capsular:"AC joint positive: horizontal adduction most painful",
     adl:"Hugging, crossing arms, ADL cross-body reach",
     pathology:"Horizontal adduction pain: AC joint OA, ACJ injury, subacromial pathology",
     redflag:"Cross-body pain after fall = ACJ sprain — assess step deformity"},
    {id:"rom_ser",mv:"ER",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, shoulder 0° abduction, elbow 90°; ALSO test at 90° abduction",gonio:"Axis: olecranon; Fixed: vertical/perpendicular to table; Moving: ulna/forearm",
     muscles:"Infraspinatus, teres minor, posterior deltoid",
     endfeel:{normal:"Firm (anterior capsule + subscapularis)",abnormal:"Hard=OA; Springy=impingement; Empty=acute"},
     compensation:"Shoulder elevation, trunk rotation, scapular protraction",
     capsular:"ER most limited in GH capsular pattern (frozen shoulder) — key diagnostic finding",
     adl:"Combing hair, overhead reach, throwing wind-up",
     pathology:"ER loss primary sign of GH capsular restriction. ER loss at 90° = posterior capsule tightness → impingement",
     redflag:"ER lag sign (passive > active by >5°) = infraspinatus tear. Profound ER weakness = axillary nerve injury"},
    {id:"rom_sir",mv:"IR",bilateral:true,normal:70,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, shoulder 0° abduction, elbow 90°; assess thumb-to-back (functional IR) = N: T8–T10 level",gonio:"Axis: olecranon; Fixed: vertical; Moving: ulna",
     muscles:"Subscapularis, anterior deltoid, teres major, pec major, latissimus",
     endfeel:{normal:"Firm (posterior capsule + muscles)",abnormal:"Hard=OA; Springy=posterior capsule restriction"},
     compensation:"Shoulder protraction, trunk rotation, scapular anterior tipping",
     capsular:"Posterior capsule tightness: IR limited → GIRD (glenohumeral internal rotation deficit) in throwers",
     adl:"Reaching behind back, bra hook, tucking shirt, toileting",
     pathology:"GIRD: IR loss >15° vs opposite in overhead athletes → impingement risk. Posterior labral tear",
     redflag:"Internal rotation lag sign = subscapularis tear. Belly press weakness = subscapularis rupture"},
    {id:"rom_shabd",mv:"Horiz Abduction",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine or seated, shoulder 90° abduction → assess horizontal abd",gonio:"Axis: AC joint; Fixed: acromion line; Moving: humerus",
     muscles:"Posterior deltoid, infraspinatus, teres minor",
     endfeel:{normal:"Firm (anterior capsule + pec major)",abnormal:"Springy=posterior capsule impingement"},
     compensation:"Trunk rotation",capsular:"Horizontal ABD stretches posterior capsule: reproduce posterior shoulder pain",
     adl:"Throwing follow-through, backstroke",
     pathology:"Limited horizontal ABD + posterior pain: posterior capsule tightness or posterior labral tear",
     redflag:"Instability testing: apprehension with horizontal ABD + ER = anterior instability"},
    {id:"rom_shadd",mv:"Horiz Adduction",bilateral:true,normal:135,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Shoulder 90° flex → add horizontally across body",gonio:"Axis: posterior GH; Fixed: shoulder line; Moving: humerus",
     muscles:"Pec major (sternal), anterior deltoid, coracobrachialis",
     endfeel:{normal:"Soft (contact) or firm",abnormal:"Pain at end: AC joint pathology"},
     compensation:"Trunk rotation",capsular:"AC joint: positive horizontal ADD — Scarf/cross-body test",
     adl:"Reaching across body, hugging",
     pathology:"Horizontal ADD pain at AC joint = AC pathology (Scarf test); posterior = subacromial",
     redflag:"AC joint injury grading: I (sprain), II (ACJ step), III (complete)"},
  ],
  "Elbow":[
    {id:"rom_eflex",mv:"Flexion",bilateral:true,normal:145,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Anatomical position, forearm supinated",gonio:"Axis: lateral epicondyle; Fixed: lateral humerus mid-axillary; Moving: lateral forearm to radial styloid",
     muscles:"Biceps brachii, brachialis, brachioradialis",
     endfeel:{normal:"Soft (muscle bulk contact) or hard (bone-to-bone in lean patients)",abnormal:"Hard (osteophyte/loose body); Springy (anterior capsule issue)"},
     compensation:"Shoulder flex/abd to assist",capsular:"Elbow capsular: Flex>Ext (lateral pivot shift pattern)",
     adl:"Feeding, grooming, phone use, pulling objects",
     pathology:"Limited flex: posterior osteophyte, loose body, OA; pain at end range: posterior impingement",
     redflag:"Effusion: check fat pad sign (X-ray). Valgus stress pain with flexion = UCL injury"},
    {id:"rom_eext",mv:"Extension",bilateral:true,normal:0,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Anatomical position",gonio:"Same as flexion",
     muscles:"Triceps brachii, anconeus",
     endfeel:{normal:"Hard (bone-to-bone: olecranon in fossa)",abnormal:"Firm (capsular — common in OA); Springy (loose body)"},
     compensation:"Shoulder elevation, wrist flex",capsular:"Extension loss primary sign elbow OA/capsular",
     adl:"Pushing, pressing, reaching far, overhead work",
     pathology:"Extension loss: OA, posterior impingement, loose body, flexion contracture post-fracture; Hyperextension: laxity/UCL injury",
     redflag:"Extension loss after trauma = fracture (radial head, coronoid). Hyperextension = posterior dislocation risk"},
    {id:"rom_esup",mv:"Supination",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Longitudinal",
     start:"Elbow 90° flexion, arm at side (eliminates shoulder rotation compensation)",gonio:"Axis: third finger; Fixed: parallel to humerus; Moving: dorsal forearm/pencil held in hand",
     muscles:"Biceps brachii (primary), supinator",
     endfeel:{normal:"Firm (interosseous membrane, pronator teres, oblique cord)",abnormal:"Hard=radial head OA/DRUJ arthritis; Springy=ligamentous"},
     compensation:"Shoulder ER, trunk rotation",capsular:"DRUJ capsular: supination>pronation",
     adl:"Receiving change, carrying soup bowl, turning door handle (external knob), hammering upward blow",
     pathology:"Limited supination: radial head fracture/OA, DRUJ arthritis, interosseous membrane injury",
     redflag:"Supination pain + lateral elbow = radial head fracture post-fall. DRUJ dislocation"},
    {id:"rom_epro",mv:"Pronation",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Longitudinal",
     start:"Elbow 90° flexion, arm at side",gonio:"Same as supination",
     muscles:"Pronator teres, pronator quadratus",
     endfeel:{normal:"Firm (interosseous membrane + supinator stretch)",abnormal:"Hard=DRUJ OA; Empty=acute fracture"},
     compensation:"Shoulder IR, trunk rotation",capsular:"DRUJ: pronation often better preserved than supination",
     adl:"Typing, cutting food, writing, pouring liquid",
     pathology:"Limited pronation: DRUJ arthritis, distal radius malunion, interosseous membrane",
     redflag:"Loss after distal radius fracture = DRUJ injury. Pronator syndrome: painful pronation + median nerve symptoms"},
  ],
  "Wrist":[
    {id:"rom_wflex",mv:"Wrist Flexion",bilateral:true,normal:80,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Forearm supported in pronation, wrist neutral",gonio:"Axis: lateral wrist (triquetrum); Fixed: ulna; Moving: 5th metacarpal",
     muscles:"FCR, FCU, palmaris longus; FDP/FDS assist",
     endfeel:{normal:"Firm (posterior capsule + extensor muscle stretch)",abnormal:"Hard=OA/Kienböck; Springy=TFCC/SL ligament"},
     compensation:"Forearm supination, finger extension",capsular:"Wrist capsular: flex=ext restriction in symmetry (capsular) or asymmetric (ligamentous)",
     adl:"Typing (neutral preferred), prayer position, push-up position",
     pathology:"Limited painful flex: dorsal ganglia, DISI instability, dorsal wrist impingement; Wrist OA",
     redflag:"Limited + painful with swelling = scaphoid fracture (snuffbox tenderness). TFCC: ulnar sided pain + limited"},
    {id:"rom_wext",mv:"Wrist Extension",bilateral:true,normal:70,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Forearm supported in pronation",gonio:"Axis: lateral wrist; Fixed: ulna; Moving: 5th metacarpal",
     muscles:"ECRL, ECRB, ECU",
     endfeel:{normal:"Firm (anterior capsule + flexor stretch)",abnormal:"Hard=OA; Springy=volar plate laxity"},
     compensation:"Forearm pronation, finger flex",capsular:"Wrist OA: both flex and ext equally limited",
     adl:"Push-up, weight bearing on hands, typing (slight extension), keyboard use",
     pathology:"Limited extension: tennis elbow (wrist ext pain); distal radius fracture malunion; volar ganglia",
     redflag:"<30° extension after Colles fracture = malunion — DRUJ check"},
    {id:"rom_wrad",mv:"Radial Deviation",bilateral:true,normal:20,unit:"°",plane:"Frontal",axis:"AP",
     start:"Forearm pronated on table, wrist neutral",gonio:"Axis: middle of wrist (capitate); Fixed: forearm midline; Moving: 3rd metacarpal",
     muscles:"FCR (with ECRL), APL, EPB",
     endfeel:{normal:"Firm (ulnar collateral ligament + ECU/FCU)",abnormal:"Hard=OA/scaphoid impingement; Springy=radial styloid"},
     compensation:"Forearm supination",capsular:"RA: radial deviation restricted early",
     adl:"Keyboard use, pouring, hammering",
     pathology:"Limited radial deviation: scaphoid OA, radial styloid impingement, intersection syndrome",
     redflag:"Painful radial deviation after fall = de Quervain's (Finkelstein test). Scaphoid fracture"},
    {id:"rom_wuln",mv:"Ulnar Deviation",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Forearm pronated on table, wrist neutral",gonio:"Same as radial deviation",
     muscles:"FCU, ECU",
     endfeel:{normal:"Firm (radial collateral ligament + muscles)",abnormal:"Hard=OA; Springy=TFCC"},
     compensation:"Forearm pronation",capsular:"RA: ulnar deviation is deformity direction — assess actively",
     adl:"Hammering, wringing, reaching lateral objects",
     pathology:"TFCC injury: painful ulnar deviation; Ulnar impaction: ulnar wrist pain + limited ulnar dev",
     redflag:"RA: ulnar drift deformity — do not force ulnar deviation. TFCC + ulnar impaction"},
  ],
  "Hand & Fingers":[
    {id:"rom_mcp",mv:"MCP Flexion",bilateral:true,normal:90,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Wrist neutral, assess each finger MCP individually",gonio:"Axis: dorsal MCP joint; Fixed: metacarpal shaft; Moving: proximal phalanx dorsum",
     muscles:"Flexor digitorum superficialis/profundus, lumbricals, interossei",
     endfeel:{normal:"Firm (collateral ligaments + joint capsule)",abnormal:"Springy=flexor tenosynovitis; Hard=OA/Dupuytren"},
     compensation:"Wrist flexion, finger abd/add",capsular:"RA: MCP volar subluxation + ulnar drift — assess passively with care",
     adl:"Gripping, keyboard, writing, pinching",
     pathology:"Limited MCP flex: Dupuytren's contracture, flexor tenosynovitis, RA/OA, post-fracture",
     redflag:"Sudden triggering = trigger finger (stenosing tenosynovitis). RA: MCPs swollen bilaterally = synovitis"},
    {id:"rom_pip",mv:"PIP Flexion",bilateral:true,normal:100,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"MCP neutral, assess each PIP",gonio:"Axis: lateral PIP; Fixed: proximal phalanx; Moving: middle phalanx",
     muscles:"FDS (primary PIP flexor)",
     endfeel:{normal:"Soft (tissue contact, lean) or firm",abnormal:"Springy=volar plate laxity; Hard=OA/bony block"},
     compensation:"MCP flex, wrist flex",capsular:"PIP capsular: flex>ext",
     adl:"All grip functions",
     pathology:"PIP limited: Boutonnière deformity (RA/trauma), volar plate injury, fracture, post-immobilisation contracture",
     redflag:"PIP swelling after injury = volar plate avulsion (jammed finger). Boutonnière = PIP flex + DIP ext deformity"},
    {id:"rom_dip",mv:"DIP Flexion",bilateral:true,normal:90,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"PIP in extension; assess DIP flex/ext",gonio:"Axis: lateral DIP; Fixed: middle phalanx; Moving: distal phalanx",
     muscles:"FDP (sole DIP flexor)",
     endfeel:{normal:"Firm (dorsal capsule + extensor mechanism)",abnormal:"Hard=Heberden's nodes (OA); Springy=extensor mechanism"},
     compensation:"PIP flex",capsular:"DIP: OA causes Heberden's nodes + limited flex",
     adl:"Fine pinch, typing, intricate hand work",
     pathology:"DIP extension loss: mallet finger (extensor digitorum avulsion). DIP OA: Heberden's nodes",
     redflag:"Mallet finger: DIP rests in flex, cannot actively extend = extensor avulsion — splint 6 weeks"},
    {id:"rom_thopp",mv:"Thumb Opposition",bilateral:true,normal:null,unit:"",plane:"Multi",axis:"Multi",
     start:"Assess little finger pad contact with thumb pad",gonio:"Kapandji index (0–10 scale): 0=thumb cannot reach index; 10=full opposition past little finger base",
     muscles:"Opponens pollicis, FPB, APB, FPL",
     endfeel:{normal:"Firm (1st CMC joint + AdPoll + EP)",abnormal:"Hard=CMC OA; Springy=UCL laxity (Skier's thumb)"},
     compensation:"Wrist flex, forearm pronation",capsular:"1st CMC OA: adduction + extension most limited → Z-deformity",
     adl:"Pinching, writing, buttoning, feeding, key grip",
     pathology:"CMC OA (common in women >50): adduction/extension limited → pain base thumb. CTS: APB weakness → opposition weakness",
     redflag:"CMC OA grading: I (ligamentous laxity), II–IV (progressive narrowing). Grind test positive"},
    {id:"rom_thabdm",mv:"Thumb Abd/Ext",bilateral:true,normal:70,unit:"°",plane:"Frontal",axis:"AP",
     start:"Wrist neutral, thumb alongside index; palmar abduction (out of palm plane)",gonio:"Axis: 1st MCP; Fixed: 1st metacarpal; Moving: proximal phalanx",
     muscles:"APB, APL (abduction); EPL, EPB (extension)",
     endfeel:{normal:"Firm (adductor pollicis + 1st dorsal interosseous)",abnormal:"Hard=1st CMC OA; Springy=UCL"},
     compensation:"Wrist radial deviation",capsular:"1st CMC: abduction + extension restriction in OA",
     adl:"Holding large objects, typing space bar, jar opening",
     pathology:"de Quervain's: APL/EPB tenosynovitis — painful abduction; Limited: CMC OA",
     redflag:"UCL injury (Skier's thumb): valgus stress test at MCP. Stener lesion = surgical"},
  ],
  "Hip":[
    {id:"rom_hflex",mv:"Flexion",bilateral:true,normal:120,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, knee flexed (eliminates hamstring restriction) — assess also with knee extended",gonio:"Axis: greater trochanter; Fixed: mid-axillary line; Moving: lateral femur to lateral condyle",
     muscles:"Iliopsoas (primary), rectus femoris, TFL, sartorius",
     endfeel:{normal:"Soft (anterior thigh-abdomen contact) or firm",abnormal:"Firm early=capsular/OA; Hard=CAM impingement; Empty=acute"},
     compensation:"Lumbar flexion (monitor: loss of lordosis), contralateral hip flex, posterior pelvic tilt",
     capsular:"Hip capsular: IR>Flex>Abd (late stage: all planes)",
     adl:"Sitting, stair climbing, getting out of car, sexual activity, tying shoes",
     pathology:"Limited flex: hip OA (capsular), CAM/pincer FAI, iliopsoas tendinopathy, labral tear",
     redflag:"Groin pain at end-range flex = labral tear (FADIR positive). Trauma + loss = fracture/dislocation"},
    {id:"rom_hext",mv:"Extension",bilateral:true,normal:20,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Prone, stabilise pelvis; knee extended (test hip capsule) + knee flexed 90° (test iliopsoas)",gonio:"Axis: greater trochanter; Fixed: mid-axillary line; Moving: lateral femur",
     muscles:"Gluteus maximus, hamstrings (knee extended), posterior adductor magnus",
     endfeel:{normal:"Firm (iliofemoral ligament + anterior capsule)",abnormal:"Hard=OA/CAM; Springy=posterior impingement"},
     compensation:"Lumbar hyperextension (anterior pelvic tilt), knee flex (to use hamstrings)",
     capsular:"Hip OA: extension + IR restricted earliest",
     adl:"Walking push-off, stair descending, standing from seated",
     pathology:"Hip ext loss: hip flexor contracture (Thomas test), hip OA, lumbar facet compensation",
     redflag:"Bilateral hip ext loss + fixed flexion = AS. Thomas test positive = psoas/rectus tightness"},
    {id:"rom_habd",mv:"Abduction",bilateral:true,normal:45,unit:"°",plane:"Frontal",axis:"AP",
     start:"Supine, pelvis level; stabilise contralateral ASIS",gonio:"Axis: ASIS; Fixed: ASIS-to-ASIS line; Moving: midline of thigh to midpoint of patella",
     muscles:"Gluteus medius/minimus, TFL, piriformis (at 0° flex)",
     endfeel:{normal:"Firm (adductors + pubofemoral ligament + medial capsule)",abnormal:"Hard=OA/CAM; Springy=labrum"},
     compensation:"Lateral pelvic tilt (hip hike), lumbar lateral flex, trunk lean",
     capsular:"Hip OA: abduction limited with internal rotation (combined movement most restricted)",
     adl:"Getting in/out of car, stepping sideways, putting on trousers/socks",
     pathology:"Limited abd: OA, labral tear (CAM), adductor tightness, Legg-Calvé-Perthes, DDH",
     redflag:"Bilateral abd loss in child = DDH/LCP — urgent referral. Trendelenburg sign = Gmed weakness"},
    {id:"rom_hadd",mv:"Adduction",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Supine, move test leg across midline; stabilise contralateral ASIS",gonio:"Axis: ASIS; Fixed: ASIS line; Moving: midline thigh",
     muscles:"Adductor longus/brevis/magnus, gracilis, pectineus",
     endfeel:{normal:"Firm (IT band + abductors + lateral capsule)",abnormal:"Springy=adductor strain; Hard=OA"},
     compensation:"Contralateral pelvis drop, trunk lean ipsilateral",capsular:"Less restricted than abd in OA",
     adl:"Crossing legs, horseback riding",
     pathology:"Painful adduction: adductor strain, osteitis pubis, sports hernia",
     redflag:"Adductor squeeze test <18cmHg = groin strain. Groin pain in child/adolescent = SUFE — urgent X-ray"},
    {id:"rom_her",mv:"ER",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, hip + knee 90° (seated) OR prone, knee 90° (pelvis stabilised)",gonio:"Axis: knee (midpoint); Fixed: vertical; Moving: distal fibula/tibia (pendulum method)",
     muscles:"Piriformis, obturator internus/externus, gemelli, gluteus maximus (posterior fibers)",
     endfeel:{normal:"Firm (anterior capsule + iliofemoral ligament + internal rotators)",abnormal:"Hard=OA; Springy=labral tear"},
     compensation:"Lateral pelvic tilt, lumbar rotation",capsular:"Hip OA: IR more limited than ER (early); Both limited end-stage",
     adl:"Cross-legged sitting, walking toe-out gait, external rotation in sport",
     pathology:"Piriformis syndrome: painful ER + sciatic symptoms; Hip OA: ER preserved longer than IR",
     redflag:"Bilateral ER loss in child = SUFE. Painful ER in trauma = posterior hip dislocation"},
    {id:"rom_hir",mv:"IR",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Prone knee 90° (most reliable); or supine hip 90°",gonio:"Same pendulum method as ER",
     muscles:"Gluteus medius (anterior), TFL, adductor longus",
     endfeel:{normal:"Firm (posterior capsule + external rotators + ischiofemoral ligament)",abnormal:"Hard=OA/FAI; Empty=acute; Springy=labrum"},
     compensation:"Trunk rotation, pelvic rotation",capsular:"Hip IR FIRST AND MOST LIMITED in early hip OA — key diagnostic sign",
     adl:"Getting in/out of car, sitting cross-legged is limited, pivoting",
     pathology:"IR loss: hip OA (earliest sign), CAM FAI, posterior capsule tightness; GIRD equivalent at hip",
     redflag:"IR loss + groin pain in middle-aged = hip OA. Sudden IR loss in child = SUFE/LCP — X-ray"},
  ],
  "Knee":[
    {id:"rom_kflex",mv:"Flexion",bilateral:true,normal:140,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or prone; assess both actively and passively",gonio:"Axis: lateral knee (lateral condyle); Fixed: lateral femur (greater trochanter to condyle line); Moving: lateral fibula to lateral malleolus",
     muscles:"Hamstrings (primary), gastrocnemius (assists at end range), popliteus (initiates)",
     endfeel:{normal:"Soft (posterior calf-thigh contact) or firm (capsule in lean patients)",abnormal:"Springy=meniscal block; Hard=OA/loose body; Empty=acute hemarthrosis"},
     compensation:"Hip flex to assist, ankle plantar flex to increase apparent knee flex",
     capsular:"Knee capsular: Flex>Ext (3:1 ratio in OA)",
     adl:"Stair climbing (N=85°), sitting (N=90°), squatting (N=130°), kneeling (N=140°)",
     pathology:"Limited flex: knee OA, effusion (30° is maximum comfortable flexion in effusion), patellofemoral OA, quadriceps contracture",
     redflag:"Springy block = meniscal tear (bucket handle). Locked knee = urgent. Haemarthrosis post-trauma = ACL tear"},
    {id:"rom_kext",mv:"Extension",bilateral:true,normal:0,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine; assess extension lag (difference between passive and active extension)",gonio:"Same as flexion",
     muscles:"Quadriceps (rectus femoris, vasti)",
     endfeel:{normal:"Firm (posterior capsule + posterior ligaments) or hard (bone-to-bone in hyperextension)",abnormal:"Springy=posterior impingement; Hard=OA; Soft early=effusion"},
     compensation:"Hip extension, ankle DF",capsular:"Extension loss: OA, post-surgery (arthrofibrosis), hamstring tightness",
     adl:"Walking (requires 0°), stair descent, standing",
     pathology:"Extension lag: quadriceps weakness or patella tendon rupture. Flexion contracture: OA, post-fracture, arthrofibrosis",
     redflag:"Extension lag >10° = quadriceps mechanism injury (patella or patellar tendon). PCL injury = posterior sag"},
  ],
  "Ankle":[
    {id:"rom_adf",mv:"Dorsiflexion",bilateral:true,normal:20,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or seated (non-weight bearing); also assess weight-bearing lunge test (N ≥ 10cm heel-to-wall)",gonio:"Axis: lateral malleolus; Fixed: fibula shaft; Moving: 5th metatarsal shaft",
     muscles:"Tibialis anterior, EHL, EDL, peroneus tertius",
     endfeel:{normal:"Firm (posterior capsule + Achilles/soleus tension)",abnormal:"Hard=bony block (anterior OA/os trigonum); Springy=anterior impingement; Empty=Achilles rupture"},
     compensation:"Subtalar eversion (to compensate DF with pronation), knee flex, hip flex, anterior trunk lean",
     capsular:"Ankle capsular: PF>DF (Cyriax)",
     adl:"Stair climbing (N=15–20°), squatting, kneeling, gait push-off",
     pathology:"Limited DF: Achilles/soleus tightness (equinus), anterior bony impingement, os trigonum, posterior capsule adhesions",
     redflag:"<10° DF = kinetic chain effects: knee valgus, foot pronation, pelvic anterior tilt in squat. Heel cord: Silfverskiöld test"},
    {id:"rom_apf",mv:"Plantarflexion",bilateral:true,normal:50,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, ankle relaxed",gonio:"Axis: lateral malleolus; Fixed: fibula; Moving: 5th metatarsal",
     muscles:"Gastrocnemius, soleus, tibialis posterior, peroneals, FHL/FDL",
     endfeel:{normal:"Firm (anterior capsule + anterior muscles stretch)",abnormal:"Hard=posterior OA/loose body; Springy=ligamentous"},
     compensation:"Hip IR, trunk lean",capsular:"Plantarflexion less affected than DF in ankle OA",
     adl:"Heel raise, ballet, push-off in walking, cycling",
     pathology:"Limited PF: anterior impingement syndrome, Achilles calcification, anterior capsule adhesion",
     redflag:"Sudden PF loss after push-off = Achilles rupture (Thompson test negative)"},
    {id:"rom_ainv",mv:"Inversion",bilateral:true,normal:35,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, ankle in plantar flex (tests subtalar); assess talar tilt",gonio:"Axis: posterior calcaneus; Fixed: tibia shaft; Moving: posterior calcaneus",
     muscles:"Tibialis posterior, FHL, FDL, tibialis anterior",
     endfeel:{normal:"Firm (lateral ligaments + peroneal muscles)",abnormal:"Springy=ATFL/CFL laxity; Hard=coalition; Empty=acute sprain"},
     compensation:"Tibial IR, knee flex",capsular:"Subtalar: inversion > eversion restriction in subtalar OA",
     adl:"Walking on uneven ground, sand",
     pathology:"Hypermobile inversion: lateral ankle sprain (ATFL/CFL); Limited: subtalar OA, tarsal coalition, peroneal tendinopathy",
     redflag:">35° inversion + pain + swelling post-sprain = grade III ATFL tear — anterior draw test. Ottawa rules: X-ray"},
    {id:"rom_aev",mv:"Eversion",bilateral:true,normal:15,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, ankle neutral",gonio:"Axis: posterior calcaneus; Fixed: tibia; Moving: posterior calcaneus",
     muscles:"Peroneus longus/brevis, peroneus tertius, EDB",
     endfeel:{normal:"Firm (medial deltoid ligament + tibialis posterior)",abnormal:"Hard=coalition; Springy=deltoid laxity"},
     compensation:"Tibial ER, knee ext",capsular:"Eversion less commonly restricted than inversion",
     adl:"Walking on uneven ground (medial stability)",
     pathology:"Hypomobile eversion: peroneal tendinopathy, subtalar OA; Hypermobile: deltoid ligament laxity",
     redflag:"Eversion force mechanism injury = deltoid ligament tear (medial ankle) — assess with stress X-ray"},
  ],
  "Foot":[
    {id:"rom_1mtpf",mv:"1st MTP Extension",bilateral:true,normal:70,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing (functional) or supine; windlass test: active hallux extension",gonio:"Axis: 1st MTP joint; Fixed: 1st metatarsal; Moving: proximal phalanx plantar surface",
     muscles:"EHL (active); passive: plantar fascia (windlass mechanism)",
     endfeel:{normal:"Firm (plantar plate + FHL + plantar fascia windlass)",abnormal:"Hard=hallux rigidus (OA); Springy=sesamoiditis; Empty=fracture"},
     compensation:"Supination of forefoot, external rotation of limb, early heel rise (antalgic gait)",
     capsular:"1st MTP OA (hallux rigidus): extension severely limited, end-range painful",
     adl:"Walking push-off (requires 65–70° MTP extension), running, going up stairs",
     pathology:"Hallux rigidus: progressive MTP extension loss → antalgic gait with external rotation. Hallux valgus: deviated alignment",
     redflag:"Acute MTP pain + limitation = turf toe (plantar plate sprain) or fracture. Grade III turf toe = surgical"},
    {id:"rom_1mtpp",mv:"1st MTP Flexion",bilateral:true,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, ankle neutral",gonio:"Axis: dorsal MTP; Fixed: 1st metatarsal; Moving: dorsal proximal phalanx",
     muscles:"FHL, FHB",
     endfeel:{normal:"Firm (dorsal capsule + EHL stretch)",abnormal:"Hard=OA; Springy=sesamoid"},
     compensation:"Ankle DF to assist toe flex",capsular:"OA: both flex and ext limited",
     adl:"Running, push-off power",
     pathology:"Limited: hallux rigidus, FHL tenosynovitis (dancer's posterior ankle pain)",
     redflag:"Posterior ankle pain + limited MTP flex in dancer = FHL tenosynovitis or os trigonum"},
    {id:"rom_mtpf2",mv:"2nd–5th MTP Extension",bilateral:true,normal:40,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine; assess each MTP extension passively",gonio:"Axis: each MTP joint",
     muscles:"EDL, EDB",
     endfeel:{normal:"Firm (plantar plate + FDL)",abnormal:"Springy=plantar plate injury; Hard=OA"},
     compensation:"Hip and knee extension",capsular:"Lesser MTP OA: variable restriction",
     adl:"Walking push-off, running",
     pathology:"Limited/painful MTP ext: Morton's neuroma (not joint), metatarsalgia, stress fracture, plantar plate injury",
     redflag:"2nd MTP dorsal dislocation (Lisfranc injury): severe pain + limited ROM + plantar ecchymosis"},
  ],
};

const ROM_REGIONS=Object.keys(ROM_DATA);
const RESTRICTION_GRADE=(measured,normal)=>{
  if(!measured||!normal) return null;
  const pct=(measured/normal)*100;
  if(pct>=85) return{label:"WNL",color:"#00c97a",pct};
  if(pct>=65) return{label:"Mild",color:"#ffb300",pct};
  if(pct>=40) return{label:"Moderate",color:"#ff8c42",pct};
  return{label:"Severe",color:"#ff4d6d",pct};
};

const ROM_REDFLAGS=[
  {test:(mv,val)=>mv.toLowerCase().includes("cervical")&&parseFloat(val)<20,msg:"Cervical ROM <20° — fracture/instability protocol. Do not passively test.",color:"#ff4d6d"},
  {test:(mv,val)=>mv.toLowerCase().includes("ankle dorsiflexion")&&parseFloat(val)<10,msg:"Ankle DF <10° — significant equinus. Kinetic chain assessment required.",color:"#ff8c42"},
  {test:(mv,val)=>mv.toLowerCase().includes("hip ir")&&parseFloat(val)<20,msg:"Hip IR <20° — possible early hip OA or FAI. Labral tear assessment indicated.",color:"#ff8c42"},
  {test:(mv,val)=>mv.toLowerCase().includes("knee flex")&&parseFloat(val)<90,msg:"Knee flexion <90° — functional limitation for ADLs. Effusion assessment needed.",color:"#ff8c42"},
];

function genROMSoap(data){
  const findings=[];
  ROM_REGIONS.forEach(reg=>{
    ROM_DATA[reg].forEach(m=>{
      const sides=m.bilateral?["_L","_R"]:[""];
      sides.forEach(s=>{
        const v=data[`${m.id}${s}_arom`]||data[`${m.id}${s}`];
        if(v){
          const g=RESTRICTION_GRADE(parseFloat(v),m.normal);
          if(g&&g.label!=="WNL") findings.push(`${m.mv}${s?` (${s.slice(1)})`:""}=${v}${m.unit} [${g.label} restriction: ${Math.round(g.pct)}% normal]`);
        }
      });
    });
  });
  return findings.length===0?"No significant ROM restrictions recorded.":`ROM restrictions identified:\n${findings.join("\n")}`;
}


export { ALL_TESTS, ExercisePrescriptionModule, PalpationModule, TreatmentTechniquesModule, TreatmentSessionLogModule, ProtocolPanel, QuickTemplatesPanel, BodyFigureSVG, GradeChip };
