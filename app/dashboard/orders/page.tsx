"use client";
import type { Key } from "react";

import { useCallback } from "react";
import {
  TableColumn,
  TableHeader,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  Tooltip,
} from "@heroui/react";

import {
  OrderData,
  statusColorMap,
  orderStatusNameMap,
  statusOptions,
  Status,
} from "./types";

import { Row } from "@/lib/types";
import { GetOrders, GetTotalOrders } from "@/lib/action/order";
import { useTableLogic } from "@/lib/hooks";
import { DeleteIcon, EditIcon, EyeIcon } from "@/components/icons";

type ColumnUID = keyof OrderData | "status" | "actions";

const columns: Array<{
  name: string;
  uid: ColumnUID;
  sortable?: boolean;
}> = [
  { name: "نام مشتری", uid: "client_name", sortable: true },
  { name: "شرح سفارش", uid: "description", sortable: true },
  { name: "مبلغ کل", uid: "total_amount", sortable: true },
  { name: "تاریخ ایجاد", uid: "created_at", sortable: true },
  { name: "وضعیت", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS: Array<ColumnUID> = [
  "client_name",
  "description",
  "total_amount",
  "created_at",
  "status",
  "actions",
];

export default function OrdersPage() {
  const {
    bottomContent,
    topContent,
    sortDescriptor,
    setSortDescriptor,
    headerColumns,
    pending,
    sortedItems,
  } = useTableLogic<OrderData, Status>(
    statusOptions,
    columns,
    INITIAL_VISIBLE_COLUMNS,
    GetOrders,
    GetTotalOrders,
    () => <></>,
  );

  // Custom renderCell function for orders
  const renderCell = useCallback(
    (item: Row<OrderData, Status>, columnKey: Key) => {
      switch (columnKey) {
        case "client_name":
          return <span className="font-medium">{item.data.client_name}</span>;
        case "description":
          return (
            <div className="max-w-xs truncate" title={item.data.description}>
              {item.data.description}
            </div>
          );
        case "total_amount":
          return (
            <span className="font-mono">
              {new Intl.NumberFormat("fa-IR").format(item.data.total_amount)}{" "}
              ریال
            </span>
          );
        case "created_at":
          return new Date(item.data.created_at).toLocaleDateString("fa-IR");
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[item.status]}
              size="sm"
              variant="flat"
            >
              {orderStatusNameMap[item.status]}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-4 justify-center">
              <Tooltip content="مشاهده جزئیات">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EyeIcon />
                </span>
              </Tooltip>
              <Tooltip content="ویرایش">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="حذف">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return item.data[columnKey as keyof OrderData];
      }
    },
    [],
  );

  return (
    <Table
      isHeaderSticky
      aria-label="Orders table"
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
            "هیچ سفارشی یافت نشد"
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
