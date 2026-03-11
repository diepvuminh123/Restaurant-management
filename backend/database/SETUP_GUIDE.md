# Database Setup Guide

## Order Flow Schema - Setup Instructions

### Prerequisites
- PostgreSQL 12+ installed
- Database created: `restaurant_db`
- psql command-line tool or database client

### Schema Files Overview

| File | Purpose | Dependencies | Clean Version |
|------|---------|--------------|---------------|
| `auth_schema.sql` | Users & Authentication | None | `auth_schema_clean.sql` |
| `menu_schema.sql` | Menu system (sections, categories, items) | None | `menu_schema_clean.sql` |
| `Cart.sql` | Shopping cart tables (with session support) | `auth_schema.sql`, `menu_schema.sql` | `Cart_clean.sql` |
| `order_flow_schema.sql` | Orders & order items | All above | `order_flow_schema_clean.sql` |
| `add_status_fields.sql` | Additional status fields (if needed) | Check file content | N/A |

**Note on Clean Versions:**
- Clean versions (`*_clean.sql`) have all inline comments removed for compatibility with DB clients that have issues parsing SQL comments
- Use clean versions if you encounter "syntax error at end of input" or similar parsing errors
- Clean versions contain identical schema structure, just without documentation comments

### Setup Commands (In Order)

#### Option 1: Using Original Files (with comments)

```bash
# Navigate to database folder
cd backend/database

# 1. Create users and authentication tables
psql -U your_username -d restaurant_db -f auth_schema.sql

# 2. Create menu tables with sample data
psql -U your_username -d restaurant_db -f menu_schema.sql

# 3. Create cart tables (includes session_id for guest users)
psql -U your_username -d restaurant_db -f Cart.sql

# 4. Create order tables
psql -U your_username -d restaurant_db -f order_flow_schema.sql

# 5. (Optional) Add additional status fields if needed
# psql -U your_username -d restaurant_db -f add_status_fields.sql
```

#### Using Original Files:
```powershell
cd backend\database

psql -U postgres -d restaurant_db -f auth_schema.sql
psql -U postgres -d restaurant_db -f menu_schema.sql
psql -U postgres -d restaurant_db -f Cart.sql
psql -U postgres -d restaurant_db -f order_flow_schema.sql
```

#### Using Clean Files (recommended for DB clients):
```powershell
cd backend\database

psql -U postgres -d restaurant_db -f auth_schema_clean.sql
psql -U postgres -d restaurant_db -f menu_schema_clean.sql
psql -U postgres -d restaurant_db -f Cart_clean.sql
psql -U postgres -d restaurant_db -f order_flow_schema_clean
# 2. Create menu tables with sample data
psql -U your_username -d restaurant_db -f menu_schema_clean.sql

# 3. Create cart tables (includes session_id for guest users)
psql -U your_username -d restaurant_db -f Cart_clean.sql

# 4. Create order tables
psql -U your_username -d restaurant_db -f order_flow_schema_clean.sql
```

### PowerShell Commands (Windows)

```powershell
# Navigate to database folder
cd backend\database

#### Using Original Files:
```bash
# Bash/Linux
for file in auth_schema.sql menu_schema.sql Cart.sql order_flow_schema.sql; do
  psql -U your_username -d restaurant_db -f $file
done

# PowerShell
Get-ChildItem auth_schema.sql,menu_schema.sql,Cart.sql,order_flow_schema.sql | ForEach-Object { psql -U postgres -d restaurant_db -f $_.Name }
```

#### Using Clean Files:
```bash
# Bash/Linux
for file in auth_schema_clean.sql menu_schema_clean.sql Cart_clean.sql order_flow_schema_clean.sql; do
  psql -U your_username -d restaurant_db -f $file
done

# PowerShell
Get-ChildItem auth_schema_clean.sql,menu_schema_clean.sql,Cart_clean.sql,order_flow_schema_clean

```bash
# Bash/Linux
for file in auth_schema.sql menu_schema.sql Cart.sql order_flow_schema.sql; do
  psql -U your_username -d restaurant_db -f $file
done

# PowerShell
Get-ChildItem auth_schema.sql,menu_schema.sql,Cart.sql,order_flow_schema.sql | ForEach-Object { psql -U postgres -d restaurant_db -f $_.Name }
```

### Verification Queries

After running all schemas, verify your tables:

```sql
-- List all "syntax error at end of input"
- **Cause**: Some DB client tools have issues parsing inline SQL comments (`--`)
- **Solution**: Use the clean versions of schema files (`*_clean.sql`)
- **Note**: This is a client-side parsing issue, not a PostgreSQL issue

#### Error: relation "users" already exists
- Some tables may already exist. Check with `\dt` command.
- Either drop existing tables or skip that specific schema file.

#### Error: function "update_updated_at_column" already exists
- Function is created in `menu_schema.sql` and reused in other files.
- This is normal and can be ignored if using `CREATE OR REPLACE FUNCTION`.

#### DB Client Recommendations
- **psql command line**: Works perfectly with all files (original or clean)
- **pgAdmin**: Works with both versions
- **DBeaver**: Works with both versions
- **DBClient/Azure Data Studio**: May require clean versions for some setups
-- orders, order_items

-- Check table structures
\d users
\d carts
\d orders

-- Verify data
SELECT COUNT(*) FROM menu_sections;
SELECT COUNT(*) FROM menu_items;
```

### Troubleshooting

#### Error: relation "users" already exists
- Some tables may already exist. Check with `\dt` command.
- Either drop existing tables or skip that specific schema file.

#### Error: function "update_updated_at_column" already exists
- Function is created in `menu_schema.sql` and reused in other files.
- This is normal and can be ignored if using `CREATE OR REPLACE FUNCTION`.

#### Missing session_id in carts table
- The updated `Cart.sql` now includes `session_id` column by default.
- This supports guest users who haven't logged in yet.

#### Permission denied
- Ensure your PostgreSQL user has CREATE privileges.
- Use superuser or grant permissions: `GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO your_username;`

### Database Connection String

For Node.js backend:

```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'restaurant_db',
  user: 'your_username',
  password: 'your_password'
});
```

### Additional Notes

1. **Sample Data**: `menu_schema.sql` includes sample menu items. Remove if not needed.

2. **Prep Time & Notes**: Menu items include `prep_time` and `notes` fields (added 01/12/2025).

3. **Session Support**: Carts now support both logged-in users (`user_id`) and guest users (`session_id`).

4. **Order Flow**:
   - Customer adds items to cart (`cart_items`)
   - At checkout, creates order from cart (`orders`)
   - Order items are snapshots of cart items (`order_items`)
   - Cart status changes to `CHECKED_OUT`

5. **Indexes**: All foreign keys and frequently queried columns have indexes for performance.

### Reset Database (Clean Slate)

```sql
-- Drop all tables (careful!)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS menu_item_categories CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS menu_sections CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_line_total() CASCADE;

-- Drop views
DROP VIEW IF EXISTS v_order_summary CASCADE;
```

Then re-run all schema files in order.
