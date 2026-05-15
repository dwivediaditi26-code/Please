import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { C, getC } from './theme.jsx';
import { TEST_SVG, SPECIAL_TESTS_DATA } from './constants.jsx';

function SpecialTestsSection({ data, set }) {
  const [region, setRegion] = useState("shoulder");
  const [openTest, setOpenTest] = useState(null);
  const [modalTest, setModalTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const reg = SPECIAL_TESTS_DATA[region];
  const allTests = Object.values(SPECIAL_TESTS_DATA).flatMap(r => r.tests);
  const totalCount = allTests.length;
  const completedCount = allTests.filter(t => {
    const lv = data[t.id+"_left"], rv = data[t.id+"_right"], sv = data[t.id];
    return lv || rv || sv;
  }).length;

  const getTestResult = (testId) => {
    return data[testId+"_left"] || data[testId+"_right"] || data[testId] || "";
  };
  const setTestResult = (testId, side, val) => {
    if (side === "left") set(testId+"_left", val);
    else if (side === "right") set(testId+"_right", val);
    else set(testId, val);
  };

  const isPositive = (val) => val && (val.includes("Positive") || val.includes("positive") || val.includes("+ve") || val.includes("Grade") || val.includes("deficit") || val.includes("REFER") || val.includes("rupture") || val.includes("tear") || val.includes("instability") || val.includes("Severe"));

  const filteredTests = searchTerm
    ? Object.entries(SPECIAL_TESTS_DATA).flatMap(([rKey, r]) =>
        r.tests.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase()) || t.structure.toLowerCase().includes(searchTerm.toLowerCase())).map(t => ({ ...t, regionKey: rKey, regionLabel: r.label, regionColor: r.color }))
      )
    : null;

  return (
    <div>
      {/* Header stats */}
      <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:14, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ fontWeight:800, color:C.text }}>🔬 Special Tests Library — {totalCount} Tests</div>
          <span style={{ fontWeight:800, color:C.accent, fontSize:"0.85rem" }}>{completedCount}/{totalCount} completed</span>
        </div>
        <div style={{ height:5, background:C.s3, borderRadius:5, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${Math.round(completedCount/totalCount*100)}%`, background:`linear-gradient(90deg,${C.accent},${C.a2})`, borderRadius:5, transition:"width 0.3s" }} />
        </div>
      </div>

      {/* Search */}
      <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        placeholder="🔍 Search tests by name or structure..."
        style={{ width:"100%", background:C.s2, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:"0.82rem", fontFamily:"inherit", outline:"none", marginBottom:12 }} />

      {/* Region tabs */}
      {!searchTerm && (
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
          {Object.entries(SPECIAL_TESTS_DATA).map(([key, r]) => {
            const filled = r.tests.filter(t => getTestResult(t.id)).length;
            const positives = r.tests.filter(t => isPositive(getTestResult(t.id))).length;
            return (
              <button key={key} type="button" onClick={() => { setRegion(key); setOpenTest(null); }}
                style={{ padding:"6px 12px", borderRadius:20, border:`1px solid ${region===key ? r.color : filled>0 ? r.color+"50" : C.border}`, background:region===key ? `${r.color}18` : "transparent", color:region===key ? r.color : C.muted, fontSize:"0.73rem", fontWeight:region===key ? 700 : 500, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                {r.icon} {r.label}
                {positives > 0 && <span style={{ background:C.red, color:"#fff", borderRadius:10, padding:"0 5px", fontSize:"0.6rem", fontWeight:800 }}>⚠{positives}</span>}
                {filled > 0 && positives === 0 && <span style={{ background:r.color, color:"#000", borderRadius:10, padding:"0 5px", fontSize:"0.6rem", fontWeight:800 }}>{filled}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Render tests */}
      {(() => {
        const testsToRender = filteredTests || reg.tests.map(t => ({ ...t, regionColor: reg.color }));
        return testsToRender.map((t) => {
          const isOpen = openTest === t.id;
          const leftVal = data[t.id+"_left"] || "";
          const rightVal = data[t.id+"_right"] || "";
          const singleVal = data[t.id] || "";
          const anyVal = leftVal || rightVal || singleVal;
          const anyPositive = isPositive(leftVal) || isPositive(rightVal) || isPositive(singleVal);
          const color = t.regionColor || reg?.color || C.accent;
          const svgEl = TEST_SVG[t.id.replace("st_","")];

          return (
            <div key={t.id} style={{ background:C.surface, border:`1px solid ${anyPositive ? C.red+"60" : anyVal ? color+"40" : C.border}`, borderRadius:12, marginBottom:9, overflow:"hidden" }}>
              {/* Header row */}
              <div onClick={() => setOpenTest(isOpen ? null : t.id)}
                style={{ padding:"11px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderLeft:`3px solid ${anyPositive ? C.red : anyVal ? color : "#1a2d45"}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:3, flexWrap:"wrap" }}>
                    <span style={{ fontSize:"0.75rem", fontWeight:700, color:color }}>{t.label}</span>
                    {anyPositive && <span style={{ padding:"1px 7px", borderRadius:8, background:"rgba(255,77,109,0.2)", color:C.red, fontSize:"0.65rem", fontWeight:700 }}>⚠ POSITIVE</span>}
                    {anyVal && !anyPositive && <span style={{ padding:"1px 7px", borderRadius:8, background:"rgba(0,201,122,0.15)", color:C.green, fontSize:"0.65rem", fontWeight:700 }}>✓ Recorded</span>}
                  </div>
                  <div style={{ fontSize:"0.7rem", color:C.muted }}>Structure: {t.structure}</div>
                  <div style={{ fontSize:"0.68rem", color:C.muted }}>Sens: {t.sensitivity} · Spec: {t.specificity}</div>
                  {anyVal && (
                    <div style={{ marginTop:4, fontSize:"0.72rem", color:anyPositive ? C.red : C.green, fontWeight:600 }}>
                      {leftVal && `L: ${leftVal}`}{leftVal && rightVal && " | "}{rightVal && `R: ${rightVal}`}{singleVal && singleVal}
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:7, alignItems:"center", flexShrink:0, marginLeft:10 }}>
                  <button type="button" onClick={e => { e.stopPropagation(); setModalTest(t); }}
                    style={{ padding:"3px 9px", background:"rgba(127,90,240,0.15)", border:`1px solid ${C.a2}40`, borderRadius:6, color:C.a2, fontSize:"0.62rem", fontWeight:700, cursor:"pointer" }}>ℹ</button>
                  <span style={{ color:C.muted, fontSize:"0.72rem" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div style={{ padding:"0 14px 14px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:14, marginBottom:12 }}>
                    {/* SVG illustration */}
                    <div style={{ background:C.s2, borderRadius:8, padding:8, border:`1px solid ${C.border}`, width:120, flexShrink:0 }}>
                      {svgEl || (
                        <svg viewBox="0 0 120 100" width="120" height="90">
                          <text x="50%" y="40%" textAnchor="middle" fontSize="22" fill={color}>⚕</text>
                          <text x="50%" y="65%" textAnchor="middle" fontSize="9" fill={C.muted}>{t.label.split(" ")[0]}</text>
                        </svg>
                      )}
                      <div style={{ fontSize:"0.6rem", color:C.muted, textAlign:"center", marginTop:2 }}>Illustration</div>
                    </div>

                    {/* How to + sensitivity */}
                    <div>
                      <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:8, padding:10, marginBottom:8 }}>
                        <div style={{ fontSize:"0.62rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:5 }}>👐 How to Perform</div>
                        <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.7 }}>{t.how}</div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                        <div style={{ background:"rgba(0,201,122,0.08)", border:"1px solid rgba(0,201,122,0.25)", borderRadius:7, padding:"6px 9px" }}>
                          <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.green, marginBottom:2 }}>✓ NEGATIVE means</div>
                          <div style={{ fontSize:"0.72rem", color:C.text }}>{t.negative}</div>
                        </div>
                        <div style={{ background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.25)", borderRadius:7, padding:"6px 9px" }}>
                          <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.red, marginBottom:2 }}>⚠ POSITIVE means</div>
                          <div style={{ fontSize:"0.72rem", color:C.text }}>{t.positive}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Result selection — bilateral where needed */}
                  <div>
                    <div style={{ fontSize:"0.62rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>📊 Record Result</div>
                    {["cervical","shoulder","elbow_wrist","neural","ankle_foot","knee","hip"].includes(region) || t.id.includes("_l_") || t.id.includes("ultt") || t.id.includes("spurling") || t.id.includes("neer") || t.id.includes("hawkins") || t.id.includes("empty_can") || t.id.includes("full_can") || t.id.includes("lift_off") || t.id.includes("belly") || t.id.includes("bear") || t.id.includes("er_lag") || t.id.includes("hornblower") || t.id.includes("obrien") || t.id.includes("speeds") || t.id.includes("yergason") || t.id.includes("apprehension") || t.id.includes("relocation") || t.id.includes("sulcus") || t.id.includes("cozens") || t.id.includes("mills") || t.id.includes("golfers") || t.id.includes("phalen") || t.id.includes("tinel") || t.id.includes("finkelstein") || t.id.includes("watson") || t.id.includes("grind") || t.id.includes("valgus_stress") || t.id.includes("fadir") || t.id.includes("faber_test") || t.id.includes("hip_scour") || t.id.includes("trendelenburg_test") || t.id.includes("thomas_test") || t.id.includes("ober_test") || t.id.includes("piriformis") || t.id.includes("lachmans") || t.id.includes("anterior_drawer") || t.id.includes("posterior_drawer") || t.id.includes("pivot") || t.id.includes("mcmurray_test") || t.id.includes("apley") || t.id.includes("thessaly") || t.id.includes("clarkes") || t.id.includes("patellar") || t.id.includes("noble") || t.id.includes("ant_drawer_ankle") || t.id.includes("talar_tilt") || t.id.includes("thompson_test") || t.id.includes("windlass") || t.id.includes("navicular") || t.id.includes("tinel_ankle") || t.id.includes("royal_london") || t.id.includes("ultt") || t.id.includes("femoral") || t.id.includes("single_leg") ? (
                      // Bilateral
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        {["left","right"].map(side => {
                          const sideVal = data[t.id+"_"+side] || "";
                          const sidePos = isPositive(sideVal);
                          return (
                            <div key={side}>
                              <div style={{ fontSize:"0.65rem", fontWeight:700, color:sidePos ? C.red : C.muted, marginBottom:4 }}>{side.toUpperCase()} {sidePos && "⚠"}</div>
                              <select value={sideVal} onChange={e => setTestResult(t.id, side, e.target.value)}
                                style={{ width:"100%", background:C.s3, border:`1px solid ${sidePos ? C.red : C.border}`, borderRadius:7, color:C.text, padding:"7px 9px", fontSize:"0.76rem", outline:"none", fontFamily:"inherit" }}>
                                <option value="">— not tested —</option>
                                {t.options.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Single
                      <select value={singleVal} onChange={e => setTestResult(t.id, null, e.target.value)}
                        style={{ width:"100%", background:C.s3, border:`1px solid ${isPositive(singleVal) ? C.red : C.border}`, borderRadius:7, color:C.text, padding:"7px 9px", fontSize:"0.76rem", outline:"none", fontFamily:"inherit" }}>
                        <option value="">— not tested —</option>
                        {t.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        });
      })()}

      {/* MODAL */}
      {modalTest && (
        <div onClick={() => setModalTest(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.accent}40`, borderRadius:14, padding:24, maxWidth:560, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontWeight:800, color:C.accent, fontSize:"1.05rem" }}>{modalTest.label}</div>
                <div style={{ fontSize:"0.72rem", color:C.muted, marginTop:3 }}>Structure: {modalTest.structure}</div>
                <div style={{ fontSize:"0.7rem", color:C.muted }}>Sensitivity: {modalTest.sensitivity} · Specificity: {modalTest.specificity}</div>
              </div>
              <button onClick={() => setModalTest(null)} style={{ background:"none", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"3px 9px", cursor:"pointer" }}>✕</button>
            </div>

            {/* Illustration */}
            <div style={{ background:C.s2, borderRadius:10, padding:12, marginBottom:14, textAlign:"center", border:`1px solid ${C.border}` }}>
              <div style={{ display:"inline-block", maxWidth:200 }}>
                {TEST_SVG[modalTest.id.replace("st_","")] || (
                  <svg viewBox="0 0 120 100" width="180" height="140">
                    <text x="50%" y="40%" textAnchor="middle" fontSize="32" fill={C.accent}>⚕</text>
                    <text x="50%" y="65%" textAnchor="middle" fontSize="11" fill={C.muted}>Clinical Illustration</text>
                    <text x="50%" y="78%" textAnchor="middle" fontSize="10" fill={C.muted}>{modalTest.label.split(" ").slice(0,3).join(" ")}</text>
                  </svg>
                )}
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>👐 How to Perform</div>
              <div style={{ background:C.s2, borderRadius:8, padding:14, fontSize:"0.82rem", color:C.text, lineHeight:1.8 }}>{modalTest.how}</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              <div style={{ background:"rgba(0,201,122,0.08)", border:"1px solid rgba(0,201,122,0.25)", borderRadius:8, padding:10 }}>
                <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.green, textTransform:"uppercase", marginBottom:5 }}>✓ Negative</div>
                <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.6 }}>{modalTest.negative}</div>
              </div>
              <div style={{ background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.25)", borderRadius:8, padding:10 }}>
                <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.red, textTransform:"uppercase", marginBottom:5 }}>⚠ Positive</div>
                <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.6 }}>{modalTest.positive}</div>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>📊 Result Options</div>
              {modalTest.options.map((o, i) => (
                <div key={i} style={{ padding:"6px 10px", borderRadius:7, marginBottom:5, background:C.s2, border:`1px solid ${C.border}`, fontSize:"0.78rem", color:isPositive(o) ? C.red : C.text }}>
                  {isPositive(o) ? "⚠ " : "○ "}{o}
                </div>
              ))}
            </div>

            <button onClick={() => setModalTest(null)} style={{ width:"100%", padding:"9px", background:C.a2, border:"none", borderRadius:8, color:"#fff", fontWeight:700, cursor:"pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// CYRIAX COMPLETE ASSESSMENT MODULE
// Full STTT • Active/Passive ROM • End-Feel • Resisted Tests • Joint Play
// Auto Clinical Reasoning • Tissue Diagnosis • Treatment Direction
// ═══════════════════════════════════════════════════════════════════════════

// ─── CYRIAX CORE DATA ────────────────────────────────────────────────────────

const CYRIAX_STTT_INTERPRETATION = {
  "Strong & Painless": {
    color:"#00c97a", icon:"✅",
    tissue:"Normal contractile tissue",
    meaning:"No lesion in the tested contractile unit. The muscle, musculotendinous junction, and tendon are intact and healthy. Look elsewhere for the pain source.",
    nextStep:"Test passive movements (inert tissue). If passive also normal, consider referred pain or visceral source.",
    dx:"Normal — no contractile lesion at this movement",
  },
  "Strong & Painful": {
    color:"#ffb300", icon:"⚠️",
    tissue:"Minor contractile lesion",
    meaning:"The contractile unit can generate near-normal force BUT the lesion is provoked by tension. Indicates MINOR lesion: partial muscle tear, tendinopathy, tenoperiosteal lesion, or musculotendinous junction injury. The structure is intact enough to generate force.",
    nextStep:"Palpate the exact site of lesion. Deep Transverse Friction Massage (DTFM) at the exact lesion site. Eccentric loading protocol.",
    dx:"Minor lesion of contractile tissue — tendinopathy / partial tear / tenoperiosteal",
  },
  "Weak & Painless": {
    color:"#7f5af0", icon:"⚡",
    tissue:"Neurological deficit OR complete rupture",
    meaning:"Cannot generate force AND no pain. Two possible causes: (1) Complete structural rupture (tendon/muscle torn completely — cannot generate force, no tissue left to be painful), OR (2) Neurological inhibition — nerve root lesion, peripheral nerve palsy, or UMN lesion. Must differentiate urgently.",
    nextStep:"Check dermatomes, myotomes, reflexes. If neurological: refer for nerve conduction study / MRI spine. If complete rupture: refer for imaging and surgical consultation.",
    dx:"Neurological deficit OR complete structural rupture — REFER for imaging",
  },
  "Weak & Painful": {
    color:"#ff4d6d", icon:"🚨",
    tissue:"Serious lesion — refer",
    meaning:"Cannot generate force AND painful. SERIOUS FINDING. May indicate: (1) Gross lesion with bleeding, (2) Acute complete rupture with surrounding tissue inflammation, (3) Neoplasm affecting contractile unit, (4) Fracture through muscle origin/insertion, (5) Significant nerve root compression with muscle involvement.",
    nextStep:"URGENT: Do NOT load or treat. Refer for imaging immediately (X-ray, MRI). Rule out fracture, neoplasm, acute complete rupture. Consider emergency referral.",
    dx:"SERIOUS LESION — URGENT IMAGING REFERRAL REQUIRED",
  },
};

const ENDFEEL_DATA = {
  "Bone-to-Bone (Hard)": { color:"#00c97a", normal:"Elbow extension, knee extension at limits", abnormal:"Elsewhere = osteophyte, loose body, myositis ossificans", tx:"Joint mobilisation, traction if OA" },
  "Tissue Approximation (Soft)": { color:"#00c97a", normal:"Elbow/knee flexion (soft tissue meets soft tissue)", abnormal:"If very mushy and boggy = oedema/effusion", tx:"Oedema management if abnormal" },
  "Capsular/Leathery": { color:"#ffb300", normal:"Normal capsular end-feel — firm, leathery", abnormal:"Premature capsular feel = capsulitis/fibrosis/OA", tx:"Grade III–IV joint mobilisation, sustained end-range stretching, heat" },
  "Springy/Rebound": { color:"#ff8c42", normal:"No normal joints", abnormal:"Always abnormal = loose body (OA fragment), torn meniscus, articular cartilage flap", tx:"Refer orthopaedic — may need arthroscopy" },
  "Empty (No End-Feel)": { color:"#ff4d6d", normal:"No normal joints", abnormal:"ALWAYS serious — pain stops movement before mechanical limit reached. Bursitis, neoplasm, abscess, fracture, psychogenic", tx:"REFER — serious pathology. Do NOT force range." },
  "Muscle Spasm": { color:"#ff4d6d", normal:"No normal joints", abnormal:"Acute inflammation, instability (body protective), nerve root irritation", tx:"Acute: PRICE, gentle Grade I–II mobilisation. Do NOT manipulate in spasm." },
};

const CAPSULAR_PATTERNS = {
  shoulder: { name:"Shoulder (GH)", pattern:"ER most limited > Abduction > IR", dx:"GH capsulitis / adhesive capsulitis / OA / post-surgical capsular fibrosis" },
  elbow: { name:"Elbow", pattern:"Flexion > Extension (both limited)", dx:"Elbow OA / post-fracture stiffness / capsulitis" },
  wrist: { name:"Wrist (radiocarpal)", pattern:"Flexion = Extension equally limited", dx:"Wrist OA / capsulitis / post-Colles fracture" },
  hip: { name:"Hip", pattern:"IR most limited = Flexion = Abduction", dx:"Hip OA / capsulitis / avascular necrosis" },
  knee: { name:"Knee (tibiofemoral)", pattern:"Flexion >> Extension", dx:"Knee OA / capsulitis / after immobilisation" },
  ankle: { name:"Ankle (talocrural)", pattern:"Plantarflexion > Dorsiflexion", dx:"Ankle OA / post-sprain capsulitis" },
  cervical: { name:"Cervical spine", pattern:"Side-flex equally both ways = Rotation = Flex/Ext (all equally limited)", dx:"Cervical OA / spondylosis / RA" },
  lumbar: { name:"Lumbar spine", pattern:"Side-flex both directions equally, Extension > Flexion", dx:"Lumbar OA / spondylosis / disc degeneration" },
};

// ─── CYRIAX REGION DATA ───────────────────────────────────────────────────────
const CYRIAX_REGIONS_DATA = {

  cervical: {
    label:"Cervical Spine", color:"#00e5ff", icon:"🔵",
    anatomy:"C1–C7 vertebrae. Inert structures: facet joint capsules, intervertebral discs, anterior/posterior longitudinal ligaments, alar/transverse ligaments (C1–C2), supraspinous/interspinous ligaments. Contractile: deep cervical flexors, sternocleidomastoid, scalenes, semispinalis, splenius, suboccipitals, trapezius.",
    capsularPattern:"All movements equally limited (side-flex > rotation > flex/ext). May be asymmetric in facet pathology.",
    activeROM:[
      { id:"cx_a_flex", label:"Flexion", normal:"80°", how:"Patient seated. Chin moves toward chest. Normal = chin-to-chest or ~80°. Note: pain on initiation vs end range. Painful arc (mid-range pain then eases) = disc." },
      { id:"cx_a_ext", label:"Extension", normal:"70°", how:"Look toward ceiling. Normal = 70°. Pain on extension = facet, posterior disc, foraminal stenosis." },
      { id:"cx_a_sfl", label:"Side Flex Left", normal:"45°", how:"Ear toward shoulder WITHOUT shoulder elevation. Normal = 45°. Limitation ipsilateral = disc, facet, scalene." },
      { id:"cx_a_sfr", label:"Side Flex Right", normal:"45°", how:"Ear toward right shoulder. Compare bilaterally. Asymmetry = unilateral lesion." },
      { id:"cx_a_rotl", label:"Rotation Left", normal:"80°", how:"Rotate chin toward left shoulder. Normal = 80°. Test specifically at full flex (FRT) to isolate C1/C2." },
      { id:"cx_a_rotr", label:"Rotation Right", normal:"80°", how:"Rotate chin toward right shoulder. If restricted only in rotation = upper cervical (C1/C2) pathology." },
    ],
    passiveROM:[
      { id:"cx_p_flex", label:"Passive Flexion", how:"Support head with both hands. Gently flex — feel for resistance and end-feel. Overpressure at end range. Compare active vs passive range.", endfeel_options:["Normal/Capsular","Muscle Spasm","Empty (No End-Feel)","Hard (Osteophyte)"] },
      { id:"cx_p_ext", label:"Passive Extension", how:"Support occiput, gently extend head on neck. Segmental PA pressure to feel stiff levels (C2–C7).", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard (Osteophyte)","Springy/Rebound"] },
      { id:"cx_p_rot", label:"Passive Rotation (bilateral)", how:"Support head. Rotate fully each side. Note: total range, side-to-side difference, quality. Add overpressure to differentiate stiffness from pain.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard (Osteophyte)","Empty (No End-Feel)"] },
      { id:"cx_p_sfl", label:"Passive Side Flex", how:"Side-flex head gently toward shoulder. Overpressure at end range. Feel: spring (normal) vs wall (joint block) vs spasm (acute).", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard (Osteophyte)","Springy/Rebound"] },
    ],
    resistedTests:[
      { id:"cx_r_flex", label:"Resisted Flexion", muscle:"SCM + deep neck flexors", how:"Patient seated. Place palm on forehead — patient flexes against resistance. No neck movement. Test bilaterally." },
      { id:"cx_r_ext", label:"Resisted Extension", muscle:"Semispinalis / splenius / suboccipitals", how:"Palm on occiput. Patient extends against resistance. No movement." },
      { id:"cx_r_sfl", label:"Resisted Side Flex L", muscle:"L scalenes / lateral flexors", how:"Palm on temporal region. Patient side-flexes left against resistance." },
      { id:"cx_r_sfr", label:"Resisted Side Flex R", muscle:"R scalenes / lateral flexors", how:"Palm on right temporal region. Patient side-flexes right." },
      { id:"cx_r_rotl", label:"Resisted Rotation L", muscle:"R SCM / L splenius", how:"Palm on left chin/jaw. Resist left rotation." },
      { id:"cx_r_rotr", label:"Resisted Rotation R", muscle:"L SCM / R splenius", how:"Palm on right chin/jaw. Resist right rotation." },
    ],
    jointPlay:[
      { id:"cx_jp_pa", label:"PA Central Pressure (C2–C7)", how:"Patient prone. Therapist thumbs on spinous process. Apply gentle PA (posterior-anterior) pressure. Note: stiffness, pain, level of restriction. Compare adjacent levels." },
      { id:"cx_jp_unilat", label:"Unilateral PA (C2–C7 facets)", how:"Thumbs on facet pillar (1–2cm lateral to spinous process). PA pressure to assess individual facet joint. Compare bilateral asymmetry at each level." },
      { id:"cx_jp_traction", label:"Manual Cervical Traction", how:"Supine. Cup occiput and chin. Apply gentle longitudinal traction. Positive if symptoms ease (indicates neural/disc compression)." },
    ],
    redFlags:["Bilateral arm symptoms", "Lower limb symptoms with cervical movement", "Drop attacks / dizziness (VBI)", "Severe sudden onset headache", "Progressive neurological deficit", "Bladder/bowel dysfunction"],
    differentials:["Cervical disc herniation", "Cervical facet syndrome", "Cervical spondylosis / OA", "Cervicogenic headache (C1/C2)", "Muscle strain", "Atlantoaxial instability (RA)", "Whiplash associated disorder", "Cervical radiculopathy"],
  },

  shoulder: {
    label:"Shoulder Complex", color:"#7f5af0", icon:"🟣",
    anatomy:"GH joint (capsule, labrum, IGHL, SGHL, MGHL), subacromial bursa, rotator cuff (supraspinatus, infraspinatus, teres minor, subscapularis), biceps long head tendon, AC joint, CC ligaments, acromial arch.",
    capsularPattern:"ER most limited > Abduction > IR. If all limited and proportional = adhesive capsulitis (frozen shoulder).",
    activeROM:[
      { id:"sh_a_flex", label:"Flexion", normal:"180°", how:"Arm forward elevation from side to full overhead. Note: painful arc (60–120° = impingement). Full painless = normal. Compensatory trunk lean = restricted." },
      { id:"sh_a_ext", label:"Extension", normal:"60°", how:"Arm behind body. Note any pain, restriction. Less clinically significant than other planes." },
      { id:"sh_a_abd", label:"Abduction", normal:"180°", how:"Arm elevation in frontal plane. Painful arc 60–120° = subacromial impingement. Pain at top = AC joint. Full restriction = capsular pattern." },
      { id:"sh_a_add", label:"Adduction", normal:"50°", how:"Arm crosses midline horizontally. Pain = AC joint or posterior capsule tightness." },
      { id:"sh_a_er", label:"External Rotation", normal:"90°", how:"Elbow at side, 90° flexion. Rotate forearm outward. Most restricted in frozen shoulder (capsular pattern). Compare bilaterally — GIRD assessment." },
      { id:"sh_a_ir", label:"Internal Rotation", normal:"70°", how:"Elbow at side, rotate forearm inward. Also test via Apley's scratch (hand up back). IR restricted = posterior capsule (GIRD) or frozen shoulder." },
      { id:"sh_a_scaption", label:"Scaption (scapular plane)", normal:"180°", how:"Elevation in scapular plane (30° forward of frontal). Most comfortable plane — tests supraspinatus in optimal line of pull." },
    ],
    passiveROM:[
      { id:"sh_p_er", label:"Passive ER", how:"Elbow at side, 90° flex. Stabilise scapula (critical). Passively rotate forearm outward to end-feel. MOST restricted in capsular pattern. Overpressure carefully.", endfeel_options:["Normal/Capsular (firm leathery)","Muscle Spasm","Empty (No End-Feel)","Hard (Osteophyte)"] },
      { id:"sh_p_abd", label:"Passive Abduction", how:"Stabilise scapula. Passively abduct. Note: range, pain reproduction, end-feel. Painful arc in passive = inert structure (bursa, capsule). No painful arc passive = contractile (tendon).", endfeel_options:["Normal/Capsular","Muscle Spasm","Springy/Rebound","Empty (No End-Feel)"] },
      { id:"sh_p_flex", label:"Passive Flexion", how:"Passively elevate arm in sagittal plane. Stabilise scapula to isolate GH contribution. Overpressure at end range — reproduce impingement.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard (Bone-to-Bone)","Empty (No End-Feel)"] },
      { id:"sh_p_ir", label:"Passive IR", how:"At 0° abd: measure IR. At 90° abd: measure GIRD (posterior capsule). Note side-to-side difference. >18° deficit at 90° = GIRD = posterior capsule contracture.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard (Bone-to-Bone)"] },
      { id:"sh_p_horiz_add", label:"Passive Horizontal Adduction", how:"Arm at 90° flex. Cross arm across body horizontally. Pain at shoulder top = AC joint. Overpressure provokes AC joint. Also posterior GH capsule stretching.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard","Springy/Rebound"] },
    ],
    resistedTests:[
      { id:"sh_r_abd", label:"Resisted Abduction (Supraspinatus)", muscle:"Supraspinatus / middle deltoid", how:"Arm at 0–30° abduction. Apply downward resistance at distal humerus. KEY TEST — most diagnostically important shoulder resisted test." },
      { id:"sh_r_er", label:"Resisted ER (Infraspinatus)", muscle:"Infraspinatus / teres minor", how:"Elbow 90° at side. Resist external rotation. Compare bilaterally. Test at 0° and 90° abduction." },
      { id:"sh_r_ir", label:"Resisted IR (Subscapularis)", muscle:"Subscapularis", how:"Elbow 90° at side. Resist internal rotation. Also: lift-off test, belly press for subscapularis isolation." },
      { id:"sh_r_flex", label:"Resisted Flexion (Biceps / Ant Deltoid)", muscle:"Biceps LH / anterior deltoid", how:"Arm at 60° flex, elbow extended, forearm supinated. Resist forward flexion. Bicipital groove pain = biceps LH lesion." },
      { id:"sh_r_elbow_flex", label:"Resisted Elbow Flexion (Biceps LH)", muscle:"Biceps long head", how:"Elbow 90°, forearm supinated. Resist flexion. Pain at bicipital groove = biceps LH tendinopathy. Combined with Speed's test." },
      { id:"sh_r_elbow_ext", label:"Resisted Elbow Extension", muscle:"Triceps", how:"Elbow 30° flex. Resist extension. Rarely positive at shoulder — if positive = posterior shoulder involvement." },
    ],
    jointPlay:[
      { id:"sh_jp_inferior", label:"Inferior GH Glide", how:"Patient supine, arm at side. Stabilise acromion. Translate humeral head INFERIORLY. Normal = 1–2 fingers. Restricted = inferior capsule (frozen shoulder). Tests IGHL." },
      { id:"sh_jp_posterior", label:"Posterior GH Glide", how:"Patient supine. Push humeral head POSTERIORLY into glenoid. Tests posterior capsule. Restricted = internal rotation deficit (GIRD). Release = impingement treatment." },
      { id:"sh_jp_anterior", label:"Anterior GH Glide", how:"Patient sidelying or supine. Translate humeral head ANTERIORLY. Restricted = limited ER (anterior capsule). Excessive = anterior instability." },
      { id:"sh_jp_ac", label:"AC Joint Accessory Motion", how:"Stabilise clavicle. Apply PA and superior-inferior glide to acromion. Pain/restriction = AC joint pathology. Reproduce with cross-arm adduction." },
    ],
    redFlags:["Severe restriction — no active movement at all", "Bilateral shoulder restriction (think RA, polymyalgia)", "Constant pain at rest with no movement", "Axillary mass", "Rapid progression of all ROM restriction"],
    differentials:["Rotator cuff tendinopathy", "Rotator cuff tear (partial/complete)", "Adhesive capsulitis (frozen shoulder)", "Subacromial bursitis", "Biceps LH tendinopathy", "SLAP lesion", "AC joint OA / sprain", "GH instability", "Glenohumeral OA", "Calcific tendinopathy", "Cervical radiculopathy (referred)"],
  },

  elbow: {
    label:"Elbow & Forearm", color:"#ff9a9e", icon:"🩷",
    anatomy:"Radioulnar joint, humeroradial joint, humeroulnar joint. Inert: medial collateral lig (UCL), lateral collateral lig (LCL), annular ligament, capsule. Contractile: biceps, brachialis, triceps, brachioradialis, wrist extensors (ECRB/ECRL/ECU), wrist flexors (FCR/FCU), pronator teres, supinator.",
    capsularPattern:"Flexion > Extension (both limited, flexion more so). Loss of full extension = OA, post-fracture, heterotopic ossification.",
    activeROM:[
      { id:"el_a_flex", label:"Flexion", normal:"145°", how:"Bend elbow from full extension. Normal = 145°. Note pain at: initiation (posterior impingement), mid-range, end range (anterior impingement). Restriction = OA, contracture, effusion." },
      { id:"el_a_ext", label:"Extension", normal:"0°", how:"Full extension from flexion. Hyperextension normal in females (-5 to -10°). Loss of full extension = earliest sign of elbow OA or effusion (capsular pattern)." },
      { id:"el_a_pro", label:"Pronation", normal:"85°", how:"Elbow 90°, thumb up start. Rotate palm DOWN. Normal = 85°. Limited = radioulnar joint, pronator teres lesion." },
      { id:"el_a_sup", label:"Supination", normal:"90°", how:"Rotate palm UP from neutral. Normal = 90°. Limited = biceps, supinator, radioulnar joint." },
    ],
    passiveROM:[
      { id:"el_p_flex", label:"Passive Flexion", how:"Passively flex elbow to end-feel. Tissue approximation (forearm to biceps) = normal. Premature capsular end-feel = OA/capsulitis.", endfeel_options:["Tissue Approximation (normal)","Capsular/Leathery","Muscle Spasm","Springy/Rebound","Hard (Bone-to-Bone)"] },
      { id:"el_p_ext", label:"Passive Extension", how:"Passively extend to end-feel. Hard end-feel at 0° = normal (olecranon in fossa). Hard end-feel before 0° = osteophyte/loose body. Soft end-feel = effusion.", endfeel_options:["Bone-to-Bone (normal at 0°)","Springy/Rebound (loose body)","Capsular (early = OA)","Muscle Spasm","Empty (No End-Feel)"] },
      { id:"el_p_ovpres", label:"Overpressure Assessment", how:"At end of passive ROM, apply gentle overpressure. Pain with overpressure = inert structure pain positive. Note: direction and quality of resistance.", endfeel_options:["No pain with overpressure","Pain at end range with overpressure","Pain before end range","Abnormal springy rebound"] },
    ],
    resistedTests:[
      { id:"el_r_flex", label:"Resisted Elbow Flexion", muscle:"Biceps / brachialis / brachioradialis", how:"Elbow 90°, forearm supinated. Resist flexion. Pain at bicipital region = biceps. Supinated vs pronated position differentiates biceps vs brachialis." },
      { id:"el_r_ext", label:"Resisted Elbow Extension", muscle:"Triceps", how:"Elbow 30° flex. Resist extension. Pain posterior elbow = triceps lesion (insertion on olecranon). Weak = C7 radiculopathy." },
      { id:"el_r_pro", label:"Resisted Pronation", muscle:"Pronator teres / pronator quadratus", how:"Elbow 90°, neutral. Resist pronation. Pain medial elbow = medial epicondylalgia / pronator teres lesion." },
      { id:"el_r_sup", label:"Resisted Supination", muscle:"Supinator / biceps", how:"Elbow 90°, pronated. Resist supination. Pain lateral elbow = lateral epicondylalgia (supinator contribution) or biceps insertion." },
      { id:"el_r_wext", label:"Resisted Wrist Extension", muscle:"ECRB / ECRL / ECU", how:"MOST IMPORTANT ELBOW TEST. Resist wrist extension with elbow in extension AND then in flexion. Pain at lateral epicondyle = ECRB tendinopathy (tennis elbow). Fist clenched increases sensitivity." },
      { id:"el_r_wflex", label:"Resisted Wrist Flexion", muscle:"FCR / FCU / palmaris longus", how:"Resist wrist flexion. Pain at medial epicondyle = medial epicondylalgia (golfer's elbow). Test FCR vs FCU by ulnar/radial deviation addition." },
      { id:"el_r_grip", label:"Resisted Grip Strength", muscle:"Forearm flexors", how:"Patient squeezes dynamometer or therapist's fingers. Compare bilaterally. Grip strength reduced = lateral epicondylalgia (pain inhibition) or C8/T1 radiculopathy." },
    ],
    jointPlay:[
      { id:"el_jp_medial", label:"Medial Traction / Valgus Glide", how:"Elbow 20° flex. Apply valgus force (medial joint gap). Tests UCL. >5mm gap or pain = UCL sprain." },
      { id:"el_jp_lateral", label:"Lateral Traction / Varus Glide", how:"Elbow 20° flex. Apply varus force (lateral gap). Tests LCL. Less commonly injured." },
      { id:"el_jp_radial_head", label:"Radial Head Accessory Motion", how:"Elbow 90°. Palpate radial head anterolaterally. Apply PA and anterior-posterior glide to radial head. Restricted = radioulnar or radiocapitellar OA." },
    ],
    redFlags:["Severe acute elbow swelling post-trauma", "Cannot extend — suspect intra-articular fracture", "Progressive weakness of grip", "Bilateral elbow restriction (think RA, haemophilia)"],
    differentials:["Lateral epicondylalgia (ECRB tendinopathy)", "Medial epicondylalgia (FCR/FCU)", "Biceps tendinopathy/rupture", "Elbow OA", "Olecranon bursitis", "UCL sprain", "Cubital tunnel syndrome (ulnar nerve)", "Radial tunnel syndrome", "C6/C7 radiculopathy (referred)"],
  },

  wrist_hand: {
    label:"Wrist & Hand", color:"#80deea", icon:"🤚",
    anatomy:"Radiocarpal, midcarpal, CMC, MCP, PIP, DIP joints. Inert: radiocarpal ligaments, UCL/RCL, TFCC, scapholunate ligament, CMC ligaments. Contractile: wrist extensors/flexors, finger extensors/flexors, intrinsics.",
    capsularPattern:"Radiocarpal: Flex = Extension equally limited. 1st CMC: Abduction > Extension.",
    activeROM:[
      { id:"wr_a_flex", label:"Wrist Flexion", normal:"80°", how:"From neutral, flex wrist. Normal = 80°. Compare bilaterally. Restriction = radiocarpal capsulitis, post-fracture." },
      { id:"wr_a_ext", label:"Wrist Extension", normal:"70°", how:"From neutral, extend wrist. Normal = 70°. Most commonly restricted after Colles fracture." },
      { id:"wr_a_ud", label:"Ulnar Deviation", normal:"30°", how:"Deviate toward ulnar side. Normal = 30°. TFCC pain = ulnar deviation loaded." },
      { id:"wr_a_rd", label:"Radial Deviation", normal:"20°", how:"Deviate toward radial side. Normal = 20°. Pain = De Quervain's (test with Finkelstein's). Restricted = radiocarpal OA." },
      { id:"wr_a_grip", label:"Grip Strength", normal:"Bilateral symmetric", how:"Compare bilateral grip strength (dynamometer or manual test). Reduced grip = lateral epicondylalgia, carpal tunnel, C8 radiculopathy, or pain inhibition." },
    ],
    passiveROM:[
      { id:"wr_p_flex", label:"Passive Wrist Flex", how:"Passively flex wrist to end-feel. Overpressure at end range. Increased pain vs active = inert structure (capsule, ligament).", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard (Bone-to-Bone)","Springy/Rebound","Empty (No End-Feel)"] },
      { id:"wr_p_ext", label:"Passive Wrist Ext", how:"Passively extend to end-feel. Overpressure for inert pain.", endfeel_options:["Normal/Capsular","Hard (Bone-to-Bone)","Muscle Spasm","Springy/Rebound"] },
    ],
    resistedTests:[
      { id:"wr_r_ext", label:"Resisted Wrist Extension", muscle:"ECRB / ECRL / ECU", how:"Resist wrist extension from neutral. Pain lateral elbow = ECRB (lateral epicondylalgia). Pain dorsal wrist = local wrist extensor pathology." },
      { id:"wr_r_flex", label:"Resisted Wrist Flexion", muscle:"FCR / FCU", how:"Resist wrist flexion. Pain medial elbow = medial epicondylalgia. Pain ventral wrist = FCR/FCU lesion at wrist level." },
      { id:"wr_r_thumb_ext", label:"Resisted Thumb Extension", muscle:"EPL / EPB", how:"Resist thumb extension. Pain at 1st dorsal compartment = De Quervain's. Positive with Finkelstein's confirms." },
      { id:"wr_r_thumb_abd", label:"Resisted Thumb Abduction", muscle:"APL", how:"Resist thumb abduction. Pain at 1st dorsal compartment = De Quervain's (APL component)." },
      { id:"wr_r_fing_flex", label:"Resisted Finger Flexion", muscle:"FDS / FDP", how:"Resist finger flexion at DIP (FDP) and PIP (FDS). Weakness = C8 radiculopathy or tendon rupture." },
      { id:"wr_r_fing_ext", label:"Resisted Finger Extension", muscle:"EDC / EI / EDM", how:"Resist finger extension. Weakness = posterior interosseous nerve palsy (radial nerve branch)." },
    ],
    jointPlay:[
      { id:"wr_jp_radio", label:"Radiocarpal PA/AP Glide", how:"Stabilise radius. Translate carpal bones PA (toward dorsum) and AP (toward palm). Restricted = capsulitis. Hypermobile = instability. Compare bilaterally." },
      { id:"wr_jp_midcarpal", label:"Midcarpal Glide", how:"Stabilise proximal row. Translate distal row. Restricted = midcarpal OA or post-fracture. Pain = midcarpal instability." },
      { id:"wr_jp_tfcc", label:"TFCC Stress Test", how:"Stabilise radius. Apply ulnar compression through lunate toward TFCC. Pain at ulnar wrist = TFCC pathology. Confirm with passive ulnar deviation load." },
    ],
    redFlags:["Rapidly progressive hand weakness", "Bilateral hand weakness (think RA, myelopathy)", "Loss of 2-point discrimination", "Trophic changes"],
    differentials:["Carpal tunnel syndrome (median N)", "De Quervain's tenosynovitis", "TFCC tear", "Scapholunate instability", "Radiocarpal OA", "Dupuytren's contracture", "Trigger finger", "1st CMC OA", "Lateral/medial epicondylalgia (referred wrist pain)"],
  },

  lumbar: {
    label:"Lumbar Spine", color:"#ff6b35", icon:"🟠",
    anatomy:"L1–L5 vertebrae. Inert: disc (nucleus pulposus, annulus fibrosus), facet joint capsules, ALL, PLL, ligamentum flavum, interspinous/supraspinous ligaments, SIJ. Contractile: erector spinae, multifidus, QL, psoas, abdominals, gluteals (indirect).",
    capsularPattern:"Side-flex equally limited both ways, Extension > Flexion. Severe: all movements limited = OA / spondylosis.",
    activeROM:[
      { id:"lu_a_flex", label:"Flexion", normal:"90°", how:"Patient stands. Bends forward. OBSERVE: where does movement initiate — hip or lumbar? Lateral trunk shift? Normal = sequential lumbar flexion + hip flexion. Painful arc mid-range = disc. Restriction = disc, facet, or muscle. Measure with Schober test (mark L5 and 10cm above — normal = ≥5cm increase)." },
      { id:"lu_a_ext", label:"Extension", normal:"30°", how:"Extend lumbar spine. Support at ASIS. Pain = facet loading, spondylolysis, spinal stenosis. Relieves = disc herniation (posteriorly). Compare McKenzie assessment direction of preference." },
      { id:"lu_a_sfl", label:"Side Flex Left", normal:"40°", how:"Slide hand down lateral thigh. Normal = 40°. Restriction + ipsilateral pain = facet, lateral disc. Restriction + contralateral pain = disc herniation (nerve root tension)." },
      { id:"lu_a_sfr", label:"Side Flex Right", normal:"40°", how:"As above to right. Compare sides — asymmetry = unilateral lesion." },
      { id:"lu_a_rotl", label:"Rotation Left (standing)", normal:"45°", how:"Hands on hips. Rotate trunk. Limited rotation = facet, disc, thoracolumbar restriction. Assess thoracic contribution." },
      { id:"lu_a_rotr", label:"Rotation Right", normal:"45°", how:"As above to right. Asymmetric = ipsilateral facet or disc." },
    ],
    passiveROM:[
      { id:"lu_p_flex", label:"Passive Trunk Flexion", how:"Patient supine. Bring knees to chest (passive lumbar flexion). Assess end-feel. Add Slump for neural tension. Compare active vs passive.", endfeel_options:["Normal/Capsular","Muscle Spasm","Empty (No End-Feel)","Hard (Osteophyte)"] },
      { id:"lu_p_ext", label:"Passive Extension (prone press-up)", how:"Patient prone. Press up on arms (sphinx position). Allow lumbar to extend passively. McKenzie extension movement. Pain behaviour with extension = directional preference.", endfeel_options:["Normal/Capsular","Muscle Spasm","Springy/Rebound","Hard"] },
      { id:"lu_p_rotation", label:"Passive Rotation in Sidelying", how:"Sidelying, hips/knees 90°. Rotate trunk by moving top shoulder posteriorly while stabilising pelvis. Segmental rotation mobilisation. End-feel at each level.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard (Osteophyte)","Empty"] },
      { id:"lu_p_pa_spring", label:"Passive PA Pressure (Spring Test)", how:"Patient prone. Therapist thumbs on spinous process. Apply PA pressure each level L1–L5. Assess: pain, stiffness, quality of spring. Grade each level: (0) rigid, (1) stiff, (2) normal, (3) hypermobile. Note which level most painful/stiff.", endfeel_options:["Normal spring","Stiff — hypomobile","Rigid — severe restriction","Hypermobile — unstable","Painful — local segment","Painful — referred"] },
    ],
    resistedTests:[
      { id:"lu_r_flex", label:"Resisted Trunk Flexion", muscle:"Rectus abdominis / psoas", how:"Patient supine, knees bent. Resist curl-up. Pain = anterior abdominal/psoas lesion. Weakness = nerve root or serious lesion." },
      { id:"lu_r_ext", label:"Resisted Trunk Extension", muscle:"Erector spinae / multifidus", how:"Patient prone. Resist trunk extension. Pain = erector spinae / multifidus lesion. Weakness = L3–L5 radiculopathy." },
      { id:"lu_r_sfl", label:"Resisted Side Flex", muscle:"QL / lateral trunk", how:"Standing. Resist side-flex each direction. Pain ipsilateral = QL/lateral flexor lesion." },
      { id:"lu_r_hip_flex", label:"Resisted Hip Flexion", muscle:"Iliopsoas", how:"Supine, hip 90°. Resist hip flexion. Pain = iliopsoas lesion. Weakness = L2/3 radiculopathy." },
      { id:"lu_r_hip_abd", label:"Resisted Hip Abduction", muscle:"Gluteus medius / TFL", how:"Sidelying. Resist hip abduction. Weak+painful = gluteus medius lesion, trochanteric bursitis. Weak+painless = L4 radiculopathy or nerve injury." },
      { id:"lu_r_hip_ext", label:"Resisted Hip Extension", muscle:"Gluteus maximus / hamstrings", how:"Prone. Resist hip extension with knee bent (reduces hamstring) then extended (adds hamstring). Compare which more painful." },
    ],
    jointPlay:[
      { id:"lu_jp_pa", label:"PA Central Pressure (L1–L5)", how:"Prone. Thumbs on spinous process each level L1–L5. Apply firm PA pressure. Grade stiffness 0–3. Note pain quality and level. Most painful + stiffest = symptomatic level." },
      { id:"lu_jp_unilat", label:"Unilateral PA (Facet)", how:"Thumbs on mammary bodies (2cm lateral to spinous process). Apply PA pressure. Pain = ipsilateral facet pathology. Compare bilaterally. Asymmetric = unilateral facet involvement." },
      { id:"lu_jp_traction", label:"Lumbar Traction Assessment", how:"Supine. Stabilise pelvis with belt. Apply manual traction through legs. Positive if symptoms ease = neural/disc decompression response. Guides traction treatment decisions." },
    ],
    redFlags:["Bilateral leg symptoms", "Saddle anaesthesia (URGENT — cauda equina)", "Bladder/bowel dysfunction (URGENT)", "Night pain at rest", "Age <20 or >55 first episode", "Bilateral SLR positive"],
    differentials:["Lumbar disc herniation (L4/5 or L5/S1 most common)", "Lumbar facet syndrome", "Lumbar spinal stenosis", "Spondylolysis / spondylolisthesis", "Sacroiliac joint dysfunction", "Piriformis syndrome", "Lumbar muscle strain / sprain", "Lumbar OA / spondylosis", "Discogenic low back pain"],
  },

  hip: {
    label:"Hip Joint", color:"#00c97a", icon:"🟢",
    anatomy:"Ball-and-socket joint. Inert: hip capsule (iliofemoral, pubofemoral, ischiofemoral ligaments), acetabular labrum. Contractile: hip flexors (iliopsoas, rectus femoris, sartorius), extensors (gluteus maximus, hamstrings), abductors (gluteus medius/minimus, TFL), adductors, ER (piriformis, obturators, gemellus, quadratus femoris), IR (TFL, glute med anterior).",
    capsularPattern:"IR most limited = Flexion = Abduction. In advanced OA: all severely restricted.",
    activeROM:[
      { id:"hip_a_flex", label:"Flexion", normal:"120°", how:"Supine. Bring knee to chest. Normal = 120–130°. Restriction = capsulitis, OA, psoas tightness. Pain anterior = FAI, labral." },
      { id:"hip_a_ext", label:"Extension", normal:"30°", how:"Prone or standing (Thomas test reference position). Hip extension. Tight = iliopsoas. Measure with Thomas test for accurate reading." },
      { id:"hip_a_abd", label:"Abduction", normal:"45°", how:"Supine. Stabilise pelvis. Abduct leg. Normal = 45°. Restriction = adductor tightness, hip OA (capsular). Pain = IT band, greater trochanter." },
      { id:"hip_a_add", label:"Adduction", normal:"30°", how:"Leg crosses midline. Pain = adductor strain, medial groin. Restriction = LL fascial, hip capsule." },
      { id:"hip_a_er", label:"External Rotation", normal:"45°", how:"Prone, knee bent 90°. Foot falls inward (ER). Normal = 45°. Restriction = posterior capsule, piriformis tight." },
      { id:"hip_a_ir", label:"Internal Rotation", normal:"45°", how:"Prone, knee bent. Foot falls outward (IR). Normal = 45°. MOST RESTRICTED in hip OA (capsular pattern). <35° = high LBP risk (kinetic chain). Asymmetry = unilateral capsular problem." },
    ],
    passiveROM:[
      { id:"hip_p_ir", label:"Passive IR", how:"Prone, knee 90°. Passively IR hip. Assess range + end-feel + pain at end range. MOST restricted in capsular pattern.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard (Osteophyte — OA)","Empty (No End-Feel)"] },
      { id:"hip_p_flex", label:"Passive Flexion + Overpressure", how:"Supine. Passively flex hip maximally. Add overpressure. FADIR addition: adduct + IR at end flex = FAI/labral screen.", endfeel_options:["Normal/Capsular","Springy/Rebound","Hard (OA/osteophyte)","Muscle Spasm","Empty"] },
      { id:"hip_p_abd", label:"Passive Abduction", how:"Supine, stabilise pelvis. Passively abduct. Early restriction = adductor tightness or capsular pattern. Late pain = trochanteric bursitis.", endfeel_options:["Normal/Capsular (firm at end range)","Muscle Spasm","Springy/Rebound","Hard"] },
      { id:"hip_p_ext", label:"Passive Extension (Thomas)", how:"Thomas test position: contralateral hip fully flexed. Passively lower test hip into extension. Note: angle from horizontal = iliopsoas length. Knee extension = rectus femoris.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard","Springy/Rebound"] },
    ],
    resistedTests:[
      { id:"hip_r_flex", label:"Resisted Hip Flexion", muscle:"Iliopsoas (primary)", how:"Supine, hip 90°. Resist flexion. Pain anterior hip = iliopsoas lesion. Weakness = L2/3 radiculopathy. Combine with FABER for differentiation." },
      { id:"hip_r_ext", label:"Resisted Hip Extension", muscle:"Gluteus maximus / hamstrings", how:"Prone. Resist hip extension knee bent (isolates glute max) then knee extended (adds hamstrings). Observe FIRING ORDER — glute should fire first." },
      { id:"hip_r_abd", label:"Resisted Abduction", muscle:"Gluteus medius / TFL", how:"Sidelying. Resist abduction. Painful + weak = glute med lesion or trochanteric bursitis. Painless + weak = L4 root or nerve injury. Observe for TFL compensation." },
      { id:"hip_r_add", label:"Resisted Adduction", muscle:"Adductor group (longus, brevis, magnus)", how:"Supine. Resist adduction with knees straight. Pain medial groin = adductor lesion (origin at pubic ramus). Groin strain = strong painful. Complete rupture = weak painful." },
      { id:"hip_r_er", label:"Resisted ER", muscle:"Piriformis / obturators / gemellus", how:"Prone, knee 90°. Resist ER (push foot medially). Pain deep buttock = piriformis lesion. Compare bilaterally." },
      { id:"hip_r_ir", label:"Resisted IR", muscle:"TFL / anterior glute med", how:"Prone, knee 90°. Resist IR (push foot laterally). Less commonly isolated clinically. Weakness = L5 or sciatic nerve." },
    ],
    jointPlay:[
      { id:"hip_jp_long", label:"Longitudinal Traction", how:"Patient supine. Grip distal thigh. Apply sustained traction along femoral shaft toward foot. Relief of pain = intra-articular (OA, capsular). Guides traction and mobilisation treatment." },
      { id:"hip_jp_lateral", label:"Lateral Traction (Distraction)", how:"Strap around proximal thigh. Apply lateral distraction (strap pulling laterally while stabilising pelvis). Positive = intra-articular symptoms ease = hip joint compression driving symptoms." },
      { id:"hip_jp_posterior", label:"Posterior Glide of Femoral Head", how:"Supine, hip 90°. Apply PA pressure through distal femur. Posterior glide of femoral head in acetabulum. Restricted = anterior capsule. Used in Grade III–IV mobilisation for hip IR." },
    ],
    redFlags:["Severe restriction all directions (think fracture, tumour, infection)", "Night pain at rest (neoplasm)", "Avascular necrosis risk (sickle cell, prolonged steroid use)", "Limp in child — refer same day (Perthes / SUFE)"],
    differentials:["Hip OA", "FAI (femoroacetabular impingement)", "Hip labral tear", "Greater trochanteric pain syndrome (bursitis/glute tendinopathy)", "Adductor strain", "Iliopsoas tendinopathy", "Avascular necrosis", "SIJ referral to hip", "Lumbar referred pain (L2/L3)", "Meralgia paraesthetica (lateral femoral cutaneous nerve)"],
  },

  knee: {
    label:"Knee", color:"#ffb300", icon:"🟡",
    anatomy:"Tibiofemoral (medial + lateral compartments), patellofemoral, superior tibiofibular joints. Inert: ACL, PCL, MCL, LCL, menisci (medial + lateral), capsule, patellar retinaculum, fat pad, bursae. Contractile: quadriceps (VMO, VL, VM, RF), hamstrings (medial + lateral), popliteus, gastrocnemius, popliteal tendons.",
    capsularPattern:"Flexion >> Extension (significant flexion restriction with comparatively less extension loss). In severe OA = both significantly restricted.",
    activeROM:[
      { id:"kn_a_flex", label:"Flexion", normal:"140°", how:"Active flexion. Heel to buttock. Normal = 140°. Restricted = OA, effusion (capsular), quad tightness, posterior capsule. Painful arc = meniscal impingement at specific range." },
      { id:"kn_a_ext", label:"Extension", normal:"0°", how:"Full extension from flexed. Hyperextension = 5–10° in females. Loss of full extension = EARLIEST OA sign (capsular pattern), effusion, or ACL injury (pivot shift block). Extensor lag = patella tendon or quad rupture." },
      { id:"kn_a_stair", label:"Stair/Step Assessment", normal:"Pain free", how:"Patient performs step-up/step-down. Observe: knee valgus, pelvic drop, trunk lean. Stair descent more provocative than ascent for PF joint." },
      { id:"kn_a_squat", label:"Squat Assessment", normal:"Full depth, symmetric", how:"Functional ROM test. Note: depth achieved, pain location, compensations (valgus, heel rise, trunk lean). Correlates with daily function." },
    ],
    passiveROM:[
      { id:"kn_p_flex", label:"Passive Flexion", how:"Supine. Passively flex knee maximally. Tissue approximation normal end-feel. Premature capsular = OA. Springy = meniscal block.", endfeel_options:["Tissue Approximation (normal)","Capsular/Leathery (OA)","Springy/Rebound (meniscal block)","Muscle Spasm","Hard (osteophyte/loose body)","Empty (No End-Feel)"] },
      { id:"kn_p_ext", label:"Passive Extension", how:"Passively extend from flexion. Hard end-feel at 0° = normal. Hard before 0° = osteophyte. Springy before 0° = loose body/meniscal block. Capsular before 0° = OA.", endfeel_options:["Hard (normal at 0°)","Springy/Rebound (loose body — before 0°)","Capsular (OA — before 0°)","Muscle Spasm","Empty (No End-Feel)"] },
      { id:"kn_p_ir_er", label:"Tibial Rotation (at 90°)", how:"Knee at 90°. Passively rotate tibia IR and ER. Normal IR = 20–30°, ER = 30–40°. Restricted IR = biceps femoris, LCL. Restricted ER = MCL, medial capsule. Pain = meniscal.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard","Springy/Rebound"] },
      { id:"kn_p_patellar", label:"Patellar Mobility", how:"Knee extended, relaxed. Glide patella: (1) medially (restricted = tight lateral retinaculum), (2) laterally (restricted = medial retinaculum), (3) superiorly, (4) inferiorly. Tilt medial edge (lateral retinaculum tightness = cannot tilt ≥0°). Crepitus with passive movement = PFPS/chondromalacia.", endfeel_options:["Normal mobility","Lateral bias (tight lateral retinaculum)","Medial bias","Hypermobile (MPFL laxity)","Crepitus with movement"] },
    ],
    resistedTests:[
      { id:"kn_r_ext", label:"Resisted Knee Extension", muscle:"Quadriceps / patellar tendon", how:"Seated, knee 90°. Resist extension. Pain at patellar tendon = patellar tendinopathy. Pain at tibial tuberosity (adolescent) = Osgood-Schlatter. Weakness = L3/4 radiculopathy. VMO timing test: feel VMO vs VL — does VMO activate simultaneously?" },
      { id:"kn_r_flex", label:"Resisted Knee Flexion", muscle:"Hamstrings", how:"Prone, knee 90°. Resist flexion. Pain at posterior thigh = hamstring proximal origin. Pain at fibular head (lateral) = biceps femoris. Pain posterior knee = popliteal tendon." },
      { id:"kn_r_flex_ir", label:"Resisted Flexion + IR (medial hamstrings)", muscle:"Semimembranosus / semitendinosus", how:"Prone. Resist flexion + IR. Pain medial joint line = medial hamstring insertion lesion (semimembranosus). Differentiates medial vs lateral hamstring." },
      { id:"kn_r_flex_er", label:"Resisted Flexion + ER (biceps femoris)", muscle:"Biceps femoris", how:"Prone. Resist flexion + ER. Pain lateral joint line / fibular head = biceps femoris tendinopathy." },
    ],
    jointPlay:[
      { id:"kn_jp_tib_fem", label:"Tibiofemoral Distraction / AP Glide", how:"Patient supine, knee 30° flex. Traction tibia longitudinally. Then AP (anterior) glide: stabilise femur, translate tibia anteriorly (tests ACL). PA (posterior) glide: translate tibia posteriorly (tests PCL)." },
      { id:"kn_jp_medial_lat", label:"Medial/Lateral Compartment Distraction", how:"Apply valgus (opens medial) and varus (opens lateral) force at 0° and 30°. At 30° = isolates MCL/LCL. At 0° = also tests PCL/posterior capsule. Grade laxity 1–3." },
      { id:"kn_jp_superior_tib", label:"Superior Tibiofibular Joint", how:"Stabilise tibia. Translate fibular head anteriorly and posteriorly. Pain or restriction = superior tibiofibular joint pathology (can refer to lateral knee and ankle)." },
    ],
    redFlags:["Severe acute swelling post-trauma (haemarthrosis)", "Locked knee — cannot extend at all", "Posterior knee swelling + DVT risk factors", "Child/adolescent — growing pains vs tumour"],
    differentials:["Patellofemoral pain syndrome (PFPS)", "Patellar tendinopathy", "IT band friction syndrome", "Medial meniscal tear", "Lateral meniscal tear", "ACL insufficiency", "MCL sprain", "Knee OA (medial/lateral compartment)", "Infrapatellar fat pad impingement", "Prepatellar bursitis", "Popliteal cyst (Baker's cyst)", "L3/L4 radiculopathy (referred)"],
  },

  ankle_foot: {
    label:"Ankle & Foot", color:"#a8ff3e", icon:"🟢",
    anatomy:"Talocrural (ankle), subtalar (STJ), midtarsal (Chopart's), tarsometatarsal (Lisfranc's), MTP, IP joints. Inert: ATFL, CFL, PTFL (lateral), deltoid (medial), AITFL (syndesmosis), plantar fascia, spring ligament. Contractile: gastrocnemius/soleus (PF), tibialis anterior (DF), tibialis posterior (inversion), peroneals (eversion), intrinsic foot muscles.",
    capsularPattern:"Ankle (talocrural): Plantarflexion > Dorsiflexion. Subtalar: Inversion restricted. 1st MTP: Extension > Flexion (hallux rigidus).",
    activeROM:[
      { id:"ank_a_df", label:"Dorsiflexion", normal:"20°", how:"Non-weight-bearing: passive DF. Weight-bearing: lunge test (knee to wall — normal = 10cm+). Compare bilaterally. Restriction = gastroc/soleus, posterior ankle capsule, or OA." },
      { id:"ank_a_pf", label:"Plantarflexion", normal:"50°", how:"From neutral, point foot. Normal = 50°. Pain at end range = posterior impingement (dancer's heel). Restriction = anterior capsule, OA." },
      { id:"ank_a_inv", label:"Inversion", normal:"35°", how:"Combined plantar inversion (STJ motion). Normal = 35°. Restriction = anterior lateral ankle sprain sequelae, STJ OA. Test tibialis posterior strength via single-leg heel raise." },
      { id:"ank_a_ev", label:"Eversion", normal:"15°", how:"Evert foot. Normal = 15°. Restricted = deltoid ligament, medial capsule, or tibialis posterior spasm. Pain = peroneal tendinopathy (lateral)." },
      { id:"ank_a_1mtp", label:"1st MTP Extension", normal:"60–70°", how:"Extend great toe passively. Normal = 60–70° DF. Restriction = hallux rigidus (1st MTP OA) or hallux limitus. Critical for gait push-off and SBL function." },
    ],
    passiveROM:[
      { id:"ank_p_df", label:"Passive DF", how:"Compare passive vs active DF. More than active = contractile limitation (gastroc). Same = joint capsule or bony block. Test with knee bent (isolates subtalar, removes gastroc) vs extended (adds gastroc).", endfeel_options:["Capsular/Leathery (normal)","Hard (Bone-to-Bone — OA or impingement)","Muscle Spasm","Springy/Rebound","Empty (No End-Feel)"] },
      { id:"ank_p_inv", label:"Passive Inversion (STJ)", how:"Stabilise talus. Invert calcaneus. Tests ATFL and STJ motion. Compare to contralateral. Assess range AND quality of end-feel.", endfeel_options:["Normal/Capsular","Muscle Spasm","Hard","Springy/Rebound"] },
      { id:"ank_p_plantar_fascia", label:"Passive Plantar Fascia Assessment", how:"Flex toes and ankle into dorsiflexion simultaneously (windlass mechanism). Palpate plantar fascia from calcaneal origin to metatarsal heads. Note: tissue tension, tenderness, thickness (Doppler comparison).", endfeel_options:["Normal tension and mobility","Restricted — taut band","Tender — fasciopathy","Thick / nodular — fibrosis"] },
    ],
    resistedTests:[
      { id:"ank_r_df", label:"Resisted Dorsiflexion", muscle:"Tibialis anterior", how:"Resist ankle DF + inversion. Pain anterior shin = tibialis anterior tendinopathy. Weakness = L4 radiculopathy (foot drop risk)." },
      { id:"ank_r_pf", label:"Resisted Plantarflexion", muscle:"Gastrocnemius / soleus", how:"Resist PF. Also: single-leg heel raise test (25 reps = normal calf endurance). Weakness = S1/S2 radiculopathy. Pain = Achilles tendinopathy." },
      { id:"ank_r_inv", label:"Resisted Inversion (tibialis posterior)", muscle:"Tibialis posterior", how:"Resist PF + inversion (tibialis posterior specific). Pain medial ankle = tib post tendinopathy. Weakness = progressive flatfoot dysfunction." },
      { id:"ank_r_ev", label:"Resisted Eversion (peroneals)", muscle:"Peroneus longus / brevis", how:"Resist eversion. Pain lateral ankle = peroneal tendinopathy. Weakness = chronic lateral instability or common peroneal nerve injury (foot drop with inversion)." },
      { id:"ank_r_toe_ext", label:"Resisted Great Toe Extension", muscle:"Extensor hallucis longus", how:"Resist great toe extension. Weakness = L5 (most specific L5 myotome). Pain = EHL tendinopathy (anterior ankle)." },
      { id:"ank_r_heel_raise", label:"Single-Leg Heel Raise Test", muscle:"Gastroc-soleus / tibialis posterior", how:"Patient does single-leg heel raise repetitions. Normal = 25 reps, full height. Reduced height = tibialis posterior insufficiency. Reduced reps = gastroc-soleus weakness. Cannot invert during raise = tib post rupture." },
    ],
    jointPlay:[
      { id:"ank_jp_talar", label:"Talar Posterior Glide (↑ DF)", how:"Patient supine, ankle over table edge. Stabilise distal tibia. Apply posterior glide of talus in mortise. Restricted posterior glide = limited DF. Treatment glide: Grade III–IV for ankle DF restriction." },
      { id:"ank_jp_calcaneal", label:"Calcaneal Inversion/Eversion (STJ)", how:"Patient prone. Grasp calcaneus firmly. Assess inversion and eversion glide independently of talocrural. Restricted eversion = post-sprain STJ. Restricted inversion = medial capsule." },
      { id:"ank_jp_midfoot", label:"Midtarsal (Chopart's) Mobility", how:"Stabilise heel (calcaneus + talus). Translate midfoot PA and AP. Also forefoot rotation. Restricted = post-sprain stiffness, chronic midfoot OA." },
      { id:"ank_jp_1mtp", label:"1st MTP Joint Accessory Motion", how:"Stabilise 1st metatarsal. Translate proximal phalanx: PA glide (increases DF) and AP glide. Distraction. Restricted PA glide = hallux rigidus. Grade III–IV glide mobilisation = treatment for hallux limitus." },
    ],
    redFlags:["Acute severe ankle swelling post-trauma — Ottawa rules (refer for X-ray)", "Inability to weight-bear (potential fracture)", "Compartment syndrome signs (firm calf, pain on passive stretch)", "Posterior heel swelling + fever (infection)"],
    differentials:["Lateral ankle sprain (ATFL/CFL)", "Achilles tendinopathy (mid-portion vs insertional)", "Plantar fasciitis", "Tibialis posterior tendinopathy/rupture", "Peroneal tendinopathy/subluxation", "Sinus tarsi syndrome", "Tarsal tunnel syndrome", "Ankle OA", "Hallux rigidus", "Metatarsalgia", "Stress fracture (navicular, 5th metatarsal, calcaneus)"],
  },
};

// ─── CYRIAX CLINICAL REASONING ENGINE ────────────────────────────────────────
function cyriaxAutoReason(regionId, data) {
  const reg = CYRIAX_REGIONS_DATA[regionId];
  if (!reg) return null;

  const v = (id) => data[`cyriax_${regionId}_${id}`] || "";
  const findings = [];
  const diagnoses = [];
  const treatment = [];
  let tissueType = "";
  let confidence = "Low";

  // Check resisted tests for tissue type
  const resistedResults = reg.resistedTests.map(t => ({ id: t.id, result: v(`res_${t.id}`), label: t.label, muscle: t.muscle }));
  const strongPainful = resistedResults.filter(r => r.result === "Strong & Painful");
  const weakPainless = resistedResults.filter(r => r.result === "Weak & Painless");
  const weakPainful = resistedResults.filter(r => r.result === "Weak & Painful");
  const strongPainless = resistedResults.filter(r => r.result === "Strong & Painless");

  // Passive ROM / end-feel
  const passiveEndfeels = reg.passiveROM.map(t => ({ id: t.id, ef: v(`pass_ef_${t.id}`), label: t.label }));
  const abnormalEndfeels = passiveEndfeels.filter(e => e.ef && !["Normal/Capsular","Tissue Approximation (normal)","Hard (normal at 0°)","Bone-to-Bone (normal at 0°)"].some(n => e.ef.startsWith(n)));

  // Active ROM
  const activeROMs = reg.activeROM.map(t => ({ id: t.id, pain: v(`act_pain_${t.id}`), limited: v(`act_limited_${t.id}`), label: t.label }));
  const painfulMovements = activeROMs.filter(r => r.pain && r.pain.includes("Pain"));
  const limitedMovements = activeROMs.filter(r => r.limited && r.limited !== "Full" && r.limited !== "Normal");

  // Capsular pattern detection
  const capsPattern = v("capsular_pattern");
  const hasCapsular = capsPattern === "Yes — capsular pattern confirmed";

  // TISSUE TYPE DETERMINATION
  if (weakPainful.length > 0) {
    tissueType = "⚠️ SERIOUS CONTRACTILE LESION";
    confidence = "High";
    findings.push(`🚨 SERIOUS: ${weakPainful.map(r => r.label).join(", ")} — Weak & Painful`);
    diagnoses.push({ name:"Serious Contractile Lesion", confidence:"High", detail:"Weak + painful = serious: complete rupture + surrounding tissue damage, fracture through insertion, or neoplasm. URGENT imaging required." });
    treatment.push("URGENT: Do NOT load or treat. Refer for imaging (X-ray + MRI) immediately.", "Rule out fracture, complete rupture, neoplasm.", "Surgical consultation if rupture confirmed.");
  } else if (weakPainless.length > 0) {
    tissueType = "⚡ NEUROLOGICAL DEFICIT OR COMPLETE RUPTURE";
    confidence = "High";
    findings.push(`⚡ Neurological finding: ${weakPainless.map(r => `${r.label} (${r.muscle})`).join(", ")} — Weak & Painless`);
    diagnoses.push({ name:"Neurological Deficit or Complete Structural Rupture", confidence:"High", detail:"Weak + painless = nerve root lesion (check dermatomes + reflexes) OR complete rupture (no structure left to be painful)." });
    treatment.push("Neurological assessment: dermatomes, myotomes, reflexes.", "If neurological: nerve conduction study, MRI spine.", "If complete rupture: refer orthopaedic.");
  } else if (strongPainful.length > 0 && abnormalEndfeels.length === 0) {
    tissueType = "🎯 CONTRACTILE TISSUE LESION";
    confidence = "High";
    findings.push(`Minor contractile lesion: ${strongPainful.map(r => `${r.label} (${r.muscle})`).join(", ")}`);
    strongPainful.forEach(r => {
      diagnoses.push({ name:`${r.muscle} — Tendinopathy / Partial Tear`, confidence:"High", detail:`Strong & Painful on ${r.label}. Contractile unit generates force but lesion provoked. Minor lesion at muscle, MTJ, tendon, or tenoperiosteal junction.` });
      treatment.push(`Deep Transverse Friction Massage (DTFM) to exact palpated lesion site — ${r.muscle}`, `Eccentric loading protocol for ${r.muscle}`, "Load management — avoid aggravating movements initially");
    });
  } else if (hasCapsular || (abnormalEndfeels.length > 0 && strongPainful.length === 0 && weakPainless.length === 0)) {
    tissueType = "🔒 INERT TISSUE LESION";
    confidence = "High";
    if (hasCapsular) {
      findings.push(`Capsular pattern confirmed for ${reg.name || regionId}`);
      const cp = CAPSULAR_PATTERNS[regionId];
      if (cp) diagnoses.push({ name:`Capsulitis / ${cp.dx}`, confidence:"High", detail:`Capsular pattern: ${cp.pattern}. Inert tissue (capsule) involved. Consider: ${cp.dx}.` });
      treatment.push("Grade III–IV joint mobilisation (address capsular restriction)", "Sustained end-range stretching", "Heat before mobilisation, ice after", "Progressive ROM restoration");
    }
    abnormalEndfeels.forEach(e => {
      findings.push(`Abnormal end-feel at ${e.label}: ${e.ef}`);
      const efData = ENDFEEL_DATA[e.ef];
      if (efData) {
        diagnoses.push({ name:`${e.ef} end-feel at ${e.label}`, confidence:"Moderate", detail:efData.abnormal });
        treatment.push(efData.tx);
      }
    });
  } else if (strongPainless.length === resistedResults.filter(r => r.result).length && resistedResults.filter(r => r.result).length > 0) {
    tissueType = "✅ ALL CONTRACTILE TESTS NORMAL";
    confidence = "Moderate";
    findings.push("All resisted tests strong and painless — contractile tissue normal");
    diagnoses.push({ name:"Inert Tissue Pathology (all contractile normal)", confidence:"Moderate", detail:"Pain is not arising from contractile tissue. Inert structures (capsule, ligament, bursa, disc) are the source. Focus passive assessment." });
    treatment.push("Focus on passive assessment and joint play", "Inert tissue treatment: mobilisation, manipulation, support");
  }

  // Painful arc detection
  const painArc = v("painful_arc");
  if (painArc && painArc !== "None") {
    findings.push(`Painful arc: ${painArc}`);
    if (painArc.includes("Impingement")) diagnoses.push({ name:"Subacromial Impingement (painful arc)", confidence:"Moderate", detail:"Pain 60–120° = subacromial arc = supraspinatus or bursa impingement." });
  }

  // Related assessment suggestions
  const nextTests = [];
  if (tissueType.includes("CONTRACTILE")) {
    nextTests.push("Palpate exact lesion site (deep transverse friction point)", "Ultrasound imaging to confirm partial vs complete lesion", "Neural tension tests if referred symptoms");
  }
  if (tissueType.includes("INERT") || hasCapsular) {
    nextTests.push("X-ray (OA staging)", "Joint play assessment (grade mobility)", "Arthroscopy referral if springy end-feel (loose body)", "MRI if empty end-feel (serious pathology)");
  }
  if (tissueType.includes("NEUROLOGICAL")) {
    nextTests.push("Full neurological exam (dermatomes, myotomes, reflexes)", "MRI spine", "Nerve conduction study + EMG", "Neurosurgeon referral if progressive");
  }

  return { findings, diagnoses: diagnoses.slice(0, 5), treatment: [...new Set(treatment)].slice(0, 8), tissueType, confidence, nextTests, differentials: reg.differentials };
}

// ─── CYRIAX MODULE COMPONENT ─────────────────────────────────────────────────

export { SpecialTestsSection };
