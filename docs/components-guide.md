# راهنمای کامپوننت‌ها - پنل مدیریت سیمان بان

## کامپوننت‌های اصلی

### 1. Dashboard Layout

**مسیر**: `app/dashboard/layout.tsx`

کامپوننت layout اصلی داشبورد که شامل sidebar navigation و محتوای اصلی است.

```typescript
export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex justify-start gap-4 h-full">
      <div className="w-[180px] h-full border-l-1 pl-2">
        <Listbox aria-label="sidebar menu" variant="flat">
          {/* منوی کناری */}
        </Listbox>
      </div>
      {children}
    </section>
  );
}
```

**ویژگی‌ها:**
- Sidebar ثابت با عرض 180px
- منوی سازمان‌یافته بر اساس بخش‌های تجاری
- پشتیبانی کامل از RTL
- استفاده از HeroUI Listbox

### 2. Table Components

#### ساختار کلی جداول

تمام جداول در سیستم از الگوی مشابهی پیروی می‌کنند:

```typescript
// تعریف ستون‌ها
export const columns: Array<{
  name: string;
  uid: ColumnUID;
  sortable?: boolean;
}> = [
  { name: "نام", uid: "name", sortable: true },
  { name: "وضعیت", uid: "status", sortable: true },
  { name: "عملیات", uid: "actions" },
];

// ستون‌های قابل مشاهده اولیه
const INITIAL_VISIBLE_COLUMNS: Array<ColumnUID> = [
  "name", "status", "actions"
];
```

#### renderCell Function

هر جدول دارای تابع `renderCell` سفارشی است:

```typescript
const renderCell = useCallback((row: Row<DataType, Status>, columnKey: Key) => {
  switch (columnKey) {
    case "name":
      return <span className="font-medium">{row.data.name}</span>;
    
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
            <span className="text-lg text-default-400 cursor-pointer">
              <EyeIcon />
            </span>
          </Tooltip>
          {/* سایر عملیات */}
        </div>
      );
    
    default:
      return row.data[columnKey as keyof DataType];
  }
}, []);
```

### 3. Modal Components

#### Add Modal Pattern

```typescript
export function AddEntityComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // منطق ثبت داده
      onOpenChange();
      window.location.reload(); // به‌روزرسانی صفحه
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
                {/* فیلدهای فرم */}
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

### 4. Status Management Components

#### Status Chip

```typescript
// نقشه رنگ‌های وضعیت
export const statusColorMap: Record<Status, ChipProps["color"]> = {
  active: "success",
  inactive: "danger",
  pending: "warning",
};

// نقشه نام‌های فارسی وضعیت
export const statusNameMap: Record<Status, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  pending: "در انتظار",
};

// استفاده در کامپوننت
<Chip
  color={statusColorMap[status]}
  size="sm"
  variant="flat"
>
  {statusNameMap[status]}
</Chip>
```

### 5. Search and Filter Components

#### Search Input

```typescript
<Input
  isClearable
  className="w-full sm:max-w-[44%]"
  placeholder="اسم مورد نظر خودتو پیدا کن..."
  startContent={<SearchIcon />}
  value={filterValue}
  onClear={() => onClear()}
  onValueChange={onSearchChange}
/>
```

#### Filter Dropdowns

```typescript
<Dropdown>
  <DropdownTrigger>
    <Button endContent={<ChevronDownIcon />} variant="flat">
      وضعیت
    </Button>
  </DropdownTrigger>
  <DropdownMenu
    disallowEmptySelection
    closeOnSelect={false}
    selectedKeys={statusFilter}
    selectionMode="multiple"
    onSelectionChange={setStatusFilter}
  >
    {statusOptions.map((status) => (
      <DropdownItem key={status.uid}>
        {status.name}
      </DropdownItem>
    ))}
  </DropdownMenu>
