import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/inventory/ItemCard';
import { Item, ItemGroup } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';

export function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ItemGroup | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (id) {
      fetchGroup();
      fetchItems();
    }
  }, [id]);

  const fetchGroup = async () => {
    try {
      const response = await fetch('/api/rooms');
      const rooms = await response.json();
      
      for (const room of rooms) {
        const groupsResponse = await fetch(`/api/rooms/${room.id}/groups`);
        const groups = await groupsResponse.json();
        const foundGroup = groups.find((g: ItemGroup) => g.id === parseInt(id!));
        
        if (foundGroup) {
          setGroup(foundGroup);
          break;
        }
      }
    } catch (error) {
      console.error('Failed to fetch group:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/items`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const handleItemClick = (item: Item) => {
    navigate(`/item/${item.id}`);
  };

  if (!group) {
    return (
      <div className="min-h-screen pb-20 gradient-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading group...</p>
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
            onClick={() => navigate(-1)}
            className="bg-card-gradient"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
        </div>

        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => navigate(`/group/${id}/item/new`)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No items in this group yet</p>
              <Button 
                onClick={() => navigate(`/group/${id}/item/new`)}
                variant="outline"
                className="bg-card-gradient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
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
  );
}
