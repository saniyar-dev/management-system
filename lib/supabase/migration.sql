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
    company_id uuid NULL
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
