import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { C, getC } from './theme.jsx';
const TEST_SVG = {
  // ─── SHOULDER ───────────────────────────────────────────────────────────
  neer: (
    <svg viewBox="0 0 120 140" width="100%" height="100">
      <rect x="45" y="0" width="20" height="50" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="55" cy="55" rx="18" ry="18" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="38" y="68" width="14" height="55" rx="6" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5"/>
      <path d="M55,55 L30,30" stroke="#ff4d6d" strokeWidth="2" strokeDasharray="4,2"/>
      <text x="5" y="28" fontSize="9" fill="#ff4d6d">Force</text>
      <path d="M45,15 Q20,20 15,40" stroke="#00e5ff" strokeWidth="1.5" fill="none" markerEnd="url(#arr)"/>
      <text x="5" y="115" fontSize="8" fill="#94a3b8">IR + Flex</text>
      <text x="5" y="125" fontSize="8" fill="#94a3b8">to end range</text>
      <circle cx="55" cy="55" r="4" fill="#ff4d6d"/>
    </svg>
  ),
  hawkins: (
    <svg viewBox="0 0 120 140" width="100%" height="100">
      <rect x="45" y="0" width="20" height="45" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="55" cy="50" rx="18" ry="18" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="25" y="52" width="55" height="12" rx="6" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5"/>
      <rect x="18" y="60" width="12" height="50" rx="6" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5"/>
      <path d="M80,58 Q90,58 90,68 Q90,78 80,78" stroke="#ff4d6d" strokeWidth="2" fill="none"/>
      <text x="5" y="130" fontSize="8" fill="#94a3b8">90° flex → IR</text>
      <circle cx="55" cy="50" r="4" fill="#ff4d6d"/>
    </svg>
  ),
  empty_can: (
    <svg viewBox="0 0 120 140" width="100%" height="100">
      <rect x="45" y="0" width="18" height="42" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="54" cy="47" rx="17" ry="17" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="22" y="46" width="60" height="11" rx="5" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(-30,54,47)"/>
      <rect x="15" y="63" width="11" height="50" rx="5" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(-30,54,47)"/>
      <path d="M70,35 L85,28" stroke="#ff4d6d" strokeWidth="2.5" markerEnd="url(#arr)"/>
      <text x="5" y="125" fontSize="8" fill="#94a3b8">Scap plane 30°</text>
      <text x="5" y="135" fontSize="8" fill="#94a3b8">IR (thumb down)</text>
    </svg>
  ),
  lachman: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="10" y="20" width="50" height="22" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <rect x="70" y="20" width="55" height="22" rx="8" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5"/>
      <ellipse cx="65" cy="31" rx="14" ry="14" fill="#ede7f6" stroke="#b45309" strokeWidth="1.5"/>
      <path d="M58,25 L72,38" stroke="#ff4d6d" strokeWidth="1.5"/>
      <path d="M90,65 L90,55" stroke="#00e5ff" strokeWidth="3" markerEnd="url(#arr)"/>
      <text x="92" y="62" fontSize="9" fill="#00e5ff">Ant</text>
      <path d="M30,65 L30,55" stroke="#ffb300" strokeWidth="3"/>
      <text x="10" y="62" fontSize="9" fill="#ffb300">Fix</text>
      <text x="20" y="115" fontSize="8" fill="#94a3b8">20-30° flex. Ant</text>
      <text x="20" y="125" fontSize="8" fill="#94a3b8">tibial translation</text>
      <rect x="20" y="75" width="100" height="18" rx="6" fill="#192435" stroke="#1a2d45"/>
      <text x="35" y="87" fontSize="8" fill="#94a3b8">Tibia</text>
      <rect x="20" y="95" width="100" height="18" rx="6" fill="#192435" stroke="#1a2d45"/>
      <text x="35" y="107" fontSize="8" fill="#94a3b8">Femur stabilised</text>
    </svg>
  ),
  slr: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="5" y="55" width="130" height="20" rx="6" fill="#ede7f6" stroke="#d8cce8"/>
      <ellipse cx="20" cy="62" rx="14" ry="10" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="28" y="48" width="18" height="55" rx="7" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(-45,37,62)"/>
      <rect x="28" y="65" width="18" height="55" rx="7" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5"/>
      <path d="M42,22 L42,10" stroke="#ff4d6d" strokeWidth="2" markerEnd="url(#arr)"/>
      <text x="48" y="20" fontSize="9" fill="#ff4d6d">Lift</text>
      <text x="5" y="120" fontSize="8" fill="#94a3b8">Knee extended</text>
      <text x="5" y="130" fontSize="8" fill="#94a3b8">Raise until resistance</text>
    </svg>
  ),
  spurling: (
    <svg viewBox="0 0 120 140" width="100%" height="100">
      <ellipse cx="60" cy="30" rx="22" ry="25" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="50" y="53" width="20" height="30" rx="6" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5"/>
      <path d="M30,15 Q25,30 35,45" stroke="#ff4d6d" strokeWidth="1.5" strokeDasharray="3,2" fill="none"/>
      <path d="M60,0 L60,12" stroke="#ff4d6d" strokeWidth="3" markerEnd="url(#arr)"/>
      <text x="65" y="10" fontSize="9" fill="#ff4d6d">↓ Compress</text>
      <path d="M60,25 Q75,25 75,35" stroke="#ffb300" strokeWidth="1.5" fill="none"/>
      <text x="5" y="120" fontSize="8" fill="#94a3b8">Compress + side</text>
      <text x="5" y="130" fontSize="8" fill="#94a3b8">flex + extension</text>
    </svg>
  ),
  mcmurray: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="15" y="5" width="22" height="55" rx="9" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="26" cy="62" rx="16" ry="16" fill="#ede7f6" stroke="#b45309" strokeWidth="1.5"/>
      <rect x="14" y="76" width="22" height="50" rx="9" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(50,26,62)"/>
      <path d="M42,62 Q55,50 55,65 Q55,80 42,80" stroke="#ff4d6d" strokeWidth="2" fill="none"/>
      <text x="58" y="65" fontSize="9" fill="#ff4d6d">ER+</text>
      <text x="58" y="75" fontSize="9" fill="#ff4d6d">Valgus</text>
      <text x="5" y="120" fontSize="8" fill="#94a3b8">Full flex → extend</text>
      <text x="5" y="130" fontSize="8" fill="#94a3b8">ER=medial, IR=lateral</text>
    </svg>
  ),
  thomas_test: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="5" y="60" width="130" height="20" rx="4" fill="#ede7f6" stroke="#d8cce8"/>
      <ellipse cx="20" cy="65" rx="14" ry="11" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="28" y="55" width="18" height="22" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(-80,37,65)"/>
      <rect x="50" y="55" width="18" height="55" rx="8" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(20,59,65)"/>
      <path d="M70,52 L82,45" stroke="#ff4d6d" strokeWidth="2"/>
      <text x="84" y="44" fontSize="9" fill="#ff4d6d">+ve</text>
      <text x="5" y="118" fontSize="8" fill="#94a3b8">Both hips flex → lower</text>
      <text x="5" y="128" fontSize="8" fill="#94a3b8">one leg → observe</text>
    </svg>
  ),
  slump: (
    <svg viewBox="0 0 120 140" width="100%" height="100">
      <ellipse cx="60" cy="20" rx="18" ry="18" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <path d="M60,36 Q40,55 42,90" stroke="#7f5af0" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <rect x="30" y="90" width="60" height="15" rx="5" fill="#ede7f6" stroke="#d8cce8"/>
      <rect x="40" y="100" width="15" height="35" rx="6" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <rect x="65" y="100" width="15" height="35" rx="6" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5"/>
      <path d="M55,130 L55,118" stroke="#ff4d6d" strokeWidth="2"/>
      <text x="32" y="112" fontSize="8" fill="#ff4d6d">Knee ext</text>
      <text x="5" y="8" fontSize="8" fill="#94a3b8">Slump → neck flex</text>
      <text x="5" y="18" fontSize="8" fill="#94a3b8">→ knee extend → DF</text>
    </svg>
  ),
  trendelenburg: (
    <svg viewBox="0 0 120 140" width="100%" height="100">
      <ellipse cx="55" cy="18" rx="18" ry="18" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="40" y="34" width="28" height="35" rx="8" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5"/>
      <rect x="25" y="65" width="22" height="45" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <rect x="65" y="75" width="22" height="35" rx="8" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(15,76,85)"/>
      <path d="M15,68 L95,78" stroke="#ff4d6d" strokeWidth="2" strokeDasharray="4,2"/>
      <text x="5" y="90" fontSize="9" fill="#ff4d6d">↘ Pelvis drops</text>
      <text x="5" y="128" fontSize="8" fill="#94a3b8">Single leg stance</text>
      <text x="5" y="138" fontSize="8" fill="#94a3b8">Watch pelvis level</text>
    </svg>
  ),
  apprehension: (
    <svg viewBox="0 0 120 140" width="100%" height="100">
      <rect x="42" y="0" width="22" height="45" rx="9" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="53" cy="50" rx="18" ry="18" fill="#ede7f6" stroke="#b45309" strokeWidth="1.5"/>
      <rect x="30" y="52" width="55" height="13" rx="6" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(-35,53,50)"/>
      <rect x="18" y="65" width="13" height="50" rx="6" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(-35,53,50)"/>
      <path d="M45,42 L28,30" stroke="#ff4d6d" strokeWidth="2.5" markerEnd="url(#arr)"/>
      <text x="5" y="28" fontSize="8" fill="#ff4d6d">Ant pressure</text>
      <text x="5" y="128" fontSize="8" fill="#94a3b8">90° abd + ER</text>
      <text x="5" y="138" fontSize="8" fill="#94a3b8">Watch for fear</text>
    </svg>
  ),
  phalen: (
    <svg viewBox="0 0 140 120" width="100%" height="100">
      <rect x="10" y="30" width="50" height="18" rx="7" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <rect x="55" y="18" width="18" height="50" rx="7" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(90,64,40)"/>
      <rect x="72" y="30" width="50" height="18" rx="7" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(180,97,39)"/>
      <path d="M60,55 Q70,70 80,55" stroke="#ff4d6d" strokeWidth="2" fill="none"/>
      <text x="30" y="90" fontSize="9" fill="#94a3b8">Both wrists fully</text>
      <text x="30" y="102" fontSize="9" fill="#94a3b8">flexed 60 seconds</text>
      <text x="30" y="114" fontSize="8" fill="#ff4d6d">+ve = tingling thumb/index</text>
    </svg>
  ),
  thompson: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="5" y="5" width="130" height="20" rx="5" fill="#ede7f6" stroke="#d8cce8"/>
      <rect x="45" y="22" width="50" height="70" rx="12" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="70" cy="92" rx="22" ry="10" fill="#ede7f6" stroke="#9333ea" strokeWidth="1.5"/>
      <path d="M35,55 Q40,55 40,65 Q40,70 35,70" stroke="#ff4d6d" strokeWidth="2.5" fill="none"/>
      <text x="5" y="65" fontSize="9" fill="#ff4d6d">Squeeze</text>
      <path d="M100,92 Q115,92 115,105" stroke="#00e5ff" strokeWidth="2" fill="none" strokeDasharray="3,2"/>
      <text x="90" y="118" fontSize="8" fill="#00e5ff">No PF</text>
      <text x="5" y="125" fontSize="8" fill="#94a3b8">Squeeze calf — no PF = rupture</text>
    </svg>
  ),
  windlass: (
    <svg viewBox="0 0 140 120" width="100%" height="100">
      <rect x="10" y="55" width="120" height="18" rx="5" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="20" cy="63" rx="14" ry="9" fill="#ede7f6" stroke="#9333ea" strokeWidth="1.5"/>
      <rect x="28" y="55" width="70" height="12" rx="4" fill="#192435" stroke="#ffb300" strokeWidth="1"/>
      <path d="M95,55 Q105,45 110,35" stroke="#ff4d6d" strokeWidth="2.5" fill="none"/>
      <circle cx="110" cy="32" r="8" fill="#ede7f6" stroke="#dc2626" strokeWidth="1.5"/>
      <text x="5" y="102" fontSize="8" fill="#94a3b8">Great toe extension</text>
      <text x="5" y="112" fontSize="8" fill="#ff4d6d">+ve = plantar fascia pain</text>
    </svg>
  ),
  ober: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="5" y="55" width="130" height="20" rx="5" fill="#ede7f6" stroke="#d8cce8"/>
      <ellipse cx="22" cy="62" rx="16" ry="12" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="32" y="48" width="20" height="60" rx="8" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(20,42,62)"/>
      <rect x="52" y="48" width="20" height="60" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(-10,62,62)"/>
      <path d="M62,30 L62,18" stroke="#ff4d6d" strokeWidth="2" markerEnd="url(#arr)"/>
      <text x="66" y="25" fontSize="9" fill="#ff4d6d">Adduct</text>
      <path d="M62,30 Q80,30 80,50" stroke="#ffb300" strokeWidth="1.5" strokeDasharray="3,2" fill="none"/>
      <text x="5" y="125" fontSize="8" fill="#94a3b8">Sidelying: abduct then adduct</text>
      <text x="5" y="135" fontSize="8" fill="#ff4d6d">+ve = leg stays elevated</text>
    </svg>
  ),
  fadir: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="5" y="60" width="130" height="20" rx="6" fill="#ede7f6" stroke="#d8cce8"/>
      <ellipse cx="20" cy="67" rx="14" ry="11" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="28" y="42" width="20" height="55" rx="8" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(-50,38,67)"/>
      <rect x="15" y="58" width="20" height="45" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(-80,25,67)"/>
      <text x="65" y="45" fontSize="8" fill="#ff4d6d">Flex+Add+IR</text>
      <path d="M55,50 L65,40" stroke="#ff4d6d" strokeWidth="2"/>
      <text x="5" y="120" fontSize="8" fill="#94a3b8">Hip: 90° flex → adduct → IR</text>
      <text x="5" y="130" fontSize="8" fill="#ff4d6d">+ve = groin pain (FAI/labrum)</text>
    </svg>
  ),
  faber: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="5" y="60" width="130" height="20" rx="6" fill="#ede7f6" stroke="#d8cce8"/>
      <ellipse cx="20" cy="67" rx="14" ry="11" fill="#ede7f6" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="28" y="50" width="18" height="50" rx="8" fill="#1a2d45" stroke="#7f5af0" strokeWidth="1.5" transform="rotate(-45,37,67)"/>
      <rect x="18" y="65" width="18" height="45" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(-80,27,67)"/>
      <path d="M30,40 Q50,35 60,45" stroke="#ffb300" strokeWidth="1.5" fill="none"/>
      <text x="60" y="42" fontSize="9" fill="#ffb300">Fig-4</text>
      <text x="5" y="120" fontSize="8" fill="#94a3b8">Figure-4: foot on opp knee</text>
      <text x="5" y="130" fontSize="8" fill="#ff4d6d">+ve = SI or hip pain</text>
    </svg>
  ),
};

