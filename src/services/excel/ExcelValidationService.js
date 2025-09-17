import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

/**
 * Servicio de validación para datos de exportación Excel
 * Proporciona validación robusta y corrección automática de datos
 */
class ExcelValidationService {

  // Reglas de validación por tipo de dato
  static VALIDATION_RULES = {
    REQUIRED_FIELDS: {
      familia: ['apellido_familiar'],
      persona: ['primer_nombre', 'primer_apellido'],
      ubicacion: ['municipio']
    },
    
    DATA_FORMATS: {
      telefono: /^[\d\s\-\+\(\)]{7,15}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      identificacion: /^[\d]{6,12}$/,
      fecha: /^\d{4}-\d{2}-\d{2}$/
    },

    RANGES: {
      edad: { min: 0, max: 120 },
      tamaño_familia: { min: 1, max: 20 },
      telefono_length: { min: 7, max: 15 }
    },

    GEOGRAPHIC_HIERARCHY: {
      required_order: ['municipio', 'vereda', 'sector'],
      dependencies: {
        vereda: 'municipio',
        sector: 'vereda'
      }
    }
  };

  // Tipos de errores de validación
  static ERROR_TYPES = {
    MISSING_REQUIRED: 'missing_required_field',
    INVALID_FORMAT: 'invalid_format',
    OUT_OF_RANGE: 'out_of_range',
    DUPLICATE_RECORD: 'duplicate_record',
    GEOGRAPHIC_INCONSISTENCY: 'geographic_inconsistency',
    DATA_INTEGRITY: 'data_integrity_issue',
    ORPHANED_RECORD: 'orphaned_record'
  };

  /**
   * Validar datos completos de familias para Excel
   * @param {Array} families - Array de familias a validar
   * @returns {Object} Resultado de validación con errores y datos corregidos
   */
  async validateFamilyData(families) {
    try {
      console.log(`🔍 Iniciando validación de ${families.length} familias...`);

      const validationResult = {
        valid_families: [],
        invalid_families: [],
        warnings: [],
        errors: [],
        corrections_applied: [],
        statistics: {
          total_families: families.length,
          valid_count: 0,
          invalid_count: 0,
          warning_count: 0,
          error_count: 0,
          corrections_count: 0
        }
      };

      // Validar cada familia individualmente
      for (let i = 0; i < families.length; i++) {
        const familia = families[i];
        const familyValidation = await this.validateSingleFamily(familia, i);

        if (familyValidation.is_valid) {
          validationResult.valid_families.push(familyValidation.family);
          validationResult.statistics.valid_count++;
        } else {
          validationResult.invalid_families.push({
            original_family: familia,
            validation_errors: familyValidation.errors,
            index: i
          });
          validationResult.statistics.invalid_count++;
        }

        // Agregar errores y advertencias
        validationResult.errors.push(...familyValidation.errors);
        validationResult.warnings.push(...familyValidation.warnings);
        validationResult.corrections_applied.push(...familyValidation.corrections);
      }

      // Validaciones globales (duplicados, integridad referencial)
      await this.performGlobalValidations(validationResult);

      // Actualizar estadísticas finales
      validationResult.statistics.error_count = validationResult.errors.length;
      validationResult.statistics.warning_count = validationResult.warnings.length;
      validationResult.statistics.corrections_count = validationResult.corrections_applied.length;

      console.log(`✅ Validación completada: ${validationResult.statistics.valid_count}/${validationResult.statistics.total_families} familias válidas`);
      
      return validationResult;

    } catch (error) {
      console.error('❌ Error en validación de familias:', error);
      throw new Error(`Error al validar datos de familias: ${error.message}`);
    }
  }

