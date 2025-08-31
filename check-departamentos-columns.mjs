import sequelize from './config/sequelize.js';

const query = `
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'departamentos' 
  ORDER BY ordinal_position;
`;

try {
  const [results] = await sequelize.query(query);
  console.log('Columnas de la tabla departamentos:');
  results.forEach(col => {
    console.log(`- ${col.column_name} (${col.data_type})`);
  });
  
  // También verificar municipios
  const queryMunicipios = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'municipios' 
    ORDER BY ordinal_position;
  `;
  
  const [resultsMunicipios] = await sequelize.query(queryMunicipios);
  console.log('\nColumnas de la tabla municipios:');
  resultsMunicipios.forEach(col => {
    console.log(`- ${col.column_name} (${col.data_type})`);
  });
  
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
