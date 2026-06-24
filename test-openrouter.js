// Test script to check OpenRouter API key and available free models
require('dotenv').config({ path: '.env' });
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("❌ OPENROUTER_API_KEY not found in .env file");
  process.exit(1);
}

console.log("🔑 Testing OpenRouter API Key...");
console.log("API Key:", apiKey.substring(0, 15) + "...");

async function testAPI() {
  try {
    // Test 1: Check if API key is valid
    console.log("\n📋 Test 1: Checking API key validity...");
    const creditsResponse = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (creditsResponse.ok) {
      const data = await creditsResponse.json();
      console.log("✅ API Key is valid!");
      console.log("Credits remaining:", data.data?.credits || "unknown");
    } else {
      const error = await creditsResponse.text();
      console.error("❌ API Key is invalid or expired");
      console.error("Error:", error);
      console.log("\n👉 Get a free API key at: https://openrouter.ai/keys");
      return;
    }

    // Test 2: Try a simple chat request with a free model
    console.log("\n💬 Test 2: Testing chat with free model...");
    const chatResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ZeroPay Code AI Test",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "user", content: "Say hello in one word" }],
        max_tokens: 10,
      }),
    });

    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log("✅ Chat API works!");
      console.log("Response:", data.choices?.[0]?.message?.content);
    } else {
      const error = await chatResponse.json();
      console.error("❌ Chat API failed");
      console.error("Status:", chatResponse.status);
      console.error("Error:", JSON.stringify(error, null, 2));
      
      if (chatResponse.status === 402) {
        console.log("\n💡 Solution: Add credits at https://openrouter.ai/settings/credits");
        console.log("   Or use only :free models (may be rate-limited)");
      }
    }

    // Test 3: List available models
    console.log("\n🔍 Test 3: Fetching available free models...");
    const modelsResponse = await fetch("https://openrouter.ai/api/v1/models");
    
    if (modelsResponse.ok) {
      const data = await modelsResponse.json();
      const freeModels = data.data
        ?.filter(m => m.name?.includes(":free") || m.id?.includes(":free"))
        ?.slice(0, 10);
      
      console.log("Available free models (first 10):");
      freeModels?.forEach(m => {
        console.log(`  - ${m.id}`);
      });
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAPI();
