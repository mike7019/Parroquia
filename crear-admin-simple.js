// Script simple para crear usuario admin
import sequelize from './config/sequelize.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const { Usuario, Role, UsuarioRole } = sequelize.models;

async function crearAdmin() {
    try {
        console.log('🔄 Creando usuario administrador...');
        
        // 1. Crear rol admin
        const rolId = uuidv4();
        await sequelize.query(`
            INSERT INTO roles (id, nombre, created_at, updated_at) 
            VALUES ('${rolId}', 'admin', NOW(), NOW()) 
            ON CONFLICT (id) DO NOTHING
        `);
        console.log('✅ Rol admin creado');
        
        // 2. Crear usuario admin
        const usuarioId = uuidv4();
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await sequelize.query(`
            INSERT INTO usuarios (
                id, correo_electronico, contrasena, primer_nombre, 
                primer_apellido, numero_documento, telefono, activo, 
                email_verificado, created_at, updated_at
            ) VALUES (
                '${usuarioId}', 'admin@parroquia.com', '${hashedPassword}', 
                'Administrador', 'Sistema', '12345678', '3001234567', 
                true, true, NOW(), NOW()
            ) ON CONFLICT (correo_electronico) DO NOTHING
        `);
        console.log('✅ Usuario admin creado');
        
        // 3. Asignar rol
        await sequelize.query(`
            INSERT INTO usuarios_roles (id_usuarios, id_roles, created_at, updated_at) 
            VALUES ('${usuarioId}', '${rolId}', NOW(), NOW()) 
            ON CONFLICT (id_usuarios, id_roles) DO NOTHING
        `);
        console.log('✅ Rol asignado');
        
        console.log('');
        console.log('🎉 Usuario administrador creado exitosamente!');
        console.log('📧 Email: admin@parroquia.com');
        console.log('🔑 Password: admin123');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

crearAdmin();
