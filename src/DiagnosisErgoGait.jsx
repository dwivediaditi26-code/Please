import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { getC } from './theme.jsx';
import { DASH_OPTS, FABQ_OPTS, LEFS_OPTS, NKT_REGIONS, OM_CAT_COLOR, OUTCOME_DB, TSK_OPTS, mid } from './shared.jsx';

function generateDiagnosis(data) {
  const dx=[], redFlags=[];
  const v=id=>data[id]||"";
  const has=(id,val)=>(data[id]||"").includes(val);
  const isPos=id=>has(id,"Positive")||has(id,"positive");
  const isBilPos=id=>isPos(id+"_left")||isPos(id+"_right");
  const isInh=id=>has(id,"Inhibited")||has(id+"_left","Inhibited")||has(id+"_right","Inhibited");
  const weakMMT=id=>{const vals=[v(id+"_left"),v(id+"_right"),v(id)];return vals.some(s=>s.startsWith("4/5")||s.startsWith("3/5")||s.startsWith("2/5")||s.startsWith("1/5")||s.startsWith("0/5"));};

  ["s_red1","s_red2","s_red3","s_red4","s_red5","s_red6","s_red7"].forEach(id=>{
    if(has(id,"REFER")){const lbs={s_red1:"Unexplained weight loss",s_red2:"Night sweats/fever",s_red3:"History of cancer",s_red4:"Bilateral pins & needles",s_red5:"Bowel/bladder dysfunction",s_red6:"Saddle anaesthesia",s_red7:"Progressive neuro deficit"};redFlags.push({label:lbs[id]||id,severity:has(id,"URGENT")?"urgent":"refer"});}
  });
  if(has("sp_sharp","Positive"))redFlags.push({label:"Sharp-Purser positive — C1/C2 instability",severity:"urgent"});
  if(has("sp_vasc","Positive"))redFlags.push({label:"VBI test positive — no cervical manipulation",severity:"urgent"});
  if(has("n_ref_babinski_left","Positive")||has("n_ref_babinski_right","Positive"))redFlags.push({label:"Babinski positive — UMN lesion",severity:"urgent"});
  if(has("n_ref_hoffmann_left","Positive")||has("n_ref_hoffmann_right","Positive"))redFlags.push({label:"Hoffmann's sign positive — cervical myelopathy",severity:"urgent"});
  if(has("n_ref_clonus_left","Positive")||has("n_ref_clonus_right","Positive"))redFlags.push({label:"Sustained clonus — UMN lesion",severity:"urgent"});
  // Legacy Babinski (old neuro module field)
  if(has("n_babinski","Positive"))redFlags.push({label:"Babinski positive — UMN lesion",severity:"urgent"});
  // New red flag module fields
  if(data["nrf_cauda"]==="Present"||data["nq_bladder"]==="Yes"||data["nq_saddle"]==="Yes")redFlags.push({label:"Cauda Equina signs present — EMERGENCY",severity:"urgent"});
  if(data["nrf_myelopathy"]==="Present")redFlags.push({label:"Cord compression / myelopathy signs",severity:"urgent"});
  if(data["nq_bilateral_legs"]==="Yes")redFlags.push({label:"Bilateral leg neurological signs",severity:"urgent"});
  if(data["nq_bowel"]==="Yes")redFlags.push({label:"New onset bowel dysfunction — cauda equina screen",severity:"urgent"});

  // ─── NEW: Full Neurological Module Integration ─────────────────────────────
  // Collect all dermatomal, myotomal, reflex and neural tension findings
  const neuroLevelFindings={};
  const DERM_LEVELS=[
    {id:"n_c3",level:"C3",disc:"C2/3"},{id:"n_c4",level:"C4",disc:"C3/4"},
    {id:"n_c5",level:"C5",disc:"C4/5"},{id:"n_c6",level:"C6",disc:"C5/6"},
    {id:"n_c7",level:"C7",disc:"C6/7"},{id:"n_c8",level:"C8",disc:"C7/T1"},
    {id:"n_t1",level:"T1",disc:"T1/2"},
    {id:"n_l2",level:"L2",disc:"L2/3"},{id:"n_l3",level:"L3",disc:"L3/4"},
    {id:"n_l4",level:"L4",disc:"L4/5"},{id:"n_l5",level:"L5",disc:"L4/5"},
    {id:"n_s1",level:"S1",disc:"L5/S1"},{id:"n_s4s5",level:"S4/5",disc:"Cauda equina"},
  ];
  DERM_LEVELS.forEach(d=>{
    const lv=data[d.id+"_left"]||"",rv=data[d.id+"_right"]||"";
    if((lv&&lv!=="Normal")||(rv&&rv!=="Normal")){
      if(!neuroLevelFindings[d.level])neuroLevelFindings[d.level]={level:d.level,disc:d.disc,dermL:lv,dermR:rv,myoL:"",myoR:"",reflex:"",tension:""};
      else{neuroLevelFindings[d.level].dermL=lv;neuroLevelFindings[d.level].dermR=rv;}
    }
  });
  // Myotomes
  const MYO_MAP=[
    {safeId:"myo_c5",level:"C5"},{safeId:"myo_c6",level:"C6"},{safeId:"myo_c7",level:"C7"},
    {safeId:"myo_c8",level:"C8"},{safeId:"myo_l2_l3_",level:"L2"},{safeId:"myo_l3",level:"L3"},
    {safeId:"myo_l4",level:"L4"},{safeId:"myo_l5",level:"L5"},{safeId:"myo_s1",level:"S1"},
  ];
  // Match by prefix
  Object.keys(data).filter(k=>k.startsWith("myo_")).forEach(k=>{
    const baseKey=k.replace(/_left$/,"").replace(/_right$/,"");
    const sv=data[k]||"";
    if(!sv||sv.startsWith("5"))return;
    // Find the level
    MYO_MAP.forEach(m=>{
      if(baseKey.includes(m.level.toLowerCase())||baseKey===("myo_"+m.level.toLowerCase())){
        if(!neuroLevelFindings[m.level])neuroLevelFindings[m.level]={level:m.level,disc:"",dermL:"",dermR:"",myoL:"",myoR:"",reflex:"",tension:""};
        if(k.endsWith("_left"))neuroLevelFindings[m.level].myoL=sv;
        else neuroLevelFindings[m.level].myoR=sv;
      }
    });
  });
  // Neural tension
  ["nt_slr","nt_slump","nt_femoral"].forEach(id=>{
    const lv=data[id+"_left"]||"",rv=data[id+"_right"]||"";
    if(lv.includes("Positive")||rv.includes("Positive")){
      const levels=id==="nt_slr"||id==="nt_slump"?["L4","L5","S1"]:["L2","L3","L4"];
      levels.forEach(lvl=>{
        if(neuroLevelFindings[lvl])neuroLevelFindings[lvl].tension=id;
      });
    }
  });
  ["nt_ultt1","nt_ultt2","nt_ultt3"].forEach(id=>{
    const lv=data[id+"_left"]||"",rv=data[id+"_right"]||"";
    if(lv.includes("Positive")||rv.includes("Positive")){
      const levels=id==="nt_ultt1"?["C5","C6","C7"]:id==="nt_ultt2"?["C6","C7","C8"]:["C8","T1"];
      levels.forEach(lvl=>{
        if(neuroLevelFindings[lvl])neuroLevelFindings[lvl].tension=id;
      });
    }
  });

  const neuroLevels=Object.values(neuroLevelFindings);
  if(neuroLevels.length>0){
    const cervNeuro=neuroLevels.filter(n=>n.level.startsWith("C")||n.level.startsWith("T"));
    const lumbNeuro=neuroLevels.filter(n=>n.level.startsWith("L")||n.level.startsWith("S"));
    const isMultiLevel=neuroLevels.length>2;
    const hasCauda=neuroLevelFindings["S4/5"]&&(neuroLevelFindings["S4/5"].dermL||neuroLevelFindings["S4/5"].dermR);
    if(hasCauda){redFlags.push({label:"S4/5 dermatomal deficit — cauda equina EMERGENCY",severity:"urgent"});}
    if(cervNeuro.length>0){
      const level=cervNeuro[0].level;
      const evidence=[`Dermatomal loss: ${cervNeuro.map(n=>`${n.level}(L:${n.dermL||"–"}/R:${n.dermR||"–"})`).join(", ")}`,cervNeuro.some(n=>n.myoL||n.myoR)?`Myotomal weakness: ${cervNeuro.filter(n=>n.myoL||n.myoR).map(n=>n.level).join(", ")}`:null,cervNeuro.some(n=>n.tension)?`Neural tension: positive`:null].filter(Boolean);
      dx.push({system:"Structural",name:`Cervical Radiculopathy (${cervNeuro.map(n=>n.level).join("/")} )`,confidence:cervNeuro.length>1?"High":"Moderate",evidence,mechanism:`Nerve root compression at ${cervNeuro.map(n=>n.disc||n.level).join("/")} disc level causing dermatomal sensory loss and myotomal weakness.`,treatment:["Cervical neural mobilisation — nerve gliding techniques","Cervical traction (intermittent or sustained)","Deep neck flexor stabilisation program","Postural correction: chin tuck, scapular retraction","Imaging: MRI cervical spine if no improvement 6 weeks","Referral: neurology/neurosurgery if progressive deficit"]});
    }
    if(lumbNeuro.length>0&&!hasCauda){
      const evidence=[`Dermatomal loss: ${lumbNeuro.map(n=>`${n.level}(L:${n.dermL||"–"}/R:${n.dermR||"–"})`).join(", ")}`,lumbNeuro.some(n=>n.myoL||n.myoR)?`Myotomal weakness: ${lumbNeuro.filter(n=>n.myoL||n.myoR).map(n=>n.level).join(", ")}`:null,lumbNeuro.some(n=>n.tension)?`Positive neural tension tests`:null].filter(Boolean);
      const lv=lumbNeuro[0].level;
      dx.push({system:"Structural",name:`Lumbar Radiculopathy (${lumbNeuro.map(n=>n.level).join("/")} )`,confidence:lumbNeuro.length>1?"High":"Moderate",evidence,mechanism:`Disc herniation or foraminal stenosis compressing ${lumbNeuro.map(n=>n.level).join("/")} nerve root(s).`,treatment:["Lumbar neural mobilisation — sciatic nerve flossing","McKenzie extension exercises (if directional preference)","Core stabilisation: TA, multifidus activation","MRI lumbar spine if red flags or no improvement","Spinal injection referral if persistent >6 weeks","Neuro monitoring: recheck myotomes/reflexes 2-weekly"]});
    }
    if(isMultiLevel&&!hasCauda){dx.push({system:"Structural",name:"Multi-Level Neurological Involvement",confidence:"Moderate",evidence:[`Levels involved: ${neuroLevels.map(n=>n.level).join(", ")}`,neuroLevels.length>3?"3+ levels — consider central stenosis or myelopathy":null].filter(Boolean),mechanism:"Multi-level involvement suggests central canal stenosis, myelopathy, or systemic neuropathy rather than single-level disc herniation.",treatment:["Full spine MRI — rule out myelopathy and stenosis","Neurological referral","Avoid spinal manipulation until imaging reviewed","Neuromodulation: TENS, pain management referral"]});}
  }
  // UMN / myelopathy pattern from new reflex fields
  const umnSigns=[];
  if(has("n_ref_babinski_left","Positive")||has("n_ref_babinski_right","Positive"))umnSigns.push("Babinski positive");
  if(has("n_ref_hoffmann_left","Positive")||has("n_ref_hoffmann_right","Positive"))umnSigns.push("Hoffmann's positive");
  if(has("n_ref_clonus_left","Positive")||has("n_ref_clonus_right","Positive"))umnSigns.push("Ankle clonus present");
  if(has("n_ref_jaw_left","Positive")||has("n_ref_jaw_right","Positive"))umnSigns.push("Jaw jerk brisk");
  if(umnSigns.length>0){dx.push({system:"Structural",name:"Upper Motor Neuron / Myelopathy Pattern",confidence:"High",evidence:umnSigns,mechanism:"Pathological reflexes indicate UMN lesion above the segmental level. Possible cervical myelopathy, cord compression, or intracranial pathology.",treatment:["URGENT: No cervical manipulation","MRI cervical + thoracic spine immediately","Neurosurgical / neurological referral","Monitor gait, hand function, and bladder symptoms"]});}

  // NKT from all region tests
  const nktPairs=[];
  ["nkt_dnf","nkt_scm","nkt_suboccip","nkt_upper_trap","nkt_scalenes","nkt_levator_scap","nkt_splenius","nkt_semispinalis","nkt_lower_trap","nkt_serratus","nkt_infraspinatus","nkt_subscapularis","nkt_mid_trap","nkt_pec_minor","nkt_ant_deltoid","nkt_post_deltoid","nkt_teres_major","nkt_ta","nkt_multifidus","nkt_diaphragm","nkt_ql","nkt_psoas","nkt_erector_spinae","nkt_obliques","nkt_pelvic_floor","nkt_gmax","nkt_gmed","nkt_piriformis","nkt_hip_flex_fo","nkt_adductors","nkt_tfl","nkt_rectus_fem","nkt_vmo","nkt_hamstrings","nkt_popliteus","nkt_tib_ant","nkt_tib_post","nkt_gastroc","nkt_peroneals","nkt_fhl","nkt_foot_intrinsics","nkt_biceps","nkt_triceps","nkt_wrist_ext","nkt_wrist_flex","nkt_pronator","nkt_grip"].forEach(id=>{
    const val=v(id);
    if(!val||val.includes("Normal")||val.includes("Facilitated")||val.includes("fires first"))return;
    // Find the test to get label
    let testLabel=id.replace("nkt_","").replace(/_/g," ");
    Object.values(NKT_REGIONS).forEach(reg=>reg.tests.forEach(t=>{if(t.id===id)testLabel=t.label;}));
    nktPairs.push(`${testLabel}: ${val}`);
  });
  if(nktPairs.length>0){
    dx.push({system:"NKT",name:"Motor Control Dysfunction (NKT)",confidence:"High",
      evidence:nktPairs,
      mechanism:"The Motor Control Centre (MCC) has stored compensation patterns. Inhibited muscles are substituted by synergists, creating overactive muscles that perpetuate pain and dysfunction cycles.",
      treatment:["STEP 1 — INHIBIT: SMR/foam roll overactive muscles 90 sec (release compensation)","STEP 2 — ACTIVATE: Immediately activate inhibited muscles 3–5 reps within 30 seconds","STEP 3 — INTEGRATE: Functional movement reprogramming with correct motor patterns","STEP 4 — REPROGRAM: Daily home exercises to reinforce new MCC motor programs"]
    });
  }

  // Cyriax
  const cyriaxLesion=[];
  Object.keys(data).filter(k=>k.startsWith("cy_")&&data[k]).forEach(id=>{
    const val=data[id];
    if(val.includes("Strong & Painful"))cyriaxLesion.push({id,type:"minor",finding:`${id}: Strong & Painful = minor contractile lesion`});
    if(val.includes("Weak & Painful"))cyriaxLesion.push({id,type:"serious",finding:`${id}: Weak & Painful = serious lesion — imaging required`});
    if(val.includes("Weak & Painless"))cyriaxLesion.push({id,type:"neuro",finding:`${id}: Weak & Painless = neurological`});
  });
  const isCap=has("cy_capsular","Yes");
  if(cyriaxLesion.length>0||isCap){
    const serious=cyriaxLesion.filter(l=>l.type==="serious"),minor=cyriaxLesion.filter(l=>l.type==="minor"),neuro=cyriaxLesion.filter(l=>l.type==="neuro");
    dx.push({system:"Cyriax",name:`Tissue Lesion: ${serious.length>0?"Serious Contractile":minor.length>0?"Minor Contractile":isCap?"Inert (Capsular)":"Neurological"} Pathology`,confidence:serious.length>0?"High":minor.length>0?"High":"Moderate",
      evidence:[...minor.map(l=>l.finding),...serious.map(l=>"⚠️ "+l.finding),...neuro.map(l=>"⚡ "+l.finding),isCap?"Capsular pattern confirmed":null,has("cy_endfeel","Empty")?"Empty end-feel — serious pathology":null].filter(Boolean),
      mechanism:"Cyriax STTT systematically differentiates inert vs contractile tissue to identify the exact structure at fault.",
      treatment:minor.length>0?["Deep Transverse Friction Massage (DTFM) to exact lesion site","Eccentric loading program for tendinopathy","Relative rest — modify aggravating activities","Progressive loading when pain-free"]:serious.length>0?["Refer for MRI/ultrasound immediately","Protect structure — splinting/bracing","Surgical consultation if rupture confirmed"]:isCap?["Maitland Grade III–IV joint mobilisation","End-range stretching program","Heat before mobilisation, ice after","Corticosteroid injection referral if severe"]:[]
    });
  }

  // FMS
  const fmsMap={sq:"sp_fms_sq",hs_l:"sp_fms_hs_l",hs_r:"sp_fms_hs_r",il_l:"sp_fms_il_l",il_r:"sp_fms_il_r",sm_l:"sp_fms_sm_l",sm_r:"sp_fms_sm_r",aslr_l:"sp_fms_aslr_l",aslr_r:"sp_fms_aslr_r",tspu:"sp_fms_tspu",rs_l:"sp_fms_rs_l",rs_r:"sp_fms_rs_r"};
  const fmsS={};Object.entries(fmsMap).forEach(([k,id])=>{const val=v(id);fmsS[k]=val.startsWith("3")?3:val.startsWith("2")?2:val.startsWith("1")?1:val.startsWith("0")?0:-1;});
  const fmsDone=Object.values(fmsS).filter(s=>s>=0).length;
  let fmsTotal=null;
  if(fmsDone>=4){
    const pm=(a,b)=>Math.min(fmsS[a]>=0?fmsS[a]:3,fmsS[b]>=0?fmsS[b]:3);
    fmsTotal=(fmsS.sq>=0?fmsS.sq:0)+pm("hs_l","hs_r")+pm("il_l","il_r")+pm("sm_l","sm_r")+pm("aslr_l","aslr_r")+(fmsS.tspu>=0?fmsS.tspu:0)+pm("rs_l","rs_r");
    const hasAsym=["hs","il","sm","aslr","rs"].some(k=>{const l=fmsS[k+"_l"],r=fmsS[k+"_r"];return l>=0&&r>=0&&Math.abs(l-r)>0;});
    const pain0=Object.values(fmsS).some(s=>s===0);
    if(fmsTotal<=14||pain0||hasAsym){
      dx.push({system:"FMS",name:`Movement Dysfunction — FMS ${fmsTotal}/21${hasAsym?" + Asymmetry":""}`,confidence:"High",
        evidence:[`FMS Total: ${fmsTotal}/21 (threshold ≤14 = high risk)`,hasAsym?"⚠️ Bilateral asymmetry — highest injury predictor":null,pain0?"🔴 Score 0 present — pain during testing":null].filter(Boolean),
        mechanism:"Movement pattern deficits indicate mobility/stability imbalances increasing injury risk.",
        treatment:["Corrective priority: lowest FMS score first","Asymmetry: match bilateral scores before progressing","Deep Squat corrective: ankle DF drills + hip mobility + thoracic extension","Core control: dead bug, bird-dog, Pallof press progressions","Re-screen FMS after 6 weeks of corrective program"]
      });
    }
  }

  // Posture
  const ucs=v("p_ucs"),lcs=v("p_lcs");
  if(ucs.includes("Moderate")||ucs.includes("Severe")){dx.push({system:"Posture",name:"Upper Crossed Syndrome",confidence:"High",evidence:[`UCS: ${ucs}`,v("p_forward_head")&&!v("p_forward_head").includes("Normal")?`Forward head: ${v("p_forward_head")}`:null].filter(Boolean),mechanism:"Overactive: upper trap, SCM, pec minor. Underactive: DNF, lower trap, serratus anterior, rhomboids.",treatment:["INHIBIT: Upper trap, SCM, pec minor SMR","ACTIVATE: DNF chin nods, lower trap Y-T-W, serratus push-up plus","Manual therapy: thoracic manipulation","Ergonomic correction: workstation, monitor height"]});}
  if(lcs.includes("Moderate")||lcs.includes("Severe")){dx.push({system:"Posture",name:"Lower Crossed Syndrome",confidence:"High",evidence:[`LCS: ${lcs}`,v("p_pelvic_tilt")&&!v("p_pelvic_tilt").includes("Neutral")?`Pelvic tilt: ${v("p_pelvic_tilt")}`:null].filter(Boolean),mechanism:"Overactive: hip flexors, thoracolumbar extensors, QL. Underactive: glute max, glute med, TA, RA.",treatment:["INHIBIT: Hip flexors, QL SMR","ACTIVATE: Glute bridges, clamshells, dead bug","STRETCH: Couch stretch, 90-90 hip flexor","Core stability: TA → bridges → functional"]});}

  // Kinetic Chain
  const adfL=parseFloat(data.rom_adf_left||""),adfR=parseFloat(data.rom_adf_right||"");
  const hirL=parseFloat(data.rom_hir_left||""),hirR=parseFloat(data.rom_hir_right||"");
  const trotL=parseFloat(data.rom_trotl||""),trotR=parseFloat(data.rom_trotr||"");
  const ankleL=(!isNaN(adfL)&&adfL<15)||(!isNaN(adfR)&&adfR<15),hipIR=(!isNaN(hirL)&&hirL<35)||(!isNaN(hirR)&&hirR<35),thorR=(!isNaN(trotL)&&trotL<35)||(!isNaN(trotR)&&trotR<35);
  if(ankleL||hipIR||thorR){dx.push({system:"Kinetic Chain",name:"Kinetic Chain Dysfunction",confidence:"High",evidence:[ankleL?`Ankle DF limited (${Math.min(isNaN(adfL)?99:adfL,isNaN(adfR)?99:adfR)}° < 15°) → knee valgus, foot pronation chain`:null,hipIR?`Hip IR limited (${Math.min(isNaN(hirL)?99:hirL,isNaN(hirR)?99:hirR)}° < 35°) → lumbar compensation`:null,thorR?`Thoracic rotation limited → lumbar overload, shoulder impingement`:null].filter(Boolean),mechanism:"Mobile joints losing mobility force adjacent stable joints into excess motion — pain appears at stable joint.",treatment:[ankleL?"Ankle DF: wall lunge drill, gastroc stretch, talocrural mobilisation":null,hipIR?"Hip mobility: 90-90 stretch, hip IR in prone, pigeon pose":null,thorR?"Thoracic mobility: foam roller extension, thoracic rotation with dowel":null,"Address mobility BEFORE adding stability load"].filter(Boolean)});}

  // Fascia
  const fascRest=[];
  if(has("sp_sbl","Significant"))fascRest.push("Superficial Back Line restricted");
  if(has("sp_sfl","Significant"))fascRest.push("Superficial Front Line restricted");
  if(has("sp_ll_left","Significant")||has("sp_ll_right","Significant"))fascRest.push("Lateral Line restricted");
  if(has("sp_spl_left","Significant")||has("sp_spl_right","Significant"))fascRest.push("Spiral Line restricted");
  if(data.sp_mftp&&data.sp_mftp.length>3)fascRest.push(`Active trigger points: ${data.sp_mftp}`);
  if(fascRest.length>0){dx.push({system:"Fascia",name:"Myofascial Restriction Pattern",confidence:"Moderate",evidence:fascRest,mechanism:"Fascial restrictions along meridians create distant pull — one restriction propagates tension along the entire fascial line.",treatment:["Myofascial release: slow sustained pressure 90–120 sec along restricted lines","Skin rolling along paraspinals","Foam rolling: target identified fascial lines","Patient education: sustained postures shorten lines — movement variety essential"]});}

  // Muscle activation
  const muscImb=[];
  if(weakMMT("m_gmax"))muscImb.push("Gluteus Maximus underactive — inhibited, poor hip extension");
  if(weakMMT("m_gmed"))muscImb.push("Gluteus Medius underactive — Trendelenburg risk");
  if(weakMMT("m_lt"))muscImb.push("Lower Trapezius underactive — scapular depression deficit");
  if(weakMMT("m_sa"))muscImb.push("Serratus Anterior underactive — winging risk");
  if(weakMMT("m_ta"))muscImb.push("Transversus Abdominis underactive — core instability");
  if(has("m_dnf","deficit")||has("m_dnf","Severe"))muscImb.push("Deep Neck Flexors deficit — cervicogenic pattern");
  if(muscImb.length>0){dx.push({system:"Muscle Activation",name:"Muscle Activation Imbalance",confidence:"High",evidence:muscImb,mechanism:"Underactive muscles fail to generate force → synergists dominate → joint compression and overuse.",treatment:["INHIBIT overactive synergists first (SMR 90s)","ISOLATED ACTIVATION: low-load, high-rep isolation",weakMMT("m_gmax")||weakMMT("m_gmed")?"Glute program: bridges → clamshells → hip thrusts":null,weakMMT("m_lt")||weakMMT("m_sa")?"Scapular program: Y-T-W → wall slides → push-up plus":null,"INTEGRATE: progress to multi-joint functional movements"].filter(Boolean)});}

  // Structural
  if((isBilPos("sp_neer")||isBilPos("sp_hawkins"))&&(isBilPos("sp_empty_can")||isBilPos("sp_full_can"))){dx.push({system:"Structural",name:"Subacromial Impingement Syndrome",confidence:"High",evidence:[isBilPos("sp_neer")?"Neer's positive":null,isBilPos("sp_hawkins")?"Hawkins-Kennedy positive":null,isBilPos("sp_empty_can")?"Empty can positive":null].filter(Boolean),mechanism:"Supraspinatus compressed under coracoacromial arch — secondary to poor scapular control and thoracic kyphosis.",treatment:["Rotator cuff ER/IR strengthening","Scapular stability: serratus, lower trap","Thoracic mobility: extension and rotation","Posterior capsule stretch"]});}
  if(isBilPos("sp_lachmans")||isBilPos("sp_ant_drawer")){dx.push({system:"Structural",name:"ACL Insufficiency",confidence:"High",evidence:[isBilPos("sp_lachmans")?`Lachman's: ${v("sp_lachmans_left")||v("sp_lachmans_right")}`:null].filter(Boolean),mechanism:"ACL insufficient — anterior tibial translation unchecked.",treatment:["Refer orthopaedic — MRI","Quad activation","Hamstring/glute strengthening","Proprioception: single-leg training"]});}
  if(isBilPos("sp_mcmurray")||isBilPos("sp_thessaly")){dx.push({system:"Structural",name:"Meniscal Pathology",confidence:"Moderate",evidence:["McMurray's/Thessaly positive"],mechanism:"Meniscal tear — compressive/rotational loading provocative.",treatment:["Avoid deep knee flexion and pivoting","Quad and hamstring strengthening","MRI referral","Load management"]});}
  const cervRad=isBilPos("sp_spurling")||["n_c5","n_c6","n_c7","n_c8"].some(id=>has(id,"Reduced")||has(id,"Absent"));
  if(cervRad){const lv=has("n_c5","Reduced")?"C5":has("n_c6","Reduced")?"C6":has("n_c7","Reduced")?"C7":has("n_c8","Reduced")?"C8":"multi-level";dx.push({system:"Structural",name:`Cervical Radiculopathy (${lv})`,confidence:"High",evidence:[isBilPos("sp_spurling")?"Spurling's positive":null,`Dermatomal deficit: ${lv}`].filter(Boolean),mechanism:`${lv} nerve root compression — disc herniation or foraminal stenosis.`,treatment:["Cervical traction","Neural mobilisation — nerve gliding","Cervical stabilisation: DNF","Imaging if no improvement 6 weeks"]});}
  if(isBilPos("sp_slump")||has("n_slr_left","Positive")||has("n_slr_right","Positive")){const lv=has("n_l4","Reduced")?"L4":has("n_l5","Reduced")?"L5":has("n_s1","Reduced")?"S1":"lumbar";dx.push({system:"Structural",name:`Lumbar Disc / Radiculopathy (${lv})`,confidence:"High",evidence:["Slump/SLR positive",`Level: ${lv}`],mechanism:"Disc herniation compressing nerve root.",treatment:["McKenzie method — direction of preference","Neural mobilisation","Core stability: TA, multifidus","Imaging if cauda equina signs"]});}
  if(isPos("sp_si_dist")||isPos("sp_si_comp")){dx.push({system:"Structural",name:"Sacroiliac Joint Dysfunction",confidence:"Moderate",evidence:["SI provocation cluster positive"],mechanism:"SI joint hypomobility/hypermobility.",treatment:["SI joint manipulation","Lumbopelvic stability","Pelvic belt if acute","Prolotherapy/injection if chronic"]});}
  if(isPos("sp_windlass")){dx.push({system:"Structural",name:"Plantar Fasciitis",confidence:"High",evidence:["Windlass test positive"],mechanism:"Plantar fascia overloaded at calcaneal attachment.",treatment:["Plantar fascia + calf stretching","Night splinting","Shockwave therapy if >3 months","Orthotic assessment"]});}

  // ── ERGONOMIC MODULE INTEGRATION ─────────────────────────────────────────
  const ergoScore=parseInt(data.ergo_total_score||"0");
  const ergoRisks=[];
  if((data.ergo_cervical_risk||"").includes("High"))ergoRisks.push("High cervical strain risk from workstation");
  if((data.ergo_lumbar_risk||"").includes("High"))ergoRisks.push("High lumbar overload risk — seating/posture");
  if((data.ergo_rsi_risk||"").includes("High"))ergoRisks.push("High RSI risk — repetitive upper limb exposure");
  if((data.ergo_ucs_risk||"").includes("High"))ergoRisks.push("Workstation driving UCS pattern");
  if((data.ergo_nerve_risk||"").includes("High"))ergoRisks.push("Nerve compression risk — keyboard/mouse posture");
  if(ergoScore>=15||ergoRisks.length>=3){
    dx.push({system:"Ergonomic",name:`Occupational Ergonomic Syndrome (Score ${ergoScore}/30)`,confidence:ergoScore>=20?"High":"Moderate",
      evidence:[...ergoRisks,data.ergo_sitting_hrs?`Sitting duration: ${data.ergo_sitting_hrs}h/day`:null,data.ergo_break_freq?`Microbreak frequency: ${data.ergo_break_freq}`:null].filter(Boolean),
      mechanism:"Cumulative ergonomic load from sustained static posture, suboptimal workstation setup, and repetitive movement patterns driving musculoskeletal pathology.",
      treatment:["Immediate workstation correction per ergonomic assessment findings","Microbreak protocol: 20-20-20 rule (every 20 min, 20 sec break, look 20 ft)","Postural retraining: chin tuck, scapular retraction cues","Ergonomic equipment review: chair, monitor, keyboard, mouse","Progressive return to neutral posture with DNF activation","Review task rotation and load distribution"]
    });
  }

  // ── ALWAYS-PRESENT FALLBACK: build from whatever fields ARE filled ────────
  if (dx.length === 0) {
    const sympEvidence = [];
    const sympTreatment = [];
    // Demographics
    const name = data.dem_name || "Patient";
    const age  = parseInt(data.dem_age || "0");
    // Chief complaint
    if (data.cc_main)          sympEvidence.push(`Chief complaint: "${data.cc_main}"`);
    if (data.cc_location)      sympEvidence.push(`Location: ${Array.isArray(data.cc_location)?data.cc_location.join(", "):data.cc_location}`);
    if (data.cc_onset)         sympEvidence.push(`Onset: ${Array.isArray(data.cc_onset)?data.cc_onset.join(", "):data.cc_onset}`);
    if (data.cc_duration)      sympEvidence.push(`Duration: ${Array.isArray(data.cc_duration)?data.cc_duration.join(", "):data.cc_duration}`);
    // Pain
    if (data.pa_vas_now)       sympEvidence.push(`Current pain: ${data.pa_vas_now}/10`);
    if (data.pa_vas_worst)     sympEvidence.push(`Worst pain: ${data.pa_vas_worst}/10`);
    if (data.pa_quality)       sympEvidence.push(`Pain quality: ${Array.isArray(data.pa_quality)?data.pa_quality.join(", "):data.pa_quality}`);
    // Aggravating / easing
    if (data.agg_factors)      sympEvidence.push(`Aggravated by: ${Array.isArray(data.agg_factors)?data.agg_factors.join(", "):data.agg_factors}`);
    if (data.ease_factors)     sympEvidence.push(`Eased by: ${Array.isArray(data.ease_factors)?data.ease_factors.join(", "):data.ease_factors}`);
    // Symptom behaviour
    if (data.sb_morning)       sympEvidence.push(`Morning: ${Array.isArray(data.sb_morning)?data.sb_morning.join(", "):data.sb_morning}`);
    if (data.sb_night)         sympEvidence.push(`Night: ${Array.isArray(data.sb_night)?data.sb_night.join(", "):data.sb_night}`);
    // MOI
    if (data.moi_type)         sympEvidence.push(`Mechanism: ${Array.isArray(data.moi_type)?data.moi_type.join(", "):data.moi_type}`);
    // History
    if (data.phx_conditions)   sympEvidence.push(`PMH: ${Array.isArray(data.phx_conditions)?data.phx_conditions.join(", "):data.phx_conditions}`);

    // Infer clinical pattern from available data
    let dxName = "Musculoskeletal Pain Presentation";
    let mechanism = "Insufficient clinical data for a definitive differential diagnosis. Presentation is consistent with a non-specific musculoskeletal pain pattern. Further assessment recommended.";
    let confidence = "Low";

    const painNow = parseFloat(data.pa_vas_now || "0");
    const quality = (Array.isArray(data.pa_quality)?data.pa_quality.join(" "):data.pa_quality||"").toLowerCase();
    const location = (Array.isArray(data.cc_location)?data.cc_location.join(" "):data.cc_location||"").toLowerCase();
    const agg = (Array.isArray(data.agg_factors)?data.agg_factors.join(" "):data.agg_factors||"").toLowerCase();
    const ease = (Array.isArray(data.ease_factors)?data.ease_factors.join(" "):data.ease_factors||"").toLowerCase();
    const morning = (Array.isArray(data.sb_morning)?data.sb_morning.join(" "):data.sb_morning||"").toLowerCase();
    const duration = (Array.isArray(data.cc_duration)?data.cc_duration.join(" "):data.cc_duration||"").toLowerCase();

    // Pattern recognition from symptoms
    const isInflammatory = morning.includes("stiff") || quality.includes("throb") || quality.includes("ach");
    const isMechanical   = agg.includes("sit") || agg.includes("stand") || agg.includes("lift") || ease.includes("rest");
    const isNeuropathic  = quality.includes("burn") || quality.includes("shoot") || quality.includes("tin") || quality.includes("electric") || quality.includes("numb");
    const isAcute        = duration.includes("day") || duration.includes("week") || duration.includes("acute");
    const isChronic      = duration.includes("month") || duration.includes("year") || duration.includes("chronic");

    if (isNeuropathic) {
      dxName = "Suspected Neuropathic Pain Pattern";
      mechanism = "Symptom quality (burning, shooting, tingling) suggests neural sensitisation or nerve root involvement. Dermatomal and neurological screening recommended.";
      confidence = "Moderate";
      sympTreatment.push("Neurological screening: dermatomes, myotomes, reflexes","Neural tension tests (SLR, slump, ULTT)","Desensitisation: graded sensory stimulation","Refer if progressive neurological deficit");
    } else if (isInflammatory) {
      dxName = "Suspected Inflammatory / Irritable Pain Pattern";
      mechanism = "Morning stiffness and throbbing/aching quality suggest inflammatory or irritable joint pathology. Rule out inflammatory arthropathy.";
      confidence = "Moderate";
      sympTreatment.push("Activity modification during flare","Ice / anti-inflammatory modalities","Gentle range-of-motion exercises","Consider rheumatological screen if persistent");
    } else if (isMechanical) {
      dxName = "Mechanical Musculoskeletal Pain";
      mechanism = "Pain aggravated by mechanical loading (sitting, standing, lifting) and relieved by rest is consistent with mechanical musculoskeletal dysfunction.";
      confidence = "Moderate";
      sympTreatment.push("Postural correction and ergonomic advice","Load management and graded return to activity","Core stability and movement re-education","Manual therapy: joint mobilisation and soft tissue techniques");
    }

    if (isChronic) {
      sympEvidence.push("Chronic presentation (>3 months) — consider central sensitisation");
      sympTreatment.push("Pain neurophysiology education","Graded exposure / graded activity","Consider psychosocial yellow flag screening (Örebro)");
    }
    if (isAcute) {
      sympTreatment.push("PRICE principles if acute trauma","Early active movement within pain limits","Reassure: natural history is favourable in acute MSK");
    }
    if (painNow >= 7) {
      sympEvidence.push(`High pain intensity (${painNow}/10) — consider pain management strategies`);
      sympTreatment.push("Pain management: modalities, analgesic liaison if required","Reduce fear-avoidance: active rather than passive treatment");
    }

    // Age-related considerations
    if (age > 50) {
      sympEvidence.push(`Age ${age} — consider degenerative pathology`);
      sympTreatment.push("Screen for osteoarthritis / degenerative disc disease");
    }
    if (age < 20) {
      sympEvidence.push(`Age ${age} — consider growth-related pathology (apophysitis, Scheuermann's)`);
    }

    if (sympEvidence.length === 0) sympEvidence.push("No assessment fields completed — enter patient data to refine diagnosis");
    if (sympTreatment.length === 0) sympTreatment.push("Complete assessment modules to generate targeted treatment plan","Full subjective and objective assessment recommended","Establish baseline measures before treatment");

    dx.push({
      system:"Posture",
      name: dxName,
      confidence,
      evidence: sympEvidence,
      mechanism,
      treatment: sympTreatment,
      interpretation: "Based on available symptoms only. Complete assessment modules for definitive multi-system diagnosis."
    });
  }

  return { dx, redFlags, fmsTotal };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERGONOMIC & WORKSTATION ASSESSMENT MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const ERGO_RISK_CFG = {
  ergo_monitor_height: { w:3, domain:"cervical", bad: v => v==="Too high — head tilted back"||v==="Too low — forward head flexion" },
  ergo_monitor_dist:   { w:2, domain:"cervical", bad: v => v==="Too close (<50cm)"||v==="Too far (>80cm)" },
  ergo_monitor_glare:  { w:1, domain:"cervical", bad: v => v==="Present" },
  ergo_head_angle:     { w:3, domain:"cervical", bad: v => parseInt(v||"0")>15 },
  ergo_neck_rotation:  { w:2, domain:"cervical", bad: v => v==="Yes — sustained (>25% of work time)" },
  ergo_chair_height:   { w:3, domain:"lumbar",   bad: v => v==="Too low — knees above hips"||v==="Too high — feet unsupported" },
  ergo_lumbar_support: { w:3, domain:"lumbar",   bad: v => v==="Absent"||v==="Inadequate — too low/high" },
  ergo_seat_depth:     { w:2, domain:"lumbar",   bad: v => v==="Too deep — edge pressure on popliteal"||v==="Too shallow — poor thigh support" },
  ergo_foot_support:   { w:2, domain:"lumbar",   bad: v => v==="Feet unsupported"||v==="Crossed legs habitually" },
  ergo_pelvic_tilt:    { w:2, domain:"ucs",      bad: v => v==="Posterior tilt (slouch) — flattens lumbar"||v==="Anterior tilt — increased lumbar load" },
  ergo_keyboard_pos:   { w:2, domain:"rsi",      bad: v => v==="Too high — shoulder elevation"||v==="Too far — trunk lean forward" },
  ergo_wrist_dev:      { w:3, domain:"rsi",      bad: v => v==="Ulnar deviation"||v==="Wrist extension"||v==="Combined extension + deviation" },
  ergo_mouse_pos:      { w:2, domain:"nerve",    bad: v => v==="Too far right/left — shoulder abduction"||v==="Elevated — shoulder shrug" },
  ergo_elbow_angle:    { w:2, domain:"rsi",      bad: v => v!=="90–100° (ideal)"&&v!=="" },
  ergo_shoulder_pos:   { w:3, domain:"ucs",      bad: v => v==="Elevated/shrugged"||v==="Protracted (rounded forward)"||v==="Elevated AND protracted" },
  ergo_sitting_hrs:    { w:3, domain:"lumbar",   bad: v => parseFloat(v||"0")>=7 },
  ergo_break_freq:     { w:2, domain:"lumbar",   bad: v => v==="Rarely (>60 min)"||v==="Never — works through" },
  ergo_rep_task:       { w:2, domain:"rsi",      bad: v => v==="High (>4h/day)"||v==="Highly repetitive (data entry / assembly)" },
  ergo_static_posture: { w:2, domain:"ucs",      bad: v => v==="Yes — >20 min sustained"||v==="Continuous static (microscopy, lab work)" },
  ergo_asymm_load:     { w:2, domain:"nerve",    bad: v => v==="Yes — sustained dominant side"||v==="Significant asymmetry" },
};

const ERGO_DOMAIN_LABELS = { cervical:"Cervical Strain", lumbar:"Lumbar Overload", ucs:"UCS Pattern", rsi:"RSI Risk", nerve:"Nerve Compression" };

function computeErgoRisks(data) {
  const ds={cervical:0,lumbar:0,ucs:0,rsi:0,nerve:0};
  const dm={cervical:0,lumbar:0,ucs:0,rsi:0,nerve:0};
  const faults=[];
  Object.entries(ERGO_RISK_CFG).forEach(([id,cfg])=>{
    dm[cfg.domain]=(dm[cfg.domain]||0)+cfg.w;
    const val=data[id]||"";
    if(val&&cfg.bad(val)){ ds[cfg.domain]=(ds[cfg.domain]||0)+cfg.w; faults.push(id); }
  });
  const rl=d=>{ const p=dm[d]>0?ds[d]/dm[d]:0; return p>=0.6?"High":p>=0.3?"Moderate":"Low"; };
  const total=Object.values(ds).reduce((a,b)=>a+b,0);
  const maxTotal=Object.values(dm).reduce((a,b)=>a+b,0);
  const op=maxTotal>0?total/maxTotal:0;
  return { ds, dm, faults, total, maxTotal, overall:op>=0.55?"High":op>=0.3?"Moderate":"Low",
    cervical:rl("cervical"), lumbar:rl("lumbar"), ucs:rl("ucs"), rsi:rl("rsi"), nerve:rl("nerve") };
}

function EF({ id, label, type, options, unit, min=0, max=10, step=1, placeholder="", data, set, note }) {
  const base={width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontFamily:"inherit",outline:"none",padding:"8px 10px",fontSize:"0.8rem"};
  const val=data[id]||"";
  const filled=val!=="";
  return (
    <div style={{background:C.surface,border:`1px solid ${filled?C.accent+"25":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5,gap:6}}>
        <label style={{fontSize:"0.78rem",fontWeight:600,color:filled?C.text:C.muted,lineHeight:1.4,flex:1}}>
          {label}{filled&&<span style={{color:C.green,marginLeft:5,fontSize:"0.6rem"}}>✓</span>}
        </label>
        {unit&&<span style={{fontSize:"0.62rem",color:C.muted,flexShrink:0}}>{unit}</span>}
      </div>
      {note&&<div style={{fontSize:"0.68rem",color:C.muted,marginBottom:6,lineHeight:1.4,fontStyle:"italic"}}>{note}</div>}
      {type==="select"&&<select value={val} onChange={e=>set(id,e.target.value)} style={base}><option value="">— select —</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>}
      {type==="range"&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:"0.68rem",color:C.muted}}>{min}{unit||""}</span><span style={{fontSize:"0.82rem",fontWeight:700,color:C.accent}}>{val||min}{unit||""}</span><span style={{fontSize:"0.68rem",color:C.muted}}>{max}{unit||""}</span></div><input type="range" min={min} max={max} step={step} value={val||min} onChange={e=>set(id,e.target.value)} style={{width:"100%",accentColor:C.accent,cursor:"pointer"}}/></div>}
      {type==="num"&&<input type="number" value={val} onChange={e=>set(id,e.target.value)} placeholder={placeholder} min={min} max={max} style={base}/>}
      {type==="textarea"&&<textarea value={val} onChange={e=>set(id,e.target.value)} placeholder={placeholder} rows={3} style={{...base,resize:"vertical",display:"block"}}/>}
    </div>
  );
}

function ErgoBadge({ level, label, score, max }) {
  const col=level==="High"?C.red:level==="Moderate"?C.yellow:C.green;
  const pct=max>0?Math.round(score/max*100):0;
  return (
    <div style={{background:C.s2,border:`1px solid ${col}40`,borderRadius:10,padding:"10px 12px",flex:1,minWidth:110}}>
      <div style={{fontSize:"0.58rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:C.muted,marginBottom:4}}>{label}</div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <span style={{fontWeight:800,fontSize:"0.95rem",color:col}}>{level}</span>
        <span style={{fontSize:"0.62rem",color:C.muted}}>{score}/{max}</span>
      </div>
      <div style={{height:4,background:C.s3,borderRadius:2}}><div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:2,transition:"width 0.4s"}}/></div>
    </div>
  );
}

const ERGO_FAULT_MSGS = {
  ergo_monitor_height:"Monitor height causes sustained head tilt → cervical joint compression",
  ergo_monitor_dist:"Non-optimal distance forces compensatory head position",
  ergo_monitor_glare:"Glare forces repeated head repositioning",
  ergo_head_angle:"Forward head posture significantly increases cervical loading",
  ergo_neck_rotation:"Sustained rotation → unilateral facet loading + IVD asymmetry",
  ergo_chair_height:"Chair height alters hip/knee/lumbar chain mechanics",
  ergo_lumbar_support:"Absent support → posterior pelvic tilt → disc compression",
  ergo_seat_depth:"Seat depth fault → hamstring tightness or popliteal pressure",
  ergo_foot_support:"Unsupported feet → thigh compression + lumbar strain",
  ergo_pelvic_tilt:"Pelvic malalignment reinforces LCS/UCS muscle imbalance patterns",
  ergo_keyboard_pos:"Keyboard position drives shoulder elevation and wrist deviation",
  ergo_wrist_dev:"Wrist deviation compresses carpal tunnel and stresses tendons",
  ergo_mouse_pos:"Mouse position creates asymmetric shoulder and neck loading",
  ergo_elbow_angle:"Non-ideal angle increases ulnar nerve tension at cubital tunnel",
  ergo_shoulder_pos:"Shoulder fault drives UCS pattern — pec minor / upper trap overload",
  ergo_sitting_hrs:"Prolonged sitting → gluteal inhibition + IVD nutritional deficit",
  ergo_break_freq:"Infrequent breaks → sustained IVD compression without recovery",
  ergo_rep_task:"High repetitive exposure → cumulative tendon and nerve stress",
  ergo_static_posture:"Sustained static load → muscle fatigue → compensation cascade",
  ergo_asymm_load:"Asymmetric loading → spinal rotation tendency + SI dysfunction",
};

function ErgoModule({ data, set }) {
  const [tab, setTab] = useState("workstation");
  const [open, setOpen] = useState({ws_chair:true,ws_monitor:true,ws_input:true,ws_env:false,ps_head:true,ps_shoulder:true,ps_lumbar:true,ps_ul:true,bh_sit:true,bh_brk:true,bh_task:true,bh_psy:false});
  const risks = computeErgoRisks(data);

  // Persist computed scores for diagnosis engine
  const storedScore = data.ergo_total_score;
  if(String(risks.total)!==storedScore){
    setTimeout(()=>{
      set("ergo_total_score",String(risks.total));
      set("ergo_cervical_risk",risks.cervical);
      set("ergo_lumbar_risk",risks.lumbar);
      set("ergo_ucs_risk",risks.ucs);
      set("ergo_rsi_risk",risks.rsi);
      set("ergo_nerve_risk",risks.nerve);
    },0);
  }

  const overallCol = risks.overall==="High"?C.red:risks.overall==="Moderate"?C.yellow:C.green;
  const tabs = [{key:"workstation",label:"Workstation",icon:"🪑"},{key:"posture",label:"Posture",icon:"🧍"},{key:"behaviour",label:"Behaviour",icon:"⏱️"},{key:"risks",label:"Risk Engine",icon:"📊"},{key:"plan",label:"Action Plan",icon:"📋"}];
  const tb = k=>({padding:"7px 12px",borderRadius:20,cursor:"pointer",fontSize:"0.72rem",fontWeight:tab===k?700:400,border:`1px solid ${tab===k?C.accent:C.border}`,background:tab===k?"rgba(0,229,255,0.1)":"transparent",color:tab===k?C.accent:C.muted,whiteSpace:"nowrap",transition:"all 0.15s"});

  const SH = ({id,label,children})=>{
    const isOpen=open[id]!==false;
    return (
      <div style={{marginBottom:14}}>
        <button type="button" onClick={()=>setOpen(p=>({...p,[id]:!isOpen}))} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",border:"none",cursor:"pointer",padding:"6px 0",marginBottom:isOpen?8:0}}>
          <div style={{fontSize:"0.63rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a2}}/>{label}</div>
          <span style={{color:C.muted,fontSize:"0.72rem"}}>{isOpen?"▲":"▼"}</span>
        </button>
        {isOpen&&children}
      </div>
    );
  };

  const FW = ({id})=>{
    const cfg=ERGO_RISK_CFG[id]; if(!cfg) return null;
    const val=data[id]||"";
    if(!val||!cfg.bad(val)) return null;
    return <div style={{display:"flex",gap:6,padding:"5px 10px",background:"rgba(255,179,0,0.08)",border:`1px solid ${C.yellow}30`,borderRadius:7,marginBottom:4,fontSize:"0.7rem",color:C.yellow}}><span style={{flexShrink:0}}>⚠</span><span>{ERGO_FAULT_MSGS[id]||"Ergonomic fault identified"}</span></div>;
  };

  const WorkstationTab = ()=>(
    <div>
      <SH id="ws_chair" label="Chair Ergonomics">
        <EF id="ergo_chair_height" label="Chair seat height" type="select" data={data} set={set} options={["Ideal — thighs parallel, feet flat","Too low — knees above hips","Too high — feet unsupported"]} note="Ideal: 90° hip & knee, feet flat on floor or footrest"/>
        <FW id="ergo_chair_height"/>
        <EF id="ergo_lumbar_support" label="Lumbar support" type="select" data={data} set={set} options={["Adequate — maintains lordosis","Inadequate — too low/high","Absent"]} note="Should sit at L2–L5 to maintain natural lordosis"/>
        <FW id="ergo_lumbar_support"/>
        <EF id="ergo_seat_depth" label="Seat pan depth" type="select" data={data} set={set} options={["Ideal — 2–4 finger gap behind knee","Too deep — edge pressure on popliteal","Too shallow — poor thigh support"]}/>
        <FW id="ergo_seat_depth"/>
        <EF id="ergo_armrest" label="Armrests" type="select" data={data} set={set} options={["Ideal — elbows 90°, no shoulder elevation","Too high — shoulder shrug","Too low — lateral lean","Absent"]}/>
        <EF id="ergo_foot_support" label="Foot / leg support" type="select" data={data} set={set} options={["Feet flat on floor (ideal)","Feet unsupported","Footrest in use","Crossed legs habitually"]}/>
        <FW id="ergo_foot_support"/>
      </SH>
      <SH id="ws_monitor" label="Monitor Setup">
        <EF id="ergo_monitor_height" label="Monitor top edge" type="select" data={data} set={set} options={["At or slightly below eye level (ideal)","Too high — head tilted back","Too low — forward head flexion"]} note="Top of monitor should align with eye level ±5cm"/>
        <FW id="ergo_monitor_height"/>
        <EF id="ergo_monitor_dist" label="Viewing distance" type="select" data={data} set={set} options={["50–70cm (ideal)","Too close (<50cm)","Too far (>80cm)"]}/>
        <FW id="ergo_monitor_dist"/>
        <EF id="ergo_monitor_glare" label="Screen glare / reflections" type="select" data={data} set={set} options={["None","Present","Managed with screen filter"]}/>
        <FW id="ergo_monitor_glare"/>
        <EF id="ergo_dual_monitor" label="Dual monitor setup" type="select" data={data} set={set} options={["N/A — single monitor","Centred equally (ideal)","One dominant — sustained neck rotation","Stacked — sustained vertical gaze"]}/>
        <EF id="ergo_neck_rotation" label="Sustained neck rotation to screen" type="select" data={data} set={set} options={["No — screen directly ahead","Yes — occasional (<25%)","Yes — sustained (>25% of work time)"]}/>
        <FW id="ergo_neck_rotation"/>
      </SH>
      <SH id="ws_input" label="Keyboard, Mouse & Input">
        <EF id="ergo_keyboard_pos" label="Keyboard position" type="select" data={data} set={set} options={["Ideal — elbows ~90°, forearms neutral","Too high — shoulder elevation","Too far — trunk lean forward","Too close — restricted elbow angle"]}/>
        <FW id="ergo_keyboard_pos"/>
        <EF id="ergo_elbow_angle" label="Elbow angle at keyboard" type="select" data={data} set={set} options={["90–100° (ideal)","<80° (too acute)","110–120° (moderate extension)","Full extension (>120°)"]}/>
        <FW id="ergo_elbow_angle"/>
        <EF id="ergo_wrist_dev" label="Wrist posture at keyboard" type="select" data={data} set={set} options={["Neutral — straight wrist (ideal)","Wrist extension","Ulnar deviation","Radial deviation","Combined extension + deviation"]} note="Neutral wrist = inline with forearm in all planes"/>
        <FW id="ergo_wrist_dev"/>
        <EF id="ergo_mouse_pos" label="Mouse position" type="select" data={data} set={set} options={["In-line with shoulder (ideal)","Too far right/left — shoulder abduction","Elevated — shoulder shrug","Too far forward — shoulder protraction"]}/>
        <FW id="ergo_mouse_pos"/>
        <EF id="ergo_mouse_grip" label="Mouse grip style" type="select" data={data} set={set} options={["Palm grip — neutral (ideal)","Fingertip / claw grip — intrinsic overload","Wrist anchored — restricted forearm rotation"]}/>
      </SH>
      <SH id="ws_env" label="Environment & Setup">
        <EF id="ergo_lighting" label="Ambient lighting" type="select" data={data} set={set} options={["Adequate, no glare (ideal)","Overhead glare on screen","Bright window behind screen","Insufficient — eye strain"]}/>
        <EF id="ergo_desk_height" label="Desk height" type="select" data={data} set={set} options={["Adjustable / sit-stand (ideal)","Fixed — appropriate height","Fixed — too high","Fixed — too low"]}/>
        <EF id="ergo_sitstand" label="Sit-stand desk usage" type="select" data={data} set={set} options={["N/A","Used appropriately (sit:stand ~60:40)","Available but rarely used","Stand-only — equally problematic"]}/>
        <EF id="ergo_phone_use" label="Phone / headset" type="select" data={data} set={set} options={["Headset used (ideal)","Cradle between ear and shoulder","Speaker phone","Minimal phone use"]}/>
        <EF id="ergo_doc_position" label="Document / reference position" type="select" data={data} set={set} options={["Document holder at screen level (ideal)","Flat on desk — sustained neck flexion","To the side — sustained rotation","Minimal document use"]}/>
        <EF id="ergo_workspace_notes" label="Additional workstation notes" type="textarea" data={data} set={set} placeholder="e.g. Multiple screens, unusual setup, relevant environmental factors..."/>
      </SH>
    </div>
  );

  const PostureTab = ()=>(
    <div>
      <div style={{background:C.s2,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:"0.75rem",color:C.muted,lineHeight:1.6}}>
        <strong style={{color:C.accent}}>Observe</strong> the patient at their workstation or recreate seated posture. Record what is present, not ideal.
      </div>
      <SH id="ps_head" label="Head & Cervical">
        <EF id="ergo_head_angle" label="Forward head angle" type="range" min={0} max={40} step={5} unit="°" data={data} set={set} note="0° = ear over shoulder (ideal). >15° = clinically significant. 30° = ~18kg effective cervical load."/>
        <FW id="ergo_head_angle"/>
        <EF id="ergo_chin_poke" label="Chin poke / protrusion" type="select" data={data} set={set} options={["Absent","Mild — occasional","Moderate — habitual","Severe — constant"]}/>
        <EF id="ergo_head_tilt_lat" label="Lateral head tilt at workstation" type="select" data={data} set={set} options={["None (neutral)","Left tilt — mild","Right tilt — mild","Significant left tilt","Significant right tilt"]}/>
        <EF id="ergo_neck_ext_pattern" label="Neck extension on upward gaze" type="select" data={data} set={set} options={["Not present","Mild extension when looking up","Sustained upper cervical extension"]}/>
      </SH>
      <SH id="ps_shoulder" label="Shoulder & Upper Quarter">
        <EF id="ergo_shoulder_pos" label="Shoulder position" type="select" data={data} set={set} options={["Neutral — relaxed, level (ideal)","Elevated/shrugged","Protracted (rounded forward)","Elevated AND protracted","Asymmetric elevation"]}/>
        <FW id="ergo_shoulder_pos"/>
        <EF id="ergo_scap_pos" label="Scapular position" type="select" data={data} set={set} options={["Neutral flat against thorax","Winging — serratus deficit","Elevated — upper trap dominant","Tipped forward — pec minor tight"]}/>
        <EF id="ergo_thoracic_kyphosis" label="Thoracic kyphosis tendency" type="select" data={data} set={set} options={["Normal — mild thoracic curve","Increased — moderate kyphosis","Increased — significant kyphosis","Flat thoracic — reduced mobility"]}/>
        <EF id="ergo_shoulder_abd" label="Shoulder abduction angle at mouse" type="range" min={0} max={45} step={5} unit="°" data={data} set={set} note="Ideal <15°. >25° = sustained rotator cuff load."/>
      </SH>
      <SH id="ps_lumbar" label="Lumbar & Pelvis">
        <EF id="ergo_pelvic_tilt" label="Pelvic position in sitting" type="select" data={data} set={set} options={["Neutral — slight anterior tilt (ideal)","Posterior tilt (slouch) — flattens lumbar","Anterior tilt — increased lumbar load","Laterally tilted"]}/>
        <FW id="ergo_pelvic_tilt"/>
        <EF id="ergo_lumbar_posture" label="Lumbar lordosis maintained?" type="select" data={data} set={set} options={["Yes — maintained throughout","Maintained early, lost with fatigue","Absent — seated flat back","Hyperlordotic in sitting"]}/>
        <EF id="ergo_hip_angle" label="Hip angle in seated position" type="select" data={data} set={set} options={["90–100° (ideal)","<90° — hip flexor shortened","110°+ — posterior pelvic tilt risk","Asymmetric hip position"]}/>
        <EF id="ergo_sitting_posture_note" label="General seated posture notes" type="textarea" data={data} set={set} placeholder="Describe overall posture, habitual patterns, compensation observed..."/>
      </SH>
      <SH id="ps_ul" label="Upper Limb & Wrist">
        <EF id="ergo_wrist_ext_angle" label="Wrist extension at rest" type="range" min={0} max={40} step={5} unit="°" data={data} set={set} note="Ideal: 0–10°. >15° = carpal tunnel risk."/>
        <EF id="ergo_forearm_pronation" label="Forearm rotation at keyboard" type="select" data={data} set={set} options={["Neutral pronation (ideal)","Full pronation — medial epicondyle load","Supinated — unusual","Asymmetric"]}/>
        <EF id="ergo_asymm_load" label="Asymmetric upper limb loading" type="select" data={data} set={set} options={["None — bilateral equal use","Yes — occasional","Yes — sustained dominant side","Significant asymmetry"]}/>
        <FW id="ergo_asymm_load"/>
        <EF id="ergo_thumb_use" label="Thumb posture (trackpad/mouse)" type="select" data={data} set={set} options={["Neutral","Sustained opposition — CMC stress","Abducted grip — de Quervain's risk"]}/>
      </SH>
    </div>
  );

  const BehaviourTab = ()=>(
    <div>
      <SH id="bh_sit" label="Sitting & Work Duration">
        <EF id="ergo_sitting_hrs" label="Total seated hours/day" type="range" min={0} max={12} step={0.5} unit="h" data={data} set={set} note="7+ hours = high lumbar IVD load and gluteal inhibition risk"/>
        <FW id="ergo_sitting_hrs"/>
        <EF id="ergo_longest_sit" label="Longest unbroken sit" type="select" data={data} set={set} options={["<20 min (excellent)","20–40 min (good)","40–60 min (moderate risk)","60–90 min (high risk)","90+ min (very high risk)"]}/>
        <EF id="ergo_work_hrs_total" label="Total work hours/day" type="range" min={4} max={16} step={1} unit="h" data={data} set={set}/>
        <EF id="ergo_work_pattern" label="Work schedule pattern" type="select" data={data} set={set} options={["Standard hours (8–5)","Shift work","Night shifts","Split shifts","Variable / irregular"]}/>
      </SH>
      <SH id="bh_brk" label="Movement & Microbreak Behaviour">
        <EF id="ergo_break_freq" label="Microbreak frequency" type="select" data={data} set={set} options={["Every 20–30 min (ideal)","Every 45–60 min (acceptable)","Rarely (>60 min)","Never — works through","Uses break software/timer"]}/>
        <FW id="ergo_break_freq"/>
        <EF id="ergo_break_type" label="Break activity" type="select" data={data} set={set} options={["Walking + movement (ideal)","Standing only","Seated rest","Different screen (phone)","No intentional break"]}/>
        <EF id="ergo_posture_awareness" label="Posture self-awareness" type="select" data={data} set={set} options={["High — self-corrects regularly","Moderate — corrects when reminded","Low — rarely considers posture","None — unaware of posture issues"]}/>
      </SH>
      <SH id="bh_task" label="Task & Repetition Analysis">
        <EF id="ergo_rep_task" label="Repetitive task exposure" type="select" data={data} set={set} options={["Low (<2h/day repetitive)","Moderate (2–4h/day)","High (>4h/day)","Highly repetitive (data entry / assembly)"]}/>
        <FW id="ergo_rep_task"/>
        <EF id="ergo_static_posture" label="Sustained static posture" type="select" data={data} set={set} options={["No — frequent movement","Yes — occasional (<20 min)","Yes — >20 min sustained","Continuous static (microscopy, lab work)"]}/>
        <FW id="ergo_static_posture"/>
        <EF id="ergo_task_var" label="Task variety / job rotation" type="select" data={data} set={set} options={["High variety","Moderate variety","Low — 1–2 primary tasks","None — single repetitive task all day"]}/>
        <EF id="ergo_force_req" label="Force requirements" type="select" data={data} set={set} options={["Minimal (keyboard/mouse only)","Light force (writing, drawing)","Moderate (manual inspection)","Heavy (workshop, lab equipment)"]}/>
        <EF id="ergo_vibration" label="Vibration exposure" type="select" data={data} set={set} options={["None","Hand-arm vibration (power tools)","Whole-body vibration (driving)","Both"]}/>
        <EF id="ergo_asymm_load" label="Asymmetric upper limb loading" type="select" data={data} set={set} options={["None — bilateral equal use","Yes — occasional","Yes — sustained dominant side","Significant asymmetry"]}/>
        <FW id="ergo_asymm_load"/>
      </SH>
      <SH id="bh_psy" label="Psychosocial Factors">
        <EF id="ergo_work_stress" label="Perceived work stress" type="range" min={0} max={10} step={1} unit="/10" data={data} set={set} note="High psychosocial stress amplifies MSK pain and slows recovery."/>
        <EF id="ergo_deadline_pressure" label="Deadline / time pressure" type="select" data={data} set={set} options={["Low — flexible pacing","Moderate","High — frequent deadlines","Constant high pressure"]}/>
        <EF id="ergo_job_control" label="Control over work pace / ergonomics" type="select" data={data} set={set} options={["High — adjusts setup freely","Moderate","Low — fixed workstation/pace","None — fixed assembly line"]}/>
      </SH>
    </div>
  );

  const RisksTab = ()=>{
    const faults=risks.faults;
    const correlations=[
      {symptom:"Headache / cervicogenic",  drivers:["ergo_head_angle","ergo_monitor_height","ergo_neck_rotation","ergo_chin_poke"]},
      {symptom:"Neck pain / stiffness",    drivers:["ergo_head_angle","ergo_shoulder_pos","ergo_monitor_height","ergo_static_posture"]},
      {symptom:"Low back pain",            drivers:["ergo_chair_height","ergo_lumbar_support","ergo_sitting_hrs","ergo_break_freq","ergo_pelvic_tilt"]},
      {symptom:"Shoulder / rotator cuff",  drivers:["ergo_shoulder_pos","ergo_mouse_pos","ergo_keyboard_pos","ergo_shoulder_abd"]},
      {symptom:"Wrist / carpal tunnel",    drivers:["ergo_wrist_dev","ergo_keyboard_pos","ergo_rep_task","ergo_wrist_ext_angle"]},
      {symptom:"Elbow / epicondylalgia",   drivers:["ergo_elbow_angle","ergo_mouse_grip","ergo_rep_task","ergo_force_req"]},
      {symptom:"Thoracic / mid-back pain", drivers:["ergo_thoracic_kyphosis","ergo_lumbar_support","ergo_sitting_hrs","ergo_static_posture"]},
      {symptom:"Upper limb paraesthesia",  drivers:["ergo_shoulder_pos","ergo_elbow_angle","ergo_wrist_dev","ergo_keyboard_pos"]},
    ];
    return (
      <div>
        {/* Score card */}
        <div style={{background:C.s2,border:`2px solid ${overallCol}50`,borderRadius:14,padding:"16px 18px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontSize:"0.6rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.muted,marginBottom:4}}>Overall Ergonomic Risk Score</div>
              <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                <span style={{fontSize:"2.4rem",fontWeight:900,color:overallCol,lineHeight:1}}>{risks.total}</span>
                <span style={{fontSize:"0.9rem",color:C.muted}}>/ {risks.maxTotal}</span>
                <span style={{padding:"3px 10px",borderRadius:20,background:`${overallCol}20`,color:overallCol,fontWeight:800,fontSize:"0.8rem",marginLeft:4}}>{risks.overall} Risk</span>
              </div>
            </div>
            <div style={{fontSize:"0.72rem",color:C.muted,lineHeight:1.6,maxWidth:220}}>
              {risks.overall==="High"?"⚠️ Significant ergonomic load. Immediate workstation modification required.":risks.overall==="Moderate"?"⚡ Moderate ergonomic exposure. Targeted corrections advised.":"✅ Low ergonomic risk. Maintenance and monitoring."}
            </div>
          </div>
          <div style={{height:6,background:C.s3,borderRadius:4}}><div style={{height:"100%",width:`${Math.round(risks.total/risks.maxTotal*100)}%`,background:`linear-gradient(90deg,${C.green},${C.yellow},${C.red})`,borderRadius:4,transition:"width 0.5s"}}/></div>
        </div>
        {/* Domain badges */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {Object.entries(ERGO_DOMAIN_LABELS).map(([d,l])=>(
            <ErgoBadge key={d} level={risks[d]} label={l} score={risks.ds[d]||0} max={risks.dm[d]||1}/>
          ))}
        </div>
        {/* Active faults */}
        {faults.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:8,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a2}}/>Active Faults ({faults.length})</div>
            {faults.map(id=>{
              const cfg=ERGO_RISK_CFG[id];
              const col=cfg.w>=3?C.red:C.yellow;
              return (
                <div key={id} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 10px",background:C.surface,border:`1px solid ${col}30`,borderRadius:8,marginBottom:4,fontSize:"0.73rem"}}>
                  <span style={{color:col,flexShrink:0}}>{cfg.w>=3?"🔴":"🟡"}</span>
                  <span style={{color:C.text,flex:1}}>{id.replace("ergo_","").replace(/_/g," ")}</span>
                  <span style={{fontSize:"0.6rem",padding:"1px 6px",borderRadius:6,background:`${col}15`,color:col}}>{ERGO_DOMAIN_LABELS[cfg.domain]}</span>
                </div>
              );
            })}
          </div>
        )}
        {/* Symptom correlation */}
        <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:8,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a2}}/>Body Region — Workstation Correlation</div>
        {correlations.map(c=>{
          const matched=c.drivers.filter(d=>faults.includes(d));
          const pct=matched.length/c.drivers.length;
          const col=pct>=0.5?C.red:pct>=0.25?C.yellow:C.green;
          return (
            <div key={c.symptom} style={{background:C.surface,border:`1px solid ${matched.length>0?col+"40":C.border}`,borderRadius:10,padding:"9px 12px",marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:matched.length>0?5:0}}>
                <span style={{fontWeight:600,fontSize:"0.78rem",color:matched.length>0?C.text:C.muted}}>{c.symptom}</span>
                <span style={{fontSize:"0.65rem",fontWeight:700,padding:"2px 7px",borderRadius:8,background:`${col}15`,color:col}}>{matched.length}/{c.drivers.length} drivers</span>
              </div>
              {matched.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{matched.map(f=><span key={f} style={{fontSize:"0.6rem",padding:"2px 7px",borderRadius:6,background:C.s3,color:C.yellow,border:`1px solid ${C.yellow}25`}}>{f.replace("ergo_","").replace(/_/g," ")}</span>)}</div>}
            </div>
          );
        })}
        {/* Future hooks */}
        <div style={{marginTop:16,background:C.s2,border:`1px solid ${C.a2}30`,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:8}}>🔮 Future Integration Hooks</div>
          {[{icon:"📷",label:"Webcam Posture Analysis",desc:"Real-time AI posture angle measurement"},{icon:"⌚",label:"Wearable Sensor Integration",desc:"IMU / smartwatch postural load import"},{icon:"🤖",label:"AI Posture Tracking",desc:"Continuous scoring with deviation alerts"},{icon:"📈",label:"Longitudinal Risk Tracking",desc:"Session-to-session score comparison"}].map(h=>(
            <div key={h.label} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:"1rem",flexShrink:0}}>{h.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:"0.74rem",fontWeight:600,color:C.muted}}>{h.label}</div><div style={{fontSize:"0.66rem",color:C.muted,opacity:0.7}}>{h.desc}</div></div>
              <span style={{fontSize:"0.6rem",padding:"2px 7px",borderRadius:8,background:"rgba(127,90,240,0.15)",color:C.a2,fontWeight:700}}>Planned</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CORRECTIONS = {
    ergo_monitor_height:  {priority:"High",  area:"Monitor",      action:"Raise/lower monitor so top edge aligns with eye level. Use monitor stand or adjustable arm."},
    ergo_monitor_dist:    {priority:"Medium", area:"Monitor",      action:"Position monitor 50–70cm from eyes. Use arm's length as a quick guide."},
    ergo_monitor_glare:   {priority:"Medium", area:"Environment",  action:"Reposition monitor perpendicular to windows. Add anti-glare filter or adjust blinds."},
    ergo_head_angle:      {priority:"High",  area:"Posture",       action:"Raise monitor and adjust seating to reduce forward head. Prescribe chin tuck retraining x10 hourly."},
    ergo_neck_rotation:   {priority:"High",  area:"Monitor",       action:"Centre primary monitor directly ahead. Adjust dual-monitor layout to within ±35°."},
    ergo_chair_height:    {priority:"High",  area:"Chair",         action:"Adjust chair: hips and knees 90–100°, feet flat or footrest used."},
    ergo_lumbar_support:  {priority:"High",  area:"Chair",         action:"Set lumbar support at L2–L5. Add lumbar roll if inadequate. Maintain lordosis throughout day."},
    ergo_seat_depth:      {priority:"Medium", area:"Chair",        action:"Adjust seat depth: 2–4 finger gap behind knee to popliteal fossa."},
    ergo_foot_support:    {priority:"Medium", area:"Chair",        action:"Add footrest if feet unsupported. Eliminate crossed-leg habit."},
    ergo_pelvic_tilt:     {priority:"High",  area:"Posture",       action:"Cue anterior pelvic tilt awareness. Prescribe seated pelvic clock x10. Reassess lumbar support."},
    ergo_keyboard_pos:    {priority:"High",  area:"Input",         action:"Position keyboard so elbows at 90° and wrists neutral. Use keyboard tray if needed."},
    ergo_wrist_dev:       {priority:"High",  area:"Input",         action:"Use wrist-neutral keyboard layout. Remove wrist rests during active typing. Prescribe wrist neutral drills."},
    ergo_mouse_pos:       {priority:"High",  area:"Input",         action:"Move mouse immediately beside keyboard. Keep shoulder adducted <15° during use."},
    ergo_elbow_angle:     {priority:"Medium", area:"Input",        action:"Adjust seating or keyboard height to achieve 90–100° elbow flexion."},
    ergo_shoulder_pos:    {priority:"High",  area:"Posture",       action:"Prescribe scapular retraction cue. Lower armrests. Move mouse closer. Serratus activation program."},
    ergo_sitting_hrs:     {priority:"High",  area:"Behaviour",     action:"Implement sit-stand protocol: 45 min sit / 15 min stand/move. Use height-adjustable desk."},
    ergo_break_freq:      {priority:"High",  area:"Behaviour",     action:"Set 20–25 min movement timer. Microbreak = stand + 5 key movements (neck, shoulder, hip flex stretch)."},
    ergo_rep_task:        {priority:"Medium", area:"Behaviour",    action:"Introduce task rotation every 45–60 min. Vary between high and low repetition tasks."},
    ergo_static_posture:  {priority:"High",  area:"Behaviour",     action:"Postural variation every 20 min. Prescribe postural reset: 3 reps each for neck, shoulder, thoracic."},
    ergo_asymm_load:      {priority:"Medium", area:"Posture",      action:"Identify asymmetric driver (mouse, phone). Redistribute load bilaterally. Strengthen contralateral stabilisers."},
    ergo_dual_monitor:    {priority:"Medium", area:"Monitor",      action:"Centre monitors equally OR set one primary directly ahead. Keep secondary within ±35°."},
    ergo_phone_use:       {priority:"Medium", area:"Equipment",    action:"Provide headset or speakerphone. Eliminate shoulder-cradle habit immediately."},
  };

  const PlanTab = ()=>{
    const faults=risks.faults;
    const highP=faults.filter(f=>CORRECTIONS[f]?.priority==="High");
    const medP=faults.filter(f=>CORRECTIONS[f]?.priority==="Medium");
    const movPx=[];
    if(risks.cervical==="High"||risks.cervical==="Moderate") movPx.push({label:"Cervical Mobility",freq:"Every 30 min",ex:["Chin tucks ×10","Cervical rotation L+R ×8","Cervical lateral flex ×8","Upper trap stretch 30s each side"]});
    if(risks.lumbar==="High"||risks.lumbar==="Moderate")    movPx.push({label:"Lumbar Activation",freq:"Every 45 min",ex:["Seated pelvic clock ×10","Hip flexor standing stretch 30s","Brief walk 2–3 min","Seated glute press ×15"]});
    if(risks.ucs==="High"||risks.ucs==="Moderate")         movPx.push({label:"UCS Postural Reset",freq:"Every 20 min",ex:["Scapular retraction ×10 (5s hold)","Thoracic extension over chair ×5","Wall slide W-Y ×10","DNF chin nod ×10"]});
    if(risks.rsi==="High"||risks.rsi==="Moderate")         movPx.push({label:"Upper Limb Care",freq:"Every 60 min",ex:["Wrist flex/ext stretch 30s","Tendon glides ×10","Forearm pronation/supination ×15","Grip relaxation + intrinsic stretch"]});
    return (
      <div>
        {faults.length===0?(
          <div style={{textAlign:"center",padding:30,color:C.muted}}><div style={{fontSize:"2rem",marginBottom:8}}>📋</div><div>Complete Workstation, Posture and Behaviour tabs to generate a personalised action plan.</div></div>
        ):(
          <>
            {highP.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.red,marginBottom:8,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.red}}/>🔴 High Priority ({highP.length})</div>
                {highP.map(id=>{const c=CORRECTIONS[id];return c?(
                  <div key={id} style={{background:C.surface,border:`1px solid ${C.red}30`,borderLeft:`3px solid ${C.red}`,borderRadius:10,padding:"10px 13px",marginBottom:7}}>
                    <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <span style={{fontSize:"0.58rem",fontWeight:700,padding:"2px 7px",borderRadius:6,background:`${C.red}20`,color:C.red,flexShrink:0,marginTop:1}}>{c.area}</span>
                      <div><div style={{fontSize:"0.7rem",fontWeight:600,color:C.muted,marginBottom:2}}>{id.replace("ergo_","").replace(/_/g," ")}</div><div style={{fontSize:"0.78rem",color:C.text,lineHeight:1.5}}>{c.action}</div></div>
                    </div>
                  </div>
                ):null;})}
              </div>
            )}
            {medP.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.yellow,marginBottom:8,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.yellow}}/>🟡 Medium Priority ({medP.length})</div>
                {medP.map(id=>{const c=CORRECTIONS[id];return c?(
                  <div key={id} style={{background:C.surface,border:`1px solid ${C.yellow}25`,borderLeft:`3px solid ${C.yellow}`,borderRadius:10,padding:"10px 13px",marginBottom:7}}>
                    <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <span style={{fontSize:"0.58rem",fontWeight:700,padding:"2px 7px",borderRadius:6,background:`${C.yellow}15`,color:C.yellow,flexShrink:0,marginTop:1}}>{c.area}</span>
                      <div><div style={{fontSize:"0.7rem",fontWeight:600,color:C.muted,marginBottom:2}}>{id.replace("ergo_","").replace(/_/g," ")}</div><div style={{fontSize:"0.78rem",color:C.text,lineHeight:1.5}}>{c.action}</div></div>
                    </div>
                  </div>
                ):null;})}
              </div>
            )}
            {movPx.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a3,marginBottom:8,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a3}}/>🏃 Movement Break Prescription</div>
                {movPx.map(mp=>(
                  <div key={mp.label} style={{background:C.surface,border:`1px solid ${C.a3}30`,borderRadius:10,padding:"11px 13px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{fontWeight:700,fontSize:"0.82rem",color:C.a3}}>{mp.label}</div>
                      <span style={{fontSize:"0.62rem",padding:"2px 7px",borderRadius:8,background:`${C.a3}15`,color:C.a3}}>⏱ {mp.freq}</span>
                    </div>
                    {mp.ex.map((e,i)=><div key={i} style={{display:"flex",gap:8,padding:"3px 0",fontSize:"0.76rem",color:C.text}}><span style={{color:C.a3,flexShrink:0}}>→</span><span>{e}</span></div>)}
                  </div>
                ))}
              </div>
            )}
            <div style={{marginTop:8}}>
              <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:8,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a2}}/>Clinician Notes — Ergonomic</div>
              <EF id="ergo_clinician_notes" label="Notes / employer recommendations" type="textarea" data={data} set={set} placeholder="Workplace recommendations, equipment requests, employer letter notes, review date..."/>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      {risks.total>0&&(
        <div style={{background:`${overallCol}10`,border:`1px solid ${overallCol}40`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{fontWeight:800,color:overallCol,fontSize:"0.88rem"}}>{risks.overall==="High"?"🔴":risks.overall==="Moderate"?"🟡":"✅"} Ergonomic Risk: {risks.overall}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {Object.entries(ERGO_DOMAIN_LABELS).map(([d,l])=>{
              const col=risks[d]==="High"?C.red:risks[d]==="Moderate"?C.yellow:null;
              return col?<span key={d} style={{fontSize:"0.62rem",padding:"2px 7px",borderRadius:8,background:`${col}15`,color:col,fontWeight:700}}>{l}: {risks[d]}</span>:null;
            })}
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {tabs.map(t=><button key={t.key} type="button" onClick={()=>setTab(t.key)} style={tb(t.key)}>{t.icon} {t.label}</button>)}
      </div>
      {tab==="workstation" && <WorkstationTab/>}
      {tab==="posture"     && <PostureTab/>}
      {tab==="behaviour"   && <BehaviourTab/>}
      {tab==="risks"       && <RisksTab/>}
      {tab==="plan"        && <PlanTab/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAIT ANALYSIS MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const GAIT_PHASES = [
  {id:"g_ic",   phase:"Initial Contact",  pct:"0%",    type:"stance", deviations:["Foot flat contact","Heel strike absent","Excessive plantarflexion","Knee hyperextension at contact"]},
  {id:"g_lr",   phase:"Loading Response", pct:"0–12%", type:"stance", deviations:["Excessive knee flexion","Contralateral pelvic drop","Foot pronation/supination","Antalgic load transfer"]},
  {id:"g_ms",   phase:"Mid Stance",       pct:"12–31%",type:"stance", deviations:["Trendelenburg sign","Lateral trunk lean","Knee recurvatum","Excessive dorsiflexion"]},
  {id:"g_ts",   phase:"Terminal Stance",  pct:"31–50%",type:"stance", deviations:["Absent heel rise","Reduced push-off","Hip hiking","Ankle rocker deficit"]},
  {id:"g_ps",   phase:"Pre-Swing",        pct:"50–62%",type:"stance", deviations:["Reduced knee flexion","Toe drag","Hip extension deficit","Reduced propulsion"]},
  {id:"g_isw",  phase:"Initial Swing",    pct:"62–75%",type:"swing",  deviations:["Foot drop","Circumduction","Hip hiking","Excessive hip flexion compensation"]},
  {id:"g_msw",  phase:"Mid Swing",        pct:"75–87%",type:"swing",  deviations:["Foot clearance deficit","Steppage gait","Scissoring","Stiff knee swing"]},
  {id:"g_tsw",  phase:"Terminal Swing",   pct:"87–100%",type:"swing", deviations:["Knee extension deficit","Foot slap anticipation","Forward trunk lean","Reduced deceleration"]},
];

const ABNORMAL_GAITS = [
  {id:"ag_trend",  label:"Trendelenburg",  cause:"Weak gluteus medius",         sign:"Contralateral pelvis drops in stance"},
  {id:"ag_antalgic",label:"Antalgic",      cause:"Pain avoidance",              sign:"Shortened stance on affected side"},
  {id:"ag_steppage",label:"Steppage",      cause:"Foot drop / tibialis anterior", sign:"Excessive hip/knee flexion to clear foot"},
  {id:"ag_hemi",   label:"Hemiplegic",     cause:"Stroke / UMN lesion",         sign:"Circumduction, arm held adducted/flexed"},
  {id:"ag_scissor",label:"Scissor",        cause:"Bilateral spasticity",         sign:"Knees cross midline, narrow base"},
  {id:"ag_waddling",label:"Waddling",      cause:"Bilateral hip weakness",       sign:"Exaggerated lateral trunk sway bilaterally"},
  {id:"ag_ataxic", label:"Ataxic",         cause:"Cerebellar dysfunction",       sign:"Wide base, irregular cadence, staggering"},
  {id:"ag_parkinson",label:"Parkinsonian", cause:"Parkinson's disease",          sign:"Shuffling, festination, reduced arm swing"},
  {id:"ag_vaulting",label:"Vaulting",      cause:"Leg length discrepancy",       sign:"Excessive plantarflexion on shorter side"},
];

const GAIT_SCALES = [
  {id:"g_fac",  label:"FAC",  full:"Functional Ambulation Classification", range:"0–5",  cutoffs:"0=non-ambulatory, 3=supervised, 5=independent all terrain"},
  {id:"g_dgi",  label:"DGI",  full:"Dynamic Gait Index",                   range:"/24",  cutoffs:"<19 = fall risk; 22+ = community ambulation"},
  {id:"g_fga",  label:"FGA",  full:"Functional Gait Assessment",           range:"/30",  cutoffs:"<22 = fall risk in community-dwelling older adults"},
  {id:"g_berg", label:"Berg", full:"Berg Balance Scale",                   range:"/56",  cutoffs:"<45 = fall risk; <36 = almost always fall"},
  {id:"g_tinetti",label:"Tinetti POMA",full:"Performance-Oriented Mobility Assessment",range:"/28", cutoffs:"<19 = high fall risk; 19–24 = moderate"},
  {id:"g_wgs",  label:"Wisconsin", full:"Wisconsin Gait Scale",            range:"/14",  cutoffs:"Higher = more deviation (stroke)"},
];

function GaitModule({ data, set }) {
  const [tab, setTab] = useState("profile");
  const [openSec, setOpenSec] = useState({oga_ant:true,oga_lat:true,oga_post:true});

  const tabs = [
    {key:"profile",  label:"Profile",        icon:"👤"},
    {key:"oga",      label:"Observation",    icon:"👁️"},
    {key:"phases",   label:"Gait Phases",    icon:"🔄"},
    {key:"spatio",   label:"Parameters",     icon:"📐"},
    {key:"timed",    label:"Timed Tests",    icon:"⏱️"},
    {key:"scales",   label:"Scales",         icon:"📊"},
    {key:"abnormal", label:"Gait Pattern",   icon:"🚨"},
    {key:"muscles",  label:"Muscle/Joint",   icon:"💪"},
    {key:"plan",     label:"Plan & Goals",   icon:"📋"},
  ];
  const tb = k=>({padding:"7px 11px",borderRadius:20,cursor:"pointer",fontSize:"0.72rem",fontWeight:tab===k?700:400,border:`1px solid ${tab===k?C.accent:C.border}`,background:tab===k?"rgba(0,229,255,0.1)":"transparent",color:tab===k?C.accent:C.muted,whiteSpace:"nowrap",transition:"all 0.15s"});
  const inp = {width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontFamily:"inherit",outline:"none",padding:"8px 10px",fontSize:"0.8rem"};
  const row = (label, id, type="text", opts=null, note=null)=>{
    const val=data[id]||"";
    return(
      <div style={{background:C.surface,border:`1px solid ${val?C.accent+"25":C.border}`,borderRadius:10,padding:"9px 12px",marginBottom:7}}>
        <div style={{fontSize:"0.76rem",fontWeight:600,color:val?C.text:C.muted,marginBottom:5}}>{label}{val&&<span style={{color:C.green,marginLeft:5,fontSize:"0.6rem"}}>✓</span>}</div>
        {note&&<div style={{fontSize:"0.67rem",color:C.muted,marginBottom:5,fontStyle:"italic"}}>{note}</div>}
        {type==="select"&&<select value={val} onChange={e=>set(id,e.target.value)} style={inp}><option value="">— select —</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>}
        {type==="text"&&<input value={val} onChange={e=>set(id,e.target.value)} style={inp}/>}
        {type==="num"&&<input type="number" value={val} onChange={e=>set(id,e.target.value)} style={inp}/>}
        {type==="textarea"&&<textarea value={val} onChange={e=>set(id,e.target.value)} rows={3} style={{...inp,resize:"vertical",display:"block"}}/>}
        {type==="range"&&opts&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:"0.67rem",color:C.muted}}>{opts[0]}</span><span style={{fontWeight:700,color:C.accent}}>{val||opts[0]}</span><span style={{fontSize:"0.67rem",color:C.muted}}>{opts[1]}</span></div><input type="range" min={opts[0]} max={opts[1]} step={opts[2]||1} value={val||opts[0]} onChange={e=>set(id,e.target.value)} style={{width:"100%",accentColor:C.accent}}/></div>}
      </div>
    );
  };

  const SH = ({id,label,children})=>{
    const isOpen=openSec[id]!==false;
    return(<div style={{marginBottom:12}}>
      <button type="button" onClick={()=>setOpenSec(p=>({...p,[id]:!isOpen}))} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",border:"none",cursor:"pointer",padding:"5px 0",marginBottom:isOpen?7:0}}>
        <div style={{fontSize:"0.63rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a2}}/>{label}</div>
        <span style={{color:C.muted,fontSize:"0.72rem"}}>{isOpen?"▲":"▼"}</span>
      </button>
      {isOpen&&children}
    </div>);
  };

  // Fall risk calculator
  const tugSec = parseFloat(data.g_tug||"0");
  const bergScore = parseInt(data.g_berg||"99");
  const fagScore = parseInt(data.g_fac||"5");
  const fallRisk = (tugSec>=13.5||bergScore<45||fagScore<=2) ? "High" : (tugSec>=12||bergScore<50) ? "Moderate" : tugSec>0||bergScore<99 ? "Low" : null;
  const fallCol = fallRisk==="High"?C.red:fallRisk==="Moderate"?C.yellow:C.green;

  // Active abnormal gaits
  const activeGaits = ABNORMAL_GAITS.filter(g=>data[g.id]==="Present");
  // Phase deviations
  const phaseDeviations = GAIT_PHASES.filter(p=>data[p.id+"_dev"]&&data[p.id+"_dev"]!=="None");

  return (
    <div>
      {/* Summary banner */}
      {(fallRisk||activeGaits.length>0)&&(
        <div style={{background:fallRisk==="High"?"rgba(255,77,109,0.1)":"rgba(255,179,0,0.08)",border:`1px solid ${fallCol}40`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          {fallRisk&&<span style={{fontWeight:800,color:fallCol,fontSize:"0.85rem"}}>{fallRisk==="High"?"🔴":"🟡"} Fall Risk: {fallRisk}</span>}
          {activeGaits.map(g=><span key={g.id} style={{fontSize:"0.65rem",padding:"2px 8px",borderRadius:8,background:`${C.yellow}15`,color:C.yellow,fontWeight:600}}>{g.label}</span>)}
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {tabs.map(t=><button key={t.key} type="button" onClick={()=>setTab(t.key)} style={tb(t.key)}>{t.icon} {t.label}</button>)}
      </div>

      {/* ── PROFILE ── */}
      {tab==="profile"&&<div>
        <SH id="pf_basic" label="Patient Profile">
          {row("Chief Complaint","g_complaint","textarea")}
          {row("Pain Location","g_pain_loc")}
          {row("VAS Pain Score (0–10)","g_vas","range",[0,10,1])}
          {row("Duration of Gait Problem","g_duration")}
          {row("Assistive Device","g_device","select",["None","Walking stick (ipsilateral)","Walking stick (contralateral)","Forearm crutch","Axillary crutch","Zimmer frame","Rollator","Wheelchair (part-time)","AFO"])}
          {row("Footwear Type","g_footwear","select",["Barefoot","Standard shoes","Running shoes","Orthopaedic shoes","Custom orthotic","AFO in shoe","Open sandal"])}
          {row("Medical / Surgical History","g_hx","textarea")}
          {row("Relevant Diagnosis","g_diagnosis")}
        </SH>
      </div>}

      {/* ── OBSERVATIONAL GAIT ANALYSIS ── */}
      {tab==="oga"&&<div>
        <div style={{background:C.s2,borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:"0.75rem",color:C.muted,lineHeight:1.6}}>
          <strong style={{color:C.accent}}>OGA:</strong> Observe from all 3 planes. Record what is present, not what is expected.
        </div>
        <SH id="oga_ant" label="Anterior View">
          {row("Head position","g_oga_head","select",["Midline","Left lateral tilt","Right lateral tilt","Forward flexion"])}
          {row("Shoulder symmetry","g_oga_shoulder","select",["Level (normal)","Left elevated","Right elevated","Asymmetric rotation"])}
          {row("Arm swing — Left","g_oga_arm_l","select",["Normal","Reduced","Absent","Exaggerated","Held fixed"])}
          {row("Arm swing — Right","g_oga_arm_r","select",["Normal","Reduced","Absent","Exaggerated","Held fixed"])}
          {row("Trunk alignment","g_oga_trunk_ant","select",["Midline","Lateral lean left","Lateral lean right","Rotation present"])}
          {row("Pelvic frontal alignment","g_oga_pelvis_ant","select",["Level","Left drop (R stance — Trendelenburg)","Right drop (L stance — Trendelenburg)","Bilateral drop (waddling)"])}
          {row("Knee alignment (frontal)","g_oga_knee_front","select",["Neutral","Genu valgum","Genu varum","Asymmetric"])}
          {row("Foot progression angle","g_oga_foot_angle","select",["Neutral (5–10° ER)","In-toeing","Out-toeing","Asymmetric"])}
          {row("Base of support","g_oga_bos","select",["Normal (5–10cm)","Narrow (<5cm)","Wide (>10cm)"])}
        </SH>
        <SH id="oga_lat" label="Lateral View">
          {row("Trunk lean (sagittal)","g_oga_trunk_lat","select",["Upright (normal)","Anterior lean","Posterior lean","Flexed trunk"])}
          {row("Hip ROM (sagittal)","g_oga_hip_rom","select",["Normal (40° flex / 10° ext)","Reduced flexion","Reduced extension","Both reduced"])}
          {row("Knee flexion pattern","g_oga_knee_flex","select",["Normal (0–60° swing)","Stiff knee swing","Excess flexion","Hyperextension in stance"])}
          {row("Ankle motion","g_oga_ankle","select",["Normal rocker sequence","Reduced dorsiflexion","Foot drop","Equinus pattern","Flat foot contact"])}
          {row("Head/cervical position","g_oga_head_lat","select",["Neutral","Forward head posture","Flexed","Extended"])}
          {row("Step length symmetry","g_oga_step_sym","select",["Symmetrical","Left shorter","Right shorter","Markedly asymmetric"])}
        </SH>
        <SH id="oga_post" label="Posterior View">
          {row("Pelvic drop (posterior)","g_oga_pelvis_post","select",["None","Left drops in R stance","Right drops in L stance","Bilateral"])}
          {row("Heel rise pattern","g_oga_heel_rise","select",["Bilateral normal","Reduced left","Reduced right","Absent bilateral"])}
          {row("Subtalar motion","g_oga_subtalar","select",["Neutral","Excess pronation left","Excess pronation right","Excess supination","Bilateral pronation"])}
          {row("Foot clearance","g_oga_clearance","select",["Adequate bilateral","Reduced left (foot drag risk)","Reduced right (foot drag risk)","Bilateral deficit"])}
          {row("Heel strike pattern","g_oga_heel_strike","select",["Bilateral heel strike","Left heel strike absent","Right heel strike absent","Bilateral flat/toe contact"])}
        </SH>
        {row("General OGA notes","g_oga_notes","textarea",null,"Additional observations, compensatory strategies, video notes...")}
      </div>}

      {/* ── GAIT PHASES ── */}
      {tab==="phases"&&<div>
        <div style={{background:C.s2,borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:"0.75rem",color:C.muted,lineHeight:1.6}}>
          <strong style={{color:C.accent}}>Gait Cycle:</strong> Stance 60% | Swing 40%. Flag deviations found in each sub-phase.
        </div>
        {/* Summary of deviations */}
        {phaseDeviations.length>0&&(
          <div style={{background:"rgba(255,179,0,0.06)",border:`1px solid ${C.yellow}30`,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
            <div style={{fontSize:"0.62rem",fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Deviations Found ({phaseDeviations.length} phases)</div>
            {phaseDeviations.map(p=><div key={p.id} style={{fontSize:"0.74rem",color:C.text,marginBottom:3}}>
              <span style={{color:p.type==="stance"?C.accent:C.a2,fontWeight:600}}>{p.phase}: </span>{data[p.id+"_dev"]}
            </div>)}
          </div>
        )}
        {["stance","swing"].map(type=>(
          <div key={type} style={{marginBottom:14}}>
            <div style={{fontSize:"0.63rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:type==="stance"?C.accent:C.a2,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
              <div style={{height:1,width:10,background:type==="stance"?C.accent:C.a2}}/>{type==="stance"?"STANCE PHASE (60%)":"SWING PHASE (40%)"}
            </div>
            {GAIT_PHASES.filter(p=>p.type===type).map(p=>{
              const dev=data[p.id+"_dev"]||"";
              const note=data[p.id+"_note"]||"";
              const hasDeviation=dev&&dev!=="None";
              return(
                <div key={p.id} style={{background:C.surface,border:`1px solid ${hasDeviation?C.yellow+"50":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7,gap:8}}>
                    <div>
                      <span style={{fontWeight:700,color:hasDeviation?C.yellow:C.text,fontSize:"0.83rem"}}>{p.phase}</span>
                      <span style={{fontSize:"0.65rem",color:C.muted,marginLeft:8}}>{p.pct}</span>
                    </div>
                    {hasDeviation&&<span style={{fontSize:"0.6rem",padding:"1px 7px",borderRadius:8,background:`${C.yellow}15`,color:C.yellow,fontWeight:700}}>DEVIATION</span>}
                  </div>
                  <select value={dev} onChange={e=>set(p.id+"_dev",e.target.value)} style={{...inp,marginBottom:hasDeviation?7:0,borderColor:hasDeviation?C.yellow+"60":C.border}}>
                    <option value="">— select deviation —</option>
                    <option value="None">✓ No deviation</option>
                    {p.deviations.map(d=><option key={d} value={d}>{d}</option>)}
                    <option value="Other — see notes">Other — see notes</option>
                  </select>
                  {hasDeviation&&<input value={note} onChange={e=>set(p.id+"_note",e.target.value)} placeholder="Side (L/R/bilateral), severity, additional notes..." style={{...inp,fontSize:"0.74rem"}}/>}
                </div>
              );
            })}
          </div>
        ))}
      </div>}

      {/* ── SPATIOTEMPORAL ── */}
      {tab==="spatio"&&<div>
        <div style={{background:C.s2,borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:"0.75rem",color:C.muted}}>Compare patient values to normal reference ranges.</div>
        {[
          {id:"g_speed",    label:"Gait Speed",    unit:"m/s",    normal:"1.2–1.4",  placeholder:"e.g. 0.8"},
          {id:"g_cadence",  label:"Cadence",       unit:"steps/min",normal:"100–120",placeholder:"e.g. 85"},
          {id:"g_step_l_l", label:"Step Length — Left",  unit:"m",normal:"0.7–0.8",  placeholder:"e.g. 0.55"},
          {id:"g_step_l_r", label:"Step Length — Right", unit:"m",normal:"0.7–0.8",  placeholder:"e.g. 0.60"},
          {id:"g_stride",   label:"Stride Length",  unit:"m",    normal:"1.4–1.6",  placeholder:"e.g. 1.15"},
          {id:"g_bos",      label:"Base of Support",unit:"cm",   normal:"5–10",     placeholder:"e.g. 14"},
          {id:"g_stance_pct",label:"Stance Phase",  unit:"%",    normal:"60",       placeholder:"e.g. 65"},
          {id:"g_swing_pct", label:"Swing Phase",   unit:"%",    normal:"40",       placeholder:"e.g. 35"},
          {id:"g_double_support",label:"Double Support",unit:"%", normal:"20",      placeholder:"e.g. 28"},
        ].map(p=>{
          const val=data[p.id]||"";
          return(
            <div key={p.id} style={{background:C.surface,border:`1px solid ${val?C.accent+"25":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:7}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:"0.78rem",fontWeight:600,color:val?C.text:C.muted}}>{p.label}{val&&<span style={{color:C.green,marginLeft:5,fontSize:"0.6rem"}}>✓</span>}</span>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:"0.62rem",color:C.muted}}>Normal: {p.normal} {p.unit}</span>
                  {val&&<span style={{fontSize:"0.72rem",fontWeight:700,color:C.accent}}>{val} {p.unit}</span>}
                </div>
              </div>
              <input type="number" value={val} onChange={e=>set(p.id,e.target.value)} placeholder={p.placeholder} style={inp} step="0.01"/>
            </div>
          );
        })}
        {row("Spatiotemporal notes","g_spatio_notes","textarea")}
      </div>}

      {/* ── TIMED TESTS ── */}
      {tab==="timed"&&<div>
        {[
          {id:"g_tug",   label:"Timed Up & Go (TUG)", unit:"sec", normal:"<12s | Risk >13.5s", note:"Stand from chair, walk 3m, return, sit. Start on 'Go'."},
          {id:"g_10mwt", label:"10 Metre Walk Test",  unit:"sec", normal:"Normal ~1.2 m/s",    note:"Measure middle 10m of 14m course. Calculate speed = 10 ÷ seconds."},
          {id:"g_10mws", label:"10MWT Speed",          unit:"m/s", normal:"1.2 m/s",            note:"10 ÷ time in seconds"},
          {id:"g_6mwt",  label:"6 Minute Walk Test",  unit:"metres",normal:"400–700m",         note:"Walk as far as possible in 6 minutes on flat course."},
          {id:"g_5sts",  label:"5× Sit to Stand",     unit:"sec", normal:"<12s",               note:"From seated, stand fully 5 times without using arms if possible."},
          {id:"g_2mwt",  label:"2 Minute Walk Test",  unit:"metres",normal:"~150m",            note:"Alternative to 6MWT for low-endurance patients."},
        ].map(t=>{
          const val=data[t.id]||"";
          const isTUG=t.id==="g_tug";
          const flagged=isTUG&&parseFloat(val)>=13.5;
          return(
            <div key={t.id} style={{background:C.surface,border:`1px solid ${flagged?C.red+"50":val?C.accent+"25":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5,gap:8}}>
                <div>
                  <div style={{fontSize:"0.8rem",fontWeight:700,color:flagged?C.red:val?C.text:C.muted}}>{t.label}{flagged&&" ⚠️"}</div>
                  <div style={{fontSize:"0.67rem",color:C.muted,marginTop:2}}>{t.note}</div>
                </div>
                <span style={{fontSize:"0.62rem",color:C.muted,flexShrink:0,textAlign:"right"}}>Normal: {t.normal}</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="number" value={val} onChange={e=>set(t.id,e.target.value)} placeholder="Enter result" step="0.1" style={{...inp,flex:1}}/>
                <span style={{fontSize:"0.76rem",color:C.muted,flexShrink:0}}>{t.unit}</span>
              </div>
              {flagged&&<div style={{marginTop:6,fontSize:"0.72rem",color:C.red,fontWeight:600}}>⚠ TUG ≥13.5s — High fall risk. Refer for falls prevention program.</div>}
            </div>
          );
        })}
      </div>}

      {/* ── SCALES ── */}
      {tab==="scales"&&<div>
        {GAIT_SCALES.map(s=>{
          const val=data[s.id]||"";
          return(
            <div key={s.id} style={{background:C.surface,border:`1px solid ${val?C.accent+"25":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5,gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:"0.85rem",color:val?C.text:C.muted}}>{s.label} <span style={{fontWeight:400,fontSize:"0.72rem",color:C.muted}}>({s.full})</span></div>
                  <div style={{fontSize:"0.67rem",color:C.muted,marginTop:2}}>Range: {s.range} | {s.cutoffs}</div>
                </div>
                {val&&<span style={{fontSize:"0.88rem",fontWeight:800,color:C.accent,flexShrink:0}}>{val}</span>}
              </div>
              <input type="number" value={val} onChange={e=>set(s.id,e.target.value)} placeholder={`Score (${s.range})`} style={inp}/>
            </div>
          );
        })}
        {row("Additional scale notes / clinical interpretation","g_scale_notes","textarea")}
      </div>}

      {/* ── ABNORMAL GAIT ── */}
      {tab==="abnormal"&&<div>
        <div style={{background:C.s2,borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:"0.75rem",color:C.muted,lineHeight:1.6}}>
          Mark all patterns observed. Multiple patterns may coexist.
        </div>
        {ABNORMAL_GAITS.map(g=>{
          const val=data[g.id]||"";
          const present=val==="Present";
          return(
            <div key={g.id} style={{background:C.surface,border:`1.5px solid ${present?C.yellow+"60":C.border}`,borderRadius:10,padding:"11px 13px",marginBottom:8,transition:"all 0.15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"0.85rem",color:present?C.yellow:C.text,marginBottom:3}}>{g.label}</div>
                  <div style={{fontSize:"0.72rem",color:C.muted,marginBottom:2}}><strong style={{color:present?C.accent:C.muted}}>Cause:</strong> {g.cause}</div>
                  <div style={{fontSize:"0.72rem",color:C.muted}}><strong style={{color:present?C.accent:C.muted}}>Sign:</strong> {g.sign}</div>
                </div>
                <select value={val} onChange={e=>set(g.id,e.target.value)} style={{...inp,width:"auto",minWidth:100,flexShrink:0,borderColor:present?C.yellow:C.border}}>
                  <option value="">— screen —</option>
                  <option value="Absent">✓ Absent</option>
                  <option value="Present">⚠ Present</option>
                  <option value="Suspected">? Suspected</option>
                </select>
              </div>
              {present&&<input value={data[g.id+"_note"]||""} onChange={e=>set(g.id+"_note",e.target.value)} placeholder="Severity, side, notes..." style={{...inp,marginTop:8,fontSize:"0.74rem"}}/>}
            </div>
          );
        })}
        {row("Fall Risk Assessment","g_fall_risk","select",["Low","Moderate","High — refer for falls prevention"])}
        {row("Red Flags Present","g_red_flags","select",["None","Sudden neurological change","Unexplained bilateral weakness","Bowel/bladder involvement","Progressive worsening without trauma","Severe unsteadiness — unknown cause"])}
        {data.g_red_flags&&data.g_red_flags!=="None"&&(
          <div style={{padding:"10px 13px",background:"rgba(255,77,109,0.1)",border:`1px solid ${C.red}50`,borderRadius:10,fontSize:"0.76rem",color:C.red,fontWeight:600}}>
            🔴 Red flag identified: {data.g_red_flags} — Urgent medical referral required before continuing physiotherapy.
          </div>
        )}
      </div>}

      {/* ── MUSCLE / JOINT ── */}
      {tab==="muscles"&&<div>
        {[
          {id:"g_weak_primary",  label:"Primary Weak Muscles",      note:"Muscles most contributing to gait deviation"},
          {id:"g_weak_secondary",label:"Secondary/Compensating",    note:"Muscles overworking due to primary weakness"},
          {id:"g_tight",         label:"Tight / Stiff Structures",  note:"Muscles or capsules limiting joint ROM"},
          {id:"g_joint_involved",label:"Joints Involved",           note:"Hip / Knee / Ankle / Spine / SI / Foot"},
        ].map(f=>(
          <div key={f.id} style={{background:C.surface,border:`1px solid ${data[f.id]?C.accent+"25":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
            <div style={{fontSize:"0.78rem",fontWeight:600,color:data[f.id]?C.text:C.muted,marginBottom:3}}>{f.label}</div>
            <div style={{fontSize:"0.67rem",color:C.muted,marginBottom:6,fontStyle:"italic"}}>{f.note}</div>
            <textarea value={data[f.id]||""} onChange={e=>set(f.id,e.target.value)} rows={2} placeholder="Describe..." style={{...inp,resize:"vertical",display:"block"}}/>
          </div>
        ))}
        {row("MMT Findings","g_mmt","textarea",null,"List muscle: grade e.g. Glute Med L 3/5, TA R 4/5")}
        {row("ROM Restrictions","g_rom","textarea",null,"List joint: motion: degrees e.g. R hip ext 5° (normal 10°)")}
        {row("Neurological Findings","g_neuro_findings","textarea",null,"Tone, reflexes, sensation relevant to gait")}
      </div>}

      {/* ── PLAN & GOALS ── */}
      {tab==="plan"&&<div>
        <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:8,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a2}}/>Short Term Goals (2–4 weeks)</div>
        {row("Goal 1","g_stg1")} {row("Goal 2","g_stg2")} {row("Goal 3","g_stg3")}

        <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a3,marginBottom:8,marginTop:12,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a3}}/>Long Term Goals (6–12 weeks)</div>
        {row("Goal 1","g_ltg1")} {row("Goal 2","g_ltg2")}

        <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.accent,marginBottom:8,marginTop:12,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.accent}}/>Treatment Plan</div>
        {[
          {id:"g_tx_strength",  label:"Strengthening",         placeholder:"e.g. Glute med, TA, quad — specify exercises"},
          {id:"g_tx_stretch",   label:"Stretching / Mobility", placeholder:"e.g. Hip flexor, gastroc, hamstring"},
          {id:"g_tx_balance",   label:"Balance Training",      placeholder:"e.g. Single leg stance, perturbation training"},
          {id:"g_tx_gait",      label:"Gait Retraining",       placeholder:"e.g. Step length cues, cadence training, treadmill"},
          {id:"g_tx_nmre",      label:"Neuromuscular Re-ed",   placeholder:"e.g. EMG biofeedback, PNF, functional patterns"},
          {id:"g_tx_device",    label:"Assistive Device",      placeholder:"e.g. Upgrade to rollator, wean from stick"},
          {id:"g_tx_orthotic",  label:"Orthotics / Footwear",  placeholder:"e.g. Lateral heel wedge, custom AFO referral"},
          {id:"g_tx_education", label:"Patient Education",     placeholder:"e.g. Fall prevention, home exercise program"},
        ].map(f=>row(f.label,f.id,"textarea",null,f.placeholder))}

        <div style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:8,marginTop:12,display:"flex",alignItems:"center",gap:8}}><div style={{height:1,width:10,background:C.a2}}/>Outcome Measures</div>
        {row("Selected Outcome Measures","g_outcomes","select",["LEFS (lower extremity)","KOOS (knee)","HOOS (hip)","DASH (upper limb compensation)","SF-36 (general health)","WOMAC (osteoarthritis)","LEFS + TUG","KOOS + BBS"])}
        {row("Reassessment Frequency","g_reassess","select",["Every 2 weeks","Every 4 weeks","Every 6 weeks","At discharge"])}
        {row("Discharge Criteria","g_discharge","textarea")}
        {row("Home Program","g_home_prog","select",["Yes — provided","Yes — pending","No"])}
        {row("Clinical Interpretation & Summary","g_summary","textarea",null,"Primary deviation, underlying cause, functional impact, prognosis...")}
      </div>}
    </div>
  );
}

