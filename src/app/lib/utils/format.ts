export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace("BDT", "৳")
}

/**
 * Returns the currency symbol and formatted amount separately so the UI
 * can style the symbol (৳) differently (bigger / bold) while preserving
 * the formatted numeric amount.
 */
export function formatPriceParts(price: number): { symbol: string; amount: string } {
  const nf = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  // formatToParts gives us parts like [{type: "currency", value: "BDT"}, {type:"literal",...}, {type:"integer",...}, ...]
  const parts = nf.formatToParts(price)
  let symbol = ""
  let amount = ""

  for (const p of parts) {
    if (p.type === "currency") {
      // Replace currency code with actual symbol
      symbol = "৳"
    } else {
      amount += p.value
    }
  }

  // Trim possible whitespace
  return { symbol: symbol.trim(), amount: amount.trim() }
}

export function formatEMI(price: number, months = 12): string {
  const emi = Math.ceil(price / months)
  return `${formatPrice(emi)}/month`
}

export function calculateDiscount(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}
