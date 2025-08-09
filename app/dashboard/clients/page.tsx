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
  EyeIcon,
  EditIcon,
  DeleteIcon
} from "@/components/icons"

import { ClientData, Status, clientStatusNameMap, statusColorMap, statusOptions } from "./types";
import {Row} from "@/lib/types"
import { AddClientComponent } from "./addClient";

import { GetClients, GetTotalClients } from "@/lib/action/client";
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
    pending,
    sortedItems,
  } = useTableLogic(
    statusOptions,
    columns,
    INITIAL_VISIBLE_COLUMNS,
    GetClients,
    GetTotalClients,
    AddClientComponent
  );

  const renderCell = useCallback((row: Row<ClientData, Status>, columnKey: Key) => {
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
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return row.data[columnKey as keyof ClientData];
    }
  }, []);

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
