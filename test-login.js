async function testLogin() {
    try {
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo_electronico: 'admin@parroquia.com',
                contrasena: 'Admin123!'
            })
        });

        console.log('Status:', loginResponse.status);
        const data = await loginResponse.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();