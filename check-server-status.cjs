const axios = require('axios');

async function checkServer() {
  try {
    console.log('🔍 Checking server health...');
    const response = await axios.get('http://206.62.139.11:3001/api/health', {
      timeout: 5000
    });
    console.log('✅ Server is UP!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.log('❌ Server timeout - may still be starting up');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - server may be down');
    } else {
      console.log('❌ Error:', error.message);
    }
    return false;
  }
}

checkServer();
