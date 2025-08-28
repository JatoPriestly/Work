"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileSpreadsheet, Calendar } from "lucide-react"
import { getSignInOutRecords } from "@/lib/database"

export function DataExport() {
  const [exportFormat, setExportFormat] = useState("excel")
  const [dateRange, setDateRange] = useState("all")
  const [includeFields, setIncludeFields] = useState({
    employee_info: true,
    timestamps: true,
    ip_addresses: true,
    device_info: true,
    qr_codes: true,
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Get filtered records based on date range
      let filters = {}
      const now = new Date()

      if (dateRange === "today") {
        const today = now.toISOString().split("T")[0]
        filters = { startDate: today, endDate: today }
      } else if (dateRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filters = { startDate: weekAgo.toISOString().split("T")[0] }
      } else if (dateRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filters = { startDate: monthAgo.toISOString().split("T")[0] }
      }

      const records = await getSignInOutRecords(filters)

      if (exportFormat === "excel") {
        await exportToExcel(records)
      } else {
        await exportToCSV(records)
      }

      console.log("[v0] Export completed successfully")
    } catch (error) {
      console.error("[v0] Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async (records: any[]) => {
    // Create Excel-compatible data
    const headers = []
    const data = []

    // Build headers based on selected fields
    if (includeFields.employee_info) {
      headers.push("Employee ID", "Employee Name")
    }
    headers.push("Action Type")
    if (includeFields.timestamps) {
      headers.push("Date", "Time")
    }
    if (includeFields.ip_addresses) {
      headers.push("IP Address")
    }
    if (includeFields.device_info) {
      headers.push("Device Info")
    }
    if (includeFields.qr_codes) {
      headers.push("QR Code")
    }

    // Add header row
    data.push(headers)

    // Add data rows
    records.forEach((record) => {
      const row = []
      if (includeFields.employee_info) {
        row.push(record.employee_id, record.employee_name)
      }
      row.push(record.action_type === "sign_in" ? "Sign In" : "Sign Out")
      if (includeFields.timestamps) {
        const date = new Date(record.timestamp)
        row.push(date.toLocaleDateString(), date.toLocaleTimeString())
      }
      if (includeFields.ip_addresses) {
        row.push(record.ip_address || "")
      }
      if (includeFields.device_info) {
        row.push(record.device_info || "")
      }
      if (includeFields.qr_codes) {
        row.push(record.qr_code)
      }
      data.push(row)
    })

    // Convert to CSV format (Excel can open CSV files)
    const csvContent = data.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `employee-records-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToCSV = async (records: any[]) => {
    // Same as Excel export since Excel can open CSV
    await exportToExcel(records)
  }

  const handleFieldToggle = (field: string, checked: boolean) => {
    setIncludeFields((prev) => ({ ...prev, [field]: checked }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Export employee sign-in/out records to Excel or CSV format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Settings */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (.csv)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Include Fields</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="employee_info"
                      checked={includeFields.employee_info}
                      onCheckedChange={(checked) => handleFieldToggle("employee_info", checked as boolean)}
                    />
                    <Label htmlFor="employee_info">Employee Information</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="timestamps"
                      checked={includeFields.timestamps}
                      onCheckedChange={(checked) => handleFieldToggle("timestamps", checked as boolean)}
                    />
                    <Label htmlFor="timestamps">Date & Time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ip_addresses"
                      checked={includeFields.ip_addresses}
                      onCheckedChange={(checked) => handleFieldToggle("ip_addresses", checked as boolean)}
                    />
                    <Label htmlFor="ip_addresses">IP Addresses</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="device_info"
                      checked={includeFields.device_info}
                      onCheckedChange={(checked) => handleFieldToggle("device_info", checked as boolean)}
                    />
                    <Label htmlFor="device_info">Device Information</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="qr_codes"
                      checked={includeFields.qr_codes}
                      onCheckedChange={(checked) => handleFieldToggle("qr_codes", checked as boolean)}
                    />
                    <Label htmlFor="qr_codes">QR Codes</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Preview */}
            <div className="space-y-4">
              <div>
                <Label>Export Preview</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <span className="font-medium">employee-records-{new Date().toISOString().split("T")[0]}.csv</span>
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Date Range: {dateRange === "all" ? "All records" : dateRange}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fields: </span>
                      {Object.entries(includeFields)
                        .filter(([_, included]) => included)
                        .map(([field, _]) => field.replace("_", " "))
                        .join(", ")}
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleExport} disabled={isExporting} className="w-full">
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>• Excel files will be saved as CSV format for compatibility</p>
                <p>• All timestamps are in local timezone</p>
                <p>• IP addresses are logged for security purposes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
