-- Add action column to optimus_applications for recruitment status
ALTER TABLE optimus_applications ADD COLUMN action text DEFAULT 'pending';

-- Add index for better performance
CREATE INDEX idx_optimus_applications_action ON optimus_applications(action);