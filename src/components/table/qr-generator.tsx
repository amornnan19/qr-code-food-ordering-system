"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/types/database";
import { Download, RefreshCw } from "lucide-react";

interface QRGeneratorProps {
  table: Table;
  restaurantName: string;
}

export function QRGenerator({ table, restaurantName }: QRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [tableUrl, setTableUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: table.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();
      setQrCodeUrl(data.qrCodeUrl);
      setTableUrl(data.tableUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `table-${table.tableNumber}-qr.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Table {table.tableNumber} QR Code
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{restaurantName}</Badge>
            <Badge variant={table.isActive ? "default" : "secondary"}>
              {table.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={generateQR}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate QR Code
              </>
            )}
          </Button>

          {qrCodeUrl && (
            <Button
              variant="outline"
              onClick={downloadQR}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>

        {qrCodeUrl && (
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <Image
                src={qrCodeUrl}
                alt={`QR Code for Table ${table.tableNumber}`}
                width={256}
                height={256}
                className="border rounded-lg"
              />
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Table:</strong> {table.tableNumber}
              </p>
              <p>
                <strong>Seats:</strong> {table.seats}
              </p>
              <p>
                <strong>URL:</strong>{" "}
                <code className="bg-muted px-1 rounded">{tableUrl}</code>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
