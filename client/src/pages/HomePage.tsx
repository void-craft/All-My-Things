import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DonutChart } from '@/components/home/DonutChart';
import { RoomTooltip } from '@/components/home/RoomTooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Room } from '@/types';
import { Plus, Settings } from 'lucide-react';

export function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
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

  const handleRoomLongPress = (room: Room) => {
    setSelectedRoom(room);
    setShowTooltip(true);
  };

  const handleCloseTooltip = () => {
    setShowTooltip(false);
    setSelectedRoom(null);
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <Card className="card-gradient border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              All My Things
            </CardTitle>
            <p className="text-muted-foreground">
              Tap a room to explore your inventory
            </p>
          </CardHeader>
          <CardContent>
            <DonutChart
              rooms={rooms}
              onRoomClick={handleRoomClick}
              onRoomLongPress={handleRoomLongPress}
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button
            variant="outline"
            className="flex-1 bg-card-gradient"
            onClick={() => navigate('/room/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-card-gradient"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {selectedRoom && (
        <RoomTooltip
          room={selectedRoom}
          isVisible={showTooltip}
          onClose={handleCloseTooltip}
        />
      )}
    </div>
  );
}
