"use client"

import { useState } from "react"
import { X, Calculator } from "lucide-react"
import { Button } from "../ui/button"
import { formatPrice } from "@/app/lib/utils/format"
import { cn } from "@/app/lib/utils"

interface EMICalculatorProps {
  price: number
  onClose: () => void
}

const emiOptions = [
  { months: 3, interest: 0 },
  { months: 6, interest: 0 },
  { months: 9, interest: 5 },
  { months: 12, interest: 8 },
  { months: 18, interest: 12 },
  { months: 24, interest: 15 },
]

export function EMICalculator({ price, onClose }: EMICalculatorProps) {
  const [selectedMonths, setSelectedMonths] = useState(12)
  const selectedOption = emiOptions.find((o) => o.months === selectedMonths) || emiOptions[3]

  const totalInterest = (price * selectedOption.interest) / 100
  const totalWithInterest = price + (totalInterest * selectedOption.months)
  const monthlyEMI = totalWithInterest / selectedOption.months

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <h3 className="font-semibold">EMI Calculator</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {emiOptions.map((option) => (
          <button
            key={option.months}
            onClick={() => setSelectedMonths(option.months)}
            className={cn(
              "rounded-lg border p-3 text-center transition-all",
              selectedMonths === option.months
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground/50",
            )}
          >
            <p className="text-lg font-bold">{option.months}</p>
            <p className="text-xs opacity-70">months</p>
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Monthly EMI</span>
          <span className="text-2xl font-bold">{formatPrice(monthlyEMI)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="font-medium">{formatPrice(totalWithInterest)}</span>
        </div>
        {selectedOption.interest > 0 && (
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Interest ({selectedOption.interest}%)</span>
            <span className="font-medium">{formatPrice(totalWithInterest - price)}</span>
          </div>
        )}
        {selectedOption.interest === 0 && (
          <p className="mt-2 text-xs font-medium text-[oklch(0.45_0.2_145)]">0% Interest - No extra charges!</p>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        * EMI available on select bank cards. Terms and conditions apply.
      </p>
    </div>
  )
}