  /**
   * Validar una familia individual
   * @param {Object} familia - Datos de la familia
   * @param {number} index - Índice de la familia
   * @returns {Object} Resultado de validación individual
   */
  async validateSingleFamily(familia, index) {
    const result = {
      is_valid: true,
      family: { ...familia },
      errors: [],
      warnings: [],
      corrections: []
    };

    try {
      // Validar campos requeridos
      await this.validateRequiredFields(result, index);

      // Validar formatos de datos
      await this.validateDataFormats(result, index);

      // Validar rangos de valores
      await this.validateDataRanges(result, index);

      // Validar consistencia geográfica
      await this.validateGeographicConsistency(result, index);

      // Validar integridad de miembros de familia
      await this.validateFamilyMembersIntegrity(result, index);

      // Aplicar correcciones automáticas
      await this.applyAutomaticCorrections(result, index);

    } catch (error) {
      result.errors.push({
        type: ExcelValidationService.ERROR_TYPES.DATA_INTEGRITY,
        field: 'general',
        message: `Error validando familia en índice ${index}: ${error.message}`,
        family_index: index,
        severity: 'high'
      });
      result.is_valid = false;
    }

    return result;
  }

  /**
   * Validar campos requeridos
   * @param {Object} result - Resultado de validación
   * @param {number} index - Índice de la familia
   */
  async validateRequiredFields(result, index) {
    const familia = result.family;

    // Validar campos requeridos de familia
    const requiredFamilyFields = ExcelValidationService.VALIDATION_RULES.REQUIRED_FIELDS.familia;
    
    for (const field of requiredFamilyFields) {
      if (!familia[field] || (typeof familia[field] === 'string' && familia[field].trim() === '')) {
        result.errors.push({
          type: ExcelValidationService.ERROR_TYPES.MISSING_REQUIRED,
          field: field,
          message: `Campo requerido '${field}' está vacío o faltante`,
          family_index: index,
          severity: 'high'
        });
        result.is_valid = false;
      }
    }

    // Validar que tenga al menos un miembro
    if (!familia.miembros || 
        (!familia.miembros.padre && !familia.miembros.madre && 
         (!familia.miembros.hijos || familia.miembros.hijos.length === 0))) {
      result.errors.push({
        type: ExcelValidationService.ERROR_TYPES.MISSING_REQUIRED,
        field: 'miembros',
        message: 'La familia debe tener al menos un miembro (padre, madre o hijo)',
        family_index: index,
        severity: 'high'
      });
      result.is_valid = false;
    }

    // Validar campos requeridos de ubicación
    if (!familia.ubicacion || !familia.ubicacion.municipio) {
      result.errors.push({
        type: ExcelValidationService.ERROR_TYPES.MISSING_REQUIRED,
        field: 'ubicacion.municipio',
        message: 'El municipio es requerido para la ubicación',
        family_index: index,
        severity: 'high'
      });
      result.is_valid = false;
    }
  }

  /**
   * Validar formatos de datos
   * @param {Object} result - Resultado de validación
   * @param {number} index - Índice de la familia
   */
  async validateDataFormats(result, index) {
    const familia = result.family;

    // Validar teléfono de familia
    if (familia.telefono && !ExcelValidationService.VALIDATION_RULES.DATA_FORMATS.telefono.test(familia.telefono)) {
      result.warnings.push({
        type: ExcelValidationService.ERROR_TYPES.INVALID_FORMAT,
        field: 'telefono',
        message: `Formato de teléfono inválido: ${familia.telefono}`,
        family_index: index,
        severity: 'medium'
      });
    }

    // Validar email si existe
    if (familia.email && !ExcelValidationService.VALIDATION_RULES.DATA_FORMATS.email.test(familia.email)) {
      result.warnings.push({
        type: ExcelValidationService.ERROR_TYPES.INVALID_FORMAT,
        field: 'email',
        message: `Formato de email inválido: ${familia.email}`,
        family_index: index,
        severity: 'medium'
      });
    }

    // Validar formatos de miembros
    if (familia.miembros) {
      ['padre', 'madre'].forEach(parentType => {
        const parent = familia.miembros[parentType];
        if (parent) {
          this.validatePersonFormat(parent, `miembros.${parentType}`, result, index);
        }
      });

      // Validar hijos
      if (familia.miembros.hijos && Array.isArray(familia.miembros.hijos)) {
        familia.miembros.hijos.forEach((hijo, hijoIndex) => {
          this.validatePersonFormat(hijo, `miembros.hijos[${hijoIndex}]`, result, index);
        });
      }
    }
  }

