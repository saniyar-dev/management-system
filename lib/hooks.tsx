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

import { formatFilterParam, supabase } from "./utils";
import {
  Job,
  Row,
  RowData,
  rowOptions,
} from "./types";

import { GetRowsFn, GetTotalRowsFn } from "@/lib/action/type";
import {
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
  EyeIcon,
  SearchIcon,
} from "@/components/icons";
import { SubmitJobs } from "./action/jobs";

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

export const useTableLogic = <TD extends RowData, S extends string>(
  statusOptions: Array<{ name: string, uid: S }>,
  columns: Array<{
    name: string;
    uid: Exclude<keyof TD, symbol> | "status" | "actions";
    sortable?: boolean;
  }>,
  INITIAL_VISIBLE_COLUMNS: Array<
    Exclude<keyof TD, symbol> | "status" | "actions"
  >,
  GetRows: GetRowsFn<TD, S>,
  GetTotalRows: GetTotalRowsFn,
  AddButtonComponent: () => JSX.Element
) => {
  const [rows, setRows] = useState<Row<TD, S>[]>([]);
  const [pending, startTransition] = useTransition();
  const [pagePending, startPageTransition] = useTransition();

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowTypeFilter, setRowTypeFilter] = useState<Selection>("all");
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
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const [pages, setPages] = useState<number>(1);

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
        return [...rows].sort((a: Row<TD, S>, b: Row<TD, S>) => {
          const first = a[sortDescriptor.column as keyof Row<TD, S>] as string;
          const second = b[sortDescriptor.column as keyof Row<TD, S>] as string;

          let cmp = 0;

          if (first !== undefined && second !== undefined) {
            cmp = persian_alphabetic_compare(first, second);
          }

          return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
      default:
        return [...rows].sort((a: Row<TD, S>, b: Row<TD, S>) => {
          const first = a.data[sortDescriptor.column as keyof TD] as string;
          const second = b.data[sortDescriptor.column as keyof TD] as string;

          let cmp = 0;

          if (first !== undefined && second !== undefined) {
            cmp = persian_alphabetic_compare(first, second);
          }

          return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }
  }, [sortDescriptor, rows]);



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
    []
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
                selectedKeys={rowTypeFilter}
                selectionMode="multiple"
                onSelectionChange={setRowTypeFilter}
              >
                {rowOptions.map((typeOption) => (
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
            تعداد سطر‌ها:‌ {rows.length}
          </span>
          <label className="flex items-center text-default-400 text-small">
            تعداد سطر‌ها در هر صفحه:
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
    rowTypeFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    rows.length,
    hasSearchFilter,
  ]);

  const bottomContent = useMemo(() => {
    if (pages === 1 || pagePending) {
      return <></>;
    }

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
  }, [page, pages, pagePending]);

  useEffect(() => {
    setRows([]);

    startPageTransition(async () => {
      const actionMsg = await GetTotalRows(
        formatFilterParam(rowTypeFilter),
        formatFilterParam(statusFilter),
        filterValue
      );

      if (actionMsg.success && actionMsg.data) {
        setPages(Math.ceil(actionMsg.data / rowsPerPage));
      }
    });

    startTransition(async () => {
      const actionMsg = await GetRows(
        (page - 1) * rowsPerPage,
        page * rowsPerPage - 1,
        formatFilterParam(rowTypeFilter),
        formatFilterParam(statusFilter),
        filterValue,
        rowsPerPage,
        page
      );

      if (actionMsg.success && actionMsg.data) {
        const newRows = actionMsg.data.filter((row) => row !== null);

        setRows(newRows);

        return;
      }
      setRows([]);
    });
  }, [page, rowsPerPage, filterValue, statusFilter, rowTypeFilter]);

  return {
    bottomContent,
    topContent,
    sortDescriptor,
    setSortDescriptor,
    headerColumns,
    pending,
    sortedItems,
  };
};


export const useJobs = (entity: string, jobsToProceed: {url: string, name: string}[]): [Job[], pending: boolean, start: (entity_id: number) => void] => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [pending, startTransition] = useTransition()

  const start = useCallback((entity_id: number) => {
    if (!entity_id) {
      return
    }
    // Step 1: Submit jobs for execution (already implemented)
    startTransition(async () => {
      const { success, data: submitedJobs } = await SubmitJobs(entity, entity_id, jobsToProceed)
      if (success && submitedJobs) {
        setJobs(submitedJobs)
      }
    })

    // Step 2: Subscribe to n8n_jobs table with entity and entity_id filters
    const channel = supabase.channel(`jobs_${entity}_${entity_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'n8n_jobs',
        filter: `entity=eq.${entity} AND entity_id=eq.${entity_id}`
      }, (payload) => {
        // Update jobs state when a job is updated
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === payload.new.id ? { ...job, ...payload.new } : job
          )
        )
      })
      .subscribe()

    // Step 3: Cleanup subscription on useEffect return
    return () => {
      channel.unsubscribe()
    }
  }, [entity, jobsToProceed])

  return [jobs, pending, start]
}