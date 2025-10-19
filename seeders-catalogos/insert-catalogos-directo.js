/**
 * Script para insertar catálogos directamente en la BD remota
 * Usa la estructura real de las tablas
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: false
});

async function insertarCatalogos() {
  try {
    console.log('🌱 INSERTANDO CATÁLOGOS EN BASE DE DATOS REMOTA');
    console.log('='.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    let totalInsertados = 0;

    // 1. TIPOS DE IDENTIFICACIÓN
    console.log('📝 Insertando tipos de identificación...');
    await sequelize.query(`
      INSERT INTO tipos_identificacion (nombre, codigo, descripcion, created_at, updated_at)
      VALUES
        ('Cédula de Ciudadanía', 'CC', 'Documento de identificación para ciudadanos colombianos mayores de edad', NOW(), NOW()),
        ('Tarjeta de Identidad', 'TI', 'Documento de identificación para menores de edad', NOW(), NOW()),
        ('Cédula de Extranjería', 'CE', 'Documento de identificación para extranjeros residentes', NOW(), NOW()),
        ('Pasaporte', 'PA', 'Documento de identificación internacional', NOW(), NOW()),
        ('NIT', 'NIT', 'Número de Identificación Tributaria', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 5 tipos de identificación\n');
    totalInsertados += 5;

    // 2. ESTADOS CIVILES
    console.log('📝 Insertando estados civiles...');
    await sequelize.query(`
      INSERT INTO estados_civiles (descripcion, activo, created_at, updated_at)
      VALUES
        ('Soltero(a)', true, NOW(), NOW()),
        ('Casado(a)', true, NOW(), NOW()),
        ('Divorciado(a)', true, NOW(), NOW()),
        ('Viudo(a)', true, NOW(), NOW()),
        ('Unión Libre', true, NOW(), NOW()),
        ('Separado(a)', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 6 estados civiles\n');
    totalInsertados += 6;

    // 3. TIPOS DE VIVIENDA
    console.log('📝 Insertando tipos de vivienda...');
    await sequelize.query(`
      INSERT INTO tipos_vivienda (nombre, descripcion, activo, created_at, updated_at)
      VALUES
        ('Casa', 'Vivienda unifamiliar independiente', true, NOW(), NOW()),
        ('Apartamento', 'Vivienda en edificio multifamiliar', true, NOW(), NOW()),
        ('Finca', 'Vivienda rural con terreno', true, NOW(), NOW()),
        ('Rancho', 'Vivienda rural básica', true, NOW(), NOW()),
        ('Cuarto', 'Habitación en vivienda compartida', true, NOW(), NOW()),
        ('Inquilinato', 'Vivienda multifamiliar con servicios compartidos', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 6 tipos de vivienda\n');
    totalInsertados += 6;

    // 4. SISTEMAS DE ACUEDUCTO
    console.log('📝 Insertando sistemas de acueducto...');
    await sequelize.query(`
      INSERT INTO sistemas_acueducto (nombre, descripcion, created_at, updated_at)
      VALUES
        ('Acueducto Público', 'Sistema de acueducto municipal o departamental', NOW(), NOW()),
        ('Pozo Propio', 'Pozo de agua subterránea privado', NOW(), NOW()),
        ('Aljibe', 'Depósito de agua de lluvia', NOW(), NOW()),
        ('Río o Quebrada', 'Toma directa de fuente natural', NOW(), NOW()),
        ('Carrotanque', 'Suministro por vehículo cisterna', NOW(), NOW()),
        ('Nacimiento', 'Manantial o nacedero', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 6 sistemas de acueducto\n');
    totalInsertados += 6;

    // 5. TIPOS DE AGUAS RESIDUALES
    console.log('📝 Insertando tipos de aguas residuales...');
    await sequelize.query(`
      INSERT INTO tipos_aguas_residuales (nombre, descripcion, created_at, updated_at)
      VALUES
        ('Alcantarillado Público', 'Conexión al sistema de alcantarillado municipal', NOW(), NOW()),
        ('Pozo Séptico', 'Sistema de tratamiento individual', NOW(), NOW()),
        ('Letrina', 'Sistema básico de saneamiento', NOW(), NOW()),
        ('Campo Abierto', 'Sin sistema de tratamiento', NOW(), NOW()),
        ('Río o Quebrada', 'Descarga directa a fuente hídrica', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 5 tipos de aguas residuales\n');
    totalInsertados += 5;

    // 6. TIPOS DE DISPOSICIÓN DE BASURA
    console.log('📝 Insertando tipos de disposición de basura...');
    await sequelize.query(`
      INSERT INTO tipos_disposicion_basura (nombre, descripcion, created_at, updated_at)
      VALUES
        ('Recolección Pública', 'Servicio de recolección municipal', NOW(), NOW()),
        ('Quema', 'Incineración de residuos', NOW(), NOW()),
        ('Entierro', 'Enterramiento de residuos', NOW(), NOW()),
        ('Río o Quebrada', 'Disposición en fuente hídrica', NOW(), NOW()),
        ('Campo Abierto', 'Disposición al aire libre', NOW(), NOW()),
        ('Reciclaje', 'Separación y reciclaje de materiales', NOW(), NOW()),
        ('Compostaje', 'Compostaje de residuos orgánicos', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 7 tipos de disposición de basura\n');
    totalInsertados += 7;

    // 7. SEXOS
    console.log('📝 Insertando sexos...');
    await sequelize.query(`
      INSERT INTO sexos (nombre, descripcion, created_at, updated_at)
      VALUES
        ('Masculino', 'Sexo masculino', NOW(), NOW()),
        ('Femenino', 'Sexo femenino', NOW(), NOW()),
        ('Otro', 'Otro sexo o no especificado', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 3 sexos\n');
    totalInsertados += 3;

    // 8. PROFESIONES
    console.log('📝 Insertando profesiones...');
    await sequelize.query(`
      INSERT INTO profesiones (nombre, descripcion, created_at, updated_at)
      VALUES
        ('Agricultor', 'Persona dedicada a la agricultura', NOW(), NOW()),
        ('Ganadero', 'Persona dedicada a la ganadería', NOW(), NOW()),
        ('Comerciante', 'Persona dedicada al comercio', NOW(), NOW()),
        ('Docente', 'Profesional de la educación', NOW(), NOW()),
        ('Enfermero/a', 'Profesional de la salud', NOW(), NOW()),
        ('Mecánico', 'Técnico en mecánica', NOW(), NOW()),
        ('Carpintero', 'Artesano de la madera', NOW(), NOW()),
        ('Electricista', 'Técnico en electricidad', NOW(), NOW()),
        ('Albañil', 'Trabajador de la construcción', NOW(), NOW()),
        ('Conductor', 'Conductor de vehículos', NOW(), NOW()),
        ('Cocinero/a', 'Profesional de la cocina', NOW(), NOW()),
        ('Empleado Doméstico', 'Trabajador del hogar', NOW(), NOW()),
        ('Estudiante', 'Persona en proceso de formación', NOW(), NOW()),
        ('Pensionado', 'Persona jubilada', NOW(), NOW()),
        ('Ama de Casa', 'Persona dedicada al hogar', NOW(), NOW()),
        ('Desempleado', 'Sin ocupación laboral actual', NOW(), NOW()),
        ('Trabajador Independiente', 'Trabajador por cuenta propia', NOW(), NOW()),
        ('Técnico en Sistemas', 'Profesional en tecnología', NOW(), NOW()),
        ('Vendedor', 'Persona dedicada a las ventas', NOW(), NOW()),
        ('Otros', 'Otras profesiones no especificadas', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 20 profesiones\n');
    totalInsertados += 20;

    // Verificar totales
    console.log('='.repeat(80));
    console.log('📊 VERIFICANDO DATOS INSERTADOS:\n');

    const tablas = [
      'tipos_identificacion',
      'estados_civiles',
      'tipos_vivienda',
      'sistemas_acueducto',
      'tipos_aguas_residuales',
      'tipos_disposicion_basura',
      'sexos',
      'profesiones',
      'destrezas',
      'enfermedades',
      'roles'
    ];

    for (const tabla of tablas) {
      const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla};`);
      const count = parseInt(result[0].count);
      const icon = count > 0 ? '✅' : '⚠️';
      console.log(`${icon} ${tabla.padEnd(35)}: ${count} registros`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ CATÁLOGOS INSERTADOS EXITOSAMENTE');
    console.log(`📊 Total de registros insertados: ${totalInsertados}`);
    console.log('='.repeat(80));

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original);
    }
    process.exit(1);
  }
}

insertarCatalogos();
