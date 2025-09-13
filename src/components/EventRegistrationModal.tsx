import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

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
  const navigate = useNavigate(); // Initialize useNavigate
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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

  // Remove handlePaytmPayment as it's no longer needed
  // const handlePaytmPayment = async () => {
  //   // ... existing code ...
  // };

  const createRegistration = async (razorpayPaymentDetails?: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      // Check if user is already registered for this event
      if (user) {
        const { data: existingRegistration } = await supabase
          .from("event_registrations")
          .select("id")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .single();

        if (existingRegistration) {
          toast({
            title: "Already Registered",
            description: "You are already registered for this event.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }
      
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const qrCodeData = ticketNumber;

      const { data: registration, error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          custom_answers: formData.customAnswers,
          ticket_code: ticketNumber,
        })

        .select()
        .single();

      if (error) throw error;

      // Generate digital ticket

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
        customAnswers: {} 
      });

      // Redirect to receipt page after successful payment and registration
      if (razorpayPaymentDetails) {
        const params = new URLSearchParams({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          amount: eventPrice.toString(),
          orderId: razorpayPaymentDetails.razorpay_order_id,
          paymentId: razorpayPaymentDetails.razorpay_payment_id,
          date: new Date().toISOString(),
        }).toString();
        navigate(`/receipt?${params}`);

        // Trigger email receipt
        await supabase.functions.invoke('send-email-receipt', {
          body: {
            to: formData.email,
            subject: `Receipt for ${eventTitle} Registration`,
            templateData: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              amount: eventPrice.toString(),
              orderId: razorpayPaymentDetails.razorpay_order_id,
              paymentId: razorpayPaymentDetails.razorpay_payment_id,
              date: new Date().toLocaleString(),
              eventTitle,
            },
          },
        });

      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Ensure loading is set to false even if registration fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (eventPrice > 0) {
        // Razorpay integration
        const { data, error } = await supabase.functions.invoke('create-order', {
          body: { amount: eventPrice * 100 }, // Amount in paisa
        });

        if (error) throw error;
        const { order_id, currency, amount } = data;

        const options: RazorpayOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay Key ID
          amount: amount.toString(),
          currency: currency,
          name: "Event Registration",
          description: `Registration for ${eventTitle}`,
          order_id: order_id,
          handler: async (response: any) => {
            // Verify payment on backend
            const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                formData: formData,
              },
            });

            if (verificationError) throw verificationError;

            if (verificationData.verified) {
              toast({
                title: "Payment Successful!",
                description: "Your payment has been successfully processed.",
              });
              await createRegistration({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            } else {
              toast({
                title: "Payment Verification Failed",
                description: "There was an issue verifying your payment. Please contact support.",
                variant: "destructive",
              });
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          notes: {
            address: "Event Registration",
          },
          theme: {
            color: "#3399CC",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
          toast({
            title: "Payment Failed",
            description: response.error.description,
            variant: "destructive",
          });
          console.error("Razorpay Error:", response.error);
          setLoading(false); // Reset loading on failure
        });
        rzp1.open();


      } else {
        await createRegistration();
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter your phone number"
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