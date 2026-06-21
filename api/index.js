import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ─── SMTP Transporter ───────────────────────────────────────
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const ADMIN_CONTACT_1 = process.env.ADMIN_CONTACT || '+91 9106917219';
const ADMIN_CONTACT_2 = '+91 8306396840';
const COMPANY_NAME = 'Karni Air Courier & Logistics';
const WEBSITE_URL = 'https://karni-courier-e561c.firebaseapp.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log('✅ SMTP connected — ready to send emails'))
  .catch((err) => console.warn('⚠️  SMTP connection failed:', err.message));

// ─── Shared Attachments ──────────────────────────────────────
const mailAttachments = [
  {
    filename: 'logo.png',
    path: path.join(__dirname, '../public/logo.png'),
    cid: 'karnilogo' // same cid value as in the html img src
  }
];

// ─── Helper: Get Dynamic Base URL ────────────────────────────
const getBaseUrl = (req) => {
  if (req.headers.origin) {
    return req.headers.origin;
  }
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  return `${proto}://${host}`;
};

// ─── Premium HTML Email Template Helper ──────────────────────
const buildEmailHTML = ({ heading, bodyLines, button }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0; padding:0; background-color:#f4f7fa; font-family: 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <!-- Spacer -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          
          <!-- Main Card -->
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid #e5e7eb;">
            
            <!-- Header (Logo) -->
            <tr>
              <td align="center" style="padding: 40px 30px 30px; background-color: #ffffff; border-bottom: 2px solid #f8fafc;">
                <img src="cid:karnilogo" alt="${COMPANY_NAME}" width="180" style="display:block; max-width:100%; height:auto;" />
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding: 40px 40px 20px; text-align: center;">
                <h1 style="margin: 0; color:#111827; font-size:26px; font-weight:700; letter-spacing:-0.5px;">
                  ${heading}
                </h1>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding: 10px 40px 30px;">
                ${bodyLines.map(line => `<p style="margin: 0 0 18px; color:#4b5563; font-size:16px; line-height:1.6;">${line}</p>`).join('')}
                
                ${button ? `
                <div style="text-align: center; margin: 35px 0 20px;">
                  <a href="${button.url}" style="background-color: #CC0000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(204, 0, 0, 0.2);">
                    ${button.text}
                  </a>
                </div>
                ` : ''}
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 40px;">
                <hr style="border:none; border-top: 1px solid #e5e7eb; margin: 0;" />
              </td>
            </tr>

            <!-- Support Section -->
            <tr>
              <td style="padding: 30px 40px 40px;">
                <h3 style="margin:0 0 12px; font-size:14px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:1px;">Need Help or Support?</h3>
                <p style="margin:0 0 6px; font-size:15px; color:#4b5563;">
                  <span style="display:inline-block; width: 24px;">📞</span> <strong style="color:#111827;">Primary:</strong> <a href="tel:${ADMIN_CONTACT_1.replace(/\s+/g, '')}" style="color:#CC0000; text-decoration:none; font-weight:600;">${ADMIN_CONTACT_1}</a>
                </p>
                <p style="margin:0; font-size:15px; color:#4b5563;">
                  <span style="display:inline-block; width: 24px;">📞</span> <strong style="color:#111827;">Secondary:</strong> <a href="tel:${ADMIN_CONTACT_2.replace(/\s+/g, '')}" style="color:#CC0000; text-decoration:none; font-weight:600;">${ADMIN_CONTACT_2}</a>
                </p>
              </td>
            </tr>

            <!-- Dark Footer -->
            <tr>
              <td style="background-color:#111827; padding: 30px 40px; text-align:center;">
                <p style="margin:0 0 10px; font-size:16px; color:#f9fafb; font-weight:600; letter-spacing: 0.5px;">
                  ${COMPANY_NAME}
                </p>
                <p style="margin:0; font-size:13px; color:#9ca3af; line-height: 1.5;">
                  Fast, Reliable, & Affordable Doorstep Courier Services.<br>
                  © ${new Date().getFullYear()} All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

// ─── Tracking Helper ─────────────────────────────────────────
const getTrackingUrl = (cargoCompany, awb, websiteUrl) => {
  const company = cargoCompany.toLowerCase();
  if (company.includes('delhivery')) return `https://www.delhivery.com/track/package/${awb}`;
  if (company.includes('dtdc')) return `https://www.dtdc.in/tracking/track-your-shipment.html`;
  if (company.includes('mark')) return `https://www.trackingmore.com/mark-express-tracking.html?number=${awb}`;
  if (company.includes('mahabali')) return `https://www.trackingmore.com/shree-mahabali-express-tracking.html?number=${awb}`;
  if (company.includes('dhl')) return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${awb}`;
  if (company.includes('bluedart')) return `https://www.bluedart.com/tracking`;
  return `${websiteUrl}/track`;
};

// ─── API: Order Confirmation Email ──────────────────────────
app.post('/api/send-order-email', async (req, res) => {
  const { to_email, to_name, awb_number } = req.body;
  if (!to_email) return res.status(400).json({ error: 'to_email is required' });

  try {
    const html = buildEmailHTML({
      heading: '🎉 Your Booking is Confirmed!',
      bodyLines: [
        `Dear <strong>${to_name || 'Valued Customer'}</strong>,`,
        `Thank you for choosing <strong>${COMPANY_NAME}</strong>. Your pickup request has been successfully registered in our system.`,
        `<div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: center;">
          <span style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; font-weight: 600;">Your Tracking AWB Number</span>
          <span style="font-size: 28px; font-weight: 800; color: #CC0000; letter-spacing: 2px;">${awb_number || 'N/A'}</span>
        </div>`,
        `Our delivery executive will arrive at your location at the scheduled time to pick up your package.`,
        `You will receive another notification once your shipment is dispatched with our cargo partner.`,
      ],
    });

    await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${SMTP_USER}>`,
      to: to_email,
      subject: `Booking Confirmed — AWB: ${awb_number || 'N/A'} | ${COMPANY_NAME}`,
      html,
      attachments: mailAttachments
    });

    res.json({ success: true, message: 'Order confirmation email sent' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ─── API: Pickup Confirmation Email ─────────────────────────
app.post('/api/send-pickup-email', async (req, res) => {
  const { to_email, to_name, awb_number, cargo_company } = req.body;
  if (!to_email) return res.status(400).json({ error: 'to_email is required' });

  const websiteUrl = getBaseUrl(req);
  const trackingUrl = getTrackingUrl(cargo_company, awb_number, websiteUrl);

  try {
    const html = buildEmailHTML({
      heading: '📦 Shipment Dispatched!',
      bodyLines: [
        `Dear <strong>${to_name || 'Valued Customer'}</strong>,`,
        `Great news! Your package has been picked up from your location and forwarded to our trusted logistics partner for delivery.`,
        `<div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40%" style="color:#64748b; font-size:14px; padding-bottom:12px; font-weight: 500;">Logistics Partner:</td>
              <td width="60%" style="color:#111827; font-size:16px; font-weight:700; padding-bottom:12px; text-align: right;">${cargo_company || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color:#64748b; font-size:14px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-weight: 500;">Partner AWB No:</td>
              <td style="color:#CC0000; font-size:18px; font-weight:800; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: right;">${awb_number || 'N/A'}</td>
            </tr>
          </table>
        </div>`,
        `You can use this AWB number to track the live status of your shipment on our website.`,
      ],
      button: {
        text: 'Track Your Shipment Live',
        url: trackingUrl
      }
    });

    await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${SMTP_USER}>`,
      to: to_email,
      subject: `Shipment Dispatched via ${cargo_company || 'Partner'} | ${COMPANY_NAME}`,
      html,
      attachments: mailAttachments
    });

    res.json({ success: true, message: 'Pickup confirmation email sent' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ─── API: Cancel Confirmation Email ─────────────────────────
app.post('/api/send-cancel-email', async (req, res) => {
  const { to_email, to_name, awb_number, cancel_reason } = req.body;
  if (!to_email) return res.status(400).json({ error: 'to_email is required' });

  const websiteUrl = getBaseUrl(req);

  try {
    const html = buildEmailHTML({
      heading: '❌ Booking Cancelled',
      bodyLines: [
        `Dear <strong>${to_name || 'Valued Customer'}</strong>,`,
        `This is to inform you that your courier booking has been <strong>cancelled</strong>.`,
        `<div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="35%" style="color:#64748b; font-size:14px; padding-bottom:12px; font-weight: 500;">AWB Number:</td>
              <td width="65%" style="color:#111827; font-size:15px; font-weight:700; padding-bottom:12px; text-align: right;">${awb_number || 'N/A'}</td>
            </tr>
            ${cancel_reason ? `<tr>
              <td style="color:#64748b; font-size:14px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-weight: 500;">Reason:</td>
              <td style="color:#CC0000; font-size:15px; font-weight:700; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: right;">${cancel_reason}</td>
            </tr>` : ''}
          </table>
        </div>`,
        `If this cancellation was done by mistake or if you would like to schedule a new pickup, please feel free to reach out to our team using the contact details below.`,
      ],
      button: {
        text: 'Book a New Pickup',
        url: `${websiteUrl}/`
      }
    });

    await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${SMTP_USER}>`,
      to: to_email,
      subject: `Booking Cancelled — AWB: ${awb_number || 'N/A'} | ${COMPANY_NAME}`,
      html,
      attachments: mailAttachments
    });

    res.json({ success: true, message: 'Cancellation email sent' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', smtp_user: SMTP_USER ? '✅ configured' : '❌ missing' });
});

// Start the server if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT_NUM = process.env.PORT || 3001;
  app.listen(PORT_NUM, () => {
    console.log(`\n🚀 Karni Email Server running locally on port ${PORT_NUM}`);
  });
}

// Export for Vercel Serverless Functions
export default app;
