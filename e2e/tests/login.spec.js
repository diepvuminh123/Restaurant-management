// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E Test: Luồng Đăng nhập
 * 
 * Mô tả: Kiểm tra luồng đăng nhập của người dùng từ đầu đến cuối.
 * Các bước:
 *   1. Mở trang đăng nhập
 *   2. Điền email và mật khẩu
 *   3. Click nút đăng nhập
 *   4. Kiểm tra chuyển hướng thành công
 */

// ====== CẤU HÌNH TÀI KHOẢN TEST ======
const TEST_EMAIL = '';
const TEST_PASSWORD = '';
// =======================================

test.describe('Luồng Đăng nhập', () => {

  test('Hiển thị form đăng nhập đúng', async ({ page }) => {
    await page.goto('/login');

    // Kiểm tra tiêu đề form
    await expect(page.locator('.formTitle')).toHaveText('Chào mừng bạn trở lại');
    await expect(page.locator('.formSubtitle')).toHaveText('Đăng nhập để tiếp tục');

    // Kiểm tra các trường input tồn tại
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Kiểm tra nút đăng nhập
    await expect(page.locator('button[type="submit"].primaryButton')).toBeVisible();
  });

  test('Đăng nhập thành công và chuyển hướng', async ({ page }) => {
    await page.goto('/login');

    // Điền email
    await page.locator('input[name="email"]').fill(TEST_EMAIL);

    // Điền mật khẩu
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);

    // Click nút đăng nhập
    await page.locator('button[type="submit"].primaryButton').click();

    // Đợi chuyển hướng — sau khi login thành công, URL phải khác /login
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 15000,
    });

    // Kiểm tra URL hiện tại (admin → /admin/dashboard, user → /home)
    const currentURL = page.url();
    const isRedirected =
      currentURL.includes('/home') || currentURL.includes('/admin');
    expect(isRedirected).toBe(true);
  });

  test('Đăng nhập thất bại với mật khẩu sai', async ({ page }) => {
    await page.goto('/login');

    // Điền email đúng nhưng mật khẩu sai
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"]').fill('wrong-password-123');

    // Click đăng nhập
    await page.locator('button[type="submit"].primaryButton').click();

    // Đợi thông báo lỗi xuất hiện
    await expect(page.locator('.errorMessage')).toBeVisible({ timeout: 10000 });

    // URL vẫn ở trang login
    expect(page.url()).toContain('/login');
  });
});
