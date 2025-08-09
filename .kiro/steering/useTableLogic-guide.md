# useTableLogic Hook - Complete Implementation Guide

## Overview

The `useTableLogic` hook is a comprehensive React hook designed for the Siman Ban dashboard that provides complete table functionality including pagination, filtering, sorting, and search capabilities. It's specifically optimized for Persian/RTL layouts and integrates seamlessly with HeroUI components and Supabase backend.

## What This Hook Handles

### Core Functionality
- **Data Fetching**: Manages async data loading from Supabase with proper error handling
- **Pagination**: Complete pagination logic with configurable page sizes
- **Filtering**: Multi-level filtering by status and client type
- **Search**: Real-time search functionality with Persian text support
- **Sorting**: Persian-aware alphabetical sorting for all columns
- **Loading States**: Proper loading indicators using React transitions
- **Column Visibility**: Dynamic column show/hide functionality
- **UI Components**: Pre-built top and bottom content for tables

### Persian-Specific Features
- **RTL Layout Support**: All UI elements are RTL-aware
- **Persian Sorting**: Custom alphabetical comparison for Persian characters
- **Persian Text**: All labels and messages in Persian
- **Persian Numbers**: Proper number formatting for Persian locale

## Type System

### Generic Parameters
```typescript
useTableLogic<TD extends RowData, S extends string>
```

- `TD`: Your data type that extends `RowData`
- `S`: Your status type (string union type)

### Required Types Structure

#### 1. Data Type (extends RowData)
```typescript
// Example from clients
export type ClientData = RowData & {
  name: string;
  ssn: string;
  phone: string;
  address: string;
  postal_code: string;
};

// RowData base type
export type RowData = {
  id: number;
  // name: string; // Optional but recommended
};
```

#### 2. Status Type
```typescript
// Example from pre-orders
export type Status = "pending" | "approved" | "rejected" | "converted";
```

#### 3. Status Configuration
```typescript
// Status display names
export const statusNameMap: Record<Status, string> = {
  pending: "در انتظار بررسی",
  approved: "تایید شده",
  rejected: "رد شده",
  converted: "تبدیل به سفارش",
};

// Status colors for chips
export const statusColorMap: Record<Status, ChipProps["color"]> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  converted: "primary",
};

// Status options for dropdown
export const statusOptions: Array<{ name: string; uid: Status }> = [
  { name: "در انتظار بررسی", uid: "pending" },
  { name: "تایید شده", uid: "approved" },
  { name: "رد شده", uid: "rejected" },
  { name: "تبدیل به سفارش", uid: "converted" },
];
```

## Required Parameters

### 1. statusOptions
Array of status options for the filter dropdown.
```typescript
statusOptions: Array<{name: string, uid: S}>
```

### 2. columns
Column configuration for the table.
```typescript
columns: Array<{
  name: string;
  uid: Exclude<keyof TD, symbol> | "status" | "actions";
  sortable?: boolean;
}>
```

### 3. INITIAL_VISIBLE_COLUMNS
Default visible columns when the table loads.
```typescript
INITIAL_VISIBLE_COLUMNS: Array<Exclude<keyof TD, symbol> | "status" | "actions">
```

### 4. GetRows Function
Server action to fetch paginated data.
```typescript
GetRows: GetRowsFn<TD, S>
```

### 5. GetTotalRows Function
Server action to get total count for pagination.
```typescript
GetTotalRows: GetTotalRowsFn
```

### 6. AddButtonComponent
Component for the "Add New" button.
```typescript
AddButtonComponent: () => JSX.Element
```

## Server Actions Requirements

### GetRowsFn Implementation
```typescript
export const GetYourData: GetRowsFn<YourDataType, YourStatusType> = async (
  start: number,
  end: number,
  clientType: string[],
  status: string[],
  searchTerm: string,
  limit: number,
  page: number,
) => {
  // Your Supabase query logic here
  // Must return: Promise<ServerActionState<(Row<YourDataType, YourStatusType> | null)[]>>
};
```

