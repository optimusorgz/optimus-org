"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import supabaset from "@/api/client";
import AuthContent from "@/components/auth/Auth";
import ProfileSettingsForm from "@/components/form/profilesetting/ProfileSettingsForm";
import Logo from "../../../public/optimuslogo.png";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogHeader,
} from "@/components/ui/dialog";

const mobileLinkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
};

const Navbar: React.FC = () => {
    const router = useRouter();
    const supabase = supabaset;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState(
        "https://via.placeholder.com/150/007bff/ffffff?text=U"
    );
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch profile info
    const fetchUserProfile = async (id: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("role_type, avatar_url")
            .eq("uuid", id)
            .single();

        if (error) {
            console.error(error);
            return {
                role: null,
                avatar: "https://via.placeholder.com/150/007bff/ffffff?text=U",
            };
        }

        return {
            role: data?.role_type || null,
            avatar: data?.avatar_url || "https://via.placeholder.com/150/007bff/ffffff?text=U",
        };
    };

    // Load session and subscribe to auth changes
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
                } else {
                    setIsLoggedIn(false);
                    setUserId(null);
                    setUserRole(null);
                    setAvatarUrl("https://via.placeholder.com/150/007bff/ffffff?text=U");
                }
            }
        );

        return () => listener.subscription.unsubscribe();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAuthSuccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setIsLoggedIn(true);
        setIsAuthModalOpen(false);
        setUserId(user.id);

        const { role, avatar } = await fetchUserProfile(user.id);
        setUserRole(role);
        setAvatarUrl(avatar);

        router.push(`/dashboard/${user.id}`);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setUserRole(null);
        setUserId(null);
        router.push("/");
    };

    // Role-based menu items
    const dashboardHref = userId ? `/dashboard/${userId}` : "/dashboard";

    const menuItems = [
        { name: "Profile", href: "/profile" },
        { name: "Dashboard", href: dashboardHref },
        { name: "Settings", onClick: () => setIsSettingModalOpen(true) },
        { name: "Logout", onClick: handleLogout },
    ];

    if (userRole === "admin" || userRole === "organiser") {
        menuItems.unshift({
            name: "Admin Dashboard",
            href: userId ? `/admin-dashboard/${userId}` : "/admin-dashboard",
        });
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-[99] backdrop-blur-md bg-gray-900/80 border-b border-gray-700 shadow-xl ">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 h-12 md:h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-left">
                    <img src={Logo.src} alt="logo" className="h-12 md:19" />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex space-x-10 text-2xl font-medium">
                    <Link href="/" className="text-gray-300 hover:text-cyan-400">Home</Link>
                    <Link href="/event-page" className="text-gray-300 hover:text-cyan-400">Events</Link>
                    <Link href="/form/joinus" className="text-gray-300 hover:text-cyan-400">Join Us</Link>
                </div>

                {/* Right Side */}
                <div className="flex items-center space-x-2">

                    {/* If not logged in */}
                    {!isLoggedIn && (
                        <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                            <DialogTrigger asChild>
                                <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-full text-white text-sm">
                                    Sign In
                                </button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[425px] p-0 bg-transparent border-none">
                                <DialogHeader className="sr-only">
                                    <DialogTitle>Login</DialogTitle>
                                </DialogHeader>
                                <AuthContent onSuccess={handleAuthSuccess} />
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Profile avatar + dropdown */}
                    {isLoggedIn && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center"
                            >
                                <img
                                    src={avatarUrl}
                                    className="h-9 w-9 md:w-12 md:h-12 rounded-full border-2 border-cyan-400"
                                />
                            </button>

                            {/* Desktop Dropdown */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-[9999] overflow-hidden"
                                    >
                                        {menuItems.map((item) => (
                                            <div key={item.name}>
                                                {item.href ? (
                                                    <Link
                                                        href={item.href}
                                                        className="block px-4 py-2 text-sm hover:bg-gray-700"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={item.onClick}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                                    >
                                                        {item.name}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="md:hidden border-t border-gray-700 p-4 space-y-2"
                    >
                        <Link href="/" className="block text-gray-300">Home</Link>
                        <Link href="/event-page" className="block text-gray-300">Events</Link>
                        <Link href="/form/joinus" className="block text-gray-300">Join Us</Link>

                        {menuItems.map((item) => (
                            <motion.div key={item.name} variants={mobileLinkVariants}>
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className="block w-full text-left px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-gray-800 rounded-md"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => item.onClick?.()}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                    >
                                        {item.name}
                                    </button>

                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            {userId && (
                <Dialog open={isSettingModalOpen} onOpenChange={setIsSettingModalOpen}>
                    <DialogContent className="sm:max-w-md p-0 bg-transparent border-none">
                        <ProfileSettingsForm
                            userId={userId}
                            onUpdateComplete={() => setIsSettingModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </nav>
    );
};

export default Navbar;
