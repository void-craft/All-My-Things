import { useState, useEffect } from "react";
import { Room, Item } from "@/types";
import { iconMap, IconName } from '@/lib/icons';

interface RoomGridProps {
  rooms: Room[];
  onRoomClick: (room: Room) => void;
}

interface RoomData {
  room: Room;
  itemCount: number;
}

export function RoomGrid({ rooms, onRoomClick }: RoomGridProps) {
  const [roomData, setRoomData] = useState<RoomData[]>([]);

  useEffect(() => {
    // This logic to fetch item counts for each room is reused
    const fetchRoomData = async () => {
      if (!rooms || rooms.length === 0) {
        setRoomData([]);
        return;
      }

      const dataPromises = rooms.map(async (room) => {
        try {
          const response = await fetch(`/api/rooms/${room.id}/items`);
          const items: Item[] = await response.json();
          return { room, itemCount: items.length };
        } catch (error) {
          console.error(`Failed to fetch items for room ${room.id}:`, error);
          return { room, itemCount: 0 };
        }
      });

      const data = await Promise.all(dataPromises);
      setRoomData(data);
    };

    fetchRoomData();
  }, [rooms]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {roomData.map(({ room, itemCount }) => {
        // Look up the icon component, with a fallback
        const IconComponent = iconMap[room.icon as IconName] || iconMap.Package;

        return (
          <button
            key={room.id}
            onClick={() => onRoomClick(room)}
            className="p-4 rounded-2xl text-white shadow-lg transition-transform duration-200 hover:scale-105 flex flex-col justify-between min-h-[120px]"
            style={{ backgroundColor: room.color }}
          >
            {/* Top section with Icon */}
            <div>
              <IconComponent className="h-7 w-7 opacity-90" />
            </div>

            {/* Bottom section with Name and Item Count */}
            <div className="text-left">
              <h3 className="font-bold text-lg">{room.name}</h3>
              <p className="text-sm opacity-90">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}