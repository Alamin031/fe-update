import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { OAuthProvider } from "@/app/lib/oauth"
export const metadata: Metadata = {
  title: "Account - TechStore",
  description: "Sign in or create an account.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OAuthProvider>
      <div className="flex min-h-screen">
        <div className="hidden flex-1 bg-muted lg:flex lg:items-center lg:justify-center">
          <div className="mx-auto max-w-md px-8 text-center">
            <Link href="/" className="mb-8 inline-block">
              <Image src="/image/logo.png" alt="Friend's Telecom" width={200} height={60} className="object-contain" />
            </Link>
            <div className="relative mb-8 aspect-square overflow-hidden rounded-2xl">
              <Image src="/image/design.png" alt="Shopping illustration" fill className="object-cover" />
            </div>
            <h2 className="mb-4 text-2xl font-bold">Buy the Latest Tech</h2>
            <p className="text-muted-foreground">
              Your trusted destination for Apple products and mobile devices in Dhaka.
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 inline-block lg:hidden">
              <Image src="/image/logo.png" alt="Friend's Telecom" width={240} height={80} className="object-contain" />
            </Link>
            {children}
          </div>
        </div>
      </div>
    </OAuthProvider>
  )
}
