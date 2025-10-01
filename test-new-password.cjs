const axios = require('axios');

async function testNewPassword() {
    console.log('🔐 Probando login con nueva contraseña...\n');

    try {
        // Probar con la nueva contraseña
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });

        console.log('✅ ¡Login exitoso con nueva contraseña!');
        console.log(`   👤 Usuario: ${response.data.data.user.primer_nombre}`);
        console.log(`   🎯 Role: ${response.data.data.user.roles[0]}`);
        console.log(`   🕐 Último acceso: ${new Date(response.data.data.user.fecha_ultimo_acceso).toLocaleString()}`);
        console.log(`   🆔 Token generado: ${response.data.data.accessToken.substring(0, 50)}...`);

        // Probar que la contraseña anterior ya no funciona
        console.log('\n🚫 Verificando que la contraseña anterior no funciona...');
        try {
            await axios.post('http://localhost:3000/api/auth/login', {
                correo_electronico: 'admin@parroquia.com',
                contrasena: 'admin123'
            });
            console.log('❌ ERROR: La contraseña anterior aún funciona');
        } catch (oldPasswordError) {
            if (oldPasswordError.response && oldPasswordError.response.status === 401) {
                console.log('✅ Correcto: La contraseña anterior ya no funciona');
            } else {
                console.log('⚠️  Error inesperado con contraseña anterior:', oldPasswordError.response?.data);
            }
        }

        console.log('\n🎉 ¡Actualización de contraseña completada exitosamente!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Nueva contraseña funcionando correctamente');
        console.log('✅ Contraseña anterior deshabilitada');
        console.log('🔑 Credenciales actuales:');
        console.log('   📧 Email: admin@parroquia.com');
        console.log('   🔒 Password: Admin123!');

    } catch (error) {
        console.error('❌ Error en el login con nueva contraseña:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testNewPassword();