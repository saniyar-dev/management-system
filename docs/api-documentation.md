# مستندات API - پنل مدیریت سیمان بان

## نمای کلی

سیستم از Server Actions Next.js برای ارتباط با پایگاه داده Supabase استفاده می‌کند. تمام عملیات CRUD از طریق توابع async انجام می‌شود که نتایج را به صورت typed object برمی‌گردانند.

## ساختار پاسخ API

### ServerActionState Type

```typescript
export type ServerActionState<T> = {
  message: string;    // پیام فارسی برای کاربر
  success: boolean;   // وضعیت موفقیت عملیات
  data?: T;          // داده‌های برگشتی (اختیاری)
};
```

### مثال پاسخ موفق

```typescript
{
  message: "مشتری با موفقیت ثبت شد.",
  success: true,
  data: {
    id: 123,
    name: "شرکت نمونه",
    // سایر فیلدها
  }
}
```

### مثال پاسخ ناموفق

```typescript
{
  message: "خطا در ثبت مشتری. لطفاً دوباره تلاش کنید.",
  success: false
}
```

## API Functions

### 1. Client Management APIs

#### GetClients

دریافت لیست مشتریان با قابلیت فیلتر و صفحه‌بندی.

```typescript
export const GetClients: GetRowsFn<ClientData, Status> = async (
  start: number,        // شروع رکورد
  end: number,          // پایان رکورد
  clientType: string[], // نوع مشتری: ["personal", "company"] یا ["all"]
  status: string[],     // وضعیت: ["active", "inactive"] یا ["all"]
  searchTerm: string,   // عبارت جستجو
  limit: number,        // تعداد رکورد در صفحه
  page: number,         // شماره صفحه
) => Promise<ServerActionState<(Row<ClientData, Status> | null)[]>>
```

**مثال استفاده:**

```typescript
const result = await GetClients(0, 9, ["all"], ["active"], "شرکت", 10, 1);

if (result.success && result.data) {
  console.log("مشتریان دریافت شدند:", result.data);
} else {
  console.error("خطا:", result.message);
}
```

#### GetTotalClients

دریافت تعداد کل مشتریان برای محاسبه صفحه‌بندی.

```typescript
export const GetTotalClients: GetTotalRowsFn = async (
  clientType: string[],
  status: string[],
  searchTerm: string,
) => Promise<ServerActionState<number | null>>
```

#### AddClient

افزودن مشتری جدید.

```typescript
export const AddClient = async (
  formData: FormData
) => Promise<ServerActionState<ClientData>>
```

**فیلدهای مورد نیاز:**
- `name`: نام مشتری (اجباری)
- `ssn`: کد ملی/شناسه ملی (اجباری)
- `phone`: شماره تلفن (اجباری)
- `address`: آدرس (اختیاری)
- `postal_code`: کد پستی (اختیاری)
- `client_type`: نوع مشتری ("personal" | "company")

#### UpdateClient

به‌روزرسانی اطلاعات مشتری.

```typescript
export const UpdateClient = async (
  id: number,
  formData: FormData
) => Promise<ServerActionState<ClientData>>
```

#### DeleteClient

حذف مشتری.

```typescript
export const DeleteClient = async (
  id: number
) => Promise<ServerActionState<null>>
```

### 2. Pre-Order Management APIs

#### GetPreOrders

دریافت لیست پیش سفارش‌ها.

```typescript
export const GetPreOrders: GetRowsFn<PreOrderData, Status> = async (
  start: number,
  end: number,
  clientType: string[],
  status: string[], // ["pending", "approved", "rejected", "converted"]
  searchTerm: string,
  limit: number,
  page: number,
) => Promise<ServerActionState<(Row<PreOrderData, Status> | null)[]>>
```

#### GetTotalPreOrders

```typescript
export const GetTotalPreOrders: GetTotalRowsFn = async (
  clientType: string[],
  status: string[],
  searchTerm: string,
) => Promise<ServerActionState<number | null>>
```

#### AddPreOrder

افزودن پیش سفارش جدید.

```typescript
export const AddPreOrder = async (
  formData: FormData
) => Promise<ServerActionState<PreOrderData>>
```

**فیلدهای مورد نیاز:**
- `client_id`: شناسه مشتری (اجباری)
- `description`: شرح پیش سفارش (اجباری)
- `estimated_amount`: مبلغ تخمینی (اجباری)

### 3. Order Management APIs

#### GetOrders

```typescript
export const GetOrders: GetRowsFn<OrderData, Status> = async (
  start: number,
  end: number,
  clientType: string[],
  status: string[],
  searchTerm: string,
  limit: number,
  page: number,
) => Promise<ServerActionState<(Row<OrderData, Status> | null)[]>>
```

#### ConvertPreOrderToOrder

تبدیل پیش سفارش به سفارش.

```typescript
export const ConvertPreOrderToOrder = async (
  preOrderId: number,
  orderDetails: OrderDetails
) => Promise<ServerActionState<OrderData>>
```

### 4. Invoice Management APIs

#### GetPreInvoices

