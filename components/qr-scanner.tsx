"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CameraOff, CheckCircle } from "lucide-react"

interface QRScannerProps {
  mode: "sign_in" | "sign_out"
}

export function QRScanner({ mode }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
        setHasPermission(true)

        // Start QR code detection
        startQRDetection()
      }
    } catch (err) {
      console.error("[v0] Camera access failed:", err)
      setHasPermission(false)
      setError("Camera access denied. Please enable camera permissions and try again.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const startQRDetection = () => {
    // Simulate QR code detection (in a real app, you'd use a QR code library like jsQR)
    const detectQR = () => {
      if (!isScanning) return

      // Simulate QR code detection
      // In a real implementation, you would:
      // 1. Capture frame from video
      // 2. Use jsQR or similar library to detect QR codes
      // 3. Validate the QR code data

      setTimeout(detectQR, 100) // Check every 100ms
    }

    detectQR()
  }

  const simulateQRScan = () => {
    // Simulate a successful QR scan for demo purposes
    const mockQRData = `${window.location.origin}/scan/QR_202501?mode=${mode}`
    setScannedData(mockQRData)
    stopCamera()

    // Redirect to scan page
    setTimeout(() => {
      window.location.href = mockQRData
    }, 1500)
  }

  if (scannedData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-600">QR Code Detected!</h3>
              <p className="text-muted-foreground">Redirecting to sign-in page...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          QR Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isScanning ? (
            <div className="text-center space-y-4">
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Camera preview will appear here</p>
                </div>
              </div>

              {hasPermission === false && (
                <Alert>
                  <CameraOff className="h-4 w-4" />
                  <AlertDescription>
                    Camera access is required to scan QR codes. Please enable camera permissions in your browser
                    settings.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert>
                  <CameraOff className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button onClick={startCamera} className="w-full" size="lg">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
                <Button onClick={simulateQRScan} variant="outline" className="w-full bg-transparent">
                  Simulate QR Scan (Demo)
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-black rounded-lg object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50"></div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Position the QR code within the frame to scan</p>
                <div className="flex gap-2">
                  <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Camera
                  </Button>
                  <Button onClick={simulateQRScan} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Demo Scan
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            <p>• Point your camera at the QR code displayed on the office screen</p>
            <p>• Make sure the QR code is clearly visible and well-lit</p>
            <p>• The scan will happen automatically when detected</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
