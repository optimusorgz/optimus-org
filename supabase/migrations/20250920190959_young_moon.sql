/*
  # Create Notifications and Posts System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `message` (text)
      - `is_read` (boolean, default false)
      - `created_at` (timestamp)
    - `posts`
      - `id` (uuid, primary key)
      - `organisation_id` (uuid, foreign key to organizations)
      - `title` (text)
      - `description` (text)
      - `image_url` (text, nullable)
      - `created_at` (timestamp)
    - `post_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `user_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
    - `post_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `user_id` (uuid, foreign key to users)
      - `comment_text` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for secure access control
    - Users can only manage their own notifications, likes, and comments
    - Organisation owners can only manage their own posts

  3. Functions
    - Add function to send approval notifications
    - Add function to get post engagement counts
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Posts policies
CREATE POLICY "Anyone can view posts"
  ON posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Organisation owners can insert posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = posts.organisation_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Organisation owners can update their posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = posts.organisation_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Organisation owners can delete their posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = posts.organisation_id
      AND owner_id = auth.uid()
    )
  );

-- Post likes policies
CREATE POLICY "Anyone can view post likes"
  ON post_likes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike their own likes"
  ON post_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Post comments policies
CREATE POLICY "Anyone can view post comments"
  ON post_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can comment on posts"
  ON post_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON post_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON post_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_organisation_id ON posts(organisation_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- Function to send approval notifications
CREATE OR REPLACE FUNCTION send_approval_notification(
  target_user_id uuid,
  notification_title text,
  notification_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message)
  VALUES (target_user_id, notification_title, notification_message);
END;
$$;

-- Function to get post engagement counts
CREATE OR REPLACE FUNCTION get_post_engagement(post_id_param uuid)
RETURNS TABLE(
  likes_count bigint,
  comments_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM post_likes WHERE post_id = post_id_param) as likes_count,
    (SELECT COUNT(*) FROM post_comments WHERE post_id = post_id_param) as comments_count;
END;
$$;