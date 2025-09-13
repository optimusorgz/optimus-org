import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";

interface OrganisationRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (organisation: any) => void;
}

const OrganisationRegistrationModal: React.FC<OrganisationRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkNameAvailability = async (name: string) => {
    if (!name.trim()) {
      setNameAvailable(null);
      return;
    }

    setCheckingName(true);
    try {
      const { data, error } = await supabase.rpc('get_organization_by_name', {
        org_name: name.trim()
      });

      if (error) throw error;
      setNameAvailable(!data.exists);
    } catch (error) {
      console.error('Error checking name availability:', error);
      // Fallback to direct query if function doesn't exist
      try {
        const { data } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', name.trim())
          .single();
        
        setNameAvailable(!data);
      } catch {
        setNameAvailable(true); // Assume available if check fails
      }
    } finally {
      setCheckingName(false);
    }
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    
    // Debounce name checking
    const timeoutId = setTimeout(() => {
      checkNameAvailability(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register an organisation.",
        variant: "destructive",
      });
      return;
    }

    if (nameAvailable === false) {
      toast({
        title: "Name unavailable",
        description: "This organisation name is already taken.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user already has an organisation
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (existingOrg) {
        toast({
          title: "Organisation already registered",
          description: "You can only register one organisation per account.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          owner_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Name already taken",
            description: "This organisation name is already registered.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Organisation registered!",
        description: "Your organisation has been submitted for approval.",
      });

      onSuccess(data);
      onClose();
      
      // Reset form
      setFormData({ name: "", description: "" });
      setNameAvailable(null);
    } catch (error) {
      console.error('Error registering organisation:', error);
      toast({
        title: "Registration failed",
        description: "Failed to register organisation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Register Organisation
          </DialogTitle>
        </DialogHeader>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to register an organisation before creating events. 
            Your organisation will be reviewed by our admin team.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organisation Name *</Label>
            <Input
              id="org-name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter organisation name"
              required
            />
            {checkingName && (
              <p className="text-sm text-muted-foreground">Checking availability...</p>
            )}
            {nameAvailable === true && formData.name && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Name is available
              </p>
            )}
            {nameAvailable === false && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Name is already taken
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your organisation (optional)"
              rows={3}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens next?</strong>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Your organisation will be submitted for admin review</li>
                <li>• Approval typically takes 1-2 business days</li>
                <li>• Once approved, you can create and manage events</li>
                <li>• You'll receive a notification when approved</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || nameAvailable === false || !formData.name.trim()}
            >
              {isSubmitting ? "Registering..." : "Register Organisation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrganisationRegistrationModal;