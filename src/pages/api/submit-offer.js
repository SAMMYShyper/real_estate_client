export const prerender = false;

import nodemailer from 'nodemailer';

export async function POST({ request }) {
  const formData = await request.formData();

  // Honeypot check — if this hidden field is filled, it's a bot
  if (formData.get('website')) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const address = formData.get('address');
  const name = formData.get('name');
  const phone = formData.get('phone');
  const email = formData.get('email');

  if (!address || !name || !phone || !email) {
    return new Response(JSON.stringify({ success: false, error: 'Missing fields' }), { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NOTIFY_EMAIL_USER,
      pass: process.env.NOTIFY_EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Website Lead" <${process.env.NOTIFY_EMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL_TO,
      subject: `New lead: ${address}`,
      text: `New form submission:\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: 'Send failed' }), { status: 500 });
  }
}