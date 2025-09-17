import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

/**
 * Servicio de configuración para exportaciones Excel avanzadas
 * Maneja configuraciones predefinidas y personalizadas para reportes
 */
class ExcelConfigurationService {
  
  // Configuraciones predefinidas del sistema
  static CONFIGURATIONS = {
    BASIC: 'basic_family_info',
    COMPLETE: 'complete_family_data', 
    STATISTICAL: 'statistical_report',
    HEALTH_FOCUSED: 'health_and_medical',
    GEOGRAPHIC: 'geographic_distribution'
  };

  // Configuraciones por defecto
  static DEFAULT_CONFIGURATIONS = {
    [this.CONFIGURATIONS.BASIC]: {
      name: "Información Básica de Familias",
      description: "Datos esenciales de familias: apellido, dirección, contacto y miembros principales",
      columns: {
        family_basic: true,
        geographic_info: true,
        parents_details: true,
        children_info: false,
        deceased_members: false,
        health_conditions: false,
        skills_abilities: false,
        survey_data: false
      },
      format: {
        multiple_sheets: false,
        include_charts: false,
        professional_styling: true,
        auto_filters: true,
        freeze_headers: true
      },
      grouping: {
        group_by: "none",
        sort_by: "apellido_familiar",
        include_subtotals: false
      },
      limits: {
        max_rows_per_sheet: 50000,
        batch_size: 500
      }
    },

    [this.CONFIGURATIONS.COMPLETE]: {
      name: "Reporte Completo de Familias",
      description: "Información completa incluyendo todos los miembros, salud, destrezas y datos geográficos",
      columns: {
        family_basic: true,
        geographic_info: true,
        parents_details: true,
        children_info: true,
        deceased_members: true,
        health_conditions: true,
        skills_abilities: true,
        survey_data: true
      },
      format: {
        multiple_sheets: true,
        include_charts: true,
        professional_styling: true,
        auto_filters: true,
        freeze_headers: true
      },
      grouping: {
        group_by: "municipio",
        sort_by: "apellido_familiar",
        include_subtotals: true
      },
      limits: {
        max_rows_per_sheet: 25000,
        batch_size: 250
      }
    },

    [this.CONFIGURATIONS.STATISTICAL]: {
      name: "Reporte Estadístico",
      description: "Enfoque en estadísticas y análisis demográfico de familias",
      columns: {
        family_basic: true,
        geographic_info: true,
        parents_details: false,
        children_info: true,
        deceased_members: false,
        health_conditions: true,
        skills_abilities: false,
        survey_data: false
      },
      format: {
        multiple_sheets: true,
        include_charts: true,
        professional_styling: true,
        auto_filters: true,
        freeze_headers: true
      },
      grouping: {
        group_by: "sector",
        sort_by: "total_miembros",
        include_subtotals: true
      },
      limits: {
        max_rows_per_sheet: 30000,
        batch_size: 400
      }
    },

    [this.CONFIGURATIONS.HEALTH_FOCUSED]: {
      name: "Reporte de Salud y Medicina",
      description: "Enfoque en condiciones de salud, enfermedades y capacidades médicas",
      columns: {
        family_basic: true,
        geographic_info: false,
        parents_details: true,
        children_info: true,
        deceased_members: false,
        health_conditions: true,
        skills_abilities: true,
        survey_data: false
      },
      format: {
        multiple_sheets: true,
        include_charts: false,
        professional_styling: true,
        auto_filters: true,
        freeze_headers: true
      },
      grouping: {
        group_by: "none",
        sort_by: "apellido_familiar",
        include_subtotals: false
      },
      limits: {
        max_rows_per_sheet: 40000,
        batch_size: 300
      }
    },

    [this.CONFIGURATIONS.GEOGRAPHIC]: {
      name: "Distribución Geográfica",
      description: "Análisis de distribución de familias por ubicación geográfica",
      columns: {
        family_basic: true,
        geographic_info: true,
        parents_details: false,
        children_info: false,
        deceased_members: false,
        health_conditions: false,
        skills_abilities: false,
        survey_data: false
      },
      format: {
        multiple_sheets: true,
        include_charts: true,
        professional_styling: true,
        auto_filters: true,
        freeze_headers: true
      },
      grouping: {
        group_by: "municipio",
        sort_by: "vereda",
        include_subtotals: true
      },
      limits: {
        max_rows_per_sheet: 60000,
        batch_size: 600
      }
    }
  };

