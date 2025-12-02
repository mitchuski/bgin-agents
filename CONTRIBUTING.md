# Contributing to BGIN AI MVP

We welcome contributions to the BGIN Multi-Agent Interface project! This project follows the principles outlined in the [BGIN Agentic Framework Archive Codex](https://sync.soulbis.com/s/bgin-agentic-framework-archive-codex) for sovereign, dignity-based AI development.

## 🌟 **How to Contribute**

### **1. Fork the Repository**
```bash
git clone https://github.com/mitchuski/bgin-agents.git
cd bgin-agents
```

### **2. Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

### **3. Follow Development Guidelines**

#### **Code Standards**
- **TypeScript**: Use TypeScript for type safety
- **ESLint**: Follow ESLint configuration for code quality
- **Prettier**: Use Prettier for code formatting
- **Jest**: Write tests for new features
- **Privacy-by-Design**: Implement privacy-preserving design patterns

#### **Architecture Principles**
- **Distributed Consciousness**: Multi-agent coordination with privacy preservation
- **Privacy by Design**: Built-in privacy controls and data protection
- **Dignity-based Economics**: Fair value distribution and user sovereignty
- **Real-time Sovereignty Enforcement**: Continuous monitoring of privacy compliance
- **Cryptoeconomic Verification**: Blockchain-based trust and verification systems

### **4. Development Setup**

#### **Prerequisites**
- Node.js 18+
- npm 9+
- Git
- Ollama (for local LLM testing)

#### **Installation**
```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your configuration

# Install and start Ollama
ollama pull llama3.2:3b-instruct-q4_0

# Start development servers
npm run dev:simple  # Recommended for development
```

#### **Available Scripts**
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
```

### **5. Making Changes**

#### **Frontend Changes**
- **Location**: `frontend/src/`
- **Components**: React components in `components/`
- **Services**: API services in `services/`
- **Types**: TypeScript types in `types/`
- **Contexts**: React contexts in `contexts/`

#### **Backend Changes**
- **Location**: `backend/src/` or `simple-server.js`
- **Agents**: Agent implementations in `agents/`
- **Routes**: API routes in `routes/`
- **Middleware**: Express middleware in `middleware/`
- **Services**: Business logic in `services/`

#### **Conference Integration**
- **Sessions**: Update `CONFERENCE_SESSIONS` in `simple-server.js`
- **Tracks**: Update `CONFERENCE_TRACKS` in `simple-server.js`
- **Frontend**: Update conference browser in `BGINMultiAgentInterface.tsx`

### **6. Testing Your Changes**

#### **Local Testing**
```bash
# Start the development server
npm run dev:simple

# Test the frontend
open http://localhost:4000

# Test API endpoints
curl http://localhost:4000/api/status
curl http://localhost:4000/api/conference/sessions
```

#### **Test Coverage**
- Write unit tests for new functions
- Test API endpoints
- Test frontend components
- Test multi-agent interactions

### **7. Commit Your Changes**

#### **Commit Message Format**
```
type(scope): description

[optional body]

[optional footer]
```

#### **Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### **Examples**
```bash
git commit -m "feat(conference): add new Block 13 session"
git commit -m "fix(ui): resolve Multi Agent Hub display issue"
git commit -m "docs(readme): update installation instructions"
```

### **8. Push and Create Pull Request**

```bash
# Push your branch
git push origin feature/amazing-feature

# Create a Pull Request on GitHub
```

## 📋 **Pull Request Guidelines**

### **Before Submitting**
- [ ] Code follows TypeScript and ESLint standards
- [ ] Tests pass and coverage is maintained
- [ ] Documentation is updated if needed
- [ ] Privacy-by-design principles are followed
- [ ] Changes are compatible with existing architecture

### **Pull Request Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Privacy & Security
- [ ] Privacy-by-design principles followed
- [ ] No sensitive data exposed
- [ ] Security best practices maintained

## Related Issues
Closes #(issue number)
```

## 🏗️ **Project Structure**

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

## 🔒 **Privacy & Security Guidelines**

### **Privacy-by-Design**
- Implement privacy controls at the design stage
- Minimize data collection and processing
- Use encryption for sensitive data
- Implement data retention policies
- Provide user control over data

### **Security Best Practices**
- Validate all inputs
- Use secure authentication methods
- Implement proper error handling
- Follow OWASP guidelines
- Regular security audits

### **Data Protection**
- No hardcoded secrets or API keys
- Use environment variables for configuration
- Implement proper logging without exposing sensitive data
- Follow GDPR and privacy regulations

## 🌐 **Integration Guidelines**

### **Conference Integration**
- Follow Block 13 session structure
- Maintain track-based organization
- Implement proper session metadata
- Support Multi Agent Hub functionality

### **Agent Development**
- Follow the three-agent architecture (Archive, Codex, Discourse)
- Implement proper agent-specific functionality
- Maintain privacy and security standards
- Support multi-agent collaboration

### **API Development**
- Follow RESTful API principles
- Implement proper error handling
- Use consistent response formats
- Document all endpoints

## 🐛 **Bug Reports**

### **Before Reporting**
1. Check existing issues
2. Test with latest version
3. Verify the bug is reproducible
4. Gather relevant information

### **Bug Report Template**
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Node.js version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 91]

## Additional Context
Any other relevant information
```

## 💡 **Feature Requests**

### **Before Requesting**
1. Check existing features
2. Consider if it aligns with project goals
3. Think about implementation complexity
4. Consider privacy and security implications

### **Feature Request Template**
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other options were considered?

## Additional Context
Any other relevant information
```

## 📚 **Documentation**

### **Code Documentation**
- Use JSDoc for functions and classes
- Document complex algorithms
- Explain privacy and security considerations
- Include usage examples

### **API Documentation**
- Document all endpoints
- Include request/response examples
- Explain authentication requirements
- Document error codes

### **User Documentation**
- Keep README up to date
- Document installation and setup
- Provide usage examples
- Include troubleshooting guides

## 🤝 **Community Guidelines**

### **Code of Conduct**
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the BGIN community values

### **Communication**
- Use clear and concise language
- Provide context for suggestions
- Be open to feedback
- Ask questions when needed

## 📞 **Getting Help**

### **Resources**
- [BGIN Community](https://bgin.discourse.group/)
- [BGIN Agentic Framework Archive Codex](https://sync.soulbis.com/s/bgin-agentic-framework-archive-codex)
- [Project Documentation](./docs/)
- [GitHub Issues](https://github.com/mitchuski/bgin-agents/issues)

### **Contact**
- Create an issue for questions
- Join the BGIN community discussions
- Check the documentation first
- Reference the framework codex for architectural guidance

---

**Thank you for contributing to the BGIN AI MVP project!**

*Together, we're building a sovereign, dignity-based, privacy-preserving AI agent ecosystem for blockchain governance research and collaboration.*
