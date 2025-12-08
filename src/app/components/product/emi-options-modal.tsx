"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { formatPrice } from "@/app/lib/utils/format"
import { cn } from "@/app/lib/utils"
import type { EmiPlan } from "@/app/lib/api/services/emi"

interface EmiOptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plans: EmiPlan[]
  price: number
}

export function EmiOptionsModal({ open, onOpenChange, plans, price }: EmiOptionsModalProps) {
  const [amount, setAmount] = useState(price.toString())
  const [selectedBankId, setSelectedBankId] = useState<string>("")

  // Debug log
  if (open) {
    console.log("Modal opened with plans:", plans)
  }

  // Group plans by bank
  const plansByBank = useMemo(() => {
    const grouped: Record<string, { bankName: string; plans: EmiPlan[] }> = {}

    plans.forEach((plan) => {
      if (!grouped[plan.bankId]) {
        // Get bank name from current plan or any plan with same bankId
        let bankName = plan.bankName
        if (!bankName) {
          const planWithName = plans.find((p) => p.bankId === plan.bankId && p.bankName)
          bankName = planWithName?.bankName || "Unknown Bank"
        }

        grouped[plan.bankId] = {
          bankName: bankName,
          plans: [],
        }
      }
      grouped[plan.bankId].plans.push(plan)
    })

    return grouped
  }, [plans])

  const bankIds = Object.keys(plansByBank)
  const selectedBank = selectedBankId || bankIds[0]
  const selectedBankData = plansByBank[selectedBank]
  const bankPlans = selectedBankData?.plans || []

  const numAmount = Number(amount) || 0

  const calculateEmi = (principal: number, monthCount: number, rate: number = 0) => {
    if (rate === 0) {
      return Math.ceil(principal / monthCount)
    }
    const monthlyRate = rate / 100 / 12
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, monthCount)
    const denominator = Math.pow(1 + monthlyRate, monthCount) - 1
    return Math.ceil(numerator / denominator)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>EMI Options</DialogTitle>
          <a href="#" className="text-sm font-medium text-[oklch(0.75_0.15_45)]">
            EMI FAQ
          </a>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Bank Selection */}
          <div className="border-r border-border pr-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">
              Bank Name
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-96">
              {bankIds.map((bankId) => (
                <button
                  key={bankId}
                  onClick={() => setSelectedBankId(bankId)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-sm",
                    selectedBank === bankId
                      ? "bg-black text-white"
                      : "hover:bg-muted"
                  )}
                >
                  {plansByBank[bankId].bankName}
                </button>
              ))}
            </div>
          </div>

          {/* Amount and Plans */}
          <div className="col-span-1 md:col-span-2">
            {/* Amount Input */}
            <div className="mb-6">
              <label className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2 block">
                Amount
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>

            {/* Plans Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left font-bold">Plan (Monthly)</TableHead>
                    <TableHead className="text-left font-bold">EMI</TableHead>
                    <TableHead className="text-left font-bold">Effective Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankPlans.length > 0 ? (
                    bankPlans.map((plan) => {
                      const emiAmount = calculateEmi(numAmount, plan.months, plan.interestRate)
                      const totalCost = emiAmount * plan.months
                      const totalInterest = totalCost - numAmount
                      const chargePercent = (totalInterest / numAmount * 100).toFixed(2)

                      return (
                        <TableRow key={plan.id} className="bg-muted/50">
                          <TableCell className="font-medium">{plan.months}</TableCell>
                          <TableCell>
                            <div className="text-[oklch(0.75_0.15_45)] font-semibold">
                              {formatPrice(emiAmount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              (EMI Charge {chargePercent}%)
                            </div>
                          </TableCell>
                          <TableCell className="text-[oklch(0.75_0.15_45)] font-semibold">
                            {formatPrice(totalCost)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No EMI plans available for this bank
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
