import { ViewFieldConfig, EditFieldConfig } from "../action/crud-types";
import { RowData } from "../types";

import {
  formatPersianCurrency,
  formatPersianDate,
  convertEnglishToPersian,
} from "./persian-validation";

// Field formatters for view components
export const fieldFormatters = {
  text: (value: any): string => {
    return value ? String(value) : "-";
  },

  number: (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue)) return "-";

    return convertEnglishToPersian(numValue.toString());
  },

  currency: (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue)) return "-";

    return formatPersianCurrency(numValue);
  },

  date: (value: any): string => {
    if (!value) return "-";
    try {
      return formatPersianDate(value);
    } catch {
      return "-";
    }
  },

  status: (value: any, statusMap?: Record<string, string>): string => {
    if (!value) return "-";

    return statusMap ? statusMap[value] || value : value;
  },
};

// Base field configurations for common entity fields
export const commonFieldConfigs = {
  // Common view field configurations
  viewFields: {
    id: {
      key: "id" as const,
      label: "شناسه",
      type: "text" as const,
      formatter: fieldFormatters.text,
    },
    name: {
      key: "name" as const,
      label: "نام",
      type: "text" as const,
      formatter: fieldFormatters.text,
    },
    phone: {
      key: "phone" as const,
      label: "شماره تماس",
      type: "text" as const,
      formatter: fieldFormatters.text,
    },
    address: {
      key: "address" as const,
      label: "آدرس",
      type: "text" as const,
      formatter: fieldFormatters.text,
    },
    ssn: {
      key: "ssn" as const,
      label: "کد ملی",
      type: "text" as const,
      formatter: fieldFormatters.text,
    },
    postal_code: {
      key: "postal_code" as const,
      label: "کد پستی",
      type: "text" as const,
      formatter: fieldFormatters.text,
    },
    created_at: {
      key: "created_at" as const,
      label: "تاریخ ایجاد",
      type: "date" as const,
      formatter: fieldFormatters.date,
    },
    updated_at: {
      key: "updated_at" as const,
      label: "تاریخ به‌روزرسانی",
      type: "date" as const,
      formatter: fieldFormatters.date,
    },
    total_amount: {
      key: "total_amount" as const,
      label: "مبلغ کل",
      type: "currency" as const,
      formatter: fieldFormatters.currency,
    },
    description: {
      key: "description" as const,
      label: "توضیحات",
      type: "text" as const,
      formatter: fieldFormatters.text,
    },
  },

  // Common edit field configurations
  editFields: {
    name: {
      key: "name" as const,
      label: "نام",
      type: "input" as const,
      required: true,
    },
    phone: {
      key: "phone" as const,
      label: "شماره تماس",
      type: "input" as const,
      required: true,
    },
    address: {
      key: "address" as const,
      label: "آدرس",
      type: "textarea" as const,
      required: true,
    },
    ssn: {
      key: "ssn" as const,
      label: "کد ملی",
      type: "input" as const,
      required: true,
    },
    postal_code: {
      key: "postal_code" as const,
      label: "کد پستی",
      type: "input" as const,
      required: true,
    },
    description: {
      key: "description" as const,
      label: "توضیحات",
      type: "textarea" as const,
      required: false,
    },
    total_amount: {
      key: "total_amount" as const,
      label: "مبلغ کل",
      type: "number" as const,
      required: true,
    },
  },
};

// Helper function to create view field configurations
export const createViewFieldConfig = <T extends RowData>(
  key: keyof T,
  label: string,
  type: ViewFieldConfig<T>["type"],
  formatter?: (value: any) => string,
): ViewFieldConfig<T> => ({
  key,
  label,
  type,
  formatter: formatter || fieldFormatters[type],
});

// Helper function to create edit field configurations
export const createEditFieldConfig = <T extends RowData>(
  key: keyof T,
  label: string,
  type: EditFieldConfig<T>["type"],
  required: boolean = false,
  validation?: (value: any) => string | null,
  options?: { value: string; label: string }[],
): EditFieldConfig<T> => ({
  key,
  label,
  type,
  required,
  validation,
  options,
});

// Status field configuration helper
export const createStatusFieldConfig = <T extends RowData>(
  statusMap: Record<string, string>,
): ViewFieldConfig<T> => ({
  key: "status" as keyof T,
  label: "وضعیت",
  type: "status",
  formatter: (value: any) => fieldFormatters.status(value, statusMap),
});

// Status edit field configuration helper
export const createStatusEditFieldConfig = <T extends RowData>(
  statusOptions: { value: string; label: string }[],
): EditFieldConfig<T> => ({
  key: "status" as keyof T,
  label: "وضعیت",
  type: "select",
  required: true,
  options: statusOptions,
});
