import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { Post, Comment } from '@/types';
import { useAuth } from '@/components/AuthContext';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  comments?: Comment[];
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onShare, 
  onComment,
  comments = []
}) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      await onComment(post.id, commentText);
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayName = () => {
    if (post.author?.is_staff && post.author?.staff_name) {
      return post.author.staff_name;
    }
    return post.organization?.name || 'Unknown Organization';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.author?.avatar_url} />
            <AvatarFallback>
              {getDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{getDisplayName()}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(post.created_at)}
              {post.author?.is_staff && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Staff
                </span>
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-foreground leading-relaxed">{post.content}</p>
        </div>

        {post.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={post.image_url} 
              alt="Post image" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Engagement Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 ${post.user_liked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-5 w-5 ${post.user_liked ? 'fill-current' : ''}`} />
              <span>{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(post.id)}
              className={`flex items-center space-x-2 ${post.user_shared ? 'text-blue-500' : ''}`}
            >
              <Share2 className="h-5 w-5" />
              <span>{post.shares_count}</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            {/* Add Comment */}
            {user && (
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim() || submittingComment}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.avatar_url} />
                    <AvatarFallback>
                      {comment.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{comment.user?.name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;