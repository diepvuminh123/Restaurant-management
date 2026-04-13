const pool = require("../config/database");

class RestaurantInfo {
  static allowedFields = [
    "name",
    "slogan",
    "logo_url",
    "brand_image_url",
    "address_line",
    "contact_phone",
    "contact_email",
    "opening_time",
    "closing_time",
  ];

  static async getRestaurantInfo() {
    const result = await pool.query(
      `SELECT id, name, slogan, logo_url, brand_image_url, address_line,
              contact_phone, contact_email, opening_time, closing_time,
              created_at, updated_at
       FROM restaurant_info
       ORDER BY id ASC
       LIMIT 1`
    );

    return result.rows[0] || null;
  }

  static pickPayload(data) {
    return this.allowedFields.reduce((acc, key) => {
      if (data[key] !== undefined) {
        acc[key] = data[key];
      }
      return acc;
    }, {});
  }

  static async createRestaurantInfo(data) {
    const payload = this.pickPayload(data);

    const fields = Object.keys(payload);
    const values = Object.values(payload);
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

    const insertQuery = `
      INSERT INTO restaurant_info (${fields.join(", ")})
      VALUES (${placeholders})
      RETURNING id, name, slogan, logo_url, brand_image_url, address_line,
                contact_phone, contact_email, opening_time, closing_time,
                created_at, updated_at
    `;

    const insertResult = await pool.query(insertQuery, values);
    return insertResult.rows[0];
  }

  static async updateRestaurantInfo(id, data) {
    const payload = this.pickPayload(data);

    if (Object.keys(payload).length === 0) {
      throw new Error("Khong co du lieu de cap nhat");
    }

    const fields = Object.keys(payload);
    const values = Object.values(payload);
    const setClauses = fields.map((field, index) => `${field} = $${index + 1}`);

    const updateQuery = `
      UPDATE restaurant_info
      SET ${setClauses.join(", ")}
      WHERE id = $${fields.length + 1}
      RETURNING id, name, slogan, logo_url, brand_image_url, address_line,
                contact_phone, contact_email, opening_time, closing_time,
                created_at, updated_at
    `;

    const updateResult = await pool.query(updateQuery, [...values, id]);
    return updateResult.rows[0];
  }
}

module.exports = RestaurantInfo;
