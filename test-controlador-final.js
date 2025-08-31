import encuestaController from './src/controllers/encuestaController.js';

const { consultarFamiliasConPadresMadres } = encuestaController;

// Simular un request HTTP
const mockRequest = {
  query: {
    limite: 3,
    apellido_familiar: ''
  }
};

const mockResponse = {
  status: function(code) {
    console.log(`📡 Status: ${code}`);
    return this;
  },
  json: function(data) {
    console.log('🎯 Respuesta completa del controlador:');
    console.log('✅ Mensaje:', data.mensaje);
    console.log('📊 Total encontradas:', data.total);
    
    if (data.datos && data.datos.length > 0) {
      console.log('\n🔍 Verificando estructura de la primera familia:');
      const familia = data.datos[0];
      
      console.log('✅ ID Encuesta:', familia.id_encuesta || '❌ Faltante');
      console.log('✅ Información General:', familia.informacionGeneral ? 'Presente' : '❌ Faltante');
      console.log('✅ Vivienda:', familia.vivienda ? 'Presente' : '❌ Faltante');
      console.log('✅ Servicios Agua:', familia.servicios_agua ? 'Presente' : '❌ Faltante');
      console.log('✅ Family Members:', familia.familyMembers ? `${familia.familyMembers.length} encontrados` : '❌ Faltante');
      console.log('✅ Deceased Members:', familia.deceasedMembers ? `${familia.deceasedMembers.length} encontrados` : '❌ Faltante');
      console.log('✅ Metadata:', familia.metadata ? 'Presente' : '❌ Faltante');
    }
    
    return this;
  },
  send: function(data) {
    console.log('📤 Enviado:', data);
    return this;
  }
};

async function probarControladorCompleto() {
  try {
    console.log('🚀 Probando controlador completo con estructura preservada...');
    await consultarFamiliasConPadresMadres(mockRequest, mockResponse);
    console.log('\n✅ ¡Prueba del controlador completada exitosamente!');
    console.log('🎉 TODA la información del request se preserva en el response');
  } catch (error) {
    console.error('❌ Error en la prueba del controlador:', error.message);
    console.error('Stack:', error.stack);
  }
}

probarControladorCompleto();
