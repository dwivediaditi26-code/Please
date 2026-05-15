import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { getC } from './theme.jsx';
import { ALL_EXERCISES, DASH_OPTS, ELBOW_PROTOCOLS, EXERCISE_DB, FABQ_OPTS, HIP_PROTOCOLS, KNEE_PROTOCOLS, LEFS_OPTS, NKT_REGIONS, OM_CAT_COLOR, OUTCOME_DB, PC, POSTURE_DEFECTS, PROGRAMME_TEMPLATES, SHOULDER_PROTOCOLS, TSK_OPTS, mid } from './shared.jsx';

function OutcomeMeasuresModule() {
  const categories = [...new Set(Object.values(OUTCOME_DB).map(m => m.category))];
  const [catFilter,   setCatFilter]   = useState("All");
  const [active,      setActive]      = useState(null);
  const [answers,     setAnswers]     = useState({});
  const [sessions,    setSessions]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("physio_om_sessions") || "[]"); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [toast,       setToast]       = useState(null);
  const [expandCards, setExpandCards] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const setField = (qid, fid, val) => setAnswers(a => ({ ...a, [qid]: { ...a[qid], [fid]: val } }));

  const filteredMeasures = Object.values(OUTCOME_DB).filter(m => catFilter === "All" || m.category === catFilter);

  const getScore = (m) => {
    const v = answers[m.id] || {};
    return m.score(v);
  };

  const completedCount = Object.values(OUTCOME_DB).filter(m => getScore(m) !== null).length;

  const saveSession = () => {
    const snap = { date: new Date().toLocaleString("en-GB"), scores: {}, timestamp: Date.now() };
    Object.values(OUTCOME_DB).forEach(m => { const s = getScore(m); if (s !== null) snap.scores[m.id] = s; });
    if (!Object.keys(snap.scores).length) { showToast("No completed measures to save", "warn"); return; }
    const updated = [...sessions, snap];
    setSessions(updated);
    try { localStorage.setItem("physio_om_sessions", JSON.stringify(updated.slice(-20))); } catch {}
    showToast(`✅ Session ${updated.length} saved — ${Object.keys(snap.scores).length} measures recorded`);
  };

  const clearHistory = () => {
    if (!window.confirm("Clear all session history? This cannot be undone.")) return;
    setSessions([]);
    try { localStorage.removeItem("physio_om_sessions"); } catch {}
    showToast("History cleared");
  };

  const exportSessionsPDF = () => {
    const scored = Object.values(OUTCOME_DB).filter(m => getScore(m) !== null);
    if (!scored.length) { showToast("No completed measures to export", "warn"); return; }
    const rows = scored.map(m => {
      const score = getScore(m);
      const interp = typeof score !== "object" ? m.interpret(score) : null;
      const history = sessions.map(s => s.scores[m.id]).filter(v => v !== undefined);
      const change = history.length >= 2 ? history[history.length - 1] - history[0] : null;
      return { m, score, interp, history, change };
    });
    const metaRight = `<div><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}</div><div><strong>Completed Measures:</strong> ${scored.length}</div><div><strong>Sessions Recorded:</strong> ${sessions.length}</div>`;
    const bodyHTML = `
      <span class="badge badge-purple">OUTCOME MEASURES REPORT</span>
      ${rows.map(({ m, score, interp, history, change }) => `
        <div class="no-break" style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:12px;overflow:hidden;">
          <div style="background:#0369a1;color:#fff;padding:8px 13px;display:flex;align-items:center;gap:8px;">
            <span style="font-size:15px">${m.icon}</span>
            <span style="font-size:12px;font-weight:800;">${m.label}</span>
            <span style="margin-left:auto;font-size:9px;opacity:0.8">${m.category}</span>
          </div>
          <div style="padding:10px 13px;">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;">
              <div style="font-size:28px;font-weight:900;color:${interp?.color || "#0369a1"}">${typeof score === "object" ? `PA:${score.pa} / W:${score.w}` : score}${m.unit}</div>
              ${interp ? `<div style="flex:1"><div style="font-weight:700;color:${interp.color};font-size:11px">${interp.label}</div><div style="font-size:10px;color:#374151;margin-top:2px;line-height:1.5">${interp.text}</div></div>` : ""}
            </div>
            ${m.mcid ? `<div style="font-size:9px;color:#64748b;margin-bottom:6px">MCID = ${m.mcid}${m.unit} (minimum clinically important difference)</div>` : ""}
            ${history.length >= 2 && change !== null ? `
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:6px 10px;font-size:10px;">
                <strong>Progress:</strong> ${history.join(" → ")}${m.unit}
                &nbsp;|&nbsp; <strong style="color:${isImproved(m.id, change) ? "#15803d" : "#b91c1c"}">${change > 0 ? "+" : ""}${Math.round(change * 10) / 10}${m.unit} ${isImproved(m.id, change) ? "▲ Improved" : "▼ Declined"}</strong>
                ${Math.abs(change) >= (m.mcid || 0) ? `&nbsp;·&nbsp; <strong style="color:#15803d">Clinically significant</strong>` : ""}
              </div>` : ""}
          </div>
        </div>`).join("")}
      <div style="margin-top:14px;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:9px;color:#78350f;">
        ⚠ Scores calculated per original validated scoring criteria. MCID values reflect published literature. All findings require clinical correlation.
      </div>`;
    const html = makePDFPage("Outcome Measures Report", metaRight, bodyHTML);
    downloadPDFFromHTML(html, `Outcome_Measures_${Date.now()}.pdf`);
  };

  // Field renderer
  const renderField = (m, f) => {
    const val = (answers[m.id] || {})[f.id];
    const upd = (v) => setField(m.id, f.id, v);
    const base = { width:"100%", background:"#f5f0fb", border:"1px solid #d8cce8", borderRadius:8, color:"#1a1025", fontFamily:"inherit", outline:"none", padding:"7px 10px", fontSize:"0.76rem" };
    if (f.type === "slider") return <OMSlider id={f.id} min={f.min} max={f.max} step={f.step} value={val} onChange={upd}/>;
    if (f.type === "text")   return <input value={val||""} onChange={e=>upd(e.target.value)} placeholder={f.placeholder} style={base}/>;
    if (f.type === "select5")    return <select value={val||""} onChange={e=>upd(e.target.value)} style={base}><option value="">— select —</option>{DASH_OPTS.map(o=><option key={o} value={o.split(" — ")[0]}>{o}</option>)}</select>;
    if (f.type === "select_lefs") return <select value={val||""} onChange={e=>upd(e.target.value)} style={base}><option value="">— select —</option>{LEFS_OPTS.map(o=><option key={o} value={o.split(" — ")[0]}>{o}</option>)}</select>;
    if (f.type === "select_tsk")  return <select value={val||""} onChange={e=>upd(e.target.value)} style={base}><option value="">— select —</option>{TSK_OPTS.map(o=><option key={o} value={o.split(" — ")[0]}>{o}</option>)}</select>;
    if (f.type === "select_fabq") return <select value={val||""} onChange={e=>upd(e.target.value)} style={base}><option value="">— select —</option>{FABQ_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</select>;
    if (f.type === "select")      return <select value={val||""} onChange={e=>upd(e.target.value)} style={base}><option value="">— select —</option>{f.options.map(o=><option key={o} value={o}>{o}</option>)}</select>;
    return null;
  };

  const activeMeasure = active ? OUTCOME_DB[active] : null;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", zIndex:999, background: toast.type==="warn"?"rgba(255,179,0,0.97)":"rgba(0,201,122,0.97)", color:"#000", fontWeight:700, fontSize:"0.78rem", padding:"9px 18px", borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.3)", whiteSpace:"nowrap" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Summary bar ── */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ flex:1, background:"#ffffff", border:"1px solid #d8cce8", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
          <div>
            <div style={{ fontSize:"1.4rem", fontWeight:900, color:"#00e5ff", fontFamily:"monospace", lineHeight:1 }}>{completedCount}</div>
            <div style={{ fontSize:"0.55rem", color:"#7e6a9a", textTransform:"uppercase", letterSpacing:"1px" }}>Completed</div>
          </div>
          <div style={{ width:1, height:32, background:"#ede7f6" }}/>
          <div>
            <div style={{ fontSize:"1.4rem", fontWeight:900, color:"#7f5af0", fontFamily:"monospace", lineHeight:1 }}>{sessions.length}</div>
            <div style={{ fontSize:"0.55rem", color:"#7e6a9a", textTransform:"uppercase", letterSpacing:"1px" }}>Sessions</div>
          </div>
          <div style={{ width:1, height:32, background:"#ede7f6" }}/>
          <div>
            <div style={{ fontSize:"1.4rem", fontWeight:900, color:"#ffb300", fontFamily:"monospace", lineHeight:1 }}>{Object.keys(OUTCOME_DB).length}</div>
            <div style={{ fontSize:"0.55rem", color:"#7e6a9a", textTransform:"uppercase", letterSpacing:"1px" }}>Available</div>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          <button onClick={saveSession} style={{ padding:"8px 13px", background:"linear-gradient(135deg,rgba(0,201,122,0.2),rgba(0,229,255,0.1))", border:"1px solid rgba(0,201,122,0.35)", borderRadius:8, color:"#00c97a", fontWeight:800, fontSize:"0.68rem", cursor:"pointer", whiteSpace:"nowrap" }}>💾 Save Session</button>
          <button onClick={exportSessionsPDF} style={{ padding:"8px 13px", background:"rgba(127,90,240,0.1)", border:"1px solid rgba(127,90,240,0.3)", borderRadius:8, color:"#7f5af0", fontWeight:700, fontSize:"0.68rem", cursor:"pointer", whiteSpace:"nowrap" }}>📄 Export PDF</button>
        </div>
      </div>

      {/* ── Session history panel ── */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", gap:6, marginBottom: showHistory ? 8 : 0 }}>
          <button onClick={() => setShowHistory(h => !h)} style={{ padding:"6px 12px", background: showHistory?"rgba(127,90,240,0.15)":"transparent", border:`1px solid ${showHistory?"rgba(127,90,240,0.35)":"#1a2d45"}`, borderRadius:8, color: showHistory?"#7f5af0":"#6b8399", fontWeight:700, fontSize:"0.68rem", cursor:"pointer" }}>
            📈 Progress History {sessions.length > 0 ? `(${sessions.length} sessions)` : ""}
          </button>
          {sessions.length > 0 && <button onClick={clearHistory} style={{ padding:"6px 10px", background:"transparent", border:"1px solid rgba(255,77,109,0.25)", borderRadius:8, color:"rgba(255,77,109,0.6)", fontSize:"0.62rem", cursor:"pointer" }}>✕ Clear</button>}
        </div>

        {showHistory && sessions.length > 0 && (
          <div style={{ background:"#ffffff", border:"1px solid rgba(127,90,240,0.25)", borderRadius:12, padding:"13px" }}>
            <div style={{ fontSize:"0.6rem", fontWeight:700, color:"#7f5af0", textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>Score Progression Across Sessions</div>
            {Object.keys(sessions[sessions.length - 1].scores).map(id => {
              const m = OUTCOME_DB[id]; if (!m) return null;
              const vals = sessions.map(s => s.scores[id]).filter(x => x !== undefined && typeof x !== "object");
              if (!vals.length) return null;
              const change = vals.length >= 2 ? vals[vals.length - 1] - vals[0] : null;
              const improved = change !== null ? isImproved(id, change) : null;
              const col = OM_CAT_COLOR[m.category] || "#00e5ff";
              const latest = vals[vals.length - 1];
              const interp = m.interpret(latest);
              return (
                <div key={id} style={{ background:"#f5f0fb", border:`1px solid ${col}25`, borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:"1rem" }}>{m.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"0.72rem", fontWeight:700, color:"#1a1025" }}>{m.label.split(" — ")[0]}</div>
                      {interp && <div style={{ fontSize:"0.6rem", color: interp.color, fontWeight:700, marginTop:1 }}>{interp.label}</div>}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:"1.1rem", fontWeight:900, color: col, fontFamily:"monospace" }}>{latest}{m.unit}</div>
                      {change !== null && (
                        <div style={{ fontSize:"0.65rem", fontWeight:800, color: improved?"#00c97a":"#ff4d6d" }}>
                          {change > 0 ? "+" : ""}{Math.round(change * 10) / 10}{m.unit} {improved ? "▲" : "▼"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <Sparkline values={vals} color={col} improved={improved}/>
                    <div style={{ flex:1 }}>
                      {/* MCID check */}
                      {change !== null && m.mcid && (
                        <div style={{ padding:"4px 8px", background: Math.abs(change) >= m.mcid ? (improved?"rgba(0,201,122,0.1)":"rgba(255,77,109,0.1)") : "rgba(255,179,0,0.08)", border:`1px solid ${Math.abs(change)>=m.mcid?(improved?"rgba(0,201,122,0.3)":"rgba(255,77,109,0.3)"):"rgba(255,179,0,0.25)"}`, borderRadius:7, fontSize:"0.6rem", color: Math.abs(change)>=m.mcid?(improved?"#00c97a":"#ff4d6d"):"#ffb300", fontWeight:700 }}>
                          {Math.abs(change) >= m.mcid ? (improved ? "✅ Exceeds MCID — Clinically significant improvement" : "⚠ Exceeds MCID — Clinically significant decline") : `⬤ Below MCID (need ${m.mcid}${m.unit})`}
                        </div>
                      )}
                      {/* Session dots */}
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:6 }}>
                        {vals.map((v, i) => (
                          <span key={i} style={{ fontSize:"0.55rem", padding:"1px 5px", background:"#ede7f6", borderRadius:4, color:"#7e6a9a" }}>S{i + 1}: {v}{m.unit}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {showHistory && sessions.length === 0 && (
          <div style={{ padding:"16px", background:"#ffffff", border:"1px solid #d8cce8", borderRadius:10, textAlign:"center", color:"#7e6a9a", fontSize:"0.75rem" }}>
            No sessions saved yet — complete measures and tap 💾 Save Session
          </div>
        )}
      </div>

      {/* ── Category filter ── */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
        {["All", ...categories].map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            style={{ padding:"3px 9px", borderRadius:8, fontSize:"0.6rem", fontWeight:700, border:`1px solid ${catFilter===c?(OM_CAT_COLOR[c]||"rgba(0,229,255,0.5)"):"#1a2d45"}`, background:catFilter===c?`${OM_CAT_COLOR[c]||"rgba(0,229,255,0.18)"}22`:"transparent", color:catFilter===c?(OM_CAT_COLOR[c]||"#00e5ff"):"#6b8399", cursor:"pointer" }}>
            {c}
          </button>
        ))}
      </div>

      {/* ── Measure cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))", gap:8, marginBottom:14 }}>
        {filteredMeasures.map(m => {
          const score  = getScore(m);
          const interp = score !== null ? (typeof score === "object" ? m.interpret(score) : m.interpret(score)) : null;
          const col    = OM_CAT_COLOR[m.category] || "#00e5ff";
          const isOpen = active === m.id;
          const history= sessions.map(s => s.scores[m.id]).filter(v => v !== undefined && typeof v !== "object");
          const change = history.length >= 2 ? history[history.length-1] - history[0] : null;
          return (
            <div key={m.id} onClick={() => setActive(isOpen ? null : m.id)}
              style={{ background:"#ffffff", border:`1px solid ${isOpen?col+"70":score!==null?col+"35":"#1a2d45"}`, borderRadius:13, padding:"12px", cursor:"pointer", transition:"all 0.18s", position:"relative" }}>
              {/* Completed dot */}
              {score !== null && (
                <div style={{ position:"absolute", top:8, right:8, width:7, height:7, borderRadius:"50%", background: interp?.color || col, boxShadow:`0 0 5px ${interp?.color || col}` }}/>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <span style={{ fontSize:"1.2rem" }}>{m.icon}</span>
                {score !== null && typeof score !== "object" && (
                  <ScoreRing score={score} maxScore={m.maxScore} color={interp?.color || col} size={46}/>
                )}
                {score !== null && typeof score === "object" && (
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"0.6rem", color:"#7e6a9a" }}>PA: <b style={{ color: score.pa>15?"#ff4d6d":"#00c97a" }}>{score.pa}</b></div>
                    <div style={{ fontSize:"0.6rem", color:"#7e6a9a" }}>W: <b style={{ color: score.w>34?"#ff4d6d":"#00c97a" }}>{score.w}</b></div>
                  </div>
                )}
              </div>
              <div style={{ fontSize:"0.68rem", fontWeight:700, color:"#1a1025", lineHeight:1.3, marginBottom:4 }}>{m.label.split(" — ")[0]}</div>
              <div style={{ fontSize:"0.55rem", padding:"1px 6px", borderRadius:5, background:`${col}18`, color:col, display:"inline-block", marginBottom:5 }}>{m.category}</div>
              {/* Severity badge */}
              {interp && (
                <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background: interp.color, flexShrink:0 }}/>
                  <div style={{ fontSize:"0.62rem", fontWeight:800, color: interp.color }}>{interp.label}</div>
                </div>
              )}
              {/* Score gauge */}
              {score !== null && typeof score !== "object" && m.maxScore && (
                <div style={{ height:4, background:"#ede7f6", borderRadius:2, overflow:"hidden", marginBottom:4 }}>
                  <div style={{ height:"100%", width:`${Math.min(100,(score/m.maxScore)*100)}%`, background: interp?.color||col, borderRadius:2, transition:"width 0.5s" }}/>
                </div>
              )}
              {/* Progress change */}
              {change !== null && (
                <div style={{ fontSize:"0.58rem", color: isImproved(m.id,change)?"#00c97a":"#ff4d6d", fontWeight:700 }}>
                  {change > 0 ? "+" : ""}{Math.round(change * 10) / 10}{m.unit} {isImproved(m.id,change)?"▲":"▼"} from S1
                </div>
              )}
              {!score && score !== 0 && <div style={{ fontSize:"0.6rem", color:"#3a5070" }}>Tap to complete →</div>}
            </div>
          );
        })}
      </div>

      {/* ── Active questionnaire ── */}
      {activeMeasure && (()=>{
        const score  = getScore(activeMeasure);
        const interp = score !== null ? activeMeasure.interpret(score) : null;
        const col    = OM_CAT_COLOR[activeMeasure.category] || "#00e5ff";
        const history= sessions.map(s => s.scores[activeMeasure.id]).filter(v => v!==undefined && typeof v!=="object");
        const prev   = history.length > 0 ? history[history.length - 1] : null;
        const change = (prev !== null && score !== null && typeof score !== "object") ? score - prev : null;
        const mcid   = activeMeasure.mcid || 0;
        return (
          <div style={{ background:"#ffffff", border:`1px solid ${col}45`, borderRadius:14, padding:"15px", marginBottom:14 }}>
            {/* Header */}
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:14 }}>
              <span style={{ fontSize:"1.6rem" }}>{activeMeasure.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.9rem", fontWeight:800, color:"#1a1025", lineHeight:1.2 }}>{activeMeasure.label}</div>
                <div style={{ fontSize:"0.62rem", color:col, marginTop:2 }}>{activeMeasure.category}</div>
                <div style={{ fontSize:"0.65rem", color:"#7e6a9a", marginTop:5, lineHeight:1.55 }}>{activeMeasure.description}</div>
              </div>
              {score !== null && typeof score !== "object" && (
                <div style={{ flexShrink:0, textAlign:"center" }}>
                  <ScoreRing score={score} maxScore={activeMeasure.maxScore} color={interp?.color||col} size={72}/>
                  <div style={{ fontSize:"0.52rem", color:"#7e6a9a", marginTop:2 }}>{activeMeasure.unit}</div>
                </div>
              )}
            </div>

            {/* Score gauge bar */}
            {score !== null && typeof score !== "object" && activeMeasure.maxScore && (
              <div style={{ marginBottom:12 }}>
                <ScoreGauge score={score} maxScore={activeMeasure.maxScore} color={interp?.color||col} label={`Score out of ${activeMeasure.maxScore}`} mcid={activeMeasure.mcid}/>
              </div>
            )}

            {/* Severity interpretation — prominent */}
            {interp && (
              <div style={{ padding:"12px 14px", background:`${interp.color}10`, border:`2px solid ${interp.color}35`, borderRadius:11, marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:interp.color }}/>
                  <div style={{ fontSize:"0.82rem", fontWeight:900, color:interp.color }}>{interp.label}</div>
                  <div style={{ marginLeft:"auto", fontSize:"0.65rem", fontWeight:700, color:interp.color, background:`${interp.color}18`, padding:"2px 8px", borderRadius:6 }}>{score}{activeMeasure.unit}</div>
                </div>
                <div style={{ fontSize:"0.74rem", color:"#1a1025", lineHeight:1.65 }}>{interp.text}</div>
                {activeMeasure.mcid && (
                  <div style={{ marginTop:7, fontSize:"0.62rem", color:"#7e6a9a", display:"flex", alignItems:"center", gap:5 }}>
                    <span>📏 MCID = {activeMeasure.mcid}{activeMeasure.unit}</span>
                    <span style={{ color:"#3a5070" }}>— minimum change needed to be clinically meaningful</span>
                  </div>
                )}
              </div>
            )}

            {/* Normal values reference */}
            {activeMeasure.normalRange && (
              <div style={{ padding:"8px 12px", background:"rgba(0,229,255,0.05)", border:"1px solid rgba(0,229,255,0.15)", borderRadius:8, marginBottom:12, fontSize:"0.65rem", color:"#7e6a9a" }}>
                📊 <span style={{ color:"#00e5ff", fontWeight:700 }}>Normal / Asymptomatic:</span> {activeMeasure.normalRange}
              </div>
            )}

            {/* MCID progress from last session */}
            {change !== null && (
              <div style={{ padding:"11px 13px", background:"rgba(127,90,240,0.07)", border:"1px solid rgba(127,90,240,0.2)", borderRadius:10, marginBottom:14 }}>
                <div style={{ fontSize:"0.58rem", fontWeight:700, color:"#7f5af0", textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>📈 Change vs Last Saved Session</div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontSize:"1.3rem", fontWeight:900, color: isImproved(activeMeasure.id,change)?"#00c97a":"#ff4d6d", fontFamily:"monospace" }}>
                      {change > 0 ? "+" : ""}{Math.round(change * 10) / 10}{activeMeasure.unit}
                    </div>
                    <div style={{ fontSize:"0.58rem", color:"#7e6a9a" }}>S{sessions.length}: {prev}{activeMeasure.unit} → now: {score}{activeMeasure.unit}</div>
                  </div>
                  <div style={{ flex:1, padding:"6px 10px", background: Math.abs(change)>=mcid?(isImproved(activeMeasure.id,change)?"rgba(0,201,122,0.1)":"rgba(255,77,109,0.1)"):"rgba(255,179,0,0.08)", border:`1px solid ${Math.abs(change)>=mcid?(isImproved(activeMeasure.id,change)?"rgba(0,201,122,0.3)":"rgba(255,77,109,0.3)"):"rgba(255,179,0,0.25)"}`, borderRadius:8, fontSize:"0.65rem", color:Math.abs(change)>=mcid?(isImproved(activeMeasure.id,change)?"#00c97a":"#ff4d6d"):"#ffb300", fontWeight:700 }}>
                    {Math.abs(change) >= mcid
                      ? (isImproved(activeMeasure.id,change) ? "✅ Exceeds MCID — Clinically significant improvement" : "⚠ Exceeds MCID — Clinically significant decline")
                      : `⬤ Below MCID — need ${(mcid - Math.abs(change)).toFixed(1)} more to be clinically significant`}
                  </div>
                </div>
                {history.length >= 2 && (
                  <div style={{ marginTop:10, paddingTop:8, borderTop:"1px solid rgba(127,90,240,0.15)" }}>
                    <Sparkline values={[...history.slice(-5), score]} color="#7f5af0" improved={isImproved(activeMeasure.id,change)}/>
                  </div>
                )}
              </div>
            )}

            {/* Fields */}
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {activeMeasure.fields.map((f, fi) => (
                <div key={f.id} style={{ background:"#f5f0fb", border:"1px solid #d8cce8", borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
                    <span style={{ fontSize:"0.58rem", fontWeight:800, color:col, background:`${col}18`, padding:"1px 6px", borderRadius:4, flexShrink:0 }}>Q{fi+1}</span>
                    <div style={{ fontSize:"0.72rem", fontWeight:600, color:"#1a1025", lineHeight:1.4 }}>{f.label}</div>
                  </div>
                  {renderField(activeMeasure, f)}
                </div>
              ))}
            </div>

            <button onClick={() => setActive(null)} style={{ marginTop:13, width:"100%", padding:"10px", background:"rgba(0,229,255,0.07)", border:"1px solid rgba(0,229,255,0.2)", borderRadius:9, color:"#00e5ff", fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>
              ✓ Done — Collapse
            </button>
          </div>
        );
      })()}

      <div style={{ padding:"8px 12px", background:"#f5f0fb", border:"1px solid #d8cce8", borderRadius:8, fontSize:"0.6rem", color:"#7e6a9a", lineHeight:1.6 }}>
        ⚠ Scores calculated per original validated questionnaire criteria. MCID = Minimum Clinically Important Difference per published literature. Session history persists across browser sessions via localStorage. Use 💾 Save Session after each clinical appointment.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOAP NOTE GENERATOR — Auto-pulls from all assessment data
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// REAL-TIME CLINICAL INTERPRETATION ENGINE
// Rule-based deterministic reasoning — NOT generative AI
// Updates live as any field in any assessment module is filled
// ═══════════════════════════════════════════════════════════════════════════════

function buildClinicalInterpretation(data) {
  const rules = [];
  const get = (...keys) => keys.map(k => String(data[k] || "")).join(" ").toLowerCase();
  const val = (k) => String(data[k] || "").toLowerCase();
  const getArr = (k) => {
    const v = data[k];
    if (Array.isArray(v)) return v.map(x=>String(x).toLowerCase());
    if (typeof v === "string") return v.split("|||").map(x=>x.toLowerCase()).filter(Boolean);
    return [];
  };

  const subj = get("cc_main","cc_location","cc_symptom_type","pa_quality","pa_pattern","agg_activity","agg_movement","sb_morning","sb_night","moi_activity");
  const locArr = getArr("cc_location");
  const loc = locArr.join(" ") + " " + val("cc_main");
  const paQuality = getArr("pa_quality").join(" ");
  const paPattern = getArr("pa_pattern").join(" ");
  const aggAct = getArr("agg_activity").concat(getArr("agg_movement")).join(" ");

  // ── SUBJECTIVE ────────────────────────────────────────────────────────────
  if (loc.includes("neck") || loc.includes("cervical")) {
    if (aggAct.includes("sit") || subj.includes("prolonged") || subj.includes("posture") || subj.includes("headache") || subj.includes("stiff")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Postural Cervical Dysfunction",
        text:"Symptoms suggestive of postural cervical dysfunction with possible upper cervical and cervicothoracic involvement, aggravated by prolonged static posture. Upper trapezius and suboccipital hypertonicity likely contributing." });
    } else if (subj.includes("arm") || subj.includes("radiat") || paQuality.includes("tingle") || paQuality.includes("numb") || paQuality.includes("shoot")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Cervical Radiculopathy Pattern",
        text:"Radiating upper limb symptoms from cervical region suggest possible nerve root irritation or disc pathology. Dermatomal pattern and neurological screening required to confirm level and structure." });
    } else if (loc.includes("neck")) {
      rules.push({ module:"Subjective", confidence:"MOD", tag:"Cervicogenic Complaint",
        text:"Cervical region complaint. Mechanical, inflammatory, and postural origins to be differentiated through physical examination and clinical reasoning." });
    }
  }

  if (loc.includes("back") || loc.includes("lumbar") || loc.includes("lx")) {
    if (aggAct.includes("sit") || aggAct.includes("flex") || aggAct.includes("forward")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Lumbar Discogenic Pattern",
        text:"Aggravation with sitting and flexion-loaded activities suggests discogenic origin. Intradiscal pressure increases with sustained flexion, consistent with lumbar disc involvement. Directional preference assessment (McKenzie) indicated." });
    } else if (aggAct.includes("stand") || aggAct.includes("walk") || aggAct.includes("extens")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Lumbar Facet / Stenotic Pattern",
        text:"Extension-loaded aggravation suggests lumbar facet joint pathology or central stenosis. Neural canal narrowing with extension and weight-bearing is consistent with this pattern." });
    } else {
      rules.push({ module:"Subjective", confidence:"MOD", tag:"Lumbar Musculoskeletal Complaint",
        text:"Lumbar complaint with mechanical pattern. Disc, facet, SIJ, or muscular origin to be differentiated through physical assessment, directional preference, and provocation testing." });
    }
  }

  if (loc.includes("shoulder")) {
    if (aggAct.includes("overhead") || aggAct.includes("reach") || subj.includes("arc")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Subacromial Impingement Pattern",
        text:"Overhead and reaching aggravation with possible painful arc suggests subacromial impingement syndrome. Rotator cuff tendinopathy and bursal involvement should be evaluated. Scapular dyskinesis is a common contributing factor." });
    } else if (subj.includes("night") || subj.includes("sleep") || val("sb_night").includes("shoulder")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Shoulder — Capsular / Rotator Cuff Pattern",
        text:"Night pain and sleep disturbance from shoulder suggests possible adhesive capsulitis, rotator cuff tear, or GH arthrosis. End-range capsular pattern assessment and passive ROM to be confirmed on physical examination." });
    }
  }

  if (loc.includes("knee")) {
    if (aggAct.includes("stair") || aggAct.includes("squat") || aggAct.includes("run")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Patellofemoral / Knee Overload Pattern",
        text:"Knee loading with stairs, squatting, and running suggests patellofemoral pain syndrome or chondral pathology. VMO inhibition, patellar maltracking, and hip control deficits are common contributing factors." });
    }
    if (subj.includes("swell") || subj.includes("giving way") || subj.includes("unstable")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Knee Ligamentous / Meniscal Involvement",
        text:"Swelling, giving way, and instability suggest possible ligamentous compromise (ACL/PCL) or meniscal pathology. Traumatic onset and mechanism of injury should be clarified. Special tests (Lachman, McMurray) are critical for differential diagnosis." });
    }
  }

  if (loc.includes("wrist") || loc.includes("hand") || loc.includes("finger")) {
    if (val("sb_night").includes("tingle") || val("sb_night").includes("numb") || paQuality.includes("tingle") || paQuality.includes("numb")) {
      rules.push({ module:"Subjective", confidence:"HIGH", tag:"Carpal Tunnel Syndrome Pattern",
        text:"Nocturnal hand paraesthesia with wrist and hand symptoms strongly suggests carpal tunnel syndrome (median nerve compression). Phalen's test and Tinel's sign are essential. Hypothyroidism and pregnancy are common secondary causes." });
    }
  }

  if (loc.includes("hip")) {
    if (aggAct.includes("sit") || subj.includes("groin") || subj.includes("click")) {
      rules.push({ module:"Subjective", confidence:"MOD", tag:"Hip Intra-Articular Pattern",
        text:"Anterior hip/groin pain aggravated by sitting or flexion activities with possible clicking suggests femoroacetabular impingement (FAI) or labral pathology. FADIR test and clinical hip examination required." });
    }
  }

  if (paPattern.includes("morning") || val("sb_morning").includes(">30 min") || val("sb_morning").includes("prolonged stiff")) {
    rules.push({ module:"Subjective", confidence:"MOD", tag:"Inflammatory Component Suspected",
      text:"Morning stiffness >30 minutes suggests possible inflammatory articular component. Differentials include inflammatory arthritis (RA, AS, PsA). Rheumatological screening may be indicated if persistent or bilateral." });
  }

  if (paQuality.includes("burn") || paQuality.includes("shoot") || paQuality.includes("electric") || paQuality.includes("neuropath") || val("pa_nature").includes("neuropath")) {
    rules.push({ module:"Subjective", confidence:"HIGH", tag:"Neuropathic Pain Quality",
      text:"Burning, shooting, or electric quality pain indicates neuropathic pain mechanism. Peripheral nerve entrapment, nerve root compression, and central sensitisation should be differentiated. Quantitative sensory testing and neural tension assessment indicated." });
  }

  // ── POSTURE ───────────────────────────────────────────────────────────────
  const fhp = val("post_fhp");
  const kyphosis = val("post_kyphosis");
  const lordosis = val("post_lordosis");
  const pelvis = val("post_pelvis");
  const shoulders = val("post_sh");

  const hasPostureDefects = Object.keys(data).some(k => k.startsWith("posture_defect_") && data[k] === true);
  const fhpActive = (fhp && !fhp.includes("normal") && !fhp.includes("--") && fhp !== "") || data["posture_defect_forward_head"];
  const kyphActive = (kyphosis && !kyphosis.includes("normal") && !kyphosis.includes("--") && kyphosis !== "") || data["posture_defect_thoracic_kyphosis"];
  const lordActive = (lordosis && !lordosis.includes("normal") && !lordosis.includes("--") && lordosis !== "") || data["posture_defect_lumbar_hyperlordosis"];
  const pelvActive = (pelvis && pelvis.includes("anterior")) || data["posture_defect_anterior_pelvic_tilt"];
  const scolActive = data["posture_defect_scoliosis"] || val("post_scoliosis").includes("scolio");

  if (fhpActive && kyphActive) {
    rules.push({ module:"Posture", confidence:"HIGH", tag:"Upper Crossed Syndrome",
      text:"Postural findings indicate Upper Crossed Syndrome (Janda): forward head posture combined with thoracic kyphosis suggests anterior muscular tightness (pectorals, SCM, upper trapezius, levator scapulae) with posterior chain inhibition (deep neck flexors, lower trapezius, serratus anterior). Each centimetre of anterior head translation adds ~4.5kg of effective cervical load." });
  } else if (fhpActive) {
    rules.push({ module:"Posture", confidence:"HIGH", tag:"Forward Head Posture",
      text:"Forward head posture noted. Increased cervical compressive load with suboccipital hypertonicity and deep neck flexor inhibition expected. Contributes to cervicogenic headache, TMJ dysfunction, and upper limb neural tension." });
  } else if (kyphActive) {
    rules.push({ module:"Posture", confidence:"MOD", tag:"Thoracic Kyphosis",
      text:"Increased thoracic kyphosis identified. Contributes to restricted shoulder overhead range, altered scapular kinematics, and compensatory cervical and lumbar lordosis. Thoracic extension mobilisation and posterior chain strengthening are primary interventions." });
  }

  if (lordActive && pelvActive) {
    rules.push({ module:"Posture", confidence:"HIGH", tag:"Lower Crossed Syndrome",
      text:"Anterior pelvic tilt with increased lumbar lordosis indicates Lower Crossed Syndrome (Janda): tight hip flexors and lumbar extensors with inhibited gluteals and deep abdominals. Lumbar facet overload, hip flexor restriction, and gluteal inhibition pattern expected." });
  } else if (pelvActive) {
    rules.push({ module:"Posture", confidence:"MOD", tag:"Anterior Pelvic Tilt",
      text:"Anterior pelvic tilt noted. Hip flexor tightness and gluteal inhibition are commonly associated. Increases lumbar compressive forces and facet joint loading. Core motor control retraining and hip flexor flexibility programme indicated." });
  }

  if (scolActive) {
    rules.push({ module:"Posture", confidence:"HIGH", tag:"Scoliotic Deformity",
      text:"Lateral spinal curvature observed. Functional vs. structural scoliosis to be differentiated (Adams forward bend test). Leg length discrepancy and pelvic obliquity should be assessed. Radiological confirmation required for Cobb angle measurement if structural." });
  }

  if (shoulders.includes("protract") || shoulders.includes("elevated") || data["posture_defect_shoulder_protraction"]) {
    rules.push({ module:"Posture", confidence:"MOD", tag:"Scapular Malposition",
      text:"Scapular malposition (protraction/elevation) noted. Indicates serratus anterior inhibition and upper trapezius overactivity. Contributes to reduced subacromial space and altered scapulohumeral rhythm. Scapular stabilisation programme is a primary treatment target." });
  }

  // ── ROM ───────────────────────────────────────────────────────────────────
  const romChecks = [
    ["rom_cx_flex","Cervical Flexion",50],["rom_cx_ext","Cervical Extension",60],
    ["rom_cx_rot_left","Cervical Rotation L",80],["rom_cx_rot_right","Cervical Rotation R",80],
    ["rom_sh_flex_left","Shoulder Flex L",180],["rom_sh_flex_right","Shoulder Flex R",180],
    ["rom_sh_abd_left","Shoulder Abd L",180],["rom_sh_abd_right","Shoulder Abd R",180],
    ["rom_sh_er_left","Shoulder ER L",90],["rom_sh_er_right","Shoulder ER R",90],
    ["rom_hip_flex_left","Hip Flex L",120],["rom_hip_flex_right","Hip Flex R",120],
    ["rom_kn_flex_left","Knee Flex L",140],["rom_kn_flex_right","Knee Flex R",140],
    ["rom_ank_df_left","Ankle DF L",20],["rom_ank_df_right","Ankle DF R",20],
    ["lx_flex","Lumbar Flex",80],["lx_ext","Lumbar Ext",25],
    ["lx_lat_left","Lumbar Lat Flex L",35],["lx_lat_right","Lumbar Lat Flex R",35],
    ["lx_rot_left","Lumbar Rot L",45],["lx_rot_right","Lumbar Rot R",45],
    ["lx_slr_left","SLR L",70],["lx_slr_right","SLR R",70],
  ];
  const romSevere = [], romMild = [];
  romChecks.forEach(([key, label, norm]) => {
    const v = parseFloat(data[key]);
    if (!isNaN(v) && v > 0) {
      const pct = v / norm * 100;
      if (pct < 50) romSevere.push(`${label} ${v}°/${norm}°`);
      else if (pct < 80) romMild.push(`${label} ${v}°/${norm}°`);
    }
  });

  if (romSevere.length > 0) {
    rules.push({ module:"ROM", confidence:"HIGH", tag:"Significant Mobility Restriction",
      text:`Significant ROM restriction (>50% loss): ${romSevere.join("; ")}. Findings indicate substantial capsular, articular, or myofascial limitation. Pain behaviour, end-feel, and pattern of restriction guide differential diagnosis (capsular pattern vs. non-capsular).` });
  }
  if (romMild.length > 0) {
    rules.push({ module:"ROM", confidence:"MOD", tag:"Mild ROM Limitation",
      text:`Mild restriction (20–50% loss): ${romMild.join("; ")}. Early-stage restriction pattern — myofascial tightness, early capsular adhesion, or movement-related guarding. Monitor and correlate with pain behaviour.` });
  }

  // Check SLR specifically for neural tension
  const slrL = parseFloat(data["lx_slr_left"]);
  const slrR = parseFloat(data["lx_slr_right"]);
  if ((!isNaN(slrL) && slrL < 60) || (!isNaN(slrR) && slrR < 60)) {
    rules.push({ module:"ROM", confidence:"HIGH", tag:"Reduced SLR — Neural Tension",
      text:`SLR reduced (${!isNaN(slrL)?`L ${slrL}°`:""}${!isNaN(slrR)?` R ${slrR}°`:""} — normal >70°). Limited SLR indicates sciatic nerve mechanosensitivity, L4/L5/S1 nerve root irritation, or hamstring restriction. Sensitising manoeuvres (ankle DF, neck flex) differentiate neural vs. muscular limitation.` });
  }

  // ── MMT / MUSCLE WEAKNESS ──────────────────────────────────────────────────
  const mmtText = Object.keys(data).filter(k => k.startsWith("mmt_")).map(k => `${k}:${String(data[k]||"")}`).join(" ").toLowerCase();
  const myoText = Object.keys(data).filter(k => k.startsWith("myo_")).map(k => `${k}:${String(data[k]||"")}`).join(" ").toLowerCase();
  const neuroMotor = val("neuro_motor") + " " + mmtText + " " + myoText;
  const mmtNotes = val("mmt_notes") + " " + val("mmt_findings");

  const gluteWeak = mmtText.includes("glute") || neuroMotor.includes("hip abduct") || mmtNotes.includes("glute");
  const coreWeak = mmtText.includes("core") || mmtText.includes("abdom") || neuroMotor.includes("core") || mmtNotes.includes("core");
  const dnfWeak = mmtText.includes("neck flex") || mmtNotes.includes("deep neck") || mmtNotes.includes("dnf");
  const rcWeak = mmtText.includes("supraspinatus") || mmtText.includes("infraspinatus") || mmtText.includes("rotator") || mmtNotes.includes("rotator cuff");
  const quadWeak = mmtText.includes("quad") || neuroMotor.includes("quad") || mmtNotes.includes("quad");

  // Check for numeric weakness in MMT fields
  const hasNumericWeakness = Object.keys(data).filter(k => k.startsWith("mmt_")).some(k => {
    const v = String(data[k]||"");
    return v.match(/^[1-4]/) || v.includes("4-") || v.includes("4+/5") || v.includes("3/5") || v.includes("weak");
  });
  const myoWeakness = Object.keys(data).filter(k => k.startsWith("myo_")).some(k => {
    const v = String(data[k]||"");
    return v && !v.startsWith("5") && v.match(/[1-4]/);
  });

  if (gluteWeak && coreWeak) {
    rules.push({ module:"MMT", confidence:"HIGH", tag:"Lumbopelvic Stabiliser Deficit",
      text:"Hip abductor and core stabiliser weakness indicates lumbopelvic instability syndrome. Combined gluteus medius and transversus abdominis/multifidus deficit impairs frontal and sagittal plane pelvic control during all functional loading activities including gait, stairs, and sport." });
  } else if (gluteWeak) {
    rules.push({ module:"MMT", confidence:"HIGH", tag:"Hip Abductor Weakness",
      text:"Gluteus medius weakness compromises frontal plane pelvic stability. Trendelenburg sign, contralateral pelvic drop, ipsilateral trunk lateral flexion (compensated Trendelenburg), and increased knee valgus during single-leg loading are expected clinical findings." });
  }
  if (coreWeak) {
    rules.push({ module:"MMT", confidence:"HIGH", tag:"Core Stabiliser Deficit",
      text:"Deep core musculature weakness (transversus abdominis, multifidus) reduces segmental lumbar stability. Increased intervertebral shear during loaded functional tasks contributes to pain and dysfunction. Motor control retraining using staged activation protocols is the primary intervention." });
  }
  if (dnfWeak) {
    rules.push({ module:"MMT", confidence:"HIGH", tag:"Deep Neck Flexor Inhibition",
      text:"Deep neck flexor inhibition (longus colli/capitis) allows superficial flexor dominance (SCM, scalenes), perpetuating forward head posture. This pattern is associated with cervicogenic headache, neck pain, and altered cervical proprioception. Cranio-cervical flexion test retraining is the gold-standard intervention." });
  }
  if (rcWeak) {
    rules.push({ module:"MMT", confidence:"HIGH", tag:"Rotator Cuff Weakness",
      text:"Rotator cuff weakness compromises glenohumeral head depression and dynamic joint centration. Superior humeral head migration during elevation is expected, reducing subacromial space and contributing to impingement. External rotation strengthening and scapular stabilisation are treatment priorities." });
  }
  if (quadWeak) {
    rules.push({ module:"MMT", confidence:"MOD", tag:"Quadriceps Inhibition",
      text:"Quadriceps weakness noted. Arthrogenic muscle inhibition from intra-articular effusion or pain is a common cause in the knee. VMO inhibition specifically compromises patellar tracking. Neuromuscular electrical stimulation and motor control progression may be required." });
  }
  if (myoWeakness && !gluteWeak && !coreWeak && !dnfWeak && !rcWeak && !quadWeak) {
    rules.push({ module:"MMT", confidence:"MOD", tag:"Myotomal Weakness Noted",
      text:"Myotomal weakness identified in neurological examination. Correlate with dermatomal sensory changes, reflex findings, and special test results to identify specific nerve root level of involvement." });
  }

  // ── SPECIAL TESTS ─────────────────────────────────────────────────────────
  const allData = Object.keys(data);
  const stKeys = allData.filter(k => k.startsWith("st_") || (k.startsWith("lx_") && !k.startsWith("lx_palpation")));
  const posTests = stKeys.filter(k => String(data[k]).toLowerCase().includes("positive"));

  const hasTest = (...names) => posTests.some(k => names.some(n => k.includes(n)));

  // Shoulder cluster
  const hawkins = hasTest("hawkins");
  const neer = hasTest("neer");
  const painArc = hasTest("arc","painful_arc");
  const emptycan = hasTest("empty_can","emptycan","empty can");
  const speedTest = hasTest("speed");
  const laprub = hasTest("o_brien","laprub","lapr");

  if (hawkins && neer && painArc) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Subacromial Impingement — Full Cluster Positive",
      text:"Hawkins-Kennedy + Neer + Painful Arc all positive: complete subacromial impingement test cluster confirmed. High specificity for subacromial space pathology. Rotator cuff tendinopathy vs. bursal impingement to be differentiated by injection response and imaging." });
  } else if (hawkins && neer) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Subacromial Impingement Confirmed",
      text:"Hawkins-Kennedy and Neer tests positive: combined cluster specificity >80% for subacromial impingement. Rotator cuff strengthening, subacromial space optimisation, and postural correction are first-line interventions." });
  } else if (hawkins || neer) {
    rules.push({ module:"Special Tests", confidence:"MOD", tag:"Subacromial Impingement Suspected",
      text:"Positive impingement sign (Hawkins or Neer). Complete the cluster with painful arc and strength testing for diagnostic confirmation." });
  }
  if (emptycan) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Supraspinatus Pathology",
      text:"Positive empty can (Jobe) test suggests supraspinatus tendon involvement (sensitivity 69%, specificity 66%). Combined with impingement signs and external rotation lag sign for rotator cuff tear differentiation." });
  }

  // ACL/knee cluster
  const lachman = hasTest("lachman");
  const antDrawer = hasTest("anterior_drawer","ant_drawer");
  const pivotShift = hasTest("pivot");
  const mcmurray = hasTest("mcmurray");
  const apley = hasTest("apley");
  const valgusStress = hasTest("valgus_stress","valgus stress");
  const varusStress = hasTest("varus_stress","varus stress");

  if (lachman && antDrawer) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"ACL Rupture — High Probability",
      text:"Positive Lachman + anterior drawer: combined sensitivity >95% for ACL rupture. Orthopaedic referral and MRI are indicated for confirmation and surgical planning. Conservative ACL rehabilitation protocol to begin while awaiting imaging." });
  } else if (lachman) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"ACL Involvement Likely",
      text:"Positive Lachman test (sensitivity 86%, specificity 91%) — most sensitive clinical test for ACL disruption. Complete the cluster with pivot shift and anterior drawer. MRI confirmation indicated." });
  }
  if (mcmurray || apley) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Meniscal Pathology",
      text:"Positive McMurray or Apley test indicates possible meniscal tear. Medial vs. lateral tear differentiated by tibial rotation direction. MRI is gold standard for confirmation. Early physiotherapy management focuses on effusion control and quadriceps reactivation." });
  }
  if (valgusStress) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"MCL Insufficiency",
      text:"Positive valgus stress test indicates medial collateral ligament insufficiency. Grade I–III differentiation based on laxity and end-feel. MCL tears are typically managed conservatively with bracing and progressive loading." });
  }

  // Lumbar cluster
  const slump = hasTest("slump");
  const slr = hasTest("slr","straight_leg");
  const kemp = hasTest("kemp");
  const prone_instab = hasTest("prone_instab","prone instab");
  const femStretch = hasTest("femoral_stretch","prone_knee","femstr");

  if (slump && slr) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Neural Tension — Complete Cluster",
      text:"Positive Slump and SLR tests confirm sciatic nerve mechanosensitivity. The combined cluster is highly specific for L4/L5/S1 nerve root irritation or adverse neural tension. Dermatomal correlation identifies disc level. Neural mobilisation is a key treatment strategy." });
  } else if (slump || slr) {
    rules.push({ module:"Special Tests", confidence:"MOD", tag:"Neural Tension Positive",
      text:"Positive neural tension test (Slump or SLR). Complete the cluster for diagnostic confirmation. Neural mobilisation and position of ease strategies are indicated." });
  }
  if (kemp) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Lumbar Facet Compression Sign",
      text:"Positive Kemp test reproducing localised or referred pain: indicates lumbar facet joint or lateral canal stenosis involvement. Extension and ipsilateral lateral flexion loading pattern supports facet origin." });
  }
  if (prone_instab) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Segmental Lumbar Instability",
      text:"Positive prone instability test confirms symptomatic segmental lumbar instability. Deep stabiliser retraining (transversus abdominis, multifidus co-contraction) is the primary evidence-based intervention." });
  }
  if (femStretch) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Upper Lumbar / Femoral Nerve Tension",
      text:"Positive prone knee bend or femoral nerve stretch indicates L2/L3/L4 nerve root irritation or upper lumbar disc pathology. Anterior thigh symptoms and quadriceps weakness complete the clinical picture." });
  }

  // Cervical cluster
  const spurling = hasTest("spurling");
  const distract = hasTest("distraction");
  const vbi = posTests.some(k => k.includes("vbi") || k.includes("vertebral_artery"));
  const sharpPurser = posTests.some(k => k.includes("sharp_purser") || k.includes("sharp purser"));

  if (spurling && distract) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Cervical Radiculopathy Cluster Confirmed",
      text:"Spurling positive (symptoms reproduced) + distraction positive (symptom relief): specificity >90% for cervical nerve root compression. ICD-10: M54.1. Imaging confirmation and management planning required. Neural mobilisation, cervical traction, and segmental mobilisation are evidence-based treatments." });
  } else if (spurling) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Cervical Nerve Root Compression",
      text:"Positive Spurling test (specificity 92–93%) indicates foraminal compression of the cervical nerve root. Correlate with dermatomes, myotomes, and reflexes to identify level (C5: deltoid/biceps, C6: wrist ext/brachioradialis, C7: triceps/wrist flex, C8: finger flex)." });
  }
  if (vbi) {
    rules.push({ module:"Special Tests", confidence:"URGENT", tag:"⚠️ VBI Screen POSITIVE — Contraindication",
      text:"VBI / vertebral artery screening POSITIVE. ABSOLUTE CONTRAINDICATION to cervical manipulation or high-velocity thrust techniques. Vertebrobasilar insufficiency requires urgent medical review before further cervical intervention. Document clearly and refer." });
  }
  if (sharpPurser) {
    rules.push({ module:"Special Tests", confidence:"URGENT", tag:"⚠️ C1/C2 Instability — URGENT",
      text:"Sharp-Purser test positive indicates atlantoaxial (C1/C2) instability. URGENT referral to spinal surgeon or emergency department. No manual therapy to cervical spine. Immobilise if necessary. Rule out rheumatoid arthritis, Down syndrome, trauma." });
  }

  // Hip cluster
  const fadir = hasTest("fadir");
  const faber = hasTest("faber");
  const ober = hasTest("ober");
  const trendeTest = hasTest("trendelenburg");
  const thomasTest = hasTest("thomas","ilt_thomas");

  if (fadir) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"FAI / Labral Pathology",
      text:"Positive FADIR test (sensitivity 78%, specificity 56%) indicates femoroacetabular impingement or acetabular labral tear. Anterior hip/groin pain in flexion-adduction-internal rotation is the hallmark finding. MR arthrogram is gold standard for labral tear confirmation." });
  }
  if (faber) {
    rules.push({ module:"Special Tests", confidence:"MOD", tag:"SIJ / Hip Joint Involvement",
      text:"Positive FABER test indicates sacroiliac joint or hip joint involvement. For SIJ specificity, combine with Gaenslen, thigh thrust, and SIJ distraction tests (cluster of ≥3 positive has sensitivity 85%, specificity 79%)." });
  }
  if (ober) {
    rules.push({ module:"Special Tests", confidence:"MOD", tag:"IT Band / TFL Tightness",
      text:"Positive Ober test confirms iliotibial band and tensor fascia latae tightness. Common contributor to lateral knee pain (IT band syndrome) and hip abductor movement dysfunction. Foam rolling, hip strengthening, and biomechanical correction are primary interventions." });
  }

  // Wrist/CTS
  const phalen = hasTest("phalen");
  const tinel = hasTest("tinel");
  if (phalen && tinel) {
    rules.push({ module:"Special Tests", confidence:"HIGH", tag:"Carpal Tunnel Syndrome Confirmed",
      text:"Positive Phalen and Tinel signs confirm median nerve compression at carpal tunnel. Combined cluster specificity 73%. Night splinting in neutral, nerve gliding exercises, ergonomic assessment, and activity modification are first-line conservative management." });
  } else if (phalen || tinel) {
    rules.push({ module:"Special Tests", confidence:"MOD", tag:"Carpal Tunnel Syndrome Suspected",
      text:"Single positive CTS test (Phalen or Tinel). Complete the cluster and assess thenar atrophy and grip strength. Electrodiagnostic studies confirm diagnosis and severity." });
  }

  // ── NEUROLOGICAL ───────────────────────────────────────────────────────────
  const neuroSens = val("neuro_sensation");
  const neuroRef = val("neuro_reflex");
  const neuroMot = val("neuro_motor");
  const neuroDerm = val("neuro_dermatomal");
  const neuroTens = val("neuro_tension");

  const hasBabinski = Object.keys(data).some(k => k.includes("babinski") && String(data[k]).toLowerCase().includes("positive"));
  const hasHoffmann = Object.keys(data).some(k => k.includes("hoffmann") && String(data[k]).toLowerCase().includes("positive"));

  if (hasBabinski || hasHoffmann) {
    rules.push({ module:"Neurology", confidence:"URGENT", tag:"⚠️ Upper Motor Neuron — URGENT REFERRAL",
      text:"PATHOLOGICAL REFLEX POSITIVE (Babinski/Hoffmann). Upper motor neuron lesion above segmental level. Urgent exclusion of cervical myelopathy, spinal cord compression, stroke, or intracranial pathology required. REFER IMMEDIATELY. Do not proceed with spinal manipulation." });
  }

  const neuroAll = [neuroSens, neuroRef, neuroMot, neuroDerm, neuroTens].join(" ");
  if (neuroAll.includes("reduced") || neuroAll.includes("absent") || neuroAll.includes("diminish") || neuroAll.includes("impaired")) {
    rules.push({ module:"Neurology", confidence:"HIGH", tag:"Peripheral Neurological Deficit",
      text:"Reduced or absent sensation, reflexes, or myotomal strength indicates peripheral nerve root compromise. Correlation of dermatome, myotome, and reflex findings identifies specific nerve root level and guides targeted assessment and imaging request." });
  }

  if (neuroAll.includes("bilateral") || neuroAll.includes("both")) {
    rules.push({ module:"Neurology", confidence:"HIGH", tag:"Bilateral Neurological Signs",
      text:"Bilateral neurological findings suggest central (spinal cord or canal) pathology rather than single nerve root. Differential diagnoses include spinal stenosis, myelopathy, cauda equina syndrome, or central disc herniation. Urgent imaging indicated." });
  }

  if (neuroDerm.includes("saddle") || val("cc_main").includes("saddle") || val("rf_cauda").includes("cauda")) {
    rules.push({ module:"Neurology", confidence:"URGENT", tag:"⚠️ Cauda Equina Syndrome — EMERGENCY",
      text:"CAUDA EQUINA SYNDROME INDICATORS PRESENT. Saddle anaesthesia and/or bladder/bowel dysfunction with lumbar symptoms. EMERGENCY referral to Emergency Department. Do not delay. MRI lumbar spine urgent." });
  }

  // ── GAIT ───────────────────────────────────────────────────────────────────
  const gaitText = val("gait_pattern") + " " + val("gait_obs") + " " + val("gait_notes") + " " + getArr("gait_deviations").join(" ");
  if (gaitText.includes("trendelenburg") || gaitText.includes("pelvic drop") || gaitText.includes("hip abduct")) {
    rules.push({ module:"Gait", confidence:"HIGH", tag:"Trendelenburg Gait — Hip Abductor Insufficiency",
      text:"Trendelenburg sign or pelvic drop during single-limb stance indicates gluteus medius insufficiency on the stance limb. Creates contralateral pelvic drop, ipsilateral trunk lean (compensation), increased lumbar lateral flexion moment, and ipsilateral knee valgus during loading response." });
  }
  if (gaitText.includes("antalgic") || gaitText.includes("limp") || gaitText.includes("short") && gaitText.includes("stance")) {
    rules.push({ module:"Gait", confidence:"HIGH", tag:"Antalgic Gait Pattern",
      text:"Antalgic gait with shortened stance phase on the painful limb. Pain-avoidance mechanism reduces loading on the symptomatic structure. Articular, osseous, or acute soft tissue pathology should be considered. Quantitative load distribution assessment is indicated." });
  }
  if (gaitText.includes("valgus") || gaitText.includes("pronation") || gaitText.includes("foot")) {
    rules.push({ module:"Gait", confidence:"MOD", tag:"Lower Limb Kinetic Chain Deviation",
      text:"Foot pronation or knee valgus during gait loading phase indicates lower kinetic chain dysfunction. Hip control deficit, tibialis posterior weakness, and altered arch mechanics contribute. Functional foot orthosis and hip stabilisation programme are commonly combined interventions." });
  }
  if (gaitText.includes("foot drop") || gaitText.includes("steppage")) {
    rules.push({ module:"Gait", confidence:"HIGH", tag:"Foot Drop / Steppage Gait",
      text:"Foot drop (steppage gait) indicates L4/5 nerve root involvement or common peroneal nerve palsy. Urgent neurological investigation required. Ankle-foot orthosis (AFO) may be required for safe ambulation." });
  }

  // ── FUNCTIONAL MOVEMENT ────────────────────────────────────────────────────
  const fmaText = val("fma_squat") + " " + val("fma_notes") + " " + val("fma_movement") + " " + val("functional_notes");
  if (fmaText.includes("valgus") || fmaText.includes("knee in")) {
    rules.push({ module:"Functional", confidence:"HIGH", tag:"Dynamic Knee Valgus",
      text:"Knee valgus during loaded movement (squat, lunge, landing) indicates lower kinetic chain instability: hip abductor/external rotator weakness, limited hip mobility, and foot pronation all contribute. Increases patellofemoral, medial compartment, and ACL loading. Functional retraining is primary treatment." });
  }
  if (fmaText.includes("forward lean") || fmaText.includes("trunk") || fmaText.includes("bend forward")) {
    rules.push({ module:"Functional", confidence:"MOD", tag:"Excessive Trunk Flexion — Movement Fault",
      text:"Excessive anterior trunk lean during functional movement suggests limited ankle dorsiflexion, hip mobility restriction, or compensatory strategy for weak extensors. Ankle, hip, and thoracic mobility should be assessed and addressed in the movement retraining programme." });
  }
  if (fmaText.includes("asymmet") || fmaText.includes("left more") || fmaText.includes("right more")) {
    rules.push({ module:"Functional", confidence:"MOD", tag:"Functional Movement Asymmetry",
      text:"Asymmetric movement pattern noted during functional assessment. Neuromuscular control, mobility, or loading tolerance difference between sides. FMS composite score and specific pattern scoring guides treatment prioritisation." });
  }

  // ── PALPATION ──────────────────────────────────────────────────────────────
  const palpText = val("palp_tenderness") + " " + val("palp_tone") + " " + val("palp_swelling") + " " + val("palp_notes") + " " + val("lx_palpation");
  if (palpText.includes("trigger") || palpText.includes("hypertonic") || (palpText.includes("tender") && (palpText.includes("+++") || palpText.includes("++")))) {
    rules.push({ module:"Palpation", confidence:"MOD", tag:"Myofascial Trigger Points",
      text:"Hypertonic muscle with local tenderness ± referred pain pattern consistent with active myofascial trigger points. Dry needling, ischaemic compression, and neuromuscular inhibition are evidence-based interventions. Address contributing biomechanical factors to prevent recurrence." });
  }
  if (palpText.includes("swell") || palpText.includes("effusion") || palpText.includes("oedema")) {
    rules.push({ module:"Palpation", confidence:"HIGH", tag:"Joint Effusion / Swelling",
      text:"Swelling or effusion detected. Arthrogenic muscle inhibition of surrounding musculature is expected — particularly significant for quadriceps inhibition with knee effusion (even small amounts suppress VMO). PRICE, effusion management, and gradual loading are priorities." });
  }

  // ── CROSS-MODULE CORRELATIONS ──────────────────────────────────────────────
  // Cervical postural dysfunction cluster
  if (fhpActive && dnfWeak && romMild.some(r => r.includes("Cervical"))) {
    rules.push({ module:"Correlation", confidence:"HIGH", tag:"Cervical Postural Dysfunction Cluster",
      text:"CORRELATED: Forward head posture + deep neck flexor inhibition + cervical ROM restriction = Cervical postural dysfunction syndrome. Address motor control (deep neck flexor retraining), postural correction, and cervical mobility simultaneously. Cranio-cervical flexion test is the assessment and retraining tool of choice." });
  }

  // Lower kinetic chain instability cluster
  const hasKneeValgus = fmaText.includes("valgus") || gaitText.includes("valgus");
  if (hasKneeValgus && gluteWeak) {
    rules.push({ module:"Correlation", confidence:"HIGH", tag:"Lower Kinetic Chain Instability Cluster",
      text:"CORRELATED: Dynamic knee valgus + gluteus medius weakness = Lower kinetic chain instability. This pattern predisposes to patellofemoral pain syndrome, IT band syndrome, and ACL injury risk. Proximal hip strengthening, neuromuscular retraining, and functional biomechanical correction are the combined treatment approach." });
  }

  // Shoulder impingement full cluster
  if ((hawkins || neer) && rcWeak && painArc) {
    rules.push({ module:"Correlation", confidence:"HIGH", tag:"Shoulder Impingement Syndrome — Full Clinical Cluster",
      text:"CORRELATED: Positive impingement tests + rotator cuff weakness + painful arc = Complete subacromial impingement syndrome. Evidence-based management: rotator cuff strengthening (ER focus), scapular stabilisation (lower trapezius, serratus anterior), subacromial space optimisation, and postural retraining." });
  }

  // Neural tension + lumbar disc pattern
  if ((slump || slr) && (romMild.some(r=>r.includes("Lumbar")) || romSevere.some(r=>r.includes("Lumbar")))) {
    rules.push({ module:"Correlation", confidence:"HIGH", tag:"Lumbar Disc / Neural Compression Cluster",
      text:"CORRELATED: Positive neural tension tests + restricted lumbar ROM = Lumbar disc pathology with nerve root involvement. Neural mobilisation (slider/tensioner progressions), directional preference loading, postural correction, and graduated activity restoration are the evidence-based management priorities." });
  }

  return rules;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REAL-TIME SOAP BUILDER
