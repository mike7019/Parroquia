#!/usr/bin/env node

// Test the models import
console.log('🔍 Testing models import...');

try {
  console.log('Importing models...');
  const models = await import('./src/models/index.js');
  console.log('✅ Models imported successfully');
  console.log('Available models:', Object.keys(models));
  
  console.log('Testing Survey model...');
  const { Survey, User } = models;
  if (Survey) {
    console.log('✅ Survey model available');
  } else {
    console.log('❌ Survey model not available');
  }
  
  if (User) {
    console.log('✅ User model available');
  } else {
    console.log('❌ User model not available');
  }
  
} catch (error) {
  console.error('❌ Error importing models:', error.message);
  console.error('Stack:', error.stack);
}
