import { ChipProps } from "@heroui/react";
import { RowData } from "@/lib/types";

export type Status = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export const orderStatusNameMap: Record<Status, string> = {
  pending: "در انتظار تایید",
  confirmed: "تایید شده",
  in_progress: "در حال انجام",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

export type OrderData = RowData & {
  name: string;
  client_name: string;
  description: string;
  total_amount: number;
  created_at: string;
  client_id: number;
  pre_order_id?: number;
};

export const statusColorMap: Record<Status, ChipProps["color"]> = {
  pending: "warning",
  confirmed: "primary",
  in_progress: "secondary",
  completed: "success",
  cancelled: "danger",
};

export const statusOptions: Array<{ name: string; uid: Status }> = [
  { name: "در انتظار تایید", uid: "pending" },
  { name: "تایید شده", uid: "confirmed" },
  { name: "در حال انجام", uid: "in_progress" },
  { name: "تکمیل شده", uid: "completed" },
  { name: "لغو شده", uid: "cancelled" },
];