  /**
   * Validar formato de una persona
   * @param {Object} person - Datos de la persona
   * @param {string} fieldPath - Ruta del campo
   * @param {Object} result - Resultado de validación
   * @param {number} familyIndex - Índice de la familia
   */
  validatePersonFormat(person, fieldPath, result, familyIndex) {
    // Validar identificación
    if (person.identificacion && 
        !ExcelValidationService.VALIDATION_RULES.DATA_FORMATS.identificacion.test(person.identificacion)) {
      result.warnings.push({
        type: ExcelValidationService.ERROR_TYPES.INVALID_FORMAT,
        field: `${fieldPath}.identificacion`,
        message: `Formato de identificación inválido: ${person.identificacion}`,
        family_index: familyIndex,
        severity: 'medium'
      });
    }

    // Validar fecha de nacimiento
    if (person.fecha_nacimiento && 
        !ExcelValidationService.VALIDATION_RULES.DATA_FORMATS.fecha.test(person.fecha_nacimiento)) {
      result.warnings.push({
        type: ExcelValidationService.ERROR_TYPES.INVALID_FORMAT,
        field: `${fieldPath}.fecha_nacimiento`,
        message: `Formato de fecha inválido: ${person.fecha_nacimiento}`,
        family_index: familyIndex,
        severity: 'medium'
      });
    }

    // Validar teléfono de persona
    if (person.telefono && 
        !ExcelValidationService.VALIDATION_RULES.DATA_FORMATS.telefono.test(person.telefono)) {
      result.warnings.push({
        type: ExcelValidationService.ERROR_TYPES.INVALID_FORMAT,
        field: `${fieldPath}.telefono`,
        message: `Formato de teléfono inválido: ${person.telefono}`,
        family_index: familyIndex,
        severity: 'low'
      });
    }
  }

  /**
   * Validar rangos de valores
   * @param {Object} result - Resultado de validación
   * @param {number} index - Índice de la familia
   */
  async validateDataRanges(result, index) {
    const familia = result.family;

    // Validar tamaño de familia
    if (familia.tamaño_familia) {
      const size = parseInt(familia.tamaño_familia);
      const range = ExcelValidationService.VALIDATION_RULES.RANGES.tamaño_familia;
      
      if (size < range.min || size > range.max) {
        result.warnings.push({
          type: ExcelValidationService.ERROR_TYPES.OUT_OF_RANGE,
          field: 'tamaño_familia',
          message: `Tamaño de familia fuera de rango (${range.min}-${range.max}): ${size}`,
          family_index: index,
          severity: 'medium'
        });
      }
    }

    // Validar edades de miembros
    if (familia.miembros) {
      ['padre', 'madre'].forEach(parentType => {
        const parent = familia.miembros[parentType];
        if (parent && parent.edad) {
          this.validateAgeRange(parent.edad, `miembros.${parentType}.edad`, result, index);
        }
      });

      if (familia.miembros.hijos && Array.isArray(familia.miembros.hijos)) {
        familia.miembros.hijos.forEach((hijo, hijoIndex) => {
          if (hijo.edad) {
            this.validateAgeRange(hijo.edad, `miembros.hijos[${hijoIndex}].edad`, result, index);
          }
        });
      }
    }
  }

  /**
   * Validar rango de edad
   * @param {number} edad - Edad a validar
   * @param {string} fieldPath - Ruta del campo
   * @param {Object} result - Resultado de validación
   * @param {number} familyIndex - Índice de la familia
   */
  validateAgeRange(edad, fieldPath, result, familyIndex) {
    const age = parseInt(edad);
    const range = ExcelValidationService.VALIDATION_RULES.RANGES.edad;
    
    if (age < range.min || age > range.max) {
      result.warnings.push({
        type: ExcelValidationService.ERROR_TYPES.OUT_OF_RANGE,
        field: fieldPath,
        message: `Edad fuera de rango (${range.min}-${range.max}): ${age}`,
        family_index: familyIndex,
        severity: 'medium'
      });
    }
  }

