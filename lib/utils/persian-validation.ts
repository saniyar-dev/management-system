import { PersianValidationRules } from "../action/crud-types";

// Persian character regex patterns
const PERSIAN_TEXT_REGEX = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d۰-۹]+$/;
const PERSIAN_NAME_REGEX = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/;
const PERSIAN_PHONE_REGEX = /^(\+98|0)?9\d{9}$/;
const PERSIAN_SSN_REGEX = /^\d{10}$/;
const PERSIAN_POSTAL_CODE_REGEX = /^\d{10}$/;

// Persian number conversion utilities
export const convertPersianToEnglish = (str: string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = str;
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
  }
  return result;
};

export const convertEnglishToPersian = (str: string): string => {
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  let result = str;
  for (let i = 0; i < englishNumbers.length; i++) {
    result = result.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
  }
  return result;
};

// Format Persian currency
export const formatPersianCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} ریال`;
};

// Format Persian date
export const formatPersianDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fa-IR');
};

// Persian validation rules implementation
export const persianValidationRules: PersianValidationRules = {
  persianText: (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'این فیلد الزامی است';
    }
    if (!PERSIAN_TEXT_REGEX.test(value.trim())) {
      return 'لطفاً متن را به فارسی وارد کنید';
    }
    return null;
  },

  persianName: (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'نام الزامی است';
    }
    if (value.trim().length < 2) {
      return 'نام باید حداقل ۲ کاراکتر باشد';
    }
    if (!PERSIAN_NAME_REGEX.test(value.trim())) {
      return 'لطفاً نام را به فارسی وارد کنید';
    }
    return null;
  },

  persianPhone: (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'شماره تلفن الزامی است';
    }
    
    const englishValue = convertPersianToEnglish(value.trim());
    if (!PERSIAN_PHONE_REGEX.test(englishValue)) {
      return 'شماره تلفن معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)';
    }
    return null;
  },

  persianSSN: (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'کد ملی الزامی است';
    }
    
    const englishValue = convertPersianToEnglish(value.trim());
    if (!PERSIAN_SSN_REGEX.test(englishValue)) {
      return 'کد ملی باید ۱۰ رقم باشد';
    }
    
    // Iranian national code validation algorithm
    const digits = englishValue.split('').map(Number);
    const checkDigit = digits[9];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    
    const remainder = sum % 11;
    const expectedCheckDigit = remainder < 2 ? remainder : 11 - remainder;
    
    if (checkDigit !== expectedCheckDigit) {
      return 'کد ملی معتبر نیست';
    }
    
    return null;
  },

  persianPostalCode: (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'کد پستی الزامی است';
    }
    
    const englishValue = convertPersianToEnglish(value.trim());
    if (!PERSIAN_POSTAL_CODE_REGEX.test(englishValue)) {
      return 'کد پستی باید ۱۰ رقم باشد';
    }
    return null;
  },

  currency: (value: string | number): string | null => {
    if (value === '' || value === null || value === undefined) {
      return 'مبلغ الزامی است';
    }
    
    const numValue = typeof value === 'string' ? 
      parseFloat(convertPersianToEnglish(value)) : value;
    
    if (isNaN(numValue)) {
      return 'مبلغ معتبر نیست';
    }
    
    if (numValue < 0) {
      return 'مبلغ نمی‌تواند منفی باشد';
    }
    
    return null;
  },

  positiveNumber: (value: string | number): string | null => {
    if (value === '' || value === null || value === undefined) {
      return 'این فیلد الزامی است';
    }
    
    const numValue = typeof value === 'string' ? 
      parseFloat(convertPersianToEnglish(value)) : value;
    
    if (isNaN(numValue)) {
      return 'عدد معتبر نیست';
    }
    
    if (numValue <= 0) {
      return 'عدد باید مثبت باشد';
    }
    
    return null;
  }
};

// Business rule validation utilities
export const businessRuleValidators = {
  // Check if client has required fields for order creation
  validateClientForOrder: (clientData: any): string | null => {
    if (!clientData.name || !clientData.phone || !clientData.address) {
      return 'اطلاعات مشتری ناکامل است. لطفاً ابتدا اطلاعات مشتری را تکمیل کنید';
    }
    return null;
  },

  // Check if order can be edited (not invoiced)
  validateOrderEditable: (orderStatus: string): string | null => {
    if (orderStatus === 'invoiced') {
      return 'سفارش فاکتور شده قابل ویرایش نیست';
    }
    return null;
  },

  // Check if pre-order can be converted to order
  validatePreOrderConversion: (preOrderStatus: string): string | null => {
    if (preOrderStatus !== 'approved') {
      return 'فقط پیش سفارش‌های تایید شده قابل تبدیل به سفارش هستند';
    }
    return null;
  },

  // Validate status transitions
  validateStatusTransition: (currentStatus: string, newStatus: string, allowedTransitions: Record<string, string[]>): string | null => {
    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return `تغییر وضعیت از ${currentStatus} به ${newStatus} مجاز نیست`;
    }
    return null;
  }
};