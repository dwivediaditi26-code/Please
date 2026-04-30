// ─── CameraView — Professional full-screen responsive camera preview ──────────
function CameraView({ videoRef, canvasRef, isActive, facingMode, children, onTapFocus, zoom }) {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#000",
      position: "relative",
      overflow: "hidden"
    }}>
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
          display: isActive ? "block" : "none"
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
          height: "100%"
        }}
      />
      {children}
    </div>
  );
}