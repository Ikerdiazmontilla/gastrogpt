// backend/db/databaseSetup.js
const pool = require('./pool');

/**
 * @file databaseSetup.js
 * @description Handles the initial setup and schema creation/migration for the database.
 * Ensures that necessary tables and functions exist.
 */

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create chat_conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID PRIMARY KEY,
        session_id TEXT NOT NULL,
        messages JSONB NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add is_active column if it doesn't exist (for backward compatibility if needed)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'chat_conversations' AND column_name = 'is_active'
        ) THEN
          ALTER TABLE chat_conversations ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
        END IF;
      END $$;
    `);

    // Create index for active chat conversations
    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_active
        ON chat_conversations (session_id, is_active)
        WHERE is_active = TRUE;
    `);

    // Create questionnaire_interactions table // Commented out section
    // await client.query(`
    //   CREATE TABLE IF NOT EXISTS questionnaire_interactions (
    //     id UUID PRIMARY KEY,
    //     session_id TEXT NOT NULL,
    //     submission_data JSONB NOT NULL,
    //     recommendation_text TEXT NOT NULL,
    //     created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    //   );
    // `);

    // Create or replace function to set timestamp on update
    await client.query(`
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger for chat_conversations if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'set_timestamp_chat_conversations' AND tgrelid = 'chat_conversations'::regclass
        ) THEN
          CREATE TRIGGER set_timestamp_chat_conversations
          BEFORE UPDATE ON chat_conversations
          FOR EACH ROW
          EXECUTE FUNCTION trigger_set_timestamp();
        END IF;
      END
      $$;
    `);
    console.log('Database initialized successfully (tables, indexes, triggers verified/created).');
  } catch (err) {
    console.error('Error initializing the database:', err);
    // Depending on the error, you might want to exit or handle it differently
    throw err; // Re-throw to be caught by the server startup logic
  } finally {
    client.release();
  }
};

module.exports = { initializeDatabase };