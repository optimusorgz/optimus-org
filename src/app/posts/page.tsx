// app/page.tsx
// This file is automatically a Server Component in the Next.js App Router

import PostCard from '@/components/posts/PostCard';
import { Post } from '@/lib/types/supabase'; // Original Post interface (likely snake_case)
import supabase from '@/api/client'
import { Suspense } from 'react';

// NEW INTERFACE: Defines the structure AFTER data mapping (camelCase)
interface FeedPost {
  id: string;
  
  username: string; // Mapped from profile.name
  postImage: string; // Mapped from post_image_url
  caption: string;
  initialLikes: number; // Mapped from likes_count
  hashtags: string[];
  profileImage: string | undefined; // Mapped from profile.avatar_url
}

/**
 * Server function to fetch all posts from Supabase and map them with profile info
 */
async function getPosts(): Promise<FeedPost[]> {
  // 1️⃣ Fetch posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (postsError || !posts) {
    console.error('Error fetching posts:', JSON.stringify(postsError, null, 2));
    return [];
  }

  // 2️⃣ Extract all user_ids from posts
  const userIds = posts.map(post => post.user_id).filter(Boolean) as string[];

  if (userIds.length === 0) return [];

  // 3️⃣ Fetch only relevant profiles with name & avatar_url
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('uuid, name, avatar_url')   // Only the fields you need
    .in('uuid', userIds);               // Match all user_ids

  if (profilesError) {
    console.error('Error fetching profiles:', JSON.stringify(profilesError, null, 2));
    return [];
  }

  // 4️⃣ Map posts with profile info
  return posts.map(post => {
    const profile = profiles?.find(p => p.uuid === post.user_id);

    return {
      id: post.id,
      username: profile?.name ?? 'Unknown User',
      postImage: post.post_image_url,
      caption: post.caption,
      initialLikes: post.likes_count,
      hashtags: post.hashtags,
      profileImage: profile?.avatar_url ?? undefined,
    } as FeedPost;
  });
}


/**
 * The main Feed page component (Server Component)
 */
export default async function FeedPage() {
  const posts = await getPosts(); 

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10 border-b pb-4">
        Social Feed
      </h1>

      <Suspense fallback={<p className="text-center text-gray-500">Loading feed...</p>}>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">
            No posts found or failed to load. Check your RLS policies in Supabase!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-10 max-w-4xl mx-auto">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                username={post.username}
                postImage={post.postImage}
                caption={post.caption}
                initialLikes={post.initialLikes}
                hashtags={post.hashtags}
                profileImage={post.profileImage}
              />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
