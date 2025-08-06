import type { ChipProps } from "@heroui/react";

export type Status = "done" | "waiting" | "todo";

export const statusColorMap: Record<Status, ChipProps["color"]> = {
  done: "success",
  waiting: "warning",
  todo: "danger",
};

export const clientStatusNameMap: Record<Status, string> = {
  done: "اتمام یافته",
  waiting: "نیاز به پیگیری",
  todo: "انجام نشده",
};

export type ClientType = "company" | "personal";

export type Row = {
  id: number;
  type: ClientType;
  data: any;
  status: Status;
};

export type RowData = {
  id: number;
  name: string;
};
