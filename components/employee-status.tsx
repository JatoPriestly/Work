"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, User, MapPin, Smartphone, Calendar } from "lucide-react"
import { getSignInOutRecords } from "@/lib/database"

interface EnrichedSignInOutRecord {
  id?: string;
  employee_id: string;
  qr_code_id: string;
  action_type: "sign_in" | "sign_out";
  timestamp: string;
  ip_address?: string;
  device_info?: string;
  selfie_data?: string;
  employee_name: string;
  qr_code: string;
}

export function EmployeeStatus() {
  const [employeeId, setEmployeeId] = useState("")
  const [records, setRecords] = useState<EnrichedSignInOutRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<"signed_in" | "signed_out" | "unknown">("unknown")

  const searchEmployee = async () => {
    if (!employeeId.trim()) return

    setIsLoading(true)
    setError(null)
    try {
      // Get recent records for this employee
      const data = await getSignInOutRecords({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Last 30 days
      }) as EnrichedSignInOutRecord[]

      // Filter by employee ID or name
      const employeeRecords = data.filter(
        (record) =>
          record.employee_id.toLowerCase().includes(employeeId.toLowerCase()) ||
          record.employee_name.toLowerCase().includes(employeeId.toLowerCase()),
      )

      setRecords(employeeRecords)

      // Determine current status
      if (employeeRecords.length > 0) {
        const latestRecord = employeeRecords[0] // Records are ordered by timestamp DESC
        setCurrentStatus(latestRecord.action_type === "sign_in" ? "signed_in" : "signed_out")
      } else {
        setCurrentStatus("unknown")
      }
    } catch (err) {
      console.error("[v0] Failed to load employee status:", err)
      setError("Failed to load employee status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "signed_in":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Signed In</Badge>
      case "signed_out":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Signed Out</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Check Employee Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter your name or employee ID..."
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && searchEmployee()}
                />
              </div>
              <Button onClick={searchEmployee} disabled={isLoading || !employeeId.trim()}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {records.length > 0 && (
        <>
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{records[0].employee_name}</p>
                  <p className="text-sm text-muted-foreground">{records[0].employee_id}</p>
                </div>
                {getStatusBadge()}
              </div>
              {records[0] && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Last activity: {formatTimestamp(records[0].timestamp).date} at{" "}
                  {formatTimestamp(records[0].timestamp).time}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records.slice(0, 10).filter(record => record.id).map((record) => {
                  const { date, time } = formatTimestamp(record.timestamp)
                  return (
                    <div key={record.id!} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {record.action_type === "sign_in" ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                              Sign In
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                              Sign Out
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {date} at {time}
                            </span>
                          </div>
                          {record.ip_address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{record.ip_address}</span>
                            </div>
                          )}
                          {record.device_info && (
                            <div className="flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              <span>{record.device_info}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {records.length === 0 && employeeId && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No records found for "{employeeId}"</p>
              <p className="text-sm">Make sure you entered the correct name or employee ID</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
