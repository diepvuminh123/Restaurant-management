ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('customer', 'employee', 'admin', 'system_admin'));

CREATE TABLE IF NOT EXISTS admin_action_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  target_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_action_logs_actor ON admin_action_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_target ON admin_action_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_action ON admin_action_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON admin_action_logs(created_at DESC);
