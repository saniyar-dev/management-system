# Database Schema Guidelines - Siman Ban Dashboard

## Supabase Configuration
- Use Row Level Security (RLS) for all tables
- Enable real-time subscriptions for live updates
- Implement proper indexing for Persian text search
- Use UUID primary keys for all entities

## Table Naming Conventions
- Use singular nouns in English (client, order, invoice)
- Add Persian comments for documentation
- Use snake_case for column names
- Include created_at, updated_at timestamps

## Core Tables Structure

### clients
- id (uuid, primary key)
- name (text, required) - نام مشتری
- contact_info (jsonb) - اطلاعات تماس
- address (text) - آدرس
- status (enum) - وضعیت
- client_type (enum) - نوع مشتری
- created_at, updated_at

### pre_orders
- id (uuid, primary key)
- client_id (uuid, foreign key)
- description (text) - شرح پیش سفارش
- estimated_amount (decimal) - مبلغ تخمینی
- status (enum) - وضعیت
- created_at, updated_at

### orders
- id (uuid, primary key)
- client_id (uuid, foreign key)
- pre_order_id (uuid, foreign key, nullable)
- order_details (jsonb) - جزئیات سفارش
- total_amount (decimal) - مبلغ کل
- status (enum) - وضعیت
- created_at, updated_at

### pre_invoices
- id (uuid, primary key)
- order_id (uuid, foreign key)
- client_id (uuid, foreign key)
- invoice_details (jsonb) - جزئیات پیش فاکتور
- total_amount (decimal) - مبلغ کل
- status (enum) - وضعیت
- created_at, updated_at

### invoices
- id (uuid, primary key)
- pre_invoice_id (uuid, foreign key, nullable)
- client_id (uuid, foreign key)
- invoice_number (text, unique) - شماره فاکتور
- invoice_details (jsonb) - جزئیات فاکتور
- total_amount (decimal) - مبلغ کل
- status (enum) - وضعیت
- issued_at (timestamp) - تاریخ صدور
- created_at, updated_at

## Data Types
- Use DECIMAL for monetary values (not FLOAT)
- Use JSONB for flexible structured data
- Use ENUM for status fields
- Use TEXT for Persian content
- Use TIMESTAMP WITH TIME ZONE for dates