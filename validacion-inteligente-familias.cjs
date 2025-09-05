/**
 * CORRECCIÓN: Validación Inteligente de Familias
 * 
 * Este script implementa la lógica corregida para manejar familias
 * que pueden tener identificaciones diferentes (escenario normal)
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
 * Validación inteligente de familias
 */
async function validarFamiliaInteligente(nuevaEncuesta) {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Iniciando validación inteligente de familia...');
    console.log(`📋 Familia: ${nuevaEncuesta.apellido_familiar}`);
    console.log(`🏠 Dirección: ${nuevaEncuesta.direccion_familia}`);
    
    // 1. Buscar familia existente por apellido Y dirección (más preciso)
    const familiaExistenteQuery = `
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.direccion_familia,
        f.telefono,
        f.fecha_ultima_encuesta
      FROM familias f
      WHERE LOWER(f.apellido_familiar) = LOWER($1)
        AND LOWER(f.direccion_familia) = LOWER($2)
      LIMIT 1;
    `;
    
    const familiaResult = await client.query(familiaExistenteQuery, [
      nuevaEncuesta.apellido_familiar,
      nuevaEncuesta.direccion_familia
    ]);
    
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
        CONCAT(p.primer_nombre, ' ', COALESCE(p.segundo_nombre, ''), ' ', p.primer_apellido) as nombre_completo
      FROM personas p
      WHERE p.id_familia_familias = $1
        AND p.identificacion NOT LIKE 'FALLECIDO_%'
      ORDER BY p.id_personas;
    `;
    
    const miembrosResult = await client.query(miembrosExistentesQuery, [familiaExistente.id_familia]);
    const miembrosExistentes = miembrosResult.rows;
    
    console.log(`👥 Miembros existentes: ${miembrosExistentes.length}`);
    miembrosExistentes.forEach(m => {
      console.log(`   - ${m.numero_identificacion}: ${m.nombre_completo}`);
    });
    
    // 3. Analizar nuevos miembros
    const identificacionesExistentes = miembrosExistentes.map(m => m.numero_identificacion);
    const identificacionesNuevas = nuevaEncuesta.personas.map(p => p.numero_identificacion);
    
    console.log(`📊 Análisis de identificaciones:`);
    console.log(`   - Existentes: ${identificacionesExistentes.join(', ')}`);
    console.log(`   - En nueva encuesta: ${identificacionesNuevas.join(', ')}`);
    
    // 4. Detectar tipos de miembros
    const duplicadas = identificacionesNuevas.filter(id => identificacionesExistentes.includes(id));
    const nuevosMiembros = identificacionesNuevas.filter(id => !identificacionesExistentes.includes(id));
    
    console.log(`   - Identificaciones duplicadas: ${duplicadas.length}`);
    console.log(`   - Nuevos miembros: ${nuevosMiembros.length}`);
    
    // 5. Validar personas con identificaciones duplicadas
    const erroresPersonas = [];
    
    for (const idDuplicada of duplicadas) {
      const personaExistente = miembrosExistentes.find(m => m.numero_identificacion === idDuplicada);
      const personaNueva = nuevaEncuesta.personas.find(p => p.numero_identificacion === idDuplicada);
      
      const nombreExistente = personaExistente.nombre_completo.toLowerCase().trim();
      const nombreNuevo = `${personaNueva.nombres} ${personaNueva.apellidos}`.toLowerCase().trim();
      
      // Calcular similitud de nombres
      const similitud = calcularSimilitudNombres(nombreExistente, nombreNuevo);
      
      console.log(`🔍 Validando ${idDuplicada}:`);
      console.log(`   - Existente: "${nombreExistente}"`);
      console.log(`   - Nuevo: "${nombreNuevo}"`);
      console.log(`   - Similitud: ${(similitud * 100).toFixed(1)}%`);
      
      if (similitud < 0.7) { // Menos de 70% de similitud
        erroresPersonas.push({
          identificacion: idDuplicada,
          nombre_existente: personaExistente.nombre_completo,
          nombre_nuevo: nombreNuevo,
          similitud: similitud,
          tipo_error: 'NOMBRE_INCONSISTENTE'
        });
      }
    }
    
    // 6. Determinar resultado de validación
    if (erroresPersonas.length > 0) {
      return {
        status: 'error',
        code: 'INCONSISTENCIA_PERSONAS',
        message: 'Detectamos inconsistencias en los nombres de personas con la misma identificación',
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
        message: `Familia existente puede ser actualizada con ${nuevosMiembros.length} nuevo(s) miembro(s)`,
        data: {
          familia_existente: familiaExistente,
          miembros_existentes_confirmados: duplicadas.length,
          nuevos_miembros: nuevosMiembros,
          accion_recomendada: 'ACTUALIZAR_FAMILIA'
        }
      };
    }
    
    return {
      status: 'success',
      code: 'FAMILIA_CONFIRMADA',
      message: 'Familia confirmada con los mismos miembros, se pueden actualizar datos',
      data: {
        familia_existente: familiaExistente,
        miembros_confirmados: duplicadas.length,
        accion_recomendada: 'ACTUALIZAR_DATOS_EXISTENTES'
      }
    };
    
  } catch (error) {
    console.error('❌ Error en validación:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Función auxiliar para calcular similitud entre nombres
 */
function calcularSimilitudNombres(nombre1, nombre2) {
  const distancia = levenshteinDistance(nombre1, nombre2);
  const longitudMaxima = Math.max(nombre1.length, nombre2.length);
  return longitudMaxima === 0 ? 1 : 1 - (distancia / longitudMaxima);
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Casos de prueba
 */
async function probarValidacionInteligente() {
  console.log('🧪 INICIANDO PRUEBAS DE VALIDACIÓN INTELIGENTE\n');
  
  // CASO 1: Familia nueva con miembro adicional (VÁLIDO)
  console.log('📋 CASO 1: Familia existente con nuevo miembro (DEBE SER VÁLIDO)');
  const caso1 = {
    apellido_familiar: 'Rodríguez García',
    direccion_familia: 'Carrera 45 # 23-67',
    personas: [
      {
        numero_identificacion: '12345678',
        nombres: 'Carlos',
        apellidos: 'Rodríguez García'
      },
      {
        numero_identificacion: '11111111', // NUEVO MIEMBRO
        nombres: 'Luis',
        apellidos: 'Rodríguez García'
      }
    ]
  };
  
  try {
    const resultado1 = await validarFamiliaInteligente(caso1);
    console.log('✅ Resultado Caso 1:', resultado1);
    console.log(`   Status: ${resultado1.status}`);
    console.log(`   Code: ${resultado1.code}`);
    console.log(`   Message: ${resultado1.message}\n`);
  } catch (error) {
    console.error('❌ Error Caso 1:', error.message);
  }
  
  // CASO 2: Misma familia, mismos miembros (VÁLIDO)
  console.log('📋 CASO 2: Misma familia, mismos miembros (DEBE SER VÁLIDO)');
  const caso2 = {
    apellido_familiar: 'Rodríguez García',
    direccion_familia: 'Carrera 45 # 23-67',
    personas: [
      {
        numero_identificacion: '12345678',
        nombres: 'Carlos',
        apellidos: 'Rodríguez García'
      }
    ]
  };
  
  try {
    const resultado2 = await validarFamiliaInteligente(caso2);
    console.log('✅ Resultado Caso 2:', resultado2);
    console.log(`   Status: ${resultado2.status}`);
    console.log(`   Code: ${resultado2.code}`);
    console.log(`   Message: ${resultado2.message}\n`);
  } catch (error) {
    console.error('❌ Error Caso 2:', error.message);
  }
  
  // CASO 3: Misma identificación, nombre diferente (ERROR VÁLIDO)
  console.log('📋 CASO 3: Misma identificación, nombre MUY diferente (DEBE SER ERROR)');
  const caso3 = {
    apellido_familiar: 'Rodríguez García',
    direccion_familia: 'Carrera 45 # 23-67',
    personas: [
      {
        numero_identificacion: '12345678',
        nombres: 'María Fernanda', // NOMBRE COMPLETAMENTE DIFERENTE
        apellidos: 'González López'
      }
    ]
  };
  
  try {
    const resultado3 = await validarFamiliaInteligente(caso3);
    console.log('⚠️  Resultado Caso 3:', resultado3);
    console.log(`   Status: ${resultado3.status}`);
    console.log(`   Code: ${resultado3.code}`);
    console.log(`   Message: ${resultado3.message}\n`);
  } catch (error) {
    console.error('❌ Error Caso 3:', error.message);
  }
  
  console.log('🎉 ¡PRUEBAS DE VALIDACIÓN INTELIGENTE COMPLETADAS!');
}

// Ejecutar pruebas
if (require.main === module) {
  probarValidacionInteligente()
    .then(() => {
      console.log('\n✨ Pruebas completadas. Cerrando conexión...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en pruebas:', error.message);
      process.exit(1);
    });
}

module.exports = { validarFamiliaInteligente, calcularSimilitudNombres };
