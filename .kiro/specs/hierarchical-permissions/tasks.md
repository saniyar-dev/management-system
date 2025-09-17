# Implementation Plan

- [x] 1. Create panel_users table and modify client table schema
  - Add panel_users table with proper constraints and indexes
  - Add permission_mask and panel_user_id columns to client table
  - Create foreign key relationships and constraints
  - Add performance indexes for permission-based queries
  - _Requirements: 5.2, 5.3, 5.4, 6.1, 6.3, 6.4, 6.5_

- [x] 2. Implement core permission filtering function
  - Create get_filtered_clients_with_permissions function with proper signature
  - Implement bitmask-based permission filtering logic
  - Add mutability calculation based on ownership and creation date
  - Include proper error handling and edge case management
  - _Requirements: 2.5, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 5.5, 5.6_

- [ ] 3. Implement supporting count function for pagination
  - Create get_filtered_clients_total_with_permissions function
  - Implement same permission filtering logic for count queries
  - Ensure consistent filtering between main and count functions
  - Add proper parameter validation and error handling
  - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.5_

- [ ] 4. Add database indexes for performance optimization
  - Create index on client.permission_mask for filtering performance
  - Create index on client.panel_user_id for ownership checks
  - Create composite index for common permission + user queries
  - Create index on client.created_at for mutability date calculations
  - _Requirements: 5.1, 7.4_

- [ ] 5. Update existing client functions to respect permissions
  - Modify filter_client_paginated function to use permission system
  - Update filtered_client_total function to include permission filtering
  - Ensure backward compatibility with existing function signatures
  - Add permission parameters to existing functions
  - _Requirements: 3.1, 3.2, 5.1, 7.1, 7.2_

- [ ] 6. Create data migration scripts for existing clients
  - Write script to assign default permission_mask (15) to existing clients
  - Create default panel users for system initialization
  - Update existing clients with appropriate panel_user_id values
  - Validate data integrity after migration
  - _Requirements: 6.1, 6.4, 7.4_

- [ ] 7. Add comprehensive unit tests for permission functions
  - Test all bitmask combinations for user and client permissions
  - Test mutability logic with various creation dates and ownership scenarios
  - Test edge cases like invalid permission masks and missing users
  - Test performance with large datasets
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.5, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Update TypeScript types to reflect new database schema
  - Add panel_users table types to Database interface
  - Update client table types to include permission_mask and panel_user_id
  - Add function signatures for new permission functions
  - Update existing function types to include permission parameters
  - _Requirements: 5.6, 6.1, 6.2, 7.4_

- [ ] 9. Create database validation and constraint tests
  - Test CHECK constraint on permission_mask values (1, 2, 4, 8)
  - Test foreign key constraints between client and panel_users tables
  - Test NOT NULL constraints on critical fields
  - Verify referential integrity under various scenarios
  - _Requirements: 1.4, 5.3, 5.4, 6.2, 6.5_

- [ ] 10. Implement error handling and logging for permission system
  - Add proper error messages for permission violations
  - Implement logging for permission-related database operations
  - Create monitoring for performance and security issues
  - Add validation for function input parameters
  - _Requirements: 5.1, 5.5, 7.3_