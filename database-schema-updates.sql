-- Migration: Add missing FPM tracking fields
-- Generated: 2025-11-03
-- Purpose: Complete FPM interaction and fertility timeline tracking


-- RECOMMENDED FIELDS
-- These fields enhance FPM tracking capabilities


-- User model
-- ALTER TABLE users ADD COLUMN phone_number TYPE;
-- ALTER TABLE users ADD COLUMN email TYPE;

-- FpmInteraction model
ALTER TABLE fpminteractions ADD COLUMN fertility_timeline_shown BOOLEAN DEFAULT false;
ALTER TABLE fpminteractions ADD COLUMN discontinuation_date TIMESTAMPTZ;
ALTER TABLE fpminteractions ADD COLUMN wants_pregnancy BOOLEAN;
ALTER TABLE fpminteractions ADD COLUMN pregnancy_timeline VARCHAR(50);