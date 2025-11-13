'use client';
import React, { useState } from 'react';
import { Newspaper, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewPostForm from '@/components/posts/PostForm';

interface Post {
  id: string;
  title: string;
  created_at: string;
}

interface HostedPostsListProps {
  posts: Post[];
  title: string;
  onDeletePost: (postId: string) => void; // Function to call when deleting a post
}

const HostedPostsList: React.FC<HostedPostsListProps> = ({ posts, title, onDeletePost }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-lg relative">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <h2 className="text-xl font-semibold text-indigo-400 flex items-center">
          <Newspaper className="w-5 h-5 mr-2" />
          {title} ({posts.length})
        </h2>

        <Button
          variant="ghost"
          className="text-indigo-400 hover:text-white hover:bg-indigo-700/50 p-2 rounded-lg"
          onClick={() => setShowForm(true)}
        >
          <PlusCircle className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {posts.length === 0 ? (
          <p className="text-gray-400 italic">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition duration-150">
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{post.title}</p>
                <p className="text-xs text-gray-400 mt-1">Created: {post.created_at}</p>
              </div>
              <Button
                onClick={() => onDeletePost(post.id)}
                size="sm"
                className="ml-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-md flex items-center"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative w-full max-w-xl p-6 bg-white rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 text-xl font-bold"
            >
              ✕
            </button>
            <NewPostForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default HostedPostsList;
