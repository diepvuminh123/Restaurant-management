const MenuService = require('../../src/services/menuService');
const Menu = require('../../src/models/Menu');

jest.mock('../../src/models/Menu');

describe('MenuService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Quản lý Section
  describe('Section Management', () => {
    describe('createSection', () => {
      it('should throw an error if section_name is missing', async () => {
        await expect(MenuService.createSection({})).rejects.toThrow('Tên phần menu là bắt buộc');
      });

      it('should create section successfully (Happy Path)', async () => {
        const mockData = { section_name: 'Main Course' };
        Menu.createSection.mockResolvedValue({ id: 1, ...mockData });
        const result = await MenuService.createSection(mockData);
        expect(result).toHaveProperty('id', 1);
        expect(Menu.createSection).toHaveBeenCalledWith(mockData);
      });
    });

    describe('updateSection', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.updateSection(null, {})).rejects.toThrow('ID phần menu là bắt buộc');
      });

      it('should throw an error if section not found', async () => {
        Menu.updateSection.mockResolvedValue(false);
        await expect(MenuService.updateSection(99, {})).rejects.toThrow('Phần menu không tồn tại');
      });

      it('should update section successfully (Happy Path)', async () => {
        Menu.updateSection.mockResolvedValue(true);
        const result = await MenuService.updateSection(1, { section_name: 'New Name' });
        expect(result).toBe(true);
        expect(Menu.updateSection).toHaveBeenCalledWith(1, { section_name: 'New Name' });
      });
    });

    describe('updateSectionOrder', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.updateSectionOrder(null, 1)).rejects.toThrow('ID phần menu là bắt buộc');
      });

      it('should throw an error if sortOrder is not a valid number', async () => {
        await expect(MenuService.updateSectionOrder(1, 'abc')).rejects.toThrow('Thứ tự hiển thị phải là một số hợp lệ');
      });

      it('should throw an error if section not found', async () => {
        Menu.updateSectionOrder.mockResolvedValue(false);
        await expect(MenuService.updateSectionOrder(99, 2)).rejects.toThrow('Phần menu không tồn tại');
      });

      it('should update section order successfully (Happy Path)', async () => {
        Menu.updateSectionOrder.mockResolvedValue(true);
        const result = await MenuService.updateSectionOrder(1, 2);
        expect(result).toBe(true);
      });
    });

    describe('deleteSection', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.deleteSection(null)).rejects.toThrow('ID phần menu là bắt buộc');
      });

      it('should throw an error if section not found', async () => {
        Menu.deleteSection.mockResolvedValue(false);
        await expect(MenuService.deleteSection(99)).rejects.toThrow('Phần menu không tồn tại');
      });

      it('should delete section successfully (Happy Path)', async () => {
        Menu.deleteSection.mockResolvedValue(true);
        await MenuService.deleteSection(1);
        expect(Menu.deleteSection).toHaveBeenCalledWith(1);
      });
    });
  });

  // 2. Quản lý Category
  describe('Category Management', () => {
    describe('createCategory', () => {
      it('should throw an error if category_name or section_id is missing', async () => {
        await expect(MenuService.createCategory({ category_name: 'Beef' })).rejects.toThrow('Tên danh mục và ID phần menu là bắt buộc');
        await expect(MenuService.createCategory({ section_id: 1 })).rejects.toThrow('Tên danh mục và ID phần menu là bắt buộc');
      });

      it('should create category successfully (Happy Path)', async () => {
        const mockData = { category_name: 'Beef', section_id: 1 };
        Menu.createCategory.mockResolvedValue({ id: 1, ...mockData });
        const result = await MenuService.createCategory(mockData);
        expect(result).toHaveProperty('id', 1);
      });
    });

    describe('updateCategory', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.updateCategory(null, {})).rejects.toThrow('ID danh mục là bắt buộc');
      });

      it('should throw an error if category not found', async () => {
        Menu.updateCategory.mockResolvedValue(false);
        await expect(MenuService.updateCategory(99, {})).rejects.toThrow('Danh mục không tồn tại');
      });

      it('should update category successfully (Happy Path)', async () => {
        Menu.updateCategory.mockResolvedValue(true);
        const result = await MenuService.updateCategory(1, { category_name: 'Pork' });
        expect(result).toBe(true);
      });
    });

    describe('deleteCategory', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.deleteCategory(null)).rejects.toThrow('ID danh mục là bắt buộc');
      });

      it('should throw an error if category not found', async () => {
        Menu.deleteCategory.mockResolvedValue(false);
        await expect(MenuService.deleteCategory(99)).rejects.toThrow('Danh mục không tồn tại');
      });

      it('should delete category successfully (Happy Path)', async () => {
        Menu.deleteCategory.mockResolvedValue(true);
        await MenuService.deleteCategory(1);
        expect(Menu.deleteCategory).toHaveBeenCalledWith(1);
      });
    });
  });

  // 3. Quản lý Menu Item
  describe('Menu Item Management', () => {
    describe('getMenuItemById', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.getMenuItemById(null)).rejects.toThrow('ID món ăn là bắt buộc');
      });

      it('should throw an error if item not found', async () => {
        Menu.getMenuItemById.mockResolvedValue(null);
        await expect(MenuService.getMenuItemById(99)).rejects.toThrow('Món ăn không tồn tại');
      });

      it('should return item successfully (Happy Path)', async () => {
        Menu.getMenuItemById.mockResolvedValue({ id: 1, name: 'Pho' });
        const item = await MenuService.getMenuItemById(1);
        expect(item).toHaveProperty('name', 'Pho');
      });
    });

    describe('createMenuItem', () => {
      it('should throw an error if name or price is missing', async () => {
        await expect(MenuService.createMenuItem({ name: 'Pho' })).rejects.toThrow('Tên và giá là bắt buộc');
        await expect(MenuService.createMenuItem({ price: 100 })).rejects.toThrow('Tên và giá là bắt buộc');
      });

      it('should throw an error if price < 0', async () => {
        await expect(MenuService.createMenuItem({ name: 'Pho', price: -10 })).rejects.toThrow('Giá phải lớn hơn 0');
      });

      it('should create menu item successfully (Happy Path)', async () => {
        Menu.createMenuItem.mockResolvedValue(1);
        const result = await MenuService.createMenuItem({ name: 'Pho', price: 50 });
        expect(result).toEqual({ id: 1 });
      });
    });

    describe('updateMenuItem', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.updateMenuItem(null, {})).rejects.toThrow('ID món ăn là bắt buộc');
      });

      it('should throw an error if item not found', async () => {
        Menu.getMenuItemById.mockResolvedValue(null);
        await expect(MenuService.updateMenuItem(99, {})).rejects.toThrow('Món ăn không tồn tại');
      });

      it('should throw an error if price is provided and <= 0', async () => {
        Menu.getMenuItemById.mockResolvedValue({ id: 1 });
        await expect(MenuService.updateMenuItem(1, { price: 0 })).rejects.toThrow('Giá phải lớn hơn 0');
      });

      it('should update menu item successfully (Happy Path)', async () => {
        Menu.getMenuItemById.mockResolvedValue({ id: 1 });
        Menu.updateMenuItem.mockResolvedValue(true);
        await MenuService.updateMenuItem(1, { name: 'Pho Bo' });
        expect(Menu.updateMenuItem).toHaveBeenCalledWith(1, { name: 'Pho Bo' });
      });
    });

    describe('updateAvailability', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.updateAvailability(null, true)).rejects.toThrow('ID món ăn là bắt buộc');
      });

      it('should throw an error if available is undefined', async () => {
        await expect(MenuService.updateAvailability(1, undefined)).rejects.toThrow('Trạng thái còn hàng là bắt buộc');
      });

      it('should throw an error if item not found', async () => {
        Menu.updateAvailability.mockResolvedValue(false);
        await expect(MenuService.updateAvailability(99, true)).rejects.toThrow('Món ăn không tồn tại');
      });

      it('should update availability successfully (Happy Path)', async () => {
        Menu.updateAvailability.mockResolvedValue(true);
        await MenuService.updateAvailability(1, false);
        expect(Menu.updateAvailability).toHaveBeenCalledWith(1, false);
      });
    });

    describe('deleteMenuItem', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.deleteMenuItem(null)).rejects.toThrow('ID món ăn là bắt buộc');
      });

      it('should throw an error if item not found', async () => {
        Menu.deleteMenuItem.mockResolvedValue(false);
        await expect(MenuService.deleteMenuItem(99)).rejects.toThrow('Món ăn không tồn tại');
      });

      it('should delete menu item successfully (Happy Path)', async () => {
        Menu.deleteMenuItem.mockResolvedValue(true);
        await MenuService.deleteMenuItem(1);
        expect(Menu.deleteMenuItem).toHaveBeenCalledWith(1);
      });
    });

    describe('updateMenuItemImage', () => {
      it('should throw an error if id is missing', async () => {
        await expect(MenuService.updateMenuItemImage(null, 'url')).rejects.toThrow('ID món ăn là bắt buộc');
      });

      it('should throw an error if item not found', async () => {
        Menu.updateMenuItem.mockResolvedValue(false);
        await expect(MenuService.updateMenuItemImage(99, 'url')).rejects.toThrow('Món ăn không tồn tại');
      });

      it('should update image successfully (Happy Path)', async () => {
        Menu.updateMenuItem.mockResolvedValue(true);
        const result = await MenuService.updateMenuItemImage(1, 'http://image.url');
        expect(result).toBe(true);
        expect(Menu.updateMenuItem).toHaveBeenCalledWith(1, { images: 'http://image.url' });
      });
    });
  });

  // 4. Các hàm Query
  describe('Query Methods', () => {
    it('getSections should call Menu.getAllSections', async () => {
      Menu.getAllSections.mockResolvedValue([{ id: 1 }]);
      const result = await MenuService.getSections();
      expect(result).toEqual([{ id: 1 }]);
    });

    it('getCategoriesBySection should throw if sectionId is missing', async () => {
      await expect(MenuService.getCategoriesBySection(null)).rejects.toThrow('Section ID là bắt buộc');
    });

    it('getCategoriesBySection should call Menu.getCategoriesBySection', async () => {
      Menu.getCategoriesBySection.mockResolvedValue([{ id: 1 }]);
      const result = await MenuService.getCategoriesBySection(1);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('getMenuItems should call Menu.getAllMenuItems', async () => {
      Menu.getAllMenuItems.mockResolvedValue([{ id: 1 }]);
      const result = await MenuService.getMenuItems({ category_id: 1 });
      expect(result).toEqual([{ id: 1 }]);
    });

    it('getFacets should call Menu.getFacets', async () => {
      Menu.getFacets = jest.fn().mockResolvedValue({ sections: [] });
      const result = await MenuService.getFacets(1);
      expect(result).toEqual({ sections: [] });
    });
  });
});
