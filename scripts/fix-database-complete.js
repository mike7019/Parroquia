import { Sequelize } from 'sequelize';
import 'dotenv/config';

/**
 * Script para reparar problemas de base de datos
 * Específicamente diseñado para solucionar problemas de foreign keys
 * en la tabla sectors y otras inconsistencias de esquema
 */

// Database connection using the same config as the app
const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

/**
 * Repara problemas comunes de la base de datos
 * - Elimina tablas con foreign keys incorrectas
 * - Limpia tipos ENUM huérfanos
 * - Verifica y corrige violaciones de foreign keys
 * - Carga datos básicos si no existen
 * - Permite que Sequelize recree las tablas con la estructura correcta
 */
async function fixDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Verificar datos en tablas principales
    console.log('\n📊 Verificando datos en tablas principales...');
    
    const [municipios] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
    console.log(`📍 Municipios encontrados: ${municipios[0].count}`);
    
    const [veredas] = await sequelize.query('SELECT COUNT(*) as count FROM veredas');
    console.log(`🏘️ Veredas encontradas: ${veredas[0].count}`);
    
    // Verificar si la tabla sectors existe
    let sectorsCount = 0;
    try {
      const [sectors] = await sequelize.query('SELECT COUNT(*) as count FROM sectors');
      sectorsCount = sectors[0].count;
      console.log(`🏢 Sectores encontrados: ${sectorsCount}`);
    } catch (error) {
      console.log('🏢 La tabla sectors aún no existe (normal después de una configuración nueva)');
    }

    // Verificar foreign keys problemáticas en veredas
    console.log('\n🔍 Verificando violaciones de foreign keys en veredas...');
    const [invalidVeredas] = await sequelize.query(`
      SELECT v.id_vereda, v.nombre, v.id_municipio 
      FROM veredas v 
      LEFT JOIN municipios m ON v.id_municipio = m.id_municipio 
      WHERE v.id_municipio IS NOT NULL AND m.id_municipio IS NULL
    `);
    
    if (invalidVeredas.length > 0) {
      console.log(`⚠️ Encontradas ${invalidVeredas.length} veredas con referencias de municipio inválidas:`);
      invalidVeredas.forEach(v => {
        console.log(`   - Vereda "${v.nombre}" (ID: ${v.id_vereda}) referencia municipio inexistente ${v.id_municipio}`);
      });
      
      console.log('🧹 Limpiando referencias de foreign keys inválidas en veredas...');
      await sequelize.query(`
        UPDATE veredas 
        SET id_municipio = NULL 
        WHERE id_municipio NOT IN (SELECT id_municipio FROM municipios)
      `);
      console.log('✅ Referencias de foreign keys inválidas limpiadas');
    } else {
      console.log('✅ No se encontraron violaciones de foreign keys en veredas');
    }

    console.log('\n🗑️ Eliminando tabla sectors si existe (para corregir foreign keys)...');
    await sequelize.query('DROP TABLE IF EXISTS "sectors" CASCADE');
    console.log('✅ Tabla sectors eliminada correctamente');

    console.log('🗑️ Eliminando tipos ENUM relacionados si existen...');
    await sequelize.query('DROP TYPE IF EXISTS "public"."enum_sectors_status" CASCADE');
    console.log('✅ Tipos ENUM eliminados correctamente');

    // Verificar que tenemos datos básicos para que la app funcione
    if (municipios[0].count == 0) {
      console.log('\n⚠️ ADVERTENCIA: No se encontraron municipios en la base de datos');
      console.log('🔧 Insertando datos básicos de municipios...');
      
      try {
        await sequelize.query(`
          INSERT INTO municipios (nombre, codigo_dane, departamento) VALUES 
          ('Bogotá', '11001', 'Bogotá D.C.'),
          ('Medellín', '05001', 'Antioquia'),
          ('Cali', '76001', 'Valle del Cauca'),
          ('Barranquilla', '08001', 'Atlántico'),
          ('Cartagena', '13001', 'Bolívar')
        `);
        console.log('✅ Datos básicos de municipios insertados exitosamente');
        
        // Actualizar el conteo
        const [newMunicipios] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
        console.log(`📍 Municipios ahora disponibles: ${newMunicipios[0].count}`);
        
      } catch (insertError) {
        console.error('⚠️ Error insertando municipios:', insertError.message);
        console.log('💡 Puede que necesites ejecutar: npm run db:seed o insertar municipios manualmente');
      }
    }

    // Verificar y cargar datos de sexo
    const [sexos] = await sequelize.query('SELECT COUNT(*) as count FROM sexo');
    console.log(`🚻 Registros de sexo encontrados: ${sexos[0].count}`);
    
    if (sexos[0].count == 0) {
      console.log('🔧 Insertando datos básicos de sexo...');
      try {
        await sequelize.query(`
          INSERT INTO sexo (sexo) VALUES 
          ('Masculino'),
          ('Femenino'),
          ('Otro')
        `);
        console.log('✅ Datos básicos de sexo insertados exitosamente');
      } catch (insertError) {
        console.error('⚠️ Error insertando datos de sexo:', insertError.message);
      }
    }

    // Verificar y cargar veredas básicas si hay municipios
    const [finalMunicipios] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
    if (finalMunicipios[0].count > 0) {
      const [currentVeredas] = await sequelize.query('SELECT COUNT(*) as count FROM veredas');
      if (currentVeredas[0].count == 0) {
        console.log('🔧 Insertando datos básicos de veredas...');
        try {
          const [firstMunicipio] = await sequelize.query('SELECT id_municipio FROM municipios LIMIT 1');
          const municipioId = firstMunicipio[0].id_municipio;
          
          await sequelize.query(`
            INSERT INTO veredas (nombre, codigo_vereda, id_municipio) VALUES 
            ('Centro', 'V001', ${municipioId}),
            ('Norte', 'V002', ${municipioId}),
            ('Sur', 'V003', ${municipioId}),
            ('Oriente', 'V004', ${municipioId}),
            ('Occidente', 'V005', ${municipioId})
          `);
          console.log('✅ Datos básicos de veredas insertados exitosamente');
        } catch (insertError) {
          console.error('⚠️ Error insertando veredas:', insertError.message);
        }
      }
    }

    // Opcional: También limpiar otras tablas problemáticas si es necesario
    console.log('\n🧹 Verificando otras posibles inconsistencias...');
    
    // Verificar si existen otras tablas con problemas similares
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`📊 Tablas encontradas en la base de datos: ${tables.length}`);
    
    console.log('\n✅ Reparación de base de datos completada exitosamente!');
    console.log('📝 Ahora puedes ejecutar "npm start" para recrear las tablas con las foreign keys correctas');
    console.log('🔄 O ejecutar "npm run db:sync" si tienes ese comando configurado');

  } catch (error) {
    console.error('❌ Error al reparar la base de datos:', error.message);
    console.error('📋 Detalles del error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔐 Conexión a la base de datos cerrada');
  }
}

// Ejecutar solo si este archivo es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatabase();
}

export default fixDatabase;
