"use client";
import type { SVGProps } from "react";

import {
  TableColumn,
  TableHeader,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";

import { ClientData } from "./types";
import { AddClientComponent } from "./addClient";

import { GetClients } from "@/lib/action/client";
import { useTableLogic } from "@/lib/hooks";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

type ColumnUID = keyof ClientData | "status" | "actions";

export const columns: Array<{
  name: string;
  uid: ColumnUID;
  sortable?: boolean;
}> = [
  { name: "ID", uid: "id", sortable: true },
  { name: "نام / نام شرکت", uid: "name", sortable: true },
  { name: "کد ملی / شناسه ملی", uid: "ssn", sortable: true },
  { name: "شماره موبایل", uid: "phone" },
  { name: "آدرس", uid: "address" },
  { name: "کد پستی", uid: "postal_code" },
  { name: "وضعیت", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS: Array<ColumnUID> = [
  "name",
  "ssn",
  "phone",
  "address",
  "status",
  "actions",
];

export default function App() {
  const {
    bottomContent,
    topContent,
    sortDescriptor,
    setSortDescriptor,
    headerColumns,
    renderCell,
    pending,
    sortedItems,
  } = useTableLogic(
    columns,
    INITIAL_VISIBLE_COLUMNS,
    GetClients,
    AddClientComponent,
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
