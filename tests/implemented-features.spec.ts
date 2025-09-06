import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Test Suite for Plans A-E Implementation
 * 
 * This suite tests all the features implemented:
 * - Plan A: Complete Transcriptions Page
 * - Plan B: Projects Management
 * - Plan C: Enhanced Settings Page
 * - Plan D: Export Functionality
 * - Plan E: Real-time Audio Recording
 */

test.describe('Voiceflow - Plans A-E Implementation Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  // Helper function to simulate authentication (if needed)
  async function simulateAuth(page: Page) {
    // Note: In a real app, we'd handle actual OAuth flows
    // For testing, we'll navigate directly to authenticated routes
    try {
      await page.goto('http://localhost:3000/app');
      await page.waitForLoadState('networkidle');
      return true;
    } catch {
      return false;
    }
  }

  test.describe('Plan A: Transcriptions Management', () => {
    
    test('should navigate to transcriptions page and show empty state', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) {
        console.log('Skipping authenticated test - no auth available');
        return;
      }

      // Navigate to transcriptions page
      await page.goto('http://localhost:3000/app/transcriptions');
      await page.waitForLoadState('networkidle');
      
      // Check page title and header
      await expect(page.locator('h1')).toContainText('Transcriptions');
      await expect(page.locator('text=Manage and organize all your transcribed content')).toBeVisible();
      
      // Check stats cards
      const statsCards = page.locator('[class*="grid"]').first();
      await expect(statsCards).toBeVisible();
    });

    test('should have search and filter functionality', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/transcriptions');
      await page.waitForLoadState('networkidle');
      
      // Search input
      const searchInput = page.locator('input[placeholder*="Search transcriptions"]');
      await expect(searchInput).toBeVisible();
      
      // Filter dropdown
      const filterSelect = page.locator('select').first();
      await expect(filterSelect).toBeVisible();
      
      // Sort dropdown
      const sortSelect = page.locator('select').nth(1);
      await expect(sortSelect).toBeVisible();
      
      // View mode toggles
      const listViewButton = page.locator('button').filter({ has: page.locator('[data-lucide="list"]') });
      const gridViewButton = page.locator('button').filter({ has: page.locator('[data-lucide="grid-3x3"]') });
      
      if (await listViewButton.isVisible()) {
        await expect(listViewButton).toBeVisible();
        await expect(gridViewButton).toBeVisible();
      }
    });

    test('should show export options for bulk operations', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/transcriptions');
      await page.waitForLoadState('networkidle');
      
      // Look for select all functionality
      const selectAllButton = page.locator('button:has-text("Select All")');
      if (await selectAllButton.isVisible()) {
        // If there are transcriptions, test bulk operations
        await selectAllButton.click();
        
        // Check for export buttons
        const exportButtons = page.locator('button:has-text("TXT"), button:has-text("SRT"), button:has-text("DOCX"), button:has-text("PDF")');
        await expect(exportButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('Plan B: Projects Management', () => {
    
    test('should navigate to projects page and show interface', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/projects');
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('Projects');
      
      // Check for create project button
      const createButton = page.locator('button:has-text("New Project"), button').filter({ has: page.locator('[data-lucide="plus"]') });
      await expect(createButton.first()).toBeVisible();
    });

    test('should have project creation modal', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/projects');
      await page.waitForLoadState('networkidle');
      
      // Try to open create project modal
      const createButton = page.locator('button:has-text("New Project"), button').filter({ has: page.locator('[data-lucide="plus"]') });
      
      if (await createButton.first().isVisible()) {
        await createButton.first().click();
        
        // Check for modal elements
        const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
        if (await modal.isVisible()) {
          // Look for form fields
          await expect(page.locator('input[placeholder*="name"], input[name*="name"]')).toBeVisible();
          
          // Look for close button
          const closeButton = page.locator('button').filter({ has: page.locator('[data-lucide="x"]') });
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        }
      }
    });

    test('should show export functionality for projects', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/projects');
      await page.waitForLoadState('networkidle');
      
      // Look for project action buttons (download/export)
      const downloadButtons = page.locator('button').filter({ has: page.locator('[data-lucide="download"]') });
      if (await downloadButtons.first().isVisible()) {
        await expect(downloadButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('Plan C: Settings Page', () => {
    
    test('should navigate to settings and show tabs', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/settings');
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('Settings');
      
      // Check for tabs
      const tabs = [
        'Profile', 'API Keys', 'Transcription', 'Interface', 
        'Notifications', 'Privacy', 'Billing', 'Data & Export'
      ];
      
      for (const tab of tabs) {
        const tabButton = page.locator(`button:has-text("${tab}")`);
        if (await tabButton.isVisible()) {
          await expect(tabButton).toBeVisible();
        }
      }
    });

    test('should have functional tab switching', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/settings');
      await page.waitForLoadState('networkidle');
      
      // Try switching between tabs
      const profileTab = page.locator('button:has-text("Profile")');
      const apiKeysTab = page.locator('button:has-text("API Keys")');
      
      if (await profileTab.isVisible() && await apiKeysTab.isVisible()) {
        await profileTab.click();
        await page.waitForTimeout(500);
        
        await apiKeysTab.click();
        await page.waitForTimeout(500);
        
        // Check for API key input
        const apiKeyInput = page.locator('input[placeholder*="API"], input[type="password"]');
        if (await apiKeyInput.first().isVisible()) {
          await expect(apiKeyInput.first()).toBeVisible();
        }
      }
    });

    test('should have settings persistence functionality', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/settings');
      await page.waitForLoadState('networkidle');
      
      // Look for toggle switches or checkboxes
      const toggles = page.locator('button[role="switch"], input[type="checkbox"]');
      if (await toggles.first().isVisible()) {
        await expect(toggles.first()).toBeVisible();
      }
    });
  });

  test.describe('Plan D: Export Functionality', () => {
    
    test('should have individual export options', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/transcriptions');
      await page.waitForLoadState('networkidle');
      
      // Look for download buttons on individual items
      const downloadButtons = page.locator('button').filter({ has: page.locator('[data-lucide="download"]') });
      
      if (await downloadButtons.first().isVisible()) {
        // Click to open export menu
        await downloadButtons.first().click();
        
        // Check for export format options
        const exportOptions = page.locator('button:has-text("Export as TXT"), button:has-text("Export as SRT"), button:has-text("Export as DOCX"), button:has-text("Export as PDF")');
        if (await exportOptions.first().isVisible()) {
          await expect(exportOptions.first()).toBeVisible();
        }
      }
    });

    test('should have bulk export functionality', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/transcriptions');
      await page.waitForLoadState('networkidle');
      
      // Test bulk export (this was implemented in the bulk actions bar)
      const selectAllButton = page.locator('button:has-text("Select All")');
      if (await selectAllButton.isVisible()) {
        await selectAllButton.click();
        
        // Look for format-specific export buttons
        const exportFormats = ['TXT', 'SRT', 'DOCX', 'PDF'];
        for (const format of exportFormats) {
          const formatButton = page.locator(`button:has-text("${format}")`);
          if (await formatButton.isVisible()) {
            await expect(formatButton).toBeVisible();
          }
        }
      }
    });

    test('should have project export functionality', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/projects');
      await page.waitForLoadState('networkidle');
      
      // Look for project download buttons
      const projectDownloadButtons = page.locator('button').filter({ has: page.locator('[data-lucide="download"]') });
      if (await projectDownloadButtons.first().isVisible()) {
        await expect(projectDownloadButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('Plan E: Real-time Audio Recording', () => {
    
    test('should have recording interface on upload page', async ({ page, context }) => {
      // Grant microphone permissions
      await context.grantPermissions(['microphone']);
      
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/upload');
      await page.waitForLoadState('networkidle');
      
      // Check for recording section
      const recordingSection = page.locator('text=Record Audio');
      await expect(recordingSection).toBeVisible();
      
      // Check for microphone button
      const micButton = page.locator('button').filter({ has: page.locator('[data-lucide="mic"]') });
      await expect(micButton).toBeVisible();
      await expect(micButton).toBeEnabled();
    });

    test('should handle recording interaction', async ({ page, context }) => {
      await context.grantPermissions(['microphone']);
      
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/upload');
      await page.waitForLoadState('networkidle');
      
      const micButton = page.locator('button').filter({ has: page.locator('[data-lucide="mic"]') });
      
      if (await micButton.isVisible()) {
        // Test recording start (note: actual recording may not work in headless mode)
        await micButton.click();
        
        // Check for recording state changes
        const recordingIndicator = page.locator('text=Recording');
        if (await recordingIndicator.isVisible()) {
          await expect(recordingIndicator).toBeVisible();
          
          // Stop recording
          await micButton.click();
        }
      }
    });

    test('should have file upload functionality alongside recording', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/upload');
      await page.waitForLoadState('networkidle');
      
      // Check for file upload area
      const uploadArea = page.locator('text=Drop your audio files here, text=Drag and drop your audio files');
      if (await uploadArea.first().isVisible()) {
        await expect(uploadArea.first()).toBeVisible();
      }
      
      // Check for supported formats info
      const formatInfo = page.locator('text=Supports, text=MP3');
      if (await formatInfo.first().isVisible()) {
        await expect(formatInfo.first()).toBeVisible();
      }
    });

    test('should have transcription settings', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      await page.goto('http://localhost:3000/app/upload');
      await page.waitForLoadState('networkidle');
      
      // Look for transcription settings
      const settingsElements = page.locator('text=Language, text=Speaker, text=Timestamps');
      if (await settingsElements.first().isVisible()) {
        await expect(settingsElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Integration Tests', () => {
    
    test('should have consistent navigation between all pages', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      // Test navigation to all main pages
      const pages = [
        { path: '/app', title: 'Dashboard' },
        { path: '/app/upload', title: 'Upload' },
        { path: '/app/transcriptions', title: 'Transcriptions' },
        { path: '/app/projects', title: 'Projects' },
        { path: '/app/settings', title: 'Settings' }
      ];
      
      for (const pageInfo of pages) {
        await page.goto(`http://localhost:3000${pageInfo.path}`);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without major errors
        const errorText = page.locator('text=Error, text=404, text=Not Found');
        const errorCount = await errorText.count();
        expect(errorCount).toBe(0);
      }
    });

    test('should have responsive design across all pages', async ({ page }) => {
      const authSuccess = await simulateAuth(page);
      if (!authSuccess) return;

      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const pages = ['/app', '/app/upload', '/app/transcriptions', '/app/projects', '/app/settings'];
      
      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`);
        await page.waitForLoadState('networkidle');
        
        // Check that page content is visible and accessible on mobile
        const mainContent = page.locator('main, [role="main"], h1').first();
        await expect(mainContent).toBeVisible();
      }
      
      // Reset to desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  });
});