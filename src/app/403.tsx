"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "./components/ui/button"

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <h1 className="mb-2 text-4xl font-bold">403</h1>
        <h2 className="mb-4 text-2xl font-semibold">Access Denied</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          You don&apos;t have permission to access this page. Please check your account type or contact support if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
          <Link href="/account">
            <Button variant="outline">Go to Account</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
