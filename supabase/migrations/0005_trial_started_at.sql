-- Add trial_started_at to customers table
-- Set once on first project creation; never overwritten — prevents trial reset exploit
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz DEFAULT NULL;
