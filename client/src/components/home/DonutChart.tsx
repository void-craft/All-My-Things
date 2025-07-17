import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { Room, Item } from '@/types';
import { Package, ChefHat, Sofa, Bed, Droplets, Briefcase, Car, Hammer, Home } from 'lucide-react';
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
}

interface RoomData {
  room: Room;
  itemCount: number;
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, room, itemCount }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const IconComponent = iconMap[room.icon as keyof typeof iconMap] || Package;

  return (
    <g>
      <foreignObject x={x - 15} y={y - 15} width="30" height="30">
        <div className="flex items-center justify-center w-full h-full">
          <IconComponent className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
      </foreignObject>
      <text x={x} y={y + 25} fill="white" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" className="drop-shadow-lg">
        {itemCount}
      </text>
    </g>
  );
};

export function DonutChart({ rooms, onRoomClick }: DonutChartProps) {
  const [roomData, setRoomData] = useState<RoomData[]>([]);

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
    value: Math.max(itemCount, 1),
    color: room.color,
    room: room,
    itemCount: itemCount
  }));

  const handleClick = (data: any) => {
    if (data && data.room) {
      onRoomClick(data.room);
    }
  };

  const totalItems = roomData.reduce((sum, { itemCount }) => sum + itemCount, 0);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            onClick={handleClick}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="cursor-pointer hover:opacity-80 transition-all duration-300"
              />
            ))}
            <LabelList
              content={({ cx, cy, midAngle, innerRadius, outerRadius, ...props }) => (
                <CustomLabel
                  cx={cx}
                  cy={cy}
                  midAngle={midAngle}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  room={chartData[props.index]?.room}
                  itemCount={chartData[props.index]?.itemCount}
                />
              )}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="text-center mt-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center">
          <Package className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-primary mb-1">All My Things</h3>
        <p className="text-sm text-muted-foreground">{totalItems} total items</p>
      </div>
    </div>
  );
}
