# راهنمای پیاده‌سازی فارسی و RTL - پنل مدیریت سیمان بان

## نمای کلی

این راهنما شامل تمام جنبه‌های پیاده‌سازی زبان فارسی و چیدمان RTL در سیستم مدیریت سیمان بان است.

## تنظیمات پایه

### 1. HTML و Layout اصلی

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning dir="rtl" lang="fa">
      <head />
      <body className={clsx(
        "min-h-screen text-foreground bg-background antialiased leading-relaxed",
        estedad.className, // فونت فارسی
      )}>
        {children}
      </body>
    </html>
  );
}
```

### 2. فونت فارسی

```typescript
// استفاده از فونت محلی Estedad
import localfont from "next/font/local";

const estedad = localfont({
  src: "../public/Estedad[KSHD,wght].woff2",
});
```

**مزایای استفاده از فونت محلی:**
- سرعت بارگذاری بالاتر
- عدم وابستگی به سرویس‌های خارجی
- پشتیبانی کامل از کاراکترهای فارسی

## تایپوگرافی فارسی

### 1. قوانین تایپوگرافی

```css
/* styles/globals.css */
body {
  font-family: 'Estedad', sans-serif;
  line-height: 1.6; /* فاصله خط مناسب برای متن فارسی */
  text-align: right; /* تراز راست برای متن فارسی */
}

/* تنظیمات خاص فارسی */
.persian-text {
  direction: rtl;
  text-align: right;
  font-feature-settings: 'kern' 1, 'liga' 1;
}
```

### 2. علائم نگارشی فارسی

```typescript
// استفاده از علائم نگارشی صحیح فارسی
const persianPunctuation = {
  comma: '،',        // کاما فارسی به جای ,
  semicolon: '؛',    // نقطه ویرگول فارسی
  question: '؟',     // علامت سوال فارسی
  percent: '٪',      // علامت درصد فارسی
};

// مثال استفاده
const message = "آیا مطمئن هستید؟"; // به جای "آیا مطمئن هستید?"
```

## اعداد فارسی

### 1. تبدیل و نمایش اعداد

```typescript
// تابع تبدیل اعداد انگلیسی به فارسی
export const toPersianNumbers = (str: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = str.toString();
  for (let i = 0; i < englishDigits.length; i++) {
    result = result.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
  }
  return result;
};

// تابع تبدیل اعداد فارسی به انگلیسی (برای پردازش)
export const toEnglishNumbers = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = str;
  for (let i = 0; i < persianDigits.length; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
  }
  return result;
};
```

### 2. فرمت‌بندی اعداد

```typescript
// نمایش اعداد با فرمت فارسی
export const formatPersianNumber = (num: number): string => {
  const formatted = new Intl.NumberFormat('fa-IR').format(num);
  return formatted;
};

// نمایش مبلغ با واحد ریال
export const formatCurrency = (amount: number): string => {
  return `${formatPersianNumber(amount)} ریال`;
};

// مثال استفاده در کامپوننت
<span className="font-mono">
  {formatCurrency(item.data.estimated_amount)}
</span>
```

## تاریخ و زمان فارسی

### 1. نمایش تاریخ فارسی

```typescript
// استفاده از Intl.DateTimeFormat برای تاریخ فارسی
export const formatPersianDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fa-IR');
};

// نمایش تاریخ و زمان کامل
export const formatPersianDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// مثال استفاده
case "created_at":
  return formatPersianDate(row.data.created_at);
```

### 2. تقویم شمسی (اختیاری)

```typescript
// برای پیاده‌سازی کامل تقویم شمسی می‌توان از کتابخانه‌هایی مثل moment-jalaali استفاده کرد
import moment from 'moment-jalaali';

