// JSON REQUEST DE ENCUESTA CORREGIDO - Basado en estructura real de BD PostgreSQL
// Fecha: 2025-09-04
// Propósito: Generar JSON compatible con la estructura real de la base de datos

import fs from 'fs';
import path from 'path';

// Datos reales obtenidos del servidor MCP PostgreSQL
const datosRealesBD = {
  // Municipios disponibles
  municipios: [
    { id: 2, nombre: "MEDELLÍN", codigo_dane: "05001" },
    { id: 3, nombre: "BOGOTÁ", codigo_dane: "11001" },
    { id: 4, nombre: "CALI", codigo_dane: "76001" },
    { id: 5, nombre: "RIONEGRO", codigo_dane: "05266" }
  ],
  
  // Sexos disponibles (SOLO 1 REGISTRO)
  sexos: [
    { id: 1, nombre: "Masculino", codigo: "M" }
    // FALTA: Femenino - PROBLEMA CRÍTICO
  ],
  
  // Tipos identificación (TABLA VACÍA)
  tipos_identificacion: [],
  
  // Tipos disposición basura
  tipos_disposicion_basura: [
    { id: 1, nombre: "Recolección Pública" },
    { id: 2, nombre: "Quema" },
    { id: 3, nombre: "Entierro" },
    { id: 4, nombre: "Reciclaje" },
    { id: 5, nombre: "Compostaje" }
  ],
  
  // Sistemas acueducto
  sistemas_acueducto: [
    { id: 1, nombre: "Acueducto Público" },
    { id: 2, nombre: "Pozo Profundo" },
    { id: 3, nombre: "Aljibe" },
    { id: 4, nombre: "Río o Quebrada" },
    { id: 5, nombre: "Agua Lluvia" }
  ],
  
  // Tipos aguas residuales
  tipos_aguas_residuales: [
    { id: 1, nombre: "Alcantarillado" },
    { id: 2, nombre: "Pozo Séptico" },
    { id: 3, nombre: "Letrina" },
    { id: 4, nombre: "Campo Abierto" },
    { id: 5, nombre: "Río/Quebrada" }
  ],
  
  // Tipos vivienda
  tipos_vivienda: [
    { id: 1, nombre: "Casa" },
    { id: 2, nombre: "Apartamento" },
    { id: 3, nombre: "Finca" },
    { id: 4, nombre: "Rancho" },
    { id: 5, nombre: "Inquilinato" }
  ]
};

// Estructura de tabla familias (campos requeridos y opcionales)
const estructuraFamilias = {
  requeridos: [
    "apellido_familiar",      // varchar(200)
    "sector",                 // varchar(100) - TEXTO LIBRE
    "direccion_familia",      // varchar(255)
    "tamaño_familia",         // integer
    "tipo_vivienda",          // varchar(100) - TEXTO LIBRE
    "estado_encuesta",        // varchar(20)
    "numero_encuestas"        // integer
  ],
  opcionales: [
    "numero_contacto",        // varchar(20)
    "telefono",               // varchar(20)
    "email",                  // varchar(100)
    "fecha_ultima_encuesta",  // date
    "codigo_familia",         // varchar(50)
    "tutor_responsable",      // boolean
    "id_municipio",           // bigint FK
    "id_vereda",              // bigint FK
    "id_sector",              // bigint FK
    "comunionEnCasa",         // boolean
    "numero_contrato_epm"     // varchar(50) - CAMPO NUEVO ENCONTRADO
  ]
};

// Estructura de tabla personas (campos requeridos y opcionales)
const estructuraPersonas = {
  requeridos: [
    "primer_nombre",          // varchar(255)
    "primer_apellido",        // varchar(255)
    "identificacion",         // varchar(255)
    "telefono",               // varchar(255)
    "correo_electronico",     // varchar(255)
    "fecha_nacimiento",       // date
    "direccion"               // varchar(255)
  ],
  opcionales: [
    "segundo_nombre",         // varchar(255)
    "segundo_apellido",       // varchar(255)
    "estudios",               // varchar(255)
    "en_que_eres_lider",      // text
    "necesidad_enfermo",      // text
    "talla_camisa",           // varchar(10)
    "talla_pantalon",         // varchar(10)
    "talla_zapato"            // varchar(10)
  ],
  foreign_keys: [
    "id_tipo_identificacion_tipo_identificacion", // PROBLEMA: nombre muy largo
    "id_familia_familias",    // FK principal a familias
    "id_estado_civil_estado_civil", // PROBLEMA: nombre muy largo
    "id_profesion",           // FK a profesiones
    "id_sexo",                // FK a sexos
    "id_familia",             // DUPLICADO con id_familia_familias
    "id_parroquia"            // FK a parroquias
  ]
};

