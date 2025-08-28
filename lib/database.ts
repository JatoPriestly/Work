import { Employee, QRCode, SignInOutRecord, SystemConfig } from "./types";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

import { validateQRCodeLogic } from "./qr-validation";



// Employee management functions
export async function getAllEmployees(): Promise<Employee[]> {
  try {
    const employeesRef = collection(db, "employees");
    const q = query(employeesRef, where("is_active", "==", true));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Employee
    );
  } catch (error) {
    console.error("[v0] Error getting employees:", error);
    throw error;
  }
}

export async function getEmployeeById(employeeId: string): Promise<Employee | null> {
  try {
    const employeesRef = collection(db, "employees");
    const q = query(employeesRef, where("employee_id", "==", employeeId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    } as Employee;
  } catch (error) {
    console.error("[v0] Error getting employee by ID:", error);
    throw error;
  }
}

export async function createEmployee(employeeData: {
  employee_id: string
  name: string
  email?: string
  department?: string
  position?: string
}) {
  try {
    const employeesRef = collection(db, "employees")
    const newEmployee = {
      employee_id: employeeData.employee_id,
      name: employeeData.name,
      email: employeeData.email || "",
      department: employeeData.department || "",
      position: employeeData.position || "",
      is_active: true,
      created_at: Timestamp.now(),
    }

    const docRef = await addDoc(employeesRef, newEmployee)
    return { lastID: docRef.id }
  } catch (error) {
    console.error("[v0] Error creating employee:", error)
    throw error
  }
}

export async function updateEmployee(employeeId: string, employeeData: Partial<Employee>) {
  try {
    const employeeRef = doc(db, "employees", employeeId);
    await updateDoc(employeeRef, employeeData);
    return { success: true };
  } catch (error) {
    console.error("[v0] Error updating employee:", error);
    throw error;
  }
}

// QR Code management
export async function getCurrentQRCode() {
  try {
    const qrCodesRef = collection(db, "qr_codes");
    const q = query(qrCodesRef, limit(1)); // Temporarily remove where clause
    const querySnapshot = await getDocs(q);
    console.log("getCurrentQRCode: querySnapshot.empty:", querySnapshot.empty); // Added log
    console.log("getCurrentQRCode: querySnapshot.docs:", querySnapshot.docs.map(doc => doc.data())); // Added log

    if (querySnapshot.empty) {
      console.log("getCurrentQRCode: No active QR code found in database."); // Added log
      return { valid: false, message: "No active QR code found" };
    }

    const currentQR = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    } as QRCode;

    const validationResult = validateQRCodeLogic(currentQR); // Store result
    console.log("getCurrentQRCode: Validation result:", validationResult); // Added log
    return { ...validationResult, qrCode: currentQR }; // Ensure qrCode is always present if found
  } catch (error) {
    console.error("[v0] Error getting current QR code:", error);
    return { valid: false, message: "Error validating QR code" };
  }
}

export async function createWeeklyQRCode(config?: {
  name?: string
  signin_hour?: string
  signout_hour?: string
  inactive_hour?: string
  work_days?: string
  always_active?: boolean // Added
}) {
  try {
    // Deactivate old QR codes
    const qrCodesRef = collection(db, "qr_codes")
    const activeQRQuery = query(qrCodesRef, where("is_active", "==", true))
    const activeQRSnapshot = await getDocs(activeQRQuery)

    // Update all active QR codes to inactive
    const updatePromises = activeQRSnapshot.docs.map((doc) => updateDoc(doc.ref, { is_active: false }))
    await Promise.all(updatePromises)

    // Create new QR code
    const weekCode = `QR_${new Date().getFullYear()}${String(getWeekNumber(new Date())).padStart(2, "0")}_${Date.now()}`
    const weekStart = getWeekStart(new Date())
    const weekEnd = getWeekEnd(new Date())

    const newQRCode = {
      name: config?.name || `Weekly QR Code - ${new Date().toLocaleDateString()}`,
      code: weekCode,
      week_start: Timestamp.fromDate(weekStart),
      week_end: Timestamp.fromDate(weekEnd),
      is_active: true,
      always_active: config?.always_active || false, // Added
      created_at: Timestamp.now(),
      signin_hour: config?.signin_hour || "08:00",
      signout_hour: config?.signout_hour || "17:00",
      inactive_hour: config?.inactive_hour || "12:00",
      work_days: config?.work_days || "Monday,Tuesday,Wednesday,Thursday,Friday",
    }

    const docRef = await addDoc(qrCodesRef, newQRCode)
    return { lastID: docRef.id, qrCode: { id: docRef.id, ...newQRCode } }
  } catch (error) {
    console.error("[v0] Error creating QR code:", error)
    throw error
  }
}

