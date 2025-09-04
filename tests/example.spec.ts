
import { test, expect } from '@playwright/test';

test('should display the main heading', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: 'Voiceflow' })).toBeVisible();
});
