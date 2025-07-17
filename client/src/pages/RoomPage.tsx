// RoomPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Room, ItemGroup, Item } from '@/types';
import { ArrowLeft, Plus, Edit, Trash2, Package } from 'lucide-react';
import { iconMap, IconName } from '@/lib/icons';
import { ItemCard } from '@/components/inventory/ItemCard';


export function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [groups, setGroups] = useState<ItemGroup[]>([]);
  const [roomItems, setRoomItems] = useState<Item[]>([]);

  useEffect(() => {
    if (id) {
      fetchRoom();
      fetchGroups();
      fetchRoomItems();
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

  const fetchRoomItems = async () => {
    try {
      const response = await fetch(`/api/rooms/${id}/items`);
      const data = await response.json();
      setRoomItems(data);
    } catch (error) {
      console.error('Failed to fetch room items:', error);
    }
  };

  const handleGroupClick = (group: ItemGroup) => {
    navigate(`/group/${group.id}`);
  };

  const handleItemClick = (item: Item) => {
    navigate(`/item/${item.id}`);
  };

  const handleDeleteRoom = async () => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
        navigate('/');
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
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

  const RoomIconComponent = iconMap[room.icon as IconName] || iconMap.Home;
  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              className="bg-card-gradient rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              {/* --- Display Room Icon in header --- */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: room.color }}
              >
                <RoomIconComponent className="w-5 h-5 text-white" /> {/* Display the room's icon */}
              </div>
              {/* ------------------------------------ */}
              <h1 className="text-2xl font-bold text-foreground">{room.name}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/room/${id}/edit`)}
              className="bg-card-gradient rounded-full"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDeleteRoom}
              className="bg-card-gradient rounded-full text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Groups</h2>
          <div className="grid grid-cols-2 gap-4">
            {groups.map((group) => {
              // --- Use the centralized iconMap for Group icons ---
              const GroupIconComponent = iconMap[group.icon as IconName] || iconMap.Package;
              // -------------------------------------------------

              return (
                <Card
                  key={group.id}
                  className="cursor-pointer hover:shadow-md transition-shadow card-gradient card-rounded"
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
                          <GroupIconComponent className="w-6 h-6 text-primary" /> 
                        )}
                      </div>
                      <h3 className="font-medium text-foreground">{group.name}</h3>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow card-gradient card-rounded border-dashed"
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

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Items in Room</h2>
            <Button
              onClick={() => navigate(`/room/${id}/item/new`)}
              className="btn-rounded button-gradient text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {roomItems.length === 0 ? (
            <Card className="card-gradient card-rounded">
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No items in this room yet</p>
                <Button
                  onClick={() => navigate(`/room/${id}/item/new`)}
                  variant="outline"
                  className="bg-card-gradient btn-rounded"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {roomItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}