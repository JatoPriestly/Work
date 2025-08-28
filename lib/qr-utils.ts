// QR Code generation and validation utilities

export function getQRMode(qrCode: any) {
  if (!qrCode) {
    return {
      mode: "inactive",
      label: "Inactive",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
  }

  const today = new Date();
  const currentTime = today.getHours() * 100 + today.getMinutes();
  const signinTime = Number.parseInt(qrCode.signin_hour.replace(":", ""));
  const inactiveTime = Number.parseInt(qrCode.inactive_hour.replace(":", ""));
  const signoutTime = Number.parseInt(qrCode.signout_hour.replace(":", ""));

  if (currentTime >= signinTime && currentTime < inactiveTime) {
    return {
      mode: "sign_in",
      label: "Sign-In Mode",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
  } else if (currentTime >= inactiveTime && currentTime < signoutTime) {
    return {
      mode: "sign_out",
      label: "Sign-Out Mode",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
  } else {
    return {
      mode: "inactive",
      label: "Inactive",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
  }
}