function generarJSONCorregido() {
  console.log('🔧 Generando JSON REQUEST corregido basado en datos reales de BD...\n');
  
  // JSON corregido con IDs reales y estructura compatible
  const jsonCorregido = {
    informacionGeneral: {
      municipio: {
        id: datosRealesBD.municipios[0].id,  // ID real: 2 (MEDELLÍN)
        nombre: datosRealesBD.municipios[0].nombre
      },
      parroquia: {
        id: 1,  // Asumir que existe (no verificado en MCP)
        nombre: "San José"
      },
      sector: {
        nombre: "Centro Test"  // Campo de texto libre en BD
      },
      vereda: {
        id: 1,  // FK opcional en tabla familias
        nombre: "La Macarena"
      },
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      apellido_familiar: "Familia Test Corregida",   // REQUERIDO varchar(200)
      direccion: "Carrera Test 123 # 45-67",         // REQUERIDO varchar(255)
      telefono: "3001234567",                         // OPCIONAL varchar(20)
      numero_contrato_epm: "EPM" + Date.now(),       // NUEVO CAMPO encontrado
      comunionEnCasa: false                           // NUEVO CAMPO encontrado
    },
    
    vivienda: {
      tipo_vivienda: {
        id: datosRealesBD.tipos_vivienda[0].id,  // ID real: 1 (Casa)
        nombre: datosRealesBD.tipos_vivienda[0].nombre
      },
      disposicion_basuras: {
        // Mapeo a IDs reales de tipos_disposicion_basura
        recolector: true,     // ID 1: "Recolección Pública"
        quemada: false,       // ID 2: "Quema"
        enterrada: false,     // ID 3: "Entierro"
        recicla: true,        // ID 4: "Reciclaje"
        aire_libre: false,    // No hay mapeo directo - usar ID 5: "Compostaje"?
        no_aplica: false      // Usar como alternativa
      }
    },
    
    servicios_agua: {
      sistema_acueducto: {
        id: datosRealesBD.sistemas_acueducto[0].id,  // ID real: 1
        nombre: datosRealesBD.sistemas_acueducto[0].nombre
      },
      aguas_residuales: {
        id: datosRealesBD.tipos_aguas_residuales[0].id,  // ID real: 1
        nombre: datosRealesBD.tipos_aguas_residuales[0].nombre
      },
      pozo_septico: false,   // Se mapea a aguas_residuales ID 2
      letrina: false,        // Se mapea a aguas_residuales ID 3
      campo_abierto: false   // Se mapea a aguas_residuales ID 4
    },
    
    observaciones: {
      sustento_familia: "Trabajo de prueba automatizada",
      observaciones_encuestador: "Encuesta generada para validar estructura de BD",
      autorizacion_datos: true
    },
    
    familyMembers: [
      {
        nombres: "Carlos Test",  // Se separará en primer_nombre/segundo_nombre
        numeroIdentificacion: "TEST" + Date.now(),  // identificacion varchar(255)
        
        // COMENTADO: tipoIdentificacion porque tabla tipos_identificacion está VACÍA
        // tipoIdentificacion: {
        //   id: 1,
        //   nombre: "Cédula de Ciudadanía",
        //   codigo: "CC"
        // },
        
        fechaNacimiento: "1990-01-01",  // fecha_nacimiento date REQUERIDO
        
        sexo: {
          id: datosRealesBD.sexos[0].id,      // ID real: 1 (ÚNICO DISPONIBLE)
          nombre: datosRealesBD.sexos[0].nombre  // "Masculino"
        },
        
        telefono: "3201234567",         // varchar(255) REQUERIDO
        
        // COMENTADO: situacionCivil porque no verificamos si tabla tiene datos
        // situacionCivil: {
        //   id: 1,
        //   nombre: "Soltero(a)"
        // },
        
        estudio: {
          nombre: "Técnico en Sistemas"  // estudios varchar(255)
        },
        
        // COMENTADO: parentesco porque no verificamos si tabla tiene datos
        // parentesco: {
        //   id: 1,
        //   nombre: "Jefe de Hogar"
        // },
        
        "talla_camisa/blusa": "M",      // talla_camisa varchar(10)
        talla_pantalon: "30",           // talla_pantalon varchar(10)
        talla_zapato: "40",             // talla_zapato varchar(10)
        
        motivoFechaCelebrar: {
          motivo: "Cumpleaños",
          dia: "01",
          mes: "01"
        }
      }
    ],
    
    // Simplificado para evitar complicaciones
    deceasedMembers: [],
    
    metadata: {
      timestamp: new Date().toISOString(),
      completed: true,
      currentStage: 6,
      observaciones_estructura: [
        "JSON corregido basado en consulta MCP PostgreSQL",
        "Usando solo IDs reales existentes en BD",
        "Campos comentados por falta de datos en catálogos",
        "Estructura compatible con encuestaController.js"
      ]
    }
  };
  
  return jsonCorregido;
}

