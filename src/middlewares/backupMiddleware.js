import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { logger } from './loggingMiddleware.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Middleware para backup automático antes de operaciones destructivas
 */
class BackupMiddleware {
  
  /**
   * Crear backup antes de eliminar encuesta
   */
  static async backupBeforeDelete(req, res, next) {
    try {
      const { id } = req.params;
      
      logger.info('Iniciando backup antes de eliminación', {
        encuesta_id: id,
        user_id: req.user?.id,
        timestamp: new Date().toISOString()
      });

      // Obtener datos completos de la encuesta
      const encuestaCompleta = await BackupMiddleware.obtenerDatosCompletos(id);
      
      if (!encuestaCompleta) {
        return next(); // Si no existe, continuar con el flujo normal
      }

      // Crear backup
      const backupData = {
        metadata: {
          backup_date: new Date().toISOString(),
          encuesta_id: id,
          user_id: req.user?.id,
          operation: 'DELETE',
          backup_version: '1.0'
        },
        familia: encuestaCompleta.familia,
        personas: encuestaCompleta.personas,
        difuntos: encuestaCompleta.difuntos,
        servicios: encuestaCompleta.servicios
      };

      // Guardar backup en archivo
      await BackupMiddleware.guardarBackup(id, backupData);
      
      // Agregar información del backup al request
      req.backupInfo = {
        backup_created: true,
        backup_timestamp: backupData.metadata.backup_date,
        backup_file: `encuesta_${id}_${Date.now()}.json`
      };

      logger.info('Backup creado exitosamente', {
        encuesta_id: id,
        backup_file: req.backupInfo.backup_file
      });

      next();

    } catch (error) {
      logger.error('Error creando backup', {
        error: error.message,
        stack: error.stack,
        encuesta_id: req.params.id
      });

      // En caso de error en backup, continuar pero registrar el error
      req.backupInfo = {
        backup_created: false,
        backup_error: error.message
      };
      
      next();
    }
  }

  /**
   * Obtener todos los datos relacionados con una encuesta
   */
  static async obtenerDatosCompletos(encuestaId) {
    try {
      // Datos de la familia
      const [familia] = await sequelize.query(`
        SELECT f.*, 
               m.nombre_municipio, v.nombre as nombre_vereda,
               s.nombre as nombre_sector, p.nombre as nombre_parroquia,
               tv.nombre as nombre_tipo_vivienda
        FROM familias f
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
        WHERE f.id_familia = :id
      `, {
        replacements: { id: encuestaId },
        type: QueryTypes.SELECT
      });

      if (!familia) return null;

      // Personas vivas
      const personas = await sequelize.query(`
        SELECT p.*, 
               s.descripcion as sexo_nombre,
               ti.nombre as tipo_identificacion_nombre,
               sc.nombre as estado_civil_nombre
        FROM personas p
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
        LEFT JOIN situaciones_civiles sc ON p.id_estado_civil_estado_civil = sc.id_situacion_civil
        WHERE p.id_familia_familias = :id 
        AND p.identificacion NOT LIKE 'FALLECIDO%'
      `, {
        replacements: { id: encuestaId },
        type: QueryTypes.SELECT
      });

      // Difuntos
      const difuntos = await sequelize.query(`
        SELECT df.*, 
               s.descripcion as sexo_nombre,
               par.nombre as parentesco_nombre
        FROM difuntos_familia df
        LEFT JOIN sexos s ON df.id_sexo = s.id_sexo
        LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
        WHERE df.id_familia_familias = :id
      `, {
        replacements: { id: encuestaId },
        type: QueryTypes.SELECT
      });

      // Servicios asociados
      const servicios = await BackupMiddleware.obtenerServicios(encuestaId);

      return {
        familia,
        personas,
        difuntos,
        servicios
      };

    } catch (error) {
      logger.error('Error obteniendo datos completos para backup', {
        error: error.message,
        encuesta_id: encuestaId
      });
      throw error;
    }
  }

