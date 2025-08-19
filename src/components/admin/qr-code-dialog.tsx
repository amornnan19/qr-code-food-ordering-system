"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share, Copy, ExternalLink } from "lucide-react";
import { Table } from "@/types/database";

interface QRCodeDialogProps {
  table: Table | null;
  open: boolean;
  onClose: () => void;
}

export function QRCodeDialog({ table, open, onClose }: QRCodeDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (table && open) {
      generateQRCode();
    }
  }, [table, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateQRCode = async () => {
    if (!table) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        const error = await response.json();
        console.error("QR generation error:", error);
      }
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl || !table) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `table-${table.tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQR = async () => {
    if (!table) return;

    const tableUrl = `${window.location.origin}/table/${table.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Table ${table.tableNumber} - QR Code`,
          text: `Scan this QR code to order from Table ${table.tableNumber}`,
          url: tableUrl,
        });
      } catch (error) {
        // Fallback to copying URL
        copyURL();
      }
    } else {
      copyURL();
    }
  };

  const copyURL = () => {
    if (!table) return;

    const tableUrl = `${window.location.origin}/table/${table.id}`;
    navigator.clipboard
      .writeText(tableUrl)
      .then(() => {
        alert("Table URL copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy URL");
      });
  };

  const openTable = () => {
    if (!table) return;
    const tableUrl = `${window.location.origin}/table/${table.id}`;
    window.open(tableUrl, "_blank");
  };

  if (!table) return null;

  const tableUrl = `${window.location.origin}/table/${table.id}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            QR Code - Table {table.tableNumber}
            <Badge variant={table.isActive ? "default" : "secondary"}>
              {table.isActive ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Generating QR code...
                  </p>
                </div>
              ) : qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for Table ${table.tableNumber}`}
                  className="w-64 h-64"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Failed to generate QR code</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateQRCode}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table Info */}
          <div className="text-sm space-y-1">
            <p>
              <strong>Table:</strong> {table.tableNumber}
            </p>
            {table.location && (
              <p>
                <strong>Location:</strong> {table.location}
              </p>
            )}
            <p>
              <strong>URL:</strong>
            </p>
            <p className="text-xs text-muted-foreground break-all font-mono bg-gray-50 p-2 rounded">
              {tableUrl}
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              disabled={!qrCodeUrl}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={shareQR}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={copyURL}>
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </Button>
            <Button variant="outline" size="sm" onClick={openTable}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
