"use client";

import { OrderWithItems } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "./order-status-badge";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/types/database";

interface OrderCardProps {
  order: OrderWithItems;
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus) => void;
  showControls?: boolean;
}

export function OrderCard({ 
  order, 
  onStatusUpdate, 
  showControls = false 
}: OrderCardProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(date));
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.CONFIRMED;
      case OrderStatus.CONFIRMED:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderStatus.SERVED;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return "ยืนยันออเดอร์";
      case OrderStatus.PREPARING:
        return "เริ่มทำอาหาร";
      case OrderStatus.READY:
        return "อาหารพร้อม";
      case OrderStatus.SERVED:
        return "เสิร์ฟแล้ว";
      default:
        return "อัพเดทสถานะ";
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {order.orderNumber}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Table {order.table.tableNumber}</Badge>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>เวลาสั่ง: {formatTime(order.createdAt)}</p>
          {order.customerName && <p>ลูกค้า: {order.customerName}</p>}
          {order.notes && <p>หมายเหตุ: {order.notes}</p>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">รายการอาหาร:</h4>
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-muted/30 rounded p-2">
              <div className="flex-1">
                <span className="font-medium">{item.menu.name}</span>
                {item.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    หมายเหตุ: {item.notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm">x{item.quantity}</span>
                <p className="text-xs text-muted-foreground">
                  ฿{item.price.toString()} each
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center font-medium">
          <span>รวม:</span>
          <span className="text-lg">฿{order.totalAmount.toString()}</span>
        </div>

        {/* Status Controls */}
        {showControls && onStatusUpdate && nextStatus && (
          <div className="pt-2">
            <Button 
              onClick={() => onStatusUpdate(order.id, nextStatus)}
              className="w-full"
              disabled={order.status === OrderStatus.SERVED || order.status === OrderStatus.CANCELLED}
            >
              {getStatusLabel(nextStatus)}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}