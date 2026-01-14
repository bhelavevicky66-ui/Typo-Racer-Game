import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import Layout from "@/components/Layout";

const JoinRoom = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRoom = async () => {
      if (!code) return;

      const { data, error } = await supabase
        .from("rooms")
        .select("id, status, max_players")
        .eq("code", code)
        .single();

      if (error || !data) {
        setRoomExists(false);
        toast({
          title: "Room Not Found",
          description: "This room doesn't exist or has expired.",
          variant: "destructive",
        });
        return;
      }

      if (data.status !== "waiting") {
        toast({
          title: "Game In Progress",
          description: "This game has already started.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const { count } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", data.id);

      if (count && count >= data.max_players) {
        toast({
          title: "Room Full",
          description: "This room is already full.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setRoomExists(true);
    };

    checkRoom();
  }, [code, navigate, toast]);

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !code) return;

    setLoading(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("id")
        .eq("code", code)
        .single();

      if (roomError || !room) throw new Error("Room not found");

      const { error: playerError } = await supabase
        .from("players")
        .insert({
          room_id: room.id,
          player_name: playerName.trim(),
        });

      if (playerError) throw playerError;

      sessionStorage.setItem(`player_name_${room.id}`, playerName.trim());
      navigate(`/room/${room.id}`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast({
        title: "Error",
        description: "Failed to join room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (roomExists === false) {
    return (
      <Layout>
        <div className="flex items-center justify-center p-4 min-h-screen">
          <Card className="p-8 bg-card border-2 border-destructive">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-destructive">Room Not Found</h2>
              <p className="text-muted-foreground">
                This room doesn't exist or has expired.
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-border">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-6 h-6 text-primary" />
                  <h2 className="text-3xl font-bold text-foreground">Join Game</h2>
                </div>
                <p className="text-muted-foreground">
                  Room Code: <span className="font-mono font-bold text-foreground">{code}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName" className="text-base">
                    Your Name
                  </Label>
                  <Input
                    id="playerName"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                    className="h-12 text-lg bg-muted border-2"
                    maxLength={50}
                  />
                </div>
              </div>

              <Button
                onClick={handleJoinRoom}
                disabled={loading || !playerName.trim()}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-accent to-destructive hover:opacity-90"
                size="lg"
              >
                {loading ? "Joining..." : "Join Room"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default JoinRoom;
