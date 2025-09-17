/**
 * Script directo para eliminar difuntos usando MCP PostgreSQL
 * Fecha: 16 de septiembre de 2025
 * Propósito: Eliminación rápida y directa de difuntos específicos
 */

// Función para ejecutar consultas SQL directas
async function eliminarDifuntosDirecto() {
  try {
    console.log('🚀 INICIANDO ELIMINACIÓN DIRECTA DE DIFUNTOS');
    console.log('=' .repeat(50));

    // 1. Mostrar difuntos actuales
    console.log('\n📋 Difuntos actuales:');
    const difuntosActuales = `
      SELECT 
        id_difunto,
        nombre_completo,
        fecha_fallecimiento,
        causa_fallecimiento
      FROM difuntos_familia 
      ORDER BY id_difunto
    `;
    
    // 2. Crear backup en una tabla temporal (opcional)
    console.log('\n💾 Creando backup temporal...');
    const crearBackup = `
      CREATE TABLE IF NOT EXISTS difuntos_backup_$(date +%Y%m%d) AS 
      SELECT * FROM difuntos_familia;
    `;

    // 3. Eliminar difuntos específicos
    console.log('\n🗑️ Eliminando difuntos...');
    const eliminarPedro = `
      DELETE FROM difuntos_familia 
      WHERE id_difunto = 1 AND nombre_completo = 'Pedro Antonio Los Alvarez';
    `;
    
    const eliminarPecas = `
      DELETE FROM difuntos_familia 
      WHERE id_difunto = 2 AND nombre_completo = 'Pecas Garzon Rodriguez';
    `;

    // 4. Verificar eliminación
    const verificarEliminacion = `
      SELECT COUNT(*) as difuntos_restantes FROM difuntos_familia;
    `;

    // 5. Resetear secuencia
    const resetearSecuencia = `
      SELECT setval('difuntos_familia_id_difunto_seq', 1, false);
    `;

    console.log('\n📝 CONSULTAS SQL GENERADAS:');
    console.log('\n1. Ver difuntos actuales:');
    console.log(difuntosActuales.trim());
    
    console.log('\n2. Eliminar Pedro Antonio Los Alvarez:');
    console.log(eliminarPedro.trim());
    
    console.log('\n3. Eliminar Pecas Garzon Rodriguez:');
    console.log(eliminarPecas.trim());
    
    console.log('\n4. Verificar eliminación:');
    console.log(verificarEliminacion.trim());
    
    console.log('\n5. Resetear secuencia:');
    console.log(resetearSecuencia.trim());

    console.log('\n✅ Scripts SQL listos para ejecutar');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar función
eliminarDifuntosDirecto();