  /**
   * Validar consistencia geográfica
   * @param {Object} result - Resultado de validación
   * @param {number} index - Índice de la familia
   */
  async validateGeographicConsistency(result, index) {
    const familia = result.family;
    
    if (!familia.ubicacion) return;

    const ubicacion = familia.ubicacion;

    // Validar jerarquía geográfica
    if (ubicacion.vereda && !ubicacion.municipio) {
      result.errors.push({
        type: ExcelValidationService.ERROR_TYPES.GEOGRAPHIC_INCONSISTENCY,
        field: 'ubicacion',
        message: 'No se puede especificar vereda sin municipio',
        family_index: index,
        severity: 'high'
      });
      result.is_valid = false;
    }

    if (ubicacion.sector && !ubicacion.vereda) {
      result.warnings.push({
        type: ExcelValidationService.ERROR_TYPES.GEOGRAPHIC_INCONSISTENCY,
        field: 'ubicacion',
        message: 'Se especifica sector sin vereda, puede causar inconsistencias',
        family_index: index,
        severity: 'medium'
      });
    }

    // TODO: Validar contra base de datos geográfica real
    // Por ahora solo validamos la estructura lógica
  }

  /**
   * Validar integridad de miembros de familia
   * @param {Object} result - Resultado de validación
   * @param {number} index - Índice de la familia
   */
  async validateFamilyMembersIntegrity(result, index) {
    const familia = result.family;
    
    if (!familia.miembros) return;

    const miembros = familia.miembros;
    let totalMiembrosCalculado = 0;

    // Contar miembros reales
    if (miembros.padre) totalMiembrosCalculado++;
    if (miembros.madre) totalMiembrosCalculado++;
    if (miembros.hijos && Array.isArray(miembros.hijos)) {
      totalMiembrosCalculado += miembros.hijos.length;
    }
    if (miembros.otros_familiares && Array.isArray(miembros.otros_familiares)) {
      totalMiembrosCalculado += miembros.otros_familiares.length;
    }

    // Comparar con tamaño declarado
    if (familia.tamaño_familia && parseInt(familia.tamaño_familia) !== totalMiembrosCalculado) {
      result.warnings.push({
        type: ExcelValidationService.ERROR_TYPES.DATA_INTEGRITY,
        field: 'tamaño_familia',
        message: `Tamaño declarado (${familia.tamaño_familia}) no coincide con miembros contados (${totalMiembrosCalculado})`,
        family_index: index,
        severity: 'medium'
      });
    }

    // Validar que no haya identificaciones duplicadas dentro de la familia
    const identificaciones = [];
    [miembros.padre, miembros.madre, ...(miembros.hijos || []), ...(miembros.otros_familiares || [])]
      .filter(Boolean)
      .forEach(miembro => {
        if (miembro.identificacion) {
          if (identificaciones.includes(miembro.identificacion)) {
            result.errors.push({
              type: ExcelValidationService.ERROR_TYPES.DUPLICATE_RECORD,
              field: 'identificacion',
              message: `Identificación duplicada dentro de la familia: ${miembro.identificacion}`,
              family_index: index,
              severity: 'high'
            });
            result.is_valid = false;
          } else {
            identificaciones.push(miembro.identificacion);
          }
        }
      });
  }

