"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QRCodeDisplayProps {
  qrCodeImage: string;
  qrCode: any;
  modeInfo: {
    mode: string;
    label: string;
    color: string;
  };
  size?: number
}

export function QRCodeDisplay({ qrCode, qrCodeImage, modeInfo, size = 200 }: QRCodeDisplayProps) {
  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Badge className={modeInfo.color}>{modeInfo.label}</Badge>
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
            <img src={qrCodeImage} alt="QR Code" width={size} height={size} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-mono text-muted-foreground">{qrCode?.code}</p>
          <p className="text-xs text-muted-foreground">
            Scan this code to {modeInfo.mode === "sign_in" ? "sign in" : modeInfo.mode === "sign_out" ? "sign out" : "access system"}
          </p>
        </div>
      </div>
    </Card>
  )
}