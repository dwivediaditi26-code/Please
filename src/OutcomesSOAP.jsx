import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { C, getC } from './theme.jsx';

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

const EXERCISE_DB = {
  cervical: {
    label:"Cervical Spine", icon:"🔄", color:"#00e5ff",
    categories: {
      "Mobility & Flexibility": [
        { id:"cx_chin_tuck",        name:"Chin Tucks",                              target:"Deep cervical flexors (longus colli/capitis)",       desc:"Sitting or standing. Retract chin horizontally — not downward. Hold 5s.",   sets:3, reps:10, hold:5,  freq:"Hourly",   phase:"Phase 1", evidence:"Strong",    cues:"Double chin. Eyes level. No downward nod.",               progression:"Finger resistance → Cervical flexion at end range" },
        { id:"cx_rotation",         name:"Cervical Rotation AROM",                  target:"SCM, cervical rotators",                            desc:"Slow controlled rotation L & R. Do not force range.",                       sets:2, reps:10, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep shoulders still. Comfortable end range only.",       progression:"Overpressure with hand → Rotation with retraction" },
        { id:"cx_lat_flex",         name:"Lateral Neck Stretch",                    target:"Upper trapezius, SCM, scalenes, levator scapulae",  desc:"Tilt ear to shoulder. Opposite hand adds gentle overpressure. Hold 30s.",  sets:3, reps:1,  hold:30, freq:"3×/day",  phase:"Phase 1", evidence:"Moderate", cues:"Do not elevate the shoulder being stretched toward.",     progression:"Neural mobilisation add-on (depress contralateral shoulder)" },
        { id:"cx_extension",        name:"Cervical Extension over Towel Roll",      target:"Cervical extensors, posterior capsule",             desc:"Supported head extension over rolled towel. Controlled range.",             sets:2, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Avoid end-range compression if symptomatic.",             progression:"Add rotation in extension" },
        { id:"cx_flex_stretch",     name:"Cervical Flexion Stretch",                target:"Cervical extensors, suboccipitals",                 desc:"Gently tuck chin and nod head forward. Add gentle hand pressure.",          sets:3, reps:1,  hold:20, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Nod first — then bow. No aggressive overpressure.",       progression:"Add diagonal flexion → Sustained hold" },
        { id:"cx_suboccip_release", name:"Suboccipital Self-Release",               target:"Suboccipitals, occiput",                            desc:"Supine. Fingers under skull base. Allow head weight to release. Breathe.",  sets:1, reps:1,  hold:120,freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Relax jaw and neck completely. Breathe deeply.",           progression:"Add gentle small nodding motion" },
      ],
      "Strengthening": [
        { id:"cx_dnf",              name:"Deep Neck Flexor Endurance",              target:"Longus colli, longus capitis",                      desc:"Supine. Chin tuck lifting head 1cm. Hold without pressure drop.",           sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Nod — do not flex fully. Pressure gauge must not drop.",  progression:"Increase hold → Add leg extension" },
        { id:"cx_isometric",        name:"Cervical Isometric Strengthening",        target:"All cervical muscles — direction-specific",         desc:"Hand against head. No movement. Build force 50–70% max. All 4 directions.", sets:3, reps:8,  hold:5,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"No pain or symptom reproduction. Build gradually.",       progression:"Increase resistance → Perturbation training" },
        { id:"cx_scap_ret",         name:"Scapular Retraction",                     target:"Mid/lower trapezius, rhomboids",                    desc:"Squeeze shoulder blades together and down. Essential for cervical posture.", sets:3, reps:15, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Blades together AND down. No shoulder elevation.",        progression:"Band rows → Prone Y/T/W → Single-arm cable row" },
        { id:"cx_neck_ext_iso",     name:"Cervical Extension Isometric Hold",       target:"Cervical extensors, upper trapezius",               desc:"Hands clasped behind head. Press head back into resistance. Hold 5s.",      sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"No movement of head. Steady force build-up.",             progression:"Add retraction before hold → Resistance bands" },
      ],
      "Neural Mobilisation": [
        { id:"cx_neural_slider",    name:"Upper Limb Neural Slider (Median)",       target:"Median nerve — brachial plexus",                   desc:"Side-flex neck away + extend elbow + dorsiflex wrist simultaneously.",      sets:3, reps:10, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Moderate", cues:"Neck and hand move in OPPOSITE directions. No pain.",     progression:"Add shoulder abduction → Tensioner technique" },
        { id:"cx_neural_ulnar",     name:"Upper Limb Neural Slider (Ulnar)",        target:"Ulnar nerve — C8/T1",                              desc:"Elbow flexion + wrist extension + neck lateral flex away. Slider.",         sets:3, reps:10, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Moderate", cues:"Smooth rhythmic movement. Stop if sharp or burning pain.", progression:"Add wrist deviation → Tensioner" },
        { id:"cx_neural_radial",    name:"Upper Limb Neural Slider (Radial)",       target:"Radial nerve — C6/C7",                             desc:"Shoulder IR + elbow extension + wrist flex + neck lateral flex away.",      sets:3, reps:10, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Moderate", cues:"Rhythmic. Smooth and synchronised movements.",            progression:"Add shoulder depression → Tensioner" },
      ],
    }
  },
  shoulder: {
    label:"Shoulder", icon:"🏋", color:"#7f5af0",
    categories: {
      "Rotator Cuff": [
        { id:"sh_er_band",          name:"External Rotation with Band",             target:"Infraspinatus, teres minor",                       desc:"Elbow at side, 90° flexion. Rotate outward against resistance.",            sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Elbow stays against body. Control the return.",           progression:"Increase resistance → ER at 90° abduction → Prone ER" },
        { id:"sh_empty_can",        name:"Empty Can (Supraspinatus Isolation)",     target:"Supraspinatus",                                    desc:"Arm in scapular plane (30° fwd), thumb down. Elevate to 90°.",              sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Stop if painful arc. Pain-free range initially.",         progression:"Full can (thumb up) → Side-lying ER → Overhead load" },
        { id:"sh_prone_er",         name:"Prone External Rotation 90/90",           target:"Infraspinatus, posterior cuff",                    desc:"Prone, arm 90° abducted, elbow 90° flexed. Rotate forearm upward.",         sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep shoulder at 90°. No trunk rotation.",                progression:"Add resistance → Side-lying → Standing cable" },
        { id:"sh_ir_stretch",       name:"Sleeper Stretch",                         target:"Posterior GH capsule, posterior cuff",             desc:"Side-lying on affected side. Other arm pushes forearm down. Hold 30s.",     sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Keep shoulder blade stable. No impingement pain.",        progression:"Cross-body stretch → Standing posterior stretch" },
        { id:"sh_sidelying_ir",     name:"Side-Lying Internal Rotation",            target:"Subscapularis",                                    desc:"Side-lying, arm at side, elbow 90°. Rotate forearm downward with resistance.", sets:3, reps:12, hold:2, freq:"Daily",   phase:"Phase 2", evidence:"Strong",    cues:"Control rotation — no wrist compensation.",               progression:"Increase resistance → Standing IR with band" },
        { id:"sh_diagonal_d2",      name:"PNF D2 Flexion Pattern",                  target:"Rotator cuff, deltoid — diagonal pattern",         desc:"Start: hand across body down. Finish: hand up/out/rotated above shoulder.", sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 3", evidence:"Strong",    cues:"Move through full diagonal smoothly. Breathe out on exertion.", progression:"Increase resistance → Add speed → Sport-specific" },
        { id:"sh_rhythmic_stab",    name:"Rhythmic Stabilisation",                  target:"Rotator cuff co-contraction",                      desc:"Shoulder in supported position. Apply alternating perturbations. Resist.",   sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 3", evidence:"Strong",    cues:"Match resistance — do not let shoulder move.",            progression:"Increase speed → Unstable surface" },
      ],
      "Scapular Stabilisation": [
        { id:"sh_wall_slide",       name:"Wall Slides",                             target:"Serratus anterior, lower trapezius",                desc:"Forearms on wall. Slide arms upward maintaining contact. Protract at top.",  sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Keep scapulae on ribcage. No winging.",                   progression:"Resistance band → Overhead cable → Push-up plus" },
        { id:"sh_prone_ytw",        name:"Prone Y-T-W",                             target:"Lower trap (Y), mid trap (T), rhomboids (W)",       desc:"Prone on bench. Thumbs up. Raise in Y, T, and W patterns.",                 sets:3, reps:12, hold:3,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Depress scapulae first. No neck tension.",                progression:"Add weight → Cable variations → TRX" },
        { id:"sh_face_pull",        name:"Face Pulls",                              target:"Posterior deltoid, external rotators, mid/lower trap", desc:"Cable/band at face height. Pull to forehead with ER. Elbows high.",      sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Elbows above wrists at end range. External rotate fully.", progression:"Increase resistance → Single-arm" },
        { id:"sh_push_plus",        name:"Push-Up Plus",                            target:"Serratus anterior — highest EMG",                   desc:"Push-up position. At top, add extra protraction. Hold 2s.",                 sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Only the extra protraction is the exercise.",             progression:"Knee → Full → TRX push-up plus" },
        { id:"sh_sidelying_abd",    name:"Side-Lying Shoulder Abduction",           target:"Middle deltoid, supraspinatus — scapular plane",   desc:"Side-lying. Raise arm in scapular plane to 90°. Control return.",           sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Thumb slightly up. Stay in pain-free arc.",               progression:"Add weight → Standing lateral raise" },
        { id:"sh_scap_clock",       name:"Scapular Clock Exercise",                 target:"Periscapular muscles — all directions",             desc:"Seated or prone. Move scapula in all directions in sequence.",              sets:3, reps:8,  hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Isolated scapular movement — do not move arm.",           progression:"Add speed → Add resistance" },
      ],
      "Mobility": [
        { id:"sh_pendulum",         name:"Codman's Pendulum",                       target:"GH joint — passive decompression",                 desc:"Lean forward, arm hanging. Small circles using trunk momentum.",             sets:3, reps:20, hold:0,  freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Arm is PASSIVE. Let gravity do the work.",                progression:"Increase circle size → Add 0.5–1kg" },
        { id:"sh_pec_stretch",      name:"Pectoralis Minor Stretch",                target:"Pectoralis minor, anterior capsule",                desc:"Doorway stretch. Arm at 90°. Step through. Or supine on foam roller.",       sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Do not arch lower back. Core engaged.",                   progression:"Corner stretch → Unilateral with scapular PT cue" },
        { id:"sh_pully",            name:"Shoulder Pulley AROM",                    target:"GH joint — ROM restoration",                       desc:"Overhead pulley. Use good arm to assist bad arm through range.",             sets:3, reps:15, hold:2,  freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Assisted — do not force range. Smooth movement.",         progression:"Reduce assistance → AROM → Add load" },
        { id:"sh_capsule_stretch",  name:"Inferior Capsule Stretch",                target:"Inferior GH capsule — frozen shoulder",            desc:"Supine. Hold arm at side, slightly abducted. Gentle traction downward.",     sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Gentle traction only. No pain reproduction.",             progression:"Increase hold → Combine with ER stretches" },
      ],
    }
  },
  elbow: {
    label:"Elbow & Forearm", icon:"💪", color:"#f59e0b",
    categories: {
      "Lateral Epicondylalgia": [
        { id:"el_isometric_ext",    name:"Wrist Extension Isometric",               target:"ECRB — isometric analgesic",                       desc:"Fist clenched. Press wrist into table or hand. No movement. 5–6/10 effort.", sets:4, reps:1, hold:45, freq:"Daily",     phase:"Phase 1", evidence:"Strong",    cues:"No pain >4/10. Neutral wrist throughout.",                progression:"Progress to Tyler Twist" },
        { id:"el_tyler_twist",      name:"Tyler Twist (Eccentric Wrist Extension)", target:"ECRB — eccentric (Vicenzino protocol)",            desc:"Eccentric wrist extension with rubber bar. Bend + straighten elbow simultaneously.", sets:3, reps:15, hold:0, freq:"Daily", phase:"Phase 2", evidence:"Strongest — 81% success rate", cues:"Eccentric wrist extension only. Use Therabar.",           progression:"Increase bar resistance weekly" },
        { id:"el_wrist_ext_isoton", name:"Wrist Extension Isotonic",                target:"ECRB, ECRL",                                       desc:"Forearm pronated. Light weight. Extend wrist 3s. Lower 3s.",                sets:3, reps:15, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Full range. Control the lowering phase.",                 progression:"Increase load weekly → Add ulnar/radial deviation" },
        { id:"el_grip_strength",    name:"Progressive Grip Strengthening",          target:"Forearm flexors and extensors",                    desc:"Stress ball or grip trainer. Squeeze and release. Full range.",              sets:3, reps:20, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"No pain. Stop if >3/10.",                                 progression:"Increase resistance → Wrist roller" },
      ],
      "Medial Epicondylalgia": [
        { id:"el_wrist_flex_iso",   name:"Wrist Flexion Isometric",                 target:"FCR, FCU, PT — isometric",                         desc:"Press wrist down into table or hand. No movement. 5–6/10 effort.",          sets:4, reps:1,  hold:45, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"No joint movement. Pain must not exceed 4/10.",           progression:"Isotonic wrist flexion → Eccentric loading" },
        { id:"el_wrist_flex_eccen", name:"Wrist Flexion Eccentric",                 target:"FCR, FCU — eccentric",                             desc:"Supinate forearm. Flex wrist, use other hand to extend eccentrically.",      sets:3, reps:15, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Slow eccentric (3–4s down). Control throughout.",         progression:"Increase load → Functional tools" },
        { id:"el_forearm_stretch",  name:"Forearm Flexor Stretch",                  target:"Forearm flexors — medial epicondyle",               desc:"Elbow extended. Wrist extended. Gentle overpressure with other hand.",       sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Feel stretch in forearm — not elbow pain.",               progression:"Add forearm supination → Neural component" },
      ],
      "Elbow Mobility": [
        { id:"el_pron_sup",         name:"Forearm Pronation-Supination",            target:"Pronator teres, supinator",                         desc:"Elbow at 90°. Slowly pronate and supinate. Use dowel for feedback.",         sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep elbow still. Move only at forearm.",                 progression:"Add resistance with weighted dowel" },
        { id:"el_active_flex_ext",  name:"Elbow Active ROM Flexion-Extension",      target:"Biceps, brachialis, triceps",                       desc:"Slowly flex and extend elbow through available range.",                      sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Move to comfortable end range. No forcing.",              progression:"Add gentle overpressure → Weighted ROM" },
        { id:"el_tricep_stretch",   name:"Triceps Stretch",                         target:"Triceps brachii, posterior capsule",                desc:"Arm overhead, elbow bent. Other hand pulls elbow back gently.",              sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep neck neutral. Feel posterior arm stretch.",           progression:"Add gentle overpressure → Combined shoulder stretch" },
      ],
    }
  },
  wrist_hand: {
    label:"Wrist & Hand", icon:"🖐", color:"#e879f9",
    categories: {
      "Wrist Rehabilitation": [
        { id:"wh_wrist_flex_ext",   name:"Wrist Flexion-Extension AROM",            target:"Wrist flexors and extensors",                      desc:"Forearm supported. Move wrist through flexion and extension slowly.",        sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Support forearm. Move only the wrist.",                   progression:"Add resistance → Wrist roller" },
        { id:"wh_radial_ulnar",     name:"Radial-Ulnar Deviation",                  target:"ECRL, ECU, FCR, FCU",                              desc:"Forearm pronated. Move wrist side to side.",                                 sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep forearm still. Controlled movement.",                progression:"Add resistance → Combined diagonal" },
        { id:"wh_tendon_glide",     name:"Tendon Gliding Exercises",                target:"FDP, FDS, extensor tendons",                       desc:"Sequence: straight → hook fist → full fist → flat fist → tip-pinch. 5s each.", sets:3, reps:10, hold:5, freq:"3×/day", phase:"Phase 1", evidence:"Strong",    cues:"Move through each position fully. Slow and controlled.",  progression:"Add resistance → Functional grip tasks" },
        { id:"wh_nerve_glide",      name:"Median Nerve Glide (CTS)",                target:"Median nerve — carpal tunnel",                     desc:"Wrist neutral. Extend fingers/wrist → add neck lateral flex away. Slider.", sets:3, reps:10, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Moderate", cues:"No pain. Mild stretch only. Smooth movement.",            progression:"Tensioner technique if slider resolves" },
        { id:"wh_grip_strength2",   name:"Grip and Pinch Strengthening",            target:"Intrinsic hand muscles, extrinsic flexors",        desc:"Putty or grip trainer. Full grip and 3-point pinch. Progressive resistance.", sets:3, reps:20, hold:2, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Full range. Maintain neutral wrist.",                      progression:"Increase resistance → Functional tools" },
        { id:"wh_finger_ext",       name:"Finger Extension Strengthening",          target:"Extensor digitorum — balanced grip",               desc:"Rubber band around fingers. Open hand against resistance. All fingers.",     sets:3, reps:20, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Fully open hand. Control return.",                        progression:"Increase resistance → Individual finger extensions" },
      ],
      "De Quervain's / Thumb": [
        { id:"wh_thumb_abduction",  name:"Thumb Abduction Strengthening",           target:"APL, EPB, APB",                                    desc:"Rubber band around thumb and index. Open against resistance.",               sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"No wrist deviation during exercise.",                     progression:"Increase band resistance → Pinch tasks" },
        { id:"wh_dq_stretch",       name:"Finkelstein Stretch (De Quervain's)",     target:"APL, EPB — De Quervain's syndrome",                desc:"Thumb in palm, fingers wrapped over. Ulnar deviate wrist gently. Hold.",    sets:3, reps:1,  hold:20, freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Gentle. Stop if sharp pain. Self-mobilisation only.",     progression:"Add gentle ulnar deviation in function" },
        { id:"wh_opposition",       name:"Thumb Opposition Exercises",              target:"Opponens pollicis, intrinsics — fine motor",       desc:"Touch thumb to each fingertip in sequence. Slow and precise.",              sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Precise contact. No substitution patterns.",              progression:"Add resistance with putty → Fine motor tasks" },
      ],
    }
  },
  lumbar: {
    label:"Lumbar Spine", icon:"🦴", color:"#ffb300",
    categories: {
      "Core Stabilisation": [
        { id:"lb_tva",              name:"Transversus Abdominis Activation",         target:"Transversus abdominis, multifidus",                desc:"Supine hook-lying. Draw navel 30% toward spine. Hold. No breath-holding.",  sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"30% contraction. Normal breathing. No rib flare.",        progression:"Leg slide → Dead bug → Plank" },
        { id:"lb_dead_bug",         name:"Dead Bug",                                 target:"TA, anti-extension core",                          desc:"Supine, arms up, hips/knees 90°. Lower opposite arm/leg toward floor.",     sets:3, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Lower back must NOT lift. Exhale as you lower.",          progression:"Resistance band → Both legs → Add weight" },
        { id:"lb_bird_dog",         name:"Bird Dog",                                 target:"Multifidus, gluteus maximus, anti-rotation core", desc:"Quadruped. Extend opposite arm/leg. Hold 8s. Return under control.",        sets:3, reps:10, hold:8,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Do not rotate pelvis. Squeeze glute on extended leg.",    progression:"Add resistance → Increase hold → 3-point bird dog" },
        { id:"lb_plank",            name:"Plank (Prone)",                            target:"TA, erector spinae, glutes",                       desc:"Forearms and toes. Neutral spine. Brace core. Hold.",                       sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Long body. Squeeze glutes. Do not hold breath.",          progression:"Increase hold → Side plank → Dynamic plank" },
        { id:"lb_side_plank",       name:"Side Plank",                               target:"Quadratus lumborum, obliques, glute medius",       desc:"Forearm side plank. Hips forward and up. Hold.",                            sets:3, reps:1,  hold:20, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Stack feet or stagger. Push hip to ceiling.",            progression:"Hip dip → Leg raise → Full side plank" },
        { id:"lb_hollow_hold",      name:"Hollow Body Hold",                         target:"Rectus abdominis, TA, hip flexors",                desc:"Supine. Press lower back flat. Arms overhead, legs extended and raised 6\".", sets:3, reps:1, hold:20, freq:"Daily",   phase:"Phase 2", evidence:"Moderate", cues:"Do not allow lower back to lift. Bend knees if needed.",  progression:"Increase hold → Add rocking motion" },
        { id:"lb_stir_pot",         name:"Stir the Pot (Swiss Ball)",                target:"TA, obliques, anti-rotation",                      desc:"Plank on Swiss ball. Trace large circles with elbows. Neutral spine.",       sets:3, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 3", evidence:"Strong",    cues:"Circles each direction. Don't let hips rotate.",          progression:"Increase circle size → Increase speed" },
        { id:"lb_rollout",          name:"Ab Wheel Rollout",                         target:"TA, latissimus — anti-extension strength",          desc:"Kneel with ab wheel. Roll forward maintaining flat back. Return.",           sets:3, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 3", evidence:"Strong",    cues:"Do NOT let hips sag. Neutral spine throughout.",          progression:"Increase ROM → Standing rollout" },
        { id:"lb_pelvic_tilt",      name:"Posterior Pelvic Tilt",                    target:"TA, glutes, lumbar flexors",                       desc:"Supine hook-lying. Flatten lower back against floor. Hold 10s.",            sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Breathe normally. Gently tighten abdomen.",               progression:"Standing PPT → Functional positions" },
      ],
      "Hip & Glute Integration": [
        { id:"lb_glute_bridge",     name:"Glute Bridge",                             target:"Gluteus maximus, hamstrings",                      desc:"Supine hook-lying. Drive hips up. Squeeze glutes. Hold 2s at top.",          sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Drive through heels. Neutral spine — don't hyperextend.", progression:"Single-leg → Add weight → Hip thrust" },
        { id:"lb_single_leg_bridge",name:"Single-Leg Bridge",                        target:"Gluteus maximus — unilateral loading",             desc:"Glute bridge with one leg extended. Drive through planted heel.",            sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep pelvis level. Squeeze glute on planted side.",       progression:"Add load → Hamstring curl on Swiss ball" },
        { id:"lb_hip_hinge",        name:"Hip Hinge (Deadlift Pattern)",             target:"Gluteus maximus, hamstrings, TA",                  desc:"Stand, hinge at hips NOT waist. Maintain neutral spine.",                    sets:3, reps:12, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Push hips back — not knees forward. Chest up.",           progression:"Dowel drill → Romanian DL → Conventional DL" },
        { id:"lb_hip_flexor",       name:"Hip Flexor Stretch (Kneeling Lunge)",      target:"Iliopsoas, rectus femoris",                        desc:"Kneeling lunge. Posterior pelvic tilt. Drive hip forward. Hold 30s.",        sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Tuck pelvis FIRST, THEN lean forward. No lumbar extension.", progression:"Add thoracic rotation → RNT lunge" },
        { id:"lb_suitcase_carry",   name:"Suitcase Carry (Lateral Stability)",       target:"QL, obliques, lateral stability",                  desc:"Hold weight in one hand. Walk maintaining level hips and shoulders.",        sets:3, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Don't let loaded side drop. Resist Trendelenburg.",       progression:"Increase load → Increase distance → Overhead carry" },
        { id:"lb_farmers_carry",    name:"Farmer's Carry",                           target:"Core stability, grip, postural endurance",         desc:"Hold heavy weights by sides. Walk with perfect posture 20m.",               sets:3, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Tall posture. Don't let weight pull shoulders down.",     progression:"Increase load → Suitcase carry → Overhead" },
      ],
      "McKenzie Extension": [
        { id:"lb_prone_lying",      name:"Prone Lying",                              target:"Lumbar extensors — posterior disc restoration",    desc:"Lie prone flat. Relax completely. 5 min.",                                   sets:3, reps:1,  hold:300,freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Pillow under abdomen if uncomfortable initially.",        progression:"Props on elbows → Press-ups → Standing extensions" },
        { id:"lb_press_up",         name:"McKenzie Press-Up",                        target:"Lumbar extensors — centralisation",                desc:"Prone. Hands under shoulders. Push upper body up. Pelvis stays down.",       sets:3, reps:10, hold:1,  freq:"2-hourly",  phase:"Phase 1", evidence:"Strong",    cues:"Let lumbar sag. Relax abdomen. Centralisation = good sign.", progression:"Increase reps → Sustained extension → Standing" },
        { id:"lb_standing_ext",     name:"Standing Extension",                       target:"Lumbar extensors — erect posture loading",         desc:"Stand with hands on low back. Extend lumbar spine backward 10 times.",       sets:3, reps:10, hold:1,  freq:"2-hourly",  phase:"Phase 1", evidence:"Strong",    cues:"Breathe out as you extend. Keep legs straight.",          progression:"Increase ROM → Add over-pressure with hands" },
      ],
      "Flexion & Mobility": [
        { id:"lb_knee_chest",       name:"Knee-to-Chest Stretch",                    target:"Lumbar extensors, facet joints, piriformis",       desc:"Supine. Both knees to chest. Gentle rocking. Hold 30s.",                    sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Do not pull head forward. Relax completely.",             progression:"Single knee → Figure 4 → Seated forward bend" },
        { id:"lb_cat_camel",        name:"Cat-Camel",                                target:"Lumbar & thoracic mobility — full range",           desc:"Quadruped. Arch up (cat) then sag (camel). Slow rhythmic.",                 sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Move to comfortable end range each way.",                 progression:"Add rotation → Combine with bird dog" },
        { id:"lb_rotation_stretch", name:"Supine Lumbar Rotation Stretch",           target:"Lumbar rotators, thoracic extensors, piriformis",  desc:"Supine, knees bent. Drop both knees to one side. Hold 30s.",                sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep shoulders flat. Let gravity rotate legs.",           progression:"Add leg extension → Add hip movement" },
        { id:"lb_piriformis",       name:"Piriformis Stretch",                       target:"Piriformis, deep hip external rotators",           desc:"Supine. Cross ankle over opposite knee. Pull thigh toward chest.",           sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep ankle flexed. Feel stretch deep in buttock.",        progression:"Seated figure 4 → Pigeon pose" },
      ],
      "Loading & Functional": [
        { id:"lb_squat",            name:"Squat Pattern Progression",                target:"Quadriceps, glutes, lumbar extensors",             desc:"Bodyweight squat — 3s descent, 1s pause, 1s rise.",                         sets:3, reps:12, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Neutral spine. Knees track toes. Hips back and down.",    progression:"Add weight → Bulgarian split squat → Single-leg" },
        { id:"lb_copenhagen",       name:"Copenhagen Hip Adduction",                 target:"Hip adductors — lateral pelvic stability",         desc:"Side plank. Top leg on bench. Lift bottom leg to meet it. Hold.",           sets:3, reps:10, hold:3,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Keep hips forward. Controlled lift.",                     progression:"Increase hold → Reduce support" },
      ],
    }
  },
  hip: {
    label:"Hip", icon:"🦴", color:"#f97316",
    categories: {
      "Gluteal Strengthening": [
        { id:"hp_clam",             name:"Clamshells",                               target:"Gluteus medius, hip external rotators",            desc:"Side-lying, hips 45° flexed. Rotate top knee up. Keep pelvis still.",        sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Do not rotate pelvis backward.",                          progression:"Resistance band → Side-lying abduction → Standing" },
        { id:"hp_lat_walk",         name:"Lateral Band Walks",                       target:"Gluteus medius, minimus, TFL",                     desc:"Band around ankles/knees. Semi-squat. Step sideways.",                       sets:3, reps:15, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep knees tracking over toes. Control trailing leg.",    progression:"Monster walks → Increase resistance → Single-leg" },
        { id:"hp_hip_thrust",       name:"Hip Thrust",                               target:"Gluteus maximus — highest EMG",                    desc:"Upper back on bench, feet flat. Drive hips up. Squeeze glutes at top.",     sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Neutral spine at top. Drive through heels.",              progression:"Barbell → Single-leg → Banded hip thrust" },
        { id:"hp_step_up",          name:"Step-Ups",                                 target:"Gluteus maximus, hip abductors, quadriceps",       desc:"Step onto box. Drive through heel. Control lowering.",                       sets:3, reps:12, hold:1,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Lean slightly forward. Don't push off back foot.",        progression:"Increase step height → Add weight → Lateral step-ups" },
        { id:"hp_monster_walk",     name:"Monster Walks (Forward/Backward)",         target:"Gluteus medius, TFL — dynamic stability",          desc:"Band around ankles. Walk forward/backward in quarter-squat.",               sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Toe out slightly. Keep knees slightly bent.",             progression:"Increase resistance → Add diagonal direction" },
        { id:"hp_fire_hydrant",     name:"Fire Hydrant",                             target:"Gluteus medius, hip abductors",                    desc:"Quadruped. Lift knee out to side maintaining hip height.",                   sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Do not rotate pelvis or shift weight.",                   progression:"Add resistance band → Extend leg → Standing" },
        { id:"hp_standing_abd",     name:"Standing Hip Abduction",                   target:"Gluteus medius, minimus",                          desc:"Stand on one leg. Lift other leg out to side 30–40°. Control return.",       sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep pelvis level. No Trendelenburg.",                    progression:"Add ankle weight → Cable → SL balance with abduction" },
        { id:"hp_side_step_squat",  name:"Side-Step Squats with Band",               target:"Gluteus medius, quadriceps — functional",          desc:"Band above knees. Squat position. Side steps maintaining knee alignment.",   sets:3, reps:20, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Stay low throughout. Knees over toes.",                   progression:"Increase resistance → Add overhead press" },
      ],
      "Mobility & Flexibility": [
        { id:"hp_90_90",            name:"90/90 Hip Stretch",                        target:"Hip IR & ER — both hips",                          desc:"Seated on floor, both hips at 90°. Sit tall. Hold 60s per side.",           sets:2, reps:1,  hold:60, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Both sit bones on floor. Breathe.",                       progression:"Forward fold → Lateral lean → Dynamic transitions" },
        { id:"hp_pigeon",           name:"Pigeon Pose",                              target:"Piriformis, deep hip external rotators",           desc:"Front leg at 90°. Back leg extended. Lower chest forward.",                  sets:3, reps:1,  hold:60, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Front foot flexed. Square hips.",                         progression:"Quad stretch add-on → Supported → Dynamic pigeon" },
        { id:"hp_thomas",           name:"Thomas Test Stretch",                      target:"Iliopsoas, rectus femoris",                        desc:"Supine at table edge. Hold one knee. Let other leg hang and feel stretch.", sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Lumbar flat. No external rotation of hanging leg.",       progression:"Add knee bend (RF) → Standing lunge → RNT lunge" },
        { id:"hp_adductor_stretch", name:"Adductor Stretch (Butterfly)",             target:"Hip adductors — groin",                            desc:"Seated. Soles of feet together. Gently press knees toward floor.",           sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Lean forward from hips — don't round lower back.",        progression:"Increase ROM → Side-lying → Standing sumo stretch" },
        { id:"hp_ober_stretch",     name:"IT Band / TFL Stretch (Ober's)",           target:"IT band, TFL",                                     desc:"Side-lying. Top leg extended behind body. Allow to drop by gravity.",        sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Hips stacked. Don't flex hip — extend and adduct.",      progression:"Cross-leg stretch → Foam roller → Lateral wall stretch" },
        { id:"hp_couch_stretch",    name:"Couch Stretch (Rectus Femoris)",           target:"Rectus femoris, hip flexors",                      desc:"Rear foot against wall. Front leg forward. PPT first. Upright posture.",     sets:3, reps:1,  hold:45, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"PPT first. Feel stretch front of thigh — not knee.",     progression:"Increase hold → Add trunk extension → Walking lunge" },
      ],
      "Hip Flexor Loading": [
        { id:"hp_psoas_march",      name:"Psoas March",                              target:"Iliopsoas, TA — coordinated loading",               desc:"Standing. Resist hip flexion with hand. March in place with resistance.",    sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Maintain upright posture. Don't lean back.",              progression:"Band resistance → Step up → Single-leg balance march" },
        { id:"hp_hip_flex_raise",   name:"Seated Hip Flexion Raise",                 target:"Iliopsoas — rehabilitation loading",                desc:"Seated on edge of table. Slowly raise knee 5cm. Hold 10s. Lower.",           sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Don't lean back. Isolated hip flexion.",                  progression:"Add resistance above knee → Standing → Resisted march" },
      ],
    }
  },
  knee: {
    label:"Knee", icon:"🦵", color:"#22d3ee",
    categories: {
      "Quadriceps": [
        { id:"kn_tqe",              name:"Terminal Knee Extension (TKE)",            target:"VMO — last 30° extension",                         desc:"Band behind knee. Drive to full extension against resistance.",              sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Full extension — lock knee out. Keep foot on floor.",     progression:"Increase resistance → Single-leg → Mini-squat" },
        { id:"kn_vmo_squat",        name:"VMO Squat (Narrow Stance)",                target:"VMO — medial quadriceps",                          desc:"Narrow stance, toes slightly out. Squat to 60°.",                            sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Track knee over 2nd toe. No knee cave.",                  progression:"Add weight → Bulgarian split squat → Single-leg" },
        { id:"kn_step_down",        name:"Eccentric Step-Down",                      target:"Quadriceps eccentric, glute medius — alignment",   desc:"Stand on step. Lower heel of other foot to floor in 4 seconds.",            sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"4-second lowering. Knee tracks over toe. No valgus.",     progression:"Increase step height → Add weight vest → SL squat" },
        { id:"kn_sit_to_stand",     name:"Sit-to-Stand (Chair Squats)",              target:"Quadriceps, glutes — functional pattern",          desc:"Rise from chair slowly (3s). Control lowering (3s). Hold at top.",           sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Lean forward first. Drive through heels. Stand tall.",    progression:"Lower chair → Add weight → One-legged STS" },
        { id:"kn_quad_set",         name:"Quad Set (Isometric Quad Contraction)",    target:"Quadriceps — isometric",                           desc:"Supine. Towel under knee. Press knee down into towel. Hold 10s.",            sets:3, reps:10, hold:10, freq:"Hourly",   phase:"Phase 1", evidence:"Strong",    cues:"Feel quads tighten without knee moving.",                 progression:"Straight leg raise → TKE" },
        { id:"kn_straight_leg",     name:"Straight Leg Raise",                       target:"Quadriceps (isometric), hip flexors",               desc:"Supine. Quad set first. Raise straight leg to 45°. Hold 2s. Lower.",         sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Quad set BEFORE raising. Keep foot dorsiflexed.",         progression:"Add ankle weight → Progress to TKE" },
        { id:"kn_leg_press",        name:"Leg Press (Short Arc)",                    target:"Quadriceps, glutes — controlled loading",          desc:"Leg press machine. Start from 90°. Extend to full extension. Slow return.",  sets:3, reps:12, hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong",    cues:"Push through whole foot. Control lowering 3–4s.",         progression:"Increase load → Full range → Single-leg" },
      ],
      "Hamstrings": [
        { id:"kn_nordic",           name:"Nordic Hamstring Curl",                    target:"Biceps femoris, semimembranosus — eccentric",      desc:"Kneel, feet anchored. Lower body slowly controlling with hamstrings.",       sets:3, reps:6,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strongest — 51% hamstring injury reduction", cues:"Lower as slowly as possible. Push up with hands.",        progression:"Increase reps → Add resistance → Glider curl" },
        { id:"kn_rdl",              name:"Romanian Deadlift (RDL)",                  target:"Hamstrings, gluteus maximus",                      desc:"Hinge at hips. Lower bar along legs. Feel hamstring stretch.",               sets:3, reps:12, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Bar stays close to legs. Neutral spine.",                 progression:"Single-leg → Add weight → Deficit RDL" },
        { id:"kn_prone_curl",       name:"Prone Hamstring Curl",                     target:"Hamstrings — isolated loading",                    desc:"Prone. Bend knee against gravity or resistance. Slow eccentric return.",      sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Hip stays down. Control lowering (3–4s).",                progression:"Add resistance → Single-leg → Glider curl" },
        { id:"kn_glider_curl",      name:"Swiss Ball Hamstring Curl",                target:"Hamstrings, glutes — closed chain",                desc:"Supine, feet on ball. Bridge up. Curl feet toward hips.",                    sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep hips up throughout. Control return.",                progression:"Single-leg → Add eccentric phase only" },
        { id:"kn_hamstring_str",    name:"Hamstring Stretch (Supine)",               target:"Hamstrings — neural and muscular",                 desc:"Supine. Hold thigh. Extend knee until stretch felt. Hold 30s.",              sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"PPT to increase neural component.",                       progression:"Standing → Hurdler stretch → Slump add-on" },
      ],
      "Patellar Tendinopathy": [
        { id:"kn_isometric_wall",   name:"Isometric Wall Sit",                       target:"Patellar tendon — isometric analgesic",            desc:"Back against wall. Squat at 60–90°. Both legs.",                            sets:4, reps:1,  hold:45, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"60–90° knee bend. 70% effort. No pain >4/10.",            progression:"Single-leg → Add weight → Isotonic" },
        { id:"kn_slow_squat",       name:"Heavy Slow Resistance Squat",              target:"Patellar tendon — isotonic loading",               desc:"Slow tempo squat: 3s down, 3s up. Progressive load.",                        sets:4, reps:8,  hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong — Kongsgaard protocol", cues:"3s down, 2s pause, 3s up. Progress load weekly.",         progression:"Increase load → Single-leg → Plyometric" },
        { id:"kn_decline_squat",    name:"Decline Board Squat",                      target:"Patellar tendon — high load eccentrics",           desc:"Stand on 25° decline board. Single-leg squat. Slow eccentric.",              sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Use hands for balance initially. Slow down.",             progression:"Increase decline → Add load → Hop landing" },
      ],
      "ACL Rehab": [
        { id:"kn_acl_phase1",       name:"Early ACL Quad Activation",                target:"Quadriceps — ACL graft protection",                desc:"Quad sets + SLR + TKE (0–90°). Avoid open chain 0–45° for 12 weeks.",       sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Avoid full extension open chain in early graft healing.", progression:"Progress range at 12 weeks → Closed chain loading" },
        { id:"kn_acl_balance",      name:"Neuromuscular Control — Single Leg",       target:"Proprioception, quadriceps, glute med — ACL",     desc:"Single-leg balance. Eyes closed. Perturbation. Landing training.",          sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Slight knee flexion. React to perturbations.",            progression:"Unstable surface → Perturbation → Jump landing" },
        { id:"kn_drop_jump",        name:"Drop Jump Landing Training",               target:"Quadriceps, glutes — ACL prevention",              desc:"Step off box. Land softly with triple flexion. Hold 2s.",                    sets:3, reps:8,  hold:2,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Land soft — quiet feet. Hips back, knees tracking.",     progression:"Increase height → Add lateral → Sprint → Cut" },
      ],
    }
  },
  ankle: {
    label:"Ankle & Foot", icon:"👣", color:"#a3e635",
    categories: {
      "Achilles Tendinopathy": [
        { id:"ank_ec_drop",         name:"Eccentric Heel Drop (Alfredson)",          target:"Gastrocnemius, soleus — eccentric",                desc:"Stand on step. Rise with both feet, lower with one. Full range.",            sets:3, reps:15, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Strongest — gold standard", cues:"Lower all the way. Use other foot to rise. Through PAIN.", progression:"Add backpack weight (10% BW) → Increase weekly" },
        { id:"ank_isometric_calf",  name:"Isometric Calf Hold",                      target:"Achilles — isometric analgesic",                   desc:"Single-leg calf raise hold at top. 45s holds.",                             sets:4, reps:1,  hold:45, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Max comfortable effort. Burning is normal.",              progression:"Progress to Alfredson protocol" },
        { id:"ank_heavy_slow_calf", name:"Heavy Slow Resistance Calf Raise",         target:"Achilles tendon — isotonic remodelling",           desc:"Seated (soleus) + standing (gastrocnemius). Slow 3:3 tempo with load.",      sets:4, reps:8,  hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong",    cues:"3s up, 2s hold, 3s down. Progress load weekly.",          progression:"Increase load → Single-leg → Plyometric" },
      ],
      "Ankle Stability": [
        { id:"ank_single_leg",      name:"Single Leg Balance",                       target:"Peroneals, ankle stabilisers, proprioception",     desc:"Stand on one leg. Eyes open → eyes closed.",                                sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Slight knee bend. Focus point at eye level.",             progression:"Eyes closed → Unstable surface → SEBT → Perturbation" },
        { id:"ank_peroneal",        name:"Peroneal Strengthening (Eversion)",        target:"Peroneus longus & brevis",                         desc:"Band around foot. Evert outward against resistance. Slow controlled.",       sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Move only at ankle — not knee or hip.",                   progression:"Increase resistance → Standing eversion → Lateral hops" },
        { id:"ank_calf_raise",      name:"Single-Leg Calf Raise",                    target:"Gastrocnemius, soleus, FHL",                       desc:"Single-leg calf raise. 3s up, 2s hold, 3s down.",                           sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Full plantarflexion at top. Control eccentric.",          progression:"Add load → Plyometric → Eccentric drop" },
        { id:"ank_reach_sebt",      name:"Star Excursion Balance (SEBT) Reaches",   target:"Ankle stability, glutes, proprioception",          desc:"Single-leg stance. Reach other foot in 8 directions as far as possible.",   sets:3, reps:6,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Touch and return — don't weight bear on reaching foot.",  progression:"Increase reach distance → Add perturbation" },
        { id:"ank_lateral_hops",    name:"Lateral Hop Progression",                  target:"Peroneals, ankle stabilisers — reactive",          desc:"Hop laterally over line. Double-leg → single-leg. Land softly.",             sets:3, reps:10, hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Quiet landing. Triple flexion. No valgus collapse.",     progression:"Increase distance → Add forward component → Speed" },
        { id:"ank_tibialis_ant",    name:"Tibialis Anterior Strengthening",          target:"Tibialis anterior — dorsiflexion",                 desc:"Band around foot. Dorsiflex (pull toes up) against resistance.",             sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Move only at ankle. Full range dorsiflexion.",            progression:"Increase resistance → Eccentric lowering → Heel walks" },
      ],
      "Plantar Fascia": [
        { id:"ank_short_foot",      name:"Short Foot Exercise",                      target:"Intrinsic foot muscles, tibialis posterior",       desc:"Draw ball of foot toward heel without curling toes. Dome the arch.",         sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Don't curl toes. Don't roll inward.",                     progression:"Standing → Single-leg → Walking short foot" },
        { id:"ank_pf_stretch",      name:"Plantar Fascia Stretch",                   target:"Plantar fascia, toe flexors",                      desc:"Cross foot over knee. Pull toes back. Hold.",                                sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Pull toes back — feel stretch in arch. Before first steps.", progression:"Wall toe stretch → Towel stretch → Calf combine" },
        { id:"ank_calf_stretch",    name:"Gastrocnemius Calf Stretch",               target:"Gastrocnemius, Achilles",                          desc:"Wall stretch. Rear leg straight. Heel on floor. Hold 30s.",                  sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Keep heel down. Knee straight.",                          progression:"Bent knee (soleus) → Eccentric drops" },
        { id:"ank_marble_pickup",   name:"Towel Scrunch / Marble Pickup",            target:"Intrinsic foot muscles",                           desc:"Seated. Scrunch towel with toes or pick up marbles with toes.",              sets:3, reps:20, hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Work through full toe flexion range.",                    progression:"Short foot → Single-leg balance → Toe yoga" },
      ],
    }
  },
  thoracic: {
    label:"Thoracic Spine", icon:"🫀", color:"#d946ef",
    categories: {
      "Mobility": [
        { id:"tx_foam_ext",         name:"Thoracic Extension on Foam Roller",        target:"Thoracic extensors, posterior capsule",            desc:"Foam roller across mid-thoracic. Extend over roller. Breathe out.",          sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Work each segment. Support head. Exhale on extension.",   progression:"Add rotation → Book openings → Manipulation" },
        { id:"tx_book_open",        name:"Book Openings (Thoracic Rotation)",        target:"Thoracic rotators, posterior capsule, pectorals", desc:"Side-lying, knees 90°. Top arm opens chest to ceiling.",                    sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Knees stacked and still. Let arm fall with gravity.",     progression:"Band resistance → Quadruped rotation → Standing" },
        { id:"tx_quadruped_rot",    name:"Quadruped Thoracic Rotation",              target:"Thoracic rotators",                                desc:"Quadruped. Hand behind head. Rotate thorax — elbow to ceiling.",             sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep lumbar still. Rotate thorax only.",                  progression:"Add resistance → Standing rotation → Woodchop" },
        { id:"tx_thread_needle",    name:"Thread the Needle",                        target:"Thoracic rotators, shoulder mobility combined",    desc:"Quadruped. One arm threads under body toward opposite side.",                sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Let shoulder rest on floor at end range.",                progression:"Add arm reach overhead → Dynamic movement" },
        { id:"tx_seated_rot",       name:"Seated Thoracic Rotation",                 target:"Thoracic rotators, rib cage mobility",             desc:"Seated. Arms crossed. Rotate thorax each direction. Breathe out.",           sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Initiate from thorax — not lumbar. Keep hips still.",     progression:"Add overpressure → Standing → Band resistance" },
        { id:"tx_rib_mobilise",     name:"Rib Mobilisation Breathing",               target:"Intercostals, rib cage — respiratory mobility",    desc:"Supine or seated. Breathe deeply into sides and back.",                     sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Breathe into the resistance. Expand in all directions.",  progression:"Add resistance with hand → Seated → Standing" },
        { id:"tx_thoracic_snag",    name:"Thoracic Self-SNAG",                       target:"Thoracic facet joints — mobilisation with movement", desc:"Towel around spinous process. Pull forward as you flex thorax.",           sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Pull towel forward AND up slightly as you flex.",         progression:"Add rotation → Therapist-applied SNAG" },
      ],
      "Strengthening": [
        { id:"tx_prone_cobra",      name:"Prone Cobra",                              target:"Thoracic extensors, lower trapezius, rhomboids",   desc:"Prone. Arms at side thumbs up. Lift chest off floor. Hold 2s.",             sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Depress scapulae first. No neck extension.",              progression:"Add arm positions → Prone Y/T/W → Band resistance" },
        { id:"tx_seated_row",       name:"Seated Row",                               target:"Mid trapezius, rhomboids, thoracic extensors",     desc:"Cable or band row to lower chest. Elbows tucked. Retract scapulae.",         sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Pull elbows past torso. Squeeze blades together at end.", progression:"Increase resistance → Single-arm → Split-stance" },
        { id:"tx_pull_down",        name:"Lat Pull-Down",                            target:"Latissimus dorsi, thoracic extensors, lower trap", desc:"Wide or narrow grip. Pull bar to upper chest. Depress scapulae.",           sets:3, reps:12, hold:2,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong",    cues:"Lead with elbows. Don't lean back excessively.",          progression:"Increase weight → Neutral grip → Single-arm → Pull-up" },
      ],
    }
  },
  posture_correction: {
    label:"Posture Correction", icon:"🧍", color:"#ff4d6d",
    categories: {
      "Upper Crossed Syndrome": [
        { id:"pc_ucs_chin",         name:"Chin Tuck + Scapular Retraction",          target:"DNF, lower/mid trap — UCS correction",            desc:"Chin tuck + retract and depress scapulae simultaneously. Hold 5s.",          sets:3, reps:10, hold:5,  freq:"Hourly",   phase:"Phase 1", evidence:"Strong",    cues:"Two movements together. Eyes level. No shoulder shrug.",  progression:"Wall angle → Add resistance → Functional carry-over" },
        { id:"pc_band_pullap",      name:"Band Pull-Aparts",                         target:"Mid/lower trapezius, posterior deltoid, ER",       desc:"Band at arm's length. Pull apart horizontally.",                             sets:3, reps:20, hold:1,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Keep arms straight. Squeeze blades at end range.",        progression:"Increase resistance → Face pulls → Prone Y" },
        { id:"pc_pec_foam",         name:"Pec Stretch on Foam Roller",               target:"Pectoralis major & minor, anterior capsule",       desc:"Supine on foam roller. Arms out 90°. Let gravity open chest.",               sets:1, reps:1,  hold:120,freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Relax completely. Gravity does the work.",                progression:"Increase hold → Add arm elevation → IR/ER in position" },
        { id:"pc_levator_str",      name:"Levator Scapulae Stretch",                 target:"Levator scapulae — UCS component",                 desc:"Look down 45°. Rotate head 45° away. Side bend. Gentle overpressure.",       sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Depression of opposite shoulder increases stretch.",      progression:"Add neural component → Sustained hold → Self-SNAG" },
        { id:"pc_wall_angel",       name:"Wall Angels",                              target:"Thoracic extensors, lower trap, serratus",         desc:"Stand with back to wall (head, thoracic, pelvis, heels touching). Raise arms above head keeping contact.", sets:3, reps:10, hold:2, freq:"Daily", phase:"Phase 1", evidence:"Strong", cues:"Keep entire spine on wall throughout movement.",          progression:"Add band resistance → Add thoracic extension hold" },
        { id:"pc_brugger_relief",   name:"Brügger Relief Position",                  target:"Thoracic extensors, serratus — sitting posture",   desc:"Sit at edge of chair. Pelvis slightly anteriorly tilted. Arms ER. Breathe.", sets:3, reps:1, hold:30, freq:"Hourly",   phase:"Phase 1", evidence:"Moderate", cues:"Sit bones out. Thumbs back. Chest open. Breathe.",        progression:"Add arm raises → Use in standing" },
      ],
      "Lower Crossed Syndrome": [
        { id:"pc_lcs_bridge",       name:"Glute Activation Bridge",                  target:"Gluteus maximus — LCS pattern",                    desc:"Supine bridge with glute squeeze cue. Anterior pelvic tilt correction.",     sets:3, reps:15, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Squeeze glutes — don't just lift hips.",                  progression:"Single-leg → Resistance → Hip thrust" },
        { id:"pc_hip_flex_str",     name:"Kneeling Hip Flexor Stretch with PPT",     target:"Iliopsoas — LCS correction",                       desc:"Kneeling lunge. PPT first. Then lean forward into stretch.",                 sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Tilt pelvis first. Feel deep front of hip — not thigh.", progression:"Add thoracic rotation → RNT lunge" },
        { id:"pc_pallof",           name:"Pallof Press (Anti-Rotation)",              target:"Core anti-rotation, obliques, TA",                 desc:"Cable/band at chest height. Press out and hold 2s.",                         sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Do not rotate toward cable. Resist the pull.",            progression:"Increase resistance → Half-kneeling → Single-leg" },
        { id:"pc_hamstring_str",    name:"Hamstring Lengthening (LCS)",              target:"Hamstrings — LCS pattern",                         desc:"Supine active knee extension. PPT to remove neural. Pure hamstring.",         sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"PPT first. Focus muscular stretch.",                      progression:"Doorway stretch → Standing → Dynamic lunge stretch" },
      ],
      "Thoracic Mobility": [
        { id:"pc_foam_ext",         name:"Thoracic Extension on Foam Roller",        target:"Thoracic extensors, posterior capsule",            desc:"Foam roller across mid-thoracic. Extend over roller. Breathe.",              sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Work each segment. Support head. Breathe out.",          progression:"Add rotation → Book openings" },
        { id:"pc_book_open",        name:"Book Openings",                            target:"Thoracic rotators, pectorals",                     desc:"Side-lying, knees 90°. Top arm opens chest to ceiling.",                    sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Keep knees stacked. Let arm fall with gravity.",          progression:"Band resistance → Quadruped rotation → Standing" },
        { id:"pc_doorway_pec",      name:"Doorway Pec Minor Stretch",                target:"Pectoralis minor — forward shoulder correction",   desc:"Forearm against doorframe at 90°. Step through. Lean into stretch.",         sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Feel stretch in anterior chest. Don't arch lower back.",  progression:"Bilateral → Change angle → Dynamic add shoulder IR/ER" },
      ],
    }
  },
  respiratory: {
    label:"Respiratory / Breathing", icon:"🫁", color:"#38bdf8",
    categories: {
      "Breathing Pattern Retraining": [
        { id:"resp_diaphragm",      name:"Diaphragmatic Breathing",                  target:"Diaphragm, accessory muscles — inhibition",        desc:"Supine. Hand on abdomen. Belly rises FIRST. Slow exhale.",                   sets:1, reps:10, hold:0,  freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Belly rises first — not chest. 5s in, 7s out.",          progression:"Seated → Standing → Walking → Exercise" },
        { id:"resp_lateral_costal", name:"Lateral Costal Breathing",                 target:"Intercostals, lower ribs — segmental breathing",   desc:"Hands on lower ribs. Breathe into hand resistance. Expand laterally.",       sets:1, reps:10, hold:5,  freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Breathe into the sides and back — not up.",              progression:"Add manual resistance → Respiratory snorkel" },
        { id:"resp_pursed_lip",     name:"Pursed Lip Breathing",                     target:"Respiratory — COPD/dyspnoea management",           desc:"Inhale through nose 2s. Exhale through pursed lips 4s.",                     sets:1, reps:10, hold:0,  freq:"When breathless", phase:"Phase 1", evidence:"Strong", cues:"Slow exhale — don't force. Reduces air trapping.",       progression:"During activity → Exercise → Stress management" },
        { id:"resp_4_7_8",          name:"4-7-8 Breathing",                          target:"Autonomic nervous system — pain and anxiety",      desc:"Inhale 4s, hold 7s, exhale 8s. Activates parasympathetic.",                  sets:1, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Tongue on roof of mouth. Full exhale through mouth.",     progression:"Increase to 5 cycles → Use before therapy" },
        { id:"resp_postural_breathe",name:"Breathing with Spinal Correction",        target:"Thoracic mobility + breathing integration",        desc:"Brügger position. Breathe diaphragmatically. Integrate posture and breath.", sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Posture and breathing linked. Open anterior chest.",      progression:"Add arm movements → Walking with breathing" },
      ],
      "Respiratory Strengthening": [
        { id:"resp_imst",           name:"Inspiratory Muscle Training (IMT)",        target:"Diaphragm, intercostals — inspiratory strength",   desc:"Threshold IMT device. 30% PImax. 30 breaths once daily.",                   sets:1, reps:30, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Breathe hard in against resistance. Exhale normally.",   progression:"Increase resistance 5% weekly → Sport integration" },
        { id:"resp_acbt",           name:"Active Cycle of Breathing Technique",      target:"Secretion clearance — chest physiotherapy",        desc:"Breathing control → 3–4 thoracic expansion exercises → forced expirations.", sets:3, reps:1, hold:0,  freq:"2–3×/day", phase:"Phase 1", evidence:"Strong",    cues:"Relaxed breathing first. Sniff and huff — not cough.",   progression:"Add postural drainage → Percussions → Autogenic drainage" },
      ],
    }
  },
  neurological: {
    label:"Neurological Rehab", icon:"🧠", color:"#a78bfa",
    categories: {
      "Balance & Proprioception": [
        { id:"neuro_tandem",        name:"Tandem (Heel-Toe) Walking",                target:"Vestibular, proprioception, core — balance",       desc:"Walk placing heel directly in front of toe. Maintain steady gaze.",          sets:3, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Focus on fixed point. Arms out initially.",               progression:"Eyes closed → On foam → Backward → Head turns" },
        { id:"neuro_romberg",       name:"Romberg / Sharpened Romberg",              target:"Vestibular, somatosensory — balance",              desc:"Feet together (Romberg) or heel-to-toe (Sharpened). Eyes open → closed.",    sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Safe environment. Standing frame nearby initially.",      progression:"Eyes closed → Foam surface → Perturbation" },
        { id:"neuro_foam_balance",  name:"Foam Pad Standing Balance",                target:"Proprioceptive ankle and knee — multisensory",     desc:"Stand on foam pad. Challenge balance by removing visual cues.",              sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Arms out for assistance if needed. Near support.",        progression:"Single-leg → Head movements → Perturbation → Dual task" },
        { id:"neuro_dual_task",     name:"Dual-Task Training",                       target:"Cognitive-motor integration — falls prevention",   desc:"Walk while counting backwards, carrying object, or answering questions.",    sets:3, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Do not pause walking to think. Maintain gait.",           progression:"Increase cognitive task difficulty → Timed track" },
      ],
      "Gait Training": [
        { id:"neuro_high_step",     name:"High Stepping Gait Drill",                 target:"Hip flexors, dorsiflexors — gait pattern",         desc:"Exaggerated high knee lift during walking. Focus on clearance.",             sets:3, reps:20, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Step high. Land heel first. Maintain upright posture.",   progression:"Add treadmill → Add perturbation → Speed" },
        { id:"neuro_treadmill_bw",  name:"Body-Weight Supported Treadmill Training", target:"Lower limb motor — neurological gait",            desc:"Partial body-weight support. Repetitive gait practice.",                     sets:1, reps:1,  hold:0,  freq:"5×/week",  phase:"Phase 2", evidence:"Strongest — neuroplasticity and gait recovery", cues:"Step naturally. Reduce support progressively.",          progression:"Reduce support % → Increase speed → Overground" },
      ],
      "Motor Relearning": [
        { id:"neuro_task_practice", name:"Task-Specific Practice (Sit-to-Stand)",    target:"Motor learning — functional task",                 desc:"Repetitive sit-to-stand practice. Massed practice for neuroplasticity.",     sets:5, reps:10, hold:0,  freq:"3×/day",   phase:"Phase 2", evidence:"Strongest", cues:"Lean forward first. Equal weight. Stand tall.",           progression:"Vary chair height → Add modifications → Single-leg STS" },
        { id:"neuro_mirror",        name:"Mirror Therapy",                           target:"Motor cortex — phantom limb / CRPS",               desc:"Mirror box. Move intact limb. Brain sees reflection as affected limb.",      sets:3, reps:10, hold:0,  freq:"3×/day",   phase:"Phase 2", evidence:"Strong",    cues:"Focus on mirror — not on affected limb.",                progression:"Progress complexity → Virtual reality" },
      ],
    }
  },
  pelvic_floor: {
    label:"Pelvic Floor & Continence", icon:"🌸", color:"#fb7185",
    categories: {
      "Pelvic Floor Strengthening": [
        { id:"pf_kegel",            name:"Pelvic Floor Contraction (Kegel)",         target:"Levator ani, pubococcygeus — stress incontinence", desc:"Squeeze and lift pelvic floor. Hold 10s. Relax fully 10s. No breath holding.", sets:3, reps:10, hold:10, freq:"3×/day", phase:"Phase 1", evidence:"Strongest — gold standard", cues:"Squeeze UP and IN. Don't tighten buttocks or thighs.",   progression:"Increase hold → Add quick flicks → Functional positions" },
        { id:"pf_quick_flick",      name:"Quick Flick Contractions",                 target:"Type II pelvic floor fibres — urgency control",    desc:"Rapid squeeze and release. 1s on, 1s off.",                                  sets:3, reps:10, hold:0,  freq:"3×/day",   phase:"Phase 2", evidence:"Strong",    cues:"Fast on-off. No substitution patterns.",                  progression:"Increase reps → Progress to functional activities" },
        { id:"pf_functional",       name:"Pelvic Floor Bracing with Lifting",        target:"Pelvic floor + TA — load management",              desc:"Contract pelvic floor BEFORE lifting, coughing, sneezing.",                  sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"The knack — contract before the pressure.",               progression:"Increase load → Walking → Exercise" },
        { id:"pf_relaxation",       name:"Pelvic Floor Downtraining / Relaxation",   target:"Hypertonic pelvic floor — pain / vaginismus",     desc:"Diaphragmatic breath. On exhale consciously relax pelvic floor completely.", sets:3, reps:10, hold:10, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Let go completely. Soft belly. Soft pelvic floor.",       progression:"Add visualisation → Supine → Seated → Standing" },
      ],
      "Pelvic Girdle / SIJ": [
        { id:"pf_sij_bridge",       name:"SIJ Load Transfer — Clam Bridge",          target:"Glute medius, pelvic floor — SIJ stability",      desc:"Glute bridge with resistance band. Clam hips simultaneously.",              sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Press knees against band. Squeeze glutes. Neutral spine.", progression:"Add weight → Single-leg → SIJ self-belt technique" },
        { id:"pf_abductor_iso",     name:"Hip Abductor Isometrics (SIJ)",            target:"Gluteus medius — SIJ force closure",               desc:"Side-lying or standing. Isometric abduction against wall or band.",          sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"No movement. Steady force. Breathe normally.",            progression:"Isotonic clamshells → Lateral band walks" },
      ],
    }
  },
  older_adult: {
    label:"Older Adult / Frailty", icon:"👴", color:"#78716c",
    categories: {
      "Falls Prevention (Otago Programme)": [
        { id:"oa_otago_ankle",      name:"Otago — Ankle Strengthening",              target:"Ankle dorsiflexors/plantarflexors — falls prevention", desc:"Seated. Lift toes then heels repeatedly. 10 each. Progress to standing.", sets:3, reps:10, hold:2, freq:"Daily",    phase:"Phase 1", evidence:"Strongest — 35% falls reduction", cues:"Full range. Both directions. Hold surface if needed.",    progression:"Standing → Single-leg → Add ankle weights" },
        { id:"oa_otago_knee",       name:"Otago — Knee Extension",                   target:"Quadriceps — falls prevention",                    desc:"Seated. Extend knee slowly. Add ankle weight progressively.",                sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Full extension. Slow lowering (4s).",                     progression:"Add weight → Standing → Stair practice" },
        { id:"oa_otago_walk",       name:"Otago Walking Programme",                  target:"Gait confidence — falls prevention",                desc:"Structured walking. 3×/week, increasing 5 min monthly to 30 min.",           sets:1, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strongest", cues:"Safe footwear. Walking aid if required.",                  progression:"Increase distance → Add uneven terrain → Steps" },
        { id:"oa_stepping",         name:"Step Training / Perturbation Training",    target:"Reactive balance — falls prevention",               desc:"Rapid reactive stepping drills. Step onto targets. Perturbation catches.",   sets:3, reps:10, hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong",    cues:"Near support. React — don't anticipate.",                 progression:"Increase perturbation intensity → Dual task" },
        { id:"oa_tug",              name:"Timed Up and Go (TUG) Practice",           target:"Functional mobility — gait and balance",           desc:"Rise from chair. Walk 3m. Turn. Walk back. Sit. Practice to improve.",        sets:3, reps:5, hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Normal walking aid if used. Turn safely.",                progression:"Faster → Dual task → Narrow corridor → Obstacle" },
      ],
      "Sarcopenia Prevention": [
        { id:"oa_resistance",       name:"Progressive Resistance Training (Older Adult)", target:"Muscle mass, bone density — sarcopenia",     desc:"Major muscle groups. 60–70% 1RM. 2–3 sets. 8–12 reps. 2–3×/week.",        sets:3, reps:10, hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strongest", cues:"Safe technique. Slow controlled. No breath-holding.",     progression:"Increase load 5% when achieving 15 reps × 2 sets" },
        { id:"oa_power_training",   name:"Power Training (Older Adult)",             target:"Fast-twitch fibres — fall recovery speed",         desc:"Squat with faster concentric phase. Same controlled lowering.",              sets:3, reps:8,  hold:0,  freq:"2×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Fast up — slow down. Control at all times.",              progression:"Sit-to-stand fast → Power squat → Step-up fast" },
      ],
    }
  },
  sports: {
    label:"Sports Rehab & Performance", icon:"⚽", color:"#84cc16",
    categories: {
      "Return to Running": [
        { id:"sp_run_walk",         name:"Run-Walk Protocol",                        target:"Lower limb — return to sport progressive loading", desc:"Week 1: Walk 1min, run 1min ×10. Week 2: run 2min ×7. Progress weekly.",   sets:1, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Stop if NRS >3/10. 48h recovery between sessions.",       progression:"Increase run intervals → Continuous → Speed" },
        { id:"sp_plyometric",       name:"Plyometric Progression",                   target:"Lower limb — reactive strength",                   desc:"Double-leg → single-leg → lateral → rotational hops.",                      sets:3, reps:10, hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Land softly — triple flexion. Quiet feet.",               progression:"Double → Single → Lateral → Rotational → Sport-specific" },
        { id:"sp_agility",          name:"Agility & Change of Direction Drills",     target:"Lower limb — neuromuscular control, RTS",          desc:"T-test, 5-10-5, figure-8. Controlled then max speed.",                       sets:3, reps:5,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Controlled first. Quality > speed initially.",            progression:"Increase speed → Add sport ball → Reactive" },
        { id:"sp_sprinting",        name:"Sprinting Progression",                    target:"Hamstrings, glutes — RTS max velocity",            desc:"60% → 70% → 80% → 90% → 100% max velocity.",                               sets:4, reps:5,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"No pain. Full hip extension. Maintain form.",             progression:"Linear → Curved → Reactive → Sport-specific" },
      ],
      "Throwing / Upper Limb Sports": [
        { id:"sp_ir_er_ratio",      name:"IR/ER Ratio Strength Training",            target:"Rotator cuff balance — thrower's shoulder",        desc:"Maintain ER:IR strength ratio >66%. Prioritise ER.",                         sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"External rotation is the priority for overhead athletes.", progression:"Sidelying → 90° abduction → Overhead" },
        { id:"sp_throw_prog",       name:"Interval Throwing Programme",              target:"Shoulder — return to sport throwing",              desc:"Start 30ft. Progress distance every 2 sessions if pain-free.",               sets:1, reps:25, hold:0,  freq:"Every 2nd day", phase:"Phase 3", evidence:"Strong", cues:"Stop immediately if pain. Ice after.",                    progression:"30ft → 60ft → 90ft → 120ft → Full distance" },
        { id:"sp_decel_training",   name:"Deceleration Mechanism Training",          target:"Rotator cuff posterior — deceleration phase",     desc:"Eccentric posterior cuff loading at 90/90 position. Resist forward pull.",  sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Control the deceleration — most RTC tears occur here.",  progression:"Increase resistance → Simulate throw speed → Plyoball" },
      ],
      "Strength & Conditioning": [
        { id:"sp_split_squat",      name:"Bulgarian Split Squat",                    target:"Quadriceps, glutes — unilateral strength",         desc:"Rear foot elevated. Front foot forward. Drop back knee toward floor.",       sets:4, reps:8,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Front shin vertical. Drop straight down. No knee cave.", progression:"Add weight → Add deficit → Jump split squat" },
        { id:"sp_bench_press",      name:"Bench Press Progression",                  target:"Pectorals, anterior deltoid, triceps",             desc:"Barbell bench. Scapulae retracted. Controlled lowering. Drive up.",          sets:4, reps:8,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Elbows 45–75° from torso. Control descent.",             progression:"Add load → Dumbbell → Incline → Decline" },
        { id:"sp_chin_up",          name:"Chin-Up / Pull-Up Progression",            target:"Latissimus dorsi, biceps, mid trap",               desc:"Full hang to chin over bar. Control lowering. Various grips.",               sets:4, reps:6,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Full range. Dead hang to start. Depress scapulae first.", progression:"Band assisted → Bodyweight → Weighted → L-sit" },
        { id:"sp_trap_bar",         name:"Trap Bar Deadlift",                        target:"Total lower chain — safe primary mover pattern",   desc:"Trap bar. Neutral spine. Full hip extension. Progressively loaded.",         sets:4, reps:6,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Push floor away. Drive hips forward. Stand tall.",        progression:"Increase load → Single-leg RDL → Sumo deadlift" },
        { id:"sp_hip_ext_hamstring",name:"Hip Extension Hamstring Loading",          target:"Hamstrings in lengthened position",                desc:"Prone hip extension against resistance (band). Full hip extension.",          sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep pelvis neutral. Feel hamstring activation.",         progression:"Add weight → Nordic → Glider curl" },
        { id:"sp_nordics",          name:"Nordic Hamstring Curl",                    target:"Biceps femoris — eccentric injury prevention",     desc:"Kneel, feet anchored. Lower body slowly with hamstrings.",                   sets:3, reps:6,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strongest — 51% hamstring injury reduction", cues:"Lower as slowly as possible. Push up with hands.",        progression:"Increase reps → Add resistance → Glider curl" },
      ],
    }
  },
  pilates_yoga: {
    label:"Pilates & Yoga-Based", icon:"🧘", color:"#c084fc",
    categories: {
      "Clinical Pilates": [
        { id:"pil_imprint",         name:"Imprint and Release",                      target:"TA, pelvic stabilisers — Pilates foundation",     desc:"Supine. Find neutral pelvis. Imprint lumbar (PPT). Release. Alternate.",     sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Find neutral — not flat, not arched. Breathe.",           progression:"Add leg float → Dead bug → Full repertoire" },
        { id:"pil_hundred",         name:"The Hundred",                              target:"TA, hip flexors, core endurance — Pilates",        desc:"Supine legs tabletop/extended. Pump arms 5 in, 5 out. 10 sets = 100.",       sets:1, reps:100,hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"C-curve. Scoop navel. Arms long and strong.",             progression:"Extend legs lower → Add weight → Full Pilates series" },
        { id:"pil_roll_up",         name:"Pilates Roll-Up",                          target:"Spinal flexors, hamstrings — articulation",        desc:"Supine arms overhead. Slowly roll up sequentially through spine.",            sets:3, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Peel spine off floor one vertebra at a time.",            progression:"Add band → Half roll back → Teaser" },
        { id:"pil_single_leg_str",  name:"Single Leg Stretch",                       target:"TA, hip flexors — Pilates core series",            desc:"Supine. Curl up. Alternate knee to chest cycling.",                          sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Scoop navel. Keep C-curve stable.",                       progression:"Add double leg → Scissors → Bicycle" },
        { id:"pil_swimming",        name:"Pilates Swimming",                         target:"Back extensors, glutes — posterior chain",         desc:"Prone. Alternate arm/leg lifts in flutter pattern. Breathe 5 in, 5 out.",    sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Lengthen — don't compress lumbar. Light rapid movement.", progression:"Hold → Add resistance → Full back extension series" },
      ],
      "Therapeutic Yoga": [
        { id:"yoga_warrior1",       name:"Warrior I (Virabhadrasana I)",             target:"Hip flexors, quadriceps, core — lower limb",       desc:"Lunge position. Back foot 45°. Hips square. Arms overhead.",                sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Square hips forward. Front knee over ankle.",             progression:"Warrior II → Warrior III → Bind variations" },
        { id:"yoga_downdog",        name:"Downward Dog",                             target:"Hamstrings, calves, thoracic, shoulder stability", desc:"Hands and feet on floor. Hips high. Press heels toward floor.",              sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Long spine. Press into hands equally. Pedal feet.",       progression:"Add leg raise → Three-legged dog → Plank flow" },
        { id:"yoga_child_pose",     name:"Child's Pose (Balasana)",                  target:"Lumbar, hip flexors, thoracic — restorative",      desc:"Kneel, sit back on heels. Arms extended forward. Rest forehead.",            sets:3, reps:1,  hold:60, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Wide knees if needed. Breathe into back.",                progression:"Add lateral stretch → Thread needle → Extended child" },
        { id:"yoga_bridge_yoga",    name:"Yoga Bridge (Setu Bandha)",                target:"Glutes, hamstrings, pelvic floor — restorative",   desc:"Supine. Feet hip-width. Press into feet. Lift hips.",                        sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Press knees forward. Lift sternum toward chin.",          progression:"Single-leg → Wheel → Add resistance" },
        { id:"yoga_cat_cow",        name:"Cat-Cow (Marjaryasana-Bitilasana)",        target:"Lumbar-thoracic mobility — segmental",             desc:"Quadruped. Flex (cat) and extend (cow) spine with breath.",                  sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Link to breath. Exhale cat, inhale cow.",                 progression:"Add rotation → Side bend → Bird dog integration" },
        { id:"yoga_triangle",       name:"Triangle Pose (Trikonasana)",              target:"Hip abductors, spinal lateral flexors, IT band",   desc:"Feet wide. Front toes forward. Hinge at hip. Reach front hand toward foot.", sets:3, reps:1, hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Long spine. Don't collapse trunk. Look up to top hand.", progression:"Add bind → Revolved triangle → Extended side angle" },
        { id:"yoga_tree",           name:"Tree Pose (Vrksasana)",                    target:"Hip abductors, ankle stabilisers, proprioception", desc:"Single-leg balance. Other foot on inner thigh or calf (not knee). Arms up.", sets:3, reps:1, hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Fix gaze point. Squeeze standing glute. Breathe.",        progression:"Close eyes → Arm variations → Dynamic tree" },
      ],
    }
  },
  hydrotherapy: {
    label:"Hydrotherapy / Aquatic", icon:"🏊", color:"#06b6d4",
    categories: {
      "Aquatic Rehabilitation": [
        { id:"hydro_walk",          name:"Aquatic Walking",                          target:"Lower limb — unloaded gait retraining",            desc:"Chest-deep water walking. Forward, backward, sideways. Normal gait.",        sets:3, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 1", evidence:"Strong",    cues:"Normal heel-toe gait. Arms swing naturally.",             progression:"Increase speed → Deep water → Add buoyancy resistance" },
        { id:"hydro_squat",         name:"Aquatic Squat",                            target:"Quadriceps, glutes — reduced load",                desc:"Waist-deep water. Squat as normal — water reduces load ~50%.",               sets:3, reps:15, hold:2,  freq:"3×/week",  phase:"Phase 1", evidence:"Strong",    cues:"Same form as land squat. Use buoyancy — don't fall.",     progression:"Deeper water → Add noodle resistance → Plyometric" },
        { id:"hydro_run",           name:"Deep Water Running",                       target:"Cardiovascular — offloading for injury",           desc:"Deep water with floatation belt. Running motion — no floor contact.",         sets:3, reps:1,  hold:300,freq:"3–5×/week", phase:"Phase 2", evidence:"Strong",   cues:"Upright posture. Full running pattern.",                  progression:"Increase duration → Increase intensity → Resistance bands" },
        { id:"hydro_balance",       name:"Single-Leg Balance in Water",              target:"Proprioception — aquatic reduced-load",            desc:"Single-leg stance in shallow water. Gentle wave perturbation.",              sets:3, reps:1,  hold:30, freq:"3×/week",  phase:"Phase 1", evidence:"Moderate", cues:"Near pool edge. Focus on fixed point.",                   progression:"Add reach tasks → Close eyes → Deeper water" },
        { id:"hydro_kick",          name:"Aquatic Leg Kicks / Flutter Board",        target:"Hip flexors, quadriceps, hip extensors — low load", desc:"Hold flutter board. Kick front crawl motion. Supported on water.",          sets:3, reps:1,  hold:120,freq:"3×/week",  phase:"Phase 1", evidence:"Moderate", cues:"Full hip extension on kick. Flutter — not slap.",         progression:"Increase duration → Add ankle weights → Depth change" },
      ],
    }
  },
  cardiac: {
    label:"Cardiac Rehab", icon:"❤", color:"#ef4444",
    categories: {
      "Phase 2–3 Cardiac Rehab": [
        { id:"card_walk_prog",      name:"Supervised Walking Programme",             target:"Cardiorespiratory — Phase 2 cardiac rehab",        desc:"Treadmill or overground. Start 10–15 min. Progress 5 min/week. RPE 11–13.", sets:1, reps:1,  hold:0,  freq:"5×/week",  phase:"Phase 1", evidence:"Strongest", cues:"Borg RPE 11–13 (moderate). Stop if chest pain/dizziness.", progression:"Increase duration → Add interval → Cycle/swim" },
        { id:"card_resistance",     name:"Cardiac Resistance Training",              target:"Peripheral muscle — cardiac load reduction",       desc:"Circuit training at 40–60% 1RM. 8–10 exercises. No Valsalva.",              sets:2, reps:12, hold:0,  freq:"2–3×/week", phase:"Phase 2", evidence:"Strong",   cues:"No breath-holding. Exhale on exertion. Monitor HR/BP.",  progression:"Increase reps → Increase load → Reduce rest time" },
        { id:"card_interval",       name:"High Intensity Interval Training (HIIT)", target:"VO2 max — Phase 3 cardiac (supervised only)",      desc:"4×4 min at 85–95% HRmax with 3 min active recovery. Supervised.",           sets:4, reps:1,  hold:240,freq:"3×/week",  phase:"Phase 3", evidence:"Strongest — superior VO2 gains vs MICT", cues:"Supervised only. ECG monitored. Stop if symptoms.",       progression:"Increase sessions → Unsupervised home program" },
        { id:"card_stretching",     name:"Cool-Down Stretching",                    target:"Flexibility, autonomic recovery — post-cardiac exercise", desc:"Major muscle groups. Gentle static stretching post exercise.",       sets:1, reps:1,  hold:30, freq:"5×/week",  phase:"Phase 1", evidence:"Moderate", cues:"Never skip cool-down. Gentle only. Breathe.",             progression:"Increase hold → Add mindfulness breathing" },
      ],
    }
  },
  oncology: {
    label:"Oncology Rehab", icon:"🎗", color:"#f472b6",
    categories: {
      "Cancer Fatigue Management": [
        { id:"onco_pace",           name:"Pacing and Energy Conservation",           target:"Fatigue management — cancer-related",              desc:"Break tasks. Rest before exhaustion. Energy diary.",                          sets:1, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Stop at 7/10 energy — not at exhaustion.",                progression:"Increase activity windows → ACSM cancer guidelines" },
        { id:"onco_aerobic",        name:"Supervised Aerobic Training",              target:"Cardiorespiratory fitness — cancer rehab",          desc:"Walking or cycling at moderate intensity. 150 min/week.",                    sets:1, reps:1,  hold:0,  freq:"5×/week",  phase:"Phase 2", evidence:"Strongest — reduces fatigue, improves survival", cues:"Rate exertion 5–6/10. Stop if dizzy or chest pain.",     progression:"Increase duration → Resistance training add-on" },
        { id:"onco_resistance",     name:"Progressive Resistance Training — Oncology", target:"Muscle strength — cancer cachexia prevention",   desc:"2 sets major muscle groups. 60–70% 1RM. Supervised initially.",              sets:2, reps:12, hold:0,  freq:"2–3×/week", phase:"Phase 2", evidence:"Strong",   cues:"Monitor blood counts. Avoid when neutropenic.",          progression:"Progress load 5% weekly → Functional integration" },
        { id:"onco_lymph_pump",     name:"Lymphatic Pump Exercises",                 target:"Lymphatic return — post-mastectomy / lymphoedema", desc:"Shoulder pumping. Elevation. Elbow flexion/extension. Deep breathing.",      sets:3, reps:20, hold:0,  freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Wear compression garment. Elevate limb.",                 progression:"Add progressive resistance → Decongestive therapy" },
      ],
    }
  },
  paediatric: {
    label:"Paediatric / Developmental", icon:"🧒", color:"#34d399",
    categories: {
      "Developmental Movement": [
        { id:"ped_tummy_time",      name:"Tummy Time Progression",                   target:"Cervical extensors, shoulder girdle — infant",     desc:"Prone positioning. Gradually increase duration. Support chest if needed.",   sets:5, reps:1,  hold:120,freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Never unsupervised. Start on chest, progress to floor.",  progression:"Supported → Unsupported → Pivoting → Crawling prep" },
        { id:"ped_crawling",        name:"Quadruped Crawling Pattern",               target:"Cross-pattern coordination — developmental",       desc:"Reciprocal hand and knee movements. Slow and controlled.",                   sets:3, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Opposite arm and leg together. Head up.",                 progression:"Static quadruped → Rock forward/back → Full crawl" },
        { id:"ped_sit_balance",     name:"Supported Sitting Balance",                target:"Trunk control — paediatric vestibular",            desc:"Seated on therapy ball. Apply gentle perturbations in all directions.",       sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Allow child to self-correct. Reduce support gradually.",  progression:"Reduce support → Add arm/leg movements → Stand" },
        { id:"ped_jumping",         name:"Two-Footed Jump and Landing",              target:"Lower limb strength, coordination — paediatric",   desc:"Jump with both feet. Land softly. Focus on quality not distance.",           sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Bend knees on landing. Quiet feet.",                      progression:"Add direction → Hop → Skip → Sport-specific" },
        { id:"ped_balance_beam",    name:"Balance Beam Walking",                     target:"Balance, proprioception — paediatric",             desc:"Walk along line or low beam. Arms out. Eyes open then closed.",              sets:3, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Look ahead. Arms out for balance.",                       progression:"Narrow beam → Eyes closed → Carry object → Backwards" },
      ],
    }
  },
};
const PROGRAMME_TEMPLATES = {
  // Lumbar
  acute_lbp:      { label:"Acute LBP",                  exercises:["lb_tva","lb_prone_lying","lb_press_up","lb_cat_camel","lb_glute_bridge","lb_pelvic_tilt"] },
  chronic_lbp:    { label:"Chronic LBP",                 exercises:["lb_dead_bug","lb_bird_dog","lb_plank","lb_side_plank","lb_hip_hinge","pc_pallof","lb_stir_pot"] },
  disc_ext:       { label:"Disc — Extension Bias",       exercises:["lb_prone_lying","lb_press_up","lb_standing_ext","lb_tva","lb_glute_bridge"] },
  disc_flex:      { label:"Disc — Flexion Bias",         exercises:["lb_knee_chest","lb_cat_camel","lb_rotation_stretch","lb_piriformis","lb_tva"] },
  // Hip
  hip_oa:         { label:"Hip Osteoarthritis",          exercises:["hp_clam","hp_standing_abd","hp_hip_thrust","hp_90_90","hp_adductor_stretch","hp_thomas"] },
  hip_bursitis:   { label:"Greater Trochanteric Bursitis", exercises:["hp_clam","hp_lat_walk","hp_monster_walk","hp_ober_stretch","hp_standing_abd"] },
  groin_strain:   { label:"Groin / Adductor Strain",    exercises:["lb_copenhagen","hp_adductor_stretch","hp_side_step_squat","hp_hip_flex_raise","hp_hip_thrust"] },
  // Knee
  pfps:           { label:"Patellofemoral Pain",         exercises:["kn_tqe","kn_vmo_squat","kn_step_down","hp_clam","hp_lat_walk","lb_glute_bridge"] },
  patella_tend:   { label:"Patellar Tendinopathy",       exercises:["kn_isometric_wall","kn_slow_squat","kn_decline_squat","hp_hip_thrust","kn_rdl"] },
  acl_early:      { label:"ACL Rehab — Early Phase",     exercises:["kn_quad_set","kn_straight_leg","kn_tqe","lb_glute_bridge","kn_acl_balance"] },
  acl_late:       { label:"ACL Rehab — Return to Sport", exercises:["kn_vmo_squat","kn_step_down","kn_drop_jump","sp_plyometric","sp_agility","sp_nordics"] },
  knee_oa:        { label:"Knee Osteoarthritis",         exercises:["kn_quad_set","kn_straight_leg","kn_sit_to_stand","kn_leg_press","lb_glute_bridge","ank_calf_raise"] },
  hamstring_str:  { label:"Hamstring Strain Rehab",      exercises:["kn_hamstring_str","kn_rdl","sp_hip_ext_hamstring","kn_nordic","sp_nordics","sp_sprinting"] },
  // Ankle & Foot
  ankle_sprain:   { label:"Ankle Sprain Rehab",          exercises:["ank_single_leg","ank_peroneal","ank_calf_raise","ank_tibialis_ant","ank_reach_sebt","ank_lateral_hops"] },
  achilles:       { label:"Achilles Tendinopathy",       exercises:["ank_isometric_calf","ank_ec_drop","ank_heavy_slow_calf","ank_single_leg","ank_calf_raise"] },
  plantar_fascia: { label:"Plantar Fasciitis",           exercises:["ank_pf_stretch","ank_calf_stretch","ank_short_foot","ank_marble_pickup","ank_single_leg"] },
  // Shoulder
  shoulder_imp:   { label:"Shoulder Impingement",        exercises:["sh_wall_slide","sh_prone_ytw","sh_face_pull","sh_er_band","sh_pec_stretch","sh_ir_stretch"] },
  frozen_shoulder:{ label:"Frozen Shoulder",             exercises:["sh_pendulum","sh_pully","sh_capsule_stretch","sh_ir_stretch","sh_er_band"] },
  rct_tear:       { label:"Rotator Cuff Tear Rehab",     exercises:["sh_pendulum","sh_er_band","sh_sidelying_ir","sh_prone_ytw","sh_rhythmic_stab"] },
  // Elbow
  tennis_elbow:   { label:"Tennis Elbow",                exercises:["el_isometric_ext","el_tyler_twist","el_wrist_ext_isoton","el_grip_strength"] },
  golfers_elbow:  { label:"Golfer's Elbow",              exercises:["el_wrist_flex_iso","el_wrist_flex_eccen","el_forearm_stretch","el_pron_sup"] },
  // Cervical
  cervicogenic_ha:{ label:"Cervicogenic Headache",       exercises:["cx_dnf","cx_chin_tuck","cx_scap_ret","pc_ucs_chin","cx_suboccip_release","cx_isometric"] },
  cervical_rad:   { label:"Cervical Radiculopathy",      exercises:["cx_chin_tuck","cx_neural_slider","cx_neural_ulnar","cx_neural_radial","cx_dnf","cx_isometric"] },
  // Posture
  ucs:            { label:"Upper Crossed Syndrome",      exercises:["cx_chin_tuck","pc_ucs_chin","pc_band_pullap","pc_pec_foam","sh_wall_slide","sh_prone_ytw","pc_wall_angel"] },
  lcs:            { label:"Lower Crossed Syndrome",      exercises:["pc_lcs_bridge","pc_hip_flex_str","lb_tva","lb_bird_dog","lb_hip_flexor","lb_glute_bridge","pc_pallof"] },
  // Thoracic
  thoracic_mob:   { label:"Thoracic Stiffness",          exercises:["tx_foam_ext","tx_book_open","tx_quadruped_rot","tx_thread_needle","tx_prone_cobra","tx_seated_row"] },
  // Pelvic floor
  stress_incont:  { label:"Stress Incontinence",         exercises:["pf_kegel","pf_quick_flick","pf_functional","lb_glute_bridge","hp_clam"] },
  pelvic_pain:    { label:"Pelvic Girdle Pain",          exercises:["pf_sij_bridge","pf_abductor_iso","pf_kegel","lb_bird_dog","lb_tva"] },
  // Respiratory
  copd:           { label:"COPD Breathing",              exercises:["resp_pursed_lip","resp_diaphragm","resp_lateral_costal","resp_imst","card_walk_prog"] },
  // Older adult
  falls_prev:     { label:"Falls Prevention",            exercises:["oa_otago_ankle","oa_otago_knee","oa_stepping","oa_tug","oa_otago_walk","neuro_foam_balance"] },
  frailty:        { label:"Frailty / Sarcopenia",        exercises:["oa_resistance","oa_power_training","oa_otago_ankle","kn_sit_to_stand","lb_glute_bridge"] },
  // Sports
  return_run:     { label:"Return to Running",           exercises:["sp_run_walk","sp_plyometric","sp_agility","sp_sprinting","kn_drop_jump","kn_rdl"] },
  throwing_rts:   { label:"Return to Throwing",          exercises:["sp_ir_er_ratio","sp_throw_prog","sp_decel_training","sh_prone_ytw","sh_rhythmic_stab"] },
  // Pilates / Yoga
  clinical_pilates:{ label:"Clinical Pilates Core",      exercises:["pil_imprint","pil_hundred","pil_single_leg_str","pil_swimming","lb_bird_dog","pil_roll_up"] },
  yoga_back:      { label:"Yoga for Back Pain",          exercises:["yoga_cat_cow","yoga_child_pose","yoga_bridge_yoga","yoga_downdog","lb_piriformis","lb_rotation_stretch"] },
  // Neuro
  neuro_balance:  { label:"Neurological Balance",        exercises:["neuro_tandem","neuro_romberg","neuro_foam_balance","neuro_dual_task","oa_stepping"] },
  // Cardiac
  cardiac_phase2: { label:"Cardiac Rehab Phase 2",       exercises:["card_walk_prog","card_resistance","card_stretching","resp_diaphragm"] },
  // Hydrotherapy
  aquatic_rehab:  { label:"Aquatic Rehabilitation",      exercises:["hydro_walk","hydro_squat","hydro_balance","hydro_run","hydro_kick"] },
};

const ALL_EXERCISES = Object.values(EXERCISE_DB).flatMap(region =>
  Object.values(region.categories).flatMap(cat => cat)
);


// ─── KNEE EVIDENCE-BASED PROTOCOLS ───────────────────────────────────────────
const KNEE_PROTOCOLS = [
  {
    id:"knee_oa",
    label:"Knee Osteoarthritis",
    icon:"🦴",
    color:"#ffb300",
    evidence:"NICE 2022 / OARSI Guidelines",
    phases:[
      {
        phase:"Phase 1 — Pain Control & Activation (Weeks 1–3)",
        color:"#00c97a",
        exercises:[
          { name:"Quadriceps Setting (Quad Sets)", sets:3, reps:15, hold:5, freq:"3×/day", desc:"Lie flat. Tighten quad by pushing knee into bed. Hold 5s. VMO activation without joint load. Essential first step post-flare.", cues:"Feel the quad tighten above the kneecap. No movement needed.", evidence:"Strong — initiates VMO in swollen/inhibited knee" },
          { name:"Straight Leg Raise (SLR)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Lie flat. Tighten quad first, then raise leg to 45°. Hold 2s. Lower slowly. Strengthens quad without knee compression.", cues:"Lock the knee fully before lifting. Slow return.", evidence:"Strong — safe VMO loading in early OA" },
          { name:"Inner Range Quads (IRQ)", sets:3, reps:15, hold:5, freq:"Daily", desc:"Seated, place rolled towel under knee. Extend leg from 30° to full extension. Targets VMO specifically in the last 30° of extension.", cues:"Squeeze the quad hard at the top. Hold 5 seconds.", evidence:"Strong — VMO isolation in terminal extension" },
          { name:"Ankle Pumps + Calf Raises (seated)", sets:3, reps:20, hold:0, freq:"Hourly", desc:"Seated. Pump ankles × 20, then rise onto toes × 20. Circulation and calf pump for swelling management.", cues:"Keep heels down for pumps. Rise tall for calf raises.", evidence:"Strong — oedema management in acute OA flare" },
        ]
      },
      {
        phase:"Phase 2 — Strength & Load (Weeks 4–8)",
        color:"#ffb300",
        exercises:[
          { name:"Terminal Knee Extension (TKE) — Band", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band behind knee, loop fixed. Stand in slight knee bend. Extend knee against band resistance. Last 30° of extension. Best VMO exercise in weight-bearing.", cues:"Push knee straight slowly. Hold 2s. Control return. Don't hyperextend.", evidence:"Strong — VMO in functional WB position" },
          { name:"Wall Slide / Mini Squat (0–45°)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Back against wall. Slide down to 45° ONLY (avoid deep knee bend in OA). Weight even. Functional quad load within pain-free range.", cues:"Knees track over 2nd toe. Equal weight both feet. Stop at 45°.", evidence:"Strong — OARSI recommended OA exercise" },
          { name:"Step-Up (small step — 10cm)", sets:3, reps:12, hold:1, freq:"Daily", desc:"Step up with affected leg leading. Full knee extension at top. Eccentric control on the way down (3s lower). Functional strength and proprioception.", cues:"Push through the heel. Knee over 2nd toe. Lower slowly — this is where strength builds.", evidence:"Strong — functional quad + glute loading" },
          { name:"Seated Knee Extension (limited arc 90°–30°)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Seated. Extend knee from 90° to 30° only (avoid 0° full extension if painful PF). Control through arc. Can add light ankle weight.", cues:"Slow control both ways. Stop before full extension if PF pain occurs.", evidence:"Moderate — targeted VMO with PF protection" },
          { name:"Hip Abduction Sidelying — Glute Med", sets:3, reps:20, hold:1, freq:"Daily", desc:"Sidelying, slight hip extension. Abduct leg 30°. Hold 1s. Glute med weakness causes knee valgus in OA — must address.", cues:"Toes pointing slightly down (hip in slight IR). Don't rotate pelvis.", evidence:"Strong — knee valgus control reduces medial OA load" },
          { name:"Static Cycling", sets:1, reps:0, hold:0, freq:"20–30 min daily", desc:"Low resistance cycling. Seat high (slight knee flexion at bottom). Best cardio for knee OA — low impact, ROM maintenance, quad strengthening.", cues:"Seat high enough that knee bends only 15–20° at bottom of stroke. No pain.", evidence:"Strong — NICE 2022 recommended aerobic exercise" },
        ]
      },
      {
        phase:"Phase 3 — Function & Long Term (Weeks 9+)",
        color:"#ff4d6d",
        exercises:[
          { name:"Single-Leg Press (45° — partial range)", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Leg press machine. Single leg. 0–60° range. Progressive load. Best gym exercise for OA — controls range, loads quad and glute.", cues:"Don't lock the knee at full extension. Push through heel.", evidence:"Strong — progressive overload for OA" },
          { name:"Lateral Step-Down (eccentric control)", sets:3, reps:10, hold:0, freq:"3×/wk", desc:"Stand on step. Lower non-affected foot slowly toward floor (3–5s). Eccentric quad + hip control. Hardest functional exercise for knee.", cues:"Knee tracks over 2nd toe. Pelvis level. Count 4 seconds down.", evidence:"Strong — functional eccentric control" },
          { name:"Walking Programme — Progressive", sets:1, reps:0, hold:0, freq:"Daily", desc:"Start: 10 min flat surface. Progress 10% per week. Target: 30 min continuous. Best long-term intervention for knee OA.", cues:"Comfortable footwear. Flat surface initially. Slight knee ache OK. Sharp pain: stop.", evidence:"Strong — NICE 2022 / OARSI top recommendation" },
          { name:"Aquatic Exercise (hydrotherapy)", sets:3, reps:15, hold:0, freq:"2×/wk", desc:"Pool exercises — walking in water, leg raises, mini squats in water. Offloads 50% body weight. Ideal for BMI>30 or severe OA.", cues:"Warm water preferred. Buoyancy reduces load. Can do deeper squats safely.", evidence:"Strong — Cochrane review: significant pain reduction" },
        ]
      },
    ],
    treatment:[
      { name:"Manual Therapy — Tibiofemoral Joint Mobilisation", desc:"Maitland Grade III–IV. Posterior glide of tibia on femur. Increases joint mobility, reduces pain neurologically. 3–5 min per session.", evidence:"Moderate — Cochrane: short-term pain relief" },
      { name:"Patellar Taping (McConnell)", desc:"Medial glide tape for lateral PF pain. Apply before exercise. Reduces pain by 50%+ acutely, allows therapeutic exercise.", evidence:"Strong — McConnell 1986, multiple RCTs confirmed" },
      { name:"TENS / Electrotherapy", desc:"TENS: 80–100 Hz for pain relief pre-exercise. IFT: 4000 Hz carrier, 80–120 Hz beat for deeper penetration. 20 min.", evidence:"Moderate — short-term pain relief to enable exercise" },
      { name:"Heat (pre-exercise)", desc:"Hot pack to knee 15–20 min before exercise. Reduces stiffness, improves ROM, increases tissue extensibility.", evidence:"Moderate — best combined with exercise" },
      { name:"Ice (post-exercise)", desc:"Ice pack 15 min post-exercise if swelling or warmth. Reduces post-exercise effusion. Essential after land-based exercise in acute OA.", evidence:"Strong — standard post-exercise OA management" },
      { name:"Knee Bracing / Offloading", desc:"Valgus unloader brace for medial compartment OA. Reduces medial load 20–25%. Use for activity, not 24/7.", evidence:"Moderate — OARSI recommended for medial OA" },
    ]
  },
  {
    id:"knee_pfps",
    label:"Patellofemoral Pain (PFPS)",
    icon:"🔵",
    color:"#7f5af0",
    evidence:"Crossley et al 2016 / BJSM Consensus",
    phases:[
      {
        phase:"Phase 1 — Load Reduction & VMO (Weeks 1–4)",
        color:"#00c97a",
        exercises:[
          { name:"VMO Isolation — Inner Range Quads", sets:3, reps:20, hold:5, freq:"Daily", desc:"Towel under knee at 30°. Contract VMO (feel above inner kneecap). Extend to full. VMO fires last 30° — most important phase for PF tracking.", cues:"Place fingers on VMO (inner quad, above knee). Feel it fire. Hold 5s.", evidence:"Strong — VMO retraining primary for PFPS" },
          { name:"Straight Leg Raise (SLR)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Quad set first, then raise to 45°. Safe loading without PF compression. Foundation exercise.", cues:"Tighten quad before lifting. No knee flexion during movement.", evidence:"Strong — PFPS phase 1 standard" },
          { name:"Clam Exercise — Glute Med", sets:3, reps:20, hold:2, freq:"Daily", desc:"Sidelying, hips slightly extended. Rotate top knee up (clamshell). Hip ext position isolates glute med, not TFL. Reduces knee valgus = reduces lateral PF tracking.", cues:"Hips slightly behind (not flexed). Open slowly. Band around knees optional.", evidence:"Strong — hip abductor weakness primary driver of PFPS" },
          { name:"Hip External Rotation — Sidelying", sets:3, reps:15, hold:2, freq:"Daily", desc:"Sidelying. ER hip while keeping pelvis stable. Activates posterior glute med + piriformis. Reduces femoral IR = reduces Q-angle = reduces lateral PF load.", cues:"Pelvis stays stacked. Only the hip moves. Small movement, big contraction.", evidence:"Strong — BJSM consensus: hip ER training for PFPS" },
        ]
      },
      {
        phase:"Phase 2 — Functional Loading (Weeks 5–10)",
        color:"#ffb300",
        exercises:[
          { name:"TKE with Band (VMO in WB)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band behind knee. Stand. Extend knee from 30° against band. Most functional VMO exercise — weight bearing position.", cues:"Push knee back slowly. Squeeze VMO at end. Don't hyperextend.", evidence:"Strong — VMO in functional position" },
          { name:"Step-Up (low step 10cm) — Eccentric focus", sets:3, reps:15, hold:0, freq:"Daily", desc:"Step up, then lower for 4s (eccentric control is key for PFPS). Trains VMO + hip control in functional pattern.", cues:"Lower: 4 seconds, knee over 2nd toe. Don't let knee fall in.", evidence:"Strong — eccentric control reduces PF load" },
          { name:"Wall Squat with Ball (knees out)", sets:3, reps:15, hold:3, freq:"Daily", desc:"Wall slide with pilates ball between knees. Squeeze ball to activate adductors/VMO. Limits knee valgus. 0–60° only for PFPS.", cues:"Squeeze ball, press knees outward, back flat on wall. 60° max.", evidence:"Strong — VMO + medial loading for PF tracking" },
          { name:"Single-Leg Balance (eyes closed progression)", sets:3, reps:0, hold:30, freq:"Daily", desc:"Stand single leg 30s. Progression: eyes closed, unstable surface. Proprioception training essential for PFPS (retinacular mechanoreceptors).", cues:"Soft knee, not locked. Feel subtle corrections in foot. Progress to wobble board.", evidence:"Strong — proprioception training reduces PFPS recurrence" },
          { name:"Cycling (seat high)", sets:1, reps:0, hold:0, freq:"20 min daily", desc:"Stationary bike, seat high. Limits PF compression. Excellent aerobic base + quad without high PF load.", cues:"Seat height: knee slightly bent at bottom. No pain with pedalling.", evidence:"Strong — low PF load, high quad activation" },
        ]
      },
      {
        phase:"Phase 3 — Return to Sport / Running (Weeks 10+)",
        color:"#ff4d6d",
        exercises:[
          { name:"Lateral Step-Down — Eccentric", sets:3, reps:10, hold:0, freq:"3×/wk", desc:"Single leg eccentric squat to step. Most demanding PFPS exercise. Only introduce when pain <2/10 with phase 2 exercises.", cues:"4 seconds lower. Knee over 2nd toe. Pelvis level. Stop if PF pain >3/10.", evidence:"Strong — functional return to sport criterion" },
          { name:"Running Gait Retraining", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"10% cadence increase (Garmin/metronome). Reduces PF load 20–30%. Forefoot/midfoot strike if appropriate. Gradual return to run programme.", cues:"Count steps: aim 170–180 steps/min. Lighter footfall. Shorter stride.", evidence:"Strong — Bramah et al 2019: gait retraining #1 PFPS intervention" },
          { name:"Decline Squat Progression", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Squat on 25° decline board. Increases PF loading progressively. Tendon loading preparation for sport. Introduce only when pain <2/10.", cues:"Heels elevated on board. Slow control down. Pain-free only.", evidence:"Moderate — load progression for patellar tendon and PF" },
        ]
      },
    ],
    treatment:[
      { name:"Patellar Taping — McConnell (medial glide)", desc:"Tape patella medially before all exercises. Reduces lateral PF pressure immediately. Retrains VMO by reducing pain inhibition.", evidence:"Strong — McConnell 1986, multiple RCTs" },
      { name:"Patellar Mobilisation (medial glide)", desc:"Grade III medial patellar glide. 3 × 30 sec. Stretches tight lateral retinaculum. Reduces lateral PF tracking.", evidence:"Moderate — combined with exercise: strong evidence" },
      { name:"Foot Orthoses (if overpronation present)", desc:"Semi-rigid off-the-shelf orthotics if navicular drop >6mm or rearfoot valgus. Reduces tibial IR and Q-angle indirectly.", evidence:"Moderate — Collins et al 2008 RCT: orthotics + exercise > exercise alone" },
      { name:"Dry Needling — Vastus Lateralis", desc:"DN to lateral quad + TFL if overactive (NKT confirmed). Reduces lateral retinacular tension improving PF tracking.", evidence:"Moderate — VL inhibition improves medial tracking" },
      { name:"Soft Tissue — IT Band / TFL", desc:"Foam roll TFL × 90 sec. Cross-fibre massage lateral retinaculum. Reduces lateral pull on patella.", evidence:"Moderate — adjunct to exercise" },
    ]
  },
  {
    id:"knee_hamstring",
    label:"Hamstring Tendinopathy",
    icon:"🟡",
    color:"#ffb300",
    evidence:"Purdam / Rio / Goom 2016",
    phases:[
      {
        phase:"Phase 1 — Load Management (Weeks 1–3)",
        color:"#00c97a",
        exercises:[
          { name:"Isometric Hamstring Hold", sets:5, reps:1, hold:45, freq:"Daily", desc:"Prone, knee 30°. Push foot into therapist hand (or wall). Isometric hold 45s × 5 reps. Best pain relief in acute tendinopathy.", cues:"No movement. Just push and hold. Pain 0–3/10 acceptable.", evidence:"Strong — Rio et al 2015: isometrics reduce tendon pain immediately" },
          { name:"Prone Hip Extension (glute dominant)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Prone. Extend hip with knee bent 90°. Activates glute max > hamstring. Offloads tendon while maintaining neural drive.", cues:"Squeeze glute. Feel the glute, not the hamstring. Knee stays at 90°.", evidence:"Strong — glute loading offloads proximal hamstring" },
        ]
      },
      {
        phase:"Phase 2 — Isotonic Loading (Weeks 4–8)",
        color:"#ffb300",
        exercises:[
          { name:"Deadlift (Romanian — hip hinge)", sets:3, reps:10, hold:0, freq:"3×/wk", desc:"Hip hinge pattern. Load through hip, not lumbar spine. Progresses from bodyweight to dumbbell. Primary hamstring tendon loading exercise.", cues:"Hinge at hip. Feel tension in hamstrings before lowering. Flat back.", evidence:"Strong — Goom et al 2016: progressive loading for proximal hamstring tendinopathy" },
          { name:"Bridge — Single Leg (slow eccentric)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"Single leg bridge with 3s eccentric lower. Hip at full extension loads hamstring-glute junction. Progress: straight leg (hamstring dominant).", cues:"Push through heel. Squeeze glute at top. Lower for 3 seconds.", evidence:"Strong — hamstring-glute loading in functional position" },
          { name:"Leg Curl — Prone (isotonic)", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Prone leg curl machine. Full range, slow eccentric (3s). Isolated hamstring load. Important for distal tendon.", cues:"Control the return — 3 seconds lower. Don't let the weight drop.", evidence:"Strong — eccentric bias for tendinopathy" },
        ]
      },
      {
        phase:"Phase 3 — Functional & Return to Sport (Weeks 8+)",
        color:"#ff4d6d",
        exercises:[
          { name:"Nordic Hamstring Curl", sets:3, reps:6, hold:0, freq:"2×/wk", desc:"Kneel, feet anchored. Lower body as slow as possible (eccentric). Most powerful hamstring strengthening exercise. Reduces hamstring injury 51%.", cues:"Go as slow as possible. Use hands to catch at bottom. Pull yourself back up.", evidence:"Strong — Petersen et al 2011: 51% injury reduction" },
          { name:"Hip Thrust with Bar (heavy)", sets:4, reps:8, hold:1, freq:"3×/wk", desc:"Barbell hip thrust. Full hip extension load. Targets glute max + hamstring junction. Progress to >80% body weight.", cues:"Full hip extension at top. Squeeze glute. Chin tucked. Drive through heels.", evidence:"Strong — high glute-ham loading for return to sprint" },
          { name:"Sprinting — Progressive", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Start 50% speed × 6 reps × 30m. Progress 10%/week. Pain <2/10. Do NOT sprint through pain.", cues:"Warm up well. First sprint always easy. Stop if any twinge at proximal hamstring.", evidence:"Strong — sport-specific loading final stage" },
        ]
      },
    ],
    treatment:[
      { name:"Load Management (CRITICAL)", desc:"Avoid sustained hip flexion (sitting >20 min, stretching hamstrings). This compresses proximal tendon at ischial tuberosity. Sit on edge of chair or use cushion.", evidence:"Strong — tendon compression is primary driver of symptoms" },
      { name:"Shockwave Therapy (ESWT)", desc:"Radial ESWT × 2000 pulses × 3 sessions, 1 week apart. Applied directly to ischial tuberosity. Best for chronic (>3 months) proximal hamstring tendinopathy.", evidence:"Strong — Furia 2009, multiple RCTs" },
      { name:"Gluteal Dry Needling", desc:"DN to glute max + piriformis if overactive NKT pattern. Reduces compression on proximal hamstring from tight external rotators.", evidence:"Moderate — adjunct for compressed tendinopathy" },
    ]
  },
  {
    id:"knee_acl",
    label:"ACL Rehab (Post-Op / Conservative)",
    icon:"🔴",
    color:"#ff4d6d",
    evidence:"MOON / KANON / Ardern et al 2014",
    phases:[
      {
        phase:"Phase 1 — Acute Control (Weeks 1–2)",
        color:"#00c97a",
        exercises:[
          { name:"Quad Sets (VMO re-activation)", sets:3, reps:20, hold:5, freq:"Hourly", desc:"Immediate post-op VMO reactivation. AMI (arthrogenic muscle inhibition) shuts down VMO after ACL injury/surgery. This is the priority.", cues:"Push knee into bed. Feel VMO fire above kneecap. Hold 5s. Relax.", evidence:"Strong — AMI reversal is Phase 1 priority" },
          { name:"Heel Slides (ROM recovery)", sets:3, reps:20, hold:1, freq:"3×/day", desc:"Supine. Slide heel toward buttock. Regain flexion ROM gently. Target 90° by week 2. Avoid forced flexion.", cues:"Slide slowly. Stop at resistance or pain >3/10. Ice after.", evidence:"Strong — ROM recovery pacing post ACL-R" },
          { name:"SLR (straight leg raise)", sets:3, reps:15, hold:2, freq:"Daily", desc:"VMO-locked SLR. Quad control without knee flexion. Safe immediately post-op. Prevents extensor lag.", cues:"Fully tighten quad before lifting. If leg bends = quad not firing enough.", evidence:"Strong — prevents extensor lag post ACL-R" },
          { name:"Ankle Pumps + Calf Raises", sets:0, reps:20, hold:0, freq:"Hourly", desc:"DVT prevention. Hourly in first 2 weeks. Foot/ankle pump circulation.", cues:"Pump ankles × 20 then point and hold. Do every hour when awake.", evidence:"Strong — DVT prophylaxis post surgery" },
        ]
      },
      {
        phase:"Phase 2 — Strength Foundation (Weeks 3–12)",
        color:"#ffb300",
        exercises:[
          { name:"Leg Press (double to single leg)", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Start double leg, progress to single. 0–70° only initially (avoid 0° full ext if graft tension issue). Progress load weekly.", cues:"Push through heel. Full control both ways. Progress range as tolerated.", evidence:"Strong — primary quad + glute loading post ACL-R" },
          { name:"TKE — Terminal Knee Extension (band)", sets:3, reps:20, hold:2, freq:"Daily", desc:"VMO in weight-bearing. Band behind knee. Extend against resistance. Most important VMO exercise in early rehab.", cues:"Slow push. Hold at extension 2s. Don't snap knee back.", evidence:"Strong — VMO in functional WB position" },
          { name:"Hip Abduction + Hip ER (sidelying)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Hip rehab must run alongside knee rehab from day 1. Glute weakness = valgus collapse = graft stress.", cues:"Controlled movement. Pelvis stable. Feel the outer glute.", evidence:"Strong — hip rehab concurrent with knee for ACL" },
          { name:"Step-Up (10cm to 20cm)", sets:3, reps:12, hold:1, freq:"Daily", desc:"Functional loading progression. Start 10cm step. Eccentric control critical. Progress height as strength improves.", cues:"4 second lower. Knee over 2nd toe. Pelvis level.", evidence:"Strong — functional quad loading ACL rehab" },
          { name:"Proprioception — Single Leg Balance", sets:3, reps:0, hold:30, freq:"Daily", desc:"Re-establish mechanoreceptor function in ACL-deficient/reconstructed knee. Progress: eyes closed, perturbation, wobble board.", cues:"Soft knee. React to perturbations. Progress difficulty weekly.", evidence:"Strong — proprioception retraining reduces re-injury risk" },
        ]
      },
      {
        phase:"Phase 3 — Return to Sport (Months 4–9)",
        color:"#ff4d6d",
        exercises:[
          { name:"Nordic Hamstring Curl", sets:3, reps:6, hold:0, freq:"2×/wk", desc:"Hamstring strength >= 80% of quad (H:Q ratio). Nordic curl builds hamstring as secondary ACL restraint. Cannot return to sport without adequate H:Q ratio.", cues:"Slow as possible. Build tolerance. Full programme takes 6 weeks.", evidence:"Strong — H:Q ratio normalisation for ACL return to sport" },
          { name:"Plyometric Progression (hop tests)", sets:3, reps:8, hold:0, freq:"3×/wk", desc:"Double leg to single leg to tuck jumps to lateral hops. LSI (limb symmetry index) must be >90% before RTS. Hop test battery: single hop, triple hop, crossover hop.", cues:"Soft landing. Knee over toe. Quiet landing = good absorption. Loud = poor control.", evidence:"Strong — Ardern et al: LSI >90% required for safe RTS" },
          { name:"Running Programme — Return to Run", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Criteria for running: full ROM, no effusion, quad strength >70% contralateral. Start: walk-jog intervals × 20 min. Progress weekly. No cutting/pivoting until month 6.", cues:"Pain <2/10. No swelling after. Increase volume before intensity.", evidence:"Strong — progressive return to run protocol" },
          { name:"Agility + Change of Direction", sets:3, reps:6, hold:0, freq:"3×/wk", desc:"T-drill, lateral shuffle, figure-8. Introduce at month 6+ only. Neuromuscular control under speed.", cues:"Start slow. Accelerate when technique is clean. Video from front for valgus check.", evidence:"Strong — sport-specific neuromuscular training pre-RTS" },
        ]
      },
    ],
    treatment:[
      { name:"Cryotherapy (Ice) — Phase 1", desc:"Ice × 15–20 min every 2 hours for first 2 weeks. Reduces post-op effusion which drives VMO inhibition (AMI).", evidence:"Strong — effusion management = VMO inhibition reversal" },
      { name:"Neuromuscular Electrical Stimulation (NMES)", desc:"NMES to VMO while doing quad sets. Enhances VMO firing in AMI. Use for first 4 weeks post-op.", evidence:"Strong — Hauger et al 2018: NMES accelerates VMO return" },
      { name:"Graft Healing Timeline (CRITICAL education)", desc:"Ligamentisation phase 3–6 months (weakest point). Patient MUST understand graft is weaker at 3 months than immediately post-op. No RTS before 9 months (re-injury risk halved vs 6 months).", evidence:"Strong — Grindem et al 2016: 9 months RTS = 51% re-injury reduction" },
      { name:"Psychological Readiness (ACL-RSI)", desc:"Use ACL-RSI questionnaire. Fear of re-injury = primary barrier to RTS. Address with graded exposure and self-efficacy building.", evidence:"Strong — Ardern et al: psychological readiness = RTS outcome predictor" },
    ]
  },
  {
    id:"knee_it_band",
    label:"IT Band Syndrome (ITBS)",
    icon:"🟠",
    color:"#ff6b35",
    evidence:"Fairclough 2006 / Weckstrom 2016",
    phases:[
      {
        phase:"Phase 1 — Load Reduction (Weeks 1–3)",
        color:"#00c97a",
        exercises:[
          { name:"Hip Abduction — Sidelying (glute med)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Primary exercise for ITBS. Glute med weakness = excessive hip adduction = increased IT band tension. Sidelying, hip slightly extended.", cues:"Toes slightly down. Lift 30°. Hold 2s. Don't flex hip.", evidence:"Strong — hip abductor weakness primary cause of ITBS" },
          { name:"Clam — with Band", sets:3, reps:25, hold:1, freq:"Daily", desc:"Clamshell with resistance band above knees. Glute med + ER activation. Hip in slight extension (crucial for glute, not TFL).", cues:"Band just above knees. Hip slightly behind trunk. Rotate slowly.", evidence:"Strong — glute med isolation for ITBS" },
          { name:"Single Leg Balance (proprioception)", sets:3, reps:0, hold:30, freq:"Daily", desc:"Running injury = proprioception failure. Single leg stance. Progress: slight knee bend (30°), eyes closed, surface perturbation.", cues:"Slight knee bend. React to balance challenge. Head up, look forward.", evidence:"Strong — proprioception retraining for runners" },
        ]
      },
      {
        phase:"Phase 2 — Strength & Running Reintroduction (Weeks 4–8)",
        color:"#ffb300",
        exercises:[
          { name:"Lateral Band Walk", sets:3, reps:20, hold:0, freq:"Daily", desc:"Band above knees. Side step in slight squat. Glute med + hip control in weight-bearing. Best pre-run activation drill.", cues:"Stay low. Steps sideways. Knees pushing against band throughout.", evidence:"Strong — functional glute med activation before running" },
          { name:"Single-Leg Squat (5cm step)", sets:3, reps:12, hold:2, freq:"Daily", desc:"Stand on 5cm step. Single leg squat to 30°. Control knee valgus. This is the key functional test AND exercise for ITBS.", cues:"Knee straight over 2nd toe. Pelvis level. Stop if valgus occurs.", evidence:"Strong — functional hip + quad loading for ITBS" },
          { name:"Running Cadence Increase (10%)", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Increase running cadence 10% using metronome (app). Reduces hip adduction and stride length — directly reduces IT band tension.", cues:"Count steps. Use metronome app. Smaller, quicker steps. Same pace.", evidence:"Strong — Noehren 2011: cadence increase reduces IT band load 19%" },
          { name:"Downhill Avoidance + Gradual Return", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"ITBS is worse downhill (IT band compresses at 30° flexion). Avoid hills for 6 weeks. Return flat first, gentle hills last.", cues:"Start flat. Treadmill incline 0%. Add hills at week 8 only.", evidence:"Strong — load management for IT band impingement" },
        ]
      },
    ],
    treatment:[
      { name:"TFL / IT Band Foam Roll", desc:"Foam roll lateral thigh 90 sec. NOT directly on IT band (too painful). Roll TFL at hip more than band itself. 2× daily.", evidence:"Moderate — reduces TFL tone, indirect IT band tension relief" },
      { name:"Hip Flexor Stretch (couch stretch)", desc:"Couch stretch × 3 × 60 sec. Tight hip flexors increase anterior pelvic tilt = increased IT band tension.", evidence:"Moderate — hip flexor length restoration" },
      { name:"Corticosteroid Injection (acute severe)", desc:"Ultrasound-guided injection into IT band bursa at lateral epicondyle. Consider if pain >6/10, unable to exercise. One injection only — does not fix cause.", evidence:"Moderate — short term pain relief only. Must combine with exercise." },
    ]
  },
  {
    id:"knee_patellar_tendon",
    label:"Patellar Tendinopathy",
    icon:"⚡",
    color:"#00c97a",
    evidence:"Purdam 2004 / Kongsgaard 2009 / Rio 2015",
    phases:[
      {
        phase:"Phase 1 — Pain Control (Weeks 1–4)",
        color:"#00c97a",
        exercises:[
          { name:"Isometric Leg Extension (70° knee bend)", sets:5, reps:1, hold:45, freq:"Daily (pre-sport)", desc:"Leg extension machine. Knee at 70°. Push maximally without moving. 45 second hold. Immediate analgesia effect (10 min). Do before training.", cues:"Maximum effort push. No movement. 45 seconds. Pain 0–4/10 acceptable.", evidence:"Strong — Rio et al 2015: isometrics = pain relief + cortical inhibition" },
          { name:"Decline Board Squat — Isometric Hold", sets:5, reps:1, hold:45, freq:"Daily", desc:"Stand on 25–35° decline board. Single leg squat hold at 60°. Isometric. More functional than leg extension for athletes.", cues:"Lean forward (decline helps). Hold the position. No bouncing. Feel the tendon load.", evidence:"Strong — most effective isometric loading for patellar tendinopathy" },
        ]
      },
      {
        phase:"Phase 2 — Isotonic Heavy Slow Resistance (Weeks 4–12)",
        color:"#ffb300",
        exercises:[
          { name:"Decline Single-Leg Squat — HSR Protocol", sets:4, reps:8, hold:0, freq:"3×/wk (NOT daily)", desc:"Heavy Slow Resistance (HSR) protocol. Decline board 25°. Single leg. 3s down, 3s up. Load with vest/barbell. Kongsgaard 2009: HSR = best long-term tendinopathy outcome.", cues:"3 seconds down, 3 seconds up. SLOW is the key. Load heavily enough to limit to 8 reps.", evidence:"Strong — Kongsgaard 2009: HSR > corticosteroid at 6 months" },
          { name:"Leg Press (single leg — slow)", sets:4, reps:8, hold:0, freq:"3×/wk", desc:"Slow leg press. 3s eccentric, 3s concentric. Heavier than traditional. Progresses to sport-specific strength.", cues:"Count 3 seconds each way. Heavy enough that last 2 reps are hard.", evidence:"Strong — HSR protocol for tendinopathy" },
          { name:"Spanish Squat (wall squat — isometric)", sets:4, reps:1, hold:45, freq:"Daily between HSR days", desc:"Band around fixed post + behind back. Squat to 60°. Push knees out against band. Long-duration isometric for pain days / maintenance.", cues:"Knees out against band. Back upright. Feel quad. Hold 45 seconds.", evidence:"Strong — adjunct to HSR on rest days" },
        ]
      },
      {
        phase:"Phase 3 — Energy Storage & Return to Sport (Weeks 12+)",
        color:"#ff4d6d",
        exercises:[
          { name:"Box Jump (double to single leg)", sets:4, reps:6, hold:0, freq:"2×/wk", desc:"Load the tendon with energy storage (plyometric). Start double leg. Progress to single leg box jump. Only introduce after HSR for 8 weeks, pain <2/10.", cues:"Land soft. Absorb. Pause. Don't rush. Pain <2/10 only.", evidence:"Strong — energy storage loading for patellar tendon RTS" },
          { name:"Depth Jump + Squat Jump", sets:3, reps:6, hold:0, freq:"2×/wk", desc:"Drop off box then immediate explosive jump. Maximum reactive strength for tendon. Sport-specific for jumpers/runners.", cues:"Ground contact <0.2 sec. Think: hot coals. Explosive. Only if pain-free.", evidence:"Strong — reactive tendon loading for return to jumping sports" },
        ]
      },
    ],
    treatment:[
      { name:"ESWT — Shockwave", desc:"Radial or focused ESWT × 2000 pulses per session × 3 sessions. Apply to patellar tendon. Pain 5–7/10 during acceptable. Best for chronic tendinopathy >3 months.", evidence:"Strong — Zwerver 2011 RCT, multiple systematic reviews" },
      { name:"Avoid Stretching in Acute Phase", desc:"Stretching compresses the tendon against patella. AVOID in phase 1. Only introduce gentle stretching in phase 3 when pain settled.", evidence:"Strong — Purdam 2004: stretching worsens reactive tendinopathy" },
      { name:"Load Monitoring (VISA-P)", desc:"Use VISA-P questionnaire weekly. Score <80 = modify training. Score >90 = safe to progress. Track load with training diary.", evidence:"Strong — VISA-P validated outcome measure for patellar tendinopathy" },
    ]
  },
];

// ─── SHOULDER EVIDENCE-BASED PROTOCOLS ───────────────────────────────────────
const SHOULDER_PROTOCOLS = [
  {
    id:"shoulder_rct", label:"Rotator Cuff Tendinopathy", icon:"💪", color:"#7f5af0",
    evidence:"Beaudreuil 2011 / Littlewood 2015 / BJSM Guidelines",
    phases:[
      { phase:"Phase 1 — Pain Control & Motor Control (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Pendulum (Codman) Exercise", sets:3, reps:20, hold:0, freq:"3×/day", desc:"Lean forward supported on a table. Let arm hang freely. Gently swing in small circles. Gravity-assisted distraction reduces subacromial compression.", cues:"Relax the shoulder completely. Let gravity do the work. No active muscle effort.", evidence:"Strong — reduces acute subacromial pain, safe in all irritability levels" },
        { name:"Scapular Retraction & Depression", sets:3, reps:15, hold:5, freq:"Daily", desc:"Squeeze shoulder blades together and DOWN. Hold 5s. Restores scapular upward rotation — essential for all RCT rehab.", cues:"Think: put your shoulder blades in your back pockets. Down AND back.", evidence:"Strong — scapular dyskinesis primary driver of subacromial impingement" },
        { name:"Isometric External Rotation (neutral)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Stand side-on to wall. Elbow at 90°, pressed against side. Push hand gently outward into wall. Isometric — no movement. Immediate analgesic effect.", cues:"Maximum effort push — no movement. 45 seconds. Pain 0–4/10 acceptable.", evidence:"Strong — Rio 2015 isometric protocol adapted for shoulder RCT" },
        { name:"Isometric Shoulder Abduction", sets:5, reps:1, hold:30, freq:"Daily", desc:"Stand beside wall. Press back of hand into wall at side. Gentle isometric abduction. Loads supraspinatus without arc of pain impingement zone.", cues:"Gentle push outward. No shrug. Keep shoulder blade down.", evidence:"Strong — supraspinatus isometric loading in phase 1" },
      ]},
      { phase:"Phase 2 — Strength & Load Tolerance (Weeks 4–10)", color:"#ffb300", exercises:[
        { name:"Side-Lying External Rotation", sets:3, reps:15, hold:2, freq:"Daily", desc:"Lie on non-affected side. Elbow at 90°, forearm resting on abdomen. Rotate forearm up toward ceiling. Best isolation exercise for infraspinatus + teres minor.", cues:"Elbow stays glued to side. Rotate slowly. No shrug. 2s hold at top.", evidence:"Strong — Reinold 2004: highest infraspinatus EMG activation" },
        { name:"Prone Y — Lower Trapezius", sets:3, reps:15, hold:3, freq:"Daily", desc:"Lie face down, arm at 135° (Y position). Raise arm toward ceiling. Thumb up. Lower trapezius activation essential for scapular upward rotation.", cues:"Thumb pointing up. Squeeze scapula down before lifting. Don't shrug.", evidence:"Strong — lower trap isolation for scapular control" },
        { name:"Prone T — Middle Trapezius", sets:3, reps:15, hold:3, freq:"Daily", desc:"Lie face down, arms at 90° (T position). Raise both arms. Middle trap + rhomboid activation. Corrects scapular protraction pattern.", cues:"Arms at 90° exactly. Lift only as high as pain-free. Hold 3s.", evidence:"Strong — Ekstrom 2003: optimal mid-trap activation" },
        { name:"Band External Rotation (0° abduction)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band anchored at elbow height. Elbow at side, 90° flexion. Rotate outward against band. Concentric + eccentric control.", cues:"Elbow stays at side. Slow return (3 seconds in). Keep shoulder blade down.", evidence:"Strong — infraspinatus + teres minor progressive loading" },
        { name:"Full Can (Scaption) — Band/Weight", sets:3, reps:15, hold:1, freq:"Daily", desc:"Arm raised in plane of scapula (30° forward of coronal plane), thumb up. Raise to shoulder height only. Supraspinatus loading in safest arc.", cues:"Thumb up. 30° forward of side. Raise to 90° only. No shrug.", evidence:"Strong — Kelly 1996: full can = optimal supraspinatus with least impingement" },
        { name:"Serratus Anterior Punch", sets:3, reps:15, hold:2, freq:"Daily", desc:"Back on floor or standing at wall. Push arm forward (punch) against resistance. Protracts scapula. Most neglected muscle in shoulder rehab.", cues:"Push forward and slightly upward. Feel the shoulder blade wrapping around ribs.", evidence:"Strong — Ludewig 2004: serratus anterior most important scapular stabiliser" },
      ]},
      { phase:"Phase 3 — Function & Return to Activity (Weeks 10+)", color:"#ff4d6d", exercises:[
        { name:"Overhead Press (cable/dumbbell — pain-free arc)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"Progressive overhead loading. Start with cable. Press to full overhead if pain-free. Key functional goal for shoulder rehab.", cues:"Retract scapula first. Press in line with ear. No shrug at top.", evidence:"Strong — progressive overload for RCT return to function" },
        { name:"Pull-Apart — Band (horizontal abduction)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Hold band at shoulder height, hands wide. Pull band apart to T position. Posterior capsule stretch + posterior RCT strengthening.", cues:"Straight elbows. Pull back to T. Squeeze scapulas. Hold 2s.", evidence:"Strong — posterior cuff + scapular retractor loading" },
        { name:"Diagonal PNF Pattern (D2 Flexion)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"With band/cable. Start: arm across body low. Move diagonally up and out to end range. Functional pattern used in throwing, reaching overhead.", cues:"Full diagonal. Thumb leads upward. Smooth arc. No pain >3/10.", evidence:"Strong — PNF D2 pattern: functional overhead rehabilitation" },
        { name:"Wall Slide with Upward Rotation", sets:3, reps:15, hold:2, freq:"Daily", desc:"Forearms on wall, elbows at 90°. Slide arms up while maintaining scapular upward rotation. Challenges serratus + lower trap at end-range overhead.", cues:"Maintain forearm contact. Feel shoulder blade rotate — not just shrug.", evidence:"Strong — overhead scapular control for return to sport/work" },
      ]},
    ],
    treatment:[
      { name:"Posterior Capsule Stretch (Sleeper Stretch)", desc:"Sidelying on affected side. Bring forearm down toward floor (internal rotation). 3 × 30 sec. Tight posterior capsule causes anterosuperior humeral head migration.", evidence:"Strong — Tyler 2010: posterior capsule tightness corrected reduces impingement" },
      { name:"ESWT — Shockwave (calcific tendinopathy)", desc:"Focused ESWT × 2000 pulses × 3 sessions for calcific deposits. Best evidence for calcific rotator cuff tendinopathy.", evidence:"Strong — Gerdesmeyer 2003: ESWT superior to placebo for calcific RCT" },
      { name:"Dry Needling / Acupuncture (trigger points)", desc:"Target infraspinatus, supraspinatus, upper trapezius trigger points. 3–5 needles × 20 min. Reduces myofascial pain and improves ER ROM before exercise.", evidence:"Moderate — trigger point needling reduces shoulder pain in RCT" },
      { name:"Joint Mobilisation — GH Posterior Glide", desc:"Maitland Grade III–IV posterior glide of humeral head. Increases internal rotation range. Indicated when posterior capsular tightness limits IR.", evidence:"Moderate — Bergman 2004: mobilisation + exercise superior to exercise alone" },
      { name:"Kinesio Taping — Scapular Facilitation", desc:"Y-strip from thoracic spine to inferior angle of scapula. Facilitates lower trapezius, corrects scapular downward rotation pattern.", evidence:"Moderate — reduces pain and improves scapular kinematics short-term" },
    ]
  },
  {
    id:"shoulder_instability", label:"Shoulder Instability (MDI/Anterior)", icon:"🔄", color:"#00c97a",
    evidence:"Jaggi & Lambert 2010 / Kuhn 2010 RCT / JOSPT Guidelines",
    phases:[
      { phase:"Phase 1 — Neuromuscular Control (Weeks 1–6)", color:"#00c97a", exercises:[
        { name:"Rhythmic Stabilisation (Proprioception)", sets:3, reps:20, hold:0, freq:"Daily", desc:"Therapist applies quick random perturbations to arm. Patient resists without allowing movement. Retrains proprioception lost after instability/dislocation.", cues:"React quickly to perturbations. Small muscles — not big prime movers.", evidence:"Strong — proprioceptive retraining primary in instability rehab" },
        { name:"Closed Chain Wall Press (Isometric ER)", sets:3, reps:15, hold:5, freq:"Daily", desc:"Elbow at 90°, forearm against wall. Press outward isometrically. Closed chain — compresses glenohumeral joint. Safe stabiliser activation.", cues:"Press into wall. Feel deep rotators working. No shrug. Hold 5s.", evidence:"Strong — closed chain exercises safer than open chain in instability phase 1" },
        { name:"Four-Point Kneeling Weight Shift", sets:3, reps:20, hold:0, freq:"Daily", desc:"On all fours. Gently shift weight onto affected arm. Small circles. Closed chain proprioception and compression. Fundamental exercise for MDI.", cues:"Elbow soft (not locked). Shift weight slowly. Shoulder blade stable — no winging.", evidence:"Strong — foundational closed chain for MDI and anterior instability" },
        { name:"Scapular Clock Exercise", sets:3, reps:12, hold:2, freq:"Daily", desc:"Move scapula to 12, 3, 6, 9 o'clock positions actively. Improves voluntary scapular control — prerequisite for all shoulder stability.", cues:"Learn to isolate scapular movement from arm movement. Slow and deliberate.", evidence:"Strong — volitional scapular control essential for instability management" },
      ]},
      { phase:"Phase 2 — Dynamic Stability & Strength (Weeks 6–14)", color:"#ffb300", exercises:[
        { name:"External Rotation Strengthening (band — progressive)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band ER in neutral, then 45°, then 90° abduction. Infraspinatus + teres minor depresses humeral head, preventing anterior translation.", cues:"Elbow at side. Rotate outward slowly. Control return 3 seconds. No pain.", evidence:"Strong — Kuhn 2010 RCT: ER strengthening reduces instability events" },
        { name:"Push-Up Plus (Serratus Activation)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Standard push-up then add extra scapular protraction at top. Maximises serratus anterior. Critical for scapular stability in instability.", cues:"At top of push-up: push further — shoulder blades apart. Hold 2s.", evidence:"Strong — highest serratus anterior EMG activation in literature" },
        { name:"Sidelying ER in 90° Abduction", sets:3, reps:15, hold:2, freq:"Daily", desc:"Sidelying, arm abducted to 90° supported. Externally rotate against gravity/weight. Loads infraspinatus in functional position.", cues:"Keep arm at 90° throughout. Rotate slowly. Feel posterior cuff contracting.", evidence:"Strong — posterior cuff functional loading for overhead instability" },
      ]},
      { phase:"Phase 3 — Sport/Function Specific (Weeks 14+)", color:"#ff4d6d", exercises:[
        { name:"Plyometric Ball Catch (wall throw)", sets:3, reps:15, hold:0, freq:"3×/wk", desc:"Throw small ball against wall and catch. Reactive shoulder muscle activation. Trains rapid co-contraction needed for sport.", cues:"Catch with elbow slightly bent. Absorb — don't let arm fly back. Fast reactive catch.", evidence:"Strong — plyometric shoulder loading for return to overhead sport" },
        { name:"90/90 ER Strengthening (throwing position)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Arm abducted 90°, elbow at 90°. ER against band. The 90/90 position is where anterior instability is most at risk — must train here before return to throwing.", cues:"Shoulder at 90°, elbow at 90°. Rotate slowly. No pain. Build trust in position.", evidence:"Strong — position-specific strengthening for anterior instability clearance" },
      ]},
    ],
    treatment:[
      { name:"Taping — Anterior Support (McConnell)", desc:"McConnell tape from posterior deltoid to anterior, unloading anterior capsule. Apply before exercise. Reduces feeling of instability.", evidence:"Moderate — reduces apprehension and allows earlier loading" },
      { name:"Biofeedback EMG Training", desc:"Surface EMG on lower trapezius and serratus anterior. Real-time feedback during exercises. Accelerates motor learning for scapular stabilisers.", evidence:"Moderate — EMG biofeedback improves motor relearning for instability" },
      { name:"Surgical Referral Criteria", desc:"Refer if: >2 dislocation events, failed 6-month conservative management, high-demand athlete, significant labral tear on MRI.", evidence:"Strong — surgery superior to conservative for recurrent traumatic anterior instability in young athletes" },
    ]
  },
  {
    id:"shoulder_frozen", label:"Frozen Shoulder (Adhesive Capsulitis)", icon:"🧊", color:"#38bdf8",
    evidence:"Hannafin & Chiaia 2000 / Favejee 2011 RCT / Cochrane 2014",
    phases:[
      { phase:"Phase 1 — Freezing (Pain-Dominant, Weeks 1–9)", color:"#00c97a", exercises:[
        { name:"Pendulum Exercise", sets:3, reps:20, hold:0, freq:"3×/day", desc:"Lean forward, arm hanging free. Small gravity-assisted circles. Only exercise tolerated in acute freezing phase. Joint distraction reduces pain without stretching inflamed capsule.", cues:"Completely relax the arm. Gentle swing only — no forcing. Use body sway, not shoulder muscle.", evidence:"Strong — only safe active exercise in acute freezing phase" },
        { name:"Heat + Active-Assisted Flexion (supine)", sets:3, reps:10, hold:5, freq:"Daily", desc:"After heat. Lie on back. Use good arm to assist affected arm into flexion. Gravity-eliminated position reduces load.", cues:"Assisted only — good arm does the work. Stop at first resistance. Hold gently 5s.", evidence:"Moderate — maintain ROM without provoking acute capsulitis" },
      ]},
      { phase:"Phase 2 — Frozen (Stiffness-Dominant, Weeks 9–26)", color:"#ffb300", exercises:[
        { name:"Capsular Stretching — ER (hand on door frame)", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Stand in doorway. Elbow at 90°, forearm on frame. Rotate body away from arm. Anterior capsule is tightest — primary stretch in phase 2.", cues:"Body turns away from arm. Feel anterior shoulder stretch. Hold 30s. Pain 4–5/10 acceptable.", evidence:"Strong — Favejee 2011: stretching = corticosteroid injection at 6 weeks" },
        { name:"Finger Walking (flexion and abduction)", sets:3, reps:10, hold:5, freq:"3×/day", desc:"Walk fingers up wall in flexion, then abduction. Mark progress. Gravity-assisted stretch at end of available range.", cues:"Walk to maximum height. Hold at top 5s. Mark your progress on wall with tape.", evidence:"Strong — standard frozen shoulder active ROM exercise" },
        { name:"Pulley-Assisted Flexion", sets:3, reps:15, hold:5, freq:"Daily", desc:"Overhead pulley. Good arm pulls affected arm into flexion. Progressive end-range loading. Maintains and slowly increases capsular length.", cues:"Pull to end range. Hold 5s. Lower slowly. No sharp pain.", evidence:"Strong — active-assisted ROM in frozen phase" },
        { name:"Towel IR Stretch", sets:3, reps:1, hold:30, freq:"Daily", desc:"Hold towel behind back. Good arm above, affected arm below. Good arm gently pulls towel upward — stretches internal rotation.", cues:"Affected arm below. Good arm pulls slowly upward. Stop at firm resistance. 30s hold.", evidence:"Moderate — IR restoration in frozen phase" },
      ]},
      { phase:"Phase 3 — Thawing (Recovery, Months 6–24)", color:"#ff4d6d", exercises:[
        { name:"Full ROM Strengthening — All planes", sets:3, reps:15, hold:0, freq:"3×/wk", desc:"As ROM returns, progressively strengthen through full available range. Include: flexion, abduction, ER/IR, scaption.", cues:"Work through as much range as available. Don't force. ROM is returning — strengthen what you have.", evidence:"Strong — progressive loading as capsule thaws naturally" },
        { name:"Overhead Press (progressive)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"Begin dumbbell press in available range. Progress toward full overhead. Final functional milestone in frozen shoulder recovery.", cues:"Start with arm below 90°. Progress overhead as range permits. No cheating with trunk lean.", evidence:"Strong — return to overhead function as primary goal in thawing phase" },
      ]},
    ],
    treatment:[
      { name:"Corticosteroid Injection (early freezing)", desc:"Intra-articular injection in freezing phase (first 3 months). Most effective early intervention. Reduces acute capsular inflammation. Max 2 injections.", evidence:"Strong — Buchbinder 2003 Cochrane: injection superior for short-term pain and ROM" },
      { name:"Hydrodilatation (distension arthrography)", desc:"Inject saline + corticosteroid + local anaesthetic into joint to distend capsule. Effective in frozen phase for rapid ROM gains.", evidence:"Strong — Quraishi 2007: hydrodilatation + physio superior to physio alone" },
      { name:"Heat (pre-exercise)", desc:"Hot pack or heat rub to shoulder 15 min before stretching exercises. Increases capsular extensibility. Always precede stretching with heat.", evidence:"Strong — tissue extensibility increased with heat before stretching" },
      { name:"MUA / Surgical Capsular Release", desc:"Manipulation under anaesthesia or arthroscopic capsular release if no improvement at 6 months.", evidence:"Moderate — indicated in refractory frozen shoulder failing 6-month conservative care" },
    ]
  },
];

// ─── ELBOW EVIDENCE-BASED PROTOCOLS ──────────────────────────────────────────
const ELBOW_PROTOCOLS = [
  {
    id:"elbow_lateral", label:"Lateral Epicondylalgia (Tennis Elbow)", icon:"🎾", color:"#ff4d6d",
    evidence:"Coombes 2015 Lancet / Vicenzino 2003 / BJSM Consensus 2019",
    phases:[
      { phase:"Phase 1 — Pain Control & Isometrics (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Wrist Extension Isometric (pain-free position)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Seated, forearm supported on table, palm down. Press back of hand upward into other hand's resistance. No movement. 45s hold. Immediate pain relief.", cues:"Maximum effort push — no movement. 45 seconds. Pain 0–4/10 acceptable. Do before work tasks.", evidence:"Strong — Rio 2015 isometric protocol: immediate pain relief in tendinopathy" },
        { name:"Wrist Extensor Stretch (gentle)", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Arm straight, palm down. Use other hand to bend wrist downward. Gentle sustained stretch to lateral epicondyle origin.", cues:"Straight elbow. Gentle bend. Feel pull at outer elbow. No sharp pain. 30s hold.", evidence:"Moderate — tissue extensibility maintenance in acute phase" },
        { name:"Grip Strengthening — Putty (submaximal)", sets:3, reps:15, hold:3, freq:"Daily", desc:"Squeeze therapy putty or soft ball. Submaximal 50–60% effort only in phase 1.", cues:"Squeeze gently — not maximum. Hold 3s. Pain 0–3/10 only.", evidence:"Moderate — submaximal grip loading for early lateral epicondylalgia" },
      ]},
      { phase:"Phase 2 — Heavy Slow Resistance (Weeks 4–12)", color:"#ffb300", exercises:[
        { name:"Tyler Twist — Eccentric Wrist Extension", sets:3, reps:15, hold:0, freq:"Daily", desc:"Hold FlexBar with both hands. Twist with good arm into full wrist extension. Bad arm eccentrically controls return. Best evidence exercise for tennis elbow.", cues:"Good arm twists. Bad arm controls return SLOWLY (4s). Use green FlexBar to start.", evidence:"Strong — Tyler 2010 RCT: 81% improvement vs 0% control. Gold standard exercise." },
        { name:"Wrist Extension — Dumbbell (HSR protocol)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Forearm on table, palm down, holding dumbbell. Extend wrist upward (3s up, 3s down). Heavy slow resistance.", cues:"3 seconds up. Hold 2s at top. 3 seconds down. Heavy enough to limit to 15 reps.", evidence:"Strong — HSR superior to eccentric alone for tendinopathy at 6 months" },
        { name:"Forearm Pronation/Supination — Dumbbell", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Elbow at 90°, hold dumbbell at one end (lever). Rotate forearm palm up to palm down.", cues:"Elbow fixed at side. Rotate slowly. The longer you hold the dumbbell end, the harder it is.", evidence:"Moderate — supinator loading reduces lateral elbow load" },
        { name:"Wrist Radial Deviation — Dumbbell", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Hold dumbbell at one end vertically. Raise thumb-side upward (radial deviation). ECRL and ECRB loading.", cues:"Wrist moves only — not elbow. Slow up and slow down.", evidence:"Moderate — full wrist extensor loading for lateral epicondylalgia" },
      ]},
      { phase:"Phase 3 — Function & Return to Sport/Work (Weeks 12+)", color:"#ff4d6d", exercises:[
        { name:"Grip Strengthening — Maximum (dynamometer)", sets:3, reps:10, hold:5, freq:"3×/wk", desc:"Maximum grip strength training. Return to full grip capacity. Key for return to racquet sports, manual work.", cues:"Maximum grip. Hold 5s. Track progress with dynamometer. Goal: equal to unaffected side.", evidence:"Strong — grip strength symmetry = return to sport readiness" },
        { name:"Sport-Specific Loading (racquet/tool simulation)", sets:3, reps:20, hold:0, freq:"3×/wk", desc:"Simulate sport or work movement under load. Gradual return to aggravating activity.", cues:"Start at 50% intensity. Add 10% per week. Pain <2/10 throughout.", evidence:"Strong — sport/work-specific loading for final stage return to function" },
      ]},
    ],
    treatment:[
      { name:"Deep Friction Massage (Cyriax)", desc:"Cross-friction massage directly to ECRB origin at lateral epicondyle. 5–10 min per session 3×/wk. Firm pressure perpendicular to tendon fibres.", evidence:"Moderate — Cyriax friction massage: short-term pain relief and tissue remodelling" },
      { name:"Lateral Elbow MWM (Mulligan)", desc:"Lateral glide of elbow while patient performs pain-free gripping. Immediate pain reduction. 3 sets × 10 reps per session.", evidence:"Strong — Vicenzino 2001: MWM immediate pain-free grip improvement" },
      { name:"ESWT — Shockwave Therapy", desc:"Radial ESWT × 2000 pulses × 3 sessions. Best for chronic lateral epicondylalgia >3 months.", evidence:"Strong — Rompe 2007 RCT: ESWT superior to corticosteroid at 12 months" },
      { name:"Corticosteroid Injection (short-term only)", desc:"Short-term pain relief at 6 weeks. WARNING: superior to physio at 6 weeks but inferior at 12 months and 2 years.", evidence:"Strong — Coombes 2010 Lancet: injection worst long-term outcome. Use only for acute severe pain." },
      { name:"Counterforce Brace", desc:"Apply 2–3 finger widths below lateral epicondyle. Reduces muscle belly expansion during contraction — offloads tendon origin.", evidence:"Moderate — reduces pain during activity; does not treat underlying pathology" },
    ]
  },
  {
    id:"elbow_medial", label:"Medial Epicondylalgia (Golfer's Elbow)", icon:"⛳", color:"#00c97a",
    evidence:"Sims 2014 / Steunebrink 2010 / JOSPT Clinical Practice Guidelines",
    phases:[
      { phase:"Phase 1 — Load Reduction & Isometrics (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Wrist Flexion Isometric (neutral position)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Forearm on table, palm up. Press palm upward into resisting hand. No movement. 45s isometric hold.", cues:"Maximum push — no movement. 45 seconds. Pain 0–4/10. Do before activity.", evidence:"Strong — isometric loading protocol for medial epicondyle tendon pain relief" },
        { name:"Wrist Flexor Stretch", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Arm straight, palm up. Other hand bends wrist into extension. Stretch to medial epicondyle origin.", cues:"Straight elbow. Gentle bend backward. Feel inner elbow stretch. 30s. No sharp pain.", evidence:"Moderate — tissue extensibility for common flexor origin" },
        { name:"Finger Flexor Tendon Gliding", sets:3, reps:10, hold:3, freq:"3×/day", desc:"Move fingers through full tendon glide sequence. Reduces adhesions, maintains tendon mobility in flexor mechanism.", cues:"Slow and deliberate through each position. Hold each 3s. No pain.", evidence:"Moderate — tendon gliding maintains flexor mechanism mobility" },
      ]},
      { phase:"Phase 2 — Progressive Loading (Weeks 4–12)", color:"#ffb300", exercises:[
        { name:"Wrist Flexion — Dumbbell (HSR)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Forearm on table palm up. Curl wrist upward with dumbbell. 3s up, hold 2s, 3s down. Heavy slow resistance for flexor-pronator mass.", cues:"3 seconds up. 3 seconds down. Heavy enough to limit to 15 reps. Forearm supported throughout.", evidence:"Strong — HSR protocol adapted for medial epicondyle tendinopathy" },
        { name:"Forearm Pronation — Dumbbell (lever)", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Elbow at 90°, hold dumbbell at one end. Rotate from supination to pronation. Loads pronator teres.", cues:"Elbow fixed. Rotate slowly to palm-down position. 3s each way.", evidence:"Strong — pronator teres loading essential for medial epicondylalgia" },
        { name:"Grip Strengthening — Putty (progressive)", sets:3, reps:20, hold:5, freq:"Daily", desc:"Putty or ball squeeze. Progress from soft to firm putty. Wrist flexors strongly activate with grip.", cues:"Full grip — all fingers. Hold 5s at full compression. 20 reps. Progress putty firmness.", evidence:"Moderate — grip loading as proxy for flexor-pronator mass strengthening" },
      ]},
      { phase:"Phase 3 — Return to Sport/Activity (Weeks 12+)", color:"#ff4d6d", exercises:[
        { name:"Rotational Power Training (medicine ball)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"Rotational throw against wall with medicine ball. Loads medial elbow in valgus + flexion pattern.", cues:"Start light (1kg). Rotate through core and elbow. Pain <2/10. Build speed gradually.", evidence:"Strong — sport-specific rotational loading for return to throwing/golf" },
        { name:"Wrist Flexion — Max Load", sets:4, reps:8, hold:2, freq:"3×/wk", desc:"Maximum load wrist flexion dumbbell curls. 4 × 8 for maximum strength.", cues:"3s up, 3s down. Load heavy. Track with progressive weight.", evidence:"Strong — maximum strength goal for discharge readiness" },
      ]},
    ],
    treatment:[
      { name:"Deep Friction Massage — Common Flexor Origin", desc:"Transverse friction massage to medial epicondyle origin. 5 min per session. Elbow slightly flexed during treatment.", evidence:"Moderate — tissue remodelling at common flexor tendon origin" },
      { name:"Medial Elbow MWM (Mulligan)", desc:"Lateral glide of elbow joint while patient performs grip or wrist flexion. Immediate pain-free movement restoration.", evidence:"Moderate — MWM immediate pain relief for medial epicondylalgia" },
      { name:"Ulnar Nerve Neural Mobilisation", desc:"Medial epicondylalgia often co-exists with cubital tunnel syndrome. Ulnar nerve sliders: elbow extension + wrist extension in sequence.", evidence:"Moderate — ulnar nerve involvement in up to 60% of medial epicondylalgia cases" },
    ]
  },
  {
    id:"elbow_cubital", label:"Cubital Tunnel Syndrome (Ulnar Nerve)", icon:"⚡", color:"#ffb300",
    evidence:"Caliandro 2016 Cochrane / Svernlöv 2009 RCT / AAOS Guidelines",
    phases:[
      { phase:"Phase 1 — Nerve Protection & Neural Mobility (Weeks 1–6)", color:"#00c97a", exercises:[
        { name:"Ulnar Nerve Slider (Neural Mobilisation)", sets:3, reps:10, hold:0, freq:"Daily", desc:"Sequence: elbow straight + wrist flexed → elbow bends while wrist extends. Slides ulnar nerve through cubital tunnel without tensioning.", cues:"Smooth alternating movement. No pins and needles during. Stop if symptoms worsen.", evidence:"Strong — neural sliders reduce cubital tunnel symptoms without provoking nerve" },
        { name:"Elbow Flexion Avoidance Training", sets:1, reps:0, hold:0, freq:"Ongoing", desc:"Avoid prolonged elbow flexion beyond 90°. Sleeping: pillow under arm. Phone: use speakerphone. Activity modification is primary intervention.", cues:"Avoid elbow bend beyond 90° for sustained periods. Most important intervention in mild-moderate cubital tunnel.", evidence:"Strong — Svernlöv 2009: night splinting + activity modification = 90% improvement at 6 months" },
        { name:"Grip & Pinch Strength Exercises", sets:3, reps:15, hold:3, freq:"Daily", desc:"Putty squeeze + pinch grip. Maintains intrinsic and extrinsic hand strength. Monitor for ring and little finger weakness.", cues:"Monitor for ring and little finger weakness. If grip declining — escalate to surgeon.", evidence:"Moderate — functional hand strength maintenance in cubital tunnel" },
      ]},
      { phase:"Phase 2 — Strengthening & Function (Weeks 6–12)", color:"#ffb300", exercises:[
        { name:"Ulnar Nerve Tensioner (mild — phase 2 only)", sets:3, reps:10, hold:5, freq:"3×/wk", desc:"Elbow extended, wrist extended, shoulder abducted + depressed. Slight tension on ulnar nerve. Only introduce when slider no longer provokes symptoms.", cues:"Only when sliders are completely symptom-free. Mild tension — stop at first symptom.", evidence:"Moderate — neural tensioning for nerve load tolerance in phase 2" },
        { name:"Intrinsic Hand Strengthening", sets:3, reps:15, hold:2, freq:"Daily", desc:"Finger abduction/adduction against resistance band. Interossei + hypothenar strengthening.", cues:"Spread fingers apart against band. Hold 2s. Monitor for weakness progression.", evidence:"Moderate — intrinsic strengthening for ulnar nerve motor preservation" },
      ]},
      { phase:"Phase 3 — Return to Full Function (Weeks 12+)", color:"#ff4d6d", exercises:[
        { name:"Progressive Grip Load — Dynamometer", sets:3, reps:10, hold:5, freq:"3×/wk", desc:"Measure grip strength with dynamometer. Progress to match unaffected side. Primary outcome measure.", cues:"Track progress. Goal: symmetrical grip strength. 10% per week increase maximum.", evidence:"Strong — grip strength symmetry primary outcome measure for cubital tunnel recovery" },
      ]},
    ],
    treatment:[
      { name:"Night Splint — Elbow Extension (30°)", desc:"Splint keeping elbow at 30° flexion during sleep. Most effective single intervention for mild-moderate cubital tunnel.", evidence:"Strong — Svernlöv 2009: night splinting = primary conservative treatment, 90% success mild-moderate" },
      { name:"Elbow Padding (soft pad)", desc:"Foam elbow pad over medial epicondyle during activities. Protects ulnar nerve from direct compression.", evidence:"Moderate — reduces direct pressure on cubital tunnel during daily activities" },
      { name:"Ergonomic Assessment", desc:"Assess workstation: keyboard height, armrest position, phone use. Sustained elbow flexion >90° is primary provocateur.", evidence:"Strong — ergonomic modification reduces sustained nerve compression" },
      { name:"Surgical Referral Criteria", desc:"Refer if: intrinsic muscle wasting, grip strength <60% unaffected side, failed 6-month conservative management. Anterior transposition or in-situ decompression.", evidence:"Strong — surgery for moderate-severe cubital tunnel with motor deficit" },
    ]
  },
  {
    id:"elbow_olecranon", label:"Olecranon Bursitis", icon:"🫧", color:"#38bdf8",
    evidence:"Reilly 1987 / Blackwell 2014 / BMJ Clinical Evidence Review",
    phases:[
      { phase:"Phase 1 — Swelling Control (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Elbow Protection & Padding", sets:1, reps:0, hold:0, freq:"Ongoing", desc:"Apply elbow pad over olecranon 24/7. Prevents repeated trauma to bursa. Most important intervention.", cues:"Never rest elbow directly on hard surface. Pad during sleep. Primary treatment in traumatic bursitis.", evidence:"Strong — pressure elimination is primary treatment for traumatic olecranon bursitis" },
        { name:"Ice + Compression (20 min, 3×/day)", sets:3, reps:1, hold:0, freq:"3×/day", desc:"Ice pack over elbow with compression bandage. 20 min on, 40 min off. Reduces bursal swelling and inflammation.", cues:"Never ice directly on skin. Compression bandage after icing. Elevate arm above heart.", evidence:"Strong — RICE protocol for acute bursitis swelling reduction" },
        { name:"Gentle Elbow ROM (pain-free arc only)", sets:3, reps:10, hold:0, freq:"Daily", desc:"Active elbow flexion/extension through pain-free range only. Maintains joint mobility while bursa settles.", cues:"Move only in pain-free range. Do not force. No direct pressure on back of elbow.", evidence:"Moderate — ROM maintenance during acute bursitis without aggravating bursa" },
      ]},
      { phase:"Phase 2 — Strength Recovery (Weeks 4–8)", color:"#ffb300", exercises:[
        { name:"Tricep Strengthening — Band (kickback)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Band fixed, elbow at 90°. Extend elbow against resistance. Strengthens tricep without compressing olecranon bursa.", cues:"Elbow control — slow extension. Avoid pressure on back of elbow. Monitor for swelling increase.", evidence:"Moderate — tricep strengthening without direct bursal compression" },
        { name:"Elbow Full ROM — Active", sets:3, reps:15, hold:0, freq:"Daily", desc:"Full active elbow flexion/extension as swelling allows. Progress to full range.", cues:"Full range when comfortable. Monitor swelling after exercise.", evidence:"Moderate — full ROM restoration in resolving bursitis" },
      ]},
      { phase:"Phase 3 — Return to Activity (Weeks 8+)", color:"#ff4d6d", exercises:[
        { name:"Full Elbow Strengthening Programme", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Bicep curl, tricep extension, forearm pronation/supination with progressive dumbbell load.", cues:"Pad during sport/manual work permanently if contact risk. Track progress.", evidence:"Strong — full strength restoration before return to contact sport/manual work" },
      ]},
    ],
    treatment:[
      { name:"Aspiration (needle drainage)", desc:"Ultrasound-guided aspiration of bursal fluid if tense or very swollen. Combined with corticosteroid injection in non-septic bursitis.", evidence:"Moderate — aspiration provides rapid symptom relief; recurrence rate 30% without corticosteroid" },
      { name:"Corticosteroid Injection (non-septic only)", desc:"Inject after aspiration in confirmed non-septic bursitis. NEVER inject if septic bursitis suspected.", evidence:"Moderate — corticosteroid post-aspiration reduces recurrence in non-septic olecranon bursitis" },
      { name:"Antibiotic Treatment (septic bursitis)", desc:"If septic: flucloxacillin 500mg QDS × 2 weeks. Refer to emergency if systemically unwell.", evidence:"Strong — antibiotic treatment mandatory for septic bursitis" },
    ]
  },
];

// ─── HIP EVIDENCE-BASED PROTOCOLS ────────────────────────────────────────────
const HIP_PROTOCOLS = [
  {
    id:"hip_oa", label:"Hip Osteoarthritis", icon:"🦴", color:"#ff7043",
    evidence:"NICE 2022 / OARSI 2019 / Cochrane Hip OA Review",
    phases:[
      { phase:"Phase 1 — Pain Control & Activation (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Supine Hip Abduction (sidelying)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Sidelying, raise top leg 30°. Hold 2s. Glute med activation without axial hip load. Safe in all hip OA stages.", cues:"Don't roll pelvis back. Toes slightly down. Hold at top.", evidence:"Strong — glute med activation without joint compression in hip OA" },
        { name:"Supine Hip Flexion (heel slide)", sets:3, reps:15, hold:0, freq:"Daily", desc:"Lie on back. Slide heel toward buttocks. Gravity-eliminated ROM exercise. Maintains hip flexion without axial load.", cues:"Slide heel — don't lift leg. Keep foot in contact. Go to comfortable range only.", evidence:"Strong — ROM maintenance without joint compression in acute OA" },
        { name:"Bridging — Bilateral", sets:3, reps:15, hold:5, freq:"Daily", desc:"Lie on back, knees bent, feet flat. Push through heels to lift hips. Hold 5s. Glute max activation without hip compression.", cues:"Push through heels. Squeeze glutes at top. Keep spine neutral.", evidence:"Strong — glute max + hamstring activation in non-weight-bearing position" },
        { name:"Seated Hip Flexor Stretch", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Sit at edge of chair. Let one leg drop behind. Tilt pelvis posteriorly. Stretch hip flexors — tight in hip OA.", cues:"Sit tall. Tilt pelvis back. Feel stretch at front of hip. 30s. No lumbar arch.", evidence:"Strong — hip flexor length restoration reduces anterior hip impingement in OA" },
      ]},
      { phase:"Phase 2 — Strength & Load (Weeks 4–10)", color:"#ffb300", exercises:[
        { name:"Mini Squat (0–45°) — Wall Support", sets:3, reps:15, hold:2, freq:"Daily", desc:"Stand with back to wall. Squat to 45° only. Functional quad + glute loading within pain-free range.", cues:"Weight even. Knees over 2nd toe. Stop at 45°. Push through heels to return.", evidence:"Strong — OARSI recommended functional loading for hip OA" },
        { name:"Step-Up (10cm step)", sets:3, reps:12, hold:1, freq:"Daily", desc:"Step up with affected leg leading. Full hip and knee extension at top. 3s eccentric lower.", cues:"Push through heel at top. Full extension. Lower the other foot slowly — 3 seconds.", evidence:"Strong — functional glute + quad loading for hip OA" },
        { name:"Resistance Band Hip Abduction (standing)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band above knees. Stand on one leg. Abduct other leg against band. Reduces Trendelenburg gait pattern.", cues:"Stand tall. Abduct slowly. Hold 2s. Don't lean to side. Keep pelvis level.", evidence:"Strong — glute med WB loading reduces hip OA gait deviation" },
        { name:"Static Cycling", sets:1, reps:0, hold:0, freq:"20–30 min daily", desc:"Low resistance cycling. Seat high to limit hip flexion. Best aerobic exercise for hip OA.", cues:"Seat high enough so hip flexes only 70–80° at bottom of stroke. No pain.", evidence:"Strong — NICE 2022: aerobic exercise first-line for hip OA" },
        { name:"Lateral Band Walk", sets:3, reps:20, hold:0, freq:"Daily", desc:"Band above knees. Side-step in slight squat. Glute med + TFL strengthening in weight-bearing.", cues:"Stay low. Steps sideways. Knees tracking over toes. Band stays taut throughout.", evidence:"Strong — functional glute med loading for hip OA gait retraining" },
      ]},
      { phase:"Phase 3 — Function & Long Term (Weeks 10+)", color:"#ff4d6d", exercises:[
        { name:"Single-Leg Stance (balance + strength)", sets:3, reps:1, hold:30, freq:"Daily", desc:"Stand on affected leg. Hold 30s. Progress: eyes closed, unstable surface. Reduces Trendelenburg and fall risk.", cues:"Stand tall. Slight knee bend. Pelvis level. Focus point ahead.", evidence:"Strong — proprioception training reduces hip OA disability" },
        { name:"Walking Programme — Progressive", sets:1, reps:0, hold:0, freq:"Daily", desc:"Start: 10 min flat. Progress 10% per week. Target: 30 min continuous. Best long-term intervention for hip OA.", cues:"Flat surface initially. Comfortable pace. Slight ache OK. Sharp pain: stop.", evidence:"Strong — NICE 2022 / OARSI: walking primary long-term recommendation for hip OA" },
        { name:"Leg Press — Single Leg (progressive)", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Single-leg press 0–60° range. Progressive load. Best gym exercise for hip OA.", cues:"Push through heel. Don't lock knee. Control return 3 seconds.", evidence:"Strong — progressive overload for hip OA functional recovery" },
      ]},
    ],
    treatment:[
      { name:"Manual Therapy — Hip Joint Mobilisation", desc:"Maitland Grade III–IV long-axis distraction + posterior glide. Reduces pain, improves IR and flexion ROM.", evidence:"Strong — Hoeksma 2004 RCT: manual therapy superior to exercise alone for hip OA at 5 weeks" },
      { name:"Corticosteroid Injection (intra-articular)", desc:"Ultrasound-guided IA injection. Consider if pain >7/10 preventing exercise. Short-term relief 4–8 weeks. Max 3 per year.", evidence:"Moderate — short-term pain relief allows physiotherapy; not disease-modifying" },
      { name:"Walking Aids Assessment", desc:"Assess need for walking stick (contralateral hand). Reduces hip joint load 25%. Prescribe if Trendelenburg gait.", evidence:"Strong — contralateral walking stick reduces hip joint load significantly in OA" },
      { name:"Weight Management Advice", desc:"Each 1kg weight loss reduces hip joint load by 3–4kg. Target BMI <25. Refer to dietitian if BMI >30.", evidence:"Strong — weight loss reduces hip OA symptoms and progression" },
    ]
  },
  {
    id:"hip_gtrochanteric", label:"Greater Trochanteric Pain Syndrome", icon:"📍", color:"#7f5af0",
    evidence:"Mellor 2018 JAMA / Vicenzino 2015 / LEAP Trial",
    phases:[
      { phase:"Phase 1 — Load Management & Tendon Protection (Weeks 1–6)", color:"#00c97a", exercises:[
        { name:"Hip Abductor Isometric (standing — wall)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Stand side-on to wall. Press hip into wall isometrically. 45s hold. Immediate analgesic effect for gluteal tendinopathy.", cues:"Stand tall. Press hip into wall — not pelvis. 45 seconds. Pain 0–4/10 only.", evidence:"Strong — isometric loading: immediate pain relief for gluteal tendinopathy" },
        { name:"Posture Correction — Avoid Hip Adduction", sets:1, reps:0, hold:0, freq:"Ongoing", desc:"CRITICAL: Avoid hip adduction positions — crossing legs, sitting with knees together, standing with weight on one hip.", cues:"No leg crossing. No hip hike standing. Sleep with pillow between knees. Sit with knees apart.", evidence:"Strong — LEAP trial: load management superior to corticosteroid injection at 12 months" },
        { name:"Clam Exercise (glute med isolation)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Sidelying, hips at 30° flexion (not more). Band above knees. Open top knee upward. Glute med isolation without compressive tendon load.", cues:"Hips at 30° only — more flexion compresses tendon. Foot stays grounded. Slow open.", evidence:"Strong — glute med activation without tendon compression in early GTPS" },
        { name:"Bridging — Bilateral (controlled)", sets:3, reps:15, hold:5, freq:"Daily", desc:"Bilateral bridge. Glute max + med activation without compressive hip adduction load.", cues:"Push through both heels. Squeeze glutes. Level pelvis. No hip drop.", evidence:"Strong — bilateral glute loading without compressive tendon forces" },
      ]},
      { phase:"Phase 2 — Progressive Tendon Loading (Weeks 6–12)", color:"#ffb300", exercises:[
        { name:"Single-Leg Bridge (eccentric control)", sets:3, reps:12, hold:2, freq:"3×/wk", desc:"Bridge up bilateral. Lower one leg. Hold single-leg bridge 2s. Progressive unilateral glute loading.", cues:"Keep pelvis level during single-leg hold. Don't let hip drop. Build to 12 reps.", evidence:"Strong — progressive unilateral glute loading for gluteal tendinopathy" },
        { name:"Side-Lying Hip Abduction — Weighted", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Sidelying, ankle weight. Abduct top leg to 30°. Hold 2s. Slow lower. Progressive glute med isotonic loading.", cues:"Toes slightly down. 30° abduction only. Hold at top. 3s lower. Don't roll pelvis.", evidence:"Strong — isotonic glute med loading for GTPS" },
        { name:"Standing Hip Abduction — Band (heavy)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Heavy resistance band. Stand on one leg. Abduct other against band. Functional WB glute med loading.", cues:"Stand tall. Pelvis level. Abduct slowly. Hold 2s. No hip hike or lean.", evidence:"Strong — functional glute med WB loading for GTPS" },
        { name:"Wall Squat — Bilateral (0–60°)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Back to wall. Squat to 60°. Bilateral — avoids hip adduction. Glute + quad functional loading.", cues:"Feet shoulder width. Knees tracking over toes. Keep weight even. No single-leg bias.", evidence:"Moderate — bilateral squat for GTPS functional strength" },
      ]},
      { phase:"Phase 3 — Energy Storage & Function (Weeks 12+)", color:"#ff4d6d", exercises:[
        { name:"Single-Leg Squat (controlled)", sets:3, reps:12, hold:2, freq:"3×/wk", desc:"Single-leg squat to 45°. Knee over 2nd toe. Pelvis level. Primary functional test AND exercise for GTPS.", cues:"Slow 3s down. Hold 2s. Push through heel up. Knee straight over 2nd toe. No valgus.", evidence:"Strong — functional single-leg loading for return to activity in GTPS" },
        { name:"Step-Down Eccentric (lateral)", sets:3, reps:10, hold:0, freq:"3×/wk", desc:"Stand on step. Lower non-affected foot slowly (4s). Eccentric glute control. Most demanding functional exercise.", cues:"Count 4 seconds down. Knee tracks over 2nd toe. Pelvis level throughout.", evidence:"Strong — eccentric glute loading for return to sport/stairs" },
        { name:"Running / Walking Programme — Graded", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Graded return to running. Start: walk-jog intervals. Progress 10% per week.", cues:"No camber running. Flat surface. Increase time before speed.", evidence:"Strong — graded running load for return to sport in GTPS" },
      ]},
    ],
    treatment:[
      { name:"Education — Tendon Load Management", desc:"Avoid: crossing legs, hip adduction stretches, IT band stretches (compresses tendon), deep hip flexion. Education alone reduces symptoms.", evidence:"Strong — LEAP 2018 JAMA: education + exercise superior to corticosteroid at 12 months" },
      { name:"ESWT — Shockwave", desc:"Radial ESWT × 2000 pulses × 3 sessions. Apply to point of maximum tenderness over greater trochanter.", evidence:"Strong — Rompe 2009: ESWT superior to home training and corticosteroid at 15 months" },
      { name:"Corticosteroid Injection (short-term only)", desc:"Superior at 8 weeks — inferior at 12 months vs exercise. Use only for severe acute pain preventing exercise.", evidence:"Strong — Mellor 2018: injection worse than exercise at 12 months. Short-term bridge only." },
      { name:"Avoid IT Band / Piriformis Stretches", desc:"Hip adduction stretches compress the gluteal tendons against the greater trochanter. STRICTLY AVOID in GTPS.", evidence:"Strong — compressive load avoidance is primary principle in GTPS management" },
    ]
  },
  {
    id:"hip_labral", label:"Hip Labral Tear (FAI / Non-Surgical)", icon:"🔵", color:"#38bdf8",
    evidence:"Casartelli 2011 / Freke 2016 / BJSM FAI Consensus 2016",
    phases:[
      { phase:"Phase 1 — Pain Control & Motor Control (Weeks 1–8)", color:"#00c97a", exercises:[
        { name:"Diaphragmatic Breathing + Core", sets:3, reps:10, hold:5, freq:"Daily", desc:"Lie on back, knees bent. Breathe into abdomen. Establishes intra-abdominal pressure and deep core activation. Foundation for hip labral stability.", cues:"Belly rises on inhale. Ribs down. Don't hold breath during exercise.", evidence:"Strong — deep core activation reduces hip joint stress in labral pathology" },
        { name:"Posterior Pelvic Tilt + TrA", sets:3, reps:15, hold:5, freq:"Daily", desc:"Supine, knees bent. Flatten lower back to floor. Hold 5s. Activates TrA and multifidus. Reduces anterior hip impingement position.", cues:"Nod pelvis backward. Feel lower back flatten. Don't hold breath.", evidence:"Strong — posterior pelvic tilt reduces anterior FAI impingement position" },
        { name:"Dead Bug (core + hip dissociation)", sets:3, reps:10, hold:5, freq:"Daily", desc:"Lie on back, arms up, hips at 90°. Lower one heel toward floor while maintaining core brace. Hip dissociation from spine — fundamental for FAI rehab.", cues:"Back stays flat throughout. Lower leg slowly. Breathe out as leg lowers. Stop if back arches.", evidence:"Strong — hip-spine dissociation training for FAI and labral stability" },
      ]},
      { phase:"Phase 2 — Strength & Neuromuscular Control (Weeks 8–16)", color:"#ffb300", exercises:[
        { name:"Glute Med Strengthening — Sidelying", sets:3, reps:20, hold:2, freq:"Daily", desc:"Sidelying hip abduction with ankle weight. Glute med weakness is primary finding in FAI and labral tears.", cues:"Toes slightly down. 30° abduction. Hold 2s. Track progress.", evidence:"Strong — glute med weakness primary modifiable factor in FAI" },
        { name:"Single-Leg Bridge — Progressive", sets:3, reps:12, hold:3, freq:"3×/wk", desc:"Bilateral → single-leg bridge → single-leg with contralateral hip extension. Progressive unilateral glute loading.", cues:"Pelvis level throughout. No hip drop. 3s hold per rep.", evidence:"Strong — unilateral glute loading for labral and FAI hip stability" },
        { name:"Hip Hinge — Deadlift Pattern (bodyweight)", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Push hips back. Maintain neutral spine. Return through glute squeeze. Fundamental movement retraining for FAI.", cues:"Push bum back to wall behind you. Spine neutral. Drive hips forward to return.", evidence:"Strong — hip hinge retraining reduces anterior hip impingement mechanics" },
        { name:"Lateral Band Walk (monster walk)", sets:3, reps:20, hold:0, freq:"Daily", desc:"Heavy band above knees. Step forward-diagonal pattern. Glute med + max co-activation in functional WB position.", cues:"Slight squat position throughout. Control every step. No knee valgus.", evidence:"Strong — functional glute co-activation for FAI hip stability" },
      ]},
      { phase:"Phase 3 — Return to Sport/Function (Weeks 16+)", color:"#ff4d6d", exercises:[
        { name:"Single-Leg Squat (full control)", sets:3, reps:12, hold:2, freq:"3×/wk", desc:"Single-leg squat to 60°. Full control of hip, knee, and pelvis. Key functional test for return to sport in FAI.", cues:"Knee tracks over 2nd toe. Pelvis level. No impingement pain at depth.", evidence:"Strong — single-leg squat as functional return to sport test for FAI" },
        { name:"Romanian Deadlift — Weighted", sets:3, reps:10, hold:1, freq:"3×/wk", desc:"Hip hinge with dumbbell/barbell. Progressive hamstring + glute max loading. Key strength exercise in FAI return to sport.", cues:"Push hips back. Spine neutral. Drive hips forward. Progressive load.", evidence:"Strong — posterior chain loading for FAI return to running/sport" },
        { name:"Running Mechanics Retraining", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Graded return with focus on hip extension at push-off, reduced anterior pelvic tilt, cadence increase.", cues:"Run tall. Drive hip back at push-off. Increase cadence 5–10%.", evidence:"Strong — running retraining reduces FAI impingement mechanics during sport" },
      ]},
    ],
    treatment:[
      { name:"Activity Modification (avoid impingement)", desc:"Avoid: deep hip flexion, hip IR in flexion, squatting below 90°, sitting low. Modify sport/work to avoid provocative range.", evidence:"Strong — activity modification reduces labral stress in conservative FAI management" },
      { name:"Intra-Articular Injection (diagnostic + therapeutic)", desc:"Ultrasound/fluoroscopy-guided IA injection. If significant pain relief = confirms intra-articular source.", evidence:"Moderate — diagnostic value + short-term pain relief for FAI/labral tears" },
      { name:"Surgical Referral Criteria", desc:"Refer if: failed 3–6 month conservative management, significant bony morphology, unable to return to sport.", evidence:"Strong — surgery for failed conservative FAI management with significant morphological impingement" },
    ]
  },
  {
    id:"hip_piriformis", label:"Piriformis Syndrome / Deep Gluteal", icon:"⚡", color:"#00c97a",
    evidence:"Boyajian-O'Neill 2008 / Hopayian 2010 / JOSPT Clinical Guidelines",
    phases:[
      { phase:"Phase 1 — Neural & Muscle Release (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Piriformis Stretch — Figure 4 (supine)", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Lie on back. Cross affected ankle over opposite knee. Pull both knees toward chest. Deep buttock stretch.", cues:"Keep ankle flexed (dorsiflexed). Pull gently. Feel deep buttock stretch. 30s. No pins and needles.", evidence:"Strong — primary stretch for piriformis shortening and sciatic nerve irritation" },
        { name:"Sciatic Nerve Slider", sets:3, reps:10, hold:0, freq:"Daily", desc:"Seated. Straighten knee + dorsiflex ankle together → relax. Slides sciatic nerve through piriformis.", cues:"Slow smooth movement. No sustained stretch. Stop if pins and needles increase.", evidence:"Strong — neural mobilisation for sciatic nerve sensitisation in piriformis syndrome" },
        { name:"Foam Roll — Gluteal (piriformis region)", sets:2, reps:1, hold:60, freq:"Daily", desc:"Sit on foam roller. Cross one ankle over knee. Roll onto crossed-leg side — directly on deep glute.", cues:"Find the tender spot. Hold there 10–15s. Breathe and relax.", evidence:"Moderate — myofascial release reduces piriformis tone and sciatic irritation" },
      ]},
      { phase:"Phase 2 — Strength & Stability (Weeks 4–10)", color:"#ffb300", exercises:[
        { name:"Clam Exercise — Glute Med", sets:3, reps:20, hold:2, freq:"Daily", desc:"Sidelying, hips at 60° flexion, band above knees. Open top knee upward. Piriformis overactivates when glute med is weak.", cues:"Hips at 60°. Foot stays grounded. Open slowly. Feel outer glute, not deep.", evidence:"Strong — glute med strengthening reduces piriformis compensatory overactivation" },
        { name:"Glute Max Bridging — Unilateral", sets:3, reps:15, hold:3, freq:"Daily", desc:"Single-leg bridge. Hold 3s at top. Glute max activation reduces piriformis load.", cues:"Drive through heel. Level pelvis. Don't let hip drop. Squeeze glute at top.", evidence:"Strong — glute max reactivation reduces piriformis overuse" },
        { name:"Standing Hip Abduction — Weighted", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Hold wall for balance. Abduct leg against ankle weight. Glute med strengthening in weight-bearing.", cues:"Stand tall. Don't lean. Abduct 30°. Hold 2s. Level pelvis throughout.", evidence:"Strong — WB glute med loading for piriformis syndrome management" },
      ]},
      { phase:"Phase 3 — Function & Return to Activity (Weeks 10+)", color:"#ff4d6d", exercises:[
        { name:"Single-Leg Squat — Controlled", sets:3, reps:12, hold:2, freq:"3×/wk", desc:"Single-leg squat to 45°. Tests glute med and max function — if piriformis syndrome resolved, should be pain-free.", cues:"Control knee. Level pelvis. No deep buttock pain. Progress depth gradually.", evidence:"Strong — functional return to activity test for piriformis syndrome" },
        { name:"Running Cadence + Hip Extension Training", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Graded return to running with focus on hip extension at push-off and gluteal activation.", cues:"Run tall. Drive hip back. Slight forward lean. Monitor for deep buttock pain.", evidence:"Strong — biomechanical running correction reduces piriformis overload" },
      ]},
    ],
    treatment:[
      { name:"Dry Needling — Piriformis Trigger Points", desc:"Trigger point dry needling to piriformis muscle belly. Patient prone. 3–5 needles × 20 min.", evidence:"Strong — Fishman 2002: dry needling superior to injection and stretching alone" },
      { name:"Neural Mobilisation — Sciatic Nerve", desc:"Sciatic nerve sliders and tensioners. Reduces intraneural oedema from piriformis compression.", evidence:"Strong — neural mobilisation reduces radicular symptoms in piriformis syndrome" },
      { name:"Sitting Posture Modification", desc:"Avoid sitting on wallet/hard objects. Use coccyx cushion. Avoid cross-legged sitting.", evidence:"Strong — postural modification reduces sustained nerve compression in piriformis syndrome" },
    ]
  },
  {
    id:"hip_hamstring", label:"Proximal Hamstring Tendinopathy", icon:"💥", color:"#ff4d6d",
    evidence:"Puranen 1988 / Lempainen 2009 / Goom 2016 IJSPT",
    phases:[
      { phase:"Phase 1 — Load Protection & Isometrics (Weeks 1–6)", color:"#00c97a", exercises:[
        { name:"Isometric Hamstring Contraction (prone)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Lie face down. Bend knee to 90°. Partner resists downward. Maximum isometric contraction 45s. Analgesic effect.", cues:"Maximum effort push — no movement. 45 seconds. Pain 0–4/10 acceptable.", evidence:"Strong — isometric loading for proximal hamstring tendinopathy pain relief" },
        { name:"Sitting Posture Management", sets:1, reps:0, hold:0, freq:"Ongoing", desc:"CRITICAL: Avoid prolonged sitting on hard surfaces. Use cushion. Keep hip flexion <70° when sitting.", cues:"Sit on soft surface. Lean forward slightly. No crossing legs. Stand every 30 min.", evidence:"Strong — compressive load avoidance is primary intervention in proximal hamstring tendinopathy" },
        { name:"Prone Hip Extension (glute activation)", sets:3, reps:15, hold:3, freq:"Daily", desc:"Lie face down. Lift one leg straight. Activates glute max to offload hamstring.", cues:"Squeeze glute first, then lift leg. Knee straight. Hold 3s. Feel glute working, not hamstring.", evidence:"Strong — glute max activation reduces proximal hamstring load" },
      ]},
      { phase:"Phase 2 — Heavy Slow Resistance (Weeks 6–14)", color:"#ffb300", exercises:[
        { name:"Deadlift — Hip Hinge (progressive load)", sets:3, reps:8, hold:1, freq:"3×/wk", desc:"Hip hinge deadlift. Start bodyweight, progress to barbell. 3s down, 3s up. Heavy slow resistance. Best exercise for PHT.", cues:"Push hips back. Spine neutral. Hamstring stretch at bottom. Drive hips forward. SLOW is key.", evidence:"Strong — HSR deadlift primary evidence-based exercise for proximal hamstring tendinopathy" },
        { name:"Nordic Hamstring Curl (eccentric)", sets:3, reps:6, hold:0, freq:"3×/wk", desc:"Kneel, feet fixed. Lower body forward slowly (3–5s). Eccentric hamstring loading.", cues:"Lower as slowly as possible. 5 seconds down. Catch yourself at bottom.", evidence:"Strong — Petersen 2011: Nordic curls reduce hamstring injury and strengthen proximal tendon" },
        { name:"Romanian Deadlift — Single Leg", sets:3, reps:10, hold:1, freq:"3×/wk", desc:"Single-leg RDL with dumbbell. Balance + hamstring + glute loading simultaneously.", cues:"Hip hinge on one leg. Spine neutral. Feel hamstring tension. Control balance.", evidence:"Strong — unilateral loading for PHT sport-specific strength" },
      ]},
      { phase:"Phase 3 — Energy Storage & Return to Sport (Weeks 14+)", color:"#ff4d6d", exercises:[
        { name:"Sprint Mechanics — Graded Return", sets:4, reps:6, hold:0, freq:"2×/wk", desc:"Graded sprint: jog → stride → 75% → 90% → 100%. Monitor PHT pain 24h post-session.", cues:"Build speed over 4 weeks. Track pain 24h post. No sprinting if pain >2/10 next day.", evidence:"Strong — graded sprint exposure for return to running sport with PHT" },
        { name:"Barbell Deadlift — Max Strength", sets:4, reps:5, hold:1, freq:"2×/wk", desc:"Heavy barbell deadlift. 4 × 5 for maximum posterior chain strength. Goal: 1.5× bodyweight.", cues:"Maximum load with perfect form. Track 1RM progress. Goal = 1.5× BW.", evidence:"Strong — maximum strength benchmark for PHT return to sprint sport clearance" },
      ]},
    ],
    treatment:[
      { name:"ESWT — Shockwave (ischial tuberosity)", desc:"Focused ESWT × 2000 pulses directly over ischial tuberosity. 3 sessions × weekly. Best for chronic PHT >3 months.", evidence:"Strong — Cacchio 2011 RCT: ESWT superior to exercise alone for chronic PHT" },
      { name:"Avoid Hamstring Stretching (acute phase)", desc:"Stretching compresses proximal hamstring tendon against ischial tuberosity. STRICTLY AVOID in phases 1–2.", evidence:"Strong — compressive stretching worsens reactive proximal hamstring tendinopathy" },
      { name:"VISA-H Outcome Monitoring", desc:"Use VISA-H questionnaire every 4 weeks. Score <80 = modify training load. Score >90 = cleared for full sport.", evidence:"Strong — VISA-H validated outcome measure for proximal hamstring tendinopathy" },
    ]
  },
  {
    id:"hip_iliopsoas", label:"Iliopsoas Bursitis / Snapping Hip", icon:"🔄", color:"#ffb300",
    evidence:"Mozes 1985 / Deslandes 2008 / JOSPT Hip Guidelines",
    phases:[
      { phase:"Phase 1 — Symptom Control & Flexibility (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Iliopsoas Stretch — Kneeling Lunge", sets:3, reps:1, hold:40, freq:"3×/day", desc:"Kneel on affected knee. Step other foot forward. Push hips forward. Posterior pelvic tilt during stretch.", cues:"Tuck pelvis under (posterior tilt). Feel stretch at front of hip. Hold 40s. No arch in back.", evidence:"Strong — iliopsoas lengthening primary intervention for iliopsoas bursitis and snapping hip" },
        { name:"Abdominal Bracing + Posterior Pelvic Tilt", sets:3, reps:15, hold:10, freq:"Daily", desc:"Standing or supine. Brace abdomen. Tilt pelvis posteriorly. Reduces anterior pelvic tilt which shortens iliopsoas.", cues:"Nod pelvis back. Flatten lower back. Hold 10s. Breathe normally.", evidence:"Strong — anterior pelvic tilt correction reduces iliopsoas tension in snapping hip" },
        { name:"Hip Flexor Rolling — Quadriceps/Iliopsoas", sets:2, reps:1, hold:60, freq:"Daily", desc:"Prone on foam roller. Roll from ASIS to mid-thigh. Reduces iliopsoas myofascial tone.", cues:"Find tender area. Hold 10–15s. Breathe and relax. Do NOT roll over bone (ASIS).", evidence:"Moderate — myofascial release reduces iliopsoas tone and snapping hip frequency" },
      ]},
      { phase:"Phase 2 — Strengthening & Movement Retraining (Weeks 4–10)", color:"#ffb300", exercises:[
        { name:"Iliopsoas Eccentric Loading — Step-Up", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Step-up focusing on controlled hip flexion lowering phase. Loads iliopsoas eccentrically.", cues:"Slow lower of trailing leg. 3s. Control the snap position. Stop if snapping worsens.", evidence:"Moderate — eccentric iliopsoas loading for snapping hip retraining" },
        { name:"Core Strengthening — Plank Series", sets:3, reps:1, hold:30, freq:"Daily", desc:"Forearm plank → side plank → plank with hip extension. Reduces anterior pelvic tilt driving iliopsoas tightness.", cues:"Spine neutral. Don't sag hips. Breathe normally. Build from 20s to 60s.", evidence:"Strong — core strength reduces anterior pelvic tilt and iliopsoas load" },
        { name:"Glute Med Strengthening — Clam + Band Walk", sets:3, reps:20, hold:2, freq:"Daily", desc:"Glute med weakness drives anterior pelvic tilt and iliopsoas overload.", cues:"Clam: hips 60°. Band walk: stay low. Pelvis level. Don't lean.", evidence:"Strong — glute med strengthening reduces anterior pelvic tilt driving snapping hip" },
      ]},
      { phase:"Phase 3 — Return to Full Activity (Weeks 10+)", color:"#ff4d6d", exercises:[
        { name:"Full Hip Flexion Strengthening — Resistance", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Cable or band hip flexion against resistance. Full controlled arc. Tests iliopsoas under load without snapping.", cues:"Controlled lift to 90°. Slow return. No snapping. Progress resistance gradually.", evidence:"Strong — full-range loaded hip flexion for iliopsoas return to function" },
        { name:"Running — Graded Return", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Graded return to running. Monitor for snapping during running gait.", cues:"No snapping during jog = safe to progress. Pain or snap: reduce pace and distance.", evidence:"Strong — graded running return for iliopsoas bursitis / snapping hip" },
      ]},
    ],
    treatment:[
      { name:"Ultrasound-Guided Bursal Injection", desc:"Corticosteroid into iliopsoas bursa under ultrasound guidance. Rapid pain relief — allows physiotherapy window.", evidence:"Moderate — short-term pain relief for acute iliopsoas bursitis" },
      { name:"Iliopsoas Tendon Injection (snapping)", desc:"Ultrasound-guided injection of local anaesthetic + corticosteroid into iliopsoas tendon sheath.", evidence:"Moderate — injection reduces snapping frequency in refractory iliopsoas tendon syndrome" },
      { name:"Surgical Release (refractory)", desc:"Arthroscopic or open lengthening of iliopsoas tendon at lesser trochanter if failed 6-month conservative management.", evidence:"Moderate — surgical lengthening for refractory internal snapping hip" },
    ]
  },
];

// ─── SHARED PROTOCOL PANEL RENDERER ──────────────────────────────────────────

export { OutcomeMeasuresModule, SOAPNoteModule };
