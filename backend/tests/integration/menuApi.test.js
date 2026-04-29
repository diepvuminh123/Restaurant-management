const request = require('supertest');

// Mock session config — bypass PostgreSQL session store
jest.mock('../../src/config/session', () => ({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
  name: 'test_session',
  cookie: { maxAge: 86400000, httpOnly: false, secure: false },
}));

// Mock database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

// Mock MenuService
jest.mock('../../src/services/menuService');
const MenuService = require('../../src/services/menuService');

const app = require('../../src/app');

describe('Menu API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // GET /api/menu/sections
  // ═══════════════════════════════════════════════════
  describe('GET /api/menu/sections', () => {
    it('should return 200 with list of sections', async () => {
      MenuService.getSections.mockResolvedValue([
        { id: 1, section_name: 'Món chính', display_order: 1 },
      ]);

      const res = await request(app).get('/api/menu/sections');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('section_name', 'Món chính');
    });

    it('should return 500 if service throws', async () => {
      MenuService.getSections.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/menu/sections');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════
  // POST /api/menu/sections
  // ═══════════════════════════════════════════════════
  describe('POST /api/menu/sections', () => {
    it('should return 201 on success', async () => {
      MenuService.createSection.mockResolvedValue({ id: 1, section_name: 'Đồ uống' });

      const res = await request(app)
        .post('/api/menu/sections')
        .send({ section_name: 'Đồ uống' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Tạo phần menu thành công');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/menu/sections')
        .send({}); // missing section_name

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════
  // GET /api/menu/categories
  // ═══════════════════════════════════════════════════
  describe('GET /api/menu/categories', () => {
    it('should return 400 if section_id is missing', async () => {
      const res = await request(app).get('/api/menu/categories');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('section_id là bắt buộc');
    });

    it('should return 200 with categories', async () => {
      MenuService.getCategoriesBySection.mockResolvedValue([
        { id: 1, category_name: 'Cơm' },
      ]);

      const res = await request(app).get('/api/menu/categories?section_id=1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ═══════════════════════════════════════════════════
  // GET /api/menus (Menu Items with filter/sort/pagination)
  // ═══════════════════════════════════════════════════
  describe('GET /api/menus', () => {
    it('should return 200 with menu items', async () => {
      MenuService.getMenuItems.mockResolvedValue({
        data: [{ id: 1, name: 'Phở bò' }],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 1 },
      });

      const res = await request(app).get('/api/menus?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toHaveProperty('totalItems', 1);
    });
  });

  // ═══════════════════════════════════════════════════
  // GET /api/menus/:id
  // ═══════════════════════════════════════════════════
  describe('GET /api/menus/:id', () => {
    it('should return 200 with item detail', async () => {
      MenuService.getMenuItemById.mockResolvedValue({ id: 1, name: 'Bún chả' });

      const res = await request(app).get('/api/menus/1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Bún chả');
    });

    it('should return 404 if item not found', async () => {
      MenuService.getMenuItemById.mockRejectedValue(new Error('Món ăn không tồn tại'));

      const res = await request(app).get('/api/menus/999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Món ăn không tồn tại');
    });
  });

  // ═══════════════════════════════════════════════════
  // POST /api/menus (Create)
  // ═══════════════════════════════════════════════════
  describe('POST /api/menus', () => {
    it('should return 201 on success', async () => {
      MenuService.createMenuItem.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/menus')
        .send({ name: 'Phở gà', price: 50000, category_id: 1 });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Tạo món ăn thành công');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/menus')
        .send({}); // missing required fields

      expect(res.status).toBe(400);
    });
  });

  // ═══════════════════════════════════════════════════
  // PUT /api/menus/:id (Update)
  // ═══════════════════════════════════════════════════
  describe('PUT /api/menus/:id', () => {
    it('should return 200 on success', async () => {
      MenuService.updateMenuItem.mockResolvedValue(true);

      const res = await request(app)
        .put('/api/menus/1')
        .send({ name: 'Phở gà updated' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cập nhật món ăn thành công');
    });

    it('should return 404 if not found', async () => {
      MenuService.updateMenuItem.mockRejectedValue(new Error('Món ăn không tồn tại'));

      const res = await request(app)
        .put('/api/menus/999')
        .send({ name: 'X' });

      expect(res.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════
  // PATCH /api/menus/:id/availability
  // ═══════════════════════════════════════════════════
  describe('PATCH /api/menus/:id/availability', () => {
    it('should return 200 on success', async () => {
      MenuService.updateAvailability.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/menus/1/availability')
        .send({ available: false });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cập nhật trạng thái thành công');
    });

    it('should return 404 if item not found', async () => {
      MenuService.updateAvailability.mockRejectedValue(new Error('Món ăn không tồn tại'));

      const res = await request(app)
        .patch('/api/menus/999/availability')
        .send({ available: true });

      expect(res.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════
  // DELETE /api/menus/:id
  // ═══════════════════════════════════════════════════
  describe('DELETE /api/menus/:id', () => {
    it('should return 200 on success', async () => {
      MenuService.deleteMenuItem.mockResolvedValue(true);

      const res = await request(app).delete('/api/menus/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Xóa món ăn thành công');
    });

    it('should return 404 if not found', async () => {
      MenuService.deleteMenuItem.mockRejectedValue(new Error('Món ăn không tồn tại'));

      const res = await request(app).delete('/api/menus/999');

      expect(res.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════
  // Section CRUD (Update, Order, Delete)
  // ═══════════════════════════════════════════════════
  describe('Section CRUD', () => {
    it('PUT /api/menu/sections/:id should return 200', async () => {
      MenuService.updateSection.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .put('/api/menu/sections/1')
        .send({ section_name: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cập nhật phần menu thành công');
    });

    it('PATCH /api/menu/sections/:id/order should return 400 if sort_order missing', async () => {
      const res = await request(app)
        .patch('/api/menu/sections/1/order')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('sort_order phải là một số hợp lệ');
    });

    it('PATCH /api/menu/sections/:id/order should return 200 on success', async () => {
      MenuService.updateSectionOrder.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .patch('/api/menu/sections/1/order')
        .send({ sort_order: 2 });

      expect(res.status).toBe(200);
    });

    it('DELETE /api/menu/sections/:id should return 200', async () => {
      MenuService.deleteSection.mockResolvedValue(true);

      const res = await request(app).delete('/api/menu/sections/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Xóa phần menu thành công');
    });

    it('DELETE /api/menu/sections/:id should return 404 if not found', async () => {
      MenuService.deleteSection.mockRejectedValue(new Error('Phần menu không tồn tại'));

      const res = await request(app).delete('/api/menu/sections/999');

      expect(res.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════
  // Category CRUD
  // ═══════════════════════════════════════════════════
  describe('Category CRUD', () => {
    it('POST /api/menu/categories should return 201', async () => {
      MenuService.createCategory.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/menu/categories')
        .send({ category_name: 'Soup', section_id: 1 });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Tạo danh mục thành công');
    });

    it('PUT /api/menu/categories/:id should return 200', async () => {
      MenuService.updateCategory.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .put('/api/menu/categories/1')
        .send({ category_name: 'Updated' });

      expect(res.status).toBe(200);
    });

    it('DELETE /api/menu/categories/:id should return 200', async () => {
      MenuService.deleteCategory.mockResolvedValue(true);

      const res = await request(app).delete('/api/menu/categories/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Xóa danh mục thành công');
    });

    it('DELETE /api/menu/categories/:id should return 404 if not found', async () => {
      MenuService.deleteCategory.mockRejectedValue(new Error('Danh mục không tồn tại'));

      const res = await request(app).delete('/api/menu/categories/999');

      expect(res.status).toBe(404);
    });
  });
});
