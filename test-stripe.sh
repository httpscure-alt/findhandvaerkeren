#!/bin/bash

echo "🧪 Testing Stripe API Configuration"
echo ""

# Test 1: Check backend health
echo "1. Checking backend health..."
HEALTH=$(curl -s http://localhost:4000/health 2>&1)
if [ $? -eq 0 ] && echo "$HEALTH" | grep -q "ok"; then
  echo "   ✅ Backend is running"
  echo "   Response: $HEALTH"
else
  echo "   ❌ Backend is NOT running or not reachable"
  echo "   💡 Start backend: cd backend && npm run dev"
  exit 1
fi

echo ""
echo "2. Testing Stripe endpoint (no auth - should show error)..."
STRIPE_RESPONSE=$(curl -s -X POST http://localhost:4000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"billingCycle":"monthly"}' 2>&1)

echo "   Response: $STRIPE_RESPONSE"

if echo "$STRIPE_RESPONSE" | grep -q "Stripe is not configured"; then
  echo ""
  echo "   ❌ PROBLEM: Stripe is not configured!"
  echo "   💡 Check backend/.env has:"
  echo "      - STRIPE_SECRET_KEY"
  echo "      - STRIPE_PRICE_MONTHLY"
  echo "      - STRIPE_PRICE_ANNUAL"
elif echo "$STRIPE_RESPONSE" | grep -q "checkout.stripe.com"; then
  echo ""
  echo "   ✅ SUCCESS! Stripe is working!"
elif echo "$STRIPE_RESPONSE" | grep -q "401\|Authentication"; then
  echo ""
  echo "   ✅ Backend is working (auth required - expected)"
  echo "   💡 This means Stripe config is loaded, just need auth token"
else
  echo ""
  echo "   Response: $STRIPE_RESPONSE"
fi

echo ""
echo "✅ Test complete!"

