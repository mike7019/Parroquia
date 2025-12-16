import request from 'supertest';
import app from '../src/app.js';
import sequelize from '../config/sequelize.js';
import { Usuario } from '../src/models/index.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';

describe('User CRUD API Tests', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;
  let testUser;

  // Setup: Create test users and authenticate
  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Create admin user
    adminUser = await Usuario.create({
      correo_electronico: 'admin@test.com',
      contrasena: 'Admin123!',
      primer_nombre: 'Admin',
      primer_apellido: 'Test',
      activo: true,
      email_verificado: true
    });

    // Create regular user
    regularUser = await Usuario.create({
      correo_electronico: 'user@test.com',
      contrasena: 'User123!',
      primer_nombre: 'Regular',
      primer_apellido: 'User',
      activo: true,
      email_verificado: true
    });

    // Login as admin
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin123!'
      });
    adminToken = adminLoginRes.body.data.accessToken;

    // Login as regular user
    const userLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'User123!'
      });
    userToken = userLoginRes.body.data.accessToken;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/users - Get all users', () => {
    test('Should return all active users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(2);
      
      // Verify sensitive data is excluded
      const user = response.body.data.users[0];
      expect(user.contrasena).toBeUndefined();
      expect(user.token_recuperacion).toBeUndefined();
    });

    test('Should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    test('Should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/users/:id - Get user by ID', () => {
    test('Should return user by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.id).toBe(regularUser.id);
      expect(response.body.data.user.correo_electronico).toBe('user@test.com');
      expect(response.body.data.user.contrasena).toBeUndefined();
    });

    test('Should allow user to view their own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.id).toBe(regularUser.id);
    });

    test('Should return 403 when user tries to view another user', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    test('Should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    test('Should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/users/:id - Update user', () => {
    test('Should allow admin to update any user', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '3001234567'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.primer_nombre).toBe('Updated');
      expect(response.body.data.user.primer_apellido).toBe('Name');
      expect(response.body.data.user.telefono).toBe('3001234567');
    });

    test('Should allow user to update their own profile', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'SelfUpdated',
          phone: '3009876543'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.primer_nombre).toBe('SelfUpdated');
    });

    test('Should return 403 when user tries to update another user', async () => {
      const response = await request(app)
        .put(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Hacked'
        })
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    test('Should return 403 when non-admin tries to change role', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          role: 'admin'
        })
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    test('Should return 409 when updating to existing email', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'admin@test.com' // Already exists
        })
        .expect(409);

      expect(response.body.status).toBe('error');
    });

    test('Should return 400 for invalid update data', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email' // Invalid format
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('Should prevent setting status to deleted via update', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'deleted',
          activo: false
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/users/:id - Soft delete user', () => {
    beforeEach(async () => {
      // Create a test user to delete
      testUser = await Usuario.create({
        correo_electronico: `test${Date.now()}@test.com`,
        contrasena: 'Test123!',
        primer_nombre: 'Test',
        primer_apellido: 'Delete',
        activo: true
      });
    });

    test('Should allow admin to soft delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify user is soft deleted
      const deletedUser = await Usuario.scope('withDeleted').findByPk(testUser.id);
      expect(deletedUser.activo).toBe(false);
      expect(deletedUser.token_recuperacion).toBeNull();
    });

    test('Should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    test('Should prevent admin from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('Should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    test('Should return 400 when trying to delete already deleted user', async () => {
      // First delete
      await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Try to delete again
      const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/users/deleted - Get deleted users', () => {
    beforeAll(async () => {
      // Create and delete a user for this test
      const userToDelete = await Usuario.create({
        correo_electronico: 'deleted@test.com',
        contrasena: 'Test123!',
        primer_nombre: 'Deleted',
        primer_apellido: 'User',
        activo: false
      });
    });

    test('Should return deleted users for admin', async () => {
      const response = await request(app)
        .get('/api/users/deleted')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toBeInstanceOf(Array);
      
      // All users should have activo = false
      response.body.data.users.forEach(user => {
        expect(user.activo).toBe(false);
      });
    });

    test('Should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users/deleted')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    test('Should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/deleted')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('User Model Methods', () => {
    test('Should hash password on user creation', async () => {
      const newUser = await Usuario.create({
        correo_electronico: 'hash@test.com',
        contrasena: 'PlainPassword123',
        primer_nombre: 'Hash',
        primer_apellido: 'Test',
        activo: true
      });

      expect(newUser.contrasena).not.toBe('PlainPassword123');
      expect(newUser.contrasena).toMatch(/^\$2[aby]\$.{56}$/); // Bcrypt hash pattern
    });

    test('Should verify password correctly', async () => {
      const user = await Usuario.create({
        correo_electronico: 'verify@test.com',
        contrasena: 'TestPassword123',
        primer_nombre: 'Verify',
        primer_apellido: 'Test'
      });

      const isValid = await user.checkPassword('TestPassword123');
      const isInvalid = await user.checkPassword('WrongPassword');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    test('Should exclude sensitive fields in toJSON', async () => {
      const user = await Usuario.findOne({ 
        where: { correo_electronico: 'admin@test.com' } 
      });

      const userJSON = user.toJSON();

      expect(userJSON.contrasena).toBeUndefined();
      expect(userJSON.token_recuperacion).toBeUndefined();
      expect(userJSON.token_expiracion).toBeUndefined();
      expect(userJSON.correo_electronico).toBeDefined();
    });
  });

  describe('Edge Cases and Security', () => {
    test('Should handle SQL injection attempts safely', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ email: "'; DROP TABLE usuarios; --" })
        .expect(200);

      expect(response.body.status).toBe('success');
      
      // Verify table still exists
      const users = await Usuario.findAll();
      expect(users).toBeInstanceOf(Array);
    });

    test('Should handle concurrent updates with transactions', async () => {
      const updatePromises = [
        request(app)
          .put(`/api/users/${regularUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ firstName: 'Concurrent1' }),
        request(app)
          .put(`/api/users/${regularUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ firstName: 'Concurrent2' })
      ];

      const results = await Promise.all(updatePromises);
      
      // Both should succeed (one after the other due to transactions)
      expect(results[0].status).toBe(200);
      expect(results[1].status).toBe(200);
    });

    test('Should handle invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    test('Should handle expired tokens', async () => {
      // Create an expired token (this requires mocking JWT or using a real expired token)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    test('Should trim and lowercase email on update', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: '  UPPERCASE@TEST.COM  '
        })
        .expect(200);

      expect(response.body.data.user.correo_electronico).toBe('uppercase@test.com');
    });
  });
});
