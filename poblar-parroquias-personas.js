import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function poblarParroquiasPersonas() {
  try {
    console.log('🔍 POBLAR PARROQUIAS EN PERSONAS\n');
    console.log('='.repeat(80));

    // 1. Verificar parroquias disponibles
    const parroquias = await sequelize.query(`
      SELECT id_parroquia, nombre, direccion, telefono
      FROM parroquia 
      ORDER BY id_parroquia
    `, { type: QueryTypes.SELECT });

    console.log('\n📋 PARROQUIAS DISPONIBLES:');
    if (parroquias.length === 0) {
      console.log('   ⚠️  No hay parroquias registradas en la base de datos');
      console.log('   Por favor, primero crea parroquias antes de asignarlas a personas');
      await sequelize.close();
      rl.close();
      return;
    }

    parroquias.forEach((p, i) => {
      console.log(`   ${i + 1}. [ID: ${p.id_parroquia}] ${p.nombre}`);
      if (p.direccion) console.log(`      📍 ${p.direccion}`);
      if (p.telefono) console.log(`      📞 ${p.telefono}`);
    });

    // 2. Verificar personas sin parroquia
    const [sinParroquia] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas
      WHERE id_parroquia IS NULL
    `, { type: QueryTypes.SELECT });

    console.log(`\n👥 PERSONAS SIN PARROQUIA ASIGNADA: ${sinParroquia.total}`);

    if (sinParroquia.total === 0) {
      console.log('   ✅ Todas las personas ya tienen parroquia asignada');
      await sequelize.close();
      rl.close();
      return;
    }

    // 3. Mostrar personas sin parroquia
    const personasSinParroquia = await sequelize.query(`
      SELECT 
        p.id_personas,
        CONCAT(p.primer_nombre, ' ', p.primer_apellido) as nombre,
        p.identificacion,
        f.apellido_familiar,
        m.nombre_municipio,
        s.nombre as sector
      FROM personas p
      LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      WHERE p.id_parroquia IS NULL
      ORDER BY p.id_personas
    `, { type: QueryTypes.SELECT });

    console.log('\n📝 PERSONAS SIN PARROQUIA:');
    personasSinParroquia.forEach((p, i) => {
      console.log(`   ${i + 1}. [ID: ${p.id_personas}] ${p.nombre}`);
      console.log(`      Documento: ${p.identificacion || 'No especificado'}`);
      console.log(`      Familia: ${p.apellido_familiar || 'No especificada'}`);
      console.log(`      Municipio: ${p.nombre_municipio || 'No especificado'}`);
      console.log(`      Sector: ${p.sector || 'No especificado'}`);
    });

    // 4. Opciones de asignación
    console.log('\n📌 OPCIONES DE ASIGNACIÓN:');
    console.log('   1. Asignar TODAS las personas a una misma parroquia');
    console.log('   2. Asignar personas por municipio (automático)');
    console.log('   3. Asignar aleatoriamente entre parroquias disponibles');
    console.log('   4. Salir sin hacer cambios');

    const opcion = await pregunta('\n¿Qué opción deseas? (1-4): ');

    switch(opcion.trim()) {
      case '1':
        await asignarTodasMismaParroquia(parroquias, sinParroquia.total);
        break;
      case '2':
        await asignarPorMunicipio(parroquias);
        break;
      case '3':
        await asignarAleatoriamente(parroquias, sinParroquia.total);
        break;
      case '4':
        console.log('\n👋 Saliendo sin hacer cambios...');
        break;
      default:
        console.log('\n❌ Opción no válida');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    rl.close();
  }
}

async function asignarTodasMismaParroquia(parroquias, total) {
  console.log('\n🎯 ASIGNAR TODAS A UNA MISMA PARROQUIA');
  console.log('\nParroquias disponibles:');
  parroquias.forEach((p, i) => {
    console.log(`   ${i + 1}. [ID: ${p.id_parroquia}] ${p.nombre}`);
  });

  const seleccion = await pregunta('\n¿Qué parroquia deseas asignar? (número): ');
  const indice = parseInt(seleccion) - 1;

  if (indice < 0 || indice >= parroquias.length) {
    console.log('❌ Selección inválida');
    return;
  }

  const parroquiaSeleccionada = parroquias[indice];
  
  const confirmacion = await pregunta(
    `\n⚠️  ¿Confirmas asignar TODAS las ${total} personas a "${parroquiaSeleccionada.nombre}"? (s/n): `
  );

  if (confirmacion.toLowerCase() !== 's') {
    console.log('❌ Operación cancelada');
    return;
  }

  console.log('\n🔄 Actualizando...');

  const [resultado] = await sequelize.query(`
    UPDATE personas 
    SET id_parroquia = :id_parroquia
    WHERE id_parroquia IS NULL
  `, {
    replacements: { id_parroquia: parroquiaSeleccionada.id_parroquia },
    type: QueryTypes.UPDATE
  });

  console.log(`✅ ${resultado} personas actualizadas con parroquia "${parroquiaSeleccionada.nombre}"`);
  
  await verificarAsignacion();
}

async function asignarPorMunicipio(parroquias) {
  console.log('\n🏙️  ASIGNAR POR MUNICIPIO');
  
  // Obtener municipios con personas sin parroquia
  const municipios = await sequelize.query(`
    SELECT DISTINCT 
      m.id_municipio,
      m.nombre_municipio,
      COUNT(p.id_personas) as total_personas
    FROM personas p
    LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
    LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
    WHERE p.id_parroquia IS NULL
    GROUP BY m.id_municipio, m.nombre_municipio
    ORDER BY m.nombre_municipio
  `, { type: QueryTypes.SELECT });

  console.log('\nMunicipios con personas sin parroquia:');
  municipios.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.nombre_municipio || 'Sin municipio'}: ${m.total_personas} personas`);
  });

  console.log('\nAsigna una parroquia para cada municipio:');
  console.log('Parroquias disponibles:');
  parroquias.forEach((p, i) => {
    console.log(`   ${i + 1}. [ID: ${p.id_parroquia}] ${p.nombre}`);
  });

  for (const municipio of municipios) {
    const seleccion = await pregunta(
      `\n¿Qué parroquia para "${municipio.nombre_municipio || 'Sin municipio'}" (${municipio.total_personas} personas)? (número o "s" para saltar): `
    );

    if (seleccion.toLowerCase() === 's') {
      console.log('   ⏭️  Saltado');
      continue;
    }

    const indice = parseInt(seleccion) - 1;
    if (indice < 0 || indice >= parroquias.length) {
      console.log('   ❌ Selección inválida, saltando...');
      continue;
    }

    const parroquiaSeleccionada = parroquias[indice];

    // Actualizar personas de ese municipio
    await sequelize.query(`
      UPDATE personas p
      SET id_parroquia = :id_parroquia
      FROM familias f
      WHERE p.id_familia_familias = f.id_familia
        AND f.id_municipio = :id_municipio
        AND p.id_parroquia IS NULL
    `, {
      replacements: { 
        id_parroquia: parroquiaSeleccionada.id_parroquia,
        id_municipio: municipio.id_municipio
      },
      type: QueryTypes.UPDATE
    });

    console.log(`   ✅ ${municipio.total_personas} personas actualizadas con "${parroquiaSeleccionada.nombre}"`);
  }

  await verificarAsignacion();
}

