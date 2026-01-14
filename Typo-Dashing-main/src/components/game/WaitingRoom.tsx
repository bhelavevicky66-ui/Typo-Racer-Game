import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Play, Users, X } from "lucide-react";
import type { Room, Player } from "@/pages/GameRoom";
import Layout from "@/components/Layout";

interface WaitingRoomProps {
  room: Room;
  players: Player[];
}

const WaitingRoom = ({ room, players }: WaitingRoomProps) => {
  const { toast } = useToast();
  const currentPlayerName = sessionStorage.getItem(`player_name_${room.id}`);
  const isCreator = players[0]?.player_name === currentPlayerName;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    });
  };

  const handleStartGame = async () => {
    if (!isCreator) {
      toast({
        title: "Not Allowed",
        description: "Only the room creator can start the game",
        variant: "destructive",
      });
      return;
    }

    if (players.length < room.max_players) {
      toast({
        title: "Waiting for Players",
        description: `Need ${room.max_players} players to start (${players.length}/${room.max_players})`,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("rooms")
      .update({
        status: "playing",
        started_at: new Date().toISOString(),
      })
      .eq("id", room.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to start game",
        variant: "destructive",
      });
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!isCreator) {
      toast({
        title: "Not Allowed",
        description: "Only the room creator can remove players",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove player",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Player Removed",
        description: "Player has been removed from the room",
      });
    }
  };

  return (

    <Layout>
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-3xl space-y-6">
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-border">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-foreground">Waiting Room</h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-xl text-muted-foreground">
                    Room Code:
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-3xl font-mono font-bold text-primary bg-muted px-6 py-3 rounded-lg">
                      {room.code}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyCode}
                      className="h-12 w-12"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Players ({players.length}/{room.max_players})
                  </h3>
                </div>
                <div className="grid gap-3">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className="p-4 bg-muted rounded-lg border-2 border-border flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold">
                          {index + 1}
                        </div>
                        <div className="text-xl font-semibold text-foreground">
                          {player.player_name}
                        </div>
                      </div>
                      {isCreator && index > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePlayer(player.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {[...Array(room.max_players - players.length)].map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center gap-4 opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                        {players.length + i + 1}
                      </div>
                      <div className="text-xl text-muted-foreground">
                        Waiting for player...
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Game Settings</div>
                  <div className="flex gap-6 text-lg">
                    <div>
                      <span className="text-muted-foreground">Timer:</span>{" "}
                      <span className="font-bold text-foreground">{room.timer_duration}s</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Players:</span>{" "}
                      <span className="font-bold text-foreground">{room.max_players}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleStartGame}
                  disabled={!isCreator || players.length < room.max_players}
                  className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50"
                  size="lg"
                >
                  <Play className="mr-2 h-6 w-6" />
                  {isCreator ? "Start Game" : "Only Creator Can Start"}
                </Button>
                {players.length < room.max_players && (
                  <p className="text-center text-sm text-muted-foreground">
                    Waiting for {room.max_players - players.length} more player(s) to join ({players.length}/{room.max_players})
                  </p>
                )}
                {!isCreator && (
                  <p className="text-center text-sm text-muted-foreground">
                    {players[0]?.player_name} is the room creator
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default WaitingRoom;
