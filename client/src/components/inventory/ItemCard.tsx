import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item } from '@/types';
import { Package } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onClick: (item: Item) => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const tags = item.tags ? item.tags.split(',').map(t => t.trim()) : [];

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow card-gradient"
      onClick={() => onClick(item)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-6 h-6 text-primary" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              {item.quantity} {item.unit || 'items'}
            </p>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
