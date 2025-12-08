"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { formatPrice } from "@/app/lib/utils/format"

interface EmiTableProps {
  price: number
  months?: number[]
  interestRate?: number
}

export function EmiTable({ price, months = [3, 6, 9, 12, 18, 24], interestRate = 0 }: EmiTableProps) {
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
          {months.map((month) => {
            const emiAmount = calculateEmi(price, month, interestRate)
            const totalCost = emiAmount * month
            return (
              <TableRow key={month}>
                <TableCell className="text-left font-medium">{month} Months</TableCell>
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
