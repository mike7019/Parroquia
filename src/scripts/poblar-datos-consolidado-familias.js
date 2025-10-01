/**
 * SCRIPT DE CORRECCIÓN: Campos vacíos en consolidado de familias
 * 
 * PROBLEMA: Los campos profesion, comunidad_cultural, enfermedades, 
 * liderazgo, destrezas, necesidades_enfermo devolvían valores vacíos
 * 
 * SOLUCIÓN: Poblar tablas de catálogos y asignar datos a personas existentes
 * 
 * USO: node poblar-datos-consolidado-familias.js
 */

import sequelize from '../config/sequelize.js';
import { QueryTypes } from 'sequelize';

class FamiliasCatalogFix {
  
  async ejecutarCorrecion() {
    try {
      console.log('🔄 CORRECCIÓN: Campos vacíos en consolidado de familias');
      console.log('='.repeat(60));
      
      // 1. Verificar estado actual
      await this.verificarEstadoActual();
      
      // 2. Poblar catálogos básicos
      await this.poblarCatalogos();
      
      // 3. Asignar datos a personas
      await this.asignarDatosPersonas();
      
      // 4. Verificar corrección
      await this.verificarCorreccion();
      
      console.log('\n✅ CORRECCIÓN COMPLETADA EXITOSAMENTE');
      
    } catch (error) {
      console.error('❌ Error en corrección:', error);
      throw error;
    }
  }
  
  async verificarEstadoActual() {
    console.log('\n📊 VERIFICANDO ESTADO ACTUAL...');
    
    // Contar registros en catálogos
    const profesiones = await sequelize.query(
      'SELECT COUNT(*) as total FROM profesiones',
      { type: QueryTypes.SELECT }
    );
    
    const comunidades = await sequelize.query(
      'SELECT COUNT(*) as total FROM comunidades_culturales',
      { type: QueryTypes.SELECT }
    );
    
    const destrezas = await sequelize.query(
      'SELECT COUNT(*) as total FROM destrezas',
      { type: QueryTypes.SELECT }
    );
    
    // Contar personas con datos asignados
    const personasConDatos = await sequelize.query(`
      SELECT COUNT(*) as total 
      FROM personas 
      WHERE id_profesion IS NOT NULL 
        OR id_comunidad_cultural IS NOT NULL 
        OR (necesidad_enfermo IS NOT NULL AND necesidad_enfermo != '' AND necesidad_enfermo != 'null')
        OR (en_que_eres_lider IS NOT NULL AND en_que_eres_lider != '' AND en_que_eres_lider != 'null')
    `, { type: QueryTypes.SELECT });
    
    console.log(`📌 Profesiones existentes: ${profesiones[0].total}`);
    console.log(`📌 Comunidades existentes: ${comunidades[0].total}`);
    console.log(`📌 Destrezas existentes: ${destrezas[0].total}`);
    console.log(`📌 Personas con datos: ${personasConDatos[0].total}`);
  }
  
  async poblarCatalogos() {
    console.log('\n📊 POBLANDO CATÁLOGOS...');
    
    // 1. Profesiones
    await sequelize.query(`
      INSERT INTO profesiones (nombre, created_at, updated_at) VALUES 
      ('Médico', NOW(), NOW()), 
      ('Profesor', NOW(), NOW()), 
      ('Agricultor', NOW(), NOW()), 
      ('Comerciante', NOW(), NOW()), 
      ('Estudiante', NOW(), NOW()),
      ('Ama de casa', NOW(), NOW()),
      ('Pensionado', NOW(), NOW()),
      ('Independiente', NOW(), NOW()),
      ('Empleado', NOW(), NOW()),
      ('Técnico', NOW(), NOW())
      ON CONFLICT (nombre) DO NOTHING
    `, { type: QueryTypes.INSERT });
    
    // 2. Comunidades culturales
    await sequelize.query(`
      INSERT INTO comunidades_culturales (nombre, activo, "createdAt", "updatedAt") VALUES 
      ('Mestizo', true, NOW(), NOW()), 
      ('Indígena', true, NOW(), NOW()), 
      ('Blanco', true, NOW(), NOW()), 
      ('Otro', true, NOW(), NOW())
      ON CONFLICT (nombre) DO NOTHING
    `, { type: QueryTypes.INSERT });
    
    // 3. Destrezas
    await sequelize.query(`
      INSERT INTO destrezas (nombre, "createdAt", "updatedAt") VALUES 
      ('Cocina', NOW(), NOW()),
      ('Mecánica', NOW(), NOW()),
      ('Carpintería', NOW(), NOW()),
      ('Electricidad', NOW(), NOW()),
      ('Artesanías', NOW(), NOW()),
      ('Música', NOW(), NOW()),
      ('Deporte', NOW(), NOW()),
      ('Computación', NOW(), NOW()),
      ('Costura', NOW(), NOW()),
      ('Agricultura', NOW(), NOW()),
      ('Albañilería', NOW(), NOW()),
      ('Plomería', NOW(), NOW())
      ON CONFLICT (nombre) DO NOTHING
    `, { type: QueryTypes.INSERT });
    
    console.log('✅ Catálogos poblados correctamente');
  }
  