  /**
   * Aplicar correcciones automáticas
   * @param {Object} result - Resultado de validación
   * @param {number} index - Índice de la familia
   */
  async applyAutomaticCorrections(result, index) {
    const familia = result.family;

    // Corregir nombres (capitalización)
    if (familia.apellido_familiar) {
      const originalApellido = familia.apellido_familiar;
      familia.apellido_familiar = this.capitalizeWords(familia.apellido_familiar);
      
      if (originalApellido !== familia.apellido_familiar) {
        result.corrections.push({
          field: 'apellido_familiar',
          original_value: originalApellido,
          corrected_value: familia.apellido_familiar,
          correction_type: 'capitalization',
          family_index: index
        });
      }
    }

    // Corregir teléfonos (limpiar caracteres)
    if (familia.telefono) {
      const originalTelefono = familia.telefono;
      familia.telefono = this.cleanPhoneNumber(familia.telefono);
      
      if (originalTelefono !== familia.telefono) {
        result.corrections.push({
          field: 'telefono',
          original_value: originalTelefono,
          corrected_value: familia.telefono,
          correction_type: 'phone_cleanup',
          family_index: index
        });
      }
    }

    // Corregir miembros de familia
    if (familia.miembros) {
      ['padre', 'madre'].forEach(parentType => {
        const parent = familia.miembros[parentType];
        if (parent) {
          this.applyPersonCorrections(parent, `miembros.${parentType}`, result, index);
        }
      });

      if (familia.miembros.hijos && Array.isArray(familia.miembros.hijos)) {
        familia.miembros.hijos.forEach((hijo, hijoIndex) => {
          this.applyPersonCorrections(hijo, `miembros.hijos[${hijoIndex}]`, result, index);
        });
      }
    }

    // Calcular estadísticas automáticamente
    if (!familia.estadisticas) {
      familia.estadisticas = {};
    }

    // Calcular total de miembros automáticamente
    let totalMiembros = 0;
    if (familia.miembros) {
      if (familia.miembros.padre) totalMiembros++;
      if (familia.miembros.madre) totalMiembros++;
      if (familia.miembros.hijos) totalMiembros += familia.miembros.hijos.length;
      if (familia.miembros.otros_familiares) totalMiembros += familia.miembros.otros_familiares.length;
    }

    if (familia.estadisticas.total_miembros !== totalMiembros) {
      result.corrections.push({
        field: 'estadisticas.total_miembros',
        original_value: familia.estadisticas.total_miembros,
        corrected_value: totalMiembros,
        correction_type: 'calculated_field',
        family_index: index
      });
      familia.estadisticas.total_miembros = totalMiembros;
    }
  }

  /**
   * Aplicar correcciones a una persona
   * @param {Object} person - Datos de la persona
   * @param {string} fieldPath - Ruta del campo
   * @param {Object} result - Resultado de validación
   * @param {number} familyIndex - Índice de la familia
   */
  applyPersonCorrections(person, fieldPath, result, familyIndex) {
    // Corregir nombres
    ['nombre_completo', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido'].forEach(nameField => {
      if (person[nameField]) {
        const original = person[nameField];
        person[nameField] = this.capitalizeWords(person[nameField]);
        
        if (original !== person[nameField]) {
          result.corrections.push({
            field: `${fieldPath}.${nameField}`,
            original_value: original,
            corrected_value: person[nameField],
            correction_type: 'capitalization',
            family_index: familyIndex
          });
        }
      }
    });

    // Limpiar teléfono
    if (person.telefono) {
      const original = person.telefono;
      person.telefono = this.cleanPhoneNumber(person.telefono);
      
      if (original !== person.telefono) {
        result.corrections.push({
          field: `${fieldPath}.telefono`,
          original_value: original,
          corrected_value: person.telefono,
          correction_type: 'phone_cleanup',
          family_index: familyIndex
        });
      }
    }

