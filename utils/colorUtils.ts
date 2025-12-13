const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const withAlpha = (hexColor: string, alpha: number): string => {
  const hex = hexColor.trim().replace('#', '');
  const clamped = clamp(alpha, 0, 1);

  const expand = (value: string) => `${value}${value}`;

  const rHex = hex.length === 3 ? expand(hex[0]) : hex.slice(0, 2);
  const gHex = hex.length === 3 ? expand(hex[1]) : hex.slice(2, 4);
  const bHex = hex.length === 3 ? expand(hex[2]) : hex.slice(4, 6);

  const r = Number.parseInt(rHex, 16);
  const g = Number.parseInt(gHex, 16);
  const b = Number.parseInt(bHex, 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) return hexColor;

  return `rgba(${r}, ${g}, ${b}, ${clamped})`;
};

