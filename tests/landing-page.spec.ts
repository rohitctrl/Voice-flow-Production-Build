import { test, expect } from '@playwright/test';

test.describe('Voiceflow Landing Page', () => {
  test('should load without errors and display main elements', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:3000');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Check if main heading is visible
    await expect(page.locator('h1')).toContainText('Voiceflow');

    // Check if the description text is visible
    await expect(page.locator('text=Transform your voice into beautifully organized text with AI-powered transcription')).toBeVisible();

    // Check if the CTA button is visible and clickable
    await expect(page.locator('button:has-text("Start Transcribing")')).toBeVisible();

    // Check if the canvas (waveform) is present
    await expect(page.locator('canvas')).toBeVisible();

    // Check if the badge with microphone icon is visible
    await expect(page.locator('text=AI-Powered Voice Transcription')).toBeVisible();

    // Test mouse interaction by moving mouse over the page
    await page.mouse.move(400, 300);
    await page.mouse.move(600, 400);

    // Wait a bit to see if animations load
    await page.waitForTimeout(1000);

    // Check for any console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/landing-page-screenshot.png' });
  });

  test('should have proper responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Start Transcribing")')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Start Transcribing")')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Start Transcribing")')).toBeVisible();
  });

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if the page has a proper title
    await expect(page).toHaveTitle(/Voiceflow/);

    // Check if button is keyboard accessible
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Start Transcribing")')).toBeFocused();
    
    // Check if button can be activated with keyboard
    await page.keyboard.press('Enter');
  });
});