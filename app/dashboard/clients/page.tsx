"use client";
import type { Key, SVGProps } from "react";
import type { Selection, ChipProps, SortDescriptor } from "@heroui/react";

import React from "react";
import {
  Tooltip,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  TableColumn,
  TableHeader,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import {
  ClientData,
  ClientRender,
  ClientStatus,
  clientStatusNameMap,
  ClientType,
  Company,
  Person,
} from "./types";
import { AddClientComponent } from "./addClient";

import {
  ChevronDownIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  DeleteIcon,
} from "@/components/icons";

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

export const statusOptions: Array<{ name: string; uid: ClientStatus }> = [
  { name: "اتمام یافته", uid: "done" },
  { name: "نیاز به پیگیری", uid: "waiting" },
  { name: "انجام نشده", uid: "todo" },
];

const clientOptions: Array<{ name: string; uid: ClientType }> = [
  { name: "حقیقی", uid: "personal" },
  { name: "حقوقی", uid: "company" },
];

const persons: Array<Person> = [
  {
    id: 1,
    name: "اکبر مبرز",
    phone: "09900790244",
    ssn: "0312825706",
    address: "کیش ساختمان فناوری",
    postal_code: "448891102",
  },
  {
    id: 2,
    name: "سانیار کرمی",
    phone: "09900790244",
    ssn: "0312825706",
    address: "کیش نوبنیاد دو بیستون ۹",
    postal_code: "448891102",
  },
  {
    id: 3,
    name: "محمد قاآنی",
    phone: "09197893068",
    ssn: "0312825555",
    address: "کیش نوبنیاد دو بیستون ۱",
    postal_code: "448891107",
  },
];

const companies: Array<Company> = [
  {
    id: 1,
    name: "سیمان‌بان",
    ssn: "0061879460",
    address: "تهران خیابان آزادی",
    phone: "09126650997",
    postal_code: "7931790001",
  },
];

export const clients: Array<ClientRender> = [
  {
    id: 1,
    type: "personal",
    data: persons[1],
    status: "done",
  },
  {
    id: 2,
    type: "personal",
    data: persons[2],
    status: "waiting",
  },
  {
    id: 3,
    type: "company",
    data: companies[0],
    status: "todo",
  },
];

const statusColorMap: Record<ClientStatus, ChipProps["color"]> = {
  done: "success",
  waiting: "warning",
  todo: "danger",
};

const INITIAL_VISIBLE_COLUMNS: Array<ColumnUID> = [
  "name",
  "ssn",
  "phone",
  "address",
  "status",
  "actions",
];

export default function App() {
  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [clientTypeFilter, setClientTypeFilter] =
    React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredClients = [...clients];

    if (hasSearchFilter) {
      filteredClients = filteredClients.filter(
        (client) =>
          client.data.name.toLowerCase().includes(filterValue.toLowerCase()),
        // find the specific company name or personal name
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredClients = filteredClients.filter((client) =>
        Array.from(statusFilter).includes(client.status),
      );
    }

    if (
      clientTypeFilter !== "all" &&
      Array.from(clientTypeFilter).length !== clientOptions.length
    ) {
      filteredClients = filteredClients.filter((client) =>
        Array.from(clientTypeFilter).includes(client.type),
      );
    }

    return filteredClients;
  }, [clients, filterValue, statusFilter, clientTypeFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: ClientRender, b: ClientRender) => {
      const first = a[sortDescriptor.column as keyof ClientRender] as number;
      const second = b[sortDescriptor.column as keyof ClientRender] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback(
    (client: ClientRender, columnKey: Key) => {
      switch (columnKey) {
        case "name":
          return <User name={client.data.name} />;
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[client.status]}
              size="sm"
              variant="flat"
            >
              {clientStatusNameMap[client.status]}
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
          return client.data[columnKey as keyof ClientData];
      }
    },
    [],
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="اسم مورد نظر خودتو پیدا کن..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  مدل مشتری
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={clientTypeFilter}
                selectionMode="multiple"
                onSelectionChange={setClientTypeFilter}
              >
                {clientOptions.map((typeOption) => (
                  <DropdownItem key={typeOption.uid} className="capitalize">
                    {typeOption.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  وضعیت
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  ستون‌ها
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <AddClientComponent />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            تعداد مشتری‌ها:‌ {clients.length}
          </span>
          <label className="flex items-center text-default-400 text-small">
            تعداد مشتری‌ها در هر صفحه:
            <select
              className="bg-transparent outline-solid outline-transparent text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    clientTypeFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    clients.length,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            صفحه قبل
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            صفحه بعد
          </Button>
        </div>
      </div>
    );
  }, [items.length, page, pages, hasSearchFilter]);

  return (
    <Table
      isHeaderSticky
      aria-label="Clients table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
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
        emptyContent={"شما هیچ مشتری‌ای اضافه نکردید"}
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
