import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User, Settings, Moon, Sun, Cloud, Download, Upload } from 'lucide-react';

export function ProfilePage() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="card-gradient">
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

          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Data & Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-card-gradient">
                <Download className="w-4 h-4 mr-2" />
                Export Data (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start bg-card-gradient">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" className="w-full justify-start bg-card-gradient">
                <Cloud className="w-4 h-4 mr-2" />
                Sync with Cloud
              </Button>
            </CardContent>
          </Card>

          <Card className="card-gradient">
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
