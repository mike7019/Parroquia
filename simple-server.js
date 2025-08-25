import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/sequelize.js';

// Import only essential models for difuntos
import './src/models/index.js';

// Import difuntos routes
import difuntosRoutes from './src/routes/difuntosRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();
const PORT = 3000;

// Basic middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/difuntos', difuntosRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start simple server
async function startSimpleServer() {
  try {
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    console.log('📦 Models loaded from index.js');
    
    app.listen(PORT, () => {
      console.log(`🚀 Simple server running on port ${PORT}`);
      console.log(`📍 Test difuntos at: http://localhost:${PORT}/api/difuntos/consultas/madres`);
    });
    
  } catch (error) {
    console.error('❌ Server start failed:', error.message);
    process.exit(1);
  }
}

startSimpleServer();
