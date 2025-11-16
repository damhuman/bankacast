-- Migration: Add default values for new vault fields
-- This updates existing vaults to have proper default values for the new tracking fields

-- Update current_balance to 0 where NULL
UPDATE vaults
SET current_balance = 0
WHERE current_balance IS NULL;

-- Update yield_earned to 0 where NULL
UPDATE vaults
SET yield_earned = 0
WHERE yield_earned IS NULL;

-- Update current_apy to 0 where NULL
UPDATE vaults
SET current_apy = 0
WHERE current_apy IS NULL;

-- Ensure columns are NOT NULL with defaults going forward
ALTER TABLE vaults
ALTER COLUMN current_balance SET DEFAULT 0,
ALTER COLUMN current_balance SET NOT NULL;

ALTER TABLE vaults
ALTER COLUMN yield_earned SET DEFAULT 0,
ALTER COLUMN yield_earned SET NOT NULL;

ALTER TABLE vaults
ALTER COLUMN current_apy SET DEFAULT 0,
ALTER COLUMN current_apy SET NOT NULL;
