const http = require('http');

const data = JSON.stringify({
    billingCycle: 'monthly',
    tier: 'Premium',
    priceId: process.env.STRIPE_PRICE_MONTHLY || 'price_mock',
    successUrl: 'http://localhost:5173/billing/success',
    cancelUrl: 'http://localhost:5173/billing/cancel'
});

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/stripe/create-checkout-session',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer mock-token-123' // valid bypass
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode} `);
        console.log(`Body: ${body} `);
        if (res.statusCode === 200) {
            const json = JSON.parse(body);
            if (json.url && (json.url.startsWith('https://checkout.stripe.com') || json.url.includes('stripe.com'))) {
                console.log('SUCCESS: Received valid Stripe URL');
                process.exit(0);
            } else {
                console.log('FAILURE: URL is not a valid Stripe URL');
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
    process.exit(1);
});

req.write(data);
req.end();
