import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, DollarSign, Upload, ArrowLeft, Save, Building2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import OrganisationRegistrationModal from "@/components/organisation/OrganisationRegistrationModal";
import { useLocation, useParams } from "react-router-dom";

interface Organization {
  id: string;
  name: string; 
  description: string;
  status: string;
  created_at: string;
  owner_id: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location: string;
  contact_email: string;
  contact_phone: string | null;
  registration_link: string | null;
  ticket_price: number | null;
  max_participants: number | null;
  banner_url: string | null;
  created_by: string | null;
  organization_id: string;
}



const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const editingEvent = location.state?.eventData as Event | undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);

  // Event form data
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "",
    start_date: "",
    end_date: "",
    location: "",
    contact_email: "",
    contact_phone: "",
    registration_link: "",
    ticket_price: "",
    max_participants: "",
    banner: null as File | null,
  });

  useEffect(() => {
    if (editingEvent) {
      setIsEditing(true);
      setEventData({
        title: editingEvent.title,
        description: editingEvent.description,
        category: editingEvent.category,
        start_date: editingEvent.start_date.slice(0, 16),
        end_date: editingEvent.end_date?.slice(0, 16) || "",
        location: editingEvent.location,
        contact_email: editingEvent.contact_email,
        contact_phone: editingEvent.contact_phone || "",
        registration_link: editingEvent.registration_link || "",
        ticket_price: editingEvent.ticket_price?.toString() || "",
        max_participants: editingEvent.max_participants?.toString() || "",
        banner: null,
      });
      setBannerPreview(editingEvent.banner_url);
    }
  }, [editingEvent]);

  // Organization form data
  const [orgData, setOrgData] = useState({
    name: "",
    description: "",
  });

  const categories = [
    "Workshop",
    "Seminar",
    "Hackathon",
    "Tech Talk",
    "Competition",
    "Bootcamp",
    "Conference",
    "Networking",
    "Cultural",
  ];

  // Check user's organization status on component mount
  useEffect(() => {
    const checkOrganization = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id);

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        setOrganization(data?.[0] || null); // Assuming only one organization per user for now
        setLoadingOrg(false);
      } catch (error) {
        console.error('Error checking organization:', error);
        setLoadingOrg(false);
      }
    };

    checkOrganization();
  }, [user, navigate]);

  const handleEventInputChange = (field: string, value: string) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrgInputChange = (field: string, value: string) => {
    setOrgData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventData((prev) => ({ ...prev, banner: file }));
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          description: orgData.description,
          owner_id: user?.id,
          status: 'pending', // Default to pending status
        })
        .select()
        .single();

      if (error) throw error;

      setOrganization(data);
      toast({
        title: "Organization Registered!",
        description: "You can now create events.",
      });
    } catch (error) {
      console.error("Error creating organization:", error);
      toast({
        title: "Error",
        description: "Failed to register organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!organization) {
        toast({
          title: "No Organization Found",
          description: "You must register an organization first.",
          variant: "destructive",
        });
        return;
      }

      let banner_url = editingEvent?.banner_url || null;
      if (eventData.banner) {
        const fileExt = eventData.banner.name.split(".").pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("event-banners")
          .upload(fileName, eventData.banner);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("event-banners")
          .getPublicUrl(fileName);

        banner_url = data.publicUrl;
      }

      const commonData = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        start_date: eventData.start_date,
        end_date: eventData.end_date || eventData.start_date,
        location: eventData.location,
        organizer_name: organization.name,
        contact_email: eventData.contact_email,
        contact_phone: eventData.contact_phone,
        registration_link: eventData.registration_link,
        ticket_price: eventData.ticket_price ? parseFloat(eventData.ticket_price) : null,
        max_participants: eventData.max_participants ? parseInt(eventData.max_participants) : null,
        banner_url,
      };

      if (isEditing && editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(commonData)
          .eq("id", editingEvent.id);

        if (error) throw error;

        toast({
          title: "Event Updated!",
          description: "Your event has been successfully updated.",
        });
      } else {
        const { error } = await supabase.from("events").insert({
          ...commonData,
          organization_id: organization.id,
          created_by: user?.id,
          status: "pending", 
        });

        if (error) throw error;

        toast({
          title: "Event Submitted!",
          description: "Your event request has been submitted. Please wait for admin approval.",
        });
      }

      navigate("/dashboard"); // Navigate to dashboard after submission/update
    } catch (error) {
      console.error("Error submitting event:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} event. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loadingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // No organization - show registration form
  if (!organization && !isEditing) { // Only show org registration if not editing an event
    return (
      <div className="min-h-screen pt-6 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/events")}
              className="btn-outline-hero"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-glow">Register Organisation</h1>
              <p className="text-muted-foreground">Register your organisation to create events</p>
            </div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Alert className="mb-6">
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                You need to register an organisation before creating events. Once registered, your organisation will be reviewed by our admin team.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button 
                onClick={() => setShowOrgModal(true)}
                className="btn-hero"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Register Organisation
              </Button>
            </div>
          </motion.div>

          <OrganisationRegistrationModal
            isOpen={showOrgModal}
            onClose={() => setShowOrgModal(false)}
            onSuccess={(org) => {
              setOrganization(org);
              setShowOrgModal(false);
            }}
          />
        </div>
      </div>
    );
  }

  // Organization approved - show event creation form
  return (
    <div className="min-h-screen pt-6 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="btn-outline-hero"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-glow">{isEditing ? "Edit Event" : "Create New Event"}</h1>
            <p className="text-muted-foreground">{isEditing ? "Update your event details" : "Fill in the details to create your event"}</p>
          </div>
        </motion.div>

        {organization && organization.status === "pending" && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your organisation <strong>{organization.name}</strong> is pending approval. You can create/edit events, but they will only be visible once your organisation is approved.
            </AlertDescription>
          </Alert>
        )}
        {organization && organization.status === "approved" && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Creating event for organisation: <strong>{organization.name}</strong>
            </AlertDescription>
          </Alert>
        )}
        
        <motion.form
          onSubmit={handleEventSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Banner Upload */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" /> Event Banner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors relative">
                  {bannerPreview ? (
                    <div className="relative">
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-48 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setBannerPreview(null);
                          setEventData((prev) => ({ ...prev, banner: null }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Upload event banner</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Basic Information */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input 
                    id="title" 
                    value={eventData.title} 
                    onChange={(e) => handleEventInputChange("title", e.target.value)} 
                    placeholder="Enter event title"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    value={eventData.description} 
                    onChange={(e) => handleEventInputChange("description", e.target.value)} 
                    placeholder="Describe your event..."
                    rows={4} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={eventData.category} onValueChange={(value) => handleEventInputChange("category", value)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Date & Time */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Date & Time</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input 
                    type="datetime-local" 
                    value={eventData.start_date} 
                    onChange={(e) => handleEventInputChange("start_date", e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="datetime-local" 
                    value={eventData.end_date} 
                    onChange={(e) => handleEventInputChange("end_date", e.target.value)} 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location & Contact */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Location & Contact</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input 
                    value={eventData.location} 
                    onChange={(e) => handleEventInputChange("location", e.target.value)} 
                    placeholder="Event location"
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Contact Email *</Label>
                    <Input 
                      type="email"
                      value={eventData.contact_email} 
                      onChange={(e) => handleEventInputChange("contact_email", e.target.value)} 
                      placeholder="contact@email.com"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input 
                      type="tel"
                      value={eventData.contact_phone} 
                      onChange={(e) => handleEventInputChange("contact_phone", e.target.value)} 
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Registration Link</Label>
                  <Input 
                    type="url"
                    value={eventData.registration_link} 
                    onChange={(e) => handleEventInputChange("registration_link", e.target.value)} 
                    placeholder="https://registration-link.com"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing & Capacity */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Pricing & Capacity</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Ticket Price</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={eventData.ticket_price} 
                    onChange={(e) => handleEventInputChange("ticket_price", e.target.value)} 
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Participants</Label>
                  <Input 
                    type="number"
                    value={eventData.max_participants} 
                    onChange={(e) => handleEventInputChange("max_participants", e.target.value)} 
                    placeholder="100"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (isEditing ? "Updating..." : "Submitting...") : (isEditing ? "Update Event" : "Create Event")}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateEvent;
