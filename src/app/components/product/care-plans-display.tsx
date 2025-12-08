"use client"

import { Shield, Check } from "lucide-react"
import { formatPrice } from "@/app/lib/utils/format"
import { cn } from "@/app/lib/utils"
import type { ProductCarePlan } from "@/app/lib/api/services/care"

interface CarePlansDisplayProps {
  carePlans: ProductCarePlan[]
  selectedPlanId?: string
  onSelectPlan?: (planId: string) => void
}

export function CarePlansDisplay({
  carePlans,
  selectedPlanId,
  onSelectPlan,
}: CarePlansDisplayProps) {
  if (carePlans.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-foreground" />
        <h3 className="font-semibold">Available Care Plans</h3>
      </div>
      <div className="grid gap-3">
        {carePlans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelectPlan?.(plan.id)}
            className={cn(
              "flex flex-col items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
              selectedPlanId === plan.id
                ? "border-foreground bg-foreground/5"
                : "border-border hover:border-foreground/30",
            )}
          >
            <div className="flex w-full items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold">{plan.planName}</p>
                {plan.duration && (
                  <p className="text-sm text-muted-foreground">{plan.duration}</p>
                )}
                {plan.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold">{formatPrice(plan.price)}</p>
              </div>
            </div>

            {plan.features && plan.features.length > 0 && (
              <ul className="w-full space-y-1 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-3 w-3 text-[oklch(0.45_0.2_145)]" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
