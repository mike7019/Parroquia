/**
 * CORRECCIÓN MEJORADA: Validación Inteligente de Familias V2
 * 
 * Versión mejorada que maneja mejor las variaciones de nombres
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Normalizar nombres para comparación más efectiva
 */
function normalizarNombre(nombre) {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e') 
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n');
}

/**
 * Extraer palabras clave del nombre (sin duplicados)
 */
function extraerPalabrasClave(nombre) {
  const palabras = normalizarNombre(nombre).split(' ');
  return [...new Set(palabras)].filter(p => p.length > 2); // Solo palabras de más de 2 caracteres
}

/**
 * Calcular similitud basada en palabras comunes
 */
function calcularSimilitudPorPalabras(nombre1, nombre2) {
  const palabras1 = extraerPalabrasClave(nombre1);
  const palabras2 = extraerPalabrasClave(nombre2);
  
  if (palabras1.length === 0 && palabras2.length === 0) return 1;
  if (palabras1.length === 0 || palabras2.length === 0) return 0;
  
  const palabrasComunes = palabras1.filter(p => palabras2.includes(p));
  const totalPalabras = new Set([...palabras1, ...palabras2]).size;
  
  return palabrasComunes.length / totalPalabras;
}

/**
 * Validación inteligente mejorada
 */
