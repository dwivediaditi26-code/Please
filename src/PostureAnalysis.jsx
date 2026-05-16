import React, { useState, useCallback, useRef, useEffect, useMemo, Component } from 'react';
import { C, getC } from './theme.jsx';
import { usePostureHistory, AdvancedMeasurementEngine, ReliabilityEngine, ClinicalFindingsEngine, PostureScoreEngine, renderPostureOverlay, loadScript, POSTURE_VIEW_META, POSTURE_MP_CDN, vis, clamp } from './PostureCamera.jsx';
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

export { PostureAnalysisModule, PostureLiveAnalysis, PhotoUploadAnalyzer };
