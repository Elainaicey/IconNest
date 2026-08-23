import type { PointerEvent as ReactPointerEvent } from "react";

const MAX_TILT = 2.4;

export function trackInteractiveSurface(
  event: ReactPointerEvent<HTMLElement>,
) {
  if (event.pointerType !== "mouse") return;

  const surface = event.currentTarget;
  const bounds = surface.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
  const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));

  surface.style.setProperty("--pointer-x", `${(x * 100).toFixed(2)}%`);
  surface.style.setProperty("--pointer-y", `${(y * 100).toFixed(2)}%`);
  surface.style.setProperty("--surface-rx", `${((0.5 - y) * MAX_TILT).toFixed(2)}deg`);
  surface.style.setProperty("--surface-ry", `${((x - 0.5) * MAX_TILT).toFixed(2)}deg`);
}

export function resetInteractiveSurface(
  event: ReactPointerEvent<HTMLElement>,
) {
  const surface = event.currentTarget;
  surface.style.setProperty("--surface-rx", "0deg");
  surface.style.setProperty("--surface-ry", "0deg");
}
