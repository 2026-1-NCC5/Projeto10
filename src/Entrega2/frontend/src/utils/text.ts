export function normalizeItemName(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}