export const formatJalaliDate = (date: string | Date): string => {
  return moment(date).format('jYYYY/jMM/jDD');
};
```

## مرتب‌سازی فارسی

### 1. الگوریتم مرتب‌سازی فارسی

```typescript
// تابع مقایسه الفبایی فارسی
function persian_alphabetic_compare(s1: string, s2: string): number {
  const persian_alphabet_fix_map: Record<string, number> = {
    ؤ: 1608.5,  // واو همزه‌دار
    ئ: 1609.5,  // یای همزه‌دار
    پ: 1577,    // پ
    ة: 1607.5,  // تای مربوطه
    ژ: 1586.5,  // ژ
    ک: 1603,    // کاف فارسی
    چ: 1580.5,  // چ
    گ: 1603.5,  // گاف
    ی: 1610,    // یای فارسی
  };

  function compare_char_at_index(a: string, b: string, i: number): number {
    if (i >= a.length && i >= b.length) return 0;
    if (i >= a.length) return -1;
    if (i >= b.length) return 1;

    const cmp_value =
      (persian_alphabet_fix_map[a[i]] || a.charCodeAt(i)) -
      (persian_alphabet_fix_map[b[i]] || b.charCodeAt(i));

    if (!cmp_value) return compare_char_at_index(a, b, i + 1);

    return cmp_value;
  }

  return compare_char_at_index(s1, s2, 0);
}
```

### 2. استفاده در جداول

```typescript
// در useTableLogic hook
const sortedItems = useMemo(() => {
  return [...rows].sort((a: Row<TD, S>, b: Row<TD, S>) => {
    const first = a.data[sortDescriptor.column as keyof TD] as string;
    const second = b.data[sortDescriptor.column as keyof TD] as string;

    let cmp = 0;
    if (first !== undefined && second !== undefined) {
      cmp = persian_alphabetic_compare(first, second);
    }

    return sortDescriptor.direction === "descending" ? -cmp : cmp;
  });
}, [sortDescriptor, rows]);
```

## چیدمان RTL

### 1. CSS Classes برای RTL

```css
/* استفاده از Logical Properties */
.rtl-container {
  margin-inline-start: 1rem;  /* به جای margin-left */
  margin-inline-end: 0.5rem;  /* به جای margin-right */
  padding-inline: 1rem;       /* padding افقی */
  border-inline-start: 1px solid; /* border سمت شروع */
}

/* تنظیمات خاص RTL */
.rtl-flex {
  flex-direction: row-reverse; /* معکوس کردن جهت flex */
}

.rtl-text {
  text-align: right;
  direction: rtl;
}
```

### 2. Tailwind CSS RTL

```typescript
// استفاده از کلاس‌های logical در Tailwind
<div className="ms-4 me-2 ps-3 pe-1">
  {/* ms = margin-start, me = margin-end */}
  {/* ps = padding-start, pe = padding-end */}
</div>

// جهت‌دهی عناصر
<div className="flex flex-row-reverse items-center gap-4">
  {/* معکوس کردن جهت flex برای RTL */}
</div>
```

### 3. آیکون‌ها در RTL

```typescript
// معکوس کردن آیکون‌های جهت‌دار
const ChevronIcon = ({ direction = "left" }: { direction?: "left" | "right" }) => {
  const isRTL = document.dir === 'rtl';
  const actualDirection = isRTL ? 
    (direction === "left" ? "right" : "left") : 
    direction;
  
  return (
    <svg className={`transform ${actualDirection === "right" ? "rotate-180" : ""}`}>
      {/* SVG path */}
    </svg>
  );
};
```

## فرم‌ها و ورودی‌ها

### 1. Input Components

```typescript
// کامپوننت Input با پشتیبانی RTL
<Input
  dir="rtl"
  className="text-right"
  placeholder="نام خود را وارد کنید"
  value={value}
  onChange={handleChange}
/>

// Textarea برای متن‌های طولانی
<Textarea
  dir="rtl"
  className="text-right resize-none"
  placeholder="توضیحات را وارد کنید"
  rows={4}
/>
```

### 2. اعتبارسنجی ورودی فارسی

```typescript
// اعتبارسنجی نام فارسی
export const validatePersianName = (name: string): boolean => {
  const persianNameRegex = /^[\u0600-\u06FF\s]+$/;
  return persianNameRegex.test(name.trim());
};

// اعتبارسنجی شماره تلفن ایرانی
export const validateIranianPhone = (phone: string): boolean => {
  const iranPhoneRegex = /^(\+98|0)?9\d{9}$/;
  return iranPhoneRegex.test(phone.replace(/\s/g, ''));
};

// اعتبارسنجی کد ملی
export const validateNationalCode = (code: string): boolean => {
  if (!/^\d{10}$/.test(code)) return false;
  
  const digits = code.split('').map(Number);
  const checksum = digits[9];
  const sum = digits.slice(0, 9).reduce((acc, digit, index) => 
    acc + digit * (10 - index), 0
  );
  
  const remainder = sum % 11;
  return remainder < 2 ? checksum === remainder : checksum === 11 - remainder;
};
```

## جداول RTL

### 1. تنظیمات جدول

```typescript
// تراز ستون‌ها در جدول RTL
<TableColumn
  key={column.uid}
  align={column.uid === "actions" ? "center" : "start"} // start = راست در RTL
  allowsSorting={column.sortable}
>
  {column.name}
