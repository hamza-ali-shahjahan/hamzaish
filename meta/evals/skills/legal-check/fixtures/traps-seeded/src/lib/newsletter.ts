import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendNewsletter(to: string) {
  await resend.emails.send({ from: 'hi@example.com', to, subject: 'Our newsletter', text: 'We launched!' });
}
