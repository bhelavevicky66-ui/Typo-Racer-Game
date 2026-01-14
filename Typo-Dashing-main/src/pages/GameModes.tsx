import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Zap, Timer } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const GameModes = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ThemeToggle />
      <div className="w-full max-w-4xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Practice Games
          </h1>
          <p className="text-muted-foreground">
            Choose a game mode to practice your typing skills
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-card border-2 border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Word by Word</h2>
              </div>
              <p className="text-muted-foreground">
                Type each word correctly to advance. Perfect for accuracy training!
              </p>
              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate("/word-practice")}
                >
                  Single Player
                </Button>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-center">Multiplayer</p>
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/word-practice/create")}
                  >
                    Create Room
                  </Button>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter room code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === "Enter" && joinCode && navigate(`/word-practice/join/${joinCode}`)}
                      maxLength={6}
                      className="uppercase"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => joinCode && navigate(`/word-practice/join/${joinCode}`)}
                      disabled={!joinCode}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="p-8 bg-card border-2 border-border hover:border-primary transition-all cursor-pointer hover:shadow-[var(--shadow-glow)]"
            onClick={() => navigate("/speed-challenge")}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Timer className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">60 Second Challenge</h2>
              </div>
              <p className="text-muted-foreground">
                Race against time! Type as much as you can in 60 seconds and beat your high score.
              </p>
              <div className="pt-4">
                <Button className="w-full" size="lg" variant="secondary">
                  Start Challenge
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameModes;
