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
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new NextResponse('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new NextResponse('Webhook Error', { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Handle successful payment for ad packages
      if (session.metadata?.type === 'ad_package') {
        await handleAdPackagePayment(session);
      }
      
      // Handle shop purchases
      if (session.metadata?.type === 'shop_purchase') {
        await handleShopPurchase(session);
      }
      
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCreated(subscription);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSucceeded(invoice);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse('OK', { status: 200 });
}

async function handleAdPackagePayment(session: Stripe.Checkout.Session) {
  const { user_id, package_id, package_type } = session.metadata || {};
  
  if (!user_id || !package_id) {
    console.error('Missing user_id or package_id in session metadata');
    return;
  }

  // Update ad campaign status to active
  await supabase
    .from('ad_campaigns')
    .update({
      status: 'active',
      stripe_session_id: session.id,
      start_date: new Date().toISOString(),
    })
    .eq('user_id', user_id)
    .eq('package_id', package_id);

  console.log(`Ad package payment completed for user ${user_id}, package ${package_type}`);
}

async function handleShopPurchase(session: Stripe.Checkout.Session) {
  const { user_id, item_id } = session.metadata || {};
  
  if (!user_id || !item_id) {
    console.error('Missing user_id or item_id in session metadata');
    return;
  }

  // Update shop transaction status
  await supabase
    .from('shop_transactions')
    .update({
      status: 'completed',
      stripe_session_id: session.id,
    })
    .eq('user_id', user_id)
    .eq('item_id', item_id);

  // Add item to user inventory
  await supabase
    .from('user_inventory')
    .insert({
      user_id,
      item_id,
      quantity: 1,
      acquired_via: 'purchase',
      purchased_at: new Date().toISOString(),
    });

  console.log(`Shop purchase completed for user ${user_id}, item ${item_id}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  
  if (!userId) return;

  await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      tier: subscription.metadata?.tier || 'pro',
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  
  if (!userId) return;

  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription updated for user ${userId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  
  if (!userId) return;

  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_at_period_end: false,
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription cancelled for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string | null;
  
  if (!subscriptionId) return;

  // Update subscription billing status
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
    })
    .eq('stripe_subscription_id', subscriptionId);

  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string | null;
  
  if (!subscriptionId) return;

  // Update subscription status to past_due
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
    })
    .eq('stripe_subscription_id', subscriptionId);

  console.log(`Payment failed for subscription ${subscriptionId}`);
}
