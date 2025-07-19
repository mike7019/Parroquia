import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';

describe('Auth - Register Simple Test', () => {
  beforeEach(async () => {
    // Limpiar tabla de usuarios antes de cada test
    await User.destroy({ where: {}, force: true });
  });

  test('should register a new user successfully', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.user.email).toBe(userData.email.toLowerCase());
    expect(response.body.data.user.firstName).toBe(userData.firstName);
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(response.body.data.user.emailVerified).toBe(false);
  });

  test('should fail with duplicate email', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123!'
    };

    // Crear usuario primero
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Intentar crear otro usuario con mismo email
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(409);

    expect(response.body.status).toBe('fail');
    expect(response.body.code).toBe('CONFLICT');
  });

  test('should fail with invalid email format', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      password: 'SecurePassword123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.status).toBe('error');
  });

  test('should fail with weak password', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe', 
      email: 'john.doe@example.com',
      password: '123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.status).toBe('error');
  });

  test('should fail with missing required fields', async () => {
    const userData = {
      firstName: 'John'
      // lastName, email, password missing
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});
