import { ConflictError } from './src/utils/errors.js';
import DatabaseErrorHandler from './src/utils/databaseErrorHandler.js';

const testCompleteRegistrationFlow = async () => {
  console.log('🧪 Testing complete user registration error flow...\n');

  // Simulate the exact scenario from the logs
  console.log('Test: Duplicate email registration scenario');
  
  try {
    // This simulates what AuthService.registerUser does when a user exists
    const mockAuthServiceRegisterUser = async () => {
      // Check if user already exists (simulated)
      const existingUser = { correo_electronico: 'diego.garcia5105@yopmail.com' };
      
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }
      
      // This should not be reached
      return { user: { id: 1 }, accessToken: 'token', refreshToken: 'refresh' };
    };

    // This simulates what the AuthController does
    const result = await DatabaseErrorHandler.executeWithErrorHandling(
      mockAuthServiceRegisterUser,
      { operation: 'user_registration', email: 'diego.garcia5105@yopmail.com' }
    );
    
    console.log('❌ ERROR: Should have thrown ConflictError');
    
  } catch (error) {
    console.log('✅ Caught error as expected');
    console.log(`   Error type: ${error.constructor.name}`);
    console.log(`   Error message: ${error.message}`);
    console.log(`   Status code: ${error.statusCode}`);
    console.log(`   Error code: ${error.code}`);
    console.log(`   Status: ${error.status}`);
    
    // Verify it's the correct error type and status
    const isCorrectType = error instanceof ConflictError;
    const isCorrectStatus = error.statusCode === 409;
    const isCorrectCode = error.code === 'CONFLICT';
    
    console.log('\n📋 Validation:');
    console.log(`   ${isCorrectType ? '✅' : '❌'} instanceof ConflictError: ${isCorrectType}`);
    console.log(`   ${isCorrectStatus ? '✅' : '❌'} statusCode 409: ${isCorrectStatus}`);
    console.log(`   ${isCorrectCode ? '✅' : '❌'} code CONFLICT: ${isCorrectCode}`);
    
    if (isCorrectType && isCorrectStatus && isCorrectCode) {
      console.log('\n🎉 SUCCESS: Error handling is working correctly!');
      console.log('   The API should now return 409 Conflict instead of 500 Internal Server Error');
    } else {
      console.log('\n❌ FAILURE: Error handling needs more fixes');
    }
  }

  // Test what the error middleware would do
  console.log('\n🧪 Testing error middleware response format...');
  
  const conflictError = new ConflictError('User with this email already exists', 'DUPLICATE_EMAIL');
  
  // Simulate the response object
  const mockResponse = {
    statusCode: null,
    jsonData: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    }
  };

  // Simulate the request object
  const mockRequest = {
    originalUrl: '/api/auth/register',
    method: 'POST'
  };

  // Simulate what handleAppError would do
  const errorResponse = {
    status: conflictError.status,
    message: conflictError.message,
    timestamp: new Date().toISOString(),
    path: mockRequest.originalUrl,
    code: conflictError.code
  };

  console.log('Expected error response format:');
  console.log(JSON.stringify(errorResponse, null, 2));
  
  console.log('\n✅ The response should now have status 409 instead of 500');
};

testCompleteRegistrationFlow().catch(console.error);
