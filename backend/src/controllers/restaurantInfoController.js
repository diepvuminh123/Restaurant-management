const RestaurantInfoService = require("../services/restaurantInfoService");

class RestaurantInfoController {
  static async getRestaurantInfo(req, res) {
    try {
      const info = await RestaurantInfoService.getRestaurantInfo();

      res.status(200).json({
        success: true,
        data: info,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Khong the lay thong tin nha hang",
      });
    }
  }

  static async createRestaurantInfo(req, res) {
    try {
      const createdInfo = await RestaurantInfoService.createRestaurantInfo(req.body);

      res.status(201).json({
        success: true,
        message: "Tao thong tin nha hang thanh cong",
        data: createdInfo,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Khong the tao thong tin nha hang",
      });
    }
  }

  static async updateRestaurantInfo(req, res) {
    try {
      const { id } = req.params;
      const updatedInfo = await RestaurantInfoService.updateRestaurantInfo(id, req.body);

      res.status(200).json({
        success: true,
        message: "Cap nhat thong tin nha hang thanh cong",
        data: updatedInfo,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Khong the cap nhat thong tin nha hang",
      });
    }
  }
}

module.exports = RestaurantInfoController;
