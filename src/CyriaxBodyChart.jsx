import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { C, getC } from './theme.jsx';

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
function CyriaxModule({ data, set }) {
  const [region, setRegion] = useState("shoulder");
  const [tab, setTab] = useState("active");
  const [reasoning, setReasoning] = useState(null);
  const [showRed, setShowRed] = useState(false);

  const reg = CYRIAX_REGIONS_DATA[region];
  const prefix = `cyriax_${region}_`;
  const v = (id) => data[prefix + id] || "";
  const sv = (id, val) => set(prefix + id, val);

  const selectStyle = { width:"100%", background:"#192435", border:`1px solid #1a2d45`, borderRadius:8, color:"#1a1025", padding:"7px 10px", fontSize:"0.78rem", outline:"none", fontFamily:"inherit" };
  const labelStyle = { fontSize:"0.72rem", fontWeight:700, color:"#7e6a9a", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" };
  const boxStyle = { background:"#ffffff", border:`1px solid #1a2d45`, borderRadius:10, padding:13, marginBottom:10 };
  const RESULT_OPTIONS = ["","Strong & Painless","Strong & Painful","Weak & Painless","Weak & Painful"];
  const PAIN_OPTIONS = ["","No pain","Pain on initiation","Pain at mid-range","Pain at end range","Painful arc","Pain throughout range","Referred pain with movement"];
  const LIMITED_OPTIONS = ["","Full range","Mildly limited","Moderately limited","Severely limited","Cannot perform"];

  const resColor = (val) => {
    if (!val) return "#1a2d45";
    const c = CYRIAX_STTT_INTERPRETATION[val];
    return c ? c.color : "#1a2d45";
  };

  const runReasoning = () => setReasoning(cyriaxAutoReason(region, data));

  const tabStyle = (t) => ({ padding:"8px 16px", cursor:"pointer", fontSize:"0.8rem", fontWeight:tab===t?700:500, color:tab===t?C.accent:C.muted, background:"none", border:"none", borderBottom:`2px solid ${tab===t?C.accent:"transparent"}` });

  return (
    <div>
      {/* Region selector */}
      <div style={{ background:`${reg.color}08`, border:`1px solid ${reg.color}25`, borderRadius:12, padding:14, marginBottom:14 }}>
        <div style={{ fontWeight:800, color:reg.color, fontSize:"0.95rem", marginBottom:10 }}>⚕ Cyriax STTT — Region-Specific Assessment</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {Object.entries(CYRIAX_REGIONS_DATA).map(([key, r]) => {
            const hasData = Object.keys(data).some(k => k.startsWith(`cyriax_${key}_`) && data[k]);
            return (
              <button key={key} type="button" onClick={() => { setRegion(key); setTab("active"); setReasoning(null); }}
                style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${region===key?r.color:hasData?r.color+"50":C.border}`, background:region===key?`${r.color}18`:"transparent", color:region===key?r.color:hasData?r.color:C.muted, fontSize:"0.75rem", fontWeight:region===key?700:500, cursor:"pointer" }}>
                {r.icon} {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Anatomy banner */}
      <div style={{ ...boxStyle, borderColor:reg.color+"30" }}>
        <div style={{ fontSize:"0.65rem", fontWeight:700, color:reg.color, textTransform:"uppercase", letterSpacing:"1px", marginBottom:5 }}>📚 Regional Anatomy</div>
        <div style={{ fontSize:"0.76rem", color:C.muted, lineHeight:1.7 }}>{reg.anatomy}</div>
        <div style={{ marginTop:8, padding:"6px 10px", background:`${reg.color}10`, borderRadius:7, fontSize:"0.74rem", color:C.text }}>
          <strong style={{ color:reg.color }}>Capsular Pattern: </strong>{reg.capsularPattern}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, marginBottom:16 }}>
        {[["active","Active ROM"],["passive","Passive ROM"],["resisted","Resisted Tests"],["joint_play","Joint Play"],["reason","🧠 Reasoning"]].map(([t,l]) => (
          <button key={t} type="button" onClick={()=>setTab(t)} style={tabStyle(t)}>{l}</button>
        ))}
      </div>

      {/* ── ACTIVE ROM TAB ── */}
      {tab === "active" && (
        <div>
          <div style={{ ...boxStyle, borderColor:"rgba(0,229,255,0.2)" }}>
            <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>Active Range of Motion — All Directions</div>

            {/* Painful arc */}
            <div style={{ marginBottom:12 }}>
              <div style={labelStyle}>Painful Arc</div>
              <select value={v("painful_arc")} onChange={e=>sv("painful_arc",e.target.value)} style={selectStyle}>
                <option value="">— select —</option>
                {["None","Impingement arc (60–120°) — supraspinatus/bursa","Full range painful — capsular","Mid-range pain eases — disc","End range only — capsule/facet","Pain increases progressively — inflammatory","Painful on return (latent pain)"].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {reg.activeROM.map(t => (
              <div key={t.id} style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:9, padding:12, marginBottom:9 }}>
                <div style={{ fontWeight:700, color:C.text, marginBottom:6, fontSize:"0.82rem" }}>{t.label} <span style={{ color:C.muted, fontWeight:400, fontSize:"0.72rem" }}>Normal: {t.normal}</span></div>
                <div style={{ background:C.s3, borderRadius:7, padding:9, marginBottom:8, fontSize:"0.74rem", color:C.muted, lineHeight:1.6 }}>
                  <strong style={{ color:C.yellow }}>How: </strong>{t.how}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                  <div>
                    <div style={labelStyle}>ROM Value</div>
                    <input type="text" value={v(`act_rom_${t.id}`)} onChange={e=>sv(`act_rom_${t.id}`,e.target.value)} placeholder={`e.g. ${t.normal}`} style={selectStyle}/>
                  </div>
                  <div>
                    <div style={labelStyle}>Pain</div>
                    <select value={v(`act_pain_${t.id}`)} onChange={e=>sv(`act_pain_${t.id}`,e.target.value)} style={{...selectStyle, borderColor:v(`act_pain_${t.id}`)?.includes("Pain")?"#ff4d6d":"#1a2d45"}}>
                      {PAIN_OPTIONS.map(o=><option key={o} value={o}>{o||"— pain? —"}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={labelStyle}>Range</div>
                    <select value={v(`act_limited_${t.id}`)} onChange={e=>sv(`act_limited_${t.id}`,e.target.value)} style={{...selectStyle, borderColor:v(`act_limited_${t.id}`)&&v(`act_limited_${t.id}`)!=="Full"?"#ffb300":"#1a2d45"}}>
                      {LIMITED_OPTIONS.map(o=><option key={o} value={o}>{o||"— range? —"}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop:6 }}>
                  <div style={labelStyle}>Compensation / Quality Notes</div>
                  <input type="text" value={v(`act_comp_${t.id}`)} onChange={e=>sv(`act_comp_${t.id}`,e.target.value)} placeholder="e.g. trunk lean, painful arc 60–120°, shoulder shrug..." style={selectStyle}/>
                </div>
              </div>
            ))}

            {/* Active vs Passive comparison */}
            <div style={{ marginTop:10 }}>
              <div style={labelStyle}>Active vs Passive Comparison (Cyriax Key Rule)</div>
              <select value={v("act_pass_comparison")} onChange={e=>sv("act_pass_comparison",e.target.value)} style={selectStyle}>
                <option value="">— select —</option>
                {["Passive ROM greater than active — inert or contractile lesion (both possible)","Passive ROM same as active — capsular/inert lesion (contractile not involved)","Passive ROM less than active — muscular/contractile over-activity","Active more restricted than passive — contractile inhibition or pain avoidance","Both equally restricted — capsular pattern"].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── PASSIVE ROM TAB ── */}
      {tab === "passive" && (
        <div>
          <div style={{ ...boxStyle, borderColor:"rgba(127,90,240,0.3)" }}>
            <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.a2, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>Passive ROM — Inert Tissue Testing</div>

            {/* Capsular pattern */}
            <div style={{ background:"rgba(127,90,240,0.08)", border:`1px solid ${C.a2}40`, borderRadius:9, padding:12, marginBottom:12 }}>
              <div style={labelStyle}>Capsular Pattern Assessment</div>
              <select value={v("capsular_pattern")} onChange={e=>sv("capsular_pattern",e.target.value)} style={{...selectStyle, borderColor:v("capsular_pattern")?.includes("Yes")?"#7f5af0":"#1a2d45"}}>
                <option value="">— assess capsular pattern —</option>
                <option value="Yes — capsular pattern confirmed">Yes — capsular pattern confirmed</option>
                <option value="Non-capsular — specific direction limited">Non-capsular — specific direction limited</option>
                <option value="No restriction — all passive full">No restriction — all passive full</option>
                <option value="Partial capsular — not all directions limited">Partial capsular pattern — not all directions</option>
              </select>
              {CAPSULAR_PATTERNS[region] && (
                <div style={{ marginTop:8, padding:"6px 9px", background:C.s3, borderRadius:6, fontSize:"0.72rem", color:C.text }}>
                  <strong style={{ color:C.a2 }}>Expected pattern: </strong>{CAPSULAR_PATTERNS[region].pattern}
                  <br/><strong style={{ color:C.a2 }}>Suggests: </strong>{CAPSULAR_PATTERNS[region].dx}
                </div>
              )}
            </div>

            {reg.passiveROM.map(t => (
              <div key={t.id} style={{ ...boxStyle }}>
                <div style={{ fontWeight:700, color:C.text, marginBottom:6, fontSize:"0.82rem" }}>{t.label}</div>
                <div style={{ background:C.s3, borderRadius:7, padding:9, marginBottom:8, fontSize:"0.74rem", color:C.muted, lineHeight:1.6 }}>
                  <strong style={{ color:C.yellow }}>Method: </strong>{t.how}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:7 }}>
                  <div>
                    <div style={labelStyle}>ROM (degrees or cm)</div>
                    <input type="text" value={v(`pass_rom_${t.id}`)} onChange={e=>sv(`pass_rom_${t.id}`,e.target.value)} placeholder="e.g. 90° or less than active" style={selectStyle}/>
                  </div>
                  <div>
                    <div style={labelStyle}>Pain at End Range</div>
                    <select value={v(`pass_pain_${t.id}`)} onChange={e=>sv(`pass_pain_${t.id}`,e.target.value)} style={{...selectStyle, borderColor:v(`pass_pain_${t.id}`)?.includes("Pain")?"#ff4d6d":"#1a2d45"}}>
                      {["","No pain at end range","Pain at end range — same as active","Pain at end range — more than active (inert lesion)","Pain before end range","Referred pain with passive movement"].map(o=><option key={o} value={o}>{o||"— end range pain? —"}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:7 }}>
                  <div style={labelStyle}>End-Feel</div>
                  <select value={v(`pass_ef_${t.id}`)} onChange={e=>sv(`pass_ef_${t.id}`,e.target.value)}
                    style={{...selectStyle, borderColor:v(`pass_ef_${t.id}`)&&!["Normal/Capsular","Tissue Approximation (normal)","Hard (normal at 0°)","Bone-to-Bone (normal at 0°)"].some(n=>v(`pass_ef_${t.id}`).startsWith(n))?"#ffb300":"#1a2d45"}}>
                    <option value="">— select end-feel —</option>
                    {(t.endfeel_options||Object.keys(ENDFEEL_DATA)).map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                  {v(`pass_ef_${t.id}`) && ENDFEEL_DATA[v(`pass_ef_${t.id}`)] && (
                    <div style={{ marginTop:6, padding:"6px 9px", background:C.s3, borderRadius:6, fontSize:"0.72rem", color:C.text, lineHeight:1.5 }}>
                      <strong style={{ color:ENDFEEL_DATA[v(`pass_ef_${t.id}`)].color }}>Clinical significance: </strong>
                      {ENDFEEL_DATA[v(`pass_ef_${t.id}`)].abnormal}
                      <br/><strong style={{ color:C.a3 }}>Treatment: </strong>{ENDFEEL_DATA[v(`pass_ef_${t.id}`)].tx}
                    </div>
                  )}
                </div>
                <div>
                  <div style={labelStyle}>Overpressure Response</div>
                  <select value={v(`pass_ovp_${t.id}`)} onChange={e=>sv(`pass_ovp_${t.id}`,e.target.value)} style={selectStyle}>
                    {["","No pain with overpressure","Mild pain with overpressure","Significant pain with overpressure","Pain before overpressure applied","Reproduction of patient's symptoms"].map(o=><option key={o} value={o}>{o||"— overpressure —"}</option>)}
                  </select>
                </div>
              </div>
            ))}

            {/* Active vs Passive summary */}
            <div style={{ background:"rgba(0,229,255,0.06)", border:`1px solid ${C.accent}25`, borderRadius:9, padding:12 }}>
              <div style={labelStyle}>Cyriax A vs P Summary</div>
              <div style={{ fontSize:"0.74rem", color:C.muted, marginBottom:6 }}>Key rule: if passive ROM is GREATER than active, the contractile unit is restricting (not the joint). If passive = active, joint/inert structure.</div>
              <textarea value={v("passive_summary")} onChange={e=>sv("passive_summary",e.target.value)}
                placeholder="Summarise passive findings and active vs passive comparison..."
                style={{ ...selectStyle, minHeight:60, resize:"vertical", display:"block" }}/>
            </div>
          </div>
        </div>
      )}

      {/* ── RESISTED TESTS TAB ── */}
      {tab === "resisted" && (
        <div>
          {/* STTT Key */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            {Object.entries(CYRIAX_STTT_INTERPRETATION).map(([key, val]) => (
              <div key={key} style={{ background:`${val.color}10`, border:`1px solid ${val.color}40`, borderRadius:9, padding:"8px 11px" }}>
                <div style={{ fontWeight:700, color:val.color, fontSize:"0.74rem", marginBottom:3 }}>{val.icon} {key}</div>
                <div style={{ fontSize:"0.68rem", color:C.text, lineHeight:1.5 }}>{val.tissue}</div>
              </div>
            ))}
          </div>

          <div style={boxStyle}>
            <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.a4, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>Selective Tissue Tension — Resisted Isometric Tests</div>

            {reg.resistedTests.map(t => {
              const res = v(`res_${t.id}`);
              const interp = CYRIAX_STTT_INTERPRETATION[res];
              return (
                <div key={t.id} style={{ background:res?`${resColor(res)}10`:C.s2, border:`1px solid ${res?resColor(res)+"50":C.border}`, borderRadius:9, padding:12, marginBottom:9 }}>
                  <div style={{ fontWeight:700, color:C.text, marginBottom:3, fontSize:"0.82rem" }}>{t.label}</div>
                  <div style={{ fontSize:"0.7rem", color:C.muted, marginBottom:6 }}>🎯 Muscle tested: {t.muscle}</div>
                  <div style={{ background:C.s3, borderRadius:7, padding:8, marginBottom:8, fontSize:"0.74rem", color:C.muted, lineHeight:1.6 }}>
                    <strong style={{ color:C.yellow }}>How: </strong>{t.how}
                  </div>
                  <select value={res} onChange={e=>sv(`res_${t.id}`,e.target.value)} style={{...selectStyle, borderColor:resColor(res), fontWeight:res?700:400}}>
                    {RESULT_OPTIONS.map(o=><option key={o} value={o}>{o||"— select result —"}</option>)}
                  </select>
                  {interp && (
                    <div style={{ marginTop:8, padding:"8px 10px", background:`${interp.color}12`, border:`1px solid ${interp.color}40`, borderRadius:7 }}>
                      <div style={{ fontWeight:700, color:interp.color, fontSize:"0.74rem", marginBottom:3 }}>{interp.icon} {interp.tissue}</div>
                      <div style={{ fontSize:"0.72rem", color:C.text, lineHeight:1.6, marginBottom:4 }}>{interp.meaning}</div>
                      <div style={{ fontSize:"0.7rem", color:C.a3 }}><strong>Next step: </strong>{interp.nextStep}</div>
                    </div>
                  )}
                  <div style={{ marginTop:6 }}>
                    <input type="text" value={v(`res_notes_${t.id}`)} onChange={e=>sv(`res_notes_${t.id}`,e.target.value)} placeholder="Additional notes (e.g. painful at specific range, bilateral comparison)..." style={selectStyle}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── JOINT PLAY TAB ── */}
      {tab === "joint_play" && (
        <div>
          <div style={boxStyle}>
            <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.a3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>Joint Play / Accessory Motion Assessment</div>
            <div style={{ background:"rgba(0,201,122,0.06)", border:`1px solid ${C.a3}30`, borderRadius:8, padding:10, marginBottom:12, fontSize:"0.76rem", color:C.text, lineHeight:1.7 }}>
              Joint play tests assess the ACCESSORY MOVEMENTS that accompany physiological motion. Restriction in joint play → restriction in full ROM. Grade using Maitland (I–IV) or Kaltenborn (0–6). Hypomobile = mobilise. Hypermobile = stabilise.
            </div>

            {reg.jointPlay.map(t => (
              <div key={t.id} style={boxStyle}>
                <div style={{ fontWeight:700, color:C.text, marginBottom:5, fontSize:"0.82rem" }}>{t.label}</div>
                <div style={{ background:C.s3, borderRadius:7, padding:9, marginBottom:8, fontSize:"0.74rem", color:C.muted, lineHeight:1.6 }}>
                  <strong style={{ color:C.yellow }}>Method: </strong>{t.how}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div>
                    <div style={labelStyle}>Mobility Grade</div>
                    <select value={v(`jp_grade_${t.id}`)} onChange={e=>sv(`jp_grade_${t.id}`,e.target.value)} style={selectStyle}>
                      {["","0 — Ankylosed (no motion)","1 — Considerable restriction","2 — Slight restriction","3 — Normal","4 — Slight hypermobility","5 — Considerable hypermobility","6 — Unstable"].map(o=><option key={o} value={o}>{o||"— grade —"}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={labelStyle}>Pain Response</div>
                    <select value={v(`jp_pain_${t.id}`)} onChange={e=>sv(`jp_pain_${t.id}`,e.target.value)} style={{...selectStyle, borderColor:v(`jp_pain_${t.id}`)?.includes("Pain")?"#ff4d6d":"#1a2d45"}}>
                      {["","No pain","Pain at end of range","Pain throughout movement","Pain reproduced = local","Pain reproduced = referred","Discomfort only"].map(o=><option key={o} value={o}>{o||"— pain? —"}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop:7 }}>
                  <div style={labelStyle}>Notes / Treatment Grade Indicated</div>
                  <input type="text" value={v(`jp_notes_${t.id}`)} onChange={e=>sv(`jp_notes_${t.id}`,e.target.value)} placeholder="e.g. Grade III PA mobilisation indicated, hypomobile L4/5..." style={selectStyle}/>
                </div>
              </div>
            ))}

            {/* Palpation section */}
            <div style={{ ...boxStyle, borderColor:`${reg.color}30` }}>
              <div style={{ fontWeight:700, color:reg.color, marginBottom:8, fontSize:"0.82rem" }}>Palpation — Exact Lesion Localisation</div>
              <div style={{ fontSize:"0.74rem", color:C.muted, marginBottom:8, lineHeight:1.6 }}>After STTT identifies the tissue type, palpate to find the EXACT site of lesion. This is where DTFM is applied. Cyriax rule: all treatment must reach the lesion.</div>
              <div style={{ marginBottom:7 }}>
                <div style={labelStyle}>Lesion Site (palpation)</div>
                <input type="text" value={v("palpation_site")} onChange={e=>sv("palpation_site",e.target.value)} placeholder="e.g. Infraspinatus tendon, 2cm proximal to insertion at greater tuberosity" style={selectStyle}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div>
                  <div style={labelStyle}>Tissue Texture</div>
                  <select value={v("palp_texture")} onChange={e=>sv("palp_texture",e.target.value)} style={selectStyle}>
                    {["","Normal","Thickened / indurated","Ropy / nodular (trigger point)","Boggy / oedematous","Hard / fibrotic","Crepitus on movement","Warmth present"].map(o=><option key={o} value={o}>{o||"— texture —"}</option>)}
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>Temperature</div>
                  <select value={v("palp_temp")} onChange={e=>sv("palp_temp",e.target.value)} style={selectStyle}>
                    {["","Normal","Warm / hot (acute inflammation)","Cool (chronic / circulatory)","Localised warmth only"].map(o=><option key={o} value={o}>{o||"— temperature —"}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLINICAL REASONING TAB ── */}
      {tab === "reason" && (
        <div>
          <button type="button" onClick={runReasoning}
            style={{ width:"100%", padding:"12px", background:`linear-gradient(135deg,${C.accent},${C.a2})`, border:"none", borderRadius:10, color:"#000", fontWeight:800, fontSize:"0.88rem", cursor:"pointer", marginBottom:16 }}>
            🧠 Generate Cyriax Clinical Reasoning
          </button>

          {reasoning ? (
            <div>
              {/* Tissue type banner */}
              <div style={{ background:"rgba(0,229,255,0.08)", border:`1px solid ${C.accent}40`, borderRadius:10, padding:14, marginBottom:12, textAlign:"center" }}>
                <div style={{ fontSize:"1.1rem", fontWeight:800, color:C.accent, marginBottom:4 }}>{reasoning.tissueType}</div>
                <div style={{ fontSize:"0.75rem", color:C.muted }}>Confidence: {reasoning.confidence}</div>
              </div>

              {/* Red flags */}
              <div style={{ background:"rgba(255,77,109,0.08)", border:`1px solid ${C.red}40`, borderRadius:10, padding:12, marginBottom:12 }}>
                <div style={{ fontWeight:800, color:C.red, marginBottom:8, fontSize:"0.85rem", cursor:"pointer" }} onClick={()=>setShowRed(r=>!r)}>🚨 Red Flags for {reg.label} {showRed?"▲":"▼"}</div>
                {showRed && reg.redFlags.map((rf,i)=><div key={i} style={{ padding:"4px 8px", fontSize:"0.76rem", color:C.text, borderBottom:`1px solid rgba(255,77,109,0.1)` }}>⚠ {rf}</div>)}
              </div>

              {/* Findings */}
              {reasoning.findings.length > 0 && (
                <div style={{ ...boxStyle }}>
                  <div style={labelStyle}>Clinical Findings Summary</div>
                  {reasoning.findings.map((f,i)=><div key={i} style={{ padding:"5px 0", fontSize:"0.78rem", color:C.text, borderBottom:`1px solid ${C.border}` }}>• {f}</div>)}
                </div>
              )}

              {/* Diagnoses */}
              {reasoning.diagnoses.length > 0 && (
                <div style={{ ...boxStyle }}>
                  <div style={labelStyle}>Probable Diagnoses</div>
                  {reasoning.diagnoses.map((d,i)=>(
                    <div key={i} style={{ background:C.s3, borderRadius:8, padding:10, marginBottom:7, borderLeft:`3px solid ${i===0?C.accent:i===1?C.a2:C.a3}` }}>
                      <div style={{ fontWeight:700, color:C.text, marginBottom:3 }}>{i+1}. {d.name}</div>
                      <div style={{ fontSize:"0.7rem", color:C.muted, marginBottom:3 }}>{d.detail}</div>
                      <span style={{ fontSize:"0.65rem", padding:"1px 7px", borderRadius:8, background:d.confidence==="High"?"rgba(0,201,122,0.15)":"rgba(255,179,0,0.15)", color:d.confidence==="High"?C.green:C.yellow }}>{d.confidence} Confidence</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Differentials */}
              <div style={{ ...boxStyle }}>
                <div style={labelStyle}>Differential Diagnoses</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {reasoning.differentials.map((d,i)=><span key={i} style={{ padding:"3px 9px", borderRadius:10, fontSize:"0.72rem", background:C.s3, color:C.muted, border:`1px solid ${C.border}` }}>{d}</span>)}
                </div>
              </div>

              {/* Treatment */}
              {reasoning.treatment.length > 0 && (
                <div style={{ background:"rgba(0,201,122,0.06)", border:`1px solid ${C.a3}30`, borderRadius:10, padding:12, marginBottom:12 }}>
                  <div style={labelStyle}>Treatment Direction</div>
                  {reasoning.treatment.map((t,i)=>(
                    <div key={i} style={{ display:"flex", gap:8, padding:"5px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                      <span style={{ color:C.a3, fontWeight:700, flexShrink:0 }}>→</span>
                      <span style={{ fontSize:"0.78rem", color:C.text }}>{t}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Next assessments */}
              <div style={{ ...boxStyle }}>
                <div style={labelStyle}>Suggested Next Assessments</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {reasoning.nextTests.map((t,i)=><span key={i} style={{ padding:"3px 9px", borderRadius:10, fontSize:"0.72rem", background:"rgba(0,229,255,0.1)", color:C.accent, border:`1px solid ${C.accent}30` }}>→ {t}</span>)}
                </div>
              </div>

              {/* Clinical notes */}
              <div style={boxStyle}>
                <div style={labelStyle}>Clinical Reasoning Notes</div>
                <textarea value={v("reasoning_notes")} onChange={e=>sv("reasoning_notes",e.target.value)}
                  placeholder="Add clinical reasoning, working diagnosis, treatment plan, follow-up..."
                  style={{ ...selectStyle, minHeight:80, resize:"vertical", display:"block" }}/>
              </div>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:30, color:C.muted, background:C.s2, borderRadius:12, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>⚕</div>
              <div style={{ fontWeight:700, color:C.text, marginBottom:4 }}>Complete Active, Passive, and Resisted tabs</div>
              <div style={{ fontSize:"0.8rem" }}>Then click Generate to receive Cyriax clinical reasoning, tissue diagnosis, and treatment direction.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SUBJECTIVE ASSESSMENT MODULE — 21 Sections, 40+ options each
// ═══════════════════════════════════════════════════════════════════════════

const SUBJECTIVE_SECTIONS = {

  demographics: {
    label:"Patient Demographics", icon:"👤", color:"#00e5ff",
    fields:[
      { id:"dem_name",      label:"Full Name",             type:"text", placeholder:"Patient full name" },
      { id:"dem_dob",       label:"Date of Birth",         type:"text", placeholder:"DD/MM/YYYY" },
      { id:"dem_age",       label:"Age",                   type:"number", placeholder:"Years" },
      { id:"dem_sex",       label:"Biological Sex",        type:"select", options:["Male","Female","Intersex","Prefer not to say"] },
      { id:"dem_gender",    label:"Gender Identity",       type:"text", placeholder:"e.g. Male, Female, Non-binary" },
      { id:"dem_height",    label:"Height",                type:"text", placeholder:"e.g. 175cm / 5'9\"" },
      { id:"dem_weight",    label:"Weight",                type:"text", placeholder:"e.g. 75kg / 165lbs" },
      { id:"dem_bmi",       label:"BMI",                   type:"text", placeholder:"Auto-calculated or enter" },
      { id:"dem_dominant",  label:"Dominant Hand",         type:"select", options:["Right","Left","Ambidextrous"] },
      { id:"dem_dominant_foot", label:"Dominant Foot",     type:"select", options:["Right","Left"] },
      { id:"dem_ethnicity", label:"Ethnicity",             type:"text", placeholder:"Optional" },
      { id:"dem_language",  label:"Primary Language",      type:"text", placeholder:"e.g. English, Urdu" },
      { id:"dem_interpreter",label:"Interpreter Needed",   type:"select", options:["No","Yes — arranged","Yes — needed"] },
      { id:"dem_gp",        label:"GP / Referring Doctor", type:"text", placeholder:"Name and practice" },
      { id:"dem_referral",  label:"Referral Source",       type:"multicheck", options:["GP","Orthopaedic surgeon","Self-referral","Employer","Insurance","Sports coach","Another physio","A&E","Rheumatologist","Neurologist","Other specialist"] },
      { id:"dem_insurance",  label:"Insurance / Funding",  type:"multicheck", options:["NHS","Private — self pay","BUPA","AXA","Vitality","Aviva","WPA","Allianz","Employer EAP","Workers compensation","Motor accident","Other"] },
      { id:"dem_occupation",  label:"Occupation",          type:"text", placeholder:"Job title and employer" },
      { id:"dem_work_status", label:"Work Status",         type:"multicheck", options:["Full time employed","Part time employed","Self employed","Student","Retired","Unemployed","Off work — injury","Off work — illness","Carer","Volunteer"] },
      { id:"dem_notes",     label:"Additional Notes",      type:"textarea", placeholder:"Any other relevant demographic information" },
    ]
  },

  chief_complaint: {
    label:"Chief Complaint", icon:"🎯", color:"#ff4d6d",
    fields:[
      { id:"cc_main",         label:"Main Complaint (patient's words)", type:"textarea", placeholder:"Write exactly what the patient says is their main problem" },
      { id:"cc_location",     label:"Primary Pain Location",            type:"multicheck", options:["Head","Forehead","Temple (L)","Temple (R)","Occiput","Jaw/TMJ","Neck — anterior","Neck — posterior","Neck — lateral (L)","Neck — lateral (R)","Shoulder (L)","Shoulder (R)","Upper arm (L)","Upper arm (R)","Elbow (L)","Elbow (R)","Forearm (L)","Forearm (R)","Wrist (L)","Wrist (R)","Hand/fingers (L)","Hand/fingers (R)","Upper back","Mid back","Lower back","Sacrum","Coccyx","SI joint (L)","SI joint (R)","Buttock (L)","Buttock (R)","Groin (L)","Groin (R)","Hip (L)","Hip (R)","Thigh anterior (L)","Thigh anterior (R)","Thigh posterior (L)","Thigh posterior (R)","Knee (L)","Knee (R)","Lower leg (L)","Lower leg (R)","Ankle (L)","Ankle (R)","Foot (L)","Foot (R)","Plantar fascia (L)","Plantar fascia (R)","Toes (L)","Toes (R)"] },
      { id:"cc_secondary",    label:"Secondary Pain Location",          type:"text", placeholder:"Additional pain area if applicable" },
      { id:"cc_radiation",    label:"Pain Radiation / Referral",        type:"multicheck", options:["No radiation","Radiates to arm (L)","Radiates to arm (R)","Radiates to hand/fingers (L)","Radiates to hand/fingers (R)","Radiates to leg (L)","Radiates to leg (R)","Radiates to foot (L)","Radiates to foot (R)","Radiates across lower back","Radiates to groin","Radiates to buttock","Radiates to anterior thigh","Radiates to posterior thigh","Radiates to anterior shin","Radiates to calf","Radiates bilaterally","Radiates around chest/ribs","Radiates to jaw","Radiates to face","Bilateral upper limb symptoms","Bilateral lower limb symptoms"] },
      { id:"cc_symptom_type", label:"Symptom Type",                    type:"multicheck", options:["Pain","Aching","Stiffness","Burning","Tingling/pins & needles","Numbness","Sharp","Stabbing","Shooting","Throbbing","Cramping","Tightness","Weakness","Clicking","Grinding/crepitus","Locking","Giving way","Swelling","Warmth","Fatigue","Dizziness","Headache","Nausea"] },
      { id:"cc_onset",        label:"Onset",                           type:"multicheck", options:["Sudden — traumatic","Sudden — non-traumatic","Gradual — insidious","Gradual — after illness","Post-surgical","Post-partum","After change in activity","After new job/workstation","Woke up with it","No clear cause","Work-related","Sport-related","Motor vehicle accident","Slip/trip/fall","Lifting injury","Repetitive strain"] },
      { id:"cc_duration",     label:"Duration",                        type:"multicheck", options:["< 1 week (acute)","1–2 weeks","2–4 weeks (subacute)","1–3 months","3–6 months (chronic)","6–12 months","1–2 years","2–5 years","> 5 years","Since childhood","Since last episode of same injury","Recurring — multiple episodes"] },
      { id:"cc_side",         label:"Laterality",                      type:"multicheck", options:["Unilateral — right dominant","Unilateral — left dominant","Bilateral — symmetric","Bilateral — right worse","Bilateral — left worse","Central","Axial","Diffuse — not specific","Migrates between sides","Alternates"] },
      { id:"cc_notes",        label:"Additional Complaint Notes",      type:"textarea", placeholder:"Any other details about the chief complaint" },
    ]
  },

  pain_analysis: {
    label:"Pain Analysis", icon:"🌡️", color:"#ff8c42",
    fields:[
      { id:"pa_vas_now",    label:"NRS — Current Pain (0–10)",          type:"number", placeholder:"0 = no pain, 10 = worst imaginable" },
      { id:"pa_vas_best",   label:"NRS — Best Pain (0–10)",             type:"number", placeholder:"Pain at its best" },
      { id:"pa_vas_worst",  label:"NRS — Worst Pain (0–10)",            type:"number", placeholder:"Pain at its worst" },
      { id:"pa_vas_avg",    label:"NRS — Average Pain (0–10)",          type:"number", placeholder:"Average over past week" },
      { id:"pa_quality",    label:"Pain Quality (select all that apply)",type:"multicheck", options:["Sharp","Dull","Aching","Burning","Electric shock","Shooting","Stabbing","Throbbing","Cramping","Gnawing","Tight/squeezing","Heavy","Numb","Tingling","Pins and needles","Stinging","Pressure","Deep","Superficial","Constant ache","Intermittent sharp","Referred","Radiating","Spontaneous","Provoked only"] },
      { id:"pa_depth",      label:"Pain Depth",                         type:"multicheck", options:["Superficial — skin/subcutaneous","Fascial layer","Muscular","Joint","Bone","Deep unlocatable","Referred — felt at distance from source","Central sensitisation pattern — widespread"] },
      { id:"pa_onset_speed",label:"Pain Onset Speed",                   type:"multicheck", options:["Immediate (seconds)","Within minutes","Within hours","Delayed (next day)","24–48 hours after activity","Gradual over days","Slow progressive over weeks"] },
      { id:"pa_pattern",    label:"Pain Pattern",                       type:"multicheck", options:["Constant — never goes away","Constant — varies in intensity","Intermittent — comes and goes","Predictable — pattern clear","Unpredictable — random","Only with specific movements","Only with loading / weight-bearing","Only with sustained postures","Only at rest","Night pain waking patient","Morning dominant","End of day dominant","Activity dependent","Weather dependent","Hormonal pattern","Post-activity delayed"] },
      { id:"pa_nature",     label:"Pain Nature / Tissue Source",        type:"multicheck", options:["Nociceptive — local, sharp, movement-related","Neuropathic — burning, shooting, dermatomal","Nociplastic — widespread, unpredictable, sensitisation","Central sensitisation features","Inflammatory — worse at rest, morning stiffness >30 min","Mechanical — worse with loading, better with rest","Discogenic — worse flexion, cough/sneeze","Facet — worse extension, eases with flexion","Neural — shooting, tingling, dermatomal","Vascular — cramping with walking, eases with rest","Visceral — poorly localized, unaffected by movement","Psychosocial overlay"] },
      { id:"pa_intensity_scale",label:"Pain Scale Used",                type:"multicheck", options:["NRS (Numerical Rating Scale 0–10)","VAS (Visual Analog Scale)","FACES pain scale (paediatric/cognitive)","BPI (Brief Pain Inventory)","McGill Pain Questionnaire"] },
      { id:"pa_notes",      label:"Pain Analysis Notes",                type:"textarea", placeholder:"Detailed pain description, any additional features" },
    ]
  },

  symptom_behavior: {
    label:"Symptom Behaviour", icon:"📈", color:"#7f5af0",
    fields:[
      { id:"sb_change",     label:"Symptom Change Over Time",           type:"multicheck", options:["Getting progressively worse","Slowly improving","Stable — no change","Fluctuating — good and bad days","Improving since treatment started","Worsening despite treatment","Episodic — episodes getting more frequent","Episodic — episodes getting less frequent","Plateau — improvement stopped","Post-surgical — expected trajectory","Changed character recently"] },
      { id:"sb_morning",    label:"Morning Behaviour",                   type:"multicheck", options:["Worst on waking — eases quickly (<30 min)","Worse on waking — prolonged stiffness (>30 min)","Worst on waking — stays bad all morning","Stiff on waking — improves with movement","No morning pattern","Better in morning — worse later","Pain starts after getting up","First steps painful (plantar fascia pattern)","Getting out of bed painful","Morning headache"] },
      { id:"sb_daytime",    label:"Daytime Behaviour",                   type:"multicheck", options:["Worsens through the day","Improves through the day","Constant throughout day","Worse after sitting","Worse after standing","Worse after walking","Improves with movement","Worsens with prolonged activity","Better with rest","Worse with rest — restlessness","Worse in afternoon","Specific time of day pattern"] },
      { id:"sb_evening",    label:"Evening Behaviour",                   type:"multicheck", options:["Worst in evening","Improves in evening","Constant all evening","Worse after day's activity","Better after resting in evening","Disrupts evening activities","Prevents social activities","Worse watching TV / sitting","Better with legs elevated","No evening pattern"] },
      { id:"sb_night",      label:"Night Behaviour",                    type:"multicheck", options:["No night pain","Pain disturbs sleep — takes time to settle","Pain wakes from sleep — can return to sleep","Pain wakes repeatedly","Cannot sleep on affected side","Position-dependent night pain","Constant night pain — cannot sleep","Night sweats accompanying pain","Night pain — no position of comfort (red flag)","Arm/leg symptoms at night (neural)","Improved sleep with pain medication"] },
      { id:"sb_irritability",label:"Symptom Irritability",              type:"multicheck", options:["Low irritability — hard to aggravate, quick to settle","Moderate irritability — some aggravation, moderate settling time","High irritability — easily aggravated, slow to settle","Very high irritability — severe and prolonged aggravation","Rest eases quickly (mechanical)","Activity eases (inflammatory)","Unpredictable — no clear pattern","Multiple unrelated triggers"] },
      { id:"sb_notes",      label:"Symptom Behaviour Notes",            type:"textarea", placeholder:"24-hour pattern description, any triggers or patterns" },
    ]
  },

  mechanism: {
    label:"Mechanism of Injury", icon:"⚡", color:"#ffb300",
    fields:[
      { id:"moi_type",      label:"Mechanism Type",                     type:"multicheck", options:["Direct trauma — hit/struck","Indirect trauma — force through limb","Torsion/twisting injury","Hyperflexion","Hyperextension","Hyperabduction","Axial compression","Distraction/traction","Deceleration injury","Acceleration injury","Shear force","Crush injury","Fall — onto outstretched hand","Fall — onto knee","Fall — from height","Whiplash — rear impact","Whiplash — side impact","Head-on collision","Overuse / repetitive strain","Cumulative trauma","Postural overload","Lifting injury — flexed spine","Lifting injury — rotated","Awkward reach","Prolonged sustained posture","Contact sport injury","Non-contact sport injury","Swimming injury","Running injury","Throwing injury","Cycling injury","Occupational injury","Post-surgical","Spontaneous — no mechanism","No clear mechanism identified"] },
      { id:"moi_activity",  label:"Activity at Time of Injury",         type:"text", placeholder:"e.g. Playing football, lifting box, sitting at desk" },
      { id:"moi_position",  label:"Body Position at Injury",            type:"text", placeholder:"e.g. Spine flexed and rotated, arm overhead" },
      { id:"moi_first_symptom",label:"First Symptom After Injury",      type:"multicheck", options:["Immediate pain","Delayed pain (within hours)","Next day pain","Immediate swelling","Delayed swelling","Immediate weakness","Immediate numbness/tingling","Felt pop/crack","Heard audible crack/pop","Immediate locking","Immediate giving way","Dizziness post-impact","Loss of consciousness","No immediate symptoms"] },
      { id:"moi_previous",  label:"Previous Same Injury",               type:"multicheck", options:["First occurrence","Second occurrence","Third or more","Recurring — same mechanism each time","Recurring — different mechanisms","Previous injury — same joint different structure","Old injury — previously managed","Old injury — never treated","Progressive — each episode worse","Progressive — each episode resolves less"] },
      { id:"moi_notes",     label:"Mechanism Notes",                    type:"textarea", placeholder:"Detailed description of how the injury occurred" },
    ]
  },

  aggravating: {
    label:"Aggravating Factors", icon:"🔺", color:"#ff4d6d",
    fields:[
      { id:"agg_posture",   label:"Postures that Aggravate",            type:"multicheck", options:["Sitting","Prolonged sitting > 30 min","Prolonged sitting > 1 hour","Standing","Prolonged standing","Standing on hard floors","Lying supine","Lying on affected side","Lying on unaffected side","Lying prone","Slumped posture","Upright posture paradoxically","Sitting with legs crossed","Driving","Computer work","Looking down (phone use)","Looking up","Head turned left","Head turned right"] },
      { id:"agg_movement",  label:"Movements that Aggravate",           type:"multicheck", options:["Forward bending","Backward bending","Side bending left","Side bending right","Rotation left","Rotation right","Reaching overhead","Reaching across body","Lifting","Carrying","Pushing","Pulling","Twisting","Getting up from sitting","Getting in/out of car","Dressing","Putting on shoes/socks","Hair washing","Looking over shoulder","Coughing / sneezing","Deep breathing","Swallowing"] },
      { id:"agg_activity",  label:"Activities that Aggravate",          type:"multicheck", options:["Walking short distance","Walking long distance","Running","Stairs — up","Stairs — down","Squatting","Kneeling","Swimming","Cycling","Gym — weights","Gym — cardio","Yoga/Pilates","Sport specific","Sexual activity","Housework","Gardening","Childcare activities","Manual work","Computer/keyboard work","Carrying children","Prolonged reading","Screen time"] },
      { id:"agg_other",     label:"Other Aggravating Factors",          type:"multicheck", options:["Cold weather","Hot weather","Damp/humid weather","Barometric pressure changes","Stress","Fatigue","Menstrual cycle","Morning worse — inflammatory","After activity — delayed","Alcohol","Dehydration","Poor sleep","Extended screen time","Specific shoes / footwear","Specific mattress / pillow","Work tasks","Emotional states"] },
      { id:"agg_worst",     label:"Single Worst Aggravating Activity",  type:"text", placeholder:"The one thing that makes it worst" },
      { id:"agg_notes",     label:"Aggravating Factors Notes",          type:"textarea", placeholder:"Any other specific triggers or patterns" },
    ]
  },

  relieving: {
    label:"Relieving Factors", icon:"🔻", color:"#00c97a",
    fields:[
      { id:"rel_posture",   label:"Postures that Relieve",              type:"multicheck", options:["Lying flat","Lying with knees bent","Lying with legs elevated","Lying on affected side","Lying on unaffected side","Sitting upright","Sitting with lumbar support","Sitting with legs elevated","Standing","Walking slowly","Standing with weight shifted","Hands and knees position","Side lying with pillow between knees","Prone lying","Prone lying with pillow under abdomen","Supported sitting (leaning on arms)"] },
      { id:"rel_movement",  label:"Movements that Relieve",             type:"multicheck", options:["Gentle walking","Specific direction movement (McKenzie preference)","Extension relieves","Flexion relieves","Rotation relieves","Side-bend relieves","Traction (self-applied)","Chin tuck","Shoulder blade squeeze","Hip circles / gentle rotation","Stretching","Gentle exercise","Yoga / stretching","Swimming","Aquatic exercise","Specific physiotherapy exercises"] },
      { id:"rel_manual",    label:"Manual / Physical Treatments",       type:"multicheck", options:["Physiotherapy manual therapy","Massage — general","Massage — deep tissue","Osteopathy","Chiropractic","Dry needling / acupuncture","Joint manipulation","Joint mobilisation","Stretching by therapist","Taping / strapping","Bracing / orthotics","Heat application","Ice application","Hot shower / bath","TENS machine","Ultrasound therapy","Shockwave therapy","Hydrotherapy"] },
      { id:"rel_medication",label:"Medications that Help",              type:"multicheck", options:["Paracetamol","Ibuprofen / NSAIDs","Naproxen","Codeine / opioids","Muscle relaxants","Neuropathic medications (Gabapentin/Pregabalin)","Topical NSAIDs (Voltarol)","Topical capsaicin","Cortisone injection","Hyaluronic acid injection","PRP injection","Antidepressants (pain management)","Sleep medication","No medication effective","Not tried medication"] },
      { id:"rel_other",     label:"Other Relieving Factors",            type:"multicheck", options:["Rest","Sleep","Distraction","Reduced stress","Alcohol (temporary)","Warm weather","Positive mood","After work/reduced loading","Weekend better than workdays","Holiday better (supports occupational cause)","After socialising","Mindfulness/meditation","CPAP (if sleep apnoea related)"] },
      { id:"rel_best",      label:"Single Best Relieving Factor",       type:"text", placeholder:"What helps the most" },
      { id:"rel_notes",     label:"Relieving Factors Notes",            type:"textarea", placeholder:"Any other specific factors" },
    ]
  },

  pain_pattern_24hr: {
    label:"24-Hour Pain Pattern", icon:"🕐", color:"#00d4ff",
    fields:[
      { id:"h24_wake",      label:"On Waking (6–8am)",                  type:"multicheck", options:["Pain free on waking","Stiff but not painful","Mild pain — eases quickly","Moderate pain","Severe pain","Takes > 30 min to ease","Takes > 1 hour to ease","Pain free on waking then worsens","Pain wakes before alarm","Dependent on sleep position","Worse if slept badly"] },
      { id:"h24_morning",   label:"Morning (8am–12pm)",                  type:"multicheck", options:["Eases progressively through morning","Improves rapidly with movement","Stays constant through morning","Worsens through morning","Best of the day","Stiffness clears by 10am","Stiffness persists all morning","Requires medication to function in morning","Can work in morning","Cannot work in morning"] },
      { id:"h24_midday",    label:"Midday (12pm–2pm)",                   type:"multicheck", options:["Best time of day","Moderate — manageable","Worsening from morning","Improved from morning","Lunch break movement helps","Sitting at desk worsening","Standing for lunch worsening","Pain after lunch — eating related?","No change at midday"] },
      { id:"h24_afternoon", label:"Afternoon (2pm–6pm)",                 type:"multicheck", options:["Progressive worsening through afternoon","Constant through afternoon","Fatigue driving pain increase","Activity-related worsening","Needs rest break","Most productive time","Pain manageable but present","Requires medication by 4pm","Improving through afternoon","Worst of day"] },
      { id:"h24_evening",   label:"Evening (6pm–10pm)",                  type:"multicheck", options:["Eases with rest in evening","Pain increases in evening","Difficult to relax due to pain","Prevents enjoying evening activities","Better once off feet","Worse watching TV / sitting","Better with evening walk","Medication needed for evening","Unable to sit comfortably","Cannot perform evening tasks"] },
      { id:"h24_night",     label:"Night (10pm–6am)",                    type:"multicheck", options:["Sleeps through — no night pain","Takes > 30 min to get comfortable","Pain on turning in bed","Wakes once per night","Wakes multiple times","Cannot sleep >4 hours continuously","Night pain worse than day pain","Position change relieves temporarily","Requires medication to sleep","Not related to sleep position","Restless legs","Better second half of night","Worsens toward morning"] },
      { id:"h24_pattern_summary",label:"Overall 24hr Pattern Type",     type:"multicheck", options:["Inflammatory pattern — worse at rest, morning stiffness >30 min","Mechanical pattern — worse with loading, better with rest","Neuropathic — constant burning, worse at night","Postural — worse sustained postures, relieved by position change","Activity-dependent — directly proportional to load","Deconditioned — poor exercise tolerance driving pattern","Visceral — unrelated to posture or movement","Psychosocial — disproportionate to physical findings","Hormonal cycle related","No clear pattern"] },
      { id:"h24_notes",     label:"24-Hour Pattern Notes",              type:"textarea", placeholder:"Describe the typical day in detail" },
    ]
  },

  functional_limitations: {
    label:"Functional Limitations", icon:"🚫", color:"#ff8c42",
    fields:[
      { id:"fl_self_care",  label:"Self-Care Activities",               type:"multicheck", options:["Washing/showering — normal","Showering — needs modified technique","Bathing — cannot use bath","Washing hair — difficulty","Dressing — independent","Dressing — upper body difficulty","Dressing — lower body difficulty","Putting on shoes/socks — difficulty","Grooming / shaving — difficulty","Toileting — normal","Toileting — reduced mobility","Feeding self — normal","Feeding — difficulty with cutlery","Cannot perform self-care independently"] },
      { id:"fl_mobility",   label:"Mobility",                           type:"multicheck", options:["Walks normally","Walks with antalgia","Uses walking stick","Uses crutches","Uses walking frame","Wheelchair user — full time","Wheelchair user — part time","Limps — antalgic","Limps — neurological","Stairs — normal","Stairs — one step at a time","Stairs — requires rail","Stairs — cannot manage","Ramp preferred over stairs","Cannot walk > 100m","Cannot walk > 500m","Walking limited — less than 1km","Walking limited — 1–5km","No walking limitation"] },
      { id:"fl_domestic",   label:"Domestic Activities",                type:"multicheck", options:["Cooking — normal","Cooking — standing tolerance limited","Cooking — cannot lift pots","Cleaning — normal","Cleaning — cannot vacuum","Cleaning — cannot mop","Ironing — cannot perform","Laundry — normal","Laundry — cannot lift basket","Bed making — difficulty","Shopping — normal","Shopping — cannot carry bags","Shopping — requires trolley support","Shopping — cannot walk full shop","Childcare — normal","Childcare — lifting children limited","Gardening — limited","DIY / home repairs — limited"] },
      { id:"fl_work",       label:"Work Capacity",                      type:"multicheck", options:["Full time work — no restriction","Reduced hours due to pain","Modified duties required","Working from home adaptations","Cannot sit > 30 min","Cannot sit > 1 hour","Cannot stand > 30 min","Cannot stand > 1 hour","Computer work painful","Manual tasks restricted","Lifting restricted","Cannot drive","Driving restricted to short distances","Off work — short term","Off work — long term","At risk of job loss","Reduced income impact"] },
      { id:"fl_social",     label:"Social Participation",              type:"multicheck", options:["Full social life maintained","Reduced socialising due to pain","Cannot sit for restaurant/cinema","Cannot travel long distances","Cannot travel by plane","Avoids social situations due to pain","Sex/intimacy affected","Relationship strain","Cannot play with children/grandchildren","Cannot attend religious activities","Cannot volunteer","Social isolation increasing","Dependent on others for transport","Reduced due to embarrassment"] },
      { id:"fl_sport_rec",  label:"Sport / Recreation",                 type:"multicheck", options:["No sport/recreation restriction","Reduced intensity","Playing through pain","Performance significantly reduced","Cannot play primary sport","Cannot exercise at all","Cannot run","Cannot swim","Cannot cycle","Cannot lift weights","Gym attendance reduced","Yoga/Pilates restricted","Dancing restricted","Walking/hiking restricted","Cannot participate in team sport","Retired from sport due to pain"] },
      { id:"fl_notes",      label:"Functional Limitation Notes",        type:"textarea", placeholder:"Describe the most impactful functional limitations in detail" },
    ]
  },

  activity_restrictions: {
    label:"Activity Participation Restrictions", icon:"🏃", color:"#a8ff3e",
    fields:[
      { id:"ar_sport_level",label:"Sport / Exercise Level",             type:"multicheck", options:["Sedentary — no regular exercise","Light activity — walking only","Moderate — 2–3x/week exercise","Active — 4–5x/week","Very active — daily training","Elite competitive athlete","Masters athlete (35+)","Youth/junior athlete","Recreational sport only","Club sport competition","National level competition","Professional/paid athlete","Post-competition rehabilitation","Pre-season rehabilitation","In-season management","Return to sport goal"] },
      { id:"ar_sports_played",label:"Sports / Activities Played",       type:"multicheck", options:["Football / Soccer","Rugby","Cricket","Tennis","Badminton","Squash","Golf","Athletics — track","Athletics — field","Swimming","Cycling","Triathlon","Running — road","Running — trail","CrossFit / HIIT","Weightlifting / powerlifting","Yoga / Pilates","Martial arts","Boxing","Dance","Rock climbing","Skiing / snowboarding","Rowing / paddling","Horse riding","Basketball","Volleyball","Netball","Hockey","Gymnastics","Cheerleading","Other (specify in notes)"] },
      { id:"ar_restrictions", label:"Activity Restrictions",            type:"multicheck", options:["Cannot return to sport","Restricted from contact sport","Restricted from impact activities","Restricted from overhead sport","Restricted from rotational sport","Restricted from running","Restricted from jumping","Restricted from lifting","Restricted from water sport","Restricted from racquet sport","Doctor has advised rest","Player/coach advised modified training","Self-limiting due to pain","Fearful of re-injury","Insurance/medico-legal restriction","Pre-clearance assessment required","Return to sport protocol underway"] },
      { id:"ar_goal_sport",  label:"Activity Goal",                     type:"text", placeholder:"e.g. Return to playing football at weekend level" },
      { id:"ar_timeline",    label:"Desired Return Timeline",           type:"multicheck", options:["ASAP — as fast as possible","< 2 weeks","2–4 weeks","4–8 weeks","2–3 months","3–6 months","6–12 months","No specific timeline","Before specific event (specify in notes)","Competition date (specify in notes)","End of season","Next season"] },
      { id:"ar_notes",       label:"Activity Restriction Notes",        type:"textarea", placeholder:"Details of sport, activity level, and return-to-sport goals" },
    ]
  },

  occupational: {
    label:"Occupational History", icon:"💼", color:"#ffd700",
    fields:[
      { id:"occ_job_title",  label:"Current Job Title",                 type:"text", placeholder:"e.g. Nurse, Software developer, Teacher" },
      { id:"occ_employer",   label:"Employer / Workplace",              type:"text", placeholder:"Name and type of workplace" },
      { id:"occ_duration",   label:"Time in Current Role",              type:"text", placeholder:"e.g. 3 years, 6 months" },
      { id:"occ_hours",      label:"Working Hours",                     type:"multicheck", options:["Part time < 20 hrs/week","Part time 20–30 hrs/week","Full time 35–40 hrs/week","Extended hours > 40 hrs/week","Night shifts","Rotating shifts","Weekend work","On-call duties","Variable / unpredictable hours","Working from home","Hybrid working","Office based","Field / site based","Remote / travelling"] },
      { id:"occ_tasks",      label:"Primary Physical Demands",          type:"multicheck", options:["Sedentary — primarily seated","Standing — prolonged","Walking — moderate","Walking — extensive","Repetitive lifting","Heavy lifting > 20kg","Overhead work","Forward bending repetitive","Driving — < 2 hrs/day","Driving — 2–4 hrs/day","Driving — > 4 hrs/day","Vibration exposure (hand/arm)","Whole body vibration","Repetitive fine motor tasks","Computer/keyboard intensive","Visual display unit (VDU)","Manual handling","Climbing ladders/scaffolding","Awkward postures","Cold environment","Hot environment","High noise environment","Shift work","Call centre/telephone","Patient handling (healthcare)"] },
      { id:"occ_ergonomics", label:"Workstation / Ergonomic Factors",  type:"multicheck", options:["Chair height adjustable","Lumbar support provided","Monitor at eye level","Dual monitors","Standing desk available","Standing desk not available","Keyboard position optimal","Mouse — standard","Mouse — ergonomic","Laptop only — no docking","Headset for phone calls","Poor lighting","Screen glare","Working in cramped space","Hot-desking (variable workstation)","No ergonomic assessment done","Ergonomic assessment done","Ergonomic aids provided","Occupational health involved"] },
      { id:"occ_work_impact",label:"Impact of Symptoms on Work",        type:"multicheck", options:["No impact — working fully","Reduced productivity","Reduced hours","Modified duties agreed","Off work short term (< 4 weeks)","Off work medium term (4–12 weeks)","Off work long term (> 12 weeks)","Risk of job loss","Employer unsupportive","Employer very supportive","Occupational health referral made","Phased return to work planned","Redeployment considered","Unable to return to same role","Changed career due to injury","Work compensation claim active","Work injury — employer dispute"] },
      { id:"occ_history",    label:"Previous Occupational History",     type:"textarea", placeholder:"Previous jobs, cumulative exposures, injuries at work" },
      { id:"occ_notes",      label:"Occupational Notes",                type:"textarea", placeholder:"Any other relevant occupational information" },
    ]
  },

  sports_history: {
    label:"Sports / Activity History", icon:"🏅", color:"#ff9a9e",
    fields:[
      { id:"sh_current_sport",label:"Current Sports / Activities",      type:"text", placeholder:"List all current sports and activities" },
      { id:"sh_years",        label:"Years in Sport",                   type:"text", placeholder:"e.g. 15 years football, 3 years gym" },
      { id:"sh_training_load",label:"Current Training Load",            type:"multicheck", options:["No training currently","1 session/week","2 sessions/week","3 sessions/week","4 sessions/week","5–6 sessions/week","Daily training","Twice daily training","Reduced from normal (injury)","Pre-season (high load)","In-season (moderate-high)","Off-season (reduced)","Competition phase","Taper phase","Just returned after break"] },
      { id:"sh_recent_change",label:"Recent Load Changes",              type:"multicheck", options:["No recent change","Increased volume recently","Increased intensity recently","New sport / activity started","Changed training surface","Changed footwear","Changed technique","Returned from injury lay-off","Just started training again","Pre-season ramp up","Overtraining suspected","No warm-up / cool-down","Training programme changed","New coach / trainer"] },
      { id:"sh_past_injuries",label:"Past Sports Injuries",             type:"multicheck", options:["Ankle sprain (L)","Ankle sprain (R)","Knee ligament (ACL/MCL/PCL/LCL)","Meniscal injury","Shin splints","Stress fracture","Hamstring strain","Quadriceps strain","Calf strain","Achilles tendinopathy","Plantar fasciitis","Patellofemoral pain","IT band syndrome","Hip flexor strain","Groin strain","Hip labral tear","Lower back — disc","Lower back — facet","SI joint","Rotator cuff","Shoulder dislocation","AC joint","Biceps tendon","Tennis/golfer elbow","Wrist sprain","Fractures — upper limb","Fractures — lower limb","Concussion","Stress fracture — foot","No significant past injuries"] },
      { id:"sh_previous_physio",label:"Previous Physiotherapy",        type:"multicheck", options:["No previous physiotherapy","Physiotherapy — helpful","Physiotherapy — partially helpful","Physiotherapy — not helpful","Physiotherapy — made worse","Previous surgery + physio","Ongoing physiotherapy elsewhere","Discharged from physiotherapy","Did not complete course","Sports medicine physician input","Podiatry input","Orthotics prescribed","Strength and conditioning input"] },
      { id:"sh_performance",  label:"Performance Impact",              type:"multicheck", options:["No performance impact","Slightly reduced performance","Significantly reduced performance","Training pain free, competition painful","Cannot train at full capacity","Cannot compete currently","Changed position/event due to injury","Dropped training group / level","Playing through pain","Avoiding certain skills/movements","Biomechanical adaptations noted","Coach has noted change in performance"] },
      { id:"sh_notes",        label:"Sports History Notes",            type:"textarea", placeholder:"Training history, injury history, performance goals" },
    ]
  },

  sleep: {
    label:"Sleep Analysis", icon:"😴", color:"#b388ff",
    fields:[
      { id:"sl_hours",      label:"Average Sleep Duration",             type:"multicheck", options:["< 4 hours (severely inadequate)","4–5 hours (inadequate)","5–6 hours (below optimal)","6–7 hours (borderline)","7–8 hours (optimal)","8–9 hours (slightly long)","9–10 hours (prolonged)","10+ hours (excessive — fatigue/depression?)","Variable — no consistent pattern","Sleep disrupted by work shifts"] },
      { id:"sl_quality",    label:"Sleep Quality",                      type:"multicheck", options:["Excellent — restorative","Good — mostly refreshed","Fair — sometimes refreshed","Poor — rarely refreshed","Very poor — never refreshed","Difficulty falling asleep","Difficulty staying asleep","Early morning waking","Vivid dreams / nightmares","Restless sleep","Teeth grinding (bruxism)","Snoring reported","Sleep apnoea diagnosed","Sleep apnoea suspected — not diagnosed","CPAP user","Partner reports abnormal breathing","Restless legs syndrome","Periodic limb movement disorder"] },
      { id:"sl_position",   label:"Sleep Position",                     type:"multicheck", options:["Back sleeper — no pillow","Back sleeper — one pillow","Back sleeper — multiple pillows","Side sleeper — left dominant","Side sleeper — right dominant","Side sleeper — switches sides","Front/prone sleeper","Recliner / armchair sleeper","Cannot lie flat — reflux","Pillow between knees","Pillow under knees","Wedge pillow user","Cervical pillow","Standard pillow","Memory foam pillow","Multiple pillows under head"] },
      { id:"sl_mattress",   label:"Mattress / Sleep Surface",           type:"multicheck", options:["Standard spring mattress","Memory foam mattress","Orthopaedic mattress","Old / sagging mattress","New mattress (< 6 months)","Firm preferred","Soft preferred","Hospital bed at home","Sofa sleeping","Floor sleeping","Adjustable bed","Partner in bed","Children in bed","Pets in bed"] },
      { id:"sl_impact",     label:"Pain Impact on Sleep",               type:"multicheck", options:["Pain does not affect sleep","Pain slightly affects sleep quality","Pain moderately disrupts sleep","Pain severely disrupts sleep","Pain prevents falling asleep","Pain wakes from sleep — once","Pain wakes from sleep — multiple times","Pain on turning in bed","Pain on getting up to toilet","Morning pain from sleep position","No position of comfort","Pain free during sleep — worsens on waking","Fear of sleep due to pain"] },
      { id:"sl_hygiene",    label:"Sleep Hygiene",                      type:"multicheck", options:["Regular sleep schedule","Irregular sleep times","Screen use before bed","Late caffeine use (after 2pm)","Alcohol affecting sleep","Regular exercise (positive effect)","No exercise","Bedroom too hot","Bedroom too cold","Bedroom — noise disruption","Napping during day","Stress affecting sleep","Anxiety at bedtime","Pre-sleep routine established","No pre-sleep routine"] },
      { id:"sl_notes",      label:"Sleep Analysis Notes",              type:"textarea", placeholder:"Any other sleep information relevant to presentation" },
    ]
  },

  psychosocial: {
    label:"Stress / Emotional Factors", icon:"🧠", color:"#90caf9",
    fields:[
      { id:"ps_stress",     label:"Current Stress Level",               type:"multicheck", options:["No significant stress","Mild stress — manageable","Moderate stress — affecting function","High stress — significantly impacting life","Severe stress — crisis level","Work stress dominant","Financial stress dominant","Relationship stress dominant","Bereavement / loss","Family illness / carer stress","Divorce / separation","Housing stress","Legal proceedings stress","Compensation claim stress","Academic stress","Major life change","Multiple simultaneous stressors"] },
      { id:"ps_mood",       label:"Mood / Emotional State",             type:"multicheck", options:["Mood normal / positive","Mild low mood","Moderate depression — diagnosed","Severe depression — diagnosed","Anxiety — mild","Anxiety — moderate / diagnosed","Anxiety — severe / panic attacks","PTSD — diagnosed","PTSD — suspected","Post-natal depression","Grief / bereavement","Anger / frustration prominent","Fear of movement (kinesiophobia)","Catastrophising (believes worst outcome)","Pain catastrophising scale elevated","Hopelessness about recovery","Anger at cause of injury (third party)","Feeling dismissed / not believed","Previously dismissed by healthcare"] },
      { id:"ps_fear_avoid", label:"Fear Avoidance Beliefs",             type:"multicheck", options:["No fear avoidance","Mild — avoids some activities","Moderate — significant avoidance","Severe — very restricted activities","Afraid movement will cause damage","Believes rest is the only treatment","Afraid of re-injury","Avoids all exercise","Protective of injured area excessively","Tampa Scale of Kinesiophobia elevated","Believes pain = damage (unhelpful belief)","Functional overlay suspected","Nocebo effect from previous advice","Fearful of specific diagnoses","Scared of surgery","Catastrophic thinking about future"] },
      { id:"ps_social",     label:"Social Support",                     type:"multicheck", options:["Strong social support network","Partner/spouse supportive","Partner/spouse unsupportive","Family supportive","Family unsupportive","Lives alone","Socially isolated","Good friend network","No close friends","Religious/community support","Carer role limiting own recovery","Dependent on others — increased stress","Children at home — demanding","Good workplace support","Poor workplace support","Employer hostile to injury","Online support groups"] },
      { id:"ps_cope",       label:"Coping Strategies Used",             type:"multicheck", options:["Exercise / physical activity","Mindfulness / meditation","Psychological therapy (CBT/ACT)","Medication","Alcohol (maladaptive)","Cannabis / substances","Social support — friends/family","Religious / spiritual practices","Journalling","Distraction (TV, hobbies)","Rest and pacing","Positive self-talk","Problem-solving approach","Avoidance and withdrawal","Denial","Catastrophising (maladaptive)","No coping strategies identified","Open to psychological input"] },
      { id:"ps_yellow_flags",label:"Yellow Flag Screening",             type:"multicheck", options:["Belief pain is harmful / damaging","Fear of activity / movement","Catastrophising","Low mood / depression","Work dissatisfaction / conflict","Compensation / litigation active","Poor social support","Passive coping — waiting to be fixed","Prior chronic pain episode","Maladaptive pain beliefs","Somatisation of stress","Hypervigilance to symptoms","Poor sleep contributing to pain","Unhelpful advice from previous clinician","Multiple failed treatments (suggests psychosocial driver)","Poor self-efficacy for recovery"] },
      { id:"ps_notes",      label:"Psychosocial Notes",                 type:"textarea", placeholder:"Psychosocial assessment — attitude, beliefs, emotional factors" },
    ]
  },

  past_medical: {
    label:"Past Medical History", icon:"📋", color:"#ff6b6b",
    fields:[
      { id:"pmh_conditions", label:"Medical Conditions",                type:"multicheck", options:["Type 1 Diabetes","Type 2 Diabetes","Hypertension","Cardiac disease — IHD","Cardiac disease — heart failure","Cardiac disease — arrhythmia","Previous MI (heart attack)","Previous stroke / TIA","Peripheral vascular disease","DVT / pulmonary embolism","Asthma","COPD","Chronic kidney disease","Liver disease","Autoimmune — Rheumatoid Arthritis","Autoimmune — Lupus (SLE)","Autoimmune — Ankylosing Spondylitis","Autoimmune — Psoriatic Arthritis","Osteoarthritis","Osteoporosis / Osteopenia","Gout","Fibromyalgia","Chronic Fatigue Syndrome (ME/CFS)","IBS / IBD","GORD / acid reflux","Epilepsy","Multiple Sclerosis","Parkinson's Disease","Peripheral neuropathy","Hypothyroidism","Hyperthyroidism","Obesity","Malignancy — current or past","HIV","Hepatitis B / C","Mental health condition (see psychosocial)","Haemophilia / bleeding disorder","Anaemia","Eating disorder — history","Chronic pain condition — previous"] },
      { id:"pmh_pregnancy",  label:"Pregnancy / Gynaecological",        type:"multicheck", options:["Not applicable","Currently pregnant","Post-partum < 6 months","Post-partum 6–12 months","Multiple pregnancies","C-section history","Pelvic floor dysfunction","Diastasis recti","Menopause — peri","Menopause — post","Endometriosis","PCOS","Hormonal therapy (HRT)","Oral contraceptive pill"] },
      { id:"pmh_fractures",  label:"Fractures / Trauma History",        type:"multicheck", options:["No significant fractures","Cervical spine fracture","Thoracic spine fracture","Lumbar spine fracture","Coccyx fracture","Pelvic fracture","Hip fracture","Femur fracture","Tibial/fibular fracture","Foot fractures","Shoulder / clavicle fracture","Humerus fracture","Radius/ulna fracture","Wrist fracture","Hand/finger fractures","Rib fractures","Sternal fracture","Multiple fractures — trauma","Stress fractures — history","Growth plate injury (paediatric)"] },
      { id:"pmh_neuro",      label:"Neurological History",              type:"multicheck", options:["No neurological history","Disc herniation — cervical","Disc herniation — lumbar","Spinal stenosis — cervical","Spinal stenosis — lumbar","Spondylolisthesis","Spondylolysis","Cauda equina — history","Myelopathy — cervical","Radiculopathy — previous episode","Carpal tunnel syndrome — history","Cubital tunnel syndrome","Ulnar nerve neuropathy","Common peroneal nerve injury","Sciatic nerve injury","Brachial plexus injury","Thoracic outlet syndrome","Meralgia paraesthetica"] },
      { id:"pmh_other",      label:"Other Relevant History",            type:"textarea", placeholder:"Any other relevant past medical conditions, hospitalisations" },
    ]
  },

  surgical: {
    label:"Surgical History", icon:"🏥", color:"#ff8c42",
    fields:[
      { id:"surg_spine",    label:"Spinal Surgery",                     type:"multicheck", options:["No spinal surgery","Cervical discectomy","Cervical fusion (ACDF)","Lumbar microdiscectomy","Lumbar laminectomy","Lumbar decompression","Lumbar fusion (TLIF/PLIF/ALIF)","Lumbar fusion — multiple levels","Scoliosis correction — spinal rods","Disc replacement — cervical","Disc replacement — lumbar","Coccygectomy","Spinal cord stimulator implant"] },
      { id:"surg_lower",    label:"Lower Limb Surgery",                 type:"multicheck", options:["No lower limb surgery","Hip replacement (THR) — left","Hip replacement (THR) — right","Hip resurfacing","Hip arthroscopy — FAI surgery","Hip arthroscopy — labral repair","Knee replacement (TKR) — left","Knee replacement (TKR) — right","ACL reconstruction — left","ACL reconstruction — right","PCL reconstruction","Meniscectomy — partial","Meniscal repair","Knee arthroscopy","Patellofemoral realignment","OATS / cartilage repair (knee)","Ankle ligament reconstruction","Ankle arthroscopy","Ankle fusion","Achilles repair","Plantar fascia surgery","Foot surgery — bunion (hallux valgus)","Foot surgery — other","Tibial osteotomy"] },
      { id:"surg_upper",    label:"Upper Limb Surgery",                 type:"multicheck", options:["No upper limb surgery","Shoulder replacement (TSR)","Shoulder arthroscopy — subacromial","Shoulder arthroscopy — SLAP repair","Shoulder arthroscopy — Bankart","Rotator cuff repair — partial","Rotator cuff repair — full thickness","AC joint surgery","Clavicle ORIF","Shoulder fusion","Elbow arthroscopy","Elbow replacement","Tennis elbow surgery","Ulnar nerve transposition","Carpal tunnel release — left","Carpal tunnel release — right","Dupuytren's contracture release","De Quervain's surgery","Wrist arthroscopy","Wrist fusion","TFCC repair","Hand surgery","Trigger finger release"] },
      { id:"surg_abdominal",label:"Abdominal / Pelvic Surgery",        type:"multicheck", options:["No abdominal surgery","Appendectomy","Caesarean section","Hysterectomy","Laparoscopic surgery (general)","Bowel surgery","Colostomy","Hernia repair — inguinal","Hernia repair — umbilical","Hernia repair — hiatus","Prostatectomy","Bladder surgery","Kidney surgery","Gallbladder removal (cholecystectomy)","Liver surgery","Splenectomy","Bariatric surgery"] },
      { id:"surg_other",    label:"Other Surgery",                      type:"multicheck", options:["No other surgery","General anaesthetic — other","Cardiac surgery","Thoracic surgery","Neurosurgery — brain","ENT surgery","Eye surgery","Dental surgery — major","Skin graft","Amputation","Trauma surgery — ORIF","Tumour excision"] },
      { id:"surg_complications",label:"Surgical Complications",        type:"multicheck", options:["No complications","Wound infection","DVT post-surgery","Pulmonary embolism post-surgery","Nerve damage intra-operative","Implant failure","Hardware removal required","Revision surgery required","Prolonged rehabilitation","Pain persisting post-surgery","Unexpected outcome","Re-admission post-surgery"] },
      { id:"surg_notes",    label:"Surgical History Notes",            type:"textarea", placeholder:"Dates, outcomes, complications, ongoing effects of surgery" },
    ]
  },

  medications: {
    label:"Medication History", icon:"💊", color:"#80deea",
    fields:[
      { id:"med_analgesia",  label:"Current Analgesia",                 type:"multicheck", options:["No analgesia currently","Paracetamol — PRN","Paracetamol — regular","Ibuprofen — PRN","Ibuprofen — regular","Naproxen","Diclofenac (oral)","Diclofenac (topical — Voltarol)","Celecoxib (COX-2 inhibitor)","Codeine","Co-codamol (paracetamol + codeine)","Tramadol","Morphine (oral)","Oxycodone","Gabapentin","Pregabalin (Lyrica)","Amitriptyline (pain)","Duloxetine","Capsaicin topical","Lidocaine patches","Aspirin (analgesia)","Compound analgesics"] },
      { id:"med_injections", label:"Recent / Past Injections",          type:"multicheck", options:["No injections","Corticosteroid injection < 3 months","Corticosteroid injection 3–12 months","Multiple steroid injections — same site","Hyaluronic acid (viscosupplementation)","PRP (platelet-rich plasma)","Prolotherapy","Trigger point injection","Epidural steroid injection","Selective nerve root block","Facet joint injection","SIJ injection","Botox injection (muscle)","Radiofrequency ablation","Medial branch block"] },
      { id:"med_regular",    label:"Regular Medications (non-pain)",    type:"multicheck", options:["Antihypertensives","Beta blockers","ACE inhibitors","Statins (cholesterol)","Anticoagulants — warfarin","Anticoagulants — DOAC (rivaroxaban/apixaban)","Antiplatelet — aspirin","Antiplatelet — clopidogrel","Antidiabetics — oral","Insulin","Thyroid medication","SSRIs / antidepressants","SNRIs","Benzodiazepines","Sleeping tablets","Immunosuppressants","DMARDs (methotrexate/sulfasalazine)","Biologics (adalimumab/etanercept)","Oral corticosteroids","Hormone therapy (HRT)","Oral contraceptive pill","Bisphosphonates (osteoporosis)","Proton pump inhibitors (PPI)","Inhalers — SABA / LABA / ICS","Anticonvulsants"] },
      { id:"med_allergies",  label:"Drug Allergies / Intolerances",    type:"multicheck", options:["No known drug allergies","Penicillin allergy","NSAIDs — GI intolerance","NSAIDs — allergy/anaphylaxis","Aspirin intolerance","Codeine — side effects","Tramadol — intolerance","Morphine — intolerance","Latex allergy (relevant for treatment)","Iodine allergy","Nickel allergy (relevant for TENS/treatment)","Other — see notes"] },
      { id:"med_supplements",label:"Supplements / Herbal / OTC",       type:"multicheck", options:["No supplements","Vitamin D","Calcium","Magnesium","Fish oil / Omega 3","Glucosamine","Chondroitin","Turmeric / curcumin","CBD oil","Protein supplements","Multivitamin","Iron","Vitamin B12","Folic acid","Melatonin (sleep)","Herbal remedies (specify in notes)","Cannabis — medicinal","Cannabis — recreational"] },
      { id:"med_effectiveness",label:"Medication Effectiveness",       type:"multicheck", options:["Medication well controlled","Medication partially helps","Medication not effective","Side effects limiting use","Too sedating to function","Constipation from opioids","GI side effects from NSAIDs","Stopped medication — side effects","Wants to reduce medication","Currently weaning","No medication for this condition"] },
      { id:"med_notes",      label:"Medication Notes",                 type:"textarea", placeholder:"Any other relevant medication information, recent changes" },
    ]
  },

  red_flags: {
    label:"Red Flag Screening", icon:"🚨", color:"#ff4d6d",
    fields:[
      { id:"rf_malignancy",  label:"Malignancy Red Flags",              type:"multicheck", options:["No malignancy red flags","History of cancer — specify in notes","Unexplained weight loss > 5kg","Night sweats — unexplained","Fever accompanying pain","Fatigue — severe and unexplained","Pain unrelated to movement or position","Pain progressive despite rest","Age > 50 — first episode back pain","Bilateral sciatic symptoms","Pain not responding to any treatment","Supraclavicular lymphadenopathy","Axillary lymphadenopathy","Palpable mass in region of pain"] },
      { id:"rf_cauda",       label:"Cauda Equina Red Flags",            type:"multicheck", options:["No cauda equina flags","Bladder retention — acute","Bladder incontinence — new","Bowel incontinence — new","Saddle anaesthesia — perianal","Saddle anaesthesia — inner thigh","Sexual dysfunction — new onset","Bilateral leg weakness — sudden","Bilateral leg numbness — sudden","Bilateral sciatica","Rapid neurological deterioration","Progressive lower limb weakness"] },
      { id:"rf_vascular",    label:"Vascular Red Flags",                type:"multicheck", options:["No vascular red flags","Calf pain with walking — claudication","Claudication distance < 200m","Rest pain in leg — not musculoskeletal","Absent peripheral pulses (known)","Severe leg pallor","Non-healing leg ulcer","Aortic aneurysm — known","Pulsatile abdominal mass","Severe sudden-onset headache (thunderclap)","Posterior neck pain with visual changes","Dizziness with neck movement (VBI)"] },
      { id:"rf_inflammatory",label:"Inflammatory / Systemic Red Flags", type:"multicheck", options:["No inflammatory red flags","Morning stiffness > 45 minutes","Age of onset < 40 years","Peripheral joint swelling","Iritis / eye inflammation","Psoriasis","Inflammatory bowel disease","Family history of inflammatory arthritis","Enthesitis (tendon insertion pain)","Pain responds to NSAIDs strongly","Fever with musculoskeletal pain","Recent infection preceding pain","Raised inflammatory markers (known)","Immunosuppressed patient"] },
      { id:"rf_fracture",    label:"Fracture / Bone Red Flags",         type:"multicheck", options:["No fracture red flags","Major trauma (RTA, fall from height)","Minor trauma in osteoporotic patient","Age > 70 — first episode back pain","Long-term steroid use","Known osteoporosis","Point tenderness on bone","Localised night pain on bone","Unexplained pathological fracture","Recent corticosteroid use > 3 months"] },
      { id:"rf_neuro",       label:"Neurological Red Flags",            type:"multicheck", options:["No neurological red flags","Myelopathy signs (bilateral weakness/numbness)","Positive Babinski sign","Hyperreflexia — UMN pattern","Rapidly progressive neurological deficit","Cervical myelopathy symptoms","Bilateral hand weakness","Difficulty walking — ataxia","Falls — unexplained","Dysphagia (swallowing difficulty)","Dysarthria (speech difficulty)","Diplopia (double vision)","Facial numbness / weakness","Sudden severe headache","Altered consciousness"] },
      { id:"rf_other",       label:"Other Red Flags",                   type:"multicheck", options:["IV drug use — risk of discitis","Tuberculosis — risk of Pott's disease","Recent infection — septic arthritis risk","Open wound near joint","Acute severe joint swelling — hot","Immunocompromised — any cause","Transplant recipient","Chronic corticosteroid use","Unexplained systemic symptoms","Patient appears systemically unwell","Clinician clinical gut feeling — refer"] },
      { id:"rf_action",      label:"Red Flag Action Taken",             type:"multicheck", options:["No red flags — proceed with assessment","Red flags noted — monitor","Urgent GP referral made","Emergency A&E referral","Same day orthopaedic referral","Urgent MRI requested","Urgent bloods requested","Liaised with GP","Patient informed","Red flags discussed with patient","Safety netting advice given"] },
      { id:"rf_notes",       label:"Red Flag Notes",                   type:"textarea", placeholder:"Document all red flags and actions taken" },
    ]
  },

  yellow_flags: {
    label:"Yellow Flag Screening", icon:"🟡", color:"#ffb300",
    fields:[
      { id:"yf_beliefs",    label:"Beliefs About Pain",                 type:"multicheck", options:["Believes pain = damage (unhelpful)","Believes rest is the only treatment","Believes cannot recover","Believes activity will cause harm","Believes pain is permanent","Expects worst outcome","Catastrophising — magnification","Catastrophising — rumination","Catastrophising — helplessness","Expects surgery is needed","Believes medication is the only solution","Negative health beliefs generally","Multiple previous diagnoses — confused","Conflicting advice received","Received unhelpful nocebo advice"] },
      { id:"yf_emotions",   label:"Emotional Factors",                  type:"multicheck", options:["No significant emotional factors","Mild anxiety","Moderate anxiety","Severe anxiety","Mild depression","Moderate depression","Severe depression","Anger — at cause of injury","Anger — at healthcare system","Fear of the future","Grief from loss of activity/identity","Emotional distress prominent","PTSD symptoms","Emotional overlay affecting presentation","Crying during consultation","Hypervigilance to symptoms"] },
      { id:"yf_behaviour",  label:"Pain Behaviour",                     type:"multicheck", options:["Appropriate pain behaviour","Exaggerated pain behaviour (not malingering)","Reduced pain behaviour (stoic)","Significant kinesiophobia","Avoidance of all activity","Avoidance of specific activities","Withdrawal from social activities","Overprotection of body part","Excessive checking of symptoms","Seeking excessive investigations","Multiple healthcare providers (shopping)","Distress out of proportion to findings","Significant effort intolerance","Deactivated lifestyle","Significant guarding"] },
      { id:"yf_work",       label:"Workplace Yellow Flags",             type:"multicheck", options:["No workplace yellow flags","Unhappy at work pre-injury","Conflict with employer","Conflict with colleagues","Fear of returning to same job","Believes work is harmful","Compensation claim active","Litigation ongoing","Secondary gain possible","Employer dispute","Lack of job control","Monotonous work","Poor workplace relationships","History of workplace bullying","Job insecurity"] },
      { id:"yf_recovery",   label:"Recovery Expectations",              type:"multicheck", options:["Positive — expects recovery","Uncertain about recovery","Negative — does not expect recovery","Unsure what recovery looks like","Expects to return to full function","Expects permanent restriction","Goal — return to sport","Goal — return to work","Goal — pain reduction only","Goal — not clearly identified","Fear of being a burden","Motivated to participate in treatment","Passive recovery expectation","Has not thought about goals"] },
      { id:"yf_assessment", label:"Psychosocial Assessment Tools",      type:"multicheck", options:["Start Back Screening Tool — low risk","Start Back Screening Tool — medium risk","Start Back Screening Tool — high risk","Örebro Musculoskeletal Pain Questionnaire","Tampa Scale Kinesiophobia","Pain Catastrophising Scale","Hospital Anxiety Depression Scale (HADS)","PHQ-9 Depression Screen","GAD-7 Anxiety Screen","Keele STarT Back Tool","Psychosocial referral made","Psychology onward referral","Pain management programme referral"] },
      { id:"yf_notes",      label:"Yellow Flag Notes",                 type:"textarea", placeholder:"Document psychosocial yellow flags and planned management" },
    ]
  },

  patient_goals: {
    label:"Patient Goals", icon:"🎯", color:"#00c97a",
    fields:[
      { id:"pg_primary",    label:"Primary Patient Goal",               type:"textarea", placeholder:"In the patient's own words — what is the number 1 thing they want to achieve?" },
      { id:"pg_goals",      label:"Specific Goals (select all relevant)",type:"multicheck", options:["Return to full-time work","Return to modified work","Return to specific sport","Return to exercise / gym","Return to running","Return to swimming","Return to cycling","Return to golf","Return to team sport","Return to martial arts","Return to dancing","Return to yoga/Pilates","Walk without pain","Walk further distances","Sleep through the night","Reduce pain medication","Stop pain medication","Independent self-care","Lift/carry children","Drive without pain","Travel without pain","Resume social activities","Resume hobbies","Resume sexual activity","Manage pain long-term","Understand condition","Prevent recurrence","Improve posture","Improve fitness","Improve flexibility","Lose weight","Improve balance","Prevent falls","Avoid surgery","Post-surgical recovery","Improve quality of life generally","Be able to garden","Do housework independently","Reduce healthcare appointments","Self-manage"] },
      { id:"pg_timeline",   label:"Patient's Desired Timeline",         type:"multicheck", options:["Immediate — wants relief now","As soon as possible","< 2 weeks","2–4 weeks","4–6 weeks","6–8 weeks","2–3 months","3–6 months","6–12 months","No specific timeline","Before a specific event (see notes)","Realistic — open to therapist guidance","Unrealistic — needs education"] },
      { id:"pg_values",     label:"What Matters Most to Patient",       type:"multicheck", options:["Being pain free","Being able to work","Being a good parent/carer","Being active and fit","Sports/athletic identity","Independence","Sleep quality","Mental health","Relationships","Social life","Career progression","Financial stability","Faith/religious practice","Avoiding surgery","Not relying on medication","Being in control of health"] },
      { id:"pg_barriers",   label:"Barriers to Achieving Goals",        type:"multicheck", options:["No significant barriers","Pain too high to exercise","Fear of movement / re-injury","Low confidence","Poor health literacy","Lack of time","Work demands","Childcare responsibilities","Carer responsibilities","Financial barriers","Transport to appointments","Language barrier","Low motivation currently","Chronic fatigue","Comorbidities limiting treatment","Social isolation","Lack of support","Poor previous experience with physiotherapy"] },
      { id:"pg_psfs",       label:"PSFS — Activity 1 (0–10)",          type:"text", placeholder:"Activity: [write activity] — Score: 0=unable, 10=normal" },
      { id:"pg_psfs2",      label:"PSFS — Activity 2 (0–10)",          type:"text", placeholder:"Activity: [write activity] — Score:" },
      { id:"pg_psfs3",      label:"PSFS — Activity 3 (0–10)",          type:"text", placeholder:"Activity: [write activity] — Score:" },
      { id:"pg_notes",      label:"Goals Notes",                       type:"textarea", placeholder:"Shared decision-making, agreed goals, clinician comments" },
    ]
  },

};

// ─── SUBJECTIVE MODULE COMPONENT ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// BODY CHART MODULE — Freehand draw-on-body pain mapping
// ═══════════════════════════════════════════════════════════════════════════════

const PAIN_TYPES = [
  { id:"sharp",    label:"Sharp",          color:"#ff4d6d", symbol:"★", dash:[] },
  { id:"dull",     label:"Dull / Ache",    color:"#ffb300", symbol:"●", dash:[] },
  { id:"burning",  label:"Burning",        color:"#ff8c00", symbol:"🔥",dash:[] },
  { id:"numbness", label:"Numbness",       color:"#7f5af0", symbol:"○", dash:[6,4] },
  { id:"pins",     label:"Pins & Needles", color:"#00e5ff", symbol:"✦", dash:[2,4] },
  { id:"stiffness",label:"Stiffness",      color:"#00c97a", symbol:"▲", dash:[8,3] },
  { id:"referred", label:"Referred",       color:"#f97316", symbol:"↝", dash:[12,4] },
  { id:"deep",     label:"Deep / Pressure",color:"#7e6a9a", symbol:"◆", dash:[] },
];

const PAIN_BEHAVIOUR = ["Constant","Intermittent","On movement only","At rest only","Night pain","Morning stiffness","Activity related","Positional"];
const PAIN_SEVERITY  = ["0","1","2","3","4","5","6","7","8","9","10"];
const BRUSH_SIZES    = [6,10,16,24];

const REGION_LABELS_FRONT = [
  {label:"Head",            cx:100, cy:44},
  {label:"Neck",            cx:100, cy:91},
  {label:"Chest (R)",       cx:74,  cy:130},
  {label:"Chest (L)",       cx:126, cy:130},
  {label:"Abdomen",         cx:100, cy:190},
  {label:"Shoulder (R)",    cx:47,  cy:124},
  {label:"Shoulder (L)",    cx:153, cy:124},
  {label:"Upper Arm (R)",   cx:33,  cy:165},
  {label:"Upper Arm (L)",   cx:167, cy:165},
  {label:"Elbow (R)",       cx:30,  cy:204},
  {label:"Elbow (L)",       cx:170, cy:204},
  {label:"Forearm (R)",     cx:26,  cy:238},
  {label:"Forearm (L)",     cx:174, cy:238},
  {label:"Hand (R)",        cx:22,  cy:282},
  {label:"Hand (L)",        cx:178, cy:282},
  {label:"Hip (R)",         cx:68,  cy:244},
  {label:"Hip (L)",         cx:132, cy:244},
  {label:"Thigh (R)",       cx:68,  cy:308},
  {label:"Thigh (L)",       cx:132, cy:308},
  {label:"Knee (R)",        cx:68,  cy:360},
  {label:"Knee (L)",        cx:132, cy:360},
  {label:"Shin (R)",        cx:65,  cy:408},
  {label:"Shin (L)",        cx:135, cy:408},
  {label:"Foot (R)",        cx:62,  cy:454},
  {label:"Foot (L)",        cx:138, cy:454},
];

const REGION_LABELS_BACK = [
  {label:"Occiput",         cx:100, cy:44},
  {label:"Neck (posterior)",cx:100, cy:91},
  {label:"Upper Back (R)",  cx:74,  cy:128},
  {label:"Upper Back (L)",  cx:126, cy:128},
  {label:"Mid Back",        cx:100, cy:180},
  {label:"Low Back",        cx:100, cy:224},
  {label:"Shoulder (R)",    cx:47,  cy:122},
  {label:"Shoulder (L)",    cx:153, cy:122},
  {label:"Upper Arm (R)",   cx:33,  cy:168},
  {label:"Upper Arm (L)",   cx:167, cy:168},
  {label:"Elbow (R)",       cx:29,  cy:206},
  {label:"Elbow (L)",       cx:171, cy:206},
  {label:"Forearm (R)",     cx:24,  cy:238},
  {label:"Forearm (L)",     cx:176, cy:238},
  {label:"Hand (R)",        cx:20,  cy:282},
  {label:"Hand (L)",        cx:180, cy:282},
  {label:"Gluteal (R)",     cx:68,  cy:264},
  {label:"Gluteal (L)",     cx:132, cy:264},
  {label:"Hamstring (R)",   cx:68,  cy:316},
  {label:"Hamstring (L)",   cx:132, cy:316},
  {label:"Popliteal (R)",   cx:66,  cy:360},
  {label:"Popliteal (L)",   cx:134, cy:360},
  {label:"Calf (R)",        cx:64,  cy:408},
  {label:"Calf (L)",        cx:136, cy:408},
  {label:"Heel (R)",        cx:62,  cy:454},
  {label:"Heel (L)",        cx:138, cy:454},
];

const REGION_LABELS_LEFT = [
  {label:"Head",              cx:100, cy:44},
  {label:"Neck (lateral)",    cx:100, cy:91},
  {label:"Shoulder (L)",      cx:60,  cy:118},
  {label:"Upper Arm (L)",     cx:44,  cy:164},
  {label:"Elbow (L)",         cx:38,  cy:204},
  {label:"Forearm (L)",       cx:32,  cy:240},
  {label:"Hand (L)",          cx:26,  cy:280},
  {label:"Chest / Sternum",   cx:100, cy:140},
  {label:"Abdomen",           cx:100, cy:200},
  {label:"Lumbar",            cx:100, cy:230},
  {label:"Hip (L)",           cx:80,  cy:262},
  {label:"Thigh (L)",         cx:86,  cy:316},
  {label:"Knee (L)",          cx:86,  cy:360},
  {label:"Shin / Calf (L)",   cx:84,  cy:408},
  {label:"Foot (L)",          cx:82,  cy:454},
];

const REGION_LABELS_RIGHT = [
  {label:"Head",              cx:100, cy:44},
  {label:"Neck (lateral)",    cx:100, cy:91},
  {label:"Shoulder (R)",      cx:140, cy:118},
  {label:"Upper Arm (R)",     cx:156, cy:164},
  {label:"Elbow (R)",         cx:162, cy:204},
  {label:"Forearm (R)",       cx:168, cy:240},
  {label:"Hand (R)",          cx:174, cy:280},
  {label:"Chest / Sternum",   cx:100, cy:140},
  {label:"Abdomen",           cx:100, cy:200},
  {label:"Lumbar",            cx:100, cy:230},
  {label:"Hip (R)",           cx:120, cy:262},
  {label:"Thigh (R)",         cx:114, cy:316},
  {label:"Knee (R)",          cx:114, cy:360},
  {label:"Shin / Calf (R)",   cx:116, cy:408},
  {label:"Foot (R)",          cx:118, cy:454},
];

function closestRegionLabel(x, y, view) {
  const labels = view === "front" ? REGION_LABELS_FRONT
               : view === "back"  ? REGION_LABELS_BACK
               : view === "left"  ? REGION_LABELS_LEFT
               :                    REGION_LABELS_RIGHT;
  let best = labels[0]; let bestDist = Infinity;
  labels.forEach(r => {
    const d = Math.hypot(r.cx - x, r.cy - y);
    if (d < bestDist) { bestDist = d; best = r; }
  });
  return best.label;
}

function drawStroke(ctx, stroke) {
  if (!stroke.points || stroke.points.length < 1) return;
  const pt = PAIN_TYPES.find(p => p.id === stroke.type);
  ctx.save();
  ctx.strokeStyle = pt ? pt.color : "#ff4d6d";
  ctx.lineWidth   = stroke.size || 10;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.globalAlpha = stroke.type === "numbness" ? 0.5 : 0.72;
  if (pt && pt.dash && pt.dash.length) ctx.setLineDash(pt.dash);
  else ctx.setLineDash([]);
  ctx.beginPath();
  if (stroke.points.length === 1) {
    ctx.arc(stroke.points[0].x, stroke.points[0].y, (stroke.size||10)/2, 0, Math.PI*2);
    ctx.fillStyle = pt ? pt.color : "#ff4d6d";
    ctx.globalAlpha = 0.72;
    ctx.fill();
  } else {
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const mx = (stroke.points[i].x + stroke.points[i+1].x) / 2;
      const my = (stroke.points[i].y + stroke.points[i+1].y) / 2;
      ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, mx, my);
    }
    const last = stroke.points[stroke.points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
  ctx.restore();
}

function redrawCanvas(ctx, strokes, w, h) {
  ctx.clearRect(0, 0, w, h);
  strokes.forEach(s => drawStroke(ctx, s));
}

// Anatomical body silhouette — clean SVG paths
function BodySilhouette({ view }) {
  const front = view === "front";
  const isLateral = view === "left" || view === "right";
  const mirrorX = view === "right";

  // ── LATERAL SILHOUETTE ────────────────────────────────────────────────────
  if (isLateral) {
    const flip = mirrorX ? "scale(-1,1) translate(-200,0)" : "";
    return (
      <svg viewBox="0 0 200 480" width="200" height="480"
        style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}>
        <g transform={flip}>
          {/* Head */}
          <ellipse cx="100" cy="44" rx="28" ry="34" fill="#0d1929" stroke="#253d5a" strokeWidth="1.2"/>
          {/* Ear */}
          <ellipse cx="74" cy="44" rx="5" ry="8" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          {/* Nose bump */}
          <path d="M128,38 Q136,44 128,50" fill="none" stroke="#253d5a" strokeWidth="1"/>
          {/* Neck */}
          <rect x="90" y="77" width="18" height="22" rx="4" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          {/* Torso */}
          <path d="M82,99 L68,108 L64,230 L88,240 L112,240 L130,108 L118,99Z"
            fill="#0d1929" stroke="#253d5a" strokeWidth="1.2"/>
          {/* Chest curve */}
          <path d="M130,108 Q140,140 136,170" fill="none" stroke="#1e3a56" strokeWidth="0.8"/>
          {/* Abdomen */}
          <path d="M64,230 L62,268 L88,272 L88,240Z" fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>
          <path d="M112,240 L136,272 L112,272Z" fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>
          {/* Arm near side */}
          <path d="M68,108 L52,112 L38,200 L58,204 L72,118Z" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          <ellipse cx="46" cy="204" rx="12" ry="8" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          <path d="M36,202 L28,256 L52,258 L58,204Z" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          <ellipse cx="38" cy="274" rx="11" ry="17" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          {/* Pelvis */}
          <path d="M62,268 L56,284 L88,288 L112,288 L136,284 L136,272 L112,272 L88,272Z"
            fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>
          {/* Thigh */}
          <path d="M60,284 L52,354 L90,356 L90,288Z" fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>
          {/* Knee */}
          <ellipse cx="70" cy="358" rx="20" ry="13" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          {/* Lower leg */}
          <path d="M52,364 L50,434 L88,436 L90,364Z" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          {/* Foot */}
          <path d="M50,434 L42,458 L96,460 L88,436Z" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
          {/* Plumb line */}
          <line x1="100" y1="0" x2="100" y2="480" stroke="#1a3050" strokeWidth="0.6" strokeDasharray="4,6"/>
          {/* View label */}
          <text x="100" y="475" textAnchor="middle" fontSize="7" fill="#2a4060"
            fontWeight="700" letterSpacing="1.5">
            {mirrorX ? "RIGHT LATERAL" : "LEFT LATERAL"}
          </text>
        </g>
      </svg>
    );
  }

  // ── ANTERIOR / POSTERIOR SILHOUETTE ──────────────────────────────────────
  return (
    <svg viewBox="0 0 200 480" width="200" height="480"
      style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}>

      {/* Head */}
      <ellipse cx="100" cy="44" rx="30" ry="34" fill="#0d1929" stroke="#253d5a" strokeWidth="1.2"/>
      {/* Ears */}
      <ellipse cx="70" cy="44" rx="5" ry="8" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      <ellipse cx="130" cy="44" rx="5" ry="8" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      {/* Neck */}
      <rect x="90" y="77" width="20" height="22" rx="4" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>

      {/* Shoulders */}
      <path d={front
        ? "M90,99 Q68,99 55,108 L48,140 L70,148 L88,110Z"
        : "M90,99 Q68,99 54,108 L46,138 L68,146 L88,110Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>
      <path d={front
        ? "M110,99 Q132,99 145,108 L152,140 L130,148 L112,110Z"
        : "M110,99 Q132,99 146,108 L154,138 L132,146 L112,110Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>

      {/* Torso */}
      <path d={front
        ? "M88,99 L70,108 L62,165 L80,168 L88,220 L112,220 L120,168 L138,165 L130,108 L112,99Z"
        : "M88,99 L68,108 L60,162 L80,165 L84,242 L116,242 L120,165 L140,162 L132,108 L112,99Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1.2"/>

      {/* Pelvis */}
      {front
        ? <path d="M80,218 L60,224 L56,268 L90,272 L110,272 L144,268 L140,224 L120,218Z"
            fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>
        : <path d="M84,240 L55,246 L52,280 L90,284 L110,284 L148,280 L145,246 L116,240Z"
            fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>
      }

      {/* Upper arms */}
      <path d={front
        ? "M48,140 L34,140 L24,194 L46,196 L62,150Z"
        : "M46,138 L32,140 L22,194 L44,196 L62,148Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      <path d={front
        ? "M152,140 L166,140 L176,194 L154,196 L138,150Z"
        : "M154,138 L168,140 L178,194 L156,196 L138,148Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>

      {/* Elbows */}
      <ellipse cx={front?35:33} cy="200" rx="12" ry="8" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      <ellipse cx={front?165:167} cy="200" rx="12" ry="8" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>

      {/* Forearms */}
      <path d={front
        ? "M24,196 L18,252 L40,254 L46,198Z"
        : "M22,196 L16,252 L38,254 L44,198Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      <path d={front
        ? "M176,196 L182,252 L160,254 L154,198Z"
        : "M178,196 L184,252 L162,254 L156,198Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>

      {/* Hands */}
      <ellipse cx={front?28:24} cy="278" rx="12" ry="18" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      <ellipse cx={front?172:176} cy="278" rx="12" ry="18" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>

      {/* Thighs */}
      <path d={front
        ? "M60,268 L50,344 L88,348 L90,272Z"
        : "M56,278 L48,346 L84,350 L88,284Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>
      <path d={front
        ? "M140,268 L150,344 L112,348 L110,272Z"
        : "M144,278 L152,346 L116,350 L112,284Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1.1"/>

      {/* Knees */}
      <ellipse cx={front?68:66} cy="358" rx="20" ry="14" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      <ellipse cx={front?132:134} cy="358" rx="20" ry="14" fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>

      {/* Lower legs */}
      <path d={front
        ? "M50,368 L46,434 L84,436 L88,368Z"
        : "M48,368 L44,434 L80,436 L84,368Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      <path d={front
        ? "M150,368 L154,434 L116,436 L112,368Z"
        : "M152,368 L156,434 L120,436 L116,368Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>

      {/* Feet */}
      <path d={front
        ? "M46,434 L36,462 L90,462 L84,436Z"
        : "M44,434 L38,462 L84,462 L80,436Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>
      <path d={front
        ? "M154,434 L164,462 L110,462 L116,436Z"
        : "M156,434 L162,462 L116,462 L120,436Z"}
        fill="#0d1929" stroke="#253d5a" strokeWidth="1"/>

      {/* Midline */}
      <line x1="100" y1="99" x2="100" y2="430" stroke="#1a3050" strokeWidth="0.6" strokeDasharray="4,6"/>

      {/* Front-only: clavicles, sternum */}
      {front && <>
        <line x1="90" y1="99" x2="62" y2="108" stroke="#1e3a56" strokeWidth="0.8"/>
        <line x1="110" y1="99" x2="138" y2="108" stroke="#1e3a56" strokeWidth="0.8"/>
      </>}

      {/* Back-only: scapulae, spine line */}
      {!front && <>
        <path d="M68,110 Q62,126 64,142 Q70,154 78,148 Q84,140 82,124Z"
          fill="none" stroke="#1e3a56" strokeWidth="0.8"/>
        <path d="M132,110 Q138,126 136,142 Q130,154 122,148 Q116,140 118,124Z"
          fill="none" stroke="#1e3a56" strokeWidth="0.8"/>
        <line x1="100" y1="99" x2="100" y2="242" stroke="#1e3a56" strokeWidth="1" strokeDasharray="3,5"/>
      </>}

      {/* View label */}
      <text x="100" y="475" textAnchor="middle" fontSize="7" fill="#2a4060"
        fontWeight="700" letterSpacing="1.5">
        {front ? "ANTERIOR" : "POSTERIOR"}
      </text>
    </svg>
  );
}

function BodyChartModule({ data, set }) {
  const [view,         setView]        = useState("front");
  const [activePain,   setActivePain]  = useState("sharp");
  const [brushSize,    setBrushSize]   = useState(10);
  const [eraseMode,    setEraseMode]   = useState(false);
  const [isDrawing,    setIsDrawing]   = useState(false);
  const [currentStroke,setCurrentStroke] = useState(null);
  const [strokes,      setStrokes]     = useState(() => {
    try { return JSON.parse(data.body_chart_strokes || "[]"); } catch { return []; }
  });
  const [annotations,  setAnnotations] = useState(() => {
    try { return JSON.parse(data.body_chart_annotations || "[]"); } catch { return []; }
  });
  const [selectedStroke, setSelectedStroke] = useState(null);

  const canvasRef = useRef(null);
  const CW = 200; const CH = 480;

  useEffect(() => { set("body_chart_strokes",     JSON.stringify(strokes));     }, [strokes]);
  useEffect(() => { set("body_chart_annotations", JSON.stringify(annotations)); }, [annotations]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    redrawCanvas(ctx, strokes.filter(s => s.view === view), CW, CH);
  }, [strokes, view]);

  const getPoint = useCallback((e) => {
    const canvas = canvasRef.current; if (!canvas) return null;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = CW / rect.width;
    const scaleY = CH / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const pt = getPoint(e); if (!pt) return;
    if (eraseMode) {
      const EPS = 18;
      setStrokes(prev => prev.filter(s => {
        if (s.view !== view) return true;
        return !s.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < EPS);
      }));
      return;
    }
    const stroke = {
      id: Date.now(), type: activePain, size: brushSize, view,
      label: closestRegionLabel(pt.x, pt.y, view),
      timestamp: new Date().toISOString(),
      points: [pt],
    };
    setCurrentStroke(stroke);
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    drawStroke(ctx, stroke);
  }, [eraseMode, activePain, brushSize, view, getPoint]);

  const continueDraw = useCallback((e) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const pt = getPoint(e); if (!pt) return;
    const updated = { ...currentStroke, points: [...currentStroke.points, pt] };
    setCurrentStroke(updated);
    const ctx = canvasRef.current.getContext("2d");
    const pts = updated.points;
    if (pts.length >= 2) {
      const ptype = PAIN_TYPES.find(p => p.id === updated.type);
      ctx.save();
      ctx.strokeStyle = ptype ? ptype.color : "#ff4d6d";
      ctx.lineWidth   = updated.size;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.globalAlpha = updated.type === "numbness" ? 0.5 : 0.72;
      if (ptype && ptype.dash && ptype.dash.length) ctx.setLineDash(ptype.dash);
      else ctx.setLineDash([]);
      ctx.beginPath();
      const prev = pts[pts.length - 2]; const curr = pts[pts.length - 1];
      ctx.moveTo(prev.x, prev.y); ctx.lineTo(curr.x, curr.y);
      ctx.stroke(); ctx.restore();
    }
  }, [isDrawing, currentStroke, getPoint]);

  const endDraw = useCallback((e) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    if (currentStroke.points.length >= 1) setStrokes(prev => [...prev, currentStroke]);
    setCurrentStroke(null); setIsDrawing(false);
  }, [isDrawing, currentStroke]);

  // Native touch event listeners with passive:false to allow preventDefault
  // Placed after all useCallback declarations to avoid temporal dead zone
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const opts = { passive: false };
    canvas.addEventListener("touchstart",  startDraw,    opts);
    canvas.addEventListener("touchmove",   continueDraw, opts);
    canvas.addEventListener("touchend",    endDraw,      opts);
    canvas.addEventListener("touchcancel", endDraw,      opts);
    return () => {
      canvas.removeEventListener("touchstart",  startDraw);
      canvas.removeEventListener("touchmove",   continueDraw);
      canvas.removeEventListener("touchend",    endDraw);
      canvas.removeEventListener("touchcancel", endDraw);
    };
  }, [startDraw, continueDraw, endDraw]);

  const updateAnnotation = (strokeId, field, val) => {
    setAnnotations(prev => {
      const ex = prev.find(a => a.strokeId === strokeId);
      if (ex) return prev.map(a => a.strokeId === strokeId ? {...a,[field]:val} : a);
      return [...prev, {strokeId, severity:"5", behaviour:[], notes:"", [field]:val}];
    });
  };

  const toggleBehaviour = (strokeId, beh) => {
    setAnnotations(prev => {
      const ann = prev.find(a => a.strokeId === strokeId) || {strokeId, severity:"5", behaviour:[], notes:""};
      const list = ann.behaviour || [];
      const upd  = list.includes(beh) ? list.filter(b=>b!==beh) : [...list,beh];
      const ex   = prev.find(a => a.strokeId === strokeId);
      if (ex) return prev.map(a => a.strokeId === strokeId ? {...a,behaviour:upd} : a);
      return [...prev, {...ann, behaviour:upd}];
    });
  };

  const removeStroke = (id) => {
    setStrokes(p => p.filter(s => s.id !== id));
    setAnnotations(p => p.filter(a => a.strokeId !== id));
    if (selectedStroke === id) setSelectedStroke(null);
  };

  const viewStrokes  = strokes.filter(s => s.view === view);
  const activeType   = PAIN_TYPES.find(p => p.id === activePain);
  const selStroke    = strokes.find(s => s.id === selectedStroke);
  const selAnn       = annotations.find(a => a.strokeId === selectedStroke) || {};
  const inp = {width:"100%",background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:8,color:"#1a1025",fontFamily:"inherit",outline:"none",padding:"7px 10px",fontSize:"0.74rem"};

  return (
    <div>
      {/* Header */}
      <div style={{background:"rgba(255,77,109,0.07)",border:"1px solid rgba(255,77,109,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:"1.4rem"}}>🖊</span>
        <div>
          <div style={{fontWeight:800,color:"#ff4d6d",fontSize:"0.95rem"}}>Body Chart — Freehand Pain Map</div>
          <div style={{fontSize:"0.7rem",color:"#7e6a9a"}}>Draw directly on the body — paint pain exactly where the patient feels it</div>
        </div>
        {strokes.length > 0 && (
          <span style={{marginLeft:"auto",padding:"2px 9px",borderRadius:10,background:"rgba(255,77,109,0.15)",color:"#ff4d6d",fontSize:"0.62rem",fontWeight:800,border:"1px solid rgba(255,77,109,0.3)"}}>
            {strokes.length} stroke{strokes.length!==1?"s":""}
          </span>
        )}
      </div>

      {/* View toggle */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5,marginBottom:10,background:"#ffffff",borderRadius:10,padding:4,border:"1px solid #d8cce8"}}>
        {[["front","⬆ Front"],["back","⬇ Back"],["left","◀ Left"],["right","▶ Right"]].map(([v,label])=>(
          <button key={v} onClick={()=>{setView(v);setSelectedStroke(null);}}
            style={{padding:"8px",borderRadius:7,fontWeight:view===v?800:600,fontSize:"0.72rem",border:`1px solid ${view===v?"rgba(255,77,109,0.4)":"transparent"}`,background:view===v?"rgba(255,77,109,0.12)":"transparent",color:view===v?"#ff4d6d":"#6b8399",cursor:"pointer"}}>
            {label}
          </button>
        ))}
      </div>

      {/* Pain type selector */}
      <div style={{marginBottom:10}}>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Pain Type to Draw</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {PAIN_TYPES.map(pt=>(
            <button key={pt.id} onClick={()=>{setActivePain(pt.id);setEraseMode(false);}}
              style={{padding:"5px 10px",borderRadius:8,fontSize:"0.65rem",fontWeight:activePain===pt.id&&!eraseMode?800:500,border:`1px solid ${activePain===pt.id&&!eraseMode?pt.color+"80":"#1a2d45"}`,background:activePain===pt.id&&!eraseMode?`${pt.color}18`:"transparent",color:activePain===pt.id&&!eraseMode?pt.color:"#7e6a9a",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              <span>{pt.symbol}</span>{pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brush + tool row */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <span style={{fontSize:"0.6rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"1px"}}>Brush:</span>
        {BRUSH_SIZES.map(sz=>(
          <button key={sz} onClick={()=>{setBrushSize(sz);setEraseMode(false);}}
            style={{width:sz+16,height:sz+16,borderRadius:"50%",border:`2px solid ${brushSize===sz&&!eraseMode?(activeType?.color+"80"):"#1a2d45"}`,background:brushSize===sz&&!eraseMode?`${activeType?.color}20`:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:sz*0.55,height:sz*0.55,borderRadius:"50%",background:brushSize===sz&&!eraseMode?(activeType?.color||"#ff4d6d"):"#2a4060"}}/>
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          <button onClick={()=>setEraseMode(e=>!e)}
            style={{padding:"5px 12px",borderRadius:8,fontSize:"0.65rem",fontWeight:700,border:`1px solid ${eraseMode?"#ffb300":"#1a2d45"}`,background:eraseMode?"rgba(255,179,0,0.12)":"transparent",color:eraseMode?"#ffb300":"#6b8399",cursor:"pointer"}}>
            {eraseMode?"✏️ Draw":"🧹 Erase"}
          </button>
          <button onClick={()=>{setStrokes(p=>p.filter(s=>s.view!==view));setSelectedStroke(null);}}
            style={{padding:"5px 10px",borderRadius:8,fontSize:"0.65rem",fontWeight:700,border:"1px solid rgba(255,77,109,0.3)",background:"rgba(255,77,109,0.06)",color:"#ff4d6d",cursor:"pointer"}}>
            Clear View
          </button>
        </div>
      </div>

      {/* Canvas + side panel */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:14,touchAction:"none"}}>
        {/* Drawing area */}
        <div style={{flex:"0 0 auto",position:"relative",background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:12,overflow:"hidden",touchAction:"none",userSelect:"none"}}>
          <div style={{position:"relative",width:200,height:480,touchAction:"none"}}>
            <BodySilhouette view={view}/>
            <canvas ref={canvasRef} width={CW} height={CH}
              style={{position:"absolute",top:0,left:0,cursor:eraseMode?"cell":"crosshair",touchAction:"none",zIndex:2}}
              onMouseDown={startDraw} onMouseMove={continueDraw}
              onMouseUp={endDraw}    onMouseLeave={endDraw}
              />
            {/* Midpoint dots for selection */}
            <svg style={{position:"absolute",top:0,left:0}} width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`}>
              {viewStrokes.map(s=>{
                const ptype = PAIN_TYPES.find(p=>p.id===s.type);
                const mid = s.points[Math.floor(s.points.length/2)] || s.points[0];
                const isSel = selectedStroke===s.id;
                return mid ? (
                  <g key={s.id} style={{cursor:"pointer"}}
                    onClick={e=>{e.stopPropagation();setSelectedStroke(isSel?null:s.id);}}>
                    <circle cx={mid.x} cy={mid.y} r={isSel?9:6}
                      fill={ptype?ptype.color:"#ff4d6d"} fillOpacity={isSel?0.95:0.65}
                      stroke={isSel?"#ffffff":"transparent"} strokeWidth="1.5"/>
                    <text x={mid.x} y={mid.y+1} textAnchor="middle" dominantBaseline="middle"
                      fontSize="7" fill="#000" fontWeight="900"
                      style={{userSelect:"none",pointerEvents:"none"}}>
                      {ptype?ptype.symbol:""}
                    </text>
                  </g>
                ):null;
              })}
            </svg>
          </div>
          {/* Status bar */}
          <div style={{padding:"5px 9px",borderTop:"1px solid #d8cce8",display:"flex",alignItems:"center",gap:6,background:"#f5f0fb"}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:eraseMode?"#ffb300":(activeType?.color||"#ff4d6d")}}/>
            <span style={{fontSize:"0.58rem",color:"#7e6a9a",fontWeight:700}}>
              {eraseMode?"Erase mode":`${activeType?.symbol} ${activeType?.label} · ${brushSize}px`}
            </span>
          </div>
        </div>

        {/* Right panel */}
        <div style={{flex:"1 1 220px",minWidth:180,display:"flex",flexDirection:"column",gap:8}}>
          {viewStrokes.length===0?(
            <div style={{padding:"24px 14px",textAlign:"center",background:"#ffffff",border:"1px dashed #1a2d45",borderRadius:12}}>
              <div style={{fontSize:"2rem",marginBottom:8}}>🖊</div>
              <div style={{fontSize:"0.72rem",color:"#7e6a9a",lineHeight:1.65}}>
                Select a pain type above<br/>then <strong style={{color:"#1a1025"}}>draw directly</strong><br/>on the body diagram.<br/>
                <span style={{fontSize:"0.62rem",color:"#3a5070"}}>Tap the dot mid-stroke to annotate.</span>
              </div>
            </div>
          ):(
            <div>
              <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>
                Drawn Areas — {view}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:220,overflowY:"auto"}}>
                {[...viewStrokes].reverse().map(s=>{
                  const ptype = PAIN_TYPES.find(p=>p.id===s.type);
                  const ann   = annotations.find(a=>a.strokeId===s.id)||{};
                  const isSel = selectedStroke===s.id;
                  return (
                    <div key={s.id} onClick={()=>setSelectedStroke(isSel?null:s.id)}
                      style={{padding:"7px 10px",borderRadius:9,cursor:"pointer",background:isSel?"#f5f0fb":"rgba(255,255,255,0.02)",border:`1px solid ${isSel?(ptype?.color+"60"):"#1a2d45"}`,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:22,height:22,borderRadius:6,flexShrink:0,background:`${ptype?.color}20`,border:`1.5px solid ${ptype?.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem"}}>
                        {ptype?.symbol}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:"0.72rem",fontWeight:700,color:"#1a1025",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</div>
                        <div style={{fontSize:"0.6rem",color:ptype?.color}}>{ptype?.label}{ann.severity?` · NRS ${ann.severity}/10`:""}</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();removeStroke(s.id);}}
                        style={{background:"none",border:"none",color:"#ff4d6d",cursor:"pointer",fontSize:"0.65rem",padding:"2px 4px",flexShrink:0}}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Annotation panel */}
          {selStroke&&(
            <div style={{background:"#ffffff",border:`1px solid ${(PAIN_TYPES.find(p=>p.id===selStroke.type)?.color||"#ff4d6d")+"40"}`,borderRadius:12,padding:"11px 12px"}}>
              <div style={{fontSize:"0.62rem",fontWeight:700,color:PAIN_TYPES.find(p=>p.id===selStroke.type)?.color,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
                📝 {selStroke.label}
              </div>
              {/* NRS */}
              <div style={{marginBottom:9}}>
                <div style={{fontSize:"0.58rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:5}}>NRS Severity (0–10)</div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                  {PAIN_SEVERITY.map(s=>{
                    const ptype=PAIN_TYPES.find(p=>p.id===selStroke.type);
                    const isSel=(selAnn.severity||"5")===s;
                    return <button key={s} onClick={()=>updateAnnotation(selStroke.id,"severity",s)}
                      style={{width:26,height:26,borderRadius:6,fontSize:"0.65rem",fontWeight:isSel?800:500,border:`1px solid ${isSel?ptype?.color+"80":"#1a2d45"}`,background:isSel?`${ptype?.color}20`:"transparent",color:isSel?ptype?.color:"#7e6a9a",cursor:"pointer"}}>{s}</button>;
                  })}
                </div>
              </div>
              {/* Behaviour */}
              <div style={{marginBottom:9}}>
                <div style={{fontSize:"0.58rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:5}}>Behaviour</div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                  {PAIN_BEHAVIOUR.map(b=>{
                    const sel=(selAnn.behaviour||[]).includes(b);
                    return <button key={b} onClick={()=>toggleBehaviour(selStroke.id,b)}
                      style={{padding:"3px 7px",borderRadius:7,fontSize:"0.58rem",fontWeight:sel?700:400,border:`1px solid ${sel?"rgba(0,229,255,0.4)":"#1a2d45"}`,background:sel?"rgba(0,229,255,0.1)":"transparent",color:sel?"#00e5ff":"#6b8399",cursor:"pointer"}}>{b}</button>;
                  })}
                </div>
              </div>
              {/* Notes */}
              <div>
                <div style={{fontSize:"0.58rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:5}}>Clinical Notes</div>
                <textarea value={selAnn.notes||""} onChange={e=>updateAnnotation(selStroke.id,"notes",e.target.value)}
                  placeholder="Quality, onset, triggers, radiation..." rows={3}
                  style={{...inp,resize:"vertical"}}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full summary */}
      {strokes.length>0&&(
        <div style={{background:"#ffffff",border:"1px solid #d8cce8",borderRadius:12,padding:"13px",marginBottom:12}}>
          <div style={{fontSize:"0.62rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>📋 Full Body Chart Summary</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:6}}>
            {strokes.map(s=>{
              const ptype=PAIN_TYPES.find(p=>p.id===s.type);
              const ann=annotations.find(a=>a.strokeId===s.id)||{};
              const sev=+(ann.severity||5);
              const sevCol=sev<=3?"#00c97a":sev<=6?"#ffb300":"#ff4d6d";
              return (
                <div key={s.id} style={{background:"#f5f0fb",border:`1px solid ${ptype?.color}25`,borderRadius:9,padding:"8px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                    <span style={{fontSize:"0.85rem"}}>{ptype?.symbol}</span>
                    <span style={{fontSize:"0.68rem",fontWeight:700,color:"#1a1025",flex:1}}>{s.label}</span>
                    {ann.severity&&<span style={{fontSize:"0.68rem",fontWeight:800,color:sevCol}}>{ann.severity}/10</span>}
                  </div>
                  <div style={{fontSize:"0.6rem",color:ptype?.color,fontWeight:600,marginBottom:2}}>{ptype?.label} · {s.view}</div>
                  {(ann.behaviour||[]).length>0&&<div style={{fontSize:"0.58rem",color:"#7e6a9a"}}>{ann.behaviour.join(", ")}</div>}
                  {ann.notes&&<div style={{fontSize:"0.6rem",color:"#7e6a9a",marginTop:3,fontStyle:"italic"}}>{ann.notes}</div>}
                </div>
              );
            })}
          </div>
          <button onClick={()=>{setStrokes([]);setAnnotations([]);setSelectedStroke(null);}}
            style={{marginTop:10,padding:"6px 14px",background:"rgba(255,77,109,0.08)",border:"1px solid rgba(255,77,109,0.25)",borderRadius:7,color:"#ff4d6d",fontSize:"0.65rem",fontWeight:700,cursor:"pointer"}}>
            🗑 Clear All
          </button>
        </div>
      )}

      <div style={{padding:"7px 11px",background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:8,fontSize:"0.6rem",color:"#7e6a9a",lineHeight:1.5}}>
        💡 <strong style={{color:"#1a1025"}}>Draw</strong> freely over the body to mark pain. Each colour = pain type. Tap the coloured dot to annotate severity, behaviour &amp; notes. Use <strong style={{color:"#1a1025"}}>Erase</strong> to remove near a tap. Works on touchscreen.
      </div>
    </div>
  );
}



export { CyriaxModule, BodyChartModule };
