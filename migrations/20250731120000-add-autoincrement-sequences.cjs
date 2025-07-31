'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔧 Agregando secuencias auto-increment a tablas de catálogo...');

      // Crear secuencias y configurar auto-increment para todas las tablas de catálogo
      await queryInterface.sequelize.query(`
        -- Sexo table
        CREATE SEQUENCE IF NOT EXISTS sexo_id_sexo_seq;
        ALTER TABLE sexo ALTER COLUMN id_sexo SET DEFAULT nextval('sexo_id_sexo_seq');
        ALTER SEQUENCE sexo_id_sexo_seq OWNED BY sexo.id_sexo;
        
        -- Sector table
        CREATE SEQUENCE IF NOT EXISTS sector_id_sector_seq;
        ALTER TABLE sector ALTER COLUMN id_sector SET DEFAULT nextval('sector_id_sector_seq');
        ALTER SEQUENCE sector_id_sector_seq OWNED BY sector.id_sector;
        
        -- Parroquia table
        CREATE SEQUENCE IF NOT EXISTS parroquia_id_parroquia_seq;
        ALTER TABLE parroquia ALTER COLUMN id_parroquia SET DEFAULT nextval('parroquia_id_parroquia_seq');
        ALTER SEQUENCE parroquia_id_parroquia_seq OWNED BY parroquia.id_parroquia;
        
        -- Municipios table
        CREATE SEQUENCE IF NOT EXISTS municipios_id_municipio_seq;
        ALTER TABLE municipios ALTER COLUMN id_municipio SET DEFAULT nextval('municipios_id_municipio_seq');
        ALTER SEQUENCE municipios_id_municipio_seq OWNED BY municipios.id_municipio;
        
        -- Veredas table
        CREATE SEQUENCE IF NOT EXISTS veredas_id_vereda_seq;
        ALTER TABLE veredas ALTER COLUMN id_vereda SET DEFAULT nextval('veredas_id_vereda_seq');
        ALTER SEQUENCE veredas_id_vereda_seq OWNED BY veredas.id_vereda;
        
        -- Sync sequences with current max values
        SELECT setval('sexo_id_sexo_seq', COALESCE((SELECT MAX(id_sexo) FROM sexo), 1), true);
        SELECT setval('sector_id_sector_seq', COALESCE((SELECT MAX(id_sector) FROM sector), 1), true);
        SELECT setval('parroquia_id_parroquia_seq', COALESCE((SELECT MAX(id_parroquia) FROM parroquia), 1), true);
        SELECT setval('municipios_id_municipio_seq', COALESCE((SELECT MAX(id_municipio) FROM municipios), 1), true);
        SELECT setval('veredas_id_vereda_seq', COALESCE((SELECT MAX(id_vereda) FROM veredas), 1), true);
      `, { transaction });

      console.log('✅ Secuencias auto-increment agregadas exitosamente');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al agregar secuencias auto-increment:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔧 Removiendo secuencias auto-increment...');

      await queryInterface.sequelize.query(`
        -- Remove auto-increment defaults
        ALTER TABLE sexo ALTER COLUMN id_sexo DROP DEFAULT;
        ALTER TABLE sector ALTER COLUMN id_sector DROP DEFAULT;
        ALTER TABLE parroquia ALTER COLUMN id_parroquia DROP DEFAULT;
        ALTER TABLE municipios ALTER COLUMN id_municipio DROP DEFAULT;
        ALTER TABLE veredas ALTER COLUMN id_vereda DROP DEFAULT;
        
        -- Drop sequences
        DROP SEQUENCE IF EXISTS sexo_id_sexo_seq;
        DROP SEQUENCE IF EXISTS sector_id_sector_seq;
        DROP SEQUENCE IF EXISTS parroquia_id_parroquia_seq;
        DROP SEQUENCE IF EXISTS municipios_id_municipio_seq;
        DROP SEQUENCE IF EXISTS veredas_id_vereda_seq;
      `, { transaction });

      console.log('✅ Secuencias auto-increment removidas exitosamente');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al remover secuencias auto-increment:', error);
      throw error;
    }
  }
};
