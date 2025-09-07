import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/3 right-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-1000" />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        <div className="fade-up">
          {/* 404 Display */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary/20 mb-4">404</h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>
          
          {/* Error Message */}
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, 
              deleted, or you entered the wrong URL.
            </p>
            <div className="text-sm text-muted-foreground bg-card/30 rounded-lg p-3 border border-border/50">
              <span className="font-mono text-danger">
                {location.pathname}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild className="btn-hero">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="btn-outline-hero">
              <Link to="/events">
                <Search className="h-4 w-4 mr-2" />
                Browse Events
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-muted-foreground mb-4">You might be looking for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { name: "Events", path: "/events" },
                { name: "Gallery", path: "/gallery" },
                { name: "Team", path: "/team" },
                { name: "Join Us", path: "/join" },
                { name: "Posts", path: "/posts" }
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm text-primary hover:text-primary/80 underline transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
