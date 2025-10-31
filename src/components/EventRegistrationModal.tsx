import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom"; 
import axios from 'axios'; // ⬅️ Using axios for communication with the Express backend

// --- TYPE DECLARATIONS ---

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
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

// --- MAIN COMPONENT ---

const EventRegistrationModal = ({ isOpen, onClose, eventId, eventTitle, eventPrice = 0, customQuestions = [] }: EventRegistrationModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  /**
   * Securely saves registration data to Supabase ONLY after payment is verified.
   * @param finalData The combined user and payment details.
   */
  const sendToSupabase = async (finalData: any) => {
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const qrCodeData = ticketNumber;

      const registrationPayload = {
          event_id: finalData.event_id,
          user_id: user?.id || null, // Keep user ID if logged in
          name: finalData.name,
          email: finalData.email,
          phone: finalData.phone || null,
          custom_answers: finalData.customAnswers,
          ticket_code: ticketNumber,
          // Payment details stored for audit
          razorpay_order_id: finalData.razorpay_order_id,
          razorpay_payment_id: finalData.razorpay_payment_id,
      };

      const { data: registration, error } = await supabase
          .from("event_registrations")
          .insert(registrationPayload)
          .select()
          .single();

      if (error) throw error;
      
      // Generate digital ticket (optional but good practice)
      const { error: ticketError } = await supabase
        .from("digital_tickets")
        .insert({
          user_id: user?.id,
          event_id: finalData.event_id,
          registration_id: registration.id,
          ticket_number: ticketNumber,
          qr_code_data: qrCodeData,
        });

      if (ticketError) console.error("Error creating ticket:", ticketError);
      
      return registration;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const registrationData = {
        ...formData,
        event_id: eventId,
        amount: eventPrice, // Amount in Rupees
    };
    
    // Check if the event is free or paid
    if (eventPrice <= 0) {
        // --- FREE REGISTRATION FLOW ---
        try {
            // Note: Since no payment occurred, we pass null for payment IDs
            await sendToSupabase({ ...registrationData, razorpay_order_id: null, razorpay_payment_id: null });
            
            toast({ title: "Registration Successful!", description: `You are successfully registered for ${eventTitle}!` });
            onClose();
        } catch (error) {
            console.error("Free Registration error:", error);
            toast({ title: "Registration Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
        return;
    }
    
    // --- PAID REGISTRATION FLOW ---
    try {
        // 1. CALL NODE.JS SERVER to create Razorpay Order
        const { data: orderData } = await axios.post('http://localhost:3000/api/create-order', {
            amount: registrationData.amount, // In Rupees, server converts to paise
            eventTitle: eventTitle,
        });

        const options: RazorpayOptions = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Frontend key
            amount: orderData.amount.toString(), // Amount in paise from server
            currency: orderData.currency,
            name: "Event Registration",
            description: `Registration for ${eventTitle}`,
            order_id: orderData.order_id,
            
            // 2. The critical payment handler logic
            handler: async (response: any) => {
                setLoading(true); // Re-set loading for verification phase
                try {
                    // Send order/payment details to Node.js server for **SECURE VERIFICATION**
                    const { data: verificationData } = await axios.post('http://localhost:3000/api/verify-payment', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    if (!verificationData.verified) {
                        throw new Error("Payment signature verification failed.");
                    }

                    // 3. VERIFICATION SUCCESS: Now send the combined data to Supabase
                    const finalDataForSupabase = {
                        ...registrationData, 
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                    };
                    
                    await sendToSupabase(finalDataForSupabase); // Insert into Supabase

                    toast({ title: "Payment Successful!", description: "Your payment has been successfully processed and registration is complete." });
                    onClose();

                    // 4. REDIRECT to Receipt Page, passing essential data
                    const params = new URLSearchParams({
                        name: finalDataForSupabase.name,
                        email: finalDataForSupabase.email,
                        amount: finalDataForSupabase.amount.toString(), // Amount in Rupees
                        orderId: finalDataForSupabase.razorpay_order_id,
                        paymentId: finalDataForSupabase.razorpay_payment_id,
                        date: new Date().toISOString(),
                    }).toString();
                    
                    navigate(`/receipt?${params}`);

                } catch (handlerError) {
                    console.error("Verification/Registration Error:", handlerError);
                    toast({
                        title: "Registration Failed",
                        description: "Payment succeeded but registration failed to save. Please contact support.",
                        variant: "destructive",
                    });
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone,
            },
            notes: {
                address: "Optimus Club Event", // You can customize this value
            },
            theme: {
                color: "#3399CC",
            },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
          toast({
            title: "Payment Failed",
            description: response.error.description || "The payment window was closed or cancelled.",
            variant: "destructive",
          });
          setLoading(false); // Reset loading on failure
        });
        rzp1.open();

    } catch (error) {
        console.error("Submission error:", error);
        toast({
            title: "Registration Failed",
            description: "Could not initiate payment. Check your network or server connection.",
            variant: "destructive",
        });
        setLoading(false); // Reset loading if error occurs BEFORE Razorpay window opens
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
          <DialogTitle>Register for {eventTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Fields (Name, Email, Phone) */}
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
          
          {/* Custom Questions */}
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading 
                ? "Processing..." 
                : eventPrice > 0 
                  ? `Pay ₹${eventPrice} & Register` 
                  : "Register (Free)"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;