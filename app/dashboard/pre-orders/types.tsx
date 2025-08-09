import { ChipProps } from "@heroui/react";
import { ClientType, RowData } from "@/lib/types";

export type Status = "pending" | "approved" | "rejected" | "converted";

export const preOrderStatusNameMap: Record<Status, string> = {
  pending: "در انتظار بررسی",
  approved: "تایید شده",
  rejected: "رد شده",
  converted: "تبدیل به سفارش",
};

export type PreOrderData = RowData & {
  client_name: string;
  description: string;
  estimated_amount: number;
  created_at: string;
  client_id: number;
};

// export type PreOrderRender = {
//   id: number;
//   data: PreOrderData;
//   type: ClientType;
//   status: Status;
// };

export const statusColorMap: Record<Status, ChipProps["color"]> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  converted: "primary",
};