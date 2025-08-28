
import { Timestamp } from "firebase/firestore";

export interface Employee {
  id?: string;
  employee_id: string;
  name: string;
  email?: string;
  department?: string;
  position?: string;
  is_active: boolean;
  created_at: Timestamp;
}

export interface QRCode {
  id?: string;
  name: string;
  code: string;
  week_start: Timestamp;
  week_end: Timestamp;
  is_active: boolean;
  always_active?: boolean; // Added
  created_at: Timestamp;
  signin_hour: string;
  signout_hour: string;
  inactive_hour: string;
  work_days: string;
}

export interface SignInOutRecord {
  id?: string;
  employee_id: string;
  qr_code_id: string;
  action_type: "sign_in" | "sign_out";
  timestamp: Timestamp;
  ip_address?: string;
  device_info?: string;
  selfie_data?: string;
}

export interface SystemConfig {
  id?: string;
  config_key: string;
  config_value: string;
  updated_at: Timestamp;
}