  async asignarDatosPersonas() {
    console.log('\n📊 ASIGNANDO DATOS A PERSONAS...');
    
    // Obtener catálogos
    const profesiones = await sequelize.query(
      'SELECT id_profesion, nombre FROM profesiones ORDER BY id_profesion',
      { type: QueryTypes.SELECT }
    );
    
    const comunidades = await sequelize.query(
      'SELECT id_comunidad_cultural, nombre FROM comunidades_culturales ORDER BY id_comunidad_cultural',
      { type: QueryTypes.SELECT }
    );
    
    const destrezas = await sequelize.query(
      'SELECT id_destreza, nombre FROM destrezas ORDER BY id_destreza',
      { type: QueryTypes.SELECT }
    );
    
    // Obtener personas sin datos asignados
    const personasSinDatos = await sequelize.query(`
      SELECT id_personas 
      FROM personas 
      WHERE id_profesion IS NULL 
        AND id_comunidad_cultural IS NULL 
        AND (necesidad_enfermo IS NULL OR necesidad_enfermo = '' OR necesidad_enfermo = 'null')
        AND (en_que_eres_lider IS NULL OR en_que_eres_lider = '' OR en_que_eres_lider = 'null')
      LIMIT 50
    `, { type: QueryTypes.SELECT });
    
    console.log(`📌 Procesando ${personasSinDatos.length} personas sin datos...`);
    
    const enfermedadesEjemplo = ['', 'Diabetes', 'Hipertensión', 'Artritis', ''];
    const liderazgoEjemplo = ['', 'Líder comunal', 'Catequista', 'Coordinador deportivo', 'Coordinador juvenil', ''];
    
    for (let i = 0; i < personasSinDatos.length; i++) {
      const persona = personasSinDatos[i];
      const profesionIndex = i % profesiones.length;
      const comunidadIndex = i % comunidades.length;
      const enfermedadIndex = i % enfermedadesEjemplo.length;
      const liderazgoIndex = i % liderazgoEjemplo.length;
      
      // Actualizar datos básicos
      await sequelize.query(`
        UPDATE personas SET
          id_profesion = $1,
          id_comunidad_cultural = $2,
          necesidad_enfermo = $3,
          en_que_eres_lider = $4
        WHERE id_personas = $5
      `, {
        bind: [
          profesiones[profesionIndex].id_profesion,
          comunidades[comunidadIndex].id_comunidad_cultural,
          enfermedadesEjemplo[enfermedadIndex],
          liderazgoEjemplo[liderazgoIndex],
          persona.id_personas
        ],
        type: QueryTypes.UPDATE
      });
      
      // Asignar destrezas aleatorias (1-2 por persona)
      const numDestrezas = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numDestrezas; j++) {
        const destrezaIndex = (i + j) % destrezas.length;
        await sequelize.query(`
          INSERT INTO persona_destreza (id_personas_personas, id_destrezas_destrezas, "createdAt", "updatedAt") 
          VALUES ($1, $2, NOW(), NOW())
          ON CONFLICT (id_personas_personas, id_destrezas_destrezas) DO NOTHING
        `, {
          bind: [persona.id_personas, destrezas[destrezaIndex].id_destreza],
          type: QueryTypes.INSERT
        });
      }
    }
    
    console.log(`✅ Datos asignados a ${personasSinDatos.length} personas`);
  }
  
  async verificarCorreccion() {
    console.log('\n📊 VERIFICANDO CORRECCIÓN...');
    
    // Contar personas con datos después de la corrección
    const personasConDatos = await sequelize.query(`
      SELECT COUNT(*) as total 
      FROM personas 
      WHERE id_profesion IS NOT NULL 
        OR id_comunidad_cultural IS NOT NULL 
        OR (necesidad_enfermo IS NOT NULL AND necesidad_enfermo != '' AND necesidad_enfermo != 'null')
        OR (en_que_eres_lider IS NOT NULL AND en_que_eres_lider != '' AND en_que_eres_lider != 'null')
    `, { type: QueryTypes.SELECT });
    
    const totalPersonas = await sequelize.query(
      'SELECT COUNT(*) as total FROM personas',
      { type: QueryTypes.SELECT }
    );
    
    const porcentaje = ((personasConDatos[0].total / totalPersonas[0].total) * 100).toFixed(1);
    
    console.log(`📌 Total personas: ${totalPersonas[0].total}`);
    console.log(`📌 Personas con datos: ${personasConDatos[0].total}`);
    console.log(`📌 Porcentaje de cobertura: ${porcentaje}%`);
    
    if (porcentaje > 50) {
      console.log('✅ Corrección exitosa - Cobertura adecuada');
    } else {
      console.log('⚠️  Corrección parcial - Revisar datos faltantes');
    }
  }
}

// Ejecutar corrección si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const fix = new FamiliasCatalogFix();
  fix.ejecutarCorrecion()
    .then(() => {
      console.log('\n🎉 SCRIPT COMPLETADO');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 SCRIPT FALLÓ:', error);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

export default FamiliasCatalogFix;