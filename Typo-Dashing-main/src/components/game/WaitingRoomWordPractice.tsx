import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Play, Users, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface WaitingRoomWordPracticeProps {
  room: {
    id: string;
    code: string;
    max_players: number;
    word_count: number;
    status: string;
  };
  players: Array<{
    id: string;
    player_name: string;
    created_at: string;
  }>;
}

const WaitingRoomWordPractice = ({ room, players }: WaitingRoomWordPracticeProps) => {
  const { toast } = useToast();
  const currentPlayerName = sessionStorage.getItem(`wp_player_name_${room.id}`);
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

    if (players.length < 2) {
      toast({
        title: "Need More Players",
        description: "At least 2 players needed to start",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("word_practice_rooms")
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

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    if (!isCreator) {
      toast({
        title: "Not Allowed",
        description: "Only the room creator can remove players",
        variant: "destructive",
      });
      return;
    }

    if (playerName === currentPlayerName) {
      toast({
        title: "Cannot Remove Self",
        description: "You cannot remove yourself from the room",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("word_practice_players")
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
        description: `${playerName} has been removed`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ThemeToggle />
      <div className="w-full max-w-3xl space-y-6">
        <Card className="p-8 bg-card border-2 border-border">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">Waiting Room</h2>
              <div className="flex items-center justify-center gap-4">
                <div className="text-xl text-muted-foreground">Room Code:</div>
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
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Players ({players.length}/{room.max_players})
                </h3>
              </div>
              <div className="grid gap-3">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className="p-4 bg-muted rounded-lg border-2 border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold">
                        {index + 1}
                      </div>
                      <div className="text-xl font-semibold">{player.player_name}</div>
                    </div>
                    {isCreator && index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePlayer(player.id, player.player_name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ))}
                {[...Array(Math.max(0, room.max_players - players.length))].map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center gap-4 opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                      {players.length + i + 1}
                    </div>
                    <div className="text-xl text-muted-foreground">Waiting...</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-1">Game Settings</div>
                <div className="flex gap-6 text-lg">
                  <div>
                    <span className="text-muted-foreground">Words:</span>{" "}
                    <span className="font-bold">{room.word_count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Players:</span>{" "}
                    <span className="font-bold">{room.max_players}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartGame}
                disabled={!isCreator || players.length < 2}
                className="w-full h-16 text-xl font-semibold"
                size="lg"
              >
                <Play className="mr-2 h-6 w-6" />
                {isCreator ? "Start Game" : "Only Creator Can Start"}
              </Button>
              {players.length < 2 && (
                <p className="text-center text-sm text-muted-foreground">
                  Need at least 2 players to start
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WaitingRoomWordPractice;
