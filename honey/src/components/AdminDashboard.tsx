import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Users, UserCheck, Smile, Clock, Download, User, Search, ChevronLeft, ChevronRight, X, Edit2, Camera, UserPlus, Upload } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Header from './Header';
import AgentManagementModal, { AgentFormData } from './AgentManagementModal';
import BulkAgentOnboardModal, { BulkAgentData, BulkAgentResult } from './BulkAgentOnboardModal';
import { useNotification } from '../contexts/NotificationContext';
import { MetricCard, ChartCard } from './dashboard';

// Types and services
import type { Agent, QueueItem, AdminProfile, UpdateAdminProfileDto } from '../types/admin';
import adminApi from '../services/adminApi';

// Hooks
import { useDashboardData } from '../hooks/useDashboardData';

// Utilities and mock data (fallbacks)
import {
  generateMockNewUsersData,
  generateMockRecurringUsersData,
  generateMockPerformanceData,
  generateMockEngagementData,
} from '../utils/mockData';

const AdminDashboard: React.FC = () => {
  // Use notification context
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Use centralized data-fetching hook for modularity and auto-refresh (10 second interval)
  const {
    metrics,
    agents,
    conversationQueue,
    adminProfile: hookAdminProfile,
    loading,
    refetchAgents,
    refetchQueue,
  } = useDashboardData(10000); // Changed from 30000 to 10000 (10 seconds)

  // Local admin profile state (for editing before save)
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(hookAdminProfile || {
    id: '',
    name: 'Admin',
    email: 'admin@email.com',
    profileImage: undefined,
    role: 'ADMIN'
  });

  // Sync hook admin profile to local state when loaded
  useEffect(() => {
    if (hookAdminProfile) {
      setAdminProfile(hookAdminProfile);
    }
  }, [hookAdminProfile]);

  const [activeTab, setActiveTab] = useState<string>('admin');
  const [agentSubTab, setAgentSubTab] = useState<'agents' | 'requests'>('agents');
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEditData, setProfileEditData] = useState({
    name: '',
    email: '',
    profileImage: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Enhancement states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<QueueItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [agentSortField, setAgentSortField] = useState<'name' | 'status' | 'chats' | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [agentSortDirection, setAgentSortDirection] = useState<'asc' | 'desc'>('asc');
  const [requestSortField, setRequestSortField] = useState<'waitTime' | 'position' | null>(null);
  const [requestSortDirection, setRequestSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  
  // Bulk assignment states
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkAssignStrategy, setBulkAssignStrategy] = useState<'AUTO' | 'MANUAL' | 'ROUND_ROBIN' | 'LEAST_BUSY'>('AUTO');
  
  // Bulk upload state
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  
  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Mock data is provided by centralized utilities in src/utils/mockData

  // Smart chart data: Use real data if available, fallback to mock if database is empty
  // For now, charts always use mock data since we don't have analytics endpoints yet
  // TODO: Replace with real analytics data when endpoints are implemented
  const newUsersData = generateMockNewUsersData();
  const recurringUsersData = generateMockRecurringUsersData();
  const performanceData = generateMockPerformanceData();
  const engagementData = generateMockEngagementData();

  // Handle onboard agent
  const handleOnboardAgent = async (agentData: AgentFormData) => {
    try {
      // Call real API endpoint with all new fields
      await adminApi.createAgent({
        firstName: agentData.firstName,
        lastName: agentData.lastName,
        email: agentData.email,
        password: agentData.password || 'Temp123!', // Use generated/provided password
        maxChats: 5, // Default max chats
        state: agentData.state,
        lga: agentData.lga,
        primaryLanguage: agentData.primaryLanguage,
        secondaryLanguage: agentData.secondaryLanguage,
      });
      
      showSuccess(`Agent ${agentData.firstName} ${agentData.lastName} has been onboarded successfully!`);
      
      // Refresh agents list
      await refetchAgents();
      setShowOnboardModal(false);
    } catch (error) {
      console.error('Error onboarding agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to onboard agent. Please try again.';
      showError(errorMessage, 'Onboarding Error');
    }
  };

  // Handle bulk agent upload
  const handleBulkUpload = async (agents: BulkAgentData[]): Promise<BulkAgentResult> => {
    try {
      const response = await adminApi.bulkCreateAgents(agents);
      
      if (response.success.length > 0) {
        showSuccess(`Successfully onboarded ${response.success.length} agent(s)`);
        await refetchAgents();
      }
      
      if (response.failed.length > 0) {
        showWarning(`${response.failed.length} agent(s) failed to onboard. Check the details.`);
      }
      
      // Convert response to match BulkAgentResult type
      return {
        success: agents.filter(agent => 
          response.success.some(s => s.email === agent.email)
        ),
        failed: response.failed.map(f => ({
          row: f.row,
          data: agents[f.row - 1] || { firstName: '', lastName: '', email: f.email },
          error: f.error
        }))
      };
    } catch (error) {
      console.error('Error bulk uploading agents:', error);
      showError('Failed to process bulk upload', 'Upload Error');
      throw error;
    }
  };

  // Handle delete agent
  const handleDeleteAgent = async (agentId: string) => {
    try {
      // Find agent info for notification
      const agentList = Array.isArray(agents) ? agents : [];
      const agent = agentList.find(a => a.id === agentId);
      
      // Call real API endpoint
      await adminApi.deleteAgent(agentId);
      
      showSuccess(`Agent ${agent?.name || 'User'} has been removed successfully!`);
      
      // Refresh agents list
      await refetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete agent. Please try again.';
      showError(errorMessage, 'Delete Error');
    }
  };

  // Handle request sorting
  const handleRequestSort = (field: 'waitTime' | 'position') => {
    if (requestSortField === field) {
      setRequestSortDirection(requestSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setRequestSortField(field);
      setRequestSortDirection('asc');
    }
  };

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    // Ensure agents is an array
    const agentList = Array.isArray(agents) ? agents : [];
    
    let filtered = agentList.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           agent.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesSearch;
    });

    if (agentSortField) {
      filtered = [...filtered].sort((a, b) => {
        let compareValue = 0;
        
        if (agentSortField === 'name') {
          compareValue = a.name.localeCompare(b.name);
        } else if (agentSortField === 'status') {
          compareValue = a.status.localeCompare(b.status);
        } else if (agentSortField === 'chats') {
          compareValue = (a._count?.assignedConversations || 0) - (b._count?.assignedConversations || 0);
        }
        
        return agentSortDirection === 'asc' ? compareValue : -compareValue;
      });
    }

    return filtered;
  }, [agents, debouncedSearchTerm, agentSortField, agentSortDirection]);

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    // Ensure conversationQueue is an array
    const queueList = Array.isArray(conversationQueue) ? conversationQueue : [];
    
    let filtered = queueList.filter(request =>
      debouncedSearchTerm
        ? (request.user?.name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        : true
    );

    if (requestSortField) {
      filtered = [...filtered].sort((a, b) => {
        let compareValue = 0;
        
        if (requestSortField === 'position') {
          compareValue = a.position - b.position;
        } else if (requestSortField === 'waitTime') {
          // Parse wait time (assuming format like "5 mins")
          const getMinutes = (waitTime: string) => {
            const match = waitTime.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          compareValue = getMinutes(a.waitTime) - getMinutes(b.waitTime);
        }
        
        return requestSortDirection === 'asc' ? compareValue : -compareValue;
      });
    }

    return filtered;
  }, [conversationQueue, debouncedSearchTerm, requestSortField, requestSortDirection]);

  // Calculate pagination for agents
  const totalPages = Math.ceil(filteredAndSortedAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgents = filteredAndSortedAgents.slice(startIndex, endIndex);
  
  // Pagination for requests
  const requestTotalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
  const requestStartIndex = (currentPage - 1) * itemsPerPage;
  const requestEndIndex = requestStartIndex + itemsPerPage;
  const paginatedRequests = filteredAndSortedRequests.slice(requestStartIndex, requestEndIndex);

  // Handle assign agent
  const handleAssignClick = (request: QueueItem) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!selectedRequest) return;
    
    try {
      const res: { success: boolean; message: string } = await adminApi.assignConversation(selectedRequest.conversationId, agentId);
      if (res && res.success) {
        showSuccess('Agent assigned successfully!');
        setShowAssignModal(false);
        setSelectedRequest(null);
        await refetchQueue();
        await refetchAgents();
      } else {
        showError(res?.message || 'Failed to assign agent', 'Assignment Failed');
      }
    } catch (error) {
      console.error('Assignment failed:', error);
      showError('Error assigning agent', 'Assignment Error');
    }
  };

  // Bulk assignment handlers
  const toggleRequestSelection = (conversationId: string) => {
    const newSelection = new Set(selectedRequests);
    if (newSelection.has(conversationId)) {
      newSelection.delete(conversationId);
    } else {
      newSelection.add(conversationId);
    }
    setSelectedRequests(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedRequests.size === paginatedRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(paginatedRequests.map(r => r.conversationId)));
    }
  };

  const handleBulkAssign = async (agentId?: string) => {
    if (selectedRequests.size === 0) {
      showWarning('No requests selected');
      return;
    }

    try {
      const result = await adminApi.bulkAssignConversations(
        Array.from(selectedRequests),
        agentId,
        agentId ? 'MANUAL' : bulkAssignStrategy
      );

      if (result.success) {
        const message = `${result.message}. ${result.results.success.length} assigned, ${result.results.failed.length} failed.`;
        if (result.results.failed.length > 0) {
          showWarning(message);
        } else {
          showSuccess(message);
        }
        setSelectedRequests(new Set());
        setShowBulkAssignModal(false);
        await refetchQueue();
        await refetchAgents();
      }
    } catch (error) {
      console.error('Bulk assignment failed:', error);
      showError('Error performing bulk assignment', 'Assignment Error');
    }
  };

  const handleAutoAssignAll = async () => {
    try {
      const result = await adminApi.triggerAutoAssignment();
      if (result.success) {
        showSuccess(result.message);
        await refetchQueue();
        await refetchAgents();
      }
    } catch (error) {
      console.error('Auto assignment failed:', error);
      showError('Error triggering auto assignment', 'Auto-Assignment Error');
    }
  };

  // Profile management functions
  const handleEditProfile = () => {
    setProfileEditData({
      name: adminProfile.name,
      email: adminProfile.email,
      profileImage: adminProfile.profileImage || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowProfileModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError('Image size must be less than 2MB', 'Image Too Large');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileEditData(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    // Validation
    if (!profileEditData.name.trim()) {
      showError('Name is required', 'Validation Error');
      return;
    }
    if (!profileEditData.email.trim()) {
      showError('Email is required', 'Validation Error');
      return;
    }
    if (profileEditData.newPassword && profileEditData.newPassword !== profileEditData.confirmPassword) {
      showError('Passwords do not match', 'Validation Error');
      return;
    }
    if (profileEditData.newPassword && !profileEditData.currentPassword) {
      showError('Current password is required to set new password', 'Validation Error');
      return;
    }

    try {
      const updateData: UpdateAdminProfileDto = {
        name: profileEditData.name,
        email: profileEditData.email,
        profileImage: profileEditData.profileImage || null,
      };

      if (profileEditData.newPassword) {
        updateData.currentPassword = profileEditData.currentPassword;
        updateData.newPassword = profileEditData.newPassword;
      }

      // Use centralized adminApi which applies auth headers, retry and error handling
      const result = await adminApi.updateAdminProfile(updateData);

      if (result && result.success) {
        setAdminProfile(result.admin);
        setShowProfileModal(false);
        showSuccess('Profile updated successfully!');

        // If email changed, inform user they may need to re-login
        if (profileEditData.email !== adminProfile.email) {
          showInfo('Login email updated. You may need to re-login.');
        }
      } else {
        showError(result?.message || 'Failed to update profile', 'Update Failed');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      showError('Error updating profile', 'Update Error');
    }
  };

  // Export agents to CSV
  const exportAgentsToCSV = () => {
    const headers = ['Name', 'Email', 'Status', 'Active Chats', 'Max Capacity', 'Usage %'];
    const rows = filteredAndSortedAgents.map((agent: Agent) => [
      agent.name,
      agent.email,
      agent.status,
      agent._count?.assignedConversations || 0,
      agent.maxChats,
      `${Math.round(((agent._count?.assignedConversations || 0) / agent.maxChats) * 100)}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: (string | number)[]) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fffdf7]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#006045] mx-auto mb-4" />
          <p className="text-[#383838]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Smart fallback: Use real data if available (totalConversations > 0), otherwise use mock data
  const hasRealData = metrics?.overview?.totalConversations && metrics.overview.totalConversations > 0;
  
  const totalUsers = hasRealData 
    ? metrics.overview.totalConversations 
    : 1200; // Mock data fallback
  const activeUsers = hasRealData 
    ? metrics.overview.activeConversations 
    : 800;
  const satisfiedUsers = hasRealData 
    ? (metrics.satisfaction?.satisfied || 0)
    : 700;
  const responseTime = hasRealData 
    ? metrics.overview.avgResponseTime 
    : '2.5s';

  // Agent tab metrics - graceful degradation
  const agentList = Array.isArray(agents) ? agents : [];
  const queueList = Array.isArray(conversationQueue) ? conversationQueue : [];
  const hasAgentData = agentList.length > 0;
  const agentRequests = hasAgentData ? queueList.length : 5;
  const agentTotalAgents = hasAgentData ? agentList.length : 20;
  const agentActiveChats = hasAgentData 
    ? agentList.reduce((sum, agent) => sum + (agent._count?.assignedConversations || 0), 0)
    : 15;
  const agentResponseTime = hasRealData 
    ? (metrics?.overview?.avgResponseTime || '2.5s')
    : '2.5s';

  return (
  <div className="bg-[#fffdf7] min-h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <div className={`${isMobile ? 'hidden' : 'fixed'} bg-white border-r border-[#e0e0e0] h-screen left-0 top-0 w-[280px] overflow-y-auto z-20 shadow-sm`}>
        {/* Tabs */}
        <div className="mt-6 px-5">
          <div className="flex gap-1 justify-center mb-4">
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setActiveTab('channels')} 
                className="px-3 py-2 rounded-md transition-all hover:bg-[#f5f5f5]"
              >
                <p className={activeTab === 'channels' ? 'font-semibold text-[#006045] text-sm' : 'text-[#989898] text-sm font-medium'}>
                  Channels
                </p>
              </button>
              {activeTab === 'channels' && <div className="bg-[#006045] h-[3px] w-[50px] rounded-full mt-0.5 transition-all" />}
            </div>
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setActiveTab('agents')} 
                className="px-3 py-2 rounded-md transition-all hover:bg-[#f5f5f5]"
              >
                <p className={activeTab === 'agents' ? 'font-semibold text-[#006045] text-sm' : 'text-[#989898] text-sm font-medium'}>
                  Agents
                </p>
              </button>
              {activeTab === 'agents' && <div className="bg-[#006045] h-[3px] w-[50px] rounded-full mt-0.5 transition-all" />}
            </div>
            <div className="flex flex-col items-center">            
              <button 
                onClick={() => setActiveTab('admin')} 
                className="px-3 py-2 rounded-md transition-all hover:bg-[#f5f5f5]"
              >
                <p className={activeTab === 'admin' ? 'font-semibold text-[#006045] text-sm' : 'text-[#989898] text-sm font-medium'}>Admin</p>
              </button>
              {activeTab === 'admin' && <div className="bg-[#006045] h-[3px] w-[50px] rounded-full mt-0.5 transition-all" />}
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#e0e0e0] to-transparent" />
        </div>

        {/* Profile */}
        <div className="mt-8 px-5">
          <div className="relative w-20 h-20 mx-auto group">
            <div className="bg-gradient-to-br from-[#006045] to-[#004d35] rounded-full w-full h-full shadow-md ring-2 ring-white flex items-center justify-center overflow-hidden">
              {adminProfile.profileImage ? (
                <img 
                  src={adminProfile.profileImage} 
                  alt={adminProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" strokeWidth={2} />
              )}
            </div>
            <button
              onClick={handleEditProfile}
              className="absolute -bottom-1 -right-1 bg-[#006045] hover:bg-[#005038] text-white rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100"
              title="Edit Profile"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-5 text-center">
            <p className="font-bold text-[#1e1e1e] text-lg">{adminProfile.name}</p>
            <p className="font-medium text-[#7b7b7b] text-xs mt-1">{adminProfile.email}</p>
          </div>
        </div>

        {/* Channel Info */}
        <div className="mt-8 px-5 space-y-4 pb-6">
          <div className="pb-4 border-b border-[#f0f0f0]">
            <p className="font-semibold text-[#383838] text-sm">Channel</p>
            <p className="font-medium text-[#006045] text-xs mt-1.5">DKT AI Chatbot</p>
          </div>
          <div className="pb-4 border-b border-[#f0f0f0]">
            <p className="font-semibold text-[#383838] text-sm">Created On</p>
            <p className="font-normal text-[#7b7b7b] text-xs mt-1.5">25/09/2025</p>
          </div>
          <div className="pb-4 border-b border-[#f0f0f0]">
            <p className="font-semibold text-[#383838] text-sm">Opt-In</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <p className="font-normal text-[#7b7b7b] text-xs">Disabled</p>
            </div>
          </div>
        </div>
      </div>

  {/* Main Content */}
  <main className={`${isMobile ? 'w-full py-4 px-4' : 'ml-[280px] py-3 px-6'} min-h-screen max-w-[calc(100vw-280px)]`}>   
        <div className="flex flex-col w-full gap-8 mb-4">    
          {activeTab === 'admin' && (
            <>
            {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
                <div>
                  <h1 className="font-bold text-[#1e1e1e] text-3xl tracking-tight">Admin Dashboard</h1>
                  <p className="font-normal text-[#7b7b7b] text-sm mt-2">
                    Monitor User Engagement and Chatbot Performance metrics
                  </p>
                </div>
                <button className="bg-[#006045] flex gap-2 items-center px-5 py-2.5 rounded-lg hover:bg-[#005038] active:scale-95 transition-all shadow-md hover:shadow-lg">
                  <Download className="w-6 h-6 text-white" strokeWidth={2} />
                  <span className="font-semibold text-sm text-white">Export Data</span>
                </button>
              </div>
              {/* Mock Data Banner - Only shown when database is empty */}
              {!hasRealData && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
                  <div className="bg-amber-100 rounded-full p-1.5 shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 text-sm">Demo Data Active</h4>
                    <p className="text-amber-800 text-xs mt-1">
                      The dashboard is displaying sample data because no conversations have been recorded yet. 
                      Real data will automatically appear once users start interacting with the chatbot.
                    </p>
                  </div>
                </div>
              )}

              {/* Metrics Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <MetricCard
                  icon={Users}
                  title="Total Users"
                  value={totalUsers}
                  trend={{ value: '7.01% from yesterday', isPositive: false }}
                />
                <MetricCard
                  icon={UserCheck}
                  title="Active Users"
                  value={activeUsers}
                  trend={{ value: '12.7% from yesterday', isPositive: true }}
                />
                <MetricCard
                  icon={Smile}
                  title="Satisfied Users"
                  value={satisfiedUsers}
                  trend={{ value: '5.0% from yesterday', isPositive: true }}
                />
                <MetricCard
                  icon={Clock}
                  title="Avg Response Time"
                  value={responseTime}
                  trend={{ value: '3.5% from yesterday', isPositive: true }}
                />
              </div>

              {/* Charts Row 1 */}
              <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                {/* New Users Chart */}
                <ChartCard title="New Users" subtitle="Monthly New User Registrations">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={newUsersData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="10 10" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#7b7b7b" style={{ fontSize: '11px' }} tick={{ fill: '#7b7b7b' }} />
                      <YAxis stroke="#7b7b7b" style={{ fontSize: '11px' }} tick={{ fill: '#7b7b7b' }} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="line" />
                      <Line type="monotone" dataKey="users" stroke="#006045" strokeWidth={2.5} dot={{ fill: '#006045', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Recurring Users Chart */}
                <ChartCard title="Recurring Users" subtitle="Returning user activity">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recurringUsersData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="day" stroke="#7b7b7b" style={{ fontSize: '11px' }} tick={{ fill: '#7b7b7b' }} />
                      <YAxis stroke="#7b7b7b" style={{ fontSize: '11px' }} tick={{ fill: '#7b7b7b' }} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="rect" />
                      <Bar dataKey="users" fill="#006045" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Charts Row 2 */}
              <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                {/* Chatbot Performance */}
                <ChartCard title="Chatbot Performance" subtitle="Request resolution breakdown">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceData}
                        cx="50%"
                        cy="45%"
                        innerRadius={isMobile ? 50 : 80}
                        outerRadius={isMobile ? 80 : 130}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={false}
                      >
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '12px', 
                          background: '#fff', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => `${value}%`}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={50}
                        wrapperStyle={{ 
                          fontSize: '12px', 
                          paddingTop: '20px'
                        }}
                        iconType="circle"
                        iconSize={10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Daily Engagement Pattern */}
                <ChartCard title="Daily Engagement Pattern" subtitle="Overall satisfaction of the day">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#006045" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#006045" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="hour" stroke="#7b7b7b" style={{ fontSize: '11px' }} tick={{ fill: '#7b7b7b' }} />
                      <YAxis stroke="#7b7b7b" style={{ fontSize: '11px' }} tick={{ fill: '#7b7b7b' }} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="engagement" stroke="#006045" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEngagement)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </>
          )}

          {activeTab === 'agents' && (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <div className="flex-1">
                  <h1 className="font-semibold text-[#1e1e1e] text-[22px] leading-tight">Agent Dashboard</h1>
                  <p className="font-normal text-[#383838] text-[14px] leading-normal mt-1">
                    Keep track of agent activity, performance, and availability.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={() => setShowOnboardModal(true)}
                    className="bg-[#006045] flex items-center px-9 py-4 rounded-lg hover:bg-[#005038] active:scale-95 transition-all shadow-sm hover:shadow-md"
                  >
                    <UserPlus className="w-5 h-5 text-white" strokeWidth={2} />
                    <span className="font-semibold text-[14px] leading-normal text-white">Onboard Agent</span>
                  </button>
                  <button 
                    onClick={() => setShowBulkUploadModal(true)}
                    className="bg-[#006045] flex items-center px-9 py-4 rounded-lg hover:bg-[#005038] active:scale-95 transition-all shadow-sm hover:shadow-md"
                  >
                    <Upload className="w-5 h-5 text-white" strokeWidth={2} />
                    <span className="font-semibold text-[14px] leading-normal text-white">Bulk Upload</span>
                  </button>
                  <button 
                    onClick={exportAgentsToCSV}
                    className="bg-white border-2 border-[#006045] flex items-center px-9 py-5 rounded-lg hover:bg-[#f5f5f5] active:scale-95 transition-all shadow-sm hover:shadow-md"
                  >
                    <Download className="w-5 h-5 text-[#006045]" strokeWidth={2} />
                    <span className="font-semibold text-[14px] leading-normal text-[#006045]">Export</span>
                  </button>
                </div>
              </div>
              {/* Agent Demo Data Banner - Only shown when no agents exist */}
              {!hasAgentData && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2 mb-3">
                  <div className="bg-amber-100 rounded-full p-1 shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 text-xs">Demo Agent Data Active</h4>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      The agent metrics are displaying sample data because no agents have been added yet. 
                      Real data will automatically appear once you add agents to the system.
                    </p>
                  </div>
                </div>
              )}

              {/* Agent Metrics Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                <div className="bg-white border border-[#e0e0e0] rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex gap-3 items-start w-full">
                    <div className="bg-[#eaf3f1] border-[0.5px] border-[#006045] rounded-full p-1.5 shrink-0">
                      <Users className="w-9 h-9 text-[#006045]" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className="font-normal text-[#7b7b7b] text-xs leading-normal">Requests</p>
                      <p className="font-bold text-[#1e1e1e] text-2xl leading-tight">{agentRequests}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center w-full">
                    <p className="font-light text-[#e7473b] text-[11px] leading-normal">-2% from yesterday</p>
                    <ChevronRight className="w-4 h-4 text-[#e7473b] transform rotate-90" />
                  </div>
                </div>

                <div className="bg-white border border-[#e0e0e0] rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex gap-3 items-start w-full">
                    <div className="bg-[#eaf3f1] border-[0.5px] border-[#006045] rounded-full p-1.5 shrink-0">
                      <UserCheck className="w-5 h-5 text-[#006045]" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className="font-normal text-[#7b7b7b] text-xs leading-normal">Total Agents</p>
                      <p className="font-bold text-[#1e1e1e] text-2xl leading-tight">{agentTotalAgents}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center w-full">
                    <p className="font-light text-[#e7473b] text-[11px] leading-normal">-5% from yesterday</p>
                    <ChevronRight className="w-5 h-5 text-[#e7473b] transform rotate-90" />
                  </div>
                </div>

                <div className="bg-white border border-[#e0e0e0] rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex gap-3 items-start w-full">
                    <div className="bg-[#eaf3f1] border-[0.5px] border-[#006045] rounded-full p-1.5 shrink-0">
                      <User className="w-5 h-5 text-[#006045]" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className="font-normal text-[#7b7b7b] text-xs leading-normal">Active Chats</p>
                      <p className="font-bold text-[#1e1e1e] text-2xl leading-tight">{agentActiveChats}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center w-full">
                    <p className="font-light text-[#32bf4e] text-[11px] leading-normal">+12.7% from yesterday</p>
                    <ChevronRight className="w-5 h-5 text-[#32bf4e] transform -rotate-90" />
                  </div>
                </div>

                <div className="bg-white border border-[#e0e0e0] rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex gap-3 items-start w-full">
                    <div className="bg-[#eaf3f1] border-[0.5px] border-[#006045] rounded-full p-1.5 shrink-0">
                      <Clock className="w-5 h-5 text-[#006045]" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className="font-normal text-[#7b7b7b] text-xs leading-normal">Response Time</p>
                      <p className="font-bold text-[#1e1e1e] text-2xl leading-tight">{agentResponseTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center w-full">
                    <p className="font-light text-[#e7473b] text-[11px] leading-normal">-3% from yesterday</p>
                    <ChevronRight className="w-5 h-5 text-[#e7473b] transform rotate-90" />
                  </div>
                </div>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex flex-col items-start w-full mb-4">
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => {
                        setAgentSubTab('agents');
                        setCurrentPage(1);
                        setSearchTerm('');
                      }}
                      className={`px-3 py-2 flex gap-2 items-center justify-center transition-colors ${
                        agentSubTab === 'agents' ? '' : ''
                      }`}
                    >
                      <p className={`text-sm leading-normal ${
                        agentSubTab === 'agents'
                          ? 'font-medium text-[#006045]'
                          : 'font-normal text-[#989898]'
                      }`}>
                        Agents
                      </p>
                    </button>
                    {agentSubTab === 'agents' && (
                      <div className="bg-[#006045] h-1 w-[60px] rounded-full" />
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => {
                        setAgentSubTab('requests');
                        setCurrentPage(1);
                        setSearchTerm('');
                      }}
                      className={`px-3 py-2 flex gap-2 items-center justify-center transition-colors ${
                        agentSubTab === 'requests' ? '' : ''
                      }`}
                    >
                      <p className={`text-sm leading-normal ${
                        agentSubTab === 'requests'
                          ? 'font-medium text-[#006045]'
                          : 'font-normal text-[#989898]'
                      }`}>
                        Requests
                      </p>
                    </button>
                    {agentSubTab === 'requests' && (
                      <div className="bg-[#006045] h-1 w-[60px] rounded-full" />
                    )}
                  </div>
                </div>
                <div className="h-0.5 bg-[#e0e0e0] w-full" />
              </div>
              {/* Agents Tab Content */}
              {agentSubTab === 'agents' && (
                <>
                  {/* Search Bar and Controls */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
                    {/* Search Input */}
                    <div className="relative w-full lg:w-[300px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#636363]" />
                      <input
                        type="text"
                        placeholder="Search Agents.."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-[#bbbbbb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045] focus:border-transparent text-sm font-medium text-[#636363]"
                      />
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                      {/* Showing Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-[#7b7b7b] text-sm font-medium leading-normal">Showing:</span>
                        <div className="bg-[#f3f3f3] border border-[#dedede] rounded px-2 py-1 flex items-center gap-1.5">
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            aria-label="Number of items to show per page"
                            className="bg-transparent text-[#404c61] text-sm font-semibold leading-normal focus:outline-none cursor-pointer appearance-none pr-4"
                          >
                            <option value={6}>6</option>
                            <option value={10}>10</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                          </select>
                          <ChevronRight className="w-3 h-3 text-[#404c61] transform rotate-90 pointer-events-none -ml-3" />
                        </div>
                      </div>

                      {/* Filter and Export Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Filter Button */}
                        <button
                          onClick={() => setShowFilterModal(!showFilterModal)}
                          className="bg-white border border-[#989898] rounded px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                          aria-label="Filter agents"
                          title="Filter agents"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <path d="M5.4 2.1H18.6C19.7 2.1 20.6 3 20.6 4.1V6.3C20.6 7.1 20.2 8.1 19.7 8.6L15.3 12.4C14.7 12.9 14.3 13.9 14.3 14.7V19.1C14.3 19.7 13.9 20.5 13.4 20.8L12 21.7C10.7 22.5 8.9 21.6 8.9 20V14.6C8.9 13.9 8.5 13 8.1 12.5L4.3 8.5C3.8 8 3.5 7.1 3.5 6.5V4.2C3.4 3 4.3 2.1 5.4 2.1Z" stroke="#7b7b7b" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p className="text-[#7b7b7b] text-sm font-medium leading-normal">Filter</p>
                        </button>
                        
                        {/* Export Button */}
                        <button 
                          onClick={exportAgentsToCSV}
                          className="bg-white border border-[#989898] rounded px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                          aria-label="Export agents to CSV"
                          title="Export agents to CSV"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <path d="M13 11L21.2 2.79999" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 6.8V2H17.2" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p className="text-[#7b7b7b] text-sm font-medium leading-normal">Export</p>
                          <ChevronRight className="w-4 h-4 text-[#7b7b7b]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Agent Table */}
                  <div className="bg-white border border-[#d2ddf5] rounded-lg p-1.5 mb-4">
                    <div className="flex flex-col">
                      {/* Table Header */}
                      <div className="bg-[#efefef] flex items-center rounded-tl-lg rounded-tr-lg min-h-[48px]">
                        <div className="flex-1 px-3 py-3 border-b border-[#949494] min-w-[180px]">
                          <p className="font-semibold text-[#595959] text-sm leading-normal">Agent Name</p>
                        </div>
                        <div className="flex-1 px-3 py-3 border-b border-[#949494] min-w-[200px]">
                          <p className="font-semibold text-[#595959] text-sm leading-normal">Email</p>
                        </div>
                        <div className="flex-1 px-3 py-3 border-b border-[#949494] min-w-[140px]">
                          <p className="font-semibold text-[#595959] text-sm leading-normal">Availability</p>
                        </div>
                        <div className="flex-1 px-3 py-3 border-b border-[#949494] min-w-[160px]">
                          <p className="font-semibold text-[#595959] text-sm leading-normal">Avg. Response</p>
                        </div>
                        <div className="flex-1 px-3 py-3 border-b border-[#949494] min-w-[120px]">
                          <p className="font-semibold text-[#595959] text-sm leading-normal">Chats</p>
                        </div>
                      </div>

                      {/* Table Body */}
                      {paginatedAgents.length > 0 ? (
                        paginatedAgents.map((agent) => (
                          <div key={agent.id} className="bg-[#fdfdfd] flex items-center min-h-[48px] hover:bg-gray-50 transition-colors">
                            <div className="flex-1 px-3 py-3 border-b border-[#d2d2d2] min-w-[180px]">
                              <p className="font-normal text-[#848595] text-sm leading-normal truncate">{agent.name}</p>
                            </div>
                            <div className="flex-1 px-3 py-3 border-b border-[#d2d2d2] min-w-[200px]">
                              <p className="font-normal text-[#848595] text-sm leading-normal truncate">{agent.email}</p>
                            </div>
                            <div className="flex-1 px-3 py-2 border-b border-[#d2d2d2] min-w-[140px]">
                              {agent.status === 'ONLINE' ? (
                                <div className="bg-[#d5ece5] border border-[#006045] rounded-full px-2.5 py-1.5 flex items-center gap-1.5 w-fit">
                                  <div className="bg-[#006045] rounded-full w-1.5 h-1.5" />
                                  <p className="font-medium text-[#006045] text-xs leading-normal">Online</p>
                                </div>
                              ) : (
                                <div className="bg-[#e0e0e0] rounded-full px-2.5 py-1.5 flex items-center justify-center w-fit">
                                  <p className="font-medium text-[#7a7a7a] text-xs leading-normal">Offline</p>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 px-3 py-3 border-b border-[#d2d2d2] min-w-[160px]">
                              <p className="font-normal text-[#848595] text-sm leading-normal text-center">1mins 2sec</p>
                            </div>
                            <div className="flex-1 px-3 py-3 border-b border-[#d2d2d2] min-w-[120px] flex justify-center">
                              <p className="font-normal text-[#848595] text-sm leading-normal">{agent._count?.assignedConversations || 0}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-[#fdfdfd] flex items-center justify-center py-12 border-b border-[#d2d2d2]">
                          <div className="text-center">
                            <div className="bg-[#f8f9fa] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                              <Search className="h-6 w-6 text-[#949494] opacity-50" />
                            </div>
                            <p className="text-sm font-semibold text-[#7b7b7b]">No agents found</p>
                            <p className="text-xs text-[#949494] mt-1">Try adjusting your search term</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {filteredAndSortedAgents.length > itemsPerPage && (
                    <div className="flex items-center gap-4">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'text-[#949494] cursor-not-allowed'
                            : 'text-[#949494] hover:text-[#383838]'
                        }`}
                      >
                        <ChevronLeft className="w-3 h-3" />
                        <span>Previous</span>
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 4) {
                            pageNum = i + 1;
                          } else if (currentPage <= 2) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 3 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`min-w-[32px] h-8 px-2 rounded text-sm font-semibold transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-[#006045] text-white'
                                  : 'border border-[#949494] text-[#a2a2a2] hover:bg-[#f5f5f5]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {totalPages > 4 && currentPage < totalPages - 1 && (
                          <>
                            <span className="text-[#a2a2a2] text-sm font-medium">...</span>
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              className="min-w-[32px] h-8 px-2 rounded border border-[#949494] text-[#a2a2a2] hover:bg-[#f5f5f5] text-sm font-medium"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'text-[#949494] cursor-not-allowed'
                            : 'text-[#383838] hover:text-[#006045]'
                        }`}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </>
              )}

          {/* Requests Tab Content */}
          {agentSubTab === 'requests' && (
            <>
              {/* Search and Sort Controls */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                {/* Search Bar */}
                <div className="relative w-full lg:w-[384px]">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#949494]" />
                  <input
                    type="text"
                    placeholder="Search Requests.."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-14 pr-5 py-4 border border-[#bbbbbb] rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#006045] focus:border-transparent text-base text-[#636363]"
                  />
                </div>
                
                {/* Actions and Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Bulk Actions */}
                  {selectedRequests.size > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedRequests.size} selected
                      </span>
                      <button
                        onClick={() => setShowBulkAssignModal(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        Bulk Assign
                      </button>
                      <button
                        onClick={() => setSelectedRequests(new Set())}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Auto Assign All Button */}
                  <button
                    onClick={handleAutoAssignAll}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Auto-Assign All
                  </button>
                  
                  {/* Sort Dropdown */}
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        handleRequestSort(value as 'waitTime' | 'position');
                      }
                    }}
                    aria-label="Sort requests"
                    className="px-4 py-3 bg-white border border-[#989898] rounded-[7px] hover:bg-[#f5f5f5] transition-colors text-[#7b7b7b] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#006045] cursor-pointer"
                  >
                    <option value="">Sort By...</option>
                    <option value="position">Position in Queue</option>
                    <option value="waitTime">Wait Time</option>
                  </select>
                  
                  {/* Items Per Page */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#7b7b7b] text-base font-medium">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      aria-label="Requests per page"
                      className="px-3 py-2 bg-[#f3f3f3] border border-[#dedede] rounded-[5px] text-[#404c61] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#006045]"
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Select All Checkbox */}
              {paginatedRequests.length > 0 && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRequests.size === paginatedRequests.length && paginatedRequests.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-[#006045] border-gray-300 rounded focus:ring-[#006045]"
                    />
                    <span className="text-sm font-medium text-gray-700">Select All ({paginatedRequests.length})</span>
                  </label>
                </div>
              )}
              
              {/* Results Count */}
              {debouncedSearchTerm && (
                <p className="text-sm text-gray-600 mb-4">
                  Found {filteredAndSortedRequests.length} request{filteredAndSortedRequests.length !== 1 ? 's' : ''}
                </p>
              )}

              {/* Request Cards Grid */}
              {paginatedRequests.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {paginatedRequests.map((request) => (
                      <div key={request.id} className="bg-white border border-[#e0e0e0] rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedRequests.has(request.conversationId)}
                              onChange={() => toggleRequestSelection(request.conversationId)}
                              className="mt-1 w-4 h-4 text-[#006045] border-gray-300 rounded focus:ring-[#006045]"
                              aria-label={`Select request from ${request.user?.name || 'user'}`}
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-[#1e1e1e] text-base">
                                {request.user?.name || 'Unknown User'}
                              </h3>
                              <p className="text-[#7b7b7b] text-xs mt-1">
                                Position: #{request.position}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                            Waiting
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#7b7b7b]">Wait Time:</span>
                            <span className="font-medium text-[#1e1e1e]">{request.waitTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7b7b7b]">Escalated:</span>
                            <span className="font-medium text-[#1e1e1e]">
                              {request.escalatedAt ? new Date(request.escalatedAt).toLocaleTimeString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAssignClick(request)}
                          className="w-full mt-4 px-4 py-2 bg-[#006045] text-white rounded-lg hover:bg-[#005038] transition-colors text-sm font-medium"
                        >
                          Assign Agent
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination for Requests */}
                  {requestTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-6">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-2 text-base font-medium ${
                          currentPage === 1
                            ? 'text-[#949494] cursor-not-allowed'
                            : 'text-[#383838] hover:text-[#006045]'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(requestTotalPages, 5) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-10 rounded-[3px] text-base font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-[#006045] text-white'
                                : 'border border-[#949494] text-[#a2a2a2] hover:bg-[#f5f5f5]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        {requestTotalPages > 5 && (
                          <>
                            <span className="flex items-center px-2 text-[#949494]">...</span>
                            <button
                              onClick={() => setCurrentPage(requestTotalPages)}
                              className="w-9 h-10 rounded-[3px] border border-[#949494] text-[#a2a2a2] hover:bg-[#f5f5f5] text-base font-medium"
                            >
                              {requestTotalPages}
                            </button>
                          </>
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(requestTotalPages, prev + 1))}
                        disabled={currentPage === requestTotalPages}
                        className={`flex items-center gap-2 text-base font-medium ${
                          currentPage === requestTotalPages
                            ? 'text-[#949494] cursor-not-allowed'
                            : 'text-[#383838] hover:text-[#006045]'
                        }`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (Array.isArray(conversationQueue) ? conversationQueue : []).length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#e0e0e0] rounded-lg text-center py-16">
                  <div className="bg-[#f8f9fa] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 opacity-50 text-[#7b7b7b]" />
                  </div>
                  <p className="text-base font-semibold text-[#7b7b7b]">No pending requests</p>
                  <p className="text-sm text-[#949494] mt-1">Requests will appear here when users escalate chats</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-[#e0e0e0] rounded-lg text-center py-16">
                  <div className="bg-[#f8f9fa] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 opacity-50 text-[#7b7b7b]" />
                  </div>
                  <p className="text-base font-semibold text-[#7b7b7b]">No results found</p>
                  <p className="text-sm text-[#949494] mt-1">Try adjusting your search terms</p>
                </div>
              )}
            </>
          )}
            </>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-5">
              <Header 
                profileImage="./Honey_profile_pic.png"
                showSearch={true}
                onSearchClick={() => console.log('Search functionality')}
              />
              <h2 className="text-lg font-semibold text-[#1e1e1e]">Conversation Queue ({(Array.isArray(conversationQueue) ? conversationQueue : []).length})</h2>

              <div className="grid grid-cols-1 gap-3">
                {(Array.isArray(conversationQueue) ? conversationQueue : []).map((item) => (
                  <div key={item.id} className="bg-white border border-[#e0e0e0] rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-[#1e1e1e] text-sm">
                          User: {item.user?.name || 'Anonymous'}
                        </h4>
                        <p className="text-[#7b7b7b] text-xs mt-1">Waiting: {item.waitTime}</p>
                      </div>
                      <span className="text-[11px] text-[#7b7b7b]">Position #{item.position}</span>
                    </div>
                  </div>
                ))}

                {(Array.isArray(conversationQueue) ? conversationQueue : []).length === 0 && (
                  <div className="bg-white border-2 border-dashed border-[#e0e0e0] rounded-lg text-center py-16">
                    <div className="bg-[#eaf3f1] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="h-8 w-8 text-[#006045] opacity-50" />
                    </div>
                    <p className="text-base font-semibold text-[#7b7b7b]">All clear!</p>
                    <p className="text-sm text-[#949494] mt-1">No conversations waiting in queue</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Assign Agent Modal */}
      {showAssignModal && selectedRequest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAssignModal(false);
              setSelectedRequest(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1e1e1e]">Assign Agent</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Request from:</p>
                <p className="font-bold text-[#1e1e1e]">{selectedRequest.user?.name || 'Unknown User'}</p>
                <p className="text-xs text-gray-500 mt-1">Wait Time: {selectedRequest.waitTime}</p>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">Select an available agent:</p>
              
              <div className="space-y-2">
                {agents
                  .filter(agent => agent.status === 'ONLINE' && (agent._count?.assignedConversations || 0) < agent.maxChats)
                  .map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAssignAgent(agent.id)}
                      className="w-full p-3 border border-gray-200 rounded-lg hover:border-[#006045] hover:bg-[#f0f8f6] transition-all flex justify-between items-center"
                    >
                      <div className="text-left">
                        <p className="font-medium text-[#1e1e1e]">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {agent._count?.assignedConversations || 0}/{agent.maxChats} chats
                        </p>
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium mt-1">
                          Available
                        </span>
                      </div>
                    </button>
                  ))}
                
                {(Array.isArray(agents) ? agents : []).filter(agent => agent.status === 'ONLINE' && (agent._count?.assignedConversations || 0) < agent.maxChats).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No available agents at the moment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBulkAssignModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1e1e1e]">Bulk Assign Conversations</h3>
              <button
                onClick={() => setShowBulkAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium">
                  {selectedRequests.size} conversation{selectedRequests.size !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Assignment Strategy */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Strategy:
                </label>
                <select
                  value={bulkAssignStrategy}
                  onChange={(e) => setBulkAssignStrategy(e.target.value as 'AUTO' | 'MANUAL' | 'ROUND_ROBIN' | 'LEAST_BUSY')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045]"
                  aria-label="Assignment strategy"
                >
                  <option value="AUTO">Auto (Smart - Location + Language)</option>
                  <option value="LEAST_BUSY">Least Busy Agent</option>
                  <option value="ROUND_ROBIN">Round Robin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Auto mode considers agent location, language skills, and current workload
                </p>
              </div>

              {/* Option: Assign to Specific Agent */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Or assign all to a specific agent:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(Array.isArray(agents) ? agents : [])
                    .filter(agent => agent.status === 'ONLINE')
                    .map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleBulkAssign(agent.id)}
                        className="w-full p-3 border border-gray-200 rounded-lg hover:border-[#006045] hover:bg-[#f0f8f6] transition-all flex justify-between items-center"
                      >
                        <div className="text-left">
                          <p className="font-medium text-[#1e1e1e] text-sm">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {agent._count?.assignedConversations || 0}/{agent.maxChats} chats
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowBulkAssignModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAssign()}
                className="px-4 py-2 bg-[#006045] text-white rounded-lg hover:bg-[#005038] transition-colors"
              >
                Auto-Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfileModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1e1e1e]">Edit Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Profile Image Upload */}
              <div className="mb-6 flex flex-col items-center">
                <div className="relative w-24 h-24 mb-3 group">
                  <div className="bg-gradient-to-br from-[#006045] to-[#004d35] rounded-full w-full h-full shadow-md ring-2 ring-white flex items-center justify-center overflow-hidden">
                    {profileEditData.profileImage ? (
                      <img 
                        src={profileEditData.profileImage} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" strokeWidth={2} />
                    )}
                  </div>
                  <label 
                    htmlFor="profile-image-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="Upload profile image"
                  />
                </div>
                <p className="text-xs text-gray-500">Click to upload image (Max 2MB)</p>
                {profileEditData.profileImage && (
                  <button
                    onClick={() => setProfileEditData(prev => ({ ...prev, profileImage: '' }))}
                    className="mt-2 text-xs text-red-600 hover:text-red-700"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profileEditData.name}
                  onChange={(e) => setProfileEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045] focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Login Email)
                  <span className="text-xs text-amber-600 ml-2">⚠ Changing this will update your login credentials</span>
                </label>
                <input
                  type="email"
                  value={profileEditData.email}
                  onChange={(e) => setProfileEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Change Password (Optional)</h4>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={profileEditData.currentPassword}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045] focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={profileEditData.newPassword}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045] focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={profileEditData.confirmPassword}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045] focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-[#006045] text-white rounded-lg hover:bg-[#005038] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Management Modal */}
      <AgentManagementModal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        onAddAgent={handleOnboardAgent}
        onDeleteAgent={handleDeleteAgent}
        agents={(Array.isArray(agents) ? agents : []).map(agent => ({
          id: agent.id,
          name: agent.name,
          email: agent.email,
          status: agent.status,
          currentChats: agent._count?.assignedConversations || 0,
          maxChats: agent.maxChats || 5,
        }))}
      />

      {/* Bulk Agent Onboard Modal */}
      <BulkAgentOnboardModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onBulkUpload={handleBulkUpload}
      />
    </div>
  );
};

export default AdminDashboard;
