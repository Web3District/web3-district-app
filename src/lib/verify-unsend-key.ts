/**
 * Quick Unsend API Key Verification
 * 
 * This tests if the API key is valid and working
 * Run: npx tsx src/lib/verify-unsend-key.ts
 */

const UNSEND_API_KEY = process.env.UNSEND_API_KEY;
const UNSEND_API_URL = process.env.UNSEND_API_URL || "https://api.unosend.co/v1";

async function verifyKey() {
  console.log("🐥 Verifying Unosend API Key...\n");

  if (!UNSEND_API_KEY) {
    console.error("❌ UNSEND_API_KEY not set in environment");
    console.log("\n💡 Add to .env.local:");
    console.log("   UNSEND_API_KEY=un_your-key-here\n");
    return;
  }

  console.log(`📍 API URL: ${UNSEND_API_URL}`);
  console.log(`🔑 API Key: ${UNSEND_API_KEY.substring(0, 10)}...${UNSEND_API_KEY.slice(-4)}\n`);

  // Test 1: Check API endpoint health
  console.log("🔍 Test 1: Checking API endpoint...");
  try {
    const response = await fetch(`${UNSEND_API_URL}/health`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${UNSEND_API_KEY}`,
      },
    });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log("   ✅ API endpoint is accessible\n");
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`   ⚠️ Response: ${JSON.stringify(errorData)}\n`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error: ${error instanceof Error ? error.message : error}\n`);
  }

  // Test 2: Try to send a test email
  console.log("📧 Test 2: Sending test email...");
  const testEmail = process.env.TEST_EMAIL || "eddiezebra@gmail.com";
  console.log(`   To: ${testEmail}`);

  try {
    const response = await fetch(`${UNSEND_API_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${UNSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Web4City <hello@web4city.xyz>",
        to: [testEmail],
        subject: "🐥 Unsend API Key Test",
        html: `
          <h1>Test Email</h1>
          <p>If you received this, your Unsend API key is working!</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>API Key:</strong> ${UNSEND_API_KEY.substring(0, 10)}...</p>
        `,
      }),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log("   ✅ Email sent successfully!");
      console.log(`   📬 Message ID: ${result.id || result.messageId || "N/A"}\n`);
      console.log("🎉 API KEY IS VALID AND WORKING!\n");
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log("   ❌ Failed to send email");
      console.log(`   Error: ${JSON.stringify(errorData, null, 2)}\n`);
      
      // Provide troubleshooting tips
      console.log("🔧 TROUBLESHOOTING TIPS:");
      if (response.status === 403) {
        console.log("   • API key may be invalid or inactive");
        console.log("   • Check Unsend dashboard: https://app.unsend.dev");
        console.log("   • Verify key has 'send emails' permission");
        console.log("   • Try creating a new API key");
      } else if (response.status === 401) {
        console.log("   • API key format is incorrect");
        console.log("   • Should start with 'un_'");
        console.log("   • Copy the full key without spaces");
      } else if (response.status === 404) {
        console.log("   • API endpoint URL may be wrong");
        console.log("   • Check Unsend docs for correct endpoint");
        console.log("   • If self-hosted, verify UNSEND_API_URL");
      } else if (response.status === 429) {
        console.log("   • Rate limited - too many requests");
        console.log("   • Wait a minute and try again");
      }
      console.log("");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : error}\n`);
    console.log("🔧 TROUBLESHOOTING:");
    console.log("   • Check your internet connection");
    console.log("   • Verify UNSEND_API_URL is correct");
    console.log("   • Check if Unsend service is online\n");
  }

  // Test 3: Verify from email domain
  console.log("📧 Test 3: Checking from email domain...");
  const fromEmail = process.env.UNSEND_FROM_EMAIL || "hello@web4city.xyz";
  console.log(`   From: ${fromEmail}`);
  console.log("   ℹ️ Note: For production, verify web4city.xyz domain in Unsend dashboard");
  console.log("   ℹ️ For testing, Unsend's default domain will be used\n");
}

verifyKey().catch(console.error);
