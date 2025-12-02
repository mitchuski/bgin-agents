# 🚀 BGIN AI MVP with Phala Cloud Setup Guide

## Overview

This guide shows you how to run the BGIN AI MVP with Phala Cloud integration for confidential compute capabilities in your Archive Agent.

## Prerequisites

- Docker Desktop installed and running
- PowerShell (Windows) or Bash (Linux/Mac)
- Git

## Quick Start

### 1. **Start with Phala Cloud Integration**

```powershell
# Navigate to the project directory
cd bgin-ai-mvp

# Run the Phala Cloud startup script
.\start-with-phala.ps1
```

### 2. **Manual Docker Compose Setup**

```bash
# Start core services
docker-compose up -d postgres redis qdrant backend frontend

# Start Phala Cloud service
docker-compose --profile phala up -d phala-cloud
```

## Service URLs

Once running, you'll have access to:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Phala Cloud**: http://localhost:3002
- **Health Check**: http://localhost:4000/health
- **Phala API**: http://localhost:3002/api

## Phala Cloud Configuration

### Environment Variables

Your `.env` file should include:

```env
# Phala Cloud Configuration
PHALA_PUBLIC_KEY=1c95e9d4ee9c368502581e86af0b16ab99cadca5b174134eb8ebdb639b150550
PHALA_SALT=ee17e2170d7d40dcaf3015d610837cf5
PHALA_ENDPOINT=http://localhost:3002
PHALA_REGION=us-east-1
```

### Docker Compose Services

```yaml
services:
  # Your existing BGIN AI MVP services...
  
  # Phala Cloud Next.js Starter
  phala-cloud:
    image: leechael/phala-cloud-nextjs-starter:latest
    container_name: bgin-phala-cloud
    ports:
      - "3002:3000"
    volumes:
      - /var/run/tappd.sock:/var/run/tappd.sock
    environment:
      PHALA_PUBLIC_KEY: 1c95e9d4ee9c368502581e86af0b16ab99cadca5b174134eb8ebdb639b150550
      PHALA_SALT: ee17e2170d7d40dcaf3015d610837cf5
      NODE_ENV: development
    networks:
      - bgin-network
    restart: unless-stopped
    profiles:
      - phala
```

## Testing the Integration

### 1. **Health Check**

```bash
curl http://localhost:4000/health
```

### 2. **Phala Cloud Status**

```bash
curl http://localhost:3002/api/health
```

### 3. **Test RAG with Phala Cloud**

```bash
curl -X POST http://localhost:4000/api/phala/rag/technical-standards \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the key technical standards for blockchain governance?",
    "sessionId": "test-session-123",
    "userContext": {
      "userId": "test-user-456",
      "privacyLevel": "maximum",
      "accessRights": ["read", "analyze"]
    }
  }'
```

## Track-Specific Processing

### Available Tracks

1. **Technical Standards** (`technical-standards`)
   - Focus: Technical specifications and compliance
   - Models: llama2-13b-chat, gpt-4, claude-3

2. **Regulatory Landscape** (`regulatory-landscape`)
   - Focus: Legal frameworks and requirements
   - Models: llama2-13b-chat, gpt-4, claude-3

3. **Privacy & Digital Rights** (`privacy-rights`)
   - Focus: Data sovereignty and rights protection
   - Models: llama2-13b-chat, gpt-4, claude-3

4. **Cross-Chain Governance** (`cross-chain-governance`)
   - Focus: Interoperability and coordination
   - Models: llama2-13b-chat, gpt-4, claude-3

### API Endpoints

- `POST /api/phala/rag/{track}` - Process RAG queries with confidential compute
- `GET /api/phala/models/{track}` - Get available models per track
- `GET /api/phala/privacy-report/{track}/{sessionId}` - Privacy compliance reports
- `GET /api/phala/tracks` - Track information and capabilities
- `GET /api/phala/health` - Health check for Phala Cloud integration

## Management Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f phala-cloud

# BGIN services only
docker-compose logs -f backend frontend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop only Phala Cloud
docker-compose --profile phala down

# Stop specific services
docker-compose stop phala-cloud
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart phala-cloud
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Make sure ports 3000, 3002, 4000, 5432, 6379, 6333 are available
   - Check if other services are using these ports

2. **Docker Issues**
   - Ensure Docker Desktop is running
   - Check Docker daemon status

3. **Phala Cloud Connection**
   - Verify the Phala Cloud container is running
   - Check the logs: `docker-compose logs phala-cloud`

4. **Permission Issues (Linux/Mac)**
   - Ensure `/var/run/tappd.sock` is accessible
   - May need to run with `sudo` for socket access

### Debug Commands

```bash
# Check container status
docker-compose ps

# Check Phala Cloud logs
docker-compose logs phala-cloud

# Test Phala Cloud connectivity
curl http://localhost:3002/api/health

# Check network connectivity
docker network ls
docker network inspect bgin_network
```

## Security Features

### 🔒 **Confidential AI Computing**
- All processing occurs within Intel SGX TEE enclaves
- Hardware-level security and isolation
- Memory encryption and protection

### ✅ **Verifiable Results**
- Cryptographic proof of computation integrity
- Tamper-evident processing logs
- Trust in multi-agent collaboration

### 🛡️ **Privacy Protection**
- Complete confidentiality for models and data
- FPP compliance for data sovereignty
- Dignity-based economics support

## Next Steps

1. **Test the Integration**: Use the provided API endpoints to test RAG processing
2. **Customize Tracks**: Modify track configurations for your specific needs
3. **Add Models**: Integrate additional LLM models as needed
4. **Monitor Performance**: Use the monitoring endpoints to track system performance

## Support

- **BGIN Community**: [https://bgin.discourse.group](https://bgin.discourse.group)
- **Phala Cloud Docs**: [https://github.com/Phala-Network/phala-docs](https://github.com/Phala-Network/phala-docs)
- **Technical Issues**: Create an issue in the BGIN AI MVP repository

---

**Built with ❤️ for the BGIN Community**

*This setup provides a complete confidential compute environment for your BGIN AI MVP Archive Agent, enabling privacy-preserving RAG, inference, and LLM operations per track.*
