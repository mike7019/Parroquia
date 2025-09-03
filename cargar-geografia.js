// Cargar departamentos y municipios desde API de Colombia
import fetch from 'node-fetch';
import './src/models/index.js';
import { Departamentos, Municipios } from './src/models/index.js';

async function cargarDepartamentosYMunicipios() {
    try {
        console.log('🌍 Cargando departamentos desde API Colombia...');
        
        // Obtener departamentos
        const deptResponse = await fetch('https://api-colombia.com/api/v1/Department');
        const departamentos = await deptResponse.json();
        
        console.log(`📊 Encontrados ${departamentos.length} departamentos`);
        
        // Crear departamentos
        for (const dept of departamentos) {
            await Departamentos.findOrCreate({
                where: { codigo_dane: dept.id.toString().padStart(2, '0') },
                defaults: {
                    nombre: dept.name,
                    codigo_dane: dept.id.toString().padStart(2, '0')
                }
            });
        }
        
        console.log('✅ Departamentos cargados');
        
        // Ahora cargar municipios para algunos departamentos principales
        console.log('🏘️ Cargando municipios...');
        
        let totalMunicipios = 0;
        
        // Cargar municipios para los primeros 5 departamentos
        for (let i = 0; i < Math.min(5, departamentos.length); i++) {
            const dept = departamentos[i];
            
            try {
                const munResponse = await fetch(`https://api-colombia.com/api/v1/Department/${dept.id}/cities`);
                const municipios = await munResponse.json();
                
                console.log(`  📍 ${dept.name}: ${municipios.length} municipios`);
                
                // Encontrar el departamento en nuestra BD
                const departamentoDB = await Departamentos.findOne({
                    where: { codigo_dane: dept.id.toString().padStart(2, '0') }
                });
                
                if (departamentoDB) {
                    // Crear municipios
                    for (const mun of municipios) {
                        await Municipios.findOrCreate({
                            where: { codigo_dane: mun.id.toString().padStart(5, '0') },
                            defaults: {
                                nombre_municipio: mun.name,
                                codigo_dane: mun.id.toString().padStart(5, '0'),
                                id_departamento: departamentoDB.id_departamento
                            }
                        });
                    }
                    totalMunicipios += municipios.length;
                }
                
                // Pausa para no sobrecargar la API
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.log(`⚠️ Error cargando municipios para ${dept.name}:`, error.message);
            }
        }
        
        console.log(`✅ ${totalMunicipios} municipios cargados`);
        
        // Verificar totales
        const totalDepts = await Departamentos.count();
        const totalMuns = await Municipios.count();
        
        console.log('\n📊 Resumen de datos cargados:');
        console.log(`   • Departamentos: ${totalDepts}`);
        console.log(`   • Municipios: ${totalMuns}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cargarDepartamentosYMunicipios();
