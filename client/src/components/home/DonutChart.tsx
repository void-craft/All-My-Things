import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Room, Item } from '@/types';
import { Package, Home, ChefHat, Sofa, Bed, Droplets, Briefcase, Car, Hammer } from 'lucide-react';
import { useState, useEffect } from 'react';

const iconMap = {
  ChefHat,
  Sofa,
  Bed,
  Droplets,
  Briefcase,
  Car,
  Hammer,
  Package,
  Home,
};

interface DonutChartProps {
  rooms: Room[];
  onRoomClick: (room: Room) => void;
  onRoomSelect: (room: Room, itemCount: number) => void;
  selectedRoom?: Room | null;
}

interface RoomData {
  room: Room;
  itemCount: number;
}

export function DonutChart({ rooms, onRoomClick, onRoomSelect, selectedRoom }: DonutChartProps) {
  const [roomData, setRoomData] = useState<RoomData[]>([]);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchRoomData();
  }, [rooms]);

  const fetchRoomData = async () => {
    const dataPromises = rooms.map(async (room) => {
      try {
        const response = await fetch(`/api/rooms/${room.id}/items`);
        const items: Item[] = await response.json();
        return {
          room,
          itemCount: items.length
        };
      } catch (error) {
        console.error(`Failed to fetch items for room ${room.id}:`, error);
        return {
          room,
          itemCount: 0
        };
      }
    });

    const data = await Promise.all(dataPromises);
    setRoomData(data);
  };

  const chartData = roomData.map(({ room, itemCount }) => ({
    name: room.name,
    value: Math.max(itemCount, 1), // Ensure minimum value for visibility
    color: room.color,
    room: room,
    itemCount: itemCount
  }));

  const handleClick = (data: any) => {
    if (data && data.room) {
      onRoomClick(data.room);
    }
  };

  const handleMouseDown = (data: any) => {
    if (data && data.room) {
      const timer = setTimeout(() => {
        onRoomSelect(data.room, data.itemCount);
      }, 500);
      setTouchTimer(timer);
    }
  };

  const handleMouseUp = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const totalItems = roomData.reduce((sum, { itemCount }) => sum + itemCount, 0);

  return (
    <div className="w-full h-96 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={160}
            paddingAngle={3}
            dataKey="value"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {chartData.map((entry, index) => {
              const IconComponent = iconMap[entry.room.icon as keyof typeof iconMap] || Package;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="cursor-pointer hover:opacity-80 transition-all duration-300"
                  stroke={selectedRoom?.id === entry.room.id ? '#ffffff' : 'transparent'}
                  strokeWidth={selectedRoom?.id === entry.room.id ? 4 : 0}
                />
              );
            })}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                const IconComponent = iconMap[data.room.icon as keyof typeof iconMap] || Package;
                return (
                  <div className="bg-card p-4 rounded-2xl border shadow-lg card-gradient">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <p className="font-semibold">{data.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{data.itemCount} items</p>
                    <p className="text-xs text-muted-foreground mt-1">Tap to enter • Hold to select</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          {selectedRoom ? (
            <>
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center card-gradient shadow-lg">
                {(() => {
                  const IconComponent = iconMap[selectedRoom.icon as keyof typeof iconMap] || Package;
                  return <IconComponent className="w-8 h-8 text-primary" />;
                })()}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{selectedRoom.name}</h3>
              <p className="text-sm text-muted-foreground">
                {roomData.find(r => r.room.id === selectedRoom.id)?.itemCount || 0} items
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center card-gradient shadow-lg">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-1">All My Things</h3>
              <p className="text-sm text-muted-foreground">{totalItems} total items</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
