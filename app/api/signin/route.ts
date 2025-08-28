import { type NextRequest, NextResponse } from "next/server";
import { recordSignInOut, getCurrentQRCode, getEmployeeById } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, actionType } = body;

    if (!employeeId || !actionType) {
      return NextResponse.json(
        { error: "Employee ID and action type are required" },
        { status: 400 }
      );
    }

    if (!["sign_in", "sign_out"].includes(actionType)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Validate employee
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Get current QR code
    const currentQR = await getCurrentQRCode();
    if (!currentQR.valid || !('qrCode' in currentQR) || !currentQR.qrCode) {
      return NextResponse.json({ error: currentQR.message || "Invalid QR code" }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || "Unknown";
    const deviceInfo = request.headers.get("user-agent") || "Unknown";

    // Record the sign-in/out
    await recordSignInOut({
      employee_id: employee.employee_id,
      qrCodeId: currentQR.qrCode.id!,
      actionType,
      ipAddress,
      deviceInfo,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${actionType === "sign_in" ? "signed in" : "signed out"}`,
    });
  } catch (error) {
    console.error("[v0] Sign-in/out error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
