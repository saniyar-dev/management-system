-- =================================================================
--          Supabase Initial Schema Migration
-- =================================================================
-- This script creates the tables and functions based on your types.ts file.
-- It should be placed in your Helm chart's db.config to run on initialization.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================================
-- 1. Create Tables without Foreign Keys
-- =================================================================

-- Create the 'person' table
CREATE TABLE IF NOT EXISTS public.person (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    ssn text NOT NULL,
    address text NULL,
    phone text NULL,
    postal_code text NULL
);

-- Create the 'company' table
CREATE TABLE IF NOT EXISTS public.company (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    ssn text NOT NULL,
    address text NULL,
    phone text NULL,
    postal_code text NULL
);

-- Create the 'client' table
CREATE TABLE IF NOT EXISTS public.client (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    type text NOT NULL,
    status text NOT NULL,
    person_id uuid NULL,
    company_id uuid NULL,
    permission_mask integer NOT NULL DEFAULT 15,
    panel_user_id uuid NULL
);

-- Create the 'pre_order' table
CREATE TABLE IF NOT EXISTS public.pre_order (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    client_id uuid NOT NULL,
    client_name text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    description text NOT NULL,
    estimated_amount numeric NULL
);

-- Create the 'order' table
CREATE TABLE IF NOT EXISTS public.order (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    client_id uuid NOT NULL,
    client_name text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    description text NOT NULL,
    total_amount numeric NOT NULL,
    pre_order_id uuid NULL
);

-- Create the 'n8n_job' table
CREATE TABLE IF NOT EXISTS public.n8n_job (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    "URL" text NOT NULL,
    entity text NOT NULL,
    entity_id uuid NOT NULL,
    status text NOT NULL
);

-- Create the 'panel_users' table for hierarchical permissions
CREATE TABLE IF NOT EXISTS public.panel_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    permission_mask integer NOT NULL CHECK (permission_mask IN (1, 2, 4, 8))
);

-- =================================================================
-- 2. Add Foreign Key Constraints
-- =================================================================
-- We add constraints at the end to avoid errors with table creation order.

ALTER TABLE public.client
ADD CONSTRAINT public_client_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.person(id) ON DELETE SET NULL;

ALTER TABLE public.client
ADD CONSTRAINT public_client_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON DELETE SET NULL;

ALTER TABLE public.pre_order
ADD CONSTRAINT "public_pre-orders_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.client(id) ON DELETE CASCADE;

ALTER TABLE public.order
ADD CONSTRAINT public_order_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.client(id) ON DELETE CASCADE;

ALTER TABLE public.order
ADD CONSTRAINT public_order_pre_order_id_fkey FOREIGN KEY (pre_order_id) REFERENCES public.pre_order(id) ON DELETE SET NULL;

ALTER TABLE public.client
ADD CONSTRAINT public_client_panel_user_id_fkey FOREIGN KEY (panel_user_id) REFERENCES public.panel_users(id) ON DELETE SET NULL;

-- =================================================================
-- 3. Enable Realtime Replication on New Tables
-- =================================================================
-- This tells Supabase to broadcast changes for these tables.

alter table public.person replica identity full;
alter table public.company replica identity full;
alter table public.client replica identity full;
alter table public.pre_order replica identity full;
alter table public.order replica identity full;
alter table public.n8n_job replica identity full;
alter table public.panel_users replica identity full;

-- =================================================================
-- 4. Create Database Functions
-- =================================================================

-- Function to get the name of a client (person or company) by its ID.
CREATE FUNCTION public.get_client_name(_client_id uuid)
RETURNS text AS $$
DECLARE
    client_name text;
BEGIN
    SELECT
        CASE
            WHEN c.type = 'person' THEN p.name
            WHEN c.type = 'company' THEN co.name
            ELSE NULL
        END
    INTO client_name
    FROM public.client c
    LEFT JOIN public.person p ON c.person_id = p.id
    LEFT JOIN public.company co ON c.company_id = co.id
    WHERE c.id = _client_id;

    RETURN client_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get a list of all clients (persons and companies).
CREATE FUNCTION public.get_all_client_names()
RETURNS TABLE(client_id uuid, client_name text, client_type text) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, p.name, c.type
    FROM public.client c
    JOIN public.person p ON c.person_id = p.id
    WHERE c.type = 'person'
    UNION ALL
    SELECT c.id, co.name, c.type
    FROM public.client c
    JOIN public.company co ON c.company_id = co.id
    WHERE c.type = 'company';
END;
$$ LANGUAGE plpgsql;

-- Function to search for companies by name (case-insensitive).
CREATE FUNCTION public.search_company_by_name(search_term text)
RETURNS SETOF public.company AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.company
    WHERE name ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;

-- Function to search for people by name (case-insensitive).
CREATE FUNCTION public.search_person_by_name(search_term text)
RETURNS SETOF public.person AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.person
    WHERE name ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;

-- Function to get the total count of clients based on filters.
CREATE FUNCTION public.filtered_client_total(_types text[], _statuses text[])
RETURNS bigint AS $$
BEGIN
    RETURN (
        SELECT count(*)
        FROM public.client
        WHERE ('all' = ANY(_types) OR type = ANY(_types))
          AND ('all' = ANY(_statuses) OR status = ANY(_statuses))
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get a paginated list of clients based on filters.
CREATE FUNCTION public.filter_client_paginated(_types text[], _statuses text[], _limit int, _offset int)
RETURNS SETOF public.client AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.client
    WHERE ('all' = ANY(_types) OR type = ANY(_types))
      AND ('all' = ANY(_statuses) OR status = ANY(_statuses))
    ORDER BY created_at DESC
    LIMIT _limit
    OFFSET _offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get the total count of orders based on filters.
CREATE FUNCTION public.filtered_order_total(_types text[], _statuses text[])
RETURNS bigint AS $$
BEGIN
    RETURN (
        SELECT count(*)
        FROM public.order
        WHERE ('all' = ANY(_types) OR type = ANY(_types))
          AND ('all' = ANY(_statuses) OR status = ANY(_statuses))
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get a paginated list of orders based on filters.
CREATE FUNCTION public.filter_order_paginated(_types text[], _statuses text[], _limit int, _offset int)
RETURNS SETOF public.order AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.order
    WHERE ('all' = ANY(_types) OR type = ANY(_types))
      AND ('all' = ANY(_statuses) OR status = ANY(_statuses))
    ORDER BY created_at DESC
    LIMIT _limit
    OFFSET _offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get the total count of pre-orders based on filters.
CREATE FUNCTION public.filtered_pre_order_total(_types text[], _statuses text[])
RETURNS bigint AS $$
BEGIN
    RETURN (
        SELECT count(*)
        FROM public.pre_order
        WHERE ('all' = ANY(_types) OR type = ANY(_types))
          AND ('all' = ANY(_statuses) OR status = ANY(_statuses))
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get a paginated list of pre-orders based on filters.
CREATE FUNCTION public.filter_pre_order_paginated(_types text[], _statuses text[], _limit int, _offset int)
RETURNS SETOF public.pre_order AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.pre_order
    WHERE ('all' = ANY(_types) OR type = ANY(_types))
      AND ('all' = ANY(_statuses) OR status = ANY(_statuses))
    ORDER BY created_at DESC
    LIMIT _limit
    OFFSET _offset;
END;
$$ LANGUAGE plpgsql;
-- =================================================================
-- 5. Create Performance Indexes for Permission System
-- =================================================================

-- Index for permission-based filtering on client table
CREATE INDEX IF NOT EXISTS idx_client_permission_mask ON public.client(permission_mask);

-- Index for user-based filtering on client table
CREATE INDEX IF NOT EXISTS idx_client_panel_user_id ON public.client(panel_user_id);

-- Composite index for common permission + user queries
CREATE INDEX IF NOT EXISTS idx_client_permission_user ON public.client(permission_mask, panel_user_id);

-- Index for date-based mutability checks
CREATE INDEX IF NOT EXISTS idx_client_created_at ON public.client(created_at);

-- Index for panel_users email lookups
CREATE INDEX IF NOT EXISTS idx_panel_users_email ON public.panel_users(email);

-- Index for panel_users permission_mask filtering
CREATE INDEX IF NOT EXISTS idx_panel_users_permission_mask ON public.panel_users(permission_mask);
-- =================================================================
-- 6. Hierarchical Permission System Functions
-- =================================================================

-- Core permission filtering function with mutability calculation
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
    "type" text,
    "status" text,
    person_id uuid,
    company_id uuid,
    permission_mask integer,
    panel_user_id uuid,
    is_mutable boolean
) AS $$
DECLARE
    three_weeks_ago timestamp with time zone;
BEGIN
    -- Calculate the threshold date for mutability (3 weeks ago)
    three_weeks_ago := NOW() - INTERVAL '3 weeks';
    
    -- Validate input parameters
    IF requesting_user_mask IS NULL OR requesting_user_mask NOT IN (1, 2, 4, 8) THEN
        -- Return empty result set for invalid permission masks
        RETURN;
    END IF;
    
    -- Return filtered clients with permission checks and mutability calculation
    RETURN QUERY
    SELECT 
        c.id,
        c.created_at,
        c.type,
        c.status,
        c.person_id,
        c.company_id,
        c.permission_mask,
        c.panel_user_id,
        -- Mutability logic: true if user owns the client OR client is older than 3 weeks
        CASE 
            WHEN c.panel_user_id = requesting_user_id THEN true
            WHEN c.created_at < three_weeks_ago THEN true
            ELSE false
        END as is_mutable
    FROM public.client c
    WHERE 
        -- Permission check: (user_mask & client_mask) = user_mask
        (requesting_user_mask & c.permission_mask) = requesting_user_mask
        -- Type filtering
        AND ('all' = ANY(_types) OR c.type = ANY(_types))
        -- Status filtering  
        AND ('all' = ANY(_statuses) OR c.status = ANY(_statuses))
    ORDER BY c.created_at DESC
    LIMIT _limit
    OFFSET _offset;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return empty result set
        RAISE WARNING 'Error in get_filtered_clients_with_permissions: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
-- Supporting count function for pagination with permission filtering
CREATE OR REPLACE FUNCTION public.get_filtered_clients_total_with_permissions(
    requesting_user_mask integer,
    _types text[] DEFAULT ARRAY['all'],
    _statuses text[] DEFAULT ARRAY['all']
)
RETURNS bigint AS $$
BEGIN
    -- Validate input parameters
    IF requesting_user_mask IS NULL OR requesting_user_mask NOT IN (1, 2, 4, 8) THEN
        -- Return 0 for invalid permission masks
        RETURN 0;
    END IF;
    
    -- Return count of clients that match permission and filter criteria
    RETURN (
        SELECT COUNT(*)
        FROM public.client c
        WHERE 
            -- Permission check: (user_mask & client_mask) = user_mask
            (requesting_user_mask & c.permission_mask) = requesting_user_mask
            -- Type filtering
            AND ('all' = ANY(_types) OR c.type = ANY(_types))
            -- Status filtering  
            AND ('all' = ANY(_statuses) OR c.status = ANY(_statuses))
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return 0
        RAISE WARNING 'Error in get_filtered_clients_total_with_permissions: %', SQLERRM;
        RETURN 0;
END;
$$ LANGUAGE plpgsql;