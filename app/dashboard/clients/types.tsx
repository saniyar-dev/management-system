import { ChipProps } from "@heroui/react";

import { RowData } from "@/lib/types";

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
  county: string;
  town: string;
  address: string;
  postal_code: string;
  company_name: string;
  company_ssn: string;
  company_phone: string;
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
