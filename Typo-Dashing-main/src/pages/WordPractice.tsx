import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { generateText } from "@/lib/textGenerator";

const WordPractice = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const text = generateText({ 
      difficulty: "easy", 
      wordCount: 50,
      includePunctuation: false,
      includeNumbers: false
    });
    setWords(text.split(" "));
  }, []);

  const currentWord = words[currentWordIndex];

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!currentWord) return;

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
        }, 500);
      } else if (!currentWord.startsWith(newText)) {
        setIsCorrect(false);
        setIncorrect(prev => prev + 1);
        setTimeout(() => {
          setCurrentWordIndex(prev => prev + 1);
          setTypedText("");
          setIsCorrect(null);
        }, 500);
      } else {
        setIsCorrect(null);
      }
    } else if (e.key === "Backspace") {
      e.preventDefault();
      setTypedText(prev => prev.slice(0, -1));
      setIsCorrect(null);
    } else if (e.key === "Enter" && typedText.length > 0) {
      e.preventDefault();
      if (typedText === currentWord) {
        setIsCorrect(true);
        setCorrect(prev => prev + 1);
      } else {
        setIsCorrect(false);
        setIncorrect(prev => prev + 1);
      }
      setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
        setTypedText("");
        setIsCorrect(null);
      }, 500);
    }
  }, [currentWord, typedText]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  if (currentWordIndex >= words.length) {
    const accuracy = Math.round((correct / (correct + incorrect)) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ThemeToggle />
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <h2 className="text-3xl font-bold">Practice Complete!</h2>
          <div className="space-y-4">
            <div className="text-6xl font-bold text-primary">{accuracy}%</div>
            <p className="text-muted-foreground">Accuracy</p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-secondary">{correct}</div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-destructive">{incorrect}</div>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full" size="lg">
              Practice Again
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full" size="lg">
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ThemeToggle />
      <div className="w-full max-w-3xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/game-modes")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center space-y-4">
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-secondary" />
              <span className="text-2xl font-bold">{correct}</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              <span className="text-2xl font-bold">{incorrect}</span>
            </div>
          </div>

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

          <p className="text-sm text-muted-foreground">
            Type the word above and press Enter
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordPractice;
