"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { formatPrice } from "@/app/lib/utils/format"
import type { EmiPlan } from "@/app/lib/api/services/emi"

interface EmiTableProps {
  price: number
  plans?: EmiPlan[]
  months?: number[]
  interestRate?: number
}

export function EmiTable({ price, plans, months = [3, 6, 9, 12, 18, 24], interestRate = 0 }: EmiTableProps) {
  const calculateEmi = (principal: number, monthCount: number, rate: number = 0) => {
    if (rate === 0) {
      return Math.ceil(principal / monthCount)
    }
    const monthlyRate = rate / 100 / 12
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, monthCount)
    const denominator = Math.pow(1 + monthlyRate, monthCount) - 1
    return Math.ceil(numerator / denominator)
  }

  // Use plans if provided, otherwise fall back to months array
  const emiPlans = plans && plans.length > 0
    ? plans
    : months.map((month) => ({
        id: String(month),
        months: month,
        planName: `${month} Months`,
        interestRate: interestRate,
        bankId: '',
      }))

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Monthly Payment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Total Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emiPlans.map((plan) => {
            const emiAmount = calculateEmi(price, plan.months, plan.interestRate)
            const totalCost = emiAmount * plan.months
            return (
              <TableRow key={plan.id}>
                <TableCell className="text-left font-medium">{plan.months} Months</TableCell>
                <TableCell className="text-right">{formatPrice(emiAmount)}</TableCell>
                <TableCell className="text-right">{formatPrice(totalCost)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
