"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  User, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronRight,
  Home,
  Calendar,
  Users
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import supabase from "@/api/client";
import AuthContent from "@/components/auth/Auth";
import ProfileSettingsForm from "@/components/form/profilesetting/ProfileSettingsForm";
import Logo from "../../../public/optimuslogo.png";

// Mocking imports since we are in a single-file environment
// In your real project, keep your existing imports for supabase, Link, useRouter, etc.
type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const Link = ({ href, children, className, onClick }: LinkProps) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);

const Navbar = () => {
    // --- State Management ---
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Defaulted for preview
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

    const router = useRouter();

    // --- Navigation Items ---
    useEffect(() => {
        const loadSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const uid = session.user.id;
                setIsLoggedIn(true);
                setUserId(uid);
                const { role, avatar } = await fetchUserProfile(uid);
                setUserRole(role);
                setAvatarUrl(avatar);
                setName(name); // Assuming name is stored in user_metadata
            }
        };

        loadSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    const uid = session.user.id;
                    setIsLoggedIn(true);
                    setUserId(uid);
                    const { role, avatar } = await fetchUserProfile(uid);
                    setUserRole(role);
                    setAvatarUrl(avatar);
                    setName(name); 
                } else {
                    setIsLoggedIn(false);
                    setUserId(null);
                    setUserRole(null);
                    setAvatarUrl("https://via.placeholder.com/150/007bff/ffffff?text=U");
                }
            }
        );

        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (id: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("role_type, avatar_url,name")
            .eq("uuid", id)
            .single();

        if (error) {
            console.error(error);
            return {
                role: null,
                avatar: "https://via.placeholder.com/150/007bff/ffffff?text=U",
                name: "",
            };
        }
        // setName(data?.name || "");
        // setAvatarUrl(data?.avatar_url || "https://via.placeholder.com/150/007bff/ffffff?text=U");
        // setUserRole(data?.role_type || null);

        return {
            role: data?.role_type || null,
            avatar: data?.avatar_url || "https://via.placeholder.com/150/007bff/ffffff?text=U",
            name : data?.name || "",
        };
    };

    const handleAuthSuccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setIsLoggedIn(true);
        setUserId(user.id);

        const { role, avatar } = await fetchUserProfile(user.id);
        setUserRole(role);
        setAvatarUrl(avatar);
        setName(name);

        router.push(`/dashboard/${user.id}`);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Logout error:", error.message);
            return;
        }

        // Reset state
        setIsLoggedIn(false);
        setUserRole(null);
        setUserId(null);
        setName("");
        setAvatarUrl("https://via.placeholder.com/150/007bff/ffffff?text=U");

        // Close UI
        setIsSidebarOpen(false);
        setIsSettingModalOpen(false);

        router.push("/");
    };


    const mainNavLinks = [
        { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
        { name: "Events", href: "/event-page", icon: <Calendar className="w-5 h-5" /> },
        { name: "Join Us", href: "/form/joinus", icon: <Users className="w-5 h-5" /> },
    ];

    const dashboardHref = userId ? `/dashboard/${userId}` : "/dashboard";
    const adminDashboardHref = userId ? `/admin-dashboard/${userId}` : "/admin-dashboard";

    const sidebarItems = [
        { name: "My Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
        { name: "User Dashboard", href: dashboardHref, icon: <LayoutDashboard className="w-5 h-5" /> },
    ];

    if (userRole === "admin" || userRole === "organiser") {
        sidebarItems.splice(1, 0, { 
            name: "Admin Panel", 
            href: adminDashboardHref, 
            icon: <Settings className="w-5 h-5" /> 
        });
    }

    // Close sidebar on window resize if it's open
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="bg-gray-950 text-white font-sans pt-10">
            {/* Main Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-[50] backdrop-blur-xl bg-gray-900/60 border-b border-white/10 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-15 flex items-center justify-between">
                    
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center space-x-1 group">
                        <img src={Logo.src} alt="Optimus Logo" className="w-12 h-14 group-hover:animate-pulse" />
                    </Link>

                    {/* Desktop Center Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {mainNavLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href} 
                                className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center space-x-4">
                        {!isLoggedIn ? (
                            <button 
                                onClick={() => router.push("/auth")}
                                className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-bold hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                            >
                                Sign In
                            </button>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-1 rounded-full border-2 border-transparent hover:border-cyan-500/50 transition-all"
                                >
                                    {/* <img 
                                        src={avatarUrl} 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full object-cover bg-gray-800" 
                                    /> */}
                                </button>
                                
                                {/* Professional Toggle Button (The "Three Lines") */}
                                <button 
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Full-Height Professional Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                        />

                        {/* Sidebar Panel */}
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[300px] sm:w-[380px] bg-gray-900 border-l border-white/10 z-[120] shadow-2xl flex flex-col"
                        >
                            {/* Sidebar Header */}
                            {!isLoggedIn ? (
                                <button 
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-bold hover:bg-cyan-400 transition-all"
                                >
                                    Sign In
                                </button>
                                ) : (
                                <div className="p-6 flex items-center justify-between border-b border-white/5">
  
                                {/* Left Section (Avatar + Name + Role) */}
                                <div className="flex items-center space-x-3">
                                    <img 
                                    src={avatarUrl || "/default-avatar.png"} 
                                    alt="Profile" 
                                    className="w-12 h-12 rounded-xl object-cover bg-gray-800 border border-white/10"
                                    />

                                    <div className="flex flex-col">
                                    <h3 className="text-white font-semibold text-sm">
                                        {name ? `Welcome ${name}` : "Welcome"}
                                    </h3>
                                    <p className="text-gray-400 text-xs capitalize">
                                        {userRole || "user"}
                                    </p>
                                    </div>
                                </div>

                                {/* Right Section (Close Button) */}
                                <button 
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                </button>

                                </div>
                            )}

                            {/* Sidebar Content */}
                            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8">
                                {/* Mobile-only links (Home, Events etc) */}
                                <div className="md:hidden space-y-2">
                                    <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[2px] mb-4">Navigation</p>
                                    {mainNavLinks.map((item) => (
                                        <Link 
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 group transition-all"
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-cyan-400 transition-colors">
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium text-gray-300 group-hover:text-white">{item.name}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>

                                {/* Account Links */}
                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[2px] mb-4">Account & Dashboard</p>
                                    {sidebarItems.map((item) => (
                                        <Link 
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 group transition-all underline-none"
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-cyan-400 transition-colors">
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium text-gray-300 group-hover:text-white">{item.name}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                    
                                    <button 
                                        onClick={() => {
                                            setIsSidebarOpen(false);
                                            setIsSettingModalOpen(true);
                                        }}
                                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 group transition-all"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-cyan-400 transition-colors">
                                                <Settings className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-gray-300 group-hover:text-white">Settings</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-6 border-t border-white/5 bg-gray-950/50">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center space-x-3 p-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all font-bold group"
                                >
                                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    <span>Sign Out</span>
                                </button>
                                <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest">
                                    Optimus v2.4.0
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {/* Settings Modal */}
            {userId && (
                <Dialog open={isSettingModalOpen} onOpenChange={setIsSettingModalOpen}>
                    <DialogContent className="sm:max-w-md p-0 bg-transparent border-none z-[100] overflow-scroll">
                        <ProfileSettingsForm
                            userId={userId}
                            onUpdateComplete={() => setIsSettingModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
            {/* Auth Modal */}
            {!isLoggedIn && (
                <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                    <DialogContent
                        className="
                        w-full
                        h-screen 
                        max-w-none 
                        max-h-none 
                        p-0 
                        bg-transparent 
                        border-none 
                        overflow-hidden
                        "
                    >
                        <AuthContent onSuccess={handleAuthSuccess} />
                    </DialogContent>
                </Dialog>
            )}

            
            
        </div>
    );
};

export default Navbar;