# Test BGIN AI MVP UI with Phala Cloud Integration
Write-Host "🧪 Testing BGIN AI MVP UI with Phala Cloud Integration..." -ForegroundColor Green

# Test the backend health
Write-Host "`n1. Testing BGIN AI MVP backend health..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -UseBasicParsing
    Write-Host "✅ BGIN AI MVP backend is running" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ BGIN AI MVP backend is not running" -ForegroundColor Red
    Write-Host "   Please start the backend first: npm run dev:simple" -ForegroundColor Yellow
    exit 1
}

# Test Phala Cloud health
Write-Host "`n2. Testing Phala Cloud integration..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/phala/health" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Phala Cloud integration is working" -ForegroundColor Green
    Write-Host "   WebUI Connected: $($data.data.webuiConnected)" -ForegroundColor White
    Write-Host "   LLM Service Connected: $($data.data.llmServiceConnected)" -ForegroundColor White
    Write-Host "   Confidential Compute: $($data.data.features.confidentialCompute)" -ForegroundColor White
} catch {
    Write-Host "❌ Phala Cloud integration failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test RAG query with Phala Cloud
Write-Host "`n3. Testing RAG query with Phala Cloud LLM..." -ForegroundColor Blue
$testQuery = @{
    query = "What are the key technical standards for blockchain governance?"
    sessionId = "test-session-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    userContext = @{
        userId = "test-user-123"
        privacyLevel = "maximum"
        accessRights = @("read", "analyze")
    }
    usePhala = $true
    synthesisMode = "detailed"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/phala/llm/rag" -Method POST -Body $testQuery -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ RAG query with Phala Cloud successful" -ForegroundColor Green
    Write-Host "   Response length: $($data.data.response.Length) characters" -ForegroundColor White
    Write-Host "   Phala Cloud Used: $($data.data.phalaCloudUsed)" -ForegroundColor White
    Write-Host "   Confidential Compute: $($data.data.confidentialCompute)" -ForegroundColor White
    Write-Host "   Processing time: $($data.data.metadata.processingTime)ms" -ForegroundColor White
} catch {
    Write-Host "❌ RAG query with Phala Cloud failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test existing agent endpoints
Write-Host "`n4. Testing existing multi-agent UI endpoints..." -ForegroundColor Blue

# Test Archive Agent
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/agents/archive" -Method GET -UseBasicParsing
    Write-Host "✅ Archive Agent endpoint working" -ForegroundColor Green
} catch {
    Write-Host "❌ Archive Agent endpoint failed" -ForegroundColor Red
}

# Test Codex Agent
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/agents/codex" -Method GET -UseBasicParsing
    Write-Host "✅ Codex Agent endpoint working" -ForegroundColor Green
} catch {
    Write-Host "❌ Codex Agent endpoint failed" -ForegroundColor Red
}

# Test Discourse Agent
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/agents/discourse" -Method GET -UseBasicParsing
    Write-Host "✅ Discourse Agent endpoint working" -ForegroundColor Green
} catch {
    Write-Host "❌ Discourse Agent endpoint failed" -ForegroundColor Red
}

# Test sessions endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/sessions" -Method GET -UseBasicParsing
    Write-Host "✅ Sessions endpoint working" -ForegroundColor Green
} catch {
    Write-Host "❌ Sessions endpoint failed" -ForegroundColor Red
}

Write-Host "`n🎉 BGIN AI MVP UI with Phala Cloud Integration Test Complete!" -ForegroundColor Green
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  • BGIN AI MVP Backend: http://localhost:4000" -ForegroundColor White
Write-Host "  • Frontend UI: http://localhost:3000" -ForegroundColor White
Write-Host "  • Phala Cloud: https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network" -ForegroundColor White
Write-Host "  • Health Check: http://localhost:4000/api/phala/health" -ForegroundColor White

Write-Host "`n🔧 Features Available:" -ForegroundColor Cyan
Write-Host "  • Multi-Agent UI (Archive, Codex, Discourse)" -ForegroundColor White
Write-Host "  • Phala Cloud Confidential Compute" -ForegroundColor White
Write-Host "  • Track-Specific Processing" -ForegroundColor White
Write-Host "  • Privacy-Preserving LLM Inference" -ForegroundColor White
Write-Host "  • Attestation & Signature Verification" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Access the UI: http://localhost:3000" -ForegroundColor White
Write-Host "  2. Use the multi-agent interface as normal" -ForegroundColor White
Write-Host "  3. All LLM inference now uses Phala Cloud for confidential compute" -ForegroundColor White
Write-Host "  4. Test different tracks and synthesis modes" -ForegroundColor White