</TableColumn>
```

### 2. عملیات جدول

```typescript
// دکمه‌های عملیات با ترتیب RTL
<div className="relative flex items-center gap-4 justify-center">
  <Tooltip content="مشاهده جزئیات">
    <span className="text-lg text-default-400 cursor-pointer">
      <EyeIcon />
    </span>
  </Tooltip>
  <Tooltip content="ویرایش">
    <span className="text-lg text-default-400 cursor-pointer">
      <EditIcon />
    </span>
  </Tooltip>
  <Tooltip color="danger" content="حذف">
    <span className="text-lg text-danger cursor-pointer">
      <DeleteIcon />
    </span>
  </Tooltip>
</div>
```

## Navigation RTL

### 1. Sidebar Navigation

```typescript
// منوی کناری با چیدمان RTL
<div className="w-[180px] h-full border-l-1 pl-2"> {/* border-l در RTL = سمت راست */}
  <Listbox aria-label="sidebar menu" variant="flat">
    <ListboxSection showDivider>
      <ListboxItem key="home" as={Link} href="/dashboard">
        خانه
      </ListboxItem>
    </ListboxSection>
    <ListboxSection showDivider title="فروش">
      <ListboxItem key="clients" as={Link} href="/dashboard/clients">
        مشتری‌ها
      </ListboxItem>
    </ListboxSection>
  </Listbox>
</div>
```

### 2. Breadcrumb Navigation

```typescript
// مسیر صفحه با جهت RTL
<Breadcrumbs separator="/">
  <BreadcrumbItem>داشبورد</BreadcrumbItem>
  <BreadcrumbItem>مشتری‌ها</BreadcrumbItem>
  <BreadcrumbItem>افزودن مشتری جدید</BreadcrumbItem>
</Breadcrumbs>
```

## Modal و Dialog

### 1. Modal RTL

```typescript
<Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
  <ModalContent>
    {(onClose) => (
      <div dir="rtl">
        <ModalHeader className="text-right">
          افزودن مشتری جدید
        </ModalHeader>
        <ModalBody className="text-right">
          {/* محتوای فرم */}
        </ModalBody>
        <ModalFooter className="flex flex-row-reverse gap-2">
          <Button color="primary" type="submit">
            ثبت
          </Button>
          <Button color="danger" variant="light" onPress={onClose}>
            لغو
          </Button>
        </ModalFooter>
      </div>
    )}
  </ModalContent>
</Modal>
```

## تست RTL

### 1. تست نمایش متن فارسی

```typescript
import { render, screen } from '@testing-library/react';

test('displays Persian text correctly', () => {
  render(<ClientCard name="شرکت نمونه" />);
  
  expect(screen.getByText('شرکت نمونه')).toBeInTheDocument();
  expect(screen.getByText('شرکت نمونه')).toHaveStyle('direction: rtl');
});
```

### 2. تست مرتب‌سازی فارسی

```typescript
test('sorts Persian names correctly', () => {
  const names = ['محمد', 'احمد', 'علی'];
  const sorted = names.sort(persian_alphabetic_compare);
  
  expect(sorted).toEqual(['احمد', 'علی', 'محمد']);
});
```

## بهترین شیوه‌ها

### 1. کدنویسی

```typescript
// استفاده از ثابت‌ها برای متن‌های فارسی
const PERSIAN_MESSAGES = {
  SUCCESS: 'عملیات با موفقیت انجام شد.',
  ERROR: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
  LOADING: 'در حال بارگذاری...',
} as const;

// استفاده از enum برای وضعیت‌ها
enum Status {
  ACTIVE = 'فعال',
  INACTIVE = 'غیرفعال',
  PENDING = 'در انتظار',
}
```

### 2. دسترسی‌پذیری

```typescript
// استفاده از aria-label فارسی
<Button aria-label="حذف مشتری">
  <DeleteIcon />
</Button>

// تنظیم lang attribute
<span lang="fa">متن فارسی</span>
```

### 3. عملکرد

```typescript
// بهینه‌سازی فونت فارسی
const estedad = localfont({
  src: "../public/Estedad[KSHD,wght].woff2",
  display: 'swap', // بهبود عملکرد بارگذاری
  preload: true,   // پیش‌بارگذاری فونت
});
```

## مشکلات رایج و راه‌حل‌ها

### 1. مشکل نمایش فونت

```typescript
// اطمینان از بارگذاری صحیح فونت
if (typeof window !== 'undefined') {
  document.fonts.ready.then(() => {
    console.log('فونت‌ها بارگذاری شدند');
  });
}
```

### 2. مشکل جهت متن در Input

```typescript
// تنظیم صریح جهت متن
<Input
  dir="rtl"
  style={{ textAlign: 'right', direction: 'rtl' }}
  placeholder="متن فارسی"
/>
```

### 3. مشکل مرتب‌سازی

```typescript
// اطمینان از تبدیل صحیح رشته‌ها
const sortValue = String(value || '').trim();
```