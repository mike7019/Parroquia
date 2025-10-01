const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function updateAdminPassword() {
    console.log('🔐 Actualizando contraseña del administrador...\n');

    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        // 1. Verificar que el usuario existe
        console.log('🔍 Verificando usuario admin...');
        const userCheck = await pool.query(
            'SELECT id, correo_electronico, primer_nombre FROM usuarios WHERE correo_electronico = $1',
            ['admin@parroquia.com']
        );

        if (userCheck.rows.length === 0) {
            console.log('❌ Usuario admin@parroquia.com no encontrado');
            return;
        }

        const usuario = userCheck.rows[0];
        console.log(`✅ Usuario encontrado: ${usuario.primer_nombre} (${usuario.correo_electronico})`);
        console.log(`   ID: ${usuario.id}\n`);

        // 2. Generar hash de la nueva contraseña
        console.log('🔒 Generando hash para la nueva contraseña...');
        const nuevaContrasena = 'Admin123!';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(nuevaContrasena, saltRounds);
        console.log('✅ Hash generado exitosamente\n');

        // 3. Actualizar la contraseña en la base de datos
        console.log('💾 Actualizando contraseña en la base de datos...');
        const updateResult = await pool.query(
            'UPDATE usuarios SET contrasena = $1, updated_at = NOW() WHERE correo_electronico = $2 RETURNING id, correo_electronico, updated_at',
            [hashedPassword, 'admin@parroquia.com']
        );

        if (updateResult.rows.length > 0) {
            console.log('✅ Contraseña actualizada exitosamente');
            console.log(`   Usuario: ${updateResult.rows[0].correo_electronico}`);
            console.log(`   Actualizado: ${updateResult.rows[0].updated_at}`);
        } else {
            console.log('❌ No se pudo actualizar la contraseña');
        }

        // 4. Verificar que la nueva contraseña funciona
        console.log('\n🧪 Verificando nueva contraseña...');
        const verifyResult = await pool.query(
            'SELECT contrasena FROM usuarios WHERE correo_electronico = $1',
            ['admin@parroquia.com']
        );

        if (verifyResult.rows.length > 0) {
            const passwordMatch = await bcrypt.compare(nuevaContrasena, verifyResult.rows[0].contrasena);
            if (passwordMatch) {
                console.log('✅ Verificación exitosa - La nueva contraseña funciona correctamente');
            } else {
                console.log('❌ Error en la verificación - La contraseña no coincide');
            }
        }

        console.log('\n🎉 ¡Actualización completada!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Contraseña del administrador actualizada');
        console.log('🔑 Nuevas credenciales:');
        console.log('   📧 Email: admin@parroquia.com');
        console.log('   🔒 Password: Admin123!');
        console.log('🚀 Ya puedes hacer login con las nuevas credenciales');

    } catch (error) {
        console.error('❌ Error actualizando contraseña:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

updateAdminPassword();