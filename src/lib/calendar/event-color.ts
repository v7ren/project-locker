/** Stable pastel for event blocks (readable on light + dark). */
export function eventColorCss(id: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 7)) % 360;
  }
  const bg = `hsl(${h} 55% 42%)`;
  const fg = "hsl(0 0% 98%)";
  return { bg, fg };
}

/** Calendar accent from a user-chosen hue (0–360). */
export function userHueCss(hue: number): { bg: string; fg: string } {
  const h = Number.isFinite(hue) ? ((Math.round(hue) % 360) + 360) % 360 : 210;
  const bg = `hsl(${h} 55% 42%)`;
  const fg = "hsl(0 0% 98%)";
  return { bg, fg };
}
