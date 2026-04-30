import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { package_id, brand, text, color, bgColor, currency, link } = req.body;

    // Validate required fields
    if (!package_id) {
      return res.status(400).json({ error: 'Package ID is required' });
    }

    // Get package details
    const priceId = package_id === 'foundation' 
      ? process.env.FOUNDATION_AD_PACKAGE_PRICE_ID 
      : process.env.SKYLINE_AD_PACKAGE_PRICE_ID;

    if (!priceId) {
      return res.status(400).json({ error: 'Invalid package ID' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ads/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/advertise`,
      metadata: {
        package_id,
        package_type: 'ad_package',
        brand: brand || '',
        text: text || '',
        color: color || '',
        bgColor: bgColor || '',
        link: link || '',
      },
    });

    // Return checkout session URL
    return res.status(200).json({
      url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
