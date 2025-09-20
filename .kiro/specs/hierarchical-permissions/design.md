# Design Document

## Overview

The hierarchical permission system uses bitmask-based access control to manage client data visibility and mutability in the Siman Ban admin panel. The system implements a tree-like hierarchy where higher-level users can access data from their level and all levels below, while maintaining special rules for data mutability based on creation ownership and time.

## Architecture

### Database Layer
- **panel_users table**: Stores user information and permission masks
- **client table modifications**: Adds permission_mask and panel_user_id columns
- **PostgreSQL functions**: Encapsulates all permission logic within the database

### Permission Model
- **User Layers**: 4 hierarchical levels using single-bit bitmasks (1, 2, 4, 8)
- **Client Access Masks**: Multi-bit masks defining which user layers can access each client
- **Access Rule**: `(user_mask & client_mask) === user_mask`

## Components and Interfaces

### 1. Database Schema Changes

#### panel_users Table
```sql
CREATE TABLE IF NOT EXISTS public.panel_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    permission_mask integer NOT NULL CHECK (permission_mask IN (1, 2, 4, 8))
);
```

#### client Table Modifications
```sql
ALTER TABLE public.client 
ADD COLUMN permission_mask integer NOT NULL DEFAULT 15,
ADD COLUMN panel_user_id uuid REFERENCES public.panel_users(id);
```

### 2. Core Permission Function

#### Function Signature
```sql
CREATE OR REPLACE FUNCTION public.get_filtered_clients_with_permissions(
    requesting_user_id uuid,
    requesting_user_mask integer,
    _types text[] DEFAULT ARRAY['all'],
    _statuses text[] DEFAULT ARRAY['all'],
    _limit integer DEFAULT 50,
    _offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    created_at timestamp with time zone,
    type text,
    status text,
    person_id uuid,
    company_id uuid,
    permission_mask integer,
    panel_user_id uuid,
    is_mutable boolean
)
```

### 3. Supporting Functions

#### Total Count Function
```sql
CREATE OR REPLACE FUNCTION public.get_filtered_clients_total_with_permissions(
    requesting_user_mask integer,
    _types text[] DEFAULT ARRAY['all'],
    _statuses text[] DEFAULT ARRAY['all']
)
RETURNS bigint
```

## Data Models

### Permission Bitmasks

#### User Permission Masks
- **Layer 1 User**: `1` (binary: `0001`)
- **Layer 2 User**: `2` (binary: `0010`) 
- **Layer 3 User**: `4` (binary: `0100`)
- **Layer 4 Manager**: `8` (binary: `1000`)

#### Client Access Masks
- **All Layers Access**: `15` (binary: `1111`) - Accessible by layers 1, 2, 3, 4
- **Layer 2+ Access**: `14` (binary: `1110`) - Accessible by layers 2, 3, 4
- **Layer 3+ Access**: `12` (binary: `1100`) - Accessible by layers 3, 4
- **Manager Only**: `8` (binary: `1000`) - Accessible by layer 4 only

### Access Logic Flow

```
User Request → Check Permission Mask → Filter Clients → Calculate Mutability → Return Results
```

#### Permission Check Algorithm
```
FOR each client:
    IF (requesting_user_mask & client.permission_mask) === requesting_user_mask:
        client is accessible
    ELSE:
        client is filtered out
```

#### Mutability Logic
```
FOR each accessible client:
    IF client.panel_user_id === requesting_user_id:
        is_mutable = true (user owns the client)
    ELSE IF client.created_at < (NOW() - INTERVAL '3 weeks'):
        is_mutable = true (client is older than 3 weeks)
    ELSE:
        is_mutable = false (client is recent and owned by another user)
```

## Error Handling

### Database Constraints
- **Permission Mask Validation**: CHECK constraint ensures only valid bitmask values (1, 2, 4, 8)
- **Foreign Key Integrity**: panel_user_id must reference existing panel_users
- **NOT NULL Constraints**: Critical fields cannot be null

### Function Error Handling
- **Invalid User Mask**: Return empty result set for invalid permission masks
- **Missing User**: Handle cases where requesting_user_id doesn't exist
- **Database Errors**: Proper error propagation to application layer

### Edge Cases
- **Orphaned Clients**: Clients with panel_user_id referencing deleted users
- **Invalid Permission Masks**: Clients with corrupted permission_mask values
- **Concurrent Updates**: Handle race conditions in permission changes

## Testing Strategy

### Unit Tests
- **Bitmask Operations**: Test all permission mask combinations
- **Date Calculations**: Verify 3-week threshold calculations
- **Edge Cases**: Test boundary conditions and invalid inputs

### Integration Tests
- **Database Functions**: Test complete function workflows
- **Permission Scenarios**: Test all user layer and client access combinations
- **Data Integrity**: Verify foreign key constraints and data consistency

### Performance Tests
- **Large Datasets**: Test function performance with thousands of clients
- **Complex Queries**: Verify efficient query execution plans
- **Concurrent Access**: Test multiple users accessing system simultaneously

## Security Considerations

### Row Level Security (RLS)
- Enable RLS on panel_users table to restrict user management
- Implement policies to prevent privilege escalation
- Ensure users can only see their permitted data

### Data Isolation
- Permission masks prevent unauthorized data access
- Function-level security prevents direct table access
- Audit logging for permission changes

### Input Validation
- Validate permission mask values at database level
- Sanitize user inputs in function parameters
- Prevent SQL injection through parameterized queries

## Performance Optimization

### Indexing Strategy
```sql
-- Index for permission-based filtering
CREATE INDEX idx_client_permission_mask ON public.client(permission_mask);

-- Index for user-based filtering  
CREATE INDEX idx_client_panel_user_id ON public.client(panel_user_id);

-- Composite index for common queries
CREATE INDEX idx_client_permission_user ON public.client(permission_mask, panel_user_id);

-- Index for date-based mutability checks
CREATE INDEX idx_client_created_at ON public.client(created_at);
```

### Query Optimization
- Use efficient bitwise operations for permission checks
- Minimize data transfer by selecting only required columns
- Implement proper LIMIT/OFFSET for pagination

### Caching Strategy
- Cache user permission masks in application layer
- Consider materialized views for complex permission queries
- Implement query result caching where appropriate

## Migration Strategy

### Phase 1: Schema Updates
1. Create panel_users table
2. Add columns to client table with default values
3. Create necessary indexes

### Phase 2: Data Migration
1. Create default panel users for existing system users
2. Assign default permission masks to existing clients
3. Update panel_user_id for existing clients

### Phase 3: Function Deployment
1. Deploy new permission functions
2. Update existing client query functions
3. Test permission enforcement

### Phase 4: Application Integration
1. Update frontend to use new permission functions
2. Implement UI changes for mutability indicators
3. Add user management interface

## Monitoring and Maintenance

### Performance Monitoring
- Track function execution times
- Monitor database query performance
- Alert on permission-related errors

### Audit Requirements
- Log permission changes
- Track user access patterns
- Monitor for potential security violations

### Maintenance Tasks
- Regular permission mask validation
- Cleanup orphaned references
- Performance optimization reviews