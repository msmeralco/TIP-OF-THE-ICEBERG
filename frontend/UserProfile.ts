import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, Shield, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';

interface UserProfileProps {
  darkMode: boolean;
}

export function UserProfile({ darkMode }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '+63 912 345 6789',
    address: 'Manila, Philippines',
    joinDate: 'January 2024',
    accountType: 'Premium',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    // In a real app, this would clear auth tokens and redirect to login
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const updateProfile = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'border-orange-200'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder-avatar.jpg" alt={profile.name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-2xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h2 className={`text-2xl ${darkMode ? 'text-white' : ''}`}>{profile.name}</h2>
                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600">
                  {profile.accountType}
                </Badge>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Member since {profile.joinDate}
              </p>
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`${darkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'}`}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-orange-50'} p-3 rounded-lg`}>
                <div className="text-2xl text-orange-600">4</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Devices</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-orange-50'} p-3 rounded-lg`}>
                <div className="text-2xl text-orange-600">12</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alerts</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-orange-50'} p-3 rounded-lg`}>
                <div className="text-2xl text-orange-600">₱8k</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Bill</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'border-orange-200'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
            <User className="h-5 w-5 text-orange-500" />
            Personal Information
          </CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : ''}>
            Your account details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={darkMode ? 'text-gray-300' : ''}>
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                disabled={!isEditing}
                className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-orange-200'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={darkMode ? 'text-gray-300' : ''}>
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
                disabled={!isEditing}
                className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-orange-200'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className={darkMode ? 'text-gray-300' : ''}>
                <Phone className="h-4 w-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
                disabled={!isEditing}
                className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-orange-200'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className={darkMode ? 'text-gray-300' : ''}>
                <MapPin className="h-4 w-4 inline mr-2" />
                Address
              </Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => updateProfile('address', e.target.value)}
                disabled={!isEditing}
                className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-orange-200'}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'border-orange-200'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
            <Shield className="h-5 w-5 text-orange-500" />
            Account Security
          </CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : ''}>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`${darkMode ? 'text-white' : ''}`}>Password</div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>••••••••</p>
            </div>
            <Button variant="outline" className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
              Change Password
            </Button>
          </div>

          <Separator className={darkMode ? 'bg-gray-700' : ''} />

          <div className="flex items-center justify-between">
            <div>
              <div className={`${darkMode ? 'text-white' : ''}`}>Two-Factor Authentication</div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Add an extra layer of security</p>
            </div>
            <Button variant="outline" className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
              Enable
            </Button>
          </div>

          <Separator className={darkMode ? 'bg-gray-700' : ''} />

          <div className="flex items-center justify-between">
            <div>
              <div className={`${darkMode ? 'text-white' : ''}`}>Log Out</div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign out of your account</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <AlertDialogHeader>
                  <AlertDialogTitle className={darkMode ? 'text-white' : ''}>
                    Are you sure you want to log out?
                  </AlertDialogTitle>
                  <AlertDialogDescription className={darkMode ? 'text-gray-400' : ''}>
                    You will need to log in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : ''}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'border-orange-200'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
            <Calendar className="h-5 w-5 text-orange-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} rounded-lg`}>
            <div className={`text-sm ${darkMode ? 'text-white' : ''}`}>Socket 3 turned off</div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>2 hours ago</p>
          </div>
          <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} rounded-lg`}>
            <div className={`text-sm ${darkMode ? 'text-white' : ''}`}>Temperature alert resolved</div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>5 hours ago</p>
          </div>
          <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} rounded-lg`}>
            <div className={`text-sm ${darkMode ? 'text-white' : ''}`}>Monthly bill payment completed</div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Yesterday</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

