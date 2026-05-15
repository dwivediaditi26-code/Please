import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { C, getC } from './theme.jsx';

function loadPatientDB() {
  try {
    const stored = JSON.parse(localStorage.getItem(DB_KEY) || "[]");
    // Seed demo patients if DB is empty or has never had them
    const hasDemos = stored.some(p => p.id && p.id.startsWith("demo_"));
    if (!hasDemos) {
      const seeded = [...DEMO_PATIENTS, ...stored];
      try { localStorage.setItem(DB_KEY, JSON.stringify(seeded)); } catch {}
      return seeded;
    }
    return stored;
  } catch { return DEMO_PATIENTS; }
}
function savePatientDB(patients) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(patients)); } catch {}
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── Avatar initials helper ─────────────────────────────────────────────────────
function getInitials(name="") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
  return name.slice(0,2).toUpperCase() || "?";
}

// ── Avatar gradient by id ──────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  ["#00e5ff","#7f5af0"],["#f97316","#ff4d6d"],["#00c97a","#00e5ff"],
  ["#ffb300","#f97316"],["#a78bfa","#ec4899"],["#38bdf8","#00c97a"],
];
function avatarGrad(id="") {
  const i = id.charCodeAt(id.length-1) % AVATAR_GRADIENTS.length;
  return `linear-gradient(135deg,${AVATAR_GRADIENTS[i][0]},${AVATAR_GRADIENTS[i][1]})`;
}

