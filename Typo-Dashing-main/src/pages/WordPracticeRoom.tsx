import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import WaitingRoomWordPractice from "@/components/game/WaitingRoomWordPractice";
import ActiveWordPracticeGame from "@/components/game/ActiveWordPracticeGame";
import WordPracticeResults from "@/components/game/WordPracticeResults";

interface WordPracticeRoom {
  id: string;
  code: string;
  max_players: number;
  word_count: number;
  status: string;
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

interface WordPracticePlayer {
  id: string;
  room_id: string;
  player_name: string;
  current_word_index: number;
  correct: number;
  incorrect: number;
  finished_at: string | null;
  created_at: string;
}

const WordPracticeRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<WordPracticeRoom | null>(null);
  const [players, setPlayers] = useState<WordPracticePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchData = async () => {
      const { data: roomData, error: roomError } = await supabase
        .from("word_practice_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomError || !roomData) {
        navigate("/game-modes");
        return;
      }

      const { data: playersData } = await supabase
        .from("word_practice_players")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      setRoom(roomData);
      setPlayers(playersData || []);
      setLoading(false);
    };

    fetchData();

    const roomChannel = supabase
      .channel(`word_practice_room_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "word_practice_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new as WordPracticeRoom);
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`word_practice_players_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "word_practice_players",
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          const { data } = await supabase
            .from("word_practice_players")
            .select("*")
            .eq("room_id", roomId)
            .order("created_at", { ascending: true });
          setPlayers(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [roomId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-lg">Loading room...</p>
        </Card>
      </div>
    );
  }

  if (!room) return null;

  if (room.status === "waiting") {
    return <WaitingRoomWordPractice room={room} players={players} />;
  }

  if (room.status === "playing") {
    return <ActiveWordPracticeGame room={room} players={players} />;
  }

  if (room.status === "finished") {
    return <WordPracticeResults room={room} players={players} />;
  }

  return null;
};

export default WordPracticeRoom;
