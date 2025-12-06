import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function checkIdType() {
    try {
        const client = await pool.connect();
        console.log('Connected to database\n');

        const res = await client.query('SELECT id_tipo_disposicion_basura FROM tipos_disposicion_basura LIMIT 1');

        if (res.rows.length > 0) {
            const id = res.rows[0].id_tipo_disposicion_basura;
            console.log(`ID Value: ${id}`);
            console.log(`ID Type: ${typeof id}`);
        } else {
            console.log('No items found.');
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkIdType();
