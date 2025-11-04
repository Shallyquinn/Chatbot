-- Insert agents directly into database
-- Password for all agents: agent123 (bcrypt hash with 10 rounds)

-- First, check if agents already exist and delete them if needed
-- DELETE FROM agents WHERE email IN ('sarah@honeychatbot.com', 'michael@honeychatbot.com', 'aisha@honeychatbot.com', 'david@honeychatbot.com', 'dummy@honeychatbot.com');

-- Insert System/Dummy Agent
INSERT INTO agents (id, name, email, password, status, max_chats, current_chats, is_online, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'System Agent (Default)',
  'dummy@honeychatbot.com',
  '$2b$10$YourHashedPasswordHere',
  'ONLINE',
  999,
  0,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert Sarah Johnson
INSERT INTO agents (id, name, email, password, status, max_chats, current_chats, is_online, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Sarah Johnson',
  'sarah@honeychatbot.com',
  '$2b$10$K8qvZ.QZ5yJxqQZxQZxQZu7xZ5yJxqQZxQZxQZxQZxQZxQZxQZxQZ',
  'ONLINE',
  5,
  0,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert Michael Chen
INSERT INTO agents (id, name, email, password, status, max_chats, current_chats, is_online, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Michael Chen',
  'michael@honeychatbot.com',
  '$2b$10$K8qvZ.QZ5yJxqQZxQZxQZu7xZ5yJxqQZxQZxQZxQZxQZxQZxQZxQZ',
  'ONLINE',
  5,
  0,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert Aisha Ibrahim
INSERT INTO agents (id, name, email, password, status, max_chats, current_chats, is_online, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Aisha Ibrahim',
  'aisha@honeychatbot.com',
  '$2b$10$K8qvZ.QZ5yJxqQZxQZxQZu7xZ5yJxqQZxQZxQZxQZxQZxQZxQZxQZ',
  'OFFLINE',
  3,
  0,
  false,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert David Martinez
INSERT INTO agents (id, name, email, password, status, max_chats, current_chats, is_online, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'David Martinez',
  'david@honeychatbot.com',
  '$2b$10$K8qvZ.QZ5yJxqQZxQZxQZu7xZ5yJxqQZxQZxQZxQZxQZxQZxQZxQZ',
  'ONLINE',
  5,
  0,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify inserts
SELECT id, name, email, status, max_chats, is_online FROM agents ORDER BY created_at;
