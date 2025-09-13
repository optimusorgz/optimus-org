import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share, Mail, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface ShareAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

const ShareAccessModal = ({ isOpen, onClose, eventId, eventTitle }: ShareAccessModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [expiryHours, setExpiryHours] = useState('24');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;

    setLoading(true);
    try {
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiryHours));

      // Generate token manually
      const token = crypto.randomUUID();

      // Create access record
      const { data, error } = await supabase
        .from('event_dashboard_access')
        .insert({
          event_id: eventId,
          granted_by: user.id,
          email: email.trim(),
          access_token: token,   // 👈 Added this
          expires_at: expiresAt.toISOString()
        })
        .select('access_token')
        .single();

      if (error) throw error;

      // Generate access link
      const accessLink = `${window.location.origin}/dashboard/events/${eventId}/checkin?token=${data.access_token}`;
      setGeneratedLink(accessLink);

      // Send email notification (you would implement this with your email service)
      try {
        await supabase.functions.invoke('send-dashboard-access-email', {
          body: {
            to: email.trim(),
            eventTitle,
            accessLink,
            expiresAt: expiresAt.toISOString(),
            grantedBy: user.user_metadata?.name || user.email
          }
        });

      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Access granted",
        description: `Dashboard access has been shared with ${email}`,
      });

      // Copy link to clipboard
      await navigator.clipboard.writeText(accessLink);
      toast({
        title: "Link copied",
        description: "Access link has been copied to clipboard",
      });

    } catch (error) {
      console.error('Error sharing access:', error);
      toast({
        title: "Error",
        description: "Failed to share dashboard access.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setExpiryHours('24');
    setGeneratedLink(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Dashboard Access
          </DialogTitle>
        </DialogHeader>

        {!generatedLink ? (
          <form onSubmit={handleShare} className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Grant temporary access to the check-in dashboard for <strong>{eventTitle}</strong>. 
                The recipient will be able to scan tickets and view registrations.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Access Duration (hours)</Label>
              <Input
                id="expiry"
                type="number"
                min="1"
                max="168"
                value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)}
                placeholder="24"
              />
              <p className="text-xs text-muted-foreground">
                Access will expire in {expiryHours} hours
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sharing..." : "Share Access"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Access link has been generated and copied to clipboard!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Access Link</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    toast({ title: "Copied!", description: "Link copied to clipboard" });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Link expires in {expiryHours} hours</p>
              <p>• Recipient can scan tickets and view registrations</p>
              <p>• No login required with this link</p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareAccessModal;