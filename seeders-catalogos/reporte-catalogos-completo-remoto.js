/**
 * Reporte completo de TODAS las tablas de catálogo en servidor remoto
 * Identifica tablas vacías que pueden causar errores de FK
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: false
});

async function reporteCompletoCatalogos() {
  try {
    console.log('📊 REPORTE COMPLETO DE CATÁLOGOS - SERVIDOR REMOTO');
    console.log('='.repeat(80));
    console.log('📍 Host: 206.62.139.100:5433\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Lista de todas las tablas de catálogo
    const tablasCatalogo = [
      'tipos_identificacion',
      'tipos_viviendas',
      'sistemas_acueducto',
      'tipos_aguas_residuales',
      'tipos_disposicion_basura',
      'sexos',
      'profesiones',
      'destrezas',
      'parentescos',
      'enfermedades',
      'situaciones_civiles',
      'estados_civiles',
      'comunidades_culturales',
      'niveles_educativos',
      'roles',
      'departamentos',
      'municipios',
      'parroquias',
      'sectores',
      'veredas'
    ];

    console.log('🔍 VERIFICANDO CATÁLOGOS:\n');
    console.log('┌─────────────────────────────┬──────────┬──────────┐');
    console.log('│ Tabla                       │ Registros│ Estado   │');
    console.log('├─────────────────────────────┼──────────┼──────────┤');

    let totalRegistros = 0;
    let tablasVacias = [];
    let tablasConDatos = [];

    for (const tabla of tablasCatalogo) {
      try {
        const [resultado] = await sequelize.query(`
          SELECT COUNT(*) as total FROM ${tabla};
        `);
        
        const count = parseInt(resultado[0].total);
        totalRegistros += count;
        
        const nombreTabla = tabla.padEnd(27, ' ');
        const registros = String(count).padStart(8, ' ');
        const estado = count === 0 ? '⚠️ VACÍA ' : '✅ OK    ';
        
        console.log(`│ ${nombreTabla} │ ${registros} │ ${estado} │`);
        
        if (count === 0) {
          tablasVacias.push(tabla);
        } else {
          tablasConDatos.push({ tabla, registros: count });
        }
        
      } catch (error) {
        const nombreTabla = tabla.padEnd(27, ' ');
        console.log(`│ ${nombreTabla} │        ? │ ❌ ERROR │`);
      }
    }

    console.log('└─────────────────────────────┴──────────┴──────────┘');
    console.log(`\n📊 Total de registros: ${totalRegistros.toLocaleString()}`);

    // Resumen de tablas vacías
    if (tablasVacias.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('⚠️  TABLAS VACÍAS QUE PUEDEN CAUSAR ERRORES:\n');
      tablasVacias.forEach((tabla, index) => {
        console.log(`   ${index + 1}. ${tabla}`);
      });
      console.log('\n💡 Estas tablas necesitan seeders o datos de inicialización');
    }

    // Top 10 tablas con más datos
    console.log('\n' + '='.repeat(80));
    console.log('📈 TOP 10 TABLAS CON MÁS DATOS:\n');
    
    tablasConDatos
      .sort((a, b) => b.registros - a.registros)
      .slice(0, 10)
      .forEach((item, index) => {
        const pos = `${index + 1}.`.padStart(3, ' ');
        const nombre = item.tabla.padEnd(30, ' ');
        const regs = item.registros.toLocaleString().padStart(10, ' ');
        console.log(`   ${pos} ${nombre} ${regs} registros`);
      });

    console.log('\n' + '='.repeat(80));

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

reporteCompletoCatalogos();
