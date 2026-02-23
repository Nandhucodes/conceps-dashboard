const axios = require('axios');

/**
 * Fast2SMS Integration — sends an OTP SMS via the Fast2SMS DLT/Quick SMS API.
 *
 * API Docs: https://docs.fast2sms.com
 *
 * Two routes are supported:
 *  - "q"  (Quick SMS)  → works without DLT template registration (sandbox/dev)
 *  - "dlt" (DLT SMS)  → required for production in India (registered sender + template)
 *
 * We use the Quick SMS route here so you can test immediately.
 * Switch to "dlt" when you register a DLT template on fast2sms.com.
 */

const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Send an OTP to a mobile number via Fast2SMS.
 *
 * @param {string} phone   – 10-digit Indian mobile number (without country code)
 * @param {string} otpCode – 6-digit OTP string
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const sendOtpSMS = async (phone, otpCode) => {
  // Strip any country code prefix (+91 / 91) and spaces
  const cleanPhone = phone.replace(/^\+?91/, '').replace(/\s+/g, '').trim();

  if (!/^\d{10}$/.test(cleanPhone)) {
    throw new Error(`Invalid phone number: "${phone}". Must be a 10-digit Indian mobile number.`);
  }

  const message = `Your OTP for Conceps Dashboard is ${otpCode}. Valid for ${process.env.OTP_EXPIRES_MINUTES || 10} minutes. Do not share this code with anyone.`;

  try {
    const response = await axios.get(FAST2SMS_URL, {
      params: {
        authorization: process.env.SMS_API_KEY,
        route:         'q',          // Quick SMS route (no DLT template needed)
        message:       message,
        language:      'english',
        flash:         0,
        numbers:       cleanPhone,
      },
      headers: {
        'cache-control': 'no-cache',
      },
      timeout: 10000,
    });

    const data = response.data;

    // Fast2SMS returns { return: true, request_id: "...", message: [...] } on success
    if (data.return === true) {
      console.log(`✅ SMS OTP sent to ${cleanPhone} | request_id: ${data.request_id}`);
      return { success: true, message: 'OTP sent successfully via SMS.' };
    }

    // Unexpected response shape
    console.error('❌ Fast2SMS unexpected response:', data);
    throw new Error(data.message?.[0] || 'SMS sending failed.');
  } catch (error) {
    // Axios HTTP error (4xx / 5xx from Fast2SMS)
    if (error.response) {
      const errMsg = error.response.data?.message?.[0] || error.response.statusText;
      console.error(`❌ Fast2SMS API error [${error.response.status}]:`, errMsg);
      throw new Error(`SMS service error: ${errMsg}`);
    }
    // Network / timeout error
    console.error('❌ SMS network error:', error.message);
    throw new Error(`SMS network error: ${error.message}`);
  }
};

module.exports = { sendOtpSMS };
