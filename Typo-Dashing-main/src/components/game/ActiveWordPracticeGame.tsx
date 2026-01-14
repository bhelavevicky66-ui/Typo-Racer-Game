import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Check, X } from "lucide-react";

interface ActiveWordPracticeGameProps {
  room: {
    id: string;
    code: string;
    word_count: number;
  };
  players: Array<{
    id: string;
    player_name: string;
    current_word_index: number;
    correct: number;
    incorrect: number;
    finished_at: string | null;
  }>;
}

const ActiveWordPracticeGame = ({ room, players }: ActiveWordPracticeGameProps) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    const storedWords = sessionStorage.getItem(`wp_words_${room.id}`);
    if (storedWords) {
      setWords(JSON.parse(storedWords));
    }

    const playerName = sessionStorage.getItem(`wp_player_name_${room.id}`);
    const player = players.find(p => p.player_name === playerName);
    setCurrentPlayer(player);
    
    if (player) {
      setCurrentWordIndex(player.current_word_index);
      setCorrect(player.correct);
      setIncorrect(player.incorrect);
    }
  }, [room.id, players]);

  const currentWord = words[currentWordIndex];

  const updateProgress = useCallback(async () => {
    if (!currentPlayer || hasFinished) return;

    await supabase
      .from("word_practice_players")
      .update({
        current_word_index: currentWordIndex,
        correct,
        incorrect,
      })
      .eq("id", currentPlayer.id);
  }, [currentPlayer, currentWordIndex, correct, incorrect, hasFinished]);

  const finishGame = useCallback(async () => {
    if (!currentPlayer || hasFinished) return;
    
    setHasFinished(true);
    
    await supabase
      .from("word_practice_players")
      .update({
        finished_at: new Date().toISOString(),
        current_word_index: currentWordIndex,
        correct,
        incorrect,
      })
      .eq("id", currentPlayer.id);

    const finishedPlayers = players.filter(p => p.finished_at).length + 1;
    
    if (finishedPlayers === 1) {
      await supabase
        .from("word_practice_rooms")
        .update({
          winner_id: currentPlayer.id,
          status: "finished",
          ended_at: new Date().toISOString(),
        })
        .eq("id", room.id);
    }
  }, [currentPlayer, hasFinished, currentWordIndex, correct, incorrect, players, room.id]);

  useEffect(() => {
    if (currentWordIndex >= words.length && words.length > 0) {
      finishGame();
    }
  }, [currentWordIndex, words.length, finishGame]);

  useEffect(() => {
    updateProgress();
  }, [currentWordIndex, correct, incorrect, updateProgress]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!currentWord || hasFinished) return;

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const newText = typedText + e.key;
      setTypedText(newText);
      
      if (newText === currentWord) {
        setIsCorrect(true);
        setCorrect(prev => prev + 1);
        setTimeout(() => {
          setCurrentWordIndex(prev => prev + 1);
          setTypedText("");
          setIsCorrect(null);
        }, 300);
      } else if (!currentWord.startsWith(newText)) {
        setIsCorrect(false);
        setIncorrect(prev => prev + 1);
        setTimeout(() => {
          setTypedText("");
          setIsCorrect(null);
        }, 300);
      }
    } else if (e.key === "Backspace") {
      e.preventDefault();
      setTypedText(prev => prev.slice(0, -1));
      setIsCorrect(null);
    }
  }, [currentWord, typedText, hasFinished]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  if (hasFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ThemeToggle />
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <Trophy className="w-20 h-20 mx-auto text-primary" />
          <h2 className="text-3xl font-bold">You Finished!</h2>
          <p className="text-muted-foreground">Waiting for other players...</p>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-semibold">{index + 1}. {player.player_name}</span>
                {player.finished_at ? (
                  <Check className="w-5 h-5 text-secondary" />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {player.current_word_index}/{words.length} words
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ThemeToggle />
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Room: <span className="font-mono font-bold">{room.code}</span>
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-secondary" />
              <span className="text-2xl font-bold">{correct}</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              <span className="text-2xl font-bold">{incorrect}</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Word {currentWordIndex + 1} of {words.length}
          </div>

          <Card className={`p-12 bg-card border-4 transition-colors ${
            isCorrect === true ? "border-secondary" : 
            isCorrect === false ? "border-destructive" : 
            "border-border"
          }`}>
            <div className="space-y-8">
              <div className="text-5xl font-mono text-muted-foreground/40">
                {currentWord}
              </div>
              <div className="text-5xl font-mono min-h-[60px] flex items-center justify-center">
                {typedText.split("").map((char, i) => (
                  <span
                    key={i}
                    className={
                      char === currentWord[i]
                        ? "text-correct"
                        : "text-destructive"
                    }
                  >
                    {char}
                  </span>
                ))}
                <span className="border-l-4 border-primary animate-pulse ml-1"></span>
              </div>
            </div>
          </Card>

          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">Other Players:</p>
            {players.filter(p => p.id !== currentPlayer?.id).map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <span className="font-semibold">{player.player_name}</span>
                <span className="text-muted-foreground">
                  {player.current_word_index}/{words.length} words
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWordPracticeGame;
