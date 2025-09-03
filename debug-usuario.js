import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';
import bcrypt from 'bcrypt';

async function debugUser() {
    try {
        console.log('🔍 Depurando usuario admin...');
        
        // Cargar modelos
        await loadAllModels();
        const { Usuario } = sequelize.models;
        
        // Buscar el usuario
        const usuario = await Usuario.findOne({
            where: { correo_electronico: 'admin@parroquia.com' },
            raw: true
        });
        
        if (!usuario) {
            console.log('❌ Usuario no encontrado');
            return;
        }
        
        console.log('✅ Usuario encontrado:');
        console.log('ID:', usuario.id);
        console.log('Email:', usuario.correo_electronico);
        console.log('Activo:', usuario.activo);
        console.log('Hash almacenado:', usuario.contrasena);
        console.log('Intentos fallidos:', usuario.intentos_fallidos);
        console.log('Bloqueado hasta:', usuario.bloqueado_hasta);
        
        // Probar la contraseña
        const password = 'Admin123!';
        console.log('\n🔐 Probando contraseña:', password);
        
        const isValid = await bcrypt.compare(password, usuario.contrasena);
        console.log('¿Contraseña válida?', isValid);
        
        // Intentar con diferentes versiones por si acaso
        const alternatives = ['admin123', 'Admin123', 'ADMIN123!'];
        for (const alt of alternatives) {
            const altValid = await bcrypt.compare(alt, usuario.contrasena);
            console.log(`¿"${alt}" es válida?`, altValid);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

debugUser();
