"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Camera, Clock, User, Activity, Smartphone } from "lucide-react"
import { QRScanner } from "@/components/qr-scanner"
import { EmployeeStatus } from "@/components/employee-status"
import { QuickSignIn } from "@/components/quick-signin"
import { getCurrentQRCode } from "@/lib/database"
import { getQRMode } from "@/lib/qr-utils"
import { QRCode } from "@/lib/types"

export default function EmployeePage() {
  const [currentQR, setCurrentQR] = useState<QRCode | null>(null)
  const [currentMode, setCurrentMode] = useState({ mode: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' })

  useEffect(() => {
    const fetchQRCode = async () => {
      const qrCodeData = await getCurrentQRCode();
      if (qrCodeData.valid && 'qrCode' in qrCodeData && qrCodeData.qrCode) {
        setCurrentQR(qrCodeData.qrCode);
        setCurrentMode(getQRMode(qrCodeData.qrCode));
      }
    };

    fetchQRCode();
    const timer = setInterval(fetchQRCode, 5000) // Check for new QR code every 5 seconds
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Jongo E-Auth</h1>
              <p className="text-sm text-muted-foreground">Jongo E-Auth</p>
            </div>
            <Badge className={currentMode.color}>
              <Clock className="h-3 w-3 mr-1" />
              {currentMode.label}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Current Status Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              {currentMode.mode === "sign_in" ? (
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              ) : currentMode.mode === "sign_out" ? (
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-lg">
              {currentMode.mode === "sign_in"
                ? "Ready to Sign In"
                : currentMode.mode === "sign_out"
                  ? "Ready to Sign Out"
                  : "System Inactive"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentMode.mode === "sign_in"
                ? "Scan the QR code or select your name to sign in"
                : currentMode.mode === "sign_out"
                  ? "Scan the QR code or select your name to sign out"
                  : "The system is currently inactive. Please try again during business hours."}
            </p>
          </CardHeader>
        </Card>

        {/* Main Interface */}
        {currentMode.mode !== "inactive" ? (
          <Tabs defaultValue="scan" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Scan QR</span>
                <span className="sm:hidden">Scan</span>
              </TabsTrigger>
              <TabsTrigger value="quick" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Quick Sign</span>
                <span className="sm:hidden">Quick</span>
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">My Status</span>
                <span className="sm:hidden">Status</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan">
              <QRScanner mode={currentMode.mode as "sign_in" | "sign_out"} />
            </TabsContent>

            <TabsContent value="quick">
              <QuickSignIn mode={currentMode.mode as "sign_in" | "sign_out"} />
            </TabsContent>

            <TabsContent value="status">
              <EmployeeStatus />
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">System Inactive</h3>
                  <p className="text-muted-foreground mb-4">
                    The sign-in/out system is currently inactive. Please try again during these hours:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded">
                      <span className="text-green-800 dark:text-green-200">Sign-In Hours:</span>
                      <span className="font-medium text-green-700 dark:text-green-300">6:00 AM - 12:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                      <span className="text-blue-800 dark:text-blue-200">Sign-Out Hours:</span>
                      <span className="font-medium text-blue-700 dark:text-blue-300">12:00 PM - 10:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <QrCode className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">QR Code Scanning</p>
                  <p className="text-muted-foreground">
                    Use your camera to scan the QR code displayed on the office screen or kiosk.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Quick Sign-In/Out</p>
                  <p className="text-muted-foreground">
                    If you can't scan the QR code, use the quick sign option to select your name from the list.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Check Your Status</p>
                  <p className="text-muted-foreground">
                    View your recent sign-in/out activity and current status in the Status tab.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}