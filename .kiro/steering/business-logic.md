# Business Logic - Siman Ban Dashboard

## Business Workflow
1. **Client Management** → **Pre-Orders** → **Orders** → **Pre-Invoices** → **Invoices**
2. Each stage represents a progression in the sales/fulfillment process
3. Data flows between entities with proper state transitions

## Entity Relationships
- **Client** has many Pre-Orders, Orders, Pre-Invoices, Invoices
- **Pre-Order** can be converted to Order
- **Order** can generate Pre-Invoice
- **Pre-Invoice** can be finalized as Invoice

## Status Management
- Each entity has status tracking (active, inactive, pending, completed, etc.)
- Status changes should be logged for audit trails
- Use Persian status labels consistently

## Data Validation Rules
- **Client Data**: Required fields include name, contact information
- **Order Data**: Must reference valid client, include product details
- **Financial Data**: Proper number formatting, currency handling
- **Date Handling**: Use Persian calendar where appropriate

## Business Rules
- Orders cannot be deleted once invoiced
- Client information must be complete before order creation
- Financial calculations must be precise (decimal handling)
- All monetary values in Iranian Rial (IRR)

## Permissions & Access Control
- Role-based access to different dashboard sections
- Audit logging for sensitive operations
- Data privacy compliance for client information

## Integration Points
- Supabase database for all business data
- Real-time updates for collaborative work
- Export capabilities for reports and documents