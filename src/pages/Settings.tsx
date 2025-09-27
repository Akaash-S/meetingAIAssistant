import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { 
  User,
  Bell,
  Shield,
  Users,
  Palette,
  Save,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [notifications, setNotifications] = useState({
    emailDigest: true,
    taskReminders: true,
    meetingUpdates: false,
    weeklyReports: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => apiService.getUserProfile(user?.id || ''),
    enabled: !!user?.id,
  });

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => apiService.getUserStats(user?.id || ''),
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string; photo_url?: string }) =>
      apiService.updateUserProfile(user?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    },
    onError: (error: any) => {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      setTimeout(() => setSaveMessage(null), 5000);
    },
  });

  // Update profile data when userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || user?.name || '',
        email: userProfile.email || user?.email || '',
        role: userProfile.role || 'User',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  }, [userProfile, user]);

  const handleProfileChange = (key: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        name: profileData.name,
        email: profileData.email,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'stats', label: 'Statistics', icon: Target },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <Alert variant={saveMessage.type === 'success' ? 'default' : 'destructive'}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{saveMessage.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={profileData.role}
                        onChange={(e) => handleProfileChange('role', e.target.value)}
                        placeholder="Your role/position"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={profileData.timezone}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="gradient-primary"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Your Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : userStats ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <div className="text-2xl font-bold">{userStats.meeting_count}</div>
                          <div className="text-sm text-muted-foreground">Meetings</div>
                        </div>
                        <div className="text-center p-4 bg-warning/10 rounded-lg">
                          <Target className="w-8 h-8 mx-auto mb-2 text-warning" />
                          <div className="text-2xl font-bold">{userStats.task_count}</div>
                          <div className="text-sm text-muted-foreground">Total Tasks</div>
                        </div>
                        <div className="text-center p-4 bg-success/10 rounded-lg">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                          <div className="text-2xl font-bold">{userStats.completed_tasks}</div>
                          <div className="text-sm text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center p-4 bg-destructive/10 rounded-lg">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-destructive" />
                          <div className="text-2xl font-bold">{userStats.pending_tasks}</div>
                          <div className="text-sm text-muted-foreground">Pending</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No statistics available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {userStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Task Completion</span>
                          <span>{userStats.completion_rate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${userStats.completion_rate}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="email-digest">Email Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily summary of meeting activities
                      </p>
                    </div>
                    <Switch
                      id="email-digest"
                      checked={notifications.emailDigest}
                      onCheckedChange={() => handleNotificationChange('emailDigest')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="task-reminders">Task Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about upcoming task deadlines
                      </p>
                    </div>
                    <Switch
                      id="task-reminders"
                      checked={notifications.taskReminders}
                      onCheckedChange={() => handleNotificationChange('taskReminders')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="meeting-updates">Meeting Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications when meeting analysis is complete
                      </p>
                    </div>
                    <Switch
                      id="meeting-updates"
                      checked={notifications.meetingUpdates}
                      onCheckedChange={() => handleNotificationChange('meetingUpdates')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Summary of completed tasks and upcoming deadlines
                      </p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={notifications.weeklyReports}
                      onCheckedChange={() => handleNotificationChange('weeklyReports')}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Your account is secured with Firebase Authentication
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Email Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          {user?.email || 'No email set'}
                        </div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Account Created</div>
                        <div className="text-sm text-muted-foreground">
                          {userProfile?.created_at ? 
                            new Date(userProfile.created_at).toLocaleDateString() : 
                            'Unknown'
                          }
                        </div>
                      </div>
                      <Badge variant="secondary">Verified</Badge>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}