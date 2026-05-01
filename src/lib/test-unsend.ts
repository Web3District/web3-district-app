/**
 * Test Unsend Email Integration
 * 
 * Run with: npx tsx src/lib/test-unsend.ts
 */

import { sendEmail, sendOrderConfirmationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "./unsend";

async function testUnsend() {
  console.log("🐥 Testing Unsend Email Integration...\n");

  // Check env vars
  if (!process.env.UNSEND_API_KEY) {
    console.error("❌ UNSEND_API_KEY not set");
    return;
  }

  console.log("✅ UNSEND_API_KEY configured");
  console.log(`   From: ${process.env.UNSEND_FROM_EMAIL || "hello@web4city.xyz"}`);
  console.log(`   Name: ${process.env.UNSEND_FROM_NAME || "Web4City"}\n`);

  // TEST 1: Basic email
  console.log("📧 Test 1: Sending basic test email...");
  const testEmail = process.env.TEST_EMAIL || "eddiezebra@gmail.com";
  
  const result1 = await sendEmail({
    to: testEmail,
    subject: "🐥 Unsend Test from Web4City",
    html: `
      <h1>Test Email</h1>
      <p>If you received this, Unsend is working correctly!</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    `,
  });

  if (result1.success) {
    console.log("✅ Basic email sent successfully");
    console.log(`   Message ID: ${result1.messageId}\n`);
  } else {
    console.error("❌ Basic email failed:", result1.error, "\n");
  }

  // TEST 2: Order confirmation
  console.log("🛒 Test 2: Sending order confirmation...");
  const result2 = await sendOrderConfirmationEmail(testEmail, {
    orderId: "TEST-12345",
    items: [
      { name: "Skyline Ad Package", quantity: 1, price: 197.00 },
      { name: "Featured Listing", quantity: 2, price: 25.00 },
    ],
    total: 247.00,
    date: new Date().toLocaleDateString(),
  });

  if (result2.success) {
    console.log("✅ Order confirmation sent successfully\n");
  } else {
    console.error("❌ Order confirmation failed:", result2.error, "\n");
  }

  // TEST 3: Password reset
  console.log("🔑 Test 3: Sending password reset...");
  const result3 = await sendPasswordResetEmail(
    testEmail,
    "https://web4city.xyz/reset-password?token=test123"
  );

  if (result3.success) {
    console.log("✅ Password reset email sent successfully\n");
  } else {
    console.error("❌ Password reset failed:", result3.error, "\n");
  }

  // TEST 4: Welcome email
  console.log("🎉 Test 4: Sending welcome email...");
  const result4 = await sendWelcomeEmail(testEmail, "TestUser");

  if (result4.success) {
    console.log("✅ Welcome email sent successfully\n");
  } else {
    console.error("❌ Welcome email failed:", result4.error, "\n");
  }

  // Summary
  console.log("───");
  console.log("📊 Test Summary:");
  const passed = [result1, result2, result3, result4].filter(r => r.success).length;
  const total = 4;
  console.log(`   ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("\n🎉 All tests passed! Unsend is ready to use!\n");
  } else {
    console.log("\n⚠️ Some tests failed. Check the errors above.\n");
  }
}

// Run the test
testUnsend().catch(console.error);
