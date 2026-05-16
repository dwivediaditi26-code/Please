import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { C, getC } from './theme.jsx';
import { KEY_JOINTS, TRACKING_STATES, computeQuality, createSmoother, CalibrationSystem, SkeletonRenderer, BodyAlignmentGuide, TrackingStateBar, CameraView, CameraControls, CameraPositionGuide, PoseTracker } from './Clinical.jsx';

function PostureCameraModule({ activePatient, set }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const smoother   = useRef(createSmoother());
  const lostTimer  = useRef(null);
  const burstRef   = useRef(null);

  const [trackState, setTrackState] = useState(TRACKING_STATES.IDLE);
  const [isLoading,  setIsLoading]  = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [landmarks,  setLandmarks]  = useState(null);
  const [videoSize,  setVideoSize]  = useState(null);
  const [countdown,  setCountdown]  = useState(0);
  const [permError,  setPermError]  = useState(null);
  const [poseActive, setPoseActive] = useState(false);

  // Enhanced state
  const [zoom,           setZoom]           = useState(1);
  const [countdownSecs,  setCountdownSecs]  = useState(3);
  const [burstMode,      setBurstMode]      = useState(false);
  const [activeView,     setActiveView]     = useState("anterior");
  const [captureCountdown, setCaptureCountdown] = useState(null);
  const [lastCapture,    setLastCapture]       = useState(null);
  const [stabilityFrames, setStabilityFrames]   = useState(0);
  const [lightingWarn,   setLightingWarn]   = useState(false);

  // ── Multi-view capture bank: stores one capture per view ──────────────────
  const [viewCaptures, setViewCaptures] = useState({
    anterior: null, posterior: null, left: null, right: null
  }); // each: { img, lm, measurements, findings, scoreData, time }
  const [showViewBank, setShowViewBank] = useState(false);

  // ── Before / After comparison ─────────────────────────────────────────────
  const [baselineCapture, setBaselineCapture] = useState(null);  // { img, score, findings, date, view }
  const [showComparison,  setShowComparison]  = useState(false);
  // Upload photo state — for the always-visible upload button
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [uploadedPhotoLm,  setUploadedPhotoLm]  = useState(null);
  const [uploadedAnalysis, setUploadedAnalysis] = useState(null); // AI fallback analysis
  const [uploadAnalysing,  setUploadAnalysing]  = useState(false);
  const [reportPatient,    setReportPatient]    = useState("");
  const [reportClinician,  setReportClinician]  = useState("");
  const [reportExporting,  setReportExporting]  = useState(false);
  const [savedToRecord,    setSavedToRecord]    = useState(false); // confirmation flash
  const uploadObjRef = useRef(null);

  // Auto-fill patient name from active patient record
  useEffect(() => {
    if (activePatient?.data?.dem_name) setReportPatient(activePatient.data.dem_name);
    else if (activePatient?.name && activePatient.name !== "New Patient") setReportPatient(activePatient.name);
  }, [activePatient?.id]);

  const isActive = trackState !== TRACKING_STATES.IDLE;
  const quality  = landmarks ? computeQuality(landmarks) : { score:null, warnings:[], ready:false, distanceHint:null };

  // ── Lighting detection via canvas sampling ─────────────────────────────────
  const checkLighting = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    if (v.readyState < 2) return;
    const c = document.createElement("canvas");
    c.width = 32; c.height = 32;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, 32, 32);
    const d = ctx.getImageData(0, 0, 32, 32).data;
    let lum = 0;
    for (let i = 0; i < d.length; i += 4) lum += 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
    lum /= (d.length / 4);
    setLightingWarn(lum < 60 || lum > 230);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(checkLighting, 3000);
    return () => clearInterval(t);
  }, [isActive, checkLighting]);

  // ── Stability detection ────────────────────────────────────────────────────
  const prevLmRef = useRef(null);
  useEffect(() => {
    if (!landmarks) { setStabilityFrames(0); return; }
    if (!prevLmRef.current) { prevLmRef.current = landmarks; return; }
    const drift = Math.abs((landmarks[0]?.x||0) - (prevLmRef.current[0]?.x||0)) * 100
                + Math.abs((landmarks[0]?.y||0) - (prevLmRef.current[0]?.y||0)) * 100;
    prevLmRef.current = landmarks;
    setStabilityFrames(f => drift < 1.5 ? Math.min(f + 1, 30) : 0);
  }, [landmarks]);

  const isStable = stabilityFrames >= 12;

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
      // Adaptive resolution: try HD first, fall back gracefully
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:mode, width:{ideal:window.innerWidth}, height:{ideal:window.innerHeight}, frameRate:{ideal:30,max:60} }, audio:false });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:mode, width:{ideal:window.innerWidth}, height:{ideal:window.innerHeight} }, audio:false });
      }
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
    if (burstRef.current) clearInterval(burstRef.current);
    setCaptureCountdown(null);
  };

  const flipCamera = () => {
    const next = facingMode==="user" ? "environment" : "user";
    setFacingMode(next); if (isActive) { stopCamera(); setTimeout(() => startCamera(next), 200); }
  };

  // ── Generate multi-view PDF (Fix 1) ──────────────────────────────────────
  const generateMultiViewPDF = useCallback(async () => {
    setReportExporting(true);
    try {
      const date = new Date().toLocaleDateString("en-AU", { day:"2-digit", month:"long", year:"numeric" });
      const captured = Object.entries(viewCaptures).filter(([,v]) => v !== null);
      const allFindings = captured.flatMap(([,v]) => v.findings);
      const highCount = allFindings.filter(f=>f.severity==="high").length;
      const modCount  = allFindings.filter(f=>f.severity!=="high").length;
      const avgScore  = captured.length
        ? Math.round(captured.reduce((s,[,v]) => s + (v.scoreData?.score||0), 0) / captured.length) : null;
      const scoreCol  = avgScore >= 78 ? "#16a34a" : avgScore >= 62 ? "#d97706" : "#dc2626";
      const viewLabels = {anterior:"Anterior (Front)", posterior:"Posterior (Back)", left:"Left Lateral", right:"Right Lateral"};
      const viewIcons  = {anterior:"⬆", posterior:"⬇", left:"◀", right:"▶"};

      const viewSections = captured.map(([view, cap]) => {
        const sCol = (cap.scoreData?.score||0) >= 78 ? "#16a34a" : (cap.scoreData?.score||0) >= 62 ? "#d97706" : "#dc2626";
        const highF = cap.findings.filter(f=>f.severity==="high");
        const modF  = cap.findings.filter(f=>f.severity!=="high");
        return `
          <div style="break-inside:avoid;margin-bottom:20px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
            <div style="background:#f0f9ff;padding:8px 13px;border-bottom:1px solid #bae6fd;display:flex;justify-content:space-between;align-items:center;">
              <div style="font-size:13px;font-weight:800;color:#0369a1;">${viewIcons[view]} ${viewLabels[view]}</div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:9px;padding:2px 7px;border-radius:5px;background:#fee2e2;color:#b91c1c;font-weight:700;">${highF.length} HIGH</span>
                <span style="font-size:9px;padding:2px 7px;border-radius:5px;background:#fef3c7;color:#92400e;font-weight:700;">${modF.length} MOD</span>
                ${cap.scoreData?.score ? `<span style="font-size:16px;font-weight:900;color:${sCol};">${cap.scoreData?.score}</span>` : ""}
              </div>
            </div>
            <div style="display:flex;gap:12px;padding:10px 13px;">
              <img src="${cap.img}" style="width:160px;flex-shrink:0;border-radius:7px;border:1px solid #e2e8f0;object-fit:contain;background:#f8fafc;" alt="${view}"/>
              <div style="flex:1;">
                ${cap.findings.map(f => `
                  <div style="padding:5px 9px;margin-bottom:5px;border-radius:7px;border-left:3px solid ${f.severity==="high"?"#dc2626":"#d97706"};background:${f.severity==="high"?"#fff5f5":"#fffbeb"};">
                    <div style="display:flex;gap:6px;align-items:center;margin-bottom:2px;">
                      <span style="font-size:11px;">${f.icon||"●"}</span>
                      <strong style="font-size:10.5px;color:${f.severity==="high"?"#b91c1c":"#92400e"};">${f.region}</strong>
                      <span style="font-size:8px;padding:1px 5px;border-radius:4px;background:${f.severity==="high"?"#fee2e2":"#fef3c7"};color:${f.severity==="high"?"#b91c1c":"#92400e"};font-weight:700;">${f.severity.toUpperCase()}</span>
                      ${f.icd?`<span style="font-size:8px;color:#94a3b8;margin-left:auto;font-family:monospace;">${f.icd}</span>`:""}
                    </div>
                    <div style="font-size:10px;color:#374151;line-height:1.5;">${f.text}</div>
                    ${f.correction?`<div style="font-size:9px;color:#64748b;margin-top:2px;"><strong style="color:${f.severity==="high"?"#be123c":"#b45309"};">Rx: </strong>${f.correction}</div>`:""}
                  </div>`).join("")}
                ${cap.findings.length === 0 ? `<div style="color:#16a34a;font-weight:700;font-size:10.5px;padding:8px;">✅ No significant findings</div>` : ""}
              </div>
            </div>
            ${cap.measurements ? `
              <div style="padding:6px 13px 10px;border-top:1px solid #f1f5f9;">
                <div style="font-size:8.5px;font-weight:700;color:#64748b;margin-bottom:4px;">KEY MEASUREMENTS</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                  ${[
                    ["Shoulder", cap.measurements.shoulderAngle, "°"],
                    ["Pelvis/ASIS", cap.measurements.pelvisAngle, "°"],
                    ["CVA", cap.measurements.cvaAngle, "°"],
                    ["Kyphosis", cap.measurements.thoracicAngle, "°"],
                    ["Lordosis", cap.measurements.lordosisAngle, "°"],
                    ["L Knee", cap.measurements.leftKneeDev, "°"],
                    ["R Knee", cap.measurements.rightKneeDev, "°"],
                    ["CoG", cap.measurements.cogDeviation, "%"],
                  ].filter(([,v]) => v !== null && v !== undefined).map(([label,val,unit]) => {
                    const abs = Math.abs(val);
                    const col = abs < 3 ? "#16a34a" : abs < 8 ? "#d97706" : "#dc2626";
                    return `<span style="font-size:9px;padding:2px 7px;border-radius:5px;background:${col}15;color:${col};font-weight:700;">${label}: ${val>0?"+":""}${Math.round(val*10)/10}${unit}</span>`;
                  }).join("")}
                </div>
              </div>` : ""}
          </div>`;
      }).join("");

      // Before/After section
      const compSection = baselineCapture && captured.some(([v]) => v === baselineCapture.view) ? (() => {
        const cur = viewCaptures[baselineCapture.view];
        const bScore = baselineCapture.scoreData?.score;
        const cScore = cur?.scoreData?.score;
        const delta = bScore && cScore ? cScore - bScore : null;
        return `
          <div style="break-before:always;margin-bottom:20px;">
            <h2>⇄ Before / After Comparison — ${viewLabels[baselineCapture.view] || baselineCapture.view}</h2>
            <div style="display:grid;grid-template-columns:1fr 80px 1fr;gap:12px;align-items:center;margin-bottom:12px;">
              <div style="text-align:center;">
                <img src="${baselineCapture.img}" style="width:100%;border-radius:8px;border:2px solid #7f5af0;"/>
                <div style="font-size:9px;color:#6d28d9;font-weight:700;margin-top:4px;">BASELINE · ${baselineCapture.date}</div>
                ${bScore?`<div style="font-size:24px;font-weight:900;color:#6d28d9;">${bScore}</div>`:""}
              </div>
              <div style="text-align:center;">
                ${delta!==null?`<div style="font-size:24px;font-weight:900;color:${delta>=0?"#16a34a":"#dc2626"};">${delta>=0?"▲":"▼"}${Math.abs(delta)}</div><div style="font-size:9px;color:#64748b;">pts change</div>`:""}
              </div>
              <div style="text-align:center;">
                <img src="${cur.img}" style="width:100%;border-radius:8px;border:2px solid #0ea5e9;"/>
                <div style="font-size:9px;color:#0369a1;font-weight:700;margin-top:4px;">CURRENT · ${cur.time}</div>
                ${cScore?`<div style="font-size:24px;font-weight:900;color:#0369a1;">${cScore}</div>`:""}
              </div>
            </div>
          </div>`;
      })() : "";

      const metaRight = `<strong>Patient:</strong> ${reportPatient||"—"}<br/><strong>Clinician:</strong> ${reportClinician||"—"}<br/><strong>Date:</strong> ${date}<br/><strong>Views:</strong> ${captured.map(([v])=>v).join(", ")}`;
      const bodyHTML = `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;font-size:9.5px;color:#78350f;margin-bottom:14px;">
          ⚠ Observational postural assessment from static photographs. Clinical correlation required.
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:16px;">
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:9px 12px;"><div style="font-size:8px;font-weight:700;color:#0369a1;text-transform:uppercase;margin-bottom:3px;">Patient</div><div style="font-size:11px;font-weight:700;">${reportPatient||"—"}</div></div>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:9px 12px;"><div style="font-size:8px;font-weight:700;color:#0369a1;text-transform:uppercase;margin-bottom:3px;">Clinician</div><div style="font-size:11px;font-weight:700;">${reportClinician||"—"}</div></div>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:9px 12px;"><div style="font-size:8px;font-weight:700;color:#0369a1;text-transform:uppercase;margin-bottom:3px;">Views</div><div style="font-size:11px;font-weight:700;">${captured.length}/4</div></div>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:9px 12px;"><div style="font-size:8px;font-weight:700;color:#0369a1;text-transform:uppercase;margin-bottom:3px;">Avg Score</div><div style="font-size:16px;font-weight:900;color:${scoreCol};">${avgScore ?? "—"}</div></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:16px;">
          <div style="text-align:center;flex:1;padding:10px;background:#fee2e2;border-radius:8px;"><div style="font-size:28px;font-weight:900;color:#dc2626;">${highCount}</div><div style="font-size:9px;font-weight:700;color:#b91c1c;">HIGH PRIORITY</div></div>
          <div style="text-align:center;flex:1;padding:10px;background:#fef3c7;border-radius:8px;"><div style="font-size:28px;font-weight:900;color:#d97706;">${modCount}</div><div style="font-size:9px;font-weight:700;color:#92400e;">MODERATE</div></div>
          <div style="text-align:center;flex:1;padding:10px;background:#f0fdf4;border-radius:8px;"><div style="font-size:28px;font-weight:900;color:#16a34a;">${allFindings.length}</div><div style="font-size:9px;font-weight:700;color:#15803d;">TOTAL</div></div>
        </div>
        ${viewSections}
        ${compSection}
        <div style="margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;gap:30px;">
          <div style="flex:1;"><div style="height:32px;border-bottom:1px solid #94a3b8;margin-bottom:5px;"></div><div style="font-size:8.5px;color:#64748b;">Clinician Signature</div></div>
          <div style="flex:1;"><div style="height:32px;border-bottom:1px solid #94a3b8;margin-bottom:5px;"></div><div style="font-size:8.5px;color:#64748b;">Date</div></div>
        </div>`;

      const html = makePDFPage("Multi-View Postural Assessment Report", metaRight, bodyHTML);
      await downloadPDFFromHTML(html, `PostureReport_MultiView_${(reportPatient||"Patient").replace(/\s+/g,"_")}_${date.replace(/\s/g,"")}.pdf`);
    } catch(e) { console.error("Multi-view PDF:", e); }
    setReportExporting(false);
  }, [viewCaptures, baselineCapture, reportPatient, reportClinician]);

  // ── Generate single-view postural assessment PDF report ───────────────────
  const generatePostureReportPDF = useCallback(async () => {
    setReportExporting(true);
    try {
      const date = new Date().toLocaleDateString("en-AU", { day:"2-digit", month:"long", year:"numeric" });
      const viewLabel = activeView ? (activeView.charAt(0).toUpperCase() + activeView.slice(1)) : "Anterior";

      // Get annotated photo as base64 data URL
      let photoDataUrl = uploadedPhotoUrl || null;
      if (uploadedPhotoLm && uploadedPhotoUrl) {
        // Bake overlay onto photo
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = uploadedPhotoUrl;
          await new Promise(res => { img.onload = res; img.onerror = res; });
          const cc = document.createElement("canvas");
          cc.width = img.naturalWidth; cc.height = img.naturalHeight;
          const ctx = cc.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const m = AdvancedMeasurementEngine ? AdvancedMeasurementEngine(uploadedPhotoLm, null) : {};
          if (typeof renderPostureOverlay === "function") {
            renderPostureOverlay({ ctx, W:cc.width, H:cc.height, lm:uploadedPhotoLm,
              measurements:m, showHeatmap:true, showLabels:true, showGrid:true, view:activeView });
          }
          photoDataUrl = cc.toDataURL("image/jpeg", 0.88);
        } catch(e) { console.error("Bake overlay:", e); }
      }

      // Compute findings
      let findings = [];
      let measurements = {};
      let scoreData = null;
      if (uploadedPhotoLm) {
        measurements = AdvancedMeasurementEngine ? AdvancedMeasurementEngine(uploadedPhotoLm, null) : {};
        const rel = ReliabilityEngine ? ReliabilityEngine(uploadedPhotoLm) : { blocked: false };
        // QUALITY GATE: suppress findings if image quality was too low
        findings = (!rel.blocked && ClinicalFindingsEngine)
          ? ClinicalFindingsEngine(uploadedPhotoLm, activeView, measurements) : [];
        try {
          scoreData = PostureScoreEngine(measurements, findings, rel);
        } catch(e) { console.warn("PostureScoreEngine:", e); }
      } else if (uploadedAnalysis) {
        findings = uploadedAnalysis.findings || [];
      }

      const severityBadge = (s) => s === "high"
        ? `<span style="display:inline-block;padding:2px 8px;border-radius:5px;background:#fee2e2;color:#b91c1c;font-size:9px;font-weight:800;">HIGH</span>`
        : `<span style="display:inline-block;padding:2px 8px;border-radius:5px;background:#fef3c7;color:#92400e;font-size:9px;font-weight:800;">MODERATE</span>`;

      const regionBadge = (r) =>
        `<span style="display:inline-block;padding:2px 8px;border-radius:5px;background:#ede9fe;color:#6d28d9;font-size:9px;font-weight:700;">${r}</span>`;

      const highFindings  = findings.filter(f => f.severity === "high");
      const modFindings   = findings.filter(f => f.severity !== "high");

      // Score circle SVG
      const score = scoreData?.score ?? null;
      const scoreBand = scoreData?.band ?? "";
      const scoreColor = score !== null ? (score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626") : "#6b7280";
      const scoreCircleSVG = score !== null ? `
        <div style="text-align:center;margin:8px 0 16px;">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" stroke-width="8"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="${scoreColor}" stroke-width="8"
              stroke-dasharray="${(score/100)*264} 264" stroke-dashoffset="0" stroke-linecap="round"
              transform="rotate(-90 50 50)"/>
            <text x="50" y="46" text-anchor="middle" fill="${scoreColor}" font-size="22" font-weight="800" font-family="system-ui">${score}</text>
            <text x="50" y="62" text-anchor="middle" fill="#64748b" font-size="9" font-family="system-ui">${scoreBand.toUpperCase()}</text>
          </svg>
          <div style="font-size:9px;color:#64748b;margin-top:4px;">Posture Score</div>
        </div>` : "";

      // Key measurements table
      const measRows = [
        ["Shoulder Obliquity", measurements.shoulderAngle, "°", [3,7]],
        ["Pelvic Obliquity (ASIS)", measurements.pelvisAngle, "°", [3,7]],
        ["Head Lateral Offset", measurements.headLateralOffset, "%", [2,5]],
        ["Trunk Lateral Shift", measurements.trunkLateralShift, "%", [3,7]],
        ["Forward Head (CVA)", measurements.forwardHeadMm, "%", [3,7]],
        ["Cobb Estimate (Scoliosis)", measurements.cobbEstimate, "°", [5,10]],
        ["Left Knee Deviation", measurements.leftKneeDev, "°", [5,10]],
        ["Right Knee Deviation", measurements.rightKneeDev, "°", [5,10]],
        ["L Ankle Deviation", measurements.leftAnkleAngle, "°", [5,12]],
        ["R Ankle Deviation", measurements.rightAnkleAngle, "°", [5,12]],
      ].filter(([,v]) => v !== null && v !== undefined);

      const measHTML = measRows.length ? `
        <h2 style="font-size:13px;font-weight:800;color:#0369a1;border-left:4px solid #0ea5e9;padding-left:10px;margin:16px 0 8px;">📐 Postural Measurements</h2>
        <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:14px;">
          <thead>
            <tr style="background:#f0f9ff;">
              <th style="padding:6px 10px;text-align:left;color:#0369a1;font-weight:700;border-bottom:2px solid #bae6fd;">Measurement</th>
              <th style="padding:6px 10px;text-align:center;color:#0369a1;font-weight:700;border-bottom:2px solid #bae6fd;">Value</th>
              <th style="padding:6px 10px;text-align:center;color:#0369a1;font-weight:700;border-bottom:2px solid #bae6fd;">Status</th>
              <th style="padding:6px 10px;text-align:center;color:#0369a1;font-weight:700;border-bottom:2px solid #bae6fd;">Normal Range</th>
            </tr>
          </thead>
          <tbody>
            ${measRows.map(([label,val,unit,[t1,t2]],i) => {
              const abs = Math.abs(val);
              const [col, status] = abs < t1 ? ["#16a34a","Normal"] : abs < t2 ? ["#d97706","Mild"] : ["#dc2626","Significant"];
              return `<tr style="background:${i%2===0?"#ffffff":"#f8fafc"};">
                <td style="padding:5px 10px;color:#374151;font-weight:600;">${label}</td>
                <td style="padding:5px 10px;text-align:center;color:${col};font-weight:800;">${val>0?"+":""}${Math.round(val*10)/10}${unit}</td>
                <td style="padding:5px 10px;text-align:center;"><span style="padding:1px 7px;border-radius:4px;background:${col}18;color:${col};font-weight:700;font-size:8.5px;">${status}</span></td>
                <td style="padding:5px 10px;text-align:center;color:#94a3b8;font-size:9px;">&lt;${t1}${unit}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>` : "";

      // AI summary metrics (fallback)
      const aiSummaryHTML = uploadedAnalysis && !uploadedPhotoLm ? `
        <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:9px;padding:10px 13px;margin-bottom:14px;font-size:10.5px;line-height:1.7;">
          <strong style="color:#4338ca;">AI Analysis Summary:</strong> ${uploadedAnalysis.summary || ""}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
            ${uploadedAnalysis.pelvicTilt && uploadedAnalysis.pelvicTilt!=="unknown" ? `<span style="padding:2px 8px;border-radius:5px;background:#ede9fe;color:#6d28d9;font-weight:700;font-size:9px;">Pelvis: ${uploadedAnalysis.pelvicTilt}</span>` : ""}
            ${uploadedAnalysis.shoulderDeviation && uploadedAnalysis.shoulderDeviation!=="unknown" ? `<span style="padding:2px 8px;border-radius:5px;background:#dbeafe;color:#1d4ed8;font-weight:700;font-size:9px;">Shoulders: ${uploadedAnalysis.shoulderDeviation}</span>` : ""}
            ${uploadedAnalysis.kneeDeviation && uploadedAnalysis.kneeDeviation!=="unknown" ? `<span style="padding:2px 8px;border-radius:5px;background:#fef3c7;color:#92400e;font-weight:700;font-size:9px;">Knees: ${uploadedAnalysis.kneeDeviation}</span>` : ""}
            ${uploadedAnalysis.spineAlignment && uploadedAnalysis.spineAlignment!=="unknown" ? `<span style="padding:2px 8px;border-radius:5px;background:#dcfce7;color:#15803d;font-weight:700;font-size:9px;">Spine: ${uploadedAnalysis.spineAlignment}</span>` : ""}
          </div>
        </div>` : "";

      // Findings HTML
      const findingCardHTML = (f, i) => `
        <div style="background:#f8fafc;border:1px solid ${f.severity==="high"?"#fecaca":"#fde68a"};border-left:4px solid ${f.severity==="high"?"#dc2626":"#d97706"};border-radius:9px;padding:11px 14px;margin-bottom:10px;break-inside:avoid;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:14px;">${f.icon||"●"}</span>
              <strong style="font-size:11.5px;color:${f.severity==="high"?"#b91c1c":"#92400e"};">${f.region}</strong>
              ${severityBadge(f.severity)}
            </div>
            ${f.icd ? `<span style="font-size:8.5px;color:#94a3b8;font-family:monospace;">${f.icd}</span>` : ""}
          </div>
          <p style="margin:4px 0 6px;color:#374151;font-size:10.5px;line-height:1.6;">${f.text}</p>
          ${f.correction ? `<div style="background:${f.severity==="high"?"#fff1f2":"#fffbeb"};border-radius:6px;padding:7px 10px;font-size:10px;color:#374151;line-height:1.6;">
            <strong style="color:${f.severity==="high"?"#be123c":"#b45309"};">Rx: </strong>${f.correction}
          </div>` : ""}
        </div>`;

      const bodyHTML = `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;font-size:9.5px;color:#78350f;margin-bottom:14px;">
          ⚠ Observational postural assessment from static photograph. Clinical correlation required. Not a substitute for comprehensive evaluation.
        </div>

        ${/* Patient info grid */""}
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:14px;">
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:9px 12px;">
            <div style="font-size:8.5px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Patient</div>
            <div style="font-size:11px;font-weight:700;color:#111827;">${reportPatient || "—"}</div>
          </div>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:9px 12px;">
            <div style="font-size:8.5px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Clinician</div>
            <div style="font-size:11px;font-weight:700;color:#111827;">${reportClinician || "—"}</div>
          </div>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:9px 12px;">
            <div style="font-size:8.5px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">View</div>
            <div style="font-size:11px;font-weight:700;color:#111827;">${viewLabel}</div>
          </div>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:9px 12px;">
            <div style="font-size:8.5px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Date</div>
            <div style="font-size:11px;font-weight:700;color:#111827;">${date}</div>
          </div>
        </div>

        ${/* Summary row: photo + score */""}
        <div style="display:flex;gap:16px;margin-bottom:16px;align-items:flex-start;">
          ${photoDataUrl ? `<div style="flex:0 0 auto;max-width:220px;">
            <img src="${photoDataUrl}" alt="Postural assessment photo" style="width:100%;border-radius:8px;border:1px solid #e2e8f0;display:block;"/>
            <div style="text-align:center;font-size:8.5px;color:#64748b;margin-top:4px;">${viewLabel} View — ${date}</div>
          </div>` : ""}
          <div style="flex:1;">
            ${scoreCircleSVG}
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;padding:10px 13px;">
              <div style="font-size:9px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Finding Summary</div>
              <div style="display:flex;gap:10px;margin-bottom:8px;">
                <div style="text-align:center;flex:1;padding:8px;background:#fee2e2;border-radius:7px;">
                  <div style="font-size:22px;font-weight:900;color:#dc2626;">${highFindings.length}</div>
                  <div style="font-size:8.5px;color:#b91c1c;font-weight:700;">HIGH</div>
                </div>
                <div style="text-align:center;flex:1;padding:8px;background:#fef3c7;border-radius:7px;">
                  <div style="font-size:22px;font-weight:900;color:#d97706;">${modFindings.length}</div>
                  <div style="font-size:8.5px;color:#92400e;font-weight:700;">MODERATE</div>
                </div>
                <div style="text-align:center;flex:1;padding:8px;background:#f0fdf4;border-radius:7px;">
                  <div style="font-size:22px;font-weight:900;color:#16a34a;">${findings.length}</div>
                  <div style="font-size:8.5px;color:#15803d;font-weight:700;">TOTAL</div>
                </div>
              </div>
              <div style="font-size:9px;color:#64748b;line-height:1.6;">
                Regions assessed: Cervical · Shoulder Girdle · Thoracic · Lumbar/Pelvis · ASIS/PSIS · Knee · Ankle · Foot
              </div>
            </div>
          </div>
        </div>

        ${aiSummaryHTML}
        ${measHTML}

        ${highFindings.length > 0 ? `
        <h2 style="font-size:13px;font-weight:800;color:#b91c1c;border-left:4px solid #dc2626;padding-left:10px;margin:16px 0 8px;">🔴 High Priority Findings (${highFindings.length})</h2>
        ${highFindings.map(findingCardHTML).join("")}` : ""}

        ${modFindings.length > 0 ? `
        <h2 style="font-size:13px;font-weight:800;color:#92400e;border-left:4px solid #d97706;padding-left:10px;margin:16px 0 8px;">🟡 Moderate Findings (${modFindings.length})</h2>
        ${modFindings.map(findingCardHTML).join("")}` : ""}

        ${findings.length === 0 ? `<div style="text-align:center;padding:24px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;color:#15803d;font-weight:700;">✅ No significant postural deviations detected</div>` : ""}

        <div style="margin-top:24px;padding-top:14px;border-top:1px solid #e2e8f0;">
          <div style="font-size:9px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">Clinician Notes</div>
          <div style="height:60px;border:1px solid #e2e8f0;border-radius:7px;background:#f8fafc;"></div>
        </div>

        <div style="margin-top:24px;display:flex;gap:30px;border-top:1px solid #e2e8f0;padding-top:14px;">
          <div style="flex:1;"><div style="height:32px;border-bottom:1px solid #94a3b8;margin-bottom:5px;"></div><div style="font-size:8.5px;color:#64748b;">Clinician Signature</div></div>
          <div style="flex:1;"><div style="height:32px;border-bottom:1px solid #94a3b8;margin-bottom:5px;"></div><div style="font-size:8.5px;color:#64748b;">Date</div></div>
        </div>`;

      const metaRight = `<strong>Patient:</strong> ${reportPatient||"—"}<br/><strong>Clinician:</strong> ${reportClinician||"—"}<br/><strong>View:</strong> ${viewLabel}<br/><strong>Date:</strong> ${date}`;
      const html = makePDFPage("Postural Assessment Report", metaRight, bodyHTML);
      const fname = `PostureReport_${(reportPatient||"Patient").replace(/\s+/g,"_")}_${date.replace(/\s/g,"")}.pdf`;
      await downloadPDFFromHTML(html, fname);
      // Also auto-save to patient record after PDF export
      savePostureToRecord();
    } catch(e) { console.error("PDF export:", e); }
    setReportExporting(false);
  }, [uploadedPhotoUrl, uploadedPhotoLm, uploadedAnalysis, activeView, reportPatient, reportClinician]);

  // ── Save posture result to patient record (data key posture_sessions) ────
  const savePostureToRecord = useCallback(() => {
    if (!set) return; // no patient loaded
    const now = new Date().toISOString();
    const date = new Date().toLocaleDateString("en-AU", { day:"2-digit", month:"short", year:"numeric" });
    let measurements = {}, findings = [], scoreData = null;
    if (uploadedPhotoLm) {
      measurements = AdvancedMeasurementEngine ? AdvancedMeasurementEngine(uploadedPhotoLm, null) : {};
      const rel = ReliabilityEngine ? ReliabilityEngine(uploadedPhotoLm) : { blocked: false };
      findings = (!rel.blocked && ClinicalFindingsEngine)
        ? ClinicalFindingsEngine(uploadedPhotoLm, activeView, measurements) : [];
      try { scoreData = PostureScoreEngine(measurements, findings, rel); } catch(e) {}
    } else if (uploadedAnalysis) {
      findings = uploadedAnalysis.findings || [];
    }
    const sessionRecord = {
      id: `posture_${Date.now()}`,
      capturedAt: now,
      dateLabel: date,
      view: activeView,
      source: uploadedPhotoLm ? "mediapipe" : "ai_vision",
      score: scoreData?.score ?? null,
      band: scoreData?.band ?? null,
      findingsCount: findings.length,
      highCount: findings.filter(f => f.severity === "high").length,
      findings: findings.map(f => ({ region: f.region, severity: f.severity, text: f.text, icd: f.icd || null })),
      measurements: {
        shoulderAngle:      measurements.shoulderAngle      ?? null,
        pelvisAngle:        measurements.pelvisAngle        ?? null,
        headLateralOffset:  measurements.headLateralOffset  ?? null,
        trunkLateralShift:  measurements.trunkLateralShift  ?? null,
        cvaAngle:           measurements.cvaAngle           ?? null,
        cobbEstimate:       measurements.cobbEstimate       ?? null,
        leftKneeDev:        measurements.leftKneeDev        ?? null,
        rightKneeDev:       measurements.rightKneeDev       ?? null,
        cogDeviation:       measurements.cogDeviation       ?? null,
      },
      aiSummary: uploadedAnalysis?.summary ?? null,
      pelvicTilt: uploadedAnalysis?.pelvicTilt ?? null,
      shoulderDeviation: uploadedAnalysis?.shoulderDeviation ?? null,
      kneeDeviation: uploadedAnalysis?.kneeDeviation ?? null,
      spineAlignment: uploadedAnalysis?.spineAlignment ?? null,
    };
    // Read existing sessions, prepend new one, keep last 20
    const existingRaw = typeof window !== "undefined"
      ? (window.__postureSessionsCache || "[]") : "[]";
    const existing = (() => { try { return JSON.parse(existingRaw); } catch { return []; } })();
    const next = [sessionRecord, ...existing].slice(0, 20);
    window.__postureSessionsCache = JSON.stringify(next);
    set("posture_sessions", JSON.stringify(next));
    setSavedToRecord(true);
    setTimeout(() => setSavedToRecord(false), 3000);
  }, [set, uploadedPhotoLm, uploadedAnalysis, activeView]);
  // ── Core AI analysis function — reusable for upload and view-change ───────
  const runAIPostureAnalysis = useCallback(async (blobUrl, view) => {
    const VIEW_PROMPTS = {
      anterior:  "This is an ANTERIOR (front-facing) view. Assess: bilateral shoulder height symmetry, ASIS level, pelvic obliquity, Q-angle / knee valgus-varus, foot progression angle, head lateral tilt, trunk lateral shift, scoliosis pattern.",
      posterior: "This is a POSTERIOR (back-facing) view. Assess: bilateral shoulder height symmetry, PSIS level, pelvic obliquity, spinal alignment for scoliosis, scapular symmetry, popliteal crease height, heel alignment (valgus/varus), calf symmetry.",
      left:      "This is a LEFT LATERAL view. Assess: forward head posture / CVA angle, thoracic kyphosis, lumbar lordosis, anterior/posterior pelvic tilt, knee flexion/hyperextension in sagittal plane, ankle dorsiflexion posture. Do NOT report on bilateral symmetry — focus entirely on sagittal plane alignment.",
      right:     "This is a RIGHT LATERAL view. Assess: forward head posture / CVA angle, thoracic kyphosis, lumbar lordosis, anterior/posterior pelvic tilt, knee flexion/hyperextension in sagittal plane, ankle dorsiflexion posture. Do NOT report on bilateral symmetry — focus entirely on sagittal plane alignment.",
      photo:     "Detect the view from the image. Assess all relevant postural landmarks visible.",
    };
    const isLateral = view === "left" || view === "right";
    const viewInstruction = VIEW_PROMPTS[view] || VIEW_PROMPTS.anterior;

    const lateralFindingsTemplate = `
    { "region": "Forward Head Posture", "icon": "\u2194", "severity": "high|moderate", "text": "...", "correction": "..." },
    { "region": "Thoracic Kyphosis", "icon": "\u301c", "severity": "high|moderate", "text": "...", "correction": "..." },
    { "region": "Lumbar Lordosis", "icon": "\u301c", "severity": "high|moderate", "text": "...", "correction": "..." },
    { "region": "Pelvic Tilt (Sagittal)", "icon": "\u2296", "severity": "high|moderate", "text": "...", "correction": "..." },
    { "region": "Knee Alignment (Sagittal)", "icon": "\u22be", "severity": "moderate", "text": "...", "correction": "..." }`;

    const frontBackFindingsTemplate = `
    { "region": "Shoulder Girdle", "icon": "\u21d1", "severity": "high|moderate", "text": "...", "correction": "..." },
    { "region": "Pelvis / ASIS", "icon": "\u2296", "severity": "high|moderate", "text": "...", "correction": "..." },
    { "region": "Pelvis / PSIS", "icon": "\u2296", "severity": "high|moderate", "text": "...", "correction": "..." },
    { "region": "Knee Alignment", "icon": "\u22be", "severity": "moderate", "text": "...", "correction": "..." },
    { "region": "Head & Cervical", "icon": "\u2194", "severity": "moderate", "text": "...", "correction": "..." },
    { "region": "Trunk / Spine", "icon": "\u301c", "severity": "moderate", "text": "...", "correction": "..." }`;

    const findingsTemplate = isLateral ? lateralFindingsTemplate : frontBackFindingsTemplate;

    const resp = await fetch(blobUrl);
    const blob = await resp.blob();
    const base64 = await new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.readAsDataURL(blob);
    });
    const mediaType = blob.type || "image/jpeg";

    const apiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `You are a physiotherapy posture analysis AI. ${viewInstruction}\n\nReturn ONLY a JSON object (no markdown, no preamble) with this exact structure:\n{\n  "view": "${isLateral ? "lateral" : view}",\n  "findings": [${findingsTemplate}\n  ],\n  "summary": "Brief 1-sentence overall posture summary focused on ${view} plane findings",\n  "pelvicTilt": "anterior|posterior|neutral|unknown",\n  "shoulderDeviation": "${isLateral ? "unknown" : "left elevated|right elevated|level|unknown"}",\n  "kneeDeviation": "${isLateral ? "unknown" : "valgus|varus|neutral|unknown"}",\n  "spineAlignment": "${isLateral ? "unknown" : "scoliosis pattern|straight|lateral shift left|lateral shift right|unknown"}"\n}\nProvide specific clinical observations for this exact ${view} view. If a body part is not clearly visible, note that in the text.` }
          ]
        }]
      })
    });
    const apiData = await apiResp.json();
    const txt = apiData.content?.find(c => c.type === "text")?.text || "";
    const clean = txt.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }, []);

  const handleUploadPhoto = useCallback(async (file) => {
    if (!file) return;
    if (uploadObjRef.current) URL.revokeObjectURL(uploadObjRef.current);
    const url = URL.createObjectURL(file);
    uploadObjRef.current = url;
    setUploadedPhotoUrl(url);   // ← photo visible immediately
    setUploadedPhotoLm(null);
    setUploadedAnalysis(null);
    setUploadAnalysing(true);
    stopCamera();

    // ── Try MediaPipe first ─────────────────────────────────────────────────────────────────────────
    let mpSuccess = false;
    try {
      const img = new Image();
      img.src = url;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      if (!window.Pose) await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js";
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
      const pose = new window.Pose({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}` });
      pose.setOptions({ modelComplexity:2, smoothLandmarks:false, enableSegmentation:false, minDetectionConfidence:0.5, minTrackingConfidence:0.5 });
      let annotatedUrl = null;
      pose.onResults(results => {
        const lm = results.poseLandmarks;
        if (lm && lm.length > 0) {
          try {
            const oc = document.createElement("canvas");
            oc.width = img.naturalWidth; oc.height = img.naturalHeight;
            const octx = oc.getContext("2d");
            octx.drawImage(img, 0, 0, oc.width, oc.height);
            const m = AdvancedMeasurementEngine(lm, null);
            renderPostureOverlay({ ctx: octx, W: oc.width, H: oc.height, lm,
              measurements: m, showHeatmap: true, showLabels: true, showGrid: true,
              view: activeView });
            annotatedUrl = oc.toDataURL("image/jpeg", 0.92);
          } catch(e2) { console.warn("Overlay bake failed, using raw photo:", e2); }
          setUploadedPhotoLm(lm);
          if (annotatedUrl) setUploadedPhotoUrl(annotatedUrl);
          setTrackState(TRACKING_STATES.STABLE);
          mpSuccess = true;
        }
      });
      await pose.initialize();
      await pose.send({ image: img });
      await new Promise(res => setTimeout(res, 1000));
    } catch(e) { console.error("Upload photo MediaPipe:", e); }

    // ── AI fallback: use Anthropic vision API for posture analysis ─────────
    if (!mpSuccess) {
      try {
        const parsed = await runAIPostureAnalysis(url, activeView);
        setUploadedAnalysis(parsed);
      } catch(e) { console.error("AI posture analysis fallback:", e); }
    }
    setUploadAnalysing(false);
  }, [stopCamera, activeView, runAIPostureAnalysis]);

  // ── Re-analyse when view changes and photo is uploaded (AI path) ───────────────
  const handleViewChange = useCallback(async (newView) => {
    setActiveView(newView);
    // Only re-run AI if: no MediaPipe landmarks (AI path), photo is loaded, not currently analysing
    if (uploadObjRef.current && !uploadedPhotoLm) {
      setUploadAnalysing(true);
      setUploadedAnalysis(null);
      try {
        const parsed = await runAIPostureAnalysis(uploadObjRef.current, newView);
        setUploadedAnalysis(parsed);
      } catch(e) { console.error("AI re-analysis on view change:", e); }
      setUploadAnalysing(false);
    }
  }, [uploadedPhotoLm, runAIPostureAnalysis]);

  // ── Tap-to-focus ──────────────────────────────────────────────────────────
  const handleTapFocus = useCallback((x, y) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const caps = track.getCapabilities?.() || {};
    if (caps.focusMode && track.applyConstraints) {
      track.applyConstraints({ advanced:[{ pointsOfInterest:[{x,y}], focusMode:"single-shot" }] }).catch(()=>{});
    }
  }, []);

  // ── Countdown capture trigger ──────────────────────────────────────────────
  const triggerCountdownCapture = useCallback(() => {
    if (captureCountdown !== null) return;
    let c = countdownSecs;
    setCaptureCountdown(c);
    const t = setInterval(() => {
      c--;
      setCaptureCountdown(c);
      if (c <= 0) {
        clearInterval(t);
        setCaptureCountdown(null);
        // ── Actually take the photo ──────────────────────────────────────
        const video = videoRef.current;
        const overlayCanvas = canvasRef.current;
        if (!video || !videoSize) return;
        const { w, h } = videoSize;
        const cap = document.createElement("canvas");
        cap.width = w; cap.height = h;
        const ctx = cap.getContext("2d");
        // Mirror front camera
        if (facingMode === "user") { ctx.translate(w, 0); ctx.scale(-1, 1); }
        ctx.drawImage(video, 0, 0, w, h);
        if (facingMode === "user") { ctx.setTransform(1,0,0,1,0,0); }
        // Draw overlay skeleton on top
        if (overlayCanvas && overlayCanvas.width > 0) ctx.drawImage(overlayCanvas, 0, 0, w, h);
        // Timestamp
        const time = new Date().toLocaleString();
        ctx.font = "bold 13px system-ui";
        const label = `${activeView?.toUpperCase()} · ${time}`;
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(6, h-30, tw+14, 24);
        ctx.fillStyle = "#00e5ff"; ctx.fillText(label, 12, h-12);
        const imgUrl = cap.toDataURL("image/jpeg", 0.92);
        setLastCapture({ img: imgUrl, time, view: activeView });

        // ── Save into multi-view bank ──────────────────────────────────────
        if (landmarks) {
          const m = AdvancedMeasurementEngine(landmarks, null);
          const f = ClinicalFindingsEngine(landmarks, activeView, m);
          const rel = ReliabilityEngine(landmarks);
          const s = PostureScoreEngine(m, f, rel);
          setViewCaptures(prev => ({
            ...prev,
            [activeView]: { img: imgUrl, lm: landmarks, measurements: m, findings: f, scoreData: s, time, view: activeView }
          }));
          setShowViewBank(true);
        }
      }
    }, 1000);
  }, [captureCountdown, countdownSecs, videoRef, canvasRef, videoSize, facingMode, activeView]);

  // ── Landmark handler ───────────────────────────────────────────────────────
  const handleLandmarks = useCallback((raw) => {
    const sm = smoother.current(raw);
    setLandmarks(sm);
    if (!sm) {
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
    screen.orientation?.addEventListener?.("change", up);
    return () => { window.removeEventListener("resize", up); screen.orientation?.removeEventListener?.("change", up); };
  }, [isActive]);

  useEffect(() => { return () => stopCamera(); }, []);

  const showGuide = trackState===TRACKING_STATES.CALIBRATING || trackState===TRACKING_STATES.DETECTING;

  return (
    <div>
      <style>{`
        @keyframes pcPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes tapFocus{0%{transform:scale(1);opacity:1}100%{transform:scale(2.5);opacity:0}}
        @keyframes cdPop{0%{transform:scale(1.4);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,rgba(0,229,255,0.07),rgba(127,90,240,0.07))", border:"1px solid rgba(0,229,255,0.16)", borderRadius:14, padding:"13px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#00e5ff1a,#7f5af01a)", border:"1px solid rgba(0,229,255,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>🎥</div>
          <div>
            <div style={{ fontWeight:800, fontSize:"0.93rem", color:"#00e5ff" }}>Posture Assessment Camera</div>
            <div style={{ fontSize:"0.63rem", color:"#7e6a9a" }}>MediaPipe BlazePose · HD Capture · Physiotherapy Grade</div>
          </div>
          {/* Video resolution badge */}
          {videoSize && (
            <div style={{ marginLeft:"auto", fontSize:"0.58rem", padding:"2px 7px", borderRadius:7, background:"rgba(0,229,255,0.08)", color:"#00e5ff", border:"1px solid rgba(0,229,255,0.2)", fontWeight:700 }}>
              {videoSize.w}×{videoSize.h}
            </div>
          )}
        </div>
        <TrackingStateBar state={trackState} quality={quality.score}/>
      </div>

      {/* Lighting warning */}
      {lightingWarn && isActive && (
        <div style={{ background:"rgba(255,179,0,0.1)", border:"1px solid rgba(255,179,0,0.3)", borderRadius:9, padding:"8px 12px", marginBottom:8, fontSize:"0.72rem", color:"#ffb300", display:"flex", gap:8, fontWeight:600 }}>
          💡 Poor lighting detected — improve ambient light for better tracking accuracy
        </div>
      )}

      {/* Photo upload mode */}
      {activeView==="photo" && <PhotoUploadAnalyzer/>}

      {/* Setup guide — pre-camera */}
      {!isActive && activeView!=="photo" && <CameraPositionGuide/>}

      {/* Permission error */}
      {activeView!=="photo" && permError && (
        <div style={{ background:"rgba(255,77,109,0.09)", border:"1px solid rgba(255,77,109,0.3)", borderRadius:10, padding:"11px 14px", marginBottom:10, fontSize:"0.77rem", color:"#ff4d6d", display:"flex", gap:8 }}>
          🚫 {permError}
        </div>
      )}

      {/* Camera + overlays */}
      {activeView!=="photo" && (
      <div style={{ position:"relative" }}>
        <CameraView videoRef={videoRef} canvasRef={canvasRef} isActive={isActive} facingMode={facingMode} onTapFocus={handleTapFocus} zoom={zoom}>
          <BodyAlignmentGuide show={showGuide || (isActive && !quality.ready)} ready={quality.ready}/>
          <CalibrationSystem state={trackState} countdown={countdown} quality={quality}/>

          {/* Distance hint badge */}
          {quality.distanceHint && isActive && (
            <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", background:"rgba(6,9,15,0.82)", border:"1px solid rgba(255,179,0,0.4)", borderRadius:20, padding:"5px 14px", fontSize:"0.72rem", color:"#ffb300", fontWeight:700, whiteSpace:"nowrap", zIndex:15 }}>
              {quality.distanceHint==="back" ? "⬅ Step back" : "➡ Step closer"}
            </div>
          )}

          {/* Stability indicator */}
          {isActive && trackState===TRACKING_STATES.STABLE && (
            <div style={{ position:"absolute", top:10, right:10, background:"rgba(6,9,15,0.82)", borderRadius:9, padding:"4px 9px", fontSize:"0.62rem", fontWeight:700, color:isStable?"#00c97a":"#ffb300", border:`1px solid ${isStable?"rgba(0,201,122,0.35)":"rgba(255,179,0,0.35)"}`, zIndex:15 }}>
              {isStable ? "✓ Stable" : "○ Stabilising…"}
            </div>
          )}

          {/* Active view badge */}
          {isActive && (
            <div style={{ position:"absolute", top:10, left:10, background:"rgba(6,9,15,0.82)", borderRadius:9, padding:"4px 9px", fontSize:"0.62rem", fontWeight:700, color:"#7f5af0", border:"1px solid rgba(127,90,240,0.35)", zIndex:15, textTransform:"capitalize" }}>
              {activeView} View
            </div>
          )}

          {/* Countdown capture overlay */}
          {captureCountdown !== null && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(6,9,15,0.4)", zIndex:25 }}>
              <div style={{ width:90, height:90, borderRadius:"50%", border:"3px solid #00e5ff", background:"rgba(6,9,15,0.85)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.8rem", fontWeight:900, color:"#00e5ff", boxShadow:"0 0 30px rgba(0,229,255,0.5)", animation:"cdPop 0.3s ease-out" }}>
                {captureCountdown || "📸"}
              </div>
            </div>
          )}

          {/* Floating capture button — always visible when camera active */}
          {isActive && activeView!=="photo" && (
            <button onClick={triggerCountdownCapture} disabled={captureCountdown!==null}
              style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", width:64, height:64, borderRadius:"50%",
                background: captureCountdown!==null ? "rgba(0,229,255,0.3)" : "linear-gradient(135deg,#00e5ff,#7f5af0)",
                border:"4px solid rgba(255,255,255,0.25)", cursor:captureCountdown!==null?"not-allowed":"pointer",
                fontSize:"1.5rem", display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 4px 20px rgba(0,229,255,0.4)", zIndex:20, flexDirection:"column", gap:2 }}>
              {captureCountdown!==null ? (
                <span style={{fontSize:"1.2rem",fontWeight:900,color:"#000"}}>{captureCountdown}</span>
              ) : "📸"}
            </button>
          )}
        </CameraView>
      </div>
      )}
      {/* Skeleton */}
      {isActive && activeView!=="photo" && <SkeletonRenderer canvasRef={canvasRef} landmarks={landmarks} videoSize={videoSize} trackingState={trackState} activeView={activeView}/>}

      {/* Pose engine */}
      <PoseTracker videoRef={videoRef} active={poseActive} onLandmarks={handleLandmarks}/>

      {/* Controls */}
      <CameraControls
        isActive={isActive} isLoading={isLoading}
        onStart={(mode)=>startCamera(mode||facingMode)} onStop={stopCamera}
        onFlip={flipCamera} onRecalibrate={runCalibration}
        facingMode={facingMode} canRecalibrate={isActive&&trackState!==TRACKING_STATES.CALIBRATING}
        zoom={zoom} onZoom={setZoom}
        countdownSecs={countdownSecs} onCountdownChange={setCountdownSecs}
        burstMode={burstMode} onBurstToggle={()=>setBurstMode(b=>!b)}
        activeView={activeView} onViewChange={handleViewChange}
        onUploadPhoto={handleUploadPhoto}
      />

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

      {/* Readiness / stability badge */}
      {isActive && trackState!==TRACKING_STATES.CALIBRATING && (
        <div style={{ marginTop:8, padding:"7px 12px", background:quality.ready?"rgba(0,201,122,0.08)":"rgba(255,179,0,0.08)", border:`1px solid ${quality.ready?"rgba(0,201,122,0.25)":"rgba(255,179,0,0.2)"}`, borderRadius:8, fontSize:"0.72rem", fontWeight:700, color:quality.ready?"#00c97a":"#ffb300", display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
          <span>{quality.ready ? (isStable?"✓":"○") : "⚠"}</span>
          <span>{quality.ready ? (isStable ? "Body stable — tap 📸 or use countdown capture" : "Full body detected — hold still for stable capture") : "Position body: head · shoulders · hips · feet all visible"}</span>
          {quality.ready && isStable && (
            <span style={{ marginLeft:"auto", fontSize:"0.62rem", padding:"2px 8px", borderRadius:7, background:"rgba(0,229,255,0.1)", color:"#00e5ff", border:"1px solid rgba(0,229,255,0.25)" }}>Ready for {activeView}</span>
          )}
        </div>
      )}

      {/* ── MULTI-VIEW CAPTURE BANK ── */}
      {showViewBank && Object.values(viewCaptures).some(v => v !== null) && (
        <div style={{marginTop:10,background:"#0a0a14",border:"1px solid rgba(0,229,255,0.2)",borderRadius:12,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderBottom:"1px solid rgba(0,229,255,0.15)",background:"rgba(0,229,255,0.04)"}}>
            <div style={{fontSize:"0.62rem",fontWeight:800,color:"#00e5ff",letterSpacing:"0.5px"}}>
              📸 View Capture Bank — {Object.values(viewCaptures).filter(v=>v).length}/4 Views
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowComparison(s=>!s)}
                style={{padding:"4px 9px",background:"rgba(127,90,240,0.12)",border:"1px solid rgba(127,90,240,0.3)",borderRadius:7,color:"#7f5af0",fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>
                {showComparison?"▲ Hide":"⇄ Compare"}
              </button>
              <button onClick={()=>{setViewCaptures({anterior:null,posterior:null,left:null,right:null});setShowViewBank(false);setLastCapture(null);setShowComparison(false);}}
                style={{padding:"4px 9px",background:"rgba(255,77,109,0.08)",border:"1px solid rgba(255,77,109,0.2)",borderRadius:7,color:"#ff4d6d",fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>✕ Clear All</button>
            </div>
          </div>

          {/* 4-view grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:"rgba(0,229,255,0.05)"}}>
            {["anterior","posterior","left","right"].map(v => {
              const cap = viewCaptures[v];
              const labels = {anterior:"Front",posterior:"Back",left:"L Side",right:"R Side"};
              const icons  = {anterior:"⬆",posterior:"⬇",left:"◀",right:"▶"};
              const col    = cap?.scoreData?.score >= 78 ? "#00c97a" : cap?.scoreData?.score >= 62 ? "#ffb300" : "#ff4d6d";
              return (
                <div key={v} style={{position:"relative",background:"#0d0d1a",minHeight:90}}>
                  {cap ? (
                    <>
                      <img src={cap.img} alt={v} style={{width:"100%",display:"block",maxHeight:160,objectFit:"cover"}}/>
                      <div style={{position:"absolute",top:0,left:0,right:0,padding:"4px 6px",background:"rgba(0,0,0,0.55)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:"0.6rem",fontWeight:800,color:"#00e5ff"}}>{icons[v]} {labels[v].toUpperCase()}</span>
                        {cap.scoreData?.score && <span style={{fontSize:"0.65rem",fontWeight:900,color:col}}>{cap.scoreData?.score}</span>}
                      </div>
                      <div style={{padding:"4px 6px",borderTop:"1px solid rgba(0,229,255,0.1)"}}>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:"0.55rem",padding:"1px 5px",borderRadius:5,background:"rgba(255,77,109,0.15)",color:"#ff4d6d",fontWeight:700}}>
                            🔴 {cap.findings.filter(f=>f.severity==="high").length} HIGH
                          </span>
                          <span style={{fontSize:"0.55rem",padding:"1px 5px",borderRadius:5,background:"rgba(255,179,0,0.15)",color:"#ffb300",fontWeight:700}}>
                            🟡 {cap.findings.filter(f=>f.severity!=="high").length} MOD
                          </span>
                          {!baselineCapture && (
                            <button onClick={()=>setBaselineCapture({...cap,date:new Date().toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"})})}
                              style={{fontSize:"0.55rem",padding:"1px 6px",borderRadius:5,background:"rgba(0,201,122,0.12)",border:"1px solid rgba(0,201,122,0.3)",color:"#00c97a",cursor:"pointer",fontWeight:700,marginLeft:"auto"}}>
                              📌 Set Baseline
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:90,gap:4,opacity:0.4}}>
                      <span style={{fontSize:"1.4rem"}}>{icons[v]}</span>
                      <span style={{fontSize:"0.6rem",color:"#6b8399",fontWeight:600}}>{labels[v]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Before/After comparison */}
          {showComparison && baselineCapture && (
            <div style={{padding:"10px 12px",borderTop:"1px solid rgba(127,90,240,0.2)",background:"rgba(127,90,240,0.03)"}}>
              <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7f5af0",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>⇄ Before / After Comparison</div>
              {["anterior","posterior","left","right"].map(v => {
                const current = viewCaptures[v];
                const isBaseline = baselineCapture.view === v;
                if (!current || !isBaseline) return null;
                const bScore = baselineCapture.scoreData?.score ?? null;
                const cScore = current.scoreData?.score ?? null;
                const delta  = bScore !== null && cScore !== null ? cScore - bScore : null;
                const deltaCol = delta === null ? "#6b8399" : delta >= 0 ? "#00c97a" : "#ff4d6d";
                return (
                  <div key={v} style={{marginBottom:10}}>
                    <div style={{fontSize:"0.65rem",fontWeight:700,color:"#00e5ff",marginBottom:6}}>{v.toUpperCase()} VIEW</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
                      <div style={{textAlign:"center"}}>
                        <img src={baselineCapture.img} alt="baseline" style={{width:"100%",borderRadius:7,border:"2px solid rgba(127,90,240,0.4)"}}/>
                        <div style={{fontSize:"0.6rem",color:"#7f5af0",marginTop:3,fontWeight:700}}>BASELINE · {baselineCapture.date}</div>
                        {bScore && <div style={{fontSize:"1.1rem",fontWeight:900,color:"#7f5af0"}}>{bScore}</div>}
                      </div>
                      <div style={{textAlign:"center",padding:"0 4px"}}>
                        {delta !== null && (
                          <div style={{fontSize:"1.2rem",fontWeight:900,color:deltaCol}}>
                            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}
                          </div>
                        )}
                        <div style={{fontSize:"0.55rem",color:"#6b8399",marginTop:2}}>pts</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <img src={current.img} alt="current" style={{width:"100%",borderRadius:7,border:"2px solid rgba(0,229,255,0.4)"}}/>
                        <div style={{fontSize:"0.6rem",color:"#00e5ff",marginTop:3,fontWeight:700}}>CURRENT · {current.time}</div>
                        {cScore && <div style={{fontSize:"1.1rem",fontWeight:900,color:"#00e5ff"}}>{cScore}</div>}
                      </div>
                    </div>
                    {/* Finding delta */}
                    {(() => {
                      const bHigh = (baselineCapture.findings||[]).filter(f=>f.severity==="high").length;
                      const cHigh = current.findings.filter(f=>f.severity==="high").length;
                      const dHigh = bHigh - cHigh;
                      return (
                        <div style={{marginTop:6,padding:"5px 8px",borderRadius:7,background:"rgba(0,0,0,0.2)",fontSize:"0.65rem",color:"#c9b8e8",display:"flex",gap:10,flexWrap:"wrap"}}>
                          <span>High priority: {bHigh} → {cHigh} <span style={{color:dHigh>0?"#00c97a":dHigh<0?"#ff4d6d":"#6b8399",fontWeight:700}}>{dHigh>0?`(−${dHigh} resolved)`:dHigh<0?`(+${Math.abs(dHigh)} new)`:"(unchanged)"}</span></span>
                          <span>Total findings: {(baselineCapture.findings||[]).length} → {current.findings.length}</span>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
              {!["anterior","posterior","left","right"].some(v => viewCaptures[v] && baselineCapture.view === v) && (
                <div style={{fontSize:"0.7rem",color:"#6b8399",textAlign:"center",padding:"8px"}}>
                  Capture the same view as your baseline ({baselineCapture.view}) to compare
                </div>
              )}
              <button onClick={()=>setBaselineCapture(null)} style={{marginTop:6,padding:"5px 10px",background:"rgba(255,77,109,0.08)",border:"1px solid rgba(255,77,109,0.2)",borderRadius:7,color:"#ff4d6d",fontSize:"0.62rem",cursor:"pointer",fontWeight:600}}>
                ✕ Clear Baseline
              </button>
            </div>
          )}

          {/* Multi-view PDF export */}
          {Object.values(viewCaptures).filter(v=>v).length >= 2 && (
            <div style={{padding:"8px 12px",borderTop:"1px solid rgba(0,229,255,0.1)",background:"rgba(0,229,255,0.02)"}}>
              <button onClick={generateMultiViewPDF}
                style={{width:"100%",padding:"10px",background:"linear-gradient(135deg,#00e5ff,#7f5af0)",border:"none",borderRadius:9,color:"#000",fontWeight:800,fontSize:"0.78rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                📄 Export Multi-View Postural Report ({Object.values(viewCaptures).filter(v=>v).length} views)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── UPLOADED PHOTO PREVIEW WITH ANALYSIS GRID ── */}
      {uploadedPhotoUrl && (
        <div style={{marginTop:10,background:"#0d0d1a",border:"1px solid rgba(127,90,240,0.3)",borderRadius:12,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",borderBottom:"1px solid rgba(127,90,240,0.2)"}}>
            <div style={{fontSize:"0.62rem",fontWeight:800,color:"#7f5af0"}}>
              📷 Uploaded Photo — {activeView.charAt(0).toUpperCase()+activeView.slice(1)} View {uploadedPhotoLm ? "— Pose Grid Applied" : uploadAnalysing ? "— Re-analysing…" : uploadedAnalysis ? "— AI Analysis Complete" : ""}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{ setUploadedPhotoUrl(null); setUploadedPhotoLm(null); setUploadedAnalysis(null); setUploadAnalysing(false); if(uploadObjRef.current){URL.revokeObjectURL(uploadObjRef.current);uploadObjRef.current=null;} }}
                style={{padding:"4px 10px",background:"rgba(255,77,109,0.1)",border:"1px solid rgba(255,77,109,0.25)",borderRadius:7,color:"#ff4d6d",fontSize:"0.62rem",fontWeight:700,cursor:"pointer"}}>✕ Clear</button>
            </div>
          </div>
          {/* Always show as img — overlay is baked in when MediaPipe succeeds */}
          <img src={uploadedPhotoUrl} alt="Uploaded posture photo"
            style={{width:"100%",display:"block",maxHeight:500,objectFit:"contain",background:"#0a0a14"}}/>
          {/* Analysing spinner */}
          {uploadAnalysing && (
            <div style={{padding:"10px 12px",borderTop:"1px solid rgba(127,90,240,0.15)",display:"flex",alignItems:"center",gap:8,color:"#7f5af0",fontSize:"0.73rem",fontWeight:600}}>
              <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span> Running {activeView} view analysis…
            </div>
          )}
          {/* MediaPipe findings (if landmarks detected) */}
          {uploadedPhotoLm && (() => {
            const m = AdvancedMeasurementEngine ? AdvancedMeasurementEngine(uploadedPhotoLm, null) : {};
            const rel = ReliabilityEngine ? ReliabilityEngine(uploadedPhotoLm) : { blocked: false };
            if (rel.blocked) return (
              <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,77,109,0.2)",background:"rgba(255,77,109,0.06)"}}>
                <div style={{fontSize:"0.72rem",color:"#ff4d6d",fontWeight:700}}>🚫 Image quality insufficient</div>
                <div style={{fontSize:"0.65rem",color:"rgba(255,77,109,0.75)",marginTop:4,lineHeight:1.5}}>
                  {(rel.warnings[0]?.text)||"Improve lighting, ensure full body is visible, and use form-fitting clothing."}
                </div>
              </div>
            );
            const findings = ClinicalFindingsEngine ? ClinicalFindingsEngine(uploadedPhotoLm, activeView, m) : [];
            if (!findings.length) return null;
            return (
              <div style={{padding:"10px 12px",borderTop:"1px solid rgba(127,90,240,0.15)"}}>
                <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7f5af0",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>📊 Posture Findings</div>
                {findings.map((f,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"6px 10px",marginBottom:5,
                    background:f.severity==="high"?"rgba(255,77,109,0.08)":"rgba(255,179,0,0.07)",
                    border:`1px solid ${f.severity==="high"?"rgba(255,77,109,0.3)":"rgba(255,179,0,0.25)"}`,borderRadius:9}}>
                    <span style={{fontSize:"1rem",flexShrink:0,marginTop:1}}>{f.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                        <span style={{fontWeight:800,fontSize:"0.74rem",color:f.severity==="high"?"#ff4d6d":"#ffb300"}}>{f.region}</span>
                        <span style={{fontSize:"0.58rem",padding:"1px 6px",borderRadius:6,background:f.severity==="high"?"rgba(255,77,109,0.15)":"rgba(255,179,0,0.15)",
                          color:f.severity==="high"?"#ff4d6d":"#ffb300",fontWeight:700,textTransform:"uppercase"}}>{f.severity}</span>
                        {f.icd&&<span style={{fontSize:"0.55rem",color:"rgba(127,90,240,0.6)",marginLeft:"auto"}}>{f.icd}</span>}
                      </div>
                      <div style={{fontSize:"0.76rem",color:"#e2d9f3",marginBottom:3,lineHeight:1.4}}>{f.text}</div>
                      {f.correction&&<div style={{fontSize:"0.67rem",color:"#7e6a9a",lineHeight:1.4,borderTop:"1px solid rgba(127,90,240,0.1)",paddingTop:3,marginTop:3}}>
                        <span style={{color:"#7f5af0",fontWeight:700}}>Rx: </span>{f.correction}
                      </div>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          {/* AI analysis findings (fallback when MediaPipe has no landmarks) */}
          {!uploadedPhotoLm && !uploadAnalysing && uploadedAnalysis && (
            <div style={{padding:"10px 12px",borderTop:"1px solid rgba(127,90,240,0.15)"}}>
              <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7f5af0",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>🤖 AI {activeView.charAt(0).toUpperCase()+activeView.slice(1)} View Analysis</div>
              {uploadedAnalysis.summary && (
                <div style={{fontSize:"0.75rem",color:"#c9b8e8",marginBottom:8,padding:"6px 9px",background:"rgba(127,90,240,0.08)",borderRadius:8,borderLeft:"3px solid #7f5af0"}}>
                  {uploadedAnalysis.summary}
                </div>
              )}
              {/* Key metrics row */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                {uploadedAnalysis.pelvicTilt&&uploadedAnalysis.pelvicTilt!=="unknown"&&(
                  <span style={{fontSize:"0.65rem",padding:"3px 9px",borderRadius:8,background:"rgba(127,90,240,0.12)",border:"1px solid rgba(127,90,240,0.3)",color:"#c9b8e8",fontWeight:600}}>
                    Pelvis: {uploadedAnalysis.pelvicTilt}
                  </span>
                )}
                {uploadedAnalysis.shoulderDeviation&&uploadedAnalysis.shoulderDeviation!=="unknown"&&(
                  <span style={{fontSize:"0.65rem",padding:"3px 9px",borderRadius:8,background:"rgba(127,90,240,0.12)",border:"1px solid rgba(127,90,240,0.3)",color:"#c9b8e8",fontWeight:600}}>
                    Shoulders: {uploadedAnalysis.shoulderDeviation}
                  </span>
                )}
                {uploadedAnalysis.kneeDeviation&&uploadedAnalysis.kneeDeviation!=="unknown"&&(
                  <span style={{fontSize:"0.65rem",padding:"3px 9px",borderRadius:8,background:"rgba(127,90,240,0.12)",border:"1px solid rgba(127,90,240,0.3)",color:"#c9b8e8",fontWeight:600}}>
                    Knees: {uploadedAnalysis.kneeDeviation}
                  </span>
                )}
                {uploadedAnalysis.spineAlignment&&uploadedAnalysis.spineAlignment!=="unknown"&&(
                  <span style={{fontSize:"0.65rem",padding:"3px 9px",borderRadius:8,background:"rgba(127,90,240,0.12)",border:"1px solid rgba(127,90,240,0.3)",color:"#c9b8e8",fontWeight:600}}>
                    Spine: {uploadedAnalysis.spineAlignment}
                  </span>
                )}
              </div>
              {/* Detailed findings */}
              {(uploadedAnalysis.findings||[]).map((f,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"6px 10px",marginBottom:5,
                  background:f.severity==="high"?"rgba(255,77,109,0.08)":"rgba(255,179,0,0.07)",
                  border:`1px solid ${f.severity==="high"?"rgba(255,77,109,0.3)":"rgba(255,179,0,0.25)"}`,borderRadius:9}}>
                  <span style={{fontSize:"1rem",flexShrink:0,marginTop:1}}>{f.icon||"●"}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                      <span style={{fontWeight:800,fontSize:"0.74rem",color:f.severity==="high"?"#ff4d6d":"#ffb300"}}>{f.region}</span>
                      <span style={{fontSize:"0.58rem",padding:"1px 6px",borderRadius:6,
                        background:f.severity==="high"?"rgba(255,77,109,0.15)":"rgba(255,179,0,0.15)",
                        color:f.severity==="high"?"#ff4d6d":"#ffb300",fontWeight:700,textTransform:"uppercase"}}>{f.severity}</span>
                    </div>
                    <div style={{fontSize:"0.76rem",color:"#e2d9f3",marginBottom:3,lineHeight:1.4}}>{f.text}</div>
                    {f.correction&&<div style={{fontSize:"0.67rem",color:"#7e6a9a",lineHeight:1.4,borderTop:"1px solid rgba(127,90,240,0.1)",paddingTop:3,marginTop:3}}>
                      <span style={{color:"#7f5af0",fontWeight:700}}>Rx: </span>{f.correction}
                    </div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PDF REPORT GENERATOR ── */}
          {(uploadedPhotoLm || uploadedAnalysis) && !uploadAnalysing && (
            <div style={{padding:"12px",borderTop:"1px solid rgba(127,90,240,0.2)",background:"rgba(127,90,240,0.04)"}}>
              <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7f5af0",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
                📄 Generate PDF Report
              </div>
              <div style={{display:"flex",gap:7,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.58rem",color:"rgba(200,185,230,0.7)",marginBottom:3,fontWeight:600}}>Patient Name</div>
                  <input
                    type="text" placeholder="e.g. John Smith"
                    value={reportPatient} onChange={e=>setReportPatient(e.target.value)}
                    style={{width:"100%",padding:"8px 10px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(127,90,240,0.3)",borderRadius:8,color:"#e2d9f3",fontSize:"0.75rem",outline:"none",boxSizing:"border-box"}}
                  />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.58rem",color:"rgba(200,185,230,0.7)",marginBottom:3,fontWeight:600}}>Clinician Name</div>
                  <input
                    type="text" placeholder="e.g. Dr. Jones"
                    value={reportClinician} onChange={e=>setReportClinician(e.target.value)}
                    style={{width:"100%",padding:"8px 10px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(127,90,240,0.3)",borderRadius:8,color:"#e2d9f3",fontSize:"0.75rem",outline:"none",boxSizing:"border-box"}}
                  />
                </div>
              </div>

              {/* Save to patient record button — only shown when patient is loaded */}
              {set && (
                <button
                  onClick={savePostureToRecord}
                  style={{
                    width:"100%",padding:"10px",marginBottom:7,
                    background:savedToRecord?"rgba(0,201,122,0.15)":"rgba(0,201,122,0.08)",
                    border:`1px solid ${savedToRecord?"rgba(0,201,122,0.6)":"rgba(0,201,122,0.25)"}`,
                    borderRadius:9,color:savedToRecord?"#00c97a":"rgba(0,201,122,0.8)",
                    fontWeight:700,fontSize:"0.78rem",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                    transition:"all 0.3s",
                  }}>
                  {savedToRecord ? "✅  Saved to Patient Record" : "💾  Save to Patient Record"}
                </button>
              )}
              {!set && (
                <div style={{padding:"7px 10px",marginBottom:7,borderRadius:8,background:"rgba(255,179,0,0.07)",border:"1px solid rgba(255,179,0,0.2)",fontSize:"0.67rem",color:"rgba(255,179,0,0.8)",textAlign:"center"}}>
                  ⚠ No patient loaded — create or load a patient to save this assessment
                </div>
              )}

              <button
                onClick={generatePostureReportPDF}
                disabled={reportExporting}
                style={{
                  width:"100%",padding:"12px",
                  background:reportExporting?"rgba(127,90,240,0.2)":"linear-gradient(135deg,#7f5af0,#00e5ff)",
                  border:"none",borderRadius:10,
                  color:reportExporting?"#7f5af0":"#000",
                  fontWeight:800,fontSize:"0.82rem",cursor:reportExporting?"not-allowed":"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  letterSpacing:"0.3px",
                }}>
                {reportExporting ? "⏳  Generating Report…" : "📄  Export Postural Assessment PDF"}
              </button>
              <div style={{fontSize:"0.6rem",color:"rgba(127,90,240,0.55)",textAlign:"center",marginTop:6,lineHeight:1.5}}>
                Opens print dialog → <strong style={{color:"rgba(127,90,240,0.8)"}}>Save as PDF</strong> · Includes: photo · score · ASIS/PSIS · knee · shoulder · spine · measurements · Rx
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual capture button — always visible when camera active */}
      {isActive && activeView!=="photo" && (
        <div style={{marginTop:8,display:"flex",gap:8}}>
          <button onClick={triggerCountdownCapture} disabled={captureCountdown!==null}
            style={{flex:1,padding:"12px",background:captureCountdown!==null?"rgba(0,229,255,0.08)":"linear-gradient(135deg,#00e5ff,#7f5af0)",border:"none",borderRadius:10,color:captureCountdown!==null?"#00e5ff":"#000",fontWeight:800,fontSize:"0.82rem",cursor:captureCountdown!==null?"not-allowed":"pointer"}}>
            {captureCountdown!==null ? `📸 Capturing in ${captureCountdown}s…` : `📸 Capture Photo (${countdownSecs}s)`}
          </button>
        </div>
      )}

      {/* Joint confidence panel */}
      {trackState===TRACKING_STATES.STABLE && landmarks && (
        <div style={{ marginTop:10, background:"#ffffff", border:"1px solid #d8cce8", borderRadius:10, padding:"9px 13px" }}>
          <div style={{ fontSize:"0.6rem", fontWeight:700, color:"#7e6a9a", textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>Joint Confidence</div>
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
        <PostureLiveAnalysis landmarks={landmarks} canvasRef={canvasRef} videoSize={videoSize}/>
      )}

      {/* Footer */}
      <div style={{ marginTop:10, fontSize:"0.62rem", color:"#7e6a9a", padding:"7px 11px", background:"#ffffff", borderRadius:8, lineHeight:1.5, border:"1px solid #d8cce8" }}>
        <strong style={{ color:"#1a1025" }}>Privacy:</strong> All processing runs locally in your browser. No video is uploaded or stored.
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════
// NEW ADVANCED POSTURE ANALYSIS ENGINE — integrated from PostureAnalysisModule
// ════════════════════════════════════════════════════════════════════════

//  • Spinal curvature estimation (cervical/thoracic/lumbar)
//  • Scoliosis Cobb angle estimation from posterior view
//  • Temporal trend tracking (session history + progress charting)
//  • Burst capture + before/after comparison
//  • Export: annotated image + PDF-ready JSON report
//  • Offline capable — no API cost, runs entirely in browser
// ════════════════════════════════════════════════════════════════════════════

// ─── Colours ─────────────────────────────────────────────────────────────────
const PC = {
  bg:"#faf8fc", surface:"#ffffff", s2:"#f5f0fb", s3:"#ede7f6",
  border:"#d8cce8", accent:"#7c3aed", a2:"#9333ea", a3:"#059669",
  text:"#1a1025", muted:"#7e6a9a", red:"#dc2626", yellow:"#b45309",
  green:"#059669", purple:"#9333ea", orange:"#f97316",
};

// ─── Math Utilities ───────────────────────────────────────────────────────────
const mid = (a, b) => a && b ? { x:(a.x+b.x)/2, y:(a.y+b.y)/2, visibility: Math.min(a.visibility||0,b.visibility||0) } : null;
const vis = (lm, i, thresh=0.4) => (lm[i]?.visibility||0) > thresh;
const px  = (lm, i, W, H) => lm[i] ? [lm[i].x*W, lm[i].y*H] : null;

function calcAngleDeg(a, b) {
  if (!a || !b) return null;
  let angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  if (angle > 90)  angle -= 180;
  if (angle < -90) angle += 180;
  return Math.round(angle * 10) / 10;
}
function vec3Angle(a, b, c) {
  if (!a || !b || !c) return null;
  const ab = { x:a.x-b.x, y:a.y-b.y }, cb = { x:c.x-b.x, y:c.y-b.y };
  const dot = ab.x*cb.x + ab.y*cb.y;
  const mag = Math.sqrt((ab.x**2+ab.y**2)*(cb.x**2+cb.y**2));
  if (mag === 0) return null;
  return Math.round(Math.acos(Math.min(1, Math.max(-1, dot/mag))) * 1800 / Math.PI) / 10;
}
function dist2D(a, b) {
  if (!a || !b) return null;
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}
const r1 = v => v !== null && v !== undefined && !isNaN(v) ? Math.round(v*10)/10 : null;
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

// ─── MEDIAPIPE LANDMARK INDICES ───────────────────────────────────────────────
// 0=nose, 2=L_eye, 5=R_eye, 7=L_ear, 8=R_ear
// 11=L_shoulder, 12=R_shoulder, 13=L_elbow, 14=R_elbow
// 15=L_wrist, 16=R_wrist, 23=L_hip, 24=R_hip
// 25=L_knee, 26=R_knee, 27=L_ankle, 28=R_ankle
// 29=L_heel, 30=R_heel, 31=L_foot_index, 32=R_foot_index

// ─── ADVANCED MEASUREMENT ENGINE ─────────────────────────────────────────────
// Clinical norms based on: Kendall et al. (2005), Yip et al. (2008),
// Levangie & Norkin (2011), Magee (2014), Singla & Veqar (2014)
// ─────────────────────────────────────────────────────────────────────────────
const CLINICAL_NORMS = {
  cvaAngle:          { normal:[55,90],   mild:[49,55],   severe:[0,49],   unit:"°", label:"CVA (Craniovertebral Angle)", ref:"Yip et al. (2008): >55° normal. 49–55° mild FHP. <49° pathological — cervicogenic headache risk." },
  thoracicAngle:     { normal:[20,45],   mild:[45,55],   severe:[55,90],  unit:"°", label:"Thoracic Kyphosis (T1–T12)", ref:"Normal Cobb equivalent 20–45°. >50° hyperkyphosis. Assessed lateral view only." },
  lordosisAngle:     { normal:[40,60],   mild:[60,70],   severe:[70,90],  unit:"°", label:"Lumbar Lordosis (L1–S1)",   ref:"Normal 40–60°. >70° hyperlordosis. <30° flat-back. Assessed lateral view only." },
  shoulderAngle:     { normal:[0,3],     mild:[3,7],     severe:[7,30],   unit:"°", label:"Shoulder Tilt (bilateral)", ref:"<3° within normal variation. 3–7° mild asymmetry. >7° refer for LLD/scoliosis screen." },
  pelvisAngle:       { normal:[0,3],     mild:[3,7],     severe:[7,30],   unit:"°", label:"Pelvic Obliquity",          ref:"<3° normal. >7° — screen for LLD, SIJ dysfunction, hip asymmetry." },
  kneeValgus:        { normal:[0,5],     mild:[5,10],    severe:[10,30],  unit:"°", label:"Knee Valgus/Varus",         ref:"<5° normal Q-angle variation. >10° — glute med inhibition, foot pronation driver." },
  cobbEstimate:      { normal:[0,5],     mild:[5,10],    severe:[10,90],  unit:"°", label:"Scoliosis Screen (Cobb est.)", ref:"<5° normal. 5–10° monitor with repeat. >10° refer for standing X-ray (true Cobb)." },
  weightBearingShift:{ normal:[0,3],     mild:[3,6],     severe:[6,30],   unit:"%", label:"Weight-Bearing Asymmetry",  ref:"<3% acceptable. >6% — assess LLD, pain-avoidance posture, hip OA." },
  cogDeviation:      { normal:[0,4],     mild:[4,7],     severe:[7,30],   unit:"%", label:"Centre of Gravity Deviation", ref:"<4% normal. >7% global postural collapse — multi-system retraining needed." },
  leftKneeDev:       { normal:[-5,5],    mild:[-12,-5],  severe:[-30,-12],unit:"°", label:"Knee Hyperextension (Genu Recurvatum)", ref:">5° increases posterior capsule & ACL load. >10° — Beighton hypermobility score." },
  rightKneeDev:      { normal:[-5,5],    mild:[-12,-5],  severe:[-30,-12],unit:"°", label:"Knee Hyperextension (Genu Recurvatum)", ref:">5° increases posterior capsule & ACL load. >10° — Beighton hypermobility score." },
};

// Cervical compressive load (Hansraj 2014 model: 4.5kg neutral + ~2.7kg/2.5cm FHP)
const CERVICAL_LOAD_KG = (fhpCm) => fhpCm !== null && fhpCm > 0 ? r1(4.5 + fhpCm * 1.08) : null;

// ── LANDMARK CONFIDENCE GUARD ─────────────────────────────────────────────────
// Returns null for any measurement where key landmarks are below the
// minimum confidence threshold. This prevents false findings from poor images.
const MIN_VIS = 0.45; // Minimum MediaPipe visibility score for a landmark to be trusted

function AdvancedMeasurementEngine(lm, calibration=null) {
  // calibration: { pixPerCm, frameHeightPx, patientHeightCm }
  if (!lm || lm.length < 33) return {};
  const g    = i => lm[i];
  // Strict visibility threshold — landmark must be >= MIN_VIS to be used
  const V    = i => (lm[i]?.visibility||0) >= MIN_VIS;
  // Confidence-weighted value: returns value only if BOTH landmarks meet threshold
  const Vboth = (...idxs) => idxs.every(i => V(i));
  const toCm = (normDelta) => calibration?.pixPerCm && calibration?.frameHeightPx
    ? r1((normDelta * calibration.frameHeightPx) / calibration.pixPerCm) : null;

  // ── Confidence-gated landmark midpoints ───────────────────────────────────
  // Only compute midpoints when BOTH landmarks are above threshold
  const shMid    = Vboth(11,12) ? mid(g(11), g(12)) : null;
  const hipMid   = Vboth(23,24) ? mid(g(23), g(24)) : null;
  const kneeMid  = Vboth(25,26) ? mid(g(25), g(26)) : null;
  const ankleMid = Vboth(27,28) ? mid(g(27), g(28)) : null;
  const footMid  = Vboth(31,32) ? mid(g(31), g(32)) : null;
  const heelMid  = Vboth(29,30) ? mid(g(29), g(30)) : null;
  const earMid   = Vboth(7,8)   ? mid(g(7),  g(8))  : null;
  const eyeMid   = Vboth(2,5)   ? mid(g(2),  g(5))  : null;

  // ── Z-depth availability ───────────────────────────────────────────────────
  // MediaPipe provides normalised Z relative to hip midpoint.
  // Only trust Z when the delta is meaningful (> 0.002 avoids noise near zero).
  const hasZ  = V(7) && V(11) && Math.abs((g(7).z||0)-(g(11).z||0)) > 0.002;
  const earZ  = hasZ && V(7)  && V(8)  ? ((g(7).z||0)+(g(8).z||0))/2  : null;
  const shZ   = hasZ && V(11) && V(12) ? ((g(11).z||0)+(g(12).z||0))/2 : null;
  const hipZ  = hasZ && V(23) && V(24) ? ((g(23).z||0)+(g(24).z||0))/2 : null;
  const kneeZ = hasZ && V(25) && V(26) ? ((g(25).z||0)+(g(26).z||0))/2 : null;

  // ── FRONTAL PLANE MEASUREMENTS ────────────────────────────────────────────
  // Shoulder tilt: angle of line connecting L shoulder to R shoulder from horizontal
  const shoulderAngle = Vboth(11,12) ? calcAngleDeg(g(12), g(11)) : null;
  // Pelvic obliquity: same method for ASIS landmarks
  const pelvisAngle   = Vboth(23,24) ? calcAngleDeg(g(24), g(23)) : null;
  const kneeAngle     = Vboth(25,26) ? calcAngleDeg(g(26), g(25)) : null;
  const ankleAngle    = Vboth(27,28) ? calcAngleDeg(g(28), g(27)) : null;
  const eyeLevelAngle = Vboth(2,5)   ? calcAngleDeg(g(5),  g(2))  : null;

  // Head lateral offset: nose X minus shoulder midpoint X (normalised to frame width)
  // Expressed as % of frame width — more stable than absolute pixels
  const headLateralOffset = shMid && V(0) ? r1((g(0).x - shMid.x)*100) : null;
  // Trunk lateral shift: shoulder midpoint minus hip midpoint (% of frame width)
  const trunkLateralShift = shMid && hipMid ? r1((shMid.x - hipMid.x)*100) : null;
  const pelvicObliquity   = hipMid && kneeMid ? r1((hipMid.x - kneeMid.x)*100) : null;
  // Weight-bearing shift: hip midpoint vs foot midpoint (% of frame width)
  const weightBearingShift = hipMid && footMid ? r1((hipMid.x - footMid.x)*100) : null;
  const spinalDeviation    = V(0) && hipMid ? r1((g(0).x - hipMid.x)*100) : null;

  const shoulderWidth      = Vboth(11,12) ? Math.abs(g(11).x-g(12).x) : null;
  const hipWidth           = Vboth(23,24) ? Math.abs(g(23).x-g(24).x) : null;
  const trunkRotationProxy = shoulderWidth && hipWidth && hipWidth > 0.01
    ? r1((shoulderWidth/hipWidth - 1)*100) : null;

  // Hip-knee-ankle frontal alignment (Q-angle proxy for valgus/varus)
  // Only valid when all three landmarks are above confidence threshold
  const leftKneeFrontal  = Vboth(23,25,27) ? r1(calcAngleDeg(g(23),g(25))-calcAngleDeg(g(25),g(27))) : null;
  const rightKneeFrontal = Vboth(24,26,28) ? r1(calcAngleDeg(g(24),g(26))-calcAngleDeg(g(26),g(28))) : null;

  // ── CVA: Craniovertebral Angle (Yip et al. 2008) ─────────────────────────
  // Gold standard: lateral photo, line from tragus to C7 spinous process vs horizontal.
  // MediaPipe proxy: angle of ear-to-shoulder vector from vertical.
  // Valid ONLY in lateral view (left or right). Frontal view CVA = null.
  // Using 2D only (X and Y) — Z-based CVA was producing unreliable values.
  let cvaAngle = null;
  if (earMid && shMid) {
    const dx = Math.abs((earMid.x||0)-(shMid.x||0));
    const dy = Math.abs((earMid.y||0)-(shMid.y||0));
    // Only calculate when there is meaningful vertical separation (ear above shoulder)
    // and the landmarks are reliably detected (both ears must be visible for earMid)
    if (dy > 0.04 && earMid.visibility >= 0.35) {
      // CVA = arctan(dy/dx) converted to degrees from vertical
      // When head is directly above shoulder: dx ≈ 0, CVA ≈ 90° (ideal)
      // As head moves forward: dx increases, CVA decreases
      const rawCVA = Math.atan2(dy, dx) * 180 / Math.PI;
      cvaAngle = r1(clamp(rawCVA, 20, 88));
    }
  }

  // ── FORWARD HEAD POSTURE ───────────────────────────────────────────────────
  // Measured as horizontal offset of ear from shoulder midpoint.
  // In lateral view: ear should be directly over shoulder (offset = 0).
  // Expressed in normalised units (% of frame width); converted to cm if calibrated.
  const fhpNorm = shMid && earMid ? r1((earMid.x - shMid.x)*100) : null;
  // When calibration is available, express in real mm (more clinically meaningful)
  const forwardHeadCm = calibration && fhpNorm !== null
    ? toCm(Math.abs(fhpNorm / 100)) : null;
  // Primary measurement: real mm if available, normalised % if not
  const forwardHeadMm = forwardHeadCm !== null ? r1(forwardHeadCm * 10) : fhpNorm;
  // Cervical compressive load (Hansraj model, only if real cm measurement available)
  const cervicalLoadKg = CERVICAL_LOAD_KG(forwardHeadCm);

  // ── THORACIC KYPHOSIS (lateral view only) ─────────────────────────────────
  // Estimated from shoulder-to-hip vector deviation from vertical (proxy method).
  // In a lateral view: sagittal trunk inclination reflects combined C/T/L curves.
  // The thoracic kyphosis estimate is only clinically interpretable in a lateral view.
  // Normal: 20–45° Cobb equivalent. This is a SCREEN, not a Cobb measurement.
  let thoracicAngle = null;
  if (shMid && hipMid) {
    const dx = shMid.x - hipMid.x; // +ve = shoulders anterior to hips
    const dy = Math.abs(shMid.y - hipMid.y);
    if (dy > 0.06) {
      // Base angle from trunk inclination; offset to clinical kyphosis range
      const inclination = Math.atan2(Math.abs(dx), dy) * 180 / Math.PI;
      // Inclination 0° = perfectly vertical trunk → normal kyphosis ~32°
      // Inclination 5° → ~40°, 10° → ~50°, 15° → ~60°
      thoracicAngle = r1(clamp(32 + inclination * 1.8, 20, 80));
    }
  }

  // ── LUMBAR / PELVIC TILT (lateral view) ───────────────────────────────────
  // Lumbar proxy: horizontal offset of hip midpoint from midpoint of knee+heel
  // +ve = hips anterior to knees → anterior pelvic tilt / hyperlordosis
  // -ve = hips posterior → posterior tilt / flat back
  let lumbarProxy = null, lordosisAngle = null;
  if (hipMid && kneeMid && heelMid) {
    const kneeHeelMidX = (kneeMid.x + heelMid.x) / 2;
    lumbarProxy = r1((hipMid.x - kneeHeelMidX) * 100);
  }
  // Lordosis angle from Z-depth only — guard with meaningful Z difference
  if (hasZ && hipZ !== null && kneeZ !== null && Math.abs(hipZ-kneeZ) > 0.005)
    lordosisAngle = r1(clamp(50 + (hipZ-kneeZ)*100*2.2, 15, 85));

  // Pelvic tilt sagittal: alias of lumbarProxy for naming consistency
  const pelvicTiltSagittal = lumbarProxy;
  const anteriorPelvicTiltDeg = lumbarProxy !== null && calibration?.frameHeightPx
    ? r1(clamp(Math.abs(lumbarProxy) * 0.75, 0, 38)) : null;

  // Hip plumb line deviation (lateral view)
  const hipExtensionProxy = hipMid && ankleMid ? r1((hipMid.x - ankleMid.x)*100) : null;

  // ── KNEE ANGLES ────────────────────────────────────────────────────────────
  // vec3Angle computes the interior angle at the middle point (knee)
  // using hip-knee-ankle triangle. 180° = fully extended (neutral).
  // < 180° = flexed; > 180° not geometrically possible in 2D — treated as 180°.
  // Deviation from 180° in hyperextension direction requires lateral view context.
  const leftKneeAngle  = Vboth(23,25,27) ? vec3Angle(g(23),g(25),g(27)) : null;
  const rightKneeAngle = Vboth(24,26,28) ? vec3Angle(g(24),g(26),g(28)) : null;
  const leftKneeDev    = leftKneeAngle  !== null ? r1(leftKneeAngle  - 180) : null; // -ve = hyperext
  const rightKneeDev   = rightKneeAngle !== null ? r1(rightKneeAngle - 180) : null;

  // Ankle dorsiflexion (lateral view)
  const leftAnkleAngle  = Vboth(25,27,31) ? vec3Angle(g(25),g(27),g(31)) : null;
  const rightAnkleAngle = Vboth(26,28,32) ? vec3Angle(g(26),g(28),g(32)) : null;

  // ── BILATERAL SYMMETRY ─────────────────────────────────────────────────────
  // Expressed as Y-coordinate difference × 100 (normalised to frame height)
  const shoulderSymmetry = Vboth(11,12) ? { left:g(11).y, right:g(12).y, diff:r1((g(11).y-g(12).y)*100) } : null;
  const hipSymmetry      = Vboth(23,24) ? { left:g(23).y, right:g(24).y, diff:r1((g(23).y-g(24).y)*100) } : null;
  const kneeSymmetry     = Vboth(25,26) ? { left:g(25).y, right:g(26).y, diff:r1((g(25).y-g(26).y)*100) } : null;
  const ankleSymmetry    = Vboth(27,28) ? { left:g(27).y, right:g(28).y, diff:r1((g(27).y-g(28).y)*100) } : null;

  // Leg length discrepancy proxy (Woerman indirect method — knee height asymmetry)
  // Clinical note: >5mm LLD is clinically significant; proxy only — confirm with tape measure
  const lldProxy = kneeSymmetry ? r1(Math.abs(kneeSymmetry.diff)*1.8) : null;
  const lldSide  = kneeSymmetry ? (kneeSymmetry.diff > 0 ? "Left" : "Right") : null;

  // ── SCAPULAR METRICS ───────────────────────────────────────────────────────
  const scapularAsymm    = Vboth(11,12) ? r1(Math.abs((g(11).y||0)-(g(12).y||0))*100) : null;
  const scapularAbduction= shoulderWidth && hipWidth ? r1((shoulderWidth-hipWidth)*100) : null;

  // ── FOOT PROGRESSION ANGLES ────────────────────────────────────────────────
  // Angle of foot vector (ankle to toe) from vertical — normal: 0–15° toe-out
  const leftFootAngle  = Vboth(31,27) ? r1(Math.atan2(g(31).y-g(27).y, g(31).x-g(27).x)*180/Math.PI) : null;
  const rightFootAngle = Vboth(32,28) ? r1(Math.atan2(g(32).y-g(28).y, g(32).x-g(28).x)*180/Math.PI) : null;

  // ── SCOLIOSIS SCREEN (posterior view only) ────────────────────────────────
  // Cobb estimate from shoulder-pelvis angle discrepancy.
  // IMPORTANT: This is a SCREEN only. True Cobb requires standing AP X-ray.
  // Only report when both shoulder and pelvis angles are available and reliable.
  const cobbEstimate = shoulderAngle !== null && pelvisAngle !== null
    ? r1(Math.abs(shoulderAngle - pelvisAngle)) : null;
  const c7PlumbDev   = V(0) && hipMid ? r1((g(0).x - hipMid.x)*100) : null;

  // ── CENTRE OF GRAVITY ─────────────────────────────────────────────────────
  // Weighted average of key body segment centres (head, shoulder, hip, foot)
  // Normal: within ±4% of frame centre (0.5)
  const cogParts    = [V(0)?g(0):null, shMid, hipMid, footMid].filter(Boolean);
  const cogX        = cogParts.length >= 2 ? cogParts.reduce((s,p)=>s+(p.x||0),0)/cogParts.length : null;
  const cogDeviation= cogX !== null ? r1((cogX - 0.5)*100) : null;

  // ── POSTURAL LOAD INDEX (PLI) ─────────────────────────────────────────────
  // Composite measure of multi-system postural burden.
  // Each component is normalised to its clinical threshold (1.0 = at threshold).
  // Weights reflect relative contribution to clinical load (Reinecke & Hazard adapted).
  // FIXED: using clinically-grounded normal thresholds to prevent inflation.
  // A PLI of 0 = perfect posture, 100 = maximum clinically observed load.
  const PLI_components = [
    // [measured_value, normal_threshold, severity_threshold, weight]
    [Math.abs(shoulderAngle||0),    3,  7,  1.0],  // shoulder tilt
    [Math.abs(pelvisAngle||0),      3,  7,  1.2],  // pelvic obliquity
    [Math.abs(headLateralOffset||0),3,  7,  0.8],  // head lateral shift
    [Math.abs(trunkLateralShift||0),4,  8,  1.0],  // trunk shift
    [Math.abs(fhpNorm||0),          3,  8,  1.5],  // forward head (% frame)
    [Math.abs(cobbEstimate||0),     5, 10,  1.3],  // scoliosis screen
    [Math.abs(cogDeviation||0),     4,  8,  1.0],  // COG deviation
    [Math.abs(lumbarProxy||0),      4,  9,  1.2],  // lumbar/pelvic tilt
  ].filter(([v]) => v !== null && !isNaN(v));

  // Normalised score: 0 if within normal, linear up to 1.0 at severity threshold
  const pliSum = PLI_components.reduce((s, [v, norm, sev, w]) => {
    const normalised = v <= norm ? 0 : Math.min(1, (v - norm) / (sev - norm));
    return s + normalised * w;
  }, 0);
  const pliMaxPossible = PLI_components.reduce((s, [,,, w]) => s + w, 0);
  const posturalLoadIndex = pliMaxPossible > 0
    ? r1(clamp((pliSum / pliMaxPossible) * 100, 0, 100)) : null;

  // ── UCS / LCS SYNDROME INDICES (Janda) ────────────────────────────────────
  const ucsIndex = r1(
    (Math.abs(headLateralOffset||0)/5)*0.3 +
    (Math.abs(shoulderAngle||0)/5)*0.2 +
    ((thoracicAngle||40)-40 > 0 ? ((thoracicAngle||40)-40)/15 : 0)*0.3 +
    (cvaAngle !== null && cvaAngle < 55 ? (55-cvaAngle)/15 : 0)*0.4
  );
  const lcsIndex = r1(
    (Math.abs(pelvicTiltSagittal||0)/6)*0.5 +
    (Math.abs(lumbarProxy||0)/8)*0.4 +
    (Math.abs(weightBearingShift||0)/5)*0.1
  );

  return {
    // Frontal
    shoulderAngle, pelvisAngle, kneeAngle, ankleAngle, eyeLevelAngle,
    headLateralOffset, trunkLateralShift, pelvicObliquity, weightBearingShift,
    spinalDeviation, trunkRotationProxy, leftKneeFrontal, rightKneeFrontal,
    // Sagittal
    forwardHeadMm, forwardHeadCm, cvaAngle, cervicalLoadKg,
    thoracicAngle, lumbarProxy, lordosisAngle, pelvicTiltSagittal,
    anteriorPelvicTiltDeg, hipExtensionProxy,
    leftKneeAngle, rightKneeAngle, leftKneeDev, rightKneeDev,
    leftAnkleAngle, rightAnkleAngle,
    // Bilateral symmetry + LLD
    shoulderSymmetry, hipSymmetry, kneeSymmetry, ankleSymmetry, lldProxy, lldSide,
    // Regional
    scapularAsymm, scapularAbduction, leftFootAngle, rightFootAngle,
    // Composite
    cobbEstimate, c7PlumbDev, cogDeviation, posturalLoadIndex, ucsIndex, lcsIndex,
    hasZ,
  };
}

// ─── RELIABILITY ENGINE ───────────────────────────────────────────────────────
// Assesses MediaPipe landmark confidence and returns:
//   score: 0–100 overall confidence
//   status: Excellent / Good / Fair / Poor / Insufficient
//   blocked: true if image quality is too low to produce any findings
//   warnings: clinician-facing messages
//   icc: intraclass correlation coefficient estimate (proxy)
function ReliabilityEngine(lm) {
  if (!lm) return { score:0, status:"Insufficient", blocked:true, warnings:[], confidence:{} };

  // Key clinical landmarks required for a valid posture assessment
  const KEY   = [0,2,5,7,8,11,12,23,24,25,26,27,28,29,30,31,32];
  const NAMES = {0:"Nose/Head",2:"L.Eye",5:"R.Eye",7:"L.Ear",8:"R.Ear",
    11:"L.Shoulder",12:"R.Shoulder",23:"L.Hip/ASIS",24:"R.Hip/ASIS",
    25:"L.Knee",26:"R.Knee",27:"L.Ankle",28:"R.Ankle",
    29:"L.Heel",30:"R.Heel",31:"L.FootToe",32:"R.FootToe"};

  const confidence = {};
  KEY.forEach(i => { confidence[i] = { name:NAMES[i], value:Math.round((lm[i]?.visibility||0)*100) }; });
  const visValues = KEY.map(i => lm[i]?.visibility||0);
  const mean = visValues.reduce((s,v)=>s+v,0)/KEY.length;

  // CRITICAL landmarks — if these are below threshold, the analysis is unreliable
  const criticalLandmarks = [
    { idx:11, name:"L.Shoulder" }, { idx:12, name:"R.Shoulder" },
    { idx:23, name:"L.Hip/ASIS" }, { idx:24, name:"R.Hip/ASIS" },
    { idx:0,  name:"Head/Nose"  },
  ];
  const failedCritical = criticalLandmarks.filter(c => (lm[c.idx]?.visibility||0) < 0.45);

  // Block analysis entirely if:
  // (a) mean confidence < 0.40 (poor overall detection)
  // (b) more than 1 critical landmark below threshold
  // (c) both shoulders OR both hips below threshold simultaneously
  const bothShouldersLow = (lm[11]?.visibility||0) < 0.45 && (lm[12]?.visibility||0) < 0.45;
  const bothHipsLow = (lm[23]?.visibility||0) < 0.45 && (lm[24]?.visibility||0) < 0.45;
  const blocked = mean < 0.40 || failedCritical.length > 1 || bothShouldersLow || bothHipsLow;

  const warnings = [];

  if (blocked) {
    warnings.push({ icon:"🚫", text:"Image quality insufficient for reliable analysis — improve lighting, ensure full body visible, use form-fitting clothing", color:PC.red, priority:6 });
  } else if (mean < 0.55) {
    warnings.push({ icon:"⚠", text:"Low confidence — findings may be inaccurate. Improve lighting and camera distance", color:PC.red, priority:5 });
  } else if (mean < 0.70) {
    warnings.push({ icon:"○", text:"Partial tracking — some measurements limited. Ensure full body in frame", color:PC.yellow, priority:3 });
  }

  const lowVis = KEY.filter(i => (lm[i]?.visibility||0) < 0.45);
  if (!blocked && lowVis.length > 5)
    warnings.push({ icon:"👁", text:`${lowVis.length} landmarks low confidence — affected measurements marked unreliable`, color:PC.yellow, priority:4 });

  const lShVis = lm[11]?.visibility||0, rShVis = lm[12]?.visibility||0;
  if (!blocked && Math.abs(lShVis-rShVis) > 0.40)
    warnings.push({ icon:"↔", text:"Asymmetric shoulder visibility — bilateral shoulder measurements may be inaccurate", color:PC.yellow, priority:3 });

  if (!blocked && (lm[23]?.visibility||0) < 0.45 || (lm[24]?.visibility||0) < 0.45)
    warnings.push({ icon:"⊖", text:"Hip/ASIS partially occluded — pelvic measurements flagged unreliable", color:PC.yellow, priority:3 });

  if ((lm[7]?.visibility||0) < 0.45 && (lm[8]?.visibility||0) < 0.45)
    warnings.push({ icon:"👂", text:"Ears not detected — CVA and forward head posture cannot be assessed", color:PC.yellow, priority:2 });

  if ((lm[31]?.visibility||0) < 0.35 && (lm[32]?.visibility||0) < 0.35)
    warnings.push({ icon:"🦶", text:"Feet not visible — move camera back or lower for full-body capture", color:PC.yellow, priority:2 });

  const hasZ = lm[7] && lm[11] && Math.abs((lm[7].z||0)-(lm[11].z||0)) > 0.002;
  if (!hasZ && !blocked)
    warnings.push({ icon:"📐", text:"Sagittal depth data limited — use lateral view for kyphosis/CVA assessment", color:PC.muted, priority:1 });

  warnings.sort((a,b) => (b.priority||0)-(a.priority||0));

  const status = blocked ? "Insufficient" : mean > 0.80 ? "Excellent" : mean > 0.65 ? "Good" : mean > 0.50 ? "Fair" : "Poor";
  // ICC proxy (0.40 base + confidence-scaled; represents approximate test-retest reliability)
  const icc = r1(Math.min(0.95, 0.35 + mean * 0.60));

  return { score:Math.round(mean*100), status, blocked, warnings, confidence, icc };
}

// ─── CLINICAL FINDINGS ENGINE ─────────────────────────────────────────────────
// Thresholds: Kendall (2005), Magee (2014), Levangie & Norkin (2011),
// Sahrmann (2002), Comerford & Mottram (2012), Hansraj (2014)
function ClinicalFindingsEngine(lm, view, measurements) {
  if (!lm || !measurements) return [];
  const findings = [];
  const {
    shoulderAngle, pelvisAngle, kneeAngle, ankleAngle, eyeLevelAngle,
    headLateralOffset, trunkLateralShift, spinalDeviation, trunkRotationProxy,
    forwardHeadMm, forwardHeadCm, cvaAngle, cervicalLoadKg,
    thoracicAngle, lordosisAngle, pelvicTiltSagittal, anteriorPelvicTiltDeg,
    leftKneeDev, rightKneeDev, leftAnkleAngle, rightAnkleAngle,
    leftKneeFrontal, rightKneeFrontal, hipExtensionProxy,
    cobbEstimate, c7PlumbDev, cogDeviation, weightBearingShift,
    scapularAsymm, leftFootAngle, rightFootAngle,
    lldProxy, lldSide, ucsIndex, lcsIndex, posturalLoadIndex, lumbarProxy,
  } = measurements;

  const add = (region, text, severity, correction, icd="M99.0", icon="●", detail="", norm="", value=null) =>
    findings.push({ region, text, severity, correction, icd, icon, detail, norm, value });

  // ── ANTERIOR VIEW ─────────────────────────────────────────────────────────
  if (view === "anterior") {

    // Eye level tilt
    if (eyeLevelAngle !== null && Math.abs(eyeLevelAngle) > 2) {
      const side = eyeLevelAngle > 0 ? "Left" : "Right"; const abs = Math.abs(eyeLevelAngle);
      add("Cranial / Cervical", `Eye level tilted — ${side} eye lower (${abs.toFixed(1)}°)`, abs > 5 ? "high" : "moderate",
        `Check ocular righting reflex. Cervical lateral flexion mobility assessment. Consider vestibular/visual dominance contributing to head tilt. Refer optometry if >5° and consistent.`,
        "H53.9", "👁", `Ocular reflex drives cervical compensation — rule out visual asymmetry before treating neck.`, "Normal: <2°", abs);
    }

    // Shoulder elevation
    if (shoulderAngle !== null && Math.abs(shoulderAngle) > 3) {
      const abs = Math.abs(shoulderAngle); const side = shoulderAngle > 0 ? "Left" : "Right";
      add("Shoulder Girdle", `${side} shoulder elevated (~${abs.toFixed(1)}°)`, abs > 7 ? "high" : "moderate",
        `Release: upper trapezius sustained pressure 90s + levator scapulae stretch 30s × 3. Activate: lower trapezius Y-T-W × 15. NKT: check ipsilateral QL — QL overactivity commonly drives ipsilateral shoulder elevation via thoracic chain. Reassess cervical rotation after release.`,
        "M54.2", "⇑", `Common drivers: ipsilateral QL, pain guarding, thoracic dysfunction, scoliosis.`, "Normal: <3°", abs);
    }

    // Head lateral offset
    if (headLateralOffset !== null && Math.abs(headLateralOffset) > 2.5) {
      const abs = Math.abs(headLateralOffset); const side = headLateralOffset > 0 ? "right" : "left";
      add("Cervical", `Head laterally shifted ${side} (${abs.toFixed(1)}%)`, abs > 5 ? "high" : "moderate",
        `Cervical lateral flexion mobilisation contralateral. SCM and scalene release ipsilateral. Assess ocular/vestibular contributions. Pillow height review.`,
        "M54.2", "↔", `Persistent shift: C2–C4 facet dysfunction, alar ligament laxity, or habitual visual dominance.`, "Normal: <2.5%", abs);
    }

    // Pelvic obliquity + LLD prompt
    if (pelvisAngle !== null && Math.abs(pelvisAngle) > 3) {
      const abs = Math.abs(pelvisAngle); const high = pelvisAngle > 0 ? "Left" : "Right";
      const lldNote = lldProxy !== null && lldProxy > 5
        ? ` Knee height asymmetry suggests ~${lldProxy.toFixed(0)}mm functional LLD (${lldSide} side shorter).` : "";
      add("Pelvis / SIJ", `${high} ASIS elevated (${abs.toFixed(1)}°)${lldNote ? " + LLD suspected" : ""}`, abs > 7 ? "high" : "moderate",
        `Functional LLD: tape iliac crest to medial malleolus bilateral. If LLD >5mm: heel wedge trial 3–5mm. QL release elevated side. Hip abductor strengthening depressed side. SIJ provocation cluster (distraction, compression, thigh thrust, Gaenslen, sacral thrust — positive ≥3/5). Lumbar PA L4–S1.`,
        "M53.3", "⊖", `${abs.toFixed(1)}°. >7° — structural LLD screen (long-leg X-ray).${lldNote}`, "Normal: <3°", abs);
    }

    // Trunk lateral shift
    if (trunkLateralShift !== null && Math.abs(trunkLateralShift) > 3.5) {
      const abs = Math.abs(trunkLateralShift); const side = trunkLateralShift > 0 ? "right" : "left";
      add("Thoracic", `Trunk laterally shifted ${side} (${abs.toFixed(1)}%)`, abs > 7 ? "high" : "moderate",
        `Assess antalgic lean (disc/radiculopathy — trunk shifts AWAY from herniation in paracentral disc, TOWARD in lateral disc). Lateral trunk stretch contralateral. Rib mobilisation. Mirror feedback.`,
        "M54.5", "⇒", `Lateral trunk shift highly associated with L4/L5 disc herniation.`, "Normal: <3.5%", abs);
    }

    // Scoliosis / spinal deviation
    if (spinalDeviation !== null && Math.abs(spinalDeviation) > 4) {
      const abs = Math.abs(spinalDeviation);
      add("Spine", `C-plumb deviation — head not centred over pelvis (${abs.toFixed(1)}%)`, abs > 8 ? "high" : "moderate",
        `Adam's forward bend test — observe for rib hump. Confirm in posterior view. Refer for standing AP X-ray if structural scoliosis suspected. Schroth method if confirmed.`,
        "M41.9", "〜", `Must distinguish functional (reversible) from structural (fixed) scoliosis via Adam's bend test.`, "Normal: <4%", abs);
    }

    if (cobbEstimate !== null && cobbEstimate > 5) {
      add("Spine", `Scoliosis screen — estimated Cobb equivalent ${cobbEstimate.toFixed(0)}° (shoulder-pelvis differential)`, cobbEstimate > 10 ? "high" : "moderate",
        `Adam's forward bend test immediately. If rib prominence: refer for standing AP spine X-ray. Cobb >10° = confirmed scoliosis. >25° = bracing. >45° = surgical threshold. Schroth physiotherapy.`,
        "M41.9", "〜", `Shoulder (${shoulderAngle?.toFixed(1)}°) vs pelvis (${pelvisAngle?.toFixed(1)}°) differential.`, "Normal: <5°", cobbEstimate);
    }

    // Knee alignment frontal plane
    [[leftKneeFrontal,"Left","M21.0"],[rightKneeFrontal,"Right","M21.0"]].forEach(([kf,side,icd])=>{
      if (kf === null || Math.abs(kf) <= 5) return;
      const abs = Math.abs(kf); const pattern = kf < 0 ? "valgus (knock-knee)" : "varus (bow-leg)";
      add("Knee", `${side} knee ${pattern} — hip-knee-ankle misalignment (${abs.toFixed(1)}°)`, abs > 10 ? "high" : "moderate",
        kf < 0
          ? `Glute med: clamshells, lateral band walks, SL squat valgus correction. VMO: terminal knee extensions. Foot tripod activation. Assess tibial torsion and subtalar pronation.`
          : `Hip ER strengthening. Ober test (ITB/TFL). Lateral chain SMR. Assess subtalar supination. Consider orthotics.`,
        icd, "⊾", `Dynamic valgus: primary driver of PFP, ACL injury, medial OA. Glute med weakness in 80% of functional valgus.`, "Normal: <5°", abs);
    });

    // Weight-bearing asymmetry
    if (weightBearingShift !== null && Math.abs(weightBearingShift) > 4) {
      const abs = Math.abs(weightBearingShift); const side = weightBearingShift > 0 ? "right" : "left";
      add("Balance / Loading", `Weight-bearing asymmetry — loading toward ${side} (${abs.toFixed(1)}%)`, abs > 8 ? "high" : "moderate",
        `Mirror biofeedback bilateral stance. Scales under each foot if available. Retrain equal loading. Identify driver: pain avoidance, LLD, or habit.`,
        "M62.9", "⊖", `Asymmetric loading >6% associated with increased ipsilateral knee/hip OA progression.`, "Normal: <4%", abs);
    }

    // Foot progression angles
    [[leftFootAngle,"Left"],[rightFootAngle,"Right"]].forEach(([angle,side])=>{
      if (angle === null || Math.abs(angle) <= 20) return;
      const abs = Math.abs(angle);
      add("Foot / Ankle", `${side} foot ${angle > 0 ? "externally" : "internally"} rotated (${abs.toFixed(0)}°)`, abs > 30 ? "high" : "moderate",
        angle > 0
          ? `Check tibial external torsion, hip ER contracture, glute med/TFL balance. Gait retraining feet-parallel.`
          : `Check tibial internal torsion, hip IR dominance, in-toeing gait. Refer podiatry if structural torsion.`,
        "M21.6", "↻", `Normal foot progression angle 5–12° external.`, "Normal: 5–12°", abs);
    });

    // COG deviation
    if (cogDeviation !== null && Math.abs(cogDeviation) > 5) {
      const abs = Math.abs(cogDeviation);
      add("Global Posture", `COG shifted ${cogDeviation > 0 ? "right" : "left"} (${abs.toFixed(1)}%)`, abs > 9 ? "high" : "moderate",
        `Global postural reset: proprioceptive training single-leg stance, mirror biofeedback, perturbation training. Identify structural driver before retraining.`,
        "M62.9", "⊕", "", "Normal: <5%", abs);
    }

    // UCS pattern
    if (ucsIndex !== null && ucsIndex > 0.6) {
      add("Upper Crossed Syndrome", `UCS pattern detected — index ${ucsIndex.toFixed(1)} (${ucsIndex > 1.0 ? "severe" : "moderate"})`, ucsIndex > 1.0 ? "high" : "moderate",
        `INHIBIT (SMR ×90s): upper trap, SCM, pec minor, levator scapulae. ACTIVATE: deep neck flexors (chin nod ×10 ×3), lower trap (Y-T-W ×15), serratus (wall push-up plus ×15). MOBILISE: thoracic extension foam roller T4–T8 ×2min. CORRECT: monitor height +5cm. NKT reprogram within 30s of release.`,
        "M62.9", "✗", `UCS (Janda 1979): overactive upper trap/SCM/pec minor ↔ inhibited DNF/lower trap/serratus. Drives FHP, rounded shoulders, kyphosis, cervicogenic headache.`, "UCS Index: <0.4 normal", ucsIndex);
    }

    // LCS pattern
    if (lcsIndex !== null && lcsIndex > 0.5) {
      add("Lower Crossed Syndrome", `LCS pattern detected — index ${lcsIndex.toFixed(1)} (${lcsIndex > 1.0 ? "severe" : "moderate"})`, lcsIndex > 1.0 ? "high" : "moderate",
        `INHIBIT (SMR ×90s): hip flexors (psoas, RF, TFL), thoracolumbar erectors, QL. ACTIVATE: glute max (bridges ×15, hip thrusts ×10), glute med (clamshells, lateral band walks), TA/core (dead bug ×10). STRETCH: couch stretch 90s/side. CORRECT: pelvic neutral awareness, seated posture retraining.`,
        "M62.9", "✗", `LCS (Janda): overactive hip flexors/lumbar extensors ↔ inhibited glutes/abdominals. Drives APT, hyperlordosis, knee valgus.`, "LCS Index: <0.4 normal", lcsIndex);
    }
  }

  // ── POSTERIOR VIEW ────────────────────────────────────────────────────────
  if (view === "posterior") {

    if (shoulderAngle !== null && Math.abs(shoulderAngle) > 3) {
      const abs = Math.abs(shoulderAngle); const side = shoulderAngle > 0 ? "Left" : "Right";
      add("Shoulder Girdle", `${side} shoulder elevated — posterior view (${abs.toFixed(1)}°)`, abs > 7 ? "high" : "moderate",
        `Upper trapezius and levator scapulae release ipsilateral. Lower trapezius facilitation. Confirm anterior view finding.`,
        "M54.2", "⇑", "", "Normal: <3°", abs);
    }

    if (cobbEstimate !== null && cobbEstimate > 5) {
      add("Spine", `Scoliosis suspected — Cobb estimate ${cobbEstimate.toFixed(0)}° (posterior definitive view)`, cobbEstimate > 10 ? "high" : "moderate",
        `Adam's forward bend test immediately (rib hump = positive → refer). Standing AP spine X-ray for true Cobb. Cobb 10–25°: monitor + Schroth. >25°: bracing. >45°: surgical threshold.`,
        "M41.9", "〜", `C7 plumb: ${c7PlumbDev !== null ? Math.abs(c7PlumbDev).toFixed(1)+"% from sacral midpoint" : "not calculated"}. Shoulder ${shoulderAngle?.toFixed(1)}° vs pelvis ${pelvisAngle?.toFixed(1)}°.`, "Normal: <5°", cobbEstimate);
    }

    if (c7PlumbDev !== null && Math.abs(c7PlumbDev) > 4) {
      const abs = Math.abs(c7PlumbDev);
      add("Spine", `C7 plumb deviation — head shifted ${c7PlumbDev > 0 ? "right" : "left"} of sacral midpoint (${abs.toFixed(1)}%)`, abs > 8 ? "high" : "moderate",
        `C7 plumb gold standard for coronal balance. If structural deviation >4cm: orthopaedic spine referral. If functional: treat driver (LLD, pain, QL).`,
        "M41.9", "〜", "", "Normal: <4%", abs);
    }

    if (pelvisAngle !== null && Math.abs(pelvisAngle) > 3) {
      const abs = Math.abs(pelvisAngle);
      add("Pelvis / SIJ", `Pelvic obliquity posterior — ${pelvisAngle > 0 ? "Left" : "Right"} elevated (${abs.toFixed(1)}°)`, abs > 7 ? "high" : "moderate",
        `Confirm with LLD tape measure. SIJ provocation cluster. QL release elevated side.`,
        "M53.3", "⊖", "", "Normal: <3°", abs);
    }

    if (scapularAsymm !== null && scapularAsymm > 2.5) {
      add("Scapula", `Scapular height asymmetry — posterior view (${scapularAsymm.toFixed(1)}° differential)`, scapularAsymm > 5 ? "high" : "moderate",
        `NKT screen: serratus anterior vs pec minor. Lower trap Y-T-W ×15. Wall push-up plus (serratus). Thoracic extension mobility. If winging visible: test serratus (wall push-up — medial border lifting = Type II dyskinesis).`,
        "M89.8", "⇑", `Kibler types: I=inferior angle, II=medial border (serratus weakness), III=superior elevation (upper trap dominant).`, "Normal: <2.5°", scapularAsymm);
    }

    if (trunkRotationProxy !== null && Math.abs(trunkRotationProxy) > 8) {
      add("Thoracic", `Trunk rotation asymmetry (shoulder-to-hip width ratio ${Math.abs(trunkRotationProxy).toFixed(0)}%)`, Math.abs(trunkRotationProxy) > 15 ? "high" : "moderate",
        `Thoracic rotation PA mobilisation bilateral. Foam roller thoracic rotation stretch. Assess axial rotation restriction.`,
        "M99.0", "↻", "", "Normal: <8%", Math.abs(trunkRotationProxy));
    }

    if (weightBearingShift !== null && Math.abs(weightBearingShift) > 4) {
      const abs = Math.abs(weightBearingShift);
      add("Balance / Loading", `Weight-bearing asymmetry posterior — shifted ${weightBearingShift > 0 ? "right" : "left"} (${abs.toFixed(1)}%)`, abs > 8 ? "high" : "moderate",
        `Quantify with scales. Mirror biofeedback. Treat driver: pain, LLD, or proprioceptive deficit.`,
        "M62.9", "⊖", "", "Normal: <4%", abs);
    }
  }

  // ── LATERAL VIEW ─────────────────────────────────────────────────────────
  if (view === "left" || view === "right") {

    // CVA — primary lateral finding
    if (cvaAngle !== null && cvaAngle < 55) {
      const sev = cvaAngle < 42 ? "high" : "moderate";
      const loadStr = cervicalLoadKg !== null ? ` Est. cervical load: ${cervicalLoadKg}kg (neutral=4.5kg).` : "";
      add("Cervical — Forward Head", `Forward head posture — CVA ${cvaAngle.toFixed(0)}° (normal >55°)${forwardHeadCm !== null ? ` / ${forwardHeadCm.toFixed(1)}cm anterior` : ""}`, sev,
        `IMMEDIATE: supine chin nod (NOT chin tuck) ×10 ×3 sets, 10s hold. Thoracic extension foam roller T4–T8 ×2min daily. Suboccipital release 90s. Ergonomic: raise monitor 5–10cm, keyboard at elbow height. NKT: SCM+scalenes overactive → inhibit → activate DNF within 30s. Home cue: tongue to roof of mouth.`,
        "M43.6", "⇒", `CVA ${cvaAngle.toFixed(0)}° (Yip 2008).${loadStr} Each 2.5cm FHP adds ~5kg to cervical extensors (Hansraj 2014).`, "Normal: >55°", cvaAngle);
    } else if (cvaAngle === null && forwardHeadMm !== null && Math.abs(forwardHeadMm) > 3) {
      const abs = Math.abs(forwardHeadMm);
      add("Cervical — Forward Head", `Forward head posture — ear anterior to acromion (${abs.toFixed(1)}% offset)`, abs > 7 ? "high" : "moderate",
        `Deep cervical flexor activation. Thoracic extension foam roller. Ergonomic review. Take true lateral photo for CVA measurement.`,
        "M43.6", "⇒", "Obtain lateral photo for CVA measurement — more accurate than frontal view proxy.", "Normal: ear over acromion", abs);
    }

    // Thoracic kyphosis
    if (thoracicAngle !== null && thoracicAngle - 45 > 8) {
      const excess = thoracicAngle - 45;
      add("Thoracic Kyphosis", `Increased thoracic kyphosis (~${thoracicAngle.toFixed(0)}°, normal 20–45°)`, excess > 18 ? "high" : "moderate",
        `Thoracic extension HVLA T4–T8 (PA + rotation). Foam roller extension apex ×2min daily. Wall angels ×15. Pec minor stretch 60s ×3. Lower trap: prone Y-T-W. Rib expansion breathing. Seated posture: lumbar roll support.`,
        "M40.2", "⌒", `Normal Cobb T1–T12 = 20–45°. Hyperkyphosis >50°. If structural: Scheuermann's (>5° wedging ≥3 vertebrae on X-ray).`, "Normal: 20–45°", thoracicAngle);
    }

    // Pelvic tilt sagittal
    if (pelvicTiltSagittal !== null && Math.abs(pelvicTiltSagittal) > 4) {
      const abs = Math.abs(pelvicTiltSagittal); const ant = pelvicTiltSagittal > 0;
      const angleNote = anteriorPelvicTiltDeg !== null ? ` (~${anteriorPelvicTiltDeg.toFixed(0)}° tilt, female norm ~12°, male norm ~7°)` : "";
      const lordNote  = lordosisAngle !== null ? ` Est. lordosis: ${lordosisAngle.toFixed(0)}° (normal 40–60°).` : "";
      add("Lumbar / Pelvis",
        ant ? `Anterior pelvic tilt${angleNote} — increased lumbar lordosis` : `Posterior pelvic tilt${angleNote} — flat back`,
        abs > 9 ? "high" : "moderate",
        ant
          ? `INHIBIT (SMR ×90s): psoas, RF, TFL. STRETCH: couch stretch 90s/side, 90-90 hip flexor. ACTIVATE: glute max (bridges ×15), TA (dead bug ×10). CORRECT: pelvic posterior tilt awareness. Thomas test to confirm hip flexor contracture. 90/90 hamstring length check.`
          : `Lumbar extension mobilisation PA L1–L5 grade III–IV. McKenzie extension: prone → press-up. Hip flexor facilitation. Assess erector spinae/multifidus tone. Sahrmann lumbar flexion syndrome screen.`,
        "M53.3", "↕",
        ant
          ? `ASIS drops below PSIS — hip flexor/erector overactivity. LCS pattern. Increases lumbar disc posterior load.${lordNote}`
          : `PSIS inferior to ASIS — hamstring/abdominal overactivity or gluteal inhibition.${lordNote}`,
        ant ? "Normal APT: female ≤12°, male ≤7°" : "Normal lordosis: 40–60°", abs);
    } else if ((pelvicTiltSagittal === null) && lumbarProxy !== null && Math.abs(lumbarProxy) > 4) {
      const abs = Math.abs(lumbarProxy); const ant = lumbarProxy > 0;
      add("Lumbar / Pelvis", `${ant ? "Anterior" : "Posterior"} pelvic tilt pattern`, abs > 8 ? "high" : "moderate",
        ant
          ? `Hip flexor stretch ×60s. Glute activation — bridges ×15. TVA bracing. Pelvic tilt awareness drills.`
          : `Lumbar extension mobilisation. Hip flexor facilitation. Multifidus activation. McKenzie extension.`,
        "M53.3", "↕", "", "", abs);
    }

    // ── LUMBAR LORDOSIS — independent finding ─────────────────────────────────
    if (lordosisAngle !== null) {
      if (lordosisAngle > 60) {
        const excess = lordosisAngle - 60;
        add("Lumbar — Hyperlordosis",
          `Increased lumbar lordosis (~${lordosisAngle.toFixed(0)}°, normal 40–60°)`,
          excess > 20 ? "high" : "moderate",
          `INHIBIT: iliopsoas (couch stretch 90s×2), rectus femoris (prone heel-to-glute). ACTIVATE: glute max (bridges ×15 with posterior pelvic tilt), TA (dead bug). Pelvic clock: anterior → neutral → posterior tilt awareness. Assess hip flexor contracture (Thomas test).`,
          "M40.5", "↕",
          `Hyperlordosis: ASIS drops below PSIS. Increases L4–L5 disc posterior compression and facet loading. Associated with hip flexor tightness and gluteal inhibition.`,
          "Normal: 40–60°", lordosisAngle);
      } else if (lordosisAngle < 30) {
        add("Lumbar — Flat Back / Reduced Lordosis",
          `Reduced lumbar lordosis (~${lordosisAngle.toFixed(0)}°, normal 40–60°)`,
          lordosisAngle < 20 ? "high" : "moderate",
          `McKenzie extension progression: prone → prone on elbows → press-up. Lumbar PA mobilisation Grade III–IV L1–L5. Hip flexor facilitation. Erector spinae activation. Sahrmann lumbar flexion syndrome screen. Lumbar roll support for sitting.`,
          "M40.4", "↕",
          `Flat back: PSIS at same level or below ASIS. Increases anterior disc shear force and hamstring/abdominal overactivity. Reduced shock absorption capacity.`,
          "Normal: 40–60°", lordosisAngle);
      }
    }

    // ── SWAY-BACK POSTURE ─────────────────────────────────────────────────────
    // Pattern: hips posterior to plumb + thoracic posterior + FHP
    // hipExtensionProxy < -4 = hips behind plumb; thoracicAngle < 38 = less kyphosis
    const hipBehindPlumb = hipExtensionProxy !== null && hipExtensionProxy < -4;
    const hasReducedLordosis = lumbarProxy !== null && lumbarProxy < -3;
    if (hipBehindPlumb && hasReducedLordosis) {
      add("Posture Pattern — Sway-Back",
        `Sway-back posture: hips posterior to plumb, flat lumbar, thoracic lean`,
        "moderate",
        `INHIBIT: hamstrings (slump stretch, seated), abdominals (reduce over-bracing). ACTIVATE: hip flexors (psoas activation — standing hip flexion ×15), lumbar extensors (prone hip extension). Postural cue: shift hips forward over ankles. Lumbar roll support in sitting.`,
        "M40.3", "⟲",
        `Sway-back: pelvis shifts anterior, hips posterior to plumb. Hamstring + abdominal overactivity. Hip ligament loading increases. Associated with inactive standing posture and hypermobility.`,
        "Ideal: hip over plumb", null);
    }

    // ── MILITARY / FLAT POSTURE ───────────────────────────────────────────────
    // Reduced thoracic kyphosis + reduced lordosis + upright head (no FHP)
    const isMilitaryPosture = thoracicAngle !== null && thoracicAngle < 30
      && (lumbarProxy === null || Math.abs(lumbarProxy) < 3)
      && (cvaAngle === null || cvaAngle > 58);
    if (isMilitaryPosture) {
      add("Posture Pattern — Military / Flat Back",
        `Military/flat-back posture: reduced thoracic kyphosis and lumbar lordosis`,
        "moderate",
        `Thoracic mobility: foam roller extension at T4–T8 ×2min daily. Rib expansion breathing ×10. Restore natural curve: McKenzie press-ups (lumbar). Cervical retraction (NOT chin tuck). Reassure: flat-back is not always symptomatic — assess function.`,
        "M40.4", "⊥",
        `Flat/military: all spinal curves reduced. Poor sagittal shock absorption. Often asymptomatic but predisposes to disc overload in end-range activities. Screen for Scheuermann's.`,
        "Normal: T kyphosis 20–45°, L lordosis 40–60°", null);
    }

    // ── UPPER CROSSED SYNDROME (UCS) — sagittal flag ─────────────────────────
    // FHP + thoracic kyphosis + rounded shoulders (shoulder anterior to plumb)
    const shAnteriorToPlumb = hipExtensionProxy !== null && shPt && shPt.x !== undefined;
    const hasUCS_sagittal = cvaAngle !== null && cvaAngle < 52
      && thoracicAngle !== null && thoracicAngle > 45;
    if (hasUCS_sagittal) {
      add("Upper Crossed Syndrome (UCS)",
        `UCS pattern: forward head + thoracic kyphosis + rounded shoulders`,
        cvaAngle < 45 ? "high" : "moderate",
        `NKT Protocol — INHIBIT (90s SMR each): upper trapezius, SCM, scalenes, pec minor. ACTIVATE (3×15): deep cervical flexors (chin nod), lower trapezius (prone Y), serratus anterior (wall slide). CORRECT: thoracic extension foam roller T4–T8. Ergonomic: monitor at eye level, chair with lumbar support. Home: hourly upper trap/pec minor stretch.`,
        "M62.8", "⊕",
        `Janda UCS: tight pec minor + SCM + upper trap → inhibit lower trap + DNF + rhomboids. Creates forward head, kyphosis, shoulder impingement. CVA ${cvaAngle?.toFixed(0)}° confirms FHP component.`,
        "Ideal: CVA >55°, kyphosis 20–45°", cvaAngle);
    }

    // ── LOWER CROSSED SYNDROME (LCS) — sagittal flag ─────────────────────────
    // Anterior pelvic tilt + hyperlordosis + hip anterior to plumb
    const hasLCS_sagittal = pelvicTiltSagittal !== null && pelvicTiltSagittal > 5
      && thoracicAngle !== null && thoracicAngle > 42;
    if (hasLCS_sagittal) {
      add("Lower Crossed Syndrome (LCS)",
        `LCS pattern: anterior pelvic tilt + hyperlordosis + hip flexor dominance`,
        pelvicTiltSagittal > 10 ? "high" : "moderate",
        `NKT Protocol — INHIBIT (90s SMR each): iliopsoas, rectus femoris, TFL. ACTIVATE (3×15): glute max (bridges with posterior tilt), glute med (clams), TVA (dead bug). CORRECT: pelvic tilt awareness (posterior tilt drill ×20). Thomas test to confirm hip flexor contracture. Ely's test for RF.`,
        "M62.8", "⊕",
        `Janda LCS: tight iliopsoas + erector spinae → inhibit glute max + transversus abdominis. Creates anterior pelvic tilt, hyperlordosis, increased L4–L5 posterior disc load. APT ${pelvicTiltSagittal?.toFixed(1)}% confirms pelvic component.`,
        "Ideal: APT <7° female / <5° male", pelvicTiltSagittal);
    }

    // ── POSTURAL PATTERN LABEL — sagittal classification ─────────────────────
    // Adds a clear top-level pattern label to findings (Kendall classification)
    {
      const hasFHP_f      = cvaAngle !== null && cvaAngle < 52;
      const hasKyph_f     = thoracicAngle !== null && thoracicAngle > 48;
      const hasLord_f     = lordosisAngle !== null && lordosisAngle > 60;
      const hasFlat_f     = lordosisAngle !== null && lordosisAngle < 30;
      const hasSway_f     = hipBehindPlumb && hasReducedLordosis;
      const hasMilitary_f = isMilitaryPosture;

      let patternName = "Ideal Alignment";
      let patternTx   = "Maintain with: global stability training, thoracic mobility, hip flexibility.";
      let patternNote = "Plumb line passes through ear, acromion, greater trochanter, lateral knee and lateral malleolus. No significant sagittal deviations.";
      let patternSev  = null; // null = don't add if ideal

      if (hasSway_f) {
        patternName = "Sway-Back Posture";
        patternTx   = "Activate hip flexors. Shift hips forward. Lumbar extension mobility.";
        patternNote = "Hips posterior to plumb, flat lumbar, forward trunk lean. Hamstring/abdominal dominance.";
        patternSev  = "moderate";
      } else if (hasMilitary_f) {
        patternName = "Military / Flat-Back Posture";
        patternTx   = "Restore thoracic curve: foam roller extension. Restore lordosis: McKenzie.";
        patternNote = "Reduced thoracic kyphosis and lumbar lordosis. All curves diminished.";
        patternSev  = "moderate";
      } else if (hasFHP_f && hasKyph_f && hasLord_f) {
        patternName = "Lordotic-Kyphotic (UCS + LCS)";
        patternTx   = "Full postural correction programme. Address UCS and LCS simultaneously.";
        patternNote = "FHP + hyperkyphosis + hyperlordosis. Classic combined Upper and Lower Crossed Syndrome.";
        patternSev  = "high";
      } else if (hasKyph_f && hasLord_f) {
        patternName = "Lordotic-Kyphotic Posture";
        patternTx   = "Thoracic extension + hip flexor stretch + glute activation.";
        patternNote = "Thoracic kyphosis increased + lumbar lordosis increased. S-curve amplification.";
        patternSev  = "moderate";
      } else if (hasKyph_f && !hasLord_f) {
        patternName = "Kyphotic Posture (Thoracic)";
        patternTx   = "Thoracic extension foam roller + lower trapezius + pec minor stretch.";
        patternNote = "Increased thoracic kyphosis as primary finding. Scheuermann's or sedentary posture.";
        patternSev  = "moderate";
      } else if (hasLord_f && !hasKyph_f) {
        patternName = "Lordotic Posture";
        patternTx   = "Hip flexor inhibition + glute max activation + pelvic tilt awareness.";
        patternNote = "Hyperlordosis + anterior pelvic tilt. LCS pattern without significant thoracic component.";
        patternSev  = "moderate";
      } else if (hasFlat_f) {
        patternName = "Flat-Back Posture";
        patternTx   = "McKenzie extension + lumbar roll support + erector facilitation.";
        patternNote = "Reduced lumbar lordosis. Disc anterior shear risk. Assess hamstring and abdominal dominance.";
        patternSev  = "moderate";
      } else if (hasFHP_f && !hasKyph_f) {
        patternName = "Forward Head Posture (Isolated)";
        patternTx   = "DNF activation. Thoracic extension. Ergonomic review.";
        patternNote = "FHP without significant thoracic kyphosis. Cervical extensor overactivation. Screen and desk posture.";
        patternSev  = "moderate";
      }

      if (patternSev !== null) {
        add(`Sagittal Pattern — ${patternName}`,
          `Classification: ${patternName}`,
          patternSev,
          patternTx,
          "Z96.89", "◈",
          patternNote,
          "Ideal: Lordotic-Kyphotic-Lordotic balanced alignment", null);
      }
    }

    // Knee genu recurvatum
    // In lateral views (left/right), only the camera-facing knee is reliably visible.
    // Use the view label to correctly name which knee is being assessed.
    const isLateralView = view === "left" || view === "right";
    const lateralKneeSideLabel = view === "left" ? "Left" : view === "right" ? "Right" : null;

    [[leftKneeDev,"Left"],[rightKneeDev,"Right"]].forEach(([dev,side])=>{
      if (dev === null) return;
      // In lateral views: skip the non-camera-facing knee reading (unreliable)
      // and relabel the visible knee with the correct side from the view selection
      if (isLateralView) {
        // Only process the knee that MediaPipe would most reliably see in this view
        // Right lateral → right-side landmarks visible → rightKneeDev is reliable
        // Left lateral → left-side landmarks visible → leftKneeDev is reliable
        const expectedSide = view === "right" ? "Right" : "Left";
        if (side !== expectedSide) return; // skip the occluded knee
        // Relabel: in a right lateral photo, the visible knee is the RIGHT knee
        side = lateralKneeSideLabel;
      }
      if (dev < -5) {
        const abs = Math.abs(dev);
        add("Knee — Genu Recurvatum", `${side} knee hyperextension (genu recurvatum) — ${abs.toFixed(0)}° past neutral`, abs > 12 ? "high" : "moderate",
          `Hamstring eccentric: nordic curls, RDL. Calf eccentric: heel drops. Proprioception: SL stance with slight knee flexion cue. Avoid terminal knee locking. Lachman + anterior drawer. Check posterior capsule laxity.`,
          "M21.1", "⌣", `>5° increases posterior capsule strain and ACL load. >10° — Beighton score for hypermobility.`, "Normal: 0–5°", abs);
      } else if (dev > 10) {
        add("Knee — Flexion Stance", `${side} knee flexion in stance — ${dev.toFixed(0)}° (antalgic / contracture)`, dev > 20 ? "high" : "moderate",
          `Hamstring 90/90 test. Thomas test hip flexor. Treat pain source if antalgic. Terminal knee extension drills. Gait conscious extension cue.`,
          "M21.9", "⌣", "", "Normal: 0–5° flexion", dev);
      }
    });

    // Hip extension proxy
    if (hipExtensionProxy !== null && hipExtensionProxy > 8) {
      add("Hip / Lumbar", `Hip anterior to ankle plumb — hip flexion pattern in stance (${hipExtensionProxy.toFixed(1)}%)`, hipExtensionProxy > 15 ? "high" : "moderate",
        `Thomas test: confirm hip flexor contracture. Couch stretch ×90s. Hip extension: prone hip extension, RDL, glute bridge. Assess lumbar compensation.`,
        "M24.1", "⇒", "Hip anterior to ankle plumb suggests hip flexor tightness or hip flexion movement pattern.", "Normal: hip over ankle", hipExtensionProxy);
    }

    // Ankle dorsiflexion
    [[leftAnkleAngle,"Left"],[rightAnkleAngle,"Right"]].forEach(([angle,side])=>{
      if (angle === null || angle >= 80) return;
      add("Ankle — Dorsiflexion", `${side} ankle dorsiflexion restriction (~${angle.toFixed(0)}°, normal >80°)`, angle < 60 ? "high" : "moderate",
        `Gastrocnemius: straight-knee wall lean 60s ×3. Soleus: bent-knee wall lean 60s ×3. Talar anterior glide mobilisation (knee-to-wall >10cm target). SL heel raise full ROM. Assess talocrural vs subtalar restriction.`,
        "M24.2", "↕", `Ankle DF <80° → compensatory foot pronation, knee valgus, APT in squat. Primary ACL injury risk factor.`, "Normal: >80° (knee-to-wall ≥10cm)", angle);
    });
  }

  // ── GLOBAL — all views ────────────────────────────────────────────────────
  if (posturalLoadIndex !== null && posturalLoadIndex > 55) {
    // Plain-language contributor list — what is actually elevated and by how much
    const pliContributors = [];
    if (Math.abs(shoulderAngle||0) > 3)
      pliContributors.push({ label:"Uneven shoulders", value:`${Math.abs(shoulderAngle).toFixed(1)}°`, normal:"<3°" });
    if (Math.abs(pelvisAngle||0) > 3)
      pliContributors.push({ label:"Uneven pelvis/hips", value:`${Math.abs(pelvisAngle).toFixed(1)}°`, normal:"<3°" });
    if (Math.abs(fhpNorm||0) > 3)
      pliContributors.push({ label:"Head too far forward", value:`${Math.abs(fhpNorm).toFixed(1)}%`, normal:"<3%" });
    if (Math.abs(trunkLateralShift||0) > 4)
      pliContributors.push({ label:"Body leaning to one side", value:`${Math.abs(trunkLateralShift).toFixed(1)}%`, normal:"<4%" });
    if (Math.abs(cobbEstimate||0) > 5)
      pliContributors.push({ label:"Spinal curve (scoliosis screen)", value:`${Math.abs(cobbEstimate).toFixed(1)}°`, normal:"<5°" });
    if (Math.abs(cogDeviation||0) > 4)
      pliContributors.push({ label:"Body weight off-centre", value:`${Math.abs(cogDeviation).toFixed(1)}%`, normal:"<4%" });
    if (Math.abs(lumbarProxy||0) > 4)
      pliContributors.push({ label:"Pelvic tilt / lower back curve", value:`${Math.abs(lumbarProxy).toFixed(1)}%`, normal:"<4%" });

    // Simple plain-English severity label
    const pliLabel = posturalLoadIndex > 80
      ? "Very High — multiple areas need attention"
      : posturalLoadIndex > 65
      ? "High — several postural areas are stressed"
      : "Elevated — more than one area is affected";

    // Build simple detail string (no jargon)
    const pliDetail = pliContributors.length > 0
      ? `What is contributing to this score:\n${pliContributors.map(c=>`• ${c.label}: ${c.value} (normal ${c.normal})`).join("\n")}\n\nThis does not mean all these things are painful or dangerous — it means the body is working harder than it should to stay balanced. Each problem adds up and increases strain on muscles and joints over time.`
      : "Multiple small postural deviations are adding up across different body areas, increasing overall strain.";

    const severity = posturalLoadIndex > 75 ? "high" : "moderate";
    add("Global — Body Load Summary",
      `Body working harder than normal — ${pliLabel}`,
      severity,
      `Start with the highest-priority finding above. Fixing one problem often reduces the overall load score automatically. Aim for: 1 targeted exercise per problem area, 10–15 min daily. Re-assess in 4–6 weeks.`,
      "M62.9", "⚑", pliDetail, "Target: <35/100", posturalLoadIndex);
  }

  return findings;
}

// ─── POSTURE SCORING ENGINE ───────────────────────────────────────────────────
// Score = 100 minus weighted penalties from clinical measurements + findings.
// CLINICAL BANDS based on Kendall functional alignment classification.
// PLI and posture score are now mathematically coherent:
//   PLI measures burden ABOVE normal thresholds (0 = perfect, 100 = max load)
//   Score measures overall alignment quality (100 = perfect, 0 = severe)
//   They are inversely related: Score ≈ 100 - PLI × 0.7 (+ finding adjustment)
function PostureScoreEngine(measurements, findings, reliability) {
  if (!measurements || !findings) {
    return { score: 0, band: "Insufficient Data", colour: PC.muted, subScores: { cervical:0, shoulder:0, thoracic:0, lumbar:0, knee:0, global:0 } };
  }
  const {
    shoulderAngle, pelvisAngle, headLateralOffset, trunkLateralShift,
    forwardHeadMm, cvaAngle, cobbEstimate, cogDeviation,
    posturalLoadIndex, thoracicAngle, pelvicTiltSagittal,
    leftKneeDev, rightKneeDev, leftKneeFrontal, rightKneeFrontal,
    ucsIndex, lcsIndex, weightBearingShift, scapularAsymm,
  } = measurements;

  let penalty = 0;

  // ── Metric-based penalties ─────────────────────────────────────────────────
  // [value, [normal_threshold, severe_threshold], [mild_penalty, severe_penalty]]
  // Structured so penalty = 0 within normal, linear above normal threshold
  const metricPenalties = [
    // Frontal plane
    [Math.abs(shoulderAngle||0),       [3,7],   [3, 8]],
    [Math.abs(pelvisAngle||0),         [3,7],   [4, 10]],
    [Math.abs(headLateralOffset||0),   [2.5,6], [3, 7]],
    [Math.abs(trunkLateralShift||0),   [3.5,7], [4, 9]],
    [Math.abs(weightBearingShift||0),  [4,8],   [2, 6]],
    [Math.abs(cobbEstimate||0),        [5,10],  [5, 14]],
    [Math.abs(cogDeviation||0),        [4,8],   [3, 8]],
    [Math.abs(scapularAsymm||0),       [2.5,5], [2, 5]],
    // Sagittal plane
    [Math.abs(forwardHeadMm||0),       [3,8],   [5, 12]],
    [cvaAngle !== null ? Math.max(0, 55 - cvaAngle) : 0, [6,14], [5, 13]],
    [(thoracicAngle||32) > 45 ? (thoracicAngle||32) - 45 : 0, [8,18], [4, 10]],
    [Math.abs(pelvicTiltSagittal||0),  [4,9],   [3, 8]],
    // Knee
    [Math.abs(leftKneeDev||0) > 5 ? Math.abs(leftKneeDev||0) - 5 : 0,  [7,14], [3, 8]],
    [Math.abs(rightKneeDev||0) > 5 ? Math.abs(rightKneeDev||0) - 5 : 0, [7,14], [3, 8]],
    [Math.abs(leftKneeFrontal||0),     [5,10],  [3, 7]],
    [Math.abs(rightKneeFrontal||0),    [5,10],  [3, 7]],
    // Syndrome indices
    [(ucsIndex||0) > 0.6 ? (ucsIndex||0) - 0.6 : 0, [0.4,0.8], [4, 9]],
    [(lcsIndex||0) > 0.5 ? (lcsIndex||0) - 0.5 : 0, [0.4,0.8], [4, 9]],
  ];

  metricPenalties.forEach(([val, [t1,t2], [p1,p2]]) => {
    if (val <= 0) return;
    // Linear interpolation between thresholds
    const norm = Math.min(1, (val) / (t2 - t1));
    penalty += p1 + (p2 - p1) * norm;
  });

  // ── Finding-based penalties (diminishing returns) ─────────────────────────
  const sorted = [...findings].sort((a,b) => (b.severity==="high"?2:1) - (a.severity==="high"?2:1));
  sorted.forEach((f, idx) => {
    const base  = f.severity === "high" ? 8 : f.severity === "moderate" ? 4 : 1;
    const decay = Math.max(0.35, 1 - idx * 0.12);
    penalty += base * decay;
  });

  // ── Reliability adjustment ─────────────────────────────────────────────────
  // Low reliability = measurements are uncertain = reduce penalties proportionally
  const relScore = reliability?.score ?? 50;
  const reliabilityFactor = 0.5 + (relScore / 100) * 0.5;
  penalty *= reliabilityFactor;

  const score = clamp(Math.round(100 - penalty), 0, 100);

  // ── PLI–Score coherence check ──────────────────────────────────────────────
  // If PLI is high, score cannot be high. Apply floor.
  // A PLI of 80 → score cannot exceed ~40; PLI of 50 → score cannot exceed ~65
  const pli = posturalLoadIndex ?? 0;
  const pliBand = pli > 70 ? 0 : pli > 50 ? 20 : pli > 35 ? 40 : pli > 20 ? 60 : 100;
  const finalScore = clamp(Math.min(score, pliBand + 30), 0, 100);

  // ── Clinical bands (Kendall 2005) ──────────────────────────────────────────
  const band   = finalScore >= 88 ? "Optimal" : finalScore >= 74 ? "Good" : finalScore >= 58 ? "Fair" : finalScore >= 40 ? "Needs Attention" : "Priority Review";
  const colour = finalScore >= 74 ? PC.green : finalScore >= 58 ? PC.yellow : PC.red;

  // ── Regional sub-scores ────────────────────────────────────────────────────
  const subScores = {
    cervical: clamp(100 - (cvaAngle !== null ? Math.max(0,55-cvaAngle)*2.2 : 0) - Math.abs(headLateralOffset||0)*2.5, 0, 100),
    shoulder: clamp(100 - Math.abs(shoulderAngle||0)*5 - (scapularAsymm||0)*4, 0, 100),
    thoracic: clamp(100 - Math.max(0,(thoracicAngle||32)-45)*2 - Math.abs(trunkLateralShift||0)*3.5, 0, 100),
    lumbar:   clamp(100 - Math.abs(pelvicTiltSagittal||0)*4.5 - Math.abs(pelvisAngle||0)*4.5, 0, 100),
    knee:     clamp(100 - Math.abs(leftKneeFrontal||0)*3.5 - Math.abs(rightKneeFrontal||0)*3.5 - Math.max(0,-(leftKneeDev||0)-5)*2.5 - Math.max(0,-(rightKneeDev||0)-5)*2.5, 0, 100),
    global:   clamp(100 - Math.abs(cogDeviation||0)*4.5 - Math.abs(weightBearingShift||0)*3.5 - Math.abs(cobbEstimate||0)*3.5, 0, 100),
  };

  return { score: finalScore, band, colour, subScores };
}

// ─── CANVAS RENDERING ENGINE ─────────────────────────────────────────────────
function renderPostureOverlay({ ctx, W, H, lm, measurements, showHeatmap=true, showLabels=true, showGrid=true, view="anterior", skipClear=false }) {
  if (!ctx || !lm) return;
  if (!skipClear) ctx.clearRect(0, 0, W, H);
  const g = i => lm[i];
  const V = i => vis(lm, i, 0.4);
  const PX = i => px(lm, i, W, H);

  ctx.save();

  // ── LAYER 1: CALIBRATION GRID ─────────────────────────────────────────────
  if (showGrid) {
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);
    for (let c = 0; c <= 12; c++) { const x = W/12*c; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let r = 0; r <= 16; r++) { const y = H/16*r; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  }

  // ── LAYER 2: VERTICAL PLUMB LINE ─────────────────────────────────────────
  // FRONTAL view (anterior/posterior): vertical line from hip midpoint — assesses lateral deviation
  // LATERAL view (left/right): sagittal plumb line through ear→shoulder→hip→knee→ankle
  //   This is the classical physiotherapy plumb line for sagittal alignment assessment
  const isLateral = view === "left" || view === "right";

  if (!isLateral) {
    // ── Frontal plumb: single vertical from hip midpoint ──────────────────
    const hipMid = mid(g(23), g(24));
    const gravX = hipMid ? hipMid.x * W : W / 2;
    ctx.shadowColor = "rgba(0,229,255,0.6)";
    ctx.shadowBlur = 8;
    ctx.setLineDash([10, 6]);
    ctx.strokeStyle = "rgba(0,229,255,0.65)";
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(gravX, 0); ctx.lineTo(gravX, H); ctx.stroke();
    ctx.shadowBlur = 0; ctx.setLineDash([]);
  } else {
    // ══════════════════════════════════════════════════════════════════════════
    // ── SAGITTAL PLUMB LINE — Full Clinical Physiotherapy Assessment ─────────
    // Classical plumb line: Ear → Acromion → Greater Trochanter → Knee → Lateral Malleolus
    // Each segment deviation colour-coded: Green (<3%) Amber (3–7%) Red (>7%)
    // Includes: curve arcs, postural pattern label, UCS/LCS flags, deviation panel
    // ══════════════════════════════════════════════════════════════════════════
    const lateralHipIdx  = view === "right" ? 24 : 23;
    const lateralShIdx   = view === "right" ? 12 : 11;
    const lateralKneeIdx = view === "right" ? 26 : 25;
    const lateralAnkIdx  = view === "right" ? 28 : 27;
    const lateralEarIdx  = view === "right" ? 8  : 7;
    const lateralHeelIdx = view === "right" ? 30 : 29;

    const hipPt   = V(lateralHipIdx)  ? PX(lateralHipIdx)  : null;
    const shPt    = V(lateralShIdx)   ? PX(lateralShIdx)   : null;
    const kneePt  = V(lateralKneeIdx) ? PX(lateralKneeIdx) : null;
    const ankPt   = V(lateralAnkIdx)  ? PX(lateralAnkIdx)  : null;
    const earPt   = V(lateralEarIdx)  ? PX(lateralEarIdx)  : null;
    const heelPt  = V(lateralHeelIdx) ? PX(lateralHeelIdx) : null;

    // ── Plumb line anchor: lateral malleolus (most stable ground reference) ──
    // Fallback to ankle, then hip if not visible
    const plumbX = ankPt ? ankPt[0] : hipPt ? hipPt[0] : W / 2;

    // ── 1. Draw vertical plumb line (full height, bright cyan) ───────────────
    ctx.save();
    ctx.shadowColor = "rgba(0,229,255,0.8)";
    ctx.shadowBlur = 12;
    ctx.setLineDash([9, 5]);
    ctx.strokeStyle = "rgba(0,229,255,0.85)";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(plumbX, 0); ctx.lineTo(plumbX, H); ctx.stroke();
    ctx.shadowBlur = 0; ctx.setLineDash([]);
    ctx.restore();

    // Plumb line top label
    ctx.save();
    ctx.font = "bold 9px system-ui"; ctx.textAlign = "center";
    const plumbLabel = "⊕ Plumb Line";
    const plw = ctx.measureText(plumbLabel).width + 12;
    ctx.fillStyle = "rgba(0,10,20,0.88)";
    if (ctx.roundRect) ctx.roundRect(plumbX - plw/2, 5, plw, 16, 4);
    else ctx.rect(plumbX - plw/2, 5, plw, 16);
    ctx.fill();
    ctx.fillStyle = "rgba(0,229,255,1)";
    ctx.fillText(plumbLabel, plumbX, 17);
    ctx.restore();

    // ── 2. Compute per-segment deviations from plumb ─────────────────────────
    const devOf = pt => pt ? ((pt[0] - plumbX) / W * 100) : null;
    const earDev  = devOf(earPt);   // + = anterior
    const shDev   = devOf(shPt);
    const hipDev  = devOf(hipPt);
    const kneeDev = devOf(kneePt);
    const ankDev  = devOf(ankPt);   // should be ~0 (anchor)

    // ── 3. Colour-coded deviation dots + horizontal offset lines ─────────────
    const segPoints = [
      { pt: earPt,  dev: earDev,  label: "Ear",      norm: "over acromion",     icdRef: "FHP" },
      { pt: shPt,   dev: shDev,   label: "Shoulder", norm: "over GT",           icdRef: "UCS" },
      { pt: hipPt,  dev: hipDev,  label: "Hip (GT)", norm: "over lat. malleolus", icdRef: "APT" },
      { pt: kneePt, dev: kneeDev, label: "Knee",     norm: "slight ant. (<2%)", icdRef: "recurv" },
      { pt: ankPt,  dev: ankDev,  label: "Ankle",    norm: "plumb anchor",      icdRef: "ref" },
    ].filter(s => s.pt !== null);

    segPoints.forEach(({ pt, dev, label, icdRef }) => {
      const abs = Math.abs(dev ?? 0);
      const isRef = icdRef === "ref";
      const col = isRef
        ? "rgba(0,229,255,0.95)"
        : abs < 3  ? "rgba(0,201,122,0.95)"
        : abs < 7  ? "rgba(255,179,0,0.95)"
        :             "rgba(255,77,109,0.95)";

      // Outer ring
      ctx.beginPath(); ctx.arc(pt[0], pt[1], 8, 0, Math.PI*2);
      ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.stroke();
      // Inner fill dot
      ctx.beginPath(); ctx.arc(pt[0], pt[1], 5, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.fill();

      // Horizontal deviation line to plumb
      if (!isRef && dev !== null && Math.abs(dev) > 0.5) {
        ctx.save();
        ctx.setLineDash([4,3]);
        ctx.strokeStyle = col; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(pt[0], pt[1]); ctx.lineTo(plumbX, pt[1]); ctx.stroke();
        ctx.restore();
      }

      // Badge label
      const dir = (dev ?? 0) > 1 ? "ant" : (dev ?? 0) < -1 ? "post" : "✓";
      const devStr = isRef ? "(ref)" : `${dir} ${abs < 0.3 ? "✓" : abs.toFixed(1)+"%"}`;
      const badgeText = `${label}: ${devStr}`;
      const bw = ctx.measureText(badgeText).width + 12;
      const onLeft = (pt[0] >= plumbX); // badge left of landmark if landmark is right of plumb
      const bx = onLeft ? pt[0] - bw - 8 : pt[0] + 8;
      ctx.fillStyle = "rgba(4,8,18,0.88)";
      if (ctx.roundRect) ctx.roundRect(bx, pt[1]-9, bw, 17, 4);
      else ctx.rect(bx, pt[1]-9, bw, 17);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.font = "bold 8px system-ui";
      ctx.textAlign = onLeft ? "right" : "left";
      ctx.fillText(badgeText, onLeft ? bx+bw-5 : bx+5, pt[1]+4);
    });

    // ── 4. Thoracic kyphosis arc (shoulder → mid-torso → hip) ────────────────
    if (shPt && hipPt) {
      const midX = (shPt[0] + hipPt[0]) / 2;
      const midY = (shPt[1] + hipPt[1]) / 2;
      const dx   = shPt[0] - hipPt[0];
      const kyphBulge = dx * 0.55; // bulge amount — larger = more kyphosis drawn
      const kyphCol = Math.abs(dx/W*100) > 5 ? "rgba(255,179,0,0.55)" : "rgba(0,201,122,0.4)";
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(shPt[0], shPt[1]);
      // Quadratic bezier: control point pushed posterior (away from plumb)
      ctx.quadraticCurveTo(midX + kyphBulge, midY, hipPt[0], hipPt[1]);
      ctx.strokeStyle = kyphCol;
      ctx.lineWidth = 3;
      ctx.setLineDash([6,4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // Kyphosis label
      const kLabel = Math.abs(dx/W*100) > 6 ? "⌒ Kyphosis ↑" : Math.abs(dx/W*100) < 1 ? "⌒ Flat-T" : "⌒ Thoracic";
      ctx.save();
      ctx.font = "bold 8px system-ui"; ctx.textAlign = "center";
      const klw = ctx.measureText(kLabel).width + 10;
      ctx.fillStyle = "rgba(4,8,18,0.82)";
      if (ctx.roundRect) ctx.roundRect(midX+kyphBulge*0.5 - klw/2, midY-10, klw, 15, 4);
      else ctx.rect(midX+kyphBulge*0.5 - klw/2, midY-10, klw, 15);
      ctx.fill();
      ctx.fillStyle = kyphCol.replace("0.55","1").replace("0.4","1");
      ctx.fillText(kLabel, midX+kyphBulge*0.5, midY+2);
      ctx.restore();
    }

    // ── 5. Lumbar lordosis arc (hip → mid-lumbar → knee) ─────────────────────
    if (hipPt && kneePt) {
      const midY = (hipPt[1] + kneePt[1]) / 2;
      const lordX = hipPt[0]; // hip is pushed anterior in lordosis
      const lordBulge = (hipPt[0] - plumbX) * 0.6;
      const lordCol = Math.abs(lordBulge) > W*0.015
        ? "rgba(255,77,109,0.55)"
        : Math.abs(lordBulge) < W*0.004
        ? "rgba(0,201,122,0.45)"
        : "rgba(255,179,0,0.5)";
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(hipPt[0], hipPt[1]);
      ctx.quadraticCurveTo(lordX + lordBulge * 0.8, midY, kneePt[0], kneePt[1]);
      ctx.strokeStyle = lordCol;
      ctx.lineWidth = 3;
      ctx.setLineDash([6,4]);
      ctx.stroke();
      ctx.setLineDash([]);
      const lLabel = lordBulge > W*0.015 ? "↔ Lordosis ↑" : lordBulge < -W*0.004 ? "↔ Flat-L" : "↔ Lordosis";
      ctx.font = "bold 8px system-ui"; ctx.textAlign = "right";
      const llw = ctx.measureText(lLabel).width + 10;
      const lx = Math.min(hipPt[0], kneePt[0]) - 4;
      ctx.fillStyle = "rgba(4,8,18,0.82)";
      if (ctx.roundRect) ctx.roundRect(lx - llw + 5, midY - 9, llw, 16, 4);
      else ctx.rect(lx - llw + 5, midY - 9, llw, 16);
      ctx.fill();
      ctx.fillStyle = lordCol.replace("0.55","1").replace("0.45","1").replace("0.5","1");
      ctx.fillText(lLabel, lx, midY+4);
      ctx.restore();
    }

    // ── 6. Cervical curve arc (ear → shoulder) ────────────────────────────────
    if (earPt && shPt) {
      const fhpPx = earPt[0] - shPt[0];
      const fhpPct = Math.abs(fhpPx / W * 100);
      const fhpCol = fhpPct > 7 ? "rgba(255,77,109,0.85)"
        : fhpPct > 3 ? "rgba(255,179,0,0.85)"
        : "rgba(0,201,122,0.7)";
      // FHP offset line
      if (Math.abs(fhpPx) > W * 0.01) {
        ctx.save();
        ctx.setLineDash([5,4]);
        ctx.strokeStyle = fhpCol; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(earPt[0], earPt[1]); ctx.lineTo(shPt[0], earPt[1]); ctx.stroke();
        ctx.setLineDash([]);
        // CVA angle arc
        const arcR = 22;
        ctx.beginPath();
        ctx.arc(shPt[0], earPt[1], arcR,
          fhpPx > 0 ? -Math.PI/2 : Math.PI,
          fhpPx > 0 ? 0 : -Math.PI/2);
        ctx.strokeStyle = fhpCol; ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        // FHP badge
        const fhpLabel = `CVA/FHP ${fhpPct.toFixed(1)}%`;
        const fw = ctx.measureText(fhpLabel).width + 10;
        const fx = (earPt[0] + shPt[0]) / 2;
        ctx.fillStyle = "rgba(4,8,18,0.88)";
        if (ctx.roundRect) ctx.roundRect(fx-fw/2, earPt[1]-22, fw, 16, 4);
        else ctx.rect(fx-fw/2, earPt[1]-22, fw, 16);
        ctx.fill();
        ctx.fillStyle = fhpCol;
        ctx.font = "bold 8.5px system-ui"; ctx.textAlign = "center";
        ctx.fillText(fhpLabel, fx, earPt[1]-10);
      }
    }

    // ── 7. Postural Pattern Classification + UCS/LCS flags ───────────────────
    // Based on combination of: FHP, kyphosis, lordosis (APT), knee deviation
    const fhpVal  = earDev  ?? 0;
    const shVal   = shDev   ?? 0;
    const hipVal  = hipDev  ?? 0;
    const kneeVal = kneeDev ?? 0;
    const hasFHP      = fhpVal  >  4;
    const hasKyphosis = shPt && hipPt ? (shPt[0] - hipPt[0]) / W * 100 > 4 : false;
    const hasAPT      = hipVal  >  4;   // hip anterior to plumb
    const hasPPT      = hipVal  < -3;   // hip posterior to plumb
    const hasRecurv   = kneeVal < -4;   // knee hyperextension
    const hasHipPost  = hipVal  < -2;   // hips behind plumb → sway

    // Pattern detection (Kendall classification)
    let posturePattern = "Ideal";
    let patternCol     = "rgba(0,201,122,0.95)";
    let patternDetail  = "Ear, shoulder, hip, knee and ankle aligned over plumb.";

    if (hasFHP && hasKyphosis && hasAPT) {
      posturePattern = "Lordotic-Kyphotic";
      patternCol     = "rgba(255,77,109,0.95)";
      patternDetail  = "FHP + thoracic kyphosis + anterior pelvic tilt. Classic Lower & Upper Crossed Syndrome pattern.";
    } else if (hasHipPost && hasKyphosis && hasFHP) {
      posturePattern = "Sway-Back";
      patternCol     = "rgba(255,179,0,0.95)";
      patternDetail  = "Hips posterior + thoracic flexion + FHP. Hamstring/abdominal dominance. Pelvis sways forward.";
    } else if (!hasKyphosis && !hasAPT && !hasFHP) {
      posturePattern = "Flat / Military";
      patternCol     = "rgba(56,189,248,0.95)";
      patternDetail  = "Reduced thoracic kyphosis + reduced lumbar lordosis. Stiff spine — poor shock absorption.";
    } else if (hasKyphosis && !hasAPT && !hasFHP) {
      posturePattern = "Kyphotic (Thoracic)";
      patternCol     = "rgba(255,179,0,0.95)";
      patternDetail  = "Increased thoracic kyphosis without significant pelvic component. Scheuermann's / sedentary posture.";
    } else if (hasAPT && !hasKyphosis) {
      posturePattern = "Lordotic";
      patternCol     = "rgba(255,120,70,0.95)";
      patternDetail  = "Anterior pelvic tilt + increased lumbar lordosis. Hip flexor dominance. LCS pattern.";
    } else if (hasFHP && !hasKyphosis) {
      posturePattern = "Forward Head Only";
      patternCol     = "rgba(200,100,255,0.95)";
      patternDetail  = "Isolated FHP without thoracic kyphosis. Cervical extensor overactivation. Screen + desk posture.";
    }

    // UCS flag
    const hasUCS = hasFHP && hasKyphosis;
    // LCS flag
    const hasLCS = hasAPT && hasKyphosis;

    // Pattern badge — drawn bottom-left corner
    const pBadgeY = H - 56;
    const pText   = `◈ ${posturePattern}`;
    ctx.save();
    ctx.font = "bold 10px system-ui"; ctx.textAlign = "left";
    const pBW = ctx.measureText(pText).width + 14;
    ctx.fillStyle = "rgba(4,8,18,0.9)";
    if (ctx.roundRect) ctx.roundRect(8, pBadgeY, pBW, 20, 5);
    else ctx.rect(8, pBadgeY, pBW, 20);
    ctx.fill();
    ctx.strokeStyle = patternCol; ctx.lineWidth = 1.5;
    if (ctx.roundRect) ctx.roundRect(8, pBadgeY, pBW, 20, 5);
    else ctx.rect(8, pBadgeY, pBW, 20);
    ctx.stroke();
    ctx.fillStyle = patternCol;
    ctx.fillText(pText, 14, pBadgeY + 14);
    ctx.restore();

    // UCS / LCS syndrome badges
    let syndromeY = pBadgeY - 24;
    [
      hasUCS && { label:"⚠ UCS", col:"rgba(255,179,0,0.95)", tip:"Upper Crossed Syndrome" },
      hasLCS && { label:"⚠ LCS", col:"rgba(255,120,70,0.95)", tip:"Lower Crossed Syndrome" },
      hasRecurv && { label:"⚠ Recurv", col:"rgba(255,77,109,0.95)", tip:"Genu Recurvatum" },
    ].filter(Boolean).forEach(({ label, col, tip }) => {
      ctx.save();
      ctx.font = "bold 9px system-ui"; ctx.textAlign = "left";
      const sw = ctx.measureText(label).width + 12;
      ctx.fillStyle = "rgba(4,8,18,0.88)";
      if (ctx.roundRect) ctx.roundRect(8, syndromeY, sw, 18, 4);
      else ctx.rect(8, syndromeY, sw, 18);
      ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.2;
      if (ctx.roundRect) ctx.roundRect(8, syndromeY, sw, 18, 4);
      else ctx.rect(8, syndromeY, sw, 18);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.fillText(label, 12, syndromeY + 12);
      ctx.restore();
      syndromeY -= 22;
    });

    // ── 8. Deviation summary panel — top-right corner ────────────────────────
    const panelRows = [
      { label:"Ear",      val: earDev,  norm:3  },
      { label:"Shoulder", val: shDev,   norm:3  },
      { label:"Hip",      val: hipDev,  norm:3  },
      { label:"Knee",     val: kneeDev, norm:5  },
    ].filter(r => r.val !== null);

    if (panelRows.length > 0) {
      const panelW  = 118;
      const panelH  = 14 * panelRows.length + 28;
      const panelX  = W - panelW - 6;
      const panelY  = 26;

      ctx.save();
      ctx.fillStyle = "rgba(4,8,18,0.88)";
      if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 6);
      else ctx.rect(panelX, panelY, panelW, panelH);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,229,255,0.3)"; ctx.lineWidth = 1;
      if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 6);
      else ctx.rect(panelX, panelY, panelW, panelH);
      ctx.stroke();

      // Header
      ctx.fillStyle = "rgba(0,229,255,0.9)";
      ctx.font = "bold 8.5px system-ui"; ctx.textAlign = "left";
      ctx.fillText("Sagittal Deviations", panelX + 8, panelY + 12);

      panelRows.forEach(({ label, val, norm }, i) => {
        const abs = Math.abs(val);
        const col = abs < norm ? "rgba(0,201,122,0.95)"
          : abs < norm*2      ? "rgba(255,179,0,0.95)"
          :                     "rgba(255,77,109,0.95)";
        const dir = val > 0.5 ? "ant" : val < -0.5 ? "post" : "✓";
        const rowY = panelY + 22 + i * 14;

        // Mini bar background
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(panelX+8, rowY+1, panelW-16, 10);
        // Bar fill
        const barW = Math.min(Math.abs(val) / 15 * (panelW - 16), panelW - 16);
        ctx.fillStyle = col.replace("0.95","0.35");
        ctx.fillRect(panelX+8, rowY+1, barW, 10);

        // Label
        ctx.fillStyle = "rgba(180,170,210,0.9)";
        ctx.font = "8px system-ui"; ctx.textAlign = "left";
        ctx.fillText(label, panelX + 8, rowY + 10);

        // Value
        ctx.fillStyle = col;
        ctx.font = "bold 8px system-ui"; ctx.textAlign = "right";
        ctx.fillText(`${dir} ${abs.toFixed(1)}%`, panelX + panelW - 6, rowY + 10);
      });
      ctx.restore();
    }
  }

  // ── LAYER 3: NAMED HORIZONTAL LINES ──────────────────────────────────────
  const hLines = [
    { l:3,  r:6,  label:"Eyes" },
    { l:7,  r:8,  label:"Ears / C-spine" },
    { l:11, r:12, label:"Shoulders" },
    { l:23, r:24, label:"ASIS / Pelvis" },
    { l:25, r:26, label:"Knees" },
    { l:27, r:28, label:"Ankles" },
    { l:29, r:30, label:"Heels" },
  ];
  hLines.forEach(({ l, r, label }) => {
    if (!V(l) || !V(r)) return;
    const lPt = PX(l), rPt = PX(r);
    if (!lPt || !rPt) return;
    const angle = calcAngleDeg(g(l), g(r));
    const midY = (lPt[1] + rPt[1]) / 2;
    const absAng = Math.abs(angle || 0);
    const col = absAng < 2 ? "rgba(0,201,122,0.9)" : absAng < 5 ? "rgba(255,179,0,0.95)" : "rgba(255,77,109,1)";

    // Line with glow
    ctx.strokeStyle = col; ctx.lineWidth = 1.8;
    ctx.shadowColor = col; ctx.shadowBlur = 3;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
    ctx.shadowBlur = 0;

    // Left label chip
    ctx.fillStyle = "rgba(6,9,15,0.85)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(4, midY-9, 70, 17, 3);
    else ctx.rect(4, midY-9, 70, 17);
    ctx.fill();
    ctx.fillStyle = col; ctx.font = "bold 9.5px system-ui";
    ctx.textAlign = "left"; ctx.fillText(label, 8, midY+4);

    // Right angle badge
    const angStr = `${absAng < 0.5 ? "0" : absAng.toFixed(1)}°`;
    const badgeW = ctx.measureText(angStr).width + 10;
    ctx.fillStyle = "rgba(6,9,15,0.85)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W - badgeW - 4, midY-9, badgeW, 17, 3);
    else ctx.rect(W - badgeW - 4, midY-9, badgeW, 17);
    ctx.fill();
    ctx.fillStyle = col; ctx.textAlign = "right";
    ctx.fillText(angStr, W - 6, midY+4);

    // Endpoint dots
    [lPt, rPt].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.fill();
    });
  });

  // ── LAYER 4: COLOR-CODED SKELETON ─────────────────────────────────────────
  const BONES = [
    [11,12],[23,24],           // shoulders, ASIS/hips (horizontal — colour by angle)
    [11,23],[12,24],           // torso sides
    [23,25],[24,26],           // thighs
    [25,27],[26,28],           // shins
    [27,31],[28,32],           // feet
    [27,29],[28,30],           // heel connections
    [11,13],[12,14],           // upper arm
    [13,15],[14,16],           // forearm
    [0,11],[0,12],             // head to shoulders
    [0,7],[0,8],               // nose to ears (head width)
    [2,3],[5,6],               // eye inner-outer (eye width)
    [7,11],[8,12],             // ear to shoulder (neck sides)
  ];
  BONES.forEach(([a, b], idx) => {
    if (!V(a) || !V(b)) return;
    const aPt = PX(a), bPt = PX(b);
    if (!aPt || !bPt) return;
    const isHorizontal = idx < 2;
    const isFace = idx >= 10; // face/neck bones added at end
    const ang = Math.abs(calcAngleDeg(g(a), g(b)) || 0);
    let col;
    if (isHorizontal) {
      col = ang < 2 ? "rgba(0,201,122,0.8)" : ang < 5 ? "rgba(255,179,0,0.85)" : "rgba(255,77,109,0.9)";
    } else if (isFace) {
      col = "rgba(0,229,255,0.2)";
    } else {
      col = "rgba(0,229,255,0.3)";
    }
    ctx.strokeStyle = col; ctx.lineWidth = isHorizontal ? 2.5 : isFace ? 1 : 1.5;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(aPt[0], aPt[1]); ctx.lineTo(bPt[0], bPt[1]); ctx.stroke();
  });

  // Joint dots
  [0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,23,24,25,26,27,28,29,30,31,32].forEach(i => {
    if (!V(i)) return;
    const pt = PX(i);
    if (!pt) return;
    const conf = lm[i]?.visibility || 0;
    const isKey = [0,2,5,7,8,11,12,23,24,25,26,27,28].includes(i);
    const r = isKey ? 5 : 3;
    ctx.beginPath(); ctx.arc(pt[0], pt[1], r, 0, Math.PI*2);
    ctx.fillStyle = conf > 0.75 ? "#00e5ff" : conf > 0.5 ? "#ffb300" : "#ff4d6d";
    ctx.fill();
    if (isKey) {
      ctx.strokeStyle = "rgba(6,9,15,0.6)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(pt[0], pt[1], r+2, 0, Math.PI*2); ctx.stroke();
    }
  });

  // ── LAYER 5: FULL SPINE SEGMENTS + HEAD CIRCLE + ASIS RING + LUMBAR ────────
  // 5A: Head circle (approximate head outline from nose landmark)
  if (V(0)) {
    const nosePt = PX(0);
    // Estimate head radius from shoulder width
    const headR = V(11)&&V(12) ? Math.abs(PX(11)[0]-PX(12)[0])*0.22 : W*0.06;
    if (nosePt) {
      ctx.strokeStyle = "rgba(0,229,255,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.arc(nosePt[0], nosePt[1]-headR*0.6, headR, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      // C-spine label between nose and shoulders
      if (V(11)&&V(12)) {
        const shM2 = mid(g(11),g(12));
        const midCy = (nosePt[1] + shM2.y*H)/2;
        const midCx = nosePt[0];
        ctx.fillStyle="rgba(0,0,0,0.75)"; ctx.font="bold 8.5px system-ui"; ctx.textAlign="center";
        const cw=ctx.measureText("C-Spine").width+8;
        if(ctx.roundRect) ctx.roundRect(midCx-cw/2,midCy-8,cw,14,3); else ctx.rect(midCx-cw/2,midCy-8,cw,14);
        ctx.fill();
        ctx.fillStyle="rgba(0,229,255,0.9)"; ctx.fillText("C-Spine",midCx,midCy+4);
      }
    }
  }
  // 5B: Eye level line (landmarks 2=L.eye, 5=R.eye)
  if (V(2)&&V(5)) {
    const eyeL=PX(2), eyeR=PX(5);
    if(eyeL&&eyeR){
      const eyeY=(eyeL[1]+eyeR[1])/2;
      const eyeAng=Math.abs(calcAngleDeg(g(2),g(5))||0);
      const eyeCol=eyeAng<1.5?"rgba(0,201,122,0.8)":eyeAng<3?"rgba(255,179,0,0.9)":"rgba(255,77,109,0.9)";
      ctx.strokeStyle=eyeCol; ctx.lineWidth=1.5; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(0,eyeY); ctx.lineTo(W,eyeY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle="rgba(0,0,0,0.8)"; ctx.font="bold 8.5px system-ui"; ctx.textAlign="left";
      const ew=ctx.measureText("Eye Level").width+8;
      if(ctx.roundRect) ctx.roundRect(4,eyeY-9,ew,16,3); else ctx.rect(4,eyeY-9,ew,16);
      ctx.fill(); ctx.fillStyle=eyeCol; ctx.fillText("Eye Level",8,eyeY+4);
    }
  }
  // 5C: Full segmented spine line: Head→C-spine→T-spine→L-spine→Pelvis/ASIS→PSIS
  const spineSegs = [
    [0, "C-Sp", "rgba(0,229,255,0.7)"],
    [11, "T-Sp", "rgba(100,200,255,0.7)"],   // shoulder mid used as T-spine proxy
    [23, "L-Sp", "rgba(255,179,0,0.7)"],     // hip mid used as L-spine / pelvis
    [25, "Pelv", "rgba(200,100,255,0.7)"],   // knee mid as lower bound
  ];
  const spinePoints = [];
  if(V(0)) spinePoints.push({pt:PX(0),label:"C-Sp",col:"rgba(0,229,255,0.85)"});
  if(V(11)&&V(12)){ const sm=mid(g(11),g(12)); spinePoints.push({pt:[sm.x*W,sm.y*H],label:"T-Sp",col:"rgba(100,200,255,0.85)"}); }
  if(V(23)&&V(24)){ const hm=mid(g(23),g(24)); spinePoints.push({pt:[hm.x*W,hm.y*H],label:"L-Sp/Pelv",col:"rgba(255,179,0,0.85)"}); }
  if(spinePoints.length>=2){
    for(let si=0;si<spinePoints.length-1;si++){
      const a=spinePoints[si], b=spinePoints[si+1];
      ctx.strokeStyle=a.col; ctx.lineWidth=2.2; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(a.pt[0],a.pt[1]); ctx.lineTo(b.pt[0],b.pt[1]); ctx.stroke();
      ctx.setLineDash([]);
      // Midpoint label
      const mx=(a.pt[0]+b.pt[0])/2, my=(a.pt[1]+b.pt[1])/2;
      ctx.fillStyle="rgba(0,0,0,0.8)"; ctx.font="bold 8px system-ui"; ctx.textAlign="center";
      const segLabel=a.label;
      const slw=ctx.measureText(segLabel).width+8;
      if(ctx.roundRect) ctx.roundRect(mx-slw/2,my-8,slw,14,3); else ctx.rect(mx-slw/2,my-8,slw,14);
      ctx.fill(); ctx.fillStyle=a.col; ctx.fillText(segLabel,mx,my+4);
    }
  }
  // 5D: ASIS rings (circles around hip landmarks = ASIS in anterior view)
  [[23,"L.ASIS"],[24,"R.ASIS"]].forEach(([idx,lbl])=>{
    if(!V(idx)) return;
    const pt=PX(idx); if(!pt) return;
    // Dashed ring
    ctx.strokeStyle="rgba(200,100,255,0.7)"; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.arc(pt[0],pt[1],14,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    // ASIS label below dot
    ctx.fillStyle="rgba(0,0,0,0.78)"; ctx.font="bold 8px system-ui"; ctx.textAlign="center";
    const aw=ctx.measureText(lbl).width+8;
    if(ctx.roundRect) ctx.roundRect(pt[0]-aw/2,pt[1]+16,aw,13,3); else ctx.rect(pt[0]-aw/2,pt[1]+16,aw,13);
    ctx.fill(); ctx.fillStyle="rgba(200,100,255,0.9)"; ctx.fillText(lbl,pt[0],pt[1]+27);
  });
  // 5E: Lumbar label between shoulder mid and hip mid
  if(V(11)&&V(12)&&V(23)&&V(24)){
    const shM=mid(g(11),g(12)), hipM=mid(g(23),g(24));
    const lumX=(shM.x+hipM.x)/2*W+20, lumY=(shM.y+hipM.y)/2*H;
    ctx.fillStyle="rgba(0,0,0,0.75)"; ctx.font="bold 8.5px system-ui"; ctx.textAlign="left";
    const lw=ctx.measureText("Lumbar").width+8;
    if(ctx.roundRect) ctx.roundRect(lumX,lumY-8,lw,14,3); else ctx.rect(lumX,lumY-8,lw,14);
    ctx.fill(); ctx.fillStyle="rgba(255,179,0,0.95)"; ctx.fillText("Lumbar",lumX+4,lumY+4);
  }
  // 5F: PSIS / pelvis posterior indicator — all views
  // Posterior view: label as PSIS (posterior superior iliac spine)
  // Other views: label as Pelvis with a smaller ring
  if(V(23)&&V(24)){
    const lHip=PX(23), rHip=PX(24);
    if(lHip&&rHip){
      const isPosterior = view==="posterior";
      const ringCol = isPosterior ? "rgba(255,100,100,0.7)" : "rgba(200,100,255,0.5)";
      const lblCol  = isPosterior ? "rgba(255,100,100,0.95)" : "rgba(200,100,255,0.9)";
      const ringR   = isPosterior ? 12 : 9;
      [[lHip, isPosterior?"L.PSIS":"L.Pelv"], [rHip, isPosterior?"R.PSIS":"R.Pelv"]].forEach(([pt,lbl])=>{
        ctx.strokeStyle=ringCol; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.arc(pt[0], pt[1]+6, ringR, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle="rgba(0,0,0,0.75)"; ctx.font="bold 7.5px system-ui"; ctx.textAlign="center";
        const pw=ctx.measureText(lbl).width+8;
        if(ctx.roundRect) ctx.roundRect(pt[0]-pw/2, pt[1]+ringR+10, pw, 13, 3);
        else ctx.rect(pt[0]-pw/2, pt[1]+ringR+10, pw, 13);
        ctx.fill(); ctx.fillStyle=lblCol; ctx.fillText(lbl, pt[0], pt[1]+ringR+21);
      });
    }
  }

  // ── LAYER 6: KNEE ANGLE BADGES ────────────────────────────────────────────
  [[23,25,27,"L"],[24,26,28,"R"]].forEach(([h,k,a,side]) => {
    if (!V(h)||!V(k)||!V(a)) return;
    const ka = vec3Angle(g(h), g(k), g(a));
    if (ka === null) return;
    const kPt = PX(k);
    if (!kPt) return;
    const dev = Math.abs(180 - ka);
    const col = dev < 5 ? "rgba(0,201,122,0.9)" : dev < 12 ? "rgba(255,179,0,0.9)" : "rgba(255,77,109,0.9)";
    const label = `${side}.Knee ${ka.toFixed(0)}°`;
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(6,9,15,0.87)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(kPt[0]+8, kPt[1]-10, tw+10, 19, 5);
    else ctx.rect(kPt[0]+8, kPt[1]-10, tw+10, 19);
    ctx.fill();
    ctx.fillStyle = col; ctx.font = "bold 9.5px system-ui"; ctx.textAlign = "left";
    ctx.fillText(label, kPt[0]+13, kPt[1]+4);
  });

  // ── LAYER 7: FOOT PROGRESSION ANGLE BADGES ───────────────────────────────
  [[31,27,"L.Foot",0],[32,28,"R.Foot",1]].forEach(([fi,ai,lbl,side]) => {
    if (!V(fi)||!V(ai)) return;
    const fa = Math.abs(Math.atan2(g(fi).y-g(ai).y, g(fi).x-g(ai).x)*180/Math.PI);
    const col = fa < 8 ? "rgba(0,201,122,0.9)" : fa < 20 ? "rgba(255,179,0,0.9)" : "rgba(255,77,109,0.9)";
    const bx = side === 0 ? 6 : W - 72, by = H - 30;
    ctx.fillStyle = "rgba(6,9,15,0.85)";
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx,by,66,22,5); else ctx.rect(bx,by,66,22); ctx.fill();
    ctx.fillStyle = col; ctx.font = "bold 9.5px system-ui"; ctx.textAlign = "left";
    ctx.fillText(`${lbl} ${fa.toFixed(0)}°`, bx+5, by+15);
  });

  // ── LAYER 8: FORWARD HEAD PLUMB (lateral view) ───────────────────────────
  if ((view === "left" || view === "right") && V(0) && V(11)) {
    const headPt = PX(0), shPt = PX(11);
    if (headPt && shPt) {
      const diff = headPt[0] - shPt[0];
      const col = Math.abs(diff) > W*0.03 ? "rgba(255,77,109,0.7)" : "rgba(0,201,122,0.7)";
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([5,4]);
      ctx.beginPath(); ctx.moveTo(headPt[0], headPt[1]); ctx.lineTo(shPt[0], headPt[1]); ctx.stroke();
      ctx.setLineDash([]);
      // Badge
      const diffPct = Math.abs((diff/W)*100).toFixed(1);
      ctx.fillStyle = "rgba(6,9,15,0.87)";
      const label = `FHP ${diffPct}%`;
      const tw = ctx.measureText(label).width;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect((headPt[0]+shPt[0])/2-tw/2-4, headPt[1]-20, tw+8, 17, 4); else ctx.rect((headPt[0]+shPt[0])/2-tw/2-4, headPt[1]-20, tw+8, 17); ctx.fill();
      ctx.fillStyle = col; ctx.textAlign = "center"; ctx.font = "bold 9.5px system-ui";
      ctx.fillText(label, (headPt[0]+shPt[0])/2, headPt[1]-7);
    }
  }

  // ── LAYER 9: HEATMAP (stress visualisation) ───────────────────────────────
  if (showHeatmap && measurements) {
    const hotspots = [];
    const addHot = (lmIdx, intensity) => {
      if (!V(lmIdx)) return;
      hotspots.push({ x:g(lmIdx).x*W, y:g(lmIdx).y*H, r: 45 + intensity*20, intensity });
    };
    if (measurements.shoulderAngle && Math.abs(measurements.shoulderAngle) > 4)
      addHot(measurements.shoulderAngle > 0 ? 11 : 12, Math.min(1, Math.abs(measurements.shoulderAngle)/12));
    if (measurements.pelvisAngle && Math.abs(measurements.pelvisAngle) > 3)
      addHot(measurements.pelvisAngle > 0 ? 23 : 24, Math.min(1, Math.abs(measurements.pelvisAngle)/10));
    if (measurements.headLateralOffset && Math.abs(measurements.headLateralOffset) > 2.5)
      addHot(0, Math.min(1, Math.abs(measurements.headLateralOffset)/8));
    if (measurements.leftKneeDev && Math.abs(measurements.leftKneeDev) > 8)
      addHot(25, Math.min(1, Math.abs(measurements.leftKneeDev)/15));
    if (measurements.rightKneeDev && Math.abs(measurements.rightKneeDev) > 8)
      addHot(26, Math.min(1, Math.abs(measurements.rightKneeDev)/15));
    // Head/cervical hotspot
    if (measurements.forwardHeadMm && Math.abs(measurements.forwardHeadMm) > 3)
      addHot(0, Math.min(1, Math.abs(measurements.forwardHeadMm)/10));
    // ASIS/lumbar hotspot
    if (measurements.lumbarProxy && Math.abs(measurements.lumbarProxy) > 4)
      addHot(measurements.lumbarProxy > 0 ? 23 : 24, Math.min(1, Math.abs(measurements.lumbarProxy)/12));
    // Scapular hotspot
    if (measurements.scapularAsymm && measurements.scapularAsymm > 3)
      addHot(11, Math.min(1, measurements.scapularAsymm/8));

    hotspots.forEach(({ x, y, r, intensity }) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      const alpha = intensity * 0.38;
      grad.addColorStop(0, `rgba(255,77,109,${alpha})`);
      grad.addColorStop(0.4, `rgba(255,179,0,${alpha*0.6})`);
      grad.addColorStop(1, `rgba(255,77,109,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    });
  }

  // ── LAYER 10: LANDMARK LABELS ─────────────────────────────────────────────
  if (showLabels) {
    const LBLS = {0:"Head",2:"L.Eye",5:"R.Eye",7:"L.Ear",8:"R.Ear",11:"L.Sh",12:"R.Sh",13:"L.Arm",14:"R.Arm",23:"L.ASIS",24:"R.ASIS",25:"L.Knee",26:"R.Knee",27:"L.Ank",28:"R.Ank",29:"L.Heel",30:"R.Heel",31:"L.Ft",32:"R.Ft"};
    ctx.font = "bold 9px system-ui"; ctx.textAlign = "center";
    Object.entries(LBLS).forEach(([i, name]) => {
      const lmPt = PX(Number(i));
      if (!lmPt || !V(Number(i))) return;
      const [x, y] = lmPt;
      const oy = Number(i) === 0 ? -16 : -12;
      const tw = ctx.measureText(name).width;
      ctx.fillStyle = "rgba(6,9,15,0.75)";
      ctx.fillRect(x - tw/2 - 2, y+oy-9, tw+4, 12);
      ctx.fillStyle = (lm[Number(i)]?.visibility||0) > 0.7 ? "#00e5ff" : "#ffb300";
      ctx.fillText(name, x, y+oy);
    });
  }

  // ── LAYER 11: VIEW LABEL + LANDMARK LEGEND ──────────────────────────────
  ctx.fillStyle = "rgba(6,9,15,0.7)";
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(8, H-28, 120, 20, 5); else ctx.rect(8, H-28, 120, 20); ctx.fill();
  ctx.fillStyle = "rgba(0,229,255,0.85)"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "left";
  ctx.fillText(`${view.toUpperCase()} VIEW`, 13, H-13);

  // ── LAYER 12: LANDMARK LEGEND (top-right corner) ─────────────────────────
  const legend = [
    { col:"rgba(0,201,122,0.9)", label:"Normal" },
    { col:"rgba(255,179,0,0.9)", label:"Mild deviation" },
    { col:"rgba(255,77,109,0.9)", label:"Significant" },
    { col:"rgba(200,100,255,0.8)", label:"ASIS/Pelvis" },
    { col:"rgba(0,229,255,0.7)", label:"Spine segments" },
  ];
  const lx = W - 110, ly = 8;
  ctx.fillStyle = "rgba(6,9,15,0.72)";
  if(ctx.roundRect) ctx.roundRect(lx-6, ly, 108, legend.length*16+10, 6); else ctx.rect(lx-6, ly, 108, legend.length*16+10);
  ctx.fill();
  legend.forEach(({ col, label }, i) => {
    const ry = ly + 8 + i * 16;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(lx+5, ry, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(240,240,255,0.85)"; ctx.font = "8.5px system-ui"; ctx.textAlign = "left";
    ctx.fillText(label, lx+14, ry+3);
  });

  ctx.restore();
}

// ─── LOCAL STORAGE SESSION HISTORY ───────────────────────────────────────────
const POSTURE_HISTORY_KEY = "physio_posture_history_v3";
function usePostureHistory() {
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(POSTURE_HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const saveSession = useCallback((s) => {
    setSessions(prev => {
      const next = [...prev, s].slice(-30);
      try { localStorage.setItem(POSTURE_HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  const clearHistory = () => {
    setSessions([]);
    try { localStorage.removeItem(POSTURE_HISTORY_KEY); } catch {}
  };
  return { sessions, saveSession, clearHistory };
}

// ─── TREND SPARKLINE ──────────────────────────────────────────────────────────
function PostureSparkline({ sessions, view, metric="score", colour=PC.accent }) {
  const points = sessions.filter(s => s.view === view && s[metric] !== undefined).slice(-10);
  if (points.length < 2) return null;
  const vals = points.map(p => p[metric]);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const range = mx - mn || 1;
  const W = 100, H = 28;
  const xs = points.map((_, i) => (i / (points.length-1)) * W);
  const ys = vals.map(v => H - ((v - mn) / range) * H);
  const path = xs.map((x, i) => `${i===0?"M":"L"}${x},${ys[i]}`).join(" ");
  return (
    <svg width={W} height={H} style={{ display:"block" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colour} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={colour} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L${xs[xs.length-1]},${H} L0,${H} Z`} fill="url(#sg)"/>
      <path d={path} stroke={colour} strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3" fill={colour}/>
    </svg>
  );
}

// ─── POSTURE SCORE RING ───────────────────────────────────────────────────────
function PostureScoreRing({ score, band, colour, size=80 }) {
  if (score === null || score === undefined || !colour) return null;
  const r = (size/2) - 7;
  const circ = 2 * Math.PI * r;
  const dash = (score/100) * circ;
  return (
    <svg width={size} height={size} style={{ display:"block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={PC.border} strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colour} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset="0" strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition:"stroke-dasharray 0.6s ease" }}/>
      <text x={size/2} y={size/2-4} textAnchor="middle" fill={colour} fontSize="17" fontWeight="800" fontFamily="system-ui">{score}</text>
      <text x={size/2} y={size/2+11} textAnchor="middle" fill={PC.muted} fontSize="7.5" fontFamily="system-ui">{band.toUpperCase()}</text>
    </svg>
  );
}

// ─── METRIC ROW COMPONENT ─────────────────────────────────────────────────────
function MetricRow({ label, value, unit, thresholds=[3,7], hint="", invert=false }) {
  // invert=true: lower value is worse (e.g. CVA where <49 = bad)
  if (value === null || value === undefined) return null;
  const abs = Math.abs(value);
  const level = invert
    ? (abs > thresholds[1] ? "normal" : abs > thresholds[0] ? "moderate" : "high")
    : (abs < thresholds[0] ? "normal" : abs < thresholds[1] ? "moderate" : "high");
  const col = level === "normal" ? PC.green : level === "moderate" ? PC.yellow : PC.red;
  const pct = Math.min(100, (abs / (thresholds[1] * 1.5)) * 100);
  const sign = value > 0 ? "+" : "";
  return (
    <div style={{ padding:"8px 11px", background:`${col}09`, border:`1px solid ${col}25`, borderRadius:9, marginBottom:5 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <span style={{ fontSize:"0.72rem", color:PC.muted }}>{label}</span>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:"0.9rem", fontWeight:800, color:col }}>{sign}{r1(value)}{unit}</span>
          <span style={{ fontSize:"0.58rem", padding:"1px 6px", borderRadius:5, background:`${col}20`, color:col, fontWeight:700, textTransform:"uppercase" }}>{level}</span>
        </div>
      </div>
      <div style={{ height:3, background:PC.s2, borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:2, transition:"width 0.4s" }}/>
      </div>
      {hint && <div style={{ fontSize:"0.6rem", color:PC.muted, marginTop:3 }}>{hint}</div>}
    </div>
  );
}

// ─── FINDING CARD ─────────────────────────────────────────────────────────────
function FindingCard({ f, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  const col = f.severity === "high" ? PC.red : f.severity === "moderate" ? PC.yellow : PC.accent;

  // Parse detail text — split on newlines, render bullet lines as list items
  const renderDetail = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div style={{ fontSize:"0.68rem", color:PC.muted, fontStyle:"italic", marginBottom:7, lineHeight:1.6 }}>
        {lines.map((line, i) => {
          if (line.startsWith("•")) {
            return (
              <div key={i} style={{ display:"flex", gap:6, marginLeft:4, marginBottom:2 }}>
                <span style={{ color:col, flexShrink:0 }}>•</span>
                <span>{line.slice(1).trim()}</span>
              </div>
            );
          }
          return line.trim() ? <div key={i} style={{ marginBottom:line.endsWith(":") ? 3 : 4, fontStyle: line.endsWith(":") ? "normal" : "italic", fontWeight: line.endsWith(":") ? 600 : 400, color: line.endsWith(":") ? PC.text : PC.muted }}>{line}</div> : <div key={i} style={{ height:4 }}/>;
        })}
      </div>
    );
  };

  return (
    <div style={{ background:`${col}09`, border:`1px solid ${col}30`, borderRadius:10, marginBottom:6, overflow:"hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 12px", cursor:"pointer" }}>
        <span style={{ fontSize:"0.85rem" }}>{f.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, color:col, fontSize:"0.78rem", marginBottom:1 }}>{f.text}</div>
          <div style={{ fontSize:"0.62rem", color:PC.muted }}>{f.region} · {f.icd}</div>
        </div>
        <span style={{ fontSize:"0.65rem", padding:"2px 8px", borderRadius:6, background:`${col}20`, color:col, fontWeight:700, textTransform:"uppercase", flexShrink:0 }}>
          {f.severity === "high" ? "Priority" : f.severity === "moderate" ? "Notable" : "Monitor"}
        </span>
        <span style={{ color:PC.muted, fontSize:"0.8rem", marginLeft:4, flexShrink:0 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 12px 12px 12px" }}>
          {f.detail && renderDetail(f.detail)}
          <div style={{ padding:"8px 11px", background:`${col}08`, border:`1px solid ${col}20`, borderRadius:8, fontSize:"0.73rem", color:PC.text, lineHeight:1.65 }}>
            <strong style={{ color:col }}>What to do: </strong>{f.correction}
          </div>
          {f.norm && (
            <div style={{ marginTop:5, fontSize:"0.6rem", color:PC.muted, fontStyle:"italic" }}>Reference: {f.norm}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── VIEW CONFIG ──────────────────────────────────────────────────────────────
const POSTURE_VIEW_META = {
  anterior:  { label:"Anterior",      short:"Front",  colour:PC.accent,  icon:"⬆", analysisKey:"anterior", helper:"Patient faces camera, feet hip-width, arms relaxed. Camera at pelvis height.", checks:["Full body in frame","Camera at pelvis height","Feet hip-width apart","Minimal clothing","Patient relaxed"] },
  posterior: { label:"Posterior",     short:"Back",   colour:PC.a2,      icon:"⬇", analysisKey:"posterior",helper:"Patient faces away. Scapulae, gluteal crease and heels visible.", checks:["Hair off shoulders","Scapulae clearly visible","Equal weight both feet","Arms relaxed","Heel tendon visible"] },
  left:      { label:"Left Lateral",  short:"L.Side", colour:PC.yellow,  icon:"◀", analysisKey:"lateral",  helper:"Patient stands side-on, left side toward camera. EAM, acromion, GT, and lateral malleolus in frame.", checks:["Ear, shoulder, hip, ankle aligned","Neutral gaze","Knees not locked","Do not lean toward camera","Arms visible"] },
  right:     { label:"Right Lateral", short:"R.Side", colour:PC.green,   icon:"▶", analysisKey:"lateral",  helper:"Patient stands side-on, right side toward camera.", checks:["Ear, shoulder, hip, ankle aligned","Neutral gaze","Knees not locked","Do not lean away","Arms visible"] },
};

// ─── MEDIAPIPE LOADER ─────────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}
const POSTURE_MP_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404";

// ─── MAIN POSTURE ANALYSIS MODULE ────────────────────────────────────────────
function PostureAnalysisModule({ activePatient, set } = {}) {
  // ── State ────────────────────────────────────────────────────────────────
  const [mode, setMode]                 = useState("upload");         // upload | live
  const [activeView, setActiveView]     = useState("anterior");
  const [mpStatus, setMpStatus]         = useState("loading");        // loading | ready | error
  const [cameraStatus, setCameraStatus] = useState("idle");           // idle | starting | active | error
  const [camFacing, setCamFacing]       = useState("environment");
  const [landmarks, setLandmarks]       = useState(null);
  const [measurements, setMeasurements] = useState(null);
  const [findings, setFindings]         = useState([]);
  const [scoreData, setScoreData]       = useState(null);
  const [reliability, setReliability]   = useState(null);
  const [tab, setTab]                   = useState("capture");        // capture | metrics | findings | history
  const [showHeatmap, setShowHeatmap]   = useState(true);
  const [showLabels, setShowLabels]     = useState(true);
  const [showGrid, setShowGrid]         = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysing, setAnalysing]       = useState(false);
  const [error, setError]               = useState(null);
  const [detectedViewNotice, setDetectedViewNotice] = useState(null);
  const [countdown, setCountdown]       = useState(null);
  const [motionWarning, setMotionWarning] = useState(false);
  const { sessions, saveSession, clearHistory } = usePostureHistory();
  const [showHistory, setShowHistory]   = useState(false);
  const [baselineCapture, setBaselineCapture] = useState(null);
  const [followUpCapture, setFollowUpCapture] = useState(null);
  const [compareMode, setCompareMode]   = useState(false);
  // Calibration state
  const [patientHeightCm, setPatientHeightCm] = useState(170);
  const [calibration, setCalibration]   = useState(null);
  const [showCalib, setShowCalib]       = useState(false);
  const calibrationRef = useRef(null);
  const patientHeightRef = useRef(170);
  useEffect(() => { patientHeightRef.current = patientHeightCm; }, [patientHeightCm]);
  // Static photo analysis state
  const [photoQueue, setPhotoQueue]     = useState([]);   // [{url, view, result}]
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [photoMode, setPhotoMode]       = useState("single"); // single | compare | batch

  // ── Refs ─────────────────────────────────────────────────────────────────
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const overlayRef     = useRef(null);
  const fileInputRef   = useRef(null);
  const poseRef        = useRef(null);
  const streamRef      = useRef(null);
  const rafRef         = useRef(null);
  const prevLmRef      = useRef(null);
  const videoSizeRef   = useRef({ w:640, h:480 });
  const activeViewRef  = useRef(activeView);
  const objectUrlRef   = useRef(null);
  const liveHandlerRef = useRef(null);
  const photoUrlsRef   = useRef([]);  // track batch object URLs for cleanup

  useEffect(() => { activeViewRef.current = activeView; }, [activeView]);
  useEffect(() => { calibrationRef.current = calibration; }, [calibration]);

  // ── Run full analysis pipeline ────────────────────────────────────────────
  const runAnalysis = useCallback((lm, view, persist=false, imgDataUrl=null, calib=null) => {
    if (!lm) return;
    const m  = AdvancedMeasurementEngine(lm, calib || calibrationRef.current);
    const r  = ReliabilityEngine(lm);
    // QUALITY GATE: if reliability engine blocks due to poor image quality,
    // return zero findings and a special score band rather than false findings.
    const f  = r.blocked ? [] : ClinicalFindingsEngine(lm, view, m);
    const s  = PostureScoreEngine(m, f, r);
    setLandmarks(lm);
    setMeasurements(m);
    setFindings(f);
    setReliability(r);
    setScoreData(s);
    if (persist && !r.blocked) {
      saveSession({
        view,
        score: s.score,
        band: s.band,
        findingsCount: f.length,
        highCount: f.filter(x=>x.severity==="high").length,
        capturedAt: new Date().toISOString(),
        img: imgDataUrl || null,
      });
    }
    return { m, f, r, s };
  }, [saveSession]);

  // ── Canvas overlay rendering ──────────────────────────────────────────────
  const renderOverlay = useCallback((lm, m) => {
    const canvas = overlayRef.current;
    if (!canvas || !lm) return;
    const { w, h } = videoSizeRef.current;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    renderPostureOverlay({ ctx, W:w, H:h, lm, measurements:m||{}, showHeatmap, showLabels, showGrid, view:activeViewRef.current });
  }, [showHeatmap, showLabels, showGrid]);

  // ── Load MediaPipe ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        await loadScript(`${POSTURE_MP_CDN}/pose.js`);
        const pose = new window.Pose({ locateFile: f => `${POSTURE_MP_CDN}/${f}` });
        pose.setOptions({ modelComplexity:2, smoothLandmarks:true, enableSegmentation:false, minDetectionConfidence:0.7, minTrackingConfidence:0.65 });
        const liveHandler = (results) => {
          setAnalysing(false);
          if (results.poseLandmarks?.length > 0) {
            setError(null);
            const lm = results.poseLandmarks;
            // Motion detection
            if (prevLmRef.current) {
              const drift = Math.abs((lm[0]?.x||0) - (prevLmRef.current[0]?.x||0)) * 100;
              setMotionWarning(drift > 3);
            }
            prevLmRef.current = lm;
            // Auto-calibrate on every frame
            const calib = computeCalibration(lm, videoSizeRef.current.h || 480);
            const result = runAnalysis(lm, activeViewRef.current, false, null, calib);
            if (result) renderOverlay(lm, result.m);
          } else {
            setError("No body landmarks detected. Ensure full body is visible.");
          }
        };
        liveHandlerRef.current = liveHandler;
        pose.onResults(liveHandler);
        await pose.initialize();
        poseRef.current = pose;
        setMpStatus("ready");
      } catch (e) {
        console.error("MediaPipe:", e);
        setMpStatus("error");
        setError("Could not load pose detection. Check your internet connection.");
      }
    })();
    return () => {
      stopCamera();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      photoUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  // Re-render overlay when settings change
  useEffect(() => {
    if (landmarks && measurements) renderOverlay(landmarks, measurements);
  }, [showHeatmap, showLabels, showGrid, landmarks, measurements, activeView, renderOverlay]);

  // ── Live camera ───────────────────────────────────────────────────────────
  async function startCamera(facing="environment") {
    stopCamera();
    setCameraStatus("starting"); setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:facing, width:{ideal:1280}, height:{ideal:720} }, audio:false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const { videoWidth:vw, videoHeight:vh } = videoRef.current;
        videoSizeRef.current = { w:vw||1280, h:vh||720 };
        if (overlayRef.current) { overlayRef.current.width=vw||1280; overlayRef.current.height=vh||720; }
      }
      setCameraStatus("active"); setCamFacing(facing);
      // Start pose loop
      const loop = async () => {
        const v = videoRef.current;
        if (v && v.readyState >= 2 && poseRef.current && streamRef.current) {
          try { await poseRef.current.send({ image:v }); } catch {}
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      setCameraStatus("error");
      setError(e.name === "NotAllowedError" ? "Camera permission denied. Please allow camera access." : `Camera error: ${e.message}`);
    }
  }

  function stopCamera() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraStatus("idle");
  }

  function flipCamera() { startCamera(camFacing === "user" ? "environment" : "user"); }

  // ── Calibration: derive pixPerCm from patient height + landmark span ────────
  function computeCalibration(lm, frameH) {
    const heightCm = patientHeightRef.current || patientHeightCm;
    if (!lm || !heightCm || !frameH) return null;
    // Use ankle-to-nose Y span as body height proxy in frame
    const nose  = lm[0];
    const ankleL = lm[27], ankleR = lm[28];
    if (!nose || !ankleL || !ankleR) return null;
    const ankleY = (ankleL.y + ankleR.y) / 2;
    const spanNorm = Math.abs(ankleY - nose.y);  // 0-1 normalised
    if (spanNorm < 0.1) return null;
    const spanPx = spanNorm * frameH;
    // Body height in frame ≈ 92% of total height (head above nose ~8%)
    const bodyHeightCm = heightCm * 0.92;
    const pixPerCm = spanPx / bodyHeightCm;
    const calib = { pixPerCm: r1(pixPerCm), frameHeightPx: frameH, patientHeightCm: heightCm };
    setCalibration(calib);
    return calib;
  }

  // ── Static photo analysis: run on an img element, store in photoQueue ──────
  // ── AUTO VIEW DETECTION ───────────────────────────────────────────────────
  // Infers anterior/posterior/left/right from MediaPipe landmark geometry
  // Called after pose detection so we have real landmark data
  function detectViewFromLandmarks(lm) {
    if (!lm || lm.length < 33) return "anterior";

    const g = i => lm[i] || {};
    const vis = i => lm[i]?.visibility || 0;

    const lShVis = vis(11), rShVis = vis(12);
    const lHipVis = vis(23), rHipVis = vis(24);
    const lAnkVis = vis(27), rAnkVis = vis(28);

    // ── 1. GEOMETRY-BASED LATERAL DETECTION ─────────────────────────────────
    // In a true lateral view the near-side shoulder and hip collapse in X.
    // In frontal/posterior both shoulders remain wide apart.
    const lShX = g(11).x || 0, rShX = g(12).x || 0;
    const lHipX = g(23).x || 0, rHipX = g(24).x || 0;
    const shWidth  = Math.abs(lShX - rShX);
    const hipWidth = Math.abs(lHipX - rHipX);

    // ── 2. BILATERAL VISIBILITY CHECK (critical guard against false laterals) ─
    // In frontal/posterior BOTH shoulders are visible (both vis > 0.5).
    // In lateral, the far shoulder is occluded (one vis < 0.35).
    const bothShouldersVisible  = lShVis > 0.50 && rShVis > 0.50;
    const bothHipsVisible       = lHipVis > 0.45 && rHipVis > 0.45;
    const bothSidesVisible      = bothShouldersVisible && bothHipsVisible;
    // If both sides clearly visible → it is NOT a lateral view, regardless of width
    const geometricLateral = shWidth < 0.18 && hipWidth < 0.18 && !bothSidesVisible;

    // ── 3. VISIBILITY-ASYMMETRY LATERAL DETECTION (secondary) ────────────────
    const shAsymm  = Math.abs(lShVis - rShVis);
    const hipAsymm = Math.abs(lHipVis - rHipVis);
    const ankAsymm = Math.abs(lAnkVis - rAnkVis);
    const visAsymm = (shAsymm + hipAsymm + ankAsymm) / 3;
    // Only apply visibility test if neither side is clearly bilateral
    const visibilityLateral = visAsymm > 0.28 && !bothSidesVisible;

    // Lateral if geometry OR visibility suggests it (but never if both sides visible)
    const isLateral = (geometricLateral || (visibilityLateral && shWidth < 0.28)) && !bothSidesVisible;

    if (isLateral) {
      // Determine left vs right from which side body landmarks are more visible
      // AND from nose position relative to shoulder midpoint in X
      const leftBodyVis  = (lShVis + lHipVis + lAnkVis) / 3;
      const rightBodyVis = (rShVis + rHipVis + rAnkVis) / 3;
      // Also use nose X vs shoulder midpoint X:
      // Left lateral: patient faces LEFT → nose X < shoulder midpoint X
      // Right lateral: patient faces RIGHT → nose X > shoulder midpoint X
      const noseX = g(0).x || 0.5;
      const shMidX = (lShX + rShX) / 2;
      const noseFacingLeft = noseX < shMidX - 0.02;
      const noseFacingRight = noseX > shMidX + 0.02;

      if (noseFacingLeft) return "left";
      if (noseFacingRight) return "right";
      // Fallback to visibility
      return leftBodyVis > rightBodyVis ? "left" : "right";
    }

    // ── 3. ANTERIOR vs POSTERIOR ─────────────────────────────────────────────
    const noseVis = vis(0), lEyeVis = vis(2), rEyeVis = vis(5);
    const faceVis = (noseVis + lEyeVis + rEyeVis) / 3;
    if (faceVis < 0.25) return "posterior";

    // Z-depth: nose closer to camera than shoulders = anterior
    const noseZ = g(0).z || 0;
    const shZ   = ((g(11).z||0) + (g(12).z||0)) / 2;
    if (noseZ > shZ + 0.05) return "posterior";

    return "anterior";
  }


  // ── View switch handler — re-analyses uploaded photo with new view if needed ─────────────
  async function handleViewSwitch(newView) {
    if (newView === activeView) return;
    setActiveView(newView);
    activeViewRef.current = newView;

    // If a photo is already uploaded (upload mode), re-run analysis with new view
    if (mode === "upload" && objectUrlRef.current && mpStatus === "ready" && !analysing) {
      setAnalysing(true);
      setFindings([]); setScoreData(null); setLandmarks(null); setMeasurements(null);
      setDetectedViewNotice("\ud83d\udd04 Re-analysing for " + ({anterior:"⬆ Anterior",posterior:"⬇ Posterior",left:"◄ Left Lateral",right:"► Right Lateral"}[newView]||newView) + " view…");
      const result = await analysePhoto(objectUrlRef.current, newView);
      setAnalysing(false);
      if (result) {
        setLandmarks(result.lm);
        setMeasurements(result.m);
        setFindings(result.f);
        setReliability(result.r);
        setScoreData(result.s);
        setUploadedImage(result.annotatedUrl);
        setDetectedViewNotice("\u2705 " + ({anterior:"⬆ Anterior",posterior:"⬇ Posterior",left:"◄ Left Lateral",right:"► Right Lateral"}[newView]||newView) + " analysis complete");
        setTimeout(() => setDetectedViewNotice(null), 3000);
        setTab("findings");
      } else {
        setDetectedViewNotice("\u26a0 Could not re-analyse — ensure full body is visible");
        setTimeout(() => setDetectedViewNotice(null), 4000);
      }
    }
  }

  // ── View label for toast notification ────────────────────────────────────
  const VIEW_LABEL_MAP = {
    anterior: "⬆ Anterior (Front)",
    posterior: "⬇ Posterior (Back)",
    left:      "◀ Left Lateral",
    right:     "▶ Right Lateral",
  };

  async function analysePhoto(url, view) {
    if (!poseRef.current || mpStatus !== "ready") return null;
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = async () => {
        const w = img.naturalWidth, h = img.naturalHeight;
        videoSizeRef.current = { w, h };
        if (overlayRef.current) { overlayRef.current.width = w; overlayRef.current.height = h; }
        let resolved = false;
        const tempHandler = (results) => {
          if (resolved) return;
          resolved = true;
          if (results.poseLandmarks?.length > 0) {
            const lm = results.poseLandmarks;

            // ── USE MANUALLY SELECTED VIEW (no auto-detection) ───────────────
            // View is always whatever the user selected via the view buttons
            const safeView = activeViewRef.current || "anterior";
            // (auto-detection disabled — user must select Front/Back/Left/Right manually)

            const calib = computeCalibration(lm, h) || calibrationRef.current;
            const m = AdvancedMeasurementEngine(lm, calib);
            const r = ReliabilityEngine(lm);
            // QUALITY GATE: suppress all findings if reliability is blocked
            const f = r.blocked ? [] : ClinicalFindingsEngine(lm, safeView, m);
            const s = PostureScoreEngine(m, f, r);
            const oc = document.createElement("canvas");
            oc.width = w; oc.height = h;
            const octx = oc.getContext("2d");
            octx.drawImage(img, 0, 0, w, h);
            renderPostureOverlay({ ctx: octx, W: w, H: h, lm, measurements: m, showHeatmap: true, showLabels: true, showGrid: true, view: safeView, skipClear: true });
            const annotatedUrl = oc.toDataURL("image/jpeg", 0.92);
            resolve({ lm, m, f, r, s, url, annotatedUrl, view: safeView, detectedView: null, time: new Date().toISOString() });
          } else {
            resolve(null);
          }
        };
        poseRef.current.onResults(tempHandler);
        const timeout = setTimeout(() => {
          if (!resolved) { resolved = true; resolve(null); }
          if (liveHandlerRef.current) poseRef.current.onResults(liveHandlerRef.current);
        }, 8000);
        try {
          await poseRef.current.send({ image: img });
        } catch { resolved = true; resolve(null); }
        setTimeout(() => {
          clearTimeout(timeout);
          if (liveHandlerRef.current) poseRef.current.onResults(liveHandlerRef.current);
        }, 400);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // ── Photo upload — now routes through analysePhoto for calibration + queue ──
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError(null); setAnalysing(true);

    if (files.length === 1) {
      // Single photo flow
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(files[0]);
      objectUrlRef.current = url;
      setUploadedImage(url);
      setLandmarks(null); setMeasurements(null); setFindings([]); setScoreData(null); setTab("capture");
      const result = await analysePhoto(url, activeViewRef.current);
      setAnalysing(false);
      if (result) {
        setLandmarks(result.lm);
        setMeasurements(result.m);
        setFindings(result.f);
        setReliability(result.r);
        setScoreData(result.s);
        setUploadedImage(result.annotatedUrl);
        setPhotoQueue([result]);
        setActivePhotoIdx(0);
        // Show selected view confirmation (no auto-detection)
        const viewNames = {anterior:"⬆ Anterior (Front)",posterior:"⬇ Posterior (Back)",left:"◄ Left Lateral",right:"► Right Lateral"};
        setDetectedViewNotice("✅ Analysed as " + (viewNames[result.view]||result.view) + " — change view above if needed");
        setTimeout(() => setDetectedViewNotice(null), 4000);
        // Persist
        saveSession({ view: result.view, score: result.s.score, band: result.s.band,
          findingsCount: result.f.length, highCount: result.f.filter(x=>x.severity==="high").length,
          capturedAt: result.time, img: result.annotatedUrl });
        setTimeout(() => setTab("findings"), 400);
      } else {
        setAnalysing(false);
        setError("No pose detected. Ensure full body is clearly visible.");
      }
    } else {
      // Multi-photo batch flow
      setPhotoMode(photoMode === "compare" ? "compare" : "batch");
      const results = [];
      // Revoke previous batch URLs
      photoUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      photoUrlsRef.current = [];
      for (const file of files) {
        const url = URL.createObjectURL(file);
        photoUrlsRef.current.push(url);
        const result = await analysePhoto(url, activeViewRef.current);
        if (result) results.push(result);
      }
      setPhotoQueue(results);
      setActivePhotoIdx(0);
      setAnalysing(false);
      if (results[0]) {
        setLandmarks(results[0].lm); setMeasurements(results[0].m);
        setFindings(results[0].f); setReliability(results[0].r);
        setScoreData(results[0].s);
        setUploadedImage(results[0].annotatedUrl);
        setTab("findings");
      }
    }
    e.target.value = "";
  }

  // ── Capture photo from live feed ──────────────────────────────────────────
  async function capturePhoto(delay=0) {
    if (delay > 0) {
      for (let i = delay; i >= 1; i--) {
        setCountdown(i);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    setCountdown(null);
    const video = videoRef.current, overlay = overlayRef.current;
    if (!video || video.readyState < 2) return;
    // Bake full analysis overlay (grid + skeleton + spine + ASIS + labels) onto image
    const dataUrl = bakeOverlayOntoCapture(video, overlay) || (() => {
      const { w, h } = videoSizeRef.current;
      const cc = document.createElement("canvas"); cc.width=w; cc.height=h;
      const ctx = cc.getContext("2d");
      ctx.translate(w,0); ctx.scale(-1,1); ctx.drawImage(video,0,0,w,h); ctx.setTransform(1,0,0,1,0,0);
      return cc.toDataURL("image/jpeg",0.93);
    })();
    const ts = new Date().toLocaleString();
    setCapturedImage(dataUrl);
    setTab("capture"); // switch back to capture tab to show photo
    if (landmarks) {
      const calib = computeCalibration(landmarks, videoSizeRef.current.h) || calibrationRef.current;
      runAnalysis(landmarks, activeView, true, dataUrl, calib);
    }
    if (compareMode) {
      if (!baselineCapture) setBaselineCapture({ img:dataUrl, view:activeView, score:scoreData?.score, time:ts });
      else setFollowUpCapture({ img:dataUrl, view:activeView, score:scoreData?.score, time:ts });
    }
  }

  // ── Export annotated image ────────────────────────────────────────────────
  function downloadCapture() {
    const src = capturedImage || uploadedImage;
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `posture_${activeView}_${Date.now()}.jpg`;
    a.click();
  }

  // ── Bake full analysis grid onto captured image ────────────────────────────
  function bakeOverlayOntoCapture(videoEl, overlayEl) {
    if (!videoEl || videoEl.readyState < 2) return null;
    const { w, h } = videoSizeRef.current;
    const cc = document.createElement("canvas"); cc.width = w; cc.height = h;
    const ctx = cc.getContext("2d");
    // Mirror video
    ctx.translate(w,0); ctx.scale(-1,1);
    ctx.drawImage(videoEl, 0, 0, w, h);
    ctx.setTransform(1,0,0,1,0,0);
    // Draw the full analysis overlay (grid + skeleton + labels + spine + ASIS + heatmap)
    if (landmarks && measurements) {
      renderPostureOverlay({ ctx, W:w, H:h, lm:landmarks, measurements, showHeatmap:true, showLabels:true, showGrid:true, view:activeView });
    }
    // Draw overlay canvas if present
    if (overlayEl && overlayEl.width > 0) ctx.drawImage(overlayEl, 0, 0, w, h);
    // Timestamp + view watermark
    const ts = new Date().toLocaleString();
    const label = `${activeView.toUpperCase()} VIEW · ${ts}`;
    ctx.font = "bold 13px system-ui";
    const lw2 = ctx.measureText(label).width + 16;
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    if(ctx.roundRect) ctx.roundRect(8, h-30, lw2, 22, 5); else ctx.fillRect(8,h-30,lw2,22);
    ctx.fill();
    ctx.fillStyle = "#00e5ff"; ctx.textAlign="left"; ctx.fillText(label, 16, h-12);
    return cc.toDataURL("image/jpeg", 0.93);
  }

  // ── Derived UI state ──────────────────────────────────────────────────────
  const isLive   = mode === "live";
  const camReady = cameraStatus === "active";
  const hasData  = !!landmarks;
  const highFindings   = findings.filter(f => f.severity === "high");
  const otherFindings  = findings.filter(f => f.severity !== "high");
  const viewMeta       = POSTURE_VIEW_META[activeView] || POSTURE_VIEW_META["anterior"];
  const recentSessions = sessions.filter(s => s.view === activeView).slice(-5);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background:PC.bg, minHeight:"100vh", fontFamily:"system-ui, -apple-system, sans-serif" }}>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${PC.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:PC.surface }}>
        <div>
          <div style={{ fontWeight:900, fontSize:"0.95rem", background:`linear-gradient(90deg,${PC.accent},${PC.a2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            📐 Posture Analysis
          </div>
          <div style={{ fontSize:"0.62rem", color:PC.muted, marginTop:1 }}>Clinical-grade biomechanical assessment</div>
        </div>
        <div style={{ display:"flex", gap:7, alignItems:"center" }}>
          {/* AI Status pill */}
          <div style={{ padding:"3px 9px", borderRadius:20, fontSize:"0.6rem", fontWeight:700,
            background: mpStatus==="ready" ? "rgba(0,201,122,0.12)" : mpStatus==="loading" ? "rgba(255,179,0,0.12)" : "rgba(255,77,109,0.12)",
            color: mpStatus==="ready" ? PC.green : mpStatus==="loading" ? PC.yellow : PC.red,
            border: `1px solid ${mpStatus==="ready" ? PC.green : mpStatus==="loading" ? PC.yellow : PC.red}30` }}>
            {mpStatus==="ready" ? "🤖 AI Ready" : mpStatus==="loading" ? "⏳ Loading…" : "❌ AI Error"}
          </div>
          <button onClick={() => setShowHistory(true)} style={{ padding:"5px 10px", background:`${PC.a2}15`, border:`1px solid ${PC.a2}30`, borderRadius:8, color:PC.a2, fontSize:"0.68rem", fontWeight:700, cursor:"pointer" }}>
            📁 History ({sessions.length})
          </button>
        </div>
      </div>

      {/* ── MODE TOGGLE ────────────────────────────────────────────────── */}
      <div style={{ padding:"10px 16px", background:PC.surface, borderBottom:`1px solid ${PC.border}`, display:"flex", gap:8 }}>
        {[["upload","📤 Upload Photo"],["live","📷 Live Camera"]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); if(m==="live")setTab("capture"); else{ stopCamera(); setTab("capture"); } }}
            style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${mode===m?viewMeta.colour:PC.border}`, background:mode===m?`${viewMeta.colour}15`:"transparent", color:mode===m?viewMeta.colour:PC.muted, fontWeight:700, fontSize:"0.78rem", cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── VIEW SELECTOR ──────────────────────────────────────────────── */}
      <div style={{ padding:"10px 16px", background:PC.s2, borderBottom:`1px solid ${PC.border}` }}>
        <div style={{ fontSize:"0.58rem", fontWeight:700, color:PC.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>
          📐 Select Posture View — choose <em>before</em> uploading or capturing
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:7 }}>
          {Object.entries(POSTURE_VIEW_META).map(([key, meta]) => {
            const active = activeView === key;
            return (
              <button key={key} onClick={() => handleViewSwitch(key)} style={{ padding:"9px 5px", borderRadius:10, border:`1px solid ${active?meta.colour:PC.border}`, background:active?`${meta.colour}18`:"transparent", cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:"1rem", marginBottom:3 }}>{meta.icon}</div>
                <div style={{ fontSize:"0.62rem", fontWeight:800, color:active?meta.colour:PC.muted }}>{meta.short}</div>
              </button>
            );
          })}
        </div>
        {/* Checklist */}
        <div style={{ marginTop:8, padding:"8px 11px", background:`${viewMeta.colour}08`, border:`1px solid ${viewMeta.colour}20`, borderRadius:9, fontSize:"0.68rem", color:PC.muted, lineHeight:1.7 }}>
          <span style={{ color:viewMeta.colour, fontWeight:700 }}>📋 {viewMeta.short} setup: </span>
          {viewMeta.helper}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"3px 10px", marginTop:4 }}>
            {viewMeta.checks.map((c,i) => <span key={i} style={{ color:PC.a3 }}>✓ {c}</span>)}
          </div>
        </div>
      </div>

      {/* ── CAMERA / UPLOAD AREA ───────────────────────────────────────── */}
      {mode === "live" ? (
        <div>
          {/* Camera controls */}
          {!camReady ? (
            <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:9 }}>
              {error && <div style={{ padding:"9px 12px", background:"rgba(255,77,109,0.1)", border:`1px solid ${PC.red}30`, borderRadius:9, fontSize:"0.76rem", color:PC.red }}>{error}</div>}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                {[["environment","📷 Back Camera"],["user","🤳 Front Camera"]].map(([facing,label]) => (
                  <button key={facing} onClick={() => startCamera(facing)} disabled={mpStatus!=="ready"}
                    style={{ padding:"13px", borderRadius:12, border:`1px solid ${PC.border}`, background:PC.surface, color:mpStatus==="ready"?PC.text:PC.muted, fontWeight:700, fontSize:"0.8rem", cursor:mpStatus==="ready"?"pointer":"not-allowed" }}>
                    {label}
                  </button>
                ))}
              </div>
              {cameraStatus==="starting" && <div style={{ textAlign:"center", color:PC.yellow, fontSize:"0.78rem" }}>⏳ Starting camera…</div>}
            </div>
          ) : (
            <div>
              {/* Live feed */}
              <div style={{ position:"relative", background:"#f5f0fb", aspectRatio:"4/3", maxHeight:340, overflow:"hidden" }}>
                <video ref={videoRef} playsInline muted autoPlay style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)" }}/>
                <canvas ref={overlayRef} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", transform:"scaleX(-1)", pointerEvents:"none" }}/>
                {/* Status chips */}
                <div style={{ position:"absolute", top:8, left:8, display:"flex", gap:5, flexWrap:"wrap" }}>
                  <div style={{ padding:"3px 8px", borderRadius:8, background:"rgba(0,0,0,0.7)", fontSize:"0.6rem", fontWeight:700, color: hasData ? PC.green : PC.yellow }}>
                    {hasData ? `🟢 Tracking · ${reliability?.score}% reliable` : "🟡 No landmarks"}
                  </div>
                  {motionWarning && <div style={{ padding:"3px 8px", borderRadius:8, background:"rgba(0,0,0,0.7)", fontSize:"0.6rem", fontWeight:700, color:PC.yellow }}>🌀 Hold still</div>}
                  {calibration && <div style={{ padding:"3px 8px", borderRadius:8, background:"rgba(0,0,0,0.7)", fontSize:"0.6rem", fontWeight:700, color:PC.green }}>📏 Calibrated</div>}
                </div>
                {/* Score overlay */}
                {scoreData && (
                  <div style={{ position:"absolute", top:8, right:8 }}>
                    <PostureScoreRing score={scoreData?.score} band={scoreData?.band} colour={scoreData?.colour} size={72}/>
                  </div>
                )}
                {/* Countdown */}
                {countdown !== null && (
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.4)" }}>
                    <div style={{ fontSize:"5rem", fontWeight:900, color:"#fff", lineHeight:1 }}>{countdown}</div>
                  </div>
                )}
              </div>

              {/* Camera action bar */}
              <div style={{ padding:"10px 14px", background:PC.surface, borderTop:`1px solid ${PC.border}`, display:"flex", gap:8, flexWrap:"wrap" }}>
                <button onClick={() => capturePhoto(0)} disabled={!hasData}
                  style={{ flex:2, padding:"11px", background:hasData?`linear-gradient(135deg,${PC.accent},${PC.a2})`:"#1a2d45", border:"none", borderRadius:10, color:hasData?"#faf8fc":PC.muted, fontWeight:800, fontSize:"0.8rem", cursor:hasData?"pointer":"not-allowed" }}>
                  📸 Capture
                </button>
                <button onClick={() => capturePhoto(3)} disabled={!hasData}
                  style={{ flex:1, padding:"11px", background:`${PC.a2}20`, border:`1px solid ${PC.a2}30`, borderRadius:10, color:PC.a2, fontWeight:700, fontSize:"0.72rem", cursor:hasData?"pointer":"not-allowed" }}>
                  ⏳ 3s
                </button>
                <button onClick={flipCamera}
                  style={{ flex:"0 0 44px", padding:"11px", background:PC.s2, border:`1px solid ${PC.border}`, borderRadius:10, color:PC.muted, fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>
                  🔄
                </button>
                <button onClick={stopCamera}
                  style={{ flex:"0 0 44px", padding:"11px", background:"rgba(255,77,109,0.12)", border:`1px solid ${PC.red}30`, borderRadius:10, color:PC.red, fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>
                  ⏹
                </button>
              </div>

              {/* ── CAPTURED PHOTO PREVIEW with full analysis grid ── */}
              {capturedImage && (
                <div style={{ padding:"12px 14px", background:PC.s2, borderTop:`1px solid ${PC.border}` }}>
                  <div style={{ fontSize:"0.65rem", fontWeight:800, color:PC.accent, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>
                    📸 Captured — Analysis Grid Baked In
                  </div>
                  <div style={{ position:"relative", borderRadius:12, overflow:"hidden", marginBottom:10 }}>
                    <img
                      src={capturedImage}
                      alt="Captured posture with analysis overlay"
                      style={{ width:"100%", display:"block", borderRadius:12, maxHeight:320, objectFit:"cover", background:"#f5f0fb" }}
                    />
                    {scoreData && (
                      <div style={{ position:"absolute", top:8, right:8 }}>
                        <PostureScoreRing score={scoreData?.score} band={scoreData?.band} colour={scoreData?.colour} size={68}/>
                      </div>
                    )}
                    {reliability && (
                      <div style={{ position:"absolute", top:8, left:8, padding:"3px 9px", borderRadius:8, background:"rgba(0,0,0,0.75)", fontSize:"0.6rem", fontWeight:700, color:reliability.score>75?PC.green:reliability.score>50?PC.yellow:PC.red }}>
                        🤖 {reliability.status} · {reliability.score}%
                      </div>
                    )}
                    <div style={{ position:"absolute", bottom:8, left:8, padding:"3px 9px", borderRadius:8, background:"rgba(0,0,0,0.75)", fontSize:"0.6rem", fontWeight:700, color:viewMeta.colour }}>
                      {viewMeta.label} View
                    </div>
                  </div>
                  {/* Findings chips */}
                  {findings.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
                      {findings.slice(0,6).map((f,i) => (
                        <span key={i} style={{
                          padding:"3px 9px", borderRadius:8, fontSize:"0.65rem", fontWeight:700,
                          background: f.severity==="high" ? "rgba(255,77,109,0.15)" : "rgba(255,179,0,0.15)",
                          border: `1px solid ${f.severity==="high" ? PC.red : PC.yellow}40`,
                          color: f.severity==="high" ? PC.red : PC.yellow,
                        }}>
                          {f.icon} {f.region}
                        </span>
                      ))}
                      {findings.length > 6 && <span style={{padding:"3px 9px",borderRadius:8,fontSize:"0.65rem",background:PC.s2,color:PC.muted,fontWeight:700}}>+{findings.length-6} more</span>}
                    </div>
                  )}
                  {/* Action buttons */}
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={downloadCapture}
                      style={{ flex:1, padding:"9px", background:`linear-gradient(135deg,${PC.green},#059669)`, border:"none", borderRadius:9, color:"#fff", fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>
                      ⬇ Save Annotated Image
                    </button>
                    <button onClick={() => setCapturedImage(null)}
                      style={{ padding:"9px 13px", background:PC.s2, border:`1px solid ${PC.border}`, borderRadius:9, color:PC.muted, fontWeight:600, fontSize:"0.75rem", cursor:"pointer" }}>
                      ✕ Clear
                    </button>
                  </div>
                </div>
              )}
              {/* Height calibration row */}
              <div style={{ padding:"7px 14px", background:PC.s2, borderTop:`1px solid ${PC.border}`, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:"0.65rem", color:PC.muted }}>📏 Height:</span>
                <input type="number" value={patientHeightCm} min={100} max={220}
                  onChange={e=>setPatientHeightCm(Number(e.target.value))}
                  style={{ width:54, padding:"3px 6px", background:"#ffffff", border:`1px solid ${PC.border}`, borderRadius:7, color:PC.text, fontSize:"0.75rem", fontWeight:700 }}/>
                <span style={{ fontSize:"0.65rem", color:PC.muted }}>cm — used for true mm measurements</span>
                {calibration && <span style={{ fontSize:"0.62rem", padding:"2px 7px", borderRadius:6, background:"rgba(0,201,122,0.1)", color:PC.green, marginLeft:"auto" }}>✅ {calibration.pixPerCm.toFixed(1)}px/cm</span>}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Upload mode
        <div style={{ padding:"14px 16px" }}>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display:"none" }}/>

          {/* ── BIG UPLOAD BUTTON — always visible at front ─────────────── */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${uploadedImage ? viewMeta.colour : PC.accent}`,
              borderRadius: 14,
              padding: "18px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: uploadedImage ? `${viewMeta.colour}08` : `${PC.accent}06`,
              marginBottom: 12,
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}>
            {uploadedImage ? (
              <div>
                {/* Show uploaded/annotated photo with analysis grid */}
                <div style={{ position:"relative", borderRadius:10, overflow:"hidden", marginBottom:10 }}>
                  <img
                    src={uploadedImage}
                    alt="Analysed posture"
                    style={{ width:"100%", display:"block", borderRadius:10, maxHeight:360, objectFit:"cover", background:"#f5f0fb" }}
                  />
                  {/* Score overlay on photo */}
                  {scoreData && (
                    <div style={{ position:"absolute", top:8, right:8 }}>
                      <PostureScoreRing score={scoreData?.score} band={scoreData?.band} colour={scoreData?.colour} size={72}/>
                    </div>
                  )}
                  {/* Reliability badge */}
                  {reliability && (
                    <div style={{ position:"absolute", top:8, left:8, padding:"4px 10px", borderRadius:8, background:"rgba(0,0,0,0.75)", fontSize:"0.62rem", fontWeight:700, color: reliability.score>75?PC.green:reliability.score>50?PC.yellow:PC.red }}>
                      🤖 {reliability.status} · {reliability.score}%
                    </div>
                  )}
                  {/* View label */}
                  <div style={{ position:"absolute", bottom:8, left:8, padding:"3px 10px", borderRadius:8, background:"rgba(0,0,0,0.75)", fontSize:"0.62rem", fontWeight:700, color:viewMeta.colour }}>
                    {viewMeta.label} View
                  </div>
                </div>
                {/* Findings chips below photo */}
                {findings.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, justifyContent:"center", marginBottom:8 }}>
                    {findings.slice(0,6).map((f,i) => (
                      <span key={i} style={{
                        padding:"3px 9px", borderRadius:8, fontSize:"0.65rem", fontWeight:700,
                        background: f.severity==="high" ? "rgba(255,77,109,0.15)" : "rgba(255,179,0,0.15)",
                        border: `1px solid ${f.severity==="high" ? PC.red : PC.yellow}40`,
                        color: f.severity==="high" ? PC.red : PC.yellow,
                      }}>
                        {f.icon} {f.region}
                      </span>
                    ))}
                    {findings.length > 6 && <span style={{padding:"3px 9px",borderRadius:8,fontSize:"0.65rem",fontWeight:700,background:PC.s2,color:PC.muted}}>+{findings.length-6} more</span>}
                  </div>
                )}
                {/* Re-upload button */}
                <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                  <button
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    style={{ padding:"8px 18px", background:`linear-gradient(135deg,${PC.accent},${PC.a2})`, border:"none", borderRadius:9, color:"#fff", fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>
                    📷 Upload New Photo
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); downloadCapture(); }}
                    style={{ padding:"8px 14px", background:PC.s2, border:`1px solid ${PC.border}`, borderRadius:9, color:PC.text, fontWeight:600, fontSize:"0.75rem", cursor:"pointer" }}>
                    ⬇ Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* ── Top row: blue upload button + mini guided view diagrams ── */}
                <div style={{ display:"flex", gap:14, alignItems:"stretch", marginBottom:14 }}>
                  {/* LEFT: big blue upload CTA */}
                  <div style={{ flex:"0 0 auto", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, minWidth:140 }}>
                    <div style={{ fontSize:"2.4rem", lineHeight:1 }}>📤</div>
                    <div style={{ fontWeight:900, color:PC.text, fontSize:"0.88rem", textAlign:"center", lineHeight:1.3 }}>
                      Upload Patient Photo
                    </div>
                    <div
                      onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      style={{
                        display:"inline-flex", alignItems:"center", gap:8,
                        padding:"12px 22px",
                        background:"linear-gradient(135deg,#1d6fe8,#1a56cc)",
                        borderRadius:12, color:"#fff", fontWeight:800, fontSize:"0.88rem",
                        boxShadow:"0 4px 18px rgba(29,111,232,0.45)",
                        cursor:"pointer", userSelect:"none",
                        border:"2px solid rgba(255,255,255,0.18)",
                        letterSpacing:"0.2px",
                      }}>
                      <span style={{ fontSize:"1.1rem" }}>📷</span> UPLOAD PHOTO
                    </div>
                    <div style={{ fontSize:"0.6rem", color:PC.muted, textAlign:"center", lineHeight:1.5 }}>
                      JPG or PNG · Single, Compare or Batch
                    </div>
                  </div>

                  {/* RIGHT: mini guided view camera diagrams */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"0.58rem", fontWeight:800, color:PC.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>
                      📐 Guided Views — position patient for each
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                      {[
                        { key:"anterior",  icon:"⬆", label:"Front",    colour:"#00e5ff", tip:"Facing camera", detail:"Shoulders · Pelvis · Knees" },
                        { key:"posterior", icon:"⬇", label:"Back",     colour:"#7f5af0", tip:"Back to camera", detail:"Scapulae · Spine · Heels" },
                        { key:"lateral",   icon:"◀", label:"L. Side",  colour:"#ffb300", tip:"Left side toward camera", detail:"Ear · Hip · Ankle plumb" },
                        { key:"right_lateral",icon:"▶",label:"R. Side",colour:"#00c97a", tip:"Right side toward camera", detail:"Ear · Hip · Ankle plumb" },
                      ].map(v => (
                        <div key={v.key}
                          onClick={e => { e.stopPropagation(); setActiveView(v.key === "right_lateral" ? "right_lateral" : v.key); }}
                          style={{
                            background: activeView===v.key ? `${v.colour}16` : PC.s2,
                            border:`1px solid ${activeView===v.key ? v.colour : PC.border}`,
                            borderRadius:9, padding:"7px 9px", cursor:"pointer",
                            transition:"all 0.15s",
                          }}>
                          <svg width="100%" viewBox="0 0 90 54" style={{ display:"block", marginBottom:4, borderRadius:5, background:"rgba(0,0,0,0.18)" }}>
                            <rect x="2" y="18" width="20" height="14" rx="3" fill="none" stroke={v.colour} strokeWidth="1.5"/>
                            <rect x="6" y="14" width="6" height="4" rx="1.5" fill={v.colour} opacity="0.6"/>
                            <circle cx="12" cy="25" r="4" fill="none" stroke={v.colour} strokeWidth="1.2"/>
                            <circle cx="12" cy="25" r="1.8" fill={v.colour} opacity="0.5"/>
                            <line x1="22" y1="25" x2="50" y2="25" stroke={v.colour} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.5"/>
                            {v.key==="anterior"||v.key==="posterior" ? (
                              <g transform="translate(52,6)">
                                <circle cx="14" cy="6" r="5" fill="none" stroke={v.colour} strokeWidth="1.5"/>
                                <line x1="14" y1="11" x2="14" y2="30" stroke={v.colour} strokeWidth="1.5"/>
                                <line x1="6" y1="16" x2="22" y2="16" stroke={v.colour} strokeWidth="1.5"/>
                                <line x1="14" y1="30" x2="9" y2="44" stroke={v.colour} strokeWidth="1.5"/>
                                <line x1="14" y1="30" x2="19" y2="44" stroke={v.colour} strokeWidth="1.5"/>
                              </g>
                            ) : (
                              <g transform="translate(52,6)">
                                <circle cx="14" cy="6" r="5" fill="none" stroke={v.colour} strokeWidth="1.5"/>
                                <line x1="14" y1="11" x2="14" y2="30" stroke={v.colour} strokeWidth="1.5"/>
                                <line x1="7" y1="16" x2="18" y2="18" stroke={v.colour} strokeWidth="1.5"/>
                                <line x1="14" y1="30" x2="12" y2="44" stroke={v.colour} strokeWidth="1.5"/>
                                <line x1="14" y1="30" x2="18" y2="43" stroke={v.colour} strokeWidth="1.5"/>
                              </g>
                            )}
                            <line x1="66" y1="2" x2="66" y2="52" stroke={v.colour} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.35"/>
                            <text x="45" y="50" fill={v.colour} fontSize="5.5" fontWeight="700" fontFamily="system-ui" textAnchor="middle" opacity="0.8">{v.icon} {v.label.toUpperCase()}</text>
                          </svg>
                          <div style={{ fontSize:"0.6rem", fontWeight:800, color:v.colour, marginBottom:1 }}>{v.label}</div>
                          <div style={{ fontSize:"0.55rem", color:PC.muted, lineHeight:1.4 }}>{v.tip}</div>
                          <div style={{ fontSize:"0.52rem", color:PC.muted, opacity:0.7, marginTop:2 }}>{v.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI detection note */}
                <div style={{ fontSize:"0.65rem", color:PC.muted, lineHeight:1.6, padding:"8px 10px", background:PC.s2, borderRadius:9, border:`1px solid ${PC.border}` }}>
                  <span style={{ color:PC.accent, fontWeight:700 }}>🤖 AI detects: </span>
                  Head · Ears · Eyes · Shoulders · Elbows · Wrists · Hips / ASIS · Knees · Ankles · Feet
                  <span style={{ marginLeft:8, color:PC.muted, opacity:0.7 }}>· Full body must be visible · plain background · good lighting</span>
                </div>
              </div>
            )}
          </div>

          {/* ── CALIBRATION PANEL ─────────────────────────────────────── */}
          <div style={{ marginBottom:10, padding:"10px 13px", background:PC.surface, border:`1px solid ${calibration?"rgba(0,201,122,0.3)":PC.border}`, borderRadius:11, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.6rem", fontWeight:800, color:calibration?PC.green:PC.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:4 }}>
                {calibration ? `✅ Calibrated — ${calibration.pixPerCm.toFixed(1)}px/cm` : "📏 Calibration (for true cm measurements)"}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ fontSize:"0.68rem", color:PC.muted, flexShrink:0 }}>Patient height</span>
                <input type="number" value={patientHeightCm} min={100} max={220}
                  onChange={e => setPatientHeightCm(Number(e.target.value))}
                  style={{ width:56, padding:"4px 7px", background:"#ffffff", border:`1px solid ${PC.border}`, borderRadius:7, color:PC.text, fontSize:"0.78rem", fontWeight:700 }}/>
                <span style={{ fontSize:"0.68rem", color:PC.muted }}>cm</span>
                {calibration && <span style={{ fontSize:"0.65rem", padding:"2px 7px", borderRadius:6, background:"rgba(0,201,122,0.1)", color:PC.green }}>Active</span>}
              </div>
            </div>
            <div style={{ fontSize:"0.65rem", color:PC.muted, textAlign:"right", lineHeight:1.4 }}>
              Auto-calibrates<br/>on first analysis
            </div>
          </div>

          {/* ── PHOTO MODE TABS ───────────────────────────────────────────── */}
          <div style={{ display:"flex", gap:6, marginBottom:10 }}>
            {[["single","📸 Single"],["compare","⚖ Compare"],["batch","📂 Batch"]].map(([m,label])=>(
              <button key={m} onClick={()=>setPhotoMode(m)}
                style={{ flex:1, padding:"7px 4px", borderRadius:9, border:`1px solid ${photoMode===m?PC.accent:PC.border}`, background:photoMode===m?`${PC.accent}15`:"transparent", color:photoMode===m?PC.accent:PC.muted, fontWeight:700, fontSize:"0.65rem", cursor:"pointer" }}>
                {label}
              </button>
            ))}
          </div>

          {!uploadedImage ? (
            <div>
              {/* Upload drop zone */}
              <div onClick={() => fileInputRef.current?.click()}
                style={{ border:`2px dashed ${viewMeta.colour}40`, borderRadius:14, padding:"28px 20px", textAlign:"center", cursor:"pointer", background:`${viewMeta.colour}05` }}>
                <div style={{ fontSize:"2.2rem", marginBottom:8 }}>
                  {photoMode==="batch" ? "📂" : photoMode==="compare" ? "⚖" : "📸"}
                </div>
                <div style={{ fontWeight:800, color:viewMeta.colour, fontSize:"0.85rem", marginBottom:5 }}>
                  {photoMode==="batch" ? "Upload Multiple Photos" : photoMode==="compare" ? "Upload Before & After" : "Upload Posture Photo"}
                </div>
                <div style={{ fontSize:"0.7rem", color:PC.muted, lineHeight:1.6 }}>
                  {photoMode==="batch" ? "Select multiple images — all analysed automatically" :
                   photoMode==="compare" ? "Select 2 photos to compare side-by-side" :
                   "Full body visible · plain background · minimal clothing"}
                </div>
              </div>

              {/* Clinical checklist */}
              <div style={{ marginTop:10, padding:"9px 12px", background:PC.s2, borderRadius:10, border:`1px solid ${PC.border}` }}>
                <div style={{ fontSize:"0.6rem", fontWeight:800, color:PC.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:6 }}>📋 Photo Protocol</div>
                {["Patient 2–3m from camera","Full body head-to-toe in frame","Arms relaxed at sides","Natural standing position — no coaching","Plain background or wall","Good lighting — avoid strong shadows"].map((c,i)=>(
                  <div key={i} style={{ fontSize:"0.68rem", color:PC.muted, padding:"2px 0", borderBottom:`1px solid ${PC.border}`, display:"flex", gap:7, alignItems:"center" }}>
                    <span style={{ color:PC.green, fontWeight:700 }}>✓</span>{c}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Photo queue nav (batch mode) */}
              {photoQueue.length > 1 && (
                <div style={{ display:"flex", gap:5, marginBottom:8, overflowX:"auto", paddingBottom:4 }}>
                  {photoQueue.map((p,i)=>(
                    <button key={i} onClick={()=>{
                      setActivePhotoIdx(i);
                      setLandmarks(p.lm); setMeasurements(p.m);
                      setFindings(p.f); setReliability(p.r);
                      setScoreData(p.s); setUploadedImage(p.annotatedUrl);
                    }}
                    style={{ flexShrink:0, padding:"5px 10px", borderRadius:8, border:`1px solid ${activePhotoIdx===i?PC.accent:PC.border}`, background:activePhotoIdx===i?`${PC.accent}15`:"transparent", color:activePhotoIdx===i?PC.accent:PC.muted, fontSize:"0.65rem", fontWeight:700, cursor:"pointer" }}>
                      #{i+1} · {p.s?.score}pts
                    </button>
                  ))}
                </div>
              )}

              {/* ── BEFORE / AFTER COMPARE VIEW ─────────────────────────── */}
              {photoMode==="compare" && photoQueue.length >= 2 ? (
                <div>
                  <div style={{ fontSize:"0.62rem", fontWeight:800, color:PC.accent, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>⚖ Before / After Comparison</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                    {[photoQueue[0], photoQueue[1]].map((p,i)=>(
                      <div key={i}>
                        <div style={{ fontSize:"0.6rem", fontWeight:800, color:i===0?PC.yellow:PC.green, marginBottom:4, textTransform:"uppercase" }}>
                          {i===0?"Before":"After"}
                        </div>
                        <div style={{ position:"relative", borderRadius:10, overflow:"hidden", background:"#f5f0fb" }}>
                          <img src={p.annotatedUrl} style={{ width:"100%", display:"block", aspectRatio:"3/4", objectFit:"cover" }}/>
                          <div style={{ position:"absolute", bottom:4, left:4, padding:"2px 7px", borderRadius:6, background:"rgba(0,0,0,0.75)", fontSize:"0.62rem", fontWeight:800, color:i===0?PC.yellow:PC.green }}>
                            {p.s?.score} · {p.s?.band}
                          </div>
                        </div>
                        <div style={{ marginTop:5, padding:"6px 8px", background:PC.surface, borderRadius:8 }}>
                          <div style={{ fontSize:"0.62rem", color:PC.muted }}>Findings: {p.f?.length || 0} · Priority: {p.f?.filter(f=>f.severity==="high").length || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Score delta */}
                  {photoQueue[0]?.s && photoQueue[1]?.s && (() => {
                    const delta = photoQueue[1].s.score - photoQueue[0].s.score;
                    return (
                      <div style={{ padding:"10px 14px", background: delta>=0?"rgba(0,201,122,0.08)":"rgba(255,77,109,0.08)", border:`1px solid ${delta>=0?PC.green:PC.red}30`, borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:"1.5rem" }}>{delta>=0?"📈":"📉"}</span>
                        <div>
                          <div style={{ fontWeight:800, color:delta>=0?PC.green:PC.red, fontSize:"0.9rem" }}>
                            {delta>=0?"+":""}{delta} pts
                          </div>
                          <div style={{ fontSize:"0.68rem", color:PC.muted }}>Score change · {delta>=0?"Improvement":"Decline"}</div>
                        </div>
                        <div style={{ marginLeft:"auto", fontSize:"0.68rem", color:PC.muted, textAlign:"right" }}>
                          Findings: {photoQueue[0].f.length}→{photoQueue[1].f.length}<br/>
                          Priority: {photoQueue[0].f.filter(f=>f.severity==="high").length}→{photoQueue[1].f.filter(f=>f.severity==="high").length}
                        </div>
                      </div>
                    );
                  })()}
                  <button onClick={() => { setUploadedImage(null); setPhotoQueue([]); setLandmarks(null); setScoreData(null); setFindings([]); setMeasurements(null); setReliability(null); photoUrlsRef.current.forEach(u=>URL.revokeObjectURL(u)); photoUrlsRef.current=[]; }}
                    style={{ width:"100%", marginTop:9, padding:"9px", background:`${viewMeta.colour}15`, border:`1px solid ${viewMeta.colour}30`, borderRadius:10, color:viewMeta.colour, fontWeight:700, fontSize:"0.76rem", cursor:"pointer" }}>
                    🔄 New Comparison
                  </button>
                </div>
              ) : (
                <div>
                  {/* Single / batch annotated view */}
                  <div style={{ position:"relative", borderRadius:12, overflow:"hidden", background:"#f5f0fb" }}>
                    <img src={uploadedImage} alt="Analysed" style={{ width:"100%", display:"block", maxHeight:380, objectFit:"cover" }}/>
                    {analysing && (
                      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10 }}>
                        <div style={{ color:PC.accent, fontSize:"1.2rem", fontWeight:700 }}>⏳ Analysing…</div>
                        <div style={{ fontSize:"0.72rem", color:PC.muted }}>Running AI pose detection</div>
                      </div>
                    )}
                    {scoreData && !analysing && (
                      <div style={{ position:"absolute", top:8, right:8 }}>
                        <PostureScoreRing score={scoreData?.score} band={scoreData?.band} colour={scoreData?.colour} size={76}/>
                      </div>
                    )}
                    {calibration && (
                      <div style={{ position:"absolute", bottom:8, left:8, padding:"3px 8px", borderRadius:7, background:"rgba(0,0,0,0.75)", fontSize:"0.6rem", color:PC.green, fontWeight:700 }}>
                        📏 {calibration.pixPerCm.toFixed(1)}px/cm
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:7, marginTop:9 }}>
                    <button onClick={() => { setUploadedImage(null); setPhotoQueue([]); setLandmarks(null); setScoreData(null); setFindings([]); fileInputRef.current?.click(); }}
                      style={{ flex:1, padding:"10px", background:`${viewMeta.colour}15`, border:`1px solid ${viewMeta.colour}30`, borderRadius:10, color:viewMeta.colour, fontWeight:700, fontSize:"0.74rem", cursor:"pointer" }}>
                      📤 New Photo
                    </button>
                    {photoQueue.length < 2 && (
                      <button onClick={() => { setPhotoMode("compare"); fileInputRef.current?.click(); }}
                        style={{ flex:1, padding:"10px", background:"rgba(255,179,0,0.1)", border:"1px solid rgba(255,179,0,0.3)", borderRadius:10, color:PC.yellow, fontWeight:700, fontSize:"0.74rem", cursor:"pointer" }}>
                        ⚖ Add Comparison
                      </button>
                    )}
                    {hasData && (
                      <button onClick={() => {
                        const a = document.createElement("a");
                        a.href = uploadedImage; a.download = `posture_${activeView}_annotated_${Date.now()}.jpg`; a.click();
                      }}
                        style={{ flex:"0 0 44px", padding:"10px", background:PC.s2, border:`1px solid ${PC.border}`, borderRadius:10, color:PC.muted, fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>
                        ⬇
                      </button>
                    )}
                  </div>
                </div>
              )}
              {error && <div style={{ marginTop:8, padding:"8px 11px", background:"rgba(255,77,109,0.1)", border:`1px solid ${PC.red}30`, borderRadius:8, fontSize:"0.74rem", color:PC.red }}>{error}</div>}
            </div>
          )}
        </div>
      )}

      {/* ── TAB BAR ────────────────────────────────────────────────────── */}
      {hasData && (
        <div>
          <div style={{ display:"flex", borderTop:`1px solid ${PC.border}`, borderBottom:`1px solid ${PC.border}`, background:PC.surface }}>
            {[
              ["metrics","📐 Metrics"],
              ["findings",`🔍 Findings${findings.length>0?` (${findings.length})`:""}` ],
              ["bilateral","⚖ Bilateral"],
              ["recommendations","💊 Actions"],
            ].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex:1, padding:"10px 4px", border:"none", borderBottom:`2px solid ${tab===t?PC.accent:"transparent"}`, background:"transparent", color:tab===t?PC.accent:PC.muted, fontWeight:tab===t?800:500, fontSize:"0.62rem", cursor:"pointer", textAlign:"center", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding:"12px 14px" }}>

            {/* ── METRICS TAB ─────────────────────────────────────────────── */}
            {tab === "metrics" && measurements && (
              <div>
                {/* Score summary row */}
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14, padding:"12px 14px", background:PC.surface, borderRadius:12, border:`1px solid ${PC.border}` }}>
                  <PostureScoreRing score={scoreData?.score||0} band={scoreData?.band||"—"} colour={scoreData?.colour||PC.muted} size={72}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.68rem", color:PC.muted, marginBottom:4 }}>Posture Score — {POSTURE_VIEW_META[activeView].label} view</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      <span style={{ fontSize:"0.65rem", padding:"2px 8px", borderRadius:8, background:`${PC.accent}15`, color:PC.accent }}>Reliability: {reliability?.status}</span>
                      <span style={{ fontSize:"0.65rem", padding:"2px 8px", borderRadius:8, background:`${PC.red}15`, color:PC.red }}>Priority: {highFindings.length}</span>
                      <span style={{ fontSize:"0.65rem", padding:"2px 8px", borderRadius:8, background:`${PC.yellow}15`, color:PC.yellow }}>Total findings: {findings.length}</span>
                    </div>
                    {/* Trend sparkline */}
                    {recentSessions.length >= 2 && (
                      <div style={{ marginTop:7 }}>
                        <div style={{ fontSize:"0.6rem", color:PC.muted, marginBottom:3 }}>Score trend ({POSTURE_VIEW_META[activeView].short})</div>
                        <PostureSparkline sessions={sessions} view={activeView} metric="score" colour={scoreData?.colour||PC.accent}/>
                      </div>
                    )}
                  </div>
                </div>

                {/* Frontal plane */}
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:PC.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>Frontal Plane</div>
                <MetricRow label="Shoulder Angle"       value={measurements.shoulderAngle}    unit="°"  thresholds={[3,7]}  hint="+ = left elevated. Normal: ±2°"/>
                <MetricRow label="Pelvic Tilt (Frontal)" value={measurements.pelvisAngle}      unit="°"  thresholds={[3,7]}  hint="+ = left ASIS elevated"/>
                <MetricRow label="Head Lateral Offset"  value={measurements.headLateralOffset} unit="%" thresholds={[2,5]}  hint="Head vs shoulder midpoint"/>
                <MetricRow label="Trunk Lateral Shift"  value={measurements.trunkLateralShift} unit="%" thresholds={[3,7]}  hint="Shoulder vs hip midpoint"/>
                <MetricRow label="Spinal Deviation"     value={measurements.spinalDeviation}   unit="%" thresholds={[4,8]}  hint="Head vs pelvic centroid"/>
                <MetricRow label="Weight Bearing Shift" value={measurements.weightBearingShift} unit="%" thresholds={[4,8]} hint="Hip vs foot base offset"/>
                <MetricRow label="CoG Deviation"        value={measurements.cogDeviation}      unit="%" thresholds={[4,8]}  hint="Combined centre of gravity offset"/>

                {/* Sagittal plane */}
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:PC.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7, marginTop:14 }}>Sagittal Plane</div>
                <MetricRow label="Forward Head Posture"  value={measurements.forwardHeadMm} unit={measurements.forwardHeadCm!==null?"cm":"%"} thresholds={[3,7]} hint={measurements.forwardHeadCm!==null?"True cm from acromion (calibrated)":"Ear anterior to acromion (normalised — enter height for cm)"}/>
                {measurements.cvaAngle!==null && <MetricRow label="Craniovertebral Angle (CVA)" value={measurements.cvaAngle} unit="°" thresholds={[49,55]} invert={true} hint="<49° = pathological FHP. Normal >55°. Gold standard for FHP severity."/>}
                {measurements.lordosisZ!==null && <MetricRow label="Lordosis Z-Index (3D)" value={measurements.lordosisZ} unit="%" thresholds={[3,8]} hint="Hip-to-knee Z depth ratio — indicates anterior pelvic tilt in depth."/>}
                <MetricRow label="L. Knee Deviation"     value={measurements.leftKneeDev}        unit="°" thresholds={[5,12]} hint="Negative = hyperextension"/>
                <MetricRow label="R. Knee Deviation"     value={measurements.rightKneeDev}       unit="°" thresholds={[5,12]} hint="Negative = hyperextension"/>

                {/* Composite */}
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:PC.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7, marginTop:14 }}>Composite Indices</div>
                <MetricRow label="Scoliosis Cobb Estimate" value={measurements.cobbEstimate}   unit="°" thresholds={[5,10]} hint="Estimated from shoulder/pelvis obliquity. Confirm with X-ray if >10°."/>
                <MetricRow label="Postural Load Index"     value={measurements.posturalLoadIndex} unit="/100" thresholds={[20,45]} hint="Lower = better. Composite deviation burden."/>

                {/* Reliability */}
                <div style={{ marginTop:12, padding:"9px 12px", background:PC.surface, border:`1px solid ${PC.border}`, borderRadius:10 }}>
                  <div style={{ fontSize:"0.62rem", fontWeight:700, color:PC.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>Landmark Confidence</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:5 }}>
                    {Object.values(reliability?.confidence||{}).map((c,i) => {
                      const col = c.value > 70 ? PC.green : c.value > 40 ? PC.yellow : PC.red;
                      return (
                        <div key={i} style={{ padding:"5px 8px", background:`${col}0a`, border:`1px solid ${col}20`, borderRadius:7 }}>
                          <div style={{ fontSize:"0.62rem", color:PC.muted }}>{c.name}</div>
                          <div style={{ fontSize:"0.8rem", fontWeight:800, color:col }}>{c.value}%</div>
                          <div style={{ height:2, background:PC.s2, borderRadius:1, marginTop:3, overflow:"hidden" }}>
                            <div style={{ width:`${c.value}%`, height:"100%", background:col, borderRadius:1 }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── FINDINGS TAB ──────────────────────────────────────────── */}
            {tab === "findings" && (
              <div>
                {/* Quality gate banner — shown when reliability engine blocked analysis */}
                {reliability?.blocked && (
                  <div style={{ padding:"16px", marginBottom:12, background:"rgba(255,77,109,0.08)", border:`1px solid rgba(255,77,109,0.35)`, borderRadius:12 }}>
                    <div style={{ fontSize:"1.2rem", marginBottom:6 }}>🚫</div>
                    <div style={{ fontWeight:800, color:PC.red, fontSize:"0.82rem", marginBottom:5 }}>Image Quality Insufficient — Analysis Blocked</div>
                    <div style={{ fontSize:"0.72rem", color:"rgba(255,77,109,0.8)", lineHeight:1.6 }}>
                      {reliability.warnings.map((w,i) => <div key={i}>{w.icon} {w.text}</div>)}
                    </div>
                    <div style={{ marginTop:10, fontSize:"0.68rem", color:PC.muted, fontStyle:"italic", lineHeight:1.6 }}>
                      To get reliable results: stand 1.5–2m from camera, use good lighting, wear form-fitting clothing, and ensure your full body (head to feet) is visible.
                    </div>
                  </div>
                )}
                {!reliability?.blocked && findings.length === 0 ? (
                  <div style={{ padding:"20px", textAlign:"center", background:"rgba(0,201,122,0.07)", border:`1px solid ${PC.green}30`, borderRadius:12 }}>
                    <div style={{ fontSize:"1.5rem", marginBottom:8 }}>✅</div>
                    <div style={{ fontWeight:700, color:PC.green, fontSize:"0.85rem" }}>No significant deviations detected</div>
                    <div style={{ fontSize:"0.72rem", color:PC.muted, marginTop:4 }}>Posture within normal parameters for this view.</div>
                    <div style={{ fontSize:"0.65rem", color:PC.muted, marginTop:6 }}>Reliability: {reliability?.status} ({reliability?.score}%) · ICC: {reliability?.icc}</div>
                  </div>
                ) : !reliability?.blocked ? (
                  <div>
                    {highFindings.length > 0 && (
                      <div style={{ marginBottom:10 }}>
                        <div style={{ fontSize:"0.62rem", fontWeight:700, color:PC.red, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>🔴 Priority ({highFindings.length})</div>
                        {highFindings.map((f, i) => <FindingCard key={i} f={f} defaultOpen={i===0}/>)}
                      </div>
                    )}
                    {otherFindings.length > 0 && (
                      <div>
                        <div style={{ fontSize:"0.62rem", fontWeight:700, color:PC.yellow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>🟡 Notable ({otherFindings.length})</div>
                        {otherFindings.map((f, i) => <FindingCard key={i} f={f}/>)}
                      </div>
                    )}
                  </div>
                ) : null}
                <div style={{ marginTop:12, padding:"8px 11px", background:PC.s2, borderRadius:8, fontSize:"0.65rem", color:PC.muted, lineHeight:1.6 }}>
                  ⚠ Observational screening analysis only. Not a clinical diagnosis. All findings require clinical correlation and physical examination.
                </div>
              </div>
            )}

            {/* ── BILATERAL TAB ─────────────────────────────────────────── */}
            {tab === "bilateral" && measurements && (
              <div>
                <div style={{ fontSize:"0.62rem", fontWeight:700, color:PC.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>⚖ Bilateral Symmetry Analysis</div>
                {[
                  ["Shoulders", measurements.shoulderSymmetry],
                  ["Hips", measurements.hipSymmetry],
                  ["Knees", measurements.kneeSymmetry],
                  ["Ankles", measurements.ankleSymmetry],
                ].map(([label, sym]) => {
                  if (!sym) return null;
                  const diff = Math.abs(sym.diff||0);
                  const col = diff < 2 ? PC.green : diff < 5 ? PC.yellow : PC.red;
                  const leftPct = clamp(50 + ((sym.diff||0)*5), 10, 90);
                  return (
                    <div key={label} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:"0.78rem", fontWeight:700, color:col }}>{label}</span>
                        <span style={{ fontSize:"0.7rem", color:PC.muted }}>
                          Δ {sym.diff > 0 ? "+" : ""}{sym.diff}% · {diff < 2 ? "Symmetric" : diff < 5 ? "Mild asymmetry" : "Significant asymmetry"}
                        </span>
                      </div>
                      <div style={{ display:"flex", height:10, borderRadius:5, overflow:"hidden", background:PC.s2 }}>
                        <div style={{ width:`${leftPct}%`, background:sym.diff > 0 ? col : PC.border, borderRadius:"5px 0 0 5px", transition:"width 0.4s" }}/>
                        <div style={{ width:2, background:PC.accent, flexShrink:0 }}/>
                        <div style={{ flex:1, background:sym.diff < 0 ? col : PC.border, borderRadius:"0 5px 5px 0" }}/>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                        <span style={{ fontSize:"0.58rem", color:PC.muted }}>LEFT</span>
                        <span style={{ fontSize:"0.58rem", color:PC.muted }}>RIGHT</span>
                      </div>
                    </div>
                  );
                })}
                {/* Weight bearing */}
                {measurements.weightBearingShift !== null && (
                  <div style={{ marginTop:8, padding:"9px 12px", background:`${Math.abs(measurements.weightBearingShift||0)>4?PC.yellow:PC.green}10`, border:`1px solid ${Math.abs(measurements.weightBearingShift||0)>4?PC.yellow:PC.green}30`, borderRadius:9, fontSize:"0.74rem" }}>
                    Weight-bearing tendency: <strong style={{ color:Math.abs(measurements.weightBearingShift||0)>4?PC.yellow:PC.green }}>
                      {measurements.weightBearingShift > 0 ? "Right" : "Left"} {Math.abs(measurements.weightBearingShift).toFixed(1)}% shift
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* ── RECOMMENDATIONS TAB ───────────────────────────────────── */}
            {tab === "recommendations" && (
              <div>
                {findings.length === 0 ? (
                  <div style={{ padding:"16px", textAlign:"center", color:PC.muted, fontSize:"0.8rem" }}>No specific actions — posture within normal range.</div>
                ) : (
                  <div>
                    <div style={{ padding:"9px 12px", background:`${PC.accent}08`, border:`1px solid ${PC.accent}20`, borderRadius:9, fontSize:"0.72rem", color:PC.muted, marginBottom:12, lineHeight:1.6 }}>
                      <strong style={{ color:PC.accent }}>Clinical Action Plan</strong> — prioritise high-severity findings first. Reassess after 4–6 sessions.
                    </div>
                    {findings.map((f, i) => (
                      <div key={i} style={{ marginBottom:10, padding:"11px 13px", background:PC.surface, border:`1px solid ${f.severity==="high"?PC.red:PC.yellow}30`, borderRadius:11 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                          <span style={{ fontSize:"0.85rem" }}>{f.icon}</span>
                          <span style={{ fontWeight:700, fontSize:"0.78rem", color:f.severity==="high"?PC.red:PC.yellow }}>{f.text}</span>
                          <span style={{ marginLeft:"auto", fontSize:"0.58rem", padding:"1px 7px", borderRadius:6, background:`${f.severity==="high"?PC.red:PC.yellow}20`, color:f.severity==="high"?PC.red:PC.yellow, fontWeight:700 }}>{f.severity.toUpperCase()}</span>
                        </div>
                        <div style={{ padding:"8px 11px", background:`${f.severity==="high"?PC.red:PC.yellow}08`, borderRadius:8, fontSize:"0.73rem", color:PC.text, lineHeight:1.65 }}>
                          {f.correction}
                        </div>
                        <div style={{ marginTop:5, fontSize:"0.62rem", color:PC.muted }}>ICD-10: {f.icd} · {f.region}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Captured image export */}
                {(capturedImage || uploadedImage) && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:"0.62rem", fontWeight:700, color:PC.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:7 }}>Export</div>
                    <div style={{ borderRadius:10, overflow:"hidden", marginBottom:8 }}>
                      <img src={capturedImage||uploadedImage} alt="Capture" style={{ width:"100%", display:"block", borderRadius:10 }}/>
                    </div>
                    <button onClick={downloadCapture}
                      style={{ width:"100%", padding:"11px", background:`linear-gradient(135deg,${PC.a2},${PC.accent})`, border:"none", borderRadius:10, color:"#1a1025", fontWeight:800, fontSize:"0.8rem", cursor:"pointer" }}>
                      ⬇ Download Annotated Image
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Overlay controls */}
          <div style={{ padding:"8px 14px", display:"flex", gap:7, flexWrap:"wrap", borderTop:`1px solid ${PC.border}`, background:PC.surface }}>
            <span style={{ fontSize:"0.6rem", fontWeight:700, color:PC.muted, alignSelf:"center", marginRight:4 }}>Overlay:</span>
            {[["showHeatmap","🌡 Heat",showHeatmap,setShowHeatmap],["showLabels","🏷 Labels",showLabels,setShowLabels],["showGrid","⊞ Grid",showGrid,setShowGrid]].map(([k,label,val,setter]) => (
              <button key={k} onClick={() => setter(v => !v)}
                style={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${val?PC.accent:PC.border}`, background:val?`${PC.accent}15`:"transparent", color:val?PC.accent:PC.muted, fontSize:"0.65rem", fontWeight:600, cursor:"pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── HISTORY MODAL ─────────────────────────────────────────────── */}
      {showHistory && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:PC.surface, border:`1px solid ${PC.border}`, borderRadius:18, width:"100%", maxWidth:500, maxHeight:"88vh", overflowY:"auto", padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:800, color:PC.accent, fontSize:"0.95rem" }}>📁 Session History</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={clearHistory} style={{ padding:"4px 10px", background:"rgba(255,77,109,0.1)", border:`1px solid ${PC.red}30`, borderRadius:7, color:PC.red, fontSize:"0.7rem", cursor:"pointer" }}>Clear All</button>
                <button onClick={() => setShowHistory(false)} style={{ padding:"4px 10px", background:PC.s2, border:`1px solid ${PC.border}`, borderRadius:7, color:PC.muted, fontSize:"0.7rem", cursor:"pointer" }}>Close</button>
              </div>
            </div>
            {sessions.length === 0 ? (
              <div style={{ textAlign:"center", color:PC.muted, padding:30, fontSize:"0.8rem" }}>No sessions recorded yet</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[...sessions].reverse().map((s, i) => {
                  const col = (s.score||0) >= 78 ? PC.green : (s.score||0) >= 62 ? PC.yellow : PC.red;
                  return (
                    <div key={i} style={{ background:PC.s2, border:`1px solid ${PC.border}`, borderRadius:12, padding:"11px 13px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
                        <div>
                          <div style={{ fontWeight:700, color:PC.text, fontSize:"0.8rem" }}>{(s.view||"").toUpperCase()} · {s.band||"—"}</div>
                          <div style={{ fontSize:"0.62rem", color:PC.muted, marginTop:2 }}>{new Date(s.capturedAt).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:"1.3rem", fontWeight:900, color:col, lineHeight:1 }}>{s.score}</div>
                          <div style={{ fontSize:"0.58rem", color:PC.muted }}>/ 100</div>
                        </div>
                      </div>
                      {s.img && <img src={s.img} alt="Session" style={{ width:"100%", borderRadius:8, marginBottom:7 }}/>}
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:6, background:`${PC.red}15`, color:PC.red }}>Priority: {s.highCount||0}</span>
                        <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:6, background:`${PC.yellow}15`, color:PC.yellow }}>Findings: {s.findingsCount||0}</span>
                        {(s.score||0) > 0 && i < sessions.length-1 && sessions[sessions.length-1-i-1]?.view === s.view && (
                          <span style={{ fontSize:"0.6rem", padding:"2px 7px", borderRadius:6, background:`${PC.a2}15`, color:PC.a2 }}>
                            {(s.score - sessions[sessions.length-1-i-1].score) >= 0 ? "↑" : "↓"} vs prev
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── View meta for photo upload (renamed to avoid conflicts) ──────────────────
const PHOTO_VIEW_META_NEW = {
  anterior:  { label:"Anterior",     short:"Front",  colour:"#00e5ff", icon:"⬆", helper:"Patient faces camera, feet hip-width, arms relaxed." },
  posterior: { label:"Posterior",    short:"Back",   colour:"#7f5af0", icon:"⬇", helper:"Patient faces away. Scapulae and heels visible." },
  left:      { label:"Left Lateral", short:"L.Side", colour:"#ffb300", icon:"◀", helper:"Left side toward camera. Ear–shoulder–hip–ankle in frame." },
  right:     { label:"Right Lateral",short:"R.Side", colour:"#00c97a", icon:"▶", helper:"Right side toward camera. Ear–shoulder–hip–ankle in frame." },
};

// ─── ScoreRingNew ─────────────────────────────────────────────────────────────
function ScoreRingNew({ score, band, colour, size=80 }) {
  if (score === null || score === undefined || !colour) return null;
  const r=(size/2)-7,circ=2*Math.PI*r,dash=(score/100)*circ;
  return(
    <svg width={size} height={size} style={{display:"block"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2d45" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colour} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dasharray 0.6s ease"}}/>
      <text x={size/2} y={size/2-4} textAnchor="middle" fill={colour} fontSize="16" fontWeight="800" fontFamily="system-ui">{score}</text>
      <text x={size/2} y={size/2+11} textAnchor="middle" fill="#6b8399" fontSize="7" fontFamily="system-ui">{band?.toUpperCase()}</text>
    </svg>
  );
}

// ─── FindingCardNew ───────────────────────────────────────────────────────────
function FindingCardNew({ f, defaultOpen=false }) {
  const [open,setOpen]=useState(defaultOpen);
  const col = f.severity==="high" ? "#ff4d6d" : f.severity==="moderate" ? "#ffb300" : "#00e5ff";
  const badge = f.severity==="high" ? "Priority" : f.severity==="moderate" ? "Notable" : "Monitor";

  // Severity bar: value relative to norm thresholds
  const hasValue = f.value !== null && f.value !== undefined;

  return(
    <div style={{background:`${col}09`,border:`1px solid ${col}30`,borderRadius:10,marginBottom:6,overflow:"hidden"}}>
      {/* Header row */}
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"9px 11px",cursor:"pointer"}}>
        <span style={{fontSize:"0.85rem",marginTop:1}}>{f.icon||"●"}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,color:col,fontSize:"0.75rem",lineHeight:1.4,marginBottom:2}}>{f.text}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:"0.6rem",color:"#7e6a9a"}}>{f.region}</span>
            <span style={{fontSize:"0.58rem",padding:"1px 6px",borderRadius:4,background:"rgba(126,106,154,0.1)",color:"#7e6a9a",fontFamily:"monospace"}}>{f.icd}</span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
          <span style={{fontSize:"0.58rem",padding:"2px 7px",borderRadius:5,background:`${col}20`,color:col,fontWeight:700,textTransform:"uppercase"}}>{badge}</span>
          <span style={{color:"#7e6a9a",fontSize:"0.7rem"}}>{open?"▲":"▼"}</span>
        </div>
      </div>

      {open&&(
        <div style={{padding:"0 11px 11px"}}>
          {/* Norm reference bar */}
          {(f.norm||hasValue)&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"rgba(126,106,154,0.06)",borderRadius:6,marginBottom:7}}>
              {f.norm&&<span style={{fontSize:"0.6rem",color:"#7e6a9a"}}>{f.norm}</span>}
              {hasValue&&<span style={{fontSize:"0.7rem",fontWeight:800,color:col}}>{f.value.toFixed(1)}{f.norm?.includes("°")?"°":f.norm?.includes("%")?"%":""}</span>}
            </div>
          )}
          {/* Detail / rationale */}
          {f.detail&&(
            <div style={{fontSize:"0.64rem",color:"#7e6a9a",fontStyle:"italic",marginBottom:7,lineHeight:1.55,padding:"5px 8px",background:"rgba(126,106,154,0.05)",borderRadius:6}}>
              💡 {f.detail}
            </div>
          )}
          {/* Clinical action */}
          <div style={{padding:"8px 10px",background:`${col}08`,border:`1px solid ${col}22`,borderRadius:8,fontSize:"0.7rem",color:"#1a1025",lineHeight:1.7}}>
            <div style={{fontWeight:700,color:col,marginBottom:4,fontSize:"0.65rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>Clinical Action</div>
            {f.correction}
          </div>
        </div>
      )}
    </div>
  );
}

function PostureLiveAnalysis({ landmarks, canvasRef, videoSize }) {
  const [view, setView]         = useState("anterior");
  const [tab, setTab]           = useState("findings");
  const [showHeatmap, setHeat]  = useState(true);
  const [showLabels, setLbls]   = useState(false);

  const m  = useMemo(() => landmarks ? AdvancedMeasurementEngine(landmarks) : null, [landmarks]);
  const f  = useMemo(() => landmarks && m ? ClinicalFindingsEngine(landmarks, view, m) : [], [landmarks, view, m]);
  const r  = useMemo(() => landmarks ? ReliabilityEngine(landmarks) : null, [landmarks]);
  const s  = useMemo(() => m && f && r ? PostureScoreEngine(m, f, r) : null, [m, f, r]);
  const { sessions, saveSession, clearHistory } = usePostureHistory();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks || !videoSize || !m) return;
    const { w, h } = videoSize;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    renderPostureOverlay({ ctx, W:w, H:h, lm:landmarks, measurements:m, showHeatmap, showLabels, showGrid:true, view });
  }, [landmarks, videoSize, view, showHeatmap, showLabels, m, canvasRef]);

  if (!landmarks || !m) return null;
  const highF = f.filter(x => x.severity === "high");
  const C2 = { surface:"#ffffff", s2:"#f5f0fb", border:"#d8cce8", accent:"#7c3aed", a2:"#9333ea", text:"#1a1025", muted:"#7e6a9a", red:"#dc2626", yellow:"#b45309", green:"#059669" };

  return (
    <div style={{ background:C2.surface, border:"1px solid #d8cce8", borderRadius:14, overflow:"hidden", marginTop:10 }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid #d8cce8", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:7 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {s && <ScoreRingNew score={s.score} band={s.band} colour={s.colour} size={58}/>}
          <div>
            <div style={{ fontWeight:800, color:C2.accent, fontSize:"0.83rem" }}>📐 Live Analysis</div>
            <div style={{ fontSize:"0.6rem", color:C2.muted, marginTop:1 }}>
              {highF.length > 0 ? `🔴 ${highF.length} priority · ` : ""}Findings: {f.length} · {r?.status}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:5 }}>
          {[["🌡",showHeatmap,setHeat],["🏷",showLabels,setLbls]].map(([lbl,val,setter],i)=>(
            <button key={i} onClick={()=>setter(v=>!v)} style={{ padding:"3px 8px", borderRadius:6, border:`1px solid ${val?C2.accent:C2.border}`, background:val?"rgba(0,229,255,0.1)":"transparent", color:val?C2.accent:C2.muted, fontSize:"0.7rem", cursor:"pointer" }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* View selector */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4, padding:"8px 10px", background:C2.s2, borderBottom:"1px solid #d8cce8" }}>
        {Object.entries(PHOTO_VIEW_META_NEW).map(([key,meta])=>{
          const act=view===key;
          return <button key={key} onClick={()=>setView(key)} style={{ padding:"5px 2px", borderRadius:7, border:`1px solid ${act?meta.colour:C2.border}`, background:act?`${meta.colour}18`:"transparent", cursor:"pointer", textAlign:"center" }}>
            <div style={{ fontSize:"0.75rem" }}>{meta.icon}</div>
            <div style={{ fontSize:"0.56rem", fontWeight:800, color:act?meta.colour:C2.muted }}>{meta.short}</div>
          </button>;
        })}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid #d8cce8" }}>
        {[["findings",`🔍 Findings (${f.length})`],["metrics","📐 Metrics"],["bilateral","⚖ Balance"],["actions","💊 Actions"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"8px 2px", border:"none", borderBottom:`2px solid ${tab===t?C2.accent:"transparent"}`, background:"transparent", color:tab===t?C2.accent:C2.muted, fontWeight:tab===t?800:500, fontSize:"0.58rem", cursor:"pointer", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lbl}</button>
        ))}
      </div>

      <div style={{ padding:"10px 12px" }}>
        {tab==="findings" && (
          f.length===0
            ? <div style={{ padding:"12px", textAlign:"center", background:"rgba(0,201,122,0.07)", border:`1px solid ${C2.green}30`, borderRadius:9 }}><div style={{ fontWeight:700, color:C2.green, fontSize:"0.78rem" }}>✅ No significant deviations</div></div>
            : <div>{f.map((fi,i)=><FindingCardNew key={i} f={fi} defaultOpen={i===0&&fi.severity==="high"}/>)}</div>
        )}
        {tab==="metrics" && (
          <div>
            {[
              ["Shoulder",m.shoulderAngle,"°",[3,7]],["Pelvis",m.pelvisAngle,"°",[3,7]],
              ["Head Lat.",m.headLateralOffset,"%",[2,5]],["Trunk Shift",m.trunkLateralShift,"%",[3,7]],
              ["Forward Head",m.forwardHeadMm,"%",[3,7]],["Cobb Est.",m.cobbEstimate,"°",[5,10]],
            ].map(([label,val,unit,t],i)=>{
              if(val===null||val===undefined) return null;
              const abs=Math.abs(val),col=abs<t[0]?"#00c97a":abs<t[1]?"#ffb300":"#ff4d6d";
              return(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 10px", background:`${col}09`, border:`1px solid ${col}22`, borderRadius:7, marginBottom:4 }}>
                  <span style={{ fontSize:"0.68rem", color:C2.muted }}>{label}</span>
                  <span style={{ fontSize:"0.82rem", fontWeight:800, color:col }}>{val>0?"+":""}{Math.round(val*10)/10}{unit}</span>
                </div>
              );
            })}
          </div>
        )}
        {tab==="bilateral" && (
          <div>
            {[["Shoulders",m.shoulderSymmetry],["Hips",m.hipSymmetry],["Knees",m.kneeSymmetry],["Ankles",m.ankleSymmetry]].map(([label,sym])=>{
              if(!sym) return null;
              const diff=Math.abs(sym.diff||0),col=diff<2?"#00c97a":diff<5?"#ffb300":"#ff4d6d";
              const lPct=Math.max(10,Math.min(90,50+((sym.diff||0)*5)));
              return(
                <div key={label} style={{ marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:"0.72rem", fontWeight:700, color:col }}>{label}</span>
                    <span style={{ fontSize:"0.62rem", color:C2.muted }}>Δ{sym.diff>0?"+":""}{sym.diff}%</span>
                  </div>
                  <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", background:C2.s2 }}>
                    <div style={{ width:`${lPct}%`, background:sym.diff>0?col:"#1a2d45", borderRadius:"4px 0 0 4px" }}/>
                    <div style={{ width:2, background:C2.accent, flexShrink:0 }}/>
                    <div style={{ flex:1, background:sym.diff<0?col:"#1a2d45", borderRadius:"0 4px 4px 0" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                    <span style={{ fontSize:"0.52rem", color:C2.muted }}>L</span><span style={{ fontSize:"0.52rem", color:C2.muted }}>R</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab==="actions" && (
          f.length===0
            ? <div style={{ textAlign:"center", color:C2.muted, fontSize:"0.72rem", padding:14 }}>No specific actions needed</div>
            : f.map((fi,i)=>(
              <div key={i} style={{ marginBottom:8, padding:"9px 11px", background:C2.s2, border:`1px solid ${fi.severity==="high"?C2.red:C2.yellow}28`, borderRadius:9 }}>
                <div style={{ fontWeight:700, fontSize:"0.72rem", color:fi.severity==="high"?C2.red:C2.yellow, marginBottom:4 }}>{fi.icon} {fi.text}</div>
                <div style={{ fontSize:"0.68rem", color:C2.text, lineHeight:1.6, padding:"6px 9px", background:`${fi.severity==="high"?C2.red:C2.yellow}08`, borderRadius:7 }}>{fi.correction}</div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

// ─── PhotoUploadAnalyzer — uses new advanced engine ──────────────────────────
function PhotoUploadAnalyzer() {
  const [image, setImage]         = useState(null);
  const [analysisResult, setResult] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [mpReady, setMpReady]     = useState(false);
  const [selectedView, setView]   = useState("anterior");
  const [tab, setTab]             = useState("upload");
  const [showHeatmap, setHeatmap] = useState(true);
  const [showLabels, setLabels]   = useState(true);
  const canvasRef  = useRef(null);
  const imgRef     = useRef(null);
  const poseRef    = useRef(null);
  const fileRef    = useRef(null);
  const urlRef     = useRef(null);
  const viewRef    = useRef(selectedView);
  const { sessions, saveSession, clearHistory } = usePostureHistory();
  const [showHistory, setShowHistory] = useState(false);
  useEffect(()=>{ viewRef.current = selectedView; },[selectedView]);
  useEffect(()=>()=>{ if(urlRef.current) URL.revokeObjectURL(urlRef.current); },[]);

  useEffect(()=>{
    (async()=>{
      try{
        const loadScript = src => new Promise((res,rej)=>{
          if(document.querySelector(`script[src="${src}"]`)){res();return;}
          const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);
        });
        const CDN="https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404";
        await loadScript(`${CDN}/pose.js`);
        const pose=new window.Pose({locateFile:f=>`${CDN}/${f}`});
        pose.setOptions({modelComplexity:2,smoothLandmarks:true,enableSegmentation:false,minDetectionConfidence:0.6,minTrackingConfidence:0.6});
        pose.onResults(results=>{
          setLoading(false);
          if(results.poseLandmarks?.length>0){
            setError(null);
            const lm=results.poseLandmarks;
            const m=AdvancedMeasurementEngine(lm);
            const f=ClinicalFindingsEngine(lm,viewRef.current,m);
            const r=ReliabilityEngine(lm);
            const s=PostureScoreEngine(m,f,r);
            const report={lm,measurements:m,findings:f,reliability:r,scoreData:s,view:viewRef.current,capturedAt:new Date().toISOString()};
            setResult(report);
            saveSession({view:viewRef.current,score:s.score,band:s.band,findingsCount:f.length,highCount:f.filter(x=>x.severity==="high").length,capturedAt:new Date().toISOString()});
            // Draw overlay
            const canvas=canvasRef.current,img=imgRef.current;
            if(canvas&&img){
              const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
              canvas.width=w;canvas.height=h;
              const ctx=canvas.getContext("2d");
              renderPostureOverlay({ctx,W:w,H:h,lm,measurements:m,showHeatmap:true,showLabels:true,showGrid:true,view:viewRef.current});
            }
            setTab("results");
          } else {
            setError("No body landmarks detected. Ensure full body is visible in photo.");
          }
        });
        await pose.initialize();
        poseRef.current=pose; setMpReady(true);
      }catch(e){setError("Could not load AI. Check internet connection."); setLoading(false);}
    })();
  },[]);

  // Re-render overlay when view/settings change
  useEffect(()=>{
    if(!analysisResult) return;
    const canvas=canvasRef.current,img=imgRef.current;
    if(!canvas||!img) return;
    const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext("2d");
    renderPostureOverlay({ctx,W:w,H:h,lm:analysisResult.lm,measurements:analysisResult.measurements,showHeatmap,showLabels,showGrid:true,view:selectedView});
  },[selectedView,showHeatmap,showLabels,analysisResult]);

  const handleFile = async e => {
    const file=e.target.files?.[0]; if(!file) return;
    setError(null);setResult(null);setTab("upload");
    if(urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url=URL.createObjectURL(file); urlRef.current=url; setImage(url);
    const img=new Image();
    img.onload=async()=>{
      if(!poseRef.current){setError("AI not ready. Wait and retry.");return;}
      setLoading(true);
      try{ await poseRef.current.send({image:img}); }
      catch{ setLoading(false); setError("Analysis failed. Ensure body is fully visible."); }
    };
    img.onerror=()=>setError("Could not load image.");
    img.src=url;
  };

  const C2={surface:"#ffffff",s2:"#f5f0fb",border:"#d8cce8",accent:"#7c3aed",a2:"#9333ea",a3:"#059669",text:"#1a1025",muted:"#7e6a9a",red:"#dc2626",yellow:"#b45309",green:"#059669"};
  const vm=PHOTO_VIEW_META_NEW[selectedView]||PHOTO_VIEW_META_NEW.anterior;
  const { measurements, findings, reliability, scoreData } = analysisResult||{};
  const highF=(findings||[]).filter(f=>f.severity==="high");
  const otherF=(findings||[]).filter(f=>f.severity!=="high");

  return(
    <div style={{background:C2.surface,border:`1px solid ${C2.border}`,borderRadius:14,overflow:"hidden",marginBottom:12}}>
      {/* Header */}
      <div style={{padding:"11px 14px",borderBottom:`1px solid ${C2.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
        <div>
          <div style={{fontWeight:800,fontSize:"0.9rem",color:C2.accent}}>📷 Photo Upload Analysis</div>
          <div style={{fontSize:"0.65rem",color:C2.muted,marginTop:2}}>{mpReady?"✅ AI Ready — Advanced Biomechanical Engine":"⏳ Loading AI engine…"}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setShowHistory(true)} style={{padding:"4px 10px",background:`${C2.a2}15`,border:`1px solid ${C2.a2}30`,borderRadius:7,color:C2.a2,fontSize:"0.65rem",fontWeight:700,cursor:"pointer"}}>📁 History</button>
          {["upload","results"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${tab===t?C2.accent:C2.border}`,background:tab===t?"rgba(0,229,255,0.1)":"transparent",color:tab===t?C2.accent:C2.muted,fontSize:"0.65rem",fontWeight:700,cursor:"pointer"}}>
              {t==="upload"?"📤 Upload":"📊 Results"}
            </button>
          ))}
        </div>
      </div>

      {/* View selector */}
      <div style={{padding:"10px 14px",background:C2.s2,borderBottom:`1px solid ${C2.border}`}}>
        <div style={{fontSize:"0.58rem",fontWeight:700,color:C2.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>
          📐 Select View — choose <em>before</em> uploading
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
          {Object.entries(PHOTO_VIEW_META_NEW).map(([key,meta])=>{
            const act=selectedView===key;
            return(
              <button key={key} onClick={()=>setView(key)} style={{padding:"8px 4px",borderRadius:9,border:`1px solid ${act?meta.colour:C2.border}`,background:act?`${meta.colour}18`:"transparent",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:"0.85rem"}}>{meta.icon}</div>
                <div style={{fontSize:"0.6rem",fontWeight:800,color:act?meta.colour:C2.muted}}>{meta.short}</div>
              </button>
            );
          })}
        </div>
        <div style={{fontSize:"0.68rem",color:C2.muted,lineHeight:1.6,padding:"6px 10px",background:`${vm.colour}08`,border:`1px solid ${vm.colour}20`,borderRadius:8}}>
          <span style={{color:vm.colour,fontWeight:700}}>{vm.short}: </span>{vm.helper}
        </div>
        <div style={{marginTop:6,padding:"5px 9px",background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:8,fontSize:"0.62rem",color:C2.muted,fontStyle:"italic"}}>
          🔲 Posture grid lines will be drawn on the photo for the selected view — select view first, then upload
        </div>
      </div>

      {/* Upload tab */}
      {tab==="upload"&&(
        <div style={{padding:"14px"}}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
          {!image?(
            <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${vm.colour}40`,borderRadius:14,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:`${vm.colour}05`}}>
              <div style={{fontSize:"2.5rem",marginBottom:10}}>📸</div>
              <div style={{fontWeight:800,color:vm.colour,fontSize:"0.88rem",marginBottom:6}}>Select Patient Photo</div>
              <div style={{fontSize:"0.72rem",color:C2.muted,lineHeight:1.6}}>Tap to upload from gallery.<br/>Full body visible for best results.</div>
            </div>
          ):(
            <div>
              <div style={{position:"relative",borderRadius:12,overflow:"hidden",background:"#f5f0fb",marginBottom:9}}>
                <img ref={imgRef} src={image} alt="Upload" style={{width:"100%",display:"block",maxHeight:360,objectFit:"contain"}}/>
                <canvas ref={canvasRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}/>
                {loading&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}><div style={{color:C2.accent,fontSize:"1.1rem",fontWeight:700}}>⏳ Analysing…</div><div style={{fontSize:"0.7rem",color:C2.muted}}>Running AI pose detection</div></div>}
                {scoreData&&!loading&&<div style={{position:"absolute",top:8,right:8}}><ScoreRingNew score={scoreData?.score} band={scoreData?.band} colour={scoreData?.colour} size={72}/></div>}
              </div>
              {/* Overlay controls */}
              <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
                {[["showHeatmap","🌡 Heat",showHeatmap,setHeatmap],["showLabels","🏷 Labels",showLabels,setLabels]].map(([k,lbl,val,setter])=>(
                  <button key={k} onClick={()=>setter(v=>!v)} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${val?C2.accent:C2.border}`,background:val?"rgba(0,229,255,0.1)":"transparent",color:val?C2.accent:C2.muted,fontSize:"0.65rem",fontWeight:600,cursor:"pointer"}}>{lbl}</button>
                ))}
                <button onClick={()=>fileRef.current?.click()} style={{marginLeft:"auto",padding:"4px 10px",background:`${vm.colour}15`,border:`1px solid ${vm.colour}30`,borderRadius:7,color:vm.colour,fontSize:"0.65rem",fontWeight:700,cursor:"pointer"}}>📤 New Photo</button>
              </div>
              {detectedViewNotice&&<div style={{padding:"7px 11px",background:"rgba(0,229,255,0.1)",border:"1px solid rgba(0,229,255,0.35)",borderRadius:8,fontSize:"0.72rem",color:"#00e5ff",fontWeight:600,marginBottom:8}}>{detectedViewNotice}</div>}
              {error&&<div style={{padding:"8px 11px",background:"rgba(255,77,109,0.1)",border:"1px solid rgba(255,77,109,0.3)",borderRadius:8,fontSize:"0.74rem",color:C2.red,marginBottom:8}}>{error}</div>}
              {scoreData&&(
                <button onClick={()=>setTab("results")} style={{width:"100%",padding:"11px",background:`linear-gradient(135deg,${C2.accent},${C2.a2})`,border:"none",borderRadius:10,color:"#1a1025",fontWeight:800,fontSize:"0.8rem",cursor:"pointer"}}>View Full Analysis →</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results tab */}
      {tab==="results"&&analysisResult&&(
        <div style={{padding:"13px 14px"}}>
          {/* Score row */}
          <div style={{display:"flex",gap:12,alignItems:"center",padding:"11px 13px",background:`${scoreData?.colour||C2.accent}09`,border:`1px solid ${scoreData?.colour||C2.accent}25`,borderRadius:12,marginBottom:12}}>
            <ScoreRingNew score={scoreData?.score||0} band={scoreData?.band||"—"} colour={scoreData?.colour||C2.muted} size={68}/>
            <div style={{flex:1}}>
              <div style={{fontSize:"0.68rem",color:C2.muted,marginBottom:5}}>
                {analysisResult.view && (
                  <span style={{padding:"1px 7px",borderRadius:5,background:`${vm.colour}15`,color:vm.colour,fontWeight:700,marginRight:6,fontSize:"0.62rem"}}>
                    {({anterior:"⬆ Anterior",posterior:"⬇ Posterior",left:"◀ Left Lateral",right:"▶ Right Lateral"})[analysisResult.view]||analysisResult.view} View
                  </span>
                )}
                {new Date(analysisResult.capturedAt).toLocaleTimeString()}
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <span style={{fontSize:"0.62rem",padding:"2px 8px",borderRadius:7,background:"rgba(0,229,255,0.1)",color:C2.accent}}>Reliability: {reliability?.status}</span>
                <span style={{fontSize:"0.62rem",padding:"2px 8px",borderRadius:7,background:"rgba(255,77,109,0.1)",color:C2.red}}>Priority: {highF.length}</span>
                <span style={{fontSize:"0.62rem",padding:"2px 8px",borderRadius:7,background:"rgba(255,179,0,0.1)",color:C2.yellow}}>Findings: {findings?.length||0}</span>
              </div>
            </div>
          </div>

          {/* Findings */}
          {findings?.length===0?(
            <div style={{padding:"14px",textAlign:"center",background:"rgba(0,201,122,0.07)",border:`1px solid ${C2.green}30`,borderRadius:10,marginBottom:10}}>
              <div style={{fontSize:"1.2rem",marginBottom:6}}>✅</div>
              <div style={{fontWeight:700,color:C2.green,fontSize:"0.82rem"}}>No significant deviations detected</div>
            </div>
          ):(
            <div style={{marginBottom:12}}>
              {highF.length>0&&(
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:"0.6rem",fontWeight:700,color:C2.red,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>🔴 Priority ({highF.length})</div>
                  {highF.map((f,i)=><FindingCardNew key={i} f={f} defaultOpen={i===0}/>)}
                </div>
              )}
              {otherF.length>0&&(
                <div>
                  <div style={{fontSize:"0.6rem",fontWeight:700,color:C2.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>🟡 Notable ({otherF.length})</div>
                  {otherF.map((f,i)=><FindingCardNew key={i} f={f}/>)}
                </div>
              )}
            </div>
          )}

          {/* Clinical Metrics Dashboard */}
          {measurements&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:"0.6rem",fontWeight:700,color:C2.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>📐 Clinical Metrics</div>

              {/* Sub-scores radar row */}
              {scoreData?.subScores&&(
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:"0.58rem",color:C2.muted,marginBottom:5,fontWeight:600}}>Regional Scores</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
                    {Object.entries(scoreData?.subScores).map(([region,val])=>{
                      const col=val>=80?"#00c97a":val>=60?"#ffb300":"#ff4d6d";
                      const label={cervical:"Cervical",shoulder:"Shoulder",thoracic:"Thoracic",lumbar:"Lumbar",knee:"Knee",global:"Global"}[region]||region;
                      return(
                        <div key={region} style={{padding:"6px 8px",background:`${col}10`,border:`1px solid ${col}25`,borderRadius:8,textAlign:"center"}}>
                          <div style={{fontSize:"1rem",fontWeight:900,color:col}}>{Math.round(val)}</div>
                          <div style={{fontSize:"0.56rem",color:C2.muted,fontWeight:600}}>{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reliability + ICC */}
              {reliability&&(
                <div style={{display:"flex",gap:6,marginBottom:8}}>
                  <div style={{flex:1,padding:"5px 9px",background:"rgba(0,229,255,0.06)",border:"1px solid rgba(0,229,255,0.2)",borderRadius:8}}>
                    <div style={{fontSize:"0.58rem",color:C2.muted}}>Tracking Quality</div>
                    <div style={{fontSize:"0.8rem",fontWeight:800,color:C2.accent}}>{reliability.status} · {reliability.score}%</div>
                  </div>
                  {reliability.icc&&(
                    <div style={{flex:1,padding:"5px 9px",background:"rgba(0,229,255,0.06)",border:"1px solid rgba(0,229,255,0.2)",borderRadius:8}}>
                      <div style={{fontSize:"0.58rem",color:C2.muted}}>ICC Proxy</div>
                      <div style={{fontSize:"0.8rem",fontWeight:800,color:C2.accent}}>{reliability.icc}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Full metric rows */}
              {[
                // Sagittal — highest clinical priority
                {label:"CVA (Forward Head)",    value:measurements.cvaAngle,        unit:"°",  t:[49,55], norm:">55° normal",  invert:true},
                {label:"Cervical Load Est.",    value:measurements.cervicalLoadKg,   unit:"kg", t:[6,10],  norm:"Neutral: 4.5kg"},
                {label:"Thoracic Kyphosis",     value:measurements.thoracicAngle,    unit:"°",  t:[45,55], norm:"20–45° normal"},
                {label:"Lumbar Lordosis Est.",  value:measurements.lordosisAngle,    unit:"°",  t:[60,70], norm:"40–60° normal"},
                {label:"Ant. Pelvic Tilt",      value:measurements.anteriorPelvicTiltDeg, unit:"°", t:[12,20], norm:"♀≤12° ♂≤7°"},
                // Frontal
                {label:"Shoulder Tilt",         value:measurements.shoulderAngle,    unit:"°",  t:[3,7],   norm:"<3° normal"},
                {label:"Pelvic Obliquity",      value:measurements.pelvisAngle,      unit:"°",  t:[3,7],   norm:"<3° normal"},
                {label:"Trunk Lateral Shift",   value:measurements.trunkLateralShift,unit:"%",  t:[3.5,7], norm:"<3.5% normal"},
                {label:"Scoliosis (Cobb est.)", value:measurements.cobbEstimate,     unit:"°",  t:[5,10],  norm:"<5° normal"},
                {label:"C7 Plumb Deviation",    value:measurements.c7PlumbDev,       unit:"%",  t:[4,8],   norm:"<4% normal"},
                // Knees
                {label:"L Knee Valgus/Varus",   value:measurements.leftKneeFrontal,  unit:"°",  t:[5,10],  norm:"<5° normal"},
                {label:"R Knee Valgus/Varus",   value:measurements.rightKneeFrontal, unit:"°",  t:[5,10],  norm:"<5° normal"},
                {label:"L Knee Hyperext.",       value:measurements.leftKneeDev,      unit:"°",  t:[-5,-12],norm:"0 to -5° normal", invert:true},
                {label:"R Knee Hyperext.",       value:measurements.rightKneeDev,     unit:"°",  t:[-5,-12],norm:"0 to -5° normal", invert:true},
                // Balance
                {label:"WB Asymmetry",          value:measurements.weightBearingShift,unit:"%", t:[4,8],   norm:"<4% normal"},
                {label:"COG Deviation",         value:measurements.cogDeviation,     unit:"%",  t:[4,8],   norm:"<4% normal"},
                {label:"LLD Proxy",             value:measurements.lldProxy,         unit:"mm", t:[5,10],  norm:"<5mm acceptable", side:measurements.lldSide},
                // Syndrome indices
                {label:"UCS Index (Janda)",     value:measurements.ucsIndex,         unit:"",   t:[0.6,1.0],norm:"<0.4 normal"},
                {label:"LCS Index (Janda)",     value:measurements.lcsIndex,         unit:"",   t:[0.5,1.0],norm:"<0.4 normal"},
                {label:"Postural Load Index",   value:measurements.posturalLoadIndex,unit:"/100",t:[35,55], norm:"<35 optimal"},
              ].map((m,i)=>{
                if(m.value===null||m.value===undefined||isNaN(m.value)) return null;
                const abs=Math.abs(m.value);
                let col;
                if(m.invert) {
                  col = abs < Math.abs(m.t[0]) ? "#00c97a" : abs < Math.abs(m.t[1]) ? "#ffb300" : "#ff4d6d";
                } else {
                  col = abs < m.t[0] ? "#00c97a" : abs < m.t[1] ? "#ffb300" : "#ff4d6d";
                }
                const display = m.invert
                  ? `${m.value.toFixed(1)}${m.unit}`
                  : `${m.value>0?"+":""}${m.value.toFixed(1)}${m.unit}`;
                return(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:`${col}08`,border:`1px solid ${col}20`,borderRadius:8,marginBottom:4}}>
                    <div>
                      <div style={{fontSize:"0.7rem",color:C2.text,fontWeight:600}}>{m.label}{m.side?` (${m.side} short)`:""}</div>
                      {m.norm&&<div style={{fontSize:"0.57rem",color:C2.muted}}>{m.norm}</div>}
                    </div>
                    <span style={{fontSize:"0.9rem",fontWeight:900,color:col,flexShrink:0,marginLeft:8}}>{display}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{fontSize:"0.62rem",color:C2.muted,padding:"7px 10px",background:C2.s2,borderRadius:7,lineHeight:1.6}}>⚠ Observational AI analysis — not a clinical diagnosis. All findings require clinical correlation and manual assessment.</div>

        </div>
      )}

      {/* History modal */}
      {showHistory&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:C2.surface,border:`1px solid ${C2.border}`,borderRadius:16,width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontWeight:800,color:C2.accent,fontSize:"0.9rem"}}>📁 Photo Analysis History</div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={clearHistory} style={{padding:"4px 10px",background:"rgba(255,77,109,0.1)",border:`1px solid rgba(255,77,109,0.3)`,borderRadius:7,color:C2.red,fontSize:"0.65rem",cursor:"pointer"}}>Clear</button>
                <button onClick={()=>setShowHistory(false)} style={{padding:"4px 10px",background:C2.s2,border:`1px solid ${C2.border}`,borderRadius:7,color:C2.muted,fontSize:"0.65rem",cursor:"pointer"}}>Close</button>
              </div>
            </div>
            {sessions.length===0?<div style={{textAlign:"center",color:C2.muted,padding:24,fontSize:"0.78rem"}}>No sessions yet</div>:(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...sessions].reverse().map((s,i)=>{
                  const col=(s.score||0)>=78?"#00c97a":(s.score||0)>=62?"#ffb300":"#ff4d6d";
                  return(
                    <div key={i} style={{background:C2.s2,border:`1px solid ${C2.border}`,borderRadius:10,padding:"10px 12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <div style={{fontWeight:700,color:C2.text,fontSize:"0.78rem"}}>{(s.view||"").toUpperCase()} · {s.band||"—"}</div>
                        <div style={{fontSize:"1.2rem",fontWeight:900,color:col}}>{s.score}</div>
                      </div>
                      <div style={{fontSize:"0.6rem",color:C2.muted,marginBottom:5}}>{new Date(s.capturedAt).toLocaleString()}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:"0.58rem",padding:"1px 7px",borderRadius:6,background:"rgba(255,77,109,0.1)",color:C2.red}}>Priority: {s.highCount||0}</span>
                        <span style={{fontSize:"0.58rem",padding:"1px 7px",borderRadius:6,background:"rgba(255,179,0,0.1)",color:C2.yellow}}>Findings: {s.findingsCount||0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



// ─── MAIN APP ────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-PATIENT DATABASE
// ═══════════════════════════════════════════════════════════════════════════
const DB_KEY = "physio_patient_db_v1";

const DEMO_PATIENTS = [
  {
    id:"demo_001", name:"Aisha Malik", lastDx:"", hasRedFlags:false,
    createdAt:"2025-01-10T09:00:00Z", updatedAt:"2025-01-10T09:00:00Z",
    data:{
      dem_name:"Aisha Malik", dem_age:"34", dem_sex:"Female", dem_occupation:"Office administrator",
      dem_work_status:"Full time employed",
      cc_main:"My neck has been killing me for weeks. I wake up with terrible stiffness and by afternoon I can barely turn my head.",
      cc_location:["Neck — posterior","Neck — lateral (R)","Shoulder (R)"],
      cc_symptom_type:["Stiffness","Aching","Sharp"],
      cc_onset:["Gradual — insidious"], cc_duration:["1–3 months"],
      pa_vas_now:"5", pa_vas_worst:"8", pa_vas_best:"2",
      pa_quality:["Aching","Stiffness","Sharp"],
      sb_morning:["Worse on waking — prolonged stiffness (>30 min)"],
      sb_night:["Pain disturbs sleep — takes time to settle"],
      agg_posture:["Prolonged sitting > 1 hour","Computer work","Looking down (phone use)"],
      agg_movement:["Rotation right","Looking over shoulder"],
      rel_manual:["Heat application"],
      moi_type:["Postural overload"], moi_activity:"Sitting at desk all day working from home",
      phx_conditions:"Migraine (occasional)",
      dem_gp:"Dr. Patel",
    }
  },
  {
    id:"demo_002", name:"James Okonkwo", lastDx:"", hasRedFlags:false,
    createdAt:"2025-01-11T10:00:00Z", updatedAt:"2025-01-11T10:00:00Z",
    data:{
      dem_name:"James Okonkwo", dem_age:"52", dem_sex:"Male", dem_occupation:"Warehouse operative",
      dem_work_status:["Full time employed","Off work — injury"],
      cc_main:"Sharp pain down my left leg when I bend forward. Started after lifting a heavy pallet last month.",
      cc_location:["Lower back","Buttock (L)","Thigh posterior (L)"],
      cc_radiation:["Radiates to leg (L)","Radiates to calf"],
      cc_symptom_type:["Sharp","Shooting","Tingling/pins & needles"],
      cc_onset:["Lifting injury — flexed spine"], cc_duration:["2–4 weeks (subacute)"],
      pa_vas_now:"6", pa_vas_worst:"9", pa_vas_best:"3",
      pa_quality:["Sharp","Shooting","Burning","Tingling"],
      sb_morning:["Worst on waking — eases quickly (<30 min)"],
      sb_night:["Pain wakes from sleep — can return to sleep"],
      agg_movement:["Forward bending","Getting in/out of car","Coughing / sneezing"],
      rel_posture:["Lying with knees bent"],
      moi_type:["Lifting injury — flexed spine"], moi_activity:"Lifting a 40kg pallet at warehouse",
      phx_conditions:"Hypertension", meds_current:"Amlodipine 5mg",
      s_red4:"", // no bilateral pins
    }
  },
  {
    id:"demo_003", name:"Priya Sharma", lastDx:"", hasRedFlags:false,
    createdAt:"2025-01-12T11:00:00Z", updatedAt:"2025-01-12T11:00:00Z",
    data:{
      dem_name:"Priya Sharma", dem_age:"28", dem_sex:"Female", dem_occupation:"Physiotherapy student",
      dem_work_status:"Student",
      cc_main:"My left knee swells up after running and feels unstable going down stairs.",
      cc_location:["Knee (L)"],
      cc_symptom_type:["Pain","Swelling","Giving way","Clicking"],
      cc_onset:["Non-contact sport injury","Gradual — insidious"], cc_duration:["3–6 months (chronic)"],
      pa_vas_now:"4", pa_vas_worst:"7", pa_vas_best:"0",
      pa_quality:["Aching","Sharp","Throbbing"],
      pa_pattern:["Only with specific movements","Post-activity delayed"],
      sb_morning:["Stiff on waking — improves with movement"],
      agg_activity:["Running","Stairs — down","Squatting","Gym — cardio"],
      rel_posture:["Lying flat"],
      rel_manual:["Ice application"],
      moi_type:["Running injury"], moi_activity:"Training for half marathon",
      ar_sport_level:["Active — 4–5x/week"],
      ar_sports_played:["Running — road"],
      ar_goal_sport:"Return to running half marathon training",
      phx_conditions:"None",
    }
  },
  {
    id:"demo_004", name:"Robert Chen", lastDx:"", hasRedFlags:false,
    createdAt:"2025-01-13T12:00:00Z", updatedAt:"2025-01-13T12:00:00Z",
    data:{
      dem_name:"Robert Chen", dem_age:"67", dem_sex:"Male", dem_occupation:"Retired teacher",
      dem_work_status:"Retired",
      cc_main:"Both shoulders ache constantly. I can't lift my arms above my head anymore and getting dressed in the morning is a real struggle.",
      cc_location:["Shoulder (L)","Shoulder (R)","Upper arm (L)","Upper arm (R)"],
      cc_symptom_type:["Aching","Stiffness","Weakness"],
      cc_onset:["Gradual — insidious"], cc_duration:["1–2 years"],
      pa_vas_now:"5", pa_vas_worst:"7", pa_vas_best:"2",
      pa_quality:["Aching","Deep","Constant ache"],
      pa_pattern:["Constant — varies in intensity","Morning dominant"],
      sb_morning:["Worse on waking — prolonged stiffness (>30 min)"],
      sb_night:["Cannot sleep on affected side","Pain disturbs sleep — takes time to settle"],
      agg_movement:["Reaching overhead","Reaching across body"],
      agg_activity:["Housework","Gardening"],
      rel_manual:["Heat application","Physiotherapy manual therapy"],
      phx_conditions:"Type 2 diabetes, Hypertension",
      meds_current:"Metformin 500mg, Lisinopril 10mg",
      fl_self_care:["Dressing — upper body difficulty","Washing hair — difficulty"],
      fl_domestic:["Cleaning — cannot vacuum","Ironing — cannot perform"],
    }
  },
  {
    id:"demo_005", name:"Sarah Thompson", lastDx:"", hasRedFlags:false,
    createdAt:"2025-01-14T13:00:00Z", updatedAt:"2025-01-14T13:00:00Z",
    data:{
      dem_name:"Sarah Thompson", dem_age:"41", dem_sex:"Female", dem_occupation:"Nurse",
      dem_work_status:"Full time employed",
      cc_main:"I get burning pain in my right wrist and hand, especially at night. My fingers feel numb when I wake up.",
      cc_location:["Wrist (R)","Hand/fingers (R)"],
      cc_radiation:["Radiates to hand/fingers (R)"],
      cc_symptom_type:["Burning","Tingling/pins & needles","Numbness","Weakness"],
      cc_onset:["Repetitive strain","Occupational injury"], cc_duration:["6–12 months"],
      pa_vas_now:"4", pa_vas_worst:"7", pa_vas_best:"1",
      pa_quality:["Burning","Tingling","Pins and needles","Numb"],
      pa_nature:["Neuropathic — burning, shooting, dermatomal"],
      pa_pattern:["Night pain waking patient","Activity dependent"],
      sb_night:["Wakes once per night","Arm/leg symptoms at night (neural)"],
      sb_morning:["Pain free on waking then worsens"],
      agg_activity:["Computer/keyboard work","Carrying children"],
      agg_movement:["Reaching across body"],
      rel_posture:["Lying with arms at sides"],
      rel_manual:["Massage — general"],
      moi_type:["Repetitive strain","Occupational injury"],
      moi_activity:"Long shifts doing patient transfers and documentation",
      phx_conditions:"Hypothyroidism", meds_current:"Levothyroxine 75mcg",
      fl_work:["Cannot sit > 1 hour","Computer work painful"],
      fl_self_care:["Dressing — upper body difficulty"],
    }
  },
];

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

export { PostureCameraModule, usePostureHistory, PostureAnalysisModule, PostureLiveAnalysis, PhotoUploadAnalyzer, DB_KEY, DEMO_PATIENTS, loadPatientDB, savePatientDB, genId, getInitials, AVATAR_GRADIENTS, avatarGrad, PatientProfileModal, PatientCard, PatientDatabasePanel, POSTURE_DEFECTS, PostureDefectDetail, PostureDefectModule };
