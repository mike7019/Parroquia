// Script para agregar campo numero_contrato_epm a tabla familias
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar conexión a la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'parroquia123',
  database: process.env.DB_NAME || 'parroquia_db',
  dialect: 'postgres',
  logging: console.log
});

async function agregarCampoEPM() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    console.log('🔧 Agregando campo numero_contrato_epm...');
    await sequelize.query(`
      ALTER TABLE familias 
      ADD COLUMN IF NOT EXISTS numero_contrato_epm VARCHAR(50);
    `);
    console.log('✅ Campo numero_contrato_epm agregado exitosamente');

    console.log('📝 Agregando datos de ejemplo...');
    await sequelize.query(`
      UPDATE familias 
      SET numero_contrato_epm = 'EPM-' || LPAD(id_familia::text, 6, '0') 
      WHERE numero_contrato_epm IS NULL;
    `);
    console.log('✅ Datos de ejemplo agregados');

    console.log('📊 Verificando datos...');
    const [results] = await sequelize.query(
      'SELECT id_familia, apellido_familiar, numero_contrato_epm FROM familias LIMIT 5'
    );
    console.log('📋 Resultados:', results);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔐 Conexión cerrada');
  }
}

agregarCampoEPM();
