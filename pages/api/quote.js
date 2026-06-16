import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, phone, email, address, junkType, details } = req.body;

  if (!firstName || !lastName || !phone || !email || !address || !junkType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.QUOTE_RECIPIENT_EMAIL,
      replyTo: email,
      subject: `New Quote Request — ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B2A5E; padding: 24px; text-align: center;">
            <h1 style="color: #F5C400; font-size: 22px; margin: 0;">
              New Quote Request
            </h1>
            <p style="color: #ffffff; margin: 6px 0 0;">Tomahawk Junk Removal LLC</p>
          </div>

          <div style="padding: 28px; background: #f9f9f9; border: 1px solid #e0e0e0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555; width: 40%; font-weight: bold;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555; font-weight: bold;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555; font-weight: bold;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555; font-weight: bold;">Service Address</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">${address}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555; font-weight: bold;">Type of Junk</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">${junkType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #555; font-weight: bold; vertical-align: top;">Details</td>
                <td style="padding: 10px 0;">${details || 'None provided'}</td>
              </tr>
            </table>
          </div>

          <div style="background: #CC2020; padding: 14px; text-align: center;">
            <p style="color: #ffffff; margin: 0; font-size: 13px;">
              Reply directly to this email to respond to ${firstName}.
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