```typescript
export const GetPreInvoices: GetRowsFn<PreInvoiceData, Status> = async (
  start: number,
  end: number,
  clientType: string[],
  status: string[],
  searchTerm: string,
  limit: number,
  page: number,
) => Promise<ServerActionState<(Row<PreInvoiceData, Status> | null)[]>>
```

#### GetInvoices

```typescript
export const GetInvoices: GetRowsFn<InvoiceData, Status> = async (
  start: number,
  end: number,
  clientType: string[],
  status: string[],
  searchTerm: string,
  limit: number,
  page: number,
) => Promise<ServerActionState<(Row<InvoiceData, Status> | null)[]>>
```

## Data Types

### ClientData

```typescript
export type ClientData = RowData & {
  name: string;           // نام مشتری
  ssn: string;           // کد ملی/شناسه ملی
  phone: string;         // شماره تلفن
  address: string;       // آدرس
  postal_code: string;   // کد پستی
};
```

### PreOrderData

```typescript
export type PreOrderData = RowData & {
  client_name: string;      // نام مشتری
  description: string;      // شرح پیش سفارش
  estimated_amount: number; // مبلغ تخمینی
  created_at: string;       // تاریخ ایجاد
  client_id: number;        // شناسه مشتری
};
```

### Row Type

```typescript
export type Row<T extends RowData, S> = {
  id: number;        // شناسه رکورد
  type: ClientType;  // نوع مشتری
  data: T;          // داده‌های اصلی
  status: S;        // وضعیت
};
```

## Status Types

### Client Status

```typescript
export type ClientStatus = "done" | "waiting" | "todo";

export const clientStatusNameMap: Record<ClientStatus, string> = {
  done: "اتمام یافته",
  waiting: "نیاز به پیگیری", 
  todo: "انجام نشده",
};
```

### Pre-Order Status

```typescript
export type PreOrderStatus = "pending" | "approved" | "rejected" | "converted";

export const preOrderStatusNameMap: Record<PreOrderStatus, string> = {
  pending: "در انتظار بررسی",
  approved: "تایید شده",
  rejected: "رد شده",
  converted: "تبدیل به سفارش",
};
```

## Error Handling

### خطاهای رایج

#### 1. خطای اتصال به پایگاه داده

```typescript
{
  message: "خطا در اتصال به پایگاه داده. لطفاً دوباره تلاش کنید.",
  success: false
}
```

#### 2. خطای اعتبارسنجی

```typescript
{
  message: "اطلاعات وارد شده معتبر نیست. لطفاً بررسی کنید.",
  success: false
}
```

#### 3. خطای دسترسی

```typescript
{
  message: "شما دسترسی لازم برای این عملیات را ندارید.",
  success: false
}
```

### مدیریت خطا در کامپوننت

```typescript
const handleSubmit = async (formData: FormData) => {
  try {
    const result = await AddClient(formData);
    
    if (result.success) {
      toast.success(result.message);
      // عملیات موفق
    } else {
      toast.error(result.message);
      // نمایش خطا به کاربر
    }
  } catch (error) {
    console.error('خطای غیرمنتظره:', error);
    toast.error('خطای غیرمنتظره رخ داد.');
  }
};
```

## Authentication

### useSession Hook

```typescript
const { session, pending } = useSession();

if (pending) {
  return <LoadingSpinner />;
}

if (!session) {
  redirect('/login');
}
```

### Protected Routes

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient({
    req: request,
    res: NextResponse.next(),
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

## Real-time Updates

### Supabase Subscriptions

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('clients_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'clients' },
      (payload) => {
        console.log('تغییر در جدول مشتریان:', payload);
        // به‌روزرسانی state محلی
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Performance Optimization

### Pagination

```typescript
// استفاده از pagination برای کاهش بار
const ITEMS_PER_PAGE = 10;
const offset = (page - 1) * ITEMS_PER_PAGE;

const query = supabase
  .from('clients')
  .select('*')
  .range(offset, offset + ITEMS_PER_PAGE - 1);
```

### Caching

```typescript
// استفاده از React Query یا SWR برای caching
const { data, error, isLoading } = useSWR(
  ['clients', page, filters],
  () => GetClients(/* parameters */),
  {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  }
);
```

## Testing APIs

### Unit Tests

```typescript
import { GetClients } from '@/lib/action/client';

describe('GetClients', () => {
  test('should return clients successfully', async () => {
    const result = await GetClients(0, 9, ['all'], ['all'], '', 10, 1);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('should handle search term', async () => {
    const result = await GetClients(0, 9, ['all'], ['all'], 'شرکت', 10, 1);
    
    expect(result.success).toBe(true);
    // بررسی که نتایج شامل عبارت جستجو هستند
  });
});
```

### Integration Tests

```typescript
import { createClient } from '@supabase/supabase-js';

describe('Client API Integration', () => {
  let testClient: any;

  beforeAll(async () => {
    // ایجاد مشتری تست
    testClient = await AddClient(new FormData(/* test data */));
  });

  afterAll(async () => {
    // حذف مشتری تست
    await DeleteClient(testClient.data.id);
  });

  test('should create, read, update, delete client', async () => {
    // تست CRUD operations
  });
});
```