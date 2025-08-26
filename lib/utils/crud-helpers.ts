import {
  ViewFieldConfig,
  EditFieldConfig,
  ValidationConfig,
} from "../action/crud-types";
import { RowData } from "../types";
import { getEntityJobConfig } from "../config/entity-jobs";

import {
  persianValidationRules,
  normalizeFormData,
} from "./persian-validation";

// Helper function to create a complete CRUD configuration for an entity
export interface CRUDEntityConfig<T extends RowData, S extends string> {
  viewFields: ViewFieldConfig<T>[];
  editFields: EditFieldConfig<T>[];
  validationRules: ValidationConfig<T>;
  statusMap: Record<S, string>;
  statusColorMap: Record<
    S,
    "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  >;
  entityName: string;
  entityDisplayName: string;
}

// Helper to create validation rules using Persian validators
export const createValidationRules = <T extends RowData>(
  customRules: Partial<ValidationConfig<T>> = {},
): ValidationConfig<T> => {
  const baseRules: Partial<ValidationConfig<T>> = {
    name: persianValidationRules.persianName,
    phone: persianValidationRules.persianPhone,
    ssn: persianValidationRules.persianSSN,
    postal_code: persianValidationRules.persianPostalCode,
    address: persianValidationRules.persianText,
    total_amount: persianValidationRules.currency,
    description: persianValidationRules.persianText,
  } as ValidationConfig<T>;

  return { ...baseRules, ...customRules };
};

// Helper to create standard display fields for delete confirmation
export const createDeleteDisplayFields = <T extends RowData>(
  entityType: "client" | "preOrder" | "order" | "preInvoice" | "invoice",
) => {
  const commonFields = [
    { key: "name" as keyof T, label: "نام" },
    { key: "id" as keyof T, label: "شناسه" },
  ];

  switch (entityType) {
    case "client":
      return [
        ...commonFields,
        { key: "phone" as keyof T, label: "شماره تماس" },
        { key: "ssn" as keyof T, label: "کد ملی" },
      ];

    case "preOrder":
    case "order":
      return [
        ...commonFields,
        {
          key: "total_amount" as keyof T,
          label: "مبلغ",
          formatter: (value: any) => {
            const num = typeof value === "string" ? parseFloat(value) : value;

            return isNaN(num)
              ? "-"
              : `${new Intl.NumberFormat("fa-IR").format(num)} ریال`;
          },
        },
      ];

    case "preInvoice":
    case "invoice":
      return [
        ...commonFields,
        {
          key: "total_amount" as keyof T,
          label: "مبلغ کل",
          formatter: (value: any) => {
            const num = typeof value === "string" ? parseFloat(value) : value;

            return isNaN(num)
              ? "-"
              : `${new Intl.NumberFormat("fa-IR").format(num)} ریال`;
          },
        },
        {
          key: "created_at" as keyof T,
          label: "تاریخ ایجاد",
          formatter: (value: any) => {
            try {
              return new Date(value).toLocaleDateString("fa-IR");
            } catch {
              return "-";
            }
          },
        },
      ];

    default:
      return commonFields;
  }
};

// Helper to get job configurations for CRUD operations
export const getCRUDJobConfigs = (entityType: string) => ({
  view: getEntityJobConfig(entityType, "view"),
  edit: getEntityJobConfig(entityType, "edit"),
  delete: getEntityJobConfig(entityType, "delete"),
});

// Helper to create standard CRUD modal titles
export const createCRUDTitles = (entityDisplayName: string) => ({
  view: `مشاهده جزئیات ${entityDisplayName}`,
  edit: `ویرایش ${entityDisplayName}`,
  delete: `حذف ${entityDisplayName}`,
});

// Helper to merge field configurations with entity-specific overrides
export const mergeFieldConfigs = <T extends RowData>(
  baseFields: ViewFieldConfig<T>[],
  customFields: Partial<ViewFieldConfig<T>>[] = [],
): ViewFieldConfig<T>[] => {
  const merged = [...baseFields];

  customFields.forEach((customField) => {
    if (customField.key) {
      const existingIndex = merged.findIndex(
        (field) => field.key === customField.key,
      );

      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...customField };
      } else {
        merged.push(customField as ViewFieldConfig<T>);
      }
    }
  });

  return merged;
};

// Helper to create consistent error messages
export const createErrorMessages = {
  updateSuccess: (entityName: string) =>
    `${entityName} با موفقیت به‌روزرسانی شد`,
  updateError: (entityName: string) => `خطا در به‌روزرسانی ${entityName}`,
  deleteSuccess: (entityName: string) => `${entityName} با موفقیت حذف شد`,
  deleteError: (entityName: string) => `خطا در حذف ${entityName}`,
  dependencyError: (entityName: string) =>
    `این ${entityName} دارای رکوردهای وابسته است و قابل حذف نیست`,
  validationError: "لطفاً اطلاعات وارد شده را بررسی کنید",
  networkError: "خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید",
};

// Helper to format Persian numbers in form data (deprecated - use normalizeFormData instead)
export const formatFormDataForPersian = (formData: FormData): FormData => {
  return normalizeFormData(formData);
};
