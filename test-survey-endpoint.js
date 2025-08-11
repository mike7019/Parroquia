// Test script for survey endpoint
import fetch from 'node-fetch';

async function testSurveyEndpoint() {
    try {
        console.log('🔄 Testing survey endpoint...');
        
        const response = await fetch('http://localhost:3000/api/surveys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                familyHead: 'Test Family Head',
                address: 'Test Address 123',
                sector: 'Test Sector',
                familySize: 4,
                housingType: 'Casa propia'
            })
        });

        console.log('📊 Response status:', response.status);
        console.log('📄 Response headers:', Object.fromEntries(response.headers));
        
        const responseText = await response.text();
        console.log('📝 Response body:', responseText);

        if (response.ok) {
            console.log('✅ Survey endpoint is working correctly!');
            try {
                const responseData = JSON.parse(responseText);
                console.log('📋 Parsed response:', responseData);
            } catch (parseError) {
                console.log('⚠️  Response is not JSON:', responseText);
            }
        } else {
            console.log('❌ Survey endpoint returned an error');
        }

    } catch (error) {
        console.error('💥 Error testing survey endpoint:', error.message);
    }
}

testSurveyEndpoint();
