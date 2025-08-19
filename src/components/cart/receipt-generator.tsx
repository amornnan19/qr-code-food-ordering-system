"use client";

import { useCart } from "@/context/cart-context";
import { Restaurant, Table } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, Share } from "lucide-react";

interface ReceiptGeneratorProps {
  restaurant: Restaurant;
  table: Table;
  customerName?: string;
  orderId?: string;
}

export function ReceiptGenerator({
  restaurant,
  table,
  customerName, // eslint-disable-line @typescript-eslint/no-unused-vars
  orderId,
}: ReceiptGeneratorProps) {
  const { getCartSummary } = useCart();
  const cartSummary = getCartSummary();

  const generateReceiptContent = (forCustomer?: string) => {
    const items = forCustomer
      ? cartSummary.customerGroups[forCustomer] || []
      : cartSummary.items;

    const total = items.reduce(
      (sum, item) => sum + item.quantity * Number(item.menu.price),
      0,
    );

    const receiptDate = new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
==========================================
           ${restaurant.name}
==========================================
${restaurant.address}
Tel: ${restaurant.phone}
${restaurant.email ? `Email: ${restaurant.email}` : ""}

------------------------------------------
วันที่: ${receiptDate}
โต๊ะ: ${table.tableNumber}
${orderId ? `Order: ${orderId}` : ""}
${forCustomer ? `ลูกค้า: ${forCustomer}` : "ใบเสร็จรวม"}
------------------------------------------

รายการสั่งซื้อ:
${items
  .map(
    (item) =>
      `${item.menu.name.padEnd(20)} x${item.quantity}\n` +
      `${item.notes ? `  หมายเหตุ: ${item.notes}\n` : ""}` +
      `  ฿${item.menu.price} x ${item.quantity} = ฿${(Number(item.menu.price) * item.quantity).toFixed(2)}\n`,
  )
  .join("")}
------------------------------------------
รวม: ฿${total.toFixed(2)}
------------------------------------------

${
  !forCustomer
    ? `
แยกตามลูกค้า:
${Object.keys(cartSummary.customerGroups)
  .map((name) => {
    const customerTotal = cartSummary.customerGroups[name].reduce(
      (sum, item) => sum + item.quantity * Number(item.menu.price),
      0,
    );
    return `${name}: ฿${customerTotal.toFixed(2)}`;
  })
  .join("\n")}

รวมทั้งหมด: ฿${cartSummary.totalAmount.toFixed(2)}
`
    : ""
}

ขอบคุณที่ใช้บริการ
==========================================
    `.trim();
  };

  const downloadReceipt = (forCustomer?: string) => {
    const content = generateReceiptContent(forCustomer);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${forCustomer || "all"}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReceipt = (forCustomer?: string) => {
    const content = generateReceiptContent(forCustomer);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${forCustomer || "All"}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                line-height: 1.4;
                max-width: 300px;
                margin: 0 auto;
                padding: 20px;
              }
              pre { 
                white-space: pre-wrap; 
                margin: 0;
              }
            </style>
          </head>
          <body>
            <pre>${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const shareReceipt = async (forCustomer?: string) => {
    const content = generateReceiptContent(forCustomer);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ใบเสร็จ - ${restaurant.name}`,
          text: content,
        });
      } catch {
        // Fallback to copying to clipboard
        copyToClipboard(content);
      }
    } else {
      copyToClipboard(content);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("คัดลอกใบเสร็จแล้ว!");
      })
      .catch(() => {
        alert("ไม่สามารถคัดลอกได้");
      });
  };

  if (cartSummary.totalItems === 0) {
    return null;
  }

  const customerNames = Object.keys(cartSummary.customerGroups);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">พิมพ์ใบเสร็จ</h3>

      {/* Full Receipt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ใบเสร็จรวม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadReceipt()}
            >
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลด
            </Button>
            <Button variant="outline" size="sm" onClick={() => printReceipt()}>
              <Printer className="mr-2 h-4 w-4" />
              พิมพ์
            </Button>
            <Button variant="outline" size="sm" onClick={() => shareReceipt()}>
              <Share className="mr-2 h-4 w-4" />
              แชร์
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Receipts */}
      {customerNames.length > 1 && (
        <div className="space-y-3">
          <h4 className="font-medium">ใบเสร็จรายบุคคล</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {customerNames.map((customerName) => {
              const customerTotal = cartSummary.customerGroups[
                customerName
              ].reduce(
                (sum, item) => sum + item.quantity * Number(item.menu.price),
                0,
              );

              return (
                <Card key={customerName}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      {customerName}
                      <span className="text-xs text-muted-foreground">
                        ฿{customerTotal.toFixed(2)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => downloadReceipt(customerName)}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        ดาวน์โหลด
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => printReceipt(customerName)}
                      >
                        <Printer className="mr-1 h-3 w-3" />
                        พิมพ์
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => shareReceipt(customerName)}
                      >
                        <Share className="mr-1 h-3 w-3" />
                        แชร์
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
