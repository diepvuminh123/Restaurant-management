// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E Test: Luồng Đặt bàn (Khách vãng lai)
 * 
 * Mô tả: Kiểm tra luồng đặt bàn từ đầu đến cuối cho khách không đăng nhập.
 * Các bước:
 *   1. Mở trang đặt bàn
 *   2. Chọn ngày, giờ, số người
 *   3. Chọn bàn trống
 *   4. Submit → Modal chọn vai trò → chọn "Khách"
 *   5. Điền thông tin khách → xác nhận
 *   6. Kiểm tra chuyển sang trang thành công
 */

// Hàm tiện ích: lấy ngày mai dạng YYYY-MM-DD
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

test.describe('Luồng Đặt bàn (Khách vãng lai)', () => {

  test('Hiển thị form đặt bàn đúng', async ({ page }) => {
    await page.goto('/booking');

    // Kiểm tra form đặt bàn hiển thị
    await expect(page.locator('.quick-booking-container')).toBeVisible();

    // Kiểm tra có input ngày
    await expect(page.locator('input[type="date"]')).toBeVisible();

    // Kiểm tra có dropdown giờ và số người
    await expect(page.locator('.custom-select')).toHaveCount(2);
  });

  test('Đặt bàn thành công với tư cách khách vãng lai', async ({ page }) => {
    await page.goto('/booking');

    // === Bước 1: Chọn ngày (ngày mai) ===
    const tomorrowDate = getTomorrowDate();
    await page.locator('input[type="date"]').fill(tomorrowDate);

    // === Bước 2: Chọn giờ ===
    // Click vào dropdown giờ (dropdown đầu tiên)
    const timeDropdown = page.locator('.custom-select').first();
    await timeDropdown.click();

    // Đợi dropdown mở, chọn slot giờ đầu tiên
    const timeOption = page.locator('.custom-dropdown li').first();
    await expect(timeOption).toBeVisible({ timeout: 5000 });
    await timeOption.click();

    // === Bước 3: Chọn số người ===
    const guestDropdown = page.locator('.custom-select').nth(1);
    await guestDropdown.click();

    // Chọn "2 người" (option thứ 2 trong danh sách)
    const guestOption = page.locator('.custom-dropdown li').nth(1);
    await expect(guestOption).toBeVisible({ timeout: 5000 });
    await guestOption.click();

    // === Bước 4: Đợi bàn load và chọn bàn trống ===
    // Đợi bàn xuất hiện (grid bàn)
    await expect(page.locator('.booking-table-grid')).toBeVisible({ timeout: 10000 });

    // Click vào bàn available đầu tiên
    const availableTable = page.locator('.booking-table-box.available').first();
    await expect(availableTable).toBeVisible({ timeout: 5000 });
    await availableTable.click();

    // Kiểm tra bàn đã được chọn (có class "selected")
    await expect(availableTable).toHaveClass(/selected/);

    // === Bước 5: Submit form → Modal chọn vai trò ===
    await page.locator('.submit-button').click();

    // Đợi modal Role Selection xuất hiện
    await expect(page.locator('.role-selection-modal-overlay')).toBeVisible({ timeout: 5000 });

    // Click "Tiếp tục là khách"
    const guestButton = page.locator('.role-selection-modal .btn').first();
    await expect(guestButton).toHaveText('Tiếp tục là khách');
    await guestButton.click();

    // === Bước 6: Điền thông tin khách ===
    // Form nhập tên + SĐT xuất hiện
    await expect(page.locator('.quick-booking-container')).toBeVisible();

    // Điền tên khách
    await page.locator('input[type="text"]').fill('Nguyễn Văn Test');

    // Điền số điện thoại
    await page.locator('input[type="tel"]').fill('0901234567');

    // Submit thông tin khách
    await page.locator('.submit-button').click();

    // === Bước 7: Kiểm tra chuyển sang trang thành công ===
    await page.waitForURL('**/reservation-success', { timeout: 15000 });

    // Kiểm tra có icon/text thành công
    await expect(page.locator('.reservation-success-container')).toBeVisible();
    await expect(page.locator('.success-card')).toBeVisible();
  });
});
