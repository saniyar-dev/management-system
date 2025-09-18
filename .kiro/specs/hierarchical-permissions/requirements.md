# Requirements Document

## Introduction

This feature implements a hierarchical, bitmask-based permission system for the Siman Ban admin panel's client management. The system will control which panel users can view and edit which clients based on a layer-based access system. The implementation must be entirely within PostgreSQL functions to maintain the Supabase-only architecture.

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to define hierarchical permission layers for panel users, so that I can control access to client data based on organizational hierarchy.

#### Acceptance Criteria

1. WHEN a panel user is created THEN the system SHALL assign them a layer represented by a bitmask (1, 2, 4, 8 for layers 1-4 respectively)
2. WHEN defining user layers THEN the system SHALL use single-bit bitmasks (Layer 1: 1, Layer 2: 2, Layer 3: 4, Layer 4: 8)
3. IF a user is assigned Layer 4 THEN they SHALL have manager-level permissions
4. WHEN storing user permissions THEN the system SHALL use integer values as bitmasks

### Requirement 2

**User Story:** As a system administrator, I want to assign access layers to clients, so that I can control which user levels can access specific client data.

#### Acceptance Criteria

1. WHEN a client is created THEN the system SHALL assign them an access mask defining which user layers can access it
2. WHEN defining client access THEN the system SHALL use hierarchical bitmasks (15: all layers, 14: layer 2+, 12: layer 3+, 8: layer 4 only)
3. IF a client has access mask 15 THEN users from all layers SHALL be able to access it
4. IF a client has access mask 8 THEN only Layer 4 (manager) users SHALL be able to access it
5. WHEN determining access THEN the system SHALL use the rule: (user_mask & client_mask) === user_mask

### Requirement 3

**User Story:** As a panel user, I want to see only the clients I have permission to access, so that I don't see unauthorized client data.

#### Acceptance Criteria

1. WHEN a user requests client data THEN the system SHALL filter results based on permission masks
2. WHEN filtering clients THEN the system SHALL only return clients where (user_mask & client_mask) === user_mask
3. IF a user lacks permission for a client THEN that client SHALL NOT appear in their results
4. WHEN no clients match permissions THEN the system SHALL return an empty result set

### Requirement 4

**User Story:** As a panel user, I want to know which clients I can edit versus view-only, so that the UI can show appropriate controls.

#### Acceptance Criteria

1. WHEN returning client data THEN the system SHALL include an is_mutable boolean field for each client
2. IF the current user created the client THEN is_mutable SHALL be true regardless of creation date
3. IF another user created the client AND it was created more than 3 weeks ago THEN is_mutable SHALL be true
4. IF another user created the client AND it was created less than 3 weeks ago THEN is_mutable SHALL be false
5. WHEN calculating creation time THEN the system SHALL use (NOW() - INTERVAL '3 weeks') as the threshold

### Requirement 5

**User Story:** As a developer, I want the permission system implemented as PostgreSQL functions, so that it integrates seamlessly with our Supabase-only architecture.

#### Acceptance Criteria

1. WHEN implementing the system THEN all logic SHALL be contained within PostgreSQL functions
2. WHEN creating database changes THEN the system SHALL add permission_mask and panel_user_id columns to the client table
3. IF the permission_mask column is added THEN it SHALL be INTEGER type and NOT NULL
4. IF the panel_user_id column is added THEN it SHALL reference the panel_users table primary key
5. WHEN creating the main function THEN it SHALL accept requesting_user_id and requesting_user_mask parameters
6. WHEN returning data THEN the function SHALL return SETOF clients with the additional is_mutable column

### Requirement 6

**User Story:** As a system administrator, I want a panel_users table to manage user permissions, so that I can assign and track user access levels.

#### Acceptance Criteria

1. WHEN creating the panel_users table THEN it SHALL have id, name, permission_mask, and timestamp columns
2. WHEN storing permission masks THEN they SHALL be stored as INTEGER values
3. IF a panel_users table exists THEN the client table SHALL reference it via foreign key
4. WHEN creating users THEN their permission_mask SHALL be one of: 1, 2, 4, or 8
5. WHEN referencing panel users THEN the system SHALL maintain referential integrity

### Requirement 7

**User Story:** As a developer, I want the implementation to follow existing code patterns, so that it maintains consistency with the current codebase.

#### Acceptance Criteria

1. WHEN writing SQL functions THEN they SHALL follow the same patterns as existing functions in migration.sql
2. WHEN naming functions THEN they SHALL use snake_case convention like existing functions
3. WHEN structuring the code THEN it SHALL include proper comments and documentation
4. IF adding new tables THEN they SHALL follow the same structure as existing tables (UUID primary keys, timestamps)
5. WHEN creating foreign keys THEN they SHALL follow the existing naming convention pattern