-- Seed data for testing

-- Insert sample employees
INSERT OR IGNORE INTO employees (employee_id, name, email, department, position) VALUES
('EMP001', 'John Doe', 'john.doe@company.com', 'Engineering', 'Software Developer'),
('EMP002', 'Jane Smith', 'jane.smith@company.com', 'Marketing', 'Marketing Manager'),
('EMP003', 'Mike Johnson', 'mike.johnson@company.com', 'HR', 'HR Specialist'),
('EMP004', 'Sarah Wilson', 'sarah.wilson@company.com', 'Engineering', 'Senior Developer'),
('EMP005', 'David Brown', 'david.brown@company.com', 'Sales', 'Sales Representative');

-- Insert initial QR code for current week
INSERT OR IGNORE INTO qr_codes (code, week_start, week_end, is_active) VALUES
('QR_' || strftime('%Y%W', 'now'), 
 date('now', 'weekday 0', '-6 days'), 
 date('now', 'weekday 0'), 
 true);
