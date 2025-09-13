import React, { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: { 
    name: string; 
    photo: string | null;
    phone_number: string | null;
    organisation: string | null;
  } | null;
  onUpdateProfile: (updatedProfile: {
    name: string;
    photo: string | null;
    phone_number: string | null;
  }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photo || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhoneNumber(profile.phone_number || "");
      setPhotoUrl(profile.photo || "");
    }
  }, [profile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      setPhotoFile(file);
      setPhotoUrl(URL.createObjectURL(file)); // Show preview
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return photoUrl;

    setIsUploading(true);
    try {
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${user.id}/profile.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Delete existing photo if any
      if (profile?.photo) {
        const oldPath = profile.photo.split('/').slice(-2).join('/');
        await supabase.storage
          .from("profile_photos")
          .remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("profile_photos")
        .upload(filePath, photoFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("profile_photos")
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile photo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      let newPhotoUrl = photoUrl;
      
      // Upload new photo if selected
      if (photoFile) {
        newPhotoUrl = await uploadPhoto();
        if (!newPhotoUrl) {
          return; // Upload failed
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          phone_number: phoneNumber.trim() || null,
          photo: newPhotoUrl || null,
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      onUpdateProfile({
        name: name.trim(),
        phone_number: phoneNumber.trim() || null,
        photo: newPhotoUrl || null,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoUrl || user?.user_metadata?.avatar_url} alt={name || user?.email} />
              <AvatarFallback className="text-4xl">
                {(name || user?.user_metadata?.name || user?.email || "")
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <Button asChild variant="outline" size="sm" disabled={isUploading}>
                <span>
                  {isUploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </span>
              </Button>
            </Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {/* Name Field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Enter your full name"
            />
          </div>

          {/* Phone Number Field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="col-span-3"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Email Field (Read-only) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="col-span-3"
            />
          </div>

          {/* Organisation Field (Read-only) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="organisation" className="text-right">
              Organisation
            </Label>
            <Input
              id="organisation"
              value={profile?.organisation || "Not registered"}
              disabled
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isUploading || isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;