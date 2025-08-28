"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, QrCode, FileSpreadsheet, Activity, LogOut, Settings } from "lucide-react"
import { EmployeeManagement } from "@/components/employee-management"
import { QRCodeManagement } from "@/components/qr-code-management"
import { RecordsView } from "@/components/records-view"
import { DataExport } from "@/components/data-export"
import { SystemConfig } from "@/components/system-config"
import { getAllEmployees, getCurrentQRCode, getSignInOutRecords } from "@/lib/database"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todaySignIns: 0,
    activeQRCode: null as string | null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const employees = await getAllEmployees()
      const currentQR = await getCurrentQRCode()

      const today = new Date().toISOString().split("T")[0]
      const todayRecords = await getSignInOutRecords({
        startDate: today,
        endDate: today,
        actionType: "sign_in",
      })

      setStats({
        totalEmployees: employees.length,
        todaySignIns: todayRecords.length,
        activeQRCode: ('qrCode' in currentQR && currentQR.qrCode) ? currentQR.qrCode.code : null,
      })
    } catch (error) {
      console.error("[v0] Failed to load stats:", error)
    }
  }

  const handleLogout = () => {
    window.location.reload()
  }

  

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Jongo E-Auth</h1>
              <p className="text-muted-foreground">Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                System Active
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sign-ins</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaySignIns}</div>
              <p className="text-xs text-muted-foreground">Employees signed in today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active QR Code</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeQRCode || "None"}</div>
              <p className="text-xs text-muted-foreground">Current week's code</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="qr-codes" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Codes
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Records
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="qr-codes">
            <QRCodeManagement />
          </TabsContent>

          <TabsContent value="records">
            <RecordsView />
          </TabsContent>

          <TabsContent value="export">
            <DataExport />
          </TabsContent>

          <TabsContent value="settings">
            <SystemConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
