# Database Setup Guide Clean

## Muc tieu
Tai lieu nay dung de khoi tao schema theo ban clean, dong nhat va it loi parser tren cac DB client.

## Cau truc thu muc
- clean: chua cac schema clean theo tung module.
- full: chua file full tong hop.
- SCHEMA_TABLES.md: chu thich nhanh cac bang.

## Thu tu chay file clean
Chay dung thu tu duoi day trong thu muc clean:

1. auth_schema_clean.sql
2. menu_schema_clean.sql
3. Cart_clean.sql
4. order_flow_schema_clean.sql
5. restaurant_table_clean.sql
6. Reservation_clean.sql
7. add_admin_action_logs_clean.sql

## Lenh chay bang psql

```powershell
cd backend\database\clean

psql -U postgres -d restaurant_db -f auth_schema_clean.sql
psql -U postgres -d restaurant_db -f menu_schema_clean.sql
psql -U postgres -d restaurant_db -f Cart_clean.sql
psql -U postgres -d restaurant_db -f order_flow_schema_clean.sql
psql -U postgres -d restaurant_db -f restaurant_table_clean.sql
psql -U postgres -d restaurant_db -f Reservation_clean.sql
psql -U postgres -d restaurant_db -f add_admin_action_logs_clean.sql
```

## Chay full DB mot file

```powershell
cd backend\database\full
psql -U postgres -d restaurant_db -f full_schema_clean.sql
```

## Luu y quan trong
- users.user_id dang la INT (SERIAL), nen FK lien quan toi users phai dung INT.
- role trong users da mo rong gom: customer, employee, admin, system_admin.
- update_updated_at_column duoc tao trong auth_schema_clean.sql va duoc tai su dung boi cac schema khac.
- add_admin_action_logs_clean.sql bao gom ca cap nhat role constraint va tao bang admin_action_logs.

## Kiem tra nhanh sau khi chay

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass
  AND conname = 'users_role_check';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'admin_action_logs'
ORDER BY ordinal_position;
```

## Danh sach file clean hien co
- clean/auth_schema_clean.sql
- clean/menu_schema_clean.sql
- clean/Cart_clean.sql
- clean/order_flow_schema_clean.sql
- clean/restaurant_table_clean.sql
- clean/Reservation_clean.sql
- clean/add_admin_action_logs_clean.sql

## Danh sach file full
- full/full_schema_clean.sql
- full/full_schema_with_seed.sql
