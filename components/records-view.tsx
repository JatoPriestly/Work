"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, MapPin } from "lucide-react"
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

export function RecordsView() {
  const [records, setRecords] = useState<EnrichedSignInOutRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<EnrichedSignInOutRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("today")

  useEffect(() => {
    loadRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, searchTerm, actionFilter, dateFilter])

  const loadRecords = async () => {
    try {
      const data = await getSignInOutRecords() as EnrichedSignInOutRecord[]
      setRecords(data)
      console.log("[v0] Loaded sign-in/out records:", data.length)
    } catch (error) {
      console.error("[v0] Failed to load records:", error)
    }
  }

  const filterRecords = () => {
    let filtered = [...records]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.employee_id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Action type filter
    if (actionFilter !== "all") {
      filtered = filtered.filter((record) => record.action_type === actionFilter)
    }

    // Date filter
    const now = new Date()
    if (dateFilter === "today") {
      const today = now.toISOString().split("T")[0]
      filtered = filtered.filter((record) => record.timestamp.startsWith(today))
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((record) => new Date(record.timestamp) >= weekAgo)
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((record) => new Date(record.timestamp) >= monthAgo)
    }

    setFilteredRecords(filtered)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getActionBadge = (action: string) => {
    if (action === "sign_in") {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Sign In</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Sign Out</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sign-In/Out Records</CardTitle>
          <CardDescription>View and filter employee attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <div className="min-w-[120px]">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="sign_in">Sign In</SelectItem>
                    <SelectItem value="sign_out">Sign Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[120px]">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>QR Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.filter(record => record.id).map((record) => (
                  <TableRow key={record.id!}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.employee_name}</div>
                        <div className="text-sm text-muted-foreground">{record.employee_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(record.action_type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatTimestamp(record.timestamp)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-mono">{record.ip_address || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{record.device_info || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{record.qr_code}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || actionFilter !== "all" || dateFilter !== "all"
                ? "No records found matching your filters."
                : "No sign-in/out records yet."}
            </div>
          )}

          {/* Summary */}
          {filteredRecords.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredRecords.length} of {records.length} records
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
