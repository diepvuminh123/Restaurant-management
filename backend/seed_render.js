const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = '';

async function seedDatabase() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Đang kết nối tới Render Database...');
        await client.connect();
        console.log('Kết nối thành công! Đang tiến hành đổ dữ liệu...');

        const sqlFilePath = path.join(__dirname, 'database', 'add_status_fields.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        await client.query(sql);

        console.log('🎉 Xong! Đã thêm các cột is_soldout và is_new thành công!');
    } catch (err) {
        console.error('Lỗi trong quá trình đổ dữ liệu:', err);
    } finally {
        await client.end();
    }
}

seedDatabase();
