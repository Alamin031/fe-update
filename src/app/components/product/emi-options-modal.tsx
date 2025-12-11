/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { X } from "lucide-react"
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
  isLoading?: boolean
  onOpen?: () => Promise<void>
}

export function EmiOptionsModal({
  open,
  onOpenChange,
  plans,
  price,
  onOpen
}: EmiOptionsModalProps) {
  const [amount, setAmount] = useState(price.toString())
  const [selectedBankId, setSelectedBankId] = useState<string>("")
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)

  // Fetch plans when modal opens
  useEffect(() => {
    if (open && onOpen && plans.length === 0) {
      const fetchPlans = async () => {
        setIsLoadingPlans(true)
        try {
          await onOpen()
        } catch (error) {
        } finally {
          setIsLoadingPlans(false)
        }
      }
      fetchPlans()
    }
  }, [open, onOpen, plans.length])

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

  // Calculate actual amount for EMI based on input
  const emiAmount = parseFloat(amount) || price

  const calculateEmi = (principal: number, monthCount: number, rate: number = 0) => {
    // Simple interest calculation: Principal + (Principal * Rate% * Months) / Months
    const totalInterest = (principal * rate) / 100
    const totalAmount = principal + (totalInterest * monthCount)
    return totalAmount / monthCount
  }

  // Get initials for bank badge
  const getBankInitials = (bankName: string) => {
    const words = bankName.split(/\s+/).filter(w => w.length > 0)
    if (words.length > 0) {
      return words[0].charAt(0).toUpperCase()
    }
    return "B"
  }

  // Generate consistent color for bank badge
  const getBankBgColor = (index: number) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
    ]
    return colors[index % colors.length]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto p-6 gap-6">
        <DialogHeader className="flex flex-row items-center justify-between pr-6">
          <DialogTitle className="text-2xl font-bold">EMI Options</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Bank Selection */}
          <div className="lg:col-span-1">
            <div className="flex flex-col h-full">
              <div className="space-y-2 overflow-y-auto max-h-96">
                {bankIds.map((bankId, index) => (
                  <button
                    key={bankId}
                    onClick={() => setSelectedBankId(bankId)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-sm text-left",
                      selectedBank === bankId
                        ? "bg-muted border-2 border-foreground"
                        : "hover:bg-muted/50 border-2 border-transparent"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                      getBankBgColor(index)
                    )}>
                      {getBankInitials(plansByBank[bankId].bankName)}
                    </div>
                    <span className="truncate">{plansByBank[bankId].bankName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amount and Plans */}
          <div className="lg:col-span-3">
            {/* Amount Input */}
            <div className="mb-6">
              <label className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3 block">
                Enter Amount
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-semibold p-3 rounded-lg border border-border"
                placeholder={formatPrice(price)}
              />
            </div>

            {/* Plans Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-border">
                    <TableHead className="text-left font-bold text-foreground">Plan (Monthly)</TableHead>
                    <TableHead className="text-left font-bold text-foreground">EMI</TableHead>
                    <TableHead className="text-left font-bold text-foreground">Charge</TableHead>
                    <TableHead className="text-left font-bold text-foreground">Effective Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankPlans.length > 0 ? (
                    bankPlans.map((plan) => {
                      const monthlyEmi = calculateEmi(emiAmount, plan.months, plan.interestRate)
                      const totalCost = monthlyEmi * plan.months

                      return (
                        <TableRow key={plan.id} className="border-b border-border hover:bg-muted/30">
                          <TableCell className="font-medium py-4">{plan.months}</TableCell>
                          <TableCell className="py-4">
                            <div className="text-[oklch(0.75_0.15_45)] font-semibold">
                              {formatPrice(monthlyEmi)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-foreground font-medium">
                              {plan.interestRate}%
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-[oklch(0.75_0.15_45)] font-semibold">
                              {formatPrice(totalCost)}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
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
