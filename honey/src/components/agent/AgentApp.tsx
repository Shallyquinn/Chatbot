import { useState, useEffect } from 'react';
import { AgentLogin } from './AgentLogin';
import { AgentInterface } from './AgentInterface';

export function AgentApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if agent is already logged in
    const agentId = localStorage.getItem('agent_id');
    const agentToken = localStorage.getItem('agent_token');
    
    if (agentId && agentToken) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#006045] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AgentLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AgentInterface />;
}
