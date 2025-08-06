import type { ChipProps } from "@heroui/react";

export type Status = "done" | "waiting" | "todo";

export const statusColorMap: Record<Status, ChipProps["color"]> = {
  done: "success",
  waiting: "warning",
  todo: "danger",
};

export const rowStatusNameMap: Record<Status, string> = {
  done: "اتمام یافته",
  waiting: "نیاز به پیگیری",
  todo: "انجام نشده",
};

export const statusOptions: Array<{ name: string; uid: Status }> = [
  { name: "اتمام یافته", uid: "done" },
  { name: "نیاز به پیگیری", uid: "waiting" },
  { name: "انجام نشده", uid: "todo" },
];

export const rowOptions: Array<{ name: string; uid: ClientType }> = [
  { name: "حقیقی", uid: "personal" },
  { name: "حقوقی", uid: "company" },
];

export type ClientType = "company" | "personal";

export type Row<T extends RowData> = {
  id: number;
  type: ClientType;
  data: T;
  status: Status;
};

export type RowData = {
  id: number;
  name: string;
};
