# مستندات پنل مدیریت سیمان بان

## فهرست مطالب

### 📋 مستندات کلی
- [نمای کلی پروژه](../README.md)
- [معماری سیستم](./architecture-overview.md)
- [راهنمای کامپوننت‌ها](./components-guide.md)

### 🔧 راهنماهای فنی
- [مستندات API](./api-documentation.md)
- [راهنمای useTableLogic](./useTableLogic-documentation.md)
- [پیاده‌سازی فارسی و RTL](./persian-rtl-guide.md)

### 🚀 استقرار و عملیات
- [راهنمای استقرار](./deployment-guide.md)

### 📁 راهنماهای توسعه (.kiro/steering)
- [نمای کلی پروژه](../.kiro/steering/project-overview.md)
- [منطق تجاری](../.kiro/steering/business-logic.md)
- [استانداردهای کدنویسی](../.kiro/steering/coding-standards.md)
- [سیستم طراحی UI](../.kiro/steering/ui-design-system.md)
- [محلی‌سازی فارسی](../.kiro/steering/persian-localization.md)
- [استانداردهای تست](../.kiro/steering/testing-standards.md)
- [طرح پایگاه داده](../.kiro/steering/database-schema.md)
- [عملیات و استقرار](../.kiro/steering/deployment-operations.md)

## شروع سریع

### نصب و راه‌اندازی

```bash
# کلون پروژه
git clone <repository-url>
cd siman-ban-dashboard

# نصب وابستگی‌ها
npm install

# تنظیم متغیرهای محیطی
cp .env.example .env

# اجرای سرور توسعه
npm run dev
```

### ساختار پروژه

```
siman-ban-dashboard/
├── app/                    # Next.js App Router
│   ├── dashboard/         # صفحات داشبورد
│   │   ├── clients/       # مدیریت مشتریان
│   │   ├── pre-orders/    # پیش سفارش‌ها
│   │   ├── orders/        # سفارش‌ها
│   │   ├── pre-invoices/  # پیش فاکتورها
│   │   └── invoices/      # فاکتورها
│   └── login/             # احراز هویت
├── components/            # کامپوننت‌های مشترک
├── lib/                   # منطق تجاری
│   ├── action/           # Server Actions
│   ├── supabase/         # تنظیمات Supabase
│   └── hooks.tsx         # Custom Hooks
├── docs/                  # مستندات
└── .kiro/steering/       # راهنماهای توسعه
```

## ویژگی‌های کلیدی

### 🏢 مدیریت تجاری
- **مشتریان**: ثبت و مدیریت مشتریان حقیقی و حقوقی
- **پیش سفارش‌ها**: مدیریت درخواست‌های اولیه
- **سفارش‌ها**: تبدیل و مدیریت سفارش‌های تایید شده
- **فاکتورسازی**: صدور پیش فاکتور و فاکتور نهایی

### 🌐 پشتیبانی فارسی
- **RTL Layout**: چیدمان کامل راست به چپ
- **فونت فارسی**: استفاده از فونت Estedad
- **اعداد فارسی**: نمایش و پردازش اعداد فارسی
- **مرتب‌سازی فارسی**: الگوریتم مرتب‌سازی بر اساس الفبای فارسی

### ⚡ عملکرد و تکنولوژی
- **Next.js 15**: با App Router و Server Components
- **HeroUI v2**: کامپوننت‌های UI مدرن
- **Supabase**: پایگاه داده و احراز هویت
- **TypeScript**: Type Safety کامل

## راهنماهای سریع

### ایجاد ماژول جدید

1. **ایجاد ساختار فایل‌ها**:
```bash
mkdir app/dashboard/new-module
touch app/dashboard/new-module/{page.tsx,types.tsx,addNew.tsx}
```

2. **تعریف انواع داده**:
```typescript
// types.tsx
export type NewModuleData = RowData & {
  name: string;
  description: string;
};

export type Status = "active" | "inactive";
```

3. **پیاده‌سازی صفحه**:
```typescript
// page.tsx
export default function NewModulePage() {
  const { /* useTableLogic props */ } = useTableLogic(
    statusOptions,
    columns,
    INITIAL_VISIBLE_COLUMNS,
    GetNewModuleData,
    GetTotalNewModuleData,
    AddNewModuleComponent
  );
  
  // renderCell و JSX
}
```

### اضافه کردن Server Action

```typescript
// lib/action/new-module.ts
export const GetNewModuleData: GetRowsFn<NewModuleData, Status> = async (
  start, end, clientType, status, searchTerm, limit, page
) => {
  try {
    // منطق Supabase query
    return {
      message: "داده‌ها با موفقیت دریافت شدند.",
      success: true,
      data: results
    };
  } catch (error) {
    return {
      message: "خطا در دریافت داده‌ها.",
      success: false
    };
  }
};
```

## مشارکت در توسعه

### قوانین کدنویسی

1. **TypeScript**: استفاده کامل از TypeScript
2. **Persian-First**: تمام متن‌ها به فارسی
3. **RTL Support**: پشتیبانی کامل از RTL
4. **Component Patterns**: پیروی از الگوهای موجود

### فرآیند توسعه

1. Fork کردن پروژه
2. ایجاد branch جدید
3. پیاده‌سازی تغییرات
4. نوشتن تست
5. ایجاد Pull Request

### تست

```bash
# اجرای تست‌ها
npm run test

# تست با UI
npm run test:ui

# بررسی کیفیت کد
npm run lint
```

## پشتیبانی

### مشکلات رایج

#### 1. مشکل فونت فارسی
```typescript
// اطمینان از بارگذاری فونت
import localfont from "next/font/local";

const estedad = localfont({
  src: "../public/Estedad[KSHD,wght].woff2",
});
```

#### 2. مشکل RTL در کامپوننت‌ها
```typescript
// استفاده از logical properties
<div className="ms-4 me-2"> {/* به جای ml-4 mr-2 */}
```

#### 3. مشکل مرتب‌سازی فارسی
```typescript
// استفاده از تابع مرتب‌سازی فارسی
items.sort((a, b) => persian_alphabetic_compare(a.name, b.name));
```

### لاگ‌های مفید

```bash
# لاگ‌های توسعه
npm run dev

# لاگ‌های build
npm run build

# لاگ‌های تست
npm run test -- --reporter=verbose
```

## منابع اضافی

### مستندات خارجی
- [Next.js Documentation](https://nextjs.org/docs)
- [HeroUI Documentation](https://heroui.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### ابزارهای توسعه
- [VS Code Extensions](https://code.visualstudio.com/docs/languages/typescript)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## تاریخچه تغییرات

### نسخه فعلی
- پیاده‌سازی کامل ماژول مشتریان
- پیاده‌سازی ماژول پیش سفارش‌ها
- سیستم useTableLogic کامل
- پشتیبانی کامل از فارسی و RTL
- مستندات جامع

### برنامه آینده
- تکمیل ماژول سفارش‌ها
- پیاده‌سازی سیستم فاکتورسازی
- گزارش‌گیری و آمار
- پنل مدیریت کاربران
- API خارجی برای یکپارچه‌سازی

---

**نکته**: این مستندات به‌طور مداوم به‌روزرسانی می‌شوند. برای آخرین تغییرات، لطفاً repository را بررسی کنید.