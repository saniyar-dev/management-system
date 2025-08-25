"use client";
import type { Key, SVGProps } from "react";

import { useCallback } from "react";
import {
  TableColumn,
  TableHeader,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Chip,
  User,
  Spinner,
} from "@heroui/react";

import {
  ClientData,
  Status,
  clientStatusNameMap,
  statusColorMap,
  statusOptions,
} from "./types";
import { AddClientButtonComponent } from "./addClient";
import { ViewClientComponent } from "./viewClient";
import { EditClientComponent } from "./editClient";
import { DeleteClientComponent } from "./deleteClient";


import { Row } from "@/lib/types";
import { GetClients, GetTotalClients } from "@/lib/action/client";
import { useTableLogic } from "@/lib/hooks";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

type ColumnUID = keyof ClientData | "status" | "actions";

const columns: Array<{
  name: string;
  uid: ColumnUID;
  sortable?: boolean;
}> = [
  { name: "ID", uid: "id", sortable: true },
  { name: "نام / نام شرکت", uid: "name", sortable: true },
  { name: "کد ملی / شناسه ملی", uid: "ssn", sortable: true },
  { name: "شماره موبایل", uid: "phone" },
  { name: "استان", uid: "county", sortable: true },
  { name: "شهرستان / بخش", uid: "town" },
  { name: "آدرس", uid: "address" },
  { name: "کد پستی", uid: "postal_code" },
  { name: "وضعیت", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS: Array<ColumnUID> = [
  "name",
  "ssn",
  "phone",
  "county",
  "town",
  "status",
  "actions",
];

export default function ClientsPage() {
  const {
    bottomContent,
    topContent,
    sortDescriptor,
    setSortDescriptor,
    headerColumns,
    pending,
    sortedItems,
  } = useTableLogic(
    statusOptions,
    columns,
    INITIAL_VISIBLE_COLUMNS,
    GetClients,
    GetTotalClients,
    AddClientButtonComponent,
  );

  const renderCell = useCallback(
    (row: Row<ClientData, Status>, columnKey: Key) => {
      switch (columnKey) {
        case "name":
          return <User name={row.data.name} />;
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[row.status]}
              size="sm"
              variant="flat"
            >
              {clientStatusNameMap[row.status]}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-4 justify-center">
              <Tooltip content="مشاهده جزئیات">
                <ViewClientComponent entity={row} />
              </Tooltip>
              <Tooltip content="ویرایش مشتری">
                <EditClientComponent entity={row} />
              </Tooltip>
              <Tooltip color="danger" content="حذف مشتری">
                <DeleteClientComponent entity={row} />
              </Tooltip>
            </div>
          );
        default:
          return row.data[columnKey as keyof ClientData];
      }
    },
    [],
  );

  return (
    <Table
      isHeaderSticky
      aria-label="Clients table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[520px]",
      }}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={
          pending ? (
            <Spinner color="default" size="md" />
          ) : (
            "هیچ نتیجه‌ای یافت نشد"
          )
        }
        items={sortedItems}
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
