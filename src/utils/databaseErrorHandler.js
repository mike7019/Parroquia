import { 
  AppError, 
  ValidationError, 
  ConflictError, 
  NotFoundError,
  AuthenticationError 
} from './errors.js';
import logger from './logger.js';

/**
 * Clase para manejo específico y granular de errores de base de datos
 */
class DatabaseErrorHandler {
  /**
   * Mapea errores específicos de Sequelize a errores de aplicación
   */
  static handleSequelizeError(error, context = {}) {
    logger.database('Sequelize error occurred', {
      errorName: error.name,
      errorCode: error.original?.code,
      sqlState: error.original?.sqlState,
      constraint: error.original?.constraint,
      table: error.original?.table,
      column: error.original?.column,
      ...context
    });

    switch (error.name) {
      case 'SequelizeValidationError':
        return DatabaseErrorHandler.handleValidationError(error);
      
      case 'SequelizeUniqueConstraintError':
        return DatabaseErrorHandler.handleUniqueConstraintError(error);
      
      case 'SequelizeForeignKeyConstraintError':
        return DatabaseErrorHandler.handleForeignKeyError(error);
      
      case 'SequelizeConnectionError':
        return DatabaseErrorHandler.handleConnectionError(error);
      
      case 'SequelizeConnectionRefusedError':
        return DatabaseErrorHandler.handleConnectionRefusedError(error);
      
      case 'SequelizeHostNotFoundError':
        return DatabaseErrorHandler.handleHostNotFoundError(error);
      
      case 'SequelizeConnectionTimedOutError':
        return DatabaseErrorHandler.handleConnectionTimeoutError(error);
      
      case 'SequelizeTimeoutError':
        return DatabaseErrorHandler.handleTimeoutError(error);
      
      case 'SequelizeDatabaseError':
        return DatabaseErrorHandler.handleDatabaseError(error);
      
      case 'SequelizeEmptyResultError':
        return DatabaseErrorHandler.handleEmptyResultError(error);
      
      case 'SequelizeAccessDeniedError':
        return DatabaseErrorHandler.handleAccessDeniedError(error);
      
      case 'SequelizeExclusionConstraintError':
        return DatabaseErrorHandler.handleExclusionConstraintError(error);
      
      case 'SequelizeInvalidConnectionError':
        return DatabaseErrorHandler.handleInvalidConnectionError(error);

      default:
        return DatabaseErrorHandler.handleGenericError(error);
    }
  }

