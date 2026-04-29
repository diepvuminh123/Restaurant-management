// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * Cấu hình Playwright cho kiểm thử E2E
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './e2e/tests',
  
  /* Thời gian tối đa cho mỗi test */
  timeout: 60_000,

  /* Không retry khi fail (để dễ debug) */
  retries: 0,

  /* Cấu hình chung cho tất cả test */
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,

    /* Chụp ảnh & quay video khi test fail */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  /* Chỉ dùng Chromium để đơn giản */
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],

  /* Xuất báo cáo HTML */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
});
