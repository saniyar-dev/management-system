import { ClientType, Row, RowData, Status } from "../types";

export type ServerActionState<T> = {
  message: string;
  success: boolean;
  data?: T;
};

export type GetRowsFn<T extends RowData> = (
  start: number,
  end: number,
  clientType: ClientType,
  status: Status,
  searchTerm: string,
) => Promise<ServerActionState<(Row<T> | null)[]>>;
