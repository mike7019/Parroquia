/**
 * Script para crear usuario admin y verificar login
 */

import bcrypt from 'bcrypt';
import { Usuario, Role, UsuarioRole } from './src/models/index.js';
import sequelize from './config/sequelize.js';

async function createAdminUser() {
    try {
        console.log('🔗 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');

        // Verificar si ya existe el usuario admin
        console.log('🔍 Verificando si existe usuario admin...');
        const existingAdmin = await Usuario.findOne({
            where: { correo_electronico: 'admin@admin.com' }
        });

        if (existingAdmin) {
            console.log('✅ Usuario admin ya existe');
            console.log(`   Email: ${existingAdmin.correo_electronico}`);
            console.log(`   Activo: ${existingAdmin.activo}`);
            console.log(`   Verificado: ${existingAdmin.email_verificado}`);
            
            // Verificar contraseña
            const passwordMatch = await bcrypt.compare('admin123', existingAdmin.contrasena);
            console.log(`   Contraseña válida: ${passwordMatch}`);
            
            if (!passwordMatch) {
                console.log('🔄 Actualizando contraseña del admin...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await existingAdmin.update({ contrasena: hashedPassword });
                console.log('✅ Contraseña actualizada');
            }
            
            return;
        }

        console.log('👤 Creando usuario admin...');
        
        // Hashear contraseña
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Crear usuario
        const admin = await Usuario.create({
            primer_nombre: 'Administrador',
            primer_apellido: 'Sistema',
            correo_electronico: 'admin@admin.com',
            contrasena: hashedPassword,
            activo: true,
            email_verificado: true
        });

        console.log('✅ Usuario admin creado exitosamente');
        console.log(`   ID: ${admin.id}`);
        console.log(`   Email: ${admin.correo_electronico}`);

        // Buscar o crear rol admin
        console.log('🎭 Configurando rol de administrador...');
        let adminRole = await Role.findOne({ where: { nombre: 'admin' } });
        
        if (!adminRole) {
            adminRole = await Role.create({
                nombre: 'admin',
                descripcion: 'Administrador del sistema',
                activo: true
            });
            console.log('✅ Rol admin creado');
        }

        // Asignar rol al usuario
        await UsuarioRole.create({
            id_usuarios: admin.id,
            id_roles: adminRole.id
        });

        console.log('✅ Rol asignado al usuario admin');
        console.log('🎉 Setup del usuario admin completado');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

createAdminUser();
