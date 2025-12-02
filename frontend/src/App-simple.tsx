import { useState } from 'react';
import LocalApiService from './services/localApiService';

function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready');

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');
    
    try {
      const service = LocalApiService.getInstance();
      const isConnected = await service.testConnection();
      
      if (isConnected) {
        setStatus('✅ Connected to local API');
      } else {
        setStatus('❌ Connection failed');
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setStatus('Sending message...');
    
    try {
      const service = LocalApiService.getInstance();
      const result = await service.sendMessage(
        message,
        'archive',
        'regulatory',
        false
      );
      
      setResponse(result.content);
      setStatus(`✅ Response received (${result.processingTime}ms)`);
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>BGIN AI Test Interface</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Status: {status}</h3>
        <button 
          onClick={testConnection} 
          disabled={loading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Test Connection
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Send Message to Archive Agent</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here..."
          style={{ width: '100%', height: '100px', marginBottom: '10px' }}
        />
        <br />
        <button 
          onClick={sendMessage} 
          disabled={loading || !message.trim()}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
      
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3>Response:</h3>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            whiteSpace: 'pre-wrap'
          }}>
            {response}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;