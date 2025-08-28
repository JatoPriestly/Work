"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings, Clock, Calendar, Save } from "lucide-react"
import { getSystemConfig, updateSystemConfig } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export function SystemConfig() {
  const { toast } = useToast()
  const [config, setConfig] = useState({
    signin_hour: "08:00",
    signout_hour: "17:00",
    inactive_hour: "12:00",
    work_days: "Monday,Tuesday,Wednesday,Thursday,Friday",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const workDayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const systemConfig = await getSystemConfig()
      setConfig({
        signin_hour: systemConfig.signin_hour || "08:00",
        signout_hour: systemConfig.signout_hour || "17:00",
        inactive_hour: systemConfig.inactive_hour || "12:00",
        work_days: systemConfig.work_days || "Monday,Tuesday,Wednesday,Thursday,Friday",
      })
    } catch (error) {
      console.error("[v0] Error loading config:", error)
      toast({
        title: "Error",
        description: "Failed to load system configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSystemConfig("signin_hour", config.signin_hour)
      await updateSystemConfig("signout_hour", config.signout_hour)
      await updateSystemConfig("inactive_hour", config.inactive_hour)
      await updateSystemConfig("work_days", config.work_days)

      toast({
        title: "Success",
        description: "System configuration updated successfully",
      })
    } catch (error) {
      console.error("[v0] Error saving config:", error)
      toast({
        title: "Error",
        description: "Failed to save system configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleWorkDayChange = (day: string, checked: boolean) => {
    const currentDays = config.work_days.split(",").filter((d) => d.trim())
    let newDays: string[]

    if (checked) {
      newDays = [...currentDays, day]
    } else {
      newDays = currentDays.filter((d) => d !== day)
    }

    setConfig({ ...config, work_days: newDays.join(",") })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const selectedWorkDays = config.work_days.split(",").filter((d) => d.trim())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signin-hour" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Sign-in Hour
              </Label>
              <Input
                id="signin-hour"
                type="time"
                value={config.signin_hour}
                onChange={(e) => setConfig({ ...config, signin_hour: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">When employees can start signing in</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inactive-hour" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Inactive Hour
              </Label>
              <Input
                id="inactive-hour"
                type="time"
                value={config.inactive_hour}
                onChange={(e) => setConfig({ ...config, inactive_hour: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">When QR switches from sign-in to sign-out</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signout-hour" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Sign-out Hour
              </Label>
              <Input
                id="signout-hour"
                type="time"
                value={config.signout_hour}
                onChange={(e) => setConfig({ ...config, signout_hour: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">When sign-out period ends</p>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Work Days
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {workDayOptions.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedWorkDays.includes(day)}
                    onCheckedChange={(checked) => handleWorkDayChange(day, checked as boolean)}
                  />
                  <Label htmlFor={day} className="text-sm font-normal">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">QR codes will only be active on selected days</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Code Validation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sign-in Period:</span>
              <span className="font-medium">
                {config.signin_hour} - {config.inactive_hour}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sign-out Period:</span>
              <span className="font-medium">
                {config.inactive_hour} - {config.signout_hour}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Days:</span>
              <span className="font-medium">{selectedWorkDays.join(", ")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
