import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2, Check } from 'lucide-react';
import { roomIcons, roomColors } from '@/lib/roomOptions';
import { Room } from '@/types';

export function RoomEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/rooms`);
        if (!response.ok) throw new Error('Failed to fetch rooms list');
        const allRooms: Room[] = await response.json();
        const room = allRooms.find(r => r.id === parseInt(id));
        if (room) {
          setName(room.name);
          setSelectedIcon(room.icon);
          setSelectedColor(room.color);
        } else {
          throw new Error('Room not found');
        }
      } catch (error) {
        console.error('Failed to fetch room details:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/room/${id}`);
        }, 1500);
      } else {
        console.error('Failed to update room');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this room and all its items? This action cannot be undone.')) {
      setLoading(true);
      try {
        const response = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
        if (response.ok) {
          navigate('/');
        } else {
          console.error('Failed to delete room');
        }
      } catch (error) {
        console.error('Error deleting room:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !name) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-20">
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white/90 rounded-full p-5 animate-in zoom-in-75">
              <Check className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-xl font-bold text-white">Edit Saved!</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full shadow-lg bg-black/20 text-white border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Edit Room</h1>
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-full shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200">Room Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Master Bedroom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/20 border-white/20 text-white placeholder:text-slate-400 focus:border-white/50 input-rounded"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-slate-200">Choose Icon</Label>
            <div className="mx-auto max-w-sm">
              <div className="grid grid-cols-6 gap-3">
                {roomIcons.map(({ name: iconName, component: Icon, title }) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-2 rounded-xl border-2 transition-all flex items-center justify-center aspect-square ${
                      selectedIcon === iconName
                        ? 'border-white bg-white/20 scale-110'
                        : 'border-white/20 bg-black/20 hover:bg-white/10 hover:scale-105'
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
            <Label className="text-slate-200">Choose Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {roomColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    selectedColor === color
                      ? 'border-white scale-110'
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
            disabled={loading || showSuccess}
            className="w-full btn-rounded button-gradient text-white font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}