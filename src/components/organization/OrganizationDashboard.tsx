import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Copy, Check, Plus, Calendar, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/posts/PostCard';
import CreatePostModal from '@/components/posts/CreatePostModal';

const OrganizationDashboard = () => {
  const { toast } = useToast();
  const { organization, profile } = useOrganization();
  const { posts, likePost, sharePost, addComment, refetch: refetchPosts } = usePosts(organization?.id);
  
  const [copied, setCopied] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const copyAccessKey = async () => {
    if (!organization?.id) return;

    try {
      await navigator.clipboard.writeText(organization.id);
      setCopied(true);
      toast({
        title: "Access Key Copied!",
        description: "Share this UUID with others to let them join your organization.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy access key.",
        variant: "destructive",
      });
    }
  };

  if (!organization) {
    return (
      <div className="text-center py-16">
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Organization Found</h2>
        <p className="text-muted-foreground">
          You need to create or join an organization to access this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Organization Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={organization.avatar_url} alt={organization.name} />
              <AvatarFallback>
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{organization.name}</h3>
              {organization.description && (
                <p className="text-muted-foreground">{organization.description}</p>
              )}
              <Badge variant={organization.status === 'approved' ? 'default' : 'secondary'}>
                {organization.status}
              </Badge>
            </div>
          </div>

          {/* Access Key */}
          <div className="space-y-2">
            <Label>Organization Access Key</Label>
            <div className="flex gap-2">
              <Input
                value={organization.id}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={copyAccessKey}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this UUID with others to let them join your organization.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Create Event
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowCreatePost(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Post
            </Button>
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Organization Posts</CardTitle>
          <Button onClick={() => setShowCreatePost(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No posts yet.</p>
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="mt-4"
              >
                Create First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={likePost}
                  onShare={sharePost}
                  onComment={addComment}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        organizationUuid={organization.id}
        onPostCreated={refetchPosts}
      />
    </div>
  );
};

export default OrganizationDashboard;