export async function getAllQRCodes(): Promise<QRCode[]> {
  try {
    const qrCodesRef = collection(db, "qr_codes");
    const q = query(qrCodesRef, orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as QRCode
    );
  } catch (error) {
    console.error("[v0] Error getting QR codes:", error);
    throw error;
  }
}

export async function validateQRCode(qrCode: string) {
  try {
    const qrCodesRef = collection(db, "qr_codes");
    const q = query(
      qrCodesRef,
      where("code", "==", qrCode),
      where("is_active", "==", true)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { valid: false, message: "Invalid or expired QR code" };
    }

    const currentQR = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    } as QRCode;

    return validateQRCodeLogic(currentQR);
  } catch (error) {
    console.error("[v0] Error validating QR code:", error);
    return { valid: false, message: "Error validating QR code" };
  }
}

export async function recordSignInOut(data: {
  employee_id: string;
  qrCodeId: string;
  actionType: "sign_in" | "sign_out";
  ipAddress?: string;
  deviceInfo?: string;
  selfieData?: string;
}) {
  try {
    const recordsRef = collection(db, "signin_out_records");

    const newRecord = {
      employee_id: data.employee_id,
      qr_code_id: data.qrCodeId,
      action_type: data.actionType,
      timestamp: Timestamp.now(),
      ip_address: data.ipAddress || "",
      device_info: data.deviceInfo || "",
      selfie_data: data.selfieData || "",
    };

    const docRef = await addDoc(recordsRef, newRecord);
    return { lastID: docRef.id };
  } catch (error) {
    console.error("[v0] Error recording sign in/out:", error);
    throw error;
  }
}

export async function getSignInOutRecords(filters?: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  actionType?: "sign_in" | "sign_out";
}) {
  try {
    const recordsRef = collection(db, "signin_out_records");
    let q = query(recordsRef, orderBy("timestamp", "desc"));

    // Apply filters if provided
    if (filters?.employeeId) {
      q = query(
        recordsRef,
        where("employee_id", "==", filters.employeeId),
        orderBy("timestamp", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as SignInOutRecord
    );

    // Get employee and QR code details for each record
    const enrichedRecords = await Promise.all(
      records.map(async (record) => {
        try {
          // Get employee details
          const employeeDoc = await getDoc(doc(db, "employees", record.employee_id));
          const employee = employeeDoc.exists()
            ? (employeeDoc.data() as Employee)
            : null;

          // Get QR code details
          const qrCodeDoc = await getDoc(doc(db, "qr_codes", record.qr_code_id));
          const qrCode = qrCodeDoc.exists()
            ? (qrCodeDoc.data() as QRCode)
            : null;

          return {
            ...record,
            employee_name: employee?.name || "Unknown",
            employee_id: employee?.employee_id || "Unknown",
            qr_code: qrCode?.code || "Unknown",
            timestamp: record.timestamp.toDate().toISOString(),
          };
        } catch (error) {
          console.error("[v0] Error enriching record:", error);
          return {
            ...record,
            employee_name: "Unknown",
            employee_id: "Unknown",
            qr_code: "Unknown",
            timestamp: record.timestamp.toDate().toISOString(),
          };
        }
      })
    );

    return enrichedRecords;
  } catch (error) {
    console.error("[v0] Error getting records:", error);
    throw error;
  }
}

// System configuration functions
export async function getSystemConfig() {
  try {
    const configRef = collection(db, "system_config");
    const querySnapshot = await getDocs(configRef);

    const config: Record<string, string> = {
      signin_hour: "08:00",
      signout_hour: "17:00",
      inactive_hour: "12:00",
      work_days: "Monday,Tuesday,Wednesday,Thursday,Friday",
    };

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data() as SystemConfig;
      config[data.config_key] = data.config_value;
    });

    return config;
  } catch (error) {
    console.error("[v0] Error getting system config:", error);
    throw error;
  }
}

export async function updateSystemConfig(key: string, value: string) {
  try {
    const configRef = collection(db, "system_config")
    const q = query(configRef, where("config_key", "==", key))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      // Create new config entry
      await addDoc(configRef, {
        config_key: key,
        config_value: value,
        updated_at: Timestamp.now(),
      })
    } else {
      // Update existing config entry
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, {
        config_value: value,
        updated_at: Timestamp.now(),
      })
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating system config:", error)
    throw error
  }
}

// Utility functions remain the same
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
}

export async function deleteQRCode(qrCodeId: string) {
  try {
    const qrCodeRef = doc(db, "qr_codes", qrCodeId)
    await deleteDoc(qrCodeRef)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting QR code:", error)
    throw error
  }
}

export async function toggleQRCodeStatus(qrCodeId: string, currentStatus: boolean) {
  try {
    const qrCodeRef = doc(db, "qr_codes", qrCodeId)
    await updateDoc(qrCodeRef, { is_active: !currentStatus })
    return { success: true }
  } catch (error) {
    console.error("[v0] Error toggling QR code status:", error)
    throw error
  }
}