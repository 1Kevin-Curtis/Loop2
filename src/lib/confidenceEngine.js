export function calculateConfidence(signalCount = 0) {
  if (signalCount < 3) return "Emerging trend";
  if (signalCount < 6) return "Building confidence";
  return "Consistent pattern";
}
