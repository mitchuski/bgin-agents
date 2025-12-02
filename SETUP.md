# BGIN AI MVP Setup Guide

This guide will help you set up the BGIN AI MVP project for development and contribution.

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **npm 9+**: Comes with Node.js
- **Git**: [Download Git](https://git-scm.com/)
- **Ollama**: [Install Ollama](https://ollama.ai/) for local LLM
- **PostgreSQL** (optional): For production database
- **Redis** (optional): For caching

### **1. Clone the Repository**
```bash
git clone https://github.com/mitchuski/bgin-agents.git
cd bgin-agents
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Environment**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
# See Environment Variables section below
```

### **4. Install and Start Ollama**
```bash
# Download and install Ollama from https://ollama.ai/
# Then pull the required model
ollama pull llama3.2:3b-instruct-q4_0
```

### **5. Start Development Server**
```bash
# Option 1: Simple server (recommended for development)
npm run dev:simple

# Option 2: Full development environment
npm run dev
```

### **6. Access the Application**
- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

## 🔧 **Environment Variables**

### **Required Variables**
```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b-instruct-q4_0

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-here
```

### **Optional Variables**
```bash
# OpenAI Integration (optional)
OPENAI_API_KEY=your-openai-api-key-here

# Phala Cloud Integration (optional)
PHALA_CLOUD_URL=your-phala-cloud-url
PHALA_CLOUD_API_KEY=your-phala-cloud-api-key

# Discourse Integration (optional)
DISCOURSE_URL=https://bgin.discourse.group
DISCOURSE_API_KEY=your-discourse-api-key
DISCOURSE_USERNAME=your-discourse-username

# Database Configuration (optional)
DATABASE_URL=postgresql://username:password@localhost:5432/bgin_ai_mvp
REDIS_URL=redis://localhost:6379
```

## 🏗️ **Development Setup**

### **Project Structure**
```
bgin-ai-mvp/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── BGINMultiAgentInterface.tsx
│   │   │   ├── agents/       # Agent-specific components
│   │   │   ├── privacy/      # Privacy components
│   │   │   └── trust/        # Trust network components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   └── types/            # TypeScript types
│   └── package.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── agents/           # Agent implementations
│   │   │   ├── archive/      # Archive Agent
│   │   │   ├── codex/        # Codex Agent
│   │   │   └── discourse/    # Discourse Agent
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Business logic
│   │   ├── privacy/          # Privacy-preserving systems
│   │   ├── trust/            # Trust network systems
│   │   └── utils/            # Utilities
│   └── package.json
├── simple-server.js          # Simple development server
├── database/                 # Database schemas
├── docs/                     # Documentation
├── scripts/                  # Setup scripts
└── infrastructure/           # Deployment configurations
```

### **Available Scripts**
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:simple       # Start with simple backend (recommended)
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run agents:seed      # Seed agent data

# Docker
npm run docker:dev       # Start with Docker Compose
npm run docker:prod      # Start production with Docker Compose
```

## 🤖 **LLM Integration**

### **Ollama (Recommended)**
```bash
# Install Ollama
# Visit https://ollama.ai/ and download for your OS

# Pull the required model
ollama pull llama3.2:3b-instruct-q4_0

# Start Ollama server
ollama serve

# Test the model
ollama run llama3.2:3b-instruct-q4_0
```

### **OpenAI (Optional)**
```bash
# Get API key from https://platform.openai.com/api-keys
# Add to .env file
OPENAI_API_KEY=your-api-key-here
```

### **Phala Cloud (Optional)**
```bash
# Get API credentials from Phala Cloud
# Add to .env file
PHALA_CLOUD_URL=your-phala-cloud-url
PHALA_CLOUD_API_KEY=your-phala-cloud-api-key
```

## 🗄️ **Database Setup**

### **PostgreSQL (Optional)**
```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/

# Create database
createdb bgin_ai_mvp

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### **Redis (Optional)**
```bash
# Install Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases

# Start Redis
redis-server
```

## 🐳 **Docker Setup**

### **Development with Docker**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Production with Docker**
```bash
# Start production services
docker-compose -f docker-compose.production.yml up -d
```

## 🧪 **Testing**

### **Run Tests**
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="Agent Tests"
```

### **Test Coverage**
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **Integration**: Cypress (planned)

## 🔍 **Debugging**

### **Frontend Debugging**
```bash
# Start with debug mode
npm run dev:simple

# Open browser dev tools
# Check console for errors
# Use React DevTools extension
```

### **Backend Debugging**
```bash
# Start with debug mode
node --inspect simple-server.js

# Use VS Code debugger
# Set breakpoints in code
# Check server logs
```

### **Common Issues**

#### **Port Already in Use**
```bash
# Kill process on port 4000
npx kill-port 4000

# Or use different port
PORT=4001 npm run dev:simple
```

#### **Ollama Connection Issues**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

#### **Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 **Documentation**

### **Project Documentation**
- **README.md**: Main project documentation
- **CHANGELOG.md**: Version history and changes
- **CONTRIBUTING.md**: Contribution guidelines
- **SECURITY.md**: Security policies and procedures
- **docs/**: Additional documentation

### **API Documentation**
- **Backend API**: http://localhost:4000/api/status
- **Conference Sessions**: http://localhost:4000/api/conference/sessions
- **Agent Endpoints**: http://localhost:4000/api/agents

## 🚀 **Deployment**

### **Local Production**
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### **Docker Production**
```bash
# Build Docker images
docker-compose -f docker-compose.production.yml build

# Start production services
docker-compose -f docker-compose.production.yml up -d
```

### **Cloud Deployment**
- **Heroku**: Use Heroku CLI and Procfile
- **AWS**: Use Elastic Beanstalk or ECS
- **DigitalOcean**: Use App Platform or Droplets
- **Vercel**: Use Vercel CLI for frontend

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test your changes**
5. **Submit a pull request**

### **Code Standards**
- **TypeScript**: Use TypeScript for type safety
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for formatting
- **Jest**: Write tests for new features
- **Privacy-by-Design**: Follow privacy principles

### **Pull Request Process**
1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Follow the PR template**
5. **Request review** from maintainers

## 📞 **Support**

### **Getting Help**
- **GitHub Issues**: Create an issue for bugs or features
- **Discussions**: Use GitHub Discussions for questions
- **BGIN Community**: Join the BGIN Discourse community
- **Documentation**: Check the docs/ folder

### **Common Questions**
- **Q**: How do I add a new conference session?
- **A**: Update the `CONFERENCE_SESSIONS` object in `simple-server.js`

- **Q**: How do I add a new agent?
- **A**: Create a new agent file in `backend/src/agents/` and update the agent configuration

- **Q**: How do I customize the UI?
- **A**: Modify components in `frontend/src/components/` and update styles

## 🔗 **Useful Links**

- **Repository**: https://github.com/mitchuski/bgin-agents
- **BGIN Community**: https://bgin.discourse.group/
- **BGIN Framework**: https://sync.soulbis.com/s/bgin-agentic-framework-archive-codex
- **Ollama**: https://ollama.ai/
- **Node.js**: https://nodejs.org/
- **React**: https://reactjs.org/
- **TypeScript**: https://www.typescriptlang.org/

---

**Happy Coding! 🚀**

*This setup guide is part of our commitment to making the BGIN AI MVP project accessible to all contributors. If you encounter any issues, please don't hesitate to reach out for help.*
