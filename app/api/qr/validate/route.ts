import { type NextRequest, NextResponse } from "next/server";
import { validateQRCode } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scannedCode } = body;

    if (!scannedCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 });
    }

    const validation = await validateQRCode(scannedCode);

    const clientIP = request.headers.get('x-forwarded-for') || "Unknown";
    console.log(
      `[v0] QR validation attempt from ${clientIP}: ${
        validation.valid ? "SUCCESS" : "FAILED"
      }`
    );

    return NextResponse.json({
      isValid: validation.valid,
      mode: "mode" in validation ? validation.mode : null,
      error: validation.message,
      qrCode: "qrCode" in validation ? validation.qrCode : null,
    });
  } catch (error) {
    console.error("[v0] QR validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
