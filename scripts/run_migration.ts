
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL in .env.local');
    process.exit(1);
}

// Fix invalid connection string if it has [YOUR_DB_PASSWORD] placeholder
if (connectionString.includes('[YOUR_DB_PASSWORD]')) {
    console.error('DATABASE_URL contains placeholder password. Please update .env.local with real password.');
    // Try to fallback to service role key if user doesn't have DB password? No, can't.
    // I will assume the user has put the real password or I can't proceed with DDL.
    // Wait, the user provided .env.local content and it HAS the placeholder. 
    // This is a blocker. I cannot connect to Postgres directly without the password.
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

async function runMigration() {
    try {
        await client.connect();
        const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/010_create_messages_table.sql'), 'utf8');
        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
