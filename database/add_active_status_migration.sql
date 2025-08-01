-- Database migration to add active_status JSONB field to codex table
-- This field will track mission completion status for each user

-- Add active_status column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'codex' 
        AND column_name = 'active_status'
    ) THEN
        ALTER TABLE codex ADD COLUMN active_status JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create index for better performance on active_status queries
CREATE INDEX IF NOT EXISTS idx_codex_active_status ON codex USING GIN (active_status);

-- Example of active_status structure:
-- {
--   "mission1": {
--     "completed": true,
--     "completedAt": "2025-01-01T10:00:00.000Z",
--     "lastCodeUpdate": "2025-01-01T09:55:00.000Z",
--     "logs": "Completed JavaScript fundamentals mission"
--   },
--   "mission2": {
--     "completed": false,
--     "lastCodeUpdate": "2025-01-01T11:30:00.000Z",
--     "logs": "Working on React components"
--   }
-- }