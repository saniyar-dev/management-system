import { Row, RowData } from "../types";

export type ServerActionState<T> = {
  message: string;
  success: boolean;
  data?: T;
};

export type GetRowsFn<T extends RowData, S> = (
  start: number,
  end: number,
  // we should narrow types later:
  // clientType: ["all"] | ClientType[],
  // status: ["all"] | Status[],
  clientType: string[],
  status: string[],
  searchTerm: string,
  limit: number,
  page: number,
) => Promise<ServerActionState<(Row<T, S> | null)[]>>;

export type GetTotalRowsFn = (
  clientType: string[],
  status: string[],
  searchTerm: string,
) => Promise<ServerActionState<number | null>>;
