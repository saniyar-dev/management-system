import { Row, RowData } from "../types";

import { ServerActionState } from "./type";

// Base CRUD component interface
export interface CRUDComponentProps<T extends RowData, S extends string> {
  entity: Row<T, S>;
  onSuccess?: () => void;
  jobsConfig: { url: string; name: string }[];
}

// View component - read-only display
export interface ViewComponentProps<T extends RowData, S extends string>
  extends CRUDComponentProps<T, S> {
  fields: ViewFieldConfig<T>[];
}

// Edit component - editable form
export interface EditComponentProps<T extends RowData, S extends string>
  extends CRUDComponentProps<T, S> {
  fields: EditFieldConfig<T>[];
  validationRules: ValidationConfig<T>;
  onUpdate: (formData: FormData) => Promise<ServerActionState<string>>;
}

// Delete component - confirmation dialog
export interface DeleteComponentProps<T extends RowData, S extends string>
  extends CRUDComponentProps<T, S> {
  onDelete: (id: string) => Promise<ServerActionState<boolean>>;
  dependencyCheck?: (id: string) => Promise<boolean>;
}

// Add component - creation form
export interface AddComponentProps<T extends RowData, S extends string> {
  fields: AddFieldConfig<T>[];
  validationRules: ValidationConfig<T>;
  jobsConfig: { url: string; name: string }[];
  onAdd: (formData: FormData) => Promise<ServerActionState<string | null>>;
  onSuccess?: () => void;
}

// View field configuration
export interface ViewFieldConfig<T extends RowData> {
  key: keyof T;
  label: string;
  type: "text" | "number" | "date" | "status" | "currency";
  formatter?: (value: any) => string;
}

// Edit field configuration
export interface EditFieldConfig<T extends RowData> {
  key: keyof T;
  label: string;
  type: "input" | "textarea" | "select" | "date" | "number";
  required?: boolean;
  validation?: (value: any) => string | null;
  options?: (formData: Record<string, any>) => SelectOption[];
}

// Add field configuration
export interface AddFieldConfig<T extends RowData> {
  key: keyof T;
  label: string;
  type: "input" | "textarea" | "select" | "date" | "number";
  required?: boolean;
  validation?: (value: any) => string | null;
  options?: (formData: Record<string, any>) => SelectOption[];
  placeholder?: string;
  fieldName?: string; // Custom field name for form (if different from key)
}

export interface SelectOption {
  id: string;
  name: string;
  label: string;
}

// Validation configuration
export type ValidationConfig<T extends RowData> = {
  [K in keyof T]?: (value: T[K]) => string | null;
};

// Update operations
export type UpdateEntityFn<T extends RowData> = (
  id: string,
  formData: FormData,
) => Promise<ServerActionState<string>>;

// Delete operations
export type DeleteEntityFn = (
  id: string,
) => Promise<ServerActionState<boolean>>;

// Dependency check
export type CheckDependenciesFn = (
  id: string,
) => Promise<ServerActionState<boolean>>;

// Error state interface
export interface ErrorState {
  field?: string;
  message: string;
  type: "validation" | "server" | "dependency";
}

// CRUD operation types
export type CRUDOperation = "view" | "edit" | "delete";

// Entity job configurations
export interface EntityJobConfig {
  view: { name: string; url: string }[];
  edit: { name: string; url: string }[];
  delete: { name: string; url: string }[];
  add: { name: string; url: string }[];
}

// Persian validation utilities
export interface PersianValidationRules {
  persianText: (value: string) => string | null;
  persianPhone: (value: string) => string | null;
  persianSSN: (value: string) => string | null;
  persianPostalCode: (value: string) => string | null;
  persianName: (value: string) => string | null;
  currency: (value: string | number) => string | null;
  positiveNumber: (value: string | number) => string | null;
}
