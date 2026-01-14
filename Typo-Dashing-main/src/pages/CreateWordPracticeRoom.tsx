import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateText } from "@/lib/textGenerator";

const CreateWordPracticeRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [wordCount, setWordCount] = useState(30);
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const roomCode = generateRoomCode();
      const text = generateText({ 
        difficulty: "easy", 
        wordCount,
        includePunctuation: false,
        includeNumbers: false
      });
      const words = text.split(" ");

      const { data: room, error: roomError } = await supabase
        .from("word_practice_rooms")
        .insert({
          code: roomCode,
          max_players: maxPlayers,
          word_count: wordCount,
          status: "waiting",
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { error: playerError } = await supabase
        .from("word_practice_players")
        .insert({
          room_id: room.id,
          player_name: playerName,
        });

      if (playerError) throw playerError;

      sessionStorage.setItem(`wp_player_name_${room.id}`, playerName);
      sessionStorage.setItem(`wp_words_${room.id}`, JSON.stringify(words));

      navigate(`/word-practice/room/${room.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ThemeToggle />
      <Card className="p-8 max-w-lg w-full space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/game-modes")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Create Word Practice Room</h2>
          </div>
          <p className="text-muted-foreground">
            Race with friends word by word!
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPlayers">Max Players (2-5)</Label>
            <Input
              id="maxPlayers"
              type="number"
              min={2}
              max={5}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Math.min(5, Math.max(2, parseInt(e.target.value) || 2)))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wordCount">Number of Words</Label>
            <Input
              id="wordCount"
              type="number"
              min={10}
              max={100}
              value={wordCount}
              onChange={(e) => setWordCount(Math.min(100, Math.max(10, parseInt(e.target.value) || 30)))}
            />
          </div>

          <Button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? "Creating..." : "Create Room"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateWordPracticeRoom;
