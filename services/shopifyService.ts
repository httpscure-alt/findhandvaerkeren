import { Company } from '../types';

/**
 * Shopify Storefront API Integration
 * 
 * PRE-REQUISITES:
 * 1. Create a Private App in Shopify Admin > Apps & Sales Channels > Develop Apps.
 * 2. Enable "Storefront API" integration.
 * 3. Copy the "Storefront Access Token".
 */

// CONFIGURATION
// In a production app, these should be in your .env file (e.g., process.env.REACT_APP_SHOPIFY_DOMAIN)
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN || 'your-demo-store.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || 'your_storefront_access_token';
const SHOPIFY_API_VERSION = '2024-01';

interface CheckoutResponse {
  checkoutUrl: string | null;
  success: boolean;
  error?: string;
}

// GraphQL Mutation to create a checkout
const CHECKOUT_CREATE_MUTATION = `
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const createCheckout = async (variantId: string): Promise<CheckoutResponse> => {
  // Validation
  if (SHOPIFY_DOMAIN.includes('your-demo-store') || SHOPIFY_ACCESS_TOKEN.includes('your_storefront_access_token')) {
    console.warn("Shopify credentials are not configured in services/shopifyService.ts");
    // Fallback for demo purposes if keys aren't set
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { 
      success: true, 
      checkoutUrl: 'https://shopify.com/checkout_demo',
      error: 'Demo Mode: Credentials not configured.'
    };
  }

  const url = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: CHECKOUT_CREATE_MUTATION,
        variables: {
          input: {
            lineItems: [
              {
                variantId: variantId,
                quantity: 1,
              },
            ],
          },
        },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      console.error('Shopify API Error:', json.errors);
      throw new Error(json.errors[0].message);
    }

    const { checkout, checkoutUserErrors } = json.data.checkoutCreate;

    if (checkoutUserErrors.length > 0) {
      console.error('Checkout User Errors:', checkoutUserErrors);
      throw new Error(checkoutUserErrors[0].message);
    }

    return {
      success: true,
      checkoutUrl: checkout.webUrl,
    };

  } catch (error) {
    console.error('Failed to create checkout:', error);
    return {
      success: false,
      checkoutUrl: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// REPLACE THESE WITH YOUR ACTUAL SHOPIFY VARIANT IDs
// You can find these by appending .xml to a product URL in admin or using GraphiQL
export const PRODUCT_VARIANTS = {
  PRO_PLAN_MONTHLY: 'gid://shopify/ProductVariant/44556677889900', 
  ELITE_PLAN_MONTHLY: 'gid://shopify/ProductVariant/11223344556677',
};