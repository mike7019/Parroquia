import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  dialect: 'postgresql',
  logging: false
});

async function verifyCompleteDatabase() {
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA DE BASE DE DATOS');
    console.log('═'.repeat(70));
    console.log('');
    
    await sequelize.authenticate();

    // 1. CATÁLOGOS ESENCIALES
    console.log('📊 CATÁLOGOS ESENCIALES:');
    console.log('━'.repeat(70));
    
    const catalogTables = [
      { name: 'tipos_identificacion', label: 'Tipos de Identificación' },
      { name: 'estados_civiles', label: 'Estados Civiles' },
      { name: 'tipos_vivienda', label: 'Tipos de Vivienda' },
      { name: 'sistemas_acueducto', label: 'Sistemas de Acueducto' },
      { name: 'tipos_aguas_residuales', label: 'Tipos de Aguas Residuales' },
      { name: 'tipos_disposicion_basura', label: 'Tipos de Disposición de Basura' },
      { name: 'sexos', label: 'Sexos' },
      { name: 'roles', label: 'Roles' }
    ];

    for (const table of catalogTables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = parseInt(results[0].count);
        const icon = count > 0 ? '✅' : '❌';
        console.log(`   ${icon} ${table.label.padEnd(35)} ${count} registros`);
      } catch (error) {
        console.log(`   ❌ ${table.label.padEnd(35)} Tabla no existe`);
      }
    }

    // 2. CATÁLOGOS EXTENDIDOS
    console.log('\n📚 CATÁLOGOS EXTENDIDOS:');
    console.log('━'.repeat(70));
    
    const extendedCatalogs = [
      { name: 'enfermedades', label: 'Enfermedades' },
      { name: 'profesiones', label: 'Profesiones' },
      { name: 'destrezas', label: 'Destrezas/Habilidades' }
    ];

    for (const table of extendedCatalogs) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = parseInt(results[0].count);
        const icon = count > 0 ? '✅' : '⚠️ ';
        console.log(`   ${icon} ${table.label.padEnd(35)} ${count} registros`);
      } catch (error) {
        console.log(`   ❌ ${table.label.padEnd(35)} Tabla no existe`);
      }
    }

    // 3. GEOGRAFÍA
    console.log('\n🗺️  DATOS GEOGRÁFICOS:');
    console.log('━'.repeat(70));
    
    const geoTables = [
      { name: 'departamentos', label: 'Departamentos' },
      { name: 'municipios', label: 'Municipios' },
      { name: 'parroquias', label: 'Parroquias', alt: 'parroquia' },
      { name: 'sectores', label: 'Sectores' },
      { name: 'veredas', label: 'Veredas' },
      { name: 'corregimientos', label: 'Corregimientos' }
    ];

    for (const table of geoTables) {
      try {
        let count = 0;
        try {
          const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table.name}`);
          count = parseInt(results[0].count);
        } catch (e) {
          if (table.alt) {
            const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table.alt}`);
            count = parseInt(results[0].count);
          } else {
            throw e;
          }
        }
        
        const icon = count > 0 ? '✅' : '⚠️ ';
        console.log(`   ${icon} ${table.label.padEnd(35)} ${count} registros`);
      } catch (error) {
        console.log(`   ⚠️  ${table.label.padEnd(35)} 0 registros (tabla no existe o vacía)`);
      }
    }

    // 4. DATOS DE USUARIOS
    console.log('\n🗄️  DATOS DE FAMILIAS Y PERSONAS:');
    console.log('━'.repeat(70));
    
    const dataTables = [
      { name: 'familias', label: 'Familias' },
      { name: 'personas', label: 'Personas' }
    ];

    for (const table of dataTables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = parseInt(results[0].count);
        
        if (count === 0) {
          console.log(`   ✅ ${table.label.padEnd(35)} ${count} registros (limpio)`);
        } else {
          console.log(`   📊 ${table.label.padEnd(35)} ${count} registros`);
        }
      } catch (error) {
        console.log(`   ❌ ${table.label.padEnd(35)} Error: ${error.message}`);
      }
    }

    // 5. USUARIOS DEL SISTEMA
    console.log('\n👤 USUARIOS DEL SISTEMA:');
    console.log('━'.repeat(70));
    
    const [users] = await sequelize.query(`
      SELECT 
        u.id,
        u.correo_electronico,
        u.primer_nombre,
        u.primer_apellido,
        u.activo,
        r.nombre as rol
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuarios
      LEFT JOIN roles r ON ur.id_roles = r.id
    `);

    if (users.length === 0) {
      console.log('   ⚠️  No hay usuarios creados');
    } else {
      users.forEach(user => {
        console.log(`   ✅ ${user.primer_nombre} ${user.primer_apellido}`);
        console.log(`      Email: ${user.correo_electronico}`);
        console.log(`      Rol: ${user.rol || 'Sin rol'}`);
        console.log(`      Estado: ${user.activo ? 'Activo ✅' : 'Inactivo ❌'}`);
      });
    }

    // 6. VERIFICACIÓN DE COLUMNA CORREGIMIENTO
    console.log('\n🔧 VERIFICACIÓN TÉCNICA:');
    console.log('━'.repeat(70));
    
    const [colCheck] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name IN ('id_corregimiento', 'numero_contrato_epm')
      ORDER BY column_name
    `);

    if (colCheck.length > 0) {
      colCheck.forEach(col => {
        console.log(`   ✅ familias.${col.column_name.padEnd(25)} tipo: ${col.data_type}`);
      });
    } else {
      console.log('   ⚠️  Columnas no encontradas en tabla familias');
    }

    // Verificar tabla corregimientos
    const [tableCheck] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'corregimientos' 
      AND table_schema = 'public'
    `);

    if (tableCheck.length > 0) {
      console.log('   ✅ Tabla corregimientos existe');
      
      // Mostrar algunos corregimientos
      const [correg] = await sequelize.query(`
        SELECT c.nombre, m.nombre_municipio 
        FROM corregimientos c
        LEFT JOIN municipios m ON c.id_municipio_municipios = m.id_municipio
        LIMIT 3
      `);
      
      if (correg.length > 0) {
        console.log('   📍 Ejemplos de corregimientos:');
        correg.forEach(c => {
          console.log(`      • ${c.nombre} (${c.nombre_municipio || 'Sin municipio'})`);
        });
      }
    } else {
      console.log('   ❌ Tabla corregimientos NO existe');
    }

    // RESUMEN FINAL
    console.log('\n');
    console.log('═'.repeat(70));
    console.log('📋 RESUMEN:');
    console.log('═'.repeat(70));
    
    const [counts] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM familias) as familias,
        (SELECT COUNT(*) FROM personas) as personas,
        (SELECT COUNT(*) FROM usuarios) as usuarios,
        (SELECT COUNT(*) FROM municipios) as municipios,
        (SELECT COUNT(*) FROM corregimientos) as corregimientos
    `);

    const summary = counts[0];
    
    console.log(`   Familias: ${summary.familias}`);
    console.log(`   Personas: ${summary.personas}`);
    console.log(`   Usuarios: ${summary.usuarios}`);
    console.log(`   Municipios: ${summary.municipios}`);
    console.log(`   Corregimientos: ${summary.corregimientos}`);
    
    console.log('\n✅ Base de datos verificada correctamente');
    console.log('🔐 Login: admin@parroquia.com / Admin123!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

verifyCompleteDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Verificación fallida:', error);
    process.exit(1);
  });
