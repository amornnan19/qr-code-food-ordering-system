import { $Enums } from "@/generated/prisma";

type OrderStatus = $Enums.OrderStatus;
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, CheckCircle, Utensils, XCircle } from "lucide-react";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig = {
  'PENDING': {
    label: "รอดำเนินการ",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-yellow-600",
  },
  'CONFIRMED': {
    label: "ยืนยันแล้ว",
    variant: "default" as const,
    icon: CheckCircle,
    color: "text-blue-600",
  },
  'PREPARING': {
    label: "กำลังเตรียม",
    variant: "default" as const,
    icon: ChefHat,
    color: "text-orange-600",
  },
  'READY': {
    label: "พร้อมเสิร์ฟ",
    variant: "default" as const,
    icon: Utensils,
    color: "text-green-600",
  },
  'SERVED': {
    label: "เสิร์ฟแล้ว",
    variant: "outline" as const,
    icon: CheckCircle,
    color: "text-green-700",
  },
  'CANCELLED': {
    label: "ยกเลิก",
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-600",
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${className} flex items-center space-x-1`}
    >
      <Icon className={`h-3 w-3 ${config.color}`} />
      <span>{config.label}</span>
    </Badge>
  );
}
