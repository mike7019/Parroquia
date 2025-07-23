import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...');
    
    const loginData = {
      email: 'demo@parroquia.com',
      password: 'Demo1234!'
    };
    
    console.log('📤 Sending login request...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const result = await response.text();
    
    console.log('📡 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('💾 Response body:', result);
    
    if (response.status === 200) {
      console.log('✅ Login successful!');
      const data = JSON.parse(result);
      console.log('🎟️  Access token received:', data.data?.accessToken ? 'YES' : 'NO');
    } else if (response.status === 401) {
      console.log('❌ Login failed: Invalid credentials');
      console.log('💡 This might be expected if we don\'t know the correct password');
    } else if (response.status === 500) {
      console.log('❌ Server error - login endpoint still has issues');
    } else {
      console.log('⚠️  Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();
