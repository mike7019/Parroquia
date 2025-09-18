# 📋 TRAZABILIDAD DE PRUEBAS - SERVICIO DE ENCUESTAS

## 🎯 Objetivo
Probar exhaustivamente el servicio de encuestas con datos completos incluyendo:
- Múltiples personas por familia
- Padres y madres (vivos y fallecidos)
- Difuntos con diferentes parentescos
- Todos los campos opcionales y requeridos

## 📅 Fecha de Inicio
**Fecha**: ${new Date().toISOString().split('T')[0]}  
**Rama**: fix-encuestas  
**Responsable**: Kiro AI Assistant  

## 🔍 ANÁLISIS INICIAL

### Estado Actual del Servicio
- ✅ Controlador principal: `src/controllers/encuestaController.js`
- ✅ Rutas configuradas: `src/routes/encuestaRoutes.js`
- ✅ Validaciones: `src/middlewares/encuestaValidation.js`
- ✅ Modelos: Familia, Persona, DifuntosFamilia

### Estructura de Datos Esperada
```json
{
  "informacionGeneral": {
    "municipio": { "id": number, "nombre": string },
    "parroquia": { "id": number, "nombre": string },
    "sector": { "id": number, "nombre": string },
    "vereda": { "id": number, "nombre": string },
    "fecha": "YYYY-MM-DD",
    "apellido_familiar": string,
    "direccion": string,
    "telefono": string,
    "numero_contrato_epm": string,
    "comunionEnCasa": boolean
  },
  "vivienda": {
    "tipo_vivienda": { "id": number, "nombre": string },
    "disposicion_basuras": {
      "recolector": boolean,
      "quemada": boolean,
      "enterrada": boolean,
      "recicla": boolean,
      "aire_libre": boolean,
      "no_aplica": boolean
    }
  },
  "servicios_agua": {
    "sistema_acueducto": { "id": number, "nombre": string },
    "aguas_residuales": { "id": number, "nombre": string },
    "pozo_septico": boolean,
    "letrina": boolean,
    "campo_abierto": boolean
  },
  "observaciones": {
    "sustento_familia": string,
    "observaciones_encuestador": string,
    "autorizacion_datos": boolean
  },
  "familyMembers": [
    {
      "nombres": string,
      "numeroIdentificacion": string,
      "tipoIdentificacion": { "id": number, "nombre": string },
      "fechaNacimiento": "YYYY-MM-DD",
      "sexo": { "id": number, "nombre": string },
      "telefono": string,
      "situacionCivil": { "id": number, "nombre": string },
      "estudio": { "id": number, "nombre": string },
      "parentesco": { "id": number, "nombre": string },
      "comunidadCultural": { "id": number, "nombre": string },
      "enfermedad": { "id": number, "nombre": string },
      "talla_camisa/blusa": string,
      "talla_pantalon": string,
      "talla_zapato": string,
      "profesion": { "id": number, "nombre": string },
      "motivoFechaCelebrar": {
        "motivo": string,
        "dia": string,
        "mes": string
      }
    }
  ],
  "deceasedMembers": [
    {
      "nombres": string,
      "numeroIdentificacion": string,
      "fechaFallecimiento": "YYYY-MM-DD",
      "sexo": { "id": number, "nombre": string },
      "parentesco": { "id": number, "nombre": string },
      "causaFallecimiento": string
    }
  ],
  "metadata": {
    "timestamp": string,
    "completed": boolean,
    "currentStage": number
  }
}
```

## 📊 PLAN DE PRUEBAS

### Fase 1: Análisis de Catálogos
- [ ] Verificar datos disponibles en tablas de catálogos
- [ ] Identificar IDs válidos para cada catálogo
- [ ] Documentar mapeos de datos

### Fase 2: Creación de Datos de Prueba
- [ ] Crear familia con 2 padres vivos
- [ ] Crear familia con 3 hijos
- [ ] Crear familia con 1 abuelo fallecido
- [ ] Crear familia con 1 abuela fallecida
- [ ] Incluir todos los campos opcionales

### Fase 3: Pruebas de Validación
- [ ] Probar validaciones de campos requeridos
- [ ] Probar validaciones de identificaciones únicas
- [ ] Probar validaciones de familias duplicadas

### Fase 4: Pruebas de Integración
- [ ] Probar creación completa de encuesta
- [ ] Verificar datos guardados en base de datos
- [ ] Probar consulta de encuesta creada

### Fase 5: Pruebas de Edge Cases
- [ ] Familia sin difuntos
- [ ] Familia solo con difuntos
- [ ] Familia con muchos miembros (10+)
- [ ] Datos con caracteres especiales

## 📝 LOG DE ACTIVIDADES

### ${new Date().toISOString()}
- ✅ Creada rama fix-encuestas
- ✅ Commit inicial con optimizaciones
- ✅ Iniciado análisis del servicio actual
- 🔄 Analizando estructura de datos esperada

---

## 🔄 PRÓXIMOS PASOS
1. Analizar catálogos disponibles
2. Crear datos de prueba realistas
3. Ejecutar pruebas paso a paso
4. Documentar resultados y errores encontrados