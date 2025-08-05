import { ChipProps } from "@heroui/react";

export type Status = "done" | "waiting" | "todo";

export const clientStatusNameMap: Record<Status, string> = {
  done: "اتمام یافته",
  waiting: "نیاز به پیگیری",
  todo: "انجام نشده",
};

export type ClientData = {
  id: number;
  name: string;
  ssn: string;
  phone: string;
  address: string;
  postal_code: string;
};

export type ClientType = "company" | "personal";

export type ClientRender = {
  id: number;
  type: ClientType;
  data: ClientData;
  status: Status;
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
