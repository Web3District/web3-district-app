import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51TRtyJE1Hih6JiExoU87MKZG5GScq94UpJLj8U38dVvwQ8mFqppuSzhOzEsnFYV9L1p5pXUWnMqME7g0UYg27qJa00sklog300', {
  apiVersion: '2024-12-18.acacia',
});

const PRICE_IDS = {
  foundation: 'price_1TRuMRE1Hih6JiExGNqekfxJ',
  skyline: 'price_1TRuMSE1Hih6JiExC8bfPJMn',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { package_id, brand, text, color, bgColor, link } = req.body;

    if (!package_id) {
      return res.status(400).json({ error: 'Package ID is required' });
    }

    const priceId = PRICE_IDS[package_id as keyof typeof PRICE_IDS];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid package ID' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `https://web4city.xyz/ads/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://web4city.xyz/advertise`,
      metadata: {
        package_id,
        brand: brand || '',
        text: text || '',
        color: color || '',
        bgColor: bgColor || '',
        link: link || '',
      },
    });

    return res.status(200).json({ url: session.url, session_id: session.id });
  } catch (error: any) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ error: error.message || 'Checkout failed' });
  }
}
