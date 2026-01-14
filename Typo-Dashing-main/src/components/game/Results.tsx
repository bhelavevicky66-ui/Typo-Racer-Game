import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Trophy, Home, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { Room, Player } from "@/pages/GameRoom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import Layout from "@/components/Layout";

interface ResultsProps {
  room: Room;
  players: Player[];
}

const Results = ({ room, players }: ResultsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Show confetti effect
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.finished_at && !b.finished_at) return -1;
    if (!a.finished_at && b.finished_at) return 1;
    if (a.finished_at && b.finished_at) {
      return new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime();
    }
    return b.wpm - a.wpm;
  });

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400 to-yellow-600";
      case 1:
        return "from-gray-300 to-gray-500";
      case 2:
        return "from-orange-400 to-orange-600";
      default:
        return "from-primary to-secondary";
    }
  };

  const calculateLetterStats = (player: Player) => {
    const textLength = room.text_to_type.length;
    const progress = player.progress;
    const accuracy = player.accuracy;

    // Calculate typed characters based on progress
    const typedChars = Math.round((progress / 100) * textLength);

    // Calculate correct and incorrect based on accuracy
    const correctLetters = Math.round((accuracy / 100) * typedChars);
    const incorrectLetters = typedChars - correctLetters;

    return { correctLetters, incorrectLetters };
  };

  const handleNextGame = async () => {
    try {
      const { generateText } = await import("@/lib/textGenerator");

      // Generate new text with same settings
      const newText = generateText({
        difficulty: room.text_difficulty as "easy" | "medium" | "hard",
        includePunctuation: room.include_punctuation || false,
        includeNumbers: room.include_numbers || false,
        wordCount: 50
      });

      // Reset room to waiting state with new text
      await supabase
        .from("rooms")
        .update({
          status: "waiting",
          started_at: null,
          ended_at: null,
          text_to_type: newText,
        })
        .eq("id", room.id);

      // Reset all players
      await supabase
        .from("players")
        .update({
          progress: 0,
          wpm: 0,
          accuracy: 0,
          finished_at: null,
        })
        .eq("room_id", room.id);

      toast({
        title: "New Game!",
        description: "Ready to race again!",
      });
    } catch (error) {
      console.error("Error resetting game:", error);
      toast({
        title: "Error",
        description: "Failed to start new game",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center p-4 min-h-screen relative overflow-hidden">
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute animate-ping text-accent"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center space-y-4">
            <Trophy className="w-20 h-20 text-accent mx-auto animate-bounce" />
            <h1 className="text-5xl font-bold text-foreground">Game Over!</h1>
            <p className="text-xl text-muted-foreground">
              Room Code: <span className="font-mono font-bold text-primary">{room.code}</span>
            </p>
          </div>

          <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-border">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center mb-6">Final Results</h2>
              <div className="space-y-4">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-6 rounded-lg border-2 ${index === 0 ? "border-accent shadow-[var(--shadow-glow)]" : "border-border"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(
                            index
                          )} flex items-center justify-center text-2xl font-bold text-white`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {player.player_name}
                          </div>
                          {player.finished_at && (
                            <div className="text-sm text-secondary font-semibold">
                              ✓ Completed the race
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex flex-wrap items-center justify-end gap-4 md:gap-6">
                          <div className="text-center">
                            <div className="text-xs md:text-sm text-muted-foreground">WPM</div>
                            <div className="text-2xl md:text-3xl font-bold text-primary">{player.wpm}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs md:text-sm text-muted-foreground">Accuracy</div>
                            <div className="text-2xl md:text-3xl font-bold text-secondary">
                              {player.accuracy}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs md:text-sm text-muted-foreground">Progress</div>
                            <div className="text-2xl md:text-3xl font-bold text-accent">{player.progress}%</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-4 md:gap-6 text-sm mt-2" title={`Correct: ${calculateLetterStats(player).correctLetters} | Incorrect: ${calculateLetterStats(player).incorrectLetters}`}>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Correct</div>
                            <div className="text-base md:text-lg font-bold text-green-500">
                              {calculateLetterStats(player).correctLetters}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Incorrect</div>
                            <div className="text-base md:text-lg font-bold text-red-500">
                              {calculateLetterStats(player).incorrectLetters}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  onClick={handleNextGame}
                  className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  <RotateCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Next Game
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold"
                  size="lg"
                >
                  <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
