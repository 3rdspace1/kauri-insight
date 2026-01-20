-- Add business context fields to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#667eea';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS context_json JSONB;

-- Add index for industry lookups
CREATE INDEX IF NOT EXISTS tenants_industry_idx ON tenants(industry);
