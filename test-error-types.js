import { ConflictError, ValidationError, AppError } from './src/utils/errors.js';

const testErrorTypes = () => {
  console.log('🧪 Testing error type inheritance...\n');

  // Test ConflictError
  const conflictError = new ConflictError('User with this email already exists', 'DUPLICATE_EMAIL');
  console.log('ConflictError tests:');
  console.log(`   instanceof ConflictError: ${conflictError instanceof ConflictError}`);
  console.log(`   instanceof AppError: ${conflictError instanceof AppError}`);
  console.log(`   instanceof Error: ${conflictError instanceof Error}`);
  console.log(`   statusCode: ${conflictError.statusCode}`);
  console.log(`   code: ${conflictError.code}`);
  console.log(`   status: ${conflictError.status}`);

  console.log('\nValidationError tests:');
  const validationError = new ValidationError('Invalid data', [{ field: 'email', message: 'Invalid' }]);
  console.log(`   instanceof ValidationError: ${validationError instanceof ValidationError}`);
  console.log(`   instanceof AppError: ${validationError instanceof AppError}`);
  console.log(`   statusCode: ${validationError.statusCode}`);
  console.log(`   code: ${validationError.code}`);

  console.log('\nGeneric AppError tests:');
  const appError = new AppError('Generic app error', 500, 'GENERIC_ERROR');
  console.log(`   instanceof AppError: ${appError instanceof AppError}`);
  console.log(`   statusCode: ${appError.statusCode}`);
  console.log(`   code: ${appError.code}`);

  console.log('\n✅ All error types should inherit from AppError correctly.');
};

testErrorTypes();
