# Schema Tables Notes

## Scope
This document summarizes key tables in the clean schema set.

## Auth Domain
- users: account identity, login role, verification state, lock metadata.
- email_verifications: OTP hash and expiry for signup or reset flows.
- admin_action_logs: audit trail for sensitive admin actions.

## Menu Domain
- menu_sections: top-level groups (main, drink, dessert).
- menu_categories: categories under a section.
- menu_items: menu catalog with pricing, availability, and media.
- menu_item_categories: many-to-many relation between menu items and categories.

## Cart Domain
- carts: cart owner (user or guest session) and lifecycle state.
- cart_items: items in cart with quantity and note.

## Order Domain
- orders: checkout result from a cart, customer snapshot, payment and status flow.
- order_items: immutable item snapshot at checkout time.

## Reservation Domain
- restaurant_table: restaurant table map and real-time table status.
- reservation: booking records linked to table and optional user.

## Important Constraints
- users.role supports: customer, employee, admin, system_admin.
- admin_action_logs.actor_user_id and target_user_id use INT to match users.user_id.
- order and cart status columns are protected by CHECK constraints.

## Clean Execution Source
Use files under backend/database/clean in this order:
1. auth_schema_clean.sql
2. menu_schema_clean.sql
3. Cart_clean.sql
4. order_flow_schema_clean.sql
5. restaurant_table_clean.sql
6. Reservation_clean.sql
7. add_admin_action_logs_clean.sql
