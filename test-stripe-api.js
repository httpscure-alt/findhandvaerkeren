// Test script to check Stripe API configuration
const fetch = require('node-fetch');

async function testStripeAPI() {
  console.log('🧪 Testing Stripe API Configuration\n');
  
  // Test 1: Check backend health
  console.log('1. Checking backend health...');
  try {
    const healthRes = await fetch('http://localhost:4000/health');
    if (healthRes.ok) {
      const health = await healthRes.json();
      console.log('   ✅ Backend is running:', health);
    } else {
      console.log('   ❌ Backend returned error:', healthRes.status);
      return;
    } catch (error) {
      console.log('   ❌ Backend is not reachable:', error.message);
      console.log('   💡 Make sure backend is running: cd backend && npm run dev');
      return;
    }
  } catch (error) {
    console.log('   ❌ Cannot connect to backend:', error.message);
    return;
  }
  
  // Test 2: Check Stripe endpoint (without auth - should get 401 or error)
  console.log('\n2. Testing Stripe endpoint (no auth)...');
  try {
    const res = await fetch('http://localhost:4000/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingCycle: 'monthly' })
    });
    
    const data = await res.json();
    console.log('   Status:', res.status);
    console.log('   Response:', JSON.stringify(data, null, 2));
    
    if (res.status === 500 && data.error && data.error.includes('Stripe is not configured')) {
      console.log('\n   ❌ PROBLEM: Stripe is not configured in backend!');
      console.log('   💡 Check backend/.env has STRIPE_SECRET_KEY and STRIPE_PRICE_MONTHLY');
    } else if (res.status === 401) {
      console.log('\n   ✅ Backend is working (auth required - this is expected)');
    } else if (res.status === 200 && data.url) {
      if (data.url.startsWith('https://checkout.stripe.com')) {
        console.log('\n   ✅ SUCCESS! Stripe is configured and working!');
        console.log('   Stripe URL:', data.url);
      } else {
        console.log('\n   ⚠️  Got URL but not Stripe:', data.url);
      }
    }
  } catch (error) {
    console.log('   ❌ Error calling Stripe endpoint:', error.message);
  }
  
  console.log('\n✅ Test complete!');
}

testStripeAPI();

