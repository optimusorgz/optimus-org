import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import EventHub from "./pages/EventHub";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Posts from "./pages/Posts";
import Gallery from "./pages/Gallery";
import Team from "./pages/Team";
import JoinUs from "./pages/JoinUs";
import Receipt from "./pages/Receipt";
import CheckInDashboard from "./pages/dashboard/events/CheckInDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="optimus-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col pb-16 md:pb-0">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/events" element={<EventHub />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  
                  <Route
                    path="/create-event"
                    element={
                      <ProtectedRoute>
                        <CreateEvent />
                      </ProtectedRoute>
                    }
                  />

                  {/* Edit Event */}
                  <Route
                    path="/edit-event/:id"
                    element={
                      <ProtectedRoute>
                        <CreateEvent />
                      </ProtectedRoute>
                    }
                  />

                  {/* Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Dashboard */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute roles={["organiser"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/posts" element={<Posts />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/join-us" element={<JoinUs />} />

                  {/* Scanners */}
                  <Route
                    path="/scanner/:eventId"
                    element={
                      <ProtectedRoute>
                        <CheckInDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/scanner/:eventId"
                    element={
                      <ProtectedRoute>
                        <CheckInDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Registrations */}
                  <Route
                    path="/dashboard/registrations/:eventId"
                    element={
                      <ProtectedRoute>
                        <CheckInDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Unified Check-in Dashboard */}
                  <Route
                    path="/dashboard/events/:eventId/checkin"
                    element={<CheckInDashboard />}
                  />

                  <Route path="/receipt" element={<Receipt />} />
                  <Route path="/check-in/:eventId" element={<CheckInDashboard />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <BottomNav />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
