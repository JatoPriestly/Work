"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, User, CheckCircle, XCircle } from "lucide-react"
import { getAllEmployees } from "@/lib/database"
import { Employee } from "@/lib/types";

interface QuickSignInProps {
  mode: "sign_in" | "sign_out"
}

export function QuickSignIn({ mode }: QuickSignInProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredEmployees(filtered)
    } else {
      setFilteredEmployees(employees)
    }
  }, [searchTerm, employees])

  const loadEmployees = async () => {
    try {
      const data = await getAllEmployees()
      setEmployees(data)
      setFilteredEmployees(data)
    } catch (error) {
      console.error("[v0] Failed to load employees:", error)
    }
  }

  const handleSignInOut = async () => {
    if (!selectedEmployee) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          employee_id: selectedEmployee.id!,
          actionType: mode,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setResult({
        success: true,
        message: `Successfully ${mode === "sign_in" ? "signed in" : "signed out"} ${selectedEmployee.name}`,
      })
    } catch (error) {
      console.error("[v0] Sign-in/out failed:", error)
      setResult({
        success: false,
        message: "Network error. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setSelectedEmployee(null)
    setResult(null)
    setSearchTerm("")
  }

  if (result) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {result.success ? (
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 mx-auto text-red-500" />
            )}
            <div>
              <h3 className={`text-lg font-semibold ${result.success ? "text-green-600" : "text-red-600"}`}>
                {result.success ? "Success!" : "Error"}
              </h3>
              <p className="text-muted-foreground">{result.message}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={resetForm} className="w-full">
                {mode === "sign_in" ? "Sign In Another Employee" : "Sign Out Another Employee"}
              </Button>
              <Button onClick={() => (window.location.href = "/employee")} variant="outline" className="w-full">
                Back to Jongo E-Auth
              </Button>
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
          <User className="h-5 w-5" />
          Quick {mode === "sign_in" ? "Sign-In" : "Sign-Out"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Employee List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <Button
                  key={employee.id!}
                  variant={selectedEmployee?.id === employee.id! ? "default" : "outline"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="text-left">
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.employee_id} • {employee.department || "No Department"}
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{searchTerm ? "No employees found" : "Loading employees..."}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {selectedEmployee && (
            <div className="space-y-4 pt-4 border-t">
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Selected: <strong>{selectedEmployee.name}</strong> ({selectedEmployee.employee_id})
                </AlertDescription>
              </Alert>

              <Button onClick={handleSignInOut} disabled={isProcessing} className="w-full" size="lg">
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>{mode === "sign_in" ? "Sign In" : "Sign Out"}</>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
