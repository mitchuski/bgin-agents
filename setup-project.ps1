# Kyra AI Agent - Project Setup Script
# This script sets up the project structure and creates essential files

Write-Host "🚀 Kyra AI Agent - Project Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Create detailed directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow

# Frontend directories
New-Item -ItemType Directory -Path "frontend\src" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\src\components" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\src\components\agents" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\src\components\collaboration" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\src\components\privacy" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\src\components\trust" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\src\services" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\src\types" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\src\utils" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\public" -Force | Out-Null

# Backend directories
New-Item -ItemType Directory -Path "backend\src" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\agents" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\agents\archive" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\agents\codex" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\agents\discourse" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\agents\coordination" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\knowledge" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\knowledge\repositories" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\knowledge\processing" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\knowledge\search" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\privacy" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\trust" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\integrations" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\integrations\kwaai" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\integrations\discourse-api" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\integrations\bgin-systems" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\routes" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\routes\agents" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\middleware" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\models" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\src\utils" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\tests" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\tests\integration" -Force | Out-Null
New-Item -ItemType Directory -Path "backend\tests\unit" -Force | Out-Null

# Infrastructure directories
New-Item -ItemType Directory -Path "infrastructure\docker" -Force | Out-Null
New-Item -ItemType Directory -Path "infrastructure\kubernetes" -Force | Out-Null
New-Item -ItemType Directory -Path "infrastructure\monitoring" -Force | Out-Null
New-Item -ItemType Directory -Path "infrastructure\monitoring\grafana" -Force | Out-Null
New-Item -ItemType Directory -Path "infrastructure\monitoring\grafana\dashboards" -Force | Out-Null
New-Item -ItemType Directory -Path "infrastructure\monitoring\grafana\provisioning" -Force | Out-Null
New-Item -ItemType Directory -Path "infrastructure\ssl" -Force | Out-Null

# Database directories
New-Item -ItemType Directory -Path "database\migrations" -Force | Out-Null
New-Item -ItemType Directory -Path "database\seeds" -Force | Out-Null

# Config directories
New-Item -ItemType Directory -Path "config\agents" -Force | Out-Null
New-Item -ItemType Directory -Path "config\sessions" -Force | Out-Null
New-Item -ItemType Directory -Path "config\integrations" -Force | Out-Null

Write-Host "✅ Directory structure created" -ForegroundColor Green

# Create .gitignore
Write-Host "📝 Creating .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Database
*.db
*.sqlite

# Docker
.dockerignore

# Coverage
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent

# Create root package.json
Write-Host "📦 Creating package.json files..." -ForegroundColor Yellow
$rootPackageJson = @"
{
  "name": "bgin-ai-mvp",
  "version": "1.0.0",
  "description": "Kyra AI Agent - Sovereign AI with Privacy by Design",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:frontend": "cd frontend && npm run start",
    "start:backend": "cd backend && npm run start",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "docker:dev": "docker-compose up -d",
    "docker:prod": "docker-compose -f docker-compose.production.yml up -d",
    "setup": "npm install && cd frontend && npm install && cd ../backend && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
"@

Set-Content -Path "package.json" -Value $rootPackageJson

# Create frontend package.json
$frontendPackageJson = @"
{
  "name": "kyra-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "start": "vite preview --port 3000"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "vitest": "^1.0.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.0"
  }
}
"@

Set-Content -Path "frontend\package.json" -Value $frontendPackageJson

# Create backend package.json
$backendPackageJson = @"
{
  "name": "kyra-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.1",
    "axios": "^1.6.0",
    "openai": "^4.20.0",
    "langchain": "^0.0.200"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/pg": "^8.10.7",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/uuid": "^9.0.7",
    "@types/node": "^20.9.0",
    "typescript": "^5.2.2",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8"
  }
}
"@

Set-Content -Path "backend\package.json" -Value $backendPackageJson

# Create .env.example
Write-Host "🔧 Creating environment configuration..." -ForegroundColor Yellow
$envExample = @"
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/kyra_db
REDIS_URL=redis://localhost:6379

