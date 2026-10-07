import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendNewsletter(to: string, unsubscribeUrl: string) {
  if (!process.env.POSTAL_ADDRESS) throw new Error('POSTAL_ADDRESS is required');
  const footer = `Unsubscribe: ${unsubscribeUrl}\n${process.env.POSTAL_ADDRESS}`;
  await resend.emails.send({ from: 'hi@example.com', to, subject: 'Our newsletter', text: 'We launched!\n' + footer,
    headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` } });
}
