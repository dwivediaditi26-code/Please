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

