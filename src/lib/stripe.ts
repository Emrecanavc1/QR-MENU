// Stripe ödeme entegrasyonu
// npm install stripe @stripe/stripe-js

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";

export async function createStripePaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
  // Gerçek implementasyon için:
  // const stripe = new Stripe(STRIPE_SECRET_KEY);
  // const paymentIntent = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency, metadata });
  // return paymentIntent;

  // Placeholder
  return {
    id: `pi_${Date.now()}`,
    client_secret: `pi_${Date.now()}_secret_test`,
    amount: Math.round(amount * 100),
    currency,
    status: "requires_payment_method",
  };
}

export async function retrieveStripePaymentIntent(paymentIntentId: string) {
  return {
    id: paymentIntentId,
    status: "succeeded",
    amount_received: 10000,
  };
}
