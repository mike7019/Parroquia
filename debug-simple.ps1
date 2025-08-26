# Script simple para capturar error detallado
$BaseUrl = "http://localhost:3000"
$LoginUrl = "$BaseUrl/api/auth/login"
$EncuestaUrl = "$BaseUrl/api/encuesta"

# Obtener token
$LoginData = '{"correo_electronico":"admin@parroquia.com","contrasena":"Admin123!"}'
$LoginResponse = Invoke-RestMethod -Uri $LoginUrl -Method POST -Body $LoginData -ContentType "application/json"
$Token = $LoginResponse.data.accessToken

Write-Host "Token obtenido: $Token" -ForegroundColor Green

# Datos minimos para crear familia
$FamiliaMinima = '{
    "informacionGeneral": {
        "municipio": {"id": 1, "nombre": "Medellin"},
        "apellido_familiar": "Test Simple",
        "direccion": "Calle Test 123",
        "telefono": "3001234567",
        "numero_contrato_epm": "12345678"
    },
    "vivienda": {
        "tipo_vivienda": {"id": 1, "nombre": "Casa"},
        "disposicion_basuras": {
            "recolector": true,
            "quemada": false,
            "enterrada": false,
            "recicla": false,
            "aire_libre": false,
            "no_aplica": false
        }
    },
    "servicios_agua": {
        "sistema_acueducto": {"id": 1, "nombre": "Acueducto Publico"}
    },
    "observaciones": "Test simple",
    "familyMembers": [{
        "nombres": "Juan Simple",
        "numeroIdentificacion": "11111111",
        "tipoIdentificacion": {"id": 1, "nombre": "Cedula de Ciudadania"},
        "fechaNacimiento": "1980-01-01",
        "sexo": {"id": 1, "nombre": "Masculino"},
        "telefono": "3001234567",
        "situacionCivil": {"id": 1, "nombre": "Soltero"},
        "estudio": {"id": 1, "nombre": "Universitario"},
        "parentesco": {"id": 1, "nombre": "Jefe de Hogar"},
        "comunidadCultural": {"id": 1, "nombre": "Ninguna"},
        "enfermedad": {"id": 1, "nombre": "Ninguna"},
        "talla_camisa/blusa": "L",
        "talla_pantalon": "32",
        "talla_zapato": "42",
        "profesion": {"id": 1, "nombre": "Ingeniero"}
    }],
    "deceasedMembers": []
}'

$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

Write-Host "Enviando solicitud..." -ForegroundColor Blue

try {
    $Response = Invoke-WebRequest -Uri $EncuestaUrl -Method POST -Body $FamiliaMinima -Headers $Headers
    Write-Host "EXITO:" -ForegroundColor Green
    Write-Host $Response.Content -ForegroundColor White
} catch {
    Write-Host "ERROR:" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Content:" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $Reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $ResponseBody = $Reader.ReadToEnd()
        Write-Host $ResponseBody -ForegroundColor White
    }
}
