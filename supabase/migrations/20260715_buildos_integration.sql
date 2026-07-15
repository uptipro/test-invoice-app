-- Migration: add BuildOS ERP reference columns to requests table
-- Run this in the Supabase SQL Editor.

ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS buildos_ref  TEXT,
  ADD COLUMN IF NOT EXISTS buildos_event TEXT;

-- Index for fast lookup when mirroring status back to BuildOS
CREATE INDEX IF NOT EXISTS idx_requests_buildos_ref
  ON public.requests (buildos_ref)
  WHERE buildos_ref IS NOT NULL;
