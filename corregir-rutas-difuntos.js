/**
 * Script para corregir el conflicto de rutas de difuntos en app.js
 * Identifica y resuelve el problema de doble registro de rutas
 */

import fs from 'fs';
import path from 'path';

class CorreccionRutasDifuntos {
  constructor() {
    this.appJsPath = './src/app.js';
    this.backupPath = './src/app.js.backup';
  }

  async ejecutarCorreccion() {
    console.log('🔧 Iniciando corrección de conflicto de rutas de difuntos...\n');
    
    try {
      // 1. Crear backup
      await this.crearBackup();
      
      // 2. Leer archivo actual
      const contenido = await this.leerArchivo();
      
      // 3. Analizar conflicto
      await this.analizarConflicto(contenido);
      
      // 4. Proponer soluciones
      await this.proponerSoluciones(contenido);
      
    } catch (error) {
      console.error('❌ Error en la corrección:', error);
    }
  }

  async crearBackup() {
    try {
      const contenido = fs.readFileSync(this.appJsPath, 'utf8');
      fs.writeFileSync(this.backupPath, contenido);
      console.log('✅ Backup creado en:', this.backupPath);
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      throw error;
    }
  }

  async leerArchivo() {
    try {
      return fs.readFileSync(this.appJsPath, 'utf8');
    } catch (error) {
      console.error('❌ Error leyendo app.js:', error);
      throw error;
    }
  }

  async analizarConflicto(contenido) {
    console.log('🔍 Analizando conflicto de rutas...\n');
    
    const lineas = contenido.split('\n');
    const rutasDifuntos = [];
    
    lineas.forEach((linea, index) => {
      if (linea.includes("app.use('/api/difuntos'")) {
        rutasDifuntos.push({
          numero: index + 1,
          contenido: linea.trim(),
          tipo: linea.includes('difuntosConsolidadoRoutes') ? 'consolidado' : 'original'
        });
      }
    });

    console.log('📋 RUTAS ENCONTRADAS:');
    rutasDifuntos.forEach(ruta => {
      console.log(`Línea ${ruta.numero} (${ruta.tipo}): ${ruta.contenido}`);
    });

    if (rutasDifuntos.length > 1) {
      console.log('\n🚨 CONFLICTO CONFIRMADO: Múltiples registros para /api/difuntos');
      console.log('⚠️  El último registro sobrescribe los anteriores');
    } else {
      console.log('\n✅ No se detectó conflicto');
    }

    return rutasDifuntos;
  }

  async proponerSoluciones(contenido) {
    console.log('\n🔧 SOLUCIONES PROPUESTAS:\n');

    console.log('OPCIÓN 1: Migración completa a consolidado');
    console.log('- Comentar rutas originales');
    console.log('- Mantener solo rutas consolidadas');
    console.log('- ✅ Ventaja: Funcionalidad unificada');
    console.log('- ⚠️  Riesgo: Posible pérdida de funcionalidad específica\n');

    console.log('OPCIÓN 2: Separación con prefijos');
    console.log('- Rutas originales: /api/difuntos/legacy');
    console.log('- Rutas consolidadas: /api/difuntos');
    console.log('- ✅ Ventaja: Compatibilidad total');
    console.log('- ⚠️  Riesgo: Confusión en documentación\n');

    console.log('OPCIÓN 3: Versionado de API');
    console.log('- Rutas v1: /api/v1/difuntos');
    console.log('- Rutas v2: /api/v2/difuntos o /api/difuntos');
    console.log('- ✅ Ventaja: Evolución controlada');
    console.log('- ⚠️  Riesgo: Mantenimiento de múltiples versiones\n');

    // Generar archivos de corrección
    await this.generarCorreccionOpcion1(contenido);
    await this.generarCorreccionOpcion2(contenido);
    await this.generarCorreccionOpcion3(contenido);
  }

  async generarCorreccionOpcion1(contenido) {
    const contenidoCorregido = contenido.replace(
      /app\.use\('\/api\/difuntos',\s*difuntosRoutes\);.*$/gm,
      '// app.use(\'/api/difuntos\', difuntosRoutes); // MIGRADO A CONSOLIDADO'
    );

    fs.writeFileSync('./src/app-corregido-opcion1.js', contenidoCorregido);
    console.log('📁 Generado: app-corregido-opcion1.js');
  }

  async generarCorreccionOpcion2(contenido) {
    const contenidoCorregido = contenido.replace(
      /app\.use\('\/api\/difuntos',\s*difuntosRoutes\);/g,
      'app.use(\'/api/difuntos/legacy\', difuntosRoutes); // Rutas originales con prefijo'
    );

    fs.writeFileSync('./src/app-corregido-opcion2.js', contenidoCorregido);
    console.log('📁 Generado: app-corregido-opcion2.js');
  }

  async generarCorreccionOpcion3(contenido) {
    let contenidoCorregido = contenido.replace(
      /app\.use\('\/api\/difuntos',\s*difuntosRoutes\);/g,
      'app.use(\'/api/v1/difuntos\', difuntosRoutes); // API v1'
    );

    contenidoCorregido = contenidoCorregido.replace(
      /app\.use\('\/api\/difuntos',\s*difuntosConsolidadoRoutes\);/g,
      'app.use(\'/api/v2/difuntos\', difuntosConsolidadoRoutes); // API v2 consolidada'
    );

    fs.writeFileSync('./src/app-corregido-opcion3.js', contenidoCorregido);
    console.log('📁 Generado: app-corregido-opcion3.js');
  }

  async aplicarCorreccion(opcion) {
    const archivos = {
      '1': './src/app-corregido-opcion1.js',
      '2': './src/app-corregido-opcion2.js', 
      '3': './src/app-corregido-opcion3.js'
    };

    if (!archivos[opcion]) {
      console.error('❌ Opción inválida');
      return;
    }

    try {
      const contenidoCorregido = fs.readFileSync(archivos[opcion], 'utf8');
      fs.writeFileSync(this.appJsPath, contenidoCorregido);
      console.log(`✅ Corrección aplicada (Opción ${opcion})`);
      console.log('🔄 Reinicia el servidor para aplicar cambios');
    } catch (error) {
      console.error('❌ Error aplicando corrección:', error);
    }
  }

  async restaurarBackup() {
    try {
      const backup = fs.readFileSync(this.backupPath, 'utf8');
      fs.writeFileSync(this.appJsPath, backup);
      console.log('✅ Backup restaurado');
    } catch (error) {
      console.error('❌ Error restaurando backup:', error);
    }
  }
}

// Función principal para uso interactivo
async function main() {
  const corrector = new CorreccionRutasDifuntos();
  
  if (process.argv.length > 2) {
    const comando = process.argv[2];
    
    switch (comando) {
      case 'analizar':
        await corrector.ejecutarCorreccion();
        break;
      case 'aplicar':
        const opcion = process.argv[3];
        await corrector.aplicarCorreccion(opcion);
        break;
      case 'restaurar':
        await corrector.restaurarBackup();
        break;
      default:
        console.log('Comandos disponibles:');
        console.log('  node corregir-rutas-difuntos.js analizar');
        console.log('  node corregir-rutas-difuntos.js aplicar [1|2|3]');
        console.log('  node corregir-rutas-difuntos.js restaurar');
    }
  } else {
    await corrector.ejecutarCorreccion();
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}

export default CorreccionRutasDifuntos;
