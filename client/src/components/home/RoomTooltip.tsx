// RoomTooltip.tsx
import { Room } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface RoomTooltipProps {
  room: Room;
  isVisible: boolean;
  onClose: () => void;
}

export function RoomTooltip({ room, isVisible, onClose }: RoomTooltipProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="mx-4 max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: room.color }}
            />
            <div>
              <h3 className="font-medium">{room.name}</h3>
              <p className="text-sm text-muted-foreground">Long press to show room name</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
