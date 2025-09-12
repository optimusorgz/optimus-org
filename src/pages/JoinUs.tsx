import { useState, useEffect } from "react";
import { User, Phone, Mail, Calendar, MapPin, GraduationCap, Heart, Power, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";

const JoinUs = () => {
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [recruitmentActive, setRecruitmentActive] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    whatsapp: "",
    email: "",
    phone: "",
    branch: "",
    dob: "",
    gender: "",
    residence: "",
    courseYear: "",
    domains: [] as string[],
    lpuParticipation: "",
    motivation: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkRecruitmentStatus();
  }, []);

  const checkRecruitmentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("optimus_applications")
        .select("is_active, id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking recruitment status:", error);
        throw error;
      }

      setRecruitmentActive(data?.is_active ?? true);
    } catch (error) {
      console.error("Error checking recruitment status:", error);
      // Default to active if we can't check status
      setRecruitmentActive(true);
    } finally {
      setCheckingStatus(false);
    }
  };

  const toggleRecruitment = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("optimus_applications")
        .update({ is_active: !recruitmentActive })
        .gte('created_at', '2020-01-01'); // Update all records (safer than neq with dummy id)

      if (error) throw error;

      setRecruitmentActive(!recruitmentActive);
      toast({
        title: recruitmentActive ? "Recruitment Closed" : "Recruitment Opened",
        description: `Recruitment has been ${recruitmentActive ? 'deactivated' : 'activated'} successfully.`,
      });
    } catch (error) {
      console.error("Error toggling recruitment:", error);
      toast({
        title: "Error",
        description: "Failed to update recruitment status.",
        variant: "destructive",
      });
    }
  };

  const domains = [
    "Graphic Designing & Video Editing",
    "Social Media", 
    "Content Writing",
    "Technical team",
    "Event Management",
    "Marketing & PR",
    "Public Speaking",
    "Aerospace",
    "Photography",
    "Human Resources",
    "Public Relations"
  ];

  const branches = [
    "B Tech",
    "B.Sc",
    "BBA",
    "BA",
    "BCA",
    "LLB",
    "B.Ed",
    "B.Arch",
    "B.Des",
    "B.Pharm",
    "BHMCT",
    "BFA",
    "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDomainChange = (domain: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      domains: checked 
        ? [...prev.domains, domain]
        : prev.domains.filter(d => d !== domain)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check for duplicate registration first
      const { data: existingApplication } = await supabase
        .from("optimus_applications")
        .select("id")
        .eq("registration_number", formData.regNo)
        .single();

      if (existingApplication) {
        toast({
          title: "Already Registered",
          description: "You are already registered with this registration number.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("optimus_applications").insert({
        full_name: formData.name,
        registration_number: formData.regNo,
        email: formData.email,
        phone_number: formData.phone,
        whatsapp_number: formData.whatsapp,
        date_of_birth: formData.dob,
        gender: formData.gender,
        residence: formData.residence,
        branch: formData.branch,
        course_year: formData.courseYear,
        areas_of_interest: formData.domains,
        participated_before: formData.lpuParticipation === "yes",
        motivation: formData.motivation
      });
      
      if (error) throw error;
      
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in joining Optimus. We'll review your application and get back to you soon.",
      });
      
      // Reset form
      setFormData({
        name: "",
        regNo: "",
        whatsapp: "",
        email: "",
        phone: "",
        branch: "",
        dob: "",
        gender: "",
        residence: "",
        courseYear: "",
        domains: [],
        lpuParticipation: "",
        motivation: ""
      });
    } catch (error: any) {
      console.error("Application submission error:", error);
      
      // Handle duplicate registration number error
      if (error.code === '23505' || error.message?.includes('registration_number')) {
        toast({
          title: "Already Registered",
          description: "You are already registered with this registration number.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen pt-6 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Recruitment Toggle Button - Only for Organisers */}
        {userRole === 'organiser' && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={toggleRecruitment}
              variant={recruitmentActive ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {recruitmentActive ? (
                <>
                  <PowerOff className="h-4 w-4" />
                  Turn Off Recruitment
                </>
              ) : (
                <>
                  <Power className="h-4 w-4" />
                  Turn On Recruitment
                </>
              )}
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <h1 className="text-2xl md:text-4xl font-bold text-glow mb-6">
            Join <span className="text-primary">Optimus</span>
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to be part of something extraordinary? Join our community of passionate 
            tech enthusiasts and start your journey toward innovation and excellence.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          {/* First row - two boxes side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <Card className="card-modern text-center fade-up hover-scale">
              <CardContent className="p-4 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full mb-3 md:mb-4">
                  <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">Skill Development</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Access to cutting-edge workshops and hands-on learning experiences</p>
              </CardContent>
            </Card>

            <Card className="card-modern text-center fade-up hover-scale" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-4 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full mb-3 md:mb-4">
                  <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">Networking</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Connect with like-minded peers and industry professionals</p>
              </CardContent>
            </Card>
          </div>

          {/* Second row - one box full width */}
          <div className="grid grid-cols-1">
            <Card className="card-modern text-center fade-up hover-scale" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-4 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full mb-3 md:mb-4">
                  <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">Innovation</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Work on real projects and contribute to meaningful solutions</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Form or Closed Message */}
        {!recruitmentActive ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="card-modern fade-up">
              <CardContent className="p-6 md:p-12 text-center">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 md:p-8 backdrop-blur-sm">
                  <PowerOff className="h-12 w-12 md:h-16 md:w-16 text-destructive mx-auto mb-4" />
                  <h2 className="text-xl md:text-2xl font-bold text-destructive mb-2">
                    Recruitment is Currently Closed
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    We're not accepting new applications at this time. 
                    Please check back later for updates on when recruitment reopens.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="card-modern fade-up">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-center">Membership Application</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-primary">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="regNo">Registration Number *</Label>
                      <Input
                        id="regNo"
                        placeholder="Enter registration number"
                        className="bg-muted/20 border-border/50 focus:border-primary"
                        value={formData.regNo}
                        onChange={(e) => handleInputChange("regNo", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter phone number"
                          className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="Enter WhatsApp number"
                        className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="dob"
                          type="date"
                          className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                          value={formData.dob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <RadioGroup 
                        value={formData.gender} 
                        onValueChange={(value) => handleInputChange("gender", value)}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Male" id="Male" />
                          <Label htmlFor="Male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Female" id="Female" />
                          <Label htmlFor="Female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Other" id="Other" />
                          <Label htmlFor="Other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="residence">Residence *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="residence"
                          placeholder="Day Scholar /Hostel (Mention hostel)"
                          className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                          value={formData.residence}
                          onChange={(e) => handleInputChange("residence", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-primary">Academic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch/Department *</Label>
                      <Select value={formData.branch} onValueChange={(value) => handleInputChange("branch", value)}>
                        <SelectTrigger className="bg-muted/20 border-border/50 focus:border-primary">
                          <SelectValue placeholder="Select your branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="courseYear">Course Year *</Label>
                      <Select value={formData.courseYear} onValueChange={(value) => handleInputChange("courseYear", value)}>
                        <SelectTrigger className="bg-muted/20 border-border/50 focus:border-primary">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                          <SelectItem value="Final Year">Final Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Interests & Experience */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-primary">Areas of Interest</h3>
                  
                  <div className="space-y-2">
                    <Label>Select your areas of interest (multiple allowed) *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                      {domains.map((domain) => (
                        <div key={domain} className="flex items-center space-x-2">
                          <Checkbox
                            id={domain}
                            checked={formData.domains.includes(domain)}
                            onCheckedChange={(checked) => handleDomainChange(domain, !!checked)}
                          />
                          <Label htmlFor={domain} className="text-sm cursor-pointer">
                            {domain}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Have you participated in LPU events before? *</Label>
                    <RadioGroup 
                      value={formData.lpuParticipation} 
                      onValueChange={(value) => handleInputChange("lpuParticipation", value)}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivation">Why do you want to join Optimus? *</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Share your motivation for joining our community..."
                      className="bg-muted/20 border-border/50 focus:border-primary min-h-[120px] resize-none"
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-hero text-base md:text-lg py-3 md:py-4"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JoinUs;