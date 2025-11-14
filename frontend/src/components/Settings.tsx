import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Zap, Shield, DollarSign, User, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Toaster } from './ui/sonner';

export function Settings({ darkMode }: { darkMode: boolean }) {
  const [settings, setSettings] = useState({
    // Thermal Control Settings
    maxTemperature: 85,
    autoShutdown: true,
    cooldownTime: 10,

    // Fire Detection Settings
    smokeThreshold: 40,
    tempThreshold: 50,
    bfpNotification: true,
    localAlarm: true,

    // Notification Settings
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,

    // Billing Settings
    monthlyBudget: 8000,
    meralcoRate: 11.5,
    budgetAlerts: true,

    // User Profile
    userName: 'User',
    phoneNumber: '+63 912 345 6789',
    email: 'user@email.com',
  });

  const handleSave = () => {
    Toaster.success('Settings saved successfully!');
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'border-orange-200'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
            <User className="h-5 w-5 text-orange-500" />
            User Profile
          </CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : ''}>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                value={settings.userName}
                onChange={(e) => updateSetting('userName', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => updateSetting('email', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phoneNumber}
                onChange={(e) => updateSetting('phoneNumber', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thermal Control Settings */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Thermal Control
          </CardTitle>
          <CardDescription>Configure automated thermal monitoring and shutdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Shutdown</Label>
              <p className="text-sm text-gray-500">Automatically shut off overheating appliances</p>
            </div>
            <Switch
              checked={settings.autoShutdown}
              onCheckedChange={(checked) => updateSetting('autoShutdown', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxTemp">Maximum Temperature (°C)</Label>
              <Input
                id="maxTemp"
                type="number"
                value={settings.maxTemperature}
                onChange={(e) => updateSetting('maxTemperature', parseInt(e.target.value))}
                className="border-orange-200 focus:border-orange-400"
              />
              <p className="text-xs text-gray-500">Appliances will shut down above this temperature</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cooldown">Cooldown Time (minutes)</Label>
              <Input
                id="cooldown"
                type="number"
                value={settings.cooldownTime}
                onChange={(e) => updateSetting('cooldownTime', parseInt(e.target.value))}
                className="border-orange-200 focus:border-orange-400"
              />
              <p className="text-xs text-gray-500">Minimum time before allowing resumption</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fire Detection Settings */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Fire Detection & Alert System
          </CardTitle>
          <CardDescription>Configure fire safety thresholds and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>BFP Notification</Label>
              <p className="text-sm text-gray-500">Alert Bureau of Fire Protection in extreme situations</p>
            </div>
            <Switch
              checked={settings.bfpNotification}
              onCheckedChange={(checked) => updateSetting('bfpNotification', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Local Alarm</Label>
              <p className="text-sm text-gray-500">Sound alarm on power strip</p>
            </div>
            <Switch
              checked={settings.localAlarm}
              onCheckedChange={(checked) => updateSetting('localAlarm', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smokeThreshold">Smoke Threshold (%)</Label>
              <Input
                id="smokeThreshold"
                type="number"
                value={settings.smokeThreshold}
                onChange={(e) => updateSetting('smokeThreshold', parseInt(e.target.value))}
                className="border-orange-200 focus:border-orange-400"
              />
              <p className="text-xs text-gray-500">Trigger alert above this smoke level</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tempThreshold">Temperature Threshold (°C)</Label>
              <Input
                id="tempThreshold"
                type="number"
                value={settings.tempThreshold}
                onChange={(e) => updateSetting('tempThreshold', parseInt(e.target.value))}
                className="border-orange-200 focus:border-orange-400"
              />
              <p className="text-xs text-gray-500">Trigger alert above this ambient temperature</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Notifications
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive alerts on your mobile device</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive alerts via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive alerts via text message</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-500" />
            Billing & Budget
          </CardTitle>
          <CardDescription>Manage your energy budget and rate settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Budget Alerts</Label>
              <p className="text-sm text-gray-500">Notify when approaching budget limit</p>
            </div>
            <Switch
              checked={settings.budgetAlerts}
              onCheckedChange={(checked) => updateSetting('budgetAlerts', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyBudget">Monthly Budget (₱)</Label>
              <Input
                id="monthlyBudget"
                type="number"
                value={settings.monthlyBudget}
                onChange={(e) => updateSetting('monthlyBudget', parseInt(e.target.value))}
                className="border-orange-200 focus:border-orange-400"
              />
              <p className="text-xs text-gray-500">Your target monthly electricity budget</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meralcoRate">Meralco Rate (₱/kWh)</Label>
              <Input
                id="meralcoRate"
                type="number"
                step="0.01"
                value={settings.meralcoRate}
                onChange={(e) => updateSetting('meralcoRate', parseFloat(e.target.value))}
                className="border-orange-200 focus:border-orange-400"
              />
              <p className="text-xs text-gray-500">Current electricity rate per kWh</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

