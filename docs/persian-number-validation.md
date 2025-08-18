# Persian Number Validation Improvements

## Overview

This document describes the improvements made to form validation to support both Persian (۰۱۲۳۴۵۶۷۸۹) and English (0123456789) numbers in all text input fields.

## What Was Changed

### 1. Enhanced Persian Validation Rules

Updated the Persian validation regex patterns to accept both Persian and English numbers:

```typescript
// Before: Only English numbers
const PERSIAN_PHONE_REGEX = /^(\+98|0)?9\d{9}$/;

// After: Both Persian and English numbers
const PERSIAN_PHONE_REGEX = /^(\+98|0)?9[\d۰-۹]{9}$/;
```

### 2. New Persian-Aware Input Components

Created custom input components that handle Persian number conversion:

- `PersianInput`: Enhanced Input component with Persian number support
- `PersianTextarea`: Enhanced Textarea component with Persian number support

#### Features:
- **Real-time conversion**: Persian numbers are converted to English for processing
- **Display flexibility**: Can show Persian numbers to users while storing English numbers
- **Seamless integration**: Drop-in replacement for standard HeroUI components

### 3. Form Data Normalization

Added `normalizeFormData()` function that automatically converts Persian numbers to English before form submission:

```typescript
// Before form validation/submission
const normalizedFormData = normalizeFormData(formData);
```

### 4. Updated Modal Components

Modified `AddModal` and `EditModal` components to use the new Persian-aware inputs:

- All text inputs now support Persian numbers
- Number fields use text input with Persian number conversion
- Form data is normalized before validation and submission

## How It Works

### Input Flow
1. User types Persian numbers (e.g., "۰۹۱۲۳۴۵۶۷۸۹")
2. Component displays Persian numbers to user
3. Internally converts to English numbers ("09123456789")
4. Form submission uses English numbers for processing

### Validation Flow
1. Form data is normalized (Persian → English numbers)
2. Validation rules check the English number format
3. Database stores English numbers
4. Display can show Persian numbers to users

## Benefits

### For Users
- Can type numbers in Persian (natural for Persian speakers)
- Can type numbers in English (familiar format)
- Can mix Persian and English numbers
- Consistent Persian number display

### For Developers
- Consistent English numbers in database
- Existing validation logic works unchanged
- No breaking changes to existing forms
- Easy to implement in new forms

### For System
- Data consistency (all numbers stored as English)
- Backward compatibility maintained
- Improved user experience
- Better accessibility for Persian users

## Usage Examples

### Basic Input
```typescript
<PersianInput
  label="شماره موبایل"
  name="phone"
  allowNumbers={true}
  displayPersianNumbers={true}
/>
```

### Number-Only Field
```typescript
<PersianInput
  label="مبلغ"
  name="amount"
  type="text"
  allowNumbers={true}
  displayPersianNumbers={true}
/>
```

### Text with Numbers
```typescript
<PersianTextarea
  label="آدرس"
  name="address"
  allowNumbers={true}
  displayPersianNumbers={true}
/>
```

## Testing

Comprehensive tests ensure:
- Persian to English number conversion
- English to Persian number conversion
- Mixed number handling
- Form data normalization
- Validation with both number formats

Run tests with:
```bash
npx vitest run lib/utils/__tests__/persian-validation.test.ts
```

## Migration Guide

### For Existing Forms
1. Replace `Input` with `PersianInput`
2. Replace `Textarea` with `PersianTextarea`
3. Add `normalizeFormData()` call before form processing
4. No changes needed to validation rules or database

### For New Forms
- Use `PersianInput` and `PersianTextarea` by default
- Set `allowNumbers={true}` for fields that may contain numbers
- Set `displayPersianNumbers={true}` for Persian number display

## Configuration Options

### PersianInput/PersianTextarea Props
- `allowNumbers`: Enable Persian number conversion (default: true)
- `displayPersianNumbers`: Show Persian numbers to user (default: true)
- All other HeroUI Input/Textarea props are supported

### Validation Rules
All existing Persian validation rules now support both number formats:
- `persianPhone`: Phone number validation
- `persianSSN`: National ID validation
- `persianPostalCode`: Postal code validation
- `currency`: Currency amount validation

## Performance Impact

- Minimal performance impact
- Number conversion is lightweight
- No additional network requests
- Client-side processing only

## Browser Support

Works in all modern browsers that support:
- ES2015+ JavaScript features
- Unicode character handling
- FormData API

## Future Enhancements

Potential future improvements:
- Automatic Persian number display based on user locale
- Number formatting with thousands separators
- Currency formatting with Persian numerals
- Date input with Persian calendar support