</Dropdown>
```

## کامپوننت‌های مشترک

### 1. Jobs Component (`components/jobs.tsx`)

کامپوننت نمایش وضعیت کارها (Jobs) که برای نمایش پیشرفت عملیات‌های مختلف استفاده می‌شود.

```typescript
export default function JobsComponent({
  jobs
}: {
  jobs: Job[];
}) {
  return (
    <section className="flex flex-col">
      {jobs &&
        jobs.map((job) => {
          return (
            <Card
              key={job.id}
              className={`border-${jobStatusColorMap[job.status]}-400 border-1 w-xs`}
              radius="sm"
            >
              <CardBody>
                <div className="flex justify-between items-center">
                  {job.name}
                  <Spinner
                    color={jobStatusColorMap[job.status]}
                    variant="spinner"
                  />
                </div>
              </CardBody>
            </Card>
          );
        })}
    </section>
  );
}
```

**ویژگی‌ها:**
- نمایش لیست کارها با وضعیت‌های مختلف
- استفاده از Spinner با رنگ‌های متناسب با وضعیت
- طراحی کارت‌های کوچک با border رنگی
- پشتیبانی از وضعیت‌های: pending (در انتظار), done (انجام شده), error (خطا)

**انواع وضعیت:**
```typescript
export type Job = {
  id: number;
  name: string;
  url: string;
  status: "pending" | "done" | "error";
}

export const jobStatusColorMap: Record<Job["status"], "warning" | "success" | "danger"> = {
  pending: "warning",
  done: "success",
  error: "danger",
};
```

### 2. Icons (`components/icons.tsx`)

مجموعه آیکون‌های استفاده شده در سیستم:

```typescript
export const SearchIcon = (props: IconSvgProps) => (
  <svg {...props}>
    {/* SVG path */}
  </svg>
);

export const PlusIcon = (props: IconSvgProps) => (
  <svg {...props}>
    {/* SVG path */}
  </svg>
);
```

### 2. Loading Components

#### Spinner for Tables

```typescript
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
```

#### Loading States

```typescript
<Button 
  color="primary" 
  isLoading={isLoading} 
  type="submit"
>
  {isLoading ? "در حال ثبت..." : "ثبت"}
</Button>
```

### 3. Navigation Components

#### Navbar (`components/navbar.tsx`)

```typescript
export const Navbar = () => {
  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink href="/">
            <Logo />
            <p className="font-bold text-inherit">سیمان بان</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>
      {/* سایر محتویات navbar */}
    </NextUINavbar>
  );
};
```

## الگوهای طراحی کامپوننت

### 1. Compound Components

استفاده از الگوی Compound Components برای انعطاف‌پذیری:

```typescript
<Table>
  <TableHeader>
    <TableColumn>نام</TableColumn>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>محتوا</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 2. Render Props

استفاده از Render Props برای انعطاف در نمایش:

```typescript
<ModalContent>
  {(onClose) => (
    <form>
      {/* محتوای فرم */}
    </form>
  )}
</ModalContent>
```

### 3. Custom Hooks Integration

تمام کامپوننت‌ها از custom hooks استفاده می‌کنند:

```typescript
const {
  bottomContent,
  topContent,
  // سایر props
} = useTableLogic(/* parameters */);
```

## بهترین شیوه‌ها

### 1. Type Safety

```typescript
// تعریف دقیق انواع props
interface ComponentProps {
  data: EntityData;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}
```

### 2. Persian Text Handling

```typescript
// استفاده از فونت فارسی
className={clsx("font-medium", estedad.className)}

// نمایش اعداد فارسی
{new Intl.NumberFormat('fa-IR').format(amount)} ریال

// نمایش تاریخ فارسی
{new Date(date).toLocaleDateString('fa-IR')}
```

### 3. RTL Support

```typescript
// استفاده از logical properties
className="ms-4 me-2" // به جای ml-4 mr-2

// تنظیم جهت متن
<div dir="rtl" className="text-right">
```

### 4. Accessibility

```typescript
// استفاده از aria-label
<Button aria-label="حذف رکورد">
  <DeleteIcon />
</Button>

// استفاده از semantic HTML
<main role="main">
  <section aria-labelledby="clients-heading">
    <h2 id="clients-heading">لیست مشتریان</h2>
  </section>
</main>
```

### 5. Error Handling

```typescript
// مدیریت خطا در کامپوننت‌ها
const [error, setError] = useState<string | null>(null);

if (error) {
  return (
    <div className="text-danger text-center p-4">
      {error}
    </div>
  );
}
```

## تست کامپوننت‌ها

### Unit Testing

```typescript
import { render, screen } from '@testing-library/react';
import { AddClientComponent } from './addClient';

test('renders add client button', () => {
  render(<AddClientComponent />);
  expect(screen.getByText('افزودن جدید')).toBeInTheDocument();
});
```

### Integration Testing

```typescript
test('opens modal when button clicked', async () => {
  render(<AddClientComponent />);
  
  const button = screen.getByText('افزودن جدید');
  await userEvent.click(button);
  
  expect(screen.getByText('افزودن رکورد جدید')).toBeInTheDocument();
});
```