-- Employee Sign-In/Sign-Out System Database Schema for DuckDB

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create QR codes table for weekly rotation
CREATE TABLE IF NOT EXISTS qr_codes (
    id INTEGER PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sign_in_out_records table
CREATE TABLE IF NOT EXISTS sign_in_out_records (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    qr_code_id INTEGER NOT NULL,
    action_type VARCHAR(10) NOT NULL CHECK (action_type IN ('sign_in', 'sign_out')),
    ip_address VARCHAR(45),
    device_info TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_records_employee_timestamp ON sign_in_out_records(employee_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_records_action_timestamp ON sign_in_out_records(action_type, timestamp);
