// =====================================
// frontend/src/components/MainInterface.tsx
// =====================================

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  Database,
  Brain,
  Shield,
  User,
  Award,
  Fingerprint,
  Target,
  Upload
} from 'lucide-react';
import BGINMultiAgentInterface from './BGINMultiAgentInterface';

const MainInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    {
      id: 'chat',
      name: 'Multi-Agent Chat',
      icon: MessageSquare,
      description: 'Interact with BGIN AI agents'
    },
    {
      id: 'knowledge-archives',
      name: 'Knowledge Archives',
      icon: Users,
      description: 'Manage knowledge archives and documents'
    },
    {
      id: 'first-person-agent',
      name: 'First Person Agent',
      icon: User,
      description: 'Your identity, contributions, and composable credentials'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'View system analytics and insights'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'Configure system settings'
    }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return <BGINMultiAgentInterface />;
      case 'knowledge-archives':
        return (
          <div className="min-h-screen bg-slate-900/50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Knowledge Archives</h1>
                    <p className="text-slate-300">Manage knowledge archives, upload documents, and query RAG containers with model optionality and intelligence disclosure</p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Total Documents</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">1,247</p>
                    <p className="text-xs text-slate-300">+23 this week</p>
                  </div>
                  <div className="bg-slate-800/50 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Active Working Groups</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">8</p>
                    <p className="text-xs text-slate-300">All operational</p>
                  </div>
                  <div className="bg-slate-800/50 border border-purple-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm font-medium text-white">RAG Queries</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">3,456</p>
                    <p className="text-xs text-slate-300">+156 today</p>
                  </div>
                  <div className="bg-slate-800/50 border border-yellow-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Knowledge Base Size</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">2.3GB</p>
                    <p className="text-xs text-slate-300">Vector embeddings</p>
                  </div>
                </div>
              </div>

              {/* Working Groups Grid - Enhanced */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Working Groups & Knowledge Containers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-800/50 border border-blue-400/30 rounded-xl p-6 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <h3 className="text-lg font-semibold text-white">Identity & Key Management (IKP)</h3>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">Decentralized identity standards, key management protocols, and privacy-preserving authentication mechanisms</p>
                    <div className="space-y-2 text-xs text-slate-400 mb-4">
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <span className="text-blue-400">342</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="text-green-400">28</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="text-slate-300">2 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Block 13 Track</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Active</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                      Access Knowledge Base
                    </button>
                  </div>

                  <div className="bg-slate-800/50 border border-purple-400/30 rounded-xl p-6 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <h3 className="text-lg font-semibold text-white">Privacy & Trust</h3>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">Privacy-preserving technologies, trust networks, and dignity-based economic models</p>
                    <div className="space-y-2 text-xs text-slate-400 mb-4">
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <span className="text-purple-400">298</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="text-green-400">22</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="text-slate-300">1 hour ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">Research Track</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Active</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                      Access Knowledge Base
                    </button>
                  </div>

                  <div className="bg-slate-800/50 border border-green-400/30 rounded-xl p-6 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <h3 className="text-lg font-semibold text-white">Governance & Standards</h3>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">Decentralized governance frameworks, interoperability standards, and regulatory compliance</p>
                    <div className="space-y-2 text-xs text-slate-400 mb-4">
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <span className="text-green-400">456</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="text-green-400">35</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="text-slate-300">30 min ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Standards Track</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Active</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                      Access Knowledge Base
                    </button>
                  </div>

                  <div className="bg-slate-800/50 border border-yellow-400/30 rounded-xl p-6 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <h3 className="text-lg font-semibold text-white">Technical Implementation</h3>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">Technical specifications, implementation guides, and developer resources</p>
                    <div className="space-y-2 text-xs text-slate-400 mb-4">
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <span className="text-yellow-400">189</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="text-green-400">18</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="text-slate-300">4 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">Dev Track</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Active</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors">
                      Access Knowledge Base
                    </button>
                  </div>

                  <div className="bg-slate-800/50 border border-red-400/30 rounded-xl p-6 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <h3 className="text-lg font-semibold text-white">Research & Innovation</h3>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">Cutting-edge research, experimental protocols, and innovation initiatives</p>
                    <div className="space-y-2 text-xs text-slate-400 mb-4">
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <span className="text-red-400">167</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="text-green-400">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="text-slate-300">6 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">Research Track</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Active</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                      Access Knowledge Base
                    </button>
                  </div>

                  <div className="bg-slate-800/50 border border-cyan-400/30 rounded-xl p-6 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <h3 className="text-lg font-semibold text-white">Community & Outreach</h3>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">Community guidelines, outreach materials, and educational resources</p>
                    <div className="space-y-2 text-xs text-slate-400 mb-4">
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <span className="text-cyan-400">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="text-green-400">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="text-slate-300">1 day ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">Community Track</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Active</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors">
                      Access Knowledge Base
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="mb-8">
                <div className="bg-slate-800/50 border border-blue-400/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Upload className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">Document Management</h2>
                      <p className="text-slate-300">Upload and manage documents with privacy-preserving processing</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Upload New Document</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select File
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.txt,.md,.docx,.html"
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Working Group
                          </label>
                          <select className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                            <option>Identity & Key Management (IKP)</option>
                            <option>Privacy & Trust</option>
                            <option>Governance & Standards</option>
                            <option>Technical Implementation</option>
                            <option>Research & Innovation</option>
                            <option>Community & Outreach</option>
                          </select>
                        </div>
                        <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                          Upload & Process Document
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Uploads</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">Privacy-Preserving Governance Framework</div>
                            <div className="text-xs text-slate-400">IKP Working Group • 2 hours ago</div>
                          </div>
                          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">Processed</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">Zero-Knowledge Authentication Protocol</div>
                            <div className="text-xs text-slate-400">Privacy & Trust • 4 hours ago</div>
                          </div>
                          <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">Processing</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">Interoperability Standards v2.1</div>
                            <div className="text-xs text-slate-400">Governance & Standards • 1 day ago</div>
                          </div>
                          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">Processed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RAG Query Interface */}
              <div className="mb-8">
                <div className="bg-slate-800/50 border border-purple-400/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">RAG Query Interface</h2>
                      <p className="text-slate-300">Query knowledge bases with model optionality and intelligence disclosure</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Query Knowledge Base
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Ask a question about governance, privacy, or technical standards..."
                          className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                        />
                        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                          Query
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Model Selection
                        </label>
                        <select className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                          <option>GPT-4 (Default)</option>
                          <option>Claude-3</option>
                          <option>Llama-2</option>
                          <option>Local Model</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Privacy Level
                        </label>
                        <select className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                          <option>High (Fully Private)</option>
                          <option>Medium (Selective)</option>
                          <option>Low (Public)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Intelligence Disclosure
                        </label>
                        <select className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                          <option>Full Disclosure</option>
                          <option>Partial Disclosure</option>
                          <option>No Disclosure</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'first-person-agent':
        return (
          <div className="min-h-screen bg-slate-900/50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">First Person Agent</h1>
                    <p className="text-slate-300">Data sovereignty and credential control for dignity-based economics</p>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Data Sovereignty</span>
                    </div>
                    <p className="text-xs text-slate-300">User-controlled data sharing</p>
                  </div>
                  <div className="bg-slate-800/50 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm font-medium text-white">DID Management</span>
                    </div>
                    <p className="text-xs text-slate-300">Decentralized identity control</p>
                  </div>
                  <div className="bg-slate-800/50 border border-purple-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Credential Control</span>
                    </div>
                    <p className="text-xs text-slate-300">Verifiable credential management</p>
                  </div>
                  <div className="bg-slate-800/50 border border-yellow-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Contributions</span>
                    </div>
                    <p className="text-xs text-slate-300">Research impact tracking</p>
                  </div>
                </div>
              </div>

              {/* My Contributions Section - Enhanced */}
              <div className="mb-8">
                <div className="bg-slate-800/50 border border-yellow-400/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-600/20 rounded-lg">
                      <Award className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">My Contributions</h2>
                      <p className="text-slate-300">Detailed overview of your research impact and activity</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Contribution Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">47</div>
                      <div className="text-sm text-slate-400">Messages</div>
                      <div className="text-xs text-green-400 mt-1">+12 this week</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">12</div>
                      <div className="text-sm text-slate-400">Insights</div>
                      <div className="text-xs text-green-400 mt-1">+3 this week</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">5</div>
                      <div className="text-sm text-slate-400">Sessions</div>
                      <div className="text-xs text-blue-400 mt-1">Active now</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">3</div>
                      <div className="text-sm text-slate-400">Agents</div>
                      <div className="text-xs text-purple-400 mt-1">Collaborating</div>
                    </div>
                  </div>

                  {/* Detailed Activity Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity Timeline</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                        <div className="w-3 h-3 bg-green-400 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">Shared insight in BGIN Agent Hack</span>
                            <span className="text-xs text-slate-400">2 hours ago</span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2">"Privacy-preserving governance mechanisms for cross-chain interoperability"</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">Insight</span>
                            <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">BGIN Agent Hack</span>
                            <span className="text-xs text-slate-400">3 upvotes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">Asked Archive Agent about governance</span>
                            <span className="text-xs text-slate-400">4 hours ago</span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2">Query: "What are the current standards for decentralized governance frameworks?"</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">Query</span>
                            <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">Archive Agent</span>
                            <span className="text-xs text-slate-400">High confidence response</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                        <div className="w-3 h-3 bg-purple-400 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">Minted Privacy Research SBT</span>
                            <span className="text-xs text-slate-400">1 day ago</span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2">Soulbound Token for algorithm contribution to zero-knowledge authentication</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">SBT</span>
                            <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">Verified</span>
                            <span className="text-xs text-slate-400">IKP Working Group</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Profile Card */}
                <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold text-white">Your Agent Profile</h2>
                      <p className="text-slate-400">First Person Agent Identity</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">DID</span>
                      <p className="text-white font-mono text-sm">did:example:123456789</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Trust Score</span>
                      <p className="text-white font-bold text-lg">94%</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Dignity Score</span>
                      <p className="text-white font-bold text-lg">87%</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Reputation</span>
                      <p className="text-white font-bold text-lg">High</p>
                    </div>
                  </div>
                </div>

                {/* Contributions Stats */}
                <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-full">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold text-white">Contributions</h2>
                      <p className="text-slate-400">Your Research Impact</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Documents Uploaded</span>
                      <span className="text-white font-bold">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Knowledge Archives</span>
                      <span className="text-white font-bold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Queries Made</span>
                      <span className="text-white font-bold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Research Sessions</span>
                      <span className="text-white font-bold">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Collaborations</span>
                      <span className="text-white font-bold">23</span>
                    </div>
                  </div>
                </div>

                 {/* Trust over IP Identity */}
                 <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                   <div className="flex items-center mb-4">
                     <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                       <Fingerprint className="w-8 h-8 text-white" />
                     </div>
                     <div className="ml-4">
                       <h2 className="text-xl font-bold text-white">Trust over IP Identity</h2>
                       <p className="text-slate-400">ToIP Framework Implementation</p>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-slate-400 text-sm">DID (Decentralized Identifier)</span>
                       <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">did:example:123456789</div>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-slate-400 text-sm">ToIP Layer 1 - Utility Layer</span>
                       <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-slate-400 text-sm">ToIP Layer 2 - Governance Layer</span>
                       <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-slate-400 text-sm">ToIP Layer 3 - Application Layer</span>
                       <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-slate-400 text-sm">ToIP Layer 4 - Ecosystem Layer</span>
                       <div className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">In Progress</div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Detailed Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm">Uploaded "Privacy Policy Analysis" to Technical Standards archive</p>
                        <p className="text-slate-400 text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm">Completed query on cross-chain governance mechanisms</p>
                        <p className="text-slate-400 text-xs">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm">Minted Privacy Research SBT for algorithm contribution</p>
                        <p className="text-slate-400 text-xs">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm">Joined Regulatory Landscape knowledge archive</p>
                        <p className="text-slate-400 text-xs">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Network */}
                <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Trust Network
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-400 text-sm">Trust Relationships</span>
                        <span className="text-white font-bold">23</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '76%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-400 text-sm">Verification Score</span>
                        <span className="text-white font-bold">94%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" style={{width: '94%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-400 text-sm">Collaboration Rate</span>
                        <span className="text-white font-bold">87%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm mb-2">Recent Collaborations</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Archive Agent</span>
                        <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Codex Agent</span>
                        <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Discourse Agent</span>
                        <div className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

               {/* Trust over IP Framework Details */}
               <div className="mt-6 bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                   <Shield className="w-5 h-5 mr-2" />
                   Trust over IP Framework Implementation
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* ToIP Layers */}
                   <div className="space-y-4">
                     <h4 className="text-white font-medium mb-3">ToIP Stack Layers</h4>
                     <div className="space-y-3">
                       <div className="bg-slate-700/50 rounded-lg p-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-white font-medium text-sm">Layer 1: Utility Layer</span>
                           <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                         </div>
                         <p className="text-slate-300 text-xs">DID Registry, Verifiable Data Registry, DID Resolution</p>
                       </div>
                       <div className="bg-slate-700/50 rounded-lg p-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-white font-medium text-sm">Layer 2: Governance Layer</span>
                           <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                         </div>
                         <p className="text-slate-300 text-xs">Governance Framework, Trust Assurance, Legal Framework</p>
                       </div>
                       <div className="bg-slate-700/50 rounded-lg p-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-white font-medium text-sm">Layer 3: Application Layer</span>
                           <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                         </div>
                         <p className="text-slate-300 text-xs">Credential Management, Identity Wallets, Trust Agents</p>
                       </div>
                       <div className="bg-slate-700/50 rounded-lg p-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-white font-medium text-sm">Layer 4: Ecosystem Layer</span>
                           <div className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">In Progress</div>
                         </div>
                         <p className="text-slate-300 text-xs">Cross-Ecosystem Interoperability, Global Trust Networks</p>
                       </div>
                     </div>
                   </div>

                   {/* Trust Components */}
                   <div className="space-y-4">
                     <h4 className="text-white font-medium mb-3">Trust Components</h4>
                     <div className="space-y-3">
                       <div className="bg-slate-700/50 rounded-lg p-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-white font-medium text-sm">Verifiable Credentials</span>
                           <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">3 Active</div>
                         </div>
                         <p className="text-slate-300 text-xs">Privacy Research SBT, Governance SBT, Trust Infrastructure SBT</p>
                       </div>
                       <div className="bg-slate-700/50 rounded-lg p-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-white font-medium text-sm">Trust Registries</span>
                           <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Connected</div>
                         </div>
                         <p className="text-slate-300 text-xs">BGIN Trust Registry, Phala Network Registry</p>
                       </div>
                       <div className="bg-slate-700/50 rounded-lg p-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-white font-medium text-sm">Trust Agents</span>
                           <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</div>
                         </div>
                         <p className="text-slate-300 text-xs">Archive Agent, Codex Agent, Discourse Agent</p>
                       </div>
                       <div className="bg-slate-700/50 rounded-lg p-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-white font-medium text-sm">Trust Assurance</span>
                           <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">94%</div>
                         </div>
                         <p className="text-slate-300 text-xs">TEE-Verified Processing, Privacy-Preserving Analytics</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Capabilities & Skills */}
               <div className="mt-6 bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                   <Brain className="w-5 h-5 mr-2" />
                   Capabilities & Skills
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="bg-slate-700/50 rounded-lg p-4">
                     <h4 className="text-white font-medium mb-2">Privacy Research</h4>
                     <div className="flex items-center">
                       <div className="w-full bg-slate-600 rounded-full h-2 mr-2">
                         <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
                       </div>
                       <span className="text-slate-300 text-sm">92%</span>
                     </div>
                   </div>
                   <div className="bg-slate-700/50 rounded-lg p-4">
                     <h4 className="text-white font-medium mb-2">Policy Analysis</h4>
                     <div className="flex items-center">
                       <div className="w-full bg-slate-600 rounded-full h-2 mr-2">
                         <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                       </div>
                       <span className="text-slate-300 text-sm">78%</span>
                     </div>
                   </div>
                   <div className="bg-slate-700/50 rounded-lg p-4">
                     <h4 className="text-white font-medium mb-2">Trust Building</h4>
                     <div className="flex items-center">
                       <div className="w-full bg-slate-600 rounded-full h-2 mr-2">
                         <div className="bg-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
                       </div>
                       <span className="text-slate-300 text-sm">85%</span>
                     </div>
                   </div>
                   <div className="bg-slate-700/50 rounded-lg p-4">
                     <h4 className="text-white font-medium mb-2">Financial Systems</h4>
                     <div className="flex items-center">
                       <div className="w-full bg-slate-600 rounded-full h-2 mr-2">
                         <div className="bg-orange-500 h-2 rounded-full" style={{width: '65%'}}></div>
                       </div>
                       <span className="text-slate-300 text-sm">65%</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="min-h-screen bg-slate-900/50 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-8">Analytics Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-300">Total Documents</p>
                      <p className="text-2xl font-bold text-white">1,234</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-600/20 rounded-lg">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-300">Active Users</p>
                      <p className="text-2xl font-bold text-white">89</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-300">AI Queries</p>
                      <p className="text-2xl font-bold text-white">5,678</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-600/20 rounded-lg">
                      <Shield className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-300">Trust Score</p>
                      <p className="text-2xl font-bold text-white">94%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen bg-slate-900/50 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
              <div className="bg-slate-800/50 backdrop-blur border border-blue-400/20 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">System Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Default Model
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="claude-3-haiku">Claude 3 Haiku</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      <option value="llama2">Llama 2</option>
                      <option value="phala-gpt">Phala GPT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Privacy Level
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="maximum">Maximum</option>
                      <option value="high">High</option>
                      <option value="selective">Selective</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Intelligence Disclosure
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="full">Full</option>
                      <option value="partial">Partial</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <BGINMultiAgentInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/30 backdrop-blur border-b border-blue-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-white">BGIN AI</h1>
                    <p className="text-sm text-blue-300">Multi-Agent System</p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3" />
                  <div>
                    <div>{tab.name}</div>
                    <div className="text-xs text-slate-500">{tab.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main>
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default MainInterface;
