import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// MSG91 Server-Side Auth Key
const MSG91_AUTH_KEY = '515403AfLqVycSEDlW6a002e63P1';

/**
 * SEND OTP (API Flow)
 * Directly calls MSG91 to send a 6-digit code.
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const mobileOnly = phone.replace('+91', '');
    const countryCode = '91';
    const TEMPLATE_ID = '6a00558db0f62c0a9e038d42';
    
    console.log(`Sending WhatsApp OTP to: ${countryCode}-${mobileOnly}`);
    
    // Call MSG91 Send OTP API with WhatsApp enabled
    // We add &whatsapp=1 to tell MSG91 to use WhatsApp first
    const response = await fetch(`https://control.msg91.com/api/v5/otp?mobile=${mobileOnly}&country=${countryCode}&template_id=${TEMPLATE_ID}&whatsapp=1&otp_length=6`, {
      method: 'POST',
      headers: {
        'authkey': MSG91_AUTH_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('MSG91 WhatsApp Response:', JSON.stringify(data));
    
    if (data.type === 'success') {
      res.json({ message: 'OTP sent successfully' });
    } else {
      res.status(400).json({ error: data.message || 'Failed to send OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * VERIFY OTP (API Flow)
 * Verifies the code entered by the user.
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Phone and Code are required' });

    const cleanPhone = phone.replace('+', '');

    // Call MSG91 Verify OTP API
    const response = await fetch(`https://control.msg91.com/api/v5/otp/verify?mobile=${cleanPhone}&otp=${code}&authkey=${MSG91_AUTH_KEY}`, {
      method: 'POST'
    });

    const data = await response.json();
    if (data.type === 'success') {
      res.json({ status: 'success', message: 'Verified successfully' });
    } else {
      res.status(401).json({ error: data.message || 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
