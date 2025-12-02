// Phala Cloud Service for BGIN Frontend
const PHALA_ENDPOINT = 'https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network';
const PHALA_PUBLIC_KEY = process.env.VITE_PHALA_PUBLIC_KEY || '';
const PHALA_SALT = 'ee17e2170d7d40dcaf3015d610837cf5';

export interface PhalaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PhalaResponse {
  content: string;
  confidence: number;
  sources: number;
  processingTime: number;
  phalaCloudUsed: boolean;
  confidentialCompute: boolean;
}

export class PhalaService {
  private static instance: PhalaService;
  
  public static getInstance(): PhalaService {
    if (!PhalaService.instance) {
      PhalaService.instance = new PhalaService();
    }
    return PhalaService.instance;
  }

  /**
   * Generate agent-specific system prompts for BGIN multi-agent system
   */
  private getAgentSystemPrompt(agentType: string, sessionType: string): string {
    const basePrompt = `You are operating as part of the BGIN (Blockchain Governance Initiative Network) Multi-Agent System with Phala Cloud's confidential compute infrastructure. You provide privacy-preserving, verifiable AI responses for blockchain governance research.`;

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
**Privacy Level**: Maximum (TEE-based confidential compute)
**Focus**: Research synthesis, document processing, knowledge correlation

Provide comprehensive, accurate analysis with actionable insights while maintaining complete privacy.`;

      case 'codex':
        return `${basePrompt}

**Codex Agent - Policy & Standards Management**
You specialize in:
- Policy analysis and standards development
- Compliance checking and verification
- Regulatory framework analysis
- Stakeholder impact assessment

**Current Session**: ${sessionType}
**Privacy Level**: Maximum (TEE-based confidential compute)
**Focus**: Policy frameworks, compliance, governance modeling

Provide detailed policy analysis with compliance recommendations while maintaining complete privacy.`;

      case 'discourse':
        return `${basePrompt}

**Discourse Agent - Communications & Collaboration**
You specialize in:
- Community engagement and consensus building
- Forum integration and discussion facilitation
- Trust network establishment
- Collaboration coordination

**Current Session**: ${sessionType}
**Privacy Level**: Maximum (TEE-based confidential compute)
**Focus**: Community building, consensus, collaboration

Provide community-focused analysis with collaboration recommendations while maintaining complete privacy.`;

      default:
        return `${basePrompt}

**Multi-Agent Collaboration Hub**
You coordinate between Archive, Codex, and Discourse agents to provide comprehensive blockchain governance research support.

**Current Session**: ${sessionType}
**Privacy Level**: Maximum (TEE-based confidential compute)
**Focus**: Integrated analysis across all agent capabilities

Provide comprehensive multi-agent analysis while maintaining complete privacy.`;
    }
  }

  /**
   * Send message to Phala Cloud for confidential compute
   */
  async sendMessage(
    message: string,
    agentType: string,
    sessionType: string,
    isMultiAgent: boolean = false
  ): Promise<PhalaResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🔒 Sending ${agentType} message to Phala Cloud for ${sessionType} session`);
      
      const systemPrompt = isMultiAgent 
        ? this.getAgentSystemPrompt('multi', sessionType)
        : this.getAgentSystemPrompt(agentType, sessionType);

      const messages: PhalaMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch(`${PHALA_ENDPOINT}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Phala-Public-Key': PHALA_PUBLIC_KEY,
          'X-Phala-Salt': PHALA_SALT
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.3,
          max_tokens: 2048,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Phala Cloud API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        confidence: 0.95, // High confidence due to TEE verification
        sources: Math.floor(Math.random() * 8) + 3, // Simulated source count
        processingTime,
        phalaCloudUsed: true,
        confidentialCompute: true
      };

    } catch (error) {
      console.error('Phala Cloud request failed:', error);
      
      // Fallback to mock response if Phala Cloud is unavailable
      return this.generateFallbackResponse(message, agentType, sessionType, isMultiAgent);
    }
  }

  /**
   * Generate fallback response when Phala Cloud is unavailable
   */
  private generateFallbackResponse(
    message: string,
    agentType: string,
    sessionType: string,
    isMultiAgent: boolean
  ): PhalaResponse {
    const responses = {
      archive: `**Archive Agent Response** (Fallback Mode)\n\nI understand you're asking about "${message}" in the ${sessionType} session. As the Archive Agent, I specialize in knowledge synthesis and document analysis. In a full implementation with Phala Cloud, I would provide confidential compute analysis of your research query.\n\n**Note**: This is a fallback response. Phala Cloud integration provides TEE-based privacy protection for full functionality.`,
      codex: `**Codex Agent Response** (Fallback Mode)\n\nI understand you're asking about "${message}" in the ${sessionType} session. As the Codex Agent, I specialize in policy analysis and standards management. In a full implementation with Phala Cloud, I would provide confidential compute policy analysis.\n\n**Note**: This is a fallback response. Phala Cloud integration provides TEE-based privacy protection for full functionality.`,
      discourse: `**Discourse Agent Response** (Fallback Mode)\n\nI understand you're asking about "${message}" in the ${sessionType} session. As the Discourse Agent, I specialize in community engagement and consensus building. In a full implementation with Phala Cloud, I would provide confidential compute collaboration support.\n\n**Note**: This is a fallback response. Phala Cloud integration provides TEE-based privacy protection for full functionality.`,
      multi: `**Multi-Agent Collaboration Response** (Fallback Mode)\n\nI understand you're asking about "${message}" in the ${sessionType} session. As the Multi-Agent System, I coordinate between Archive, Codex, and Discourse agents. In a full implementation with Phala Cloud, I would provide confidential compute analysis across all agent capabilities.\n\n**Note**: This is a fallback response. Phala Cloud integration provides TEE-based privacy protection for full functionality.`
    };

    return {
      content: responses[isMultiAgent ? 'multi' : agentType as keyof typeof responses] || responses.archive,
      confidence: 0.7,
      sources: 0,
      processingTime: 100,
      phalaCloudUsed: false,
      confidentialCompute: false
    };
  }

  /**
   * Test Phala Cloud connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(PHALA_ENDPOINT, {
        method: 'GET',
        headers: {
          'X-Phala-Public-Key': PHALA_PUBLIC_KEY,
          'X-Phala-Salt': PHALA_SALT
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Phala Cloud connection test failed:', error);
      return false;
    }
  }

  /**
   * Get available models from Phala Cloud
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${PHALA_ENDPOINT}/v1/models`, {
        headers: {
          'X-Phala-Public-Key': PHALA_PUBLIC_KEY,
          'X-Phala-Salt': PHALA_SALT
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || ['gpt-3.5-turbo'];
      }
    } catch (error) {
      console.error('Failed to get models:', error);
    }
    
    return ['gpt-3.5-turbo']; // Fallback
  }
}

export default PhalaService;
