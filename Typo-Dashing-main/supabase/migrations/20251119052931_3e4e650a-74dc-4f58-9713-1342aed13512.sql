-- Add text difficulty options to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS include_punctuation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS include_numbers BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS text_difficulty VARCHAR DEFAULT 'easy';