// Usar fetch nativo de Node.js

async function testQuick() {
    try {
        // Login
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo_electronico: 'admin@parroquia.com',
                contrasena: 'Admin123!'
            })
        });

        if (!loginResponse.ok) {
            console.log('Login failed:', await loginResponse.text());
            return;
        }

        const authData = await loginResponse.json();
        const token = authData.data.accessToken;
        console.log('✅ Login successful');

        // Test Excel endpoint
        console.log('🔍 Testing Excel endpoint...');
        const excelResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        console.log('📊 Excel response status:', excelResponse.status);
        console.log('📋 Content-Type:', excelResponse.headers.get('content-type'));

        if (!excelResponse.ok) {
            const errorText = await excelResponse.text();
            console.log('❌ Error response:', errorText);
        } else {
            console.log('✅ Excel endpoint working!');
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

testQuick();