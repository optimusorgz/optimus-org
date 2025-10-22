import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield, Building2, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userOrganisation, setUserOrganisation] = useState<any>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();

          setIsAdmin(profile?.role === "admin");

          // Check if user has an organisation
          const { data: organisation } = await supabase
            .from("organizations")
            .select("*")
            .eq("owner_id", user.id)
            .single();

          setUserOrganisation(organisation);
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:glow-primary transition-all duration-300">
              <span className="text-primary-foreground font-bold text-lg">O</span>
            </div>
            <span className="text-xl font-bold text-glow">Optimus</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center w-full relative">

            {/* Centered Links */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8">
              <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
              <Link to="/events" className="text-sm font-medium hover:text-primary">Events</Link>
              <Link to="/posts" className="text-sm font-medium hover:text-primary">Posts</Link>
              <Link to="/gallery" className="text-sm font-medium hover:text-primary">Gallery</Link>
              <Link to="/join-us" className="text-sm font-medium hover:text-primary">Join Us</Link>
            </div>

            {/* Right Side */}
            <div className="ml-auto flex items-center space-x-4">
              <ThemeToggle />

              {/* Create Event Button */}
              {userOrganisation && userOrganisation.status === 'approved' && (
                <Button asChild className="btn-hero hidden lg:flex">
                  <Link to="/create-event">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              )}

              {/* User Dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.user_metadata?.name || user.email}
                        />
                        <AvatarFallback>
                          {(user.user_metadata?.name || user.email || "").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="btn-hero">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.name || user.email}
                      />
                      <AvatarFallback>
                        {(user.user_metadata?.name || user.email || "").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col items-center space-y-2 px-4 py-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.name || user.email}
                      />
                      <AvatarFallback>
                        {(user.user_metadata?.name || user.email || "").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-lg font-medium">{user.user_metadata?.name || "User"}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>

                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>

                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="btn-hero border border-primary px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90"
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
