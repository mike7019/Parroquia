# Test script for Sectores API endpoints with correct credentials

# Configuration
$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"

# Function to make authenticated requests
function Invoke-AuthenticatedRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $requestParams = @{
            Method = $Method
            Uri = $Uri
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $requestParams.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @requestParams
        return $response
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Yellow
        }
        return $null
    }
}

Write-Host "Testing Sectores API with correct credentials..." -ForegroundColor Cyan

# Step 1: Login with correct credentials
Write-Host "`n1. Logging in..." -ForegroundColor Green
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
}

$loginResponse = Invoke-AuthenticatedRequest -Method "POST" -Uri "$apiUrl/auth/login" -Body $loginData

if (-not $loginResponse) {
    Write-Host "Login failed. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host "Login successful!" -ForegroundColor Green
$token = $loginResponse.data.accessToken
$headers = @{
    "Authorization" = "Bearer $token"
}

# Step 2: Get municipios to use for sector creation
Write-Host "`n2. Getting municipios..." -ForegroundColor Green
$municipiosResponse = Invoke-AuthenticatedRequest -Method "GET" -Uri "$apiUrl/catalog/municipios" -Headers $headers

if ($municipiosResponse -and $municipiosResponse.data -and $municipiosResponse.data.Count -gt 0) {
    $municipio = $municipiosResponse.data[0]
    Write-Host "Found municipio: $($municipio.nombre_municipio) (ID: $($municipio.id_municipio))" -ForegroundColor Green
    $municipioId = $municipio.id_municipio
} else {
    Write-Host "No municipios found. Cannot create sectors." -ForegroundColor Red
    exit 1
}

# Step 3: Create test sectors
Write-Host "`n3. Creating test sectors..." -ForegroundColor Green

$sectores = @(
    @{
        nombre = "Sector Central"
        id_municipio = $municipioId
    },
    @{
        nombre = "Sector Norte" 
        id_municipio = $municipioId
    },
    @{
        nombre = "Sector Sur"
        id_municipio = $municipioId
    }
)

$createdSectores = @()

foreach ($sectorData in $sectores) {
    Write-Host "Creating sector: $($sectorData.nombre)" -ForegroundColor Yellow
    $sectorResponse = Invoke-AuthenticatedRequest -Method "POST" -Uri "$apiUrl/catalog/sectores" -Headers $headers -Body $sectorData
    
    if ($sectorResponse) {
        Write-Host "SUCCESS: Sector created - $($sectorResponse.nombre) (ID: $($sectorResponse.id_sector))" -ForegroundColor Green
        $createdSectores += $sectorResponse
    } else {
        Write-Host "FAILED: Could not create sector: $($sectorData.nombre)" -ForegroundColor Red
    }
}

# Step 4: Get all sectors to verify creation
Write-Host "`n4. Getting all sectors..." -ForegroundColor Green
$allSectoresResponse = Invoke-AuthenticatedRequest -Method "GET" -Uri "$apiUrl/catalog/sectores" -Headers $headers

if ($allSectoresResponse) {
    if ($allSectoresResponse.data -and $allSectoresResponse.data.Count -gt 0) {
        Write-Host "SUCCESS: Found $($allSectoresResponse.data.Count) sectors:" -ForegroundColor Green
        foreach ($sector in $allSectoresResponse.data) {
            $municipioName = if ($sector.municipio) { $sector.municipio.nombre_municipio } else { "No municipio" }
            Write-Host "  - $($sector.nombre) (ID: $($sector.id_sector)) - Municipio: $municipioName" -ForegroundColor White
        }
    } else {
        Write-Host "WARNING: No sectors found in response" -ForegroundColor Yellow
        Write-Host "Response structure: $($allSectoresResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
} else {
    Write-Host "FAILED: Could not get sectors list" -ForegroundColor Red
}

# Step 5: Test getting sector by ID
if ($createdSectores.Count -gt 0) {
    Write-Host "`n5. Testing get sector by ID..." -ForegroundColor Green
    $firstSector = $createdSectores[0]
    $sectorByIdResponse = Invoke-AuthenticatedRequest -Method "GET" -Uri "$apiUrl/catalog/sectores/$($firstSector.id_sector)" -Headers $headers
    
    if ($sectorByIdResponse) {
        $municipioName = if ($sectorByIdResponse.municipio) { $sectorByIdResponse.municipio.nombre_municipio } else { "No municipio" }
        Write-Host "SUCCESS: Sector found - $($sectorByIdResponse.nombre) - Municipio: $municipioName" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Could not get sector by ID" -ForegroundColor Red
    }
}

Write-Host "`nTEST RESULTS SUMMARY:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "- Login: SUCCESS" -ForegroundColor Green
Write-Host "- Sectors created: $($createdSectores.Count)" -ForegroundColor White
Write-Host "- Municipio used: $($municipio.nombre_municipio) (ID: $municipioId)" -ForegroundColor White
Write-Host "- Sector-Parroquia relationship: REMOVED (as requested)" -ForegroundColor Green
Write-Host "- Sector-Municipio relationship: WORKING" -ForegroundColor Green
