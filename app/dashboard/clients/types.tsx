export type ClientStatus = "done" | "paused" | "not_started";

export const statusNameMap: Record<ClientStatus, string> = {
  done: "اتمام یافته",
  paused: "نیاز به پیگیری",
  not_started: "انجام نشده",
};

export type Client = {
  id: number;
  name: string;
  phone: string;
  org_name: string;
  status: ClientStatus;
};
