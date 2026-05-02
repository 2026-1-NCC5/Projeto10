export function gramsToKg(grams: number | null | undefined): number {
  return Number(grams ?? 0) / 1000
}


export function formatKg(
  grams: number | null | undefined,
  digits = 2,
): string {
  return gramsToKg(grams).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}


export function formatInt(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
}


export function formatCurrencyBrl(value: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value ?? 0)
  )
}
