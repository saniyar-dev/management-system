# Coding Standards - Siman Ban Dashboard

## TypeScript Standards
- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Use generic types for reusable components
- Implement proper error handling with typed responses

## Component Architecture
- Use "use client" directive for client components
- Implement proper loading states with transitions
- Follow compound component patterns for complex UI
- Use custom hooks for business logic separation

## Persian/RTL Development Guidelines
- Always set `dir="rtl"` on HTML elements
- Use logical CSS properties (margin-inline-start vs margin-left)
- Implement Persian number conversion utilities
- Use Persian date/time formatting
- Test UI components in both RTL and LTR contexts

## File Naming Conventions
- Use kebab-case for file names
- Component files should match component name
- Use descriptive names for utility functions
- Group related files in feature directories

## State Management
- Use React hooks for local state
- Implement useTransition for async operations
- Use Supabase real-time subscriptions for live data
- Handle loading and error states consistently

## Database Patterns
- Use Supabase Row Level Security (RLS)
- Implement proper data validation
- Use TypeScript types generated from database schema
- Handle database errors gracefully

## Performance Guidelines
- Use Next.js App Router features (streaming, suspense)
- Implement proper caching strategies
- Optimize Persian text rendering
- Use lazy loading for large datasets