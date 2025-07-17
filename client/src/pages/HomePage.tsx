import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DonutChart } from '@/components/home/DonutChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Room } from '@/types';
import { Plus, Settings, Sparkles } from 'lucide-react';

export function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handleRoomClick = (room: Room) => {
    navigate(`/room/${room.id}`);
  };

  const handleRoomSelect = (room: Room, itemCount: number) => {
    setSelectedRoom(room);
    // Clear selection after 3 seconds
    setTimeout(() => setSelectedRoom(null), 3000);
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <Card className="card-gradient border-0 shadow-2xl card-rounded">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              All My Things
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </CardTitle>
            <p className="text-muted-foreground font-medium">
              Tap to explore • Hold to select
            </p>
          </CardHeader>
          <CardContent>
            <DonutChart
              rooms={rooms}
              onRoomClick={handleRoomClick}
              onRoomSelect={handleRoomSelect}
              selectedRoom={selectedRoom}
            />
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => navigate('/room/new')}
            className="flex-1 btn-rounded button-gradient text-white font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Room
          </Button>
          <Button
            onClick={() => navigate('/profile')}
            className="flex-1 btn-rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold"
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
