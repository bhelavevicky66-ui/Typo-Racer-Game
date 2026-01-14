import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Timer, Zap } from "lucide-react";
import type { Room, Player } from "@/pages/GameRoom";
import Layout from "@/components/Layout";

// Sound disabled for smoother experience

interface ActiveGameProps {
  room: Room;
  players: Player[];
}

const ActiveGame = ({ room, players }: ActiveGameProps) => {
  const { toast } = useToast();
  const [typedText, setTypedText] = useState("");
  const [timeLeft, setTimeLeft] = useState(room.timer_duration);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [hasFinished, setHasFinished] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    const playerName = sessionStorage.getItem(`player_name_${room.id}`);
    if (playerName) {
      const player = players.find((p) => p.player_name === playerName);
      setCurrentPlayer(player || null);
    }
  }, [players, room.id]);

  useEffect(() => {
    if (!room.started_at) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(room.started_at!).getTime()) / 1000);
      const remaining = Math.max(0, room.timer_duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 3 && remaining > 0) {
        setShowCountdown(true);
      } else {
        setShowCountdown(false);
      }

      if (remaining === 0) {
        endGame();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [room.started_at, room.timer_duration]);

  const calculateWPM = useCallback(() => {
    const timeElapsed = (Date.now() - startTimeRef.current) / 1000 / 60;

    // Count only correct characters
    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === room.text_to_type[i]) {
        correctChars++;
      }
    }

    // Average word length is 5 characters
    const wordsTyped = correctChars / 5;
    return Math.round(wordsTyped / timeElapsed) || 0;
  }, [typedText, room.text_to_type]);

  const calculateAccuracy = useCallback(() => {
    if (typedText.length === 0) return 100;
    const target = room.text_to_type.substring(0, typedText.length);
    let correct = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === target[i]) correct++;
    }
    return Math.round((correct / typedText.length) * 100);
  }, [typedText, room.text_to_type]);

  const updateProgress = useCallback(async () => {
    if (!currentPlayer || hasFinished) return;

    const progress = Math.round((typedText.length / room.text_to_type.length) * 100);
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();

    const isComplete = typedText === room.text_to_type;

    await supabase
      .from("players")
      .update({
        progress: Math.min(100, progress),
        wpm,
        accuracy,
        finished_at: isComplete ? new Date().toISOString() : null,
      })
      .eq("id", currentPlayer.id);

    if (isComplete && !hasFinished) {
      setHasFinished(true);
      toast({
        title: "Finished!",
        description: `${wpm} WPM • ${accuracy}% accuracy`,
      });
    }
  }, [currentPlayer, typedText, room.text_to_type, calculateWPM, calculateAccuracy, hasFinished, toast]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      updateProgress();
    }, 300);

    return () => clearTimeout(debounce);
  }, [typedText, updateProgress]);

  const endGame = async () => {
    await supabase
      .from("rooms")
      .update({
        status: "finished",
        ended_at: new Date().toISOString(),
      })
      .eq("id", room.id);
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const getCharClass = (index: number) => {
    if (index < typedText.length) {
      if (typedText[index] === room.text_to_type[index]) return "text-correct";
      return "text-destructive";
    }
    if (index === typedText.length) return "border-l-4 border-primary bg-primary/10";
    return "text-muted-foreground/40";
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (hasFinished) return;

    // Check caps lock
    setCapsLockOn(e.getModifierState?.("CapsLock") || false);

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setTypedText(prev => prev + e.key);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      setTypedText(prev => prev.slice(0, -1));
    }
  }, [hasFinished]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getCurrentLines = () => {
    const words = room.text_to_type.split(" ");
    const typedWords = typedText.trim().split(/\s+/);
    const currentWordIndex = Math.min(typedWords.length, words.length);

    // Show current line and next 2 lines (roughly 15 words per line)
    const wordsPerLine = 15;
    const startIndex = Math.max(0, Math.floor((currentWordIndex - 5) / wordsPerLine) * wordsPerLine);
    const endIndex = Math.min(words.length, startIndex + wordsPerLine * 3);

    return words.slice(startIndex, endIndex).join(" ");
  };

  return (

    <Layout>
      <div className="p-2 sm:p-4 min-h-screen">
        {capsLockOn && (
          <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-destructive text-destructive-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg animate-pulse text-sm sm:text-base">
              ⚠️ Caps Lock is ON
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <div className="text-4xl sm:text-5xl font-bold font-mono text-foreground">
                {timeLeft}s
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xs sm:text-sm text-muted-foreground">Room Code</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-primary">{room.code}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Players List */}
            <Card className="p-4 bg-black/40 backdrop-blur-md border-white/10 md:col-span-1 h-fit">
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-primary">Players</span>
                  <span className="text-muted-foreground text-sm">({players.length})</span>
                </h3>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div key={player.id} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-semibold ${player.id === currentPlayer?.id ? "text-primary" : "text-white"}`}>
                          {player.player_name || `Player ${player.id.slice(0, 4)}`} {player.id === currentPlayer?.id && "(You)"}
                        </span>
                        <span className="text-muted-foreground">{player.wpm} WPM</span>
                      </div>
                      <Progress value={player.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Typing Area */}
            <Card className="p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-md border-white/10 md:col-span-3">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  <h3 className="text-xl sm:text-2xl font-bold">Type to race!</h3>
                </div>
                <div
                  className="p-4 sm:p-8 md:p-12 bg-muted/50 rounded-lg text-2xl sm:text-3xl md:text-4xl leading-relaxed sm:leading-loose tracking-wide font-mono focus:outline-none select-none break-words"
                  style={{ minHeight: "200px", lineHeight: "2.5", wordWrap: "break-word", whiteSpace: "pre-wrap" }}
                >
                  {getCurrentLines().split("").map((char, index) => {
                    const globalIndex = room.text_to_type.indexOf(getCurrentLines()) + index;
                    return (
                      <span
                        key={globalIndex}
                        className={`${getCharClass(globalIndex)} px-0.5`}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    );
                  })}
                </div>
                {showCountdown && timeLeft > 0 && (
                  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="text-[120px] sm:text-[200px] font-bold text-accent animate-pulse">
                      {timeLeft}
                    </div>
                  </div>
                )}
                {hasFinished && (
                  <div className="text-center text-base sm:text-lg text-primary font-bold animate-bounce">
                    ✓ Finished! Waiting for others...
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div >
      {/* Hidden input to capture keystrokes */}
      < textarea
        ref={textareaRef}
        className="opacity-0 absolute top-0 left-0 h-0 w-0"
        autoFocus
        onBlur={() => textareaRef.current?.focus()}
      />
    </Layout >
  );
};

export default ActiveGame;
