import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RoomGrid } from "@/components/home/RoomGrid";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";
import { Plus } from "lucide-react";

export function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const handleRoomClick = (room: Room) => {
    navigate(`/room/${room.id}`);
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            All My Things
          </h1>
        </div>

        <RoomGrid rooms={rooms} onRoomClick={handleRoomClick} />
      </div>

      <div className="fixed bottom-32 right-10 z-50">
        <Button
          onClick={() => navigate("/room/new")}
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg button-gradient text-white transition-transform hover:scale-105"
          aria-label="Add New Room"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}