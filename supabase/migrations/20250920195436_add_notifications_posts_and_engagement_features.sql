
-- Add email column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
-- Update existing profile rows with email from auth.users
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE public.profiles.user_id = auth.users.id AND public.profiles.email IS NULL;
-- Create a trigger to update email on profile creation/update
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, name, email)
  VALUES (gen_random_uuid(), NEW.id, NEW.email, NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create the `notifications` table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
-- Create the `posts` table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts are viewable by all"
ON public.posts FOR SELECT
USING (true);
CREATE POLICY "Organisation owners can create posts"
ON public.posts FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.organizations WHERE id = organisation_id AND owner_id = auth.uid()));
CREATE POLICY "Organisation owners can update their posts"
ON public.posts FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.organizations WHERE id = organisation_id AND owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.organizations WHERE id = organisation_id AND owner_id = auth.uid()));
CREATE POLICY "Organisation owners can delete their posts"
ON public.posts FOR DELETE
USING (EXISTS (SELECT 1 FROM public.organizations WHERE id = organisation_id AND owner_id = auth.uid()));
-- Create the `post_likes` table
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id) -- A user can only like a post once
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can like/unlike posts"
ON public.post_likes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
-- Create the `post_comments` table
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can comment on posts"
ON public.post_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view all comments"
ON public.post_comments FOR SELECT
USING (true);
CREATE POLICY "Users can delete their own comments"
ON public.post_comments FOR DELETE
USING (auth.uid() = user_id);
-- Create the `send_approval_notification` function
CREATE OR REPLACE FUNCTION public.send_approval_notification(
  target_user_id UUID,
  notification_title TEXT,
  notification_message TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message)
  VALUES (target_user_id, notification_title, notification_message);
END;
$$;
-- Create the `get_post_engagement` function
CREATE OR REPLACE FUNCTION public.get_post_engagement(post_id_param UUID)
RETURNS TABLE(likes_count BIGINT, comments_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM public.post_likes WHERE post_id = post_id_param) AS likes_count,
    (SELECT COUNT(*)::BIGINT FROM public.post_comments WHERE post_id = post_id_param) AS comments_count;
END;
$$;

