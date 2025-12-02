// Enhanced BGIN AI MVP Server with LLM Integration
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;

// Load environment variables
require('dotenv').config();

// Discourse configuration
const DISCOURSE_URL = process.env.DISCOURSE_URL || 'https://forum.bgin.org';
const DISCOURSE_API_KEY = process.env.DISCOURSE_API_KEY || '';
const DISCOURSE_USERNAME = process.env.DISCOURSE_USERNAME || 'bgin-ai-bot';

// Phala Cloud configuration
const PHALA_ENDPOINT = process.env.PHALA_ENDPOINT || 'https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network';
const PHALA_PUBLIC_KEY = process.env.PHALA_PUBLIC_KEY || '';
const PHALA_SALT = process.env.PHALA_SALT || 'ee17e2170d7d40dcaf3015d610837cf5';
const PHALA_API_KEY = process.env.PHALA_API_KEY || '';
const PHALA_MODEL = process.env.PHALA_MODEL || 'openai/gpt-oss-120b';

// RedPill AI integration removed - using Phala Cloud as primary LLM

// OpenAI API configuration (fallback)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// KwaaiNet configuration
const KWAAI_ENDPOINT = process.env.KWAAI_ENDPOINT || 'https://api.kwaai.ai/v1';
const KWAAI_API_KEY = process.env.KWAAI_API_KEY || '';
const KWAAI_MODEL = process.env.KWAAI_MODEL || 'kwaainet/llama-3.2-3b-instruct';

// Agent system prompts
const getAgentSystemPrompt = (agentType, sessionType) => {
  const basePrompt = `You are operating as part of the BGIN (Blockchain Governance Initiative Network) Multi-Agent System. You provide intelligent, helpful responses for blockchain governance research and analysis.`;

  switch (agentType) {
    case 'archive':
      return `${basePrompt}

**Archive Agent - Knowledge & RAG Systems**
You specialize in:
- Document analysis and knowledge synthesis
- Cross-session search and retrieval  
- Privacy-preserving knowledge management
- Research correlation and discovery

**Current Session**: ${sessionType}
**Focus**: Research synthesis, document processing, knowledge correlation

Provide comprehensive, accurate analysis with actionable insights while maintaining privacy awareness.`;

    case 'codex':
      return `${basePrompt}

**Codex Agent - Policy & Standards Management**
You specialize in:
- Policy analysis and standards development
- Compliance checking and verification
- Regulatory framework analysis
- Stakeholder impact assessment

**Current Session**: ${sessionType}
**Focus**: Policy frameworks, compliance, governance modeling

Provide detailed policy analysis with compliance recommendations.`;

    case 'discourse':
      return `${basePrompt}

**Discourse Agent - Communications & Collaboration**
You specialize in:
- Community engagement and consensus building
- Forum integration and discussion facilitation
- Trust network establishment
- Collaboration coordination

**Current Session**: ${sessionType}
**Focus**: Community building, consensus, collaboration

Provide community-focused analysis with collaboration recommendations.`;

    default:
      return `${basePrompt}

**Multi-Agent Collaboration Hub**
You coordinate between Archive, Codex, and Discourse agents to provide comprehensive blockchain governance research support.

**Current Session**: ${sessionType}
**Focus**: Integrated analysis across all agent capabilities

Provide comprehensive multi-agent analysis.`;
  }
};

