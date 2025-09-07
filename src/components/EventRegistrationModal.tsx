import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventPrice?: number;
  customQuestions?: string[];
}

const EventRegistrationModal = ({ isOpen, onClose, eventId, eventTitle, eventPrice = 0, customQuestions = [] }: EventRegistrationModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    mobileNumber: "",
    registrationNumber: "",
    customAnswers: {} as Record<string, string>,
  });

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.user_metadata?.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user, isOpen]);

  const handlePaytmPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('paytm-generate-token', {
        body: {
          eventId,
          amount: eventPrice * 100, // Convert to paisa
          userInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.mobileNumber,
          },
        },
      });

      if (error) throw error;

      const { orderId, txnToken, amount } = data;

      // Mock Paytm payment success for demo
      toast({
        title: "Payment Simulation",
        description: "Payment successful! (Demo mode)",
      });

      // Create registration after successful payment
      await createRegistration();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Payment could not be processed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createRegistration = async () => {
    try {
      const { data: registration, error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          mobile_number: formData.mobileNumber,
          registration_number: formData.registrationNumber,
          custom_answers: formData.customAnswers,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate digital ticket
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const qrCodeData = JSON.stringify({
        userId: user?.id,
        eventId,
        registrationId: registration.id,
        ticketNumber,
      });

      const { error: ticketError } = await supabase
        .from("digital_tickets")
        .insert({
          user_id: user?.id,
          event_id: eventId,
          registration_id: registration.id,
          ticket_number: ticketNumber,
          qr_code_data: qrCodeData,
        });

      if (ticketError) console.error("Error creating ticket:", ticketError);

      toast({
        title: "Registration Successful!",
        description: `You are successfully registered for ${eventTitle}! Your digital ticket has been generated.`,
      });

      onClose();
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        mobileNumber: "", 
        registrationNumber: "", 
        customAnswers: {} 
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (eventPrice > 0) {
        await handlePaytmPayment();
      } else {
        await createRegistration();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('customAnswers.')) {
      const questionKey = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customAnswers: {
          ...prev.customAnswers,
          [questionKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter your phone number (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number *</Label>
            <Input
              id="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
              placeholder="Enter your mobile number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
              placeholder="Enter your registration number"
              required
            />
          </div>
          {customQuestions.map((question, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`custom-${index}`}>{question} *</Label>
              <Textarea
                id={`custom-${index}`}
                value={formData.customAnswers[`question-${index}`] || ""}
                onChange={(e) => handleInputChange(`customAnswers.question-${index}`, e.target.value)}
                placeholder="Enter your answer"
                required
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading 
                ? "Processing..." 
                : eventPrice > 0 
                  ? `Pay ₹${eventPrice} & Register` 
                  : "Register"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;