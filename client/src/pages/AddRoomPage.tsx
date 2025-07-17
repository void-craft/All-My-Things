import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, ChefHat, Sofa, Bed, Droplets, Briefcase, Car, Hammer, Home } from 'lucide-react';

const roomIcons = [
  { icon: ChefHat, name: 'ChefHat', label: 'Kitchen' },
  { icon: Sofa, name: 'Sofa', label: 'Living Room' },
  { icon: Bed, name: 'Bed', label: 'Bedroom' },
  { icon: Droplets, name: 'Droplets', label: 'Bathroom' },
  { icon: Briefcase, name: 'Briefcase', label: 'Office' },
  { icon: Car, name: 'Car', label: 'Garage' },
  { icon: Hammer, name: 'Hammer', label: 'Workshop' },
  { icon: Home, name: 'Home', label: 'General' },
];

const roomColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#82E0AA', '#F8C471', '#EC7063', '#5DADE2', '#58D68D', '#F4D03F'
];

export function AddRoomPage() {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ChefHat');
  const [selectedColor, setSelectedColor] = useState(roomColors[0]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor
        })
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.error('Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Add New Room</h1>
        </div>

        <Card className="card-gradient card-rounded shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">Create Your Room</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter room name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-rounded"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Choose Icon</Label>
                <div className="grid grid-cols-4 gap-3">
                  {roomIcons.map(({ icon: Icon, name: iconName, label }) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        selectedIcon === iconName
                          ? 'border-primary bg-primary/20 scale-105'
                          : 'border-border hover:border-primary/50 hover:scale-105'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Choose Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {roomColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        selectedColor === color
                          ? 'border-foreground scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full btn-rounded button-gradient text-white font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Room'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
