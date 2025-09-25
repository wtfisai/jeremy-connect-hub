import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Eye, 
  MessageSquare, 
  Mail, 
  Calendar,
  TrendingUp,
  Clock,
  LogOut,
  Search,
  Filter
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  last_login: string;
  userId: string;
}

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  averageSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
}

interface Message {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_response?: string;
  created_at: string;
  profiles: { full_name: string; email: string };
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [responseText, setResponseText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (adminUser) {
      loadDashboardData();
    }
  }, [adminUser]);

  const checkAdminAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }

    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin-login';
        return;
      }
      setAdminUser(decoded);
    } catch (error) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin-login';
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAnalytics(),
        loadMessages(),
        loadContactSubmissions()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get page views from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: pageViews } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('started_at', thirtyDaysAgo.toISOString());

      if (pageViews && sessions) {
        const uniqueVisitors = new Set(pageViews.map(pv => pv.session_id)).size;
        const totalPageViews = pageViews.length;
        const totalSessions = sessions.length;
        
        // Calculate average session duration
        const sessionsWithDuration = sessions.filter(s => s.total_duration);
        const averageSessionDuration = sessionsWithDuration.length > 0
          ? sessionsWithDuration.reduce((sum, s) => sum + (s.total_duration || 0), 0) / sessionsWithDuration.length
          : 0;

        // Top pages
        const pageCounts = pageViews.reduce((acc: Record<string, number>, pv) => {
          acc[pv.page_url] = (acc[pv.page_url] || 0) + 1;
          return acc;
        }, {});
        const topPages = Object.entries(pageCounts)
          .map(([page, views]) => ({ page, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        // Device types
        const deviceCounts = sessions.reduce((acc: Record<string, number>, s) => {
          acc[s.device_type || 'unknown'] = (acc[s.device_type || 'unknown'] || 0) + 1;
          return acc;
        }, {});
        const deviceTypes = Object.entries(deviceCounts)
          .map(([type, count]) => ({ type, count }));

        // Browsers
        const browserCounts = sessions.reduce((acc: Record<string, number>, s) => {
          acc[s.browser || 'unknown'] = (acc[s.browser || 'unknown'] || 0) + 1;
          return acc;
        }, {});
        const browsers = Object.entries(browserCounts)
          .map(([browser, count]) => ({ browser, count }));

        setAnalytics({
          totalPageViews,
          uniqueVisitors,
          totalSessions,
          averageSessionDuration: Math.round(averageSessionDuration),
          topPages,
          deviceTypes,
          browsers
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // Get messages and user profiles separately
      const { data: messagesData, error: messagesError } = await supabase
        .from('premium_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Combine messages with profiles
      const messagesWithProfiles = messagesData?.map(message => {
        const profile = profilesData?.find(p => p.user_id === message.user_id);
        return {
          ...message,
          profiles: profile ? { full_name: profile.full_name || 'Unknown', email: profile.email || 'Unknown' } : { full_name: 'Unknown', email: 'Unknown' }
        };
      }) || [];

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadContactSubmissions = async () => {
    try {
      const { data } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      setContactSubmissions(data || []);
    } catch (error) {
      console.error('Error loading contact submissions:', error);
    }
  };

  const respondToMessage = async (messageId: string) => {
    if (!responseText.trim()) return;

    try {
      const { error } = await supabase
        .from('premium_messages')
        .update({
          status: 'responded',
          admin_response: responseText,
          responded_at: new Date().toISOString(),
          responded_by: adminUser?.userId
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Response Sent",
        description: "Your response has been saved successfully.",
      });

      setResponseText('');
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error('Error responding to message:', error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContactSubmissions = contactSubmissions.filter(submission =>
    submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container-max section-padding">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {adminUser.full_name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container-max section-padding">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'messages', label: 'Premium Messages', icon: MessageSquare },
              { id: 'contacts', label: 'Contact Forms', icon: Mail },
              { id: 'analytics', label: 'Analytics', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container-max section-padding py-8">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && analytics && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalPageViews}</div>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.uniqueVisitors}</div>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalSessions}</div>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.floor(analytics.averageSessionDuration / 60)}m</div>
                      <p className="text-xs text-muted-foreground">{analytics.averageSessionDuration % 60}s average</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.topPages.map((page, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm truncate">{page.page}</span>
                            <span className="text-sm font-medium">{page.views}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Device Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.deviceTypes.map((device, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{device.type}</span>
                            <span className="text-sm font-medium">{device.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Premium Messages</h2>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <Card key={message.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{message.subject}</h3>
                              <Badge variant={message.status === 'unread' ? 'destructive' : 'default'}>
                                {message.status}
                              </Badge>
                              <Badge variant="outline">
                                {message.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              From: {message.profiles.full_name} ({message.profiles.email})
                            </p>
                            <p className="text-sm line-clamp-2">{message.message}</p>
                            {message.admin_response && (
                              <div className="mt-4 p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">Your Response:</p>
                                <p className="text-sm">{message.admin_response}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(message.created_at)}
                            </p>
                            {message.status === 'unread' && (
                              <Button
                                size="sm"
                                className="mt-2"
                                onClick={() => setSelectedMessage(message)}
                              >
                                Respond
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Response Modal */}
                {selectedMessage && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl">
                      <CardHeader>
                        <CardTitle>Respond to Message</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium">Original Message:</h4>
                          <p className="text-sm text-muted-foreground">{selectedMessage.message}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Your Response:</label>
                          <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response here..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                            Cancel
                          </Button>
                          <Button onClick={() => respondToMessage(selectedMessage.id)}>
                            Send Response
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Contact Form Submissions</h2>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredContactSubmissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{submission.subject}</h3>
                              <Badge variant={submission.status === 'new' ? 'destructive' : 'default'}>
                                {submission.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              From: {submission.name} ({submission.email})
                            </p>
                            <p className="text-sm">{submission.message}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(submission.created_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;