import { NextResponse } from "next/server";
import { deleteQRCode, toggleQRCodeStatus } from "@/lib/database";

export async function DELETE(request: Request, context: any) {
  try {
    const { id } = context.params;
    await deleteQRCode(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const { id } = context.params;
    const { currentStatus } = await request.json();
    await toggleQRCodeStatus(id, currentStatus);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling QR code status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}