import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User, Settings, Moon, Cloud, Download, Upload, LogOut } from 'lucide-react';

interface ProfilePageProps {
  user: any;
  onLogout: () => void;
}

export function ProfilePage({ user, onLogout }: ProfilePageProps) {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user?.name || 'User'}</h1>
            <p className="text-muted-foreground">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="card-gradient card-rounded">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                App Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <Label>Dark Theme</Label>
                </div>
                <Switch onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient card-rounded">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Data & Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-card-gradient btn-rounded">
                <Download className="w-4 h-4 mr-2" />
                Export Data (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start bg-card-gradient btn-rounded">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" className="w-full justify-start bg-card-gradient btn-rounded">
                <Cloud className="w-4 h-4 mr-2" />
                Sync with Cloud
              </Button>
            </CardContent>
          </Card>

          <Card className="card-gradient card-rounded">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={onLogout}
                variant="destructive" 
                className="w-full justify-start btn-rounded"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <Card className="card-gradient card-rounded">
            <CardHeader>
              <CardTitle>About All My Things</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Version 1.0.0
              </p>
              <p className="text-sm text-muted-foreground">
                Keep track of all your belongings with this intuitive inventory management app.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