  /**
   * Errores de validación
   */
  static handleValidationError(error) {
    const validationDetails = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
      type: err.type,
      validatorKey: err.validatorKey
    }));

    logger.warn('Validation error occurred', {
      validationErrors: validationDetails,
      model: error.errors[0]?.instance?.constructor?.tableName || 'unknown'
    });

    return new ValidationError(
      'Los datos proporcionados no son válidos',
      validationDetails
    );
  }

  /**
   * Errores de unicidad
   */
  static handleUniqueConstraintError(error) {
    const constraintName = error.original?.constraint || 'unknown_constraint';
    const tableName = error.original?.table || 'unknown_table';
    
    // Mapear nombres de constraints a mensajes amigables
    const constraintMessages = {
      'usuarios_correo_electronico_unique': 'Este email ya está registrado',
      'personas_identificacion_unique': 'Esta identificación ya está registrada',
      'personas_correo_electronico_unique': 'Este email ya está asociado a otra persona',
      'familias_uuid_familia_unique': 'Este UUID de familia ya existe'
    };

    const friendlyMessage = constraintMessages[constraintName] || 
      `Ya existe un registro con estos datos en ${tableName}`;

    const conflictDetails = error.errors?.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    })) || [];

    logger.warn('Unique constraint violation', {
      constraint: constraintName,
      table: tableName,
      conflictFields: conflictDetails
    });

    return new ConflictError(friendlyMessage, 'DUPLICATE_ENTRY');
  }

  /**
   * Errores de llave foránea
   */
  static handleForeignKeyError(error) {
    const constraintName = error.original?.constraint || '';
    const tableName = error.original?.table || '';
    
    // Mapear constraints de FK a mensajes específicos
    const fkMessages = {
      'fk_personas_familia': 'La familia especificada no existe',
      'fk_personas_tipo_id': 'El tipo de identificación especificado no existe',
      'fk_personas_estado_civil': 'El estado civil especificado no existe',
      'fk_personas_sexo': 'El sexo especificado no existe',
      'fk_familias_vereda': 'La vereda especificada no existe',
      'fk_usuarios_roles_usuario': 'El usuario especificado no existe',
      'fk_usuarios_roles_rol': 'El rol especificado no existe'
    };

    const friendlyMessage = fkMessages[constraintName] || 
      'Referencia a un registro que no existe';

    logger.warn('Foreign key constraint violation', {
      constraint: constraintName,
      table: tableName,
      operation: error.sql?.split(' ')[0] || 'unknown'
    });

    return new ValidationError(friendlyMessage, [{
      field: 'foreignKey',
      message: friendlyMessage,
      constraint: constraintName
    }]);
  }

  /**
   * Errores de conexión a la base de datos
   */
  static handleConnectionError(error) {
    logger.error('Database connection error', error, {
      host: error.original?.host,
      port: error.original?.port,
      database: error.original?.database
    });

    return new AppError(
      'Error de conexión con la base de datos. Intenta nuevamente en unos momentos.',
      503,
      'DATABASE_CONNECTION_ERROR'
    );
  }

  static handleConnectionRefusedError(error) {
    logger.error('Database connection refused', error);
    
    return new AppError(
      'Servicio de base de datos no disponible temporalmente.',
      503,
      'DATABASE_UNAVAILABLE'
    );
  }

  static handleHostNotFoundError(error) {
    logger.error('Database host not found', error);
    
    return new AppError(
      'Error de configuración de base de datos.',
      500,
      'DATABASE_CONFIG_ERROR'
    );
  }

  static handleConnectionTimeoutError(error) {
    logger.warn('Database connection timeout', {
      timeout: error.original?.timeout || 'unknown'
    });
    
    return new AppError(
      'Tiempo de espera agotado al conectar con la base de datos.',
      504,
      'DATABASE_TIMEOUT'
    );
  }

  /**
   * Errores de timeout en operaciones
   */
  static handleTimeoutError(error) {
    logger.warn('Database operation timeout', {
      sql: error.sql?.substring(0, 100) + '...' || 'unknown query'
    });
    
    return new AppError(
      'La operación tardó demasiado tiempo. Intenta con una consulta más específica.',
      408,
      'OPERATION_TIMEOUT'
    );
  }

  /**
   * Errores generales de base de datos
   */
  static handleDatabaseError(error) {
    const errorCode = error.original?.code;
    const sqlState = error.original?.sqlState;
    
    // Códigos PostgreSQL específicos
    switch (errorCode) {
      case '23502': // NOT NULL violation
        return new ValidationError('Campo requerido faltante', [{
          field: error.original?.column || 'unknown',
          message: 'Este campo es requerido'
        }]);
      
      case '23503': // FOREIGN KEY violation
        return DatabaseErrorHandler.handleForeignKeyError(error);
      
      case '23505': // UNIQUE violation
        return DatabaseErrorHandler.handleUniqueConstraintError(error);
      
      case '42P01': // Table does not exist
        logger.error('Table does not exist', error);
        return new AppError('Error de configuración de base de datos', 500, 'TABLE_NOT_EXISTS');
      
      case '42703': // Column does not exist
        logger.error('Column does not exist', error);
        return new AppError('Error de configuración de base de datos', 500, 'COLUMN_NOT_EXISTS');
      
      case '42883': // Function does not exist
        logger.error('Function does not exist', error);
        return new AppError('Error de configuración de base de datos', 500, 'FUNCTION_NOT_EXISTS');
      
      case '53300': // Too many connections
        logger.error('Too many database connections', error);
        return new AppError('Servidor ocupado, intenta nuevamente', 503, 'TOO_MANY_CONNECTIONS');
      
      default:
        logger.error('Generic database error', error, {
          code: errorCode,
          sqlState: sqlState
        });
        return new AppError('Error interno de base de datos', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Resultado vacío cuando se esperaba al menos un registro
   */
  static handleEmptyResultError(error) {
    logger.debug('Empty result when expecting data', {
      model: error.model?.name || 'unknown'
    });
    
    return new NotFoundError('No se encontraron datos');
  }

  /**
   * Acceso denegado a la base de datos
   */
  static handleAccessDeniedError(error) {
    logger.error('Database access denied', error, {
      user: error.original?.user || 'unknown',
      host: error.original?.host || 'unknown'
    });
    
    return new AuthenticationError('Credenciales de base de datos inválidas', 'DB_ACCESS_DENIED');
  }

  /**
   * Error de constraint de exclusión
   */
  static handleExclusionConstraintError(error) {
    logger.warn('Exclusion constraint violation', {
      constraint: error.original?.constraint,
      table: error.original?.table
    });
    
    return new ConflictError('Los datos violan una restricción de exclusividad', 'EXCLUSION_VIOLATION');
  }

  /**
   * Conexión inválida
   */
  static handleInvalidConnectionError(error) {
    logger.error('Invalid database connection', error);
    
    return new AppError('Configuración de conexión a base de datos inválida', 500, 'INVALID_CONNECTION');
  }

  /**
   * Error genérico no categorizado
   */
  static handleGenericError(error) {
    logger.error('Uncategorized database error', error, {
      errorName: error.name,
      constructor: error.constructor.name
    });
    
    return new AppError(
      'Error interno del servidor',
      500,
      'UNCATEGORIZED_DB_ERROR'
    );
  }

  /**
   * Wrapper para operaciones de base de datos con manejo automático de errores
   */
  static async executeWithErrorHandling(operation, context = {}) {
    try {
      const start = Date.now();
      const result = await operation();
      const duration = Date.now() - start;
      
      logger.performance('Database operation completed', duration, context);
      return result;
      
    } catch (error) {
      throw DatabaseErrorHandler.handleSequelizeError(error, context);
    }
  }
}

export default DatabaseErrorHandler;
