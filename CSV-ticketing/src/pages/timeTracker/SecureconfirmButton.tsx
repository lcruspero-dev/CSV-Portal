import React, { useRef, useState, useCallback, useEffect } from "react";

interface SecureConfirmButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
  minHoldMs?: number;
  maxHoldMs?: number;
}

const DEFAULT_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-2 min-w-[190px] px-5 py-[0.6rem] rounded-[11px] border-none text-white text-[0.85rem] font-bold font-['Outfit',sans-serif] cursor-pointer select-none bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

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
    <div className="inline-flex flex-col gap-1 w-full sm:w-auto">
      <button
        ref={btnRef}
        type="button"
        className={`relative overflow-hidden select-none w-full sm:w-auto ${
          className || DEFAULT_BUTTON_CLASSES
        }`}
        disabled={disabled || isBusy}
        onPointerMove={handlePointerMove}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
      >
        {/* Fill indicator showing hold progress */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-white/40 pointer-events-none"
          style={{
            width: `${progress * 100}%`,
            transition: holding ? "none" : "width 0.15s ease",
          }}
        />
        {/* Distinct progress strip along the bottom edge — stays legible
            even on lighter button colors where the full-fill overlay above
            is subtle. */}
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-[3px] bg-white pointer-events-none"
          style={{
            width: `${progress * 100}%`,
            transition: holding ? "none" : "width 0.15s ease",
          }}
        />
        <span className="relative z-10">
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
        <span className="text-[0.68rem] text-[#9090a8]">
          Move your mouse over the button, then press and hold to confirm.
        </span>
      )}
      {flaggedUntrusted && (
        <span className="text-[0.68rem] text-red-600">
          Couldn't verify this as a manual action. Please click directly on the
          button with your mouse.
        </span>
      )}
    </div>
  );
};
