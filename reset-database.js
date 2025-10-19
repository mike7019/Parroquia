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
  logging: console.log
});

async function resetDatabase() {
  try {
    console.log('🗑️  Iniciando limpieza de base de datos...\n');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // ORDEN IMPORTANTE: Borrar desde las tablas hijas hacia las padres
    const tablesToClean = [
      // Datos de encuestas y relaciones
      { name: 'encuestas_completas', desc: 'Encuestas completas' },
      { name: 'persona_enfermedades', desc: 'Relación persona-enfermedades' },
      { name: 'persona_destrezas_habilidades', desc: 'Relación persona-destrezas' },
      { name: 'persona_profesiones_oficios', desc: 'Relación persona-profesiones' },
      { name: '"DifuntosFamilia"', desc: 'Difuntos' },
      { name: 'personas', desc: 'Personas' },
      
      // Tablas relacionadas con familias (PRIMERO - todas)
      { name: 'familia_disposicion_basura', desc: 'Familia-disposición basura' },
      { name: 'familia_sistema_acueducto', desc: 'Familia-sistema acueducto' },
      { name: 'familia_tipo_aguas_residuales', desc: 'Familia-aguas residuales' },
      { name: 'familia_sistema_aguas_residuales', desc: 'Familia-sistema aguas residuales' },
      { name: 'familia_tipo_vivienda', desc: 'Familia-tipo vivienda' },
      
      // Ahora sí familias
      { name: 'familias', desc: 'Familias' },
      
      // Datos geográficos (opcionales, comentar si quieres mantenerlos)
      // { name: 'veredas', desc: 'Veredas' },
      // { name: 'sectores', desc: 'Sectores' },
      // { name: 'parroquias', desc: 'Parroquias' },
      // { name: 'corregimientos', desc: 'Corregimientos' },
      
      // Usuarios (opcional, comentar si quieres mantener usuarios)
      { name: 'usuarios', desc: 'Usuarios' },
    ];

    console.log('📋 Tablas que se limpiarán:');
    tablesToClean.forEach(t => console.log(`   - ${t.desc} (${t.name})`));
    console.log('');

    for (const table of tablesToClean) {
      try {
        const [results] = await sequelize.query(`DELETE FROM ${table.name}`);
        console.log(`✅ ${table.desc}: ${results.rowCount || 0} registros eliminados`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`⚠️  ${table.desc}: Tabla no existe (ok)`);
        } else {
          console.log(`❌ ${table.desc}: Error - ${error.message}`);
        }
      }
    }

    // Resetear secuencias (auto-increment)
    console.log('\n🔄 Reseteando secuencias...');
    const sequences = [
      'familias_id_familia_seq',
      'personas_id_persona_seq',
      'encuestas_completas_id_encuesta_seq',
      'usuarios_id_usuario_seq'
    ];

    for (const seq of sequences) {
      try {
        await sequelize.query(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
        console.log(`   ✅ ${seq} reseteada`);
      } catch (error) {
        if (!error.message.includes('does not exist')) {
          console.log(`   ⚠️  ${seq}: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Base de datos limpiada exitosamente');
    console.log('📊 Catálogos conservados (tipos, roles, etc.)');
    console.log('🗑️  Familias, personas y encuestas eliminadas');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
resetDatabase()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Proceso fallido:', error);
    process.exit(1);
  });
