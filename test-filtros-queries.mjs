import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function probarConsultas() {
  try {
    console.log('Probando consultas de filtros...\n');
    
    // 1. Tipos de vivienda
    console.log('1. Tipos de vivienda:');
    const tiposVivienda = await sequelize.query(`
      SELECT id_tipos_vivienda, nombre_tipo_vivienda
      FROM tipos_vivienda
      ORDER BY nombre_tipo_vivienda
    `, { type: QueryTypes.SELECT });
    console.log(`   ✅ ${tiposVivienda.length} registros`);

    // 2. Sistemas de acueducto
    console.log('2. Sistemas de acueducto:');
    const sistemasAcueducto = await sequelize.query(`
      SELECT id_sistema_acueducto, nombre_sistema_acueducto
      FROM sistemas_acueducto
      ORDER BY nombre_sistema_acueducto
    `, { type: QueryTypes.SELECT });
    console.log(`   ✅ ${sistemasAcueducto.length} registros`);

    // 3. Tipos de aguas residuales
    console.log('3. Tipos de aguas residuales:');
    const tiposAguasResiduales = await sequelize.query(`
      SELECT id_tipo_aguas_residuales, nombre_tipo_aguas_residuales
      FROM tipos_aguas_residuales
      ORDER BY nombre_tipo_aguas_residuales
    `, { type: QueryTypes.SELECT });
    console.log(`   ✅ ${tiposAguasResiduales.length} registros`);

    // 4. Tipos de disposición de basura
    console.log('4. Tipos de disposición de basura:');
    const tiposDisposicionBasura = await sequelize.query(`
      SELECT id_tipo_disposicion_basura, nombre_tipo_disposicion_basura
      FROM tipos_disposicion_basura
      ORDER BY nombre_tipo_disposicion_basura
    `, { type: QueryTypes.SELECT });
    console.log(`   ✅ ${tiposDisposicionBasura.length} registros`);

    // 5. Parroquias con joins
    console.log('5. Parroquias con joins:');
    const parroquias = await sequelize.query(`
      SELECT p.id_parroquia, p.nombre as nombre_parroquia,
             m.nombre_municipio, d.nombre as nombre_departamento
      FROM parroquia p
      INNER JOIN municipios m ON p.id_municipio = m.id_municipio
      INNER JOIN departamentos d ON m.id_departamento = d.id_departamento
      ORDER BY p.nombre
    `, { type: QueryTypes.SELECT });
    console.log(`   ✅ ${parroquias.length} registros`);

    // 6. Municipios con joins
    console.log('6. Municipios con joins:');
    const municipios = await sequelize.query(`
      SELECT m.id_municipio, m.nombre_municipio,
             d.nombre as nombre_departamento
      FROM municipios m
      INNER JOIN departamentos d ON m.id_departamento = d.id_departamento
      ORDER BY m.nombre_municipio
    `, { type: QueryTypes.SELECT });
    console.log(`   ✅ ${municipios.length} registros`);

    console.log('\n🎉 Todas las consultas funcionan correctamente');
    
  } catch (error) {
    console.error('❌ Error en consulta:', error.message);
    console.error('SQL:', error.sql);
  } finally {
    process.exit(0);
  }
}

probarConsultas();
