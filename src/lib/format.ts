export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

export function formatResolution(w: number, h: number) {
  return `${w} × ${h}`
}

export function resolutionClass(w: number, h: number) {
  const long = Math.max(w, h)
  if (long >= 3840) return "4K"
  if (long >= 2560) return "2K"
  return "HD"
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a
}

export function aspectLabel(w: number, h: number) {
  const known: [number, string][] = [
    [3 / 2, "3:2"],
    [2 / 3, "2:3"],
    [16 / 9, "16:9"],
    [9 / 16, "9:16"],
    [3 / 4, "3:4"],
    [4 / 3, "4:3"],
  ]
  const r = w / h
  for (const [v, label] of known) {
    if (Math.abs(r - v) < 0.02) return label
  }
  const g = gcd(w, h)
  return `${w / g}:${h / g}`
}

export function formatDate(ms: number) {
  const d = new Date(ms)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}
