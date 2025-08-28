
import { NextResponse } from "next/server";
import { createWeeklyQRCode, getCurrentQRCode } from "@/lib/database";
import QRCode from "qrcode";
import { createCanvas, loadImage } from 'canvas';

export async function GET() {
  try {
    const qrCodeValidationResult = await getCurrentQRCode(); // Renamed for clarity

    // Always try to generate QR code image if qrCode object is present in validation result
        if ("qrCode" in qrCodeValidationResult && qrCodeValidationResult.qrCode) {
      const qrCode = qrCodeValidationResult.qrCode; // Use the qrCode object directly
      const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/employee/${qrCode.code}`;
      const qrCodeImageBase = await QRCode.toDataURL(qrCodeUrl, {
        width: 1024,
        margin: 2,
      });
      console.log("API GET /api/qr: qrCodeImage generated"); // Added log

      // Draw name on QR code
      const canvas = createCanvas(1024, 1024);
      const ctx = canvas.getContext('2d');
      const img = await loadImage(qrCodeImageBase);
      ctx.drawImage(img, 0, 0, 1024, 1024);

      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(qrCode.name, 512, 980); // Position text at the bottom

      const qrCodeImage = canvas.toDataURL('image/png'); // New image with name

      return NextResponse.json({
        qrCode: qrCode, // Pass the qrCode object directly
        qrCodeImage,
        mode: qrCodeValidationResult.mode,
        valid: qrCodeValidationResult.valid,
        message: qrCodeValidationResult.message,
      });
    } else {
      console.log("API GET /api/qr: No active QR code found in getCurrentQRCode"); // Added log
      return NextResponse.json(
        { qrCode: null, qrCodeImage: null, mode: null, valid: false, message: "No active QR code found" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error getting QR code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
