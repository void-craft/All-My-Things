import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Room, ItemGroup } from '@/types';
import { ArrowLeft, Plus, Archive, Refrigerator, Snowflake, Package, BookOpen, Package2, Shirt, Pill } from 'lucide-react';

const iconMap = {
  Archive,
  Refrigerator,
  Snowflake,
  Package,
  BookOpen,
  Package2,
  Shirt,
  Pill,
};

export function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [groups, setGroups] = useState<ItemGroup[]>([]);

  useEffect(() => {
    if (id) {
      fetchRoom();
      fetchGroups();
    }
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await fetch('/api/rooms');
      const rooms = await response.json();
      const foundRoom = rooms.find((r: Room) => r.id === parseInt(id!));
      setRoom(foundRoom);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`/api/rooms/${id}/groups`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleGroupClick = (group: ItemGroup) => {
    navigate(`/group/${group.id}`);
  };

  if (!room) {
    return (
      <div className="min-h-screen pb-20 gradient-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="bg-card-gradient"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: room.color }}
            />
            <h1 className="text-2xl font-bold text-foreground">{room.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {groups.map((group) => {
            const IconComponent = iconMap[group.icon as keyof typeof iconMap] || Package;
            
            return (
              <Card
                key={group.id}
                className="cursor-pointer hover:shadow-md transition-shadow card-gradient"
                onClick={() => handleGroupClick(group)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      {group.image_url ? (
                        <img 
                          src={group.image_url} 
                          alt={group.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <IconComponent className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <h3 className="font-medium text-foreground">{group.name}</h3>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow card-gradient border-dashed"
            onClick={() => navigate(`/room/${id}/group/new`)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-muted-foreground">Add Group</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
