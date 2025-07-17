import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ItemCard } from '@/components/inventory/ItemCard';
import { Item } from '@/types';
import { Search } from 'lucide-react';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchItems(query);
      } else {
        setItems([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchItems = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to search items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: Item) => {
    navigate(`/item/${item.id}`);
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Search Items</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-card-gradient"
            />
          </div>
        </div>

        {loading && (
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Searching...</p>
            </CardContent>
          </Card>
        )}

        {!loading && query && items.length === 0 && (
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No items found for "{query}"</p>
            </CardContent>
          </Card>
        )}

        {!loading && !query && (
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Start typing to search your items</p>
            </CardContent>
          </Card>
        )}

        {items.length > 0 && (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="space-y-2">
                <ItemCard item={item} onClick={handleItemClick} />
                <div className="text-xs text-muted-foreground text-right">
                  {item.room_name} • {item.group_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