  /**
   * Obtener configuración por ID o personalizada
   * @param {string} configId - ID de configuración predefinida
   * @param {Object} customConfig - Configuración personalizada opcional
   * @returns {Object} Configuración final
   */
  async getConfiguration(configId, customConfig = {}) {
    try {
      console.log(`📋 Obteniendo configuración: ${configId}`);

      // Obtener configuración base
      let baseConfig = this.getDefaultConfiguration();
      
      if (configId && ExcelConfigurationService.DEFAULT_CONFIGURATIONS[configId]) {
        baseConfig = ExcelConfigurationService.DEFAULT_CONFIGURATIONS[configId];
        console.log(`✅ Configuración predefinida encontrada: ${baseConfig.name}`);
      }

      // Aplicar configuración personalizada si existe
      const finalConfig = this.mergeConfigurations(baseConfig, customConfig);

      // Validar configuración final
      await this.validateConfiguration(finalConfig);

      console.log(`✅ Configuración final preparada: ${finalConfig.name}`);
      return finalConfig;

    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      throw new Error(`Error al obtener configuración: ${error.message}`);
    }
  }

  /**
   * Guardar configuración personalizada (para futuras implementaciones)
   * @param {string} userId - ID del usuario
   * @param {string} configName - Nombre de la configuración
   * @param {Object} config - Configuración a guardar
   * @returns {Object} Configuración guardada
   */
  async saveConfiguration(userId, configName, config) {
    try {
      console.log(`💾 Guardando configuración personalizada: ${configName} para usuario: ${userId}`);

      // Validar configuración antes de guardar
      await this.validateConfiguration(config);

      // TODO: Implementar persistencia en base de datos
      // Por ahora retornamos la configuración validada
      const savedConfig = {
        id: `custom_${Date.now()}`,
        userId,
        name: configName,
        ...config,
        created_at: new Date(),
        updated_at: new Date()
      };

      console.log(`✅ Configuración guardada con ID: ${savedConfig.id}`);
      return savedConfig;

    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      throw new Error(`Error al guardar configuración: ${error.message}`);
    }
  }

  /**
   * Validar estructura de configuración
   * @param {Object} config - Configuración a validar
   * @returns {boolean} True si es válida
   */
  async validateConfiguration(config) {
    try {
      console.log('🔍 Validando configuración...');

      // Validar estructura básica
      if (!config || typeof config !== 'object') {
        throw new Error('La configuración debe ser un objeto válido');
      }

      // Validar secciones requeridas
      const requiredSections = ['columns', 'format', 'grouping', 'limits'];
      for (const section of requiredSections) {
        if (!config[section] || typeof config[section] !== 'object') {
          throw new Error(`La sección '${section}' es requerida y debe ser un objeto`);
        }
      }

      // Validar columnas
      const validColumns = [
        'family_basic', 'geographic_info', 'parents_details', 
        'children_info', 'deceased_members', 'health_conditions', 
        'skills_abilities', 'survey_data'
      ];
      
      for (const column of validColumns) {
        if (config.columns[column] !== undefined && typeof config.columns[column] !== 'boolean') {
          throw new Error(`La columna '${column}' debe ser un valor booleano`);
        }
      }

      // Validar formato
      const validFormatOptions = [
        'multiple_sheets', 'include_charts', 'professional_styling', 
        'auto_filters', 'freeze_headers'
      ];
      
      for (const option of validFormatOptions) {
        if (config.format[option] !== undefined && typeof config.format[option] !== 'boolean') {
          throw new Error(`La opción de formato '${option}' debe ser un valor booleano`);
        }
      }

      // Validar agrupación
      const validGroupBy = ['none', 'municipio', 'sector', 'vereda', 'parroquia'];
      if (config.grouping.group_by && !validGroupBy.includes(config.grouping.group_by)) {
        throw new Error(`group_by debe ser uno de: ${validGroupBy.join(', ')}`);
      }

      // Validar límites
      if (config.limits.max_rows_per_sheet && 
          (typeof config.limits.max_rows_per_sheet !== 'number' || 
           config.limits.max_rows_per_sheet < 1000 || 
           config.limits.max_rows_per_sheet > 100000)) {
        throw new Error('max_rows_per_sheet debe ser un número entre 1000 y 100000');
      }

      if (config.limits.batch_size && 
          (typeof config.limits.batch_size !== 'number' || 
           config.limits.batch_size < 50 || 
           config.limits.batch_size > 1000)) {
        throw new Error('batch_size debe ser un número entre 50 y 1000');
      }

      console.log('✅ Configuración validada correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error validando configuración:', error);
      throw error;
    }
  }

