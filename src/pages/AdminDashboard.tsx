import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye,
  Users,
  MessageSquare,
  Mail,
  TrendingUp,
  Calendar,
  Clock,
  LogOut,
  Search,
  Filter,
  CalendarDays,
  Globe,
  Shield
} from "lucide-react";

interface AdminUser {
  userId: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  loginTime: number;
  iat: number;
  exp: number;
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
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  admin_response?: string;
  responded_at?: string;
  profiles: {
    full_name: string;
    email: string;
  };
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [responseText, setResponseText] = useState('');
  const [calendarSettings, setCalendarSettings] = useState({
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    },
    timezone: 'America/New_York',
    bufferTime: 15,
    maxAdvanceBooking: 60,
    connected: false,
    googleCalendarId: ''
  });
  const [holidays, setHolidays] = useState([
    { name: "New Year's Day", date: "2025-01-01", enabled: true },
    { name: "Martin Luther King Jr. Day", date: "2025-01-20", enabled: true },
    { name: "Presidents' Day", date: "2025-02-17", enabled: true },
    { name: "Memorial Day", date: "2025-05-26", enabled: true },
    { name: "Independence Day", date: "2025-07-04", enabled: true },
    { name: "Labor Day", date: "2025-09-01", enabled: true },
    { name: "Columbus Day", date: "2025-10-13", enabled: true },
    { name: "Veterans Day", date: "2025-11-11", enabled: true },
    { name: "Thanksgiving", date: "2025-11-27", enabled: true },
    { name: "Christmas Day", date: "2025-12-25", enabled: true }
  ]);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (adminUser) {
      loadDashboardData();
      loadCalendarSettings();
    }
  }, [adminUser]);

  const checkAdminAuth = async () => {
    try {
      // Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        navigate('/admin-login');
        return;
      }

      // Verify admin role
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate('/admin-login');
        return;
      }

      // Set admin user data
      setAdminUser({
        userId: session.user.id,
        email: session.user.email || '',
        fullName: session.user.user_metadata?.full_name || session.user.email || '',
        isAdmin: true,
        loginTime: new Date(session.user.created_at).getTime(),
        iat: 0,
        exp: 0
      });

      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/admin-login');
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
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarSettings = async () => {
    try {
      const { data } = await supabase
        .from('calendar_settings')
        .select('*')
        .eq('admin_id', adminUser?.userId)
        .single();

      if (data) {
        setCalendarSettings(prev => ({
          ...prev,
          connected: !!data.access_token,
          googleCalendarId: data.google_calendar_id
        }));
      }
    } catch (error) {
      console.error('Error loading calendar settings:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get page views
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get sessions
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (pageViews && sessions) {
        // Calculate metrics
        const totalPageViews = pageViews.length;
        const uniqueVisitors = new Set(pageViews.map(pv => pv.session_id)).size;
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

      // For admin access, get profile data with proper admin authentication
      // Admin policies should allow access to all profile data including emails
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', messagesData?.map(m => m.user_id) || []);

      if (profilesError) {
        console.warn('Limited profile access due to security policies:', profilesError);
        // If we can't get full profile data, create limited profile data
        const messagesWithLimitedProfiles = messagesData?.map(message => ({
          ...message,
          profiles: { full_name: 'User Profile', email: 'Access Restricted' }
        })) || [];
        
        setMessages(messagesWithLimitedProfiles);
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

  const handleGoogleCalendarConnect = async () => {
    try {
      // Redirect to Google Calendar OAuth
      const baseUrl = 'https://gdnpareharddegunrjyz.supabase.co';
      const oauthUrl = `${baseUrl}/functions/v1/google-calendar-oauth?state=${adminUser?.userId}`;
      window.location.href = oauthUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive",
      });
    }
  };

  const handleResponseSubmit = async (messageId: string) => {
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

      setSelectedMessage(null);
      setResponseText('');
      loadMessages(); // Reload messages to reflect the update
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveCalendarSettings = async () => {
    try {
      const { error } = await supabase
        .from('calendar_settings')
        .upsert({
          admin_id: adminUser?.userId,
          // Store other settings as needed
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Calendar settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin-login');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Filter functions
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
              <p className="text-sm text-muted-foreground">Welcome back, {adminUser?.fullName}</p>
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
              { id: 'analytics', label: 'Analytics', icon: Eye },
              { id: 'calendar', label: 'Calendar Settings', icon: Calendar }
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
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                {analytics ? (
                  <div className="space-y-6">
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center text-muted-foreground">
                          <p>Loading analytics...</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Pending Items Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pending Messages */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Pending Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {messages.filter(m => m.status === 'unread').slice(0, 3).map((message) => (
                          <div key={message.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{message.subject}</p>
                                <p className="text-xs text-muted-foreground">{message.profiles.full_name}</p>
                              </div>
                              <Badge variant="destructive" className="text-xs">New</Badge>
                            </div>
                          </div>
                        ))}
                        {messages.filter(m => m.status === 'unread').length === 0 && (
                          <p className="text-sm text-muted-foreground">No pending messages</p>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('messages')}
                        >
                          View All ({messages.filter(m => m.status === 'unread').length})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending Contacts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Pending Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {contactSubmissions.filter(c => c.status === 'new').slice(0, 3).map((contact) => (
                          <div key={contact.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{contact.subject}</p>
                                <p className="text-xs text-muted-foreground">{contact.name}</p>
                              </div>
                              <Badge variant="destructive" className="text-xs">New</Badge>
                            </div>
                          </div>
                        ))}
                        {contactSubmissions.filter(c => c.status === 'new').length === 0 && (
                          <p className="text-sm text-muted-foreground">No pending contacts</p>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('contacts')}
                        >
                          View All ({contactSubmissions.filter(c => c.status === 'new').length})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calendar Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Calendar Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Google Calendar</span>
                          <Badge variant={calendarSettings.connected ? "default" : "secondary"}>
                            {calendarSettings.connected ? "Connected" : "Not Connected"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Timezone</span>
                          <span className="text-xs text-muted-foreground">{calendarSettings.timezone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Working Days</span>
                          <span className="text-xs text-muted-foreground">
                            {Object.values(calendarSettings.workingHours).filter(h => h.enabled).length} days
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('calendar')}
                        >
                          Manage Calendar
                        </Button>
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
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg">
                      <CardHeader>
                        <CardTitle>Respond to Message</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Original Message:</p>
                          <p className="text-sm">{selectedMessage.message}</p>
                        </div>
                        <div>
                          <Label htmlFor="response">Your Response</Label>
                          <Textarea
                            id="response"
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response here..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedMessage(null);
                              setResponseText('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleResponseSubmit(selectedMessage.id)}
                            disabled={!responseText.trim()}
                          >
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

            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Calendar Settings</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Working Hours */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Working Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(calendarSettings.workingHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={hours.enabled}
                              onCheckedChange={(enabled) => 
                                setCalendarSettings(prev => ({
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [day]: { ...hours, enabled }
                                  }
                                }))
                              }
                            />
                            <Label className="capitalize font-medium">{day}</Label>
                          </div>
                          {hours.enabled && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={hours.start}
                                onChange={(e) => 
                                  setCalendarSettings(prev => ({
                                    ...prev,
                                    workingHours: {
                                      ...prev.workingHours,
                                      [day]: { ...hours, start: e.target.value }
                                    }
                                  }))
                                }
                                className="w-24"
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={hours.end}
                                onChange={(e) => 
                                  setCalendarSettings(prev => ({
                                    ...prev,
                                    workingHours: {
                                      ...prev.workingHours,
                                      [day]: { ...hours, end: e.target.value }
                                    }
                                  }))
                                }
                                className="w-24"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Calendar Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Calendar Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <select 
                          value={calendarSettings.timezone}
                          onChange={(e) => setCalendarSettings(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full p-2 border rounded-md bg-background text-foreground"
                        >
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="America/Chicago">Central Time (US & Canada)</option>
                          <option value="America/Denver">Mountain Time (US & Canada)</option>
                          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Buffer Time (minutes)</Label>
                        <Input
                          type="number"
                          value={calendarSettings.bufferTime}
                          onChange={(e) => setCalendarSettings(prev => ({ 
                            ...prev, 
                            bufferTime: parseInt(e.target.value) 
                          }))}
                          min="0"
                          max="60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Max Advance Booking (days)</Label>
                        <Input
                          type="number"
                          value={calendarSettings.maxAdvanceBooking}
                          onChange={(e) => setCalendarSettings(prev => ({ 
                            ...prev, 
                            maxAdvanceBooking: parseInt(e.target.value) 
                          }))}
                          min="1"
                          max="365"
                        />
                      </div>

                      <Button 
                        className="w-full"
                        onClick={handleGoogleCalendarConnect}
                        disabled={calendarSettings.connected}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {calendarSettings.connected ? 'Calendar Connected ✓' : 'Connect Google Calendar'}
                      </Button>

                      {calendarSettings.connected && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-300">
                            ✓ Google Calendar connected successfully
                          </p>
                          {calendarSettings.googleCalendarId && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Calendar ID: {calendarSettings.googleCalendarId}
                            </p>
                          )}
                        </div>
                      )}

                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={saveCalendarSettings}
                      >
                        Save Settings
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Holidays */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Holiday Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {holidays.map((holiday, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{holiday.name}</p>
                              <p className="text-sm text-muted-foreground">{holiday.date}</p>
                            </div>
                            <Switch
                              checked={holiday.enabled}
                              onCheckedChange={(enabled) => {
                                const updatedHolidays = [...holidays];
                                updatedHolidays[index] = { ...holiday, enabled };
                                setHolidays(updatedHolidays);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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