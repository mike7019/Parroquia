import { sequelize } from './src/models/index.js';
import bcrypt from 'bcryptjs';

async function verificarLogin() {
    try {
        console.log('🔄 Verificando login...');
        await sequelize.authenticate();
        
        const { Usuario } = sequelize.models;
        
        // Buscar usuario
        const usuario = await Usuario.findOne({
            where: { correo_electronico: 'admin@parroquia.com' }
        });
        
        if (!usuario) {
            console.log('❌ Usuario no encontrado');
            return;
        }
        
        console.log('✅ Usuario encontrado');
        
        // Verificar contraseña actual
        const contraseñaCorrecta = await bcrypt.compare('Admin123!', usuario.contrasena);
        console.log('🔑 Contraseña actual válida:', contraseñaCorrecta);
        
        // Si la contraseña no es correcta, vamos a actualizarla
        if (!contraseñaCorrecta) {
            console.log('🔄 Actualizando contraseña...');
            const nuevaHash = await bcrypt.hash('Admin123!', 12);
            
            await usuario.update({
                contrasena: nuevaHash,
                activo: true,
                email_verificado: true,
                intentos_fallidos: 0,
                bloqueado_hasta: null
            });
            
            console.log('✅ Contraseña actualizada');
            
            // Verificar nuevamente
            const verificacion = await bcrypt.compare('Admin123!', nuevaHash);
            console.log('✅ Nueva contraseña verificada:', verificacion);
        }
        
        await sequelize.close();
        console.log('✅ Proceso completado');
        
    } catch (error) {
        console.error('❌ Error:', error);
        if (sequelize) {
            await sequelize.close();
        }
    }
}

verificarLogin();
