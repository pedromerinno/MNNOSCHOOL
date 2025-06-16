
-- Add order_index column to user_course_suggestions table
ALTER TABLE user_course_suggestions 
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Create index for better performance on ordering
CREATE INDEX idx_user_course_suggestions_order 
ON user_course_suggestions(company_id, order_index);
