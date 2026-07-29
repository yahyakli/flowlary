export function formatCurrency(value: number | string | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericValue);
}
