import 'dotenv/config';
import express from 'express';
import cors from 'cors';

console.log('🚀 Starting minimal server test...');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Minimal server is running' });
});

// Start server
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Minimal server running on port ${PORT}`);
    console.log(`📍 Test at: http://localhost:${PORT}/api/health`);
  });
} catch (error) {
  console.error('❌ Server start failed:', error.message);
  process.exit(1);
}
