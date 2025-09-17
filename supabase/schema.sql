-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business');
CREATE TYPE transcription_status AS ENUM ('uploading', 'processing', 'completed', 'error');

-- Profiles table (extends NextAuth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier subscription_tier DEFAULT 'free'
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'from-gray-500-to-gray-600',
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Transcriptions table
CREATE TABLE transcriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  duration INTEGER, -- in seconds
  accuracy DECIMAL(5,2), -- percentage
  status transcription_status DEFAULT 'uploading',
  file_url TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  speakers_count INTEGER DEFAULT 1,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project members table (for team collaboration)
CREATE TABLE project_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Transcription tags (many-to-many)
CREATE TABLE transcription_tags (
  transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(transcription_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX idx_transcriptions_project_id ON transcriptions(project_id);
CREATE INDEX idx_transcriptions_status ON transcriptions(status);
CREATE INDEX idx_transcriptions_created_at ON transcriptions(created_at DESC);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcriptions_updated_at 
    BEFORE UPDATE ON transcriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_tags ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (user_id = auth.uid());

-- Policies for transcriptions
CREATE POLICY "Users can view their own transcriptions" ON transcriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transcriptions" ON transcriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transcriptions" ON transcriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transcriptions" ON transcriptions
  FOR DELETE USING (user_id = auth.uid());

-- Policies for project_members
CREATE POLICY "Users can view project members for their projects" ON project_members
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Policies for tags
CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tags" ON tags
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tags" ON tags
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE USING (user_id = auth.uid());

-- Policies for transcription_tags
CREATE POLICY "Users can manage tags on their transcriptions" ON transcription_tags
  FOR ALL USING (
    transcription_id IN (SELECT id FROM transcriptions WHERE user_id = auth.uid())
  );

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();