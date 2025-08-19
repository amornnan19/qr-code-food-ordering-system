"use client";

import { useState, useEffect } from "react";
import { OrderWithItems } from "@/types/database";
import { useSession } from "@/components/table/table-session-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Calculator } from "lucide-react";

interface BillSplittingProps {
  restaurantId: string;
  tableId: string;
}

export function BillSplitting({ restaurantId, tableId }: BillSplittingProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const { sessionId } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [splitMethod, setSplitMethod] = useState<"auto" | "manual" | "equal">(
    "auto",
  );

  // Fetch orders for this table
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams({
          restaurantId,
          tableId,
          status: "SERVED", // Only get served orders for bill calculation
        });
        if (sessionId) params.append("sessionId", sessionId);
        const response = await fetch(`/api/orders?${params}`);

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [restaurantId, tableId, sessionId]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading bill information...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>ไม่มีรายการอาหารที่เสิร์ฟแล้ว</p>
        <p className="text-sm mt-2">
          เมื่อมีการเสิร์ฟอาหารแล้ว บิลจะแสดงที่นี่
        </p>
      </div>
    );
  }

  // Group served orders by customer name
  const customerGroups: Record<string, OrderWithItems[]> = {};
  let totalAmount = 0;

  orders.forEach((order) => {
    const customerName = order.customerName || "ไม่ระบุชื่อ";
    if (!customerGroups[customerName]) {
      customerGroups[customerName] = [];
    }
    customerGroups[customerName].push(order);
    totalAmount += Number(order.totalAmount);
  });

  const customerNames = Object.keys(customerGroups);

  // Calculate totals with adjustments
  const getCustomerTotal = (customerName: string): number => {
    const baseTotal = customerGroups[customerName].reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const adjustment = adjustments[customerName] || 0;
    return Math.max(0, baseTotal + adjustment);
  };

  const getEqualSplitAmount = (): number => {
    return totalAmount / customerNames.length;
  };

  const getTotalWithAdjustments = (): number => {
    if (splitMethod === "equal") {
      return totalAmount;
    }
    return customerNames.reduce((sum, name) => sum + getCustomerTotal(name), 0);
  };

  const addAdjustment = (customerName: string, amount: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [customerName]: (prev[customerName] || 0) + amount,
    }));
  };

  const resetAdjustments = () => {
    setAdjustments({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center">
          <Users className="mr-2 h-5 w-5" />
          แยกบิล
        </h3>
        <div className="flex items-center space-x-2">
          <Label htmlFor="split-method" className="text-sm">
            วิธีแยก:
          </Label>
          <Select
            value={splitMethod}
            onValueChange={(value: "auto" | "manual" | "equal") =>
              setSplitMethod(value)
            }
          >
            <SelectTrigger className="w-32" id="split-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">ตามรายการ</SelectItem>
              <SelectItem value="manual">ปรับเอง</SelectItem>
              <SelectItem value="equal">หารเท่ากัน</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Split by Items (Auto) */}
      {splitMethod === "auto" && (
        <div className="grid gap-4 md:grid-cols-2">
          {customerNames.map((customerName) => {
            const customerOrders = customerGroups[customerName];
            const customerTotal = getCustomerTotal(customerName);

            return (
              <Card key={customerName}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    {customerName}
                    <Badge variant="outline">฿{customerTotal.toFixed(2)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customerOrders.map((order) =>
                    order.orderItems.map((item) => (
                      <div
                        key={`${order.id}-${item.id}`}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.menu.name} x{item.quantity}
                        </span>
                        <span>
                          ฿{(item.quantity * Number(item.price)).toFixed(2)}
                        </span>
                      </div>
                    )),
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Manual Adjustments */}
      {splitMethod === "manual" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {customerNames.map((customerName) => {
              const baseTotal = customerGroups[customerName].reduce(
                (sum, order) => sum + Number(order.totalAmount),
                0,
              );
              const adjustment = adjustments[customerName] || 0;
              const finalTotal = getCustomerTotal(customerName);

              return (
                <Card key={customerName}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{customerName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>ยอดตามรายการ:</span>
                        <span>฿{baseTotal.toFixed(2)}</span>
                      </div>
                      {adjustment !== 0 && (
                        <div className="flex justify-between">
                          <span>ปรับเพิ่ม/ลด:</span>
                          <span
                            className={
                              adjustment > 0 ? "text-red-600" : "text-green-600"
                            }
                          >
                            {adjustment > 0 ? "+" : ""}฿{adjustment.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>รวม:</span>
                        <span>฿{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAdjustment(customerName, -10)}
                      >
                        -฿10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAdjustment(customerName, 10)}
                      >
                        +฿10
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="ปรับเพิ่ม/ลด"
                        className="flex-1"
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          setAdjustments((prev) => ({
                            ...prev,
                            [customerName]: amount,
                          }));
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={resetAdjustments}>
              <Calculator className="mr-2 h-4 w-4" />
              รีเซ็ตการปรับแต่ง
            </Button>
          </div>
        </div>
      )}

      {/* Equal Split */}
      {splitMethod === "equal" && (
        <div className="grid gap-4 md:grid-cols-2">
          {customerNames.map((customerName) => (
            <Card key={customerName}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {customerName}
                  <Badge variant="outline">
                    ฿{getEqualSplitAmount().toFixed(2)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  แยกเท่ากัน {customerNames.length} คน
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>ยอดรวมต้นฉบับ:</span>
              <span>฿{totalAmount.toFixed(2)}</span>
            </div>
            {splitMethod === "manual" &&
              getTotalWithAdjustments() !== totalAmount && (
                <div className="flex justify-between">
                  <span>ยอดหลังปรับแต่ง:</span>
                  <span>฿{getTotalWithAdjustments().toFixed(2)}</span>
                </div>
              )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>จำนวนคน:</span>
              <span>{customerNames.length} คน</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>จำนวนออเดอร์:</span>
              <span>{orders.length} ออเดอร์</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
