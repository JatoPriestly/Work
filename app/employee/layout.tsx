import type React from "react"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Jongo E-Auth",
  description: "Employee interface for signing in and out",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}