/**
 * Script para verificar y actualizar las credenciales del admin
 */

import bcrypt from 'bcrypt';
import { Usuario } from './src/models/index.js';
import sequelize from './config/sequelize.js';

async function verifyAndFixAdmin() {
    try {
        console.log('🔗 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');

        // Buscar todos los usuarios
        console.log('👥 Buscando usuarios en la base de datos...');
        const users = await Usuario.findAll({
            attributes: ['id', 'correo_electronico', 'primer_nombre', 'primer_apellido', 'activo', 'email_verificado']
        });

        console.log(`📊 Total de usuarios: ${users.length}`);
        
        for (const user of users) {
            console.log(`   - ${user.correo_electronico} | ${user.primer_nombre} ${user.primer_apellido} | Activo: ${user.activo}`);
        }

        // Verificar si existe el admin
        const admin = await Usuario.findOne({
            where: { correo_electronico: 'admin@admin.com' }
        });

        if (!admin) {
            console.log('❌ No se encontró usuario admin');
            return;
        }

        console.log('✅ Usuario admin encontrado');
        console.log(`   ID: ${admin.id}`);
        console.log(`   Nombre: ${admin.primer_nombre} ${admin.primer_apellido}`);
        console.log(`   Email: ${admin.correo_electronico}`);
        console.log(`   Activo: ${admin.activo}`);
        console.log(`   Email verificado: ${admin.email_verificado}`);

        // Actualizar contraseña y estado
        console.log('🔄 Actualizando credenciales...');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await admin.update({
            contrasena: hashedPassword,
            activo: true,
            email_verificado: true,
            intentos_fallidos: 0,
            bloqueado_hasta: null
        });

        console.log('✅ Credenciales actualizadas');
        
        // Verificar contraseña
        const passwordMatch = await bcrypt.compare('admin123', admin.contrasena);
        console.log(`✅ Contraseña válida: ${passwordMatch}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

verifyAndFixAdmin();
