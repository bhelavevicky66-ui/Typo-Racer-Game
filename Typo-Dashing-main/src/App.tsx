import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import GameRoom from "./pages/GameRoom";
import GameModes from "./pages/GameModes";
import WordPractice from "./pages/WordPractice";
import SpeedChallenge from "./pages/SpeedChallenge";
import CreateWordPracticeRoom from "./pages/CreateWordPracticeRoom";
import JoinWordPracticeRoom from "./pages/JoinWordPracticeRoom";
import WordPracticeRoom from "./pages/WordPracticeRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join/:code" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<GameRoom />} />
          <Route path="/game-modes" element={<GameModes />} />
          <Route path="/word-practice" element={<WordPractice />} />
          <Route path="/word-practice/create" element={<CreateWordPracticeRoom />} />
          <Route path="/word-practice/join/:code" element={<JoinWordPracticeRoom />} />
          <Route path="/word-practice/room/:roomId" element={<WordPracticeRoom />} />
          <Route path="/speed-challenge" element={<SpeedChallenge />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
