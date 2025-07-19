import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcrypt';

/**
 * Helper para crear un usuario de prueba
 */
export const createTestUser = async (userData = {}) => {
  const defaultUserData = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isActive: true,
    emailVerified: false
  };

  const user = await User.create({ ...defaultUserData, ...userData });
  return user;
};

/**
 * Helper para crear un usuario verificado
 */
export const createVerifiedUser = async (userData = {}) => {
  return await createTestUser({ 
    ...userData, 
    emailVerified: true 
  });
};

/**
 * Helper para crear un usuario admin
 */
export const createAdminUser = async (userData = {}) => {
  return await createVerifiedUser({ 
    ...userData, 
    role: 'admin',
    email: 'admin@example.com'
  });
};

/**
 * Helper para hacer login y obtener token
 */
export const loginUser = async (email = 'test@example.com', password = 'TestPassword123!') => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    user: response.body.data.user,
    accessToken: response.body.data.accessToken,
    refreshToken: response.body.data.refreshToken
  };
};

/**
 * Helper para obtener headers de autorización
 */
export const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});

/**
 * Helper para limpiar la base de datos
 */
export const cleanDatabase = async () => {
  await User.destroy({ truncate: true, cascade: true });
};

/**
 * Helper para generar datos de usuario aleatorios
 */
export const generateRandomUser = (overrides = {}) => {
  const randomId = Math.floor(Math.random() * 10000);
  return {
    email: `user${randomId}@test.com`,
    password: 'TestPassword123!',
    firstName: `User${randomId}`,
    lastName: 'Test',
    role: 'user',
    ...overrides
  };
};

/**
 * Helper para extraer token de verificación (simula obtenerlo del email)
 */
export const getVerificationToken = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user?.emailVerificationToken;
};

/**
 * Helper para generar token de reset de contraseña
 */
export const generatePasswordResetToken = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found');
  
  const token = 'test_reset_token_' + Date.now();
  const expires = new Date(Date.now() + 3600000); // 1 hora
  
  await user.update({
    passwordResetToken: token,
    passwordResetExpires: expires
  });
  
  return token;
};

/**
 * Helper para validar estructura de respuesta exitosa
 */
export const validateSuccessResponse = (body, expectedData = null) => {
  expect(body).toHaveProperty('status', 'success');
  expect(body).toHaveProperty('message');
  if (expectedData) {
    expect(body).toHaveProperty('data');
  }
};

/**
 * Helper para validar estructura de respuesta de error
 */
export const validateErrorResponse = (body, expectedCode = null) => {
  expect(body).toHaveProperty('status', 'fail');
  expect(body).toHaveProperty('message');
  if (expectedCode) {
    expect(body).toHaveProperty('code', expectedCode);
  }
};

/**
 * Helper para validar estructura de token response
 */
export const validateTokenResponse = (body) => {
  validateSuccessResponse(body, true);
  expect(body.data).toHaveProperty('accessToken');
  expect(body.data).toHaveProperty('refreshToken');
  expect(body.data).toHaveProperty('user');
  expect(body.data.user).not.toHaveProperty('password');
};

/**
 * Helper para validar estructura de usuario
 */
export const validateUserStructure = (user) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('firstName');
  expect(user).toHaveProperty('lastName');
  expect(user).toHaveProperty('role');
  expect(user).toHaveProperty('isActive');
  expect(user).toHaveProperty('emailVerified');
  expect(user).not.toHaveProperty('password');
  expect(user).not.toHaveProperty('emailVerificationToken');
  expect(user).not.toHaveProperty('passwordResetToken');
};
