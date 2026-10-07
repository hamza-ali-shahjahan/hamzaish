import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST() {
  return stripe.checkout.sessions.create({ mode: 'subscription', line_items: [] });
}
