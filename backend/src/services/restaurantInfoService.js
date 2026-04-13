const RestaurantInfo = require("../models/RestaurantInfo");

class RestaurantInfoService {
  static createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  static async getRestaurantInfo() {
    return RestaurantInfo.getRestaurantInfo();
  }

  static async createRestaurantInfo(data) {
    const existing = await RestaurantInfo.getRestaurantInfo();
    if (existing) {
      throw this.createHttpError("Restaurant info da ton tai, vui long dung API update", 409);
    }

    this.#validateTimeRange(data.opening_time, data.closing_time);
    return RestaurantInfo.createRestaurantInfo(data);
  }

  static async updateRestaurantInfo(id, data) {
    const existing = await RestaurantInfo.getRestaurantInfo();
    if (!existing || Number(existing.id) !== Number(id)) {
      throw this.createHttpError("Khong tim thay restaurant_info", 404);
    }

    const openingTime = data.opening_time ?? existing.opening_time;
    const closingTime = data.closing_time ?? existing.closing_time;

    this.#validateTimeRange(openingTime, closingTime);
    return RestaurantInfo.updateRestaurantInfo(id, data);
  }

  static #validateTimeRange(openingTime, closingTime) {
    if (!openingTime || !closingTime) {
      throw this.createHttpError("opening_time va closing_time la bat buoc", 400);
    }

    const openingMinutes = this.#toMinutes(openingTime);
    const closingMinutes = this.#toMinutes(closingTime);

    if (openingMinutes >= closingMinutes) {
      throw this.createHttpError("opening_time phai nho hon closing_time", 400);
    }
  }

  static #toMinutes(timeInput) {
    const timeText = String(timeInput).slice(0, 8);
    const parts = timeText.split(":").map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;

    return hours * 60 + minutes;
  }
}

module.exports = RestaurantInfoService;
