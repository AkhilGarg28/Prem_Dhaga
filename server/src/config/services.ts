import { v2 as cloudinary } from 'cloudinary';
import Razorpay from 'razorpay';
import { Resend } from 'resend';

// Configure Cloudinary
const useCloudinaryMock = !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET;

if (!useCloudinaryMock) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary service initialized.');
} else {
  console.warn('Cloudinary environment variables missing. Running in SIMULATION mode (uploads will return base64/placeholder URLs).');
}

export const uploadImageToCloudinary = async (fileBuffer: Buffer, folder = 'prem_dhaga'): Promise<string> => {
  if (useCloudinaryMock) {
    // Return a beautiful devotional placeholder image in base64 format or web url
    return `https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop`; // Or custom mockup
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || '');
      }
    ).end(fileBuffer);
  });
};

// Configure Razorpay
const useRazorpayMock = !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

interface MockOrderOptions {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export const razorpayClient = !useRazorpayMock
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : {
      orders: {
        create: async (options: MockOrderOptions) => {
          console.log('[Mock Razorpay] Creating order for options:', options);
          return {
            id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
            entity: 'order',
            amount: options.amount,
            amount_paid: 0,
            amount_due: options.amount,
            currency: options.currency,
            receipt: options.receipt || 'receipt_123',
            status: 'created',
            attempts: 0,
            notes: options.notes || {},
            created_at: Math.floor(Date.now() / 1000),
          };
        },
      },
    };

if (!useRazorpayMock) {
  console.log('Razorpay service initialized.');
} else {
  console.warn('Razorpay credentials missing. Running in SIMULATION mode.');
}

// Configure Resend
const useResendMock = !process.env.RESEND_API_KEY;
const resend = !useResendMock ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  if (useResendMock) {
    console.log(`[Mock Email] Sending Email to: ${to}`);
    console.log(`[Mock Email] Subject: ${subject}`);
    console.log(`[Mock Email] Body Content:\n${htmlContent}`);
    return { id: `email_mock_${Date.now()}` };
  }
  try {
    const response = await resend!.emails.send({
      from: 'Prem Dhaga <onboarding@resend.dev>',
      to,
      subject,
      html: htmlContent,
    });
    return response;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return null;
  }
};

// ─── Shiprocket Logistics Integration ─────────────────────────────────────────
const shiprocketEmail = process.env.SHIPROCKET_EMAIL;
const shiprocketPassword = process.env.SHIPROCKET_PASSWORD;
const useShiprocketMock = !shiprocketEmail || !shiprocketPassword;

let cachedShiprocketToken: string | null = null;
let tokenExpiryTime = 0;

export const getShiprocketToken = async (): Promise<string | null> => {
  if (useShiprocketMock) {
    console.warn('[Shiprocket] Credentials missing or running in simulation mode.');
    return 'mock_shiprocket_token_108';
  }

  // Return cached token if valid (expires after 10 days)
  if (cachedShiprocketToken && Date.now() < tokenExpiryTime) {
    return cachedShiprocketToken;
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    const data = await response.json();
    if (response.ok && data.token) {
      cachedShiprocketToken = data.token;
      tokenExpiryTime = Date.now() + 8 * 24 * 60 * 60 * 1000; // Cache 8 days
      console.log('Shiprocket API authenticated successfully.');
      return cachedShiprocketToken;
    } else {
      console.error('[Shiprocket Auth Error]', data);
      return null;
    }
  } catch (err) {
    console.error('[Shiprocket Auth Exception]', err);
    return null;
  }
};

export const createShiprocketOrder = async (orderPayload: any) => {
  const token = await getShiprocketToken();
  if (!token || useShiprocketMock) {
    console.log('[Mock Shiprocket Order Creation]', orderPayload);
    return {
      order_id: Math.floor(100000 + Math.random() * 900000),
      shipment_id: Math.floor(100000 + Math.random() * 900000),
      status: 'NEW',
      status_code: 1,
      onboarding_completed_now: 0,
      awb_code: `SR-PD-${Math.floor(10000000 + Math.random() * 90000000)}`,
      courier_name: 'Delhivery Direct',
    };
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[Shiprocket Create Order Error]', err);
    return null;
  }
};

export const trackShiprocketShipment = async (awbCode: string) => {
  const token = await getShiprocketToken();
  if (!token || useShiprocketMock) {
    return {
      tracking_data: {
        track_status: 1,
        shipment_status: 7,
        shipment_track: [{ current_status: 'Delivered', location: 'Vrindavan Altar' }],
      },
    };
  }

  try {
    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  } catch (err) {
    console.error('[Shiprocket Track Error]', err);
    return null;
  }
};

export { useRazorpayMock, useShiprocketMock };

