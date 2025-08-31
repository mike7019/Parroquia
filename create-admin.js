import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'pg';
const { Client } = pkg;

async function createAdminUser() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password123',
        database: process.env.DB_NAME || 'parroquia_db',
        port: parseInt(process.env.DB_PORT) || 5432
    });

    try {
        await client.connect();
        console.log('🔌 Conectado a la base de datos');

        // Verificar si ya existe el admin
        const checkAdmin = await client.query(
            "SELECT * FROM usuarios WHERE correo_electronico = 'admin@parroquia.com'"
        );

        if (checkAdmin.rows.length > 0) {
            console.log('✅ Usuario admin ya existe');
            return;
        }

        // Crear usuario admin
        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        const userId = uuidv4();

        await client.query(`
            INSERT INTO usuarios (
                id_usuario, 
                correo_electronico, 
                contrasena, 
                nombre, 
                apellido, 
                activo,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [userId, 'admin@parroquia.com', hashedPassword, 'Admin', 'Sistema', true]);

        console.log('✅ Usuario admin creado exitosamente');
        console.log('📧 Email: admin@parroquia.com');
        console.log('🔑 Password: Admin123!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

createAdminUser();
