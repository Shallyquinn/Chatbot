import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AWAY';
  isOnline: boolean;
  currentChats: number;
  maxChats: number;
  lastActiveAt: Date;
  createdAt: Date;
}

interface DashboardStats {
  requests: number;
  totalAgents: number;
  activeChats: number;
  responseTime: string;
  requestsChange: number;
  agentsChange: number;
  chatsChange: number;
  responseTimeChange: number;
}

export function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    requests: 5,
    totalAgents: 20,
    activeChats: 15,
    responseTime: '2.5s',
    requestsChange: -2,
    agentsChange: -5,
    chatsChange: 12.7,
    responseTimeChange: -3,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [onboardForm, setOnboardForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleOnboardAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardForm),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Agent created! Temporary password: ${result.temporaryPassword}`);
        setShowOnboardModal(false);
        setOnboardForm({ firstName: '', lastName: '', email: '', role: '' });
        fetchAgents();
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      const response = await fetch(`http://localhost:3000/admin/agents/${selectedAgent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setSelectedAgent(null);
        fetchAgents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const getStatusBadge = (agent: Agent) => {
    if (agent.isOnline) {
      return (
        <Badge className="bg-[#d5ece5] text-[#006045] border-[#006045]">
          <span className="w-2 h-2 bg-[#006045] rounded-full mr-2"></span>
          Online
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-[#e0e0e0] text-[#7a7a7a]">
        Offline
      </Badge>
    );
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fffdf7] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#1e1e1e] mb-2">Agent Dashboard</h1>
        <p className="text-[#383838] text-lg">
          Keep track of agent activity, performance, and availability.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-[#e0e0e0]">
          <CardContent className="p-5">
            <div className="flex gap-6">
              <div className="bg-[#eaf3f1] border-[#006045] border-[0.5px] p-2 rounded-full">
                <MessageSquare className="w-6 h-6 text-[#006045]" />
              </div>
              <div>
                <p className="text-[#7b7b7b] text-lg mb-2">Requests</p>
                <p className="text-4xl font-bold text-[#1e1e1e]">{stats.requests}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-[#e7473b]">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">{stats.requestsChange}% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e0e0e0]">
          <CardContent className="p-5">
            <div className="flex gap-6">
              <div className="bg-[#eaf3f1] border-[#006045] border-[0.5px] p-2 rounded-full">
                <Users className="w-6 h-6 text-[#006045]" />
              </div>
              <div>
                <p className="text-[#7b7b7b] text-lg mb-2">Total Agents</p>
                <p className="text-4xl font-bold text-[#1e1e1e]">{stats.totalAgents}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-[#e7473b]">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">{stats.agentsChange}% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e0e0e0]">
          <CardContent className="p-5">
            <div className="flex gap-6">
              <div className="bg-[#eaf3f1] border-[#006045] border-[0.5px] p-2 rounded-full">
                <MessageSquare className="w-6 h-6 text-[#006045]" />
              </div>
              <div>
                <p className="text-[#7b7b7b] text-lg mb-2">Active Chats</p>
                <p className="text-4xl font-bold text-[#1e1e1e]">{stats.activeChats}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-[#32bf4e]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+{stats.chatsChange}% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e0e0e0]">
          <CardContent className="p-5">
            <div className="flex gap-6">
              <div className="bg-[#eaf3f1] border-[#006045] border-[0.5px] p-2 rounded-full">
                <Clock className="w-6 h-6 text-[#006045]" />
              </div>
              <div>
                <p className="text-[#7b7b7b] text-lg mb-2">Response Time</p>
                <p className="text-4xl font-bold text-[#1e1e1e]">{stats.responseTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-[#e7473b]">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">{stats.responseTimeChange}% from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Table */}
      <Card className="border-[#d2ddf5]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Agents</CardTitle>
          </div>
          <Button
            onClick={() => setShowOnboardModal(true)}
            className="bg-[#006045] hover:bg-[#004d36] text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Onboard Agent
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#636363] w-5 h-5" />
              <Input
                placeholder="Search Agents.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#bbbbbb]"
              />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[#7b7b7b] font-medium">Showing:</span>
                <Select defaultValue="10">
                  <SelectTrigger className="w-20 bg-[#f3f3f3] border-[#dedede]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="border-[#989898]">
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="border-[#989898]">
                <Download className="w-5 h-5 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-[#efefef]">
                <TableHead className="text-[#595959] font-semibold">Agent Name</TableHead>
                <TableHead className="text-[#595959] font-semibold">Email</TableHead>
                <TableHead className="text-[#595959] font-semibold">Availability</TableHead>
                <TableHead className="text-[#595959] font-semibold">Avg. Response</TableHead>
                <TableHead className="text-[#595959] font-semibold">Chats</TableHead>
                <TableHead className="text-[#595959] font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="bg-[#fdfdfd]">
                  <TableCell className="text-[#848595]">{agent.name}</TableCell>
                  <TableCell className="text-[#848595]">{agent.email}</TableCell>
                  <TableCell>{getStatusBadge(agent)}</TableCell>
                  <TableCell className="text-[#848595]">1mins 2sec</TableCell>
                  <TableCell className="text-[#848595]">{agent.currentChats}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Agent</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Onboard Agent Modal */}
      <Dialog open={showOnboardModal} onOpenChange={setShowOnboardModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#383838] text-xl">Onboard New Agent</DialogTitle>
            <DialogDescription className="text-[#7b7b7b]">
              Add a new agent to the system by providing their details and assigning roles.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOnboardAgent}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[#383838] font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={onboardForm.firstName}
                    onChange={(e) =>
                      setOnboardForm({ ...onboardForm, firstName: e.target.value })
                    }
                    className="bg-[#fbfbfb] border-[#dedede]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[#383838] font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={onboardForm.lastName}
                    onChange={(e) =>
                      setOnboardForm({ ...onboardForm, lastName: e.target.value })
                    }
                    className="bg-[#fbfbfb] border-[#dedede]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#383838] font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={onboardForm.email}
                  onChange={(e) =>
                    setOnboardForm({ ...onboardForm, email: e.target.value })
                  }
                  className="bg-[#fbfbfb] border-[#dedede]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-[#383838] font-medium">
                  Role
                </Label>
                <Select
                  value={onboardForm.role}
                  onValueChange={(value) =>
                    setOnboardForm({ ...onboardForm, role: value })
                  }
                >
                  <SelectTrigger className="bg-[#fbfbfb] border-[#dedede]">
                    <SelectValue placeholder="Select Agent Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="senior_agent">Senior Agent</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-[#006045] hover:bg-[#004d36] text-white"
              >
                Add Agent
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAgent?.name}? This action cannot be
              undone. All historical conversations will be reassigned to the default agent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAgent}>
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
