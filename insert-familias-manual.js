const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('parroquia_db', 'parroquia_user', 'admin', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log
});

async function insertFamilias() {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Obtener datos necesarios
    const [municipios] = await sequelize.query("SELECT id_municipio FROM municipios LIMIT 3");
    const [veredas] = await sequelize.query("SELECT id_vereda FROM veredas LIMIT 5");
    const [sectores] = await sequelize.query("SELECT id_sector FROM sectores LIMIT 3");

    console.log('Municipios disponibles:', municipios.length);
    console.log('Veredas disponibles:', veredas.length);
    console.log('Sectores disponibles:', sectores.length);

    if (municipios.length === 0 || veredas.length === 0 || sectores.length === 0) {
      console.log('Faltan datos de catálogos básicos');
      return;
    }

    // Verificar si ya existen familias
    const [familiaCount] = await sequelize.query("SELECT COUNT(*) as count FROM familias");
    
    if (familiaCount[0].count > 0) {
      console.log('Ya existen familias en la base de datos:', familiaCount[0].count);
      return;
    }

    // Datos para generar familias
    const tiposVivienda = ['Casa', 'Apartamento', 'Rancho', 'Finca', 'Cuarto'];
    const sectoresNombres = ['Centro', 'Norte', 'Sur', 'Oriente', 'Occidente'];
    const apellidosFamiliares = [
      'Rodríguez', 'García', 'Martínez', 'López', 'González', 'Hernández',
      'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Díaz',
      'Reyes', 'Morales', 'Jiménez', 'Guerrero', 'Medina', 'Rojas', 'Vargas',
      'Castillo', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Iglesias', 'Santos',
      'Torres', 'Aguilar', 'Mendoza', 'Ruiz', 'Vega', 'Molina', 'Delgado',
      'Moreno', 'Carrasco', 'Alvarez', 'Fernández', 'Muñoz', 'Cortés'
    ];

    console.log('Insertando 40 familias...');

    // Generar e insertar familias una por una
    for (let i = 1; i <= 40; i++) {
      const municipio = municipios[Math.floor(Math.random() * municipios.length)];
      const vereda = veredas[Math.floor(Math.random() * veredas.length)];
      const sector = sectores[Math.floor(Math.random() * sectores.length)];
      const apellido = apellidosFamiliares[Math.floor(Math.random() * apellidosFamiliares.length)];
      const tipoVivienda = tiposVivienda[Math.floor(Math.random() * tiposVivienda.length)];
      const sectorNombre = sectoresNombres[Math.floor(Math.random() * sectoresNombres.length)];
      
      const familiaData = {
        apellido_familiar: apellido,
        sector: sectorNombre,
        direccion_familia: `Calle ${Math.floor(Math.random() * 100) + 1} # ${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 99) + 1}`,
        numero_contacto: `300${Math.floor(Math.random() * 9000000) + 1000000}`,
        telefono: Math.random() > 0.5 ? `${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}` : null,
        email: Math.random() > 0.3 ? `familia${apellido.toLowerCase()}${i}@email.com` : null,
        tamaño_familia: Math.floor(Math.random() * 6) + 1,
        tipo_vivienda: tipoVivienda,
        estado_encuesta: Math.random() > 0.7 ? 'completed' : Math.random() > 0.4 ? 'in_progress' : 'pending',
        numero_encuestas: Math.floor(Math.random() * 3),
        fecha_ultima_encuesta: Math.random() > 0.5 ? '2024-06-15' : null,
        codigo_familia: `FAM${String(i).padStart(4, '0')}`,
        tutor_responsable: Math.random() > 0.3,
        id_municipio: municipio.id_municipio,
        id_vereda: vereda.id_vereda,
        id_sector: sector.id_sector
      };

      await sequelize.query(`
        INSERT INTO familias (
          apellido_familiar, sector, direccion_familia, numero_contacto, telefono, email,
          tamaño_familia, tipo_vivienda, estado_encuesta, numero_encuestas, fecha_ultima_encuesta,
          codigo_familia, tutor_responsable, id_municipio, id_vereda, id_sector, created_at, updated_at
        ) VALUES (
          :apellido_familiar, :sector, :direccion_familia, :numero_contacto, :telefono, :email,
          :tamaño_familia, :tipo_vivienda, :estado_encuesta, :numero_encuestas, :fecha_ultima_encuesta,
          :codigo_familia, :tutor_responsable, :id_municipio, :id_vereda, :id_sector, NOW(), NOW()
        )
      `, {
        replacements: familiaData,
        type: sequelize.QueryTypes.INSERT
      });

      if (i % 10 === 0) {
        console.log(`Insertadas ${i} familias...`);
      }
    }

    console.log('✅ 40 familias insertadas correctamente');

    // Verificar el resultado
    const [newCount] = await sequelize.query("SELECT COUNT(*) as count FROM familias");
    console.log('Total de familias ahora:', newCount[0].count);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

insertFamilias();
