'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import supabase from '@/api/client';

interface PostEditFormProps {
  postId: string;
  onCancel: () => void;
  onPostUpdated: () => void; // Called after successful update
}

const PostEditForm: React.FC<PostEditFormProps> = ({ postId, onCancel, onPostUpdated }) => {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string>('');
  const [postImage, setPostImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch post data on mount
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('caption, hashtags, post_image_url')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return;
      }

      setCaption(data.caption ?? '');
      setHashtags((data.hashtags ?? []).join(', '));
      setPostImage(data.post_image_url ?? '');
    };

    fetchPost();
  }, [postId]);

  // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileName = `${postId}-${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        });

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Failed to upload image');
        setUploading(false);
        return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl; // THIS IS THE CORRECT WAY
    setPostImage(publicUrl);

    setUploading(false);
    };


  // Handle save
  const handleSave = async () => {
    setLoading(true);

    const updatedHashtags = hashtags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const { error } = await supabase
      .from('posts')
      .update({
        caption,
        hashtags: updatedHashtags,
        post_image_url: postImage,
      })
      .eq('id', postId);

    setLoading(false);

    if (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Check console for details.');
      return;
    }

    onPostUpdated();
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800/90 border border-gray-700 p-8 rounded-xl shadow-2xl text-white">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-700">
        <h2 className="text-3xl font-bold text-indigo-400">
          Edit Post: {postId.substring(0, 8)}...
        </h2>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="text-gray-400 hover:text-white flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Posts
        </Button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Post Caption..."
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />
        <input
          type="text"
          placeholder="Hashtags (comma-separated)..."
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          value={hashtags}
          onChange={e => setHashtags(e.target.value)}
        />

        {/* Image Upload */}
        <div className="flex flex-col">
          {postImage && (
            <img
              src={postImage}
              alt="Post Preview"
              className="w-full h-64 object-cover rounded-lg mb-2"
            />
          )}
          <label className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 w-fit">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg shadow-md flex items-center"
          disabled={loading || uploading}
        >
          <Save className="w-5 h-5 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default PostEditForm;
