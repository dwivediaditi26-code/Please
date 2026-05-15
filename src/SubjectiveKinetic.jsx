import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { C, getC } from './theme.jsx';

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
const NKT_REGIONS = {
  cervical:{
    label:"Cervical / Head & Neck", color:"#00e5ff",
    intro:"The cervical NKT assessment identifies which muscles the Motor Control Centre (MCC) has inhibited in the neck and head region, and which synergists are compensating. Common compensation: DNF inhibited → SCM/scalenes overactive → forward head posture, headache, TMJ.",
    tests:[
      {
        id:"nkt_dnf", label:"Deep Neck Flexors (DNF)", muscle:"Longus colli / Longus capitis",
        compensator:"SCM, scalenes, suboccipitals",
        how:"Patient supine. Place pressure biofeedback cuff at neck (inflate to 20mmHg baseline). Ask patient to gently nod chin (craniocervical flexion — NOT a chin tuck). Gradually increase target pressure from 22 → 24 → 26 → 28 → 30mmHg holding each 10 seconds. Confirm by touching SCM during test — if SCM fires early or dominates, DNF is inhibited.",
        options:[
          { val:"Facilitated", color:"#00c97a", meaning:"DNF activates before SCM. Patient can reach 28–30mmHg without SCM firing. Normal motor control. No NKT treatment needed for DNF." },
          { val:"Inhibited", color:"#ff4d6d", meaning:"DNF cannot maintain pressure targets. SCM fires early and dominates. MCC has turned off DNF — forward head is maintained by SCM/scalenes. TREAT: release SCM/scalenes → activate DNF immediately." },
          { val:"Overactive", color:"#ffb300", meaning:"Rare. DNF may be overworking due to inhibition elsewhere (e.g. longus colli compensating for atlas instability). Presents as anterior neck pain with no relief from flexion." },
        ],
        treatment:"Release: SCM (pressure/massage) + scalenes (SMR). Activate: chin nod 10 reps × 3 sets. Home: tongue to roof of mouth posture drill. Reprogram MCC within 30 seconds of release.",
      },
      {
        id:"nkt_scm", label:"Sternocleidomastoid (SCM)", muscle:"SCM",
        compensator:"When overactive: compensating for inhibited DNF or contralateral upper trap",
        how:"Patient supine. Therapist palpates SCM (finger on muscle belly, sternal and clavicular heads). Ask patient to flex neck against resistance. SCM should only assist — if it fires hard and first, it is overactive. Therapy localization: touch SCM belly → re-test DNF. If DNF suddenly stronger = SCM is the overactive compensator.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"SCM assists neck flexion appropriately. Normal recruitment. Not compensating." },
          { val:"Overactive — compensating for DNF", color:"#ff4d6d", meaning:"SCM fires before DNF and dominates flexion. Confirmed by therapy localization. TREAT: release SCM → activate DNF. Patient often has forward head, headache, TMJ symptoms." },
          { val:"Overactive — compensating for upper trap", color:"#ffb300", meaning:"SCM overactive contralaterally to compensate for ipsilateral upper trap inhibition. Causes head tilt and rotation asymmetry." },
          { val:"Bilateral overactive", color:"#7f5af0", meaning:"Both SCMs overactive — typically compensating for inhibited core/diaphragm. Patient often has forward head with breathing dysfunction." },
        ],
        treatment:"Release: light pressure massage on SCM belly for 60–90 sec. Stretch: gentle lateral flexion opposite side. Then immediately activate: DNF chin nods. Never aggressively stretch an overactive SCM without activating DNF first.",
      },
      {
        id:"nkt_suboccip", label:"Suboccipital Muscles", muscle:"Rectus capitis posterior / Obliquus capitis",
        compensator:"When overactive: compensating for inhibited DNF or cervical flexors",
        how:"Patient prone or supine. Palpate suboccipital triangle (base of skull). Apply gentle pressure while patient slowly nods chin. Suboccipitals should relax with DNF activation. If they remain hard or increase in tone — overactive. Test: place finger on suboccipitals → re-test DNF → if DNF stronger, suboccipitals are compensating.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"Suboccipitals relax when DNF activates. Normal reciprocal inhibition. No compensation pattern." },
          { val:"Overactive — DNF compensation", color:"#ff4d6d", meaning:"Suboccipitals are hard and tender. Maintain atlas extension. Patient has upper cervical pain, base of skull headache, dizziness, and restricted C0–C1 mobility. TREAT: suboccipital release → DNF activation." },
          { val:"Overactive — eye muscle compensation", color:"#ffb300", meaning:"Suboccipitals overactive due to visual compensation. Follows eye movement dysfunction. Ask patient to look in directions — if symptoms change, visual/vestibular system involved." },
        ],
        treatment:"Release: suboccipital decompression (therapist fingers under occiput, sustained gentle traction 2–3 min). Dry needling to suboccipitals if acute. Then activate DNF. Refer for eye/vestibular assessment if visual pattern present.",
      },
      {
        id:"nkt_upper_trap", label:"Upper Trapezius", muscle:"Upper trapezius / Levator scapulae",
        compensator:"When overactive: compensating for inhibited lower trapezius or DNF",
        how:"Patient seated. Therapist palpates upper trapezius (upper shoulder, fibres between neck and acromion). Apply gentle downward pressure on shoulder (shrug resistance). If upper trap fires immediately and forcefully with minimal load = overactive. Therapy localization: touch upper trap → re-test lower trapezius. If lower trap suddenly stronger = upper trap compensating for lower trap inhibition.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Upper trap fires proportionally with lower and middle trap. No shoulder elevation at rest or with light load." },
          { val:"Overactive — lower trap inhibition", color:"#ff4d6d", meaning:"Upper trap fires excessively. Shoulder visibly elevated at rest. Lower trap tests weak. TREAT: release upper trap → activate lower trap immediately. Common in desk workers, impingement." },
          { val:"Overactive — DNF inhibition", color:"#ffb300", meaning:"Upper trap overactive as distant compensation for cervical instability. Touching upper trap improves DNF test. Release upper trap → activate DNF." },
          { val:"Overactive — breathing dysfunction", color:"#7f5af0", meaning:"Upper trap overactive as accessory breathing muscle. Patient breathes into upper chest. Release upper trap + retrain diaphragmatic breathing." },
        ],
        treatment:"Release: SMR upper trap (tennis ball or foam roller). Massage: cross-fibre across fibres. Stretch: lateral neck stretch (ear to opposite shoulder). Then immediately activate lower trapezius: prone Y-exercise. Home: shoulder blade drops × 20 throughout day.",
      },
      {
        id:"nkt_scalenes", label:"Scalenes", muscle:"Anterior / Middle / Posterior scalenes",
        compensator:"When overactive: compensating for inhibited DNF, or thoracic outlet contributors",
        how:"Patient supine. Palpate scalenes (lateral neck, between SCM and levator). Ask patient to breathe in deeply — scalenes should only fire at end-range of inhalation. If they fire early in breathing = overactive as accessory breathers. Test resisted cervical side flexion — if scalenes are disproportionately active vs DNF = compensation. Therapy localization: touch scalenes → re-test DNF.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"Scalenes activate only at end of deep inhalation. Appropriately assist cervical side flexion. No thoracic outlet symptoms." },
          { val:"Overactive — DNF inhibition", color:"#ff4d6d", meaning:"Scalenes fire early in breathing and dominate lateral neck. Patient has anterior neck tightness, thoracic outlet symptoms (arm tingling). TREAT: release scalenes → activate DNF." },
          { val:"Overactive — rib 1 elevation", color:"#ffb300", meaning:"Scalenes elevated first rib — thoracic outlet narrowed. Adson's test may be positive. Needs rib 1 mobilisation + scalene release." },
          { val:"Bilateral overactive — breathing pattern", color:"#7f5af0", meaning:"Both scalenes overactive as primary breathers (thoracic breathing pattern). Diaphragm inhibited. TREAT: release scalenes → diaphragmatic breathing retraining." },
        ],
        treatment:"Release: gentle scalene massage (patient supine, head rotated away, fingertip pressure on scalene belly 90 sec). Stretch: cervical extension + rotation + side flex away. Activate: diaphragmatic breathing (hand on belly, breathe in 4 sec, out 6 sec). Avoid aggressive scalene stretching without diaphragm retraining.",
      },
      { id:"nkt_levator_scap", label:"Levator Scapulae", muscle:"Levator scapulae",
        compensator:"When overactive: compensating for inhibited lower trap or DNF",
        how:"Patient seated. Palpate levator scapulae (posterior-lateral neck, C1–C4 to superior medial scapular angle). Apply firm pressure while patient attempts cervical rotation away from palpated side. POSITIVE OVERACTIVITY: muscle contracts forcefully and holds tension during scapular elevation. Therapy localization: touch levator → re-test lower trap. If lower trap suddenly stronger = levator compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Levator scapulae assists cervical side flexion and scapular elevation proportionally. Not dominant during shoulder tasks. No neck-shoulder pain with lifting." },
          { val:"Overactive — lower trap inhibition", color:"#ff4d6d", meaning:"Levator overactive elevating medial scapular angle. Lower trap inhibited. Persistent neck-shoulder pain, restricted cervical rotation. TREAT: release levator → activate lower trap." },
          { val:"Overactive — cervical instability", color:"#ffb300", meaning:"Levator overactive as cervical stabiliser when DNF inhibited. C3/C4 facet compression, restricted ipsilateral rotation. Release levator → activate DNF." },
        ],
        treatment:"Release: lacrosse ball to posterior-lateral neck 60–90 sec. Stretch: chin to opposite armpit. Activate: lower trap Y-lifts immediately. Home: scapular depression exercises × 20 reps.",
      },
      { id:"nkt_splenius", label:"Splenius Capitis / Cervicis", muscle:"Splenius capitis / Splenius cervicis",
        compensator:"When overactive: compensating for inhibited cervical flexors",
        how:"Patient prone or seated. Palpate splenius capitis (C7-T3 spinous → mastoid/occiput) and splenius cervicis (to C2/C3 transverse processes). Ask patient to extend and ipsilaterally rotate head against light resistance. POSITIVE OVERACTIVITY: fires excessively, maintains resting tone. Therapy localization: touch splenius → re-test DNF.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"Splenius contributes proportionally to cervical extension and ipsilateral rotation. No excessive resting tone." },
          { val:"Overactive — unilateral", color:"#ffb300", meaning:"Unilateral overactivity: ipsilateral rotation bias, restricted contralateral rotation, ipsilateral headache to orbit. TREAT: release unilateral splenius → activate DNF." },
          { val:"Overactive — bilateral", color:"#ff4d6d", meaning:"Bilateral overactivity forces cervical hyperextension and suboccipital compression. TREAT: release bilateral splenius → activate DNF." },
        ],
        treatment:"Release: fingertip pressure to splenius belly 60 sec each side. Cervical flexion stretch. Activate: DNF chin nods immediately. Home: gentle cervical flexion ROM × 10 reps.",
      },
      { id:"nkt_semispinalis", label:"Semispinalis Capitis / Cervicis", muscle:"Semispinalis capitis / cervicis",
        compensator:"When overactive: compensating for inhibited deep cervical stabilisers",
        how:"Patient prone. Palpate semispinalis (posterior neck between spinous processes and mastoid — deep to upper trap, superficial to multifidus). Ask patient to extend head against gentle resistance. POSITIVE OVERACTIVITY: palpable firmness at rest, neck extension ROM excessive relative to flexor strength. Therapy localization: touch semispinalis → re-test DNF.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"Semispinalis contributes to cervical extension and bilateral contralateral rotation. Balanced with DNF. No posterior neck tension at rest." },
          { val:"Overactive — DNF inhibition", color:"#ff4d6d", meaning:"Semispinalis overactive producing posterior cervical tension and compression. Suboccipital headache, C-spine stiffness, restricted flexion. TREAT: release semispinalis → activate DNF." },
          { val:"Overactive — thoracic kyphosis compensation", color:"#ffb300", meaning:"Semispinalis hyperextending cervical spine to correct for thoracic kyphosis. Extended cervical posture despite thoracic flexion. Address thoracic extension mobility first." },
        ],
        treatment:"Release: slow sustained pressure along posterior cervical paraspinals 60–90 sec. Activate: DNF chin nods. Address thoracic posture with foam roller extension if kyphosis is driver.",
      },
    ]
  },

  shoulder:{
    label:"Shoulder & Scapula", color:"#7f5af0",
    intro:"Shoulder NKT identifies which rotator cuff and scapular muscles are inhibited, and which are compensating. Classic patterns: lower trap inhibited → upper trap overactive | serratus inhibited → pec minor overactive | RC inhibited → biceps/pec major overactive.",
    tests:[
      {
        id:"nkt_lower_trap", label:"Lower Trapezius", muscle:"Lower trapezius",
        compensator:"When inhibited: upper trapezius, levator scapulae compensate",
        how:"Patient prone, arm abducted 120–135° (Y position). Ask patient to lift arm toward ceiling (shoulder extension in Y). Apply gentle downward resistance at distal humerus. Lower trap should fire to stabilise scapula. POSITIVE INHIBITION = cannot hold position or upper trap/neck fires to compensate. Therapy localization: touch upper trap → re-test lower trap. If lower trap suddenly stronger = upper trap compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Lower trap activates strongly in Y position. Scapula depresses and retracts appropriately. No compensation from upper trap. Normal scapulohumeral rhythm." },
          { val:"Inhibited — mild", color:"#ffb300", meaning:"Lower trap activates but fatigues quickly or upper trap fires simultaneously. Mild compensation. Patient may have intermittent shoulder pain with overhead activities. Begin isolated lower trap activation." },
          { val:"Inhibited — moderate", color:"#ff4d6d", meaning:"Lower trap cannot hold position. Upper trap immediately compensates (shoulder rises). MCC has assigned upper trap as stabiliser. Patient has chronic shoulder/neck pain, impingement pattern. TREAT: release upper trap → activate lower trap." },
          { val:"Inhibited — severe", color:"#7f5af0", meaning:"Lower trap completely inhibited. Cannot perform Y position test. Scapular winging or severe elevation present. Upper trap, levator AND rhomboids all compensating. Multiple release/activate cycles needed." },
        ],
        treatment:"Release overactive: upper trap SMR + levator scapulae massage (60–90 sec each). Activate immediately: prone Y-lifts × 5 reps, wall slide with scapular depression, cable pull-down with scapular depression. Home: doorframe lower trap sets × 20 reps throughout day.",
      },
      {
        id:"nkt_serratus", label:"Serratus Anterior", muscle:"Serratus anterior",
        compensator:"When inhibited: pectoralis minor overactive",
        how:"Patient performs wall push-up. Observe scapular position during push-up plus phase (full protraction at top). If medial border of scapula wings away from thorax = serratus inhibited. Manual test: patient pushes arm into therapist's hand (forward protraction). Apply resistance. POSITIVE INHIBITION = scapula wings or cannot protract against resistance. Therapy localization: touch pec minor → re-test serratus. If serratus stronger = pec minor compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Serratus activates to protract and upwardly rotate scapula. No winging on push-up plus. Scapula hugs thorax throughout arm elevation. Normal scapulohumeral rhythm." },
          { val:"Inhibited — functional winging", color:"#ffb300", meaning:"Serratus inhibited under load but not at rest. Winging appears only with push-up or arm elevation. Pec minor is tight and overactive. Patient has anterior shoulder pain with overhead activities." },
          { val:"Inhibited — resting winging", color:"#ff4d6d", meaning:"Scapular winging visible at rest (medial border away from thorax). Serratus severely inhibited. Pec minor chronically overactive. Long thoracic nerve palsy must be ruled out. TREAT: release pec minor → activate serratus." },
          { val:"Long thoracic nerve palsy", color:"#7f5af0", meaning:"Complete serratus inhibition with severe winging. No voluntary activation possible. Neurological cause — C5/6/7 long thoracic nerve affected. Refer for nerve conduction study. NKT technique may still help partial cases." },
        ],
        treatment:"Release: pec minor (supine, firm pressure at coracoid process to 3rd–5th ribs, 90 sec). Activate: serratus punches (supine, arm at 90°, push fist toward ceiling adding protraction), push-up plus. Home: wall protraction holds × 10 reps, serratus activation in quadruped.",
      },
      {
        id:"nkt_infraspinatus", label:"Infraspinatus / Teres Minor", muscle:"Infraspinatus / Teres minor",
        compensator:"When inhibited: posterior deltoid, biceps compensate",
        how:"Patient seated or sidelying. Elbow at 90°, arm at side. Apply gentle resistance to external rotation. POSITIVE INHIBITION = cannot resist external rotation with adequate force, or posterior deltoid/biceps dominates. Therapy localization: touch posterior deltoid or biceps → re-test IR. If ER suddenly stronger = deltoid/biceps compensating for RC.",
        options:[
          { val:"Facilitated — strong", color:"#00c97a", meaning:"Infraspinatus/teres minor generate adequate ER force at 0° and 90°. No compensation from posterior deltoid. Normal rotator cuff function." },
          { val:"Inhibited — pain inhibition", color:"#ffb300", meaning:"Inhibited due to pain (strong & painful = minor lesion per Cyriax). Pain prevents full activation. Address pain first (DTFM, dry needling) then NKT re-test." },
          { val:"Inhibited — motor control", color:"#ff4d6d", meaning:"ER weak and painless. MCC has inhibited infraspinatus — posterior deltoid compensates for humeral head depression. Patient has shoulder impingement pattern. TREAT: release pec minor/posterior deltoid → activate IR." },
          { val:"Complete inhibition — possible tear", color:"#7f5af0", meaning:"No ER activation possible. Consider structural tear — refer for imaging (MRI/ultrasound). External rotation lag sign likely positive." },
        ],
        treatment:"Release: pec minor + anterior deltoid (both overactive compensators, SMR 60 sec). Dry needling to infraspinatus if trigger points present. Activate: sidelying ER with theraband (light resistance, slow and controlled). Home: doorframe ER isometric × 20 reps.",
      },
      {
        id:"nkt_subscapularis", label:"Subscapularis", muscle:"Subscapularis",
        compensator:"When inhibited: pec major, teres major compensate",
        how:"Patient seated or supine. Elbow 90°, arm at side. Resist internal rotation. Subscapularis is the primary IR and anterior stabiliser. POSITIVE INHIBITION = weak IR or pec major fires to compensate (you can see/feel pec major dominating). Lift-off test: patient places dorsum of hand on low back and lifts it off — cannot = subscapularis inhibited. Belly press test: press hand into abdomen without wrist flexing — cannot = subscapularis inhibited.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Strong IR at 0° and 45°. Can perform lift-off and belly press without compensation. Normal anterior GH stability." },
          { val:"Inhibited — instability pattern", color:"#ffb300", meaning:"IR weak, pec major compensates. Patient has anterior shoulder instability, pain with IR. Apprehension test may be positive. TREAT: release pec major → activate subscapularis." },
          { val:"Inhibited — post-surgical", color:"#ff4d6d", meaning:"Subscapularis inhibited after shoulder surgery (Bankart, SLAP repair, total shoulder). MCC 'switched off' subscapularis due to surgical trauma. Therapy localization confirms. Progressive NKT activation essential for return to function." },
          { val:"Complete inhibition", color:"#7f5af0", meaning:"Cannot perform any IR. Lift-off completely failed. Possible subscapularis tear — refer for imaging. Belly press = wrist flexion to compensate." },
        ],
        treatment:"Release: pec major SMR + anterior deltoid massage. Activate: sidelying IR with theraband, belly press holds, lift-off progression. Home: theraband IR × 20 reps, progress to 90/90 IR.",
      },
      {
        id:"nkt_mid_trap", label:"Middle Trapezius / Rhomboids", muscle:"Middle trapezius / Rhomboids",
        compensator:"When inhibited: levator scapulae, upper trap compensate",
        how:"Patient prone, arm at 90° (T position). Retract and depress scapula while lifting arm. Apply resistance at posterior humerus. POSITIVE INHIBITION = scapula protracts under load, or levator scapulae fires to elevate rather than retract. Therapy localization: touch levator → re-test mid trap. If stronger = levator compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Middle trap retracts scapula strongly without elevation. Scapulae symmetric in prone. Normal retraction strength." },
          { val:"Inhibited — protraction bias", color:"#ffb300", meaning:"Mild weakness. Scapula protracts under resistance. Patient has rounded shoulders but not severe. Levator scapulae partially compensating." },
          { val:"Inhibited — levator dominant", color:"#ff4d6d", meaning:"Scapula elevates instead of retracting under load. Levator fully compensating for mid trap. Patient has upper neck pain and shoulder elevation at rest. TREAT: release levator → activate middle trap." },
        ],
        treatment:"Release: levator scapulae (pressure at superior angle of scapula, 60 sec). SMR upper neck region. Activate: prone T-lifts, seated cable rows with scapular retraction focus. Home: wall angel exercise × 15 reps.",
      },
      { id:"nkt_pec_minor", label:"Pectoralis Minor", muscle:"Pectoralis minor",
        compensator:"When overactive: compensating for inhibited serratus anterior",
        how:"Patient supine. Palpate pec minor at coracoid process (just below and medial to the coracoid tip, between coracoid and 3-5th ribs). Apply firm pressure medially toward ribs. POSITIVE OVERACTIVITY: extreme tenderness, scapular protraction (shoulder rolls forward at rest), restricted scapular retraction. Test: therapist passively retract scapula — if very restricted = pec minor shortened. Therapy localization: touch pec minor → re-test serratus.",
        options:[
          { val:"Normal length and tone", color:"#00c97a", meaning:"Pec minor not tender at rest. Scapula rests neutrally — not protracted. Serratus anterior not inhibited. Full passive scapular retraction available." },
          { val:"Overactive — serratus inhibition", color:"#ff4d6d", meaning:"Pec minor overactive, shortened. Scapular protraction at rest. Serratus inhibited. Patient has anterior shoulder pain, impingement pattern, rounded shoulder posture. TREAT: release pec minor → activate serratus." },
          { val:"Overactive — thoracic outlet", color:"#ffb300", meaning:"Pec minor compressing neurovascular bundle (brachial plexus, subclavian vessels). Arm tingling especially in overhead position. Coracoid hyperalgesic. Release pec minor + neural mobilisation." },
        ],
        treatment:"Release: supine coracoid-to-rib pressure technique 90 sec. Door-stretch pec minor (hand at 90° abduction, lean through doorframe). Activate: serratus punches immediately. Home: pec minor self-release with ball × 2 min daily.",
      },
      { id:"nkt_ant_deltoid", label:"Anterior Deltoid", muscle:"Anterior deltoid",
        compensator:"When overactive: compensating for inhibited rotator cuff (supraspinatus/infraspinatus)",
        how:"Patient seated. Palpate anterior deltoid (anterior shoulder, below clavicle). Resist shoulder flexion at 90°. POSITIVE OVERACTIVITY: anterior deltoid fires powerfully and dominates — palpation reveals hard, tender muscle belly. Humeral head translates anteriorly during shoulder elevation. Therapy localization: touch anterior deltoid → re-test supraspinatus. If supraspinatus stronger = anterior deltoid compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Anterior deltoid assists shoulder flexion proportionally. No anterior humeral head translation. Rotator cuff centring maintained throughout elevation." },
          { val:"Overactive — RC inhibition", color:"#ff4d6d", meaning:"Anterior deltoid dominates shoulder flexion. Humeral head migrates anteriorly/superiorly. Impingement pattern. Patient has anterior shoulder pain on flexion. TREAT: release anterior deltoid → activate infraspinatus/supraspinatus." },
          { val:"Overactive — biceps compensation", color:"#ffb300", meaning:"Anterior deltoid + biceps both overactive as RC compensators. Shoulder flexion with elbow flexion tendency. Bicipital groove tender. Release anterior deltoid + biceps → activate RC." },
        ],
        treatment:"Release: cross-fibre massage to anterior deltoid belly 60 sec. Activate: sidelying ER for infraspinatus. Home: doorframe stretch in neutral rotation.",
      },
      { id:"nkt_post_deltoid", label:"Posterior Deltoid", muscle:"Posterior deltoid",
        compensator:"When overactive: compensating for inhibited infraspinatus / teres minor",
        how:"Patient prone or seated. Palpate posterior deltoid (posterior shoulder). Resist shoulder horizontal abduction (arm at 90° flex, pull backward against resistance). POSITIVE OVERACTIVITY: posterior deltoid fires with disproportionate force relative to infraspinatus. Infraspinatus tests weak. Therapy localization: touch posterior deltoid → re-test infraspinatus ER.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Posterior deltoid assists horizontal abduction proportionally. Infraspinatus/teres minor provide adequate ER. No dominance of posterior deltoid in ER." },
          { val:"Overactive — IR compensation", color:"#ff4d6d", meaning:"Posterior deltoid compensates for inhibited infraspinatus. ER dominated by deltoid not RC. Posterior shoulder tightness. TREAT: release posterior deltoid → activate infraspinatus." },
        ],
        treatment:"Release: cross-fibre massage to posterior deltoid 60 sec. Activate: sidelying ER with theraband (infraspinatus isolation). Home: ER doorframe isometric.",
      },
      { id:"nkt_teres_major", label:"Teres Major", muscle:"Teres major",
        compensator:"When overactive: compensating for inhibited subscapularis or lat dorsi",
        how:"Patient sidelying or prone. Palpate teres major (posterior axillary fold, between inferior angle of scapula and humerus). Apply gentle resistance to internal rotation. POSITIVE OVERACTIVITY: teres major fires powerfully and tenderly. Often confused with lat dorsi. Test: resist shoulder adduction from 90° abduction — if teres major dominates = overactive. Therapy localization: touch teres major → re-test subscapularis.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Teres major assists IR and adduction proportionally. Subscapularis not inhibited. No posterior axillary tension." },
          { val:"Overactive — subscapularis inhibition", color:"#ff4d6d", meaning:"Teres major overactive compensating for subscapularis. Medial rotation with adduction pattern. Posterior axillary fold tight. TREAT: release teres major → activate subscapularis." },
          { val:"Overactive — lat dorsi compensation", color:"#ffb300", meaning:"Teres major + lat dorsi both overactive. Shoulder locked in extension/adduction/IR. Overhead reaching severely restricted. Release both → activate lower trap and serratus." },
        ],
        treatment:"Release: fingertip pressure to teres major belly at posterior axillary fold 60–90 sec. Activate: subscapularis (belly press or IR in neutral). Home: overhead reach stretch with scapular upward rotation cue.",
      },
    ]
  },

  core:{
    label:"Core & Lumbar", color:"#00c97a",
    intro:"Core NKT identifies which deep stabilisers the MCC has inhibited following injury, poor posture, or prolonged sitting. Classic patterns: TA inhibited → erector spinae overactive | multifidus inhibited → superficial back muscles compensate | diaphragm inhibited → accessory breathers (scalenes, SCM) overactive.",
    tests:[
      {
        id:"nkt_ta", label:"Transversus Abdominis (TA)", muscle:"Transversus abdominis",
        compensator:"When inhibited: erector spinae, rectus abdominis compensate",
        how:"Patient supine, knees bent. Ask patient to draw navel gently toward spine WITHOUT holding breath or flattening lumbar spine. Place fingers 2cm medial and inferior to ASIS — feel for gentle tensioning of lower abdomen. If erector spinae fires instead (back arches), or patient holds breath = TA inhibited. Pressure biofeedback (prone): inflate to 70mmHg. Ask to draw in — normal = 4–10mmHg DECREASE. More than 10mmHg decrease = RA compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"TA activates independently with drawing-in manoeuvre. No breath holding. Lumbar spine neutral. Pressure biofeedback shows 4–10mmHg decrease. Core precedes limb movement (normal feedforward activation)." },
          { val:"Inhibited — erector spinae dominant", color:"#ff4d6d", meaning:"TA cannot activate. Erector spinae fires instead (back extends/arches). Patient has chronic LBP pattern. MCC assigned spinal extensors as stabilisers. TREAT: release erector spinae → activate TA. Most common finding in chronic LBP." },
          { val:"Inhibited — breath-holding pattern", color:"#ffb300", meaning:"Patient braces with Valsalva rather than subtle TA activation. Intra-abdominal pressure elevated constantly. TA never activates independently. Indicative of chronic spinal instability fear-avoidance." },
          { val:"Inhibited — RA dominant", color:"#7f5af0", meaning:"Rectus abdominis fires instead of TA. Abdomen protrudes on activation attempt or flattens dramatically. TA completely bypassed. Pressure biofeedback shows >10mmHg decrease. Requires extensive TA isolation practice." },
        ],
        treatment:"Release: erector spinae SMR (foam roll thoracolumbar region, 90 sec each side). Activate: abdominal drawing-in manoeuvre × 10 reps (holding 10 sec), progress to dead bug. Home: TA activation every hour, integrate into all daily movement.",
      },
      {
        id:"nkt_multifidus", label:"Multifidus", muscle:"Multifidus",
        compensator:"When inhibited: superficial erector spinae, QL compensate",
        how:"Patient prone. Palpate paraspinal groove just lateral to spinous processes at L4/L5. Ask patient to gently swell the muscle outward WITHOUT moving the spine or contracting buttocks. If superficial erector fires (hard and broad contraction) instead of local deep swelling = multifidus inhibited. Ultrasound imaging gold standard. Clinical test: observe spine stability during single-leg balance — if excessive spinal movement = multifidus deficit.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Multifidus produces gentle local swelling at palpated level. Segmental stabilisation present. Normal spinal control during limb movements. Rapid re-activation after acute episode." },
          { val:"Inhibited — unilateral", color:"#ffb300", meaning:"Asymmetric multifidus activation. One side inhibited (often side of prior disc herniation or LBP episode). Compensatory erector spinae and QL overactivity on that side. Patient has asymmetric LBP and trunk rotation weakness." },
          { val:"Inhibited — bilateral", color:"#ff4d6d", meaning:"Both sides inhibited. Spinal extensors completely compensating. Patient has chronic, diffuse LBP with poor spinal segmental control. Core exercises targeting global muscles (crunches, deadlifts) worsen the pattern." },
          { val:"Atrophied (post-injury)", color:"#7f5af0", meaning:"Multifidus atrophied after disc herniation or surgery. Atrophy may be visible on MRI. Slow to recover — requires specific activation. NKT therapy localization confirms which superficial muscles are compensating." },
        ],
        treatment:"Release: thoracolumbar erector spinae SMR + QL pressure release. Activate: prone multifidus swelling × 10 sec holds × 10 reps, progress to quadruped arm/leg (bird-dog), then standing. Home: seated multifidus activation throughout day.",
      },
      {
        id:"nkt_diaphragm", label:"Diaphragm", muscle:"Diaphragm",
        compensator:"When inhibited: scalenes, SCM, intercostals compensate as accessory breathers",
        how:"Patient supine or seated. Observe breathing pattern: place one hand on chest, one on abdomen. Normal: abdomen rises first (diaphragm descends). POSITIVE INHIBITION = chest rises first (accessory breathing). Formal test: ask patient to breathe in deeply — if scalenes and SCM fire visibly on normal tidal breathing = diaphragm inhibited. Palpate lateral ribcage — diaphragm should expand ribcage laterally (360°). Therapy localization: touch scalenes → re-test diaphragm activation. If better = scalenes compensating for diaphragm.",
        options:[
          { val:"Normal — diaphragmatic", color:"#00c97a", meaning:"Abdomen rises first. Ribcage expands 360° laterally. Scalenes and SCM only fire on deep inhalation (3rd respiratory phase). Normal breathing pattern. Diaphragm also provides core stability contribution." },
          { val:"Inhibited — thoracic breathing", color:"#ff4d6d", meaning:"Chest rises first. Scalenes and SCM fire on every breath. Diaphragm inhibited — not descending. Patient has chronic neck tightness, upper trap pain, anxiety, and reduced lumbar stability (diaphragm contributes to IAP). TREAT: release scalenes + SCM → activate diaphragmatic breathing." },
          { val:"Inhibited — paradoxical", color:"#7f5af0", meaning:"Abdomen paradoxically moves IN on inhalation (diaphragm not descending, scalenes/accessory muscles pulling chest up only). Significant breathing dysfunction. May indicate phrenic nerve involvement or chronic postural dysfunction." },
          { val:"Inhibited — lateral expansion deficit", color:"#ffb300", meaning:"Some diaphragmatic activation but ribcage does not expand laterally — only rises. Posterior and lateral diaphragm fibres inhibited. Patient has reduced thoracolumbar fascia tension and core stability. Lateral rib expansion breathing retraining required." },
        ],
        treatment:"Release: scalenes + SCM massage (90 sec each). Activate: 360° diaphragmatic breathing (crocodile breathing — prone on floor, breathe into posterior ribcage), lateral rib expansion training. Home: diaphragmatic breathing × 10 breaths before sleep, throughout day. Address anxiety/stress contributing to thoracic breathing.",
      },
      {
        id:"nkt_ql", label:"Quadratus Lumborum (QL)", muscle:"Quadratus lumborum",
        compensator:"When overactive: compensating for inhibited glute med or multifidus",
        how:"Patient sidelying. Palpate between 12th rib and iliac crest (lateral lumbar). Ask patient to hike hip (lateral trunk flexion). Normal: QL fires as hip hiker. Overactive QL: fires excessively when it shouldn't — during hip extension (should be glute max), during abduction (should be glute med). Test: ask for hip extension in prone — if QL fires instead of glute max = QL compensating. Therapy localization: touch QL → re-test glute max or glute med. If glute fires better = QL is compensating.",
        options:[
          { val:"Normal activation", color:"#00c97a", meaning:"QL fires for lateral flexion and as respiratory stabiliser. Does not fire excessively during hip extension or abduction. Normal lumbar side stability." },
          { val:"Overactive — glute max compensation", color:"#ff4d6d", meaning:"QL fires during hip extension instead of glute max. Patient extends hip by tilting pelvis (QL) rather than extending at hip joint. Common LBP pattern. TREAT: release QL → activate glute max immediately." },
          { val:"Overactive — glute med compensation", color:"#ffb300", meaning:"QL hikes hip during walking/running instead of glute med abducting it. Patient has lateral hip pain, IT band syndrome, and Trendelenburg-equivalent pattern with QL dominance. TREAT: release QL → activate glute med." },
          { val:"Overactive — bilateral (LBP pattern)", color:"#7f5af0", meaning:"Both QLs chronically overactive. Patient cannot sit comfortably. Lateral lumbar pain bilateral. Both glute max and glute med inhibited. Multiple compensation layers — treat sequentially." },
        ],
        treatment:"Release: QL SMR (tennis ball at lateral lumbar between rib and iliac crest, 90 sec). Activate: glute max (bridges) immediately after, then glute med (side-lying abduction). Home: avoid crossing legs when sitting (increases QL asymmetry).",
      },
      {
        id:"nkt_psoas", label:"Iliopsoas (Psoas + Iliacus)", muscle:"Iliopsoas",
        compensator:"When overactive: compensating for inhibited glutes/TA; inhibited: rare, usually overactive",
        how:"Patient supine. Apply gentle resistance to hip flexion (hand on distal thigh). Normal: iliopsoas activates smoothly. Test for overactivity: is hip flexion painful or does lumbar spine extend (anterior tilt) during hip flexion? = psoas overactive pulling lumbar into extension. Thomas test: if hip cannot reach table = iliopsoas shortened/overactive. Therapy localization: touch iliopsoas (gentle pressure at inguinal region) → re-test TA or glute max. If stronger = psoas compensating.",
        options:[
          { val:"Normal length and activation", color:"#00c97a", meaning:"Hip flexes without lumbar extension. Thomas test negative. No groin pain. Psoas activates proportionally and does not pull spine forward. Appropriate hip flexion strength for activity level." },
          { val:"Overactive — anterior pelvic tilt", color:"#ff4d6d", meaning:"Psoas pulls lumbar into extension during hip flexion. Thomas test positive (hip remains elevated). Lumbar lordosis increased. Patient has LBP worsened by sitting and hip flexion. TREAT: release psoas → activate TA + glute max." },
          { val:"Overactive — glute inhibition", color:"#ffb300", meaning:"Psoas overactive because glute max is inhibited — psoas must do both flexion and extension stabilisation. Hip snapping (coxa saltans) may be present. Groin pain and anterior hip impingement symptoms." },
          { val:"Inhibited (rare)", color:"#7f5af0", meaning:"Psoas truly inhibited — weak hip flexion in fully shortened range. Rare. May indicate L2/3 nerve root involvement or hip flexor avulsion injury. Confirm with Cyriax resisted test." },
        ],
        treatment:"Release: psoas stretch (kneeling lunge, posterior pelvic tilt), SMR quads/hip flexors. Activate: TA drawing-in, glute bridges with focus on not allowing anterior tilt. Never aggressive psoas stretching without core activation.",
      },
      { id:"nkt_erector_spinae", label:"Erector Spinae", muscle:"Iliocostalis / Longissimus / Spinalis",
        compensator:"When overactive: compensating for inhibited TA, multifidus, or glute max",
        how:"Patient prone. Palpate erector spinae (lateral to spinous processes L1–L5 and thoracic). Ask patient to attempt TA activation (drawing-in) — if erector spinae fire instead of TA = overactive compensation. Test: ask patient to perform hip extension — if lumbar extensors fire before glute max = erector overactive as hip extensor substitute. Note: overactive erectors feel hard and tender at rest. Therapy localization: touch erectors → re-test TA or glute max.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Erector spinae active during lumbar extension tasks only. Not firing during TA activation attempts. Not dominant in hip extension. Normal resting tone." },
          { val:"Overactive — TA inhibition", color:"#ff4d6d", meaning:"Erectors fire during every attempted TA activation. Patient cannot isolate deep stabilisers. Core training is superficial muscle dominant. Chronic LBP pattern. TREAT: release erectors → activate TA immediately." },
          { val:"Overactive — glute max inhibition", color:"#ffb300", meaning:"Erectors fire during hip extension (creating lumbar extension to simulate hip extension). Deadlift and squat form breakdown. Lumbar pain with hip extension movements. TREAT: release erectors → activate glute max." },
          { val:"Overactive — bilateral lumbar spasm", color:"#7f5af0", meaning:"Bilateral erector spasm. Cannot relax lumbar musculature. Acute or chronic spasm pattern. Thoracolumbar fascia under constant tension. Treat: heat + SMR + TA activation in non-provoked positions." },
        ],
        treatment:"Release: foam roller thoracolumbar paraspinals (slow roll T12–L5, 90 sec). SMR with lacrosse ball lateral to spinous processes. Activate: TA drawing-in immediately, progress to bird-dog. Home: TA awareness during all daily movement.",
      },
      { id:"nkt_obliques", label:"Internal / External Obliques", muscle:"Internal oblique / External oblique",
        compensator:"When inhibited: erector spinae and QL compensate for rotation control",
        how:"Patient supine. Test: resist trunk rotation (patient attempts to rotate shoulders — therapist resists at shoulder). Feel and observe: if patient substitutes with hip hiking (QL) or lateral trunk flexion rather than rotation = obliques inhibited. Pallof press test: attach resistance band at side — patient holds band at sternum and resists rotation. If core collapses or rotates = oblique weakness. Therapy localization: touch QL or erectors → re-test anti-rotation strength. If stronger = obliques inhibited.",
        options:[
          { val:"Normal anti-rotation control", color:"#00c97a", meaning:"Obliques generate adequate trunk rotation and anti-rotation force. Pallof press held without collapse. Gait shows appropriate trunk counter-rotation with arm swing. No lateral trunk bending substitution." },
          { val:"Inhibited — rotation substitution", color:"#ff4d6d", meaning:"Obliques cannot resist rotation — QL and erectors substitute. Trunk rotates excessively during single-leg activities. Poor throwing/golf/tennis mechanics. TREAT: release QL → activate obliques (Pallof press, dead bug with rotation)." },
          { val:"Inhibited — post-partum / diastasis recti", color:"#ffb300", meaning:"Obliques inhibited following pregnancy/diastasis recti. Poor linea alba tension. Belly protrudes during sit-up attempts. Oblique activation must be performed without increasing intra-abdominal pressure. TREAT: TA first, then obliques." },
        ],
        treatment:"Release: QL and lateral lumbar SMR. Activate: Pallof press × 10 reps each side, dead bug with rotation, cable woodchops. Home: side plank progression × 3 × 20 sec.",
      },
      { id:"nkt_pelvic_floor", label:"Pelvic Floor", muscle:"Levator ani / Coccygeus / Sphincters",
        compensator:"When inhibited: superficial hip flexors overactive; when overactive: thigh adductors and piriformis co-contract",
        how:"Patient seated or supine. Observe breathing pattern — normal pelvic floor coordinates with diaphragm (descends on inhalation, rises on exhalation). Test: ask patient to gently activate pelvic floor (Kegel) without activating glutes or abductors. OVERACTIVITY: patient is hypervigilant, pain with palpation of inner thigh/perineum, cannot relax floor; INHIBITION: pelvic floor cannot resist Valsalva — stress incontinence. Therapy localization: touch adductors → re-test pelvic floor coordination.",
        options:[
          { val:"Normal coordination with breath", color:"#00c97a", meaning:"Pelvic floor activates and relaxes with breathing cycle. No stress incontinence. No pelvic pain. Coordinates with TA and diaphragm for IAP management." },
          { val:"Inhibited — stress incontinence pattern", color:"#ff4d6d", meaning:"Pelvic floor cannot generate adequate tension. Leakage with cough, jump, or sneeze. Often post-partum or post-pelvic surgery. TREAT: activate TA → coordinate with pelvic floor Kegel. Refer to pelvic physiotherapist." },
          { val:"Overactive — hypertonic pattern", color:"#ffb300", meaning:"Pelvic floor chronically contracted. Cannot relax. Pelvic pain, dyspareunia, tail bone pain. Adductors and piriformis also tight. TREAT: pelvic floor downtraining (relaxation breathing), adductor release." },
        ],
        treatment:"Inhibited: Kegel × 10 reps in coordination with exhalation, integrated TA + pelvic floor activation. Overactive: pelvic floor relaxation in hooklying with diaphragm breathing, adductor stretch, piriformis release. Refer to pelvic floor physiotherapist for complex presentations.",
      },
    ]
  },

  hip:{
    label:"Hip & Pelvis", color:"#f97316",
    intro:"Hip NKT identifies gluteal inhibition and compensation patterns. The most common global pattern: gluteus maximus inhibited → hamstrings and QL overactive → chronic LBP and hamstring strains. Gluteus medius inhibited → TFL and piriformis overactive → IT band, lateral hip pain, and Trendelenburg gait.",
    tests:[
      {
        id:"nkt_gmax", label:"Gluteus Maximus", muscle:"Gluteus maximus",
        compensator:"When inhibited: hamstrings, QL, piriformis compensate",
        how:"Patient prone. Ask for hip extension with knee bent (reduces hamstring contribution). Palpate both gluteus maximus and hamstrings simultaneously. Watch and feel which fires first. Normal: glute fires before hamstring. POSITIVE INHIBITION: hamstring fires first or glute never activates. Therapy localization: place one hand on hamstring and one on QL → re-test glute max contraction. If glute gets firmer with these contacts = confirmed compensation. Single-leg bridge test: patient bridges — if hamstring cramps or QL fires instead of glute = glute max inhibited.",
        options:[
          { val:"Facilitated — fires first", color:"#00c97a", meaning:"Gluteus maximus activates before hamstrings in prone hip extension. Full activation in bridge. No QL firing. Normal hip extension power and lumbar stability. Glute drives force through hip joint appropriately." },
          { val:"Inhibited — hamstring dominant", color:"#ffb300", meaning:"Hamstring fires first or simultaneously with glute. Glute activates late and weakly. Patient often has recurrent hamstring strains and chronic LBP. Hip extension generated by knee flexion (hamstring) not hip joint extension (glute). TREAT: release hamstrings → activate glute max immediately." },
          { val:"Inhibited — QL dominant", color:"#ff4d6d", meaning:"QL fires instead of glute max for hip extension. Patient extends spine (lateral tilt) to create apparent hip extension. Classic LBP pattern. Lateral lumbar pain and poor deadlift/hinge mechanics. TREAT: release QL → activate glute max." },
          { val:"Inhibited — bilateral, severe", color:"#7f5af0", meaning:"Both glutes inhibited. Patient cannot activate glutes in any position. Hamstrings, QL, and erector spinae all compensating. Patient has bilateral LBP, poor single-leg stability, and hip flexion-dominant movement pattern. Multiple-session NKT approach needed." },
        ],
        treatment:"Release: hamstrings SMR (foam roll posterior thigh 90 sec) + QL release (tennis ball lateral lumbar). Activate IMMEDIATELY within 30 seconds: glute bridges × 5 slow reps (focus on feeling glute, not hamstring), clamshells. Home: glute squeeze at top of every step throughout day.",
      },
      {
        id:"nkt_gmed", label:"Gluteus Medius", muscle:"Gluteus medius",
        compensator:"When inhibited: TFL, piriformis, QL compensate",
        how:"Patient sidelying. Hip abduction with slight extension and IR (targets posterior glute med fibres). Apply gentle resistance above knee. Normal: glute med fires. POSITIVE INHIBITION: TFL dominates (patient rolls slightly forward — anterior tilt during abduction) or QL hikes hip instead of abducting. Standing test: Trendelenburg — single-leg stance, observe contralateral pelvis. If drops = glute med inhibited on standing leg. Therapy localization: touch TFL → re-test glute med. If stronger = TFL compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Glute med fires and holds abduction against resistance without pelvic tilt or TFL compensation. Trendelenburg negative. Normal single-leg pelvic stability. Gait shows no hip drop." },
          { val:"Inhibited — TFL dominant", color:"#ffb300", meaning:"TFL fires first — patient rolls into hip flexion during abduction (TFL is hip flexor + abductor). Lateral hip and knee pain. IT band tight. TREAT: release TFL → activate glute med (in slight extension, not flexion, to prevent TFL from dominating)." },
          { val:"Inhibited — piriformis dominant", color:"#ff4d6d", meaning:"Piriformis compensates for glute med — provides ER and abduction. Deep buttock pain. May mimic sciatica. Trendelenburg positive. TREAT: release piriformis → activate glute med." },
          { val:"Inhibited — QL dominant (Trendelenburg)", color:"#7f5af0", meaning:"QL hikes hip instead of glute med abducting it. Lateral trunk lean during gait. Classic Trendelenburg equivalent with trunk sway. Patient compensates by leaning over stance leg. TREAT: release QL → activate glute med." },
        ],
        treatment:"Release: TFL SMR (foam roll lateral hip, 90 sec), piriformis stretch + pressure. Activate: clamshells (slight hip extension, NOT flexion), sidelying hip abduction in extension, monster walks. Home: glute med activation every single-leg stance (standing in queue, brushing teeth).",
      },
      {
        id:"nkt_piriformis", label:"Piriformis", muscle:"Piriformis",
        compensator:"When overactive: compensating for inhibited glute med or glute max",
        how:"Patient prone or sidelying. Palpate piriformis (deep buttock, between PSIS and greater trochanter). If tender to palpation = active trigger points. Test: hip ER in prone — piriformis should contribute but not dominate. Overactivity test: flex hip 60° (piriformis becomes IR when hip flexed) and apply ER resistance — if this reproduces buttock pain = piriformis overactive. FAIR test: patient sidelying, affected side up, hip 60° flex, knee 90° — apply adduction + IR force. Positive = buttock pain. Therapy localization: touch piriformis → re-test glute med or glute max.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Piriformis contributes to ER appropriately. Not tender on palpation. No sciatic symptoms. Activates with hip ER without dominating the movement pattern." },
          { val:"Overactive — glute med compensation", color:"#ffb300", meaning:"Piriformis compensating for inhibited glute med. Deep buttock pain and lateral hip aching. Piriformis tender on palpation. Often causes pseudo-sciatica. TREAT: release piriformis → activate glute med." },
          { val:"Overactive — piriformis syndrome", color:"#ff4d6d", meaning:"Piriformis severely overactive. Compressing sciatic nerve (piriformis syndrome). Sciatica symptoms present (buttock to posterior thigh). SLR may be positive. FAIR test positive. TREAT: release piriformis (careful deep pressure, 90 sec) → activate glute med." },
          { val:"Overactive — glute max compensation", color:"#7f5af0", meaning:"Piriformis compensating for inhibited glute max during hip extension. Patient extends hip with lateral rotation (piriformis) rather than sagittal extension (glute max). Walking pattern shows toe-out on affected side. TREAT: release piriformis → activate glute max." },
        ],
        treatment:"Release: piriformis pressure release (patient prone, therapist elbow into piriformis at posterior hip, sustained 90 sec). Stretch: figure-4 stretch. Activate: glute med clamshells immediately after. Note: never aggressive piriformis stretching if true piriformis syndrome without releasing first.",
      },
      {
        id:"nkt_hip_flex_fo", label:"Hip Extension Firing Order", muscle:"Glute max + Hamstrings + QL + Erectors",
        compensator:"N/A — tests firing sequence",
        how:"Patient prone. Both hands palpating: one on glute max, one on hamstring (or QL or erector). Ask for hip extension slowly from neutral. Count which fires first. Repeat 3 times for reliability. Normal sequence: Glute max fires first → ipsilateral hamstring → contralateral erector → ipsilateral erector. Any deviation = abnormal motor pattern. Also test in single-leg bridge: which fires to lift pelvis?",
        options:[
          { val:"Normal — Glute max fires first", color:"#00c97a", meaning:"Correct motor program. Gluteus maximus initiates hip extension before hamstrings or spinal extensors. MCC has correct motor sequence stored. Low injury risk for hamstrings and lumbar spine." },
          { val:"Abnormal — Hamstring fires first", color:"#ffb300", meaning:"Hamstring dominant hip extension. Glute max delayed or absent. Lumbar spine overloaded. Patient has hamstring strains and LBP. TREAT: release hamstrings → activate glute max → retrain hip extension pattern." },
          { val:"Abnormal — QL fires first", color:"#ff4d6d", meaning:"QL initiates — patient tilts pelvis to extend hip. No true hip extension occurring. Lumbar spine does the work. Chronic LBP pattern. TREAT: release QL → activate glute max → hip hinge retraining." },
          { val:"Abnormal — Erector spinae fires first", color:"#7f5af0", meaning:"Spinal extensors dominate. Patient uses lumbar extension to simulate hip extension. Severe glute and hamstring inhibition. Often seen in persistent LBP with spinal extension fear. TREAT: release erectors → activate TA + glute max simultaneously." },
        ],
        treatment:"Release: whichever muscle fired first (dominant compensator). Activate: glute max in prone isolation. Retrain: hip hinge pattern (Romanian deadlift) focusing on glute-driven extension. Home: glute max squeeze during every hip extension activity.",
      },
    ]
  },

  knee:{
    label:"Knee & Thigh", color:"#00c97a",
    intro:"Knee NKT focuses on the VMO vs VL relationship, hamstring-glute co-activation balance, and popliteus as a forgotten stabiliser. Common patterns: VMO inhibited → VL overactive → PFPS | hamstrings overactive (compensating for glute max) → posterior knee pain.",
    tests:[
      {
        id:"nkt_vmo", label:"Vastus Medialis Oblique (VMO)", muscle:"VMO",
        compensator:"When inhibited: VL (vastus lateralis) overactive → patellar maltracking",
        how:"Patient seated, knee at 30°. Palpate VMO (teardrop shape at medial lower thigh) and VL (lateral thigh) simultaneously. Ask patient to straighten knee slowly. Normal: VMO fires simultaneously or slightly before VL at final 30° of extension. POSITIVE INHIBITION: VL fires first and dominates throughout — VMO barely activates. Also test: terminal knee extension (TKE) — last 10° should activate VMO strongly. If VMO absent = inhibited.",
        options:[
          { val:"VMO facilitated — fires with VL", color:"#00c97a", meaning:"VMO activates with equal or slightly greater force than VL at terminal extension. Patella tracks medially within trochlear groove. No PFPS symptoms with squatting or stairs." },
          { val:"VMO inhibited — VL dominant", color:"#ffb300", meaning:"VL fires before and more strongly than VMO. Patella tracks laterally. Patient has anterior knee pain on stairs, squatting, sitting. IT band and lateral retinaculum tight. TREAT: release VL + IT band → activate VMO (terminal knee extension)." },
          { val:"VMO inhibited — post knee injury/surgery", color:"#ff4d6d", meaning:"VMO inhibited following ACL reconstruction, meniscectomy, or knee trauma. MCC switched off VMO as protective response. Patient has persistent quad weakness post-operatively despite exercise. NKT approach: release VL → activate VMO before quad sets." },
          { val:"VMO inhibited — hip weakness contributor", color:"#7f5af0", meaning:"VMO inhibited as part of valgus chain — glute med inhibited → knee valgus → VMO inhibited. Address glute med first, then VMO. Terminal knee extension + glute med activation simultaneously." },
        ],
        treatment:"Release: VL SMR (foam roll lateral thigh 90 sec) + IT band (roller lateral knee). Activate: terminal knee extension (TKE) with theraband, step-ups focusing on medial knee control. Home: TKE × 20 reps hourly, VMO squeeze at full extension.",
      },
      {
        id:"nkt_hamstrings", label:"Hamstrings", muscle:"Biceps femoris / Semimembranosus / Semitendinosus",
        compensator:"When overactive: compensating for inhibited glute max",
        how:"Patient prone. Test knee flexion resistance at 90°. Palpate hamstring belly. Overactive hamstrings: fire during activities they shouldn't (hip extension, standing). Test: prone hip extension — if hamstring fires before glute max = overactive compensator. Hamstring cramp during bridge = overactive (normal = glute does the work). Biceps femoris vs medial hamstring: test ER vs IR during knee flexion resistance.",
        options:[
          { val:"Normal — glute max dominant in extension", color:"#00c97a", meaning:"Hamstrings contribute to knee flexion appropriately. Do not dominate hip extension. Do not cramp during bridges. Glute max does the majority of hip extension work. No recurrent hamstring strains." },
          { val:"Overactive — glute max inhibition", color:"#ff4d6d", meaning:"Hamstrings overactive as hip extensors. Patient has recurrent hamstring strains (the compensator always gets injured, not the root cause). LBP. Hamstring 'tightness' that doesn't resolve with stretching (NKT rule: overactive muscles feel tight but aren't short). TREAT: release hamstrings → activate glute max." },
          { val:"Biceps femoris overactive — lateral chain", color:"#ffb300", meaning:"Biceps femoris specifically overactive. Lateral hamstring tightness. External rotation of tibia at knee. IT band and lateral knee pain. Often compensating for weak glute med. TREAT: release biceps femoris → activate glute med." },
          { val:"Medial hamstrings overactive — medial chain", color:"#7f5af0", meaning:"Medial hamstrings overactive. Internal tibial rotation. Compensating for inhibited adductors or popliteus. Medial knee pain. TREAT: release medial hamstrings → activate adductors or glute max." },
        ],
        treatment:"Release: foam roll hamstrings (posterior thigh, 90 sec). Stretch only AFTER NKT release (stretching alone won't fix overactive hamstrings). Activate: glute max exercises immediately. Home: glute-dominant bridge practice — feel the glute, not the hamstring.",
      },
      { id:"nkt_adductors", label:"Hip Adductors", muscle:"Adductor magnus / Longus / Brevis / Gracilis",
        compensator:"When overactive: compensating for inhibited glute max or medial hamstrings",
        how:"Patient sidelying (affected side up). Apply gentle resistance to hip adduction (push bottom leg up toward top). Palpate adductor group (medial thigh). POSITIVE OVERACTIVITY: adductors fire hard at rest or dominate hip extension. Test: supine — patient squeezes pillow between knees. If adductors cramp = overactive. Therapy localization: touch adductors → re-test glute max or medial hamstrings.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Adductors contribute to hip adduction and extension (adductor magnus) proportionally. Not dominant in hip extension. Not cramping at rest. Normal inner thigh tension." },
          { val:"Overactive — medial chain", color:"#ff4d6d", meaning:"Adductors overactive causing knee valgus tendency and medial tibial rotation. Medial knee pain. Groin strain risk. Often compensating for glute max. TREAT: release adductors → activate glute max + VMO." },
          { val:"Inhibited — lateral chain dominance", color:"#ffb300", meaning:"Adductors inhibited — TFL and IT band dominate lateral hip. Knee varus tendency. Poor sagittal plane hip control. Weakness in adduction particularly. TREAT: release TFL → activate adductors." },
        ],
        treatment:"Release: adductor SMR (foam roll inner thigh, 90 sec). Activate: glute max bridging with adductor squeeze. Home: side-lying adductor lifts × 15 reps, Copenhagen plank progression.",
      },
      { id:"nkt_tfl", label:"Tensor Fasciae Latae (TFL)", muscle:"Tensor fasciae latae",
        compensator:"When overactive: compensating for inhibited glute med or glute max",
        how:"Patient supine or sidelying. Palpate TFL (lateral hip, between anterior iliac crest and iliotibial band, distal to ASIS). Ask patient to flex, abduct, and IR the hip — TFL does all three. POSITIVE OVERACTIVITY: TFL fires during pure abduction (should be glute med) or is tender and firm at rest. Ober test: patient sidelying, test hip drops to table — cannot adduct past neutral = TFL/IT band tight. Therapy localization: touch TFL → re-test glute med. If glute med activates more = TFL compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"TFL assists hip flexion and IR proportionally. Not dominant in abduction (glute med does that). Ober test: hip adducts past neutral. No lateral hip pain at rest." },
          { val:"Overactive — glute med inhibition", color:"#ff4d6d", meaning:"TFL dominant in abduction. Flexes hip during intended abduction — patient rolls forward. IT band tight (Ober positive). Lateral hip and knee pain. TREAT: release TFL → activate glute med in slight extension (not flexion, prevents TFL re-domination)." },
          { val:"Overactive — IT band syndrome", color:"#ffb300", meaning:"TFL chronically overactive → IT band under chronic tension → iliotibial band syndrome. Lateral knee pain with running. Noble compression test positive. TREAT: TFL SMR + glute max and glute med activation." },
        ],
        treatment:"Release: TFL SMR (foam roll lateral hip between ASIS and greater trochanter, 90 sec). Activate: glute med in slight extension (clamshells). Never stretch TFL alone — activate glute med first. Home: lateral band walks.",
      },
      { id:"nkt_rectus_fem", label:"Rectus Femoris", muscle:"Rectus femoris",
        compensator:"When overactive: compensating for inhibited iliopsoas or VMO",
        how:"Patient prone. Knee flexion passive test: flex knee to end range — if pelvis anteriorly tilts (ASIS lifts) before reaching full knee flexion = rectus femoris overactive/shortened. Ely's test: patient prone, flex knee — if ipsilateral hip rises = RF shortened. Active test: seated — resist knee extension. RF fires powerfully. Compare to VL. Therapy localization: touch RF belly → re-test VMO.",
        options:[
          { val:"Normal length and tone", color:"#00c97a", meaning:"Knee can flex fully prone without pelvis rising. Ely's test negative. RF contributes to knee extension without dominating. Pelvis remains neutral during hip flexion." },
          { val:"Overactive — anterior pelvic tilt", color:"#ff4d6d", meaning:"RF shortened and overactive. Pulls ASIS forward, increasing anterior pelvic tilt. Ely's test positive. LCS pattern contributor. Patient has anterior knee pain and hip flexion tightness. TREAT: release RF → activate glute max + VMO." },
          { val:"Overactive — VMO inhibition", color:"#ffb300", meaning:"RF overactive and dominates terminal knee extension while VMO is inhibited. Patellar tracking laterally. PFPS pattern. TREAT: release RF → activate VMO (terminal knee extension)." },
        ],
        treatment:"Release: RF SMR (foam roll anterior thigh, 90 sec). Stretch: kneeling hip flexor with posterior pelvic tilt. Activate: VMO terminal knee extension immediately. Home: couch stretch × 2 min each side daily.",
      },
      { id:"nkt_popliteus", label:"Popliteus", muscle:"Popliteus",
        compensator:"When inhibited: LCL, posterior capsule overloaded; when overactive: lateral knee pain",
        how:"Patient prone, knee at 90°. Palpate popliteal fossa (posterior knee joint line, medial to biceps femoris). Apply gentle IR of tibia (internal rotation) at 90° flexion — popliteus unlocks knee (screw-home mechanism reversal). POSITIVE INHIBITION: lateral tibial rotation persists during knee flexion initiation (popliteus cannot unlock knee). Positive if posterior-lateral knee pain with resisted IR at 30° flexion. Therapy localization: touch lateral hamstrings → re-test popliteus IR.",
        options:[
          { val:"Normal — unlocks knee smoothly", color:"#00c97a", meaning:"Popliteus IR of tibia during knee flexion initiation smooth and painfree. No lateral knee pain. Normal knee unlocking pattern in gait." },
          { val:"Inhibited — lateral knee instability", color:"#ff4d6d", meaning:"Popliteus cannot IR tibia during knee flexion. Lateral knee instability, especially on rough terrain. 'Joint locking' sensation. TREAT: release biceps femoris → activate popliteus (gentle resisted IR at 30° knee flexion)." },
          { val:"Overactive — posterior-lateral knee pain", color:"#ffb300", meaning:"Popliteus tendinopathy. Pain at posterolateral knee especially downhill walking. Often compensating for LCL laxity or excessive external tibial rotation. Release popliteus → address tibial rotation pattern above." },
        ],
        treatment:"Release: popliteus pressure (posterior-lateral knee, gentle sustained 60 sec). Activate: resisted tibial IR at 30° knee flexion. Home: step-downs with medial knee control cue, lateral ankle stability training.",
      },
    ]
  },

  ankle:{
    label:"Ankle & Foot", color:"#ffb300",
    intro:"Ankle NKT identifies compensation between tibialis anterior/posterior and the peroneals, and the effect of limited dorsiflexion on the kinetic chain. Classic pattern: tibialis anterior inhibited → peroneals overactive → ankle instability. Tibialis posterior inhibited → peroneals + gastroc overactive → progressive flatfoot.",
    tests:[
      {
        id:"nkt_tib_ant", label:"Tibialis Anterior", muscle:"Tibialis anterior",
        compensator:"When inhibited: peroneals + EHL compensate for dorsiflexion",
        how:"Patient seated. Dorsiflex and invert foot against gentle resistance (this isolates tibialis anterior). Palpate belly (anterior shin). Normal: strong activation with dorsiflexion + inversion. POSITIVE INHIBITION: foot everts instead of inverting (peroneal compensation), or EHL fires to dorsiflex instead. Therapy localization: touch peroneus longus belly → re-test tibialis anterior. If stronger = peroneal compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Tibialis anterior fires strongly during dorsiflexion + inversion. No compensation from peroneals. Ankle DF ROM normal. Foot clears during swing phase of gait without hip hiking." },
          { val:"Inhibited — peroneal dominant", color:"#ffb300", meaning:"Peroneus longus/brevis dominate dorsiflexion attempt — foot everts. Patient has ankle instability and recurrent inversion sprains (peroneals overloaded as compensators). TREAT: release peroneals → activate tib ant." },
          { val:"Inhibited — foot drop pattern", color:"#ff4d6d", meaning:"Severe tib ant inhibition — L4 nerve root or peroneal nerve involvement must be excluded. If neurological clear = MCC inhibition. Patient hikes hip to clear foot. TREAT: release peroneals → intensive tib ant activation with neuromuscular electrical stimulation if needed." },
          { val:"Inhibited — shin splint pattern", color:"#7f5af0", meaning:"Tib ant inhibited causing peroneals to overwork → medial tibial stress syndrome (shin splints). Pain along medial tibia. Patient cannot eccentrically control pronation. TREAT: release peroneals → activate tib ant eccentrically." },
        ],
        treatment:"Release: peroneal SMR (roller lateral lower leg from fibular head to ankle, 90 sec). Activate: seated tibialis anterior activation (dorsiflex + invert against theraband). Home: heel walks × 2 minutes daily.",
      },
      {
        id:"nkt_tib_post", label:"Tibialis Posterior", muscle:"Tibialis posterior",
        compensator:"When inhibited: peroneals overactive, foot pronates progressively",
        how:"Patient seated. Plantarflex and invert foot against resistance (plantar inversion isolates tib posterior). Palpate behind medial malleolus. POSITIVE INHIBITION: weak inversion in plantar flexion, or foot cannot resist eversion. Navicular drop test: mark navicular tuberosity in sitting, then standing — drop >10mm = tib post inhibition (arch collapse). Therapy localization: touch peroneals → re-test tib post.",
        options:[
          { val:"Normal — arch maintained", color:"#00c97a", meaning:"Tibialis posterior supports medial arch. Navicular drop <6mm. Strong plantar inversion resistance. No progressive flatfoot. Arch maintained in single-leg stance." },
          { val:"Inhibited — medial arch collapse", color:"#ffb300", meaning:"Tib post weakened. Medial arch collapses. Navicular drop 6–10mm. Early stage adult-acquired flatfoot. Pronation chain activates: tibial IR, knee valgus, anterior pelvic tilt. TREAT: release peroneals → activate tib post (heel raises in inversion)." },
          { val:"Inhibited — progressive flatfoot", color:"#ff4d6d", meaning:"Tib post significantly inhibited or partially ruptured. Navicular drop >10mm. 'Too many toes' sign (>2 toes visible behind heel from behind). Pain medial ankle. Refer for ultrasound/MRI. NKT: release peroneals → activate tib post + intrinsics." },
          { val:"Severely inhibited — tib post dysfunction", color:"#7f5af0", meaning:"Posterior tibial tendon dysfunction. Cannot perform single-leg heel raise. Progressive collapse of medial arch. Refer to orthopaedic/podiatry. Conservative: orthotics + aggressive tib post strengthening + peroneal release." },
        ],
        treatment:"Release: peroneal SMR + gastroc-soleus stretch. Activate: heel raises in slight inversion (on slightly inverted surface), towel scrunches, short foot exercise. Orthotics if severe. Home: short foot exercise × 20 reps, single-leg balance on slight inversion.",
      },
      {
        id:"nkt_gastroc", label:"Gastrocnemius / Soleus", muscle:"Gastroc-soleus complex",
        compensator:"When overactive: compensating for weak glutes or limited ankle DF; restricts kinetic chain",
        how:"Patient prone, knee extended. Test ankle dorsiflexion passively (normal: 20°). Limited DF = gastroc overactive or shortened. Weight-bearing lunge test: patient lunges with foot against wall — knee to wall distance (normal: 10cm from wall). <7cm = gastroc restriction. Test tightness: DF with knee extended (gastroc) vs knee bent (soleus). If DF better with knee bent = gastrocnemius tight. Therapy localization: touch gastroc → re-test tib ant. If better = gastroc compensating.",
        options:[
          { val:"Normal length and tone", color:"#00c97a", meaning:"Ankle DF normal (20°+). Lunge test: knee reaches wall at 10cm. No calf cramping during activity. Kinetic chain not restricted at ankle. Gastroc-soleus contribute to plantar flexion without restricting dorsiflexion." },
          { val:"Overactive — DF restriction", color:"#ffb300", meaning:"Gastroc overactive and shortened. Restricts ankle DF (<15°). Causes compensatory knee valgus, foot pronation, anterior pelvic tilt during squats. TREAT: gastroc SMR → ankle DF mobilisation → squat correction." },
          { val:"Overactive — glute compensation", color:"#ff4d6d", meaning:"Gastroc overactive as kinetic chain compensator for inhibited glutes. Patient pushes through calf during walking/running (calf dominance) rather than glute-driven propulsion. Calf strains common. TREAT: release gastroc → activate glute max." },
          { val:"Overactive — Achilles tendinopathy pattern", color:"#7f5af0", meaning:"Gastroc-soleus chronically overloaded. Tendon cannot tolerate load. Achilles tendinopathy developing or established. NKT: release peroneals + glute max activation (reduce calf load). Eccentric Achilles loading as adjunct." },
        ],
        treatment:"Release: gastroc SMR (foam roll calf from Achilles to popliteal crease, 90 sec). Stretch: straight-leg calf stretch 30 sec × 2. Activate: tib ant + tib post to balance. Home: wall lunge DF stretch × 3 daily, strengthening glutes to reduce calf overload.",
      },
      { id:"nkt_peroneals", label:"Peroneals (Peroneus Longus / Brevis)", muscle:"Peroneus longus / Peroneus brevis",
        compensator:"When overactive: compensating for inhibited tib anterior or tib posterior",
        how:"Patient seated. Evert foot against gentle resistance — peroneals activate. Palpate peroneal belly (lateral lower leg, posterior to fibula). POSITIVE OVERACTIVITY: peroneals fire during dorsiflexion attempt (should be tib ant), foot everts instead of dorsiflexing. Ankle instability with recurrent inversion sprains (peroneals overloaded). Test: therapy localization — touch peroneus longus → re-test tib ant or tib post. If either suddenly stronger = peroneals compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Peroneals activate for eversion and lateral ankle stability only. Do not dominate dorsiflexion. Ankle stable in single-leg stance. No recurrent inversion sprains." },
          { val:"Overactive — tib ant inhibition", color:"#ff4d6d", meaning:"Peroneals overactive compensating for inhibited tib ant. Foot everts during swing phase instead of dorsiflexing. Recurrent ankle sprains (overloaded peroneals fatigue). TREAT: release peroneals → activate tib ant." },
          { val:"Overactive — tib post inhibition", color:"#ffb300", meaning:"Peroneals overactive pulling foot into eversion as arch collapses. Progressive flatfoot. Navicular drop >10mm. Peroneal longus cannot control 1st ray plantar flexion. TREAT: release peroneals → activate tib post + intrinsics." },
        ],
        treatment:"Release: peroneal SMR (roller from fibular head to lateral malleolus, 90 sec). Activate: tib ant (heel walks) or tib post (inversion heel raises) immediately. Home: balance board training for proprioception.",
      },
      { id:"nkt_fhl", label:"Flexor Hallucis Longus (FHL)", muscle:"Flexor hallucis longus",
        compensator:"When inhibited: plantar fascia overloaded; when overactive: hallux impingement",
        how:"Patient supine. Resist great toe flexion (MTP and IP joints) while palpating posterior medial ankle (FHL tendon behind medial malleolus). Normal: strong great toe flexion (= 'toe-off' power). POSITIVE INHIBITION: great toe cannot flex against resistance, or medial arch collapses during single-leg stance. Test: single-leg heel rise — observe great toe grip. No grip = FHL inhibited. Therapy localization: touch FHL tendon → re-test arch stability.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"FHL strong in great toe flexion. Provides windlass mechanism tension during toe-off. Medial arch stable in single-leg stance. Normal push-off during gait." },
          { val:"Inhibited — plantar fascia overload", color:"#ff4d6d", meaning:"FHL inhibited — plantar fascia must provide all longitudinal arch tension. Plantar fasciitis develops. Hallux cannot grip during push-off. TREAT: release plantar fascia → activate FHL (towel scrunches, marble pick-ups)." },
          { val:"Overactive — posterior ankle impingement", color:"#ffb300", meaning:"FHL overactive and tight. Posterior ankle impingement (triggers at extreme plantar flexion or dorsiflexion). Dancer's/footballer's ankle. Tendon snaps medially. Release FHL tendon → joint mobilisation." },
        ],
        treatment:"Release: FHL SMR (gentle pressure behind medial malleolus, 60 sec). Activate: towel scrunches, marble pick-up, single-leg heel rise with great toe contact cue. Home: short foot exercise + great toe floor contact awareness.",
      },
      { id:"nkt_foot_intrinsics", label:"Foot Intrinsic Muscles", muscle:"Lumbricals / Interossei / Abductor hallucis",
        compensator:"When inhibited: plantar fascia and extrinsic toe flexors overloaded",
        how:"Patient seated or standing. Test: ask patient to perform 'short foot exercise' — shorten foot without curling toes (activate intrinsics only). Positive inhibition: patient curls toes (extrinsic flexors compensate) or cannot shorten foot at all. Observe navicular position — if drops >6mm in standing vs seated = intrinsics insufficient. Palpate abductor hallucis (medial arch) — should be palpable and firm in single-leg stance. Therapy localization: touch plantar fascia → re-test intrinsic activation.",
        options:[
          { val:"Normal — short foot achievable", color:"#00c97a", meaning:"Can perform short foot without toe curling. Abductor hallucis palpable and active. Navicular drop <6mm. Arch stable during single-leg stance. Normal toe splaying on ground contact." },
          { val:"Inhibited — arch collapse", color:"#ff4d6d", meaning:"Cannot perform short foot. Toes curl instead. Arch collapses in single-leg stance. Plantar fascia and extrinsic toe flexors overloaded. Pronation cascade up kinetic chain. TREAT: release plantar fascia → activate short foot + abductor hallucis." },
          { val:"Inhibited — bunion / hallux valgus", color:"#ffb300", meaning:"Abductor hallucis inhibited — hallux adducts toward 2nd toe. Bunion forming or established. Intrinsics too weak to maintain medial column alignment. Short foot exercise priority. Consider orthotic support." },
        ],
        treatment:"Release: plantar fascia SMR (golf ball roll under arch, 90 sec). Activate: short foot × 20 reps, abductor hallucis activation (spread toes, especially great toe medially). Home: barefoot training on varied surfaces × 15 min daily.",
      },
    ]
  },

  upper_limb:{
    label:"Elbow, Wrist & Hand", color:"#e879f9",
    intro:"Upper limb NKT identifies motor control dysfunction from elbow to hand. Common patterns: wrist extensor inhibition → wrist flexors overactive (lateral epicondylalgia), biceps overactive compensating for RC inhibition, grip weakness from cervical radiculopathy or motor control inhibition. Per NKT: the elbow and wrist are frequently affected by DISTANT inhibition (cervical, shoulder).",
    tests:[
      { id:"nkt_biceps", label:"Biceps Brachii", muscle:"Biceps brachii (long + short head)",
        compensator:"When overactive: compensating for inhibited RC (supraspinatus/subscapularis)",
        how:"Patient seated, elbow at 90°, forearm supinated. Resist elbow flexion. Palpate biceps belly. POSITIVE OVERACTIVITY: biceps fires powerfully and early in shoulder flexion (should not initiate shoulder movement). Humeral head translates anteriorly with shoulder flexion = biceps compensating for RC. Test: therapy localization — touch biceps → re-test supraspinatus or DNF. If either stronger = biceps compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Biceps contributes to elbow flexion and forearm supination appropriately. Not dominant in shoulder flexion. No anterior shoulder pain on biceps loading." },
          { val:"Overactive — RC inhibition", color:"#ff4d6d", meaning:"Biceps overactive at shoulder, compensating for RC. Anterior shoulder pain especially on overhead activities. Bicipital groove tender. TREAT: release biceps (cross-fibre belly massage) → activate infraspinatus/supraspinatus." },
          { val:"Overactive — shoulder instability", color:"#ffb300", meaning:"Biceps long head overactive attempting to stabilise anterior glenohumeral joint. Usually post-instability or SLAP tear. Treat underlying instability and rotator cuff first." },
        ],
        treatment:"Release: biceps cross-fibre massage 60 sec. Supination stretch (hold elbow extended, pronate forearm gently). Activate: RC exercises (sidelying ER). Home: no aggressive biceps stretching without RC activation.",
      },
      { id:"nkt_triceps", label:"Triceps Brachii", muscle:"Triceps brachii (long / lateral / medial head)",
        compensator:"When inhibited: posterior deltoid and anconeus compensate",
        how:"Patient prone, elbow at 90°. Resist elbow extension (push forearm toward ceiling). Palpate triceps belly. POSITIVE INHIBITION: triceps weak and painless (C7 radiculopathy first); weak and painful (muscle lesion). Positive overactivity: triceps fires during elbow flexion attempts (rare — indicates neurological irritation). Therapy localization: touch posterior deltoid → re-test triceps. If triceps stronger = posterior deltoid compensating.",
        options:[
          { val:"Normal strength — C7 intact", color:"#00c97a", meaning:"Triceps extends elbow strongly against resistance. No C7 dermatomal changes. Normal push-up strength. Posterolateral elbow not painful." },
          { val:"Inhibited — C7 radiculopathy", color:"#ff4d6d", meaning:"Weak and painless triceps = C7 nerve root compression. Check C7 dermatome (middle finger), reflex (triceps jerk). Refer for MRI. Cervical neural mobilisation." },
          { val:"Inhibited — triceps tendinopathy", color:"#ffb300", meaning:"Strong and painful triceps = triceps tendinopathy at olecranon insertion. DTFM to tendon. Eccentric loading. Home: triceps eccentric press-ups." },
        ],
        treatment:"Inhibited (neurological): cervical neural mobilisation, MRI referral, nerve gliding. Inhibited (motor control): release posterior deltoid → activate triceps. Tendinopathy: DTFM, eccentric loading.",
      },
      { id:"nkt_wrist_ext", label:"Wrist Extensors (ECRB / ECRL)", muscle:"Extensor carpi radialis brevis / longus",
        compensator:"When inhibited: wrist flexors overactive — lateral epicondylalgia pattern",
        how:"Patient seated, elbow extended, forearm pronated. Resist wrist extension (dorsiflexion). Palpate ECRB (lateral epicondyle → 3rd metacarpal base). POSITIVE INHIBITION: weak wrist extension, lateral epicondyle tender. Overactivity: wrist extensors chronically tense (keyboard workers) — limit wrist flexion. Test: therapy localization — touch wrist flexors (FCR/FCU) → re-test wrist extensors.",
        options:[
          { val:"Normal strength", color:"#00c97a", meaning:"ECRB/ECRL extend wrist strongly against resistance. No lateral epicondyle pain. Normal grip strength. Full wrist flexion available passively." },
          { val:"Inhibited — lateral epicondylalgia", color:"#ff4d6d", meaning:"Wrist extensors inhibited and painful (lateral epicondylalgia). Wrist flexors overactive as compensators. TREAT: release FCR/FCU (wrist flexor SMR) → activate ECRB (eccentric wrist extension)." },
          { val:"Overactive — repetitive strain", color:"#ffb300", meaning:"Wrist extensors overactive and shortened from repetitive use (typing, gripping). Restrict wrist flexion. Lateral forearm tension. Release wrist extensors (forearm roller SMR) → activate wrist flexors." },
        ],
        treatment:"Release: wrist flexor SMR (forearm roller medial, 60 sec). Activate: eccentric wrist extension × 15 reps (Tyler twist). DTFM to lateral epicondyle if tender. Home: eccentric wrist extension daily.",
      },
      { id:"nkt_wrist_flex", label:"Wrist Flexors (FCR / FCU)", muscle:"Flexor carpi radialis / ulnaris",
        compensator:"When overactive: compensating for inhibited wrist extensors — medial epicondylalgia",
        how:"Patient seated, forearm supinated. Resist wrist flexion. Palpate FCR (medial forearm, between palmaris and pronator teres) and FCU (ulnar wrist). POSITIVE OVERACTIVITY: wrist flexors fire during gripping (expected) but also dominate wrist stabilisation when they should not. Medial epicondyle tender. Test: therapy localization — touch FCU → re-test FCR or ECRB.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Wrist flexors activate for grip and wrist flexion tasks. Not dominant in wrist extension tasks. No medial epicondyle pain at rest." },
          { val:"Overactive — medial epicondylalgia", color:"#ff4d6d", meaning:"Wrist flexors overactive and tender at medial epicondyle. Medial epicondylalgia. TREAT: release wrist flexors (SMR medial forearm) → activate wrist extensors." },
          { val:"Inhibited — grip weakness", color:"#ffb300", meaning:"Wrist flexors inhibited — grip significantly weak. Rule out C8/T1 radiculopathy, cubital tunnel, or carpal tunnel. NKT: release wrist extensors → activate wrist flexors." },
        ],
        treatment:"Release: forearm flexor SMR (medial forearm rolling, 60 sec). DTFM to medial epicondyle if golfer's elbow. Activate: eccentric wrist flexion. Home: forearm stretching + grip strengthening progression.",
      },
      { id:"nkt_pronator", label:"Pronator Teres / Quadratus", muscle:"Pronator teres / Pronator quadratus",
        compensator:"When overactive: restricts supination, compresses median nerve",
        how:"Patient seated, elbow at 90°. Apply resistance to pronation. Palpate pronator teres (medial elbow to mid-radius). POSITIVE OVERACTIVITY: pronator teres dominates and is tender on palpation at medial elbow. Limited passive supination. Median nerve compression symptoms (pronator syndrome). Test: therapy localization — touch pronator teres → re-test biceps supination strength.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Pronation achieved without dominance. Supination full and painless. No median nerve symptoms with sustained forearm tasks." },
          { val:"Overactive — supination restriction", color:"#ff4d6d", meaning:"Pronator teres overactive. Limits supination → wrist extensors compensate → lateral epicondylalgia risk. Common in desk workers. TREAT: release pronator teres → activate supinator + biceps." },
          { val:"Overactive — pronator syndrome", color:"#ffb300", meaning:"Pronator teres compressing median nerve. Forearm aching + hand tingling (thumb, index, middle). Worsens with repetitive pronation. Differentiate from CTS: pronator syndrome worsens with pronation, not wrist flexion. Release + nerve gliding." },
        ],
        treatment:"Release: pronator teres cross-fibre massage at medial elbow 60 sec. Activate: supinator (resisted supination) and biceps immediately. Nerve gliding if compression symptoms. Home: forearm rotation mobility × 20 reps.",
      },
      { id:"nkt_grip", label:"Grip / Hand Intrinsics", muscle:"FDP / FDS / Lumbricals / Interossei",
        compensator:"When inhibited: extrinsic forearm flexors overactive — carpal tunnel risk",
        how:"Patient seated. Use hand dynamometer or clinician resistance for grip strength. Normal: dominant 35–45 kg, non-dominant 30–40 kg. Test intrinsics: ask patient to flex MCP joints while keeping IP joints extended (lumbrical action). If IPs flex instead = lumbricals inhibited, extrinsic flexors dominate. Therapy localization: touch forearm flexors (FDP/FDS) → re-test intrinsic grip.",
        options:[
          { val:"Normal grip strength", color:"#00c97a", meaning:"Normal grip for age/sex. Intrinsics and extrinsics balanced. No hand fatigue with sustained tasks. Normal MCP flexion with IP extension (lumbrical action)." },
          { val:"Inhibited — neurological cause", color:"#ff4d6d", meaning:"Grip weak + dermatomal changes. C8/T1 radiculopathy (ring + little finger weakness) or median nerve (thumb + index). Cubital tunnel or carpal tunnel. Neurological referral + neural mobilisation." },
          { val:"Inhibited — overuse inhibition", color:"#ffb300", meaning:"Grip weak without clear neurological cause. Often follows prolonged gripping tasks (climbers, manual workers). Extrinsic flexors overactive. TREAT: release forearm flexors → activate intrinsics (lumbrical isolation, putty exercises)." },
        ],
        treatment:"Release: forearm flexor SMR, wrist flexor stretch. Activate: intrinsic isolation exercises (lumbrical set, putty pinch). Neural mobilisation if carpal/cubital tunnel suspected. Home: grip strengthening with proper wrist alignment.",
      },
    ]
  },
};

