import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface WordPracticeResultsProps {
  room: {
    id: string;
    winner_id: string | null;
  };
  players: Array<{
    id: string;
    player_name: string;
    correct: number;
    incorrect: number;
    finished_at: string | null;
  }>;
}

const WordPracticeResults = ({ room, players }: WordPracticeResultsProps) => {
  const navigate = useNavigate();
  
  const sortedPlayers = [...players].sort((a, b) => {
    if (!a.finished_at) return 1;
    if (!b.finished_at) return -1;
    return new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime();
  });

  const winner = sortedPlayers[0];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ThemeToggle />
      <Card className="p-8 max-w-2xl w-full space-y-6">
        <div className="text-center space-y-4">
          <Trophy className="w-20 h-20 mx-auto text-primary" />
          <h2 className="text-4xl font-bold">Game Complete!</h2>
          {winner && (
            <p className="text-2xl text-primary">
              🎉 {winner.player_name} wins! 🎉
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold mb-4">Final Standings</h3>
          {sortedPlayers.map((player, index) => {
            const accuracy = player.correct + player.incorrect > 0
              ? Math.round((player.correct / (player.correct + player.incorrect)) * 100)
              : 0;
            
            return (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 flex items-center justify-between ${
                  index === 0 ? "bg-primary/10 border-primary" :
                  index === 1 ? "bg-secondary/10 border-secondary" :
                  "bg-muted border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold">
                    {index === 0 ? <Trophy className="w-6 h-6" /> :
                     index === 1 ? <Medal className="w-6 h-6" /> :
                     index + 1}
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{player.player_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Correct: {player.correct} | Wrong: {player.incorrect} | Accuracy: {accuracy}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 pt-4">
          <Button onClick={() => navigate("/game-modes")} className="w-full" size="lg">
            Back to Games
          </Button>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full" size="lg">
            Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WordPracticeResults;