  /**
   * Generar mapeo de columnas basado en configuración
   * @param {Object} config - Configuración
   * @returns {Object} Mapeo de columnas
   */
  generateColumnMapping(config) {
    try {
      console.log('🗂️ Generando mapeo de columnas...');

      const columnMapping = {};

      // Información básica de familia
      if (config.columns.family_basic) {
        Object.assign(columnMapping, {
          'familia.apellido_familiar': 'Apellido Familiar',
          'familia.telefono': 'Teléfono Familia',
          'familia.direccion_familia': 'Dirección',
          'familia.tipo_vivienda': 'Tipo Vivienda',
          'familia.tamaño_familia': 'Tamaño Familia',
          'familia.codigo_familia': 'Código Familia',
          'familia.comunionEnCasa': 'Comunión en Casa',
          'familia.numero_contrato_epm': 'Contrato EPM'
        });
      }

      // Información geográfica
      if (config.columns.geographic_info) {
        Object.assign(columnMapping, {
          'ubicacion.parroquia': 'Parroquia',
          'ubicacion.municipio': 'Municipio',
          'ubicacion.vereda': 'Vereda',
          'ubicacion.sector': 'Sector'
        });
      }

      // Detalles de padres
      if (config.columns.parents_details) {
        Object.assign(columnMapping, {
          'miembros.padre.nombre_completo': 'Nombre Padre',
          'miembros.padre.identificacion': 'Documento Padre',
          'miembros.padre.telefono': 'Teléfono Padre',
          'miembros.padre.edad': 'Edad Padre',
          'miembros.padre.ocupacion': 'Ocupación Padre',
          'miembros.padre.estado_civil': 'Estado Civil Padre',
          'miembros.madre.nombre_completo': 'Nombre Madre',
          'miembros.madre.identificacion': 'Documento Madre',
          'miembros.madre.telefono': 'Teléfono Madre',
          'miembros.madre.edad': 'Edad Madre',
          'miembros.madre.ocupacion': 'Ocupación Madre',
          'miembros.madre.estado_civil': 'Estado Civil Madre'
        });
      }

      // Información de hijos
      if (config.columns.children_info) {
        Object.assign(columnMapping, {
          'estadisticas.total_hijos': 'Total Hijos',
          'hijos.nombres': 'Nombres Hijos',
          'hijos.edades': 'Edades Hijos',
          'hijos.estudios': 'Estudios Hijos'
        });
      }

      // Miembros fallecidos
      if (config.columns.deceased_members) {
        Object.assign(columnMapping, {
          'difuntos.total': 'Total Difuntos',
          'difuntos.nombres': 'Nombres Difuntos',
          'difuntos.fechas_fallecimiento': 'Fechas Fallecimiento'
        });
      }

      // Condiciones de salud
      if (config.columns.health_conditions) {
        Object.assign(columnMapping, {
          'salud.tiene_enfermedades': 'Tiene Enfermedades',
          'salud.enfermedades_padre': 'Enfermedades Padre',
          'salud.enfermedades_madre': 'Enfermedades Madre',
          'salud.enfermedades_hijos': 'Enfermedades Hijos'
        });
      }

      // Habilidades y destrezas
      if (config.columns.skills_abilities) {
        Object.assign(columnMapping, {
          'destrezas.padre': 'Destrezas Padre',
          'destrezas.madre': 'Destrezas Madre',
          'destrezas.hijos': 'Destrezas Hijos',
          'destrezas.total_familia': 'Total Destrezas Familia'
        });
      }

      // Datos de encuesta
      if (config.columns.survey_data) {
        Object.assign(columnMapping, {
          'encuesta.estado': 'Estado Encuesta',
          'encuesta.fecha_ultima': 'Última Encuesta',
          'encuesta.completitud': 'Completitud %'
        });
      }

      // Siempre incluir estadísticas básicas
      Object.assign(columnMapping, {
        'estadisticas.total_miembros': 'Total Miembros',
        'estadisticas.promedio_edad': 'Promedio Edad'
      });

      console.log(`✅ Mapeo generado con ${Object.keys(columnMapping).length} columnas`);
      return columnMapping;

    } catch (error) {
      console.error('❌ Error generando mapeo de columnas:', error);
      throw new Error(`Error al generar mapeo de columnas: ${error.message}`);
    }
  }

