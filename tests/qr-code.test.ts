import { createWeeklyQRCode, validateQRCode, getAllQRCodes, initializeDatabase } from '../lib/database';

describe('QR Code Functionality', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  it('should create a new weekly QR code', async () => {
    const config = {
      signin_hour: '09:00',
      signout_hour: '18:00',
      inactive_hour: '13:00',
      work_days: 'Monday,Tuesday,Wednesday,Thursday,Friday',
    };

    const result = await createWeeklyQRCode(config);
    expect(result.lastID).toBeDefined();

    const allQRCodes = await getAllQRCodes();
    const newQRCode = allQRCodes.find((qr) => qr.id === result.lastID);

    expect(newQRCode).toBeDefined();
    expect(newQRCode.signin_hour).toBe(config.signin_hour);
    expect(newQRCode.signout_hour).toBe(config.signout_hour);
    expect(newQRCode.inactive_hour).toBe(config.inactive_hour);
    expect(newQRCode.work_days).toBe(config.work_days);
  });

  it('should validate a newly created QR code', async () => {
    const config = {
      signin_hour: '09:00',
      signout_hour: '18:00',
      inactive_hour: '13:00',
      work_days: 'Monday,Tuesday,Wednesday,Thursday,Friday',
    };

    const { qrCode } = await createWeeklyQRCode(config);
    const validation = await validateQRCode(qrCode.code);

    expect(validation.valid).toBe(true);
    expect(validation.qrCode.id).toBe(qrCode.id);
  });
});
