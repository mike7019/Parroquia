import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

async function listTipos() {
    try {
        const client = await pool.connect();
        console.log('Connected to database\n');

        const res = await client.query('SELECT nombre FROM tipos_disposicion_basura ORDER BY nombre ASC');

        const names = res.rows.map(r => r.nombre);
        fs.writeFileSync('existing_tipos.json', JSON.stringify(names, null, 2));
        console.log('Written to existing_tipos.json');

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

listTipos();
