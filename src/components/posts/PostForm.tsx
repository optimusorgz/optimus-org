'use client';

import React, { useRef } from 'react';
import { Image, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
// Assume '@/api/client' exports the Supabase client
import supabase from '@/api/client'; 

// --- UPDATED SERVER ACTION ---
export async function createPost(formData: FormData) {
    // 1. GET AUTH SESSION
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        // If no session, the user is not authenticated.
        return { success: false, message: 'Authentication required to create a post.' };
    }
    
    const userId = session.user.id;
    // using the userId, but for this server action, we'll use a placeholder or email.

    const caption = formData.get('caption') as string;
    const hashtagsRaw = formData.get('hashtags') as string;
    const imageFile = formData.get('postImage') as File;

    if (!caption || !imageFile || imageFile.size === 0) {
        return { success: false, message: 'Caption and an image are required.' };
    }

    const hashtags = hashtagsRaw.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(Boolean);

    // 2. Upload image
    const bucket = 'posts-bucket';
    // Ensure the file name is secure and unique
    const ext = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const filePath = `posts/${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
    });
    if (uploadError) {
        console.error('Image Upload Error:', uploadError);
        return { success: false, message: `Image upload failed: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const imageUrl = publicUrlData.publicUrl;

    // 3. Insert post into 'posts' table
    const { error: insertError } = await supabase.from('posts').insert([{
        user_id: userId, // ✅ Correctly using the logged-in user's ID
        caption,
        post_image_url: imageUrl,
        hashtags,
        likes_count: 0,
    }]);

    if (insertError) {
        console.error('Database Insert Error:', insertError);
        // Clean up uploaded file on insert error (optional but recommended)
        await supabase.storage.from(bucket).remove([filePath]);
        return { success: false, message: `Post creation failed: ${insertError.message}` };
    }

    return { success: true, message: 'Post created successfully!' };
}

export default function NewPostForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            const result = await createPost(formData);
            
            alert(result.message);
            if (result.success) {
                formRef.current?.reset();
            }
        } catch (e) {
            // Catch any unexpected runtime errors
            console.error("Form submission failed:", e);
            alert("An unexpected error occurred during submission.");
        } finally {
            // THIS IS THE KEY FIX: Ensure this always runs!
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Create New Post 🖼️</h2>
            <form ref={formRef} action={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="caption" className="block text-sm font-medium text-gray-700">Caption</label>
                    <textarea id="caption" name="caption" rows={3} required placeholder="What's on your mind?" className="block w-full rounded-md border border-gray-300 p-3 focus:ring-indigo-500" />
                </div>
                <div>
                    <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700">Hashtags</label>
                    <input type="text" id="hashtags" name="hashtags" placeholder="travel, sunset, coding" className="block w-full rounded-md border border-gray-300 p-3 focus:ring-indigo-500" />
                </div>
                <div>
                    <label htmlFor="postImage" className="block text-sm font-medium text-gray-700">Post Image</label>
                    <div className="mt-1 flex items-center space-x-2 border border-dashed border-gray-300 rounded-lg p-4">
                        <Image className="h-6 w-6 text-indigo-500" />
                        <input type="file" id="postImage" name="postImage" accept="image/*" required className="block w-full cursor-pointer text-gray-500" />
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:bg-indigo-400"
                >
                    {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sharing...</>
                    ) : (
                        <><Send className="mr-2 h-4 w-4" /> Share Post</>
                    )}
                </button>
            </form>
        </div>
    );
}