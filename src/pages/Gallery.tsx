import { useState } from "react";
import { Search, Filter, X, Calendar, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "workshops", "hackathons", "events", "team"];

  const galleryItems = [
    {
      id: 1,
      title: "AI/ML Workshop 2024",
      category: "workshops",
      date: "September 2024",
      participants: 50,
      description: "Intensive hands-on workshop covering machine learning fundamentals and practical applications.",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Hackathon Opening Ceremony",
      category: "hackathons",
      date: "October 2024",
      participants: 120,
      description: "The exciting kickoff to our 48-hour hackathon with over 100 participants.",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Team Building Event",
      category: "team",
      date: "August 2024",
      participants: 25,
      description: "Annual team building activities to strengthen bonds and collaboration.",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Cybersecurity Bootcamp",
      category: "workshops",
      date: "November 2024",
      participants: 40,
      description: "Comprehensive cybersecurity training with real-world scenarios.",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Tech Talk: Future of AI",
      category: "events",
      date: "September 2024",
      participants: 200,
      description: "Inspiring talk about the future of artificial intelligence and its applications.",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Project Showcase",
      category: "events",
      date: "December 2024",
      participants: 80,
      description: "Students presenting their innovative projects to the community.",
      image: "/placeholder.svg"
    },
    {
      id: 7,
      title: "Code Review Session",
      category: "workshops",
      date: "October 2024",
      participants: 30,
      description: "Interactive session on best practices for code review and collaboration.",
      image: "/placeholder.svg"
    },
    {
      id: 8,
      title: "Hackathon Winners",
      category: "hackathons",
      date: "October 2024",
      participants: 15,
      description: "Celebrating the winners of our annual hackathon competition.",
      image: "/placeholder.svg"
    },
    {
      id: 9,
      title: "Club Anniversary",
      category: "team",
      date: "June 2024",
      participants: 100,
      description: "Celebrating 5 years of innovation and technical excellence.",
      image: "/placeholder.svg"
    }
  ];

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "workshops": "bg-primary/20 text-primary",
      "hackathons": "bg-success/20 text-success",
      "events": "bg-warning/20 text-warning",
      "team": "bg-danger/20 text-danger"
    };
    return colors[category] || "bg-muted/20 text-muted-foreground";
  };

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <h1 className="text-4xl md:text-5xl font-bold text-glow mb-6">
            Event <span className="text-primary">Gallery</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore memories from our workshops, hackathons, and community events. 
            See the innovation and collaboration that defines the Optimus experience.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border/50 p-6 mb-8 fade-up">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gallery..."
                className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "btn-hero" : "btn-outline-hero"}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 fade-up">
          <p className="text-muted-foreground">
            Showing {filteredItems.length} of {galleryItems.length} items
          </p>
          <Button variant="outline" size="sm" className="btn-outline-hero">
            <Filter className="h-4 w-4 mr-2" />
            Sort by Date
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id} 
              className="group cursor-pointer fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 aspect-video">
                {/* Placeholder Image */}
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-primary/60" />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Info */}
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {item.participants} people
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 fade-up">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="btn-hero"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-md border-border">
          {selectedImage && (
            <div className="space-y-4">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Image */}
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl aspect-video flex items-center justify-center">
                <Calendar className="h-24 w-24 text-primary/60" />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
                  <Badge className={getCategoryColor(selectedImage.category)}>
                    {selectedImage.category}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">{selectedImage.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedImage.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{selectedImage.participants} participants</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;