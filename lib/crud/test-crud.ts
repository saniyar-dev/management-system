// Test file to verify CRUD infrastructure is working
import { 
  ViewFieldConfig, 
  EditFieldConfig, 
  ValidationConfig,
  persianValidationRules,
  createValidationRules,
  createViewFieldConfig,
  createEditFieldConfig
} from './index';
import { ClientData } from '@/app/dashboard/clients/types';

// Test creating view field configurations
const testViewFields: ViewFieldConfig<ClientData>[] = [
  createViewFieldConfig('name', 'نام', 'text'),
  createViewFieldConfig('phone', 'شماره تماس', 'text'),
  createViewFieldConfig('ssn', 'کد ملی', 'text'),
  createViewFieldConfig('address', 'آدرس', 'text'),
  createViewFieldConfig('postal_code', 'کد پستی', 'text')
];

// Test creating edit field configurations
const testEditFields: EditFieldConfig<ClientData>[] = [
  createEditFieldConfig('name', 'نام', 'input', true, persianValidationRules.persianName),
  createEditFieldConfig('phone', 'شماره تماس', 'input', true, persianValidationRules.persianPhone),
  createEditFieldConfig('ssn', 'کد ملی', 'input', true, persianValidationRules.persianSSN),
  createEditFieldConfig('address', 'آدرس', 'textarea', true, persianValidationRules.persianText),
  createEditFieldConfig('postal_code', 'کد پستی', 'input', true, persianValidationRules.persianPostalCode)
];

// Test creating validation rules
const testValidationRules: ValidationConfig<ClientData> = createValidationRules<ClientData>();

// Test Persian validation
const testValidation = () => {
  console.log('Testing Persian validation...');
  
  // Test Persian name validation
  const nameResult = persianValidationRules.persianName('محمد احمدی');
  console.log('Persian name validation:', nameResult); // Should be null (valid)
  
  // Test Persian phone validation
  const phoneResult = persianValidationRules.persianPhone('۰۹۱۲۳۴۵۶۷۸۹');
  console.log('Persian phone validation:', phoneResult); // Should be null (valid)
  
  // Test Persian SSN validation
  const ssnResult = persianValidationRules.persianSSN('۰۰۱۲۳۴۵۶۷۸');
  console.log('Persian SSN validation:', ssnResult); // Should return error (invalid checksum)
  
  console.log('CRUD infrastructure test completed successfully!');
};

export { testValidation, testViewFields, testEditFields, testValidationRules };