### GetTotalRowsFn Implementation
```typescript
export const GetTotalYourData: GetTotalRowsFn = async (
  clientType: string[],
  status: string[],
  searchTerm: string,
) => {
  // Your count query logic here
  // Must return: Promise<ServerActionState<number | null>>
};
```

## Complete Implementation Example

### Step 1: Create Types File
```typescript
// app/dashboard/your-entity/types.tsx
import { ChipProps } from "@heroui/react";
import { RowData } from "@/lib/types";

export type Status = "active" | "inactive" | "pending";

export type YourEntityData = RowData & {
  name: string;
  description: string;
  created_at: string;
  // Add your specific fields
};

export const statusNameMap: Record<Status, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  pending: "در انتظار",
};

export const statusColorMap: Record<Status, ChipProps["color"]> = {
  active: "success",
  inactive: "danger",
  pending: "warning",
};

export const statusOptions: Array<{ name: string; uid: Status }> = [
  { name: "فعال", uid: "active" },
  { name: "غیرفعال", uid: "inactive" },
  { name: "در انتظار", uid: "pending" },
];
```

### Step 2: Create Server Actions
```typescript
// lib/action/your-entity.ts
import { GetRowsFn, GetTotalRowsFn, ServerActionState } from "./type";
import { YourEntityData, Status } from "@/app/dashboard/your-entity/types";
import { supabase } from "../utils";

export const GetTotalYourEntities: GetTotalRowsFn = async (
  clientType,
  status,
  searchTerm,
) => {
  try {
    let query = supabase
      .from("your_table")
      .select("*", { count: "exact", head: true });

    // Apply filters
    if (status.length > 0 && !status.includes("all")) {
      query = query.in("status", status);
    }

    if (searchTerm && searchTerm.trim() !== "") {
      query = query.ilike("name", `%${searchTerm}%`);
    }

    const { count, error } = await query;

    if (error) {
      return {
        message: "خطا در دریافت تعداد رکوردها.",
        success: false,
      };
    }

    return {
      message: "تعداد رکوردها با موفقیت دریافت شد.",
      success: true,
      data: count || 0,
    };
  } catch (error) {
    return {
      message: "خطا در دریافت تعداد رکوردها.",
      success: false,
    };
  }
};

export const GetYourEntities: GetRowsFn<YourEntityData, Status> = async (
  start,
  end,
  clientType,
  status,
  searchTerm,
  limit,
  page,
) => {
  try {
    let query = supabase.from("your_table").select("*");

    // Apply filters
    if (status.length > 0 && !status.includes("all")) {
      query = query.in("status", status);
    }

    if (searchTerm && searchTerm.trim() !== "") {
      query = query.ilike("name", `%${searchTerm}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Ordering
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return {
        message: "خطا در دریافت داده‌ها.",
        success: false,
      };
    }

    const entities = data.map((item): Row<YourEntityData, Status> => ({
      id: item.id,
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
        created_at: item.created_at,
        // Map your fields
      },
      status: item.status as Status,
      type: item.type as ClientType,
    }));

    return {
      message: "داده‌ها با موفقیت دریافت شدند.",
      success: true,
      data: entities,
    };
  } catch (error) {
    return {
      message: "خطا در دریافت داده‌ها.",
      success: false,
    };
  }
};
```

### Step 3: Create Add Component
```typescript
// app/dashboard/your-entity/addYourEntity.tsx
"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
} from "@heroui/react";
import { PlusIcon } from "@/components/icons";

