import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';

describe('Auth - Login Simple Tests', () => {
  let testUser;
  
  beforeEach(async () => {
    // Limpiar tabla de usuarios antes de cada test
    await User.destroy({ where: {}, force: true });
    
    // Crear usuario verificado para las pruebas
    testUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123!',
      emailVerified: true
    });
  });

  test('should login successfully with valid credentials', async () => {
    const loginData = {
      email: 'john.doe@example.com',
      password: 'SecurePassword123!'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.user.email).toBe(loginData.email);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  test('should fail with incorrect email', async () => {
    const loginData = {
      email: 'wrong@example.com',
      password: 'SecurePassword123!'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body.status).toBe('fail');
  });

  test('should fail with incorrect password', async () => {
    const loginData = {
      email: 'john.doe@example.com',
      password: 'WrongPassword123!'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body.status).toBe('fail');
  });

  test('should fail with unverified email', async () => {
    // Crear usuario no verificado
    await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'SecurePassword123!',
      emailVerified: false
    });

    const loginData = {
      email: 'jane.doe@example.com',
      password: 'SecurePassword123!'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body.status).toBe('fail');
  });

  test('should fail with missing credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});
