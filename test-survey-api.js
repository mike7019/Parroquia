#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { Survey, User } from './src/models/index.js';

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.post('/api/surveys', async (req, res) => {
  try {
    console.log('📝 Creating survey with data:', req.body);
    
    const survey = await Survey.create({
      userId: 1, // Assuming user ID 1 exists
      sector: req.body.sector || 'Test Sector',
      familyHead: req.body.familyHead || 'Test Family Head',
      address: req.body.address || 'Test Address',
      familySize: req.body.familySize || 4,
      housingType: req.body.housingType || 'Casa',
      status: 'draft'
    });
    
    console.log('✅ Survey created:', survey.toJSON());
    
    res.status(201).json({
      status: 'success',
      message: 'Survey created successfully',
      data: { survey }
    });
  } catch (error) {
    console.error('❌ Error creating survey:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Survey API is working!',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📝 Test survey endpoint: POST http://localhost:${PORT}/api/surveys`);
  console.log(`🔍 Test endpoint: GET http://localhost:${PORT}/api/test`);
});
