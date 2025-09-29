# BGIN AI MVP Deployment Guide

## Prerequisites

### Option 1: Docker Deployment (Recommended)
- Docker Desktop installed and running
- Docker Compose v2.0+
- At least 4GB RAM available for containers

### Option 2: Manual Deployment
- Node.js 18+ installed
- PostgreSQL 15+ installed
- Redis 7+ installed
- Git installed

## Quick Start (Docker)

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd bgin-ai-mvp
   cp env.example .env
   ```

2. **Configure Environment**
   Edit `.env` file with your settings:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://postgres:password@localhost:5432/bgin_mvp
   REDIS_URL=redis://:redispass@localhost:6379
   VECTOR_DB_URL=http://localhost:6333
   
   # Security (Generate secure keys for production)
   JWT_SECRET=your-super-secret-jwt-key-here-must-be-32-chars
   ENCRYPTION_KEY=your-32-character-encryption-key
   ANONYMIZATION_SALT=your-16-char-salt-here
   
   # API Keys (Optional for MVP)
   ANTHROPIC_API_KEY=your-anthropic-api-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   ```

3. **Start Services**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Check status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/health

## Manual Deployment

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Database**
   ```bash
   # Create PostgreSQL database
   createdb bgin_mvp
   
   # Run database initialization
   psql -d bgin_mvp -f ../database/init-db.sql
   ```

3. **Start Backend**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

## Production Deployment

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db-host:5432/bgin_mvp
REDIS_URL=redis://:password@redis-host:6379
VECTOR_DB_URL=http://qdrant-host:6333

# Generate secure keys
JWT_SECRET=<32-char-random-string>
ENCRYPTION_KEY=<32-char-random-string>
ANONYMIZATION_SALT=<16-char-random-string>

# Production API keys
ANTHROPIC_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>
```

### Docker Production

1. **Build Production Images**
   ```bash
   docker-compose -f docker-compose.production.yml build
   ```

2. **Deploy**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

## Health Checks

### Backend Health
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "vectorDb": "checking",
    "agents": "checking"
  }
}
```

### Frontend Health
```bash
curl http://localhost:3000/health
```

Expected response: `healthy`

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Redis Connection Failed**
   - Check Redis is running
   - Verify REDIS_URL in .env
   - Check Redis password

3. **Build Failures**
   - Run `npm install` in both backend and frontend
   - Check Node.js version (18+)
   - Clear node_modules and reinstall

4. **Docker Issues**
   - Ensure Docker Desktop is running
   - Check available memory (4GB+)
   - Restart Docker if needed

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## Development

### Running in Development Mode

```bash
# Start all services with hot reload
npm run dev

# Start individual services
npm run dev --workspace=backend
npm run dev --workspace=frontend
```

### Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test --workspace=backend

# Run frontend tests
npm run test --workspace=frontend
```

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Agents
- `GET /api/agents/archive/status` - Archive agent status
- `POST /api/agents/archive/process` - Process document
- `GET /api/agents/codex/status` - Codex agent status
- `POST /api/agents/codex/analyze` - Analyze policy
- `GET /api/agents/discourse/status` - Discourse agent status
- `GET /api/agents/discourse/threads` - Get discussion threads

### Synthesis
- `POST /api/synthesis/collaborate` - Multi-agent collaboration
- `GET /api/synthesis/results` - Get synthesis results

### Trust
- `GET /api/trust/network` - Get trust network
- `POST /api/trust/verify` - Verify contribution
- `GET /api/trust/reputation` - Get reputation data

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use strong, unique secrets in production
   - Rotate keys regularly

2. **Database Security**
   - Use strong passwords
   - Enable SSL in production
   - Regular backups

3. **API Security**
   - Rate limiting enabled
   - CORS configured
   - Input validation

4. **Privacy**
   - Data anonymization enabled
   - Privacy-preserving algorithms
   - Audit logging

## Monitoring

### Metrics
- Application health
- Database performance
- API response times
- Error rates

### Logs
- Application logs
- Access logs
- Error logs
- Audit logs

## Support

For issues and questions:
1. Check this deployment guide
2. Review logs for errors
3. Check GitHub issues
4. Contact development team

## Next Steps

After successful deployment:
1. Configure external services (Anthropic, OpenAI)
2. Set up monitoring and alerting
3. Configure backup strategies
4. Plan scaling strategy
5. Set up CI/CD pipeline
