'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';

// IMPORTANT: Replace this placeholder import with your actual Supabase client configuration.
// Example: import { supabase } from '@/lib/supabaseClient'; 
const supabase = { 
  from: (table: string) => ({
    update: (data: any) => ({
      eq: (column: string, value: string) => ({ 
        error: null, // Simulate successful update
      })
    })
  })
};

// Define the interface for the component props
interface PostCardProps {
  id: string; // The primary key ID of the post (used for Supabase updates)
  username: string;
  postImage: string;
  caption: string;
  initialLikes: number;
  profileImage?: string; // Optional profile image URL
  hashtags?: string[]; // Optional array of hashtags
}

/**
 * A reusable component that mimics an Instagram-style post UI
 * and handles local liking with a persistent update to Supabase.
 */
const PostCard: React.FC<PostCardProps> = ({
  id,
  username,
  postImage,
  caption,
  initialLikes,
  profileImage,
  hashtags = [],
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false); // Prevents spam-clicking

  // Function to handle the like button click and update Supabase
  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    // Determine the new state
    const newIsLiked = !isLiked;
    const newLikes = newIsLiked ? likes + 1 : likes - 1;

    try {
      // Supabase Update: Increment/Decrement the likes_count for the post ID
      const { error: updateError } = await supabase
        .from('posts')
        .update({ likes_count: newLikes })
        .eq('id', id);

      if (updateError) throw updateError;
      
      // If successful, update local state
      setLikes(newLikes);
      setIsLiked(newIsLiked);

    } catch (error) {
      console.error('Error updating like count in Supabase:', error);
      // Revert the UI if the backend update fails
      alert('Failed to update like count. Please check your Supabase setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden 
                    transition-all duration-300 hover:shadow-3xl transform hover:-translate-y-1 my-8 opacity-0" data-animate-on-visible="fade-up">
      
      {/* Header Section: User Info */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {profileImage ? (
            <img
              src={profileImage}
              alt={`${username}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-gray-500" />
          )}
        </div>
        <span className="ml-3 text-lg font-semibold text-gray-900">{username}</span>
      </div>

      {/* Post Image Section */}
      <div className="relative w-full aspect-square">
        <img
          src={postImage}
          alt={`Post by ${username}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Action Icons Section */}
      <div className="flex justify-between items-center p-4">
        <div className="flex space-x-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={loading}
            className="group focus:outline-none transition duration-150 ease-in-out disabled:opacity-60"
            aria-label="Like post"
          >
            <Heart
              className={`w-7 h-7 transition-all duration-300 
                ${isLiked ? 'fill-red-500 text-red-500 transform scale-110' : 'text-gray-700 hover:text-red-500 hover:scale-105'}`}
            />
          </button>
          
          {/* Comment Button (Placeholder) */}
          <button className="group text-gray-700 hover:text-gray-900 transition focus:outline-none" aria-label="Comment on post">
            <MessageCircle className="w-7 h-7 group-hover:scale-105 transition-transform" />
          </button>
          
          {/* Share Button (Placeholder) */}
          <button className="group text-gray-700 hover:text-gray-900 transition focus:outline-none" aria-label="Share post">
            <Send className="w-7 h-7 group-hover:scale-105 transition-transform" />
          </button>
        </div>
        
        {/* Save Button (Placeholder) */}
        <button className="group text-gray-700 hover:text-gray-900 transition focus:outline-none" aria-label="Save post">
          <Bookmark className="w-7 h-7 group-hover:scale-105 transition-transform" />
        </button>
      </div>

      {/* Likes Count */}
      <div className="px-4 pb-2">
        <p className="text-base font-bold text-gray-900">
          {likes} {likes === 1 ? 'like' : 'likes'}
        </p>
      </div>

      {/* Caption/Title */}
      <div className="px-4 pb-2">
        <p className="text-gray-800">
          <span className="font-bold mr-1">{username}</span>
          {caption}
        </p>
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-x-2">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            >
              {`#${tag}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;