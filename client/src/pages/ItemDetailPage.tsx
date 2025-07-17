import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Item } from '@/types';
import { ArrowLeft, Edit, Trash2, Package, ShoppingCart, Store } from 'lucide-react';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      // Since we don't have a direct item endpoint, we'll search for it
      const response = await fetch(`/api/search?q=${id}`);
      const items = await response.json();
      const foundItem = items.find((i: Item) => i.id === parseInt(id!));
      setItem(foundItem);
    } catch (error) {
      console.error('Failed to fetch item:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`/api/items/${id}`, { method: 'DELETE' });
        navigate(-1);
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const handleAddToShoppingList = async () => {
    // For now, just show an alert. In a real app, this would show a store selection dialog
    alert('Feature coming soon! This will add the item to a shopping list.');
  };

  const handleAddToStore = async () => {
    // For now, just show an alert. In a real app, this would show a store selection dialog
    alert('Feature coming soon! This will associate the item with a store.');
  };

  if (!item) {
    return (
      <div className="min-h-screen pb-20 gradient-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  const tags = item.tags ? item.tags.split(',').map(t => t.trim()) : [];

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="bg-card-gradient rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Item Details</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/item/${id}/edit`)}
              className="bg-card-gradient rounded-full"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              className="bg-card-gradient rounded-full text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="card-gradient card-rounded shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{item.name}</h2>
                <p className="text-muted-foreground">
                  {item.quantity} {item.unit || 'items'}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {item.room_name && (
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-muted-foreground">
                  {item.room_name}
                  {item.group_name && ` → ${item.group_name}`}
                </p>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleAddToShoppingList}
                className="flex-1 btn-rounded bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Shopping List
              </Button>
              <Button
                onClick={handleAddToStore}
                className="flex-1 btn-rounded bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                <Store className="w-4 h-4 mr-2" />
                Add to Store
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
