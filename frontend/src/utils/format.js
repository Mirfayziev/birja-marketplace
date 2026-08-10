export function formatPrice(value, currencyLabel = "so'm") {
  if (value === null || value === undefined) return "-";
  const formatted = new Intl.NumberFormat("fr-FR").format(Math.round(value));
  return `${formatted} ${currencyLabel}`;
}
