-- Runs once, when the database volume is first created.
-- Application tables arrive with the Day 2 migrations (database/migrations/).
-- (gen_random_uuid() is built into PostgreSQL 13+, so no pgcrypto needed.)
CREATE EXTENSION IF NOT EXISTS vector;
