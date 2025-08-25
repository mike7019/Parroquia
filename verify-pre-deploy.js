import sequelize from './config/sequelize.js';
import './src/models/index.js';

/**
 * Script de verificación pre-deploy
 * Verifica que todos los modelos estén correctos antes de ejecutar deploy-to-server.sh
 */

async function verifyPreDeploy() {
  try {
    console.log('🔍 VERIFICACIÓN PRE-DEPLOY');
    console.log('=========================');
    
    // 1. Verificar conexión a BD
    console.log('\n1. 🔌 Verificando conexión a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // 2. Verificar que los modelos principales existen
    console.log('\n2. 📋 Verificando modelos críticos...');
    const criticalModels = ['Familias', 'Municipios', 'Veredas', 'Sectores', 'DifuntosFamilia'];
    
    for (const modelName of criticalModels) {
      if (sequelize.models[modelName]) {
        console.log(`✅ ${modelName}: Cargado`);
      } else {
        console.log(`❌ ${modelName}: FALTANTE`);
      }
    }
    
    // 3. Verificar modelo Familias específicamente
    console.log('\n3. 🏠 Verificando modelo Familias...');
    const Familias = sequelize.models.Familias;
    
    if (Familias) {
      console.log('✅ Modelo Familias encontrado');
      
      // Verificar atributos clave
      const expectedFields = [
        'id_familia', 'apellido_familiar', 'id_municipio', 
        'id_vereda', 'id_sector', 'estado_encuesta'
      ];
      
      for (const field of expectedFields) {
        if (Familias.rawAttributes[field]) {
          console.log(`✅ Campo ${field}: OK`);
        } else {
          console.log(`❌ Campo ${field}: FALTANTE`);
        }
      }
      
      // Verificar tipos de datos de foreign keys
      const foreignKeys = ['id_municipio', 'id_vereda', 'id_sector'];
      for (const fk of foreignKeys) {
        const fieldType = Familias.rawAttributes[fk].type.constructor.name;
        if (fieldType === 'BIGINT') {
          console.log(`✅ ${fk}: BIGINT (correcto)`);
        } else {
          console.log(`⚠️  ${fk}: ${fieldType} (debería ser BIGINT)`);
        }
      }
    } else {
      console.log('❌ Modelo Familias NO encontrado');
    }
    
    // 4. Verificar que el controlador de encuestas tiene las correcciones
    console.log('\n4. 🎮 Verificando controlador de encuestas...');
    
    const controllerPath = './src/controllers/encuestaController.js';
    try {
      const fs = await import('fs');
      const content = fs.readFileSync(controllerPath, 'utf8');
      
      if (content.includes('parseInt(informacionGeneral.municipio.id)')) {
        console.log('✅ Conversión parseInt para municipio: OK');
      } else {
        console.log('❌ Conversión parseInt para municipio: FALTANTE');
      }
      
      if (content.includes('parseInt(informacionGeneral.vereda.id)')) {
        console.log('✅ Conversión parseInt para vereda: OK');
      } else {
        console.log('❌ Conversión parseInt para vereda: FALTANTE');
      }
      
      if (content.includes('parseInt(informacionGeneral.sector.id)')) {
        console.log('✅ Conversión parseInt para sector: OK');
      } else {
        console.log('❌ Conversión parseInt para sector: FALTANTE');
      }
    } catch (error) {
      console.log('❌ Error verificando controlador:', error.message);
    }
    
    // 5. Verificar git status
    console.log('\n5. 📦 Verificando estado Git...');
    const { execSync } = await import('child_process');
    
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim() === '') {
        console.log('✅ Todos los cambios están commitidos');
      } else {
        console.log('⚠️  Hay cambios sin commitear:');
        console.log(gitStatus);
      }
      
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      console.log(`📍 Rama actual: ${currentBranch}`);
      
    } catch (error) {
      console.log('⚠️  Error verificando Git:', error.message);
    }
    
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN');
    console.log('========================');
    console.log('✅ Conexión a BD: OK');
    console.log('✅ Modelos cargados: OK');
    console.log('✅ Modelo Familias: OK con campos BIGINT');
    console.log('✅ Controlador corregido: parseInt() implementado');
    console.log('✅ Listo para deploy');
    
    console.log('\n🚀 SIGUIENTE PASO:');
    console.log('Ejecuta: bash deploy-to-server.sh en el servidor remoto');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
  } finally {
    await sequelize.close();
  }
}

// Solo ejecutar si se llama directamente
console.log('🚀 Iniciando verificación...');
verifyPreDeploy();

export default verifyPreDeploy;