// ─── KINETIC CHAIN REGION DATABASE ───────────────────────────────────────────
const KC_REGIONS = {
  foot_ankle:{
    label:"Foot & Ankle", color:"#ffb300", role:"MOBILITY",
    intro:"The foot and ankle are the first MOBILE link of the lower kinetic chain. Their job is to absorb ground reaction forces and provide adequate dorsiflexion for squatting, running, and stair-climbing. When mobility is lost here, ALL joints above compensate — creating knee valgus, foot pronation, anterior pelvic tilt, and lumbar overload.",
    tests:[
      {
        id:"kc_ankle_df", label:"Weight-Bearing Dorsiflexion — Lunge Test",
        role:"MOBILITY TEST", joint:"Ankle (talocrural)",
        how:"Patient stands facing wall. Place foot 10cm from wall. Lunge knee toward wall keeping heel flat on floor. Measure knee-to-wall distance. If heel lifts before knee reaches wall = restricted. Normal: knee reaches wall at 10cm+ without heel rising. Also test in non-weight-bearing: patient supine, passively dorsiflex ankle — normal 20°+.",
        options:[
          { val:"Normal — ≥10cm / 20°+", color:"#00c97a", meaning:"Adequate dorsiflexion for all functional tasks. Kinetic chain above ankle is not restricted by DF limitation. No compensation patterns driven from ankle." },
          { val:"Mildly restricted — 7–9cm / 15–19°", color:"#ffb300", meaning:"Mild DF limitation. Patient compensates with slight foot pronation, tibial internal rotation, and mild knee valgus during squats/stairs. Gastroc-soleus mildly tight. Begin DF mobility work." },
          { val:"Moderately restricted — 4–6cm / 10–14°", color:"#ff6b35", meaning:"Moderate DF restriction. Significant compensation: foot hyperpronation, knee valgus, anterior pelvic tilt, and lumbar extension during squat. This is a primary driver of knee pain in runners/athletes. Gastroc, soleus, and posterior capsule restricted. Address immediately before lower limb loading." },
          { val:"Severely restricted — <4cm / <10°", color:"#ff4d6d", meaning:"Severe DF restriction. Patient cannot squat without major heel rise. Cannot walk up stairs without trunk compensation. Cascade of dysfunction through entire kinetic chain. May indicate posterior ankle impingement, OA, or old fracture. Talocrural joint mobilisation (Grade III–IV) + intensive soft tissue work essential." },
        ],
        treatment:"Mobilise: talocrural joint (posterior glide of talus, Grade III–IV). Soft tissue: gastroc SMR + soleus SMR + posterior capsule stretch. Exercise: wall lunge drill × 3 min daily, eccentric heel drops, single-leg squat with DF focus. Kinetic chain: once DF improved, reassess knee alignment and foot pronation — they should self-correct.",
        chainEffect:"Restricted ankle DF → heel rises early → foot pronates → tibia internally rotates → knee collapses into valgus → hip internally rotates → femur adducts → pelvis anteriorly tilts → lumbar extends. ONE restriction drives the entire chain.",
      },
      {
        id:"kc_subtalar", label:"Subtalar Joint Mobility — Inversion / Eversion",
        role:"MOBILITY TEST", joint:"Subtalar joint",
        how:"Patient prone or supine. Grasp calcaneus. Move calcaneus into inversion and eversion independently of talocrural joint. Normal: inversion 20°, eversion 10°. Compare sides. Also assess in weight-bearing: observe navicular drop (mark navicular sitting → standing; normal drop <6mm). Rigid subtalar = poor shock absorption. Hypermobile = excessive pronation.",
        options:[
          { val:"Normal — inversion 20° / eversion 10°", color:"#00c97a", meaning:"Subtalar joint mobile and stable. Normal shock absorption. Navicular drop <6mm. Arch height maintained in single-leg stance. No excessive pronation or supination during gait." },
          { val:"Hypomobile — rigid foot", color:"#ffb300", meaning:"Subtalar restricted in both planes. Rigid foot cannot absorb shock — loads transfer to Achilles, plantar fascia, and shin. Patient may have OA, tarsal coalition, or post-fracture stiffness. Poor shock absorption = stress injuries. Mobilise subtalar joint with inversion-eversion glides." },
          { val:"Hypermobile — excessive pronation", color:"#ff4d6d", meaning:"Subtalar excessively mobile — navicular drop >10mm. Medial arch collapses. Tibialis posterior failing to control pronation (inhibited per NKT). Pronation cascade drives tibial IR → knee valgus → hip IR. Strengthen tib posterior + arch intrinsics. Orthotics if severe." },
          { val:"Asymmetric — significant L vs R difference", color:"#7f5af0", meaning:"Side-to-side difference >5° = significant asymmetry in kinetic chain input. The more restricted side will drive ipsilateral compensations. The hypermobile side will drive contralateral trunk compensations. Address the restricted side first." },
        ],
        treatment:"Hypomobile: subtalar mobilisation (inversion-eversion glides, Grade III). Hypermobile: tibialis posterior + FHL + intrinsic foot muscle strengthening, short foot exercise. Orthotics: semi-rigid if navicular drop >10mm. Reassess tib post NKT — almost always inhibited in hypermobile foot.",
        chainEffect:"Rigid foot → poor shock absorption → Achilles overload, shin splints, plantar fasciitis. Hypermobile foot → tibial IR → knee valgus → hip adduction → SI joint asymmetry.",
      },
      {
        id:"kc_great_toe", label:"First MTP Extension — Hallux Mobility",
        role:"MOBILITY TEST", joint:"First MTP joint",
        how:"Patient seated or supine. Passively extend great toe at MTP joint. Normal: 60–70° extension. Test in weight-bearing: windlass test — patient stands on a step, extend great toe and observe arch rise. Also observe during gait push-off: does patient supinate foot to achieve toe-off or roll over lateral border? Restricted = hallux rigidus/limitus.",
        options:[
          { val:"Normal — 60–70° extension", color:"#00c97a", meaning:"Normal hallux dorsiflexion. Windlass mechanism functions — arch rises with toe extension. Patient can achieve full push-off during gait without compensation. No lateral border gait or external rotation of leg." },
          { val:"Mildly restricted — 40–59°", color:"#ffb300", meaning:"Mild hallux limitus. Patient early supinates foot during push-off (avoids hallux loading). Lateral metatarsal overload, peroneal pain, and Achilles overload may result. 1st MTP joint mobilisation required." },
          { val:"Moderately restricted — 20–39°", color:"#ff6b35", meaning:"Moderate hallux limitus. Patient cannot achieve heel-to-toe gait — abducts foot (toe-out gait), extends hip early, or flexes knee to compensate. Cascading: hip flexor overload, anterior knee pain. Bunion (hallux valgus) may be forming." },
          { val:"Severely restricted — <20° / hallux rigidus", color:"#ff4d6d", meaning:"Hallux rigidus. First MTP completely stiff. Patient walks on lateral foot border. Entire gait compensated. Refer for X-ray (OA/osteophytes). Surgical consultation if conservative fails. Conservative: MTP mobilisation, rocker-bottom shoe, sesamoid off-loading." },
        ],
        treatment:"Mobilise: 1st MTP dorsal glide (Grade III–IV). Soft tissue: plantar fascia release, sesamoid mobility. Gait retraining: heel-to-toe pattern with hallux loading. Toe separators at night. Orthotics: Morton's extension if arthritic.",
        chainEffect:"Restricted hallux → compensatory toe-out gait → tibial ER → knee valgus loss of protection → hip IR → LBP from asymmetric loading.",
      },
    ]
  },

  knee:{
    label:"Knee", color:"#ff4d6d", role:"STABILITY",
    intro:"The knee is a STABILITY joint — its job is to transmit force between the mobile ankle and mobile hip without excessive motion. Knee pain is almost always a symptom of failure elsewhere in the kinetic chain — usually restricted ankle dorsiflexion below or restricted hip mobility above. TREAT the cause, not the knee.",
    tests:[
      {
        id:"kc_knee_stability", label:"Knee Valgus Stress Test — Kinetic Chain",
        role:"STABILITY TEST", joint:"Knee",
        how:"Observe patient during: (1) Squat — does knee collapse medially? (2) Single-leg squat — does knee drop inward? (3) Step-down from 20cm box — medial knee drop? (4) Jump landing — bilateral or unilateral. Also: manually valgus stress at 0° and 30° to check MCL integrity separately. Observe: foot pronation, tibial IR, and hip adduction all occurring simultaneously = kinetic chain valgus (not structural).",
        options:[
          { val:"Stable — no valgus in any task", color:"#00c97a", meaning:"Knee maintains alignment through all functional tasks. Kinetic chain above (hip stability) and below (ankle DF, foot position) providing adequate support. No medial knee stress. MCL intact." },
          { val:"Dynamic valgus — functional tasks only", color:"#ffb300", meaning:"Knee collapses inward during squat or single-leg tasks but MCL is structurally intact. Kinetic chain failure: ankle DF limited + glute med inhibited driving valgus. This is the most common pattern in female ACL injuries. TREAT: ankle DF + glute med activation — do NOT focus on knee." },
          { val:"Valgus with hip drop — Trendelenburg pattern", color:"#ff6b35", meaning:"Knee valgus accompanied by contralateral pelvis drop (glute med weakness). Classic kinetic chain valgus from proximal instability. Patient cannot control single-leg stance. Medial compartment overloaded. Strengthen glute med → knee valgus will reduce." },
          { val:"Structural valgus — MCL laxity", color:"#ff4d6d", meaning:"Valgus present at rest and with valgus stress at 0° + 30°. MCL structurally lax. Medial compartment loaded asymmetrically. Refer if significant. NKT: assess VMO activation as it dynamically supports medial knee." },
        ],
        treatment:"Dynamic valgus: ankle DF mobilisation + glute med NKT programme + VMO activation. Jump landing retraining (soft knee, hip back). Structural MCL: bracing, progressive loading, VMO/hamstring strengthening. Kinetic chain correction: address ankle → hip → then knee-specific work.",
        chainEffect:"Restricted ankle DF (below) + inhibited glute med (above) = KNEE is squeezed into valgus by forces from both directions. Treating only the knee will fail.",
      },
      {
        id:"kc_patellar_mobility", label:"Patellar Mobility Test",
        role:"STABILITY TEST", joint:"Patellofemoral",
        how:"Patient supine, knee fully extended and relaxed. Grasp patella with thumb and index finger. Glide medially and laterally — normal: 1–2cm in each direction (approximately 1/4 patella width). Also tilt: lift medial edge of patella — lateral retinaculum tight if cannot lift ≥0°. Crepitus during passive patellar glide = PFPS or chondromalacia.",
        options:[
          { val:"Normal — symmetric glide, no crepitus", color:"#00c97a", meaning:"Patellar tracking within trochlear groove. Lateral retinaculum not restricting. No crepitus. Q-angle normal. VL/VMO balance adequate. No PFPS symptoms." },
          { val:"Laterally biased — tight lateral retinaculum", color:"#ffb300", meaning:"Patella glides less than 1cm medially. Lateral tilt test: cannot lift medial edge. Lateral retinaculum tight — often due to VL overactivity (NKT: VMO inhibited → VL overactive). Patient has PFPS with lateral knee ache, crepitus. TREAT: VL SMR + lateral retinaculum stretching + VMO activation." },
          { val:"Hypermobile — excessive lateral glide", color:"#ff4d6d", meaning:"Patella glides >2cm laterally with minimal resistance. Medial stabilisers (MPFL, VMO) insufficient. Risk of patellar subluxation or dislocation. Quad strengthening in safe range (0–30° for patellar stability), VMO focus, patellar taping." },
          { val:"Crepitus with glide", color:"#7f5af0", meaning:"Grinding/crepitus during patellar glide = cartilage change or chondromalacia patella. May be asymptomatic or painful. If painful and progressive — refer for imaging. Conservative: load management, VMO strengthening, step avoidance in acute phase." },
        ],
        treatment:"Lateral bias: VL foam roll + IT band SMR, lateral retinaculum stretch (McConnell tape medially), VMO terminal knee extension. Hypermobile: VMO strengthening (0–30°), MPFL-protecting brace. Kinetic chain: always address ankle DF and glute med before patellar taping.",
        chainEffect:"VMO inhibited (NKT) → VL overactive → patella laterally displaced → PFPS. ALSO: foot pronation → tibial IR → patella internally rotated → increased lateral patellar stress.",
      },
      {
        id:"kc_tibiofemoral_rot", label:"Tibial Rotation Assessment — Screw-Home Mechanism",
        role:"STABILITY TEST", joint:"Tibiofemoral",
        how:"Patient supine, knee at 90°. Assess passive tibial rotation: grasp foot, rotate tibia internally and externally. Normal: IR 20–30°, ER 30–40°. Assess screw-home: as knee moves from 90° to full extension, tibia should externally rotate automatically (screw-home mechanism locks knee). If not — popliteus may be inhibited. Also test standing: observe tibial rotation during single-leg squat.",
        options:[
          { val:"Normal — screw-home intact, symmetric rotation", color:"#00c97a", meaning:"Tibia normally externally rotates at terminal knee extension (screw-home mechanism). Popliteus and LCL functioning. Symmetric passive tibial rotation bilaterally. Knee locks appropriately in full extension for standing." },
          { val:"Restricted tibial IR — lateral chain tightness", color:"#ffb300", meaning:"Cannot internally rotate tibia adequately. Biceps femoris and IT band restricting IR. Patient toe-out during walking (externally rotated) to avoid tibial IR loading. Lateral knee pain. Release biceps femoris + IT band → improve tibial IR." },
          { val:"Excessive tibial IR — medial chain laxity", color:"#ff6b35", meaning:"Tibia falls into internal rotation easily. Medial structures (MCL, medial capsule) lax. Foot pronation driving tibial IR from below. Glute med weakness allowing hip IR from above. Medial knee overloaded. Strengthen: tib post, VMO, glute med." },
          { val:"Absent screw-home — popliteus dysfunction", color:"#ff4d6d", meaning:"Tibia does not externally rotate at terminal extension. Knee cannot fully lock in extension. Popliteus inhibited or over-lengthened. Patient stands with slight flexion (can't straighten fully). Unlock test positive. Treat popliteus: soft tissue + NKT activation." },
        ],
        treatment:"Restricted IR: biceps femoris + IT band SMR, tibial IR mobility drill. Absent screw-home: popliteus activation (resisted tibial IR at 30°), terminal knee extension focus. Always address kinetic chain: foot pronation → tibial IR → biceps femoris reactivity.",
        chainEffect:"Excessive tibial IR (from foot pronation) → medial knee overload → MCL stress → medial compartment OA risk. Restricted tibial ER → knee cannot lock → quadriceps must work harder → PFPS.",
      },
    ]
  },

  hip:{
    label:"Hip", color:"#00c97a", role:"MOBILITY",
    intro:"The hip is a MOBILITY joint — it needs adequate flexion, extension, internal rotation, external rotation, and abduction to transfer force between the lumbar spine and lower limb. Hip restriction is the MOST COMMON driver of lumbar spine pathology. Limited hip IR is the single most predictive finding for future LBP.",
    tests:[
      {
        id:"kc_hip_ir_mob", label:"Hip Internal Rotation Mobility",
        role:"MOBILITY TEST", joint:"Hip",
        how:"Patient prone, hips neutral, knees bent 90°. Allow both feet to fall outward (measuring hip IR). Normal: 40–45°. Also test: seated hip IR — patient seated on table, rotate lower leg outward (hip IR). Compare sides. Clinical significance: >18° side-to-side asymmetry = significant (GIRD equivalent at hip). Hip IR <35° = high LBP risk.",
        options:[
          { val:"Normal — 40–45° bilateral symmetric", color:"#00c97a", meaning:"Adequate hip IR for all functional tasks including running, cutting, squatting. Posterior hip capsule mobile. No compensation patterns driven by hip IR restriction. Lumbar spine not being forced to rotate to compensate." },
          { val:"Mildly restricted — 30–39°", color:"#ffb300", meaning:"Mild hip IR restriction. Patient compensates with increased lumbar rotation during activities requiring hip IR (e.g. walking, golf swing). Posterior capsule and external rotators (piriformis, gemellus) mildly tight. Begin posterior capsule stretching and hip ER SMR." },
          { val:"Moderately restricted — 20–29°", color:"#ff6b35", meaning:"Moderate hip IR restriction. Lumbar spine rotates excessively to compensate — LBP developing or established. Ipsilateral foot may toe-out during gait (compensatory ER to avoid IR demand). Hip impingement (FAI) or posterior capsule contracture. FADIR test likely positive." },
          { val:"Severely restricted — <20° or significant asymmetry", color:"#ff4d6d", meaning:"Severe hip IR restriction. Classic FAI or hip OA finding. Lumbar spine under enormous rotational stress. Patient cannot squat, run, or rotate without pain. FADIR and hip scour likely positive. Refer for X-ray/MRI. Aggressive hip mobility program + consider orthopaedic referral." },
        ],
        treatment:"Posterior capsule: 90-90 stretch, pigeon pose, hip IR in prone with passive pressure. Joint mobilisation: posterior hip glide (patient supine, therapist mobilises femoral head posteriorly). Soft tissue: piriformis + gemellus SMR + dry needling. NKT: piriformis release → glute med activation (piriformis often overactive when glute med inhibited).",
        chainEffect:"Restricted hip IR → lumbar spine rotates to compensate → asymmetric disc loading → LBP. Also: restricted hip IR → foot toes out during gait → medial knee stress.",
      },
      {
        id:"kc_hip_ext_mob", label:"Hip Extension Mobility — Thomas Test",
        role:"MOBILITY TEST", joint:"Hip",
        how:"Patient supine at edge of table. Bring BOTH knees to chest fully to flatten lumbar lordosis. Lower one leg — the other remains flexed to control pelvis. Observe lowering leg: (1) Hip extension: does thigh reach the table or hang above? Normal: thigh rests on or below horizontal. (2) Knee angle: does knee remain at 90° or extend? If knee extends = rectus femoris tightness. (3) Observe for tibial rotation or foot position changes.",
        options:[
          { val:"Negative — thigh to table, knee 90°", color:"#00c97a", meaning:"Full hip extension available. Iliopsoas and rectus femoris at normal length. No anterior hip capsule restriction. Pelvis can remain neutral during gait push-off phase. No anterior pelvic tilt driven by hip flexor tightness." },
          { val:"Positive — thigh elevated (iliopsoas short)", color:"#ffb300", meaning:"Thigh hangs above horizontal — iliopsoas tight/overactive. Forces anterior pelvic tilt. LCS pattern likely. Hip flexors shortened from sitting. During gait: hip cannot extend → trunk leans forward → LBP. TREAT: iliopsoas SMR + hip flexor stretching (couch stretch) + glute max activation." },
          { val:"Positive — knee extends (rectus femoris short)", color:"#ff6b35", meaning:"Knee extends (straightens) as thigh lowers — rectus femoris tight. Creates anterior pelvic tilt AND limits knee flexion simultaneously. Patient has PFPS, anterior knee pain, and anterior hip pain. Rectus femoris stretching (prone heel-to-glute) + SMR quads." },
          { val:"Positive — both hip and knee compensation", color:"#ff4d6d", meaning:"Both iliopsoas AND rectus femoris restricted. Thigh elevated AND knee extends. Severe anterior chain tightness. Patient in permanent LCS. Must address systematically: release both → activate glutes/hamstrings → retrain hip extension pattern." },
        ],
        treatment:"Iliopsoas: couch stretch, half-kneeling hip flexor stretch, iliopsoas SMR (careful — near neurovascular structures). Rectus femoris: prone heel-to-glute stretch, lying quad stretch. Activate: glute max after stretching. Gait retraining: push-off from hip not knee.",
        chainEffect:"Tight hip flexors → anterior pelvic tilt → increased lumbar lordosis → facet loading → LBP. Also: rectus femoris tight → knee cannot flex fully → altered squat mechanics.",
      },
      {
        id:"kc_hip_er_mob", label:"Hip External Rotation Mobility",
        role:"MOBILITY TEST", joint:"Hip",
        how:"Patient prone, knee bent 90°. Measure how far lower leg moves toward midline (hip ER). Normal: 40–45°. Also test in seated: patient seated, cross ankle over opposite knee (figure-4 position) and observe how far knee drops toward table. Compare sides. Note: piriformis becomes IR when hip flexed >60° — test position changes the muscle tested.",
        options:[
          { val:"Normal — 40–45° bilateral symmetric", color:"#00c97a", meaning:"Adequate hip ER for normal gait, sports, and hip dissociation. Deep gluteal muscles (piriformis, obturators, gemellus) at normal length. No lateral hip impingement. Figure-4 test: knee drops to table or near. SI joint not being stressed by ER restriction." },
          { val:"Restricted — tight external rotators", color:"#ffb300", meaning:"Hip ER < 35°. Deep external rotators tight — piriformis, obturators, quadratus femoris. Patient may have FABER test limitation. May restrict stride length during running. Prone figure-4 position limited. Stretch: lying figure-4, seated hip ER stretch." },
          { val:"Restricted + deep buttock pain (piriformis syndrome)", color:"#ff4d6d", meaning:"ER restricted with reproduction of deep gluteal pain or sciatic symptoms during ER test. Piriformis compressing sciatic nerve. FAIR test likely positive. NKT: piriformis overactive (compensating for inhibited glute med). TREAT: careful piriformis release → glute med activation." },
          { val:"Asymmetric — >15° side difference", color:"#7f5af0", meaning:"Significant asymmetry. The restricted side = more capsular loading on ipsilateral SI joint. Running creates rotational asymmetry. Asymmetric ER restriction often from single-side injury history or sport dominance (kicking leg, golf). Address restricted side first." },
        ],
        treatment:"Soft tissue: piriformis SMR, deep gluteal foam rolling, figure-4 stretch. Joint mobilisation: posterior hip capsule glide if capsular. NKT: piriformis release → glute med activation (inhibited glute med is usually driving piriformis overactivity). Hip ER stretching: seated, lying, pigeon pose.",
        chainEffect:"Restricted hip ER → compensatory lumbar rotation → asymmetric SI joint loading. During gait: hip cannot adequately ER → foot toes in → medial ankle stress.",
      },
      {
        id:"kc_hip_abd_mob", label:"Hip Abduction Mobility & Stability",
        role:"MOBILITY + STABILITY TEST", joint:"Hip",
        how:"MOBILITY: Patient sidelying, affected side up. Passively abduct hip — normal 45°. Also: Ober's test for IT band/TFL restriction (see TFL). STABILITY: Single-leg stance — Trendelenburg test. Patient stands on one leg 30 seconds. Positive = contralateral pelvis drops. Also: lateral step-down from 20cm box — observe hip drop and trunk lean. Functional: observe running gait for hip drop.",
        options:[
          { val:"Normal mobility and stability", color:"#00c97a", meaning:"Hip abducts to 45°. Trendelenburg negative. Single-leg squat: pelvis level, no hip drop. Running: symmetrical pelvis. Glute med functioning appropriately as primary lateral pelvic stabiliser." },
          { val:"Restricted mobility — TFL/IT band", color:"#ffb300", meaning:"Ober's test positive — hip cannot adduct past 10° = IT band/TFL restricting abduction. Patient has lateral hip/knee pain. TFL overactive (NKT: compensating for inhibited glute med). TREAT: TFL SMR → glute med activation." },
          { val:"Stability deficit — Trendelenburg positive", color:"#ff4d6d", meaning:"Pelvis drops contralaterally during single-leg stance. Glute med cannot support pelvis. Patient leans trunk over stance leg to reduce moment arm (gluteus medius lurch/Trendelenburg lurch). All single-leg activities overload medial structures below and lumbar above. NKT: confirm glute med inhibited → TFL/QL compensating." },
          { val:"Both mobility restricted AND stability deficit", color:"#7f5af0", meaning:"IT band tight + Trendelenburg positive. Classic kinetic chain hip failure. TFL and piriformis are both overactive, glute med severely inhibited. Lateral knee pain, hip pain, and lumbar dysfunction. Multi-session approach: release TFL + piriformis → activate glute med → functional hip loading." },
        ],
        treatment:"Restricted: TFL SMR + lateral hip stretch + IT band roller. Stability: NKT glute med protocol (release TFL → activate glute med: clamshells → lateral band walks → single-leg holds). Progress: step-ups, lateral lunges, single-leg squat with pelvis level focus. Running: cue hip level during gait.",
        chainEffect:"Glute med failure → pelvis drops → lumbar side-flexes → SI joint asymmetric load → LBP. Below: hip drop → tibial valgus stress → medial knee pain.",
      },
    ]
  },

  lumbar:{
    label:"Lumbar Spine", color:"#ff4d6d", role:"STABILITY",
    intro:"The lumbar spine is a STABILITY region — its role is to transmit force between the mobile thoracic spine above and mobile hips below, with minimal motion of its own. It has only 13° of rotation total. When the hips or thoracic spine lose mobility, the lumbar spine is forced into excessive motion → disc loading → LBP. Stability tests assess the deep stabilising system (TA, multifidus) and segmental control.",
    tests:[
      {
        id:"kc_lumbar_stability", label:"Lumbar Segmental Stability Tests",
        role:"STABILITY TEST", joint:"Lumbar spine",
        how:"1. PRONE INSTABILITY TEST: Patient prone, feet on floor. Therapist applies posterior-anterior pressure on spinous processes — note pain. Then patient lifts feet off floor (activates spinal stabilisers) — reapply PA pressure. POSITIVE = pain reduced when muscles activated = instability (not structural). 2. ACTIVE STRAIGHT LEG RAISE (ASLR): Supine. Ask patient to lift one leg 20cm without bending knee. Observe: does pelvis rotate? Does thorax rotate? Apply compression to ASIS (manual SIJ compression) — if ASLR improves = pelvic instability. Score 0–5 each side. 3. ABDOMINAL DRAWING-IN: Patient supine. Ask to draw navel in without holding breath — palpate TA 2cm medial to ASIS.",
        options:[
          { val:"Stable — all tests normal", color:"#00c97a", meaning:"Lumbar spine stable. TA activates independently before limb movement (normal feedforward). Prone instability test negative. ASLR performed without compensation. Multifidus palpable as local swelling with activation. Normal segmental control." },
          { val:"Prone instability positive — segmental instability", color:"#ffb300", meaning:"Pain on PA pressure that reduces when patient activates muscles (lifts feet) = segmental instability at that level. Most commonly L4/5 or L5/S1. Indicates deep stabiliser deficit at that segment. Address: specific TA + multifidus training at that segment." },
          { val:"ASLR positive — pelvic/SIJ instability", color:"#ff6b35", meaning:"ASLR difficult/painful. Compensatory rotation or pain. Improved with manual ASIS compression = SIJ force closure deficit. Pelvic floor + TA + gluteal activation pattern dysfunctional. Specific SIJ stabilisation program. Pelvic belt short-term if severe." },
          { val:"No TA activation — global instability", color:"#ff4d6d", meaning:"Patient cannot isolate TA. Draws in abdomen with whole breath hold or RA fires instead. Global spinal instability pattern — common in chronic LBP. Erector spinae and QL compensating for TA/multifidus inhibition. Begin specific TA retraining before ANY global strengthening." },
        ],
        treatment:"Specific stabilisation exercise (SSE): TA drawing-in (10 sec × 10 reps), progress to dead bug, bird-dog, single-leg bridge. Multifidus: prone swelling × 10 sec × 10 reps. Progress to functional: squat with belt/brace initially, wean as stabilisers develop. Address hips and thoracic mobility first.",
        chainEffect:"Lumbar instability → erector spinae + QL compensate → chronic LBP. Forces above (thoracic stiffness) and below (hip restriction) both increase lumbar instability demand.",
      },
      {
        id:"kc_lumbar_flexion_ctrl", label:"Lumbar Flexion Control — Waiter's Bow Test",
        role:"STABILITY TEST", joint:"Lumbar spine",
        how:"Patient standing. Ask to bow forward as if greeting someone — maintain lordosis while hinging forward at hips (hip hinge). Normal: lumbar maintains neutral curve while hips flex. ABNORMAL: lumbar flexes immediately and hips stay still (lumbar flexion dominant pattern). Also test: ask patient to touch toes — observe where movement occurs first. Place fingers on PSIS and ASIS — ASIS should move posteriorly as hip flexes.",
        options:[
          { val:"Normal — hip hinge dominant", color:"#00c97a", meaning:"Patient hinges from hip with lumbar maintained in neutral. PSIS moves as hips flex. Waiter's bow clean. Normal hip-dominant forward bending. Lumbar discs not excessively loaded during forward bending tasks. Correct deadlift/lifting mechanics." },
          { val:"Lumbar flexion dominant — mild", color:"#ffb300", meaning:"Lumbar flexes before or simultaneously with hip flexion. Mild pattern. Patient has increased disc loading with forward bending. Often has flexion-pattern LBP. Hip flexors and hamstrings may be tight (restricting hip hinge). Begin hip hinge retraining." },
          { val:"Lumbar flexion dominant — moderate/severe", color:"#ff4d6d", meaning:"Lumbar flexes immediately, hips barely move. Classic disc loading pattern. Patient experiences LBP with sitting, forward bending, picking up objects. Significant hamstring tightness or hip flexion restriction driving pattern. McKenzie extension may be direction of preference. Hip hinge retraining essential. Avoid lumbar flexion loading." },
          { val:"Aberrant movement — painful arc", color:"#7f5af0", meaning:"Patient deviates laterally (trunk shift) when bending forward — often reducing when returning to upright. Indicates lumbar disc herniation (shifts away from pain) or facet asymmetry. Kemp's test + SLR to differentiate. Address disc/facet before stability training." },
        ],
        treatment:"Hip hinge retraining: dowel rod along spine cue (3 contact points), Romanian deadlift with mirror, hip hinge with theraband. McKenzie if flexion-dominant LBP. Address hip hamstring tightness that forces lumbar to take the movement.",
        chainEffect:"Lumbar flexion dominant pattern → repeated disc loading → disc degeneration. Hip restriction CAUSES lumbar flexion pattern — address hip mobility to fix lumbar movement quality.",
      },
      {
        id:"kc_lumbar_rotation_ctrl", label:"Lumbar Rotation Control Test",
        role:"STABILITY TEST", joint:"Lumbar spine",
        how:"Patient seated on plinth, feet flat (removes hip/ankle from equation). Ask to rotate trunk left and right — observe where rotation occurs. Normal: majority of rotation from thoracic spine (45° each side). Lumbar contribution: <13° total. POSITIVE = lumbar rotates excessively and thoracic barely moves. Also: seated rotation with arms folded — compare to hands on head (adds thoracic load). Quadruped rotation test: on hands and knees, rotate trunk — lumbar should not flex/extend.",
        options:[
          { val:"Normal — thoracic dominant rotation", color:"#00c97a", meaning:"Thoracic spine contributes majority of rotation (>45° each side). Lumbar minimally rotates (<5° per side). Ribs and thoracic facets mobile. Thoracic rotation does not increase lumbar disc shear forces. Normal rotational mechanics for golf, tennis, running." },
          { val:"Thoracic stiff — lumbar compensating rotation", color:"#ffb300", meaning:"Thoracic rotation <30° and lumbar overrotates to compensate. Disc at L4/5 or L5/S1 subjected to rotational shear forces. LBP with rotation (golf swing, getting in/out of car). Thoracic mobilisation priority: rotational manipulation, foam roller rotation drill." },
          { val:"Bilateral thoracic stiffness — both sides", color:"#ff6b35", meaning:"Symmetric thoracic restriction — total rotation <60°. Often from prolonged desk posture, rib cage stiffness, or thoracic kyphosis. Lumbar maximally compensating bilaterally. Bilateral risk for disc pathology. Foam roller thoracic extension + rotation essential." },
          { val:"Asymmetric restriction — one side significantly less", color:"#ff4d6d", meaning:"More restricted on one side. Creates rotational asymmetry — lumbar rotation asymmetrically loaded. Common in golfers, throwers, racquet sport athletes. Address: unilateral thoracic rotation mobility (side-lying open book, seated rotation with dowel). NKT: check contralateral glute med and ipsilateral obliques." },
        ],
        treatment:"Thoracic: foam roller extension + rotation (30 reps daily), side-lying open book stretch, seated thoracic rotation with dowel. Manual therapy: thoracic rotation manipulation (high velocity). Lumbar control: seated rotation awareness training, quadruped anti-rotation.",
        chainEffect:"Stiff thoracic (above) forces lumbar to rotate → disc shear forces → LBP. Below: hip IR restriction also forces lumbar to compensate rotationally.",
      },
    ]
  },

  thoracic:{
    label:"Thoracic Spine", color:"#00e5ff", role:"MOBILITY",
    intro:"The thoracic spine is a MOBILITY region — it needs 45° of rotation each way and adequate extension to allow the shoulder and cervical spine to function properly. Thoracic stiffness is arguably the MOST OVERLOOKED cause of neck pain, shoulder impingement, and LBP. Mobilising the thoracic spine often immediately improves shoulder and cervical symptoms.",
    tests:[
      {
        id:"kc_thoracic_rotation", label:"Thoracic Rotation Mobility",
        role:"MOBILITY TEST", joint:"Thoracic spine",
        how:"Patient seated on chair (eliminates hip contribution). Ask to rotate trunk fully left and right — arms folded across chest. Normal: 45° each side (90° total). Goniometer: axis at top of head, stationary arm pointing forward, moving arm following nose direction. Also test: supine rotation test — patient supine, knees bent to 90°, drop both knees to one side (normal: legs rest on table). Compare sides.",
        options:[
          { val:"Normal — 45°+ bilateral, symmetric", color:"#00c97a", meaning:"Full thoracic rotation available. Normal T-spine mechanics. No forced lumbar compensation. Shoulder internal rotation and cervical rotation will both be adequate as thoracic is contributing its full share. No rib stiffness." },
          { val:"Mildly restricted — 35–44° one or both", color:"#ffb300", meaning:"Mild thoracic rotation restriction. Some lumbar compensation occurring. Patient notices stiffness getting in/out of car, looking over shoulder while driving. Early cervical and lumbar overload. Begin foam roller rotation + thoracic manipulation." },
          { val:"Moderately restricted — 25–34°", color:"#ff6b35", meaning:"Moderate restriction. Significant lumbar rotational compensation. Cervical spine also overloading to compensate. Shoulder impingement beginning (thoracic kyphosis increases with rotation restriction → shoulder impingement). Rib cage restriction palpable. Thoracic manipulation + rib mobilisation." },
          { val:"Severely restricted — <25° or asymmetric >15°", color:"#ff4d6d", meaning:"Severe thoracic restriction. Lumbar and cervical spine heavily overloaded. Shoulder impingement established. In athletes: high injury risk. Consider ankylosing spondylitis (bilateral symmetric restriction) or previous spinal fracture. Thoracic manipulation priority — often single greatest change in the assessment." },
        ],
        treatment:"Immediate: thoracic manipulation (HVLA rotation manipulation — often dramatically improves restriction). Daily: foam roller extension over rolled towel + seated rotation drill × 30 reps. Rib mobilisation: lateral rib glides. Soft tissue: thoracic erector + rhomboid SMR. Address cause: forward head posture, desk ergonomics.",
        chainEffect:"Stiff thoracic → lumbar overrotates (disc injury), cervical overworks (neck pain), shoulder internally rotates excessively (impingement). Improving thoracic rotation often immediately reduces shoulder and neck pain.",
      },
      {
        id:"kc_thoracic_extension", label:"Thoracic Extension Mobility",
        role:"MOBILITY TEST", joint:"Thoracic spine",
        how:"Patient supine. Place foam roller (or rolled towel) under thoracic spine at T4–T8. Ask patient to extend over roller with arms crossed or overhead. Observe: can thoracic spine extend over roller? Normal: vertebrae should extend over roller without significant resistance or pain. Also: wall angel test — patient stands with back to wall, feet 5cm from wall. Try to move arms from 90° to overhead maintaining contact with wall and lumbar neutral. Normal: arms reach overhead without losing wall contact.",
        options:[
          { val:"Normal — full extension, wall angel complete", color:"#00c97a", meaning:"Thoracic spine extends adequately. Wall angel: arms reach overhead while maintaining rib, lower back, and arm contact with wall. Normal posterior chain flexibility at thoracic level. Forward head and shoulder impingement not being driven by thoracic kyphosis." },
          { val:"Mildly restricted — some resistance over roller", color:"#ffb300", meaning:"Mild thoracic stiffness. Wall angel: arms cannot fully reach overhead without ribs lifting or lower back arching. Chronic desk posture beginning to restrict extension. Begin daily foam roller extension work — should not be painful, just stiff." },
          { val:"Moderately restricted — notable kyphosis fixation", color:"#ff6b35", meaning:"Thoracic kyphosis partially fixed. Foam roller: spine does not extend over roller — holds flat or reversal of curve. Wall angel: unable to maintain contact with wall past 120° shoulder elevation. Shoulder impingement very likely. Cervical spine hyperextending to compensate. Significant postural correction program needed." },
          { val:"Severely restricted — rigid thoracic kyphosis", color:"#ff4d6d", meaning:"Thoracic kyphosis rigidly fixed — cannot extend. May indicate Scheuermann's disease, severe disc degeneration, DISH (diffuse idiopathic skeletal hyperostosis), or osteoporotic compression fractures. Refer for imaging before aggressive manipulation. Conservative: gentle extension (prone on elbows progression) + respiratory physiotherapy." },
        ],
        treatment:"Foam roller: daily extension over T4–T8 level × 2 min. Stretch: thoracic extension with hands behind head. Wall angel: × 15 reps daily. Manual: thoracic extension HVLA manipulation (seated or prone). Breathing: rib cage expansion exercises. Correct driving/desk posture — lumbar roll support.",
        chainEffect:"Restricted thoracic extension → increased kyphosis → forward head → UCS pattern → cervical overload. Also: kyphosis → scapula protracts → impingement → rotator cuff injury.",
      },
      {
        id:"kc_rib_mobility", label:"Rib Cage Mobility Assessment",
        role:"MOBILITY TEST", joint:"Costovertebral / costotransverse joints",
        how:"Patient seated or supine. Place hands bilaterally on rib cage (thumbs at spine, fingers wrap laterally). Ask patient to breathe in deeply — observe symmetry of rib expansion. Normal: symmetric lateral expansion of lower ribs. Also: palpate individual rib angles (posterior, where rib meets transverse process) — press firmly and assess tenderness and stiffness bilaterally. Compare each level T3–T10. Spring test: HVLA-like PA pressure on rib angle — stiff = hypomobile rib.",
        options:[
          { val:"Normal — symmetric expansion, no rib tenderness", color:"#00c97a", meaning:"Bilateral symmetric rib cage expansion during breathing. No hypomobile ribs on palpation. Costotransverse joints mobile. Thoracic rotation and extension will be full. Breathing pattern diaphragmatic — ribs expanding laterally and posteriorly." },
          { val:"Asymmetric expansion — one side restricted", color:"#ffb300", meaning:"One side of rib cage expands less than other. Often ipsilateral to thoracic rotation restriction. Breathing may be thoracic (accessory muscle dominant). Ipsilateral rib articulations hypomobile. Rib mobilisation (unilateral anterior-posterior rib pressure or manipulation) at restricted level." },
          { val:"Hypomobile ribs — specific levels tender", color:"#ff6b35", meaning:"Specific rib angles tender and stiff on PA pressure. Hypomobile costovertebral/costotransverse joints. Restricts thoracic rotation at that spinal level. Often follows respiratory illness, thoracic trauma, or prolonged poor posture. Manipulate/mobilise specific ribs at stiff levels." },
          { val:"Upper chest breathing — diaphragm inhibited", color:"#ff4d6d", meaning:"Rib cage rises vertically (upper chest breathing) rather than expanding laterally — diaphragm inhibited (see NKT diaphragm). Scalenes and SCM overactive as primary breathers. Lower ribs do not expand. Retrain: 360° diaphragmatic breathing, crocodile breathing, lateral rib expansion. Treat NKT: scalene release → diaphragm activation." },
        ],
        treatment:"Rib mobilisation: Grade III–IV PA pressure on hypomobile rib angles. HVLA: rib manipulation in prone. Breathing: lateral rib expansion training (patient places hands on lower ribs, breathe into hands). Soft tissue: intercostal release. NKT: scalene + SCM release → diaphragm activation if breathing pattern disordered.",
        chainEffect:"Hypomobile ribs → restrict thoracic rotation → lumbar overrotation → LBP. Also: restricted breathing pattern → reduced core stability (diaphragm is a core stabiliser) → LBP.",
      },
    ]
  },

  scapula:{
    label:"Scapula & Shoulder", color:"#7f5af0", role:"STABILITY → MOBILITY",
    intro:"The scapula is a STABILITY region — it must be stable enough to serve as a platform for the mobile glenohumeral joint above. The glenohumeral joint is MOBILE. Poor scapular stability (serratus anterior + lower trap inhibition) forces the mobile GH joint to compensate with impingement patterns. Scapulohumeral rhythm must be normal for pain-free overhead activity.",
    tests:[
      {
        id:"kc_scapulohumeral_rhythm", label:"Scapulohumeral Rhythm Assessment",
        role:"STABILITY TEST", joint:"Scapula / GH joint",
        how:"Patient seated or standing. Observe arm elevation in scapular plane (between flexion and abduction). Normal ratio: for every 2° of GH elevation, 1° of scapular upward rotation = 2:1 ratio (total: 120° GH + 60° scapular = 180° total). Observe: (1) Early scapular elevation (shrugging) = upper trap dominant. (2) Winging at any point = serratus inhibited. (3) Painful arc (60–120°) = impingement. (4) Does scapula upwardly rotate or just elevate? Mark inferior angle and medial border with marker for precision.",
        options:[
          { val:"Normal — 2:1 ratio, no shrug, no winging", color:"#00c97a", meaning:"Scapula upwardly rotates smoothly in 2:1 ratio with GH elevation. No early shrugging. No winging. Painful arc absent. Lower trap, serratus, and upper trap balanced. Normal force couple functioning. Overhead activity pain-free." },
          { val:"Upper trap dominant — early shoulder elevation", color:"#ffb300", meaning:"Shoulder elevates immediately with arm raising (upper trap fires first — NKT: lower trap inhibited). Ratio disrupted — too much scapular elevation, not enough upward rotation. Patient feels tightness across top of shoulder. Impingement risk. TREAT: upper trap release → lower trap activation → retrain arm elevation pattern." },
          { val:"Serratus deficit — medial winging", color:"#ff6b35", meaning:"Medial border of scapula wings away from thorax during arm elevation. Serratus anterior inhibited (cannot protract/upwardly rotate scapula — NKT: pec minor overactive). Subacromial space decreases → impingement. Full overhead elevation impossible without winging. TREAT: pec minor release → serratus activation." },
          { val:"Combined pattern — both elevation and winging", color:"#ff4d6d", meaning:"Upper trap dominance + serratus inhibition simultaneously. Severe scapular dyskinesis. Multiple muscles dysfunctional. Patient has established shoulder impingement and possible rotator cuff pathology. Multi-system treatment: release upper trap + pec minor → activate lower trap + serratus → retrain arm elevation." },
        ],
        treatment:"Scapular muscle rebalancing: lower trap (prone Y) + serratus (push-up plus, serratus punch). Release: upper trap SMR + pec minor soft tissue. Movement retraining: wall slide with scapular depression cue, elevation drills with resistance band. Avoid overhead loading until rhythm normalised.",
        chainEffect:"Poor scapular stability → subacromial space narrowing → impingement → rotator cuff tendinopathy → tear. Also: scapular winging → GH joint forced into excessive IR → anterior capsule stress.",
      },
      {
        id:"kc_gh_ir_mob", label:"Glenohumeral Internal Rotation — GIRD Assessment",
        role:"MOBILITY TEST", joint:"Glenohumeral joint",
        how:"Patient supine, shoulder at 90° abduction, elbow at 90°. Stabilise scapula (prevent posterior tipping — place hand under scapular spine). Passively internally rotate: forearm drops toward table. Normal: 60–70°. Compare bilaterally. GIRD (Glenohumeral IR Deficit): >18° side-to-side difference is clinically significant in throwing athletes. Also: total arc of rotation (ER + IR combined) should be similar bilaterally. Loss of total arc = true capsular restriction.",
        options:[
          { val:"Normal — 60–70° bilateral, <18° asymmetry", color:"#00c97a", meaning:"Adequate GH internal rotation. Posterior capsule mobile. Total arc of rotation symmetric. No posterior impingement. Rotator cuff in normal length-tension relationship. No GIRD pattern. Overhead activities unrestricted." },
          { val:"GIRD — >18° side difference (throwers)", color:"#ffb300", meaning:"Significant GIRD in dominant arm of throwing athletes. Posterior capsule contracted from repetitive overhead loading. GIRD shifts GH contact point posterosuperiorly — posterior cuff and labrum at risk. Loss of total arc indicates capsular restriction (not just bony adaptation). Sleeper stretch + posterior capsule mobilisation essential." },
          { val:"Bilateral restriction — posterior capsule tightness", color:"#ff6b35", meaning:"Both shoulders show restricted IR. Non-throwing athlete — indicates global posterior capsule contracture or UCS-related tightness. Pec minor tightness also limiting IR (anterior chain restrictors). Posterior capsule stretching bilaterally + pec minor release." },
          { val:"Severely restricted — frozen shoulder pattern", color:"#ff4d6d", meaning:"IR severely restricted (<30°). All planes restricted (capsular pattern: ER > Abd > IR). Adhesive capsulitis likely. Pain at end-range passive motion. Refer for corticosteroid injection assessment. Grade III–IV GH mobilisation (inferior glide, posterior glide). Night pain = inflammatory phase — not mobilised aggressively." },
        ],
        treatment:"GIRD: sleeper stretch × 3 × 30 sec daily, posterior capsule joint mobilisation (posterior glide). Frozen shoulder: Maitland Grade I–II in pain → Grade III–IV in stiff phase. End-range stretching program. Joint distension injection if severe. NKT: RC activation after each mobilisation session.",
        chainEffect:"GH IR restriction → shoulder impingement (posterior capsule pushes humeral head anterosuperiorly → compresses supraspinatus). Also: GH IR loss → thoracic rotation compensates → lumbar overloads.",
      },
      {
        id:"kc_cervical_thoracic_jct", label:"Cervicothoracic Junction (C7–T4) Mobility",
        role:"MOBILITY TEST", joint:"Cervicothoracic junction",
        how:"Patient seated. Assess rotation at cervicothoracic junction specifically: ask patient to rotate head fully. Apply resistance to C2 level (fixes upper cervical) and ask for rotation — measures mid-cervical rotation. Then fix C6 and ask to rotate — measures lower cervical and CT junction rotation. Palpation: PA pressure on C7, T1, T2, T3 spinous processes — stiffness and tenderness indicates hypomobility at CT junction. Normal: T1 should be mobile — spring test should have spring, not 'wooden' feel.",
        options:[
          { val:"Normal — mobile CT junction", color:"#00c97a", meaning:"CT junction mobile on PA spring test. No significant stiffness at T1–T3. Cervical rotation flows smoothly through CT junction. Brachial plexus exits freely. No referred arm symptoms provoked by CT junction loading." },
          { val:"Hypomobile CT junction — restricted rotation", color:"#ffb300", meaning:"CT junction stiff — PA spring test feels wooden at T1–T3. Reduced cervical rotation, particularly at lower levels. Patient has stiffness at base of neck. Often from forward head posture (chin poke — the CT junction extends to compensate for FHP). Mobilise: PA and rotation mobilisations at C7–T3." },
          { val:"CT junction hypomobility with arm symptoms", color:"#ff4d6d", meaning:"CT junction restricted AND provokes arm tingling/heaviness with loading. Brachial plexus or first rib elevated at CT junction. First rib elevation test: compare first rib height bilaterally (should be level). Thoracic outlet symptoms. Mobilise CT junction + first rib mobilisation. Scalene release (NKT: scalenes often overactive due to diaphragm inhibition — elevating first rib)." },
          { val:"Cervicothoracic instability — excessive motion", color:"#7f5af0", meaning:"Hypermobile CT junction — too much motion (often post-whiplash). PA spring has no resistance at C7/T1. May be causing positional headaches and neurological symptoms. Stabilise: deep cervical flexor activation, cervicothoracic stabilisation exercises. Avoid aggressive mobilisation or manipulation at this level." },
        ],
        treatment:"Hypomobile: PA mobilisation at T1–T3 (Maitland Grade III–IV), rotation mobilisation in sitting. First rib: inferior-posterior first rib mobilisation. Soft tissue: levator scapulae + upper trap at CT junction. Postural correction: CT junction extension exercises.",
        chainEffect:"Stiff CT junction → cervical spine compensates with excess rotation → cervicogenic headache. Also: CT junction stiffness → brachial plexus tension → arm symptoms. Shoulder function also affected (T1 sympathetics to upper limb exit here).",
      },
    ]
  },

  cervical:{
    label:"Cervical Spine", color:"#ff6b35", role:"MOBILITY",
    intro:"The cervical spine is a MOBILITY region — it needs 80° of rotation, 80° flexion, 70° extension, and 45° side-flexion for normal function. The upper cervical spine (C0–C2) provides 50% of all cervical rotation. The lower cervical (C3–C7) is primarily flexion/extension. Cervical dysfunction is almost always secondary to thoracic stiffness below and postural control deficit from DNF inhibition.",
    tests:[
      {
        id:"kc_cervical_rot_mob", label:"Cervical Rotation Mobility",
        role:"MOBILITY TEST", joint:"Cervical spine",
        how:"Patient seated, shoulders level. Rotate head fully left and right. Normal: 80° each side. Measure with goniometer (stationary arm top of head, moving arm follows nose). Differentiating upper vs lower cervical contribution: Flexion-Rotation Test (FRT) for C1/C2 specifically — patient fully flexes cervical spine (chin to chest), then rotates maximally. Normal FRT: 40–45° each side. <32° = positive = C1/C2 hypomobility. This eliminates contribution from lower cervical.",
        options:[
          { val:"Normal — 80° bilateral, FRT 40°+ each side", color:"#00c97a", meaning:"Full cervical rotation from both upper (C1/C2) and lower (C3–C7) cervical spine. No restriction. Normal driving vision, sport rotation, and head turning. Cervical facet joints and disc all contributing appropriately. No cervicogenic headache from rotation restriction." },
          { val:"Restricted — C1/C2 dominant (FRT positive)", color:"#ffb300", meaning:"Total rotation restricted and FRT <32° = upper cervical (C1/C2) restriction. Most common cause of cervicogenic headache and unilateral base-of-skull pain. Suboccipital muscles overactive. Upper cervical mobilisation (C1/C2 rotation and side-flex) + suboccipital release are treatment." },
          { val:"Restricted — lower cervical dominant", color:"#ff6b35", meaning:"Total rotation restricted but FRT normal = lower cervical (C3–C7) restriction. Facet joint or disc-related. Cervical rotation mobilisation at specific levels. Often related to thoracic stiffness causing lower cervical overload. Treat thoracic first, reassess." },
          { val:"Severely restricted bilateral — consider serious pathology", color:"#ff4d6d", meaning:"Both rotations severely restricted (especially if recent onset, no mechanism, or in older patient). Consider: RA (atlantoaxial instability — Sharp-Purser test FIRST), cervical myelopathy (Babinski/reflexes), infection, tumour. Urgent imaging if no mechanism. Do NOT manipulate until serious pathology ruled out." },
        ],
        treatment:"C1/C2: specific C1/C2 rotation manipulation or HVT (cervicogenic headache protocol). Suboccipital release + DNF activation. Lower cervical: segmental mobilisation at restricted level. Thoracic: always treat thoracic rotation restriction first as it directly improves cervical rotation. Home: cervical rotation active ROM × 10 reps each side daily.",
        chainEffect:"Restricted cervical rotation → patient rotates thoracic more → thoracic overload. Restricted cervical → SCM overworks → cervicogenic headache. DNF inhibition (NKT) is root cause in most cases.",
      },
      {
        id:"kc_cervical_flex_ext", label:"Cervical Flexion / Extension Mobility",
        role:"MOBILITY TEST", joint:"Cervical spine",
        how:"Patient seated. Flexion: chin-to-chest — normal = chin touches chest or ~80°. Extension: look to ceiling — normal = 70°. Measure with goniometer or inclinometer. Chin-to-chest test: failure to achieve = upper cervical restriction OR DNF weakness. Chin poke during extension (lower cervical extends, upper cervical flexes simultaneously) = forward head posture compensation. Observe quality: is movement smooth or jerky? Stiff segments produce jerky motion.",
        options:[
          { val:"Full range, smooth — flexion 80°, extension 70°", color:"#00c97a", meaning:"Full cervical flexion and extension. All segments contributing. Smooth arc of movement without jerky steps. DNF able to guide flexion without chin poke. No segment-specific stiffness. Normal disc and facet joint mechanics." },
          { val:"Flexion restricted — upper cervical or DNF weakness", color:"#ffb300", meaning:"Cannot flex fully (chin more than 2 finger-widths from chest). May be upper cervical (C0–C2) capsule restriction OR DNF too weak to guide forward head in flexion. Patient uses chin poke to start flexion. Assess DNF (CCFT) — if weak, activate. If joint restricted, mobilise. Distinguish by palpating joints during motion." },
          { val:"Extension restricted — disc or osteophyte", color:"#ff6b35", meaning:"Extension limited and painful. Pain at end-range extension suggests facet loading or posterior disc bulge. Pain arm with extension = foraminal compression (Spurling's context). Avoid aggressive extension mobilisation if radicular symptoms. Maitland Grade I–II first, reassess neurological status." },
          { val:"Chin poke pattern — forward head compensation", color:"#7f5af0", meaning:"During extension, chin pokes forward (upper cervical hyperextends, lower cervical fails to extend). Classic forward head posture. DNF inhibited. CT junction hypomobile. Patient cannot extend through lower cervical. Treat: CT junction mobilisation + DNF activation + thoracic extension." },
        ],
        treatment:"Restricted flexion: upper cervical mobilisation (C0–C2), DNF activation. Restricted extension: lower cervical extension mobilisation (Grade II–III initially), thoracic extension work. Chin poke: CT junction extension mobilisation + DNF programme. Home: segmental cervical self-mobilisation, chin tuck exercise.",
        chainEffect:"Restricted cervical extension → head cannot extend → thoracic must compensate → kyphosis. Restricted flexion + DNF weakness → cervicogenic headache, dizziness.",
      },
    ]
  },
};

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
const MOVEMENTS = {
  squat:{
    label:"Bilateral Squat", icon:"🏋️",
    description:"Bilateral weightbearing — tests global lower limb and core mechanics. Most comprehensive lower body screen.",
    howToObserve:"Patient performs 3 bodyweight squats to comfortable depth. Observe from anterior (knee alignment, trunk), lateral (trunk lean, heel rise, pelvic tilt), and posterior (pelvic drop, foot pronation). Ask patient to go as deep as comfortable. Repeat in slow motion.",
    checklistKeys:["knee_valgus","knee_varus","heel_rise","anterior_pelvic_tilt","posterior_pelvic_tilt","trunk_lean_forward","foot_pronation","foot_supination","limited_depth","lumbar_flexion_comp","lumbar_extension_comp","pain_avoidance","asymmetric_loading"],
  },
  gait:{
    label:"Gait Analysis", icon:"🚶",
    description:"Walking pattern — reveals chronic compensation patterns. Observe at normal walking speed. 10+ steps each way.",
    howToObserve:"Observe from posterior (pelvic drop, trunk lean, foot pronation), anterior (knee alignment, arm swing), and lateral (trunk lean, heel strike, push-off pattern). Ask patient to walk 10m away and 10m back at natural pace. Observe 3 cycles each view.",
    checklistKeys:["pelvic_drop","foot_pronation","trunk_lean_lateral","asymmetric_loading","pain_avoidance","instability","knee_valgus"],
  },
  single_leg:{
    label:"Single Leg Stance", icon:"🦶",
    description:"Highest demand test for lumbopelvic and lower limb stability. Reveals deficits not seen in bilateral tasks.",
    howToObserve:"Patient stands on one leg with contralateral knee raised to 90° hip flexion. Hold 30 seconds each side. Observe: pelvic level, trunk position, knee alignment, foot arch, wobbling. Compare sides. Eyes open first, then closed.",
    checklistKeys:["pelvic_drop","knee_valgus","instability","trunk_lean_lateral","foot_pronation","pain_avoidance"],
  },
  lunge:{
    label:"Forward Lunge", icon:"🤸",
    description:"Split stance — tests asymmetric loading, hip mobility, and frontal plane control. Step forward 2–3 feet.",
    howToObserve:"Patient performs 3 forward lunges each side. Observe from anterior (knee alignment, pelvic level), lateral (trunk position, heel rise, lumbar), and posterior (foot position, pelvic drop). Compare left vs right sides.",
    checklistKeys:["knee_valgus","trunk_lean_forward","heel_rise","lumbar_extension_comp","lumbar_flexion_comp","anterior_pelvic_tilt","pelvic_drop","asymmetric_loading","pain_avoidance"],
  },
  overhead:{
    label:"Overhead Reach", icon:"🙌",
    description:"Tests integrated shoulder, thoracic, and cervical mechanics. Both arms simultaneously overhead.",
    howToObserve:"Patient reaches both arms straight overhead against a wall. Observe from anterior (arm symmetry, shoulder elevation, trunk lean) and lateral (thoracic extension, head position, lumbar arch). Also observe arm elevation from side — when does scapula start rotating?",
    checklistKeys:["limited_depth","shoulder_elevation","scapular_winging","forward_head","lumbar_extension_comp","trunk_lean_forward","asymmetric_loading","pain_avoidance"],
  },
  bend:{
    label:"Forward Bending", icon:"🙇",
    description:"Standing forward bend — tests hip hinge pattern, SBL chain, and neural tension. Critical for LBP assessment.",
    howToObserve:"Patient bends forward reaching hands toward floor. Observe from lateral (where does motion initiate — hip or lumbar?), posterior (trunk shift left/right, spinal curvature), and at end range. Observe motion returning to upright — any reversal of lurch?",
    checklistKeys:["lumbar_flexion_comp","trunk_shift","foot_pronation","pain_avoidance","knee_valgus","limited_depth"],
  },
};

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
const FMS_DB = {
  sq:{
    label:"Deep Squat", icon:"🏋️",
    how:"Stand feet shoulder-width, toes slightly out 5-10°. Hold dowel overhead wide grip, arms fully extended. Descend as deep as possible, heels flat. Observe from anterior AND lateral.",
    cues:["Heels completely flat on floor throughout","Arms fully extended overhead — no elbow bend","Knees track over 2nd toe","Lumbar spine neutral throughout","Head neutral — no forward jut","Feet symmetrical"],
    scoring:"3=Full depth, torso parallel/vertical to tibia, knees over toes, dowel overhead. 2=Heel rise OR arm drop OR compensatory lean. 1=Unable to achieve depth even with heel lift. 0=Pain.",
    defects:{
      knee_valgus:{
        label:"Bilateral Knee Valgus",
        meaning:"Both knees collapse medially — cardinal sign of hip abductor and external rotator weakness combined with adductor dominance.",
        biomech:"Insufficient gluteus medius and deep ER torque allows adductors to pull femur into IR and adduction. Tibial IR follows, creating medial patellar stress and ACL loading.",
        weak:["Gluteus medius (primary)","Gluteus maximus (ER component)","Piriformis","Obturator internus/externus","VMO","Posterior tibialis"],
        tight:["Hip adductors (longus, brevis, magnus)","TFL","Lateral hamstring","IT band"],
        kinetic:"Foot pronation → tibial IR → femoral IR/adduction → medial patellar maltracking → hip impingement. Complete lower chain failure.",
        type:"Stability + Motor Control",
        risk:"Patellofemoral pain, ACL tear, medial meniscus stress, IT band syndrome, hip labral irritation.",
        compensation:"Adductor group dominates due to delayed glute activation — collapses medially to find wider BoS.",
        treatment:["Inhibit: SMR adductors + TFL 90s/spot","Lengthen: adductor long-sit stretch 3×45s, couch stretch","Activate: clamshell 3×20, side-lying abduction 3×15","Integrate: lateral band walk, sumo squat with band above knees","Motor control: squat with band cue knees-out + mirror feedback"],
        exercises:["Clamshell 3×15 (band)","Lateral band walk 3×10m","Glute bridge + abduction band 3×15","Single-leg squat to box knee-over-toe 3×8","Hip thrust 3×12","TKE with band 3×20"]},
      unilateral_knee_valgus:{
        label:"Unilateral Knee Valgus (One Side)",
        meaning:"One knee collapses medially while the other tracks — asymmetric hip abductor weakness often from previous lower limb injury.",
        biomech:"Unilateral glute med inhibition post-injury creates asymmetric loading. Dominant side overcompensates, accelerating asymmetric wear.",
        weak:["Glute med (affected side)","VMO (affected side)","Posterior tibialis (affected side)"],
        tight:["Hip adductors (affected side)","TFL (affected side)"],
        kinetic:"Unilateral collapse → pelvic obliquity → contralateral lumbar QL overload → SI joint rotation.",
        type:"Stability (Asymmetrical)",
        risk:"Unilateral ACL risk, patellofemoral syndrome, SI joint dysfunction.",
        compensation:"Trunk leans toward stronger side to offload affected knee — scoliotic loading pattern.",
        treatment:["Focus glute activation on weaker side only","Single-leg exercises emphasising affected limb","Correct foot pronation with orthotics if structural","Address previous ankle/knee injury — treat inhibition"],
        exercises:["Unilateral clamshell 3×20 (affected)","Single-leg glute bridge 3×12 (affected)","Step-up knee-out cue 3×10 each","Split squat with band 3×10","Y-balance comparison sides"]},
      knee_varus:{
        label:"Knee Varus (Bow-Legged Pattern)",
        meaning:"Knees deviate laterally during squat — IT band/TFL overactivity or structural varus loading lateral compartment.",
        biomech:"IT band + TFL overactivity pulls tibia into varus. Lateral compartment overloaded, medial compartment gapped.",
        weak:["Hip adductors","VMO","Medial hamstring (semimembranosus)"],
        tight:["IT band","TFL","Lateral hamstring","Lateral gastrocnemius"],
        kinetic:"Varus → lateral tibiofemoral overload → lateral meniscus compression → fibular head stress.",
        type:"Mobility + Structural",
        risk:"Lateral meniscus tear, lateral compartment OA, fibular stress fracture.",
        compensation:"Weight shifts medially — excessive pronation at foot to compensate for lateral knee load.",
        treatment:["IT band SMR slow passes 2min/side","TFL stretch figure-4","Strengthen medial stabilisers: adductor squeeze, VMO TKE","Orthotics assessment if structural varus","Gait analysis for varus thrust"],
        exercises:["IT band SMR 2min/side","Adductor squeeze ball 3×20","TKE medial cue 3×15","Sumo squat 3×12","Copenhagen adductor 3×10"]},
      heel_rise:{
        label:"Bilateral Heel Rise",
        meaning:"Both heels lift — primary indicator of ankle dorsiflexion restriction from soft tissue or joint limitation.",
        biomech:"Restricted talocrural joint or gastroc/soleus complex prevents forward tibial translation required for deep squat.",
        weak:["Tibialis anterior","Extensor hallucis longus","Peroneals (secondary)"],
        tight:["Soleus","Gastrocnemius","Posterior ankle joint capsule","Achilles tendon","Plantar fascia (indirect)"],
        kinetic:"Heel rise → CoM shifts anterior → excessive lumbar flexion → knee shear → quad overload → patellar tendon stress.",
        type:"Mobility",
        risk:"Patellar tendinopathy, patellofemoral pain, lumbar disc stress, Achilles tendinopathy.",
        compensation:"Trunk leans forward to maintain balance as heels rise — transfers load to lumbar spine.",
        treatment:["Talocrural posterior glide mob band or manual 2min/side","Gastroc stretch straight knee 3×45s, soleus bent knee 3×45s","Lunge into wall knee-over-toe self mob","Heel-elevated squat → progressively reduce elevation 6-8 weeks","Single-leg balance on inclined surface"],
        exercises:["Wall ankle DF stretch bent knee 3×45s","Band ankle posterior glide mob 2min/side","Heel-elevated goblet squat 3×10 progress to flat","Eccentric heel drop off step 3×15","Ankle alphabets 2×full"]},
      unilateral_heel_rise:{
        label:"Unilateral Heel Rise",
        meaning:"One heel rises while the other stays flat — asymmetric ankle DF restriction from previous ankle sprain or immobilisation.",
        biomech:"Unilateral posterior capsule tightening from lateral ankle sprain restricts DF on affected side only.",
        weak:["Tibialis anterior (affected side)"],
        tight:["Posterior ankle capsule (affected)","Gastroc/soleus (affected)"],
        kinetic:"Asymmetric heel rise → ipsilateral knee valgus → contralateral hip drop → scoliotic trunk lean.",
        type:"Mobility (Asymmetrical)",
        risk:"Recurrent ankle sprain, ipsilateral knee pathology, contralateral hip overload.",
        compensation:"Body weight shifts to unaffected side — asymmetric lower limb loading.",
        treatment:["Unilateral ankle mob priority — anterior talar glide 2min affected","Address previous ankle sprain history and scar tissue","Proprioception board affected side 3×30s"],
        exercises:["Unilateral ankle DF lunge stretch 3×45s (affected)","Banded ankle mob 2min (affected)","Single-leg heel-elevated squat progression (affected)","Towel scrunches intrinsic 3×30s","Proprioception board (affected) 3×30s"]},
      trunk_lean_forward:{
        label:"Excessive Trunk Forward Lean",
        meaning:"Torso collapses forward — restricted thoracic mobility and/or hip mobility combined with poor anterior core activation.",
        biomech:"Limited thoracic extension or hip flexion ROM forces trunk forward to maintain CoM over BoS. Anterior core weakness allows passive collapse into lumbar flexion.",
        weak:["Thoracic erector spinae","Deep cervical flexors","Anterior core (TA, obliques, multifidus)","Hip flexors (insufficient eccentric control)"],
        tight:["Thoracic paraspinals (kyphotic shortening)","Hip flexors (iliopsoas)","Thoracolumbar fascia","Anterior hip capsule"],
        kinetic:"Trunk lean → lumbar flexion moment increases → disc posterior migration → hip anterior impingement → patellar tendon overload.",
        type:"Mobility + Motor Control",
        risk:"Lumbar disc herniation, hip FAI, patellar tendinopathy.",
        compensation:"Lumbar hyperflexes to lower CoM while trunk falls forward — entire posterior structure under load.",
        treatment:["Thoracic mob: foam roller extension 2min, open-book rotation 3×10/side","Hip flex mob: couch stretch 3×60s, anterior hip capsule mob","Core: dead bug 3×10, bird-dog 3×10","Squat cue: chest up, elbows up — goblet squat as corrective","Overhead squat PVC pipe to feel upright"],
        exercises:["Thoracic foam roll extension 2min","Cat-cow 2×15","Goblet squat chest up 3×10","Dead bug 3×10/side","Box squat broomstick overhead 3×10","Couch stretch 3×60s/side"]},
      lateral_trunk_lean:{
        label:"Lateral Trunk Lean / Side-Shift",
        meaning:"Trunk shifts laterally during descent — unilateral hip mobility restriction or leg length discrepancy causing CoM compensation.",
        biomech:"Body shifts toward the more restricted hip to unload that hip's mobility demand, creating asymmetric spinal loading.",
        weak:["Contralateral hip abductors","Contralateral QL","Lateral core stabilisers"],
        tight:["Hip capsule (restricted side)","QL (ipsilateral to lean)","IT band"],
        kinetic:"Lateral trunk lean → lumbar lateral flexion → facet joint compression ipsilateral → SI joint torsion.",
        type:"Mobility (Asymmetrical) + Motor Control",
        risk:"SI joint dysfunction, lumbar facet irritation, hip labral pathology.",
        compensation:"Trunk lean toward restricted side reduces hip flexion demand — masks asymmetric restriction.",
        treatment:["Hip capsule mob: 90/90 stretch, lying IR stretch 3×45s restricted side","QL stretch lateral side bend 3×30s","Lateral core: side plank 3×30s, Pallof press 3×12","Reassess leg length — refer if >1cm discrepancy"],
        exercises:["90/90 hip stretch 3×45s restricted side","Side plank 3×30s each","Pallof press 3×12 each direction","Single-leg squat restricted side emphasis 3×8","Lateral step-down 3×10 each"]},
      arms_drop:{
        label:"Arms Drop / Cannot Maintain Overhead",
        meaning:"Unable to keep arms extended overhead — thoracic kyphosis, lat tightness or shoulder flexion restriction.",
        biomech:"Limited shoulder flexion ROM from lat/pec minor tightness or thoracic kyphosis cannot maintain overhead arm as squat depth increases thoracic demand.",
        weak:["Lower trapezius","Serratus anterior","Thoracic extensors"],
        tight:["Latissimus dorsi","Pec minor","Posterior shoulder capsule","Thoracic paraspinals"],
        kinetic:"Arms forward → trunk leans → lumbar flexion increases → full spine loading chain.",
        type:"Mobility",
        risk:"Shoulder impingement, lumbar disc stress, thoracic hyperkyphosis progression.",
        compensation:"Elbows bend and arms move forward — reduces overhead shoulder demand at cost of trunk position.",
        treatment:["Lat stretch doorway + side bend 3×30s","Thoracic extension foam roller + open-book","Lower trap Y-T-W prone 3×12, wall slide 3×12","Overhead mobility: dowel overhead squat practice"],
        exercises:["Lat doorway stretch 3×30s","Thoracic foam roll 2min","Y-T-W prone 3×12","Wall slide 3×12","Overhead dowel squat practice 3×10"]},
      foot_pronation:{
        label:"Foot Pronation / Arch Collapse",
        meaning:"Medial arch collapses — intrinsic foot muscle weakness and posterior tibialis insufficiency.",
        biomech:"Arch collapse → talus adducts and plantarflexes → tibial IR → femoral IR → knee valgus. Foot is the foundation of the kinetic chain.",
        weak:["Posterior tibialis","Peroneus longus","Intrinsic foot muscles (FDB, abductor hallucis)","Flexor hallucis longus"],
        tight:["Plantar fascia","Gastrocnemius","Achilles tendon"],
        kinetic:"Pronation → tibial IR → femoral IR → knee valgus → hip adduction → lumbar rotation.",
        type:"Stability + Mobility",
        risk:"Plantar fasciitis, posterior tibialis dysfunction, patellofemoral pain, tibial stress fracture.",
        compensation:"Knee valgus and hip IR compensate — transfers load medially through entire chain.",
        treatment:["Intrinsic strengthening: short foot exercise, toe spread, marble pick-up","Posterior tibialis: single-leg heel raise inversion bias 3×15","Plantar fascia stretch 3×30s","Orthotics if structural pes planus","Proprioception single-leg balance arch cue"],
        exercises:["Short foot exercise 3×10s holds","Towel scrunches 3×30s","Single-leg heel raise inversion bias 3×15","Plantar fascia stretch 3×30s","Barefoot balance training 3×30s/side"]},
      anterior_pelvic_tilt:{
        label:"Anterior Pelvic Tilt During Squat",
        meaning:"Pelvis tilts anteriorly during descent — hip flexor dominance preventing neutral pelvis.",
        biomech:"Tight iliopsoas and rectus femoris anteriorly rotate pelvis as depth increases, creating lumbar hyperlordosis.",
        weak:["Gluteus maximus","Hamstrings","Anterior core (rectus abdominis)"],
        tight:["Iliopsoas","Rectus femoris","TFL","Anterior hip capsule"],
        kinetic:"Anterior tilt → lumbar extension → L4-5 compression → SI joint anterior rotation → hip impingement.",
        type:"Mobility + Motor Control",
        risk:"Lumbar facet arthropathy, hip FAI, SI joint dysfunction.",
        compensation:"Lumbar lordosis increases as pelvis tilts — unloads hip at expense of spinal extension.",
        treatment:["Hip flexor: couch stretch 3×60s, kneeling stretch","Pelvic clock awareness: anterior → neutral → posterior drill","Core: dead bug with posterior pelvic tilt hold","Glute activation: glute bridge posterior tilt cue"],
        exercises:["Couch stretch 3×60s/side","Kneeling hip flex stretch 3×45s","Pelvic clock supine 3×10","Dead bug 3×10","Glute bridge neutral pelvis 3×12"]},
      butt_wink:{
        label:"Butt Wink (Posterior Pelvic Tilt at Depth)",
        meaning:"Pelvis posteriorly rotates at depth — hamstring tethering forces lumbar flexion at end-range squat.",
        biomech:"Hamstrings pull ischium posteriorly at depth, converting lumbar lordosis to flexion. Posterior disc shear force increases significantly.",
        weak:["Multifidus","Lumbar stabilisers","TA"],
        tight:["Hamstrings (primarily)","Posterior hip capsule"],
        kinetic:"Butt wink → lumbar flexion under load → posterior annular stress → disc herniation risk at depth.",
        type:"Mobility",
        risk:"Lumbar disc herniation, posterior annulus tear — highest risk under loaded squat.",
        compensation:"Lumbar flexion allows pelvis to continue rotating when hip flexion ROM exhausted.",
        treatment:["Hamstring: SLR neural glide 2×10, supine towel stretch 3×45s","Squat depth management: stop above pelvic tuck point","Hip mob: 90/90 stretch, pigeon pose 3×60s","Lumbar stabilisation: bird-dog, dead bug before loaded squats"],
        exercises:["Supine hamstring stretch towel 3×45s","SLR neural glide 2×10 oscillations","Hip 90/90 stretch 3×45s/side","Goblet squat limit depth to neutral pelvis 3×10","Box squat sit to box before tuck 3×12"]},
      cervical_compensation:{
        label:"Forward Head / Cervical Compensation",
        meaning:"Head juts forward or chin protrudes during squat — deep cervical flexor weakness and/or global fatigue pattern.",
        biomech:"As trunk falls forward, head protrudes to maintain visual horizon. Each 2.5cm forward head posture adds ~5kg load to cervical extensors.",
        weak:["Longus colli","Longus capitis","Lower trapezius","Thoracic extensors"],
        tight:["Suboccipital muscles","Upper trapezius","SCM","Thoracic paraspinals"],
        kinetic:"Cervical compensation → suboccipital compression → headache risk → upper trap overactivation → shoulder elevation chain.",
        type:"Motor Control + Posture",
        risk:"Cervical facet irritation, headache, upper trapezius overuse, shoulder impingement.",
        compensation:"Global extension strategy — posterior chain activates pulling head forward or backward.",
        treatment:["Chin tuck jowl exercise 3×10 5s holds","Suboccipital release manual or tennis ball 2min","Thoracic extension mob: foam roller","Cue: eyes on horizon during squat"],
        exercises:["Chin tuck supine 3×10 5s holds","Suboccipital self-release tennis ball 2min","Thoracic foam roll 2min","Chin tuck hold during squat 3×10","Shoulder retraction neck neutral 3×15"]},
      loss_of_balance_sq:{
        label:"Loss of Balance / Instability",
        meaning:"Patient sways or grabs support — vestibular, proprioceptive, or ankle/hip stability deficit.",
        biomech:"Squat challenges multi-segmental proprioceptive integration. Any deficit at foot, ankle, knee, hip, or CNS level disrupts postural sway.",
        weak:["Peroneals","Tibialis anterior","Intrinsic foot muscles","Hip abductors","Core stabilisers"],
        tight:["Posterior ankle capsule"],
        kinetic:"Instability → compensatory joint stiffening → reduced shock absorption → increased injury risk.",
        type:"Motor Control + Proprioception",
        risk:"Falls risk, ankle sprains, inability to decelerate in sport.",
        compensation:"Widening stance, arms forward, trunk lean — reduce balance demand at cost of movement quality.",
        treatment:["Progression: bilateral → narrow stance → tandem → single-leg","Eyes open → eyes closed","Stable → foam pad → Bosu → trampoline","Y-balance test to quantify reach asymmetry"],
        exercises:["Narrow stance squat 3×10","Single-leg balance firm 3×30s","Single-leg balance eyes closed 3×20s","Bosu squat 3×10","Perturbation training partner taps 3×30s"]},
      tremor_shaking:{
        label:"Tremor / Shaking During Movement",
        meaning:"Visible tremor during squat — neuromuscular fatigue, inadequate motor unit recruitment, or significant deconditioning.",
        biomech:"Insufficient motor unit synchronisation to maintain position under load. May indicate severe deconditioning or neurological issue.",
        weak:["Global lower extremity musculature","Core stabilisers"],
        tight:["Not primary — neuromuscular issue"],
        kinetic:"Tremor → inefficient force production → increased injury risk under dynamic loading.",
        type:"Motor Control + Neuromuscular",
        risk:"Sudden giving way, fall risk, inability to absorb loading forces.",
        compensation:"Rapid descent/ascent to avoid sustained loading demand.",
        treatment:["Graded strengthening — regress to pain-free, fatigue-free range","Isometric wall sit 3×20s progress to 60s","NMES if severe inhibition","Rule out neurological cause — refer if persistent"],
        exercises:["Wall sit 3×20s progress duration","Leg press 3×15 controlled","Step-up 3×10 each","Isometric squat hold 60° 3×20s","Cycling or swimming if severe deconditioning"]}
    }
  },
  hs:{
    label:"Hurdle Step", icon:"🏃",
    how:"Hurdle at tibial tuberosity height. Dowel behind neck across shoulders. Step over hurdle, touch heel to ground, return. Both sides. Observe anterior and lateral.",
    cues:["Stance leg fully extended throughout","Stepping hip must fully flex over hurdle","No hurdle contact","Return under full control","Dowel remains horizontal and still"],
    scoring:"3=No trunk shift, hips level, dowel horizontal, full step-over. 2=Trunk shift OR hip drop OR dowel tilts. 1=Foot touches hurdle OR loss of balance. 0=Pain.",
    defects:{
      hip_drop_trendelenburg:{
        label:"Hip Drop — Trendelenburg Sign",
        meaning:"Pelvis drops on the swing side during single-leg stance — stance-side gluteus medius insufficiency.",
        biomech:"Glute med generates abductor torque to level pelvis in single-leg stance. Insufficient force → pelvis drops → trunk leans ipsilaterally to shift CoM over foot.",
        weak:["Gluteus medius (stance side — primary)","Gluteus minimus","TFL (secondary)","Piriformis"],
        tight:["Contralateral QL","Hip adductors (stance side)"],
        kinetic:"Hip drop → lateral trunk lean → IT band tension → contralateral SI joint compression → knee valgus cascade.",
        type:"Stability",
        risk:"IT band syndrome, patellofemoral pain, SI joint dysfunction, contralateral lumbar overload.",
        compensation:"Ipsilateral trunk lean (compensated Trendelenburg) — shifts CoM masking abductor weakness.",
        treatment:["Activate: clamshell 3×20, side-lying abduction 3×15","Weight-bearing: lateral band walk, lateral step-up","Stability: mirror feedback single-leg, perturbation","Functional: step-over pelvic level cue, single-leg RDL"],
        exercises:["Clamshell 3×20 band","Side-lying hip abduction 3×15","Lateral band walk 3×12m","Single-leg stance level pelvis mirror 3×30s","Lateral step-up 3×10 each","Single-leg deadlift 3×8"]},
      lateral_trunk_shift:{
        label:"Lateral Trunk Shift / Lean",
        meaning:"Trunk deviates laterally during stance — compensatory strategy for abductor weakness or QL tightness.",
        biomech:"Insufficient hip abductor torque on stance side → trunk leans ipsilaterally to shift CoM medially, reducing abductor demand.",
        weak:["Glute med (stance side)","Lateral core (QL, obliques)","Contralateral hip abductors"],
        tight:["QL (ipsilateral to lean)","Hip adductors","Thoracolumbar fascia (lateral)"],
        kinetic:"Trunk shift → asymmetric lumbar facet loading → disc lateral compression → sciatica risk.",
        type:"Stability + Motor Control",
        risk:"Lumbar facet arthropathy, sciatica, hip impingement.",
        compensation:"Trunk lean shifts CoM — uses trunk mass to stabilise rather than muscle force.",
        treatment:["QL stretch standing side bend 3×30s each","Lateral core: side plank 3×30-60s, suitcase carry 3×20m","Glute med activation protocol","Cue: keep pelvis level and trunk upright"],
        exercises:["Side plank 3×30s to 60s","Pallof press 3×12 each","QL side bend stretch 3×30s","Suitcase carry 3×20m each","Single-leg RDL 3×8 each"]},
      insufficient_hip_flexion:{
        label:"Insufficient Hip Flexion / Step Height",
        meaning:"Stepping hip cannot achieve adequate flexion to clear hurdle — hip flexor weakness or posterior capsule restriction.",
        biomech:"Iliopsoas and rectus femoris generate hip flexion; if limited, patient compensates with trunk lean or toe drag. Hip FAI may limit deep flexion.",
        weak:["Iliopsoas","Rectus femoris","TFL hip flexion component"],
        tight:["Posterior hip capsule","Hamstrings (restrict pelvic rotation)","Piriformis"],
        kinetic:"Insufficient hip flex → toe drag → falls risk → compensatory lumbar flexion → disc load.",
        type:"Mobility + Strength",
        risk:"Trip/fall injury, hip FAI irritation, lumbar disc stress.",
        compensation:"Trunk leans forward and pelvis tilts posteriorly to achieve apparent hip flexion — uses lumbar range.",
        treatment:["Hip flexor strengthening: lying leg raise 3×12, standing hip flex band 3×15","Hip capsule mob: posterior glide, prone mob","ASLR to differentiate strength vs mobility","Step training: progressive hurdle height"],
        exercises:["Lying leg raise 3×12","Standing hip flex band 3×15","Posterior hip capsule stretch pigeon 3×60s","Progressive hurdle step lower height","Lunge with high knee drive 3×10"]},
      stance_knee_flexion:{
        label:"Stance Leg Knee Flexion",
        meaning:"Stance knee bends during step-over — quadriceps weakness or pain-avoidance pattern.",
        biomech:"Single-leg knee extension requires strong VMO and rectus femoris engagement. Failure indicates quad insufficiency or pain avoidance.",
        weak:["Vastus lateralis","VMO","Rectus femoris"],
        tight:["Hamstrings","Gastrocnemius"],
        kinetic:"Knee flexion on stance → increased patellofemoral joint reaction → quad tendon stress.",
        type:"Stability + Strength",
        risk:"Patellar tendinopathy, patellofemoral pain, knee OA progression.",
        compensation:"Trunk leans forward to reduce extension moment arm — reduces quad demand at cost of spinal position.",
        treatment:["Quad strengthening: TKE 3×20, step-up 3×12","VMO emphasis: short arc quad, TKE medial cue","Single-leg press 3×12 progressing to single-leg squat","Cue: lock the knee — stand tall"],
        exercises:["TKE band 3×20","Short arc quad 3×15","Step-up 3×12 each","Single-leg press 3×12","Wall sit 3×30s"]},
      loss_of_balance_hs:{
        label:"Loss of Balance on Stance Leg",
        meaning:"Postural sway or support-seeking — proprioceptive and/or ankle/hip stability deficit.",
        biomech:"Single-leg balance integrates vestibular, visual, somatosensory input. Deficit at ankle, hip, or CNS creates instability.",
        weak:["Peroneals","Tibialis anterior","Intrinsic foot muscles","Glute med"],
        tight:["Posterior ankle capsule"],
        kinetic:"Balance loss → compensatory co-contraction → increased energy cost → fall risk in dynamic environments.",
        type:"Motor Control + Proprioception",
        risk:"Falls risk, ankle sprain recurrence, inadequate deceleration.",
        compensation:"Wide arm abduction, trunk lean, rapid foot placement — reduce balance challenge.",
        treatment:["Single-leg balance: firm → foam → Bosu → trampoline","Eyes open → eyes closed","Perturbation: partner taps, ball toss","Y-balance test quantification"],
        exercises:["Single-leg balance firm 3×30s","Single-leg balance eyes closed 3×20s","Bosu single-leg 3×30s","Perturbation training 3×30s","Y-balance 3 directions"]},
      hurdle_contact:{
        label:"Foot Contacts Hurdle",
        meaning:"Stepping limb touches hurdle — insufficient hip flexion, foot clearance, or coordination deficit.",
        biomech:"Inadequate hip flexion strength or coordination fails to achieve required limb trajectory over hurdle height.",
        weak:["Hip flexors stepping side","Tibialis anterior foot DF for clearance"],
        tight:["Posterior hip capsule","Hamstrings limit flexion"],
        kinetic:"Repeated hurdle contact → trip mechanism → falls risk in functional environments.",
        type:"Motor Control + Mobility",
        risk:"Trip injury, reduced dynamic foot clearance in gait, stair navigation impairment.",
        compensation:"Trunk lean increases apparent hip flexion — foot clears using trunk position.",
        treatment:["Practice step-over at progressive heights","Hip flexor strengthening","Anterior tibialis: ankle DF strengthening","Motor control: slow step-over visual feedback"],
        exercises:["Standing hip flex band 3×15","Ankle DF strengthening foot on ledge lift toes 3×20","Slow hurdle step visual feedback 3×10","Marching high knee drive 3×30s","Step-up to high box 3×10"]},
      dowel_tilt:{
        label:"Dowel Tilts / Shoulders Not Level",
        meaning:"Dowel tilts indicating unilateral shoulder or thoracic restriction or asymmetric trunk lean.",
        biomech:"Unilateral thoracic restriction or QL tightness creates ipsilateral lateral flexion, tilting dowel.",
        weak:["Contralateral lateral core","Lower trapezius restricted side"],
        tight:["QL (tilt side)","Thoracic rotators","Thoracolumbar fascia unilateral"],
        kinetic:"Dowel tilt → trunk rotation → asymmetric spinal loading → SI joint torsion.",
        type:"Mobility (Asymmetrical)",
        risk:"Thoracic asymmetry, SI joint dysfunction, unilateral shoulder impingement.",
        compensation:"Trunk compensates by laterally flexing to achieve step-over, tilting dowel.",
        treatment:["QL stretch tilt side 3×30s","Thoracic rotation mob restricted side 3×10","Lateral core: side plank weaker side 3×30s","Check SM test for shoulder mobility contribution"],
        exercises:["QL side bend stretch restricted 3×30s","Thoracic rotation foam roll restricted side 1min","Side plank weaker side 3×30s","Open-book rotation 3×10/side","Horizontal adduction stretch 3×30s"]}
    }
  },
  il:{
    label:"Inline Lunge", icon:"🦵",
    how:"Stand on a line, feet tandem heel-to-toe. Dowel vertical behind back — 3 contacts: back of head, thoracic spine, sacrum. Lower rear knee to line, return. Both sides.",
    cues:["Front foot completely flat on line","Rear knee lowers to — not slams into — line","Dowel maintains all 3 contacts","No trunk rotation or lateral lean","Foot stays on line — no step-off"],
    scoring:"3=All dowel contacts maintained, no deviation, controlled. 2=Dowel loses contact OR knee deviates OR step-off. 1=Loss of balance prevents completion. 0=Pain.",
    defects:{
      trunk_rotation_il:{
        label:"Trunk Rotation",
        meaning:"Spine rotates during lunge — inadequate hip mobility forcing lumbar rotation to compensate.",
        biomech:"Restricted hip IR or ER forces lumbar spine to rotate to allow limb advancement. Dowel loses thoracic contact first, then head contact.",
        weak:["Deep core multifidus TA","Anti-rotation obliques","Hip rotators restricted side"],
        tight:["Hip joint capsule IR restriction","Thoracolumbar fascia","Piriformis","Hip flexors creating torsion"],
        kinetic:"Trunk rotation → asymmetric lumbar facet loading → SI joint torsion → contralateral hip impingement.",
        type:"Mobility + Motor Control",
        risk:"Lumbar facet arthropathy, disc annular stress, SI joint dysfunction.",
        compensation:"Spine rotates to allow hip past its ROM — lumbar substitutes for hip mobility.",
        treatment:["Hip IR mob: prone IR AROM, FABER stretch 3×45s","Anti-rotation: Pallof press 3×12, half-kneeling chop 3×10","Motor control: lunge holding dowel contacts — coach rotation","Progress: add resistance when contacts maintained"],
        exercises:["Pallof press 3×12 each direction","Half-kneeling anti-rotation hold 3×30s","Hip IR stretch seated 3×45s","Lunge with dowel visual feedback 3×8","Cable chop lunge position 3×10"]},
      front_knee_valgus_il:{
        label:"Front Knee Valgus",
        meaning:"Forward knee collapses medially — single-leg abductor and VMO demand exceeds capacity.",
        biomech:"Single-leg loading amplifies hip abductor demand. VMO insufficiency allows lateral patellar tracking. Adductors dominate.",
        weak:["Glute med front leg","VMO","Deep hip ER"],
        tight:["Hip adductors","TFL/IT band","Lateral hamstring"],
        kinetic:"Knee valgus → medial patellar maltracking → ACL valgus stress → medial meniscus compression.",
        type:"Stability",
        risk:"ACL injury, patellofemoral syndrome, medial meniscus degeneration.",
        compensation:"Trunk leans toward collapse side — reduces valgus appearance but increases SI stress.",
        treatment:["Band cue above knee during lunge RNT","Single-leg glute work: clamshell → step-up → split squat","VMO: TKE 3×20, short arc quad 3×15","Mirror feedback: watch knee during lunge"],
        exercises:["Lateral band walk 3×15","TKE band 3×20","Step-up knee-out cue 3×10","Split squat band above knee 3×10","Single-leg press valgus cue 3×12"]},
      rear_knee_valgus_il:{
        label:"Rear Knee Valgus",
        meaning:"Rear knee collapses medially during descent — hip abductor weakness on rear leg side.",
        biomech:"Rear hip abductors must stabilise pelvis and femur in adducted single-leg position. Weakness creates medial collapse.",
        weak:["Glute med rear leg side","Hip ER rear leg","VMO rear leg"],
        tight:["Adductors rear leg side"],
        kinetic:"Rear knee valgus → pelvic torsion → lumbar rotation → SI joint loading.",
        type:"Stability",
        risk:"Patellofemoral pain rear side, patellar tendon stress, SI joint dysfunction.",
        compensation:"Pelvic rotation compensates — trunk shifts to offload rear knee.",
        treatment:["Rear leg glute med activation","Bulgarian split squat 3×10","Cue: keep rear knee pointing straight down","Band above rear knee as tactile cue"],
        exercises:["Rear leg clamshell 3×20","Bulgarian split squat 3×10","Rear knee tracking split squat 3×10","Single-leg bridge rear leg 3×12","Lateral step-up rear leg dominant 3×10"]},
      lateral_trunk_lean_il:{
        label:"Lateral Trunk Lean",
        meaning:"Trunk leans laterally during lunge — QL tightness or hip abductor weakness causing CoM shift.",
        biomech:"Lateral trunk lean shifts CoM medially to reduce hip abductor demand, masking weakness.",
        weak:["Lateral core QL obliques","Hip abductors front leg"],
        tight:["QL ipsilateral to lean"],
        kinetic:"Lateral lean → asymmetric spinal loading → facet compression lean side → contralateral disc stress.",
        type:"Stability + Motor Control",
        risk:"Lumbar facet irritation, lateral disc bulge, SI joint torsion.",
        compensation:"Trunk leans to reduce abductor demand and maintain balance — increases spinal load.",
        treatment:["QL stretch standing side bend 3×30s","Side plank 3×30s to 60s","Pallof press 3×12 each","Lunge trunk upright cueing mirror"],
        exercises:["Side plank 3×30s each","Pallof press 3×12 each direction","QL side bend stretch 3×30s","Suitcase carry 3×20m each","Lateral step-up 3×10"]},
      loss_of_balance_il:{
        label:"Loss of Balance / Step-Off Line",
        meaning:"Cannot maintain narrow-base tandem stance — proprioceptive or stability deficit.",
        biomech:"Tandem stance dramatically reduces BoS, amplifying single-plane balance demand.",
        weak:["Peroneals","Tibialis anterior","Intrinsic foot muscles","Hip abductors"],
        tight:["Posterior ankle capsule"],
        kinetic:"Repeated balance loss → inefficient patterns → fall risk in narrow corridors or sport.",
        type:"Motor Control + Proprioception",
        risk:"Falls risk, ankle injury, inability to perform cutting movements.",
        compensation:"Wide arm abduction, trunk rotation, foot widening — reduce tandem demand.",
        treatment:["Tandem balance 3×30s progressing to eyes closed","Single-leg on unstable surface","Y-balance quantification","Ankle proprioception: wobble board, Bosu"],
        exercises:["Tandem stance balance 3×30s","Tandem balance eyes closed 3×20s","Single-leg balance foam pad 3×30s","Bosu single-leg 3×30s","Tandem walk tightrope 3×10m"]},
      rear_hip_extension_deficit:{
        label:"Rear Hip Extension Deficit",
        meaning:"Rear hip cannot achieve full extension — hip flexor tightness or anterior capsule restriction.",
        biomech:"Iliopsoas shortening prevents full hip extension, causing anterior pelvic tilt and lumbar lordosis.",
        weak:["Gluteus maximus rear leg","Hamstrings rear leg"],
        tight:["Iliopsoas","Rectus femoris","Anterior hip capsule","TFL"],
        kinetic:"Hip flex restriction → anterior pelvic tilt → lumbar hyperextension → L4-5 disc posterior compression.",
        type:"Mobility",
        risk:"Hip flexor injury, lumbar disc herniation extension type, SI joint irritation.",
        compensation:"Anterior pelvic tilt increases lumbar lordosis to achieve lunge depth — sacrifices spinal position.",
        treatment:["Couch stretch 3×60s priority","Anterior hip capsule mob prone on elbows","Kneeling hip flex stretch with posterior pelvic tilt","Glute max activation: prone hip extension, hip thrust"],
        exercises:["Couch stretch 3×60s/side","Kneeling hip flex stretch posterior tilt 3×45s","Half-kneeling lunge upright trunk 3×10","Hip thrust 3×12","Single-leg RDL 3×10"]},
      foot_rotation_il:{
        label:"Foot Rotation Off Line",
        meaning:"Front or rear foot rotates off line — hip rotation restriction forcing foot ER to achieve clearance.",
        biomech:"Limited hip IR forces foot into ER as compensation — reduces medial arch stress but creates rotational knee loading.",
        weak:["Hip IR muscles TFL anterior glute med"],
        tight:["Hip ER muscles piriformis obturators gemelli","Posterior hip capsule"],
        kinetic:"Foot ER → tibial ER → knee lateral rotation → patellofemoral maltracking.",
        type:"Mobility",
        risk:"Patellofemoral syndrome, IT band syndrome, lumbar rotation stress.",
        compensation:"Foot ER allows hip to clear limited IR range — avoids discomfort at cost of alignment.",
        treatment:["Hip IR mob: prone IR AROM, seated IR stretch 3×45s","Pigeon pose hip ER stretch 3×60s","Lunge practice with foot placement cue tape on floor"],
        exercises:["Hip IR stretch seated 3×45s","Pigeon pose ER stretch 3×60s","Lunge with foot-on-tape line cue 3×10","Single-leg squat rotation awareness 3×10","Cossack squat 3×10 each"]}
    }
  },
  sm:{
    label:"Shoulder Mobility", icon:"💪",
    how:"Make a fist both hands thumbs inside. Simultaneously reach one hand up behind the head and the other up the back. Measure fist-to-fist distance. Both sides. CLEARING TEST: Push-up impingement test — pain = score 0.",
    cues:["Make a tight fist — thumb inside","Both hands move simultaneously","Record knuckle-to-knuckle distance","Measure against patient's own hand-length","Clearing test mandatory"],
    scoring:"3=Within 1 hand-length. 2=Within 1.5 hand-lengths. 1=More than 1.5 hand-lengths. 0=Pain.",
    defects:{
      limited_overhead_sm:{
        label:"Limited Shoulder Flexion + IR (Overhead Restricted)",
        meaning:"Arm cannot reach adequately behind the head — restricted GH flexion, IR, or thoracic extension.",
        biomech:"Posterior capsule tightness or pec minor shortening limits GH IR in elevation. Thoracic kyphosis reduces scapular upward rotation capacity, compressing subacromial space.",
        weak:["Lower trapezius","Serratus anterior","Posterior rotator cuff (infraspinatus, teres minor)"],
        tight:["Pec minor","Pec major (anterior fibres)","Anterior GH capsule","Subscapularis","Thoracic paraspinals"],
        kinetic:"Restricted overhead → compensatory scapular elevation → upper trap dominance → cervical load → impingement.",
        type:"Mobility",
        risk:"Subacromial impingement, rotator cuff tears, cervical radiculopathy, AC joint stress.",
        compensation:"Scapular elevation + contralateral trunk lean to achieve overhead reach.",
        treatment:["Pec minor: corner stretch or doorway 3×30s","Thoracic extension foam roller T-spine 2min","GH posterior glide mob manual or self-stretch","Lower trap Y-T-W prone 3×12","Sleeper stretch 3×30s","Wall slide scapular depression cue 3×12"],
        exercises:["Pec minor doorway stretch 3×30s","Thoracic foam roll 2min","Y-T-W prone 3×12","Wall slide 3×12","Sleeper stretch 3×30s","Shoulder flexion AROM 2×10"]},
      gird:{
        label:"GIRD — Glenohumeral IR Deficit (Behind-Back Restricted)",
        meaning:"Arm cannot reach behind the back — GH internal rotation deficit, classic in overhead athletes.",
        biomech:"Posterior capsule tightening from repetitive overhead loading reduces GH IR. Creates obligate humeral head superior migration and posterior labrum stress.",
        weak:["Posterior rotator cuff (infraspinatus, teres minor)","Rhomboids","Serratus anterior"],
        tight:["Posterior GH capsule","Posterior rotator cuff adaptive shortening","Teres major"],
        kinetic:"GIRD → scapular anterior tilt → subacromial narrowing → superior labrum stress → SLAP risk.",
        type:"Mobility",
        risk:"SLAP tear, posterior labral injury, subacromial impingement, rotator cuff degeneration.",
        compensation:"Trunk rotation and scapular protraction to achieve internal reach.",
        treatment:["Sleeper stretch BEST for GIRD 3×30s side-lying","Cross-body posterior capsule stretch 3×30s","GH posterior glide mobilisation","Rotator cuff ER: side-lying band ER 3×15","Scapular retraction rows, face pulls 3×15"],
        exercises:["Sleeper stretch 3×30s each","Cross-body cuff stretch 3×30s","Band ER side-lying 3×15 each","Scapular retraction row 3×12","Face pull 3×15"]},
      bilateral_asymmetry_sm:{
        label:"L/R Asymmetry (>1 Hand-Length Difference)",
        meaning:"Significant side-to-side difference — highest FMS injury predictor. Unilateral restriction from previous injury or sport.",
        biomech:"Asymmetric capsular tightness or muscle shortening restricts one side disproportionately. Creates compensatory spinal patterns.",
        weak:["Restricted side posterior rotator cuff","Restricted side lower trap"],
        tight:["Dominant throwing arm posterior capsule","Restricted side pec minor"],
        kinetic:"Asymmetry → compensatory scoliotic trunk → uneven rib cage → cervical dysfunction.",
        type:"Mobility (Asymmetrical)",
        risk:"High asymmetric injury risk — strongest FMS predictor.",
        compensation:"Trunk lateral lean and rotation to compensate restricted side reach.",
        treatment:["Priority: stretch ONLY restricted side until symmetric","Reassess every 4 weeks","Do not aggravate overhead loading until symmetric","Address dominant arm overload sport-specific"],
        exercises:["Unilateral sleeper stretch restricted side 3×30s","Unilateral pec stretch restricted 3×30s","Thoracic rotation toward restricted side 3×10","Unilateral shoulder mob until symmetric","Bilateral ER strengthening after symmetry"]},
      scapular_elevation_sm:{
        label:"Scapular Elevation / Shoulder Shrug During Reach",
        meaning:"Shoulder elevates during reach — upper trapezius dominance compensating for lower trap and serratus weakness.",
        biomech:"Upper trap fires to achieve apparent shoulder elevation when lower trap and serratus cannot generate adequate upward rotation torque.",
        weak:["Lower trapezius","Serratus anterior","Middle trapezius"],
        tight:["Upper trapezius","Levator scapulae","SCM"],
        kinetic:"Scapular elevation → cervical compression → upper trap overuse → AC joint stress → thoracic outlet potential.",
        type:"Motor Control + Stability",
        risk:"Thoracic outlet syndrome, AC joint pathology, cervicogenic headache.",
        compensation:"Shrugging substitutes for proper scapular upward rotation — wrong muscle sequence.",
        treatment:["Upper trap inhibition: SMR upper trap 90s/side","Lower trap: Y-T-W prone, wall slide depression cue","Scapular PNF: depression + retraction","Motor control: shoulder flex with scapular depression hold"],
        exercises:["Upper trap SMR ball against wall 90s/side","Y-T-W prone 3×12","Wall slide depress scapula during slide 3×12","Scapular depression holds 3×10 5s","Face pull 3×15"]},
      scapular_winging_sm:{
        label:"Scapular Winging",
        meaning:"Medial border of scapula lifts — serratus anterior weakness or long thoracic nerve dysfunction.",
        biomech:"Serratus anterior holds scapula against thorax and generates upward rotation. Weakness or inhibition allows winging, reducing overhead ROM.",
        weak:["Serratus anterior (primary)","Lower trapezius","Middle trapezius"],
        tight:["Pec minor (tips scapula anteriorly causing winging)"],
        kinetic:"Winging → reduced GH ROM → impingement → rotator cuff compensation → cervical chain overload.",
        type:"Stability + Motor Control",
        risk:"Subacromial impingement, rotator cuff stress, long thoracic neuropathy.",
        compensation:"Shoulder elevation and trunk lean substitute for inadequate scapular control.",
        treatment:["Serratus: wall push-up plus protraction 3×15","Push-up with serratus plus extra protraction at top","Pec minor stretch to release scapular depression","Refer if severe — long thoracic nerve injury"],
        exercises:["Wall push-up plus protraction 3×15","Push-up plus on knees 3×12","Serratus punch band 3×15","Pec minor corner stretch 3×30s","Scapular protraction drills 3×10"]},
      cervical_lateral_flex_sm:{
        label:"Cervical Lateral Flexion / Head Tilt",
        meaning:"Head tilts during shoulder reach — cervical mobility deficit or upper trap tightness creating neck movement as compensation.",
        biomech:"Restricted ipsilateral cervical lateral flexion forces head to tilt to allow trunk side-bend for apparent shoulder reach.",
        weak:["Contralateral deep cervical flexors","Contralateral SCM"],
        tight:["Ipsilateral upper trapezius","Ipsilateral SCM","Scalenes","Levator scapulae"],
        kinetic:"Cervical compensation → suboccipital compression → cervicogenic headache → upper limb neural tension.",
        type:"Mobility + Motor Control",
        risk:"Cervicogenic headache, cervical radiculopathy C4-6, thoracic outlet syndrome.",
        compensation:"Head tilts to create extra trunk side-bending allowing limited shoulder to appear to reach further.",
        treatment:["Cervical lateral flexion stretch ear to shoulder 3×30s","Upper trap stretch + SCM stretch","Cervical rotation mob gentle AROM 3×10","Address shoulder mobility as primary driver"],
        exercises:["Ear-to-shoulder stretch 3×30s each","Upper trap stretch 3×30s each","Cervical rotation AROM 3×10 each","Levator scapulae stretch 3×30s each","Address SM deficits first"]},
      pain_impingement_sm:{
        label:"Pain During Movement (Clearing Test Positive)",
        meaning:"Shoulder pain during impingement clearing test — subacromial pathology present.",
        biomech:"Subacromial space compromised — inflammation, structural narrowing, or rotator cuff pathology causing pain with shoulder elevation + IR.",
        weak:["Rotator cuff all four","Lower trapezius","Serratus anterior"],
        tight:["Posterior capsule creating anterior-superior migration","Pec minor scapular depression"],
        kinetic:"Impingement → guarded movement → altered motor patterns → compensatory cervical and trunk strategies.",
        type:"Pathological — Score = 0",
        risk:"Rotator cuff tear progression, SLAP injury, AC joint degeneration. DO NOT load overhead without clearance.",
        compensation:"Arm held close, shoulder elevated, trunk rotation to reduce elevation demand.",
        treatment:["IMMEDIATE: Score = 0. Refer for shoulder assessment — imaging may be warranted","Conservative: posterior capsule stretch, lower trap activation, postural correction","Avoid aggravating overhead loading until pain-free","Address scapular dyskinesia and posture"],
        exercises:["Address pain first — no overhead loading","Postural correction exercises","Pendulum Codman's for acute relief","Posterior capsule gentle stretch pain-free range","Refer to physiotherapist or orthopaedic if not resolving"]}
    }
  },
  aslr:{
    label:"Active Straight Leg Raise", icon:"🦿",
    how:"Patient supine on firm surface. Arms flat at sides palms up. Raise one leg as high as possible, knee completely straight, opposite leg flat on floor. Measure raised leg height relative to midpoint between ASIS and knee of stationary leg. Both sides.",
    cues:["Keep raised knee fully straight","Raised foot dorsiflexed toe toward face","Opposite leg completely flat","Arms do not press into floor","Pelvis neutral — no tilt or rotation"],
    scoring:"3=Raised leg reaches between ASIS and vertical. 2=Between ASIS line and mid-thigh of opposite. 1=Below opposite knee. 0=Pain.",
    defects:{
      limited_hamstring_length:{
        label:"Limited Hamstring Length / Hip Flexion Range",
        meaning:"Inability to raise leg sufficiently — posterior chain tightness or sciatic neural tension limits active hip flexion.",
        biomech:"Hamstring tightness resists passive elongation during hip flexion. Hip flexors must overcome hamstring tension AND inertia — combined demand may exceed capacity.",
        weak:["Iliopsoas","Rectus femoris","TFL hip flexion component"],
        tight:["Biceps femoris long and short head","Semimembranosus","Semitendinosus","Posterior hip capsule","Sciatic nerve neural tension — differentiate with neurodynamics"],
        kinetic:"Posterior chain restriction → compensatory lumbar flexion → decreased lumbar stability → disc posterior migration.",
        type:"Mobility",
        risk:"Hamstring tear, proximal tendinopathy, lumbar disc herniation, sciatic nerve sensitisation.",
        compensation:"Pelvis posteriorly tilts, opposite knee flexes, or lumbar flattens to increase apparent range.",
        treatment:["Neural mob: SLR neural glide if neurogenic 2×10","Hamstring stretch: supine towel 3×45s, standing 3×45s","Active: lying leg raise 3×12, dead bug leg lowering 3×10","Eccentric: Nordic hamstring progressive loading","Differentiate neural tension vs muscle — Slump test"],
        exercises:["Supine hamstring stretch towel 3×45s","SLR neural glide 2×10 oscillations","Lying leg raise 3×12","Dead bug leg lowering 3×10","Nordic hamstring eccentric progressive","Standing hamstring stretch 3×45s"]},
      posterior_pelvic_tilt_aslr:{
        label:"Compensatory Posterior Pelvic Tilt",
        meaning:"Pelvis rotates posteriorly as leg rises — deep core cannot stabilise pelvis against hip flexor pull.",
        biomech:"TA and multifidus must create lumbar stiffness to resist extension moment created by leg raising. Weakness allows pelvis to rotate.",
        weak:["Transverse abdominis primary","Multifidus","Internal oblique","Pelvic floor"],
        tight:["Hamstrings contribute to pelvic tilt","Thoracolumbar fascia"],
        kinetic:"Pelvic tilt → lumbar flexion → posterior disc shear → hip flexor labral stress.",
        type:"Stability + Motor Control",
        risk:"Lumbar disc herniation, hip labral tear, SI joint dysfunction.",
        compensation:"Pelvis tilts to reduce hamstring tension — creates false impression of greater ROM.",
        treatment:["TA activation: drawing-in 3×10 10s holds","Dead bug with pelvic neutral 3×10 each","Pressure biofeedback lumbar support during ASLR","Bird-dog 3×10","ASLR with therapist hand under lumbar for feedback"],
        exercises:["TA drawing-in 3×10 10s holds","Dead bug neutral lumbar 3×10","Bird-dog 3×10","ASLR with pressure biofeedback 3×10","Supine heel slide neutral pelvis 3×10"]},
      opposite_leg_rise:{
        label:"Opposite Leg Lifts During Test",
        meaning:"Stationary leg flexes or lifts — bilateral posterior chain tightness pulling through pelvis.",
        biomech:"Severe bilateral hamstring tightness creates reciprocal tension through pelvis when one leg is raised, pulling opposite leg into slight flexion.",
        weak:["Bilateral hip flexors","Bilateral core stabilisers"],
        tight:["Bilateral hamstrings","Bilateral posterior chain gastroc, plantar fascia"],
        kinetic:"Bilateral restriction → reduced gait efficiency → lumbar overload bilaterally → increased disc stress.",
        type:"Mobility (Bilateral)",
        risk:"Bilateral hamstring tearing, lumbar disc herniation bilateral, reduced gait stride length.",
        compensation:"Opposite leg flexes allowing slight pelvic movement — chain reaction from bilateral tightness.",
        treatment:["Bilateral hamstring stretching 2 sessions/day","Neural mobilisation bilateral SLR glides","Yoga forward fold soft knee to straight progression","Address thoracolumbar fascia foam roll"],
        exercises:["Bilateral supine hamstring stretch 3×45s","SLR neural glide bilateral 2×10","Standing hamstring both 3×45s","Yoga forward fold progression 3×30s","Foam roll thoracolumbar 2min"]},
      pelvic_rotation_aslr:{
        label:"Pelvic Rotation During Raise",
        meaning:"Pelvis rotates as leg rises — hip rotator tightness or asymmetric core creating rotational pull.",
        biomech:"Hip ER tightness on tested side creates ER moment as hip flexes, causing pelvis to rotate away. Core cannot stabilise against rotational demand.",
        weak:["Anti-rotation core obliques TA","Hip IR muscles allow ER torque to dominate"],
        tight:["Hip external rotators piriformis obturators gemelli","Posterior hip capsule"],
        kinetic:"Pelvic rotation → SI joint torsion → asymmetric lumbar facet loading → disc torsion.",
        type:"Mobility + Motor Control",
        risk:"SI joint dysfunction, lumbar disc torsion, hip labral stress.",
        compensation:"Pelvis rotates to allow hip greater flexion without requiring IR — avoids posterior capsule stretch.",
        treatment:["Hip ER stretch: figure-4, pigeon pose 3×60s","SI joint stabilisation if hypermobile","Anti-rotation core: Pallof press 3×12","Motor control: ASLR with pelvic stabilisation cue"],
        exercises:["Pigeon pose 3×60s each","Figure-4 stretch 3×45s each","Pallof press 3×12 each direction","ASLR with pelvic control cue 3×10","Dead bug rotation control 3×10"]},
      raised_knee_flexion:{
        label:"Raised Knee Flexes During Test",
        meaning:"Raised leg knee bends — hamstring tightness inhibits full knee extension under hip flexion demand.",
        biomech:"Hamstrings cross both hip and knee. During hip flexion with knee extension, maximal two-joint length is demanded — flexibility limitation causes passive knee flexion.",
        weak:["Quadriceps must resist passive knee flexion","Hip flexors insufficient to maintain position"],
        tight:["Hamstrings all 3 heads primary","Proximal hamstring — ischial attachment tendinopathy consideration"],
        kinetic:"Knee flexion reduces hamstring stretch demand — system cheats by flexing knee.",
        type:"Mobility",
        risk:"Proximal hamstring tendinopathy, hamstring tear, reduced running economy.",
        compensation:"Knee flexion shortens hamstring demand — achieves apparent hip flexion at cost of pattern quality.",
        treatment:["Hamstring: supine towel stretch emphasise knee extension 3×45s","Neural mob: SLR ankle DF and knee extension emphasis","Seated hamstring: knee extension from 90° 3×45s","Eccentric Nordic hamstring for length and strength"],
        exercises:["Supine towel hamstring straight knee 3×45s","Seated knee extension stretch 3×45s","SLR neural glide knee ankle emphasis 2×10","Standing hamstring flat back hinge 3×45s","Nordic hamstring eccentric progressive"]},
      asymmetry_aslr:{
        label:"L/R Asymmetry in Raise Height",
        meaning:"Significant side-to-side difference — unilateral restriction from previous injury or sport adaptation.",
        biomech:"Unilateral hamstring restriction from previous strain or neural sensitisation creates asymmetric pattern.",
        weak:["Hip flexors restricted side"],
        tight:["Hamstrings restricted side","Sciatic nerve restricted side neural tension"],
        kinetic:"Asymmetry → asymmetric gait stride → ipsilateral hip overload → contralateral compensation.",
        type:"Mobility (Asymmetrical)",
        risk:"Recurrent hamstring strain restricted side, gait asymmetry, contralateral hip overload.",
        compensation:"Trunk leans or pelvis tilts to increase apparent range on restricted side.",
        treatment:["Priority: stretch restricted side only until symmetric","Slump test: rule out neural component","Unilateral hamstring program restricted side","Reassess every 4 weeks"],
        exercises:["Unilateral supine hamstring stretch restricted 3×45s","Unilateral SLR neural glide restricted 2×10","Unilateral Nordic restricted side 3×8","Progress bilateral only after symmetry","Y-balance posterior reach comparison"]}
    }
  },
  tspu:{
    label:"Trunk Stability Push-Up", icon:"🤸",
    how:"Prone position. Men: thumbs at forehead. Women: thumbs at chin. Perform ONE push-up rising as completely rigid plank. If unable: men try thumbs at chin, women at shoulder. CLEARING TEST: Prone press-up cobra — pain = score 0.",
    cues:["Body rises as one single rigid unit","No hip hike before or during push","No lumbar sag at any point","Head, thoracic, lumbar, hips, legs all move together","One push-up only — quality over repetition"],
    scoring:"3=Single push-up rigid appropriate level. 2=Lumbar sag or hip leads. 1=Cannot perform at level, can at regressed. 0=Pain.",
    defects:{
      lumbar_sag_tspu:{
        label:"Lumbar Sag / Anterior Lag",
        meaning:"Hips and lumbar drop and rise last — anterior core insufficient trunk rigidity for push-up force transfer.",
        biomech:"TA, multifidus and obliques must create IAP and lumbar stiffness to transfer force from chest through trunk to hips. Weakness creates wet-noodle pattern.",
        weak:["Transverse abdominis primary","Multifidus","Internal and external obliques","Rectus abdominis","Pelvic floor part of core canister"],
        tight:["Thoracolumbar fascia prevents TA full tensioning","Hip flexors pull lumbar into extension adding to sag"],
        kinetic:"Lumbar sag → L4-5 extension loading → posterior disc compression → facet approximation.",
        type:"Stability + Motor Control",
        risk:"Lumbar disc herniation extension type, facet arthropathy, SI joint stress.",
        compensation:"Hips sag and rise independently — caterpillar push-up pattern.",
        treatment:["Phase 1: TA activation drawing-in + bracing 3×10 10s","Phase 2: Plank 3×20s → 30s → 60s strict","Phase 3: Dead bug with TA brace 3×10","Phase 4: Push-up regression wall → incline → knee → full","Phase 5: Full push-up with dowel on back rigid body feedback"],
        exercises:["Plank 3×30s to 60s","Dead bug 3×10","Modified push-up knees rigid 3×10","TA drawing-in 3×10 10s","Full push-up rigid body cue 3×5"]},
      hip_hike_pike:{
        label:"Hip Hike / Piking",
        meaning:"Hips rise first before chest — posterior chain dominance avoiding anterior push-up demand.",
        biomech:"Hamstrings and glutes fire first instead of pectorals and anterior deltoids — pyramid/pike shape. CNS chooses familiar posterior chain pattern.",
        weak:["Pectoralis major","Anterior deltoid","Triceps","Serratus anterior","Anterior core"],
        tight:["Hamstrings","Posterior hip capsule","Gastrocnemius"],
        kinetic:"Hip hike → lumbar flexion moment → posterior disc loading — opposite of lumbar sag equally problematic.",
        type:"Motor Control",
        risk:"Lumbar disc posterior herniation, hamstring overuse, poor upper body push capacity.",
        compensation:"Posterior chain fires to initiate — avoids chest push demand by hinging at hips first.",
        treatment:["Motor control: simultaneous hands + feet press into ground","Regression: incline push-up rigid body timing","Chest + tricep: chest press 3×12, dips 3×10","Push-up timing drill: 3-count lower pause press","Plank to push-up transition practice"],
        exercises:["Incline push-up rigid 3×12","Wall push-up motor control 3×10","Chest press 3×12","Tricep push-down 3×15","Push-up timing drill 3×5"]},
      asymmetric_push_tspu:{
        label:"Asymmetric Push / Trunk Rotation",
        meaning:"Trunk rotates during push-up — unilateral pectoral or shoulder weakness creating rotational force.",
        biomech:"Asymmetric force from one pec/deltoid creates rotational moment — trunk rotates toward weaker side as stronger side pushes faster.",
        weak:["Pec major weaker side","Anterior deltoid weaker side","Serratus anterior weaker side","Triceps weaker side"],
        tight:["Pec minor dominant side over-pulls toward dominance"],
        kinetic:"Trunk rotation → asymmetric thoracic/cervical load → repeated rotational disc stress → contralateral shoulder compensation.",
        type:"Stability (Asymmetrical)",
        risk:"Cervical disc asymmetric stress, shoulder impingement dominant side, thoracic asymmetry.",
        compensation:"Dominant side pushes faster creating visible trunk rotation.",
        treatment:["Unilateral: single-arm chest press 3×12 weaker side emphasis","Single-arm plank 3×20s each","Push-up on unstable surface alternate hand Bosu","Stretch dominant pec minor","Equalise bilateral training volume"],
        exercises:["Single-arm chest press 3×12 each","Single-arm plank 3×20s each","Push-up alternating Bosu 3×8","Band pull-apart 3×15","Push-up symmetry cue mirror 3×8"]},
      head_drop_tspu:{
        label:"Head Drop / Cervical Compensation",
        meaning:"Head drops or juts forward during push-up — deep cervical flexor weakness.",
        biomech:"Longus colli and longus capitis must maintain craniovertebral neutral during push-up. Weakness allows head to drop with gravity.",
        weak:["Longus colli","Longus capitis","Deep cervical flexors","Lower trapezius"],
        tight:["Suboccipital extensors","Upper trapezius","SCM"],
        kinetic:"Head drop → cervical extension → suboccipital compression → headache risk → cervical disc stress.",
        type:"Motor Control + Stability",
        risk:"Cervicogenic headache, cervical facet irritation, suboccipital neuralgia.",
        compensation:"Head drops to reduce cervical flexor demand — trunk completes push-up without craniovertebral neutral.",
        treatment:["Chin tuck jowl exercise 3×10 5s holds","Suboccipital release manual or tennis ball 2min","Neck dissociation: maintain chin tuck during push-up","Scapular stability lower trap to reduce cervical chain overload"],
        exercises:["Chin tuck supine 3×10 5s holds","Suboccipital release 2min","Push-up chin tuck maintained 3×5","Deep neck flexor endurance practice","Lower trap Y-T-W 3×12"]},
      scapular_winging_tspu:{
        label:"Scapular Winging During Push-Up",
        meaning:"Medial scapular border wings — serratus anterior weakness under load.",
        biomech:"Serratus anterior generates protraction and upward rotation at top of push-up. Weakness allows medial border to wing, creating impingement and poor load transfer.",
        weak:["Serratus anterior primary","Lower trapezius","Middle trapezius"],
        tight:["Pec minor scapular depression and anterior tilting"],
        kinetic:"Scapular winging → GH instability → rotator cuff overload → impingement → cervical chain compensation.",
        type:"Stability + Motor Control",
        risk:"Subacromial impingement, rotator cuff overuse, cervical overload.",
        compensation:"Shoulder elevation and trunk tilt substitute — visible scapular lifting.",
        treatment:["Serratus: push-up plus extra protraction 3×15","Wall push-up plus 3×15","Serratus punch band 3×15","Pec minor stretch release scapular depression"],
        exercises:["Wall push-up plus 3×15","Push-up plus knees 3×12","Serratus punch 3×15","Pec minor corner stretch 3×30s","Bear crawl scapular stability 3×10m"]},
      elbow_flare_tspu:{
        label:"Excessive Elbow Flare (>45° From Trunk)",
        meaning:"Elbows abduct excessively — pec tightness or poor motor pattern creating shoulder impingement position.",
        biomech:"Elbow flare >45° places GH in maximal anterior impingement position. Indicates pec major dominance over triceps.",
        weak:["Triceps insufficient elbow extension","Serratus anterior"],
        tight:["Pec major pulls arms into horizontal abduction","Anterior shoulder capsule"],
        kinetic:"Elbow flare → anterior GH impingement → rotator cuff tension → potential SLAP stress.",
        type:"Motor Control + Mobility",
        risk:"Anterior shoulder impingement, SLAP tear, AC joint stress.",
        compensation:"Elbows flare to reduce pec stretch demand — engage pec major preferentially.",
        treatment:["Pec major stretch doorway 3×30s","Motor control: push-up with elbows at 45° cue","Tricep: diamond push-up, close-grip press","Kinesiology tape for elbow position cue"],
        exercises:["Pec major doorway stretch 3×30s","Close-grip push-up 45° elbow 3×10","Tricep push-down 3×15","Motor control push-up elbow cue mirror 3×10","Band pull-apart 3×15"]},
      pain_clearing_tspu:{
        label:"Pain on Clearing Test (Spinal Extension Pain)",
        meaning:"Pain with prone press-up — lumbar extension pathology present.",
        biomech:"Prone press-up creates lumbar extension moment — compresses posterior elements (facets) and reduces posterior disc space.",
        weak:["Anterior core weak allows excessive extension"],
        tight:["Thoracolumbar extensors","Hip flexors anteriorly tilt pelvis"],
        kinetic:"Extension pain → guarded posture → flexion-biased compensation → risk of flexion disc herniation.",
        type:"Pathological — Score = 0",
        risk:"Lumbar facet arthropathy, spondylolisthesis, extension-type disc herniation. DO NOT LOAD.",
        compensation:"Patient avoids extension entirely — flexion-biased posture develops.",
        treatment:["IMMEDIATE: Score = 0. Refer for lumbar assessment","Flexion-biased rehab: knee-to-chest, cat-cow flexion","Core stabilisation neutral/flexion position","Avoid extension exercises until cleared"],
        exercises:["Address pain first — no extension loading","Knee-to-chest stretch 3×30s","Cat-cow flexion emphasis 2×15","Supine core stabilisation neutral 3×10","Refer if persistent or radiating"]}
    }
  },
  rs:{
    label:"Rotary Stability", icon:"🔄",
    how:"Quadruped: hands under shoulders, knees under hips, spine neutral. Attempt 1: Extend ipsilateral (same side) arm + leg simultaneously, return. Attempt 2 if fails: Diagonal opposite arm + leg. Both sides. CLEARING TEST: Quadruped rocking child's pose — pain = score 0.",
    cues:["Spine completely neutral — no rotation, flexion or extension","Extend arm and leg together — no momentum","Keep pelvis level and still","Repeat both sides","Note: unilateral vs diagonal performance"],
    scoring:"3=Unilateral same-side without trunk rotation. 2=Diagonal opposite arm-leg without rotation. 1=Rotation present OR unable. 0=Pain.",
    defects:{
      trunk_rotation_rs:{
        label:"Trunk Rotation During Extension",
        meaning:"Spine rotates as arm or leg extends — deep core fails to resist rotational moment from limb extension.",
        biomech:"TA, multifidus, and diaphragm form core canister providing stiffness. Ipsilateral extension creates rotational moment — core failure allows trunk to rotate with limbs.",
        weak:["Transverse abdominis primary","Multifidus rotational stabiliser","Gluteus maximus ipsilateral","Deep hip stabilisers","Diaphragm coordination"],
        tight:["Thoracolumbar fascia limits TA tensioning","Hip flexors create anterior rotation"],
        kinetic:"Trunk rotation → asymmetric SI joint loading → lumbar facet asymmetric stress → poor athletic force transfer.",
        type:"Stability + Motor Control",
        risk:"SI joint dysfunction, lumbar disc torsion, poor sports performance force leaks at lumbopelvic junction.",
        compensation:"Trunk rotates with extending limbs — treats trunk and limb as single unit rather than dissociating.",
        treatment:["Phase 1: arm extension only no leg 3×10","Phase 2: leg extension only 3×10","Phase 3: combine slowly 3s hold 3×8","Phase 4: add resistance band on extending limb","Phase 5: book on back maintain level","Exhale to brace → then extend"],
        exercises:["Bird-dog arm only 3×10","Bird-dog leg only 3×10","Bird-dog combined slow 3s hold 3×8","Book on back quadruped hold 3×30s","Pallof press 3×12 each direction","Dead bug 3×10"]},
      hip_drop_rs:{
        label:"Hip Drop in Quadruped",
        meaning:"Hip drops on extending leg side — lateral hip stabiliser weakness in quadruped.",
        biomech:"Extending leg creates abduction moment — glute med must resist. Weakness allows pelvis to drop toward extending leg side.",
        weak:["Gluteus medius ipsilateral","Gluteus minimus","Deep hip stabilisers","QL contralateral"],
        tight:["Contralateral QL must lengthen to allow drop","Hip adductors ipsilateral"],
        kinetic:"Hip drop → pelvic obliquity → asymmetric L4-5 loading → SI joint rotation.",
        type:"Stability",
        risk:"SI joint dysfunction, asymmetric lumbar disc loading, hip abductor tendinopathy.",
        compensation:"Contralateral trunk lean reduces apparent hip drop — masking abductor weakness.",
        treatment:["Glute med: clamshell 3×20, side-lying abduction 3×15","Quadruped hip extension donkey kick level pelvis 3×15","Cue: keep hips level like a table-top","Palpate ASIS for symmetry during exercise"],
        exercises:["Clamshell 3×20","Side-lying hip abduction 3×15","Quadruped hip extension level 3×15","Single-leg bridge 3×12","Lateral band walk 3×12"]},
      spine_flexion_extension_rs:{
        label:"Lumbar Flexion or Extension During Movement",
        meaning:"Lumbar moves into flexion or extension instead of neutral — poor core control in quadruped.",
        biomech:"Hip flexors pull lumbar into extension OR abdominals allow flexion during limb extension. Both indicate failure to maintain neutral.",
        weak:["Multifidus limits extension","TA limits flexion","Gluteus maximus limits anterior pelvic tilt"],
        tight:["Hip flexors cause extension","Hamstrings cause flexion compensation"],
        kinetic:"Lumbar movement → increased disc and facet loading dynamically → cumulative injury risk.",
        type:"Stability + Motor Control",
        risk:"Lumbar disc herniation, facet degeneration, SI joint stress.",
        compensation:"Lumbar moves to allow limb range that trunk stability cannot support — spine subsidises for lack of control.",
        treatment:["Pelvic neutral awareness: anterior → neutral → posterior tilt drill","Bird-dog with therapist hand under lumbar feedback","Pressure biofeedback maintain pressure during bird-dog","Core stabilisation in 4-point before limb movement"],
        exercises:["Pelvic tilt awareness drill 3×10 each direction","Bird-dog with lumbar feedback 3×10","TA drawing-in bird-dog 3×10","Pressure biofeedback bird-dog 3×10","Dead bug mirror pattern 3×10"]},
      loss_of_balance_rs:{
        label:"Loss of Balance / Falls from Quadruped",
        meaning:"Cannot maintain quadruped stability during limb extension — severe proximal stability deficit.",
        biomech:"Quadruped balance requires integrated wrist, shoulder, trunk, and hip proprioception. Loss indicates multi-segmental failure.",
        weak:["Wrist shoulder stabilisers","Core globally","Hip stabilisers"],
        tight:["Not primarily a tightness issue"],
        kinetic:"Balance loss → inability to perform safe functional loading → high injury risk.",
        type:"Motor Control + Proprioception",
        risk:"Falls risk, inability to safely perform athletic movements, poor deceleration.",
        compensation:"Rapid limb replacement, trunk lean, wide hand/knee placement.",
        treatment:["Regress: quadruped hold no limb extension 3×30s","Bear crawl dynamic quadruped 3×10m","Wrist stability: wrist circles closed-chain","Progress very gradually — stable before extending limbs"],
        exercises:["Quadruped hold stable 3×30s","Bear crawl 3×10m","Wrist stability drills 3×10","Quadruped weight shifts 3×10","Single-limb extension only when stable 3×10"]},
      only_diagonal_rs:{
        label:"Can Only Perform Diagonal (Not Unilateral) — Grade 2",
        meaning:"Cannot extend same-side arm + leg but can do contralateral — incomplete proximal stability.",
        biomech:"Unilateral extension creates greater rotational moment than diagonal. Diagonal is biomechanically easier — contralateral extension creates counterbalancing moments.",
        weak:["Deep stabilisers multifidus TA","Ipsilateral glute max","Core canister generally"],
        tight:["None specifically — strength/control deficit"],
        kinetic:"Unilateral deficit → reliance on counter-rotation strategy — adequate for daily function, insufficient for sport.",
        type:"Motor Control",
        risk:"Moderate athletic performance limitation — insufficient for sport-specific demands.",
        compensation:"Uses diagonal as compensatory strategy — counterbalancing reduces rotational demand.",
        treatment:["Practice unilateral bird-dog same side emphasis","Progress: resistance band on extending arm and leg","Core advancement: plank, dead bug with load","Re-test monthly — expect 6-8 weeks to achieve unilateral"],
        exercises:["Bird-dog ipsilateral emphasis 3×10 each","Ipsilateral bird-dog 2s hold 3×8","Pallof press anti-rotation 3×12","Dead bug challenging 3×10","Plank alternate leg lift 3×10 each"]},
      asymmetry_rs:{
        label:"Left-Right Asymmetry",
        meaning:"Performance differs between sides — unilateral stability or mobility deficit from previous injury or compensation.",
        biomech:"Asymmetric motor control from CNS adaptation to previous injury or dominant side overuse creates side-to-side difference.",
        weak:["Deep stabilisers weaker side","Glute max/med affected side"],
        tight:["Hip rotators affected side create rotational pull"],
        kinetic:"Asymmetry → asymmetric athletic load → overuse injury restricted side — key injury predictor.",
        type:"Motor Control (Asymmetrical)",
        risk:"High injury risk restricted side — asymmetry strongest predictor of future musculoskeletal injury.",
        compensation:"Stronger side used preferentially — restricted side avoids demand.",
        treatment:["Emphasise weaker side all exercises","Single-limb core exercises restricted side","Document and track progress every 4 weeks","Sport-specific loading after symmetry achieved"],
        exercises:["Bird-dog restricted side emphasis 3×10","Single-leg bridge restricted 3×12","Pallof press restricted side lead 3×12","Unilateral dead bug 3×10 restricted","Re-assess monthly track asymmetry"]},
      pain_clearing_rs:{
        label:"Pain on Clearing Test (Quadruped Rocking)",
        meaning:"Pain during quadruped rocking / child's pose — lumbar flexion or hip pathology limiting safe testing.",
        biomech:"Quadruped rocking loads hip flexion and lumbar flexion simultaneously. Pain indicates hip FAI, labral issue, lumbar flexion sensitivity, or SI joint dysfunction.",
        weak:["Not a weakness issue — pathological limitation"],
        tight:["Posterior hip capsule hip pain","Thoracolumbar fascia lumbar pain"],
        kinetic:"Pain → guarded movement → global co-contraction → further stiffness and restriction.",
        type:"Pathological — Score = 0",
        risk:"Hip FAI/labral tear, lumbar disc herniation flexion type, SI joint dysfunction. DO NOT LOAD.",
        compensation:"Hip pain avoidance → posterior lean → lumbar hyperextension substitute.",
        treatment:["IMMEDIATE: Score = 0. Refer for assessment — imaging if indicated","Differentiate: hip vs lumbar origin of pain","Address FAI conservatively or refer surgically","Lumbar: McKenzie assessment directional preference"],
        exercises:["Address pain first — no quadruped loading","Hip: gentle AROM pain-free range","Lumbar: directional preference McKenzie","Refer if not resolving","Water-based therapy if too painful for land"]}
    }
  }
};

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
const FMS_STORAGE_KEY2="fms_clinical_v1";
function loadFMSReport(){try{return JSON.parse(localStorage.getItem(FMS_STORAGE_KEY2)||"{}");}catch{return{};}}
function saveFMSReport(r){try{localStorage.setItem(FMS_STORAGE_KEY2,JSON.stringify(r));}catch{}}


export { SubjectiveModule, KineticChainSection };
