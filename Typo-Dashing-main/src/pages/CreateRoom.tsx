import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings } from "lucide-react";
import Layout from "@/components/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import { generateText } from "@/lib/textGenerator";

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog near the riverbank under the bright moonlight.",
  "Programming is the art of telling another human what one wants the computer to do in a precise way.",
  "Success is not final, failure is not fatal, it is the courage to continue that counts in life.",
  "Technology empowers people to achieve more than they ever thought possible in their wildest dreams.",
];

const CreateRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isSinglePlayer = searchParams.get("mode") === "single";
  const [loading, setLoading] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [timerDuration, setTimerDuration] = useState(30);

  useEffect(() => {
    if (isSinglePlayer) {
      setMaxPlayers(1);
    }
  }, [isSinglePlayer]);
  const [playerName, setPlayerName] = useState("");
  const [includePunctuation, setIncludePunctuation] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [textDifficulty, setTextDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
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

    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      const textToType = generateText({
        difficulty: textDifficulty,
        includePunctuation,
        includeNumbers,
        wordCount: 50
      });

      const { data, error } = await supabase
        .from("rooms")
        .insert({
          code: roomCode,
          max_players: maxPlayers,
          timer_duration: timerDuration,
          text_to_type: textToType,
          status: "waiting",
          include_punctuation: includePunctuation,
          include_numbers: includeNumbers,
          text_difficulty: textDifficulty,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: playerError } = await supabase
        .from("players")
        .insert({
          room_id: data.id,
          player_name: playerName.trim(),
        });

      if (playerError) throw playerError;

      sessionStorage.setItem(`player_name_${data.id}`, playerName.trim());

      toast({
        title: "Room Created!",
        description: `Room code: ${roomCode}`,
      });

      navigate(`/room/${data.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-3 sm:mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="text-center space-y-2 mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isSinglePlayer ? "Practice Mode" : "Create Room"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              {isSinglePlayer ? "Improve your typing speed" : "Set up your multiplayer game"}
            </p>
          </div>

          <Card className="p-4 sm:p-6 md:p-8 bg-card border-2 border-border">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Game Settings</h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Configure your typing race
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName" className="text-sm sm:text-base">
                    Your Name
                  </Label>
                  <Input
                    id="playerName"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="h-10 sm:h-12 text-base sm:text-lg bg-muted border-2"
                    maxLength={50}
                  />
                </div>

                {!isSinglePlayer && (
                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers" className="text-sm sm:text-base">
                      Max Players (2-6)
                    </Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      min={2}
                      max={6}
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Math.min(6, Math.max(2, parseInt(e.target.value) || 2)))}
                      className="h-10 sm:h-12 text-base sm:text-lg bg-muted border-2"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="timer" className="text-sm sm:text-base">
                    Timer Duration (seconds)
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 60].map((duration) => (
                      <Button
                        key={duration}
                        variant={timerDuration === duration ? "default" : "outline"}
                        onClick={() => setTimerDuration(duration)}
                        className="h-10 sm:h-12 text-base sm:text-lg"
                      >
                        {duration}s
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 border-t border-border pt-3 sm:pt-4">
                <h3 className="font-semibold text-sm sm:text-base text-foreground">Text Options</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="punctuation"
                      checked={includePunctuation}
                      onCheckedChange={(checked) => setIncludePunctuation(checked as boolean)}
                    />
                    <Label htmlFor="punctuation" className="text-xs sm:text-sm cursor-pointer">
                      Include Punctuation (. , ! ?)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={includeNumbers}
                      onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
                    />
                    <Label htmlFor="numbers" className="text-xs sm:text-sm cursor-pointer">
                      Include Numbers (0-9)
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Text Difficulty</Label>
                  <div className="flex gap-2">
                    {(["easy", "medium", "hard"] as const).map((difficulty) => (
                      <Button
                        key={difficulty}
                        type="button"
                        variant={textDifficulty === difficulty ? "default" : "outline"}
                        onClick={() => setTextDifficulty(difficulty)}
                        className="flex-1 capitalize text-sm sm:text-base"
                      >
                        {difficulty}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateRoom}
                disabled={loading || !playerName.trim()}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                size="lg"
              >
                {loading ? "Creating..." : (isSinglePlayer ? "Start Practice" : "Create Room")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateRoom;
