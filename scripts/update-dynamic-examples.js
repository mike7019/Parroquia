#!/usr/bin/env node

/**
 * Script to update dynamic examples in Swagger documentation
 * This ensures user examples are never the same across server restarts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate dynamic user examples
 */
const generateDynamicUserExamples = () => {
  const firstNames = ['Ana', 'Carlos', 'Maria', 'Jose', 'Laura', 'Pedro', 'Sofia', 'Luis', 'Carmen', 'Diego', 'Valentina', 'Andres', 'Isabella', 'Fernando', 'Gabriela'];
  const lastNames = ['Garcia', 'Rodriguez', 'Lopez', 'Martinez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Cruz', 'Flores', 'Herrera', 'Vargas', 'Castro', 'Ortiz', 'Morales'];
  
  const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
  const generateRandomId = () => Math.floor(Math.random() * 9000) + 1000;
  const generateRandomPassword = () => {
    const passwords = ['MiPassword123!', 'Segura456@', 'Clave789#', 'Pass321$', 'Super456%', 'Fuerte789&'];
    return getRandomElement(passwords);
  };

  const generateUser = () => {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const randomId = generateRandomId();
    // Remove any special characters and convert to lowercase for email compatibility
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${cleanFirstName}.${cleanLastName}${randomId}@yopmail.com`;
    
    return {
      firstName,
      lastName,
      email,
      password: generateRandomPassword(),
      role: 'surveyor'
    };
  };

  // Generate multiple unique users for different examples
  const users = [];
  for (let i = 0; i < 5; i++) {
    users.push(generateUser());
  }
  
  return users;
};

/**
 * Update examples in authRoutes.js
 */
const updateAuthRoutesExamples = (users) => {
  const authRoutesPath = path.join(__dirname, '../src/routes/authRoutes.js');
  let content = fs.readFileSync(authRoutesPath, 'utf8');

  // Update registration example
  const registerUser = users[0];
  content = content.replace(
    /firstName: "[^"]*"/,
    `firstName: "${registerUser.firstName}"`
  );
  content = content.replace(
    /lastName: "[^"]*"/,
    `lastName: "${registerUser.lastName}"`
  );
  content = content.replace(
    /email: "[^"]*"/,
    `email: "${registerUser.email}"`
  );
  content = content.replace(
    /password: "[^"]*"/,
    `password: "${registerUser.password}"`
  );

  // Update other examples with different users
  const loginUser = users[1];
  const forgotPasswordUser = users[2];
  const profileUser = users[3];
  const resendVerificationUser = users[4];

  // Replace login examples
  content = content.replace(
    /(login.*?example:\s*\{[\s\S]*?)email: "[^"]*"/,
    `$1email: "${loginUser.email}"`
  );
  content = content.replace(
    /(login.*?example:\s*\{[\s\S]*?)password: "[^"]*"/,
    `$1password: "${loginUser.password}"`
  );

  // Replace forgot-password example
  content = content.replace(
    /(forgot-password.*?example:\s*\{[\s\S]*?)email: "[^"]*"/,
    `$1email: "${forgotPasswordUser.email}"`
  );

  // Replace profile examples
  content = content.replace(
    /(profile.*?user:[\s\S]*?)firstName: "[^"]*"/,
    `$1firstName: "${profileUser.firstName}"`
  );
  content = content.replace(
    /(profile.*?user:[\s\S]*?)lastName: "[^"]*"/,
    `$1lastName: "${profileUser.lastName}"`
  );
  content = content.replace(
    /(profile.*?user:[\s\S]*?)email: "[^"]*"/,
    `$1email: "${profileUser.email}"`
  );

  // Replace resend-verification-public example
  content = content.replace(
    /(resend-verification-public[\s\S]*?example: ")[^"]*"/,
    `$1${resendVerificationUser.email}"`
  );

  fs.writeFileSync(authRoutesPath, content);
  console.log('✅ Updated authRoutes.js examples');
};

/**
 * Update examples in swagger.js
 */
const updateSwaggerExamples = (users) => {
  const swaggerPath = path.join(__dirname, '../src/config/swagger.js');
  let content = fs.readFileSync(swaggerPath, 'utf8');

  const registerUser = users[0];
  const loginUser = users[1];
  const forgotPasswordUser = users[2];

  // Update UserInput schema examples
  content = content.replace(
    /(UserInput[\s\S]*?firstName[\s\S]*?example: ')[^']*'/,
    `$1${registerUser.firstName}'`
  );
  content = content.replace(
    /(UserInput[\s\S]*?lastName[\s\S]*?example: ')[^']*'/,
    `$1${registerUser.lastName}'`
  );
  content = content.replace(
    /(UserInput[\s\S]*?email[\s\S]*?example: ')[^']*'/,
    `$1${registerUser.email}'`
  );
  content = content.replace(
    /(UserInput[\s\S]*?password[\s\S]*?example: ')[^']*'/,
    `$1${registerUser.password}'`
  );

  // Update LoginInput schema examples
  content = content.replace(
    /(LoginInput[\s\S]*?email[\s\S]*?example: ')[^']*'/,
    `$1${loginUser.email}'`
  );
  content = content.replace(
    /(LoginInput[\s\S]*?password[\s\S]*?example: ')[^']*'/,
    `$1${loginUser.password}'`
  );

  // Update ForgotPasswordInput schema example
  content = content.replace(
    /(ForgotPasswordInput[\s\S]*?email[\s\S]*?example: ')[^']*'/,
    `$1${forgotPasswordUser.email}'`
  );

  fs.writeFileSync(swaggerPath, content);
  console.log('✅ Updated swagger.js examples');
};

/**
 * Main function
 */
const main = () => {
  console.log('🔄 Updating dynamic examples...');
  
  const users = generateDynamicUserExamples();
  
  updateAuthRoutesExamples(users);
  updateSwaggerExamples(users);
  
  console.log('✅ All examples updated successfully!');
  console.log('📊 Generated users:');
  users.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
  });
};

// Run the script
main();