// ─── COMPLETE SPECIAL TESTS DATABASE 100+ ────────────────────────────────────
const SPECIAL_TESTS_DATA = {

  cervical:{
    label:"Cervical Spine", color:"#00e5ff", icon:"🔵",
    tests:[
      { id:"st_spurling", label:"Spurling's Test", structure:"Cervical nerve root / foramen",
        sensitivity:"30–40%", specificity:"92–93%",
        positive:"Reproduces ipsilateral radicular arm pain / tingling",
        negative:"No arm symptoms",
        how:"Patient seated, head in neutral. Therapist places hands on crown. Apply DOWNWARD axial compression combined with ipsilateral side flexion and slight extension (quadrant position). Hold 10 seconds. Positive if arm symptoms reproduced.",
        options:["Negative","Positive — left (radiculopathy)","Positive — right (radiculopathy)","Bilateral positive"],
      },
      { id:"st_distraction", label:"Cervical Distraction Test", structure:"Cervical nerve root / disc",
        sensitivity:"40–44%", specificity:"90–100%",
        positive:"Arm symptoms reduce or resolve with traction",
        negative:"No change or worsening",
        how:"Patient supine. Therapist cradles occiput with both hands. Apply gentle UPWARD traction (distraction) — 10–15kg. Positive if radicular symptoms reduce or resolve (indicates neural compression relieved by opening foramen).",
        options:["Negative","Positive — symptom relief (nerve root compression)","Positive — relief only partial"],
      },
      { id:"st_sharp_purser", label:"Sharp-Purser Test", structure:"C1/C2 — atlantoaxial instability",
        sensitivity:"69%", specificity:"96%",
        positive:"URGENT — click or symptom change indicates instability",
        negative:"No movement or symptoms",
        how:"⚠️ PERFORM WITH CAUTION. Patient seated, head in flexion. Therapist places palm on forehead, thumb on C2 spinous process. Apply POSTERIOR translation of head on C2. Positive if clunk or reduction in symptoms. POSITIVE = refer immediately. Do NOT manipulate this patient.",
        options:["Negative","Positive — clunk present (C1/C2 instability — REFER URGENT)","Inconclusive"],
      },
      { id:"st_vbi", label:"VBI / 3-Part Test", structure:"Vertebral artery patency",
        sensitivity:"Variable", specificity:"Variable",
        positive:"5Ds/3Ns = STOP and refer",
        negative:"No symptoms in any position",
        how:"Patient seated. Test 3 positions held 30 seconds each: (1) Sustained rotation left, (2) Extension + rotation left, (3) Extension + rotation right. Watch for 5Ds: Dizziness, Diplopia, Dysarthria, Dysphagia, Drop attack. And 3Ns: Nausea, Nystagmus, Numbness of face. POSITIVE = stop all cervical treatment and refer.",
        options:["Negative — all 3 positions clear","Positive — 5D/3N present (REFER — no cervical manipulation)","Positive — dizziness only (monitor)","Inconclusive"],
      },
      { id:"st_alar", label:"Alar Ligament Test", structure:"Alar ligament / C1-C2 stability",
        sensitivity:"50%", specificity:"75%",
        positive:"C2 rotates with head rotation (ligament lax)",
        negative:"C2 fixed during head rotation",
        how:"Patient seated, head neutral. Therapist palpates C2 spinous process bilaterally. Ask patient to side-flex head. NORMAL: C2 should immediately move toward the side of side-flexion (tight alar ligament moves it). POSITIVE (LAXITY): C2 does not move, or head can side-flex extensively without C2 movement.",
        options:["Negative — normal C2 movement","Positive left — alar laxity (left)","Positive right — alar laxity (right)","Bilateral — bilateral alar laxity"],
      },
      { id:"st_flex_rot", label:"Flexion-Rotation Test (FRT)", structure:"C1-C2 rotation",
        sensitivity:"91%", specificity:"90%",
        positive:"< 32° rotation = C1/C2 restriction (cervicogenic headache)",
        negative:"> 40° each side — normal",
        how:"Patient supine. Therapist fully flexes cervical spine to end range (chin toward chest). With full flexion maintained (locks C2 down), SLOWLY rotate head fully to each side. Measure rotation with goniometer. Normal: 40–45° each side. Positive (< 32°) = C1/C2 hypomobility = cervicogenic headache source.",
        options:["Normal — bilateral > 40°","Positive left < 32° (C1/C2 restriction — left)","Positive right < 32° (C1/C2 restriction — right)","Bilateral restriction"],
      },
      { id:"st_jackson", label:"Jackson's Compression Test", structure:"Cervical facet / nerve root",
        sensitivity:"30%", specificity:"95%",
        positive:"Local or referred pain",
        negative:"No symptoms",
        how:"Patient seated, head in neutral. Therapist places clasped hands on crown. Apply DOWNWARD axial compression. Unlike Spurling's, no side-flexion added. Positive if local cervical pain (facet) or referred pain (nerve root) reproduced.",
        options:["Negative","Positive — local neck pain (facet)","Positive — radicular symptoms","Positive — both"],
      },
      { id:"st_cervical_rotation_lt", label:"Cervical Rotation Lateral Flexion (CRLF)", structure:"First rib elevation",
        sensitivity:"72%", specificity:"95%",
        positive:"Resistance during lateral flexion from rotation = first rib elevated",
        negative:"Free lateral flexion from rotation",
        how:"Patient seated. Passively ROTATE head fully to one side. Then, maintaining that rotation, attempt LATERAL FLEXION toward ipsilateral shoulder. Normal: neck laterally flexes freely. Positive: lateral flexion blocked = first rib elevated (thoracic outlet / scalene restriction).",
        options:["Negative bilateral","Positive left (L first rib elevated)","Positive right (R first rib elevated)"],
      },
      { id:"st_axial_loading", label:"Axial Loading Test", structure:"Cervical disc / facet",
        sensitivity:"Low", specificity:"Moderate",
        positive:"Pain reproduction with compression",
        negative:"No pain",
        how:"Patient seated. Therapist places hands on crown and applies DOWNWARD pressure with both hands (straight compression only — no rotation or side-flex). Positive if local cervical pain reproduced. Differentiates compressive vs non-compressive pain sources.",
        options:["Negative","Positive — local pain reproduced","Positive — radicular symptoms"],
      },
    ]
  },

  shoulder:{
    label:"Shoulder", color:"#7f5af0", icon:"🟣",
    tests:[
      { id:"st_neer", label:"Neer's Test", structure:"Supraspinatus / subacromial impingement",
        sensitivity:"72%", specificity:"66%",
        positive:"Anterior shoulder pain at end range",
        negative:"No pain",
        how:"Stabilise scapula with one hand (prevent elevation). With other hand, PASSIVELY FLEX the arm forward with shoulder INTERNALLY ROTATED (thumb down) to end range. Positive = anterior-superior shoulder pain reproduced. Simulates pinching of supraspinatus under anterior acromion.",
        options:["Negative","Positive — anterior shoulder pain (impingement)","Equivocal"],
      },
      { id:"st_hawkins", label:"Hawkins-Kennedy Test", structure:"Supraspinatus / subacromial",
        sensitivity:"79%", specificity:"59%",
        positive:"Subacromial pain with IR",
        negative:"No pain",
        how:"Flex shoulder to 90°, elbow 90°. Apply INTERNAL ROTATION (forearm toward floor). Positive = pain at anterior-superior shoulder (impinges supraspinatus under coracoacromial arch). Most sensitive impingement test.",
        options:["Negative","Positive — subacromial pain","Equivocal"],
      },
      { id:"st_empty_can", label:"Empty Can / Jobe Test", structure:"Supraspinatus integrity",
        sensitivity:"69%", specificity:"66%",
        positive:"Pain = tendinopathy. Weakness = tear",
        negative:"Strong and painless",
        how:"Arm abducted 90° in SCAPULAR PLANE (30° horizontal adduction). Fully INTERNALLY ROTATE (thumb pointing down — 'emptying a can'). Apply downward resistance. Positive = pain (tendinopathy) OR weakness (tear).",
        options:["Negative — strong and painless","Positive — painful (tendinopathy)","Positive — weak (partial/complete tear)","Positive — weak AND painful (serious lesion)"],
      },
      { id:"st_full_can", label:"Full Can Test", structure:"Supraspinatus — less impingement position",
        sensitivity:"66%", specificity:"64%",
        positive:"Pain or weakness in full can position",
        negative:"Strong and painless",
        how:"Same position as empty can BUT forearm EXTERNALLY ROTATED (thumb up — 'full can'). Apply downward resistance. Less likely to impinge bursa — more specific for supraspinatus muscle/tendon pathology. Compare to empty can.",
        options:["Negative","Positive — painful","Positive — weak","Both painful and weak"],
      },
      { id:"st_lift_off", label:"Lift-Off Test (Gerber)", structure:"Subscapularis integrity",
        sensitivity:"62%", specificity:"97%",
        positive:"Cannot lift hand off back",
        negative:"Strong lift-off maintained",
        how:"Patient places back of hand on lower back (posterior to iliac crest). Ask to LIFT hand away from back — resist at mid-range. Positive = cannot lift OR must substitute with elbow extension. Tests subscapularis — primary internal rotator.",
        options:["Negative — strong lift-off","Positive — cannot lift (subscapularis tear)","Positive — weakness (partial tear)"],
      },
      { id:"st_belly_press", label:"Belly Press Test", structure:"Subscapularis",
        sensitivity:"58%", specificity:"92%",
        positive:"Elbow drops or wrist flexes during press",
        negative:"Elbow maintained forward during press",
        how:"Patient places hand flat on abdomen (elbow forward of torso). Press hand INTO abdomen WITHOUT allowing wrist to flex. Positive = wrist flexes (cannot maintain IR — subscapularis deficit) or elbow drops behind torso.",
        options:["Negative — normal","Positive — wrist flexes (subscapularis deficit)","Positive — elbow drops"],
      },
      { id:"st_bear_hug", label:"Bear Hug Test", structure:"Subscapularis — upper fibres",
        sensitivity:"60%", specificity:"92%",
        positive:"Weakness during bear hug IR",
        negative:"Strong resistance",
        how:"Patient places palm of affected arm on OPPOSITE shoulder (fingers pointing toward neck). Therapist attempts to lift elbow upward/outward. Patient resists. Tests subscapularis in mid-range internal rotation position. Positive = cannot maintain resistance (subscapularis tear).",
        options:["Negative","Positive — weakness (upper subscapularis)"],
      },
      { id:"st_er_lag", label:"External Rotation Lag Sign", structure:"Infraspinatus / supraspinatus (massive tear)",
        sensitivity:"High for massive tears", specificity:"98%",
        positive:"Arm falls into IR (lag present)",
        negative:"Arm held in ER position",
        how:"Patient seated, elbow 90°. Therapist passively positions shoulder near maximum ER. Ask patient to HOLD that position as therapist releases. Positive = arm falls into internal rotation (lag) — indicates inability to actively maintain ER = posterior cuff tear.",
        options:["Negative — arm held in ER","Positive — small lag (< 10°)","Positive — significant lag (> 10°)","Positive — full lag (massive RC tear)"],
      },
      { id:"st_hornblower", label:"Hornblower's Sign", structure:"Teres minor",
        sensitivity:"100% for teres minor tear", specificity:"93%",
        positive:"Cannot externally rotate at 90° abduction",
        negative:"Normal ER at 90° abduction",
        how:"Patient abducts shoulder to 90°, elbow 90°. Ask to EXTERNALLY ROTATE against gravity (bring hand toward ceiling) from this position. Positive = cannot externally rotate at 90° abduction. Highly specific for teres minor tear.",
        options:["Negative","Positive — teres minor tear suspected"],
      },
      { id:"st_obrien", label:"O'Brien's Test (Active Compression)", structure:"SLAP lesion / AC joint",
        sensitivity:"63–100%", specificity:"73–99%",
        positive:"Pain in adduction = SLAP. Pain at top = AC joint",
        negative:"No pain in either position",
        how:"Shoulder 90° flexion, 10° horizontal adduction, FULL INTERNAL ROTATION (thumb down). Apply downward force. Note pain. Then REPEAT with shoulder in EXTERNAL ROTATION (thumb up). SLAP positive = pain with IR that reduces with ER (pain deep in shoulder). AC positive = pain at top of shoulder with IR that also reduces with ER.",
        options:["Negative","Positive — SLAP (deep pain with IR, resolves with ER)","Positive — AC joint (top of shoulder)","Both positive"],
      },
      { id:"st_speeds", label:"Speed's Test", structure:"Biceps long head / SLAP",
        sensitivity:"54%", specificity:"81%",
        positive:"Bicipital groove pain with resisted flexion",
        negative:"No pain",
        how:"Shoulder flexed ~60°, elbow EXTENDED, forearm SUPINATED. Apply downward resistance to distal forearm. Positive = pain at BICIPITAL GROOVE. Less specific test — combine with O'Brien's for SLAP confirmation.",
        options:["Negative","Positive — bicipital groove pain (biceps LH tendinopathy / SLAP)"],
      },
      { id:"st_yergason", label:"Yergason's Test", structure:"Biceps tendon stability in groove",
        sensitivity:"43%", specificity:"79%",
        positive:"Pain at bicipital groove with resisted supination",
        negative:"No pain",
        how:"Elbow 90° at side. Apply resistance as patient attempts SUPINATION + ELBOW FLEXION. Positive = pain at bicipital groove (biceps tendinopathy or biceps LH instability). Can also palp groove simultaneously.",
        options:["Negative","Positive — bicipital groove pain","Positive — tendon subluxes from groove"],
      },
      { id:"st_apprehension", label:"Apprehension Test", structure:"Anterior GH instability",
        sensitivity:"53%", specificity:"99%",
        positive:"Apprehension / fear of dislocation (NOT just pain)",
        negative:"No apprehension in this position",
        how:"Patient supine or seated. Abduct to 90°, externally rotate to near end range. Apply ANTERIOR PRESSURE on posterior humeral head. Positive = patient shows APPREHENSION (guarding, fear, tries to escape) — not just pain. Fear response is the key finding.",
        options:["Negative","Positive — apprehension present","Positive — pain only (not apprehension)","Positive — guarding + pain"],
      },
      { id:"st_relocation", label:"Relocation Test", structure:"Anterior GH instability confirmation",
        sensitivity:"57%", specificity:"87%",
        positive:"Apprehension relieves with posterior humeral pressure",
        negative:"No change in symptoms",
        how:"Performed AFTER apprehension test. While arm in same position (90° abd, ER), apply POSTERIOR pressure on anterior humeral head (relocating it). Positive = apprehension or pain RELIEVES. This confirms anterior instability.",
        options:["Negative","Positive — apprehension relieves (confirms anterior instability)"],
      },
      { id:"st_sulcus", label:"Sulcus Sign", structure:"Inferior GH instability / IGHL",
        sensitivity:"72%", specificity:"85%",
        positive:"Sulcus visible below acromion > 1cm",
        negative:"No visible sulcus",
        how:"Patient seated, arm relaxed at side. Apply DOWNWARD traction on arm (axial traction). Observe for SULCUS (groove) below acromion. Measure in cm. Grade 1: < 1cm. Grade 2: 1–2cm. Grade 3: > 2cm.",
        options:["Negative (< 0.5cm)","Grade 1 (< 1cm — mild laxity)","Grade 2 (1–2cm — moderate instability)","Grade 3 (> 2cm — severe inferior instability)"],
      },
      { id:"st_acromioclavicular", label:"AC Joint Paxinos Test", structure:"Acromioclavicular joint",
        sensitivity:"79%", specificity:"50%",
        positive:"AC joint pain with compression",
        negative:"No AC pain",
        how:"Thumb under acromion, fingers over clavicle. Apply SUPERIOR force with thumb while pressing DOWN with fingers (approximates AC joint). Positive = reproduces AC joint pain.",
        options:["Negative","Positive — AC joint pain (OA/injury)"],
      },
      { id:"st_cross_arm", label:"Cross-Arm Adduction Test", structure:"Acromioclavicular joint",
        sensitivity:"77%", specificity:"79%",
        positive:"AC joint pain with horizontal adduction",
        negative:"No AC pain",
        how:"Flex shoulder 90°. Adduct ACROSS body horizontally (horizontal adduction to end range). Positive = pain at TOP of shoulder (AC joint). Passive overpressure at end range increases sensitivity.",
        options:["Negative","Positive — AC joint pain"],
      },
      { id:"st_scapular_dyskinesis", label:"Scapular Dyskinesis Test", structure:"Scapular stabilisers",
        sensitivity:"80%", specificity:"65%",
        positive:"Visible winging or altered rhythm",
        negative:"Normal smooth scapular movement",
        how:"Observe scapulae during BILATERAL shoulder flexion and abduction (3 repetitions each). Also observe during arm lowering. Look for: (1) Medial border winging (serratus inhibited), (2) Inferior angle prominence (lower trap inhibited), (3) Early elevation (upper trap dominant), (4) Asymmetry left vs right. Use Kibler's classification: Type I (inferior angle), II (medial border), III (superior border).",
        options:["None — normal scapulohumeral rhythm","Type I — inferior angle prominence","Type II — medial border winging","Type III — superior border elevation / early shrug","Combined types"],
      },
      { id:"st_kibler_slide", label:"Lateral Scapular Slide Test", structure:"Scapular position symmetry",
        sensitivity:"76%", specificity:"78%",
        positive:"Side-to-side difference > 1.5cm",
        negative:"< 1cm difference bilateral",
        how:"Patient standing. Measure distance from inferior angle of scapula to nearest thoracic spinous process in: (1) Arms at side, (2) Hands on hips, (3) Arms at 90° abduction. Compare bilateral distances. > 1.5cm asymmetry = significant scapular asymmetry.",
        options:["Normal (< 1cm asymmetry)","Mild asymmetry (1–1.5cm)","Significant asymmetry (> 1.5cm)"],
      },
    ]
  },

  elbow_wrist:{
    label:"Elbow & Wrist", color:"#ff9a9e", icon:"🩷",
    tests:[
      { id:"st_cozens", label:"Cozen's Test", structure:"Lateral epicondyle — ECRB",
        sensitivity:"84%", specificity:"75%",
        positive:"Lateral epicondyle pain with resisted wrist ext",
        negative:"No pain",
        how:"Palpate lateral epicondyle. Patient makes a fist and EXTENDS wrist against resistance (therapist resists). Positive = sharp pain at lateral epicondyle. Most sensitive test for lateral epicondylalgia.",
        options:["Negative","Positive — lateral epicondyle pain (lateral epicondylalgia)"],
      },
      { id:"st_mills", label:"Mill's Test", structure:"Lateral epicondyle — ECRB (passive)",
        sensitivity:"53%", specificity:"85%",
        positive:"Lateral epicondyle pain with passive stretch",
        negative:"No pain",
        how:"Pronate forearm, flex wrist fully, then EXTEND elbow from this position (stretching ECRB). Positive = lateral epicondyle pain. Combines passive stretch with neural tension — if neurological = pain also in forearm.",
        options:["Negative","Positive — lateral epicondyle pain (ECRB)","Positive + forearm pain (neural component)"],
      },
      { id:"st_golfers", label:"Golfer's Elbow Test", structure:"Medial epicondyle — FCR/FCU",
        sensitivity:"75%", specificity:"78%",
        positive:"Medial epicondyle pain with resisted wrist flexion",
        negative:"No pain",
        how:"Palpate medial epicondyle. Resist WRIST FLEXION with forearm supinated. Positive = medial epicondyle pain (medial epicondylalgia / golfer's elbow). Provocative: add forearm supination simultaneously.",
        options:["Negative","Positive — medial epicondyle pain (medial epicondylalgia)"],
      },
      { id:"st_valgus_stress_elbow", label:"Elbow Valgus Stress Test", structure:"MCL (UCL) of elbow",
        sensitivity:"65%", specificity:"50%",
        positive:"Medial elbow pain with valgus stress",
        negative:"No pain or laxity",
        how:"Elbow 30° flexion. Apply VALGUS force (push forearm laterally while stabilising humerus). Feel for laxity or pain at medial elbow. Compare to contralateral side. 'Milking manoeuvre' variation: patient grabs thumb and applies valgus with flexing elbow — Positive = medial elbow pain.",
        options:["Negative","Positive — medial pain (MCL sprain)","Positive — laxity (MCL rupture)"],
      },
      { id:"st_tinel_elbow", label:"Tinel's Sign at Elbow", structure:"Ulnar nerve at cubital tunnel",
        sensitivity:"70%", specificity:"98%",
        positive:"Tingling in ring/little finger distribution",
        negative:"No distal symptoms",
        how:"Percuss (tap) ulnar nerve at CUBITAL TUNNEL (medial elbow, between medial epicondyle and olecranon). Positive = tingling in ulnar distribution (ring and little finger, medial forearm). Compare with carpal tunnel Tinel's — elbow Tinel = cubital tunnel syndrome.",
        options:["Negative","Positive — ulnar tingling (cubital tunnel syndrome)"],
      },
      { id:"st_phalen", label:"Phalen's Test", structure:"Median nerve — carpal tunnel",
        sensitivity:"68%", specificity:"73%",
        positive:"Thumb/index/middle finger tingling < 60 seconds",
        negative:"No symptoms in 60 seconds",
        how:"Patient holds both wrists in FULL FLEXION (dorsa of hands pressed together) for 60 seconds. Positive = tingling/numbness in MEDIAN nerve distribution (thumb, index, middle, and radial half of ring finger). Earlier onset = more severe carpal tunnel.",
        options:["Negative (> 60 seconds)","Positive < 30 seconds (severe CTS)","Positive 30–60 seconds (moderate CTS)","Bilateral positive"],
      },
      { id:"st_tinel_wrist", label:"Tinel's Sign at Wrist", structure:"Median nerve — carpal tunnel",
        sensitivity:"60%", specificity:"67%",
        positive:"Tingling in median distribution with percussion",
        negative:"No symptoms",
        how:"Percuss (tap) over CARPAL TUNNEL (volar wrist crease, palmaris longus tendon). Positive = tingling in thumb, index, middle, half ring finger (median distribution).",
        options:["Negative","Positive — carpal tunnel syndrome"],
      },
      { id:"st_finkelstein", label:"Finkelstein's Test", structure:"APL + EPB — De Quervain's",
        sensitivity:"High", specificity:"Moderate",
        positive:"Sharp pain at radial styloid/1st dorsal compartment",
        negative:"No pain",
        how:"Patient makes fist OVER thumb (Eichoff manoeuvre). Then therapist ulnar deviates wrist passively. Positive = sharp pain at RADIAL STYLOID / first dorsal compartment (De Quervain's tenosynovitis). Compare to contralateral side — all wrists may be slightly uncomfortable.",
        options:["Negative","Positive — radial styloid pain (De Quervain's tenosynovitis)"],
      },
      { id:"st_watson", label:"Watson Scaphoid Shift Test", structure:"Scapholunate ligament",
        sensitivity:"69%", specificity:"66%",
        positive:"Clunk or dorsal wrist pain with shift",
        negative:"No shift, no pain",
        how:"Grasp wrist with thumb on SCAPHOID TUBERCLE (volar wrist). Apply pressure on scaphoid while RADIALLY DEVIATING wrist (moving from ulnar to radial deviation). Positive = clunk or pain as scaphoid subluxes over dorsal rim of radius — indicates scapholunate ligament injury.",
        options:["Negative","Positive — clunk (SL instability)","Positive — dorsal wrist pain only"],
      },
      { id:"st_grind", label:"Grind Test", structure:"1st CMC joint (thumb base)",
        sensitivity:"High for CMC OA", specificity:"Moderate",
        positive:"Base of thumb pain and crepitus with grind",
        negative:"No pain",
        how:"Grasp patient's thumb metacarpal. Apply AXIAL COMPRESSION and ROTATION simultaneously (grinding). Positive = pain and/or crepitus at base of thumb (1st CMC joint OA).",
        options:["Negative","Positive — CMC OA (pain +/- crepitus)"],
      },
    ]
  },

  lumbar:{
    label:"Lumbar Spine", color:"#ff6b35", icon:"🟠",
    tests:[
      { id:"st_slr_test", label:"Straight Leg Raise (SLR)", structure:"L4–S1 nerve roots / disc",
        sensitivity:"80%", specificity:"40%",
        positive:"Radicular pain 30–70°. Bragard increases sensitivity",
        negative:"No radicular symptoms",
        how:"Patient SUPINE, knee extended. Passively RAISE leg. Note angle at first resistance. Add ANKLE DORSIFLEXION (Bragard's test) to sensitise. Positive = radicular leg pain (not back pain) at 30–70°. Crossed SLR (raising opposite leg produces ipsilateral symptoms) is highly specific for disc herniation (90% specificity).",
        options:["Negative","Positive 30–60° (highly specific for disc herniation)","Positive 60–90° (mild — less specific)","Positive + Bragard (neural tension confirmed)","Crossed SLR positive (disc herniation)"],
      },
      { id:"st_prone_instab", label:"Prone Instability Test", structure:"Lumbar segmental instability",
        sensitivity:"72%", specificity:"58%",
        positive:"Pain reduces when muscles activated",
        negative:"Pain unchanged with muscle activation",
        how:"Patient PRONE, feet on floor (hip extended). Apply POSTERIOR-ANTERIOR pressure on lumbar spinous processes. Note pain. Then ask patient to LIFT FEET (activating spinal stabilisers). Re-apply same PA pressure. POSITIVE = pain reduces or resolves with feet raised. Indicates segmental instability at that level.",
        options:["Negative — pain unchanged with muscle activation","Positive — pain reduces with muscle activation (segmental instability)"],
      },
      { id:"st_stork", label:"Stork Test (Single Leg Extension)", structure:"Spondylolysis / pars stress",
        sensitivity:"50%", specificity:"70%",
        positive:"Ipsilateral low back pain on extension loading",
        negative:"No pain",
        how:"Patient stands on ONE leg. EXTEND lumbar spine while balancing (Stork position). Positive = ipsilateral low back pain at the lumbar level. Young athletes with LBP — highly suspicious for SPONDYLOLYSIS (pars interarticularis stress fracture). Also test with hands on hips and extend.",
        options:["Negative","Positive — ipsilateral LBP (spondylolysis suspected)","Positive — bilateral LBP (bilateral pars)"],
      },
      { id:"st_kemp", label:"Kemp's Test (Lumbar Quadrant)", structure:"Lumbar facet joints",
        sensitivity:"Low", specificity:"High for facet",
        positive:"Local ipsilateral LBP with quadrant loading",
        negative:"No pain",
        how:"Patient seated or standing. EXTEND lumbar spine, then add IPSILATERAL ROTATION and SIDE FLEXION simultaneously (closing down ipsilateral facet joint). Positive = local ipsilateral low back pain (not radicular) = facet joint pathology. If radicular = disc or foramen contributing.",
        options:["Negative","Positive — local LBP (facet joint)","Positive — radicular symptoms (foramen/nerve)"],
      },
      { id:"st_adams", label:"Adam's Forward Bend Test", structure:"Scoliosis screen",
        sensitivity:"84%", specificity:"93%",
        positive:"Rib hump or paraspinal prominence visible",
        negative:"Symmetric forward bend",
        how:"Patient bends FORWARD 90°, arms hanging, feet together. Observe from BEHIND at eye level (spine horizontal). Look for ASYMMETRY: rib hump (thoracic rotation) or paraspinal prominence (lumbar). Measure with SCOLIOMETER if available (> 5° = referral threshold).",
        options:["Negative — symmetric","Positive — thoracic rib hump (structural scoliosis)","Positive — lumbar prominence (lumbar scoliosis)","Both levels — S-curve scoliosis"],
      },
      { id:"st_si_distraction", label:"SI Distraction Test", structure:"SIJ posterior ligaments",
        sensitivity:"60%", specificity:"81%",
        positive:"SI joint or buttock pain",
        negative:"No SI symptoms",
        how:"Patient SUPINE. Apply bilateral OUTWARD force on ASIS (distract pelvis). Hold 30 seconds. Positive = SI joint or buttock pain (posterior SI ligaments stressed by anteroposterior gapping).",
        options:["Negative","Positive — left SI pain","Positive — right SI pain","Bilateral positive"],
      },
      { id:"st_si_compression", label:"SI Compression Test", structure:"SIJ anterior ligaments",
        sensitivity:"69%", specificity:"69%",
        positive:"SI joint pain with compression",
        negative:"No SI symptoms",
        how:"Patient in SIDE LYING. Apply DOWNWARD COMPRESSION over iliac crest (compresses SI joint from above). Positive = SI joint pain. Combine with distraction and other SI tests — 3+ positive = 91% specific for SIJ.",
        options:["Negative","Positive — SI joint pain"],
      },
      { id:"st_gaenslen", label:"Gaenslen's Test", structure:"SIJ — extension loading",
        sensitivity:"53%", specificity:"71%",
        positive:"SI joint pain with hip extension stress",
        negative:"No SI pain",
        how:"Patient SUPINE at edge of table. Flex contralateral hip to chest (patient holds). Allow TEST leg to DROP into extension (hang off table edge). Positive = ipsilateral SI joint pain (extension stress on SIJ). Can also perform in sidelying.",
        options:["Negative","Positive — left SIJ","Positive — right SIJ"],
      },
      { id:"st_thigh_thrust", label:"Thigh Thrust Test", structure:"Posterior SIJ",
        sensitivity:"88%", specificity:"69%",
        positive:"Ipsilateral posterior pelvic pain",
        negative:"No SIJ symptoms",
        how:"Patient SUPINE. Hip flexed 90°. Therapist applies POSTERIOR force through FEMUR (along shaft toward table). Positive = posterior pelvic pain (SIJ shear stress). The highest sensitivity single SIJ test.",
        options:["Negative","Positive — posterior pelvic pain (SIJ)"],
      },
      { id:"st_lateral_shift", label:"Lateral Shift Correction Test", structure:"Lumbar disc — directional preference",
        sensitivity:"Moderate", specificity:"Moderate",
        positive:"Shift corrects or symptoms change",
        negative:"No change",
        how:"Patient standing with visible lateral shift. Therapist stands on CONVEX side of shift. Place shoulder against patient's thorax and pelvis on opposite side. Gradually CORRECT shift over multiple sessions. POSITIVE (useful test) = correction eases symptoms (confirms disc herniation protective pattern). McKenzie direction of preference established.",
        options:["Shift corrects easily — centralises symptoms","Shift corrects partially — some symptom change","Shift does not correct — consider structural cause","Shift worsens symptoms — STOP (wrong direction)"],
      },
    ]
  },

  hip:{
    label:"Hip", color:"#00c97a", icon:"🟢",
    tests:[
      { id:"st_faber_test", label:"FABER / Patrick's Test", structure:"SIJ / hip joint",
        sensitivity:"77%", specificity:"75%",
        positive:"Groin pain = hip. Posterior pelvic pain = SIJ",
        negative:"No pain, full range",
        how:"Patient SUPINE. Place ankle of test side on opposite KNEE (figure-4 position). Allow knee to FALL toward table under gravity. Positive = GROIN PAIN (hip joint/capsule) or POSTERIOR PELVIC PAIN (SIJ). Compare height of knee to contralateral side. Restriction = hip capsule or hip flexor tightness.",
        options:["Negative — knee drops symmetrically","Positive — groin pain (hip pathology)","Positive — posterior pelvic pain (SIJ)","Restricted range — hip capsular limitation"],
      },
      { id:"st_fadir_test", label:"FADIR Test", structure:"Hip impingement / labrum",
        sensitivity:"78%", specificity:"51%",
        positive:"Anterior groin pain (impingement / labral)",
        negative:"No symptoms",
        how:"Patient SUPINE. Bring hip to 90° FLEXION, then passively ADDUCT and INTERNALLY ROTATE (FADIR position). Positive = anterior GROIN PAIN (femoroacetabular impingement or labral tear). Most sensitive test for hip impingement — high sensitivity but moderate specificity.",
        options:["Negative","Positive — anterior groin pain (FAI / labral tear)","Positive — lateral hip pain (different pathology)"],
      },
      { id:"st_hip_scour", label:"Hip Scour Test", structure:"Hip joint — general pathology",
        sensitivity:"Moderate", specificity:"Moderate",
        positive:"Groin pain or catching with scour",
        negative:"No symptoms with circumduction",
        how:"Patient supine, hip and knee at 90°. Apply AXIAL COMPRESSION through femur toward acetabulum while CIRCUMDUCTING hip (circular motion). 'Scour' the joint. Positive = groin pain or catching sensation (OA, loose body, labral tear, cartilage pathology).",
        options:["Negative","Positive — groin pain (hip joint pathology)","Positive — catching/clicking (labral tear / loose body)"],
      },
      { id:"st_trendelenburg_test", label:"Trendelenburg Test", structure:"Gluteus medius",
        sensitivity:"72%", specificity:"77%",
        positive:"Contralateral pelvis drops on single-leg stance",
        negative:"Pelvis level for 30 seconds",
        how:"Patient stands on ONE leg for 30 seconds. Observe PELVIC LEVEL from behind. Normal = pelvis remains level or slight rise on swing side. Positive (Trendelenburg) = CONTRALATERAL pelvis DROPS > 2cm below horizontal. Indicates glute med weakness on STANDING leg. Compensatory Trendelenburg = patient leans trunk toward stance side to reduce moment arm.",
        options:["Negative — pelvis level","Positive — pelvic drop right","Positive — pelvic drop left","Compensatory lurch (trunk lean over stance leg)"],
      },
      { id:"st_thomas_test", label:"Thomas Test", structure:"Hip flexor length",
        sensitivity:"89%", specificity:"91%",
        positive:"Hip does not reach table = iliopsoas. Knee extends = rectus femoris",
        negative:"Hip reaches table, knee stays at 90°",
        how:"Patient SUPINE at table edge. Bring BOTH hips to chest (flatten lumbar). LOWER test leg. Observe: (1) THIGH ELEVATION = iliopsoas tight (hip cannot extend to neutral). (2) KNEE EXTENSION = rectus femoris tight (knee straightens as hip drops). (3) THIGH ABDUCTION = TFL tight.",
        options:["Negative — full hip extension, knee at 90°","Positive — iliopsoas (thigh elevated)","Positive — rectus femoris (knee extends)","Positive — TFL (thigh abducts)","Combined — both hip and knee compensation"],
      },
      { id:"st_ober_test", label:"Ober's Test", structure:"IT band / TFL",
        sensitivity:"75%", specificity:"80%",
        positive:"Leg cannot adduct below horizontal",
        negative:"Leg adducts past horizontal freely",
        how:"Patient SIDELYING, affected side UP. Stabilise pelvis. ABDUCT and EXTEND hip (align with body). Then slowly allow leg to ADDUCT (drop toward table) while maintaining extension. POSITIVE = leg cannot adduct below horizontal (< 10° adduction) = IT band/TFL restriction. Modified Ober: knee bent (isolates IT band over knee).",
        options:["Negative — leg adducts freely","Positive — leg stays elevated (IT band/TFL tight)"],
      },
      { id:"st_piriformis_test", label:"Piriformis Test (FAIR)", structure:"Piriformis muscle",
        sensitivity:"88%", specificity:"83%",
        positive:"Deep buttock pain reproduced",
        negative:"No buttock or sciatic pain",
        how:"Patient SIDELYING, affected side up. Hip FLEXED 60°, knee FLEXED 60°. Apply DOWNWARD FORCE on knee (adduction and internal rotation of hip) — FAIR position. Positive = DEEP BUTTOCK PAIN or sciatic symptoms. Test implicates piriformis compressing sciatic nerve.",
        options:["Negative","Positive — deep buttock pain (piriformis syndrome)","Positive — sciatic symptoms (sciatic nerve compression)"],
      },
      { id:"st_90_90", label:"90-90 Hamstring Test", structure:"Hamstring length + hip mobility",
        sensitivity:"High", specificity:"Moderate",
        positive:"Knee cannot extend to < 20° from full extension",
        negative:"Knee extends to within 20° of full extension",
        how:"Patient SUPINE. Bring hip to 90° FLEXION, knee at 90°. Ask to ACTIVELY EXTEND knee as far as possible. Measure the angle short of full extension. Normal: within 20° of full extension. Positive = > 20° from full extension = hamstring tightness. Also tests: is restriction from hip capsule (entire leg moves back) or hamstring (only knee extension limited)?",
        options:["Normal (< 20° from full extension)","Mild hamstring tightness (20–30°)","Moderate hamstring tightness (30–45°)","Severe hamstring tightness (> 45°)"],
      },
    ]
  },

  knee:{
    label:"Knee", color:"#ffb300", icon:"🟡",
    tests:[
      { id:"st_lachmans", label:"Lachman's Test", structure:"ACL integrity",
        sensitivity:"85%", specificity:"94%",
        positive:"Anterior tibial translation > 5mm or soft end-feel",
        negative:"Firm end-feel, < 5mm translation",
        how:"Patient SUPINE, knee at 20–30° flexion. Stabilise FEMUR with one hand (above knee). Grasp TIBIA just below joint line with other hand. Apply ANTERIOR translation force. Assess: amount of tibial movement AND quality of end-feel. Firm end-feel = ACL intact. Soft/empty end-feel = ACL rupture. Best ACL test.",
        options:["Negative — firm end-feel","Grade 1 (< 5mm — mild sprain)","Grade 2 (5–10mm — partial tear)","Grade 3 (> 10mm, soft end-feel — complete ACL rupture)"],
      },
      { id:"st_anterior_drawer", label:"Anterior Drawer Test", structure:"ACL",
        sensitivity:"62%", specificity:"88%",
        positive:"Anterior tibial translation > 5mm",
        negative:"Firm end-feel",
        how:"Patient SUPINE, knee at 90° flexion, foot flat on table. Sit on patient's foot (stabilise). Grasp tibia just below joint line with both hands. Apply ANTERIOR TRANSLATION. Less accurate than Lachman's in acute injury (hamstring guarding at 90° reduces translation). More useful in chronic ACL insufficiency.",
        options:["Negative","Positive — ACL insufficiency (compare to Lachman's)"],
      },
      { id:"st_posterior_drawer", label:"Posterior Drawer Test", structure:"PCL integrity",
        sensitivity:"90%", specificity:"99%",
        positive:"Posterior tibial sag / translation",
        negative:"No posterior sag",
        how:"Patient SUPINE, hip 45°, knee 90°. Observe tibia from side — POSTERIOR SAG indicates PCL rupture (gravity causes tibial drop). Apply POSTERIOR FORCE on tibia. Positive = posterior translation. ALWAYS check for posterior sag BEFORE doing anterior drawer (prevents misinterpreting sag as anterior laxity).",
        options:["Negative — no posterior sag","Positive — posterior sag present (PCL rupture)","Positive — posterior translation with force"],
      },
      { id:"st_pivot_shift", label:"Pivot Shift Test", structure:"ACL — rotational instability",
        sensitivity:"35–95%", specificity:"95–99%",
        positive:"Clunk or subluxation at 30° flexion",
        negative:"Smooth motion, no shift",
        how:"Patient SUPINE, hip 30° flexion. Apply VALGUS and INTERNAL ROTATION to foot while FLEXING knee from extension. At ~30° flexion, the iliotibial band crosses the axis of rotation — positive = CLUNK (tibia reduces from subluxed position). Best performed under anaesthesia. Grade 1 = glide, Grade 2 = clunk, Grade 3 = gross subluxation.",
        options:["Negative — smooth motion","Grade 1 — glide (mild)","Grade 2 — clunk (moderate)","Grade 3 — gross subluxation (severe ACL rupture)"],
      },
      { id:"st_valgus_stress_knee", label:"Valgus Stress Test", structure:"MCL integrity",
        sensitivity:"91%", specificity:"86%",
        positive:"Medial joint opening or pain",
        negative:"Firm end-feel, < 5mm opening",
        how:"Knee at 0° and at 30° flexion. Apply VALGUS force (push lateral side — open medial). Test at 0°: positive = MCL + posterior capsule/PCL. Test at 30° only: positive = MCL in isolation. Grade 1: pain only. Grade 2: 5–10mm opening. Grade 3: > 10mm opening.",
        options:["Negative","Grade 1 — pain only (MCL sprain)","Grade 2 — 5–10mm opening (partial tear)","Grade 3 — > 10mm opening (complete MCL rupture)"],
      },
      { id:"st_varus_stress_knee", label:"Varus Stress Test", structure:"LCL integrity",
        sensitivity:"25%", specificity:"96%",
        positive:"Lateral joint opening or pain",
        negative:"Firm end-feel",
        how:"Knee at 0° and 30°. Apply VARUS force (push medial side — open lateral). At 30° only: LCL isolated. At 0°: LCL + PCL and posterolateral corner. LCL injuries are less common than MCL.",
        options:["Negative","Positive — lateral pain (LCL sprain)","Positive — lateral opening (LCL tear)"],
      },
      { id:"st_mcmurray_test", label:"McMurray's Test", structure:"Meniscal integrity",
        sensitivity:"53%", specificity:"59%",
        positive:"Click or pain at joint line",
        negative:"No symptoms",
        how:"Patient SUPINE. Fully FLEX knee. For MEDIAL meniscus: apply VALGUS force + EXTERNAL ROTATION of tibia. For LATERAL meniscus: apply VARUS force + INTERNAL ROTATION. Slowly EXTEND knee from full flex. Positive = CLICK or PAIN at joint line during extension.",
        options:["Negative","Positive medial (valgus + ER click/pain — medial meniscus)","Positive lateral (varus + IR click/pain — lateral meniscus)","Bilateral positive"],
      },
      { id:"st_apley", label:"Apley's Grind Test", structure:"Meniscus — differentiate from ligament",
        sensitivity:"60%", specificity:"70%",
        positive:"Pain with compression (meniscus) vs distraction (ligament)",
        negative:"No pain with either",
        how:"Patient PRONE, knee 90°. STEP 1 — Distract: lift heel (distraction) + rotate. Pain = ligament. STEP 2 — Compress: push heel into table + rotate. Pain = MENISCUS. Differentiating compress vs distract response separates meniscal (compressive) from ligamentous (distractive) pathology.",
        options:["Negative both","Positive — compression (meniscal pathology)","Positive — distraction (ligamentous)","Both positive"],
      },
      { id:"st_thessaly", label:"Thessaly Test", structure:"Meniscus — weight-bearing",
        sensitivity:"69–89%", specificity:"97%",
        positive:"Medial or lateral joint pain/catching with rotation",
        negative:"No symptoms",
        how:"Patient stands on ONE leg, knee at 20° FLEXION (most sensitive angle). Rotate torso internally and externally 3 times while maintaining balance. Positive = MEDIAL or LATERAL joint line pain or clicking. Most accurate meniscal test — simulates physiological weight-bearing.",
        options:["Negative","Positive — medial joint line pain (medial meniscus)","Positive — lateral joint line pain (lateral meniscus)"],
      },
      { id:"st_clarkes", label:"Clarke's Sign", structure:"Patellofemoral joint",
        sensitivity:"39%", specificity:"67%",
        positive:"Anterior knee pain with patellar compression",
        negative:"No pain",
        how:"Patient SUPINE, knee extended. Therapist pushes PATELLA DISTALLY. Ask patient to TIGHTEN QUADRICEPS. Positive = anterior knee pain (chondromalacia patella or PFPS). Low sensitivity — false positives common. More useful combined with patellar grind and lateral tilt assessment.",
        options:["Negative","Positive — anterior knee pain (PFPS / chondromalacia)"],
      },
      { id:"st_patellar_grind", label:"Patellar Grind Test", structure:"Patellofemoral cartilage",
        sensitivity:"Moderate", specificity:"Moderate",
        positive:"Crepitus or pain with patellar compression",
        negative:"No crepitus or pain",
        how:"Patient SUPINE. Compress PATELLA into trochlea with thumb and index. Gently GRIND patella in small circles. Positive = crepitus (cartilage change) and/or pain. Also assess patellar mobility (medial/lateral glide) and tilt test (medial edge lift — tight lateral retinaculum if cannot lift).",
        options:["Negative","Positive — pain only (PFPS)","Positive — crepitus (chondromalacia)","Positive — both pain and crepitus"],
      },
      { id:"st_effusion", label:"Sweep / Ballottement Test", structure:"Knee effusion",
        sensitivity:"75%", specificity:"84%",
        positive:"Fluid wave present",
        negative:"No fluid wave",
        how:"SWEEP TEST: Patient supine, knee extended. Use palm to SWEEP fluid from medial gutter to suprapatellar pouch. Then sweep down lateral side — observe for FLUID WAVE on medial side. Positive = small effusion. BALLOTTEMENT: Apply downward patellar pressure — if patella bounces = moderate/large effusion.",
        options:["No effusion","Small effusion (sweep test positive)","Moderate effusion (ballottement positive)","Large effusion (visible swelling)"],
      },
      { id:"st_noble", label:"Noble Compression Test", structure:"IT band at lateral femoral epicondyle",
        sensitivity:"High for ITB syndrome", specificity:"Moderate",
        positive:"Sharp pain at 2cm above lateral joint line at 30° flex",
        negative:"No pain at this point",
        how:"Patient SUPINE. Apply firm pressure at LATERAL FEMORAL EPICONDYLE (2cm above lateral joint line = 'Noble's point'). Then flex and extend knee to 30°. Positive = SHARP PAIN at this precise point — IT band syndrome. Also: ask runner to replicate the activity that causes pain (may need treadmill).",
        options:["Negative","Positive — IT band syndrome (lateral epicondyle point tenderness at 30°)"],
      },
    ]
  },

  ankle_foot:{
    label:"Ankle & Foot", color:"#a8ff3e", icon:"🟢",
    tests:[
      { id:"st_ant_drawer_ankle", label:"Anterior Drawer Test — Ankle", structure:"ATFL integrity",
        sensitivity:"85%", specificity:"75%",
        positive:"Anterior talar translation > 10mm (> 3mm vs contralateral)",
        negative:"Firm end-feel, symmetric",
        how:"Patient seated, ankle at 20° PLANTARFLEXION (ATFL more vertical = more isolated). Stabilise TIBIA with one hand. With other hand, grasp CALCANEUS and apply ANTERIOR force (translate talus forward in mortise). Positive = > 10mm translation or soft end-feel. Compare bilaterally — > 3mm asymmetry = significant.",
        options:["Negative — firm end-feel","Positive — ATFL sprain (mild laxity)","Positive — ATFL rupture (> 10mm, soft end-feel)"],
      },
      { id:"st_talar_tilt", label:"Talar Tilt Test", structure:"CFL integrity",
        sensitivity:"50%", specificity:"74%",
        positive:"Excessive inversion tilt vs contralateral",
        negative:"Symmetric tilt, firm end-feel",
        how:"Ankle neutral (0°). Apply INVERSION STRESS (tilt calcaneus into inversion). CFL isolated at neutral. Positive = excessive inversion tilting > 15° or > 5° vs contralateral. Confirms CFL injury — usually combined with ATFL in Grade 3 lateral ankle sprain.",
        options:["Negative","Positive — CFL laxity (combined lateral ankle instability)"],
      },
      { id:"st_squeeze_ankle", label:"Squeeze / Mortise Test", structure:"Syndesmosis — high ankle sprain",
        sensitivity:"69%", specificity:"84%",
        positive:"Anterior ankle pain with proximal compression",
        negative:"No distal pain",
        how:"Squeeze fibula and tibia TOGETHER at mid-CALF level (well away from ankle). Positive = ANTERIOR ANKLE pain (at syndesmosis) reproduced by this proximal compression. Indicates syndesmotic (high ankle) sprain — much longer recovery than lateral sprain.",
        options:["Negative","Positive — syndesmotic (high ankle) sprain"],
      },
      { id:"st_thompson_test", label:"Thompson's Test", structure:"Achilles tendon rupture",
        sensitivity:"96%", specificity:"93%",
        positive:"No plantarflexion with calf squeeze",
        negative:"Foot plantarflexes with squeeze",
        how:"Patient PRONE, feet over table edge. SQUEEZE calf muscle belly (mid-calf). Normal = foot PLANTARFLEXES. POSITIVE = no plantarflexion = complete Achilles rupture. The Simmond's test. Patient may still be able to plantarflex actively (via other muscles) — do NOT rely on active PF.",
        options:["Negative — plantarflexion present (Achilles intact)","Positive — no plantarflexion (complete Achilles rupture)"],
      },
      { id:"st_windlass_test", label:"Windlass Test", structure:"Plantar fascia",
        sensitivity:"High for plantar fasciopathy", specificity:"Moderate",
        positive:"Plantar fascia pain with toe extension",
        negative:"No plantar pain",
        how:"Patient WEIGHT-BEARING (standing). Passively EXTEND GREAT TOE 60–70°. Positive = pain at MEDIAL CALCANEAL TUBERCLE or along plantar fascia. The windlass mechanism tightens the plantar fascia. More positive weight-bearing than non-weight-bearing.",
        options:["Negative","Positive — medial heel pain (plantar fasciitis)","Positive — mid-plantar pain (plantar fasciopathy)"],
      },
      { id:"st_navicular_drop", label:"Navicular Drop Test", structure:"Medial arch collapse / tibialis posterior",
        sensitivity:"High for arch collapse", specificity:"Moderate",
        positive:"Navicular drop > 10mm",
        negative:"< 6mm navicular drop",
        how:"Mark NAVICULAR TUBEROSITY with pen marker while patient seated (non-weight-bearing). Mark height from floor. Then patient STANDS (weight-bearing). Measure new navicular height. NAVICULAR DROP = difference between non-WB and WB heights. Normal: < 6mm. Mild: 6–10mm. Significant: > 10mm. > 10mm = tibialis posterior insufficiency / medial arch collapse.",
        options:["Normal (< 6mm drop)","Mild collapse (6–10mm)","Significant collapse (> 10mm — tib post insufficiency)"],
      },
      { id:"st_tinel_ankle", label:"Tinel's Sign — Ankle", structure:"Posterior tibial nerve (tarsal tunnel)",
        sensitivity:"58%", specificity:"86%",
        positive:"Tingling in plantar foot with percussion",
        negative:"No distal symptoms",
        how:"Percuss POSTERIOR TIBIAL NERVE behind MEDIAL MALLEOLUS (tarsal tunnel). Positive = tingling along plantar foot / toes (tibial nerve distribution). Tarsal tunnel syndrome — analogous to carpal tunnel at the ankle.",
        options:["Negative","Positive — plantar tingling (tarsal tunnel syndrome)"],
      },
      { id:"st_royal_london", label:"Royal London Hospital Test", structure:"Achilles tendinopathy",
        sensitivity:"High for mid-portion tendinopathy", specificity:"Moderate",
        positive:"Pain reduced at mid-tendon with ankle DF",
        negative:"Pain at mid-tendon in all positions",
        how:"Palpate MID-PORTION of Achilles tendon (2–6cm above insertion) — note tenderness. Then DORSIFLEX ankle (stretches and thins Achilles). Re-palpate. POSITIVE (test is positive for mid-portion tendinopathy) = tenderness REDUCES with dorsiflexion. Note: this is a CONFIRMING test — positive means mid-portion, not insertional.",
        options:["Positive (mid-portion tendinopathy confirmed — pain reduces with DF)","Negative (pain unchanged — may be insertional or other pathology)"],
      },
    ]
  },

  neural:{
    label:"Neurological Special Tests", color:"#d4a5ff", icon:"🟣",
    tests:[
      { id:"st_slump_test", label:"Slump Test", structure:"Neural tension — entire neuraxis",
        sensitivity:"84%", specificity:"83%",
        positive:"Reproduces symptoms — eases with neck extension",
        negative:"Symptoms don't change with neck extension",
        how:"Patient seated, legs over side. STEP 1: Slump trunk (thoracic + lumbar flexion). STEP 2: Flex NECK (chin to chest). STEP 3: Extend KNEE (straighten leg). STEP 4: DORSIFLEX ankle. STEP 5: EXTEND neck — observe symptom change. POSITIVE = symptoms reproduced AND improve when neck is extended (confirms neural, not muscular, cause).",
        options:["Negative — no symptom change with neck extension","Positive — left (symptoms reproduced + ease with neck ext)","Positive — right","Bilateral positive — central sensitisation suspected"],
      },
      { id:"st_ultt1", label:"ULTT1 — Median Nerve", structure:"Median nerve tension",
        sensitivity:"75%", specificity:"74%",
        positive:"Symptom reproduction in median distribution",
        negative:"No arm symptoms",
        how:"Patient supine. Sequence: (1) Scapular depression, (2) Shoulder abduction 110°, (3) Wrist + finger extension, (4) Forearm supination, (5) Elbow extension, (6) Cervical side flexion AWAY. Sensitise with shoulder IR. Positive = arm symptoms reproduced (median distribution — thumb/index/middle). Release tension to confirm (symptom change).",
        options:["Negative","Positive left — median nerve sensitised","Positive right — median nerve sensitised","Bilateral positive"],
      },
      { id:"st_ultt2", label:"ULTT2 — Radial Nerve", structure:"Radial nerve tension",
        sensitivity:"72%", specificity:"74%",
        positive:"Lateral forearm or dorsal hand symptoms",
        negative:"No radial distribution symptoms",
        how:"Patient supine. Sequence: (1) Scapular depression, (2) Shoulder abduction 40°, (3) Elbow extension, (4) Forearm pronation, (5) Wrist + finger flexion (radial nerve on tension), (6) Shoulder IR. Positive = symptoms in RADIAL distribution (lateral forearm, dorsum hand, thumb). Lateral epicondylalgia often has positive ULTT2.",
        options:["Negative","Positive left — radial nerve sensitised","Positive right — radial nerve sensitised"],
      },
      { id:"st_ultt3", label:"ULTT3 — Ulnar Nerve", structure:"Ulnar nerve tension",
        sensitivity:"75%", specificity:"74%",
        positive:"Ring/little finger and medial forearm symptoms",
        negative:"No ulnar distribution symptoms",
        how:"Patient supine. Sequence: (1) Scapular depression, (2) Shoulder abduction 90°, (3) Wrist + finger extension (ulnar side), (4) Forearm supination, (5) Elbow FLEXION (ulnar nerve stretched at cubital tunnel), (6) Cervical side flexion AWAY. Positive = ring/little finger tingling or medial forearm symptoms.",
        options:["Negative","Positive left — ulnar nerve sensitised","Positive right — ulnar nerve sensitised"],
      },
      { id:"st_femoral_nerve_stretch", label:"Femoral Nerve Stretch Test (FNST)", structure:"Femoral nerve — L2/L3/L4",
        sensitivity:"88%", specificity:"71%",
        positive:"Anterior thigh pain reproduced",
        negative:"No anterior thigh symptoms",
        how:"Patient PRONE. Therapist passively FLEXES KNEE (bring heel toward buttock). If positive = anterior thigh pain reproduced (femoral nerve tension). Extend hip further if needed (increase tension). Compare bilaterally. Tests L2/3/4 nerve roots via femoral nerve.",
        options:["Negative","Positive — anterior thigh pain (femoral nerve tension L2/3/4)"],
      },
      { id:"st_babinski", label:"Babinski Sign", structure:"Corticospinal tract — UMN lesion",
        sensitivity:"60%", specificity:"97%",
        positive:"Great toe extends, toes fan — URGENT REFER",
        negative:"Toes flex (normal plantar reflex)",
        how:"Stroke LATERAL plantar surface of foot with firm blunt instrument (thumbnail or reflex hammer handle). Move from heel toward toes. Normal: toes FLEX (plantar grasp reflex). POSITIVE (abnormal): great toe EXTENDS and other toes FAN OUT. Indicates UPPER MOTOR NEURON lesion — myelopathy, brain lesion, cord compression. URGENT referral.",
        options:["Negative — plantar flexion (normal)","Positive — great toe extension + fanning (UMN lesion — REFER URGENT)"],
      },
      { id:"st_hoffmanns", label:"Hoffmann's Sign", structure:"UMN lesion — cervical myelopathy",
        sensitivity:"Moderate", specificity:"High",
        positive:"Thumb flexes when middle finger flicked",
        negative:"No thumb movement",
        how:"Hold patient's middle finger loosely. Flick the DISTAL PHALANX downward (releasing suddenly). Observe thumb and index finger. POSITIVE = thumb FLEXES and adducts (involuntary) = upper motor neuron sign. Indicates cervical myelopathy or other corticospinal tract pathology. Combine with Babinski.",
        options:["Negative — no thumb movement","Positive — thumb flexes (UMN / myelopathy — REFER)"],
      },
      { id:"st_romberg", label:"Romberg Test", structure:"Posterior column / proprioception",
        sensitivity:"Moderate", specificity:"High",
        positive:"Falls or excessive sway with eyes closed",
        negative:"Minimal sway change with eye closure",
        how:"Patient stands feet together, eyes OPEN 30 seconds (assess baseline sway). Then CLOSE eyes 30 seconds. Normal: minimal increase in sway. POSITIVE: significant increase in sway or falls with eyes closed (proprioception / dorsal column deficit). Distinguish: if falls with eyes OPEN = cerebellar problem. Falls ONLY with eyes closed = peripheral proprioception or dorsal column.",
        options:["Negative — minimal sway change","Positive — increased sway eyes closed (proprioception deficit)","Positive — falls eyes open (cerebellar)"],
      },
    ]
  },

  balance_functional:{
    label:"Balance & Functional", color:"#90caf9", icon:"🔵",
    tests:[
      { id:"st_single_leg_stance", label:"Single Leg Stance Test", structure:"Proprioception + postural stability",
        sensitivity:"High for balance deficit", specificity:"High",
        positive:"< 10 seconds eyes open OR < 5 seconds eyes closed",
        negative:"30+ seconds eyes open, 10+ seconds eyes closed",
        how:"Patient stands on ONE leg, arms folded, hands on opposite shoulders (removes upper limb balance strategy). TIME eyes open to 30 seconds. Then TIME eyes closed to 10 seconds. Record seconds before loss of balance. Compare bilaterally. Norm: 30s eyes open, 10s eyes closed for working age adults (decreases with age).",
        options:["Normal (≥30s eyes open, ≥10s eyes closed)","Mild deficit (20–29s eyes open)","Moderate deficit (10–19s eyes open)","Severe deficit (< 10s eyes open)","Unable to perform"],
      },
      { id:"st_star_excursion", label:"Star Excursion Balance Test (SEBT)", structure:"Dynamic balance + proprioception",
        sensitivity:"High for chronic ankle instability", specificity:"High",
        positive:"Asymmetry > 4cm in any direction vs contralateral",
        negative:"< 4cm asymmetry in all directions",
        how:"Patient stands on one leg at centre of star. Reach free leg in 3 directions: ANTERIOR, POSTEROMEDIAL, POSTEROLATERAL. Measure distance (cm) from centre to reach point. Normalise to leg length. > 4cm asymmetry in posteromedial reach = high injury risk (ankle instability and ACL risk predictor).",
        options:["Normal — < 4cm asymmetry all directions","Anterior deficit (> 4cm)","Posteromedial deficit (> 4cm) — highest injury predictor","Posterolateral deficit (> 4cm)","Multiple direction deficits"],
      },
      { id:"st_functional_hop", label:"Single Leg Hop Tests (4-Test Battery)", structure:"Lower limb power, symmetry, confidence",
        sensitivity:"High for return to sport", specificity:"High",
        positive:"Limb Symmetry Index < 90% in any test",
        negative:"LSI ≥ 90% all tests",
        how:"Test 4 hops each leg: (1) SINGLE HOP for distance. (2) TRIPLE HOP for distance. (3) TRIPLE CROSSOVER HOP for distance. (4) 6-METRE TIMED HOP. Limb Symmetry Index (LSI) = (involved ÷ uninvolved) × 100. LSI < 90% = NOT ready for return to sport. ALL 4 tests must be ≥ 90%.",
        options:["Normal — LSI ≥ 90% all tests","Mild deficit — LSI 80–89%","Moderate deficit — LSI 70–79%","Severe deficit — LSI < 70% (not ready for sport)"],
      },
      { id:"st_berg_balance", label:"Berg Balance Scale", structure:"Functional balance — 14 tasks",
        sensitivity:"91%", specificity:"85% for fall risk",
        positive:"Score < 45/56 = fall risk",
        negative:"Score 50–56 = low fall risk",
        how:"14 balance tasks scored 0–4 each (max 56). Tasks include: sitting to standing, standing unsupported, sitting unsupported, standing to sitting, transfers, standing eyes closed, standing feet together, reaching forward, picking up object, turning 360°, stepping, tandem standing, one-leg standing. Score < 45 = significantly elevated fall risk.",
        options:["Normal 50–56 (low fall risk)","Mild 41–49 (increased fall risk)","Moderate 21–40 (high fall risk — requires aid)","Severe 0–20 (cannot balance independently)"],
      },
    ]
  },

  outcome_tools:{
    label:"Validated Outcome Tools", color:"#ffd700", icon:"📊",
    tests:[
      { id:"st_ndi_tool", label:"Neck Disability Index (NDI)", structure:"Cervical disability",
        sensitivity:"N/A", specificity:"N/A",
        positive:"Score 0–4: none. 5–14: mild. 15–24: moderate. 25–34: severe. >34: complete",
        negative:"N/A — score all 10 items",
        how:"10 items (pain intensity, personal care, lifting, reading, headache, concentration, work, driving, sleeping, recreation). Each scored 0–5. Maximum 50. Calculate percentage (score/50 × 100). MCID (minimum clinically important difference) = 7 points.",
        options:["No disability (0–4)","Mild disability (5–14)","Moderate disability (15–24)","Severe disability (25–34)","Complete disability (35–50)"],
      },
      { id:"st_odi_tool", label:"Oswestry Disability Index (ODI)", structure:"Lumbar disability",
        sensitivity:"N/A", specificity:"N/A",
        positive:"< 20%: minimal. 20–40%: moderate. 40–60%: severe. >60%: crippled",
        negative:"N/A",
        how:"10 sections (pain intensity, personal care, lifting, walking, sitting, standing, sleeping, sex life, social life, travelling). Each scored 0–5. Score/50 × 100 = %. MCID = 10 points (10%). Important for medico-legal and surgical decision-making.",
        options:["Minimal disability (< 20%)","Moderate disability (20–40%)","Severe disability (40–60%)","Crippling disability (60–80%)","Bed-bound (> 80%)"],
      },
      { id:"st_koos_tool", label:"KOOS (Knee injury and OA Outcome Score)", structure:"Knee function",
        sensitivity:"N/A", specificity:"N/A",
        positive:"Lower score = worse function",
        negative:"100 = no symptoms",
        how:"5 subscales: Symptoms, Pain, ADL, Sport/Recreation, Quality of Life. Each subscale 0–100 (100 = no problems). Calculate each subscale separately. KOOS4 = average of Pain, Symptoms, ADL, Sport. MCID = 8–10 points per subscale.",
        options:["Score each subscale 0–100","Document all 5 subscale scores","Calculate KOOS4 average","Compare at each reassessment"],
      },
      { id:"st_dash_tool", label:"DASH / QuickDASH Score", structure:"Upper limb disability",
        sensitivity:"N/A", specificity:"N/A",
        positive:"Higher = more disability. 0 = no disability, 100 = most severe",
        negative:"Score < 10 = minimal disability",
        how:"DASH: 30 items about ability to perform activities. QuickDASH: 11 items (faster to administer). Score formula: (sum/n - 1) × 25 = score. Work module (4 items) and Sport/Music module (4 items) optional. MCID = 10–15 points.",
        options:["Minimal (0–10)","Mild disability (11–30)","Moderate disability (31–50)","Severe disability (51–70)","Extreme disability (> 70)"],
      },
      { id:"st_psfs_tool", label:"Patient Specific Functional Scale (PSFS)", structure:"Patient-specific activities",
        sensitivity:"High responsiveness", specificity:"N/A",
        positive:"Lower score = worse function",
        negative:"10/10 = normal function",
        how:"Patient identifies 3–5 activities they cannot perform due to their problem. Rate each 0–10 (0 = unable to perform, 10 = normal). Average the scores. Reassess at each session. MCID = 2 points for individual activities, 3 points for average score. Excellent for capturing what MATTERS to the patient.",
        options:["Record 3 activities and scores","Baseline average score","Reassess score at each visit","MCID achieved = 2+ points improvement"],
      },
    ]
  },
};

// ─── SPECIAL TESTS COMPONENT ──────────────────────────────────────────────────

export { TEST_SVG, SPECIAL_TESTS_DATA };
