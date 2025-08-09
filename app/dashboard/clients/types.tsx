import { ChipProps } from "@heroui/react";

import { ClientType, RowData } from "@/lib/types";

export type Status = "done" | "waiting" | "todo";

export const clientStatusNameMap: Record<Status, string> = {
  done: "اتمام یافته",
  waiting: "نیاز به پیگیری",
  todo: "انجام نشده",
};

export type ClientData = RowData & {
  name: string;
  ssn: string;
  phone: string;
  address: string;
  postal_code: string;
};

export type ClientJob = {
  id: number;
  name: string;
  url: string;
  status: Status;
  client_id: number;
};

export const statusColorMap: Record<Status, ChipProps["color"]> = {
  done: "success",
  waiting: "warning",
  todo: "danger",
};

export const statusOptions: Array<{ name: string; uid: Status }> = [
  { name: "انجام نشده", uid: "todo" },
  { name: "نیاز به پیگیری", uid: "waiting" },
  { name: "اتمام یافته", uid: "done" },
];