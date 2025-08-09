# useTableLogic Hook - Technical Documentation

## Purpose and Architecture

The `useTableLogic` hook is the core table management system for the Siman Ban dashboard. It encapsulates all table-related functionality including data fetching, pagination, filtering, sorting, and UI state management in a reusable, type-safe manner.

## Core Responsibilities

### 1. Data Management
- **Async Data Fetching**: Manages server-side data retrieval with proper error handling
- **State Synchronization**: Keeps UI state in sync with server data
- **Cache Management**: Handles data refresh and state updates
- **Loading States**: Provides smooth loading indicators using React transitions

### 2. User Interface Logic
- **Pagination**: Complete pagination system with configurable page sizes
- **Filtering**: Multi-dimensional filtering (status, client type, search)
- **Sorting**: Persian-aware alphabetical sorting for all columns
- **Column Management**: Dynamic show/hide columns functionality
- **Search**: Real-time search with debouncing and Persian text support

### 3. Persian/RTL Optimization
- **Persian Sorting**: Custom alphabetical comparison algorithm for Persian characters
- **RTL Layout**: All UI components are RTL-aware
- **Persian Localization**: All text, numbers, and dates formatted for Persian locale
- **Cultural Adaptation**: UI patterns adapted for Persian business workflows

## Technical Architecture

### Generic Type System
```typescript
useTableLogic<TD extends RowData, S extends string>
```

The hook uses a sophisticated generic type system:
- `TD`: Data type extending `RowData` - represents your entity structure
- `S`: Status type as string union - represents possible status values

This ensures complete type safety across the entire table system.

### State Management Pattern
The hook manages multiple interconnected state pieces:
- **Data State**: `rows`, `pages`, `pending`
- **Filter State**: `filterValue`, `statusFilter`, `rowTypeFilter`
- **UI State**: `visibleColumns`, `sortDescriptor`, `page`, `rowsPerPage`

All state changes trigger appropriate side effects through `useEffect` hooks.

### Performance Optimizations
- **React Transitions**: Uses `useTransition` for non-blocking state updates
- **Memoization**: Extensive use of `useMemo` and `useCallback` for performance
- **Efficient Sorting**: Custom Persian sorting algorithm optimized for performance
- **Pagination**: Server-side pagination reduces memory usage and network load

## Integration Requirements

### 1. Type Definitions
Your entity must follow this structure:

```typescript
// Base type all entities extend
export type RowData = {
  id: number;
};

// Your specific entity type
export type YourEntityData = RowData & {
  // Your fields here
};

// Status type as string union
export type Status = "status1" | "status2" | "status3";
```

### 2. Server Actions
Must implement these exact function signatures:

```typescript
// For fetching paginated data
GetRowsFn<TD, S>: (
  start: number,
  end: number,
  clientType: string[],
  status: string[],
  searchTerm: string,
  limit: number,
  page: number,
) => Promise<ServerActionState<(Row<TD, S> | null)[]>>

// For getting total count
GetTotalRowsFn: (
  clientType: string[],
  status: string[],
  searchTerm: string,
) => Promise<ServerActionState<number | null>>
```

### 3. UI Components
- **Add Button Component**: Must be a React component returning JSX.Element
- **Status Configuration**: statusOptions, statusColorMap, statusNameMap
- **Column Configuration**: columns array with proper typing

## Advanced Features

### Persian Sorting Algorithm
The hook includes a sophisticated Persian sorting algorithm that:
- Maps Persian characters to correct Unicode values
- Handles special Persian characters (ؤ, ئ, پ, ة, ژ, ک, چ, گ, ی)
- Provides consistent alphabetical ordering for Persian text
- Falls back to standard Unicode comparison for non-Persian characters

### Filter System
Multi-level filtering system:
- **Status Filter**: Dropdown with multiple selection
- **Client Type Filter**: Personal vs Company filtering
- **Search Filter**: Real-time text search with Persian support
- **Combined Filtering**: All filters work together seamlessly

### Column Management
Dynamic column visibility:
- **Initial Columns**: Configurable default visible columns
- **Show/Hide**: Users can toggle column visibility
- **Persistent State**: Column preferences maintained during session
- **Responsive**: Adapts to different screen sizes

## Usage Patterns

### Basic Implementation
```typescript
const {
  bottomContent,
  topContent,
  sortDescriptor,
  setSortDescriptor,
  headerColumns,
  pending,
  sortedItems,
} = useTableLogic<YourDataType, YourStatusType>(
  statusOptions,
  columns,
  INITIAL_VISIBLE_COLUMNS,
  GetYourData,
  GetTotalYourData,
  AddYourComponent
);
```

### Custom renderCell Function
```typescript
const renderCell = useCallback((row: Row<YourDataType, YourStatusType>, columnKey: Key) => {
  switch (columnKey) {
    case "your_field":
      return <span>{row.data.your_field}</span>;
    case "status":
      return (
        <Chip color={statusColorMap[row.status]}>
          {statusNameMap[row.status]}
        </Chip>
      );
    case "actions":
      return <ActionButtons />;
    default:
      return row.data[columnKey as keyof YourDataType];
  }
}, []);
```

## Best Practices

### 1. Type Safety
- Always specify both generic types explicitly
- Use proper TypeScript interfaces for all data structures
- Implement proper error handling in server actions

### 2. Performance
- Use `useCallback` for renderCell functions
- Implement proper memoization for expensive computations
- Use server-side pagination for large datasets

### 3. Persian Localization
- Use Persian date formatting: `toLocaleDateString('fa-IR')`
- Use Persian number formatting: `new Intl.NumberFormat('fa-IR')`
- Ensure all text is properly localized

### 4. Error Handling
- Implement proper error states in server actions
- Provide meaningful Persian error messages
- Handle network failures gracefully

### 5. Accessibility
- Use proper ARIA labels for table elements
- Ensure keyboard navigation works correctly
- Provide screen reader support for Persian content

This hook represents a complete, production-ready table solution specifically designed for Persian business applications with modern React patterns and optimal performance characteristics.