-- Drop the unique constraint on the username column
ALTER TABLE users DROP INDEX username;
USE daystar_daycare;
-- Add a new index on the username column (non-unique)
ALTER TABLE users ADD INDEX idx_username (username); 