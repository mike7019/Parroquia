import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testParentescoRoutes() {
    console.log('🧪 Testing Parentesco Routes');
    console.log('==================================');
    
    try {
        // Test 1: Direct route /api/parentescos
        console.log('\n1️⃣ Testing direct route: /api/parentescos');
        try {
            const response1 = await axios.get(`${BASE_URL}/api/parentescos?limit=5`, {
                timeout: 5000
            });
            console.log('✅ Direct route works!');
            console.log(`   Status: ${response1.status}`);
            console.log(`   Data: ${JSON.stringify(response1.data, null, 2).substring(0, 200)}...`);
        } catch (error) {
            console.log('❌ Direct route failed:');
            console.log(`   Status: ${error.response?.status || 'No response'}`);
            console.log(`   Message: ${error.response?.data?.message || error.message}`);
        }
        
        // Test 2: Catalog route /api/catalog/parentescos
        console.log('\n2️⃣ Testing catalog route: /api/catalog/parentescos');
        try {
            const response2 = await axios.get(`${BASE_URL}/api/catalog/parentescos?limit=5`, {
                timeout: 5000
            });
            console.log('✅ Catalog route works!');
            console.log(`   Status: ${response2.status}`);
            console.log(`   Data: ${JSON.stringify(response2.data, null, 2).substring(0, 200)}...`);
        } catch (error) {
            console.log('❌ Catalog route failed:');
            console.log(`   Status: ${error.response?.status || 'No response'}`);
            console.log(`   Message: ${error.response?.data?.message || error.message}`);
        }
        
        // Test 3: Health check
        console.log('\n3️⃣ Testing server health: /api/health');
        try {
            const response3 = await axios.get(`${BASE_URL}/api/health`, {
                timeout: 5000
            });
            console.log('✅ Server is healthy!');
            console.log(`   Status: ${response3.status}`);
        } catch (error) {
            console.log('❌ Server health check failed:');
            console.log(`   Status: ${error.response?.status || 'No response'}`);
            console.log(`   Message: ${error.response?.data?.message || error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Test suite error:', error.message);
    }
}

// Run tests
testParentescoRoutes();
