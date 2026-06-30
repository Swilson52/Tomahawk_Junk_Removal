import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, details } = req.body;

  if (!name || !phone || !email || !details) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !process.env.QUOTE_RECIPIENT_EMAIL) {
    console.error('Missing required env vars:', {
      hasKey: !!process.env.RESEND_API_KEY,
      hasFrom: !!process.env.RESEND_FROM_EMAIL,
      hasTo: !!process.env.QUOTE_RECIPIENT_EMAIL,
    });
    return res.status(500).json({ error: 'Server email configuration is incomplete.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.QUOTE_RECIPIENT_EMAIL,
      reply_to: email, // Resend SDK expects snake_case; `replyTo` is silently ignored
      subject: `New Quote Request — ${name}`,
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
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555; font-weight: bold;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><a href="tel:${phone}">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555; font-weight: bold;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #555; font-weight: bold; vertical-align: top;">What needs to go</td>
                <td style="padding: 10px 0;">${details}</td>
              </tr>
            </table>
          </div>

          <div style="background: #CC2020; padding: 14px; text-align: center;">
            <p style="color: #ffffff; margin: 0; font-size: 13px;">
              Call ${name} back at ${phone} to give a quote.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Resend threw:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
