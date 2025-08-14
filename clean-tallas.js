import sequelize from './config/sequelize.js';

async function cleanTallas() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS "tallas" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_tallas_tipo_prenda" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_tallas_genero" CASCADE;');
    console.log('✅ Tabla y enums eliminados');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

cleanTallas();
