import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createQuickBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Crear directorio si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `quick-backup-${timestamp}.sql`);
    
    console.log('🚀 Iniciando backup rápido...');
    
    // Intentar usar pg_dump si está disponible (buscando en rutas comunes)
    const possiblePaths = [
      'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
      'C:\\Program Files (x86)\\PostgreSQL\\18\\bin\\pg_dump.exe',
      'C:\\Program Files (x86)\\PostgreSQL\\17\\bin\\pg_dump.exe',
      'pg_dump' // Si está en PATH
    ];
    
    let pgDumpPath = null;
    
    for (const pPath of possiblePaths) {
      try {
        if (pPath === 'pg_dump') {
          await execAsync('pg_dump --version');
          pgDumpPath = pPath;
          break;
        } else if (fs.existsSync(pPath)) {
          pgDumpPath = `"${pPath}"`;
          break;
        }
      } catch (e) {
        // Continuar buscando
      }
    }
    
    if (pgDumpPath) {
      console.log(`✅ Encontrado pg_dump en: ${pgDumpPath}`);
      
      // Configurar variables de entorno
      const env = {
        ...process.env,
        PGPASSWORD: 'ParroquiaSecure2025'
      };
      
      const command = `${pgDumpPath} --host=localhost --port=5432 --username=parroquia_user --no-password --verbose --clean --if-exists --create --file="${backupFile}" parroquia_db`;
      
      console.log('📊 Ejecutando pg_dump...');
      const { stdout, stderr } = await execAsync(command, { env });
      
      if (stderr && !stderr.includes('NOTICE')) {
        console.log('⚠️ Advertencias:', stderr);
      }
      
      console.log('✅ Backup completado con pg_dump');
      
    } else {
      console.log('⚠️ pg_dump no encontrado, usando backup alternativo...');
      
      // Fallback al método de Node.js
      const { createBackup } = await import('./backup-database.js');
      await createBackup();
      return;
    }
    
    // Verificar que el archivo se creó
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile);
      console.log(`📁 Archivo creado: ${backupFile}`);
      console.log(`📏 Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } else {
      throw new Error('El archivo de backup no se creó');
    }
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error.message);
    console.log('🔄 Intentando método alternativo...');
    
    // Usar el backup de Node.js como fallback
    try {
      const backupModule = await import('./backup-database.js');
      await backupModule.default();
    } catch (fallbackError) {
      console.error('❌ Error en método alternativo:', fallbackError.message);
    }
  }
}

// Ejecutar
createQuickBackup().catch(console.error);