// ─── PATIENT PROFILE MODAL ─────────────────────────────────────────────────────
function PatientProfileModal({ patient, onClose, onLoadAssessment, onSaveField }) {
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...patient.data });

  const d = editData;
  const ef = (field, val) => setEditData(prev => ({ ...prev, [field]: val }));

  const age  = d.dem_age  || "";
  const sex  = d.dem_sex  || d.dem_gender || "";
  const occ  = d.dem_occupation || "";
  const gp   = d.dem_gp   || "";
  const phone= d.dem_phone || "";
  const email= d.dem_email || "";
  const dob  = d.dem_dob  || "";
  const addr = d.dem_address || "";
  const nok  = d.dem_nok  || "";
  const nokPhone = d.dem_nok_phone || "";
  const insurer  = d.dem_insurer  || "";
  const insRef   = d.dem_ins_ref  || "";
  const sessions = patient.sessions || [];
  const completedFields = Object.keys(d).filter(k => d[k] && d[k] !== "").length;

  // Pill style
  const pill = (label, color="#00e5ff") => (
    <span key={label} style={{display:"inline-block",padding:"2px 8px",borderRadius:20,
      background:`${color}15`,border:`1px solid ${color}40`,color,fontSize:"0.62rem",fontWeight:600,margin:"2px 3px 2px 0"}}>
      {label}
    </span>
  );

  const inp = (field, placeholder, type="text") => (
    <input type={type} value={d[field]||""} onChange={e=>ef(field,e.target.value)}
      placeholder={placeholder}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:8,color:"#1a1025",padding:"8px 11px",fontSize:"0.78rem",outline:"none",
        fontFamily:"inherit"}}/>
  );
  const ta = (field, placeholder, rows=3) => (
    <textarea value={d[field]||""} onChange={e=>ef(field,e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:8,color:"#1a1025",padding:"8px 11px",fontSize:"0.78rem",outline:"none",
        fontFamily:"inherit",resize:"vertical"}}/>
  );

  const label = (txt) => (
    <div style={{fontSize:"0.58rem",fontWeight:700,color:"#4a6070",textTransform:"uppercase",
      letterSpacing:"1px",marginBottom:4}}>{txt}</div>
  );
  const val = (txt, fallback="—") => (
    <div style={{fontSize:"0.8rem",color: txt ? "#d4e0f0" : "#2a3f55",fontWeight: txt ? 500 : 400}}>
      {txt || fallback}
    </div>
  );
  const field2 = (lbl, txt) => (
    <div style={{marginBottom:12}}>
      {label(lbl)}{val(txt)}
    </div>
  );

  const sectionHead = (icon, title) => (
    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12,marginTop:4,
      paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
      <span style={{fontSize:"1rem"}}>{icon}</span>
      <div style={{fontWeight:800,fontSize:"0.82rem",color:"#1a1025"}}>{title}</div>
    </div>
  );

  const saveEdits = () => {
    onSaveField(patient.id, editData);
    setEditing(false);
  };

  const tabs = [
    {id:"overview", icon:"👤", label:"Overview"},
    {id:"contact",  icon:"📞", label:"Contact"},
    {id:"medical",  icon:"🏥", label:"Medical Hx"},
    {id:"sessions", icon:"📅", label:"Sessions"},
    {id:"flags",    icon:"🚩", label:"Flags"},
  ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",
      justifyContent:"center",background:"rgba(0,0,0,0.92)",padding:"12px"}}>
      <div style={{width:"100%",maxWidth:680,maxHeight:"92vh",background:"#0a0e15",
        border:"1px solid rgba(0,229,255,0.15)",borderRadius:18,display:"flex",
        flexDirection:"column",overflow:"hidden",
        boxShadow:"0 30px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(0,229,255,0.08)"}}>

        {/* ── Profile Hero ─────────────────────────────────────────────── */}
        <div style={{background:"linear-gradient(135deg,rgba(0,229,255,0.06),rgba(127,90,240,0.08))",
          borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"20px 22px 16px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
            {/* Avatar */}
            <div style={{width:62,height:62,borderRadius:16,background:avatarGrad(patient.id),
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"1.4rem",fontWeight:900,color:"#000",flexShrink:0,
              boxShadow:`0 4px 20px ${AVATAR_GRADIENTS[patient.id.charCodeAt(patient.id.length-1)%6][0]}40`}}>
              {getInitials(patient.name)}
            </div>

            {/* Name + meta */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <div style={{fontWeight:900,fontSize:"1.15rem",color:"#1a1025"}}>
                  {patient.name || "Unnamed Patient"}
                </div>
                {patient.hasRedFlags && (
                  <span style={{padding:"2px 8px",borderRadius:20,background:"rgba(255,77,109,0.15)",
                    border:"1px solid rgba(255,77,109,0.4)",color:"#ff4d6d",fontSize:"0.6rem",fontWeight:700}}>
                    🚩 RED FLAGS
                  </span>
                )}
              </div>
              <div style={{fontSize:"0.72rem",color:"#5a7090",marginTop:4,display:"flex",gap:8,flexWrap:"wrap"}}>
                {age && <span>🎂 {age} years</span>}
                {sex && <span>⚧ {sex}</span>}
                {occ && <span>💼 {occ}</span>}
                {dob && <span>📅 {dob}</span>}
              </div>
              {patient.lastDx && (
                <div style={{marginTop:6,padding:"3px 10px",background:"rgba(0,201,122,0.1)",
                  border:"1px solid rgba(0,201,122,0.2)",borderRadius:8,display:"inline-block",
                  fontSize:"0.67rem",color:"#00c97a",fontWeight:600}}>
                  🩺 Dx: {patient.lastDx}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
              <button onClick={onClose}
                style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,
                  color:"#5a7090",cursor:"pointer",padding:"6px 12px",fontSize:"0.68rem"}}>✕ Close</button>
              <button onClick={()=>{ onLoadAssessment(patient); onClose(); }}
                style={{background:"linear-gradient(135deg,#00e5ff,#7f5af0)",border:"none",borderRadius:8,
                  color:"#000",cursor:"pointer",padding:"7px 12px",fontSize:"0.68rem",fontWeight:800}}>
                📋 Open Assessment
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
            {[
              {icon:"📝", val: completedFields, label:"Fields"},
              {icon:"📅", val: sessions.length || "0", label:"Sessions"},
              {icon:"🗓", val: new Date(patient.createdAt).toLocaleDateString("en-GB"), label:"Created"},
              {icon:"🔄", val: new Date(patient.updatedAt).toLocaleDateString("en-GB"), label:"Updated"},
            ].map(s => (
              <div key={s.label} style={{flex:"1 1 80px",background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"8px 10px",
                textAlign:"center"}}>
                <div style={{fontSize:"1rem",marginBottom:2}}>{s.icon}</div>
                <div style={{fontWeight:800,fontSize:"0.88rem",color:"#1a1025"}}>{s.val}</div>
                <div style={{fontSize:"0.58rem",color:"#3a5070",textTransform:"uppercase",letterSpacing:"0.8px"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────────────── */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.06)",
          flexShrink:0,overflowX:"auto"}}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>{setTab(t.id);setEditing(false);}}
              style={{flex:"0 0 auto",padding:"10px 16px",background:"none",
                border:"none",borderBottom:`2px solid ${tab===t.id?"#00e5ff":"transparent"}`,
                color:tab===t.id?"#00e5ff":"#4a6070",cursor:"pointer",
                fontSize:"0.72rem",fontWeight:700,display:"flex",alignItems:"center",gap:5,
                transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ──────────────────────────────────────────────── */}
        <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>

          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div>
              {!editing ? (
                <>
                  {sectionHead("🧍","Demographics")}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
                    {field2("Full Name", d.dem_name)}
                    {field2("Date of Birth", dob)}
                    {field2("Age", age ? `${age} years` : "")}
                    {field2("Sex / Gender", sex)}
                    {field2("Occupation", occ)}
                    {field2("Work Status", d.dem_work_status)}
                    {field2("Referring GP", gp)}
                    {field2("Ethnicity", d.dem_ethnicity)}
                  </div>

                  {sectionHead("🎯","Presenting Complaint")}
                  {d.cc_main ? (
                    <div style={{background:"rgba(0,229,255,0.04)",border:"1px solid rgba(0,229,255,0.1)",
                      borderRadius:10,padding:"10px 14px",fontSize:"0.8rem",color:"#a0c8e8",lineHeight:1.7,
                      fontStyle:"italic",marginBottom:14}}>
                      "{d.cc_main}"
                    </div>
                  ) : <div style={{color:"#2a3f55",fontSize:"0.78rem",marginBottom:14}}>No presenting complaint recorded</div>}

                  {d.cc_location?.length > 0 && (
                    <div style={{marginBottom:12}}>
                      {label("Pain Locations")}
                      <div>{(Array.isArray(d.cc_location)?d.cc_location:[d.cc_location]).map(l=>pill(l,"#00e5ff"))}</div>
                    </div>
                  )}

                  {d.pa_vas_now && (
                    <div style={{marginBottom:12}}>
                      {label("Pain Scores (VAS)")}
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        {[["Now",d.pa_vas_now,"#ffb300"],["Worst",d.pa_vas_worst,"#ff4d6d"],["Best",d.pa_vas_best,"#00c97a"]].map(([lbl,v,c])=>v?(
                          <div key={lbl} style={{textAlign:"center",padding:"6px 12px",
                            background:`${c}12`,border:`1px solid ${c}30`,borderRadius:8}}>
                            <div style={{fontSize:"1.1rem",fontWeight:800,color:c}}>{v}/10</div>
                            <div style={{fontSize:"0.58rem",color:"#4a6070"}}>{lbl}</div>
                          </div>
                        ):null)}
                      </div>
                    </div>
                  )}

                  {d.ar_goal_function && (
                    <div style={{marginBottom:12}}>
                      {label("Patient Goal")}
                      <div style={{fontSize:"0.8rem",color:"#00c97a"}}>🎯 {d.ar_goal_function}</div>
                    </div>
                  )}

                  <button onClick={()=>setEditing(true)}
                    style={{marginTop:8,padding:"9px 20px",borderRadius:9,border:"1px solid rgba(0,229,255,0.3)",
                      background:"rgba(0,229,255,0.08)",color:"#00e5ff",fontWeight:700,
                      fontSize:"0.75rem",cursor:"pointer"}}>
                    ✏️ Edit Demographics
                  </button>
                </>
              ) : (
                <>
                  {sectionHead("✏️","Edit Demographics")}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px"}}>
                    <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Full Name</div>{inp("dem_name","Full name")}</div>
                    <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Date of Birth</div>{inp("dem_dob","DD/MM/YYYY")}</div>
                    <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Age</div>{inp("dem_age","Years","number")}</div>
                    <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Sex / Gender</div>{inp("dem_sex","e.g. Female")}</div>
                    <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Occupation</div>{inp("dem_occupation","Job title")}</div>
                    <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Work Status</div>{inp("dem_work_status","e.g. Full time")}</div>
                    <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Referring GP</div>{inp("dem_gp","GP name")}</div>
                    <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Ethnicity</div>{inp("dem_ethnicity","Ethnicity")}</div>
                  </div>
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Address</div>
                    {ta("dem_address","Full address",2)}
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:14}}>
                    <button onClick={saveEdits}
                      style={{padding:"9px 22px",borderRadius:9,border:"none",
                        background:"linear-gradient(135deg,#00e5ff,#7f5af0)",color:"#000",
                        fontWeight:800,fontSize:"0.78rem",cursor:"pointer"}}>
                      💾 Save Changes
                    </button>
                    <button onClick={()=>{setEditing(false);setEditData({...patient.data});}}
                      style={{padding:"9px 16px",borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",
                        background:"transparent",color:"#5a7090",fontSize:"0.75rem",cursor:"pointer"}}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CONTACT TAB */}
          {tab === "contact" && (
            <div>
              {sectionHead("📞","Contact Details")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:16}}>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Phone</div>{inp("dem_phone","Mobile number")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Email</div>{inp("dem_email","Email address","email")}</div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Address</div>
                {ta("dem_address","Full home address",2)}
              </div>

              {sectionHead("🆘","Next of Kin")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:16}}>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>NOK Name</div>{inp("dem_nok","Next of kin name")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>NOK Phone</div>{inp("dem_nok_phone","NOK phone number")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Relationship</div>{inp("dem_nok_rel","e.g. Spouse, Parent")}</div>
              </div>

              {sectionHead("🏥","Insurance / Referral")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:16}}>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Insurer</div>{inp("dem_insurer","Insurance company")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Policy / Ref No.</div>{inp("dem_ins_ref","Policy reference")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Referral Source</div>{inp("dem_referral","e.g. GP, Self, Insurer")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>GP Name</div>{inp("dem_gp","Referring GP")}</div>
              </div>

              <button onClick={saveEdits}
                style={{padding:"9px 22px",borderRadius:9,border:"none",
                  background:"linear-gradient(135deg,#00e5ff,#7f5af0)",color:"#000",
                  fontWeight:800,fontSize:"0.78rem",cursor:"pointer"}}>
                💾 Save Contact Details
              </button>
            </div>
          )}

          {/* MEDICAL HISTORY TAB */}
          {tab === "medical" && (
            <div>
              {sectionHead("🏥","Past Medical History")}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Current Conditions</div>
                {ta("phx_conditions","e.g. Type 2 diabetes, Hypertension, Osteoporosis…",3)}
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Previous Injuries / Surgeries</div>
                {ta("phx_injuries","e.g. L knee meniscectomy 2018, ACL repair 2019…",3)}
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Current Medications</div>
                {ta("meds_current","List medications and doses…",3)}
              </div>

              {sectionHead("💊","Allergies & Precautions")}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Allergies</div>
                {inp("dem_allergies","Drug/latex/other allergies")}
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Precautions / Contraindications</div>
                {ta("dem_precautions","e.g. Anticoagulants — no deep needling; Pacemaker — no TENS…",2)}
              </div>

              {sectionHead("🏃","Activity & Lifestyle")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:16}}>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Activity Level</div>{inp("dem_activity","e.g. Sedentary, Active 3x/week")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Sport / Exercise</div>{inp("dem_sport","e.g. Running, Football, Swimming")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Smoking</div>{inp("dem_smoking","e.g. Non-smoker, 10/day")}</div>
                <div><div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Alcohol</div>{inp("dem_alcohol","e.g. Occasional, 14 units/week")}</div>
              </div>

              <div style={{marginBottom:16}}>
                <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Patient Goals</div>
                {ta("ar_goal_function","What does the patient want to return to?",2)}
              </div>

              <button onClick={saveEdits}
                style={{padding:"9px 22px",borderRadius:9,border:"none",
                  background:"linear-gradient(135deg,#00e5ff,#7f5af0)",color:"#000",
                  fontWeight:800,fontSize:"0.78rem",cursor:"pointer"}}>
                💾 Save Medical History
              </button>
            </div>
          )}

          {/* SESSIONS TAB */}
          {tab === "sessions" && (
            <div>
              {sectionHead("📅","Session History")}
              {sessions.length === 0 ? (
                <div style={{textAlign:"center",padding:"40px 20px",color:"#3a5070"}}>
                  <div style={{fontSize:"2rem",marginBottom:8}}>📋</div>
                  <div style={{fontSize:"0.82rem",marginBottom:6}}>No sessions recorded yet</div>
                  <div style={{fontSize:"0.68rem",color:"#2a3f55"}}>
                    Each time you open this patient's assessment and save, a session will be logged here.
                  </div>
                </div>
              ) : sessions.map((s, i) => (
                <div key={i} style={{padding:"11px 14px",background:"rgba(255,255,255,0.02)",
                  border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:700,color:"#1a1025",fontSize:"0.8rem"}}>
                      Session {sessions.length - i}
                    </div>
                    <div style={{fontSize:"0.65rem",color:"#4a6070"}}>
                      {new Date(s.date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
                    </div>
                  </div>
                  {s.dx && <div style={{fontSize:"0.68rem",color:"#00c97a",marginTop:3}}>Dx: {s.dx}</div>}
                  {s.notes && <div style={{fontSize:"0.7rem",color:"#5a7090",marginTop:4,lineHeight:1.5}}>{s.notes}</div>}
                </div>
              ))}

              <div style={{marginTop:16}}>
                {sectionHead("📝","Session Notes")}
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:"0.6rem",color:"#4a6070",marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>
                    Notes for current session
                  </div>
                  {ta("session_notes","Clinical notes, treatment given, patient response, plan…",5)}
                </div>
                <button onClick={saveEdits}
                  style={{padding:"9px 22px",borderRadius:9,border:"none",
                    background:"linear-gradient(135deg,#00e5ff,#7f5af0)",color:"#000",
                    fontWeight:800,fontSize:"0.78rem",cursor:"pointer"}}>
                  💾 Save Session Notes
                </button>
              </div>
            </div>
          )}

          {/* FLAGS TAB */}
          {tab === "flags" && (
            <div>
              {sectionHead("🚩","Red Flags")}
              {patient.hasRedFlags ? (
                <div style={{padding:"12px 14px",background:"rgba(255,77,109,0.08)",
                  border:"1px solid rgba(255,77,109,0.3)",borderRadius:10,marginBottom:14}}>
                  <div style={{fontWeight:700,color:"#ff4d6d",marginBottom:6,fontSize:"0.82rem"}}>
                    ⚠️ Red flags detected in this assessment
                  </div>
                  <div style={{fontSize:"0.72rem",color:"#c04060",lineHeight:1.6}}>
                    Review the Subjective Assessment → Red Flags section for details. Consider urgent referral if cauda equina or vascular flags are present.
                  </div>
                </div>
              ) : (
                <div style={{padding:"12px 14px",background:"rgba(0,201,122,0.06)",
                  border:"1px solid rgba(0,201,122,0.2)",borderRadius:10,marginBottom:14}}>
                  <div style={{fontWeight:700,color:"#00c97a",fontSize:"0.8rem"}}>✅ No red flags detected</div>
                </div>
              )}

              {sectionHead("⚠️","Clinical Precautions")}
              <div style={{marginBottom:12}}>
                {ta("dem_precautions","Note any clinical precautions or contraindications for this patient…",3)}
              </div>

              {sectionHead("📋","Consent & Documentation")}
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                {[
                  ["dem_consent_verbal","Verbal consent obtained"],
                  ["dem_consent_written","Written consent obtained"],
                  ["dem_consent_photo","Photo/video consent obtained"],
                  ["dem_gdpr","GDPR data processing explained"],
                ].map(([field, label_]) => {
                  const checked = !!d[field];
                  return (
                    <div key={field} onClick={()=>ef(field, checked ? "" : "yes")}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",
                        background:checked?"rgba(0,201,122,0.08)":"rgba(255,255,255,0.02)",
                        border:`1px solid ${checked?"rgba(0,201,122,0.3)":"rgba(255,255,255,0.06)"}`,
                        borderRadius:9,cursor:"pointer"}}>
                      <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${checked?"#00c97a":"#3a5070"}`,
                        background:checked?"#00c97a":"transparent",display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:"0.65rem",color:"#000",fontWeight:900,flexShrink:0}}>
                        {checked?"✓":""}
                      </div>
                      <span style={{fontSize:"0.78rem",color:checked?"#00c97a":"#5a7090",fontWeight:checked?600:400}}>
                        {label_}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button onClick={saveEdits}
                style={{padding:"9px 22px",borderRadius:9,border:"none",
                  background:"linear-gradient(135deg,#00e5ff,#7f5af0)",color:"#000",
                  fontWeight:800,fontSize:"0.78rem",cursor:"pointer"}}>
                💾 Save
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── PATIENT CARD ──────────────────────────────────────────────────────────────
function PatientCard({ patient, isActive, onSelect, onDelete, onProfile }) {
  const age    = patient.data?.dem_age    ? `${patient.data.dem_age}y` : "";
  const sex    = patient.data?.dem_sex    || patient.data?.dem_gender || "";
  const occ    = patient.data?.dem_occupation || "";
  const dx     = patient.lastDx || "";
  const filled = Object.keys(patient.data||{}).filter(k=>patient.data[k]&&patient.data[k]!=="").length;
  const hasRed = patient.hasRedFlags;
  const vas    = patient.data?.pa_vas_now;
  const vasColor = vas ? (parseInt(vas)>=7?"#ff4d6d":parseInt(vas)>=4?"#ffb300":"#00c97a") : null;

  return (
    <div style={{
      padding:"11px 13px", borderRadius:12, cursor:"pointer", marginBottom:7,
      background: isActive ? "rgba(0,229,255,0.06)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isActive ? "rgba(0,229,255,0.3)" : "rgba(255,255,255,0.05)"}`,
      transition:"all 0.15s", position:"relative",
      borderLeft:`3px solid ${hasRed?"#ff4d6d":isActive?"#00e5ff":"transparent"}`,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {/* Avatar */}
        <div style={{width:38,height:38,borderRadius:11,background:avatarGrad(patient.id),
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"0.8rem",fontWeight:900,color:"#000",flexShrink:0}}>
          {getInitials(patient.name)}
        </div>

        <div style={{flex:1,minWidth:0}} onClick={onSelect}>
          <div style={{fontWeight:700,fontSize:"0.82rem",color:"#1a1025",
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {patient.name || "Unnamed Patient"}
            {hasRed && <span style={{marginLeft:5,fontSize:"0.6rem",color:"#ff4d6d"}}>🚩</span>}
          </div>
          <div style={{fontSize:"0.63rem",color:"#4a6070",marginTop:1,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {[age,sex,occ].filter(Boolean).join(" · ") || "No demographics"}
          </div>
          {dx && <div style={{fontSize:"0.6rem",color:"rgba(0,201,122,0.7)",marginTop:2,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>🩺 {dx}</div>}
        </div>

        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
          {vas && (
            <div style={{padding:"1px 6px",borderRadius:6,background:`${vasColor}18`,
              border:`1px solid ${vasColor}40`,fontSize:"0.6rem",fontWeight:700,color:vasColor}}>
              VAS {vas}
            </div>
          )}
          <div style={{fontSize:"0.55rem",color:"#2a3f55"}}>
            {new Date(patient.updatedAt).toLocaleDateString("en-GB")}
          </div>
          <div style={{display:"flex",gap:4,marginTop:2}}>
            <button onClick={e=>{e.stopPropagation();onProfile();}}
              style={{background:"rgba(0,229,255,0.08)",border:"1px solid rgba(0,229,255,0.2)",
                color:"#00e5ff",borderRadius:5,cursor:"pointer",fontSize:"0.55rem",
                padding:"2px 6px",fontWeight:700}}>
              Profile
            </button>
            <button onClick={e=>{e.stopPropagation();onDelete();}}
              style={{background:"none",border:"none",
                color:"rgba(255,77,109,0.35)",cursor:"pointer",fontSize:"0.65rem",padding:"2px 4px"}}>
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PATIENT DATABASE PANEL ────────────────────────────────────────────────────
function PatientDatabasePanel({ patients, activeId, onSelect, onNew, onDelete, onClose, onImport }) {
  const [search, setSearch]       = useState("");
  const [sortBy, setSortBy]       = useState("updated");
  const [filterFlag, setFilterFlag] = useState(false);
  const [profilePatient, setProfilePatient] = useState(null);
  const [localPatients, setLocalPatients] = useState(patients);
  const fileRef = useRef(null);

  // Keep local in sync when parent updates
  useEffect(() => { setLocalPatients(patients); }, [patients]);

  const handleSaveField = (id, newData) => {
    setLocalPatients(prev => prev.map(p => p.id===id
      ? {...p, data:{...p.data,...newData}, name:newData.dem_name||p.name, updatedAt:new Date().toISOString()}
      : p
    ));
    // Persist via the select mechanism (triggers parent save)
    try {
      const stored = JSON.parse(localStorage.getItem("physio_patient_db_v1") || "[]");
      const updated = stored.map(p => p.id===id
        ? {...p, data:{...p.data,...newData}, name:newData.dem_name||p.name, updatedAt:new Date().toISOString()}
        : p
      );
      localStorage.setItem("physio_patient_db_v1", JSON.stringify(updated));
    } catch {}
  };

  const filtered = localPatients
    .filter(p => {
      if (filterFlag && !p.hasRedFlags) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (p.name||"").toLowerCase().includes(q) ||
        (p.data?.dem_occupation||"").toLowerCase().includes(q) ||
        (p.data?.dem_sex||"").toLowerCase().includes(q) ||
        (p.lastDx||"").toLowerCase().includes(q);
    })
    .sort((a,b) => {
      if (sortBy==="name")   return (a.name||"").localeCompare(b.name||"");
      if (sortBy==="fields") return Object.keys(b.data||{}).length - Object.keys(a.data||{}).length;
      if (sortBy==="age")    return parseInt(a.data?.dem_age||0) - parseInt(b.data?.dem_age||0);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { try { onImport(JSON.parse(ev.target.result)); } catch {} };
    reader.readAsText(file);
  };

  const redFlagCount = localPatients.filter(p=>p.hasRedFlags).length;

  return (
    <>
    {/* Profile modal */}
    {profilePatient && (
      <PatientProfileModal
        patient={profilePatient}
        onClose={()=>setProfilePatient(null)}
        onLoadAssessment={(p)=>{ onSelect(p); setProfilePatient(null); }}
        onSaveField={handleSaveField}
      />
    )}

    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:300,
      display:"flex",alignItems:"stretch",justifyContent:"flex-start"}}>
      <div style={{width:"100%",maxWidth:440,background:"#080c12",
        borderRight:"1px solid rgba(0,229,255,0.1)",display:"flex",
        flexDirection:"column",height:"100%"}}>

        {/* Header */}
        <div style={{padding:"16px 18px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontWeight:900,fontSize:"1.05rem",color:"#00e5ff",letterSpacing:"-0.3px"}}>
                👥 Patient Database
              </div>
              <div style={{fontSize:"0.62rem",color:"#3a5070",marginTop:2}}>
                {localPatients.length} patient{localPatients.length!==1?"s":""} · {redFlagCount} with flags
              </div>
            </div>
            <button onClick={onClose}
              style={{background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,
                color:"#4a6070",cursor:"pointer",padding:"7px 13px",fontSize:"0.7rem"}}>✕ Close</button>
          </div>

          {/* Search */}
          <div style={{position:"relative",marginBottom:8}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",
              fontSize:"0.8rem",color:"#3a5070"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search name, diagnosis, occupation…"
              style={{width:"100%",background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,color:"#1a1025",
                outline:"none",padding:"8px 12px 8px 30px",fontSize:"0.76rem",boxSizing:"border-box"}}/>
          </div>

          {/* Filters row */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[["updated","🕐 Recent"],["name","A–Z"],["age","Age"],["fields","Complete"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSortBy(v)}
                style={{padding:"4px 9px",borderRadius:7,
                  border:`1px solid ${sortBy===v?"rgba(0,229,255,0.35)":"rgba(255,255,255,0.06)"}`,
                  background:sortBy===v?"rgba(0,229,255,0.1)":"transparent",
                  color:sortBy===v?"#00e5ff":"#3a5070",fontSize:"0.62rem",fontWeight:600,cursor:"pointer"}}>
                {l}
              </button>
            ))}
            <button onClick={()=>setFilterFlag(f=>!f)}
              style={{padding:"4px 9px",borderRadius:7,marginLeft:"auto",
                border:`1px solid ${filterFlag?"rgba(255,77,109,0.4)":"rgba(255,255,255,0.06)"}`,
                background:filterFlag?"rgba(255,77,109,0.12)":"transparent",
                color:filterFlag?"#ff4d6d":"#3a5070",fontSize:"0.62rem",fontWeight:600,cursor:"pointer"}}>
              🚩 Flags only
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.04)",flexShrink:0}}>
          {[
            {label:"Total", val:localPatients.length, color:"#00e5ff"},
            {label:"Active", val:localPatients.filter(p=>activeId===p.id).length, color:"#00c97a"},
            {label:"🚩 Flags", val:redFlagCount, color:"#ff4d6d"},
            {label:"Today", val:localPatients.filter(p=>new Date(p.updatedAt).toDateString()===new Date().toDateString()).length, color:"#ffb300"},
          ].map(s=>(
            <div key={s.label} style={{flex:1,padding:"8px 4px",textAlign:"center",
              borderRight:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{fontWeight:800,fontSize:"0.9rem",color:s.color}}>{s.val}</div>
              <div style={{fontSize:"0.55rem",color:"#2a3f55",textTransform:"uppercase",letterSpacing:"0.5px"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Patient list */}
        <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
          {filtered.length === 0 && (
            <div style={{textAlign:"center",padding:"40px 20px",color:"#2a3f55"}}>
              <div style={{fontSize:"2.5rem",marginBottom:8}}>👤</div>
              <div style={{fontSize:"0.82rem",color:"#3a5070"}}>
                {search ? "No patients match your search" : "No patients — tap New Patient to start"}
              </div>
            </div>
          )}
          {filtered.map(p => (
            <PatientCard
              key={p.id}
              patient={p}
              isActive={p.id === activeId}
              onSelect={()=>onSelect(p)}
              onDelete={()=>onDelete(p.id)}
              onProfile={()=>setProfilePatient(p)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,0.05)",flexShrink:0,display:"flex",flexDirection:"column",gap:7}}>
          <button onClick={onNew}
            style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#00e5ff,#7f5af0)",
              border:"none",borderRadius:10,color:"#000",fontWeight:900,fontSize:"0.85rem",cursor:"pointer"}}>
            ＋ New Patient
          </button>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>fileRef.current?.click()}
              style={{flex:1,padding:"9px",background:"rgba(0,201,122,0.08)",
                border:"1px solid rgba(0,201,122,0.2)",borderRadius:9,
                color:"#00c97a",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>
              📂 Import JSON
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} style={{display:"none"}}/>
            <button onClick={()=>{
                const data = JSON.stringify(localPatients,null,2);
                const blob = new Blob([data],{type:"application/json"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href=url; a.download="physio_patients_backup.json"; a.click();
                URL.revokeObjectURL(url);
              }}
              style={{flex:1,padding:"9px",background:"rgba(127,90,240,0.08)",
                border:"1px solid rgba(127,90,240,0.2)",borderRadius:9,
                color:"#7f5af0",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>
              💾 Export All
            </button>
          </div>
        </div>
      </div>

      {/* Click outside */}
      <div style={{flex:1}} onClick={onClose}/>
    </div>
    </>
  );
}



// ─── POSTURE DEFECTS DATA ─────────────────────────────────────────────────────
const POSTURE_DEFECTS = {
  forward_head: {
    id:"forward_head", icon:"🫀", label:"Forward Head Posture", region:"Cervical",
    view:["anterior","lateral"],
    description:"Ear positioned anterior to the acromion process. Each 2.5cm of forward translation adds ~10kg of effective cervical load.",
    tight_muscles:["Upper trapezius","SCM","Suboccipitals","Scalenes","Pec minor"],
    weak_muscles:["Deep neck flexors (DNF)","Lower trapezius","Serratus anterior","Rhomboids"],
    kinetic_chain:"Forward head → cervical lordosis → thoracic kyphosis → shoulder protraction → reduced lung capacity",
    exercises:["Chin tucks x15 3×","Wall angels x12 3×","DNF activation","Pec minor stretch"]
  },
  rounded_shoulders: {
    id:"rounded_shoulders", icon:"🔄", label:"Rounded/Protracted Shoulders", region:"Thoracic/Shoulder",
    view:["anterior","lateral","posterior"],
    description:"Anterior displacement of the humeral head with scapular protraction and internal rotation.",
    tight_muscles:["Pec major","Pec minor","Anterior deltoid","Subscapularis","Upper trapezius"],
    weak_muscles:["Lower trapezius","Serratus anterior","Rhomboids","Posterior rotator cuff"],
    kinetic_chain:"Protracted scapula → reduced subacromial space → impingement risk → compensatory cervical extension",
    exercises:["Band pull-apart x20","Face pulls x15","Pec doorway stretch","Scapular retraction holds"]
  },
  thoracic_kyphosis: {
    id:"thoracic_kyphosis", icon:"🪃", label:"Increased Thoracic Kyphosis", region:"Thoracic",
    view:["lateral","posterior"],
    description:"Excessive posterior convexity of the thoracic spine (>40° Cobb angle). May reduce respiratory capacity.",
    tight_muscles:["Pec major/minor","Anterior intercostals","Hip flexors"],
    weak_muscles:["Thoracic extensors","Lower trapezius","Gluteus maximus"],
    kinetic_chain:"Thoracic kyphosis → forward head → UCS → reduced hip extension → LCS compensations",
    exercises:["Thoracic extension over foam roller","T-spine rotation","Prone Y-T-W","Back extension"]
  },
  lumbar_hyperlordosis: {
    id:"lumbar_hyperlordosis", icon:"🌊", label:"Lumbar Hyperlordosis", region:"Lumbar",
    view:["lateral"],
    description:"Excessive anterior lumbar curve with anterior pelvic tilt. Increases facet joint loading.",
    tight_muscles:["Hip flexors (iliopsoas, rectus femoris)","TFL","Lumbar erectors","QL"],
    weak_muscles:["Gluteus maximus","Hamstrings","Transversus abdominis","Rectus abdominis"],
    kinetic_chain:"Anterior pelvic tilt → hip flexor tightness → glute inhibition → hamstring overload → posterior knee pain",
    exercises:["Hip flexor couch stretch","Glute bridges 3×15","Dead bug","TA activation"]
  },
  anterior_pelvic_tilt: {
    id:"anterior_pelvic_tilt", icon:"⬇", label:"Anterior Pelvic Tilt", region:"Lumbar/Pelvis",
    view:["lateral"],
    description:"ASIS positioned anterior and inferior to PSIS. Often co-exists with lumbar hyperlordosis.",
    tight_muscles:["Iliopsoas","Rectus femoris","TFL","Lumbar erectors"],
    weak_muscles:["Gluteus maximus","Hamstrings","TA","Internal obliques"],
    kinetic_chain:"APT → hip flexor tightness → glute inhibition → lumbar overload → disc stress at L4-S1",
    exercises:["Pelvic tilts","Couch stretch","Glute activation","Posterior pelvic tilt cues"]
  },
  posterior_pelvic_tilt: {
    id:"posterior_pelvic_tilt", icon:"⬆", label:"Posterior Pelvic Tilt", region:"Lumbar/Pelvis",
    view:["lateral"],
    description:"PSIS positioned inferior to ASIS. Flattens lumbar lordosis, often associated with prolonged sitting.",
    tight_muscles:["Hamstrings","Gluteus maximus","Rectus abdominis"],
    weak_muscles:["Hip flexors","Lumbar extensors","TFL"],
    kinetic_chain:"PPT → lumbar flexion bias → disc posterior loading → hamstring overuse",
    exercises:["Hip flexor stretching","Lumbar extension exercises","Prone hip extension","Cat-cow"]
  },
  lateral_pelvic_tilt: {
    id:"lateral_pelvic_tilt", icon:"↔", label:"Lateral Pelvic Tilt", region:"Lumbar/Pelvis",
    view:["anterior","posterior"],
    description:"Unilateral elevation of the iliac crest. May indicate leg length discrepancy or hip abductor weakness.",
    tight_muscles:["Ipsilateral QL","Ipsilateral TFL","Ipsilateral hip adductors"],
    weak_muscles:["Contralateral gluteus medius","Contralateral QL"],
    kinetic_chain:"Lateral pelvic tilt → scoliotic compensation → contralateral shoulder elevation → cervical lateral flexion",
    exercises:["Side-lying hip abduction","Clamshells","Standing hip abduction","QL stretch"]
  },
  genu_valgum: {
    id:"genu_valgum", icon:"🦵", label:"Genu Valgum (Knock Knees)", region:"Knee",
    view:["anterior","posterior"],
    description:"Medial deviation of the knee relative to the mechanical axis. Increases medial compartment and patellofemoral loading.",
    tight_muscles:["TFL","IT band","Hip adductors","Medial hamstrings"],
    weak_muscles:["Gluteus medius","Gluteus maximus","VMO","Hip external rotators"],
    kinetic_chain:"Genu valgum → hip IR → PFPS risk → medial ankle pronation → plantar fascia overload",
    exercises:["Clamshells","Monster walks","Single-leg squat with knee tracking","VMO terminal extensions"]
  },
  genu_varum: {
    id:"genu_varum", icon:"🦴", label:"Genu Varum (Bow Legs)", region:"Knee",
    view:["anterior","posterior"],
    description:"Lateral deviation of the knee. Increases lateral compartment loading and IT band tension.",
    tight_muscles:["IT band","Biceps femoris","Hip ER","Lateral gastrocnemius"],
    weak_muscles:["Hip adductors","VMO","Medial gastrocnemius"],
    kinetic_chain:"Genu varum → lateral knee overload → IT band syndrome → supinated foot posture",
    exercises:["IT band foam rolling","Hip adductor strengthening","Lateral step-downs","Arch support"]
  },
  foot_pronation: {
    id:"foot_pronation", icon:"🦶", label:"Foot Overpronation/Flat Arch", region:"Foot/Ankle",
    view:["anterior","posterior"],
    description:"Medial arch collapse with calcaneal eversion. The kinetic chain starting point for many lower limb issues.",
    tight_muscles:["Gastrocnemius","Soleus","Peroneals","Plantar fascia"],
    weak_muscles:["Tibialis posterior","FHL","Intrinsic foot muscles","Gluteus medius"],
    kinetic_chain:"Pronation → tibial IR → genu valgum → hip IR → PFPS → LCS compensations",
    exercises:["Short foot exercise","Calf raises","Tibialis posterior strengthening","Intrinsic foot doming"]
  },
  foot_supination: {
    id:"foot_supination", icon:"🔺", label:"Foot Supination/High Arch", region:"Foot/Ankle",
    view:["anterior","posterior"],
    description:"Elevated medial arch with reduced shock absorption. Associated with lateral ankle instability.",
    tight_muscles:["IT band","Peroneals","Plantar fascia","Gastroc lateral head"],
    weak_muscles:["Peroneals (with instability)","Intrinsic foot muscles"],
    kinetic_chain:"Supination → lateral ankle instability → lateral knee overload → genu varum compensation",
    exercises:["Peroneal strengthening","Single-leg balance","Lateral band walks","Arch mobilisation"]
  },
  scoliosis: {
    id:"scoliosis", icon:"〰", label:"Scoliosis / Lateral Spinal Curve", region:"Thoracic/Lumbar",
    view:["posterior"],
    description:"Lateral deviation of the spine with rotational component. Refer for Cobb angle measurement if suspected structural.",
    tight_muscles:["Ipsilateral concave paraspinals","Ipsilateral QL","Ipsilateral hip musculature"],
    weak_muscles:["Contralateral paraspinals","Convex-side core stabilisers"],
    kinetic_chain:"Scoliosis → rib cage rotation → shoulder height asymmetry → pelvic obliquity → leg length inequality",
    exercises:["Schroth breathing","Concave-side stretch","Convex-side strengthening","Pilates side-lying"]
  },
  head_tilt: {
    id:"head_tilt", icon:"↙", label:"Lateral Head Tilt", region:"Cervical",
    view:["anterior","posterior"],
    description:"Ipsilateral ear approaches ipsilateral shoulder. May indicate upper trap tightness or C-spine dysfunction.",
    tight_muscles:["Ipsilateral upper trapezius","Ipsilateral SCM","Ipsilateral scalenes","Ipsilateral levator scapulae"],
    weak_muscles:["Contralateral lateral neck flexors","Contralateral upper trapezius"],
    kinetic_chain:"Head tilt → cervical lateral flexion → ipsilateral shoulder elevation → compensatory thoracic curve",
    exercises:["Contralateral cervical lateral flexion stretch","Upper trap SMR","Levator scapulae stretch"]
  },
  scapular_winging: {
    id:"scapular_winging", icon:"🪶", label:"Scapular Winging", region:"Thoracic/Shoulder",
    view:["posterior"],
    description:"Medial border or inferior angle of scapula lifts from thoracic wall. Serratus anterior or trapezius dysfunction.",
    tight_muscles:["Pec minor","Pec major","Short head biceps"],
    weak_muscles:["Serratus anterior","Lower trapezius","Rhomboids"],
    kinetic_chain:"Scapular winging → reduced force couple → rotator cuff overload → impingement → biceps tendinopathy",
    exercises:["Serratus push-up plus","Wall slides","Lower trap Y raises","Scapular protraction resistance"]
  },
};

// ─── SEVERITY COLOUR MAPS ────────────────────────────────────────────────────
const SEVERITY_COLOR = { mild:"#ffb300", moderate:"#ff6b35", severe:"#ff4d6d" };
const SEVERITY_BG    = { mild:"rgba(255,179,0,0.1)", moderate:"rgba(255,107,53,0.1)", severe:"rgba(255,77,109,0.1)" };

// ─── POSTURE DEFECT DETAIL MODAL ─────────────────────────────────────────────
function PostureDefectDetail({ defectId, onClose }) {
  const d = POSTURE_DEFECTS[defectId];
  if (!d) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{width:"100%",maxWidth:560,background:"#ffffff",borderRadius:"16px 16px 0 0",border:"1px solid #d8cce8",padding:"20px 18px 32px",maxHeight:"85vh",overflowY:"auto"}}>
        {/* Handle bar */}
        <div style={{width:36,height:4,background:"#2a3f58",borderRadius:2,margin:"0 auto 16px"}}/>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{fontSize:"1.8rem"}}>{d.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:"1rem",fontWeight:800,color:"#1a1025"}}>{d.label}</div>
            <span style={{fontSize:"0.65rem",padding:"2px 8px",borderRadius:6,background:"rgba(0,229,255,0.12)",color:"#00e5ff",fontWeight:700}}>{d.region}</span>
          </div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #d8cce8",borderRadius:8,color:"#7e6a9a",cursor:"pointer",padding:"5px 10px",fontSize:"0.75rem"}}>✕</button>
        </div>
        {/* Description */}
        <div style={{padding:"10px 13px",background:"rgba(0,229,255,0.05)",border:"1px solid rgba(0,229,255,0.15)",borderRadius:10,fontSize:"0.76rem",color:"#a0c8e8",lineHeight:1.6,marginBottom:14}}>
          {d.description}
        </div>
        {/* Muscles */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{background:"rgba(255,77,109,0.06)",border:"1px solid rgba(255,77,109,0.2)",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:"0.6rem",fontWeight:800,color:"#ff4d6d",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:7}}>🔴 Tight / Overactive</div>
            {d.tight_muscles.map((m,i)=><div key={i} style={{fontSize:"0.68rem",color:"#1a1025",padding:"2px 0",borderBottom:"1px solid rgba(255,77,109,0.08)",lineHeight:1.4}}>{m}</div>)}
          </div>
          <div style={{background:"rgba(0,201,122,0.06)",border:"1px solid rgba(0,201,122,0.2)",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:"0.6rem",fontWeight:800,color:"#00c97a",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:7}}>🟢 Weak / Inhibited</div>
            {d.weak_muscles.map((m,i)=><div key={i} style={{fontSize:"0.68rem",color:"#1a1025",padding:"2px 0",borderBottom:"1px solid rgba(0,201,122,0.08)",lineHeight:1.4}}>{m}</div>)}
          </div>
        </div>
        {/* Kinetic chain */}
        <div style={{background:"rgba(127,90,240,0.07)",border:"1px solid rgba(127,90,240,0.2)",borderRadius:10,padding:"10px 13px",marginBottom:14}}>
          <div style={{fontSize:"0.6rem",fontWeight:800,color:"#7f5af0",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6}}>🔗 Kinetic Chain</div>
          <div style={{fontSize:"0.72rem",color:"#1a1025",lineHeight:1.6,fontStyle:"italic"}}>{d.kinetic_chain}</div>
        </div>
        {/* Exercises */}
        {d.exercises?.length > 0 && (
          <div>
            <div style={{fontSize:"0.6rem",fontWeight:800,color:"#00e5ff",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:8}}>💪 Corrective Exercises</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {d.exercises.map((ex,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"6px 10px",background:"rgba(0,229,255,0.05)",border:"1px solid rgba(0,229,255,0.12)",borderRadius:8,alignItems:"center"}}>
                  <span style={{color:"#00e5ff",fontWeight:800,fontSize:"0.7rem",flexShrink:0}}>{i+1}.</span>
                  <span style={{fontSize:"0.72rem",color:"#1a1025"}}>{ex}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PostureDefectModule() {
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [defectSeverity, setDefectSeverity]   = useState({});
  const [openDefect, setOpenDefect]           = useState(null);
  const [regionFilter, setRegionFilter]       = useState("All");
  const [patientName, setPatientName]         = useState("");
  const [clinicianName, setClinicianName]     = useState("");
  const [showExport, setShowExport]           = useState(false);
  const exportPDF = useCallback(async ({ patientName, clinicianName, selectedDefects, severity, date }) => {
    const severityLabel = { mild: "Mild", moderate: "Moderate", severe: "Severe" };
    const findingsHTML = selectedDefects.map(d => {
      const sev = severity?.[d.id] || "moderate";
      const sevColor = sev === "severe" ? "badge-red" : sev === "mild" ? "badge-green" : "badge-amber";
      return `
        <div class="section-box no-break" style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <strong style="font-size:12px">${d.name || d.id}</strong>
            <span class="badge ${sevColor}">${severityLabel[sev] || sev}</span>
          </div>
          ${d.region ? `<div><span class="badge badge-blue">${d.region}</span></div>` : ""}
          ${d.description ? `<p style="margin:6px 0;color:#374151">${d.description}</p>` : ""}
          ${d.tight_muscles?.length ? `<div style="margin-top:6px"><strong>Tight:</strong> ${d.tight_muscles.join(", ")}</div>` : ""}
          ${d.weak_muscles?.length ? `<div><strong>Weak:</strong> ${d.weak_muscles.join(", ")}</div>` : ""}
          ${d.kinetic_chain ? `<div style="margin-top:4px;color:#6d28d9;font-style:italic">Chain: ${d.kinetic_chain}</div>` : ""}
        </div>`;
    }).join("");

    const bodyHTML = `
      <div class="disclaimer">⚠ Manual observational assessment. For clinical use only. Not a substitute for comprehensive evaluation.</div>
      <div class="info-grid">
        <div class="info-box"><div class="info-label">Patient</div><div class="info-value">${patientName || "—"}</div></div>
        <div class="info-box"><div class="info-label">Clinician</div><div class="info-value">${clinicianName || "—"}</div></div>
        <div class="info-box"><div class="info-label">Date</div><div class="info-value">${date}</div></div>
        <div class="info-box"><div class="info-label">Findings</div><div class="info-value">${selectedDefects.length} defect${selectedDefects.length !== 1 ? "s" : ""}</div></div>
      </div>
      <h2>Postural Findings</h2>
      ${findingsHTML}
      <div class="sig-row">
        <div class="sig-col"><div class="sig-line"></div><div class="sig-label">Clinician Signature</div></div>
        <div class="sig-col"><div class="sig-line"></div><div class="sig-label">Date</div></div>
      </div>`;

    const metaRight = `<strong>Patient:</strong> ${patientName || "—"}<br/><strong>Clinician:</strong> ${clinicianName || "—"}<br/><strong>Date:</strong> ${date}`;
    const html = makePDFPage("Postural Assessment Report", metaRight, bodyHTML);
    await downloadPDFFromHTML(html, `postural-report-${(patientName || "patient").replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }, []);

  const regions = ["All", ...Array.from(new Set(Object.values(POSTURE_DEFECTS).map(d => d.region)))];
  const filtered = Object.values(POSTURE_DEFECTS).filter(d => regionFilter === "All" || d.region === regionFilter);

  const inputStyle = {
    width:"100%", background:"#f5f0fb", border:"1px solid #d8cce8",
    borderRadius:8, color:"#1a1025", fontFamily:"inherit",
    outline:"none", padding:"8px 10px", fontSize:"0.78rem",
  };

  const PLAN_VIEWS = [
    {key:"anterior",  label:"Anterior",   icon:"⬆", tip:"Facing camera — head, shoulders, pelvis, knees, feet"},
    {key:"posterior", label:"Posterior",  icon:"⬇", tip:"Back to camera — scapulae, spine alignment, calcanei"},
    {key:"lateral",   label:"L Lateral",  icon:"◀", tip:"Left side — ear, shoulder, hip, knee, ankle plumb line"},
    {key:"right_lateral",label:"R Lateral",icon:"▶",tip:"Right side — same as left for asymmetry comparison"},
  ];

  // Group selected defects by their relevant views
  const defectsByView = PLAN_VIEWS.reduce((acc, v) => {
    acc[v.key] = selectedDefects.filter(id => {
      const d = POSTURE_DEFECTS[id];
      return d && (d.view.includes(v.key) || (v.key==="right_lateral" && d.view.includes("lateral")));
    });
    return acc;
  }, {});

  return (
    <div>
      {/* ── STEP 1: View guidance ── */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:"0.62rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:9}}>📋 Assessment Views — Position patient accordingly</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {PLAN_VIEWS.map(v => (
            <div key={v.key} style={{background:"rgba(0,229,255,0.04)",border:"1px solid rgba(0,229,255,0.14)",borderRadius:10,padding:"9px 11px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:"1rem"}}>{v.icon}</span>
                <span style={{fontSize:"0.72rem",fontWeight:800,color:"#00e5ff"}}>{v.label}</span>
                {defectsByView[v.key]?.length > 0 && (
                  <span style={{marginLeft:"auto",padding:"1px 6px",borderRadius:6,background:"rgba(0,229,255,0.15)",color:"#00e5ff",fontSize:"0.56rem",fontWeight:800}}>{defectsByView[v.key].length}</span>
                )}
              </div>
              <div style={{fontSize:"0.63rem",color:"#7e6a9a",lineHeight:1.4}}>{v.tip}</div>
              {defectsByView[v.key]?.length > 0 && (
                <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:3}}>
                  {defectsByView[v.key].map(id => (
                    <span key={id} style={{fontSize:"0.56rem",padding:"1px 5px",borderRadius:5,background:"rgba(0,229,255,0.1)",color:"#00e5ff",border:"1px solid rgba(0,229,255,0.2)"}}>
                      {POSTURE_DEFECTS[id]?.icon} {POSTURE_DEFECTS[id]?.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 2: Defect selector ── */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:"0.62rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:8}}>
          🔍 Select Observed Defects
          {selectedDefects.length > 0 && <span style={{marginLeft:8,padding:"1px 7px",borderRadius:8,background:"rgba(255,77,109,0.15)",color:"#ff4d6d",fontSize:"0.58rem",fontWeight:800}}>{selectedDefects.length} selected</span>}
        </div>

        {/* Region filter */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:9}}>
          {regions.map(r => (
            <button key={r} onClick={() => setRegionFilter(r)}
              style={{padding:"3px 9px",borderRadius:8,fontSize:"0.6rem",fontWeight:700,border:`1px solid ${regionFilter===r?"rgba(0,229,255,0.5)":"#1a2d45"}`,background:regionFilter===r?"rgba(0,229,255,0.12)":"transparent",color:regionFilter===r?"#00e5ff":"#6b8399",cursor:"pointer"}}>
              {r}
            </button>
          ))}
        </div>

        {/* Defect grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:5}}>
          {filtered.map(d => {
            const sel = selectedDefects.includes(d.id);
            return (
              <button key={d.id} onClick={() => setSelectedDefects(sel ? selectedDefects.filter(s => s !== d.id) : [...selectedDefects, d.id])}
                style={{padding:"8px 10px",borderRadius:9,fontSize:"0.68rem",fontWeight:sel?700:500,border:`1px solid ${sel?"rgba(255,77,109,0.45)":"#1a2d45"}`,background:sel?"rgba(255,77,109,0.1)":"rgba(19,28,40,0.7)",color:sel?"#ff4d6d":"#94a3b8",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"flex-start",gap:6}}>
                <span style={{fontSize:"1rem",flexShrink:0}}>{d.icon}</span>
                <span style={{flex:1,lineHeight:1.3}}>{d.label}</span>
                {sel && <span style={{color:"#ff4d6d",fontSize:"0.6rem",flexShrink:0}}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 3: Selected findings with severity + tap-to-expand ── */}
      {selectedDefects.length > 0 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:"0.62rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:8}}>
            📌 Findings — tap card to view full clinical detail
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {selectedDefects.map(id => {
              const d = POSTURE_DEFECTS[id];
              if (!d) return null;
              const sev = defectSeverity[id] || "mild";
              const col = SEVERITY_COLOR[sev];
              return (
                <div key={id} style={{background:"#ffffff",border:`1px solid ${col}35`,borderRadius:11,overflow:"hidden"}}>
                  {/* Card header — clickable */}
                  <div onClick={() => setOpenDefect(id)} style={{padding:"10px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:"1.1rem"}}>{d.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"0.76rem",fontWeight:700,color:"#1a1025",lineHeight:1.3}}>{d.label}</div>
                      <div style={{fontSize:"0.6rem",color:"#7e6a9a",marginTop:1}}>{d.region}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                      <span style={{fontSize:"0.62rem",color:"#00e5ff",fontWeight:700}}>📋 Detail →</span>
                      <button onClick={e=>{e.stopPropagation();setSelectedDefects(p=>p.filter(s=>s!==id));}} style={{background:"none",border:"1px solid #d8cce8",borderRadius:5,color:"#7e6a9a",cursor:"pointer",fontSize:"0.6rem",padding:"1px 6px",lineHeight:1.4}}>✕</button>
                    </div>
                  </div>

                  {/* Severity selector */}
                  <div style={{padding:"0 13px 10px",display:"flex",gap:4}}>
                    {["mild","moderate","severe"].map(s => (
                      <button key={s} onClick={() => setDefectSeverity(p => ({...p,[id]:s}))}
                        style={{flex:1,padding:"5px 3px",borderRadius:7,fontSize:"0.6rem",fontWeight:sev===s?800:500,border:`1px solid ${sev===s?SEVERITY_COLOR[s]+"80":"#1a2d45"}`,background:sev===s?SEVERITY_BG[s]:"transparent",color:sev===s?SEVERITY_COLOR[s]:"#6b8399",cursor:"pointer",textTransform:"capitalize"}}>
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Quick summary row */}
                  <div style={{padding:"8px 13px",background:"rgba(6,9,15,0.5)",borderTop:"1px solid #d8cce8",display:"flex",gap:8,flexWrap:"wrap"}}>
                    <div style={{flex:"1 1 120px"}}>
                      <div style={{fontSize:"0.55rem",fontWeight:700,color:"#ff4d6d",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>🔴 Tight</div>
                      <div style={{fontSize:"0.62rem",color:"#1a1025",lineHeight:1.4}}>{d.tight_muscles.slice(0,2).join(", ")}{d.tight_muscles.length>2?` +${d.tight_muscles.length-2} more`:""}</div>
                    </div>
                    <div style={{flex:"1 1 120px"}}>
                      <div style={{fontSize:"0.55rem",fontWeight:700,color:"#00c97a",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>🟢 Weak</div>
                      <div style={{fontSize:"0.62rem",color:"#1a1025",lineHeight:1.4}}>{d.weak_muscles.slice(0,2).join(", ")}{d.weak_muscles.length>2?` +${d.weak_muscles.length-2} more`:""}</div>
                    </div>
                    <div style={{flex:"1 1 120px"}}>
                      <div style={{fontSize:"0.55rem",fontWeight:700,color:"#7f5af0",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>🔗 Chain</div>
                      <div style={{fontSize:"0.62rem",color:"#1a1025",lineHeight:1.4,fontStyle:"italic"}}>{d.kinetic_chain.split("→")[0].trim()} →…</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 4: PDF Export ── */}
      {selectedDefects.length > 0 && (
        <div style={{marginBottom:12}}>
          {!showExport ? (
            <button onClick={() => setShowExport(true)}
              style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,rgba(0,201,122,0.18),rgba(0,229,255,0.1))",border:"1px solid rgba(0,201,122,0.35)",borderRadius:10,color:"#00c97a",fontWeight:800,fontSize:"0.78rem",cursor:"pointer"}}>
              📄 Export PDF Report ({selectedDefects.length} finding{selectedDefects.length!==1?"s":""})
            </button>
          ) : (
            <div style={{background:"#ffffff",border:"1px solid rgba(0,201,122,0.3)",borderRadius:12,padding:"13px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:"0.72rem",fontWeight:800,color:"#00c97a"}}>📄 PDF Report Details</div>
                <button onClick={() => setShowExport(false)} style={{background:"none",border:"1px solid #d8cce8",borderRadius:6,color:"#7e6a9a",cursor:"pointer",padding:"3px 8px",fontSize:"0.65rem"}}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div>
                  <label style={{fontSize:"0.6rem",fontWeight:700,color:"#7e6a9a",display:"block",marginBottom:4}}>Patient Name</label>
                  <input value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="Patient name" style={inputStyle}/>
                </div>
                <div>
                  <label style={{fontSize:"0.6rem",fontWeight:700,color:"#7e6a9a",display:"block",marginBottom:4}}>Clinician</label>
                  <input value={clinicianName} onChange={e=>setClinicianName(e.target.value)} placeholder="Your name" style={inputStyle}/>
                </div>
              </div>
              <button onClick={() => exportPDF({patientName,clinicianName,selectedDefects,severity:defectSeverity,measurements:null,captures:{},date:new Date().toLocaleDateString('en-AU',{day:'2-digit',month:'long',year:'numeric'})})}
                style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#00c97a,#00e5ff)",border:"none",borderRadius:10,color:"#000",fontWeight:900,fontSize:"0.8rem",cursor:"pointer"}}>
                🖨 Generate & Print PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Defect detail modal */}
      {openDefect && <PostureDefectDetail defectId={openDefect} onClose={() => setOpenDefect(null)}/>}

      <div style={{padding:"7px 11px",background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:8,fontSize:"0.6rem",color:"#7e6a9a",lineHeight:1.5}}>
        ⚠ Manual observational assessment. Select all defects observed across each view. Tap any finding card for full clinical detail, muscles, kinetic chain, and exercise programme.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME MODULE — App Introduction & Feature Overview
// ═══════════════════════════════════════════════════════════════════════════

export { PatientDatabasePanel, PatientProfileModal, PatientCard, loadPatientDB, savePatientDB, genId, getInitials, avatarGrad };
