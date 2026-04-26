const RestaurantInfoService = require('../../src/services/restaurantInfoService');
const RestaurantInfo = require('../../src/models/RestaurantInfo');

jest.mock('../../src/models/RestaurantInfo');

describe('RestaurantInfoService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRestaurantInfo', () => {
    it('should throw 409 if restaurant info already exists', async () => {
      RestaurantInfo.getRestaurantInfo.mockResolvedValue({ id: 1 });
      
      const promise = RestaurantInfoService.createRestaurantInfo({});
      await expect(promise).rejects.toThrow('Restaurant info da ton tai, vui long dung API update');
      await expect(promise).rejects.toHaveProperty('statusCode', 409);
    });

    it('should throw 400 if opening_time is missing', async () => {
      RestaurantInfo.getRestaurantInfo.mockResolvedValue(null);
      
      const promise = RestaurantInfoService.createRestaurantInfo({ closing_time: '22:00' });
      await expect(promise).rejects.toThrow('opening_time va closing_time la bat buoc');
    });

    it('should throw 400 if opening_time is >= closing_time', async () => {
      RestaurantInfo.getRestaurantInfo.mockResolvedValue(null);
      
      const promise = RestaurantInfoService.createRestaurantInfo({ opening_time: '22:00', closing_time: '20:00' });
      await expect(promise).rejects.toThrow('opening_time phai nho hon closing_time');
    });

    it('should create info successfully (Happy Path)', async () => {
      RestaurantInfo.getRestaurantInfo.mockResolvedValue(null);
      RestaurantInfo.createRestaurantInfo.mockResolvedValue({ id: 1 });
      
      const result = await RestaurantInfoService.createRestaurantInfo({ opening_time: '08:00', closing_time: '22:00' });
      
      expect(result).toEqual({ id: 1 });
      expect(RestaurantInfo.createRestaurantInfo).toHaveBeenCalled();
    });
  });

  describe('updateRestaurantInfo', () => {
    it('should throw 404 if info does not exist', async () => {
      RestaurantInfo.getRestaurantInfo.mockResolvedValue(null);
      
      const promise = RestaurantInfoService.updateRestaurantInfo(1, {});
      await expect(promise).rejects.toThrow('Khong tim thay restaurant_info');
      await expect(promise).rejects.toHaveProperty('statusCode', 404);
    });

    it('should throw 404 if id does not match existing info', async () => {
      RestaurantInfo.getRestaurantInfo.mockResolvedValue({ id: 2 });
      
      const promise = RestaurantInfoService.updateRestaurantInfo(1, {});
      await expect(promise).rejects.toThrow('Khong tim thay restaurant_info');
    });

    it('should validate new time range when partially updating opening_time', async () => {
      RestaurantInfo.getRestaurantInfo.mockResolvedValue({ id: 1, opening_time: '08:00', closing_time: '22:00' });
      
      // Update opening_time to 23:00 which is > closing_time 22:00
      const promise = RestaurantInfoService.updateRestaurantInfo(1, { opening_time: '23:00' });
      await expect(promise).rejects.toThrow('opening_time phai nho hon closing_time');
    });

    it('should update successfully with partial data (Happy Path)', async () => {
      RestaurantInfo.getRestaurantInfo.mockResolvedValue({ id: 1, opening_time: '08:00', closing_time: '22:00' });
      RestaurantInfo.updateRestaurantInfo.mockResolvedValue({ id: 1 });
      
      // Update opening_time only
      await RestaurantInfoService.updateRestaurantInfo(1, { opening_time: '09:00' });
      
      expect(RestaurantInfo.updateRestaurantInfo).toHaveBeenCalledWith(1, { opening_time: '09:00' });
    });
  });
});
