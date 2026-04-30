// ─── CameraView — Professional full-screen responsive camera preview ──────────
import React, { useEffect } from "react";

// intrinsicWidth / intrinsicHeight default to 1920x1280 as requested
function CameraView({
  videoRef,
  canvasRef,
  isActive,
  facingMode,
  children,
  onTapFocus,
  zoom,
  intrinsicWidth = 1920,
  intrinsicHeight = 1280,
}) {
  useEffect(() => {
    const v = videoRef?.current;
    const c = canvasRef?.current;
    if (!v) return;

    // Set intrinsic size attributes so the browser knows the stream resolution
    try {
      v.width = intrinsicWidth;
      v.height = intrinsicHeight;
    } catch (e) { /* ignore */ }

    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      if (!v || !c) return;
      // Match canvas pixel size to the displayed video size (high-DPI aware)
      const rect = v.getBoundingClientRect();
      c.style.width = rect.width + "px";
      c.style.height = rect.height + "px";
      c.width = Math.round(rect.width * DPR);
      c.height = Math.round(rect.height * DPR);
      const ctx = c.getContext("2d");
      if (ctx) ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    // initial resize
    resize();
    // keep canvas in sync when window layout changes
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [videoRef, canvasRef, intrinsicWidth, intrinsicHeight]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        // set HTML attributes for intrinsic resolution
        width={intrinsicWidth}
        height={intrinsicHeight}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          objectFit: "contain", // shows full frame (no crop). Change to 'cover' to fill/crop
          transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
          display: isActive ? "block" : "none",
        }}
        playsInline
        autoPlay
        muted
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {children}
    </div>
  );
}

export default CameraView;
