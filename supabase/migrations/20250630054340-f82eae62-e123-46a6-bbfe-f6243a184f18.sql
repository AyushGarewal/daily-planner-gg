
-- Create custom categories table
CREATE TABLE public.custom_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('task', 'habit', 'project', 'goal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for custom categories
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for custom categories (global for all users)
CREATE POLICY "Anyone can view custom categories" 
  ON public.custom_categories 
  FOR SELECT 
  TO public;

CREATE POLICY "Anyone can create custom categories" 
  ON public.custom_categories 
  FOR INSERT 
  TO public;

-- Create daily reflections table
CREATE TABLE public.daily_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  reflection_date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, reflection_date)
);

-- Enable RLS for daily reflections
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reflections" 
  ON public.daily_reflections 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create project notes table
CREATE TABLE public.project_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for project notes
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own project notes" 
  ON public.project_notes 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('task_completion', 'habit_streak', 'xp_gain', 'custom')),
  condition_target INTEGER NOT NULL,
  condition_duration INTEGER, -- days for streak/duration challenges
  xp_reward INTEGER DEFAULT 0,
  badge_name TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own challenges" 
  ON public.challenges 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add project_id and goal_id columns to existing task structure (conceptually)
-- Since we're working with localStorage, we'll handle this in the code

-- Create function to reset all user data
CREATE OR REPLACE FUNCTION public.reset_user_data(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to reset their own data
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Delete user data from all tables
  DELETE FROM public.daily_reflections WHERE user_id = target_user_id;
  DELETE FROM public.project_notes WHERE user_id = target_user_id;
  DELETE FROM public.challenges WHERE user_id = target_user_id;
  
  -- Note: Tasks, habits, projects, etc. are stored in localStorage
  -- so they will be reset via the frontend code
END;
$$;
