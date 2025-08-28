"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { QrCode, Calendar, Clock, Plus, Settings, Trash2, ToggleRight } from "lucide-react"
import { createWeeklyQRCode, getAllQRCodes } from "@/lib/database"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { getQRMode } from "@/lib/qr-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


interface QRCodeData {
  id?: string
  name: string;
  code: string
  week_start: any
  week_end: any
  is_active: boolean
  created_at: any
  signin_hour: string
  signout_hour: string
  inactive_hour: string
  work_days: string
  valid?: boolean; // Added
  message?: string; // Added
  mode?: "sign_in" | "sign_out" | null; // Added
}

export function QRCodeManagement() {
  const [currentQR, setCurrentQR] = useState<QRCodeData | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const [allQRCodes, setAllQRCodes] = useState<QRCodeData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const [qrConfig, setQrConfig] = useState({
    name: "",
    signin_hour: "08:00",
    signout_hour: "17:00",
    inactive_hour: "12:00",
    work_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    always_active: false, // Added
  })

  useEffect(() => {
    loadCurrentQR()
    loadAllQRCodes()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadCurrentQR = async () => {
    try {
      const response = await fetch("/api/qr")
      const data = await response.json()
      console.log("UI loadCurrentQR: Data received from API:", data); // Added log
      if (data.qrCode) {
        setCurrentQR({ ...data.qrCode, valid: data.valid, message: data.message, mode: data.mode })
        setQrCodeImage(data.qrCodeImage)
        console.log("[v0] Loaded current QR code:", data.qrCode.code, "Valid:", data.valid)
      } else {
        setCurrentQR(null)
        setQrCodeImage(null)
        console.log("[v0] No active QR code found")
      }
    } catch (error) {
      console.error("[v0] Failed to load QR code:", error)
      setCurrentQR(null)
      setQrCodeImage(null)
    }
  }

  const loadAllQRCodes = async () => {
    try {
      const qrs = await getAllQRCodes()
      setAllQRCodes(qrs)
    } catch (error) {
      console.error("[v0] Failed to load QR codes:", error)
    }
  }

  const generateNewQR = async () => {
    setIsGenerating(true)
    try {
      await createWeeklyQRCode({
        name: qrConfig.name,
        signin_hour: qrConfig.signin_hour,
        signout_hour: qrConfig.signout_hour,
        inactive_hour: qrConfig.inactive_hour,
        work_days: qrConfig.work_days.join(","),
        always_active: qrConfig.always_active, // Added
      })
      await loadCurrentQR()
      await loadAllQRCodes()
      setShowCreateForm(false)
      console.log("[v0] Generated new QR code with custom configuration")
    } catch (error) {
      console.error("[v0] Failed to generate QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteQR = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this QR code?")) {
      try {
        const response = await fetch(`/api/qr/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await loadCurrentQR();
          await loadAllQRCodes();
        } else {
          console.error("Failed to delete QR code");
        }
      } catch (error) {
        console.error("Error deleting QR code:", error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentStatus }),
      });
      if (response.ok) {
        await loadCurrentQR();
        await loadAllQRCodes();
      } else {
        console.error("Failed to toggle QR code status");
      }
    } catch (error) {
      console.error("Error toggling QR code status:", error);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeImage) {
      const link = document.createElement('a');
      link.href = qrCodeImage;
      link.download = `qr-code-${currentQR?.name || currentQR?.code || 'active'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>QR Code Management</CardTitle>
              <CardDescription>Create and manage QR codes with individual configurations</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configure & Create
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Create New QR Code</CardTitle>
                <CardDescription>Configure working hours and days for this QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">QR Code Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Weekly QR"
                    value={qrConfig.name}
                    onChange={(e) => setQrConfig({ ...qrConfig, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="signin_hour">Sign-in Hour</Label>
                    <Input
                      id="signin_hour"
                      type="time"
                      value={qrConfig.signin_hour}
                      onChange={(e) => setQrConfig({ ...qrConfig, signin_hour: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inactive_hour">Inactive Hour (Switch to Sign-out)</Label>
                    <Input
                      id="inactive_hour"
                      type="time"
                      value={qrConfig.inactive_hour}
                      onChange={(e) => setQrConfig({ ...qrConfig, inactive_hour: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signout_hour">Sign-out End Hour</Label>
                    <Input
                      id="signout_hour"
                      type="time"
                      value={qrConfig.signout_hour}
                      onChange={(e) => setQrConfig({ ...qrConfig, signout_hour: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Work Days</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={qrConfig.work_days.includes(day)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setQrConfig({ ...qrConfig, work_days: [...qrConfig.work_days, day] })
                            } else {
                              setQrConfig({ ...qrConfig, work_days: qrConfig.work_days.filter((d) => d !== day) })
                            }
                          }}
                        />
                        <Label htmlFor={day} className="text-sm">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateNewQR} disabled={isGenerating} className="flex items-center gap-2">
                    <Plus className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                    Create QR Code
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {/* Current QR Code Display */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Current Active QR Code</h3>
                {currentQR && <Badge className={getQRMode(currentQR).color}>{getQRMode(currentQR).label}</Badge>}
              </div>

              {currentQR && qrCodeImage ? (
                <div className="space-y-4">
                  <div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <QRCodeDisplay
                          qrCode={currentQR}
                          qrCodeImage={qrCodeImage}
                          modeInfo={getQRMode(currentQR)}
                          size={200}
                        />
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Active QR Code</DialogTitle>
                          <DialogDescription>
                            Scan this code to sign in or out.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <img src={qrCodeImage} alt="QR Code" width={400} height={400} />
                        </div>
                        <Button onClick={handleDownloadQR} className="w-full">
                          Download QR Code
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {!currentQR.valid && currentQR.message && (
                    <Alert variant="destructive">
                      <AlertTitle>QR Code Not Scannable</AlertTitle>
                      <AlertDescription>{currentQR.message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Valid: {new Date(currentQR.week_start.seconds * 1000).toLocaleDateString()} -{" "}
                        {new Date(currentQR.week_end.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Current time: {currentTime.toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Sign-in: {currentQR.signin_hour} - {currentQR.inactive_hour}
                      </p>
                      <p>
                        Sign-out: {currentQR.inactive_hour} - {currentQR.signout_hour}
                      </p>
                      <p>Work days: {currentQR.work_days}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No active QR code found</p>
                  <p className="text-sm">Create a new QR code to get started</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">All QR Codes</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allQRCodes.map((qr) => (
                  <div key={qr.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{qr.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={qr.is_active ? "default" : "secondary"}>
                          {qr.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(qr.id!, qr.is_active)}
                        >
                          <ToggleRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteQR(qr.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Created: {new Date(qr.created_at.seconds * 1000).toLocaleDateString()}</p>
                      <p>
                        Hours: {qr.signin_hour} - {qr.signout_hour}
                      </p>
                      <p>Days: {qr.work_days}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
