const { QueryTypes } = require('sequelize');

async function testSexoFallback() {
  let sequelize;
  try {
    // Import dinámico para ES modules
    const { sequelize: db } = await import('./config/database.js');
    sequelize = db;
    
    console.log('=== PRUEBA DE FALLBACK PARA SEXO EN DIFUNTOS ===\n');

    // Consultar difuntos igual que en el controller
    const difuntos = await sequelize.query(`
      SELECT 
        p.id_personas,
        p.primer_nombre,
        p.segundo_nombre,
        p.primer_apellido,
        p.segundo_apellido,
        p.identificacion,
        p.estudios,
        p.fecha_nacimiento,
        p.id_sexo,
        p.id_parentesco,
        s.descripcion as sexo_descripcion,
        par.nombre as parentesco_nombre
      FROM personas p
      LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
      LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
      WHERE p.identificacion LIKE 'FALLECIDO%'
      LIMIT 3
    `, {
      type: QueryTypes.SELECT
    });

    console.log('Difuntos encontrados:', difuntos.length);
    
    if (difuntos.length === 0) {
      console.log('No se encontraron difuntos');
      return;
    }

    // Simular la lógica del controller
    const deceasedMembers = difuntos.map(fallecido => {
      console.log('\n--- Procesando difunto ---');
      console.log('Nombre:', fallecido.primer_nombre, fallecido.primer_apellido);
      console.log('id_sexo en DB:', fallecido.id_sexo);
      console.log('id_parentesco en DB:', fallecido.id_parentesco);
      console.log('Estudios JSON:', fallecido.estudios);

      let infoFallecido = {};
      if (fallecido.estudios) {
        try {
          infoFallecido = JSON.parse(fallecido.estudios);
          console.log('JSON parseado:', infoFallecido);
        } catch (error) {
          console.log('Error al parsear JSON:', error.message);
        }
      }

      // Aplicar la nueva lógica de fallback para sexo
      const sexo = fallecido.id_sexo ? {
        id: parseInt(fallecido.id_sexo),
        nombre: fallecido.sexo_descripcion || null
      } : {
        // Fallback: inferir del JSON si no hay datos en tablas relacionadas
        id: (infoFallecido.era_padre === true) ? 1 : 
            (infoFallecido.era_madre === true) ? 2 : null,
        nombre: (infoFallecido.era_padre === true) ? "Masculino" : 
                (infoFallecido.era_madre === true) ? "Femenino" : null
      };

      const parentesco = fallecido.id_parentesco ? {
        id: parseInt(fallecido.id_parentesco),
        nombre: fallecido.parentesco_nombre || null
      } : {
        // Fallback: inferir del JSON si no hay datos en tablas relacionadas
        id: (infoFallecido.era_padre === true) ? 2 : 
            (infoFallecido.era_madre === true) ? 3 : null,
        nombre: (infoFallecido.era_padre === true) ? "Padre" : 
                (infoFallecido.era_madre === true) ? "Madre" : null
      };

      console.log('Sexo resultante:', sexo);
      console.log('Parentesco resultante:', parentesco);

      return {
        nombres: `${fallecido.primer_nombre} ${fallecido.primer_apellido}`,
        fechaFallecimiento: infoFallecido.fecha_aniversario || null,
        sexo: sexo,
        parentesco: parentesco,
        causaFallecimiento: infoFallecido.causa_fallecimiento || null
      };
    });

    console.log('\n=== RESULTADO FINAL ===');
    console.log('deceasedMembers:', JSON.stringify(deceasedMembers, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

testSexoFallback();
