  import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { motion } from 'framer-motion';
  import { Plus, Calendar, Activity, CheckCircle, FileText, Camera, Building2, Users, UserPlus, Copy, Check, Trash2 } from 'lucide-react';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Badge } from '@/components/ui/badge';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
  import { useAuth } from '@/components/AuthContext';
  import { supabase } from '@/integrations/supabase/client';
  import { useToast } from '@/hooks/use-toast';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

  interface Event {
    id: string;
    title: string;
    description: string;
    category: string;
    start_date: string;
    end_date: string;
    location: string;
    organizer_name: string;
    max_participants: number;
    ticket_price: number;
    status: string;
    created_by: string;
  }

  interface Organisation {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
    avatar_url?: string;
    owner_id: string;
  }

  interface Post {
    id: string;
    title: string;
    content: string;
    image_url?: string;
    created_at: string;
    author_id: string;
    organisation_id: string;
  }

  interface OrganizationMember {
    id: string;
    user_id: string;
    role: 'main_organiser' | 'organiser' | 'pending';
    joined_at: string;
    user_name: string;
    user_email: string;
    user_avatar: string | null;
  }

  const OrganisationDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteLink, setInviteLink] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string>('');
    const [linkType, setLinkType] = useState<'member' | 'admin' | null>(null);

    const [stats, setStats] = useState({
      totalEvents: 0,
      approvedEvents: 0,
    });

    useEffect(() => {
      if (user) checkOrganisationAccess();
    }, [user]);

    // React Query hooks
    const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery({
      queryKey: ['organisation-posts', organisation?.id],
      queryFn: async () => {
        if (!organisation?.id) return [];
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('organisation_id', organisation.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Post[];
      },
      enabled: !!organisation?.id,
    });

    const { data: members = [] } = useQuery({
      queryKey: ['organisation-members', organisation?.id],
      queryFn: async () => {
        if (!organisation?.id) return [];
        const { data, error } = await supabase
          .rpc('get_organization_members', { org_id: organisation.id });
        
        if (error) throw error;
        return data as OrganizationMember[];
      },
      enabled: !!organisation?.id,
    });

    // Delete post mutation
    const deletePostMutation = useMutation({
      mutationFn: async (postId: string) => {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organisation-posts', organisation?.id] });
        toast({
          title: "Success",
          description: "Post deleted successfully.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete post.",
          variant: "destructive",
        });
      },
    });

    const checkOrganisationAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (orgError || !orgData) {
          toast({
            title: "No Organisation Found",
            description: "You need to register an organisation first.",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }

        if (orgData.status !== 'approved') {
          toast({
            title: "Organisation Not Approved",
            description: "Your organisation is still pending approval.",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }

        setOrganisation(orgData);
        await Promise.all([
          fetchOrganisationEvents(orgData.id),
          fetchStats(orgData.id)
        ]);
      } catch (error) {
        console.error('Error checking organisation access:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    const fetchOrganisationEvents = async (organisationId: string) => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('organization_id', organisationId)
          .order('start_date', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching organisation events:', error);
      }
    };

    const fetchStats = async (organisationId: string) => {
      try {
        const [eventsData] = await Promise.all([
          supabase.from('events').select('id, status').eq('organization_id', organisationId),
        ]);

        const totalEvents = eventsData.data?.length || 0;
        const approvedEvents = eventsData.data?.filter(e => e.status === 'approved').length || 0;

        setStats({ totalEvents, approvedEvents });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const getCategoryColor = (category: string) => {
      const colors: { [key: string]: string } = {
        "Workshop": "bg-primary/20 text-primary",
        "Tech Talk": "bg-success/20 text-success",
        "Hackathon": "bg-warning/20 text-warning",
        "Bootcamp": "bg-danger/20 text-danger",
      };
      return colors[category] || "bg-muted/20 text-muted-foreground";
    };

    const generateInviteLink = async () => {
      if (!organisation?.id) return;
      
      try {
        const { data, error } = await supabase
          .rpc('generate_org_invite_token', { org_id: organisation.id });

        if (error) throw error;

        const link = `${window.location.origin}/register-organization?invite=${data}`;
        setInviteLink(link);
        setShowInviteModal(true);
      } catch (error) {
        console.error('Error generating invite link:', error);
        toast({
          title: "Error",
          description: "Failed to generate invite link.",
          variant: "destructive",
        });
      }
    };

    const generateAccessLink = async (role: 'member' | 'admin') => {
      if (!organisation?.id) return;
      
      try {
        const link = `${window.location.origin}/register-organization?orgId=${organisation.id}&role=${role}`;
        setGeneratedLink(link);
        setLinkType(role);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(link);
        
        toast({
          title: "Link Generated & Copied!",
          description: `${role === 'admin' ? 'Admin' : 'Member'} access link has been copied to clipboard.`,
        });
      } catch (error) {
        console.error('Error generating access link:', error);
        toast({
          title: "Error",
          description: "Failed to generate access link.",
          variant: "destructive",
        });
      }
    };

    const copyInviteLink = async () => {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Invite link copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link.",
          variant: "destructive",
        });
      }
    };

    const handleDeletePost = (postId: string) => {
      deletePostMutation.mutate(postId);
    };

    const approveMember = async (memberUserId: string) => {
      if (!organisation?.id || !user) return;
      
      try {
        const { data, error } = await supabase
          .rpc('approve_member', {
            org_id: organisation.id,
            member_user_id: memberUserId,
            approver_user_id: user.id
          });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Success",
            description: "Member approved successfully.",
          });
          queryClient.invalidateQueries({ queryKey: ['organisation-members', organisation.id] });
        } else {
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error approving member:', error);
        toast({
          title: "Error",
          description: "Failed to approve member.",
          variant: "destructive",
        });
      }
    };

    if (loading) {
      return (
        <div className="min-h-screen pt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Organisation Dashboard
                </h1>
                <p className="text-sm md:text-lg text-muted-foreground">
                  Manage {organisation?.name} events and posts
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
                <Button onClick={() => navigate('/create-event')} className="btn-hero w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
                <Button
                  onClick={() => navigate('/create-post', { state: { organisationId: organisation?.id } })}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </div>
            {/* Organization Profile Card - Merged */}
            {organisation && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Organization Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={organisation.avatar_url} alt={organisation.name} />
                      <AvatarFallback>
                        <Building2 className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{organisation.name}</h3>
                      {organisation.description && (
                        <p className="text-muted-foreground">{organisation.description}</p>
                      )}
                      <Badge variant={organisation.status === 'approved' ? 'default' : 'secondary'}>
                        {organisation.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Main Organizer */}
                  {members.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Team Members</h4>
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user_avatar} />
                              <AvatarFallback>
                                {member.user_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{member.user_name}</p>
                              <p className="text-sm text-muted-foreground">{member.user_email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={member.role === 'main_organiser' ? 'default' : 'outline'}>
                                {member.role === 'main_organiser' ? 'Main' : member.role === 'organiser' ? 'Organizer' : 'Pending'}
                              </Badge>
                              {member.role === 'pending' && organisation.owner_id === user?.id && (
                                <Button
                                  size="sm"
                                  onClick={() => approveMember(member.user_id)}
                                >
                                  Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Access Link Generation Buttons */}
                  {organisation.owner_id === user?.id && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Generate Access Links</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          onClick={() => generateAccessLink('member')}
                          variant="outline"
                          className="w-full"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Generate Member Access Link
                        </Button>
                        <Button
                          onClick={() => generateAccessLink('admin')}
                          variant="outline"
                          className="w-full"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Generate Admin Access Link
                        </Button>
                      </div>
                      <Button
                        onClick={generateInviteLink}
                        className="w-full"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Generate Organizer Invite Link
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}


            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-8">
              <Card className="hover-scale">
                <CardContent className="p-4 lg:p-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Total Events</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.totalEvents}</p>
                  </div>
                  <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardContent className="p-4 lg:p-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Approved Events</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.approvedEvents}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
                </CardContent>
              </Card>
            </div>

            {/* Events Section */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Organisation Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No events created yet.</p>
                    <Button onClick={() => navigate('/create-event')} className="mt-4 btn-hero">
                      Create Your First Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map(event => (
                      <div key={event.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                        <div className="flex-1 mb-2 md:mb-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm md:text-base">{event.title}</h4>
                            <Badge className={getCategoryColor(event.category || "Workshop")}>{event.category || "Workshop"}</Badge>
                            <Badge variant={event.status === 'approved' ? 'default' : 'secondary'}>{event.status}</Badge>
                            {event.ticket_price && event.ticket_price > 0 && (
                              <Badge variant="outline">₹{event.ticket_price}</Badge>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {formatDate(event.start_date)} • {event.location || "Online"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/edit-event/${event.id}`, { state: { eventData: event } })}>
                            <Plus className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/events/${event.id}/checkin`)}>
                            <Camera className="h-4 w-4 mr-1" /> Check-in
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Posts Section */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">My Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">Loading posts...</div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No posts created yet.</p>
                    <Button 
                      onClick={() => navigate('/create-post', { state: { organisationId: organisation?.id } })}
                      className="mt-4 btn-hero"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                        <div className="flex-1 mb-2 md:mb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm md:text-base">{post.title}</h4>
                            <Badge variant="outline">
                              {new Date(post.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                            {post.content}
                          </p>
                          {post.image_url && (
                            <div className="mt-2">
                              <img 
                                src={post.image_url} 
                                alt={post.title}
                                className="h-20 w-32 object-cover rounded"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {post.author_id === user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Invite Modal */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Organizer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share this link with someone to invite them as an organizer for {organisation?.name}.
              </p>
              <div className="space-y-2">
                <Label>Invite Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    onClick={copyInviteLink}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• The invited person will need to create an account if they don't have one</p>
                <p>• They will be added as a pending organizer until you approve them</p>
                <p>• Only approved organizers can create events and posts</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  export default OrganisationDashboard;
