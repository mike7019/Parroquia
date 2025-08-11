import { ConflictError, ValidationError, AppError } from './src/utils/errors.js';
import DatabaseErrorHandler from './src/utils/databaseErrorHandler.js';

const testErrorHandling = async () => {
  console.log('🧪 Testing DatabaseErrorHandler fixes...\n');

  // Test 1: ConflictError should pass through unchanged
  console.log('Test 1: ConflictError handling');
  try {
    const mockOperation = async () => {
      throw new ConflictError('User with this email already exists', 'DUPLICATE_EMAIL');
    };
    
    await DatabaseErrorHandler.executeWithErrorHandling(mockOperation, { operation: 'test' });
  } catch (error) {
    const isCorrect = error instanceof ConflictError && 
                     error.statusCode === 409 && 
                     error.code === 'DUPLICATE_EMAIL';
    console.log(`   ${isCorrect ? '✅' : '❌'} ConflictError: ${error.message} (${error.statusCode}) [${error.code}]`);
  }

  // Test 2: ValidationError should pass through unchanged
  console.log('\nTest 2: ValidationError handling');
  try {
    const mockOperation = async () => {
      throw new ValidationError('Invalid data', [{ field: 'email', message: 'Invalid email format' }]);
    };
    
    await DatabaseErrorHandler.executeWithErrorHandling(mockOperation, { operation: 'test' });
  } catch (error) {
    const isCorrect = error instanceof ValidationError && error.statusCode === 400;
    console.log(`   ${isCorrect ? '✅' : '❌'} ValidationError: ${error.message} (${error.statusCode})`);
  }

  // Test 3: Generic Error should be converted to AppError
  console.log('\nTest 3: Generic Error handling');
  try {
    const mockOperation = async () => {
      throw new Error('Some unexpected error');
    };
    
    await DatabaseErrorHandler.executeWithErrorHandling(mockOperation, { operation: 'test' });
  } catch (error) {
    const isCorrect = error instanceof AppError && error.statusCode === 500;
    console.log(`   ${isCorrect ? '✅' : '❌'} Generic Error: ${error.message} (${error.statusCode}) [${error.code}]`);
  }

  // Test 4: Simulate the specific user registration scenario
  console.log('\nTest 4: User registration duplicate email scenario');
  try {
    const mockUserRegistration = async () => {
      // Simulate what AuthService does
      const existingUser = { email: 'diego.garcia5105@yopmail.com' };
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }
      return { success: true };
    };
    
    await DatabaseErrorHandler.executeWithErrorHandling(
      mockUserRegistration, 
      { operation: 'user_registration', email: 'diego.garcia5105@yopmail.com' }
    );
  } catch (error) {
    const isCorrect = error instanceof ConflictError && 
                     error.statusCode === 409 && 
                     error.message === 'User with this email already exists';
    console.log(`   ${isCorrect ? '✅' : '❌'} User Registration: ${error.message} (${error.statusCode})`);
    console.log(`   Expected: 409 Conflict, Got: ${error.statusCode} ${error.constructor.name}`);
  }

  console.log('\n🎯 Testing complete. All ConflictErrors should now return 409 status codes.');
};

testErrorHandling().catch(console.error);
