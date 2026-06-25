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
    console.log(`[Mock Email] Body Content:\n${htmlContent.substring(0, 300)}...`);
    return { id: `email_mock_${Date.now()}` };
  }
  try {
    const response = await resend!.emails.send({
      from: 'Prem Dhaga <orders@premdhaga.com>',
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
export { useRazorpayMock };
