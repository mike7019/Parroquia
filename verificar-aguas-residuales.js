import { QueryTypes } from 'sequelize';
import sequelize from './src/config/sequelize.js';

async function verificarTablasAguasResiduales() {
  try {
    console.log('🔍 Verificando tablas relacionadas con aguas residuales...');
    
    // Verificar si existe la tabla tipos_aguas_residuales
    const tiposAguasResiduales = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%aguas%residuales%'
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('📋 Tablas encontradas con "aguas residuales":', tiposAguasResiduales);
    
    // Verificar si existe la tabla familia_aguas_residuales
    const tablaRelacion = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'familia_aguas_residuales'
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('🔗 Tabla de relación familia_aguas_residuales:', tablaRelacion.length > 0 ? 'EXISTE' : 'NO EXISTE');
    
    // Verificar tablas que contengan "familia" y "agua"
    const tablasRelacionadas = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE 'familia_%agua%' OR table_name LIKE '%agua%familia%')
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('🔍 Tablas relacionadas familia-agua:', tablasRelacionadas);
    
    // Verificar estructura de la tabla tipos_aguas_residuales
    if (tiposAguasResiduales.length > 0) {
      const estructura = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'tipos_aguas_residuales'
        ORDER BY ordinal_position
      `, {
        type: QueryTypes.SELECT
      });
      
      console.log('📊 Estructura de tipos_aguas_residuales:', estructura);
    }
    
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarTablasAguasResiduales();
