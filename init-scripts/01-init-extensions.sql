-- Initialize PostgreSQL extensions for Parroquia DB
-- This script runs automatically when the container starts for the first time

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Enable citext for case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS app_schema;

-- Set default permissions
GRANT ALL PRIVILEGES ON DATABASE parroquia_db TO parroquia_user;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Parroquia DB initialized successfully with extensions';
END $$;
