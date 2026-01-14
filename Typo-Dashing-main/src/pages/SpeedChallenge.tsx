import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Timer, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { generateText } from "@/lib/textGenerator";

const SpeedChallenge = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    const generatedText = generateText({ 
      difficulty: "medium", 
      wordCount: 200,
      includePunctuation: false,
      includeNumbers: false
    });
    setText(generatedText);
  }, []);

  useEffect(() => {
    if (!isStarted || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isFinished]);

  const calculateWPM = useCallback(() => {
    const timeElapsed = (60 - timeLeft) / 60;
    if (timeElapsed === 0) return 0;
    
    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === text[i]) {
        correctChars++;
      }
    }
    
    const wordsTyped = correctChars / 5;
    return Math.round(wordsTyped / timeElapsed) || 0;
  }, [typedText, text, timeLeft]);

  const calculateAccuracy = useCallback(() => {
    if (typedText.length === 0) return 100;
    const target = text.substring(0, typedText.length);
    let correct = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === target[i]) correct++;
    }
    return Math.round((correct / typedText.length) * 100);
  }, [typedText, text]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (isFinished) return;

    if (!isStarted && e.key.length === 1) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setTypedText(prev => prev + e.key);
      
      if (typedText.length + 1 === text.length) {
        setIsFinished(true);
      }
    } else if (e.key === "Backspace") {
      e.preventDefault();
      setTypedText(prev => prev.slice(0, -1));
    }
  }, [isStarted, isFinished, typedText.length, text.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const getCharClass = (index: number) => {
    if (index < typedText.length) {
      if (typedText[index] === text[index]) return "text-correct";
      return "text-destructive";
    }
    if (index === typedText.length) return "border-l-4 border-primary bg-primary/10";
    return "text-muted-foreground/40";
  };

  if (isFinished) {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    const progress = Math.round((typedText.length / text.length) * 100);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ThemeToggle />
        <Card className="p-8 max-w-lg w-full text-center space-y-6">
          <h2 className="text-4xl font-bold">Challenge Complete!</h2>
          <div className="space-y-6">
            <div>
              <div className="text-7xl font-bold text-primary">{wpm}</div>
              <p className="text-muted-foreground text-lg">Words Per Minute</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-secondary">{accuracy}%</div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-accent">{progress}%</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <Button onClick={() => window.location.reload()} className="w-full" size="lg">
              <Zap className="mr-2 h-5 w-5" />
              Try Again
            </Button>
            <Button onClick={() => navigate("/game-modes")} variant="outline" className="w-full" size="lg">
              Back to Games
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <ThemeToggle />
      <div className="max-w-5xl mx-auto space-y-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/game-modes")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Timer className="w-8 h-8 text-primary" />
            <div className="text-5xl font-bold font-mono text-foreground">
              {timeLeft}s
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Current Speed</div>
            <div className="text-3xl font-bold text-primary">{calculateWPM()} WPM</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Accuracy</div>
            <div className="text-3xl font-bold text-secondary">{calculateAccuracy()}%</div>
          </div>
        </div>

        <Card className="p-8 bg-card border-2 border-border">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold">60 Second Speed Challenge</h3>
            </div>
            {!isStarted && (
              <p className="text-center text-muted-foreground text-lg mb-4">
                Start typing to begin the challenge!
              </p>
            )}
            <div 
              className="p-8 bg-muted/50 rounded-lg text-3xl leading-loose font-mono select-none"
              style={{ minHeight: "300px", lineHeight: "2.5", whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            >
              {text.split("").map((char, index) => (
                <span 
                  key={index} 
                  className={`${getCharClass(index)} px-0.5 inline`}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SpeedChallenge;
