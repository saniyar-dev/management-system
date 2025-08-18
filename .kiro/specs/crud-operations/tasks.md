# Implementation Plan

- [x] 1. Create core CRUD infrastructure and shared types
  - Create shared TypeScript interfaces for CRUD operations
  - Implement base field configuration system
  - Create reusable validation utilities for Persian text and business rules
  - _Requirements: 1.1, 2.1, 3.1, 6.1_

- [x] 2. Implement base CRUD modal components
  - [x] 2.1 Create ViewModal base component with Persian RTL layout
    - Write ViewModal component with draggable functionality and job integration
    - Implement field rendering system for different data types (text, date, currency, status)
    - Add Persian number and date formatting utilities
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.4_

  - [x] 2.2 Create EditModal base component with form validation
    - Write EditModal component extending AddClient pattern
    - Implement form field rendering with Persian labels and RTL layout
    - Add client-side validation with Persian error messages
    - _Requirements: 2.1, 2.2, 2.6, 5.1, 5.2_

  - [x] 2.3 Create DeleteModal confirmation component
    - Write DeleteModal component with entity details display
    - Implement confirmation dialog with Persian text
    - Add dependency checking integration
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

- [x] 3. Extend server actions for CRUD operations
  - [x] 3.1 Add update operations to client server actions
    - Implement UpdateClient server action with validation
    - Add business rule validation for client data
    - Create unit tests for client update operations
    - _Requirements: 2.3, 2.4, 6.1_

  - [x] 3.2 Add delete operations to client server actions
    - Implement DeleteClient server action with dependency checking
    - Add cascade deletion handling for related records
    - Create unit tests for client deletion operations
    - _Requirements: 3.3, 3.6, 3.7_

  - [x] 3.3 Add dependency checking utilities
    - Implement CheckClientDependencies function
    - Create generic dependency checking pattern for all entities
    - Add unit tests for dependency validation
    - _Requirements: 3.6, 6.3_

- [x] 4. Create client CRUD components
  - [x] 4.1 Implement ViewClient component
    - Create ViewClient component using ViewModal base
    - Configure client-specific field display with Persian labels
    - Integrate with client job configuration
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2_

  - [x] 4.2 Implement EditClient component
    - Create EditClient component using EditModal base
    - Configure client-specific form fields with validation
    - Handle personal/company type switching
    - _Requirements: 2.1, 2.2, 2.3, 6.1_

  - [x] 4.3 Implement DeleteClient component
    - Create DeleteClient component using DeleteModal base
    - Configure client-specific dependency checking
    - Handle related records cleanup
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

- [x] 5. Update client page with CRUD action buttons
  - Modify clients/page.tsx to include View, Edit, Delete action buttons
  - Update renderCell function to display action icons with tooltips
  - Integrate CRUD components with existing table structure
  - _Requirements: 1.1, 2.1, 3.1, 5.3_

- [ ] 6. Extend CRUD operations to pre-orders entity
  - [ ] 6.1 Create pre-order server actions for update and delete
    - Implement UpdatePreOrder and DeletePreOrder server actions
    - Add pre-order specific validation rules
    - Create unit tests for pre-order CRUD operations
    - _Requirements: 2.3, 3.3, 6.2, 6.5_

  - [ ] 6.2 Implement pre-order CRUD components
    - Create ViewPreOrder, EditPreOrder, DeletePreOrder components
    - Configure pre-order specific field configurations
    - Handle status transition validation
    - _Requirements: 1.1, 2.1, 3.1, 6.5_

  - [ ] 6.3 Update pre-orders page with CRUD functionality
    - Modify pre-orders/page.tsx to include CRUD action buttons
    - Integrate pre-order CRUD components
    - Test pre-order workflow with job integration
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 7. Extend CRUD operations to orders entity
  - [ ] 7.1 Create order server actions for update and delete
    - Implement UpdateOrder and DeleteOrder server actions
    - Add order-specific business rule validation (prevent changes if invoiced)
    - Create unit tests for order CRUD operations
    - _Requirements: 2.3, 3.3, 6.2_

  - [ ] 7.2 Implement order CRUD components
    - Create ViewOrder, EditOrder, DeleteOrder components
    - Configure order-specific field configurations with financial formatting
    - Handle order status validation and transitions
    - _Requirements: 1.1, 2.1, 3.1, 6.2, 5.4_

  - [ ] 7.3 Update orders page with CRUD functionality
    - Modify orders/page.tsx to include CRUD action buttons
    - Integrate order CRUD components
    - Test order workflow with job integration
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 8. Extend CRUD operations to pre-invoices entity
  - [ ] 8.1 Create pre-invoice server actions for update and delete
    - Implement UpdatePreInvoice and DeletePreInvoice server actions
    - Add financial validation for amounts and calculations
    - Create unit tests for pre-invoice CRUD operations
    - _Requirements: 2.3, 3.3, 6.4_

  - [ ] 8.2 Implement pre-invoice CRUD components
    - Create ViewPreInvoice, EditPreInvoice, DeletePreInvoice components
    - Configure financial field formatting with Persian currency
    - Handle pre-invoice to invoice conversion validation
    - _Requirements: 1.1, 2.1, 3.1, 5.4, 6.4_

  - [ ] 8.3 Update pre-invoices page with CRUD functionality
    - Modify pre-invoices/page.tsx to include CRUD action buttons
    - Integrate pre-invoice CRUD components
    - Test pre-invoice workflow with job integration
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 9. Extend CRUD operations to invoices entity
  - [ ] 9.1 Create invoice server actions for update and delete
    - Implement UpdateInvoice and DeleteInvoice server actions
    - Add invoice-specific validation and finalization rules
    - Create unit tests for invoice CRUD operations
    - _Requirements: 2.3, 3.3, 6.4_

  - [ ] 9.2 Implement invoice CRUD components
    - Create ViewInvoice, EditInvoice, DeleteInvoice components
    - Configure invoice-specific field configurations
    - Handle invoice finalization and payment tracking
    - _Requirements: 1.1, 2.1, 3.1, 5.4_

  - [ ] 9.3 Update invoices page with CRUD functionality
    - Modify invoices/page.tsx to include CRUD action buttons
    - Integrate invoice CRUD components
    - Test complete invoice workflow with job integration
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 10. Add comprehensive error handling and validation
  - Implement Persian error message system across all CRUD operations
  - Add comprehensive validation for all entity types
  - Create error boundary components for CRUD modals
  - _Requirements: 2.4, 3.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 11. Create integration tests for complete CRUD workflows
  - Write integration tests for each entity's complete CRUD workflow
  - Test job integration and real-time status updates
  - Test Persian formatting and RTL layout functionality
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4_