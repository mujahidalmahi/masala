'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Shield, Palette, Bell, Globe, Save } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function SettingsSection({ icon: Icon, title, description, children }: {
  icon: any; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export default function AdminSettings() {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform settings and preferences</p>
        </div>
        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-1" /> Save All
        </Button>
      </motion.div>

      <motion.div variants={item} className="space-y-6">
        {/* System Configuration */}
        <SettingsSection icon={Shield} title="System Configuration" description="Manage core platform settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input defaultValue="StudySprint OS" className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@studysprint.app" className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Users Per Room</Label>
              <Input type="number" defaultValue={50} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Default Session Duration (min)</Label>
              <Input type="number" defaultValue={25} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Maintenance Mode</Label>
            <div className="flex items-center gap-3">
              <Switch />
              <span className="text-sm text-muted-foreground">Enable maintenance mode — blocks all user access</span>
            </div>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection icon={Palette} title="Appearance" description="Customize the platform look and feel">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Theme toggle applies to the current session. Persistent theming requires backend integration.</p>
            </div>
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input type="color" defaultValue="#6366f1" className="w-12 h-10 p-1 bg-muted border-border" />
                <Input defaultValue="#6366f1" className="bg-muted border-border text-foreground flex-1" />
              </div>
            </div>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon={Bell} title="Notifications" description="Configure notification preferences">
          <div className="space-y-4">
            {[
              { label: 'New user registrations', desc: 'Notify when a new user signs up' },
              { label: 'Report generation', desc: 'Notify when weekly/monthly reports are ready' },
              { label: 'System alerts', desc: 'Notify about server issues or maintenance' },
              { label: 'Email summaries', desc: 'Receive daily email summaries of platform activity' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={notifications} />
              </div>
            ))}
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
        </SettingsSection>

        {/* Localization */}
        <SettingsSection icon={Globe} title="Localization" description="Language and regional settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">EST</SelectItem>
                  <SelectItem value="pst">PST</SelectItem>
                  <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
        </SettingsSection>
      </motion.div>
    </motion.div>
  );
}
