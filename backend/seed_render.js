const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://restaurant_db_c6pn_user:83XL4u3Zugy2lyjNi1x0lkDvK4KB06yQ@dpg-d7tn2opo3t8c739mcoc0-a.singapore-postgres.render.com/restaurant_db_c6pn';

async function seedDatabase() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Đang kết nối tới Render Database...');
        await client.connect();
        console.log('Kết nối thành công! Đang tiến hành đổ dữ liệu...');

        const sqlFilePath = path.join(__dirname, 'database', 'full', 'full_schema_with_seed.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        await client.query(sql);
        
        console.log('🎉 Xong! Toàn bộ cấu trúc bảng và dữ liệu mẫu đã được đưa lên Render thành công!');
    } catch (err) {
        console.error('Lỗi trong quá trình đổ dữ liệu:', err);
    } finally {
        await client.end();
    }
}

seedDatabase();