async function asignarAleatoriamente(parroquias, total) {
  console.log('\n🎲 ASIGNAR ALEATORIAMENTE');
  
  const confirmacion = await pregunta(
    `\n⚠️  ¿Confirmas asignar ${total} personas aleatoriamente entre ${parroquias.length} parroquias? (s/n): `
  );

  if (confirmacion.toLowerCase() !== 's') {
    console.log('❌ Operación cancelada');
    return;
  }

  console.log('\n🔄 Actualizando...');

  // Obtener todas las personas sin parroquia
  const personas = await sequelize.query(`
    SELECT id_personas 
    FROM personas 
    WHERE id_parroquia IS NULL
  `, { type: QueryTypes.SELECT });

  let actualizadas = 0;
  
  for (const persona of personas) {
    // Seleccionar parroquia aleatoria
    const parroquiaAleatoria = parroquias[Math.floor(Math.random() * parroquias.length)];
    
    await sequelize.query(`
      UPDATE personas 
      SET id_parroquia = :id_parroquia
      WHERE id_personas = :id_personas
    `, {
      replacements: {
        id_parroquia: parroquiaAleatoria.id_parroquia,
        id_personas: persona.id_personas
      },
      type: QueryTypes.UPDATE
    });
    
    actualizadas++;
  }

  console.log(`✅ ${actualizadas} personas actualizadas con parroquias aleatorias`);
  
  await verificarAsignacion();
}

async function verificarAsignacion() {
  console.log('\n📊 VERIFICACIÓN FINAL:');
  
  const distribucion = await sequelize.query(`
    SELECT 
      pr.id_parroquia,
      pr.nombre,
      COUNT(p.id_personas) as total
    FROM parroquia pr
    LEFT JOIN personas p ON pr.id_parroquia = p.id_parroquia
    GROUP BY pr.id_parroquia, pr.nombre
    ORDER BY total DESC
  `, { type: QueryTypes.SELECT });

  console.log('\nDistribución de personas por parroquia:');
  distribucion.forEach(d => {
    if (d.total > 0) {
      console.log(`   ${d.nombre}: ${d.total} personas`);
    }
  });

  const [sinParroquia] = await sequelize.query(`
    SELECT COUNT(*) as total
    FROM personas
    WHERE id_parroquia IS NULL
  `, { type: QueryTypes.SELECT });

  console.log(`\n👥 Personas sin parroquia: ${sinParroquia.total}`);
  
  if (sinParroquia.total === 0) {
    console.log('✅ ¡Todas las personas tienen parroquia asignada!');
  }
}

poblarParroquiasPersonas();
