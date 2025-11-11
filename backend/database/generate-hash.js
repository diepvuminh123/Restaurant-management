const bcrypt = require('bcrypt');

/**
 * Script để tạo password hash cho việc test hoặc khởi tạo dữ liệu
 * Chạy: node database/generate-hash.js
 */

const passwords = [
  { label: 'admin123', password: 'admin123' },
  { label: 'employee123', password: 'employee123' },
  { label: 'customer123', password: 'customer123' }
];

async function generateHashes() {
  console.log('🔐 Generating password hashes...\n');
  
  for (const item of passwords) {
    const hash = await bcrypt.hash(item.password, 10);
    console.log(`Password: ${item.label}`);
    console.log(`Hash: ${hash}\n`);
  }
  
  console.log(' Done! Copy these hashes to your init.sql file.');
}

generateHashes().catch(console.error);
