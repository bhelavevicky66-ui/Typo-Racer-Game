import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WaitingRoom from "@/components/game/WaitingRoom";
import ActiveGame from "@/components/game/ActiveGame";
import Results from "@/components/game/Results";

export type RoomStatus = "waiting" | "playing" | "finished";

export interface Room {
  id: string;
  code: string;
  max_players: number;
  timer_duration: number;
  text_to_type: string;
  status: RoomStatus;
  started_at: string | null;
  ended_at: string | null;
  text_difficulty: string | null;
  include_punctuation: boolean | null;
  include_numbers: boolean | null;
}

export interface Player {
  id: string;
  room_id: string;
  player_name: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished_at: string | null;
}

const GameRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoomData = useCallback(async () => {
    if (!roomId) return;

    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !roomData) {
      toast({
        title: "Error",
        description: "Room not found",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setRoom(roomData as Room);

    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (!playersError && playersData) {
      setPlayers(playersData as Player[]);
    }

    setLoading(false);
  }, [roomId, navigate, toast]);

  useEffect(() => {
    fetchRoomData();

    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new as Room);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchRoomData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, fetchRoomData]);

  if (loading || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {room.status === "waiting" && (
        <WaitingRoom room={room} players={players} />
      )}
      {room.status === "playing" && (
        <ActiveGame room={room} players={players} />
      )}
      {room.status === "finished" && (
        <Results room={room} players={players} />
      )}
    </>
  );
};

export default GameRoom;