  /**
   * Obtener configuración por defecto
   * @returns {Object} Configuración por defecto
   */
  getDefaultConfiguration() {
    return ExcelConfigurationService.DEFAULT_CONFIGURATIONS[ExcelConfigurationService.CONFIGURATIONS.BASIC];
  }

  /**
   * Combinar configuraciones (base + personalizada)
   * @param {Object} baseConfig - Configuración base
   * @param {Object} customConfig - Configuración personalizada
   * @returns {Object} Configuración combinada
   */
  mergeConfigurations(baseConfig, customConfig) {
    try {
      console.log('🔄 Combinando configuraciones...');

      const merged = JSON.parse(JSON.stringify(baseConfig)); // Deep copy

      // Combinar cada sección
      if (customConfig.columns) {
        merged.columns = { ...merged.columns, ...customConfig.columns };
      }

      if (customConfig.format) {
        merged.format = { ...merged.format, ...customConfig.format };
      }

      if (customConfig.grouping) {
        merged.grouping = { ...merged.grouping, ...customConfig.grouping };
      }

      if (customConfig.limits) {
        merged.limits = { ...merged.limits, ...customConfig.limits };
      }

      // Sobrescribir propiedades de nivel superior
      if (customConfig.name) merged.name = customConfig.name;
      if (customConfig.description) merged.description = customConfig.description;

      console.log('✅ Configuraciones combinadas exitosamente');
      return merged;

    } catch (error) {
      console.error('❌ Error combinando configuraciones:', error);
      throw new Error(`Error al combinar configuraciones: ${error.message}`);
    }
  }

  /**
   * Obtener lista de configuraciones disponibles
   * @returns {Array} Lista de configuraciones predefinidas
   */
  getAvailableConfigurations() {
    return Object.entries(ExcelConfigurationService.DEFAULT_CONFIGURATIONS).map(([key, config]) => ({
      id: key,
      name: config.name,
      description: config.description,
      features: {
        multiple_sheets: config.format.multiple_sheets,
        include_charts: config.format.include_charts,
        has_health_data: config.columns.health_conditions,
        has_geographic_data: config.columns.geographic_info
      }
    }));
  }

  /**
   * Calcular configuración óptima basada en tamaño de dataset
   * @param {number} estimatedRows - Número estimado de filas
   * @returns {Object} Configuración optimizada
   */
  calculateOptimalConfiguration(estimatedRows) {
    try {
      console.log(`⚡ Calculando configuración óptima para ${estimatedRows} filas`);

      let optimalConfig;

      if (estimatedRows <= 1000) {
        // Dataset pequeño - usar configuración completa
        optimalConfig = this.getConfiguration(ExcelConfigurationService.CONFIGURATIONS.COMPLETE);
      } else if (estimatedRows <= 5000) {
        // Dataset mediano - configuración básica con algunas características
        optimalConfig = this.getConfiguration(ExcelConfigurationService.CONFIGURATIONS.BASIC, {
          columns: { children_info: true, health_conditions: true },
          format: { include_charts: true },
          limits: { batch_size: 300 }
        });
      } else {
        // Dataset grande - configuración mínima optimizada
        optimalConfig = this.getConfiguration(ExcelConfigurationService.CONFIGURATIONS.BASIC, {
          format: { 
            multiple_sheets: true, 
            include_charts: false,
            professional_styling: false 
          },
          limits: { 
            batch_size: 500,
            max_rows_per_sheet: 25000
          }
        });
      }

      console.log(`✅ Configuración óptima calculada: ${optimalConfig.name}`);
      return optimalConfig;

    } catch (error) {
      console.error('❌ Error calculando configuración óptima:', error);
      return this.getDefaultConfiguration();
    }
  }
}

export default new ExcelConfigurationService();