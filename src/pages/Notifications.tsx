
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, MessageCircle, Calendar, AlertCircle } from 'lucide-react';

// Mock data
const mockNotifications = [
  { id: '1', type: 'session', title: 'Session Reminder', message: 'Your Piano lesson starts in 30 minutes', time: '5 minutes ago', read: false },
  { id: '2', type: 'admin', title: 'New Announcement', message: 'New course materials have been added to your Guitar course', time: '2 hours ago', read: false },
  { id: '3', type: 'reminder', title: 'Payment Due', message: 'Your monthly payment is due in 3 days', time: '1 day ago', read: true },
  { id: '4', type: 'session', title: 'Session Booked', message: 'New Drums session booked for next Tuesday', time: '2 days ago', read: true },
  { id: '5', type: 'admin', title: 'Holiday Notice', message: 'The school will be closed for Labor Day', time: '3 days ago', read: true },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: true,
    sessions: true,
    reminders: true,
    announcements: true,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleToggleSetting = (setting: keyof typeof notifSettings) => {
    setNotifSettings({
      ...notifSettings,
      [setting]: !notifSettings[setting]
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'admin':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case 'reminder':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{unreadCount} unread</span>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`transition-colors ${notification.read ? '' : 'border-l-4 border-l-primary'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getIcon(notification.type)}
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4 mt-4">
          {notifications
            .filter(n => n.type === 'session')
            .map((notification) => (
              <Card key={notification.id} className={`transition-colors ${notification.read ? '' : 'border-l-4 border-l-primary'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(notification.type)}
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
          ))}
        </TabsContent>

        <TabsContent value="admin" className="space-y-4 mt-4">
          {notifications
            .filter(n => n.type === 'admin')
            .map((notification) => (
              <Card key={notification.id} className={`transition-colors ${notification.read ? '' : 'border-l-4 border-l-primary'}`}>
                <CardContent className="p-4">
                  {/* Same structure as above */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(notification.type)}
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
          ))}
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4 mt-4">
          {notifications
            .filter(n => n.type === 'reminder')
            .map((notification) => (
              <Card key={notification.id} className={`transition-colors ${notification.read ? '' : 'border-l-4 border-l-primary'}`}>
                <CardContent className="p-4">
                  {/* Same structure as above */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(notification.type)}
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Delivery Methods</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    id="email-notif" 
                    checked={notifSettings.email}
                    onCheckedChange={() => handleToggleSetting('email')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notif">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications within the app</p>
                  </div>
                  <Switch 
                    id="push-notif" 
                    checked={notifSettings.push}
                    onCheckedChange={() => handleToggleSetting('push')}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Notification Types</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-notif">Session Notifications</Label>
                    <p className="text-sm text-muted-foreground">Reminders and updates about your sessions</p>
                  </div>
                  <Switch 
                    id="session-notif" 
                    checked={notifSettings.sessions}
                    onCheckedChange={() => handleToggleSetting('sessions')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminder-notif">Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders about upcoming payments</p>
                  </div>
                  <Switch 
                    id="reminder-notif" 
                    checked={notifSettings.reminders}
                    onCheckedChange={() => handleToggleSetting('reminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="announcement-notif">Announcements</Label>
                    <p className="text-sm text-muted-foreground">School announcements and updates</p>
                  </div>
                  <Switch 
                    id="announcement-notif" 
                    checked={notifSettings.announcements}
                    onCheckedChange={() => handleToggleSetting('announcements')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
