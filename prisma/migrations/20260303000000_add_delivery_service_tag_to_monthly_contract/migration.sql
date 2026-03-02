-- Add delivery service tag to monthly contracts
ALTER TABLE IF EXISTS "monthly_contracts"
ADD COLUMN IF NOT EXISTS "deliveryServiceTag" TEXT;