  /**
   * Obtener servicios asociados a la familia
   */
  static async obtenerServicios(familiaId) {
    const servicios = {};

    try {
      // Disposición de basuras
      servicios.disposicion_basuras = await sequelize.query(`
        SELECT fdb.*, tdb.nombre
        FROM familia_disposicion_basura fdb
        JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura
        WHERE fdb.id_familia = :familiaId
      `, {
        replacements: { familiaId },
        type: QueryTypes.SELECT
      });

      // Sistema de acueducto
      servicios.sistema_acueducto = await sequelize.query(`
        SELECT fsa.*, sa.nombre
        FROM familia_sistema_acueducto fsa
        JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto
        WHERE fsa.id_familia = :familiaId
      `, {
        replacements: { familiaId },
        type: QueryTypes.SELECT
      });

      // Aguas residuales
      servicios.aguas_residuales = await sequelize.query(`
        SELECT fsar.*, tar.nombre
        FROM familia_sistema_aguas_residuales fsar
        JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales
        WHERE fsar.id_familia = :familiaId
      `, {
        replacements: { familiaId },
        type: QueryTypes.SELECT
      });

      // Tipo de vivienda
      servicios.tipo_vivienda = await sequelize.query(`
        SELECT ftv.*, tv.nombre
        FROM familia_tipo_vivienda ftv
        JOIN tipos_vivienda tv ON ftv.id_tipo_vivienda = tv.id_tipo_vivienda
        WHERE ftv.id_familia = :familiaId
      `, {
        replacements: { familiaId },
        type: QueryTypes.SELECT
      });

    } catch (error) {
      logger.warn('Error obteniendo algunos servicios para backup', {
        error: error.message,
        familia_id: familiaId
      });
    }

    return servicios;
  }

  /**
   * Guardar backup en archivo
   */
  static async guardarBackup(encuestaId, backupData) {
    try {
      // Crear directorio de backups si no existe
      const backupDir = path.join(process.cwd(), 'backups', 'encuestas');
      await fs.mkdir(backupDir, { recursive: true });

      // Nombre del archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `encuesta_${encuestaId}_${timestamp}.json`;
      const filepath = path.join(backupDir, filename);

      // Guardar archivo
      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf8');

      logger.info('Backup guardado en archivo', {
        encuesta_id: encuestaId,
        backup_file: filename,
        backup_path: filepath
      });

      // Limpiar backups antiguos (mantener solo los últimos 100)
      await BackupMiddleware.limpiarBackupsAntiguos(backupDir);

    } catch (error) {
      logger.error('Error guardando backup en archivo', {
        error: error.message,
        encuesta_id: encuestaId
      });
      throw error;
    }
  }

  /**
   * Limpiar backups antiguos para evitar acumulación
   */
  static async limpiarBackupsAntiguos(backupDir, maxFiles = 100) {
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('encuesta_') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file)
        }));

      if (backupFiles.length > maxFiles) {
        // Obtener stats de archivos para ordenar por fecha
        const filesWithStats = await Promise.all(
          backupFiles.map(async (file) => {
            const stats = await fs.stat(file.path);
            return { ...file, mtime: stats.mtime };
          })
        );

        // Ordenar por fecha (más antiguos primero)
        filesWithStats.sort((a, b) => a.mtime - b.mtime);

        // Eliminar archivos más antiguos
        const filesToDelete = filesWithStats.slice(0, filesWithStats.length - maxFiles);
        
        for (const file of filesToDelete) {
          await fs.unlink(file.path);
          logger.info('Backup antiguo eliminado', { file: file.name });
        }
      }

    } catch (error) {
      logger.warn('Error limpiando backups antiguos', {
        error: error.message,
        backup_dir: backupDir
      });
    }
  }

  /**
   * Restaurar encuesta desde backup
   */
  static async restaurarDesdeBackup(backupFile) {
    try {
      const backupPath = path.join(process.cwd(), 'backups', 'encuestas', backupFile);
      const backupContent = await fs.readFile(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);

      logger.info('Iniciando restauración desde backup', {
        backup_file: backupFile,
        encuesta_id: backupData.metadata.encuesta_id
      });

      // Aquí implementarías la lógica de restauración
      // Por ahora solo retornamos los datos
      return backupData;

    } catch (error) {
      logger.error('Error restaurando desde backup', {
        error: error.message,
        backup_file: backupFile
      });
      throw error;
    }
  }
}

export default BackupMiddleware;
