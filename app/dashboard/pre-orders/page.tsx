"use client";
import type { Key, SVGProps } from "react";
import type { Status } from "./types";

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
  PreOrderData,
  statusColorMap,
  preOrderStatusNameMap,
  statusOptions,
} from "./types";
import { AddPreOrderComponent } from "./addPreOrder";

import { Row } from "@/lib/types";
import { GetPreOrders, GetTotalPreOrders } from "@/lib/action/pre-order";
import { useTableLogic } from "@/lib/hooks";
import { DeleteIcon, EditIcon, EyeIcon } from "@/components/icons";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

type ColumnUID = keyof PreOrderData | "status" | "actions";

const columns: Array<{
  name: string;
  uid: ColumnUID;
  sortable?: boolean;
}> = [
  { name: "ID", uid: "id", sortable: true },
  { name: "نام مشتری", uid: "client_name", sortable: true },
  { name: "شرح پیش سفارش", uid: "description", sortable: true },
  { name: "مبلغ تخمینی", uid: "estimated_amount", sortable: true },
  { name: "تاریخ ایجاد", uid: "created_at", sortable: true },
  { name: "وضعیت", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS: Array<ColumnUID> = [
  "client_name",
  "description",
  "estimated_amount",
  "created_at",
  "status",
  "actions",
];

export default function PreOrdersPage() {
  const {
    bottomContent,
    topContent,
    sortDescriptor,
    setSortDescriptor,
    headerColumns,
    pending,
    sortedItems,
  } = useTableLogic<PreOrderData, Status>(
    statusOptions,
    columns,
    INITIAL_VISIBLE_COLUMNS,
    GetPreOrders,
    GetTotalPreOrders,
    AddPreOrderComponent,
  );

  // Custom renderCell function for pre-orders
  const renderCell = (item: Row<PreOrderData, Status>, columnKey: Key) => {
    switch (columnKey) {
      case "client_name":
        return <span className="font-medium">{item.data.client_name}</span>;
      case "description":
        return (
          <div className="max-w-xs truncate" title={item.data.description}>
            {item.data.description}
          </div>
        );
      case "estimated_amount":
        return (
          <span className="font-mono">
            {new Intl.NumberFormat("fa-IR").format(item.data.estimated_amount)}{" "}
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
            {preOrderStatusNameMap[item.status]}
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
        return item.data[columnKey as keyof PreOrderData];
    }
  };

  return (
    <Table
      isHeaderSticky
      aria-label="Pre-orders table"
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
