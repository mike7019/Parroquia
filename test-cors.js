#!/usr/bin/env node

/**
 * CORS Testing Script
 * Tests CORS configuration for the Parroquia API
 */

import fetch from 'node-fetch';

const API_BASE = process.argv[2] || 'http://206.62.139.100:3000';
const endpoints = [
  '/api/health',
  '/api/auth/register',
  '/api/auth/login'
];

console.log('🧪 Testing CORS Configuration');
console.log(`📡 API Base URL: ${API_BASE}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testCORS() {
  for (const endpoint of endpoints) {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      
      // Test preflight (OPTIONS)
      const preflightResponse = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://external-client.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      console.log(`   OPTIONS: ${preflightResponse.status} ${preflightResponse.statusText}`);
      console.log(`   CORS Headers:`, {
        'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': preflightResponse.headers.get('Access-Control-Allow-Credentials')
      });
      
      // Test actual request
      if (endpoint === '/api/health') {
        const actualResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Origin': 'http://external-client.com',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   GET: ${actualResponse.status} ${actualResponse.statusText}`);
        
        if (actualResponse.ok) {
          const data = await actualResponse.text();
          console.log(`   Response: ${data.substring(0, 100)}...`);
        }
      }
      
      console.log('   ✅ CORS test completed\n');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
}

testCORS().catch(console.error);
