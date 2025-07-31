'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add auto increment to parroquia table
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS parroquia_id_parroquia_seq;
      ALTER TABLE parroquia ALTER COLUMN id_parroquia SET DEFAULT nextval('parroquia_id_parroquia_seq');
      ALTER SEQUENCE parroquia_id_parroquia_seq OWNED BY parroquia.id_parroquia;
      SELECT setval('parroquia_id_parroquia_seq', COALESCE(MAX(id_parroquia), 1)) FROM parroquia;
    `);

    // Add auto increment to sexo table
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS sexo_id_sexo_seq;
      ALTER TABLE sexo ALTER COLUMN id_sexo SET DEFAULT nextval('sexo_id_sexo_seq');
      ALTER SEQUENCE sexo_id_sexo_seq OWNED BY sexo.id_sexo;
      SELECT setval('sexo_id_sexo_seq', COALESCE(MAX(id_sexo), 1)) FROM sexo;
    `);

    // Add auto increment to veredas table
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS veredas_id_vereda_seq;
      ALTER TABLE veredas ALTER COLUMN id_vereda SET DEFAULT nextval('veredas_id_vereda_seq');
      ALTER SEQUENCE veredas_id_vereda_seq OWNED BY veredas.id_vereda;
      SELECT setval('veredas_id_vereda_seq', COALESCE(MAX(id_vereda), 1)) FROM veredas;
    `);

    // Add auto increment to municipios table
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS municipios_id_municipio_seq;
      ALTER TABLE municipios ALTER COLUMN id_municipio SET DEFAULT nextval('municipios_id_municipio_seq');
      ALTER SEQUENCE municipios_id_municipio_seq OWNED BY municipios.id_municipio;
      SELECT setval('municipios_id_municipio_seq', COALESCE(MAX(id_municipio), 1)) FROM municipios;
    `);

    // Add auto increment to personas table
    // Note: personas table uses UUID primary key (id), no autoincrement needed

    console.log('✅ Auto increment sequences added to catalog tables');
  },

  async down(queryInterface, Sequelize) {
    // Remove auto increment sequences
    await queryInterface.sequelize.query(`
      ALTER TABLE parroquia ALTER COLUMN id_parroquia DROP DEFAULT;
      DROP SEQUENCE IF EXISTS parroquia_id_parroquia_seq;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE sexo ALTER COLUMN id_sexo DROP DEFAULT;
      DROP SEQUENCE IF EXISTS sexo_id_sexo_seq;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE veredas ALTER COLUMN id_vereda DROP DEFAULT;
      DROP SEQUENCE IF EXISTS veredas_id_vereda_seq;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE municipios ALTER COLUMN id_municipio DROP DEFAULT;
      DROP SEQUENCE IF EXISTS municipios_id_municipio_seq;
    `);

    // Note: personas table uses UUID primary key (id), no autoincrement sequence to remove

    console.log('✅ Auto increment sequences removed from catalog tables');
  }
};