// ─── SIMPLE FIELD INPUTS ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// OUTCOME MEASURES MODULE — Full scored questionnaires with interpretation
// ═══════════════════════════════════════════════════════════════════════════════


// ─── Category colours ─────────────────────────────────────────────────────────

// ─── Select options helpers ───────────────────────────────────────────────────

// ─── Slider component ────────────────────────────────────────────────────────
function OMSlider({id, min=0, max=10, step=1, value, onChange, showVal=true}){
  const pct = max===min?0:((+value-min)/(max-min))*100;
  const col  = pct<=30?"#00c97a":pct<=60?"#ffb300":"#ff4d6d";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:"0.65rem",color:"#7e6a9a",minWidth:14}}>{min}</span>
      <div style={{flex:1,position:"relative",height:24,display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",width:"100%",height:4,background:"#ede7f6",borderRadius:2}}/>
        <div style={{position:"absolute",width:`${pct}%`,height:4,background:col,borderRadius:2,transition:"width 0.15s"}}/>
        <input type="range" min={min} max={max} step={step} value={value??min}
          onChange={e=>onChange(e.target.value)}
          style={{position:"absolute",width:"100%",opacity:0,height:24,cursor:"pointer",zIndex:2}}/>
        <div style={{position:"absolute",left:`${pct}%`,transform:"translateX(-50%)",width:16,height:16,borderRadius:"50%",background:col,border:"2px solid #d8cce8",transition:"left 0.15s",pointerEvents:"none"}}/>
      </div>
      <span style={{fontSize:"0.65rem",color:"#7e6a9a",minWidth:14,textAlign:"right"}}>{max}</span>
      {showVal&&<span style={{minWidth:28,fontSize:"0.78rem",fontWeight:800,color:col,textAlign:"right"}}>{value??"-"}</span>}
    </div>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({score, maxScore, color, size=80}){
  const pct  = maxScore?Math.min(100,Math.round(score/maxScore*100)):0;
  const r    = (size-8)/2;
  const circ = 2*Math.PI*r;
  const dash = circ*(1-pct/100);
  return(
    <svg width={size} height={size} style={{flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2d45" strokeWidth={7}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={dash}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{transition:"stroke-dashoffset 0.5s ease"}}/>
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize={size*0.18} fontWeight="800" fill={color}>{score}</text>
    </svg>
  );
}

// ─── Outcome score severity helpers ──────────────────────────────────────────
const LOWER_IS_BETTER = ["odi","ndi","dash","tsk","vas","nrs","fabq"];
function isImproved(id, change) { return LOWER_IS_BETTER.includes(id) ? change < 0 : change > 0; }

// ─── Score Gauge Bar ──────────────────────────────────────────────────────────
function ScoreGauge({ score, maxScore, color, label, mcid }) {
  const pct = maxScore ? Math.min(100, Math.round((score / maxScore) * 100)) : 0;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
        <span style={{ fontSize:"0.62rem", color:"#7e6a9a" }}>{label}</span>
        <span style={{ fontSize:"1rem", fontWeight:900, color, fontFamily:"monospace" }}>{score}<span style={{ fontSize:"0.6rem", color:"#7e6a9a", fontWeight:400 }}>/{maxScore}</span></span>
      </div>
      <div style={{ height:8, background:"#ede7f6", borderRadius:4, overflow:"hidden", position:"relative" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${color}99,${color})`, borderRadius:4, transition:"width 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}/>
        {mcid && maxScore && (
          <div style={{ position:"absolute", top:0, left:`${Math.min(100,(mcid/maxScore)*100)}%`, width:2, height:"100%", background:"rgba(255,255,255,0.3)" }} title={`MCID: ${mcid}`}/>
        )}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
        <span style={{ fontSize:"0.5rem", color:"#3a5070" }}>0</span>
        {mcid && <span style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.3)" }}>MCID: {mcid}</span>}
        <span style={{ fontSize:"0.5rem", color:"#3a5070" }}>{maxScore}</span>
      </div>
    </div>
  );
}

// ─── Mini sparkline chart ─────────────────────────────────────────────────────
function Sparkline({ values, color, improved }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const W = 120, H = 36;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - ((v - min) / range) * (H - 6) - 3
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width={W} height={H} style={{ overflow:"visible" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 ? color : "#1a2d45"} stroke={color} strokeWidth={1.5}/>
      ))}
    </svg>
  );
}

// ─── OutcomeMeasuresModule ────────────────────────────────────────────────────

export { generateDiagnosis, computeErgoRisks, ErgoModule, GaitModule, isImproved };