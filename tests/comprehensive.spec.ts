import { test, expect } from '@playwright/test';

test.describe('Voiceflow - Comprehensive Feature Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Hero Section - Complete User Journey', async ({ page }) => {
    // Test hero section elements
    await expect(page.locator('h1')).toContainText('Voiceflow');
    await expect(page.locator('text=Transform Voice Into Text')).toBeVisible();
    
    // Test animated background canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Test mouse interaction effects
    await page.mouse.move(400, 300);
    await page.waitForTimeout(500);
    await page.mouse.move(600, 400);
    await page.waitForTimeout(500);
    
    // Test CTA button functionality
    const ctaButton = page.locator('button:has-text("Start Transcribing")');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });

  test('Interactive Demo Section - Voice Recording Flow', async ({ page, context }) => {
    // Grant microphone permissions
    await context.grantPermissions(['microphone']);
    
    // Scroll to demo section
    await page.locator('text=See It In Action').scrollIntoViewIfNeeded();
    await expect(page.locator('text=See It In Action')).toBeVisible();
    
    // Test record button visibility and state
    const recordButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(recordButton).toBeVisible();
    
    // Test waveform visualization
    await expect(page.locator('div').filter({ hasText: /Recording\.\.\. Click to stop|Click to start recording/ })).toBeVisible();
    
    // Test transcription output area
    await expect(page.locator('text=Your transcribed text will appear here')).toBeVisible();
  });

  test('Features Section - All Feature Cards', async ({ page }) => {
    // Scroll to features section
    await page.locator('text=Transform Your Voice').scrollIntoViewIfNeeded();
    
    // Test all feature cards are visible
    const featureCards = [
      'Real-time Processing',
      'High Accuracy',
      'Multi-language Support',
      'Speaker Identification'
    ];
    
    for (const feature of featureCards) {
      const featureElement = page.locator(`text=${feature}`).first();
      await expect(featureElement).toBeVisible();
    }
  });

  test('Benefits Section - Value Propositions', async ({ page }) => {
    await page.locator('text=Why Choose Voiceflow').scrollIntoViewIfNeeded();
    
    // Test benefit cards
    const benefits = [
      'Save Time',
      'Increase Accuracy', 
      'Easy Integration',
      'Secure & Private'
    ];
    
    for (const benefit of benefits) {
      await expect(page.locator(`text=${benefit}`).first()).toBeVisible();
    }
  });

  test('Use Cases Section - Industry Applications', async ({ page }) => {
    await page.locator('text=Perfect For Every Use Case').scrollIntoViewIfNeeded();
    
    // Test use case cards
    const useCases = [
      'Meeting Notes',
      'Student Notes', 
      'Voice Journaling',
      'Interview Transcripts',
      'Podcast Notes',
      'Voice To-Do Lists'
    ];
    
    for (const useCase of useCases) {
      await expect(page.locator(`text=${useCase}`).first()).toBeVisible();
    }
    
    // Test industry stats
    await expect(page.locator('text=Business')).toBeVisible();
    await expect(page.locator('text=Education')).toBeVisible();
    await expect(page.locator('text=Healthcare')).toBeVisible();
    await expect(page.locator('text=Legal')).toBeVisible();
  });

  test('Testimonials Section - Social Proof', async ({ page }) => {
    await page.locator('text=Loved by Professionals Worldwide').scrollIntoViewIfNeeded();
    
    // Test stats grid
    await expect(page.locator('text=10,000+')).toBeVisible();
    await expect(page.locator('text=1M+')).toBeVisible();
    await expect(page.locator('text=500+')).toBeVisible();
    await expect(page.locator('text=4.9/5')).toBeVisible();
    
    // Test scrolling testimonials marquee
    await expect(page.locator('text=What our users are saying')).toBeVisible();
    
    // Wait for marquee animation to load
    await page.waitForTimeout(2000);
    
    // Test marquee content
    await expect(page.locator('text=Game-changer for meetings!')).toBeVisible();
  });

  test('Pricing Section - Plans and Features', async ({ page }) => {
    await page.locator('text=Simple, Transparent Pricing').scrollIntoViewIfNeeded();
    
    // Test pricing plans
    const plans = ['Free', 'Pro', 'Enterprise'];
    
    for (const plan of plans) {
      await expect(page.locator(`text=${plan}`).first()).toBeVisible();
    }
  });

  test('Final CTA Section - Conversion Elements', async ({ page }) => {
    await page.locator('text=Ready to Transform').scrollIntoViewIfNeeded();
    
    // Test final CTA elements
    await expect(page.locator('text=Ready to Transform')).toBeVisible();
    await expect(page.locator('button:has-text("Get Started Free")')).toBeVisible();
  });

  test('Performance and Loading', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Test that page loads within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Test that all critical resources load
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    // Test with disabled JavaScript (graceful degradation)
    await page.route('**/*.js', route => route.abort());
    await page.goto('http://localhost:3000');
    
    // Should still show basic content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('SEO and Meta Tags', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test page title
    await expect(page).toHaveTitle(/Voiceflow/);
    
    // Test meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toContain('Transform your voice');
  });

  test('Cross-browser Compatibility', async ({ page, browserName }) => {
    // Test basic functionality across browsers
    await expect(page.locator('h1')).toContainText('Voiceflow');
    await expect(page.locator('canvas')).toBeVisible();
    
    console.log(`✓ Basic functionality working on ${browserName}`);
  });
});

test.describe('Voiceflow - Advanced User Scenarios', () => {
  
  test('Complete User Onboarding Flow', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    await page.goto('http://localhost:3000');
    
    // 1. User lands on page
    await expect(page.locator('h1')).toBeVisible();
    
    // 2. User scrolls through sections
    await page.locator('text=See It In Action').scrollIntoViewIfNeeded();
    await page.locator('text=Perfect For Every Use Case').scrollIntoViewIfNeeded();
    await page.locator('text=Simple, Transparent Pricing').scrollIntoViewIfNeeded();
    
    // 3. User tries the demo
    await page.locator('text=See It In Action').scrollIntoViewIfNeeded();
    const demoSection = page.locator('text=Try our voice transcription technology');
    await expect(demoSection).toBeVisible();
    
    // 4. User clicks CTA
    const ctaButton = page.locator('button:has-text("Start Transcribing")').first();
    await ctaButton.click();
  });

  test('Mobile-First User Experience', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Test mobile navigation and layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Test touch interactions
    await page.touchscreen.tap(200, 300);
    await page.waitForTimeout(500);
    
    // Test mobile-specific features
    await page.locator('text=See It In Action').scrollIntoViewIfNeeded();
    await expect(page.locator('text=Try our voice transcription')).toBeVisible();
  });

  test('Accessibility Compliance', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Test ARIA labels and roles
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Each button should have either aria-label or visible text
      expect(ariaLabel || text).toBeTruthy();
    }
  });
});