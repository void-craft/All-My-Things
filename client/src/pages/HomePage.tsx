import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DonutChart } from "@/components/home/DonutChart";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";
import { Plus, Settings } from "lucide-react";

export function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
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
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            All My Things
          </h1>
          <p className="text-muted-foreground font-medium">
            Tap a room to explore your inventory
          </p>
        </div>

        <DonutChart rooms={rooms} onRoomClick={handleRoomClick} />

        <div className="mt-8 flex gap-4 px-4 pt-[100px] pb-[0px]">
          <Button
            onClick={() => navigate("/room/new")}
            className="flex-1 btn-rounded button-gradient text-white font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Room
          </Button>
          <Button
            onClick={() => navigate("/profile")}
            className="flex-1 btn-rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold"
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
