const UNSEND_API_KEY = process.env.UNSEND_API_KEY;
const UNSEND_FROM_EMAIL = process.env.UNSEND_FROM_EMAIL || "hello@web4city.xyz";
const UNSEND_FROM_NAME = process.env.UNSEND_FROM_NAME || "Web4City";

// Unosend API endpoint
const UNSEND_API_URL = process.env.UNSEND_API_URL || "https://api.unosend.co/v1";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Unosend API
 * Docs: https://docs.unosend.co
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!UNSEND_API_KEY) {
    console.error("[Unosend] API key not configured");
    return {
      success: false,
      error: "UNSEND_API_KEY is not configured",
    };
  }

  try {
    const response = await fetch(`${UNSEND_API_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${UNSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${UNSEND_FROM_NAME} <${UNSEND_FROM_EMAIL}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Unosend] API error:", response.status, errorData);
      return {
        success: false,
        error: `Unosend API error: ${response.status} - ${JSON.stringify(errorData)}`,
      };
    }

    const result = await response.json();
    console.log("[Unosend] Email sent successfully:", result);
    return {
      success: true,
      messageId: result.id || result.messageId,
    };
  } catch (error) {
    console.error("[Unosend] Send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    date: string;
  }
): Promise<SendEmailResult> {
  const { wrapInBaseTemplate, buildStatsTable, buildButton } = await import("./email-template");
  const { getPublicSiteUrl } = await import("./site-url");

  const itemsHtml = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-family: Helvetica, Arial, sans-serif; font-size: 14px;">
          ${item.name} × ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-family: Helvetica, Arial, sans-serif; font-size: 14px; text-align: right;">
          $${item.price.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const bodyHtml = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #111111; font-family: ${FONT};">Order Confirmed! 🎉</h1>
    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333; font-family: Helvetica, Arial, sans-serif;">
      Thank you for your purchase! Your order has been confirmed and is being processed.
    </p>
    
    <p style="margin: 0 0 12px; font-size: 14px; color: #666666; font-family: Helvetica, Arial, sans-serif;">
      Order ID: <strong>${orderDetails.orderId}</strong>
    </p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #666666; font-family: Helvetica, Arial, sans-serif;">
      Date: ${orderDetails.date}
    </p>

    <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: bold; color: #111111; font-family: Helvetica, Arial, sans-serif;">Order Summary</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
      ${itemsHtml}
      <tr>
        <td style="padding: 16px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; color: #111111;">
          Total
        </td>
        <td style="padding: 16px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; color: #111111; text-align: right;">
          $${orderDetails.total.toFixed(2)}
        </td>
      </tr>
    </table>

    ${buildButton("View Order Details", `${getPublicSiteUrl()}/orders/${orderDetails.orderId}`)}

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #666666; font-family: Helvetica, Arial, sans-serif;">
      Questions? Reply to this email or contact us at ${UNSEND_FROM_EMAIL}
    </p>
  `;

  const html = wrapInBaseTemplate(bodyHtml);

  return sendEmail({
    to,
    subject: `Order Confirmed - ${orderDetails.orderId}`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<SendEmailResult> {
  const { wrapInBaseTemplate, buildButton } = await import("./email-template");

  const bodyHtml = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #111111; font-family: ${FONT};">Reset Your Password</h1>
    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333; font-family: Helvetica, Arial, sans-serif;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>

    ${buildButton("Reset Password", resetUrl)}

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #666666; font-family: Helvetica, Arial, sans-serif;">
      This link will expire in 1 hour.<br/>
      If you didn't request this, you can safely ignore this email.
    </p>
  `;

  const html = wrapInBaseTemplate(bodyHtml);

  return sendEmail({
    to,
    subject: "Reset Your Password",
    html,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  username: string
): Promise<SendEmailResult> {
  const { wrapInBaseTemplate, buildButton } = await import("./email-template");
  const { getPublicSiteUrl } = await import("./site-url");

  const bodyHtml = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #111111; font-family: ${FONT};">Welcome to Web4City! 🚀</h1>
    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333; font-family: Helvetica, Arial, sans-serif;">
      Hey ${username}! We're thrilled to have you on board.
    </p>

    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333; font-family: Helvetica, Arial, sans-serif;">
      Web4City is your gateway to the decentralized web. Here's what you can do:
    </p>

    <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #333333; font-family: Helvetica, Arial, sans-serif;">
      <li>🏙️ Explore the 3D city and discover projects</li>
      <li>💼 Purchase ad packages to promote your work</li>
      <li>🎮 Play arcade games and earn rewards</li>
      <li>🤝 Connect with other builders and creators</li>
    </ul>

    ${buildButton("Start Exploring", getPublicSiteUrl())}

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #666666; font-family: Helvetica, Arial, sans-serif;">
      Need help? Check out our docs or reach out at ${UNSEND_FROM_EMAIL}
    </p>
  `;

  const html = wrapInBaseTemplate(bodyHtml);

  return sendEmail({
    to,
    subject: "Welcome to Web4City! 🎉",
    html,
  });
}

// Helper for font import
const FONT = `'Silkscreen', monospace`;
