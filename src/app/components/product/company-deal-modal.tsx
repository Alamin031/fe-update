"use client"

import { Dialog, DialogContent } from "../ui/dialog"
import { X } from "lucide-react"

interface CompanyDealModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyDealModal({ open, onOpenChange }: CompanyDealModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-8 rounded-2xl border border-border/60 shadow-2xl">
        <div className="absolute right-4 top-4">
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="text-center space-y-4 py-12">
          <h2 className="text-2xl font-bold text-foreground">Company Deal</h2>
          <p className="text-lg text-muted-foreground">This picture is coming soon</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
