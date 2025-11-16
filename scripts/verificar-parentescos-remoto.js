/**
 * Script para verificar y corregir parentescos en servidor remoto
 * Asegura que "Jefe de Hogar" y "Jefa de Hogar" estén presentes
 */

import { Sequelize, QueryTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: false
});

async function verificarYCorregirParentescos() {
  try {
    console.log('👨‍👩‍👧‍👦 VERIFICACIÓN DE PARENTESCOS - SERVIDOR REMOTO');
    console.log('='.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ Conectado a 206.62.139.100:5433\n');

    // 1. Verificar parentescos actuales
    console.log('📋 Parentescos actuales en la base de datos:');
    console.log('─'.repeat(80));
    
    const parentescosActuales = await sequelize.query(
      'SELECT id_parentesco, nombre, descripcion, activo FROM parentescos ORDER BY id_parentesco',
      { type: QueryTypes.SELECT }
    );

    console.log(`Total de parentescos: ${parentescosActuales.length}\n`);
    
    parentescosActuales.forEach(p => {
      console.log(`${p.id_parentesco}. ${p.nombre} - ${p.descripcion || '(sin descripción)'} ${p.activo ? '✅' : '❌'}`);
    });

    // 2. Buscar "Jefe de Hogar"
    console.log('\n' + '='.repeat(80));
    console.log('🔍 Buscando "Jefe de Hogar" y "Jefa de Hogar"...\n');
    
    const jefeDeHogar = parentescosActuales.find(p => 
      p.nombre.toLowerCase().includes('jefe de hogar') || p.nombre.toLowerCase() === 'jefe'
    );
    
    const jefaDeHogar = parentescosActuales.find(p => 
      p.nombre.toLowerCase().includes('jefa de hogar') || p.nombre.toLowerCase() === 'jefa'
    );

    if (jefeDeHogar) {
      console.log(`✅ "Jefe de Hogar" encontrado: ID ${jefeDeHogar.id_parentesco} - "${jefeDeHogar.nombre}"`);
    } else {
      console.log('❌ "Jefe de Hogar" NO encontrado');
    }

    if (jefaDeHogar) {
      console.log(`✅ "Jefa de Hogar" encontrada: ID ${jefaDeHogar.id_parentesco} - "${jefaDeHogar.nombre}"`);
    } else {
      console.log('❌ "Jefa de Hogar" NO encontrada');
    }

    // 3. Si no existen, insertarlos
    if (!jefeDeHogar || !jefaDeHogar) {
      console.log('\n' + '='.repeat(80));
      console.log('🔧 Insertando parentescos faltantes...\n');

      if (!jefeDeHogar) {
        // Obtener el próximo ID disponible
        const [maxId] = await sequelize.query(
          'SELECT COALESCE(MAX(id_parentesco), 0) + 1 as next_id FROM parentescos',
          { type: QueryTypes.SELECT }
        );
        
        await sequelize.query(`
          INSERT INTO parentescos (id_parentesco, nombre, descripcion, activo, "createdAt", "updatedAt")
          VALUES (${maxId.next_id}, 'Jefe de Hogar', 'Persona que encabeza el hogar (masculino)', true, NOW(), NOW())
        `);
        console.log(`✅ "Jefe de Hogar" insertado con ID ${maxId.next_id}`);
      }

      if (!jefaDeHogar) {
        // Obtener el próximo ID disponible
        const [maxId] = await sequelize.query(
          'SELECT COALESCE(MAX(id_parentesco), 0) + 1 as next_id FROM parentescos',
          { type: QueryTypes.SELECT }
        );
        
        await sequelize.query(`
          INSERT INTO parentescos (id_parentesco, nombre, descripcion, activo, "createdAt", "updatedAt")
          VALUES (${maxId.next_id}, 'Jefa de Hogar', 'Persona que encabeza el hogar (femenino)', true, NOW(), NOW())
        `);
        console.log(`✅ "Jefa de Hogar" insertada con ID ${maxId.next_id}`);
      }

      // Verificar nuevamente
      console.log('\n📋 Verificación post-inserción:');
      console.log('─'.repeat(80));
      
      const parentescosActualizados = await sequelize.query(
        "SELECT id_parentesco, nombre, descripcion FROM parentescos WHERE nombre IN ('Jefe de Hogar', 'Jefa de Hogar') ORDER BY nombre",
        { type: QueryTypes.SELECT }
      );

      parentescosActualizados.forEach(p => {
        console.log(`✅ ID ${p.id_parentesco}: ${p.nombre} - ${p.descripcion}`);
      });
    }

    // 4. Resumen final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(80));
    
    const totalFinal = await sequelize.query(
      'SELECT COUNT(*) as total FROM parentescos WHERE activo = true',
      { type: QueryTypes.SELECT }
    );

    console.log(`✅ Total de parentescos activos: ${totalFinal[0].total}`);
    console.log(`✅ "Jefe de Hogar" y "Jefa de Hogar" ${jefeDeHogar && jefaDeHogar ? 'ya estaban' : 'han sido agregados'}`);
    console.log('='.repeat(80));

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

verificarYCorregirParentescos();
