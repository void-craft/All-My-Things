import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Room } from '@/types';
import { Package } from 'lucide-react';

interface DonutChartProps {
  rooms: Room[];
  onRoomClick: (room: Room) => void;
  onRoomLongPress: (room: Room) => void;
}

export function DonutChart({ rooms, onRoomClick, onRoomLongPress }: DonutChartProps) {
  const chartData = rooms.map(room => ({
    name: room.name,
    value: 1,
    color: room.color,
    room: room
  }));

  const handleClick = (data: any) => {
    if (data && data.room) {
      onRoomClick(data.room);
    }
  };

  const handleRightClick = (e: React.MouseEvent, data: any) => {
    e.preventDefault();
    if (data && data.room) {
      onRoomLongPress(data.room);
    }
  };

  return (
    <div className="w-full h-96 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={140}
            paddingAngle={2}
            dataKey="value"
            onClick={handleClick}
            onContextMenu={handleRightClick}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card p-3 rounded-lg border shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-muted-foreground">Tap to enter room</p>
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
          <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">All My Things</p>
        </div>
      </div>
    </div>
  );
}
