/**
 * Seeder de Parentescos - Versiones Femeninas y Masculinas
 * Incluye todos los tipos de parentesco para encuestas familiares
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

async function insertarParentescos() {
  try {
    console.log('👨‍👩‍👧‍👦 INSERTANDO PARENTESCOS');
    console.log('='.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar datos existentes
    await sequelize.query('DELETE FROM parentescos;');
    console.log('🗑️  Datos existentes limpiados\n');

    console.log('📝 Insertando parentescos...\n');

    const parentescos = [
      // Jefe/Jefa de hogar
      {
        nombre: 'Jefe de Hogar',
        descripcion: 'Persona que encabeza el hogar (masculino)',
        activo: true
      },
      {
        nombre: 'Jefa de Hogar',
        descripcion: 'Persona que encabeza el hogar (femenino)',
        activo: true
      },
      
      // Cónyuge/Pareja
      {
        nombre: 'Esposo',
        descripcion: 'Cónyuge masculino',
        activo: true
      },
      {
        nombre: 'Esposa',
        descripcion: 'Cónyuge femenino',
        activo: true
      },
      {
        nombre: 'Compañero',
        descripcion: 'Pareja en unión libre (masculino)',
        activo: true
      },
      {
        nombre: 'Compañera',
        descripcion: 'Pareja en unión libre (femenino)',
        activo: true
      },
      
      // Hijos/Hijas
      {
        nombre: 'Hijo',
        descripcion: 'Hijo del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Hija',
        descripcion: 'Hija del jefe de hogar',
        activo: true
      },
      
      // Padres
      {
        nombre: 'Padre',
        descripcion: 'Padre del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Madre',
        descripcion: 'Madre del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Suegro',
        descripcion: 'Padre del cónyuge',
        activo: true
      },
      {
        nombre: 'Suegra',
        descripcion: 'Madre del cónyuge',
        activo: true
      },
      
      // Hermanos/Hermanas
      {
        nombre: 'Hermano',
        descripcion: 'Hermano del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Hermana',
        descripcion: 'Hermana del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Cuñado',
        descripcion: 'Hermano del cónyuge',
        activo: true
      },
      {
        nombre: 'Cuñada',
        descripcion: 'Hermana del cónyuge',
        activo: true
      },
      
      // Abuelos
      {
        nombre: 'Abuelo',
        descripcion: 'Abuelo del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Abuela',
        descripcion: 'Abuela del jefe de hogar',
        activo: true
      },
      
      // Nietos
      {
        nombre: 'Nieto',
        descripcion: 'Nieto del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Nieta',
        descripcion: 'Nieta del jefe de hogar',
        activo: true
      },
      
      // Tíos
      {
        nombre: 'Tío',
        descripcion: 'Tío del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Tía',
        descripcion: 'Tía del jefe de hogar',
        activo: true
      },
      
      // Sobrinos
      {
        nombre: 'Sobrino',
        descripcion: 'Sobrino del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Sobrina',
        descripcion: 'Sobrina del jefe de hogar',
        activo: true
      },
      
      // Primos
      {
        nombre: 'Primo',
        descripcion: 'Primo del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Prima',
        descripcion: 'Prima del jefe de hogar',
        activo: true
      },
      
      // Yernos/Nueras
      {
        nombre: 'Yerno',
        descripcion: 'Esposo de la hija',
        activo: true
      },
      {
        nombre: 'Nuera',
        descripcion: 'Esposa del hijo',
        activo: true
      },
      
      // Bisabuelos
      {
        nombre: 'Bisabuelo',
        descripcion: 'Bisabuelo del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Bisabuela',
        descripcion: 'Bisabuela del jefe de hogar',
        activo: true
      },
      
      // Bisnietos
      {
        nombre: 'Bisnieto',
        descripcion: 'Bisnieto del jefe de hogar',
        activo: true
      },
      {
        nombre: 'Bisnieta',
        descripcion: 'Bisnieta del jefe de hogar',
        activo: true
      },
      
      // Otros parentescos
      {
        nombre: 'Padrastro',
        descripcion: 'Nueva pareja de la madre',
        activo: true
      },
      {
        nombre: 'Madrastra',
        descripcion: 'Nueva pareja del padre',
        activo: true
      },
      {
        nombre: 'Hijastro',
        descripcion: 'Hijo de la pareja actual (masculino)',
        activo: true
      },
      {
        nombre: 'Hijastra',
        descripcion: 'Hija de la pareja actual (femenino)',
        activo: true
      },
      {
        nombre: 'Hermanastro',
        descripcion: 'Hermano por parte de padre o madre',
        activo: true
      },
      {
        nombre: 'Hermanastra',
        descripcion: 'Hermana por parte de padre o madre',
        activo: true
      },
      
      // Ahijados/Padrinos
      {
        nombre: 'Padrino',
        descripcion: 'Padrino de bautizo o confirmación',
        activo: true
      },
      {
        nombre: 'Madrina',
        descripcion: 'Madrina de bautizo o confirmación',
        activo: true
      },
      {
        nombre: 'Ahijado',
        descripcion: 'Ahijado (masculino)',
        activo: true
      },
      {
        nombre: 'Ahijada',
        descripcion: 'Ahijada (femenino)',
        activo: true
      },
      
      // Sin parentesco
      {
        nombre: 'Empleado Doméstico',
        descripcion: 'Persona que trabaja en el hogar',
        activo: true
      },
      {
        nombre: 'Empleada Doméstica',
        descripcion: 'Persona que trabaja en el hogar (femenino)',
        activo: true
      },
      {
        nombre: 'Pensionista',
        descripcion: 'Persona que renta una habitación',
        activo: true
      },
      {
        nombre: 'Otro',
        descripcion: 'Otro parentesco no especificado',
        activo: true
      }
    ];

    // Insertar en lotes para mejor rendimiento
    const valores = parentescos.map(p => 
      `('${p.nombre.replace(/'/g, "''")}', '${p.descripcion.replace(/'/g, "''")}', ${p.activo}, NOW(), NOW())`
    ).join(',\n      ');

    await sequelize.query(`
      INSERT INTO parentescos (nombre, descripcion, activo, "createdAt", "updatedAt")
      VALUES
      ${valores};
    `);

    console.log(`✅ ${parentescos.length} parentescos insertados\n`);

    // Agrupar por categoría para mostrar
    console.log('📋 PARENTESCOS INSERTADOS POR CATEGORÍA:\n');
    
    const categorias = {
      'Jefes de Hogar': ['Jefe de Hogar', 'Jefa de Hogar'],
      'Cónyuges/Parejas': ['Esposo', 'Esposa', 'Compañero', 'Compañera'],
      'Hijos': ['Hijo', 'Hija'],
      'Padres': ['Padre', 'Madre', 'Suegro', 'Suegra'],
      'Hermanos': ['Hermano', 'Hermana', 'Cuñado', 'Cuñada'],
      'Abuelos': ['Abuelo', 'Abuela', 'Bisabuelo', 'Bisabuela'],
      'Nietos': ['Nieto', 'Nieta', 'Bisnieto', 'Bisnieta'],
      'Tíos y Sobrinos': ['Tío', 'Tía', 'Sobrino', 'Sobrina'],
      'Primos': ['Primo', 'Prima'],
      'Yernos/Nueras': ['Yerno', 'Nuera'],
      'Familia Política': ['Padrastro', 'Madrastra', 'Hijastro', 'Hijastra', 'Hermanastro', 'Hermanastra'],
      'Compadrazgo': ['Padrino', 'Madrina', 'Ahijado', 'Ahijada'],
      'Otros': ['Empleado Doméstico', 'Empleada Doméstica', 'Pensionista', 'Otro']
    };

    for (const [categoria, items] of Object.entries(categorias)) {
      console.log(`  ${categoria}:`);
      items.forEach(item => console.log(`    • ${item}`));
      console.log('');
    }

    // Verificar
    const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM parentescos;`);
    console.log('='.repeat(80));
    console.log(`✅ Total de parentescos en BD: ${result[0].count}`);
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

insertarParentescos();
