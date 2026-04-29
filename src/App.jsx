import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ─── Global Mobile-Responsive Styles ─────────────────────────────────────────
const MOBILE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { overflow-x: hidden; max-width: 100vw; }
  body { -webkit-text-size-adjust: 100%; touch-action: manipulation; }

  /* ── Layout shell ── */
  .pm-shell { display: flex; flex-direction: column; min-height: 100vh; overflow-x: hidden; }

  /* ── Header ── */
  .pm-header { padding: 0 12px !important; }
  .pm-header-inner { height: 50px !important; gap: 8px; }
  .pm-logo-sub { display: none; }
  @media (min-width: 480px) { .pm-logo-sub { display: block; } }
  @media (min-width: 640px) { .pm-header { padding: 0 20px !important; } .pm-header-inner { height: 54px !important; } }

  /* ── Mobile nav drawer ── */
  .pm-nav-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 150; }
  .pm-nav-drawer {
    position: fixed; left: 0; top: 0; bottom: 0; width: 240px; max-width: 80vw;
    background: #0d1117; border-right: 1px solid #1a2d45;
    z-index: 160; overflow-y: auto; padding: 54px 0 20px;
    transform: translateX(-100%); transition: transform 0.25s ease;
  }
  .pm-nav-drawer.open { transform: translateX(0); }

  /* ── Sidebar (desktop) ── */
  .pm-sidebar {
    width: 195px; min-width: 195px; display: flex; flex-direction: column;
    border-right: 1px solid #1a2d45; background: #0d1117;
    position: sticky; top: 54px; height: calc(100vh - 54px); overflow-y: auto;
  }
  @media (max-width: 767px) { .pm-sidebar { display: none !important; } }

  /* ── Hamburger button ── */
  .pm-hamburger {
    display: none; background: transparent; border: 1px solid #1a2d45;
    border-radius: 7px; color: #d4e0f0; padding: 6px 9px; cursor: pointer;
    font-size: 1rem; line-height: 1; flex-shrink: 0;
  }
  @media (max-width: 767px) { .pm-hamburger { display: flex; align-items: center; justify-content: center; } }

  /* ── Main content ── */
  .pm-main { flex: 1; padding: 14px; overflow-y: auto; overflow-x: hidden; min-width: 0; }
  @media (min-width: 640px) { .pm-main { padding: 20px; } }

  /* ── Body wrapper ── */
  .pm-body { display: flex; flex: 1; max-width: 1400px; margin: 0 auto; width: 100%; min-width: 0; overflow-x: hidden; }

  /* ── Cards & panels ── */
  .pm-card { padding: 10px 12px !important; }
  @media (min-width: 480px) { .pm-card { padding: 12px 14px !important; } }
  @media (min-width: 640px) { .pm-card { padding: 14px 16px !important; } }

  /* ── Grids → stack on mobile ── */
  .pm-grid-2 { display: grid; grid-template-columns: 1fr; gap: 8px; }
  @media (min-width: 480px) { .pm-grid-2 { grid-template-columns: 1fr 1fr; } }

  .pm-grid-3 { display: grid; grid-template-columns: 1fr; gap: 8px; }
  @media (min-width: 480px) { .pm-grid-3 { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 768px) { .pm-grid-3 { grid-template-columns: 1fr 1fr 1fr; } }

  .pm-grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; }
  @media (max-width: 400px) { .pm-grid-auto { grid-template-columns: 1fr 1fr; } }

  /* ── Flex rows → wrap ── */
  .pm-flex-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .pm-flex-wrap > * { min-width: 0; }

  /* ── Button groups ── */
  .pm-btn-row { display: flex; flex-wrap: wrap; gap: 7px; }
  .pm-btn-row > button, .pm-btn-row > a { flex: 1 1 auto; min-width: 80px; text-align: center; }

  /* ── Camera / video / canvas ── */
  .pm-camera-wrap { width: 100%; max-width: 100%; overflow: hidden; }
  .pm-camera-wrap video,
  .pm-camera-wrap canvas { width: 100% !important; max-width: 100% !important; height: auto !important; }

  /* ── Camera aspect container ── */
  .pm-cam-aspect { position: relative; width: 100%; background: #06090f; border-radius: 14px; overflow: hidden; aspect-ratio: 3/4; max-height: 65vh; }
  @media (max-width: 480px) { .pm-cam-aspect { aspect-ratio: 3/4; max-height: 55vh; border-radius: 10px; } }
  @media (orientation: landscape) and (max-width: 900px) { .pm-cam-aspect { aspect-ratio: 16/9; max-height: 45vh; } }

  /* ── Modals ── */
  .pm-modal-wrap { padding: 12px !important; }
  .pm-modal-box { padding: 16px !important; border-radius: 12px !important; max-height: 88vh !important; }
  @media (min-width: 480px) { .pm-modal-wrap { padding: 20px !important; } .pm-modal-box { padding: 24px !important; } }

  /* ── Tables ── */
  .pm-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .pm-table-wrap table { min-width: 480px; }

  /* ── Text scaling ── */
  .pm-title { font-size: clamp(0.82rem, 2.5vw, 1.15rem); }
  .pm-subtitle { font-size: clamp(0.6rem, 1.8vw, 0.78rem); }
  .pm-label { font-size: clamp(0.62rem, 1.6vw, 0.75rem); }
  .pm-value { font-size: clamp(0.7rem, 2vw, 0.85rem); }

  /* ── SVG illustrations ── */
  .pm-svg-wrap { overflow-x: auto; }
  .pm-svg-wrap svg { max-width: 100%; height: auto; }

  /* ── Diagnosis panel ── */
  .pm-dx-entry { flex-direction: column; gap: 6px; }
  @media (min-width: 480px) { .pm-dx-entry { flex-direction: row; } }

  /* ── Measurement chips ── */
  .pm-chip-row { display: flex; flex-wrap: wrap; gap: 5px; }

  /* ── Comparison viewer ── */
  .pm-compare-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
  @media (min-width: 420px) { .pm-compare-grid { grid-template-columns: 1fr 1fr; } }

  /* ── Bottom mobile nav tab bar ── */
  .pm-tabnav {
    display: none; position: fixed; bottom: 0; left: 0; right: 0;
    background: #0d1117; border-top: 1px solid #1a2d45;
    z-index: 140; padding: 0; padding-bottom: env(safe-area-inset-bottom);
  }
  @media (max-width: 767px) { .pm-tabnav { display: flex; } }
  .pm-tabnav-inner { display: flex; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .pm-tabnav-inner::-webkit-scrollbar { display: none; }
  .pm-tabnav-btn {
    flex: 1 0 auto; min-width: 52px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 2px;
    padding: 7px 4px 6px; background: transparent; border: none;
    cursor: pointer; font-family: inherit;
  }
  .pm-tabnav-btn.active { background: rgba(0,229,255,0.07); }
  .pm-tabnav-icon { font-size: 1rem; line-height: 1; }
  .pm-tabnav-label { font-size: 0.48rem; font-weight: 700; letter-spacing: 0.3px; color: #6b8399; white-space: nowrap; text-transform: uppercase; }
  .pm-tabnav-btn.active .pm-tabnav-label { color: #00e5ff; }

  /* ── Safe-area padding for content above tab bar ── */
  @media (max-width: 767px) { .pm-main { padding-bottom: calc(60px + env(safe-area-inset-bottom) + 10px) !important; } }

  /* ── Landscape mobile ── */
  @media (orientation: landscape) and (max-width: 900px) {
    .pm-header-inner { height: 44px !important; }
    .pm-main { padding: 10px !important; padding-bottom: calc(52px + env(safe-area-inset-bottom) + 10px) !important; }
  }

  /* ── Prevent text overflow ── */
  .pm-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

  /* ── Form inputs full-width ── */
  input, select, textarea { max-width: 100%; }

  /* ── Images ── */
  img { max-width: 100%; height: auto; }

  /* ── Overflow guard ── */
  .pm-overflow-guard { overflow-x: hidden; max-width: 100%; }
`;

function MobileStyleInjector() {
  useEffect(() => {
    const id = "pm-mobile-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = MOBILE_CSS;
    document.head.appendChild(el);
    return () => { const s = document.getElementById(id); if (s) s.remove(); };
  }, []);
  return null;
}

const C = {
  bg:"#06090f", surface:"#0d1117", s2:"#131c28", s3:"#192435",
  border:"#1a2d45", accent:"#00e5ff", a2:"#7f5af0", a3:"#00c97a",
  a4:"#ffb300", a5:"#ff4d6d", text:"#d4e0f0", muted:"#6b8399",
  red:"#ff4d6d", green:"#00c97a", yellow:"#ffb300", purple:"#7f5af0",
};

// ═══════════════════════════════════════════════════════════════════════════
// SPECIAL TESTS — 100+ Tests with How-To + SVG Illustrations
// ═══════════════════════════════════════════════════════════════════════════

// SVG illustrations for each test (simplified anatomical diagrams)
const TEST_SVG = {
  // ─── SHOULDER ───────────────────────────────────────────────────────────
  neer: (
    <svg viewBox="0 0 120 140" width="100%" height="100">
      <rect x="45" y="0" width="20" height="50" rx="8" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="55" cy="55" rx="18" ry="18" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <ellipse cx="55" cy="50" rx="18" ry="18" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <ellipse cx="54" cy="47" rx="17" ry="17" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <ellipse cx="65" cy="31" rx="14" ry="14" fill="#131c28" stroke="#ffb300" strokeWidth="1.5"/>
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
      <rect x="5" y="55" width="130" height="20" rx="6" fill="#1a2d45" stroke="#1a2d45"/>
      <ellipse cx="20" cy="62" rx="14" ry="10" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <ellipse cx="60" cy="30" rx="22" ry="25" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <ellipse cx="26" cy="62" rx="16" ry="16" fill="#131c28" stroke="#ffb300" strokeWidth="1.5"/>
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
      <rect x="5" y="60" width="130" height="20" rx="4" fill="#1a2d45" stroke="#1a2d45"/>
      <ellipse cx="20" cy="65" rx="14" ry="11" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <ellipse cx="60" cy="20" rx="18" ry="18" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
      <path d="M60,36 Q40,55 42,90" stroke="#7f5af0" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <rect x="30" y="90" width="60" height="15" rx="5" fill="#1a2d45" stroke="#1a2d45"/>
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
      <ellipse cx="55" cy="18" rx="18" ry="18" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <ellipse cx="53" cy="50" rx="18" ry="18" fill="#131c28" stroke="#ffb300" strokeWidth="1.5"/>
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
      <rect x="5" y="5" width="130" height="20" rx="5" fill="#1a2d45" stroke="#1a2d45"/>
      <rect x="45" y="22" width="50" height="70" rx="12" fill="#1a2d45" stroke="#00e5ff" strokeWidth="1.5"/>
      <ellipse cx="70" cy="92" rx="22" ry="10" fill="#131c28" stroke="#7f5af0" strokeWidth="1.5"/>
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
      <ellipse cx="20" cy="63" rx="14" ry="9" fill="#131c28" stroke="#7f5af0" strokeWidth="1.5"/>
      <rect x="28" y="55" width="70" height="12" rx="4" fill="#192435" stroke="#ffb300" strokeWidth="1"/>
      <path d="M95,55 Q105,45 110,35" stroke="#ff4d6d" strokeWidth="2.5" fill="none"/>
      <circle cx="110" cy="32" r="8" fill="#131c28" stroke="#ff4d6d" strokeWidth="1.5"/>
      <text x="5" y="102" fontSize="8" fill="#94a3b8">Great toe extension</text>
      <text x="5" y="112" fontSize="8" fill="#ff4d6d">+ve = plantar fascia pain</text>
    </svg>
  ),
  ober: (
    <svg viewBox="0 0 140 130" width="100%" height="100">
      <rect x="5" y="55" width="130" height="20" rx="5" fill="#1a2d45" stroke="#1a2d45"/>
      <ellipse cx="22" cy="62" rx="16" ry="12" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <rect x="5" y="60" width="130" height="20" rx="6" fill="#1a2d45" stroke="#1a2d45"/>
      <ellipse cx="20" cy="67" rx="14" ry="11" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
      <rect x="5" y="60" width="130" height="20" rx="6" fill="#1a2d45" stroke="#1a2d45"/>
      <ellipse cx="20" cy="67" rx="14" ry="11" fill="#131c28" stroke="#00e5ff" strokeWidth="1.5"/>
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
function CyriaxModule({ data, set }) {
  const [region, setRegion] = useState("shoulder");
  const [tab, setTab] = useState("active");
  const [reasoning, setReasoning] = useState(null);
  const [showRed, setShowRed] = useState(false);

  const reg = CYRIAX_REGIONS_DATA[region];
  const prefix = `cyriax_${region}_`;
  const v = (id) => data[prefix + id] || "";
  const sv = (id, val) => set(prefix + id, val);

  const selectStyle = { width:"100%", background:"#192435", border:`1px solid #1a2d45`, borderRadius:8, color:"#d4e0f0", padding:"7px 10px", fontSize:"0.78rem", outline:"none", fontFamily:"inherit" };
  const labelStyle = { fontSize:"0.72rem", fontWeight:700, color:"#6b8399", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" };
  const boxStyle = { background:"#0d1117", border:`1px solid #1a2d45`, borderRadius:10, padding:13, marginBottom:10 };
  const RESULT_OPTIONS = ["","Strong & Painless","Strong & Painful","Weak & Painless","Weak & Painful"];
  const PAIN_OPTIONS = ["","No pain","Pain on initiation","Pain at mid-range","Pain at end range","Painful arc","Pain throughout range","Referred pain with movement"];
  const LIMITED_OPTIONS = ["","Full range","Mildly limited","Moderately limited","Severely limited","Cannot perform"];

  const resColor = (val) => {
    if (!val) return "#1a2d45";
    const c = CYRIAX_STTT_INTERPRETATION[val];
    return c ? c.color : "#1a2d45";
  };

  const runReasoning = () => setReasoning(cyriaxAutoReason(region, data));

  const tabStyle = (t) => ({ padding:"8px 16px", cursor:"pointer", fontSize:"0.8rem", fontWeight:tab===t?700:500, color:tab===t?C.accent:C.muted, borderBottom:`2px solid ${tab===t?C.accent:"transparent"}`, background:"none", border:"none", borderBottom:`2px solid ${tab===t?C.accent:"transparent"}` });

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
      { id:"sl_hours",      label:"Average Sleep Duration",             type:"multicheck", options:["< 4 hours (severely inadequate)","4–5 hours (inadequate)","5–6 hours (below optimal)","6–7 hours (borderline)","7–8 hours (optimal)","8–9 hours (slightly long)","9–10 hours (prolonged)","10+ hours (excessive — fatigue/depression?","Variable — no consistent pattern","Sleep disrupted by work shifts"] },
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

  outcome_measures: {
    label:"Outcome Measures", icon:"📊", color:"#a8ff3e",
    fields:[
      { id:"om_general",    label:"General Outcome Measures",           type:"multicheck", options:["Global Rating of Change (GROC)","Patient Specific Functional Scale (PSFS)","Short Form 36 (SF-36)","EQ-5D (health-related quality of life)","PROMIS Global Health","WHO-DAS 2.0 (disability assessment)"] },
      { id:"om_pain",       label:"Pain Outcome Measures",              type:"multicheck", options:["NRS (Numerical Rating Scale) 0–10","VAS (Visual Analogue Scale)","Brief Pain Inventory (BPI)","McGill Pain Questionnaire","Pain Catastrophising Scale (PCS)","Central Sensitisation Inventory (CSI)"] },
      { id:"om_spine",      label:"Spine Outcome Measures",             type:"multicheck", options:["Oswestry Disability Index (ODI) — lumbar","Neck Disability Index (NDI) — cervical","Keele STarT Back Screening Tool","Roland Morris Disability Questionnaire","Core Outcome Measures Index (COMI)","Waddell Disability Index","Aberdeen Low Back Pain Scale"] },
      { id:"om_upper",      label:"Upper Limb Outcome Measures",        type:"multicheck", options:["DASH (Disabilities of Arm, Shoulder, Hand)","QuickDASH","ASES (American Shoulder Elbow Surgeons)","Oxford Shoulder Score","WORC (Western Ontario Rotator Cuff)","WOSI (Western Ontario Shoulder Instability)","Constant Murley Score","Oxford Elbow Score","Patient-Rated Elbow Evaluation (PREE)","Patient-Rated Wrist Evaluation (PRWE)","UEFI (Upper Extremity Functional Index)"] },
      { id:"om_lower",      label:"Lower Limb Outcome Measures",        type:"multicheck", options:["KOOS (Knee injury and OA Outcome Score)","IKDC (International Knee Documentation Committee)","Lysholm Knee Scale","Oxford Knee Score","Oxford Hip Score","HOOS (Hip injury and OA Outcome Score)","iHOT-33 (Hip)","FAAM (Foot and Ankle Ability Measure)","FAOS (Foot and Ankle Outcome Score)","VISA-A (Achilles tendinopathy)","LEFS (Lower Extremity Functional Scale)","Victorian Institute of Sport Assessment (VISA)"] },
      { id:"om_psych",      label:"Psychological Outcome Measures",     type:"multicheck", options:["Tampa Scale of Kinesiophobia (TSK-11)","Hospital Anxiety Depression Scale (HADS)","PHQ-9 Depression Screen","GAD-7 Anxiety Screen","Örebro Musculoskeletal Pain Questionnaire","Start Back Screening Tool","Pain Self-Efficacy Questionnaire (PSEQ)","Fear Avoidance Beliefs Questionnaire (FABQ)"] },
      { id:"om_sport",      label:"Sport Outcome Measures",             type:"multicheck", options:["VISA-P (Patellar tendinopathy)","ACL-RSI (Return to Sport after ACL)","SCAT5 (Sport Concussion Assessment)","FMS Score (Functional Movement Screen)","Y-Balance Test","Single Leg Hop Tests","Star Excursion Balance Test (SEBT)","Athlete-specific sport tests"] },
      { id:"om_baseline",   label:"Baseline Scores (Initial Assessment)",type:"textarea", placeholder:"Record baseline scores for all administered outcome measures with dates" },
      { id:"om_reassess",   label:"Reassessment Schedule",              type:"multicheck", options:["Reassess at 4 weeks","Reassess at 6 weeks","Reassess at 8 weeks","Reassess at 3 months","Reassess at 6 months","Reassess at discharge","Reassess at each session","Compare to baseline at each reassessment"] },
      { id:"om_notes",      label:"Outcome Measure Notes",              type:"textarea", placeholder:"Interpretation of scores, changes from baseline, clinical significance" },
    ]
  },
};

// ─── SUBJECTIVE MODULE COMPONENT ─────────────────────────────────────────────
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
          const total = sec.fields.length;
          const isActive = activeSection === key;
          return (
            <button key={key} type="button" onClick={() => setActiveSection(key)}
              style={{ padding:"6px 12px", borderRadius:20, border:`1px solid ${isActive ? sec.color : filled > 0 ? sec.color + "50" : C.border}`, background: isActive ? `${sec.color}18` : filled > 0 ? `${sec.color}08` : "transparent", color: isActive ? sec.color : filled > 0 ? sec.color : C.muted, fontSize:"0.73rem", fontWeight: isActive ? 700 : 500, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
              {sec.icon} {sec.label}
              {filled > 0 && <span style={{ background:sec.color, color:"#000", borderRadius:10, padding:"0 5px", fontSize:"0.6rem", fontWeight:800 }}>{filled}</span>}
            </button>
          );
        })}
      </div>

      {/* Section content */}
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
              {/* Free text supplement for multicheck */}
              {f.type === "multicheck" && (
                <textarea value={data[f.id + "_notes"] || ""} onChange={e => set(f.id + "_notes", e.target.value)}
                  placeholder="Additional notes / specify..."
                  style={{ width:"100%", background:C.s3, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, fontFamily:"inherit", outline:"none", padding:"6px 8px", fontSize:"0.76rem", resize:"vertical", minHeight:44, marginTop:6, display:"block" }} />
              )}
            </div>
          );
        })}
      </div>
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
function FMASection({ data, set }) {
  const [activeMovement, setActiveMovement] = useState("squat");
  const [analysis, setAnalysis] = useState(null);
  const movement = MOVEMENTS[activeMovement];

  const getSelectedComps = (mvId) => {
    const val = data[`fma_${mvId}`] || "";
    return val ? val.split(",").filter(Boolean) : [];
  };

  const toggleComp = (mvId, compId) => {
    const current = getSelectedComps(mvId);
    const next = current.includes(compId)
      ? current.filter(c => c !== compId)
      : [...current, compId];
    set(`fma_${mvId}`, next.join(","));
    if (next.length > 0) {
      setAnalysis(analyzeMovement(mvId, next));
    } else {
      setAnalysis(null);
    }
  };

  const selectedComps = getSelectedComps(activeMovement);
  const totalCompensations = Object.keys(MOVEMENTS).reduce((sum, mvId) => sum + getSelectedComps(mvId).length, 0);

  const getDeficitColor = (type) => {
    if (type?.includes("Both")) return C.red;
    if (type?.includes("Mobility")) return C.yellow;
    if (type?.includes("Stability")) return C.purple;
    return C.muted;
  };

  return (
    <div>
      {/* Header info */}
      <div style={{ background:"rgba(0,229,255,0.05)", border:"1px solid rgba(0,229,255,0.2)", borderRadius:12, padding:14, marginBottom:16 }}>
        <div style={{ fontWeight:800, color:C.accent, marginBottom:6 }}>🏃 Functional Movement Analysis — Visual Compensation Checklist</div>
        <div style={{ fontSize:"0.78rem", color:C.muted, lineHeight:1.6 }}>Select visible compensations for each movement pattern. The rule-based engine automatically identifies weak/tight structures, deficit type, kinetic chain contributors, and generates a corrective strategy.</div>
        {totalCompensations > 0 && <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:20, background:"rgba(255,77,109,0.15)", border:"1px solid rgba(255,77,109,0.3)", color:C.red, fontSize:"0.72rem", fontWeight:700 }}>⚠ {totalCompensations} compensation{totalCompensations !== 1 ? "s" : ""} identified across all movements</div>}
      </div>

      {/* Movement tabs */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
        {Object.entries(MOVEMENTS).map(([key, mv]) => {
          const count = getSelectedComps(key).length;
          return (
            <button key={key} type="button" onClick={() => { setActiveMovement(key); setAnalysis(count > 0 ? analyzeMovement(key, getSelectedComps(key)) : null); }}
              style={{ padding:"7px 14px", borderRadius:20, border:`1px solid ${activeMovement === key ? C.accent : count > 0 ? C.red + "60" : C.border}`, background: activeMovement === key ? "rgba(0,229,255,0.12)" : count > 0 ? "rgba(255,77,109,0.08)" : "transparent", color: activeMovement === key ? C.accent : count > 0 ? C.red : C.muted, fontSize:"0.76rem", fontWeight: activeMovement === key ? 700 : 500, cursor:"pointer" }}>
              {mv.icon} {mv.label} {count > 0 && <span style={{ marginLeft:4, background:C.red, color:"#fff", borderRadius:10, padding:"0px 5px", fontSize:"0.65rem", fontWeight:700 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Movement description */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:13 }}>
          <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Movement Description</div>
          <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.6 }}>{movement.description}</div>
        </div>
        <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:13 }}>
          <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>👁️ How to Observe</div>
          <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.6 }}>{movement.howToObserve}</div>
        </div>
      </div>

      {/* Compensation checklist */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10 }}>
          ✅ Visual Compensation Checklist — select all that apply
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:7 }}>
          {movement.checklistKeys.map(compId => {
            const comp = COMPENSATIONS[compId];
            const selected = selectedComps.includes(compId);
            return (
              <div key={compId} onClick={() => toggleComp(activeMovement, compId)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", border:`1px solid ${selected ? comp.color : C.border}`, background: selected ? `${comp.color}15` : C.surface, transition:"all 0.15s" }}>
                <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${selected ? comp.color : C.border}`, background: selected ? comp.color : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {selected && <span style={{ color:"#000", fontSize:"0.7rem", fontWeight:900 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize:"0.78rem", fontWeight: selected ? 700 : 500, color: selected ? comp.color : C.text }}>{comp.icon} {comp.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && selectedComps.length > 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.accent}30`, borderRadius:14, padding:20, marginTop:4 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:800, color:C.accent, fontSize:"1rem" }}>📊 Rule-Based Analysis — {movement.label}</div>
            <span style={{ padding:"3px 10px", borderRadius:10, background:`${getDeficitColor(analysis.deficitType)}20`, color:getDeficitColor(analysis.deficitType), fontSize:"0.68rem", fontWeight:700, border:`1px solid ${getDeficitColor(analysis.deficitType)}40` }}>{analysis.deficitType}</span>
          </div>

          {/* Two column: weak + tight */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div style={{ background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.25)", borderRadius:10, padding:13 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.red, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>🟡 Likely Underactive / Weak</div>
              {analysis.weakStructures.map((m, i) => <div key={i} style={{ fontSize:"0.78rem", color:C.text, padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>• {m}</div>)}
            </div>
            <div style={{ background:"rgba(255,179,0,0.08)", border:"1px solid rgba(255,179,0,0.25)", borderRadius:10, padding:13 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>🔴 Likely Overactive / Tight</div>
              {analysis.tightStructures.map((m, i) => <div key={i} style={{ fontSize:"0.78rem", color:C.text, padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>• {m}</div>)}
            </div>
          </div>

          {/* Kinetic chain */}
          <div style={{ background:"rgba(0,229,255,0.06)", border:"1px solid rgba(0,229,255,0.2)", borderRadius:10, padding:13, marginBottom:12 }}>
            <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>⛓️ Kinetic Chain Contributors</div>
            {analysis.kineticChain.map((k, i) => <div key={i} style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.6, marginBottom:4, paddingLeft:8, borderLeft:`2px solid ${C.accent}40` }}>{k}</div>)}
          </div>

          {/* Individual compensation breakdown - full detail */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>🔍 Per-Compensation Detailed Analysis</div>
            {analysis.analyses.map((a, i) => {
              const comp = COMPENSATIONS[a.compId];
              const [expanded, setExpanded] = React.useState(false);
              return (
                <div key={i} style={{ background:C.s2, border:`1px solid ${comp?.color || C.border}40`, borderRadius:10, marginBottom:8, overflow:"hidden" }}>
                  {/* Header */}
                  <div onClick={()=>setExpanded(e=>!e)} style={{ padding:"10px 13px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", borderLeft:`3px solid ${comp?.color||C.border}` }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:"0.82rem", color:comp?.color || C.text, marginBottom:2 }}>{comp?.icon} {comp?.label}</div>
                      <div style={{ fontSize:"0.72rem", color:C.muted }}>{a.deficit}</div>
                    </div>
                    <span style={{ color:C.muted, fontSize:"0.72rem" }}>{expanded?"▲":"▼ Details"}</span>
                  </div>
                  {/* Expanded content */}
                  {expanded && (
                    <div style={{ padding:"0 13px 13px", borderTop:`1px solid ${C.border}` }}>
                      {/* Kinetic chain */}
                      {a.kinetic && (
                        <div style={{ marginTop:10, padding:"8px 10px", background:"rgba(0,229,255,0.06)", border:"1px solid rgba(0,229,255,0.2)", borderRadius:8 }}>
                          <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>⛓️ Kinetic Chain Mechanism</div>
                          <div style={{ fontSize:"0.76rem", color:C.text, lineHeight:1.6 }}>{a.kinetic}</div>
                        </div>
                      )}
                      {/* Root cause */}
                      {a.root && (
                        <div style={{ marginTop:8, padding:"8px 10px", background:"rgba(127,90,240,0.08)", border:"1px solid rgba(127,90,240,0.25)", borderRadius:8 }}>
                          <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.purple, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>🎯 Root Cause</div>
                          <div style={{ fontSize:"0.76rem", color:C.text, lineHeight:1.6 }}>{a.root}</div>
                        </div>
                      )}
                      {/* Weak + Tight */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:8 }}>
                        {a.weak && a.weak.length > 0 && (
                          <div style={{ padding:"7px 9px", background:"rgba(255,77,109,0.07)", border:"1px solid rgba(255,77,109,0.2)", borderRadius:7 }}>
                            <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.red, marginBottom:4 }}>🟡 UNDERACTIVE</div>
                            {a.weak.map((m,j)=><div key={j} style={{ fontSize:"0.73rem", color:C.text, padding:"2px 0" }}>• {m}</div>)}
                          </div>
                        )}
                        {a.tight && a.tight.length > 0 && (
                          <div style={{ padding:"7px 9px", background:"rgba(255,179,0,0.07)", border:"1px solid rgba(255,179,0,0.2)", borderRadius:7 }}>
                            <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.yellow, marginBottom:4 }}>🔴 OVERACTIVE</div>
                            {a.tight.map((m,j)=><div key={j} style={{ fontSize:"0.73rem", color:C.text, padding:"2px 0" }}>• {m}</div>)}
                          </div>
                        )}
                      </div>
                      {/* Risk structures */}
                      {a.risk && a.risk.length > 0 && (
                        <div style={{ marginTop:8, padding:"7px 9px", background:"rgba(255,77,109,0.06)", border:"1px solid rgba(255,77,109,0.2)", borderRadius:7 }}>
                          <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.red, marginBottom:5 }}>🚨 STRUCTURES AT RISK</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {a.risk.map((r,j)=><span key={j} style={{ fontSize:"0.68rem", padding:"2px 7px", borderRadius:8, background:"rgba(255,77,109,0.12)", color:C.red, border:"1px solid rgba(255,77,109,0.3)" }}>⚠ {r}</span>)}
                          </div>
                        </div>
                      )}
                      {/* Confirm assessments */}
                      {a.assess && a.assess.length > 0 && (
                        <div style={{ marginTop:8, padding:"7px 9px", background:"rgba(0,201,122,0.06)", border:"1px solid rgba(0,201,122,0.2)", borderRadius:7 }}>
                          <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.green, marginBottom:5 }}>🔬 CONFIRM WITH THESE TESTS</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {a.assess.map((t,j)=><span key={j} style={{ fontSize:"0.68rem", padding:"2px 7px", borderRadius:8, background:"rgba(0,201,122,0.1)", color:C.green, border:"1px solid rgba(0,201,122,0.25)" }}>→ {t}</span>)}
                          </div>
                        </div>
                      )}
                      {/* Exercises */}
                      {a.exercises && a.exercises.length > 0 && (
                        <div style={{ marginTop:8, padding:"7px 9px", background:"rgba(0,201,122,0.05)", border:"1px solid rgba(0,201,122,0.15)", borderRadius:7 }}>
                          <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.green, marginBottom:5 }}>💪 CORRECTIVE EXERCISES</div>
                          {a.exercises.map((ex,j)=>(
                            <div key={j} style={{ display:"flex", gap:6, padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                              <span style={{ color:C.green, fontWeight:700, fontSize:"0.72rem", flexShrink:0 }}>{j+1}.</span>
                              <span style={{ fontSize:"0.73rem", color:C.text, lineHeight:1.5 }}>{ex}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Progression */}
                      {a.progression && a.progression.length > 0 && (
                        <div style={{ marginTop:8, padding:"7px 9px", background:"rgba(0,229,255,0.05)", border:"1px solid rgba(0,229,255,0.15)", borderRadius:7 }}>
                          <div style={{ fontSize:"0.6rem", fontWeight:700, color:C.accent, marginBottom:5 }}>📈 RETRAINING PROGRESSION</div>
                          {a.progression.map((p,j)=>(
                            <div key={j} style={{ display:"flex", gap:6, padding:"3px 0", alignItems:"flex-start" }}>
                              <div style={{ width:18, height:18, borderRadius:"50%", background:`linear-gradient(135deg,${C.accent},${C.a2})`, color:"#000", fontSize:"0.6rem", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{j+1}</div>
                              <span style={{ fontSize:"0.73rem", color:C.text, lineHeight:1.5, paddingTop:1 }}>{p}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Root cause */}
          <div style={{ background:"rgba(127,90,240,0.08)", border:"1px solid rgba(127,90,240,0.3)", borderRadius:10, padding:13, marginBottom:12 }}>
            <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.purple, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>🎯 Root Cause Priority</div>
            <div style={{ fontSize:"0.82rem", color:C.text, lineHeight:1.7 }}>{analysis.primaryRootCause}</div>
          </div>

          {/* Overload risk */}
          {analysis.overloadRisk.length > 0 && (
            <div style={{ background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.3)", borderRadius:10, padding:13, marginBottom:12 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.red, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>🚨 Structures at Overload Risk</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {analysis.overloadRisk.map((r, i) => <span key={i} style={{ fontSize:"0.72rem", padding:"3px 9px", borderRadius:8, background:"rgba(255,77,109,0.12)", color:C.red, border:"1px solid rgba(255,77,109,0.3)" }}>⚠ {r}</span>)}
              </div>
            </div>
          )}

          {/* Confirm with these assessments */}
          {analysis.relatedAssessments.size > 0 || [...analysis.relatedAssessments].length > 0 ? (
            <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:13, marginBottom:12 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.a3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>🔬 Confirm With These Assessments</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {[...analysis.relatedAssessments].map((a, i) => <span key={i} style={{ fontSize:"0.72rem", padding:"3px 9px", borderRadius:8, background:"rgba(0,201,122,0.1)", color:C.a3, border:"1px solid rgba(0,201,122,0.25)" }}>→ {a}</span>)}
              </div>
            </div>
          ) : null}

          {/* Corrective exercises */}
          <div style={{ background:"rgba(0,201,122,0.06)", border:"1px solid rgba(0,201,122,0.25)", borderRadius:10, padding:13, marginBottom:12 }}>
            <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.a3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>💪 Corrective Exercise Strategy</div>
            {analysis.exercises.map((ex, i) => (
              <div key={i} style={{ display:"flex", gap:8, padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color:C.a3, fontWeight:700, flexShrink:0, fontSize:"0.78rem" }}>{i + 1}.</span>
                <span style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.5 }}>{ex}</span>
              </div>
            ))}
          </div>

          {/* Movement retraining progression */}
          {analysis.progression.length > 0 && (
            <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:13 }}>
              <div style={{ fontSize:"0.63rem", fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>📈 Movement Retraining Progression</div>
              {analysis.progression.map((p, i) => (
                <div key={i} style={{ display:"flex", gap:8, padding:"4px 0", alignItems:"flex-start" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:`linear-gradient(135deg,${C.accent},${C.purple})`, color:"#000", fontSize:"0.6rem", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i + 1}</div>
                  <span style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.5, paddingTop:2 }}>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedComps.length === 0 && (
        <div style={{ textAlign:"center", padding:"30px 20px", color:C.muted, background:C.s2, borderRadius:12, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:"2rem", marginBottom:8 }}>{movement.icon}</div>
          <div style={{ fontWeight:700, color:C.text, marginBottom:4 }}>Observe {movement.label}</div>
          <div style={{ fontSize:"0.8rem" }}>Select compensations you observe above — the analysis will generate automatically</div>
        </div>
      )}
    </div>
  );
}


// ─── FASCIA LINE DATA ─────────────────────────────────────────────────────────
const FASCIA_LINES_DATA = {
  sbl:{ label:"Superficial Back Line", color:"#ff6b35", route:"Plantar fascia → Gastrocnemius → Hamstrings → Sacrotuberous lig → Erector spinae → Suboccipitals → Scalp", restrictions:"Plantar fasciitis, hamstring tightness, thoracolumbar restriction, suboccipital tension, forward head, limited forward bend", compensation:"Plantar restriction pulls entire posterior chain → suboccipital compression → forward head posture" },
  sfl:{ label:"Superficial Front Line", color:"#00d4ff", route:"Dorsum foot → Tibialis anterior → Quadriceps → Rectus abdominis → SCM → Scalp", restrictions:"Anterior ankle restriction, quad tightness, abdominal restriction, chest tightness, SCM overactivity", compensation:"SFL short = SBL stretched and overloaded → kyphosis + forward head" },
  ll:{ label:"Lateral Line", color:"#a8ff3e", route:"Peroneals → IT band → TFL/Glute max → Ext oblique → Intercostals → SCM/Splenius", restrictions:"Lateral ankle pain, IT band syndrome, lateral knee, lateral hip, lateral trunk tightness, scoliosis", compensation:"LL restriction → scoliotic lean → contralateral lateral trunk shift → knee valgus contralaterally" },
  spiral:{ label:"Spiral Line", color:"#d4a5ff", route:"Skull → Splenius → Opposite rhomboids → Serratus → Ext oblique → Opp int oblique → TFL → IT band → Tibialis ant → Peroneals → back to skull", restrictions:"Rotational asymmetry, scoliosis, limited sport rotation, shoulder-to-hip diagonal tightness", compensation:"SPL restriction → rotational asymmetry → disc loading asymmetry. Diagonal chain connects foot to opposite shoulder" },
  dfl:{ label:"Deep Front Line", color:"#ffd700", route:"Foot arch → Tib posterior → Adductors → Iliopsoas → Diaphragm → Mediastinum → Scalenes → Hyoids → Skull base", restrictions:"Flatfoot, adductor tightness, psoas restriction, breathing dysfunction, pelvic floor issues, TMJ tension", compensation:"DFL arch collapse → adductors tighten → psoas pulls anterior → diaphragm shifts → scalenes overwork → forward head" },
  bal:{ label:"Back Arm Lines", color:"#ff9a9e", route:"SBAL: Trapezius → Deltoid → Lateral forearm → Back of hand. DBAL: Rotator cuff → Triceps → Ulna → Hypothenar", restrictions:"SBAL: upper trap tightness, lateral shoulder, tennis elbow. DBAL: RC dysfunction, posterior shoulder, ulnar wrist", compensation:"SBAL restriction → shoulder elevation → neck tension. DBAL → triceps tightness → elbow restriction" },
  fal:{ label:"Front Arm Lines", color:"#90caf9", route:"SFAL: Pec major → Medial forearm flexors → Fingers. DFAL: Pec minor → Biceps → Carpal tunnel → Thumb", restrictions:"SFAL: pec tightness, medial epicondylalgia, carpal tunnel. DFAL: pec minor, biceps tendinopathy, De Quervain's", compensation:"SFAL restriction → anterior shoulder → forward head. DFAL → biceps overactivity → shoulder impingement" },
  fl:{ label:"Functional Lines", color:"#b0f2b6", route:"Back FL: Lat dorsi → Sacral fascia → Opposite glute max → Lateral femur. Front FL: Pec major → Opp rectus abdominis → Opp adductors", restrictions:"Inability to transfer force across midline, throwing dysfunction, gait asymmetry, contralateral limb pain", compensation:"FL disruption → cannot load contralateral diagonal → compensatory spinal loading" },
};

const FASCIA_REGIONS_DATA = {
  screening:{
    label:"Global Screening", color:"#00d4ff",
    intro:"Start every fascial assessment with global screening tests to identify which fascial lines are restricted and whether dysfunction is local or chain-driven. Fascia responds to slow sustained pressure — always hold 90+ seconds.",
    tests:[
      { id:"fa_skin_roll", label:"Skin Rolling Test (Kibler Fold)", line:"All lines", type:"Global screen",
        how:"Patient prone then supine. Pinch skin between thumb and index finger and roll systematically along the spine (lumbar → thoracic → cervical), then along limbs (distal to proximal). Assess: (1) RESISTANCE — does skin drag or refuse to roll? (2) BLANCHING — does area whiten under pressure? (3) TENDERNESS — is rolling painful? (4) THICKNESS — boggy or thickened? Map all restricted areas to their fascial line. Compare bilateral symmetry.",
        options:[
          { val:"Free — no restriction anywhere", color:"#00c97a", meaning:"Fascial glide normal. Skin rolls smoothly without resistance, blanching, or tenderness. Superficial fascia hydrated and mobile. No myofascial restriction driving distant symptoms. Movement unrestricted by superficial fascial density." },
          { val:"Localised restriction — focal densification", color:"#ffb300", meaning:"Specific area resists rolling — tethers, blanches, or tender. Local densification present. Identify which fascial line this restriction lies on. Treat with sustained myofascial pressure 90 sec at restriction point, then movement load that line." },
          { val:"Line restriction — multiple areas along one line", color:"#ff6b35", meaning:"Multiple restricted areas forming a pattern consistent with one fascial line (e.g. posterior from plantar → calf → thoracolumbar → suboccipital = SBL). Treatment must address the entire line not just focal points. Identify the primary driver — the most densified or oldest restriction point." },
          { val:"Generalised restriction — systemic", color:"#ff4d6d", meaning:"Widespread restriction throughout. May indicate chronic inflammation, prolonged immobility, post-surgical diffuse scarring, or systemic dehydration. Consider rheumatological referral. Global myofascial release, graded movement, and hydration program required." },
        ],
        treatment:"Focal: sustained pressure 90–120 sec + IASTM/Graston + immediate movement loading. Line: MFR along entire line sequentially. Global: whole-body program, aquatic therapy, movement variety, hydration.",
      },
      { id:"fa_passive_tension", label:"Passive Line Tension Test", line:"SBL / SFL", type:"Chain tension screen",
        how:"SBL TEST: Patient supine. Bilateral hip flex to 90° knees extended (bilateral SLR). At resistance, add ankle DF — does lumbar tension increase noticeably? Large increase = SBL chain under tension. SFL TEST: Patient supine. Extend knee from flexed position. At resistance, add hip extension — feel chain buildup through anterior line. KEY: A 'wall' feeling = fascial restriction. Gradual increase = muscle length. Knee bend release test: at SLR resistance, bend knee — drop >10° = fascial restriction (not muscle shortness).",
        options:[
          { val:"Symmetric, minimal tension — normal", color:"#00c97a", meaning:"Both lines at normal resting length. Bilateral SLR 70°+ without significant resistance buildup. Ankle DF does not markedly increase lumbar tension. SFL: knee extends freely. Fascial chains not driving symptoms. No line treatment needed." },
          { val:"SBL asymmetric — posterior chain restriction", color:"#ffb300", meaning:"Asymmetric resistance — one side greater pull through posterior chain. Ankle DF adds significant resistance (not pain) = fascial not neural. SBL under tension. 'Tight hamstrings' not responding to stretching = SBL chain. TREAT: full SBL release from foot → calf → hamstrings → thoracolumbar → suboccipitals." },
          { val:"SFL tension — anterior chain", color:"#ff6b35", meaning:"Knee extension restricted with pull through anterior thigh into hip. Adding hip extension markedly increases resistance. SFL under tension — contributing to forward head and anterior pelvic tilt. TREAT: SFL release from foot dorsum → quads → rectus abdominis → SCM." },
          { val:"Both SBL and SFL — flexion bias posture", color:"#ff4d6d", meaning:"Both chains restricted. Patient locked in flexed forward-tilted posture. Cannot fully extend or flex without restriction. Full-body MFR program required. Common after prolonged immobility, major surgery, or chronic pain posture." },
        ],
        treatment:"SBL: foam roll from plantar fascia → calf → hamstrings → thoracolumbar sequentially. SFL: release quads → hip flexors → abdominals → SCM. Movement: slow eccentric loading of restricted line after MFR.",
      },
      { id:"fa_active_line_load", label:"Active Fascial Line Loading", line:"All lines", type:"Dynamic screen",
        how:"Patient performs movements loading each line. Observe where restriction or compensation first appears: SBL = standing forward bend (where does motion stop?). SFL = standing backbend (where does trunk resist?). LL = lateral bend each side (compare symmetry). SPL = rotational lunge (where does rotation restrict?). DFL = single-leg heel raise with trunk rotation (core DFL). FUNCTIONAL LINES = bird-dog contralateral arm/leg extension. Note: abrupt 'wall' feeling = fascial. Gradual = muscle. Compensation point = approximate line restriction location.",
        options:[
          { val:"Free and symmetric — all lines normal", color:"#00c97a", meaning:"All major fascial lines move freely and symmetrically. Forward bend smooth sequential. Backbend: thoracic extends freely. Lateral bend equal. Rotation symmetric. No compensation in any plane. Fascial system contributing to movement without restriction." },
          { val:"LL restriction — asymmetric lateral bend", color:"#ffb300", meaning:"Lateral bend significantly more restricted one side. Lateral Line (LL) restricted on shorter side. Check: peroneals, IT band, QL, lateral ribs, lateral neck on restricted side. LL MFR sequence: peroneus SMR → IT band → TFL → lateral intercostals → lateral neck." },
          { val:"SBL restriction — limited forward bend", color:"#ff6b35", meaning:"Forward bend restricted — abrupt wall before 70°. SBL restriction. Find primary driver: plantar fascia, hamstrings, thoracolumbar, or suboccipitals — wherever motion restriction is greatest. Release from that point along the line." },
          { val:"SPL restriction — rotation asymmetry", color:"#ff4d6d", meaning:"Rotation significantly restricted one direction. Spiral line restricted on that side. Release diagonally: tibialis anterior → IT band/TFL → opposite external oblique → rhomboids → splenius. Work the diagonal — not just one side." },
        ],
        treatment:"Identify restricted line → MFR along entire line → immediately reload with controlled movement (movement cements fascial reorganisation). Fascia responds to slow sustained loading more than rapid stretching.",
      },
      { id:"fa_densification", label:"Fascial Densification Test (Stecco Method)", line:"All — segmental", type:"Densification screen",
        how:"Take up slack in skin and subcutaneous tissue with fingertip. Press deeper into deep fascial layer. Move finger in small circles (1–2cm) in all directions. NORMAL: finger glides freely in all directions. DENSIFICATION: finger meets resistance in one or more directions — fascia has lost hyaluronan-based glide. Assess speed of release: rapid = hydration issue. Slow = structural densification. Compare bilaterally. Common sites: thoracolumbar, IT band, suboccipital, plantar fascia, pec minor.",
        options:[
          { val:"Free glide — normal fascial hydration", color:"#00c97a", meaning:"Fascial glide present in all directions. Hyaluronan matrix optimal. No densification. Normal proprioceptive input from this region. Movement unrestricted by fascial density." },
          { val:"Mild — one direction restricted", color:"#ffb300", meaning:"Restricted in one vector — mild densification. Early stage fascial change. May respond to hydration and movement alone. Sustained MFR (90 sec) + movement. Monitor." },
          { val:"Moderate — multiple directions restricted", color:"#ff6b35", meaning:"Restricted in multiple vectors. Significant densification. Local symptoms + movement restriction. Tissue feels 'gritty'. IASTM/Graston + dry needling + eccentric movement loading." },
          { val:"Severe — fibrous / scar tissue", color:"#ff4d6d", meaning:"Cannot move in any direction — fibrous densification. Hyaluronan replaced by collagen cross-links. Post-surgical, post-injury, or chronic overuse. Ultrasound pre-treatment → IASTM → sustained MFR → movement loading essential." },
        ],
        treatment:"Mild: sustained pressure 90 sec + movement. Moderate: IASTM + movement. Severe: ultrasound → IASTM → sustained MFR → progressive loading. Hydration essential — fascia is 70% water.",
      },
      { id:"fa_scar", label:"Scar Tissue & Adhesion Assessment", line:"All — regional", type:"Post-surgical screen",
        how:"For each scar: (1) MOBILITY: pinch scar — does it move freely over underlying tissue in all directions? (2) SENSITIVITY: hypersensitive (allodynia) or hyposensitive? (3) THICKNESS: raised (hypertrophic/keloid) or flat? (4) COLOUR: red = active/immature; white = mature. (5) TENSION: does scar create distant pulling? (6) ADHESION: place finger flat over scar, move in X, Y, Z planes — resistance = deep adhesion to fascia/muscle. Map scar adhesions to fascial lines they may be restricting.",
        options:[
          { val:"Mobile scar — no restriction", color:"#00c97a", meaning:"Scar moves freely in all directions. No deep adhesions. Normal scar maturation. No pulling or referred symptoms. No movement restriction related to scar." },
          { val:"Surface adhesion — subcutaneous layer", color:"#ffb300", meaning:"Scar tethered in some directions. Surface adhesion to subcutaneous layer. Scar mobilisation (multidirectional skin rolling over scar), silicone sheeting, vitamin E. Begin 3–4 weeks post-closure." },
          { val:"Deep adhesion — fascia / muscle", color:"#ff6b35", meaning:"Scar adhered to deep fascia or muscle. Skin moves but deep tissue does not. Creates tethering of underlying structures — restricts muscle function, alters joint mechanics. IASTM over scar, deep scar mobilisation, dry needling around adhesion. Common: Caesarean → psoas adhesion → LBP." },
          { val:"Neurological — allodynia / hypersensitivity", color:"#ff4d6d", meaning:"Scar hypersensitive to light touch. Nerve endings trapped in scar tissue. Desensitisation: graded touch (cotton → fingertip → firm pressure over weeks). TENS over scar. Neural mobilisation proximally." },
        ],
        treatment:"Surface: scar massage circular/transverse × 5 min/day from week 3. Deep: IASTM + deep friction + dry needling around adhesion. Neurological: desensitisation + TENS + neural mobilisation. All: vitamin E/silicone gel + movement through scar direction daily.",
      },
    ]
  },
  sbl_sfl:{
    label:"SBL & SFL Lines", color:"#ff6b35",
    intro:"The Superficial Back Line (SBL) and Superficial Front Line (SFL) are antagonist lines running along the posterior and anterior body. They balance each other in upright posture. When one is restricted the other is overstretched and reactive. Hamstrings that won't release with stretching, plantar fasciitis, forward head posture, and anterior pelvic tilt are all signs of SBL/SFL imbalance.",
    tests:[
      { id:"fa_sbl_hamstring", label:"Hamstring Fascial vs Muscle Length (SBL)", line:"SBL", type:"SBL mid-line test",
        how:"STEP 1 — SLR: Perform SLR — note angle at resistance. STEP 2 — Ankle DF: At resistance, add ankle DF. Pain increase = neural. Resistance increase without pain = fascial (SBL). STEP 3 — Knee bend release: At SLR resistance, slightly bend knee. Drop >10° = fascial restriction. Drop <5° = true muscle shortness. STEP 4 — Active contraction: Patient actively contracts quad at end range SLR — range increases = fascial limit (muscle contraction helps slide fascial layer). If muscle is truly short, active contraction will not help.",
        options:[
          { val:"Normal — SLR 70°+, no fascial wall", color:"#00c97a", meaning:"SLR 70°+ without significant fascial wall. Knee bend: small drop (<5°) = normal muscle length. Ankle DF: minimal resistance change. Normal hamstring length and SBL fascial mobility. Forward bend to mid-shin or below." },
          { val:"Neural restriction — Bragard positive", color:"#ffb300", meaning:"Ankle DF markedly increases symptoms (pain, tingling) → neural tension not fascial. Neural mobilisation is the treatment — not myofascial release. Assess with slump + ULTT for full neural picture." },
          { val:"SBL fascial restriction — not muscle shortness", color:"#ff6b35", meaning:"Knee bend drops >10° (fascial). Ankle DF adds resistance without pain (fascial not neural). Active quad contraction increases range = fascial glide issue. DO NOT stretch the hamstrings — they are not short. TREAT: foam roll hamstrings, SBL release from foot → thoracolumbar." },
          { val:"True muscle shortness — gradual resistance", color:"#7f5af0", meaning:"Gradual resistance buildup (not abrupt wall). Knee bend: small drop. Ankle DF: minimal change. Active contraction does not help. True muscle shortness — PNF stretching and progressive loading appropriate." },
        ],
        treatment:"Fascial: SBL SMR (foam roll plantar → calf → hamstrings → thoracolumbar systematically). Movement: slow eccentric SBL loading (standing forward bend with hands on wall). Neural: nerve gliding. Muscle: PNF stretching.",
      },
      { id:"fa_tlf", label:"Thoracolumbar Fascia (TLF) Assessment", line:"SBL / Functional Lines", type:"SBL central test",
        how:"Patient prone. Palpate TLF (broad diamond-shaped sheet connecting lats, erectors, glute max). (1) TISSUE GLIDE: hand flat over TLF, move skin all directions. (2) OBLIQUE TENSION: pull skin diagonally (lower right to upper left and vice versa) — asymmetric resistance = functional line involvement. (3) PASSIVE TRUNK ROTATION: slowly rotate pelvis — TLF tension should build and release symmetrically. (4) SKIN ROLL: roll skin over TLF bilaterally — compare sides.",
        options:[
          { val:"Normal — symmetric glide, free rotation", color:"#00c97a", meaning:"TLF glides freely in all directions. Oblique tension symmetric. Passive trunk rotation creates symmetric gradual resistance. Skin rolling free. TLF hydrated and mobile. Normal force transmission through TLF." },
          { val:"Unilateral restriction", color:"#ffb300", meaning:"TLF restricted one side — unilateral prolonged loading, sport dominance, or old injury. Oblique tension restricted one diagonal. Ipsilateral hip extension restricted and contralateral shoulder restricted (functional line). TREAT: unilateral TLF release." },
          { val:"Bilateral restriction — erector spinae dominant", color:"#ff6b35", meaning:"TLF restricted bilaterally. Erector spinae chronically overactive (NKT: TA inhibited). Common in chronic LBP. TREAT: bilateral TLF release + TA activation + glute max activation (both attach to TLF)." },
          { val:"TLF fibrosis — post-injury / surgery", color:"#ff4d6d", meaning:"TLF fibrotic, thickened, rigid. Post-lumbar surgery, prolonged bed rest, or lumbar trauma. TREAT: IASTM along TLF, sustained MFR 3+ min, dry needling paraspinal at TLF level, progressive movement loading." },
        ],
        treatment:"Unilateral: targeted TLF release 90 sec + IASTM. Bilateral: foam roller thoracolumbar + oblique self-release. Activate: TA + glute max (key TLF tensioners). Movement: cat-cow, thoracolumbar rotation.",
      },
    ]
  },
  spiral_ll:{
    label:"Spiral & Lateral Lines", color:"#d4a5ff",
    intro:"The Spiral Line wraps diagonally connecting opposite shoulder to same hip. The Lateral Line provides lateral stability. Both are critical for gait, sport rotation, and scoliosis patterns. Rotation asymmetry and IT band issues are classic SPL/LL presentations.",
    tests:[
      { id:"fa_spiral_rot", label:"Spiral Line Rotation Assessment", line:"Spiral", type:"SPL dynamic test",
        how:"STEP 1 — Standing rotation: arms folded, rotate trunk fully both ways. Compare symmetry and quality (wall = fascial, gradual = muscle). STEP 2 — Seated vs standing: if restricted only standing = SPL driven, not purely thoracic. STEP 3 — Foot wedge test: rotate standing, then place wedge under one foot (supinate). If rotation improves = SPL foot-to-opposite-shoulder connection. STEP 4 — Arm overhead test: raise arm on restricted side during rotation — if rotation improves = arm line connecting into SPL.",
        options:[
          { val:"Symmetric — SPL balanced", color:"#00c97a", meaning:"Symmetric rotation. Standing equals seated. Foot wedge no effect. Spiral line balanced. Normal rotational capacity for gait and sport." },
          { val:"Asymmetric — SPL restriction one side", color:"#ffb300", meaning:"Rotation restricted one direction. Standing > seated = SPL driven. Foot wedge test changes rotation = foot-to-shoulder SPL confirmed. Release the diagonal: tibialis ant → IT band/TFL → opposite external oblique → rhomboids → splenius." },
          { val:"Bilateral restriction — scoliosis pattern", color:"#ff6b35", meaning:"Both rotations restricted asymmetrically. SPL contributes to rotational scoliosis. Identify shortened side — treat that SPL. Never aggressively release the stretched convex SPL." },
          { val:"Rotation restricted with lateral shift", color:"#ff4d6d", meaning:"Rotation restriction with visible lateral trunk shift. Both SPL and LL involved. Rule out disc pathology first. If clear: combined SPL + LL release." },
        ],
        treatment:"Release SPL diagonal: tibialis ant SMR → IT band → TFL → opposite external oblique → opposite rhomboids → ipsilateral splenius. Movement: rotational lunges, woodchop as dynamic SPL loading.",
      },
      { id:"fa_ll_test", label:"Lateral Line Assessment", line:"Lateral Line", type:"LL restriction test",
        how:"STEP 1 — Lateral bend: stand and bend laterally each direction — compare. STEP 2 — LL tension test: hand at iliac crest + hand at lateral rib — feel lateral line tension like a bowstring. STEP 3 — Peroneal chain: passively invert foot while holding lateral knee — does inversion create chain pull up through IT band? STEP 4 — Intercostal: patient bends toward restricted side — palpate intercostals on convex side — tight = LL intercostal component. STEP 5 — Neck: add ipsilateral neck side-bend at end of trunk bend — further restriction = LL cervical component.",
        options:[
          { val:"Symmetric — LL balanced", color:"#00c97a", meaning:"Equal lateral bend. LL tension symmetric. Peroneal chain free. No scoliotic deviation. Normal lateral stability." },
          { val:"Restricted one side — lateral chain", color:"#ffb300", meaning:"Lateral bend restricted toward one side. LL on shorter side restricted. Peroneal inversion creates chain pull up through IT band and lateral trunk. TREAT: peroneus → IT band → QL → lateral intercostals → lateral neck." },
          { val:"Restricted with scoliosis", color:"#ff6b35", meaning:"Lateral bend restricted AND scoliotic curve visible. Treat the shortened (concave) side LL — the stretched convex side responds. Never aggressively release the stretched LL." },
          { val:"LL restriction with hip elevation", color:"#ff4d6d", meaning:"LL restricted AND ipsilateral hip elevated. QL and LL both involved. Functional leg length discrepancy. TREAT: QL release + IT band SMR + lateral rib mobilisation + glute med activation (NKT)." },
        ],
        treatment:"Release: peroneus SMR → IT band foam roll → TFL SMR → QL release → lateral rib mobilisation → lateral neck SMR. Movement: LL dynamic stretch (side bend with arm overhead). Standing lateral swing for LL rehydration.",
      },
    ]
  },
  dfl_region:{
    label:"Deep Front Line (DFL)", color:"#ffd700",
    intro:"The DFL is the body's innermost fascial line — running from the foot arch through adductors, iliopsoas, diaphragm, and to skull base. It is the 'core' of the fascial system. DFL dysfunction affects breathing, pelvic floor, core stability, and connects foot arch directly to jaw and head position.",
    tests:[
      { id:"fa_dfl_arch", label:"DFL Foundation — Medial Arch Assessment", line:"DFL", type:"DFL origin test",
        how:"STEP 1 — Navicular drop: mark navicular sitting → standing. Normal <6mm. STEP 2 — Short foot: draw metatarsal heads toward heel without curling toes. Can patient activate? STEP 3 — DFL chain test: in short foot position, resist hip adduction — does adduction strength change with arch position? (DFL: arch → adductors connected). STEP 4 — Breathing: in short foot position, breathe deeply — does arch position change with breath? (DFL: arch → psoas → diaphragm). STEP 5 — Thomas test: positive = DFL psoas-arch connection restricted.",
        options:[
          { val:"Normal arch — DFL foundation intact", color:"#00c97a", meaning:"Navicular drop <6mm. Short foot activates on command. Adduction strength unchanged by arch position. Breathing doesn't change arch. Thomas test negative. DFL origin functioning — supporting arch and connecting upward." },
          { val:"Collapsed arch — DFL origin failure", color:"#ffb300", meaning:"Navicular drop 6–10mm. Short foot difficult. Adduction strength changes with arch position. DFL under tension from below. TREAT: short foot exercise + tibialis post activation + intrinsic strengthening." },
          { val:"Severe arch collapse — DFL chain", color:"#ff6b35", meaning:"Navicular drop >10mm. Short foot impossible. DFL chain test positive. Breathing changes arch further — psoas/diaphragm pulling through DFL. Full DFL chain restriction." },
          { val:"Rigid high arch — DFL over-tension", color:"#7f5af0", meaning:"Arch too high. DFL under constant tension. Poor shock absorption. DFL from intrinsics to scalenes under baseline tension. Release DFL from intrinsics → adductors → psoas sequentially." },
        ],
        treatment:"Arch collapse: short foot × 20 reps, tibialis posterior activation, intrinsic strengthening. Over-tension: DFL release — plantar intrinsic MFR, adductor MFR, psoas release. Breathing integration: breathe while maintaining short foot position.",
      },
      { id:"fa_dfl_breathing", label:"Diaphragm — DFL Central Hub", line:"DFL", type:"DFL central test",
        how:"Patient supine, knees bent. STEP 1 — Breathing: hand on chest + hand on abdomen. Normal: abdomen rises first. STEP 2 — Lateral expansion: hands bilaterally on lower ribs — normal 360° expansion including posterior. STEP 3 — Diaphragm palpation: fingers under lower rib cage margin, breathe in — feel clear descent. STEP 4 — DFL tension: one hand under thoracolumbar (psoas level) + other on anterior lower ribs — breathe — do these two structures move together through DFL? STEP 5 — Psoas connection: Thomas test positive? (psoas and diaphragm share fascial attachment through DFL).",
        options:[
          { val:"Normal — DFL hub free", color:"#00c97a", meaning:"Abdomen rises first. 360° rib expansion. Diaphragm clearly descends. Psoas and diaphragm move together. Thomas test negative. Core IAP managed correctly." },
          { val:"Thoracic breathing — diaphragm inhibited", color:"#ffb300", meaning:"Chest rises first. Scalenes/SCM visible on normal breathing. Diaphragm barely descends. NKT: diaphragm inhibited → scalenes compensating. Core IAP generation impaired → LBP risk. TREAT: diaphragm activation (crocodile breathing) + scalene release." },
          { val:"Diaphragm restricted — fascial adhesion", color:"#ff6b35", meaning:"Breathing partially restricted. DFL tension test: thoracolumbar and rib cage do NOT move together. Often post-abdominal surgery. Diaphragmatic fascial adhesion: manual release under lower rib margin + visceral mobilisation." },
          { val:"Paradoxical breathing — severe DFL disruption", color:"#ff4d6d", meaning:"Abdomen moves IN on inhalation. Diaphragm not descending. Severe DFL disruption. Consider phrenic nerve, chronic anxiety, or post-surgical adhesion. Refer for respiratory physiotherapy." },
        ],
        treatment:"Inhibited: 360° diaphragmatic breathing — crocodile breathing prone, lateral rib expansion drills. Restricted: manual release under lower rib margin during breathing. Psoas release if Thomas positive. Visceral mobilisation if post-surgical.",
      },
    ]
  },
  force_chain:{
    label:"Force Transmission & Chain", color:"#00c97a",
    intro:"Fascial force transmission determines whether dysfunction is LOCAL or CHAIN-DRIVEN. Regional interdependence means a problem in one region causes symptoms in a remote region. Identifying the primary fascial driver — not just treating the painful area — is the key to lasting results.",
    tests:[
      { id:"fa_remote_test", label:"Remote Restriction Test (Regional Interdependence)", line:"All", type:"Cross-regional chain test",
        how:"PURPOSE: Does treating a REMOTE area (not the painful area) change symptoms? (1) Baseline: assess painful area — note ROM and pain. (2) Remote release: apply 90 sec sustained pressure to a suspected chain connection (remote from pain). (3) Re-assess: does ROM or pain change immediately? Common connections to test: plantar fascia → ipsilateral suboccipital (SBL). Right pec minor → left hip flexor (functional line). Ipsilateral hamstring → contralateral cervical rotation (SBL → functional). TFL → contralateral shoulder (LL → functional). POSITIVE = remote treatment significantly changes local symptoms.",
        options:[
          { val:"No remote effect — local dysfunction", color:"#00c97a", meaning:"Remote treatment does not change local symptoms. Dysfunction is primarily local. Standard local assessment and treatment appropriate. Fascial chains not significantly contributing." },
          { val:"Moderate remote effect — chain involved", color:"#ffb300", meaning:"Remote treatment partially changes symptoms (20–40% improvement). Chain contributing but local dysfunction also present. Treat BOTH: release remote chain driver AND treat locally." },
          { val:"Significant remote effect — chain is primary driver", color:"#ff6b35", meaning:"Remote treatment markedly changes symptoms (>50% improvement). Remote area IS the primary driver — local area is the victim of chain tension. Focus treatment at the remote fascial driver, not the painful site." },
          { val:"Multiple remote connections — complex chain", color:"#ff4d6d", meaning:"Multiple remote areas influence local symptoms. Multi-line complex restriction. Patient has been treated locally repeatedly without lasting effect. Map all chain connections. Begin at the fascial chain driver furthest from symptoms." },
        ],
        treatment:"Local only: standard treatment. Chain involved: find primary restriction in line → release from primary point → reassess whole line → load entire line eccentrically. Movement mandatory after every fascial release.",
      },
      { id:"fa_force_closure", label:"Force Closure / SIJ Fascial Tension Test", line:"Functional Lines / DFL", type:"Pelvic chain test",
        how:"ASLR TEST: patient supine, lift one leg 20cm. Rate effort 0–5. ANTERIOR COMPRESSION: bilateral ASIS compression — does ASLR ease? (anterior force closure deficit). POSTERIOR COMPRESSION: SIJ compression posteriorly — does ASLR ease? (posterior deficit). TLF TEST: palpate bilateral TLF — does palpating help ASLR? (TLF contributing to force closure). ABDOMINAL COMPRESSION: manual abdominal pressure during ASLR — ease = TA + TLF force closure needed.",
        options:[
          { val:"ASLR normal — force closure adequate", color:"#00c97a", meaning:"ASLR easy (0–1 effort). Compression not needed. SIJ force closure adequate through TLF, TA, glute max, and biceps femoris. Pelvic ring stable." },
          { val:"Anterior force closure deficit", color:"#ffb300", meaning:"ASLR effortful. Anterior ASIS compression helps. TA + obliques + pelvic floor insufficient. TREAT: TA activation, oblique strengthening, pelvic floor physiotherapy." },
          { val:"Posterior force closure deficit", color:"#ff6b35", meaning:"Posterior SIJ compression helps. Glute max + biceps femoris + TLF insufficient posteriorly. Common postpartum. TREAT: glute max activation, TLF tensioning, SIJ belt short-term." },
          { val:"Bilateral deficit — severe", color:"#ff4d6d", meaning:"Both anterior and posterior compression help. Severe force closure failure. Multi-system treatment: pelvic physiotherapy + SIJ belt + graded loading program." },
        ],
        treatment:"Anterior deficit: TA drawing-in + pelvic floor. Posterior deficit: glute max NKT + TLF activation (deadlift pattern). Bilateral: SIJ belt 6–8 weeks + specific stabilisation. TLF: MFR + immediate loading (bridge, deadlift).",
      },
      { id:"fa_compensation_map", label:"Fascial Compensation Pattern Mapping", line:"All", type:"Multi-line integration",
        how:"SYSTEMATIC MAPPING: (1) Identify primary complaint: location, movement most affected. (2) Test ALL lines at painful area: which fascial line passes through? (3) Follow line AWAY from pain: does restricting/releasing remote area change local pain? (4) Test ANTAGONIST line: SBL restricted → test SFL. LL → opposite LL. (5) Test FUNCTIONAL CONNECTIONS: check contralateral extremity. (6) Classify: LOCAL (restriction only at pain site) vs CHAIN (one line, multiple areas) vs GLOBAL (multiple lines). (7) PRIMARY RESTRICTION: most densified or oldest point in chain — often matches old injury or surgery site.",
        options:[
          { val:"Local pattern — single area, single line", color:"#00c97a", meaning:"Restriction only at painful area. One line, local only. Responds well to local treatment. Common in acute injuries. Straightforward fascial presentation." },
          { val:"Chain pattern — one line, multiple areas", color:"#ffb300", meaning:"Restriction at painful site AND multiple points along same line. Identify OLDEST or MOST DENSIFIED point in chain — this is the driver. TREAT: release primary driver first → reassess whole line → movement load entire line." },
          { val:"Multi-line pattern — two or more lines", color:"#ff6b35", meaning:"Two or more lines restricted. Complex postural dysfunction. Treat most restricted line first — others often partially normalise. Common in chronic pain, post-surgical patients." },
          { val:"Global restriction — all lines involved", color:"#ff4d6d", meaning:"Multiple lines globally restricted. Systemic fascial restriction — autoimmune, chronic inflammation, major trauma, prolonged immobility. Global MFR program, movement therapy, hydration, lifestyle modification. Specialist MFR referral." },
        ],
        treatment:"Local: treat locally. Chain: identify driver → release sequentially → load line. Multi-line: treat most restricted first, reassess. Global: whole-body — aquatic therapy, global MFR, movement variety. Movement after EVERY fascial release is mandatory.",
      },
    ]
  },
};

// ─── FASCIA LINE BODY MAP ─────────────────────────────────────────────────────
function FasciaBodyMap({ selected, onSelect }) {
  const lines = {
    sbl:{ d:"M124,385 L125,340 L127,295 L130,250 L133,205 L137,165 L140,130 L143,95 L146,72 L148,58 L150,38", color:"#ff6b35", label:"SBL" },
    sfl:{ d:"M176,385 L175,340 L173,295 L170,250 L167,205 L163,165 L160,130 L157,95 L154,72 L152,58 L150,38", color:"#00d4ff", label:"SFL" },
    ll:{ d:"M113,385 L110,340 L108,295 L107,255 L109,215 L113,185 L110,160 L106,140 L96,118 L92,95 L96,75", color:"#a8ff3e", label:"LL" },
    spiral:{ d:"M176,380 Q168,340 155,300 Q140,260 125,230 Q108,200 100,170 Q96,140 100,115 Q107,92 120,78 Q137,65 150,55", color:"#d4a5ff", label:"SPL" },
    dfl:{ d:"M150,385 L150,345 L149,300 L148,255 L148,210 L149,170 L149,130 L150,95 L150,65 L150,40", color:"#ffd700", label:"DFL" },
    bal:{ d:"M150,100 L140,108 L122,115 L100,120 L88,132 L86,155 L86,185 L86,210", color:"#ff9a9e", label:"BAL" },
    fal:{ d:"M150,100 L160,108 L178,115 L200,120 L212,132 L214,155 L214,185 L214,210", color:"#90caf9", label:"FAL" },
  };
  const bodyParts = [
    {t:"ellipse",cx:150,cy:32,rx:20,ry:25},{t:"rect",x:142,y:56,w:16,h:18,rx:4},
    {t:"ellipse",cx:150,cy:120,rx:36,ry:48},{t:"ellipse",cx:150,cy:188,rx:32,ry:20},
    {t:"rect",x:88,y:88,w:14,h:52,rx:7},{t:"rect",x:198,y:88,w:14,h:52,rx:7},
    {t:"rect",x:81,y:144,w:12,h:48,rx:6},{t:"rect",x:207,y:144,w:12,h:48,rx:6},
    {t:"ellipse",cx:87,cy:206,rx:9,ry:12},{t:"ellipse",cx:213,cy:206,rx:9,ry:12},
    {t:"rect",x:119,y:207,w:20,h:68,rx:8},{t:"rect",x:161,y:207,w:20,h:68,rx:8},
    {t:"ellipse",cx:129,cy:282,rx:12,ry:12},{t:"ellipse",cx:171,cy:282,rx:12,ry:12},
    {t:"rect",x:121,y:293,w:16,h:62,rx:6},{t:"rect",x:163,y:293,w:16,h:62,rx:6},
    {t:"ellipse",cx:124,cy:370,rx:15,ry:9},{t:"ellipse",cx:176,cy:370,rx:15,ry:9},
  ];
  return (
    <div style={{background:C.s2,borderRadius:12,padding:16,border:`1px solid ${C.border}`,marginBottom:16}}>
      <div style={{fontSize:"0.7rem",fontWeight:700,color:C.muted,textAlign:"center",marginBottom:10,textTransform:"uppercase",letterSpacing:"1px"}}>Fascial Lines — Tap to Select</div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start"}}>
        <svg width="300" height="410" viewBox="0 0 300 410" style={{display:"block",flexShrink:0}}>
          {bodyParts.map((p,i)=>p.t==="ellipse"
            ?<ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="#131c28" stroke="#1a2d45" strokeWidth="1.5"/>
            :<rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx||0} fill="#131c28" stroke="#1a2d45" strokeWidth="1.5"/>
          )}
          {Object.entries(lines).map(([key,ln])=>(
            <g key={key} style={{cursor:"pointer"}} onClick={()=>onSelect(selected===key?null:key)}>
              <path d={ln.d} stroke={ln.color} strokeWidth={selected===key?5:2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={selected&&selected!==key?0.15:1} style={{transition:"all 0.2s"}}/>
            </g>
          ))}
          {Object.entries(lines).map(([key,ln])=>{
            const pts=ln.d.match(/[\d.]+/g);
            const mx=Math.floor(pts.length/4)*2;
            const lx=parseFloat(pts[mx])+(key==="sbl"?-20:key==="sfl"?6:key==="dfl"?5:0);
            const ly=parseFloat(pts[mx+1]);
            return <text key={"t"+key} x={lx} y={ly} fontSize="9" fill={ln.color} fontWeight="700" opacity={selected&&selected!==key?0.15:1} style={{cursor:"pointer",pointerEvents:"none"}}>{ln.label}</text>;
          })}
        </svg>
        <div style={{flex:1,minWidth:160}}>
          <div style={{fontSize:"0.65rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Fascial Lines</div>
          {Object.entries(FASCIA_LINES_DATA).map(([key,ln])=>(
            <div key={key} onClick={()=>onSelect(selected===key?null:key)}
              style={{background:selected===key?`${ln.color}18`:C.s3,border:`1px solid ${selected===key?ln.color:C.border}`,borderRadius:8,padding:"7px 10px",marginBottom:5,cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{fontWeight:700,fontSize:"0.74rem",color:ln.color}}>{ln.label}</div>
              {selected===key&&<div style={{fontSize:"0.68rem",color:C.muted,marginTop:3,lineHeight:1.5}}>{ln.restrictions}</div>}
            </div>
          ))}
        </div>
      </div>
      {selected&&FASCIA_LINES_DATA[selected]&&(
        <div style={{background:`${FASCIA_LINES_DATA[selected].color}08`,border:`1px solid ${FASCIA_LINES_DATA[selected].color}30`,borderRadius:9,padding:12,marginTop:12}}>
          <div style={{fontWeight:700,color:FASCIA_LINES_DATA[selected].color,marginBottom:6,fontSize:"0.85rem"}}>{FASCIA_LINES_DATA[selected].label}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:"0.72rem"}}>
            <div><div style={{fontWeight:700,color:C.muted,fontSize:"0.6rem",textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>Route</div><div style={{color:C.text,lineHeight:1.6}}>{FASCIA_LINES_DATA[selected].route}</div></div>
            <div><div style={{fontWeight:700,color:C.muted,fontSize:"0.6rem",textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>Compensation Pattern</div><div style={{color:C.text,lineHeight:1.6}}>{FASCIA_LINES_DATA[selected].compensation}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FASCIA SECTION COMPONENT ────────────────────────────────────────────────
function FasciaSection({ data, set }) {
  const [region, setRegion] = useState("screening");
  const [openTest, setOpenTest] = useState(null);
  const [modalTest, setModalTest] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const reg = FASCIA_REGIONS_DATA[region];
  return (
    <div>
      <FasciaBodyMap selected={selectedLine} onSelect={setSelectedLine} />
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {Object.entries(FASCIA_REGIONS_DATA).map(([key,r])=>(
          <button key={key} type="button" onClick={()=>{setRegion(key);setOpenTest(null);}}
            style={{padding:"6px 13px",borderRadius:20,border:`1px solid ${region===key?r.color:C.border}`,background:region===key?`${r.color}15`:"transparent",color:region===key?r.color:C.muted,fontSize:"0.74rem",fontWeight:region===key?700:400,cursor:"pointer"}}>
            {r.label}
          </button>
        ))}
      </div>
      <div style={{background:`${reg.color}08`,border:`1px solid ${reg.color}25`,borderRadius:10,padding:14,marginBottom:16,fontSize:"0.8rem",color:C.text,lineHeight:1.7}}>{reg.intro}</div>
      {reg.tests.map((t)=>{
        const currentVal=data[t.id]||"";
        const currentOption=t.options.find(o=>o.val===currentVal);
        const isOpen=openTest===t.id;
        return (
          <div key={t.id} style={{background:C.surface,border:`1px solid ${currentVal?reg.color+"40":C.border}`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
            <div onClick={()=>setOpenTest(isOpen?null:t.id)} style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid ${currentVal?reg.color:"#1a2d45"}`}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:"0.6rem",padding:"2px 7px",borderRadius:7,background:`${reg.color}20`,color:reg.color,fontWeight:700}}>{t.type}</span>
                  <span style={{fontSize:"0.6rem",color:C.muted}}>Line: {t.line}</span>
                </div>
                <div style={{fontWeight:700,fontSize:"0.88rem",color:C.text}}>{t.label}</div>
                {currentVal&&<div style={{marginTop:5,display:"inline-flex",alignItems:"center",gap:6,padding:"2px 8px",borderRadius:8,background:`${currentOption?.color||C.muted}18`,border:`1px solid ${currentOption?.color||C.muted}40`}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:currentOption?.color||C.muted}}/>
                  <span style={{fontSize:"0.68rem",fontWeight:700,color:currentOption?.color||C.muted}}>{currentVal}</span>
                </div>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0,marginLeft:10}}>
                <button type="button" onClick={e=>{e.stopPropagation();setModalTest(t);}} style={{padding:"3px 10px",background:"rgba(127,90,240,0.15)",border:`1px solid ${C.a2}40`,borderRadius:6,color:C.a2,fontSize:"0.65rem",fontWeight:700,cursor:"pointer"}}>ℹ Info</button>
                <span style={{color:C.muted,fontSize:"0.75rem"}}>{isOpen?"▲":"▼"}</span>
              </div>
            </div>
            {isOpen&&(
              <div style={{padding:"0 14px 14px"}}>
                <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:12}}>
                  <div style={{fontSize:"0.63rem",fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>👐 How to Perform</div>
                  <div style={{fontSize:"0.8rem",color:C.text,lineHeight:1.7,whiteSpace:"pre-line"}}>{t.how}</div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:"0.63rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>📊 Select Finding — What Each Result Means</div>
                  {t.options.map(opt=>(
                    <div key={opt.val} onClick={()=>set(t.id,currentVal===opt.val?"":opt.val)}
                      style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 12px",borderRadius:9,marginBottom:7,cursor:"pointer",border:`1px solid ${currentVal===opt.val?opt.color:C.border}`,background:currentVal===opt.val?`${opt.color}12`:"transparent",transition:"all 0.15s"}}>
                      <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${opt.color}`,background:currentVal===opt.val?opt.color:"transparent",flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {currentVal===opt.val&&<span style={{color:"#000",fontSize:"0.55rem",fontWeight:900}}>✓</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:"0.8rem",color:opt.color,marginBottom:3}}>{opt.val}</div>
                        <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.6}}>{opt.meaning}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{background:`${reg.color}08`,border:`1px solid ${reg.color}25`,borderRadius:8,padding:11}}>
                  <div style={{fontSize:"0.63rem",fontWeight:700,color:reg.color,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>→ Treatment Protocol</div>
                  <div style={{fontSize:"0.77rem",color:C.text,lineHeight:1.7}}>{t.treatment}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {modalTest&&(
        <div onClick={()=>setModalTest(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${reg.color}50`,borderRadius:14,padding:24,maxWidth:560,width:"100%",maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div><div style={{fontWeight:800,color:reg.color,fontSize:"1rem"}}>{modalTest.label}</div><div style={{fontSize:"0.7rem",color:C.muted,marginTop:3}}>{modalTest.type} · Line: {modalTest.line}</div></div>
              <button onClick={()=>setModalTest(null)} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"3px 9px",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:"0.63rem",fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>👐 How to Perform</div>
              <div style={{background:C.s2,borderRadius:8,padding:14,fontSize:"0.82rem",color:C.text,lineHeight:1.8,whiteSpace:"pre-line"}}>{modalTest.how}</div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:"0.63rem",fontWeight:700,color:C.a3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>📊 What Each Result Means</div>
              {modalTest.options.map(opt=>(
                <div key={opt.val} style={{padding:"8px 12px",borderRadius:8,marginBottom:7,border:`1px solid ${opt.color}30`,background:`${opt.color}08`}}>
                  <div style={{fontWeight:700,fontSize:"0.78rem",color:opt.color,marginBottom:3}}>{opt.val}</div>
                  <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.6}}>{opt.meaning}</div>
                </div>
              ))}
            </div>
            <div style={{background:`${reg.color}08`,border:`1px solid ${reg.color}25`,borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{fontSize:"0.63rem",fontWeight:700,color:reg.color,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>→ Treatment Protocol</div>
              <div style={{fontSize:"0.78rem",color:C.text,lineHeight:1.7}}>{modalTest.treatment}</div>
            </div>
            <button onClick={()=>setModalTest(null)} style={{width:"100%",padding:"9px",background:C.a2,border:"none",borderRadius:8,color:"#fff",fontWeight:700,cursor:"pointer"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── NKT REGION COMPONENT ────────────────────────────────────────────────────
function NKTSection({ data, set }) {
  const [region, setRegion] = useState("cervical");
  const [openTest, setOpenTest] = useState(null);
  const [modalTest, setModalTest] = useState(null);
  const reg = NKT_REGIONS[region];

  return (
    <div>
      {/* Region tabs */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
        {Object.entries(NKT_REGIONS).map(([key,r])=>(
          <button key={key} type="button" onClick={()=>{ setRegion(key); setOpenTest(null); }}
            style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${region===key?r.color:C.border}`, background:region===key?`${r.color}15`:"transparent", color:region===key?r.color:C.muted, fontSize:"0.76rem", fontWeight:region===key?700:400, cursor:"pointer" }}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Region intro */}
      <div style={{ background:`${reg.color}08`, border:`1px solid ${reg.color}25`, borderRadius:10, padding:14, marginBottom:16, fontSize:"0.8rem", color:C.text, lineHeight:1.7 }}>
        {reg.intro}
      </div>

      {/* Tests */}
      {reg.tests.map((t,i)=>{
        const currentVal = data[t.id] || "";
        const currentOption = t.options.find(o=>o.val===currentVal);
        const isOpen = openTest === t.id;
        return (
          <div key={t.id} style={{ background:C.surface, border:`1px solid ${currentVal?reg.color+"40":C.border}`, borderRadius:12, marginBottom:10, overflow:"hidden" }}>
            {/* Header */}
            <div onClick={()=>setOpenTest(isOpen?null:t.id)}
              style={{ padding:"12px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", borderLeft:`3px solid ${currentVal?reg.color:"#1a2d45"}` }}>
              <div>
                <div style={{ fontWeight:700, fontSize:"0.88rem", color:C.text }}>{t.label}</div>
                <div style={{ fontSize:"0.7rem", color:C.muted, marginTop:2 }}>🎯 Muscle: {t.muscle} &nbsp;|&nbsp; ⚠️ Compensator: {t.compensator}</div>
                {currentVal && <div style={{ marginTop:5, display:"inline-flex", alignItems:"center", gap:6, padding:"2px 8px", borderRadius:8, background:`${currentOption?.color||C.muted}18`, border:`1px solid ${currentOption?.color||C.muted}40` }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:currentOption?.color||C.muted }} />
                  <span style={{ fontSize:"0.68rem", fontWeight:700, color:currentOption?.color||C.muted }}>{currentVal}</span>
                </div>}
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <button type="button" onClick={e=>{ e.stopPropagation(); setModalTest(t); }}
                  style={{ padding:"3px 10px", background:"rgba(127,90,240,0.15)", border:`1px solid ${C.a2}40`, borderRadius:6, color:C.a2, fontSize:"0.65rem", fontWeight:700, cursor:"pointer" }}>
                  ℹ How to Perform
                </button>
                <span style={{ color:C.muted, fontSize:"0.75rem" }}>{isOpen?"▲":"▼"}</span>
              </div>
            </div>

            {/* Expanded body */}
            {isOpen && (
              <div style={{ padding:"0 14px 14px" }}>
                {/* How to */}
                <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:8, padding:12, marginBottom:12 }}>
                  <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>👐 How to Perform</div>
                  <div style={{ fontSize:"0.8rem", color:C.text, lineHeight:1.7 }}>{t.how}</div>
                </div>

                {/* Options */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>📊 Select Finding — What Each Result Means</div>
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

                {/* Treatment */}
                <div style={{ background:`${reg.color}08`, border:`1px solid ${reg.color}25`, borderRadius:8, padding:12 }}>
                  <div style={{ fontSize:"0.65rem", fontWeight:700, color:reg.color, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>→ Treatment Protocol</div>
                  <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.7 }}>{t.treatment}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* How-to Modal */}
      {modalTest && (
        <div onClick={()=>setModalTest(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${reg.color}50`, borderRadius:14, padding:24, maxWidth:560, width:"100%", maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontWeight:800, color:reg.color, fontSize:"1rem" }}>{modalTest.label}</div>
                <div style={{ fontSize:"0.72rem", color:C.muted, marginTop:3 }}>Muscle: {modalTest.muscle}</div>
              </div>
              <button onClick={()=>setModalTest(null)} style={{ background:"none", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"3px 9px", cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>👐 Step-by-Step Procedure</div>
              <div style={{ background:C.s2, borderRadius:8, padding:14, fontSize:"0.82rem", color:C.text, lineHeight:1.8 }}>{modalTest.how}</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:"0.65rem", fontWeight:700, color:C.a3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>⚠️ What Each Result Means</div>
              {modalTest.options.map(opt=>(
                <div key={opt.val} style={{ padding:"8px 12px", borderRadius:8, marginBottom:6, border:`1px solid ${opt.color}30`, background:`${opt.color}08` }}>
                  <div style={{ fontWeight:700, fontSize:"0.78rem", color:opt.color, marginBottom:3 }}>{opt.val}</div>
                  <div style={{ fontSize:"0.76rem", color:C.text, lineHeight:1.6 }}>{opt.meaning}</div>
                </div>
              ))}
            </div>
            <div style={{ background:`${reg.color}08`, border:`1px solid ${reg.color}25`, borderRadius:8, padding:12, marginBottom:14 }}>
              <div style={{ fontSize:"0.65rem", fontWeight:700, color:reg.color, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>→ Treatment Protocol</div>
              <div style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.7 }}>{modalTest.treatment}</div>
            </div>
            <button onClick={()=>setModalTest(null)} style={{ width:"100%", padding:"9px", background:C.a2, border:"none", borderRadius:8, color:"#fff", fontWeight:700, cursor:"pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CYRIAX REGION COMPONENT ─────────────────────────────────────────────────
const CYRIAX_REGIONS = {
  cervical:{ label:"Cervical", tests:[
    { id:"cy_c_flex", label:"Resisted Cervical Flexion", muscle:"SCM / deep neck flexors", how:"Patient seated, chin neutral. Resist forehead with palm. POSITIVE = pain or weakness at neck flexors.", sig:"Weak+painless = C3/4 neuropraxia. Weak+painful = serious lesion or C4 disc." },
    { id:"cy_c_ext", label:"Resisted Cervical Extension", muscle:"Semispinalis / splenius / suboccipitals", how:"Resist occiput. Patient extends into your hand.", sig:"Weakness = upper cervical instability or C5/6 radiculopathy. Strong+painful = posterior cervical muscle lesion." },
    { id:"cy_c_sflex_l", label:"Resisted Side Flex Left", muscle:"Left scalenes / lateral flexors", how:"Resist left temporal bone. Patient side-flexes left.", sig:"Pain = ipsilateral scalene/lateral flexor lesion. Weakness = C3/4 nerve root." },
    { id:"cy_c_sflex_r", label:"Resisted Side Flex Right", muscle:"Right scalenes / lateral flexors", how:"Resist right temporal bone.", sig:"Asymmetric weakness = radiculopathy. Compare both sides." },
    { id:"cy_c_rot_l", label:"Resisted Rotation Left", muscle:"Right SCM / Left splenius capitis", how:"Resist left chin rotation.", sig:"Tests contralateral SCM. Relevant for torticollis, whiplash." },
    { id:"cy_c_rot_r", label:"Resisted Rotation Right", muscle:"Left SCM / Right splenius capitis", how:"Resist right chin rotation.", sig:"Tests left SCM and right splenius." },
  ]},
  shoulder:{ label:"Shoulder", tests:[
    { id:"cy_s_abd", label:"Resisted Shoulder Abduction", muscle:"Supraspinatus / middle deltoid", how:"Arm at side 0–30°. Resist distally. The key shoulder test.", sig:"Strong+painful = supraspinatus tendinopathy. Weak+painless = C5 root or complete tear." },
    { id:"cy_s_flex", label:"Resisted Shoulder Flexion", muscle:"Anterior deltoid / biceps", how:"Arm at side, elbow extended. Resist forward flexion.", sig:"Strong+painful = anterior deltoid or biceps lesion. Weak+painless = C5/6." },
    { id:"cy_s_er", label:"Resisted External Rotation", muscle:"Infraspinatus / teres minor", how:"Elbow 90°, at side. Resist outward rotation.", sig:"Strong+painful = infraspinatus tendinopathy. Weak+painless = massive RC tear or C5." },
    { id:"cy_s_ir", label:"Resisted Internal Rotation", muscle:"Subscapularis", how:"Elbow 90°, at side. Resist inward rotation.", sig:"Weak+painful = subscapularis lesion. Combine with lift-off + belly press." },
    { id:"cy_s_elbow_flex", label:"Resisted Elbow Flexion", muscle:"Biceps long head", how:"Elbow 90°, supinated. Resist flexion.", sig:"Pain at bicipital groove = biceps long head lesion. Use with Speed's test." },
  ]},
  elbow:{ label:"Elbow / Wrist", tests:[
    { id:"cy_e_flex", label:"Resisted Elbow Flexion", muscle:"Biceps / brachialis", how:"Elbow 90°, supinated. Resist flexion.", sig:"Strong+painful = distal biceps or brachialis. Weak+painless = C5/6 radiculopathy." },
    { id:"cy_e_ext", label:"Resisted Elbow Extension", muscle:"Triceps", how:"Elbow 30°. Resist extension.", sig:"Weak+painless = C7 root. Strong+painful = triceps tendinopathy (rare)." },
    { id:"cy_w_ext", label:"Resisted Wrist Extension", muscle:"ECRB / ECRL / ECU", how:"Fist clenched, resist wrist extension. Main lateral epicondylalgia test.", sig:"Strong+painful at lateral epicondyle = ECRB tendinopathy (tennis elbow)." },
    { id:"cy_w_flex", label:"Resisted Wrist Flexion", muscle:"FCR / FCU", how:"Resist wrist flexion.", sig:"Strong+painful at medial epicondyle = FCR/FCU tendinopathy (golfer's elbow)." },
    { id:"cy_e_pro", label:"Resisted Pronation", muscle:"Pronator teres", how:"Elbow 90°, neutral. Resist pronation.", sig:"Pain medial elbow = medial epicondylalgia. Tests pronator teres." },
    { id:"cy_e_sup", label:"Resisted Supination", muscle:"Supinator / biceps", how:"Elbow 90°, pronated. Resist supination.", sig:"Lateral pain = lateral epicondylalgia variant. Proximal pain = biceps radial insertion." },
  ]},
  lumbar:{ label:"Lumbar / Hip", tests:[
    { id:"cy_l_flex", label:"Resisted Trunk Flexion", muscle:"Rectus abdominis / hip flexors", how:"Supine, knees bent. Resist curl-up. POSITIVE = anterior pain.", sig:"Differentiates from passive lumbar flexion pain. Weak = nerve root or serious lesion." },
    { id:"cy_l_ext", label:"Resisted Trunk Extension", muscle:"Erector spinae", how:"Prone. Resist trunk extension.", sig:"Strong+painful = muscular lumbar lesion. Weak = L3–L5 radiculopathy." },
    { id:"cy_hip_flex_res", label:"Resisted Hip Flexion", muscle:"Iliopsoas", how:"Supine. Resist hip flexion at 90°.", sig:"Strong+painful = iliopsoas tendinopathy. Weak+painless = L2/3 radiculopathy." },
    { id:"cy_hip_abd_res", label:"Resisted Hip Abduction", muscle:"Gluteus medius / TFL", how:"Sidelying. Resist hip abduction.", sig:"Weak+painful = gluteus medius tear or trochanteric bursitis." },
    { id:"cy_l_sflex_l", label:"Resisted Side Flex Left", muscle:"Left QL / lateral trunk", how:"Standing. Resist left lateral trunk flexion.", sig:"Tests left QL and lateral trunk muscles." },
    { id:"cy_l_sflex_r", label:"Resisted Side Flex Right", muscle:"Right QL / lateral trunk", how:"Standing. Resist right lateral trunk flexion.", sig:"Asymmetric = ipsilateral nerve root or QL lesion." },
  ]},
  knee:{ label:"Knee", tests:[
    { id:"cy_k_ext", label:"Resisted Knee Extension", muscle:"Quadriceps / patellar tendon", how:"Seated, knee 90°. Resist extension.", sig:"Strong+painful = patellar tendinopathy. Weak+painless = L3/4 radiculopathy." },
    { id:"cy_k_flex", label:"Resisted Knee Flexion", muscle:"Hamstrings", how:"Prone. Resist knee flexion at 90°.", sig:"Strong+painful = hamstring tendinopathy. Weak+painless = S1/2 radiculopathy." },
    { id:"cy_k_flex_er", label:"Resisted Knee Flexion + ER", muscle:"Biceps femoris", how:"Prone. Resist flexion + external rotation.", sig:"Pain at lateral joint line/fibular head = biceps femoris insertion tendinopathy." },
    { id:"cy_k_flex_ir", label:"Resisted Knee Flexion + IR", muscle:"Medial hamstrings", how:"Prone. Resist flexion + internal rotation.", sig:"Pain medial knee = semimembranosus/semitendinosus insertion lesion." },
  ]},
  ankle:{ label:"Ankle / Foot", tests:[
    { id:"cy_a_df", label:"Resisted Dorsiflexion", muscle:"Tibialis anterior", how:"Resist ankle dorsiflexion + inversion.", sig:"Weak+painless = L4 radiculopathy. Strong+painful = tib ant tendinopathy." },
    { id:"cy_a_pf", label:"Resisted Plantarflexion", muscle:"Gastroc / soleus", how:"Resist plantarflexion.", sig:"Weak+painless = S1/2 radiculopathy. Strong+painful = Achilles/gastroc lesion." },
    { id:"cy_a_inv", label:"Resisted Inversion", muscle:"Tibialis posterior", how:"Resist foot inversion in plantarflexion.", sig:"Pain medial ankle = tib post tendinopathy. Weakness = tib post tear." },
    { id:"cy_a_ev", label:"Resisted Eversion", muscle:"Peroneals", how:"Resist foot eversion.", sig:"Pain lateral ankle = peroneal tendinopathy. Weakness = peroneal nerve injury." },
    { id:"cy_a_toe_ext", label:"Resisted Great Toe Extension", muscle:"Extensor hallucis longus", how:"Resist great toe extension.", sig:"Weak+painless = L5 radiculopathy (most specific L5 myotome)." },
  ]},
};

function CyriaxRegionTests({ data, set }) {
  const [region, setRegion] = useState("shoulder");
  const [modalT, setModalT] = useState(null);
  const RESULTS = ["Strong & Painless (normal)","Strong & Painful (minor lesion)","Weak & Painless (neurological)","Weak & Painful (serious lesion)"];
  const tests = CYRIAX_REGIONS[region]?.tests||[];
  const inp = { width:"100%", background:C.s3, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"7px 10px", fontSize:"0.78rem", outline:"none", fontFamily:"inherit" };
  return (
    <div>
      {modalT && (
        <div onClick={()=>setModalT(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.accent}40`, borderRadius:14, padding:24, maxWidth:480, width:"100%", maxHeight:"80vh", overflowY:"auto" }}>
            <div style={{ fontWeight:800, color:C.accent, marginBottom:12 }}>{modalT.label}</div>
            <div style={{ marginBottom:12 }}><div style={{ fontSize:"0.65rem", fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>How to Perform</div><div style={{ background:C.s2, borderRadius:8, padding:12, fontSize:"0.8rem", color:C.text, lineHeight:1.7 }}>{modalT.how}</div></div>
            <div style={{ marginBottom:16 }}><div style={{ fontSize:"0.65rem", fontWeight:700, color:C.a3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Clinical Significance</div><div style={{ background:C.s2, borderRadius:8, padding:12, fontSize:"0.8rem", color:C.text, lineHeight:1.7 }}>{modalT.sig}</div></div>
            <div style={{ marginBottom:14 }}><div style={{ fontSize:"0.65rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>What Each Result Means</div>
              {[{val:"Strong & Painless (normal)",col:"#00c97a",m:"No contractile lesion at this muscle. Look elsewhere for the pain source."},
                {val:"Strong & Painful (minor lesion)",col:"#ffb300",m:"Minor lesion of contractile tissue — tendinopathy or small partial tear. Can generate force but hurts. TREAT: DTFM + eccentric loading."},
                {val:"Weak & Painless (neurological)",col:"#7f5af0",m:"Neurological deficit — nerve root or peripheral nerve. No lesion in the muscle itself. Check dermatomes + reflexes. Consider imaging."},
                {val:"Weak & Painful (serious lesion)",col:"#ff4d6d",m:"Serious lesion — complete rupture, fracture, or psychogenic overlay. REFER for imaging immediately. Do not load."},
              ].map(o=><div key={o.val} style={{ padding:"7px 10px", borderRadius:7, marginBottom:5, border:`1px solid ${o.col}30`, background:`${o.col}08` }}>
                <div style={{ fontWeight:700, fontSize:"0.75rem", color:o.col, marginBottom:2 }}>{o.val}</div>
                <div style={{ fontSize:"0.73rem", color:C.text, lineHeight:1.5 }}>{o.m}</div>
              </div>)}
            </div>
            <button onClick={()=>setModalT(null)} style={{ width:"100%", padding:"8px", background:C.a2, border:"none", borderRadius:8, color:"#fff", fontWeight:700, cursor:"pointer" }}>Close</button>
          </div>
        </div>
      )}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
        {Object.entries(CYRIAX_REGIONS).map(([k,r])=>(
          <button key={k} type="button" onClick={()=>setRegion(k)} style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${region===k?C.accent:C.border}`, background:region===k?"rgba(0,229,255,0.1)":"transparent", color:region===k?C.accent:C.muted, fontSize:"0.74rem", fontWeight:region===k?700:400, cursor:"pointer" }}>{r.label}</button>
        ))}
      </div>
      <div style={{ display:"grid", gap:8 }}>
        {tests.map(t=>{
          const val = data[t.id]||""; const isProb = val.includes("Painful")||val.includes("Weak");
          return (
            <div key={t.id} style={{ background:C.surface, border:`1px solid ${isProb?C.red+"50":C.border}`, borderRadius:10, padding:"11px 13px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7, gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.8rem", fontWeight:600, color:C.text }}>{t.label}</div>
                  <div style={{ fontSize:"0.68rem", color:C.muted, marginTop:1 }}>Muscle: {t.muscle}</div>
                </div>
                <button type="button" onClick={()=>setModalT(t)} style={{ padding:"2px 9px", background:"rgba(127,90,240,0.15)", border:`1px solid ${C.a2}40`, borderRadius:6, color:C.a2, fontSize:"0.65rem", fontWeight:700, cursor:"pointer", flexShrink:0 }}>ℹ Info</button>
              </div>
              <select value={val} onChange={e=>set(t.id,e.target.value)} style={{...inp, borderColor:isProb?C.red:C.border}}>
                <option value="">— select result —</option>
                {RESULTS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DIAGNOSIS ENGINE ────────────────────────────────────────────────────────
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
const ALL_TESTS = {
  subjective:{ label:"Subjective", icon:"📝", groups:{ "Full Subjective Assessment":"SUBJECTIVE_MODULE" }},
  posture:{ label:"Posture", icon:"🧍", groups:{
    "Anterior View":[
      {id:"p_head_tilt",label:"Head tilt",type:"select3",options:["Normal","Left tilt","Right tilt"],sig:"Head tilt = SCM tightness or facet pathology ipsilaterally."},
      {id:"p_shoulder_h",label:"Shoulder height",type:"select3",options:["Equal","Right elevated","Left elevated"],sig:"Elevated shoulder = UCS — overactive upper trap/levator."},
      {id:"p_asis",label:"ASIS height",type:"select3",options:["Level","Right higher","Left higher"],sig:"Asymmetry = pelvic obliquity, leg length discrepancy."},
      {id:"p_kneef",label:"Knee alignment",type:"select3",options:["Normal","Valgus","Varus"],sig:"Valgus = glute med weakness + foot pronation chain."},
      {id:"p_foot",label:"Foot position",type:"select3",options:["Neutral","Pronated","Supinated"],sig:"Pronation cascade: medial collapse → tibial IR → knee valgus."},
    ],
    "Lateral View":[
      {id:"p_forward_head",label:"Forward head posture",type:"select3",options:["Normal","Mild (2cm)","Moderate (4cm)","Severe (6cm+)"],sig:"Each 2.5cm forward = +4.5kg load on cervical spine."},
      {id:"p_thor_kyphosis",label:"Thoracic kyphosis",type:"select3",options:["Normal","Increased","Decreased"],sig:"Increased = respiratory restriction, shoulder impingement."},
      {id:"p_lumb_lordosis",label:"Lumbar lordosis",type:"select3",options:["Normal","Increased","Decreased/Flat"],sig:"Increased = LCS pattern (anterior pelvic tilt)."},
      {id:"p_pelvic_tilt",label:"Pelvic tilt",type:"select3",options:["Neutral","Anterior tilt","Posterior tilt"],sig:"Anterior = LCS. Posterior = flat back syndrome."},
    ],
    "Janda Syndromes":[
      {id:"p_ucs",label:"Upper Crossed Syndrome",type:"select3",options:["Absent","Mild","Moderate","Severe"],sig:"UCS: forward head + rounded shoulders. Overactive: upper trap, SCM, pec minor. Underactive: DNF, lower trap, serratus."},
      {id:"p_lcs",label:"Lower Crossed Syndrome",type:"select3",options:["Absent","Mild","Moderate","Severe"],sig:"LCS: anterior pelvic tilt + LBP. Overactive: hip flexors, QL. Underactive: glute max, glute med, TA."},
    ],
  }},
  rom:{ label:"ROM", icon:"📐", groups:{ "Full ROM Assessment":"ROM_MODULE" }},
  nkt:{ label:"NKT Assessment", icon:"🧠", groups:{ "Region-Specific NKT Tests":"NKT_REGION" }},
  kinetic:{ label:"Kinetic Chain", icon:"⛓️", groups:{ "Joint-by-Joint Assessment":"KC_REGION" }},
  fascia:{ label:"Fascia Integration", icon:"🕸️", groups:{ "Fascial Assessment":"FASCIA_REGION" }},
  fma:{ label:"Functional Movement", icon:"🏃", groups:{ "Movement Analysis":"FMA_REGION" }},
  neuro:{ label:"Neurological", icon:"⚡", groups:{ "Full Neurological Assessment":"NEURO_MODULE" }},
  mmt:{ label:"Muscle MMT", icon:"💪", groups:{ "Full MMT Assessment":"MMT_MODULE" }},
  cyriax_full:{ label:"Cyriax Full Assessment", icon:"🦴", groups:{ "Complete STTT Assessment":"CYRIAX_MODULE" }},
  special:{ label:"Special Tests (100+)", icon:"🔬", groups:{ "All Special Tests":"SPECIAL_TESTS_MODULE" }},
  ergo:{ label:"Ergonomic Assessment", icon:"🖥️", groups:{ "Workstation & Ergonomic Analysis":"ERGO_MODULE" }},
  gait:{ label:"Gait Analysis", icon:"🚶", groups:{ "Full Gait Analysis":"GAIT_MODULE" }},
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROM MODULE — Advanced Range of Motion Assessment
// ═══════════════════════════════════════════════════════════════════════════════

const ROM_DATA={
  "Cervical":[
    {id:"rom_cflex",mv:"Flexion",bilateral:false,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal (coronal)",
     start:"Seated, head neutral, stabilise thorax",gonio:"Axis: C7 SP; Fixed: vertical ref; Moving: along mastoid/ear",
     muscles:"Sternocleidomastoid, longus colli/capitis, anterior scalenes",
     endfeel:{normal:"Firm (ligamentous — posterior structures)",abnormal:"Hard=OA/disc; Empty=fracture/neoplasm; Springy=meniscoid"},
     compensation:"Thoracic flexion, chin poke (forward head)",
     capsular:"Lateral flex=Rot>Flex=Ext (cervical facet capsular pattern)",
     adl:"Looking down at phone, eating, reading",
     pathology:"Limited painfully: disc herniation (C4/5 or C5/6), facet OA; painless: muscle tightness",
     redflag:"Bilateral arm paresthesia on flex = cord compression; trauma + limited = C-spine fracture protocol",
     pediatric:"Neonatal: limited = torticollis, Klippel-Feil. Children: normal=80°",
     geriatric:"Degenerative changes reduce all planes by 25–30% by age 70"},
    {id:"rom_cext",mv:"Extension",bilateral:false,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Seated, head neutral",gonio:"Axis: C7 SP; Fixed: vertical ref; Moving: along mastoid",
     muscles:"Semispinalis capitis, splenius capitis, upper trapezius, suboccipitals",
     endfeel:{normal:"Firm (anterior ligaments)",abnormal:"Hard=OA/stenosis; Empty=instability; Springy=disc"},
     compensation:"Thoracic extension, mouth opening",
     capsular:"Extension often more limited than flexion in degenerative disease",
     adl:"Looking up at ceiling, overhead activities, reversing car",
     pathology:"Limited: cervical stenosis, OA, disc osteophyte. Pain on ext: facet compression",
     redflag:"Bilateral LE symptoms on extension = spinal stenosis. Dizziness = VBI — stop, perform VBI screen"},
    {id:"rom_clatl",mv:"Lat Flex L",bilateral:false,normal:45,unit:"°",plane:"Frontal",axis:"AP (anterior-posterior)",
     start:"Seated, stabilise ipsilateral shoulder to prevent elevation",gonio:"Axis: C7 SP; Fixed: vertical; Moving: along midline skull",
     muscles:"Ipsilateral: scalenes, SCM, upper trap, splenius; Contralateral: stretched",
     endfeel:{normal:"Firm (contralateral capsule + muscles)",abnormal:"Hard=OA/Unco; Springy=disc"},
     compensation:"Shoulder elevation (shrug), trunk lateral lean",
     capsular:"Asymmetric restriction: facet OA pattern",
     adl:"Ear to shoulder stretch, lateral reach activities",
     pathology:"Unilateral limitation: unilateral facet OA, disc herniation, scalene tightness",
     redflag:"Arm pain reproduced = radiculopathy (C4–C8). Lhermitte's sign on any cervical movement = cord lesion"},
    {id:"rom_clatr",mv:"Lat Flex R",bilateral:false,normal:45,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, stabilise contralateral shoulder",gonio:"Axis: C7 SP; Fixed: vertical; Moving: along skull midline",
     muscles:"Ipsilateral scalenes, SCM, upper trap, splenius capitis/cervicis",
     endfeel:{normal:"Firm",abnormal:"Hard=OA; Empty=trauma"},
     compensation:"Shoulder elevation, trunk lean opposite direction",
     capsular:"Compare L vs R: asymmetry >10° clinically significant",
     adl:"Phone held to ear, lateral reaching",
     pathology:"Same as Lat Flex L — compare sides for asymmetry",
     redflag:"Pain down ipsilateral arm = Spurling's positive cluster"},
    {id:"rom_crotl",mv:"Rotation L",bilateral:false,normal:60,unit:"°",plane:"Transverse",axis:"Vertical (longitudinal)",
     start:"Seated, head neutral, stabilise thorax",gonio:"Axis: crown of head; Fixed: acromial line; Moving: nose direction",
     muscles:"Contralateral SCM, ipsilateral splenius, suboccipitals",
     endfeel:{normal:"Firm (capsule + alar ligament)",abnormal:"Hard=OA/fixation; Springy=disc protrusion"},
     compensation:"Trunk rotation, chin elevation",
     capsular:"Rotation most limited in atlantoaxial OA (C1/C2)",
     adl:"Checking blind spot driving, looking sideways",
     pathology:"C1/2 OA: rotation limited bilaterally. Disc: often asymmetric + painful arc",
     redflag:"<30° rotation = atlantoaxial instability or end-stage OA. VBI symptoms: dizziness, nystagmus, diplopia"},
    {id:"rom_crotr",mv:"Rotation R",bilateral:false,normal:60,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same method",
     muscles:"Same contralateral pattern as rotation L",
     endfeel:{normal:"Firm",abnormal:"Same as rotation L"},
     compensation:"Trunk rotation, chin elevation",
     capsular:"RA: atlantoaxial instability — bilateral rotation severely limited",
     adl:"Same as rotation L",
     pathology:"Unilateral loss: facet OA, unilateral disc; Bilateral equal loss: C1/2",
     redflag:"RA patient: odontoid fracture risk — <30° rotation → X-ray"},
  ],
  "Thoracic":[
    {id:"rom_thflex",mv:"Flexion",bilateral:false,normal:50,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Seated or standing, arms crossed",gonio:"Axis: T12; Fixed: vertical; Moving: spinous process line",
     muscles:"Rectus abdominis, external obliques",
     endfeel:{normal:"Firm (posterior ligaments + facets)",abnormal:"Hard=OA/AS; Springy=disc (rare thoracic)"},
     compensation:"Lumbar flexion (monitor separately), hip flex",
     capsular:"Thoracic: Ext>Lat Flex>Rot in spondylosis; symmetric in AS",
     adl:"Bending forward (combined with lumbar), stooping",
     pathology:"AS: reduced chest expansion + all planes; Osteoporotic wedge: flexion + kyphosis",
     redflag:"Severe flexion pain with percussion tenderness = vertebral fracture. Thoracic mass: bilateral UMN signs"},
    {id:"rom_thext",mv:"Extension",bilateral:false,normal:25,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing or prone, lumbar stabilised",gonio:"Axis: T12; Fixed: vertical; Moving: spinous process",
     muscles:"Erector spinae, multifidus, semispinalis",
     endfeel:{normal:"Firm (anterior longitudinal ligament + disc)",abnormal:"Hard=OA/AS; Empty=malignancy"},
     compensation:"Lumbar hyperextension",
     capsular:"Extension earliest limited in thoracic OA",
     adl:"Upright posture, overhead reach, back bend",
     pathology:"Thoracic kyphosis: extension severely limited; Scheuermann's: fixed kyphosis",
     redflag:"Night pain + weight loss + extension pain = malignancy/infection"},
    {id:"rom_throtl",mv:"Rotation L",bilateral:false,normal:35,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Seated, arms crossed, pelvis fixed",gonio:"Axis: T1; Fixed: pelvis line; Moving: shoulder line",
     muscles:"Ipsilateral internal oblique + contralateral external oblique",
     endfeel:{normal:"Firm",abnormal:"Hard=AS/costovertebral joint restriction"},
     compensation:"Lumbar rotation, trunk lateral lean",
     capsular:"AS: marked bilateral symmetric restriction",
     adl:"Golf swing, tennis serve, trunk twisting in daily life",
     pathology:"Costovertebral joint restriction: local thoracic pain + limited ipsilateral rotation",
     redflag:"Rib pain with rotation = costovertebral joint pathology, stress fracture in athletes"},
    {id:"rom_throtr",mv:"Rotation R",bilateral:false,normal:35,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same",muscles:"Same contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Hard=costovertebral restriction"},
     compensation:"Lumbar rotation",capsular:"Compare L vs R",
     adl:"Same as rotation L",
     pathology:"Asymmetric restriction: scoliosis, unilateral facet OA",
     redflag:"Rib fracture: localized pain + limited rotation + crepitus"},
  ],
  "Lumbar":[
    {id:"rom_lflex",mv:"Flexion",bilateral:false,normal:60,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing, knees extended; also assess fingertip-to-floor distance (N=<7cm)",gonio:"Axis: S2; Fixed: vertical; Moving: T12 spinous process line; ALTERNATIVE: Schober's test (distraction from S2+10cm line: N≥5cm increase)",
     muscles:"Psoas, rectus abdominis, obliques (assist); Erector spinae eccentric control",
     endfeel:{normal:"Firm (posterior ligaments, disc tension)",abnormal:"Springy=disc herniation; Hard=OA/end-stage; Empty=fracture/malignancy"},
     compensation:"Hip flexion substituting for lumbar flex, thoracic flexion, knee bend",
     capsular:"Lumbar capsular: Ext>Lat Flex>Rot (facet joints)",
     adl:"Picking up objects, dressing, tying shoes, toileting",
     pathology:"Limited painfully: disc herniation, acute facet lock, spondylolisthesis; Painful return from flexion = disc",
     redflag:"Bowel/bladder symptoms + LBP = cauda equina — URGENT. Painful arc in flexion/return = disc pathology"},
    {id:"rom_lext",mv:"Extension",bilateral:false,normal:25,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing, hands on posterior iliac crests for stabilisation",gonio:"Axis: greater trochanter; Fixed: vertical; Moving: mid-axillary line",
     muscles:"Erector spinae, multifidus, quadratus lumborum",
     endfeel:{normal:"Firm (anterior disc/ALL + facet joint approximation)",abnormal:"Hard=OA severe; Springy=facet impingement; Empty=instability"},
     compensation:"Hip extension (gluteal contraction), knee flexion",
     capsular:"Facet OA: extension most limited + painful",
     adl:"Standing from seated, walking, reaching overhead, bending backward",
     pathology:"Limited painfully: facet OA, spondylolysis/listhesis, spinal stenosis; Pain in extension = neurogenic claudication",
     redflag:"Bilateral leg pain on extension relieved by sitting = spinal stenosis. Instability = spondylolisthesis (step sign)"},
    {id:"rom_llfl",mv:"Lat Flex L",bilateral:false,normal:25,unit:"°",plane:"Frontal",axis:"AP",
     start:"Standing, knees extended, arms at sides — measure fingertip distance traveled down leg",gonio:"Axis: S2; Fixed: vertical; Moving: T12 SP",
     muscles:"Ipsilateral: QL, erector spinae, obliques; Contralateral: stretched",
     endfeel:{normal:"Firm (contralateral ligaments + muscles)",abnormal:"Hard=OA/scoliosis; Springy=disc"},
     compensation:"Trunk rotation, lateral hip shift, knee flexion",
     capsular:"Asymmetric restriction: unilateral facet OA or disc herniation",
     adl:"Side bending for reaching, lateral reaching in ADLs",
     pathology:"Painful limited: disc herniation (list toward or away from disc depending on HNP position relative to nerve root)",
     redflag:"Lateral list: disc herniation or muscle spasm. Scoliosis: structural vs functional"},
    {id:"rom_llfr",mv:"Lat Flex R",bilateral:false,normal:25,unit:"°",plane:"Frontal",axis:"AP",
     start:"Same as Lat Flex L",gonio:"Same",muscles:"Same contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Springy=disc"},
     compensation:"Trunk rotation, hip shift",capsular:"Compare L vs R",
     adl:"Same",pathology:"Compare with L — asymmetry >10° significant",
     redflag:"Painful list = disc pathology — assess dermatomes"},
    {id:"rom_lrotl",mv:"Rotation L",bilateral:false,normal:5,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Seated, arms crossed, pelvis fixed to chair",gonio:"Axis: midline between PSIS; Fixed: pelvis; Moving: shoulder girdle line",
     muscles:"Ipsilateral internal oblique + multifidus; Contralateral external oblique",
     endfeel:{normal:"Firm (disc + capsule)",abnormal:"Hard=OA; Springy=disc"},
     compensation:"Pelvic rotation, trunk lateral lean",
     capsular:"NOTE: lumbar rotation is very limited (5°) — restriction most significant in acute disc",
     adl:"Rolling in bed, getting in/out of car, twisting",
     pathology:"Painful rotation: disc herniation (early sign), spondylodiscitis; Symmetric loss: AS",
     redflag:"Severe bilateral rotation loss + SI joint involvement = AS — check BASMI"},
    {id:"rom_lrotr",mv:"Rotation R",bilateral:false,normal:5,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same",muscles:"Same",
     endfeel:{normal:"Firm",abnormal:"Springy=disc"},
     compensation:"Pelvic rotation",capsular:"Compare L vs R",
     adl:"Same",pathology:"Same as rotation L",redflag:"Same"},
  ],
  "TMJ":[
    {id:"rom_topen",mv:"Mouth Opening",bilateral:false,normal:45,unit:"mm",plane:"Sagittal",axis:"Frontal",
     start:"Seated, teeth in crest-to-crest occlusion; measure interincisal distance",gonio:"Ruler: between upper and lower central incisors",
     muscles:"Bilateral lateral pterygoid, digastric, mylohyoid (opening); masseter, temporalis, medial pterygoid (close)",
     endfeel:{normal:"Firm (muscle/capsule at end range)",abnormal:"Springy=anterior disc displacement with reduction (click); Hard=bony block/closed lock; Empty=acute inflammation"},
     compensation:"Forward head posture to gain opening, jaw deviation (note deviation direction)",
     capsular:"TMJ capsular: limitation in opening=protrusion=contralateral deviation (ipsilateral condyle restriction)",
     adl:"Eating, yawning, talking, dental treatment",
     pathology:"<30mm = significant trismus; Clicking with opening: disc displacement with reduction; No click + limited: disc displacement without reduction (closed lock)",
     redflag:"Sudden inability to open after locking = closed lock — urgent referral. Trismus + fever = infection"},
    {id:"rom_tlatl",mv:"Lat Deviation L",bilateral:false,normal:10,unit:"mm",plane:"Frontal",axis:"Vertical",
     start:"Seated, mouth slightly open, measure deviation of lower midline from upper",gonio:"Ruler from upper to lower central incisor midlines",
     muscles:"Ipsilateral medial pterygoid + contralateral lateral pterygoid",
     endfeel:{normal:"Firm",abnormal:"Hard=bony block; Limited=ipsilateral disc; Painful=synovitis"},
     compensation:"Head tilt to compensate",capsular:"Reduced ipsilateral deviation = ipsilateral disc/capsule restriction",
     adl:"Chewing (lateral grinding movement)",
     pathology:"Deviation toward affected side on opening = ipsilateral disc or muscle pathology",
     redflag:"Unilateral deviation + pain + swelling = septic arthritis or condylar fracture"},
    {id:"rom_tlatr",mv:"Lat Deviation R",bilateral:false,normal:10,unit:"mm",plane:"Frontal",axis:"Vertical",
     start:"Same",gonio:"Same",muscles:"Contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Hard/Springy"},
     compensation:"Head tilt",capsular:"Compare L vs R",adl:"Chewing",pathology:"Same as L",redflag:"Same"},
    {id:"rom_tpro",mv:"Protrusion",bilateral:false,normal:8,unit:"mm",plane:"Sagittal",axis:"Frontal",
     start:"Seated, teeth together; measure forward movement of lower incisor beyond upper",gonio:"Ruler measurement",
     muscles:"Bilateral lateral pterygoid",
     endfeel:{normal:"Firm (temporomandibular ligament)",abnormal:"Hard=bony/OA; Reduced=capsular restriction"},
     compensation:"Forward head posture",capsular:"Reduced protrusion: bilateral capsular pattern",
     adl:"Chewing tough foods, mandibular positioning",
     pathology:"Reduced protrusion: bilateral disc displacement, OA, fibrosis post-infection",
     redflag:"Malocclusion post-trauma = condylar fracture"},
  ],
  "Shoulder":[
    {id:"rom_sflex",mv:"Flexion",bilateral:true,normal:180,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or seated; scapula stabilised after 60°",gonio:"Axis: lateral shoulder (GH joint); Fixed: mid-axillary line; Moving: lateral humerus to lateral epicondyle",
     muscles:"Anterior deltoid, coracobrachialis (0–90°); upper trap + serratus anterior (scapular upward rotation 60–180°)",
     endfeel:{normal:"Firm (posterior capsule + infraspinatus/teres minor)",abnormal:"Hard=OA/calcification; Springy=subacromial impingement; Empty=septic/acute RC tear"},
     compensation:"Trunk extension (lean back), elbow flex, shoulder hike (upper trap), scapular winging",
     capsular:"GH capsular pattern: ER>Abd>IR (Cyriax); impingement pattern: painful arc 60–120°",
     adl:"Reaching overhead (shelf, hair wash), throwing, swimming",
     pathology:"Arc 60–120°: impingement or partial RC. Arc 120–180° on ascent: AC joint. Full loss: frozen shoulder",
     redflag:"Sudden painless loss after trauma = complete RC tear. Fever + hot joint = septic arthritis"},
    {id:"rom_sext",mv:"Extension",bilateral:true,normal:60,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Prone or standing; stabilise scapula to prevent anterior tipping",gonio:"Axis: lateral GH; Fixed: mid-axillary line; Moving: lateral humerus",
     muscles:"Posterior deltoid, teres major, latissimus dorsi, long head triceps",
     endfeel:{normal:"Firm (anterior capsule + coracohumeral ligament)",abnormal:"Hard=OA; Springy=biceps long head"},
     compensation:"Trunk flexion, scapular anterior tipping, shoulder IR",
     capsular:"Extension less affected in GH capsular pattern than ER/Abd",
     adl:"Reaching behind back (hand to back pocket, bra hook), pushing off from chair",
     pathology:"Limited: anterior capsule tightness, biceps tendon pathology, pec major tightness",
     redflag:"Pain at extreme extension = anterior instability, SLAP lesion"},
    {id:"rom_sabd",mv:"Abduction",bilateral:true,normal:180,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, elbow extended, thumb up (scapular plane preferred = 30° forward)",gonio:"Axis: posterior GH joint; Fixed: parallel to spine; Moving: posterior humerus",
     muscles:"Supraspinatus (0–15°), deltoid (15–90°), serratus + trap (60–180° scapular rotation)",
     endfeel:{normal:"Firm (inferior GH capsule + adductors)",abnormal:"Hard=OA/calcification; Springy=subacromial impingement; Empty=fracture/acute tear"},
     compensation:"Trunk lateral lean (Trendelenburg shoulder), shoulder hike, scapular winging, elbow flex",
     capsular:"Primary GH restriction: ER>Abd>IR. Assess scapulohumeral rhythm (N = 2:1 GH:scap ratio)",
     adl:"Reaching out to side, dressing (arm into sleeve), carrying objects at side",
     pathology:"Arc 60–120°: impingement or partial RC; Full loss: frozen shoulder, GH OA, complete RC tear",
     redflag:"Acute painful arc + weakness + trauma = complete RC tear. Document scapulohumeral rhythm deviation"},
    {id:"rom_sadd",mv:"Adduction",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, assess cross-body adduction (horizontal adduction)",gonio:"Axis: anterior GH; Fixed: acromion to acromion line; Moving: humerus",
     muscles:"Pec major, latissimus dorsi, teres major, anterior deltoid",
     endfeel:{normal:"Soft (arm contact with trunk) or firm",abnormal:"Pain at extreme: AC joint pathology (horizontal add)"},
     compensation:"Trunk lean",capsular:"AC joint positive: horizontal adduction most painful",
     adl:"Hugging, crossing arms, ADL cross-body reach",
     pathology:"Horizontal adduction pain: AC joint OA, ACJ injury, subacromial pathology",
     redflag:"Cross-body pain after fall = ACJ sprain — assess step deformity"},
    {id:"rom_ser",mv:"ER",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, shoulder 0° abduction, elbow 90°; ALSO test at 90° abduction",gonio:"Axis: olecranon; Fixed: vertical/perpendicular to table; Moving: ulna/forearm",
     muscles:"Infraspinatus, teres minor, posterior deltoid",
     endfeel:{normal:"Firm (anterior capsule + subscapularis)",abnormal:"Hard=OA; Springy=impingement; Empty=acute"},
     compensation:"Shoulder elevation, trunk rotation, scapular protraction",
     capsular:"ER most limited in GH capsular pattern (frozen shoulder) — key diagnostic finding",
     adl:"Combing hair, overhead reach, throwing wind-up",
     pathology:"ER loss primary sign of GH capsular restriction. ER loss at 90° = posterior capsule tightness → impingement",
     redflag:"ER lag sign (passive > active by >5°) = infraspinatus tear. Profound ER weakness = axillary nerve injury"},
    {id:"rom_sir",mv:"IR",bilateral:true,normal:70,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, shoulder 0° abduction, elbow 90°; assess thumb-to-back (functional IR) = N: T8–T10 level",gonio:"Axis: olecranon; Fixed: vertical; Moving: ulna",
     muscles:"Subscapularis, anterior deltoid, teres major, pec major, latissimus",
     endfeel:{normal:"Firm (posterior capsule + muscles)",abnormal:"Hard=OA; Springy=posterior capsule restriction"},
     compensation:"Shoulder protraction, trunk rotation, scapular anterior tipping",
     capsular:"Posterior capsule tightness: IR limited → GIRD (glenohumeral internal rotation deficit) in throwers",
     adl:"Reaching behind back, bra hook, tucking shirt, toileting",
     pathology:"GIRD: IR loss >15° vs opposite in overhead athletes → impingement risk. Posterior labral tear",
     redflag:"Internal rotation lag sign = subscapularis tear. Belly press weakness = subscapularis rupture"},
    {id:"rom_shabd",mv:"Horiz Abduction",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine or seated, shoulder 90° abduction → assess horizontal abd",gonio:"Axis: AC joint; Fixed: acromion line; Moving: humerus",
     muscles:"Posterior deltoid, infraspinatus, teres minor",
     endfeel:{normal:"Firm (anterior capsule + pec major)",abnormal:"Springy=posterior capsule impingement"},
     compensation:"Trunk rotation",capsular:"Horizontal ABD stretches posterior capsule: reproduce posterior shoulder pain",
     adl:"Throwing follow-through, backstroke",
     pathology:"Limited horizontal ABD + posterior pain: posterior capsule tightness or posterior labral tear",
     redflag:"Instability testing: apprehension with horizontal ABD + ER = anterior instability"},
    {id:"rom_shadd",mv:"Horiz Adduction",bilateral:true,normal:135,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Shoulder 90° flex → add horizontally across body",gonio:"Axis: posterior GH; Fixed: shoulder line; Moving: humerus",
     muscles:"Pec major (sternal), anterior deltoid, coracobrachialis",
     endfeel:{normal:"Soft (contact) or firm",abnormal:"Pain at end: AC joint pathology"},
     compensation:"Trunk rotation",capsular:"AC joint: positive horizontal ADD — Scarf/cross-body test",
     adl:"Reaching across body, hugging",
     pathology:"Horizontal ADD pain at AC joint = AC pathology (Scarf test); posterior = subacromial",
     redflag:"AC joint injury grading: I (sprain), II (ACJ step), III (complete)"},
  ],
  "Elbow":[
    {id:"rom_eflex",mv:"Flexion",bilateral:true,normal:145,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Anatomical position, forearm supinated",gonio:"Axis: lateral epicondyle; Fixed: lateral humerus mid-axillary; Moving: lateral forearm to radial styloid",
     muscles:"Biceps brachii, brachialis, brachioradialis",
     endfeel:{normal:"Soft (muscle bulk contact) or hard (bone-to-bone in lean patients)",abnormal:"Hard (osteophyte/loose body); Springy (anterior capsule issue)"},
     compensation:"Shoulder flex/abd to assist",capsular:"Elbow capsular: Flex>Ext (lateral pivot shift pattern)",
     adl:"Feeding, grooming, phone use, pulling objects",
     pathology:"Limited flex: posterior osteophyte, loose body, OA; pain at end range: posterior impingement",
     redflag:"Effusion: check fat pad sign (X-ray). Valgus stress pain with flexion = UCL injury"},
    {id:"rom_eext",mv:"Extension",bilateral:true,normal:0,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Anatomical position",gonio:"Same as flexion",
     muscles:"Triceps brachii, anconeus",
     endfeel:{normal:"Hard (bone-to-bone: olecranon in fossa)",abnormal:"Firm (capsular — common in OA); Springy (loose body)"},
     compensation:"Shoulder elevation, wrist flex",capsular:"Extension loss primary sign elbow OA/capsular",
     adl:"Pushing, pressing, reaching far, overhead work",
     pathology:"Extension loss: OA, posterior impingement, loose body, flexion contracture post-fracture; Hyperextension: laxity/UCL injury",
     redflag:"Extension loss after trauma = fracture (radial head, coronoid). Hyperextension = posterior dislocation risk"},
    {id:"rom_esup",mv:"Supination",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Longitudinal",
     start:"Elbow 90° flexion, arm at side (eliminates shoulder rotation compensation)",gonio:"Axis: third finger; Fixed: parallel to humerus; Moving: dorsal forearm/pencil held in hand",
     muscles:"Biceps brachii (primary), supinator",
     endfeel:{normal:"Firm (interosseous membrane, pronator teres, oblique cord)",abnormal:"Hard=radial head OA/DRUJ arthritis; Springy=ligamentous"},
     compensation:"Shoulder ER, trunk rotation",capsular:"DRUJ capsular: supination>pronation",
     adl:"Receiving change, carrying soup bowl, turning door handle (external knob), hammering upward blow",
     pathology:"Limited supination: radial head fracture/OA, DRUJ arthritis, interosseous membrane injury",
     redflag:"Supination pain + lateral elbow = radial head fracture post-fall. DRUJ dislocation"},
    {id:"rom_epro",mv:"Pronation",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Longitudinal",
     start:"Elbow 90° flexion, arm at side",gonio:"Same as supination",
     muscles:"Pronator teres, pronator quadratus",
     endfeel:{normal:"Firm (interosseous membrane + supinator stretch)",abnormal:"Hard=DRUJ OA; Empty=acute fracture"},
     compensation:"Shoulder IR, trunk rotation",capsular:"DRUJ: pronation often better preserved than supination",
     adl:"Typing, cutting food, writing, pouring liquid",
     pathology:"Limited pronation: DRUJ arthritis, distal radius malunion, interosseous membrane",
     redflag:"Loss after distal radius fracture = DRUJ injury. Pronator syndrome: painful pronation + median nerve symptoms"},
  ],
  "Wrist":[
    {id:"rom_wflex",mv:"Wrist Flexion",bilateral:true,normal:80,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Forearm supported in pronation, wrist neutral",gonio:"Axis: lateral wrist (triquetrum); Fixed: ulna; Moving: 5th metacarpal",
     muscles:"FCR, FCU, palmaris longus; FDP/FDS assist",
     endfeel:{normal:"Firm (posterior capsule + extensor muscle stretch)",abnormal:"Hard=OA/Kienböck; Springy=TFCC/SL ligament"},
     compensation:"Forearm supination, finger extension",capsular:"Wrist capsular: flex=ext restriction in symmetry (capsular) or asymmetric (ligamentous)",
     adl:"Typing (neutral preferred), prayer position, push-up position",
     pathology:"Limited painful flex: dorsal ganglia, DISI instability, dorsal wrist impingement; Wrist OA",
     redflag:"Limited + painful with swelling = scaphoid fracture (snuffbox tenderness). TFCC: ulnar sided pain + limited"},
    {id:"rom_wext",mv:"Wrist Extension",bilateral:true,normal:70,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Forearm supported in pronation",gonio:"Axis: lateral wrist; Fixed: ulna; Moving: 5th metacarpal",
     muscles:"ECRL, ECRB, ECU",
     endfeel:{normal:"Firm (anterior capsule + flexor stretch)",abnormal:"Hard=OA; Springy=volar plate laxity"},
     compensation:"Forearm pronation, finger flex",capsular:"Wrist OA: both flex and ext equally limited",
     adl:"Push-up, weight bearing on hands, typing (slight extension), keyboard use",
     pathology:"Limited extension: tennis elbow (wrist ext pain); distal radius fracture malunion; volar ganglia",
     redflag:"<30° extension after Colles fracture = malunion — DRUJ check"},
    {id:"rom_wrad",mv:"Radial Deviation",bilateral:true,normal:20,unit:"°",plane:"Frontal",axis:"AP",
     start:"Forearm pronated on table, wrist neutral",gonio:"Axis: middle of wrist (capitate); Fixed: forearm midline; Moving: 3rd metacarpal",
     muscles:"FCR (with ECRL), APL, EPB",
     endfeel:{normal:"Firm (ulnar collateral ligament + ECU/FCU)",abnormal:"Hard=OA/scaphoid impingement; Springy=radial styloid"},
     compensation:"Forearm supination",capsular:"RA: radial deviation restricted early",
     adl:"Keyboard use, pouring, hammering",
     pathology:"Limited radial deviation: scaphoid OA, radial styloid impingement, intersection syndrome",
     redflag:"Painful radial deviation after fall = de Quervain's (Finkelstein test). Scaphoid fracture"},
    {id:"rom_wuln",mv:"Ulnar Deviation",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Forearm pronated on table, wrist neutral",gonio:"Same as radial deviation",
     muscles:"FCU, ECU",
     endfeel:{normal:"Firm (radial collateral ligament + muscles)",abnormal:"Hard=OA; Springy=TFCC"},
     compensation:"Forearm pronation",capsular:"RA: ulnar deviation is deformity direction — assess actively",
     adl:"Hammering, wringing, reaching lateral objects",
     pathology:"TFCC injury: painful ulnar deviation; Ulnar impaction: ulnar wrist pain + limited ulnar dev",
     redflag:"RA: ulnar drift deformity — do not force ulnar deviation. TFCC + ulnar impaction"},
  ],
  "Hand & Fingers":[
    {id:"rom_mcp",mv:"MCP Flexion",bilateral:true,normal:90,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Wrist neutral, assess each finger MCP individually",gonio:"Axis: dorsal MCP joint; Fixed: metacarpal shaft; Moving: proximal phalanx dorsum",
     muscles:"Flexor digitorum superficialis/profundus, lumbricals, interossei",
     endfeel:{normal:"Firm (collateral ligaments + joint capsule)",abnormal:"Springy=flexor tenosynovitis; Hard=OA/Dupuytren"},
     compensation:"Wrist flexion, finger abd/add",capsular:"RA: MCP volar subluxation + ulnar drift — assess passively with care",
     adl:"Gripping, keyboard, writing, pinching",
     pathology:"Limited MCP flex: Dupuytren's contracture, flexor tenosynovitis, RA/OA, post-fracture",
     redflag:"Sudden triggering = trigger finger (stenosing tenosynovitis). RA: MCPs swollen bilaterally = synovitis"},
    {id:"rom_pip",mv:"PIP Flexion",bilateral:true,normal:100,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"MCP neutral, assess each PIP",gonio:"Axis: lateral PIP; Fixed: proximal phalanx; Moving: middle phalanx",
     muscles:"FDS (primary PIP flexor)",
     endfeel:{normal:"Soft (tissue contact, lean) or firm",abnormal:"Springy=volar plate laxity; Hard=OA/bony block"},
     compensation:"MCP flex, wrist flex",capsular:"PIP capsular: flex>ext",
     adl:"All grip functions",
     pathology:"PIP limited: Boutonnière deformity (RA/trauma), volar plate injury, fracture, post-immobilisation contracture",
     redflag:"PIP swelling after injury = volar plate avulsion (jammed finger). Boutonnière = PIP flex + DIP ext deformity"},
    {id:"rom_dip",mv:"DIP Flexion",bilateral:true,normal:90,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"PIP in extension; assess DIP flex/ext",gonio:"Axis: lateral DIP; Fixed: middle phalanx; Moving: distal phalanx",
     muscles:"FDP (sole DIP flexor)",
     endfeel:{normal:"Firm (dorsal capsule + extensor mechanism)",abnormal:"Hard=Heberden's nodes (OA); Springy=extensor mechanism"},
     compensation:"PIP flex",capsular:"DIP: OA causes Heberden's nodes + limited flex",
     adl:"Fine pinch, typing, intricate hand work",
     pathology:"DIP extension loss: mallet finger (extensor digitorum avulsion). DIP OA: Heberden's nodes",
     redflag:"Mallet finger: DIP rests in flex, cannot actively extend = extensor avulsion — splint 6 weeks"},
    {id:"rom_thopp",mv:"Thumb Opposition",bilateral:true,normal:null,unit:"",plane:"Multi",axis:"Multi",
     start:"Assess little finger pad contact with thumb pad",gonio:"Kapandji index (0–10 scale): 0=thumb cannot reach index; 10=full opposition past little finger base",
     muscles:"Opponens pollicis, FPB, APB, FPL",
     endfeel:{normal:"Firm (1st CMC joint + AdPoll + EP)",abnormal:"Hard=CMC OA; Springy=UCL laxity (Skier's thumb)"},
     compensation:"Wrist flex, forearm pronation",capsular:"1st CMC OA: adduction + extension most limited → Z-deformity",
     adl:"Pinching, writing, buttoning, feeding, key grip",
     pathology:"CMC OA (common in women >50): adduction/extension limited → pain base thumb. CTS: APB weakness → opposition weakness",
     redflag:"CMC OA grading: I (ligamentous laxity), II–IV (progressive narrowing). Grind test positive"},
    {id:"rom_thabdm",mv:"Thumb Abd/Ext",bilateral:true,normal:70,unit:"°",plane:"Frontal",axis:"AP",
     start:"Wrist neutral, thumb alongside index; palmar abduction (out of palm plane)",gonio:"Axis: 1st MCP; Fixed: 1st metacarpal; Moving: proximal phalanx",
     muscles:"APB, APL (abduction); EPL, EPB (extension)",
     endfeel:{normal:"Firm (adductor pollicis + 1st dorsal interosseous)",abnormal:"Hard=1st CMC OA; Springy=UCL"},
     compensation:"Wrist radial deviation",capsular:"1st CMC: abduction + extension restriction in OA",
     adl:"Holding large objects, typing space bar, jar opening",
     pathology:"de Quervain's: APL/EPB tenosynovitis — painful abduction; Limited: CMC OA",
     redflag:"UCL injury (Skier's thumb): valgus stress test at MCP. Stener lesion = surgical"},
  ],
  "Hip":[
    {id:"rom_hflex",mv:"Flexion",bilateral:true,normal:120,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, knee flexed (eliminates hamstring restriction) — assess also with knee extended",gonio:"Axis: greater trochanter; Fixed: mid-axillary line; Moving: lateral femur to lateral condyle",
     muscles:"Iliopsoas (primary), rectus femoris, TFL, sartorius",
     endfeel:{normal:"Soft (anterior thigh-abdomen contact) or firm",abnormal:"Firm early=capsular/OA; Hard=CAM impingement; Empty=acute"},
     compensation:"Lumbar flexion (monitor: loss of lordosis), contralateral hip flex, posterior pelvic tilt",
     capsular:"Hip capsular: IR>Flex>Abd (late stage: all planes)",
     adl:"Sitting, stair climbing, getting out of car, sexual activity, tying shoes",
     pathology:"Limited flex: hip OA (capsular), CAM/pincer FAI, iliopsoas tendinopathy, labral tear",
     redflag:"Groin pain at end-range flex = labral tear (FADIR positive). Trauma + loss = fracture/dislocation"},
    {id:"rom_hext",mv:"Extension",bilateral:true,normal:20,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Prone, stabilise pelvis; knee extended (test hip capsule) + knee flexed 90° (test iliopsoas)",gonio:"Axis: greater trochanter; Fixed: mid-axillary line; Moving: lateral femur",
     muscles:"Gluteus maximus, hamstrings (knee extended), posterior adductor magnus",
     endfeel:{normal:"Firm (iliofemoral ligament + anterior capsule)",abnormal:"Hard=OA/CAM; Springy=posterior impingement"},
     compensation:"Lumbar hyperextension (anterior pelvic tilt), knee flex (to use hamstrings)",
     capsular:"Hip OA: extension + IR restricted earliest",
     adl:"Walking push-off, stair descending, standing from seated",
     pathology:"Hip ext loss: hip flexor contracture (Thomas test), hip OA, lumbar facet compensation",
     redflag:"Bilateral hip ext loss + fixed flexion = AS. Thomas test positive = psoas/rectus tightness"},
    {id:"rom_habd",mv:"Abduction",bilateral:true,normal:45,unit:"°",plane:"Frontal",axis:"AP",
     start:"Supine, pelvis level; stabilise contralateral ASIS",gonio:"Axis: ASIS; Fixed: ASIS-to-ASIS line; Moving: midline of thigh to midpoint of patella",
     muscles:"Gluteus medius/minimus, TFL, piriformis (at 0° flex)",
     endfeel:{normal:"Firm (adductors + pubofemoral ligament + medial capsule)",abnormal:"Hard=OA/CAM; Springy=labrum"},
     compensation:"Lateral pelvic tilt (hip hike), lumbar lateral flex, trunk lean",
     capsular:"Hip OA: abduction limited with internal rotation (combined movement most restricted)",
     adl:"Getting in/out of car, stepping sideways, putting on trousers/socks",
     pathology:"Limited abd: OA, labral tear (CAM), adductor tightness, Legg-Calvé-Perthes, DDH",
     redflag:"Bilateral abd loss in child = DDH/LCP — urgent referral. Trendelenburg sign = Gmed weakness"},
    {id:"rom_hadd",mv:"Adduction",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Supine, move test leg across midline; stabilise contralateral ASIS",gonio:"Axis: ASIS; Fixed: ASIS line; Moving: midline thigh",
     muscles:"Adductor longus/brevis/magnus, gracilis, pectineus",
     endfeel:{normal:"Firm (IT band + abductors + lateral capsule)",abnormal:"Springy=adductor strain; Hard=OA"},
     compensation:"Contralateral pelvis drop, trunk lean ipsilateral",capsular:"Less restricted than abd in OA",
     adl:"Crossing legs, horseback riding",
     pathology:"Painful adduction: adductor strain, osteitis pubis, sports hernia",
     redflag:"Adductor squeeze test <18cmHg = groin strain. Groin pain in child/adolescent = SUFE — urgent X-ray"},
    {id:"rom_her",mv:"ER",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, hip + knee 90° (seated) OR prone, knee 90° (pelvis stabilised)",gonio:"Axis: knee (midpoint); Fixed: vertical; Moving: distal fibula/tibia (pendulum method)",
     muscles:"Piriformis, obturator internus/externus, gemelli, gluteus maximus (posterior fibers)",
     endfeel:{normal:"Firm (anterior capsule + iliofemoral ligament + internal rotators)",abnormal:"Hard=OA; Springy=labral tear"},
     compensation:"Lateral pelvic tilt, lumbar rotation",capsular:"Hip OA: IR more limited than ER (early); Both limited end-stage",
     adl:"Cross-legged sitting, walking toe-out gait, external rotation in sport",
     pathology:"Piriformis syndrome: painful ER + sciatic symptoms; Hip OA: ER preserved longer than IR",
     redflag:"Bilateral ER loss in child = SUFE. Painful ER in trauma = posterior hip dislocation"},
    {id:"rom_hir",mv:"IR",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Prone knee 90° (most reliable); or supine hip 90°",gonio:"Same pendulum method as ER",
     muscles:"Gluteus medius (anterior), TFL, adductor longus",
     endfeel:{normal:"Firm (posterior capsule + external rotators + ischiofemoral ligament)",abnormal:"Hard=OA/FAI; Empty=acute; Springy=labrum"},
     compensation:"Trunk rotation, pelvic rotation",capsular:"Hip IR FIRST AND MOST LIMITED in early hip OA — key diagnostic sign",
     adl:"Getting in/out of car, sitting cross-legged is limited, pivoting",
     pathology:"IR loss: hip OA (earliest sign), CAM FAI, posterior capsule tightness; GIRD equivalent at hip",
     redflag:"IR loss + groin pain in middle-aged = hip OA. Sudden IR loss in child = SUFE/LCP — X-ray"},
  ],
  "Knee":[
    {id:"rom_kflex",mv:"Flexion",bilateral:true,normal:140,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or prone; assess both actively and passively",gonio:"Axis: lateral knee (lateral condyle); Fixed: lateral femur (greater trochanter to condyle line); Moving: lateral fibula to lateral malleolus",
     muscles:"Hamstrings (primary), gastrocnemius (assists at end range), popliteus (initiates)",
     endfeel:{normal:"Soft (posterior calf-thigh contact) or firm (capsule in lean patients)",abnormal:"Springy=meniscal block; Hard=OA/loose body; Empty=acute hemarthrosis"},
     compensation:"Hip flex to assist, ankle plantar flex to increase apparent knee flex",
     capsular:"Knee capsular: Flex>Ext (3:1 ratio in OA)",
     adl:"Stair climbing (N=85°), sitting (N=90°), squatting (N=130°), kneeling (N=140°)",
     pathology:"Limited flex: knee OA, effusion (30° is maximum comfortable flexion in effusion), patellofemoral OA, quadriceps contracture",
     redflag:"Springy block = meniscal tear (bucket handle). Locked knee = urgent. Haemarthrosis post-trauma = ACL tear"},
    {id:"rom_kext",mv:"Extension",bilateral:true,normal:0,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine; assess extension lag (difference between passive and active extension)",gonio:"Same as flexion",
     muscles:"Quadriceps (rectus femoris, vasti)",
     endfeel:{normal:"Firm (posterior capsule + posterior ligaments) or hard (bone-to-bone in hyperextension)",abnormal:"Springy=posterior impingement; Hard=OA; Soft early=effusion"},
     compensation:"Hip extension, ankle DF",capsular:"Extension loss: OA, post-surgery (arthrofibrosis), hamstring tightness",
     adl:"Walking (requires 0°), stair descent, standing",
     pathology:"Extension lag: quadriceps weakness or patella tendon rupture. Flexion contracture: OA, post-fracture, arthrofibrosis",
     redflag:"Extension lag >10° = quadriceps mechanism injury (patella or patellar tendon). PCL injury = posterior sag"},
  ],
  "Ankle":[
    {id:"rom_adf",mv:"Dorsiflexion",bilateral:true,normal:20,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or seated (non-weight bearing); also assess weight-bearing lunge test (N ≥ 10cm heel-to-wall)",gonio:"Axis: lateral malleolus; Fixed: fibula shaft; Moving: 5th metatarsal shaft",
     muscles:"Tibialis anterior, EHL, EDL, peroneus tertius",
     endfeel:{normal:"Firm (posterior capsule + Achilles/soleus tension)",abnormal:"Hard=bony block (anterior OA/os trigonum); Springy=anterior impingement; Empty=Achilles rupture"},
     compensation:"Subtalar eversion (to compensate DF with pronation), knee flex, hip flex, anterior trunk lean",
     capsular:"Ankle capsular: PF>DF (Cyriax)",
     adl:"Stair climbing (N=15–20°), squatting, kneeling, gait push-off",
     pathology:"Limited DF: Achilles/soleus tightness (equinus), anterior bony impingement, os trigonum, posterior capsule adhesions",
     redflag:"<10° DF = kinetic chain effects: knee valgus, foot pronation, pelvic anterior tilt in squat. Heel cord: Silfverskiöld test"},
    {id:"rom_apf",mv:"Plantarflexion",bilateral:true,normal:50,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, ankle relaxed",gonio:"Axis: lateral malleolus; Fixed: fibula; Moving: 5th metatarsal",
     muscles:"Gastrocnemius, soleus, tibialis posterior, peroneals, FHL/FDL",
     endfeel:{normal:"Firm (anterior capsule + anterior muscles stretch)",abnormal:"Hard=posterior OA/loose body; Springy=ligamentous"},
     compensation:"Hip IR, trunk lean",capsular:"Plantarflexion less affected than DF in ankle OA",
     adl:"Heel raise, ballet, push-off in walking, cycling",
     pathology:"Limited PF: anterior impingement syndrome, Achilles calcification, anterior capsule adhesion",
     redflag:"Sudden PF loss after push-off = Achilles rupture (Thompson test negative)"},
    {id:"rom_ainv",mv:"Inversion",bilateral:true,normal:35,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, ankle in plantar flex (tests subtalar); assess talar tilt",gonio:"Axis: posterior calcaneus; Fixed: tibia shaft; Moving: posterior calcaneus",
     muscles:"Tibialis posterior, FHL, FDL, tibialis anterior",
     endfeel:{normal:"Firm (lateral ligaments + peroneal muscles)",abnormal:"Springy=ATFL/CFL laxity; Hard=coalition; Empty=acute sprain"},
     compensation:"Tibial IR, knee flex",capsular:"Subtalar: inversion > eversion restriction in subtalar OA",
     adl:"Walking on uneven ground, sand",
     pathology:"Hypermobile inversion: lateral ankle sprain (ATFL/CFL); Limited: subtalar OA, tarsal coalition, peroneal tendinopathy",
     redflag:">35° inversion + pain + swelling post-sprain = grade III ATFL tear — anterior draw test. Ottawa rules: X-ray"},
    {id:"rom_aev",mv:"Eversion",bilateral:true,normal:15,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, ankle neutral",gonio:"Axis: posterior calcaneus; Fixed: tibia; Moving: posterior calcaneus",
     muscles:"Peroneus longus/brevis, peroneus tertius, EDB",
     endfeel:{normal:"Firm (medial deltoid ligament + tibialis posterior)",abnormal:"Hard=coalition; Springy=deltoid laxity"},
     compensation:"Tibial ER, knee ext",capsular:"Eversion less commonly restricted than inversion",
     adl:"Walking on uneven ground (medial stability)",
     pathology:"Hypomobile eversion: peroneal tendinopathy, subtalar OA; Hypermobile: deltoid ligament laxity",
     redflag:"Eversion force mechanism injury = deltoid ligament tear (medial ankle) — assess with stress X-ray"},
  ],
  "Foot":[
    {id:"rom_1mtpf",mv:"1st MTP Extension",bilateral:true,normal:70,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing (functional) or supine; windlass test: active hallux extension",gonio:"Axis: 1st MTP joint; Fixed: 1st metatarsal; Moving: proximal phalanx plantar surface",
     muscles:"EHL (active); passive: plantar fascia (windlass mechanism)",
     endfeel:{normal:"Firm (plantar plate + FHL + plantar fascia windlass)",abnormal:"Hard=hallux rigidus (OA); Springy=sesamoiditis; Empty=fracture"},
     compensation:"Supination of forefoot, external rotation of limb, early heel rise (antalgic gait)",
     capsular:"1st MTP OA (hallux rigidus): extension severely limited, end-range painful",
     adl:"Walking push-off (requires 65–70° MTP extension), running, going up stairs",
     pathology:"Hallux rigidus: progressive MTP extension loss → antalgic gait with external rotation. Hallux valgus: deviated alignment",
     redflag:"Acute MTP pain + limitation = turf toe (plantar plate sprain) or fracture. Grade III turf toe = surgical"},
    {id:"rom_1mtpp",mv:"1st MTP Flexion",bilateral:true,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, ankle neutral",gonio:"Axis: dorsal MTP; Fixed: 1st metatarsal; Moving: dorsal proximal phalanx",
     muscles:"FHL, FHB",
     endfeel:{normal:"Firm (dorsal capsule + EHL stretch)",abnormal:"Hard=OA; Springy=sesamoid"},
     compensation:"Ankle DF to assist toe flex",capsular:"OA: both flex and ext limited",
     adl:"Running, push-off power",
     pathology:"Limited: hallux rigidus, FHL tenosynovitis (dancer's posterior ankle pain)",
     redflag:"Posterior ankle pain + limited MTP flex in dancer = FHL tenosynovitis or os trigonum"},
    {id:"rom_mtpf2",mv:"2nd–5th MTP Extension",bilateral:true,normal:40,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine; assess each MTP extension passively",gonio:"Axis: each MTP joint",
     muscles:"EDL, EDB",
     endfeel:{normal:"Firm (plantar plate + FDL)",abnormal:"Springy=plantar plate injury; Hard=OA"},
     compensation:"Hip and knee extension",capsular:"Lesser MTP OA: variable restriction",
     adl:"Walking push-off, running",
     pathology:"Limited/painful MTP ext: Morton's neuroma (not joint), metatarsalgia, stress fracture, plantar plate injury",
     redflag:"2nd MTP dorsal dislocation (Lisfranc injury): severe pain + limited ROM + plantar ecchymosis"},
  ],
};

const ROM_REGIONS=Object.keys(ROM_DATA);
const RESTRICTION_GRADE=(measured,normal)=>{
  if(!measured||!normal) return null;
  const pct=(measured/normal)*100;
  if(pct>=85) return{label:"WNL",color:"#00c97a",pct};
  if(pct>=65) return{label:"Mild",color:"#ffb300",pct};
  if(pct>=40) return{label:"Moderate",color:"#ff8c42",pct};
  return{label:"Severe",color:"#ff4d6d",pct};
};

const ROM_REDFLAGS=[
  {test:(mv,val)=>mv.toLowerCase().includes("cervical")&&parseFloat(val)<20,msg:"Cervical ROM <20° — fracture/instability protocol. Do not passively test.",color:"#ff4d6d"},
  {test:(mv,val)=>mv.toLowerCase().includes("ankle dorsiflexion")&&parseFloat(val)<10,msg:"Ankle DF <10° — significant equinus. Kinetic chain assessment required.",color:"#ff8c42"},
  {test:(mv,val)=>mv.toLowerCase().includes("hip ir")&&parseFloat(val)<20,msg:"Hip IR <20° — possible early hip OA or FAI. Labral tear assessment indicated.",color:"#ff8c42"},
  {test:(mv,val)=>mv.toLowerCase().includes("knee flex")&&parseFloat(val)<90,msg:"Knee flexion <90° — functional limitation for ADLs. Effusion assessment needed.",color:"#ff8c42"},
];

function genROMSoap(data){
  const findings=[];
  ROM_REGIONS.forEach(reg=>{
    ROM_DATA[reg].forEach(m=>{
      const sides=m.bilateral?["_L","_R"]:[""];
      sides.forEach(s=>{
        const v=data[`${m.id}${s}_arom`]||data[`${m.id}${s}`];
        if(v){
          const g=RESTRICTION_GRADE(parseFloat(v),m.normal);
          if(g&&g.label!=="WNL") findings.push(`${m.mv}${s?` (${s.slice(1)})`:""}=${v}${m.unit} [${g.label} restriction: ${Math.round(g.pct)}% normal]`);
        }
      });
    });
  });
  return findings.length===0?"No significant ROM restrictions recorded.":`ROM restrictions identified:\n${findings.join("\n")}`;
}

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

const DERMATOMES = [
  { id:"n_c3",  level:"C3",  region:"Posterior neck / occipital",         reflex:null,    myotome:"Neck lateral flexion",         disc:"C2/3" },
  { id:"n_c4",  level:"C4",  region:"Cape (shoulder top)",                reflex:null,    myotome:"Shoulder elevation (trap)",    disc:"C3/4" },
  { id:"n_c5",  level:"C5",  region:"Lateral arm / deltoid badge",        reflex:"Biceps (C5–C6)", myotome:"Shoulder abduction / elbow flex", disc:"C4/5" },
  { id:"n_c6",  level:"C6",  region:"Lateral forearm / thumb + index",    reflex:"Brachioradialis", myotome:"Wrist extension (ECRL/ECRB)",   disc:"C5/6" },
  { id:"n_c7",  level:"C7",  region:"Middle finger",                       reflex:"Triceps (C6–C7)", myotome:"Elbow extension / wrist flex",  disc:"C6/7" },
  { id:"n_c8",  level:"C8",  region:"Little + ring finger / medial FA",   reflex:null,    myotome:"Finger flexion / intrinsics",  disc:"C7/T1" },
  { id:"n_t1",  level:"T1",  region:"Medial forearm / elbow",             reflex:null,    myotome:"Finger abduction (1st dorsal)", disc:"T1/2" },
  { id:"n_l1",  level:"L1",  region:"Groin / upper anterior thigh",       reflex:null,    myotome:"Hip flexion",                  disc:"L1/2" },
  { id:"n_l2",  level:"L2",  region:"Anterior + medial thigh",            reflex:null,    myotome:"Hip flexion / knee ext (assist)", disc:"L2/3" },
  { id:"n_l3",  level:"L3",  region:"Medial knee / lower anterior thigh", reflex:"Patella (L3–L4)", myotome:"Knee extension (quad)",      disc:"L3/4" },
  { id:"n_l4",  level:"L4",  region:"Medial leg / medial foot",           reflex:"Patella (L3–L4)", myotome:"Ankle dorsiflexion (TA)",    disc:"L4/5" },
  { id:"n_l5",  level:"L5",  region:"Dorsum foot / 1st–2nd web space",    reflex:null,    myotome:"Great toe extension (EHL)",    disc:"L4/5" },
  { id:"n_s1",  level:"S1",  region:"Lateral foot / heel / sole",         reflex:"Achilles (S1)", myotome:"Ankle plantarflexion (gastroc)", disc:"L5/S1" },
  { id:"n_s2",  level:"S2",  region:"Posterior thigh",                    reflex:null,    myotome:"Knee flexion (hamstrings)",    disc:"S1/2" },
  { id:"n_s3",  level:"S3",  region:"Medial thigh / perineum",            reflex:null,    myotome:"Bowel/bladder sphincter",      disc:"—" },
  { id:"n_s4s5",level:"S4/5",region:"Perianal / saddle",                  reflex:"Anal wink", myotome:"Sphincter tone",           disc:"Cauda equina" },
];

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

const REFLEXES = [
  { id:"n_ref_jaw",     label:"Jaw Jerk",               level:"V (trigeminal)",  technique:"Tap chin with finger, mouth slightly open", finding:"Brisk = UMN above pons — CNS referral", pathological:true },
  { id:"n_ref_bicep",   label:"Biceps",                  level:"C5–C6",           technique:"Tap biceps tendon with knee on antecubital fossa", finding:"Dim = C5/6 LMN. Brisk = UMN myelopathy", pathological:false },
  { id:"n_ref_brad",    label:"Brachioradialis",         level:"C5–C6",           technique:"Tap brachioradialis belly, forearm neutral", finding:"Absent + finger flexors brisk = inverted = myelopathy", pathological:false },
  { id:"n_ref_tricep",  label:"Triceps",                 level:"C6–C7",           technique:"Tap triceps tendon, elbow at 90° hanging", finding:"Dim = C7 radiculopathy", pathological:false },
  { id:"n_ref_patella", label:"Patella (quadriceps)",    level:"L3–L4",           technique:"Tap patellar tendon, knee at 90°", finding:"Dim = L3/4 disc. Absent = severe radiculopathy", pathological:false },
  { id:"n_ref_achilles",label:"Achilles",                level:"S1",              technique:"DF ankle, tap Achilles tendon", finding:"Dim/Absent = S1 radiculopathy or peripheral neuropathy", pathological:false },
  { id:"n_ref_babinski",label:"Babinski Sign",           level:"UMN screen",      technique:"Stroke lateral plantar surface with blunt object", finding:"Extension of big toe + fan toes = POSITIVE = UMN — URGENT", pathological:true },
  { id:"n_ref_hoffmann",label:"Hoffmann's Sign",         level:"UMN cervical",    technique:"Flick terminal phalanx of middle finger", finding:"Thumb/index flex = positive = cervical myelopathy — REFER", pathological:true },
  { id:"n_ref_clonus",  label:"Ankle Clonus",            level:"UMN screen",      technique:"Rapid DF of ankle — sustain pressure", finding:">3 beats = positive = UMN lesion", pathological:true },
  { id:"n_ref_cremast", label:"Cremaster Reflex",        level:"L1–L2",           technique:"Stroke inner thigh — observe testicular elevation", finding:"Absent = L1/2 radiculopathy or cauda equina concern", pathological:false },
];

const NEURAL_TENSION = [
  {
    id:"nt_slr", label:"Straight Leg Raise (SLR)",
    nerve:"L4–S1 (sciatic / lumbosacral roots)", sensitivity:"91%", specificity:"26%",
    procedure:"Patient supine. Lift leg with knee EXTENDED. Note angle of symptom onset. At positive angle, sensitise by adding cervical flexion + ankle DF.",
    positive:"Radicular pain/paraesthesia in distribution below knee between 30–70°. Above 70° = hamstring tightness.",
    differentiation:"Add ankle DF: worse = neural. Add cervical flex: worse = neuromeningeal. Remove DF at max angle: improves = neural tension.",
    pattern:"L4/5 disc: reproduces leg/foot symptoms. High specificity if crossed SLR positive.",
  },
  {
    id:"nt_slump", label:"Slump Test",
    nerve:"Entire neuraxis (spinal cord + nerve roots)", sensitivity:"84%", specificity:"83%",
    procedure:"Seated. Step 1: Slump trunk (thoracic kyphosis). Step 2: Flex neck. Step 3: Extend knee. Step 4: Add ankle DF. Positive = symptoms reproduced. Release neck extension.",
    positive:"Reproduction of symptoms relieved by neck extension = neural tension positive. More sensitive than SLR.",
    differentiation:"If symptoms increase with neck flex but reduce with neck extension = neural. If no change = hamstring tightness.",
    pattern:"Central sensitisation shows bilateral symptoms. Disc herniation = unilateral leg symptoms.",
  },
  {
    id:"nt_ultt1", label:"ULTT1 — Median Nerve",
    nerve:"Median nerve / C5–C7", sensitivity:"72%", specificity:"33%",
    procedure:"Shoulder depress → abduct 90° → ER → extend elbow → supinate forearm → extend wrist/fingers. Add cervical lateral flex (contralateral).",
    positive:"Paraesthesia in median nerve distribution (thumb/index/middle). Symptom change with cervical sensitisation.",
    differentiation:"Change symptoms by adding/removing ipsilateral vs contralateral cervical side flex.",
    pattern:"C5/6/7 radiculopathy. Thoracic outlet syndrome. Carpal tunnel (distal reproduction).",
  },
  {
    id:"nt_ultt2", label:"ULTT2 — Radial Nerve",
    nerve:"Radial nerve / C6–C8", sensitivity:"72%", specificity:"33%",
    procedure:"Shoulder depress + ER → abduct 90° → IR → extend elbow → pronate forearm → flex wrist.",
    positive:"Symptoms in posterior forearm / radial nerve distribution.",
    differentiation:"Pronate vs supinate forearm — radial nerve = worse with pronation.",
    pattern:"Tennis elbow, de Quervain's with radial nerve component. C6/7 radiculopathy.",
  },
  {
    id:"nt_ultt3", label:"ULTT3 — Ulnar Nerve",
    nerve:"Ulnar nerve / C8–T1", sensitivity:"69%", specificity:"N/A",
    procedure:"Shoulder depress + abduct → flex elbow → pronate forearm → extend wrist + fingers.",
    positive:"Paraesthesia in ring/little finger distribution. Medial elbow symptoms.",
    differentiation:"Adds cubital tunnel assessment. Positive with elbow flexion as sensitiser.",
    pattern:"Cubital tunnel syndrome. C8/T1 radiculopathy. TOS (lower trunk).",
  },
  {
    id:"nt_femoral", label:"Femoral Nerve Tension Test (FNTT)",
    nerve:"Femoral nerve / L2–L4", sensitivity:"88%", specificity:"N/A",
    procedure:"Patient prone. Flex knee to 90°. Therapist extends hip. Add cervical extension to sensitise. Positive = anterior thigh pain / L2–L4 distribution.",
    positive:"Anterior thigh and groin pain reproduced with hip extension + knee flexion.",
    differentiation:"Differentiate from hip pathology: add cervical extension — neural involvement increases symptoms.",
    pattern:"L2/3/4 disc herniation. Upper lumbar radiculopathy. Femoral neuropathy.",
  },
];

const RED_FLAGS_NEURO = [
  { id:"nrf_cauda",     label:"Cauda Equina Syndrome",   severity:"EMERGENCY",   description:"Saddle anaesthesia (S3–S5), bilateral leg weakness, bowel/bladder incontinence or retention", action:"999 / Emergency Department NOW. MRI within 24h.", icon:"🆘" },
  { id:"nrf_myelopathy",label:"Cord Compression / Myelopathy", severity:"URGENT", description:"Positive Babinski, Hoffmann's, clonus, hyperreflexia + long tract signs, progressive spastic gait", action:"Urgent neurosurgical referral. No manipulation.", icon:"🔴" },
  { id:"nrf_prog_weak", label:"Progressive Neurological Weakness", severity:"URGENT", description:"Weakness deteriorating over days/weeks, widespread myotomal involvement, bilateral findings", action:"Urgent MRI + neurological referral within 48h.", icon:"🔴" },
  { id:"nrf_saddle",    label:"Saddle Anaesthesia",       severity:"EMERGENCY",   description:"Loss of sensation perineum, anus, inner thighs (S3–S5 distribution)", action:"Emergency Department immediately.", icon:"🆘" },
  { id:"nrf_umnsigns",  label:"Upper Motor Neuron Signs", severity:"URGENT",      description:"Babinski positive, hyperreflexia, spasticity, sustained clonus (>3 beats)", action:"Neurology referral. Cervical/thoracic MRI.", icon:"🔴" },
  { id:"nrf_bilateral", label:"Bilateral Neurological Signs", severity:"URGENT",  description:"Bilateral leg weakness, bilateral dermatomal loss, bilateral reflex changes", action:"Urgent referral — central disc, cord pathology.", icon:"🔴" },
  { id:"nrf_sphincter", label:"Sphincter Dysfunction",    severity:"EMERGENCY",   description:"New onset bowel/bladder dysfunction alongside back/leg pain", action:"Emergency admission.", icon:"🆘" },
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

function NeurologicalModule({ data, set }) {
  const [tab, setTab] = useState("dermatomes");
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);
  const [clinicianNotes, setClinicianNotes] = useState(data["neuro_clinician_notes"]||"");

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
    if(rf.id==="nrf_myelopathy") return (data["n_ref_babinski"]||"").includes("Positive")||(data["n_ref_hoffmann"]||"").includes("Positive")||(data["n_ref_clonus"]||"").includes("Positive")||data["nrf_myelopathy"]==="Present";
    if(rf.id==="nrf_saddle") return data["nrf_saddle"]==="Present";
    if(rf.id==="nrf_bilateral") return data["nrf_bilateral"]==="Present";
    if(rf.id==="nrf_sphincter") return data["nrf_sphincter"]==="Present";
    if(rf.id==="nrf_prog_weak") return data["nrf_prog_weak"]==="Present";
    if(rf.id==="nrf_umnsigns") return (data["n_ref_babinski"]||"").includes("Positive")||(data["n_ref_hoffmann"]||"").includes("Positive");
    return data[rf.id]==="Present";
  });

  const tabs = [
    { key:"dermatomes",  label:"Dermatomes",      icon:"🗺️" },
    { key:"myotomes",    label:"Myotomes",         icon:"💪" },
    { key:"reflexes",    label:"Reflexes",         icon:"🔨" },
    { key:"tension",     label:"Neural Tension",   icon:"⚡" },
    { key:"redflags",    label:"Red Flags",        icon:"🚨" },
    { key:"reasoning",   label:"Clinical Reasoning",icon:"🧠" },
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
          <div style={{background:C.s2,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:"0.76rem",color:C.muted,lineHeight:1.6}}>
            <strong style={{color:C.accent}}>Technique:</strong> Use light touch (cotton wool) and pin-prick (sharp/blunt) at dermatomal key points. Always compare side to side. Start from distal and move proximal. Ask patient to close eyes. Score relative to normal contralateral side or control area.
          </div>

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
          <div style={{background:C.s2,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:"0.76rem",color:C.muted,lineHeight:1.6}}>
            <strong style={{color:C.accent}}>Grading:</strong> 5=Normal, 4=Against resistance, 3=Against gravity, 2=Gravity eliminated, 1=Flicker, 0=None. Test bilaterally. Grade 4 in myotomal pattern = nerve root irritation. Grade 3 or below = significant axonal loss.
          </div>
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
          {sectionHead("Deep Tendon & Pathological Reflexes")}
          <div style={{background:C.s2,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:"0.76rem",color:C.muted,lineHeight:1.6}}>
            <strong style={{color:C.accent}}>Grading:</strong> 0=Absent, 1+=Trace, 2+=Normal, 3+=Brisk, 4+=Clonus. Asymmetry is always significant. Hyperreflexia + pathological signs = UMN (cord/brain). Hyporeflexia = LMN (root/peripheral nerve).
          </div>
          {REFLEXES.map(r=>{
            const lv=data[r.id+"_left"]||"", rv=data[r.id+"_right"]||"";
            const lCol=getReflexColor(lv), rCol=getReflexColor(rv);
            const pathL=(lv.includes("Brisk")||lv.includes("Clonus")||lv.includes("Positive"));
            const pathR=(rv.includes("Brisk")||rv.includes("Clonus")||rv.includes("Positive"));
            const absentL=lv.includes("Absent")||lv.includes("Trace");
            const absentR=rv.includes("Absent")||rv.includes("Trace");
            const urgent=r.pathological&&(pathL||pathR);
            const abnormal=pathL||pathR||absentL||absentR;
            const opts = r.pathological ? ["Not tested","Negative (normal)","Positive (abnormal)"] : REFLEX_OPTIONS;
            return(
              <div key={r.id} style={{background:C.surface,border:`1px solid ${urgent?C.red:abnormal?C.yellow+"50":C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
                  <div>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                      <span style={{fontWeight:700,color:urgent?C.red:abnormal?C.yellow:C.text}}>{r.label}</span>
                      {r.pathological&&<span style={{padding:"1px 6px",borderRadius:8,background:"rgba(255,77,109,0.2)",color:C.red,fontSize:"0.6rem",fontWeight:700}}>PATHOLOGICAL</span>}
                      <span style={{fontSize:"0.68rem",color:C.muted}}>{r.level}</span>
                    </div>
                  </div>
                  <button type="button" onClick={()=>setExpandedLevel(expandedLevel===r.id?null:r.id)}
                    style={{padding:"2px 9px",background:"rgba(127,90,240,0.12)",border:`1px solid ${C.a2}40`,borderRadius:6,color:C.a2,fontSize:"0.62rem",fontWeight:700,cursor:"pointer",flexShrink:0}}>
                    {expandedLevel===r.id?"▲ Hide":"ℹ Technique"}
                  </button>
                </div>
                {expandedLevel===r.id&&(
                  <div style={{background:C.s3,borderRadius:8,padding:"9px 12px",marginBottom:8,fontSize:"0.74rem",lineHeight:1.7}}>
                    <div><strong style={{color:C.accent}}>Technique:</strong> <span style={{color:C.text}}>{r.technique}</span></div>
                    <div style={{marginTop:4}}><strong style={{color:urgent?C.red:C.yellow}}>Clinical finding:</strong> <span style={{color:C.text}}>{r.finding}</span></div>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["_left","LEFT",lv,lCol],["_right","RIGHT",rv,rCol]].map(([sfx,side,sv,col])=>(
                    <div key={sfx}>
                      <div style={{fontSize:"0.62rem",fontWeight:700,color:col,marginBottom:3}}>{side} {(sv.includes("Positive")||sv.includes("Brisk")||sv.includes("Clonus"))?"🔴":sv.includes("Absent")||sv.includes("Trace")?"⚠":""}</div>
                      <select value={sv} onChange={e=>set(r.id+sfx,e.target.value)} style={{...inp,borderColor:(sv.includes("Positive")||sv.includes("Brisk")||sv.includes("Clonus"))?C.red:sv.includes("Absent")?C.yellow:C.border}}>
                        <option value="">— select —</option>
                        {opts.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── NEURAL TENSION TESTS ── */}
      {tab==="tension"&&(
        <div>
          {sectionHead("Neural Tension Tests — Neurodynamic Assessment")}
          <div style={{background:C.s2,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:"0.76rem",color:C.muted,lineHeight:1.6}}>
            <strong style={{color:C.accent}}>Principle:</strong> Sensitise neural structures through sequential loading. Positive = reproduction of familiar symptoms with neural sensitisation (not just stretch). Always differentiate neural from musculoskeletal by adding/releasing sensitising components.
          </div>
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
const KEY_JOINTS = { 0:"Nose",11:"L.Shoulder",12:"R.Shoulder",13:"L.Elbow",14:"R.Elbow",15:"L.Wrist",16:"R.Wrist",23:"L.Hip",24:"R.Hip",25:"L.Knee",26:"R.Knee",27:"L.Ankle",28:"R.Ankle",31:"L.Foot",32:"R.Foot" };
const TRACKING_STATES = { IDLE:"idle", LOADING:"loading", CALIBRATING:"calibrating", DETECTING:"detecting", STABLE:"stable", LOST:"lost" };

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

// ─── SkeletonRenderer ────────────────────────────────────────────────────────
function SkeletonRenderer({ canvasRef, landmarks, videoSize, trackingState }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoSize) return;
    const ctx = canvas.getContext("2d");
    const { w, h } = videoSize;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    if (!landmarks || trackingState === TRACKING_STATES.LOST) return;

    const px = (lm) => [lm.x * w, lm.y * h];
    const vis = (i, thresh = 0.35) => landmarks[i]?.visibility > thresh;
    const alpha = trackingState === TRACKING_STATES.STABLE ? 1 : 0.55;

    // Connection lines with confidence-based opacity + glow
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    POSE_CONNECTIONS.forEach(([a, b]) => {
      if (!vis(a) || !vis(b)) return;
      const [ax, ay] = px(landmarks[a]), [bx, by] = px(landmarks[b]);
      const conf = Math.min(landmarks[a].visibility, landmarks[b].visibility);
      const isTorso = (a >= 11 && a <= 12) || (b >= 11 && b <= 12) || a === 23 || b === 23 || a === 24 || b === 24;
      const isLeg = a >= 23 || b >= 23;
      const baseCol = isTorso ? [127,90,240] : isLeg ? [0,201,122] : [0,229,255];
      const lineAlpha = (conf * 0.7 + 0.3) * alpha;
      ctx.beginPath();
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.strokeStyle = `rgba(${baseCol},${lineAlpha})`;
      ctx.lineWidth = isTorso ? 3 : 2.5;
      ctx.shadowColor = `rgba(${baseCol},0.5)`; ctx.shadowBlur = conf > 0.7 ? 8 : 3;
      ctx.stroke();
    });

    // Spine midline
    if (vis(11) && vis(12) && vis(23) && vis(24)) {
      const shMid = [(landmarks[11].x+landmarks[12].x)/2*w, (landmarks[11].y+landmarks[12].y)/2*h];
      const hipMid = [(landmarks[23].x+landmarks[24].x)/2*w, (landmarks[23].y+landmarks[24].y)/2*h];
      ctx.beginPath(); ctx.moveTo(...shMid); ctx.lineTo(...hipMid);
      ctx.strokeStyle = `rgba(255,179,0,${0.65*alpha})`; ctx.lineWidth = 2;
      ctx.setLineDash([5,4]); ctx.shadowColor = "rgba(255,179,0,0.4)"; ctx.shadowBlur = 5;
      ctx.stroke(); ctx.setLineDash([]);
    }

    // Joints — size + color by confidence
    Object.keys(KEY_JOINTS).forEach(idx => {
      const i = Number(idx);
      if (!vis(i, 0.2)) return;
      const [x, y] = px(landmarks[i]);
      const conf = landmarks[i].visibility;
      const r = i === 0 ? 7 : conf > 0.7 ? 5 : 3.5;
      const col = conf > 0.7 ? "#00e5ff" : conf > 0.45 ? "#ffb300" : "#ff4d6d";
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = conf > 0.7 ? 10 : 4;
      ctx.fill();
      ctx.strokeStyle = "rgba(6,9,15,0.8)"; ctx.lineWidth = 1.5; ctx.shadowBlur = 0;
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
  }, [landmarks, videoSize, trackingState, canvasRef]);
  return null;
}

// ─── BodyAlignmentGuide — SVG overlay shown before/during calibration ─────────
function BodyAlignmentGuide({ show, ready }) {
  if (!show) return null;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: ready ? 0.15 : 0.35 }} viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet">
      {/* Centre vertical line */}
      <line x1="50" y1="5" x2="50" y2="145" stroke="#00e5ff" strokeWidth="0.4" strokeDasharray="3,3"/>
      {/* Head ellipse */}
      <ellipse cx="50" cy="14" rx="7" ry="9" fill="none" stroke="#00e5ff" strokeWidth="0.6"/>
      {/* Shoulder bar */}
      <line x1="28" y1="28" x2="72" y2="28" stroke="#7f5af0" strokeWidth="0.6"/>
      {/* Hip bar */}
      <line x1="35" y1="70" x2="65" y2="70" stroke="#7f5af0" strokeWidth="0.6"/>
      {/* Foot markers */}
      <ellipse cx="38" cy="138" rx="6" ry="3" fill="none" stroke="#00c97a" strokeWidth="0.6"/>
      <ellipse cx="62" cy="138" rx="6" ry="3" fill="none" stroke="#00c97a" strokeWidth="0.6"/>
      {/* Grid thirds */}
      <line x1="33" y1="0" x2="33" y2="150" stroke="#00e5ff" strokeWidth="0.25" strokeDasharray="2,5"/>
      <line x1="67" y1="0" x2="67" y2="150" stroke="#00e5ff" strokeWidth="0.25" strokeDasharray="2,5"/>
    </svg>
  );
}

// ─── TrackingStateBar ─────────────────────────────────────────────────────────
function TrackingStateBar({ state, quality }) {
  const cfg = {
    [TRACKING_STATES.IDLE]:       { label:"Camera Ready",      color:"#6b8399", pulse:false },
    [TRACKING_STATES.LOADING]:    { label:"Loading Model…",    color:"#7f5af0", pulse:true  },
    [TRACKING_STATES.CALIBRATING]:{ label:"Calibrating",       color:"#ffb300", pulse:true  },
    [TRACKING_STATES.DETECTING]:  { label:"Detecting Body…",   color:"#ffb300", pulse:true  },
    [TRACKING_STATES.STABLE]:     { label:"Tracking Stable",   color:"#00c97a", pulse:false },
    [TRACKING_STATES.LOST]:       { label:"Tracking Lost",     color:"#ff4d6d", pulse:true  },
  }[state] || { label:"—", color:"#6b8399", pulse:false };

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

// ─── CameraView ───────────────────────────────────────────────────────────────
function CameraView({ videoRef, canvasRef, isActive, facingMode, children }) {
  const flip = facingMode === "user" ? "scaleX(-1)" : "none";
  return (
    <div className="pm-cam-aspect pm-camera-wrap" style={{ position:"relative", width:"100%", background:"#06090f", borderRadius:14, overflow:"hidden", aspectRatio:"3/4", maxHeight:"65vh" }}>
      {!isActive && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
          <div style={{ fontSize:"2.5rem" }}>📷</div>
          <div style={{ fontSize:"0.8rem", color:"#6b8399", textAlign:"center", padding:"0 20px" }}>Camera preview will appear here</div>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover", display:isActive?"block":"none", transform:flip }}/>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", transform:flip }}/>
      {children}
    </div>
  );
}

// ─── CameraControls ───────────────────────────────────────────────────────────
function CameraControls({ isActive, isLoading, onStart, onStop, onFlip, onRecalibrate, facingMode, canRecalibrate }) {
  const Btn = ({ onClick, label, bg, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{ padding:"10px 18px", background:disabled?"#1a2d45":`linear-gradient(135deg,${bg},${bg}cc)`, border:"none", borderRadius:10, color:disabled?"#6b8399":"#000", fontWeight:800, fontSize:"0.77rem", cursor:disabled?"not-allowed":"pointer", flex:1, minWidth:90, transition:"opacity 0.2s" }}>
      {label}
    </button>
  );
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
      {!isActive
        ? <Btn onClick={onStart} label={isLoading?"⏳ Initialising…":"📷 Start Camera"} bg="#00e5ff" disabled={isLoading}/>
        : <Btn onClick={onStop} label="⏹ Stop" bg="#ff4d6d"/>
      }
      {isActive && <Btn onClick={onFlip} label={facingMode==="user"?"🔄 Back Cam":"🔄 Front Cam"} bg="#7f5af0"/>}
      {canRecalibrate && <Btn onClick={onRecalibrate} label="⟳ Recalibrate" bg="#ffb300"/>}
    </div>
  );
}

// ─── CameraPositionGuide ──────────────────────────────────────────────────────
function CameraPositionGuide() {
  return (
    <div style={{ background:"rgba(0,229,255,0.05)", border:"1px solid rgba(0,229,255,0.18)", borderRadius:12, padding:14, marginBottom:12 }}>
      <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#00e5ff", textTransform:"uppercase", letterSpacing:"1px", marginBottom:9 }}>📐 Setup Guide</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:7 }}>
        {[["📏","Place camera ~2 m away"],["🧍","Keep full body in frame"],["💡","Use even, bright lighting"],["📱","Camera at hip / pelvis height"],["👕","Form-fitting clothing helps"],["🦶","Ensure feet are visible"]].map(([ic, tx], i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, fontSize:"0.74rem", color:"#d4e0f0" }}>
            <span style={{ flexShrink:0 }}>{ic}</span><span style={{ lineHeight:1.4 }}>{tx}</span>
          </div>
        ))}
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

// ─── Main PostureCameraModule ─────────────────────────────────────────────────
function PostureCameraModule() {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const smoother   = useRef(createSmoother());
  const lostTimer  = useRef(null);

  const [trackState, setTrackState] = useState(TRACKING_STATES.IDLE);
  const [isLoading,  setIsLoading]  = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [landmarks,  setLandmarks]  = useState(null);
  const [videoSize,  setVideoSize]  = useState(null);
  const [countdown,  setCountdown]  = useState(0);
  const [permError,  setPermError]  = useState(null);
  const [poseActive, setPoseActive] = useState(false);

  const isActive = trackState !== TRACKING_STATES.IDLE;
  const quality  = landmarks ? computeQuality(landmarks) : { score:null, warnings:[], ready:false, distanceHint:null };

  // ── Calibration ────────────────────────────────────────────────────────────
  const runCalibration = () => {
    setTrackState(TRACKING_STATES.CALIBRATING);
    let c = 4; setCountdown(c);
    const t = setInterval(() => {
      c--; setCountdown(c);
      if (c <= 0) { clearInterval(t); setTrackState(TRACKING_STATES.DETECTING); setPoseActive(true); }
    }, 1000);
  };

  // ── Camera start / stop ────────────────────────────────────────────────────
  const startCamera = async (mode = facingMode) => {
    setPermError(null); setIsLoading(true); setTrackState(TRACKING_STATES.LOADING);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:mode, width:{ideal:720}, height:{ideal:960} }, audio:false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise(res => { videoRef.current.onloadedmetadata = res; });
        setVideoSize({ w:videoRef.current.videoWidth, h:videoRef.current.videoHeight });
      }
      setIsLoading(false);
      runCalibration();
    } catch(err) {
      setIsLoading(false); setTrackState(TRACKING_STATES.IDLE);
      setPermError(err.name==="NotAllowedError" ? "Camera permission denied — allow access in browser settings." : err.name==="NotFoundError" ? "No camera found on this device." : `Camera error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null; setPoseActive(false); setLandmarks(null);
    setTrackState(TRACKING_STATES.IDLE); setCountdown(0);
    if (lostTimer.current) clearTimeout(lostTimer.current);
  };

  const flipCamera = () => {
    const next = facingMode==="user" ? "environment" : "user";
    setFacingMode(next); if (isActive) { stopCamera(); setTimeout(() => startCamera(next), 200); }
  };

  // ── Landmark handler ───────────────────────────────────────────────────────
  const handleLandmarks = useCallback((raw) => {
    const sm = smoother.current(raw);
    setLandmarks(sm);
    if (!sm) {
      // lost tracking — debounce 800ms before showing LOST
      if (!lostTimer.current) lostTimer.current = setTimeout(() => { setTrackState(s => s===TRACKING_STATES.STABLE||s===TRACKING_STATES.DETECTING?TRACKING_STATES.LOST:s); lostTimer.current=null; }, 800);
      return;
    }
    if (lostTimer.current) { clearTimeout(lostTimer.current); lostTimer.current = null; }
    const q = computeQuality(sm);
    setTrackState(q.ready ? TRACKING_STATES.STABLE : TRACKING_STATES.DETECTING);
  }, []);

  // ── Resize ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;
    const up = () => { const v=videoRef.current; if(v&&v.videoWidth) setVideoSize({w:v.videoWidth,h:v.videoHeight}); };
    window.addEventListener("resize", up);
    return () => window.removeEventListener("resize", up);
  }, [isActive]);

  useEffect(() => { return () => stopCamera(); }, []);

  const showGuide = trackState===TRACKING_STATES.CALIBRATING || trackState===TRACKING_STATES.DETECTING;

  return (
    <div>
      <style>{`@keyframes pcPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,rgba(0,229,255,0.07),rgba(127,90,240,0.07))", border:"1px solid rgba(0,229,255,0.16)", borderRadius:14, padding:"13px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#00e5ff1a,#7f5af01a)", border:"1px solid rgba(0,229,255,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>🎥</div>
          <div>
            <div style={{ fontWeight:800, fontSize:"0.93rem", color:"#00e5ff" }}>Posture Analysis Camera</div>
            <div style={{ fontSize:"0.63rem", color:"#6b8399" }}>MediaPipe BlazePose · Adaptive Smoothing · Physiotherapy Grade</div>
          </div>
        </div>
        <TrackingStateBar state={trackState} quality={quality.score}/>
      </div>

      {/* Setup guide — pre-camera */}
      {!isActive && <CameraPositionGuide/>}

      {/* Permission error */}
      {permError && (
        <div style={{ background:"rgba(255,77,109,0.09)", border:"1px solid rgba(255,77,109,0.3)", borderRadius:10, padding:"11px 14px", marginBottom:10, fontSize:"0.77rem", color:"#ff4d6d", display:"flex", gap:8 }}>
          🚫 {permError}
        </div>
      )}

      {/* Camera + overlays */}
      <CameraView videoRef={videoRef} canvasRef={canvasRef} isActive={isActive} facingMode={facingMode}>
        <BodyAlignmentGuide show={showGuide} ready={quality.ready}/>
        <CalibrationSystem state={trackState} countdown={countdown} quality={quality}/>
        {/* Distance hint badge */}
        {quality.distanceHint && isActive && (
          <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", background:"rgba(6,9,15,0.82)", border:"1px solid rgba(255,179,0,0.4)", borderRadius:20, padding:"5px 14px", fontSize:"0.72rem", color:"#ffb300", fontWeight:700, whiteSpace:"nowrap" }}>
            {quality.distanceHint==="back" ? "⬅ Step back" : "➡ Step closer"}
          </div>
        )}
      </CameraView>

      {/* Skeleton */}
      {isActive && <SkeletonRenderer canvasRef={canvasRef} landmarks={landmarks} videoSize={videoSize} trackingState={trackState}/>}

      {/* Pose engine */}
      <PoseTracker videoRef={videoRef} active={poseActive} onLandmarks={handleLandmarks}/>

      {/* Controls */}
      <CameraControls isActive={isActive} isLoading={isLoading} onStart={()=>startCamera(facingMode)} onStop={stopCamera} onFlip={flipCamera} onRecalibrate={runCalibration} facingMode={facingMode} canRecalibrate={isActive&&trackState!==TRACKING_STATES.CALIBRATING}/>

      {/* Warnings */}
      {isActive && quality.warnings.length>0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:8 }}>
          {quality.warnings.map((w,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:`${w.color}15`, border:`1px solid ${w.color}35`, borderRadius:8, fontSize:"0.73rem", fontWeight:600, color:w.color }}>
              <span>{w.icon}</span><span>{w.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Readiness badge */}
      {isActive && trackState!==TRACKING_STATES.CALIBRATING && (
        <div style={{ marginTop:8, padding:"7px 12px", background:quality.ready?"rgba(0,201,122,0.08)":"rgba(255,179,0,0.08)", border:`1px solid ${quality.ready?"rgba(0,201,122,0.25)":"rgba(255,179,0,0.2)"}`, borderRadius:8, fontSize:"0.72rem", fontWeight:700, color:quality.ready?"#00c97a":"#ffb300", display:"flex", alignItems:"center", gap:7 }}>
          <span>{quality.ready?"✓":"○"}</span>
          {quality.ready ? "Full body detected — ready for analysis" : "Position body: head · shoulders · hips · feet all visible"}
        </div>
      )}

      {/* Joint confidence panel */}
      {trackState===TRACKING_STATES.STABLE && landmarks && (
        <div style={{ marginTop:10, background:"#0d1117", border:"1px solid #1a2d45", borderRadius:10, padding:"9px 13px" }}>
          <div style={{ fontSize:"0.6rem", fontWeight:700, color:"#6b8399", textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>Joint Confidence</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {Object.entries(KEY_JOINTS).map(([idx, name]) => {
              const v = landmarks[Number(idx)]?.visibility || 0;
              const col = v>0.7?"#00c97a":v>0.4?"#ffb300":"#ff4d6d";
              return <div key={idx} style={{ fontSize:"0.62rem", padding:"2px 7px", borderRadius:7, background:`${col}14`, color:col, border:`1px solid ${col}28`, fontWeight:600 }}>{name} {Math.round(v*100)}%</div>;
            })}
          </div>
        </div>
      )}

      {/* ── Multi-View Analysis Engine ── */}
      {trackState===TRACKING_STATES.STABLE && landmarks && quality.ready && (
        <PostureAnalysisEngine landmarks={landmarks} canvasRef={canvasRef} videoSize={videoSize} videoRef={videoRef}/>
      )}

      {/* Footer */}
      <div style={{ marginTop:10, fontSize:"0.62rem", color:"#6b8399", padding:"7px 11px", background:"#0d1117", borderRadius:8, lineHeight:1.5, border:"1px solid #1a2d45" }}>
        <strong style={{ color:"#d4e0f0" }}>Privacy:</strong> All processing runs locally in your browser. No video is uploaded or stored.
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// POSTURE ANALYSIS ENGINE v2 — Professional Physiotherapy-Grade Platform
// ═══════════════════════════════════════════════════════════════════════════════

// ─── AngleCalculationEngine ───────────────────────────────────────────────────
function calcAngle(a, b) {
  if (!a || !b) return null;
  return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}
function calcDeviation(mid, ref) {
  if (!mid || ref === undefined) return null;
  return (mid.x - ref) * 100;
}
function midpoint(a, b) {
  if (!a || !b) return null;
  return { x:(a.x+b.x)/2, y:(a.y+b.y)/2, visibility:Math.min(a.visibility||0, b.visibility||0) };
}
function vec3Angle(a,b,c) {
  if(!a||!b||!c) return null;
  const ab={x:a.x-b.x,y:a.y-b.y}, cb={x:c.x-b.x,y:c.y-b.y};
  const dot=ab.x*cb.x+ab.y*cb.y;
  const mag=Math.sqrt((ab.x**2+ab.y**2)*(cb.x**2+cb.y**2));
  if(mag===0) return null;
  return Math.acos(Math.min(1,Math.max(-1,dot/mag)))*180/Math.PI;
}

// ─── MeasurementEngine ────────────────────────────────────────────────────────
function MeasurementEngine(lm) {
  if(!lm) return {};
  const g=i=>lm[i];
  const vis=i=>(lm[i]?.visibility||0)>0.45;
  const shMid=midpoint(g(11),g(12));
  const hipMid=midpoint(g(23),g(24));

  // Head tilt (nose lateral offset from shoulder mid)
  const headTilt = shMid&&g(0) ? (g(0).x-shMid.x)*100 : null;

  // Shoulder asymmetry (angle from horizontal)
  const shoulderAsymm = (vis(11)&&vis(12)) ? calcAngle(g(12),g(11)) : null;

  // Pelvic tilt angle
  const pelvisAngle = (vis(23)&&vis(24)) ? calcAngle(g(24),g(23)) : null;

  // Trunk shift deviation
  const trunkShift = (shMid&&hipMid) ? (shMid.x-hipMid.x)*100 : null;

  // Knee alignment angles
  const leftKneeAngle  = vec3Angle(g(23),g(25),g(27));
  const rightKneeAngle = vec3Angle(g(24),g(26),g(28));

  // Forward head (x-distance nose vs shoulder mid — lateral view proxy)
  const forwardHead = shMid&&g(0) ? (g(0).x-shMid.x)*100 : null;

  // Spinal deviation
  const spinalDev = g(0)&&hipMid ? (g(0).x-hipMid.x)*100 : null;

  // Bilateral loading tendency (foot midpoint vs hip midpoint lateral offset)
  const footMid=midpoint(g(31),g(32));
  const lateralLoad = footMid&&hipMid ? (hipMid.x-footMid.x)*100 : null;

  return { headTilt, shoulderAsymm, pelvisAngle, trunkShift, leftKneeAngle, rightKneeAngle, forwardHead, spinalDev, lateralLoad };
}

// ─── ReliabilityEngine ────────────────────────────────────────────────────────
function ReliabilityEngine(lm) {
  if(!lm) return { score:0, status:"no_data", warnings:[], confidence:{} };
  const KEY=[0,11,12,23,24,25,26,27,28,31,32];
  const vis=KEY.map(i=>lm[i]?.visibility||0);
  const score=vis.reduce((s,v)=>s+v,0)/KEY.length;
  const confidence={};
  const JOINT_NAMES={0:"Head",11:"L.Shoulder",12:"R.Shoulder",23:"L.Hip",24:"R.Hip",25:"L.Knee",26:"R.Knee",27:"L.Ankle",28:"R.Ankle",31:"L.Foot",32:"R.Foot"};
  KEY.forEach(i=>{ confidence[i]={ name:JOINT_NAMES[i], value:Math.round((lm[i]?.visibility||0)*100) }; });
  const warnings=[];
  if(score<0.4) warnings.push({icon:"⚠",text:"Low tracking confidence — reposition body",color:"#ff4d6d"});
  else if(score<0.65) warnings.push({icon:"○",text:"Partial tracking — ensure full body visible",color:"#ffb300"});
  const partialLow=KEY.filter(i=>(lm[i]?.visibility||0)<0.35);
  if(partialLow.length>3) warnings.push({icon:"👁",text:`${partialLow.length} landmarks low visibility`,color:"#ffb300"});
  const status=score>0.75?"excellent":score>0.55?"good":score>0.35?"fair":"poor";
  return { score:Math.round(score*100), status, warnings, confidence };
}

// ─── EnvironmentQualityEngine ─────────────────────────────────────────────────
function useEnvironmentQuality(landmarks, videoRef) {
  const [env, setEnv] = useState({ lighting:"unknown", motion:"ok", warnings:[] });
  const prevLm = useRef(null);
  useEffect(()=>{
    if(!landmarks) return;
    const warnings=[];
    // Motion check via landmark drift
    if(prevLm.current) {
      const drift=Math.abs((landmarks[0]?.x||0)-(prevLm.current[0]?.x||0))*100;
      if(drift>3) warnings.push({icon:"🌀",text:"Excessive movement detected — hold still",color:"#ffb300"});
    }
    prevLm.current=landmarks;
    setEnv({ warnings });
  },[landmarks]);
  return env;
}

// ─── SessionHistoryManager ────────────────────────────────────────────────────
function useSessionHistory() {
  const [sessions, setSessions] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem("ph_posture_sessions")||"[]"); }catch{ return []; }
  });
  const save=(session)=>{
    setSessions(prev=>{
      const next=[...prev, session].slice(-20);
      try{ localStorage.setItem("ph_posture_sessions",JSON.stringify(next)); }catch{}
      return next;
    });
  };
  const clear=()=>{ setSessions([]); try{ localStorage.removeItem("ph_posture_sessions"); }catch{} };
  return { sessions, save, clear };
}

// ─── Analysis functions (anterior / lateral / posterior / symmetry) ────────────
function runAnteriorAnalysis(lm) {
  const g=i=>lm[i]; const findings=[]; const angles={};
  const shAngle=calcAngle(g(12),g(11));
  angles.shoulder=shAngle;
  if(shAngle!==null){ const d=Math.abs(shAngle); if(d>4) findings.push({text:shAngle>0?"Left shoulder elevated":"Right shoulder elevated",severity:d>8?"high":"mod",icon:"↗"}); }
  const pelAngle=calcAngle(g(24),g(23));
  angles.pelvis=pelAngle;
  if(pelAngle!==null){ const d=Math.abs(pelAngle); if(d>3) findings.push({text:pelAngle>0?"Left pelvis elevated":"Right pelvis elevated",severity:d>7?"high":"mod",icon:"↗"}); }
  const shMid=midpoint(g(11),g(12));
  if(g(0)&&shMid){ const t=(g(0).x-shMid.x)*100; angles.headTilt=t; if(Math.abs(t)>2) findings.push({text:t>0?"Head tilted right":"Head tilted left",severity:Math.abs(t)>5?"high":"mod",icon:"↪"}); }
  const hipMid=midpoint(g(23),g(24));
  if(shMid&&hipMid){ const s=(shMid.x-hipMid.x)*100; angles.trunkShift=s; if(Math.abs(s)>3) findings.push({text:s>0?"Trunk shifted right":"Trunk shifted left",severity:Math.abs(s)>7?"high":"mod",icon:"⇒"}); }
  [[25,27,23],[26,28,24]].forEach(([knee,ankle,hip],side)=>{
    const label=side===0?"Left":"Right",kn=g(knee),an=g(ankle),hp=g(hip);
    if(kn&&an&&hp){ const dev=(kn.x-(hp.x+an.x)/2)*100; if(Math.abs(dev)>3) findings.push({text:`${label} knee ${dev>0?"valgus":"varus"} tendency`,severity:Math.abs(dev)>6?"high":"mod",icon:"⊾"}); }
  });
  [[31,27],[32,28]].forEach(([foot,ankle],side)=>{
    const label=side===0?"Left":"Right",ft=g(foot),an=g(ankle);
    if(ft&&an){ const rot=(ft.x-an.x)*100; if(Math.abs(rot)>4) findings.push({text:`${label} foot ${rot>0?"externally":"internally"} rotated`,severity:"mod",icon:"↻"}); }
  });
  return { findings, angles, view:"anterior" };
}
function runLateralAnalysis(lm) {
  const g=i=>lm[i]; const findings=[]; const angles={};
  const sh=midpoint(g(11),g(12));
  if(g(0)&&sh){ const fh=(g(0).x-sh.x)*100; angles.forwardHead=fh; if(Math.abs(fh)>3) findings.push({text:fh>0?"Forward head tendency (right profile)":"Forward head tendency (left profile)",severity:Math.abs(fh)>7?"high":"mod",icon:"⇒"}); }
  if(sh&&g(23)){ const kAngle=vec3Angle(g(0),g(11)||sh,g(23)); if(kAngle!==null){ angles.trunkAngle=kAngle; if(kAngle<155) findings.push({text:"Trunk flexion tendency",severity:kAngle<140?"high":"mod",icon:"⌒"}); } }
  if(g(23)&&g(25)&&g(27)){ const ka=vec3Angle(g(23),g(25),g(27)); if(ka!==null){ angles.kneeFlexion=ka; if(ka<155) findings.push({text:"Knee flexion tendency",severity:ka<140?"high":"mod",icon:"⌣"}); } }
  return { findings, angles, view:"lateral" };
}
function runPosteriorAnalysis(lm) {
  const g=i=>lm[i]; const findings=[]; const angles={};
  const lShY=g(11)?.y||0, rShY=g(12)?.y||0;
  if((g(11)?.visibility||0)>0.4&&(g(12)?.visibility||0)>0.4){
    const asymm=(lShY-rShY)*100; angles.scapularAsymm=asymm;
    if(Math.abs(asymm)>2) findings.push({text:asymm>0?"Right scapula may be elevated":"Left scapula may be elevated",severity:Math.abs(asymm)>5?"high":"mod",icon:"⇑"});
  }
  const footMid=midpoint(g(31),g(32)),hipMid=midpoint(g(23),g(24));
  if(footMid&&hipMid){ const ws=(hipMid.x-footMid.x)*100; angles.weightShift=ws; if(Math.abs(ws)>4) findings.push({text:ws>0?"Weight shifted right":"Weight shifted left",severity:Math.abs(ws)>8?"high":"mod",icon:"⊖"}); }
  if(g(0)&&hipMid){ const dev=(g(0).x-hipMid.x)*100; angles.spinalDev=dev; if(Math.abs(dev)>4) findings.push({text:dev>0?"Spinal deviation tendency (right)":"Spinal deviation tendency (left)",severity:Math.abs(dev)>8?"high":"mod",icon:"〜"}); }
  if(g(25)&&g(26)){ const kd=(g(25).y-g(26).y)*100; if(Math.abs(kd)>2) findings.push({text:kd>0?"Right knee appears higher":"Left knee appears higher",severity:"mod",icon:"⇕"}); }
  return { findings, angles, view:"posterior" };
}
function runSymmetryAnalysis(lm) {
  const g=i=>lm[i];
  return [[11,12,"Shoulder"],[23,24,"Hip"],[25,26,"Knee"],[27,28,"Ankle"],[15,16,"Wrist"]].map(([l,r,label])=>{
    const lv=g(l)?.visibility||0,rv=g(r)?.visibility||0;
    if(lv<0.4||rv<0.4) return null;
    const hd=((g(l)?.y||0)-(g(r)?.y||0))*100, ld=Math.abs((g(l)?.x||0)-(g(r)?.x||0))*100;
    return { label, heightDiff:Math.round(hd*10)/10, lateralDiff:Math.round(ld*10)/10, symmetric:Math.abs(hd)<2 };
  }).filter(Boolean);
}

// ─── GravityLineRenderer ──────────────────────────────────────────────────────
function GravityLineRenderer({ ctx, w, h, landmarks }) {
  if(!ctx||!landmarks) return;
  const g=i=>landmarks[i];
  const vis=i=>(landmarks[i]?.visibility||0)>0.45;
  const px=lm=>[lm.x*w, lm.y*h];

  // Gravity / plumb line
  let gravX=w/2;
  if(vis(23)&&vis(24)) {
    const hipMid=midpoint(g(23),g(24));
    if(hipMid) gravX=hipMid.x*w;
  }
  ctx.save();
  ctx.setLineDash([8,6]);
  ctx.strokeStyle="rgba(0,229,255,0.35)";
  ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(gravX,0); ctx.lineTo(gravX,h); ctx.stroke();

  // Grid overlay
  ctx.strokeStyle="rgba(255,255,255,0.04)";
  ctx.lineWidth=0.5;
  ctx.setLineDash([]);
  for(let x=0;x<=w;x+=w/6){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<=h;y+=h/8){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

  // Shoulder symmetry line
  if(vis(11)&&vis(12)){
    const [lx,ly]=px(g(11)),[rx,ry]=px(g(12));
    ctx.strokeStyle="rgba(127,90,240,0.6)"; ctx.lineWidth=1.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(rx,ry); ctx.stroke();
    const mx=(lx+rx)/2,my=(ly+ry)/2;
    ctx.beginPath(); ctx.arc(mx,my,3,0,Math.PI*2); ctx.fillStyle="rgba(127,90,240,0.8)"; ctx.fill();
  }

  // Hip symmetry line
  if(vis(23)&&vis(24)){
    const [lx,ly]=px(g(23)),[rx,ry]=px(g(24));
    ctx.strokeStyle="rgba(0,201,122,0.6)"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(rx,ry); ctx.stroke();
    const mx=(lx+rx)/2,my=(ly+ry)/2;
    ctx.beginPath(); ctx.arc(mx,my,3,0,Math.PI*2); ctx.fillStyle="rgba(0,201,122,0.8)"; ctx.fill();
  }

  // Spine center line
  if(vis(11)&&vis(12)&&vis(23)&&vis(24)){
    const shM=midpoint(g(11),g(12)),hipM=midpoint(g(23),g(24));
    ctx.strokeStyle="rgba(255,179,0,0.5)"; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(shM.x*w,shM.y*h); ctx.lineTo(hipM.x*w,hipM.y*h); ctx.stroke();
  }
  ctx.restore();
}

// ─── HeatmapEngine ────────────────────────────────────────────────────────────
function HeatmapEngine({ ctx, w, h, landmarks, measurements }) {
  if(!ctx||!landmarks||!measurements) return;
  const hotspots=[];
  const g=i=>landmarks[i];
  const vis=i=>(landmarks[i]?.visibility||0)>0.45;

  if(measurements.shoulderAsymm!==null&&Math.abs(measurements.shoulderAsymm)>4){
    const elevated=measurements.shoulderAsymm>0?11:12;
    if(vis(elevated)) hotspots.push({x:g(elevated).x*w,y:g(elevated).y*h,r:40,intensity:Math.min(1,Math.abs(measurements.shoulderAsymm)/15)});
  }
  if(measurements.pelvisAngle!==null&&Math.abs(measurements.pelvisAngle)>3){
    const elevated=measurements.pelvisAngle>0?23:24;
    if(vis(elevated)) hotspots.push({x:g(elevated).x*w,y:g(elevated).y*h,r:50,intensity:Math.min(1,Math.abs(measurements.pelvisAngle)/12)});
  }
  if(measurements.headTilt!==null&&Math.abs(measurements.headTilt)>2&&vis(0)){
    hotspots.push({x:g(0).x*w,y:g(0).y*h,r:35,intensity:Math.min(1,Math.abs(measurements.headTilt)/10)});
  }

  ctx.save();
  hotspots.forEach(({x,y,r,intensity})=>{
    const grad=ctx.createRadialGradient(x,y,0,x,y,r);
    const alpha=intensity*0.4;
    grad.addColorStop(0,`rgba(255,77,109,${alpha})`);
    grad.addColorStop(0.5,`rgba(255,179,0,${alpha*0.5})`);
    grad.addColorStop(1,"rgba(255,77,109,0)");
    ctx.fillStyle=grad;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

// ─── LandmarkLabels renderer ──────────────────────────────────────────────────
function drawLandmarkLabels(ctx, w, h, landmarks) {
  if(!ctx||!landmarks) return;
  const LABELS={0:"Head",11:"L.Shoulder",12:"R.Shoulder",23:"L.Hip",24:"R.Hip",25:"L.Knee",26:"R.Knee",27:"L.Ankle",28:"R.Ankle",31:"L.Foot",32:"R.Foot"};
  ctx.save();
  ctx.font="bold 9px system-ui";
  Object.entries(LABELS).forEach(([idx,name])=>{
    const lm=landmarks[Number(idx)];
    if(!lm||lm.visibility<0.5) return;
    const x=lm.x*w, y=lm.y*h;
    const offsetY=idx==="0"?-14:-10;
    ctx.fillStyle="rgba(6,9,15,0.7)";
    const tw=ctx.measureText(name).width;
    ctx.fillRect(x-tw/2-2,y+offsetY-9,tw+4,12);
    ctx.fillStyle=lm.visibility>0.75?"#00e5ff":lm.visibility>0.5?"#ffb300":"#ff4d6d";
    ctx.textAlign="center";
    ctx.fillText(name,x,y+offsetY);
  });
  ctx.restore();
}

// ─── AlignmentRenderer (upgraded — uses GravityLineRenderer + HeatmapEngine + Labels) ──
function AlignmentRenderer({ canvasRef, landmarks, videoSize, view, showHeatmap, showLabels }) {
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas||!landmarks||!videoSize) return;
    const ctx=canvas.getContext("2d");
    const {w,h}=videoSize;
    const measurements=MeasurementEngine(landmarks);
    GravityLineRenderer({ctx,w,h,landmarks});
    if(showHeatmap) HeatmapEngine({ctx,w,h,landmarks,measurements});
    if(showLabels) drawLandmarkLabels(ctx,w,h,landmarks);
  },[landmarks,videoSize,view,showHeatmap,showLabels,canvasRef]);
  return null;
}

// ─── MeasurementPanel — real-time clinical measurement display ────────────────
function MeasurementPanel({ measurements, reliability }) {
  if(!measurements) return null;
  const M=[
    { key:"headTilt",      label:"Head Tilt",         unit:"% offset",   thresh:[2,5]  },
    { key:"shoulderAsymm", label:"Shoulder Asymmetry", unit:"°",          thresh:[4,8]  },
    { key:"pelvisAngle",   label:"Pelvic Tilt",        unit:"°",          thresh:[3,7]  },
    { key:"trunkShift",    label:"Trunk Shift",        unit:"% offset",   thresh:[3,7]  },
    { key:"leftKneeAngle", label:"L. Knee Angle",      unit:"°",          thresh:[null] },
    { key:"rightKneeAngle",label:"R. Knee Angle",      unit:"°",          thresh:[null] },
    { key:"spinalDev",     label:"Spinal Deviation",   unit:"% offset",   thresh:[4,8]  },
    { key:"lateralLoad",   label:"Lateral Load",       unit:"% offset",   thresh:[4,8]  },
  ];
  return (
    <div style={{background:"#0d1117",border:"1px solid #1a2d45",borderRadius:12,padding:"10px 13px",marginBottom:10}}>
      <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
        📐 Live Measurements
        <span style={{marginLeft:"auto",fontSize:"0.6rem",padding:"2px 7px",borderRadius:8,background:reliability?.score>75?"rgba(0,201,122,0.15)":reliability?.score>50?"rgba(255,179,0,0.15)":"rgba(255,77,109,0.15)",color:reliability?.score>75?"#00c97a":reliability?.score>50?"#ffb300":"#ff4d6d",border:`1px solid ${reliability?.score>75?"rgba(0,201,122,0.3)":reliability?.score>50?"rgba(255,179,0,0.3)":"rgba(255,77,109,0.3)"}`}}>
          Reliability: {reliability?.status||"—"}
        </span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:6}}>
        {M.map(({key,label,unit,thresh})=>{
          const val=measurements[key];
          if(val===null||val===undefined) return null;
          const abs=Math.abs(val);
          const col=thresh[0]===null?"#00e5ff":abs<thresh[0]?"#00c97a":thresh[1]&&abs<thresh[1]?"#ffb300":"#ff4d6d";
          const deg=Math.round(val*10)/10;
          return(
            <div key={key} style={{background:`${col}0d`,border:`1px solid ${col}28`,borderRadius:9,padding:"7px 10px"}}>
              <div style={{fontSize:"0.58rem",fontWeight:700,color:"#6b8399",marginBottom:3}}>{label}</div>
              <div style={{fontSize:"1rem",fontWeight:800,color:col,lineHeight:1}}>{deg>0?"+":""}{deg}</div>
              <div style={{fontSize:"0.55rem",color:"#6b8399"}}>{unit}</div>
              <div style={{marginTop:4,height:2,borderRadius:2,background:"#1a2d45"}}>
                <div style={{height:"100%",width:`${Math.min(100,abs/(thresh[1]||10)*100)}%`,background:col,borderRadius:2,transition:"width 0.3s"}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BilateralBalancePanel ─────────────────────────────────────────────────────
function BilateralBalancePanel({ measurements, symmetry }) {
  if(!symmetry||symmetry.length===0) return null;
  return(
    <div style={{background:"#0d1117",border:"1px solid #1a2d45",borderRadius:12,padding:"10px 13px",marginBottom:10}}>
      <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>⚖ Bilateral Balance — Left vs Right</div>
      {symmetry.map((s,i)=>{
        const col=s.symmetric?"#00c97a":Math.abs(s.heightDiff)>5?"#ff4d6d":"#ffb300";
        const pct=Math.min(100,Math.abs(s.heightDiff)*10);
        const leftPct=s.heightDiff>0?50+pct/2:50-pct/2, rightPct=100-leftPct;
        return(
          <div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:"0.67rem",fontWeight:700,color:col}}>{s.label}</span>
              <span style={{fontSize:"0.6rem",color:"#6b8399"}}>Δ{s.heightDiff>0?"+":""}{s.heightDiff}%</span>
            </div>
            <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",background:"#131c28"}}>
              <div style={{width:`${leftPct}%`,background:s.heightDiff>0?col:"#1a2d45",borderRadius:"4px 0 0 4px",transition:"width 0.3s"}}/>
              <div style={{width:"2px",background:"#00e5ff",flexShrink:0}}/>
              <div style={{width:`${rightPct}%`,background:s.heightDiff<0?col:"#1a2d45",borderRadius:"0 4px 4px 0",transition:"width 0.3s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
              <span style={{fontSize:"0.55rem",color:"#6b8399"}}>LEFT</span>
              <span style={{fontSize:"0.55rem",color:"#6b8399"}}>RIGHT</span>
            </div>
          </div>
        );
      })}
      {measurements?.lateralLoad!==null&&measurements?.lateralLoad!==undefined&&(
        <div style={{marginTop:8,padding:"6px 10px",background:"rgba(0,229,255,0.06)",border:"1px solid rgba(0,229,255,0.15)",borderRadius:8,fontSize:"0.68rem",color:"#d4e0f0"}}>
          Lateral Load Tendency: <strong style={{color:Math.abs(measurements.lateralLoad)>4?"#ffb300":"#00c97a"}}>{measurements.lateralLoad>0?"Right":"Left"} {Math.round(Math.abs(measurements.lateralLoad)*10)/10}%</strong>
        </div>
      )}
    </div>
  );
}

// ─── SymmetryPanel ────────────────────────────────────────────────────────────
function SymmetryPanel({ data }) {
  if(!data||data.length===0) return null;
  return(
    <div style={{background:"#0d1117",border:"1px solid #1a2d45",borderRadius:10,padding:"9px 12px",marginBottom:10}}>
      <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Symmetry Analysis — L vs R</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:6}}>
        {data.map((s,i)=>{
          const col=s.symmetric?"#00c97a":Math.abs(s.heightDiff)>5?"#ff4d6d":"#ffb300";
          return(
            <div key={i} style={{padding:"6px 9px",background:`${col}0e`,border:`1px solid ${col}28`,borderRadius:8}}>
              <div style={{fontSize:"0.68rem",fontWeight:700,color:col,marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:"0.62rem",color:"#6b8399"}}>Height Δ: <span style={{color:col}}>{s.heightDiff>0?"+":""}{s.heightDiff}%</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PostureFeedbackSystem ────────────────────────────────────────────────────
function PostureFeedbackSystem({ findings }) {
  if(!findings||findings.length===0) return(
    <div style={{padding:"8px 12px",background:"rgba(0,201,122,0.08)",border:"1px solid rgba(0,201,122,0.22)",borderRadius:8,fontSize:"0.74rem",color:"#00c97a",fontWeight:600}}>✓ No significant deviations detected in this view</div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {findings.map((f,i)=>{
        const col=f.severity==="high"?"#ff4d6d":"#ffb300";
        return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 11px",background:`${col}12`,border:`1px solid ${col}30`,borderRadius:8,fontSize:"0.73rem",fontWeight:600,color:col}}>
            <span style={{fontSize:"0.85rem"}}>{f.icon}</span><span>{f.text}</span>
            <span style={{marginLeft:"auto",fontSize:"0.6rem",opacity:0.7}}>{f.severity==="high"?"Notable":"Mild"}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── LandmarkInspector — tap landmark to see info ─────────────────────────────
function LandmarkInspector({ landmarks, measurements, videoSize, canvasRef }) {
  const [selected, setSelected] = useState(null);
  const LANDMARK_INFO={
    0:{name:"Head",desc:"Cranium position reference"},
    11:{name:"Left Shoulder",desc:"Glenohumeral joint"},12:{name:"Right Shoulder",desc:"Glenohumeral joint"},
    23:{name:"Left Hip",desc:"Hip joint center"},24:{name:"Right Hip",desc:"Hip joint center"},
    25:{name:"Left Knee",desc:"Tibiofemoral joint"},26:{name:"Right Knee",desc:"Tibiofemoral joint"},
    27:{name:"Left Ankle",desc:"Talocrural joint"},28:{name:"Right Ankle",desc:"Talocrural joint"},
    31:{name:"Left Foot"},32:{name:"Right Foot"},
  };
  const handleCanvasClick=useCallback((e)=>{
    if(!landmarks||!videoSize||!canvasRef.current) return;
    const rect=canvasRef.current.getBoundingClientRect();
    const cx=(e.clientX-rect.left)/rect.width, cy=(e.clientY-rect.top)/rect.height;
    let closest=null,minDist=Infinity;
    Object.keys(LANDMARK_INFO).forEach(idx=>{
      const lm=landmarks[Number(idx)];
      if(!lm||lm.visibility<0.3) return;
      const dist=Math.sqrt((lm.x-cx)**2+(lm.y-cy)**2);
      if(dist<minDist){ minDist=dist; closest=Number(idx); }
    });
    if(closest!==null&&minDist<0.08) setSelected(closest);
    else setSelected(null);
  },[landmarks,videoSize,canvasRef]);

  useEffect(()=>{
    const c=canvasRef.current;
    if(!c) return;
    c.addEventListener("click",handleCanvasClick);
    c.style.cursor="crosshair";
    return()=>{ c.removeEventListener("click",handleCanvasClick); c.style.cursor=""; };
  },[handleCanvasClick,canvasRef]);

  if(selected===null) return null;
  const lm=landmarks[selected];
  const info=LANDMARK_INFO[selected];
  const conf=Math.round((lm?.visibility||0)*100);
  const confCol=conf>70?"#00c97a":conf>40?"#ffb300":"#ff4d6d";
  return(
    <div style={{position:"absolute",top:10,left:10,background:"rgba(6,9,15,0.92)",border:"1px solid rgba(0,229,255,0.35)",borderRadius:10,padding:"9px 12px",zIndex:20,minWidth:160}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
        <div style={{fontWeight:800,fontSize:"0.78rem",color:"#00e5ff"}}>{info?.name||`LM ${selected}`}</div>
        <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#6b8399",cursor:"pointer",fontSize:"0.8rem",padding:0,lineHeight:1}}>✕</button>
      </div>
      {info?.desc&&<div style={{fontSize:"0.62rem",color:"#6b8399",marginBottom:5}}>{info.desc}</div>}
      <div style={{fontSize:"0.62rem",color:confCol,fontWeight:700}}>Confidence: {conf}%</div>
      <div style={{fontSize:"0.6rem",color:"#6b8399",marginTop:3}}>X: {Math.round((lm?.x||0)*100)}% · Y: {Math.round((lm?.y||0)*100)}%</div>
    </div>
  );
}

// ─── SmartRepositionGuide ─────────────────────────────────────────────────────
function SmartRepositionGuide({ landmarks, quality }) {
  if(!landmarks) return null;
  const hints=[];
  const g=i=>landmarks[i];
  const vis=i=>(landmarks[i]?.visibility||0)>0.45;

  // Body too far down (feet not visible)
  if(!vis(31)&&!vis(32)) hints.push({icon:"📷",text:"Raise camera slightly — feet not visible",color:"#ffb300"});
  // Body too far up (head cut off)
  if(!vis(0)) hints.push({icon:"⬇",text:"Lower camera or step back — head not visible",color:"#ffb300"});
  // Body too far right
  if(g(11)&&g(12)){ const shMid=(g(11).x+g(12).x)/2; if(shMid>0.7) hints.push({icon:"←",text:"Shift left — body off-center",color:"#00e5ff"}); else if(shMid<0.3) hints.push({icon:"→",text:"Shift right — body off-center",color:"#00e5ff"}); }
  // Too close / too far
  if(quality?.distanceHint==="back") hints.push({icon:"⬅",text:"Move backward — too close to camera",color:"#ffb300"});
  if(quality?.distanceHint==="forward") hints.push({icon:"➡",text:"Step closer — too far from camera",color:"#ffb300"});

  if(hints.length===0) return null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
      {hints.map((h,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 11px",background:`${h.color}12`,border:`1px solid ${h.color}30`,borderRadius:9,fontSize:"0.72rem",fontWeight:700,color:h.color}}>
          <span style={{fontSize:"1rem"}}>{h.icon}</span>{h.text}
        </div>
      ))}
    </div>
  );
}

// ─── CaptureHoldTimer ─────────────────────────────────────────────────────────
function CaptureHoldTimer({ onComplete, isReady }) {
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(0);
  const HOLD=3;
  useEffect(()=>{
    if(!counting) return;
    if(count>=HOLD){ setCounting(false); setCount(0); onComplete(); return; }
    const t=setTimeout(()=>setCount(c=>c+1),1000);
    return()=>clearTimeout(t);
  },[counting,count,onComplete]);
  const start=()=>{ if(!isReady||counting) return; setCounting(true); setCount(0); };
  const cancel=()=>{ setCounting(false); setCount(0); };
  const pct=counting?(count/HOLD)*100:0;
  return(
    <div>
      {counting?(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <div style={{flex:1,height:6,background:"#1a2d45",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00e5ff,#7f5af0)",borderRadius:3,transition:"width 1s linear"}}/>
            </div>
            <span style={{fontSize:"0.78rem",fontWeight:800,color:"#00e5ff",minWidth:20}}>{HOLD-count}s</span>
          </div>
          <div style={{display:"flex",gap:7}}>
            <div style={{flex:1,padding:"10px",background:"rgba(0,229,255,0.1)",border:"1px solid rgba(0,229,255,0.3)",borderRadius:10,textAlign:"center",fontSize:"0.75rem",fontWeight:800,color:"#00e5ff"}}>⏳ Hold still… capturing in {HOLD-count}s</div>
            <button onClick={cancel} style={{padding:"10px 14px",background:"#1a2d45",border:"1px solid #1a2d45",borderRadius:10,color:"#6b8399",fontWeight:700,fontSize:"0.72rem",cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      ):(
        <button onClick={start} disabled={!isReady} style={{width:"100%",padding:"11px",background:isReady?"linear-gradient(135deg,#00e5ff,#7f5af0)":"#1a2d45",border:"none",borderRadius:10,color:isReady?"#000":"#6b8399",fontWeight:800,fontSize:"0.78rem",cursor:isReady?"pointer":"not-allowed"}}>
          {isReady?"📸 Capture Posture (3s hold)":"⏳ Waiting for stable tracking…"}
        </button>
      )}
    </div>
  );
}

// ─── ComparisonViewer ─────────────────────────────────────────────────────────
function ComparisonViewer({ baseline, followUp, onClear }) {
  if(!baseline) return null;
  return(
    <div style={{background:"#0d1117",border:"1px solid #1a2d45",borderRadius:12,padding:"11px 13px",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px"}}>📊 Before vs After Comparison</div>
        <button onClick={onClear} style={{background:"none",border:"1px solid #1a2d45",borderRadius:6,color:"#6b8399",fontSize:"0.6rem",cursor:"pointer",padding:"3px 8px"}}>Clear</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div>
          <div style={{fontSize:"0.6rem",fontWeight:700,color:"#ffb300",marginBottom:4,textAlign:"center"}}>BASELINE</div>
          <div style={{position:"relative",borderRadius:9,overflow:"hidden"}}>
            <img src={baseline.img} alt="Baseline" style={{width:"100%",display:"block",borderRadius:9}}/>
            <div style={{position:"absolute",bottom:4,left:4,background:"rgba(6,9,15,0.8)",borderRadius:5,padding:"2px 6px",fontSize:"0.58rem",color:"#ffb300",fontWeight:700}}>{baseline.time}</div>
          </div>
          {baseline.measurements&&(
            <div style={{marginTop:5,fontSize:"0.6rem",color:"#6b8399"}}>
              <div>Sh: {Math.round((baseline.measurements.shoulderAsymm||0)*10)/10}°</div>
              <div>Pelvis: {Math.round((baseline.measurements.pelvisAngle||0)*10)/10}°</div>
            </div>
          )}
        </div>
        <div>
          <div style={{fontSize:"0.6rem",fontWeight:700,color:"#00c97a",marginBottom:4,textAlign:"center"}}>{followUp?"FOLLOW-UP":"CAPTURE NEXT"}</div>
          {followUp?(
            <div style={{position:"relative",borderRadius:9,overflow:"hidden"}}>
              <img src={followUp.img} alt="Follow-up" style={{width:"100%",display:"block",borderRadius:9}}/>
              <div style={{position:"absolute",bottom:4,left:4,background:"rgba(6,9,15,0.8)",borderRadius:5,padding:"2px 6px",fontSize:"0.58rem",color:"#00c97a",fontWeight:700}}>{followUp.time}</div>
            </div>
          ):(
            <div style={{borderRadius:9,background:"rgba(0,201,122,0.06)",border:"2px dashed rgba(0,201,122,0.2)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:80,color:"rgba(0,201,122,0.4)",fontSize:"0.72rem",fontWeight:700}}>Capture follow-up</div>
          )}
          {followUp?.measurements&&baseline.measurements&&(
            <div style={{marginTop:5,fontSize:"0.6rem",color:"#6b8399"}}>
              {["shoulderAsymm","pelvisAngle"].map(k=>{
                const diff=(followUp.measurements[k]||0)-(baseline.measurements[k]||0);
                return <div key={k}>{k==="shoulderAsymm"?"Sh":"Pelvis"}: {diff>0?"+":""}{Math.round(diff*10)/10}° change</div>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AssessmentSummaryPanel ────────────────────────────────────────────────────
function AssessmentSummaryPanel({ captures, measurements, symmetry, onClose }) {
  const findings=[];
  ["anterior","lateral","posterior"].forEach(v=>{
    const c=captures[v];
    if(c?.analysis?.findings) c.analysis.findings.forEach(f=>findings.push({...f,view:v}));
  });
  const highFindings=findings.filter(f=>f.severity==="high");
  const modFindings=findings.filter(f=>f.severity==="mod");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div style={{background:"#0d1117",border:"1px solid rgba(0,229,255,0.2)",borderRadius:16,padding:20,maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:800,color:"#00e5ff",fontSize:"1rem"}}>📋 Assessment Summary</div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #1a2d45",borderRadius:7,color:"#6b8399",cursor:"pointer",padding:"4px 10px",fontSize:"0.72rem"}}>Close</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
          {["anterior","lateral","posterior"].map(v=>(
            <div key={v} style={{background:captures[v]?"rgba(0,201,122,0.08)":"rgba(255,77,109,0.08)",border:`1px solid ${captures[v]?"rgba(0,201,122,0.25)":"rgba(255,77,109,0.2)"}`,borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
              <div style={{fontSize:"0.62rem",fontWeight:700,color:captures[v]?"#00c97a":"#ff4d6d"}}>{captures[v]?"✓":"-"}</div>
              <div style={{fontSize:"0.65rem",color:"#d4e0f0",fontWeight:600,textTransform:"capitalize"}}>{v}</div>
            </div>
          ))}
        </div>
        {highFindings.length>0&&(
          <div style={{marginBottom:10}}>
            <div style={{fontSize:"0.6rem",fontWeight:700,color:"#ff4d6d",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Notable Findings ({highFindings.length})</div>
            {highFindings.map((f,i)=><div key={i} style={{padding:"6px 10px",background:"rgba(255,77,109,0.1)",border:"1px solid rgba(255,77,109,0.25)",borderRadius:7,fontSize:"0.72rem",color:"#ff4d6d",marginBottom:4,display:"flex",gap:8}}><span>{f.icon}</span><span>{f.text}</span><span style={{marginLeft:"auto",fontSize:"0.58rem",opacity:0.7,textTransform:"capitalize"}}>{f.view}</span></div>)}
          </div>
        )}
        {modFindings.length>0&&(
          <div style={{marginBottom:10}}>
            <div style={{fontSize:"0.6rem",fontWeight:700,color:"#ffb300",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Mild Findings ({modFindings.length})</div>
            {modFindings.map((f,i)=><div key={i} style={{padding:"6px 10px",background:"rgba(255,179,0,0.08)",border:"1px solid rgba(255,179,0,0.2)",borderRadius:7,fontSize:"0.72rem",color:"#ffb300",marginBottom:4,display:"flex",gap:8}}><span>{f.icon}</span><span>{f.text}</span><span style={{marginLeft:"auto",fontSize:"0.58rem",opacity:0.7,textTransform:"capitalize"}}>{f.view}</span></div>)}
          </div>
        )}
        {findings.length===0&&<div style={{padding:"12px 16px",background:"rgba(0,201,122,0.08)",border:"1px solid rgba(0,201,122,0.2)",borderRadius:9,color:"#00c97a",fontWeight:700,fontSize:"0.8rem",textAlign:"center"}}>✓ No significant postural deviations detected</div>}
        {measurements&&(
          <div style={{marginTop:10,padding:"10px 13px",background:"#131c28",borderRadius:10,border:"1px solid #1a2d45"}}>
            <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>Key Measurements</div>
            {[["shoulderAsymm","Shoulder Asymmetry","°"],["pelvisAngle","Pelvic Tilt","°"],["headTilt","Head Tilt","%"],["trunkShift","Trunk Shift","%"]].map(([k,label,u])=>{
              const v=measurements[k];
              if(v===null||v===undefined) return null;
              const abs=Math.abs(v), col=abs<3?"#00c97a":abs<7?"#ffb300":"#ff4d6d";
              return <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",padding:"4px 0",borderBottom:"1px solid #1a2d45"}}><span style={{color:"#6b8399"}}>{label}</span><span style={{color:col,fontWeight:700}}>{v>0?"+":""}{Math.round(v*10)/10}{u}</span></div>;
            })}
          </div>
        )}
        <div style={{marginTop:12,fontSize:"0.6rem",color:"#6b8399",lineHeight:1.5,padding:"6px 10px",background:"#06090f",borderRadius:7,border:"1px solid #1a2d45"}}>⚠ Observational guidance only. Not a clinical diagnosis. Findings based on 2D perspective analysis.</div>
      </div>
    </div>
  );
}

// ─── SessionHistoryPanel ───────────────────────────────────────────────────────
function SessionHistoryPanel({ sessions, onClose, onClear }) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#0d1117",border:"1px solid rgba(0,229,255,0.2)",borderRadius:16,padding:20,maxWidth:500,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:800,color:"#00e5ff",fontSize:"1rem"}}>📁 Session History</div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={onClear} style={{background:"none",border:"1px solid rgba(255,77,109,0.3)",borderRadius:7,color:"#ff4d6d",cursor:"pointer",padding:"4px 10px",fontSize:"0.7rem"}}>Clear All</button>
            <button onClick={onClose} style={{background:"none",border:"1px solid #1a2d45",borderRadius:7,color:"#6b8399",cursor:"pointer",padding:"4px 10px",fontSize:"0.7rem"}}>Close</button>
          </div>
        </div>
        {sessions.length===0?(
          <div style={{textAlign:"center",color:"#6b8399",fontSize:"0.8rem",padding:30}}>No sessions recorded yet</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[...sessions].reverse().map((s,i)=>(
              <div key={i} style={{background:"#131c28",border:"1px solid #1a2d45",borderRadius:11,padding:"10px 13px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d4e0f0"}}>{s.view?.toUpperCase()||"CAPTURE"} View</div>
                  <div style={{fontSize:"0.6rem",color:"#6b8399"}}>{s.time}</div>
                </div>
                {s.img&&<img src={s.img} alt="Session capture" style={{width:"100%",borderRadius:8,marginBottom:6}}/>}
                {s.measurements&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {["shoulderAsymm","pelvisAngle","headTilt"].map(k=>{
                      const v=s.measurements[k]; if(v===null||v===undefined) return null;
                      const abs=Math.abs(v), col=abs<3?"#00c97a":abs<7?"#ffb300":"#ff4d6d";
                      return <span key={k} style={{fontSize:"0.6rem",padding:"2px 7px",borderRadius:7,background:`${col}14`,color:col,border:`1px solid ${col}28`,fontWeight:600}}>{k==="shoulderAsymm"?"Sh":k==="pelvisAngle"?"Pelv":"Head"}: {v>0?"+":""}{Math.round(v*10)/10}</span>;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PosturePhotoCapture (upgraded — with auto-capture + comparison + history) ──
function PosturePhotoCapture({ videoRef, canvasRef, videoSize, isReady, measurements, analysis, currentView, sessionHistory }) {
  const captureCanvasRef=useRef(null);
  const [captured, setCaptured]=useState(null);
  const [capturedAt, setCapturedAt]=useState(null);
  const [baseline, setBaseline]=useState(null);
  const [followUp, setFollowUp]=useState(null);
  const [compMode, setCompMode]=useState(false);

  const doCapture=useCallback(()=>{
    const video=videoRef.current, overlayCanvas=canvasRef.current;
    if(!video||!videoSize) return;
    const {w,h}=videoSize;
    if(!captureCanvasRef.current) captureCanvasRef.current=document.createElement("canvas");
    const c=captureCanvasRef.current;
    c.width=w; c.height=h;
    const ctx=c.getContext("2d");
    ctx.drawImage(video,0,0,w,h);
    if(overlayCanvas) ctx.drawImage(overlayCanvas,0,0,w,h);
    const img=c.toDataURL("image/jpeg",0.92);
    const time=new Date().toLocaleTimeString();
    const captureData={ img, time, measurements, view:currentView, analysis };
    setCaptured(img); setCapturedAt(time);
    sessionHistory.save(captureData);
    if(compMode){
      if(!baseline){ setBaseline(captureData); }
      else{ setFollowUp(captureData); }
    }
  },[videoRef,canvasRef,videoSize,measurements,currentView,analysis,compMode,baseline,sessionHistory]);

  return(
    <div style={{background:"#0d1117",border:"1px solid #1a2d45",borderRadius:12,padding:"11px 13px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px"}}>📸 Capture</div>
        <button onClick={()=>setCompMode(m=>!m)} style={{padding:"3px 9px",background:compMode?"rgba(0,229,255,0.15)":"transparent",border:`1px solid ${compMode?"rgba(0,229,255,0.4)":"#1a2d45"}`,borderRadius:7,color:compMode?"#00e5ff":"#6b8399",fontSize:"0.62rem",fontWeight:700,cursor:"pointer"}}>
          ⇄ Compare Mode
        </button>
      </div>

      {compMode&&(
        <ComparisonViewer baseline={baseline} followUp={followUp} onClear={()=>{setBaseline(null);setFollowUp(null);setFollowUp(null);}}/>
      )}

      {!captured?(
        <CaptureHoldTimer onComplete={doCapture} isReady={isReady}/>
      ):(
        <div>
          <div style={{position:"relative",borderRadius:10,overflow:"hidden",marginBottom:8}}>
            <img src={captured} alt="Posture capture" style={{width:"100%",display:"block",borderRadius:10}}/>
            <div style={{position:"absolute",top:8,right:8,background:"rgba(6,9,15,0.8)",borderRadius:6,padding:"3px 8px",fontSize:"0.64rem",color:"#00e5ff",fontWeight:700}}>🕐 {capturedAt}</div>
            <div style={{position:"absolute",top:8,left:8,background:"rgba(6,9,15,0.8)",borderRadius:6,padding:"3px 8px",fontSize:"0.64rem",color:"#7f5af0",fontWeight:700,textTransform:"capitalize"}}>{currentView}</div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>{setCaptured(null);setCapturedAt(null);}} style={{flex:1,padding:"9px",background:"#192435",border:"1px solid #1a2d45",borderRadius:8,color:"#d4e0f0",fontWeight:700,fontSize:"0.75rem",cursor:"pointer"}}>🔄 Retake</button>
            <a href={captured} download={`posture-${currentView}-${Date.now()}.jpg`} style={{flex:1,padding:"9px",background:"linear-gradient(135deg,#00c97a,#00c97acc)",border:"none",borderRadius:8,color:"#000",fontWeight:800,fontSize:"0.75rem",cursor:"pointer",textDecoration:"none",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>⬇ Save</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StandardizedCaptureGuide ──────────────────────────────────────────────────
function StandardizedCaptureGuide({ view }) {
  const guides={
    anterior:["Camera at hip height (~1m)","2m distance from subject","Full body in frame","Arms relaxed at sides","Feet shoulder-width apart"],
    lateral:["Camera at mid-torso height","2m distance, 90° to subject","Full body profile visible","Ears, shoulder, hip, knee, ankle aligned"],
    posterior:["Camera at hip height","2m distance from behind","Full back visible","Heels together or shoulder-width"],
  };
  return(
    <div style={{background:"rgba(0,229,255,0.04)",border:"1px solid rgba(0,229,255,0.15)",borderRadius:10,padding:"9px 12px",marginBottom:10}}>
      <div style={{fontSize:"0.6rem",fontWeight:700,color:"#00e5ff",textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>📐 {view?.charAt(0).toUpperCase()+view?.slice(1)} View Setup</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {(guides[view]||[]).map((g,i)=><div key={i} style={{fontSize:"0.7rem",color:"#d4e0f0",display:"flex",gap:7,alignItems:"flex-start"}}><span style={{color:"#00e5ff",flexShrink:0}}>·</span><span style={{lineHeight:1.4}}>{g}</span></div>)}
      </div>
    </div>
  );
}

// ─── ConfidenceIndicators ─────────────────────────────────────────────────────
function ConfidenceIndicators({ reliability }) {
  if(!reliability||reliability.score===0) return null;
  const col=reliability.score>75?"#00c97a":reliability.score>50?"#ffb300":"#ff4d6d";
  return(
    <div style={{background:"#0d1117",border:"1px solid #1a2d45",borderRadius:10,padding:"9px 13px",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px"}}>🎯 Tracking Reliability</div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"#131c28",border:`2px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"0.78rem",fontWeight:800,color:col}}>{reliability.score}</span>
          </div>
          <span style={{fontSize:"0.65rem",color:col,fontWeight:700,textTransform:"capitalize"}}>{reliability.status}</span>
        </div>
      </div>
      {reliability.warnings.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:7}}>
          {reliability.warnings.map((w,i)=><div key={i} style={{display:"flex",gap:7,fontSize:"0.68rem",color:w.color,fontWeight:600}}><span>{w.icon}</span><span>{w.text}</span></div>)}
        </div>
      )}
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {Object.values(reliability.confidence).map((c,i)=>{
          const col=c.value>70?"#00c97a":c.value>40?"#ffb300":"#ff4d6d";
          return <div key={i} style={{fontSize:"0.58rem",padding:"2px 6px",borderRadius:6,background:`${col}14`,color:col,border:`1px solid ${col}28`,fontWeight:600}}>{c.name} {c.value}%</div>;
        })}
      </div>
    </div>
  );
}

// ─── PostureAnalysisEngine (v2 — upgraded orchestrator) ──────────────────────
function PostureAnalysisEngine({ landmarks, canvasRef, videoSize, videoRef }) {
  const [view, setView]=useState("anterior");
  const [showHeatmap, setShowHeatmap]=useState(false);
  const [showLabels, setShowLabels]=useState(false);
  const [showSummary, setShowSummary]=useState(false);
  const [showHistory, setShowHistory]=useState(false);
  const [viewCaptures, setViewCaptures]=useState({});
  const [collapsed, setCollapsed]=useState({ measurements:false, bilateral:false, symmetry:false });

  const sessionHistory=useSessionHistory();

  const analysis=useMemo(()=>{
    if(!landmarks) return null;
    return { anterior:runAnteriorAnalysis(landmarks), lateral:runLateralAnalysis(landmarks), posterior:runPosteriorAnalysis(landmarks), symmetry:runSymmetryAnalysis(landmarks) };
  },[landmarks]);

  const measurements=useMemo(()=>MeasurementEngine(landmarks),[landmarks]);
  const reliability=useMemo(()=>ReliabilityEngine(landmarks),[landmarks]);
  const env=useEnvironmentQuality(landmarks,videoRef);

  const current=analysis?.[view];
  const views=[{key:"anterior",label:"Anterior",icon:"⬆"},{key:"lateral",label:"Lateral",icon:"➡"},{key:"posterior",label:"Posterior",icon:"⬇"}];

  const isMobile=typeof window!=="undefined"&&window.innerWidth<640;

  // Collapsible section helper
  const Section=({id,title,children,defaultOpen=true})=>{
    const open=collapsed[id]===false?false:true;
    return(
      <div style={{marginBottom:10}}>
        <button onClick={()=>setCollapsed(c=>({...c,[id]:!open}))} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",border:"none",cursor:"pointer",padding:"6px 0",marginBottom:open?6:0}}>
          <span style={{fontSize:"0.62rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px"}}>{title}</span>
          <span style={{fontSize:"0.7rem",color:"#6b8399"}}>{open?"▲":"▼"}</span>
        </button>
        {open&&children}
      </div>
    );
  };

  return(
    <div style={{marginTop:14}}>
      <style>{`@media(max-width:640px){.posture-grid{grid-template-columns:1fr!important;}.posture-panel{padding:8px 10px!important;}}`}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11,flexWrap:"wrap"}}>
        <div style={{width:3,height:18,background:"linear-gradient(#00e5ff,#7f5af0)",borderRadius:2}}/>
        <div style={{fontSize:"0.78rem",fontWeight:800,color:"#d4e0f0"}}>Multi-View Posture Analysis</div>
        <div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap"}}>
          <button onClick={()=>setShowHeatmap(h=>!h)} style={{padding:"4px 9px",background:showHeatmap?"rgba(255,77,109,0.15)":"transparent",border:`1px solid ${showHeatmap?"rgba(255,77,109,0.4)":"#1a2d45"}`,borderRadius:7,color:showHeatmap?"#ff4d6d":"#6b8399",fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>🌡 Heat</button>
          <button onClick={()=>setShowLabels(l=>!l)} style={{padding:"4px 9px",background:showLabels?"rgba(0,229,255,0.15)":"transparent",border:`1px solid ${showLabels?"rgba(0,229,255,0.4)":"#1a2d45"}`,borderRadius:7,color:showLabels?"#00e5ff":"#6b8399",fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>🏷 Labels</button>
          <button onClick={()=>setShowSummary(true)} style={{padding:"4px 9px",background:"rgba(0,201,122,0.12)",border:"1px solid rgba(0,201,122,0.3)",borderRadius:7,color:"#00c97a",fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>📋 Summary</button>
          <button onClick={()=>setShowHistory(true)} style={{padding:"4px 9px",background:"rgba(127,90,240,0.12)",border:"1px solid rgba(127,90,240,0.3)",borderRadius:7,color:"#7f5af0",fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>📁 History</button>
        </div>
      </div>

      {/* View selector */}
      <div style={{display:"flex",gap:6,marginBottom:10,background:"#0d1117",borderRadius:10,padding:4,border:"1px solid #1a2d45"}}>
        {views.map(v=>(
          <button key={v.key} onClick={()=>setView(v.key)} style={{flex:1,padding:"8px 6px",background:view===v.key?"linear-gradient(135deg,rgba(0,229,255,0.18),rgba(127,90,240,0.18))":"transparent",border:view===v.key?"1px solid rgba(0,229,255,0.3)":"1px solid transparent",borderRadius:7,color:view===v.key?"#00e5ff":"#6b8399",fontWeight:view===v.key?800:600,fontSize:isMobile?"0.68rem":"0.72rem",cursor:"pointer",transition:"all 0.18s"}}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Standardized guide */}
      <StandardizedCaptureGuide view={view}/>

      {/* Reposition guidance */}
      <SmartRepositionGuide landmarks={landmarks} quality={reliability}/>

      {/* Environment warnings */}
      {env.warnings.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
          {env.warnings.map((w,i)=>(
            <div key={i} style={{display:"flex",gap:8,padding:"6px 11px",background:`${w.color}12`,border:`1px solid ${w.color}30`,borderRadius:8,fontSize:"0.72rem",color:w.color,fontWeight:600}}>
              <span>{w.icon}</span><span>{w.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Alignment rendering */}
      <AlignmentRenderer canvasRef={canvasRef} landmarks={landmarks} videoSize={videoSize} view={view} showHeatmap={showHeatmap} showLabels={showLabels}/>

      {/* Landmark inspector */}
      <div style={{position:"relative"}}>
        <LandmarkInspector landmarks={landmarks} measurements={measurements} videoSize={videoSize} canvasRef={canvasRef}/>
      </div>

      {/* Confidence */}
      <ConfidenceIndicators reliability={reliability}/>

      {/* Measurements */}
      <Section id="measurements" title="📐 Live Measurements">
        <MeasurementPanel measurements={measurements} reliability={reliability}/>
      </Section>

      {/* Findings */}
      <div style={{marginBottom:10}}>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>{view.charAt(0).toUpperCase()+view.slice(1)} View Findings</div>
        <PostureFeedbackSystem findings={current?.findings}/>
      </div>

      {/* Angle readouts */}
      {current?.angles&&Object.keys(current.angles).length>0&&(
        <div style={{background:"#0d1117",border:"1px solid #1a2d45",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
          <div style={{fontSize:"0.6rem",fontWeight:700,color:"#6b8399",textTransform:"uppercase",letterSpacing:"1px",marginBottom:7}}>Calculated Angles / Deviations</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {Object.entries(current.angles).map(([k,v])=>{
              if(v===null||v===undefined) return null;
              const deg=Math.round(v*10)/10;
              const col=Math.abs(deg)<3?"#00c97a":Math.abs(deg)<7?"#ffb300":"#ff4d6d";
              const label=k.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase());
              return <div key={k} style={{fontSize:"0.64rem",padding:"3px 9px",borderRadius:8,background:`${col}12`,color:col,border:`1px solid ${col}28`,fontWeight:600}}>{label}: {deg>0?"+":""}{deg}</div>;
            })}
          </div>
        </div>
      )}

      {/* Bilateral balance */}
      <Section id="bilateral" title="⚖ Bilateral Balance">
        <BilateralBalancePanel measurements={measurements} symmetry={analysis?.symmetry}/>
      </Section>

      {/* Symmetry */}
      <Section id="symmetry" title="↔ Symmetry Analysis">
        <SymmetryPanel data={analysis?.symmetry}/>
      </Section>

      {/* Photo capture */}
      <PosturePhotoCapture videoRef={videoRef} canvasRef={canvasRef} videoSize={videoSize} isReady={true} measurements={measurements} analysis={current} currentView={view} sessionHistory={sessionHistory}/>

      {/* Summary modal */}
      {showSummary&&<AssessmentSummaryPanel captures={viewCaptures} measurements={measurements} symmetry={analysis?.symmetry} onClose={()=>setShowSummary(false)}/>}

      {/* History modal */}
      {showHistory&&<SessionHistoryPanel sessions={sessionHistory.sessions} onClose={()=>setShowHistory(false)} onClear={()=>{sessionHistory.clear();}}/>}

      {/* Disclaimer */}
      <div style={{marginTop:8,fontSize:"0.6rem",color:"#6b8399",padding:"6px 10px",background:"#06090f",borderRadius:7,border:"1px solid #1a2d45",lineHeight:1.5}}>
        ⚠ Observational guidance only. Not a clinical diagnosis. Findings are based on 2D camera perspective and may not reflect true 3D alignment.
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("subjective");
  const [data, setData] = useState({});
  const [showDx, setShowDx] = useState(false);
  const [dx, setDx] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const [expandedDx, setExpandedDx] = useState({});

  const [navOpen, setNavOpen] = useState(false);

  const set = useCallback((id, val) => setData(p=>({...p,[id]:val})), []);
  const sections = Object.entries(ALL_TESTS);
  const currentSection = ALL_TESTS[active];
  const completedCount = Object.keys(data).filter(k=>data[k]&&data[k]!=="").length;

  const runDx = () => { setDx(generateDiagnosis(data)); setShowDx(true); };
  const navTo = (key) => { setActive(key); setNavOpen(false); };

  const Field = useCallback(({t})=>{
    const base = { width:"100%", background:C.s3, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontFamily:"inherit", outline:"none", padding:"8px 10px", fontSize:"0.8rem" };
    const val = data[t.id]||"";

    if(t.type==="bilateral_num"){
      return (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["_left","LEFT"],["_right","RIGHT"]].map(([sfx,side])=>{
            const sv=data[t.id+sfx]||"",num=parseFloat(sv);
            const col=isNaN(num)?C.muted:num<(t.normal||0)*0.8?C.red:num<(t.normal||0)*0.9?C.yellow:C.green;
            return(
              <div key={sfx}>
                <div style={{fontSize:"0.62rem",fontWeight:700,color:col,marginBottom:3}}>{side} {!isNaN(num)&&num<(t.normal||0)*0.8?"⚠ LIMITED":""}</div>
                <input type="number" value={sv} onChange={e=>set(t.id+sfx,e.target.value)} placeholder={`N=${t.normal||""}°`} style={{...base,borderColor:!isNaN(num)&&num<(t.normal||0)*0.8?C.red:C.border}} />
              </div>
            );
          })}
        </div>
      );
    }
    if(t.type==="bilateral_select"){
      const isProb=v=>v&&(v.includes("Positive")||v.includes("Inhibited")||v.includes("tightness")||v.includes("Significant")||v.includes("Abnormal"));
      return(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["_left","LEFT"],["_right","RIGHT"]].map(([sfx,side])=>{
            const sv=data[t.id+sfx]||"",prob=isProb(sv);
            return(
              <div key={sfx}>
                <div style={{fontSize:"0.62rem",fontWeight:700,color:prob?C.red:C.muted,marginBottom:3}}>{side} {prob?"⚠":""}</div>
                <select value={sv} onChange={e=>set(t.id+sfx,e.target.value)} style={{...base,borderColor:prob?C.red:C.border}}>
                  <option value="">— select —</option>
                  {t.options.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      );
    }
    if(t.type==="select"||t.type==="select3"){
      const prob=val&&(val.includes("Positive")||val.includes("REFER")||val.includes("Inhibited")||val.includes("Absent")||val.includes("Severe")||val.includes("Moderate")||val.includes("Significant"));
      return(<select value={val} onChange={e=>set(t.id,e.target.value)} style={{...base,borderColor:prob?C.red:C.border}}><option value="">— select —</option>{t.options.map(o=><option key={o} value={o}>{o}</option>)}</select>);
    }
    if(t.type==="textarea") return(<textarea value={val} onChange={e=>set(t.id,e.target.value)} placeholder={t.placeholder||""} style={{...base,resize:"vertical",minHeight:64,display:"block"}}/>);
    if(t.type==="num") return(<input type="number" value={val} onChange={e=>set(t.id,e.target.value)} placeholder={t.placeholder||""} style={base}/>);
    return(<input type={t.type||"text"} value={val} onChange={e=>set(t.id,e.target.value)} placeholder={t.placeholder||""} style={base}/>);
  },[data,set]);

  const sysColors={NKT:C.blue,Cyriax:C.yellow,FMS:C.green,Posture:C.purple,"Kinetic Chain":C.accent,Fascia:"#f97316","Muscle Activation":C.purple,Structural:C.red};

  // shared sidebar list renderer used by both desktop sidebar and mobile drawer
  const SidebarItems = ({ onNav }) => (
    <>
      {sections.map(([key,sec])=>{
        const allT=Object.values(sec.groups).flat().filter(t=>typeof t==="object"&&t.id);
        const nktT=key==="nkt"?Object.values(NKT_REGIONS).flatMap(r=>r.tests).map(t=>t.id):[];
        const kcT=key==="kinetic"?Object.values(KC_REGIONS).flatMap(r=>r.tests).map(t=>t.id):[];
        const fmaKeys=key==="fma"?Object.keys(MOVEMENTS).map(m=>`fma_${m}`):[];
        const subjKeys=key==="subjective"?Object.values(SUBJECTIVE_SECTIONS).flatMap(s=>s.fields.map(f=>f.id)):[];
        const subjFilled=subjKeys.filter(id=>data[id]&&data[id]!=="").length;
        const neuroKeys=key==="neuro"?[...DERMATOMES.flatMap(d=>[d.id+"_left",d.id+"_right"]),...REFLEXES.flatMap(r=>[r.id+"_left",r.id+"_right"]),...NEURAL_TENSION.flatMap(nt=>[nt.id+"_left",nt.id+"_right"]),...RED_FLAGS_NEURO.map(rf=>rf.id)]:[];
        const neuroFilled=neuroKeys.filter(id=>data[id]&&data[id]!=="").length;
        const filled=allT.filter(t=>data[t.id+"_left"]||data[t.id+"_right"]||data[t.id]).length+nktT.filter(id=>data[id]).length+kcT.filter(id=>data[id]).length+fmaKeys.filter(id=>data[id]).length+subjFilled+neuroFilled;
        const subjTotal=key==="subjective"?Object.values(SUBJECTIVE_SECTIONS).reduce((s,sec)=>s+sec.fields.length,0):0;
        const neuroTotal=key==="neuro"?neuroKeys.length:0;
        const total=allT.length+(key==="nkt"?nktT.length:0)+(key==="kinetic"?kcT.length:0)+(key==="fma"?Object.keys(MOVEMENTS).length:0)+subjTotal+neuroTotal;
        const pct=total>0?Math.round(filled/total*100):0;
        const isAct=active===key;
        return(
          <div key={key} onClick={()=>onNav(key)} style={{padding:"10px 12px",cursor:"pointer",margin:"1px 4px",borderRadius:8,background:isAct?"rgba(0,229,255,0.08)":"transparent",border:`1px solid ${isAct?"rgba(0,229,255,0.25)":"transparent"}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:"0.88rem"}}>{sec.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"0.75rem",fontWeight:isAct?700:500,color:isAct?C.accent:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sec.label}</div>
                <div style={{marginTop:3,height:2,borderRadius:2,background:C.s3}}><div style={{height:"100%",width:`${pct}%`,background:pct===100?C.green:pct>50?C.yellow:C.accent,borderRadius:2}}/></div>
              </div>
              <span style={{fontSize:"0.56rem",color:C.muted,flexShrink:0}}>{pct}%</span>
            </div>
          </div>
        );
      })}
      <div style={{margin:"10px 8px"}}>
        <button onClick={runDx} style={{width:"100%",padding:"11px",background:`linear-gradient(135deg,${C.accent},${C.a2})`,border:"none",borderRadius:8,color:"#000",fontWeight:800,fontSize:"0.76rem",cursor:"pointer"}}>▶ DIAGNOSE</button>
      </div>
    </>
  );

  return(
    <div className="pm-shell" style={{background:C.bg,color:C.text,fontFamily:"'SF Pro Display','Helvetica Neue',system-ui,sans-serif"}}>
      <MobileStyleInjector/>

      {/* Info Modal */}
      {infoModal&&(
        <div onClick={()=>setInfoModal(null)} className="pm-modal-wrap" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} className="pm-modal-box" style={{background:C.surface,border:`1px solid ${C.accent}40`,borderRadius:14,padding:24,maxWidth:500,width:"100%",maxHeight:"82vh",overflowY:"auto"}}>
            <div style={{fontWeight:800,color:C.accent,marginBottom:14,fontSize:"1rem"}}>{infoModal.label}</div>
            {infoModal.sig&&<div style={{marginBottom:12}}><div style={{fontSize:"0.62rem",fontWeight:700,color:C.a3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>📊 Significance</div><div style={{background:C.s2,borderRadius:8,padding:12,fontSize:"0.8rem",color:C.text,lineHeight:1.7}}>{infoModal.sig}</div></div>}
            {infoModal.how&&<div style={{marginBottom:16}}><div style={{fontSize:"0.62rem",fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>👐 How to Perform</div><div style={{background:C.s2,borderRadius:8,padding:12,fontSize:"0.8rem",color:C.text,lineHeight:1.7}}>{infoModal.how}</div></div>}
            <button onClick={()=>setInfoModal(null)} style={{padding:"10px 20px",background:C.a2,border:"none",borderRadius:8,color:"#fff",fontWeight:700,cursor:"pointer",width:"100%",fontSize:"0.85rem"}}>Close</button>
          </div>
        </div>
      )}

      {/* Mobile nav overlay */}
      {navOpen&&<div className="pm-nav-overlay" onClick={()=>setNavOpen(false)}/>}

      {/* Mobile nav drawer */}
      <div className={`pm-nav-drawer${navOpen?" open":""}`}>
        <div style={{padding:"0 8px"}}>
          <SidebarItems onNav={navTo}/>
        </div>
      </div>

      {/* Header */}
      <div className="pm-header" style={{background:`linear-gradient(135deg,${C.surface},${C.s2})`,borderBottom:`1px solid ${C.border}`,padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
        <div className="pm-header-inner" style={{maxWidth:1400,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <button className="pm-hamburger" onClick={()=>setNavOpen(o=>!o)} aria-label="Open navigation">☰</button>
            <div style={{width:32,height:32,background:`linear-gradient(135deg,${C.accent},${C.a2})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>⚕</div>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:800,fontSize:"clamp(0.78rem,3vw,0.95rem)",background:`linear-gradient(90deg,${C.accent},${C.a2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap"}}>PhysioMaster Pro v4</div>
              <div className="pm-logo-sub" style={{fontSize:"0.53rem",color:C.muted,letterSpacing:"0.5px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>NKT · CYRIAX · FMS · POSTURE · KINETIC CHAIN · FASCIA · MUSCLE ACTIVATION</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <span style={{fontSize:"0.68rem",color:C.muted,whiteSpace:"nowrap"}}><span style={{color:C.accent,fontWeight:700}}>{completedCount}</span> fields</span>
            <button onClick={runDx} style={{padding:"7px 13px",background:`linear-gradient(135deg,${C.accent},${C.a2})`,border:"none",borderRadius:8,color:"#000",fontWeight:800,fontSize:"0.75rem",cursor:"pointer",whiteSpace:"nowrap"}}>▶ Dx</button>
          </div>
        </div>
      </div>

      <div className="pm-body" style={{display:"flex",flex:1,maxWidth:1400,margin:"0 auto",width:"100%"}}>

        {/* Desktop Sidebar */}
        <div className="pm-sidebar" style={{width:195,minWidth:195,borderRight:`1px solid ${C.border}`,padding:"10px 0",background:C.surface,position:"sticky",top:54,height:"calc(100vh - 54px)",overflowY:"auto"}}>
          <SidebarItems onNav={navTo}/>
        </div>

        {/* Main */}
        <div className="pm-main" style={{flex:1,padding:20,overflowY:"auto",overflowX:"hidden",minWidth:0}}>

          {/* Diagnosis Panel */}
          {showDx&&dx&&(
            <div style={{background:C.surface,border:`1px solid ${C.accent}30`,borderRadius:14,padding:20,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:"1.05rem",fontWeight:800,color:C.accent}}>📋 Multi-System Diagnosis Report</div>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:"0.65rem",padding:"2px 8px",borderRadius:10,background:"rgba(0,229,255,0.1)",color:C.accent}}>{completedCount} fields · {dx.dx.length} diagnoses</span>
                  <button onClick={()=>setShowDx(false)} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:"0.72rem"}}>✕</button>
                </div>
              </div>
              {dx.redFlags.length>0&&(
                <div style={{background:"rgba(255,77,109,0.1)",border:`1px solid ${C.red}40`,borderRadius:10,padding:14,marginBottom:14}}>
                  <div style={{fontWeight:800,color:C.red,marginBottom:8}}>🚨 RED FLAGS</div>
                  {dx.redFlags.map((rf,i)=><div key={i} style={{padding:"5px 10px",background:"rgba(255,77,109,0.07)",borderRadius:6,marginBottom:4,fontSize:"0.76rem",color:rf.severity==="urgent"?C.red:C.yellow,fontWeight:600}}>{rf.severity==="urgent"?"🔴 URGENT: ":"🟡 REFER: "}{rf.label}</div>)}
                </div>
              )}
              {dx.dx.length===0?(
                <div style={{textAlign:"center",padding:30,color:C.muted}}><div style={{fontSize:"2rem",marginBottom:8}}>📝</div><div>Complete more assessment fields to generate a diagnosis.</div></div>
              ):(
                <>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                    {dx.dx.map(d=><span key={d.name+d.system} style={{padding:"2px 9px",borderRadius:20,fontSize:"0.66rem",fontWeight:700,background:`${sysColors[d.system]||C.accent}15`,color:sysColors[d.system]||C.accent,border:`1px solid ${sysColors[d.system]||C.accent}30`}}>✓ {d.system}</span>)}
                  </div>
                  {dx.dx.map((d,i)=>{
                    const col=sysColors[d.system]||C.accent;
                    const exp=expandedDx[i];
                    return(
                      <div key={i} style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:10,marginBottom:9,overflow:"hidden"}}>
                        <div onClick={()=>setExpandedDx(p=>({...p,[i]:!p[i]}))} style={{padding:"11px 13px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderLeft:`3px solid ${col}`}}>
                          <div>
                            <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:4}}>
                              <span style={{fontSize:"0.6rem",fontWeight:700,padding:"2px 7px",borderRadius:7,background:`${col}20`,color:col}}>{d.system}</span>
                              <span style={{fontSize:"0.6rem",fontWeight:700,padding:"2px 7px",borderRadius:7,background:d.confidence==="High"?"rgba(0,201,122,0.15)":"rgba(255,179,0,0.15)",color:d.confidence==="High"?C.green:C.yellow}}>{d.confidence}</span>
                            </div>
                            <div style={{fontWeight:700,fontSize:"0.86rem"}}>{i+1}. {d.name}</div>
                          </div>
                          <span style={{color:C.muted,fontSize:"0.75rem"}}>{exp?"▲":"▼"}</span>
                        </div>
                        {exp&&(
                          <div style={{padding:"0 13px 13px 16px"}}>
                            <div style={{marginBottom:10}}><div style={{fontSize:"0.6rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Evidence</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{d.evidence.map((e,j)=><span key={j} style={{fontSize:"0.68rem",padding:"2px 7px",borderRadius:7,background:C.s3,color:C.text,border:`1px solid ${C.border}`}}>✓ {e}</span>)}</div></div>
                            {d.mechanism&&<div style={{marginBottom:10}}><div style={{fontSize:"0.6rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Mechanism</div><div style={{background:C.s3,borderRadius:8,padding:10,fontSize:"0.76rem",color:C.text,lineHeight:1.6}}>{d.mechanism}</div></div>}
                            {d.treatment&&d.treatment.length>0&&<div><div style={{fontSize:"0.6rem",fontWeight:700,color:C.a3,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Treatment Plan</div>{d.treatment.map((t,j)=><div key={j} style={{display:"flex",gap:8,padding:"5px 9px",background:C.s3,borderRadius:7,marginBottom:4,alignItems:"flex-start"}}><span style={{color:C.a3,fontWeight:700,flexShrink:0}}>→</span><span style={{fontSize:"0.76rem",color:C.text,lineHeight:1.5}}>{t}</span></div>)}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {dx.fmsTotal!==null&&(
                    <div style={{marginTop:10,padding:12,background:C.s2,borderRadius:8,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
                      <div style={{textAlign:"center",minWidth:55}}><div style={{fontSize:"1.8rem",fontWeight:800,color:dx.fmsTotal>=17?C.green:dx.fmsTotal>=15?C.yellow:C.red}}>{dx.fmsTotal}</div><div style={{fontSize:"0.58rem",color:C.muted}}>FMS/21</div></div>
                      <div style={{fontSize:"0.76rem",color:C.muted}}>{dx.fmsTotal>=17?"✅ Low risk":dx.fmsTotal>=15?"⚠️ Moderate risk — corrective exercises":"🔴 High risk — corrective exercises before loading"}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Section header */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <span style={{fontSize:"1.3rem"}}>{currentSection.icon}</span>
              <div style={{fontSize:"1.15rem",fontWeight:800}}>{currentSection.label}</div>
            </div>
            <div style={{height:2,background:`linear-gradient(90deg,${C.accent},${C.a2},transparent)`,borderRadius:2}}/>
          </div>

          {/* Posture Camera Module — injected at top of Posture tab */}
          {active==="posture"&&(
            <div style={{marginBottom:22}}>
              <div style={{fontSize:"0.63rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                <div style={{height:1,width:10,background:C.a2}}/>
                Live Camera Analysis
                <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.border},transparent)`}}/>
              </div>
              <PostureCameraModule/>
            </div>
          )}

          {/* Groups */}
          {Object.entries(currentSection.groups).map(([groupName,tests])=>(
            <div key={groupName} style={{marginBottom:22}}>
              <div style={{fontSize:"0.63rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.a2,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                <div style={{height:1,width:10,background:C.a2}}/>
                {groupName}
                <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.border},transparent)`}}/>
              </div>

              {tests==="SUBJECTIVE_MODULE"?(
                <SubjectiveModule data={data} set={set}/>
              ):tests==="CYRIAX_MODULE"?(
                <CyriaxModule data={data} set={set}/>
              ):tests==="SPECIAL_TESTS_MODULE"?(
                <SpecialTestsSection data={data} set={set}/>
              ):tests==="NKT_REGION"?(
                <NKTSection data={data} set={set}/>
              ):tests==="FMA_REGION"?(
                <FMASection data={data} set={set}/>
              ):tests==="FASCIA_REGION"?(
                <FasciaSection data={data} set={set}/>
              ):tests==="KC_REGION"?(
                <KineticChainSection data={data} set={set}/>
              ):tests==="CYRIAX_REGION"?(
                <CyriaxRegionTests data={data} set={set}/>
              ):tests==="NEURO_MODULE"?(
                <NeurologicalModule data={data} set={set}/>
              ):tests==="ERGO_MODULE"?(
                <ErgoModule data={data} set={set}/>
              ):tests==="GAIT_MODULE"?(
                <GaitModule data={data} set={set}/>
              ):tests==="MMT_MODULE"?(
                <MMTModule data={data} set={set}/>
              ):tests==="ROM_MODULE"?(
                <ROMModule data={data} set={set}/>
              ):(
                <div style={{display:"grid",gap:8}}>
                  {tests.map(t=>{
                    const hasVal=t.type==="bilateral_num"||t.type==="bilateral_select"?(data[t.id+"_left"]||data[t.id+"_right"]):data[t.id];
                    const hasInfo=t.sig||t.how;
                    return(
                      <div key={t.id} style={{background:C.surface,border:`1px solid ${hasVal?C.accent+"22":C.border}`,borderRadius:10,padding:"10px 12px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7,gap:8}}>
                          <label style={{fontSize:"0.78rem",fontWeight:600,color:hasVal?C.text:C.muted,lineHeight:1.4,flex:1}}>
                            {t.label}{hasVal&&<span style={{color:C.green,marginLeft:5,fontSize:"0.62rem"}}>✓</span>}
                          </label>
                          {hasInfo&&<button type="button" onClick={()=>setInfoModal(t)} style={{padding:"2px 8px",background:"rgba(127,90,240,0.15)",border:`1px solid ${C.a2}40`,borderRadius:6,color:C.a2,fontSize:"0.62rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>ℹ Info</button>}
                        </div>
                        <Field t={t}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          <div style={{height:60}}/>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="pm-tabnav" aria-label="Section navigation">
        <div className="pm-tabnav-inner">
          {sections.map(([key,sec])=>(
            <button key={key} className={`pm-tabnav-btn${active===key?" active":""}`} onClick={()=>navTo(key)}>
              <span className="pm-tabnav-icon">{sec.icon}</span>
              <span className="pm-tabnav-label">{sec.label}</span>
            </button>
          ))}
          <button className="pm-tabnav-btn" onClick={runDx} style={{background:"rgba(0,229,255,0.06)"}}>
            <span className="pm-tabnav-icon">▶</span>
            <span className="pm-tabnav-label" style={{color:"#00e5ff"}}>Diagnose</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
