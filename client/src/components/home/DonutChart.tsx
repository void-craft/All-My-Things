// client/src/components/home/DonutChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"; // Removed LabelList as we use `label` prop
import { Room, Item } from "@/types";
import { useState, useEffect } from "react";
// IMPORTED: Centralized iconMap and IconName type
import { iconMap, IconName } from '@/lib/icons';

interface DonutChartProps {
  rooms: Room[];
  onRoomClick: (room: Room) => void;
}

interface RoomData {
  room: Room;
  itemCount: number;
}

// CustomLabel component to render the icon and item count on each slice
const CustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  room, // The room object is available here
  itemCount,
}: any) => {
  // Defensive check: if room or itemCount is not provided/valid, don't render.
  if (!room || typeof itemCount === 'undefined' || itemCount === null) {
    console.log("CustomLabel Debug: NOT rendering (missing room or itemCount)", { room, itemCount }); // Debug log
    return null;
  }

  const RADIAN = Math.PI / 180;
  // Adjusted radius to place label slightly further out for better icon visibility within the slice
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65; // Pushed slightly outward from middle

  // --- ADDED/CONFIRMED CONSOLE LOGS FOR DEBUGGING ---
  console.log("CustomLabel Debug: Rendering for room:", room.name, "Icon:", room.icon, "Items:", itemCount);
  console.log("CustomLabel Debug: Calculated position (x, y):", cx, cy, "Radius:", radius); // Log the position
  // --- END CONSOLE LOGS ---

  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Use the specific room icon from the CENTRALIZED iconMap, fallback to a generic Package
  // Ensure room.icon is a string and valid key (as per IconName type)
  const IconComponent = iconMap[room.icon as IconName] || iconMap.Package;

  return (
    <g>
      {/* Icon for the room */}
      <foreignObject x={x - 12} y={y - 12} width="24" height="24"> {/* Adjusted size for icon */}
        <div className="flex items-center justify-center w-full h-full">
          {/* --- TEMPORARILY CHANGED ICON COLOR TO RED FOR VISIBILITY DEBUG --- */}
          <IconComponent className="w-5 h-5 text-red-500 drop-shadow-lg" /> 
          {/* ------------------------------------------------------------------ */}
        </div>
      </foreignObject>
      {/* Item count */}
      <text
        x={x}
        y={y + 15}
        fill="white" // Keep text white
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fontWeight="bold"
        className="drop-shadow-lg"
      >
        {itemCount}
      </text>
    </g>
  );
};

export function DonutChart({ rooms, onRoomClick }: DonutChartProps) {
  const [roomData, setRoomData] = useState<RoomData[]>([]);

  useEffect(() => {
    fetchRoomData();
    // Dependency array includes 'rooms' so fetchRoomData runs when rooms prop changes
  }, [rooms]);

  const fetchRoomData = async () => {
    // If there are no rooms, or rooms array is empty, clear roomData and return.
    // This prevents unnecessary fetches and ensures `chartData` is empty,
    // which the Pie component will handle by not rendering labels.
    if (!rooms || rooms.length === 0) {
      setRoomData([]);
      return;
    }

    const dataPromises = rooms.map(async (room) => {
      try {
        const response = await fetch(`/api/rooms/${room.id}/items`);
        const items: Item[] = await response.json();
        return {
          room,
          itemCount: items.length,
        };
      } catch (error) {
        console.error(`Failed to fetch items for room ${room.id}:`, error);
        return {
          room,
          itemCount: 0, // Ensure a default itemCount even on error
        };
      }
    });

    const data = await Promise.all(dataPromises);
    setRoomData(data);
  };

  const chartData = roomData.map(({ room, itemCount }, index) => {
    // In-line array of cheerful colors
    const cheerfulColors = [
      "#FF6B6B", "#4ECDC4", "#4F86F7", "#FFC300", "#A34FDE", "#3DCC3D", "#FF9F1C", "#6A057F", "#FFD166",
    ];

    return {
      name: room.name,
      // Ensure value is at least 1 for small slices to be visible.
      value: Math.max(itemCount, 1), 
      color: cheerfulColors[index % cheerfulColors.length], // Use cheerful colors from the in-line array
      room: room, // Pass the room object for the CustomLabel
      itemCount: itemCount,
    };
  });

  const handleClick = (data: any) => {
    if (data && data.room) {
      onRoomClick(data.room);
    }
  };

  const totalItems = roomData.reduce(
    (sum, { itemCount }) => sum + itemCount,
    0,
  );

  return (
    <div className="relative w-full h-80">
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
            // Conditionally render the label prop only if chartData has items
            label={chartData.length > 0 ? ({ entry, ...props }) => {
              // Ensure entry.room and entry.itemCount exist before passing to CustomLabel
              if (entry && entry.room && typeof entry.itemCount !== 'undefined' && entry.itemCount !== null) {
                return (
                  <CustomLabel
                    {...props}
                    room={entry.room}
                    itemCount={entry.itemCount}
                  />
                );
              }
              return null; // Return null if `entry` or its necessary properties are not ready
            } : null} // If no chartData, return null for the entire label prop
            labelLine={false} // Hide the lines connecting labels to slices
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color} // Use the cheerful colors
                className="cursor-pointer hover:opacity-80 transition-all duration-300"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Icon and total item count in the center of the donut */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <div className="w-10 h-10 mx-auto flex items-center justify-center"> {/* Removed w-15 h-15, bg-gradient, rounded-full */}
          <iconMap.Package className="w-8 h-8 text-primary" /> {/* Changed to iconMap.Package, adjusted size/color */}
        </div>
        <p className="text-xl font-bold text-primary"> {/* Increased font size and bold for total items */}
          {totalItems}
        </p>
        <p className="text-sm text-muted-foreground">
          total items
        </p>
      </div>
    </div>
  );
}