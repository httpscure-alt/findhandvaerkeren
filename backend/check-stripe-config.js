// Quick script to check Stripe configuration
require('dotenv').config();

console.log('\n🔍 Stripe Configuration Check\n');
console.log('='.repeat(50));

// Check Stripe Secret Key
const secretKey = process.env.STRIPE_SECRET_KEY;
if (secretKey) {
  console.log('✅ STRIPE_SECRET_KEY: Found');
  console.log(`   Starts with: ${secretKey.substring(0, 10)}...`);
  console.log(`   Length: ${secretKey.length} characters`);
  if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    console.log('   ⚠️  WARNING: Key should start with sk_test_ or sk_live_');
  }
} else {
  console.log('❌ STRIPE_SECRET_KEY: NOT FOUND');
}

console.log('');

// Check Price IDs
const monthlyPrice = process.env.STRIPE_PRICE_MONTHLY;
const annualPrice = process.env.STRIPE_PRICE_ANNUAL;

if (monthlyPrice) {
  console.log('✅ STRIPE_PRICE_MONTHLY: Found');
  console.log(`   Value: ${monthlyPrice}`);
  if (!monthlyPrice.startsWith('price_')) {
    console.log('   ⚠️  WARNING: Should start with "price_"');
  }
} else {
  console.log('❌ STRIPE_PRICE_MONTHLY: NOT FOUND');
}

if (annualPrice) {
  console.log('✅ STRIPE_PRICE_ANNUAL: Found');
  console.log(`   Value: ${annualPrice}`);
  if (!annualPrice.startsWith('price_')) {
    console.log('   ⚠️  WARNING: Should start with "price_"');
  }
} else {
  console.log('❌ STRIPE_PRICE_ANNUAL: NOT FOUND');
}

console.log('');

// Check Webhook Secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (webhookSecret) {
  console.log('✅ STRIPE_WEBHOOK_SECRET: Found');
  console.log(`   Starts with: ${webhookSecret.substring(0, 10)}...`);
} else {
  console.log('⚠️  STRIPE_WEBHOOK_SECRET: NOT FOUND (optional for testing)');
}

console.log('');

// Check Frontend URL
const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl) {
  console.log('✅ FRONTEND_URL: Found');
  console.log(`   Value: ${frontendUrl}`);
} else {
  console.log('⚠️  FRONTEND_URL: NOT FOUND (will default to http://localhost:3000)');
}

console.log('');
console.log('='.repeat(50));

// Summary
const hasSecretKey = !!secretKey;
const hasMonthlyPrice = !!monthlyPrice;
const hasAnnualPrice = !!annualPrice;

if (hasSecretKey && hasMonthlyPrice && hasAnnualPrice) {
  console.log('\n✅ Stripe is CONFIGURED and ready to use!');
  console.log('   Make sure to restart your backend server if you just updated .env');
} else {
  console.log('\n❌ Stripe is NOT fully configured');
  console.log('   Missing:');
  if (!hasSecretKey) console.log('     - STRIPE_SECRET_KEY');
  if (!hasMonthlyPrice) console.log('     - STRIPE_PRICE_MONTHLY');
  if (!hasAnnualPrice) console.log('     - STRIPE_PRICE_ANNUAL');
}

console.log('');