async function validarFamiliaInteligenteMejorada(nuevaEncuesta) {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Iniciando validación inteligente MEJORADA...');
    console.log(`📋 Familia: ${nuevaEncuesta.apellido_familiar}`);
    
    // 1. Buscar familia existente por apellido (más flexible)
    const familiaExistenteQuery = `
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.direccion_familia,
        f.telefono
      FROM familias f
      WHERE LOWER(f.apellido_familiar) = LOWER($1)
      LIMIT 1;
    `;
    
    const familiaResult = await client.query(familiaExistenteQuery, [nuevaEncuesta.apellido_familiar]);
    
    if (familiaResult.rows.length === 0) {
      return {
        status: 'success',
        code: 'FAMILIA_NUEVA',
        message: 'Familia nueva, puede ser creada',
        data: { accion_recomendada: 'CREAR_NUEVA_FAMILIA' }
      };
    }
    
    const familiaExistente = familiaResult.rows[0];
    console.log(`✅ Familia existente encontrada: ID ${familiaExistente.id_familia}`);
    
    // 2. Obtener miembros existentes
    const miembrosExistentesQuery = `
      SELECT 
        p.id_personas,
        p.identificacion as numero_identificacion,
        p.primer_nombre,
        p.segundo_nombre,
        p.primer_apellido,
        p.segundo_apellido
      FROM personas p
      WHERE p.id_familia_familias = $1
        AND p.identificacion NOT LIKE 'FALLECIDO_%'
        AND p.identificacion IS NOT NULL
      ORDER BY p.id_personas;
    `;
    
    const miembrosResult = await client.query(miembrosExistentesQuery, [familiaExistente.id_familia]);
    const miembrosExistentes = miembrosResult.rows.map(m => ({
      ...m,
      nombre_completo: `${m.primer_nombre || ''} ${m.segundo_nombre || ''} ${m.primer_apellido || ''} ${m.segundo_apellido || ''}`.trim()
    }));
    
    console.log(`👥 Miembros existentes: ${miembrosExistentes.length}`);
    miembrosExistentes.forEach(m => {
      console.log(`   - ${m.numero_identificacion}: ${m.nombre_completo}`);
    });
    
    // 3. Analizar miembros
    const identificacionesExistentes = miembrosExistentes.map(m => m.numero_identificacion);
    const identificacionesNuevas = nuevaEncuesta.personas.map(p => p.numero_identificacion);
    
    const duplicadas = identificacionesNuevas.filter(id => identificacionesExistentes.includes(id));
    const nuevosMiembros = identificacionesNuevas.filter(id => !identificacionesExistentes.includes(id));
    
    console.log(`📊 Análisis:`);
    console.log(`   - Duplicadas: ${duplicadas.length}`);
    console.log(`   - Nuevos: ${nuevosMiembros.length}`);
    
    // 4. Validar personas duplicadas con algoritmo mejorado
    const erroresPersonas = [];
    
    for (const idDuplicada of duplicadas) {
      const personaExistente = miembrosExistentes.find(m => m.numero_identificacion === idDuplicada);
      const personaNueva = nuevaEncuesta.personas.find(p => p.numero_identificacion === idDuplicada);
      
      const nombreExistente = personaExistente.nombre_completo;
      const nombreNuevo = `${personaNueva.nombres} ${personaNueva.apellidos}`;
      
      // Usar algoritmo de similitud por palabras (más flexible)
      const similitudPalabras = calcularSimilitudPorPalabras(nombreExistente, nombreNuevo);
      
      console.log(`🔍 Validando ${idDuplicada}:`);
      console.log(`   - Existente: "${nombreExistente}"`);
      console.log(`   - Nuevo: "${nombreNuevo}"`);
      console.log(`   - Similitud por palabras: ${(similitudPalabras * 100).toFixed(1)}%`);
      
      // Extraer palabras para análisis
      const palabrasExistente = extraerPalabrasClave(nombreExistente);
      const palabrasNueva = extraerPalabrasClave(nombreNuevo);
      console.log(`   - Palabras existente: [${palabrasExistente.join(', ')}]`);
      console.log(`   - Palabras nueva: [${palabrasNueva.join(', ')}]`);
      
      // Criterio más inteligente: al menos 40% de similitud en palabras
      if (similitudPalabras < 0.4) {
        erroresPersonas.push({
          identificacion: idDuplicada,
          nombre_existente: nombreExistente,
          nombre_nuevo: nombreNuevo,
          similitud_palabras: similitudPalabras,
          tipo_error: 'NOMBRE_INCONSISTENTE'
        });
      }
    }
    
    // 5. Determinar resultado
    if (erroresPersonas.length > 0) {
      return {
        status: 'error',
        code: 'INCONSISTENCIA_PERSONAS',
        message: `Detectamos ${erroresPersonas.length} inconsistencia(s) en nombres con la misma identificación`,
        data: {
          familia_existente: familiaExistente,
          errores: erroresPersonas,
          sugerencia: 'Verificar si las identificaciones o nombres fueron ingresados correctamente'
        }
      };
    }
    
    if (nuevosMiembros.length > 0) {
      return {
        status: 'success',
        code: 'FAMILIA_ACTUALIZABLE',
        message: `✅ Familia puede ser actualizada con ${nuevosMiembros.length} nuevo(s) miembro(s)`,
        data: {
          familia_existente: familiaExistente,
          miembros_confirmados: duplicadas.length,
          nuevos_miembros: nuevosMiembros,
          accion_recomendada: 'ACTUALIZAR_FAMILIA'
        }
      };
    }
    
    return {
      status: 'success',
      code: 'FAMILIA_CONFIRMADA', 
      message: '✅ Familia confirmada, se pueden actualizar datos existentes',
      data: {
        familia_existente: familiaExistente,
        miembros_confirmados: duplicadas.length,
        accion_recomendada: 'ACTUALIZAR_DATOS_EXISTENTES'
      }
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Casos de prueba mejorados
 */
async function probarValidacionMejorada() {
  console.log('🧪 INICIANDO PRUEBAS DE VALIDACIÓN MEJORADA\n');
  
  // CASO 1: Mismo Carlos con variaciones de nombre (DEBE SER VÁLIDO)
  console.log('📋 CASO 1: Mismo Carlos con variaciones de nombre (DEBE SER VÁLIDO)');
  const caso1 = {
    apellido_familiar: 'Rodríguez García',
    personas: [
      {
        numero_identificacion: '12345678',
        nombres: 'Carlos Andrés',
        apellidos: 'Rodríguez García'
      }
    ]
  };
  
  try {
    const resultado1 = await validarFamiliaInteligenteMejorada(caso1);
    console.log('✅ Resultado Caso 1:');
    console.log(`   Status: ${resultado1.status}`);
    console.log(`   Code: ${resultado1.code}`);
    console.log(`   Message: ${resultado1.message}\n`);
  } catch (error) {
    console.error('❌ Error Caso 1:', error.message);
  }
  
  // CASO 2: Agregar nuevo miembro a familia existente (DEBE SER VÁLIDO)
  console.log('📋 CASO 2: Familia + nuevo miembro (DEBE SER VÁLIDO)');
  const caso2 = {
    apellido_familiar: 'Rodríguez García',
    personas: [
      {
        numero_identificacion: '12345678',
        nombres: 'Carlos',
        apellidos: 'Rodríguez García'
      },
      {
        numero_identificacion: '99999999', // NUEVO MIEMBRO
        nombres: 'Ana María',
        apellidos: 'Rodríguez García'
      }
    ]
  };
  
  try {
    const resultado2 = await validarFamiliaInteligenteMejorada(caso2);
    console.log('✅ Resultado Caso 2:');
    console.log(`   Status: ${resultado2.status}`);
    console.log(`   Code: ${resultado2.code}`);
    console.log(`   Message: ${resultado2.message}\n`);
  } catch (error) {
    console.error('❌ Error Caso 2:', error.message);
  }
  
  // CASO 3: Nombre completamente diferente (DEBE SER ERROR)
  console.log('📋 CASO 3: Nombre completamente diferente (DEBE SER ERROR)');
  const caso3 = {
    apellido_familiar: 'Rodríguez García',
    personas: [
      {
        numero_identificacion: '12345678',
        nombres: 'María Fernanda',
        apellidos: 'González López'
      }
    ]
  };
  
  try {
    const resultado3 = await validarFamiliaInteligenteMejorada(caso3);
    console.log('⚠️  Resultado Caso 3:');
    console.log(`   Status: ${resultado3.status}`);
    console.log(`   Code: ${resultado3.code}`);
    console.log(`   Message: ${resultado3.message}\n`);
  } catch (error) {
    console.error('❌ Error Caso 3:', error.message);
  }
  
  console.log('🎉 ¡PRUEBAS DE VALIDACIÓN MEJORADA COMPLETADAS!');
}

// Ejecutar pruebas
if (require.main === module) {
  probarValidacionMejorada()
    .then(() => {
      console.log('\n✨ Pruebas completadas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { 
  validarFamiliaInteligenteMejorada, 
  calcularSimilitudPorPalabras,
  normalizarNombre,
  extraerPalabrasClave 
};
