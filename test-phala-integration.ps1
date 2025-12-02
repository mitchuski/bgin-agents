# Test Phala Cloud Integration Script
Write-Host "🧪 Testing Phala Cloud Integration..." -ForegroundColor Green

# Test the Phala Cloud endpoint
$phalaEndpoint = "https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network"

Write-Host "`n1. Testing Phala Cloud endpoint connectivity..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "$phalaEndpoint/v1/models" -Method GET -UseBasicParsing
    Write-Host "✅ Phala Cloud endpoint is accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ Phala Cloud endpoint is not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing BGIN AI MVP backend..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -UseBasicParsing
    Write-Host "✅ BGIN AI MVP backend is running" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ BGIN AI MVP backend is not running" -ForegroundColor Red
    Write-Host "   Please start the backend first: npm run dev:simple" -ForegroundColor Yellow
}

Write-Host "`n3. Testing Phala Cloud health check..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/phala/health" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Phala Cloud health check successful" -ForegroundColor Green
    Write-Host "   WebUI Connected: $($data.data.webuiConnected)" -ForegroundColor White
    Write-Host "   Endpoint: $($data.data.endpoint)" -ForegroundColor White
} catch {
    Write-Host "❌ Phala Cloud health check failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Testing WebUI models endpoint..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/phala/webui/models" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ WebUI models endpoint working" -ForegroundColor Green
    Write-Host "   Available models: $($data.data.models.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ WebUI models endpoint failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. Testing RAG query with WebUI..." -ForegroundColor Blue
$testQuery = @{
    query = "What are the key technical standards for blockchain governance?"
    sessionId = "test-session-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    context = "This is a test context for blockchain governance technical standards analysis."
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/phala/webui/rag/technical-standards" -Method POST -Body $testQuery -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ RAG query successful" -ForegroundColor Green
    Write-Host "   Response length: $($data.data.response.Length) characters" -ForegroundColor White
    Write-Host "   Privacy verified: $($data.data.privacyVerified)" -ForegroundColor White
    Write-Host "   Processing time: $($data.data.processingTime)ms" -ForegroundColor White
} catch {
    Write-Host "❌ RAG query failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6. Testing different tracks..." -ForegroundColor Blue
$tracks = @('regulatory-landscape', 'privacy-rights', 'cross-chain-governance')

foreach ($track in $tracks) {
    try {
        $testQuery = @{
            query = "What are the key considerations for $track?"
            sessionId = "test-session-$track-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            context = "This is a test context for $track analysis."
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "http://localhost:4000/api/phala/webui/rag/$track" -Method POST -Body $testQuery -ContentType "application/json" -UseBasicParsing
        Write-Host "✅ $track track working" -ForegroundColor Green
    } catch {
        Write-Host "❌ $track track failed" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Phala Cloud Integration Test Complete!" -ForegroundColor Green
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Phala Cloud Endpoint: $phalaEndpoint" -ForegroundColor White
Write-Host "  • BGIN AI MVP Backend: http://localhost:4000" -ForegroundColor White
Write-Host "  • API Documentation: http://localhost:4000/api/phala/health" -ForegroundColor White
Write-Host "  • WebUI Interface: $phalaEndpoint" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start your BGIN AI MVP: npm run dev:simple" -ForegroundColor White
Write-Host "  2. Test the integration: .\test-phala-integration.ps1" -ForegroundColor White
Write-Host "  3. Access the WebUI: $phalaEndpoint" -ForegroundColor White
Write-Host "  4. Use the API endpoints for RAG processing" -ForegroundColor White
