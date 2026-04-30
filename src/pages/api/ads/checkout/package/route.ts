import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { package_id, brand, text, color, bgColor, currency, link } = body;

    // Validate required fields
    if (!package_id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Get user from Supabase auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from session (you may need to adjust this based on your auth setup)
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get package details
    const packageName = package_id === 'foundation' ? 'Foundation Ad Package' : 'Skyline Ad Package';
    const priceId = package_id === 'foundation' 
      ? process.env.FOUNDATION_AD_PACKAGE_PRICE_ID 
      : process.env.SKYLINE_AD_PACKAGE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      );
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
        user_id: user.id,
        package_id,
        package_type: 'ad_package',
        brand: brand || '',
        text: text || '',
        color: color || '',
        bgColor: bgColor || '',
        link: link || '',
      },
      client_reference_id: user.id,
    });

    // Create ad campaign record in database
    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .insert({
        user_id: user.id,
        package_id,
        stripe_session_id: session.id,
        status: 'pending',
        brand,
        text,
        color,
        bgColor,
        link,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ad campaign:', error);
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    // Return checkout session URL
    return NextResponse.json({
      url: session.url,
      session_id: session.id,
      campaign_id: campaign.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
