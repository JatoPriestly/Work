import { QRCode } from "./types";

export function validateQRCodeLogic(currentQR: QRCode) {
  const today = new Date();

  // If always_active is true, bypass time and day checks
  if (currentQR.always_active) {
    return {
      valid: true,
      qrCode: currentQR,
      mode: "sign_in", // Default to sign_in mode for always active
      message: "QR code is always active",
    };
  }

  // Convert Firestore Timestamps to Date objects
  const weekStart = currentQR.week_start.toDate();
  const weekEnd = currentQR.week_end.toDate();

  if (today < weekStart || today > weekEnd) {
    return { valid: false, message: "QR code has expired", qrCode: currentQR };
  }

  // Check if today is a work day
  const workDays = currentQR.work_days.split(",");
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = dayNames[today.getDay()];

  if (!workDays.includes(todayName)) {
    return { valid: false, message: "QR code is not active on this day", qrCode: currentQR };
  }

  // Determine mode based on configured hours
  const currentTime = today.getHours() * 100 + today.getMinutes();
  const signinTime = Number.parseInt(currentQR.signin_hour.replace(":", ""));
  const inactiveTime = Number.parseInt(currentQR.inactive_hour.replace(":", ""));
  const signoutTime = Number.parseInt(currentQR.signout_hour.replace(":", ""));

  let mode: "sign_in" | "sign_out" | "inactive";

  if (currentTime >= signinTime && currentTime < inactiveTime) {
    mode = "sign_in";
  } else if (currentTime >= inactiveTime && currentTime < signoutTime) {
    mode = "sign_out";
  } else {
    mode = "inactive";
  }

  if (mode === "inactive") {
    return { valid: false, message: "QR code is not active at this time", qrCode: currentQR };
  }

  return {
    valid: true,
    qrCode: currentQR,
    mode: mode,
    message: `Ready for ${mode === "sign_in" ? "sign in" : "sign out"}`,
  };
}