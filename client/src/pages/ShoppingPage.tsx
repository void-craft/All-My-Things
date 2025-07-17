import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingList } from '@/types';
import { Plus, ShoppingCart } from 'lucide-react';

export function ShoppingPage() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const fetchShoppingLists = async () => {
    try {
      const response = await fetch('/api/shopping-lists');
      const data = await response.json();
      setShoppingLists(data);
    } catch (error) {
      console.error('Failed to fetch shopping lists:', error);
    }
  };

  const handleListClick = (list: ShoppingList) => {
    navigate(`/shopping/${list.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Shopping Lists</h1>
          <Button 
            onClick={() => navigate('/shopping/new')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New List
          </Button>
        </div>

        {shoppingLists.length === 0 ? (
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No shopping lists yet</p>
              <Button 
                onClick={() => navigate('/shopping/new')}
                variant="outline"
                className="bg-card-gradient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {shoppingLists.map((list) => (
              <Card
                key={list.id}
                className="cursor-pointer hover:shadow-md transition-shadow card-gradient"
                onClick={() => handleListClick(list)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    {list.store_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDate(list.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
