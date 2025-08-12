# پنل مدیریت سیمان بان (Siman Ban Management Dashboard)

سیستم مدیریت داخلی شرکت سیمان بان برای مدیریت مشتریان، سفارش‌ها و عملیات مالی.

## ویژگی‌های کلیدی

- **مدیریت مشتریان**: ثبت و مدیریت اطلاعات مشتریان حقیقی و حقوقی
- **مدیریت پیش سفارش‌ها**: ثبت و پیگیری درخواست‌های اولیه مشتریان
- **مدیریت سفارش‌ها**: تبدیل پیش سفارش‌ها به سفارش‌های تایید شده
- **مدیریت پیش فاکتور و فاکتور**: صدور و مدیریت اسناد مالی
- **طراحی RTL**: پشتیبانی کامل از زبان فارسی و چیدمان راست به چپ
- **رابط کاربری مدرن**: استفاده از HeroUI v2 با طراحی تجاری

## تکنولوژی‌های استفاده شده

- **Framework**: [Next.js 15](https://nextjs.org/) با App Router
- **UI Library**: [HeroUI v2](https://heroui.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Font**: Estedad (فونت محلی فارسی)
- **Testing**: [Vitest](https://vitest.dev/)

## ساختار پروژه

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # صفحات داشبورد
│   │   ├── clients/       # مدیریت مشتریان
│   │   ├── pre-orders/    # مدیریت پیش سفارش‌ها
│   │   ├── orders/        # مدیریت سفارش‌ها
│   │   ├── pre-invoices/  # مدیریت پیش فاکتورها
│   │   └── invoices/      # مدیریت فاکتورها
│   └── login/             # صفحه ورود
├── components/            # کامپوننت‌های مشترک
├── lib/                   # منطق تجاری و ابزارها
│   ├── action/           # Server Actions
│   ├── supabase/         # تنظیمات Supabase
│   ├── hooks.tsx         # Custom Hooks
│   └── types.ts          # تعریف انواع داده
├── .kiro/steering/       # راهنماهای توسعه
└── docs/                 # مستندات
```

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+ 
- npm/yarn/pnpm
- حساب Supabase

### مراحل نصب

1. **کلون کردن پروژه**
```bash
git clone <repository-url>
cd siman-ban-dashboard
```

2. **نصب وابستگی‌ها**
```bash
npm install
# یا
yarn install
# یا
pnpm install
```

3. **تنظیم متغیرهای محیطی**
```bash
cp .env.example .env
```

فایل `.env` را با اطلاعات Supabase خود تکمیل کنید:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **راه‌اندازی پایگاه داده**
```bash
npx supabase start
npx supabase db reset
```

5. **اجرای سرور توسعه**
```bash
npm run dev
```

پروژه در آدرس `http://localhost:3000` در دسترس خواهد بود.

## ویژگی‌های فنی

### پشتیبانی از زبان فارسی
- **RTL Layout**: چیدمان کامل راست به چپ
- **Persian Typography**: استفاده از فونت Estedad
- **Persian Numbers**: نمایش اعداد فارسی
- **Persian Date**: پشتیبانی از تقویم شمسی
- **Persian Sorting**: مرتب‌سازی بر اساس الفبای فارسی

### useTableLogic Hook
هوک سفارشی برای مدیریت جداول با قابلیت‌های:
- صفحه‌بندی (Pagination)
- فیلتر کردن (Filtering)
- مرتب‌سازی (Sorting)
- جستجو (Search)
- مدیریت ستون‌ها (Column Management)

### معماری کامپوننت‌ها
- **Server Components**: برای بهینه‌سازی عملکرد
- **Client Components**: برای تعامل کاربر
- **Custom Hooks**: برای منطق تجاری
- **Type Safety**: استفاده کامل از TypeScript با تعریف دقیق انواع
- **Jobs System**: سیستم مدیریت و نمایش وضعیت کارها

## دستورات مفید

```bash
# اجرای سرور توسعه
npm run dev

# ساخت پروژه برای تولید
npm run build

# اجرای تست‌ها
npm run test

# بررسی کیفیت کد
npm run lint

# اجرای تست‌ها با UI
npm run test:ui
```

## مستندات

- [راهنمای useTableLogic](./docs/useTableLogic-documentation.md)
- [استانداردهای کدنویسی](./.kiro/steering/coding-standards.md)
- [راهنمای طراحی UI](./.kiro/steering/ui-design-system.md)
- [منطق تجاری](./.kiro/steering/business-logic.md)

## ساختار داده‌ها

### موجودیت‌های اصلی
1. **مشتریان (Clients)** - مدیریت اطلاعات مشتریان
2. **پیش سفارش‌ها (Pre-Orders)** - درخواست‌های اولیه
3. **سفارش‌ها (Orders)** - سفارش‌های تایید شده
4. **پیش فاکتورها (Pre-Invoices)** - پیش‌نویس فاکتورها
5. **فاکتورها (Invoices)** - فاکتورهای نهایی

### جریان کاری
```
مشتری → پیش سفارش → سفارش → پیش فاکتور → فاکتور
```

## مشارکت در توسعه

1. Fork کردن پروژه
2. ایجاد branch جدید (`git checkout -b feature/amazing-feature`)
3. Commit کردن تغییرات (`git commit -m 'Add some amazing feature'`)
4. Push کردن به branch (`git push origin feature/amazing-feature`)
5. ایجاد Pull Request

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. برای جزئیات بیشتر فایل [LICENSE](LICENSE) را مطالعه کنید.
