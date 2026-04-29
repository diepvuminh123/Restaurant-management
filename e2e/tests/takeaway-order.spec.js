// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E Test: Luồng Đặt món mang về
 * 
 * Mô tả: Kiểm tra luồng đặt món mang về từ trang Menu đến trang Checkout.
 * Các bước:
 *   1. Mở trang Menu
 *   2. Đợi danh sách món load xong
 *   3. Click "Đặt mang về" trên dish card đầu tiên
 *   4. Chuyển đến trang Checkout
 *   5. Điền thông tin khách hàng
 *   6. Xác nhận đặt đơn (chuyển sang Step 2 - Cọc)
 */

// Hàm tiện ích: lấy ngày mai
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

test.describe('Luồng Đặt món mang về', () => {

  test('Trang Menu hiển thị danh sách món', async ({ page }) => {
    await page.goto('/menu');

    // Đợi menu items load
    await expect(page.locator('.dish-grid')).toBeVisible({ timeout: 15000 });

    // Kiểm tra có ít nhất 1 dish card
    const dishCards = page.locator('.dish-card');
    await expect(dishCards.first()).toBeVisible();
    const count = await dishCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Thêm món vào giỏ và chuyển đến Checkout', async ({ page }) => {
    await page.goto('/menu');

    // Đợi dish cards load
    await expect(page.locator('.dish-grid')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.dish-card').first()).toBeVisible();

    // Click nút "Đặt mang về" trên dish card đầu tiên
    const orderButton = page.locator('.dish-card').first().locator('.btn-solid');
    await expect(orderButton).toBeVisible();
    await orderButton.click();

    // Kiểm tra chuyển đến trang Checkout
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await expect(page.locator('.checkout-screen')).toBeVisible();
  });

  test('Điền thông tin và xác nhận đặt đơn thành công', async ({ page }) => {
    await page.goto('/menu');

    // Đợi và click "Đặt mang về"
    await expect(page.locator('.dish-grid')).toBeVisible({ timeout: 15000 });

    // Lấy dish card đầu tiên không bị soldout
    const availableDish = page.locator('.dish-card .btn-solid:not([disabled])').first();
    await expect(availableDish).toBeVisible({ timeout: 5000 });
    await availableDish.click();

    // Chuyển đến checkout
    await page.waitForURL('**/checkout', { timeout: 10000 });

    // === Kiểm tra giỏ hàng có món ===
    await expect(page.locator('.order-items-list')).toBeVisible();

    // Đợi cart load xong (kiểm tra có ít nhất 1 item)
    await expect(page.locator('.order-item-row').first()).toBeVisible({ timeout: 10000 });

    // === Điền thông tin khách hàng ===
    await page.locator('input[name="name"]').fill('Nguyễn Văn Test');
    await page.locator('input[name="phone"]').fill('0901234567');
    await page.locator('input[name="email"]').fill('test@example.com');

    // Điền ngày và giờ lấy hàng
    const tomorrowDate = getTomorrowDate();
    await page.locator('input[name="pickupDate"]').fill(tomorrowDate);
    await page.locator('input[name="pickupTime"]').fill('12:00');

    // Ghi chú (tùy chọn)
    await page.locator('textarea[name="notes"]').fill('Test E2E - không cần chuẩn bị');

    // === Click "Xác nhận đặt đơn" ===
    await page.locator('.btn-confirm-order').click();

    // === Kiểm tra chuyển sang Step 2 (Cọc) ===
    // Step 2 hiển thị phương thức thanh toán
    await expect(page.locator('.payment-methods')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.checkout-summary')).toBeVisible();

    // Kiểm tra thông tin khách hiển thị đúng trong summary
    await expect(page.locator('.checkout-summary')).toContainText('Nguyễn Văn Test');
    await expect(page.locator('.checkout-summary')).toContainText('0901234567');
  });
});
