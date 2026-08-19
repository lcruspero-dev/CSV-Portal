import React, { useRef, useState, useCallback, useEffect } from "react";

interface SecureConfirmButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
  // How long (ms) the user must hold. Randomized slightly each mount so a
  // fixed-delay auto-clicker script can't be tuned to match it.
  minHoldMs?: number;
  maxHoldMs?: number;
}

/**
 * Drop-in replacement for a plain <button onClick={...}>Confirm</button>.
 *
 * Defends against auto-clicker extensions by requiring three things a
 * scripted single-click can't easily fake:
 *  1. event.isTrusted === true (rejects DOM-dispatched synthetic clicks)
 *  2. Real mouse movement in the ~1.5s before interaction is allowed
 *  3. A press-and-hold of randomized duration, not a single click
 *
 * Note: this raises the bar significantly but isn't a hard guarantee —
 * pair it with server-side timing/pattern checks (see notes at bottom).
 */
export const SecureConfirmButton: React.FC<SecureConfirmButtonProps> = ({
  onConfirm,
  disabled = false,
  loading = false,
  label = "Confirm",
  loadingLabel,
  className = "",
  minHoldMs = 1200,
  maxHoldMs = 2200,
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 -> 1
  const [mouseMoveDetected, setMouseMoveDetected] = useState(false);
  const [flaggedUntrusted, setFlaggedUntrusted] = useState(false);

  const holdDurationRef = useRef<number>(minHoldMs);
  const holdStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const moveCountRef = useRef(0);

  // Pick a fresh randomized hold duration each time the button becomes active.
  useEffect(() => {
    holdDurationRef.current =
      minHoldMs + Math.random() * (maxHoldMs - minHoldMs);
  }, [minHoldMs, maxHoldMs]);

  // Track real mouse movement over the button before allowing a hold to start.
  // Auto-clicker extensions almost always dispatch a click with no preceding
  // pointer movement.
  const handlePointerMove = useCallback(() => {
    moveCountRef.current += 1;
    if (moveCountRef.current >= 3 && !mouseMoveDetected) {
      setMouseMoveDetected(true);
    }
  }, [mouseMoveDetected]);

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    holdStartRef.current = null;
    setHolding(false);
    setProgress(0);
  }, []);

  const tick = useCallback(() => {
    if (holdStartRef.current == null) return;
    const elapsed = Date.now() - holdStartRef.current;
    const pct = Math.min(1, elapsed / holdDurationRef.current);
    setProgress(pct);
    if (pct >= 1) {
      cancelHold();
      onConfirm();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [cancelHold, onConfirm]);

  const startHold = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // isTrusted is false for events dispatched via element.click() or
      // dispatchEvent(new MouseEvent(...)) — the mechanism most simple
      // auto-clicker extensions use.
      if (!e.isTrusted) {
        setFlaggedUntrusted(true);
        return;
      }

      if (!mouseMoveDetected) {
        // No real pointer movement seen yet — don't start the hold.
        // (Button still shows a hint to move the mouse first.)
        return;
      }

      holdStartRef.current = Date.now();
      setHolding(true);
      setFlaggedUntrusted(false);
      rafRef.current = requestAnimationFrame(tick);
    },
    [disabled, loading, mouseMoveDetected, tick],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isBusy = loading;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button
        ref={btnRef}
        type="button"
        className={className || "at-confirm-btn"}
        disabled={disabled || isBusy}
        onPointerMove={handlePointerMove}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        style={{
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Fill indicator showing hold progress */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            left: 0,
            width: `${progress * 100}%`,
            background: "rgba(255,255,255,0.28)",
            transition: holding ? "none" : "width 0.15s ease",
            pointerEvents: "none",
          }}
        />
        <span style={{ position: "relative", zIndex: 1 }}>
          {isBusy
            ? loadingLabel || "..."
            : holding
              ? "Hold..."
              : mouseMoveDetected
                ? `Press & hold to ${label.toLowerCase()}`
                : label}
        </span>
      </button>

      {!mouseMoveDetected && !isBusy && (
        <span style={{ fontSize: "0.68rem", color: "#9090a8" }}>
          Move your mouse over the button, then press and hold to confirm.
        </span>
      )}
      {flaggedUntrusted && (
        <span style={{ fontSize: "0.68rem", color: "#dc2626" }}>
          Couldn't verify this as a manual action. Please click directly on the
          button with your mouse.
        </span>
      )}
    </div>
  );
};
