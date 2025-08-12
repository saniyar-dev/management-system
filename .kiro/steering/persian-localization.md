# Persian Localization Guidelines - Siman Ban Dashboard

## Language Standards
- **Primary Language**: Persian/Farsi (fa-IR)
- **Text Direction**: Right-to-Left (RTL)
- **Character Encoding**: UTF-8
- **Font**: Estedad (locally hosted)

## Persian Typography Rules
- Use proper Persian punctuation (، instead of ,)
- Use Persian question mark (؟) instead of (?)
- Use Persian numbers (۰۱۲۳۴۵۶۷۸۹) for display
- Maintain proper letter connections in Persian text
- Use ZWNJ (Zero Width Non-Joiner) where appropriate

## Number Formatting
- **Display**: Use Persian numerals (۱۲۳۴۵۶۷۸۹۰)
- **Input**: Accept both Persian and English numerals
- **Currency**: Iranian Rial (ریال) formatting
- **Thousands Separator**: Use Persian comma (،)
- **Decimal Point**: Use Persian decimal separator

## Date and Time
- **Calendar**: Persian (Jalali) calendar support
- **Date Format**: yyyy/mm/dd (Persian numerals)
- **Time Format**: 24-hour format with Persian numerals
- **Weekdays**: Use Persian weekday names
- **Months**: Use Persian month names

## Common Persian Translations
- **Dashboard**: داشبورد / پنل مدیریت
- **Clients**: مشتری‌ها
- **Orders**: سفارش‌ها
- **Invoices**: فاکتورها
- **Search**: جستجو
- **Add**: افزودن
- **Edit**: ویرایش
- **Delete**: حذف
- **Save**: ذخیره
- **Cancel**: لغو
- **Status**: وضعیت
- **Active**: فعال
- **Inactive**: غیرفعال
- **Pending**: در انتظار
- **Completed**: تکمیل شده

## RTL Layout Considerations
- Flip horizontal layouts and alignments
- Mirror directional icons (arrows, chevrons)
- Adjust padding/margin for RTL flow
- Test scrolling behavior in RTL context
- Ensure proper text alignment (right-aligned for Persian)

## Input Validation
- Support Persian keyboard input
- Validate Persian text patterns
- Handle mixed Persian/English input
- Proper Persian name validation
- Persian phone number formats