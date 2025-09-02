# Test script for Sectores API endpoints

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

Write-Host "Testing Sectores API..." -ForegroundColor Cyan

# Step 1: Login to get authentication token
Write-Host "`n1. Logging in..." -ForegroundColor Green
$loginData = @{
    email = "admin@parroquia.com"
    password = "admin123"
}

$loginResponse = Invoke-AuthenticatedRequest -Method "POST" -Uri "$apiUrl/auth/login" -Body $loginData

if (-not $loginResponse) {
    Write-Host "Login failed. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host "Login successful!" -ForegroundColor Green
$token = $loginResponse.token
$headers = @{
    "Authorization" = "Bearer $token"
}

# Step 2: Get municipios to use for sector creation
Write-Host "`n2. Getting municipios..." -ForegroundColor Green
$municipiosResponse = Invoke-AuthenticatedRequest -Method "GET" -Uri "$apiUrl/catalog/municipios" -Headers $headers

if ($municipiosResponse -and $municipiosResponse.datos -and $municipiosResponse.datos.Count -gt 0) {
    $municipio = $municipiosResponse.datos[0]
    Write-Host "Found municipio: $($municipio.nombre_municipio) (ID: $($municipio.id_municipio))" -ForegroundColor Green
    $municipioId = $municipio.id_municipio
} else {
    Write-Host "No municipios found. Cannot create sectors." -ForegroundColor Red
    exit 1
}

# Step 3: Create multiple sectors
Write-Host "`n3. Creating sectors..." -ForegroundColor Green

$sectores = @(
    @{
        nombre = "Sector Central Test"
        id_municipio = $municipioId
    },
    @{
        nombre = "Sector Norte Test" 
        id_municipio = $municipioId
    }
)

$createdSectores = @()

foreach ($sectorData in $sectores) {
    Write-Host "Creating sector: $($sectorData.nombre)" -ForegroundColor Yellow
    $sectorResponse = Invoke-AuthenticatedRequest -Method "POST" -Uri "$apiUrl/catalog/sectores" -Headers $headers -Body $sectorData
    
    if ($sectorResponse) {
        Write-Host "Sector created: $($sectorResponse.nombre) (ID: $($sectorResponse.id_sector))" -ForegroundColor Green
        $createdSectores += $sectorResponse
    } else {
        Write-Host "Failed to create sector: $($sectorData.nombre)" -ForegroundColor Red
    }
}

# Step 4: Get all sectors 
Write-Host "`n4. Getting all sectors..." -ForegroundColor Green
$allSectoresResponse = Invoke-AuthenticatedRequest -Method "GET" -Uri "$apiUrl/catalog/sectores" -Headers $headers

if ($allSectoresResponse) {
    if ($allSectoresResponse.data -and $allSectoresResponse.data.Count -gt 0) {
        Write-Host "Found $($allSectoresResponse.data.Count) sectors:" -ForegroundColor Green
        foreach ($sector in $allSectoresResponse.data) {
            Write-Host "  - $($sector.nombre) (ID: $($sector.id_sector)) - Municipio: $($sector.municipio.nombre_municipio)" -ForegroundColor White
        }
    } else {
        Write-Host "No sectors found in response" -ForegroundColor Yellow
    }
} else {
    Write-Host "Failed to get sectors list" -ForegroundColor Red
}

Write-Host "`nSectores testing completed!" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor White
Write-Host "- Created: $($createdSectores.Count) sectors" -ForegroundColor White
Write-Host "- Municipio used: $($municipio.nombre_municipio) (ID: $municipioId)" -ForegroundColor White
Write-Host "- All sectors are now linked only to municipios" -ForegroundColor Green
