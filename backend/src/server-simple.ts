// =====================================
// backend/src/server-simple.ts
// =====================================
// Simplified server for development without Docker

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './utils/config-simple';
import { logger } from './utils/logger';
import { database } from './utils/database-simple';

// Route imports
import healthRoutes from './routes/health';
import phalaRoutes from './routes/phala';

class SimpleBGINServer {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true
    }));

    // Request processing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging
    this.app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));
  }

  private setupRoutes() {
    // Health check
    this.app.use('/health', healthRoutes);
    
    // Phala Cloud integration
    this.app.use('/api/phala', phalaRoutes);

    // LLM Chat endpoint
    this.app.post('/api/chat', async (req, res) => {
      try {
        const { message, agent, session } = req.body;
        
        // For now, return a mock response
        // In production, this would call the actual LLM service
        const response = {
          content: `[${agent || 'Archive'}] I understand you're asking about "${message}". This is a mock response from the BGIN Multi-Agent System. In a full implementation, this would connect to our LLM service for intelligent responses.`,
          agent: agent || 'archive',
          session: session || 'default',
          timestamp: new Date().toISOString(),
          confidence: 0.85
        };
        
        res.json(response);
      } catch (error) {
        logger.error('Chat endpoint error:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
      }
    });

    // Mock API routes for development
    this.app.get('/api/agents/archive', (req, res) => {
      res.json({
        message: 'Archive Agent - Knowledge & RAG Systems',
        status: 'active',
        capabilities: ['Document processing', 'Semantic search', 'Knowledge synthesis'],
        mockData: {
          documents: 1247,
          correlations: 34,
          lastActivity: new Date().toISOString()
        }
      });
    });

    this.app.get('/api/agents/codex', (req, res) => {
      res.json({
        message: 'Codex Agent - Policy & Standards Management',
        status: 'active',
        capabilities: ['Policy analysis', 'Compliance assessment', 'Stakeholder impact'],
        mockData: {
          frameworks: 23,
          assessments: 12,
          lastActivity: new Date().toISOString()
        }
      });
    });

    this.app.get('/api/agents/discourse', (req, res) => {
      res.json({
        message: 'Discourse Agent - Communications & Collaboration',
        status: 'active',
        capabilities: ['Community engagement', 'Consensus building', 'Trust network'],
        mockData: {
          activeThreads: 8,
          consensusItems: 4,
          lastActivity: new Date().toISOString()
        }
      });
    });

    this.app.get('/api/sessions', async (req, res) => {
      try {
        const result = await database.query('SELECT * FROM sessions');
        res.json({
          message: 'BGIN Block 13 Sessions',
          sessions: result.rows
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
      }
    });

    this.app.get('/api/agents', async (req, res) => {
      try {
        const result = await database.query('SELECT * FROM agents');
        res.json({
          message: 'Multi-Agent System Status',
          agents: result.rows
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch agents' });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  public async start() {
    try {
      // Initialize database
      await database.initialize();
      logger.info('Database connected successfully');

      // Start server
      const port = config.port || 4000;
      this.app.listen(port, () => {
        logger.info(`🚀 BGIN MVP server running on port ${port}`);
        logger.info(`Environment: ${config.nodeEnv}`);
        logger.info(`Mode: Simplified (no Docker)`);
        logger.info(`Frontend: http://localhost:3000`);
        logger.info(`API: http://localhost:4000`);
        logger.info(`Health: http://localhost:4000/health`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start server
const server = new SimpleBGINServer();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

export default server;
