import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { getC } from './theme.jsx';
import { FMS_DB, FMS_STORAGE_KEY2, KC_REGIONS, MOVEMENTS, NKT_REGIONS, SUBJECTIVE_SECTIONS } from './shared.jsx';

function SubjectiveModule({ data, set }) {
  const [activeSection, setActiveSection] = useState("demographics");
  const [searchTerm, setSearchTerm] = useState("");
  const section = SUBJECTIVE_SECTIONS[activeSection];

  const countFilled = (secId) => {
    const sec = SUBJECTIVE_SECTIONS[secId];
    return sec.fields.filter(f => data[f.id] && data[f.id] !== "").length;
  };
  const totalFilled = Object.keys(SUBJECTIVE_SECTIONS).reduce((sum, k) => sum + countFilled(k), 0);
  const totalFields = Object.values(SUBJECTIVE_SECTIONS).reduce((sum, s) => sum + s.fields.length, 0);
  const pct = Math.round(totalFilled / totalFields * 100);

  const renderField = (f) => {
    const val = data[f.id] || "";
    const base = { width:"100%", background:C.s3, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontFamily:"inherit", outline:"none", padding:"8px 10px", fontSize:"0.8rem" };

    if (f.type === "multicheck") {
      const selected = val ? val.split("|||").filter(Boolean) : [];
      const filtered = f.options.filter(o => !searchTerm || o.toLowerCase().includes(searchTerm.toLowerCase()));
      const toggle = (opt) => {
        const next = selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt];
        set(f.id, next.join("|||"));
      };
      return (
        <div>
          {selected.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
              {selected.map(s => (
                <span key={s} onClick={() => toggle(s)}
                  style={{ padding:"3px 9px", borderRadius:20, fontSize:"0.7rem", fontWeight:600, background:`${section.color}20`, border:`1px solid ${section.color}50`, color:section.color, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  {s} <span style={{ fontWeight:900, opacity:0.7 }}>×</span>
                </span>
              ))}
            </div>
          )}
          <div style={{ maxHeight:220, overflowY:"auto", border:`1px solid ${C.border}`, borderRadius:8, padding:6 }}>
            {filtered.map(opt => {
              const sel = selected.includes(opt);
              return (
                <div key={opt} onClick={() => toggle(opt)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 7px", borderRadius:6, cursor:"pointer", background:sel?`${section.color}12`:"transparent", marginBottom:2, transition:"all 0.1s" }}>
                  <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${sel?section.color:C.border}`, background:sel?section.color:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {sel && <span style={{ color:"#000", fontSize:"0.55rem", fontWeight:900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:"0.78rem", color:sel?C.text:C.muted }}>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (f.type === "textarea") return (
      <textarea value={val} onChange={e => set(f.id, e.target.value)} placeholder={f.placeholder || ""}
        style={{ ...base, resize:"vertical", minHeight:72, display:"block" }} />
    );
    if (f.type === "select") return (
      <select value={val} onChange={e => set(f.id, e.target.value)} style={base}>
        <option value="">— select —</option>
        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    return (
      <input type={f.type || "text"} value={val} onChange={e => set(f.id, e.target.value)}
        placeholder={f.placeholder || ""} style={base} />
    );
  };

  return (
    <div>
      {/* Progress bar */}
      <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:14, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontWeight:700, color:C.text, fontSize:"0.85rem" }}>Subjective Assessment Progress</span>
          <span style={{ fontWeight:800, color:C.accent, fontSize:"0.85rem" }}>{pct}% complete</span>
        </div>
        <div style={{ height:6, background:C.s3, borderRadius:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.accent},${C.a2})`, borderRadius:6, transition:"width 0.3s" }} />
        </div>
        <div style={{ fontSize:"0.7rem", color:C.muted, marginTop:6 }}>{totalFilled} of {totalFields} fields completed across all sections</div>
      </div>

      {/* Search */}
      <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        placeholder="🔍 Search options across all fields..."
        style={{ width:"100%", background:C.s2, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:"0.82rem", fontFamily:"inherit", outline:"none", marginBottom:14 }} />

      {/* Section tabs */}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:16 }}>
        {Object.entries(SUBJECTIVE_SECTIONS).map(([key, sec]) => {
          const filled = countFilled(key);
          const isActive = activeSection === key;
          return (
            <button key={key} type="button" onClick={() => setActiveSection(key)}
              style={{ padding:"6px 12px", borderRadius:20, border:`1px solid ${isActive ? sec.color : filled > 0 ? sec.color + "50" : C.border}`, background: isActive ? `${sec.color}18` : filled > 0 ? `${sec.color}08` : "transparent", color: isActive ? sec.color : filled > 0 ? sec.color : C.muted, fontSize:"0.73rem", fontWeight: isActive ? 700 : 500, cursor:"pointer", display:"flex", alignItems:"center", gap:5, position:"relative" }}>
              {sec.icon} {sec.label}
              {filled > 0 && <span style={{ background:sec.color, color:"#000", borderRadius:10, padding:"0 5px", fontSize:"0.6rem", fontWeight:800 }}>{filled}</span>}
              {/* Mini progress arc at bottom of pill */}
              {filled > 0 && (
                <span style={{
                  position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)",
                  width:`${Math.min(100,Math.round(filled/sec.fields.length*100))}%`,
                  height:2, background:sec.color, borderRadius:2,
                  opacity:0.7, maxWidth:"calc(100% - 16px)"
                }}/>
              )}
            </button>
          );
        })}
        <button type="button" onClick={() => setActiveSection("__ergo__")}
          style={{ padding:"6px 12px", borderRadius:20, border:`1px solid ${activeSection==="__ergo__"?"#22d3ee":C.border}`, background:activeSection==="__ergo__"?"rgba(34,211,238,0.12)":"transparent", color:activeSection==="__ergo__"?"#22d3ee":C.muted, fontSize:"0.73rem", fontWeight:activeSection==="__ergo__"?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
          🖥 Ergonomic Assessment
        </button>
        <button type="button" onClick={() => setActiveSection("__bodychart__")}
          style={{ padding:"6px 12px", borderRadius:20, border:`1px solid ${activeSection==="__bodychart__"?"#ff4d6d":C.border}`, background:activeSection==="__bodychart__"?"rgba(255,77,109,0.12)":"transparent", color:activeSection==="__bodychart__"?"#ff4d6d":C.muted, fontSize:"0.73rem", fontWeight:activeSection==="__bodychart__"?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
          🗺 Body Chart
        </button>
      </div>

      {/* Section content */}
      {activeSection === "__bodychart__" ? (
        <BodyChartModule data={data} set={set}/>
      ) : activeSection === "__ergo__" ? (
        <div>
          <div style={{ background:"rgba(34,211,238,0.07)", border:"1px solid rgba(34,211,238,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:"1.4rem" }}>🖥</span>
            <div>
              <div style={{ fontWeight:800, color:"#22d3ee", fontSize:"0.95rem" }}>Ergonomic & Workstation Assessment</div>
              <div style={{ fontSize:"0.7rem", color:C.muted }}>Full workstation analysis with risk scoring and recommendations</div>
            </div>
          </div>
          <ErgoModule data={data} set={set}/>
        </div>
      ) : (
        <>
      <div style={{ background:`${section.color}08`, border:`1px solid ${section.color}25`, borderRadius:10, padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:"1.4rem" }}>{section.icon}</span>
        <div>
          <div style={{ fontWeight:800, color:section.color, fontSize:"0.95rem" }}>{section.label}</div>
          <div style={{ fontSize:"0.7rem", color:C.muted }}>{section.fields.length} fields · {countFilled(activeSection)} completed</div>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display:"grid", gap:12 }}>
        {section.fields.map(f => {
          const val = data[f.id] || "";
          const hasVal = val !== "";
          const selectedCount = f.type === "multicheck" ? (val ? val.split("|||").filter(Boolean).length : 0) : 0;
          return (
            <div key={f.id} style={{ background:C.surface, border:`1px solid ${hasVal ? section.color + "40" : C.border}`, borderRadius:10, padding:"11px 13px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                <label style={{ fontSize:"0.8rem", fontWeight:600, color:hasVal ? C.text : C.muted }}>
                  {f.label}
                  {hasVal && <span style={{ color:section.color, marginLeft:6, fontSize:"0.65rem" }}>✓</span>}
                  {selectedCount > 0 && <span style={{ marginLeft:6, background:section.color, color:"#000", borderRadius:8, padding:"0 6px", fontSize:"0.62rem", fontWeight:800 }}>{selectedCount} selected</span>}
                </label>
                {f.type === "multicheck" && val && (
                  <button type="button" onClick={() => set(f.id, "")} style={{ fontSize:"0.65rem", color:C.muted, background:"none", border:"none", cursor:"pointer", padding:"2px 6px" }}>clear</button>
                )}
              </div>
              {renderField(f)}
              {f.type === "multicheck" && (
                <textarea value={data[f.id + "_notes"] || ""} onChange={e => set(f.id + "_notes", e.target.value)}
                  placeholder="Additional notes / specify..."
                  style={{ width:"100%", background:C.s3, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, fontFamily:"inherit", outline:"none", padding:"6px 8px", fontSize:"0.76rem", resize:"vertical", minHeight:44, marginTop:6, display:"block" }} />
              )}
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
}


// ─── NKT REGION DATABASE ─────────────────────────────────────────────────────

// ─── KINETIC CHAIN REGION DATABASE ───────────────────────────────────────────

// ─── KINETIC CHAIN SECTION COMPONENT ─────────────────────────────────────────
function KineticChainSection({ data, set }) {
  const [region, setRegion] = useState("foot_ankle");
  const [openTest, setOpenTest] = useState(null);
  const [modalTest, setModalTest] = useState(null);
  const reg = KC_REGIONS[region];

  const roleColor = (role) => role==="MOBILITY"?"#00c97a":role==="STABILITY"?"#ff4d6d":"#ffb300";

  return (
    <div>
      {/* Theory banner */}
      <div style={{ background:"rgba(0,229,255,0.05)", border:"1px solid rgba(0,229,255,0.2)", borderRadius:12, padding:14, marginBottom:16 }}>
        <div style={{ fontWeight:800, color:C.accent, marginBottom:8, fontSize:"0.9rem" }}>⛓️ Joint-by-Joint Theory (Cook & Boyle)</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
          {[
            ["Foot","MOBILITY","#00c97a"],["Ankle","MOBILITY","#00c97a"],["Knee","STABILITY","#ff4d6d"],
            ["Hip","MOBILITY","#00c97a"],["Lumbar","STABILITY","#ff4d6d"],["Thoracic","MOBILITY","#00e5ff"],
            ["Scapula","STABILITY","#ff4d6d"],["GH","MOBILITY","#00c97a"],["Elbow","STABILITY","#ff4d6d"],
            ["Wrist","MOBILITY","#00c97a"],
          ].map(([j,r,col])=>(
            <div key={j} style={{ textAlign:"center", padding:"4px 9px", borderRadius:8, border:`1px solid ${col}40`, background:`${col}10` }}>
              <div style={{ fontSize:"0.68rem", fontWeight:700, color:col }}>{j}</div>
              <div style={{ fontSize:"0.55rem", color:col, opacity:0.8 }}>{r}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:"0.76rem", color:C.muted, lineHeight:1.6 }}>
          <strong style={{ color:C.text }}>Key Rule:</strong> When a MOBILE joint loses mobility → the adjacent STABLE joint is forced to become mobile → pain appears at the STABLE joint. <strong style={{ color:C.yellow }}>Always treat the CAUSE (mobile joint) not just the PAIN (stable joint).</strong>
        </div>
      </div>

      {/* Region tabs */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
        {Object.entries(KC_REGIONS).map(([key,r])=>(
          <button key={key} type="button" onClick={()=>{ setRegion(key); setOpenTest(null); }}
            style={{ padding:"6px 13px", borderRadius:20, border:`1px solid ${region===key?r.color:C.border}`, background:region===key?`${r.color}15`:"transparent", color:region===key?r.color:C.muted, fontSize:"0.74rem", fontWeight:region===key?700:400, cursor:"pointer" }}>
            {r.label}
            <span style={{ marginLeft:5, fontSize:"0.6rem", padding:"1px 5px", borderRadius:8, background:`${roleColor(r.role)}20`, color:roleColor(r.role) }}>{r.role}</span>
          </button>
        ))}
      </div>

      {/* Region intro */}
      <div style={{ background:`${reg.color}08`, border:`1px solid ${reg.color}25`, borderRadius:10, padding:14, marginBottom:16, fontSize:"0.8rem", color:C.text, lineHeight:1.7 }}>
        <span style={{ padding:"2px 8px", borderRadius:8, background:`${roleColor(reg.role)}20`, color:roleColor(reg.role), fontSize:"0.68rem", fontWeight:700, marginRight:8 }}>{reg.role}</span>
        {reg.intro}
      </div>

      {/* Tests */}
      {reg.tests.map((t)=>{
        const currentVal = data[t.id] || "";
        const currentOption = t.options.find(o=>o.val===currentVal);
        const isOpen = openTest === t.id;

        return (
          <div key={t.id} style={{ background:C.surface, border:`1px solid ${currentVal?reg.color+"40":C.border}`, borderRadius:12, marginBottom:10, overflow:"hidden" }}>
            {/* Header */}
            <div onClick={()=>setOpenTest(isOpen?null:t.id)}
              style={{ padding:"12px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", borderLeft:`3px solid ${currentVal?reg.color:"#1a2d45"}` }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:3 }}>
                  <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:7, background:`${roleColor(t.role.split(" ")[0])}20`, color:roleColor(t.role.split(" ")[0]), fontWeight:700 }}>{t.role}</span>
                  <span style={{ fontSize:"0.6rem", color:C.muted }}>Joint: {t.joint}</span>
                </div>
                <div style={{ fontWeight:700, fontSize:"0.88rem", color:C.text }}>{t.label}</div>
                {currentVal && (
                  <div style={{ marginTop:5, display:"inline-flex", alignItems:"center", gap:6, padding:"2px 8px", borderRadius:8, background:`${currentOption?.color||C.muted}18`, border:`1px solid ${currentOption?.color||C.muted}40` }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:currentOption?.color||C.muted }} />
                    <span style={{ fontSize:"0.68rem", fontWeight:700, color:currentOption?.color||C.muted }}>{currentVal}</span>
                  </div>
                )}
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0, marginLeft:10 }}>
                <button type="button" onClick={e=>{ e.stopPropagation(); setModalTest(t); }}
                  style={{ padding:"3px 10px", background:"rgba(127,90,240,0.15)", border:`1px solid ${C.a2}40`, borderRadius:6, color:C.a2, fontSize:"0.65rem", fontWeight:700, cursor:"pointer" }}>
                  ℹ How to Test
                </button>
                <span style={{ color:C.muted, fontSize:"0.75rem" }}>{isOpen?"▲":"▼"}</span>
              </div>
            </div>

            {/* Body */}
            {isOpen && (
              <div style={{ padding:"0 14px 14px" }}>

                {/* How to */}
                <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:8, padding:12, marginBottom:12 }}>
                  <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>👐 How to Perform</div>
                  <div style={{ fontSize:"0.8rem", color:C.text, lineHeight:1.7 }}>{t.how}</div>
                </div>

                {/* Options */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>📊 Select Finding — What Each Result Means</div>
                  {t.options.map(opt=>(
                    <div key={opt.val} onClick={()=>set(t.id, currentVal===opt.val?"":opt.val)}
                      style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 12px", borderRadius:9, marginBottom:7, cursor:"pointer", border:`1px solid ${currentVal===opt.val?opt.color:C.border}`, background:currentVal===opt.val?`${opt.color}12`:"transparent", transition:"all 0.15s" }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${opt.color}`, background:currentVal===opt.val?opt.color:"transparent", flexShrink:0, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {currentVal===opt.val && <span style={{ color:"#000", fontSize:"0.55rem", fontWeight:900 }}>✓</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:"0.8rem", color:opt.color, marginBottom:3 }}>{opt.val}</div>
                        <div style={{ fontSize:"0.76rem", color:C.text, lineHeight:1.6 }}>{opt.meaning}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chain Effect */}
                <div style={{ background:"rgba(0,229,255,0.05)", border:"1px solid rgba(0,229,255,0.2)", borderRadius:8, padding:11, marginBottom:10 }}>
                  <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:"1px", marginBottom:5 }}>⛓️ Kinetic Chain Effect</div>
                  <div style={{ fontSize:"0.77rem", color:C.text, lineHeight:1.6 }}>{t.chainEffect}</div>
                </div>

                {/* Treatment */}
                <div style={{ background:`${reg.color}08`, border:`1px solid ${reg.color}25`, borderRadius:8, padding:11 }}>
                  <div style={{ fontSize:"0.63rem", fontWeight:700, color:reg.color, textTransform:"uppercase", letterSpacing:"1px", marginBottom:5 }}>→ Treatment Protocol</div>
                  <div style={{ fontSize:"0.77rem", color:C.text, lineHeight:1.7 }}>{t.treatment}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal */}
      {modalTest && (
        <div onClick={()=>setModalTest(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${reg.color}50`, borderRadius:14, padding:24, maxWidth:560, width:"100%", maxHeight:"88vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontWeight:800, color:reg.color, fontSize:"1rem" }}>{modalTest.label}</div>
                <div style={{ fontSize:"0.7rem", color:C.muted, marginTop:3 }}>{modalTest.joint} · {modalTest.role}</div>
              </div>
              <button onClick={()=>setModalTest(null)} style={{ background:"none", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"3px 9px", cursor:"pointer" }}>✕</button>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>👐 How to Perform</div>
              <div style={{ background:C.s2, borderRadius:8, padding:14, fontSize:"0.82rem", color:C.text, lineHeight:1.8 }}>{modalTest.how}</div>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.a3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>📊 What Each Result Means</div>
              {modalTest.options.map(opt=>(
                <div key={opt.val} style={{ padding:"8px 12px", borderRadius:8, marginBottom:7, border:`1px solid ${opt.color}30`, background:`${opt.color}08` }}>
                  <div style={{ fontWeight:700, fontSize:"0.78rem", color:opt.color, marginBottom:3 }}>{opt.val}</div>
                  <div style={{ fontSize:"0.76rem", color:C.text, lineHeight:1.6 }}>{opt.meaning}</div>
                </div>
              ))}
            </div>

            <div style={{ background:"rgba(0,229,255,0.05)", border:"1px solid rgba(0,229,255,0.2)", borderRadius:8, padding:12, marginBottom:14 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:"1px", marginBottom:5 }}>⛓️ Kinetic Chain Effect</div>
              <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.6 }}>{modalTest.chainEffect}</div>
            </div>

            <div style={{ background:`${reg.color}08`, border:`1px solid ${reg.color}25`, borderRadius:8, padding:12, marginBottom:16 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:reg.color, textTransform:"uppercase", letterSpacing:"1px", marginBottom:5 }}>→ Treatment Protocol</div>
              <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.7 }}>{modalTest.treatment}</div>
            </div>

            <button onClick={()=>setModalTest(null)} style={{ width:"100%", padding:"9px", background:C.a2, border:"none", borderRadius:8, color:"#fff", fontWeight:700, cursor:"pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}



// ─── FUNCTIONAL MOVEMENT ANALYSIS ENGINE ─────────────────────────────────────

// All compensation options with their rule-based analysis
const COMPENSATIONS = {
  knee_valgus:         { label:"Knee Valgus", icon:"🦵", color:"#ff4d6d" },
  knee_varus:          { label:"Knee Varus", icon:"🦵", color:"#ff8c42" },
  pelvic_drop:         { label:"Pelvic Drop", icon:"🍑", color:"#ff4d6d" },
  anterior_pelvic_tilt:{ label:"Anterior Pelvic Tilt", icon:"🍑", color:"#ffb300" },
  posterior_pelvic_tilt:{ label:"Posterior Pelvic Tilt", icon:"🍑", color:"#ffb300" },
  trunk_lean_forward:  { label:"Trunk Lean Forward", icon:"🏋️", color:"#ff8c42" },
  trunk_lean_lateral:  { label:"Trunk Lean Lateral", icon:"↔️", color:"#ff8c42" },
  trunk_shift:         { label:"Trunk Shift", icon:"↕️", color:"#ffb300" },
  foot_pronation:      { label:"Foot Pronation", icon:"👣", color:"#ff8c42" },
  foot_supination:     { label:"Foot Supination", icon:"👣", color:"#ffb300" },
  heel_rise:           { label:"Heel Rise", icon:"👟", color:"#ff4d6d" },
  asymmetric_loading:  { label:"Asymmetric Loading", icon:"⚖️", color:"#ff4d6d" },
  instability:         { label:"Instability / Wobbling", icon:"⚡", color:"#ff4d6d" },
  limited_depth:       { label:"Limited Depth / ROM", icon:"📏", color:"#ffb300" },
  scapular_winging:    { label:"Scapular Winging", icon:"🪶", color:"#ff4d6d" },
  lumbar_flexion_comp: { label:"Lumbar Flexion Compensation", icon:"🔩", color:"#ff4d6d" },
  lumbar_extension_comp:{ label:"Lumbar Extension Compensation", icon:"🔩", color:"#ffb300" },
  pain_avoidance:      { label:"Pain Avoidance Movement", icon:"⚠️", color:"#ff4d6d" },
  forward_head:        { label:"Forward Head", icon:"🗣️", color:"#ffb300" },
  shoulder_elevation:  { label:"Shoulder Elevation", icon:"🫱", color:"#ffb300" },
};

// Rule-based analysis engine
const RULES = {
  // SQUAT
  squat:{
    knee_valgus:{
      weak:["Gluteus Medius","Gluteus Maximus","VMO (Vastus Medialis Oblique)"],
      tight:["IT Band","TFL (Tensor Fascia Latae)","Adductors","Gastrocnemius"],
      deficit:"Stability deficit — hip abductor weakness + ankle mobility",
      kinetic:"Ankle DF restriction → tibial IR → knee collapse. Glute med inhibited → TFL overactive → valgus.",
      root:"Glute Med inhibition (NKT) + Ankle DF restriction (kinetic chain). Treat ankle first, then activate glute med.",
      risk:["Medial knee ligaments (MCL)","ACL (lateral ground reaction force)","Medial meniscus","Patellofemoral joint"],
      assess:["Ankle DF lunge test","NKT Glute Med","Trendelenburg test","Ober's test (TFL)","VMO timing during terminal extension"],
      exercises:["Ankle DF mobility: wall lunge drill × 3 min daily","Clamshells (glute med isolation)","Lateral band walks","Terminal knee extension (VMO)","Single-leg squat progression"],
      progression:["Week 1–2: Ankle mobility + clamshells","Week 3–4: Goblet squat with cue","Week 5–6: Single-leg squat","Week 7+: Loaded squat with knee alignment feedback"],
    },
    knee_varus:{
      weak:["Adductors","Medial Hamstrings","Gastrocnemius medial head"],
      tight:["IT Band","Biceps Femoris","Lateral Gastrocnemius"],
      deficit:"Mobility deficit — lateral chain tightness",
      kinetic:"Lateral line (LL) restriction — IT band + lateral calf pulling tibia into varus.",
      root:"Lateral line fascial restriction (LL) + lateral hamstring overactivity. Release IT band first.",
      risk:["Lateral knee compartment","LCL","Lateral meniscus","Fibular head"],
      assess:["Noble compression test (IT band)","Ober's test","Lateral LL assessment","Ankle supination check"],
      exercises:["IT band SMR (foam roll)","TFL release","Adductor strengthening","Single-leg squat with medial cue"],
      progression:["Week 1: IT band SMR daily","Week 2: Adductor activation","Week 3: Squat with band cue","Week 4+: Loaded squat"],
    },
    heel_rise:{
      weak:["Tibialis Anterior","Deep Ankle Dorsiflexors"],
      tight:["Gastrocnemius","Soleus","Posterior Ankle Capsule","Achilles Tendon"],
      deficit:"Mobility deficit — ankle dorsiflexion restriction (primary driver)",
      kinetic:"Ankle DF restricted → heel rises → trunk leans forward → knees push forward → anterior pelvic tilt. ENTIRE chain disrupted by one ankle restriction.",
      root:"Gastrocnemius/soleus fascial restriction + possible posterior ankle capsule tightness. This is MOBILITY not weakness.",
      risk:["Achilles tendon","Plantar fascia","Patellar tendon","Lumbar discs (flexion load)"],
      assess:["Weight-bearing lunge test (DF)","Subtalar mobility","SBL tension test","Passive ankle DF measurement"],
      exercises:["Wall lunge DF drill × 3 min","Eccentric heel drops (soleus)","Gastrocnemius stretch × 3 × 30 sec","Talocrural posterior glide mobilisation","Ankle DF strengthening (tibialis anterior)"],
      progression:["Week 1–2: Ankle mobility daily (priority)","Week 3: Squat with heel elevation (board) + mobility","Week 4–5: Remove heel elevation","Week 6+: Full squat with normal heel contact"],
    },
    anterior_pelvic_tilt:{
      weak:["Gluteus Maximus","Abdominals (TA, RA)","Hamstrings"],
      tight:["Iliopsoas","Rectus Femoris","Lumbar Extensors"],
      deficit:"Both: hip flexor tightness (mobility) + glute/core weakness (stability)",
      kinetic:"Hip flexors pull ASIS forward → pelvis tilts → lumbar extends → facet loading. Classic LCS pattern.",
      root:"Lower Crossed Syndrome. Psoas overactive (NKT) + Glute max inhibited. Thomas test will confirm.",
      risk:["Lumbar facet joints","L4/L5 disc","Anterior hip labrum"],
      assess:["Thomas test","NKT Gluteus Maximus","LCS postural assessment","Prone instability test"],
      exercises:["Couch stretch (hip flexors)","TA drawing-in manoeuvre","Glute bridges (glute activation priority)","Dead bug","Hip hinge retraining (waiter's bow)"],
      progression:["Week 1–2: Hip flexor release + glute activation","Week 3–4: Bridge progression","Week 5–6: Hinge pattern (RDL)","Week 7+: Squat with pelvic neutral cue"],
    },
    trunk_lean_forward:{
      weak:["Spinal Extensors","Thoracic Extensors","Hip Extensors (Glutes)"],
      tight:["Hip Flexors","Thoracic Flexors","Ankle DF restriction (driving lean)"],
      deficit:"Mobility + stability: ankle restriction drives lean; thoracic kyphosis limits extension",
      kinetic:"Ankle DF restriction OR hip flexor tightness OR thoracic kyphosis — any of these drives trunk lean forward in squat. Must identify primary driver.",
      root:"Test: squat with heels elevated — if lean resolves, ankle is primary. Squat with arm support — if lean resolves, thoracic extension is primary.",
      risk:["Lumbar discs (shear)","Patellar tendon","Anterior hip capsule"],
      assess:["Ankle DF lunge test","Thoracic extension mobility","Thomas test","FMS Deep Squat"],
      exercises:["Address primary driver first (ankle or thoracic)","Thoracic extension: foam roller + wall angel","Goblet squat (counterweight helps trunk position)"],
      progression:["Week 1: Identify and address primary driver","Week 2: Goblet squat with cue","Week 3–4: Bodyweight squat with improvement","Week 5+: Loaded squat"],
    },
    foot_pronation:{
      weak:["Tibialis Posterior","Foot Intrinsics","Peroneus Longus"],
      tight:["Gastrocnemius","Achilles tendon","Peroneus Brevis"],
      deficit:"Stability deficit (foot) + mobility deficit (ankle) driving compensatory pronation",
      kinetic:"Foot pronates → tibial IR → knee valgus → hip IR → anterior pelvic tilt. Chain from foot to pelvis.",
      root:"Tibialis posterior inhibited (NKT) + ankle DF restriction → foot collapses medially to gain pseudo-dorsiflexion.",
      risk:["Tibialis posterior tendon","Plantar fascia","Medial ankle ligaments","Medial knee (MCL, medial meniscus)"],
      assess:["Navicular drop test","NKT Tibialis Posterior","Ankle DF lunge test","Subtalar mobility"],
      exercises:["Short foot exercise × 20 reps","Heel raise with inversion (tib post)","Ankle DF mobility","Intrinsic foot strengthening"],
      progression:["Week 1: Short foot + tib post","Week 2: Squat with arch awareness","Week 3: Single-leg stance on arch","Week 4+: Functional squat"],
    },
    limited_depth:{
      weak:["Hip Flexors (cannot eccentrically load)","Ankle DF"],
      tight:["Hip Capsule","Ankle DF restriction","Thoracic Spine"],
      deficit:"Mobility deficit primary — ankle, hip, or thoracic restriction",
      kinetic:"Ankle DF limits depth most commonly. Hip capsule restriction second. Thoracic extension third.",
      root:"Test: squat with heels elevated (↑ if ankle). Squat with hands overhead (↑ if thoracic). Assess sequentially.",
      risk:["Knee compressive load at limited range","Hip labrum if hip restriction"],
      assess:["Ankle DF lunge test","Hip IR mobility","Thoracic extension test","FMS Deep Squat"],
      exercises:["Identify the limiting joint and mobilise it","Ankle: wall lunge × 3 min daily","Hip: 90-90 stretch","Thoracic: foam roller extension + rotation"],
      progression:["Mobility work for 2 weeks first","Then add depth gradually","Box squat at achievable depth → lower box progressively"],
    },
    lumbar_flexion_comp:{
      weak:["Lumbar Multifidus","Transversus Abdominis","Hip Extensors"],
      tight:["Hamstrings","Hip Capsule"],
      deficit:"Stability deficit — lumbar flexion when hips cannot flex sufficiently",
      kinetic:"Hip mobility restriction → lumbar compensates with flexion → disc loading increases. Classic hip-lumbar compensation.",
      root:"Hip flexion mobility restriction (capsule or hamstrings) forces lumbar into flexion. TREAT HIP, not just lumbar.",
      risk:["L4/L5 and L5/S1 discs","Lumbar posterior ligaments"],
      assess:["Hip flexion ROM","Thomas test","90-90 test (hamstrings)","Prone instability test"],
      exercises:["Hip mobility first (90-90 stretch, pigeon)","Then hip hinge retraining (waiter's bow)","Core stability: TA + multifidus","Squat depth to pain-free range only"],
      progression:["Week 1–2: Hip mobility","Week 3–4: Hip hinge pattern","Week 5+: Squat with lumbar neutral cue"],
    },
  },

  // GAIT
  gait:{
    pelvic_drop:{
      weak:["Gluteus Medius","Gluteus Minimus","TFL (stabilising role)"],
      tight:["Contralateral QL","Ipsilateral adductors"],
      deficit:"Stability deficit — lateral pelvic stabilisers insufficient for single-leg stance",
      kinetic:"Glute med inhibited → QL elevates pelvis on swing side → lateral trunk lean → medial knee overload on stance side.",
      root:"Glute Med inhibition (NKT primary finding). Trendelenburg sign positive. TFL overactive as compensator.",
      risk:["Medial knee (stance side)","SIJ (asymmetric loading)","Lumbar discs (lateral shear)","IT band (swing side)"],
      assess:["Trendelenburg test","NKT Glute Med","Hip abduction firing order","Single-leg stance test"],
      exercises:["Clamshells (glute med — must be in slight extension, not flexion)","Side-lying hip abduction","Lateral band walks","Single-leg stance with level pelvis cue","Step-ups with pelvic level focus"],
      progression:["Week 1: Clamshells + TFL release","Week 2: Side-lying abduction","Week 3: Single-leg stance 30 sec","Week 4: Step-ups","Week 5+: Running with pelvic level cue"],
    },
    foot_pronation:{
      weak:["Tibialis Posterior","Intrinsic Foot Muscles"],
      tight:["Gastrocnemius/Soleus","Peroneals (overactive)"],
      deficit:"Stability deficit (foot) — medial arch fails during push-off",
      kinetic:"Foot pronates at push-off → tibia internally rotates → knee valgus → hip adduction → LBP. Per step repetition makes this highly injurious.",
      root:"Tibialis posterior inhibited (NKT). Overactive peroneals compensating. Gastrocnemius restriction reducing DF → compensatory pronation.",
      risk:["Tibialis posterior tendon (progressive rupture)","Plantar fascia","Medial knee","Shin splints (tib ant reactive)"],
      assess:["NKT Tibialis Posterior","Navicular drop","Ankle DF lunge test","Subtalar mobility"],
      exercises:["Short foot exercise integrated into walking","Heel raises with inversion","Ankle DF mobility (reduce compensatory pronation)"],
      progression:["Short foot walking practice","Barefoot training on varied surfaces","Orthotic if navicular drop >10mm","Reduce pronation before increasing gait speed/load"],
    },
    trunk_lean_lateral:{
      weak:["Contralateral Gluteus Medius","Ipsilateral QL (lateral stabiliser)"],
      tight:["Ipsilateral QL","Contralateral lateral trunk"],
      deficit:"Stability deficit — compensatory trunk lean to reduce hip abductor demand",
      kinetic:"Glute med weak → patient reduces load on hip abductor by leaning trunk over stance leg (reduces moment arm). Classic gluteus medius lurch.",
      root:"Glute Med weakness/inhibition. Patient self-protecting by reducing mechanical demand on weak muscle. This is a STRATEGY, not a structural problem.",
      risk:["Lumbar spine (repeated lateral bending)","Contralateral SI joint","Ipsilateral IT band"],
      assess:["Trendelenburg test","NKT Glute Med","Single-leg stance","Hip abduction strength MMT"],
      exercises:["Glute med activation (clamshells, sidelying abduction)","Single-leg stance with upright trunk constraint (standing near wall)","Lateral step-ups with level pelvis"],
      progression:["Week 1–2: Glute med isolation","Week 3: Single-leg with upright cue","Week 4+: Walking retraining with pelvis level"],
    },
    asymmetric_loading:{
      weak:["Ipsilateral Glute Max/Med","Core stabilisers on affected side"],
      tight:["Contralateral hip structures","Scar tissue / adhesions"],
      deficit:"Both: unilateral strength deficit + possible structural driver (pain, scar, LLD)",
      kinetic:"Asymmetric loading creates cumulative asymmetric joint stress. Over 10,000 steps/day this becomes injurious quickly.",
      root:"Identify side of reduced loading (pain avoidance, weakness, leg length discrepancy, or scar adhesion limiting that side).",
      risk:["Overloaded side: knee, hip, SIJ","Underloaded side: atrophy, bone density loss"],
      assess:["Single-leg stance each side","FMA single-leg squat","Leg length measurement","Pain provocation tests on both sides"],
      exercises:["Address the cause of asymmetry","If pain: pain management first","If weakness: strengthen deficient side","Symmetry cue during gait retraining"],
      progression:["Equal time on both feet","Mirror feedback during gait","Treadmill gait analysis if available"],
    },
    pain_avoidance:{
      weak:["Variable — dependent on pain source"],
      tight:["Variable — dependent on pain source"],
      deficit:"Pain-driven compensation — neurological protective mechanism",
      kinetic:"Pain inhibits normal motor program via pain-motor interaction (Hodges & Moseley model). The movement pattern is changed to unload the painful structure.",
      root:"Identify the pain source FIRST. Pain avoidance movement is a symptom, not a cause. Treat pain → motor pattern often self-corrects.",
      risk:["Compensated structures: risk of secondary overuse injury","Prolonged avoidance leads to cortical motor map changes (persistent movement dysfunction even after pain resolves)"],
      assess:["Identify pain source via special tests","Visual analog scale (VAS)","Pain provocation testing","Palpation of suspected structure"],
      exercises:["Pain management first (modalities, manual therapy)","Graded exposure: small doses of normal movement","Motor relearning after pain resolves"],
      progression:["Pain < 3/10 for exercise","Graded exposure to normal pattern","Full pattern once pain-free"],
    },
  },

  // SINGLE LEG STANCE
  single_leg:{
    instability:{
      weak:["Gluteus Medius","Tibialis Anterior","Peroneals","Deep Ankle Stabilisers","Core (TA, multifidus)"],
      tight:["Ankle DF restriction limiting base of support"],
      deficit:"Multi-level stability deficit — ankle, hip, and core all contributing",
      kinetic:"Ankle proprioception + glute med + core ALL required for single-leg stability. Failure in any one creates instability.",
      root:"Identify the PRIMARY level of instability: ankle (foot wobbles), knee (knee shakes), hip (pelvis drops), or trunk (trunk sways). Treat the lowest level first.",
      risk:["Ankle (repeated micro-sprains)","Knee (meniscus/ACL stress)","SIJ","Lumbar"],
      assess:["Single-leg stance with eyes open/closed (Romberg variation)","Star Excursion Balance Test (SEBT)","NKT Glute Med + Tibialis Ant","Ankle anterior drawer"],
      exercises:["Ankle: single-leg balance on foam pad","Glute med: clamshells → sidelying abduction → SLS","Core: TA activation during SLS","Progress: eyes open → eyes closed → unstable surface"],
      progression:["Week 1: SLS eyes open on floor 30 sec","Week 2: Eyes closed","Week 3: Foam pad","Week 4: Added perturbation","Week 5+: Sport-specific"],
    },
    pelvic_drop:{
      weak:["Gluteus Medius (ipsilateral)"],
      tight:["Contralateral QL — compensating for glute med weakness"],
      deficit:"Stability deficit — pure glute med failure",
      kinetic:"Glute med cannot hold pelvis level → contralateral pelvis drops → lateral trunk shift → knee valgus loading. Trendelenburg equivalent.",
      root:"Glute Med inhibited (NKT). Confirm with palpation during SLS — glute med fires late or minimally. TFL and QL compensating.",
      risk:["Medial knee","SIJ","Lumbar lateral shear","IT band"],
      assess:["Trendelenburg test","NKT Glute Med","Hip abduction firing order","MMT Glute Med"],
      exercises:["Clamshells (slight hip extension position)","Lateral band walks","SLS with pelvis level cue","Step-downs with pelvic control focus"],
      progression:["Isolation → functional → sport-specific over 6 weeks"],
    },
    knee_valgus:{
      weak:["Gluteus Medius","VMO","Hip External Rotators"],
      tight:["TFL","IT Band","Adductors"],
      deficit:"Stability deficit — multi-level valgus during high-demand single-leg task",
      kinetic:"Same as squat valgus but at higher load (full body weight single leg). ACL injury risk position.",
      root:"Glute Med + VMO both insufficient for single-leg demand. Ankle DF restriction often contributing. Highest injury risk position.",
      risk:["ACL","MCL","Medial meniscus","Patellofemoral joint (high stress)"],
      assess:["NKT Glute Med","VMO timing","Ankle DF lunge test","Patellofemoral assessment"],
      exercises:["Progress glute med and VMO BEFORE single-leg loading","SLS with band at knee (resist valgus)","Step-down with alignment mirror feedback"],
      progression:["Do NOT load until glute med ≥4/5 and VMO firing correctly"],
    },
  },

  // LUNGE
  lunge:{
    knee_valgus:{
      weak:["Gluteus Medius","VMO","Hip External Rotators"],
      tight:["TFL","IT Band","Adductors"],
      deficit:"Stability deficit — frontal plane control insufficient for split-stance load",
      kinetic:"Lunge places high demand on frontal plane stability. Glute med must eccentrically control pelvic drop AND knee alignment simultaneously.",
      root:"Glute med + VMO insufficient. Check if worse with front or back leg — identifies which side is primary weakness.",
      risk:["Medial knee structures","Patellofemoral joint","ACL risk in sport context"],
      assess:["Trendelenburg test","NKT Glute Med","VMO assessment","Ankle DF (if heel rises in lunge)"],
      exercises:["Reverse lunge (lower demand than forward lunge)","Split squat with support","Glute med focus before progressing to lunge"],
      progression:["Split squat → reverse lunge → forward lunge → walking lunge → loaded lunge"],
    },
    trunk_lean_forward:{
      weak:["Hip Extensors","Thoracic Extensors"],
      tight:["Hip Flexors (front leg)","Thoracic flexors"],
      deficit:"Mobility + stability: hip flexor tightness on back leg limits upright torso",
      kinetic:"Back hip flexor tight → pelvis tips anterior → trunk leans forward → lumbar extends. Front hip must extend from compromised position.",
      root:"Back leg hip flexor (iliopsoas) tight. Thomas test on that side positive. Release hip flexor → lunge trunk position improves.",
      risk:["Back leg: anterior hip capsule","Lumbar facets","Front leg: patellar tendon"],
      assess:["Thomas test","Hip extension ROM","NKT Psoas","FMS In-Line Lunge"],
      exercises:["Couch stretch (back leg hip flexor)","Half-kneeling hip flexor stretch","Then lunge with upright trunk cue"],
      progression:["Mobility before lunge loading","Half-kneeling → static lunge → walking lunge"],
    },
    heel_rise:{
      weak:["Tibialis Anterior (front leg)"],
      tight:["Gastrocnemius/Soleus","Posterior Ankle Capsule"],
      deficit:"Mobility deficit — ankle DF restriction on front leg",
      kinetic:"Front leg heel rises → knee shifts forward → anterior knee shear force increases → patellar tendon overloaded.",
      root:"Ankle DF restricted on lunge front foot. Same driver as in squat heel rise. TREAT ANKLE FIRST.",
      risk:["Patellar tendon","Anterior knee cartilage","Achilles tendon"],
      assess:["Ankle DF lunge test (front foot)","Passive ankle DF","Gastrocnemius tightness"],
      exercises:["Ankle mobility drill before lunge practice","Elevate heel temporarily (remove once mobility restored)"],
      progression:["Heel elevation → reduce elevation over weeks → normal lunge"],
    },
    lumbar_extension_comp:{
      weak:["Core (TA, obliques)","Glute Max (back leg)"],
      tight:["Hip Flexors","Thoracolumbar Extensors"],
      deficit:"Both: core stability insufficient for split-stance + hip flexor driving lumbar into extension",
      kinetic:"Back leg hip flexor pulls ASIS forward in lunge → lumbar extends → facet compression. Core must resist this but is insufficient.",
      root:"LCS pattern + core instability. Psoas tight + TA weak. Release psoas → activate TA → lunge position improves.",
      risk:["Lumbar facet joints (extension + compression)","L4/L5 disc"],
      assess:["Thomas test","Prone instability test","TA activation assessment","NKT Psoas"],
      exercises:["TA activation before lunge","Hip flexor stretching (back leg)","Half-kneeling lunge with posterior pelvic tilt cue"],
      progression:["Half-kneeling with pelvic neutral → static lunge → dynamic lunge"],
    },
  },

  // OVERHEAD REACH
  overhead:{
    limited_depth:{
      weak:["Shoulder External Rotators","Lower Trapezius","Serratus Anterior"],
      tight:["Pectoralis Minor","Upper Trapezius","Thoracic Spine (kyphosis)","Posterior GH Capsule","Latissimus Dorsi"],
      deficit:"Both: thoracic mobility deficit + shoulder complex mobility/stability",
      kinetic:"Thoracic kyphosis → scapula cannot upwardly rotate → GH must compensate → impingement. Or posterior capsule → GIRD → overhead limited.",
      root:"Test: if thoracic extension improves overhead reach → thoracic is primary. If not → shoulder complex (posterior capsule, lat, pec minor) is primary.",
      risk:["Supraspinatus (impingement)","Biceps long head","Anterior labrum (forced overhead)"],
      assess:["Thoracic extension test","GH IR (GIRD)","Scapular dyskinesis","Wall angel test","FMS Shoulder Mobility"],
      exercises:["Thoracic foam roller extension daily","Wall angel × 15 reps","Pec minor release","Lat stretch","Sleeper stretch (if GIRD)"],
      progression:["Thoracic mobility → scapular stability → GH mobility → integrated overhead"],
    },
    shoulder_elevation:{
      weak:["Lower Trapezius","Serratus Anterior","Rotator Cuff (IR/ER balance)"],
      tight:["Upper Trapezius","Levator Scapulae"],
      deficit:"Stability deficit — upper trap dominant, lower trap inhibited (UCS pattern)",
      kinetic:"Upper trap fires first → shoulder rises → scapula cannot upwardly rotate properly → impingement zone narrows → pain with overhead.",
      root:"UCS pattern. NKT: lower trap inhibited → upper trap overactive. Scapulohumeral rhythm disrupted — shoulder rises before arm reaches 90°.",
      risk:["Supraspinatus","Biceps long head","AC joint","Subacromial bursa"],
      assess:["Scapulohumeral rhythm assessment","NKT Lower Trapezius","NKT Serratus Anterior","Scapular dyskinesis classification"],
      exercises:["Upper trap SMR first","Prone Y-exercise (lower trap)","Serratus punch","Arm elevation pattern retraining (no shrug cue)"],
      progression:["Release → activate → retrain elevation pattern over 4–6 weeks"],
    },
    scapular_winging:{
      weak:["Serratus Anterior","Lower Trapezius"],
      tight:["Pectoralis Minor"],
      deficit:"Stability deficit — serratus anterior inhibited (UCS component)",
      kinetic:"Serratus inhibited → scapula cannot protract/upwardly rotate → medial border wings → GH abduction limited → overhead impingement.",
      root:"Pec minor overactive (NKT) → inhibits serratus anterior. Long thoracic nerve palsy must be excluded (if severe winging at rest).",
      risk:["Rotator cuff (impingement due to poor scapular position)","Anterior labrum","Long thoracic nerve"],
      assess:["Wall push-up plus (serratus test)","NKT Serratus Anterior","NKT Pec Minor","Scapular winging classification"],
      exercises:["Pec minor release (coracoid pressure 90 sec)","Serratus punch","Push-up plus progression","Wall slides with protraction cue"],
      progression:["Isolation → closed chain → open chain overhead"],
    },
    forward_head:{
      weak:["Deep Neck Flexors"],
      tight:["SCM","Scalenes","Suboccipitals","Upper Trapezius"],
      deficit:"Stability deficit — DNF inhibited, UCS pattern at cervical spine",
      kinetic:"During overhead reach, cervical spine extends if DNF insufficient → suboccipitals compress → headache. Also: forward head increases shoulder impingement (reduces subacromial space via thoracic link).",
      root:"DNF inhibited (NKT). Address before overhead loading. Every 2.5cm of forward head = +4.5kg on cervical spine at full overhead load.",
      risk:["Suboccipitals (compression)","C4/C5 disc","Supraspinatus (shoulder link)"],
      assess:["CCFT (deep neck flexor test)","NKT DNF","Cervical rotation ROM","UCS assessment"],
      exercises:["Chin tuck exercise × 20 reps daily","DNF strengthening before overhead loading","Thoracic extension to reduce forward head"],
      progression:["DNF activation → overhead with neutral neck → loaded overhead"],
    },
  },

  // FORWARD BEND
  bend:{
    lumbar_flexion_comp:{
      weak:["Gluteus Maximus","Hamstrings (hip hinge movers)","Core (TA, multifidus)"],
      tight:["Hamstrings","Hip Capsule (posterior)"],
      deficit:"Stability deficit — lumbar flexion when hips cannot flex sufficiently. Same as squat.",
      kinetic:"Hip flexion restricted (hamstrings or capsule) → lumbar must flex to get hands near floor → repeated disc loading.",
      root:"Hip hinge pattern lost. Patient bends from lumbar, not hip. Hip mobility restriction driving pattern. Waiter's bow test confirms.",
      risk:["L4/L5 and L5/S1 discs (repeated flexion)","Lumbar posterior ligaments","Sciatic nerve (neural tension)"],
      assess:["Waiter's bow test","Hip flexion ROM","SBL tension test (hamstrings fascial vs muscle)","Prone instability test"],
      exercises:["Hip hinge pattern (dowel rod on spine)","Romanian deadlift (gradual hip hinge loading)","Hamstring mobility (if fascial: SBL release. If muscular: PNF)"],
      progression:["Waiter's bow → RDL bodyweight → loaded RDL → functional bending"],
    },
    trunk_shift:{
      weak:["Contralateral QL and lateral trunk stabilisers","Contralateral Glute Med"],
      tight:["Ipsilateral QL","Ipsilateral lateral trunk (LL)"],
      deficit:"Combined: lateral line restriction + contralateral stability deficit",
      kinetic:"Trunk shifts laterally during forward bend = disc herniation protective pattern (shifts AWAY from herniation) OR lateral chain (LL) restriction (shifts TOWARD restriction).",
      root:"CRITICAL: lateral shift toward pain = lateral chain restriction (LL). Lateral shift away from pain = disc herniation (protective). Must differentiate urgently.",
      risk:["If disc: L4/L5 disc (most common lateral shift level)","If LL: lateral structures"],
      assess:["SLR and slump test (if shift away from pain)","LL lateral line assessment","Kemp's test (facet)","Lateral shift correction test"],
      exercises:["If disc: McKenzie lateral correction first → then extension","If LL: lateral line MFR → then hip hinge"],
      progression:["Correct shift first before adding load"],
    },
    pain_avoidance:{
      weak:["Variable"],
      tight:["Variable"],
      deficit:"Pain-driven compensation — most critical finding in bending assessment",
      kinetic:"Forward bending is the highest-risk movement for disc pathology. Pain avoidance during bending = likely disc, facet, or neural involvement.",
      root:"Identify structure: disc (worse flexion, centralises with extension) vs facet (worse extension, eases with flexion) vs SIJ (one-sided pain with bend).",
      risk:["The avoided structure — it is under stress even with compensation"],
      assess:["SLR + slump (disc/neural)","Kemp's (facet)","SI provocation cluster","McKenzie assessment (direction of preference)"],
      exercises:["Direction of preference first (McKenzie)","Avoid provocative direction until pain controlled"],
      progression:["Pain control → neutral spine → gradual loading"],
    },
  },
};

// Movement definitions

// ─── RULE-BASED ANALYSIS FUNCTION ────────────────────────────────────────────
function analyzeMovement(movementId, selectedCompensations) {
  if (!selectedCompensations || selectedCompensations.length === 0) return null;

  const movementRules = RULES[movementId] || {};
  const allWeak = new Set(), allTight = new Set(), allRisk = new Set();
  const allAssess = new Set(), allExercises = [], allProgression = [];
  const analyses = [];

  selectedCompensations.forEach(compId => {
    const rule = movementRules[compId];
    if (!rule) return;
    rule.weak?.forEach(m => allWeak.add(m));
    rule.tight?.forEach(m => allTight.add(m));
    rule.risk?.forEach(r => allRisk.add(r));
    rule.assess?.forEach(a => allAssess.add(a));
    if (rule.exercises) allExercises.push(...rule.exercises);
    if (rule.progression) allProgression.push(...rule.progression);
    analyses.push({ compId, ...rule });
  });

  // Determine primary deficit type
  const deficitTypes = analyses.map(a => a.deficit || "");
  const isMobility = deficitTypes.some(d => d.toLowerCase().includes("mobility"));
  const isStability = deficitTypes.some(d => d.toLowerCase().includes("stability"));
  const deficitType = isMobility && isStability ? "Both Mobility AND Stability Deficits" : isMobility ? "Primary Mobility Deficit" : isStability ? "Primary Stability Deficit" : "Mixed Pattern";

  // Find primary root cause (first highest priority)
  const primaryAnalysis = analyses[0];

  // Kinetic chain summary
  const kineticChain = analyses.map(a => a.kinetic).filter(Boolean);

  return {
    compensationCount: selectedCompensations.length,
    deficitType,
    weakStructures: [...allWeak],
    tightStructures: [...allTight],
    overloadRisk: [...allRisk],
    relatedAssessments: [...allAssess],
    analyses,
    kineticChain,
    primaryRootCause: primaryAnalysis?.root || "Assess further to determine root cause",
    exercises: [...new Set(allExercises)].slice(0, 8),
    progression: [...new Set(allProgression)].slice(0, 6),
  };
}

// ─── FMA SECTION COMPONENT ───────────────────────────────────────────────────
// ─── FMS CLINICAL DATABASE ────────────────────────────────────────────────────

const MP_CONNECTIONS_FMS=[[0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,29],[28,30],[29,31],[30,32]];

function drawSkeletonFMS(ctx,lm,w,h){
  if(!lm||!lm.length)return;
  ctx.clearRect(0,0,w,h);
  ctx.lineWidth=2.5; ctx.strokeStyle="rgba(0,229,255,0.85)";
  MP_CONNECTIONS_FMS.forEach(([a,b])=>{
    const A=lm[a],B=lm[b];
    if(!A||!B||A.visibility<0.4||B.visibility<0.4)return;
    ctx.beginPath(); ctx.moveTo(A.x*w,A.y*h); ctx.lineTo(B.x*w,B.y*h); ctx.stroke();
  });
  lm.forEach((pt,i)=>{
    if(!pt||pt.visibility<0.4)return;
    ctx.beginPath(); ctx.arc(pt.x*w,pt.y*h,i===0?5:3.5,0,Math.PI*2);
    ctx.fillStyle="#00e5ff"; ctx.fill();
  });
}

function loadScriptFMS(src){
  return new Promise((res,rej)=>{
    if(document.querySelector(`script[src="${src}"]`)){res();return;}
    const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej;
    document.head.appendChild(s);
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// SHARED PDF EXPORT UTILITY — replaces all window.print() calls
// Uses jsPDF loaded from CDN. Generates proper A4 PDFs that download
// directly without opening a print dialog.
// ═══════════════════════════════════════════════════════════════════════════

async function loadJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((res, rej) => {
    if (document.querySelector('script[data-jspdf]')) { res(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.setAttribute('data-jspdf', '1');
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

// ── Core renderer — builds A4 pages from an HTML string via iframe ────────
async function downloadPDFFromHTML(html, filename) {
  // Mobile-safe strategy: Blob URL → new tab → auto print
  // Works on iOS Safari, Android Chrome, and desktop browsers.
  // iframe approach is blocked by Safari CSP; window.open with Blob is not.
  return new Promise((resolve) => {
    try {
      // Inject auto-print script into the HTML before creating blob
      const printReady = html.replace(
        '</body>',
        `<script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
              // On mobile, print dialog close can't be detected — resolve after delay
              setTimeout(function() { try { window.close(); } catch(e){} }, 2000);
            }, 600);
          });
        <\/script></body>`
      );
      const blob = new Blob([printReady], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const tab = window.open(blobUrl, '_blank');
      if (tab) {
        // Revoke blob URL after tab has loaded
        tab.addEventListener('load', () => {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        });
        // Fallback revoke
        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        resolve();
      } else {
        // Popup blocked — offer direct download of HTML as fallback
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename.replace('.pdf', '.html');
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(blobUrl); resolve(); }, 1000);
      }
    } catch(e) {
      console.error('PDF export error:', e);
      resolve();
    }
  });
}

// ── Shared page styles ─────────────────────────────────────────────────────
const PDF_BASE_STYLES = `
  @page { size: A4; margin: 18mm 20mm; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-break { break-inside: avoid; page-break-inside: avoid; }
    .page-break { page-break-before: always; }
  }
  * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  body {
    background: #fff; color: #111827;
    font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
    font-size: 11px; line-height: 1.6; margin: 0; padding: 0;
  }
  h2 {
    font-size: 13px; font-weight: 800; color: #0369a1;
    border-left: 4px solid #0ea5e9; padding-left: 10px;
    margin: 16px 0 8px; letter-spacing: -0.2px;
  }
  h3 { font-size: 11.5px; font-weight: 700; color: #1e293b; margin: 10px 0 5px; }
  .page-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    border-bottom: 2.5px solid #0ea5e9; padding-bottom: 12px; margin-bottom: 16px;
  }
  .logo { font-size: 20px; font-weight: 900; color: #0369a1; letter-spacing: -1px; }
  .logo em { color: #0ea5e9; font-style: normal; }
  .logo-sub { font-size: 10px; color: #64748b; margin-top: 2px; }
  .meta-block { text-align: right; font-size: 10px; color: #374151; line-height: 1.7; }
  .meta-block strong { color: #111827; }
  .confid {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    background: #dcfce7; color: #15803d; font-weight: 700;
    font-size: 9px; margin-top: 4px; letter-spacing: 0.3px;
  }
  .disclaimer {
    background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;
    padding: 8px 12px; font-size: 9.5px; color: #78350f; margin-bottom: 14px;
    line-height: 1.5;
  }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .info-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 9px 12px; }
  .info-label { font-size: 8.5px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .info-value { font-size: 12px; font-weight: 700; color: #111827; }
  .section-box {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 9px;
    padding: 11px 14px; margin-bottom: 12px; white-space: pre-wrap;
    font-size: 10.5px; line-height: 1.7;
  }
  .badge {
    display: inline-block; padding: 2px 7px; border-radius: 5px;
    font-size: 9px; font-weight: 700; margin-bottom: 2px;
  }
  .badge-blue { background: #dbeafe; color: #1d4ed8; }
  .badge-green { background: #dcfce7; color: #15803d; }
  .badge-amber { background: #fef3c7; color: #92400e; }
  .badge-red { background: #fee2e2; color: #b91c1c; }
  .badge-purple { background: #ede9fe; color: #6d28d9; }
  .sig-row { margin-top: 28px; display: flex; gap: 30px; border-top: 1px solid #e2e8f0; padding-top: 14px; }
  .sig-col { flex: 1; }
  .sig-line { height: 32px; border-bottom: 1px solid #94a3b8; margin-bottom: 5px; }
  .sig-label { font-size: 8.5px; color: #64748b; }
  .page-footer {
    margin-top: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0;
    font-size: 8.5px; color: #94a3b8; text-align: center; line-height: 1.6;
  }
`;

function makePDFPage(title, metaRight, bodyHTML, footerExtra = '') {
  const now = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width">
<title>${title}</title>
<style>${PDF_BASE_STYLES}</style>
</head>
<body>
<div class="page-header">
  <div>
    <div class="logo">Physio<em>Pro</em></div>
    <div class="logo-sub">${title}</div>
  </div>
  <div class="meta-block">
    ${metaRight}
    <div><span class="confid">CONFIDENTIAL — CLINICAL RECORD</span></div>
  </div>
</div>
${bodyHTML}
<div class="page-footer">
  Generated by PhysioPro Assessment Platform &nbsp;·&nbsp; ${now} &nbsp;·&nbsp; For authorised clinical use only
  ${footerExtra}
</div>
</body>
</html>`;
}

// ─── PDF GENERATOR ────────────────────────────────────────────────────────────
async function generateFMSReportPDF(report){
  if(!window.jspdf){
    await new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload=res; s.onerror=rej; document.head.appendChild(s);
    });
  }
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,pad=15; let y=pad;

  doc.setFillColor(13,17,23); doc.rect(0,0,W,32,"F");
  doc.setTextColor(0,229,255); doc.setFontSize(15); doc.setFont("helvetica","bold");
  doc.text("FUNCTIONAL MOVEMENT SCREEN — CLINICAL REPORT",pad,16);
  doc.setTextColor(140,170,200); doc.setFontSize(8); doc.setFont("helvetica","normal");
  doc.text(`Generated: ${new Date().toLocaleString()}  |  Tests assessed: ${Object.keys(report).length}`,pad,24);
  y=40;

  Object.entries(report).forEach(([testId, testData])=>{
    const test=FMS_DB[testId];
    if(!test) return;
    if(y>250){doc.addPage();y=20;}

    // Test header
    doc.setFillColor(20,35,55); doc.rect(pad,y-6,W-pad*2,10,"F");
    doc.setTextColor(0,229,255); doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text(`${test.label}  —  Score: ${testData.score??'—'}/3`,pad+2,y);
    y+=10;

    testData.defects.forEach(defId=>{
      const def=test.defects[defId]; if(!def) return;
      if(y>255){doc.addPage();y=20;}

      doc.setTextColor(255,179,0); doc.setFont("helvetica","bold"); doc.setFontSize(9);
      doc.text(`⚠ ${def.label}`,pad+3,y); y+=6;

      doc.setTextColor(30,50,80); doc.setFontSize(8); doc.setFont("helvetica","bold");
      doc.text("Type:",pad+5,y); doc.setFont("helvetica","normal"); doc.text(def.type,pad+20,y); y+=5;

      doc.setFont("helvetica","bold"); doc.text("Clinical:",pad+5,y);
      const meaningLines=doc.splitTextToSize(def.meaning,W-pad*2-25);
      doc.setFont("helvetica","normal"); doc.text(meaningLines,pad+25,y); y+=meaningLines.length*4.5+2;

      doc.setFont("helvetica","bold"); doc.setTextColor(255,77,109); doc.text("Weak:",pad+5,y);
      doc.setFont("helvetica","normal"); doc.setTextColor(50,70,90);
      doc.text(def.weak.join(", "),pad+20,y); y+=5;

      doc.setFont("helvetica","bold"); doc.setTextColor(255,179,0); doc.text("Tight:",pad+5,y);
      doc.setFont("helvetica","normal"); doc.setTextColor(50,70,90);
      doc.text(def.tight.join(", "),pad+20,y); y+=5;

      if(y>250){doc.addPage();y=20;}
      doc.setFont("helvetica","bold"); doc.setTextColor(0,180,200); doc.text("Exercises:",pad+5,y); y+=4;
      def.exercises.forEach((ex,i)=>{
        if(y>268){doc.addPage();y=20;}
        doc.setFont("helvetica","normal"); doc.setTextColor(30,50,80); doc.setFontSize(7.5);
        doc.text(`${i+1}. ${ex}`,pad+8,y); y+=4.5;
      });
      y+=3;
      doc.setDrawColor(200,215,230); doc.line(pad,y,W-pad,y); y+=5;
    });
    y+=4;
  });

  doc.setFillColor(13,17,23); doc.rect(0,285,W,15,"F");
  doc.setTextColor(100,130,160); doc.setFont("helvetica","normal"); doc.setFontSize(7);
  doc.text("FMS Clinical Report — PostureApp. For professional use only.",W/2,292,{align:"center"});
  const fname = report?.patient?.name
    ? `FMS_Report_${report.patient.name.replace(/\s+/g,"_")}_${Date.now()}.pdf`
    : `FMS_Clinical_Report_${Date.now()}.pdf`;
  doc.save(fname);
}

// ─── AI CAMERA PANEL (Optional) ───────────────────────────────────────────────
function FMSCameraPanel({onClose}){
  const videoRef=useRef(null), canvasRef=useRef(null), streamRef=useRef(null);
  const poseRef=useRef(null), cameraRef=useRef(null);
  const [status,setStatus]=useState("loading");
  const [camFacing,setCamFacing]=useState("user");

  useEffect(()=>{
    initCam();
    return ()=>{ cleanup(); };
  },[]);

  async function initCam(){
    setStatus("loading");
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:camFacing,width:{ideal:640},height:{ideal:480}},audio:false});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      await loadScriptFMS("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
      await loadScriptFMS("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
      await loadScriptFMS("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");
      if(!window.Pose){setStatus("cam-only");return;}
      const pose=new window.Pose({locateFile:(f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`});
      pose.setOptions({modelComplexity:1,smoothLandmarks:true,enableSegmentation:false,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
      pose.onResults((results)=>{
        const canvas=canvasRef.current,video=videoRef.current;
        if(!canvas||!video)return;
        const W=canvas.width=video.videoWidth||640,H=canvas.height=video.videoHeight||480;
        if(results.poseLandmarks) drawSkeletonFMS(canvas.getContext("2d"),results.poseLandmarks,W,H);
      });
      poseRef.current=pose;
      const camera=new window.Camera(videoRef.current,{onFrame:async()=>{if(poseRef.current)await poseRef.current.send({image:videoRef.current});},width:640,height:480});
      cameraRef.current=camera; camera.start();
      setStatus("active");
    }catch(e){setStatus("error");}
  }

  function cleanup(){
    if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());}
    if(poseRef.current){try{poseRef.current.close();}catch{}}
    if(cameraRef.current){try{cameraRef.current.stop();}catch{}}
  }

  function flipCam(){cleanup();setCamFacing(f=>f==="user"?"environment":"user");setTimeout(initCam,300);}

  return(
    <div style={{background:"#f5f0fb",borderRadius:12,overflow:"hidden",marginBottom:12,position:"relative"}}>
      <div style={{position:"relative",aspectRatio:"4/3"}}>
        <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover",transform:"scaleX(-1)"}} playsInline muted autoPlay/>
        <canvas ref={canvasRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",transform:"scaleX(-1)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:8,left:8,padding:"3px 8px",borderRadius:8,background:status==="active"?"rgba(0,201,122,0.85)":status==="loading"?"rgba(255,179,0,0.85)":"rgba(255,77,109,0.85)",fontSize:"0.62rem",color:"#fff",fontWeight:700}}>
          {status==="active"?"🟢 AI Pose Active":status==="loading"?"⏳ Loading...":status==="cam-only"?"📷 Camera Only":"❌ Error"}
        </div>
        <div style={{position:"absolute",top:8,right:8,display:"flex",gap:6}}>
          <button type="button" onClick={flipCam} style={{padding:"5px 9px",background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:7,color:"#fff",fontSize:"0.7rem",cursor:"pointer"}}>🔄</button>
          <button type="button" onClick={onClose} style={{padding:"5px 9px",background:"rgba(255,77,109,0.8)",border:"none",borderRadius:7,color:"#fff",fontSize:"0.7rem",cursor:"pointer",fontWeight:700}}>✕</button>
        </div>
      </div>
      <div style={{padding:"8px 12px",background:"rgba(0,229,255,0.05)",borderTop:"1px solid rgba(0,229,255,0.15)",fontSize:"0.7rem",color:"rgba(0,229,255,0.8)"}}>
        ⚠ AI camera is assistive only — use it to observe posture. All clinical decisions remain manual.
      </div>
    </div>
  );
}

// ─── MAIN FMA SECTION ─────────────────────────────────────────────────────────
function loadFMSReport(){try{return JSON.parse(localStorage.getItem(FMS_STORAGE_KEY2)||"{}");}catch{return{};}}
function saveFMSReport(r){try{localStorage.setItem(FMS_STORAGE_KEY2,JSON.stringify(r));}catch{}}


export { SubjectiveModule, KineticChainSection };
