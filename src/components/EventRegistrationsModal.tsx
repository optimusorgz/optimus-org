import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface EventRegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  registrations: any[];
  loading: boolean;
  fetchRegistrations: () => void;
  eventTitle: string;
}

const EventRegistrationsModal: React.FC<EventRegistrationsModalProps> = ({
  isOpen,
  onClose,
  eventId,
  registrations,
  loading,
  fetchRegistrations,
  eventTitle
}) => {
  useEffect(() => {
    if (isOpen && eventId) {
      fetchRegistrations();
    }
  }, [isOpen, eventId, fetchRegistrations]);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const { toast } = useToast();

  const downloadRegistrationsExcel = () => {
    try {
      const formattedRegistrations = registrations.map(reg => ({
        Name: reg.profiles?.name || "N/A",
        Email: reg.profiles?.email || "N/A",
        Registered_At: new Date(reg.created_at).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedRegistrations);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Event Registrations");
      XLSX.writeFile(workbook, `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_registrations.xlsx`);
      
      toast({
        title: "Download Complete",
        description: "Event registrations downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading registrations:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download event registrations.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Event Registrations</DialogTitle>
            <DialogDescription>
              View the list of users registered for this event.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading registrations...</p>
            </div>
          ) : (
            <div className="py-4">
              <h3 className="text-lg font-semibold mb-2">Total Registrations: {registrations.length}</h3>
              {registrations.length === 0 ? (
                <p className="text-muted-foreground">No registrations yet for this event.</p>
              ) : (
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <div className="space-y-3">
                    {registrations.map((reg) => (
                      <div key={reg.id} className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={reg.profiles?.avatar_url} alt={reg.profiles?.name || reg.profiles?.email} />
                          <AvatarFallback>
                            {(reg.profiles?.name || reg.profiles?.email || "")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{reg.profiles?.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{reg.profiles?.email}</p>
                        </div>
                        <Badge variant="secondary">Registered</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {registrations.length > 0 && (
                <Button onClick={downloadRegistrationsExcel} className="w-full mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download Registrations Excel
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default EventRegistrationsModal;
