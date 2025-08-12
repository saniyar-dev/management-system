# معماری سیستم - پنل مدیریت سیمان بان

## نمای کلی معماری

سیستم مدیریت سیمان بان بر اساس معماری مدرن Next.js 15 با App Router طراحی شده و از الگوهای بهینه برای توسعه اپلیکیشن‌های تجاری استفاده می‌کند.

## لایه‌های معماری

### 1. لایه ارائه (Presentation Layer)
- **Framework**: Next.js 15 با App Router
- **UI Components**: HeroUI v2 با پشتیبانی RTL
- **Styling**: Tailwind CSS با تنظیمات فارسی
- **Typography**: فونت Estedad برای متن‌های فارسی

### 2. لایه منطق تجاری (Business Logic Layer)
- **Custom Hooks**: `useTableLogic`, `useSession`
- **Server Actions**: عملیات CRUD با Supabase
- **Type System**: TypeScript با تعریف دقیق انواع داده
- **State Management**: React Hooks و Transitions

### 3. لایه داده (Data Layer)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Row Level Security**: امنیت سطح رکورد

## ساختار فایل‌ها

```
app/
├── layout.tsx              # Layout اصلی با RTL و فونت فارسی
├── page.tsx               # صفحه اصلی
├── providers.tsx          # Context Providers
├── dashboard/
│   ├── layout.tsx         # Layout داشبورد با sidebar
│   ├── page.tsx          # صفحه اصلی داشبورد
│   ├── clients/          # ماژول مشتریان
│   │   ├── page.tsx      # لیست مشتریان
│   │   ├── types.tsx     # تعریف انواع داده
│   │   ├── addClient.tsx # کامپوننت افزودن مشتری
│   │   ├── editClient.tsx
│   │   ├── viewClient.tsx
│   │   └── deleteClient.tsx
│   ├── pre-orders/       # ماژول پیش سفارش‌ها
│   ├── orders/           # ماژول سفارش‌ها
│   ├── pre-invoices/     # ماژول پیش فاکتورها
│   └── invoices/         # ماژول فاکتورها
└── login/                # صفحه ورود
```

## کامپوننت‌های کلیدی

### useTableLogic Hook
هوک سفارشی برای مدیریت جداول با قابلیت‌های:

```typescript
const {
  bottomContent,
  topContent,
  sortDescriptor,
  setSortDescriptor,
  headerColumns,
  pending,
  sortedItems,
} = useTableLogic<DataType, StatusType>(
  statusOptions,
  columns,
  INITIAL_VISIBLE_COLUMNS,
  GetRowsFunction,
  GetTotalRowsFunction,
  AddButtonComponent
);
```

**ویژگی‌ها:**
- صفحه‌بندی خودکار
- فیلتر بر اساس وضعیت و نوع مشتری
- جستجوی زنده
- مرتب‌سازی فارسی
- مدیریت نمایش ستون‌ها

### Server Actions Pattern
```typescript
export const GetClients: GetRowsFn<ClientData, Status> = async (
  start: number,
  end: number,
  clientType: string[],
  status: string[],
  searchTerm: string,
  limit: number,
  page: number,
) => {
  // منطق دریافت داده از Supabase
  return {
    message: "پیام فارسی",
    success: boolean,
    data: Row<ClientData, Status>[]
  };
};
```

## الگوهای طراحی

### 1. Generic Type System
```typescript
// تعریف انواع داده عمومی
export type Row<T extends RowData, S> = {
  id: number;
  type: ClientType;
  data: T;
  status: S;
};

// استفاده در کامپوننت‌ها
useTableLogic<ClientData, ClientStatus>(...)
```

### 2. Persian-First Design
- تمام متن‌ها به زبان فارسی
- چیدمان RTL در تمام کامپوننت‌ها
- مرتب‌سازی بر اساس الفبای فارسی
- نمایش اعداد و تاریخ فارسی

### 3. Compound Components
```typescript
// کامپوننت اصلی
<Table>
  <TableHeader columns={headerColumns}>
    {(column) => <TableColumn>{column.name}</TableColumn>}
  </TableHeader>
  <TableBody items={sortedItems}>
    {(item) => (
      <TableRow>
        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
      </TableRow>
    )}
  </TableBody>
</Table>
```

## مدیریت حالت (State Management)

### Local State
- `useState` برای حالت‌های محلی کامپوننت
- `useTransition` برای عملیات async
- `useMemo` و `useCallback` برای بهینه‌سازی

### Server State
- Server Actions برای عملیات CRUD
- Supabase Realtime برای به‌روزرسانی زنده
- Optimistic Updates برای تجربه کاربری بهتر

## امنیت

### Row Level Security (RLS)
```sql
-- مثال RLS policy
CREATE POLICY "Users can view own data" ON clients
  FOR SELECT USING (auth.uid() = user_id);
```

### Type Safety
- استفاده کامل از TypeScript
- تعریف دقیق انواع داده
- Validation در سمت کلاینت و سرور

## بهینه‌سازی عملکرد

### Next.js Optimizations
- App Router برای بهینه‌سازی خودکار
- Server Components برای کاهش JavaScript
- Image Optimization برای تصاویر
- Font Optimization برای فونت فارسی

### Database Optimizations
- Indexing برای جستجوی سریع
- Pagination برای کاهش بار
- Connection Pooling در Supabase

### UI Optimizations
- Lazy Loading برای کامپوننت‌های سنگین
- Virtual Scrolling برای لیست‌های طولانی
- Memoization برای جلوگیری از re-render

## مانیتورینگ و لاگ‌گیری

### Error Handling
```typescript
try {
  const result = await serverAction();
  if (!result.success) {
    // نمایش پیام خطا به فارسی
    toast.error(result.message);
  }
} catch (error) {
  // مدیریت خطاهای غیرمنتظره
  console.error('خطا در عملیات:', error);
}
```

### Performance Monitoring
- Core Web Vitals tracking
- Database query performance
- User interaction metrics

## مستقل‌سازی (Deployment)

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Vercel Deployment
- خودکار با Git integration
- Edge Functions برای عملکرد بهتر
- Analytics و Monitoring داخلی