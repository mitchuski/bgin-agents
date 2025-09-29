# 🚀 BGIN AI MVP - Block 13 Meeting Deployment Guide

## 🎯 Deployment Objectives for Block 13

### Primary Goals
1. **Demonstrate Multi-Agent Architecture**: Show the three-agent system (Archive, Codex, Discourse) working together
2. **Showcase Privacy-Preserving Features**: Highlight Kwaai integration and privacy controls
3. **Present Real-Time Collaboration**: Display live multi-agent coordination capabilities
4. **Illustrate Trust Network**: Demonstrate reputation and trust relationship management

### Success Criteria
- [ ] System runs without errors
- [ ] All three agents are visible and functional
- [ ] Privacy controls are working
- [ ] Multi-agent collaboration is demonstrated
- [ ] Trust network visualization is operational

## 🔧 Pre-Deployment Setup

### 1. Environment Configuration

**Required Environment Variables**:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bgin_mvp
REDIS_URL=redis://localhost:6379
VECTOR_DB_URL=http://localhost:6333

# Security
JWT_SECRET=your-32-char-secret-key-here
ENCRYPTION_KEY=your-32-char-encryption-key-here
ANONYMIZATION_SALT=your-16-char-salt-here

# API Keys (Required for Full Functionality)
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
DISCOURSE_API_KEY=your-discourse-key
KWAAI_API_KEY=your-kwaai-key

# Privacy & Trust
PRIVACY_MODE=strict
TRUST_THRESHOLD=0.7
ANONYMIZATION_LEVEL=high
```

### 2. Database Setup

**PostgreSQL Database**:
```sql
-- Create database
CREATE DATABASE bgin_mvp;

-- Run initialization script
\i database/init-db.sql
```

**Redis Setup**:
```bash
# Start Redis server
redis-server

# Test connection
redis-cli ping
```

**Vector Database (Qdrant)**:
```bash
# Start Qdrant
docker run -p 6333:6333 qdrant/qdrant

# Test connection
curl http://localhost:6333/collections
```

### 3. Service Dependencies

**Required Services**:
- PostgreSQL 13+
- Redis 6+
- Qdrant (Vector Database)
- Node.js 18+
- Docker & Docker Compose

**Optional Services** (for full functionality):
- Anthropic Claude API
- OpenAI GPT API
- Discourse Forum
- Kwaai Privacy Platform

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

**Quick Start**:
```bash
# Clone and navigate to project
cd bgin-ai-mvp

# Copy environment file
cp env.example .env

# Edit environment variables
nano .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

**Production Deployment**:
```bash
# Use production configuration
docker-compose -f docker-compose.production.yml up -d

# Scale services if needed
docker-compose up -d --scale backend=3
```

### Option 2: Manual Development Setup

**Backend Setup**:
```bash
cd backend
npm install
npm run build
npm start
```

**Frontend Setup**:
```bash
cd frontend
npm install
npm run build
npm run preview
```

**Database Setup**:
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Start Redis
sudo systemctl start redis

# Start Qdrant
docker run -d -p 6333:6333 qdrant/qdrant
```

### Option 3: Cloud Deployment

**AWS/GCP/Azure Setup**:
1. Deploy PostgreSQL managed service
2. Deploy Redis managed service
3. Deploy Qdrant on container service
4. Deploy application on container platform
5. Configure load balancer and SSL

## 📋 Pre-Meeting Checklist

### System Health Checks
- [ ] Backend API responding (`curl http://localhost:4000/health`)
- [ ] Frontend loading (`curl http://localhost:3000`)
- [ ] Database connected (check logs)
- [ ] Redis connected (check logs)
- [ ] Vector database accessible (check logs)

### Agent Status Verification
- [ ] Archive Agent initialized
- [ ] Codex Agent initialized
- [ ] Discourse Agent initialized
- [ ] Multi-agent mode functional
- [ ] Privacy controls working

### Demo Data Preparation
- [ ] Sample documents loaded (if available)
- [ ] Test user accounts created
- [ ] Demo scenarios prepared
- [ ] Backup plans ready

## 🎭 Demo Scenarios for Block 13

### Scenario 1: Multi-Agent Collaboration
1. **Setup**: Select "Multi-Agent Mode"
2. **Action**: Ask a complex governance question
3. **Demonstration**: Show how all three agents collaborate
4. **Highlight**: Cross-agent synthesis and coordination

### Scenario 2: Privacy-Preserving Research
1. **Setup**: Select Archive Agent
2. **Action**: Upload a document or ask research question
3. **Demonstration**: Show privacy controls and anonymization
4. **Highlight**: Kwaai integration and selective disclosure

