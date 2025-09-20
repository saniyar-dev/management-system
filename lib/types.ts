export const rowOptions: Array<{ name: string; uid: ClientType }> = [
  { name: "حقیقی", uid: "personal" },
  { name: "حقوقی", uid: "company" },
];

export type ClientType = "company" | "personal";

export type Row<T extends RowData, S> = {
  id: string;
  type: ClientType;
  data: T;
  status: S;
  ownerId: string;
  isMutable: boolean;
};

export type RowData = {
  id: string;
  // name: string;
};

export type Job = {
  id: string;
  name: string;
  url: string;
  status: "pending" | "done" | "error";
};

export const jobStatusColorMap: Record<
  Job["status"],
  "warning" | "success" | "danger"
> = {
  pending: "warning",
  done: "success",
  error: "danger",
};

export type User = {
  id: string;
  name: string;
  email: string;
  permission_mask: 1 | 2 | 4 | 8;
};
