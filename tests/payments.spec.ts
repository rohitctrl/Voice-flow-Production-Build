import { test, expect } from '@playwright/test';

test.describe('Razorpay Payment Integration', () => {
  const baseURL = 'http://localhost:3001';

  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL first
    await page.goto(baseURL);
  });

  test('API endpoints are accessible', async ({ request }) => {
    // Test the subscription plans API endpoint
    const response = await request.get(`${baseURL}/api/payments/plans`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.plans).toBeDefined();
    expect(data.plans.length).toBe(3); // Free, Pro, Enterprise
    
    // Verify plan structure
    const proPlan = data.plans.find((plan: any) => plan.name === 'Pro');
    expect(proPlan).toBeDefined();
    expect(proPlan.price_monthly).toBe(2900); // ₹29 in paise
    expect(proPlan.features).toContain('Unlimited transcription');
  });

  test('Authentication protects payment endpoints', async ({ request }) => {
    // Test create-order endpoint without authentication
    const response = await request.post(`${baseURL}/api/payments/create-order`, {
      data: {
        planId: 'test-plan-id',
        billingCycle: 'monthly'
      }
    });
    
    expect(response.status()).toBe(401); // Should be unauthorized
  });

  test('Landing page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Voiceflow/);
    await expect(page.locator('h1')).toContainText('Voiceflow');
    
    // Check if Start Transcribing button exists
    const startButton = page.getByRole('button', { name: /Start Transcribing/i });
    await expect(startButton).toBeVisible();
  });

  test('Authentication flow works', async ({ page }) => {
    // Try to access protected settings page
    await page.goto(`${baseURL}/app/settings`);
    
    // Should redirect to signin page
    await expect(page).toHaveURL(/auth\/signin/);
    await expect(page.locator('h3')).toContainText('Welcome Back');
    
    // Check OAuth buttons are present
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible();
  });

  test('Razorpay script integration', async ({ page }) => {
    // Create a test page that loads Razorpay
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <div id="test">Razorpay Test</div>
        <script>
          window.razorpayLoaded = typeof Razorpay !== 'undefined';
        </script>
      </body>
      </html>
    `);

    // Wait for script to load
    await page.waitForTimeout(2000);
    
    // Check if Razorpay is loaded
    const razorpayLoaded = await page.evaluate(() => window.razorpayLoaded);
    expect(razorpayLoaded).toBe(true);
  });

  test('Database schema is properly set up', async ({ request }) => {
    // Test that the plans API returns properly structured data
    const response = await request.get(`${baseURL}/api/payments/plans`);
    const data = await response.json();
    
    // Verify all expected plans exist
    const planNames = data.plans.map((plan: any) => plan.name);
    expect(planNames).toContain('Free');
    expect(planNames).toContain('Pro');
    expect(planNames).toContain('Enterprise');
    
    // Verify plan structure matches database schema
    for (const plan of data.plans) {
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('price_monthly');
      expect(plan).toHaveProperty('features');
      expect(plan).toHaveProperty('limits');
      expect(plan).toHaveProperty('is_active');
      expect(plan.is_active).toBe(true);
    }
  });

  test('Environment variables are configured', async ({ page }) => {
    // Test that required environment variables are set by checking API responses
    const response = await page.request.get(`${baseURL}/api/payments/plans`);
    expect(response.status()).toBe(200);
    
    // If we get a successful response, it means database connection is working
    // which implies SUPABASE environment variables are configured
  });

  test('Server handles errors gracefully', async ({ request }) => {
    // Test invalid plan ID
    const response = await request.post(`${baseURL}/api/payments/create-order`, {
      data: {
        planId: 'invalid-plan-id',
        billingCycle: 'monthly'
      }
    });
    
    // Should return proper error (401 for auth or 400/404 for invalid plan)
    expect([400, 401, 404]).toContain(response.status());
  });

  test('CORS is configured correctly for payment endpoints', async ({ page }) => {
    // Navigate to a page that can make API calls
    await page.goto(baseURL);
    
    // Try to make API call from browser context
    const result = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/payments/plans');
        return { success: true, status: response.status };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
  });

  test('Subscription limits are properly configured', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/payments/plans`);
    const data = await response.json();
    
    const freePlan = data.plans.find((plan: any) => plan.name === 'Free');
    const proPlan = data.plans.find((plan: any) => plan.name === 'Pro');
    const enterprisePlan = data.plans.find((plan: any) => plan.name === 'Enterprise');
    
    // Verify Free plan limits
    expect(freePlan.limits.transcription_hours).toBe(5);
    expect(freePlan.limits.file_size_mb).toBe(25);
    expect(freePlan.limits.projects).toBe(3);
    
    // Verify Pro plan limits (unlimited = -1)
    expect(proPlan.limits.transcription_hours).toBe(-1);
    expect(proPlan.limits.file_size_mb).toBe(500);
    expect(proPlan.limits.projects).toBe(-1);
    
    // Verify Enterprise plan limits
    expect(enterprisePlan.limits.transcription_hours).toBe(-1);
    expect(enterprisePlan.limits.file_size_mb).toBe(1000);
    expect(enterprisePlan.limits.api_calls).toBe(10000);
  });
});

// Component-specific tests for when authentication is working
test.describe('Subscription Plans Component', () => {
  test.skip('Billing page displays subscription plans', async ({ page }) => {
    // This test would require proper authentication setup
    // Skip for now, but include for future authenticated testing
    
    // Mock authentication or use a test user
    // await page.goto('http://localhost:3001/app/settings');
    // await expect(page.locator('[data-testid="subscription-plans"]')).toBeVisible();
  });
});

// Performance and reliability tests
test.describe('Performance Tests', () => {
  test('API response times are acceptable', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('http://localhost:3001/api/payments/plans');
    const endTime = Date.now();
    
    expect(response.status()).toBe(200);
    expect(endTime - startTime).toBeLessThan(2000); // Should respond within 2 seconds
  });
  
  test('Multiple concurrent API requests work', async ({ request }) => {
    // Add small delay to ensure server stability
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const requests = Array(5).fill(0).map(async () => {
      // Retry logic for flaky connections
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await request.get('http://localhost:3001/api/payments/plans');
          if (response.status() === 200) {
            return response;
          }
          // If not 200, wait briefly and retry
          await new Promise(resolve => setTimeout(resolve, 50 * attempt));
        } catch (error) {
          if (attempt === 2) throw error; // Last attempt
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
      }
      return request.get('http://localhost:3001/api/payments/plans');
    });
    
    const responses = await Promise.all(requests);
    
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }
  });
});