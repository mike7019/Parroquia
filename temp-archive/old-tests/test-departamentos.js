import { Departamentos } from './src/models/catalog/index.js';

async function checkDepartamentos() {
  try {
    const departamentos = await Departamentos.findAll();
    console.log('Departamentos encontrados:', departamentos.length);
    
    departamentos.forEach(d => {
      console.log(`ID: ${d.id_departamento}, Nombre: ${d.nombre}, Código: ${d.codigo_dane}`);
    });
    
    if (departamentos.length === 0) {
      console.log('\n⚠️  No hay departamentos en la base de datos!');
      console.log('Esto explica por qué falla la creación de municipios.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDepartamentos();
