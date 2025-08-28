"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, User, CheckCircle, XCircle } from "lucide-react"
import { getAllEmployees, validateQRCode, recordSignInOut } from "@/lib/database"
import { Employee } from "@/lib/types";

export default function EmployeeSignInPage() {
  const params = useParams()
  const qrCode = params.qrCode as string
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [qrInfo, setQrInfo] = useState<any>(null)
  const [selfieData, setSelfieData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const qrValidation = await validateQRCode(qrCode)
        if (!qrValidation.valid) {
          setResult({ success: false, message: "Invalid or expired QR code" })
          return
        }

        setQrInfo(qrValidation)
        const employeeList = await getAllEmployees()
        setEmployees(employeeList)
      } catch (error) {
        setResult({ success: false, message: "Failed to load employee data" })
      }
    }
    init()
  }, [qrCode])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Camera access denied:", error)
      setResult({ success: false, message: "Camera access required for selfie" })
    }
  }

  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      setSelfieData(imageData)

      // Stop camera
      const stream = video.srcObject as MediaStream
      stream?.getTracks().forEach((track) => track.stop())
      setCameraActive(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedEmployee || !selfieData || !selectedEmployee.id) return

    setIsSubmitting(true)
    try {
      await recordSignInOut({
                employee_id: selectedEmployee.id,
        qrCodeId: qrCode,
        actionType: qrInfo.mode,
        selfieData: selfieData,
        ipAddress: "127.0.0.1", // Will be captured server-side in production
        deviceInfo: navigator.userAgent,
      })

      setResult({
        success: true,
        message: `Successfully ${qrInfo.mode === "sign_in" ? "signed in" : "signed out"}!`,
      })
    } catch (error) {
      setResult({ success: false, message: "Failed to record attendance" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            {result.success ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-xl font-bold mb-2">{result.success ? "Success!" : "Error"}</h2>
            <p className="text-muted-foreground">{result.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!qrInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Validating QR code...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Employee {qrInfo.mode === "sign_in" ? "Sign In" : "Sign Out"}
            </CardTitle>
            <Badge variant={qrInfo.mode === "sign_in" ? "default" : "secondary"} className="mx-auto">
              {qrInfo.mode === "sign_in" ? "Sign In Mode" : "Sign Out Mode"}
            </Badge>
          </CardHeader>
        </Card>

        {/* Employee Selection */}
        {!selectedEmployee && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Your Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {employees.filter(employee => employee.id).map((employee) => (
                  <Button
                    key={employee.id}
                    variant="outline"
                    className="justify-start h-auto p-4 bg-transparent"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.department}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selfie Capture */}
        {selectedEmployee && !selfieData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Take Selfie
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Please take a selfie to complete your {qrInfo.mode === "sign_in" ? "sign in" : "sign out"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="font-medium mb-2">Selected: {selectedEmployee.name}</p>
                <Badge variant="outline">{selectedEmployee.department}</Badge>
              </div>

              {!cameraActive ? (
                <Button onClick={startCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                  </div>
                  <Button onClick={takeSelfie} className="w-full">
                    Take Photo
                  </Button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>
        )}

        {/* Confirmation */}
        {selectedEmployee && selfieData && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm {qrInfo.mode === "sign_in" ? "Sign In" : "Sign Out"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="font-medium">{selectedEmployee.name}</p>
                <Badge variant="outline">{selectedEmployee.department}</Badge>
              </div>

              <div className="text-center">
                <img
                  src={selfieData || "/placeholder.svg"}
                  alt="Selfie"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelfieData(null)} className="flex-1">
                  Retake Photo
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Processing..." : `Confirm ${qrInfo.mode === "sign_in" ? "Sign In" : "Sign Out"}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