    // Calcular edad si falta pero hay fecha de nacimiento
    if (!person.edad && person.fecha_nacimiento) {
      const edad = this.calculateAge(person.fecha_nacimiento);
      if (edad !== null) {
        person.edad = edad;
        result.corrections.push({
          field: `${fieldPath}.edad`,
          original_value: null,
          corrected_value: edad,
          correction_type: 'calculated_age',
          family_index: familyIndex
        });
      }
    }
  }

  /**
   * Realizar validaciones globales (duplicados, integridad referencial)
   * @param {Object} validationResult - Resultado de validación global
   */
  async performGlobalValidations(validationResult) {
    console.log('🔍 Realizando validaciones globales...');

    // Identificar duplicados por identificación
    await this.identifyDuplicates(validationResult);

    // Validar integridad referencial geográfica
    await this.validateGeographicIntegrity(validationResult);

    console.log('✅ Validaciones globales completadas');
  }

  /**
   * Identificar registros duplicados
   * @param {Object} validationResult - Resultado de validación
   */
  async identifyDuplicates(validationResult) {
    const identificaciones = new Map();
    const apellidosDireccion = new Map();

    validationResult.valid_families.forEach((familia, index) => {
      // Verificar duplicados por identificación de miembros
      if (familia.miembros) {
        [familia.miembros.padre, familia.miembros.madre, ...(familia.miembros.hijos || [])]
          .filter(Boolean)
          .forEach(miembro => {
            if (miembro.identificacion) {
              if (identificaciones.has(miembro.identificacion)) {
                validationResult.warnings.push({
                  type: ExcelValidationService.ERROR_TYPES.DUPLICATE_RECORD,
                  field: 'identificacion',
                  message: `Identificación duplicada entre familias: ${miembro.identificacion}`,
                  family_index: index,
                  duplicate_family_index: identificaciones.get(miembro.identificacion),
                  severity: 'high'
                });
              } else {
                identificaciones.set(miembro.identificacion, index);
              }
            }
          });
      }

      // Verificar posibles duplicados por apellido + dirección
      const key = `${familia.apellido_familiar}_${familia.direccion_familia}`.toLowerCase();
      if (apellidosDireccion.has(key)) {
        validationResult.warnings.push({
          type: ExcelValidationService.ERROR_TYPES.DUPLICATE_RECORD,
          field: 'familia',
          message: `Posible familia duplicada (mismo apellido y dirección): ${familia.apellido_familiar}`,
          family_index: index,
          duplicate_family_index: apellidosDireccion.get(key),
          severity: 'medium'
        });
      } else {
        apellidosDireccion.set(key, index);
      }
    });
  }

  /**
   * Validar integridad geográfica global
   * @param {Object} validationResult - Resultado de validación
   */
  async validateGeographicIntegrity(validationResult) {
    // TODO: Implementar validación contra base de datos geográfica
    // Por ahora solo registramos estadísticas
    const municipios = new Set();
    const veredas = new Set();
    const sectores = new Set();

    validationResult.valid_families.forEach(familia => {
      if (familia.ubicacion) {
        if (familia.ubicacion.municipio) municipios.add(familia.ubicacion.municipio);
        if (familia.ubicacion.vereda) veredas.add(familia.ubicacion.vereda);
        if (familia.ubicacion.sector) sectores.add(familia.ubicacion.sector);
      }
    });

    console.log(`📊 Distribución geográfica: ${municipios.size} municipios, ${veredas.size} veredas, ${sectores.size} sectores`);
  }

  /**
   * Generar reporte de validación para Excel
   * @param {Object} validationResult - Resultado de validación
   * @returns {Array} Datos formateados para hoja de errores
   */
  generateValidationReport(validationResult) {
    const reportData = [];

    // Agregar errores
    validationResult.errors.forEach(error => {
      reportData.push({
        'Tipo': 'Error',
        'Severidad': error.severity,
        'Familia (Índice)': error.family_index + 1,
        'Campo': error.field,
        'Mensaje': error.message,
        'Tipo Error': error.type
      });
    });

    // Agregar advertencias
    validationResult.warnings.forEach(warning => {
      reportData.push({
        'Tipo': 'Advertencia',
        'Severidad': warning.severity,
        'Familia (Índice)': warning.family_index + 1,
        'Campo': warning.field,
        'Mensaje': warning.message,
        'Tipo Error': warning.type
      });
    });

    // Agregar correcciones aplicadas
    validationResult.corrections_applied.forEach(correction => {
      reportData.push({
        'Tipo': 'Corrección',
        'Severidad': 'info',
        'Familia (Índice)': correction.family_index + 1,
        'Campo': correction.field,
        'Mensaje': `Corregido de "${correction.original_value}" a "${correction.corrected_value}"`,
        'Tipo Error': correction.correction_type
      });
    });

    return reportData;
  }

  // Utilidades de corrección

  /**
   * Capitalizar palabras correctamente
   * @param {string} text - Texto a capitalizar
   * @returns {string} Texto capitalizado
   */
  capitalizeWords(text) {
    if (!text || typeof text !== 'string') return text;
    
    return text.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  /**
   * Limpiar número de teléfono
   * @param {string} phone - Número de teléfono
   * @returns {string} Teléfono limpio
   */
  cleanPhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') return phone;
    
    // Remover caracteres no numéricos excepto + al inicio
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si empieza con +, mantenerlo
    if (phone.startsWith('+')) {
      cleaned = '+' + cleaned.replace(/\+/g, '');
    }
    
    return cleaned;
  }

  /**
   * Calcular edad a partir de fecha de nacimiento
   * @param {string} fechaNacimiento - Fecha en formato YYYY-MM-DD
   * @returns {number|null} Edad calculada
   */
  calculateAge(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    
    try {
      const birth = new Date(fechaNacimiento);
      const today = new Date();
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age >= 0 && age <= 120 ? age : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar integridad de datos básica
   * @param {Array} data - Datos a verificar
   * @returns {Object} Resultado de verificación
   */
  async checkDataIntegrity(data) {
    try {
      console.log(`🔍 Verificando integridad de ${data.length} registros...`);

      const integrityCheck = {
        total_records: data.length,
        valid_records: 0,
        issues_found: [],
        recommendations: []
      };

      data.forEach((record, index) => {
        let hasIssues = false;

        // Verificar estructura básica
        if (!record || typeof record !== 'object') {
          integrityCheck.issues_found.push({
            index,
            type: 'invalid_structure',
            message: 'Registro no es un objeto válido'
          });
          hasIssues = true;
        }

        // Verificar campos críticos
        if (record && !record.apellido_familiar) {
          integrityCheck.issues_found.push({
            index,
            type: 'missing_critical_field',
            message: 'Falta apellido familiar'
          });
          hasIssues = true;
        }

        if (!hasIssues) {
          integrityCheck.valid_records++;
        }
      });

      // Generar recomendaciones
      if (integrityCheck.issues_found.length > 0) {
        integrityCheck.recommendations.push(
          'Revisar registros con problemas de estructura',
          'Completar campos críticos faltantes',
          'Considerar usar validación automática antes de exportar'
        );
      }

      console.log(`✅ Verificación completada: ${integrityCheck.valid_records}/${integrityCheck.total_records} registros válidos`);
      return integrityCheck;

    } catch (error) {
      console.error('❌ Error verificando integridad:', error);
      throw new Error(`Error al verificar integridad de datos: ${error.message}`);
    }
  }

  /**
   * Corregir automáticamente problemas comunes
   * @param {Array} data - Datos a corregir
   * @returns {Object} Datos corregidos y reporte de correcciones
   */
  async autoCorrectCommonIssues(data) {
    try {
      console.log(`🔧 Aplicando correcciones automáticas a ${data.length} registros...`);

      const correctionReport = {
        original_count: data.length,
        corrected_data: [],
        corrections_applied: [],
        uncorrectable_issues: []
      };

      data.forEach((record, index) => {
        const correctedRecord = { ...record };
        const recordCorrections = [];

        // Corregir nombres y apellidos
        if (correctedRecord.apellido_familiar) {
          const original = correctedRecord.apellido_familiar;
          correctedRecord.apellido_familiar = this.capitalizeWords(correctedRecord.apellido_familiar);
          
          if (original !== correctedRecord.apellido_familiar) {
            recordCorrections.push({
              field: 'apellido_familiar',
              original,
              corrected: correctedRecord.apellido_familiar,
              type: 'capitalization'
            });
          }
        }

        // Limpiar teléfonos
        if (correctedRecord.telefono) {
          const original = correctedRecord.telefono;
          correctedRecord.telefono = this.cleanPhoneNumber(correctedRecord.telefono);
          
          if (original !== correctedRecord.telefono) {
            recordCorrections.push({
              field: 'telefono',
              original,
              corrected: correctedRecord.telefono,
              type: 'phone_cleanup'
            });
          }
        }

        correctionReport.corrected_data.push(correctedRecord);
        if (recordCorrections.length > 0) {
          correctionReport.corrections_applied.push({
            record_index: index,
            corrections: recordCorrections
          });
        }
      });

      console.log(`✅ Correcciones aplicadas: ${correctionReport.corrections_applied.length} registros modificados`);
      return correctionReport;

    } catch (error) {
      console.error('❌ Error aplicando correcciones automáticas:', error);
      throw new Error(`Error al aplicar correcciones automáticas: ${error.message}`);
    }
  }
}

export default new ExcelValidationService();