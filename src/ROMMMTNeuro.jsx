import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { getC } from './theme.jsx';
import { ALL_TESTS, DERMATOMES, NEURAL_TENSION, RED_FLAGS_NEURO, REFLEXES, RESTRICTION_GRADE, ROM_DATA, ROM_REDFLAGS, ROM_REGIONS, mid, px, vis } from './shared.jsx';
import { genROMSoap } from './TreatmentModules.jsx';
import { AdvancedMeasurementEngine, renderPostureOverlay } from './PostureCamera.jsx';

function ROMModule({data,set}){
  const [region,setRegion]=useState(ROM_REGIONS[0]);
  const [selected,setSelected]=useState(null);
  const [showSoap,setShowSoap]=useState(false);
  const [mode,setMode]=useState("arom"); // arom | prom | resisted

  const movements=ROM_DATA[region]||[];

  const getVal=(id,side="")=>data[`${id}${side}_${mode}`]||"";
  const setVal=(id,side,val)=>set(`${id}${side}_${mode}`,val);

  const allFindings=[];
  ROM_REGIONS.forEach(reg=>{
    ROM_DATA[reg].forEach(m=>{
      const sides=m.bilateral?["_L","_R"]:[""];
      sides.forEach(s=>{
        const v=getVal(m.id,s)||data[`${m.id}${s}`];
        if(v){
          const g=RESTRICTION_GRADE(parseFloat(v),m.normal);
          if(g&&g.label!=="WNL") allFindings.push({mv:m.mv,side:s.slice(1)||"",grade:g,val:v,unit:m.unit});
        }
      });
    });
  });

  const redFlagsActive=[];
  ROM_REGIONS.forEach(reg=>ROM_DATA[reg].forEach(m=>{
    ["_L","_R",""].forEach(s=>{
      const v=getVal(m.id,s);
      if(v) ROM_REDFLAGS.forEach(rf=>{if(rf.test(m.mv,v)) redFlagsActive.push({msg:rf.msg,color:rf.color});});
    });
  }));

  const btn=(lbl,active,fn,col)=>(
    <button type="button" onClick={fn} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${active?(col||C.accent):C.border}`,background:active?`${col||C.accent}18`:"transparent",color:active?(col||C.accent):C.muted,fontSize:"0.68rem",fontWeight:active?700:400,cursor:"pointer",transition:"all 0.15s"}}>
      {lbl}
    </button>
  );

  const barW=(val,normal)=>{
    if(!val||!normal) return 0;
    return Math.min(100,Math.round((parseFloat(val)/normal)*100));
  };

  return(
    <div>
      {/* Red Flags */}
      {redFlagsActive.map((rf,i)=>(
        <div key={i} style={{marginBottom:6,padding:"7px 12px",background:`${rf.color}12`,border:`1px solid ${rf.color}40`,borderRadius:8,fontSize:"0.74rem",color:rf.color,fontWeight:600}}>
          🚨 {rf.msg}
        </div>
      ))}

      {/* Mode Toggle */}
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {[["arom","Active ROM"],["prom","Passive ROM"],["resisted","Resisted"]].map(([m,l])=>
          btn(l,mode===m,()=>setMode(m),C.accent)
        )}
        <div style={{marginLeft:"auto"}}>
          {btn(showSoap?"▲ Hide SOAP":"▼ SOAP Note",showSoap,()=>setShowSoap(p=>!p),C.a3)}
        </div>
      </div>

      {/* SOAP Note */}
      {showSoap&&(
        <div style={{marginBottom:12,padding:"10px 12px",background:C.s2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>ROM SOAP — Objective Findings</div>
          <pre style={{fontSize:"0.72rem",color:C.text,whiteSpace:"pre-wrap",margin:0,lineHeight:1.6}}>{genROMSoap(data)}</pre>
        </div>
      )}

      {/* Overall Restriction Summary */}
      {allFindings.length>0&&(
        <div style={{marginBottom:12,padding:"9px 12px",background:C.s2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:"0.6rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>Restriction Summary</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {allFindings.map((f,i)=>(
              <span key={i} style={{fontSize:"0.65rem",padding:"2px 7px",borderRadius:5,background:`${f.grade.color}18`,color:f.grade.color,border:`1px solid ${f.grade.color}30`,fontWeight:600}}>
                {f.mv}{f.side?` (${f.side})`:""}: {f.val}{f.unit} [{f.grade.label}]
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Region Tabs */}
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
        {ROM_REGIONS.map(r=>btn(r,region===r,()=>{setRegion(r);setSelected(null);},C.a2))}
      </div>

      {/* Movement Cards */}
      <div style={{display:"grid",gap:8}}>
        {movements.map(m=>{
          const isOpen=selected===m.id;
          const sides=m.bilateral?["_L","_R"]:[""];
          const hasAnyVal=sides.some(s=>getVal(m.id,s));

          return(
            <div key={m.id} style={{background:C.surface,border:`1px solid ${hasAnyVal?C.accent+"30":C.border}`,borderRadius:10,overflow:"hidden"}}>
              {/* Card Header */}
              <div onClick={()=>setSelected(isOpen?null:m.id)} style={{padding:"10px 12px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:"0.82rem",color:hasAnyVal?C.text:C.muted}}>{m.mv}</div>
                    <div style={{fontSize:"0.6rem",color:C.muted,marginTop:1}}>{m.plane} · N={m.normal}{m.unit}</div>
                  </div>
                  {/* Bilateral inputs */}
                  <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                    {sides.map(s=>{
                      const val=getVal(m.id,s);
                      const grade=m.normal?RESTRICTION_GRADE(parseFloat(val),m.normal):null;
                      const bw=barW(val,m.normal);
                      return(
                        <div key={s} onClick={e=>e.stopPropagation()} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:52}}>
                          {m.bilateral&&<span style={{fontSize:"0.55rem",fontWeight:700,color:C.muted}}>{s.slice(1)}</span>}
                          <input
                            type="number" min="0" max={m.normal?m.normal*1.2:200}
                            value={val} placeholder="°"
                            onChange={e=>setVal(m.id,s,e.target.value)}
                            style={{width:52,padding:"3px 5px",borderRadius:6,border:`1px solid ${grade?grade.color:C.border}`,background:grade?`${grade.color}15`:C.s2,color:grade?grade.color:C.text,fontSize:"0.78rem",fontWeight:700,textAlign:"center"}}
                          />
                          {/* Bar indicator */}
                          {m.normal&&val&&(
                            <div style={{width:52,height:4,borderRadius:2,background:C.s3,overflow:"hidden"}}>
                              <div style={{width:`${bw}%`,height:"100%",background:grade?.color||C.green,borderRadius:2,transition:"width 0.3s"}}/>
                            </div>
                          )}
                          {grade&&<span style={{fontSize:"0.55rem",color:grade.color,fontWeight:700}}>{grade.label}</span>}
                        </div>
                      );
                    })}
                    <span style={{color:C.muted,fontSize:"0.7rem"}}>{isOpen?"▲":"▼"}</span>
                  </div>
                </div>

                {/* Pain arc toggle */}
                <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
                  {["No pain","Painful arc","End-range pain","Throughout"].map(p=>(
                    <button type="button" key={p}
                      onClick={()=>set(`${m.id}_pain`,data[`${m.id}_pain`]===p?"":p)}
                      style={{fontSize:"0.6rem",padding:"2px 6px",borderRadius:5,border:`1px solid ${data[`${m.id}_pain`]===p?"#ff4d6d40":C.border}`,background:data[`${m.id}_pain`]===p?"#ff4d6d15":"transparent",color:data[`${m.id}_pain`]===p?"#ff4d6d":C.muted,cursor:"pointer"}}>
                      {p}
                    </button>
                  ))}
                  {["Soft","Firm","Hard","Empty","Springy"].map(ef=>(
                    <button type="button" key={ef}
                      onClick={()=>set(`${m.id}_ef`,data[`${m.id}_ef`]===ef?"":ef)}
                      style={{fontSize:"0.6rem",padding:"2px 6px",borderRadius:5,border:`1px solid ${data[`${m.id}_ef`]===ef?C.accent+"60":C.border}`,background:data[`${m.id}_ef`]===ef?C.accent+"15":"transparent",color:data[`${m.id}_ef`]===ef?C.accent:C.muted,cursor:"pointer"}}>
                      {ef}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isOpen&&(
                <div style={{padding:"0 12px 12px",borderTop:`1px solid ${C.border}`}}>

                  {/* Goniometer */}
                  <div style={{marginTop:10,padding:"8px 10px",background:C.s2,borderRadius:8,marginBottom:8}}>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a2,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>📐 Goniometer Placement</div>
                    <div style={{fontSize:"0.73rem",color:C.text,lineHeight:1.5}}>{m.gonio}</div>
                    <div style={{fontSize:"0.65rem",color:C.muted,marginTop:4}}>Starting position: {m.start}</div>
                  </div>

                  {/* Muscles */}
                  <div style={{padding:"7px 10px",background:`${C.a3}0d`,border:`1px solid ${C.a3}20`,borderRadius:7,marginBottom:8}}>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a3,marginBottom:3}}>💪 MUSCLES</div>
                    <div style={{fontSize:"0.73rem",color:C.text}}>{m.muscles}</div>
                  </div>

                  {/* End Feel */}
                  <div style={{padding:"7px 10px",background:`${C.accent}0d`,border:`1px solid ${C.accent}20`,borderRadius:7,marginBottom:8}}>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:C.accent,marginBottom:3}}>🖐 END FEEL</div>
                    <div style={{fontSize:"0.73rem",color:C.text}}><strong>Normal:</strong> {m.endfeel.normal}</div>
                    <div style={{fontSize:"0.73rem",color:C.muted,marginTop:2}}><strong>Abnormal:</strong> {m.endfeel.abnormal}</div>
                  </div>

                  {/* Compensation + Capsular */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                    <div style={{padding:"7px 10px",background:"rgba(255,179,0,0.07)",border:"1px solid rgba(255,179,0,0.2)",borderRadius:7}}>
                      <div style={{fontSize:"0.6rem",fontWeight:700,color:C.yellow,marginBottom:3}}>⚠️ COMPENSATION</div>
                      <div style={{fontSize:"0.7rem",color:C.text}}>{m.compensation}</div>
                    </div>
                    <div style={{padding:"7px 10px",background:`${C.a4}0d`,border:`1px solid ${C.a4}20`,borderRadius:7}}>
                      <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a4,marginBottom:3}}>🔵 CAPSULAR PATTERN</div>
                      <div style={{fontSize:"0.7rem",color:C.text}}>{m.capsular}</div>
                    </div>
                  </div>

                  {/* Pathology + ADL */}
                  <div style={{padding:"7px 10px",background:C.s2,borderRadius:7,marginBottom:8}}>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>PATHOLOGY CORRELATION</div>
                    <div style={{fontSize:"0.73rem",color:C.text,lineHeight:1.5}}>{m.pathology}</div>
                    <div style={{marginTop:5,fontSize:"0.65rem",color:C.muted}}><strong>ADL Relevance:</strong> {m.adl}</div>
                  </div>

                  {/* Age considerations */}
                  {(m.pediatric||m.geriatric)&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                      {m.pediatric&&<div style={{padding:"7px 10px",background:C.s2,borderRadius:7}}>
                        <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a2,marginBottom:3}}>👶 PEDIATRIC</div>
                        <div style={{fontSize:"0.7rem",color:C.text}}>{m.pediatric}</div>
                      </div>}
                      {m.geriatric&&<div style={{padding:"7px 10px",background:C.s2,borderRadius:7}}>
                        <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a4,marginBottom:3}}>👴 GERIATRIC</div>
                        <div style={{fontSize:"0.7rem",color:C.text}}>{m.geriatric}</div>
                      </div>}
                    </div>
                  )}

                  {/* Red Flag */}
                  {m.redflag&&(
                    <div style={{padding:"7px 10px",background:"#ff4d6d10",border:"1px solid #ff4d6d30",borderRadius:7}}>
                      <div style={{fontSize:"0.6rem",fontWeight:700,color:"#ff4d6d",marginBottom:3}}>🚨 RED FLAGS</div>
                      <div style={{fontSize:"0.73rem",color:C.text}}>{m.redflag}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════

const MMT_GRADES=[
  {g:"5",label:"Normal",desc:"Full ROM against gravity + full resistance. No fatigue.",color:"#00c97a"},
  {g:"4+",label:"Good+",desc:"Full ROM against gravity + strong resistance, slight give at end.",color:"#43d68a"},
  {g:"4",label:"Good",desc:"Full ROM against gravity + moderate resistance.",color:"#7fe88a"},
  {g:"4-",label:"Good-",desc:"Full ROM against gravity + less than moderate resistance.",color:"#b5f0a0"},
  {g:"3+",label:"Fair+",desc:"Full ROM against gravity + minimal resistance.",color:"#ffb300"},
  {g:"3",label:"Fair",desc:"Full ROM against gravity, no added resistance.",color:"#ffc940"},
  {g:"3-",label:"Fair-",desc:"More than half ROM against gravity.",color:"#ffd97a"},
  {g:"2+",label:"Poor+",desc:"Initiates movement against gravity OR full ROM gravity eliminated.",color:"#ff8c42"},
  {g:"2",label:"Poor",desc:"Full ROM in gravity-eliminated position.",color:"#ff6b2b"},
  {g:"2-",label:"Poor-",desc:"More than half ROM gravity eliminated.",color:"#ff8c6b"},
  {g:"1",label:"Trace",desc:"Palpable/visible contraction, no movement.",color:"#ff4d6d"},
  {g:"0",label:"Zero",desc:"No contraction detected on palpation.",color:"#8b0000"},
];

const MMT_DATA={
  "Cervical":[
    {id:"mmt_scm",muscle:"Sternocleidomastoid",action:"Neck flexion + ipsilateral lateral flex + contralateral rotation",nerve:"CN XI + C2–C3",root:"C2–C3",origin:"Manubrium + medial clavicle",insertion:"Mastoid process + lateral occiput",
     patient:"Supine",therapist:"Hand on forehead; stabilise thorax",resistance:"Anterior forehead into extension",gravElim:"Side-lying, support head",palpation:"Anterior neck — prominent cord from clavicle to mastoid",
     compensation:"Trunk flexion, chin poke",substitution:"Anterior scalenes, platysma",
     functional:"Head control, swallowing, UCS pattern",chain:"Overactive SCM → inhibited DNF → forward head posture"},
    {id:"mmt_dnf",muscle:"Deep Neck Flexors (longus colli/capitis)",action:"Cervical flexion with chin tuck",nerve:"C1–C4 anterior rami",root:"C1–C4",origin:"Anterior vertebral bodies C1–T3",insertion:"Basilar occiput + anterior atlas",
     patient:"Supine",therapist:"Two fingers under chin; watch for chin poke",resistance:"Posterior occiput into extension — CCFT preferred (pressure biofeedback 22–30 mmHg)",gravElim:"N/A",palpation:"Deep to SCM — cannot directly palpate; use CCFT",
     compensation:"SCM dominant — chin protrudes instead of retracts",substitution:"SCM, scalenes",
     functional:"Cervicogenic headache, WAD, forward head correction",chain:"Weak DNF → SCM overactivity → suboccipital compression → headache"},
    {id:"mmt_trap_u",muscle:"Upper Trapezius",action:"Scapular elevation + cervical lat flex + extension",nerve:"CN XI + C3–C4",root:"C3–C4",origin:"Occiput + nuchal ligament + C7 SP",insertion:"Lateral clavicle + acromion",
     patient:"Seated",therapist:"Hand on top of shoulder",resistance:"Depress shoulder while patient shrugs",gravElim:"Supine — shoulder elevation against table",palpation:"Superior shoulder — thick band from neck to shoulder",
     compensation:"Lateral trunk lean",substitution:"Levator scapulae",
     functional:"UCS overactivation → inhibits lower trap — test bilaterally",chain:"Overactive UT + inhibited LT = classic UCS → impingement"},
    {id:"mmt_levsc",muscle:"Levator Scapulae",action:"Scapular elevation + cervical rotation/lateral flex",nerve:"C3–C4 + dorsal scapular (C5)",root:"C3–C5",origin:"C1–C4 transverse processes",insertion:"Superior angle scapula",
     patient:"Seated",therapist:"Resist shoulder elevation with neck rotated away",resistance:"Depress scapula",gravElim:"N/A",palpation:"Posterior neck between SCM and upper trap — taut band in tension",
     compensation:"Trunk lean",substitution:"Upper trap",
     functional:"Often overactive and shortened in desk workers; rarely truly weak",chain:"Tight levator → scapular downward rotation → impingement pattern"},
    {id:"mmt_scalenes",muscle:"Scalenes (Ant/Mid/Post)",action:"Cervical lateral flex + rib 1 elevation (inspiration)",nerve:"C3–C8 anterior rami",root:"C3–C8",origin:"C2–C7 transverse processes",insertion:"Rib 1 (ant/mid) + Rib 2 (post)",
     patient:"Supine",therapist:"Hand on temple, resist lateral flex",resistance:"Lateral cervical flex resistance",gravElim:"Supine supported",palpation:"Lateral neck between SCM and trapezius — palpate with caution (brachial plexus proximity)",
     compensation:"Trunk lean",substitution:"SCM",
     functional:"Thoracic outlet syndrome. TOS cluster: scalene tightness + first rib elevation + paresthesia",chain:"Tight scalenes → first rib elevation → TOS → ulnar symptoms"},
  ],
  "Shoulder & Scapula":[
    {id:"mmt_deltA",muscle:"Deltoid — Anterior",action:"Shoulder flexion 0–90°",nerve:"Axillary nerve",root:"C5–C6",origin:"Anterior lateral clavicle",insertion:"Deltoid tuberosity",
     patient:"Seated, arm at side",therapist:"Proximal forearm; stabilise shoulder",resistance:"Downward into extension at ~80° flex",gravElim:"Sidelying, support arm horizontal",palpation:"Anterior shoulder — bulk anterior to acromion",
     compensation:"Trunk extension, shoulder hike",substitution:"Biceps, pec major (clavicular head)",
     functional:"Reach forward, feeding, grooming",chain:"Weak ant delt → pec dominant → protracted shoulder → impingement"},
    {id:"mmt_deltM",muscle:"Deltoid — Middle",action:"Shoulder abduction 0–90°",nerve:"Axillary nerve",root:"C5–C6",origin:"Acromion",insertion:"Deltoid tuberosity",
     patient:"Seated",therapist:"Proximal forearm; scapula stabilised",resistance:"Downward into adduction at 90° abd",gravElim:"Supine, arm horizontal",palpation:"Lateral shoulder — most prominent deltoid mass",
     compensation:"Trunk lean, shoulder hike, scapular winging",substitution:"Supraspinatus initiates, upper trap hike",
     functional:"Reaching overhead, carrying",chain:"Weak mid delt + upper trap overactivity → impingement arc"},
    {id:"mmt_deltP",muscle:"Deltoid — Posterior",action:"Shoulder extension + ER + horizontal abduction",nerve:"Axillary nerve",root:"C5–C6",origin:"Scapular spine",insertion:"Deltoid tuberosity",
     patient:"Prone, arm over edge",therapist:"Distal humerus",resistance:"Downward into flexion",gravElim:"Sidelying",palpation:"Posterior lateral deltoid — posterior to acromion",
     compensation:"Trunk rotation, scapular retraction substitution",substitution:"Teres major, posterior RC",
     functional:"Posterior chain weakness → rounded shoulder pattern",chain:"Weak post delt → anterior dominance → thoracic kyphosis"},
    {id:"mmt_supra",muscle:"Supraspinatus",action:"Shoulder abduction initiation (0–15°) + GH compression",nerve:"Suprascapular nerve",root:"C5–C6",origin:"Supraspinous fossa",insertion:"Greater tuberosity (superior facet)",
     patient:"Seated, scapular plane (30° forward of frontal)",therapist:"Proximal forearm",resistance:"Downward at 90° in scapular plane",gravElim:"Supine",palpation:"Superior fossa above scapular spine — assess for atrophy",
     compensation:"Shoulder hike (upper trap), trunk lean",substitution:"Middle deltoid (loses initiation role)",
     functional:"Most commonly torn RC muscle. Test with empty-can and full-can",chain:"Supraspinatus tear → loss of superior cuff force couple → impingement"},
    {id:"mmt_infra",muscle:"Infraspinatus",action:"Shoulder ER",nerve:"Suprascapular nerve",root:"C5–C6",origin:"Infraspinous fossa",insertion:"Greater tuberosity (middle facet)",
     patient:"Prone, arm over edge, elbow 90°",therapist:"Distal forearm; stabilise elbow",resistance:"Into IR (downward) at neutral rotation",gravElim:"Supine, elbow at side",palpation:"Infraspinous fossa below scapular spine — assess for atrophy",
     compensation:"Trunk rotation, scapular retraction",substitution:"Teres minor, posterior deltoid",
     functional:"Key humeral head depressor. Weak infra → superior humeral migration → impingement",chain:"Infra + teres minor weakness → anterosuperior humeral migration"},
    {id:"mmt_subscap",muscle:"Subscapularis",action:"Shoulder IR",nerve:"Upper + lower subscapular nerves",root:"C5–C6",origin:"Subscapular fossa",insertion:"Lesser tuberosity",
     patient:"Prone, arm over edge, elbow 90°",therapist:"Distal forearm",resistance:"Into ER (upward)",gravElim:"Supine",palpation:"Axilla — difficult; use lift-off + belly press tests",
     compensation:"Trunk rotation, shoulder protraction",substitution:"Pec major, teres major, anterior delt",
     functional:"Primary IR and anterior stabiliser. Tear → ER lag + anterior instability",chain:"Weak subscap → anterior instability → recurrent dislocation risk"},
    {id:"mmt_tmin",muscle:"Teres Minor",action:"Shoulder ER + GH compression",nerve:"Axillary nerve",root:"C5–C6",origin:"Lateral border scapula (upper 2/3)",insertion:"Greater tuberosity (inferior facet)",
     patient:"Prone, arm over edge, elbow 90°",therapist:"Distal forearm",resistance:"Into IR",gravElim:"Supine",palpation:"Posterior axillary fold lateral to infraspinatus — below scapular spine",
     compensation:"Same as infraspinatus",substitution:"Infraspinatus",
     functional:"Hornblower's sign specific for teres minor. Isolated ER at 90° abd",chain:"Teres minor tear → ER lag at 90° abduction — Hornblower positive"},
    {id:"mmt_tmaj",muscle:"Teres Major",action:"Shoulder IR + extension + adduction",nerve:"Lower subscapular nerve",root:"C5–C6",origin:"Inferior angle scapula",insertion:"Medial lip bicipital groove",
     patient:"Prone, arm at side, shoulder slightly abducted",therapist:"Distal humerus",resistance:"Into ER and abduction",gravElim:"Sidelying",palpation:"Posterior axillary fold below teres minor — bulk inferior to infra",
     compensation:"Trunk rotation",substitution:"Latissimus dorsi, subscapularis",
     functional:"Often overactive — compensates for weak lat dorsi",chain:""},
    {id:"mmt_lat",muscle:"Latissimus Dorsi",action:"Shoulder IR + extension + adduction; depression of shoulder girdle",nerve:"Thoracodorsal nerve",root:"C6–C8",origin:"T7–L5 SPs + iliac crest + inferior angle scapula",insertion:"Floor bicipital groove",
     patient:"Prone, arm abducted 120°, IR (thumb down)",therapist:"Distal humerus",resistance:"Upward and outward (into abduction+ER)",gravElim:"Sidelying",palpation:"Posterior axillary fold and lateral thorax — large fan",
     compensation:"Trunk rotation, pelvis drop",substitution:"Teres major, posterior deltoid",
     functional:"Pull-down, rowing power. Weakness → poor shoulder depression, thoracic kyphosis driver",chain:"Weak lat → poor shoulder depression → rib flare → LBP in overhead athletes"},
    {id:"mmt_pec_maj_c",muscle:"Pectoralis Major — Clavicular",action:"Shoulder flexion + horizontal adduction",nerve:"Lateral pectoral nerve",root:"C5–C6",origin:"Medial clavicle",insertion:"Lateral lip bicipital groove",
     patient:"Supine, arm 90° flex",therapist:"Distal humerus",resistance:"Into extension + abduction",gravElim:"Seated, arm supported",palpation:"Superior pec — anterior axillary fold, near clavicle",
     compensation:"Trunk rotation, shoulder hike",substitution:"Anterior deltoid",
     functional:"Horizontal press, throwing. Often overactive → protracted shoulder",chain:""},
    {id:"mmt_pec_maj_s",muscle:"Pectoralis Major — Sternal",action:"Shoulder adduction + IR + extension from 90° flex",nerve:"Medial + lateral pectoral nerves",root:"C6–T1",origin:"Sternum + ribs 2–6",insertion:"Lateral lip bicipital groove",
     patient:"Supine, arm 60° abduction",therapist:"Distal humerus",resistance:"Into abduction",gravElim:"Seated, arm supported",palpation:"Anterior chest — sternal portion below clavicular head",
     compensation:"Trunk rotation",substitution:"Latissimus, teres major",
     functional:"Adduction and IR power. Often overactive in UCS",chain:"Overactive sternal pec → anterior humeral glide → impingement"},
    {id:"mmt_pec_min",muscle:"Pectoralis Minor",action:"Scapular protraction + anterior tilt + depression",nerve:"Medial pectoral nerve",root:"C8–T1",origin:"Ribs 3–5",insertion:"Coracoid process",
     patient:"Supine",therapist:"Test via forward shoulder position — passive stretch assessment preferred",resistance:"Coracoid press (manual)",gravElim:"N/A",palpation:"Below clavicle, under pec major — requires firm palpation through pec major",
     compensation:"N/A",substitution:"Serratus anterior (protraction)",
     functional:"Commonly short/tight → scapular anterior tilt → subacromial narrowing",chain:"Tight pec minor → scapular anterior tilt → impingement → RC tear risk"},
    {id:"mmt_serrant",muscle:"Serratus Anterior",action:"Scapular protraction + upward rotation; holds medial border to thorax",nerve:"Long thoracic nerve",root:"C5–C7",origin:"Ribs 1–8 lateral surface",insertion:"Medial border + inferior angle scapula (costal surface)",
     patient:"Standing or seated — wall push-up test",therapist:"Observe scapula during arm elevation + push-up plus",resistance:"Resist scapular protraction at elbow",gravElim:"Supine — protract scapula",palpation:"Lateral thorax below pec major — serrated fingers visible in lean athlete",
     compensation:"Scapular winging (medial border lifts), upper trap dominance",substitution:"Upper trapezius (incomplete substitute)",
     functional:"Long thoracic nerve palsy → classic winging. Critical for impingement prevention",chain:"Weak serratus → winging → reduced upward rotation → impingement"},
    {id:"mmt_trap_m",muscle:"Middle Trapezius",action:"Scapular retraction",nerve:"CN XI + C3–C4",root:"C3–C4",origin:"C7–T3 spinous processes",insertion:"Acromion + scapular spine (medial)",
     patient:"Prone, arm 90° abduction (T position)",therapist:"Distal humerus",resistance:"Into protraction (downward and forward)",gravElim:"Seated, arm supported",palpation:"Between scapulae at T1–T3 level",
     compensation:"Trunk rotation, scapular elevation",substitution:"Rhomboids (poor quality substitute — downward rotate)",
     functional:"Scapular retraction for rowing, posture. Often inhibited in rounded shoulder",chain:"Weak mid trap + overactive pec → protraction → impingement"},
    {id:"mmt_trap_l",muscle:"Lower Trapezius",action:"Scapular depression + upward rotation + retraction",nerve:"CN XI + C3–C4",root:"C3–C4",origin:"T4–T12 spinous processes",insertion:"Scapular spine (medial end)",
     patient:"Prone, arm 130–160° (Y position)",therapist:"Distal humerus",resistance:"Downward and lateral (into elevation + protraction)",gravElim:"Seated, arm at 130°",palpation:"Inferior to scapular spine converging toward T5–T8 midline",
     compensation:"Trunk extension, lat dominance",substitution:"Latissimus (pulls scapula down but internally rotates arm)",
     functional:"Most commonly inhibited in UCS. Essential for overhead stability",chain:"Weak lower trap → scapular upward rotation failure → impingement → RC tear"},
    {id:"mmt_rhomb",muscle:"Rhomboids (Maj + Min)",action:"Scapular retraction + downward rotation + elevation",nerve:"Dorsal scapular nerve",root:"C4–C5",origin:"C7–T5 spinous processes",insertion:"Medial scapular border",
     patient:"Prone, hand on opposite buttock (scapula winging)",therapist:"Resist scapular border lifting",resistance:"Into protraction",gravElim:"Seated, arm behind back",palpation:"Medial scapular border — deep to trapezius; difficult",
     compensation:"Trunk rotation",substitution:"Middle trap",
     functional:"Often overused as substitute for lower trap. Downward rotation is harmful pattern",chain:"Rhomboid dominance → scapular downward rotation → impingement"},
    {id:"mmt_corbrach",muscle:"Coracobrachialis",action:"Shoulder flexion + adduction",nerve:"Musculocutaneous nerve",root:"C5–C7",origin:"Coracoid process",insertion:"Medial humerus (mid-shaft)",
     patient:"Seated, arm 45° flexion + slight adduction",therapist:"Distal humerus",resistance:"Into extension + abduction",gravElim:"Sidelying",palpation:"Medial arm proximal — deep to biceps in axilla region",
     compensation:"Trunk flex, shoulder hike",substitution:"Anterior deltoid, pec major clavicular",
     functional:"Rarely isolated clinically; assessed with anterior shoulder complex",chain:""},
  ],
  "Elbow & Forearm":[
    {id:"mmt_bicep",muscle:"Biceps Brachii",action:"Elbow flexion + forearm supination",nerve:"Musculocutaneous nerve",root:"C5–C6",origin:"Coracoid (short) + supraglenoid tubercle (long)",insertion:"Radial tuberosity + bicipital aponeurosis",
     patient:"Seated, elbow 90°, forearm supinated",therapist:"Distal forearm",resistance:"Into extension",gravElim:"Supine, arm at side",palpation:"Anterior arm belly — most palpable with supinated elbow flex",
     compensation:"Trunk flexion, shoulder shrug",substitution:"Brachialis, brachioradialis (lose supination component)",
     functional:"Rupture — Popeye sign. SLAP associated. Test C5/C6 myotome",chain:"Biceps overactivity (tight) → inhibited triceps → elbow extension limitation"},
    {id:"mmt_brach",muscle:"Brachialis",action:"Elbow flexion (all positions)",nerve:"Musculocutaneous nerve (+ small radial nerve branch)",root:"C5–C6",origin:"Anterior humerus (distal half)",insertion:"Coronoid process + ulnar tuberosity",
     patient:"Seated, elbow 90°, forearm PRONATED (eliminates biceps supination advantage)",therapist:"Distal forearm",resistance:"Into extension",gravElim:"Supine, arm at side",palpation:"Lateral to biceps, distal arm — under biceps",
     compensation:"Trunk flex, shoulder flex",substitution:"Biceps (different forearm position distinguishes)",
     functional:"True elbow flexor. Test with pronated forearm to isolate from biceps",chain:""},
    {id:"mmt_brachio",muscle:"Brachioradialis",action:"Elbow flexion (midprone position most effective)",nerve:"Radial nerve",root:"C5–C6",origin:"Lateral supracondylar ridge",insertion:"Styloid process radius",
     patient:"Seated, forearm MIDPRONE (thumb up)",therapist:"Distal forearm",resistance:"Into extension",gravElim:"Supine",palpation:"Lateral forearm proximal — superficial cord when resisted in midprone",
     compensation:"Trunk flex",substitution:"Biceps, brachialis",
     functional:"Radial nerve test muscle (C5/C6). Preserved in posterior interosseous nerve injury",chain:""},
    {id:"mmt_tricep",muscle:"Triceps Brachii",action:"Elbow extension",nerve:"Radial nerve",root:"C6–C8 (primarily C7)",origin:"Infraglenoid tubercle (long) + posterior humerus (med/lat)",insertion:"Olecranon",
     patient:"Prone, arm over edge, elbow 90°",therapist:"Distal forearm",resistance:"Into flexion",gravElim:"Supine, arm supported in 90° shoulder flex",palpation:"Posterior arm — all three heads palpable; long head medial, lateral head lateral",
     compensation:"Shoulder extension, trunk extension",substitution:"Gravity (in supine positioning)",
     functional:"C7 myotome. Key test for C6/7 disc herniation. Radial nerve palsy = triceps weakness",chain:"Weak triceps → elbow extension deficit → overhead press limitation"},
    {id:"mmt_supinator",muscle:"Supinator",action:"Forearm supination (with elbow extended — eliminates biceps)",nerve:"Deep radial nerve (posterior interosseous)",root:"C6",origin:"Lateral epicondyle + supinator crest of ulna",insertion:"Anterior radius (proximal third)",
     patient:"Seated, elbow extended, forearm pronated",therapist:"Distal forearm",resistance:"Into pronation",gravElim:"Supported forearm",palpation:"Deep — cannot palpate directly; isolate by testing with elbow extended",
     compensation:"Shoulder ER, biceps activation (flex elbow to test supinator alone)",substitution:"Biceps (dominant supinator when elbow flexed)",
     functional:"Posterior interosseous nerve injury → supinator + wrist/finger extensor weakness",chain:""},
    {id:"mmt_pt",muscle:"Pronator Teres",action:"Forearm pronation + elbow flexion assist",nerve:"Median nerve",root:"C6–C7",origin:"Medial epicondyle + coronoid process",insertion:"Lateral radius (mid)",
     patient:"Seated, elbow 90°, forearm supinated",therapist:"Distal forearm",resistance:"Into supination",gravElim:"Supported",palpation:"Medial forearm proximal — oblique cord from medial epicondyle",
     compensation:"Shoulder IR",substitution:"Pronator quadratus",
     functional:"Pronator syndrome: compression of median nerve by PT — pain with resisted pronation + elbow flex",chain:""},
    {id:"mmt_pq",muscle:"Pronator Quadratus",action:"Forearm pronation (with elbow extended — isolates from PT)",nerve:"Anterior interosseous nerve (median)",root:"C8–T1",origin:"Distal anterior ulna",insertion:"Distal anterior radius",
     patient:"Seated, elbow extended, forearm supinated",therapist:"Distal forearm",resistance:"Into supination",gravElim:"Supported",palpation:"Distal anterior forearm — deep; cannot distinguish from PT by palpation",
     compensation:"Shoulder IR",substitution:"Pronator teres",
     functional:"AIN injury → loss of PQ + FPL + FDP index → weak pinch (OK sign)",chain:""},
  ],
  "Wrist & Hand":[
    {id:"mmt_ecrb",muscle:"ECRL + ECRB",action:"Wrist extension + radial deviation",nerve:"Radial nerve (ECRL) + deep radial/PIN (ECRB)",root:"C6–C7",origin:"Lateral supracondylar ridge",insertion:"2nd (ECRL) + 3rd (ECRB) metacarpal bases",
     patient:"Seated, forearm pronated, wrist neutral",therapist:"Dorsum of hand",resistance:"Into flexion + ulnar deviation",gravElim:"Forearm supported on table",palpation:"Dorsal forearm lateral — prominent with wrist ext + radial dev",
     compensation:"Finger extensors, trunk",substitution:"EDC (finger extensors extend wrist weakly)",
     functional:"C6 myotome. Radial nerve palsy = wrist drop. Tennis elbow: ECRB origin",chain:"ECRB weakness → compensatory wrist flex → CTS risk"},
    {id:"mmt_ecul",muscle:"Extensor Carpi Ulnaris",action:"Wrist extension + ulnar deviation",nerve:"Posterior interosseous nerve",root:"C7–C8",origin:"Lateral epicondyle + posterior ulna",insertion:"5th metacarpal base",
     patient:"Forearm pronated, wrist neutral",therapist:"Dorso-ulnar hand",resistance:"Into flexion + radial deviation",gravElim:"Forearm supported",palpation:"Dorso-ulnar forearm — distal to lateral epicondyle",
     compensation:"EDC",substitution:"ECU absent → ECR only → radial deviation during extension",
     functional:"DRUJ stabiliser. ECU instability → ulnar wrist pain in athletes",chain:""},
    {id:"mmt_fcr",muscle:"Flexor Carpi Radialis",action:"Wrist flexion + radial deviation",nerve:"Median nerve",root:"C6–C7",origin:"Medial epicondyle",insertion:"2nd metacarpal base",
     patient:"Forearm supinated, wrist neutral",therapist:"Palmar radial hand",resistance:"Into extension + ulnar deviation",gravElim:"Forearm supported",palpation:"Volar forearm radial — prominent tendon with resisted flex + radial dev",
     compensation:"FDP/FDS (finger flex weakly flex wrist)",substitution:"FCU",
     functional:"Median nerve injury → FCR weak → wrist deviates ulnar during flex",chain:""},
    {id:"mmt_fcu",muscle:"Flexor Carpi Ulnaris",action:"Wrist flexion + ulnar deviation",nerve:"Ulnar nerve",root:"C7–T1",origin:"Medial epicondyle + olecranon/ulnar border",insertion:"Pisiform → hook hamate → 5th metacarpal",
     patient:"Forearm supinated",therapist:"Palmar ulnar hand",resistance:"Into extension + radial deviation",gravElim:"Forearm supported",palpation:"Ulnar border volar forearm — tendon to pisiform",
     compensation:"FDP/FDS",substitution:"FCR",
     functional:"Cubital tunnel: ulnar nerve at elbow → FCU weak + intrinsic weak + ulnar claw",chain:""},
    {id:"mmt_fdp",muscle:"FDP (Flexor Digitorum Profundus)",action:"DIP flexion (all fingers)",nerve:"AIN of median (index/middle) + ulnar (ring/little)",root:"C7–C8",origin:"Anterior ulna + interosseous membrane",insertion:"Distal phalanx base (volar)",
     patient:"Stabilise middle phalanx; flex DIP",therapist:"Stabilise PIP in extension",resistance:"DIP extension",gravElim:"Hand flat on table",palpation:"Anterior forearm — deep layer",
     compensation:"FDS activation (flexes PIP not DIP)",substitution:"Intrinsics cannot flex DIP",
     functional:"AIN injury: FDP index + FDP middle + FPL weak → pinch deficit (OK sign). Profundus avulsion: jersey finger",chain:""},
    {id:"mmt_fds",muscle:"FDS (Flexor Digitorum Superficialis)",action:"PIP flexion",nerve:"Median nerve",root:"C7–T1",origin:"Medial epicondyle + radius",insertion:"Middle phalanx base (volar)",
     patient:"Hold all non-tested fingers in extension; active PIP flex on tested finger",therapist:"Stabilise adjacent fingers (blocks FDP)",resistance:"PIP extension",gravElim:"Hand resting",palpation:"Anterior forearm — mid layer; feel tendons at wrist",
     compensation:"FDP (if adjacent fingers not blocked)",substitution:"Cannot substitute in correct isolation",
     functional:"Median nerve injury proximal → FDS weak. Test each finger independently",chain:""},
    {id:"mmt_edc",muscle:"EDC (Extensor Digitorum Communis)",action:"MCP extension (finger extension)",nerve:"Posterior interosseous nerve",root:"C7–C8",origin:"Lateral epicondyle",insertion:"Extensor hood → middle + distal phalanges",
     patient:"Fist then extend MCPs",therapist:"Dorsal proximal phalanges",resistance:"Into MCP flexion",gravElim:"Hand resting",palpation:"Dorsal forearm — four tendons visible on dorsum hand",
     compensation:"Intrinsics (IP extension without MCP extension)",substitution:"EIP, EDM (partial)",
     functional:"Radial nerve palsy → wrist drop + finger drop. PIN injury → finger drop only (wrist ext preserved)",chain:""},
    {id:"mmt_lumb",muscle:"Lumbricals (1st–4th)",action:"MCP flexion + IP extension simultaneously",nerve:"Median (1st + 2nd) + Ulnar (3rd + 4th)",root:"C8–T1",origin:"FDP tendons",insertion:"Radial lateral band extensor hood",
     patient:"MCP 90° flex, IPs extended",therapist:"Resist MCP into extension + IP into flexion",resistance:"Disrupt intrinsic-plus position",gravElim:"Hand supported",palpation:"Lateral aspect finger — very small; impractical to palpate",
     compensation:"EDC (extends IPs but also extends MCPs)",substitution:"Interossei (similar action)",
     functional:"Key for intrinsic-plus position. Ulnar nerve injury → 4th+5th claw (ring/little finger claw deformity)",chain:"Intrinsic weakness → claw hand → grip deficit"},
    {id:"mmt_interos",muscle:"Palmar + Dorsal Interossei",action:"Finger adduction (palmar) + abduction (dorsal) + MCP flex + IP ext",nerve:"Ulnar nerve (deep branch)",root:"C8–T1",origin:"Metacarpal shafts",insertion:"Extensor hood + proximal phalanx bases",
     patient:"Fingers flat on table; abduct/adduct against resistance",therapist:"Resist individual finger adduction/abduction",resistance:"Into adduction (dorsal) or abduction (palmar)",gravElim:"Hand on table",palpation:"First dorsal interosseous — web space thumb/index; most accessible",
     compensation:"Flexor or extensor tendons impart some deviation",substitution:"N/A",
     functional:"Ulnar nerve injury → all interossei weak → Froment's sign + claw. Wartenberg's sign",chain:"Weak interossei → poor lateral pinch → grip compensation → flexor overuse → trigger finger"},
    {id:"mmt_apbrev",muscle:"Abductor Pollicis Brevis",action:"Thumb palmar abduction",nerve:"Median nerve (recurrent branch)",root:"C8–T1",origin:"Flexor retinaculum + scaphoid + trapezium",insertion:"Radial base proximal phalanx thumb",
     patient:"Hand supinated, thumb raised away from palm",therapist:"Resist thumb back toward palm",resistance:"Into adduction",gravElim:"Hand on table",palpation:"Thenar eminence — most superficial thenar muscle",
     compensation:"APL (abducts thumb in plane of palm — not palmar abduction)",substitution:"FPB (assists weakly)",
     functional:"CTS → APB weakness + thenar atrophy. Key median nerve test at wrist",chain:"Weak APB → poor opposition → thumb circumduction → grip pattern change"},
    {id:"mmt_adpoll",muscle:"Adductor Pollicis",action:"Thumb adduction",nerve:"Ulnar nerve (deep branch)",root:"C8–T1",origin:"3rd metacarpal + capitate + 2nd metacarpal (oblique head)",insertion:"Ulnar base proximal phalanx thumb",
     patient:"Thumb parallel to index, adduct toward index",therapist:"Resist thumb from adducting",resistance:"Abduction",gravElim:"Hand flat",palpation:"First web space — deep; palpate between thumb and index metacarpals",
     compensation:"FPL (flexes IP to maintain paper between fingers = Froment's sign)",substitution:"FPL substitution",
     functional:"Froment's sign: paper held between thumb/index — IP flex = FPL compensating for weak Add Poll (ulnar nerve)",chain:""},
    {id:"mmt_fpoll",muscle:"FPL (Flexor Pollicis Longus)",action:"Thumb IP flexion",nerve:"Anterior interosseous nerve (median)",root:"C7–C8",origin:"Anterior radius + interosseous membrane",insertion:"Distal phalanx thumb (volar)",
     patient:"Stabilise proximal phalanx; flex thumb DIP",therapist:"Stabilise thumb MCP in extension",resistance:"IP extension",gravElim:"Hand resting",palpation:"Anterior forearm radial — deep to FCR",
     compensation:"FPB (MCP flex only)",substitution:"None for IP flex",
     functional:"AIN injury: FPL + FDP (index/middle) + PQ → cannot make OK sign (circle sign test)",chain:""},
    {id:"mmt_epi",muscle:"Extensor Pollicis Longus + Brevis",action:"Thumb IP extension (EPL) + MCP extension (EPB)",nerve:"Posterior interosseous nerve",root:"C7–C8",origin:"Posterior ulna (EPL) + posterior radius (EPB)",insertion:"Distal phalanx (EPL) + proximal phalanx (EPB)",
     patient:"Forearm pronated, thumb extended",therapist:"Resist thumb into flexion at IP (EPL) or MCP (EPB)",resistance:"Into flexion",gravElim:"Forearm supported",palpation:"Anatomical snuffbox borders — EPL ulnar border; EPB radial border",
     compensation:"APL (abducts but cannot extend)",substitution:"N/A",
     functional:"EPL rupture: RA complication (attrition rupture at Lister's tubercle). Retroposition test = EPL integrity",chain:""},
  ],
  "Spine & Core":[
    {id:"mmt_rflex",muscle:"Rectus Abdominis",action:"Trunk flexion",nerve:"T5–T12 anterior rami",root:"T5–T12",origin:"Pubic crest + symphysis",insertion:"Xiphoid + costal cartilages 5–7",
     patient:"Supine, knees flexed",therapist:"Watch trunk curl",resistance:"Grade 5: arms crossed + curl off table; Grade 4: arms forward; Grade 3: arms at head; Grade 2: partial curl; Grade 1: palpate",gravElim:"N/A",palpation:"Anterior abdomen between linea alba",
     compensation:"Hip flexors pull pelvis — watch lumbar arch",substitution:"Hip flexors (flex trunk weakly via pelvis)",
     functional:"Diastasis recti: linea alba separation — palpate gap during crunch",chain:"Weak rectus → posterior pelvic tilt deficit → LBP pattern"},
    {id:"mmt_oblique",muscle:"External + Internal Obliques",action:"Trunk rotation + lateral flex",nerve:"T6–L1 anterior rami",root:"T6–L1",origin:"Ribs 5–12 (EO); iliac crest + inguinal lig (IO)",insertion:"Linea alba + iliac crest",
     patient:"Supine, knees flexed",therapist:"Resist rotation",resistance:"Oblique curl — elbow to opposite knee",gravElim:"Gravity eliminated rotation in sidelying",palpation:"Lateral abdominal wall — EO most superficial; IO under EO",
     compensation:"Trunk extension, hip flexors",substitution:"RA (flexion only)",
     functional:"Core rotation power. Weak obliques → poor rotational control → disc injury",chain:"Weak obliques + tight hip flexors → anterior pelvic tilt → LBP"},
    {id:"mmt_ta",muscle:"Transversus Abdominis",action:"Intra-abdominal pressure + lumbar corset",nerve:"T6–L1 anterior rami",root:"T6–L1",origin:"Lateral inguinal lig + iliac crest + thoracolumbar fascia + costal cartilages 7–12",insertion:"Linea alba + pubic crest via conjoint tendon",
     patient:"Crook-lying; draw-in manoeuvre",therapist:"Ultrasound preferred; or RTPU method — palpate just medial to ASIS",resistance:"Not a standard MMT — assess via draw-in / CCFT / ultrasound",gravElim:"N/A",palpation:"2cm medial + inferior to ASIS — feel firm contraction during draw-in without OI activation",
     compensation:"Breath holding, OI/EO dominant contraction",substitution:"External oblique (sucking in belly)",
     functional:"Inhibited in ALL chronic LBP. Must activate BEFORE limb movement (feed-forward). Assessed via CCFT and real-time US",chain:"Weak TA → loss of lumbar segmental control → disc, facet, SIJ injury"},
    {id:"mmt_multif",muscle:"Multifidus",action:"Lumbar segmental extension + rotation control",nerve:"Medial branch of posterior rami",root:"L1–S3",origin:"Posterior sacrum + mammillary processes L1–L5",insertion:"Spinous processes 2–4 levels above",
     patient:"Prone",therapist:"Palpate adjacent to spinous process; ask for isolated 'swelling' contraction",resistance:"Prone leg lift with multifidus palpation at target segment",gravElim:"N/A",palpation:"1–2cm lateral to spinous process — bimanual fingertip palpation; compare segmental bulk",
     compensation:"Global extensor contraction",substitution:"Erector spinae (extension without segmental control)",
     functional:"Atrophies unilaterally and rapidly after LBP onset. Assess by palpation bilaterally for symmetry. MRI gold standard",chain:"Multifidus atrophy → segmental instability → recurrent disc herniation"},
    {id:"mmt_es",muscle:"Erector Spinae",action:"Trunk extension + lateral flex",nerve:"Posterior rami L1–L5",root:"L1–L5",origin:"Sacrum + iliac crest + spinous processes",insertion:"Ribs + transverse processes + occipital",
     patient:"Prone, arms at side",therapist:"Posterior thorax",resistance:"Resist trunk extension lift off table",gravElim:"Sidelying",palpation:"Bilateral paravertebral columns lateral to spinous processes — very palpable",
     compensation:"Gluteus maximus assists",substitution:"Short intersegmental extensors",
     functional:"Often overactive (hypertonic) rather than truly weak. Assess length-tension",chain:"Overactive ES + weak glute max → hip ext substitution → LBP"},
    {id:"mmt_ql",muscle:"Quadratus Lumborum",action:"Lateral trunk flex + hip hike + respiratory rib 12 anchor",nerve:"T12–L3 anterior rami",root:"T12–L3",origin:"Posterior iliac crest + iliolumbar ligament",insertion:"12th rib + transverse processes L1–L4",
     patient:"Sidelying, hip hike against gravity",therapist:"Stabilise pelvis",resistance:"Hip drop (adduction with lateral trunk flex)",gravElim:"Supine — lateral pelvic tilt",palpation:"Lateral to erector spinae above iliac crest — posterior triangle; bimanual deep pressure",
     compensation:"Lat dorsi, obliques",substitution:"Hip abductors via pelvis",
     functional:"Often OVERACTIVE (tight) when glute med inhibited. QL spasm mimics LBP. Referred pain: buttock, lateral hip, lateral thigh",chain:"Tight QL → elevated iliac crest → scoliotic posture → SIJ strain → hip OA"},
    {id:"mmt_iliop",muscle:"Iliopsoas",action:"Hip flexion + lumbar lordosis",nerve:"Femoral nerve + direct L1–L3",root:"L1–L3",origin:"Iliac fossa (iliacus) + T12–L5 VBs + discs (psoas)",insertion:"Lesser trochanter",
     patient:"Seated at table edge — hip flexion against resistance",therapist:"Distal thigh",resistance:"Into extension",gravElim:"Supine, thigh slides on table",palpation:"Deep to abdominal wall below ASIS — difficult; assess functionally",
     compensation:"Trunk flexion, hip hiking, RA contraction",substitution:"TFL, rectus femoris, sartorius",
     functional:"Thomas test positive = tight. Hip flexion weakness (L2/L3). Psoas abscess mimics hip pathology. Snapping hip syndrome",chain:"Tight iliopsoas → anterior pelvic tilt → lumbar hyperlordosis → facet overload → LBP"},
  ],
  "Hip & Pelvis":[
    {id:"mmt_gmax",muscle:"Gluteus Maximus",action:"Hip extension + ER",nerve:"Inferior gluteal nerve",root:"L5–S2",origin:"Posterior ilium + sacrum + coccyx + sacrotuberous ligament",insertion:"Gluteal tuberosity + IT band",
     patient:"Prone, knee flexed 90° (shortens hamstrings)",therapist:"Posterior distal thigh",resistance:"Into flexion (downward toward table)",gravElim:"Sidelying",palpation:"Buttock mass — most powerful hip extensor; palpate with knee flexed",
     compensation:"Hamstrings, erector spinae, QL",substitution:"Hamstrings (extend hip but flex knee — different pattern)",
     functional:"Dead lift, stair ascent, running push-off. Weak Gmax → hamstring strain, LBP, SIJ instability",chain:"Weak glute max → hamstring compensation → proximal hamstring tendinopathy"},
    {id:"mmt_gmed",muscle:"Gluteus Medius",action:"Hip abduction + IR (anterior fibres) + ER (posterior fibres)",nerve:"Superior gluteal nerve",root:"L4–S1",origin:"Outer ilium (between anterior and posterior gluteal lines)",insertion:"Greater trochanter (lateral + superoposterior)",
     patient:"Sidelying, test leg on top, hip neutral",therapist:"Distal thigh",resistance:"Into adduction",gravElim:"Supine, abduct along table",palpation:"Lateral hip between ASIS and greater trochanter — wide fan",
     compensation:"Hip flexion (TFL substitute), trunk lateral lean, pelvis elevation",substitution:"TFL (flex + IR component), piriformis (ER component)",
     functional:"Trendelenburg sign. Key Gmax for running, stairs. Weak Gmed → lateral knee pain, IT band, patellofemoral pain",chain:"Weak Gmed → Trendelenburg → contralateral hip drop → IT band tension → lateral knee pain"},
    {id:"mmt_gmin",muscle:"Gluteus Minimus",action:"Hip abduction + IR",nerve:"Superior gluteal nerve",root:"L4–S1",origin:"Outer ilium (between anterior and inferior gluteal lines)",insertion:"Greater trochanter (anterior)",
     patient:"Sidelying — same as Gmed test",therapist:"Distal thigh",resistance:"Into adduction",gravElim:"Supine",palpation:"Anterior to Gmed — cannot differentiate clinically from Gmed",
     compensation:"TFL, hip flexion",substitution:"TFL",
     functional:"Clinically grouped with Gmed. Tear: trochanteric bursitis-like presentation",chain:""},
    {id:"mmt_tfl",muscle:"Tensor Fasciae Latae",action:"Hip flexion + abduction + IR; IT band tension",nerve:"Superior gluteal nerve",root:"L4–S1",origin:"ASIS + anterior iliac crest",insertion:"IT band → Gerdy's tubercle",
     patient:"Supine, hip flexed 30° + slight abd + IR",therapist:"Distal thigh",resistance:"Into extension + adduction + ER",gravElim:"Sidelying",palpation:"Lateral to ASIS — anterior lateral thigh proximal",
     compensation:"Rectus femoris, hip flexors",substitution:"Gmed anterior fibres",
     functional:"Often overactive compensating for weak Gmed. IT band tightness. Ober test",chain:"Tight TFL → IT band tension → lateral knee pain → patella maltracking → PFPS"},
    {id:"mmt_adduc",muscle:"Hip Adductors (Longus/Brevis/Magnus/Gracilis/Pectineus)",action:"Hip adduction",nerve:"Obturator nerve (+ femoral for pectineus)",root:"L2–L4",origin:"Pubic rami + ischial tuberosity (magnus)",insertion:"Linea aspera + adductor tubercle (magnus) + medial tibia (gracilis)",
     patient:"Sidelying, test leg on bottom; top leg supported",therapist:"Medial distal thigh",resistance:"Into abduction",gravElim:"Supine — squeeze legs against resistance",palpation:"Medial thigh — longus most anterior; palpate proximal medial thigh",
     compensation:"Hip flexion, trunk lean",substitution:"Gracilis (also flexes knee)",
     functional:"Groin strain = adductor longus usually. Adductor squeeze test <1.0kg = groin strain risk. Sports hernia cluster",chain:"Weak adductors → poor medial knee control → valgus → ACL risk"},
    {id:"mmt_hamstr",muscle:"Hamstrings (Biceps Femoris + Semitendinosus + Semimembranosus)",action:"Knee flexion + hip extension",nerve:"Sciatic nerve (tibial division for semi; common peroneal for BF short head)",root:"L5–S2",origin:"Ischial tuberosity (long) + linea aspera BF (short)",insertion:"Fibula head (BF) + medial tibia (semi)",
     patient:"Prone, knee 90°",therapist:"Distal lower leg",resistance:"Into knee extension",gravElim:"Sidelying",palpation:"Posterior thigh — BF lateral, semiT + semiM medial; palpate at 90° flex",
     compensation:"Hip ER/IR for BF vs semi isolation",substitution:"Gastrocnemius (knee flex at end range)",
     functional:"L5/S1 myotome. Proximal hamstring tendinopathy: ischial tuberosity pain. Strain: musculotendinous junction",chain:"Weak hamstrings → knee hyperextension tendency → PCL stress + quad dominant pattern"},
    {id:"mmt_pirif",muscle:"Piriformis",action:"Hip ER (neutral) + abduction (90° flex)",nerve:"Nerve to piriformis (S1–S2)",root:"S1–S2",origin:"Anterior sacrum (S2–S4)",insertion:"Greater trochanter (superior)",
     patient:"Prone, knee 90°, ER foot toward ceiling (hip ER test)",therapist:"Medial lower leg",resistance:"Into IR (push foot outward = IR = resist ER)",gravElim:"Supine",palpation:"Deep gluteal — midpoint between PSIS and greater trochanter; difficult",
     compensation:"Gluteus maximus",substitution:"Obturators, gemelli",
     functional:"Piriformis syndrome: sciatic nerve compression. FAIR test. Often overactive when Gmed/Gmax inhibited",chain:"Tight piriformis → sciatic compression → pseudo-sciatica → missed disc diagnosis"},
    {id:"mmt_rectfem",muscle:"Rectus Femoris",action:"Knee extension + hip flexion",nerve:"Femoral nerve",root:"L2–L4",origin:"AIIS + acetabular ridge",insertion:"Quadriceps tendon → patella → patellar tendon → tibial tuberosity",
     patient:"Supine, assess knee extension from 90°",therapist:"Distal lower leg",resistance:"Into knee flex",gravElim:"Sidelying",palpation:"Anterior thigh central — straight line from AIIS to patella",
     compensation:"Hip flexion substitution (if tested separately)",substitution:"Vasti (for knee ext); iliopsoas (for hip flex)",
     functional:"Two-joint muscle. Prone knee bend test for tightness. Ely's test. AIIS avulsion in adolescents",chain:"Tight rectus femoris → anterior pelvic tilt → LBP + patellofemoral pain"},
  ],
  "Knee":[
    {id:"mmt_quad",muscle:"Quadriceps (Vastus Medialis/Lateralis/Intermedius)",action:"Knee extension",nerve:"Femoral nerve",root:"L2–L4",origin:"Anterior femur",insertion:"Tibial tuberosity via patellar tendon",
     patient:"Seated, lower leg hanging",therapist:"Anterior distal lower leg",resistance:"Into knee flexion",gravElim:"Sidelying",palpation:"VMO: medial patella — last 10–15° extension. VL: lateral thigh. VI: deep central",
     compensation:"Trunk extension, hip hike",substitution:"None effective",
     functional:"VMO:VL ratio key for patellar tracking. Atrophy post ACL/knee injury. L3/L4 myotome",chain:"Weak VMO → lateral patella tilt → PFPS → chondromalacia"},
    {id:"mmt_gastroc",muscle:"Gastrocnemius",action:"Ankle PF + knee flexion",nerve:"Tibial nerve",root:"S1–S2",origin:"Medial + lateral femoral condyles",insertion:"Calcaneus via Achilles tendon",
     patient:"Prone, knee extended (to test gastroc vs soleus)",therapist:"Plantar foot",resistance:"Into dorsiflexion",gravElim:"Sidelying",palpation:"Posterior calf — most superficial; medial head larger; palpate belly",
     compensation:"Tibialis posterior, peroneals",substitution:"Soleus (if knee flexed — gastroc slack)",
     functional:"Single-leg heel raise × 25 reps = normal. S1 myotome. Achilles rupture (Thompson test). DVT risk: calf pain",chain:"Weak gastroc + soleus → reduced push-off → gait compensation → Achilles tendinopathy"},
    {id:"mmt_poplit",muscle:"Popliteus",action:"Knee IR (tibia on femur) + unlock knee from extension",nerve:"Tibial nerve",root:"L4–S1",origin:"Lateral femoral condyle + arcuate ligament",insertion:"Posterior proximal tibia",
     patient:"Prone, knee 90°, tibial IR",therapist:"Distal lower leg medial border",resistance:"Into tibial ER",gravElim:"Sidelying",palpation:"Posterior knee — deep to heads of gastroc; palpate in popliteal fossa",
     compensation:"Hamstrings",substitution:"Semitendinosus/semimembranosus",
     functional:"First muscle to fire in knee flexion from full extension. Popliteus strain: acute posterolateral knee pain",chain:"Weak popliteus → failed screw-home unlock → knee buckling in early stance"},
  ],
  "Ankle & Foot":[
    {id:"mmt_ta",muscle:"Tibialis Anterior",action:"Ankle dorsiflexion + inversion",nerve:"Deep peroneal nerve",root:"L4–L5",origin:"Lateral tibial condyle + proximal 2/3 anterior tibia",insertion:"Medial cuneiform + 1st metatarsal base",
     patient:"Seated or supine",therapist:"Dorsomedial foot",resistance:"Into plantarflexion + eversion",gravElim:"Sidelying",palpation:"Anterior shin — most prominent tendon medial to tibial crest",
     compensation:"Long toe extensors",substitution:"EHL, EDL (partial DF with eversion)",
     functional:"L4 myotome. Foot drop = L4/L5 or common peroneal nerve. Anterior compartment syndrome risk with exercise",chain:"Weak TA → foot drop → steppage gait → hip flexor overuse → hip flexor strain"},
    {id:"mmt_soleus",muscle:"Soleus",action:"Ankle plantarflexion (dominant with knee flexed)",nerve:"Tibial nerve",root:"S1–S2",origin:"Posterior fibula + soleal line tibia",insertion:"Calcaneus via Achilles tendon",
     patient:"Prone, KNEE FLEXED 90° (slackens gastroc — isolates soleus)",therapist:"Plantar foot",resistance:"Into dorsiflexion",gravElim:"Sidelying",palpation:"Posterior calf deep to gastroc — bulges lateral to gastroc at ankle",
     compensation:"Hip extension assist",substitution:"Gastroc (only if knee extends)",
     functional:"Single-leg heel raise with knee bent. Soleus dominant in quiet standing and low-speed walking. Key for Achilles loading",chain:"Weak soleus → eccentric Achilles overload → mid-portion Achilles tendinopathy"},
    {id:"mmt_tp",muscle:"Tibialis Posterior",action:"Ankle PF + inversion + arch support",nerve:"Tibial nerve",root:"L4–L5",origin:"Posterior interosseous membrane + tibia + fibula",insertion:"Navicular + cuneiforms + metatarsals 2–4",
     patient:"Seated, ankle plantarflexed + inverted",therapist:"Medial plantar foot",resistance:"Into DF + eversion",gravElim:"Supine",palpation:"Medial ankle behind medial malleolus — posterior to medial malleolus tendon",
     compensation:"Gastroc/soleus PF",substitution:"FHL, FDL",
     functional:"TP insufficiency → progressive flatfoot. Navicular drop test. Single-leg heel raise with TP dysfunction: too many toes sign",chain:"Weak TP → medial arch collapse → subtalar pronation → knee valgus → patellofemoral pain → hip IR"},
    {id:"mmt_peronls",muscle:"Peroneals (Longus + Brevis)",action:"Ankle eversion + PF assist; 1st ray plantarflexion (longus)",nerve:"Superficial peroneal nerve",root:"L5–S1",origin:"Fibula shaft (lateral)",insertion:"1st metatarsal/medial cuneiform (longus) + 5th metatarsal base (brevis)",
     patient:"Sidelying, foot everted + plantarflexed",therapist:"Lateral plantar foot",resistance:"Into inversion + DF",gravElim:"Supine",palpation:"Lateral lower leg — posterior to fibula; tendons behind lateral malleolus",
     compensation:"EDL (eversion + DF)",substitution:"EDL",
     functional:"Lateral ankle sprain → peroneal injury + weakness → recurrent sprain. Peroneal tendon subluxation. Superficial peroneal nerve injury → weak eversion",chain:"Weak peroneals → inversion instability → recurrent lateral ankle sprain → OA"},
    {id:"mmt_ehl",muscle:"Extensor Hallucis Longus",action:"Great toe extension + ankle DF assist",nerve:"Deep peroneal nerve",root:"L5",origin:"Mid-anterior fibula + interosseous membrane",insertion:"Distal phalanx great toe",
     patient:"Supine, foot relaxed",therapist:"Dorsum distal phalanx great toe",resistance:"Into great toe flexion",gravElim:"N/A",palpation:"Anterior lower leg medial to EDL — tendon visible on dorsum foot to great toe",
     compensation:"Tibialis anterior (DF without toe ext)",substitution:"EDL (partial toe extension)",
     functional:"L5 myotome. EHL weakness: L4/L5 disc herniation hallmark sign. Foot drop assessment",chain:""},
    {id:"mmt_edl",muscle:"Extensor Digitorum Longus + Peroneus Tertius",action:"Toe extension + DF + eversion",nerve:"Deep peroneal nerve",root:"L5–S1",origin:"Lateral condyle tibia + anterior fibula",insertion:"Middle + distal phalanges toes 2–5; 5th metatarsal base (PT)",
     patient:"Supine, foot relaxed",therapist:"Dorsum of toes",resistance:"Into toe flexion",gravElim:"N/A",palpation:"Lateral to TA tendon on dorsum — four tendons visible",
     compensation:"EHL",substitution:"None effective",
     functional:"Foot drop: TA + EHL + EDL all weak (L4/L5 + CPN). Anterior compartment",chain:""},
    {id:"mmt_fdl",muscle:"FDL + FHL (toe flexors)",action:"Toe IP flexion (FDL) + great toe IP flex (FHL)",nerve:"Tibial nerve",root:"S2–S3",origin:"Posterior tibia (FDL) + posterior fibula (FHL)",insertion:"Distal phalanges toes",
     patient:"Supine, flex toes against resistance",therapist:"Plantar surface distal phalanges",resistance:"Into toe extension",gravElim:"Foot resting",palpation:"FHL: medial ankle behind posterior tibialis — behind medial malleolus",
     compensation:"Intrinsic foot muscles",substitution:"Plantar intrinsics (MTP flexion only)",
     functional:"Hallux IP flex = FHL. FHL tenosynovitis in dancers: posterior ankle pain. Trigger toe",chain:""},
    {id:"mmt_abdhal",muscle:"Abductor Hallucis",action:"Great toe abduction + MTP flex",nerve:"Medial plantar nerve",root:"S2–S3",origin:"Calcaneal tuberosity",insertion:"Medial base proximal phalanx great toe",
     patient:"Supine, abduct great toe from 2nd",therapist:"Medial distal great toe",resistance:"Into adduction",gravElim:"Foot resting",palpation:"Medial foot between medial malleolus and 1st metatarsal head — medial arch",
     compensation:"FHL",substitution:"None",
     functional:"Hallux valgus: AbdHal weak and malpositioned. Plantar fasciitis: weak intrinsics. Key foot stability muscle",chain:"Weak AbdHal → loss of medial arch control → plantar fascia overload → plantar fasciitis"},
  ],
  "TMJ & Facial":[
    {id:"mmt_masseter",muscle:"Masseter",action:"Jaw closure (elevation)",nerve:"CN V3 (trigeminal — mandibular)",root:"CN V3",origin:"Zygomatic arch",insertion:"Ramus + angle of mandible",
     patient:"Seated, slightly open mouth",therapist:"Chin — resist closure",resistance:"Into jaw opening",gravElim:"N/A",palpation:"Angle of jaw — prominent with clenching",
     compensation:"Temporalis",substitution:"Temporalis, medial pterygoid",
     functional:"TMJ pain: assess for asymmetric hypertrophy, bruxism, trismus. Normal opening 40–50mm",chain:"Masseter hypertonicity → TMJ compression → disc displacement → headache"},
    {id:"mmt_temporalis",muscle:"Temporalis",action:"Jaw elevation + retraction",nerve:"CN V3",root:"CN V3",origin:"Temporal fossa",insertion:"Coronoid process",
     patient:"Seated",therapist:"Chin",resistance:"Into depression",gravElim:"N/A",palpation:"Temple — palpate during clenching",
     compensation:"Masseter",substitution:"Masseter",
     functional:"Temporal headache from TMJ. Temporalis tenderness = bruxism / TMD",chain:""},
    {id:"mmt_lat_pter",muscle:"Lateral Pterygoid",action:"Jaw opening + protrusion + contralateral deviation",nerve:"CN V3",root:"CN V3",origin:"Lateral pterygoid plate + greater wing sphenoid",insertion:"Condylar neck + articular disc",
     patient:"Resist jaw protrusion",therapist:"Chin anterior surface",resistance:"Into retrusion",gravElim:"N/A",palpation:"Intraoral posterior to upper molars — technically demanding",
     compensation:"Digastric",substitution:"N/A",
     functional:"Hyperactive lat pterygoid → TMJ clicking (disc pulled anteriorly). Key in TMD",chain:"Hyperactive lat pterygoid → anterior disc displacement → clicking → closed lock"},
  ],
  "Respiratory":[
    {id:"mmt_diaphragm",muscle:"Diaphragm",action:"Primary inspiration",nerve:"Phrenic nerve (C3–C5)",root:"C3–C5",origin:"Xiphoid + costal cartilages 6–12 + lumbar vertebrae",insertion:"Central tendon",
     patient:"Supine, observe abdominal expansion on inspiration",therapist:"Hands on lower chest + abdomen",resistance:"Assess paradoxical breathing or reduced excursion",gravElim:"N/A",palpation:"Subcostal — palpate diaphragm excursion; ultrasound preferred",
     compensation:"Accessory muscles (SCM, scalenes, pec minor)",substitution:"Intercostals + accessory muscles",
     functional:"C3/C4 SCI → diaphragm paralysis → ventilator dependence. Hiccups = phrenic irritation. Hook-lying: observe abdominal rise before chest",chain:"Weak diaphragm → accessory muscle over-use → rib 1 elevation → TOS → cervicogenic symptoms"},
    {id:"mmt_intercost",muscle:"Intercostals (External + Internal)",action:"Rib elevation (external) + depression (internal)",nerve:"Intercostal nerves T1–T11",root:"T1–T11",origin:"Rib below (external) + rib above (internal)",insertion:"Rib above (external) + rib below (internal)",
     patient:"Observe chest expansion — measure at axilla with tape",therapist:"Assess symmetry of chest expansion (normal: 3–5cm)",resistance:"N/A",gravElim:"N/A",palpation:"Between ribs — palpate movement during breathing",
     compensation:"Accessory muscles",substitution:"N/A",
     functional:"<2.5cm chest expansion = restrictive (ankylosing spondylitis). Assess with tape measure at T4",chain:"Intercostal restriction → reduced vital capacity → O2 desaturation on exertion"},
  ],
};

const MMT_GRADE_OPTIONS=["5","4+","4","4-","3+","3","3-","2+","2","2-","1","0","NT"];
const MMT_REGIONS=Object.keys(MMT_DATA);

const RED_FLAGS_MMT=[
  {pattern:(r)=>Object.values(r).some(v=>v&&["1","0"].includes(v.split("_")[0])),msg:"Grade 0–1 detected — consider neurological workup and urgent referral if acute onset.",color:"#ff4d6d"},
  {pattern:(r)=>["mmt_gmed_L","mmt_gmed_R"].every(k=>r[k]&&parseInt(r[k])<3),msg:"Bilateral Gmed ≤ 2 — significant fall risk. Neurological vs myopathic cause?",color:"#ff4d6d"},
  {pattern:(r)=>["mmt_dnf_L","mmt_dnf_R","mmt_scm_L","mmt_scm_R"].some(k=>r[k]&&parseInt(r[k])===0),msg:"Cervical muscle grade 0 — possible high cervical cord lesion. URGENT.",color:"#ff4d6d"},
];

const KINETIC_CHAINS=[
  {muscles:["mmt_dnf","mmt_ta","mmt_gmax","mmt_gmed"],label:"Posterior Oblique Sling",interpretation:"Weakness pattern: forward head + anterior pelvic tilt + Trendelenburg gait."},
  {muscles:["mmt_serrant","mmt_trap_l","mmt_gmed","mmt_tp"],label:"Upper + Lower Cross Stabilisers",interpretation:"Weakness: scapular winging + medial arch collapse. Classic UCS+LCS pattern."},
  {muscles:["mmt_quad","mmt_ta","mmt_gmax"],label:"Anterior-Posterior Force Couple",interpretation:"Weakness: knee hyperextension + anterior pelvic tilt + lumbar hyperlordosis."},
  {muscles:["mmt_peronls","mmt_tp","mmt_abdhal"],label:"Ankle Stability Complex",interpretation:"Weakness: recurrent lateral sprain + progressive flatfoot + plantar fasciitis."},
];

function MMTModule({data,set}){
  const [region,setRegion]=useState(MMT_REGIONS[0]);
  const [selected,setSelected]=useState(null);
  const [showInterp,setShowInterp]=useState(false);

  const muscles=MMT_DATA[region]||[];
  const gradeColor=(g)=>MMT_GRADES.find(x=>x.g===g)?.color||C.muted;
  const gradeLabel=(g)=>MMT_GRADES.find(x=>x.g===g)?.label||"";

  const allGrades={};
  Object.values(MMT_DATA).flat().forEach(m=>{
    ["L","R"].forEach(side=>{
      const k=`mmt_${m.id}_${side}`;
      if(data[k]) allGrades[k]=data[k];
    });
  });

  const redFlags=RED_FLAGS_MMT.filter(rf=>rf.pattern(allGrades));

  const chainFindings=KINETIC_CHAINS.map(ch=>{
    const weak=ch.muscles.filter(mid=>["L","R"].some(s=>{
      const v=data[`mmt_${mid}_${s}`]||data[`${mid}_${s}`];
      return v && parseFloat(v)<4;
    }));
    return {...ch,weak};
  }).filter(ch=>ch.weak.length>=2);

  const myotomeAnalysis=(()=>{
    const map={
      "C5":["mmt_deltM","mmt_bicep"],"C6":["mmt_bicep","mmt_brachio","mmt_ecrb"],
      "C7":["mmt_tricep","mmt_ecul","mmt_fcr"],"C8":["mmt_fdp","mmt_fcu","mmt_edc"],
      "T1":["mmt_interos","mmt_apbrev"],"L2":["mmt_iliop","mmt_adduc"],
      "L3":["mmt_rectfem","mmt_quad"],"L4":["mmt_quad","mmt_ta","mmt_tp"],
      "L5":["mmt_ta","mmt_ehl","mmt_peronls"],"S1":["mmt_gastroc","mmt_soleus","mmt_hamstr"],
      "S2":["mmt_hamstr","mmt_fdl"]
    };
    return Object.entries(map).map(([level,mids])=>{
      const affected=mids.filter(mid=>{
        const vals=["L","R"].map(s=>data[`mmt_${mid}_${s}`]||data[`${mid}_${s}`]).filter(Boolean);
        return vals.some(v=>parseFloat(v)<4);
      });
      return {level,affected,total:mids.length};
    }).filter(x=>x.affected.length>0);
  })();

  const rehabSuggestions=(m)=>{
    const grade=data[`mmt_${m.id}_L`]||data[`mmt_${m.id}_R`];
    if(!grade) return null;
    const g=parseFloat(grade);
    if(g<=1) return"Grade 0–1: NMES/FES + passive ROM + facilitation (tapping, vibration, ice). Neurological consult.";
    if(g<=2) return"Grade 1–2: Gravity-eliminated active-assisted exercise. Pool therapy. Motor control re-education.";
    if(g<=3) return"Grade 2–3: Against-gravity exercise without resistance. Functional tasks. Daily living activities.";
    if(g<4) return"Grade 3–4: Progressive resistance training. Closed-chain loading. Sport/task-specific exercise.";
    if(g<5) return"Grade 4: Strengthening under load. Eccentric training. Plyometrics if appropriate.";
    return"Grade 5: Maintenance, sport-specific conditioning. Injury prevention.";
  };

  const btn=(label,active,onClick,col)=>(
    <button type="button" onClick={onClick} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${active?(col||C.accent):C.border}`,background:active?`${col||C.accent}18`:"transparent",color:active?(col||C.accent):C.muted,fontSize:"0.68rem",fontWeight:active?700:400,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>
      {label}
    </button>
  );

  return(
    <div>
      {/* Red Flags */}
      {redFlags.length>0&&(
        <div style={{marginBottom:12}}>
          {redFlags.map((rf,i)=>(
            <div key={i} style={{padding:"8px 12px",background:`${rf.color}12`,border:`1px solid ${rf.color}40`,borderRadius:8,marginBottom:6,fontSize:"0.74rem",color:rf.color,fontWeight:600}}>
              🔴 {rf.msg}
            </div>
          ))}
        </div>
      )}

      {/* MMT Grade Legend */}
      <div style={{marginBottom:12,padding:"8px 10px",background:C.s2,borderRadius:8,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>MMT Scale</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {MMT_GRADES.map(g=>(
            <span key={g.g} style={{fontSize:"0.62rem",padding:"2px 6px",borderRadius:5,background:`${g.color}20`,color:g.color,fontWeight:700,border:`1px solid ${g.color}30`}} title={g.desc}>
              {g.g} {g.label}
            </span>
          ))}
        </div>
      </div>

      {/* Region Tabs */}
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
        {MMT_REGIONS.map(r=>btn(r,region===r,()=>{setRegion(r);setSelected(null)},C.a2))}
      </div>

      {/* Muscle Cards */}
      <div style={{display:"grid",gap:8}}>
        {muscles.map(m=>{
          const isOpen=selected===m.id;
          const lv=data[`mmt_${m.id}_L`];
          const rv=data[`mmt_${m.id}_R`];
          const hasVal=lv||rv;
          const rehab=rehabSuggestions(m);
          return(
            <div key={m.id} style={{background:C.surface,border:`1px solid ${hasVal?C.accent+"30":C.border}`,borderRadius:10,overflow:"hidden"}}>
              {/* Header */}
              <div onClick={()=>setSelected(isOpen?null:m.id)} style={{padding:"10px 12px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"0.82rem",color:hasVal?C.text:C.muted}}>{m.muscle}</div>
                  <div style={{fontSize:"0.65rem",color:C.muted,marginTop:1}}>{m.nerve} · {m.root}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {/* Bilateral Grading */}
                  {["L","R"].map(side=>{
                    const val=data[`mmt_${m.id}_${side}`];
                    return(
                      <div key={side} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                        <span style={{fontSize:"0.55rem",color:C.muted,fontWeight:600}}>{side}</span>
                        <select
                          value={val||""}
                          onChange={e=>{e.stopPropagation();set(`mmt_${m.id}_${side}`,e.target.value);}}
                          onClick={e=>e.stopPropagation()}
                          style={{fontSize:"0.68rem",padding:"2px 4px",borderRadius:5,border:`1px solid ${val?gradeColor(val):C.border}`,background:val?`${gradeColor(val)}18`:C.s2,color:val?gradeColor(val):C.muted,fontWeight:700,cursor:"pointer",width:46}}
                        >
                          <option value="">--</option>
                          {MMT_GRADE_OPTIONS.map(g=><option key={g} value={g}>{g}</option>)}
                        </select>
                        {val&&<span style={{fontSize:"0.55rem",color:gradeColor(val),fontWeight:600}}>{gradeLabel(val)}</span>}
                      </div>
                    );
                  })}
                  <span style={{color:C.muted,fontSize:"0.7rem",marginLeft:4}}>{isOpen?"▲":"▼"}</span>
                </div>
              </div>

              {/* Expanded Detail */}
              {isOpen&&(
                <div style={{padding:"0 12px 12px 12px",borderTop:`1px solid ${C.border}`}}>
                  {/* Anatomy */}
                  <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                    {[["Action",m.action],["Nerve",m.nerve],["Root",m.root],["Origin",m.origin],["Insertion",m.insertion]].map(([lbl,val])=>(
                      <div key={lbl} style={{padding:"6px 8px",background:C.s2,borderRadius:7}}>
                        <div style={{fontSize:"0.55rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.8px"}}>{lbl}</div>
                        <div style={{fontSize:"0.72rem",color:C.text,marginTop:2,lineHeight:1.4}}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Testing Protocol */}
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a2,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Testing Protocol</div>
                    {[["Patient Position",m.patient,"👤"],["Therapist",m.therapist,"🙌"],["Resistance",m.resistance,"↕️"],["Gravity Eliminated",m.gravElim,"⬇️"],["Palpation",m.palpation,"👆"]].map(([lbl,val,icon])=>(
                      <div key={lbl} style={{display:"flex",gap:8,padding:"5px 9px",background:C.s3,borderRadius:7,marginBottom:4,alignItems:"flex-start"}}>
                        <span style={{flexShrink:0}}>{icon}</span>
                        <div>
                          <span style={{fontSize:"0.6rem",fontWeight:700,color:C.muted}}>{lbl}: </span>
                          <span style={{fontSize:"0.73rem",color:C.text}}>{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Compensations */}
                  <div style={{marginBottom:8,padding:"7px 10px",background:"rgba(255,179,0,0.07)",border:"1px solid rgba(255,179,0,0.2)",borderRadius:7}}>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:C.yellow,marginBottom:4}}>⚠️ COMPENSATION / SUBSTITUTION</div>
                    <div style={{fontSize:"0.73rem",color:C.text}}><strong>Compensation:</strong> {m.compensation}</div>
                    <div style={{fontSize:"0.73rem",color:C.text,marginTop:3}}><strong>Substitution:</strong> {m.substitution}</div>
                  </div>

                  {/* Functional / Kinetic Chain */}
                  {(m.functional||m.chain)&&(
                    <div style={{marginBottom:8,padding:"7px 10px",background:`${C.a2}0d`,border:`1px solid ${C.a2}25`,borderRadius:7}}>
                      <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a2,marginBottom:4}}>⛓️ CLINICAL INTERPRETATION</div>
                      {m.functional&&<div style={{fontSize:"0.73rem",color:C.text,marginBottom:3}}>{m.functional}</div>}
                      {m.chain&&<div style={{fontSize:"0.72rem",color:C.muted,fontStyle:"italic"}}>{m.chain}</div>}
                    </div>
                  )}

                  {/* Rehab */}
                  {rehab&&(
                    <div style={{padding:"7px 10px",background:`${C.a3}0d`,border:`1px solid ${C.a3}25`,borderRadius:7}}>
                      <div style={{fontSize:"0.6rem",fontWeight:700,color:C.a3,marginBottom:4}}>🏋️ REHAB RECOMMENDATION</div>
                      <div style={{fontSize:"0.73rem",color:C.text}}>{rehab}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interpretation Panel */}
      {(chainFindings.length>0||myotomeAnalysis.length>0)&&(
        <div style={{marginTop:14}}>
          <button type="button" onClick={()=>setShowInterp(p=>!p)} style={{width:"100%",padding:"9px",background:C.s2,border:`1px solid ${C.border}`,borderRadius:8,color:C.accent,fontWeight:700,fontSize:"0.78rem",cursor:"pointer"}}>
            {showInterp?"▲ Hide":"▼ Show"} Clinical Interpretation
          </button>
          {showInterp&&(
            <div style={{marginTop:8}}>
              {chainFindings.length>0&&(
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:"0.65rem",fontWeight:700,color:C.a4,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>⛓️ Kinetic Chain Patterns</div>
                  {chainFindings.map((ch,i)=>(
                    <div key={i} style={{padding:"8px 10px",background:C.s2,borderRadius:8,marginBottom:6,border:`1px solid ${C.a4}30`}}>
                      <div style={{fontWeight:700,fontSize:"0.76rem",color:C.a4,marginBottom:3}}>{ch.label}</div>
                      <div style={{fontSize:"0.72rem",color:C.text}}>{ch.interpretation}</div>
                      <div style={{fontSize:"0.65rem",color:C.muted,marginTop:3}}>Weak: {ch.weak.join(", ")}</div>
                    </div>
                  ))}
                </div>
              )}
              {myotomeAnalysis.length>0&&(
                <div>
                  <div style={{fontSize:"0.65rem",fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>⚡ Myotome / Neurological Pattern</div>
                  {myotomeAnalysis.map((m,i)=>(
                    <div key={i} style={{padding:"7px 10px",background:C.s2,borderRadius:8,marginBottom:5,border:`1px solid ${C.accent}25`}}>
                      <span style={{fontWeight:700,fontSize:"0.76rem",color:C.accent}}>{m.level} </span>
                      <span style={{fontSize:"0.72rem",color:C.muted}}>— {m.affected.length}/{m.total} muscles affected. Consider {m.level} radiculopathy or peripheral nerve lesion.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEUROLOGICAL ASSESSMENT MODULE — Full Comprehensive Integration
// ═══════════════════════════════════════════════════════════════════════════════


const MYOTOMES = [
  { level:"C1–C2", action:"Neck flexion",              test:"Active neck curl against gravity", compensation:"SCM dominant — look for chin poke" },
  { level:"C3",    action:"Neck lateral flexion",       test:"Side flex against resistance",     compensation:"Shoulder elevation (trap)" },
  { level:"C4",    action:"Shoulder elevation",         test:"Shrug against resistance",         compensation:"Neck side flex" },
  { level:"C5",    action:"Shoulder abduction / deltoid", test:"Arm abduction 0–90° resist",   compensation:"Trunk lean, shoulder hike" },
  { level:"C6",    action:"Wrist extension",            test:"Make fist, extend wrist resist",  compensation:"Supinator, BR activation" },
  { level:"C7",    action:"Elbow extension / wrist flex", test:"Triceps push, wrist curl",      compensation:"Shoulder ER, elbow flex" },
  { level:"C8",    action:"Finger flexion (grip)",      test:"Grip dynamometer or resist 3rd–5th DIP flex", compensation:"Wrist flexor dominant" },
  { level:"T1",    action:"Finger abduction",           test:"Spread fingers resist adduction", compensation:"Flexor override" },
  { level:"L1–L2", action:"Hip flexion",                test:"Hip flex seated 0–90° resist",    compensation:"QL, trunk lean back" },
  { level:"L3",    action:"Knee extension",             test:"Extend knee from 90° against resist", compensation:"Hip flexor assist" },
  { level:"L4",    action:"Ankle dorsiflexion (TA)",    test:"Walk on heels / resist DF",       compensation:"EHL dominant" },
  { level:"L5",    action:"Great toe extension (EHL)",  test:"Lift big toe resist",             compensation:"EDB firing, ankle inversion" },
  { level:"S1",    action:"Ankle plantarflexion",       test:"25 single-leg calf raises",       compensation:"Peroneals, flexor hallucis" },
  { level:"S2",    action:"Knee flexion (hamstring)",   test:"Prone knee flex 90° resist",      compensation:"Gastrocnemius, gluteus max" },
];




const NERVE_ROOT_MAP = {
  "C5": { dermSensory:"Lateral arm", reflex:"Biceps", myotome:"Shoulder abduction, elbow flex", disc:"C4/5", peripheral:"Musculocutaneous / axillary" },
  "C6": { dermSensory:"Lateral forearm, thumb, index", reflex:"Brachioradialis", myotome:"Wrist extension (ECRL/ECRB)", disc:"C5/6", peripheral:"Median / radial" },
  "C7": { dermSensory:"Middle finger", reflex:"Triceps", myotome:"Elbow extension, wrist flex", disc:"C6/7", peripheral:"Radial / median" },
  "C8": { dermSensory:"Ring, little finger, medial forearm", reflex:"None standard", myotome:"Finger flexion, grip", disc:"C7/T1", peripheral:"Ulnar / median" },
  "T1": { dermSensory:"Medial forearm", reflex:"None", myotome:"Finger abduction", disc:"T1/2", peripheral:"Ulnar (intrinsics)" },
  "L2": { dermSensory:"Anterior/medial thigh", reflex:"None", myotome:"Hip flexion", disc:"L2/3", peripheral:"Femoral / obturator" },
  "L3": { dermSensory:"Medial knee, lower ant thigh", reflex:"Patella (with L4)", myotome:"Knee extension", disc:"L3/4", peripheral:"Femoral" },
  "L4": { dermSensory:"Medial leg and foot", reflex:"Patella", myotome:"Ankle dorsiflexion (TA)", disc:"L4/5", peripheral:"Deep peroneal" },
  "L5": { dermSensory:"Dorsum foot, 1st web space", reflex:"None reliable", myotome:"Great toe extension (EHL)", disc:"L4/5", peripheral:"Deep peroneal" },
  "S1": { dermSensory:"Lateral foot, heel", reflex:"Achilles", myotome:"Ankle plantarflexion", disc:"L5/S1", peripheral:"Sural / tibial" },
};

// ─── Collapsible How-To Panel ─────────────────────────────────────────────────
function CollapsibleHow({ title, children }) {
  const C = getC();
  const [open, setOpen] = useState(false);
  return (
    <div style={{marginBottom:14}}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
          background:C.s2, border:`1px solid ${open ? C.accent : C.border}`,
          borderRadius: open ? "10px 10px 0 0" : 10,
          padding:"10px 14px", cursor:"pointer", color:C.text, fontFamily:"inherit",
          transition:"all 0.15s",
        }}
      >
        <span style={{fontWeight:800, fontSize:"0.8rem", color:C.accent}}>{title}</span>
        <span style={{fontSize:"0.85rem", color:C.accent, fontWeight:700}}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{
          background:C.s2, borderRadius:"0 0 10px 10px",
          padding:"14px 16px", border:`1px solid ${C.accent}`, borderTop:"none",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function NeurologicalModule({ data, set }) {
  const [tab, setTab] = useState("dermatomes");
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);
  const [clinicianNotes, setClinicianNotes] = useState(data["neuro_clinician_notes"]||"");
  const [showAsiaGuide, setShowAsiaGuide] = useState(false);

  const inp = { width:"100%", background:C.s3, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"7px 10px", fontSize:"0.78rem", outline:"none", fontFamily:"inherit" };

  const getSensoryColor = (val) => {
    if(!val||val==="") return C.muted;
    if(val==="Normal") return C.green;
    if(val==="Reduced") return C.yellow;
    if(val==="Absent") return C.red;
    if(val==="Hyperaesthetic") return C.purple;
    return C.muted;
  };

  const getReflexColor = (val) => {
    if(!val||val==="") return C.muted;
    if(val==="Normal 2+") return C.green;
    if(val==="Trace 1+" || val==="Diminished 1+") return C.yellow;
    if(val==="Absent 0") return C.red;
    if(val==="Brisk 3+" || val==="Clonus 4+") return C.purple;
    return C.muted;
  };

  const getStrengthColor = (val) => {
    if(!val||val==="") return C.muted;
    if(val.startsWith("5")) return C.green;
    if(val.startsWith("4")) return C.yellow;
    if(val.startsWith("3")) return "#f97316";
    return C.red;
  };

  const SENSORY_OPTIONS = ["Normal","Reduced","Absent","Hyperaesthetic"];
  const REFLEX_OPTIONS  = ["Normal 2+","Trace 1+","Diminished 1+","Absent 0","Brisk 3+","Clonus 4+"];
  const STRENGTH_OPTIONS= ["5/5 Normal","4/5 Good","3/5 Fair","2/5 Poor","1/5 Trace","0/5 Zero"];
  const NTT_OPTIONS     = ["Not tested","Negative","Positive — symptoms reproduced","Positive — confirmed neural (sensitisation)","Equivocal"];

  // --- Red flag checker
  const activeRedFlags = RED_FLAGS_NEURO.filter(rf => {
    if(rf.id==="nrf_cauda") return (data["n_ref_s4s5_left"]||"").includes("Absent")||(data["n_ref_s4s5_right"]||"").includes("Absent")||data["nrf_cauda"]==="Present";
    if(rf.id==="nrf_myelopathy") return (data["n_ref_babinski_left"]||"").includes("Positive")||(data["n_ref_babinski_right"]||"").includes("Positive")||(data["n_ref_hoffmann_left"]||"").includes("Positive")||(data["n_ref_hoffmann_right"]||"").includes("Positive")||(data["n_ref_clonus_ankle_left"]||"").includes("Positive")||(data["n_ref_clonus_ankle_right"]||"").includes("Positive")||data["nrf_myelopathy"]==="Present";
    if(rf.id==="nrf_saddle") return data["nrf_saddle"]==="Present";
    if(rf.id==="nrf_bilateral") return data["nrf_bilateral"]==="Present";
    if(rf.id==="nrf_sphincter") return data["nrf_sphincter"]==="Present";
    if(rf.id==="nrf_prog_weak") return data["nrf_prog_weak"]==="Present";
    if(rf.id==="nrf_umnsigns") return (data["n_ref_babinski_left"]||"").includes("Positive")||(data["n_ref_babinski_right"]||"").includes("Positive")||(data["n_ref_hoffmann_left"]||"").includes("Positive")||(data["n_ref_hoffmann_right"]||"").includes("Positive");
    return data[rf.id]==="Present";
  });

  const tabs = [
    { key:"dermatomes",  label:"Dermatomes",       icon:"🗺️" },
    { key:"myotomes",    label:"Myotomes",          icon:"💪" },
    { key:"reflexes",    label:"Reflexes",          icon:"🔨" },
    { key:"tension",     label:"Neural Tension",    icon:"⚡" },
    { key:"gcs",         label:"GCS",               icon:"🧠" },
    { key:"asia",        label:"ASIA Scale",        icon:"🦾" },
    { key:"redflags",    label:"Red Flags",         icon:"🚨" },
    { key:"reasoning",   label:"Clinical Reasoning",icon:"📊" },
  ];

  // ─── CLINICAL REASONING ENGINE
  const reasoningOutput = (() => {
    const involved = [];
    DERMATOMES.forEach(d => {
      const lv = (data[d.id+"_left"]||""), rv = (data[d.id+"_right"]||"");
      const abnormalL = lv && lv!=="Normal";
      const abnormalR = rv && rv!=="Normal";
      if(abnormalL||abnormalR) {
        const sides = [abnormalL?"Left":"",abnormalR?"Right":""].filter(Boolean).join("+");
        involved.push({ level:d.level, type:"Sensory", detail:`${sides}: ${[lv,rv].filter(Boolean).join(" / ")}`, disc:d.disc });
      }
    });
    // reflexes
    REFLEXES.forEach(r => {
      const lv = (data[r.id+"_left"]||""), rv = (data[r.id+"_right"]||"");
      const abnL = lv&&lv!=="Normal 2+", abnR = rv&&rv!=="Normal 2+";
      if(r.pathological) {
        const both = (data[r.id+"_left"]||data[r.id+"_right"]||data[r.id]||"");
        if(both.includes("Positive")) involved.push({ level:r.level, type:"Pathological Reflex", detail:r.label+" positive", disc:"UMN" });
      } else if(abnL||abnR) {
        const sides = [abnL?"Left":"",abnR?"Right":""].filter(Boolean).join("+");
        involved.push({ level:r.level, type:"Reflex", detail:`${r.label} ${sides}: ${[lv,rv].filter(Boolean).join(" / ")}`, disc:"" });
      }
    });
    // myotome ids
    MYOTOMES.forEach(m => {
      const id = "myo_"+m.level.replace(/[^a-zA-Z0-9]/g,"_").toLowerCase();
      const lv = data[id+"_left"]||"", rv = data[id+"_right"]||"";
      const abnL = lv&&!lv.startsWith("5"), abnR = rv&&!rv.startsWith("5");
      if(abnL||abnR) {
        const sides=[abnL?"Left":"",abnR?"Right":""].filter(Boolean).join("+");
        involved.push({ level:m.level, type:"Myotome", detail:`${sides}: ${m.action} ${[lv,rv].filter(Boolean).join(" / ")}`, disc:"" });
      }
    });
    // neural tension
    NEURAL_TENSION.forEach(nt => {
      const lv = data[nt.id+"_left"]||"", rv = data[nt.id+"_right"]||"";
      const posL = lv.includes("Positive"), posR = rv.includes("Positive");
      if(posL||posR) {
        const sides=[posL?"Left":"",posR?"Right":""].filter(Boolean).join("+");
        involved.push({ level:nt.nerve, type:"Neural Tension", detail:`${nt.label} ${sides} positive`, disc:"" });
      }
    });
    // group by level
    const byLevel = {};
    involved.forEach(item => {
      const key = item.level;
      if(!byLevel[key]) byLevel[key] = { level:key, findings:[], disc:item.disc };
      byLevel[key].findings.push({ type:item.type, detail:item.detail });
    });
    const patterns = Object.values(byLevel);
    // Pattern recognition
    const interpretations = [];
    const hasBabinski = (data["n_ref_babinski_left"]||"").includes("Positive")||(data["n_ref_babinski_right"]||"").includes("Positive");
    const hasHoffmann = (data["n_ref_hoffmann_left"]||"").includes("Positive")||(data["n_ref_hoffmann_right"]||"").includes("Positive");
    if(hasBabinski||hasHoffmann) interpretations.push({ title:"⚠️ Upper Motor Neuron Pattern", color:C.red, text:"Pathological reflexes indicate UMN lesion above the segmental level. Consider cervical myelopathy, cord compression, or intracranial pathology. Urgent MRI required.", action:"URGENT — Neurosurgical / Neurology Referral" });
    const isMultiLevel = patterns.filter(p=>p.findings.length>=2).length>=2;
    if(isMultiLevel) interpretations.push({ title:"Multi-Level Involvement", color:C.yellow, text:"Findings span 2+ nerve root levels. Consider central stenosis, myelopathy, peripheral polyneuropathy, or multi-level disc disease.", action:"MRI full spine + neurology referral" });
    const isBilateral = involved.some(i=>i.detail.includes("Left+Right")||(involved.filter(ii=>ii.level===i.level).some(ii=>ii.detail.includes("Left"))&&involved.filter(ii=>ii.level===i.level).some(ii=>ii.detail.includes("Right"))));
    if(isBilateral&&!hasBabinski) interpretations.push({ title:"Bilateral Pattern", color:C.yellow, text:"Bilateral neurological signs suggest central pathology (disc, cord) rather than single nerve root. Cauda equina must be excluded if lumbar.", action:"Rule out cauda equina / central compression" });
    // Single level radiculopathy
    const unilevel = patterns.filter(p=>!p.disc.includes("Cauda")).find(p=>p.findings.length>=1);
    if(unilevel&&!isMultiLevel&&patterns.length===1) {
      const rm = NERVE_ROOT_MAP[unilevel.level];
      if(rm) interpretations.push({ title:`Nerve Root Pattern — ${unilevel.level}`, color:C.accent, text:`Findings correlate with ${unilevel.level} nerve root at ${rm.disc} disc level. Expected: sensory loss ${rm.dermSensory}, reflex ${rm.reflex}, weakness of ${rm.myotome}. Peripheral nerve differential: ${rm.peripheral}.`, action:`Targeted imaging: ${rm.disc} disc. Neural mobilisation program.` });
    }
    if(interpretations.length===0&&patterns.length>0) interpretations.push({ title:"Findings Present — Pattern Incomplete", color:C.muted, text:"Neurological findings noted but insufficient for definitive pattern. Complete dermatomes, myotomes, reflexes and neural tension for full clinical reasoning.", action:"Complete all neurological sub-sections" });
    return { patterns, interpretations };
  })();

  const tabBtnStyle = (key) => ({
    padding:"7px 13px", borderRadius:20, border:`1px solid ${tab===key?C.accent:C.border}`,
    background:tab===key?"rgba(0,229,255,0.12)":"transparent",
    color:tab===key?C.accent:C.muted, fontSize:"0.72rem", fontWeight:tab===key?700:400,
    cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s"
  });

  const sectionHead = (label) => (
    <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
      <div style={{height:1,width:10,background:C.a2}}/>{label}<div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.border},transparent)`}}/>
    </div>
  );

  return (
    <div>
      {/* Neuro Red Flag Banner */}
      {activeRedFlags.length>0&&(
        <div style={{background:"rgba(255,77,109,0.12)",border:`1.5px solid ${C.red}`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:"1.3rem",flexShrink:0}}>🚨</span>
          <div>
            <div style={{fontWeight:800,color:C.red,fontSize:"0.85rem",marginBottom:4}}>NEUROLOGICAL RED FLAGS DETECTED</div>
            {activeRedFlags.map((rf,i)=>(
              <div key={i} style={{fontSize:"0.76rem",color:rf.severity==="EMERGENCY"?C.red:C.yellow,marginBottom:2,fontWeight:600}}>
                {rf.icon} {rf.severity}: {rf.label} — {rf.action}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
        {tabs.map(t=><button key={t.key} type="button" onClick={()=>setTab(t.key)} style={tabBtnStyle(t.key)}>{t.icon} {t.label}</button>)}
      </div>

      {/* ── DERMATOMES ── */}
      {tab==="dermatomes"&&(
        <div>
          {sectionHead("Sensory Testing — All Spinal Levels")}
          <CollapsibleHow title="📋 HOW TO PERFORM — Dermatomal Sensory Testing">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:10}}>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.yellow,marginBottom:6,fontSize:"0.72rem"}}>⚙️ Setup</div>
                <div style={{fontSize:"0.71rem",lineHeight:1.7}}>• Patient seated or supine, relaxed<br/>• Eyes closed throughout (prevents visual cues)<br/>• Explain test first with eyes open as reference<br/>• Establish a "normal" reference point first (e.g. forehead or sternum)</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.accent,marginBottom:6,fontSize:"0.72rem"}}>🖐️ Light Touch Method</div>
                <div style={{fontSize:"0.71rem",lineHeight:1.7}}>• Use wisp of cotton wool or fingertip<br/>• Touch LIGHTLY — less than 1g pressure<br/>• Apply randomly, unpredictably<br/>• Ask: "Does this feel the same as here?"<br/>• Move distal → proximal along dermatome</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.red,marginBottom:6,fontSize:"0.72rem"}}>📍 Pin Prick Method</div>
                <div style={{fontSize:"0.71rem",lineHeight:1.7}}>• Use sterile neurological pin or broken stick<br/>• Apply sharp end, then blunt end randomly<br/>• Ask: "Sharp or dull?"<br/>• NEVER break skin<br/>• Compare left vs right at same level</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.a3,marginBottom:6,fontSize:"0.72rem"}}>📊 HOW TO MARK</div>
                <div style={{fontSize:"0.71rem",lineHeight:1.7}}><span style={{color:C.green}}>✅ Normal</span> — Same as reference; detected correctly<br/><span style={{color:C.yellow}}>⚠ Reduced</span> — Detected but duller/weaker than reference<br/><span style={{color:C.red}}>🔴 Absent</span> — Cannot detect stimulus<br/><span style={{color:C.purple}}>🟣 Hyperaesthetic</span> — Exaggerated/painful response</div>
              </div>
            </div>
            <div style={{background:"rgba(0,229,255,0.07)",borderRadius:8,padding:"8px 12px",fontSize:"0.7rem",color:C.text,borderLeft:`3px solid ${C.accent}`}}>
              <strong style={{color:C.accent}}>Clinical Pearl:</strong> Hyperaesthesia = early nerve root irritation (disc bulge compressing root). Reduced/Absent = axonal compromise (severe compression or chronicity). Always compare bilateral symmetry — subtle asymmetry is more significant than bilateral reduction.
            </div>
          </CollapsibleHow>

          {/* Cervical */}
          <div style={{marginBottom:12}}><div style={{fontSize:"0.7rem",fontWeight:700,color:C.yellow,marginBottom:8}}>● CERVICAL LEVELS</div>
          {DERMATOMES.filter(d=>d.level.startsWith("C")).map(d=>{
            const lv=data[d.id+"_left"]||"", rv=data[d.id+"_right"]||"";
            const lCol=getSensoryColor(lv), rCol=getSensoryColor(rv);
            const abnormal=(lv&&lv!=="Normal")||(rv&&rv!=="Normal");
            return(
              <div key={d.id} style={{background:C.surface,border:`1px solid ${abnormal?C.red+"50":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8,flexWrap:"wrap"}}>
                  <div>
                    <span style={{fontWeight:800,color:abnormal?C.red:C.accent,marginRight:8}}>{d.level}</span>
                    <span style={{fontSize:"0.76rem",color:C.text}}>{d.region}</span>
                  </div>
                  <button type="button" onClick={()=>setExpandedLevel(expandedLevel===d.id?null:d.id)}
                    style={{padding:"2px 9px",background:"rgba(127,90,240,0.12)",border:`1px solid ${C.a2}40`,borderRadius:6,color:C.a2,fontSize:"0.62rem",fontWeight:700,cursor:"pointer"}}>
                    {expandedLevel===d.id?"▲ Hide":"ℹ Guide"}
                  </button>
                </div>
                {expandedLevel===d.id&&(
                  <div style={{background:C.s3,borderRadius:8,padding:"9px 12px",marginBottom:8,fontSize:"0.74rem",color:C.muted,lineHeight:1.7}}>
                    <div><strong style={{color:C.yellow}}>Disc level:</strong> {d.disc}</div>
                    <div><strong style={{color:C.accent}}>Myotome:</strong> {d.myotome}</div>
                    {d.reflex&&<div><strong style={{color:C.a3}}>Reflex:</strong> {d.reflex}</div>}
                    <div style={{marginTop:6,color:C.text}}>Test with: light touch (cotton) + pin-prick at key point. Compare side to side. Hyperaesthesia = early irritation; Reduced/Absent = axonal compromise.</div>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["_left","LEFT",lv,lCol],["_right","RIGHT",rv,rCol]].map(([sfx,side,sv,col])=>(
                    <div key={sfx}>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:col,marginBottom:3}}>{side} {sv&&sv!=="Normal"?"⚠":""}</div>
                      <select value={sv} onChange={e=>set(d.id+sfx,e.target.value)} style={{...inp,borderColor:sv&&sv!=="Normal"?col:C.border}}>
                        <option value="">— select —</option>
                        {SENSORY_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>

          {/* Lumbar + Sacral */}
          <div><div style={{fontSize:"0.7rem",fontWeight:700,color:C.a3,marginBottom:8}}>● LUMBAR & SACRAL LEVELS</div>
          {DERMATOMES.filter(d=>d.level.startsWith("L")||d.level.startsWith("S")||d.level.startsWith("T")).map(d=>{
            const lv=data[d.id+"_left"]||"", rv=data[d.id+"_right"]||"";
            const lCol=getSensoryColor(lv), rCol=getSensoryColor(rv);
            const abnormal=(lv&&lv!=="Normal")||(rv&&rv!=="Normal");
            const isCauda=d.level==="S4/5";
            return(
              <div key={d.id} style={{background:C.surface,border:`1px solid ${abnormal?(isCauda?C.red:C.red+"50"):C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8,flexWrap:"wrap"}}>
                  <div>
                    <span style={{fontWeight:800,color:abnormal?(isCauda?C.red:C.yellow):C.a3,marginRight:8}}>{d.level}</span>
                    <span style={{fontSize:"0.76rem",color:C.text}}>{d.region}</span>
                    {isCauda&&<span style={{marginLeft:8,padding:"1px 7px",borderRadius:8,background:"rgba(255,77,109,0.2)",color:C.red,fontSize:"0.62rem",fontWeight:700}}>CAUDA EQUINA</span>}
                  </div>
                  <button type="button" onClick={()=>setExpandedLevel(expandedLevel===d.id?null:d.id)}
                    style={{padding:"2px 9px",background:"rgba(127,90,240,0.12)",border:`1px solid ${C.a2}40`,borderRadius:6,color:C.a2,fontSize:"0.62rem",fontWeight:700,cursor:"pointer"}}>
                    {expandedLevel===d.id?"▲ Hide":"ℹ Guide"}
                  </button>
                </div>
                {expandedLevel===d.id&&(
                  <div style={{background:C.s3,borderRadius:8,padding:"9px 12px",marginBottom:8,fontSize:"0.74rem",color:C.muted,lineHeight:1.7}}>
                    <div><strong style={{color:C.yellow}}>Disc level:</strong> {d.disc}</div>
                    <div><strong style={{color:C.accent}}>Myotome:</strong> {d.myotome}</div>
                    {d.reflex&&<div><strong style={{color:C.a3}}>Reflex:</strong> {d.reflex}</div>}
                    {isCauda&&<div style={{marginTop:6,padding:"6px 10px",borderRadius:6,background:"rgba(255,77,109,0.1)",color:C.red,fontWeight:600}}>⚠️ Any deficit here = potential cauda equina emergency. Ask about bladder/bowel dysfunction and perianal sensation immediately.</div>}
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["_left","LEFT",lv,lCol],["_right","RIGHT",rv,rCol]].map(([sfx,side,sv,col])=>(
                    <div key={sfx}>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:col,marginBottom:3}}>{side} {sv&&sv!=="Normal"?"⚠":""}</div>
                      <select value={sv} onChange={e=>set(d.id+sfx,e.target.value)} style={{...inp,borderColor:sv&&sv!=="Normal"?col:C.border}}>
                        <option value="">— select —</option>
                        {SENSORY_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* ── MYOTOMES ── */}
      {tab==="myotomes"&&(
        <div>
          {sectionHead("Myotome Grading — MRC Scale 0–5")}
          <CollapsibleHow title="📋 HOW TO PERFORM — Myotome Testing">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.yellow,marginBottom:6,fontSize:"0.72rem"}}>⚙️ How to Test</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}>• Position patient so muscle can work against gravity (or gravity-eliminated for weak muscles)<br/>• Apply resistance smoothly and gradually — not a sudden jerk<br/>• Hold resistance for 3–5 seconds<br/>• Compare left vs right bilaterally<br/>• Always test proximal before distal</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.a3,marginBottom:6,fontSize:"0.72rem"}}>📊 HOW TO MARK — MRC Scale</div>
                <div style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.8}}>
                  <span style={{color:C.green}}>5/5 Normal</span> — Full power against full resistance<br/>
                  <span style={{color:"#a3e635"}}>4/5 Good</span> — Moves against SOME resistance<br/>
                  <span style={{color:C.yellow}}>3/5 Fair</span> — Moves AGAINST gravity; no resistance<br/>
                  <span style={{color:"#f97316"}}>2/5 Poor</span> — Moves WITH gravity eliminated only<br/>
                  <span style={{color:C.red}}>1/5 Trace</span> — Visible/palpable flicker, no movement<br/>
                  <span style={{color:C.red}}>0/5 Zero</span> — No contraction whatsoever
                </div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.a2,marginBottom:6,fontSize:"0.72rem"}}>🔍 Clinical Interpretation</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}><span style={{color:C.yellow}}>Grade 4 bilateral</span> — Possible nerve root irritation or pain inhibition<br/><span style={{color:"#f97316"}}>Grade 3 or below</span> — Significant axonal loss; urgent imaging<br/><span style={{color:C.red}}>Grade 0–1</span> — Severe radiculopathy or myelopathy; immediate referral<br/><span style={{color:C.muted}}>Asymmetry</span> — Even 1 grade difference is clinically significant</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.red,marginBottom:6,fontSize:"0.72rem"}}>⚠️ Watch For</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}>• Pain inhibition can mimic weakness — check if pain-free testing improves grade<br/>• Compensation patterns — ensure correct muscle tested<br/>• Bilateral weakness = UMN / cord lesion, not bilateral root<br/>• Fasciculations at rest = LMN / motor neuron disease</div>
              </div>
            </div>
            <div style={{background:"rgba(0,229,255,0.07)",borderRadius:8,padding:"8px 12px",fontSize:"0.7rem",color:C.text,borderLeft:`3px solid ${C.accent}`}}>
              <strong style={{color:C.accent}}>Clinical Pearl:</strong> A myotomal pattern of weakness (e.g. C5 = deltoid + biceps weak) points to nerve root. A peripheral nerve pattern (e.g. median nerve = thenar + index/middle finger flex) points to peripheral lesion. Distinguishing these determines the treatment pathway.
            </div>
          </CollapsibleHow>
          <div style={{display:"grid",gap:6,marginBottom:14}}>
            {[{col:C.green,label:"5/5 Normal — full power against resistance"},{col:C.yellow,label:"4/5 — movement against some resistance (nerve irritation)"},{col:"#f97316",label:"3/5 — movement against gravity only (axonal compromise)"},{col:C.red,label:"2/5 or less — serious neurological deficit"}].map((g,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 10px",background:C.s3,borderRadius:7,fontSize:"0.72rem"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:g.col,flexShrink:0}}/>
                <span style={{color:C.text}}>{g.label}</span>
              </div>
            ))}
          </div>

          {MYOTOMES.map(m=>{
            const safeId = "myo_"+m.level.replace(/[^a-zA-Z0-9]/g,"_").toLowerCase();
            const lv=data[safeId+"_left"]||"", rv=data[safeId+"_right"]||"";
            const lCol=getStrengthColor(lv), rCol=getStrengthColor(rv);
            const abnormal=(lv&&!lv.startsWith("5"))||(rv&&!rv.startsWith("5"));
            return(
              <div key={m.level} style={{background:C.surface,border:`1px solid ${abnormal?C.yellow+"60":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
                  <div>
                    <span style={{fontWeight:800,color:abnormal?C.yellow:C.text,fontSize:"0.88rem",marginRight:8}}>{m.level}</span>
                    <span style={{fontSize:"0.78rem",color:C.text}}>{m.action}</span>
                  </div>
                  <button type="button" onClick={()=>setExpandedLevel(expandedLevel===safeId?null:safeId)}
                    style={{padding:"2px 9px",background:"rgba(0,229,255,0.1)",border:`1px solid ${C.accent}40`,borderRadius:6,color:C.accent,fontSize:"0.62rem",fontWeight:700,cursor:"pointer",flexShrink:0}}>
                    {expandedLevel===safeId?"▲":"👁 Technique"}
                  </button>
                </div>
                {expandedLevel===safeId&&(
                  <div style={{background:C.s3,borderRadius:8,padding:"9px 12px",marginBottom:8,fontSize:"0.74rem",lineHeight:1.7}}>
                    <div style={{color:C.accent,fontWeight:600,marginBottom:3}}>🔬 Test: <span style={{color:C.text,fontWeight:400}}>{m.test}</span></div>
                    <div style={{color:C.yellow,fontWeight:600}}>⚠ Compensation: <span style={{color:C.text,fontWeight:400}}>{m.compensation}</span></div>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["_left","LEFT",lv,lCol],["_right","RIGHT",rv,rCol]].map(([sfx,side,sv,col])=>(
                    <div key={sfx}>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:col,marginBottom:3}}>{side} {sv&&!sv.startsWith("5")?"⚠":""}</div>
                      <select value={sv} onChange={e=>set(safeId+sfx,e.target.value)} style={{...inp,borderColor:sv&&!sv.startsWith("5")?col:C.border}}>
                        <option value="">— select —</option>
                        {STRENGTH_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── REFLEXES ── */}
      {tab==="reflexes"&&(
        <div>
          {sectionHead("Reflexes — DTR · UMN Signs · Clonus · LMN Signs")}

          {/* How to Perform Reflexes — collapsible */}
          <CollapsibleHow title="📋 HOW TO PERFORM — Reflex Testing">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.yellow,marginBottom:6,fontSize:"0.72rem"}}>⚙️ General Technique</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}>• Patient RELAXED — tension suppresses reflexes<br/>• Limb in mid-range position (not taut)<br/>• Strike tendon BRISKLY with the pointed end of reflex hammer<br/>• Use a single, sharp strike — not repeated taps<br/>• Jendrassik Manoeuvre: ask patient to interlock fingers and pull apart (reinforcement) if reflex absent</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.a3,marginBottom:6,fontSize:"0.72rem"}}>📊 HOW TO MARK — Reflex Grading</div>
                <div style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.8}}>
                  <span style={{color:C.red}}>0 Absent</span> — No response even with reinforcement = LMN lesion<br/>
                  <span style={{color:C.yellow}}>1+ Trace</span> — Barely detectable flicker only<br/>
                  <span style={{color:C.yellow}}>1+ Diminished</span> — Reduced but present; may be LMN<br/>
                  <span style={{color:C.green}}>2+ Normal</span> — Brisk, appropriate amplitude response<br/>
                  <span style={{color:C.purple}}>3+ Brisk</span> — Exaggerated; consider UMN if bilateral<br/>
                  <span style={{color:C.purple}}>4+ Clonus</span> — Sustained beats = definite UMN lesion
                </div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.red,marginBottom:6,fontSize:"0.72rem"}}>⚠️ UMN vs LMN Pattern</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}><span style={{color:C.red}}>UMN (cord/brain)</span>: Hyperreflexia (3+/4+), Babinski +, Hoffmann +, clonus, spasticity<br/><span style={{color:C.yellow}}>LMN (root/nerve)</span>: Hyporeflexia (0/1+), flaccidity, wasting, fasciculations<br/>• Asymmetric reflex = more significant than bilateral change<br/>• Inverted brachioradialis reflex = pathognomonic for C5/6 myelopathy</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.a2,marginBottom:6,fontSize:"0.72rem"}}>🔑 Pathological Signs — Perform These</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}><span style={{color:C.red}}>Babinski</span>: Stroke lateral plantar; upgoing toe = UMN<br/><span style={{color:C.red}}>Hoffmann's</span>: Flick middle finger DIP; thumb flexes = UMN<br/><span style={{color:C.red}}>Clonus</span>: Sustain dorsiflexion; 3+ beats = UMN<br/><span style={{color:C.red}}>Pronator Drift</span>: Eyes closed, arms supinated; drift = UMN</div>
              </div>
            </div>
            <div style={{background:"rgba(0,229,255,0.07)",borderRadius:8,padding:"8px 12px",fontSize:"0.7rem",color:C.text,borderLeft:`3px solid ${C.accent}`}}>
              <strong style={{color:C.accent}}>Clinical Pearl:</strong> Absent ankle reflex (S1) + positive SLR = L5/S1 radiculopathy until proven otherwise. Bilateral brisk reflexes + Babinski = cord compression — do NOT manipulate; urgent MRI. Inverted BR reflex is the most reliable single sign of C5/6 myelopathy.
            </div>
          </CollapsibleHow>

          {/* UMN vs LMN Quick Reference */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            <div style={{background:"rgba(255,77,109,0.07)",border:`1px solid ${C.red}30`,borderRadius:10,padding:"10px 13px"}}>
              <div style={{fontSize:"0.65rem",fontWeight:800,color:C.red,textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>🔴 UMN Pattern (Upper Motor Neuron)</div>
              <div style={{fontSize:"0.72rem",color:C.text,lineHeight:1.7}}>
                <div>• <strong>Hyperreflexia</strong> (brisk DTRs)</div>
                <div>• <strong>Positive Babinski</strong> (upgoing toe)</div>
                <div>• <strong>Clonus</strong> (&gt;3 beats)</div>
                <div>• <strong>Hoffmann's +ve</strong> (upper limb)</div>
                <div>• <strong>Spasticity</strong> (clasp-knife tone)</div>
                <div>• <strong>No wasting</strong> (initially)</div>
                <div style={{marginTop:5,fontSize:"0.68rem",color:C.red,fontWeight:600}}>→ Lesion: brain, brainstem, spinal cord</div>
              </div>
            </div>
            <div style={{background:"rgba(255,179,0,0.07)",border:`1px solid ${C.yellow}30`,borderRadius:10,padding:"10px 13px"}}>
              <div style={{fontSize:"0.65rem",fontWeight:800,color:C.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>🟡 LMN Pattern (Lower Motor Neuron)</div>
              <div style={{fontSize:"0.72rem",color:C.text,lineHeight:1.7}}>
                <div>• <strong>Hyporeflexia / Absent DTRs</strong></div>
                <div>• <strong>Negative Babinski</strong> (no response)</div>
                <div>• <strong>No clonus</strong></div>
                <div>• <strong>Fasciculations</strong> (visible twitching)</div>
                <div>• <strong>Flaccid tone</strong> (reduced resistance)</div>
                <div>• <strong>Muscle wasting</strong> (denervation atrophy)</div>
                <div style={{marginTop:5,fontSize:"0.68rem",color:C.yellow,fontWeight:600}}>→ Lesion: anterior horn, nerve root, peripheral nerve</div>
              </div>
            </div>
          </div>

          <div style={{background:C.s2,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:"0.76rem",color:C.muted,lineHeight:1.6}}>
            <strong style={{color:C.accent}}>DTR Grading (Wexler Scale):</strong> 0=Absent, 1+=Trace/diminished, 2+=Normal, 3+=Brisk (possibly normal), 4+=Clonus (pathological). Asymmetry is always significant. Compare side-to-side before grading as abnormal.
          </div>

          {/* Render by group */}
          {["DTR","UMN","Clonus","LMN"].map(grp=>{
            const groupRefs = REFLEXES.filter(r=>r.group===grp);
            const groupMeta = {
              DTR:{ label:"Deep Tendon Reflexes (DTR)", color:C.accent, icon:"🔨", desc:"Segmental reflex arcs. Diminished = LMN/root. Exaggerated = UMN. Always compare bilateral." },
              UMN:{ label:"Upper Motor Neuron Signs (Pathological)", color:C.red, icon:"🔴", desc:"Any positive UMN sign in adults = corticospinal tract lesion. Requires urgent investigation." },
              Clonus:{ label:"Clonus Tests", color:C.purple, icon:"〰️", desc:"Sustained rhythmic oscillation = UMN lesion with hyperexcitability of stretch reflex. >3 beats = positive." },
              LMN:{ label:"Lower Motor Neuron Signs & Tone", color:C.yellow, icon:"🟡", desc:"Denervation signs. Fasciculations + wasting + flaccid tone = anterior horn / peripheral nerve / root." },
            }[grp];
            return(
              <div key={grp} style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${groupMeta.color}30`}}>
                  <span style={{fontSize:"1rem"}}>{groupMeta.icon}</span>
                  <span style={{fontWeight:800,color:groupMeta.color,fontSize:"0.82rem"}}>{groupMeta.label}</span>
                </div>
                <div style={{fontSize:"0.72rem",color:C.muted,marginBottom:10,lineHeight:1.6,padding:"7px 11px",background:C.s2,borderRadius:8}}>{groupMeta.desc}</div>
                {groupRefs.map(r=>{
                  const lv=data[r.id+"_left"]||"", rv=data[r.id+"_right"]||"";
                  const lCol=getReflexColor(lv), rCol=getReflexColor(rv);
                  const pathL=(lv.includes("Brisk")||lv.includes("Clonus")||lv.includes("Positive"));
                  const pathR=(rv.includes("Brisk")||rv.includes("Clonus")||rv.includes("Positive"));
                  const absentL=lv.includes("Absent")||lv.includes("Trace")||lv.includes("Flaccid")||lv.includes("Wasting")||lv.includes("Present");
                  const absentR=rv.includes("Absent")||rv.includes("Trace")||rv.includes("Flaccid")||rv.includes("Wasting")||rv.includes("Present");
                  const urgent=(r.umnSign||r.pathological)&&(pathL||pathR||absentL||absentR);
                  const abnormal=pathL||pathR||absentL||absentR;
                  const isUMNGroup = grp==="UMN"||grp==="Clonus";
                  const isLMNGroup = grp==="LMN";
                  let opts;
                  if(isUMNGroup) opts=["Not tested","Negative (normal)","Equivocal","Positive — present","Positive — sustained"];
                  else if(isLMNGroup&&r.id==="n_ref_lmn_tone") opts=["Not assessed","Normal — smooth low resistance","Spastic — clasp-knife (UMN)","Rigid — lead-pipe (extrapyramidal)","Flaccid — no resistance (LMN)","Cogwheel rigidity (Parkinson)"];
                  else if(isLMNGroup) opts=["Not assessed","Absent","Mild/equivocal","Moderate — clearly present","Severe — marked"];
                  else opts=REFLEX_OPTIONS;
                  return(
                    <div key={r.id} style={{background:C.surface,border:`1.5px solid ${urgent?groupMeta.color:abnormal?groupMeta.color+"40":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                            <span style={{fontWeight:700,color:urgent?groupMeta.color:abnormal?groupMeta.color:C.text,fontSize:"0.84rem"}}>{r.label}</span>
                            {(r.umnSign)&&<span style={{padding:"1px 6px",borderRadius:8,background:"rgba(255,77,109,0.2)",color:C.red,fontSize:"0.58rem",fontWeight:700}}>UMN SIGN</span>}
                            {(grp==="Clonus")&&<span style={{padding:"1px 6px",borderRadius:8,background:"rgba(127,90,240,0.2)",color:C.purple,fontSize:"0.58rem",fontWeight:700}}>CLONUS</span>}
                            {(grp==="LMN")&&<span style={{padding:"1px 6px",borderRadius:8,background:"rgba(255,179,0,0.2)",color:C.yellow,fontSize:"0.58rem",fontWeight:700}}>LMN</span>}
                          </div>
                          <div style={{fontSize:"0.67rem",color:C.muted}}>{r.level}</div>
                        </div>
                        <button type="button" onClick={()=>setExpandedLevel(expandedLevel===r.id?null:r.id)}
                          style={{padding:"2px 9px",background:`rgba(127,90,240,0.12)`,border:`1px solid ${C.a2}40`,borderRadius:6,color:C.a2,fontSize:"0.62rem",fontWeight:700,cursor:"pointer",flexShrink:0}}>
                          {expandedLevel===r.id?"▲ Hide":"ℹ Technique"}
                        </button>
                      </div>
                      {expandedLevel===r.id&&(
                        <div style={{background:C.s3,borderRadius:8,padding:"10px 13px",marginBottom:8,fontSize:"0.74rem",lineHeight:1.8}}>
                          <div style={{marginBottom:6}}><strong style={{color:C.accent}}>📋 Technique:</strong><div style={{color:C.text,marginTop:3}}>{r.technique}</div></div>
                          <div style={{padding:"8px 11px",background:urgent?"rgba(255,77,109,0.08)":"rgba(255,179,0,0.07)",borderRadius:7,border:`1px solid ${urgent?C.red:C.yellow}30`}}>
                            <strong style={{color:urgent?C.red:C.yellow}}>⚕ Clinical Finding:</strong>
                            <div style={{color:C.text,marginTop:3,lineHeight:1.7}}>{r.finding}</div>
                          </div>
                        </div>
                      )}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        {[["_left","LEFT",lv,lCol],["_right","RIGHT",rv,rCol]].map(([sfx,side,sv,col])=>(
                          <div key={sfx}>
                            <div style={{fontSize:"0.62rem",fontWeight:700,color:col,marginBottom:3}}>
                              {side} {(sv.includes("Positive")||sv.includes("Brisk")||sv.includes("Clonus")||sv.includes("Severe")||sv.includes("Sustained"))?"🔴":sv.includes("Absent")||sv.includes("Trace")||sv.includes("Flaccid")||sv.includes("Moderate")?"⚠":""}
                            </div>
                            <select value={sv} onChange={e=>set(r.id+sfx,e.target.value)} style={{...inp,borderColor:(sv.includes("Positive")||sv.includes("Brisk")||sv.includes("Clonus"))?(urgent?groupMeta.color:C.border):sv.includes("Absent")||sv.includes("Flaccid")?C.yellow:C.border}}>
                              <option value="">— select —</option>
                              {opts.map(o=><option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                      {/* UMN alert when positive */}
                      {urgent&&(pathL||pathR)&&(
                        <div style={{marginTop:8,padding:"7px 11px",background:"rgba(255,77,109,0.1)",border:`1px solid ${C.red}40`,borderRadius:7,fontSize:"0.72rem",color:C.red,fontWeight:600}}>
                          🔴 POSITIVE UMN SIGN — Corticospinal tract lesion suspected. Do NOT manipulate. Refer for MRI + neurology.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* ── NEURAL TENSION TESTS ── */}
      {tab==="tension"&&(
        <div>
          {sectionHead("Neural Tension Tests — Neurodynamic Assessment")}
          <CollapsibleHow title="📋 HOW TO PERFORM — Neural Tension Tests (Neurodynamic Assessment)">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.yellow,marginBottom:6,fontSize:"0.72rem"}}>⚙️ Principle</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}>Neural tension tests load the nerve mechanically through sequential joint positions. A positive test = reproduction of the patient's FAMILIAR symptoms (not just tightness). The key differentiator: symptoms change when a sensitising component is added or released.</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.accent,marginBottom:6,fontSize:"0.72rem"}}>🔍 Sensitising Components</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}><strong style={{color:C.yellow}}>Add to increase load:</strong> cervical contralateral lateral flexion, ankle dorsiflexion, wrist extension, neck flexion (slump)<br/><strong style={{color:C.a3}}>Release to decrease:</strong> cervical ipsilateral flex, plantarflexion, wrist neutral<br/>→ Symptoms change with these = neural, not muscular</div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.a3,marginBottom:6,fontSize:"0.72rem"}}>📊 HOW TO MARK</div>
                <div style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.8}}>
                  <span style={{color:C.muted}}>Not tested</span> — Not performed this session<br/>
                  <span style={{color:C.green}}>Negative</span> — No symptom reproduction<br/>
                  <span style={{color:C.yellow}}>Positive — symptoms reproduced</span> — Familiar symptoms occur at test position<br/>
                  <span style={{color:C.red}}>Positive — confirmed neural</span> — Symptoms change with sensitisation/release<br/>
                  <span style={{color:C.muted}}>Equivocal</span> — Tightness but no familiar symptom reproduction
                </div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.red,marginBottom:6,fontSize:"0.72rem"}}>⚠️ Contraindications</div>
                <div style={{fontSize:"0.71rem",color:C.muted,lineHeight:1.7}}>• Acute spinal cord injury or myelopathy signs<br/>• Severe acute radiculopathy with neurological deficit<br/>• Vertebral artery insufficiency (cervical tests)<br/>• Recent surgery to spine or peripheral nerve<br/>• Do NOT over-sensitise — stop at first symptom reproduction</div>
              </div>
            </div>
            <div style={{background:"rgba(0,229,255,0.07)",borderRadius:8,padding:"8px 12px",fontSize:"0.7rem",color:C.text,borderLeft:`3px solid ${C.accent}`}}>
              <strong style={{color:C.accent}}>Clinical Pearl:</strong> SLR sensitivity 91% — excellent screening tool. Slump is more sensitive than SLR for central disc. ULTT1 (median) is the upper limb equivalent of SLR. Bilateral positive neural tension tests = central pathology (cord, central disc) until proven otherwise.
            </div>
          </CollapsibleHow>
          {NEURAL_TENSION.map(nt=>{
            const lv=data[nt.id+"_left"]||"", rv=data[nt.id+"_right"]||"";
            const posL=lv.includes("Positive"), posR=rv.includes("Positive");
            const abnormal=posL||posR;
            return(
              <div key={nt.id} style={{background:C.surface,border:`1px solid ${abnormal?C.accent+"60":C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:"0.9rem",color:abnormal?C.accent:C.text,marginBottom:2}}>{nt.label}</div>
                    <div style={{fontSize:"0.68rem",color:C.muted}}>{nt.nerve}</div>
                    <div style={{display:"flex",gap:6,marginTop:4}}>
                      <span style={{fontSize:"0.62rem",padding:"1px 7px",borderRadius:7,background:"rgba(0,229,255,0.1)",color:C.accent}}>Sens {nt.sensitivity}</span>
                    </div>
                  </div>
                  <button type="button" onClick={()=>setExpandedTest(expandedTest===nt.id?null:nt.id)}
                    style={{padding:"4px 10px",background:expandedTest===nt.id?"rgba(0,229,255,0.15)":"rgba(127,90,240,0.12)",border:`1px solid ${expandedTest===nt.id?C.accent:C.a2}40`,borderRadius:7,color:expandedTest===nt.id?C.accent:C.a2,fontSize:"0.65rem",fontWeight:700,cursor:"pointer",flexShrink:0}}>
                    {expandedTest===nt.id?"▲ Hide":"📋 Full Guide"}
                  </button>
                </div>
                {expandedTest===nt.id&&(
                  <div style={{background:C.s2,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>📋 Procedure</div>
                      <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.7}}>{nt.procedure}</div>
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>✓ Positive Finding</div>
                      <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.7}}>{nt.positive}</div>
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:C.a2,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>⚡ Differentiation</div>
                      <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.7}}>{nt.differentiation}</div>
                    </div>
                    <div>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>🧠 Clinical Pattern</div>
                      <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.7}}>{nt.pattern}</div>
                    </div>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["_left","LEFT",lv],["_right","RIGHT",rv]].map(([sfx,side,sv])=>(
                    <div key={sfx}>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:sv.includes("Positive")?C.accent:C.muted,marginBottom:3}}>{side} {sv.includes("Positive")?"⚡":""}</div>
                      <select value={sv} onChange={e=>set(nt.id+sfx,e.target.value)} style={{...inp,borderColor:sv.includes("Positive")?C.accent:C.border}}>
                        <option value="">— select —</option>
                        {NTT_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── GCS — Glasgow Coma Scale ── */}
      {tab==="gcs"&&(
        <div>
          {sectionHead("Glasgow Coma Scale (GCS)")}
          <div style={{background:"rgba(0,229,255,0.06)",border:`1px solid ${C.accent}30`,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:"0.76rem",color:C.muted,lineHeight:1.7}}>
            <strong style={{color:C.accent}}>Purpose:</strong> Standardised assessment of conscious level. Used in TBI, stroke, post-arrest, metabolic encephalopathy, spinal cord injury. Score range: <strong style={{color:C.red}}>3</strong> (deep coma) to <strong style={{color:C.green}}>15</strong> (fully conscious).<br/>
            <strong style={{color:C.yellow}}>Severity:</strong> 13–15 = Mild TBI | 9–12 = Moderate TBI | 3–8 = Severe TBI (intubation threshold ≤8)
          </div>

          {/* E — Eye Opening */}
          {[
            {
              id:"gcs_eye", label:"E — Eye Opening", maxScore:4, color:C.accent,
              options:[
                {score:4,label:"4 — Spontaneous",desc:"Eyes open without any stimulus"},
                {score:3,label:"3 — To Speech",desc:"Eyes open to verbal command or name-calling"},
                {score:2,label:"2 — To Pain",desc:"Eyes open to peripheral pain stimulus (nail bed pressure)"},
                {score:1,label:"1 — None",desc:"No eye opening to any stimulus"},
              ]
            },
            {
              id:"gcs_verbal", label:"V — Verbal Response", maxScore:5, color:C.a3,
              options:[
                {score:5,label:"5 — Oriented",desc:"Knows name, place, date — fully oriented"},
                {score:4,label:"4 — Confused",desc:"Converses but disoriented — confused sentences"},
                {score:3,label:"3 — Words",desc:"Inappropriate single words — cursing, calling out"},
                {score:2,label:"2 — Sounds",desc:"Incomprehensible sounds only — moaning, groaning"},
                {score:1,label:"1 — None",desc:"No verbal response. Use T if intubated (GCS VT)"},
              ]
            },
            {
              id:"gcs_motor", label:"M — Motor Response", maxScore:6, color:C.a2,
              options:[
                {score:6,label:"6 — Obeys Commands",desc:"Follows two-step motor command correctly"},
                {score:5,label:"5 — Localises",desc:"Purposeful movement toward pain stimulus"},
                {score:4,label:"4 — Withdrawal",desc:"Pulls away from pain (non-purposeful withdrawal)"},
                {score:3,label:"3 — Abnormal Flexion",desc:"Decorticate posturing — wrist flex, arm adduction"},
                {score:2,label:"2 — Extension",desc:"Decerebrate posturing — arm + leg extension, pronation"},
                {score:1,label:"1 — None",desc:"No motor response to any stimulus"},
              ]
            }
          ].map(comp=>{
            const val=parseInt(data[comp.id])||0;
            const pct=val/comp.maxScore*100;
            const col=val>=comp.maxScore?C.green:val>=Math.ceil(comp.maxScore*0.6)?C.yellow:C.red;
            return(
              <div key={comp.id} style={{background:C.surface,border:`1px solid ${val?comp.color+"40":C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontWeight:800,color:comp.color,fontSize:"0.88rem"}}>{comp.label}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontWeight:800,fontSize:"1.3rem",color:col}}>{val||"—"}</span>
                    <span style={{fontSize:"0.65rem",color:C.muted}}>/ {comp.maxScore}</span>
                  </div>
                </div>
                {val>0&&<div style={{height:4,background:C.s3,borderRadius:3,overflow:"hidden",marginBottom:10}}><div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3,transition:"width 0.4s"}}/></div>}
                <div style={{display:"grid",gap:5}}>
                  {comp.options.map(opt=>{
                    const selected=val===opt.score;
                    return(
                      <div key={opt.score} onClick={()=>set(comp.id,String(opt.score))} style={{cursor:"pointer",padding:"8px 11px",borderRadius:8,background:selected?`${comp.color}18`:C.s2,border:`1px solid ${selected?comp.color:C.border}`,transition:"all 0.15s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:"0.78rem",fontWeight:selected?700:400,color:selected?comp.color:C.text}}>{opt.label}</span>
                          {selected&&<span style={{color:comp.color,fontSize:"0.85rem"}}>✓</span>}
                        </div>
                        <div style={{fontSize:"0.68rem",color:C.muted,marginTop:2}}>{opt.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Total GCS */}
          {(()=>{
            const eye=parseInt(data["gcs_eye"])||0, verbal=parseInt(data["gcs_verbal"])||0, motor=parseInt(data["gcs_motor"])||0;
            const total=eye+verbal+motor;
            const hasAll=eye>0&&verbal>0&&motor>0;
            const severity=total>=13?"Mild / Normal":total>=9?"Moderate TBI":"Severe TBI";
            const sevCol=total>=13?C.green:total>=9?C.yellow:C.red;
            return(
              <div style={{background:hasAll?`${sevCol}12`:C.s2,border:`2px solid ${hasAll?sevCol:C.border}`,borderRadius:14,padding:"16px 18px",marginTop:6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hasAll?12:0}}>
                  <span style={{fontWeight:800,fontSize:"1rem",color:C.text}}>Total GCS Score</span>
                  <span style={{fontWeight:900,fontSize:"2rem",color:hasAll?sevCol:C.muted}}>{hasAll?total:"—"}</span>
                </div>
                {hasAll&&(
                  <>
                    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                      <span style={{padding:"3px 10px",borderRadius:10,background:`${C.accent}15`,color:C.accent,fontSize:"0.72rem",fontWeight:700}}>E{eye}</span>
                      <span style={{padding:"3px 10px",borderRadius:10,background:`${C.a3}15`,color:C.a3,fontSize:"0.72rem",fontWeight:700}}>V{verbal}</span>
                      <span style={{padding:"3px 10px",borderRadius:10,background:`${C.a2}15`,color:C.a2,fontSize:"0.72rem",fontWeight:700}}>M{motor}</span>
                      <span style={{padding:"3px 10px",borderRadius:10,background:`${sevCol}20`,color:sevCol,fontSize:"0.72rem",fontWeight:800}}>{severity}</span>
                    </div>
                    <div style={{fontSize:"0.74rem",color:sevCol,fontWeight:600,lineHeight:1.6}}>
                      {total<=8&&"🔴 GCS ≤8: Airway protection threshold — anaesthesia/ICU alert. Severe TBI protocol."}
                      {total>=9&&total<=12&&"🟡 GCS 9–12: Moderate TBI. Frequent reassessment. Neurosurgical observation."}
                      {total>=13&&"✅ GCS 13–15: Mild / Normal. Continue monitoring for deterioration."}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Pupil Assessment */}
          <div style={{marginTop:14}}>
            {sectionHead("Pupil Assessment (Neuro Companion)")}
            {[
              {id:"gcs_pupil_l",label:"Left Pupil",options:["Not assessed","Equal & Reactive (normal)","Dilated — unreactive (CN III compression / herniation)","Constricted — pinpoint (opiates / pontine lesion)","Midpoint — non-reactive (midbrain)","Anisocoria — mildly asymmetric"]},
              {id:"gcs_pupil_r",label:"Right Pupil",options:["Not assessed","Equal & Reactive (normal)","Dilated — unreactive (CN III compression / herniation)","Constricted — pinpoint (opiates / pontine lesion)","Midpoint — non-reactive (midbrain)","Anisocoria — mildly asymmetric"]},
              {id:"gcs_pupil_react",label:"Pupil Reactivity",options:["Not assessed","Bilateral brisk reaction (normal)","Unilateral sluggish","Bilateral sluggish","Unilateral absent","Bilateral absent — ominous sign"]},
            ].map(q=>{
              const val=data[q.id]||""; const alarm=val.includes("unreactive")||val.includes("absent")||val.includes("ominous");
              return(
                <div key={q.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 12px",background:alarm?"rgba(255,77,109,0.08)":C.s2,border:`1px solid ${alarm?C.red:C.border}`,borderRadius:8,marginBottom:6}}>
                  <span style={{fontSize:"0.76rem",color:alarm?C.red:C.text,fontWeight:alarm?600:400}}>{alarm&&"🔴 "}{q.label}</span>
                  <select value={val} onChange={e=>set(q.id,e.target.value)} style={{...inp,width:"auto",minWidth:130,flexShrink:0,borderColor:alarm?C.red:C.border}}>
                    {q.options.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ASIA SCALE — Spinal Cord Injury Classification ── */}
      {tab==="asia"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
            {sectionHead("ASIA Impairment Scale — Spinal Cord Injury Classification")}
            <button type="button" onClick={()=>setShowAsiaGuide(p=>!p)}
              style={{padding:"7px 16px",borderRadius:20,border:`2px solid ${C.a2}`,background:showAsiaGuide?"rgba(127,90,240,0.18)":"rgba(127,90,240,0.07)",color:C.a2,fontWeight:800,fontSize:"0.73rem",cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0,transition:"all 0.15s"}}>
              {showAsiaGuide?"▲ Hide Guide":"📋 How to Perform & Score"}
            </button>
          </div>
          {showAsiaGuide&&<div style={{background:"rgba(127,90,240,0.07)",border:`1px solid ${C.a2}30`,borderRadius:12,padding:"16px 18px",marginBottom:16}}>
            <div style={{fontWeight:800,color:C.a2,marginBottom:10,fontSize:"0.85rem"}}>🦾 ASIA / ISNCSCI — International Standards for Neurological Classification of SCI</div>

            {/* What is ASIA */}
            <div style={{fontSize:"0.75rem",color:C.muted,lineHeight:1.7,marginBottom:14,padding:"10px 13px",background:"rgba(127,90,240,0.08)",borderRadius:8}}>
              <strong style={{color:C.a2}}>What is it?</strong> The ASIA Impairment Scale (AIS) is the international gold standard for classifying spinal cord injury severity. It grades injury from A (complete) to E (normal). Always use the full ISNCSCI worksheet for a valid classification.
              <br/><strong style={{color:C.a2}}>Who performs it?</strong> Trained clinician (physio, doctor, or nurse). Takes 20–30 minutes for a full exam. Requires patient cooperation. Can be performed from 72 hours post-injury once spinal shock resolves.
            </div>

            {/* How to Perform — Step by Step */}
            <div style={{fontWeight:700,color:C.text,marginBottom:8,fontSize:"0.78rem"}}>📋 HOW TO PERFORM — Step-by-Step</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[
                {step:"1",title:"Position & Explain",color:C.accent,content:"• Patient supine or seated\n• Explain entire test before starting\n• Ensure privacy for sacral exam\n• Have ISNCSCI worksheet ready\n• Begin at least 72h post-injury (avoid spinal shock phase)"},
                {step:"2",title:"Sensory — Light Touch (LT)",color:C.yellow,content:"• Use cotton wisp or fingertip\n• Test ALL 28 bilateral key points\n• Score: 0=Absent, 1=Altered, 2=Normal, NT=Not Testable\n• Always compare to C2 (forehead) as reference normal\n• Eyes closed; ask 'same or different to here?'"},
                {step:"3",title:"Sensory — Pin Prick (PP)",color:C.red,content:"• Use disposable safety pin\n• Test same 28 bilateral key points\n• Same scoring: 0/1/2/NT\n• Ask 'sharp or dull?' for each\n• NEVER draw blood; use gentle pressure"},
                {step:"4",title:"Motor — 10 Key Muscles",color:C.a2,content:"• Test bilaterally: C5 C6 C7 C8 T1 (upper) + L2 L3 L4 L5 S1 (lower)\n• MRC scale 0–5/5\n• Gravity-eliminated position for scores 0–2\n• Active resistance for scores 3–5\n• Record each side separately"},
                {step:"5",title:"Sacral Exam — Critical",color:"#ff8c42",content:"• VAC: finger in anus → ask to squeeze voluntarily\n• DAP: apply deep pressure to anorectal wall → any sensation?\n• S4/5 sensation: perianal light touch + pin prick\n• ANY sacral sparing = INCOMPLETE injury (AIS B/C/D)\n• This step determines AIS A vs all others"},
                {step:"6",title:"Determine NLI & AIS Grade",color:C.a3,content:"• NLI = most caudal level with normal motor AND sensory bilaterally\n• Must be 5/5 motor + normal sensation at that level\n• Level above NLI must also be 5/5 & normal\n• Apply AIS decision algorithm (A→E)\n• Document: NLI right + left + AIS grade"},
              ].map(s=>(
                <div key={s.step} style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:"0.72rem",color:"#1a1025",flexShrink:0}}>{s.step}</div>
                    <div style={{fontWeight:700,color:s.color,fontSize:"0.73rem"}}>{s.title}</div>
                  </div>
                  <div style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.7,whiteSpace:"pre-line"}}>{s.content}</div>
                </div>
              ))}
            </div>

            {/* How Marking is Done */}
            <div style={{fontWeight:700,color:C.text,marginBottom:8,fontSize:"0.78rem"}}>📊 HOW MARKING IS DONE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.yellow,marginBottom:6,fontSize:"0.72rem"}}>Motor Scoring (MRC 0–5)</div>
                <div style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.8}}>
                  <span style={{color:C.green}}>5/5</span> — Normal: full power vs resistance<br/>
                  <span style={{color:"#a3e635"}}>4/5</span> — Good: movement vs some resistance<br/>
                  <span style={{color:C.yellow}}>3/5</span> — Fair: full range AGAINST gravity only<br/>
                  <span style={{color:"#f97316"}}>2/5</span> — Poor: full range WITH gravity eliminated<br/>
                  <span style={{color:C.red}}>1/5</span> — Trace: palpable/visible contraction only<br/>
                  <span style={{color:C.red}}>0/5</span> — Zero: no contraction whatsoever<br/>
                  <div style={{marginTop:6,color:C.accent,fontWeight:600}}>Max Motor Score: 100 (50 UE + 50 LE)</div>
                </div>
              </div>
              <div style={{background:C.s3,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:700,color:C.accent,marginBottom:6,fontSize:"0.72rem"}}>Sensory Scoring (LT & PP)</div>
                <div style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.8}}>
                  <span style={{color:C.green}}>2</span> — Normal: same as reference site<br/>
                  <span style={{color:C.yellow}}>1</span> — Altered: detectable but impaired<br/>
                  <span style={{color:C.red}}>0</span> — Absent: no sensation detected<br/>
                  <span style={{color:C.muted}}>NT</span> — Not Testable: cast, wound, amputation<br/>
                  <div style={{marginTop:6,color:C.accent,fontWeight:600}}>Max Sensory Score: 224 (112 LT + 112 PP)</div>
                  <div style={{marginTop:3,fontSize:"0.65rem",color:C.muted}}>28 key points × 2 sides × 2 modalities = 112 per modality</div>
                </div>
              </div>
            </div>

            {/* AIS Decision Algorithm */}
            <div style={{background:C.s3,borderRadius:8,padding:"11px 13px",marginBottom:10}}>
              <div style={{fontWeight:700,color:C.a2,marginBottom:8,fontSize:"0.73rem"}}>🔑 AIS DECISION ALGORITHM</div>
              <div style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.9}}>
                <span style={{color:C.red,fontWeight:700}}>Step 1:</span> Is there any sacral sparing (S4/5 sensation, VAC, or DAP)?<br/>
                → <strong style={{color:C.red}}>NO sacral sparing → AIS A (Complete)</strong><br/>
                → <strong style={{color:"#ff8c42"}}>YES sacral sparing → go to Step 2</strong><br/>
                <span style={{color:"#ff8c42",fontWeight:700}}>Step 2:</span> Is there any motor function more than 3 levels below the motor level?<br/>
                → <strong style={{color:"#ff8c42"}}>NO → AIS B (Sensory Incomplete)</strong><br/>
                → <strong style={{color:C.yellow}}>YES → go to Step 3</strong><br/>
                <span style={{color:C.yellow,fontWeight:700}}>Step 3:</span> Is at least half the key muscles below NLI graded ≥3/5?<br/>
                → <strong style={{color:C.yellow}}>NO (majority &lt;3) → AIS C (Motor Incomplete)</strong><br/>
                → <strong style={{color:C.a3}}>YES (majority ≥3) → AIS D (Motor Incomplete — functional)</strong><br/>
                <span style={{color:C.green,fontWeight:700}}>Special:</span> If all segments normal but patient had prior SCI deficits → <strong style={{color:C.green}}>AIS E</strong>
              </div>
            </div>

            <div style={{background:"rgba(0,229,255,0.07)",borderRadius:8,padding:"8px 12px",fontSize:"0.68rem",color:C.text,borderLeft:`3px solid ${C.accent}`}}>
              <strong style={{color:C.accent}}>⚡ Key Rules:</strong> (1) Spinal shock can mimic AIS A — repeat exam at 72h and 1 month. (2) Sacral exam is MANDATORY — it changes the AIS grade. (3) NLI is determined by motor AND sensory together. (4) Always document both left and right NLI separately. (5) ZPP (Zone of Partial Preservation) only applies to AIS A.
            </div>
          </div>

          }
          {/* ASIA Grade Selector */}
          <div style={{marginBottom:14}}>
            {sectionHead("ASIA Impairment Grade")}
            {[
              {grade:"A",label:"Complete — No Sensory or Motor Function",color:C.red,desc:"No sensory or motor function preserved in sacral segments S4–S5. No sacral sparing."},
              {grade:"B",label:"Sensory Incomplete",color:"#ff8c42",desc:"Sensory but NOT motor function preserved below neurological level AND through sacral segments S4–S5. No motor function more than 3 levels below motor level on either side."},
              {grade:"C",label:"Motor Incomplete — More than Half Weak",color:C.yellow,desc:"Motor function preserved at or below neurological level. More than half of key muscles below NLI grade <3 (cannot move against gravity)."},
              {grade:"D",label:"Motor Incomplete — More than Half Active",color:C.a3,desc:"Motor function preserved at or below neurological level. At least half of key muscles below NLI grade ≥3 (moves against gravity)."},
              {grade:"E",label:"Normal — Motor & Sensory Normal",color:C.green,desc:"Sensory and motor function normal in all segments. Patient had prior SCI deficits. AIS E only assigned if prior deficits existed."},
            ].map(g=>{
              const sel=data["asia_grade"]===g.grade;
              return(
                <div key={g.grade} onClick={()=>set("asia_grade",g.grade)} style={{cursor:"pointer",padding:"11px 13px",borderRadius:10,background:sel?`${g.color}15`:C.s2,border:`2px solid ${sel?g.color:C.border}`,marginBottom:7,transition:"all 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:sel?g.color:C.s3,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:"1rem",color:sel?"#faf8fc":g.color,border:`2px solid ${g.color}`,flexShrink:0,transition:"all 0.15s"}}>{g.grade}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:sel?g.color:C.text,fontSize:"0.82rem"}}>{g.label}</div>
                      <div style={{fontSize:"0.7rem",color:C.muted,lineHeight:1.5,marginTop:2}}>{g.desc}</div>
                    </div>
                    {sel&&<span style={{color:g.color,fontSize:"1.1rem",flexShrink:0}}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Neurological Level of Injury */}
          <div style={{marginBottom:14}}>
            {sectionHead("Neurological Level of Injury (NLI)")}
            <div style={{fontSize:"0.72rem",color:C.muted,marginBottom:10,lineHeight:1.6,padding:"8px 11px",background:C.s2,borderRadius:8}}>The most caudal segment with NORMAL sensory AND motor function bilaterally. Determined by the most caudal key muscle graded ≥3/5 with the segment above graded 5/5, and normal sensation at that level.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {id:"asia_nli_right",label:"NLI — Right Side"},
                {id:"asia_nli_left",label:"NLI — Left Side"},
              ].map(f=>(
                <div key={f.id}>
                  <label style={{fontSize:"0.62rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4,display:"block"}}>{f.label}</label>
                  <select value={data[f.id]||""} onChange={e=>set(f.id,e.target.value)} style={inp}>
                    <option value="">— select level —</option>
                    {["C1","C2","C3","C4","C5","C6","C7","C8","T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12","L1","L2","L3","L4","L5","S1","S2","S3","S4-5","Intact"].map(l=><option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* ASIA Key Muscles — Motor */}
          <div style={{marginBottom:14}}>
            {sectionHead("Key Muscles — Motor Scoring (0–5/5)")}
            <div style={{fontSize:"0.72rem",color:C.muted,marginBottom:10,lineHeight:1.6,padding:"8px 11px",background:C.s2,borderRadius:8}}>ISNCSCI 10 key muscle groups tested bilaterally. Score 0–5 using MRC scale. Total Motor Score: Upper Extremity (0–50) + Lower Extremity (0–50) = Max 100.</div>
            {[
              {level:"C5",label:"Elbow Flexors",muscle:"Biceps, brachialis",test:"Resist elbow flexion with forearm supinated"},
              {level:"C6",label:"Wrist Extensors",muscle:"ECRL + ECRB",test:"Resist wrist extension with fist clenched"},
              {level:"C7",label:"Elbow Extensors",muscle:"Triceps",test:"Resist elbow extension from 90° flexion"},
              {level:"C8",label:"Finger Flexors",muscle:"FDP (middle finger)",test:"Resist distal phalanx flexion of middle finger"},
              {level:"T1",label:"Finger Abductors",muscle:"ADM (little finger)",test:"Resist little finger abduction with hand flat"},
              {level:"L2",label:"Hip Flexors",muscle:"Iliopsoas",test:"Resist hip flexion from 90° (seated)"},
              {level:"L3",label:"Knee Extensors",muscle:"Quadriceps",test:"Resist knee extension from 90° (seated)"},
              {level:"L4",label:"Ankle Dorsiflexors",muscle:"Tibialis anterior",test:"Resist ankle dorsiflexion"},
              {level:"L5",label:"Long Toe Extensors",muscle:"EHL",test:"Resist great toe extension"},
              {level:"S1",label:"Ankle Plantarflexors",muscle:"Gastrocnemius/Soleus",test:"Standing single heel raise × 10 or resist plantarflexion"},
            ].map(m=>{
              const idL="asia_motor_"+m.level.toLowerCase()+"_left", idR="asia_motor_"+m.level.toLowerCase()+"_right";
              const lv=data[idL]||"", rv=data[idR]||"";
              const lCol=getStrengthColor(lv), rCol=getStrengthColor(rv);
              return(
                <div key={m.level} style={{background:C.surface,border:`1px solid ${(lv&&!lv.startsWith("5"))||(rv&&!rv.startsWith("5"))?C.yellow+"50":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
                    <div>
                      <span style={{fontWeight:800,color:C.a2,marginRight:8}}>{m.level}</span>
                      <span style={{fontWeight:600,color:C.text,fontSize:"0.82rem"}}>{m.label}</span>
                      <div style={{fontSize:"0.67rem",color:C.muted,marginTop:2}}>{m.muscle} — {m.test}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[["_left","LEFT",lv,lCol,idL],["_right","RIGHT",rv,rCol,idR]].map(([sfx,side,sv,col,id])=>(
                      <div key={sfx}>
                        <div style={{fontSize:"0.62rem",fontWeight:700,color:col,marginBottom:3}}>{side} {sv&&!sv.startsWith("5")?"⚠":""}</div>
                        <select value={sv} onChange={e=>set(id,e.target.value)} style={{...inp,borderColor:sv&&!sv.startsWith("5")?col:C.border}}>
                          <option value="">—</option>
                          {STRENGTH_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sensory Key Points */}
          <div style={{marginBottom:14}}>
            {sectionHead("Key Sensory Points — Light Touch & Pin Prick")}
            <div style={{fontSize:"0.72rem",color:C.muted,marginBottom:10,lineHeight:1.6,padding:"8px 11px",background:C.s2,borderRadius:8}}>Score each: 0=Absent, 1=Altered/Impaired, 2=Normal, NT=Not testable. Sacral S4–5 key point = perianal area (assess separately). Total Sensory Score: LT max 112 + PP max 112 = 224.</div>
            {[
              {level:"C2",point:"Occipital protuberance"},
              {level:"C3",point:"Supraclavicular fossa"},
              {level:"C4",point:"Top of AC joint"},
              {level:"C5",point:"Lateral antecubital fossa"},
              {level:"C6",point:"Thumb, dorsal surface"},
              {level:"C7",point:"Middle finger, dorsal"},
              {level:"C8",point:"Little finger, dorsal"},
              {level:"T1",point:"Medial antecubital fossa"},
              {level:"T4",point:"4th intercostal (nipple level)"},
              {level:"T10",point:"10th intercostal (umbilicus)"},
              {level:"L1",point:"Half-way inguinal + T12"},
              {level:"L2",point:"Mid anterior thigh"},
              {level:"L3",point:"Medial femoral condyle"},
              {level:"L4",point:"Medial malleolus"},
              {level:"L5",point:"3rd MTP joint dorsum"},
              {level:"S1",point:"Lateral heel"},
              {level:"S3",point:"Medial ischial tuberosity"},
              {level:"S4-5",point:"Perianal area — 1cm lateral to mucocutaneous junction"},
            ].map(kp=>{
              const idLT_L="asia_lt_"+kp.level.replace("-","_").toLowerCase()+"_left";
              const idLT_R="asia_lt_"+kp.level.replace("-","_").toLowerCase()+"_right";
              const ltl=data[idLT_L]||"", ltr=data[idLT_R]||"";
              const isSacral=kp.level==="S4-5";
              const ltOpts=["NT","0 — Absent","1 — Altered","2 — Normal"];
              return(
                <div key={kp.level} style={{background:C.surface,border:`1.5px solid ${isSacral?C.red+"50":C.border}`,borderRadius:9,padding:"9px 12px",marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8,flexWrap:"wrap"}}>
                    <div>
                      <span style={{fontWeight:800,color:isSacral?C.red:C.a2,marginRight:7}}>{kp.level}</span>
                      <span style={{fontSize:"0.76rem",color:C.text}}>{kp.point}</span>
                      {isSacral&&<span style={{marginLeft:8,fontSize:"0.6rem",padding:"1px 7px",borderRadius:8,background:"rgba(255,77,109,0.2)",color:C.red,fontWeight:700}}>SACRAL SPARING</span>}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,fontSize:"0.68rem"}}>
                    <div><div style={{color:C.muted,marginBottom:3}}>LT Left</div><select value={ltl} onChange={e=>set(idLT_L,e.target.value)} style={{...inp,padding:"5px 7px",fontSize:"0.68rem"}}>{ltOpts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                    <div><div style={{color:C.muted,marginBottom:3}}>LT Right</div><select value={ltr} onChange={e=>set(idLT_R,e.target.value)} style={{...inp,padding:"5px 7px",fontSize:"0.68rem"}}>{ltOpts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                    <div><div style={{color:C.muted,marginBottom:3}}>PP Left</div><select value={data["asia_pp_"+kp.level.replace("-","_").toLowerCase()+"_left"]||""} onChange={e=>set("asia_pp_"+kp.level.replace("-","_").toLowerCase()+"_left",e.target.value)} style={{...inp,padding:"5px 7px",fontSize:"0.68rem"}}>{ltOpts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                    <div><div style={{color:C.muted,marginBottom:3}}>PP Right</div><select value={data["asia_pp_"+kp.level.replace("-","_").toLowerCase()+"_right"]||""} onChange={e=>set("asia_pp_"+kp.level.replace("-","_").toLowerCase()+"_right",e.target.value)} style={{...inp,padding:"5px 7px",fontSize:"0.68rem"}}>{ltOpts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sacral Sparing + VAC/DAP */}
          <div style={{marginBottom:14}}>
            {sectionHead("Sacral Sparing & Voluntary Function (S4–S5)")}
            <div style={{fontSize:"0.72rem",color:C.red,fontWeight:600,marginBottom:10,padding:"8px 12px",background:"rgba(255,77,109,0.08)",borderRadius:8,border:`1px solid ${C.red}30`}}>
              ⚠️ Sacral sparing = any sensory or motor function preserved at S4–S5. CRITICAL for AIS A vs B classification and prognosis.
            </div>
            {[
              {id:"asia_vac",label:"VAC — Voluntary Anal Contraction",desc:"Patient instructed to squeeze anal sphincter around examiner's finger. Any voluntary contraction = motor incomplete.",options:["Not tested","Absent — no voluntary contraction (AIS A/B)","Present — voluntary contraction felt (motor incomplete)"]},
              {id:"asia_dap",label:"DAP — Deep Anal Pressure",desc:"Apply pressure to anorectal wall. Any sensation = sensory sacral sparing.",options:["Not tested","Absent — no deep anal sensation","Present — some sensation felt (sensory sparing)"]},
              {id:"asia_sacral_sensation",label:"S4–S5 Perianal Sensation",desc:"Light touch and pin prick perianal. Score as 0/1/2 per standard sensory scoring.",options:["Not tested","0 — Absent bilaterally","1 — Altered (impaired sensation present)","2 — Normal bilaterally"]},
            ].map(q=>{
              const val=data[q.id]||""; const present=val.includes("Present")||val.includes("Normal")||val.includes("1 —")||val.includes("2 —");
              const absent=val.includes("Absent")||val.includes("0 —");
              return(
                <div key={q.id} style={{background:C.surface,border:`1.5px solid ${present?C.green:absent?C.red:C.border}`,borderRadius:10,padding:"11px 13px",marginBottom:8}}>
                  <div style={{fontWeight:700,color:C.text,marginBottom:3}}>{q.label}</div>
                  <div style={{fontSize:"0.7rem",color:C.muted,marginBottom:8,lineHeight:1.5}}>{q.desc}</div>
                  <select value={val} onChange={e=>set(q.id,e.target.value)} style={{...inp,borderColor:present?C.green:absent?C.red:C.border}}>
                    {q.options.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                  {present&&<div style={{marginTop:7,fontSize:"0.72rem",color:C.green,fontWeight:600}}>✅ Sacral sparing present → SCI is INCOMPLETE</div>}
                  {absent&&<div style={{marginTop:7,fontSize:"0.72rem",color:C.red,fontWeight:600}}>🔴 No sacral sparing at this level</div>}
                </div>
              );
            })}
          </div>

          {/* ASIA Classification Summary */}
          {(()=>{
            const grade=data["asia_grade"]||"";
            const nliR=data["asia_nli_right"]||"", nliL=data["asia_nli_left"]||"";
            const vac=data["asia_vac"]||"", dap=data["asia_dap"]||"";
            if(!grade) return null;
            const gradeColor={A:C.red,B:"#ff8c42",C:C.yellow,D:C.a3,E:C.green}[grade]||C.muted;
            const prognosis={
              A:"Complete injury. Significant motor recovery below lesion is unlikely without intervention. Focus: pressure injury prevention, respiratory management, adaptive rehabilitation, independence maximisation.",
              B:"Sensory incomplete. 50–60% may convert to motor incomplete (C/D) with intensive rehabilitation. Neuroplasticity-focused therapy: locomotor training, FES, robotic-assisted gait.",
              C:"Motor incomplete — majority weak. With intensive rehabilitation, majority improve. Aquatic therapy, locomotor training, upper limb FES, goal: functional ambulation.",
              D:"Motor incomplete — majority functional. Excellent prognosis for community ambulation. Focus: gait retraining, balance, endurance, return to function.",
              E:"Neurological recovery to normal. Continue monitoring. Remaining deficits may be functional or psychosocial.",
            }[grade]||"";
            return(
              <div style={{background:`${gradeColor}12`,border:`2px solid ${gradeColor}`,borderRadius:14,padding:"16px 18px",marginTop:4}}>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                  <div style={{width:50,height:50,borderRadius:"50%",background:gradeColor,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:"1.5rem",color:"#1a1025",flexShrink:0}}>
                    {grade}
                  </div>
                  <div>
                    <div style={{fontWeight:800,fontSize:"0.95rem",color:gradeColor}}>AIS Grade {grade}</div>
                    {(nliR||nliL)&&<div style={{fontSize:"0.75rem",color:C.muted,marginTop:2}}>NLI: R={nliR||"—"} L={nliL||"—"}</div>}
                    {vac&&<div style={{fontSize:"0.7rem",color:C.muted}}>VAC: {vac.includes("Present")?"✅ Present":"🔴 Absent"} | DAP: {dap.includes("Present")?"✅ Present":"🔴 Absent"}</div>}
                  </div>
                </div>
                <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.7,padding:"10px 12px",background:"rgba(0,0,0,0.2)",borderRadius:8}}>
                  <strong style={{color:gradeColor}}>Prognosis & Rehabilitation Approach:</strong><br/>{prognosis}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── RED FLAGS ── */}
      {tab==="redflags"&&(
        <div>
          {sectionHead("Neurological Red Flags — Screening Checklist")}
          <div style={{background:"rgba(255,77,109,0.08)",border:`1px solid ${C.red}40`,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:"0.76rem",color:C.muted,lineHeight:1.6}}>
            <strong style={{color:C.red}}>⚠️ IMPORTANT:</strong> Any positive red flag requires immediate action. Do NOT commence physiotherapy treatment until red flags are cleared or appropriately managed.
          </div>
          {RED_FLAGS_NEURO.map(rf=>{
            const val = data[rf.id]||"";
            const active = val==="Present";
            const isEmerg = rf.severity==="EMERGENCY";
            return(
              <div key={rf.id} style={{background:active?(isEmerg?"rgba(255,77,109,0.15)":"rgba(255,179,0,0.1)"):C.surface, border:`1.5px solid ${active?(isEmerg?C.red:C.yellow):C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8,transition:"all 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:"1rem"}}>{rf.icon}</span>
                      <span style={{fontWeight:800,color:isEmerg?C.red:C.yellow,fontSize:"0.84rem"}}>{rf.label}</span>
                      <span style={{fontSize:"0.6rem",padding:"1px 7px",borderRadius:8,fontWeight:700,background:isEmerg?"rgba(255,77,109,0.2)":"rgba(255,179,0,0.2)",color:isEmerg?C.red:C.yellow}}>{rf.severity}</span>
                    </div>
                    <div style={{fontSize:"0.74rem",color:C.muted,marginBottom:6,lineHeight:1.5}}>{rf.description}</div>
                    {active&&<div style={{padding:"6px 10px",borderRadius:6,background:isEmerg?"rgba(255,77,109,0.15)":"rgba(255,179,0,0.1)",fontSize:"0.74rem",color:isEmerg?C.red:C.yellow,fontWeight:600}}>→ {rf.action}</div>}
                  </div>
                  <select value={val} onChange={e=>set(rf.id,e.target.value)} style={{...inp,width:"auto",minWidth:110,flexShrink:0,borderColor:active?(isEmerg?C.red:C.yellow):C.border}}>
                    <option value="">— screen —</option>
                    <option value="Cleared">✓ Cleared</option>
                    <option value="Present">🔴 Present</option>
                    <option value="Uncertain">⚠ Uncertain</option>
                  </select>
                </div>
              </div>
            );
          })}

          {/* Additional manual flags */}
          <div style={{marginTop:14}}>
            {sectionHead("Additional Screening Questions")}
            {[
              {id:"nq_bladder",label:"New onset bladder dysfunction (retention or incontinence)?"},
              {id:"nq_bowel",label:"New onset bowel dysfunction?"},
              {id:"nq_saddle",label:"Perineal / saddle area numbness or tingling?"},
              {id:"nq_bilateral_legs",label:"Bilateral leg weakness or paraesthesia?"},
              {id:"nq_gait_change",label:"Recent unexplained change in gait / balance?"},
              {id:"nq_drop_attacks",label:"Drop attacks or sudden falls?"},
              {id:"nq_diplopia",label:"Double vision, dysphagia, or dysarthria?"},
            ].map(q=>{
              const val=data[q.id]||"";
              const alarm=val==="Yes";
              return(
                <div key={q.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 12px",background:alarm?"rgba(255,77,109,0.1)":C.s2,border:`1px solid ${alarm?C.red:C.border}`,borderRadius:8,marginBottom:6}}>
                  <span style={{fontSize:"0.76rem",color:alarm?C.red:C.text,fontWeight:alarm?600:400,lineHeight:1.4,flex:1}}>{alarm&&"🔴 "}{q.label}</span>
                  <select value={val} onChange={e=>set(q.id,e.target.value)} style={{...inp,width:"auto",minWidth:90,flexShrink:0,borderColor:alarm?C.red:C.border}}>
                    <option value="">—</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Unsure">Unsure</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CLINICAL REASONING ── */}
      {tab==="reasoning"&&(
        <div>
          {sectionHead("Clinical Reasoning Engine — Nerve Root Pattern Analysis")}
          {reasoningOutput.patterns.length===0?(
            <div style={{textAlign:"center",padding:30,color:C.muted}}>
              <div style={{fontSize:"2rem",marginBottom:8}}>🧠</div>
              <div>Complete dermatomes, myotomes, reflexes and neural tension tests to generate clinical pattern analysis.</div>
            </div>
          ):(
            <>
              {/* Interpretations */}
              {reasoningOutput.interpretations.map((interp,i)=>(
                <div key={i} style={{background:C.surface,border:`1.5px solid ${interp.color}60`,borderLeft:`4px solid ${interp.color}`,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                  <div style={{fontWeight:800,color:interp.color,marginBottom:6,fontSize:"0.88rem"}}>{interp.title}</div>
                  <div style={{fontSize:"0.78rem",color:C.text,lineHeight:1.6,marginBottom:8}}>{interp.text}</div>
                  <div style={{fontSize:"0.72rem",color:interp.color,fontWeight:600,padding:"5px 10px",background:`${interp.color}12`,borderRadius:6}}>→ Recommended Action: {interp.action}</div>
                </div>
              ))}

              {/* Findings by level */}
              <div style={{marginTop:14}}>{sectionHead("Findings by Spinal Level")}</div>
              {reasoningOutput.patterns.map((p,i)=>(
                <div key={i} style={{background:C.s2,borderRadius:10,padding:"10px 14px",marginBottom:8}}>
                  <div style={{fontWeight:700,color:C.accent,marginBottom:6,fontSize:"0.85rem"}}>{p.level} {p.disc&&`— disc ${p.disc}`}</div>
                  {p.findings.map((f,j)=>(
                    <div key={j} style={{display:"flex",gap:8,marginBottom:4,fontSize:"0.76rem",color:C.text}}>
                      <span style={{color:f.type.includes("Pathological")||f.type.includes("Tension")?C.red:f.type==="Sensory"?C.yellow:C.a3,fontWeight:600,flexShrink:0}}>{f.type}:</span>
                      <span style={{color:C.muted}}>{f.detail}</span>
                    </div>
                  ))}
                  {/* Nerve root reference */}
                  {NERVE_ROOT_MAP[p.level]&&(
                    <div style={{marginTop:8,padding:"7px 10px",background:C.s3,borderRadius:7,fontSize:"0.72rem",color:C.muted}}>
                      <strong style={{color:C.text}}>Expected full pattern: </strong>
                      Sensory → {NERVE_ROOT_MAP[p.level].dermSensory} |
                      Reflex → {NERVE_ROOT_MAP[p.level].reflex} |
                      Motor → {NERVE_ROOT_MAP[p.level].myotome} |
                      Peripheral differentials: {NERVE_ROOT_MAP[p.level].peripheral}
                    </div>
                  )}
                </div>
              ))}

              {/* Nerve root vs peripheral differentiation */}
              <div style={{marginTop:16}}>
                {sectionHead("Nerve Root vs Peripheral Nerve — Key Differentials")}
                {[
                  {feature:"Sensory distribution",root:"Dermatomal (follows nerve root map)",peripheral:"Nerve territory (median, ulnar, radial etc.)"},
                  {feature:"Reflex change",root:"Segmental — affects muscles of that root",peripheral:"Distal to lesion — no segmental pattern"},
                  {feature:"Weakness pattern",root:"Myotomal — multi-muscle same level",peripheral:"Muscles of that specific nerve"},
                  {feature:"Neural tension tests",root:"Positive (root tension)",peripheral:"May be positive (Tinel's, Phalen's for CTS)"},
                  {feature:"Pain character",root:"Radicular — shooting, burning, lancinating",peripheral:"Distribution-specific, often aching/burning"},
                  {feature:"Autonomic features",root:"Rare",peripheral:"More common (swelling, colour change)"},
                ].map((row,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 1.2fr",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.73rem"}}>
                    <div style={{color:C.accent,fontWeight:600}}>{row.feature}</div>
                    <div style={{color:C.text}}>{row.root}</div>
                    <div style={{color:C.muted}}>{row.peripheral}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Clinician Notes */}
          <div style={{marginTop:20}}>
            {sectionHead("Clinician Notes — Neurological")}
            <textarea
              value={clinicianNotes}
              onChange={e=>{ setClinicianNotes(e.target.value); set("neuro_clinician_notes",e.target.value); }}
              placeholder="Document clinical reasoning, pattern impressions, referral decisions, treatment plan rationale..."
              style={{...inp,resize:"vertical",minHeight:100,display:"block",lineHeight:1.6}}
            />
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// POSTURE CAMERA MODULE v2 — Professional Physiotherapy-Grade Pose Tracking
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Constants ────────────────────────────────────────────────────────────────
const POSE_CONNECTIONS = [
  [11,12],[11,13],[13,15],[12,14],[14,16],   // shoulders + arms
  [15,17],[15,19],[15,21],[17,19],            // left hand
  [16,18],[16,20],[16,22],[18,20],            // right hand
  [11,23],[12,24],[23,24],                    // torso
  [23,25],[25,27],[27,29],[29,31],[27,31],   // left leg
  [24,26],[26,28],[28,30],[30,32],[28,32],   // right leg
];

// ─── TrackingQualityEngine ────────────────────────────────────────────────────
function computeQuality(lm) {
  if (!lm) return { score: 0, warnings: [], ready: false, distanceHint: null };
  const v = (i) => lm[i] && lm[i].visibility > 0.5;
  const vis = (i) => lm[i]?.visibility || 0;
  const avgBody = lm.slice(11, 33).reduce((s, l) => s + (l?.visibility || 0), 0) / 22;
  const warnings = [];

  // Centering check
  const noseX = vis(0) > 0.3 ? lm[0].x : null;
  if (noseX !== null && (noseX < 0.3 || noseX > 0.7)) warnings.push({ text: "Center your body in frame", icon: "↔", color: "#ffb300", priority: 2 });

  // Distance via shoulder span
  let distanceHint = null;
  if (v(11) && v(12)) {
    const span = Math.abs(lm[11].x - lm[12].x);
    if (span > 0.5) { warnings.push({ text: "Too close — step back", icon: "⬅", color: "#ff4d6d", priority: 1 }); distanceHint = "back"; }
    else if (span < 0.1) { warnings.push({ text: "Too far — step closer", icon: "➡", color: "#ffb300", priority: 2 }); distanceHint = "closer"; }
    else if (lm[11].y < 0.08 || lm[12].y < 0.08) warnings.push({ text: "Lower camera to hip height", icon: "⬇", color: "#ffb300", priority: 3 });
  }

  // Visibility checks
  if (avgBody < 0.35) warnings.push({ text: "Low confidence — improve lighting", icon: "💡", color: "#ff4d6d", priority: 1 });
  if (!v(0)) warnings.push({ text: "Head not visible", icon: "👤", color: "#ff4d6d", priority: 1 });
  if (!v(11) || !v(12)) warnings.push({ text: "Shoulders not detected", icon: "🦴", color: "#ffb300", priority: 2 });
  if (!v(23) && !v(24)) warnings.push({ text: "Hips/ASIS not visible — step back", icon: "🦴", color: "#ff4d6d", priority: 1 });
  if (!v(7) && !v(8)) warnings.push({ text: "Ears not detected — check head angle", icon: "👂", color: "#ffb300", priority: 2 });
  if (!v(31) && !v(32)) warnings.push({ text: "Feet not visible — move camera back", icon: "👣", color: "#ffb300", priority: 2 });
  else if (!v(27) && !v(28)) warnings.push({ text: "Ankles out of frame", icon: "📏", color: "#ffb300", priority: 3 });

  const ready = v(0) && v(11) && v(12) && v(23) && v(24) && (v(27) || v(28)) && avgBody > 0.5;
  warnings.sort((a, b) => a.priority - b.priority);
  return { score: avgBody, warnings: warnings.slice(0, 3), ready, distanceHint };
}

// ─── AdaptiveSmoother — confidence-weighted EMA ───────────────────────────────
function createSmoother() {
  const buf = {};
  return (raw) => {
    if (!raw) return null;
    return raw.map((lm, i) => {
      if (!lm) return lm;
      const alpha = 0.2 + lm.visibility * 0.25; // high-confidence = faster response
      const prev = buf[i];
      if (!prev) { buf[i] = { ...lm }; return { ...lm }; }
      const s = { x: prev.x*(1-alpha)+lm.x*alpha, y: prev.y*(1-alpha)+lm.y*alpha, z: prev.z*(1-alpha)+lm.z*alpha, visibility: lm.visibility };
      buf[i] = s; return s;
    });
  };
}

// ─── CalibrationSystem ────────────────────────────────────────────────────────
function CalibrationSystem({ state, countdown, quality }) {
  if (state !== TRACKING_STATES.CALIBRATING && state !== TRACKING_STATES.DETECTING) return null;
  const isCalib = state === TRACKING_STATES.CALIBRATING;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 10 }}>
      {isCalib ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid #00e5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 900, color: "#00e5ff", background: "rgba(6,9,15,0.75)", margin: "0 auto 10px", boxShadow: "0 0 24px rgba(0,229,255,0.4)" }}>{countdown}</div>
          <div style={{ fontSize: "0.78rem", color: "#00e5ff", fontWeight: 700, background: "rgba(6,9,15,0.7)", padding: "4px 14px", borderRadius: 20 }}>Stand still — calibrating…</div>
        </div>
      ) : (
        quality.ready ? null : (
          <div style={{ background: "rgba(6,9,15,0.78)", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "0.76rem", color: "#6b8399", fontWeight: 600 }}>Position yourself in frame</div>
          </div>
        )
      )}
    </div>
  );
}

// ─── SkeletonRenderer — Full analysis overlay (head, ASIS, pelvis, lumbar, PSIS) ──
function SkeletonRenderer({ canvasRef, landmarks, videoSize, trackingState, activeView }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoSize) return;
    const ctx = canvas.getContext("2d");
    const { w, h } = videoSize;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    if (!landmarks || trackingState === TRACKING_STATES.LOST) return;

    // Use the full renderPostureOverlay for comprehensive landmark display:
    // head circle, eye level, C-spine, T-spine, L-spine, ASIS rings,
    // pelvis/PSIS in all views, lumbar label, heatmap, skeleton, grid, plumb line
    try {
      const measurements = (() => {
        try { return AdvancedMeasurementEngine(landmarks, null); } catch { return {}; }
      })();
      ctx.save();
      ctx.globalAlpha = trackingState === TRACKING_STATES.STABLE ? 1 : 0.6;
      renderPostureOverlay({
        ctx,
        W: w,
        H: h,
        lm: landmarks,
        measurements,
        showHeatmap: trackingState === TRACKING_STATES.STABLE,
        showLabels: true,
        showGrid: true,
        view: activeView || "anterior",
      });
      ctx.restore();
    } catch(e) {
      // Fallback: basic skeleton if renderPostureOverlay not yet available
      console.warn("SkeletonRenderer fallback:", e);
    }
    ctx.shadowBlur = 0;
  }, [landmarks, videoSize, trackingState, activeView, canvasRef]);
  return null;
}

// ─── BodyAlignmentGuide — Professional physiotherapy overlay ──────────────────
function BodyAlignmentGuide({ show, ready }) {
  if (!show) return null;
  const op = ready ? 0.18 : 0.42;
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet">
      {/* Background grid — alignment reference */}
      {[16.6,33.3,50,66.6,83.3].map(x=><line key={x} x1={x} y1="0" x2={x} y2="150" stroke="#00e5ff" strokeWidth="0.18" strokeDasharray="2,4" opacity={op*0.5}/>)}
      {[18.75,37.5,56.25,75,93.75].map(y=><line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#00e5ff" strokeWidth="0.18" strokeDasharray="2,4" opacity={op*0.5}/>)}

      {/* Vertical plumb line */}
      <line x1="50" y1="3" x2="50" y2="147" stroke="#00e5ff" strokeWidth="0.7" strokeDasharray="3,2.5" opacity={op*1.4}/>

      {/* Head silhouette */}
      <ellipse cx="50" cy="13" rx="7.5" ry="9" fill="none" stroke="#00e5ff" strokeWidth="0.8" opacity={op*1.5}/>

      {/* Shoulder symmetry bar */}
      <line x1="26" y1="27" x2="74" y2="27" stroke="#7f5af0" strokeWidth="0.7" opacity={op*1.4}/>
      <circle cx="26" cy="27" r="1.2" fill="#7f5af0" opacity={op*1.4}/>
      <circle cx="74" cy="27" r="1.2" fill="#7f5af0" opacity={op*1.4}/>

      {/* Torso outline */}
      <path d="M32,27 L28,70 L36,70 L38,95 M68,27 L72,70 L64,70 L62,95" fill="none" stroke="#7f5af040" strokeWidth="0.5" opacity={op}/>

      {/* Hip symmetry bar */}
      <line x1="34" y1="70" x2="66" y2="70" stroke="#00c97a" strokeWidth="0.7" opacity={op*1.4}/>
      <circle cx="34" cy="70" r="1.2" fill="#00c97a" opacity={op*1.4}/>
      <circle cx="66" cy="70" r="1.2" fill="#00c97a" opacity={op*1.4}/>

      {/* Knee level bar */}
      <line x1="36" y1="102" x2="64" y2="102" stroke="#ffb300" strokeWidth="0.5" strokeDasharray="2,2" opacity={op}/>

      {/* Ankle level bar */}
      <line x1="37" y1="126" x2="63" y2="126" stroke="#ffb300" strokeWidth="0.5" strokeDasharray="2,2" opacity={op}/>

      {/* Foot stand-here ellipses */}
      <ellipse cx="38" cy="140" rx="8" ry="3.5" fill="rgba(0,201,122,0.07)" stroke="#00c97a" strokeWidth="0.9" opacity={op*1.2}/>
      <ellipse cx="62" cy="140" rx="8" ry="3.5" fill="rgba(0,201,122,0.07)" stroke="#00c97a" strokeWidth="0.9" opacity={op*1.2}/>

      {/* "STAND HERE" label */}
      {!ready && <text x="50" y="148" textAnchor="middle" fontSize="4.2" fill="#00c97a" fontWeight="bold" opacity={op*1.6}>STAND HERE</text>}

      {/* Corner crosshair markers */}
      {[[10,10],[90,10],[10,140],[90,140]].map(([cx,cy],i)=>(
        <g key={i} opacity={op}>
          <line x1={cx-4} y1={cy} x2={cx+4} y2={cy} stroke="#00e5ff" strokeWidth="0.6"/>
          <line x1={cx} y1={cy-4} x2={cx} y2={cy+4} stroke="#00e5ff" strokeWidth="0.6"/>
        </g>
      ))}
    </svg>
  );
}

// ─── TrackingStateBar ─────────────────────────────────────────────────────────
function TrackingStateBar({ state, quality }) {
  const cfg = {
    [TRACKING_STATES.IDLE]:       { label:"Camera Ready",      color:"#7e6a9a", pulse:false },
    [TRACKING_STATES.LOADING]:    { label:"Loading Model…",    color:"#7f5af0", pulse:true  },
    [TRACKING_STATES.CALIBRATING]:{ label:"Calibrating",       color:"#ffb300", pulse:true  },
    [TRACKING_STATES.DETECTING]:  { label:"Detecting Body…",   color:"#ffb300", pulse:true  },
    [TRACKING_STATES.STABLE]:     { label:"Tracking Stable",   color:"#00c97a", pulse:false },
    [TRACKING_STATES.LOST]:       { label:"Tracking Lost",     color:"#ff4d6d", pulse:true  },
  }[state] || { label:"—", color:"#7e6a9a", pulse:false };

  const qLabel = quality === null ? "" : quality > 0.75 ? "Excellent" : quality > 0.5 ? "Good" : quality > 0.3 ? "Fair" : "Poor";
  const qColor = quality === null ? "" : quality > 0.75 ? "#00c97a" : quality > 0.5 ? "#ffb300" : "#ff4d6d";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
        <span style={{ width:9, height:9, borderRadius:"50%", background:cfg.color, display:"inline-block", boxShadow:`0 0 ${cfg.pulse?8:4}px ${cfg.color}`, animation:cfg.pulse?"pcPulse 1.3s infinite":"none" }}/>
        <span style={{ fontSize:"0.76rem", fontWeight:700, color:cfg.color }}>{cfg.label}</span>
      </div>
      {quality !== null && (
        <span style={{ fontSize:"0.67rem", padding:"2px 9px", borderRadius:10, background:`${qColor}18`, color:qColor, fontWeight:700, border:`1px solid ${qColor}30` }}>Signal: {qLabel}</span>
      )}
      {state === TRACKING_STATES.STABLE && (
        <span style={{ fontSize:"0.67rem", padding:"2px 9px", borderRadius:10, background:"rgba(0,201,122,0.12)", color:"#00c97a", fontWeight:700, border:"1px solid rgba(0,201,122,0.25)", display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#00c97a", display:"inline-block", animation:"pcPulse 1.3s infinite" }}/> LIVE
        </span>
      )}
    </div>
  );
}

// ─── CameraView — Professional full-screen responsive camera preview ──────────
function CameraView({ videoRef, canvasRef, isActive, facingMode, children, onTapFocus, zoom }) {
  const flip = facingMode === "user" ? "scaleX(-1)" : "none";
  const [tapFlash, setTapFlash] = useState(null);

  const handleTap = useCallback((e) => {
    if (!isActive || !onTapFocus) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTapFlash({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setTapFlash(null), 700);
    onTapFocus(x, y);
  }, [isActive, onTapFocus]);

  return (
    <div
      className="pm-cam-aspect pm-camera-wrap"
      onClick={handleTap}
      style={{ position:"relative", width:"100%", background:"#f5f0fb", borderRadius:14, overflow:"hidden", aspectRatio:"3/4", maxHeight:"65vh", cursor: isActive ? "crosshair" : "default", touchAction:"manipulation" }}
    >
      {!isActive && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
          <div style={{ fontSize:"2.8rem" }}>📷</div>
          <div style={{ fontSize:"0.8rem", color:"#7e6a9a", textAlign:"center", padding:"0 20px", lineHeight:1.5 }}>Tap Start Camera to begin<br/>physiotherapy assessment</div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        style={{ width:"100%", height:"100%", objectFit:"contain", display:isActive?"block":"none",
          transform:`${flip} scale(${zoom||1})`, transformOrigin:"center center", transition:"transform 0.2s ease" }}
      />
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", transform:flip, objectFit:"contain" }}/>
      {/* Tap-to-focus flash ring */}
      {tapFlash && (
        <div style={{ position:"absolute", left:tapFlash.x-20, top:tapFlash.y-20, width:40, height:40, borderRadius:"50%", border:"2px solid #ffb300", pointerEvents:"none", animation:"tapFocus 0.6s ease-out forwards", zIndex:30 }}/>
      )}
      {children}
    </div>
  );
}

// ─── CameraControls — Professional touch-friendly physiotherapy controls ──────
function CameraControls({ isActive, isLoading, onStart, onStop, onFlip, onRecalibrate, facingMode, canRecalibrate, zoom, onZoom, countdownSecs, onCountdownChange, burstMode, onBurstToggle, activeView, onViewChange, onUploadPhoto }) {
  const views = ["anterior","posterior","left","right","photo"];
  const uploadRef = React.useRef(null);
  const Btn = ({ onClick, label, bg, disabled, sm }) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: sm ? "8px 12px" : "10px 16px",
      background: disabled ? "#1a2d45" : `linear-gradient(135deg,${bg},${bg}cc)`,
      border: "none", borderRadius: 10,
      color: disabled ? "#6b8399" : "#000", fontWeight: 800,
      fontSize: sm ? "0.68rem" : "0.77rem",
      cursor: disabled ? "not-allowed" : "pointer",
      flex: 1, minWidth: sm ? 70 : 90, transition: "opacity 0.2s", whiteSpace:"nowrap"
    }}>{label}</button>
  );
  return (
    <div style={{ marginTop:10 }}>
      {/* ── UPLOAD PHOTO BUTTON — Always visible at top ── */}
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file && onUploadPhoto) onUploadPhoto(file);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => uploadRef.current?.click()}
        style={{
          width:"100%", marginBottom:10,
          padding:"13px 16px",
          background: activeView==="photo"
            ? "linear-gradient(135deg,#7f5af0,#00e5ff)"
            : "transparent",
          border: activeView==="photo"
            ? "none"
            : "2px dashed rgba(127,90,240,0.55)",
          borderRadius:12,
          color: activeView==="photo" ? "#000" : "#7f5af0",
          fontWeight:800, fontSize:"0.82rem",
          cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:9,
          boxShadow: activeView==="photo" ? "0 4px 16px rgba(127,90,240,0.35)" : "none",
          transition:"all 0.2s"
        }}
      >
        <span style={{fontSize:"1.2rem"}}>📷</span>
        Upload Patient Photo
        <span style={{fontSize:"0.65rem",opacity:0.75,fontWeight:600}}>JPG / PNG</span>
      </button>
      {/* Front / Back camera toggle — always visible */}
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:"0.58rem", fontWeight:700, color:"#7e6a9a", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>📷 Camera</div>
        <div style={{ display:"flex", gap:6, marginBottom:8 }}>
          {/* Front camera */}
          <button
            onClick={() => { if(isActive && facingMode!=="user") onFlip(); else if(!isActive) onStart("user"); }}
            style={{
              flex:1, padding:"11px 8px", borderRadius:11, cursor:"pointer", fontWeight:800,
              fontSize:"0.75rem", display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              background: facingMode==="user" && isActive
                ? "linear-gradient(135deg,#00e5ff,#7f5af0)"
                : "rgba(0,229,255,0.08)",
              color: facingMode==="user" && isActive ? "#000" : "#00e5ff",
              border: facingMode==="user" && isActive ? "none" : "1px solid rgba(0,229,255,0.25)",
              boxShadow: facingMode==="user" && isActive ? "0 0 14px rgba(0,229,255,0.3)" : "none",
              transition:"all 0.2s"
            }}>
            <span style={{fontSize:"1.3rem"}}>🤳</span>
            <span>Front</span>
            {facingMode==="user" && isActive && <span style={{fontSize:"0.55rem",opacity:0.8}}>● ACTIVE</span>}
          </button>
          {/* Back camera */}
          <button
            onClick={() => { if(isActive && facingMode!=="environment") onFlip(); else if(!isActive) onStart("environment"); }}
            style={{
              flex:1, padding:"11px 8px", borderRadius:11, cursor:"pointer", fontWeight:800,
              fontSize:"0.75rem", display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              background: facingMode==="environment" && isActive
                ? "linear-gradient(135deg,#7f5af0,#00e5ff)"
                : "rgba(127,90,240,0.08)",
              color: facingMode==="environment" && isActive ? "#000" : "#7f5af0",
              border: facingMode==="environment" && isActive ? "none" : "1px solid rgba(127,90,240,0.25)",
              boxShadow: facingMode==="environment" && isActive ? "0 0 14px rgba(127,90,240,0.3)" : "none",
              transition:"all 0.2s"
            }}>
            <span style={{fontSize:"1.3rem"}}>📷</span>
            <span>Back</span>
            {facingMode==="environment" && isActive && <span style={{fontSize:"0.55rem",opacity:0.8}}>● ACTIVE</span>}
          </button>
          {/* Stop button */}
          {isActive && (
            <button onClick={onStop} style={{
              flex:"0 0 54px", padding:"11px 6px", borderRadius:11,
              background:"rgba(255,77,109,0.12)", border:"1px solid rgba(255,77,109,0.3)",
              color:"#ff4d6d", fontWeight:800, fontSize:"0.7rem", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:4
            }}>
              <span style={{fontSize:"1.1rem"}}>⏹</span>
              <span>Stop</span>
            </button>
          )}
        </div>
        {/* Start button when not active */}
        {!isActive && (
          <button onClick={()=>onStart(facingMode)} disabled={isLoading} style={{
            width:"100%", padding:"12px", borderRadius:11, border:"none", cursor:isLoading?"not-allowed":"pointer",
            background:isLoading?"#1a2d45":"linear-gradient(135deg,#00e5ff,#7f5af0)",
            color:isLoading?"#6b8399":"#000", fontWeight:800, fontSize:"0.8rem"
          }}>{isLoading?"⏳ Loading camera…":"▶ Start Camera"}</button>
        )}
        {canRecalibrate && <button onClick={onRecalibrate} style={{width:"100%",marginTop:6,padding:"8px",borderRadius:9,border:"1px solid rgba(255,179,0,0.3)",background:"rgba(255,179,0,0.08)",color:"#ffb300",fontWeight:700,fontSize:"0.72rem",cursor:"pointer"}}>⟳ Recalibrate</button>}
      </div>

      {/* ── VIEW SELECTOR — always visible (Front/Back/Left/Right) ── */}
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:"0.58rem", fontWeight:700, color:"#7e6a9a", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>📐 Posture View — select before capturing</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6 }}>
          {[
            { v:"anterior",  icon:"⬆", label:"Front",  color:"#00e5ff" },
            { v:"posterior", icon:"⬇", label:"Back",   color:"#7f5af0" },
            { v:"left",      icon:"◀", label:"Left",   color:"#00c97a" },
            { v:"right",     icon:"▶", label:"Right",  color:"#ffb300" },
          ].map(({ v, icon, label, color }) => {
            const active = activeView === v;
            return (
              <button key={v} onClick={() => onViewChange && onViewChange(v)} style={{
                padding:"10px 4px", borderRadius:11, cursor:"pointer", fontWeight:800,
                fontSize:"0.72rem", display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                background: active ? `linear-gradient(135deg,${color},${color}aa)` : `${color}12`,
                color: active ? "#000" : color,
                border: active ? "none" : `1px solid ${color}40`,
                boxShadow: active ? `0 0 14px ${color}55` : "none",
                transition:"all 0.2s"
              }}>
                <span style={{ fontSize:"1rem" }}>{icon}</span>
                <span>{label}</span>
                {active && <span style={{ fontSize:"0.5rem", opacity:0.85 }}>● SELECTED</span>}
              </button>
            );
          })}
        </div>
        {/* Grid line notice */}
        <div style={{ marginTop:6, padding:"5px 9px", background:"rgba(0,229,255,0.07)", border:"1px solid rgba(0,229,255,0.18)", borderRadius:8, fontSize:"0.62rem", color:"#7e6a9a", fontStyle:"italic" }}>
          🔲 Posture grid lines will appear on captured photo for the selected view
        </div>
      </div>

      {/* Advanced controls row */}
      {isActive && (
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center" }}>
          {/* Zoom */}
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"#ffffff", border:"1px solid #d8cce8", borderRadius:9, padding:"5px 10px", flex:"1 1 auto" }}>
            <span style={{ fontSize:"0.65rem", color:"#7e6a9a", whiteSpace:"nowrap" }}>🔍 Zoom</span>
            <input type="range" min="1" max="2.5" step="0.1" value={zoom||1} onChange={e=>onZoom&&onZoom(Number(e.target.value))}
              style={{ flex:1, accentColor:"#00e5ff", cursor:"pointer", minWidth:60 }}/>
            <span style={{ fontSize:"0.65rem", color:"#00e5ff", minWidth:26, fontWeight:700 }}>{(zoom||1).toFixed(1)}×</span>
          </div>

          {/* Countdown timer */}
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"#ffffff", border:"1px solid #d8cce8", borderRadius:9, padding:"5px 10px" }}>
            <span style={{ fontSize:"0.65rem", color:"#7e6a9a" }}>⏱</span>
            {[3,5,10].map(s => (
              <button key={s} onClick={() => onCountdownChange&&onCountdownChange(s)} style={{
                padding:"3px 7px", borderRadius:6, fontSize:"0.62rem", fontWeight:700, border:"none", cursor:"pointer",
                background: countdownSecs===s ? "#00e5ff" : "#192435", color: countdownSecs===s ? "#000" : "#6b8399"
              }}>{s}s</button>
            ))}
          </div>

          {/* Burst mode */}
          <button onClick={onBurstToggle} style={{
            padding:"6px 11px", borderRadius:9, fontSize:"0.65rem", fontWeight:700, border:"none", cursor:"pointer",
            background: burstMode ? "rgba(255,179,0,0.2)" : "#1a2d45",
            color: burstMode ? "#ffb300" : "#6b8399"
          }}>💥 {burstMode ? "Burst ON" : "Burst"}</button>
        </div>
      )}
    </div>
  );
}

// ─── CameraPositionGuide — Professional clinical setup ───────────────────────
function CameraPositionGuide() {
  return (
    <div style={{ background:"rgba(0,229,255,0.05)", border:"1px solid rgba(0,229,255,0.18)", borderRadius:12, padding:14, marginBottom:12 }}>
      <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#00e5ff", textTransform:"uppercase", letterSpacing:"1px", marginBottom:9 }}>📐 Clinical Setup Guide</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:7 }}>
        {[
          ["📏","2m camera distance"],["🧍","Full body in frame"],
          ["💡","Even, bright lighting"],["📱","Camera at hip/pelvis height"],
          ["👕","Form-fitting clothing"],["🦶","Feet fully visible"],
          ["🔲","Use alignment grid overlay"],["🧘","Patient stands on foot guides"],
        ].map(([ic, tx], i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, fontSize:"0.74rem", color:"#1a1025" }}>
            <span style={{ flexShrink:0 }}>{ic}</span><span style={{ lineHeight:1.4 }}>{tx}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, padding:"7px 10px", background:"rgba(127,90,240,0.08)", borderRadius:8, fontSize:"0.68rem", color:"#7f5af0", border:"1px solid rgba(127,90,240,0.2)" }}>
        💡 Tip: Tap anywhere on camera to focus · Use zoom for closer inspection · Select a view for guided workflow
      </div>
    </div>
  );
}

// ─── PoseTracker (MediaPipe engine) ──────────────────────────────────────────
function PoseTracker({ videoRef, active, onLandmarks }) {
  const poseRef = useRef(null);
  const rafRef  = useRef(null);
  const alive   = useRef(true);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!active) { onLandmarks(null); return; }
    let gone = false;

    (async () => {
      try {
        if (!window.Pose) await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js";
          s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
        if (gone || !alive.current) return;

        const pose = new window.Pose({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}` });
        pose.setOptions({ modelComplexity:1, smoothLandmarks:true, enableSegmentation:false, minDetectionConfidence:0.55, minTrackingConfidence:0.55 });
        pose.onResults(r => { if (alive.current && !gone) onLandmarks(r.poseLandmarks||null); });
        await pose.initialize();
        if (gone || !alive.current) return;
        poseRef.current = pose;

        const loop = async () => {
          if (gone || !alive.current) return;
          const v = videoRef.current;
          if (v && v.readyState >= 2 && poseRef.current) { try { await poseRef.current.send({ image:v }); } catch(_){} }
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch(e) { console.error("PoseTracker:", e); }
    })();

    return () => { gone = true; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  return null;
}

// ─── UploadedPhotoOverlay — renders uploaded image with full analysis grid ─────
function UploadedPhotoOverlay({ photoUrl, landmarks, view }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photoUrl) return;
    let cancelled = false;
    const drawOnCanvas = (imgEl) => {
      if (cancelled) return;
      const W = imgEl.naturalWidth  || imgEl.width  || 640;
      const H = imgEl.naturalHeight || imgEl.height || 480;
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(imgEl, 0, 0, W, H);
      if (landmarks && landmarks.length > 0) {
        try {
          const m = (() => { try { return AdvancedMeasurementEngine(landmarks, null); } catch { return {}; } })();
          renderPostureOverlay({ ctx, W, H, lm: landmarks, measurements: m,
            showHeatmap: true, showLabels: true, showGrid: true, view: view || "anterior" });
        } catch(e) { console.error("UploadedPhotoOverlay overlay:", e); }
      }
    };
    // Load without crossOrigin first (blob URLs work best without it)
    const img = new Image();
    img.onload = () => drawOnCanvas(img);
    img.onerror = () => {
      // Retry with crossOrigin as fallback for http URLs
      const img2 = new Image();
      img2.crossOrigin = "anonymous";
      img2.onload = () => drawOnCanvas(img2);
      img2.onerror = () => console.error("UploadedPhotoOverlay: failed to load photo");
      img2.src = photoUrl;
    };
    // Set src AFTER onload — critical for already-cached blob URLs
    img.src = photoUrl;
    return () => { cancelled = true; };
  }, [photoUrl, landmarks, view]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width:"100%", display:"block", maxHeight:500, background:"#0a0a14" }}
    />
  );
}

// ─── Main PostureCameraModule — Professional Physiotherapy Assessment Camera ──


export { ROMModule, MMTModule, NeurologicalModule, CollapsibleHow, computeQuality, createSmoother };