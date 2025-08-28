"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { validateQRCode, getAllEmployees, recordSignInOut } from "@/lib/database"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Employee } from "@/lib/types";

export default function ScanPage() {
  const { code } = useParams()
  const [validationResult, setValidationResult] = useState<any>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signInStatus, setSignInStatus] = useState<"success" | "error" | null>(null)
  const [signInMessage, setSignInMessage] = useState<string | null>(null)

  useEffect(() => {
    if (code) {
      const validate = async () => {
        const result = await validateQRCode(code as string)
        setValidationResult(result)
        if (result.valid) {
          const employeeList = await getAllEmployees()
          setEmployees(employeeList)
        }
      }
      validate()
    }
  }, [code])

  const handleSignIn = async () => {
    if (!selectedEmployee || !validationResult?.qrCode) return

    setIsSubmitting(true)
    try {
      await recordSignInOut({
                employee_id: selectedEmployee,
        qrCodeId: validationResult.qrCode.id,
        actionType: validationResult.mode,
      })
      setSignInStatus("success")
      setSignInMessage(`Successfully signed ${validationResult.mode === "sign_in" ? "in" : "out"}.`)
    } catch (error) {
      setSignInStatus("error")
      setSignInMessage("Failed to record sign-in. Please try again.")
      console.error("Sign-in error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!validationResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Validating QR code...</p>
        </div>
      </div>
    )
  }

  if (!validationResult.valid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Validation Failed</AlertTitle>
          <AlertDescription>{validationResult.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (signInStatus === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="default" className="max-w-md">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{signInMessage}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Jongo E-Auth - {validationResult.mode === "sign_in" ? "Sign In" : "Sign Out"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {signInStatus === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{signInMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="employee-select" className="text-sm font-medium">
              Select Your Name
            </label>
            <Select onValueChange={setSelectedEmployee} defaultValue={selectedEmployee || ""}>
              <SelectTrigger id="employee-select">
                <SelectValue placeholder="Select your name..." />
              </SelectTrigger>
              <SelectContent>
                {employees.filter(employee => employee.id).map((employee) => (
                  <SelectItem key={employee.id!} value={employee.id!}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSignIn} disabled={!selectedEmployee || isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : `Confirm ${validationResult.mode === "sign_in" ? "Sign In" : "Sign Out"}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}