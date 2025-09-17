/**
 * Script para eliminar difuntos específicos de la base de datos
 * Fecha: 16 de septiembre de 2025
 * Propósito: Eliminar los 2 difuntos actuales en la base de datos
 */

import 'dotenv/config';
import { Sequelize } from 'sequelize';
import DifuntosFamilia from './src/models/catalog/DifuntosFamilia.js';

// Configuración de la base de datos
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

class EliminadorDifuntos {
  constructor() {
    this.difuntosAEliminar = [
      { id: 1, nombre: 'Pedro Antonio Los Alvarez' },
      { id: 2, nombre: 'Pecas Garzon Rodriguez' }
    ];
  }

  /**
   * Verificar conexión a la base de datos
   */
  async verificarConexion() {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida correctamente.');
      return true;
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error.message);
      return false;
    }
  }

  /**
   * Mostrar difuntos actuales antes de eliminar
   */
  async mostrarDifuntosActuales() {
    try {
      console.log('\n📋 DIFUNTOS ACTUALES EN LA BASE DE DATOS:');
      console.log('=' .repeat(60));

      const difuntos = await sequelize.query(
        `SELECT 
          df.id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento,
          df.causa_fallecimiento,
          s.nombre as sexo,
          p.nombre as parentesco
        FROM difuntos_familia df
        LEFT JOIN sexos s ON df.id_sexo = s.id_sexo
        LEFT JOIN parentescos p ON df.id_parentesco = p.id_parentesco
        ORDER BY df.id_difunto`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (difuntos.length === 0) {
        console.log('📄 No hay difuntos registrados en la base de datos.');
        return [];
      }

      difuntos.forEach((difunto, index) => {
        console.log(`${index + 1}. ID: ${difunto.id_difunto}`);
        console.log(`   Nombre: ${difunto.nombre_completo}`);
        console.log(`   Sexo: ${difunto.sexo || 'No especificado'}`);
        console.log(`   Parentesco: ${difunto.parentesco || 'No especificado'}`);
        console.log(`   Fecha fallecimiento: ${new Date(difunto.fecha_fallecimiento).toLocaleDateString()}`);
        console.log(`   Causa: ${difunto.causa_fallecimiento || 'No especificada'}`);
        console.log('   ' + '-'.repeat(50));
      });

      return difuntos;
    } catch (error) {
      console.error('❌ Error al consultar difuntos:', error.message);
      return [];
    }
  }

  /**
   * Crear backup antes de eliminar (opcional)
   */
  async crearBackup() {
    try {
      console.log('\n💾 CREANDO BACKUP DE DIFUNTOS...');
      
      const difuntos = await sequelize.query(
        'SELECT * FROM difuntos_familia ORDER BY id_difunto',
        { type: Sequelize.QueryTypes.SELECT }
      );

      const fechaBackup = new Date().toISOString().split('T')[0];
      const nombreArchivo = `backup-difuntos-${fechaBackup}.json`;
      
      const fs = await import('fs');
      fs.writeFileSync(nombreArchivo, JSON.stringify(difuntos, null, 2));
      
      console.log(`✅ Backup creado: ${nombreArchivo}`);
      console.log(`📊 Registros respaldados: ${difuntos.length}`);
      
      return nombreArchivo;
    } catch (error) {
      console.error('⚠️ Error al crear backup:', error.message);
      return null;
    }
  }

  /**
   * Eliminar difuntos específicos
   */
  async eliminarDifuntos() {
    try {
      console.log('\n🗑️ INICIANDO ELIMINACIÓN DE DIFUNTOS...');
      console.log('=' .repeat(50));

      let eliminados = 0;
      
      for (const difunto of this.difuntosAEliminar) {
        console.log(`\nEliminando: ${difunto.nombre} (ID: ${difunto.id})`);
        
        const resultado = await sequelize.query(
          'DELETE FROM difuntos_familia WHERE id_difunto = :id',
          {
            replacements: { id: difunto.id },
            type: Sequelize.QueryTypes.DELETE
          }
        );

        if (resultado[1] > 0) {
          console.log(`✅ Eliminado: ${difunto.nombre}`);
          eliminados++;
        } else {
          console.log(`⚠️ No se encontró: ${difunto.nombre} (ID: ${difunto.id})`);
        }
      }

      console.log('\n📊 RESUMEN DE ELIMINACIÓN:');
      console.log(`✅ Difuntos eliminados: ${eliminados}`);
      console.log(`📋 Total procesados: ${this.difuntosAEliminar.length}`);

      return eliminados;
    } catch (error) {
      console.error('❌ Error durante la eliminación:', error.message);
      throw error;
    }
  }

  /**
   * Verificar eliminación
   */
  async verificarEliminacion() {
    try {
      console.log('\n🔍 VERIFICANDO ELIMINACIÓN...');
      
      const difuntosRestantes = await sequelize.query(
        'SELECT COUNT(*) as total FROM difuntos_familia',
        { type: Sequelize.QueryTypes.SELECT }
      );

      const total = parseInt(difuntosRestantes[0].total);
      
      if (total === 0) {
        console.log('✅ Eliminación exitosa: No quedan difuntos en la base de datos');
      } else {
        console.log(`⚠️ Quedan ${total} difuntos en la base de datos`);
        
        // Mostrar difuntos restantes
        const restantes = await sequelize.query(
          'SELECT id_difunto, nombre_completo FROM difuntos_familia',
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        console.log('Difuntos restantes:');
        restantes.forEach(d => {
          console.log(`  - ID: ${d.id_difunto}, Nombre: ${d.nombre_completo}`);
        });
      }

      return total;
    } catch (error) {
      console.error('❌ Error al verificar eliminación:', error.message);
      return -1;
    }
  }

  /**
   * Resetear secuencia de IDs
   */
  async resetearSecuencia() {
    try {
      console.log('\n🔄 RESETEANDO SECUENCIA DE IDs...');
      
      await sequelize.query(
        "SELECT setval('difuntos_familia_id_difunto_seq', 1, false)",
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      console.log('✅ Secuencia reseteada correctamente');
    } catch (error) {
      console.log('⚠️ Error al resetear secuencia (puede ser normal):', error.message);
    }
  }

  /**
   * Proceso principal de eliminación
   */
  async ejecutar() {
    console.log('🚀 INICIANDO PROCESO DE ELIMINACIÓN DE DIFUNTOS');
    console.log('=' .repeat(60));
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log('=' .repeat(60));

    try {
      // 1. Verificar conexión
      const conectado = await this.verificarConexion();
      if (!conectado) {
        console.log('❌ No se puede continuar sin conexión a la base de datos');
        return;
      }

      // 2. Mostrar estado actual
      const difuntosActuales = await this.mostrarDifuntosActuales();
      if (difuntosActuales.length === 0) {
        console.log('✅ No hay difuntos para eliminar');
        return;
      }

      // 3. Crear backup
      await this.crearBackup();

      // 4. Confirmación del usuario
      console.log('\n⚠️ CONFIRMACIÓN REQUERIDA');
      console.log(`Se eliminarán ${this.difuntosAEliminar.length} difuntos de la base de datos.`);
      console.log('Esta acción NO se puede deshacer.');
      
      // En un entorno real, aquí se pediría confirmación del usuario
      // Por ahora, procedemos automáticamente
      
      // 5. Eliminar difuntos
      const eliminados = await this.eliminarDifuntos();

      // 6. Verificar eliminación
      await this.verificarEliminacion();

      // 7. Resetear secuencia
      await this.resetearSecuencia();

      console.log('\n🎉 PROCESO COMPLETADO EXITOSAMENTE');
      console.log(`✅ ${eliminados} difuntos eliminados correctamente`);

    } catch (error) {
      console.error('\n💥 ERROR DURANTE EL PROCESO:', error.message);
      console.error('Stacktrace:', error.stack);
    } finally {
      // Cerrar conexión
      await sequelize.close();
      console.log('\n🔌 Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const eliminador = new EliminadorDifuntos();
  eliminador.ejecutar();
}

export default EliminadorDifuntos;