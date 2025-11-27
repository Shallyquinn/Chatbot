import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './AgentAvailabilityWidget.css';

interface AgentStatus {
  totalAgents: number;
  onlineAgents: number;
  availableAgents: number;
  busyAgents: number;
  queueLength: number;
  estimatedWaitTime: number;
  isWithinBusinessHours: boolean;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

interface AgentAvailabilityWidgetProps {
  actionProvider: any;
  onAgentSelect?: (agentType: 'human' | 'ai') => void;
}

const AgentAvailabilityWidget: React.FC<AgentAvailabilityWidgetProps> = ({
  actionProvider,
  onAgentSelect,
}) => {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAgentStatus = async () => {
    try {
      const response = await apiService.getAgentAvailability();
      setStatus(response);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch agent status:', err);
      setError('Unable to check agent availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentStatus();
    
    // Auto-refresh every 10 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchAgentStatus, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleAgentTypeSelection = (type: 'human' | 'ai') => {
    if (onAgentSelect) {
      onAgentSelect(type);
    } else {
      actionProvider.handleAgentTypeSelection(
        type === 'human' ? 'Human Agent' : 'AI Chatbot'
      );
    }
  };

  if (loading) {
    return (
      <div className="agent-availability-widget loading">
        <div className="spinner"></div>
        <p>Checking agent availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-availability-widget error">
        <p className="error-message">⚠️ {error}</p>
        <button onClick={fetchAgentStatus} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!status) return null;

  const getAvailabilityStatus = () => {
    if (!status.isWithinBusinessHours) {
      return {
        icon: '🌙',
        text: 'Outside Business Hours',
        color: '#666',
        message: `We're available ${status.businessHours.start} - ${status.businessHours.end} ${status.businessHours.timezone}`,
      };
    }

    if (status.availableAgents > 0) {
      return {
        icon: '✅',
        text: `${status.availableAgents} Agent${status.availableAgents > 1 ? 's' : ''} Available`,
        color: '#4CAF50',
        message: 'Connect instantly with a human agent',
      };
    }

    if (status.onlineAgents > 0) {
      return {
        icon: '⏳',
        text: 'All Agents Busy',
        color: '#FF9800',
        message: `Queue: ${status.queueLength} waiting • Est. wait: ${status.estimatedWaitTime} min`,
      };
    }

    return {
      icon: '🔴',
      text: 'No Agents Online',
      color: '#F44336',
      message: 'Please try again during business hours or use AI assistant',
    };
  };

  const availabilityInfo = getAvailabilityStatus();

  return (
    <div className="agent-availability-widget">
      {/* Real-time Status Header */}
      <div className="status-header" style={{ borderLeftColor: availabilityInfo.color }}>
        <div className="status-icon">{availabilityInfo.icon}</div>
        <div className="status-info">
          <h4 className="status-title">{availabilityInfo.text}</h4>
          <p className="status-message">{availabilityInfo.message}</p>
        </div>
        <button
          className="refresh-btn"
          onClick={fetchAgentStatus}
          title="Refresh status"
        >
          🔄
        </button>
      </div>

      {/* Agent Statistics */}
      <div className="agent-stats">
        <div className="stat-item">
          <span className="stat-label">Online:</span>
          <span className="stat-value">{status.onlineAgents}/{status.totalAgents}</span>
        </div>
        {status.busyAgents > 0 && (
          <div className="stat-item">
            <span className="stat-label">Busy:</span>
            <span className="stat-value">{status.busyAgents}</span>
          </div>
        )}
        {status.queueLength > 0 && (
          <div className="stat-item">
            <span className="stat-label">In Queue:</span>
            <span className="stat-value">{status.queueLength}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="agent-btn human-agent"
          onClick={() => handleAgentTypeSelection('human')}
          disabled={!status.isWithinBusinessHours && status.availableAgents === 0}
        >
          <span className="btn-icon">👤</span>
          <div className="btn-content">
            <span className="btn-title">Human Agent</span>
            <span className="btn-subtitle">
              {status.availableAgents > 0
                ? 'Available now'
                : status.queueLength > 0
                ? `Wait ~${status.estimatedWaitTime}min`
                : 'Offline'}
            </span>
          </div>
        </button>

        <button
          className="agent-btn ai-agent"
          onClick={() => handleAgentTypeSelection('ai')}
        >
          <span className="btn-icon">🤖</span>
          <div className="btn-content">
            <span className="btn-title">AI Assistant</span>
            <span className="btn-subtitle">Instant response</span>
          </div>
        </button>
      </div>

      {/* Auto-refresh Toggle */}
      <div className="auto-refresh-toggle">
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <span>Auto-refresh every 10s</span>
        </label>
      </div>

      {/* Live Indicator */}
      {autoRefresh && (
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span>Live</span>
        </div>
      )}
    </div>
  );
};

export default AgentAvailabilityWidget;
