import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Building,
  Calendar,
  Download,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  UserPlus,
  UserMinus,
  User,
  MessageSquare,
  Edit,
  Trash,
  ImagePlus,
  ImageMinus,
  Image,
  Filter,
  PowerOff,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import EventRegistrationsModal from "@/components/EventRegistrationsModal";

interface UserProfile {
  id: string;
  name: string;
  role: string;
  user_id: string;
  created_at: string;
  email?: string;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
  status: string;
  owner_id: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  status: string;
  created_by: string;
  created_at: string;
  start_date: string;
  organizer_name: string;
  organization_id: string;
  organization?: { name: string };
  category: string;
  end_date: string;
  location: string;
  contact_email: string;
  contact_phone?: string;
  max_participants?: number;
  registration_link?: string;
  ticket_price?: number;
  banner_url?: string;
  description: string;
}

interface EventRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  event_id: string;
  event?: { title: string };
}

interface OptimusApplication {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  registration_number: string;
  branch: string;
  course_year: string;
  areas_of_interest: string[];
  participated_before: boolean;
  action: string;
  created_at: string;
  date_of_birth: string;
  gender?: string;
  residence: string;
  motivation: string;
  whatsapp_number?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recruitment");
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [optimusApplications, setOptimusApplications] = useState<OptimusApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<OptimusApplication[]>([]);
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<EventRegistration[]>([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  
  // Filter states
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  // Modals
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<OptimusApplication | null>(null);

  useEffect(() => {
    if (!authLoading) {
      checkAdminAccess();
    }
  }, [user, userRole, authLoading]);

  useEffect(() => {
    filterApplications();
  }, [optimusApplications, dateFilter, statusFilter, branchFilter]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole !== "organiser") {
      toast({
        title: "Access Denied",
        description: "You don't have organiser privileges.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    try {
      await Promise.all([
        fetchUserProfiles(),
        fetchOrganizations(),
        fetchEvents(),
        fetchOptimusApplications(),
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role, user_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user profiles:", error);
      return;
    }
    setUserProfiles(data || []);
  };

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching organizations:", error.message);
    } else {
      setOrganizations(data || []);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, category, start_date, end_date, location, organizer_name, status, created_at, created_by, description, banner_url, contact_email, contact_phone, max_participants, ticket_price, organization_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }
    setEvents((data as Event[]) || []);
  };

  const fetchOptimusApplications = async () => {
    const { data, error } = await supabase
      .from("optimus_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching optimus applications:", error);
      return;
    }
    setOptimusApplications((data as OptimusApplication[]) || []);
  };

  const filterApplications = () => {
    let filtered = [...optimusApplications];

    // Date filter
    if (dateFilter.start && dateFilter.end) {
      const startDate = new Date(dateFilter.start);
      const endDate = new Date(dateFilter.end);
      filtered = filtered.filter(app => {
        const appDate = new Date(app.created_at);
        return appDate >= startDate && appDate <= endDate;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.action === statusFilter);
    }

    // Branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter(app => app.branch === branchFilter);
    }

    setFilteredApplications(filtered);
  };

  const fetchEventRegistrations = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          name,
          email,
          phone,
          created_at,
          event_id,
          events (title)
        `)
        .eq("event_id", eventId);

      if (error) throw error;
      setSelectedEventRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      toast({
        title: "Error",
        description: "Failed to load event registrations.",
        variant: "destructive",
      });
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("optimus_applications")
        .update({ action: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application status updated successfully.",
      });
      fetchOptimusApplications();
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      fetchUserProfiles();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const updateOrganizationStatus = async (orgId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ status })
        .eq("id", orgId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Organization ${status}`,
      });
      fetchOrganizations();
    } catch (error) {
      console.error("Error updating organization status:", error);
      toast({
        title: "Error",
        description: "Failed to update organization status",
        variant: "destructive",
      });
    }
  };

  const updateEventStatus = async (eventId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ status })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Event ${status}`,
      });
      fetchEvents();
    } catch (error) {
      console.error("Error updating event status:", error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
    }
  };

  const downloadExcel = async (tableName: string) => {
    try {
      let data;
      let fileName = `${tableName}.xlsx`;

      switch (tableName) {
        case "optimus_applications":
          data = filteredApplications.map(app => ({
            Name: app.full_name,
            Email: app.email,
            Phone: app.phone_number,
            Registration_Number: app.registration_number,
            Branch: app.branch,
            Course_Year: app.course_year,
            Areas_of_Interest: app.areas_of_interest?.join(", ") || "",
            Participated_Before: app.participated_before ? "Yes" : "No",
            Status: app.action,
            Created_At: new Date(app.created_at).toLocaleDateString(),
          }));
          fileName = "recruitment_applications.xlsx";
          break;
        case "organizations":
          data = organizations.map(org => ({
            Name: org.name,
            Status: org.status,
            Created_At: new Date(org.created_at).toLocaleDateString(),
          }));
          break;
        case "events":
          data = events.map(event => ({
            Title: event.title,
            Category: event.category,
            Status: event.status,
            Organizer: event.organizer_name,
            Location: event.location,
            Start_Date: new Date(event.start_date).toLocaleDateString(),
            End_Date: new Date(event.end_date).toLocaleDateString(),
          }));
          break;
        case "profiles":
          data = userProfiles.map(profile => ({
            Name: profile.name,
            Role: profile.role,
            Email: profile.email || "N/A",
            Created_At: new Date(profile.created_at).toLocaleDateString(),
          }));
          break;
        default:
          throw new Error("Invalid table name");
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Download Complete",
        description: `${tableName} data downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error downloading data:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download data.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Existing Member":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Recently Added":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Discontinued":
        return "bg-red-100 text-red-800 border-red-200";
      case "Shadow Member":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };


  const viewEventRegistrations = (eventId: string, eventTitle: string) => {
    setSelectedEventId(eventId);
    setSelectedEventTitle(eventTitle);
    setShowRegistrations(true);
    fetchEventRegistrations(eventId);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your organization's data and settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "recruitment", label: "Recruitment Management", icon: Users },
            { id: "organizations", label: "Organizations", icon: Building },
            { id: "events", label: "Events", icon: Calendar },
            { id: "users", label: "User Management", icon: Shield },
            { id: "downloads", label: "Download Data", icon: Download },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "outline"}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Recruitment Management Tab */}
        {activeTab === "recruitment" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Join Management Box */}
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Join Management
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <Button onClick={() => downloadExcel("optimus_applications")} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Sheet
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Status Filter</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Existing Member">Existing Member</SelectItem>
                        <SelectItem value="Recently Added">Recently Added</SelectItem>
                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                        <SelectItem value="Shadow Member">Shadow Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="branch-filter">Branch Filter</Label>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {Array.from(new Set(optimusApplications.map(app => app.branch))).map(branch => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Applications Table */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id} className="rounded-md border overflow-hidden">
                          <TableCell className="font-medium">{application.full_name}</TableCell>
                          <TableCell>{application.email}</TableCell>
                          <TableCell>{application.branch}</TableCell>
                          <TableCell>{application.course_year}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(application.action)}>
                              {application.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowChangeStatusModal(true);
                              }}
                            >
                              Update Status
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Organizations Tab */}
        {activeTab === "organizations" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organizations Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>
                          <Badge variant={org.status === "approved" ? "default" : "secondary"}>
                            {org.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-2">
                          {org.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateOrganizationStatus(org.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateOrganizationStatus(org.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.category}</TableCell>
                        <TableCell>
                          <Badge variant={event.status === "approved" ? "default" : "secondary"}>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.organizer_name}</TableCell>
                        <TableCell>{new Date(event.start_date).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewEventRegistrations(event.id, event.title)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Registrations
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/check-in/${event.id}`)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Check In
                          </Button>
                          {event.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateEventStatus(event.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateEventStatus(event.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.name}</TableCell>
                        <TableCell>{profile.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={profile.role === "organiser" ? "default" : "secondary"}>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-2">
                          {profile.role === "user" ? (
                            <Button
                              size="sm"
                              onClick={() => updateUserRole(profile.user_id, "organiser")}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Make Admin
                            </Button>
                          ) : profile.role === "organiser" && profile.user_id !== user?.id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(profile.user_id, "user")}
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Remove Admin
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "optimus_applications", title: "Recruitment Applications", description: "Download all recruitment applications" },
                    { name: "organizations", title: "Organizations", description: "Download all organizations data" },
                    { name: "events", title: "Events", description: "Download all events data" },
                    { name: "profiles", title: "User Profiles", description: "Download all user profiles" },
                  ].map((table) => (
                    <Card key={table.name} className="p-4">
                      <h3 className="font-semibold mb-2">{table.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{table.description}</p>
                      <Button onClick={() => downloadExcel(table.name)} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel
                      </Button>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Change Status Modal */}
      <Dialog open={showChangeStatusModal} onOpenChange={setShowChangeStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change the recruitment status for {selectedApplication?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status-select">New Status</Label>
              <Select
                defaultValue={selectedApplication?.action}
                onValueChange={(value) => {
                  if (selectedApplication) {
                    updateApplicationStatus(selectedApplication.id, value);
                    setShowChangeStatusModal(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Existing Member">Existing Member</SelectItem>
                  <SelectItem value="Recently Added">Recently Added</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                  <SelectItem value="Shadow Member">Shadow Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Registrations Modal */}
      <EventRegistrationsModal
        isOpen={showRegistrations}
        onClose={() => setShowRegistrations(false)}
        eventId={selectedEventId}
        registrations={selectedEventRegistrations}
        loading={loading}
        fetchRegistrations={() => fetchEventRegistrations(selectedEventId)}
        eventTitle={selectedEventTitle}
      />
    </div>
  );
};

export default AdminDashboard;