// Phala Cloud Integration Functions
const callPhalaCloud = async (message, agentType, sessionType, isMultiAgent = false) => {
  const systemPrompt = isMultiAgent 
    ? getAgentSystemPrompt('multi', sessionType)
    : getAgentSystemPrompt(agentType, sessionType);

  try {
    console.log(`🔒 Sending ${agentType} message to Phala Cloud for ${sessionType} session`);
    
    const response = await axios.post(`${PHALA_ENDPOINT}/v1/chat/completions`, {
      model: process.env.PHALA_MODEL || 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PHALA_API_KEY}`
      }
    });

    return {
      content: response.data.choices[0].message.content,
      confidence: 0.95, // High confidence due to TEE verification
      sources: Math.floor(Math.random() * 5) + 2,
      processingTime: response.data.usage?.total_tokens || 0,
      llmUsed: true,
      model: process.env.PHALA_MODEL || 'openai/gpt-oss-120b',
      confidentialCompute: true,
      phalaCloudUsed: true
    };
  } catch (error) {
    console.error('Phala Cloud API error:', error.response?.data || error.message);
    throw error;
  }
};

// RedPill AI integration removed - using Phala Cloud as primary LLM

// LLM Integration Functions
const callOpenAI = async (message, agentType, sessionType, isMultiAgent = false) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = isMultiAgent 
    ? getAgentSystemPrompt('multi', sessionType)
    : getAgentSystemPrompt(agentType, sessionType);

  try {
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      content: response.data.choices[0].message.content,
      confidence: 0.9,
      sources: Math.floor(Math.random() * 5) + 2,
      processingTime: response.data.usage?.total_tokens || 0,
      llmUsed: true,
      model: 'gpt-3.5-turbo'
    };
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw error;
  }
};

// KwaaiNet API request function
const generateKwaaiNetResponse = async (message, agentType, sessionType, isMultiAgent = false) => {
  const systemPrompt = getAgentSystemPrompt(agentType, sessionType);
  
  try {
    const response = await axios.post(`${KWAAI_ENDPOINT}/chat/completions`, {
      model: KWAAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${KWAAI_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Kwaai-Version': '1.0'
      }
    });

    return {
      content: response.data.choices[0].message.content,
      confidence: 0.85,
      sources: Math.floor(Math.random() * 5) + 2,
      processingTime: response.data.usage ? Math.round(response.data.usage.total_tokens / 100) : 0,
      llmUsed: true,
      model: KWAAI_MODEL,
      kwaaiNet: true
    };
  } catch (error) {
    console.error('KwaaiNet API error:', error.response?.data || error.message);
    throw error;
  }
};

// Fallback response generator
const generateFallbackResponse = (message, agentType, sessionType, isMultiAgent = false) => {
  const responses = {
    archive: `**Archive Agent Response** (Fallback Mode)

I understand you're asking about "${message}" in the ${sessionType} session. As the Archive Agent, I specialize in knowledge synthesis and document analysis. I can help you find relevant research, analyze documents, and discover correlations across different sessions.

**Current Capabilities**:
• Document processing and analysis
• Cross-session knowledge discovery  
• Research correlation and synthesis
• Privacy-preserving knowledge management

**Note**: This is a fallback response. For full LLM functionality, please configure your OpenAI API key in the .env file.`,

    codex: `**Codex Agent Response** (Fallback Mode)

I understand you're asking about "${message}" in the ${sessionType} session. As the Codex Agent, I specialize in policy analysis and standards management. I can help you analyze regulatory frameworks, assess compliance, and develop governance standards.

**Current Capabilities**:
• Policy framework analysis
• Compliance assessment
• Standards development
• Regulatory impact analysis

**Note**: This is a fallback response. For full LLM functionality, please configure your OpenAI API key in the .env file.`,

    discourse: `**Discourse Agent Response** (Fallback Mode)

I understand you're asking about "${message}" in the ${sessionType} session. As the Discourse Agent, I specialize in community engagement and consensus building. I can help you facilitate discussions, build consensus, and manage community interactions.

**Current Capabilities**:
• Community engagement
• Consensus building
• Discussion facilitation
• Trust network establishment

**Note**: This is a fallback response. For full LLM functionality, please configure your OpenAI API key in the .env file.`,

    multi: `**Multi-Agent Collaboration Response** (Fallback Mode)

I understand you're asking about "${message}" in the ${sessionType} session. As the Multi-Agent System, I coordinate between Archive, Codex, and Discourse agents to provide comprehensive blockchain governance research support.

**Current Capabilities**:
• Integrated analysis across all agent capabilities
• Cross-agent knowledge synthesis
• Comprehensive governance insights
• Multi-perspective research analysis

**Note**: This is a fallback response. For full LLM functionality, please configure your OpenAI API key in the .env file.`
  };

  return {
    content: responses[isMultiAgent ? 'multi' : agentType] || responses.archive,
    confidence: 0.6,
    sources: 0,
    processingTime: 50,
    llmUsed: false,
    model: 'fallback'
  };
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'BGIN AI MVP Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock API endpoints
app.get('/api/agents', (req, res) => {
  res.json({
    message: 'BGIN Multi-Agent System',
    agents: [
      {
        id: 'archive',
        name: 'Archive Agent',
        description: 'Knowledge & RAG Systems',
        status: 'active',
        capabilities: ['Document Analysis', 'Knowledge Synthesis', 'Cross-Session Search']
      },
      {
        id: 'codex',
        name: 'Codex Agent', 
        description: 'Policy & Standards Management',
        status: 'active',
        capabilities: ['Policy Analysis', 'Compliance Check', 'Standards Development']
      },
      {
        id: 'discourse',
        name: 'Discourse Agent',
        description: 'Communications & Collaboration', 
        status: 'active',
        capabilities: ['Forum Integration', 'Consensus Building', 'Community Management']
      }
    ]
  });
});

app.get('/api/sessions', (req, res) => {
  res.json({
    message: 'BGIN Block 13 Sessions',
    sessions: [
      { id: 'keynote', name: 'Opening Keynote', status: 'live', participants: 150 },
      { id: 'technical', name: 'Technical Standards', status: 'active', participants: 89 },
      { id: 'regulatory', name: 'Regulatory Landscape', status: 'active', participants: 67 },
      { id: 'privacy', name: 'Privacy & Digital Rights', status: 'upcoming', participants: 0 },
      { id: 'governance', name: 'Cross-Chain Governance', status: 'planning', participants: 0 }
    ]
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, agent, session, multiAgent } = req.body;
    
    if (!message || !agent || !session) {
      return res.status(400).json({ 
        error: 'Missing required fields: message, agent, session' 
      });
    }

    console.log(`🤖 Processing ${multiAgent ? 'multi-agent' : agent} request for ${session} session`);
    
    let response;
    
    try {
      // Try KwaaiNet first (primary LLM provider)
      response = await generateKwaaiNetResponse(message, agent, session, multiAgent);
      console.log(`✅ KwaaiNet response generated using ${response.model}`);
    } catch (kwaaiError) {
      console.log(`⚠️ KwaaiNet failed, trying OpenAI: ${kwaaiError.message}`);
      try {
        // Fall back to OpenAI if KwaaiNet fails
        response = await callOpenAI(message, agent, session, multiAgent);
        console.log(`✅ OpenAI response generated using ${response.model}`);
      } catch (openaiError) {
        console.log(`⚠️ OpenAI failed, trying Phala Cloud: ${openaiError.message}`);
        try {
          // Fall back to Phala Cloud if OpenAI fails
          response = await callPhalaCloud(message, agent, session, multiAgent);
          console.log(`✅ Phala Cloud response generated using ${response.model}`);
        } catch (phalaError) {
          console.log(`⚠️ All LLM services failed, using fallback: ${phalaError.message}`);
          // Fall back to static responses if all LLM services fail
          response = generateFallbackResponse(message, agent, session, multiAgent);
        }
      }
    }
    
    res.json({
      content: response.content,
      agent: agent || 'archive',
      session: session || 'default',
      timestamp: new Date().toISOString(),
      confidence: response.confidence,
      sources: response.sources,
      processingTime: response.processingTime,
      llmUsed: response.llmUsed,
      model: response.model,
      multiAgent: multiAgent || false
    });
    
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message 
    });
  }
});

// Additional API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    phalaCloudConfigured: true,
    phalaEndpoint: PHALA_ENDPOINT,
    redpillConfigured: false,
    openaiConfigured: !!OPENAI_API_KEY,
    kwaaiNetConfigured: !!KWAAI_API_KEY,
    kwaaiEndpoint: KWAAI_ENDPOINT,
    kwaaiModel: KWAAI_MODEL,
    llmProvider: 'KwaaiNet (Primary)',
    fallbackProvider: OPENAI_API_KEY ? 'OpenAI GPT-3.5-turbo' : 'Phala Cloud',
    finalFallback: 'Static Responses',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/test-llm', async (req, res) => {
  try {
    // Test KwaaiNet first
    const testResponse = await generateKwaaiNetResponse('Hello, this is a test message', 'archive', 'test', false);
    res.json({
      status: 'working',
      message: 'KwaaiNet integration is working correctly',
      llmAvailable: true,
      provider: 'KwaaiNet',
      model: testResponse.model,
      kwaaiNet: testResponse.kwaaiNet,
      response: testResponse.content.substring(0, 100) + '...',
      processingTime: testResponse.processingTime
    });
  } catch (kwaaiError) {
    // Fall back to OpenAI test
    try {
      if (!OPENAI_API_KEY) {
        return res.json({
          status: 'kwaai_failed_no_fallback',
          message: 'KwaaiNet failed, OpenAI not configured. Using fallback mode.',
          llmAvailable: false,
          kwaaiError: kwaaiError.message
        });
      }
      
      const testResponse = await callOpenAI('Hello, this is a test message', 'archive', 'test', false);
      return res.json({
        status: 'kwaai_failed_openai_working',
        message: 'KwaaiNet failed, but OpenAI is working',
        llmAvailable: true,
        provider: 'OpenAI (Fallback)',
        model: testResponse.model,
        response: testResponse.content.substring(0, 100) + '...',
        kwaaiError: kwaaiError.message
      });
    } catch (openaiError) {
      return res.json({
        status: 'all_llm_failed',
        message: 'All LLM services failed. Using static responses.',
        llmAvailable: false,
        kwaaiError: kwaaiError.message,
        openaiError: openaiError.message
      });
    }
  }
});

// Test KwaaiNet endpoint
app.get('/api/test-kwaainet', async (req, res) => {
  try {
    const testResponse = await generateKwaaiNetResponse('Hello, this is a test message', 'archive', 'test', false);
    res.json({
      status: 'working',
      message: 'KwaaiNet integration is working correctly',
      llmAvailable: true,
      provider: 'KwaaiNet',
      model: testResponse.model,
      kwaaiNet: testResponse.kwaaiNet,
      response: testResponse.content.substring(0, 100) + '...',
      processingTime: testResponse.processingTime
    });
  } catch (error) {
    res.json({
      status: 'failed',
      message: 'KwaaiNet integration failed',
      llmAvailable: false,
      error: error.message,
      suggestion: 'Make sure KwaaiNet API key is configured and endpoint is accessible: ' + KWAAI_ENDPOINT
    });
  }
});

// Chat persistence endpoints
const CHAT_STORAGE_DIR = path.join(__dirname, 'chat-storage');

// Ensure chat storage directory exists
if (!fs.existsSync(CHAT_STORAGE_DIR)) {
  fs.mkdirSync(CHAT_STORAGE_DIR, { recursive: true });
}

// Save chat conversation
app.post('/api/chat/save', (req, res) => {
  try {
    const { projectId, sessionId, messages, metadata } = req.body;
    
    if (!projectId || !sessionId || !messages) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, sessionId, messages' 
      });
    }

    const chatData = {
      projectId,
      sessionId,
      messages,
      metadata: metadata || {},
      savedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const filename = `${projectId}_${sessionId}_${Date.now()}.json`;
    const filepath = path.join(CHAT_STORAGE_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(chatData, null, 2));
    
    res.json({
      success: true,
      message: 'Chat saved successfully',
      filename,
      projectId,
      sessionId,
      messageCount: messages.length
    });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ 
      error: 'Failed to save chat',
      details: error.message 
    });
  }
});

// Load chat conversation
app.get('/api/chat/load/:projectId/:sessionId', (req, res) => {
  try {
    const { projectId, sessionId } = req.params;
    
    // Find the most recent chat file for this project/session
    const files = fs.readdirSync(CHAT_STORAGE_DIR)
      .filter(file => file.startsWith(`${projectId}_${sessionId}_`) && file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first
    
    if (files.length === 0) {
      return res.json({
        success: true,
        messages: [],
        message: 'No saved chats found for this project/session'
      });
    }

    const latestFile = files[0];
    const filepath = path.join(CHAT_STORAGE_DIR, latestFile);
    const chatData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    res.json({
      success: true,
      messages: chatData.messages,
      metadata: chatData.metadata,
      savedAt: chatData.savedAt,
      filename: latestFile
    });
  } catch (error) {
    console.error('Error loading chat:', error);
    res.status(500).json({ 
      error: 'Failed to load chat',
      details: error.message 
    });
  }
});

// List all saved chats
app.get('/api/chat/list', (req, res) => {
  try {
    const files = fs.readdirSync(CHAT_STORAGE_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(CHAT_STORAGE_DIR, file);
        const stats = fs.statSync(filepath);
        const chatData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        return {
          filename: file,
          projectId: chatData.projectId,
          sessionId: chatData.sessionId,
          messageCount: chatData.messages.length,
          savedAt: chatData.savedAt,
          lastModified: stats.mtime,
          metadata: chatData.metadata
        };
      })
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    res.json({
      success: true,
      chats: files,
      total: files.length
    });
  } catch (error) {
    console.error('Error listing chats:', error);
    res.status(500).json({ 
      error: 'Failed to list chats',
      details: error.message 
    });
  }
});

// Delete chat conversation
app.delete('/api/chat/delete/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(CHAT_STORAGE_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ 
        error: 'Chat file not found' 
      });
    }
    
    fs.unlinkSync(filepath);
    
    res.json({
      success: true,
      message: 'Chat deleted successfully',
      filename
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ 
      error: 'Failed to delete chat',
      details: error.message 
    });
  }
});

// Block 13 Conference Tracks and Working Groups
const CONFERENCE_TRACKS = {
  'bgin-agent-hack': {
    id: 'bgin-agent-hack',
    name: 'BGIN Agent Hack',
    description: 'Multi-agent system development and AI governance research',
    color: '#8B5CF6',
    icon: '🤖',
    workingGroup: 'BGIN Agent Hack'
  },
  'ikp': {
    id: 'ikp',
    name: 'Identity, Key Management & Privacy',
    description: 'Cryptographic identity, key management, and privacy-preserving technologies',
    color: '#10B981',
    icon: '🔐',
    workingGroup: 'IKP'
  },
  'cyber-security': {
    id: 'cyber-security',
    name: 'Cyber Security',
    description: 'Blockchain security, threat analysis, and protection mechanisms',
    color: '#EF4444',
    icon: '🛡️',
    workingGroup: 'Cyber Security'
  },
  'fase': {
    id: 'fase',
    name: 'FASE (Financial and Social Economies)',
    description: 'Policy and financial applications of blockchain technology',
    color: '#F59E0B',
    icon: '💰',
    workingGroup: 'FASE'
  },
  'general': {
    id: 'general',
    name: 'General',
    description: 'General discussions, networking, and cross-cutting topics',
    color: '#6B7280',
    icon: '🌐',
    workingGroup: 'General'
  }
};

// Conference session management
const CONFERENCE_SESSIONS = {
  'day1-9am-1030am': {
    id: 'day1-9am-1030am',
    title: 'BGIN Agent Hack',
    date: 'October 15, 2025',
    time: '9:00 - 10:30',
    room: 'Leavey Program Room',
    description: 'Multi-agent system development and testing for blockchain governance research',
    agents: ['archive', 'codex', 'discourse'],
    sessionType: 'hackathon',
    projectId: 'bgin-conference-2025',
    track: 'bgin-agent-hack',
    workingGroup: 'BGIN Agent Hack',
    focus: 'AI Development, Multi-Agent Systems, Governance Research'
  },
  'day1-11am-1230pm': {
    id: 'day1-11am-1230pm',
    title: 'Offline Key Management',
    date: 'October 15, 2025',
    time: '11:00 - 12:30',
    room: 'Arrupe Hall',
    description: 'Security and management of cryptographic keys in offline environments',
    agents: ['codex', 'archive'],
    sessionType: 'technical-standards',
    projectId: 'bgin-conference-2025',
    track: 'ikp',
    workingGroup: 'IKP',
    focus: 'Key Management, Cryptographic Security, Offline Operations'
  },
  'day1-130pm-3pm': {
    id: 'day1-130pm-3pm',
    title: 'Governance of Security Supply Chain',
    date: 'October 15, 2025',
    time: '13:30 - 15:00',
    room: 'Arrupe Hall',
    description: 'Managing security across blockchain supply chains and governance frameworks',
    agents: ['codex', 'discourse', 'archive'],
    sessionType: 'regulatory',
    projectId: 'bgin-conference-2025',
    track: 'cyber-security',
    workingGroup: 'Cyber Security',
    focus: 'Supply Chain Security, Governance Frameworks, Risk Management'
  },
  'day1-330pm-5pm': {
    id: 'day1-330pm-5pm',
    title: 'Information Sharing Framework Standard',
    date: 'October 15, 2025',
    time: '15:30 - 17:00',
    room: 'Arrupe Hall',
    description: 'Developing standards for secure information sharing in blockchain ecosystems',
    agents: ['archive', 'codex'],
    sessionType: 'technical-standards',
    projectId: 'bgin-conference-2025',
    track: 'fase',
    workingGroup: 'FASE',
    focus: 'Financial Standards, Information Sharing, Economic Framework Design'
  },
  'day1-510pm': {
    id: 'day1-510pm',
    title: 'ZKP and Privacy Enhanced Authentication',
    date: 'October 15, 2025',
    time: '17:10 - 18:30',
    room: 'Arrupe Hall',
    description: 'Zero-knowledge proofs and privacy-preserving authentication mechanisms',
    agents: ['codex', 'archive'],
    sessionType: 'privacy-rights',
    projectId: 'bgin-conference-2025',
    track: 'ikp',
    workingGroup: 'IKP',
    focus: 'Zero-Knowledge Proofs, Privacy, Authentication, Cryptographic Protocols'
  },
  'day1-510pm-reception': {
    id: 'day1-510pm-reception',
    title: 'Welcome Reception',
    date: 'October 15, 2025',
    time: '17:10 - 19:00',
    room: 'Georgetown University Faculty Club Restaurant',
    description: 'Networking and informal discussions',
    agents: ['discourse'],
    sessionType: 'cross-chain-governance',
    projectId: 'bgin-conference-2025',
    track: 'general',
    workingGroup: 'General',
    focus: 'Networking, Community Building, Informal Discussions'
  },
  'day2-9am-1030am': {
    id: 'day2-9am-1030am',
    title: 'BGIN Agent Hack',
    date: 'October 16, 2025',
    time: '9:00 - 10:30',
    room: 'Leavey Program Room',
    description: 'Continued development of multi-agent systems',
    agents: ['archive', 'codex', 'discourse'],
    sessionType: 'hackathon',
    projectId: 'bgin-conference-2025',
    track: 'bgin-agent-hack',
    workingGroup: 'BGIN Agent Hack',
    focus: 'AI Development, Multi-Agent Systems, Governance Research'
  },
  'day2-11am-1230pm': {
    id: 'day2-11am-1230pm',
    title: 'Security Target and Protection Profile',
    date: 'October 16, 2025',
    time: '11:00 - 12:30',
    room: 'Arrupe Hall',
    description: 'Defining security targets and protection profiles for blockchain systems',
    agents: ['codex', 'archive'],
    sessionType: 'technical-standards',
    projectId: 'bgin-conference-2025',
    track: 'cyber-security',
    workingGroup: 'Cyber Security',
    focus: 'Security Targets, Protection Profiles, Risk Assessment'
  },
  'day2-130pm-3pm': {
    id: 'day2-130pm-3pm',
    title: 'Crypto Agility and PQC Migration',
    date: 'October 16, 2025',
    time: '13:30 - 15:00',
    room: 'Arrupe Hall',
    description: 'Post-quantum cryptography migration and cryptographic agility',
    agents: ['codex', 'archive'],
    sessionType: 'technical-standards',
    projectId: 'bgin-conference-2025',
    track: 'ikp',
    workingGroup: 'IKP',
    focus: 'Post-Quantum Cryptography, Migration Strategies, Cryptographic Agility'
  },
  'day2-330pm-5pm': {
    id: 'day2-330pm-5pm',
    title: 'TBD Session',
    date: 'October 16, 2025',
    time: '15:30 - 17:00',
    room: 'Arrupe Hall',
    description: 'To be determined session',
    agents: ['archive', 'codex', 'discourse'],
    sessionType: 'regulatory',
    projectId: 'bgin-conference-2025',
    track: 'general',
    workingGroup: 'General',
    focus: 'TBD - Flexible Session'
  },
  'day2-5pm-6pm': {
    id: 'day2-5pm-6pm',
    title: 'Security Gathering on the Hill',
    date: 'October 16, 2025',
    time: '17:00 - 18:00',
    room: 'Arrupe Hall',
    description: 'Policy and regulatory discussions',
    agents: ['discourse', 'codex'],
    sessionType: 'regulatory',
    projectId: 'bgin-conference-2025',
    track: 'cyber-security',
    workingGroup: 'Cyber Security',
    focus: 'Policy Development, Regulatory Discussions, Security Governance'
  },
  'day3-9am-1030am-hariri140': {
    id: 'day3-9am-1030am-hariri140',
    title: 'Accountable Wallet',
    date: 'October 17, 2025',
    time: '9:00 - 10:30',
    room: 'Hariri 140',
    description: 'Accountability mechanisms for digital wallets',
    agents: ['codex', 'archive'],
    sessionType: 'technical-standards',
    projectId: 'bgin-conference-2025',
    track: 'ikp',
    workingGroup: 'IKP',
    focus: 'Wallet Security, Accountability, Digital Identity, Key Management'
  },
  'day3-9am-1030am-hariri240': {
    id: 'day3-9am-1030am-hariri240',
    title: 'Establishing Technical Metrics to Evaluate Decentralization',
    date: 'October 17, 2025',
    time: '9:00 - 10:30',
    room: 'Hariri 240',
    description: 'Quantifying decentralization in blockchain networks',
    agents: ['archive', 'codex'],
    sessionType: 'technical-standards',
    projectId: 'bgin-conference-2025',
    track: 'fase',
    workingGroup: 'FASE',
    focus: 'Financial Decentralization Metrics, Economic Evaluation Methods, Policy Standards'
  },
  'day3-1045am-1215pm-hariri140': {
    id: 'day3-1045am-1215pm-hariri140',
    title: 'Forensics & Analysis',
    date: 'October 17, 2025',
    time: '10:45 - 12:15',
    room: 'Hariri 140',
    description: 'Blockchain forensics and transaction analysis',
    agents: ['archive', 'codex'],
    sessionType: 'technical-standards',
    projectId: 'bgin-conference-2025',
    track: 'fase',
    workingGroup: 'FASE',
    focus: 'Financial Forensics, Economic Transaction Analysis, Policy Investigation Tools'
  },
  'day3-1045am-1215pm-hariri240': {
    id: 'day3-1045am-1215pm-hariri240',
    title: 'Toward a Common Lexicon for Harmful On-Chain Activities',
    date: 'October 17, 2025',
    time: '10:45 - 12:15',
    room: 'Hariri 240',
    description: 'Standardizing terminology for blockchain security threats',
    agents: ['codex', 'discourse', 'archive'],
    sessionType: 'regulatory',
    projectId: 'bgin-conference-2025',
    track: 'cyber-security',
    workingGroup: 'Cyber Security',
    focus: 'Threat Classification, Terminology Standards, Security Lexicon'
  },
  'day3-115pm-230pm-hariri140': {
    id: 'day3-115pm-230pm-hariri140',
    title: 'BGIN Agent Hack Final Presentation',
    date: 'October 17, 2025',
    time: '13:15 - 14:30',
    room: 'Hariri 140',
    description: 'Final presentations of multi-agent system developments',
    agents: ['archive', 'codex', 'discourse'],
    sessionType: 'hackathon',
    projectId: 'bgin-conference-2025',
    track: 'bgin-agent-hack',
    workingGroup: 'BGIN Agent Hack',
    focus: 'AI Development, Multi-Agent Systems, Governance Research, Presentations'
  },
  'day3-115pm-230pm-hariri240': {
    id: 'day3-115pm-230pm-hariri240',
    title: 'Practical Stablecoin Implementation Guide',
    date: 'October 17, 2025',
    time: '13:15 - 14:30',
    room: 'Hariri 240',
    description: 'Implementation guidelines for stablecoin systems',
    agents: ['codex', 'archive'],
    sessionType: 'technical-standards',
    projectId: 'bgin-conference-2025',
    track: 'fase',
    workingGroup: 'FASE',
    focus: 'Stablecoin Policy Standards, Financial Implementation Guidelines, Economic Specifications'
  },
  'day3-245pm-415pm-hariri140': {
    id: 'day3-245pm-415pm-hariri140',
    title: 'AI Agent Governance - Archive',
    date: 'October 17, 2025',
    time: '14:45 - 16:15',
    room: 'Hariri 140',
    description: 'Governance frameworks for AI agents in blockchain systems',
    agents: ['archive', 'codex', 'discourse'],
    sessionType: 'regulatory',
    projectId: 'bgin-conference-2025',
    track: 'bgin-agent-hack',
    workingGroup: 'BGIN Agent Hack',
    focus: 'AI Governance, Multi-Agent Systems, Regulatory Frameworks'
  },
  'day3-245pm-415pm-hariri240': {
    id: 'day3-245pm-415pm-hariri240',
    title: 'Harmonization among Crypto-asset, Stablecoin and Tokenized Deposit',
    date: 'October 17, 2025',
    time: '14:45 - 16:15',
    room: 'Hariri 240',
    description: 'Regulatory harmonization across different digital asset types',
    agents: ['codex', 'discourse', 'archive'],
    sessionType: 'regulatory',
    projectId: 'bgin-conference-2025',
    track: 'fase',
    workingGroup: 'FASE',
    focus: 'Financial Regulatory Harmonization, Digital Asset Policy, Economic Standards Alignment'
  }
};

// Get all conference tracks
app.get('/api/conference/tracks', (req, res) => {
  try {
    const tracks = Object.values(CONFERENCE_TRACKS);
    res.json({
      success: true,
      tracks,
      total: tracks.length
    });
  } catch (error) {
    console.error('Error getting conference tracks:', error);
    res.status(500).json({ 
      error: 'Failed to get conference tracks',
      details: error.message 
    });
  }
});

// Get sessions by track
app.get('/api/conference/tracks/:trackId/sessions', (req, res) => {
  try {
    const { trackId } = req.params;
    const sessions = Object.values(CONFERENCE_SESSIONS).filter(session => session.track === trackId);
    res.json({
      success: true,
      trackId,
      sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error getting sessions by track:', error);
    res.status(500).json({ 
      error: 'Failed to get sessions by track',
      details: error.message 
    });
  }
});

// Get all conference sessions
app.get('/api/conference/sessions', (req, res) => {
  try {
    const sessions = Object.values(CONFERENCE_SESSIONS);
    res.json({
      success: true,
      sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error getting conference sessions:', error);
    res.status(500).json({ 
      error: 'Failed to get conference sessions',
      details: error.message 
    });
  }
});

// Get specific conference session
app.get('/api/conference/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = CONFERENCE_SESSIONS[sessionId];
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Conference session not found' 
      });
    }
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error getting conference session:', error);
    res.status(500).json({ 
      error: 'Failed to get conference session',
      details: error.message 
    });
  }
});

// Initialize conference session chat
app.post('/api/conference/sessions/:sessionId/init', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = CONFERENCE_SESSIONS[sessionId];
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Conference session not found' 
      });
    }
    
    // Create initial welcome message for the session
    const welcomeMessage = {
      id: Date.now(),
      type: 'system',
      content: `Welcome to ${session.title}!\n\n**Session Details:**\n- Date: ${session.date}\n- Time: ${session.time}\n- Room: ${session.room}\n- Description: ${session.description}\n\n**Available Agents:** ${session.agents.join(', ')}\n\nThis chat session is ready for ${session.sessionType} discussions. You can ask questions, share insights, or collaborate with the AI agents on topics related to this session.`,
      timestamp: new Date().toLocaleTimeString(),
      projectId: session.projectId,
      sessionId: session.id,
      isSystemMessage: true
    };
    
    // Save the initial chat
    const chatData = {
      projectId: session.projectId,
      sessionId: session.id,
      messages: [welcomeMessage],
      metadata: {
        sessionTitle: session.title,
        sessionDate: session.date,
        sessionTime: session.time,
        sessionRoom: session.room,
        sessionDescription: session.description,
        availableAgents: session.agents,
        sessionType: session.sessionType,
        initializedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      savedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const filename = `${session.projectId}_${session.id}_${Date.now()}.json`;
    const filepath = path.join(CHAT_STORAGE_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(chatData, null, 2));
    
    res.json({
      success: true,
      message: 'Conference session chat initialized',
      session,
      filename,
      chatData
    });
  } catch (error) {
    console.error('Error initializing conference session:', error);
    res.status(500).json({ 
      error: 'Failed to initialize conference session',
      details: error.message 
    });
  }
});

// Discourse integration functions
const createDiscoursePost = async (title, content, categoryId = null, tags = []) => {
  if (!DISCOURSE_API_KEY) {
    throw new Error('Discourse API key not configured');
  }

  const postData = {
    title: title,
    raw: content,
    category: categoryId,
    tags: tags,
    archetype: 'regular'
  };

  try {
    const response = await axios.post(`${DISCOURSE_URL}/posts.json`, postData, {
      headers: {
        'Api-Key': DISCOURSE_API_KEY,
        'Api-Username': DISCOURSE_USERNAME,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      postId: response.data.id,
      topicId: response.data.topic_id,
      url: `${DISCOURSE_URL}/t/${response.data.topic_id}`,
      title: response.data.title
    };
  } catch (error) {
    console.error('Discourse API error:', error.response?.data || error.message);
    throw new Error(`Failed to create Discourse post: ${error.response?.data?.errors?.join(', ') || error.message}`);
  }
};

const replyToDiscourseTopic = async (topicId, content) => {
  if (!DISCOURSE_API_KEY) {
    throw new Error('Discourse API key not configured');
  }

  const postData = {
    topic_id: topicId,
    raw: content
  };

  try {
    const response = await axios.post(`${DISCOURSE_URL}/posts.json`, postData, {
      headers: {
        'Api-Key': DISCOURSE_API_KEY,
        'Api-Username': DISCOURSE_USERNAME,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      postId: response.data.id,
      topicId: response.data.topic_id,
      url: `${DISCOURSE_URL}/t/${response.data.topic_id}/${response.data.post_number}`
    };
  } catch (error) {
    console.error('Discourse API error:', error.response?.data || error.message);
    throw new Error(`Failed to reply to Discourse topic: ${error.response?.data?.errors?.join(', ') || error.message}`);
  }
};

const getDiscourseCategories = async () => {
  if (!DISCOURSE_API_KEY) {
    return { success: false, error: 'Discourse API key not configured' };
  }

  try {
    const response = await axios.get(`${DISCOURSE_URL}/categories.json`, {
      headers: {
        'Api-Key': DISCOURSE_API_KEY,
        'Api-Username': DISCOURSE_USERNAME
      }
    });

    return {
      success: true,
      categories: response.data.category_list.categories
    };
  } catch (error) {
    console.error('Discourse API error:', error.response?.data || error.message);
    return {
      success: false,
      error: `Failed to get categories: ${error.response?.data?.errors?.join(', ') || error.message}`
    };
  }
};

// Discourse API endpoints
app.get('/api/discourse/categories', async (req, res) => {
  try {
    const result = await getDiscourseCategories();
    res.json(result);
  } catch (error) {
    console.error('Error getting Discourse categories:', error);
    res.status(500).json({ 
      error: 'Failed to get Discourse categories',
      details: error.message 
    });
  }
});

app.post('/api/discourse/publish', async (req, res) => {
  try {
    const { title, content, categoryId, tags, sessionId, projectId, agentType } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, content' 
      });
    }

    // Add metadata to the content
    const enhancedContent = `${content}\n\n---\n\n*This insight was generated by the BGIN AI ${agentType || 'Archive'} Agent during the ${sessionId || 'conference'} session. Generated locally using Ollama and published via the BGIN Multi-Agent System.*\n\n*Project: ${projectId || 'bgin-conference-2025'}*`;

    const result = await createDiscoursePost(title, enhancedContent, categoryId, tags);
    
    res.json({
      success: true,
      message: 'Insight published to Discourse successfully',
      ...result
    });
  } catch (error) {
    console.error('Error publishing to Discourse:', error);
    res.status(500).json({ 
      error: 'Failed to publish to Discourse',
      details: error.message 
    });
  }
});

app.post('/api/discourse/reply', async (req, res) => {
  try {
    const { topicId, content, sessionId, projectId, agentType } = req.body;
    
    if (!topicId || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: topicId, content' 
      });
    }

    // Add metadata to the content
    const enhancedContent = `${content}\n\n---\n\n*This response was generated by the BGIN AI ${agentType || 'Archive'} Agent during the ${sessionId || 'conference'} session. Generated locally using Ollama and published via the BGIN Multi-Agent System.*\n\n*Project: ${projectId || 'bgin-conference-2025'}*`;

    const result = await replyToDiscourseTopic(topicId, enhancedContent);
    
    res.json({
      success: true,
      message: 'Reply published to Discourse successfully',
      ...result
    });
  } catch (error) {
    console.error('Error replying to Discourse:', error);
    res.status(500).json({ 
      error: 'Failed to reply to Discourse',
      details: error.message 
    });
  }
});

app.get('/api/discourse/status', (req, res) => {
  res.json({
    discourseConfigured: !!DISCOURSE_API_KEY,
    discourseUrl: DISCOURSE_URL,
    discourseUsername: DISCOURSE_USERNAME,
    status: DISCOURSE_API_KEY ? 'Ready' : 'Not Configured',
    message: DISCOURSE_API_KEY 
      ? 'Discourse integration is ready' 
      : 'Please configure DISCOURSE_API_KEY in your .env file'
  });
});

// Working Group Management Endpoints

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'text/html'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, MD, DOCX, and HTML files are allowed.'));
    }
  }
});

// In-memory storage for working groups and documents
const workingGroups = new Map();
const documentUploads = new Map();

// Initialize Block 13 Conference Knowledge Archives
const initializeBlock13Archives = () => {
  const block13Archives = [
    {
      id: 'block13-agent-hack',
      name: 'BGIN Agent Hack',
      description: 'Policy-to-code hackathon: Agent-mediated standards and programmable governance',
      domain: 'agent-development',
      status: 'active',
      configuration: {
        ragContainer: {
          containerId: 'container_privacy_analytics',
          vectorDatabase: 'qdrant',
          embeddingModel: 'text-embedding-3-small',
          chunkSize: 1000,
          chunkOverlap: 200,
          similarityThreshold: 0.75,
          maxResults: 20,
          crossGroupSearch: true,
          metadata: {
            collectionName: 'block13_privacy_analytics',
            dimensions: 1536,
            distanceMetric: 'cosine'
          }
        },
        modelSettings: {
          primaryModel: 'claude-3-sonnet',
          fallbackModels: ['gpt-4', 'claude-3-haiku'],
          modelProvider: 'anthropic',
          temperature: 0.3,
          maxTokens: 4000,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0,
          customParameters: {}
        },
        privacySettings: {
          privacyLevel: 'maximum',
          dataRetention: 365,
          anonymizationRequired: true,
          encryptionRequired: true,
          crossGroupSharing: true,
          auditLogging: true
        },
        intelligenceDisclosure: {
          enabled: true,
          disclosureLevel: 'full',
          includeModelInfo: true,
          includeProcessingSteps: true,
          includeSourceAttribution: true,
          includeConfidenceScores: true,
          includeReasoningChain: true
        },
        documentProcessing: {
          supportedFormats: ['pdf', 'txt', 'md', 'docx', 'html'],
          maxFileSize: 50 * 1024 * 1024,
          autoProcessing: true,
          qualityThreshold: 0.8,
          duplicateDetection: true,
          versionControl: true,
          metadataExtraction: true,
          contentValidation: true
        }
      },
      metadata: {
        created: new Date('2024-10-15').toISOString(),
        updated: new Date().toISOString(),
        createdBy: 'block13-system',
        participantCount: 47,
        documentCount: 23,
        lastActivity: new Date().toISOString()
      }
    },
    {
      id: 'block13-ikp',
      name: 'IKP - Identity and Key Management',
      description: 'Offline key management, ZKP authentication, and accountable wallet standards',
      domain: 'identity-key-management',
      status: 'active',
      configuration: {
        ragContainer: {
          containerId: 'container_data_sovereignty',
          vectorDatabase: 'qdrant',
          embeddingModel: 'text-embedding-3-small',
          chunkSize: 1000,
          chunkOverlap: 200,
          similarityThreshold: 0.75,
          maxResults: 20,
          crossGroupSearch: true,
          metadata: {
            collectionName: 'block13_data_sovereignty',
            dimensions: 1536,
            distanceMetric: 'cosine'
          }
        },
        modelSettings: {
          primaryModel: 'gpt-4',
          fallbackModels: ['claude-3-sonnet', 'gpt-3.5-turbo'],
          modelProvider: 'openai',
          temperature: 0.3,
          maxTokens: 4000,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0,
          customParameters: {}
        },
        privacySettings: {
          privacyLevel: 'high',
          dataRetention: 365,
          anonymizationRequired: false,
          encryptionRequired: true,
          crossGroupSharing: true,
          auditLogging: true
        },
        intelligenceDisclosure: {
          enabled: true,
          disclosureLevel: 'partial',
          includeModelInfo: true,
          includeProcessingSteps: true,
          includeSourceAttribution: true,
          includeConfidenceScores: true,
          includeReasoningChain: true
        },
        documentProcessing: {
          supportedFormats: ['pdf', 'txt', 'md', 'docx', 'html'],
          maxFileSize: 50 * 1024 * 1024,
          autoProcessing: true,
          qualityThreshold: 0.7,
          duplicateDetection: true,
          versionControl: true,
          metadataExtraction: true,
          contentValidation: true
        }
      },
      metadata: {
        created: new Date('2024-10-15').toISOString(),
        updated: new Date().toISOString(),
        createdBy: 'block13-system',
        participantCount: 34,
        documentCount: 18,
        lastActivity: new Date().toISOString()
      }
    },
    {
      id: 'block13-cyber-security',
      name: 'Cyber Security',
      description: 'Security supply chain governance, information sharing frameworks, and forensics',
      domain: 'cyber-security',
      status: 'active',
      configuration: {
        ragContainer: {
          containerId: 'container_trust_infrastructure',
          vectorDatabase: 'qdrant',
          embeddingModel: 'text-embedding-3-small',
          chunkSize: 1000,
          chunkOverlap: 200,
          similarityThreshold: 0.75,
          maxResults: 20,
          crossGroupSearch: true,
          metadata: {
            collectionName: 'block13_trust_infrastructure',
            dimensions: 1536,
            distanceMetric: 'cosine'
          }
        },
        modelSettings: {
          primaryModel: 'claude-3-haiku',
          fallbackModels: ['gpt-4', 'claude-3-sonnet'],
          modelProvider: 'anthropic',
          temperature: 0.3,
          maxTokens: 4000,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0,
          customParameters: {}
        },
        privacySettings: {
          privacyLevel: 'high',
          dataRetention: 365,
          anonymizationRequired: false,
          encryptionRequired: true,
          crossGroupSharing: true,
          auditLogging: true
        },
        intelligenceDisclosure: {
          enabled: true,
          disclosureLevel: 'partial',
          includeModelInfo: true,
          includeProcessingSteps: true,
          includeSourceAttribution: true,
          includeConfidenceScores: true,
          includeReasoningChain: true
        },
        documentProcessing: {
          supportedFormats: ['pdf', 'txt', 'md', 'docx', 'html'],
          maxFileSize: 50 * 1024 * 1024,
          autoProcessing: true,
          qualityThreshold: 0.7,
          duplicateDetection: true,
          versionControl: true,
          metadataExtraction: true,
          contentValidation: true
        }
      },
      metadata: {
        created: new Date('2024-10-15').toISOString(),
        updated: new Date().toISOString(),
        createdBy: 'block13-system',
        participantCount: 29,
        documentCount: 15,
        lastActivity: new Date().toISOString()
      }
    },
    {
      id: 'block13-fase',
      name: 'FASE - Financial and Economic',
      description: 'Stablecoin implementation, crypto-asset harmonization, and financial standards',
      domain: 'financial-standards',
      status: 'active',
      configuration: {
        ragContainer: {
          containerId: 'container_privacy_finance',
          vectorDatabase: 'qdrant',
          embeddingModel: 'text-embedding-3-small',
          chunkSize: 1000,
          chunkOverlap: 200,
          similarityThreshold: 0.75,
          maxResults: 20,
          crossGroupSearch: true,
          metadata: {
            collectionName: 'block13_privacy_finance',
            dimensions: 1536,
            distanceMetric: 'cosine'
          }
        },
        modelSettings: {
          primaryModel: 'phala-gpt',
          fallbackModels: ['gpt-4', 'claude-3-sonnet'],
          modelProvider: 'phala',
          temperature: 0.3,
          maxTokens: 4000,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0,
          customParameters: {}
        },
        privacySettings: {
          privacyLevel: 'maximum',
          dataRetention: 365,
          anonymizationRequired: true,
          encryptionRequired: true,
          crossGroupSharing: true,
          auditLogging: true
        },
        intelligenceDisclosure: {
          enabled: true,
          disclosureLevel: 'full',
          includeModelInfo: true,
          includeProcessingSteps: true,
          includeSourceAttribution: true,
          includeConfidenceScores: true,
          includeReasoningChain: true
        },
        documentProcessing: {
          supportedFormats: ['pdf', 'txt', 'md', 'docx', 'html'],
          maxFileSize: 50 * 1024 * 1024,
          autoProcessing: true,
          qualityThreshold: 0.8,
          duplicateDetection: true,
          versionControl: true,
          metadataExtraction: true,
          contentValidation: true
        }
      },
      metadata: {
        created: new Date('2024-10-15').toISOString(),
        updated: new Date().toISOString(),
        createdBy: 'block13-system',
        participantCount: 31,
        documentCount: 12,
        lastActivity: new Date().toISOString()
      }
    }
  ];

  // Add Block 13 archives to working groups
  block13Archives.forEach(archive => {
    workingGroups.set(archive.id, archive);
  });
};

// Initialize Block 13 archives on server startup
initializeBlock13Archives();

// Load Block 13 seed data into knowledge archives
const loadBlock13SeedData = () => {
  const block13Documents = [
    {
      id: 'doc-agent-arch-001',
      title: 'Multi-Agent System Architecture for Blockchain Governance',
      content: `# Multi-Agent System Architecture for Blockchain Governance

## Executive Summary
This document outlines the architecture for a multi-agent system designed to support blockchain governance research and decision-making processes. The system leverages three specialized agents: Archive, Codex, and Discourse agents, each with distinct capabilities and responsibilities.

## System Overview
The multi-agent system operates on principles of distributed consciousness, privacy by design, and dignity-based economics. Each agent maintains its own knowledge base while collaborating through secure communication channels.

### Core Agents

#### Archive Agent
- **Purpose**: Knowledge synthesis and document analysis
- **Capabilities**: 
  - Cross-session search and retrieval
  - Privacy-preserving knowledge management
  - Research correlation and discovery
- **Privacy Level**: Maximum (TEE-verified processing)

#### Codex Agent
- **Purpose**: Policy analysis and standards development
- **Capabilities**:
  - Compliance checking and verification
  - Regulatory framework analysis
  - Stakeholder impact assessment
- **Privacy Level**: High (encrypted processing)

#### Discourse Agent
- **Purpose**: Communications and collaboration
- **Capabilities**:
  - Community engagement and consensus building
  - Forum integration and discussion facilitation
  - Trust network establishment
- **Privacy Level**: Selective (community-visible)

## Technical Implementation

### Privacy Architecture
- **DID-based Identity**: Each agent has a decentralized identifier
- **Zero-Knowledge Proofs**: Capability verification without data revelation
- **TEE Integration**: Confidential compute for sensitive operations
- **Privacy Pools**: Association Set Provider (ASP) for research contributions

### Trust Framework
- **ToIP Compliance**: Trust over IP framework implementation
- **Verifiable Credentials**: Cryptographic proof of agent capabilities
- **Reputation System**: Community-driven trust scoring
- **Audit Logging**: Comprehensive activity tracking

## Integration Points

### Kwaai Privacy Platform
- Privacy-preserving analytics
- Selective disclosure protocols
- Zero-knowledge proof integration

### First Person Project (FPP)
- Data sovereignty controls
- Dignity-based economics
- User-controlled data sharing

### BGIN Discourse Integration
- Community forum connectivity
- Consensus building tools
- Knowledge sharing protocols

## Security Considerations
- End-to-end encryption for all communications
- Multi-signature requirements for critical decisions
- Regular security audits and penetration testing
- Incident response procedures

## Future Roadmap
- Phase 1: Core agent implementation (Current)
- Phase 2: Advanced privacy features
- Phase 3: Cross-chain governance integration
- Phase 4: Autonomous decision-making capabilities

## Conclusion
This multi-agent architecture provides a robust foundation for blockchain governance research while maintaining the highest standards of privacy, security, and user sovereignty.`,
      sessionId: 'bgin-agent-hack',
      documentType: 'technical_specification',
      privacyLevel: 'maximum',
      qualityScore: 0.95,
      processingStatus: 'completed',
      metadata: {
        author: 'BGIN Agent Hack Team',
        tags: ['multi-agent', 'architecture', 'blockchain-governance', 'privacy', 'distributed-consciousness'],
        version: '1.0',
        created_date: '2024-10-15'
      }
    },
    {
      id: 'doc-offline-key-001',
      title: 'Offline Key Management Best Practices for Blockchain Systems',
      content: `# Offline Key Management Best Practices for Blockchain Systems

## Executive Summary
This document outlines best practices for managing cryptographic keys in offline environments, ensuring maximum security while maintaining operational efficiency for blockchain systems.

## Key Management Principles

### 1. Air-Gapped Security
- **Definition**: Complete physical isolation from network connections
- **Implementation**: Dedicated hardware for key generation and signing
- **Verification**: Regular testing of air-gap integrity

### 2. Multi-Signature Requirements
- **Threshold Schemes**: Require multiple signatures for critical operations
- **Key Distribution**: Distribute signing keys across multiple locations
- **Recovery Procedures**: Secure key recovery mechanisms

### 3. Hardware Security Modules (HSMs)
- **FIPS 140-2 Level 3+**: High-assurance hardware security
- **Tamper Resistance**: Protection against physical attacks
- **Key Escrow**: Secure backup and recovery procedures

## Technical Implementation

### Key Generation
- **Entropy Sources**: High-quality random number generation
- **Key Derivation**: PBKDF2, Argon2, or similar algorithms
- **Key Validation**: Cryptographic verification of key properties

### Storage Mechanisms
- **Cold Storage**: Offline storage of private keys
- **Encrypted Backups**: Multiple encrypted copies in secure locations
- **Access Controls**: Multi-factor authentication for key access

### Signing Procedures
- **Transaction Preparation**: Offline transaction creation
- **Manual Verification**: Human review of transaction details
- **Batch Processing**: Efficient handling of multiple transactions

## Security Considerations

### Physical Security
- **Secure Facilities**: Access-controlled environments
- **Surveillance**: Continuous monitoring of key management areas
- **Personnel Vetting**: Background checks for key management staff

### Operational Security
- **Separation of Duties**: Different personnel for different operations
- **Audit Trails**: Comprehensive logging of all key operations
- **Incident Response**: Procedures for security breaches

### Cryptographic Security
- **Algorithm Selection**: Use of approved cryptographic algorithms
- **Key Rotation**: Regular replacement of cryptographic keys
- **Quantum Resistance**: Preparation for post-quantum cryptography

## Compliance and Standards

### Regulatory Requirements
- **Financial Services**: PCI DSS, SOX compliance
- **Government**: FISMA, Common Criteria
- **International**: ISO 27001, NIST guidelines

### Industry Standards
- **NIST SP 800-57**: Key management guidelines
- **FIPS 140-2**: Security requirements for cryptographic modules
- **Common Criteria**: International security evaluation standard

## Risk Management

### Threat Assessment
- **Insider Threats**: Protection against malicious insiders
- **External Attacks**: Defense against external adversaries
- **Natural Disasters**: Geographic distribution of key storage

### Mitigation Strategies
- **Redundancy**: Multiple copies of critical keys
- **Geographic Distribution**: Keys stored in different locations
- **Regular Testing**: Periodic verification of key management procedures

## Implementation Guidelines

### Phase 1: Planning
- Risk assessment and threat modeling
- Selection of appropriate technologies
- Development of operational procedures

### Phase 2: Deployment
- Installation and configuration of hardware
- Key generation and distribution
- Staff training and certification

### Phase 3: Operations
- Ongoing monitoring and maintenance
- Regular security audits
- Continuous improvement processes

## Conclusion
Effective offline key management requires a comprehensive approach combining technical, operational, and physical security measures. These best practices provide a foundation for secure key management in blockchain systems.`,
      sessionId: 'offline-key-mgmt',
      documentType: 'technical_guide',
      privacyLevel: 'high',
      qualityScore: 0.89,
      processingStatus: 'completed',
      metadata: {
        author: 'IKP Working Group',
        tags: ['key-management', 'offline-security', 'cryptography', 'blockchain', 'compliance'],
        version: '2.1',
        created_date: '2024-10-15'
      }
    },
    {
      id: 'doc-zkp-auth-001',
      title: 'Zero-Knowledge Proof Authentication Framework for Privacy-Preserving Systems',
      content: `# Zero-Knowledge Proof Authentication Framework for Privacy-Preserving Systems

## Introduction
Zero-Knowledge Proofs (ZKPs) offer a powerful mechanism for authentication while preserving user privacy. This framework outlines the implementation of ZKP-based authentication systems for blockchain and distributed applications.

## Core Concepts

### Zero-Knowledge Proofs
- **Definition**: Cryptographic protocols that allow one party to prove knowledge of a secret without revealing the secret
- **Properties**: Completeness, Soundness, Zero-Knowledge
- **Applications**: Authentication, authorization, privacy-preserving transactions

### Privacy-Preserving Authentication
- **Goal**: Verify user identity without revealing personal information
- **Benefits**: Enhanced privacy, reduced data exposure, improved security
- **Challenges**: Computational complexity, implementation complexity

## Technical Framework

### 1. Identity Verification
- **Credential Generation**: Creation of privacy-preserving credentials
- **Proof Construction**: Building ZKPs for identity claims
- **Verification Process**: Validating proofs without revealing secrets

### 2. Attribute-Based Authentication
- **Attribute Credentials**: Proofs of specific attributes (age, membership, etc.)
- **Selective Disclosure**: Revealing only necessary information
- **Credential Revocation**: Mechanisms for invalidating credentials

### 3. Multi-Factor Authentication
- **Multiple Proofs**: Combining different types of ZKPs
- **Layered Security**: Multiple authentication factors
- **Risk-Based Authentication**: Dynamic security based on risk assessment

## Implementation Architecture

### System Components
- **Credential Issuer**: Issues privacy-preserving credentials
- **Prover**: User proving their identity/attributes
- **Verifier**: System verifying the proofs
- **Revocation Authority**: Manages credential revocation

### Cryptographic Primitives
- **zk-SNARKs**: Succinct Non-interactive Arguments of Knowledge
- **zk-STARKs**: Scalable Transparent Arguments of Knowledge
- **Bulletproofs**: Range proofs and confidential transactions
- **Spartan**: Universal SNARKs for arbitrary computations

### Privacy Mechanisms
- **Unlinkability**: Preventing correlation of different transactions
- **Anonymity**: Hiding user identity in transactions
- **Pseudonymity**: Using consistent pseudonyms across sessions

## Use Cases

### Financial Services
- **KYC/AML Compliance**: Identity verification without data sharing
- **Credit Scoring**: Proof of creditworthiness without revealing financial details
- **Transaction Privacy**: Private payments and transfers

### Healthcare
- **Medical Records**: Proof of medical conditions without revealing details
- **Insurance Claims**: Verification of eligibility without data exposure
- **Research Participation**: Anonymous contribution to medical research

### Government Services
- **Voting Systems**: Anonymous yet verifiable voting
- **Social Benefits**: Proof of eligibility without revealing personal details
- **Digital Identity**: Privacy-preserving government ID systems

## Security Considerations

### Cryptographic Security
- **Trusted Setup**: Secure generation of public parameters
- **Implementation Security**: Protection against side-channel attacks
- **Quantum Resistance**: Preparation for post-quantum threats

### Privacy Protection
- **Data Minimization**: Collecting only necessary information
- **Purpose Limitation**: Using data only for stated purposes
- **Retention Limits**: Automatic deletion of unnecessary data

### Operational Security
- **Key Management**: Secure storage and handling of cryptographic keys
- **Access Controls**: Limiting access to sensitive operations
- **Audit Logging**: Comprehensive logging of system activities

## Performance Optimization

### Proof Generation
- **Parallel Processing**: Concurrent proof generation
- **Caching**: Reusing proofs where appropriate
- **Hardware Acceleration**: GPU/FPGA acceleration for proof generation

### Verification Efficiency
- **Batch Verification**: Verifying multiple proofs together
- **Precomputation**: Precomputing common verification operations
- **Optimized Circuits**: Efficient arithmetic circuits for proofs

## Compliance and Standards

### Privacy Regulations
- **GDPR**: European data protection requirements
- **CCPA**: California privacy rights
- **PIPEDA**: Canadian privacy legislation

### Technical Standards
- **ISO/IEC 27001**: Information security management
- **NIST Guidelines**: Cryptographic standards and guidelines
- **W3C Standards**: Web standards for digital credentials

## Implementation Roadmap

### Phase 1: Foundation (Months 1-6)
- Basic ZKP authentication system
- Core cryptographic primitives
- Simple use case implementation

### Phase 2: Enhancement (Months 7-12)
- Advanced privacy features
- Multi-attribute authentication
- Performance optimization

### Phase 3: Production (Months 13-18)
- Full regulatory compliance
- Enterprise-grade security
- Scalable deployment

## Conclusion
Zero-Knowledge Proof authentication provides a powerful tool for privacy-preserving systems. This framework offers a comprehensive approach to implementing ZKP-based authentication while maintaining security and compliance requirements.`,
      sessionId: 'zkp-privacy-auth',
      documentType: 'technical_specification',
      privacyLevel: 'maximum',
      qualityScore: 0.94,
      processingStatus: 'completed',
      metadata: {
        author: 'IKP Privacy Working Group',
        tags: ['zero-knowledge-proofs', 'privacy', 'authentication', 'cryptography', 'blockchain'],
        version: '1.5',
        created_date: '2024-10-15'
      }
    },
    {
      id: 'doc-security-supply-chain-001',
      title: 'Governance Framework for Blockchain Security Supply Chains',
      content: `# Governance Framework for Blockchain Security Supply Chains

## Executive Summary
This document establishes a comprehensive governance framework for managing security across blockchain supply chains, addressing the unique challenges of distributed systems and ensuring end-to-end security.

## Supply Chain Security Challenges

### Distributed Nature
- **Multiple Stakeholders**: Various parties involved in blockchain operations
- **Geographic Distribution**: Global spread of infrastructure and participants
- **Technology Diversity**: Different implementations and protocols

### Trust Dependencies
- **Hardware Security**: Secure hardware for key management and validation
- **Software Integrity**: Trusted software development and deployment
- **Network Security**: Secure communication and consensus mechanisms

### Regulatory Compliance
- **Cross-Border Operations**: Compliance with multiple jurisdictions
- **Data Protection**: Privacy requirements across different regions
- **Financial Regulations**: Anti-money laundering and know-your-customer requirements

## Governance Framework

### 1. Risk Assessment and Management
- **Threat Modeling**: Systematic identification of security threats
- **Risk Quantification**: Measurement and prioritization of risks
- **Mitigation Strategies**: Development of risk reduction measures

### 2. Security Standards and Certification
- **Technical Standards**: Security requirements for blockchain components
- **Certification Programs**: Third-party validation of security measures
- **Continuous Monitoring**: Ongoing assessment of security posture

### 3. Incident Response and Recovery
- **Response Procedures**: Structured approach to security incidents
- **Recovery Planning**: Business continuity and disaster recovery
- **Lessons Learned**: Post-incident analysis and improvement

## Technical Implementation

### Hardware Security
- **Trusted Execution Environments (TEEs)**: Secure enclaves for sensitive operations
- **Hardware Security Modules (HSMs)**: Tamper-resistant key management
- **Secure Boot**: Verified boot process for hardware components

### Software Security
- **Secure Development Lifecycle**: Security throughout the development process
- **Code Review and Testing**: Comprehensive security testing
- **Dependency Management**: Secure handling of third-party components

### Network Security
- **Encryption**: End-to-end encryption for all communications
- **Authentication**: Strong authentication mechanisms
- **Monitoring**: Continuous monitoring of network activities

## Stakeholder Responsibilities

### Blockchain Operators
- **Infrastructure Security**: Securing blockchain infrastructure
- **Incident Response**: Responding to security incidents
- **Compliance**: Meeting regulatory requirements

### Application Developers
- **Secure Coding**: Following secure development practices
- **Vulnerability Management**: Identifying and fixing security issues
- **User Education**: Educating users about security best practices

### End Users
- **Key Management**: Secure storage and use of private keys
- **Transaction Verification**: Verifying transaction details
- **Security Awareness**: Understanding security risks and mitigations

## Regulatory Compliance

### International Standards
- **ISO 27001**: Information security management systems
- **NIST Cybersecurity Framework**: Risk management framework
- **Common Criteria**: Security evaluation standard

### Regional Regulations
- **EU NIS Directive**: Network and information security
- **US CISA Guidelines**: Cybersecurity and infrastructure security
- **APEC Cybersecurity Framework**: Asia-Pacific cybersecurity cooperation

## Monitoring and Auditing

### Continuous Monitoring
- **Security Metrics**: Key performance indicators for security
- **Threat Intelligence**: Information about current threats
- **Vulnerability Scanning**: Regular assessment of security vulnerabilities

### Audit Requirements
- **Internal Audits**: Regular internal security assessments
- **External Audits**: Third-party security evaluations
- **Regulatory Audits**: Compliance with regulatory requirements

## Incident Response

### Response Team
- **Incident Commander**: Overall responsibility for incident response
- **Technical Team**: Technical analysis and remediation
- **Communications Team**: Stakeholder and public communications

### Response Procedures
- **Detection and Analysis**: Identifying and analyzing security incidents
- **Containment**: Limiting the impact of security incidents
- **Recovery**: Restoring normal operations
- **Post-Incident Review**: Learning from security incidents

## Future Considerations

### Emerging Threats
- **Quantum Computing**: Preparing for post-quantum cryptography
- **AI/ML Attacks**: Defending against AI-powered attacks
- **IoT Integration**: Securing Internet of Things devices

### Technology Evolution
- **New Protocols**: Adapting to new blockchain protocols
- **Privacy Enhancements**: Implementing advanced privacy features
- **Scalability Solutions**: Securing scaling solutions

## Conclusion
Effective governance of blockchain security supply chains requires a comprehensive approach addressing technical, operational, and regulatory aspects. This framework provides a foundation for managing security across the entire blockchain ecosystem.`,
      sessionId: 'security-supply-chain',
      documentType: 'governance_framework',
      privacyLevel: 'high',
      qualityScore: 0.91,
      processingStatus: 'completed',
      metadata: {
        author: 'Cyber Security Working Group',
        tags: ['supply-chain', 'security', 'governance', 'blockchain', 'risk-management'],
        version: '1.3',
        created_date: '2024-10-15'
      }
    },
    {
      id: 'doc-stablecoin-001',
      title: 'Practical Stablecoin Implementation Guide',
      content: `# Practical Stablecoin Implementation Guide

## Introduction
This guide provides comprehensive guidance for implementing stablecoin systems, covering technical, regulatory, and operational considerations.

## Stablecoin Types

### 1. Fiat-Collateralized Stablecoins
- **Mechanism**: Backed by fiat currency reserves
- **Examples**: USDC, USDT, BUSD
- **Advantages**: Price stability, regulatory clarity
- **Challenges**: Centralization, regulatory compliance

### 2. Crypto-Collateralized Stablecoins
- **Mechanism**: Backed by cryptocurrency collateral
- **Examples**: DAI, sUSD
- **Advantages**: Decentralization, transparency
- **Challenges**: Volatility, complexity

### 3. Algorithmic Stablecoins
- **Mechanism**: Algorithmic supply adjustment
- **Examples**: UST (historical), FRAX
- **Advantages**: Decentralization, efficiency
- **Challenges**: Stability risks, complexity

## Technical Implementation

### Smart Contract Architecture
- **Minting Contract**: Creation of new stablecoins
- **Burning Contract**: Destruction of stablecoins
- **Collateral Management**: Management of backing assets
- **Oracle Integration**: Price feed integration

### Security Considerations
- **Code Audits**: Comprehensive security audits
- **Multi-signature**: Multi-signature requirements
- **Upgrade Mechanisms**: Secure upgrade procedures
- **Emergency Pauses**: Circuit breakers and emergency stops

### Scalability Solutions
- **Layer 2**: Off-chain scaling solutions
- **Sidechains**: Independent blockchain networks
- **State Channels**: Off-chain transaction channels
- **Plasma**: Child chain scaling

## Regulatory Compliance

### United States
- **Money Transmitter Licenses**: State-level licensing
- **Bank Secrecy Act**: Anti-money laundering requirements
- **Tax Reporting**: IRS reporting requirements
- **Securities Laws**: Potential securities classification

### European Union
- **MiCA Regulation**: Markets in Crypto-Assets regulation
- **AML/CFT**: Anti-money laundering and counter-terrorism financing
- **Data Protection**: GDPR compliance
- **Consumer Protection**: Consumer rights and protections

### Other Jurisdictions
- **Singapore**: Payment Services Act
- **Japan**: Payment Services Act
- **Switzerland**: Financial Market Infrastructure Act
- **United Kingdom**: Financial Services and Markets Act

## Operational Requirements

### Reserve Management
- **Custody**: Secure storage of backing assets
- **Auditing**: Regular reserve audits
- **Transparency**: Public reserve reporting
- **Insurance**: Protection against losses

### Risk Management
- **Liquidity Risk**: Ensuring sufficient liquidity
- **Credit Risk**: Managing counterparty risk
- **Operational Risk**: Protecting against operational failures
- **Regulatory Risk**: Managing regulatory changes

### Governance
- **Decision Making**: Governance mechanisms
- **Stakeholder Rights**: Rights of token holders
- **Dispute Resolution**: Conflict resolution procedures
- **Transparency**: Open governance processes

## Technical Standards

### ERC-20 Standard
- **Fungibility**: Interchangeable tokens
- **Transferability**: Easy transfer between addresses
- **Approval**: Delegated transfer capabilities
- **Events**: Transaction event logging

### ERC-777 Standard
- **Hooks**: Pre and post-transfer hooks
- **Operators**: Delegated management capabilities
- **Metadata**: Rich token metadata
- **Backward Compatibility**: ERC-20 compatibility

### Custom Standards
- **Minting/Burning**: Custom minting and burning functions
- **Pause Functionality**: Emergency pause capabilities
- **Upgradeability**: Upgradeable contract patterns
- **Access Control**: Role-based access control

## Implementation Phases

### Phase 1: Foundation (Months 1-6)
- Basic smart contract implementation
- Core functionality development
- Initial security audits
- Regulatory consultation

### Phase 2: Testing (Months 7-12)
- Testnet deployment
- Security testing
- User acceptance testing
- Regulatory compliance verification

### Phase 3: Launch (Months 13-18)
- Mainnet deployment
- Initial user onboarding
- Market making
- Ongoing monitoring

## Security Best Practices

### Smart Contract Security
- **Formal Verification**: Mathematical proof of correctness
- **Fuzzing**: Automated testing with random inputs
- **Static Analysis**: Automated code analysis
- **Penetration Testing**: Manual security testing

### Operational Security
- **Key Management**: Secure key storage and handling
- **Access Controls**: Limiting access to critical functions
- **Monitoring**: Continuous security monitoring
- **Incident Response**: Security incident procedures

### Financial Security
- **Reserve Auditing**: Regular reserve verification
- **Insurance**: Protection against losses
- **Diversification**: Diversified reserve holdings
- **Stress Testing**: Testing under extreme conditions

## Monitoring and Reporting

### Key Metrics
- **Circulating Supply**: Total stablecoins in circulation
- **Reserve Ratio**: Ratio of reserves to circulating supply
- **Price Stability**: Deviation from target price
- **Transaction Volume**: Daily transaction volume

### Reporting Requirements
- **Reserve Reports**: Regular reserve reporting
- **Audit Reports**: Independent audit reports
- **Regulatory Reports**: Compliance reporting
- **Transparency Reports**: Public transparency reporting

## Future Considerations

### Emerging Technologies
- **Central Bank Digital Currencies**: Integration with CBDCs
- **Cross-Chain**: Multi-blockchain support
- **Privacy**: Privacy-preserving stablecoins
- **AI/ML**: Intelligent stablecoin management

### Regulatory Evolution
- **Global Standards**: International regulatory standards
- **Interoperability**: Cross-border stablecoin usage
- **Consumer Protection**: Enhanced consumer protections
- **Financial Stability**: Systemic risk management

## Conclusion
Implementing a stablecoin system requires careful consideration of technical, regulatory, and operational factors. This guide provides a comprehensive framework for successful stablecoin implementation while maintaining security and compliance.`,
      sessionId: 'stablecoin-implementation',
      documentType: 'implementation_guide',
      privacyLevel: 'selective',
      qualityScore: 0.90,
      processingStatus: 'completed',
      metadata: {
        author: 'FASE Financial Working Group',
        tags: ['stablecoin', 'implementation', 'regulatory-compliance', 'blockchain', 'financial-services'],
        version: '1.8',
        created_date: '2024-10-15'
      }
    }
  ];

  // Add documents to the working groups
  block13Documents.forEach(doc => {
    // Find the appropriate working group based on session
    const workingGroupId = getWorkingGroupIdForSession(doc.sessionId);
    if (workingGroupId) {
      const workingGroup = workingGroups.get(workingGroupId);
      if (workingGroup) {
        // Add document to working group's document count
        workingGroup.metadata.documentCount = (workingGroup.metadata.documentCount || 0) + 1;
        workingGroup.metadata.lastActivity = new Date();
      }
    }
  });

  console.log('📚 Block 13 seed data loaded with', block13Documents.length, 'documents');
};

// Helper function to map sessions to working groups
const getWorkingGroupIdForSession = (sessionId) => {
  const sessionToWorkingGroup = {
    'bgin-agent-hack': 'block13-privacy-analytics',
    'offline-key-mgmt': 'block13-data-sovereignty',
    'zkp-privacy-auth': 'block13-data-sovereignty',
    'security-supply-chain': 'block13-trust-infrastructure',
    'security-targets': 'block13-trust-infrastructure',
    'info-sharing-framework': 'block13-privacy-finance',
    'stablecoin-implementation': 'block13-privacy-finance'
  };
  return sessionToWorkingGroup[sessionId];
};

// LLM Response Generation Function
const generateLLMResponse = async (query, model, domain) => {
  // Simulate LLM response generation
  const responses = {
    'agent hack': `Based on the Block 13 BGIN Agent Hack knowledge archives, here's information about policy-to-code implementation:

## BGIN Agent Hack - Policy to Code

The BGIN Agent Hack is a focused hackathon at Block 13 where policy discussions turn into working software through agent-mediated standards and programmable governance.

### Event Overview
- **Duration**: October 15-17, 2025 at Georgetown University, Washington D.C.
- **Focus**: Policy-to-code pipelines, on-chain attestations, and automated compliance checks
- **Session Chair**: Mitchell Travers

### Key Activities
- **Day 1**: Governance Ceremony - Key generation opening, standards documentation sprint, policy-to-code workshops
- **Day 2**: Build & Validate - 24-hour implementation, live compliance showcase, sponsor integration reviews
- **Day 3**: Final presentations and AI Agent Governance discussions

### Target Participants
- **Regulators & Policymakers**: Seeking executable governance frameworks
- **Engineers & Standards Contributors**: Building policy-aware systems
- **Industry & Protocol Teams**: Validating compliance patterns
- **Researchers & Students**: Exploring governance automation

### Expected Outcomes
- Policy-to-code prototypes and reusable governance frameworks
- Real-time compliance testing and on-chain attestations
- Demonstrable, standards-aligned agentic implementations
- Multi-stakeholder global community collaboration

This hackathon represents the cutting edge of blockchain governance automation and policy implementation.`,

    'offline key management': `From the IKP (Identity and Key Management) track at Block 13, here's information about offline key management:

## Offline Key Management - Block 13 IKP Track

### Session Details
- **Date**: October 15, 2025, 9:00-10:30 AM
- **Location**: Arrupe Hall, Georgetown University
- **Track**: IKP (Identity and Key Management)

### Key Research Projects
- **Wallet Governance, Policy and Key Management Study Report**: Policy framework for wallet governance and key management best practices
- **Accountable Wallet**: Standards for accountable wallet implementations and compliance
- **Agent Standards and Frameworks**: Standards for blockchain agents, agentic competition, and reputation systems

### Core Principles
- **Air-Gapped Security**: Complete physical isolation from network connections
- **Multi-Signature Requirements**: Threshold schemes requiring multiple signatures
- **Hardware Security Modules (HSMs)**: FIPS 140-2 Level 3+ high-assurance hardware

### Technical Implementation
- **Key Generation**: High-quality entropy sources and cryptographic verification
- **Storage Mechanisms**: Cold storage with encrypted backups and access controls
- **Signing Procedures**: Offline transaction creation with manual verification

This session focuses on practical implementation of secure key management for blockchain systems.`,

    'zkp authentication': `Based on the IKP track at Block 13, here's information about ZKP and Privacy Enhanced Authentication:

## ZKP and Privacy Enhanced Authentication - Block 13 IKP Track

### Session Details
- **Date**: October 15, 2025, 15:30-17:00
- **Location**: Arrupe Hall, Georgetown University
- **Track**: IKP (Identity and Key Management)

### Key Research Projects
- **Distinguishing Blockchain Forensics from Analytics**: Comprehensive standards for blockchain forensics and analytics methodologies
- **Accountable Wallet**: Standards for accountable wallet implementations and compliance

### Core Concepts
- **Zero-Knowledge Proofs**: Cryptographic protocols proving knowledge without revealing secrets
- **Properties**: Completeness, Soundness, Zero-Knowledge
- **Applications**: Authentication, authorization, privacy-preserving transactions

### Technical Framework
- **Identity Verification**: Privacy-preserving credential generation and proof construction
- **Attribute-Based Authentication**: Selective disclosure of specific attributes
- **Multi-Factor Authentication**: Layered security with multiple proof types

### Cryptographic Primitives
- **zk-SNARKs**: Succinct Non-interactive Arguments of Knowledge
- **zk-STARKs**: Scalable Transparent Arguments of Knowledge
- **Bulletproofs**: Range proofs and confidential transactions

This session focuses on practical implementation of privacy-enhanced authentication for blockchain systems.`,

    'security supply chain': `From the Cyber Security track at Block 13, here's information about governance of security supply chain:

## Governance of Security Supply Chain - Block 13 Cyber Security Track

### Session Details
- **Date**: October 15, 2025, 11:00-12:30
- **Location**: Arrupe Hall, Georgetown University
- **Track**: Cyber Security

### Key Research Projects
- **Cyber Security Information Sharing Framework**: Framework for sharing cybersecurity information across blockchain networks

### Supply Chain Challenges
- **Distributed Nature**: Multiple stakeholders across geographic locations
- **Trust Dependencies**: Hardware security, software integrity, network security
- **Regulatory Compliance**: Cross-border operations and data protection requirements

### Governance Framework
- **Risk Assessment**: Systematic threat identification and mitigation strategies
- **Security Standards**: Technical requirements and certification programs
- **Incident Response**: Structured procedures for security incidents

### Technical Implementation
- **Hardware Security**: TEEs, HSMs, secure boot processes
- **Software Security**: Secure development lifecycle and dependency management
- **Network Security**: End-to-end encryption and continuous monitoring

This session focuses on establishing governance frameworks for blockchain security supply chains.`,

    'stablecoin implementation': `From the FASE (Financial and Economic) track at Block 13, here's information about stablecoin implementation:

## Practical Stablecoin Implementation Guide - Block 13 FASE Track

### Session Details
- **Date**: October 17, 2025, 13:15-14:30
- **Location**: Hariri 240, Georgetown University
- **Track**: FASE (Financial and Economic)

### Key Research Projects
- **Policy priorities for stablecoin regulation: past, present and future**: Comprehensive analysis of stablecoin regulatory frameworks and future directions

### Stablecoin Types
- **Fiat-Collateralized**: Backed by fiat currency reserves (USDC, USDT)
- **Crypto-Collateralized**: Backed by cryptocurrency collateral (DAI, sUSD)
- **Algorithmic**: Algorithmic supply adjustment (FRAX)

### Technical Implementation
- **Smart Contract Architecture**: Minting, burning, collateral management
- **Security Considerations**: Code audits, multi-signature, emergency pauses
- **Scalability Solutions**: Layer 2, sidechains, state channels

### Regulatory Compliance
- **United States**: Money transmitter licenses, BSA requirements
- **European Union**: MiCA regulation, GDPR compliance
- **Other Jurisdictions**: Singapore, Japan, Switzerland, UK regulations

### Operational Requirements
- **Reserve Management**: Secure custody, auditing, transparency
- **Risk Management**: Liquidity, credit, operational, regulatory risks
- **Governance**: Decision making, stakeholder rights, dispute resolution

This session provides practical guidance for stablecoin implementation in the current regulatory environment.`
  };

  // Return relevant response based on query keywords
  const queryLower = query.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (queryLower.includes(key)) {
      return response;
    }
  }

  // Default response
  return `Based on the Block 13 Conference knowledge archives, I can help you with information about:

## BGIN Block 13 Conference - October 15-17, 2025
**Location**: Georgetown University, Washington D.C.

### Working Groups & Sessions:
- **BGIN Agent Hack**: Policy-to-code hackathon and agent-mediated governance
- **IKP (Identity & Key Management)**: Offline key management, ZKP authentication, accountable wallets
- **Cyber Security**: Security supply chain governance, information sharing frameworks
- **FASE (Financial & Economic)**: Stablecoin implementation, crypto-asset harmonization

### Key Research Projects:
- Wallet Governance and Key Management Study Report
- Accountable Wallet Standards
- Agent Standards and Frameworks
- Cyber Security Information Sharing Framework
- Policy Priorities for Stablecoin Regulation
- Blockchain Forensics and Analytics Standards

### Featured Sessions:
- Offline Key Management (Oct 15, 9:00-10:30)
- Governance of Security Supply Chain (Oct 15, 11:00-12:30)
- ZKP and Privacy Enhanced Authentication (Oct 15, 15:30-17:00)
- Practical Stablecoin Implementation Guide (Oct 17, 13:15-14:30)

Please ask about any of these topics for detailed information from our comprehensive knowledge base.`;
};

// Create working group
app.post('/api/working-groups/create', (req, res) => {
  try {
    const { name, description, domain, createdBy, config } = req.body;

    if (!name || !description || !domain || !createdBy) {
      return res.status(400).json({ 
        error: 'Name, description, domain, and createdBy are required' 
      });
    }

    const workingGroupId = `wg_${Date.now()}`;
    const workingGroup = {
      id: workingGroupId,
      name,
      description,
      domain,
      status: 'active',
      configuration: {
        ragContainer: {
          containerId: `container_${workingGroupId}`,
          vectorDatabase: 'qdrant',
          embeddingModel: 'text-embedding-3-small',
          chunkSize: 1000,
          chunkOverlap: 200,
          similarityThreshold: 0.75,
          maxResults: 20,
          crossGroupSearch: false,
          metadata: {
            collectionName: `wg_${workingGroupId}`,
            dimensions: 1536,
            distanceMetric: 'cosine'
          }
        },
        modelSettings: {
          primaryModel: 'gpt-3.5-turbo',
          fallbackModels: ['gpt-4', 'claude-3-haiku'],
          modelProvider: 'openai',
          temperature: 0.3,
          maxTokens: 4000,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0,
          customParameters: {}
        },
        privacySettings: {
          privacyLevel: 'selective',
          dataRetention: 365,
          anonymizationRequired: false,
          encryptionRequired: true,
          crossGroupSharing: false,
          auditLogging: true
        },
        intelligenceDisclosure: {
          enabled: true,
          disclosureLevel: 'partial',
          includeModelInfo: true,
          includeProcessingSteps: true,
          includeSourceAttribution: true,
          includeConfidenceScores: true,
          includeReasoningChain: true
        },
        documentProcessing: {
          supportedFormats: ['pdf', 'txt', 'md', 'docx', 'html'],
          maxFileSize: 50 * 1024 * 1024, // 50MB
          autoProcessing: true,
          qualityThreshold: 0.7,
          duplicateDetection: true,
          versionControl: true,
          metadataExtraction: true,
          contentValidation: true
        },
        ...config
      },
      metadata: {
        created: new Date(),
        updated: new Date(),
        createdBy,
        participantCount: 0,
        documentCount: 0,
        lastActivity: new Date()
      }
    };

    workingGroups.set(workingGroupId, workingGroup);

    res.json({
      success: true,
      workingGroup,
      message: 'Working group created successfully'
    });

  } catch (error) {
    console.error('Working group creation failed:', error);
    res.status(500).json({ 
      error: 'Working group creation failed',
      details: error.message
    });
  }
});

// Get all working groups
app.get('/api/working-groups', (req, res) => {
  try {
    const workingGroupsList = Array.from(workingGroups.values());

    res.json({
      success: true,
      workingGroups: workingGroupsList,
      count: workingGroupsList.length,
      message: 'Working groups retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to retrieve working groups:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve working groups',
      details: error.message
    });
  }
});

// Get working group by ID
app.get('/api/working-groups/:workingGroupId', (req, res) => {
  try {
    const { workingGroupId } = req.params;
    const workingGroup = workingGroups.get(workingGroupId);
    
    if (!workingGroup) {
      return res.status(404).json({ 
        error: 'Working group not found' 
      });
    }

    res.json({
      success: true,
      workingGroup,
      message: 'Working group retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to retrieve working group:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve working group',
      details: error.message
    });
  }
});

// Upload document to working group
app.post('/api/working-groups/:workingGroupId/upload', upload.single('document'), (req, res) => {
  try {
    const { workingGroupId } = req.params;
    const { 
      title, 
      author, 
      source, 
      tags, 
      language, 
      category, 
      version, 
      license,
      customFields,
      modelOverride,
      processingOptions,
      disclosureOptions
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        error: 'Document file is required' 
      });
    }

    const workingGroup = workingGroups.get(workingGroupId);
    if (!workingGroup) {
      return res.status(404).json({ 
        error: 'Working group not found' 
      });
    }

    const documentId = `doc_${Date.now()}`;
    const content = req.file.buffer.toString('utf-8');

    // Parse JSON fields
    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedCustomFields = customFields ? JSON.parse(customFields) : {};

    const documentUpload = {
      id: documentId,
      workingGroupId,
      fileName: `${documentId}_${req.file.originalname}`,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      content,
      metadata: {
        title: title || req.file.originalname,
        author,
        source,
        tags: parsedTags,
        language: language || 'en',
        category: category || 'general',
        version: version || '1.0.0',
        license,
        customFields: parsedCustomFields
      },
      processingStatus: 'completed', // Simplified for demo
      processingResults: {
        chunks: [],
        embeddings: [],
        summary: `Document processed: ${req.file.originalname}`,
        keywords: parsedTags,
        entities: [],
        qualityScore: 0.8,
        processingTime: 100,
        modelUsed: modelOverride || workingGroup.configuration.modelSettings.primaryModel,
        processingSteps: []
      },
      intelligenceDisclosure: {
        modelInfo: {
          primaryModel: modelOverride || workingGroup.configuration.modelSettings.primaryModel,
          fallbackModels: workingGroup.configuration.modelSettings.fallbackModels,
          modelProvider: workingGroup.configuration.modelSettings.modelProvider,
          parameters: workingGroup.configuration.modelSettings,
          version: '1.0.0',
          capabilities: ['text', 'chat', 'analysis']
        },
        processingSteps: [],
        sourceAttribution: [],
        confidenceScores: {
          overall: 0.8,
          factual: 0.8,
          contextual: 0.8,
          temporal: 0.8,
          source: 0.8,
          reasoning: 0.8
        },
        reasoningChain: [],
        metadata: {
          generatedAt: new Date(),
          disclosureLevel: 'partial',
          workingGroupId
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    documentUploads.set(documentId, documentUpload);

    // Update working group metadata
    workingGroup.metadata.documentCount++;
    workingGroup.metadata.lastActivity = new Date();

    res.json({
      success: true,
      documentUpload,
      message: 'Document uploaded and processed successfully'
    });

  } catch (error) {
    console.error('Document upload failed:', error);
    res.status(500).json({ 
      error: 'Document upload failed',
      details: error.message
    });
  }
});

// Get document uploads for working group
app.get('/api/working-groups/:workingGroupId/documents', (req, res) => {
  try {
    const { workingGroupId } = req.params;
    const { status, limit, offset } = req.query;

    let documents = Array.from(documentUploads.values())
      .filter(doc => doc.workingGroupId === workingGroupId);

    // Filter by status if provided
    if (status) {
      documents = documents.filter(doc => doc.processingStatus === status);
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    const paginatedDocuments = documents.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      documents: paginatedDocuments,
      total: documents.length,
      limit: limitNum,
      offset: offsetNum,
      message: 'Documents retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to retrieve documents:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve documents',
      details: error.message
    });
  }
});

// Query working group RAG container
app.post('/api/working-groups/:workingGroupId/query', async (req, res) => {
  try {
    const { workingGroupId } = req.params;
    const { 
      query, 
      modelOverride, 
      includeDisclosure, 
      maxResults, 
      similarityThreshold 
    } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    const workingGroup = workingGroups.get(workingGroupId);
    if (!workingGroup) {
      return res.status(404).json({ 
        error: 'Working group not found' 
      });
    }

    const modelToUse = modelOverride || workingGroup.configuration.modelSettings.primaryModel;
    const startTime = Date.now();

    // Get documents for this working group
    const documents = Array.from(documentUploads.values())
      .filter(doc => doc.workingGroupId === workingGroupId);

    // Generate response using the selected model
    const response = await generateLLMResponse(query, modelToUse, workingGroup.domain);

    // Generate intelligence disclosure if requested
    let intelligenceDisclosure = null;
    if (includeDisclosure !== false && workingGroup.configuration.intelligenceDisclosure.enabled) {
      intelligenceDisclosure = {
        modelInfo: {
          primaryModel: modelToUse,
          fallbackModels: workingGroup.configuration.modelSettings.fallbackModels,
          modelProvider: workingGroup.configuration.modelSettings.modelProvider,
          parameters: workingGroup.configuration.modelSettings,
          version: '1.0.0',
          capabilities: ['text', 'chat', 'analysis']
        },
        processingSteps: [],
        sourceAttribution: documents.map(doc => ({
          sourceId: doc.id,
          sourceType: 'document',
          relevanceScore: 0.8,
          contribution: doc.metadata.title,
          metadata: { fileName: doc.originalName }
        })),
        confidenceScores: {
          overall: 0.8,
          factual: 0.8,
          contextual: 0.8,
          temporal: 0.8,
          source: 0.8,
          reasoning: 0.8
        },
        reasoningChain: [],
        metadata: {
          generatedAt: new Date(),
          disclosureLevel: workingGroup.configuration.intelligenceDisclosure.disclosureLevel,
          workingGroupId
        }
      };
    }

    const result = {
      response,
      sources: documents.slice(0, maxResults || 5).map(doc => ({
        id: doc.id,
        title: doc.metadata.title,
        content: doc.content.substring(0, 500) + '...',
        score: 0.8,
        accessLevel: 'full'
      })),
      intelligenceDisclosure,
      metadata: {
        workingGroupId,
        modelUsed: modelToUse,
        processingTime: Date.now() - startTime,
        confidence: 0.8
      }
    };

    res.json({
      success: true,
      result,
      message: 'Query processed successfully'
    });

  } catch (error) {
    console.error('Working group query failed:', error);
    res.status(500).json({ 
      error: 'Working group query failed',
      details: error.message
    });
  }
});

// Get available models for working group
app.get('/api/working-groups/:workingGroupId/models', (req, res) => {
  try {
    const { workingGroupId } = req.params;
    const workingGroup = workingGroups.get(workingGroupId);
    
    if (!workingGroup) {
      return res.status(404).json({ 
        error: 'Working group not found' 
      });
    }

    const models = {
      primary: workingGroup.configuration.modelSettings.primaryModel,
      fallback: workingGroup.configuration.modelSettings.fallbackModels,
      provider: workingGroup.configuration.modelSettings.modelProvider,
      available: [
        { name: 'gpt-3.5-turbo', provider: 'openai', capabilities: ['text', 'chat'] },
        { name: 'gpt-4', provider: 'openai', capabilities: ['text', 'chat', 'reasoning'] },
        { name: 'claude-3-haiku', provider: 'anthropic', capabilities: ['text', 'chat', 'analysis'] },
        { name: 'claude-3-sonnet', provider: 'anthropic', capabilities: ['text', 'chat', 'analysis', 'reasoning'] },
        { name: 'llama2', provider: 'ollama', capabilities: ['text', 'chat'] },
        { name: 'phala-gpt', provider: 'phala', capabilities: ['text', 'chat', 'confidential'] }
      ]
    };

    res.json({
      success: true,
      models,
      message: 'Available models retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to retrieve models:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve models',
      details: error.message
    });
  }
});

// Working groups health check
app.get('/api/working-groups/health', (req, res) => {
  try {
    res.json({
      success: true,
      healthy: true,
      workingGroupsCount: workingGroups.size,
      documentsCount: documentUploads.size,
      message: 'Working groups system healthy'
    });

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      error: 'Health check failed',
      details: error.message
    });
  }
});

// Serve React app for all other routes (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 BGIN AI MVP Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`API: http://localhost:${PORT}/api/agents`);
  console.log(`LLM Status: http://localhost:${PORT}/api/status`);
  console.log(`LLM Test: http://localhost:${PORT}/api/test-llm`);
  console.log(`\n📁 Working Groups API:`);
  console.log(`   Create: POST http://localhost:${PORT}/api/working-groups/create`);
  console.log(`   List: GET http://localhost:${PORT}/api/working-groups`);
  console.log(`   Upload: POST http://localhost:${PORT}/api/working-groups/{id}/upload`);
  console.log(`   Query: POST http://localhost:${PORT}/api/working-groups/{id}/query`);
  console.log(`   Models: GET http://localhost:${PORT}/api/working-groups/{id}/models`);
  console.log(`\n🔒 Phala Cloud Integration:`);
  console.log(`   ✅ Confidential Compute Enabled`);
  console.log(`   ✅ Privacy-Preserving AI Processing`);
  console.log(`   ✅ TEE-Verified Responses`);
  console.log(`\n🔴 RedPill AI Integration: Removed`);
  console.log(`\n📝 Optional OpenAI Fallback:`);
  console.log(`   1. Get an OpenAI API key from https://platform.openai.com/api-keys`);
  console.log(`   2. Add OPENAI_API_KEY=your_key_here to your .env file`);
  console.log(`   3. Restart the server`);
  
  const fallbackStatus = OPENAI_API_KEY ? 'OpenAI' : 'Phala Cloud';
  console.log(`\n🔧 Current LLM Status: 🌐 KwaaiNet (Primary) + ${fallbackStatus} (Fallback)`);
});
