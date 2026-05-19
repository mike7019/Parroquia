import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: false
});

try {
  await seq.authenticate();
  console.log('✅ Conexión OK\n');

  // Conteos antes
  const tablas = [
    'persona_destreza', 'persona_enfermedad', 'persona_habilidad',
    'persona_celebracion', 'difuntos_familia', 'persona_liderazgo',
    'personas',
    'familia_disposicion_basura', 'familia_sistema_acueducto',
    'familia_sistema_aguas_residuales', 'familia_tipo_vivienda',
    'familias', 'encuestas'
  ];

  console.log('--- Conteos ANTES ---');
  for (const t of tablas) {
    try {
      const [r] = await seq.query(`SELECT COUNT(*) as n FROM ${t}`, { type: QueryTypes.SELECT });
      console.log(`  ${t}: ${r.n}`);
    } catch (e) {
      console.log(`  ${t}: (tabla no existe)`);
    }
  }

  console.log('\n⚠️  Borrando datos...');

  // Borrar en orden: primero tablas que referencian personas, luego personas, luego familias
  const deletions = [
    // Tablas que referencian personas
    'DELETE FROM persona_destreza',
    'DELETE FROM persona_enfermedad',
    'DELETE FROM persona_habilidad',
    'DELETE FROM persona_celebracion',
    'DELETE FROM difuntos_familia',
    'DELETE FROM persona_liderazgo',
    'DELETE FROM personas',
    // Tablas que referencian familias
    'DELETE FROM familia_disposicion_basura',
    'DELETE FROM familia_sistema_acueducto',
    'DELETE FROM familia_sistema_aguas_residuales',
    'DELETE FROM familia_tipo_vivienda',
    'DELETE FROM encuestas',
    'DELETE FROM familias',
  ];

  for (const sql of deletions) {
    try {
      const [, meta] = await seq.query(sql);
      const rows = meta?.rowCount ?? '?';
      console.log(`  ✔ ${sql} → ${rows} filas eliminadas`);
    } catch (e) {
      console.log(`  ⚠ ${sql} → ${e.message}`);
    }
  }

  // Conteos después
  console.log('\n--- Conteos DESPUÉS ---');
  for (const t of tablas) {
    try {
      const [r] = await seq.query(`SELECT COUNT(*) as n FROM ${t}`, { type: QueryTypes.SELECT });
      console.log(`  ${t}: ${r.n}`);
    } catch (e) {
      console.log(`  ${t}: (tabla no existe)`);
    }
  }

  console.log('\n✅ Operación completada.');
} catch (e) {
  console.error('ERROR:', e.message);
} finally {
  await seq.close();
}
