import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../config/sequelize.js';
import User from '../../src/models/User.js';
import jwt from 'jsonwebtoken';

describe('Epic 4, 5 & 6: User CRUD with Transactions and Soft Delete', () => {
  let adminUser, regularUser, adminToken, userToken;

  beforeAll(async () => {
    // Clean database
    await sequelize.sync({ force: true });
    
    // Create test users
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      isActive: true
    });

    regularUser = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@test.com',
      password: 'Password123!',
      role: 'user',
      status: 'active',
      emailVerified: true,
      isActive: true
    });

    // Generate tokens
    adminToken = jwt.sign({ userId: adminUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ userId: regularUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Epic 4: Enhanced Registration with Transactions', () => {
    test('Should register user with transaction rollback on duplicate email', async () => {
      // Try to register with existing email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'Duplicate',
          email: 'admin@test.com', // Duplicate email
          password: 'Password123!',
          role: 'user'
        });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        status: 'fail',
        message: expect.stringContaining('already exists')
      });

      // Verify no additional user was created
      const userCount = await User.count();
      expect(userCount).toBe(2); // Only original 2 users
    });

    test('Should register user successfully with transaction commit', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@test.com',
          password: 'Password123!',
          role: 'user'
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        status: 'success',
        message: expect.stringContaining('User registered successfully'),
        data: {
          user: {
            firstName: 'New',
            lastName: 'User',
            email: 'newuser@test.com',
            role: 'user',
            status: 'active'
          },
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });

      // Verify user was created in database
      const newUser = await User.findOne({ where: { email: 'newuser@test.com' } });
      expect(newUser).toBeTruthy();
      expect(newUser.status).toBe('active');
    });
  });

  describe('Epic 5: User Update with Authorization and Transactions', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'Update',
        email: `testupdate${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'user',
        status: 'active',
        emailVerified: true,
        isActive: true
      });
    });

    test('Should update user successfully (Admin)', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          email: 'updated@test.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: {
            firstName: 'Updated',
            lastName: 'Name',
            email: 'updated@test.com',
            emailVerified: false // Should be false when email changes
          }
        }
      });
    });

    test('Should reject email conflict with rollback', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'admin@test.com' // Existing email
        });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        status: 'fail',
        message: expect.stringContaining('Email already in use')
      });

      // Verify user wasn't changed
      const unchangedUser = await User.findByPk(testUser.id);
      expect(unchangedUser.email).toBe(testUser.email);
    });

    test('Should allow user to update own profile', async () => {
      const userOwnToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userOwnToken}`)
        .send({
          firstName: 'Self',
          lastName: 'Updated'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.firstName).toBe('Self');
    });

    test('Should reject user updating other user profile', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Unauthorized'
        });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        status: 'fail',
        message: expect.stringContaining('You can only access your own resources')
      });
    });
  });

  describe('Epic 6: Soft Delete with Status Management', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'Delete',
        email: `testdelete${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'user',
        status: 'active',
        emailVerified: true,
        isActive: true
      });
    });

    test('Should soft delete user (Admin only)', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      // Verify user status changed to 'deleted'
      const deletedUser = await User.scope('withDeleted').findByPk(testUser.id);
      expect(deletedUser.status).toBe('deleted');
      expect(deletedUser.isActive).toBe(false);

      // Verify user doesn't appear in active listings
      const activeUser = await User.findByPk(testUser.id);
      expect(activeUser).toBeNull();
    });

    test('Should reject regular user trying to delete', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        status: 'fail',
        message: expect.stringContaining('Administrator access required')
      });
    });

    test('Should prevent admin from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        status: 'fail',
        message: expect.stringContaining('You cannot delete your own account')
      });
    });

    test('Should get all active users (filtered by status)', async () => {
      // Create a deleted user
      await testUser.update({ status: 'deleted', isActive: false });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.users).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ id: testUser.id })
        ])
      );
    });

    test('Should get deleted users (Admin only)', async () => {
      // Soft delete the test user
      await testUser.update({ status: 'deleted', isActive: false });

      const response = await request(app)
        .get('/api/users/deleted')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            id: testUser.id,
            status: 'deleted'
          })
        ])
      );
    });
  });

  describe('Authorization and Security Tests', () => {
    test('Should require authentication for all user endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/users' },
        { method: 'get', path: '/api/users/1' },
        { method: 'put', path: '/api/users/1' },
        { method: 'delete', path: '/api/users/1' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
      }
    });

    test('Should validate input data', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: '', // Invalid: too short
          email: 'invalid-email', // Invalid: not an email
          role: 'invalid-role' // Invalid: not allowed role
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
