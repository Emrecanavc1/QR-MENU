"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import type { Table } from "@/types";

interface Props {
  open: boolean;
  table: Table & { location?: { name: string } | null };
  onClose: () => void;
}

export function QRModal({ open, table, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    const tenantSlug = localStorage.getItem("tenantSlug") ?? "demo";
    const url = `${appUrl}/${tenantSlug}/masa/${table.number}?t=${table.qrToken}`;

    QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 2,
      color: { dark: "#1f2937", light: "#ffffff" },
    }).then(() => {
      setQrDataUrl(canvasRef.current?.toDataURL("image/png") ?? "");
    });
  }, [open, table, appUrl]);

  if (!open) return null;

  function handleDownload() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `masa-${table.number}-qr.png`;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl text-center">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">QR Kod — Masa {table.number}</h2>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-white border border-gray-200 rounded-xl inline-block">
            <canvas ref={canvasRef} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{table.name ?? `Masa ${table.number}`}</p>
        {table.location && <p className="text-xs text-muted-foreground mb-4">{table.location.name}</p>}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Kapat</Button>
          <Button className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            PNG İndir
          </Button>
        </div>
      </div>
    </div>
  );
}
