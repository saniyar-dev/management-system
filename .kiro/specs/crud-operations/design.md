# Design Document

## Overview

This design implements a comprehensive CRUD operations system for the Siman Ban dashboard, extending the existing AddClient pattern to provide View, Edit, and Delete functionalities across all entities. The design emphasizes consistency, Persian/RTL support, job integration, and maintainable code patterns.

## Architecture

### Component Architecture

```
Entity Page (e.g., clients/page.tsx)
├── useTableLogic Hook (existing)
├── Table with Action Buttons
│   ├── ViewIcon → ViewEntityComponent
│   ├── EditIcon → EditEntityComponent  
│   └── DeleteIcon → DeleteEntityComponent
└── Modal Components
    ├── ViewEntityModal
    ├── EditEntityModal
    └── DeleteConfirmationModal
```

### Modal Pattern Consistency

All CRUD modals follow the established AddClient pattern:
- Modal with draggable functionality
- Dynamic sizing based on job presence
- Persian labels and RTL layout
- Job integration with real-time updates
- Consistent button styling and placement

### Hook Integration

Extends existing patterns:
- `useJobs` hook for job management
- `useDisclosure` for modal state
- `useTransition` for loading states
- Custom validation hooks for entity-specific rules

## Components and Interfaces

### Core Component Types

```typescript
// Base CRUD component interface
interface CRUDComponentProps<T extends RowData, S extends string> {
  entity: Row<T, S>;
  onSuccess?: () => void;
  jobsConfig: { url: string; name: string }[];
}

// View component - read-only display
interface ViewComponentProps<T, S> extends CRUDComponentProps<T, S> {
  fields: ViewFieldConfig<T>[];
}

// Edit component - editable form
interface EditComponentProps<T, S> extends CRUDComponentProps<T, S> {
  fields: EditFieldConfig<T>[];
  validationRules: ValidationConfig<T>;
  onUpdate: (formData: FormData) => Promise<ServerActionState<string>>;
}

// Delete component - confirmation dialog
interface DeleteComponentProps<T, S> extends CRUDComponentProps<T, S> {
  onDelete: (id: string) => Promise<ServerActionState<boolean>>;
  dependencyCheck?: (id: string) => Promise<boolean>;
}
```

### Field Configuration System

```typescript
// View field configuration
interface ViewFieldConfig<T> {
  key: keyof T;
  label: string;
  type: 'text' | 'number' | 'date' | 'status' | 'currency';
  formatter?: (value: any) => string;
}

// Edit field configuration  
interface EditFieldConfig<T> {
  key: keyof T;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'date' | 'number';
  required?: boolean;
  validation?: (value: any) => string | null;
  options?: { value: string; label: string }[];
}
```

### Entity-Specific Configurations

Each entity defines its own field configurations:

```typescript
// clients/config.ts
export const clientViewFields: ViewFieldConfig<ClientData>[] = [
  { key: 'name', label: 'نام', type: 'text' },
  { key: 'phone', label: 'شماره تماس', type: 'text' },
  { key: 'ssn', label: 'کد ملی', type: 'text' },
  { key: 'address', label: 'آدرس', type: 'text' },
  { key: 'postal_code', label: 'کد پستی', type: 'text' }
];

export const clientEditFields: EditFieldConfig<ClientData>[] = [
  { key: 'name', label: 'نام', type: 'input', required: true },
  { key: 'phone', label: 'شماره تماس', type: 'input', required: true },
  // ... more fields
];
```

## Data Models

### Extended Server Actions

```typescript
// Update operations
export type UpdateEntityFn<T> = (
  id: string,
  formData: FormData
) => Promise<ServerActionState<string>>;

// Delete operations  
export type DeleteEntityFn = (
  id: string
) => Promise<ServerActionState<boolean>>;

// Dependency check
export type CheckDependenciesFn = (
  id: string
) => Promise<ServerActionState<boolean>>;
```

### Job Configuration per Entity

```typescript
// Entity-specific job configurations
export const entityJobConfigs = {
  client: {
    view: [{ name: "بررسی اطلاعات مشتری", url: "https://example.com" }],
    edit: [{ name: "به‌روزرسانی اطلاعات", url: "https://example.com" }],
    delete: [{ name: "حذف از سیستم", url: "https://example.com" }]
  },
  preOrder: {
    view: [{ name: "بررسی پیش سفارش", url: "https://example.com" }],
    edit: [{ name: "ویرایش پیش سفارش", url: "https://example.com" }],
    delete: [{ name: "لغو پیش سفارش", url: "https://example.com" }]
  }
  // ... other entities
};
```

## Error Handling

### Validation Strategy

1. **Client-side validation**: Immediate feedback using field validators
2. **Server-side validation**: Business rule enforcement
3. **Dependency validation**: Check for related records before deletion
4. **Persian error messages**: All errors displayed in Persian

### Error Display Pattern

```typescript
interface ErrorState {
  field?: string;
  message: string;
  type: 'validation' | 'server' | 'dependency';
}
```

## Testing Strategy

### Component Testing

1. **Modal Behavior**: Test open/close, dragging, sizing
2. **Form Validation**: Test field validation and error display
3. **Job Integration**: Test job triggering and status updates
4. **Persian Text**: Test RTL layout and Persian number formatting

### Integration Testing

1. **CRUD Operations**: Test complete workflows for each entity
2. **Server Actions**: Test all update and delete operations
3. **Dependency Checks**: Test deletion prevention for related records
4. **Real-time Updates**: Test job status updates and table refresh

### Entity-Specific Testing

1. **Client CRUD**: Test personal/company type handling
2. **Order CRUD**: Test status transition validation
3. **Financial CRUD**: Test decimal precision and currency formatting
4. **Cross-entity**: Test relationship handling and cascading updates

## Implementation Approach

### Phase 1: Core Infrastructure
- Create base CRUD components
- Implement field configuration system
- Set up validation framework
- Create job integration patterns

### Phase 2: Entity Implementation
- Implement client CRUD operations
- Add pre-order CRUD operations
- Extend to orders, pre-invoices, invoices
- Configure entity-specific validations

### Phase 3: Integration & Polish
- Integrate with existing table components
- Add comprehensive error handling
- Implement dependency checking
- Add Persian formatting and RTL support

### Code Organization

```
app/dashboard/[entity]/
├── types.tsx (existing)
├── config.ts (new - field configurations)
├── viewEntity.tsx (new)
├── editEntity.tsx (new)
├── deleteEntity.tsx (new)
└── page.tsx (updated)

lib/action/
├── [entity].ts (updated with CRUD operations)
└── crud-types.ts (new - shared types)

components/
├── crud/ (new directory)
│   ├── ViewModal.tsx
│   ├── EditModal.tsx
│   ├── DeleteModal.tsx
│   └── FieldRenderer.tsx
└── jobs.tsx (existing)
```

This design ensures consistency across all entities while maintaining the established patterns and Persian/RTL requirements of the Siman Ban dashboard.