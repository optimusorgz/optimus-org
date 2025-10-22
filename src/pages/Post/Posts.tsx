import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Building2, Users, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/posts/PostCard';
import CreatePostModal from '@/components/posts/CreatePostModal';
import { useToast } from '@/hooks/use-toast';

const Posts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userOrganization, setUserOrganization] = useState<any>(null);

  const { posts, loading, likePost, sharePost, addComment, refetch } = usePosts();

  useEffect(() => {
    fetchOrganizations();
    if (user) {
      fetchUserOrganization();
    }
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('status', 'approved')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchUserOrganization = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('organisation_uuid, organizations:organisation_uuid(name, uuid)')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user organization:', error);
        return;
      }

      if (data?.organisation_uuid) {
        setUserOrganization(data.organizations);
      }
    } catch (error) {
      console.error('Error in fetchUserOrganization:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.organization?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOrg = selectedOrganization === 'all' || 
      post.organisation_id === selectedOrganization;

    return matchesSearch && matchesOrg;
  });

  const handleCreatePost = () => {
    if (!userOrganization) {
      toast({
        title: "Organization Required",
        description: "You need to join an organization to create posts.",
        variant: "destructive",
      });
      return;
    }
    setShowCreatePost(true);
  };

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-glow mb-2">
                Community Posts
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground">
                Stay updated with the latest from organizations
              </p>
            </div>
            {userOrganization && (
              <Button onClick={handleCreatePost} className="btn-hero w-full md:w-auto mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Filter by organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.uuid} value={org.uuid}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedOrganization !== 'all' 
                    ? 'No posts match your current filters.' 
                    : 'No posts have been created yet.'}
                </p>
                {userOrganization && (
                  <Button onClick={handleCreatePost} className="btn-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
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

          {/* Create Post Modal */}
          {userOrganization && (
            <CreatePostModal
              isOpen={showCreatePost}
              onClose={() => setShowCreatePost(false)}
              organizationUuid={userOrganization.uuid}
              onPostCreated={refetch}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Posts;