// Pulls from ALL assessment data fields and auto-populates S, O, A, P in real time
// ═══════════════════════════════════════════════════════════════════════════════

function buildRealtimeSOAP(data, extraS="", extraO="", extraA="", extraP="") {
  const v = (k) => String(data[k] || "").trim();
  const a = (k) => {
    const x = data[k];
    if (Array.isArray(x)) return x.filter(Boolean).join(", ");
    if (typeof x === "string") return x.split("|||").filter(Boolean).join(", ");
    return String(x || "");
  };
  const has = (k) => !!(data[k] && String(data[k]).trim() && String(data[k]).trim() !== "");
  const nrs = (k) => { const n = parseFloat(v(k)); return isNaN(n) ? null : n; };

  // ── S: SUBJECTIVE ──────────────────────────────────────────────────────────
  const S_parts = [];
  const name = v("dem_name");
  const age = v("dem_age");
  const sex = v("dem_sex") || v("dem_gender");
  const occ = v("dem_occupation");
  const cc = v("cc_main");
  const location = a("cc_location");
  const radiation = a("cc_radiation");
  const symType = a("cc_symptom_type");
  const duration = a("cc_duration");
  const onset = a("cc_onset");
  const moiType = a("moi_type");
  const moiActivity = v("moi_activity");
  const vasNow = nrs("pa_vas_now");
  const vasWorst = nrs("pa_vas_worst");
  const vasBest = nrs("pa_vas_best");
  const painQ = a("pa_quality");
  const painNature = a("pa_nature");
  const painPatt = a("pa_pattern");
  const agg = [a("agg_activity"), a("agg_movement")].filter(Boolean).join(", ");
  const ease = [a("rel_posture"), a("rel_manual")].filter(Boolean).join(", ");
  const morningBx = a("sb_morning");
  const nightBx = a("sb_night");
  const phx = a("phx_conditions");
  const meds = v("meds_current");
  const allergies = v("allergy_drug") || v("allergy_other");
  const goals = [v("ar_goal_function"), v("ar_goal_pain"), v("ar_goal_return"), v("ar_goal_sport")].filter(Boolean);
  const workStatus = v("dem_work_status");

  // Opening demographics
  let intro = "";
  if (name) {
    intro += `${name}`;
    const demo = [age && `${age}y`, sex, occ && `occupation: ${occ}`, workStatus && workStatus !== "" && workStatus !== name && `status: ${workStatus}`].filter(Boolean);
    if (demo.length) intro += ` (${demo.join(", ")})`;
  } else {
    intro += "Patient";
  }
  intro += " presents";
  if (cc) {
    intro += ` with: "${cc}"`;
  } else if (location) {
    intro += ` with complaints in the ${location} region`;
  } else {
    intro += " for physiotherapy assessment";
  }
  S_parts.push(intro + ".");

  const detail = [];
  if (location && cc) detail.push(`Pain location: ${location}`);
  if (radiation && !radiation.includes("No radiation")) detail.push(`Radiation: ${radiation}`);
  if (symType) detail.push(`Symptoms: ${symType}`);
  if (duration || onset) detail.push(`Duration: ${duration || "unspecified"}. Onset: ${onset || "unspecified"}`);
  if (moiType || moiActivity) detail.push(`Mechanism: ${[moiActivity, moiType].filter(Boolean).join(" — ")}`);
  if (detail.length) S_parts.push(detail.join(". ") + ".");

  if (vasNow !== null || vasWorst !== null || vasBest !== null) {
    S_parts.push(`Pain scores (NRS): Current ${vasNow !== null ? vasNow : "—"}/10 | Worst ${vasWorst !== null ? vasWorst : "—"}/10 | Best ${vasBest !== null ? vasBest : "—"}/10.`);
  }
  const qualParts = [painQ, painNature].filter(Boolean);
  if (qualParts.length) S_parts.push(`Pain quality: ${qualParts.join("; ")}.`);
  if (painPatt) S_parts.push(`Behaviour: ${painPatt}.`);
  if (agg) S_parts.push(`Aggravating: ${agg}.`);
  if (ease) S_parts.push(`Easing: ${ease}.`);
  if (morningBx) S_parts.push(`Morning: ${morningBx}.`);
  if (nightBx) S_parts.push(`Night: ${nightBx}.`);
  if (phx) S_parts.push(`Past medical history: ${phx}.`);
  if (meds) S_parts.push(`Medications: ${meds}.`);
  if (allergies) S_parts.push(`Allergies/precautions: ${allergies}.`);

  // Red flags
  const rfFlags = [];
  const rfMap = {
    s_red1:"Unexplained weight loss", s_red2:"Night sweats/fever", s_red3:"Cancer history",
    s_red4:"Bilateral neural symptoms", s_red5:"Bowel/bladder dysfunction",
    s_red6:"Saddle anaesthesia", s_red7:"Progressive neuro deficit",
    rf_malignancy:"Malignancy screen", rf_cauda:"Cauda equina symptoms",
    rf_vascular:"Vascular red flags", rf_inflammatory:"Inflammatory markers",
    rf_fracture:"Fracture risk", rf_neuro:"Neurological red flags"
  };
  Object.entries(rfMap).forEach(([k,label]) => {
    const val2 = String(data[k]||"").toLowerCase();
    if (val2 && !val2.includes("no ") && !val2.includes("no red flag") && !val2.includes("negative") && !val2.includes("proceed")) {
      rfFlags.push(label);
    }
  });
  if (rfFlags.length) S_parts.push(`⚠ RED FLAGS IDENTIFIED: ${rfFlags.join(", ")} — medical review indicated.`);

  if (goals.length) S_parts.push(`Patient goals: ${goals.join("; ")}.`);
  if (extraS) S_parts.push(extraS);

  // ── O: OBJECTIVE ──────────────────────────────────────────────────────────
  const O_parts = [];

  // Posture / Observation
  const postureD = [];
  Object.values(typeof POSTURE_DEFECTS !== "undefined" ? POSTURE_DEFECTS : {}).forEach(d => {
    if (data[`posture_defect_${d.id}`]) postureD.push(d.label);
  });
  const postureManual = [
    v("post_fhp") && v("post_fhp") !== "--" && `FHP: ${v("post_fhp")}`,
    v("post_kyphosis") && v("post_kyphosis") !== "--" && `Thoracic kyphosis: ${v("post_kyphosis")}`,
    v("post_lordosis") && v("post_lordosis") !== "--" && `Lumbar lordosis: ${v("post_lordosis")}`,
    v("post_pelvis") && v("post_pelvis") !== "--" && `Pelvic position: ${v("post_pelvis")}`,
    v("post_sh") && v("post_sh") !== "--" && `Shoulder level: ${v("post_sh")}`,
    v("post_scoliosis") && v("post_scoliosis") !== "--" && `Scoliosis: ${v("post_scoliosis")}`,
  ].filter(Boolean);
  const allPosture = [...postureD, ...postureManual];
  if (allPosture.length) O_parts.push(`Observation/Posture: ${allPosture.join("; ")}.`);

  // Palpation
  const palpParts = [
    v("lx_palpation"), v("palp_tenderness") && `Tenderness: ${v("palp_tenderness")}`,
    v("palp_tone") && `Tone: ${v("palp_tone")}`,
    v("palp_swelling") && `Swelling: ${v("palp_swelling")}`,
    v("palp_temp") && `Temperature: ${v("palp_temp")}`,
    v("palp_crepitus") && `Crepitus: ${v("palp_crepitus")}`,
  ].filter(Boolean);
  if (palpParts.length) O_parts.push(`Palpation: ${palpParts.join(". ")}.`);

  // ROM
  const romRows = [];
  const romPairs = [
    ["Cervical Flex/Ext","rom_cx_flex","rom_cx_ext","50/60°"],
    ["Cervical Rot L/R","rom_cx_rot_left","rom_cx_rot_right","80/80°"],
    ["Cervical Lat Flex L/R","rom_cx_lat_left","rom_cx_lat_right","45/45°"],
    ["Lumbar Flex/Ext","lx_flex","lx_ext","80/25°"],
    ["Lumbar Lat Flex L/R","lx_lat_left","lx_lat_right","35/35°"],
    ["Lumbar Rot L/R","lx_rot_left","lx_rot_right","45/45°"],
    ["SLR L/R","lx_slr_left","lx_slr_right","70/70°"],
    ["Shoulder Flex L/R","rom_sh_flex_left","rom_sh_flex_right","180/180°"],
    ["Shoulder Abd L/R","rom_sh_abd_left","rom_sh_abd_right","180/180°"],
    ["Shoulder ER L/R","rom_sh_er_left","rom_sh_er_right","90/90°"],
    ["Shoulder IR L/R","rom_sh_ir_left","rom_sh_ir_right","70/70°"],
    ["Elbow Flex L/R","rom_el_flex_left","rom_el_flex_right","145/145°"],
    ["Hip Flex L/R","rom_hip_flex_left","rom_hip_flex_right","120/120°"],
    ["Hip Abd L/R","rom_hip_abd_left","rom_hip_abd_right","45/45°"],
    ["Knee Flex L/R","rom_kn_flex_left","rom_kn_flex_right","140/140°"],
    ["Ankle DF L/R","rom_ank_df_left","rom_ank_df_right","20/20°"],
  ];
  romPairs.forEach(([label, k1, k2, norm]) => {
    const v1 = v(k1), v2 = v(k2);
    if (v1 || v2) romRows.push(`${label}: ${v1||"—"}°/${v2||"—"}° (norm: ${norm})`);
  });
  if (romRows.length) O_parts.push(`Range of Motion:\n  ${romRows.join("\n  ")}`);

  // MMT
  const mmtF = [];
  Object.keys(data).filter(k => k.startsWith("mmt_")).forEach(k => {
    const mv = String(data[k]||"");
    if (mv && !mv.includes("5") || mv.match(/[1-4]/)) {
      const label = k.replace("mmt_","").replace(/_/g," ");
      if (mv.match(/[1-4]/) && !mv.includes("5")) mmtF.push(`${label}: ${mv}/5`);
    }
  });
  if (mmtF.length) O_parts.push(`Muscle Strength (MMT):\n  Deficit noted: ${mmtF.join("; ")}.`);
  if (v("mmt_notes")) O_parts.push(`MMT Notes: ${v("mmt_notes")}.`);

  // Neurological
  const neuroF = [
    v("neuro_sensation") && `Sensation: ${v("neuro_sensation")}`,
    v("neuro_reflex") && `Reflexes: ${v("neuro_reflex")}`,
    v("neuro_motor") && `Motor: ${v("neuro_motor")}`,
    v("neuro_tension") && `Neural tension: ${v("neuro_tension")}`,
    v("neuro_dermatomal") && `Dermatomal: ${v("neuro_dermatomal")}`,
  ].filter(Boolean);
  if (neuroF.length) O_parts.push(`Neurological:\n  ${neuroF.join("\n  ")}.`);

  // Special Tests
  const allStKeys = Object.keys(data).filter(k => k.startsWith("st_") || k.startsWith("lx_kemp") || k.startsWith("lx_slump") || k.startsWith("lx_slr") || k.startsWith("lx_prone"));
  const posTestsList = allStKeys.filter(k => String(data[k]).toLowerCase().includes("positive")).map(k => {
    const label = k.replace("st_","").replace("lx_","").replace(/_/g," ");
    const result = String(data[k]).substring(0,50);
    return `${label} (${result})`;
  });
  const negTestsList = allStKeys.filter(k => String(data[k]).toLowerCase().includes("negative")).map(k => k.replace("st_","").replace("lx_","").replace(/_/g," "));
  if (posTestsList.length || negTestsList.length) {
    const stLines = [];
    if (posTestsList.length) stLines.push(`  Positive: ${posTestsList.join("; ")}`);
    if (negTestsList.length) stLines.push(`  Negative: ${negTestsList.join(", ")}`);
    O_parts.push(`Special Tests:\n${stLines.join("\n")}.`);
  }

  // NKT
  const nktInh = [], nktFac = [];
  if (typeof NKT_REGIONS !== "undefined") {
    Object.values(NKT_REGIONS).forEach(region => region.tests?.forEach(t => {
      const tv = String(data[t.id]||"");
      if (tv === "Inhibited") nktInh.push(t.label);
      else if (tv === "Facilitated") nktFac.push(t.label);
    }));
  }
  if (nktInh.length || nktFac.length) {
    const nktLines = [];
    if (nktInh.length) nktLines.push(`  Inhibited: ${nktInh.join(", ")}`);
    if (nktFac.length) nktLines.push(`  Facilitated: ${nktFac.join(", ")}`);
    O_parts.push(`Neuromuscular (NKT):\n${nktLines.join("\n")}.`);
  }

  // ── NEUROLOGICAL EXAMINATION ───────────────────────────────────────────────
  const neuroLines = [
    v("neuro_sensation")       && `  Sensation:       ${v("neuro_sensation")}`,
    v("neuro_reflex")          && `  Reflexes:        ${v("neuro_reflex")}`,
    v("neuro_motor")           && `  Motor:           ${v("neuro_motor")}`,
    v("neuro_tension")         && `  Neural Tension:  ${v("neuro_tension")}`,
    v("neuro_dermatomal")      && `  Dermatomal:      ${v("neuro_dermatomal")}`,
    v("g_neuro_findings")      && `  Gait Neuro:      ${v("g_neuro_findings")}`,
    v("neuro_clinician_notes") && `  Clinician Notes: ${v("neuro_clinician_notes")}`,
  ].filter(Boolean);
  if (neuroLines.length) {
    O_parts.push(`Neurological Examination:\n${neuroLines.join("\n")}.`);
  }

  // ── BODY CHART ANNOTATIONS ─────────────────────────────────────────────────
  try {
    const annotations = JSON.parse(data.body_chart_annotations || "[]");
    const annNotes = annotations
      .filter(ann => ann.text && String(ann.text).trim())
      .map(ann => {
        const side = ann.side === "back" ? "Posterior" : "Anterior";
        const region = ann.region ? ` — ${ann.region}` : "";
        return `  • [${side}${region}] ${ann.text}`;
      });
    if (annNotes.length) {
      O_parts.push(`Pain Chart (Body Diagram):\n${annNotes.join("\n")}`);
    }
  } catch { /* body chart not yet drawn */ }

  // Outcome Measures
  const omRows = [1,2,3].map(i => {
    const act = v(`om_psfs${i}`);
    const now2 = v(`om_psfs${i}_now`);
    const goal2 = v(`om_psfs${i}_goal`);
    if (act) return `PSFS Activity ${i}: "${act}" — Now: ${now2||"—"}/10, Goal: ${goal2||"—"}/10`;
    return null;
  }).filter(Boolean);
  if (omRows.length) O_parts.push(`Outcome Measures:\n  ${omRows.join("\n  ")}`);

  // Gait
  const gaitObs = v("gait_observation") || v("gait_pattern") || v("gait_notes");
  const gaitDevs = a("gait_deviations");
  if (gaitObs || gaitDevs) O_parts.push(`Gait Analysis: ${[gaitObs, gaitDevs && `Deviations: ${gaitDevs}`].filter(Boolean).join(". ")}.`);

  // Functional Movement
  const fmaObs = v("fma_squat") || v("fma_notes") || v("fma_movement") || v("functional_notes");
  if (fmaObs) O_parts.push(`Functional Movement: ${fmaObs}.`);

  // Session treatment log
  const txSessArr = Array.isArray(data.tx_sessions) ? data.tx_sessions : [];
  const latestSess = txSessArr[0];
  if (latestSess?.treatmentGiven) {
    O_parts.push(`Treatment Given (Session ${latestSess.sessionNo||""}${latestSess.date?` — ${latestSess.date}`:""}): ${latestSess.treatmentGiven}.`);
    if (latestSess.vasStart || latestSess.vasEnd) {
      O_parts.push(`Pain response: Pre-Tx ${latestSess.vasStart||"?"}/10 → Post-Tx ${latestSess.vasEnd||"?"}/10.`);
    }
  }

  if (extraO) O_parts.push(extraO);

  // ── A: ASSESSMENT ──────────────────────────────────────────────────────────
  const A_parts = [];

  // Run auto-diagnosis if available
  const dx = typeof generateDiagnosis === "function" ? generateDiagnosis(data) : null;
  if (dx?.dx?.length) {
    A_parts.push("Clinical Impression:");
    dx.dx.forEach((d,i) => {
      A_parts.push(`  ${i+1}. ${d.name} (${d.confidence} confidence — ${d.system})`);
      if (d.evidence?.length) A_parts.push(`     Evidence: ${d.evidence.join(", ")}.`);
      if (d.mechanism) A_parts.push(`     Mechanism: ${d.mechanism}`);
    });
  } else {
    const ccText = v("cc_main") || (location ? `${location} dysfunction` : "musculoskeletal complaint");
    A_parts.push(`Clinical Impression: ${ccText}. Full clinical pattern assessment completed — see findings above.`);
  }

  // Add interpretation summary from rule engine
  const interps = buildClinicalInterpretation(data);
  const highConf = interps.filter(r => r.confidence === "HIGH" || r.confidence === "URGENT");
  const corrConf = interps.filter(r => r.module === "Correlation");
  if (highConf.length) {
    A_parts.push("\nKey Clinical Findings:");
    highConf.forEach(r => A_parts.push(`  • [${r.module}] ${r.tag}: ${r.text}`));
  }
  if (corrConf.length) {
    A_parts.push("\nCorrelated Patterns:");
    corrConf.forEach(r => A_parts.push(`  • ${r.tag}: ${r.text}`));
  }

  // ── FMS INDIVIDUAL MOVEMENT SCORES ────────────────────────────────────────
  if (dx?.fmsTotal !== null && dx?.fmsTotal !== undefined) {
    const fmsRisk = dx.fmsTotal >= 17 ? "Low" : dx.fmsTotal >= 15 ? "Moderate" : "High";
    const fmsFlag = dx.fmsTotal >= 17 ? "✅" : dx.fmsTotal >= 15 ? "⚠️" : "🔴";
    const fmsMovements = [
      ["Deep Squat",           "sp_fms_sq"],
      ["Hurdle Step L",        "sp_fms_hs_l"],
      ["Hurdle Step R",        "sp_fms_hs_r"],
      ["Inline Lunge L",       "sp_fms_il_l"],
      ["Inline Lunge R",       "sp_fms_il_r"],
      ["Shoulder Mob L",       "sp_fms_sm_l"],
      ["Shoulder Mob R",       "sp_fms_sm_r"],
      ["ASLR L",               "sp_fms_aslr_l"],
      ["ASLR R",               "sp_fms_aslr_r"],
      ["Trunk Stability PU",   "sp_fms_tspu"],
      ["Rotary Stability L",   "sp_fms_rs_l"],
      ["Rotary Stability R",   "sp_fms_rs_r"],
    ];
    const fmsRows = fmsMovements
      .map(([label, key]) => {
        const score = v(key);
        if (!score) return null;
        const flag = score === "0" ? " 🔴" : score === "1" ? " ⚠️" : "";
        return `  ${label.padEnd(22)}: ${score}/3${flag}`;
      })
      .filter(Boolean);
    const asymmetries = [];
    [["Hurdle Step","sp_fms_hs_l","sp_fms_hs_r"],
     ["Inline Lunge","sp_fms_il_l","sp_fms_il_r"],
     ["Shoulder Mob","sp_fms_sm_l","sp_fms_sm_r"],
     ["ASLR","sp_fms_aslr_l","sp_fms_aslr_r"],
     ["Rotary Stability","sp_fms_rs_l","sp_fms_rs_r"]].forEach(([name,kL,kR]) => {
      const l = parseFloat(v(kL)), r = parseFloat(v(kR));
      if (!isNaN(l) && !isNaN(r) && l !== r) asymmetries.push(`${name} (L:${l} vs R:${r})`);
    });
    let fmsBlock = `FMS Total: ${dx.fmsTotal}/21 — ${fmsFlag} ${fmsRisk} injury risk`;
    if (fmsRows.length) fmsBlock += `\n${fmsRows.join("\n")}`;
    if (asymmetries.length) fmsBlock += `\n  ⚠️ Asymmetries: ${asymmetries.join(", ")}`;
    A_parts.push(`\n${fmsBlock}`);
  }

  const prog = v("prognosis") || v("px_prognosis");
  if (prog) A_parts.push(`\nPrognosis: ${prog}.`);
  if (extraA) A_parts.push(`\n${extraA}`);

  // ── P: PLAN ────────────────────────────────────────────────────────────────
  const P_parts = [];
  P_parts.push("Treatment Plan:");

  if (dx?.dx?.length && dx.dx[0].treatment?.length) {
    dx.dx[0].treatment.forEach(t => P_parts.push(`  • ${t}`));
  }

  // Treatment techniques
  const txTechniques = Array.isArray(data.tx_techniques) ? data.tx_techniques : [];
  if (txTechniques.length) {
    P_parts.push("\nTreatment Techniques Applied:");
    txTechniques.forEach(t => {
      if (t.type==="manual") P_parts.push(`  • Joint Mobilisation — ${t.technique||""}${t.grade?` Grade ${t.grade}`:""}${t.region?` — ${t.region}`:""}${t.laterality?` (${t.laterality})`:""}${t.dosage?`. Dosage: ${t.dosage}`:""}`);
      else if (t.type==="dn") P_parts.push(`  • Dry Needling — ${t.dn_muscle||""}${t.laterality?` (${t.laterality})`:""}${t.dn_needles?`, ${t.dn_needles} needles`:""}${t.dn_depth?`, depth ${t.dn_depth}`:""}${t.dn_twitch?`. LTR: ${t.dn_twitch}`:""}`);
      else if (t.type==="taping") P_parts.push(`  • Taping — ${t.tape_type||""}${t.tape_goal?`. Goal: ${t.tape_goal}`:""}`);
      else if (t.type==="st") P_parts.push(`  • Soft Tissue — ${t.st_technique||""}${t.st_region?` — ${t.st_region}`:""}${t.duration?`, ${t.duration}`:""}`);
      else if (t.type==="us") P_parts.push(`  • Ultrasound — ${t.us_freq||""} ${t.us_mode||""}${t.us_intensity?`, ${t.us_intensity}W/cm²`:""}${t.us_area?` — ${t.us_area}`:""}`);
      else if (t.type==="electro") P_parts.push(`  • ${t.electro_type||"Electrotherapy"}${t.electro_params?` — ${t.electro_params}`:""}`);
      else if (t.technique) P_parts.push(`  • ${t.technique}${t.region?` — ${t.region}`:""}`);
      if (t.response) P_parts.push(`    Response: ${t.response}`);
    });
  }

  // HEP
  const hepArr = Array.isArray(data.hep_programme) ? data.hep_programme : [];
  if (hepArr.length) {
    P_parts.push("\nHome Exercise Programme:");
    hepArr.forEach((ex,i) => P_parts.push(`  ${i+1}. ${ex.name} — ${ex.customSets||ex.sets}×${ex.customReps||ex.reps}, hold ${ex.customHold||ex.hold}s, ${ex.customFreq||ex.freq}${ex.notes?` (${ex.notes})`:""}`));
  }

  // Session next plan
  if (latestSess?.nextPlan) P_parts.push(`\nNext Session: ${latestSess.nextPlan}`);
  if (latestSess?.goals) P_parts.push(`Session Goals: ${latestSess.goals}`);

  // Posture correction
  const selDef = Object.values(typeof POSTURE_DEFECTS !== "undefined" ? POSTURE_DEFECTS : {}).filter(d => data[`posture_defect_${d.id}`]);
  if (selDef.length) {
    P_parts.push("\nPostural Correction Exercises:");
    selDef.slice(0,3).forEach(d => {
      P_parts.push(`  ${d.label}:`);
      d.exercises?.slice(0,3).forEach(e => P_parts.push(`    • ${e}`));
    });
  }

  const freq = v("tx_frequency") || v("tx_freq");
  const dur = v("tx_duration_plan");
  P_parts.push(`\nReview: ${freq ? `${freq}${dur?` for ${dur}`:""}` : "Reassess in 2–4 weeks"}.`);

  const referral = v("referral_plan") || v("referral_notes");
  if (referral) P_parts.push(`Referral: ${referral}.`);
  if (extraP) P_parts.push(`\n${extraP}`);

  return {
    S: S_parts.join("\n"),
    O: O_parts.join("\n\n"),
    A: A_parts.join("\n"),
    P: P_parts.join("\n"),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOAP NOTE MODULE — Upgraded with Real-Time SOAP + Suggested Interpretation
// ═══════════════════════════════════════════════════════════════════════════════
function SOAPNoteModule({ data }) {
  const PC = typeof getC === "function" ? getC() : {
    surface:"#ffffff", s2:"#f5f0fb", s3:"#ede7f6", border:"#d8cce8",
    accent:"#7c3aed", a2:"#9333ea", a3:"#059669", text:"#1a1025",
    muted:"#7e6a9a", red:"#dc2626", yellow:"#b45309", green:"#059669",
    isDark:false
  };

  const [clinician, setClinician] = useState("");
  const [clinic,    setClinic]    = useState("");
  const [session,   setSession]   = useState("Initial Assessment");
  const [extraS,    setExtraS]    = useState("");
  const [extraO,    setExtraO]    = useState("");
  const [extraA,    setExtraA]    = useState("");
  const [extraP,    setExtraP]    = useState("");
  const [copied,    setCopied]    = useState(null);
  const [activeTab, setActiveTab] = useState("soap"); // "soap" | "interp" | "both"

  // Real-time SOAP auto-built every render (useMemo for perf)
  const soap = useMemo(() => buildRealtimeSOAP(data, extraS, extraO, extraA, extraP), [data, extraS, extraO, extraA, extraP]);
  const interpretations = useMemo(() => buildClinicalInterpretation(data), [data]);

  const urgentRules = interpretations.filter(r => r.confidence === "URGENT");
  const highRules = interpretations.filter(r => r.confidence === "HIGH" && r.module !== "Correlation");
  const corrRules = interpretations.filter(r => r.module === "Correlation");
  const modRules = interpretations.filter(r => r.confidence === "MOD");
  const totalRules = interpretations.length;

  // ── AI Clinical Assistant ─────────────────────────────────────────────────
  const [aiKey,       setAiKey]       = useState(() => localStorage.getItem("groq_api_key") || "");
  const [aiKeyInput,  setAiKeyInput]  = useState("");
  const [aiKeySet,    setAiKeySet]    = useState(() => !!localStorage.getItem("groq_api_key"));
  const [aiMode,      setAiMode]      = useState("ask");
  const [aiQuestion,  setAiQuestion]  = useState("");
  const [aiResponse,  setAiResponse]  = useState(null);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiError,     setAiError]     = useState(null);

  const saveKey = () => {
    const k = aiKeyInput.trim();
    if (!k.startsWith("gsk_")) { setAiError("Invalid key — Groq keys start with 'gsk_'"); return; }
    localStorage.setItem("groq_api_key", k);
    setAiKey(k); setAiKeySet(true); setAiKeyInput(""); setAiError(null);
  };
  const clearKey = () => { localStorage.removeItem("groq_api_key"); setAiKey(""); setAiKeySet(false); setAiResponse(null); };

  const buildPatientContext = () => {
    return `SOAP NOTE:\nS: ${soap.S}\n\nO: ${soap.O}\n\nA: ${soap.A}\n\nP: ${soap.P}`;
  };

  const callGroq = async (prompt) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json", "Authorization":`Bearer ${aiKey}`},
      body: JSON.stringify({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], temperature:0.4, max_tokens:1200 })
    });
    if (!res.ok) {
      const e = await res.json();
      const msg = e?.error?.message || `HTTP ${res.status}`;
      if (msg.includes('rate')||msg.includes('limit')) throw new Error("Groq rate limit — wait a few seconds and retry.");
      throw new Error(msg);
    }
    const json = await res.json();
    return json.choices?.[0]?.message?.content || "No response received.";
  };

  const runAsk = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true); setAiError(null); setAiResponse(null);
    try {
      const context = buildPatientContext();
      const prompt = `You are an expert physiotherapist and clinical reasoning assistant.\n\nPatient SOAP Note:\n${context}\n\nClinician Question: ${aiQuestion}\n\nProvide a concise, evidence-based clinical response (2-4 paragraphs max).`;
      setAiResponse(await callGroq(prompt));
    } catch(e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const runDdx = async () => {
    setAiLoading(true); setAiError(null); setAiResponse(null);
    try {
      const context = buildPatientContext();
      const prompt = `You are an expert physiotherapist. Analyse this patient data and generate a clinical differential diagnosis with confidence levels and evidence-based treatment recommendations.\n\nPatient Data:\n${context}\n\nProvide:\n1. Top 3 differential diagnoses with confidence %\n2. Key supporting evidence for each\n3. Tests needed to confirm primary diagnosis\n4. Evidence-based treatment priorities\n\nBe concise and clinically precise.`;
      setAiResponse(await callGroq(prompt));
    } catch(e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const runEnhance = async () => {
    setAiLoading(true); setAiError(null); setAiResponse(null);
    try {
      const prompt = `You are an expert physiotherapy documentation specialist. Rewrite this SOAP note with professional clinical language, proper medical terminology, expanded clinical reasoning, and medico-legally defensible documentation.\n\nOriginal SOAP:\nS: ${soap.S}\n\nO: ${soap.O}\n\nA: ${soap.A}\n\nP: ${soap.P}\n\nProvide the enhanced SOAP note maintaining the same structure (S/O/A/P). Use professional physiotherapy terminology throughout.`;
      setAiResponse(await callGroq(prompt));
    } catch(e) { setAiError(e.message); }
    setAiLoading(false);
  };

  // ── Copy helpers ──────────────────────────────────────────────────────────
  const copySection = (key, text) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(key); setTimeout(()=>setCopied(null),2000); });
  };
  const copyFull = () => {
    const d2 = new Date().toLocaleDateString("en-AU",{day:"2-digit",month:"long",year:"numeric"});
    const text = [
      `SOAP CLINICAL NOTE`,
      `Patient: ${data["dem_name"]||"—"} | Date: ${d2} | Session: ${session}`,
      `Clinician: ${clinician||"—"} | Clinic: ${clinic||"—"}`,
      "═".repeat(60),
      `\nSUBJECTIVE (S):\n${soap.S}`,
      `\nOBJECTIVE (O):\n${soap.O}`,
      `\nASSESSMENT (A):\n${soap.A}`,
      `\nPLAN (P):\n${soap.P}`,
    ].join("\n");
    navigator.clipboard?.writeText(text).then(() => { setCopied("all"); setTimeout(()=>setCopied(null),2000); });
  };

  const printNote = () => {
    const d2 = new Date().toLocaleDateString("en-AU",{day:"2-digit",month:"long",year:"numeric"});
    const bodyHTML = `
      <div class="info-grid">
        <div class="info-box"><div class="info-label">Patient</div><div class="info-value">${data["dem_name"]||"—"}</div></div>
        <div class="info-box"><div class="info-label">Session</div><div class="info-value">${session}</div></div>
        <div class="info-box"><div class="info-label">Date</div><div class="info-value">${d2}</div></div>
        <div class="info-box"><div class="info-label">Clinician</div><div class="info-value">${clinician||"—"} · ${clinic||"—"}</div></div>
      </div>
      <span class="badge badge-blue">SOAP CLINICAL NOTE — Auto-Generated</span>
      <h2>S — Subjective</h2><div class="section-box" style="white-space:pre-wrap">${soap.S}</div>
      <h2>O — Objective</h2><div class="section-box" style="white-space:pre-wrap">${soap.O}</div>
      <h2>A — Assessment</h2><div class="section-box" style="white-space:pre-wrap">${soap.A}</div>
      <h2>P — Plan</h2><div class="section-box" style="white-space:pre-wrap">${soap.P}</div>
      <div class="sig-row">
        <div class="sig-col"><div class="sig-line"></div><div class="sig-label">Clinician Signature</div></div>
        <div class="sig-col"><div class="sig-line"></div><div class="sig-label">Date</div></div>
        <div class="sig-col"><div class="sig-line"></div><div class="sig-label">Patient Signature (consent)</div></div>
      </div>`;
    if (typeof makePDFPage === "function" && typeof downloadPDFFromHTML === "function") {
      const html = makePDFPage("SOAP Clinical Note", `<div><strong>Patient:</strong> ${data["dem_name"]||"—"}</div><div><strong>Date:</strong> ${d2}</div><div><strong>Clinician:</strong> ${clinician||"—"}</div>`, bodyHTML);
      downloadPDFFromHTML(html, `SOAP_${data["dem_name"]||"Patient"}_${Date.now()}.pdf`);
    } else {
      const win = window.open("","_blank");
      if (win) { win.document.write(`<html><body style="font-family:Arial,sans-serif;padding:20px">${bodyHTML}</body></html>`); win.document.close(); setTimeout(()=>win.print(),500); }
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inp = {width:"100%",background:PC.s2,border:`1px solid ${PC.border}`,borderRadius:8,color:PC.text,fontFamily:"inherit",outline:"none",padding:"8px 10px",fontSize:"0.76rem"};
  const ta  = {...inp,resize:"vertical",minHeight:60};
  const lbl = {fontSize:"0.6rem",fontWeight:700,color:PC.muted,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.8px"};

  const sectionColors = {"S":"#7c3aed","O":"#06b6d4","A":"#10b981","P":"#f59e0b"};
  const sectionLabels = {"S":"Subjective","O":"Objective","A":"Assessment","P":"Plan"};
  const sectionIcons  = {"S":"📋","O":"🔬","A":"🧠","P":"📌"};

  const tabBtn = (id, label, badge=null) => (
    <button key={id} onClick={()=>setActiveTab(id)} style={{
      padding:"8px 12px", borderRadius:9,
      background: activeTab===id ? `${PC.accent}18` : "transparent",
      border: `1px solid ${activeTab===id ? PC.accent+"50" : PC.border}`,
      color: activeTab===id ? PC.accent : PC.muted,
      fontWeight: activeTab===id ? 800 : 500, fontSize:"0.73rem",
      cursor:"pointer", fontFamily:"inherit",
      display:"flex", alignItems:"center", gap:6,
    }}>
      {label}
      {badge !== null && badge > 0 && (
        <span style={{background:PC.accent,color:"#fff",borderRadius:20,padding:"1px 6px",fontSize:"0.58rem",fontWeight:900}}>{badge}</span>
      )}
    </button>
  );

  // ── Interpretation badge confidence render ────────────────────────────────
  const confBadge = (conf) => {
    const cfg = {
      HIGH:   {bg:"rgba(16,185,129,0.12)",color:"#059669"},
      MOD:    {bg:"rgba(180,83,9,0.12)",  color:"#b45309"},
      URGENT: {bg:"rgba(220,38,38,0.15)", color:"#dc2626"},
    }[conf] || {bg:"rgba(124,58,237,0.1)",color:"#7c3aed"};
    return (
      <span style={{padding:"1px 7px",borderRadius:20,background:cfg.bg,color:cfg.color,
        fontSize:"0.58rem",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.6px"}}>
        {conf}
      </span>
    );
  };

  return (
    <div>

      {/* ── LIVE STATUS BAR ────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
        background:`${PC.accent}0a`,border:`1px solid ${PC.accent}25`,
        borderRadius:12,marginBottom:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#10b981",
            boxShadow:"0 0 0 3px rgba(16,185,129,0.2)",flexShrink:0,
            animation:"pm-pulse 2s ease-in-out infinite"}}/>
          <span style={{fontSize:"0.68rem",fontWeight:800,color:PC.text,
            textTransform:"uppercase",letterSpacing:"0.8px"}}>SOAP Auto-Filling in Real Time</span>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {totalRules > 0 && (
            <div style={{padding:"3px 10px",background:`${PC.a3}15`,
              border:`1px solid ${PC.a3}35`,borderRadius:20,
              fontSize:"0.65rem",fontWeight:700,color:PC.a3}}>
              🧠 {totalRules} clinical finding{totalRules!==1?"s":""} detected
            </div>
          )}
          {urgentRules.length > 0 && (
            <div style={{padding:"3px 10px",background:"rgba(220,38,38,0.12)",
              border:"1px solid rgba(220,38,38,0.4)",borderRadius:20,
              fontSize:"0.65rem",fontWeight:800,color:"#dc2626",
              animation:"pm-pulse 1.5s ease-in-out infinite"}}>
              ⚠️ {urgentRules.length} URGENT
            </div>
          )}
        </div>
      </div>

      {/* ── URGENT FLAGS — always visible at top ───────────────────────────── */}
      {urgentRules.map((r,i) => (
        <div key={i} style={{background:"rgba(220,38,38,0.07)",
          border:"1.5px solid rgba(220,38,38,0.6)",borderRadius:12,
          padding:"12px 16px",marginBottom:10,display:"flex",gap:10}}>
          <span style={{fontSize:"1.4rem",flexShrink:0}}>🚨</span>
          <div>
            <div style={{fontWeight:800,color:"#dc2626",fontSize:"0.82rem",marginBottom:4}}>{r.tag}</div>
            <div style={{fontSize:"0.76rem",color:PC.text,lineHeight:1.65}}>{r.text}</div>
          </div>
        </div>
      ))}

      {/* ── SESSION DETAILS ─────────────────────────────────────────────────── */}
      <div style={{background:PC.surface,border:`1px solid ${PC.border}`,borderRadius:12,padding:"13px",marginBottom:12}}>
        <div style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>📋 Session Details</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><label style={lbl}>Clinician Name</label><input value={clinician} onChange={e=>setClinician(e.target.value)} placeholder="Your name" style={inp}/></div>
          <div><label style={lbl}>Clinic / Practice</label><input value={clinic} onChange={e=>setClinic(e.target.value)} placeholder="Clinic name" style={inp}/></div>
        </div>
        <div><label style={lbl}>Session Type</label>
          <select value={session} onChange={e=>setSession(e.target.value)} style={inp}>
            {["Initial Assessment","Follow-up Session","Discharge Assessment","Telehealth Consultation","Home Visit","Post-surgical Review","Group Session","Sports Field Assessment"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── MAIN TAB BAR ──────────────────────────────────────────────────────── */}
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {tabBtn("soap","📄 SOAP Note")}
        {tabBtn("interp","🧠 Suggested Interpretation", totalRules)}
        {tabBtn("both","⊞ Split View")}
        {tabBtn("extra","✏️ Add Notes")}
        {tabBtn("ai","🤖 AI Assistant")}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SOAP TAB — Real-time auto-filled note
      ══════════════════════════════════════════════════════════════ */}
      {(activeTab==="soap"||activeTab==="both") && (
        <div style={activeTab==="both"?{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}:{}}>

          <div style={activeTab==="both"?{}:{marginBottom:14}}>
            {/* Copy/print toolbar */}
            <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
              <button onClick={copyFull} style={{padding:"7px 14px",background:`${PC.accent}15`,border:`1px solid ${PC.accent}40`,borderRadius:8,color:PC.accent,fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>
                {copied==="all"?"✓ Copied!":"📋 Copy Full SOAP"}
              </button>
              <button onClick={printNote} style={{padding:"7px 14px",background:`${PC.a3}12`,border:`1px solid ${PC.a3}35`,borderRadius:8,color:PC.a3,fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>
                🖨️ Print / PDF
              </button>
              <div style={{marginLeft:"auto",fontSize:"0.62rem",color:PC.muted,display:"flex",alignItems:"center"}}>
                Updates live as you fill assessment fields ↗
              </div>
            </div>

            {/* SOAP sections */}
            {["S","O","A","P"].map(key => (
              <div key={key} style={{marginBottom:14,background:"#ffffff",
                border:`2px solid ${sectionColors[key]}35`,
                borderRadius:16,overflow:"hidden",
                boxShadow:`0 3px 16px ${sectionColors[key]}18`}}>

                {/* ── Colourful Header ── */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"12px 16px",
                  background:`linear-gradient(120deg,${sectionColors[key]}22 0%,${sectionColors[key]}0a 100%)`,
                  borderBottom:`2px solid ${sectionColors[key]}28`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>

                    {/* Solid colour letter badge */}
                    <div style={{width:40,height:40,borderRadius:12,
                      background:sectionColors[key],
                      boxShadow:`0 4px 14px ${sectionColors[key]}60`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontWeight:900,fontSize:"1.2rem",color:"#ffffff",flexShrink:0}}>
                      {key}
                    </div>

                    <div>
                      {/* Big bold coloured heading */}
                      <div style={{
                        fontSize:"1rem",
                        fontWeight:900,
                        color:sectionColors[key],
                        letterSpacing:"0.3px",
                        lineHeight:1.15,
                        fontFamily:"'Segoe UI','Inter','Helvetica Neue',sans-serif"}}>
                        {sectionIcons[key]}&nbsp;&nbsp;{sectionLabels[key]}
                      </div>
                      {/* Subtitle */}
                      <div style={{fontSize:"0.62rem",fontWeight:600,marginTop:3,
                        color:sectionColors[key],opacity:0.72}}>
                        {{"S":"Patient-reported history, symptoms & pain behaviour",
                          "O":"Clinical findings, measurements & objective observations",
                          "A":"Clinical reasoning, differential diagnosis & interpretation",
                          "P":"Treatment plan, rehabilitation goals & home programme"}[key]}
                      </div>
                    </div>
                  </div>

                  {/* Copy button */}
                  <button onClick={()=>copySection(key,soap[key])}
                    style={{padding:"6px 14px",
                      background:sectionColors[key],border:"none",
                      borderRadius:9,color:"#ffffff",
                      fontSize:"0.65rem",fontWeight:800,cursor:"pointer",
                      boxShadow:`0 2px 8px ${sectionColors[key]}45`,flexShrink:0}}>
                    {copied===key?"✓ Copied":"Copy"}
                  </button>
                </div>

                {/* ── Dark Black Body Text ── */}
                <div style={{padding:"14px 18px",background:"#ffffff"}}>
                  <pre style={{margin:0,
                    fontSize:"0.83rem",
                    color:"#0a0a0a",
                    fontWeight:500,
                    lineHeight:2.0,
                    whiteSpace:"pre-wrap",
                    fontFamily:"'Segoe UI','Inter','Helvetica Neue',Arial,sans-serif",
                    letterSpacing:"0.15px"}}>
                    {soap[key] || <span style={{color:"#c4b5d4",fontStyle:"italic",fontWeight:400}}>Fill assessment fields above to auto-populate...</span>}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* SPLIT VIEW — Interpretation alongside */}
          {activeTab==="both" && (
            <div>
              <div style={{marginBottom:10,padding:"9px 14px",background:`${PC.accent}08`,
                border:`1px solid ${PC.accent}28`,borderRadius:11}}>
                <div style={{fontSize:"0.65rem",fontWeight:800,color:PC.accent,
                  textTransform:"uppercase",letterSpacing:"0.8px"}}>🧠 Suggested Interpretation</div>
              </div>
              {totalRules===0?(
                <div style={{textAlign:"center",padding:"32px 20px",background:PC.surface,
                  border:`1px solid ${PC.border}`,borderRadius:13,color:PC.muted,fontSize:"0.78rem"}}>
                  Fill assessment fields to generate clinical interpretation
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[...corrRules,...highRules,...modRules].map((r,i)=>(
                    <div key={i} style={{background:PC.surface,
                      border:`1px solid ${r.module==="Correlation"?"rgba(6,182,212,0.4)":PC.border}`,
                      borderRadius:12,padding:"11px 14px",
                      borderLeft:`3px solid ${r.module==="Correlation"?"#06b6d4":r.confidence==="HIGH"?"#10b981":"#b45309"}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:"0.75rem"}}>{
                          {Subjective:"📋",Posture:"🧍",ROM:"📐",MMT:"💪","Special Tests":"🔬",
                           Neurology:"⚡",Gait:"🚶",Functional:"🏃",Palpation:"🖐️",Correlation:"🔗"}[r.module]||"⚕️"
                        }</span>
                        <span style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,
                          textTransform:"uppercase",letterSpacing:"0.6px"}}>{r.module}</span>
                        <span style={{fontSize:"0.72rem",fontWeight:700,color:PC.text,flex:1}}>{r.tag}</span>
                        {confBadge(r.confidence)}
                      </div>
                      <p style={{margin:0,fontSize:"0.75rem",color:PC.muted,lineHeight:1.7}}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          INTERPRETATION TAB — Suggested Interpretation full panel
      ══════════════════════════════════════════════════════════════ */}
      {activeTab==="interp" && (
        <div>
          {/* Header card */}
          <div style={{padding:"14px 16px",background:`${PC.accent}08`,
            border:`1px solid ${PC.accent}28`,borderRadius:12,marginBottom:14}}>
            <div style={{fontWeight:800,color:PC.accent,fontSize:"0.85rem",marginBottom:4,
              display:"flex",alignItems:"center",gap:8}}>
              🧠 Suggested Interpretation
              {totalRules>0&&<span style={{padding:"2px 10px",borderRadius:20,
                background:PC.accent,color:"#fff",fontSize:"0.62rem",fontWeight:900}}>{totalRules}</span>}
            </div>
            <div style={{fontSize:"0.72rem",color:PC.muted,lineHeight:1.65}}>
              <strong style={{color:PC.text}}>Rule-based clinical reasoning engine</strong> — deterministic physiotherapy logic, NOT generative AI.
              Updates in real time as you fill any assessment field. Each interpretation is sourced from predefined clinical rules, correlation pathways, and special test clusters.
            </div>
          </div>

          {totalRules===0?(
            <div style={{textAlign:"center",padding:"48px 24px",background:PC.surface,
              border:`1px solid ${PC.border}`,borderRadius:14}}>
              <div style={{fontSize:"2.5rem",marginBottom:12}}>🧠</div>
              <div style={{fontWeight:700,color:PC.text,fontSize:"0.9rem",marginBottom:6}}>No findings yet</div>
              <div style={{color:PC.muted,fontSize:"0.78rem",lineHeight:1.7}}>
                Start filling assessment fields in any module<br/>
                <span style={{color:PC.accent,fontWeight:700}}>Subjective → Posture → ROM → MMT → Special Tests</span><br/>
                and interpretations will appear here automatically.
              </div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>

              {/* Section: Correlated Findings */}
              {corrRules.length>0&&(
                <>
                  <div style={{fontSize:"0.6rem",fontWeight:800,color:"#06b6d4",textTransform:"uppercase",
                    letterSpacing:"1.5px",marginBottom:2,display:"flex",alignItems:"center",gap:8}}>
                    <div style={{height:1,width:8,background:"#06b6d4"}}/> Cross-Module Correlations
                  </div>
                  {corrRules.map((r,i)=>(
                    <div key={i} style={{background:`rgba(6,182,212,0.05)`,
                      border:`1.5px solid rgba(6,182,212,0.45)`,borderRadius:13,
                      padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:"0.9rem"}}>🔗</span>
                        <span style={{fontSize:"0.73rem",fontWeight:800,color:"#06b6d4",flex:1}}>{r.tag}</span>
                        {confBadge(r.confidence)}
                      </div>
                      <p style={{margin:0,fontSize:"0.79rem",color:PC.text,lineHeight:1.75}}>{r.text}</p>
                    </div>
                  ))}
                </>
              )}

              {/* Section: High Confidence */}
              {highRules.length>0&&(
                <>
                  <div style={{fontSize:"0.6rem",fontWeight:800,color:"#059669",textTransform:"uppercase",
                    letterSpacing:"1.5px",marginTop:6,marginBottom:2,display:"flex",alignItems:"center",gap:8}}>
                    <div style={{height:1,width:8,background:"#059669"}}/> High Confidence Findings
                  </div>
                  {highRules.map((r,i)=>(
                    <div key={i} style={{background:PC.surface,
                      border:`1px solid ${PC.border}`,borderRadius:12,
                      padding:"13px 15px",borderLeft:"3px solid #059669"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,flexWrap:"wrap"}}>
                        <span style={{fontSize:"0.82rem"}}>{
                          {Subjective:"📋",Posture:"🧍",ROM:"📐",MMT:"💪","Special Tests":"🔬",
                           Neurology:"⚡",Gait:"🚶",Functional:"🏃",Palpation:"🖐️"}[r.module]||"⚕️"
                        }</span>
                        <span style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,
                          textTransform:"uppercase",letterSpacing:"0.6px"}}>{r.module}</span>
                        <span style={{fontSize:"0.73rem",fontWeight:800,color:PC.text,flex:1}}>{r.tag}</span>
                        {confBadge(r.confidence)}
                      </div>
                      <p style={{margin:0,fontSize:"0.78rem",color:PC.text,lineHeight:1.75}}>{r.text}</p>
                    </div>
                  ))}
                </>
              )}

              {/* Section: Moderate */}
              {modRules.length>0&&(
                <>
                  <div style={{fontSize:"0.6rem",fontWeight:800,color:"#b45309",textTransform:"uppercase",
                    letterSpacing:"1.5px",marginTop:6,marginBottom:2,display:"flex",alignItems:"center",gap:8}}>
                    <div style={{height:1,width:8,background:"#b45309"}}/> Additional Findings
                  </div>
                  {modRules.map((r,i)=>(
                    <div key={i} style={{background:PC.surface,
                      border:`1px solid ${PC.border}`,borderRadius:11,
                      padding:"11px 14px",borderLeft:"3px solid #b45309"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:"0.82rem"}}>{
                          {Subjective:"📋",Posture:"🧍",ROM:"📐",MMT:"💪","Special Tests":"🔬",
                           Neurology:"⚡",Gait:"🚶",Functional:"🏃",Palpation:"🖐️"}[r.module]||"⚕️"
                        }</span>
                        <span style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,
                          textTransform:"uppercase",letterSpacing:"0.6px"}}>{r.module}</span>
                        <span style={{fontSize:"0.72rem",fontWeight:700,color:PC.muted,flex:1}}>{r.tag}</span>
                        {confBadge(r.confidence)}
                      </div>
                      <p style={{margin:0,fontSize:"0.76rem",color:PC.muted,lineHeight:1.7}}>{r.text}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ADD NOTES TAB — Additional clinical notes per SOAP section
      ══════════════════════════════════════════════════════════════ */}
      {activeTab==="extra" && (
        <div style={{background:PC.surface,border:`1px solid ${PC.border}`,borderRadius:12,padding:"14px"}}>
          <div style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            ✏️ Additional Clinical Notes (appended to auto-generated SOAP)
          </div>
          <div style={{display:"grid",gap:10}}>
            {["S","O","A","P"].map(key=>(
              <div key={key}>
                <label style={{...lbl,color:sectionColors[key]}}>
                  {sectionIcons[key]} Additional {sectionLabels[key]} Notes
                </label>
                <textarea
                  value={key==="S"?extraS:key==="O"?extraO:key==="A"?extraA:extraP}
                  onChange={e=>{
                    if(key==="S")setExtraS(e.target.value);
                    else if(key==="O")setExtraO(e.target.value);
                    else if(key==="A")setExtraA(e.target.value);
                    else setExtraP(e.target.value);
                  }}
                  placeholder={`Additional ${sectionLabels[key].toLowerCase()} notes to append...`}
                  rows={3} style={ta}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          AI ASSISTANT TAB
      ══════════════════════════════════════════════════════════════ */}
      {activeTab==="ai" && (
        <div style={{background:PC.surface,border:`1px solid ${PC.border}`,borderRadius:12,padding:"14px"}}>
          <div style={{fontSize:"0.62rem",fontWeight:700,color:PC.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            🤖 AI Clinical Assistant (Groq — Llama 3.3 70B)
          </div>

          {!aiKeySet ? (
            <div>
              <div style={{fontSize:"0.73rem",color:PC.muted,marginBottom:10,lineHeight:1.65}}>
                Enter your free <strong style={{color:PC.text}}>Groq API key</strong> to enable AI clinical reasoning.<br/>
                <span style={{color:"#059669"}}>✓ 100% free · 30 req/min · Llama 3.3 70B</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={aiKeyInput} onChange={e=>{setAiKeyInput(e.target.value);setAiError(null);}}
                  onKeyDown={e=>e.key==="Enter"&&saveKey()}
                  placeholder="gsk_... paste your Groq API key"
                  type="password" style={{flex:1,...inp}}/>
                <button onClick={saveKey} style={{padding:"9px 16px",background:"linear-gradient(135deg,#7f5af0,#00e5ff)",border:"none",borderRadius:8,color:"#000",fontWeight:800,fontSize:"0.75rem",cursor:"pointer",whiteSpace:"nowrap"}}>
                  Save Key
                </button>
              </div>
              {aiError&&<div style={{marginTop:7,fontSize:"0.68rem",color:"#dc2626",padding:"6px 10px",background:"rgba(220,38,38,0.08)",borderRadius:6}}>{aiError}</div>}
            </div>
          ) : (
            <div>
              <div style={{display:"flex",gap:6,marginBottom:13}}>
                {[{id:"ask",icon:"💬",label:"Ask AI"},{id:"ddx",icon:"🔬",label:"Full DDx"},{id:"enhance",icon:"✨",label:"Enhance SOAP"}].map(({id,icon,label})=>(
                  <button key={id} onClick={()=>{setAiMode(id);setAiResponse(null);setAiError(null);}}
                    style={{flex:1,padding:"8px 4px",background:aiMode===id?"rgba(127,90,240,0.2)":"rgba(127,90,240,0.06)",border:`1px solid ${aiMode===id?"rgba(127,90,240,0.5)":"rgba(127,90,240,0.2)"}`,borderRadius:8,color:aiMode===id?"#a78bfa":"#6b8399",fontWeight:aiMode===id?800:500,fontSize:"0.66rem",cursor:"pointer",fontFamily:"inherit"}}>
                    <div style={{fontSize:"1rem",marginBottom:2}}>{icon}</div>{label}
                  </button>
                ))}
              </div>

              {aiMode==="ask"&&(
                <div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                    {["What is the most likely diagnosis?","Are there any red flags?","What treatment do you recommend?","What are the differential diagnoses?","Is this inflammatory or mechanical?"].map(q=>(
                      <button key={q} onClick={()=>setAiQuestion(q)} style={{padding:"4px 9px",background:"rgba(0,229,255,0.07)",border:"1px solid rgba(0,229,255,0.2)",borderRadius:6,color:"#00e5ff",fontSize:"0.6rem",cursor:"pointer"}}>
                        {q}
                      </button>
                    ))}
                  </div>
                  <textarea value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();runAsk();}}}
                    placeholder="Type your clinical question... (Enter to send)"
                    rows={3} style={{...ta,marginBottom:8}}/>
                  <button onClick={runAsk} disabled={aiLoading||!aiQuestion.trim()}
                    style={{width:"100%",padding:"10px",background:aiLoading||!aiQuestion.trim()?"rgba(127,90,240,0.2)":"linear-gradient(135deg,#7f5af0,#00e5ff)",border:"none",borderRadius:8,color:aiLoading?"#6b8399":"#000",fontWeight:800,fontSize:"0.76rem",cursor:aiLoading?"default":"pointer"}}>
                    {aiLoading?"🔄 Thinking...":"💬 Ask AI"}
                  </button>
                </div>
              )}
              {aiMode==="ddx"&&(
                <div>
                  <div style={{fontSize:"0.68rem",color:PC.muted,marginBottom:12,lineHeight:1.65}}>AI will analyse all assessment data and generate a full clinical differential diagnosis with confidence ratings and treatment guidance.</div>
                  <button onClick={runDdx} disabled={aiLoading} style={{width:"100%",padding:"12px",background:aiLoading?"rgba(127,90,240,0.2)":"linear-gradient(135deg,#7f5af0,#a78bfa)",border:"none",borderRadius:8,color:aiLoading?"#6b8399":"#fff",fontWeight:800,fontSize:"0.8rem",cursor:aiLoading?"default":"pointer"}}>
                    {aiLoading?"🔄 Analysing...":"🔬 Generate Full Differential Diagnosis"}
                  </button>
                </div>
              )}
              {aiMode==="enhance"&&(
                <div>
                  <div style={{fontSize:"0.68rem",color:PC.muted,marginBottom:12,lineHeight:1.65}}>AI will rewrite the auto-generated SOAP note with professional clinical language, proper terminology, and medico-legally defensible documentation.</div>
                  <button onClick={runEnhance} disabled={aiLoading} style={{width:"100%",padding:"12px",background:aiLoading?"rgba(0,201,122,0.15)":"linear-gradient(135deg,#00c97a,#00e5ff)",border:"none",borderRadius:8,color:aiLoading?"#6b8399":"#000",fontWeight:800,fontSize:"0.8rem",cursor:aiLoading?"default":"pointer"}}>
                    {aiLoading?"🔄 Enhancing SOAP note...":"✨ Enhance SOAP Note with AI"}
                  </button>
                </div>
              )}

              {aiError&&<div style={{marginTop:10,padding:"9px 12px",background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.25)",borderRadius:8,fontSize:"0.7rem",color:"#dc2626",lineHeight:1.6}}><strong>Error:</strong> {aiError}</div>}

              {aiResponse&&!aiLoading&&(
                <div style={{marginTop:12,background:PC.s2,border:"1px solid rgba(127,90,240,0.25)",borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"8px 13px",background:"rgba(127,90,240,0.1)",borderBottom:"1px solid rgba(127,90,240,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:700,fontSize:"0.72rem",color:"#a78bfa"}}>🤖 AI Clinical Response</span>
                    <button onClick={()=>navigator.clipboard?.writeText(aiResponse)} style={{padding:"2px 9px",background:"rgba(0,229,255,0.1)",border:"1px solid rgba(0,229,255,0.2)",borderRadius:5,color:"#00e5ff",fontSize:"0.6rem",cursor:"pointer"}}>Copy</button>
                  </div>
                  <div style={{padding:"13px 14px",fontSize:"0.75rem",color:PC.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:480,overflowY:"auto"}}>{aiResponse}</div>
                  <div style={{padding:"7px 13px",fontSize:"0.58rem",color:PC.muted,borderTop:`1px solid ${PC.border}`}}>⚠ AI-generated — for clinical decision support only. Clinician responsible for all clinical decisions.</div>
                </div>
              )}

              <div style={{marginTop:10,textAlign:"right"}}>
                <button onClick={clearKey} style={{background:"none",border:"none",color:PC.muted,fontSize:"0.6rem",cursor:"pointer",textDecoration:"underline"}}>Change API Key</button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE PRESCRIPTION MODULE
// ═══════════════════════════════════════════════════════════════════════════════

// ============================================================
// ExercisePrescription.jsx
// Drop-in Exercise Prescription module for PhysioMind
//
// EXPORTS:
//   • EXERCISE_DB           — full exercise database (214 exercises, 18 regions)
//   • PROGRAMME_TEMPLATES   — 37 quick-load evidence-based HEP templates
//   • ALL_EXERCISES         — flat array of every exercise (for search)
//   • ExercisePrescriptionModule — React component
//
// PROPS:
//   <ExercisePrescriptionModule data={data} set={set} />
//     data  — shared patient data object (reads data.hep_programme, data.dem_name)
//     set   — function(key, value) to write back to shared state
//             e.g. set("hep_programme", [...])
//
// DEPENDENCIES:
//   React (useState, useMemo — already imported in parent)
//   Uses getC() for colour palette — ensure this is defined in your app
// ============================================================




// ─── KNEE EVIDENCE-BASED PROTOCOLS ───────────────────────────────────────────

// ─── SHOULDER EVIDENCE-BASED PROTOCOLS ───────────────────────────────────────

// ─── ELBOW EVIDENCE-BASED PROTOCOLS ──────────────────────────────────────────

// ─── HIP EVIDENCE-BASED PROTOCOLS ────────────────────────────────────────────

// ─── SHARED PROTOCOL PANEL RENDERER ──────────────────────────────────────────

export { OutcomeMeasuresModule, SOAPNoteModule };