export function AddYourEntityComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // Your add logic here
      onOpenChange();
      window.location.reload();
    } catch (error) {
      console.error("خطا در ثبت:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button color="primary" endContent={<PlusIcon />} onPress={onOpen}>
        افزودن جدید
      </Button>
      <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form action={handleSubmit}>
              <ModalHeader>افزودن رکورد جدید</ModalHeader>
              <ModalBody>
                <Input
                  isRequired
                  label="نام"
                  name="name"
                  placeholder="نام را وارد کنید"
                />
                {/* Add your form fields */}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  لغو
                </Button>
                <Button color="primary" isLoading={isLoading} type="submit">
                  ثبت
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
```

### Step 4: Create Page Component
```typescript
// app/dashboard/your-entity/page.tsx
"use client";
import type { Key } from "react";
import { useCallback } from "react";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Spinner,
} from "@heroui/react";

import { YourEntityData, Status, statusNameMap, statusColorMap, statusOptions } from "./types";
import { Row } from "@/lib/types";
import { AddYourEntityComponent } from "./addYourEntity";
import { GetYourEntities, GetTotalYourEntities } from "@/lib/action/your-entity";
import { useTableLogic } from "@/lib/hooks";
import { DeleteIcon, EditIcon, EyeIcon } from "@/components/icons";

type ColumnUID = keyof YourEntityData | "status" | "actions";

export const columns: Array<{
  name: string;
  uid: ColumnUID;
  sortable?: boolean;
}> = [
  { name: "ID", uid: "id", sortable: true },
  { name: "نام", uid: "name", sortable: true },
  { name: "توضیحات", uid: "description", sortable: true },
  { name: "تاریخ ایجاد", uid: "created_at", sortable: true },
  { name: "وضعیت", uid: "status", sortable: true },
  { name: "عملیات", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS: Array<ColumnUID> = [
  "name",
  "description",
  "created_at",
  "status",
  "actions",
];

export default function YourEntityPage() {
  const {
    bottomContent,
    topContent,
    sortDescriptor,
    setSortDescriptor,
    headerColumns,
    pending,
    sortedItems,
  } = useTableLogic<YourEntityData, Status>(
    statusOptions,
    columns,
    INITIAL_VISIBLE_COLUMNS,
    GetYourEntities,
    GetTotalYourEntities,
    AddYourEntityComponent
  );

  const renderCell = useCallback((row: Row<YourEntityData, Status>, columnKey: Key) => {
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{row.data.name}</span>;
      case "description":
        return (
          <div className="max-w-xs truncate" title={row.data.description}>
            {row.data.description}
          </div>
        );
      case "created_at":
        return new Date(row.data.created_at).toLocaleDateString('fa-IR');
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[row.status]}
            size="sm"
            variant="flat"
          >
            {statusNameMap[row.status]}
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
        return row.data[columnKey as keyof YourEntityData];
    }
  }, []);

  return (
    <Table
      isHeaderSticky
      aria-label="Your entity table"
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
```

## Key Implementation Notes

### 1. Generic Type Usage
Always specify both generic types when using the hook:
```typescript
useTableLogic<YourDataType, YourStatusType>(...)
```

### 2. renderCell Function
- Must handle all column types including "status" and "actions"
- Use proper Persian formatting for dates and numbers
- Implement consistent action buttons with tooltips

### 3. Persian Considerations
- All text should be in Persian
- Use Persian date formatting: `toLocaleDateString('fa-IR')`
- Use Persian number formatting: `new Intl.NumberFormat('fa-IR')`
- Ensure RTL layout compatibility

### 4. Performance Optimization
- Use `useCallback` for renderCell to prevent unnecessary re-renders
- The hook uses `useTransition` for smooth loading states
- Pagination reduces data load

### 5. Error Handling
- Server actions must return proper `ServerActionState` objects
- Handle loading states appropriately
- Provide meaningful Persian error messages

## Common Patterns

### Status Chip Rendering
```typescript
case "status":
  return (
    <Chip
      className="capitalize"
      color={statusColorMap[row.status]}
      size="sm"
      variant="flat"
    >
      {statusNameMap[row.status]}
    </Chip>
  );
```

### Action Buttons
```typescript
case "actions":
  return (
    <div className="relative flex items-center gap-4 justify-center">
      <Tooltip content="مشاهده جزئیات">
        <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
          <EyeIcon />
        </span>
      </Tooltip>
      {/* More actions */}
    </div>
  );
```

### Date Formatting
```typescript
case "created_at":
  return new Date(row.data.created_at).toLocaleDateString('fa-IR');
```

This hook provides a complete, production-ready table solution for the Siman Ban dashboard with full Persian/RTL support and modern React patterns.