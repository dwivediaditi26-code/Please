import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { getC } from './theme.jsx';
import { PC, clamp } from './shared.jsx';

function HomeModule({ onNav }) {
  const PC = getC();
  const features = [
    { icon:"📝", title:"Subjective Assessment", desc:"Comprehensive history-taking with VAS pain scale, red flag screening, 24hr behaviour patterns, and patient goals.", nav:"subjective", color:"#7c3aed" },
    { icon:"🖐️", title:"Palpation", desc:"Systematic tissue assessment with tenderness grading, quality descriptors, and clinical significance.", nav:"palpation", color:"#9333ea" },
    { icon:"🧍", title:"Postural Analysis", desc:"Camera-assisted posture analysis with AI landmark detection, 30+ postural defects, kinetic chain mapping, and PDF export.", nav:"posture", color:"#7c3aed" },
    { icon:"📐", title:"Range of Motion", desc:"Full-body ROM assessment with bilateral comparison, normal values, end-feel grading, and clinical interpretation.", nav:"rom", color:"#9333ea" },
    { icon:"💪", title:"Muscle Strength (MMT)", desc:"Oxford Scale manual muscle testing across all major muscle groups with clinical grading.", nav:"mmt", color:"#7c3aed" },
    { icon:"🔬", title:"100+ Special Tests", desc:"Evidence-based special tests for cervical, shoulder, elbow, wrist, hip, knee, and ankle with sensitivity/specificity data.", nav:"special", color:"#9333ea" },
    { icon:"⚡", title:"Neurological Assessment", desc:"Dermatomes, myotomes, reflexes, neural tension tests, and red flag neurological screening.", nav:"neuro", color:"#7c3aed" },
    { icon:"🚶", title:"Gait Analysis", desc:"Observational gait analysis across stance, swing, and double support phases with clinical correlations.", nav:"gait", color:"#9333ea" },
    { icon:"🧠", title:"NKT Assessment", desc:"Neurokinetic Therapy muscle testing with inhibitor-facilitator relationships across regions.", nav:"nkt", color:"#7c3aed" },
    { icon:"⛓️", title:"Kinetic Chain", desc:"Joint-by-joint analysis of the kinetic chain from foot to cervical spine.", nav:"kinetic", color:"#9333ea" },
    { icon:"💊", title:"Treatment Prescription", desc:"Evidence-based exercise programming, HEP generation, treatment technique logging, and session records.", nav:"exercise", color:"#7c3aed" },
    { icon:"🤖", title:"SOAP Notes + AI", desc:"AI-powered SOAP note generation from your assessment data with Anthropic Claude integration.", nav:"soap", color:"#9333ea" },
  ];

  return (
    <div style={{maxWidth:900, margin:"0 auto"}}>
      {/* Hero */}
      <div style={{
        background:`linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)`,
        borderRadius:20, padding:"40px 32px", marginBottom:32, position:"relative", overflow:"hidden",
        boxShadow:"0 8px 40px rgba(124,58,237,0.25)"
      }}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:"rgba(255,255,255,0.06)",borderRadius:"50%"}}/>
        <div style={{position:"absolute",bottom:-60,left:-20,width:160,height:160,background:"rgba(255,255,255,0.04)",borderRadius:"50%"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:"2.4rem",marginBottom:8}}>🩺</div>
          <h1 style={{fontSize:"clamp(1.4rem,4vw,2rem)",fontWeight:900,color:"#fff",margin:"0 0 10px",letterSpacing:"-0.5px",lineHeight:1.1}}>
            PhysioMind Pro
          </h1>
          <p style={{fontSize:"clamp(0.85rem,2vw,1rem)",color:"rgba(255,255,255,0.85)",margin:"0 0 24px",lineHeight:1.6,maxWidth:520}}>
            The complete clinical assessment platform for physiotherapists. Evidence-based tools, AI-powered SOAP notes, and comprehensive patient management — all in one place.
          </p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={()=>onNav("subjective")} style={{padding:"12px 22px",background:"#fff",border:"none",borderRadius:12,color:"#7c3aed",fontWeight:800,fontSize:"0.88rem",cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
              Start Assessment →
            </button>
            <button onClick={()=>onNav("dashboard")} style={{padding:"12px 22px",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,color:"#fff",fontWeight:700,fontSize:"0.88rem",cursor:"pointer"}}>
              View Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:32}}>
        {[
          {num:"100+",label:"Special Tests",icon:"🔬"},
          {num:"30+",label:"Postural Defects",icon:"🧍"},
          {num:"AI",label:"SOAP Generation",icon:"🤖"},
          {num:"PDF",label:"Report Export",icon:"📄"},
        ].map((s,i)=>(
          <div key={i} style={{background:"#fff",border:"1px solid #d8cce8",borderRadius:14,padding:"18px 16px",textAlign:"center",boxShadow:"0 2px 12px rgba(124,58,237,0.07)"}}>
            <div style={{fontSize:"1.5rem",marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:"1.6rem",fontWeight:900,color:"#7c3aed",lineHeight:1}}>{s.num}</div>
            <div style={{fontSize:"0.65rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features grid */}
      <div style={{marginBottom:16}}>
        <h2 style={{fontSize:"clamp(1rem,3vw,1.25rem)",fontWeight:800,color:"#1a1025",margin:"0 0 6px",letterSpacing:"-0.3px"}}>Clinical Features</h2>
        <p style={{fontSize:"0.82rem",color:"#7e6a9a",margin:"0 0 20px"}}>Tap any feature to navigate directly to that assessment tool.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
          {features.map((f,i)=>(
            <button key={i} onClick={()=>onNav(f.nav)} style={{
              background:"#fff",border:`1px solid #d8cce8`,borderRadius:14,padding:"18px 16px",
              textAlign:"left",cursor:"pointer",transition:"all 0.18s",
              boxShadow:"0 2px 10px rgba(124,58,237,0.06)",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=f.color;e.currentTarget.style.boxShadow=`0 4px 20px rgba(124,58,237,0.14)`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#d8cce8";e.currentTarget.style.boxShadow="0 2px 10px rgba(124,58,237,0.06)";}}
            >
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:36,height:36,background:`${f.color}14`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>
                  {f.icon}
                </div>
                <div style={{fontSize:"0.85rem",fontWeight:700,color:"#1a1025",lineHeight:1.2}}>{f.title}</div>
              </div>
              <div style={{fontSize:"0.75rem",color:"#7e6a9a",lineHeight:1.55}}>{f.desc}</div>
              <div style={{marginTop:10,fontSize:"0.68rem",fontWeight:700,color:f.color}}>Open →</div>
            </button>
          ))}
        </div>
      </div>

      {/* Workflow guide */}
      <div style={{background:"#f5f0fb",border:"1px solid #d8cce8",borderRadius:16,padding:"22px 20px",marginTop:24}}>
        <h3 style={{fontSize:"0.88rem",fontWeight:800,color:"#7c3aed",margin:"0 0 14px",letterSpacing:"-0.2px"}}>📋 Recommended Assessment Workflow</h3>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {[
            "1. Subjective","2. Palpation","3. Posture","4. ROM","5. MMT",
            "6. Special Tests","7. Neurological","8. Gait","9. Kinetic Chain",
            "10. Treatment Plan","11. SOAP + AI"
          ].map((step,i)=>(
            <div key={i} style={{
              padding:"5px 12px",background:"#fff",border:"1px solid #d8cce8",
              borderRadius:8,fontSize:"0.72rem",fontWeight:600,color:"#1a1025"
            }}>{step}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// THERAPIST DASHBOARD MODULE
// ═══════════════════════════════════════════════════════════════════════════
function TherapistDashboardModule({ patients, data, onNav }) {
  const PC = getC();
  const patientName = data["dem_name"] || "No patient selected";
  const completedFields = Object.keys(data).filter(k=>data[k]&&data[k]!=="").length;
  const totalSections = 19;
  const sectionsWithData = [
    data["sub_complaint"], data["pal_findings"]||data["lx_palpation"],
    data["posture_defect_anterior_pelvic_tilt"]||data["posture_defect_forward_head"],
    data["lx_flex"]||data["rom_cflex"],
    data["mmt_l_hip_flex_left"]||data["mmt_shoulder_abd_left"],
    data["st_spurling"]||data["st_neer"],
    data["neuro_l4_reflex_left"],
    data["gait_overall"]||data["gait_cadence"],
  ].filter(Boolean).length;

  const recentPatients = patients.slice(0, 5);

  const quickStats = [
    { label:"Total Patients", value:patients.length, icon:"👥", color:"#7c3aed" },
    { label:"Active Session", value:patientName.split(" ")[0]||"—", icon:"🏃", color:"#9333ea" },
    { label:"Fields Completed", value:completedFields, icon:"✅", color:"#059669" },
    { label:"Sections Assessed", value:`${sectionsWithData}/8`, icon:"📋", color:"#b45309" },
  ];

  return (
    <div style={{maxWidth:900,margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:"clamp(1.1rem,3vw,1.4rem)",fontWeight:900,color:"#1a1025",margin:"0 0 4px",letterSpacing:"-0.4px"}}>
          Therapist Dashboard
        </h2>
        <p style={{fontSize:"0.82rem",color:"#7e6a9a",margin:0}}>Overview of your clinic, patients, and current assessment.</p>
      </div>

      {/* Quick stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:28}}>
        {quickStats.map((s,i)=>(
          <div key={i} style={{background:"#fff",border:"1px solid #d8cce8",borderRadius:14,padding:"16px",boxShadow:"0 2px 10px rgba(124,58,237,0.06)"}}>
            <div style={{fontSize:"1.2rem",marginBottom:8}}>{s.icon}</div>
            <div style={{fontSize:"clamp(1.2rem,3vw,1.6rem)",fontWeight:900,color:s.color,lineHeight:1,marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:"0.62rem",fontWeight:700,color:"#7e6a9a",textTransform:"uppercase",letterSpacing:"0.5px"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {/* Current Assessment Progress */}
        <div style={{background:"#fff",border:"1px solid #d8cce8",borderRadius:16,padding:"20px",boxShadow:"0 2px 10px rgba(124,58,237,0.06)"}}>
          <div style={{fontWeight:800,color:"#7c3aed",fontSize:"0.82rem",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.5px"}}>📋 Current Assessment</div>
          <div style={{fontWeight:700,color:"#1a1025",fontSize:"0.95rem",marginBottom:4}}>{patientName}</div>
          {data["dem_age"]&&<div style={{fontSize:"0.75rem",color:"#7e6a9a",marginBottom:14}}>{data["dem_age"]}y · {data["dem_gender"]||""} · {data["dem_occupation"]||""}</div>}
          {[
            {label:"Subjective",done:!!data["sub_complaint"],nav:"subjective"},
            {label:"Palpation",done:!!data["lx_palpation"],nav:"palpation"},
            {label:"Posture",done:!!(data["posture_defect_anterior_pelvic_tilt"]||data["posture_defect_forward_head"]),nav:"posture"},
            {label:"ROM",done:!!(data["lx_flex"]||data["rom_cflex"]),nav:"rom"},
            {label:"Special Tests",done:!!(data["st_spurling"]||data["st_neer"]),nav:"special"},
            {label:"SOAP + AI",done:false,nav:"soap"},
          ].map((item,i)=>(
            <div key={i} onClick={()=>onNav(item.nav)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<5?"1px solid #ede7f6":"none",cursor:"pointer"}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:item.done?"rgba(5,150,105,0.12)":"rgba(124,58,237,0.08)",border:`1.5px solid ${item.done?"#059669":"#d8cce8"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",color:item.done?"#059669":"#d8cce8",flexShrink:0}}>
                {item.done?"✓":""}
              </div>
              <div style={{flex:1,fontSize:"0.78rem",color:"#1a1025",fontWeight:600}}>{item.label}</div>
              <div style={{fontSize:"0.68rem",color:"#7c3aed",fontWeight:700}}>→</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{background:"#fff",border:"1px solid #d8cce8",borderRadius:16,padding:"20px",boxShadow:"0 2px 10px rgba(124,58,237,0.06)"}}>
          <div style={{fontWeight:800,color:"#7c3aed",fontSize:"0.82rem",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.5px"}}>⚡ Quick Actions</div>
          {[
            {label:"Start New Assessment",icon:"📝",nav:"subjective",primary:true},
            {label:"Generate SOAP + AI",icon:"🤖",nav:"soap",primary:false},
            {label:"Treatment Prescription",icon:"💊",nav:"exercise",primary:false},
            {label:"Run Special Tests",icon:"🔬",nav:"special",primary:false},
            {label:"Posture Camera",icon:"📷",nav:"posture",primary:false},
            {label:"Session Log",icon:"📋",nav:"tx_sessions",primary:false},
          ].map((a,i)=>(
            <button key={i} onClick={()=>onNav(a.nav)} style={{
              width:"100%",padding:"10px 14px",marginBottom:7,
              background:a.primary?"linear-gradient(135deg,#7c3aed,#9333ea)":"#f5f0fb",
              border:a.primary?"none":"1px solid #d8cce8",
              borderRadius:10,color:a.primary?"#fff":"#1a1025",
              fontWeight:700,fontSize:"0.78rem",cursor:"pointer",
              display:"flex",alignItems:"center",gap:8,textAlign:"left"
            }}>
              <span>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent patients */}
      {recentPatients.length > 0 && (
        <div style={{background:"#fff",border:"1px solid #d8cce8",borderRadius:16,padding:"20px",boxShadow:"0 2px 10px rgba(124,58,237,0.06)"}}>
          <div style={{fontWeight:800,color:"#7c3aed",fontSize:"0.82rem",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.5px"}}>👥 Recent Patients</div>
          <div style={{display:"grid",gap:8}}>
            {recentPatients.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#f5f0fb",borderRadius:10,border:"1px solid #ede7f6"}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#9333ea)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",color:"#fff",fontWeight:800,flexShrink:0}}>
                  {(p.name||"P")[0].toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"#1a1025",fontSize:"0.82rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name||"Unnamed"}</div>
                  <div style={{fontSize:"0.65rem",color:"#7e6a9a"}}>{p.lastDx||"No diagnosis"} · {p.updatedAt?new Date(p.updatedAt).toLocaleDateString():"—"}</div>
                </div>
                {p.hasRedFlags&&<span style={{fontSize:"0.6rem",padding:"2px 7px",background:"rgba(220,38,38,0.1)",color:"#dc2626",borderRadius:6,fontWeight:700}}>⚠ Flags</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PDF REPORTS MODULE — 3 World-Class Clinical PDF Documents
// Assessment Report · Treatment Plan · Home Exercise Protocol
// ═══════════════════════════════════════════════════════════════════════════

function PdfReportsModal({ data, dx, onClose }) {
  const [generating, setGenerating] = useState(null);
  const [done, setDone] = useState({});

  const d = data || {};
  const patName = d.dem_name || "Patient";
  const today = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" });
  const dob = d.dem_dob || "--";
  const age = d.dem_age || "--";
  const sex = d.dem_sex || d.dem_gender || "--";
  const occ = d.dem_occupation || "--";
  const gp = d.dem_gp || "--";
  const refNo = d.dem_ins_ref || "--";
  const insurer = d.dem_insurer || "--";
  const refSource = d.dem_referral || "--";

  const brand = { primary:"#1a3a5c", accent:"#2563eb", teal:"#0891b2", green:"#059669", red:"#dc2626", amber:"#d97706", purple:"#7c3aed", grey:"#6b7280", lightGrey:"#f1f5f9", border:"#e2e8f0", midGrey:"#94a3b8" };

  const escHtml = (s) => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const val = (k, fallback="--") => escHtml(d[k]||fallback);
  const arr = (k) => { const v=d[k]||""; return Array.isArray(v)?v:v.split("|||").filter(Boolean); };

  const pdfHeader = (title, subtitle, color) => {
    const clinicAddr = d.clinic_address || "Suite 100, PhysioMind HQ, 1 Digital Drive, Mumbai 400001";
    const clinicPhone = d.clinic_phone || "+91 98765 43210";
    const clinicWeb = d.clinic_web || "www.physiomind.app";
    const therapistName = d.therapist_name || "Your Physiotherapist";
    const therapistQual = d.therapist_qual || "MPT | AHPRA Registered";
    const reportNo = d.report_no || ("RPT-" + today.replace(/\s/g,""));
    return `<div>
    <div style="background:linear-gradient(135deg,${color} 0%,${color}ee 60%,#1a3358 100%);color:#fff;padding:22px 40px 18px;position:relative;overflow:hidden;">
      <div style="position:absolute;right:-40px;top:-40px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;">
        <div style="display:flex;gap:14px;align-items:center;">
          <div style="width:52px;height:52px;background:rgba(255,255,255,0.12);border-radius:14px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.2);flex-shrink:0;">
            <svg viewBox="0 0 48 48" width="34" height="34" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="24" cy="22" rx="14" ry="12" fill="none" stroke="#e8c96e" stroke-width="1.8"/>
              <line x1="24" y1="10" x2="24" y2="34" stroke="#e8c96e" stroke-width="1.2" stroke-dasharray="2,2"/>
              <path d="M14,18 Q11,22 14,26" stroke="#e8c96e" stroke-width="1.4" fill="none"/>
              <path d="M34,18 Q37,22 34,26" stroke="#e8c96e" stroke-width="1.4" fill="none"/>
              <line x1="24" y1="34" x2="24" y2="40" stroke="#e8c96e" stroke-width="2" stroke-linecap="round"/>
              <path d="M17,22 L20,22 L21,19 L23,25 L25,19 L27,25 L28,22 L31,22" stroke="#a78bfa" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div style="font-size:9px;color:#e8c96e;letter-spacing:3px;text-transform:uppercase;font-family:Georgia,serif;margin-bottom:2px;">PhysioMind &middot; AI Platform</div>
            <div style="font-size:20px;font-weight:700;letter-spacing:-0.3px;font-family:Georgia,serif;">PhysioMind</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:0.8px;margin-top:1px;">AI-Powered Physiotherapy Platform</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px;border:1px solid rgba(255,255,255,0.12);">
            <div style="font-size:8px;color:#e8c96e;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">Report No.</div>
            <div style="font-size:12px;font-weight:700;font-family:Courier New,monospace;">${escHtml(reportNo)}</div>
            <div style="font-size:8px;color:rgba(255,255,255,0.5);margin-top:5px;border-top:1px solid rgba(255,255,255,0.1);padding-top:5px;">${today}</div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:18px;margin-top:14px;flex-wrap:wrap;">
        ${[["&#128205;", clinicAddr], ["&#128222;", clinicPhone], ["&#127760;", clinicWeb]].map(function(pair){
          return '<div style="display:flex;align-items:center;gap:5px;"><span style="font-size:10px;">'+pair[0]+'</span><span style="color:rgba(255,255,255,0.6);font-size:8.5px;letter-spacing:0.3px;">'+escHtml(pair[1])+'</span></div>';
        }).join("")}
      </div>
    </div>
    <div style="background:${color};padding:14px 40px;display:flex;align-items:center;gap:14px;border-bottom:3px solid #c9a84c;">
      <div style="width:38px;height:38px;background:rgba(255,255,255,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;border:1px solid rgba(255,255,255,0.15);">&#128203;</div>
      <div>
        <div style="color:#fff;font-size:16px;font-weight:700;letter-spacing:-0.2px;font-family:Georgia,serif;">${title}</div>
        <div style="color:rgba(255,255,255,0.6);font-size:9px;margin-top:1px;letter-spacing:0.4px;">${subtitle}</div>
      </div>
      <div style="margin-left:auto;display:flex;align-items:center;gap:7px;">
        <div style="width:7px;height:7px;border-radius:50%;background:#e8c96e;"></div>
        <span style="color:#e8c96e;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;">Confidential Medical Document</span>
      </div>
    </div>
    <div style="background:#fff;border-bottom:1px solid #e2e8f0;padding:12px 40px;">
      <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;">
        ${[["Patient",escHtml(patName)],["DOB",escHtml(dob)],["Age / Sex",escHtml(String(age))+" yrs"],["Occupation",escHtml(occ)],["Referring GP",escHtml(gp)],["Insurer",escHtml(insurer)],["Therapist",escHtml(therapistName)],["Report Date",today]].map(function(pair){
          return '<div><div style="font-size:7.5px;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px;font-family:Georgia,serif;">'+pair[0]+'</div><div style="font-size:9.5px;font-weight:600;color:#1e293b;">'+pair[1]+'</div></div>';
        }).join("")}
      </div>
    </div>
    </div>`;
  };

  const pdfFooter = (docName) => {
    const therapistName = d.therapist_name || "Your Physiotherapist";
    return '<div style="background:#1e293b;padding:10px 40px;display:flex;justify-content:space-between;align-items:center;">'
      + '<div style="color:#94a3b8;font-size:8px;">PhysioMind &middot; ' + docName + '</div>'
      + '<div style="color:#64748b;font-size:8px;text-align:center;"><span style="color:#c9a84c;font-weight:700;">CONFIDENTIAL</span> &mdash; For Authorised Healthcare Professionals Only &middot; Not for Distribution</div>'
      + '<div style="color:#94a3b8;font-size:8px;">Page 1 &middot; ' + today + '</div>'
      + '</div>';
  };

  const sectionCard = (title, icon, content, borderColor) => '<div style="background:#fff;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">'
    + '<div style="padding:11px 16px;border-bottom:2px solid '+borderColor+'20;display:flex;align-items:center;gap:8px;">'
    + '<div style="width:28px;height:28px;background:'+borderColor+'12;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;border:1px solid '+borderColor+'25;">'+icon+'</div>'
    + '<span style="font-size:11px;font-weight:700;color:'+borderColor+';text-transform:uppercase;letter-spacing:1px;font-family:Georgia,serif;">'+title+'</span>'
    + '<div style="flex:1;height:1px;background:'+borderColor+'15;margin-left:4px;"></div>'
    + '</div>'
    + '<div style="padding:14px 16px;">'+content+'</div>'
    + '</div>';

  const badge = (text, color) => `<span style="display:inline-block;padding:3px 8px;background:${color}15;border:1px solid ${color}40;border-radius:5px;font-size:9px;font-weight:700;color:${color};margin:2px 3px 2px 0;">${escHtml(text)}</span>`;

  // Exercise SVG illustrations -- matches PhysioReports_4 ExerciseSVG component
  const exerciseSvgHtml = function(idx, color) {
    var svgs = [
      '<svg viewBox="0 0 100 120" width="90" height="108" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="120" fill="#f0f9ff" rx="8"/><ellipse cx="50" cy="28" rx="18" ry="20" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="38" y="47" width="24" height="38" rx="8" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><path d="M50,38 Q42,45 44,53" stroke="'+color+'" stroke-width="2" fill="none" stroke-dasharray="3,2"/><text x="50" y="112" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Chin Tuck</text></svg>',
      '<svg viewBox="0 0 100 120" width="90" height="108" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="120" fill="#fff7ed" rx="8"/><rect x="88" y="5" width="8" height="110" rx="3" fill="#e2e8f0"/><ellipse cx="48" cy="28" rx="16" ry="18" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="34" y="45" width="24" height="36" rx="8" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><rect x="33" y="56" width="10" height="26" rx="4" fill="#fde8d0" stroke="#c47a4a" stroke-width="1"/><path d="M44,60 L82,55" stroke="'+color+'" stroke-width="2" stroke-dasharray="3,2"/><path d="M44,68 L82,68" stroke="'+color+'" stroke-width="2" stroke-dasharray="3,2"/><text x="48" y="112" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Cervical Retraction</text></svg>',
      '<svg viewBox="0 0 130 100" width="120" height="92" xmlns="http://www.w3.org/2000/svg"><rect width="130" height="100" fill="#f0fdf4" rx="8"/><rect x="5" y="75" width="120" height="8" rx="3" fill="#e2e8f0"/><ellipse cx="25" cy="52" rx="14" ry="14" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="36" y="38" width="60" height="28" rx="8" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><ellipse cx="36" cy="46" rx="9" ry="9" fill="#fde8d0" stroke="'+color+'" stroke-width="1.5"/><ellipse cx="96" cy="46" rx="9" ry="9" fill="#fde8d0" stroke="'+color+'" stroke-width="1.5"/><path d="M36,46 L20,40" stroke="'+color+'" stroke-width="1.5" stroke-dasharray="3,2"/><path d="M96,46 L112,40" stroke="'+color+'" stroke-width="1.5" stroke-dasharray="3,2"/><text x="65" y="93" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Scapular Retraction</text></svg>',
      '<svg viewBox="0 0 100 120" width="90" height="108" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="120" fill="#fdf4ff" rx="8"/><ellipse cx="50" cy="30" rx="18" ry="20" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="38" y="49" width="24" height="36" rx="8" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><path d="M60,22 Q75,15 78,28" stroke="'+color+'" stroke-width="2" fill="none"/><path d="M78,22 L85,15" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2,2" fill="none"/><text x="50" y="112" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Levator Stretch</text></svg>',
      '<svg viewBox="0 0 130 100" width="120" height="92" xmlns="http://www.w3.org/2000/svg"><rect width="130" height="100" fill="#eff6ff" rx="8"/><rect x="50" y="60" width="30" height="12" rx="5" fill="#c7d7f0" stroke="'+color+'" stroke-width="1.5"/><ellipse cx="65" cy="42" rx="30" ry="18" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><ellipse cx="65" cy="28" rx="14" ry="14" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><text x="65" y="92" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Thoracic Extension</text></svg>',
      '<svg viewBox="0 0 130 100" width="120" height="92" xmlns="http://www.w3.org/2000/svg"><rect width="130" height="100" fill="#f5f3ff" rx="8"/><rect x="118" y="5" width="8" height="90" rx="3" fill="#e2e8f0"/><ellipse cx="68" cy="22" rx="14" ry="14" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="55" y="35" width="24" height="32" rx="7" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><rect x="57" y="65" width="10" height="25" rx="4" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="69" y="65" width="10" height="25" rx="4" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><path d="M79,40 Q100,30 116,20" stroke="'+color+'" stroke-width="2" stroke-dasharray="3,2" fill="none"/><path d="M79,52 Q100,52 116,52" stroke="'+color+'" stroke-width="2" stroke-dasharray="3,2" fill="none"/><text x="65" y="97" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Wall Angels</text></svg>',
      '<svg viewBox="0 0 140 100" width="120" height="86" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="100" fill="#fdf4ff" rx="8"/><ellipse cx="22" cy="50" rx="14" ry="14" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="34" y="42" width="50" height="30" rx="8" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><rect x="50" y="68" width="50" height="14" rx="6" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="50" y="55" width="65" height="14" rx="6" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5" transform="rotate(-25,75,62)"/><text x="60" y="95" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Clamshell</text></svg>',
      '<svg viewBox="0 0 80 120" width="80" height="120" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="120" fill="#eff6ff" rx="8"/><ellipse cx="40" cy="22" rx="14" ry="14" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="26" y="34" width="28" height="35" rx="8" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><rect x="28" y="65" width="12" height="30" rx="5" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5" transform="rotate(15,34,80)"/><rect x="40" y="65" width="12" height="30" rx="5" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5" transform="rotate(-15,46,80)"/><text x="40" y="115" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Mini Squat</text></svg>',
      '<svg viewBox="0 0 140 110" width="120" height="94" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="110" fill="#f0fdf4" rx="8"/><rect x="5" y="85" width="130" height="8" rx="3" fill="#e2e8f0"/><ellipse cx="25" cy="55" rx="12" ry="12" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="35" y="42" width="55" height="22" rx="8" fill="#dde8f8" stroke="'+color+'" stroke-width="1.5"/><rect x="37" y="62" width="12" height="25" rx="5" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5"/><rect x="62" y="58" width="50" height="12" rx="5" fill="#fde8d0" stroke="#c47a4a" stroke-width="1.5" transform="rotate(-8,87,64)"/><text x="60" y="100" font-size="7" fill="#1a3a5c" font-weight="700" text-anchor="middle">Hip Flexor Stretch</text></svg>',
    ];
    return svgs[idx % svgs.length];
  };

  const postureSvg = () => {
    const fhp = d.post_fhp || "";
    const sh = d.post_sh || "";
    const kyphosis = d.post_kyphosis || "";
    const lordosis = d.post_lordosis || "";
    const pelvis = d.post_pelvis || "";
    return `<svg viewBox="0 0 220 340" width="160" height="248" style="display:block;margin:0 auto;" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#dc2626"/></marker></defs>
      <rect width="220" height="340" fill="#f8fafc" rx="10"/>
      <line x1="110" y1="10" x2="110" y2="330" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4"/>
      <ellipse cx="${fhp&&fhp.includes("Moderate")?120:fhp&&fhp.includes("Severe")?128:110}" cy="38" rx="22" ry="26" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/>
      <rect x="${fhp&&fhp.includes("Severe")?112:106}" y="62" width="14" height="22" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/>
      <line x1="${sh&&sh.includes("elevated")?62:68}" y1="${sh&&sh.includes("elevated")?84:88}" x2="${sh&&sh.includes("elevated")?158:152}" y2="${sh&&sh.includes("elevated")?88:84}" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="${sh&&sh.includes("elevated")?62:68}" cy="${sh&&sh.includes("elevated")?84:88}" rx="10" ry="10" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/>
      <ellipse cx="${sh&&sh.includes("elevated")?158:152}" cy="${sh&&sh.includes("elevated")?88:84}" rx="10" ry="10" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/>
      <path d="M104,84 Q${kyphosis&&kyphosis.includes("increased")?98:104},120 ${kyphosis&&kyphosis.includes("increased")?98:104},145" stroke="#1a3a5c" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M${kyphosis&&kyphosis.includes("increased")?98:104},145 Q${lordosis&&lordosis.includes("increased")?116:104},170 ${lordosis&&lordosis.includes("increased")?114:104},190" stroke="#1a3a5c" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M68,88 L74,190 L148,190 L152,88 Z" fill="#dde8f8" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
      <ellipse cx="110" cy="${pelvis&&pelvis.includes("anterior")?196:192}" rx="36" ry="20" fill="#c7d7f0" stroke="#2563eb" strokeWidth="1.5"/>
      <rect x="90" y="208" width="18" height="60" rx="8" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/>
      <rect x="90" y="265" width="18" height="55" rx="8" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/>
      <rect x="112" y="208" width="18" height="60" rx="8" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/>
      <rect x="112" y="265" width="18" height="55" rx="8" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/>
      <ellipse cx="99" cy="322" rx="14" ry="7" fill="#c47a4a" opacity="0.7"/>
      <ellipse cx="121" cy="322" rx="14" ry="7" fill="#c47a4a" opacity="0.7"/>
      ${fhp&&!fhp.includes("Normal")?'<text x="135" y="35" fontSize="8" fill="#dc2626" fontWeight="700">FHP</text>':""}
      ${sh&&sh.includes("elevated")?'<text x="30" y="80" fontSize="8" fill="#dc2626" fontWeight="700">Sh elev.</text>':""}
      ${kyphosis&&kyphosis.includes("increased")?'<text x="20" y="120" fontSize="8" fill="#d97706" fontWeight="700">Kyph+</text>':""}
      ${lordosis&&lordosis.includes("increased")?'<text x="140" y="170" fontSize="8" fill="#d97706" fontWeight="700">Lord+</text>':""}
      ${pelvis&&pelvis.includes("anterior")?'<text x="150" y="200" fontSize="8" fill="#7c3aed" fontWeight="700">APT</text>':""}
      <line x1="110" y1="15" x2="110" y2="325" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>
    </svg>`;
  };

  const exerciseSvgs = {
    bridge: `<svg viewBox="0 0 140 100" width="120" height="86" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="100" fill="#f0f9ff" rx="8"/><rect x="5" y="75" width="130" height="8" rx="3" fill="#e2e8f0"/><ellipse cx="30" cy="68" rx="14" ry="11" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/><rect x="40" y="50" width="60" height="25" rx="8" fill="#dde8f8" stroke="#2563eb" strokeWidth="1.5"/><rect x="38" y="72" width="18" height="12" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1"/><rect x="82" y="72" width="18" height="12" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1"/><text x="5" y="95" fontSize="7" fill="#1a3a5c" fontWeight="700">Glute Bridge</text></svg>`,
    bird_dog: `<svg viewBox="0 0 140 100" width="120" height="86" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="100" fill="#f0fdf4" rx="8"/><rect x="5" y="72" width="130" height="8" rx="3" fill="#e2e8f0"/><ellipse cx="25" cy="55" rx="12" ry="12" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/><rect x="35" y="42" width="60" height="22" rx="8" fill="#dde8f8" stroke="#2563eb" strokeWidth="1.5"/><rect x="42" y="62" width="14" height="18" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1"/><rect x="82" y="62" width="14" height="18" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1"/><path d="M35,52 L18,45 L8,42" stroke="#059669" strokeWidth="2" fill="none"/><path d="M95,52 L112,45 L122,42" stroke="#059669" strokeWidth="2" fill="none"/><text x="5" y="95" fontSize="7" fill="#1a3a5c" fontWeight="700">Bird Dog</text></svg>`,
    clam: `<svg viewBox="0 0 140 100" width="120" height="86" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="100" fill="#fdf4ff" rx="8"/><ellipse cx="22" cy="50" rx="14" ry="14" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/><rect x="34" y="42" width="50" height="30" rx="8" fill="#dde8f8" stroke="#2563eb" strokeWidth="1.5"/><rect x="50" y="68" width="50" height="14" rx="6" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/><rect x="50" y="55" width="65" height="14" rx="6" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5" transform="rotate(-25,75,62)"/><text x="5" y="95" fontSize="7" fill="#1a3a5c" fontWeight="700">Clamshell</text></svg>`,
    squat: `<svg viewBox="0 0 80 120" width="80" height="120" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="120" fill="#eff6ff" rx="8"/><ellipse cx="40" cy="22" rx="14" ry="14" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/><rect x="26" y="34" width="28" height="35" rx="8" fill="#dde8f8" stroke="#2563eb" strokeWidth="1.5"/><rect x="28" y="65" width="12" height="30" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5" transform="rotate(15,34,80)"/><rect x="40" y="65" width="12" height="30" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5" transform="rotate(-15,46,80)"/><text x="8" y="115" fontSize="7" fill="#1a3a5c" fontWeight="700">Mini Squat</text></svg>`,
    stretch: `<svg viewBox="0 0 140 110" width="120" height="94" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="110" fill="#f0fdf4" rx="8"/><rect x="5" y="85" width="130" height="8" rx="3" fill="#e2e8f0"/><ellipse cx="25" cy="55" rx="12" ry="12" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/><rect x="35" y="42" width="55" height="22" rx="8" fill="#dde8f8" stroke="#2563eb" strokeWidth="1.5"/><rect x="37" y="62" width="12" height="25" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/><rect x="62" y="58" width="50" height="12" rx="5" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5" transform="rotate(-8,87,64)"/><text x="5" y="100" fontSize="7" fill="#1a3a5c" fontWeight="700">Hip Flexor Stretch</text></svg>`,
    chin_tuck: `<svg viewBox="0 0 100 120" width="100" height="120" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="120" fill="#fff7ed" rx="8"/><ellipse cx="50" cy="28" rx="18" ry="20" fill="#fde8d0" stroke="#c47a4a" strokeWidth="1.5"/><rect x="38" y="46" width="24" height="35" rx="8" fill="#dde8f8" stroke="#2563eb" strokeWidth="1.5"/><path d="M50,36 Q42,42 44,50" stroke="#d97706" strokeWidth="2" fill="none" strokeDasharray="3,2"/><text x="5" y="112" fontSize="7" fill="#1a3a5c" fontWeight="700">Chin Tuck (DNF)</text></svg>`,
  };

  const gatherExercises = () => {
    const exs = [];
    for (let i = 1; i <= 12; i++) {
      const name = d[`ex_name_${i}`] || d[`exercise_${i}_name`] || "";
      if (!name) continue;
      exs.push({
        name, sets: d[`ex_sets_${i}`] || "3", reps: d[`ex_reps_${i}`] || "10",
        hold: d[`ex_hold_${i}`] || "", rest: d[`ex_rest_${i}`] || "60s",
        freq: d[`ex_freq_${i}`] || "Daily", phase: d[`ex_phase_${i}`] || "Phase 1",
        notes: d[`ex_notes_${i}`] || "", target: d[`ex_target_${i}`] || "",
        progression: d[`ex_progression_${i}`] || "",
      });
    }
    if (exs.length === 0) {
      const dxLabel = (dx?.dx?.[0]?.label||"").toLowerCase();
      const cc = (d.cc_location||"").toLowerCase();
      const isLumbar = dxLabel.includes("lumbar")||dxLabel.includes("back")||cc.includes("back")||cc.includes("lumbar");
      const isCervical = dxLabel.includes("cervical")||dxLabel.includes("neck")||cc.includes("neck");
      const isKnee = dxLabel.includes("knee")||cc.includes("knee");
      if (isLumbar) return [
        {name:"Pelvic Tilt",sets:"3",reps:"15",hold:"3s",rest:"30s",freq:"2x Daily",phase:"Phase 1 -- Motor Control",notes:"Flatten lower back against floor. Breathe normally.",target:"Lumbar stabilisers, transversus abdominis",progression:"Progress to dead bug exercise"},
        {name:"Glute Bridge",sets:"3",reps:"12",hold:"3s",rest:"45s",freq:"Daily",phase:"Phase 1 -- Motor Control",notes:"Drive through heels, squeeze glutes at top. Maintain neutral spine.",target:"Gluteus maximus, hamstrings, lumbar extensors",progression:"Single-leg bridge when pain-free"},
        {name:"Bird Dog",sets:"3",reps:"10",hold:"5s",rest:"45s",freq:"Daily",phase:"Phase 2 -- Stability",notes:"Opposite arm and leg, maintain neutral spine. No rotation of pelvis.",target:"Multifidus, gluteus maximus, deep core",progression:"Add resistance band around wrists"},
        {name:"Cat-Cow Stretch",sets:"2",reps:"12",hold:"",rest:"30s",freq:"2x Daily",phase:"Phase 1 -- Mobility",notes:"Slow controlled movement, breathe throughout. Avoid pain range.",target:"Spinal mobility, paraspinals",progression:""},
      ];
      if (isCervical) return [
        {name:"Chin Tuck (DNF Activation)",sets:"3",reps:"10",hold:"10s",rest:"30s",freq:"3x Daily",phase:"Phase 1 -- Motor Control",notes:"Nod chin down without flexing neck. Feel length at back of neck. Do not use hands.",target:"Deep neck flexors (longus colli/capitis)",progression:"Add finger resistance on chin"},
        {name:"Cervical Rotation Stretch",sets:"3",reps:"5",hold:"20s",rest:"30s",freq:"2x Daily",phase:"Phase 1 -- Mobility",notes:"Turn head to pain-free side first. Gently assist with hand at end range.",target:"Cervical rotators, SCM",progression:""},
        {name:"Scapular Retraction",sets:"3",reps:"15",hold:"3s",rest:"45s",freq:"Daily",phase:"Phase 2 -- Strengthening",notes:"Squeeze shoulder blades together. No shrug or elevation. Keep chin tucked.",target:"Lower and middle trapezius, rhomboids",progression:"Add resistance band"},
        {name:"Levator Scapulae Stretch",sets:"3",reps:"3",hold:"30s",rest:"30s",freq:"2x Daily",phase:"Phase 1 -- Flexibility",notes:"Ear to shoulder then rotate chin toward armpit. Breathe and relax into stretch.",target:"Levator scapulae, upper trapezius",progression:""},
      ];
      if (isKnee) return [
        {name:"Quad Set",sets:"3",reps:"15",hold:"5s",rest:"30s",freq:"2x Daily",phase:"Phase 1 -- Activation",notes:"Flatten knee to surface, contract quad hard. Feel thigh muscle tighten.",target:"Quadriceps (VMO focus)",progression:"Straight leg raise"},
        {name:"Short Arc Quad",sets:"3",reps:"15",hold:"3s",rest:"45s",freq:"Daily",phase:"Phase 1 -- Strengthening",notes:"Pillow under knee at 90 degrees. Extend to full extension. Slow and controlled.",target:"Quadriceps, VMO",progression:"Add ankle weight (0.5kg)"},
        {name:"Mini Squat (0-45 deg)",sets:"3",reps:"12",hold:"",rest:"60s",freq:"Daily",phase:"Phase 2 -- Functional",notes:"Controlled descent, weight through heels. Stop before pain. Use wall for balance.",target:"Quadriceps, glutes, knee stabilisers",progression:"Increase depth to 60 degrees"},
        {name:"Terminal Knee Extension (TKE)",sets:"3",reps:"15",hold:"",rest:"45s",freq:"Daily",phase:"Phase 2 -- Strengthening",notes:"Band behind knee. Fully extend from 30 degrees flexion. Slow return.",target:"Quadriceps (VMO), knee joint proprioception",progression:"Increase band resistance"},
      ];
      return [
        {name:"Diaphragmatic Breathing",sets:"1",reps:"10",hold:"5s",rest:"",freq:"3x Daily",phase:"Phase 1 -- Foundation",notes:"Belly breathing. Hands on abdomen and chest. Belly should rise first. Exhale fully.",target:"Diaphragm, core activation, pain modulation",progression:""},
        {name:"Transversus Abdominis Activation",sets:"3",reps:"10",hold:"10s",rest:"30s",freq:"2x Daily",phase:"Phase 1 -- Motor Control",notes:"Draw navel gently toward spine. Breathe normally. Do not suck stomach in or hold breath.",target:"Transversus abdominis, pelvic floor",progression:"Add limb loading"},
        {name:"Hip Hinge Pattern",sets:"3",reps:"10",hold:"",rest:"60s",freq:"Daily",phase:"Phase 2 -- Functional",notes:"Hinge at hips, maintain neutral spine. Soft knees. Push hips back. Flat back.",target:"Gluteus maximus, hamstrings, spinal extensors",progression:"Add light weight or resistance band"},
        {name:"Prone Hip Extension",sets:"3",reps:"15",hold:"3s",rest:"45s",freq:"Daily",phase:"Phase 2 -- Strengthening",notes:"Squeeze glute, lift leg 10cm from surface. Maintain neutral pelvis. No rotation.",target:"Gluteus maximus, hamstrings",progression:"Add ankle weight"},
      ];
    }
    return exs;
  };

  const gatherTechniques = () => {
    const techs = [];
    for (let i = 1; i <= 10; i++) {
      const name = d[`tx_name_${i}`] || d[`technique_${i}`] || "";
      if (!name) continue;
      techs.push({ name, area: d[`tx_area_${i}`] || "", duration: d[`tx_duration_${i}`] || "", rationale: d[`tx_rationale_${i}`] || "" });
    }
    return techs;
  };

  const buildAssessmentPdf = () => {
    const cc = val("cc_main"); const ccLoc = arr("cc_location").join(", ") || "--";
    const vasNow = val("pa_vas_now"); const vasWorst = val("pa_vas_worst"); const vasBest = val("pa_vas_best");
    const onset = val("cc_onset"); const mechanism = val("cc_mechanism"); const duration = val("cc_duration");
    const aggravating = val("cc_aggravating"); const easing = val("cc_easing");
    const phx = val("phx_conditions"); const meds = val("meds_current"); const allergies = val("allergy_drug");
    const goal = val("ar_goal_function");
    const dxList = dx?.dx || [];
    const specialResults = [];
    Object.keys(d).forEach(k => { if(k.startsWith("st_") && d[k] && d[k].includes("Positive")) specialResults.push(`${k.replace("st_","").replace(/_/g," ")}: ${d[k]}`); });

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Assessment Report - ${escHtml(patName)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{background:#fff;max-width:860px;margin:0 auto;box-shadow:0 4px 40px rgba(0,0,0,0.12);}.body{padding:28px 40px;}table{width:100%;border-collapse:collapse;}th{background:#f1f5f9;font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;padding:8px 10px;text-align:left;}td{padding:7px 10px;font-size:10.5px;border-bottom:1px solid #e2e8f0;}@media print{body{background:white;}.page{box-shadow:none;}}</style>
</head><body><div class="page">
${pdfHeader("Physiotherapy Assessment Report","Comprehensive Initial Clinical Evaluation","#1a3a5c")}
<div class="body">
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:20px;padding:14px;background:#f1f5f9;border-radius:10px;border:1px solid #e2e8f0;">
    ${[["Full Name",escHtml(patName)],["Date of Birth",escHtml(dob)],["Age / Sex",`${escHtml(String(age))} / ${escHtml(sex)}`],["Occupation",escHtml(occ)],["Referring GP",escHtml(gp)],["Referral Source",escHtml(refSource)],["Insurer",escHtml(insurer)],["Policy No.",escHtml(refNo)]].map(([l,v])=>`<div><div style="font-size:8px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px;">${l}</div><div style="font-size:10.5px;font-weight:600;color:#1a3a5c;">${v}</div></div>`).join("")}
  </div>
  <div style="display:grid;grid-template-columns:1fr 190px;gap:20px;align-items:start;">
    <div>
      ${sectionCard("Presenting Complaint","&#128221;",`
        <div style="background:#2563eb08;border-left:3px solid #2563eb;border-radius:6px;padding:10px 14px;margin-bottom:12px;">
          <div style="font-size:9px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">Chief Complaint</div>
          <div style="font-size:11px;font-style:italic;color:#1a3a5c;line-height:1.6;">&ldquo;${cc}&rdquo;</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          ${[["Pain Location",ccLoc],["Onset",escHtml(onset)],["Duration",escHtml(duration)],["Mechanism",escHtml(mechanism)]].map(([l,v])=>`<div><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">${l}</div><div style="font-size:10.5px;color:#1a3a5c;font-weight:500;padding:6px 10px;background:#f1f5f9;border-radius:6px;border:1px solid #e2e8f0;">${v}</div></div>`).join("")}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">Aggravating Factors</div><div style="font-size:10.5px;color:#1a3a5c;padding:6px 10px;background:rgba(220,38,38,0.05);border:1px solid rgba(220,38,38,0.15);border-radius:6px;">${aggravating}</div></div>
          <div><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">Easing Factors</div><div style="font-size:10.5px;color:#1a3a5c;padding:6px 10px;background:rgba(5,150,105,0.05);border:1px solid rgba(5,150,105,0.15);border-radius:6px;">${easing}</div></div>
        </div>
      `,"#2563eb")}
      ${sectionCard("Pain Assessment (VAS)","&#128308;",`
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;">
          ${[["Current Pain",vasNow,"#dc2626"],["Worst Pain",vasWorst,"#7c3aed"],["Best / Rest",vasBest,"#059669"]].map(([l,v,c])=>`<div style="text-align:center;padding:12px;background:${c}08;border:2px solid ${c}20;border-radius:10px;"><div style="font-size:24px;font-weight:800;color:${c};line-height:1;">${v||"&mdash;"}${v?"/10":""}</div><div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;margin-top:4px;">${l}</div></div>`).join("")}
        </div>
        ${vasNow?`<div style="background:#f1f5f9;border-radius:6px;height:10px;overflow:hidden;"><div style="height:100%;width:${(parseFloat(vasNow)||0)*10}%;background:linear-gradient(90deg,#059669,#d97706,#dc2626);border-radius:6px;"></div></div><div style="font-size:8px;color:#6b7280;margin-top:4px;">VAS Scale: 0 = No pain &mdash; 10 = Worst imaginable pain</div>`:""}
      `,"#dc2626")}
      ${dxList.length>0?sectionCard("Clinical Impression","&#129321;",dxList.slice(0,4).map((item,i)=>`
        <div style="display:flex;gap:12px;align-items:flex-start;padding:10px;background:${i===0?"#2563eb0a":"#f1f5f9"};border:1px solid ${i===0?"#2563eb30":"#e2e8f0"};border-radius:8px;margin-bottom:8px;">
          <div style="min-width:28px;height:28px;background:${i===0?"#2563eb":"#94a3b8"};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;">${i+1}</div>
          <div><div style="font-size:11px;font-weight:700;color:#1a3a5c;">${escHtml(item.label||"")}</div>${item.icd?`<div style="font-size:9px;color:#6b7280;margin-top:2px;">ICD-10: ${escHtml(item.icd)}</div>`:""}</div>
        </div>`).join(""),"#2563eb"):""}
      ${sectionCard("Past Medical & Social History","&#128203;",`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          ${[["Medical History",escHtml(phx)],["Current Medications",escHtml(meds)],["Drug Allergies",escHtml(allergies)],["Precautions",escHtml(d.allergy_other||"None documented")]].map(([l,v])=>`<div><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">${l}</div><div style="font-size:10.5px;color:#1a3a5c;font-weight:500;padding:6px 10px;background:#f1f5f9;border-radius:6px;border:1px solid #e2e8f0;">${v}</div></div>`).join("")}
        </div>
        ${goal?`<div style="background:rgba(5,150,105,0.06);border:1px solid rgba(5,150,105,0.2);border-radius:8px;padding:10px 14px;"><span style="font-size:9px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.8px;">&#127919; Patient Goal: </span><span style="font-size:10.5px;color:#1a3a5c;">${escHtml(goal)}</span></div>`:""}
      `,"#0891b2")}
    </div>
    <div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:14px;">
        <div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;text-align:center;">&#9609; Postural Analysis</div>
        ${postureSvg()}
        <div style="margin-top:10px;">
          ${[[d.post_fhp,"FHP","#dc2626"],[d.post_kyphosis,"Kyphosis","#d97706"],[d.post_lordosis,"Lordosis","#d97706"],[d.post_pelvis,"Pelvis","#7c3aed"],[d.post_sh,"Shoulder","#2563eb"]].filter(([v])=>v&&v!=="--"&&!v.includes("Normal")).map(([v,l,c])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #e2e8f0;"><span style="font-size:9px;color:#6b7280;">${l}</span><span style="font-size:9px;font-weight:700;color:${c};">${escHtml(String(v)).substring(0,22)}</span></div>`).join("")||`<div style="font-size:9px;color:#94a3b8;text-align:center;">No deviations noted</div>`}
        </div>
      </div>
      ${specialResults.length>0?`<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;"><div style="font-size:9px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">&#8853; Positive Tests</div>${specialResults.slice(0,6).map(r=>`<div style="font-size:9px;color:#1a3a5c;padding:4px 0;border-bottom:1px solid #e2e8f0;line-height:1.4;">${escHtml(r)}</div>`).join("")}</div>`:""}
    </div>
  </div>
  ${sectionCard("Range of Motion","&#128208;",`<table><thead><tr><th>Movement</th><th style="text-align:center;">Left</th><th style="text-align:center;">Right</th><th style="text-align:center;">Normal</th><th style="text-align:center;">Status</th></tr></thead><tbody>${[
    ["Shoulder Flexion","rom_sh_flex_left","rom_sh_flex_right",180],["Shoulder Abduction","rom_sh_abd_left","rom_sh_abd_right",180],["Shoulder ER","rom_sh_er_left","rom_sh_er_right",90],["Hip Flexion","rom_hip_flex_left","rom_hip_flex_right",120],["Knee Flexion","rom_kn_flex_left","rom_kn_flex_right",140],["Ankle DF","rom_ank_df_left","rom_ank_df_right",20],["Cervical Flexion","rom_cx_flex","",50],["Cervical Extension","rom_cx_ext","",60],["Lumbar Flexion","rom_lx_flex","",80],["Lumbar Extension","rom_lx_ext","",25],
  ].filter(([,l,r])=>d[l]||d[r]).map(([region,lk,rk,norm])=>{const lv=d[lk]||"";const rv=d[rk]||"";const lN=parseFloat(lv);const rN=parseFloat(rv);const lCol=lv&&!isNaN(lN)?(lN<norm*0.8?"#dc2626":lN<norm*0.9?"#d97706":"#059669"):"#94a3b8";const rCol=rv&&!isNaN(rN)?(rN<norm*0.8?"#dc2626":rN<norm*0.9?"#d97706":"#059669"):"#94a3b8";const qual=lv||rv?(lN<norm*0.7||rN<norm*0.7?"Significantly Limited":lN<norm*0.9||rN<norm*0.9?"Mildly Limited":"WNL"):"Not Tested";const qCol=qual==="WNL"?"#059669":qual==="Not Tested"?"#94a3b8":qual==="Significantly Limited"?"#dc2626":"#d97706";return `<tr style="border-bottom:1px solid #e2e8f0;"><td style="font-size:10px;font-weight:500;color:#1a3a5c;">${escHtml(region)}</td><td style="text-align:center;font-weight:700;color:${lCol};font-size:10px;">${lv?lv+"&deg;":"&mdash;"}</td><td style="text-align:center;font-weight:700;color:${rCol};font-size:10px;">${rv?rv+"&deg;":rk?"&mdash;":"N/A"}</td><td style="text-align:center;color:#6b7280;font-size:10px;">${norm}&deg;</td><td style="text-align:center;font-size:9px;"><span style="padding:2px 7px;border-radius:4px;font-weight:700;background:${qCol}15;color:${qCol};">${qual}</span></td></tr>`;}).join("")||`<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:16px;font-size:10px;">No ROM measurements recorded</td></tr>`}</tbody></table>`,"#0891b2")}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
    ${sectionCard("Neurological Findings","&#9889;",`${[["Sensation",d.neuro_sensation],["Reflexes",d.neuro_reflex],["Motor",d.neuro_motor],["Neural Tension",d.neuro_tension]].filter(([,v])=>v).map(([l,v])=>`<div style="display:flex;gap:8px;margin-bottom:7px;align-items:flex-start;"><span style="font-size:8px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;min-width:65px;padding-top:2px;">${l}</span><span style="font-size:10px;color:#1a3a5c;flex:1;">${escHtml(String(v))}</span></div>`).join("")||`<div style="font-size:10px;color:#94a3b8;">No neurological deficits documented</div>`}`,"#7c3aed")}
    ${sectionCard("Palpation","&#128080;",`${[["Tenderness",d.palp_tenderness],["Tone",d.palp_tone],["Swelling",d.palp_swelling],["Temperature",d.palp_temp],["Crepitus",d.palp_crepitus]].filter(([,v])=>v).map(([l,v])=>`<div style="display:flex;gap:8px;margin-bottom:7px;align-items:flex-start;"><span style="font-size:8px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;min-width:70px;padding-top:2px;">${l}</span><span style="font-size:10px;color:#1a3a5c;flex:1;">${escHtml(String(v))}</span></div>`).join("")||`<div style="font-size:10px;color:#94a3b8;">No palpation findings recorded</div>`}`,"#d97706")}
  </div>
  ${sectionCard("Clinical Summary","&#128203;",`<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;"><div><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">Problem List</div><div style="background:rgba(220,38,38,0.04);border:1px solid rgba(220,38,38,0.15);border-radius:8px;padding:10px 14px;">${dxList.slice(0,3).map((item,i)=>`<div style="font-size:10px;color:#1a3a5c;padding:3px 0;border-bottom:1px solid rgba(220,38,38,0.08);">${i+1}. ${escHtml(item.label||"")}</div>`).join("")||`<div style="font-size:10px;color:#94a3b8;">Pending diagnosis</div>`}</div></div><div><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">Patient Goals</div><div style="background:rgba(5,150,105,0.04);border:1px solid rgba(5,150,105,0.15);border-radius:8px;padding:10px 14px;">${[d.ar_goal_function,d.ar_goal_pain,d.ar_goal_return].filter(Boolean).map(g=>`<div style="font-size:10px;color:#1a3a5c;padding:3px 0;border-bottom:1px solid rgba(5,150,105,0.1);">&#10003; ${escHtml(String(g))}</div>`).join("")||`<div style="font-size:10px;color:#94a3b8;">Goals to be established</div>`}</div></div></div><div style="margin-top:12px;padding:10px 14px;background:#f1f5f9;border-radius:8px;border:1px solid #e2e8f0;"><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">Clinical Notes</div><div style="font-size:10.5px;color:#1a3a5c;line-height:1.6;">${escHtml(d.soap_assessment||d.clinical_notes||"Assessment findings documented above.")}</div></div>`,"#059669")}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;padding-top:16px;border-top:2px solid #e2e8f0;">
    <div><div style="font-size:9px;color:#6b7280;margin-bottom:24px;">Physiotherapist Signature:</div><div style="border-bottom:1px solid #1a3a5c;width:80%;margin-bottom:4px;height:24px;"></div><div style="font-size:9px;color:#6b7280;">Name / AHPRA No.: ___________________</div></div>
    <div><div style="font-size:9px;color:#6b7280;margin-bottom:24px;">Date of Assessment:</div><div style="border-bottom:1px solid #1a3a5c;width:80%;margin-bottom:4px;height:24px;"></div><div style="font-size:9px;color:#6b7280;">Next Review: ___________________</div></div>
  </div>
</div>
${pdfFooter("Physiotherapy Assessment Report")}
</div></body></html>`;
  };

  const buildTreatmentPdf = () => {
    const exercises = gatherExercises();
    const techniques = gatherTechniques();
    const dxLabel = escHtml(dx?.dx?.[0]?.label || d.cc_main || "Musculoskeletal Dysfunction");
    const phaseColors = {"Phase 1":"#0891b2","Phase 2":"#7c3aed","Phase 3":"#059669","Phase 4":"#d97706","Phase 1 -- Motor Control":"#0891b2","Phase 1 -- Mobility":"#0891b2","Phase 1 -- Activation":"#0891b2","Phase 1 -- Flexibility":"#0891b2","Phase 2 -- Stability":"#7c3aed","Phase 2 -- Strengthening":"#7c3aed","Phase 2 -- Functional":"#7c3aed","Phase 3 -- Functional":"#059669"};
    const groupedExercises = exercises.reduce((acc, ex) => { const p = ex.phase || "Phase 1"; if(!acc[p]) acc[p]=[]; acc[p].push(ex); return acc; }, {});
    const svgKeys = Object.keys(exerciseSvgs);
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Treatment Plan - ${escHtml(patName)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{background:#fff;max-width:860px;margin:0 auto;box-shadow:0 4px 40px rgba(0,0,0,0.12);}.body{padding:28px 40px;}table{width:100%;border-collapse:collapse;}th{background:#f1f5f9;font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;padding:8px 10px;text-align:left;}td{padding:7px 10px;font-size:10.5px;border-bottom:1px solid #e2e8f0;}@media print{body{background:white;}.page{box-shadow:none;}}</style>
</head><body><div class="page">
${pdfHeader("Physiotherapy Treatment Plan","Evidence-Based Clinical Management Program","#059669")}
<div class="body">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
    <div style="background:rgba(5,150,105,0.06);border:1px solid rgba(5,150,105,0.2);border-radius:10px;padding:14px 16px;"><div style="font-size:9px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Patient Details</div>${[["Patient",escHtml(patName)],["DOB / Age",`${escHtml(dob)} / ${escHtml(String(age))}`],["Sex",escHtml(sex)],["Occupation",escHtml(occ)]].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(5,150,105,0.1);"><span style="font-size:9px;color:#6b7280;">${l}</span><span style="font-size:10px;font-weight:600;color:#1a3a5c;">${v}</span></div>`).join("")}</div>
    <div style="background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.2);border-radius:10px;padding:14px 16px;"><div style="font-size:9px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Working Diagnosis</div><div style="font-size:13px;font-weight:800;color:#1a3a5c;margin-bottom:8px;line-height:1.3;">${dxLabel}</div>${[["Pain (VAS Now)",val("pa_vas_now")+"/10"],["Treatment Frequency",val("tx_frequency","2&ndash;3x per week")],["Expected Duration",val("tx_duration_plan","6&ndash;8 weeks")]].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(37,99,235,0.1);"><span style="font-size:9px;color:#6b7280;">${l}</span><span style="font-size:10px;font-weight:600;color:#1a3a5c;">${v}</span></div>`).join("")}</div>
  </div>
  ${sectionCard("Treatment Goals","&#127919;",`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">${[
    ["Short-Term (2&ndash;4 wks)","#0891b2",[d.ar_goal_pain||"Pain reduction &ge;30% on VAS",d.ar_goal_function||"Improve functional ROM","Reduce swelling/inflammation"]],
    ["Medium-Term (4&ndash;8 wks)","#2563eb",[d.ar_goal_str||"Restore muscle strength to 4+/5",d.ar_goal_func||"Functional task independence","Return to work/leisure activities"]],
    ["Long-Term (8&ndash;12 wks)","#059669",[d.ar_goal_return||"Full return to prior activity","Self-management strategies","Prevent recurrence"]],
  ].map(([title,color,goals])=>`<div style="background:${color}06;border:1px solid ${color}25;border-radius:8px;padding:12px;"><div style="font-size:9px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">${title}</div>${goals.map(g=>`<div style="font-size:9.5px;color:#1a3a5c;padding:4px 0;border-bottom:1px solid ${color}15;display:flex;gap:6px;align-items:flex-start;"><span style="color:${color};font-weight:700;flex-shrink:0;">&#10003;</span><span>${escHtml(String(g))}</span></div>`).join("")}</div>`).join("")}</div>`,"#059669")}
  ${sectionCard("Manual Therapy &amp; Treatment Techniques","&#129330;",`<table><thead><tr><th>Technique</th><th>Target Area</th><th>Duration / Dosage</th><th>Evidence Base</th></tr></thead><tbody>${techniques.length>0?techniques.map(t=>`<tr style="border-bottom:1px solid #e2e8f0;"><td style="font-size:10px;font-weight:600;color:#1a3a5c;">${escHtml(t.name)}</td><td style="font-size:10px;">${escHtml(t.area)}</td><td style="font-size:10px;">${escHtml(t.duration)}</td><td style="font-size:9.5px;color:#6b7280;">${escHtml(t.rationale)}</td></tr>`).join(""):
[["Soft Tissue Mobilisation","Hypertonic muscles / trigger points","5&ndash;10 min per area","Level 1A &mdash; Cochrane Review"],["Joint Mobilisation (Grade III&ndash;IV)","Restricted articular joint segments","3 sets PA pressure","Level 1B &mdash; RCT evidence"],["Therapeutic Ultrasound","Periarticular / tendon tissue","1MHz, 1.0 W/cm&sup2;, 5 min","Level 2B"],["Dry Needling / IMS","Myofascial trigger points","As clinically indicated","Level 1B &mdash; multiple RCTs"],["Taping (Kinesio / Rigid)","Joint support / proprioception","72 hrs per application","Level 2"],["TENS / Electrotherapy","Pain modulation (gate control)","80Hz, 20 min","Level 2B &mdash; analgesic effect"],].map(([tech,target,dose,ev])=>`<tr style="border-bottom:1px solid #e2e8f0;"><td style="font-size:10px;font-weight:600;color:#1a3a5c;">${tech}</td><td style="font-size:10px;">${target}</td><td style="font-size:10px;">${dose}</td><td style="font-size:9px;color:#6b7280;">${ev}</td></tr>`).join("")}</tbody></table>`,"#d97706")}
  ${Object.entries(groupedExercises).map(([phase,exs])=>{const pColor=phaseColors[phase]||"#2563eb";return sectionCard(`Exercise Prescription &mdash; ${phase}`,"&#127959;",`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">${exs.map((ex,i)=>{const svgType=svgKeys[i%svgKeys.length];return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;"><div style="background:${pColor}10;border-bottom:1px solid ${pColor}20;padding:8px 12px;display:flex;align-items:center;gap:8px;"><span style="width:22px;height:22px;background:${pColor};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;">${i+1}</span><span style="font-size:11px;font-weight:700;color:#1a3a5c;">${escHtml(ex.name)}</span></div><div style="padding:10px 12px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">${[["Sets",ex.sets],["Reps",ex.reps],ex.hold?["Hold",ex.hold]:null,["Rest",ex.rest],["Frequency",ex.freq]].filter(Boolean).map(([l,v])=>`<div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:5px 8px;text-align:center;"><div style="font-size:7.5px;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;">${l}</div><div style="font-size:10px;font-weight:700;color:${pColor};">${escHtml(v)}</div></div>`).join("")}</div>${ex.target?`<div style="font-size:8.5px;color:#0891b2;margin-bottom:4px;"><strong>Target:</strong> ${escHtml(ex.target)}</div>`:""}${ex.notes?`<div style="background:#fff;border-radius:6px;padding:6px 8px;font-size:8.5px;color:#6b7280;line-height:1.5;border:1px solid #e2e8f0;">${escHtml(ex.notes)}</div>`:""}${ex.progression?`<div style="margin-top:5px;font-size:8px;color:#059669;"><strong>&#11014; Progression:</strong> ${escHtml(ex.progression)}</div>`:""}</div></div>`;}).join("")}</div>`,pColor);}).join("")}
  ${sectionCard("Outcome Measures &amp; Reassessment","&#128200;",`<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;"><div><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Baseline &amp; Target</div><table><thead><tr><th>Measure</th><th>Baseline</th><th>Target</th></tr></thead><tbody>${[["VAS Pain Now",val("pa_vas_now"),"&le;"+Math.max(0,(parseFloat(d.pa_vas_now)||5)-3)+"/10"],["VAS Worst",val("pa_vas_worst"),"&le;5/10"],["PSFS Score",val("psfs_score"),"&ge;7/10"],["Patient Goal",val("ar_goal_function"),"Achieved"],].map(([m,b,t])=>`<tr style="border-bottom:1px solid #e2e8f0;"><td style="font-size:9px;">${m}</td><td style="font-size:9px;font-weight:700;color:#dc2626;">${b}</td><td style="font-size:9px;font-weight:700;color:#059669;">${t}</td></tr>`).join("")}</tbody></table></div><div><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Reassessment Schedule</div>${[["Sessions 1&ndash;2","Baseline, pain education, motor control"],["Sessions 3&ndash;4","Reassess pain, progress exercises"],["Session 6","Formal re-test, goal review"],["Session 8&ndash;10","Discharge planning"],].map(([s,desc])=>`<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid #e2e8f0;align-items:flex-start;"><span style="font-size:9px;font-weight:700;color:#2563eb;min-width:90px;flex-shrink:0;">${s}</span><span style="font-size:9px;color:#6b7280;">${desc}</span></div>`).join("")}</div></div>`,"#0891b2")}
  <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div><div style="font-size:9px;color:#6b7280;margin-bottom:24px;">Therapist Signature:</div><div style="border-bottom:1px solid #1a3a5c;width:80%;margin-bottom:4px;height:24px;"></div><div style="font-size:9px;color:#6b7280;">Name / AHPRA: ___________________</div></div><div><div style="font-size:9px;color:#6b7280;margin-bottom:24px;">Date:</div><div style="border-bottom:1px solid #1a3a5c;width:80%;margin-bottom:4px;height:24px;"></div><div style="font-size:9px;color:#6b7280;">Review Date: ___________________</div></div></div>
</div>
${pdfFooter("Treatment Plan")}
</div></body></html>`;
  };

  const buildHomeExercisePdf = () => {
    const exercises = gatherExercises();
    const dxLabel = escHtml(dx?.dx?.[0]?.label || d.cc_main || "Your Condition");
    const nextAppt = d.next_appointment || "_______________________";
    const physioName = d.therapist_name || "Your Physiotherapist";
    const clinicName = d.clinic_name || "PhysioMind Clinic";
    const clinicPhone = d.clinic_phone || "";
    const svgKeys = Object.keys(exerciseSvgs);
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Home Exercise Program - ${escHtml(patName)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{background:#fff;max-width:860px;margin:0 auto;box-shadow:0 4px 40px rgba(0,0,0,0.12);}.body{padding:24px 36px;}.ex-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:16px;break-inside:avoid;box-shadow:0 2px 8px rgba(0,0,0,0.05);}.ex-body{display:grid;grid-template-columns:130px 1fr;}.ex-img{background:#f8fafc;padding:12px;display:flex;align-items:center;justify-content:center;border-right:1px solid #e2e8f0;}.ex-content{padding:14px 16px;}.dosage-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(75px,1fr));gap:8px;margin-bottom:10px;}.dosage-chip{text-align:center;padding:7px 6px;border-radius:8px;}table{width:100%;border-collapse:collapse;}th{background:#f1f5f9;font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;padding:8px 10px;text-align:left;}td{padding:7px 10px;font-size:10.5px;border-bottom:1px solid #e2e8f0;}@media print{body{background:white;}.page{box-shadow:none;}}</style>
</head><body><div class="page">
${pdfHeader("Home Exercise Program","Your Personalised Daily Rehabilitation Protocol","#7c3aed")}
<div class="body">
  <div style="background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(37,99,235,0.04));border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;">
    <div style="font-size:28px;flex-shrink:0;">&#127968;</div>
    <div><div style="font-size:14px;font-weight:800;color:#1a3a5c;margin-bottom:4px;">Hello, ${escHtml(patName.split(" ")[0]||patName)}!</div><div style="font-size:10.5px;color:#6b7280;line-height:1.6;">This personalised home exercise program has been designed specifically for you by <strong style="color:#1a3a5c;">${escHtml(physioName)}</strong> to help manage <strong style="color:#7c3aed;">${dxLabel}</strong>. Performing these exercises consistently is essential for your recovery.</div><div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap;">${[["&#128197;","Program Start",today],["&#128222;","Next Appointment",escHtml(nextAppt)],["&#127973;","Clinic",escHtml(clinicName)]].map(([icon,l,v])=>`<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"><span>${icon}</span><div><div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;">${l}</div><div style="font-size:10px;font-weight:600;color:#1a3a5c;">${v}</div></div></div>`).join("")}</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">${[
    ["&#128680;","Stop if you feel...","Sharp or shooting pain &bull; Numbness / tingling &bull; Sudden severe pain &bull; Dizziness or nausea","#dc2626"],
    ["&#9989;","Good pain is OK","Mild muscle ache/burn = normal. This means your muscles are working. Soreness lasting &lt;24h is acceptable.","#059669"],
    ["&#128222;","When to call us",`Contact ${escHtml(clinicName)} if symptoms worsen significantly. Do not push through severe pain.${clinicPhone?" Ph: "+escHtml(clinicPhone):""}`, "#2563eb"],
  ].map(([icon,title,text,color])=>`<div style="background:${color}06;border:1px solid ${color}25;border-radius:10px;padding:12px 14px;"><div style="font-size:18px;margin-bottom:6px;">${icon}</div><div style="font-size:10px;font-weight:700;color:${color};margin-bottom:5px;">${title}</div><div style="font-size:9px;color:#6b7280;line-height:1.5;">${text}</div></div>`).join("")}</div>
  <div style="margin-bottom:14px;font-size:11px;font-weight:700;color:#1a3a5c;text-transform:uppercase;letter-spacing:0.8px;border-bottom:2px solid #7c3aed;padding-bottom:8px;">Your Exercises &mdash; ${exercises.length} Total</div>
  ${exercises.map((ex,i)=>{
    const phaseColors2={"Phase 1":"#0891b2","Phase 2":"#7c3aed","Phase 3":"#059669","Phase 4":"#d97706","Phase 1 -- Motor Control":"#0891b2","Phase 1 -- Mobility":"#0891b2","Phase 1 -- Activation":"#0891b2","Phase 1 -- Flexibility":"#0891b2","Phase 2 -- Stability":"#7c3aed","Phase 2 -- Strengthening":"#7c3aed","Phase 2 -- Functional":"#7c3aed","Phase 3 -- Functional":"#059669"};
    const pColor=phaseColors2[ex.phase]||"#7c3aed";
    const svgType=svgKeys[i%svgKeys.length];
    const steps=ex.notes?[ex.notes]:["Get into the starting position as shown in the illustration.","Move slowly and in a controlled manner throughout.","Hold for the time indicated, then return to start position.","Breathe normally throughout &mdash; do not hold your breath."];
    return `<div class="ex-card">
      <div style="background:linear-gradient(135deg,${pColor}15,${pColor}05);border-bottom:1px solid ${pColor}30;padding:12px 16px;display:flex;align-items:center;gap:12px;">
        <div style="width:32px;height:32px;background:${pColor};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0;">${i+1}</div>
        <div style="flex:1;"><div style="font-size:13px;font-weight:800;color:#1a3a5c;">${escHtml(ex.name)}</div><div style="display:flex;gap:6px;margin-top:3px;flex-wrap:wrap;"><span style="display:inline-block;padding:3px 8px;background:${pColor}15;border:1px solid ${pColor}40;border-radius:5px;font-size:9px;font-weight:700;color:${pColor};">${escHtml(ex.phase||"Phase 1")}</span>${ex.target?`<span style="display:inline-block;padding:3px 8px;background:#0891b215;border:1px solid #0891b240;border-radius:5px;font-size:9px;font-weight:700;color:#0891b2;">${escHtml(ex.target)}</span>`:""}</div></div>
        <div style="text-align:right;"><div style="font-size:9px;color:#6b7280;">Frequency</div><div style="font-size:12px;font-weight:800;color:${pColor};">${escHtml(ex.freq||"Daily")}</div></div>
      </div>
      <div class="ex-body">
        <div class="ex-img">${exerciseSvgHtml(i, pColor)}</div>
        <div class="ex-content">
          <div class="dosage-grid">${[["Sets",ex.sets,pColor],["Reps",ex.reps,"#2563eb"],ex.hold?["Hold",ex.hold,"#0891b2"]:null,["Rest",ex.rest||"30s","#6b7280"]].filter(Boolean).map(([l,v,c])=>`<div class="dosage-chip" style="background:${c}10;border:1px solid ${c}30;"><div style="font-size:7.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">${l}</div><div style="font-size:14px;font-weight:800;color:${c};line-height:1.2;">${escHtml(v)}</div></div>`).join("")}</div>
          <div style="margin-bottom:8px;"><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;">Instructions</div>${steps.map((step,si)=>`<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid #e2e8f0;align-items:flex-start;font-size:10px;line-height:1.5;"><div style="width:20px;height:20px;min-width:20px;background:${pColor};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;">${si+1}</div><span style="color:#1a3a5c;">${escHtml(step)}</span></div>`).join("")}</div>
          ${ex.progression?`<div style="margin-top:6px;padding:6px 10px;background:rgba(5,150,105,0.06);border:1px solid rgba(5,150,105,0.15);border-radius:6px;font-size:8.5px;"><strong style="color:#059669;">&#11014; When easier, progress to:</strong> ${escHtml(ex.progression)}</div>`:""}
        </div>
      </div>
    </div>`;
  }).join("")}
  ${sectionCard("Weekly Compliance Tracker","&#128197;",`<div style="margin-bottom:8px;font-size:10px;color:#6b7280;">Tick each day you complete your exercises. Aim for consistency!</div><table><thead><tr style="background:#f1f5f9;"><th style="width:35%;">Exercise</th>${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=>`<th style="text-align:center;font-size:9px;font-weight:700;color:#6b7280;">${day}</th>`).join("")}</tr></thead><tbody>${exercises.map((ex,i)=>`<tr style="border-bottom:1px solid #e2e8f0;"><td style="font-size:10px;font-weight:600;color:#1a3a5c;">${i+1}. ${escHtml(ex.name)}</td>${Array(7).fill(0).map(()=>`<td style="text-align:center;padding:8px;"><div style="width:22px;height:22px;border:1.5px solid #e2e8f0;border-radius:4px;margin:0 auto;"></div></td>`).join("")}</tr>`).join("")}</tbody></table><div style="margin-top:12px;font-size:9px;color:#6b7280;">Pain Score Today (0&ndash;10): ___ / 10 &nbsp;&nbsp;&nbsp; Overall feeling: &#9633; Great &nbsp; &#9633; OK &nbsp; &#9633; Struggling</div>`,"#0891b2")}
  ${sectionCard("7-Day Pain Diary","&#128212;",`<div style="font-size:9px;color:#6b7280;margin-bottom:10px;">Record your pain and how you are feeling each day. Bring this to your next appointment.</div><table><thead><tr><th>Date</th><th>Morning Pain (0&ndash;10)</th><th>Evening Pain (0&ndash;10)</th><th>Exercises Done?</th><th>Notes</th></tr></thead><tbody>${Array(7).fill(0).map((_,i)=>`<tr style="border-bottom:1px solid #e2e8f0;"><td style="font-size:9px;color:#94a3b8;padding:10px;">Day ${i+1}</td><td style="padding:10px;"><div style="width:60px;border-bottom:1px solid #e2e8f0;height:18px;"></div></td><td style="padding:10px;"><div style="width:60px;border-bottom:1px solid #e2e8f0;height:18px;"></div></td><td style="padding:10px;"><div style="display:flex;gap:8px;font-size:9px;"><span>&#9633; Yes</span><span>&#9633; No</span></div></td><td style="padding:10px;"><div style="width:100%;border-bottom:1px solid #e2e8f0;height:18px;"></div></td></tr>`).join("")}</tbody></table>`,"#7c3aed")}
  ${sectionCard("Lifestyle Advice","&#128161;",`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${[["&#10052;","Ice / Heat","Apply ice (cold pack wrapped in cloth) for 15&ndash;20 min if swollen or inflamed. Apply heat for stiffness or muscle tightness. Never apply directly to skin.","#0891b2"],["&#128716;","Activity Modification","Stay as active as possible within your pain limits. Avoid complete bed rest. Short, frequent walks are beneficial.","#059669"],["&#129506;","Posture Awareness","Be mindful of your posture during daily activities, especially sitting and lifting. Apply the postural cues discussed in your session.","#7c3aed"],["&#128222;","When to Seek Help","Return to your physiotherapist or GP immediately if: symptoms significantly worsen, new symptoms develop, or you experience any new neurological symptoms.","#dc2626"],].map(([icon,title,text,color])=>`<div style="background:${color}06;border:1px solid ${color}20;border-radius:8px;padding:10px 12px;"><div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;"><span style="font-size:14px;">${icon}</span><span style="font-size:10px;font-weight:700;color:${color};">${title}</span></div><div style="font-size:9px;color:#6b7280;line-height:1.5;">${text}</div></div>`).join("")}</div>`,"#059669")}
  <div style="background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(37,99,235,0.04));border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:16px 20px;margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:center;"><div><div style="font-size:12px;font-weight:800;color:#1a3a5c;margin-bottom:4px;">${escHtml(clinicName)}</div>${clinicPhone?`<div style="font-size:11px;font-weight:600;color:#2563eb;margin-top:4px;">&#128222; ${escHtml(clinicPhone)}</div>`:""}</div><div style="border-left:1px solid rgba(124,58,237,0.2);padding-left:16px;"><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">Next Appointment</div><div style="font-size:14px;font-weight:800;color:#7c3aed;">${escHtml(nextAppt)}</div><div style="font-size:9px;color:#6b7280;margin-top:4px;">Bring this program to your session</div></div></div>
</div>
${pdfFooter("Home Exercise Program &mdash; Patient Copy")}
</div></body></html>`;
  };

  const buildPostureReportPdf = () => {
    const postScore = d.posture_score || d.post_score || "N/A";
    const postBand  = d.posture_band  || d.post_band  || "N/A";
    const cva       = d.post_cva      || d.cva_angle  || "N/A";
    const fhp       = d.post_fhp_dist || d.fhp_dist   || "N/A";
    const shAngle   = d.post_shoulder_angle || d.shoulder_angle || "N/A";
    const kyph      = d.post_kyphosis_angle || d.kyphosis_angle || "N/A";
    const lord      = d.post_lordosis_angle || d.lordosis_angle || "N/A";
    const pelv      = d.post_pelvic_tilt    || d.pelvic_tilt    || "N/A";
    const reliability = d.posture_reliability || "N/A";
    const view      = d.posture_view || "Anterior";
    const DEFECT_LABELS = {
      forward_head:"Forward Head Posture (CVA reduced)",rounded_shoulders:"Rounded/Protracted Shoulders",
      thoracic_kyphosis:"Increased Thoracic Kyphosis",lumbar_hyperlordosis:"Lumbar Hyperlordosis",
      anterior_pelvic_tilt:"Anterior Pelvic Tilt",posterior_pelvic_tilt:"Posterior Pelvic Tilt",
      lateral_pelvic_tilt:"Lateral Pelvic Tilt",genu_valgum:"Genu Valgum (Knock Knees)",
      genu_varum:"Genu Varum (Bow Legs)",foot_pronation:"Foot Overpronation / Flat Arch",
      foot_supination:"Foot Supination / High Arch",scoliosis:"Scoliosis / Lateral Spinal Curve",
      head_tilt:"Lateral Head Tilt",scapular_winging:"Scapular Winging",
    };
    const DEFECT_MUSCLES = {
      forward_head:{tight:["Upper trapezius","SCM","Suboccipitals"],weak:["Deep neck flexors","Lower trapezius"]},
      rounded_shoulders:{tight:["Pec major","Pec minor","Subscapularis"],weak:["Lower trapezius","Rhomboids"]},
      thoracic_kyphosis:{tight:["Pec major/minor","Ant intercostals"],weak:["Thoracic extensors","Lower trap"]},
      lumbar_hyperlordosis:{tight:["Iliopsoas","QL","Lumbar erectors"],weak:["Gluteus maximus","TA"]},
      anterior_pelvic_tilt:{tight:["Iliopsoas","Rectus femoris","TFL"],weak:["Gluteus maximus","Hamstrings"]},
      posterior_pelvic_tilt:{tight:["Hamstrings","Gluteus max","Rect abdominis"],weak:["Hip flexors","Lumb ext"]},
      lateral_pelvic_tilt:{tight:["Ipsilateral QL","Ipsilateral TFL"],weak:["Contralateral glut med"]},
      genu_valgum:{tight:["TFL","IT band","Hip adductors"],weak:["Glut med","VMO","Hip ext rotators"]},
      genu_varum:{tight:["IT band","Biceps femoris"],weak:["Hip adductors","VMO"]},
      foot_pronation:{tight:["Gastrocnemius","Soleus","Peroneals"],weak:["Tib posterior","Intrinsic foot"]},
      foot_supination:{tight:["IT band","Plantar fascia"],weak:["Peroneals","Intrinsic foot muscles"]},
      scoliosis:{tight:["Ipsilateral paraspinals","Ipsilateral QL"],weak:["Contralateral paraspinals"]},
      head_tilt:{tight:["Ipsilat upper trap","SCM","Levator scap"],weak:["Contralat lateral neck flexors"]},
      scapular_winging:{tight:["Pec minor","Ant shoulder"],weak:["Serratus anterior","Lower trapezius"]},
    };
    const DEFECT_RX = {
      forward_head:"Chin tucks x15 daily - DNF activation - Pec minor stretch",
      rounded_shoulders:"Band pull-apart x20 - Face pulls x15 - Pec doorway stretch",
      thoracic_kyphosis:"Foam roller extension T4-T8 - T-spine rotation - Prone Y-T-W",
      lumbar_hyperlordosis:"Hip flexor couch stretch - Glute bridges 3x15 - Dead bug",
      anterior_pelvic_tilt:"Pelvic tilts - Couch stretch - Glute activation",
      posterior_pelvic_tilt:"Hip flexor stretching - Lumbar extension - Cat-cow",
      lateral_pelvic_tilt:"Side-lying hip abduction - Clamshells - QL stretch",
      genu_valgum:"Clamshells - Monster walks - Single-leg squat with knee tracking",
      genu_varum:"IT band foam rolling - Hip adductor strengthening",
      foot_pronation:"Short foot exercise - Calf raises - Tib posterior strengthening",
      foot_supination:"Peroneal strengthening - Single-leg balance - Lateral band walks",
      scoliosis:"Schroth breathing - Concave-side stretch - Convex-side strengthening",
      head_tilt:"Contralat cervical lat flexion stretch - Upper trap SMR",
      scapular_winging:"Serratus ant wall push-ups - Lower trap Y-T-W",
    };
    const selectedDefects = Object.keys(DEFECT_LABELS).filter(function(id) { return d["posture_defect_" + id]; });
    const dxLabel = escHtml((dx && dx.dx && dx.dx[0] && dx.dx[0].label) ? dx.dx[0].label : (d.cc_main || "Postural Dysfunction"));
    const scoreNum = parseFloat(postScore) || 0;
    const scoreColor = scoreNum >= 75 ? "#059669" : scoreNum >= 50 ? "#d97706" : "#dc2626";
    const photoImg = d.posture_photo_url || d.posture_captured_img || "";

    // Pre-build all HTML sections as plain strings -- no nested template literals
    var patientCells = [
      ["Patient", escHtml(patName)],
      ["DOB / Age", escHtml(dob) + " / " + escHtml(String(age))],
      ["Occupation", escHtml(occ)],
      ["Report Date", today],
      ["Referring GP", escHtml(gp)],
      ["Insurer", escHtml(insurer)],
      ["Method", "AI Landmark Detection"],
      ["View", escHtml(view)],
    ].map(function(p) {
      return '<div><div style="font-size:8px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px;">' + p[0] + '</div>'
           + '<div style="font-size:10px;font-weight:600;color:#1a3a5c;">' + p[1] + '</div></div>';
    }).join("");

    var circ50 = 2 * Math.PI * 50;
    var dash = (scoreNum / 100) * circ50;
    var scoreRing = '<svg viewBox="0 0 120 120" width="110" height="110" style="display:block;margin:0 auto 8px;">'
      + '<circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" stroke-width="10"/>'
      + '<circle cx="60" cy="60" r="50" fill="none" stroke="' + scoreColor + '" stroke-width="10" stroke-dasharray="' + dash + ' ' + circ50 + '" stroke-linecap="round" transform="rotate(-90 60 60)"/>'
      + '<text x="60" y="54" text-anchor="middle" fill="' + scoreColor + '" font-size="22" font-weight="800">' + (scoreNum || "N/A") + '</text>'
      + '<text x="60" y="68" text-anchor="middle" fill="#94a3b8" font-size="9">/100</text>'
      + '<text x="60" y="82" text-anchor="middle" fill="' + scoreColor + '" font-size="8" font-weight="700">' + escHtml(postBand) + '</text>'
      + '</svg>';

    var scoreLegend = [["75-100","Excellent","#059669"],["50-74","Moderate","#d97706"],["25-49","Poor","#dc2626"],["0-24","Critical","#7f1d1d"]]
      .map(function(r) {
        return '<div style="background:' + r[2] + '12;border-radius:5px;padding:4px 6px;border:1px solid ' + r[2] + '30;">'
             + '<div style="font-size:8px;font-weight:700;color:' + r[2] + ';">' + r[1] + '</div>'
             + '<div style="font-size:7px;color:#94a3b8;">' + r[0] + '</div></div>';
      }).join("");

    var measData = [
      {label:"Craniovertebral Angle", value:cva,     normal:"&gt;50 deg", bad:parseFloat(cva)<50,                                          bc:"#dc2626"},
      {label:"Forward Head Dist",     value:fhp,     normal:"&lt;25mm",   bad:parseFloat(fhp)>25,                                          bc:"#dc2626"},
      {label:"Shoulder Angle",        value:shAngle, normal:"&lt;2 deg",  bad:parseFloat(shAngle)>2,                                       bc:"#d97706"},
      {label:"Thoracic Kyphosis",     value:kyph,    normal:"20-40 deg",  bad:parseFloat(kyph)>40,                                         bc:"#d97706"},
      {label:"Lumbar Lordosis",       value:lord,    normal:"30-50 deg",  bad:parseFloat(lord)>50||parseFloat(lord)<30,                    bc:"#d97706"},
      {label:"Pelvic Tilt",           value:pelv,    normal:"0-5 deg",    bad:false,                                                       bc:"#6b7280"},
    ];
    var measCards = measData.map(function(m) {
      var c = (m.bad && m.value !== "N/A") ? m.bc : (m.value === "N/A" ? "#94a3b8" : "#059669");
      var status = m.value === "N/A" ? "N/A" : m.bad ? "Abnormal" : "Normal";
      return '<div style="background:' + c + '08;border:1px solid ' + c + '25;border-radius:8px;padding:9px 11px;border-left:3px solid ' + c + ';">'
           + '<div style="font-size:7.5px;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:3px;">' + m.label + '</div>'
           + '<div style="font-size:18px;font-weight:800;color:' + c + ';line-height:1;">' + escHtml(String(m.value)) + '</div>'
           + '<div style="display:flex;justify-content:space-between;margin-top:3px;">'
           + '<span style="font-size:7.5px;color:#94a3b8;">Norm: ' + m.normal + '</span>'
           + '<span style="font-size:7.5px;font-weight:700;color:' + c + ';">' + status + '</span>'
           + '</div></div>';
    }).join("");

    var defectRows = selectedDefects.map(function(id, i) {
      var label = DEFECT_LABELS[id] || id;
      var sev = d["posture_defect_" + id + "_severity"] || "mild";
      var sc = sev === "severe" ? "#dc2626" : sev === "moderate" ? "#d97706" : "#059669";
      var muscles = DEFECT_MUSCLES[id];
      var tight = muscles ? muscles.tight.slice(0,2).join(", ") : "N/A";
      var rx = DEFECT_RX[id] || "Clinical assessment required";
      return '<tr style="background:' + (i%2===0?"#fff":"#f8fafc") + ';">'
           + '<td style="font-size:9.5px;font-weight:700;color:#1a3a5c;">' + escHtml(label) + '</td>'
           + '<td><span style="padding:2px 8px;border-radius:4px;font-size:8px;font-weight:700;background:' + sc + '15;color:' + sc + ';">' + sev.charAt(0).toUpperCase() + sev.slice(1) + '</span></td>'
           + '<td style="font-size:8.5px;color:#6b7280;">' + escHtml(tight) + '</td>'
           + '<td style="font-size:8.5px;color:#1a3a5c;">' + rx + '</td></tr>';
    }).join("");

    var defectSection = selectedDefects.length > 0
      ? sectionCard("Regional Postural Findings", "&#128450;",
          '<table><thead><tr><th>Region / Defect</th><th>Severity</th><th>Tight Structures</th><th>Clinical Action</th></tr></thead>'
          + '<tbody>' + defectRows + '</tbody></table>', "#64748b")
      : sectionCard("Regional Postural Findings", "&#128450;",
          '<div style="padding:12px;text-align:center;color:#94a3b8;font-size:10px;">No postural defects recorded. Use the Posture Defect Assessment module to document findings.</div>',
          "#64748b");

    var hasUCS = selectedDefects.some(function(id) { return id==="forward_head"||id==="rounded_shoulders"||id==="thoracic_kyphosis"; });
    var hasLCS = selectedDefects.some(function(id) { return id==="anterior_pelvic_tilt"||id==="lumbar_hyperlordosis"; });
    var regionSet = {};
    selectedDefects.forEach(function(id) {
      regionSet[(id.indexOf("foot")>=0||id.indexOf("genu")>=0)?"Lower Limb":(id.indexOf("thoracic")>=0||id.indexOf("shoulder")>=0||id.indexOf("scapular")>=0)?"Thoracic":"Spinal/Pelvic"] = 1;
    });
    var regions = Object.keys(regionSet).join(", ") || "N/A";
    var scoreMsg = scoreNum < 50 ? "Priority intervention required." : scoreNum < 75 ? "Moderate dysfunction -- structured correction indicated." : "Good alignment -- maintenance program recommended.";

    var bioCards = [
      {title:"Upper Crossed Syndrome", active:hasUCS, text:"Tight upper trapezius/pectorals with inhibited deep neck flexors. Drives forward head and shoulder protraction.", color:"#dc2626"},
      {title:"Lower Crossed Syndrome", active:hasLCS, text:"Overactive hip flexors/lumbar extensors with weak glutes/TA. Creates anterior pelvic tilt and lumbar overload.", color:"#d97706"},
      {title:"Kinetic Chain Impact",   active:true,   text:"Compensatory load across the kinetic chain. " + selectedDefects.length + " defect(s) identified across " + regions + " regions.", color:"#0891b2"},
      {title:"Postural Load Index",    active:true,   text:"AI Posture Score: " + scoreNum + "/100 (" + escHtml(postBand) + "). " + scoreMsg, color:scoreColor},
    ].map(function(item) {
      return '<div style="background:' + item.color + '06;border:1px solid ' + item.color + '20;border-radius:8px;padding:10px 12px;' + (!item.active?"opacity:0.45;":"") + '">'
           + '<div style="font-size:9px;font-weight:700;color:' + item.color + ';margin-bottom:4px;">' + item.title + '</div>'
           + '<div style="font-size:9px;color:#6b7280;line-height:1.6;">' + item.text + '</div></div>';
    }).join("");

    var bioSection = selectedDefects.length > 0
      ? sectionCard("Biomechanical Correlation","&#129518;",
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' + bioCards + '</div>', "#7c3aed")
      : "";

    var firstLabel = selectedDefects.length > 0 ? (DEFECT_LABELS[selectedDefects[0]] || "primary deficit") : "";
    var immItems = selectedDefects.length > 0
      ? ["Address " + firstLabel, scoreNum < 50 ? "Refer for comprehensive postural assessment" : "Postural education and awareness", "Ergonomic review"]
      : ["Postural education","Ergonomic review","Activity modification"];

    var recoCols = [
      {priority:"Immediate",           items:immItems,                                                                                    color:"#dc2626"},
      {priority:"Short-Term (2-4 wks)",items:["Targeted muscle activation","Manual therapy - restricted segments","Daily HEP program"],  color:"#d97706"},
      {priority:"Long-Term (6-12 wks)",items:["Postural re-education","Progressive strengthening","Self-management and prevention"],      color:"#059669"},
    ].map(function(col) {
      var rows = col.items.map(function(item) {
        return '<div style="display:flex;gap:5px;margin-bottom:4px;align-items:flex-start;">'
             + '<span style="color:' + col.color + ';font-weight:700;font-size:10px;flex-shrink:0;">-&gt;</span>'
             + '<span style="font-size:8.5px;color:#475569;line-height:1.5;">' + item + '</span></div>';
      }).join("");
      return '<div style="background:' + col.color + '06;border:1px solid ' + col.color + '25;border-radius:8px;padding:9px 11px;">'
           + '<div style="font-size:8.5px;font-weight:800;color:' + col.color + ';text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">' + col.priority + '</div>'
           + rows + '</div>';
    }).join("");

    var recoSection = sectionCard("Clinical Recommendations","&#128203;",
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;">' + recoCols + '</div>', "#059669");

    var methodRows = [
      ["AI Engine","MediaPipe BlazePose"],
      ["View", escHtml(view)],
      ["Reliability", escHtml(reliability)],
      ["Landmarks","33 body landmarks"],
      ["Calibration", d.posture_calibration || "Auto"],
      ["Platform","PhysioMind AI"],
    ].map(function(r) {
      return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;">'
           + '<span style="font-size:8.5px;color:#94a3b8;">' + r[0] + '</span>'
           + '<span style="font-size:8.5px;font-weight:600;color:#1a3a5c;">' + r[1] + '</span></div>';
    }).join("");

    var photoBlock = photoImg
      ? '<img src="' + photoImg + '" style="width:100%;border-radius:8px;margin-bottom:6px;object-fit:cover;max-height:220px;" alt="Postural photo"/>'
      : '<div style="background:#f1f5f9;border-radius:8px;height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed #cbd5e1;margin-bottom:8px;">'
        + '<div style="font-size:9px;font-weight:700;color:#6b7280;margin-bottom:3px;">AI-Analysed Photo</div>'
        + '<div style="font-size:8px;color:#94a3b8;">with Landmark Overlay</div></div>';

    var sigRow = [["Treating Physiotherapist",""],["Signature",""],["Date / Stamp", today]].map(function(p) {
      return '<div>'
           + '<div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">' + p[0] + '</div>'
           + '<div style="height:30px;border-bottom:1.5px solid #334155;margin-bottom:3px;display:flex;align-items:flex-end;">'
           + '<span style="font-size:10px;font-weight:600;color:#1e293b;">' + escHtml(p[1]) + '</span></div></div>';
    }).join("");

    return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Posture Analysis Report - PhysioMind</title>"
      + "<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{background:#fff;max-width:860px;margin:0 auto;box-shadow:0 4px 40px rgba(0,0,0,0.12);}.body{padding:28px 40px;}table{width:100%;border-collapse:collapse;}th{background:#f1f5f9;font-size:8.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;padding:7px 9px;text-align:left;}td{padding:6px 9px;font-size:10px;border-bottom:1px solid #e2e8f0;}@media print{body{background:white;}.page{box-shadow:none;}}</style>"
      + "</head><body><div class=\"page\">"
      + pdfHeader("Postural Analysis Report","AI-Assisted Quantitative Postural Assessment &middot; PhysioMind Platform","#0a1628")
      + "<div class=\"body\">"
      + "<div style=\"display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;padding:13px;background:#f1f5f9;border-radius:10px;border:1px solid #e2e8f0;\">" + patientCells + "</div>"
      + "<div style=\"background:linear-gradient(135deg,#0a1628,#1a3358);border-radius:10px;padding:14px 18px;margin-bottom:18px;display:flex;gap:14px;align-items:center;border:1px solid #1a3358;\">"
      + "<div style=\"flex:1;\">"
      + "<div style=\"font-size:9px;color:#e8c96e;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px;\">Clinical Diagnosis</div>"
      + "<div style=\"font-size:14px;font-weight:800;color:#fff;\">" + dxLabel + "</div>"
      + "<div style=\"font-size:8.5px;color:rgba(255,255,255,0.5);margin-top:2px;\">MediaPipe BlazePose AI &middot; 33 landmarks &middot; " + escHtml(view) + " view</div>"
      + "</div><div style=\"flex-shrink:0;text-align:center;\">" + scoreRing + "</div></div>"
      + "<div style=\"display:grid;grid-template-columns:1fr 230px;gap:18px;align-items:start;\">"
      + "<div>"
      + sectionCard("Quantitative Postural Measurements","&#128207;",
          "<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:12px;\">" + measCards + "</div>"
          + "<div style=\"padding:8px 11px;background:rgba(37,99,235,0.05);border:1px solid rgba(37,99,235,0.15);border-radius:7px;font-size:8.5px;color:#1a3a5c;\">"
          + "<strong style=\"color:#2563eb;\">AI Reliability:</strong> " + escHtml(reliability)
          + " &nbsp;&middot;&nbsp; <strong>View:</strong> " + escHtml(view)
          + " &nbsp;&middot;&nbsp; <strong>Calibration:</strong> " + (d.posture_calibration || "Auto") + "</div>",
          "#0891b2")
      + defectSection
      + bioSection
      + recoSection
      + "</div>"
      + "<div>"
      + "<div style=\"background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);\">"
      + "<div style=\"font-size:8.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;\">Overall Posture Score</div>"
      + scoreRing
      + "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:5px;\">" + scoreLegend + "</div></div>"
      + "<div style=\"background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.04);\">"
      + "<div style=\"font-size:8.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px;\">Postural Photo</div>"
      + photoBlock
      + "<div style=\"font-size:8.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;margin-top:3px;\">Assessment Method</div>"
      + methodRows + "</div>"
      + "<div style=\"background:#fef3c7;border:1px solid rgba(217,119,6,0.3);border-radius:8px;padding:9px 11px;\">"
      + "<div style=\"font-size:8px;font-weight:700;color:#92400e;margin-bottom:3px;\">Clinical Disclaimer</div>"
      + "<div style=\"font-size:8px;color:#92400e;line-height:1.6;\">AI-assisted assessment is a clinical decision support tool. All measurements require clinical correlation and must be interpreted by a qualified physiotherapist.</div></div>"
      + "</div></div>"
      + "<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:18px;padding-top:14px;border-top:1px solid #e2e8f0;\">" + sigRow + "</div>"
      + "</div>"
      + pdfFooter("Postural Analysis Report &mdash; PhysioMind AI Platform")
      + "</div></body></html>";
  };

  const openPdf = (htmlContent) => {
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups for PDF generation"); return; }
    win.document.open(); win.document.write(htmlContent); win.document.close();
    setTimeout(() => { try { win.print(); } catch(e) {} }, 800);
  };

  const generatePdf = async (type) => {
    setGenerating(type);
    await new Promise(r => setTimeout(r, 400));
    try {
      let html = "";
      if (type === "assessment") html = buildAssessmentPdf();
      else if (type === "treatment") html = buildTreatmentPdf();
      else if (type === "hep") html = buildHomeExercisePdf();
      else if (type === "posture") html = buildPostureReportPdf();
      openPdf(html);
      setDone(p => ({...p, [type]: true}));
    } catch(e) { console.error(e); alert("Error generating PDF: " + e.message); }
    setGenerating(null);
  };

  const reports = [
    { id:"assessment", icon:"&#129321;", title:"Assessment Report", subtitle:"Initial Clinical Evaluation", desc:"Comprehensive physiotherapy assessment: demographics, pain scores, ROM table, postural analysis with anatomical diagram, special tests, clinical diagnosis, neurological & palpation findings, and signed clinical summary.", color:"#1a3a5c", gradient:"linear-gradient(135deg,#1a3a5c,#2563eb)", tags:["Demographics","VAS Scores","Posture Diagram","ROM Table","Diagnosis","Special Tests","Signature"], pages:"2-3 pages" },
    { id:"treatment", icon:"&#127959;", title:"Treatment Plan", subtitle:"Clinical Management Program", desc:"Evidence-based treatment plan with phased exercise prescription, manual therapy techniques and dosage, SMART goals timeline, outcome measures with baselines, reassessment schedule, and clinical precautions.", color:"#059669", gradient:"linear-gradient(135deg,#065f46,#059669)", tags:["Phased Exercises","Manual Therapy","SMART Goals","Outcome Measures","Precautions","Reassessment"], pages:"2-3 pages" },
    { id:"hep", icon:"&#127968;", title:"Home Exercise Protocol", subtitle:"Patient Copy -- Daily Program", desc:"Patient-friendly exercise cards with SVG illustrations, step-by-step instructions, dosage parameters, 7-day weekly compliance tracker, pain diary, lifestyle advice, and clinic contact details.", color:"#7c3aed", gradient:"linear-gradient(135deg,#5b21b6,#7c3aed)", tags:["Exercise Cards","SVG Illustrations","Dosage","Weekly Tracker","Pain Diary","Lifestyle Tips"], pages:"3-4 pages" },
    { id:"posture", icon:"&#129468;", title:"Postural Analysis Report", subtitle:"AI-Assisted Quantitative Posture Assessment", desc:"Full PhysioMind AI posture report: overall score ring, 6 quantitative measurements (CVA, FHP, shoulder angle, kyphosis, lordosis, pelvic tilt), regional defect table with severity & tight muscles, biomechanical correlation, Upper/Lower Crossed Syndrome flags, clinical recommendations, and photo placeholder with landmark overlay.", color:"#0891b2", gradient:"linear-gradient(135deg,#0a1628,#0891b2)", tags:["AI Score","CVA / FHP","Defect Table","Biomechanics","Photo Analysis","Recommendations","Signature"], pages:"2-3 pages" },
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#ffffff",borderRadius:20,maxWidth:760,width:"100%",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.4)"}}>
        <div style={{background:"linear-gradient(135deg,#1a3a5c 0%,#2563eb 50%,#7c3aed 100%)",borderRadius:"20px 20px 0 0",padding:"24px 28px",color:"#fff"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:"24px"}}>📄</span>
                <div><h2 style={{margin:0,fontSize:"1.3rem",fontWeight:800,letterSpacing:"-0.3px"}}>Clinical PDF Reports</h2><p style={{margin:"2px 0 0",fontSize:"0.75rem",opacity:0.8}}>Generate 3 world-class professional documents</p></div>
              </div>
              {patName !== "Patient" && <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",background:"rgba(255,255,255,0.12)",borderRadius:8,width:"fit-content"}}><div style={{width:6,height:6,borderRadius:"50%",background:"#34d399"}}/><span style={{fontSize:"0.8rem",fontWeight:600}}>{patName}</span>{age && age !== "--" && <span style={{fontSize:"0.72rem",opacity:0.7}}>&#183; Age {age}</span>}</div>}
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"#fff",cursor:"pointer",padding:"8px 14px",fontSize:"0.8rem",fontWeight:600}}>✕ Close</button>
          </div>
        </div>
        <div style={{padding:"24px 28px"}}>
          <div style={{background:"rgba(37,99,235,0.06)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:"16px",flexShrink:0}}>💡</span>
            <div style={{fontSize:"0.78rem",color:"#1e40af",lineHeight:1.6}}>Each PDF opens in a new browser tab. Use <strong>Print -&gt; Save as PDF</strong> (enable Background Graphics for full colour). Data is pulled from your current patient assessment automatically.</div>
          </div>
          <div style={{display:"grid",gap:14}}>
            {reports.map(report => (
              <div key={report.id} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:0}}>
                  <div style={{padding:"18px 20px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
                      <div style={{width:44,height:44,background:report.gradient,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}} dangerouslySetInnerHTML={{__html:report.icon}}/>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}><h3 style={{margin:0,fontSize:"1rem",fontWeight:800,color:"#1e293b"}}>{report.title}</h3><span style={{fontSize:"0.62rem",padding:"2px 7px",borderRadius:5,background:"rgba(100,116,139,0.12)",color:"#64748b",fontWeight:600}}>{report.pages}</span></div>
                        <p style={{margin:0,fontSize:"0.75rem",color:"#64748b",fontWeight:500}}>{report.subtitle}</p>
                      </div>
                    </div>
                    <p style={{margin:"0 0 10px",fontSize:"0.78rem",color:"#475569",lineHeight:1.6}}>{report.desc}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{report.tags.map(tag=><span key={tag} style={{fontSize:"0.65rem",padding:"2px 8px",borderRadius:5,background:report.color+"12",border:`1px solid ${report.color}25`,color:report.color,fontWeight:600}}>{tag}</span>)}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"18px 20px",borderLeft:"1px solid #e2e8f0",minWidth:130,gap:10}}>
                    {done[report.id] && <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(5,150,105,0.1)",border:"1px solid rgba(5,150,105,0.3)",borderRadius:8}}><span style={{color:"#059669",fontSize:"0.65rem",fontWeight:700}}>✓ Generated</span></div>}
                    <button onClick={()=>generatePdf(report.id)} disabled={generating!==null} style={{width:"100%",padding:"12px 16px",background:generating===report.id?"#94a3b8":report.gradient,border:"none",borderRadius:10,color:"#fff",fontWeight:800,fontSize:"0.78rem",cursor:generating?"not-allowed":"pointer",opacity:generating&&generating!==report.id?0.5:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
                      {generating===report.id?"⏳ Generating...":"📥 Generate PDF"}
                    </button>
                    <div style={{fontSize:"0.65rem",color:"#94a3b8",textAlign:"center",lineHeight:1.4}}>Opens in new tab<br/>Print → Save as PDF</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:18,padding:"16px 20px",background:"linear-gradient(135deg,rgba(124,58,237,0.06),rgba(37,99,235,0.04))",border:"1px solid rgba(124,58,237,0.2)",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <div><div style={{fontWeight:700,fontSize:"0.88rem",color:"#1e293b"}}>Generate All 4 Reports</div><div style={{fontSize:"0.72rem",color:"#64748b",marginTop:2}}>Create all documents at once for a complete patient report package</div></div>
            <button onClick={async()=>{for(const r of reports){await generatePdf(r.id);await new Promise(res=>setTimeout(res,1500));}}} disabled={generating!==null} style={{padding:"12px 22px",background:"linear-gradient(135deg,#1a3a5c,#7c3aed)",border:"none",borderRadius:10,color:"#fff",fontWeight:800,fontSize:"0.8rem",cursor:generating?"not-allowed":"pointer",whiteSpace:"nowrap",flexShrink:0,boxShadow:"0 2px 12px rgba(124,58,237,0.3)"}}>
              📄 Generate All
            </button>
          </div>
          <div style={{marginTop:14,padding:"12px 16px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10}}>
            <div style={{fontSize:"0.7rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6}}>💡 Tips for best results</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px"}}>
              {["Complete patient demographics before generating","Add exercises in the Exercise Prescription module","Record ROM measurements for detailed tables","Run AI Diagnosis first for diagnostic content","Use Chrome or Edge for best PDF quality","Enable Print: Background Graphics for full colour"].map(tip=>(
                <div key={tip} style={{fontSize:"0.72rem",color:"#94a3b8",display:"flex",gap:6,alignItems:"flex-start",padding:"2px 0"}}><span style={{color:"#7c3aed",fontWeight:700,flexShrink:0}}>→</span>{tip}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




export { HomeModule, TherapistDashboardModule, PdfReportsModal };
