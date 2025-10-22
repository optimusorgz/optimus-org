import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface ShareAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

const ShareAccessModal: React.FC<ShareAccessModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Access for {eventTitle}</DialogTitle>
          <DialogDescription>
            This is a placeholder for the Share Access Modal. 
            It will allow you to share access to this event's check-in dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Event ID: {eventId}</p>
          <p>More functionality coming soon.</p>
        </div>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAccessModal;
