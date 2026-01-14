const easyWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could", "them",
  "see", "other", "than", "then", "now", "look", "only", "come", "its",
  "over", "think", "also", "back", "after", "use", "two", "how", "our",
  "work", "first", "well", "way", "even", "new", "want", "because", "any"
];

const mediumWords = [
  "government", "company", "number", "group", "problem", "fact", "hand",
  "place", "case", "week", "part", "world", "eye", "woman", "life",
  "system", "program", "question", "work", "point", "child", "state",
  "area", "student", "story", "result", "morning", "community", "book",
  "reason", "body", "market", "fact", "teacher", "door", "art", "history",
  "party", "within", "everything", "school", "service", "family", "power",
  "money", "change", "music", "moment", "minute", "question", "business"
];

const hardWords = [
  "accommodate", "acknowledge", "acquaintance", "algorithm", "ambiguous",
  "anonymous", "apparatus", "belligerent", "bureaucracy", "catastrophe",
  "characteristic", "conscientious", "controversial", "correspondence",
  "definitely", "deteriorate", "dilemma", "discipline", "embarrass",
  "enthusiastic", "environment", "exaggerate", "extraordinary", "fahrenheit",
  "guarantee", "harass", "hierarchy", "immediately", "independence",
  "inevitable", "intellectual", "interpretation", "leisure", "maintenance",
  "millennium", "necessary", "occurrence", "parallel", "perseverance",
  "pharmaceutical", "pneumonia", "privilege", "pronunciation", "psychology",
  "questionnaire", "reconnaissance", "refrigerator", "restaurant", "rhythm"
];

const punctuation = [",", ".", "!", "?", ";", ":", "'", '"'];
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export interface TextGeneratorOptions {
  difficulty: "easy" | "medium" | "hard";
  includePunctuation: boolean;
  includeNumbers: boolean;
  wordCount?: number;
}

export const generateText = (options: TextGeneratorOptions): string => {
  const {
    difficulty = "easy",
    includePunctuation = false,
    includeNumbers = false,
    wordCount = 50
  } = options;

  let wordList: string[];
  
  switch (difficulty) {
    case "hard":
      wordList = hardWords;
      break;
    case "medium":
      wordList = mediumWords;
      break;
    default:
      wordList = easyWords;
  }

  const words: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    // Add a random word
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    words.push(randomWord);

    // Occasionally add punctuation (15% chance)
    if (includePunctuation && Math.random() < 0.15 && i < wordCount - 1) {
      const randomPunc = punctuation[Math.floor(Math.random() * punctuation.length)];
      words[words.length - 1] = words[words.length - 1] + randomPunc;
    }

    // Occasionally add a number (10% chance)
    if (includeNumbers && Math.random() < 0.1 && i < wordCount - 1) {
      const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
      words.push(randomNum);
    }
  }

  return words.join(" ");
};
