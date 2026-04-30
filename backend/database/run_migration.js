const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Running promotions.sql...');
    const promotionsSql = fs.readFileSync(path.join(__dirname, 'promotions.sql'), 'utf8');
    await client.query(promotionsSql);
    console.log('promotions.sql executed successfully.');

    console.log('Running add_promotion_to_orders.sql...');
    const addPromoSql = fs.readFileSync(path.join(__dirname, 'add_promotion_to_orders.sql'), 'utf8');
    await client.query(addPromoSql);
    console.log('add_promotion_to_orders.sql executed successfully.');

    await client.query('COMMIT');
    console.log('All migrations completed successfully.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
