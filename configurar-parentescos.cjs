#!/usr/bin/env node

const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

// Configuración de base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    timezone: '-05:00'
  }
);

async function agregarParentescosFaltantes() {
  try {
    console.log('👨‍👩‍👧‍👦 Agregando parentescos faltantes...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida\n');

    // Verificar parentescos existentes
    const existentes = await sequelize.query(`
      SELECT id_parentesco, nombre FROM parentescos ORDER BY id_parentesco
    `, { type: QueryTypes.SELECT });

    console.log('📋 Parentescos existentes:');
    existentes.forEach(p => {
      console.log(`   ${p.id_parentesco}: ${p.nombre}`);
    });
    console.log('');

    // Parentescos que deben existir
    const parentescosRequeridos = [
      { nombre: 'Padre', descripcion: 'Padre biológico o adoptivo' },
      { nombre: 'Madre', descripcion: 'Madre biológica o adoptiva' },
      { nombre: 'Hijo', descripcion: 'Hijo biológico o adoptivo' },
      { nombre: 'Hija', descripcion: 'Hija biológica o adoptiva' },
      { nombre: 'Hermano', descripcion: 'Hermano' },
      { nombre: 'Hermana', descripcion: 'Hermana' },
      { nombre: 'Abuelo', descripcion: 'Abuelo paterno o materno' },
      { nombre: 'Abuela', descripcion: 'Abuela paterna o materna' },
      { nombre: 'Esposo', descripcion: 'Esposo' },
      { nombre: 'Esposa', descripcion: 'Esposa' },
      { nombre: 'Nieto', descripcion: 'Nieto' },
      { nombre: 'Nieta', descripcion: 'Nieta' },
      { nombre: 'Tío', descripcion: 'Tío' },
      { nombre: 'Tía', descripcion: 'Tía' },
      { nombre: 'Primo', descripcion: 'Primo' },
      { nombre: 'Prima', descripcion: 'Prima' },
      { nombre: 'Suegro', descripcion: 'Suegro' },
      { nombre: 'Suegra', descripcion: 'Suegra' },
      { nombre: 'Yerno', descripcion: 'Yerno' },
      { nombre: 'Nuera', descripcion: 'Nuera' },
      { nombre: 'Cuñado', descripcion: 'Cuñado' },
      { nombre: 'Cuñada', descripcion: 'Cuñada' },
      { nombre: 'Otro', descripcion: 'Otro parentesco no especificado' }
    ];

    console.log('🔍 Verificando qué parentescos faltan...');
    const nombresExistentes = existentes.map(p => p.nombre);
    const parentescosFaltantes = parentescosRequeridos.filter(p => !nombresExistentes.includes(p.nombre));

    if (parentescosFaltantes.length === 0) {
      console.log('✅ Todos los parentescos necesarios ya existen');
    } else {
      console.log(`📝 Agregando ${parentescosFaltantes.length} parentescos faltantes:`);
      
      for (const parentesco of parentescosFaltantes) {
        await sequelize.query(`
          INSERT INTO parentescos (nombre, descripcion, activo, "createdAt", "updatedAt")
          VALUES (:nombre, :descripcion, true, NOW(), NOW())
        `, {
          replacements: parentesco,
          type: QueryTypes.INSERT
        });
        
        console.log(`   ✅ Agregado: ${parentesco.nombre}`);
      }
    }

    // Mostrar parentescos finales
    console.log('\n📋 Parentescos finales disponibles:');
    const finales = await sequelize.query(`
      SELECT id_parentesco, nombre, descripcion FROM parentescos ORDER BY id_parentesco
    `, { type: QueryTypes.SELECT });

    finales.forEach(p => {
      console.log(`   ${p.id_parentesco}: ${p.nombre} - ${p.descripcion}`);
    });

    // Buscar específicamente Padre y Madre
    console.log('\n🎯 IDs específicos para difuntos:');
    const padre = finales.find(p => p.nombre === 'Padre');
    const madre = finales.find(p => p.nombre === 'Madre');
    
    if (padre) {
      console.log(`   🧔 Padre: ID = ${padre.id_parentesco}`);
    }
    
    if (madre) {
      console.log(`   👩 Madre: ID = ${madre.id_parentesco}`);
    }

    console.log('\n✅ Configuración de parentescos completada');

  } catch (error) {
    console.error('❌ Error configurando parentescos:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔚 Conexión cerrada');
  }
}

// Ejecutar la configuración
agregarParentescosFaltantes().catch(console.error);
