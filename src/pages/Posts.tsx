import { useState } from "react";
import { Heart, MessageCircle, Share2, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const Posts = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: "Alex Chen",
        avatar: "/placeholder.svg",
        role: "AI Research Lead"
      },
      content: "Just wrapped up an amazing machine learning workshop! The enthusiasm from everyone was incredible. Looking forward to seeing the projects you all build. 🚀",
      image: "/placeholder.svg",
      likes: 42,
      comments: 8,
      timestamp: "2 hours ago",
      tags: ["Workshop", "Machine Learning"],
      liked: false,
      showComments: false,
      commentsList: [
        { id: 1, author: "Sarah Kim", content: "Great session! The neural network explanation was super clear.", timestamp: "1 hour ago" },
        { id: 2, author: "Mike Johnson", content: "When's the next one? Can't wait!", timestamp: "45 min ago" }
      ]
    },
    {
      id: 2,
      author: {
        name: "Dr. Sarah Wilson",
        avatar: "/placeholder.svg",
        role: "Cybersecurity Expert"
      },
      content: "Cybersecurity Bootcamp registration is now open! We'll cover ethical hacking, penetration testing, and security best practices. Limited spots available - register now!",
      image: "/placeholder.svg",
      likes: 67,
      comments: 15,
      timestamp: "1 day ago",
      tags: ["Cybersecurity", "Bootcamp", "Registration"],
      liked: true,
      showComments: false,
      commentsList: [
        { id: 1, author: "John Doe", content: "Just registered! Can't wait to learn about ethical hacking.", timestamp: "20 hours ago" },
        { id: 2, author: "Emma Davis", content: "This looks amazing! Will there be hands-on labs?", timestamp: "18 hours ago" },
        { id: 3, author: "Dr. Sarah Wilson", content: "@Emma Davis Yes! Lots of practical exercises and real-world scenarios.", timestamp: "17 hours ago" }
      ]
    },
    {
      id: 3,
      author: {
        name: "Optimus Team",
        avatar: "/placeholder.svg",
        role: "Club Official"
      },
      content: "🎉 Hackathon 2024 was a huge success! Over 100 participants, 25 amazing projects, and countless innovations. Congratulations to all teams for their incredible dedication and creativity!",
      image: "/placeholder.svg",
      likes: 156,
      comments: 32,
      timestamp: "3 days ago",
      tags: ["Hackathon", "Success", "Innovation"],
      liked: false,
      showComments: false,
      commentsList: [
        { id: 1, author: "Team Alpha", content: "Thank you for organizing such an amazing event!", timestamp: "2 days ago" },
        { id: 2, author: "Lisa Park", content: "Best hackathon ever! Already excited for next year.", timestamp: "2 days ago" }
      ]
    }
  ]);

  const [newComment, setNewComment] = useState("");

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likes: post.liked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const toggleComments = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, showComments: !post.showComments }
        : post
    ));
  };

  const addComment = (postId: number) => {
    if (!newComment.trim()) return;
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: post.comments + 1,
            commentsList: [
              { id: Date.now(), author: "You", content: newComment, timestamp: "Just now" },
              ...post.commentsList
            ]
          }
        : post
    ));
    setNewComment("");
  };

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <h1 className="text-4xl font-bold text-glow mb-4">Community Posts</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest news, announcements, and discussions from the Optimus community.
          </p>
        </div>

        {/* Posts Feed */}
        <div className="space-y-8">
          {posts.map((post, index) => (
            <Card 
              key={post.id} 
              className="card-modern fade-up overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {post.author.role}
                      </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {post.timestamp}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Post Content */}
                <p className="text-foreground leading-relaxed">{post.content}</p>

                {/* Post Image */}
                {post.image && (
                  <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 h-64 flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-primary/60" />
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} className="bg-primary/20 text-primary hover:bg-primary/30">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-all duration-300 ${
                        post.liked 
                          ? 'text-danger hover:text-danger' 
                          : 'text-muted-foreground hover:text-danger'
                      }`}
                    >
                      <Heart className={`h-5 w-5 transition-all duration-300 ${
                        post.liked ? 'fill-current scale-110' : ''
                      }`} />
                      <span>{post.likes}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {post.showComments && (
                  <div className="space-y-4 pt-4 border-t border-border/50 fade-up">
                    {/* Add Comment */}
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] bg-muted/20 border-border/50 focus:border-primary resize-none"
                        />
                        <Button 
                          onClick={() => addComment(post.id)}
                          size="sm"
                          className="btn-hero"
                          disabled={!newComment.trim()}
                        >
                          Comment
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {post.commentsList.map((comment) => (
                        <div key={comment.id} className="flex space-x-3 fade-up">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {comment.author.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted/20 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm text-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Posts;