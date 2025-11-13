'use client';
import { useEffect, useState, useCallback } from 'react';
import supabase from '@/api/client'; 
import { Button } from '@/components/ui/button'; 
import { useRouter } from 'next/navigation';

// Existing Dashboard Components
import EventStatsGrid from '@/components/dashboard/EventStatsGrid';
import OrganizationBox from '@/components/dashboard/OrganizationBox';
import UpcomingEventBox from '@/components/dashboard/UpcomingEventBox';
import ParticipatedEventsList from '@/components/dashboard/ParticipatedEventsList';
import HostedEventsList from '@/components/dashboard/HostedEventsList';

// Event Management Components
import EventEditForm from '@/components/dashboard/hostevent/EventEditForm';
import EventRegistrationsView from '@/components/dashboard/hostevent/EventRegistrationsView';

// NEW Post Management Components
import HostedPostsList from '@/components/dashboard/HostedPostsList'; 
import PostEditForm from '@/components/posts/PostEditForm'; 


interface Profile {
    uuid: string;
    name: string;
    email: string;
    avatar_url: string; 
    organisation_id?: string | null;
}
interface Organization {
    id: string;
    name: string;
    details: string;
}

// 🔑 Event interface
interface Event {
    id: string; 
    name: string;
    date: string;
    type: 'Participated' | 'Hosted';
    ticket_uid?: string;
}

// 🔑 NEW: Post interface
interface Post {
    id: string;
    title: string; // Will hold the truncated caption
    created_at: string;
}

// --- Define Active Mode Types ---
type DashboardMode = 'list' | 'edit' | 'registrations';
type PostMode = 'list' | 'edit';
// -----------------------------------


interface CreateEventButtonProps {
    organization: Organization | null;
    onClick: () => void;
}

