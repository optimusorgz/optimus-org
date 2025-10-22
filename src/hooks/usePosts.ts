import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { useAuth } from '@/components/AuthContext';

export const usePosts = (organizationUuid?: string) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
    setupRealtimeSubscription();
  }, [organizationUuid, user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          organizations:organisation_id(name),
          profiles:author_id(name, avatar_url, is_staff, staff_name)
        `);

      if (organizationUuid) {
        query = query.eq('organisation_id', organizationUuid);
      }

      const { data: postsData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch engagement data for each post
      const postsWithEngagement = await Promise.all(
        (postsData || []).map(async (post) => {
          const [likesData, commentsData, sharesData, userLikeData, userShareData] = await Promise.all([
            supabase.from('likes').select('id').eq('post_id', post.id),
            supabase.from('comments').select('id').eq('post_id', post.id),
            supabase.from('shares').select('id').eq('post_id', post.id),
            user ? supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).single() : { data: null },
            user ? supabase.from('shares').select('id').eq('post_id', post.id).eq('user_id', user.id).single() : { data: null }
          ]);

          return {
            ...post,
            likes_count: likesData.data?.length || 0,
            comments_count: commentsData.data?.length || 0,
            shares_count: sharesData.data?.length || 0,
            user_liked: !!userLikeData.data,
            user_shared: !!userShareData.data,
            organization: Array.isArray(post.organizations) ? post.organizations[0] : post.organizations,
            author: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
          };
        })
      );

      setPosts(postsWithEngagement);
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('posts_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => fetchPosts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, () => fetchPosts())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'likes' }, () => fetchPosts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => fetchPosts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shares' }, () => fetchPosts())
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const likePost = async (postId: string) => {
    if (!user) throw new Error('User not authenticated');

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }

      // Update local state immediately
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              user_liked: !p.user_liked, 
              likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1 
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const sharePost = async (postId: string) => {
    if (!user) throw new Error('User not authenticated');

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_shared) {
        // Unshare
        const { error } = await supabase
          .from('shares')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Share
        const { error } = await supabase
          .from('shares')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }

      // Update local state immediately
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              user_shared: !p.user_shared, 
              shares_count: p.user_shared ? p.shares_count - 1 : p.shares_count + 1 
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling share:', error);
      throw error;
    }
  };

  const addComment = async (postId: string, text: string) => {
    if (!user) throw new Error('User not authenticated');
    if (!text.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          text: text.trim()
        });

      if (error) throw error;

      // Refresh posts to get updated comments
      await fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const createPost = async (content: string, imageUrl?: string, organisationId?: string) => {
    if (!user) throw new Error('User not authenticated');
    if (!organisationId) throw new Error('Organization ID required');

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          image_url: imageUrl,
          author_id: user.id,
          organisation_id: organisationId
        });

      if (error) throw error;

      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  return {
    posts,
    loading,
    likePost,
    sharePost,
    addComment,
    createPost,
    refetch: fetchPosts
  };
};