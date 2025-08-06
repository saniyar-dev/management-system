import type { Selection, SortDescriptor } from "@heroui/react";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Key,
  ChangeEvent,
  useTransition,
} from "react";
import { Session } from "@supabase/supabase-js";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Tooltip,
  User,
} from "@heroui/react";

import { supabase } from "./utils";
import {
  clientStatusNameMap,
  ClientType,
  Row,
  RowData,
  Status,
  statusColorMap,
} from "./types";
import { ServerActionState } from "./action";

import {
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
  EyeIcon,
  SearchIcon,
} from "@/components/icons";

export const useSession = (): { session: Session | null; pending: boolean } => {
  const [session, setSession] = useState<Session | null>(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setPending(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Unsubscribe when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  return { session, pending };
};

export const statusOptions: Array<{ name: string; uid: Status }> = [
  { name: "اتمام یافته", uid: "done" },
  { name: "نیاز به پیگیری", uid: "waiting" },
  { name: "انجام نشده", uid: "todo" },
];

export const clientOptions: Array<{ name: string; uid: ClientType }> = [
  { name: "حقیقی", uid: "personal" },
  { name: "حقوقی", uid: "company" },
];

export const useTableLogic = <TD extends RowData>(
  columns: Array<{
    name: string;
    uid: Exclude<keyof TD, symbol> | "status" | "actions";
    sortable?: boolean;
  }>,
  INITIAL_VISIBLE_COLUMNS: Array<
    Exclude<keyof TD, symbol> | "status" | "actions"
  >,
  GetRows: (
    start: number,
    end: number,
  ) => Promise<ServerActionState<(Row | null)[]>>,
  AddButtonComponent: () => JSX.Element,
) => {
  const [rows, setrows] = useState<Row[]>([]);
  const [pending, startTransition] = useTransition();

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [clientTypeFilter, setClientTypeFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredrows = [...rows];

    if (hasSearchFilter) {
      filteredrows = filteredrows.filter(
        (client) =>
          client.data.name.toLowerCase().includes(filterValue.toLowerCase()),
        // find the specific company name or personal name
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredrows = filteredrows.filter((client) =>
        Array.from(statusFilter).includes(client.status),
      );
    }

    if (
      clientTypeFilter !== "all" &&
      Array.from(clientTypeFilter).length !== clientOptions.length
    ) {
      filteredrows = filteredrows.filter((client) =>
        Array.from(clientTypeFilter).includes(client.type),
      );
    }

    return filteredrows;
  }, [rows, filterValue, statusFilter, clientTypeFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  function persian_alphabetic_compare(s1: string, s2: string) {
    const persian_alphabet_fix_map: Record<string, number> = {
      ؤ: 1608.5,
      ئ: 1609.5,
      پ: 1577,
      ة: 1607.5,
      ژ: 1586.5,
      ک: 1603,
      چ: 1580.5,
      گ: 1603.5,
      ی: 1610,
    };

    function compare_char_at_index(a: string, b: string, i: number) {
      if (i >= a.length && i >= b.length) return 0;
      if (i >= a.length) return -1;
      if (i >= b.length) return 1;

      const cmp_value =
        (persian_alphabet_fix_map[a[i]] || a.charCodeAt(i)) -
        (persian_alphabet_fix_map[b[i]] || b.charCodeAt(i));

      if (!cmp_value) return compare_char_at_index(a, b, i + 1);

      return cmp_value;
    }

    return compare_char_at_index(s1, s2, 0);
  }

  const sortedItems = useMemo(() => {
    switch (sortDescriptor.column) {
      case "status":
        return [...items].sort((a: Row, b: Row) => {
          const first = a[sortDescriptor.column as keyof Row] as string;
          const second = b[sortDescriptor.column as keyof Row] as string;

          let cmp = 0;

          if (first !== undefined && second !== undefined) {
            cmp = persian_alphabetic_compare(first, second);
          }

          return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
      default:
        return [...items].sort((a: Row, b: Row) => {
          const first = a.data[sortDescriptor.column as keyof TD] as string;
          const second = b.data[sortDescriptor.column as keyof TD] as string;

          let cmp = 0;

          if (first !== undefined && second !== undefined) {
            cmp = persian_alphabetic_compare(first, second);
          }

          return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }
  }, [sortDescriptor, items]);

  const renderCell = useCallback((client: Row, columnKey: Key) => {
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
        return client.data[columnKey as keyof TD];
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
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
            <AddButtonComponent />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            تعداد مشتری‌ها:‌ {rows.length}
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
    rows.length,
    hasSearchFilter,
  ]);

  const bottomContent = useMemo(() => {
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

  useEffect(() => {
    startTransition(async () => {
      const actionMsg = await GetRows(
        (page - 1) * rowsPerPage,
        page * rowsPerPage,
      );

      if (actionMsg.success && actionMsg.data) {
        const rows = actionMsg.data.filter((client) => client !== null);

        setrows(rows);

        return;
      }
      setrows([]);
    });
  }, [page]);

  return {
    bottomContent,
    topContent,
    sortDescriptor,
    setSortDescriptor,
    headerColumns,
    renderCell,
    pending,
    sortedItems,
  };
};