const CreateEventButton: React.FC<CreateEventButtonProps> = ({ organization, onClick }) => {
    const router = useRouter(); 
    
    const handleclick = () => {
        router.push('/form/create-event');
    }

    return (
        <div className="relative inline-block group">
            <Button
                onClick={handleclick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
            >
                Create New Event
            </Button>
        </div>
    );
};


const DashboardPage = () => {
    const router = useRouter(); 
    const [profile, setProfile] = useState<Profile | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null); 
    
    const [participatedEvents, setParticipatedEvents] = useState<Event[]>([]);
    const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
    const [hostedPosts, setHostedPosts] = useState<Post[]>([]); // Post Data

    const [loading, setLoading] = useState(true);
    
    // --- STATE: To manage Event dashboard view ---
    const [activeMode, setActiveMode] = useState<DashboardMode>('list');
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    
    // --- STATE: To manage Post dashboard view ---
    const [activePostMode, setActivePostMode] = useState<PostMode>('list');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);


    // --- EVENT HANDLERS ---
    const handleEditEvent = useCallback((eventId: string) => {
        setSelectedEventId(eventId);
        setActiveMode('edit');
    }, []);

    const handleViewRegistrations = useCallback((eventId: string) => {
        setSelectedEventId(eventId);
        setActiveMode('registrations');
    }, []);
    
    const handleBackToList = useCallback(() => {
        setSelectedEventId(null);
        setActiveMode('list');
    }, []);

    // --- NEW POST HANDLERS ---
    const handleEditPost = useCallback((postId: string) => {
        setSelectedPostId(postId);
        setActivePostMode('edit');
    }, []);

    const handleBackToPostList = useCallback(() => {
        setSelectedPostId(null);
        setActivePostMode('list');
    }, []);


    // --- FETCH FUNCTIONS ---
    const fetchParticipatedEvents = async (userId: string) => {
        // ... (existing fetch logic) ...
        const { data, error } = await supabase
            .from('event_registrations')
            .select(`
                ticket_uid,
                status,
                is_paid,
                event_id:events (
                    id,
                    title, 
                    start_date
                )
            `)
            .eq('user_id', userId); 

        if (error) {
            console.error("Supabase Participated Events Fetch Error:", error.message);
            return [];
        }
        
        return data.map((item: any) => ({
            id: item.event_id.id,
            name: item.event_id.title, 
            date: new Date(item.event_id.start_date).toLocaleDateString(), 
            type: 'Participated' as const,
            ticket_uid: item.ticket_uid,
            status: item.status,
            is_paid: item.is_paid,
        }));
    };
    
    const fetchHostedEvents = async (userId: string) => {
        // ... (existing fetch logic) ...
        const { data, error } = await supabase
            .from('events')
            .select(`id, title, start_date`)
            .eq('created_by', userId)
            .order('start_date', { ascending: true });
            
        if (error) {
            console.error("Supabase Hosted Events Fetch Error:", error.message);
            return [];
        }

        return data.map((item: any) => ({
            id: item.id,
            name: item.title,
            date: new Date(item.start_date).toLocaleDateString(),
            type: 'Hosted' as const,
        }));
    };

    // Inside DashboardPage component
    const handleDeletePost = async (postId: string) => {
    if (!profile) return;

    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', profile.uuid); // ensures RLS checks ownership

    if (error) {
        console.error("Error deleting post:", error.message);
        alert("Failed to delete post. Check console for details.");
        return;
    }

    // Remove deleted post from local state
    setHostedPosts(prev => prev.filter(post => post.id !== postId));
    };

    
    const fetchHostedPosts = async (userId: string) => {
        const { data, error } = await supabase
            .from('posts')
            .select(`id, caption, created_at`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error("Supabase Hosted Posts Fetch Error:", error.message);
            return [];
        }

        return data.map((item: any) => ({
            id: item.id,
            title: (item.caption as string).substring(0, 50) + ((item.caption.length > 50) ? '...' : ''),
            created_at: new Date(item.created_at).toLocaleDateString(),
        }));
    };


    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                router.push('/login'); 
                setLoading(false);
                return;
            }
            
            const userId = session.user.id;
            
            // --- 1. Fetch Profile Data ---
            const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select(`uuid, name, email, avatar_url, organisation_id, organization:organizations(id, name, description)`)
            .eq('uuid', userId)
            .single();
            
            if (profileError) {
                console.error("Supabase Profile Fetch Error:", profileError.message || JSON.stringify(profileError));            
            }
            
            if (profileData) {
                const fetchedProfile: Profile = {
                    uuid: profileData.uuid,
                    name: profileData.name || 'User',
                    email: profileData.email,
                    avatar_url: profileData.avatar_url || '',
                    organisation_id: profileData.organisation_id,
                };
                setProfile(fetchedProfile);
                
                if (profileData.organization && Array.isArray(profileData.organization) && profileData.organization.length > 0) {
                    const orgData = profileData.organization[0];
                    setOrganization({
                        id: orgData.id,
                        name: orgData.name,
                        details: orgData.description,
                    });
                } else {
                    setOrganization(null);
                }
                
                // --- 2. Fetch Event Data (Participated & Hosted) ---
                const [pEvents, hEvents, hPosts] = await Promise.all([
                    fetchParticipatedEvents(userId),
                    fetchHostedEvents(userId),
                    fetchHostedPosts(userId), // Fetch posts concurrently
                ]);

                setParticipatedEvents(pEvents);
                setHostedEvents(hEvents);
                setHostedPosts(hPosts); // Set post data
            }
            
            setLoading(false);
        };
        
        fetchUserData();
    }, [router]);


    const handleCreateEvent = () => {
        if (organization) {
            router.push('/form/create-event');
        }
    };

    const PARTICIPATED_COUNT = participatedEvents.length;
    const HOSTED_EVENT_COUNT = hostedEvents.length;
    const HOSTED_POST_COUNT = hostedPosts.length;
    
    // Logic for Upcoming Event Box
    const allEvents = [...participatedEvents, ...hostedEvents];
    const upcomingEvent = allEvents
        .filter(e => new Date(e.date).getTime() > Date.now()) 
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]; 
    
    const UPCOMING_EVENT_DATA = upcomingEvent ? { 
        name: upcomingEvent.name, 
        date: new Date(upcomingEvent.date)
    } : undefined;


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Dashboard...</div>;
    }
    
    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <p className="text-red-400">Error: Profile data could not be loaded. Please log in again.</p>
        </div>
    );
    
    // --- RENDER LOGIC: POST EDIT MODE ---
    if (activePostMode === 'edit' && selectedPostId) {
        return (
            <div className="p-4 sm:p-6 lg:p-10 bg-gray-900 min-h-screen">
                <PostEditForm 
                    postId={selectedPostId} 
                    onCancel={handleBackToPostList} 
                    onPostUpdated={() => {
                        handleBackToPostList(); 
                        if (profile?.uuid) {
                            fetchHostedPosts(profile.uuid).then(setHostedPosts);
                        }
                    }}
                />
            </div>
        );
    }

    // --- RENDER LOGIC: EVENT EDIT MODE ---
    if (activeMode === 'edit' && selectedEventId) {
        return (
            <div className="p-4 sm:p-6 lg:p-10 bg-gray-900 min-h-screen">
                <EventEditForm 
                    eventId={selectedEventId} 
                    onCancel={handleBackToList} 
                    onEventUpdated={() => {
                        handleBackToList(); 
                        if (profile?.uuid) {
                            fetchHostedEvents(profile.uuid).then(setHostedEvents);
                        }
                    }}
                />
            </div>
        );
    }
    
    // --- RENDER LOGIC: EVENT REGISTRATIONS VIEW MODE ---
    if (activeMode === 'registrations' && selectedEventId) {
        return (
            <div className="p-4 sm:p-6 lg:p-10 bg-gray-900 min-h-screen">
                <EventRegistrationsView 
                    eventId={selectedEventId} 
                    onBack={handleBackToList}
                />
            </div>
        );
    }

    // Default 'list' mode rendering (activeMode === 'list' AND activePostMode === 'list')
    return (
        <div className="p-4 sm:p-6 lg:p-10 bg-gray-900 min-h-screen">
            <div className='flex items-center justify-between mb-8'>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">Dashboard</h1>
                
                <CreateEventButton 
                    organization={organization}
                    onClick={handleCreateEvent}
                />
            </div>
            
            <div className="grid grid-cols-12 gap-6 mb-8">
                
                {/* Profile Box (Left Column) */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-lg h-full">
                    <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">Profile</h2>
                    <div className="items-center space-x-4">
                        <div className="m-auto w-18 h-18 bg-green-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                            {profile.avatar_url ? (
                                <img 
                                    src={profile.avatar_url}
                                    alt="User Avatar"
                                    className="w-18 h-18 rounded-full object-cover border-2 border-green-400"
                                />  
                            ) : (
                                profile.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="min-w-0 mx-auto my-3 text-center flex flex-col items-center">
                            <p className="font-bold text-lg text-white truncate">{profile.name}</p>
                            <p className="text-sm text-gray-300 truncate">{profile.email}</p>
                        </div>

                    </div>
                </div>

                {/* Stats & Upcoming Event (Right Column Group) */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                           <EventStatsGrid 
                                participated={PARTICIPATED_COUNT}
                                hosted={HOSTED_EVENT_COUNT}
                                 
                            />
                            <div className="col-span-3 lg:col-span-4 pt-6">
                                <OrganizationBox /> 
                            </div>
                        </div>
                        <div className="col-span-1">
                            {UPCOMING_EVENT_DATA ? (
                                <UpcomingEventBox event={UPCOMING_EVENT_DATA} />
                            ) : (
                                <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-lg h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-sm">No upcoming events found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event & Post Lists Section (3-Column Layout on Large Screens) */}
            <div className="grid grid-cols-12 gap-6">
                
                {/* Participated Events List */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <ParticipatedEventsList 
                        events={participatedEvents as any} 
                        title="Events Participated" 
                        status='all'
                        is_paid=''
                    />
                </div>
                
                {/* Hosted Events List (Control Panel) */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <HostedEventsList 
                        events={hostedEvents} 
                        title="Events Hosted" 
                        onEditEvent={handleEditEvent}
                        onViewRegistrations={handleViewRegistrations}
                    />
                </div>
                
                {/* Hosted Posts List (Control Panel) */}
                {/* Note the use of col-span-12 for md to keep the first two side-by-side, 
                    and col-span-4 for lg to put all three side-by-side. */}
                {/* <div className="col-span-12 lg:col-span-4">
                    <HostedPostsList
                        posts={hostedPosts}
                        title="Your Blog Posts"
                        onDeletePost={handleDeletePost}
                    />

                </div> */}
            </div>
        </div>
    );
};

export default DashboardPage;