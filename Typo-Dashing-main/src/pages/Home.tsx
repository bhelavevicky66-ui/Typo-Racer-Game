import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Zap, Users } from "lucide-react";
import Layout from "@/components/Layout";

const Home = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");

  const handleCreateRoom = () => {
    navigate("/create");
  };

  const handleJoinRoom = () => {
    if (joinCode.trim()) {
      navigate(`/join/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <Layout>
      <div className="pt-48 pb-8 px-4 flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="w-full max-w-6xl space-y-6 sm:space-y-8">

          <div className="flex flex-col items-center justify-center mb-8">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic select-none">
              <span className="text-[#00f2ea] drop-shadow-[0_0_10px_rgba(0,242,234,0.5)]">TYPE</span>
              <span className="text-[#a020f0] drop-shadow-[0_0_10px_rgba(160,32,240,0.5)]">RACER</span>
            </h1>
            <p className="text-muted-foreground font-mono tracking-[0.5em] text-xs sm:text-sm mt-2 opacity-70">
              NEON BLITZ V1.0.4
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <Card className="p-6 sm:p-8 bg-black/60 backdrop-blur-md hover:bg-black/70 hover:shadow-[0_0_30px_rgba(0,242,234,0.2)] transition-all duration-300 border-2 border-[#00f2ea]/30 text-white">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Create Room</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Start a new game and invite friends
                  </p>
                </div>
                <Button
                  onClick={handleCreateRoom}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Create New Game
                </Button>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-black/60 backdrop-blur-md hover:bg-black/70 hover:shadow-[0_0_30px_rgba(0,242,234,0.2)] transition-all duration-300 border-2 border-[#00f2ea]/30 text-white">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Join Room</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Enter a room code to join friends
                  </p>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter room code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                    className="h-12 sm:h-14 text-base sm:text-lg text-center font-mono tracking-wider bg-muted border-2"
                    maxLength={10}
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!joinCode.trim()}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-accent to-destructive hover:opacity-90"
                    size="lg"
                  >
                    Join Game
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-black/60 backdrop-blur-md hover:bg-black/70 hover:shadow-[0_0_30px_rgba(0,242,234,0.2)] transition-all duration-300 border-2 border-[#00f2ea]/30 text-white md:col-span-2 md:w-2/3 md:mx-auto">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Practice Mode</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Play solo and improve your speed
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/game-modes")}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Practice Games
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
