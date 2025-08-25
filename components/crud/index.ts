// Export all CRUD components
export { ViewModal } from "./ViewModal";
export { EditModal } from "./EditModal";
export { DeleteModal } from "./DeleteModal";
export { FieldRenderer } from "./FieldRenderer";

// Re-export types for convenience
export type {
  CRUDComponentProps,
  ViewComponentProps,
  EditComponentProps,
  DeleteComponentProps,
  ViewFieldConfig,
  EditFieldConfig,
  ValidationConfig,
  UpdateEntityFn,
  DeleteEntityFn,
  CheckDependenciesFn,
  ErrorState,
  CRUDOperation,
  EntityJobConfig,
  PersianValidationRules,
} from "@/lib/action/crud-types";
