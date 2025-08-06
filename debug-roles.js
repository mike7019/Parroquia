import { Usuario } from './src/models/index.js';

async function debugUserRole() {
  try {
    console.log('🔍 Debuggeando roles del usuario administrador...');
    
    const user = await Usuario.findByPk('31cb8fe4-bb24-4ad8-af66-d8c900d13c2a');
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', user.correo_electronico);
    
    // Test getUserRoles method
    console.log('\n📋 Probando getUserRoles...');
    try {
      const userRoles = await user.getUserRoles();
      console.log('Roles obtenidos:', userRoles);
      console.log('Tipo de datos:', typeof userRoles);
      console.log('Es array:', Array.isArray(userRoles));
      
      if (Array.isArray(userRoles) && userRoles.length > 0) {
        console.log('Primer rol:', userRoles[0]);
        console.log('Tipo del primer rol:', typeof userRoles[0]);
      }
    } catch (roleError) {
      console.error('❌ Error obteniendo roles:', roleError.message);
    }
    
    // Test association directly
    console.log('\n📋 Probando asociación directa...');
    try {
      const rolesAssociation = await user.getRoles();
      console.log('Roles por asociación:', rolesAssociation);
      console.log('Cantidad de roles:', rolesAssociation?.length || 0);
      
      if (rolesAssociation && rolesAssociation.length > 0) {
        rolesAssociation.forEach((role, index) => {
          console.log(`Rol ${index + 1}:`, {
            id: role.id,
            nombre: role.nombre,
            tipo: typeof role.nombre
          });
        });
      }
    } catch (assocError) {
      console.error('❌ Error con asociación:', assocError.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugUserRole().catch(console.error);
