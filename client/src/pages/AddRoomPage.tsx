import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { roomIcons, roomColors } from '@/lib/roomOptions';

export function AddRoomPage() {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(roomIcons[0].name);
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
            onClick={() => navigate(-1)}
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
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Master Bedroom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-rounded"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Choose Icon</Label>
                <div className="mx-auto max-w-sm">
                  <div className="grid grid-cols-6 gap-3">
                    {roomIcons.map(({ name: iconName, component: Icon, title }) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        className={`p-2 rounded-xl border-2 transition-all flex items-center justify-center aspect-square ${
                          selectedIcon === iconName
                            ? 'border-primary bg-primary/20 scale-110'
                            : 'border-border hover:border-primary/50 hover:scale-105'
                        }`}
                        title={title}
                      >
                        <Icon className="w-6 h-6 text-primary" />
                      </button>
                    ))}
                  </div>
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
                      aria-label={`Select color ${color}`}
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

export default AddRoomPage;