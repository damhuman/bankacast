-- Migration: Add token support fields to vaults table
-- Created: 2025-11-25
-- Description: Add token, decimals, and token_symbol columns for multi-token support (ETH, USDC)

-- Add new columns
ALTER TABLE vaults ADD COLUMN IF NOT EXISTS token VARCHAR(42);
ALTER TABLE vaults ADD COLUMN IF NOT EXISTS decimals INTEGER;
ALTER TABLE vaults ADD COLUMN IF NOT EXISTS token_symbol VARCHAR(10);

-- Set default values for existing vaults (assume USDC)
UPDATE vaults
SET token = '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
    decimals = 6,
    token_symbol = 'USDC'
WHERE token IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE vaults ALTER COLUMN token SET NOT NULL;
ALTER TABLE vaults ALTER COLUMN decimals SET NOT NULL;
ALTER TABLE vaults ALTER COLUMN token_symbol SET NOT NULL;

-- Add index on token for faster queries
CREATE INDEX IF NOT EXISTS idx_vaults_token ON vaults(token);

-- Verify migration
SELECT COUNT(*) as total_vaults,
       token_symbol,
       COUNT(*) as count_by_token
FROM vaults
GROUP BY token_symbol;
