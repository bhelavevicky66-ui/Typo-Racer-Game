-- Create word practice rooms table
CREATE TABLE public.word_practice_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 5,
  word_count INTEGER NOT NULL DEFAULT 30,
  status VARCHAR NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID
);

-- Create word practice players table
CREATE TABLE public.word_practice_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.word_practice_rooms(id) ON DELETE CASCADE,
  player_name VARCHAR NOT NULL,
  current_word_index INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.word_practice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_practice_players ENABLE ROW LEVEL SECURITY;

-- Create policies for word_practice_rooms
CREATE POLICY "Anyone can view word practice rooms" 
ON public.word_practice_rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create word practice rooms" 
ON public.word_practice_rooms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update word practice rooms" 
ON public.word_practice_rooms 
FOR UPDATE 
USING (true);

-- Create policies for word_practice_players
CREATE POLICY "Anyone can view word practice players" 
ON public.word_practice_players 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert word practice players" 
ON public.word_practice_players 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update word practice players" 
ON public.word_practice_players 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete word practice players" 
ON public.word_practice_players 
FOR DELETE 
USING (true);

-- Enable realtime for word practice tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.word_practice_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.word_practice_players;