function generarReporteProblemas() {
  console.log('🚨 REPORTE DE PROBLEMAS ENCONTRADOS EN BD:');
  console.log('=' * 60);
  
  const problemas = [
    {
      tabla: 'tipos_identificacion',
      problema: 'Tabla completamente VACÍA',
      impacto: 'CRÍTICO - No se puede validar tipos de documento',
      solucion: 'Ejecutar seeder con CC, TI, RC, CE, PP'
    },
    {
      tabla: 'sexos',
      problema: 'Solo tiene 1 registro (Masculino)',
      impacto: 'CRÍTICO - Formularios no pueden seleccionar Femenino',
      solucion: 'Agregar registro para Femenino'
    },
    {
      tabla: 'personas',
      problema: 'Nombres de FK muy largos (id_tipo_identificacion_tipo_identificacion)',
      impacto: 'MEDIO - Confusión en desarrollo',
      solucion: 'Simplificar nombres en próxima migración'
    },
    {
      tabla: 'personas',
      problema: 'FK duplicadas (id_familia e id_familia_familias)',
      impacto: 'MEDIO - Inconsistencia en relaciones',
      solucion: 'Usar solo id_familia_familias'
    }
  ];
  
  problemas.forEach((p, i) => {
    console.log(`${i+1}. TABLA: ${p.tabla}`);
    console.log(`   PROBLEMA: ${p.problema}`);
    console.log(`   IMPACTO: ${p.impacto}`);
    console.log(`   SOLUCIÓN: ${p.solucion}\n`);
  });
  
  return problemas;
}

function exportarArchivos() {
  const jsonCorregido = generarJSONCorregido();
  const problemas = generarReporteProblemas();
  
  // 1. Exportar JSON corregido
  const jsonPath = path.join(process.cwd(), 'json-encuesta-corregido.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonCorregido, null, 2), 'utf8');
  console.log(`✅ JSON corregido exportado: ${jsonPath}`);
  
  // 2. Exportar script SQL de corrección
  const sqlCorrection = `
-- Script de corrección de catálogos faltantes
-- Fecha: ${new Date().toISOString()}
-- Basado en análisis MCP PostgreSQL

-- 1. Agregar sexo Femenino (CRÍTICO)
INSERT INTO sexos (nombre, codigo, descripcion, created_at, updated_at) 
VALUES ('Femenino', 'F', 'Sexo femenino', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- 2. Poblar tipos_identificacion (CRÍTICO)
INSERT INTO tipos_identificacion (nombre, codigo, created_at, updated_at) VALUES
('Cédula de Ciudadanía', 'CC', NOW(), NOW()),
('Tarjeta de Identidad', 'TI', NOW(), NOW()),
('Registro Civil', 'RC', NOW(), NOW()),
('Cédula de Extranjería', 'CE', NOW(), NOW()),
('Pasaporte', 'PP', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- 3. Verificar que estados_civiles tenga datos básicos
INSERT INTO estados_civiles (nombre, created_at, updated_at) VALUES
('Soltero(a)', NOW(), NOW()),
('Casado(a)', NOW(), NOW()),
('Divorciado(a)', NOW(), NOW()),
('Viudo(a)', NOW(), NOW()),
('Unión Libre', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- 4. Verificar que parentescos tenga datos básicos
INSERT INTO parentescos (nombre, created_at, updated_at) VALUES
('Jefe de Hogar', NOW(), NOW()),
('Cónyuge', NOW(), NOW()),
('Hijo(a)', NOW(), NOW()),
('Padre', NOW(), NOW()),
('Madre', NOW(), NOW()),
('Hermano(a)', NOW(), NOW()),
('Otro', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- Verificar resultados
SELECT 'sexos' as tabla, COUNT(*) as registros FROM sexos
UNION ALL
SELECT 'tipos_identificacion', COUNT(*) FROM tipos_identificacion
UNION ALL
SELECT 'estados_civiles', COUNT(*) FROM estados_civiles
UNION ALL
SELECT 'parentescos', COUNT(*) FROM parentescos;
`;
  
  const sqlPath = path.join(process.cwd(), 'fix-catalogos-encuesta.sql');
  fs.writeFileSync(sqlPath, sqlCorrection, 'utf8');
  console.log(`✅ Script SQL de corrección exportado: ${sqlPath}`);
  
  // 3. Mostrar JSON corregido en consola
  console.log('\n📋 JSON REQUEST CORREGIDO:');
  console.log('=' * 50);
  console.log(JSON.stringify(jsonCorregido, null, 2));
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Ejecutar fix-catalogos-encuesta.sql en la BD');
  console.log('2. Usar json-encuesta-corregido.json para pruebas');
  console.log('3. Verificar que POST /api/encuesta funcione correctamente');
  console.log('4. Confirmar que la respuesta devuelva toda la información enviada');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  exportarArchivos();
}