# API Configuration
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-32-character-encryption-key

# External Services
KWAAI_API_URL=https://api.kwaai.com
DISCOURSE_API_URL=https://your-discourse-instance.com
DISCOURSE_API_KEY=your-discourse-api-key

# Privacy & Trust
PRIVACY_MODE=strict
TRUST_THRESHOLD=0.7
ANONYMIZATION_LEVEL=high

# Agent Configuration
ARCHIVE_AGENT_ENABLED=true
CODEX_AGENT_ENABLED=true
DISCOURSE_AGENT_ENABLED=true
"@

Set-Content -Path ".env.example" -Value $envExample

# Create docker-compose.yml
Write-Host "🐳 Creating Docker configuration..." -ForegroundColor Yellow
$dockerCompose = @"
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: kyra_db
      POSTGRES_USER: kyra_user
      POSTGRES_PASSWORD: kyra_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://kyra_user:kyra_password@postgres:5432/kyra_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      - VITE_API_URL=http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
"@

Set-Content -Path "docker-compose.yml" -Value $dockerCompose

# Create basic README
Write-Host "📚 Creating README..." -ForegroundColor Yellow
$readme = @"
# Kyra AI Agent - BGIN MVP

## Overview
Kyra is a sovereign AI agent implementing distributed consciousness, privacy by design, and dignity-based economics. This multi-agent system includes Archive, Codex, and Discourse agents working together to create a privacy-preserving AI governance platform.

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker Desktop
- Git

### Installation
1. Install dependencies:
   ```bash
   npm run setup
   ```

2. Start development environment:
   ```bash
   docker-compose up -d
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

## Architecture

### Multi-Agent System
- **Archive Agent**: Knowledge management and RAG (Retrieval Augmented Generation)
- **Codex Agent**: Policy analysis and standards management
- **Discourse Agent**: Community engagement and consensus building

### Key Features
- Privacy by design with selective disclosure
- Trust network and reputation system
- Kwaai integration for identity management
- Real-time collaboration and knowledge synthesis
- Anonymous contributions and community governance

## Documentation
- [Complete Setup Guide](../COMPLETE_SETUP_GUIDE.md)
- [Quick Start Checklist](../QUICK_START_CHECKLIST.md)
- [Deployment Roadmap](../DEPLOYMENT_ROADMAP.md)

## Development

### Project Structure
```
bgin-ai-mvp/
├── frontend/          # React TypeScript application
├── backend/           # Node.js Express API
├── infrastructure/    # Docker and deployment configs
├── database/          # Database migrations and seeds
├── docs/             # Documentation
└── config/           # Configuration files
```

### Available Scripts
- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run docker:dev` - Start with Docker

## Contributing
Please read our contributing guidelines and code of conduct before submitting issues or pull requests.

## License
MIT License - see LICENSE file for details.
"@

Set-Content -Path "README.md" -Value $readme

# Initialize Git repository
Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
git init
git add .
git commit -m "Initial Kyra AI Agent project setup

- Complete directory structure
- Package.json files for monorepo
- Docker configuration
- Environment setup
- Basic documentation"

Write-Host "`n🎉 Project Setup Complete!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "✅ Directory structure created" -ForegroundColor Green
Write-Host "✅ Package.json files configured" -ForegroundColor Green
Write-Host "✅ Docker configuration ready" -ForegroundColor Green
Write-Host "✅ Git repository initialized" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Install Node.js from https://nodejs.org/" -ForegroundColor White
Write-Host "2. Install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor White
Write-Host "3. Install Git from https://git-scm.com/" -ForegroundColor White
Write-Host "4. Run: npm run setup" -ForegroundColor White
Write-Host "5. Run: npm run dev" -ForegroundColor White
Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "- Complete Setup Guide: ..\COMPLETE_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "- Quick Start Checklist: ..\QUICK_START_CHECKLIST.md" -ForegroundColor White
Write-Host "- Deployment Roadmap: ..\DEPLOYMENT_ROADMAP.md" -ForegroundColor White

Write-Host "`n🚀 Ready to build the future of AI governance!" -ForegroundColor Green