### Scenario 3: Policy Analysis
1. **Setup**: Select Codex Agent
2. **Action**: Ask about regulatory compliance
3. **Demonstration**: Show policy framework analysis
4. **Highlight**: Multi-jurisdictional analysis capabilities

### Scenario 4: Community Engagement
1. **Setup**: Select Discourse Agent
2. **Action**: Start a discussion thread
3. **Demonstration**: Show consensus building features
4. **Highlight**: Trust network and reputation system

### Scenario 5: Trust Network Visualization
1. **Setup**: Enable trust network view
2. **Action**: Show user relationships and reputation scores
3. **Demonstration**: Display trust metrics and connections
4. **Highlight**: Privacy-preserving trust relationships

## 🔌 API Integration Requirements

### Essential APIs (Minimum for Demo)
1. **Database APIs**
   - PostgreSQL connection
   - Redis caching
   - Basic CRUD operations

2. **Vector Database**
   - Qdrant connection
   - Document embedding storage
   - Similarity search

### Enhanced APIs (Full Functionality)
1. **AI/LLM Services**
   - Anthropic Claude API
   - OpenAI GPT API
   - Local Ollama models

2. **Community Platforms**
   - Discourse Forum API
   - Real-time messaging
   - User management

3. **Privacy Services**
   - Kwaai privacy platform
   - SSI identity management
   - Trust scoring algorithms

### API Configuration Steps
1. **Obtain API Keys**
   - Register for required services
   - Generate API keys
   - Set up billing/usage limits

2. **Configure Endpoints**
   - Update environment variables
   - Test API connections
   - Set up error handling

3. **Implement Rate Limiting**
   - Configure request limits
   - Set up retry logic
   - Monitor usage

## 🛠️ Troubleshooting Guide

### Common Issues

**Database Connection Errors**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U username -d bgin_mvp

# Restart if needed
sudo systemctl restart postgresql
```

**Redis Connection Issues**:
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping

# Restart if needed
sudo systemctl restart redis
```

**Vector Database Problems**:
```bash
# Check Qdrant status
docker ps | grep qdrant

# Check logs
docker logs qdrant-container

# Restart if needed
docker restart qdrant-container
```

**Agent Initialization Failures**:
- Check API key configuration
- Verify service dependencies
- Review error logs
- Test individual agent endpoints

### Performance Optimization

**Database Optimization**:
- Enable connection pooling
- Optimize query performance
- Set up proper indexing
- Monitor resource usage

**Caching Strategy**:
- Implement Redis caching
- Cache frequently accessed data
- Set appropriate TTL values
- Monitor cache hit rates

**Load Balancing**:
- Use multiple backend instances
- Implement health checks
- Set up auto-scaling
- Monitor response times

## 📊 Monitoring & Analytics

### Health Monitoring
- **System Health**: CPU, memory, disk usage
- **Service Health**: Database, Redis, Vector DB
- **API Health**: Response times, error rates
- **Agent Health**: Status, performance, errors

### User Analytics
- **User Activity**: Login, session duration, interactions
- **Agent Usage**: Query types, response times, accuracy
- **Community Engagement**: Forum activity, consensus building
- **Trust Network**: Relationship formation, reputation changes

### Performance Metrics
- **Response Times**: API calls, agent responses
- **Throughput**: Requests per second, concurrent users
- **Error Rates**: Failed requests, agent errors
- **Resource Usage**: Database queries, API calls, storage

## 🔒 Security Considerations

### Authentication & Authorization
- Implement proper JWT token management
- Set up role-based access controls
- Configure session management
- Enable audit logging

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement data anonymization
- Set up privacy controls

### API Security
- Implement rate limiting
- Use API keys and authentication
- Validate all inputs
- Monitor for suspicious activity

## 📈 Post-Deployment

### Immediate Actions
1. **Monitor System Health**
   - Check all service statuses
   - Monitor error logs
   - Verify user access

2. **Gather Feedback**
   - Collect user feedback
   - Monitor usage patterns
   - Identify improvement areas

3. **Document Issues**
   - Log any problems encountered
   - Document solutions
   - Update deployment guide

### Next Steps
1. **Data Population**
   - Follow OPERATIONAL_DATA_GUIDE.md
   - Connect to real data sources
   - Implement live data feeds

2. **Feature Enhancement**
   - Add requested features
   - Improve user experience
   - Optimize performance

3. **Scaling Preparation**
   - Plan for increased usage
   - Implement auto-scaling
   - Set up monitoring alerts

---

**Ready for Block 13!** 🚀

This deployment guide ensures the BGIN AI MVP is ready to demonstrate its multi-agent privacy-preserving capabilities at the Block 13 meeting.
